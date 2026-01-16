import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TOKEN_EXPIRY = '7d'; // 7 days

export interface TokenPayload {
  userId: string;
  username: string;
  email?: string;
  authProvider: string;
}

/**
 * Generate JWT token for authenticated user
 * @param payload - User data to encode in token
 * @returns JWT token string
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
}

/**
 * Verify and decode JWT token
 * @param token - JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Generate secure random session token
 * @returns Random token string
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(48).toString('base64url');
}

/**
 * Hash password using SHA-256 (for simple implementation)
 * In production, use bcrypt or argon2
 * @param password - Plain text password
 * @returns Hashed password
 */
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Verify password against hash
 * @param password - Plain text password
 * @param hash - Stored password hash
 * @returns True if password matches
 */
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

/**
 * Generate guest username
 * @returns Random guest username
 */
export function generateGuestUsername(): string {
  const adjectives = ['Swift', 'Clever', 'Bold', 'Wise', 'Quick', 'Sharp', 'Bright', 'Smart'];
  const nouns = ['Knight', 'Bishop', 'Rook', 'Queen', 'King', 'Pawn', 'Player', 'Master'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 9999);
  return `${adj}${noun}${number}`;
}
