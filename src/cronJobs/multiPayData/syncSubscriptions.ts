import fetch from 'cross-fetch';
import { syncSubscriptions } from 'src/utils/contracts/subscription';
import { execute, makePromise } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import gql from 'graphql-tag';
import { Chain, CHAINS } from 'src/utils/chain';
import { getCurrentTimeInSecond, getSubscriptionSubgraphURL } from 'src/utils/util';
import { SubscriptionInfo, SubscriptionsData } from './interface';

async function callSyncSubscriptions(chain: Chain, wallets: string[]) {
    const status = await syncSubscriptions(chain, wallets);
    if (status == 0x1) {
        return true;
    }
    return false;
}

export default async function (chainId: number) {
    console.log("\nStart HectorPay Subscription Sync...\n");
    const chain = CHAINS.find((c) => (c.id == chainId));
    if (chain == undefined) {
        console.error(`Chain with ID ${chainId} not found.`);
        return;
    }
    try {
        const currentTimestamp = await getCurrentTimeInSecond();
        const filteredSubscriptionsData: SubscriptionsData = await filterSubscriptions(chain, currentTimestamp, 'gte');
        const subscriptionInfos: SubscriptionInfo[] = filteredSubscriptionsData?.data?.subscriptionInfos;
        if (subscriptionInfos && subscriptionInfos.length > 0) {

            let wallets: string[] = [];

            for (let i = 0; i < subscriptionInfos.length; i++) {
                const subscriptionInfo: SubscriptionInfo = subscriptionInfos[i];
                const wallet = subscriptionInfo.user.address;
                wallets.push(wallet);
            }

            await callSyncSubscriptions(chain, wallets);
        }
    } catch (error) {
        return;
    }
}

export async function filterSubscriptions(chain: Chain, currentTimestamp: number, expiredOptions: string) {
    const uri = getSubscriptionSubgraphURL(chain);
    const link = createHttpLink({ uri, fetch });
    const query: string = `
        query {
            subscriptionInfos(where: { expiredAt_${expiredOptions}: ${currentTimestamp} }) {
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
