import { IPaymentTx } from '../../../common/interfaces/pay';
import { IAssetConfigTx } from '../../../common/interfaces/acfg';
import { IAssetCreateTx } from '../../../common/interfaces/acfg_create';
import { IAssetDestroyTx } from '../../../common/interfaces/acfg_destroy';
import { IAssetFreezeTx } from '../../../common/interfaces/afrz';
import { IAssetTransferTx } from '../../../common/interfaces/axfer';
import { IAssetAcceptTx } from '../../../common/interfaces/axfer_accept';
import { IAssetCloseTx } from '../../../common/interfaces/axfer_close';
import { IAssetClawbackTx } from '../../../common/interfaces/axfer_clawback';
import { IKeyRegistrationTx } from '../../../common/interfaces/keyreg';
import { IApplTx } from '../../../common/interfaces/appl';
import { PayTransaction } from './payTransaction';
import { AssetConfigTransaction } from './acfgTransaction';
import { AssetCreateTransaction } from './acfgCreateTransaction';
import { AssetDestroyTransaction } from './acfgDestroyTransaction';
import { AssetFreezeTransaction } from './afrzTransaction';
import { AssetTransferTransaction } from './axferTransaction';
import { AssetAcceptTransaction } from './axferAcceptTransaction';
import { AssetCloseTransaction } from './axferCloseTransaction';
import { AssetClawbackTransaction } from './axferClawbackTransaction';
import { OnlineKeyregTransaction } from './keyregOnlineTransaction';
import { OfflineKeyregTransaction } from './keyregOfflineTransaction';
import { ApplicationTransaction } from './applTransaction';
import { TransactionType } from '../../../common/types/transaction';
import { RequestError } from '../../../common/errors';
import { BaseValidatedTxnWrap } from './baseValidatedTxnWrap';
import { removeEmptyFields } from '../../../common/utils';
import algosdk from 'algosdk';
import { NETWORKS } from '../../../core/utils/network';
import { Network } from '../../../common/types';

///
// Sign transaction and return.
///
export function getValidatedTxnWrap(
  txn: object,
  type: string,
): BaseValidatedTxnWrap | undefined {
  let validatedTxnWrap: BaseValidatedTxnWrap | undefined = undefined;
  let error: RequestError | undefined = undefined;

  // We clear the txn object of empty fields
  removeEmptyFields(txn);

  switch (type.toLowerCase()) {
    case TransactionType.Pay:
      validatedTxnWrap = new PayTransaction(txn as IPaymentTx);
      break;
    case TransactionType.Acfg:
      // Validate any of the 3 types of transactions that can occur with acfg
      // Use the first error as the passback error.
      try {
        validatedTxnWrap = new AssetConfigTransaction(txn as IAssetConfigTx);
      } catch (e: any) {
        error = e;
      }
      if (!validatedTxnWrap) {
        try {
          validatedTxnWrap = new AssetCreateTransaction(txn as IAssetCreateTx);
        } catch (e: any) {
          if (error) {
            e.message = [error.message, e.message].join(' ');
          }
          error = e;
        }
      }
      if (!validatedTxnWrap) {
        try {
          validatedTxnWrap = new AssetDestroyTransaction(txn as IAssetDestroyTx);
        } catch (e: any) {
          if (error) {
            e.message = [error.message, e.message].join(' ');
          }
          error = e;
        }
      }
      if (!validatedTxnWrap && error) {
        throw error;
      }
      break;
    case TransactionType.Afrz:
      validatedTxnWrap = new AssetFreezeTransaction(txn as IAssetFreezeTx);
      break;
    case TransactionType.Axfer:
      // Validate any of the 4 types of transactions that can occur with axfer
      // Use the first error as the passback error.
      try {
        validatedTxnWrap = new AssetAcceptTransaction(txn as IAssetAcceptTx);
      } catch (e: any) {
        error = e;
      }
      if (!validatedTxnWrap) {
        try {
          validatedTxnWrap = new AssetCloseTransaction(txn as IAssetCloseTx);
        } catch (e: any) {
          if (error) {
            e.message = [error.message, e.message].join(' ');
          }
          error = e;
        }
      }
      if (!validatedTxnWrap) {
        try {
          validatedTxnWrap = new AssetTransferTransaction(txn as IAssetTransferTx);
        } catch (e: any) {
          if (error) {
            e.message = [error.message, e.message].join(' ');
          }
          error = e;
        }
      }
      if (!validatedTxnWrap) {
        try {
          validatedTxnWrap = new AssetClawbackTransaction(txn as IAssetClawbackTx);
        } catch (e: any) {
          if (error) {
            e.message = [error.message, e.message].join(' ');
          }
          error = e;
        }
      }
      if (!validatedTxnWrap && error) {
        throw error;
      }
      break;
    case TransactionType.Keyreg:
      // Validate any of the 2 variants of transactions that can occur with keyreg
      // Use the second error as the passback error.
      try {
        validatedTxnWrap = new OnlineKeyregTransaction(txn as IKeyRegistrationTx);
      } catch (e: any) {
        error = e;
      }
      if (!validatedTxnWrap) {
        try {
          validatedTxnWrap = new OfflineKeyregTransaction(txn as IKeyRegistrationTx);
        } catch (e: any) {
          if (error) {
            e.message = [error.message, e.message].join(' ');
          }
          error = e;
        }
      }
      if (!validatedTxnWrap && error) {
        throw error;
      }
      break;
    case TransactionType.Appl:
      validatedTxnWrap = new ApplicationTransaction(txn as IApplTx);
      break;
    default:
      throw new Error('Type of transaction not specified or known.');
  }

  return validatedTxnWrap;
}

export function getNetworkNameFromGenesisID(genesisID: string): string {
  // Default the network to mainnet
  const defaultNetwork = 'VoiTestnet';

  // Check Genesis ID for base networks first
  let network = Object.entries(NETWORKS).find((n) => genesisID === n[1].genesisId);
  if (network !== undefined) {
    return network[1].name;
  }
  return defaultNetwork;
}

export function getNetworkFromMixedGenesis(genesisID: string, genesisHash?: string): Network {
  let network;
  let partialMatches;

  // First we check for matching IDs
  if (genesisID) {
    partialMatches = Object.entries(NETWORKS).filter((network) => genesisID === network[1].genesisId);
    // Found matching genesisID, make sure the hash matches if available
    if (genesisHash) {
      network = partialMatches.find((network) => genesisHash === network[1].genesisHash);
    } else if (partialMatches && partialMatches.length) {
      // If no Hash was provided, return the first ID
      network = partialMatches[0];
    }
    if (network !== undefined) {
      if (!genesisHash || genesisHash === network[1].genesisHash) {
        return network[1];
      }
    }
  }

  // We didn't match on the genesis id so check the hashes
  if (genesisHash) {
    network = Object.entries(NETWORKS).find((network) => genesisHash === network[1].genesisHash);
    if (network !== undefined) {
      if (!genesisHash || genesisHash === network[1].genesisHash) {
        return network[1];
      }
    }
  }

  // TODO: Update to mainnet when launch
  return NETWORKS["VoiTestnet"];
}

export function calculateEstimatedFee(transactionWrap: BaseValidatedTxnWrap, params: any): void {
  const transaction = transactionWrap.transaction;
  const minFee = +params['min-fee'];
  let estimatedFee = +transaction['fee'];
  if (transaction['flatFee']) {
    // If flatFee is enabled, we compare the presented fee by the dApp against the
    // Network suggested min-fee and use the min-fee if higher than the presented fee
    if (estimatedFee < minFee) {
      estimatedFee = minFee;
    }
  } else {
    const dappFee = estimatedFee;
    if (dappFee === 0) {
      // If the dApp doesn't suggest a per-byte fee, we use the network suggested total min-fee
      estimatedFee = minFee;
    } else {
      /*
        Since the final fee depends on the transaction size we create a
        dummy replica transaction that's similar to what the SDK eventually sends
        For this we ignore all empty fields and shorten field names to 4 characters 
        so we use smaller field names like the SDK does
        i.e.: the SDK uses 'gen' for 'genesisID', 'amt' for 'amount', etc
      */
      const dummyTransaction: any = {};
      Object.keys(transaction).map((key, index) => {
        if (transaction[key]) {
          dummyTransaction[index.toString().padStart(4, '0')] = transaction[key];
        }
      });
      // We use algosdk to encode our dummy transaction into MessagePack
      // and use the resulting MessagePack to determine an estimate byte size
      const transactionSize: number = algosdk.encodeObj(dummyTransaction).byteLength;
      // Finally we estimate the final fee with the dApp fee
      // and our estimated transaction byte-size
      estimatedFee = dappFee * transactionSize;
    }
  }
  transactionWrap.estimatedFee = estimatedFee;
}
