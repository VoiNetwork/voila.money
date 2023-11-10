import algosdk from 'algosdk';
import { NETWORKS } from '../../../core/utils/network';
// import { Settings } from '../config';

export const STRING_MAX_LENGTH = 1000;
export const HIGH_FEE_TRESHOLD = 1000;
export const ELEVATED_FEE_TRESHOLD = 1000000;

///
// Validation Status
///
export enum ValidationStatus {
  /* eslint-disable no-unused-vars */
  Valid = 0, // Field is valid or not one of the validated fields
  Invalid = 1, // Field value is invalid and should not be used
  Warning = 2, // Field is out of normal parameters and should be inspected closely
  Dangerous = 3, // Field has risky or costly fields with values and should be inspected very closely
}

///
// Validation responses.
///
export class ValidationResponse {
  status: ValidationStatus;
  info: string;
  constructor(props: { status: any; info?: any; }) {
    this.status = props.status;
    this.info = props.info;
  }
}

/**
 * Return field if valid based on type
 * Some fields already validated on the wrapper are:
 * appApprovalProgram, appClearProgram, appArgs, appAccounts, assetMetadataHash, group, note
 */
export function Validate(field: any, value: any): ValidationResponse {
  switch (field) {
    /**
     * General field validations by type
     */
    // Safety checks for addresses
    case 'assetClawback':
    case 'assetFreeze':
    case 'assetManager':
    case 'assetReserve':
    case 'assetRevocationTarget':
    case 'closeRemainderTo':
    case 'freezeAccount':
    case 'from':
    case 'reKeyTo':
    case 'to':
      if (!algosdk.isValidAddress(value)) {
        return new ValidationResponse({
          status: ValidationStatus.Invalid,
          info: 'Address does not adhere to a valid structure.',
        });
      } else {
        // Close to types should issue a Dangerous validation warning if they contain values.
        if (field === 'closeRemainderTo') {
          return new ValidationResponse({
            status: ValidationStatus.Dangerous,
            info: `A 'close to' address is associated to this transaction.`,
          });
        } else if (field === 'reKeyTo') {
          return new ValidationResponse({
            status: ValidationStatus.Dangerous,
            info: `A ‘rekey to’ address is associated to this transaction. This will grant signing control of your account to that address.`,
          });
        } else {
          return new ValidationResponse({ status: ValidationStatus.Valid });
        }
      }
    // Safety checks for numbers
    case 'appGlobalByteSlices':
    case 'appGlobalInts':
    case 'appIndex':
    case 'appLocalByteSlices':
    case 'appLocalInts':
    case 'appOnComplete':
    case 'assetDecimals':
    case 'assetIndex':
    case 'extraPages':
    case 'firstRound':
    case 'lastRound':
    case 'voteFirst':
    case 'voteKeyDilution':
    case 'voteLast':
      if (value && (!Number.isSafeInteger(value) || parseInt(value) < 0)) {
        return new ValidationResponse({
          status: ValidationStatus.Invalid,
          info: 'Value unable to be cast correctly to a positive numeric value.',
        });
      } else {
        return new ValidationResponse({ status: ValidationStatus.Valid });
      }
    // Safety checks for number arrays
    case 'appForeignApps':
    case 'appForeignAssets':
      if (value && (!Array.isArray(value) || !value.length)) {
        return new ValidationResponse({
          status: ValidationStatus.Invalid,
          info: 'Value needs to be a positive number array.',
        });
      } else {
        if (value.some((fa: any) => !Number.isSafeInteger(fa) || parseInt(fa) < 0)) {
          return new ValidationResponse({
            status: ValidationStatus.Invalid,
            info: 'Some value was unable to be cast correctly to a positive numeric value.',
          });
        }
      }
      return new ValidationResponse({ status: ValidationStatus.Valid });
    // Safety checks for BigInts
    case 'amount':
    case 'assetTotal':
      try {
        if (value && BigInt(value) < 0) {
          return new ValidationResponse({
            status: ValidationStatus.Invalid,
            info: 'Number needs to have a positive value.',
          });
        } else {
          return new ValidationResponse({ status: ValidationStatus.Valid });
        }
      } catch {
        // For any case where the converting to bigint may fail.
        return new ValidationResponse({
          status: ValidationStatus.Invalid,
          info: 'Value unable to be cast correctly to a numeric value.',
        });
      }
    // Safety checks for strings
    case 'assetName':
    case 'assetURL':
    case 'assetUnitName':
    case 'group':
    case 'note':
    case 'name':
    case 'tag':
      if (typeof value === 'string' || value instanceof String) {
        if (value.length < STRING_MAX_LENGTH) {
          return new ValidationResponse({ status: ValidationStatus.Valid });
        } else {
          return new ValidationResponse({
            status: ValidationStatus.Invalid,
            info: 'Value exceeds permitted string length.',
          });
        }
      } else {
        return new ValidationResponse({
          status: ValidationStatus.Invalid,
          info: 'Value needs to be a string.',
        });
      }
    // Safety checks for booleans
    case 'assetDefaultFrozen':
    case 'flatFee':
    case 'freezeState':
    case 'nonParticipation':
      if (typeof value === 'boolean') {
        return new ValidationResponse({ status: ValidationStatus.Valid });
      } else {
        return new ValidationResponse({
          status: ValidationStatus.Invalid,
          info: 'Value needs to be a boolean.',
        });
      }

    /**
     * Specific field validations
     */
    // Warn on fee amounts above minimum, send dangerous response on those above 1 Algo.
    case 'fee':
      try {
        if (!Number.isSafeInteger(value) || parseInt(value) < 0) {
          return new ValidationResponse({
            status: ValidationStatus.Invalid,
            info: 'Value unable to be cast correctly to a numeric value.',
          });
        } else if (parseInt(value) > ELEVATED_FEE_TRESHOLD) {
          return new ValidationResponse({
            status: ValidationStatus.Dangerous,
            info: 'The associated fee is very high compared to the minimum value.',
          });
        } else if (parseInt(value) > HIGH_FEE_TRESHOLD) {
          return new ValidationResponse({
            status: ValidationStatus.Warning,
            info: 'The fee is higher than the minimum value.',
          });
        } else {
          return new ValidationResponse({ status: ValidationStatus.Valid });
        }
      } catch {
        // For any case where the parse int may fail.
        return new ValidationResponse({
          status: ValidationStatus.Invalid,
          info: 'Value unable to be cast correctly to a numeric value.',
        });
      }

    // Genesis ID must be present and one of the approved values
    case 'genesisID':
      if (
        Object.entries(NETWORKS).some((n) => value === n[1].genesisId)
        // Settings.getCleansedInjectedNetworks().find((n) => value === n['genesisID'])
      ) {
        return new ValidationResponse({ status: ValidationStatus.Valid });
      } else {
        return new ValidationResponse({
          status: ValidationStatus.Invalid,
          info: 'The associated genesis id does not match a supported ledger.',
        });
      }

    // Genesis hash must be present and one of the approved values
    // @TODO: verify or move to UintArrays?
    case 'genesisHash':
      if (value) {
        return new ValidationResponse({ status: ValidationStatus.Valid });
      } else {
        return new ValidationResponse({
          status: ValidationStatus.Invalid,
          info: 'The genesis hash value is invalid or does not exist.',
        });
      }

    default:
      // Our field isn't one of the listed ones, so we can mark it as valid
      return new ValidationResponse({ status: ValidationStatus.Valid });
  }

  // If for some reason the case falls through mark the field invalid.
  return new ValidationResponse({
    status: ValidationStatus.Invalid,
    info: 'An unknown error has occurred during validation.',
  });
}
