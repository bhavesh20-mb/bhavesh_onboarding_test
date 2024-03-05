import getAllFnfts from './getAllFnfts';
import getAllFnftsTest from './getAllFnftsTest';

export default async function () {
    try {
        await getAllFnfts();
        await getAllFnftsTest();
    } catch {}
}
