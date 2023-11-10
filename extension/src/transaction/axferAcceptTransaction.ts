import { RequestError } from '../../../common/errors';
import { IAssetAcceptTx } from '../../../common/interfaces/axfer_accept';
import { BaseValidatedTxnWrap } from './baseValidatedTxnWrap';

///
// Base implementation of the transactions type interface, for use in the export wrapper class below.
///
class AssetAcceptTx implements IAssetAcceptTx {
  type: string | undefined = undefined;
  assetIndex: number | undefined = undefined;
  from: string | undefined = undefined;
  fee?: number = 0;
  to: any = undefined;
  firstRound: number | undefined = undefined;
  lastRound: number | undefined = undefined;
  note?: string | null = null;
  genesisID: string | undefined = undefined;
  genesisHash: any = undefined;
  group?: string | null = null;
  lease?: any = null;
  reKeyTo?: any = null;
  amount?: BigInt | null = null;
  flatFee?: any = null;
  name?: string | null = null;
  tag?: string | null = null;
}

///
// Mapping, validation and error checking for axfer accept transactions prior to sign.
///
export class AssetAcceptTransaction extends BaseValidatedTxnWrap {
  txDerivedTypeText: string = 'Asset Opt-In';
  constructor(params: IAssetAcceptTx) {
    super(params, AssetAcceptTx);
    // Additional check to verify that amount is 0 and address from and to are the same
    if (this.transaction && this.transaction['amount'] && this.transaction['amount'] != 0) {
      throw RequestError.InvalidTransactionStructure(`Creation of AssetAcceptTx has an invalid amount.`);
    }
    if (this.transaction && this.transaction['to'] !== this.transaction['from']) {
      throw RequestError.InvalidTransactionStructure(
        `Creation of AssetAcceptTx has non identical to and from fields.`
      );
    }
  }
}
