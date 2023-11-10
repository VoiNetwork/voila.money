import { IBaseTx } from './baseTx';
///
// Mapping interface of allowable fields for appl transactions.
///

// prettier-ignore
export interface IApplTx extends IBaseTx {
  // NOTE: Most fields are remapped in the algosdk - The comments indicate where they will be mapped too.
  type: string | undefined;               //"appl"

  //apid: number,             //uint64	    "apid"	    ID of the application being configured or empty if creating.
  appIndex: number;

  //apan: number,             //uint64	    "apan"	    Defines what additional actions occur with the transaction. See the OnComplete section of the TEAL spec for details.
  appOnComplete: number;

  //apat?: string,            //Address	    "apat"	    List of accounts in addition to the sender that may be accessed from the application's approval-program and clear-state-program.
  appAccounts?: any[] | null;        //Expects Array[Addresses]

  //apap?: string,            //Address	    "apap"	    Logic executed for every application transaction, except when on-completion is set to "clear". It can read and write global state for the application, as well as account-specific local state. Approval programs may reject the transaction.
  appApprovalProgram?: any;

  //apaa?: any,               //byte[]	    "apaa"	    Transaction specific arguments accessed from the application's approval-program and clear-state-program.
  appArgs?: any[] | null;            //Array: Performs a Buffer.from() for each element

  //apsu?: string,            //Address	    "apsu"	    Logic executed for application transactions with on-completion set to "clear". It can read and write global state for the application, as well as account-specific local state. Clear state programs cannot reject the transaction.
  appClearProgram?: any;

  //apfa?: string,            //Address	    "apfa"	    Lists the applications in addition to the application-id whose global states may be accessed by this application's approval-program and clear-state-program. The access is read-only.
  appForeignApps?: any[] | null;

  //apas?: string,            //Address	    "apas"	    Lists the assets whose AssetParams may be accessed by this application's approval-program and clear-state-program. The access is read-only.
  appForeignAssets?: any[] | null;

  //apgs?: number,            //StateSchema	"apgs"	    Holds the maximum number of global state values defined within a StateSchema object.
  appGlobalInts?: number | null;
  appGlobalByteSlices?: number | null;

  //apls?: number,            //StateSchema	"apls"	    Holds the maximum number of local state values defined within a StateSchema object.
  appLocalInts?: number | null;
  appLocalByteSlices?: number | null;

  //apep?: number             //StateSchema "apep"      Number of additional pages allocated to the application's approval and clear state programs. Each ExtraProgramPages is 2048 bytes. The sum of ApprovalProgram and ClearStateProgram may not exceed 2048*(1+ExtraProgramPages) bytes.
  extraPages?: number | null;

  //apbx?: BoxReference[]     //StateSchema "apbx"      Box 'appIndex' must be a number and 'name' must be an Uint8Array.
  boxes?: any[] | null;
}
