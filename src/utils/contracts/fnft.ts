import Decimal from 'decimal.js';
import { Interface, InterfaceType, callMethod, StateMutability, hex256 } from '../abi';
import { Chain } from '../chain';
import { call, ProviderRpcError } from '../providerEip1193';
import { Result, ok } from '../util';
import { LockFarmType } from './lockFarm';

export async function totalSupply(chain: Chain, farm: LockFarmType): Promise<Result<Decimal, ProviderRpcError>> {
    const ABI: Interface = {
        name: 'totalSupply',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: StateMutability.View,
        type: InterfaceType.Function,
    };

    const result = await call(chain, {
        to: farm.fnft,
        data: await callMethod(ABI),
    });

    if (!result.isOk) {
        return result;
    }

    const totalSupplyVal = new Decimal(result.value);

    return ok(totalSupplyVal);
}

export async function tokenByIndex(
    chain: Chain,
    farm: LockFarmType,
    index: Decimal,
): Promise<Result<Decimal, ProviderRpcError>> {
    const ABI: Interface = {
        name: 'tokenByIndex',
        inputs: [{ name: 'index', type: 'uint256' }],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: StateMutability.View,
        type: InterfaceType.Function,
    };

    const result = await call(chain, {
        to: farm.fnft,
        data: await callMethod(ABI, [hex256(index.toHex())]),
    });

    if (!result.isOk) {
        return result;
    }

    const tokenIndex = new Decimal(result.value);

    return ok(tokenIndex);
}
