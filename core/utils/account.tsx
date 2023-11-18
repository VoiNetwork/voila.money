import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useStore } from './store';
import { toast } from 'react-hot-toast';
import { useLocalState } from '../hooks/useLocalState';
import {
  AccountInformation,
  AccountTransactionInformation,
  AssetInformation,
  AssetParams,
  TransactionInformation,
} from '../../common/types';
const arc200 = require('arc200js');

interface AccountProviderProps {
  children: JSX.Element | JSX.Element[];
}

const AccountContext = createContext<AccountContextValue | undefined>(
  undefined
);

export type BaseToken = {
  id: number;
  name: string;
  symbol: string;
  totalSupply: number;
  decimals: number;
};

export type TokenCache = Record<string, Record<number, BaseToken>>;

export type AssetCache = Record<string, Record<number, AssetParams>>;

export type TransactionCache = Record<
  string,
  Record<number, AccountTransactionInformation[]>
>;

interface AccountContextValue {
  tokens: Record<number, BaseToken>;
  assets: Record<number, AssetParams>;
  transactions: Record<number, AccountTransactionInformation[]>;
  account: AccountInformation | null;
  refreshAccount: () => void;
}

export const AccountProvider: React.FC<AccountProviderProps> = ({
  children,
}) => {
  const { state } = useStore();
  const [account, setAccount] = useState<AccountInformation | null>(null);
  const [assets, setAssets] = useLocalState<AssetCache>('assets', {});
  const [transactions, setTransactions] = useLocalState<TransactionCache>(
    'transactions',
    {}
  );
  const [tokens, setTokens] = useLocalState<TokenCache>('tokens', {});

  const flagRef = useRef<number>(0);

  const updateAccountCreatedApps = useCallback(async () => {
    const networkId = state.network.id;
    if (networkId && account) {
      const chunkSize = 1;
      const unknownTokens = account['created-apps']?.filter(
        (a) => !tokens[networkId] || !tokens[networkId][a['id']]
      );
      const toks: BaseToken[] = [];
      for (let i = 0; i < unknownTokens?.length; i += chunkSize) {
        const chunk = unknownTokens.slice(i, i + chunkSize);
        const id = chunk[0].id;
        const ci = new arc200(id, state.node);
        const tm = await ci.getMetadata();
        if (!tm.success) continue;
        toks.push({ id, ...tm.returnValue });
      }
      setTokens((a) => {
        const newTokens = { ...a };
        if (!newTokens[networkId]) newTokens[networkId] = {};
        toks.forEach((u) => {
          newTokens[networkId][u.id] = u;
        });
        return newTokens;
      });
    }
  }, [account]);

  useEffect(() => {
    updateAccountCreatedApps();
  }, [updateAccountCreatedApps]);

  const updateAccountTransactions = useCallback(async () => {
    const networkId = state.network.id;
    const txns = [];
    if (networkId && account) {
      const chunkSize = 5;
      const unknownTransactions = account.transactions?.filter(
        (a) => !transactions[networkId] || !transactions[networkId][a['index']]
      );
      for (let i = 0; i < unknownTransactions?.length; i += chunkSize) {
        const chunk = unknownTransactions.slice(i, i + chunkSize);
        const updates: (TransactionInformation | null)[] = (await Promise.all([
          ...chunk.map(
            (a) =>
              new Promise(async (resolve) => {
                await state.indexer
                  .searchForTransactions()
                  .address(account.address)
                  .do()
                  .then(resolve)
                  .catch(() => resolve(null));
              })
          ),
        ])) as (TransactionInformation | null)[];
        setTransactions((a) => {
          const newTransactions = { ...a };
          if (!newTransactions[networkId]) newTransactions[networkId] = {};
          updates.forEach((u) => {
            if (u !== null) newTransactions[networkId][0] = u.transactions;
          });
          return newTransactions;
        });
      }
    }
  }, [account]);

  useEffect(() => {
    updateAccountTransactions();
  }, [updateAccountTransactions]);

  const updateAccountAssets = useCallback(async () => {
    const networkId = state.network.id;
    if (networkId && account) {
      const chunkSize = 5;
      const unknownAssets = account.assets.filter(
        (a) => !assets[networkId] || !assets[networkId][a['asset-id']]
      );
      for (let i = 0; i < unknownAssets.length; i += chunkSize) {
        const chunk = unknownAssets.slice(i, i + chunkSize);
        const updates: (AssetInformation | null)[] = (await Promise.all([
          ...chunk.map(
            (a) =>
              new Promise(async (resolve) => {
                await state.node
                  .getAssetByID(a['asset-id'])
                  .do()
                  .then(resolve)
                  .catch(() => resolve(null));
              })
          ),
        ])) as (AssetInformation | null)[];
        setAssets((a) => {
          const newAssets = { ...a };
          if (!newAssets[networkId]) newAssets[networkId] = {};
          updates.forEach((u) => {
            if (u !== null) newAssets[networkId][u.index] = u.params;
          });
          return newAssets;
        });
      }
    }
  }, [account]);

  useEffect(() => {
    updateAccountAssets();
  }, [updateAccountAssets]);

  const fetchData = useCallback(async () => {
    if (state.primaryAddress) {
      flagRef.current += 1;
      const thisFlag = flagRef.current;
      try {
        const account = await state.node
          .accountInformation(state.primaryAddress)
          .do();

        const networkId = state.network.id;
        const updates: (TransactionInformation | null)[] = (await Promise.all([
          new Promise(async (resolve) => {
            await state.indexer
              .searchForTransactions()
              .address(account.address)
              .do()
              .then(resolve)
              .catch(() => resolve(null));
          }),
        ])) as (TransactionInformation | null)[];
        setTransactions((a) => {
          const newTransactions = { ...a };
          if (!newTransactions[networkId]) newTransactions[networkId] = {};
          updates.forEach((u) => {
            if (u !== null) newTransactions[networkId][0] = u.transactions;
          });
          return newTransactions;
        });

        if (thisFlag === flagRef.current) {
          setAccount(account as AccountInformation);
        }
      } catch (e) {
        toast.error(
          'Something went wrong while updating account data: ' + e?.toString()
        );
      }
    }
  }, [state.node, state.primaryAddress]);

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  return (
    <AccountContext.Provider
      value={{
        account,
        refreshAccount: fetchData,
        assets: assets[state.network.id] || {},
        tokens: tokens[state.network.id] || {},
        transactions: transactions[state.network.id] || {},
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within a AccountProvider');
  }
  return context;
};
