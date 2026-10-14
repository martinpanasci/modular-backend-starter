import { InvalidTransferAmountError, SameAccountTransferError } from './transfer.errors.js';
import { assertTransferIsValid } from './transfer.js';

describe('assertTransferIsValid', () => {
  it('accepts distinct accounts and a positive integer amount', () => {
    expect(() => {
      assertTransferIsValid('source', 'destination', 100);
    }).not.toThrow();
  });

  it.each([0, -1, 1.5, Number.NaN])('rejects invalid amount %s', (amount) => {
    expect(() => {
      assertTransferIsValid('source', 'destination', amount);
    }).toThrow(InvalidTransferAmountError);
  });

  it('rejects transfers to the same account', () => {
    expect(() => {
      assertTransferIsValid('same', 'same', 100);
    }).toThrow(SameAccountTransferError);
  });
});
