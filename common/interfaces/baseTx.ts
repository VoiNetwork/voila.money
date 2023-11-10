///
// Mapping interface of allowable base fields for transactions.
///

// prettier-ignore
export interface IBaseTx {
  from: string | undefined,	          //Address	    "snd"	     The address of the account that pays the fee and amount. (Auto set by algosdk as the from.publicKey)
  fee?: number,	                      //uint64	    "fee"	     Paid by the sender to the FeeSink to prevent denial-of-service. The minimum fee on Algorand is currently 1000 microAlgos.
  firstRound: number | undefined,	    //uint64	    "fv"	     The first round for when the transaction is valid. If the transaction is sent prior to this round it will be rejected by the network.
  lastRound: number | undefined,	    //uint64	    "lv"	     The ending round for which the transaction is valid. After this round, the transaction will be rejected by the network.
  note?: string | null,	              //[]byte	    "note"	   Any data up to 1000 bytes. (Buffer is created from the provided value)
  genesisID: string | undefined,      //string	    "gen"	     The human-readable string that identifies the network for the transaction. The genesis ID is found in the genesis block. See the genesis ID for MainNet, TestNet, and BetaNet.
  genesisHash: string,	              //[32]byte	  "gh"	     The hash of the genesis block of the network for which the transaction is valid. See the genesis hash for MainNet, TestNet, and BetaNet.
  group?: string | null,	            //[32]byte	  "grp"	     The group specifies that the transaction is part of a group and, if so, specifies the hash of the transaction group. Assign a group ID to a transaction through the workflow described in the Atomic Transfers Guide.
  lease?: any,	                      //[32]byte	  "lx"	     A lease enforces mutual exclusion of transactions. If this field is nonzero, then once the transaction is confirmed, it acquires the lease identified by the (Sender, Lease) pair of the transaction until the LastValid round passes. While this transaction possesses the lease, no other transaction specifying this lease can be confirmed. A lease is often used in the context of Algorand Smart Contracts to prevent replay attacks. (Buffer is created from the provided value)
  //txType	                          //string	    "type"	   Specifies the type of transaction. This value is automatically generated using any of the developer tools.
  reKeyTo?: any,                      //string      "rekey"    Remapped to reKeyTo for algosdk alignment
  flatFee?: boolean,                  //boolean     "flatFee"
  name?: string | null,               //string      "name
  tag?: string | null,                //string      "tag"
}
