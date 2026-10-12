/**
 * Token Encryption Service
 *
 * Access tokens from Meta are NEVER stored in plaintext.
 * Uses AES-256-GCM encryption with the ENCRYPTION_KEY env var.
 *
 * IMPORTANT: If ENCRYPTION_KEY changes, all stored tokens become invalid
 * and users will need to reconnect their Instagram accounts.
 */
import crypto from 'crypto';
import { config } from '../config/index.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function getKey(): Buffer {
  if (!config.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY is not configured. Cannot encrypt/decrypt tokens.');
  }
  // Derive a 32-byte key from the hex string
  return Buffer.from(config.ENCRYPTION_KEY.slice(0, 64), 'hex');
}

/**
 * Encrypt a plaintext token for storage.
 * Returns: base64(iv + authTag + ciphertext)
 */
export function encryptToken(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Combine: iv (16) + authTag (16) + ciphertext
  const combined = Buffer.concat([iv, authTag, encrypted]);
  return combined.toString('base64');
}

/**
 * Decrypt a stored token.
 * Throws if the token has been tampered with or the key is wrong.
 */
export function decryptToken(encrypted: string): string {
  const key = getKey();
  const combined = Buffer.from(encrypted, 'base64');

  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const ciphertext = combined.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}
