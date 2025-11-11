import { Contract } from '../managed/ep-contract/contract/index.cjs';
import { witnesses, type PayslipPrivateState } from './witnesses';

// Create the contract instance
export const payslipContractInstance = new Contract(witnesses);

// Re-export everything from the generated contract
export * from '../managed/ep-contract/contract/index.cjs';

// Re-export witness types and implementations
export * from './witnesses';