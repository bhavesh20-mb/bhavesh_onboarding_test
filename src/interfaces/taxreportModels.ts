import { BooleanExpression } from 'mongoose';
import { AccountStatus } from './dbModels';

export interface ITaxReporterModel {
    email: string;
    address: string;
    wallet_address: string;
    wallet_name: string;
    user_type: number;
    wallet_type: string;
    chain_ids?: string[];
    api_key?: string;
    security_key?: string;
    passphrase?: string;
    timestamp: number;
}

export interface IRawTxModel {
    hash: string;
    nonce: string;
    transaction_index: string;
    from_address: string;
    to_address: string;
    value: string;
    gas: string;
    gas_price: string;
    input: string;
    receipt_cumulative_gas_used: string;
    receipt_gas_used: string;
    receipt_contract_address: string | null;
    receipt_root: string | null;
    receipt_status: string;
    block_timestamp: string;
    block_number: string;
    block_hash: string;
}

export interface ITxModel extends IRawTxModel {
    chain_id: string;
    timestamp: number;
}

export interface IDecodedTxModel {
    address: string;
    from: string;
    to: string;
    txdate: string;
    timestamp: number;
    txtype: string;
    token_address: string;
    token_name: string;
    token_price: string;
    symbol: string;
    amount: string;
    receive_token_address?: string;
    receive_token_name?: string;
    receive_token_price?: string;
    receive_symbol?: string;
    receive_amount?: string;
    feeAmount: string;
    feePrice: string;
    chain_id: string;
    chain_name: string;
    block_number: string;
    txhash: string;
    token_logo: string;
    receive_token_logo?: string;
}

export interface ILatestBlockModel {
    chainId: string;
    blocknumber: number;
}

export interface IGainModel {
    tokenAddress: string;
    chainId: string;
    walletAddress: string;
    tokenSymbol: string;
    tokenAmount: string;
    soldTokenAmount: string;
    lastTokenPrice: string;
    tokenCost: string;
    realGain: string;
    unrealGain?: string;
}
export interface ITaxReportReqModel {
    userId: Object;
    start: number;
    end: number;
    chainIds: string[];
    walletAddress: string;
    createdOn: number;
    status: string;
    completedBy: number;
    address: string;
    enableEmail: boolean;
    enablePush: boolean;
}

export interface ITaxReportResModel extends ITaxReportReqModel {
    txns: IDecodedTxModel[];
    _id: string;
}

export interface ITaxUserModel {
    walletAddress: string;
    name?: string;
    email?: string;
    nonce: string;
    verified: boolean;
    isRegister?: boolean;
    status?: AccountStatus;
}

export interface ITaxBucketNumberModel {
    address: string;
    wallet_address: string;
    chain_id: string;
    bucket_number: number;
}

export interface ITaxExchangeDecodeModel {
    platform: string; // binance, kucoin, bybit etc
    txType: string; // deposit, withdraw
    currency: string;
    address: string;
    createdAt: number;
    updatedAt?: number;
    amount: number;
    fee: number;
    chainId: number;
    chainName: string;
    txhash: string;
    tokenLogo: string;
    isInner: boolean;
    status: string;
    remark: string;
    memo?: string;
    arrears?: boolean; // non-payment
}

export interface ITaxExchangeTradeDecodeModel {
    platform: string; // binance, kucoin, bybit etc
    txType: string; // transaction direction,include buy and sell
    symbol: string; // symbol
    tradeId: string; // trade id
    orderId: string; // order id
    counterOrderId: string; // counter order id
    liquidity: string; // include taker and maker
    forceTaker: Boolean; // forced to become taker
    price: number; // order price
    size: number; // order quantity
    funds: number; // order funds
    fee: number; // fee
    feeRate: number; // fee rate
    feeCurrency: string; // charge fee currency
    stop: string; // stop type
    type: string; // order type,e.g. limit,market,stop_limit.
    createdAt: number; // time
    tradeType: string; // "TRADE"
}

export interface ITaxCoinModel {
    id: string;
    symbol: string;
    name: string;
    logo: string;
}
export interface ITaxAssetModel {
    chainId: string;
    contractDecimals: number;
    contractName: string;
    contractTickerSymbol: string;
    logoUrl: string;
    balance: string;
    quoteRate: number;
    quote: number;
    tokenAddress: string;
    costBasis: string;
    costAmount: string;
    costBasisPrice: string;
    realGain: string;
    unrealGain: string;
}

export interface ICovalentAssetModel {
    contract_decimals: number;
    contract_name: string;
    contract_ticker_symbol: string;
    contract_address: string;
    supports_erc: string[];
    logo_url: string;
    last_transferred_at: string;
    native_token: boolean;
    type: string;
    balance: string;
    balance_24h: string;
    quote_rate: number;
    quote_rate_24h: number;
    quote: number;
    quote_24h: number;
    nft_data: string | null;
}

export interface ITaxWalletModel {
    _id: string;
    email: string;
    address: string;
    walletAddress: string;
    walletName: string;
    walletType: string;
    walletKind: number;
    timestamp: number;
    txnAmount: number;
    chainIds?: string[];
    apiKey?: string;
    securityKey?: string;
    txnSentCnt: number;
    txnReceiveCnt: number;
    realGain: string;
    unrealGain: string;
    txnGainData: IGainModel[];
}

export interface IDashboardGainDataModel {
    period: string;
    gainAmount: string;
    portfolioAmount: string;
}

export interface ITaxBybitHistoryModel {
    symbol: string;
    id: string;
    orderId: string;
    tradeId: string;
    orderPrice: string;
    orderQty: string;
    execFee: string;
    feeTokenId: string;
    creatTime: string;
    isBuyer: string;
    isMaker: string;
    matchOrderId: string;
    makerRebate: string;
    executionTime: string;
    blockTradeId: string;
}
