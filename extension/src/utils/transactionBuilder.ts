import { Transaction } from 'algosdk';
import AnyTransaction from 'algosdk/dist/types/types/transactions';
import { Buffer } from 'buffer';

export function buildTransaction(txn: object | any): Transaction {
  const builtTxn = new Transaction(txn as AnyTransaction);
  if (txn['group']) {
    // Remap group field lost from cast
    builtTxn.group = Buffer.from(txn['group'], 'base64');
  }

  return builtTxn;
}
