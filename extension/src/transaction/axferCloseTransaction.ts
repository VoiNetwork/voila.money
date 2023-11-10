import { RequestError } from '../../../common/errors';
import { IAssetCloseTx } from '../../../common/interfaces/axfer_close';
import { BaseValidatedTxnWrap } from './baseValidatedTxnWrap';

///
// Base implementation of the transactions type interface, for use in the export wrapper class below.
///
class AssetCloseTx implements IAssetCloseTx {
  type: string | undefined = undefined;
  assetIndex: number | undefined = undefined;
  from: string | undefined = undefined;
  fee?: number = 0;
  to: any = undefined;
  closeRemainderTo: string | undefined = undefined;
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
export class AssetCloseTransaction extends BaseValidatedTxnWrap {
  txDerivedTypeText: string = 'Asset Opt-Out';
  constructor(params: IAssetCloseTx) {
    super(params, AssetCloseTx);
    // Additional check to verify that address from and to are the same
    if (this.transaction && this.transaction['to'] !== this.transaction['from']) {
      throw RequestError.InvalidTransactionStructure(
        `Creation of AssetCloseTx has non identical to and from fields.`
      );
    }
  }
}
