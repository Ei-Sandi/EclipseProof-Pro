import { WalletBuilder, Resource } from '@midnight-ntwrk/wallet';
import { Wallet } from '@midnight-ntwrk/wallet-api';
import { NetworkId } from '@midnight-ntwrk/zswap';
import { generateRandomSeed } from '@midnight-ntwrk/wallet-sdk-hd';

const INDEXER_URL = process.env.INDEXER_URL || 'https://indexer.testnet-02.midnight.network/api/v1/graphql';
const INDEXER_WS_URL = process.env.INDEXER_WS_URL || 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws';
const PROVE_SERVER_URL = process.env.PROVE_SERVER_URL || 'http://localhost:6300';
const NODE_URL = process.env.NODE_URL || 'https://rpc.testnet-02.midnight.network';

export class WalletManager {
    private wallet: (Wallet & Resource) | null = null;
    
    constructor() {
        this.wallet = null;
    }

    async createWalletAndReturnSeed() {
        try {
            const seed = generateRandomSeed().toString();

            this.wallet = await WalletBuilder.build(
                INDEXER_URL,
                INDEXER_WS_URL,
                PROVE_SERVER_URL,
                NODE_URL,
                seed,
                NetworkId.TestNet
            );

            return { wallet: this.wallet, seed };
        } catch (error) {
            throw new Error(`Failed to create wallet: ${error}`);
        }
    }

    async restoreWallet(seed: string, state: string) {
        try {
            this.wallet = await WalletBuilder.restore(
                INDEXER_URL,
                INDEXER_WS_URL,
                PROVE_SERVER_URL,
                NODE_URL,
                seed,
                state
            );
            return this.wallet;
        } catch (error) {
            throw new Error(`Failed to restore wallet: ${error}`);
        }
    }
}
