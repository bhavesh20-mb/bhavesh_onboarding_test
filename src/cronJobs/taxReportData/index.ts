import getTaxData from './getTaxData';

export default async function () {
    try {
        await getTaxData();
    } catch {}
}
