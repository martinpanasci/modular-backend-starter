import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module.js';

import { DatabaseHealthPort } from './database-health.port.js';
import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';
import { PrismaDatabaseHealthService } from './prisma-database-health.service.js';

@Module({
  imports: [DatabaseModule],
  controllers: [HealthController],
  providers: [
    HealthService,
    PrismaDatabaseHealthService,
    { provide: DatabaseHealthPort, useExisting: PrismaDatabaseHealthService },
  ],
})
export class HealthModule {}
