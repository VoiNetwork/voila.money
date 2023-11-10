import { RequestError } from '../../../common/errors';
import { IKeyRegistrationTx } from '../../../common/interfaces/keyreg';
import { BaseValidatedTxnWrap } from './baseValidatedTxnWrap';

///
// Base implementation of the transactions type interface, for use in the export wrapper class below.
///
class OnlineKeyRegistrationTx implements IKeyRegistrationTx {
  type: string | undefined = undefined;
  voteKey: string | undefined = undefined;
  selectionKey: string | undefined = undefined;
  stateProofKey?: string | null = null;
  voteFirst: number | undefined = undefined;
  voteLast: number | undefined = undefined;
  voteKeyDilution: number | undefined = undefined;
  nonParticipation?: boolean = false;
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
export class OnlineKeyregTransaction extends BaseValidatedTxnWrap {
  txDerivedTypeText: string = 'Online Key Registration';
  constructor(params: IKeyRegistrationTx) {
    // Additional checks for Key Regs
    if (params.nonParticipation) {
      throw RequestError.InvalidTransactionStructure(`On creation of OfflineKeyRegistrationTx if nonParticipation is set to true; voteKey, selectionKey, voteFirst, voteLast, and voteKeyDilution must be undefined.`);
    }
    super(params, OnlineKeyRegistrationTx);
  }
}
