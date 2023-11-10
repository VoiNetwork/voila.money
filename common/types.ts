/* eslint-disable no-unused-vars */
import { FunctionComponent } from 'react';

export type Field<T> = string | number;

export type TAccount = Field<string>;
export type Note = Field<string>;
export type Amount = Field<number>;

export type Transaction = {
  readonly amount: Amount;
  readonly from: TAccount;
  readonly note?: Note;
  readonly to: TAccount;
};

export type WalletMultisigMetadata = {
  readonly version: number;
  readonly threshold: number;
  readonly addrs: Array<string>;
};

export type WalletTransaction = {
  readonly txn: string;
  readonly signers?: Array<string>;
  readonly stxn?: string;
  readonly message?: string;
  readonly msig?: WalletMultisigMetadata;
  readonly authAddr?: string;
};

export type SignTxnsOpts = {
  [key: string]: string | boolean,
};

export enum OptsKeys {
  ARC01Return = 'AlgoSigner_arc01',
  sendTxns = 'AlgoSigner_send'
}

export type Alias = {
  readonly name: string;
  readonly address: string;
  readonly namespace: Namespace;
  collides: boolean;
};

export enum Namespace {
  AlgoSigner_Contacts = 'AlgoSigner_Contacts',
  AlgoSigner_Accounts = 'AlgoSigner_Accounts',
  NFD = 'NFD',
  ANS = 'ANS',
}

export type NamespaceConfig = {
  name: string;
  namespace: Namespace;
  toggle: boolean;
};

export type SafeAccount = {
  address: string;
  isRef: boolean;
  name: string;
  details?: any;
}

export type SensitiveAccount = SafeAccount & {
  mnemonic: string;
}

// { network: [...accounts] }
export type WalletStorage = { [key: string]: Array<SafeAccount> };

export type NetworkToken = {
  name: string;
  ticker: string;
  decimals: number;
  svg: FunctionComponent;
  png: string;
};

export type Node = {
  token: string;
  server: string;
  port: number;
  description?: string;
};

export type Network = {
  id: string;
  name: string;
  description: string;
  genesisId: string;
  genesisHash: string;
  isMainnet: boolean;
  token: NetworkToken;
  node: Node;
  indexer: Node;
  faucet?: string;
};


export interface AccountAssetInformation {
  amount: number;
  'asset-id': number;
  'is-frozen': boolean;
}

export interface AccountTransactionInformation {
  'application-config-index': number;
  'application-transaction': {
     accounts: [];
    'application-args': [];
    'application-id': number;
    'application-revision': number;
    'foreign-assets': [];
    'global-state-schema': {
      'num-byte-slice': number;
      'num-uint': number;
    };
    'local-state-schema': {
      'num-byte-slice': number;
      'num-uint': number;
    };
    'on-completion': string;
  }[];
  'asset-transfer-transaction': {
    'amount': number;
    'asset-decimals': number;
    'asset-id': number;
    'asset-name': string;
    'asset-unit-name': string;
    'close-acc-rewards': number;
    'close-amount': number;
    'close-asset-balance': number;
    'close-balance': number;
    'opt-in': boolean;
    'receiver': string;
    'receiver-acc-rewards': number;
    'receiver-asset-balance': number;
    'receiver-balance': number;
    'receiver-tx-counter': number;
    'sender-asset-balance': number;
  }[];
  'application-tx-counter': number;
  'block-rewards-level': number;
  'close-rewards': number;
  'closing-amount': number;
  'confirmed-round': number;
  'fee': number;
  'first-valid': number;
  'id': string;
  'index': number;
  'inner-tx-offset': number;
  'inner-txns': {
    'asset-transfer-transaction': {
      'amount': number;
      'asset-decimals': number;
      'asset-id': number;
      'asset-name': string;
      'asset-unit-name': string;
      'close-acc-rewards': number;
      'close-amount': number;
      'close-asset-balance': number;
      'close-balance': number;
      'opt-in': boolean;
      'receiver': string;
      'receiver-acc-rewards': number;
      'receiver-asset-balance': number;
      'receiver-balance': number;
      'receiver-tx-counter': number;
      'sender-asset-balance': number;
    }[];
    'asset-tx-counter': number;
    'block-rewards-level': number;
    'close-rewards': number;
    'closing-amount': number;
    'confirmed-round': number;
    'fee': number;
    'first-valid': number;
    'index': number;
    'inner-tx-offset': number;
    'intra-round-offset': number;
    'last-valid': number;
    'logs': [];
    'parent-tx-offset': number;
    'receiver-rewards': number;
    'round-time': number;
    'sender': string;
    'sender-acc-rewards': number;
    'sender-balance': number;
    'sender-rewards': number;
    'sender-tx-counter': number;
    'tx-type': string;
  }[];
  'intra-round-offset': number;
  'last-valid': number;
  'logs': [];
  'receiver-rewards': number;
  'round-time': number;
  'sender': string;
  'sender-acc-rewards': number;
  'sender-balance': number;
  'sender-rewards': number;
  'sender-tx-counter': number;
  'signature': {
    'sig': string;
  }[];
  'tx-type': string;
}

export interface AccountInformation {
  address: string;
  amount: number;
  'min-balance': number;
  'amount-without-pending-rewards': number;
  'apps-local-state': {
    id: number;
    schema: {
      'num-uint': number;
      'num-byte-slice': number;
    };
    'key-value': [
      {
        key: string;
        value: {
          type: number;
          bytes: string;
          uint: number;
        };
      }
    ];
  }[];
  'total-apps-opted-in': number;
  'apps-total-schema': {
    'num-uint': number;
    'num-byte-slice': number;
  };
  'apps-total-extra-pages': number;
  assets: AccountAssetInformation[];
  transactions: AccountTransactionInformation[];
  'total-assets-opted-in': number;
  'created-apps': {
    id: number;
    params: {
      creator: string;
      'approval-program': string;
      'clear-state-program': string;
      'extra-program-pages': number;
      'local-state-schema': {
        'num-uint': number;
        'num-byte-slice': number;
      };
      'global-state-schema': {
        'num-uint': number;
        'num-byte-slice': number;
      };
      'global-state': [
        {
          key: string;
          value: {
            type: number;
            bytes: string;
            uint: number;
          };
        }
      ];
    };
  }[];
  'total-created-apps': number;
  'created-assets': {
    index: number;
    params: {
      clawback: string;
      creator: string;
      decimals: number;
      'default-frozen': true;
      freeze: string;
      manager: string;
      'metadata-hash': string;
      name: string;
      'name-b64': string;
      reserve: string;
      total: number;
      'unit-name': string;
      'unit-name-b64': string;
      url: string;
      'url-b64': string;
    };
  }[];
  'total-created-assets': number;
  participation: {
    'selection-participation-key': string;
    'vote-first-valid': number;
    'vote-key-dilution': number;
    'vote-last-valid': number;
    'vote-participation-key': string;
    'state-proof-key': string;
  };
  'pending-rewards': number;
  'reward-base': number;
  rewards: number;
  round: number;
  status: string;
  'sig-type': string;
  'auth-addr': string;
}

export interface AssetParams {
  clawback: string;
  creator: string;
  decimals: number;
  'default-frozen': true;
  freeze: string;
  manager: string;
  'metadata-hash': string;
  name: string;
  'name-b64': string;
  reserve: string;
  total: number;
  'unit-name': string;
  'unit-name-b64': string;
  url: string;
  'url-b64': string;
}

export interface AssetInformation {
  index: number;
  params: AssetParams;
}


export interface TransactionInformation {
  'current-round': number;
  'next-token': string;
  transactions: AccountTransactionInformation[];
}