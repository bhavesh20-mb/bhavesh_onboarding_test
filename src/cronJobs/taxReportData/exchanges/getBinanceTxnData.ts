import Binance from 'node-binance-api';

export async function getBinanceTxnData({
    address, // wallet address
    apiKey,
    secretKey,
}: {
    address: string;
    apiKey: string;
    secretKey: string;
}) {
    const binance = new Binance().options({
        APIKEY: apiKey,
        APISECRET: secretKey,
    });

    const depositData = await binance.depositHistory();
    const withdrawData = await binance.withdrawHistory();
    const tradeData = await binance.historicalTrades();

    return;
}
