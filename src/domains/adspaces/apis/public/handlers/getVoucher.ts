import { Request, Response } from 'express';

import { GetAdResponseType, IApiHandler, JsonResponseType } from 'src/domains/adspaces/types/api';
import CouponModel from 'src/database/models/adspaces/coupon.model';
import AdSpacesVoucherModel from 'src/database/models/adspaces/voucher.model';
import AdSpacesVoucherCounterModel from 'src/database/models/adspaces/counter.model';

import { ethers } from 'ethers';
import { FANTOM_MAINNET, FANTOM_TESTNET } from 'src/utils/chain';
import { ADSPACES_SIGNER_WALLET_KEY, FANTOM_ADDRESS_MAINNET } from 'src/constants/general';

function sendErrorResponse(res: Response, error: Error): Response {
    return res.status(500).json({
        success: false,
        error: {
            message: error.message,
        },
    });
}

function sendSuccessResponse(res: Response, data: unknown): Response {
    return res.json({
        success: true,
        data,
    });
}

const isValidWalletAddress = (address: string) => {
    try {
        ethers.utils.getAddress(address);
        return true;
    } catch (error) {
        return false;
    }
};

const isValidTokenAddress = (address: string) => {
    const tokenAddresses = [FANTOM_ADDRESS_MAINNET.HEC, FANTOM_ADDRESS_MAINNET.TOR, FANTOM_ADDRESS_MAINNET.USDC];

    return tokenAddresses.some((tokenAddress) => tokenAddress.toLowerCase() === address.toLowerCase());
};

export const isValidCouponCode = (code: string) => {
    if (!code || code.length > 10 || code.length < 3 || !/^[a-zA-Z0-9]+$/.test(code)) {
        return false;
    }
    return true;
};

const isCouponPromoStarted = (date: string) => {
    const now = new Date();
    const startDate = new Date(date);
    return now > startDate;
};

const isCouponPromoEnded = (date: string) => {
    const now = new Date();
    const endDate = new Date(date);
    return now > endDate;
};

const getUniqueVoucherId = async () => {
    const sequenceDocument = await AdSpacesVoucherCounterModel.findOneAndUpdate(
        { _id: 'adspaces_vouchers_counter' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true },
    );

    if (!sequenceDocument) {
        throw new Error(`Counter document not found`);
    }

    return sequenceDocument.sequence_value;
};

let provider: ethers.providers.JsonRpcProvider;
let hecCouponContract: ethers.Contract;

const getProvider = () => {
    if (!provider) {
        provider = new ethers.providers.JsonRpcProvider(FANTOM_MAINNET.rpc[0]);
    }
    return provider;
};

const getHectorCouponContract = () => {
    if (!hecCouponContract) {
        hecCouponContract = new ethers.Contract(
            FANTOM_ADDRESS_MAINNET.COUPON,
            [
                {
                    inputs: [{ internalType: 'address', name: '', type: 'address' }],
                    name: 'nonces',
                    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
                    stateMutability: 'view',
                    type: 'function',
                },
            ],
            getProvider(),
        );
    }
    return hecCouponContract;
};

export const getVoucher: IApiHandler<Request<{}>, Response<JsonResponseType<GetAdResponseType>>> = async (req, res) => {
    try {
        const { code, token, address, productType } = req.query;

        if (
            !isValidCouponCode(String(code)) ||
            !isValidTokenAddress(String(token)) ||
            !isValidWalletAddress(String(address))
        ) {
            return sendErrorResponse(res, new Error('Invalid parameters'));
        }

        const coupon = await CouponModel.findOne({ code: code });

        if (!coupon) {
            return sendErrorResponse(res, new Error('Coupon not found'));
        }

        if (!coupon.isActive) {
            return sendErrorResponse(res, new Error('Coupon not active'));
        }

        if (coupon.product !== decodeURIComponent(String(productType))) {
            return sendErrorResponse(res, new Error('Coupon not valid for this product'));
        }

        if (coupon.token.toLowerCase() !== String(token).toLowerCase()) {
            return sendErrorResponse(res, new Error('Coupon not valid for this payment token'));
        }

        if (!isCouponPromoStarted(coupon.startDate)) {
            return sendErrorResponse(res, new Error('Coupon promo not started'));
        }

        if (isCouponPromoEnded(coupon.endDate)) {
            coupon.isActive = false;
            return sendErrorResponse(res, new Error('Coupon promo ended'));
        }

        const unusedVoucher = await AdSpacesVoucherModel.findOne({
            generatedForCoupon: coupon._id,
            generatedForAddress: address,
            redeemed: false,
        });

        if (unusedVoucher) {
            return sendSuccessResponse(res, {
                nonce: unusedVoucher.nonce,
                id: unusedVoucher.id,
                product: unusedVoucher.product,
                token: unusedVoucher.token,
                discount: unusedVoucher.discount,
                fixed: unusedVoucher.fixed,
                redeemed: unusedVoucher.redeemed,
                signature: unusedVoucher.signature,
                digestHex: unusedVoucher.digestHex,
            });
        }

        if (coupon.results.voucherRedeemed >= coupon.maxUses) {
            coupon.isActive = false;
            return sendErrorResponse(res, new Error('Coupon max uses reached'));
        }

        if (coupon.maxUsesPerUser > 0) {
            const usedByWalletCount = coupon.results.redeemers.filter(
                (redeemer) => redeemer.address.toLowerCase() === String(address).toLowerCase(),
            ).length;

            if (usedByWalletCount >= coupon.maxUsesPerUser) {
                return sendErrorResponse(res, new Error('Coupon max uses per address reached'));
            }
        }

        const hectorCouponContract = getHectorCouponContract();

        const domain = {
            name: 'Hector Coupon',
            version: '1.0',
            chainId: (await getProvider().getNetwork()).chainId,
            verifyingContract: hectorCouponContract.address,
        };

        const types = {
            Coupon: [
                { name: 'nonce', type: 'uint256' },
                { name: 'payer', type: 'address' },
                { name: 'id', type: 'uint256' },
                { name: 'product', type: 'bytes32' },
                { name: 'token', type: 'address' },
                { name: 'discount', type: 'uint256' },
                { name: 'isFixed', type: 'bool' },
            ],
        };

        const nonce = await hectorCouponContract.nonces(address);
        const uniqueId = await getUniqueVoucherId();
        const productBytes = ethers.utils.formatBytes32String(coupon.product);
        const isFixed = coupon.type === 'flat';

        const value = {
            nonce: nonce,
            payer: address,
            id: uniqueId,
            product: productBytes,
            token: coupon.token,
            discount: coupon.discountAmount,
            isFixed: isFixed,
        };

        const signer = new ethers.Wallet(ADSPACES_SIGNER_WALLET_KEY);

        const flagSig = await signer._signTypedData(domain, types, value);
        const sig = ethers.utils.splitSignature(flagSig);
        const abi = ethers.utils.defaultAbiCoder;
        const signature = abi.encode(['uint8', 'bytes32', 'bytes32'], [sig.v, sig.r, sig.s]);

        const voucher = new AdSpacesVoucherModel({
            generatedForCoupon: coupon._id,
            generatedForAddress: address,
            nonce: nonce,
            id: uniqueId,
            product: coupon.product,
            token: coupon.token,
            discount: coupon.discountAmount,
            fixed: isFixed,
            redeemed: false,
            signature: signature,
        });

        await voucher.save();

        coupon.results.voucherGenerated += 1;

        await coupon.save();

        return sendSuccessResponse(res, {
            nonce: voucher.nonce,
            id: voucher.id,
            product: voucher.product,
            token: voucher.token,
            discount: voucher.discount,
            fixed: voucher.fixed,
            redeemed: voucher.redeemed,
            signature: voucher.signature,
        });
    } catch (error: any) {
        if (error instanceof Error) {
            return sendErrorResponse(res, error);
        } else {
            console.log(error);
        }
    }
};
