import type { WitnessContext } from '@midnight-ntwrk/compact-runtime';
import type { Ledger, Witnesses } from '../managed/ep-contract/contract/index.cjs';

export type PayslipPrivateState = {
  idDOB: Uint8Array;
};

export const witnesses: Witnesses<PayslipPrivateState> = {
  getIDDOB: ({ privateState }: WitnessContext<Ledger, PayslipPrivateState>) => {
    return [privateState, privateState.idDOB];
  },
};