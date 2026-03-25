import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import type { Env } from './config/env.js';
import { isAllowedOrigin, normalizeOrigin } from './config/cors.js';
import { isAppError } from './common/errors.js';
import type { AppServices } from './factories/create-services.js';
import { healthRoutes } from './routes/health.routes.js';
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
  env: Pick<Env, 'CORS_ORIGINS' | 'UPLOAD_MAX_BYTES' | 'SITE_BASE_URL'>;
  services: AppServices;
}

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const buildSitemapXml = (
  baseUrl: string,
  entries: Array<{
    slug: string;
    updatedAt: Date;
    publishedAt: Date | null;
  }>
) => {
  const nowIso = new Date().toISOString();
  const rootEntry = `  <url>\n    <loc>${escapeXml(baseUrl)}</loc>\n    <lastmod>${nowIso}</lastmod>\n    <changefreq>hourly</changefreq>\n    <priority>1.0</priority>\n  </url>`;

  const newsEntries = entries
    .map((entry) => {
      const lastMod = (entry.updatedAt ?? entry.publishedAt ?? new Date()).toISOString();
      const loc = `${baseUrl}/noticia/${encodeURIComponent(entry.slug)}`;

      return [
        '  <url>',
        `    <loc>${escapeXml(loc)}</loc>`,
        `    <lastmod>${lastMod}</lastmod>`,
        '    <changefreq>hourly</changefreq>',
        '    <priority>0.9</priority>',
        '  </url>'
      ].join('\n');
    })
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    rootEntry,
    newsEntries,
    '</urlset>'
  ]
    .filter(Boolean)
    .join('\n');
};

export const buildApp = async (input: BuildAppInput) => {
  const normalizedAllowedOrigins = input.env.CORS_ORIGINS.map((origin) => normalizeOrigin(origin));

  const app = Fastify({
    logger: {
      level: 'info'
    }
  });

  await app.register(helmet);
  await app.register(cors, {
    hook: 'onRequest',
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = normalizeOrigin(origin);
      if (isAllowedOrigin(normalizedOrigin, normalizedAllowedOrigins)) {
        callback(null, true);
        return;
      }

      app.log.warn({ origin: normalizedOrigin }, 'Blocked CORS origin');
      callback(new Error('Origin not allowed by CORS'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflight: true,
    strictPreflight: true,
    optionsSuccessStatus: 204
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
  await app.register(healthRoutes);

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

  app.get('/sitemap.xml', async (_request, reply) => {
    const entries = await input.services.newsService.listPublishedForSitemap();
    const xml = buildSitemapXml(input.env.SITE_BASE_URL, entries);

    reply.type('application/xml; charset=utf-8');
    return reply.send(xml);
  });

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
