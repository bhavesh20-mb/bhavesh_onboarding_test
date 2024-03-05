import { ethers } from 'ethers';
import { callMethod, Interface, InterfaceType, StateMutability } from '../abi';
import { Chain } from '../chain';
import { call, ProviderRpcError } from '../providerEip1193';
import { ok, Result } from '../util';

export async function getBondingFarmName(chain: Chain, farmAddress: string): Promise<Result<string, ProviderRpcError>> {
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
        farmAddress,
        ABI,
        new ethers.providers.JsonRpcProvider(chain.rpc[0]),
    ).name()) as string;

    return ok(result);
}

export async function getAutoStakingStatus(
    chain: Chain,
    bondContractAddress: string,
): Promise<Result<boolean, ProviderRpcError>> {
    const ABI: Interface = {
        inputs: [],
        name: 'autoStaking',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: StateMutability.View,
        type: InterfaceType.Function,
    };

    const result = await call(chain, {
        to: bondContractAddress,
        data: await callMethod(ABI),
    });
    if (!result.isOk) {
        return result;
    }
    const status = parseInt(result.value, 16);
    return ok(status === 1 ? true : false);
}
