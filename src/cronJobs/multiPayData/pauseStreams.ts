import fetch from 'cross-fetch';
import { pauseStreams } from 'src/utils/contracts/multiPay';
import { execute, makePromise } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import gql from 'graphql-tag';
import { getCurrentTimeInSecond, getMultiPaySubgraphURL, getSubscriptionSubgraphURL, sleep } from 'src/utils/util';
import { Chain, CHAINS } from 'src/utils/chain';
import { Stream, StreamData, StreamParam, SubscriptionInfo, SubscriptionsData } from './interface';

async function callPauseStreams(chain: Chain, streams: StreamParam[]) {
    const status = await pauseStreams(chain, streams);
    if (status == 0x1) {
        return true;
    }
    return false;
}

export default async function (chainId: number) {
    console.log("\nStart PauseStreams...\n");
    const chain = CHAINS.find((c) => (c.id == chainId));
    if (chain == undefined) {
        console.error(`Chain with ID ${chainId} not found.`);
        return;
    }

    try {
        const currentTimestamp = await getCurrentTimeInSecond();
        const filteredSubscriptionsData: SubscriptionsData = await filterSubscriptions(chain, currentTimestamp, 'lte');
        const subscriptionInfos: SubscriptionInfo[] = filteredSubscriptionsData?.data?.subscriptionInfos;

        if (subscriptionInfos && subscriptionInfos.length > 0) {
            let wallets: string[] = [];

            for (let i = 0; i < subscriptionInfos.length; i++) {
                const subscriptionInfo: SubscriptionInfo = subscriptionInfos[i];
                const wallet = subscriptionInfo.user.address;
                wallets.push(wallet);
            }

            for (let i = 0; i < wallets.length; i++) {
                const wallet = wallets[i];
                console.log("wallet:", wallet);
                const filteredStreamsData = await filterStreams(chain, wallet, true);

                const streams: Stream[] = filteredStreamsData?.data?.streams;
                if (streams && streams.length > 0) {
                    let streamParams: StreamParam[] = [];
                    for (let j = 0; j < streams.length; j++) {
                        const stream: Stream = streams[j];
                        const streamParam: StreamParam = {
                            payContract: stream.contract.address,
                            from: stream.payer.address,
                            to: stream.payee.address,
                            amountPerSec: stream.amountPerSec,
                            starts: stream.starts,
                            ends: stream.ends,
                        };
                        streamParams.push(streamParam);
                    }
                    const status = await callPauseStreams(chain, streamParams);
                    if (!status) {
                        console.error(
                            `Pause stream failed for wallet: ${wallet}`,
                        );
                    }

                    sleep(10000);
                }
            }
        }
    } catch (error) {
        return;
    }
}

export async function filterSubscriptions(chain: Chain, currentTimestamp: number, compareOption: string) {
    const uri = getSubscriptionSubgraphURL(chain);
    const link = createHttpLink({ uri, fetch });
    const query: string = `
        query {
            subscriptionInfos(where: { expiredAt_${compareOption}: ${currentTimestamp} }) {
                id
                user {
                    address
                }
                expiredAt
            }
        }`;
    const operation = {
        query: gql(query),
    };

    return await makePromise(execute(link, operation));
}

export async function filterStreams(chain: Chain, userId: string, active: boolean): Promise<StreamData> {
    const uri = getMultiPaySubgraphURL(chain);
    const link = createHttpLink({ uri, fetch });

    const query: string = `
        query {
            streams(where: { users_: { id: "${userId}" }, active: ${active} }) {
                id
                streamId
                amountPerSec
                starts
                ends
                active
                payer {
                    address
                }
                payee {
                    address
                }
                contract {
                    address
                }
            }
        }`;
    const operation = {
        query: gql(query),
    };

    return await makePromise(execute(link, operation));
}
