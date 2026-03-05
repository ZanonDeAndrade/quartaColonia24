import { AppError } from '../../common/errors.js';
import type { ISponsorRepository, IStorageService } from '../../contracts/repositories.js';

interface CreateSponsorInput {
  name: string;
  link?: string;
  active: boolean;
  order: number;
}

interface UpdateSponsorInput {
  name?: string;
  link?: string;
  active?: boolean;
  order?: number;
}

export class SponsorsService {
  constructor(
    private readonly sponsorsRepository: ISponsorRepository,
    private readonly storageService: IStorageService
  ) {}

  async listPublic() {
    return this.sponsorsRepository.list({ active: true });
  }

  async listAdmin(input: { active?: boolean }) {
    return this.sponsorsRepository.list(input);
  }

  async getAdminById(id: string) {
    const sponsor = await this.sponsorsRepository.getById(id);
    if (!sponsor) {
      throw new AppError('Sponsor not found', 404, 'SPONSOR_NOT_FOUND');
    }

    return sponsor;
  }

  async create(input: CreateSponsorInput) {
    return this.sponsorsRepository.create({
      name: input.name,
      link: this.normalizeLink(input.link),
      active: input.active,
      order: input.order,
      imagePath: '',
      imageUrl: ''
    });
  }

  async update(id: string, input: UpdateSponsorInput) {
    const current = await this.sponsorsRepository.getById(id);
    if (!current) {
      throw new AppError('Sponsor not found', 404, 'SPONSOR_NOT_FOUND');
    }

    const hasLinkField = Object.prototype.hasOwnProperty.call(input, 'link');

    return this.sponsorsRepository.update(id, {
      name: input.name,
      active: input.active,
      order: input.order,
      link: hasLinkField ? this.normalizeLink(input.link) : undefined
    });
  }

  async delete(id: string) {
    const current = await this.sponsorsRepository.getById(id);
    if (!current) {
      throw new AppError('Sponsor not found', 404, 'SPONSOR_NOT_FOUND');
    }

    if (current.imagePath) {
      await this.storageService.deleteIfExists(current.imagePath);
    }

    await this.sponsorsRepository.delete(id);
  }

  async uploadImage(input: { id: string; fileName: string; mimeType: string; buffer: Buffer }) {
    const current = await this.sponsorsRepository.getById(input.id);
    if (!current) {
      throw new AppError('Sponsor not found', 404, 'SPONSOR_NOT_FOUND');
    }

    const uploaded = await this.storageService.uploadSponsorImage({
      fileName: input.fileName,
      mimeType: input.mimeType,
      buffer: input.buffer,
      previousImagePath: current.imagePath
    });

    return this.sponsorsRepository.update(input.id, {
      imagePath: uploaded.imagePath,
      imageUrl: uploaded.imageUrl
    });
  }

  private normalizeLink(link: string | undefined): string | null {
    const trimmed = link?.trim();
    return trimmed ? trimmed : null;
  }
}
