import type { FastifyInstance } from 'fastify';

export const healthRoutes = async (app: FastifyInstance) => {
  // Endpoint leve para monitoramento externo e keep-alive no Render.
  app.get('/health', async () => ({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now()
  }));
};
