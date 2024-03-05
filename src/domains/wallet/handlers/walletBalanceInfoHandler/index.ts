import { Request, Response } from 'express';
import { EvmChain } from '@moralisweb3/common-evm-utils';
import { FANTOM } from 'src/utils/chain';
import Moralis from 'moralis';
import { WalletBalanceInfo } from 'src/interfaces/apiDataModels';
import { AvalancheTokenList } from 'src/tokens/avalanche';
import { BSCTokenList } from 'src/tokens/binance';
import { ETHTokenList } from 'src/tokens/ethereum';
import { FTMTokenList } from 'src/tokens/fantom';
import { MoonriverTokenList } from 'src/tokens/moonriver';
import { PolygonTokenList } from 'src/tokens/polygon';

export default async function (req: Request<{}, {}, {}, { address: string; chainId: string }>, res: Response) {
    const chainList = [
        EvmChain.ARBITRUM,
        EvmChain.AVALANCHE,
        EvmChain.BSC,
        EvmChain.CRONOS,
        EvmChain.ETHEREUM,
        EvmChain.FANTOM,
        EvmChain.POLYGON,
        EvmChain.PALM,
        EvmChain.BSC_TESTNET,
    ];

    const tokenList = [
        ...AvalancheTokenList,
        ...BSCTokenList,
        ...ETHTokenList,
        ...FTMTokenList,
        ...MoonriverTokenList,
        ...PolygonTokenList,
    ];

    let walletInfo: WalletBalanceInfo[] = [];

    try {
        const params = req.query;
        if (params.address && params.chainId) {
            const currentChain = chainList.find((item) => item.hex === `0x${parseInt(params.chainId).toString(16)}`);
            if (currentChain) {
                const responseErc20 = (
                    await Moralis.EvmApi.token.getWalletTokenBalances({
                        address: params.address?.toString(),
                        chain: currentChain,
                    })
                ).toJSON();

                if (responseErc20 && responseErc20.length > 0) {
                    responseErc20.map((item) => {
                        const currentToken = tokenList.find(
                            (token) => token.address.toLowerCase() === item.token_address.toLowerCase(),
                        );
                        walletInfo.push({
                            name: item.name,
                            symbol: item.symbol,
                            logoUrl: currentToken ? currentToken.logo : null,
                            address: item.token_address,
                            chain: parseInt(currentChain.hex, 16),
                            decimals: item.decimals,
                            balance: item.balance,
                        });
                    });
                }

                const responseNative = (
                    await Moralis.EvmApi.balance.getNativeBalance({
                        address: params.address?.toString(),
                        chain: currentChain,
                    })
                ).toJSON();

                if (responseNative && responseNative.balance) {
                    let nativeTokenSymbol = '';
                    if (currentChain.hex === '0x1') {
                        nativeTokenSymbol = 'ETH';
                    } else if (currentChain.hex === '0xfa') {
                        nativeTokenSymbol = 'FTM';
                    } else if (currentChain.hex === EvmChain.AVALANCHE.hex) {
                        nativeTokenSymbol = 'AVAX';
                    } else if (currentChain.hex === EvmChain.BSC.hex) {
                        nativeTokenSymbol = 'BNB';
                    } else if (currentChain.hex === EvmChain.POLYGON.hex) {
                        nativeTokenSymbol = 'MATIC';
                    } else if (currentChain.hex === EvmChain.BSC_TESTNET.hex) {
                        nativeTokenSymbol = 'TBNB';
                    }

                    const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

                    const currentToken = tokenList.find(
                        (token) => token.address === NULL_ADDRESS && token.symbol === nativeTokenSymbol,
                    );

                    walletInfo.push({
                        name: nativeTokenSymbol,
                        symbol: nativeTokenSymbol,
                        logoUrl: currentToken?.logo || '',
                        address: NULL_ADDRESS,
                        chain: parseInt(currentChain.hex, 16),
                        decimals: 18,
                        balance: responseNative.balance,
                    });
                }

                return res.json({
                    data: walletInfo,
                });
            } else {
                return res.json({
                    data: [],
                });
            }
        } else {
            return res.json({
                data: [],
            });
        }
    } catch (e) {
        return res.status(500).json({
            message: 'Something went wrong...',
            error: e,
        });
    }
}
