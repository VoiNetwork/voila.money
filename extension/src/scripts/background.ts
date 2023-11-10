import browser from 'webextension-polyfill';
import { SecureMessageTypes } from '../../../core/utils/storage';
import {
  setPassword,
  verifyPassword,
  isPasswordSet,
  addAccount,
  removeAccount,
  getAddresses,
  createBackup,
  importBackup,
  getPrimaryAddress,
  setPrimaryAddress,
  lock,
  refresh,
} from './storage';

import { signTransactions } from './internalMethods'

const SecureMessageListenerFunctionMap: Record<
  (typeof SecureMessageTypes)[keyof typeof SecureMessageTypes],
  (data: any) => Promise<any>
> = {
  [SecureMessageTypes.isPasswordSet]: isPasswordSet,
  [SecureMessageTypes.verifyPassword]: verifyPassword,
  [SecureMessageTypes.setPassword]: setPassword,
  [SecureMessageTypes.setPrimaryAddress]: setPrimaryAddress,
  [SecureMessageTypes.getPrimaryAddress]: getPrimaryAddress,
  [SecureMessageTypes.getAddresses]: getAddresses,
  [SecureMessageTypes.addAccount]: addAccount,
  [SecureMessageTypes.removeAccount]: removeAccount,
  [SecureMessageTypes.createBackup]: createBackup,
  [SecureMessageTypes.importBackup]: importBackup,
  [SecureMessageTypes.lock]: lock,
  [SecureMessageTypes.refresh]: refresh,
  [SecureMessageTypes.signTransactions]: signTransactions,
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
