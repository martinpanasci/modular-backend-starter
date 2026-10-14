import type { Account } from '../../domain/account.js';
import type { PersistTransferInput } from '../types/transfer-money.types.js';

export abstract class AccountRepositoryPort {
  abstract findById(id: string): Promise<Account | null>;

  abstract persistTransfer(input: PersistTransferInput): Promise<string | null>;
}
