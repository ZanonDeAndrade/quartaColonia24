import type { FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../../common/errors.js';
import type { SponsorEntity } from '../../types/domain.js';
import { SponsorsService } from './sponsors.service.js';
import { adminSponsorsListQuerySchema, createSponsorBodySchema, updateSponsorBodySchema } from './sponsors.schema.js';

const serializeSponsor = (sponsor: SponsorEntity) => ({
  id: sponsor.id,
  name: sponsor.name,
  imageUrl: sponsor.imageUrl,
  imagePath: sponsor.imagePath,
  link: sponsor.link,
  active: sponsor.active,
  order: sponsor.order,
  createdAt: sponsor.createdAt.toISOString(),
  updatedAt: sponsor.updatedAt.toISOString()
});

export class SponsorsController {
  constructor(private readonly sponsorsService: SponsorsService) {}

  async listPublic() {
    const items = await this.sponsorsService.listPublic();
    return { items: items.map(serializeSponsor) };
  }

  async listAdmin(request: FastifyRequest) {
    try {
      const query = adminSponsorsListQuerySchema.parse(request.query);
      const items = await this.sponsorsService.listAdmin(query);
      return { items: items.map(serializeSponsor) };
    } catch (error) {
      this.rethrow(error);
    }
  }

  async create(request: FastifyRequest) {
    try {
      const body = createSponsorBodySchema.parse(request.body);
      const sponsor = await this.sponsorsService.create(body);
      return serializeSponsor(sponsor);
    } catch (error) {
      this.rethrow(error);
    }
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>) {
    try {
      const body = updateSponsorBodySchema.parse(request.body);
      const sponsor = await this.sponsorsService.update(request.params.id, body);
      return serializeSponsor(sponsor);
    } catch (error) {
      this.rethrow(error);
    }
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>) {
    await this.sponsorsService.delete(request.params.id);
    return { success: true };
  }

  async uploadImage(request: FastifyRequest<{ Params: { id: string } }>, maxBytes: number) {
    const file = await request.file();
    if (!file) {
      throw new AppError('Missing file field "image"', 422, 'IMAGE_FILE_REQUIRED');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new AppError('Unsupported image format', 422, 'INVALID_IMAGE_TYPE');
    }

    const buffer = await file.toBuffer();
    if (buffer.byteLength > maxBytes) {
      throw new AppError('Image exceeds maximum file size', 413, 'IMAGE_TOO_LARGE');
    }

    const updated = await this.sponsorsService.uploadImage({
      id: request.params.id,
      fileName: file.filename,
      mimeType: file.mimetype,
      buffer
    });

    return serializeSponsor(updated);
  }

  private rethrow(error: unknown): never {
    if (error instanceof ZodError) {
      throw new AppError('Validation error', 422, 'VALIDATION_ERROR', error.flatten());
    }
    throw error;
  }
}
