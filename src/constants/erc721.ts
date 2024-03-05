import { TokenAddress } from 'src/utils/providerEip1193';

export interface Erc721Token {
    address: TokenAddress;
    chain: number;
}
