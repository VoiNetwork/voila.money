import React, { useState } from 'react';
import { useSecureStorage } from '../../../utils/storage';
import { ActionTypes, useStore } from '../../../utils/store';
import Avatar from '../../../components/Avatar';
import CopiableText from '../../../components/CopiableText';
import IconButton from '../../../components/IconButton';
import { FaChevronLeft, FaTimes, FaTrash } from 'react-icons/fa';
import Modal from '../../../components/Modal';
import Card from '../../../components/Card';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Remove: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [addressToRemove, setAddressToRemove] = useState<string>();
  const storage = useSecureStorage();
  const { state, dispatch } = useStore();

  const closeModal = () => {
    setModalOpen(false);
  };

  const confirm = (address: string) => () => {
    setAddressToRemove(address);
    setModalOpen(true);
  };

  const removeAccount = async () => {
    if (addressToRemove) {
      try {
        const [primaryAddress, addresses] = await storage.removeAccount(
          addressToRemove
        );
        dispatch(ActionTypes.UPDATE_DATA, {
          name: 'primaryAddress',
          data: primaryAddress,
        });
        dispatch(ActionTypes.UPDATE_DATA, {
          name: 'addresses',
          data: addresses,
        });
        closeModal();
      } catch (e) {
        console.error(e);
        toast.error(
          'Something went wrong while removing account. Time to reconsider? ' +
          (e as Error)?.message
        );
      }
    }
  };

  return (
    <div>
      <Modal open={modalOpen} onClose={closeModal}>
        <Card className="flex space-y-2 flex-col justify-center items-center text-center">
          <div>
            You are about to <b className="text-red-500">permanently</b> remove
            this address and associated <b>private key</b>.
          </div>
          <div>
            <div className="flex space-x-2 items-center p-4">
              <Avatar content={addressToRemove || ''} className="h-8 w-8" />
              <CopiableText text={addressToRemove} showCopiedText={false} />
            </div>
          </div>
          <div>
            If you do not have a backup, access to this account will be{' '}
            <b className="text-red-500">unrecoverable</b>.
          </div>
          <div>Are you sure about this?</div>
          <div className="p-4 flex space-x-4">
            <div>
              <IconButton
                IconComponent={FaTimes}
                onClick={closeModal}
                name="Cancel"
                primary
              >
                <span>No, keep account</span>
              </IconButton>
            </div>
            <div>
              <IconButton
                onClick={removeAccount}
                IconComponent={FaTrash}
                name="Remove"
                primary
                danger
              >
                <span>Yes, remove account</span>
              </IconButton>
            </div>

          </div>
        </Card>
      </Modal>
      <h1 className="font-bold text-center md:text-left text-3xl md:text-5xl py-4">
        Remove an <span className="blue">account</span>
      </h1>
      <div className="flex justify-center p-8">
        <div className="max-w-screen-md w-full divide-y divide-opacity-50 dark:divide-gray-600">
          {state.addresses.map((address) => (
            <div className="flex w-full justify-between items-center">
              <div className="flex space-x-2 items-center p-4">
                <Avatar content={address} className="h-8 w-8" />
                <CopiableText text={address} />
              </div>
              <div className="text-red-400">
                <IconButton
                  IconComponent={FaTrash}
                  name="Remove"
                  danger
                  primary
                  onClick={confirm(address)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 w-full justify-center flex space-x-4">
        <Link to={'/accounts'}>
          <IconButton IconComponent={FaChevronLeft} name="Cancel">
            <span>Back</span>
          </IconButton>
        </Link>
      </div>
    </div>
  );
};

export default Remove;
