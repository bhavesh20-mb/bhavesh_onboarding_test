export const getMessageForSignIn = (walletAddress: string, nonce: string) =>
    `Hello, thanks for using Hector Products!\nPlease sign this message to get logged in.\nThis action will not cost you any transaction fee.\n\nAddress: ${walletAddress}\n\nNonce: ${nonce}`;
export const getMessageForSignUp = (walletAddress: string, nonce: string) =>
    `Hello, thanks for using Hector Products!\nPlease sign this message to sign up.\nThis action will not cost you any transaction fee.\n\nAddress: ${walletAddress}\n\nNonce: ${nonce}`;
