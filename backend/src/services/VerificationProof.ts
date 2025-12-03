import * as crypto from 'crypto';
import type { CircuitContext } from '@midnight-ntwrk/compact-runtime';
import { constructorContext } from '@midnight-ntwrk/compact-runtime';
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
    requestId: string;
    salt: string;
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
            const { witnesses, createPrivateState } = await import('../../../contracts/dist/witnesses.js');

            // Convert employee name to Uint8Array (32 bytes)
            const nameHash = crypto.createHash('sha256').update(employeeName).digest();
            const nameBytes = new Uint8Array(nameHash);

            // Convert amounts to bigint (multiply by 100 to preserve 2 decimal places)
            const netPayBigInt = BigInt(Math.round(netPay * 100));

            const proveAmountBigInt = BigInt(Math.round(amountToProve * 100));

            // Use current date as proof generation date in YYYYMMDD format as bigint
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const dateNumber = parseInt(year + month + day);
            const proofGeneratedDateBigInt = BigInt(dateNumber);

            // Generate 32-byte randomness (salt) for cryptographic security
            const randomness = crypto.randomBytes(32);

            // 1) Build initial private state with full payslip data
            const initialPrivateState = createPrivateState(
                nameBytes,
                paddedIdDOB,
                netPayBigInt,
                randomness
            );

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
            const coinPublicKeyHex = parseCoinPublicKeyToHex(coinPublicKey, NetworkId.TestNet);

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

            // PRODUCTION: Uncomment when contract is deployed to testnet
            // Step 1: Query the deployed contract state from the indexer
            // import { indexerPublicDataProvider, QueryContext } from '@midnight-ntwrk/midnight-js-sdk';
            // const contractAddress = process.env.CONTRACT_ADDRESS;
            // const indexerUrl = process.env.INDEXER_URL || 'https://indexer.testnet-02.midnight.network/api/v1/graphql';
            // const indexerWsUrl = process.env.INDEXER_WS_URL || 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws';
            // const publicDataProvider = indexerPublicDataProvider({ indexerUrl, indexerWsUrl });
            // const onChainState = await publicDataProvider.queryContractState(contractAddress);
            // const queryContext = new QueryContext(onChainState, contractAddress);
            // const context: CircuitContext<any> = {
            //     originalState: onChainState,
            //     transactionContext: queryContext,
            //     currentPrivateState,
            //     currentZswapLocalState
            // };

            // 5) Generate a unique request ID (32 bytes)
            const requestId = crypto.randomBytes(32);

            // 6) Call the proveIncome circuit to create the ZK proof
            const proveIncomeResult = contract.circuits.proveIncome(
                context,
                proveAmountBigInt,
                requestId
            );

            // PRODUCTION: Step 2: Submit the proof transaction to the Midnight network
            // This stores the verification result in the on-chain ledger so the verifier can query it later
            // const circuitProvingKey = await user.wallet.getProvingKey('proveIncome');
            // const tx = await user.wallet.submitTransaction({
            //     contractAddress,
            //     circuit: 'proveIncome',
            //     args: [proveAmountBigInt, requestId],
            //     proof: proveIncomeResult.proofData,
            //     privateStateKey: currentPrivateState,
            //     provingKey: circuitProvingKey
            // });
            // 
            // console.log('📤 Transaction submitted:', tx.hash);
            // await tx.wait(); // Wait for confirmation
            // console.log('✅ Verification stored on-chain at requestId:', Buffer.from(requestId).toString('hex'));

            // 7) Convert requestId and salt to hex strings for QR code generation
            const requestIdHex = Buffer.from(requestId).toString('hex');
            const saltHex = Buffer.from(randomness).toString('hex');

            return {
                success: true,
                requestId: requestIdHex,
                salt: saltHex
            };

        } catch (error) {
            const errMsg = error instanceof Error ? error.message : String(error);
            console.error('❌ ZK proof generation error:', errMsg);
            return {
                success: false,
                requestId: '',
                salt: '',
                error: errMsg
            };
        }
    }
} 