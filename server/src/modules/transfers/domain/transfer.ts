import { InvalidTransferAmountError, SameAccountTransferError } from './transfer.errors.js';

export function assertTransferIsValid(
  sourceAccountId: string,
  destinationAccountId: string,
  amountInCents: number,
): void {
  if (!Number.isSafeInteger(amountInCents) || amountInCents <= 0) {
    throw new InvalidTransferAmountError();
  }

  if (sourceAccountId === destinationAccountId) {
    throw new SameAccountTransferError();
  }
}
