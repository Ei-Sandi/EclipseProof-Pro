import * as crypto from 'crypto';
import type { CircuitContext } from '@midnight-ntwrk/compact-runtime';
import { constructorContext, QueryContext, dummyContractAddress, StateValue } from '@midnight-ntwrk/compact-runtime';
import { parseCoinPublicKeyToHex } from '@midnight-ntwrk/midnight-js-utils';
import { NetworkId } from '@midnight-ntwrk/zswap';
import type { User } from './User.js';

export interface ProofGenerationParams {
    idDOB: Uint8Array;
    employeeName: string;
    netPay: number;
    amountToProve: number;
    user: User;
}

export interface ProofGenerationResult {
    success: boolean;
    verificationHash?: Uint8Array;
    proofData?: any;
    context?: CircuitContext<any>;
    randomness?: Uint8Array;
    proofGeneratedDate?: bigint;
    error?: string;
}

export class VerificationProof {

    async generateVerificationProof(params: ProofGenerationParams): Promise<ProofGenerationResult> {
        try {
            const { idDOB, employeeName, netPay, amountToProve, user } = params;

            // Ensure idDOB is exactly 32 bytes (pad with zeros if needed)
            let paddedIdDOB = idDOB;
            if (idDOB.length < 32) {
                paddedIdDOB = new Uint8Array(32);
                paddedIdDOB.set(idDOB);
            } else if (idDOB.length > 32) {
                throw new Error(`idDOB is too long: ${idDOB.length} bytes (expected 32)`);
            }

            // Ensure user has a wallet
            if (!user.wallet) {
                throw new Error('User wallet not initialized. Please ensure wallet is set up.');
            }

            // @ts-ignore - Contract module is compiled JavaScript without type definitions in dist
            const { Contract } = await import('../../../contracts/managed/ep-contract/contract/index.cjs');
            // @ts-ignore
            const { witnesses, createPaySlipPrivateState } = await import('../../../contracts/dist/witnesses.js');

            // Convert employee name to bigint (hash it for consistent representation)
            const nameHash = crypto.createHash('sha256').update(employeeName).digest();
            const payslipNameBigInt = BigInt('0x' + nameHash.toString('hex'));

            // Convert amounts to bigint (multiply by 100 to preserve 2 decimal places)
            // Pad to 64 hex chars (32 bytes) for Bytes<32> type
            const netPayHex = Math.round(netPay * 100).toString(16).padStart(64, '0');
            const netPayBigInt = BigInt('0x' + netPayHex);

            const proveAmountHex = Math.round(amountToProve * 100).toString(16).padStart(64, '0');
            const proveAmountBigInt = BigInt('0x' + proveAmountHex);

            // Use current date as proof generation date in YYYYMMDD format as bigint
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const dateNumber = parseInt(year + month + day);
            const dateHex = dateNumber.toString(16).padStart(64, '0');
            const proofGeneratedDateBigInt = BigInt('0x' + dateHex);            // Generate 32-byte randomness for cryptographic security
            const randomness = crypto.randomBytes(32);

            // 1) Build initial private state
            const initialPrivateState = createPaySlipPrivateState(paddedIdDOB);

            // 2) Build ConstructorContext using the user's wallet coinPublicKey
            const walletStateObservable = user.wallet.state();

            // Get the current wallet state (we'll use the first emission)
            let coinPublicKey = '';
            await new Promise<void>((resolve, reject) => {
                const subscription = walletStateObservable.subscribe({
                    next: (walletState) => {
                        coinPublicKey = walletState.coinPublicKey;
                        subscription.unsubscribe();
                        resolve();
                    },
                    error: (err) => {
                        subscription.unsubscribe();
                        reject(err);
                    }
                });
            });

            // Convert Bech32m coinPublicKey to hex format for constructorContext
            const coinPublicKeyHex = parseCoinPublicKeyToHex(coinPublicKey, NetworkId.TestNet.toString());

            const ctorCtx = constructorContext(initialPrivateState, coinPublicKeyHex);

            // 3) Use Contract.initialState to get initial on-chain ContractState
            const contract = new Contract(witnesses);
            const constructorResult = contract.initialState(ctorCtx);

            // Extract the states from ConstructorResult
            const currentContractState = constructorResult.currentContractState;
            const currentPrivateState = constructorResult.currentPrivateState;
            const currentZswapLocalState = constructorResult.currentZswapLocalState;

            // 4) Create context for circuit execution
            // DEVELOPMENT: Use a mock QueryContext to bypass dual-package hazard issues
            // The runtime expects a QueryContext-like object. Since we can't easily create a 
            // valid QueryContext instance that matches the contract's runtime instance (due to 
            // separate node_modules), we create a duck-typed mock.

            const mockQueryContext = {
                state: currentContractState.data,
                address: '00'.repeat(32), // Dummy address
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

            const context: CircuitContext<any> = {
                originalState: currentContractState,
                transactionContext: mockQueryContext,
                currentPrivateState,
                currentZswapLocalState
            };

            // PRODUCTION: Uncomment when contract is deployed to network
            // import { indexerPublicDataProvider, QueryContext } from '@midnight-ntwrk/midnight-js-sdk';
            // const contractAddress = process.env.PAYSLIP_CONTRACT_ADDRESS;
            // const publicDataProvider = indexerPublicDataProvider({ indexerUrl, indexerWsUrl });
            // const onChainState = await publicDataProvider.queryContractState(contractAddress);
            // const queryContext = new QueryContext(onChainState, contractAddress);
            // const context: CircuitContext<any> = {
            //     originalState: onChainState,
            //     transactionContext: queryContext,
            //     currentPrivateState,
            //     currentZswapLocalState
            // };

            // 5) Call the circuit with context
            const { result, context: newCtx, proofData } = contract.circuits.createVerificationHash(
                context,
                payslipNameBigInt,
                netPayBigInt,
                proveAmountBigInt,
                proofGeneratedDateBigInt,
                randomness
            );

            return {
                success: true,
                verificationHash: result,
                proofData,
                context: newCtx,
                randomness,
                proofGeneratedDate: proofGeneratedDateBigInt
            };

        } catch (error) {
            const errMsg = error instanceof Error ? error.message : String(error);
            console.error('❌ ZK proof generation error:', errMsg);
            return {
                success: false,
                error: errMsg
            };
        }
    }
} 