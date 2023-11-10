import { getNodeClient } from '../../../core/utils/network';
import { Network } from '../../../common/types'
import { BaseValidatedTxnWrap } from '../transaction/baseValidatedTxnWrap';
import logging from '../../../common/logging';
import { ValidationStatus } from '../utils/validator';
import { getValidatedTxnWrap } from '../transaction/actions'
import { buildTransaction } from '../utils/transactionBuilder'
import { get } from './storage'
import { Buffer } from 'buffer';

export async function signTransactions(data: { request: { address: string, network: Network, txnParams: any } }): Promise<object> {
    const { network, address, txnParams } = data.request;
    const algod = getNodeClient(network);
    const params = await algod.getTransactionParams().do();
    const txn = {
        ...txnParams,
        amount: BigInt(txnParams.amount),
        fee: params.fee,
        firstRound: params.firstRound,
        lastRound: params.lastRound,
        genesisID: params.genesisID,
        genesisHash: params.genesisHash,
    };
    if ('note' in txn) txn.note = new Uint8Array(Buffer.from(txn.note));


    let transactionWrap: BaseValidatedTxnWrap | undefined = undefined;
    try {
        transactionWrap = getValidatedTxnWrap(txn, txn['type']);
    } catch (e: any) {
        logging.log(`Validation failed. ${e.message}`);
        return ({ error: `Validation failed. ${e.message}` });
    }

    if (!transactionWrap) {
        // We don't have a transaction wrap. We have an unknow error or extra fields, reject the transaction.
        logging.log(
            'A transaction has failed because of an inability to build the specified transaction type.'
        );
        return ({
            error:
                'A transaction has failed because of an inability to build the specified transaction type.',
        });
    } else if (
        transactionWrap.validityObject &&
        Object.values(transactionWrap.validityObject).some(
            (value: any) => value['status'] === ValidationStatus.Invalid
        )
    ) {
        // We have a transaction that contains fields which are deemed invalid. We should reject the transaction.
        const e =
            'One or more fields are not valid. Please check and try again.\n' +
            Object.values(transactionWrap.validityObject)
                .filter((value: any) => value['status'] === ValidationStatus.Invalid)
                .map((vo: any) => vo['info']);
        return ({ error: e });
    }

    //Passed validation, create and submit transaction
    const sk = await get<Uint8Array>(address) as Uint8Array;
    if (!sk) {
        throw new Error('Account not found.');
    }
    let keyArray: number[] = []
    for (const [key, value] of Object.entries(sk)) {
        keyArray.push(value);
    }
    const uintSK = new Uint8Array(keyArray)
    let signedTxn;
    const builtTx = buildTransaction(txn);
    signedTxn = {
        txID: builtTx.txID().toString(),
        blob: builtTx.signTxn(uintSK),
    };
    const { txId } = await algod.sendRawTransaction(signedTxn.blob).do();
    return { txId: txId };
}