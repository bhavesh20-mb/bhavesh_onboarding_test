import { CHAINS } from 'src/utils/chain';
import { getCurrentTimeInSecond, getSubscriptionSubgraphURL } from 'src/utils/util';
import { createHttpLink } from 'apollo-link-http';
import gql from 'graphql-tag';
import { execute, makePromise } from 'apollo-link';
import { IResponseData } from './multiPayData';
import { HECTOR_MENU } from 'src/constants';

let responseData: IResponseData = {
    status: true,
    reason: "",
}

export type GraphSubscriptionPlanType = {
    expiredAt: number,
    plan: {
        amount: string,
        token: {
            address: string,
            name: string,
            symbol: string
        },
        planId: number,
        period: number,
        totalPurchased: number,
        totalPaid: string
    },
    id: string,
    user: {
        address: string,
        balances: Array<
            {
                balance: string,
                refunded: string,
                refund: string
            }
        >
    },
    contract: {
        product: string;
    }
}


export interface ISubscriptionResult {
    data: { subscriptionInfos: Array<GraphSubscriptionPlanType> }
}

export const checkSubscriptionData = async (walletAddress: string, chainId: number, isMultiPay: boolean): Promise<IResponseData> => {
    const chain = CHAINS.find((c) => (c.id == chainId));
    const currentTimestamp = await getCurrentTimeInSecond();
    try {
        if (chain == undefined) {
            responseData.status = false;
            responseData.reason = `Chain with ID ${chainId} not found.`;
        } else {
            const uri = getSubscriptionSubgraphURL(chain);
            const link = createHttpLink({ uri, fetch });
            let where: string = `user: "${walletAddress}"`
            where += `, expiredAt_gte: "${currentTimestamp}", plan_not: "null"`;
            where += isMultiPay ? `, contract_: {product_contains_nocase: "${HECTOR_MENU.HECTOR_MULTIPAY}"}` : `, contract_: {product_contains_nocase: "${HECTOR_MENU.HECTOR_TAXREPORT}"}`;
            const query: string = `
                    query {
                        subscriptionInfos(where:{${where}}) {
                            expiredAt
                            plan {
                            amount
                            token {
                                address
                                name
                                symbol
                            }
                            planId
                            period
                            totalPurchased
                            totalPaid
                            }
                            id
                            user {
                            address
                            balances {
                                balance
                                refunded
                                refund
                            }
                            }
                            contract {
                            address
                            product
                            }
                        }
                    }`;

            const operation = {
                query: gql(query),
            };

            let result = await makePromise(execute(link, operation)) as ISubscriptionResult;

            if (result.data && result.data.subscriptionInfos.length > 0) {
                responseData.status = false;
                responseData.reason = isMultiPay ? "Multipay - Subscription exist" : "TaxReport - Subscription exist";
            }

        }

        return responseData;
    } catch (e) {
        responseData.status = false;
        responseData.reason = "Something went wrong...";
        return responseData;
    }
};