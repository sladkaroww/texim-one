// Cloudflare Pages Function: GET /api/news
// Loads the complete TEXIM ONE VTC news archive from the TruckersMP API.
const VTC_ID = '74050';
const FALLBACK_NEWS = [
    { id: 69793, title: 'TEXIM ONE THE ORIGINAL™ MONTHLY CONVOY #6', date: '2026-08-09', summary: 'On 8 August 2026 we took part in THE ORIGINAL Monthly Convoy #6.', image: 'https://i.ibb.co/MkfzQKw1/ets2-20260808-211431-00.png', url: 'https://truckersmp.com/vtc/74050/news/69793' },
    { id: 69383, title: 'TEXIM ONE Nova Group | Public Convoy #3', date: '2026-07-27', summary: 'On 25 July 2026 we joined Nova Group | Public Convoy #3.', image: 'https://i.ibb.co/Mx5wdgyP/ets2-20260725-223444-00.png', url: 'https://truckersmp.com/vtc/74050/news/69383' },
    { id: 68663, title: 'TEXIM ONE Vtc x TEXIM ONE Ltd MERCH!', date: '2026-06-28', summary: 'Our official merch collaboration with TEXIM ONE Ltd.', image: 'https://static.truckersmp.com/images/vtc/cover/texim-one.1767262417.jpg', url: 'https://truckersmp.com/vtc/74050/news/68663' },
];
function normalize(item) {
    const dateRaw = item.published_at || item.updated_at || item.created_at || item.date || '';
    return { id: item.id, title: item.title || 'TEXIM ONE News', date: String(dateRaw).slice(0, 10), summary: item.content_summary || '', image: item.image || item.banner || '', url: `https://truckersmp.com/vtc/${VTC_ID}/news/${item.id}` };
}
export async function onRequest() {
    try {
        const res = await fetch(`https://api.truckersmp.com/v2/vtc/${VTC_ID}/news`, { headers: { 'User-Agent': 'TEXIM-ONE-Site/1.0' } });
        if (!res.ok) throw new Error('TruckersMP unavailable');
        const json = await res.json();
        const raw = Array.isArray(json?.response?.news) ? json.response.news : (Array.isArray(json?.news) ? json.news : []);
        const news = raw.map(normalize).filter((item) => item.id && item.title);
        if (!news.length) throw new Error('No news returned');
        news.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        return jsonResponse({ success: true, live: true, news });
    } catch {
        return jsonResponse({ success: true, live: false, news: FALLBACK_NEWS });
    }
}
function jsonResponse(body, status = 200) {
    return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' } });
}
