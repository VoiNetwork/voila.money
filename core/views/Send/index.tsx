import React, { useMemo, useState } from 'react';
import Input from '../../components/Input';
import {
  FaCheck,
  FaChevronLeft,
  FaCoins,
  FaPaperPlane,
  FaTimes,
  FaUser,
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
import algosdk from 'algosdk';
import toast from 'react-hot-toast';
import { Buffer } from 'buffer';

const Send: React.FC = () => {
  const { account, assets } = useAccount();
  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [receiver, setReceiver] = useState('');
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

  const closeModal = () => setModalOpen(false);

  const send = async () => {
    try {
      if (account?.address) {
        const suggestedParams = await state.node.getTransactionParams().do();
        const ptxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          from: account.address,
          suggestedParams,
          to: receiver,
          amount: asset.amount,
          note: new Uint8Array(Buffer.from('Voila!')),
        });
        console.log("send account.address", account.address)
        let txns = [
          ptxn
        ];
        let txgroup = algosdk.assignGroupID(txns);
        let response = await storage.signTransactions(
          [txgroup],
          account.address
        );
        console.log("response", response)
        let decodedResponse = Buffer.from(response[0][0].blob).toString('base64');
        console.log(JSON.stringify(response[0][0].txID));
        console.log(JSON.stringify(decodedResponse));
        // toast.success(response[0][0]["txID"]);
      }
    } catch (exception) {
      console.error(exception)
    }
    closeModal();
  };

  return (
    <>
      <Modal open={modalOpen} onClose={closeModal}>
        <Card className="flex w-full items-center justify-center flex-col space-y-8">
          You are about to send
          <div className="p-4 flex space-x-4">
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
            >
              <span>Send</span>
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
              onClick={() => setModalOpen(true)}
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
