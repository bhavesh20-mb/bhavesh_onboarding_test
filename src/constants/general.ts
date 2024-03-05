import Decimal from 'decimal.js';
import { FANTOM, FANTOM_MAINNET, FANTOM_TESTNET } from 'src/utils/chain';
import { Erc20Token } from 'src/utils/contracts/erc20';
import { LockFarmType } from 'src/utils/contracts/lockFarm';
import { Erc721Token } from './erc721';
// import { LOCK_FARM_LIST_MAINNET, LOCK_FARM_LIST_TESTNET } from './lockFarm';
import { Voting } from './voting';

export const readableDecimalNumberRegex = /^[0-9]*[.]?[0-9]*$/;

export const FANTOM_ADDRESS_MAINNET = {
    FANTOM_VALIDATOR: '0x35796Ce4Ed757075D346c1bc374D67628fadcbB1',
    SECOND_FANTOM_VALIDATOR: '0x9c2036151781661D08184163Cbb89dFD3b921075',
    THIRD_FANTOM_VALIDATOR: '0xBE4b73f5Caff476Ed0Cdb4C043236fce81f4dC6C',
    DAI: '0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E',
    USDC: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
    USDT: '0x049d68029688eabf473097a2fc38ef61633a3c7a',
    MIM: '0x82f0B8B456c1A451378467398982d4834b6829c1',
    FRAX: '0xdc301622e621166bd8e82f2ca0a26c13ad0be355',
    WFTM: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
    TOR: '0x74E23dF9110Aa9eA0b6ff2fAEE01e740CA1c642e',
    DAILP: '0xbc0eecdA2d8141e3a26D2535C57cadcb1095bca9',
    USDCLP: '0x0b9589A2C1379138D4cC5043cE551F466193c8dE',
    TORLP: '0x4339b475399AD7226bE3aD2826e1D78BBFb9a0d9',
    FRAXLP: '0x0f8D6953F58C0dd38077495ACA64cbd1c76b7501',

    HEC: '0x5c4fdfc5233f935f20d2adba572f770c2e377ab0',
    SHEC: '0x75bdef24285013387a47775828bec90b91ca9a5f',
    WSHEC: '0x94CcF60f700146BeA8eF7832820800E2dFa92EdA',

    STAKING: '0xD12930C8deeDafD788F437879cbA1Ad1E3908Cc5', // The new staking contract
    STAKING_HELPER: '0x2694c2AAab19950B37FE47478276B5D4a2A73C45', // Helper contract used for Staking only
    DISTRIBUTOR: '0x41400d445359f5aD51650C76746C98D79174b2e3',
    OLD_STAKING: '0x9ae7972BA46933B3B20aaE7Acbf6C311847aCA40',
    OLD_STAKING_HELPER: '0x2ca8913173D36021dC56922b5db8C428C3fdb146',
    OLD_SHEC: '0x36F26880C6406b967bDb9901CDe43ABC9D53f106',

    BONDINGCALC: '0xA36De21abd90b27e5EfF108D761Ab4fe06fD4Ab4',
    gOHMBONDINGCALC: '0xC13E8C5465998BDD1D91952243774d55B12dBEd0',
    BONDINGCALC_ALT: '0x783A734D5C65e44D3CC0C74e331C4d4F23407E64',
    TREASURY: '0xCB54EA94191B280C296E6ff0E37c7e76Ad42dC6A',
    DAO_WALLET: '0x677d6EC74fA352D4Ef9B1886F6155384aCD70D90',
    REDEEM_HELPER: '0xe78D7ECe7969d26Ae39b2d86BbC04Ae32784daF2',
    AGGREGATOR: '0x7dc6bad2798ba1AcD8cf34F9a3eF3a168252e1A6',

    FARMING_AGGREGATOR: '0x86fb74B3b1949985AC2081B9c679d84BB44A2bf2',

    DAI_TOR_USDC_POOL: '0x24699312CB27C26Cfc669459D670559E5E44EE60',
    DAI_TOR_USDC_FARM: '0x61B71689684800f73eBb67378fc2e1527fbDC3b3',

    TOR_WFTM_POOL: '0x41d88635029c4402BF9914782aE55c412f8F2142',
    TOR_WFTM_FARM: '0xD54d478975990927c0Bb9803708A3eD5Dc1cFa20',

    TOR_MINTER: '0x9b0c6FfA7d0Ec29EAb516d3F2dC809eE43DD60ca',
    TOR_REDEEM: '0x45aC684B6b9Ee1A8647F51170C90c8f943D002E3',
    TOR_LP_AMOUNTS: '0xE4D581869BFc6238d544b0e4c9D678Ad51192654',
    CURVE_FI: '0x78D51EB71a62c081550EfcC0a9F9Ea94B2Ef081c',

    OLD_HEC_BURN_ALLOCATOR: '0x3fF53A304d3672693e90bb880653925db6e63C51',
    HEC_BURN_ALLOCATOR: '0xD3Ea3b2313d24e0f2302b21f04D0F784CDb6389B',

    STAKING_GATEWAY: '0xfF03889aBC1a36BDF176f6dd6742CB58705c8517',
    TOR_WFTM_FARM_REWARDS: '0xD54d478975990927c0Bb9803708A3eD5Dc1cFa20',
    TOR_WFTM_POOL_PRICER: '0x4e0bE969429976Cfd2fB7DE4bac7C5a46d1887D6',
    TOR_WFTM_FARM_REWARD_PRICER: '0xB6328dcc014B3D4B6639f055d2d6B6935236D114',

    HEC_DAI_LP_44_BOND: '0x124C23a4119122f05a4C9D2287Ed19fC00f8059a',
    DAI_44_BOND: '0xE1Cc7FE3E78aEfe6f93D1614A09156fF296Bc81E',

    HectorBond_V2_FTM_USDC: '0x4441f551001AB0785f1006929aA86d0c846F30Cc',
    HectorBond_V2_FTM_DAI: '0xDd62C045d9a873f1206A5291dcF0ea9Fc2AA8Ddf',
    HectorBond_V2_FTM_USDT: '0x312AdE5A805E5F3975BBdBB9fEB5ef4d1e15EB8f',

    HEC_USDC_POL: '0x0b9589A2C1379138D4cC5043cE551F466193c8dE',

    RewardToken: '0x5C4FDfc5233f935f20D2aDbA572F770c2E377Ab0',
    StakingToken: '0x5C4FDfc5233f935f20D2aDbA572F770c2E377Ab0',
    LockAddressRegistry: '0x55639b1833Ddc160c18cA60f5d0eC9286201f525',
    FNFT: '0x51aEafAC5E4494E9bB2B9e5176844206AaC33Aa3',
    TokenVault: '0x1fA6693d9933CC7f578CDd35071FC6d6cc8451E0',
    // LockFarm: "0x80993B75e38227f1A3AF6f456Cf64747F0E21612",
    RewardWeight: '0x75414cE07a2D65dab843DC2E5dC8787bcF90CD11',
    Splitter: '0xca85afEd49D702DE428f96A1BdE02162A08C7238',
    Emissionor: '0x00A7d5FDd1E42d047fdaF19D4b2d982245c5FF86',
    Voting: '0xd44EAd4d2E7ab8a834555B636426b29Ec359A6E2',

    COUPON: '0x85658f2f7dd45ba918DD9Ad2280f98cad02fcF50',
};

export const FANTOM_ADDRESS_TESTNET = {
    UniswapV2Factory: '0xEE4bC42157cf65291Ba2FE839AE127e3Cc76f741',
    UniswapV2Router: '0xa6AD18C2aC47803E193F75c3677b14BF19B94883',

    HEC: '0x55639b1833Ddc160c18cA60f5d0eC9286201f525',
    WHEC: '0xc625fa79F79c34Dc38ed717161B76Be01975cf29',
    TOR: '0xCe5b1b90a1E1527E8B82a9434266b2d6B72cc70b',
    DAI: '0x80993B75e38227f1A3AF6f456Cf64747F0E21612',
    DAILP: '0x7b7348F55ef8Ed84cf21F4F67EE9210eA1318fB6',
    USDC: '0x6f3da9C6700cAfBAb0323cF344F58C54B3ddB66b',
    USDT: '0xBc5581AddCbFA105ba14c86E62D25D60E2d1Cf66',
    WFTM: '0x18002Cf2a14Ba495B94a63Cd9844f4232010D824',
    USDCLP: '0x9C4Ee29CD1C219623eBEA40A42b5af11414D7C90',
    TORLP: '0xd02a80B4A58308B1aD8652abe348Ae2Ca241E636',
    SHEC: '0x51aEafAC5E4494E9bB2B9e5176844206AaC33Aa3',
    WSHEC: '0x1fA6693d9933CC7f578CDd35071FC6d6cc8451E0',

    STAKING: '0x60D4367F97c4a7711a80e5a8c28893c24336cF15',
    STAKING_HELPER: '0x901c80C5068A41e69CF96a4e739faBDa597BAd65',
    DAO_WALLET: '0xE693aD983eCdfE91F0E47992D869CEA60df425Be',

    FARMING_AGGREGATOR: '',

    DAI_TOR_USDC_POOL: '',
    DAI_TOR_USDC_FARM: '',

    HEC_TREASURY: '0x0e7A017e737d4B48E6E27F5B69F9483203aF0D14',
    HEC_MINTER: '0x765Bd53096685D476A3cc4AA1312a6FA0B339ddD',
    TOR_MINTER: '0x9E8e8d7f228b3B909FfbB4E4E6197491e3DDf937',
    HEC_TRESURY: '0x35b510418d0DdA5D7cDcc3879F1a35880E3A7793',
    TOR_REDEEM: '',
    CURVE_FI: '0x78D51EB71a62c081550EfcC0a9F9Ea94B2Ef081c', //production, should be exchanged

    OLD_HEC_BURN_ALLOCATOR: '',
    HEC_BURN_ALLOCATOR: '',

    HectorBond_V2_FTM_USDC: '0x7936DCe6e4d1553428FF55E11ff00D79504dDB91',
    HectorBond_V2_FTM_DAI: '0xdcBe2cC4eaF2c53F1820c1688f23E0BC4fD51d90',
    HectorBond_V2_FTM_USDT: '',

    StakingToken: '0x55639b1833Ddc160c18cA60f5d0eC9286201f525',
    RewardToken: '0x55639b1833Ddc160c18cA60f5d0eC9286201f525',

    Treasury: '0x22E46d32D2eA98947Cd36587dFA495FADa2DB2F2',
    LockAddressRegistry: '0x2D86a40Ff217493cCE3a23627F6A749dAe1f9018',
    FNFT: '0x7b88137d10394537F1EEa6cEd3ec4f778EEfAAc3',
    TokenVault: '0x4b7dC9E2Cc8B97Fe6073d03667Aed96c071c532B',
    RewardWeight: '0x4b9677BEBd3Ff9fE2a02AAC6E4eD5026916BE22E',
    Splitter: '0x44E867C51146932ac10728E86107bF488F38fA1e',
    Emissionor: '0x37257B32b515Cb37193794a26b3C55113bF761E8',
    Voting: '0xE888829383Aa2932A902C822BC32dD9FCc87598C',
};

export const FANTOM_HEC: Erc20Token = {
    name: 'Hector Network',
    symbol: 'HEC',
    logo: '',
    address: FANTOM_ADDRESS_MAINNET.HEC,
    chain: FANTOM.id,
    decimals: 9,
    wei: new Decimal(10 ** 9),
};

export const FANTOM_HEC_TESTNET: Erc20Token = {
    name: 'Hector Network',
    symbol: 'HEC',
    logo: '',
    address: FANTOM_ADDRESS_TESTNET.HEC,
    chain: FANTOM_TESTNET.id,
    decimals: 9,
    wei: new Decimal(10 ** 9),
};

export const FANTOM_DAI = {
    name: 'DAI',
    symbol: 'DAI',
    logo: '',
    address: FANTOM_ADDRESS_MAINNET.DAI,
    chain: FANTOM.id,
    decimals: 18,
    wei: new Decimal(10 ** 18),
};

export const FANTOM_DAI_TESTNET = {
    name: 'DAI',
    symbol: 'DAI',
    logo: '',
    address: FANTOM_ADDRESS_TESTNET.DAI,
    chain: FANTOM_TESTNET.id,
    decimals: 18,
    wei: new Decimal(10 ** 18),
};

export const FANTOM_USDC = {
    name: 'USDC',
    symbol: 'USDC',
    logo: '',
    address: FANTOM_ADDRESS_MAINNET.USDC,
    chain: FANTOM.id,
    decimals: 6,
    wei: new Decimal(10 ** 6),
};

export const FANTOM_USDC_TESTNET = {
    name: 'USDC',
    symbol: 'USDC',
    logo: '',
    address: FANTOM_ADDRESS_TESTNET.USDC,
    chain: FANTOM_TESTNET.id,
    decimals: 6,
    wei: new Decimal(10 ** 6),
};

export const FANTOM_sHEC: Erc20Token = {
    name: 'Staked Hector',
    symbol: 'sHEC',
    logo: '',
    address: FANTOM_ADDRESS_MAINNET.SHEC,
    chain: FANTOM.id,
    decimals: 9,
    wei: new Decimal(10 ** 9),
};

export const FANTOM_sHEC_TESTNET: Erc20Token = {
    name: 'Staked Hector',
    symbol: 'sHEC',
    logo: '',
    address: FANTOM_ADDRESS_TESTNET.SHEC,
    chain: FANTOM_TESTNET.id,
    decimals: 9,
    wei: new Decimal(10 ** 9),
};

export const FANTOM_wsHEC: Erc20Token = {
    name: 'Wrapped Staked Hector',
    symbol: 'wsHEC',
    logo: '',
    coingecko: 'wrapped-hec',
    address: FANTOM_ADDRESS_MAINNET.WSHEC,
    chain: FANTOM.id,
    decimals: 18,
    wei: new Decimal(10 ** 18),
};

export const FANTOM_wsHEC_TESTNET: Erc20Token = {
    name: 'Wrapped Staked Hector',
    symbol: 'wsHEC',
    logo: '',
    coingecko: 'wrapped-hec',
    address: FANTOM_ADDRESS_TESTNET.WSHEC,
    chain: FANTOM_TESTNET.id,
    decimals: 18,
    wei: new Decimal(10 ** 18),
};

export const FANTOM_HEC_USDC: Erc20Token = {
    name: 'HEC+USDC Spooky LP',
    symbol: 'spLP',
    logo: '',
    address: FANTOM_ADDRESS_MAINNET.USDCLP,
    chain: FANTOM.id,
    decimals: 18,
    wei: new Decimal(10 ** 18),
};

export const FANTOM_HEC_USDC_TESTNET: Erc20Token = {
    name: 'HEC+USDC Spooky LP',
    symbol: 'spLP',
    logo: '',
    address: FANTOM_ADDRESS_TESTNET.USDCLP,
    chain: FANTOM_TESTNET.id,
    decimals: 18,
    wei: new Decimal(10 ** 18),
};

export const FANTOM_HEC_TOR: Erc20Token = {
    name: 'HEC+TOR Spooky LP',
    symbol: 'HEC-TOR',
    logo: '',
    address: FANTOM_ADDRESS_MAINNET.TORLP,
    chain: FANTOM.id,
    decimals: 18,
    wei: new Decimal(10 ** 18),
};

export const FANTOM_HEC_TOR_TESTNET: Erc20Token = {
    name: 'HEC+TOR Spooky LP',
    symbol: 'HEC-TOR',
    logo: '',
    address: FANTOM_ADDRESS_TESTNET.TORLP,
    chain: FANTOM_TESTNET.id,
    decimals: 18,
    wei: new Decimal(10 ** 18),
};

export const FANTOM_USDT: Erc20Token = {
    name: 'USDT',
    symbol: 'USDT',
    logo: '',
    address: FANTOM_ADDRESS_MAINNET.USDT,
    chain: FANTOM.id,
    decimals: 6,
    wei: new Decimal(10 ** 6),
};

export const FANTOM_USDT_TESTNET: Erc20Token = {
    name: 'USDT',
    symbol: 'USDT',
    logo: '',
    address: FANTOM_ADDRESS_TESTNET.USDT,
    chain: FANTOM_TESTNET.id,
    decimals: 6,
    wei: new Decimal(10 ** 6),
};

export const FTM_BOO: Erc20Token = {
    name: 'Boo',
    symbol: 'BOO',
    logo: '',
    address: '0x841fad6eae12c286d1fd18d1d525dffa75c7effe',
    chain: FANTOM.id,
    decimals: 18,
    wei: new Decimal(10 ** 18),
};

export const FTM_BOO_TESTNET: Erc20Token = {
    name: 'Boo',
    symbol: 'BOO',
    logo: '',
    address: '0x5cdf75ede9f89a9f1e125bccbe0d371a2496bcae',
    chain: FANTOM_TESTNET.id,
    decimals: 18,
    wei: new Decimal(10 ** 18),
};

export const FANTOM_TOR: Erc20Token = {
    name: 'Tor',
    symbol: 'TOR',
    coingecko: 'tor',
    logo: '',
    address: FANTOM_ADDRESS_MAINNET.TOR,
    chain: FANTOM.id,
    decimals: 18,
    wei: new Decimal(10 ** 18),
};

export const FANTOM_TOR_TESTNET: Erc20Token = {
    name: 'Tor',
    symbol: 'TOR',
    coingecko: 'tor',
    logo: '',
    address: FANTOM_ADDRESS_TESTNET.TOR,
    chain: FANTOM_TESTNET.id,
    decimals: 18,
    wei: new Decimal(10 ** 18),
};

export const FANTOM_WFTM: Erc20Token = {
    name: 'Wrapped Fantom',
    symbol: 'wFTM',
    coingecko: 'wrapped-fantom',
    logo: '',
    address: FANTOM_ADDRESS_MAINNET.WFTM,
    chain: FANTOM.id,
    decimals: 18,
    wei: new Decimal(10 ** 18),
};

export const FANTOM_WFTM_TESTNET: Erc20Token = {
    name: 'Wrapped Fantom',
    symbol: 'wFTM',
    coingecko: 'wrapped-fantom',
    logo: '',
    address: FANTOM_ADDRESS_TESTNET.WFTM,
    chain: FANTOM_TESTNET.id,
    decimals: 18,
    wei: new Decimal(10 ** 18),
};

export const BLOCK_NUMBER_LIST = ['45788808', '45997162', '46037350', '47822454'];

export const FANTOM_FNFT_MAINNET: Erc721Token = {
    address: FANTOM_ADDRESS_MAINNET.FNFT,
    chain: FANTOM.id,
};

export const FANTOM_FNFT_TESTNET: Erc721Token = {
    address: FANTOM_ADDRESS_TESTNET.FNFT,
    chain: FANTOM_TESTNET.id,
};

export const OLD_LOCK_FARM: LockFarmType = {
    address: '0x80993B75e38227f1A3AF6f456Cf64747F0E21612',
    stake: FANTOM_HEC,
    reward: FANTOM_HEC,
    treasury: '',
    lockAddressRegistry: '0x55639b1833Ddc160c18cA60f5d0eC9286201f525',
    fnft: '0x51aEafAC5E4494E9bB2B9e5176844206AaC33Aa3',
    tokenVault: '0x1fA6693d9933CC7f578CDd35071FC6d6cc8451E0',
    rewardWeight: '0x75414cE07a2D65dab843DC2E5dC8787bcF90CD11',
    splitter: '0xca85afEd49D702DE428f96A1BdE02162A08C7238',
    emissionor: '0x00A7d5FDd1E42d047fdaF19D4b2d982245c5FF86',
    chain: FANTOM_MAINNET,
    startBlockNumber: '48927150',
};

export const LOCK_FARM_LIST_MAINNET: LockFarmType[] = [
    {
        address: '0x80993B75e38227f1A3AF6f456Cf64747F0E21612',
        stake: FANTOM_HEC,
        reward: FANTOM_HEC,
        treasury: '',
        lockAddressRegistry: '0x55639b1833Ddc160c18cA60f5d0eC9286201f525',
        fnft: '0x51aEafAC5E4494E9bB2B9e5176844206AaC33Aa3',
        tokenVault: '0x1fA6693d9933CC7f578CDd35071FC6d6cc8451E0',
        rewardWeight: '0x75414cE07a2D65dab843DC2E5dC8787bcF90CD11',
        splitter: '0xca85afEd49D702DE428f96A1BdE02162A08C7238',
        emissionor: '0x00A7d5FDd1E42d047fdaF19D4b2d982245c5FF86',
        chain: FANTOM_MAINNET,
        startBlockNumber: '48927150',
    },
    {
        address: '0xd7faE64DD872616587Cc8914d4848947403078B8',
        stake: FANTOM_HEC_USDC,
        reward: FANTOM_HEC,
        treasury: '',
        lockAddressRegistry: '0x55639b1833Ddc160c18cA60f5d0eC9286201f525',
        fnft: '0x51aEafAC5E4494E9bB2B9e5176844206AaC33Aa3',
        tokenVault: '0x1fA6693d9933CC7f578CDd35071FC6d6cc8451E0',
        rewardWeight: '0x75414cE07a2D65dab843DC2E5dC8787bcF90CD11',
        splitter: '0xca85afEd49D702DE428f96A1BdE02162A08C7238',
        emissionor: '0x00A7d5FDd1E42d047fdaF19D4b2d982245c5FF86',
        tokensForLp: [FANTOM_USDC, FANTOM_HEC],
        chain: FANTOM_MAINNET,
        startBlockNumber: '48927150',
    },
    {
        address: '0xB13610B4e7168f664Fcef2C6EbC58990Ae835Ff1',
        stake: FANTOM_HEC_TOR,
        reward: FANTOM_HEC,
        treasury: FANTOM_HEC.address,
        lockAddressRegistry: '0x55639b1833Ddc160c18cA60f5d0eC9286201f525',
        fnft: '0x51aEafAC5E4494E9bB2B9e5176844206AaC33Aa3',
        tokenVault: '0x1fA6693d9933CC7f578CDd35071FC6d6cc8451E0',
        rewardWeight: '0x75414cE07a2D65dab843DC2E5dC8787bcF90CD11',
        splitter: '0xca85afEd49D702DE428f96A1BdE02162A08C7238',
        emissionor: '0x00A7d5FDd1E42d047fdaF19D4b2d982245c5FF86',
        tokensForLp: [FANTOM_HEC, FANTOM_TOR],
        chain: FANTOM_MAINNET,
        startBlockNumber: '53149083',
    },
];

export const LOCK_FARM_LIST_TESTNET: LockFarmType[] = [
    // #1
    {
        address: '0xC464e6d45004Bf56772E70e22d9cF61C5Ae63970',
        stake: FANTOM_HEC_TESTNET,
        reward: FANTOM_HEC_TESTNET,
        treasury: '0x22E46d32D2eA98947Cd36587dFA495FADa2DB2F2',
        lockAddressRegistry: '0x2D86a40Ff217493cCE3a23627F6A749dAe1f9018',
        fnft: '0x7b88137d10394537F1EEa6cEd3ec4f778EEfAAc3',
        tokenVault: '0x4b7dC9E2Cc8B97Fe6073d03667Aed96c071c532B',
        rewardWeight: '0x4b9677BEBd3Ff9fE2a02AAC6E4eD5026916BE22E',
        splitter: '0x44E867C51146932ac10728E86107bF488F38fA1e',
        emissionor: '0x37257B32b515Cb37193794a26b3C55113bF761E8',
        chain: FANTOM_TESTNET,
        startBlockNumber: '11416829',
    },
    // #2
    {
        address: '0x55869De94AB1F18295C1C5aC3C1c80995F2D5a2E',
        stake: FANTOM_HEC_TESTNET,
        reward: FANTOM_HEC_TESTNET,
        treasury: '0x22E46d32D2eA98947Cd36587dFA495FADa2DB2F2',
        lockAddressRegistry: '0x2D86a40Ff217493cCE3a23627F6A749dAe1f9018',
        fnft: '0x7b88137d10394537F1EEa6cEd3ec4f778EEfAAc3',
        tokenVault: '0x4b7dC9E2Cc8B97Fe6073d03667Aed96c071c532B',
        rewardWeight: '0x4b9677BEBd3Ff9fE2a02AAC6E4eD5026916BE22E',
        splitter: '0x44E867C51146932ac10728E86107bF488F38fA1e',
        emissionor: '0x37257B32b515Cb37193794a26b3C55113bF761E8',
        chain: FANTOM_TESTNET,
        startBlockNumber: '11416830',
    },
    // #3
    {
        address: '0x9DF988299260F5A21C3b903630cF53e1C5688990',
        stake: FANTOM_HEC_TESTNET,
        reward: FANTOM_HEC_TESTNET,
        treasury: '0x22E46d32D2eA98947Cd36587dFA495FADa2DB2F2',
        lockAddressRegistry: '0x2D86a40Ff217493cCE3a23627F6A749dAe1f9018',
        fnft: '0x7b88137d10394537F1EEa6cEd3ec4f778EEfAAc3',
        tokenVault: '0x4b7dC9E2Cc8B97Fe6073d03667Aed96c071c532B',
        rewardWeight: '0x4b9677BEBd3Ff9fE2a02AAC6E4eD5026916BE22E',
        splitter: '0x44E867C51146932ac10728E86107bF488F38fA1e',
        emissionor: '0x37257B32b515Cb37193794a26b3C55113bF761E8',
        chain: FANTOM_TESTNET,
        startBlockNumber: '11416832',
    },
    // #4
    {
        address: '0xE54C5c3C00Ca22c7Bf471923F17f41Fc94a8F31c',
        stake: FANTOM_HEC_TESTNET,
        reward: FANTOM_HEC_TESTNET,
        treasury: '0x22E46d32D2eA98947Cd36587dFA495FADa2DB2F2',
        lockAddressRegistry: '0x2D86a40Ff217493cCE3a23627F6A749dAe1f9018',
        fnft: '0x7b88137d10394537F1EEa6cEd3ec4f778EEfAAc3',
        tokenVault: '0x4b7dC9E2Cc8B97Fe6073d03667Aed96c071c532B',
        rewardWeight: '0x4b9677BEBd3Ff9fE2a02AAC6E4eD5026916BE22E',
        splitter: '0x44E867C51146932ac10728E86107bF488F38fA1e',
        emissionor: '0x37257B32b515Cb37193794a26b3C55113bF761E8',
        chain: FANTOM_TESTNET,
        startBlockNumber: '11416834',
    },
    // #5
    {
        address: '0x6B047365B1C75772f7CaF922FD71c8106F2B0c71',
        stake: FANTOM_HEC_TESTNET,
        reward: FANTOM_HEC_TESTNET,
        treasury: '0x22E46d32D2eA98947Cd36587dFA495FADa2DB2F2',
        lockAddressRegistry: '0x2D86a40Ff217493cCE3a23627F6A749dAe1f9018',
        fnft: '0x7b88137d10394537F1EEa6cEd3ec4f778EEfAAc3',
        tokenVault: '0x4b7dC9E2Cc8B97Fe6073d03667Aed96c071c532B',
        rewardWeight: '0x4b9677BEBd3Ff9fE2a02AAC6E4eD5026916BE22E',
        splitter: '0x44E867C51146932ac10728E86107bF488F38fA1e',
        emissionor: '0x37257B32b515Cb37193794a26b3C55113bF761E8',
        chain: FANTOM_TESTNET,
        startBlockNumber: '11416835',
    },
    // #6
    {
        address: '0xea08E048643Bf498741774348Ae7aFb16B9DbA40',
        stake: FANTOM_sHEC_TESTNET,
        reward: FANTOM_HEC_TESTNET,
        treasury: '0x22E46d32D2eA98947Cd36587dFA495FADa2DB2F2',
        lockAddressRegistry: '0x2D86a40Ff217493cCE3a23627F6A749dAe1f9018',
        fnft: '0x7b88137d10394537F1EEa6cEd3ec4f778EEfAAc3',
        tokenVault: '0x4b7dC9E2Cc8B97Fe6073d03667Aed96c071c532B',
        rewardWeight: '0x4b9677BEBd3Ff9fE2a02AAC6E4eD5026916BE22E',
        splitter: '0x44E867C51146932ac10728E86107bF488F38fA1e',
        emissionor: '0x37257B32b515Cb37193794a26b3C55113bF761E8',
        chain: FANTOM_TESTNET,
        startBlockNumber: '11416836',
    },
    // #7
    {
        address: '0x9391abd498Ecb2Be226e446a76a8b9C61932856C',
        stake: FANTOM_wsHEC_TESTNET,
        reward: FANTOM_HEC_TESTNET,
        treasury: '0x22E46d32D2eA98947Cd36587dFA495FADa2DB2F2',
        lockAddressRegistry: '0x2D86a40Ff217493cCE3a23627F6A749dAe1f9018',
        fnft: '0x7b88137d10394537F1EEa6cEd3ec4f778EEfAAc3',
        tokenVault: '0x4b7dC9E2Cc8B97Fe6073d03667Aed96c071c532B',
        rewardWeight: '0x4b9677BEBd3Ff9fE2a02AAC6E4eD5026916BE22E',
        splitter: '0x44E867C51146932ac10728E86107bF488F38fA1e',
        emissionor: '0x37257B32b515Cb37193794a26b3C55113bF761E8',
        chain: FANTOM_TESTNET,
        startBlockNumber: '11416838',
    },
    // #8
    {
        address: '0x0112F57a5EF77b7D074D7213127Df8E907D017bE',
        stake: FANTOM_HEC_USDC_TESTNET,
        reward: FANTOM_HEC_TESTNET,
        treasury: '0x22E46d32D2eA98947Cd36587dFA495FADa2DB2F2',
        lockAddressRegistry: '0x2D86a40Ff217493cCE3a23627F6A749dAe1f9018',
        fnft: '0x7b88137d10394537F1EEa6cEd3ec4f778EEfAAc3',
        tokenVault: '0x4b7dC9E2Cc8B97Fe6073d03667Aed96c071c532B',
        rewardWeight: '0x4b9677BEBd3Ff9fE2a02AAC6E4eD5026916BE22E',
        splitter: '0x44E867C51146932ac10728E86107bF488F38fA1e',
        emissionor: '0x37257B32b515Cb37193794a26b3C55113bF761E8',
        tokensForLp: [FANTOM_USDC_TESTNET, FANTOM_HEC_TESTNET],
        chain: FANTOM_TESTNET,
        startBlockNumber: '11416840',
    },
    // #9
    {
        address: '0xE2497e4866F060b6238fE192477D5aFBf1DEaDC4',
        stake: FANTOM_HEC_TOR_TESTNET,
        reward: FANTOM_HEC_TESTNET,
        treasury: '0xd7DF9A1eeb48dC13E8BA048FEFb0800eF0b01Ee0',
        lockAddressRegistry: '0x759E95baFE5b3aBb58Ffe33C5639915081488f02',
        fnft: '0xD6A7268030bB5bB8D87F5de33B905AeD4eAf4A84',
        tokenVault: '0x6B7e60E078F7CD7E392935C284fC0f3B7c1E9C84',
        rewardWeight: '0x6d6EFB10F3a95690adEd6264A09329Ed7b53c961',
        splitter: '0xeeA425d33365F5389cbc9C8Aadf703c985A6a814',
        emissionor: '0xb42a8a0572B9724f37b25AD01092981814566293',
        tokensForLp: [FANTOM_TOR_TESTNET, FANTOM_HEC_TESTNET],
        chain: FANTOM_TESTNET,
        startBlockNumber: '11781732',
    },
];

export const VOTING_MAINNET: Voting = {
    address: FANTOM_ADDRESS_MAINNET.Voting,
    hec: FANTOM_HEC,
    lockFarm: LOCK_FARM_LIST_MAINNET ? LOCK_FARM_LIST_MAINNET[0].address : '',
    fnft: FANTOM_FNFT_MAINNET,
    emissionor: LOCK_FARM_LIST_MAINNET ? LOCK_FARM_LIST_MAINNET[0].emissionor : '',
};

export const VOTING_TESTNET: Voting = {
    address: FANTOM_ADDRESS_TESTNET.Voting,
    hec: FANTOM_HEC_TESTNET,
    lockFarm: LOCK_FARM_LIST_TESTNET ? LOCK_FARM_LIST_TESTNET[0].address : '',
    fnft: FANTOM_FNFT_TESTNET,
    emissionor: LOCK_FARM_LIST_TESTNET ? LOCK_FARM_LIST_TESTNET[0].emissionor : '',
};

export const StakeFuncHex = '0xf556991011e831bcfac4f406d547e5e32cdd98267efab83935230d5f8d02c446';
export const WithdrawFuncHex = '0xf279e6a1f5e320cca91135676d9cb6e44ca8a08c0b88342bcdb1144f6511b568';
export const EventStartBlock = '48927150';

export const BONDING_FARM_FUNC = {
    BondCreated: '0x67221f172ed04253c483e853d6d653c9e0c49ecf2c1fb4d1434f98f480f25f38',
    BondRedeemed: '0xe305dcd5197faa39ababe23510783dbec4f835cfdcc3b347e68bae90f022a3a1',
    BondCreatedV3: '0x230c2d79af6a7bbca6251014dab582b0746a969e12ae8195a3ffafdf65b6ee92',
};

// Subgraphs
export const MULTIPAY_SUBGRAPH = [
    { id: 0xa86a, url: '' }, // Avalanche
    { id: 0x38, url: '' }, // Binance
    { id: 0x61, url: '' }, // Binance Testnet
    { id: 0x1, url: '' }, // Ethereum
    { id: 0xfa, url: 'https://api.thegraph.com/subgraphs/name/hector-network-devs/multipay-fantom' }, // Fantom
    { id: 0xfa2, url: 'https://api.thegraph.com/subgraphs/name/bejaxer/hectormultipaytest' }, // Fantom Testnet
    { id: 0x505, url: '' }, // Moonriver
    { id: 0x89, url: '' }, // Polygon
];

export const SUBSCRIPTION_SUBGRAPH = [
    { id: 0xa86a, url: '' }, // Avalanche
    { id: 0x38, url: '' }, // Binance
    { id: 0x61, url: '' }, // Binance Testnet
    { id: 0x1, url: '' }, // Ethereum
    { id: 0xfa, url: 'https://api.thegraph.com/subgraphs/name/hector-network-devs/hectorsubscription-fantom' }, // Fantom
    { id: 0xfa2, url: 'https://api.thegraph.com/subgraphs/name/bejaxer/hector-subscription-ftmtestnet' }, // Fantom Testnet
    { id: 0x505, url: '' }, // Moonriver
    { id: 0x89, url: '' }, // Polygon
];

export const HECTOR_SUBSCRIPTION = [
    { id: 0xa86a, address: '' }, // Avalanche
    { id: 0x38, address: '' }, // Binance
    { id: 0x61, address: '' }, // Binance Testnet
    { id: 0x1, address: '' }, // Ethereum
    { id: 0xfa, address: '0x919aC88be0ED4789c01b5Eca964958161A6cbAEA' }, // Fantom
    { id: 0xfa2, address: '0x4a9455C09fDe45B461574F8aD9dF0DaeB04cfC71' }, // Fantom Testnet
    { id: 0x505, address: '' }, // Moonriver
    { id: 0x89, address: '' }, // Polygon
];

export const MultiPayFactory = [
    { id: 0xa86a, address: '' }, // Avalanche
    { id: 0x38, address: '' }, // Binance
    { id: 0x61, address: '' }, // Binance Testnet
    { id: 0x1, address: '' }, // Ethereum
    { id: 0xfa, address: '0xC63FFe3b18dFC40015b7B191753A3366BA6727f3' }, // Fantom
    { id: 0xfa2, address: '0x881c5652F41f8aFA0b274939170aa02523097234' }, // Fantom Testnet
    { id: 0x505, address: '' }, // Moonriver
    { id: 0x89, address: '' }, // Polygon
];

export const NOVU_APIKEY = 'cb0bda1ab5c17a72846c3ea184aaa30a';
export const NOVU_EMAIL_APIKEY = '297e35da1ee78a61aec704d794e566ff';
export const TAXREPORT_TRIGGER_ID = 'taxreport-done';
export const NOUV_NOTIFICATOIN_TRIGGER = 'notification';
export const NOVU_SUBSCRIPTION_MULTIPAY_EMAIL_TRIGGER = 'hector-network-multipay-subcription';
export const NOVU_SUBSCRIPTION_TAXREPORT_EMAIL_TRIGGER = 'hector-network-taxreport-subcription';
export const NOVU_MULTIPAY_EMAIL_TRIGGER = 'hector-network-multipay-stream';

export const CoinGeckoApiKeys = [
    { token: FANTOM_USDC, apikey: 'usd-coin' },
    { token: FANTOM_USDC_TESTNET, apikey: 'usd-coin' },
    { token: FANTOM_HEC, apikey: 'hector-dao' },
    { token: FANTOM_HEC_TESTNET, apikey: 'hector-dao' },
    { token: FANTOM_TOR, apikey: 'tor' },
    { token: FANTOM_TOR_TESTNET, apikey: 'tor' },
    { token: FANTOM_DAI, apikey: 'dai' },
    { token: FANTOM_DAI_TESTNET, apikey: 'dai' },
    { token: FANTOM_USDT, apikey: 'tether' },
    { token: FANTOM_USDT_TESTNET, apikey: 'tether' },
];

export const COINGECKO_API_KEY = 'CG-SfQhb5vwYvnSWjMPZ26CCvJk';
export const MULTIPLIER_BASE = 1e6;

export const FTM_API_KEY = 'BQFYFSYXW4AB2IMY77R5B3M6QX5T872S9W';
export const ETH_API_KEY = '5573EP51U35FDS837XT1AMD5I7QWQJ2PZ5';
export const BSC_API_KEY = 'JD7JRCY5EQ21XA8U4QJJQC24JWP1EYQUHH';
export const AVALANCHE_API_KEY = 'Z7ICD5QD8WJ3MGAF7PA7WBKV2YUBHU67M3';
export const POLYGON_API_KEY = 'RJ4HM4GHATH2KJMFV4ZE68BR7SXZVG4C38';
export const ARBITRUM_API_KEY = 'FKSA864A98FI4NXWAPIUEBGXAH1J17U8WH';
export const OPTIMISM_API_KEY = 'Z74JH57JK8UU642IG4DWYGYN7EKS259DIX';
export const MOONRIVER_API_KEY = '2K8IPVF1B1YNM4E5GEG5WHZ3SUNZRAYNI3';

export const ADSPACES_ALLOWED_ORIGINS = [
    'http://localhost:3000/',
    'https://dapp-qa.hector.network/',
    'https://devtest1.hector.network/',
    'https://devtest2.hector.network/',
    'https://testnet1.hector.network/',
    'https://testnet2.hector.network/',
    'https://beta.hector.network/',
    'https://app.hector.network/',
];

export const ADSPACES_SIGNER_WALLET_KEY = '8bb483adf59126ec699186b8b8419ef2b3f2dbabc5d90da0c99a7e4cac0fb140';

export enum HECTOR_MENU {
    HECTOR_MULTIPAY = "hector multi pay",
    HECTOR_TAXREPORT = "hector tax report",
}