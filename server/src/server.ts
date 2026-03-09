import 'dotenv/config';
import { getEnv } from './config/env.js';
import { createDefaultServices } from './factories/create-services.js';
import { buildApp } from './app.js';

const start = async () => {
  const env = getEnv();
  const port = Number(process.env.PORT) || env.PORT || 3000;
  const services = createDefaultServices(env);
  const app = await buildApp({
    env: {
      CORS_ORIGINS: env.CORS_ORIGINS,
      UPLOAD_MAX_BYTES: env.UPLOAD_MAX_BYTES,
      SITE_BASE_URL: env.SITE_BASE_URL
    },
    services
  });

  try {
    await app.listen({ port, host: '0.0.0.0' });
    app.log.info(`API running on http://localhost:${port}`);
  } catch (error) {
    app.log.error(error, 'failed to start server');
    process.exit(1);
  }
};

void start();
