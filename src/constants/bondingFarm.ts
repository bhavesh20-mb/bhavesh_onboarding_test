import {
    FANTOM_DAI,
    FANTOM_DAI_TESTNET,
    FANTOM_HEC,
    FANTOM_HEC_TESTNET,
    FANTOM_HEC_USDC,
    FANTOM_HEC_USDC_TESTNET,
    FANTOM_TOR,
    FANTOM_TOR_TESTNET,
    FANTOM_USDC,
    FANTOM_USDC_TESTNET,
    FANTOM_USDT,
    FANTOM_WFTM,
    FANTOM_WFTM_TESTNET,
    FTM_BOO,
} from './general';
import { Erc20Token } from 'src/utils/contracts/erc20';

export interface BondingFarmType {
    address: String;
    deposit: Erc20Token[];
    reward: Erc20Token;
    startBlockNumber?: String;
}

export const BONDING_FARMS: BondingFarmType[] = [
    {
        address: '0x5a9485a9d73f8839A743ca389C60F6598EdC4066',
        deposit: [FANTOM_DAI, FANTOM_USDC, FANTOM_USDT, FANTOM_WFTM, FANTOM_HEC_USDC],
        reward: FANTOM_HEC,
        startBlockNumber: '52061060',
    },
    {
        address: '0xd1b535f17f0FFE18dA799aaDD24F82c2778a4b1B',
        deposit: [FANTOM_DAI, FANTOM_USDC, FANTOM_USDT, FANTOM_WFTM, FANTOM_HEC_USDC],
        reward: FANTOM_HEC,
        startBlockNumber: '52635118',
    },
    {
        address: '0x9aea9B571deFd690Fc2c80337C97Bc67569a4BD0',
        deposit: [FANTOM_DAI, FANTOM_USDC],
        reward: FTM_BOO,
        startBlockNumber: '57061313',
    },
];

export const BONDING_FARMS_TESTNET: BondingFarmType[] = [
    {
        address: '0x5Aee0eF423D692A6c069CcEd79dA238e2317d212',
        deposit: [
            FANTOM_DAI_TESTNET,
            FANTOM_USDC_TESTNET,
            FANTOM_TOR_TESTNET,
            FANTOM_WFTM_TESTNET,
            FANTOM_HEC_USDC_TESTNET,
        ],
        reward: FANTOM_HEC_TESTNET,
        startBlockNumber: '12575308',
    },
    {
        address: '0x99d3aA70283b0CdfB5f6D38660f7ca0be4C376E7',
        deposit: [
            FANTOM_DAI_TESTNET,
            FANTOM_USDC_TESTNET,
            FANTOM_TOR_TESTNET,
            FANTOM_WFTM_TESTNET,
            FANTOM_HEC_USDC_TESTNET,
        ],
        reward: FANTOM_HEC_TESTNET,
        startBlockNumber: '12575308',
    },
    {
        address: '0xf571697fe50f4e6ad92929d90841b3b901eb0df8',
        deposit: [
            FANTOM_DAI_TESTNET,
            FANTOM_USDC_TESTNET,
            FANTOM_TOR_TESTNET,
            FANTOM_WFTM_TESTNET,
            FANTOM_HEC_USDC_TESTNET,
        ],
        reward: FANTOM_HEC_TESTNET,
        startBlockNumber: '12888968',
    },
];
