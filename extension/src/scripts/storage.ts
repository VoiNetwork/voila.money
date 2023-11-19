import CryptoJS from 'crypto-js';
import browser from 'webextension-polyfill';
import { CryptoStorage } from './webcrypto/storage';
import algosdk from 'algosdk';
import { STORAGE_TIMEOUT_SECONDS } from '../../../core/utils/storage';
import { Buffer } from 'buffer';

let storage: CryptoStorage | null = null;
let storageExpiry: ReturnType<typeof setTimeout>;

export const StorageKeys = {
  passwordHash: 'passwordHash',
  primaryAddress: 'primaryAddress',
  addresses: 'addresses',
  tokens: 'tokens',
};

interface PasswordHash {
  hash: string;
  salt: string;
  iterations: number;
}

async function setLocalStorage<T>(name: string, value: T): Promise<void> {
  await browser.storage.local.set({ [name]: JSON.stringify(value) });
}

async function getLocalStorage<T>(name: string): Promise<T | null> {
  try {
    const storedValueJSON = await browser.storage.local.get(name);
    const storedValue: T = JSON.parse(storedValueJSON[name]);
    return storedValue || null;
  } catch (e) {
    return null;
  }
}

async function updateStorageTimeout() {
  if (storageExpiry) clearTimeout(storageExpiry);
  console.log('updating storage timeout', storageExpiry);
  storageExpiry = setTimeout(() => {
    console.log('locking storage.');
    storage = null;
    // delay clear so the app has a chance to call it without error
  }, 1000 * (STORAGE_TIMEOUT_SECONDS + 1));
}

async function set<T>(name: string, value: T): Promise<void> {
  if (storage) {
    updateStorageTimeout();
    const data = JSON.stringify(value);
    await storage.set(name, data);
  } else {
    throw new Error('Storage not available.');
  }
}

async function remove(name: string): Promise<void> {
  if (storage) {
    updateStorageTimeout();
    await storage.delete(name);
  } else {
    throw new Error('Storage not available.');
  }
}

export async function get<T>(name: string): Promise<T | null> {
  if (storage) {
    updateStorageTimeout();
    const data = await storage.get(name);
    if (data) {
      return JSON.parse(data) as T;
    }
    return null;
  } else {
    throw new Error('Storage not available.');
  }
}

export async function isPasswordSet(): Promise<[boolean, boolean]> {
  try {
    const passwordHash = await getLocalStorage<PasswordHash>(
      StorageKeys.passwordHash
    );
    return [!!passwordHash, !!storage];
  } catch {
    return [false, false];
  }
}

function getPasswordHash(password: string): PasswordHash {
  const salt = CryptoJS.lib.WordArray.random(128 / 8);
  const iterations = 1000;
  const keySize = 256 / 32;
  const hash = CryptoJS.PBKDF2(password, salt, {
    keySize: keySize,
    iterations: iterations,
  });
  const passwordHash: PasswordHash = {
    hash: hash.toString(),
    salt: salt.toString(),
    iterations: iterations,
  };
  return passwordHash;
}

export async function setPassword(data: { password: string }): Promise<void> {
  const passwordSet = await isPasswordSet();
  if (!passwordSet[0]) {
    const passwordHash = getPasswordHash(data.password);
    await setLocalStorage(StorageKeys.passwordHash, passwordHash);
  }
}

export async function verifyPassword(data: {
  password: string;
}): Promise<boolean> {
  const passwordHash = await getLocalStorage<PasswordHash>(
    StorageKeys.passwordHash
  );
  if (!passwordHash) return false;
  const { salt, iterations, hash: storedHash } = passwordHash;
  const computedHash = CryptoJS.PBKDF2(
    data.password,
    CryptoJS.enc.Hex.parse(salt),
    {
      keySize: 256 / 32,
      iterations: iterations,
    }
  );
  if (computedHash.toString() === storedHash) {
    updateStorageTimeout();
    console.log('creating storage');
    storage = new CryptoStorage(data.password);
    return true;
  }
  return false;
}

export async function getPrimaryAddress(): Promise<string | null> {
  return await get(StorageKeys.primaryAddress);
}

export async function setPrimaryAddress(data: {
  address: string;
}): Promise<void> {
  await set(StorageKeys.primaryAddress, data.address);
}

export async function getAddresses(): Promise<string[]> {
  return (await get(StorageKeys.addresses)) || [];
}

export async function addAccount(data: {
  mnemonic: string;
}): Promise<[string, string[]]> {
  const account = algosdk.mnemonicToSecretKey(data.mnemonic);
  await set(account.addr, account.sk);
  const addresses: string[] = [
    ...((await get<string[]>(StorageKeys.addresses)) || []),
    account.addr,
  ];
  await set(StorageKeys.addresses, addresses);
  const primaryAddress = await getPrimaryAddress();
  if (!primaryAddress) {
    setPrimaryAddress({ address: account.addr });
  }
  return [primaryAddress || account.addr, addresses];
}

export async function removeAccount(data: {
  address: string;
}): Promise<[string | null, string[]]> {
  await remove(data.address);
  const accounts: string[] = await getAddresses();
  const primaryAddress = await getPrimaryAddress();
  const newAccounts = accounts.filter((a) => a !== data.address);
  await set(StorageKeys.addresses, newAccounts);
  if (data.address === primaryAddress) {
    if (newAccounts.length > 0) {
      await setPrimaryAddress({ address: newAccounts[0] });
      return [newAccounts[0], newAccounts];
    } else {
      await remove(StorageKeys.primaryAddress);
      return [null, newAccounts];
    }
  } else {
    return [primaryAddress, newAccounts];
  }
}

export async function getTokens(): Promise<number[]> {
  return (await get(StorageKeys.tokens)) || [];
}

export async function addToken(data: {//TODO: Refactor to store tokens on a per account basis
  token: number;
}): Promise<[number, number[]]> {
  const { token } = data;
  const tokens: number[] = [
    ...((await get<number[]>(StorageKeys.tokens)) || []),
    token,
  ];
  await set(StorageKeys.tokens, tokens);
  return [token, tokens];
}

export async function refresh(): Promise<void> {
  updateStorageTimeout();
}

export async function lock(): Promise<void> {
  clearTimeout(storageExpiry);
  storage = null;
}

export async function createBackup(data: {
  password: string;
}): Promise<string> {
  if (!(await verifyPassword(data))) {
    throw new Error('Invalid password');
  }
  const addresses: string[] = await getAddresses();
  const keys = [];
  for (let address of addresses) {
    keys.push(await get(address));
  }
  let backup = JSON.stringify(keys);
  console.log(backup);
  const cipher = CryptoJS.AES.encrypt(backup, data.password).toString();
  return Buffer.from(JSON.stringify(cipher), 'utf8').toString('base64');
}

export async function importBackup(data: {
  backup: string;
  backupPassword: string;
}): Promise<[string | null, string[]]> {
  const backupCipherText = JSON.parse(
    Buffer.from(data.backup, 'base64').toString('utf8')
  );
  try {
    const backupPlainText = CryptoJS.AES.decrypt(
      backupCipherText,
      data.backupPassword
    ).toString(CryptoJS.enc.Utf8);
    const keys: Uint8Array[] = JSON.parse(backupPlainText);
    const existingAddresses: string[] = await getAddresses();
    for (const sk of keys) {
      try {
        const account = algosdk.mnemonicToSecretKey(
          algosdk.secretKeyToMnemonic(Uint8Array.from(Object.values(sk)))
        );
        if (!existingAddresses.includes(account.addr)) {
          await set(account.addr, account.sk);
          existingAddresses.push(account.addr);
        }
      } catch (e) {
        throw new Error('Malformed private key');
      }
    }
    await set(StorageKeys.addresses, existingAddresses);
    const primaryAddress = await getPrimaryAddress();
    if (!primaryAddress && existingAddresses.length > 0) {
      await setPrimaryAddress({ address: existingAddresses[0] });
      return [existingAddresses[0], existingAddresses];
    } else {
      return [primaryAddress, existingAddresses];
    }
  } catch (e) {
    throw new Error((e as Error)?.message?.toString() || 'Invalid password');
  }
}
