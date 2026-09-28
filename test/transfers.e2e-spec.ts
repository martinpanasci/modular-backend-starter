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
import { AccountRepositoryPort } from '../src/modules/transfers/application/ports/account-repository.port.js';
import type { TransferMoneyInput } from '../src/modules/transfers/application/types/transfer-money.types.js';
import { TransferMoneyUseCase } from '../src/modules/transfers/application/use-cases/transfer-money.use-case.js';
import { Account } from '../src/modules/transfers/domain/account.js';
import { TransfersController } from '../src/modules/transfers/infrastructure/controllers/transfers.controller.js';

class FakeAccountRepository implements AccountRepositoryPort {
  findById(id: string): Promise<Account | null> {
    return Promise.resolve(Account.rehydrate({ id, label: id, balanceInCents: 10_000 }));
  }

  persistTransfer(_input: TransferMoneyInput): Promise<string> {
    return Promise.resolve('123e4567-e89b-12d3-a456-426614174000');
  }
}

describe('Transfers HTTP', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [LoggerModule.forRoot(createLoggerConfig('test'))],
      controllers: [TransfersController],
      providers: [
        { provide: APP_FILTER, useClass: HttpExceptionFilter },
        { provide: AccountRepositoryPort, useValue: new FakeAccountRepository() },
        {
          provide: TransferMoneyUseCase,
          inject: [AccountRepositoryPort],
          useFactory: (accounts: AccountRepositoryPort) => new TransferMoneyUseCase(accounts),
        },
      ],
    }).compile();

    app = module.createNestApplication();
    const config = new ConfigService<EnvironmentVariables, true>({
      NODE_ENV: 'test',
      PORT: 3001,
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      CORS_ORIGINS: ['http://localhost:3000'],
    });
    configureApplication(app, config);
    await app.init();
  });

  afterAll(async () => app.close());

  it('returns the expected response for a valid request', async () => {
    const response = await request(app.getHttpServer() as Parameters<typeof request>[0])
      .post('/api/transfers')
      .set('x-request-id', 'integration-test-id')
      .send({
        sourceAccountId: '123e4567-e89b-12d3-a456-426614174000',
        destinationAccountId: '123e4567-e89b-12d3-a456-426614174001',
        amountInCents: 2500,
      })
      .expect(201);

    expect(response.headers['x-request-id']).toBe('integration-test-id');
    expect(response.body as unknown).toMatchObject({ status: 'completed', amountInCents: 2500 });
  });

  it('returns the standard validation error format', async () => {
    const response = await request(app.getHttpServer() as Parameters<typeof request>[0])
      .post('/api/transfers')
      .send({ sourceAccountId: 'invalid', unexpected: true })
      .expect(400);

    expect(response.body as unknown).toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Invalid request',
      path: '/api/transfers',
    });
    const body: unknown = response.body;
    expect(
      typeof body === 'object' && body !== null && 'details' in body && Array.isArray(body.details),
    ).toBe(true);
    expect(
      typeof body === 'object' &&
        body !== null &&
        'requestId' in body &&
        typeof body.requestId === 'string',
    ).toBe(true);
  });
});
