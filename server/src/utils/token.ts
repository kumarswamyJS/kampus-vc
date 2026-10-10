import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { env } from '../config/env';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'creator' | 'brand' | 'admin';
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
};

export const setAuthCookie = (res: Response, token: string): void => {
  const isProduction = env.NODE_ENV === 'production';
  res.cookie('kampus_auth_token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const clearAuthCookie = (res: Response): void => {
  res.cookie('kampus_auth_token', '', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });
};
