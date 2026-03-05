import { FieldValue, type CollectionReference, type Firestore } from 'firebase-admin/firestore';
import { AppError } from '../../common/errors.js';
import type {
  CreateSponsorInput,
  ISponsorRepository,
  ListSponsorsInput,
  UpdateSponsorInput
} from '../../contracts/repositories.js';
import type { SponsorEntity } from '../../types/domain.js';
import { toDate } from '../../common/time.js';

interface SponsorDoc {
  id?: string;
  name: string;
  imageUrl: string;
  imagePath: string;
  link?: string | null;
  active: boolean;
  order: number;
  createdAt: unknown;
  updatedAt: unknown;
}

export class FirestoreSponsorsRepository implements ISponsorRepository {
  private readonly collection: CollectionReference<SponsorDoc>;

  constructor(private readonly firestore: Firestore) {
    this.collection = this.firestore.collection('sponsors') as CollectionReference<SponsorDoc>;
  }

  async list(input?: ListSponsorsInput): Promise<SponsorEntity[]> {
    try {
      const snapshot = await this.collection.get();
      let items = snapshot.docs.map((doc) => this.mapDoc(doc.id, doc.data()));

      if (typeof input?.active === 'boolean') {
        items = items.filter((item) => item.active === input.active);
      }

      items.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
      return items;
    } catch (error) {
      throw this.wrapFirebaseError(error);
    }
  }

  async getById(id: string): Promise<SponsorEntity | null> {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) return null;
      return this.mapDoc(doc.id, doc.data() as SponsorDoc);
    } catch (error) {
      throw this.wrapFirebaseError(error);
    }
  }

  async create(input: CreateSponsorInput): Promise<SponsorEntity> {
    try {
      const docRef = this.collection.doc();
      const payload: SponsorDoc = {
        id: docRef.id,
        ...input,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };

      await docRef.set(payload);
      const created = await docRef.get();
      return this.mapDoc(created.id, created.data() as SponsorDoc);
    } catch (error) {
      throw this.wrapFirebaseError(error);
    }
  }

  async update(id: string, input: UpdateSponsorInput): Promise<SponsorEntity> {
    try {
      const docRef = this.collection.doc(id);
      const current = await docRef.get();
      if (!current.exists) {
        throw new AppError('Sponsor not found', 404, 'SPONSOR_NOT_FOUND');
      }

      await docRef.update({
        ...input,
        updatedAt: FieldValue.serverTimestamp()
      });

      const updated = await docRef.get();
      return this.mapDoc(updated.id, updated.data() as SponsorDoc);
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

  private mapDoc(id: string, doc: SponsorDoc): SponsorEntity {
    return {
      id: doc.id ?? id,
      name: doc.name,
      imageUrl: doc.imageUrl ?? '',
      imagePath: doc.imagePath ?? '',
      link: doc.link ?? null,
      active: Boolean(doc.active),
      order: Number.isFinite(doc.order) ? doc.order : 0,
      createdAt: toDate(doc.createdAt),
      updatedAt: toDate(doc.updatedAt)
    };
  }

  private wrapFirebaseError(error: unknown): AppError {
    return new AppError('Failed to process sponsors data source', 500, 'FIREBASE_ERROR', {
      message: error instanceof Error ? error.message : 'Unknown firebase error'
    });
  }
}
