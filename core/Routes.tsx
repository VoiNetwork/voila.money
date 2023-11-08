import React, { FC } from 'react';
import Navbar from './components/Navbar';
import { HashRouter, Routes as BrowserRoutes, Route } from 'react-router-dom';
import Home from './views/Home';
import Sidebar from './components/Sidebar';
import NFTs from './views/NFTs';
import Explore from './views/Explore';
import Activity from './views/Activity';
import { useStore } from './utils/store';
import Login from './views/Login';
import Accounts from './views/Accounts';
import Backup from './views/Accounts/Backup';
import Create from './views/Accounts/Create';
import Mnemonic from './views/Accounts/Mnemonic';
import AccountHeader from './components/AccountHeader';
import Restore from './views/Accounts/Restore';
import Remove from './views/Accounts/Remove';
import Settings from './views/Settings';
import Send from './views/Send';
import Opt from './views/Opt';

const Routes: FC = () => {
  const { state } = useStore();

  return (
    <HashRouter>
      <div
        className="flex flex-col overflow-hidden relative pb-[64px]"
        style={{
          minHeight: state.display === 'extension' ? '600px' : '100vh',
          height: state.display === 'extension' ? '600px' : '100vh',
          maxHeight: state.display === 'extension' ? '600px' : '100vh',
          minWidth: state.display === 'extension' ? '360px' : '100vw',
          width: state.display === 'extension' ? '360px' : '100vw',
          maxWidth: state.display === 'extension' ? '360px' : '100vw',
        }}
      >
        <Navbar />
        {state.addresses.length > 0 && <AccountHeader />}
        {state.signedIn ? (
          <div className="h-full w-full overflow-y-auto flex-col text-sm">
            <Sidebar disabled={state.addresses.length === 0} />
            <div className="p-2 md:px-16 w-full flex-col">
              <div className="w-full max-w-full px-4 max-w-screen-2xl">
                <BrowserRoutes>
                  <Route
                    index
                    element={
                      state.addresses.length > 0 ? <Home /> : <Accounts />
                    }
                  />
                  <Route path="send" element={<Send />} />
                  <Route path="send/:id" element={<Send />} />
                  <Route path="opt" element={<Opt />} />
                  <Route path="nfts" element={<NFTs />} />
                  <Route path="explore" element={<Explore />} />
                  <Route path="activity" element={<Activity />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="accounts">
                    <Route index element={<Accounts />} />
                    <Route path="create" element={<Create />} />
                    <Route path="mnemonic" element={<Mnemonic />} />
                    <Route path="backup" element={<Backup />} />
                    <Route path="restore" element={<Restore />} />
                    <Route path="remove" element={<Remove />} />
                  </Route>
                </BrowserRoutes>
              </div>
            </div>
          </div>
        ) : (
          <Login />
        )}
      </div>
    </HashRouter>
  );
};

export default Routes;
