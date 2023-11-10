import { IBaseTx } from './baseTx';

///
// Mapping interface of allowable fields for acfg destroy transactions.
///

// prettier-ignore
export interface IAssetDestroyTx extends IBaseTx {
  type: string | undefined,                   //"acfg"
  assetIndex: number | undefined,             //uint64	"caid"	For re-configure or destroy transactions, this is the unique asset ID. On asset creation, the ID is set to zero.
}
