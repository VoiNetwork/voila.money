import { IAssetDestroyTx } from '../../../common/interfaces/acfg_destroy';
import { BaseValidatedTxnWrap } from './baseValidatedTxnWrap';

///
// Mapping, validation and error checking for acfg destroy transactions prior to sign.
///
class AssetDestroyTx implements IAssetDestroyTx {
  type: string | undefined = undefined;
  assetIndex: number | undefined = undefined;
  from: string | undefined = undefined;
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
// Mapping, validation and error checking for acfg destroy transactions prior to sign.
///
export class AssetDestroyTransaction extends BaseValidatedTxnWrap {
  txDerivedTypeText: string = 'Destroy Asset';
  constructor(params: IAssetDestroyTx) {
    super(params, AssetDestroyTx);
  }
}
