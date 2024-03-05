import fetch from 'cross-fetch';
import { resumeStreams } from 'src/utils/contracts/multiPay';
import { execute, makePromise } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import gql from 'graphql-tag';
import { getMultiPaySubgraphURL, getSubscriptionSubgraphURL, sleep } from 'src/utils/util';
import { Chain, CHAINS } from 'src/utils/chain';
import { Stream, StreamData, StreamParam, SubscriptionInfo, SubscriptionsData } from './interface';

async function callResumeStreams(chain: Chain, streams: StreamParam[]) {
    const status = await resumeStreams(chain, streams);
    if (status == 0x1) {
        return true;
    }
    return false;
}

export default async function (chainId: number) {
    console.log("\nStart ResumeStreams...\n");
    const chain = CHAINS.find((c) => (c.id == chainId));
    if (chain == undefined) {
        console.error(`Chain with ID ${chainId} not found.`);
        return;
    }

    try {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const filteredSubscriptionsData: SubscriptionsData = await filterSubscriptions(chain, currentTimestamp, 'gt');
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
                const filteredStreamsData: StreamData = await filterStreams(chain, wallet, true, true);
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
                    const status = await callResumeStreams(chain, streamParams);
                    if (!status) {
                        console.error(
                            `Resume stream failed for wallet: ${wallet}`,
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

export async function filterStreams(chain: Chain, userId: string, paused: boolean, pausedBySubscription: boolean): Promise<StreamData> {
    const uri = getMultiPaySubgraphURL(chain);
    const link = createHttpLink({ uri, fetch });

    const query: string = `
        query {
            streams(where: { users_: { id: "${userId}" }, paused: ${paused}, pausedBySubscription: ${pausedBySubscription} }) {
                id
                streamId
                amountPerSec
                starts
                ends
                payer {
                    address
                }
                payee {
                    address
                }
                contract {
                    address
                }
                paused
                pausedBySubscription
            }
        }`;
    const operation = {
        query: gql(query),
    };

    return await makePromise(execute(link, operation));
}
