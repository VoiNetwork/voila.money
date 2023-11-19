import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useStore } from '../../utils/store';
import AssetBar from './AssetBar';
import Card from '../../components/Card';
import { useAccount } from '../../utils/account';
import Loader from '../../components/Loader';
import { FaExclamationTriangle, FaKey, FaPlus } from 'react-icons/fa';
import CopiableText from '../../components/CopiableText';
import IconButton from '../../components/IconButton';
import { Link } from 'react-router-dom';
import { AccountAssetInformation } from '../../../common/types';
import { useSecureStorage } from '../../utils/storage';
// @ts-ignore
import arc200 from 'arc200js';
import TokenBar from './TokenBar';

const Home: React.FC = () => {
  const storage = useSecureStorage();
  const { state } = useStore();
  const { account, assets, tokens } = useAccount();
  const [loading, setLoading] = useState(false);
  const [balances, setBalances] = useState<any>(null);

  useLayoutEffect(() => {
    setLoading(true);
  }, [state.node, state.primaryAddress]);

  // EFFECT: update account balances
  useEffect(() => {
    if (account) {
      setLoading(false);
    }
  }, [account]);

  // EFFECT: update account balances
  useEffect(() => {
    if (account && tokens) {
      (async () => {
        console.log("tokens", tokens)
        console.log("account", account)
        const balances = (
          await Promise.all(
            Object.values(tokens).map(async (t) => {
              const ci = new arc200(t.id, state.node);
              const bal = await ci.arc200_balanceOf(account.address);
              return { [t.id]: bal.returnValue };
            })
          )
        ).reduce((a, b) => ({ ...a, ...b }), {});
        console.log("balances", balances)
        setBalances(balances);
      })();
    }
  }, [account, tokens]);
  
  const tokenBalance = Math.max(
    account ? account.amount - account['min-balance'] : 0,
    0
  );

  const [holdingAssets, emptyAssets] = useMemo(() => {
    const sort = (a: AccountAssetInformation, b: AccountAssetInformation) => {
      return a['asset-id'] - b['asset-id'];
    };

    const holding: AccountAssetInformation[] = [];
    const empty: AccountAssetInformation[] = [];
    account?.assets.forEach((a) => {
      if (a.amount > 0) holding.push(a);
      else empty.push(a);
    });
    holding.sort(sort);
    empty.sort(sort);
    return [holding, empty];
  }, [account]);

  return loading ? (
    <Loader />
  ) : (
    <div>
      <div className="w-full flex-col justify-center space-y-8">
        <div className="w-full">
          <AssetBar
            id={0}
            assets={assets}
            amount={tokenBalance}
            network={state.network}
          />
          {account?.['auth-addr'] && (
            <div className="flex w-full space-x-4 text-xs sm:text-sm items-center p-4 pr-8">
              {state.addresses.includes(account?.['auth-addr']) ? (
                <FaKey
                  className="blue"
                  size={state.display === 'extension' ? 16 : 24}
                />
              ) : (
                <FaExclamationTriangle
                  color="red"
                  size={state.display === 'extension' ? 16 : 24}
                />
              )}
              <div className="flex flex-col items-start">
                <span className="opacity-50">
                  Account rekeyed to
                  {!state.addresses.includes(account?.['auth-addr']) &&
                    ' unimported account'}
                </span>
                <div>
                  <CopiableText text={account?.['auth-addr']} />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex w-full justify-center md:justify-end">
          <Link to="opt">
            <IconButton IconComponent={FaPlus} name="Add assets" />
          </Link>
        </div>
        {(account?.amount || 0) > 0 && (
          <>
            <div className="w-full flex-col space-y-2 justify-center">
              { holdingAssets.length < 1 && emptyAssets.length < 1 && Object.values(tokens).length < 1 ? (
                <div className="flex w-full justify-center">
                  <Card className="opacity-50 md:w-1/3">
                    <div className="text-center w-full">
                      No assets to be found here. Add some?
                    </div>
                  </Card>
                </div>
              ) : null}
              {holdingAssets.map((a: any) => (
                <AssetBar
                  id={a['asset-id']}
                  key={a['asset-id']}
                  assets={assets}
                  amount={a['amount']}
                />
              ))}
              {balances &&
                Object.values(tokens).map((t) => {
                  const { id } = t;
                  const amount = balances[id] || BigInt(0);
                  return (
                    <TokenBar
                      id={id}
                      key={`token-${id}`}
                      tokens={tokens}
                      amount={amount}
                    />
                  );
                })}
            </div>
            <div className="flex w-full flex-col space-y-2">
              {emptyAssets.map((a: any) => (
                <AssetBar
                  id={a['asset-id']}
                  key={a['asset-id']}
                  assets={assets}
                  amount={a['amount']}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
