/**
 * auth.ts — Middleware de autenticación JWT para Express.
 *
 * Verifica el Bearer token con Firebase Admin SDK, extrae los custom claims
 * (role, residenciaId, staffId) y los adjunta a req.user.
 * Cualquier handler posterior puede asumir que req.user está presente y válido.
 */

import type { Request, Response, NextFunction } from 'express';
import { auth } from '../firebaseAdmin';

export interface AuthUser {
  uid:          string;
  email:        string;
  role:         string;
  residenciaId: string;
  staffId:      string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' });
    return;
  }

  try {
    const token = await auth.verifyIdToken(header.slice(7));

    if (!token.role || !token.residenciaId || !token.staffId) {
      res.status(403).json({ error: 'User not provisioned — contact your administrator' });
      return;
    }

    req.user = {
      uid:          token.uid,
      email:        token.email ?? '',
      role:         token.role as string,
      residenciaId: token.residenciaId as string,
      staffId:      token.staffId as string,
    };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/** Middleware de autorización: verifica que el usuario tenga uno de los roles requeridos. */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: `Requires role: ${roles.join(' | ')}` });
      return;
    }
    next();
  };
}
