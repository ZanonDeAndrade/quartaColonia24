import type { FastifyInstance } from 'fastify';
import { AuthController } from './auth.controller.js';
import { requireAuth } from './auth.middleware.js';
import type { TokenService } from './token.service.js';

interface AuthRoutesDeps {
  controller: AuthController;
  tokenService: TokenService;
}

export const registerAuthRoutes = async (app: FastifyInstance, deps: AuthRoutesDeps) => {
  const authRequired = requireAuth(deps.tokenService);

  app.post('/login', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (request) =>
    deps.controller.login(request)
  );
  app.post('/refresh', async (request) => deps.controller.refresh(request));
  app.post('/logout', async (request) => deps.controller.logout(request));
  app.get('/me', { preHandler: [authRequired] }, async (request) => deps.controller.me(request));
};
