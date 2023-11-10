import { IKeyRegistrationTx } from '../../../common/interfaces/keyreg';
import { BaseValidatedTxnWrap } from './baseValidatedTxnWrap';

///
// Base implementation of the transactions type interface, for use in the export wrapper class below.
///
class OfflineKeyRegistrationTx implements IKeyRegistrationTx {
  type: string | undefined = undefined;
  stateProofKey?: string | null = null;
  nonParticipation: boolean | undefined = undefined;
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
// Mapping, validation and error checking for keyreg transactions prior to sign.
///
export class OfflineKeyregTransaction extends BaseValidatedTxnWrap {
  txDerivedTypeText: string = 'Offline Key Registration';
  constructor(params: IKeyRegistrationTx) {
    super(params, OfflineKeyRegistrationTx);
  }
}
