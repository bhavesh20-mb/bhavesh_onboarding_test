import * as Chain from 'src/utils/chain';

import { Request, Response } from 'express';
import { AvalancheTokenList } from 'src/tokens/avalanche';
import { BSCTokenList } from 'src/tokens/binance';
import { ETHTokenList } from 'src/tokens/ethereum';
import { FTMTokenList } from 'src/tokens/fantom';
import { MoonriverTokenList } from 'src/tokens/moonriver';
import { PolygonTokenList } from 'src/tokens/polygon';
import { Erc20Contract } from 'src/utils/contracts/erc20Contract';

export type Erc20TokenDetail = {
    name: string;
    logo: string;
    symbol: string;
    address: string;
    isNative?: boolean;
    decimals: number;
};

const lookupByChain: Map<string, LookupTable> = new Map([
    [Chain.AVALANCHE.id.toString(), generateLookupTable(AvalancheTokenList)],
    [Chain.BINANCE.id.toString(), generateLookupTable(BSCTokenList)],
    [Chain.ETHEREUM.id.toString(), generateLookupTable(ETHTokenList)],
    [Chain.FANTOM_MAINNET.id.toString(), generateLookupTable(FTMTokenList)],
    [Chain.MOONRIVER.id.toString(), generateLookupTable(MoonriverTokenList)],
    [Chain.POLYGON.id.toString(), generateLookupTable(PolygonTokenList)],
]);

type LookupTable = {
    names: string[];
    symbols: string[];
    addresses: string[];
    tokens: Erc20TokenDetail[];
};

function generateLookupTable(tokens: Erc20TokenDetail[]): LookupTable {
    return {
        names: tokens.map(({ name }) => name.toLowerCase()),
        symbols: tokens.map(({ symbol }) => symbol.toLowerCase()),
        addresses: tokens.map((token) => token.address),
        tokens,
    };
}

function queryLookup(table: LookupTable, query: string, max: number): Erc20TokenDetail[] {
    let results: Erc20TokenDetail[] = [];

    query = query.toLowerCase();

    const tokenListLength = table.tokens.length;

    for (let i = 0; i < tokenListLength; i++) {
        if (table.addresses[i]!.toLowerCase() === query) {
            results.push(table.tokens[i]!);
        }
        if (results.length >= max) {
            break;
        }
    }

    return results;
}

type TokenDetailsType = Record<string, Erc20TokenDetail>;

export default async function getTokenDetailsHandler(
    req: Request<{}, {}, { chainId: number; addresses: string[] }>,
    res: Response,
) {
    const { chainId, addresses } = req.body;

    const lookupTable = lookupByChain.get(chainId.toString());

    const result: TokenDetailsType = {};

    for (let address of addresses) {
        if (lookupTable) {
            const r = queryLookup(lookupTable, address, 1);

            if (r.length) {
                result[address] = r[0]!;

                continue;
            }
        }

        const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

        if (address !== NULL_ADDRESS) {
            try {
                const symbol = await new Erc20Contract(chainId, address).symbol();
                const decimals = await new Erc20Contract(chainId, address).decimals();

                result[address] = {
                    address: address,
                    name: symbol,
                    symbol: symbol,
                    decimals: decimals,
                    logo: '',
                    isNative: false,
                };
            } catch (e) {
                console.log(e);
            }
        } else {
            result[address] = {
                address: address,
                name: 'Native Token',
                symbol: 'NATIVE TOKEN',
                decimals: 18,
                logo: '',
                isNative: true,
            };
        }
    }

    return res.json(result);
}
