import { getNodeClient } from '../../../core/utils/network';
import { Network } from '../../../common/types';
import { BaseValidatedTxnWrap } from '../transaction/baseValidatedTxnWrap';
import logging from '../../../common/logging';
import { ValidationStatus } from '../utils/validator';
import { getValidatedTxnWrap } from '../transaction/actions';
import { buildTransaction } from '../utils/transactionBuilder';
import { get } from './storage';
import { Buffer } from 'buffer';
import { RequestError } from '../../../common/errors';
import { extensionBrowser } from '../../../common/chrome';
// @ts-ignore
import arc200 from 'arc200js';

// Popup properties accounts for additional space needed for the title bar
const titleBarHeight = 28;
const popupProperties = {
  type: 'popup',
  focused: true,
  width: 400,
  height: 660 + titleBarHeight,
};

const requests: { [key: string]: any } = {};
let authorized_pool: Array<string> = [];
let authorized_pool_details: any = {};

export function clearPool() {
  authorized_pool = [];
  authorized_pool_details = {};
}

export function isAuthorized(origin: string): boolean {
  return authorized_pool.indexOf(origin) > -1;
}

export function isPreAuthorized(
  origin: string,
  genesisID: string,
  requestedAccounts: Array<any>
): boolean {
  // Validate the origin is in the authorized pool
  if (authorized_pool.indexOf(origin) === -1) {
    return false;
  }

  // Validate the genesisID is previously authorized
  if (
    !authorized_pool_details[origin] ||
    !(authorized_pool_details[origin]['genesisID'] === genesisID)
  ) {
    return false;
  }

  // Validate the requested accounts exist in the pool detail
  for (let i = 0; i < requestedAccounts.length; i++) {
    if (
      !authorized_pool_details[origin].accounts.includes(requestedAccounts[i])
    ) {
      return false;
    }
  }

  // We made it through negative checks to accounts are currently authroized
  return true;
}

function checkAccountIsImportedAndAuthorized(
  network: string,
  genesisID: string,
  genesisHash: string,
  address: string,
  origin: string
): void {
  // Legacy authorized and internal calls will not have an origin in authorized pool details
  if (authorized_pool_details[origin]) {
    // This must be a dApp using enable - verify the ledger and address are authorized
    if (
      authorized_pool_details[origin]['genesisID'] !== genesisID ||
      authorized_pool_details[origin]['ledger'] !== network ||
      (genesisHash &&
        authorized_pool_details[origin]['genesisHash'] !== genesisHash) ||
      !authorized_pool_details[origin]['accounts'].includes(address)
    ) {
      throw RequestError.NoAccountMatch(address, network);
    }
  }
  // Call the normal account check
  checkAccountIsImported(genesisID, address);
}

export async function signTokenTransactions(data: {
  request: { appId: string, fromAddress: string, toAddress: string, network: Network, amount: string }
}): Promise<object> {
  const { appId, fromAddress, toAddress, network, amount } = data.request;
  const sk = (await get<Uint8Array>(fromAddress)) as Uint8Array;
  if (!sk) {
    throw new Error('Account not found.');
  }
  let keyArray: number[] = [];
  for (const [key, value] of Object.entries(sk)) {
    keyArray.push(value);
  }
  const uintSK = new Uint8Array(keyArray);
  const numberId = Number.parseInt(appId || '');
  const parsedAmount = BigInt(amount);
  const algod = getNodeClient(network);
  const opts = { acc: { addr: fromAddress, sk: uintSK }, simulate: true, formatBytes: true }
  const ci = new arc200(numberId, algod, opts);
  const response = await ci.arc200_transfer(toAddress, parsedAmount, false, true);
  return response;
}

export async function signTransactions(data: {
  request: { address: string; network: Network; txnParams: any };
}): Promise<object> {
  const { network, address, txnParams } = data.request;
  const algod = getNodeClient(network);
  const params = await algod.getTransactionParams().do();
  const txn = {
    ...txnParams,
    amount: BigInt(txnParams.amount),
    fee: params.fee,
    firstRound: params.firstRound,
    lastRound: params.lastRound,
    genesisID: params.genesisID,
    genesisHash: params.genesisHash,
  };
  if ('note' in txn) txn.note = new Uint8Array(Buffer.from(txn.note));

  let transactionWrap: BaseValidatedTxnWrap | undefined = undefined;
  try {
    transactionWrap = getValidatedTxnWrap(txn, txn['type']);
  } catch (e: any) {
    logging.log(`Validation failed. ${e.message}`);
    return { error: `Validation failed. ${e.message}` };
  }

  if (!transactionWrap) {
    // We don't have a transaction wrap. We have an unknow error or extra fields, reject the transaction.
    logging.log(
      'A transaction has failed because of an inability to build the specified transaction type.'
    );
    return {
      error:
        'A transaction has failed because of an inability to build the specified transaction type.',
    };
  } else if (
    transactionWrap.validityObject &&
    Object.values(transactionWrap.validityObject).some(
      (value: any) => value['status'] === ValidationStatus.Invalid
    )
  ) {
    // We have a transaction that contains fields which are deemed invalid. We should reject the transaction.
    const e =
      'One or more fields are not valid. Please check and try again.\n' +
      Object.values(transactionWrap.validityObject)
        .filter((value: any) => value['status'] === ValidationStatus.Invalid)
        .map((vo: any) => vo['info']);
    return { error: e };
  }

  //Passed validation, create and submit transaction
  const sk = (await get<Uint8Array>(address)) as Uint8Array;
  if (!sk) {
    throw new Error('Account not found.');
  }
  let keyArray: number[] = [];
  for (const [key, value] of Object.entries(sk)) {
    keyArray.push(value);
  }
  const uintSK = new Uint8Array(keyArray);
  let signedTxn;
  const builtTx = buildTransaction(txn);
  signedTxn = {
    txID: builtTx.txID().toString(),
    blob: builtTx.signTxn(uintSK),
  };
  const { txId } = await algod.sendRawTransaction(signedTxn.blob).do();
  return { txId: txId, success: true };
}

export async function heartbeat(data: { request: {} }): Promise<object> {
  return {};
}
export async function authorization(data: {
  request: { originTabID: string; origin: string };
}): Promise<object> {
  const { originTabID, origin } = data.request;
  // Delete any previous request made from the Tab that it's
  // trying to connect.
  delete requests[originTabID];

  // If access was already granted, authorize connection.
  if (isAuthorized(origin)) {
    return data.request;
  } else {
    extensionBrowser.windows.create(
      {
        url: extensionBrowser.runtime.getURL('index.html#/authorize'),
        ...popupProperties,
      },
      function (w: any) {
        if (w) {
          requests[originTabID] = {
            window_id: w.id,
            message: data.request,
          };
          setTimeout(function () {
            extensionBrowser.runtime.sendMessage(data.request);
          }, 500);
        }
      }
    );
  }
  return {};
}
export async function enableAuthorization(data: {}): Promise<object> {
  return {};
}
export async function authorizationAllow(data: {
  request: {
    responseOriginTabID: string;
    isEnable: boolean;
    accounts: any;
    genesisID: string;
    genesisHash: string;
    ledger: { network: string };
  };
}): Promise<object> {
  const {
    responseOriginTabID,
    isEnable,
    accounts,
    genesisID,
    genesisHash,
    ledger: network,
  } = data.request;

  const auth = requests[responseOriginTabID];
  const message = auth.message;
  extensionBrowser.windows.remove(auth.window_id);
  authorized_pool.push(message.origin);
  delete requests[responseOriginTabID];

  setTimeout(() => {
    // Response needed
    message.response = {};
    // We need to send the authorized accounts and genesis info back if this is an enable call
    if (isEnable) {
      // Check that the requested accounts have been approved
      const rejectedAccounts = [];
      const sharedAccounts = [];
      for (const i in accounts) {
        if (
          (accounts[i]['requested'] && !accounts[i]['selected']) ||
          accounts[i]['missing']
        ) {
          rejectedAccounts.push(accounts[i]['address']);
        } else if (accounts[i]['selected']) {
          sharedAccounts.push(accounts[i]['address']);
        }
      }
      if (rejectedAccounts.length > 0) {
        message.error = RequestError.EnableRejected({
          accounts: rejectedAccounts,
        });
      } else {
        message.response = {
          genesisID: genesisID,
          genesisHash: genesisHash,
          accounts: sharedAccounts,
        };

        const poolDetails = { ...message.response, ledger: network };

        // Add to the authorized pool details.
        // This will be checked to restrict access for enable function users
        authorized_pool_details[`${message.origin}`] = poolDetails;
      }
    }
    return { message: message };
  }, 100);

  return { message: message, error: 'timeout - authorizationAllow' };
}
export async function authorizationDeny(data: {
  request: { responseOriginTabID: string };
}): Promise<object> {
  const { responseOriginTabID } = data.request;
  const auth = requests[responseOriginTabID];
  const message = auth.message;

  auth.message.error = RequestError.UserRejected;
  extensionBrowser.windows.remove(auth.window_id);
  delete requests[responseOriginTabID];

  return { message: message };
}
export async function signAllowWalletTx(data: {}): Promise<object> {
  return {};
}
export async function signDeny(data: {}): Promise<object> {
  return {};
}
export async function signWalletTransaction(data: {}): Promise<object> {
  return {};
}
export async function sendTransaction(data: {}): Promise<object> {
  return {};
}
export async function postTransactions(data: {}): Promise<object> {
  return {};
}
export async function algod(data: {
  request: { network: Network };
}): Promise<object> {
  return getNodeClient(data.request.network);
}
export async function indexer(data: {}): Promise<object> {
  return {};
}
export async function accounts(data: {}): Promise<object> {
  return {};
}

function checkAccountIsImported(genesisID: string, address: string) {
  throw new Error('Function not implemented.');
}
