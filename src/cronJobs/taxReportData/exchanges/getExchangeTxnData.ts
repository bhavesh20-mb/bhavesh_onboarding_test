import ccxt = require('ccxt');
import { Trade } from 'src/domains/taxreport/types/exchange';

export async function getGeminiTxnData() {
    const gemini = new ccxt.gemini({ apiKey: 'your-api-key', secret: 'your-api-secret' });
    const respGemini: Trade[] = await gemini.fetchMyTrades();
}

export async function getCoinbaseTxnData() {
    const coinbase = new ccxt.coinbase();
    const respCoinbase: Trade[] = await coinbase.fetchMyTrades();
}

export async function getKrakenTxnData() {
    const kraken = new ccxt.kraken();
    const respKraken: Trade[] = await kraken.fetchMyTrades();
}

export async function getHuobiTxnData() {
    const huobi = new ccxt.huobi();
    const respHuobi: Trade[] = await huobi.fetchMyTrades();
}
