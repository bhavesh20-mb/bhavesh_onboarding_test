import { ITxnConvertModel } from 'src/constants/tax';

export const toAddress = (txn: ITxnConvertModel): string => {
    const transfers = txn.log_events?.filter((logEvent) => {
        if (logEvent) {
            return logEvent.decoded?.name === 'Transfer';
        }
    });

    if (txn.flow === 'Receive' || txn.flow === 'Transact') {
        return txn.to_address;
    } else if (txn.flow === 'Send') {
        if (transfers && transfers.length > 0) {
            return transfers[0].decoded?.params!.filter((item) => item.name === 'to')[0].value ?? txn.to_address;
        } else {
            return txn.to_address;
        }
    } else {
        return txn.to_address;
    }
};
