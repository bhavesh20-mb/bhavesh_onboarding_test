import { Decimal } from 'decimal.js';
import { Interface, InterfaceType, callMethod, StateMutability } from '../abi';
import { Chain } from '../chain';
import { call, ProviderRpcError } from '../providerEip1193';
import { ok, Result } from '../util';
import { FANTOM_HEC } from 'src/constants';

export async function getHECCirculatingSupply(
    chain: Chain,
    contractAddress: string,
): Promise<Result<Decimal, ProviderRpcError>> {
    const ABI: Interface = {
        name: 'HECCirculatingSupply',
        type: InterfaceType.Function,
        stateMutability: StateMutability.View,
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    };
    const result = await call(chain, {
        to: contractAddress,
        data: await callMethod(ABI),
    });
    if (!result.isOk) {
        return result;
    }
    const hecCirculatingSupply = new Decimal(result.value).div(FANTOM_HEC.wei);
    return ok(hecCirculatingSupply);
}
