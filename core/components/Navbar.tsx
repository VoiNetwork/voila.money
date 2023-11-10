import React from 'react';
import logoLight from '../assets/text-light.svg';
import logoDark from '../assets/text-dark.svg';
import Switch from './Switch';
import {
  FaSun,
  FaMoon,
  FaLock,
  FaExternalLinkAlt,
  FaCog,
} from 'react-icons/fa';
import { ActionTypes, useStore } from '../utils/store';
import { Link, useLocation } from 'react-router-dom';
import IconButton from './IconButton';
import { useTranslation } from 'react-i18next';
import { useSecureStorage } from '../utils/storage';
import NetworkSettings from './NetworkSettings';
import { useDarkMode } from '../utils/darkMode';
import Avatar from './Avatar';

const Navbar: React.FC<{ toggleShowAccountDropDown: () => void }> = ({toggleShowAccountDropDown}) => {
  const { t } = useTranslation();
  const storage = useSecureStorage();
  const location = useLocation();
  const { state, dispatch } = useStore();
  const { isDark, toggleDarkMode } = useDarkMode();

  const lock = async () => {
    try {
      dispatch(ActionTypes.LOCK);
      await storage.lock();
    } catch (e) {
      console.error('Error while locking:', e);
    }
  };

  return (
    <nav className="top-0 left-0 right-0 relative transition-all p-2 md:p-4">
      <div className="container mx-auto px-2 md:px-4 flex items-center justify-between space-x-4">
        <div className="flex items-center min-w-max py-1 md:py-2">
          <Link to="/">
            <img
              className="h-6 md:h-8 w-auto select-none cursor-pointer"
              src={(isDark ? logoDark : logoLight) as unknown as string}
              alt={'Logo'}
            />
          </Link>
        </div>
        <div className="flex space-x-2 md:space-x-4 items-center min-h-[48px]">
          {state.display !== 'extension' ? (
            <>
              <Switch
                id={'toggle-theme'}
                name={'toggle-theme'}
                checked={!!isDark}
                onChange={toggleDarkMode}
                iconOff={<FaSun size="0.8rem" />}
                iconOn={<FaMoon size="0.8rem" />}
              />
              {state.signedIn && state.primaryAddress && (
                <>
                  <NetworkSettings />
                  <Link to="/settings">
                    <IconButton
                      IconComponent={FaCog}
                      name={'Settings'}
                      disabled
                      primary={location.pathname === '/settings'}
                    />
                  </Link>
                  <IconButton
                    onClick={lock}
                    IconComponent={FaLock}
                    name={t('components.Navbar.Lock', 'Lock wallet')}
                  />
                </>
              )}
            </>
          ) : (
            <>
              {state.signedIn && state.primaryAddress &&
                <>
                  <div
                    key={`ava-${state.primaryAddress}`}
                    onClick={() => toggleShowAccountDropDown()}
                    className={`transition-all cursor-pointer h-11 w-11 hover:w-12 hover:h-12`}
                  >
                    <Avatar content={state.primaryAddress} className={'min-w-max min-h-max'} />
                  </div>
                  <NetworkSettings />
                </>
              }
              <a href="/wallet.html" target="_blank" className="text-blue-400">
                <FaExternalLinkAlt size="1.2rem" />
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
