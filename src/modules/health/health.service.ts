import { Injectable, ServiceUnavailableException } from '@nestjs/common';

import { DatabaseHealthPort } from './database-health.port.js';

export type LiveStatus = Readonly<{ status: 'ok' }>;
export type ReadyStatus = Readonly<{ status: 'ok'; database: 'ok' }>;

@Injectable()
export class HealthService {
  constructor(private readonly database: DatabaseHealthPort) {}

  live(): LiveStatus {
    return { status: 'ok' };
  }

  async ready(): Promise<ReadyStatus> {
    try {
      await this.database.check();
      return { status: 'ok', database: 'ok' };
    } catch {
      throw new ServiceUnavailableException({
        code: 'DATABASE_UNAVAILABLE',
        message: 'Service is not ready',
        details: [{ dependency: 'database', status: 'error' }],
      });
    }
  }
}
