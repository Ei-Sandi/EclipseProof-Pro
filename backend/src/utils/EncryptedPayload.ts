export interface EncryptedPayload {
    salt: string;        // The salt (hex) used to derive the key
    iv: string;          // The initialization vector (hex)
    authTag: string;     // The GCM authentication tag (hex)
    ciphertext: string;  // The encrypted data (hex)
}