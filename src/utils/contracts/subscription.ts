import { ContractInterface, ethers } from 'ethers';
import { FANTOM_ADDRESS_MAINNET, FANTOM_ADDRESS_TESTNET, HECTOR_SUBSCRIPTION } from 'src/constants';
import { CHAINS, Chain } from '../chain';

export async function syncSubscriptions(chain: Chain, wallets: string[]) {
    console.log("Chain:", chain.shortName);
    console.log("Count of Subscriptions:", wallets.length);
    const ABI: ContractInterface = [
        {
            inputs: [{ internalType: 'address[]', name: 'froms', type: 'address[]' }],
            name: 'syncSubscriptions',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ];

    const provider = new ethers.providers.JsonRpcProvider(chain.rpc[0]);

    const privateKey = process.env.HECTOR_MULTIPAY_WALLET_PRIATE_KEY || '';

    const signer = new ethers.Wallet(privateKey, provider);

    const hectorSubscription = HECTOR_SUBSCRIPTION.find((c) => (c.id == chain.id))?.address;

    if (hectorSubscription && hectorSubscription.length > 0) {
        const contract = new ethers.Contract(hectorSubscription, ABI, signer);
        const tx = await contract.syncSubscriptions(wallets);
        const receipt = await tx.wait();
        console.log("transactionHash:", receipt.transactionHash);
        return receipt.status;
    } else {
        console.log("Chain:", chain.id, " Undefined HectorSubscription Address.");
        return false;
    }
}
