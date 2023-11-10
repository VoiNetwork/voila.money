import { IAssetConfigTx } from '../../../common/interfaces/acfg';
import { BaseValidatedTxnWrap } from './baseValidatedTxnWrap';

///
// Mapping, validation and error checking for acfg transactions prior to sign.
///
class AssetConfigTx implements IAssetConfigTx {
  type: string | undefined = undefined;
  assetIndex: number | undefined = undefined;
  from: string | undefined = undefined;
  fee?: number = 0;
  firstRound: number | undefined = undefined;
  lastRound: number | undefined = undefined;
  note?: string | null = null;
  genesisID: string | undefined = undefined;
  genesisHash: any | undefined = undefined;
  assetManager: string | undefined = undefined;
  assetReserve: string | undefined = undefined;
  assetFreeze: string | undefined = undefined;
  assetClawback: string | undefined = undefined;
  group?: string | null = null;
  lease?: any = null;
  reKeyTo?: any = null;
  flatFee?: any = null;
  name?: string | null = null;
  tag?: string | null = null;
}

///
// Mapping, validation and error checking for asset config transactions prior to sign.
///
export class AssetConfigTransaction extends BaseValidatedTxnWrap {
  txDerivedTypeText: string = 'Modify Asset';
  constructor(params: IAssetConfigTx) {
    super(params, AssetConfigTx);
  }
}
