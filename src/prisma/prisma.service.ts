import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createDatabaseAdapter } from './adapter';
import type { Environment } from '../config/environment';
import { PrismaClient, type Prisma } from '../generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient<
    Prisma.PrismaClientOptions & { log: [{ emit: 'event'; level: 'query' }] }
  >
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService<Environment, true>) {
    super({
      adapter: createDatabaseAdapter(
        config.get('DATABASE_URL', { infer: true }),
        config.get('DATABASE_POOL_MAX', { infer: true }),
      ),
      log: [{ emit: 'event', level: 'query' }],
    });
    if (
      config.get('NODE_ENV', { infer: true }) === 'development' &&
      config.get('PRISMA_LOG_QUERIES', { infer: true })
    ) {
      const logger = new Logger(PrismaService.name);
      this.$on('query', (event) => {
        logger.debug(`${event.query} (${event.duration}ms)`);
      });
    }
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
