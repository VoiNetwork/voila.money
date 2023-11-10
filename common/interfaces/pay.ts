import { IBaseTx } from './baseTx';

///
// Mapping interface of allowable fields for pay transactions.
///

// prettier-ignore
export interface IPaymentTx extends IBaseTx {
  type: string | undefined,                 //"pay"
  to: string | undefined,                   //Address	  "rcv"	    The address of the account that receives the amount.
  amount: BigInt,                           //uint64	  "amt"	    The total amount to be sent in microAlgos.
  closeRemainderTo?: string | null,         //Address	  "close"	  When set, it indicates that the transaction is requesting that the Sender account should be closed, and all remaining funds, after the fee and amount are paid, be transferred to this address.
}
