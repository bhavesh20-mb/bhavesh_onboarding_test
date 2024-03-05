import getFNFTRemainTime from './getFNFTRemainTime';
import getFNFTRemainTimeTest from './getFNFTRemainTimeTest';

export default async function () {
    try {
        await getFNFTRemainTime();
    } catch {}
    try {
        await getFNFTRemainTimeTest();
    } catch {}
}
