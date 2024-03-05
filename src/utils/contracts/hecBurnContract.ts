import { Decimal } from 'decimal.js';
import { Interface, InterfaceType, callMethod, StateMutability } from '../abi';
import { Chain } from '../chain';
import { FANTOM_ADDRESS_MAINNET, FANTOM_HEC } from 'src/constants';
import { call, ProviderRpcError } from '../providerEip1193';
import { ok, Result } from '../util';

export async function getHecBurned(chain: Chain): Promise<Result<Decimal, ProviderRpcError>> {
    const ABI: Interface = {
        inputs: [],
        name: 'totalBurnt',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: StateMutability.View,
        type: InterfaceType.Function,
    };
    const [res1, res2] = await Promise.all([
        call(chain, {
            to: FANTOM_ADDRESS_MAINNET.HEC_BURN_ALLOCATOR,
            data: await callMethod(ABI),
        }),
        call(chain, {
            to: FANTOM_ADDRESS_MAINNET.OLD_HEC_BURN_ALLOCATOR,
            data: await callMethod(ABI),
        }),
    ]);
    if (!res1.isOk) {
        return res1;
    }
    if (!res2.isOk) {
        return res2;
    }
    if (res1.value === '0x0') {
        return ok(new Decimal(res1.value));
    }
    return ok(new Decimal(res1.value).plus(new Decimal(res2.value)).div(FANTOM_HEC.wei));
}
