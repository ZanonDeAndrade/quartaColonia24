import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { config as loadEnv } from 'dotenv';
import { FieldValue } from 'firebase-admin/firestore';
import { getEnv } from '../server/src/config/env.js';
import { initFirebase } from '../server/src/config/firebase.js';

const buildDownloadUrl = (bucket: string, imagePath: string, token: string) =>
  `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(imagePath)}?alt=media&token=${token}`;

const run = async () => {
  loadEnv({ path: path.resolve(process.cwd(), 'server/.env') });

  const env = getEnv();
  const { firestore, storage } = initFirebase(env);
  const bucket = storage.bucket(env.FIREBASE_STORAGE_BUCKET);
  const newsCollection = firestore.collection('news');
  const snapshot = await newsCollection.get();

  let updated = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data() as Record<string, unknown>;
    const updates: Record<string, unknown> = {};
    const imagePaths = new Set<string>();

    const topImagePath = typeof data.imagePath === 'string' ? data.imagePath : null;
    if (topImagePath) imagePaths.add(topImagePath);

    const imageVariants = data.imageVariants as
      | {
          thumbnail?: { path?: string; url?: string; width?: number };
          card?: { path?: string; url?: string; width?: number };
          hero?: { path?: string; url?: string; width?: number };
        }
      | undefined;

    const variantPaths = {
      thumbnail: imageVariants?.thumbnail?.path,
      card: imageVariants?.card?.path,
      hero: imageVariants?.hero?.path
    };

    for (const variantPath of Object.values(variantPaths)) {
      if (typeof variantPath === 'string' && variantPath) imagePaths.add(variantPath);
    }

    if (imagePaths.size === 0) continue;

    const tokenByPath = new Map<string, string>();
    for (const imagePath of imagePaths) {
      const file = bucket.file(imagePath);
      const [exists] = await file.exists();
      if (!exists) continue;

      const [metadata] = await file.getMetadata();
      const existingRaw = metadata.metadata?.firebaseStorageDownloadTokens ?? '';
      const existingToken = existingRaw.split(',').map((value) => value.trim()).find(Boolean);
      const token = existingToken ?? randomUUID();

      if (!existingToken) {
        await file.setMetadata({
          metadata: {
            ...(metadata.metadata ?? {}),
            firebaseStorageDownloadTokens: token
          }
        });
      }

      tokenByPath.set(imagePath, token);
    }

    if (topImagePath && tokenByPath.has(topImagePath)) {
      updates.imageUrl = buildDownloadUrl(env.FIREBASE_STORAGE_BUCKET, topImagePath, tokenByPath.get(topImagePath) as string);
    }

    if (imageVariants) {
      const nextVariants: Record<string, unknown> = {};
      for (const key of ['thumbnail', 'card', 'hero'] as const) {
        const variant = imageVariants[key];
        if (!variant?.path) continue;
        const token = tokenByPath.get(variant.path);
        if (!token) continue;

        nextVariants[key] = {
          ...variant,
          url: buildDownloadUrl(env.FIREBASE_STORAGE_BUCKET, variant.path, token)
        };
      }

      if (Object.keys(nextVariants).length > 0) {
        updates.imageVariants = {
          ...(imageVariants ?? {}),
          ...nextVariants
        };
      }
    }

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = FieldValue.serverTimestamp();
      await doc.ref.update(updates);
      updated += 1;
    }
  }

  console.log(`[fix-news-image-urls] Processed ${snapshot.size} docs`);
  console.log(`[fix-news-image-urls] Updated ${updated} docs`);
};

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(`[fix-news-image-urls] Failed: ${message}`);
  process.exit(1);
});
