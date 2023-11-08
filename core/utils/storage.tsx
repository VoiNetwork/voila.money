import browser from 'webextension-polyfill';
import { ActionTypes, useStore } from './store';
import toast from 'react-hot-toast';
import { FaTimes } from 'react-icons/fa';
import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
} from 'react';
import IconButton from '../components/IconButton';
import { IS_DEVELOPMENT } from './common';
import algosdk from 'algosdk';

export const SecureMessageTypes = {
  setPassword: 'setPassword',
  verifyPassword: 'verifyPassword',
  isPasswordSet: 'isPasswordSet',
  setPrimaryAddress: 'setPrimaryAddress',
  getPrimaryAddress: 'getPrimaryAddress',
  getAddresses: 'getAddresses',
  addAccount: 'addAccount',
  removeAccount: 'removeAccount',
  createBackup: 'createBackup',
  importBackup: 'importBackup',
  signTransactions: 'signTransactions',
  lock: 'lock',
  refresh: 'refresh',
};

// Storage gets removed from background script memory after this many seconds of inactivity using setTimeout
// Use "lock" to make it happen sooner
// Use "refresh" to set timer to 0
// Timer is set to 0 automatically after any get or set operation
// "setPassword" and "isPasswordSet" do not trigger refresh as they do not use CryptoStorage
export const STORAGE_TIMEOUT_WARNING_SECONDS = IS_DEVELOPMENT
  ? 59 * 60
  : 4.5 * 60;
export const STORAGE_TIMEOUT_SECONDS = IS_DEVELOPMENT ? 60 * 60 : 5 * 60;

export class SecureStorage {
  private dispatch: (type: string, data?: any) => void;
  private warningToast: string | undefined;
  private warningTimeout: ReturnType<typeof setTimeout> | undefined;
  private storageTimeout: ReturnType<typeof setTimeout> | undefined;

  updateDispatch(_dispatch: (type: string, data?: any) => void) {
    this.dispatch = _dispatch;
  }

  constructor(_dispatch: (type: string, data?: any) => void) {
    this.dispatch = _dispatch;
    this.refreshStorageTimeout = this.refreshStorageTimeout.bind(this);
    this.setWarningTimeoutInner = this.setWarningTimeoutInner.bind(this);
    this.setWarningTimeout = this.setWarningTimeout.bind(this);
    this.setLockTimeoutInner = this.setLockTimeoutInner.bind(this);
    this.setLockTimeout = this.setLockTimeout.bind(this);
    this.lock = this.lock.bind(this);
  }

  private async handleMessage(type: string, data?: object) {
    const response = await browser.runtime.sendMessage({ type, data });
    if (response && response.success) {
      if (
        ![
          SecureMessageTypes.setPassword,
          SecureMessageTypes.isPasswordSet,
          SecureMessageTypes.lock,
          SecureMessageTypes.refresh,
        ].includes(type)
      )
        this.refreshStorageTimeout();
      return response.result;
    } else {
      throw new Error(response?.error || 'No response from background script.');
    }
  }

  private setWarningTimeoutInner() {
    this.warningToast = toast.loading(
      <div className="flex items-center space-x-3">
        <span>Your wallet will be locked soon</span>
        <IconButton
          small
          IconComponent={FaTimes}
          onClick={this.refreshStorageTimeout}
          name={'Cancel'}
        >
          <span>Cancel</span>
        </IconButton>
      </div>
    );
  }

  private setWarningTimeout() {
    return setTimeout(
      this.setWarningTimeoutInner,
      STORAGE_TIMEOUT_WARNING_SECONDS * 1000
    );
  }

  private async setLockTimeoutInner(toastId: string | undefined) {
    await this.lock();
    this.dispatch(ActionTypes.LOCK);
    toast.success('Your wallet has been locked', {
      id: toastId,
    });
  }

  private setLockTimeout() {
    return setTimeout(
      () => this.setLockTimeoutInner(this.warningToast),
      STORAGE_TIMEOUT_SECONDS * 1000
    );
  }

  private async refreshStorageTimeout() {
    await this.handleMessage(SecureMessageTypes.refresh);
    if (this.warningToast) toast.remove(this.warningToast);
    clearTimeout(this.warningTimeout);
    clearTimeout(this.storageTimeout);
    this.warningTimeout = this.setWarningTimeout();
    this.storageTimeout = this.setLockTimeout();
  }

  async setPassword(password: string): Promise<void> {
    return await this.handleMessage(SecureMessageTypes.setPassword, {
      password,
    });
  }

  async verifyPassword(password: string): Promise<boolean> {
    return await this.handleMessage(SecureMessageTypes.verifyPassword, {
      password,
    });
  }

  async isPasswordSet(): Promise<[boolean, boolean]> {
    return await this.handleMessage(SecureMessageTypes.isPasswordSet);
  }

  async setPrimaryAddress(address: string): Promise<void> {
    return await this.handleMessage(SecureMessageTypes.setPrimaryAddress, {
      address,
    });
  }

  async getPrimaryAddress(): Promise<string | null> {
    return await this.handleMessage(SecureMessageTypes.getPrimaryAddress);
  }

  async getAddresses(): Promise<string[]> {
    return await this.handleMessage(SecureMessageTypes.getAddresses);
  }

  async addAccount(mnemonic: string): Promise<[string, string[]]> {
    return await this.handleMessage(SecureMessageTypes.addAccount, {
      mnemonic,
    });
  }

  async removeAccount(address: string): Promise<[string | null, string[]]> {
    return await this.handleMessage(SecureMessageTypes.removeAccount, {
      address,
    });
  }

  async createBackup(password: string): Promise<string> {
    return await this.handleMessage(SecureMessageTypes.createBackup, {
      password,
    });
  }

  async signTransactions(groups: algosdk.TransactionLike[][], address: string): Promise<{ txID: string; blob: Uint8Array; }[][]> {
    console.log("signTransactions - address", address);
    return await this.handleMessage(SecureMessageTypes.signTransactions, {
      groups, address
    });
  }

  async importBackup(
    backup: string,
    backupPassword: string
  ): Promise<[string | null, string[]]> {
    return await this.handleMessage(SecureMessageTypes.importBackup, {
      backup,
      backupPassword,
    });
  }

  async lock(): Promise<void> {
    toast.dismiss(this.warningToast);
    clearTimeout(this.warningTimeout);
    clearTimeout(this.storageTimeout);
    return await this.handleMessage(SecureMessageTypes.lock);
  }
}

const SecureStorageContext = createContext<SecureStorage | undefined>(
  undefined
);

interface SecureStorageProviderProps {
  children: JSX.Element;
}

export const SecureStorageProvider: React.FC<SecureStorageProviderProps> = ({
  children,
}) => {
  const { dispatch } = useStore();
  const [storage, setStorage] = useState<SecureStorage | undefined>(
    new SecureStorage(dispatch)
  );

  useLayoutEffect(() => {
    setStorage(new SecureStorage(dispatch));
  }, [dispatch]);

  return (
    <SecureStorageContext.Provider value={storage}>
      {children}
    </SecureStorageContext.Provider>
  );
};

export const useSecureStorage = () => {
  const secureStorage = useContext(SecureStorageContext);
  if (!secureStorage) {
    throw new Error(
      'You must use useSecureStorage() within a <SecureStorageProvider />'
    );
  }
  return secureStorage;
};
