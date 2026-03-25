import 'dotenv/config';
import type { FastifyInstance } from 'fastify';
import { getEnv } from './config/env.js';
import { createDefaultServices } from './factories/create-services.js';
import { buildApp } from './app.js';

const DEFAULT_PORT = 3000;
const DEFAULT_HOST = '0.0.0.0';
const SHUTDOWN_SIGNALS: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];
const REQUIRED_ROUTE_MARKERS = ['/health', '/api/news', '/api/columns', '/api/sponsors'];

const resolvePort = (configuredPort: number) => {
  const runtimePort = Number.parseInt(process.env.PORT ?? '', 10);
  if (Number.isInteger(runtimePort) && runtimePort > 0) {
    return runtimePort;
  }

  return configuredPort || DEFAULT_PORT;
};

const registerShutdownHandlers = (app: FastifyInstance) => {
  let isShuttingDown = false;

  const shutdown = async (signal: NodeJS.Signals) => {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    app.log.info({ signal }, 'shutdown signal received');

    try {
      await app.close();
      app.log.info({ signal }, 'server stopped cleanly');
      process.exit(0);
    } catch (error) {
      app.log.error({ signal, err: error }, 'failed to stop server cleanly');
      process.exit(1);
    }
  };

  for (const signal of SHUTDOWN_SIGNALS) {
    process.once(signal, () => {
      void shutdown(signal);
    });
  }
};

const assertRoutesLoaded = (app: FastifyInstance) => {
  const routesTree = app.printRoutes({ commonPrefix: false });

  console.log('ROUTES LOADED:');
  console.log(routesTree);

  const missingRoutes = REQUIRED_ROUTE_MARKERS.filter((route) => !routesTree.includes(route));
  if (missingRoutes.length > 0) {
    throw new Error(`Required routes were not registered before startup: ${missingRoutes.join(', ')}`);
  }

  return routesTree;
};

export const startServer = async () => {
  let app: FastifyInstance | null = null;

  try {
    console.log('SERVER STARTING');
    console.log('ENV:', process.env.NODE_ENV);
    console.log('Loading backend environment and services');
    const env = getEnv();
    const port = resolvePort(env.PORT);
    const services = createDefaultServices(env);

    app = await buildApp({
      env: {
        CORS_ORIGINS: env.CORS_ORIGINS,
        UPLOAD_MAX_BYTES: env.UPLOAD_MAX_BYTES,
        SITE_BASE_URL: env.SITE_BASE_URL
      },
      services
    });

    registerShutdownHandlers(app);
    await app.ready();

    const routesTree = assertRoutesLoaded(app);
    app.log.info({ routes: routesTree }, 'registered routes');

    await app.listen({ port, host: DEFAULT_HOST });
    app.log.info({ host: DEFAULT_HOST, port, environment: env.NODE_ENV }, 'API running');

    return app;
  } catch (error) {
    if (app) {
      app.log.error({ err: error }, 'failed to start server');
      await app.close().catch(() => undefined);
    } else {
      console.error('failed to start server', error);
    }

    process.exit(1);
  }
};
