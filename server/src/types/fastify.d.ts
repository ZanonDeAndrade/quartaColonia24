import 'fastify';
import type { AuthenticatedUser } from './domain.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}
