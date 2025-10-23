import { Wallet } from '@midnight-ntwrk/wallet-api';
import { Resource } from '@midnight-ntwrk/wallet';

export interface User {
    userID: number;
    email: string;
    wallet: (Wallet & Resource) | null;
}