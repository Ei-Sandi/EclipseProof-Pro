import { Wallet } from '@midnight-ntwrk/wallet-api';
import { Resource } from '@midnight-ntwrk/wallet';

export interface User {
    userID: number;
    email: string;
    wallet: (Wallet & Resource) | null;
    idDOB?: Uint8Array; // Store the verified DOB from ID document
    idName?: string; // Store the verified name from ID document
}