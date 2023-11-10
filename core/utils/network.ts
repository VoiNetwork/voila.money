import algorandTokenSvg from '../assets/networks/algorand-token.svg';
import algorandTokenPng from '../assets/networks/algorand-token.png';
import voiTokenSvg from '../assets/networks/voi-token.svg';
import voiTokenPng from '../assets/networks/voi-token.png';
import { getLocalState } from '../hooks/useLocalState';
import algosdk from 'algosdk';
import { Network } from '../../common/types'

export const NETWORKS: Record<string, Network> = {
  VoiTestnet: {
    id: 'VoiTestnet',
    name: 'Voi',
    description: 'Voi Testnet Network',
    genesisId: 'voitest-v1',
    genesisHash: 'IXnoWtviVVJW5LGivNFc0Dq14V3kqaXuK2u5OQrdVZo=',
    isMainnet: false,
    token: {
      name: 'Voi',
      ticker: 'VOI',
      decimals: 6,
      svg: voiTokenSvg,
      png: voiTokenPng,
    },
    node: {
      token: '',
      server: 'https://voitest-api.algorpc.pro',
      port: 443,
      description: 'Free global API provided by AlgoNode.io',
    },
    indexer: {
      token: '',
      server: 'https://voitest-idx.algorpc.pro',
      port: 443,
      description: 'Free Indexer API provided by AlgoNode.io',
    },
  },
  // AlgorandMainnet: {
  //   id: 'AlgorandMainnet',
  //   name: 'Algorand',
  //   description: 'Algorand Mainnet Network',
  //   genesisId: 'mainnet-v1.0',
  //   isMainnet: true,
  //   token: {
  //     name: 'Algorand',
  //     ticker: 'ALGO',
  //     decimals: 6,
  //     svg: algorandTokenSvg,
  //     png: algorandTokenPng,
  //   },
  //   node: {
  //     token: '',
  //     server: 'https://mainnet-api.algonode.cloud',
  //     port: 443,
  //     description: 'Free global API provided by AlgoNode.io',
  //   },
  //   indexer: {
  //     token: '',
  //     server: 'https://mainnet-idx.algonode.cloud',
  //     port: 443,
  //     description: 'Free global API provided by AlgoNode.io',
  //   },
  // },
  // AlgorandTestnet: {
  //   id: 'AlgorandTestnet',
  //   name: 'Algorand',
  //   description: 'Algorand Testnet Network',
  //   genesisId: 'testnet-v1.0',
  //   isMainnet: false,
  //   token: {
  //     name: 'Algorand',
  //     ticker: 'ALGO',
  //     decimals: 6,
  //     svg: algorandTokenSvg,
  //     png: algorandTokenPng,
  //   },
  //   node: {
  //     token: '',
  //     server: 'https://testnet-api.algonode.cloud',
  //     port: 443,
  //     description: 'Free global API provided by AlgoNode.io',
  //   },
  //   indexer: {
  //     token: '',
  //     server: 'https://testnet-idx.algonode.cloud',
  //     port: 443,
  //     description: 'Free global API provided by AlgoNode.io',
  //   },
  //   faucet: 'https://bank.testnet.algorand.network/',
  // },
};

export const getNetwork = (id: string): Network => {
  return getLocalState<Network>(
    `network-${id}`,
    NETWORKS[id] || NETWORKS.VoiTestnet
  );
};

export const getNodeClient = (network: Network) => {
  return new algosdk.Algodv2(
    network.node.token,
    network.node.server,
    network.node.port
  );
};

export const getIndexerClient = (network: Network) => {
  return new algosdk.Indexer(
    network.indexer.token,
    network.indexer.server,
    network.indexer.port
  );
};

export const formatTokenAmount = (network: Network, amount: number) => {
  return amount / Math.pow(10, network.token.decimals);
};
