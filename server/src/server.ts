import 'dotenv/config';
import { getEnv } from './config/env.js';
import { createDefaultServices } from './factories/create-services.js';
import { buildApp } from './app.js';

const start = async () => {
  const env = getEnv();
  const services = createDefaultServices(env);
  const app = await buildApp({
    env: {
      CORS_ORIGIN: env.CORS_ORIGIN,
      UPLOAD_MAX_BYTES: env.UPLOAD_MAX_BYTES
    },
    services
  });

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    app.log.info(`API running on http://localhost:${env.PORT}`);
  } catch (error) {
    app.log.error(error, 'failed to start server');
    process.exit(1);
  }
};

void start();
