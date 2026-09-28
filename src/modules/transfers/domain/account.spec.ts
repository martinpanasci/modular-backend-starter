import { Account } from './account.js';
import { InsufficientFundsError } from './transfer.errors.js';

describe('Account', () => {
  const account = Account.rehydrate({ id: 'account', label: 'Main', balanceInCents: 100 });

  it('allows a debit within the available balance', () => {
    expect(() => {
      account.ensureCanDebit(100);
    }).not.toThrow();
  });

  it('rejects a debit above the available balance', () => {
    expect(() => {
      account.ensureCanDebit(101);
    }).toThrow(InsufficientFundsError);
  });
});
