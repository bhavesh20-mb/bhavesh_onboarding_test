import { hex256, Interface, InterfaceType, callMethod, StateMutability, token256 } from '../abi';
import { getParameter, ok } from '../util';
import { FANTOM_ADDRESS_MAINNET, FANTOM_HEC } from 'src/constants';
import { call, ProviderRpcError, sendTransaction, TransactionAddress, WalletProvider } from '../providerEip1193';
import { Result } from '../util';
import { Decimal } from 'decimal.js';
import { Chain } from '../chain';

export interface EpochInfo {
    length: Decimal;
    number: Decimal;
    endBlock: Decimal;
    distribute: Decimal;
}

export async function getEpochInfo(chain: Chain): Promise<Result<EpochInfo, ProviderRpcError>> {
    const ABI: Interface = {
        inputs: [],
        name: 'epoch',
        outputs: [
            {
                name: 'length',
                type: 'uint256',
            },
            {
                name: 'number',
                type: 'uint256',
            },
            {
                name: 'endBlock',
                type: 'uint256',
            },
            {
                name: 'distribute',
                type: 'uint256',
            },
        ],
        stateMutability: StateMutability.View,
        type: InterfaceType.Function,
    };
    const result = await call(chain, {
        to: FANTOM_ADDRESS_MAINNET.STAKING,
        data: await callMethod(ABI),
    });
    if (!result.isOk) {
        return result;
    }
    const length = new Decimal(getParameter(0, result.value));
    const number = new Decimal(getParameter(1, result.value));
    const endBlock = new Decimal(getParameter(2, result.value));
    const distribute = new Decimal(getParameter(3, result.value));

    return ok({ length, number, endBlock, distribute });
}

export async function getHecCircSupply(chain: Chain): Promise<Result<string, ProviderRpcError>> {
    const ABI: Interface = {
        inputs: [],
        name: 'circulatingSupply',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: StateMutability.View,
        type: InterfaceType.Function,
    };
    const result = await call(chain, {
        to: FANTOM_ADDRESS_MAINNET.SHEC,
        data: await callMethod(ABI),
    });
    if (!result.isOk) {
        return result;
    }
    const circ = new Decimal(getParameter(0, result.value));
    return ok(circ.toString());
}

export async function getStakingIndex(chain: Chain): Promise<Result<string, ProviderRpcError>> {
    const ABI: Interface = {
        inputs: [],
        name: 'index',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: StateMutability.View,
        type: InterfaceType.Function,
    };
    const result = await call(chain, {
        to: FANTOM_ADDRESS_MAINNET.STAKING,
        data: await callMethod(ABI),
    });
    if (!result.isOk) {
        return result;
    }
    const index = new Decimal(getParameter(0, result.value));

    return ok(index.toString());
}

export async function stake(
    provider: WalletProvider,
    owner: string,
    hec: Decimal,
): Promise<Result<TransactionAddress, ProviderRpcError>> {
    const ABI: Interface = {
        inputs: [
            { name: '_amount', type: 'uint256' },
            { name: '_recipient', type: 'address' },
        ],
        name: 'stake',
        outputs: [],
        stateMutability: StateMutability.NonPayable,
        type: InterfaceType.Function,
    };

    const result = await sendTransaction(provider, {
        from: owner,
        to: FANTOM_ADDRESS_MAINNET.STAKING_HELPER,
        data: await callMethod(ABI, [token256(FANTOM_HEC, hec), hex256(owner)]),
    });
    return result;
}

export async function unstake(
    provider: WalletProvider,
    owner: string,
    sHec: Decimal,
): Promise<Result<TransactionAddress, ProviderRpcError>> {
    const ABI: Interface = {
        inputs: [
            { name: '_amount', type: 'uint256' },
            { name: '_trigger', type: 'bool' },
        ],
        name: 'unstake',
        outputs: [],
        stateMutability: StateMutability.NonPayable,
        type: InterfaceType.Function,
    };
    const result = await sendTransaction(provider, {
        from: owner,
        to: FANTOM_ADDRESS_MAINNET.STAKING,
        data: await callMethod(ABI, [token256(FANTOM_HEC, sHec), hex256(owner)]),
    });
    return result;
}
