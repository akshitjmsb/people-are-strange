import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

export interface EncryptedSecret {
  ciphertext: string;
  iv: string;
  authTag: string;
}

function encryptionKey(): Buffer {
  const configured = process.env.RESUME_TOKEN_ENCRYPTION_KEY;
  if (!configured) throw new Error('RESUME_TOKEN_ENCRYPTION_KEY is not configured');

  const key = /^[a-f\d]{64}$/i.test(configured)
    ? Buffer.from(configured, 'hex')
    : Buffer.from(configured, 'base64');
  if (key.length !== 32) {
    throw new Error('RESUME_TOKEN_ENCRYPTION_KEY must decode to exactly 32 bytes');
  }
  return key;
}

export function encryptSecret(value: string): EncryptedSecret {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return {
    ciphertext: ciphertext.toString('base64'),
    iv: iv.toString('base64'),
    authTag: cipher.getAuthTag().toString('base64'),
  };
}

export function decryptSecret(secret: EncryptedSecret): string {
  const decipher = createDecipheriv(
    'aes-256-gcm',
    encryptionKey(),
    Buffer.from(secret.iv, 'base64'),
  );
  decipher.setAuthTag(Buffer.from(secret.authTag, 'base64'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(secret.ciphertext, 'base64')),
    decipher.final(),
  ]);
  return plaintext.toString('utf8');
}
