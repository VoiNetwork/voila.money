import { IAssetCreateTx } from '../../../common/interfaces/acfg_create';
import { BaseValidatedTxnWrap } from './baseValidatedTxnWrap';

///
// Mapping, validation and error checking for acfg create transactions prior to sign.
///
class AssetCreateTx implements IAssetCreateTx {
  assetTotal: BigInt | undefined = undefined;
  assetDecimals: number = 0;
  assetDefaultFrozen: boolean = false;
  type: string | undefined = undefined;
  from: string | undefined = undefined;
  fee?: number = 0;
  firstRound: number | undefined = undefined;
  lastRound: number | undefined = undefined;
  note?: string | null = null;
  genesisID: string | undefined = undefined;
  genesisHash: any = undefined;
  assetUnitName?: string | null = null;
  assetName?: string | null = null;
  assetURL?: string | null = null;
  assetMetadataHash?: any = null;
  assetManager?: string | null = null;
  assetReserve?: string | null = null;
  assetFreeze?: string | null = null;
  assetClawback?: string | null = null;
  group?: string | null = null;
  lease?: any = null;
  reKeyTo?: any = null;
  flatFee?: any = null;
  name?: string | null = null;
  tag?: string | null = null;
}

///
// Mapping, validation and error checking for acfg create transactions prior to sign.
///
export class AssetCreateTransaction extends BaseValidatedTxnWrap {
  txDerivedTypeText: string = 'Create Asset';
  constructor(params: IAssetCreateTx) {
    super(params, AssetCreateTx);
  }
}
