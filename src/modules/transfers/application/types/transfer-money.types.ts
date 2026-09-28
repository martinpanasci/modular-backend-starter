export type TransferMoneyInput = Readonly<{
  sourceAccountId: string;
  destinationAccountId: string;
  amountInCents: number;
}>;

export type PersistTransferInput = TransferMoneyInput;

export type TransferRejectionReason =
  | 'ACCOUNT_NOT_FOUND'
  | 'CONCURRENT_UPDATE'
  | 'INSUFFICIENT_FUNDS'
  | 'INVALID_AMOUNT'
  | 'SAME_ACCOUNT';

export type TransferMoneyOutput =
  | Readonly<{
      status: 'completed';
      transferId: string;
      sourceAccountId: string;
      destinationAccountId: string;
      amountInCents: number;
    }>
  | Readonly<{
      status: 'rejected';
      reason: TransferRejectionReason;
      message: string;
    }>;
