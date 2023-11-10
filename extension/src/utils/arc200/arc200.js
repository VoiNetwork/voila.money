import CONTRACT from "./lib/contract.js";
import ARC200Spec from "./abi/contract.json" assert { type: "json" }; // spec
import ARC200Extension from "./abi/extension.json" assert { type: "json" }; // extension (non-standard methods)
import algosdk from "algosdk";
import dotenv from "dotenv";
dotenv.config();
const algodToken = ""; // Your Algod API token
const algodServer = process.env.ALGOD_URL; // Address of your Algod node
const algodPort = ""; // Port of your Algod node
const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
const debug = process.env.DEBUG === "1";

const BalanceBoxCost = 28500;
const AllowanceBoxCost = 28100;

/*
 * init
 * - initialize contract instance
 * @param contractId: contract id
 * @returns: contract instance
 * @example:
 * const contractInstance = init(contractId);
 * const name = await contractInstance.arc200_name();
 * console.log({ name });
 * ...
 */
export const init = (contractId, acc, simulate) => {
    const ctc = new CONTRACT(
        contractId,
        algodClient,
        {
            ...ARC200Spec,
            methods: [...ARC200Spec.methods, ...ARC200Extension.methods], // mixin non-standard methods
        },
        acc,
        simulate
    );
    return ctc;
};

/*
 * handleResponse
 * - handle response
 * @param name: name of method
 * @param res: response
 * @returns: response
 */
const handleResponse = (name, res) => {
    if (debug) {
        console.log(`${name}:`);
        console.log({ res });
    } else {
        console.log(`${name}: ${res.returnValue}`);
    }
    return res;
};

/*
 * arc200_name
 * - get name
 * @param contractInstance: contract instance
 * @returns: name (String)
 */
export const arc200_name = async (contractInstance) =>
    handleResponse("Name", await contractInstance.arc200_name());

/*
 * arc200_symbol
 * - get symbol
 * @param contractInstance: contract instance
 * @returns: symbol (String)
 */
export const arc200_symbol = async (contractInstance) =>
    handleResponse("Symbol", await contractInstance.arc200_symbol());

/*
 * arc200_totalSupply
 * - get total supply
 * @param contractInstance: contract instance
 * @returns: total supply (Int)
 */
export const arc200_totalSupply = async (contractInstance) =>
    handleResponse("Total Supply", await contractInstance.arc200_totalSupply());

/*
 * arc200_decimals
 * - get number of decimals
 * @param contractInstance: contract instance
 * @returns: number of decimals (Int)
 */
export const arc200_decimals = async (contractInstance) =>
    handleResponse(
        "Number of Decimals",
        await contractInstance.arc200_decimals()
    );

/*
 * arc200_balanceOf
 * - get balance of addr
 * @param contractInstance: contract instance
 * @param addr: address to check
 * @returns: balance (Int)
 */
export const arc200_balanceOf = async (contractInstance, addr) =>
    handleResponse(
        `BalanceOf ${addr}`,
        await contractInstance.arc200_balanceOf(addr)
    );

/*
 * arc200_allowance
 * - check if spender is allowed to spend from addrFrom
 * @param contractInstance: contract instance
 * @param addrFrom: from address
 * @param addrSpender: spender address
 * @returns: allowance (Int)
 */
export const arc200_allowance = async (
    contractInstance,
    addrFrom,
    addrSpender
) =>
    handleResponse(
        `Allowance from: ${addrFrom} spender: ${addrSpender}`,
        await contractInstance.arc200_allowance(addrFrom, addrSpender)
    );

/*
 * hasBalance
 * - check if addr has balance
 * @param contractInstance: contract instance
 * @param addr: address to check
 * @returns: bool
 */
export const hasBalance = async (contractInstance, addr) =>
    handleResponse(`HasBalance ${addr}`, await contractInstance.hasBalance(addr));

/*
 * hasAllowance
 * - check if spender is allowed to spend from addrFrom
 * @param contractInstance: contract instance
 * @param addrFrom: from address
 * @param addrSpender: spender address
 * @returns: bool
 */
export const hasAllowance = async (contractInstance, addrFrom, addrSpender) =>
    handleResponse(
        `HasAllowance from: ${addrFrom} spender: ${addrSpender}`,
        await contractInstance.hasAllowance(addrFrom, addrSpender)
    );

/*
 * safe_arc200_transfer
 * - send
 * @param ci: contract instance
 * @param addrTo: to address
 * @param amt: amount to send
 * @returns: undefined
 */
export const safe_arc200_transfer = async (ci, addrTo, amt, simulate) => {
    try {
        const contractInstance = init(
            ci.getContractId(),
            {
                addr: ci.getSender(),
                sk: ci.getSk(),
            },
            simulate
        );
        const bal = await contractInstance.arc200_balanceOf(addrTo);
        const addPayment = !bal.success || (bal.success && bal.returnValue === 0n);
        if (addPayment) {
            contractInstance.setPaymentAmount(BalanceBoxCost);
        }
        const addrFrom = contractInstance.getSender();
        console.log(`Transfer from: ${addrFrom} to: ${addrTo} amount: ${amt}`);
        return await contractInstance.arc200_transfer(addrTo, amt);
    } catch (e) {
        console.log(e);
    }
};

/*
 * safe_arc200_transferFrom
 * - spend
 * @param ci: contract instance
 * @param addrFrom: from address
 * @param addrTo: to address
 * @param amt: amount to spend
 * @returns: undefined
 */
export const safe_arc200_transferFrom = async (ci, addrFrom, addrTo, amt) => {
    try {
        const contractInstance = newContractInstance(ci.getContractId(), simulate);
        const addrSpender = contractInstance.getSenderAddress();
        console.log(
            `TransferFrom spender: ${addrSpender} from: ${addrFrom} to: ${addrTo} amount: ${amt}`
        );
        const p = async () => {
            const res = await contractInstance
                .arc200_transferFrom(addrFrom, addrTo, amt)
                .catch(() => { });
            return res;
        };
        const res = await p();
        if (!res?.success) {
            contractInstance.setPaymentAmount(BalanceBoxCost);
            const res = await p();
        }
    } catch (e) {
        console.log(e);
    }
};

/*
 * safe_arc200_approve
 * - approve spending
 * @param ci: contract instance
 * @param addrSpender: spender address
 * @param amt: amount to approve
 * @returns: undefined
 */

export const safe_arc200_approve = async (ci, addrSpender, amt, simulate) => {
    try {
        const contractInstance = newContractInstance(ci.getContractId(), simulate);
        console.log(`Approve: ${addrSpender} Amount: ${amt}`);
        const p = async () => {
            const res = await contractInstance
                .arc200_approve(addrSpender, amt)
                .catch(console.err);
            return res;
        };
        let res = await p();
        if (!res?.success) {
            contractInstance.setPaymentAmount(BalanceBoxCost);
            res = await p();
        }
        return res;
    } catch (e) {
        console.log(e);
    }
};

export default {
    init: (contractId, acc, simulate = true) =>
        ((contractInstance) => {
            return {
                arc200_name: async () => await arc200_name(contractInstance),
                arc200_symbol: async () => await arc200_symbol(contractInstance),
                arc200_totalSupply: async () =>
                    await arc200_totalSupply(contractInstance),
                arc200_decimals: async () => await arc200_decimals(contractInstance),
                arc200_balanceOf: async (addr) =>
                    await arc200_balanceOf(contractInstance, addr),
                arc200_allowance: async (addrFrom, addrSpender) =>
                    await arc200_allowance(contractInstance, addrFrom, addrSpender),
                safe_arc200_transfer: async (addrTo, amt, simulate) =>
                    await safe_arc200_transfer(contractInstance, addrTo, amt, simulate),
                safe_arc200_transferFrom: async (addrFrom, addrTo, amt, simulate) =>
                    await safe_arc200_transferFrom(
                        contractInstance,
                        addrFrom,
                        addrTo,
                        amt,
                        simulate
                    ),
                safe_arc200_approve: async (addrSpender, amt, simulate) =>
                    await safe_arc200_approve(
                        contractInstance,
                        addrSpender,
                        amt,
                        simulate
                    ),
                hasBalance: async (addr) => await hasBalance(contractInstance, addr),
                hasAllowance: async (addrFrom, addrSpender) =>
                    await hasAllowance(contractInstance, addrFrom, addrSpender),
            };
        })(init(contractId, acc, simulate)),
};