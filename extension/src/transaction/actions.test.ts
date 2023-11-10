import { getValidatedTxnWrap } from './actions';
import { BaseValidatedTxnWrap } from './baseValidatedTxnWrap';
import { AssetConfigTransaction } from './acfgTransaction';
import { AssetTransferTransaction } from './axferTransaction';
import { AssetCloseTransaction } from './axferCloseTransaction';
import { AssetFreezeTransaction } from './afrzTransaction';
import { ApplicationTransaction } from './applTransaction';
import { OnlineKeyregTransaction } from './keyregOnlineTransaction';
import { OfflineKeyregTransaction } from './keyregOfflineTransaction';

test('Validate build of pay transaction', () => {
  const preTransaction = {
    type: 'pay',
    from: 'NM2MBC673SL7TQIKUXD4JOBR3XQITDCHIMIEODQBUGFMAN54QV2VUYWZNQ',
    to: 'NM2MBC673SL7TQIKUXD4JOBR3XQITDCHIMIEODQBUGFMAN54QV2VUYWZNQ',
    fee: 1000,
    amount: 12345,
    firstRound: 1,
    lastRound: 1001,
    genesisID: 'testnet-v1.0',
    genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
    note: new Uint8Array(0),
  };

  const result = getValidatedTxnWrap(preTransaction, 'pay');
  expect(result instanceof BaseValidatedTxnWrap).toBe(true);
});

test('Validate build of appl transaction', () => {
  const preTransaction = {
    type: 'appl',
    from: 'NM2MBC673SL7TQIKUXD4JOBR3XQITDCHIMIEODQBUGFMAN54QV2VUYWZNQ',
    appAccounts: ['NM2MBC673SL7TQIKUXD4JOBR3XQITDCHIMIEODQBUGFMAN54QV2VUYWZNQ'],
    appArgs: new Uint8Array(0),
    appApprovalProgram: new Uint8Array(0),
    appClearProgram: new Uint8Array(0),
    lease: new Uint8Array(0),
    fee: 1000,
    appIndex: 1,
    extraPages: 1,
    appOnComplete: 0,
    appGlobalByteSlices: 1,
    appGlobalInts: 1,
    appLocalByteSlices: 1,
    appLocalInts: 1,
    appForeignApps: [1],
    appForeignAssets: [1],
    firstRound: 1,
    lastRound: 1001,
    genesisID: 'testnet-v1.0',
    genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
    note: new Uint8Array(0),
    boxes: [{appIndex: 2, name: new Uint8Array(1)}],
  };

  const result = getValidatedTxnWrap(preTransaction, 'appl');
  expect(result instanceof BaseValidatedTxnWrap).toBe(true);
  expect(result instanceof ApplicationTransaction).toBe(true);
});

test('Validate build of keyreg transaction', () => {
  const preTransaction = {
    type: 'keyreg',
    fee: 1000,
    from: 'NM2MBC673SL7TQIKUXD4JOBR3XQITDCHIMIEODQBUGFMAN54QV2VUYWZNQ',
    voteKey: 'NM2MBC673SL7TQIKUXD4JOBR3XQITDCHIMIEODQBUGFMAN54QV2VUYWZNQ',
    selectionKey: 'NM2MBC673SL7TQIKUXD4JOBR3XQITDCHIMIEODQBUGFMAN54QV2VUYWZNQ',
    stateProofKey: 'NM2MBC673SL7TQIKUXD4JOBR3XQITDCHIMIEODQBUGFMAN54QV2VUYWZNQNM2MBC673SL7TQIKUXD4JOBR3XQITDCHIMIEODQBUGFMAN54QV2VUYWZNQ',
    voteFirst: 1,
    voteLast: 1001,
    voteKeyDilution: 1001,
    firstRound: 1,
    lastRound: 1001,
    genesisID: 'testnet-v1.0',
    genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
    note: new Uint8Array(0),
  };

  const result = getValidatedTxnWrap(preTransaction, 'keyreg');
  expect(result instanceof BaseValidatedTxnWrap).toBe(true);
  expect(result instanceof OnlineKeyregTransaction).toBe(true);
});

test('Validate build of offline keyreg transaction', () => {
  const preTransaction = {
    type: 'keyreg',
    fee: 1000,
    from: 'NM2MBC673SL7TQIKUXD4JOBR3XQITDCHIMIEODQBUGFMAN54QV2VUYWZNQ',
    stateProofKey: 'NM2MBC673SL7TQIKUXD4JOBR3XQITDCHIMIEODQBUGFMAN54QV2VUYWZNQNM2MBC673SL7TQIKUXD4JOBR3XQITDCHIMIEODQBUGFMAN54QV2VUYWZNQ',
    firstRound: 1,
    lastRound: 1001,
    genesisID: 'testnet-v1.0',
    genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
    nonParticipation: true,
    note: new Uint8Array(0),
  };

  const result = getValidatedTxnWrap(preTransaction, 'keyreg');
  expect(result instanceof BaseValidatedTxnWrap).toBe(true);
  expect(result instanceof OfflineKeyregTransaction).toBe(true);
});

test('Validate build of acfg transaction', () => {
  const preTransaction = {
    type: 'acfg',
    fee: 1000,
    assetIndex: 1,
    from: 'NM2MBC673SL7TQIKUXD4JOBR3XQITDCHIMIEODQBUGFMAN54QV2VUYWZNQ',
    firstRound: 1,
    lastRound: 1001,
    genesisID: 'testnet-v1.0',
    genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
    assetManager: 'NM2MBC673SL7TQIKUXD4JOBR3XQITDCHIMIEODQBUGFMAN54QV2VUYWZNQ',
    assetReserve: 'NM2MBC673SL7TQIKUXD4JOBR3XQITDCHIMIEODQBUGFMAN54QV2VUYWZNQ',
    assetFreeze: 'NM2MBC673SL7TQIKUXD4JOBR3XQITDCHIMIEODQBUGFMAN54QV2VUYWZNQ',
    assetClawback: 'NM2MBC673SL7TQIKUXD4JOBR3XQITDCHIMIEODQBUGFMAN54QV2VUYWZNQ',
    note: new Uint8Array(0),
  };

  const result = getValidatedTxnWrap(preTransaction, 'acfg');
  expect(result instanceof BaseValidatedTxnWrap).toBe(true);
  expect(result instanceof AssetConfigTransaction).toBe(true);
});

test('Validate build of afrz transaction', () => {
  const preTransaction = {
    type: 'afrz',
    from: 'NM2MBC673SL7TQIKUXD4JOBR3XQITDCHIMIEODQBUGFMAN54QV2VUYWZNQ',
    freezeAccount: 'NM2MBC673SL7TQIKUXD4JOBR3XQITDCHIMIEODQBUGFMAN54QV2VUYWZNQ',
    freezeState: true,
    fee: 1000,
    assetIndex: 1,
    firstRound: 1,
    lastRound: 1001,
    genesisID: 'testnet-v1.0',
    genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
    note: new Uint8Array(0),
  };

  const result = getValidatedTxnWrap(preTransaction, 'afrz');
  expect(result instanceof BaseValidatedTxnWrap).toBe(true);
  expect(result instanceof AssetFreezeTransaction).toBe(true);
});

test('Validate build of axfer transaction', () => {
  const preTransaction = {
    type: 'axfer',
    from: 'NM2MBC673SL7TQIKUXD4JOBR3XQITDCHIMIEODQBUGFMAN54QV2VUYWZNQ',
    to: 'NM2MBC673SL7TQIKUXD4JOBR3XQITDCHIMIEODQBUGFMAN54QV2VUYWZNQ',
    fee: 1000,
    assetIndex: 1,
    amount: 12345,
    firstRound: 1,
    lastRound: 1001,
    genesisID: 'testnet-v1.0',
    genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
    note: new Uint8Array(0),
  };

  const result = getValidatedTxnWrap(preTransaction, 'axfer');
  expect(result instanceof BaseValidatedTxnWrap).toBe(true);
  expect(result instanceof AssetTransferTransaction).toBe(true);
});

test('Validate build of axfer close transaction', () => {
  const preTransaction = {
    type: 'axfer',
    from: 'NM2MBC673SL7TQIKUXD4JOBR3XQITDCHIMIEODQBUGFMAN54QV2VUYWZNQ',
    to: 'NM2MBC673SL7TQIKUXD4JOBR3XQITDCHIMIEODQBUGFMAN54QV2VUYWZNQ',
    closeRemainderTo: 'NM2MBC673SL7TQIKUXD4JOBR3XQITDCHIMIEODQBUGFMAN54QV2VUYWZNQ',
    fee: 1000,
    assetIndex: 1,
    amount: 12345,
    firstRound: 1,
    lastRound: 1001,
    genesisID: 'testnet-v1.0',
    genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
    note: new Uint8Array(0),
  };

  const result = getValidatedTxnWrap(preTransaction, 'axfer');
  expect(result instanceof BaseValidatedTxnWrap).toBe(true);
  expect(result instanceof AssetCloseTransaction).toBe(true);
});

test('Validate build of transaction', () => {
  const preTransaction = {
    type: 'faketype',
  };
  expect(() => getValidatedTxnWrap(preTransaction, 'faketype')).toThrow();
});

// Check missing fields from transactions in all types
test('Validate pay transaction required fields', () => {
  const preTransaction = {
    type: 'pay',
  };
  let message: string = undefined;
  try {
    getValidatedTxnWrap(preTransaction, 'pay');
  } catch (e) {
    message = e.message;
  }
  expect(message).toContain('Validation failed');
  expect(message).toContain('firstRound');
  expect(message).toContain('lastRound');
  expect(message).toContain('genesisID');
  expect(message).toContain('genesisHash');
  expect(message).toContain('to');
  expect(message).toContain('from');
});

test('Validate keyreg transaction required fields', () => {
  const preTransaction = {
    type: 'keyreg',
  };

  let message: string = undefined;
  try {
    getValidatedTxnWrap(preTransaction, 'keyreg');
  } catch (e) {
    message = e.message;
  }
  expect(message).toContain('Validation failed');
  expect(message).toContain('firstRound');
  expect(message).toContain('lastRound');
  expect(message).toContain('genesisID');
  expect(message).toContain('genesisHash');
  expect(message).toContain('from');
  expect(message).toContain('voteKey');
  expect(message).toContain('selectionKey');
  expect(message).toContain('voteFirst');
  expect(message).toContain('voteLast');
  expect(message).toContain('voteKeyDilution');
});

test('Validate offline keyreg transaction required fields', () => {
  const preTransaction = {
    type: 'keyreg',
    nonParticipation: true,
  };

  let message: string = undefined;
  try {
    getValidatedTxnWrap(preTransaction, 'keyreg');
  } catch (e) {
    message = e.message;
  }
  expect(message).toContain('Validation failed');
  expect(message).toContain('firstRound');
  expect(message).toContain('lastRound');
  expect(message).toContain('genesisID');
  expect(message).toContain('genesisHash');
  expect(message).toContain('from');
  expect(message).toContain('nonParticipation');
});

test('Validate clawback transaction required fields', () => {
  const preTransaction = {
    type: 'axfer',
  };
  let message: string = undefined;
  try {
    getValidatedTxnWrap(preTransaction, 'axfer');
  } catch (e) {
    message = e.message;
  }
  expect(message).toContain('Validation failed');
  expect(message).toContain('firstRound');
  expect(message).toContain('lastRound');
  expect(message).toContain('genesisID');
  expect(message).toContain('genesisHash');
  expect(message).toContain('from');
  expect(message).toContain('assetIndex');
  expect(message).toContain('assetRevocationTarget');
});

test('Validate accept transaction required fields', () => {
  const preTransaction = {
    type: 'axfer',
  };
  let message: string = undefined;
  try {
    getValidatedTxnWrap(preTransaction, 'axfer');
  } catch (e) {
    message = e.message;
  }
  expect(message).toContain('Validation failed');
  expect(message).toContain('firstRound');
  expect(message).toContain('lastRound');
  expect(message).toContain('genesisID');
  expect(message).toContain('genesisHash');
  expect(message).toContain('from');
  expect(message).toContain('assetIndex');
});

test('Validate create transaction required fields', () => {
  const preTransaction = {
    type: 'acfg',
  };
  let message: string = undefined;
  try {
    getValidatedTxnWrap(preTransaction, 'acfg');
  } catch (e) {
    message = e.message;
  }
  expect(message).toContain('Validation failed');
  expect(message).toContain('AssetCreateTx');
  expect(message).toContain('firstRound');
  expect(message).toContain('lastRound');
  expect(message).toContain('genesisID');
  expect(message).toContain('genesisHash');
  expect(message).toContain('from');
  expect(message).toContain('assetTotal');
});

test('Validate destroy transaction required fields', () => {
  const preTransaction = {
    type: 'acfg',
  };
  let message: string = undefined;
  try {
    getValidatedTxnWrap(preTransaction, 'acfg');
  } catch (e) {
    message = e.message;
  }
  expect(message).toContain('Validation failed');
  expect(message).toContain('AssetDestroyTx');
  expect(message).toContain('firstRound');
  expect(message).toContain('lastRound');
  expect(message).toContain('genesisID');
  expect(message).toContain('genesisHash');
  expect(message).toContain('from');
  expect(message).toContain('assetIndex');
});

test('Validate modify asset transaction required fields', () => {
  const preTransaction = {
    type: 'acfg',
  };
  let message: string = undefined;
  try {
    getValidatedTxnWrap(preTransaction, 'acfg');
  } catch (e) {
    message = e.message;
  }
  expect(message).toContain('Validation failed');
  expect(message).toContain('AssetConfigTx');
  expect(message).toContain('firstRound');
  expect(message).toContain('lastRound');
  expect(message).toContain('genesisID');
  expect(message).toContain('genesisHash');
  expect(message).toContain('from');
  expect(message).toContain('assetIndex');
  expect(message).toContain('assetManager');
  expect(message).toContain('assetReserve');
  expect(message).toContain('assetFreeze');
  expect(message).toContain('assetClawback');
});
