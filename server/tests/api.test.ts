import { buildApp } from '../src/app.js';
import { AuthService } from '../src/modules/auth/auth.service.js';
import { PasswordService } from '../src/modules/auth/password.service.js';
import { TokenService } from '../src/modules/auth/token.service.js';
import { ColumnsService } from '../src/modules/columns/columns.service.js';
import { NewsService } from '../src/modules/news/news.service.js';
import { SponsorsService } from '../src/modules/sponsors/sponsors.service.js';
import {
  InMemoryColumnsRepository,
  InMemoryNewsRepository,
  InMemoryRefreshTokenRepository,
  InMemorySponsorsRepository
} from '../src/testing/in-memory.repositories.js';
import { InMemoryStorageService } from '../src/testing/in-memory.storage.js';

const createTestContext = async () => {
  const refreshRepository = new InMemoryRefreshTokenRepository();
  const newsRepository = new InMemoryNewsRepository();
  const columnsRepository = new InMemoryColumnsRepository();
  const sponsorsRepository = new InMemorySponsorsRepository();
  const storageService = new InMemoryStorageService();
  const passwordService = new PasswordService();
  const adminPassword = '12345678';
  const adminPasswordHash = await passwordService.hash(adminPassword);
  const tokenService = new TokenService({
    accessSecret: 'a'.repeat(40),
    refreshSecret: 'b'.repeat(40),
    accessExpiresIn: '15m',
    refreshExpiresIn: '30d'
  });

  const authService = new AuthService(
    refreshRepository,
    passwordService,
    tokenService,
    30 * 86400000,
    {
      username: 'admin',
      passwordHash: adminPasswordHash
    }
  );
  const newsService = new NewsService(newsRepository, storageService);
  const columnsService = new ColumnsService(columnsRepository, storageService);
  const sponsorsService = new SponsorsService(sponsorsRepository, storageService);

  const app = await buildApp({
    env: {
      CORS_ORIGINS: [
        'http://localhost:5173',
        'https://quarta-colonia24-quarta-colonia.vercel.app',
        'https://quarta-colonia24-adm.vercel.app'
      ],
      UPLOAD_MAX_BYTES: 1024 * 1024
    },
    services: {
      authService,
      newsService,
      columnsService,
      sponsorsService,
      tokenService
    }
  });

  return {
    app,
    newsService,
    adminPassword
  };
};

describe('API', () => {
  const loginAsAdmin = async (app: Awaited<ReturnType<typeof createTestContext>>['app'], password: string) => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        username: 'admin',
        password
      }
    });

    expect(response.statusCode).toBe(200);
    return response.json() as { accessToken: string; refreshToken: string };
  };

  it('should login with valid credentials', async () => {
    const { app, adminPassword } = await createTestContext();

    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        username: 'admin',
        password: adminPassword
      }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.accessToken).toBeTypeOf('string');
    expect(body.refreshToken).toBeTypeOf('string');
    expect(body.user.role).toBe('admin');
    expect(body.user.id).toBe('admin');

    await app.close();
  });

  it('should return fixed admin profile on /api/auth/me', async () => {
    const { app, adminPassword } = await createTestContext();
    const { accessToken } = await loginAsAdmin(app, adminPassword);

    const meResponse = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    });

    expect(meResponse.statusCode).toBe(200);
    expect(meResponse.json()).toEqual({
      id: 'admin',
      role: 'admin'
    });

    await app.close();
  });

  it('should refresh tokens with valid refresh token', async () => {
    const { app, adminPassword } = await createTestContext();
    const { refreshToken } = await loginAsAdmin(app, adminPassword);

    const refreshResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/refresh',
      payload: {
        refreshToken
      }
    });

    expect(refreshResponse.statusCode).toBe(200);
    const refreshed = refreshResponse.json();
    expect(refreshed.accessToken).toBeTypeOf('string');
    expect(refreshed.refreshToken).toBeTypeOf('string');
    expect(refreshed.user).toEqual({
      id: 'admin',
      role: 'admin'
    });

    await app.close();
  });

  it('should list only published news in public endpoint', async () => {
    const { app, newsService } = await createTestContext();

    await newsService.create({
      title: 'Draft News',
      excerpt: 'draft',
      content: 'draft content body',
      category: 'general',
      tags: [],
      status: 'draft'
    });

    await newsService.create({
      title: 'Published News',
      excerpt: 'published',
      content: 'published content body',
      category: 'general',
      tags: [],
      status: 'published'
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/news'
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.items).toHaveLength(1);
    expect(body.items[0].status).toBe('published');

    await app.close();
  });

  it('should return CORS headers for allowed origins in public endpoints', async () => {
    const { app } = await createTestContext();
    const origin = 'https://quarta-colonia24-quarta-colonia.vercel.app';
    const endpoints = ['/api/news', '/api/columns', '/api/sponsors'];

    for (const endpoint of endpoints) {
      const preflight = await app.inject({
        method: 'OPTIONS',
        url: endpoint,
        headers: {
          origin,
          'access-control-request-method': 'GET',
          'access-control-request-headers': 'Content-Type, Authorization'
        }
      });

      expect(preflight.statusCode).toBe(204);
      expect(preflight.headers['access-control-allow-origin']).toBe(origin);
      expect(preflight.headers['access-control-allow-credentials']).toBe('true');
      expect(preflight.headers['access-control-allow-methods']).toContain('GET');
      expect(preflight.headers['access-control-allow-methods']).toContain('OPTIONS');
      expect(preflight.headers['access-control-allow-headers']).toContain('Content-Type');
      expect(preflight.headers['access-control-allow-headers']).toContain('Authorization');
    }

    await app.close();
  });

  it('should allow admin to create and publish a news article', async () => {
    const { app, adminPassword } = await createTestContext();
    const { accessToken } = await loginAsAdmin(app, adminPassword);

    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/admin/news',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        title: 'Admin Created',
        excerpt: 'excerpt',
        content: 'admin created news content',
        category: 'tech',
        tags: ['tag1']
      }
    });

    expect(createResponse.statusCode).toBe(200);
    const created = createResponse.json();
    expect(created.status).toBe('draft');
    expect(created.slug).toBe('admin-created');

    const publishResponse = await app.inject({
      method: 'PATCH',
      url: `/api/admin/news/${created.id}/publish`,
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        published: true
      }
    });

    expect(publishResponse.statusCode).toBe(200);
    const published = publishResponse.json();
    expect(published.status).toBe('published');
    expect(published.publishedAt).toBeTypeOf('string');

    await app.close();
  });

  it('should manage sponsors in admin endpoints and expose only active sponsors publicly', async () => {
    const { app, adminPassword } = await createTestContext();
    const { accessToken } = await loginAsAdmin(app, adminPassword);

    const createFirst = await app.inject({
      method: 'POST',
      url: '/api/admin/sponsors',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        name: 'Sponsor A',
        link: 'https://sponsor-a.test',
        active: true,
        order: 2
      }
    });

    const createSecond = await app.inject({
      method: 'POST',
      url: '/api/admin/sponsors',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        name: 'Sponsor B',
        active: false,
        order: 1
      }
    });

    const createThird = await app.inject({
      method: 'POST',
      url: '/api/admin/sponsors',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        name: 'Sponsor C',
        active: true,
        order: 0
      }
    });

    expect(createFirst.statusCode).toBe(200);
    expect(createSecond.statusCode).toBe(200);
    expect(createThird.statusCode).toBe(200);

    const sponsorA = createFirst.json() as { id: string; name: string; active: boolean; order: number };
    const sponsorB = createSecond.json() as { id: string; name: string; active: boolean; order: number };

    const publicResponse = await app.inject({
      method: 'GET',
      url: '/api/sponsors'
    });

    expect(publicResponse.statusCode).toBe(200);
    const publicBody = publicResponse.json() as { items: Array<{ name: string; active: boolean; order: number }> };
    expect(publicBody.items).toHaveLength(2);
    expect(publicBody.items.map((item) => item.name)).toEqual(['Sponsor C', 'Sponsor A']);
    expect(publicBody.items.every((item) => item.active)).toBe(true);

    const inactiveAdminResponse = await app.inject({
      method: 'GET',
      url: '/api/admin/sponsors?active=false',
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    });

    expect(inactiveAdminResponse.statusCode).toBe(200);
    const inactiveBody = inactiveAdminResponse.json() as { items: Array<{ id: string; name: string }> };
    expect(inactiveBody.items.map((item) => ({ id: item.id, name: item.name }))).toEqual([
      { id: sponsorB.id, name: 'Sponsor B' }
    ]);

    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/admin/sponsors/${sponsorA.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        active: false,
        order: 4
      }
    });

    expect(updateResponse.statusCode).toBe(200);
    const updated = updateResponse.json() as { active: boolean; order: number };
    expect(updated.active).toBe(false);
    expect(updated.order).toBe(4);

    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/api/admin/sponsors/${sponsorB.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    });

    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.json()).toEqual({ success: true });

    await app.close();
  });

  it('should manage columns in admin endpoints and expose only published columns publicly', async () => {
    const { app, adminPassword } = await createTestContext();
    const { accessToken } = await loginAsAdmin(app, adminPassword);

    const createDraft = await app.inject({
      method: 'POST',
      url: '/api/admin/columns',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        title: 'Analise completa da economia regional em 2026',
        excerpt: 'Uma leitura detalhada sobre os desafios e oportunidades na economia local.',
        content:
          '<p>A economia local passa por um ciclo de mudancas importantes com foco em tecnologia e infraestrutura.</p><script>alert("x")</script><p>Esse movimento cria oportunidades para pequenos negocios e novos investimentos na regiao.</p>',
        authorName: 'Maria Silva'
      }
    });

    const createPublished = await app.inject({
      method: 'POST',
      url: '/api/admin/columns',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        title: 'A importancia da educacao comunitaria para o desenvolvimento',
        excerpt: 'Coluna sobre como projetos comunitarios impactam o futuro de jovens e familias.',
        content:
          '<p>Programas comunitarios de educacao sao fundamentais para ampliar o acesso ao conhecimento.</p><p>Quando bem executados, esses projetos fortalecem escolas, familias e liderancas locais.</p>',
        authorName: 'Joao Pereira',
        published: true
      }
    });

    expect(createDraft.statusCode).toBe(200);
    expect(createPublished.statusCode).toBe(200);

    const createdDraft = createDraft.json() as { id: string; slug: string; published: boolean; authorSlug: string };
    const createdPublished = createPublished.json() as { id: string; slug: string; published: boolean; authorSlug: string };

    expect(createdDraft.published).toBe(false);
    expect(createdDraft.authorSlug).toBe('maria-silva');
    expect(createdPublished.published).toBe(true);

    const publicList = await app.inject({
      method: 'GET',
      url: '/api/columns'
    });

    expect(publicList.statusCode).toBe(200);
    const publicListBody = publicList.json() as { items: Array<{ id: string; slug: string; published: boolean }> };
    expect(publicListBody.items).toHaveLength(1);
    expect(publicListBody.items[0].id).toBe(createdPublished.id);
    expect(publicListBody.items[0].published).toBe(true);

    const publicDetailBeforePublish = await app.inject({
      method: 'GET',
      url: `/api/columns/${createdDraft.slug}`
    });

    expect(publicDetailBeforePublish.statusCode).toBe(404);

    const publishDraft = await app.inject({
      method: 'PATCH',
      url: `/api/admin/columns/${createdDraft.id}/publish`,
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        published: true
      }
    });

    expect(publishDraft.statusCode).toBe(200);
    const publishedDraft = publishDraft.json() as { published: boolean; publishedAt: string | null };
    expect(publishedDraft.published).toBe(true);
    expect(publishedDraft.publishedAt).toBeTypeOf('string');

    const publicDetailAfterPublish = await app.inject({
      method: 'GET',
      url: `/api/columns/${createdDraft.slug}`
    });

    expect(publicDetailAfterPublish.statusCode).toBe(200);
    const detailBody = publicDetailAfterPublish.json() as { id: string; slug: string; content: string };
    expect(detailBody.id).toBe(createdDraft.id);
    expect(detailBody.slug).toBe(createdDraft.slug);
    expect(detailBody.content.includes('<script')).toBe(false);

    const adminListDrafts = await app.inject({
      method: 'GET',
      url: '/api/admin/columns?published=false',
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    });

    expect(adminListDrafts.statusCode).toBe(200);
    const draftBody = adminListDrafts.json() as { items: Array<{ id: string }> };
    expect(draftBody.items).toHaveLength(0);

    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/api/admin/columns/${createdPublished.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    });

    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.json()).toEqual({ success: true });

    await app.close();
  });
});
