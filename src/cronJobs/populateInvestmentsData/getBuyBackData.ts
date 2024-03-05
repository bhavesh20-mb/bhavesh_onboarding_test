import Decimal from 'decimal.js';
import { FANTOM_ADDRESS_MAINNET, ftmscanApiKey, BLOCK_NUMBER_LIST, FANTOM_DAI, FANTOM_USDC } from 'src/constants';
import BuybackModel from 'src/database/models/buyback.model';
import { IBuybackModel } from 'src/interfaces/dbModels';
import { FTMScanTransaction, Transaction, TokenDetail } from 'src/interfaces/apiDataModels';
import fetch from 'node-fetch';
import { BuybackAddressList } from 'src/constants/buyback';

export default async function () {
    try {
        //pull data from apis
        let buyBackData: Transaction[] = await getTransactionData();

        const manualBuybackTxsList = await Promise.all(
            BuybackAddressList.map(async (addr) => {
                const getManualBuybackTxs = fetch(
                    `https://api.ftmscan.com/api?module=account&action=tokentx&address=${addr.address}&startblock=${addr.blockNumber}&endblock=99999999&sort=desc&apikey=${ftmscanApiKey}`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    },
                ).then((res: any) => res.json());
                const manualBuybackTxsA = await getManualBuybackTxs;
                const manualBuybackDataA: FTMScanTransaction[] = manualBuybackTxsA.result;
                const manualUniqueBlocksA = Array.from(
                    new Set(manualBuybackDataA.map((transactions) => transactions.blockNumber)),
                );
                const manualDataA = getGroupedData(manualUniqueBlocksA, manualBuybackDataA);
                return formatFTMScanData([...manualDataA]);
            }),
        );
        manualBuybackTxsList.map((transactions) => {
            transactions.map((tx) => {
                buyBackData.push(tx);
            });
        });

        //await BuybackModel.deleteMany({});

        //get the maximum timestamp
        let maxTimeObj = await BuybackModel.find().sort({ timeStamp: -1 }).limit(1);
        const maxTimeStampFromDB: Date | null = maxTimeObj[0] ? maxTimeObj[0]?.timeStamp : null;

        //Only insert the latest data
        const filterData: Transaction[] = buyBackData
            .filter((data) => {
                const timeStamp = data.investments.transactionDate;
                return (
                    maxTimeStampFromDB == null || new Date(timeStamp).getTime() > new Date(maxTimeStampFromDB).getTime()
                );
            })
            .filter((data) => !BLOCK_NUMBER_LIST.includes(data.blockNumber));

        const dataToInsert: IBuybackModel[] = filterData.map((data) => {
            const timeStamp: Date = new Date(data.investments.transactionDate);
            const { type, title, investments, blockNumber } = data;

            return {
                type,
                title,
                investments,
                blockNumber,
                timeStamp,
            };
        });

        if (dataToInsert.length > 0) await BuybackModel.insertMany(dataToInsert);
    } catch (error) {}
}

async function getTransactionData(): Promise<Transaction[]> {
    const getHecBurnTransactions = fetch(
        `https://api.ftmscan.com/api?module=account&action=tokentx&address=${FANTOM_ADDRESS_MAINNET.HEC_BURN_ALLOCATOR}&startblock=0&endblock=99999999&sort=desc&apikey=${ftmscanApiKey}`,
        {
            headers: {
                'Content-Type': 'application/json',
            },
        },
    ).then((res: any) => res.json());
    const getOldHecBurnTransactions = fetch(
        `https://api.ftmscan.com/api?module=account&action=tokentx&address=${FANTOM_ADDRESS_MAINNET.OLD_HEC_BURN_ALLOCATOR}&startblock=0&endblock=99999999&sort=desc&apikey=${ftmscanApiKey}`,
        {
            headers: {
                'Content-Type': 'application/json',
            },
        },
    ).then((res: any) => res.json());
    const getDaoBuybackTxs = fetch(
        `https://api.ftmscan.com/api?module=account&action=tokentx&address=${FANTOM_ADDRESS_MAINNET.DAO_WALLET}&startblock=40511244&endblock=99999999&sort=desc&apikey=${ftmscanApiKey}`,
        {
            headers: {
                'Content-Type': 'application/json',
            },
        },
    ).then((res: any) => res.json());
    const [transactions, oldTransactions, buyBackTransactions] = await Promise.all([
        getHecBurnTransactions,
        getOldHecBurnTransactions,
        getDaoBuybackTxs,
    ]);
    const hecburnData: FTMScanTransaction[] = transactions.result;
    const oldHecburnData: FTMScanTransaction[] = oldTransactions.result;
    let daoBuybackData: FTMScanTransaction[] = buyBackTransactions.result;

    daoBuybackData = daoBuybackData.filter((trans) => {
        const txBlackList = BLOCK_NUMBER_LIST.filter(
            (blockNumber) => blockNumber.toString() === trans.blockNumber.toString(),
        );
        return txBlackList.length === 0;
    });

    // delete records in DB based on BLOCK_NUMBER_LIST.
    // since we are inserting only latest records, above filtering very very likely has no effect.
    await BuybackModel.deleteMany({
        blockNumber: { $in: BLOCK_NUMBER_LIST },
    });

    const uniqueBlocks = Array.from(new Set(hecburnData.map((transactions) => transactions.blockNumber)));
    const oldUniqueBlocks = Array.from(new Set(oldHecburnData.map((transactions) => transactions.blockNumber)));
    const daoUniqueBlocks = Array.from(new Set(daoBuybackData.map((transactions) => transactions.blockNumber)));
    const groupedData = uniqueBlocks.map((blockNumber) =>
        hecburnData.filter((transaction) => transaction.blockNumber === blockNumber),
    );
    const oldGroupedData = oldUniqueBlocks.map((blockNumber) =>
        oldHecburnData.filter((transaction) => transaction.blockNumber === blockNumber),
    );
    const daoGroupedData = getGroupedData(daoUniqueBlocks, daoBuybackData);
    return formatFTMScanData([...groupedData, ...oldGroupedData, ...daoGroupedData]);
}

const getGroupedData = (uniqueBlocks: string[], buyBackData: FTMScanTransaction[]) => {
    return uniqueBlocks
        .map((blockNumber) => {
            const hasMoreTransactions = buyBackData.some(
                (data) => data.blockNumber === blockNumber && data.tokenSymbol === 'TOR',
            );
            if (hasMoreTransactions) {
                return [];
            }
            return buyBackData.filter(
                (transaction) =>
                    transaction.blockNumber === blockNumber &&
                    (transaction?.tokenSymbol === 'HEC' || transaction?.tokenSymbol === 'DAI'),
            );
        })
        .filter((group) => group.length === 2);
};

const getTokens = (data: FTMScanTransaction[]): TokenDetail[] => {
    return data
        .filter((transaction, i, arr) => arr.findIndex((item) => item.tokenSymbol === transaction.tokenSymbol) === i)
        .map(
            (transaction) =>
                ({
                    token: transaction.tokenName,
                    ticker: transaction.tokenSymbol,
                    price: transaction.value,
                } as TokenDetail),
        );
};

const getInvestedAmount = (transGroup: FTMScanTransaction[]): string => {
    const daiVal = transGroup.find((item) => item.tokenSymbol === 'DAI')?.value;
    const usdcVal = transGroup.find((item) => item.tokenSymbol === 'USDC')?.value;
    if (!daiVal && !usdcVal) {
        return '0';
    }
    if (transGroup.length > 4 && daiVal) {
        return new Decimal(daiVal).div(FANTOM_DAI.wei).times(2).toString();
    }
    if (transGroup.length > 4 && usdcVal) {
        return new Decimal(usdcVal).div(FANTOM_USDC.wei).times(2).toString();
    }
    if (daiVal) {
        return new Decimal(daiVal).div(FANTOM_DAI.wei).toString();
    }
    if (usdcVal) {
        return new Decimal(usdcVal).div(FANTOM_USDC.wei).toString();
    } else {
        return '0';
    }
};

const formatFTMScanData = (groupedData: FTMScanTransaction[][]) => {
    const ftmScantransactions: Transaction[] = groupedData.map((trans, i) => {
        return {
            title: trans.length > 2 ? 'Buyback and Burn' : 'Buyback',
            type: 'Buyback-Burn',
            investments: {
                tokenDetails: getTokens(groupedData[i]!),
                transactionLinks: [`https://ftmscan.com/tx/${trans[0]!.hash}`],
                transactionDate: new Date(+trans[0]!?.timeStamp * 1000).toLocaleString('en-US'),
                investedAmount: getInvestedAmount(trans),
            },
            blockNumber: trans[0].blockNumber,
        };
    });

    const sortedData = [...ftmScantransactions].sort((a, b) => {
        return new Date(b.investments.transactionDate).getTime() - new Date(a.investments.transactionDate).getTime();
    });

    return sortedData;
};
