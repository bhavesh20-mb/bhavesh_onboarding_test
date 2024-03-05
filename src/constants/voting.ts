import Decimal from 'decimal.js';
import { BigNumber, ethers } from 'ethers';
import { Chain } from 'src/utils/chain';
import { Erc20Token } from 'src/utils/contracts/erc20';
import { ok, Result } from 'src/utils/util';
import { Erc721Token } from './erc721';
import { Interface, InterfaceType, callMethod, StateMutability, hex256 } from '../utils/abi';
import { call, ProviderRpcError } from '../utils/providerEip1193';

const abiDecoder = require('abi-decoder');

export type Voting = {
    address: string;
    hec: Erc20Token;
    lockFarm: string;
    fnft: Erc721Token;
    emissionor: string;
};

// convertToHEC
export async function convertToHEC(
    chain: Chain,
    voting: Voting,
    stakingToken: Erc20Token,
    amount: Decimal,
): Promise<Result<Decimal, Error>> {
    const ABI: ethers.ContractInterface = [
        {
            inputs: [
                {
                    internalType: 'address',
                    name: '_stakingToken',
                    type: 'address',
                },
                {
                    internalType: 'uint256',
                    name: '_amount',
                    type: 'uint256',
                },
            ],
            name: 'convertToHEC',
            outputs: [
                {
                    internalType: 'uint256',
                    name: '',
                    type: 'uint256',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
    ];

    const result = new Decimal(
        (
            (await new ethers.Contract(
                voting.address,
                ABI,
                new ethers.providers.JsonRpcProvider(chain.rpc[0]),
            ).convertToHEC(stakingToken.address, amount.mul(stakingToken.wei).toHex())) as BigNumber
        ).toHexString(),
    );

    return ok(result);
}

export function getVotingMethodDecode(voteTx: any) {
    const ABI = [
        {
            inputs: [
                {
                    internalType: 'contract LockFarm[]',
                    name: '_farmVote',
                    type: 'address[]',
                },
                {
                    internalType: 'uint256[]',
                    name: '_weights',
                    type: 'uint256[]',
                },
                {
                    internalType: 'contract IERC20',
                    name: '_stakingToken',
                    type: 'address',
                },
                {
                    internalType: 'uint256',
                    name: '_amount',
                    type: 'uint256',
                },
                {
                    internalType: 'contract FNFT',
                    name: '_fnft',
                    type: 'address',
                },
                {
                    internalType: 'uint256[]',
                    name: '_fnftIds',
                    type: 'uint256[]',
                },
            ],
            name: 'vote',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ];

    abiDecoder.addABI(ABI);
    const decodedData = abiDecoder.decodeMethod(voteTx.input);

    const result = decodedData?.params?.filter((res: any) => {
        return res?.name === '_fnftIds' || res?.name === '_fnft';
    });

    return result ? result : [];
}

export async function getVoteDelayingTime(chain: Chain, voting: Voting): Promise<Result<Decimal, ProviderRpcError>> {
    const ABI: Interface = {
        inputs: [],
        name: 'voteDelay',
        outputs: [
            {
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: StateMutability.View,
        type: InterfaceType.Function,
    };

    const result = await call(chain, {
        to: voting.address,
        data: await callMethod(ABI, []),
    });

    if (!result.isOk) {
        return result;
    }

    const voteDelay = new Decimal(result.value);

    return ok(voteDelay);
}
