import type { FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../../common/errors.js';
import type { UserRole } from '../../types/domain.js';
import { TokenService } from './token.service.js';

export const requireAuth =
  (tokenService: TokenService) => async (request: FastifyRequest, _reply: FastifyReply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Missing bearer token', 401, 'MISSING_BEARER_TOKEN');
    }

    const token = authHeader.replace('Bearer ', '').trim();
    request.user = tokenService.verifyAccessToken(token);
  };

export const requireRole =
  (role: UserRole) => async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!request.user) {
      throw new AppError('Not authenticated', 401, 'NOT_AUTHENTICATED');
    }

    if (request.user.role !== role) {
      throw new AppError('Access denied', 403, 'ACCESS_DENIED');
    }
  };
