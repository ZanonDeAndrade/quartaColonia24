import { parseAllowedOrigins, resolveAllowedOriginsEnvValue } from '../src/config/cors.js';

describe('CORS config', () => {
  it('should resolve ALLOWED_ORIGINS and split comma-separated values', () => {
    const rawOrigins = resolveAllowedOriginsEnvValue({
      ALLOWED_ORIGINS: ' https://quarta-colonia24-adm.vercel.app, https://quartacolonia24horas.com.br/ '
    });

    const parsedOrigins = parseAllowedOrigins(rawOrigins);

    expect(parsedOrigins).toContain('https://quarta-colonia24-adm.vercel.app');
    expect(parsedOrigins).toContain('https://quartacolonia24horas.com.br');
  });

  it('should keep backward compatibility with legacy CORS_ORIGINS', () => {
    const rawOrigins = resolveAllowedOriginsEnvValue({
      CORS_ORIGINS: 'https://legacy.example.com'
    });

    const parsedOrigins = parseAllowedOrigins(rawOrigins);

    expect(parsedOrigins).toContain('https://legacy.example.com');
  });

  it('should merge ALLOWED_ORIGINS and CORS_ORIGINS when both are present', () => {
    const rawOrigins = resolveAllowedOriginsEnvValue({
      ALLOWED_ORIGINS: 'https://primary.example.com',
      CORS_ORIGINS: 'https://legacy.example.com'
    });

    const parsedOrigins = parseAllowedOrigins(rawOrigins);

    expect(parsedOrigins).toContain('https://primary.example.com');
    expect(parsedOrigins).toContain('https://legacy.example.com');
  });
});
