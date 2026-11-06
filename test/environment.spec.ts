import { validateEnvironment } from '../src/config/environment';

describe('Environment validation', () => {
  const databaseUrl = 'postgresql://candidate:dev@localhost:5432/candidate';

  it('uses defaults and accepts a hosting PORT', () => {
    expect(validateEnvironment({ DATABASE_URL: databaseUrl })).toEqual({
      DATABASE_URL: databaseUrl,
      PORT: 3000,
      NODE_ENV: 'development',
      PRISMA_LOG_QUERIES: false,
      DATABASE_POOL_MAX: 5,
      TRUST_PROXY: 'false',
    });
    expect(
      validateEnvironment({
        DATABASE_URL: databaseUrl,
        PORT: '8080',
        NODE_ENV: 'production',
      }),
    ).toEqual({
      DATABASE_URL: databaseUrl,
      PORT: 8080,
      NODE_ENV: 'production',
      PRISMA_LOG_QUERIES: false,
      DATABASE_POOL_MAX: 5,
      TRUST_PROXY: 'false',
    });
  });

  it.each([undefined, '', 'https://example.com/db', 'postgresql://localhost'])(
    'rejects a missing or invalid database URL (%s)',
    (DATABASE_URL) => {
      expect(() => validateEnvironment({ DATABASE_URL })).toThrow(
        'DATABASE_URL',
      );
    },
  );

  it.each(['', '0', '-1', '65536', '3000.5', '3000abc'])(
    'rejects an invalid PORT (%s)',
    (PORT) => {
      expect(() =>
        validateEnvironment({ DATABASE_URL: databaseUrl, PORT }),
      ).toThrow('PORT');
    },
  );

  it('rejects an unsupported NODE_ENV', () => {
    expect(() =>
      validateEnvironment({ DATABASE_URL: databaseUrl, NODE_ENV: 'prod' }),
    ).toThrow('NODE_ENV');
  });

  it.each(['true', '*', '0.0.0.0/0', 'public'])(
    'rejects unsafe or unsupported TRUST_PROXY (%s)',
    (TRUST_PROXY) => {
      expect(() =>
        validateEnvironment({ DATABASE_URL: databaseUrl, TRUST_PROXY }),
      ).toThrow('TRUST_PROXY');
    },
  );

  it.each(['0', '21', '5.5', '', '5abc'])(
    'rejects an invalid pool limit (%s)',
    (DATABASE_POOL_MAX) => {
      expect(() =>
        validateEnvironment({ DATABASE_URL: databaseUrl, DATABASE_POOL_MAX }),
      ).toThrow('DATABASE_POOL_MAX');
    },
  );

  it('enables SQL logging only with an explicit true flag', () => {
    expect(
      validateEnvironment({
        DATABASE_URL: databaseUrl,
        PRISMA_LOG_QUERIES: 'true',
      }),
    ).toHaveProperty('PRISMA_LOG_QUERIES', true);
    expect(() =>
      validateEnvironment({
        DATABASE_URL: databaseUrl,
        PRISMA_LOG_QUERIES: 'yes',
      }),
    ).toThrow('PRISMA_LOG_QUERIES');
  });
});
