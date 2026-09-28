import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service.js';

import { DatabaseHealthPort } from './database-health.port.js';

@Injectable()
export class PrismaDatabaseHealthService implements DatabaseHealthPort {
  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<void> {
    await this.prisma.$queryRaw`SELECT 1`;
  }
}
