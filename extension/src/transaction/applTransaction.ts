import { IApplTx } from '../../../common/interfaces/appl';
import { BaseValidatedTxnWrap } from './baseValidatedTxnWrap';

///
// Mapping, validation and error checking for appl transactions prior to sign.
///
export class ApplTx implements IApplTx {
  type: string | undefined = undefined;
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
  appIndex: number = 0;
  appOnComplete: number = 0;
  appAccounts?: any[] | null = null;
  appApprovalProgram?: any = null;
  appArgs?: any[] | null = null;
  appClearProgram?: any = null;
  appForeignApps?: any[] | null = null;
  appForeignAssets?: any[] | null = null;
  appGlobalInts?: number | null = null;
  appGlobalByteSlices?: number | null = null;
  appLocalInts?: number | null = null;
  appLocalByteSlices?: number | null = null;
  extraPages?: number | null = null;
  boxes?: any[] | null = null;
}

///
// Mapping, validation and error checking for appl transactions prior to sign.
///
export class ApplicationTransaction extends BaseValidatedTxnWrap {
  txDerivedTypeText: string = 'Application';
  constructor(params: IApplTx) {
    super(params, ApplTx);
  }
}
