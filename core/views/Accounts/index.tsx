import React from 'react';
import Card from '../../components/Card';
import { NavLink } from 'react-router-dom';
import {
  FaDownload,
  FaKey,
  FaKeybase,
  FaPlusSquare,
  FaShieldAlt,
  FaTrash,
  FaUpload,
} from 'react-icons/fa';
import { useStore } from '../../utils/store';

const Accounts: React.FC = () => {
  const { state } = useStore();

  const ActionCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    url: string;
    description: string;
    disabled?: boolean;
  }> = ({ title, url, description, icon, disabled }) => (
    <div className='p-4'>
      <NavLink
        title={title}
        to={url}
        className={disabled ? 'opacity-50 pointer-events-none' : undefined}
      >
        <Card
          className="max-w-[280px] flex flex-row items-center text-center md:text-left md:items-start md:flex-col"
          disabled={disabled}
        >
          <div className="text-2xl md:text-4xl px-2 md:p-0 md:pb-4 blue">
            {icon}
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold">{title}</h3>
            <span className="px-2 md:px-0 md:text-sm font-light">
              {description}
            </span>
          </div>
        </Card>
      </NavLink>
    </div>
  );

  return (
    <div className='flex-col w-full justify-center'>
      <h1 className="font-bold text-center md:text-left text-3xl md:text-5xl py-4">
        Configure your <span className="blue">accounts</span>
      </h1>
      <div className="flex-col w-full justify-center text-center md:py-8">
        <div className="flex-col w-full">
          <ActionCard
            icon={<FaPlusSquare />}
            title="Create an account"
            url="/accounts/create"
            description="Set up a fresh account to manage your assets securely"
          />
          <ActionCard
            icon={<FaKey />}
            title="Import mnemonic"
            url="/accounts/mnemonic"
            description="Restore an existing account using a mnemonic phrase"
          />
          <ActionCard
            icon={<FaShieldAlt />}
            title="Rekey account"
            url="/accounts/rekey"
            disabled
            description="Change the private key to a different account"
          />
        </div>
        <div className="p-4 text-base md:text-lg text-center md:text-left text-gray-600 dark:text-gray-300">
          or
        </div>
        <div className="flex-col">
          <ActionCard
            icon={<FaDownload />}
            title="Create a backup"
            url="/accounts/backup"
            disabled={state.addresses.length === 0}
            description="Create and download a secure backup of your account keys"
          />
          <ActionCard
            icon={<FaUpload />}
            title="Restore a backup"
            url="/accounts/restore"
            description="Restore your existing accounts from a previous backup"
          />

          <ActionCard
            icon={<FaTrash className="text-red-500" />}
            title="Remove an account"
            url="/accounts/remove"
            disabled={state.addresses.length === 0}
            description="Permanently remove account data from this device"
          />
        </div>
      </div>
    </div>
  );
};

export default Accounts;
