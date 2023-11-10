import React, { useState } from 'react';
import Input from '../../components/Input';
import { FaCheck, FaChevronLeft, FaCoins } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import IconButton from '../../components/IconButton';
import ConfirmationModal from '../../components/ConfirmationModal';
import TransactionModal from '../../components/TransactionModal';
import { useAccount } from '../../utils/account';
import { useStore } from '../../utils/store';
import { useSecureStorage } from '../../utils/storage';
import toast from 'react-hot-toast';

const Opt: React.FC = () => {
  const { state } = useStore();
  const { account, assets } = useAccount();
  const storage = useSecureStorage();

  const [assetId, setAssetId] = useState('');
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [waitingResponse, setWaitingResponse] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [transactionFailed, setTransactionFailed] = useState(false);
  const [txId, setTxId] = useState(null);

  const confirmationModalClose = () => setConfirmationModalOpen(false);
  const transactionModalClose = () => setTransactionModalOpen(false);

  const send = async () => {//TODO: Add support for an ARC200 "opt in" (Not really an opt in) transaction
    setWaitingResponse(true);
    setTransactionSuccess(false);
    setTransactionFailed(false);
    setTxId(null);
    try {
      if (account?.address) {
        console.log("send account.address", account.address)

        const request: any = {
          address: account.address,
          txnParams: {
            from: account.address,
            to: account.address,
            note: "Voila!",
            amount: "0",
            type: 'axfer',
            assetIndex: parseInt(assetId)
          },
          network: state.network
        };

        let response = await storage.signTransactions(
          request
        );
        console.log("response", response)
        if ('error' in response) {
          toast.error("Error");
          setTransactionFailed(true);
        } else {
          setTxId(response.txId);
          setTransactionSuccess(true);
          toast.success("Success");
        }
      }
    } catch (exception) {
      console.error(exception)
      toast.error("Error");
      setTransactionFailed(true);
    }
    setWaitingResponse(false);
    confirmationModalClose();
    setTransactionModalOpen(true);
    setAssetId('');
  };

  return (
    <>
      <ConfirmationModal
        modalOpen={confirmationModalOpen}
        onModalClose={confirmationModalClose}
        waitingResponse={waitingResponse}
        onConfirmClick={send} confirmationText={'You are about to add an asset'}
      />
      <TransactionModal
        modalOpen={transactionModalOpen}
        onModalClose={transactionModalClose}
        transactionSuccess={transactionSuccess}
        transactionFailed={transactionFailed}
        transactionId={txId}
      />
      <div>
        <h1 className="font-bold text-center md:text-left text-3xl md:text-5xl py-4">
          <span className="blue">Add</span> asset
        </h1>
        <div className="flex w-full items-center justify-center flex-col space-y-8 py-16">
          <div>
            <Input
              placeholder={"ID"}
              value={assetId}
              onChange={setAssetId}
              icon={<FaCoins />}
            />
          </div>
          <div className="p-4 flex space-x-4">
            <Link to={'/'}>
              <IconButton IconComponent={FaChevronLeft} name="Cancel">
                <span>Back</span>
              </IconButton>
            </Link>
            <IconButton
              IconComponent={FaCheck}
              name="Confirm"
              onClick={() => setConfirmationModalOpen(true)}
              primary
            >
              <span>Confirm</span>
            </IconButton>
          </div>
        </div>
      </div>
    </>
  );
};

export default Opt;
