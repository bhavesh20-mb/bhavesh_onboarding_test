import getDataFromTheGraph from './getDataFromTheGraph';
import mcache from 'memory-cache';
import {
    CACHE_KEY_INVESTMENTS_BUY_BACK,
    CACHE_KEY_INVESTMENTS_GENERAL_STATS,
    CACHE_KEY_INVESTMENTS_GRAPH_STATS,
    CACHE_KEY_INVESTMENTS_INVESTMENTS,
    CACHE_KEY_INVESTMENTS_PROTOCOLS,
    CACHE_KEY_INVESTMENTS_FNFTS,
} from 'src/constants';
import getGeneralStats from './getGeneralStats';
import getBuyBackData from './getBuyBackData';
import getProtocolAndInvestmentData from './getProtocolAndInvestmentData';

const removeCacheAfterCertainTime = (cacheKey: string, secs = 60) => {
    setTimeout(() => {
        mcache.del(cacheKey);
    }, secs * 1_000);
};

export default async function () {
    try {
        await getDataFromTheGraph();
        removeCacheAfterCertainTime(CACHE_KEY_INVESTMENTS_GRAPH_STATS); // VERY VERY IMPORTANT to delete cache after updating db
    } catch {}
    try {
        await getGeneralStats();
        removeCacheAfterCertainTime(CACHE_KEY_INVESTMENTS_GENERAL_STATS);
    } catch {}
    try {
        await getBuyBackData();
        removeCacheAfterCertainTime(CACHE_KEY_INVESTMENTS_BUY_BACK);
    } catch {}
    try {
        await getProtocolAndInvestmentData();
        removeCacheAfterCertainTime(CACHE_KEY_INVESTMENTS_PROTOCOLS);
        removeCacheAfterCertainTime(CACHE_KEY_INVESTMENTS_INVESTMENTS);
    } catch {}
}
