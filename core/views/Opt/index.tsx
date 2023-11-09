import React, { useState } from 'react';
import Input from '../../components/Input';
import { FaCheck, FaChevronLeft, FaCoins, FaFileCode, FaPaperPlane, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import IconButton from '../../components/IconButton';
import Card from '../../components/Card';
import CopiableText from '../../components/CopiableText';
import Modal from '../../components/Modal';
import { useAccount } from '../../utils/account';
import { useStore } from '../../utils/store';
import { useSecureStorage } from '../../utils/storage';
import toast from 'react-hot-toast';
import Switch from '../../components/Switch';

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
  const [isVsa, setIsVsa] = useState(true);
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
      <Modal open={confirmationModalOpen} onClose={confirmationModalClose}>
        <Card className="flex w-full items-center justify-center flex-col space-y-8">
          {waitingResponse ?
            `Waiting for transaction confirmation`
            :
            `You are about to add an asset`
          }
          <div className="p-4 flex space-x-4">
            {waitingResponse ?
              <>
                <div className="border-gray-300 h-20 w-20 animate-spin rounded-full border-8 border-t-blue-600" />
              </>
              :
              <>
                <IconButton IconComponent={FaTimes} name="Cancel" onClick={confirmationModalClose}>
                  <span>Cancel</span>
                </IconButton>
                <IconButton
                  IconComponent={FaPaperPlane}
                  name="Send"
                  onClick={send}
                  primary
                  disabled={waitingResponse}
                >
                  <span>Send</span>
                </IconButton>
              </>
            }
          </div>
        </Card>
      </Modal>
      <Modal open={transactionModalOpen} onClose={transactionModalClose}>
        <Card className="flex w-full items-center justify-center flex-col space-y-8">
          {transactionSuccess ?
            `Transaction Successful`
            :
            transactionFailed ? `Transaction Failed` : `Transaction Unknown`
          }
          <div className='pt-6'>
            {transactionSuccess && txId ? <CopiableText text={txId} full={false} showCopiedText={false} /> : null}
          </div>
          <div className="p-4 flex space-x-4">
            <IconButton
              IconComponent={FaCheck}
              name="Ok"
              onClick={() => transactionModalClose()}
              primary
            >
            </IconButton>
          </div>
        </Card>
      </Modal>
      <div>
        <h1 className="font-bold text-center md:text-left text-3xl md:text-5xl py-4">
          <span className="blue">Add</span> assets
        </h1>
        <div className="flex w-full items-center justify-center flex-col space-y-8 py-16">
          <Switch
            id={'toggle-asset'}
            name={'toggle-asset'}
            checked={isVsa}
            onChange={() => setIsVsa(!isVsa)}
            iconOff={<FaFileCode size="0.7rem" />}
            iconOn={<FaCoins size="0.7rem" />}
          />
          <div>
            <Input
              placeholder={isVsa ? 'Asset Id' : 'App Id'}
              value={assetId}
              onChange={setAssetId}
              icon={isVsa ? <FaCoins /> : <FaFileCode />}
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
