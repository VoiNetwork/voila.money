import { IBaseTx } from './baseTx';

///
// Mapping interface of allowable fields for acfg transactions.
///

// prettier-ignore
export interface IAssetConfigTx extends IBaseTx {
  type: string | undefined,                   //"acfg"
  assetIndex: number | undefined,             //uint64	  "caid"	For re-configure or destroy transactions, this is the unique asset ID. On asset creation, the ID is set to zero.
  assetTotal?: BigInt,                        //uint64	  "t"	    The total number of base units of the asset to create. This number cannot be changed.
  assetDecimals?: number,                     //uint32	  "dc"	  The number of digits to use after the decimal point when displaying the asset. If 0, the asset is not divisible. If 1, the base unit of the asset is in tenths. If 2, the base unit of the asset is in hundredths.
  assetDefaultFrozen?: boolean,               //bool	    "df"	  True to freeze holdings for this asset by default.
  assetUnitName?: string,                     //string	  "un"	  The name of a unit of this asset. Supplied on creation. Example: USDT
  assetName?: string,                         //string	  "an"	  The name of the asset. Supplied on creation. Example: Tether
  assetURL?: string,                          //string    "au"	  Specifies a URL where more information about the asset can be retrieved. Max size is 32 bytes.
  assetMetadataHash?: any,                    //[]byte	  "am"	  This field is intended to be a 32-byte hash of some metadata that is relevant to your asset and/or asset holders. The format of this metadata is up to the application. This field can only be specified upon creation. An example might be the hash of some certificate that acknowledges the digitized asset as the official representation of a particular real-world asset.
  assetManager?: string,                      //Address	  "m"	    The address of the account that can manage the configuration of the asset and destroy it.
  assetReserve?: string,                      //Address	  "r"	    The address of the account that holds the reserve (non-minted) units of the asset. This address has no specific authority in the protocol itself. It is used in the case where you want to signal to holders of your asset that the non-minted units of the asset reside in an account that is different from the default creator account (the sender).
  assetFreeze?: string,		                    //Address	  "f"	    The address of the account used to freeze holdings of this asset. If empty, freezing is not permitted.
  assetClawback?: string,		                  //Address	  "c"	    The address of the account that can clawback holdings of this asset. If empty, clawback is not permitted.
}
