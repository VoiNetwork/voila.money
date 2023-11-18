import React, { createContext, useReducer, useContext } from 'react';
import { Network } from '../../common/types'

import {
  NETWORKS,
  getIndexerClient,
  getNetwork,
  getNodeClient,
} from './network';
import algosdk from 'algosdk';

interface State {
  display: 'tab' | 'extension' | 'mobile';
  signedIn: boolean;
  primaryAddress?: string;
  addresses: string[];
  network: Network;
  node: algosdk.Algodv2;
  indexer: algosdk.Indexer;
  savedRequest: any;
}

export interface Action {
  type: string;
  payload?: any;
}

const initialState: State = {
  display: 'mobile',
  network: NETWORKS.VoiTestnet,
  signedIn: false,
  addresses: [],
  node: getNodeClient(NETWORKS.VoiTestnet),
  indexer: getIndexerClient(NETWORKS.VoiTestnet),
  savedRequest: undefined,
};

export const ActionTypes = {
  TOGGLE_THEME: 'TOGGLE_THEME',
  UPDATE_DATA: 'UPDATE_DATA',
  UPDATE_NETWORK: 'UPDATE_NETWORK',
  LOCK: 'LOCK',
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionTypes.UPDATE_NETWORK:
      const networkId = action.payload?.id;
      localStorage.setItem('network', networkId);
      let network;
      if (action.payload?.data) {
        network = action.payload?.data;
        localStorage.setItem(`network-${networkId}`, action.payload?.data);
      } else {
        network = getNetwork(networkId);
      }
      return {
        ...state,
        network,
        node: getNodeClient(network),
        indexer: getIndexerClient(network),
      };
    case ActionTypes.UPDATE_DATA:
      return { ...state, [action.payload?.name]: action.payload?.data };
    case ActionTypes.LOCK:
      return initializeStore(state.display);
    default:
      return state;
  }
};

// Store context
const StoreContext = createContext<{
  state: State;
  dispatch: (type: string, payload?: any) => void;
}>({
  state: initialState,
  dispatch: () => { },
});

interface StoreProviderProps {
  children: React.ReactNode;
  display: 'tab' | 'extension' | 'mobile';
}

const initializeStore = (display: 'tab' | 'extension' | 'mobile'): State => {
  const network = getNetwork(
    window.localStorage.getItem('network') || 'VoiTestnet'
  );
  const node = getNodeClient(network);
  const indexer = getIndexerClient(network);
  return {
    ...initialState,
    display,
    network,
    node,
    indexer,
  };
};

export const StoreProvider: React.FC<StoreProviderProps> = ({
  children,
  display,
}) => {
  const initState = initializeStore(display);
  const [state, dispatchBase] = useReducer(reducer, initState);

  const dispatch = (type: string, payload?: any) => {
    dispatchBase({ type, payload });
  };

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
