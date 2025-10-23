import * as crypto from 'crypto';
import { promisify } from 'util';

import { EncryptedPayload } from './EncryptedPayload.js';

const pbkdf2 = promisify(crypto.pbkdf2);
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const KEY_DERIVATION_ALGORITHM = 'sha512';
const KEY_LENGTH_BYTES = 32;
const SALT_LENGTH_BYTES = 16;
const IV_LENGTH_BYTES = 12;
const PBKDF2_ITERATIONS = 100000;

export class EncryptionService {

    async encrypt(plaintext: string, secretKey: string): Promise<EncryptedPayload> {

        // 1. Generate a new, unique salt for this encryption
        const salt = crypto.randomBytes(SALT_LENGTH_BYTES);

        // 2. Generate a new, unique Initialization Vector (IV)
        const iv = crypto.randomBytes(IV_LENGTH_BYTES);

        // 3. Derive the encryption key from the password and salt
        const key = await pbkdf2(
            secretKey,
            salt,
            PBKDF2_ITERATIONS,
            KEY_LENGTH_BYTES,
            KEY_DERIVATION_ALGORITHM,
        );

        // 4. Create the AES-256-GCM cipher
        const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

        // 5. Encrypt the data
        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // 6. Get the GCM authentication tag
        const authTag = cipher.getAuthTag();

        // 7. Return all the necessary parts, encoded as hex strings
        return {
            salt: salt.toString('hex'),
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex'),
            ciphertext: encrypted,
        };
    }


    async decrypt(payload: EncryptedPayload, secretKey: string): Promise<string> {

        // 1. Convert the hex-encoded components back into Buffers
        const salt = Buffer.from(payload.salt, 'hex');
        const iv = Buffer.from(payload.iv, 'hex');
        const authTag = Buffer.from(payload.authTag, 'hex');

        // 2. Re-derive the *same* encryption key using the *same* parameters
        const key = await pbkdf2(
            secretKey,
            salt, // Use the *exact same salt* from the payload
            PBKDF2_ITERATIONS,
            KEY_LENGTH_BYTES,
            KEY_DERIVATION_ALGORITHM,
        );

        // 3. Create the AES-256-GCM decipher
        const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);

        // 4. Set the authentication tag (this is crucial for GCM)
        decipher.setAuthTag(authTag);

        // 5. Decrypt the data
        // A try...catch block is essential here. If the password is wrong or
        // the data was tampered with, `decipher.final()` will throw an error.
        try {
            let decrypted = decipher.update(payload.ciphertext, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } catch (err) {
            // Authentication failed
            throw new Error('Decryption failed. Wrong password or corrupted data.');
        }
    }
}