import Decimal from 'decimal.js';
import { IProtocolModel } from './dbModels';

export interface SubgraphData {
    protocolMetrics: ProtocolMetrics[];
    tors: Tors[];
}

export interface Tors {
    id: string;
    timestamp: string;
    torTVL: string;
    supply: string;
}

export interface SubgraphEthData {
    id: string;
    timestamp: string;
    treasuryBaseRewardPool: string;
    treasuryIlluviumBalance: string;
    treasuryEthMarketValue: string;
    treasuryMaticBalance: string;
    illuviumTokenAmount: string;
}

export interface ProtocolMetrics {
    id: string;
    timestamp: string;
    month: string;
    hecCirculatingSupply: string;
    sHecCirculatingSupply: string;
    totalSupply: string;
    hecPrice: string;
    marketCap: string;
    totalValueLocked: string;
    treasuryRiskFreeValue: string;
    treasuryMarketValue: string;
    nextEpochRebase: string;
    nextDistributedHec: string;
    treasuryDaiMarketValue: string;
    treasuryDaiLPMarketValue: string;
    treasuryDaiRiskFreeValue: string;
    treasuryUsdcMarketValue: string;
    treasuryUsdcLPMarketValue: string;
    treasuryUsdcRiskFreeValue: string;
    treasuryMIMMarketValue: string;
    treasuryMIMRiskFreeValue: string;
    treasuryWFTMMarketValue: string;
    treasuryWFTMRiskFreeValue: string;
    treasuryFRAXRiskFreeValue: string;
    treasuryFRAXMarketValue: string;
    treasuryInvestments: string;
    treasuryBOOMarketValue: string;
    treasuryBOORiskFreeValue: string;
    treasuryCRVRiskFreeValue: string;
    treasuryCRVMarketValue: string;
    treasuryWETHRiskFreeValue: string;
    treasuryWETHMarketValue: string;
    currentAPY: string;
    runwayCurrent: string;
    treasuryHecDaiPOL: string;
    bankBorrowed: string;
    bankSupplied: string;
    bankTotal: string;
    treasuryFantomValidatorValue: string;
    treasuryFantomDelegatorValue: string;
    treasuryTORLPValue: string;
    treasuryBaseRewardPool?: string;
    treasuryIlluviumBalance?: string;
    treasuryEthMarketValue?: string;
    treasuryMaticBalance?: string;
    treasuryRFMaticBalance?: string;
    treasuryRFIlluviumBalance?: string;
    torTVL: string;
    staked: string;
    illuviumTokenAmount: string;
}

export interface PortfolioItemList {
    stats: Stats;
    update_at: number;
    name: string;
    detail_types: string[];
    detail: Detail;
    proxy_detail: ProxyDetail;
    pool_id: string;
}

interface Stats {
    asset_usd_value: number;
    debt_usd_value: number;
    net_usd_value: number;
}

interface Detail {
    supply_token_list?: SupplyTokenList[];
    reward_token_list?: RewardTokenList[];
    borrow_token_list?: BorrowTokenList[];
}

interface SupplyTokenList {
    id: string;
    chain: string;
    name: string;
    symbol: string;
    display_symbol?: any;
    optimized_symbol: string;
    decimals: number;
    logo_url: string;
    protocol_id: string;
    price: number;
    is_verified: boolean;
    is_core: boolean;
    is_wallet: boolean;
    time_at: number;
    amount: number;
}

export interface RewardTokenList {
    id: string;
    chain: string;
    name: string;
    symbol: string;
    display_symbol?: any;
    optimized_symbol: string;
    decimals: number;
    logo_url: string;
    protocol_id: string;
    price: number;
    is_verified: boolean;
    is_core: boolean;
    is_wallet: boolean;
    time_at?: any;
    amount: number;
}

export interface BorrowTokenList {
    id: string;
    chain: string;
    name: string;
    symbol: string;
    display_symbol?: any;
    optimized_symbol: string;
    decimals: number;
    logo_url: string;
    protocol_id: string;
    price: number;
    is_verified: boolean;
    is_core: boolean;
    is_wallet: boolean;
    time_at: number;
    amount: number;
}
export interface FTMScanTransaction {
    blockHash: string;
    blockNumber: string;
    confirmations: string;
    contractAddress: string;
    cumulativeGasUsed: string;
    from: string;
    gas: string;
    gasPrice: string;
    gasUsed: string;
    hash: string;
    input: string;
    nonce: string;
    timeStamp: string;
    to: string;
    tokenDecimal: string;
    tokenName: string;
    tokenSymbol: string;
    transactionIndex: string;
    value: string;
}

export interface Transaction {
    type: 'Buyback-Burn' | 'Investment' | 'Marketing';
    title: string;
    investments: Investment;
    blockNumber: string;
}

export interface Investment {
    tokenDetails: TokenDetail[];
    transactionLinks: string[];
    transactionDate: string;
    investedAmount: string;
}
export interface TokenDetail {
    token: string;
    ticker: string;
    logo: string;
    buyBack: string;
    price: string;
    burn: string;
}

interface ProxyDetail {}

// Protocols
interface Platforms {
    vechain: string;
}

interface Image {
    thumb: string;
    small: string;
    large: string;
}

interface CurrentPrice {
    usd: number;
}

interface MarketData {
    current_price: CurrentPrice;
    total_supply: number;
    max_supply: number;
    circulating_supply: number;
    last_updated: Date;
}

export interface CoinGeckoInfo {
    id: string;
    symbol: string;
    name: string;
    asset_platform_id: string;
    platforms: Platforms;
    image?: Image;
    market_cap_rank: number;
    coingecko_rank: number;
    market_data?: MarketData;
    last_updated: Date;
}

export interface ManualCoinInfo {
    data: CoinGeckoInfo;
    amount: number;
    symbol: string;
}

export interface ChainData {
    wallet?: DebankWallet[];
    protocols: IProtocolModel[];
    source: string;
    chain: string;
}
export interface DebankWallet {
    id: string;
    chain: string;
    name: string;
    symbol: string;
    display_symbol?: any;
    optimized_symbol: string;
    decimals: number;
    logo_url: string;
    protocol_id: string;
    price: number;
    is_verified?: boolean;
    is_core?: boolean;
    is_wallet?: boolean;
    time_at?: number;
    amount: number;
    raw_amount: number;
    raw_amount_hex_str?: string;
}

export interface DeBankData {
    treasuryVal: number;
    walletAssets: CoinInfo[];
    protocols: IProtocolModel[];
}
export interface CoinInfo {
    name: string;
    ticker: string;
    amount: number;
    tokenAmount: Decimal;
    decimal: number;
    logo: string;
    chain: string;
    symbol: string;
}

export interface Contract {
    address: string;
    chainId: number;
}

export interface EventHistory {
    address: string;
    topics: string[];
    data: string;
    blockNumber: string;
    blockHash: string;
    timeStamp: string;
    gasPrice: string;
    gasUsed: string;
    logIndex: string;
    transactionHash: string;
    transactionIndex: string;
}

export interface CoinGeckoCoinListInfo {
    id: string;
    symbol: string;
    name: string;
}

export interface CoinGeckoCoinUsdPriceInfo {
    usd: number;
}
export interface CoinGeckoCoinsUsdPriceInfo {
    [tokenId: string]: CoinGeckoCoinUsdPriceInfo;
}

export interface WalletBalanceInfo {
    name: string;
    symbol: string;
    logoUrl: string | null;
    address: string;
    chain: number;
    decimals: number;
    balance: string;
}
