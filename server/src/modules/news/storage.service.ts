import { randomUUID } from 'node:crypto';
import path from 'node:path';
import type { IStorageService, UploadResult } from '../../contracts/repositories.js';
import sharp from 'sharp';

const CACHE_CONTROL = 'public, max-age=31536000';

const NEWS_VARIANTS = [
  { key: 'thumbnail' as const, width: 400 },
  { key: 'card' as const, width: 800 },
  { key: 'hero' as const, width: 1600 }
];

export class FirebaseStorageService implements IStorageService {
  constructor(private readonly bucket: { name: string; file: (path: string) => any }) {}

  async uploadNewsImage(input: {
    fileName: string;
    mimeType: string;
    buffer: Buffer;
    previousImagePath?: string | null;
    previousImagePaths?: string[];
  }): Promise<UploadResult> {
    const imageId = randomUUID();
    const uploads = await Promise.all(
      NEWS_VARIANTS.map(async (variant) => {
        const outputBuffer = await sharp(input.buffer)
          .rotate()
          .resize({
            width: variant.width,
            withoutEnlargement: true
          })
          .webp({ quality: 82 })
          .toBuffer();

        const imagePath = path.posix.join('news', `${imageId}-${variant.key}.webp`);
        const file = this.bucket.file(imagePath);
        const downloadToken = randomUUID();

        await file.save(outputBuffer, {
          resumable: false,
          metadata: {
            contentType: 'image/webp',
            cacheControl: CACHE_CONTROL,
            metadata: {
              firebaseStorageDownloadTokens: downloadToken
            }
          }
        });

        return {
          key: variant.key,
          width: variant.width,
          path: imagePath,
          url: this.buildDownloadUrl(imagePath, downloadToken)
        };
      })
    );

    const thumbnail = uploads.find((item) => item.key === 'thumbnail');
    const card = uploads.find((item) => item.key === 'card');
    const hero = uploads.find((item) => item.key === 'hero');

    if (!thumbnail || !card || !hero) {
      throw new Error('Failed to process image variants');
    }

    return {
      imagePath: hero.path,
      imageUrl: hero.url,
      imageVariants: {
        thumbnail: {
          path: thumbnail.path,
          url: thumbnail.url,
          width: thumbnail.width
        },
        card: {
          path: card.path,
          url: card.url,
          width: card.width
        },
        hero: {
          path: hero.path,
          url: hero.url,
          width: hero.width
        }
      }
    };
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
        cacheControl: CACHE_CONTROL,
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
