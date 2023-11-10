import { IBaseTx } from './baseTx';

///
// Mapping interface of allowable fields for axfer accept transactions.
///

// prettier-ignore
export interface IAssetAcceptTx extends IBaseTx {
  type: string | undefined,               //"axfer"
  assetIndex: number | undefined,         //uint64	  "xaid"	  The unique ID of the asset to be transferred.
  amount?: BigInt | null,	          //uint64	  "aamt"	  The amount of the asset to be transferred. A zero amount transferred to self allocates that asset in the account's Asset map.
  to: string,	                //Address	  "arcv"	  The recipient of the asset transfer. Must be self for Asset Accept.
}
