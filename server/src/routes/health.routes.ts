import type { FastifyInstance } from 'fastify';

export const healthRoutes = async (app: FastifyInstance) => {
  app.get('/health', async (_request, reply) => {
    return reply.status(200).send({
      ok: true,
      status: 'ok',
      uptime: process.uptime(),
      timestamp: Date.now()
    });
  });
};
