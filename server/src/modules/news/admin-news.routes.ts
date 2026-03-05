import type { FastifyInstance } from 'fastify';
import { requireAuth, requireRole } from '../auth/auth.middleware.js';
import type { TokenService } from '../auth/token.service.js';
import { NewsController } from './news.controller.js';

interface AdminNewsRoutesDeps {
  controller: NewsController;
  tokenService: TokenService;
  uploadMaxBytes: number;
}

export const registerAdminNewsRoutes = async (app: FastifyInstance, deps: AdminNewsRoutesDeps) => {
  const authRequired = requireAuth(deps.tokenService);
  const adminOnly = requireRole('admin');
  const preHandler = [authRequired, adminOnly];
  const acceptedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  app.get('/', { preHandler }, async (request) => deps.controller.listAdmin(request));
  app.get<{ Params: { id: string } }>('/:id', { preHandler }, async (request) => deps.controller.getAdminById(request));
  app.post('/', { preHandler }, async (request) => deps.controller.create(request));
  app.put<{ Params: { id: string } }>('/:id', { preHandler }, async (request) => deps.controller.update(request));
  app.patch<{ Params: { id: string } }>('/:id/publish', { preHandler }, async (request) =>
    deps.controller.publish(request)
  );
  app.post<{ Params: { id: string } }>('/:id/image', { preHandler }, async (request) =>
    deps.controller.uploadImage(request, acceptedMimeTypes, deps.uploadMaxBytes)
  );
  app.delete<{ Params: { id: string } }>('/:id', { preHandler }, async (request) => deps.controller.delete(request));
};
