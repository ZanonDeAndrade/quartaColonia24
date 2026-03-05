import type { FastifyInstance } from 'fastify';
import { NewsController } from './news.controller.js';

export const registerPublicNewsRoutes = async (app: FastifyInstance, controller: NewsController) => {
  app.get('/', async (request) => controller.listPublished(request));
  app.get<{ Params: { slug: string } }>('/:slug', async (request) => controller.getPublishedBySlug(request));
};
