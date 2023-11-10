import { IAssetFreezeTx } from '../../../common/interfaces/afrz';
import { BaseValidatedTxnWrap } from './baseValidatedTxnWrap';

///
// Mapping, validation and error checking for afrz transactions prior to sign.
///
class AssetFreezeTx implements IAssetFreezeTx {
  type: string | undefined = undefined;
  assetIndex: number | undefined = undefined;
  freezeAccount: string | undefined = undefined;
  freezeState?: boolean | null = null;
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
// Mapping, validation and error checking for afrz transactions prior to sign.
///
export class AssetFreezeTransaction extends BaseValidatedTxnWrap {
  txDerivedTypeText: string = 'Freeze Asset';
  constructor(params: IAssetFreezeTx) {
    super(params, AssetFreezeTx);
  }
}
