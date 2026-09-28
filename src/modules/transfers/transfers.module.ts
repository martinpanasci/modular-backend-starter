import { Module } from '@nestjs/common';

import { AccountRepositoryPort } from './application/ports/account-repository.port.js';
import { TransferMoneyUseCase } from './application/use-cases/transfer-money.use-case.js';
import { TransfersController } from './infrastructure/controllers/transfers.controller.js';
import { PrismaAccountRepository } from './infrastructure/repositories/prisma-account.repository.js';

@Module({
  controllers: [TransfersController],
  providers: [
    PrismaAccountRepository,
    {
      provide: AccountRepositoryPort,
      useExisting: PrismaAccountRepository,
    },
    {
      provide: TransferMoneyUseCase,
      inject: [AccountRepositoryPort],
      useFactory: (accounts: AccountRepositoryPort) => new TransferMoneyUseCase(accounts),
    },
  ],
})
export class TransfersModule {}
