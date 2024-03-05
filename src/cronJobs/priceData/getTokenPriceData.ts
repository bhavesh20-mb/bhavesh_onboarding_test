import { coingeckoApiKey, coingeckoProApiBaseUrl } from 'src/constants';
import PriceModel from 'src/database/models/price.model';
import { IPriceModel } from 'src/interfaces/dbModels';
import { CHAINS } from 'src/utils/chain';

const axios = require('axios');
const ethers = require('ethers');

// Functions
/**
 * Returns chain name
 * @param chainId (string | number)
 * @returns chainName (string)
 */
function getChainName(chainId: string | number) {
    const chainIdNumber = typeof chainId == 'string' ? Number(chainId) : chainId;
    const chainInfo = CHAINS.find((chain) => chain.id == chainIdNumber);
    return chainInfo!.shortName.toLowerCase();
}

/**
 * Returns CoinGecko's Coin ID for the specific chain native token
 * @param chainId (string | number)
 * @returns chainName (string)
 */
function getCoingeckoCoinID(chainId: string | number) {
    const chainIdNumber = typeof chainId == 'string' ? Number(chainId) : chainId;
    const chainInfo = CHAINS.find((chain) => chain.id == chainIdNumber);
    return chainInfo!.token?.coingeckoCoinId;
}

/**
 * Returns chain RPC URL
 * @param chainId (string | number)
 * @returns rpcURL (string)
 */
function getChainRPC(chainId: string | number) {
    const chainIdNumber = typeof chainId == 'string' ? Number(chainId) : chainId;
    const chainInfo = CHAINS.find((chain) => chain.id == chainIdNumber);
    return chainInfo!.rpc[0];
}

/**
 * Returns start and end timestamp of block number
 * @param chainId (string | number)
 * @param blockNumber (number)
 * @returns { startTimestamp, endTimestamp, minStartTimestamp, maxEndTimestamp } ({ number, number, number, number })
 */
async function getStartAndEndBlockTimestamps(chainId: string | number, blockNumber: number) {
    const chainRPC = getChainRPC(chainId);
    const provider = new ethers.providers.JsonRpcProvider(chainRPC);

    try {
        const block = await provider.getBlock(blockNumber);
        const prevBlock = await provider.getBlock(blockNumber - 1);
        const blockTime = block.timestamp - prevBlock.timestamp;
        const startTimestamp = block.timestamp;
        const endTimestamp = Math.ceil(startTimestamp + blockTime);
        const minStartTimestamp = startTimestamp - 24 * 3600;
        const maxEndTimestamp = endTimestamp + 24 * 3600;

        return {
            startTimestamp,
            endTimestamp,
            minStartTimestamp,
            maxEndTimestamp,
        };
    } catch (error) {
        console.error(error);
    }
}

/**
 *
 * @param timestamps (number)
 * @param targetTimestamp (number)
 * @returns { nearestTimestamp, nearestPrice } ({ number | number })
 */
function getNearestTimestamp(
    timestampPrices: number[][],
    targetTimestamp: number,
): { nearestTimestamp: number; nearestPrice: number } {
    let nearestTimestamp = timestampPrices[0][0];
    let nearestDistance = Math.abs(targetTimestamp - nearestTimestamp);
    let nearestPrice = 0;

    for (let i = 1; i < timestampPrices.length; i++) {
        const distance = Math.abs(targetTimestamp - timestampPrices[i][0]);
        if (distance < nearestDistance) {
            nearestTimestamp = timestampPrices[i][0];
            nearestPrice = timestampPrices[i][1];
            nearestDistance = distance;
        }
    }

    return { nearestTimestamp, nearestPrice };
}

/**
 * Returns token price at specific block number from token address
 * @param chainName (string)
 * @param tokenAddress (string)
 * @param blockNumber (number)
 * @returns tokenPrice (number)
 */
async function getTokenPricesAtBlock(
    chainId: string | number,
    tokenAddress: string,
    blockNumber: number,
): Promise<number> {
    const chainName = getChainName(chainId);
    const result = await getStartAndEndBlockTimestamps(chainId, blockNumber);

    let endTimestamp = 0;
    let minStartTimestamp = 0,
        maxEndTimestamp = 0;

    if (result !== undefined) {
        endTimestamp = result.endTimestamp;
        minStartTimestamp = result.minStartTimestamp;
        maxEndTimestamp = result.maxEndTimestamp;
    }
    const COINGECKO_API_URL = `${coingeckoProApiBaseUrl}/coins/${chainName}/contract/${tokenAddress}/market_chart/range?vs_currency=usd&from=${minStartTimestamp}&to=${maxEndTimestamp}&x_cg_pro_api_key=${coingeckoApiKey}`;
    const response = await axios.get(COINGECKO_API_URL);
    const prices = response.data.prices;

    if (tokenAddress == '0x0000000000000000000000000000000000000000' || tokenAddress == '0x0') {
        const coinId = getCoingeckoCoinID(chainId);
        if (coinId == undefined) {
            return 0;
        }

        const { nearestPrice, nearestTimestamp } = await getTokenPricesFromCoinIDAtBlock(chainId, coinId, blockNumber);

        if (nearestTimestamp != 0 && nearestPrice != 0) {
            const priceModelData: IPriceModel = {
                chainName: getChainName(chainId),
                tokenAddress: tokenAddress.toLowerCase(),
                price: nearestPrice,
                blockNumber: blockNumber,
                timestamp: nearestTimestamp,
                priceUnit: 'USD',
            };

            await PriceModel.insertMany(priceModelData);
        }

        return nearestPrice;
    } else {
        const COINGECKO_API_URL = `https://api.coingecko.com/api/v3/coins/${chainName}/contract/${tokenAddress}/market_chart/range?vs_currency=usd&from=${minStartTimestamp}&to=${maxEndTimestamp}`;

        try {
            const response = await axios.get(COINGECKO_API_URL);
            const prices = response.data.prices;

            if (prices == undefined || prices.length == 0) {
                return 0;
            }

            let priceTimestamps: any[] = [];
            prices.forEach((price: any[]) => {
                priceTimestamps.push([Math.floor(price[0] / 1000), price[1]]);
            });

            if (priceTimestamps == undefined || priceTimestamps.length == 0) {
                return 0;
            }

            const { nearestTimestamp, nearestPrice } = getNearestTimestamp(priceTimestamps, endTimestamp);

            if (nearestTimestamp != 0 && nearestPrice != 0) {
                const priceModelData: IPriceModel = {
                    chainName: getChainName(chainId),
                    tokenAddress: tokenAddress.toLowerCase(),
                    price: nearestPrice,
                    blockNumber: blockNumber,
                    timestamp: nearestTimestamp,
                    priceUnit: 'USD',
                };

                await PriceModel.insertMany(priceModelData);
            }

            return nearestPrice;
        } catch (e) {
            // console.log(e);

            return 0;
        }
    }
}

/**
 * Returns token price at specific block number from coin id
 * @param chainName (string)
 * @param tokenAddress (string)
 * @param blockNumber (number)
 * @returns { nearestPrice, nearestTimestamp } ({ number, number })
 */
export async function getTokenPricesFromCoinIDAtBlock(
    chainId: string | number,
    coinID: string,
    blockNumber: number,
): Promise<{ nearestPrice: number; nearestTimestamp: number }> {
    const result = await getStartAndEndBlockTimestamps(chainId, blockNumber);

    let endTimestamp = 0;
    let minStartTimestamp = 0,
        maxEndTimestamp = 0;

    if (result !== undefined) {
        endTimestamp = result.endTimestamp;
        minStartTimestamp = result.minStartTimestamp;
        maxEndTimestamp = result.maxEndTimestamp;
    }
    const COINGECKO_API_URL = `${coingeckoProApiBaseUrl}/coins/${coinID}/market_chart/range?vs_currency=usd&from=${minStartTimestamp}&to=${maxEndTimestamp}&x_cg_pro_api_key=${coingeckoApiKey}`;
    const response = await axios.get(COINGECKO_API_URL);
    const prices = response.data.prices;

    if (prices == undefined || prices.length == 0) {
        return { nearestPrice: 0, nearestTimestamp: 0 };
    }

    let priceTimestamps: any[] = [];
    prices.forEach((price: any[]) => {
        priceTimestamps.push([Math.floor(price[0] / 1000), price[1]]);
    });

    if (priceTimestamps == undefined || priceTimestamps.length == 0) {
        return { nearestPrice: 0, nearestTimestamp: 0 };
    }

    const { nearestPrice, nearestTimestamp } = getNearestTimestamp(priceTimestamps, endTimestamp);

    return { nearestPrice, nearestTimestamp };
}

/**
 * Fetch token price from DB
 * @param chainId (string | number)
 * @param tokenAddress (string)
 * @param blockNumber (number)
 * @returns { result, price, priceUnit } ({ bool, number, string })
 */
export async function getTokenPricesFromDB(chainId: string | number, tokenAddress: string, blockNumber: number) {
    const chainName = getChainName(chainId);

    try {
        const result = await PriceModel.findOne({
            $and: [
                { chainName: chainName.toLowerCase() },
                { tokenAddress: tokenAddress.toLowerCase() },
                { blockNumber: blockNumber },
            ],
        });

        if (result == undefined) {
            return {
                result: false,
                price: 0,
                priceUnit: 'USD',
            };
        }

        return {
            result: true,
            price: result.price,
            priceUnit: result.priceUnit,
        };
    } catch (e) {
        // console.log(e);

        return {
            result: false,
            price: 0,
            priceUnit: 'USD',
        };
    }
}

// Main Function
/**
 * Returns Token Price at specific block number
 * @param chainId (string | number)
 * @param lpTokenAddress (string)
 * @param blockNumber (number)
 * @returns tokenPrice (number)
 */
export default async function (chainId: string | number, tokenAddress: string, blockNumber: number) {
    const dbResult = await getTokenPricesFromDB(chainId, tokenAddress, blockNumber);
    if (dbResult.result) {
        return dbResult.price;
    }

    const tokenPrice = await getTokenPricesAtBlock(chainId, tokenAddress, blockNumber);
    return tokenPrice;
}
