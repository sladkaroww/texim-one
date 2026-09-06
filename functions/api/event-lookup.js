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

const REQUEST_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (compatible; TEXIM-ONE/1.0; +https://vtc.texim.one)',
    'Accept': 'application/json,text/html;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
};

async function fetchApiEvent(id) {
    const res = await fetch(`https://api.truckersmp.com/v2/events/${id}`, {
        headers: REQUEST_HEADERS,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return normalizeApiEvent(data?.response, id);
}

async function fetchApiEventList(id) {
    // Some event IDs can be missing from the individual endpoint while still
    // appearing in the current/upcoming/featured event index. Try the index too.
    const res = await fetch('https://api.truckersmp.com/v2/events', {
        headers: REQUEST_HEADERS,
    });
    if (!res.ok) return null;
    const data = await res.json();
    const groups = ['featured', 'today', 'now', 'upcoming'];
    for (const group of groups) {
        const events = Array.isArray(data?.response?.[group]) ? data.response[group] : [];
        const found = events.find((event) => String(event?.id) === String(id));
        if (found) {
            // The index endpoint may contain enough data for the preview itself.
            const normalized = normalizeApiEvent(found, id);
            if (normalized?.name) return normalized;

            try {
                const detailed = await fetchApiEvent(id);
                if (detailed) return detailed;
            } catch { /* continue to page fallback */ }
        }
    }
    return null;
}

async function fetchPageEvent(id) {
    const url = `https://truckersmp.com/events/${id}`;
    const res = await fetch(url, {
        headers: {
            ...REQUEST_HEADERS,
            'Accept': 'text/html,application/xhtml+xml',
            'Referer': 'https://truckersmp.com/events',
        },
    });
    if (!res.ok) return null;
    const html = await res.text();

    const title = meta(html, 'og:title') || clean((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]);
    const description = meta(html, 'og:description') || meta(html, 'description');
    const banner = meta(html, 'og:image');
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

async function fetchViaReader(id) {
    // Last-resort fallback for environments where Cloudflare cannot directly
    // reach TruckersMP. The reader returns the public page as text/markdown.
    const target = `https://truckersmp.com/events/${id}`;
    const res = await fetch(`https://r.jina.ai/${target}`, {
        headers: { 'User-Agent': 'TEXIM-ONE/1.0' },
    });
    if (!res.ok) return null;
    const text = await res.text();

    const title = clean((text.match(/^#\s+(.+)$/m) || [])[1] || '');
    const dateMatch = text.match(/\b(20\d{2}-\d{2}-\d{2})[ T]+(\d{2}:\d{2})\b/);
    const banner = (text.match(/https?:\/\/[^\s)]+\.(?:png|jpe?g|webp)/i) || [])[0] || '';
    if (!title && !dateMatch) return null;

    return {
        id,
        name: title.replace(/\s*[—|-]\s*Event\s*-\s*TruckersMP\s*$/i, '').trim(),
        date: dateMatch?.[1] || '',
        time: dateMatch?.[2] || '',
        game: '',
        server: '',
        route: '',
        departure: '',
        arrival: '',
        banner,
        vtc: '',
        url: target,
    };
}

export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);
    const id = extractId(url.searchParams.get('id') || url.searchParams.get('url'));

    if (!id) return json({ success: false, message: 'Invalid TruckersMP event link.' }, 400);

    try {
        let event = null;
        try { event = await fetchApiEvent(id); } catch { /* try the index */ }
        if (!event) {
            try { event = await fetchApiEventList(id); } catch { /* try the page */ }
        }
        if (!event) {
            try { event = await fetchPageEvent(id); } catch { /* try the reader fallback */ }
        }
        if (!event) {
            try { event = await fetchViaReader(id); } catch { /* handled below */ }
        }
        if (!event) return json({ success: false, message: 'Could not read this TruckersMP event. Check that the event exists and is public.' }, 404);
        return json({ success: true, event });
    } catch {
        return json({ success: false, message: 'Failed to read the TruckersMP event.' }, 502);
    }
}
