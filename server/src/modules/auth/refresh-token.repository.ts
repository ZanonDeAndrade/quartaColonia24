import type { CollectionReference, Firestore } from 'firebase-admin/firestore';
import { AppError } from '../../common/errors.js';
import type { IRefreshTokenRepository } from '../../contracts/repositories.js';
import type { RefreshTokenEntity } from '../../types/domain.js';
import { toDate } from '../../common/time.js';

interface RefreshTokenDoc {
  tokenHash: string;
  userId: string;
  expiresAt: unknown;
  createdAt: unknown;
}

export class FirestoreRefreshTokenRepository implements IRefreshTokenRepository {
  private readonly collection: CollectionReference<RefreshTokenDoc>;

  constructor(private readonly firestore: Firestore) {
    this.collection = this.firestore.collection('refresh_tokens') as CollectionReference<RefreshTokenDoc>;
  }

  async save(token: RefreshTokenEntity): Promise<void> {
    try {
      await this.collection.doc(token.tokenHash).set({
        tokenHash: token.tokenHash,
        userId: token.userId,
        expiresAt: token.expiresAt,
        createdAt: token.createdAt
      });
    } catch (error) {
      throw this.wrapFirebaseError(error);
    }
  }

  async getByHash(tokenHash: string): Promise<RefreshTokenEntity | null> {
    try {
      const doc = await this.collection.doc(tokenHash).get();
      if (!doc.exists) return null;

      const data = doc.data() as RefreshTokenDoc;
      return {
        tokenHash: data.tokenHash,
        userId: data.userId,
        expiresAt: toDate(data.expiresAt),
        createdAt: toDate(data.createdAt)
      };
    } catch (error) {
      throw this.wrapFirebaseError(error);
    }
  }

  async deleteByHash(tokenHash: string): Promise<void> {
    try {
      await this.collection.doc(tokenHash).delete();
    } catch (error) {
      throw this.wrapFirebaseError(error);
    }
  }

  async deleteByUserId(userId: string): Promise<void> {
    try {
      const snapshot = await this.collection.where('userId', '==', userId).get();
      if (snapshot.empty) return;

      const batch = this.firestore.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    } catch (error) {
      throw this.wrapFirebaseError(error);
    }
  }

  private wrapFirebaseError(error: unknown): AppError {
    return new AppError('Failed to process refresh tokens data source', 500, 'FIREBASE_ERROR', {
      message: error instanceof Error ? error.message : 'Unknown firebase error'
    });
  }
}
