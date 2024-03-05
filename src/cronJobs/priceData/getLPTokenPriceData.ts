import { BigNumber, ethers } from 'ethers';
import PriceModel from 'src/database/models/price.model';
import { IPriceModel } from 'src/interfaces/dbModels';
import { CHAINS } from 'src/utils/chain';
import getTokenPriceData, { getTokenPricesFromCoinIDAtBlock } from './getTokenPriceData';

// ABIs
const ABIs = [
    'function getReserves() external view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)',
    'function token0() external view returns (address)',
    'function token1() external view returns (address)',
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address _address) view returns (uint256)',
    'function decimals() view returns (uint8)',
];

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
 * Return uniswapV2PairAddress, token0Address, token0Decimals, token1Address, and token1Decimals
 * @param lpTokenAddress (string)
 * @param provider (ethers.providers.Provider)
 * @returns { uniswapV2PairAddress, token0Address, token0Decimals, token1Address, token1Decimals } ({ string, string, number, string, number })
 */
async function getUniswapV2PairDetails(provider: ethers.providers.Provider, lpTokenAddress: string) {
    const uniswapV2PairContract = new ethers.Contract(lpTokenAddress, ABIs, provider);

    const token0Address = await uniswapV2PairContract.token0();
    const token1Address = await uniswapV2PairContract.token1();

    const token0Decimals = await getTokenDecimals(token0Address, provider);
    const token1Decimals = await getTokenDecimals(token1Address, provider);

    return {
        uniswapV2PairAddress: lpTokenAddress,
        token0Address: token0Address,
        token0Decimals: token0Decimals,
        token1Address: token1Address,
        token1Decimals: token1Decimals,
    };
}

/**
 * Returns ERC20 token decimals
 * @param tokenAddress (string)
 * @param provider (ethers.providers.Provider)
 * @returns decimals (number)
 */
async function getTokenDecimals(tokenAddress: string, provider: ethers.providers.Provider) {
    const tokenContract = new ethers.Contract(tokenAddress, ABIs, provider);

    return tokenContract.decimals();
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
        console.log(e);

        return {
            result: false,
            price: 0,
            priceUnit: 'USD',
        };
    }
}

// Main Function
/**
 * Returns LP Token Price at specific block number
 * @param chainId (string | number)
 * @param lpTokenAddress (string)
 * @param blockNumber (number)
 * @returns lpTokenPrice (number)
 */
export default async function (chainId: string | number, lpTokenAddress: string, blockNumber: number) {
    const dbResult = await getTokenPricesFromDB(chainId, lpTokenAddress, blockNumber);
    if (dbResult.result) {
        return dbResult.price;
    }

    const provider = new ethers.providers.JsonRpcProvider(getChainRPC(chainId));

    const {
        uniswapV2PairAddress,
        token0Address,
        token0Decimals,
        token1Address,
        token1Decimals,
    } = await getUniswapV2PairDetails(provider, lpTokenAddress);

    // Pair Reserves at specific block number
    const uniswapV2PairContract = new ethers.Contract(uniswapV2PairAddress, ABIs, provider);
    const [reserve0, reserve1] = await uniswapV2PairContract.getReserves({ blockTag: blockNumber });

    // LP Pair Token Prices
    const token0Ratio = reserve1.mul(ethers.utils.parseEther('1')).div(reserve0.mul(10 ** (18 - token0Decimals)));
    const token1Ratio = reserve0.mul(ethers.utils.parseEther('1')).div(reserve1.mul(10 ** (18 - token1Decimals)));
    const token0Amount = Number(ethers.utils.formatUnits(token0Ratio, token1Decimals));
    const token1Amount = Number(ethers.utils.formatUnits(token1Ratio, token0Decimals));
    const token0PriceUSD = (await getTokenPriceData(chainId, token1Address, blockNumber)) * token0Amount;
    const token1PriceUSD = (await getTokenPriceData(chainId, token0Address, blockNumber)) * token1Amount;

    // LP Token Total Reserve
    const totalReserve =
        token0PriceUSD * Number(reserve0.div(10 ** token0Decimals)) +
        token1PriceUSD * Number(reserve1.div(10 ** token1Decimals));

    // LP Token Total Supply at specific block number
    const lpTokenSupply = await uniswapV2PairContract.totalSupply({ blockTag: blockNumber });

    // LP Token Price
    const lpTokenPrice = Number(ethers.utils.parseEther(totalReserve.toString()).div(lpTokenSupply));

    const blockTimestamp = (await provider.getBlock(blockNumber)).timestamp;

    if (blockTimestamp != 0 && lpTokenPrice != 0) {
        const priceModelData: IPriceModel = {
            chainName: getChainName(chainId),
            tokenAddress: lpTokenAddress.toLowerCase(),
            price: lpTokenPrice,
            blockNumber: blockNumber,
            timestamp: blockTimestamp,
            priceUnit: 'LP',
        };

        await PriceModel.insertMany(priceModelData);
    }

    return lpTokenPrice;
}
