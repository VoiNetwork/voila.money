import {
  Validate,
  ValidationStatus,
  STRING_MAX_LENGTH,
  HIGH_FEE_TRESHOLD,
  ELEVATED_FEE_TRESHOLD,
} from './validator';

// Type validations

test('Validate addresses', () => {
  let result = Validate('to', 'NM2MBC673SL7TQIKUXD4JOBR3XQITDCHIMIEODQBUGFMAN54QV2VUYWZNQ');
  expect(result.status).toBe(ValidationStatus.Valid);
  result = Validate('to', 'GD6SKLAFG66DSAKFBD6SJL66AFND6SKAFNMSD6ALFKD6MS6AL2F6KDMSA');
  expect(result.status).toBe(ValidationStatus.Invalid);
  result = Validate('to', 12345);
  expect(result.status).toBe(ValidationStatus.Invalid);
  result = Validate(
    'closeRemainderTo',
    'NM2MBC673SL7TQIKUXD4JOBR3XQITDCHIMIEODQBUGFMAN54QV2VUYWZNQ'
  );
  expect(result.status).toBe(ValidationStatus.Dangerous);
  result = Validate('reKeyTo', 'NM2MBC673SL7TQIKUXD4JOBR3XQITDCHIMIEODQBUGFMAN54QV2VUYWZNQ');
  expect(result.status).toBe(ValidationStatus.Dangerous);
});

test('Validate numbers', () => {
  let result = Validate('assetIndex', 1);
  expect(result.status).toBe(ValidationStatus.Valid);
  result = Validate('assetIndex', 9999999999999999999999999);
  expect(result.status).toBe(ValidationStatus.Invalid);
  result = Validate('assetIndex', -1);
  expect(result.status).toBe(ValidationStatus.Invalid);
  result = Validate('assetIndex', 'a');
  expect(result.status).toBe(ValidationStatus.Invalid);
});

test('Validate number arrays', () => {
  let result = Validate('appForeignAssets', [1]);
  expect(result.status).toBe(ValidationStatus.Valid);
  result = Validate('appForeignAssets', []);
  expect(result.status).toBe(ValidationStatus.Invalid);
  result = Validate('appForeignAssets', [9999999999999999999999999]);
  expect(result.status).toBe(ValidationStatus.Invalid);
  result = Validate('appForeignAssets', [-1]);
  expect(result.status).toBe(ValidationStatus.Invalid);
  result = Validate('appForeignAssets', ['a']);
  expect(result.status).toBe(ValidationStatus.Invalid);
});

test('Validate bigints', () => {
  let result = Validate('amount', 1);
  expect(result.status).toBe(ValidationStatus.Valid);
  result = Validate('amount', '9999999999999999999999999');
  expect(result.status).toBe(ValidationStatus.Valid);
  result = Validate('amount', -1);
  expect(result.status).toBe(ValidationStatus.Invalid);
  result = Validate('amount', 'a');
  expect(result.status).toBe(ValidationStatus.Invalid);
});

test('Validate strings', () => {
  let result = Validate('assetURL', 'a');
  expect(result.status).toBe(ValidationStatus.Valid);
  result = Validate('assetURL', new Array(STRING_MAX_LENGTH + 1).toString());
  expect(result.status).toBe(ValidationStatus.Invalid);
  result = Validate('assetURL', 1);
  expect(result.status).toBe(ValidationStatus.Invalid);
  result = Validate('assetURL', false);
  expect(result.status).toBe(ValidationStatus.Invalid);
  result = Validate('assetURL', null);
  expect(result.status).toBe(ValidationStatus.Invalid);
  result = Validate('assetURL', undefined);
  expect(result.status).toBe(ValidationStatus.Invalid);
});

test('Validate booleans', () => {
  let result = Validate('freezeState', false);
  expect(result.status).toBe(ValidationStatus.Valid);
  result = Validate('freezeState', 'a');
  expect(result.status).toBe(ValidationStatus.Invalid);
  result = Validate('freezeState', 1);
  expect(result.status).toBe(ValidationStatus.Invalid);
  result = Validate('freezeState', null);
  expect(result.status).toBe(ValidationStatus.Invalid);
  result = Validate('freezeState', undefined);
  expect(result.status).toBe(ValidationStatus.Invalid);
});

// Specific field validations

test('Validate fees', () => {
  let result = Validate('fee', 1000);
  expect(result.status).toBe(ValidationStatus.Valid);
  result = Validate('fee', -1);
  expect(result.status).toBe(ValidationStatus.Invalid);
  result = Validate('fee', 'a');
  expect(result.status).toBe(ValidationStatus.Invalid);
  result = Validate('fee', false);
  expect(result.status).toBe(ValidationStatus.Invalid);
  result = Validate('fee', null);
  expect(result.status).toBe(ValidationStatus.Invalid);
  // High fee
  result = Validate('fee', HIGH_FEE_TRESHOLD + 1);
  expect(result.status).toBe(ValidationStatus.Warning);
  // Very high fee
  result = Validate('fee', ELEVATED_FEE_TRESHOLD + 1);
  expect(result.status).toBe(ValidationStatus.Dangerous);
});


test('Validate genesisID', () => {
  let result = Validate('genesisID', 'mainnet-v1.0');
  expect(result.status).toBe(ValidationStatus.Valid);
  result = Validate('genesisID', -1);
  expect(result.status).toBe(ValidationStatus.Invalid);
  result = Validate('genesisID', 'a');
  expect(result.status).toBe(ValidationStatus.Invalid);
  result = Validate('genesisID', false);
  expect(result.status).toBe(ValidationStatus.Invalid);
  result = Validate('genesisID', null);
  expect(result.status).toBe(ValidationStatus.Invalid);
});