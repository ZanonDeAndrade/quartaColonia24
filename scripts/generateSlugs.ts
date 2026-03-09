import path from 'node:path';
import { config as loadEnv } from 'dotenv';
import { FieldValue } from 'firebase-admin/firestore';
import { customAlphabet } from 'nanoid';
import { getEnv } from '../server/src/config/env.js';
import { initFirebase } from '../server/src/config/firebase.js';
import { slugify } from '../server/src/common/slug.js';

const slugSuffix = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 4);

const ensureSlug = (sourceTitle: string, usedSlugs: Set<string>) => {
  const baseSlug = slugify(sourceTitle) || 'noticia';
  let candidate = baseSlug;

  while (usedSlugs.has(candidate)) {
    candidate = `${baseSlug}-${slugSuffix()}`;
  }

  usedSlugs.add(candidate);
  return candidate;
};

const run = async () => {
  loadEnv({ path: path.resolve(process.cwd(), 'server/.env') });

  const env = getEnv();
  const { firestore } = initFirebase(env);
  const newsCollection = firestore.collection('news');

  const snapshot = await newsCollection.get();
  const usedSlugs = new Set<string>();

  for (const doc of snapshot.docs) {
    const data = doc.data() as { slug?: unknown };
    if (typeof data.slug === 'string' && data.slug.trim()) {
      usedSlugs.add(data.slug.trim());
    }
  }

  let updatedCount = 0;
  let batch = firestore.batch();
  let operations = 0;

  const commitBatch = async () => {
    if (operations === 0) return;
    await batch.commit();
    batch = firestore.batch();
    operations = 0;
  };

  for (const doc of snapshot.docs) {
    const data = doc.data() as {
      title?: unknown;
      slug?: unknown;
    };

    if (typeof data.slug === 'string' && data.slug.trim()) {
      continue;
    }

    const title = typeof data.title === 'string' && data.title.trim() ? data.title : 'noticia';
    const slug = ensureSlug(title, usedSlugs);

    batch.update(doc.ref, {
      slug,
      updatedAt: FieldValue.serverTimestamp()
    });

    updatedCount += 1;
    operations += 1;

    if (operations >= 450) {
      await commitBatch();
    }
  }

  await commitBatch();

  console.log(`[generateSlugs] Processed: ${snapshot.size} documents`);
  console.log(`[generateSlugs] Updated: ${updatedCount} documents`);
};

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(`[generateSlugs] Failed: ${message}`);
  process.exit(1);
});
