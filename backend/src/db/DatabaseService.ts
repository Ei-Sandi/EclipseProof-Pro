import { Pool } from 'pg';

import { EncryptedPayload } from '../utils/EncryptedPayload.js';
import { User } from '../services/User.js';

export class DatabaseService {
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: 5432 // This is the default port for PostgreSQL
        });
    }

    async initDb() {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS UserAccount (
                UserID SERIAL PRIMARY KEY,
                Email VARCHAR(255) UNIQUE NOT NULL,
                hashed_password CHAR(60) NOT NULL,
                encrypted_seed JSONB NOT NULL,
                encrypted_state JSONB NOT NULL,
                encrypted_secretkey JSONB NOT NULL
            );
        `;
        await this.pool.query(createTableQuery);
        console.log("Table UserAccount initialized.");
    }

    async isRegistered(email: string) {
        const result = await this.queryUserByEmail(email);
        return result.rows.length > 0;
    }

    async createUser(email: string, hashedPsw: string, encryptedSeed: EncryptedPayload,
        encryptedState: EncryptedPayload, encryptedSK: EncryptedPayload) {

        const insertUserQuery = `
            INSERT INTO UserAccount (
                Email, hashed_password, encrypted_seed, encrypted_state, encrypted_secretkey
            ) VALUES ($1, $2, $3, $4, $5);
        `;

        try {
            await this.pool.query(insertUserQuery, [
                email,
                hashedPsw,
                JSON.stringify(encryptedSeed),
                JSON.stringify(encryptedState),
                JSON.stringify(encryptedSK)
            ]);
        } catch (error) {
            if ((error as any).code === '23505') { // Error code 23505 is for unique object exists in db
                throw new Error("Email already exists");
            } else {
                console.log("Error inserting user into db" + error);
                throw error;
            }
        }
    }

    async close() {
        await this.pool.end();
        console.log("Database connection pool closed.");
    }

    async getUserData(email: string) {
        const result = await this.queryUserByEmail(email);

        if (result.rows.length === 0) {
            throw new Error("User not found");
        }

        const userData = {
            userID: result.rows[0].userid,
            email: result.rows[0].email,
            hashedPassword: result.rows[0].hashed_password,
            encryptedSecretKey: result.rows[0].encrypted_secretkey,
            encryptedSeed: result.rows[0].encrypted_seed,
            encryptedState: result.rows[0].encrypted_state
        };

        return userData;
    }

    async getUser(email: string): Promise<User> {
        const userData = await this.getUserData(email);

        const user: User = {
            userID: userData.userID,
            email: userData.email,
            wallet: null
        }
        return user;
    }

    getHashPassword(userData: any) {
        return userData.hashedPassword;
    }

    getEncryptedSecretKey(userData: any) {
        return userData.encryptedSecretKey;
    }

    getEncryptedSeed(userData: any) {
        return userData.encryptedSeed;
    }

    getEncryptedState(userData: any) {
        return userData.encryptedState;
    }

    private async queryUserByEmail(email: string) {
        const query = `
        SELECT * FROM UserAccount
        WHERE Email = $1;
    `;
        return await this.pool.query(query, [email]);
    }
}