import React from 'react';
import IconButton from './IconButton';

import { NETWORKS, Network } from '../utils/network';
import Dropdown from './Dropdown';
import { classNames } from '../utils/common';
import { ActionTypes, useStore } from '../utils/store';

const NetworkSettings: React.FC = () => {
  const { state, dispatch } = useStore();
  const network = state.network;

  const NetworkIcon = (nw: Network) => () =>
    (
      <div className="flex items-center min-w-max space-x-2">
        <img
          src={nw.token.svg as unknown as string}
          alt=""
          className={classNames(
            'shadow-lg rounded-full text-white',
            !nw.isMainnet && 'bg-orange-500 dark:bg-orange-600 p-1'
          )}
          style={{ height: '1.25rem', width: '1.25rem' }}
        />
      </div>
    );

  const updateNetwork = (id: string) => {
    dispatch(ActionTypes.UPDATE_NETWORK, { id });
  };

  return (
    <Dropdown
      onSelect={updateNetwork}
      options={Object.keys(NETWORKS).map((network) => ({
        id: network,
        content: (
          <div key={network} className="flex space-x-2 items-center justify-between text-center dark:bg-white bg-black bg-opacity-5 dark:bg-opacity-5 rounded-lg p-2">
            <div className="flex space-x-2 items-center">
              {NetworkIcon(NETWORKS[network])()}
              <span className="font-bold">{NETWORKS[network].name}</span>
            </div>
            <div>
              <span
                className={classNames(
                  'font-semibold',
                  NETWORKS[network].isMainnet
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-orange-600 dark:text-orange-500'
                )}
              >
                {NETWORKS[network].isMainnet ? 'MainNet' : 'TestNet'}
              </span>
            </div>
          </div>
        ),
      }))}
    >
      <IconButton
        IconComponent={NetworkIcon(network)}
        name={network.description}
      />
    </Dropdown>
  );
};

export default NetworkSettings;
