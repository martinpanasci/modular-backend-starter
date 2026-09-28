import { InsufficientFundsError } from './transfer.errors.js';

export type AccountSnapshot = Readonly<{
  id: string;
  label: string;
  balanceInCents: number;
}>;

export class Account {
  private constructor(private readonly snapshot: AccountSnapshot) {}

  static rehydrate(snapshot: AccountSnapshot): Account {
    return new Account(snapshot);
  }

  get id(): string {
    return this.snapshot.id;
  }

  ensureCanDebit(amountInCents: number): void {
    if (this.snapshot.balanceInCents < amountInCents) {
      throw new InsufficientFundsError();
    }
  }
}
