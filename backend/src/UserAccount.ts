import { WalletManager } from './WalletManager';
import { EncryptionService } from './EncryptionService';

import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

class UserAccount {
    private wallet: string;
    private walletManager: WalletManager;
    private encryptionService: EncryptionService;

    constructor() {
        this.wallet = '';
        this.walletManager = new WalletManager();
        this.encryptionService = new EncryptionService();
    }

    async signUp(email: string, password: string) {
        const { wallet, seed } = await this.walletManager.createWalletAndReturnSeed();
        this.wallet = wallet;

        const state = wallet.serialize();
        const hashedPassword = this.hashPassword(password);

        const secretKey = this.generateSecretKey();

        const encryptedSeed = this.encryptionService.encrypt(seed, secretKey);
        const encryptedState = this.encryptionService.encrypt(state, secretKey);

        const encryptedSecretKey = await this.encryptionService.encrypt(secretKey, password);

        await wallet.close()
    }

    private generateSecretKey(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    private hashPassword(password: string) {
        const saltRounds = 10;
        const hashedPassword = bcrypt.hash(password, saltRounds);
        return hashedPassword;
    }
}
