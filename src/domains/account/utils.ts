export const getMessageForCreateAccount = (walletAddress: string, nonce: string) =>
    `Please sign this message to create your account.\nThis action will not cost you any transaction fee.\n\nAddress: ${walletAddress}\n\nNonce: ${nonce}`;
export const getMessageForDisableAccount = (walletAddress: string, nonce: string) =>
    `Please sign this message to disable your account.\nThis action will not cost you any transaction fee.\n\nAddress: ${walletAddress}\n\nNonce: ${nonce}`;
export const getMessageForActiveAccount = (walletAddress: string, nonce: string) =>
    `Please sign this message to active your account.\nThis action will not cost you any transaction fee.\n\nAddress: ${walletAddress}\n\nNonce: ${nonce}`;
