import { ILogEvent, ITxnModel } from 'src/constants/tax';

export const categorizeTransaction = (txn: ITxnModel, address: string) => {
    const flow = txn.from_address.toLowerCase() !== address.toLowerCase() ? 'Receive' : 'Send';

    let txnMethods: string[] = [];
    if (txn.log_events !== null && txn.log_events !== undefined) {
        txnMethods = extractMethods(txn.log_events);
    }

    if (isERC20(txn, txnMethods)) {
        return {
            ...txn,
            category: 'erc20',
            flow: flow,
        };
    } else if (isEthTransfer(txn, txnMethods)) {
        return {
            ...txn,
            category: 'ethTransfer',
            flow: flow,
        };
    } else if (isSwap(txn, txnMethods)) {
        return {
            ...txn,
            category: 'swap',
            flow: 'Exchange',
        };
    } else {
        return {
            ...txn,
            category: 'uncategorized',
            flow: 'Transact',
        };
    }
};

const extractMethods = (logEvents: ILogEvent[]) => {
    const methods: string[] = [];
    logEvents.map((logEvent) => {
        if (logEvent.decoded) {
            methods.push(logEvent.decoded.name);
        }
        return null;
    });
    return methods;
};

const isERC20 = (txn: ITxnModel, txnMethods: string[]) => {
    if (Number(txn.value) === 0 && txnMethods.filter((item: any) => item === 'Transfer').length === 1) {
        return true;
    } else {
        return false;
    }
};

const isEthTransfer = (txn: ITxnModel, txnMethods: string[]) => {
    if (Number(txn.value) > 0 && !txnMethods.includes('Transfer')) {
        return true;
    } else {
        return false;
    }
};

const isSwap = (txn: ITxnModel, txnMethods: string[]) => {
    if (
        txnMethods.filter((item: any) => item === 'Transfer').length > 0 &&
        ['Swap', 'Swapped', 'TokenExchange'].some((item) => txnMethods.includes(item))
    ) {
        return true;
    } else {
        return false;
    }
};
