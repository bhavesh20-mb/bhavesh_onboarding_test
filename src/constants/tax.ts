const abiDecoder = require('abi-decoder');
export const COVALENT_API_KEY = 'ckey_c4b967827969499ea20f75b4c95';

export interface TokenModel {
    chainId?: number;
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    isNative?: boolean;
    logo: string;
}

export interface IDecodedParams {
    name: string;
    type: string;
    indexed: boolean;
    decoded: boolean;
    value: string;
}
export interface IDecoded {
    name: string;
    signature: string;
    params: IDecodedParams[] | null;
}

export interface ILogEvent {
    block_signed_at: string;
    block_height: number;
    tx_offset: number;
    log_offset: number;
    tx_hash: string;
    raw_log_topics: string[];
    sender_contract_decimals: number;
    sender_name: string | null;
    sender_contract_ticker_symbol: string | null;
    sender_address: string;
    sender_address_label: string | null;
    sender_logo_url: string;
    raw_log_data: string | null;
    decoded: IDecoded | null;
}

export interface ITxnModel {
    block_signed_at: string;
    block_height: number;
    tx_hash: string;
    tx_offset: number;
    successful: boolean;
    from_address: string;
    from_address_label: string | null;
    to_address: string;
    to_address_label: string | null;
    value: string;
    value_quote: number;
    gas_offered: number;
    gas_spent: number;
    gas_price: number;
    fees_paid: string;
    gas_quote: number;
    gas_quote_rate: number;
    log_events: ILogEvent[];
}

export interface ITxnConvertModel extends ITxnModel {
    category: string;
    flow: string;
}

export const MethodIdsFTM = {
    stake: '0x7b0472f0',
    stake1: '0x7acb7757',
    withdrawfnft: '0x2e1a7d4d',
    deposit: '0xce88b439',
    transfer: '0xa9059cbb',
    swap: '0x7c025200',
    brigde: '',
};

export const MethodIdsETH = {
    swap: '0x5f575529',
    transfer: '0xa9059cbb',
    stake: '0xa694fc3a',
    stake1: '0xadc9772e',
    bridge: '',
    withdraw: '0x2e1a7d4d',
};

export const MethodIdsAVA = {
    swap: '',
    transfer: '0xa9059cbb',
    stake: '',
    bridge: '',
    withdraw: '',
};

export const MethodIdsPolygon = {
    swap: '0x5f575529',
    simpleSwap: '0x54e3f31b',
    transfer: '0xa9059cbb',
    stake: '0xa694fc3a',
    bridge: '',
    withdraw: '0x6bb509f2',
};

export const MethodIdsArbitrum = {
    swap: '0x7c025200',
    transfer: '0xa9059cbb',
    stake: '0xbf6eac2f',
    bridge: '',
    withdraw: '0xd9caed12',
};

export const MethodIdsBSC = {
    swap: '0x5f575529',
    transfer: '0xa9059cbb',
    stake: '0xa694fc3a',
    bridge: '',
    withdraw: '0x2e1a7d4d',
};

// FTM
export function getFTMStake1MethodDecode(inputData: string) {
    // stake(uint256 _amount, address _recipient)
    const ABI = [
        {
            inputs: [
                {
                    name: '_amount',
                    type: 'uint256',
                },
                {
                    name: '_recipient',
                    type: 'address',
                },
            ],
            name: 'stake',
            output: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ];
    abiDecoder.addABI(ABI);
    const decodedData = abiDecoder.decodeMethod(inputData);
    const result = decodedData?.params;
    return result ? result : [];
}

export function getFTMStakeMethodDecode(inputData: string) {
    // stake(uint256 amount,uint256 secs)
    const ABI = [
        {
            inputs: [
                {
                    name: 'amount',
                    type: 'uint256',
                },
                {
                    name: 'secs',
                    type: 'uint256',
                },
            ],
            name: 'stake',
            output: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ];
    abiDecoder.addABI(ABI);
    const decodedData = abiDecoder.decodeMethod(inputData);
    const result = decodedData?.params;
    return result ? result : [];
}

export function getFTMWithdrawFNFTMethodDecode(inputData: string) {
    const ABI = [
        {
            inputs: [
                {
                    name: 'fnftId',
                    type: 'uint256',
                },
            ],
            name: 'withdraw',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ];
    abiDecoder.addABI(ABI);
    const decodedData = abiDecoder.decodeMethod(inputData);

    const result = decodedData?.params;

    return result ? result : [];
}

export function getFTMSwapMethodDecode(inputData: string) {
    // swap(address caller,tuple desc,bytes data)
    // (address,address,address,address,uint256,uint256,uint256,bytes)
    const ABI = [
        {
            inputs: [
                {
                    name: 'caller',
                    type: 'address',
                },
                {
                    name: 'desc',
                    type: 'tuple',
                    components: [
                        {
                            name: 'srcToken',
                            type: 'address',
                        },
                        {
                            name: 'dstToken',
                            type: 'address',
                        },
                        {
                            name: 'srcReceiver',
                            type: 'address',
                        },
                        {
                            name: 'dstReceiver',
                            type: 'address',
                        },
                        {
                            name: 'amount',
                            type: 'uint256',
                        },
                        {
                            name: 'minReturnAmount',
                            type: 'uint256',
                        },
                        {
                            name: 'flags',
                            type: 'uint256',
                        },
                        {
                            name: 'permit',
                            type: 'bytes',
                        },
                    ],
                },
                {
                    name: 'data',
                    type: 'bytes',
                },
            ],
            name: 'swap',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ];
    abiDecoder.addABI(ABI);
    const decodedData = abiDecoder.decodeMethod(inputData);
    const result = decodedData?.params;
    return result ? result : [];
}

export function getFTMTransferMethodDecode(inputData: string) {
    // transfer(address recipient, uint256 amount)
    const ABI = [
        {
            inputs: [
                {
                    name: 'recipient',
                    type: 'address',
                },
                {
                    name: 'amount',
                    type: 'uint256',
                },
            ],
            name: 'transfer',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ];
    abiDecoder.addABI(ABI);
    const decodedData = abiDecoder.decodeMethod(inputData);
    const result = decodedData?.params;
    return result ? result : [];
}

// ETH
export function getETHTransferMethodDecode(inputData: string) {
    // transfer(address _to, uint256 _value)
    const ABI = [
        {
            inputs: [
                {
                    name: '_to',
                    type: 'address',
                },
                {
                    name: '_value',
                    type: 'uint256',
                },
            ],
            name: 'transfer',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ];

    abiDecoder.addABI(ABI);
    const decodedData = abiDecoder.decodeMethod(inputData);
    const result = decodedData?.params;
    return result ? result : [];
}

export function getETHSwapMethodDecode(inputData: string) {
    const ABI = [
        {
            inputs: [
                {
                    name: 'aggregatorId',
                    type: 'string',
                },
                {
                    name: 'tokenFrom',
                    type: 'address',
                },
                {
                    name: 'amount',
                    type: 'uint256',
                },
                {
                    name: 'data',
                    type: 'bytes',
                },
            ],
            name: 'swap',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ];
    abiDecoder.addABI(ABI);
    const decodedData = abiDecoder.decodeMethod(inputData);
    const result = decodedData?.params;
    return result ? result : [];
}

export function getETHWithdrawMethodDecode(inputData: string) {
    // withdraw(uint256 amount)
    const ABI = [
        {
            inputs: [
                {
                    name: 'wad',
                    type: 'uint256',
                },
            ],
            name: 'withdraw',
            output: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ];
    abiDecoder.addABI(ABI);
    const decodedData = abiDecoder.decodeMethod(inputData);
    const result = decodedData?.params;
    return result ? result : [];
}

export function getETHStakeMethodDecode(inputData: string) {
    // stake(uint256 stakedTokenAmount)
    const ABI = [
        {
            inputs: [
                {
                    name: 'stakedTokenAmount',
                    type: 'uint256',
                },
            ],
            name: 'stake',
            output: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ];
    abiDecoder.addABI(ABI);
    const decodedData = abiDecoder.decodeMethod(inputData);
    const result = decodedData?.params;
    return result ? result : [];
}

export function getETHStake1MethodDecode(inputData: string) {
    // stake(address _to,uint256 _amount)
    const ABI = [
        {
            inputs: [
                {
                    name: '_to',
                    type: 'address',
                },
                {
                    name: '_amount',
                    type: 'uint256',
                },
            ],
            name: 'stake',
            output: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ];
    abiDecoder.addABI(ABI);
    const decodedData = abiDecoder.decodeMethod(inputData);
    const result = decodedData?.params;
    return result ? result : [];
}

// Avalanche
export function getAVATransferMethodDecode(inputData: string) {
    return getFTMTransferMethodDecode(inputData);
}

export function getAVASwapMethodDecode(inputData: string) {}

// Polygon
export function getPolygonSwapMethodDecode(inputData: string) {
    return getETHSwapMethodDecode(inputData);
}

export function getPolygonSimpleSwapMethodDecode(inputData: string) {
    // simpleSwap(tuple data)
    // (address,address,uint256,uint256,uint256,address[],bytes,uint256[],uint256[],address,address,uint256,bytes,uint256,bytes16)
    const ABI = [
        {
            inputs: [
                {
                    name: 'data',
                    type: 'tuple',
                    components: [
                        {
                            name: 'fromToken',
                            type: 'address',
                        },
                        {
                            name: 'toToken',
                            type: 'address',
                        },
                        {
                            name: 'fromAmount',
                            type: 'uint256',
                        },
                        {
                            name: 'toAmount',
                            type: 'uint256',
                        },
                        {
                            name: 'expectedAmount',
                            type: 'uint256',
                        },
                        {
                            name: 'callees',
                            type: 'address[]',
                        },
                        {
                            name: 'exchangeData',
                            type: 'bytes',
                        },
                        {
                            name: 'startIndexes',
                            type: 'uint256[]',
                        },
                        {
                            name: 'values',
                            type: 'uint256[]',
                        },
                        {
                            name: 'beneficiary',
                            type: 'address',
                        },
                        {
                            name: 'partner',
                            type: 'address',
                        },
                        {
                            name: 'feePercent',
                            type: 'uint256',
                        },
                        {
                            name: 'permit',
                            type: 'bytes',
                        },
                        {
                            name: 'deadline',
                            type: 'uint256',
                        },
                        {
                            name: 'uuid',
                            type: 'bytes16',
                        },
                    ],
                },
            ],
            name: 'simpleSwap',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ];
    abiDecoder.addABI(ABI);
    const decodedData = abiDecoder.decodeMethod(inputData);
    const result = decodedData?.params;
    return result ? result : [];
}

export function getPolygonTransferMethodDecode(inputData: string) {
    return getFTMTransferMethodDecode(inputData);
}

export function getPolygonWithdrawMethodDecode(inputData: string) {
    // withdraw(tuple withdrawal)
    // (uint8,uint128,address,string,address,uint64,uint64,bool,bytes)
    const ABI = [
        {
            inputs: [
                {
                    name: 'withdrawal',
                    type: 'tuple',
                    components: [
                        {
                            name: 'withdrawalType',
                            type: 'uint8',
                        },
                        {
                            name: 'nonce',
                            type: 'uint128',
                        },
                        {
                            name: 'walletAddress',
                            type: 'address',
                        },
                        {
                            name: 'assetSymbol',
                            type: 'string',
                        },
                        {
                            name: 'assetAddress',
                            type: 'address',
                        },
                        {
                            name: 'grossQuantityInPips',
                            type: 'uint64',
                        },
                        {
                            name: 'gasFeeInPips',
                            type: 'uint64',
                        },
                        {
                            name: 'autoDispatchEnabled',
                            type: 'bool',
                        },
                        {
                            name: 'walletSignature',
                            type: 'bytes',
                        },
                    ],
                },
            ],
            name: 'withdraw',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ];
    abiDecoder.addABI(ABI);
    const decodedData = abiDecoder.decodeMethod(inputData);
    const result = decodedData?.params;
    return result ? result : [];
}

export function getPolygonStakeMethodDecode(inputData: string) {
    // stake(uint256 stakedTokenAmount)
    const ABI = [
        {
            inputs: [
                {
                    name: 'amount',
                    type: 'uint256',
                },
            ],
            name: 'stake',
            output: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ];
    abiDecoder.addABI(ABI);
    const decodedData = abiDecoder.decodeMethod(inputData);
    const result = decodedData?.params;
    return result ? result : [];
}

// Arbitrum
export function getArbitrumTransferMethodDecode(inputData: string) {
    return getFTMTransferMethodDecode(inputData);
}

export function getArbitrumWithdrawMethodDecode(inputData: string) {
    // withdraw(address _token,address _account,uint256 _amount)
    const ABI = [
        {
            inputs: [
                {
                    name: '_token',
                    type: 'address',
                },
                {
                    name: '_account',
                    type: 'address',
                },
                {
                    name: '_amount',
                    type: 'uint256',
                },
            ],
            name: 'withdraw',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ];
    abiDecoder.addABI(ABI);
    const decodedData = abiDecoder.decodeMethod(inputData);
    const result = decodedData?.params;
    return result ? result : [];
}

export function getArbitrumStakeMethodDecode(inputData: string) {
    // stake(address _account,address _token,uint256 _amount)
    const ABI = [
        {
            inputs: [
                {
                    name: '_account',
                    type: 'address',
                },
                {
                    name: '_token',
                    type: 'address',
                },
                {
                    name: '_amount',
                    type: 'uint256',
                },
            ],
            name: 'stake',
            output: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ];
    abiDecoder.addABI(ABI);
    const decodedData = abiDecoder.decodeMethod(inputData);
    const result = decodedData?.params;
    return result ? result : [];
}

export function getArbitrumSwapMethodDecode(inputData: string) {
    // swap(address caller,tuple desc,bytes data)
    // (address,address,address,address,uint256,uint256,uint256,bytes)
    return getFTMSwapMethodDecode(inputData);
}

// BSC
export function getBSCTransferMethodDecode(inputData: string) {
    return getFTMTransferMethodDecode(inputData);
}

export function getBSCSwapMethodDecode(inputData: string) {
    // swap(string aggregatorId, address tokenFrom, uint256 amount, bytes data)
    return getETHSwapMethodDecode(inputData);
}

export function getBSCWithdrawMethodDecode(inputData: string) {
    // withdraw(uint256 amount)
    const ABI = [
        {
            inputs: [
                {
                    name: 'amount',
                    type: 'uint256',
                },
            ],
            name: 'withdraw',
            output: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ];
    abiDecoder.addABI(ABI);
    const decodedData = abiDecoder.decodeMethod(inputData);
    const result = decodedData?.params;
    return result ? result : [];
}

export function getBSCStakeMethodDecode(inputData: string) {
    // stake(uint256 amount)
    const ABI = [
        {
            inputs: [
                {
                    name: 'amount',
                    type: 'uint256',
                },
            ],
            name: 'stake',
            output: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ];
    abiDecoder.addABI(ABI);
    const decodedData = abiDecoder.decodeMethod(inputData);
    const result = decodedData?.params;
    return result ? result : [];
}
