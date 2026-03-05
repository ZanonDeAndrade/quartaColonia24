import type { FastifyInstance } from 'fastify';
import { requireAuth, requireRole } from '../auth/auth.middleware.js';
import type { TokenService } from '../auth/token.service.js';
import { SponsorsController } from './sponsors.controller.js';

interface AdminSponsorsRoutesDeps {
  controller: SponsorsController;
  tokenService: TokenService;
  uploadMaxBytes: number;
}

export const registerAdminSponsorsRoutes = async (app: FastifyInstance, deps: AdminSponsorsRoutesDeps) => {
  const authRequired = requireAuth(deps.tokenService);
  const adminOnly = requireRole('admin');
  const preHandler = [authRequired, adminOnly];

  app.get('/', { preHandler }, async (request) => deps.controller.listAdmin(request));
  app.post('/', { preHandler }, async (request) => deps.controller.create(request));
  app.put<{ Params: { id: string } }>('/:id', { preHandler }, async (request) => deps.controller.update(request));
  app.post<{ Params: { id: string } }>('/:id/image', { preHandler }, async (request) =>
    deps.controller.uploadImage(request, deps.uploadMaxBytes)
  );
  app.delete<{ Params: { id: string } }>('/:id', { preHandler }, async (request) => deps.controller.delete(request));
};
