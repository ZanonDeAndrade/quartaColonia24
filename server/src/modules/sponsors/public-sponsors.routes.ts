import type { FastifyInstance } from 'fastify';
import { SponsorsController } from './sponsors.controller.js';

export const registerPublicSponsorsRoutes = async (app: FastifyInstance, controller: SponsorsController) => {
  app.get('/', async () => controller.listPublic());
};
