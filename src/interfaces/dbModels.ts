import { PortfolioItemList, ProtocolMetrics, Investment, Contract } from './apiDataModels';

export enum AccountStatus {
    Active = 0,
    TempDisable = 1,
    PermDisable = 2,
}

export interface IStatModel {
    marketCap: number;
    hecPrice: number;
    hecBurned: number;
    circulatingSupply: number;
    totalSupply: number;
    treasury: number;
    currentIndex: number;
}

export interface IFnftModel {
    id: number;
    amount: number;
    secs: number;
    startTime: number;
    multiplier: number;
    rewardDebt: number;
    pendingReward: number;
    fnftAddress: string;
    farmAddress: string;
    blockNumber: string;
}

export interface IVotingFnftModel {
    id: number;
    fnftAddress: string;
    endTime: number;
    voter: string;
    contract: string;
}

export interface IGraphStatModel {
    totalValueLocked: string; // sHEC
    bankTotal: string; // Institute
    torTVL: string; // TOR Curve LP

    hecCirculatingSupply: string; // HEC

    staked: string; // HEC Staked

    runwayCurrent: string; // Days

    treasuryHecDaiPOL: string; // SLP Treasury

    timestamp: string;

    fullData: ProtocolMetrics; // data which comes from 3rd party api
}

export interface IInvestmentModel {
    name: string;
    ticker: string;
    amount: number;
    tokenAmount: number;
    decimal: number;
    logo: string;
    chain: string;
    symbol: string;
}

export interface IProtocolModel {
    id: string;
    chain: string;
    name: string;
    site_url: string;
    logo_url: string;
    has_supported_portfolio: boolean;
    tvl: number;
    portfolio_item_list: PortfolioItemList[];
    source: string;
}

export interface IBuybackModel {
    type: 'Buyback-Burn' | 'Investment' | 'Marketing';
    title: string;
    investments: Investment;
    blockNumber?: string;
    timeStamp: Date;
}

export interface IContractModel {
    contract: Contract;
    type: 'Bonding' | 'LockFarm';
    status: 'active' | 'inactive';
    dateAdded: Date;
}

export interface IBondingDepositModel {
    depositId: number;
    principal: string;
    deposit: number;
    payout: number;
    expires: number;
    priceInUSD: number;
    stake: boolean;
    timeStamp: number;
    farmAddress: string;
    blockNumber: string;
}

export interface ILockFarmModel {
    address: string;
    farmName: string;
    farmTVL: number;
    baseAPR: number;
    boostAPR: number;
}

export interface IBondingFarmInfoModel extends IContractModel {
    name: string;
    autoStaking: boolean;
}

export interface IPriceModel {
    chainName: string;
    tokenAddress: string;
    price: number;
    priceUnit: string;
    blockNumber: number;
    timestamp: number;
}
export interface IAccountModel {
    walletAddress: string;
    name?: string;
    email?: string;
    status?: AccountStatus;
    nonce: string;
}

export enum enmUserStatus {
    Unverified = 0,
    Active = 10,
    TempDisabled = 101,
    PermDisabled = 102,
}

export interface IUserModel {
    walletAddress: string;
    name?: string;
    email?: string;
    status: enmUserStatus;
    nonce: string;
}

export interface IAddressBookModel{
    createdById: Number;
    walletAddress: string;
    name: string;
    email: string;
    description: string;
    classificationIds:Array<Number>;
}

export interface IAddressGroupModel{
    userWalletAddress: string;
    label: string;
    description: string;
    color:string;
    createdById: Number;
}