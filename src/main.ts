import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module.js';
import { configureApplication } from './bootstrap/configure-application.js';
import type { EnvironmentVariables } from './config/environment.schema.js';
import { setupSwagger } from './docs/swagger.js';
import { HealthService } from './modules/health/health.service.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService<EnvironmentVariables, true>);
  const logger = app.get<Logger>(Logger);
  app.useLogger(logger);
  configureApplication(app, config);

  if (config.get('NODE_ENV', { infer: true }) !== 'production') {
    setupSwagger(app);
  }

  const port = config.get('PORT', { infer: true });
  const apiUrl = `http://localhost:${String(port)}/api`;

  await app.listen(port);

  logger.log(`[READY] Backend: ${apiUrl}`);
  logger.log(`[LIVE] ${apiUrl}/health/live`);
  logger.log(`[READINESS] ${apiUrl}/health/ready`);

  try {
    await app.get(HealthService).ready();
    logger.log('[DATABASE] PostgreSQL ready');
  } catch {
    logger.warn('[DATABASE] PostgreSQL unavailable; readiness endpoint will return 503');
  }
}

void bootstrap();
