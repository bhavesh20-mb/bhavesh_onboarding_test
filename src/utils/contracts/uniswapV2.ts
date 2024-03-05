import Decimal from 'decimal.js';
import { Interface, InterfaceType, callMethod, StateMutability } from '../abi';
import { FANTOM_ADDRESS_MAINNET } from 'src/constants';
import { Result, ok, getParameter } from '../util';
import { Chain } from '../chain';
import { call, ProviderRpcError } from '../providerEip1193';

export async function getMarketPrice(chain: Chain): Promise<Result<Decimal, ProviderRpcError>> {
    const ABI: Interface = {
        constant: true,
        inputs: [],
        name: 'getReserves',
        outputs: [
            { name: 'reserve0', type: 'uint112' },
            { name: 'reserve1', type: 'uint112' },
            { name: 'blockTimestampLast', type: 'uint32' },
        ],
        payable: false,
        stateMutability: StateMutability.View,
        type: InterfaceType.Function,
    };
    const result = await call(chain, {
        to: FANTOM_ADDRESS_MAINNET.DAILP,
        data: await callMethod(ABI),
    });
    if (!result.isOk) {
        return result;
    }
    const reserve0 = new Decimal(getParameter(0, result.value));
    const reserve1 = new Decimal(getParameter(1, result.value));
    const marketPrice = reserve1.div(reserve0);
    return ok(marketPrice);
}
