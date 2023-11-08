import React, { useEffect, useState, useMemo } from 'react';
import { AccountTransactionInformation } from '../../utils/account';
import Amount from '../../components/Amount';
import Card from '../../components/Card';
import { classNames } from '../../utils/common';
import { useStore } from '../../utils/store';
import CopiableText from '../../components/CopiableText';

interface TransactionCardProps {
  id: string;
  amount: number;
  assetId: number;
  transaction: AccountTransactionInformation;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ id, amount, assetId, transaction }) => {
  const { state } = useStore();
  const [assetDecimal, setAssetDecimal] = useState(6);
  const [assetUnitName, setAssetUnitName] = useState('');
  
    useEffect(() => {
        if (typeof assetId === 'undefined') { return; }
        const fetchData = async () => {
          try {
            const assetData = await state.node.getAssetByID(assetId).do();
            setAssetUnitName(assetData.params['unit-name'])
            setAssetDecimal(assetData.params.decimals)
          } catch (error) {
            console.error("error fetching asset data:", error);
          }
        };
      
        fetchData();
      }, [assetId]);

  const [txType, txFee] = useMemo(() => {
      let txType = '';
      let txFee = '';
      try {
        txType = window.atob(transaction?.['tx-type']) ;
        //txFee = window.atob(transaction?.['fee']) * (10 * 6);
      } catch {
        // pass
      }
      return [
        transaction?.['tx-type'] || txType,
        transaction?.['fee'] / (10 ** 6) || txFee
      ];
  }, [transaction]);
 
  return (
    <Card
      className={classNames(
        'w-full items-center flex justify-between',
        amount === 0 && 'opacity-50 hover:opacity-100'
      )}
    >
      <div className="flex items-center space-x-2">
        <div className="min-w-max px-2">
        </div>
        <div>
          <div className="text-base font-bold">{txType || 'Unknown'}</div>
          <div className="space-x-2 opacity-80 font-mono">
            <span className="text-xs opacity-70">
              <CopiableText
                text={id}
                showCopiedText={false}
              />
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2 divide-x divide-opacity-50 dark:divide-gray-600">
        <div className="flex items-end space-x-2 px-2">
          <Amount amount={amount} decimals={assetDecimal} size={1.25} />
          <span className="text-xs opacity-70">{assetUnitName}</span>
        </div>
        <div className="flex items-end space-x-2 px-2">
          <span className="text-xs opacity-70">Fee</span>
          <span className="text-xs opacity-70">{txFee} V</span>
        </div>
      </div>
    </Card>
  );
};

export default TransactionCard;
