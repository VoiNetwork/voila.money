import React, { useState } from 'react';
import Input from '../../components/Input';
import { FaCheck, FaChevronLeft, FaCoins, FaMoon, FaSun } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import IconButton from '../../components/IconButton';
import ConfirmationModal from '../../components/ConfirmationModal';
import TransactionModal from '../../components/TransactionModal';
import { useAccount } from '../../utils/account';
import { ActionTypes, useStore } from '../../utils/store';
import { useSecureStorage } from '../../utils/storage';
import toast from 'react-hot-toast';
import Switch from '../../components/Switch';
// @ts-ignore
import arc200 from 'arc200js';

const Opt: React.FC = () => {
  const { state, dispatch } = useStore();
  const { account, assets } = useAccount();
  const storage = useSecureStorage();
  const [assetId, setAssetId] = useState<string>('');
  const [confirmationModalOpen, setConfirmationModalOpen] =
    useState<boolean>(false);
  const [transactionModalOpen, setTransactionModalOpen] =
    useState<boolean>(false);
  const [waitingResponse, setWaitingResponse] = useState<boolean>(false);
  const [transactionSuccess, setTransactionSuccess] = useState<boolean>(false);
  const [transactionFailed, setTransactionFailed] = useState<boolean>(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [isNativeToken, setIsNativeToken] = useState<boolean>(true);

  const confirmationModalClose = () => setConfirmationModalOpen(false);
  const transactionModalClose = () => setTransactionModalOpen(false);

  // TODO resolve token type from assetId
  const send = async () => {
    setWaitingResponse(true);
    setTransactionSuccess(false);
    setTransactionFailed(false);
    setTxId(null);
    try {
      if (account?.address) {
        console.log('send account.address', account.address);
        if (isNativeToken) {
          const request: any = {
            address: account.address,
            txnParams: {
              from: account.address,
              to: account.address,
              note: 'Voila!',
              amount: '0',
              type: 'axfer',
              assetIndex: parseInt(assetId),
            },
            network: state.network,
          };
          let response = await storage.signTransactions(request);
          console.log('response', response);
          if ('error' in response) {
            toast.error('Error');
            setTransactionFailed(true);
          } else {
            setTxId(response.txId);
            setTransactionSuccess(true);
            toast.success('Success');
          }
        } else {
          //TODO: Add support for an ARC200 "opt in" (Not really an opt in) transaction
          console.log('Not yet implemented');
          console.log('assetId', assetId);
          const optedInTokens: number[] = await storage.getTokens();
          console.log("optedInTokens", optedInTokens)
          if (optedInTokens.indexOf(parseInt(assetId)) > 0) {//Already opted in
            toast.success('Already Opted In');
          } else {
            const [token, tokens] = await storage.addToken(assetId);
            console.log('tokens', tokens);
            dispatch(ActionTypes.UPDATE_DATA, {
              name: 'tokens',
              data: { tokens }
            });
            setTxId('xxxxxxxxx');
            setTransactionSuccess(true);
            toast.success('Success');
          }
        }
      }
    } catch (exception) {
      console.error(exception);
      toast.error('Error');
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
        onConfirmClick={send}
        confirmationText={'You are about to add an asset'}
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
          <div className="flex w-full items-center justify-center flex-col">
            <span>{isNativeToken ? 'VSA' : 'VRC200'}</span>
            <Switch
              id={'toggle-assettype'}
              name={'toggle-assettype'}
              checked={!!isNativeToken}
              onChange={() => setIsNativeToken(!isNativeToken)}
            />
          </div>
          <div>
            <Input
              placeholder={'ID'}
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
