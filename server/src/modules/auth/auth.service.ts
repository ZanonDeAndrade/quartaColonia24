import { AppError } from '../../common/errors.js';
import { hashSha256 } from '../../common/hash.js';
import type { IRefreshTokenRepository } from '../../contracts/repositories.js';
import type { AuthenticatedUser } from '../../types/domain.js';
import { PasswordService } from './password.service.js';
import { TokenService } from './token.service.js';
import { loginBodySchema } from './auth.schemas.js';

interface AdminCredentials {
  username: string;
  passwordHash: string;
}

const ADMIN_PROFILE: AuthenticatedUser = {
  id: 'admin',
  role: 'admin'
};

export class AuthService {
  constructor(
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly refreshTokenTtlMs: number,
    private readonly adminCredentials: AdminCredentials
  ) {}

  async login(username: string, password: string) {
    const credentials = loginBodySchema.parse({ username, password });

    if (credentials.username !== this.adminCredentials.username) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const matches = await this.passwordService.compare(credentials.password, this.adminCredentials.passwordHash);
    if (!matches) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    return this.createTokenBundle();
  }

  async refresh(refreshToken: string) {
    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    const tokenHash = hashSha256(refreshToken);
    const storedToken = await this.refreshTokenRepository.getByHash(tokenHash);

    if (
      !storedToken ||
      storedToken.userId !== payload.userId ||
      storedToken.expiresAt.getTime() <= Date.now() ||
      payload.userId !== ADMIN_PROFILE.id ||
      payload.role !== ADMIN_PROFILE.role
    ) {
      throw new AppError('Refresh token not valid', 401, 'INVALID_REFRESH_TOKEN');
    }

    await this.refreshTokenRepository.deleteByHash(tokenHash);
    return this.createTokenBundle();
  }

  async logout(refreshToken: string) {
    const tokenHash = hashSha256(refreshToken);
    await this.refreshTokenRepository.deleteByHash(tokenHash);
    return { success: true };
  }

  async me(userId: string): Promise<AuthenticatedUser> {
    if (userId !== ADMIN_PROFILE.id) {
      throw new AppError('Not authenticated', 401, 'NOT_AUTHENTICATED');
    }

    return ADMIN_PROFILE;
  }

  private async createTokenBundle() {
    const accessToken = this.tokenService.signAccessToken(ADMIN_PROFILE);
    const refreshToken = this.tokenService.signRefreshToken(ADMIN_PROFILE);
    const tokenHash = hashSha256(refreshToken);

    await this.refreshTokenRepository.save({
      tokenHash,
      userId: ADMIN_PROFILE.id,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.refreshTokenTtlMs)
    });

    return {
      accessToken,
      refreshToken,
      user: ADMIN_PROFILE
    };
  }
}
