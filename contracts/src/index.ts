import { Contract } from '../managed/ep-contract/contract/index.cjs';
import { witnesses, createPaySlipPrivateState, PayslipPrivateState } from './witnesses.js';
import type { CircuitContext } from '@midnight-ntwrk/compact-runtime';

export function makePayslipContract(privateDOB: Uint8Array) {
    const contract = new Contract<PayslipPrivateState, typeof witnesses>(witnesses);
    const privateState = createPaySlipPrivateState(privateDOB);
    return { contract, privateState };
}

/**
 * Creates a verification hash for a payslip using zero-knowledge proof
 * @param idDOB - User's date of birth as 32-byte Uint8Array
 * @param payslipName - Identifier for the payslip
 * @param netPay - Actual net pay amount from the payslip
 * @param proveAmount - Threshold amount to prove (e.g., "earns at least X")
 * @param proofGeneratedDate - Date when proof is generated (YYYYMMDD format as bigint)
 * @param randomness - 32-byte random value for cryptographic security
 * @param ctx - Circuit context (optional, will create minimal context if not provided)
 * @returns Object containing the verification hash, updated context, and proof data
 */
export async function createProofHash(
    idDOB: Uint8Array,
    payslipName: bigint,
    netPay: bigint,
    proveAmount: bigint,
    proofGeneratedDate: bigint,
    randomness: Uint8Array,
    ctx?: CircuitContext<PayslipPrivateState>
) {
    const { contract, privateState } = makePayslipContract(idDOB);

    // Use provided context or create minimal context
    const circuitContext: CircuitContext<PayslipPrivateState> = ctx ?? {
        originalState: {} as any,
        transactionContext: {} as any,
        currentPrivateState: privateState,
        currentZswapLocalState: {} as any,
    };

    const { result, context: newCtx, proofData } =
        contract.circuits.createVerificationHash(
            circuitContext,
            payslipName,
            netPay,
            proveAmount,
            proofGeneratedDate,
            randomness,
        );

    return { verificationHash: result, context: newCtx, proofData };
}