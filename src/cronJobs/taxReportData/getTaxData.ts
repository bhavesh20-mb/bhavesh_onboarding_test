import TaxReqModel from 'src/database/models/taxreport/taxreportreq.model';
import TaxUserModel from 'src/database/models/taxreport/taxuser.model';
import { ITaxReportReqModel } from 'src/interfaces/taxreportModels';
import { NOVU_APIKEY, NOVU_EMAIL_APIKEY, TAXREPORT_TRIGGER_ID, NOUV_NOTIFICATOIN_TRIGGER } from 'src/constants';
import { Novu } from '@novu/node';
import { ellipsisBetween, getCurrentTimeInSecond, sleep } from 'src/utils/util';
import { ETHTokenList } from 'src/tokens/ethereum';
import getAllDecodedTxData from './getAllDecodedTxData';
import { PolygonTokenList } from 'src/tokens/polygon';
import { FTMTokenList } from 'src/tokens/fantom';
import { BSCTokenList } from 'src/tokens/binance';
import { AvalancheTokenList } from 'src/tokens/avalanche';
import AccountModel from 'src/database/models/account.model';
import TaxReporterModel from 'src/database/models/taxreport/taxreporter.model';
import { getGateioTxnData } from './exchanges/getGateioTxnData';
import { getBybitTxnData } from './exchanges/getBybitTxnData';
import { getBinanceTxnData } from './exchanges/getBinanceTxnData';
import { getKuCoinTxnData } from './exchanges/getKucoinData';

export const ObjectID = require('mongodb').ObjectID;
export interface Ticket extends ITaxReportReqModel {
    _id: string;
}

export default async function () {
    // Check User's Subscription

    try {
        // Check if any progressing cron job existed
        const progressTicket = await TaxReqModel.findOne({ status: 'I' });
        if (!progressTicket) {
            const allPendingTickets = await TaxReqModel.aggregate([
                {
                    $match: { status: 'N' },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'walletAddress',
                        foreignField: 'walletAddress',
                        as: 'user',
                    },
                },
                {
                    $addFields: {
                        email: { $last: '$user.email' },
                    },
                },
                {
                    $project: {
                        user: 0,
                        __v: 0,
                        completedBy: 0,
                        userId: 0,
                    },
                },
                {
                    $sort: {
                        createdOn: 1,
                    },
                },
            ]);

            if (allPendingTickets.length > 0) {
                for (let i = 0; i < allPendingTickets.length; i++) {
                    let ticket: Ticket = allPendingTickets[i];

                    try {
                        console.log('\nTicket:', i + 1);
                        // Set in Progress Flag
                        const setProgressFlag = await TaxReqModel.updateOne(
                            { _id: ObjectID(ticket._id) },
                            { $set: { status: 'I' } },
                        );

                        if (ticket.chainIds.length > 0) {
                            for (let j = 0; j < ticket.chainIds.length; j++) {
                                if (ticket.chainIds[j] === '10') {
                                    // Get Optimism Data
                                    console.log('\nStarting Fetch Optimism Data...');
                                    const resGetAllOptimismDecodedTxData = await getAllDecodedTxData(
                                        ticket,
                                        ticket.chainIds[j],
                                        ETHTokenList[0],
                                        'Optimism mainnet',
                                    );
                                    await sleep(3000);
                                    console.log('Fetched Optimism Data');
                                } else if (ticket.chainIds[j] === '1') {
                                    // Get Ethereum Data
                                    console.log('\nStarting Fetch Ethereum Data...');
                                    const resGetAllEthereumDecodedTxData = await getAllDecodedTxData(
                                        ticket,
                                        ticket.chainIds[j],
                                        ETHTokenList[0],
                                        'Ethereum Mainnet',
                                    );
                                    await sleep(3000);
                                    console.log('Fetched Ethereum Data');
                                } else if (ticket.chainIds[j] === '137') {
                                    // Get Polygon Data
                                    console.log('\nStarting Fetch Polygon Data...');
                                    const resGetAllPolygonDecodedTxData = await getAllDecodedTxData(
                                        ticket,
                                        ticket.chainIds[j],
                                        PolygonTokenList[0],
                                        'Matic Mainnet',
                                    );
                                    await sleep(3000);
                                    console.log('Fetched Polygon Data');
                                } else if (ticket.chainIds[j] === '250') {
                                    // Get Fantom Data
                                    console.log('\nStarting Fetch Fantom Data...');
                                    const resGetAllFantomDecodedTxData = await getAllDecodedTxData(
                                        ticket,
                                        ticket.chainIds[j],
                                        FTMTokenList[0],
                                        'Fantom Opera',
                                    );
                                    await sleep(3000);
                                    console.log('Fetched Fantom Data');
                                } else if (ticket.chainIds[j] === '42161') {
                                    // Get Arbitrum Data
                                    console.log('\nStarting Fetch Arbitrum Data...');
                                    const resGetAllArbitrumDecodedTxData = await getAllDecodedTxData(
                                        ticket,
                                        ticket.chainIds[j],
                                        ETHTokenList[0],
                                        'Arbitrum Mainnet',
                                    );
                                    await sleep(3000);
                                    console.log('Fetched Arbitrum Data');
                                } else if (ticket.chainIds[j] === '56') {
                                    // Get BSC Data
                                    console.log('\nStarting Fetch BSC Data...');
                                    const resGetAllBSCDecodedTxData = await getAllDecodedTxData(
                                        ticket,
                                        ticket.chainIds[j],
                                        BSCTokenList[0],
                                        'BSC Mainnet',
                                    );
                                    await sleep(3000);
                                    console.log('Fetched BSC Data');
                                } else if (ticket.chainIds[j] === '43114') {
                                    // Get Avalanche Data
                                    console.log('\nStarting Fetch Avalanche Data...');
                                    const resGetAllAvalancheDecodedTxData = await getAllDecodedTxData(
                                        ticket,
                                        ticket.chainIds[j],
                                        AvalancheTokenList[0],
                                        'Avalanche Mainnet',
                                    );
                                    await sleep(3000);
                                    console.log('Fetched Avalanche Data');
                                }
                            }
                        } else {
                            console.log('\nStart exchange data fetching...');
                            const wallet = await TaxReporterModel.findOne({
                                wallet_address: ticket.walletAddress,
                                address: ticket.address,
                            });

                            await sleep(3000);

                            if (wallet) {
                                if (wallet.wallet_type === 'Bybit') {
                                    // Get Bybit Data
                                    console.log('\nStarting Fetch Bybit Data...');
                                    await getBybitTxnData({
                                        address: ticket.address,
                                        apiKey: wallet.api_key!,
                                        secretKey: wallet.security_key!,
                                    });
                                    await sleep(3000);
                                    console.log('Fetched Bybit Data');
                                } else if (wallet.wallet_type === 'Gate.io') {
                                    // Get Gateio Data
                                    console.log('\nStarting Fetch Gateio Data...');
                                    await getGateioTxnData({
                                        address: ticket.address,
                                        apiKey: wallet.api_key!,
                                        secretKey: wallet.security_key!,
                                    });
                                    await sleep(3000);
                                    console.log('Fetched Gateio Data');
                                } else if (wallet.wallet_type === 'Binance') {
                                    // Get Binance Data
                                    console.log('\nStarting Fetch Binance Data...');
                                    await getBinanceTxnData({
                                        address: ticket.address,
                                        apiKey: wallet.api_key!,
                                        secretKey: wallet.security_key!,
                                    });
                                    await sleep(3000);
                                    console.log('Fetched Binance Data');
                                } else if (wallet.wallet_type === 'KuCoin') {
                                    // Get KuCoin Data
                                    console.log('\nStarting Fetch KuCoin Data...');
                                    await getKuCoinTxnData({
                                        address: ticket.address,
                                        apiKey: wallet.api_key!,
                                        secretKey: wallet.security_key!,
                                        passphrase: wallet.passphrase!,
                                    });
                                    await sleep(3000);
                                    console.log('Fetched KuCoin Data');
                                }
                            }

                            console.log('\nEnd exchange data fetching...');
                        }

                        // Set Complete Status
                        const setCompleteFlag = await TaxReqModel.updateOne(
                            { _id: ObjectID(ticket._id) },
                            { $set: { status: 'C' } },
                        );
                        // Send Email
                        await sendEmailAndNotification(ticket);
                    } catch (e) {
                        await TaxReqModel.updateOne({ _id: ObjectID(ticket._id) }, { $set: { status: 'N' } });
                        throw e;
                    }
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
}

export async function sendEmailAndNotification(ticket: Ticket) {
    try {
        // get current timestamp
        const currentTime = await getCurrentTimeInSecond();
        const payer = await TaxUserModel.findOne({ walletAddress: ticket.address });
        // Get User's Email and FirstName from Mongo DB
        // const userEmail = "topdev0004@gmail.com";
        let userTaxEmail = payer?.email;
        let account = await AccountModel.findOne({ walletAddress: ticket.address.toLocaleLowerCase() });
        let userEmail = account?.email ? account.email : userTaxEmail;
        // const userFirstName = "Xiang";
        const userFirstName = payer?.name;

        // Mail
        const novu = new Novu(NOVU_APIKEY);
        const novuForEmail = new Novu(NOVU_EMAIL_APIKEY);
        const updatedTicket = await TaxReqModel.findOne({ _id: ObjectID(ticket._id) });

        if (payer && userEmail && updatedTicket?.status == 'C' && updatedTicket?.completedBy == 0) {
            // Create New Subscribe in Novu
            const newSubscriber = await novu.subscribers.identify(payer.walletAddress.toLocaleLowerCase(), {});
            const newEmailSubscriber = await novuForEmail.subscribers.identify(
                payer.walletAddress.toLocaleLowerCase(),
                {},
            );
            if (ticket.enableEmail) {
                console.log('Sending email to', userEmail);
                const novuResult = await novuForEmail.trigger(TAXREPORT_TRIGGER_ID, {
                    to: {
                        subscriberId: newEmailSubscriber.data.data.subscriberId,
                        email: userEmail,
                        firstName: userFirstName,
                    },
                    payload: {
                        userFirstName: userFirstName,
                    },
                });
                await TaxReqModel.updateOne({ _id: ObjectID(ticket._id) }, { $set: { completedBy: currentTime } });
                console.log('Sent email to', userEmail);
            }

            // Send Notification
            if (ticket.enablePush) {
                let title = `TaxReport - Ready`;
                let content = `Your TaxReport has been made successfully. Please check your report.`;
                let entireLink = `/taxreport/tickets`;
                let detailText = `Wallet: 0x${ellipsisBetween(8, 10, ticket.walletAddress.slice(2))}`;
                let link = `/taxreport/tickets`;
                let internal = true;

                await novu.trigger(NOUV_NOTIFICATOIN_TRIGGER, {
                    to: {
                        subscriberId: newSubscriber.data.data.subscriberId,
                    },
                    payload: {
                        title: title,
                        content: content,
                        entireLink: entireLink,
                        detailText: detailText,
                        link: link,
                        internal: internal,
                        time: currentTime,
                    },
                });
            }
        }
    } catch (e) {
        await TaxReqModel.updateOne({ _id: ObjectID(ticket._id) }, { $set: { completedBy: 0 } });
        console.log(e);
    }
}
