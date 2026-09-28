import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { LoggerModule } from 'nestjs-pino';
import request from 'supertest';

import { configureApplication } from '../src/bootstrap/configure-application.js';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter.js';
import type { EnvironmentVariables } from '../src/config/environment.schema.js';
import { createLoggerConfig } from '../src/config/logger.config.js';
import { DatabaseHealthPort } from '../src/modules/health/database-health.port.js';
import { HealthController } from '../src/modules/health/health.controller.js';
import { HealthService } from '../src/modules/health/health.service.js';

class FakeDatabaseHealth implements DatabaseHealthPort {
  available = true;

  check(): Promise<void> {
    return this.available ? Promise.resolve() : Promise.reject(new Error('database unavailable'));
  }
}

describe('Health HTTP', () => {
  let app: INestApplication;
  const database = new FakeDatabaseHealth();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [LoggerModule.forRoot(createLoggerConfig('test'))],
      controllers: [HealthController],
      providers: [
        HealthService,
        { provide: APP_FILTER, useClass: HttpExceptionFilter },
        { provide: DatabaseHealthPort, useValue: database },
      ],
    }).compile();

    app = module.createNestApplication();
    configureApplication(
      app,
      new ConfigService<EnvironmentVariables, true>({
        NODE_ENV: 'test',
        PORT: 3001,
        DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
        CORS_ORIGINS: ['http://localhost:3000'],
      }),
    );
    await app.init();
  });

  afterAll(async () => app.close());

  it('reports liveness without checking the database', async () => {
    database.available = false;
    await request(app.getHttpServer() as Parameters<typeof request>[0])
      .get('/api/health/live')
      .expect(200, { status: 'ok' });
  });

  it('reports readiness when the database is available', async () => {
    database.available = true;
    await request(app.getHttpServer() as Parameters<typeof request>[0])
      .get('/api/health/ready')
      .expect(200, { status: 'ok', database: 'ok' });
  });

  it('returns 503 without exposing database details when unavailable', async () => {
    database.available = false;
    const response = await request(app.getHttpServer() as Parameters<typeof request>[0])
      .get('/api/health/ready')
      .expect(503);
    expect(response.body as unknown).toMatchObject({
      statusCode: 503,
      code: 'DATABASE_UNAVAILABLE',
      message: 'Internal server error',
    });
    expect(JSON.stringify(response.body as unknown)).not.toContain('database unavailable');
  });
});
