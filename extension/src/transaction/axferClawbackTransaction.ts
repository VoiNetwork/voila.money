import { IAssetClawbackTx } from '../../../common/interfaces/axfer_clawback';
import { BaseValidatedTxnWrap } from './baseValidatedTxnWrap';

///
// Base implementation of the transactions type interface, for use in the export wrapper class below.
///
class AssetClawbackTx implements IAssetClawbackTx {
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
  assetRevocationTarget: string | undefined = undefined;
  flatFee?: any = null;
  name?: string | null = null;
  tag?: string | null = null;
}

///
// Mapping, validation and error checking for axfer clawback transactions prior to sign.
///
export class AssetClawbackTransaction extends BaseValidatedTxnWrap {
  txDerivedTypeText: string = 'Asset Clawback';
  constructor(params: IAssetClawbackTx) {
    super(params, AssetClawbackTx);
  }
}
