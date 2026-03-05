import type { FastifyInstance } from 'fastify';
import { ColumnsController } from './columns.controller.js';

export const registerPublicColumnsRoutes = async (app: FastifyInstance, controller: ColumnsController) => {
  app.get('/', async () => controller.listPublished());
  app.get<{ Params: { slug: string } }>('/:slug', async (request) => controller.getPublishedBySlug(request));
};
