// Cloudflare Pages Function: GET /api/event-lookup
// Resolves a TruckersMP event URL/ID and returns normalized event details for the invite form.

function extractId(input) {
    if (!input) return null;
    const s = String(input).trim();
    if (/^\d+$/.test(s)) return s;
    const m = s.match(/truckersmp\.com\/events\/(\d+)/i);
    return m ? m[1] : null;
}

function json(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store',
        },
    });
}

function clean(value) {
    return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

function htmlEntityDecode(value) {
    return String(value || '')
        .replace(/&amp;/gi, '&')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>');
}

function meta(html, property) {
    const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re1 = new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`, 'i');
    const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`, 'i');
    const match = html.match(re1) || html.match(re2);
    return match ? htmlEntityDecode(match[1]) : '';
}

function normalizeApiEvent(ev, id) {
    if (!ev) return null;
    const startRaw = clean(ev.start_at || ev.startAt || '');
    const match = startRaw.match(/(\d{4}-\d{2}-\d{2})[ T]+(\d{2}:\d{2})/);
    const departureCity = clean(ev.departure?.city || ev.departure?.location || '');
    const arrivalCity = clean(ev.arrive?.city || ev.arrive?.location || '');

    return {
        id: ev.id || id,
        name: clean(ev.name),
        date: match?.[1] || '',
        time: match?.[2] || '',
        game: clean(ev.game),
        server: clean(typeof ev.server === 'string' ? ev.server : ev.server?.name),
        route: [departureCity, arrivalCity].filter(Boolean).join(' -> '),
        departure: departureCity,
        arrival: arrivalCity,
        banner: clean(ev.banner),
        vtc: clean(ev.vtc?.name || ev.vtc?.name_short),
        url: `https://truckersmp.com/events/${ev.id || id}`,
    };
}

async function fetchApiEvent(id) {
    const res = await fetch(`https://api.truckersmp.com/v2/events/${id}`, {
        headers: { 'User-Agent': 'TEXIM-ONE-Site/1.0' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return normalizeApiEvent(data?.response, id);
}

async function fetchPageEvent(id) {
    // Fallback for cases where the public API is unavailable. TruckersMP pages
    // expose OpenGraph metadata and the event data in the rendered HTML.
    const url = `https://truckersmp.com/events/${id}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'TEXIM-ONE-Site/1.0' } });
    if (!res.ok) return null;
    const html = await res.text();

    const title = meta(html, 'og:title') || clean((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]);
    const description = meta(html, 'og:description') || meta(html, 'description');
    const banner = meta(html, 'og:image');

    // These patterns cover the common server-rendered forms used by TruckersMP.
    const dateMatch = html.match(/\b(20\d{2}-\d{2}-\d{2})[ T]+(\d{2}:\d{2})/);
    const name = clean(title.replace(/\s*[—|-]\s*Event\s*-\s*TruckersMP\s*$/i, ''));
    if (!name && !dateMatch) return null;

    return {
        id,
        name,
        date: dateMatch?.[1] || '',
        time: dateMatch?.[2] || '',
        game: '',
        server: '',
        route: '',
        departure: '',
        arrival: '',
        banner,
        vtc: '',
        description,
        url,
    };
}

export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);
    const id = extractId(url.searchParams.get('id') || url.searchParams.get('url'));

    if (!id) return json({ success: false, message: 'Invalid TruckersMP event link.' }, 400);

    try {
        let event = null;
        try { event = await fetchApiEvent(id); } catch { /* use page fallback */ }
        if (!event) {
            try { event = await fetchPageEvent(id); } catch { /* handled below */ }
        }
        if (!event) return json({ success: false, message: 'Could not read this TruckersMP event. Check that the event exists and is public.' }, 404);
        return json({ success: true, event });
    } catch {
        return json({ success: false, message: 'Failed to read the TruckersMP event.' }, 502);
    }
}
