import browser from 'webextension-polyfill';
import { SecureMessageTypes } from '../../../core/utils/storage';
import {
  setPassword,
  verifyPassword,
  isPasswordSet,
  addAccount,
  removeAccount,
  getAddresses,
  getTokens,
  addToken,
  createBackup,
  importBackup,
  getPrimaryAddress,
  setPrimaryAddress,
  lock,
  refresh,
} from './storage';
import {
  signTransactions,
  heartbeat,
  authorization,
  enableAuthorization,
  authorizationAllow,
  authorizationDeny,
  signAllowWalletTx,
  signDeny,
  signWalletTransaction,
  sendTransaction,
  postTransactions,
  algod,
  indexer,
  accounts,
} from './internalMethods'

const SecureMessageListenerFunctionMap: Record<
  (typeof SecureMessageTypes)[keyof typeof SecureMessageTypes],
  (data: any) => Promise<any>
> = {
  // UI Messages
  [SecureMessageTypes.isPasswordSet]: isPasswordSet,
  [SecureMessageTypes.verifyPassword]: verifyPassword,
  [SecureMessageTypes.setPassword]: setPassword,
  [SecureMessageTypes.setPrimaryAddress]: setPrimaryAddress,
  [SecureMessageTypes.getPrimaryAddress]: getPrimaryAddress,
  [SecureMessageTypes.getAddresses]: getAddresses,
  [SecureMessageTypes.addAccount]: addAccount,
  [SecureMessageTypes.getTokens]: getTokens,
  [SecureMessageTypes.addToken]: addToken,
  [SecureMessageTypes.removeAccount]: removeAccount,
  [SecureMessageTypes.createBackup]: createBackup,
  [SecureMessageTypes.importBackup]: importBackup,
  [SecureMessageTypes.lock]: lock,
  [SecureMessageTypes.refresh]: refresh,
  [SecureMessageTypes.signTransactions]: signTransactions,

  //dApp Messages
  [SecureMessageTypes.heartbeat]: heartbeat,
  [SecureMessageTypes.authorization]: authorization,
  [SecureMessageTypes.enableAuthorization]: enableAuthorization,
  [SecureMessageTypes.authorizationAllow]: authorizationAllow,
  [SecureMessageTypes.authorizationDeny]: authorizationDeny,
  [SecureMessageTypes.signAllowWalletTx]: signAllowWalletTx,
  [SecureMessageTypes.signDeny]: signDeny,
  [SecureMessageTypes.signWalletTransaction]: signWalletTransaction,
  [SecureMessageTypes.sendTransaction]: sendTransaction,
  [SecureMessageTypes.postTransactions]: postTransactions,
  [SecureMessageTypes.algod]: algod,
  [SecureMessageTypes.indexer]: indexer,
  [SecureMessageTypes.accounts]: accounts,
};

browser.runtime.onMessage.addListener(
  (
    message: { type: keyof typeof SecureMessageTypes; data: any },
    sender,
    sendResponse: (data: any) => void
  ) => {
    if (sender.id !== browser.runtime.id) {
      console.error('Received a message from an untrusted source.', sender);
      return;
    }

    const fn = SecureMessageListenerFunctionMap[message.type];
    if (fn) {
      fn(message.data)
        .then((result: any) => sendResponse({ success: true, result }))
        .catch((error: any) =>
          sendResponse({ success: false, error: error?.message || error })
        );
      return true;
    }
  }
);