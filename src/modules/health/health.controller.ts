import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';

import { HealthService } from './health.service.js';
import type { LiveStatus, ReadyStatus } from './health.service.js';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get('live')
  @ApiOperation({ summary: 'Confirm that the Nest process is alive' })
  @ApiOkResponse({ schema: { example: { status: 'ok' } } })
  live(): LiveStatus {
    return this.health.live();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Confirm that required dependencies are available' })
  @ApiOkResponse({ schema: { example: { status: 'ok', database: 'ok' } } })
  @ApiServiceUnavailableResponse({ description: 'PostgreSQL is unavailable' })
  ready(): Promise<ReadyStatus> {
    return this.health.ready();
  }
}
