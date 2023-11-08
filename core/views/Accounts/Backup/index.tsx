import React, { useState } from 'react';
import Input from '../../../components/Input';
import { Link } from 'react-router-dom';
import IconButton from '../../../components/IconButton';
import { FaChevronLeft, FaDownload, FaLock } from 'react-icons/fa';
import { t } from 'i18next';
import { useSecureStorage } from '../../../utils/storage';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const Backup: React.FC = () => {
  const storage = useSecureStorage();
  const [password, setPassword] = useState('');

  const downloadBackup = async () => {
    try {
      const valid = await storage.verifyPassword(password);
      if (valid) {
        const backup = await storage.createBackup(password);
        var blob = new Blob([backup], { type: 'text/plain' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${dayjs().format(
          'D-MMMM-YYYY-HH-mm'
        )}-voila-money-backup.bak`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        toast.error(
          t(
            'view.Accounts.Backup.PasswordMismatch',
            'Password mismatch! Retry?'
          )
        );
      }
    } catch (e) {
      toast.error(
        t(
          'view.Accounts.Backup.SomethingWentWrong',
          'Something went wrong while trying to create backup: ' +
          (e as Error)?.message
        )
      );
    }
  };

  return (
    <div>
      <h1 className="font-bold text-center md:text-left text-3xl md:text-5xl py-4">
        Create a <span className="blue">backup</span>
      </h1>
      <div className="flex w-full items-center justify-center flex-col space-y-8 py-16">
        <div className="text-center text-md md:text-lg">
          <span className="font-light">
            Your private keys will be encrypted using your password.
            <br />
            Keep the file somewhere safe.
          </span>
          <br />
          <br />
          Please enter your password:
        </div>
        <div className="text-center flex space-x-2 items-center">
          <Input
            type="password"
            icon={<FaLock />}
            placeholder={t('view.Login.Password', 'Password') as string}
            value={password}
            onChange={setPassword}
            onEnter={downloadBackup}
          />
        </div>
        <div className="p-4 flex space-x-4 justify-center w-full">
          <div className=''>
            <Link to={'/accounts'}>
              <IconButton IconComponent={FaChevronLeft} name="Cancel">
                <span>Back</span>
              </IconButton>
            </Link>
          </div>
          <IconButton
            onClick={downloadBackup}
            IconComponent={FaDownload}
            name="Download"
            disabled={password.trim() === ''}
            primary
          >
            <span>Download backup</span>
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default Backup;
