import type { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import type { Environment } from './environment';

export function configureHttp(app: NestExpressApplication): void {
  const config = app.get(ConfigService<Environment, true>);
  const trust = config.get('TRUST_PROXY', { infer: true });
  app.set(
    'trust proxy',
    trust === 'private'
      ? ['loopback', 'uniquelocal']
      : trust === 'loopback'
        ? 'loopback'
        : false,
  );
}
