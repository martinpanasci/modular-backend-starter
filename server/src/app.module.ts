import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';

import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import type { EnvironmentVariables } from './config/environment.schema.js';
import { validateEnvironment } from './config/environment.schema.js';
import { createLoggerConfig } from './config/logger.config.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { TransfersModule } from './modules/transfers/transfers.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ cache: true, isGlobal: true, validate: validateEnvironment }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) =>
        createLoggerConfig(config.get('NODE_ENV', { infer: true })),
    }),
    DatabaseModule,
    HealthModule,
    TransfersModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: HttpExceptionFilter }],
})
export class AppModule {}
