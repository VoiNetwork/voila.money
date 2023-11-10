import React, { useEffect, useState } from 'react';
import {
  FaSave,
  FaTimesCircle,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
  FaBroom,
  FaChevronLeft,
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import IconButton from '../../../components/IconButton';
import wordlist from './wordlist';
import { classNames } from '../../../utils/common';
import algosdk from 'algosdk';
import CopiableText from '../../../components/CopiableText';
import SmallButton from '../../../components/SmallButton';
import toast from 'react-hot-toast';
import { ActionTypes, useStore } from '../../../utils/store';
import { useSecureStorage } from '../../../utils/storage';

const Mnemonic: React.FC = () => {
  const storage = useSecureStorage();
  const navigate = useNavigate();
  const { dispatch } = useStore();
  const [mnemonic, setMnemonic] = useState(new Array(25).fill(''));
  const [typingField, setTypingField] = useState<number>();
  const [textMnemonic, setTextMnemonic] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [account, setAccount] = useState<algosdk.Account>();

  const updateMnemonicWord = (index: number) => (event?: any) => {
    setMnemonic((m) => {
      const newMnemonic = [...m];
      newMnemonic[index] = (event?.target?.value || '').trim().toLowerCase();
      return newMnemonic;
    });
  };

  const updateTextMnemonic = (event?: any) => {
    setTextMnemonic((event?.target?.value || '').toLowerCase());
  };

  const isValidMnemonicWord = (value: string) => {
    return wordlist.includes(value);
  };

  const checkValidMnemonic = (): algosdk.Account | undefined => {
    const cleanMnemonic = textMnemonic
      ? textMnemonic
        .replaceAll(',', '')
        .split(' ')
        .map((w) => w.trim())
        .join(' ')
      : mnemonic.join(' ');
    try {
      const account = algosdk.mnemonicToSecretKey(cleanMnemonic);
      return account;
    } catch {
      //
    }
  };

  useEffect(() => {
    setAccount(checkValidMnemonic());
  }, [textMnemonic, mnemonic]);

  const saveAccount = async () => {
    if (account) {
      try {
        const [primaryAddress, addresses] = await storage.addAccount(
          algosdk.secretKeyToMnemonic(account.sk)
        );
        dispatch(ActionTypes.UPDATE_DATA, {
          name: 'primaryAddress',
          data: primaryAddress,
        });
        dispatch(ActionTypes.UPDATE_DATA, {
          name: 'addresses',
          data: addresses,
        });
        navigate('/');
      } catch (e) {
        console.error(e);
        toast.error(
          'Something went wrong while saving account: ' + (e as Error)?.message
        );
      }
    }
  };

  return (
    <div>
      <h1 className="font-bold text-center md:text-left text-3xl md:text-5xl py-4">
        Import an <span className="blue">account</span>
      </h1>
      <div className="flex w-full items-center justify-center flex-col space-y-8 py-16">
        <textarea
          className={classNames(
            'shadow rounded-lg p-2 w-full bg-white dark:bg-gray-800 max-w-screen-sm h-[96px]',
            mnemonic.some((w) => w !== '') && 'opacity-50'
          )}
          placeholder="Paste 25 words of your mnemonic here"
          style={{ resize: 'none' }}
          value={textMnemonic}
          disabled={mnemonic.some((w) => w !== '')}
          onChange={updateTextMnemonic}
        />
        <div
          className={classNames(
            'select-none pointer-event-none',
            mnemonic.every((w) => w === '') && textMnemonic === ''
              ? 'opacity-80'
              : 'opacity-30'
          )}
        >
          or
        </div>
        <div className="flex justify-center items-center w-full flex-wrap">
          {new Array(25).fill(0).map((_, i) => (
            <div className='p-2'>
              <input
                onFocus={() => setTypingField(i)}
                onBlur={() => setTypingField(undefined)}
                onChange={updateMnemonicWord(i)}
                type={
                  showAll || typingField === i
                    ? 'text'
                    : 'password'
                }
                autoComplete="off"
                disabled={textMnemonic !== ''}
                value={mnemonic[i]}
                className={classNames(
                  'shadow rounded-lg bg-white dark:bg-gray-800 p-2 w-[100px]',
                  mnemonic[i] &&
                  (isValidMnemonicWord(mnemonic[i])
                    ? 'ring ring-1 ring-green-400'
                    : 'ring ring-2 ring-red-400 bg-red-100'),
                  textMnemonic !== '' && 'opacity-50'
                )}
                placeholder={`Word #${i + 1}`}
              />
            </div>
          ))}
        </div>
        <div className="flex space-x-2">
          <SmallButton
            disabled={textMnemonic !== ''}
            IconComponent={FaBroom}
            onClick={() => setMnemonic(new Array(25).fill(''))}
          >
            Clear
          </SmallButton>
          <SmallButton
            disabled={textMnemonic !== ''}
            IconComponent={showAll ? FaEyeSlash : FaEye}
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? 'Hide' : 'Show'}
          </SmallButton>
        </div>
        <div className='flex-col justify-center pt-4 flex space-y-2 space-x-2 items-center text-opacity-80 text-red-600 font-bold'>
          {!(mnemonic.every((w) => w === '') && textMnemonic === '') &&
            (account ? (
              <>
                <div className='text-green-600'>
                  <FaCheckCircle />
                </div>
                <div className="flex space-x-2 items-center text-opacity-80 text-green-600 font-bold">
                  <span>
                    Mnemonic is valid! You are about to add this account:
                  </span>
                </div>
                <div className="flex justify-center p-2 text-black">
                  <CopiableText text={account?.addr} />
                </div>
              </>
            ) : (
              <>
                <FaTimesCircle />
                <span>Your mnemonic is invalid or incomplete</span>
              </>
            ))}
        </div>
        <div className="p-4 flex space-x-4">
          <Link to={'/accounts'}>
            <IconButton IconComponent={FaChevronLeft} name="Cancel">
              <span>Back</span>
            </IconButton>
          </Link>
          <IconButton
            onClick={saveAccount}
            IconComponent={FaSave}
            name="Save"
            disabled={!account}
            primary
          >
            <span>Save</span>
          </IconButton>
        </div>
      </div>
    </div >
  );
};

export default Mnemonic;
