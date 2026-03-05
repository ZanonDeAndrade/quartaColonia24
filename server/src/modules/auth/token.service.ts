import jwt, { type SignOptions } from 'jsonwebtoken';
import { AppError } from '../../common/errors.js';
import type { AuthenticatedUser, UserRole } from '../../types/domain.js';

interface TokenConfig {
  accessSecret: string;
  refreshSecret: string;
  accessExpiresIn: string;
  refreshExpiresIn: string;
}

interface AccessPayload {
  sub: string;
  role: UserRole;
}

interface RefreshPayload {
  sub: string;
  role: UserRole;
  type: 'refresh';
}

export class TokenService {
  constructor(private readonly config: TokenConfig) {}

  signAccessToken(user: AuthenticatedUser): string {
    const payload: AccessPayload = {
      sub: user.id,
      role: user.role
    };

    return jwt.sign(payload, this.config.accessSecret, {
      expiresIn: this.config.accessExpiresIn as SignOptions['expiresIn']
    });
  }

  signRefreshToken(user: AuthenticatedUser): string {
    const payload: RefreshPayload = {
      sub: user.id,
      role: user.role,
      type: 'refresh'
    };

    return jwt.sign(payload, this.config.refreshSecret, {
      expiresIn: this.config.refreshExpiresIn as SignOptions['expiresIn']
    });
  }

  verifyAccessToken(token: string): AuthenticatedUser {
    try {
      const payload = jwt.verify(token, this.config.accessSecret) as Partial<AccessPayload> & { type?: string };
      if (typeof payload.sub !== 'string' || typeof payload.role !== 'string') {
        throw new Error('Invalid access token payload');
      }
      if (payload.type && payload.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return {
        id: payload.sub,
        role: payload.role as UserRole
      };
    } catch {
      throw new AppError('Invalid or expired access token', 401, 'INVALID_ACCESS_TOKEN');
    }
  }

  verifyRefreshToken(token: string): { userId: string; role: UserRole } {
    try {
      const payload = jwt.verify(token, this.config.refreshSecret) as Partial<RefreshPayload>;
      if (payload.type !== 'refresh') throw new Error('Invalid token type');
      if (typeof payload.sub !== 'string' || typeof payload.role !== 'string') {
        throw new Error('Invalid refresh token payload');
      }

      return { userId: payload.sub, role: payload.role as UserRole };
    } catch {
      throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }
  }
}
