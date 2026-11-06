import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import type { Environment } from './config/environment';
import { configureHttp } from './config/http';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  configureHttp(app);
  const config = app.get(ConfigService<Environment, true>);
  app.enableShutdownHooks();
  await app.listen(config.get('PORT', { infer: true }), '0.0.0.0');
}

void bootstrap().catch((error: unknown) => {
  Logger.error(error, undefined, 'Bootstrap');
  process.exit(1);
});
