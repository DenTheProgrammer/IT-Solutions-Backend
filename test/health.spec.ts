import { ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from '../src/health/health.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('HealthService', () => {
  const query = jest.fn<Promise<unknown>, []>();
  let module: TestingModule;
  let health: HealthService;

  beforeEach(async () => {
    query.mockReset();
    module = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: PrismaService, useValue: { $queryRaw: query } },
      ],
    }).compile();
    health = module.get(HealthService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('reports readiness when the database responds', async () => {
    query.mockResolvedValueOnce([{ value: 1 }]);
    await expect(health.check()).resolves.toEqual({ status: 'ok' });
  });

  it('returns 503 without database error details when the database is down', async () => {
    query.mockRejectedValueOnce(new Error('Internal connection details'));
    const expected = new ServiceUnavailableException('Database is unavailable');
    await expect(health.check()).rejects.toMatchObject({
      message: expected.message,
      status: 503,
    });
  });
});
