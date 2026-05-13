import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import redis from './redis';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'wecollab_secret';
const SESSION_TTL = 60 * 60 * 24; // 24 jam dalam detik

// ============================================================
// Password Utilities
// ============================================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ============================================================
// Token & Session
// ============================================================

export function generateJWT(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyJWT(token: string): { userId: string } | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(userId: string): Promise<string> {
  const token = generateJWT(userId);
  // Simpan di Redis: session:{token} → user_id dengan TTL 24 jam
  await redis.set(`session:${token}`, userId, 'EX', SESSION_TTL);
  return token;
}

export async function getSessionUserId(token: string): Promise<string | null> {
  // Verifikasi JWT terlebih dahulu
  const payload = verifyJWT(token);
  if (!payload) return null;

  // Cek apakah session masih ada di Redis
  const userId = await redis.get(`session:${token}`);
  return userId;
}

export async function deleteSession(token: string): Promise<void> {
  await redis.del(`session:${token}`);
}

export async function getUserFromRequest(req: NextRequest): Promise<string | null> {
  const cookieToken = req.cookies.get('wecollab_token')?.value;
  if (!cookieToken) {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      return getSessionUserId(token);
    }
    return null;
  }
  return getSessionUserId(cookieToken);
}
