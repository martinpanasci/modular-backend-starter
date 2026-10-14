export class InvalidTransferAmountError extends Error {
  constructor() {
    super('Transfer amount must be a positive safe integer.');
    this.name = 'InvalidTransferAmountError';
  }
}

export class SameAccountTransferError extends Error {
  constructor() {
    super('Source and destination accounts must be different.');
    this.name = 'SameAccountTransferError';
  }
}

export class InsufficientFundsError extends Error {
  constructor() {
    super('The source account has insufficient funds.');
    this.name = 'InsufficientFundsError';
  }
}
