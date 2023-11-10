import React, { useState } from 'react';
import { useAccount } from '../../utils/account';
import TransactionCard from './TransactionCard';

const Activity: React.FC = () => {
  const { transactions } = useAccount();
  const [loading, setLoading] = useState(false);

  function getTransactionAmount(t: any) {
    let transactionType = t['tx-type'];
    switch (transactionType) {
      case "pay":
        return t['payment-transaction']?.['amount'];
      case "axfer":
        return t['asset-transfer-transaction']?.['amount'];
      default:
        return "0"
    }
  }

  return (
    <div className='w-full'>
      <h1 className="font-bold text-center md:text-left text-3xl md:text-5xl py-4">
        Recent <span className="blue">activity</span>
      </h1>
      <div className="flex-col w-full flex-col space-y-4 pt-4">
        {transactions[0]?.map((t: any) => {
          return (
            <TransactionCard
              id={t['id']}
              key={t['id']}
              transaction={t}
              amount={getTransactionAmount(t)}
              assetId={t['asset-transfer-transaction']?.['asset-id']}
            />
          )
        }
        )}
      </div>
    </div>
  );
};

export default Activity;


