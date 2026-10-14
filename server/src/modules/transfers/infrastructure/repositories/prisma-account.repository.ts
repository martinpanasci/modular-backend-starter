import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../database/prisma.service.js';
import { AccountRepositoryPort } from '../../application/ports/account-repository.port.js';
import type { PersistTransferInput } from '../../application/types/transfer-money.types.js';
import { Account } from '../../domain/account.js';

@Injectable()
export class PrismaAccountRepository implements AccountRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Account | null> {
    const account = await this.prisma.account.findUnique({
      where: { id },
      select: {
        id: true,
        label: true,
        balanceInCents: true,
      },
    });

    return account ? Account.rehydrate(account) : null;
  }

  async persistTransfer(input: PersistTransferInput): Promise<string | null> {
    return this.prisma.$transaction(
      async (transaction) => {
        const debit = await transaction.account.updateMany({
          where: {
            id: input.sourceAccountId,
            balanceInCents: { gte: input.amountInCents },
          },
          data: {
            balanceInCents: { decrement: input.amountInCents },
          },
        });

        if (debit.count !== 1) {
          return null;
        }

        await transaction.account.update({
          where: { id: input.destinationAccountId },
          data: {
            balanceInCents: { increment: input.amountInCents },
          },
        });

        const transfer = await transaction.transfer.create({
          data: input,
          select: { id: true },
        });

        return transfer.id;
      },
      { isolationLevel: 'Serializable' },
    );
  }
}
