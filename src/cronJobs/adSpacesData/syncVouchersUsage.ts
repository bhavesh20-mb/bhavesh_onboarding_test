import fetch from 'cross-fetch';

import { ApolloLink, execute, makePromise } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import gql from 'graphql-tag';
import { Chain, CHAINS } from 'src/utils/chain';
import { getSubscriptionSubgraphURL } from 'src/utils/util';
import AdSpacesVoucherModel from 'src/database/models/adspaces/voucher.model';
import CouponModel from 'src/database/models/adspaces/coupon.model';

export default async function (chainId: number) {
    console.log('\nStart AdSpaces Vouchers Usage Sync...\n');
    const chain = CHAINS.find((c) => c.id == chainId);
    if (chain == undefined) {
        console.error(`Chain with ID ${chainId} not found.`);
        return;
    }
    try {
        const uri = getSubscriptionSubgraphURL(chain);
        const link = createHttpLink({ uri, fetch });
        const filteredVouchersData = await filterVouchers(link);
        const vouchersHistory = filteredVouchersData?.data?.historyEvents;
        if (vouchersHistory && vouchersHistory.length > 0) {
            vouchersHistory.map(async (voucherInfo: any) => {
                const voucherData = await findVoucherData(link, voucherInfo.id);
                //console.log('voucherData', voucherData);
                if (voucherData.data) {
                    const voucher = await AdSpacesVoucherModel.findOne({
                        id: voucherData.data.historyEvent.couponId,
                        redeemed: false,
                    });
                    //console.log('voucher', voucher);
                    if (voucher) {
                        voucher.redeemed = true;
                        await voucher.save();

                        const coupon = await CouponModel.findById(voucher.generatedForCoupon);
                        console.log('coupon', coupon);
                        if (coupon) {
                            coupon.results.voucherRedeemed += 1;
                            try {
                                coupon.results.redeemers.push({
                                    address: voucher.generatedForAddress,
                                    redeemedAt: new Date(),
                                    voucherUsed: voucher._id.toString(),
                                    planId: voucherData.data.historyEvent.plan.planId,
                                    userPaid: Number(voucherData.data.historyEvent.plan.totalPaid),
                                });
                                await coupon.save();
                            } catch (error) {
                                console.log('error', error);
                            }
                        }
                    }
                }
            });
        }
        return true;
    } catch (error) {
        return;
    }
}

async function filterVouchers(link: ApolloLink) {
    const query: string = `
          query {
            historyEvents(
              where: {eventType: "SubscriptionCreatedWithCoupon"}
              orderBy: createdTimestamp
              orderDirection: desc
              first:500
            ) {
              id
              txHash
              eventType
              user {
                id
              }
              subscription {
                id
              }
              couponId
              createdTimestamp
              createdBlock
            }
          }`;
    const operation = {
        query: gql(query),
    };
    return await makePromise(execute(link, operation));
}

async function findVoucherData(link: ApolloLink, id: string) {
    const query: string = `
          query {
            historyEvent(id: "${id}") {
              couponId
              createdTimestamp
              eventType
              txHash
              createdBlock
              plan {
                amount
                createdBlock
                createdTimestamp
                data
                id
                period
                planId
                totalPaid
                totalPurchased
                token {
                  symbol
                  name
                  address
                }
              }
              subscription {
                createdBlock
                createdTimestamp
                expiredAt
                id
              }
            }
          }`;
    const operation = {
        query: gql(query),
    };
    return await makePromise(execute(link, operation));
}
