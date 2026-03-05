import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import type { Env } from './config/env.js';
import { isAppError } from './common/errors.js';
import type { AppServices } from './factories/create-services.js';
import { AuthController } from './modules/auth/auth.controller.js';
import { registerAuthRoutes } from './modules/auth/auth.routes.js';
import { registerAdminColumnsRoutes } from './modules/columns/admin-columns.routes.js';
import { ColumnsController } from './modules/columns/columns.controller.js';
import { registerPublicColumnsRoutes } from './modules/columns/public-columns.routes.js';
import { registerAdminNewsRoutes } from './modules/news/admin-news.routes.js';
import { NewsController } from './modules/news/news.controller.js';
import { registerPublicNewsRoutes } from './modules/news/public-news.routes.js';
import { registerAdminSponsorsRoutes } from './modules/sponsors/admin-sponsors.routes.js';
import { registerPublicSponsorsRoutes } from './modules/sponsors/public-sponsors.routes.js';
import { SponsorsController } from './modules/sponsors/sponsors.controller.js';

interface BuildAppInput {
  env: Pick<Env, 'CORS_ORIGIN' | 'UPLOAD_MAX_BYTES'>;
  services: AppServices;
}

export const buildApp = async (input: BuildAppInput) => {
  const allowedOrigins = input.env.CORS_ORIGIN.split(',')
    .map((item) => item.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  const app = Fastify({
    logger: {
      level: 'info'
    }
  });

  await app.register(helmet);
  await app.register(cors, {
    origin: (origin, callback) => {
      const normalized = origin?.replace(/\/+$/, '');
      if (!origin || (normalized && allowedOrigins.includes(normalized))) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin not allowed by CORS'), false);
    },
    credentials: true
  });
  await app.register(rateLimit, {
    global: false,
    max: 100,
    timeWindow: '1 minute'
  });
  await app.register(multipart, {
    limits: {
      files: 1,
      fileSize: input.env.UPLOAD_MAX_BYTES
    }
  });

  const authController = new AuthController(input.services.authService);
  const newsController = new NewsController(input.services.newsService);
  const columnsController = new ColumnsController(input.services.columnsService);
  const sponsorsController = new SponsorsController(input.services.sponsorsService);

  await app.register(
    async (scope) => {
      await registerAuthRoutes(scope, {
        controller: authController,
        tokenService: input.services.tokenService
      });
    },
    { prefix: '/api/auth' }
  );

  await app.register(
    async (scope) => {
      await registerPublicNewsRoutes(scope, newsController);
    },
    { prefix: '/api/news' }
  );

  await app.register(
    async (scope) => {
      await registerAdminNewsRoutes(scope, {
        controller: newsController,
        tokenService: input.services.tokenService,
        uploadMaxBytes: input.env.UPLOAD_MAX_BYTES
      });
    },
    { prefix: '/api/admin/news' }
  );

  await app.register(
    async (scope) => {
      await registerPublicColumnsRoutes(scope, columnsController);
    },
    { prefix: '/api/columns' }
  );

  await app.register(
    async (scope) => {
      await registerAdminColumnsRoutes(scope, {
        controller: columnsController,
        tokenService: input.services.tokenService,
        uploadMaxBytes: input.env.UPLOAD_MAX_BYTES
      });
    },
    { prefix: '/api/admin/columns' }
  );

  await app.register(
    async (scope) => {
      await registerPublicSponsorsRoutes(scope, sponsorsController);
    },
    { prefix: '/api/sponsors' }
  );

  await app.register(
    async (scope) => {
      await registerAdminSponsorsRoutes(scope, {
        controller: sponsorsController,
        tokenService: input.services.tokenService,
        uploadMaxBytes: input.env.UPLOAD_MAX_BYTES
      });
    },
    { prefix: '/api/admin/sponsors' }
  );

  app.get('/health', async () => ({ ok: true }));

  app.setErrorHandler((error, request, reply) => {
    const requestId = request.id;

    if (isAppError(error)) {
      request.log.warn(
        { requestId, code: error.code, details: error.details, message: error.message },
        'application error'
      );
      return reply.status(error.statusCode).send({
        message: error.message,
        code: error.code,
        requestId
      });
    }

    request.log.error({ requestId, err: error }, 'unhandled error');
    return reply.status(500).send({
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
      requestId
    });
  });

  app.setNotFoundHandler((request, reply) => {
    return reply.status(404).send({
      message: 'Route not found',
      code: 'NOT_FOUND',
      requestId: request.id
    });
  });

  return app;
};
