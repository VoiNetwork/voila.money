import React, { useMemo } from 'react';
import { BaseToken } from '../../utils/account';
import Amount from '../../components/Amount';
import IconButton from '../../components/IconButton';
import { FaPaperPlane, FaTrash } from 'react-icons/fa';
import assetPlaceholder from '../../assets/asset.png';
import Card from '../../components/Card';
import { classNames } from '../../utils/common';
import { Link, useNavigate } from 'react-router-dom';
import { Network } from '../../../common/types'
import { useStore } from '../../utils/store';

interface TokenBarProps {
  id: number;
  amount: BigInt;
  tokens: Record<number, BaseToken>;
  network?: Network;
}

const TokenBar: React.FC<TokenBarProps> = ({ id, amount, tokens, network }) => {
  const { state } = useStore();
  const navigate = useNavigate();

  const [name, ticker, decimals] = useMemo(() => {
    const token: BaseToken | undefined = tokens[id];
    let name = '';
    let ticker = '';
    try {
      name = token.name;
      ticker = token.symbol;
    } catch {
      // pass
    }
    return [
      token?.name || name,
      token?.symbol || ticker,
      Number(token?.decimals) || 0,
    ];
  }, [id, tokens, network]);

  return (
    <Card
      onClick={
        state.display === 'extension' ? () => navigate(`send/${id}`) : undefined
      }
      className={classNames(
        'w-full items-center flex justify-between',
        !network && amount === BigInt(0) && 'opacity-50 hover:opacity-100'
      )}
    >
      <div className="flex items-center space-x-2">
        {network ? (
          <div className="min-w-max px-2">
            <img
              src={network.token.svg as unknown as string}
              alt=""
              className={classNames(
                'shadow-lg rounded-full text-white w-12 h-12',
                !network.isMainnet && 'bg-orange-500 dark:bg-orange-600 p-1'
              )}
            />
          </div>
        ) : (
          <div className="min-w-max px-2">
            <img src={assetPlaceholder} className="w-8 h-8" alt="asset" />
          </div>
        )}
        <div>
          <div className="text-base font-bold">{name || 'Unknown'}</div>
          <div className="space-x-2 opacity-80 font-mono">
            {ticker && <span>{ticker}</span>}
            {!network ? (
              <span className="text-xs opacity-70">{id}</span>
            ) : (
              <b
                className={
                  network.isMainnet
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-orange-600 dark:text-orange-500'
                }
              >
                {network.isMainnet ? 'MainNet' : 'TestNet'}
              </b>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2 divide-x divide-opacity-50 dark:divide-gray-600">
        <div className="flex items-end space-x-2 px-2">
          <Amount amount={Number(amount)} decimals={decimals} size={1.25} />
          {ticker && <span className="font-mono opacity-80">{ticker}</span>}
        </div>
        <div
          className={classNames(
            'px-4 flex space-x-2 items-center',
            state.display === 'extension' && 'hidden'
          )}
        >
          {amount !== BigInt(0) && (
            <Link to={`/send/${id}`}>
              <IconButton IconComponent={FaPaperPlane} small name="Send" />
            </Link>
          )}
          {!network && (
            <IconButton IconComponent={FaTrash} small name="Opt out" />
          )}
        </div>
      </div>
    </Card>
  );
};

export default TokenBar;
