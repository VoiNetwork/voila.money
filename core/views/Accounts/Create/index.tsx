import algosdk from 'algosdk';
import React, { useEffect, useState } from 'react';
import Avatar from '../../../components/Avatar';
import CopiableText from '../../../components/CopiableText';
import IconButton from '../../../components/IconButton';
import { FaChevronLeft, FaRedo, FaSave } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSecureStorage } from '../../../utils/storage';
import { ActionTypes, useStore } from '../../../utils/store';

const Create: React.FC = () => {
  const storage = useSecureStorage();
  const { dispatch } = useStore();
  const navigate = useNavigate();
  const [account, setAccount] = useState<algosdk.Account>();

  const createAccount = () => {
    setAccount(algosdk.generateAccount());
  };

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

  useEffect(() => {
    createAccount();
  }, []);

  return (
    <div className='flex-col text-center justify-center'>
      <h1 className="font-bold text-center md:text-left text-3xl md:text-5xl py-4">
        Create an <span className="blue">account</span>
      </h1>
      <div className="w-full justify-center flex-col">
        <div className="flex-col pb-6">
          <div className='flex justify-center pb-4'>
            <Avatar content={account?.addr || ''} className="max-w-[160px]" />
          </div>
          <div className='flex justify-center'>
            <IconButton
              IconComponent={FaRedo}
              name="Recreate"
              onClick={createAccount}
            />
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <div className="opacity-80">Public address:</div>
          <CopiableText full={false} text={account?.addr || ''} className="text-xl" />
          <div className="opacity-80">Mnemonic:</div>
          {account?.sk ?
            <CopiableText full={false} text={algosdk.secretKeyToMnemonic(account?.sk) || ''} className="text-xl" />
            :
            null
          }
        </div>
        <div className="opacity-80 pt-4">
          Your private key will be securely stored in a backup file
        </div>
        <div className="p-4 flex justify-between">

          <div className='w-1/3'>
            <Link to={'/accounts'}>
              <IconButton IconComponent={FaChevronLeft} name="Cancel">
                <div>Back</div>
              </IconButton>
            </Link>
          </div>
          <div className='w-1/3'>
            <IconButton
              onClick={saveAccount}
              IconComponent={FaSave}
              name="Save"
              primary
            >
              <div>Save</div>
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Create;
