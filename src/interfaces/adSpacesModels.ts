import mongoose from 'mongoose';
import { AdSpacesRoleName } from 'src/domains/adspaces/types/api';

export interface IAdSpacesUserModel {
    walletAddress: string;
    nonce: string;
    verified: boolean;
    signature: string;
    email: string;
    emailVerified: boolean;
    name: string;
    roles: AdSpacesRoleName[];
    permissions: string[];
    credit: number;
    totalSpent: number;
    adminNotes: IAdSpacesAdminNoteModel[]; // Admin notes are notes that are only visible to admins.
}

export interface IAdSpacesUserSimpleModel {
    walletAddress: string;
    verified: boolean;
    email: string;
    emailVerified: boolean;
    name: string;
    roles: AdSpacesRoleName[];
    permissions: string[];
    credit: number;
    totalSpent: number;
}

export interface IAdSpacesAdminNoteModel {
    userId: mongoose.Schema.Types.ObjectId;
    note: string;
}

export interface IAdSpacesCampaignModel {
    advertiserId: mongoose.Schema.Types.ObjectId;
    name: string;
    description: string;
}

export interface IAdSpacesAdModel {
    campaignId: mongoose.Schema.Types.ObjectId;
    name: string;
    description: string;
    url: string;
    banners: IAdSpacesBannersModel;
    status: IAdSpacesAdStatusModel;
    results: IAdSpacesAdResultsModel;
    settings: IAdSpacesAdSettingsModel;
}

export interface IAdSpacesAdStatusModel {
    isDraft: boolean;
    isVerified: boolean;
    isApproved: boolean;
    isRejected: boolean;
    isSuspended: boolean;
    isBanned: boolean;
    isDeleted: boolean;
}

export interface IAdSpacesAdSettingsModel {
    maxSpending: number;
    startDate: Date;
    endDate: Date;
    cpm: number;
    cpc: number;
    geoTargeting: string[];
    pageTargeting: string[];
}

// IAB Standard highest performing banner ad sizes
export interface IAdSpacesBannersModel {
    mediumRectangle: string | undefined; // 300x250
    largeRectangle: string | undefined; // 336x280
    largeBoard: string | undefined; // 728x90
    mobileLeaderboard: string | undefined; // 320x50
}

export interface IAdSpacesAdResultsModel {
    adId: mongoose.Schema.Types.ObjectId;
    impressions: number;
    clicks: number;
    byCountry: IAdSpacesCountryModel[];
    byPageOrigin: IAdSpacesPageOriginModel[];
}

export interface IAdSpacesCountryModel {
    code: string;
    impressions: number;
    clicks: number;
}

export interface IAdSpacesPageOriginModel {
    url: string;
    impressions: number;
    clicks: number;
}

export interface IAdSpacesCouponModel {
    name: string;
    code: string;
    type: string;
    discountAmount: string;
    product: string;
    token: string;
    maxUses: number;
    maxUsesPerUser: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    results: IAdSpacesCouponResultsModel;
}

export interface IAdSpacesCouponResultsModel {
    voucherGenerated: number; // Number of vouchers generated and signed by our backend
    voucherRedeemed: number; // Number of generated vouchers redeemed by users on contracts
    redeemers: IAdSpacesCouponRedeemerModel[];
}

export interface IAdSpacesCouponRedeemerModel {
    address: string;
    redeemedAt: Date;
    voucherUsed: string;
    planId: string;
    userPaid: number; // Amount that user paid to activate the plan
}

export interface IAdSpacesVoucherCounterModel {
    _id: string;
    sequence_value: number;
}

export interface IAdSpacesVoucherToken {
    symbol: string;
    name: string;
    address: string;
}

export interface IAdSpacesPlanInfoModel {
    amount: string;
    createdBlock: string;
    createdTimestamp: string;
    data: string;
    id: string;
    period: string;
    planId: string;
    totalPaid: string;
    totalPurchased: string;
    token: IAdSpacesVoucherToken;
}

export interface IAdSpacesVoucherModel {
    generatedForCoupon: mongoose.Schema.Types.ObjectId;
    generatedForAddress: string;
    nonce: number;
    id: number;
    product: string;
    token: string;
    discount: number;
    fixed: boolean;
    redeemed: boolean;
    signature: string;
    digestHex: string;
    planInfo?: IAdSpacesPlanInfoModel;
}

export interface IAdSpacesAnnouncementModel {
    type: string;
    targets: string[];
    content: string;
    url: string;
    startDate: Date;
    endDate: Date;
    timerInMinutes: number;
    buildId: string;
    buildLocked: boolean;
    isActive: boolean;
}