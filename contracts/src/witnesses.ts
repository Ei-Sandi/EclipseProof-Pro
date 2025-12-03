import type { WitnessContext } from '@midnight-ntwrk/compact-runtime';
import type { Ledger, Witnesses } from '../managed/ep-contract/contract/index.d.cts';

export type PrivateState = {
  name: Uint8Array;
  dob: Uint8Array;
  netPay: bigint;
  salt: Uint8Array;
};

export function createPrivateState(
  name: Uint8Array,
  dob: Uint8Array,
  netPay: bigint,
  salt: Uint8Array
): PrivateState {
  return { name, dob, netPay, salt };
}

export type PayslipWitness = {
  name: Uint8Array;
  dob: Uint8Array;
  netPay: bigint;
  salt: Uint8Array;
};

export const witnesses: Witnesses<PrivateState> = {
  getPayslip(
    context: WitnessContext<Ledger, PrivateState>
  ): [PrivateState, PayslipWitness] {
    const { privateState } = context;

    const payslip: PayslipWitness = {
      name: privateState.name,
      dob: privateState.dob,
      netPay: privateState.netPay,
      salt: privateState.salt,
    };

    return [privateState, payslip];
  },
};