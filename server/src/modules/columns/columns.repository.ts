import { FieldValue, type CollectionReference, type Firestore } from 'firebase-admin/firestore';
import { AppError } from '../../common/errors.js';
import type {
  CreateColumnInput,
  IColumnRepository,
  ListAdminColumnsInput,
  UpdateColumnInput
} from '../../contracts/repositories.js';
import type { ColumnEntity } from '../../types/domain.js';
import { toDate } from '../../common/time.js';

interface ColumnDoc {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  authorName: string;
  authorSlug: string;
  authorImageUrl?: string | null;
  imageUrl?: string | null;
  imagePath?: string | null;
  published: boolean;
  publishedAt: unknown;
  createdAt: unknown;
  updatedAt: unknown;
}

export class FirestoreColumnsRepository implements IColumnRepository {
  private readonly collection: CollectionReference<ColumnDoc>;

  constructor(private readonly firestore: Firestore) {
    this.collection = this.firestore.collection('columns') as CollectionReference<ColumnDoc>;
  }

  async listPublished(): Promise<ColumnEntity[]> {
    try {
      const snapshot = await this.collection.where('published', '==', true).get();
      return snapshot.docs
        .map((doc) => this.mapDoc(doc.id, doc.data()))
        .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
    } catch (error) {
      throw this.wrapFirebaseError(error);
    }
  }

  async getPublishedBySlug(slug: string): Promise<ColumnEntity | null> {
    try {
      const snapshot = await this.collection.where('slug', '==', slug).limit(1).get();
      const doc = snapshot.docs[0];
      if (!doc) return null;
      const mapped = this.mapDoc(doc.id, doc.data());
      return mapped.published ? mapped : null;
    } catch (error) {
      throw this.wrapFirebaseError(error);
    }
  }

  async listAdmin(input?: ListAdminColumnsInput): Promise<ColumnEntity[]> {
    try {
      const snapshot = await this.collection.get();
      let items = snapshot.docs.map((doc) => this.mapDoc(doc.id, doc.data()));

      if (typeof input?.published === 'boolean') {
        items = items.filter((item) => item.published === input.published);
      }

      if (input?.search) {
        const term = input.search.toLowerCase();
        items = items.filter((item) =>
          [item.title, item.excerpt, item.content, item.authorName, item.slug].join(' ').toLowerCase().includes(term)
        );
      }

      items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return items;
    } catch (error) {
      throw this.wrapFirebaseError(error);
    }
  }

  async getById(id: string): Promise<ColumnEntity | null> {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) return null;
      return this.mapDoc(doc.id, doc.data() as ColumnDoc);
    } catch (error) {
      throw this.wrapFirebaseError(error);
    }
  }

  async getBySlug(slug: string): Promise<ColumnEntity | null> {
    try {
      const snapshot = await this.collection.where('slug', '==', slug).limit(1).get();
      const doc = snapshot.docs[0];
      if (!doc) return null;
      return this.mapDoc(doc.id, doc.data());
    } catch (error) {
      throw this.wrapFirebaseError(error);
    }
  }

  async create(input: CreateColumnInput): Promise<ColumnEntity> {
    try {
      const docRef = this.collection.doc();
      const payload: ColumnDoc = {
        id: docRef.id,
        ...input,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };

      await docRef.set(payload);
      const created = await docRef.get();
      return this.mapDoc(created.id, created.data() as ColumnDoc);
    } catch (error) {
      throw this.wrapFirebaseError(error);
    }
  }

  async update(id: string, input: UpdateColumnInput): Promise<ColumnEntity> {
    try {
      const docRef = this.collection.doc(id);
      const current = await docRef.get();
      if (!current.exists) {
        throw new AppError('Column not found', 404, 'COLUMN_NOT_FOUND');
      }

      await docRef.update({
        ...input,
        updatedAt: FieldValue.serverTimestamp()
      });

      const updated = await docRef.get();
      return this.mapDoc(updated.id, updated.data() as ColumnDoc);
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

  private mapDoc(id: string, doc: ColumnDoc): ColumnEntity {
    return {
      id: doc.id ?? id,
      title: doc.title,
      slug: doc.slug,
      excerpt: doc.excerpt ?? '',
      content: doc.content ?? '',
      authorName: doc.authorName ?? '',
      authorSlug: doc.authorSlug ?? '',
      authorImageUrl: doc.authorImageUrl ?? null,
      imageUrl: doc.imageUrl ?? null,
      imagePath: doc.imagePath ?? null,
      published: Boolean(doc.published),
      publishedAt: doc.publishedAt ? toDate(doc.publishedAt, new Date()) : null,
      createdAt: toDate(doc.createdAt),
      updatedAt: toDate(doc.updatedAt)
    };
  }

  private wrapFirebaseError(error: unknown): AppError {
    return new AppError('Failed to process columns data source', 500, 'FIREBASE_ERROR', {
      message: error instanceof Error ? error.message : 'Unknown firebase error'
    });
  }
}
