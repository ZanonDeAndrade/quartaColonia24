import type { IStorageService } from '../contracts/repositories.js';

export class InMemoryStorageService implements IStorageService {
  private readonly paths = new Set<string>();

  async uploadNewsImage(input: {
    fileName: string;
    mimeType: string;
    buffer: Buffer;
    previousImagePath?: string | null;
  }) {
    const imagePath = `news/${input.fileName || 'image'}`;

    this.paths.add(imagePath);
    if (input.previousImagePath) {
      this.paths.delete(input.previousImagePath);
    }

    return {
      imagePath,
      imageUrl: `https://example.test/${imagePath}`
    };
  }

  async uploadSponsorImage(input: {
    fileName: string;
    mimeType: string;
    buffer: Buffer;
    previousImagePath?: string | null;
  }) {
    const imagePath = `sponsors/${input.fileName || 'image'}`;

    this.paths.add(imagePath);
    if (input.previousImagePath) {
      this.paths.delete(input.previousImagePath);
    }

    return {
      imagePath,
      imageUrl: `https://example.test/${imagePath}`
    };
  }

  async uploadColumnImage(input: {
    fileName: string;
    mimeType: string;
    buffer: Buffer;
    previousImagePath?: string | null;
  }) {
    const imagePath = `columns/${input.fileName || 'image'}`;

    this.paths.add(imagePath);
    if (input.previousImagePath) {
      this.paths.delete(input.previousImagePath);
    }

    return {
      imagePath,
      imageUrl: `https://example.test/${imagePath}`
    };
  }

  async deleteIfExists(path: string | null | undefined): Promise<void> {
    if (!path) return;
    this.paths.delete(path);
  }
}
