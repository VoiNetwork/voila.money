import { IAssetTransferTx } from '../../../common/interfaces/axfer';
import { BaseValidatedTxnWrap } from './baseValidatedTxnWrap';

///
// Base implementation of the transactions type interface, for use in the export wrapper class below.
///
class AssetTransferTx implements IAssetTransferTx {
  type: string | undefined = undefined;
  assetIndex: number | undefined = undefined;
  amount: BigInt = BigInt(0);
  from: string | undefined = undefined;
  to: string | undefined = undefined;
  closeRemainderTo?: string | null = null;
  fee?: number = 0;
  firstRound: number | undefined = undefined;
  lastRound: number | undefined = undefined;
  note?: string | null = null;
  genesisID: string | undefined = undefined;
  genesisHash: any = undefined;
  group?: string | null = null;
  lease?: any = null;
  reKeyTo?: any = null;
  flatFee?: any = null;
  name?: string | null = null;
  tag?: string | null = null;
}

///
// Mapping, validation and error checking for axfer transactions prior to sign.
///
export class AssetTransferTransaction extends BaseValidatedTxnWrap {
  txDerivedTypeText: string = 'Asset Transfer';
  constructor(params: IAssetTransferTx) {
    super(params, AssetTransferTx);
  }
}
