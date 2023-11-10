import { IPaymentTx } from '../../../common/interfaces/pay';
import { BaseValidatedTxnWrap } from './baseValidatedTxnWrap';

///
// Base implementation of the transactions type interface, for use in the export wrapper class below.
///
class PaymentTx implements IPaymentTx {
  type: string | undefined = undefined;
  amount: BigInt = BigInt(0);
  from: string | undefined = undefined;
  to: string | undefined = undefined;
  closeRemainderTo?: string | null = null;
  reKeyTo?: any = null;
  fee?: number = 0;
  firstRound: number | undefined = undefined;
  lastRound: number | undefined = undefined;
  note?: string | null = null;
  genesisID: string | undefined = undefined;
  genesisHash: any = undefined;
  group?: string | null = null;
  lease?: any = null;
  flatFee?: any = null;
  name?: string | null = null;
  tag?: string | null = null;
}

///
// Mapping, validation and error checking for pay transactions prior to sign.
///
export class PayTransaction extends BaseValidatedTxnWrap {
  txDerivedTypeText: string = 'Pay Algos';
  constructor(params: IPaymentTx) {
    super(params, PaymentTx);
  }
}
