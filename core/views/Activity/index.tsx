import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useAccount, AccountTransactionInformation } from '../../utils/account';
import TransactionCard from './TransactionCard';

const Activity: React.FC = () => {
  const { transactions } = useAccount();
  const [loading, setLoading] = useState(false);
  return (
    <div className='w-full'>
      <h1 className="font-bold text-center md:text-left text-3xl md:text-5xl py-4">
        Recent <span className="blue">activity</span>
      </h1>
      <div className="flex-col w-full flex-col space-y-4 pt-4">
        {transactions[0]?.map((t: any) => (//TODO: Support different transaction types
          <TransactionCard
            id={t['id']}
            key={t['id']}
            transaction={t}
            amount={t['payment-transaction']?.['amount']}
            // amount={t['asset-transfer-transaction']?.['amount']}
            assetId={t['asset-transfer-transaction']?.['asset-id']}
          />
        ))}
      </div>
    </div>
  );
};

export default Activity;