import type { FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../../common/errors.js';
import { AuthService } from './auth.service.js';
import { loginBodySchema, logoutBodySchema, refreshBodySchema } from './auth.schemas.js';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async login(request: FastifyRequest) {
    try {
      const body = loginBodySchema.parse(request.body);
      return await this.authService.login(body.username, body.password);
    } catch (error) {
      this.rethrow(error);
    }
  }

  async refresh(request: FastifyRequest) {
    try {
      const body = refreshBodySchema.parse(request.body);
      return await this.authService.refresh(body.refreshToken);
    } catch (error) {
      this.rethrow(error);
    }
  }

  async logout(request: FastifyRequest) {
    try {
      const body = logoutBodySchema.parse(request.body);
      return await this.authService.logout(body.refreshToken);
    } catch (error) {
      this.rethrow(error);
    }
  }

  async me(request: FastifyRequest) {
    if (!request.user) {
      throw new AppError('Not authenticated', 401, 'NOT_AUTHENTICATED');
    }

    return this.authService.me(request.user.id);
  }

  private rethrow(error: unknown): never {
    if (error instanceof ZodError) {
      throw new AppError('Validation error', 422, 'VALIDATION_ERROR', error.flatten());
    }

    throw error;
  }
}
