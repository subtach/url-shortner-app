import { createHash } from 'crypto'

/**
 * Hashes a plaintext password using SHA-256.
 * Returns the hash as a hex string.
 */
export function hashPassword(plaintext: string): string {
  return createHash('sha256').update(plaintext).digest('hex')
}

/**
 * Verifies a plaintext password against a stored SHA-256 hash.
 */
export function verifyPassword(plaintext: string, storedHash: string): boolean {
  return hashPassword(plaintext) === storedHash
}
