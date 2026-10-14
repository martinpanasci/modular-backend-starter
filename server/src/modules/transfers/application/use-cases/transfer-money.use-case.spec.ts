import { Account } from '../../domain/account.js';
import type { AccountRepositoryPort } from '../ports/account-repository.port.js';
import type { TransferMoneyInput } from '../types/transfer-money.types.js';

import { TransferMoneyUseCase } from './transfer-money.use-case.js';

class FakeAccountRepository implements AccountRepositoryPort {
  transferId: string | null = 'transfer-id';
  accounts = new Map<string, Account>();

  findById(id: string): Promise<Account | null> {
    return Promise.resolve(this.accounts.get(id) ?? null);
  }

  persistTransfer(_input: TransferMoneyInput): Promise<string | null> {
    return Promise.resolve(this.transferId);
  }
}

describe('TransferMoneyUseCase', () => {
  const input = {
    sourceAccountId: 'source',
    destinationAccountId: 'destination',
    amountInCents: 100,
  };
  let repository: FakeAccountRepository;
  let useCase: TransferMoneyUseCase;

  beforeEach(() => {
    repository = new FakeAccountRepository();
    repository.accounts.set(
      'source',
      Account.rehydrate({ id: 'source', label: 'Source', balanceInCents: 500 }),
    );
    repository.accounts.set(
      'destination',
      Account.rehydrate({ id: 'destination', label: 'Destination', balanceInCents: 0 }),
    );
    useCase = new TransferMoneyUseCase(repository);
  });

  it('completes a valid transfer', async () => {
    await expect(useCase.execute(input)).resolves.toEqual({
      status: 'completed',
      transferId: 'transfer-id',
      ...input,
    });
  });

  it('rejects a missing account', async () => {
    repository.accounts.delete('destination');
    await expect(useCase.execute(input)).resolves.toMatchObject({
      status: 'rejected',
      reason: 'ACCOUNT_NOT_FOUND',
    });
  });

  it('rejects insufficient funds', async () => {
    await expect(useCase.execute({ ...input, amountInCents: 501 })).resolves.toMatchObject({
      status: 'rejected',
      reason: 'INSUFFICIENT_FUNDS',
    });
  });

  it('reports a concurrent update', async () => {
    repository.transferId = null;
    await expect(useCase.execute(input)).resolves.toMatchObject({
      status: 'rejected',
      reason: 'CONCURRENT_UPDATE',
    });
  });
});
