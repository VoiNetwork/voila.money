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
        <div className="flex flex-col justify-center items-center space-y-3">
          <div className="grid grid-cols-5 gap-x-4">
            {new Array(5).fill(0).map((_, i) => (
              <div className="flex flex-col space-y-2" key={5 * i + 1}>
                {new Array(5).fill(0).map((_, j) => (
                  <div className="flex space-x-2 items-center" key={5 * i + j + 1}>
                    <span
                      className={classNames(
                        'text-xs font-bold  w-[24px] text-right',
                        textMnemonic !== '' ? 'opacity-30' : 'opacity-80'
                      )}
                    >
                      {5 * i + j + 1}
                    </span>
                    <input
                      onFocus={() => setTypingField(5 * i + j)}
                      onBlur={() => setTypingField(undefined)}
                      onChange={updateMnemonicWord(5 * i + j)}
                      type={
                        showAll || typingField === 5 * i + j
                          ? 'text'
                          : 'password'
                      }
                      autoComplete="off"
                      disabled={textMnemonic !== ''}
                      value={mnemonic[5 * i + j]}
                      className={classNames(
                        'shadow rounded-lg bg-white dark:bg-gray-800 p-2 w-[100px]',
                        mnemonic[5 * i + j] &&
                          (isValidMnemonicWord(mnemonic[5 * i + j])
                            ? 'ring ring-1 ring-green-400'
                            : 'ring ring-2 ring-red-400 bg-red-100'),
                        textMnemonic !== '' && 'opacity-50'
                      )}
                      placeholder={`Word #${5 * i + j + 1}`}
                    />
                  </div>
                ))}
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
        </div>
        {!(mnemonic.every((w) => w === '') && textMnemonic === '') &&
          (account ? (
            <div className="pt-4">
              <div className="flex space-x-2 items-center text-opacity-80 text-green-600 font-bold">
                <FaCheckCircle />
                <span>
                  Mnemonic is valid! You are about to add this account:
                </span>
              </div>
              <div className="flex justify-center p-2">
                <CopiableText text={account?.addr} />
              </div>
            </div>
          ) : (
            <div className="pt-4 flex space-x-2 items-center text-opacity-80 text-red-600 font-bold">
              <FaTimesCircle />
              <span>Your mnemonic is invalid or incomplete</span>
            </div>
          ))}
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
    </div>
  );
};

export default Mnemonic;
