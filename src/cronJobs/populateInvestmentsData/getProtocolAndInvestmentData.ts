import { ChainData, CoinGeckoInfo, CoinInfo, ManualCoinInfo } from 'src/interfaces/apiDataModels';
import Decimal from 'decimal.js';
import ProtocolModel from 'src/database/models/protocol.model';
import { IProtocolModel } from 'src/interfaces/dbModels';
import {
    ACCESS_KEY,
    FTM_VALIDATOR_1,
    FTM_VALIDATOR_2,
    TREASURY_WALLET,
    WALLET_1,
    WALLET_10,
    WALLET_11,
    WALLET_12,
    WALLET_13,
    WALLET_14,
    WALLET_15,
    WALLET_16,
    WALLET_2,
    WALLET_3,
    WALLET_4,
    WALLET_5,
    WALLET_6,
    WALLET_7,
    WALLET_8,
    WALLET_9,
    FWallet_1,
    FWallet_2,
} from 'src/constants/protocols';
import fetch from 'node-fetch';
import StatModel from 'src/database/models/stat.model';
import InvestmentModel from 'src/database/models/investment.model';
import {
    gateioApiKey,
    gateioSecretKey,
    HuobiAccountBalance,
    huobiApiKey,
    huobiSecretKey,
    bybitApiKey,
    bybitSecretKey,
    COINGECKO_API_KEY,
} from 'src/constants';
import { HbApi } from 'huobi-api-js';
import { RestClientV5 } from 'bybit-api';

const Web3 = require('web3');

export default async function () {
    let data: ChainData[] = [];
    let manualCoins: ManualCoinInfo[] = [];
    let gateioCoins: ManualCoinInfo[] = [];
    let bybitCoins: ManualCoinInfo[] = [];
    let huobiBalance: number = 0;

    try {
        manualCoins = await getManualCoinInfo();
    } catch (e) {
        console.error(e);
    }

    try {
        bybitCoins = await getBybitCoinInfo();
    } catch (e) {
        console.error(e);
    }

    try {
        gateioCoins = await getGateioCoinInfo();
    } catch (e) {
        console.error(e);
    }

    try {
        const response = await getChainTotals();
        data = [
            ...response,
            ...getFormattedCoins(manualCoins),
            ...getFormattedCoins(bybitCoins),
            ...getFormattedCoins(gateioCoins),
        ];
    } catch (e) {
        console.error(e);
    }

    try {
        const huobiData: any = await getHuobiBalance();
        const huobiAccountBalance = huobiData.profitAccountBalanceList.filter(
            (item: HuobiAccountBalance) => item.spotBalanceState === 1,
        );
        if (huobiAccountBalance.length > 0) {
            huobiAccountBalance.map((item: HuobiAccountBalance) => {
                huobiBalance += parseFloat(item.accountBalanceUsdt);
            });
        }
    } catch (e) {
        console.error(e);
    }

    if (data && manualCoins && bybitCoins) {
        const fWallet1Amount = await getStakingAmount(FWallet_1);
        const fWallet2Amount = await getStakingAmount(FWallet_2);
        const { protocols, walletAssets, treasuryVal } = getTreasuryInfo(data, fWallet1Amount, fWallet2Amount);

        let treasuryAmount = treasuryVal + huobiBalance;

        const generalStats = await StatModel.findOne();

        if (!!generalStats) {
            await generalStats.updateOne({ $set: { treasury: treasuryAmount } });
        } else {
            await StatModel.create({
                treasury: treasuryVal,
            });
        }
        await ProtocolModel.deleteMany({});
        await ProtocolModel.insertMany(protocols);
        await InvestmentModel.deleteMany({});
        await InvestmentModel.insertMany(walletAssets);
    }
}

// Locked values
async function getManualCoinInfo(): Promise<ManualCoinInfo[]> {
    const getLQDRInfo: CoinGeckoInfo = await fetch(
        'https://pro-api.coingecko.com/api/v3/coins/liquiddriver?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false&x_cg_pro_api_key=${COINGECKO_API_KEY}',
    ).then((res: any) => res.json());
    return Promise.all([{ data: getLQDRInfo, amount: 42650.1696, symbol: 'LQDR' }]);
}

async function getBybitCoinInfo(): Promise<ManualCoinInfo[]> {
    const bybitClient = new RestClientV5({
        key: bybitApiKey,
        secret: bybitSecretKey,
        testnet: false,
    });
    const assetData = await bybitClient.getWalletBalance({ accountType: 'SPOT' });
    const bybitAssetList = assetData.result.list[0].coin;
    type CoinGekcoCoinType = {
        id: string;
        symbol: string;
        name: string;
    };
    const coingeckoCoinList: CoinGekcoCoinType[] = await fetch('https://api.coingecko.com/api/v3/coins/list').then(
        (res: any) => res.json(),
    );

    const coinInfoList: Promise<ManualCoinInfo>[] = bybitAssetList.map(async (asset) => {
        const coinApiId = coingeckoCoinList.find(
            (item: CoinGekcoCoinType) => item.symbol.toLowerCase() === asset.coin.toLowerCase(),
        );
        const getCoinInfo: CoinGeckoInfo = await fetch(
            `https://pro-api.coingecko.com/api/v3/coins/${coinApiId?.id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false&x_cg_pro_api_key=${COINGECKO_API_KEY}`,
        ).then((res: any) => res.json());
        return {
            data: getCoinInfo,
            amount: parseFloat(asset.walletBalance),
            symbol: asset.coin,
        };
    });

    return Promise.all(coinInfoList);
}

async function getChainTotals(): Promise<ChainData[]> {
    const wallet1TokenAmounts = await fetch(
        `https://pro-openapi.debank.com/v1/user/token_list?id=${WALLET_1}&chain_id=eth&is_all=false&has_balance=true`,
        {
            headers: {
                'Content-Type': 'application/json',
                AccessKey: ACCESS_KEY,
            },
        },
    ).then((res: any) => res.json());
    const wallet1ProtocolList = await fetch(
        `https://pro-openapi.debank.com/v1/user/complex_protocol_list?id=${WALLET_1}&chain_id=eth&`,
        {
            headers: {
                'Content-Type': 'application/json',
                AccessKey: ACCESS_KEY,
            },
        },
    ).then((res: any) => res.json());
    const TreasuryTokenAmounts = await fetch(
        `https://pro-openapi.debank.com/v1/user/token_list?id=${TREASURY_WALLET}&chain_id=ftm&is_all=false&has_balance=true`,
        {
            headers: {
                'Content-Type': 'application/json',
                AccessKey: ACCESS_KEY,
            },
        },
    ).then((res: any) => res.json());
    const TreasuryProtocolList = await fetch(
        `https://pro-openapi.debank.com/v1/user/complex_protocol_list?id=${TREASURY_WALLET}&chain_id=ftm`,
        {
            headers: {
                'Content-Type': 'application/json',
                AccessKey: ACCESS_KEY,
            },
        },
    ).then((res: any) => res.json());
    const wallet2TokenAmounts = await fetch(
        `https://pro-openapi.debank.com/v1/user/token_list?id=${WALLET_2}&chain_id=ftm&is_all=false&has_balance=true`,
        {
            headers: {
                'Content-Type': 'application/json',
                AccessKey: ACCESS_KEY,
            },
        },
    ).then((res: any) => res.json());
    const wallet2ProtocolList = await fetch(
        `https://pro-openapi.debank.com/v1/user/complex_protocol_list?id=${WALLET_2}&chain_id=ftm`,
        {
            headers: {
                'Content-Type': 'application/json',
                AccessKey: ACCESS_KEY,
            },
        },
    ).then((res: any) => res.json());
    const wallet3TokenAmounts = await fetch(
        `https://pro-openapi.debank.com/v1/user/token_list?id=${WALLET_3}&chain_id=bsc&is_all=false&has_balance=true`,
        {
            headers: {
                'Content-Type': 'application/json',
                AccessKey: ACCESS_KEY,
            },
        },
    ).then((res: any) => res.json());
    const wallet3ProtocolList = await fetch(
        `https://pro-openapi.debank.com/v1/user/complex_protocol_list?id=${WALLET_3}&chain_id=bsc`,
        {
            headers: {
                'Content-Type': 'application/json',
                AccessKey: ACCESS_KEY,
            },
        },
    ).then((res: any) => res.json());
    const wallet4TokenAmounts = await fetch(
        `https://pro-openapi.debank.com/v1/user/token_list?id=${WALLET_4}&chain_id=ftm&is_all=false&has_balance=true`,
        {
            headers: {
                'Content-Type': 'application/json',
                AccessKey: ACCESS_KEY,
            },
        },
    ).then((res: any) => res.json());
    const wallet4EthTokenAmounts = await fetch(
        `https://pro-openapi.debank.com/v1/user/token_list?id=${WALLET_4}&chain_id=eth&is_all=false&has_balance=true`,
        {
            headers: {
                'Content-Type': 'application/json',
                AccessKey: ACCESS_KEY,
            },
        },
    ).then((res: any) => res.json());
    const wallet4BscTokenAmounts = await fetch(
        `https://pro-openapi.debank.com/v1/user/token_list?id=${WALLET_4}&chain_id=bsc&is_all=false&has_balance=true`,
        {
            headers: {
                'Content-Type': 'application/json',
                AccessKey: ACCESS_KEY,
            },
        },
    ).then((res: any) => res.json());
    const wallet4KccTokenAmounts = await fetch(
        `https://pro-openapi.debank.com/v1/user/token_list?id=${WALLET_4}&chain_id=kcc&is_all=false&has_balance=true`,
        {
            headers: {
                'Content-Type': 'application/json',
                AccessKey: ACCESS_KEY,
            },
        },
    ).then((res: any) => res.json());
    const wallet4ProtocolList = await fetch(
        `https://pro-openapi.debank.com/v1/user/complex_protocol_list?id=${WALLET_4}&chain_id=ftm`,
        {
            headers: {
                'Content-Type': 'application/json',
                AccessKey: ACCESS_KEY,
            },
        },
    ).then((res: any) => res.json());
    const wallet5TokenAmounts = await fetch(
        `https://pro-openapi.debank.com/v1/user/token_list?id=${WALLET_5}&chain_id=avax&is_all=false&has_balance=true`,
        {
            headers: {
                'Content-Type': 'application/json',
                AccessKey: ACCESS_KEY,
            },
        },
    ).then((res: any) => res.json());
    const wallet5ProtocolList = await fetch(
        `https://pro-openapi.debank.com/v1/user/complex_protocol_list?id=${WALLET_5}&chain_id=avax`,
        {
            headers: {
                'Content-Type': 'application/json',
                AccessKey: ACCESS_KEY,
            },
        },
    ).then((res: any) => res.json());
    const wallet6TokenAmounts = await fetch(
        `https://pro-openapi.debank.com/v1/user/token_list?id=${WALLET_6}&chain_id=avax&is_all=false&has_balance=true`,
        {
            headers: {
                'Content-Type': 'application/json',
                AccessKey: ACCESS_KEY,
            },
        },
    ).then((res: any) => res.json());
    const wallet7TokenAmounts = await fetch(
        `https://pro-openapi.debank.com/v1/user/token_list?id=${WALLET_7}&chain_id=avax&is_all=false&has_balance=true`,
        {
            headers: {
                'Content-Type': 'application/json',
                AccessKey: ACCESS_KEY,
            },
        },
    ).then((res: any) => res.json());
    const wallet8TokenAmounts = await fetch(
        `https://pro-openapi.debank.com/v1/user/token_list?id=${WALLET_8}&chain_id=avax&is_all=false&has_balance=true`,
        {
            headers: {
                'Content-Type': 'application/json',
                AccessKey: ACCESS_KEY,
            },
        },
    ).then((res: any) => res.json());
    const wallet9TokenAmounts = await fetch(
        `https://pro-openapi.debank.com/v1/user/token_list?id=${WALLET_9}&chain_id=avax&is_all=false&has_balance=true`,
        {
            headers: {
                'Content-Type': 'application/json',
                AccessKey: ACCESS_KEY,
            },
        },
    ).then((res: any) => res.json());
    const wallet10TokenAmounts = await fetch(
        `https://pro-openapi.debank.com/v1/user/token_list?id=${WALLET_10}&chain_id=avax&is_all=false&has_balance=true`,
        {
            headers: {
                'Content-Type': 'application/json',
                AccessKey: ACCESS_KEY,
            },
        },
    ).then((res: any) => res.json());
    const wallet11TokenAmounts = await fetch(
        `https://pro-openapi.debank.com/v1/user/token_list?id=${WALLET_11}&chain_id=avax&is_all=false&has_balance=true`,
        {
            headers: {
                'Content-Type': 'application/json',
                AccessKey: ACCESS_KEY,
            },
        },
    ).then((res: any) => res.json());
    const wallet12TokenAmounts = await fetch(
        `https://pro-openapi.debank.com/v1/user/token_list?id=${WALLET_12}&chain_id=avax&is_all=false&has_balance=true`,
        {
            headers: {
                'Content-Type': 'application/json',
                AccessKey: ACCESS_KEY,
            },
        },
    ).then((res: any) => res.json());
    const wallet13TokenAmounts = await fetch(
        `https://pro-openapi.debank.com/v1/user/token_list?id=${WALLET_13}&chain_id=avax&is_all=false&has_balance=true`,
        {
            headers: {
                'Content-Type': 'application/json',
                AccessKey: ACCESS_KEY,
            },
        },
    ).then((res: any) => res.json());
    const wallet14TokenAmounts = await fetch(
        `https://pro-openapi.debank.com/v1/user/token_list?id=${WALLET_14}&chain_id=avax&is_all=false&has_balance=true`,
        {
            headers: {
                'Content-Type': 'application/json',
                AccessKey: ACCESS_KEY,
            },
        },
    ).then((res: any) => res.json());
    const wallet15TokenAmounts = await fetch(
        `https://pro-openapi.debank.com/v1/user/token_list?id=${WALLET_15}&chain_id=avax&is_all=false&has_balance=true`,
        {
            headers: {
                'Content-Type': 'application/json',
                AccessKey: ACCESS_KEY,
            },
        },
    ).then((res: any) => res.json());
    const wallet16TokenAmounts = await fetch(
        `https://pro-openapi.debank.com/v1/user/token_list?id=${WALLET_16}&chain_id=avax&is_all=false&has_balance=true`,
        {
            headers: {
                'Content-Type': 'application/json',
                AccessKey: ACCESS_KEY,
            },
        },
    ).then((res: any) => res.json());
    const ftmValidator1 = await fetch(
        `https://pro-openapi.debank.com/v1/user/complex_protocol_list?id=${FTM_VALIDATOR_1}&chain_id=ftm`,
        {
            headers: {
                'Content-Type': 'application/json',
                AccessKey: ACCESS_KEY,
            },
        },
    ).then((res: any) => res.json());
    const ftmValidator2 = await fetch(
        `https://pro-openapi.debank.com/v1/user/complex_protocol_list?id=${FTM_VALIDATOR_2}&chain_id=ftm`,
        {
            headers: {
                'Content-Type': 'application/json',
                AccessKey: ACCESS_KEY,
            },
        },
    ).then((res: any) => res.json());
    return await Promise.all([
        {
            wallet: TreasuryTokenAmounts,
            protocols: TreasuryProtocolList,
            source: TREASURY_WALLET,
            chain: 'ftm',
        },
        {
            wallet: wallet1TokenAmounts,
            protocols: wallet1ProtocolList,
            source: WALLET_1,
            chain: 'eth',
        },
        {
            wallet: wallet2TokenAmounts,
            protocols: wallet2ProtocolList,
            source: WALLET_2,
            chain: 'ftm',
        },
        {
            wallet: wallet3TokenAmounts,
            protocols: wallet3ProtocolList,
            source: WALLET_3,
            chain: 'bsc',
        },
        {
            wallet: wallet4TokenAmounts,
            protocols: wallet4ProtocolList,
            source: WALLET_4,
            chain: 'ftm',
        },
        {
            wallet: wallet4EthTokenAmounts,
            protocols: [],
            source: WALLET_4,
            chain: 'eth',
        },
        {
            wallet: wallet4BscTokenAmounts,
            protocols: [],
            source: WALLET_4,
            chain: 'bsc',
        },
        {
            wallet: wallet4KccTokenAmounts,
            protocols: [],
            source: WALLET_4,
            chain: 'kcc',
        },
        {
            wallet: wallet5TokenAmounts,
            protocols: wallet5ProtocolList,
            source: WALLET_5,
            chain: 'avax',
        },
        {
            wallet: wallet6TokenAmounts,
            protocols: [],
            source: WALLET_6,
            chain: 'bsc',
        },
        {
            wallet: wallet7TokenAmounts,
            protocols: [],
            source: WALLET_7,
            chain: 'bsc',
        },
        {
            wallet: wallet8TokenAmounts,
            protocols: [],
            source: WALLET_8,
            chain: 'bsc',
        },
        {
            wallet: wallet9TokenAmounts,
            protocols: [],
            source: WALLET_9,
            chain: 'bsc',
        },
        {
            wallet: wallet10TokenAmounts,
            protocols: [],
            source: WALLET_10,
            chain: 'bsc',
        },
        {
            wallet: wallet11TokenAmounts,
            protocols: [],
            source: WALLET_11,
            chain: 'bsc',
        },
        {
            wallet: wallet12TokenAmounts,
            protocols: [],
            source: WALLET_12,
            chain: 'bsc',
        },
        {
            wallet: wallet13TokenAmounts,
            protocols: [],
            source: WALLET_13,
            chain: 'bsc',
        },
        {
            wallet: wallet14TokenAmounts,
            protocols: [],
            source: WALLET_14,
            chain: 'bsc',
        },
        {
            wallet: wallet15TokenAmounts,
            protocols: [],
            source: WALLET_15,
            chain: 'bsc',
        },
        {
            wallet: wallet16TokenAmounts,
            protocols: [],
            source: WALLET_16,
            chain: 'bsc',
        },
        { protocols: ftmValidator1, source: FTM_VALIDATOR_1, chain: 'ftm' },
        { protocols: ftmValidator2, source: FTM_VALIDATOR_2, chain: 'ftm' },
    ]);
}
function getFormattedCoins(manualCoins: ManualCoinInfo[]): ChainData[] {
    return manualCoins.map(
        (coin) =>
            ({
                protocols: [],
                source: '',
                chain: '',
                wallet: [
                    {
                        id: coin.data.id,
                        chain: 'ftm',
                        name: coin.data.name,
                        symbol: coin.symbol,
                        display_symbol: coin.symbol,
                        optimized_symbol: coin.symbol,
                        decimals: 0,
                        logo_url: coin.data.image?.small,
                        protocol_id: coin.data.id,
                        price: coin.data.market_data?.current_price.usd,
                        amount: coin.amount,
                        raw_amount: coin.amount,
                    },
                ],
            } as ChainData),
    );
}

// Gate.io
async function getGateioCoinInfo(): Promise<ManualCoinInfo[]> {
    const GateApi = require('gate-api');
    const client = new GateApi.ApiClient();
    client.setApiKeySecret(gateioApiKey, gateioSecretKey);

    const spotApi = new GateApi.SpotApi(client);
    const gateioAssetList = (await spotApi.listSpotAccounts()).body;

    type CoinGekcoCoinType = {
        id: string;
        symbol: string;
        name: string;
    };
    const coingeckoCoinList: CoinGekcoCoinType[] = await fetch('https://api.coingecko.com/api/v3/coins/list').then(
        (res: any) => res.json(),
    );

    const coinInfoList: Promise<ManualCoinInfo>[] = gateioAssetList.map(async (asset: any) => {
        const coinApiId = coingeckoCoinList.find(
            (item: CoinGekcoCoinType) => item.symbol.toLowerCase() === asset.currency.toLowerCase(),
        );
        const getCoinInfo: CoinGeckoInfo = await fetch(
            `https://pro-api.coingecko.com/api/v3/coins/${coinApiId?.id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false&x_cg_pro_api_key=${COINGECKO_API_KEY}`,
        ).then((res: any) => res.json());
        return {
            data: getCoinInfo,
            amount: parseFloat(asset.available),
            symbol: asset.currency,
        };
    });

    return Promise.all(coinInfoList);
}

// Huobi
const huobiOptions = {
    apiBaseUrl: 'https://api.huobipro.com',
    profileConfig: {
        accessKey: huobiApiKey,
        secretKey: huobiSecretKey,
    },
};

async function getHuobiBalance() {
    const hbApi = new HbApi(huobiOptions);
    const valuation = await hbApi.restApi({
        path: `/v2/account/valuation`,
        method: `GET`,
    });
    return valuation;
}

function getTreasuryInfo(
    data: ChainData[],
    fWallet1Amount: number,
    fWallet2Amount: number,
): {
    treasuryVal: number;
    walletAssets: CoinInfo[];
    protocols: IProtocolModel[];
} {
    let treasuryVal = 0;
    let walletAssets: CoinInfo[] = [];
    let protocols: IProtocolModel[] = [];
    data.forEach((deBank) => {
        if (deBank.wallet && deBank.wallet.length > 0) {
            const coins: CoinInfo[] = deBank.wallet
                .filter((asset) => !isNaN(asset.amount) && !isNaN(asset.price) && asset.amount > 0)
                .map((asset) => {
                    const coinAmount = asset.amount * asset.price;
                    const tokenAmount = new Decimal(asset.raw_amount).div(10 ** asset.decimals);
                    treasuryVal += coinAmount;
                    const existingCoinIndex = walletAssets.findIndex(
                        (coin) => asset.optimized_symbol?.toLocaleLowerCase() === coin.symbol.toLocaleLowerCase(),
                    );
                    if (existingCoinIndex >= 0) {
                        walletAssets[existingCoinIndex]!.amount += coinAmount;
                        walletAssets[existingCoinIndex]!.tokenAmount =
                            walletAssets[existingCoinIndex]!.tokenAmount.plus(tokenAmount);
                        return {} as CoinInfo;
                    }
                    return {
                        amount: coinAmount,
                        tokenAmount,
                        decimal: asset.decimals,
                        name: asset.name,
                        ticker: asset.symbol,
                        symbol: asset.optimized_symbol,
                        logo: asset.logo_url,
                        chain: asset.chain,
                    };
                });
            walletAssets.push(...coins.filter((coin) => coin.amount));
        }
        if (deBank.protocols && deBank.protocols.length > 0) {
            protocols.push(
                ...deBank.protocols.map((protocol) => {
                    // if (protocol.id === "ftm_beefy") {
                    //   const tempData = protocol.portfolio_item_list.find(
                    //     (item) => item.pool_id === "temp",
                    //   );
                    //   if (!tempData) {
                    //     protocol.portfolio_item_list.push({
                    //       detail: { supply_token_list: [] },
                    //       detail_types: [""],
                    //       name: "yield",
                    //       pool_id: "temp",
                    //       proxy_detail: {},
                    //       stats: {
                    //         asset_usd_value: 18240000,
                    //         debt_usd_value: 0,
                    //         net_usd_value: 18240000,
                    //       },
                    //       update_at: 0,
                    //     });
                    //   }
                    // }
                    return {
                        ...protocol,
                        source: deBank.source,
                    };
                }),
            );
            deBank.protocols.forEach((protocol) => {
                const totalVal = protocol.portfolio_item_list.reduce(
                    (partialSum, a) =>
                        a.stats.asset_usd_value > 1 ? partialSum + a.stats.asset_usd_value : partialSum,
                    0,
                );
                treasuryVal += totalVal;
            });
        }
    });

    const fWalletData = protocols.find((item) => item.id === 'ftm_pwawallet');

    if (fWalletData) {
        const tokenPrice = fWalletData.portfolio_item_list![0].detail.supply_token_list![0].price;
        protocols.push(getFWalletStakingData(FWallet_1, fWallet1Amount, tokenPrice, fWalletData));
        protocols.push(getFWalletStakingData(FWallet_2, fWallet2Amount, tokenPrice, fWalletData));
        treasuryVal += (fWallet1Amount + fWallet2Amount) * tokenPrice;
    }

    return { treasuryVal, walletAssets, protocols };
}

function getFWalletStakingData(
    address: string,
    amount: number,
    tokenPrice: number,
    baseData: IProtocolModel,
): IProtocolModel {
    return {
        id: baseData.id,
        chain: baseData.chain,
        name: baseData.name,
        site_url: baseData.site_url,
        logo_url: baseData.logo_url,
        has_supported_portfolio: true,
        tvl: 0,
        portfolio_item_list: [
            {
                stats: {
                    asset_usd_value: amount * tokenPrice,
                    debt_usd_value: 0,
                    net_usd_value: amount * tokenPrice,
                },
                update_at: baseData.portfolio_item_list[0].update_at,
                name: baseData.portfolio_item_list[0].name,
                detail_types: baseData.portfolio_item_list[0].detail_types,
                detail: {
                    supply_token_list: [
                        {
                            ...baseData.portfolio_item_list![0].detail.supply_token_list![0],
                            amount: amount,
                        },
                    ],
                    reward_token_list: [],
                },
                proxy_detail: {},
                pool_id: '97',
            },
        ],
        source: address,
    };
}

async function getStakingAmount(fWalletAddress: string) {
    try {
        const rpcUrl = 'https://rpcapi.fantom.network';

        const web3 = new Web3(rpcUrl);
        const balance = await web3.eth.getBalance(fWalletAddress);

        const graphUrl = 'https://xapi-noden.fantom.network/';
        const payloadData = {
            operationName: 'DelegationsByAddress',
            variables: {
                address: fWalletAddress,
                count: 25,
                cursor: null,
            },
            query: 'query DelegationsByAddress($address: Address!, $cursor: Cursor, $count: Int!) {\n  delegationsByAddress(address: $address, cursor: $cursor, count: $count) {\n    pageInfo {\n      first\n      last\n      hasNext\n      hasPrevious\n      __typename\n    }\n    totalCount\n    edges {\n      cursor\n      delegation {\n        toStakerId\n        createdTime\n        amount\n        isDelegationLocked\n        lockedFromEpoch\n        lockedUntil\n        pendingRewards {\n          amount\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n',
        };
        const stakingBalance = await fetch(graphUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payloadData),
        }).then((response) => {
            return response.json();
        });

        const stakingAmount = stakingBalance.data.delegationsByAddress.edges[0].delegation.amount;
        const stakingPendingAmount = stakingBalance.data.delegationsByAddress.edges[0].delegation.pendingRewards.amount;

        const totalBalance =
            parseFloat(web3.utils.fromWei(balance)) +
            parseFloat(web3.utils.fromWei(stakingAmount)) +
            parseFloat(web3.utils.fromWei(stakingPendingAmount));

        return totalBalance;
    } catch (e) {
        return 0;
    }
}
