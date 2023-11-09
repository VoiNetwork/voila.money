import React, { useMemo, useState } from 'react';
import Input from '../../components/Input';
import {
  FaCheck,
  FaChevronLeft,
  FaCoins,
  FaPaperPlane,
  FaTimes,
  FaUser,
  FaPencilAlt
} from 'react-icons/fa';
import IconButton from '../../components/IconButton';
import { Link, useParams } from 'react-router-dom';
import { useAccount } from '../../utils/account';
import Modal from '../../components/Modal';
import Card from '../../components/Card';
import { useStore } from '../../utils/store';
import { classNames } from '../../utils/common';
import assetPlaceholder from '../../assets/asset.png';
import Amount from '../../components/Amount';
import { useSecureStorage } from '../../utils/storage';
import toast from 'react-hot-toast';
import CopiableText from '../../components/CopiableText';

const Send: React.FC = () => {
  const { account, assets } = useAccount();
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [waitingResponse, setWaitingResponse] = useState(false);
  const [amount, setAmount] = useState('');
  const [receiver, setReceiver] = useState('');
  const [note, setNote] = useState('');
  const [txId, setTxId] = useState(null);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [transactionFailed, setTransactionFailed] = useState(false);
  const { state } = useStore();
  const { id } = useParams();
  const storage = useSecureStorage();

  const asset: {
    name: string;
    ticker: string;
    decimals: number;
    amount: number;
  } = useMemo(() => {
    const numberId = Number.parseInt(id || '');
    if (account && !Number.isNaN(numberId)) {
      if (numberId === 0) {
        const token = state.network.token;
        return {
          name: token.name,
          ticker: token.ticker,
          decimals: token.decimals,
          amount: Math.max(0, account.amount - account['min-balance']),
        };
      } else {
        const a = assets[numberId];
        let name = 'Unknown';
        let ticker = '';
        try {
          name = window.atob(a?.['name-b64']);
          ticker = window.atob(a?.['unit-name-b64']);
        } catch {
          // pass
        }
        const userA = account.assets.find((a) => a['asset-id'] === numberId);
        return {
          name: a?.name || name,
          ticker: a?.['unit-name'] || ticker,
          decimals: a?.decimals || 0,
          amount: userA?.amount || 0,
        };
      }
    }
    return {
      name: 'Unknown',
      ticker: '',
      decimals: 0,
      amount: 0,
    };
  }, [account, assets, state.network, id]);

  const confirmationModalClose = () => setConfirmationModalOpen(false);
  const transactionModalClose = () => setTransactionModalOpen(false);

  const send = async () => {
    setWaitingResponse(true);
    setTransactionSuccess(false);
    setTransactionFailed(false);
    setTxId(null);
    try {
      if (account?.address) {
        console.log("send account.address", account.address)

        const decimals = 'decimals' in asset ? asset.decimals : 6;
        const amountArray = amount.split('.');
        const decimalsOnTheInput = amountArray.length > 1;
        let amountToSend = BigInt(amountArray[0]) * BigInt(Math.pow(10, decimals));
        if (decimalsOnTheInput) {
          amountToSend +=
            BigInt(amountArray[1]) * BigInt(Math.pow(10, decimals - amountArray[1].length));
        }
        const request: any = {
          address: account.address,
          txnParams: {
            from: account.address,
            to: receiver,
            note: note !== '' ? note : "Voila!",
            amount: amountToSend.toString(),
          },
          network: state.network
        };
        if ('asset-id' in asset) {
          request.txnParams.type = 'axfer';
          request.txnParams.assetIndex = asset['asset-id'];
        } else {
          request.txnParams.type = 'pay';
        }
        let response = await storage.signTransactions(
          request
        );
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
    setAmount('');
    setReceiver('')
  };

  return (
    <>
      <Modal open={confirmationModalOpen} onClose={confirmationModalClose}>
        <Card className="flex w-full items-center justify-center flex-col space-y-8">
          {waitingResponse ?
            `Waiting for transaction confirmation`
            :
            `You are about to send`
          }
          <div className="p-4 flex space-x-4">
            {waitingResponse ?
              <>
                <div className="border-gray-300 h-20 w-20 animate-spin rounded-full border-8 border-t-blue-600" />
              </>
              :
              <>
                <Link to={'/'}>
                  <IconButton IconComponent={FaTimes} name="Cancel">
                    <span>Cancel</span>
                  </IconButton>
                </Link>
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
          <span className="blue">Send</span> assets
        </h1>
        <div className="flex w-full items-center justify-center flex-col space-y-8 py-16">
          <div className="space-y-4">
            <div className="pb-4">
              <div className="flex space-x-2 items-center">
                <Input
                  placeholder={'Amount'}
                  value={amount}
                  onChange={setAmount}
                  icon={<FaCoins />}
                />
                <div className="flex space-x-1 items-center">
                  {id === '0' ? (
                    <div className="min-w-max px-2">
                      <img
                        src={state.network.token.svg as unknown as string}
                        alt=""
                        className={classNames(
                          'shadow-lg rounded-full text-white w-8 h-8',
                          !state.network.isMainnet &&
                          'bg-orange-500 dark:bg-orange-600 p-1'
                        )}
                      />
                    </div>
                  ) : (
                    <div className="min-w-max px-2">
                      <img
                        src={assetPlaceholder}
                        className="w-8 h-8"
                        alt="asset"
                      />
                    </div>
                  )}
                  <div>
                    <div className="text-base font-bold">{asset.name}</div>
                    <div className="space-x-2 opacity-80 font-mono">
                      {asset.ticker && <span>{asset.ticker}</span>}
                      {id !== '0' ? (
                        <span className="text-xs opacity-70">{id}</span>
                      ) : (
                        <b
                          className={
                            state.network.isMainnet
                              ? 'text-green-600 dark:text-green-500'
                              : 'text-orange-600 dark:text-orange-500'
                          }
                        >
                          {state.network.isMainnet ? 'MainNet' : 'TestNet'}
                        </b>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-xs opacity-80 p-2">
                Available:{' '}
                <Amount amount={asset.amount} decimals={asset.decimals} />
              </div>
            </div>

            <span className="opacity-80">to</span>
            <div>
              <Input
                placeholder={'Account address'}
                value={receiver}
                onChange={setReceiver}
                icon={<FaUser />}
              />
            </div>
            <div>
              <Input
                placeholder={'Note'}
                value={note}
                onChange={setNote}
                icon={<FaPencilAlt />}
              />
            </div>
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

export default Send;
