import { FieldValue, type CollectionReference, type Firestore } from 'firebase-admin/firestore';
import { AppError } from '../../common/errors.js';
import type {
  CreateNewsInput,
  INewsRepository,
  ListAdminNewsInput,
  ListPublicNewsInput,
  UpdateNewsInput
} from '../../contracts/repositories.js';
import type { NewsEntity, NewsImageVariants, PaginationResult } from '../../types/domain.js';
import { toDate } from '../../common/time.js';

interface NewsDocImageVariant {
  path?: string;
  url?: string;
  width?: number;
}

interface NewsDocImageVariants {
  thumbnail?: NewsDocImageVariant;
  card?: NewsDocImageVariant;
  hero?: NewsDocImageVariant;
}

interface NewsDoc {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  status: NewsEntity['status'];
  imagePath?: string | null;
  imageUrl?: string | null;
  imageVariants?: NewsDocImageVariants | null;
  coverPath?: string | null;
  coverUrl?: string | null;
  publishedAt: unknown;
  createdAt: unknown;
  updatedAt: unknown;
}

export class FirestoreNewsRepository implements INewsRepository {
  private readonly collection: CollectionReference<NewsDoc>;

  constructor(private readonly firestore: Firestore) {
    this.collection = this.firestore.collection('news') as CollectionReference<NewsDoc>;
  }

  async listPublished(input: ListPublicNewsInput): Promise<PaginationResult<NewsEntity>> {
    try {
      const snapshot = await this.collection.where('status', '==', 'published').get();
      const ordered = snapshot.docs
        .map((doc) => this.mapDoc(doc.id, doc.data()))
        .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));

      const startIndex = input.cursor ? ordered.findIndex((item) => item.id === input.cursor) + 1 : 0;
      const from = Math.max(startIndex, 0);
      const items = ordered.slice(from, from + input.pageSize);
      const nextCursor = ordered.length > from + input.pageSize ? items[items.length - 1]?.id ?? null : null;

      return { items, nextCursor };
    } catch (error) {
      throw this.wrapFirebaseError(error);
    }
  }

  async listPublishedForSitemap(): Promise<Array<Pick<NewsEntity, 'slug' | 'updatedAt' | 'publishedAt'>>> {
    try {
      const snapshot = await this.collection.where('status', '==', 'published').get();
      return snapshot.docs
        .map((doc) => this.mapDoc(doc.id, doc.data()))
        .filter((item) => Boolean(item.slug))
        .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0))
        .map((item) => ({
          slug: item.slug,
          updatedAt: item.updatedAt,
          publishedAt: item.publishedAt
        }));
    } catch (error) {
      throw this.wrapFirebaseError(error);
    }
  }

  async getPublishedBySlug(slug: string): Promise<NewsEntity | null> {
    try {
      const snapshot = await this.collection.where('slug', '==', slug).limit(1).get();

      const doc = snapshot.docs[0];
      if (!doc) return null;

      const mapped = this.mapDoc(doc.id, doc.data());
      if (mapped.status !== 'published') return null;
      return mapped;
    } catch (error) {
      throw this.wrapFirebaseError(error);
    }
  }

  async listAdmin(input: ListAdminNewsInput): Promise<PaginationResult<NewsEntity>> {
    try {
      const snapshot = await this.collection.get();
      let items = snapshot.docs.map((doc) => this.mapDoc(doc.id, doc.data()));

      if (input.status) {
        items = items.filter((news) => news.status === input.status);
      }

      if (input.category) {
        items = items.filter((news) => news.category === input.category);
      }

      if (input.search) {
        const term = input.search.toLowerCase();
        items = items.filter((news) =>
          [news.title, news.excerpt, news.content, news.slug, news.category].join(' ').toLowerCase().includes(term)
        );
      }

      items.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      const startIndex = input.cursor ? items.findIndex((item) => item.id === input.cursor) + 1 : 0;
      const from = Math.max(startIndex, 0);
      const page = items.slice(from, from + input.pageSize);
      const nextCursor = items.length > from + input.pageSize ? page[page.length - 1]?.id ?? null : null;

      return { items: page, nextCursor };
    } catch (error) {
      throw this.wrapFirebaseError(error);
    }
  }

  async getById(id: string): Promise<NewsEntity | null> {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) return null;
      return this.mapDoc(doc.id, doc.data() as NewsDoc);
    } catch (error) {
      throw this.wrapFirebaseError(error);
    }
  }

  async getBySlug(slug: string): Promise<NewsEntity | null> {
    try {
      const snapshot = await this.collection.where('slug', '==', slug).limit(1).get();
      const doc = snapshot.docs[0];
      if (!doc) return null;
      return this.mapDoc(doc.id, doc.data());
    } catch (error) {
      throw this.wrapFirebaseError(error);
    }
  }

  async create(input: CreateNewsInput): Promise<NewsEntity> {
    try {
      const docRef = this.collection.doc();

      const payload: NewsDoc = {
        ...input,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        publishedAt: input.publishedAt
      };

      await docRef.set(payload);
      const created = await docRef.get();
      return this.mapDoc(created.id, created.data() as NewsDoc);
    } catch (error) {
      throw this.wrapFirebaseError(error);
    }
  }

  async update(id: string, input: UpdateNewsInput): Promise<NewsEntity> {
    try {
      const docRef = this.collection.doc(id);
      const current = await docRef.get();
      if (!current.exists) {
        throw new AppError('News not found', 404, 'NEWS_NOT_FOUND');
      }

      const data = {
        ...input,
        updatedAt: FieldValue.serverTimestamp()
      };

      await docRef.update(data);
      const updated = await docRef.get();
      return this.mapDoc(updated.id, updated.data() as NewsDoc);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw this.wrapFirebaseError(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.collection.doc(id).delete();
    } catch (error) {
      throw this.wrapFirebaseError(error);
    }
  }

  private mapDoc(id: string, doc: NewsDoc): NewsEntity {
    return {
      id,
      title: doc.title,
      slug: doc.slug,
      excerpt: doc.excerpt ?? '',
      content: doc.content,
      category: doc.category ?? '',
      tags: Array.isArray(doc.tags) ? doc.tags : [],
      status: doc.status,
      imagePath: doc.imagePath ?? doc.coverPath ?? null,
      imageUrl: doc.imageUrl ?? doc.coverUrl ?? null,
      imageVariants: this.parseImageVariants(doc.imageVariants),
      publishedAt: doc.publishedAt ? toDate(doc.publishedAt, new Date()) : null,
      createdAt: toDate(doc.createdAt),
      updatedAt: toDate(doc.updatedAt)
    };
  }

  private parseImageVariants(value: NewsDocImageVariants | null | undefined): NewsImageVariants | null {
    if (!value) return null;

    const thumbnail = this.parseVariant(value.thumbnail, 400);
    const card = this.parseVariant(value.card, 800);
    const hero = this.parseVariant(value.hero, 1600);

    if (!thumbnail || !card || !hero) return null;
    return { thumbnail, card, hero };
  }

  private parseVariant(value: NewsDocImageVariant | undefined, fallbackWidth: number) {
    if (!value) return null;
    if (!value.path || !value.url) return null;

    return {
      path: value.path,
      url: value.url,
      width: typeof value.width === 'number' && Number.isFinite(value.width) ? value.width : fallbackWidth
    };
  }

  private wrapFirebaseError(error: unknown): AppError {
    return new AppError('Failed to process news data source', 500, 'FIREBASE_ERROR', {
      message: error instanceof Error ? error.message : 'Unknown firebase error'
    });
  }
}
