import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import * as animationDark from '../../assets/logo-dark-animation.json';
import * as animationLight from '../../assets/logo-light-animation.json';
import { ActionTypes, useStore } from '../../utils/store';
import Input from '../../components/Input';
import IconButton from '../../components/IconButton';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { FaLock, FaSignInAlt } from 'react-icons/fa';
import { useSecureStorage } from '../../utils/storage';
import { useDarkMode } from '../../utils/darkMode';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const storage = useSecureStorage();
  const { state, dispatch } = useStore();
  const [password, setPassword] = useState('');
  const [loginDisabled, setLoginDisabled] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSet, setPasswordSet] = useState<boolean>();
  const { isDark } = useDarkMode();
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  useEffect(() => {
    const handleKeyPress = (event: any) => {
      const char = event.key;

      if (!/^[a-zA-Z]$/.test(char)) {
        return;
      }

      const isLetter = char.toUpperCase() !== char.toLowerCase();
      const isCapsLock =
        isLetter &&
        ((event.shiftKey && char === char.toLowerCase()) ||
          (!event.shiftKey && char === char.toUpperCase()));

      setIsCapsLockOn(isCapsLock);
    };

    window.addEventListener('keypress', handleKeyPress);

    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, []);

  const login = async (checkPassword = true) => {
    setLoginDisabled(true);
    try {
      if (checkPassword && passwordSet === false) {
        await storage.setPassword(password);
      }
      const valid = checkPassword
        ? await storage.verifyPassword(password)
        : true;
      if (valid) {
        dispatch(ActionTypes.UPDATE_DATA, {
          name: 'primaryAddress',
          data: (await storage.getPrimaryAddress()) || null,
        });
        dispatch(ActionTypes.UPDATE_DATA, {
          name: 'addresses',
          data: (await storage.getAddresses()) || [],
        });
        dispatch(ActionTypes.UPDATE_DATA, {
          name: 'signedIn',
          data: true,
        });
      } else {
        setLoginDisabled(false);
        toast.error(
          t('view.Login.PasswordMismatch', 'Password mismatch! Retry?')
        );
      }
    } catch (e) {
      setLoginDisabled(false);
      toast.error(
        t(
          'view.Login.SomethingWentWrong',
          'Something went wrong while trying to login: '
        ) + (e as Error)?.message
      );
    }
  };

  useEffect(() => {
    async function checkPasswordSet() {
      const [isPasswordSet, isStorageAvailable] = await storage.isPasswordSet();
      if (isStorageAvailable) {
        login(false);
      } else {
        setPasswordSet(isPasswordSet);
      }
    }

    checkPasswordSet();
  }, []);

  return (
    <div className="flex flex-col h-full w-full justify-center">
      <div className='h-1/2 flex justify-center w-full'>
        <Lottie
          loop={false}
          autoplay={true}
          animationData={isDark ? animationDark : animationLight}
          rendererSettings={{
            preserveAspectRatio: 'xMidYMid slice',
          }}
          height={state.display === 'tab' ? 300 : 200}
          width={state.display === 'tab' ? 300 : 200}
        />
      </div>
      <div className='h-1/2 flex-col justify-center text-center w-full'>
        {passwordSet !== undefined && (
          <>
            <h1 className="text-2xl md:text-4xl font-bold text-center">
              {passwordSet
                ? t('view.Login.WelcomeBack', 'Welcome back!')
                : t('view.Login.Welcome', 'Welcome!')}
            </h1>
            <h1 className="text-md md:text-lg font-light text-center">
              {passwordSet
                ? t('view.Login.EnterPassword', 'Enter your password')
                : t(
                  'view.Login.SetupPassword',
                  'Set up your password - at least 8 characters'
                )}
            </h1>
            <div className="text-center flex justify-center">
              <Input
                icon={<FaLock />}
                type="password"
                placeholder={t('view.Login.Password', 'Password') as string}
                value={password}
                onChange={setPassword}
                onEnter={login}
              />
            </div>
            {!passwordSet && (
              <div className="text-center pt-4 flex space-x-2 justify-center">
                <Input
                  icon={<FaLock />}
                  type="password"
                  placeholder={
                    t('view.Login.ConfirmPassword', 'Confirm password') as string
                  }
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  onEnter={login}
                />
              </div>
            )}
            {isCapsLockOn && (
              <span className="text-red-400 font-bold pt-2">
                Caps Lock is on!
              </span>
            )}
            <div className="p-6 flex justify-center w-full">
              <IconButton
                IconComponent={FaSignInAlt}
                name={'Enter'}
                onClick={login}
                disabled={
                  loginDisabled ||
                  (!passwordSet && confirmPassword !== password) ||
                  !password
                }
              >
                <span>{t('view.Login.Enter', 'Enter')}</span>
              </IconButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
