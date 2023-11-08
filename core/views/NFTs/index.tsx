import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useStore } from '../../utils/store';
import AssetCard from './AssetCard';
import Card from '../../components/Card';
import { useAccount, AccountAssetInformation } from '../../utils/account';
import Loader from '../../components/Loader';
import { FaExclamationTriangle, FaKey, FaPlus } from 'react-icons/fa';
import CopiableText from '../../components/CopiableText';
import IconButton from '../../components/IconButton';
import { Link } from 'react-router-dom';

const NFTs: React.FC = () => {
  const { state } = useStore();
  const { account, assets } = useAccount();
  const [loading, setLoading] = useState(false);
  console.log("assets", assets)
  useLayoutEffect(() => {
    setLoading(true);
  }, [state.node, state.primaryAddress]);

  useEffect(() => {
    if (account) {
      setLoading(false);
    }
  }, [account]);

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
      //if (a.amount > 0) holding.push(a);
      //else empty.push(a);
      const asset = assets[a['asset-id']];
      if (a.amount > 0) {
        if (asset && asset.decimals < 2 && asset?.url) {
          holding.push(a);
        }
      } else {
        if (asset && asset.decimals < 2 && asset?.url) {
          empty.push(a);
        }
      }
    });
    holding.sort(sort);
    empty.sort(sort);
    return [holding, empty];
  }, [account]);

  return loading ? (
    <Loader />
  ) : (
    <div>
      <h1 className="font-bold text-center md:text-left text-3xl md:text-5xl py-4">
        Your <span className="blue">NFT</span> portfolio
      </h1>
      <div className="flex flex-col justify-center items-start space-y-8">
        {(account?.amount || 0) > 0 && (
          <>
            <div className="flex w-full items-center justify-center">
              <Link to="opt">
                <IconButton IconComponent={FaPlus} name="Add assets" />
              </Link>
            </div>
            <div className="flex w-full max-w-screen-lg flex-col space-y-2">
              {holdingAssets.length > 0 ? (
                holdingAssets.map((a: any) => (
                  <AssetCard
                    id={a['asset-id']}
                    key={a['asset-id']}
                    assets={assets}
                    amount={a['amount']}
                  />
                ))
              ) : (
                <Card className="opacity-50">
                  <div className="text-center w-full">
                    No NFTs to be found here. Add some?
                  </div>
                </Card>
              )}
            </div>
            <div className="flex w-full max-w-screen-lg flex-col space-y-2">
              {emptyAssets.map((a: any) => (
                <AssetCard
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

export default NFTs;
