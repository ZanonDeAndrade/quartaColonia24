import { randomUUID } from 'node:crypto';
import path from 'node:path';
import type { IStorageService, UploadResult } from '../../contracts/repositories.js';

export class FirebaseStorageService implements IStorageService {
  constructor(private readonly bucket: { name: string; file: (path: string) => any }) {}

  async uploadNewsImage(input: {
    fileName: string;
    mimeType: string;
    buffer: Buffer;
    previousImagePath?: string | null;
  }): Promise<UploadResult> {
    return this.uploadImage('news', input);
  }

  async uploadSponsorImage(input: {
    fileName: string;
    mimeType: string;
    buffer: Buffer;
    previousImagePath?: string | null;
  }): Promise<UploadResult> {
    return this.uploadImage('sponsors', input);
  }

  async uploadColumnImage(input: {
    fileName: string;
    mimeType: string;
    buffer: Buffer;
    previousImagePath?: string | null;
  }): Promise<UploadResult> {
    return this.uploadImage('columns', input, 'webp');
  }

  async deleteIfExists(pathname: string | null | undefined): Promise<void> {
    if (!pathname) return;
    const file = this.bucket.file(pathname);
    const [exists] = await file.exists();
    if (exists) {
      await file.delete();
    }
  }

  private resolveExtension(fileName: string, mimeType: string) {
    if (mimeType === 'image/jpeg') return 'jpg';
    if (mimeType === 'image/png') return 'png';
    if (mimeType === 'image/webp') return 'webp';

    const fromName = path.extname(fileName).replace('.', '').trim().toLowerCase();
    return fromName || 'bin';
  }

  private buildDownloadUrl(imagePath: string, downloadToken: string) {
    return `https://firebasestorage.googleapis.com/v0/b/${this.bucket.name}/o/${encodeURIComponent(imagePath)}?alt=media&token=${downloadToken}`;
  }

  private async uploadImage(
    folder: 'news' | 'sponsors' | 'columns',
    input: {
      fileName: string;
      mimeType: string;
      buffer: Buffer;
      previousImagePath?: string | null;
    },
    forcedExtension?: string
  ): Promise<UploadResult> {
    const extension = forcedExtension ?? this.resolveExtension(input.fileName, input.mimeType);
    const fileId = randomUUID();
    const imagePath = path.posix.join(folder, `${fileId}.${extension}`);
    const downloadToken = randomUUID();
    const file = this.bucket.file(imagePath);

    await file.save(input.buffer, {
      resumable: false,
      metadata: {
        contentType: input.mimeType,
        cacheControl: 'public,max-age=86400',
        metadata: {
          firebaseStorageDownloadTokens: downloadToken
        }
      }
    });

    if (input.previousImagePath && input.previousImagePath !== imagePath) {
      await this.deleteIfExists(input.previousImagePath);
    }

    return {
      imagePath,
      imageUrl: this.buildDownloadUrl(imagePath, downloadToken)
    };
  }
}
