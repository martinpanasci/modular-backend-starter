import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

import type { EnvironmentVariables } from '../config/environment.schema.js';

export function configureApplication(
  app: INestApplication,
  config: ConfigService<EnvironmentVariables, true>,
): void {
  app.setGlobalPrefix('api');
  app.use(helmet());
  app.enableCors({
    credentials: true,
    origin: config.get('CORS_ORIGINS', { infer: true }),
  });
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );
  app.enableShutdownHooks(['SIGINT', 'SIGTERM']);
}
