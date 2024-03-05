import Decimal from 'decimal.js';
import fetch from 'node-fetch';
import { MULTIPAY_SUBGRAPH, SUBSCRIPTION_SUBGRAPH } from 'src/constants';
import { Chain } from './chain';
import moment from 'moment';
import Web3 from 'web3';

// for getting object values from contract
export function getParameter(index: number, value: string): string {
    let offset = 0;
    if (value.startsWith('0x')) {
        offset = 2;
    }
    return '0x' + value.slice(offset + index * 64, offset + (index + 1) * 64);
}

export type Result<Value, Error> = { isOk: true; value: Value } | { isOk: false; error: Error };

export function ok<T, E>(value: T): Result<T, E> {
    return { isOk: true, value };
}

export function err<E, T>(error: E): Result<T, E> {
    return { isOk: false, error };
}

/** Your typical sleep function, for async tasks. */
export async function sleep(millis: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, millis);
    });
}

/**
 * Get current UTC timestamp in second
 */
export async function getCurrentTimeInSecond(): Promise<number> {
    try {
        const r = await (await fetch('https://timeapi.io/api/Time/current/zone?timeZone=UTC')).json();

        return Math.trunc(new Date(`${r.dateTime}Z`).getTime() / 1000);
    } catch (error) {
        console.log(error);
        return Math.trunc(new Date().getTime() / 1000);
    }
}

/********** In the HEC farm **********
APR = (365 * 24 * 3600 * rewardRate) / ((stakingTokenPrice * totalTokenSupply * 10^rewardTokenDecimals) / (rewardTokenPrice * 10^stakingTokenDecimals)) * 100 (%)
*************************************/
export const calculateFarmAPR = (
    rewardRate: Decimal,
    totalTokenSupply: Decimal,
    stakingTokenPrice: Decimal,
    stakingTokenWei: Decimal,
    rewardTokenPrice: Decimal,
    rewardTokenWei: Decimal,
): Decimal => {
    const apr = new Decimal(365 * 24 * 3600)
        .mul(rewardRate)
        .div(stakingTokenPrice.mul(totalTokenSupply).mul(rewardTokenWei).div(rewardTokenPrice.mul(stakingTokenWei)))
        .mul(new Decimal(100));
    return apr;
};

export const calculateAverageAPR = (
    apr: Decimal,
    totalTokenBoostedSupply: Decimal,
    totalTokenSupply: Decimal,
): Decimal => {
    const averageAPR = apr.div(totalTokenBoostedSupply.div(totalTokenSupply));
    return averageAPR;
};

export function getMultiPaySubgraphURL(chain: Chain): string {
    const subgraph = MULTIPAY_SUBGRAPH.find((subgraph) => subgraph.id == chain.id);
    if (subgraph) {
        return subgraph.url;
    }
    return '';
}

export function getSubscriptionSubgraphURL(chain: Chain): string {
    const subgraph = SUBSCRIPTION_SUBGRAPH.find((subgraph) => subgraph.id == chain.id);
    if (subgraph) {
        return subgraph.url;
    }
    return '';
}
/**
 * Replace all characters between a `left` and `right` index with ellipsis.
 * Very useful for shortening addresses!
 *
 * For example:
 * ```ts
 * ellipsisBetween(6, 4, "0x2F354A88651B1C9F84") === "0x2F35...9F84";
 * ```
 */
export function ellipsisBetween(charsFromLeft: number, charsFromRight: number, str: string): string {
    if (charsFromLeft + charsFromRight >= str.length) {
        return str;
    }
    const left = str.slice(0, charsFromLeft);
    const right = str.slice(str.length - charsFromRight);
    return `${left}...${right}`;
}
export const getBlockNumberFromTimestamp = async (rpc: string, blocktime: number, timestamp: number) => {
    timestamp = timestamp || moment.utc().startOf('day').unix();

    const lowerLimitStamp = timestamp - 1000;
    const higherLimitStamp = timestamp + 1000;

    const web3 = new Web3(rpc);

    const currentBlockNumber = await web3.eth.getBlockNumber();
    let block = await web3.eth.getBlock(currentBlockNumber);

    let requestsMade = 0;

    let blockNumber = currentBlockNumber;

    while (parseInt(block.timestamp.toString()) > timestamp) {
        let decreaseBlocks: number = (Number(block.timestamp) - timestamp) / blocktime;
        decreaseBlocks = parseInt(decreaseBlocks.toString());
        if (decreaseBlocks < 1) {
            break;
        }

        blockNumber -= decreaseBlocks;

        block = await web3.eth.getBlock(blockNumber);
        requestsMade += 1;
    }

    if (lowerLimitStamp && parseInt(block.timestamp.toString()) < lowerLimitStamp) {
        while (parseInt(block.timestamp.toString()) < lowerLimitStamp) {
            blockNumber++;

            block = await web3.eth.getBlock(blockNumber);
            requestsMade++;
        }
    }

    if (higherLimitStamp) {
        if (parseInt(block.timestamp.toString()) >= higherLimitStamp) {
            while (parseInt(block.timestamp.toString()) >= higherLimitStamp) {
                blockNumber--;

                block = await web3.eth.getBlock(blockNumber);
                requestsMade++;
            }
        }

        if (parseInt(block.timestamp.toString()) < higherLimitStamp) {
            while (parseInt(block.timestamp.toString()) < higherLimitStamp) {
                blockNumber++;

                if (blockNumber > currentBlockNumber) break;

                const tempBlock = await web3.eth.getBlock(blockNumber);
                if (parseInt(tempBlock.timestamp.toString()) >= higherLimitStamp) {
                    break;
                }

                block = tempBlock;

                requestsMade++;
            }
        }
    }

    return block.number;
};
