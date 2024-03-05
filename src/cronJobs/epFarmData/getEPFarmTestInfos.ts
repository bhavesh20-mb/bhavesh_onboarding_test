import Decimal from 'decimal.js';
import {
    CoinGeckoApiKeys,
    COINGECKO_API_KEY,
    FANTOM_HEC,
    ftmscanApiKey,
    LOCK_FARM_LIST_TESTNET,
    VOTING_TESTNET,
} from 'src/constants';
import { convertToHEC } from 'src/constants/voting';
import LockFarmInfoModel from 'src/database/models/lockfarminfo.model';
import { CoinGeckoInfo } from 'src/interfaces/apiDataModels';
import { ILockFarmModel } from 'src/interfaces/dbModels';
import {
    FtmScanInfo,
    getFarmName,
    getRewardRate,
    getTotalSupply,
    getTotalTokenBoostedSupply,
    getTotalTokenSupply,
    totalTokenSupply,
} from 'src/utils/contracts/lockFarm';
import { calculateAverageAPR, calculateFarmAPR, sleep } from 'src/utils/util';
import fetch from 'node-fetch';

export default async function () {
    if (LOCK_FARM_LIST_TESTNET.length > 0) {
        const lockfarmInfos: ILockFarmModel[] = [];

        for (let i = 0; i < LOCK_FARM_LIST_TESTNET.length; i++) {
            const lockFARM = LOCK_FARM_LIST_TESTNET[i]!;

            // get FarmName
            const lockfarmName = await getFarmName(lockFARM.chain, lockFARM);
            await sleep(100);

            // get TVL
            let farmTVL = new Decimal(0);
            const tokenSupplyAmount = await totalTokenSupply(lockFARM.chain, lockFARM);
            await sleep(200);
            if (tokenSupplyAmount.isOk) {
                const convertedValue = await convertToHEC(
                    lockFARM.chain,
                    VOTING_TESTNET,
                    lockFARM.stake,
                    tokenSupplyAmount.value,
                );
                await sleep(200);
                if (convertedValue.isOk) {
                    farmTVL = convertedValue.value.div(FANTOM_HEC.wei);
                }
            }

            // get baseAPR
            const rewardRate = await getRewardRate(lockFARM.chain, lockFARM);
            const totalTokenBoostedSupply = await getTotalTokenBoostedSupply(lockFARM.chain, lockFARM);
            const totalTokenSupplyAmount = await getTotalTokenSupply(lockFARM.chain, lockFARM);
            let apr = new Decimal(0);

            if (!lockFARM.tokensForLp) {
                if (rewardRate.isOk && totalTokenSupplyAmount.isOk) {
                    if (!totalTokenSupplyAmount.value.isZero()) {
                        try {
                            const getHecTokenInfo: CoinGeckoInfo = await fetch(
                                `https://pro-api.coingecko.com/api/v3/coins/hector-dao?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false&x_cg_pro_api_key=${COINGECKO_API_KEY}`,
                            ).then((res) => res.json());
                            const stakeTokenWei = FANTOM_HEC.wei;
                            const stakeTokenPrice = new Decimal(
                                getHecTokenInfo.market_data ? getHecTokenInfo.market_data.current_price.usd : 0,
                            );
                            const rewardTokenWei = FANTOM_HEC.wei;
                            const rewardTokenPrice = stakeTokenPrice;
                            if (!stakeTokenPrice.isZero() && !stakeTokenWei.isZero()) {
                                apr = calculateFarmAPR(
                                    rewardRate.value,
                                    totalTokenSupplyAmount.value,
                                    stakeTokenPrice,
                                    stakeTokenWei,
                                    rewardTokenPrice,
                                    rewardTokenWei,
                                );
                            }
                        } catch (error) {
                            console.log('token value fetch error =>', error);
                        }
                    }
                }
            } else {
                const token0Address = lockFARM.tokensForLp![0]!.address;
                const token1Address = lockFARM.tokensForLp![1]!.address;
                const totalToken0Amount: FtmScanInfo = await fetch(
                    `https://api-testnet.ftmscan.com/api?module=account&action=tokenbalance&contractaddress=${token0Address}&apikey=${ftmscanApiKey}&tag=latest&address=${lockFARM.stake.address}`,
                ).then((res) => res.json());
                const totalToken1Amount: FtmScanInfo = await fetch(
                    `https://api-testnet.ftmscan.com/api?module=account&action=tokenbalance&contractaddress=${token1Address}&apikey=${ftmscanApiKey}&tag=latest&address=${lockFARM.stake.address}`,
                ).then((res) => res.json());
                const lpTotalSupply = await getTotalSupply(lockFARM.chain, lockFARM);
                const token0ApiKey = CoinGeckoApiKeys.filter(
                    (item) => item.token.address.toLowerCase() === token0Address.toLowerCase(),
                );
                const token1ApiKey = CoinGeckoApiKeys.filter(
                    (item) => item.token.address.toLowerCase() === token1Address.toLowerCase(),
                );

                try {
                    const getToken0Info: CoinGeckoInfo = await fetch(
                        `https://pro-api.coingecko.com/api/v3/coins/${
                            token0ApiKey[0]!.apikey
                        }?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false&x_cg_pro_api_key=${COINGECKO_API_KEY}`,
                    ).then((res) => res.json());
                    const getToken1Info: CoinGeckoInfo = await fetch(
                        `https://pro-api.coingecko.com/api/v3/coins/${
                            token1ApiKey[0]!.apikey
                        }?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false&x_cg_pro_api_key=${COINGECKO_API_KEY}`,
                    ).then((res) => res.json());

                    if (
                        rewardRate.isOk &&
                        totalTokenSupplyAmount.isOk &&
                        lpTotalSupply.isOk &&
                        totalToken0Amount.message === 'OK' &&
                        totalToken1Amount.message === 'OK'
                    ) {
                        if (!totalTokenSupplyAmount.value.isZero()) {
                            const token0Price = getToken0Info.market_data
                                ? getToken0Info.market_data.current_price.usd
                                : 0;
                            const token1Price = getToken1Info.market_data
                                ? getToken1Info.market_data.current_price.usd
                                : 0;
                            const rewardTokenPrice = new Decimal(
                                token0Address.toLowerCase() === lockFARM.reward.address.toLowerCase()
                                    ? token0Price
                                    : token1Price,
                            );

                            const token0Wei = token0ApiKey[0]?.token.wei;
                            const token1Wei = token1ApiKey[0]?.token.wei;

                            if (
                                token0Wei &&
                                !token0Wei.isZero() &&
                                token1Wei &&
                                !token1Wei.isZero() &&
                                !lpTotalSupply.value.isZero()
                            ) {
                                const totalReserve = new Decimal(parseInt(totalToken0Amount.result) * token0Price)
                                    .div(token0Wei)
                                    .add(new Decimal(parseInt(totalToken1Amount.result) * token1Price).div(token1Wei));

                                const stakeTokenWei = lockFARM.stake.wei;
                                const rewardTokenWei = lockFARM.reward.wei;

                                const stakeTokenPrice = totalReserve.mul(stakeTokenWei).div(lpTotalSupply.value);

                                if (
                                    !stakeTokenPrice.isZero() &&
                                    !stakeTokenWei.isZero() &&
                                    !rewardTokenPrice.isZero() &&
                                    !rewardTokenWei.isZero()
                                ) {
                                    apr = calculateFarmAPR(
                                        rewardRate.value,
                                        totalTokenSupplyAmount.value,
                                        stakeTokenPrice,
                                        stakeTokenWei,
                                        rewardTokenPrice,
                                        rewardTokenWei,
                                    );
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.log('token info fetch error =>', error);
                }
            }

            await sleep(200);

            // get baseAPR
            let baseAPR = new Decimal(0);
            if (totalTokenBoostedSupply.isOk && totalTokenSupplyAmount.isOk) {
                if (!(totalTokenBoostedSupply.value.isZero() || totalTokenSupplyAmount.value.isZero())) {
                    baseAPR = calculateAverageAPR(apr, totalTokenBoostedSupply.value, totalTokenSupplyAmount.value);
                }
            }

            lockfarmInfos.push({
                address: lockFARM.address,
                farmName: lockfarmName.isOk ? lockfarmName.value : '',
                farmTVL: farmTVL.toNumber(),
                baseAPR: baseAPR.toNumber(),
                boostAPR: apr.toNumber(),
            });

            await sleep(500);
        }

        if (lockfarmInfos.length > 0) {
            const updateIds = lockfarmInfos.map((item) => {
                return item.address;
            });
            await LockFarmInfoModel.deleteMany({
                $and: [{ address: { $in: updateIds } }],
            });
            await LockFarmInfoModel.insertMany(lockfarmInfos);
        }
    }
}
