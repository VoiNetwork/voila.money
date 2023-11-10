import algosdk from "algosdk";
import { oneAddress, zeroAddress } from "../util/account.js";

export default class CONTRACT {
    constructor(contractId, algodClient, spec, acc, simulate = true) {
        this.contractId = contractId;
        this.algodClient = algodClient;
        this.contractABI = new algosdk.ABIContract(spec);
        this.sk = acc?.sk;
        this.simulate = simulate;
        this.paymentAmount = 0;
        this.fee = 1000;
        this.simulationResultHandler = this.decodeSimulationResponse;
        this.sender = acc?.addr ?? oneAddress;

        for (const methodSpec of spec.methods) {
            const abiMethod = this.contractABI.getMethodByName(methodSpec.name);
            this[methodSpec.name] = async function (...args) {
                if (methodSpec.readonly) {
                    // If the method is readonly, we can just simulate it
                    return await this.createAndSimulateTxn(abiMethod, args);
                } else {
                    if (simulate) {
                        const sim = await this.createAndSimulateTxn(abiMethod, args);
                        if (sim.success) {
                            const txns = await this.createUtxns(abiMethod, args);
                            const res = { ...sim, txns };
                            return res;
                        }
                        return sim;
                    }
                    return await this.createAndSendTxn(abiMethod, args);
                }
            }.bind(this);
        }
    }

    getContractId() {
        return this.contractId;
    }

    getSender() {
        return this.sender;
    }

    getSk() {
        return this.sk;
    }

    getSimulate() {
        return this.simulate;
    }

    setPaymentAmount(amount) {
        this.paymentAmount = amount;
    }

    setSimulate(simulate) {
        this.simulate = simulate;
    }

    setFee(fee) {
        this.fee = fee;
    }

    async createAndSendTxn(abiMethod, args) {
        try {
            // logic to create and send a real transaction using simulationResult
            const utxns = await this.createUtxns(abiMethod, args);
            const stxns = await this.signTxns(utxns, this.sk);
            const res = await this.algodClient.sendRawTransaction(stxns).do();
            return { ...res, success: true };
        } catch (error) {
            console.error("Error in createAndSendTxn:", error);
            //throw error; // Re-throw the error after logging it
            return { success: false, error };
        }
    }

    async signTxns(utxnsB64, sk) {
        const txns = utxnsB64.map((utxn) =>
            algosdk.decodeUnsignedTransaction(Buffer.from(utxn, "base64"))
        );
        const stxns = txns.map((txn) => txn.signTxn(sk));
        return stxns;
    }

    async createAndSimulateTxn(abiMethod, args) {
        let response;
        try {
            response = await this.simulateTxn(abiMethod, args);
            return {
                success: true,
                returnValue: this.handleSimulationResponse(response, abiMethod),
                response,
            };
        } catch (error) {
            console.error("Error in createAndSimulateTxn:", error);
            //throw error; // Re-throw the error after logging it
            return { success: false, error };
        }
    }

    async createUtxns(abiMethod, args) {
        try {
            const sRes = await this.simulateTxn(abiMethod, args);

            if (!sRes) return;

            // !!!
            const { unnamedResourcesAccessed } = sRes.txnGroups[0];
            const { boxes } = unnamedResourcesAccessed ?? {};

            // Get the suggested transaction parameters
            const params = await this.algodClient.getTransactionParams().do();

            // Encode arguments

            const encodedArgs = args.map((arg, index) => {
                //console.log({ index, arg, type: abiMethod.args[index].type });
                return abiMethod.args[index].type.encode(arg);
            });

            const txns = [];

            // Create the application call transaction object
            const txn2 = algosdk.makeApplicationCallTxnFromObject({
                suggestedParams: {
                    ...params,
                    flatFee: true,
                    fee: this.fee,
                },
                from: this.sender,
                appIndex: this.contractId,
                appArgs: [abiMethod.getSelector(), ...encodedArgs], // Adjust appArgs based on methodSpec and args
                // !!!
                boxes: boxes?.map((box) => ({
                    appIndex: box.app,
                    name: box.name,
                })),
            });
            if (this.paymentAmount > 0) {
                const txn1 = algosdk.makePaymentTxnWithSuggestedParams(
                    this.sender,
                    algosdk.getApplicationAddress(this.contractId),
                    this.paymentAmount,
                    undefined,
                    undefined,
                    {
                        ...params,
                        flatFee: true,
                        fee: 1000,
                    }
                );
                txns.push(txn1);
            }

            txns.push(txn2);

            const txngroup = algosdk.assignGroupID(txns);

            const utxns = txns.map((t) =>
                Buffer.from(algosdk.encodeUnsignedTransaction(t)).toString("base64")
            );

            return utxns;
        } catch (error) {
            // console.error('Error in createAndSimulateTxn:', error);
            throw error; // Re-throw the error after logging it
        }
    }

    async simulateTxn(abiMethod, args) {
        try {
            // Get the suggested transaction parameters
            const params = await this.algodClient.getTransactionParams().do();

            // Encode arguments

            const encodedArgs = args.map((arg, index) => {
                return abiMethod.args[index].type.encode(arg);
            });

            // Create the application call transaction object
            const txn2 = algosdk.makeApplicationCallTxnFromObject({
                suggestedParams: {
                    ...params,
                    flatFee: true,
                    fee: this.fee,
                },
                from: this.sender,
                appIndex: this.contractId,
                appArgs: [abiMethod.getSelector(), ...encodedArgs], // Adjust appArgs based on methodSpec and args
            });
            const txn1 = algosdk.makePaymentTxnWithSuggestedParams(
                this.sender,
                algosdk.getApplicationAddress(this.contractId),
                this.paymentAmount,
                undefined,
                undefined,
                {
                    ...params,
                    flatFee: true,
                    fee: 1000,
                }
            );

            const txns = [txn1, txn2];

            const txngroup = algosdk.assignGroupID(txns);
            // Sign the transaction
            const stxns = txns.map(algosdk.encodeUnsignedSimulateTransaction);

            // Construct the simulation request
            const request = new algosdk.modelsv2.SimulateRequest({
                txnGroups: [
                    new algosdk.modelsv2.SimulateRequestTransactionGroup({
                        txns: stxns.map(algosdk.decodeObj),
                    }),
                ],
                allowUnnamedResources: true,
                allowEmptySignatures: true,
            });

            // Simulate the transaction group
            const response = await this.algodClient
                .simulateTransactions(request)
                .do();
            return response;
        } catch (error) {
            // console.error('Error in createAndSimulateTxn:', error);
            throw error; // Re-throw the error after logging it
        }
    }

    handleSimulationResponse(response, abiMethod) {
        return this.simulationResultHandler(response, abiMethod);
    }

    decodeSimulationResponse(response, abiMethod) {
        try {
            // Handle the simulation results
            if (response.txnGroups[0].failureMessage) {
                throw response.txnGroups[0].failureMessage;
            }
            const rlog = response.txnGroups[0].txnResults[1].txnResult.logs.pop();
            const rlog_ui = Uint8Array.from(Buffer.from(rlog, "base64"));
            const res_ui = rlog_ui.slice(4);

            // Decode the response based on the methodSpec
            //HACK: Hacking this because the decode function doesn't work on bytes
            let result;
            if (abiMethod.returns.type.childType == "byte") {
                result = new TextDecoder().decode(res_ui);
            } else {
                result = abiMethod.returns.type.decode(res_ui);
            }

            return result;
        } catch (error) {
            // console.error('Error in handleSimulationResponse:', error);
            throw error; // Re-throw the error after logging it
        }
    }
}