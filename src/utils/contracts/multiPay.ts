import { BigNumber, ContractInterface, ethers } from 'ethers';
import { FANTOM_ADDRESS_TESTNET, MultiPayFactory } from 'src/constants';
import { StreamParam } from 'src/cronJobs/multiPayData/interface';
import { Chain } from 'src/utils/chain';

export async function pauseStreams(chain: Chain, streams: StreamParam[]) {
    console.log("Chain:", chain.shortName);
    console.log("Count of Streams:", streams.length);
    const ABI: ContractInterface = [
        {
            "inputs": [
                {
                    "components": [
                        {
                            "internalType": "address",
                            "name": "payContract",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "from",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "to",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "amountPerSec",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint48",
                            "name": "starts",
                            "type": "uint48"
                        },
                        {
                            "internalType": "uint48",
                            "name": "ends",
                            "type": "uint48"
                        }
                    ],
                    "internalType": "struct HectorPayFactory.Stream[]",
                    "name": "streams",
                    "type": "tuple[]"
                }
            ],
            "name": "pauseStreams",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
    ];

    const provider = new ethers.providers.JsonRpcProvider(chain.rpc[0]);

    const privateKey = process.env.HECTOR_MULTIPAY_WALLET_PRIATE_KEY || '';

    const signer = new ethers.Wallet(privateKey, provider);

    const MultiPayFactoryAddress = MultiPayFactory.find((c) => (c.id == chain.id))?.address;

    if (MultiPayFactoryAddress && MultiPayFactoryAddress.length > 0) {
        const contract = new ethers.Contract(MultiPayFactoryAddress, ABI, signer);
        const tx = await contract.pauseStreams(streams);
        const receipt = await tx.wait();
        console.log("transactionHash:", receipt.transactionHash);
        return receipt.status;
    } else {
        console.log("Chain:", chain.id, " Undefined MultiPayFactory Address.");
        return false;
    }
}

export async function resumeStreams(chain: Chain, streams: StreamParam[]) {
    console.log("Chain:", chain.shortName);
    console.log("Count of Streams:", streams.length);
    const ABI: ContractInterface = [
        {
            "inputs": [
                {
                    "components": [
                        {
                            "internalType": "address",
                            "name": "payContract",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "from",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "to",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "amountPerSec",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint48",
                            "name": "starts",
                            "type": "uint48"
                        },
                        {
                            "internalType": "uint48",
                            "name": "ends",
                            "type": "uint48"
                        }
                    ],
                    "internalType": "struct HectorPayFactory.Stream[]",
                    "name": "streams",
                    "type": "tuple[]"
                }
            ],
            "name": "resumeStreams",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
    ];

    const provider = new ethers.providers.JsonRpcProvider(chain.rpc[0]);

    const privateKey = process.env.HECTOR_MULTIPAY_WALLET_PRIATE_KEY || '';

    const signer = new ethers.Wallet(privateKey, provider);

    const MultiPayFactoryAddress = MultiPayFactory.find((c) => (c.id == chain.id))?.address;

    if (MultiPayFactoryAddress && MultiPayFactoryAddress.length > 0) {
        const contract = new ethers.Contract(MultiPayFactoryAddress, ABI, signer);
        const tx = await contract.resumeStreams(streams);
        const receipt = await tx.wait();
        console.log("transactionHash:", receipt.transactionHash);
        return receipt.status;
    } else {
        console.log("Chain:", chain.id, " Undefined MultiPayFactory Address.");
        return false;
    }
}