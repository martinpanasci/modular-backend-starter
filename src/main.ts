import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module.js';
import { configureApplication } from './bootstrap/configure-application.js';
import type { EnvironmentVariables } from './config/environment.schema.js';
import { setupSwagger } from './docs/swagger.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService<EnvironmentVariables, true>);
  app.useLogger(app.get(Logger));
  configureApplication(app, config);

  if (config.get('NODE_ENV', { infer: true }) !== 'production') {
    setupSwagger(app);
  }

  await app.listen(config.get('PORT', { infer: true }));
}

void bootstrap();
