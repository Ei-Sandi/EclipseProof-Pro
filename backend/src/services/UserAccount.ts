import { Wallet } from '@midnight-ntwrk/wallet-api';
import { Resource } from '@midnight-ntwrk/wallet';

import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { WalletManager } from './WalletManager.js';
import { EncryptionService } from '../utils/EncryptionService.js';
import { DatabaseService } from '../db/DatabaseService.js';
import { User } from './User.js';

export class UserAccount {
    private walletManager: WalletManager;
    private encryptionService: EncryptionService;
    private db: DatabaseService;
    private wallet: (Wallet & Resource) | null;
    private user: User | null;

    constructor() {
        this.walletManager = new WalletManager();
        this.encryptionService = new EncryptionService();
        this.db = new DatabaseService();
        this.wallet = null;
        this.user = null;
    }

    async signUp(email: string, password: string) {
        if (!this.isValidEmailFormat(email)) {
            throw new Error("Invalid email");
        }

        this.isValidPassword(password);

        if (await this.db.isRegistered(email) === true) {
            throw new Error("Email already exists");
        };

        const { wallet, seed } = await this.walletManager.createWalletAndReturnSeed();
        this.wallet = wallet;

        const state = await wallet.serializeState();
        const hashedPassword = await this.hashPassword(password);

        const secretKey = this.generateSecretKey();

        const encryptedSeed = await this.encryptionService.encrypt(seed, secretKey);
        const encryptedState = await this.encryptionService.encrypt(state, secretKey);

        const encryptedSecretKey = await this.encryptionService.encrypt(secretKey, password);

        try {
            await this.db.createUser(
                email,
                hashedPassword,
                encryptedSeed,
                encryptedState,
                encryptedSecretKey
            );
        } catch (error) {
            console.log(`Fail to add new user to database with error ${error}`);
            wallet.close();
        }

        await wallet.close()
    }

    async login(email: string, password: string) {
        if (!this.isValidEmailFormat(email)) {
            throw new Error("Invalid email");
        }

        if (!(await this.db.isRegistered(email))) {
            throw new Error("Email does not exist");
        };

        const userData = await this.db.getUserData(email);

        const user = await this.db.getUser(email);

        const hashedPassword = await this.db.getHashPassword(userData);
        const isPasswordValid = await bcrypt.compare(password, hashedPassword);
        if (!isPasswordValid) {
            throw new Error('Invalid password.');
        }

        const encryptedSecretKey = await this.db.getEncryptedSecretKey(userData);
        const secretKey = await this.encryptionService.decrypt(encryptedSecretKey, password);

        const encryptedSeed = await this.db.getEncryptedSeed(userData);
        const seed = await this.encryptionService.decrypt(encryptedSeed, secretKey);

        const encryptedState = await this.db.getEncryptedState(userData);
        const state = await this.encryptionService.decrypt(encryptedState, secretKey);

        const wallet = await this.walletManager.restoreWallet(seed, state);
        user.wallet = wallet;
        wallet.start();

        this.user = user;
        return user;
    }

    private isValidEmailFormat(email: string) {
        return (RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(email));
    }

    private isValidPassword(password: string): boolean {
        // Minimum 8 characters, at least one uppercase, one lowercase, one number, and one special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
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
