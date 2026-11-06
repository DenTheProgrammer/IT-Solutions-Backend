import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { ApiGraphqlModule } from './graphql/graphql.module';

@Module({
  imports: [AppConfigModule, PrismaModule, HealthModule, ApiGraphqlModule],
})
export class AppModule {}
