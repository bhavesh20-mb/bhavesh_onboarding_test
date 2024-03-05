import { IAdSpacesUserModel } from 'src/interfaces/adSpacesModels';
import { AdSpacesRoleName } from './types/api';

export const getMessageForSignIn = (walletAddress: string, nonce: string) =>
    `Please sign this message to get logged in.\nThis action will not cost you any transaction fee.\n\nAddress: ${walletAddress}\n\nNonce: ${nonce}`;
export const getMessageForSignUp = (walletAddress: string, nonce: string) =>
    `Please sign this message to sign up.\nThis action will not cost you any transaction fee.\n\nAddress: ${walletAddress}\n\nNonce: ${nonce}`;

export const userHasRole = (roles: string[], role: AdSpacesRoleName) => {
    return roles.includes(role);
};

export const userHasPermission = (permissions: string[], permission: string) => {
    return permissions.includes(permission);
};
