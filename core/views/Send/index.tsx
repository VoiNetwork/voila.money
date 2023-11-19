import React, { useEffect, useMemo, useState } from 'react';
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
import { BaseToken, useAccount } from '../../utils/account';
import { useStore } from '../../utils/store';
import { classNames } from '../../utils/common';
import assetPlaceholder from '../../assets/asset.png';
import Amount from '../../components/Amount';
import { useSecureStorage } from '../../utils/storage';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/ConfirmationModal';
import TransactionModal from '../../components/TransactionModal';
// @ts-ignore
import arc200 from 'arc200js';
import { AccountInformation } from '../../../common/types';

const Send: React.FC = () => {
  const { account, assets, tokens } = useAccount();
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [waitingResponse, setWaitingResponse] = useState(false);
  const [amount, setAmount] = useState('');
  const [receiver, setReceiver] = useState('');
  const [note, setNote] = useState('');
  const [txId, setTxId] = useState(null);
  const [isVsa, setIsVsa] = useState(true);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [transactionFailed, setTransactionFailed] = useState(false);
  const { state } = useStore();
  const { id } = useParams();
  const storage = useSecureStorage();
  const [isPending, setIsPending] = useState(true);

  const [arc200Balance, setArc200Balance] = useState(0);
  const [arc200Token, setArc200Token] = useState<BaseToken | null>(null);
  const [arc200ContractInterface, setArc200ContractInterface] = useState<any | null>(null);



  async function getBalance(ci: any, account: AccountInformation) {
    const bal = await ci.arc200_balanceOf(account.address);
    return bal.returnValue;
  }

  useEffect(() => {
    let isArc200 = false;
    let array = Object.values(tokens);
    for (let index = 0; index < Object.values(tokens).length; index++) {
      const element = array[index];
      if (id && parseInt(id) === element.id) {
        isArc200 = true;
        break;
      }
    }
    setIsVsa(!isArc200);
    setIsPending(isArc200);
  }, [id])

  // EFFECT: setup Arc200 needed objects
  useEffect(() => {
    if (account && tokens && id && !isVsa) {
      (async () => {
        console.log("tokens", tokens)
        console.log("account", account)
        const numberId = Number.parseInt(id || '');
        const t = tokens[numberId];
        const ci = new arc200(t.id, state.node);
        const balance = await getBalance(ci, account);
        console.log("balances", balance)
        setArc200Balance(balance);
        console.log("arc200Token", t)
        setArc200Token(t);
        setArc200ContractInterface(ci);
      })();
    }
  }, [account, tokens, id]);

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
        if (isVsa) {
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
        } else {
          if (arc200Token && arc200Balance) {
            setIsPending(false);
            return {
              name: arc200Token.name,
              ticker: arc200Token.symbol,
              decimals: arc200Token.decimals,
              amount: arc200Balance,
            };
          } else {
            return {
              name: "Pending",
              ticker: "Pending",
              decimals: 0,
              amount: 0,
            };
          }

        }
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

        const decimals = 'decimals' in asset ? Number(asset.decimals) : 6;
        const amountArray = amount.split('.');
        const decimalsOnTheInput = amountArray.length > 1;
        let amountToSend = BigInt(amountArray[0]) * BigInt(Math.pow(10, decimals));
        if (decimalsOnTheInput) {
          amountToSend +=
            BigInt(amountArray[1]) * BigInt(Math.pow(10, decimals - amountArray[1].length));
        }

        let response;
        if (isVsa) {
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
          response = await storage.signTransactions(
            request
          );
        } else {
          const request: any = {
            appId: id,
            fromAddress: account.address,
            toAddress: receiver,
            network: state.network,
            amount: amountToSend.toString(),
          }
          response = await storage.signTokenTransactions(request);
        }
        console.log("response", response)
        if (response) {
          if ('error' in response) {
            toast.error("Error");
            setTransactionFailed(true);
          } else {
            setTxId(response.txId);
            setTransactionSuccess(true);
            toast.success("Success");
          }
        } else {
          toast.error("Error");
          setTransactionFailed(true);
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
    setReceiver('');
    setNote('');
  };

  console.log("asset", asset);
  console.log("isPending", isPending);

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
                <Amount amount={Number(asset.amount)} decimals={Number(asset.decimals)} />
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
              disabled={isPending}
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
