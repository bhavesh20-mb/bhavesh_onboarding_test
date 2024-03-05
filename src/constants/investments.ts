export const THE_GRAPH_URL = 'https://api.thegraph.com/subgraphs/name/hectordao-hec/hector-dao';
export const ETH_GRAPH_URL = 'https://api.thegraph.com/subgraphs/name/hectordao-hec/hector-eth';

export const THE_GRAPH_DATA_QUERY = `
query {
  protocolMetrics(first: 1000, orderBy: timestamp, orderDirection: desc) {
    id
    timestamp
    hecCirculatingSupply
    sHecCirculatingSupply
    totalSupply
    hecPrice
    marketCap
    totalValueLocked
    treasuryRiskFreeValue
    treasuryMarketValue
    nextEpochRebase
    nextDistributedHec
    treasuryDaiMarketValue
    treasuryDaiLPMarketValue
    treasuryDaiRiskFreeValue
    treasuryUsdcMarketValue
    treasuryUsdcLPMarketValue
    treasuryUsdcRiskFreeValue
    treasuryMIMMarketValue
    treasuryMIMRiskFreeValue
    treasuryWFTMMarketValue
    treasuryWFTMRiskFreeValue
    treasuryFRAXRiskFreeValue
    treasuryFRAXMarketValue
    treasuryInvestments
    treasuryBOOMarketValue
    treasuryBOORiskFreeValue
    treasuryCRVRiskFreeValue
    treasuryCRVMarketValue
    treasuryWETHRiskFreeValue
    treasuryWETHMarketValue
    currentAPY
    runwayCurrent
    treasuryHecDaiPOL
    bankBorrowed
    bankSupplied
    treasuryFantomValidatorValue
    treasuryFantomDelegatorValue
    treasuryTORLPValue
    treasuryDaiTokenAmount,
    treasuryUsdcTokenAmount,
    treasuryWFTMTokenAmount,
    treasuryFRAXTokenAmount,
    treasuryBOOTokenAmount,
    treasuryCRVTokenAmount,
    treasuryWETHTokenAmount,
    hecDaiTokenAmount,
  }
  tors(first: 1000, orderBy: timestamp, orderDirection: desc) {
    id
    timestamp
    torTVL
    supply
  }
}
`;

export const ETH_QUERY = `query {
    ethMetrics(first: 1, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
      treasuryBaseRewardPool
      treasuryIlluviumBalance
      treasuryEthMarketValue
      treasuryMaticBalance
      maticTokenAmount
      illuviumTokenAmount
    }
  }`;

export const CACHE_KEY_INVESTMENTS_GRAPH_STATS = 'investments/graph-stats';
export const CACHE_KEY_INVESTMENTS_GENERAL_STATS = 'investments/general-stats';
export const CACHE_KEY_INVESTMENTS_BUY_BACK = 'investments/buy-back';
export const CACHE_KEY_INVESTMENTS_INVESTMENTS = 'investments/investments';
export const CACHE_KEY_INVESTMENTS_PROTOCOLS = 'investments/protocols';
export const CACHE_KEY_INVESTMENTS_FNFTS = 'investments/fnfts';

export const ftmscanApiKey = '9WPBVWMFKMM96K3X56M65KB67HH1J5GBQT';
export const bybitApiKey = 'r69fMvdMqp8xNvRt7q';
export const bybitSecretKey = 'NTmEHxHV4g0PhpK7QVTRIUQ236MNbS3GN01O';
export const gateioApiKey = 'eb86608f85c6514511681675db2ab301';
export const gateioSecretKey = '83354cbaa1cb352566ef1cbf412cd670d55f3b958fc7dc5768fc2a6e5d0ddec8';
export const huobiApiKey = '278fc61d-bewr5drtmh-fb9a49b1-859d8';
export const huobiSecretKey = '27c8d574-8aa96748-ae00f2d4-d5ed8';
export const moralisApiKey = '9mZ4GZWP5sf0pOcmsNHJcYaYiaUXuEWmwzLwzTrmcibrcr41Vso2Bdt1imeDIkIA';

export type HuobiAccountBalance = {
    spotBalanceState: number;
    distributionType: string;
    balance: number;
    accountBalanceUsdt: string;
    success: boolean;
    accountBalance: string;
};

export const INVESTMENT_CONTRACT = '0xc9e3903D048BFc8E2dADE52c104271dED5303E0c';
