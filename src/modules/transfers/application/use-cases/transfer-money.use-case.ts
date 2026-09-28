import {
  InsufficientFundsError,
  InvalidTransferAmountError,
  SameAccountTransferError,
} from '../../domain/transfer.errors.js';
import { assertTransferIsValid } from '../../domain/transfer.js';
import type { AccountRepositoryPort } from '../ports/account-repository.port.js';
import type {
  TransferMoneyInput,
  TransferMoneyOutput,
  TransferRejectionReason,
} from '../types/transfer-money.types.js';

export class TransferMoneyUseCase {
  constructor(private readonly accounts: AccountRepositoryPort) {}

  async execute(input: TransferMoneyInput): Promise<TransferMoneyOutput> {
    const validationError = this.validateInput(input);

    if (validationError) {
      return validationError;
    }

    const [source, destination] = await Promise.all([
      this.accounts.findById(input.sourceAccountId),
      this.accounts.findById(input.destinationAccountId),
    ]);

    if (!source || !destination) {
      return this.reject('ACCOUNT_NOT_FOUND', 'One or both accounts do not exist.');
    }

    try {
      source.ensureCanDebit(input.amountInCents);
    } catch (error) {
      if (error instanceof InsufficientFundsError) {
        return this.reject('INSUFFICIENT_FUNDS', error.message);
      }

      throw error;
    }

    const transferId = await this.accounts.persistTransfer(input);

    if (!transferId) {
      return this.reject('CONCURRENT_UPDATE', 'The source balance changed. Retry the transfer.');
    }

    return {
      status: 'completed',
      transferId,
      ...input,
    };
  }

  private validateInput(
    input: TransferMoneyInput,
  ): Extract<TransferMoneyOutput, { status: 'rejected' }> | null {
    try {
      assertTransferIsValid(input.sourceAccountId, input.destinationAccountId, input.amountInCents);

      return null;
    } catch (error) {
      if (error instanceof InvalidTransferAmountError) {
        return this.reject('INVALID_AMOUNT', error.message);
      }

      if (error instanceof SameAccountTransferError) {
        return this.reject('SAME_ACCOUNT', error.message);
      }

      throw error;
    }
  }

  private reject(
    reason: TransferRejectionReason,
    message: string,
  ): Extract<TransferMoneyOutput, { status: 'rejected' }> {
    return { status: 'rejected', reason, message };
  }
}
