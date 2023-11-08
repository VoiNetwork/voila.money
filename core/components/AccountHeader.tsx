import React, { useState } from 'react';
import { ActionTypes, useStore } from '../utils/store';
import { useSecureStorage } from '../utils/storage';
import Avatar from './Avatar';
import IconButton from './IconButton';
import { FaEllipsisH } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import CopiableText from './CopiableText';

const AccountHeader: React.FC = () => {
  const storage = useSecureStorage();
  const navigate = useNavigate();
  const { state, dispatch } = useStore();
  const [tempAddress, setTempAddress] = useState<string>('');

  const updatePrimaryAddress = (address: string) => async () => {
    try {
      await storage.setPrimaryAddress(address);
      dispatch(ActionTypes.UPDATE_DATA, {
        name: 'primaryAddress',
        data: (await storage.getPrimaryAddress()) || null,
      });
    } catch (e) {
      toast.error(
        'Something went wrong while setting primary address: ' +
          (e as Error)?.message
      );
    }
  };

  return (
    <div className="flex w-full justify-center md:h-1/3">
      <div className="max-w-screen-2xl flex flex-col w-full justify-center items-center">
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center space-x-4 h-[80px]">
            <IconButton
              IconComponent={FaEllipsisH}
              name="Configure accounts"
              onClick={() => navigate('/accounts')}
            />
            {state.addresses.map((address) => (
              <div
                key={`ava-${address}`}
                onClick={updatePrimaryAddress(address)}
                onMouseEnter={() => setTempAddress(address)}
                onMouseLeave={() => setTempAddress('')}
                className={`transition-all cursor-pointer ${
                  state.primaryAddress === address
                    ? 'max-w-[80px] max-h-[80px]'
                    : 'max-w-[42px] max-h-[42px] hover:max-w-[64px] hover:max-h-[64px]'
                }`}
              >
                <Avatar content={address} className={'min-w-max min-h-max'} />
              </div>
            ))}
          </div>
          <div className="pt-4 px-2">
            <CopiableText
              className="text-sm"
              text={tempAddress || state.primaryAddress}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountHeader;
