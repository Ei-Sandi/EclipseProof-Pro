import type { WitnessContext } from '@midnight-ntwrk/compact-runtime';
import type { Ledger, Witnesses as ContractWitnesses } from '../managed/ep-contract/contract/index.cjs';

export type PayslipPrivateState = {
  idDOB: Uint8Array;
};

export function createPaySlipPrivateState(idDOB: Uint8Array): PayslipPrivateState {
  return { idDOB };
}

export type PayslipWitnesses = ContractWitnesses<PayslipPrivateState>;

export const witnesses: PayslipWitnesses = {
  getIDDOB: (
    { privateState }: WitnessContext<Ledger, PayslipPrivateState>,
  ): [PayslipPrivateState, Uint8Array] => {
    return [privateState, privateState.idDOB];
  },
};