import Decimal from 'decimal.js';
import { FANTOM_HEC_USDC, MULTIPLIER_BASE } from 'src/constants';
import { Interface, InterfaceType, callMethod, StateMutability, hex256 } from '../abi';
import { Chain } from '../chain';
import { call, ProviderRpcError } from '../providerEip1193';
import { ok, Result } from '../util';
import { Erc20Token } from './erc20';
import { BigNumber, ethers } from 'ethers';

export type LockFarmType = {
    address: string;
    stake: Erc20Token;
    reward: Erc20Token;
    treasury: string;
    lockAddressRegistry: string;
    fnft: string;
    tokenVault: string;
    rewardWeight: string;
    splitter: string;
    emissionor: string;
    tokensForLp?: Erc20Token[];
    chain: Chain;
    startBlockNumber: string;
};

export interface FNFTInfo {
    id: Decimal;
    amount: Decimal;
    secs: Decimal;
    startTime: Decimal;
    multiplier: Decimal;
    rewardDebt: Decimal;
    pendingReward: Decimal;
}
export interface FtmScanInfo {
    status: string;
    message: string;
    result: string;
}

export async function fnfts(
    chain: Chain,
    farm: LockFarmType,
    fnftId: Decimal,
): Promise<Result<FNFTInfo, ProviderRpcError>> {
    const ABI: Interface = {
        name: 'fnfts',
        inputs: [{ name: '', type: 'uint256' }],
        outputs: [
            { name: 'id', type: 'uint256' },
            { name: 'amount', type: 'uint256' },
            { name: 'startTime', type: 'uint256' },
            { name: 'secs', type: 'uint256' },
            { name: 'multiplier', type: 'uint256' },
            { name: 'rewardDebt', type: 'uint256' },
            { name: 'pendingReward', type: 'uint256' },
        ],
        stateMutability: StateMutability.View,
        type: InterfaceType.Function,
    };
    const result = await call(chain, {
        to: farm.address,
        data: await callMethod(ABI, [hex256(fnftId.toHex())]),
    });
    if (!result.isOk) {
        return result;
    }
    const fnftValue = result.value.split('x');
    let idVal = '0';
    let amountVal = '0';
    let secsVal = '0';
    let startTimeVal = '0';
    let multiplierVal = '0';
    let rewardDebtVal = '0';
    let pendingRewardVal = '0';

    if (fnftValue.length === 2) {
        const fnftInfo = fnftValue[1] ? fnftValue[1].match(/.{1,64}/g) : null;
        if (fnftInfo) {
            idVal = '0x' + fnftInfo[0];
            amountVal = '0x' + fnftInfo[1];
            secsVal = '0x' + fnftInfo[2];
            startTimeVal = '0x' + fnftInfo[3];
            multiplierVal = '0x' + fnftInfo[4];
            rewardDebtVal = '0x' + fnftInfo[5];
            pendingRewardVal = '0x' + fnftInfo[6];
        }
    }

    const fnftData = {
        id: new Decimal(idVal),
        amount: new Decimal(amountVal).div(farm.stake.wei),
        secs: new Decimal(secsVal),
        startTime: new Decimal(startTimeVal),
        multiplier: new Decimal(multiplierVal).div(MULTIPLIER_BASE),
        rewardDebt: new Decimal(rewardDebtVal).div(farm.reward.wei),
        pendingReward: new Decimal(pendingRewardVal).div(farm.reward.wei),
    };

    return ok(fnftData);
}

export async function getAllFnfts(
    chain: Chain,
    farm: LockFarmType,
    offset: Decimal,
    size: Decimal,
): Promise<Result<FNFTInfo[], ProviderRpcError>> {
    const ABI: Interface = {
        name: 'getAllFnfts',
        inputs: [
            { name: 'offset', type: 'uint256' },
            { name: 'size', type: 'uint256' },
        ],
        outputs: [
            { name: 'id', type: 'uint256' },
            { name: 'amount', type: 'uint256' },
            { name: 'startTime', type: 'uint256' },
            { name: 'secs', type: 'uint256' },
            { name: 'multiplier', type: 'uint256' },
            { name: 'rewardDebt', type: 'uint256' },
            { name: 'pendingReward', type: 'uint256' },
        ],
        stateMutability: StateMutability.View,
        type: InterfaceType.Function,
    };
    const result = await call(chain, {
        to: farm.address,
        data: await callMethod(ABI, [hex256(offset.toHex()), hex256(size.toHex())]),
    });
    if (!result.isOk) {
        return result;
    }
    const fnftValue = result.value.split('x');
    let fnftData: FNFTInfo[] = [];

    const fnftInfo = fnftValue[1] ? fnftValue[1].match(/.{1,64}/g) : null;
    if (fnftInfo) {
        for (let i = 2; i < fnftInfo.length; i += 7) {
            const idVal = '0x' + fnftInfo[i];
            const amountVal = '0x' + fnftInfo[i + 1];
            const secsVal = '0x' + fnftInfo[i + 2];
            const startTimeVal = '0x' + fnftInfo[i + 3];
            const multiplierVal = '0x' + fnftInfo[i + 4];
            const rewardDebtVal = '0x' + fnftInfo[i + 5];
            const pendingRewardVal = '0x' + fnftInfo[i + 6];
            fnftData.push({
                id: new Decimal(idVal),
                amount: new Decimal(amountVal).div(farm.stake.wei),
                secs: new Decimal(secsVal),
                startTime: new Decimal(startTimeVal),
                multiplier: new Decimal(multiplierVal).div(MULTIPLIER_BASE),
                rewardDebt: new Decimal(rewardDebtVal).div(farm.reward.wei),
                pendingReward: new Decimal(pendingRewardVal).div(farm.reward.wei),
            });
        }
    }

    fnftData.filter((item) => item.id.toNumber() !== 0);

    return ok(fnftData);
}

export async function getFarmName(chain: Chain, farm: LockFarmType): Promise<Result<string, Error>> {
    const ABI: ethers.ContractInterface = [
        {
            inputs: [],
            name: 'name',
            outputs: [{ internalType: 'string', name: '', type: 'string' }],
            stateMutability: 'view',
            type: 'function',
        },
    ];

    const result = (await new ethers.Contract(
        farm.address,
        ABI,
        new ethers.providers.JsonRpcProvider(chain.rpc[0]),
    ).name()) as string;

    return ok(farm.stake.address === FANTOM_HEC_USDC.address ? 'HEC-USDC Farm' : result);
}

export async function totalTokenSupply(chain: Chain, farm: LockFarmType): Promise<Result<Decimal, ProviderRpcError>> {
    const ABI: Interface = {
        name: 'totalTokenSupply',
        inputs: [],
        outputs: [{ name: 'totalTokenSupply', type: 'uint256' }],
        stateMutability: StateMutability.View,
        type: InterfaceType.Function,
    };

    const result = await call(chain, {
        to: farm.address,
        data: await callMethod(ABI),
    });

    if (!result.isOk) {
        return result;
    }

    const totalTokenSupply = new Decimal(result.value).div(farm.stake.wei);

    return ok(totalTokenSupply);
}

export async function getRewardRate(chain: Chain, farm: LockFarmType): Promise<Result<Decimal, ProviderRpcError>> {
    const ABI: Interface = {
        name: 'rewardRate',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: StateMutability.View,
        type: InterfaceType.Function,
    };
    const result = await call(chain, {
        to: farm.address,
        data: await callMethod(ABI, []),
    });
    if (!result.isOk) {
        return result;
    }
    const rewardRate = new Decimal(result.value);
    return ok(rewardRate);
}

export async function getTotalTokenBoostedSupply(
    chain: Chain,
    farm: LockFarmType,
): Promise<Result<Decimal, ProviderRpcError>> {
    const ABI: Interface = {
        name: 'totalTokenBoostedSupply',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: StateMutability.View,
        type: InterfaceType.Function,
    };

    const result = await call(chain, {
        to: farm.address,
        data: await callMethod(ABI),
    });

    if (!result.isOk) {
        return result;
    }

    const apr = new Decimal(result.value);

    return ok(apr);
}

export async function getTotalTokenSupply(
    chain: Chain,
    farm: LockFarmType,
): Promise<Result<Decimal, ProviderRpcError>> {
    const ABI: Interface = {
        name: 'totalTokenSupply',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: StateMutability.View,
        type: InterfaceType.Function,
    };

    const result = await call(chain, {
        to: farm.address,
        data: await callMethod(ABI),
    });

    if (!result.isOk) {
        return result;
    }

    const apr = new Decimal(result.value);

    return ok(apr);
}

export async function getTotalSupply(chain: Chain, farm: LockFarmType): Promise<Result<Decimal, ProviderRpcError>> {
    const ABI: Interface = {
        name: 'totalSupply',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: StateMutability.View,
        type: InterfaceType.Function,
    };

    const result = await call(chain, {
        to: farm.stake.address,
        data: await callMethod(ABI, []),
    });

    if (!result.isOk) {
        return result;
    }

    const totalSupply = new Decimal(result.value);

    return ok(totalSupply);
}