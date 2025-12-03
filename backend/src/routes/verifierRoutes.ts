import express, {
    Router, Request, Response
} from 'express';
import crypto from 'crypto';
import type { CircuitContext } from '@midnight-ntwrk/compact-runtime';
import { emptyZswapLocalState } from '@midnight-ntwrk/compact-runtime';

import { uploadImageDocument } from '../config/multerConfig.js';
import { QRCodeService } from '../services/QRCodeService.js';

export const router: Router = express.Router();

router.post('/api/proof/verify-qr', uploadImageDocument.single('qrCode'), async (req, res) => {
    try {
        const { name, dob } = req.body;
        const qrCodeFile = req.file;

        if (!qrCodeFile) {
            return res.status(400).json({
                success: false,
                message: 'QR code image is required'
            });
        }

        if (!name || !dob) {
            return res.status(400).json({
                success: false,
                message: 'Name and date of birth are required'
            });
        }

        // 1. Decode QR code to get requestId and salt
        const { requestId: requestIdHex, salt: saltHex } = await QRCodeService.decodeVerificationQR(qrCodeFile.path);

        // 2. Convert hex strings to Uint8Array
        const requestId = new Uint8Array(Buffer.from(requestIdHex, 'hex'));
        const salt = new Uint8Array(Buffer.from(saltHex, 'hex'));

        // 3. Convert verifier's provided name and DOB to Uint8Array
        // IMPORTANT: These encodings MUST match exactly what the Compact contract's
        // identityFingerprint() function expects:
        // - name: sha256 hash as 32 bytes
        // - dob: UTF-8 encoded, padded to 32 bytes
        // If your Compact contract uses different encoding, update this accordingly
        const nameHash = crypto.createHash('sha256').update(name).digest();
        const nameBytes = new Uint8Array(nameHash);

        const dobBytes = new TextEncoder().encode(dob);
        let paddedDobBytes = dobBytes;
        if (dobBytes.length < 32) {
            paddedDobBytes = new Uint8Array(32);
            paddedDobBytes.set(dobBytes);
        } else if (dobBytes.length > 32) {
            return res.status(400).json({
                success: false,
                message: 'Date of birth is too long (must be 32 bytes or less)'
            });
        }

        // 4. Load contract and witnesses
        // @ts-ignore
        const { Contract, ledger } = await import('../../../contracts/managed/ep-contract/contract/index.cjs');
        // @ts-ignore
        const { witnesses } = await import('../../../contracts/dist/witnesses.js');


        // PRODUCTION: Replace with actual on-chain state from the indexer:
        //
        // import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-sdk';
        // const contractAddress = process.env.CONTRACT_ADDRESS;
        // const indexerUrl = process.env.INDEXER_URL || 'https://indexer.testnet-02.midnight.network/api/v1/graphql';
        // const indexerWsUrl = process.env.INDEXER_WS_URL || 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws';
        // const publicDataProvider = indexerPublicDataProvider({ indexerUrl, indexerWsUrl });
        // const onChainState = await publicDataProvider.queryContractState(contractAddress);
        //
        // Then adapt onChainState into proper ContractState/QueryContext format
        // instead of the hand-rolled mock below.

        // 5. DEVELOPMENT STUB: Create empty contract state
        // This will ALWAYS FAIL verification because the ledger is empty
        const emptyContractState = {
            data: { verifications: new Map() }
        };

        // 6. DEVELOPMENT STUB: Hand-roll QueryContext and CircuitContext
        // WARNING: This bypasses proper ContractState/QueryContext types with 'as any'
        // In production, use Midnight.js helpers to construct these properly
        const mockQueryContext = {
            state: emptyContractState.data,
            address: '00'.repeat(32),
            block: { height: 0n, time: BigInt(Date.now()) },
            comIndicies: new Map(),
            effects: {},
            query: (ops: any, costModel: any) => {
                return {
                    context: mockQueryContext,
                    events: [],
                    gasCost: 0n
                };
            }
        } as any;

        const dummyCoinPublicKey = '00'.repeat(64);

        const context: CircuitContext<any> = {
            originalState: emptyContractState as any,
            transactionContext: mockQueryContext,
            currentPrivateState: {} as any,
            currentZswapLocalState: emptyZswapLocalState(dummyCoinPublicKey),
        };

        // 7. Initialize contract with witnesses
        // Note: getVerifiedResult doesn't use witnesses, but Contract constructor requires it
        const contract = new Contract(witnesses);

        // 8. Call getVerifiedResult circuit (READ-ONLY ledger lookup)
        // This matches the generated wrapper API: circuits.getVerifiedResult(context, ...args)
        // Will fail in development because verifications ledger is empty
        const { result, context: newCtx, proofData } = contract.circuits.getVerifiedResult(
            context,
            requestId,
            nameBytes,
            paddedDobBytes
        );

        console.log('Verification result:', result);

        // 10. Return verification result
        res.json({
            success: true,
            message: 'Verification successful',
            verified: true,
            result: {
                identityHash: result.identityHash ? Buffer.from(result.identityHash).toString('hex') : undefined,
                provenLimit: result.provenLimit ? (Number(result.provenLimit) / 100).toFixed(2) : undefined,
                name,
                dob
            }
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : '';
        console.error('❌ Verification error:', errorMessage);
        console.error('Stack trace:', errorStack);

        // Ensure we always send JSON response
        if (!res.headersSent) {
            res.status(400).json({
                success: false,
                message: errorMessage || 'Verification failed',
                error: errorMessage
            });
        }
    }
});