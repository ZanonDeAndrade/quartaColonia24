import type { Env } from '../config/env.js';
import { parseDurationToMs } from '../common/duration.js';
import { initFirebase } from '../config/firebase.js';
import { FirestoreRefreshTokenRepository } from '../modules/auth/refresh-token.repository.js';
import { AuthService } from '../modules/auth/auth.service.js';
import { PasswordService } from '../modules/auth/password.service.js';
import { TokenService } from '../modules/auth/token.service.js';
import { FirestoreColumnsRepository } from '../modules/columns/columns.repository.js';
import { ColumnsService } from '../modules/columns/columns.service.js';
import { FirestoreNewsRepository } from '../modules/news/news.repository.js';
import { NewsService } from '../modules/news/news.service.js';
import { FirebaseStorageService } from '../modules/news/storage.service.js';
import { FirestoreSponsorsRepository } from '../modules/sponsors/sponsors.repository.js';
import { SponsorsService } from '../modules/sponsors/sponsors.service.js';

export interface AppServices {
  authService: AuthService;
  newsService: NewsService;
  columnsService: ColumnsService;
  sponsorsService: SponsorsService;
  tokenService: TokenService;
}

export const createDefaultServices = (env: Env): AppServices => {
  const { firestore, storage } = initFirebase(env);

  const refreshRepository = new FirestoreRefreshTokenRepository(firestore);
  const newsRepository = new FirestoreNewsRepository(firestore);
  const columnsRepository = new FirestoreColumnsRepository(firestore);
  const sponsorsRepository = new FirestoreSponsorsRepository(firestore);
  const storageService = new FirebaseStorageService(storage.bucket(env.FIREBASE_STORAGE_BUCKET));

  const passwordService = new PasswordService();
  const tokenService = new TokenService({
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN
  });

  const authService = new AuthService(
    refreshRepository,
    passwordService,
    tokenService,
    parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN),
    {
      username: env.ADMIN_USERNAME,
      passwordHash: env.ADMIN_PASSWORD_HASH
    }
  );
  const newsService = new NewsService(newsRepository, storageService);
  const columnsService = new ColumnsService(columnsRepository, storageService);
  const sponsorsService = new SponsorsService(sponsorsRepository, storageService);

  return { authService, newsService, columnsService, sponsorsService, tokenService };
};
