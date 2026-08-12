// Cloudflare Pages Function: GET /api/event?id=XXXX
// Returns simplified fields for a single TruckersMP event so the invite form
// can auto-fill date, time, name and details.
//
// Strategy:
//   1. Try the single-event TruckersMP API (works for ANY event when TMP is
//      not rate-limiting / blocking Cloudflare's egress).
//   2. Fall back to TEXIM ONE's own reachable convoy lists (organising +
//      attending) and the static fallback list.

const VTC_ID = '74050';
const USER_AGENT = 'TEXIM-ONE-Site/1.0 (official website; via Cloudflare Pages)';
const TIMEOUT_MS = 8000;

const FALLBACK_EVENTS = [
    { id: 33929, name: '8yrs on the road with BVAR Trucking', type: 'Convoy', game: 'ETS2', server: 'Event Server', startAt: '2026-08-22T18:00:00.000Z', departure: { location: 'Slots', city: 'Tirana' }, confirmed: 144 },
    { id: 34193, name: 'Truck Club | 4th Anniversary', type: 'Convoy', game: 'ETS2', server: 'Event Server', startAt: '2026-08-27T19:00:00.000Z', departure: { location: 'Slots', city: 'TruckersMP HQ' }, confirmed: 152 },
    { id: 33621, name: 'EGY-TRUCKERS | AUGUST 2026', type: 'Convoy', game: 'ETS2', server: 'Event Server', startAt: '2026-08-28T18:00:00.000Z', departure: null, confirmed: 186 },
    { id: 34536, name: 'Borry Logistics | 2 YEAR ANNIVERSARY', type: 'Truckfest And Convoy', game: 'ETS2', server: 'Event Server', startAt: '2026-08-31T18:00:00.000Z', departure: null, confirmed: 120 },
    { id: 34976, name: 'Krone Liner | 3 Year Anniversary', type: 'Convoy', game: 'ETS2', server: 'Event Server', startAt: '2026-09-06T18:00:00.000Z', departure: null, confirmed: 118 },
    { id: 34097, name: 'NorthStar Group | Opening Convoy', type: 'Convoy', game: 'ETS2', server: 'To be determined', startAt: '2026-10-03T17:00:00.000Z', departure: null, confirmed: 124 }
];

async function tmFetch(path) {
    const url = `https://api.truckersmp.com/v2${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const res = await fetch(url, {
            headers: { 'User-Agent': USER_AGENT },
            signal: controller.signal
        });
        if (!res.ok) throw new Error(`TruckersMP API error ${res.status}`);
        const json = await res.json();
        if (json.error) throw new Error('TruckersMP API returned an error');
        return json.response || null;
    } finally {
        clearTimeout(timer);
    }
}

function toDate(dateStr) {
    return new Date(dateStr.replace(' ', 'T') + 'Z');
}

function fromApiEvent(e) {
    const start = toDate(e.start_at);
    const meetup = e.meetup_at ? toDate(e.meetup_at) : start;
    const dep = e.departure ? `${e.departure.city || ''}${e.departure.location ? ' (' + e.departure.location + ')' : ''}`.trim() : '';
    const arr = e.arrive ? `${e.arrive.city || ''}${e.arrive.location ? ' (' + e.arrive.location + ')' : ''}`.trim() : '';
    const route = [dep, arr].filter(Boolean).join(' → ');
    const desc = (e.description || '')
        .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/[#*_>`~-]/g, '')
        .replace(/\n{2,}/g, '\n')
        .trim();

    const details = [
        e.game ? `Game: ${e.game}` : '',
        e.server && e.server.name ? `Server: ${e.server.name}` : '',
        route ? `Route: ${route}` : '',
        `Meetup: ${e.meetup_at || e.start_at} UTC`,
        `Start: ${e.start_at} UTC`,
        desc ? `\n${desc}` : ''
    ].filter(Boolean).join('\n');

    return {
        id: e.id,
        name: e.name || '',
        date: start.toISOString().slice(0, 10),
        time: start.toISOString().slice(11, 16),
        meetup: meetup.toISOString().slice(11, 16),
        server: e.server && e.server.name ? e.server.name : '',
        game: e.game || '',
        route,
        details
    };
}

function fromFallback(item) {
    const start = new Date(item.startAt);
    const dep = item.departure ? `${item.departure.city || ''}${item.departure.location ? ' (' + item.departure.location + ')' : ''}`.trim() : '';
    const details = [
        `Game: ${item.game || 'ETS2'}`,
        `Server: ${item.server || ''}`,
        dep ? `Route: ${dep}` : '',
        `Start: ${item.startAt.replace('T', ' ').replace('.000Z', '')} UTC`
    ].filter(Boolean).join('\n');
    return {
        id: item.id,
        name: item.name || '',
        date: start.toISOString().slice(0, 10),
        time: start.toISOString().slice(11, 16),
        meetup: start.toISOString().slice(11, 16),
        server: item.server || '',
        game: item.game || '',
        route: dep,
        details
    };
}

export async function onRequest(context) {
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');

    if (!id || !/^\d+$/.test(id)) {
        return new Response(JSON.stringify({ success: false, message: 'Invalid event id' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    const wanted = Number(id);

    // 1) Single-event API (any event, when reachable)
    try {
        const ev = await tmFetch(`/events/${id}`);
        if (ev && ev.id === wanted) {
            return new Response(JSON.stringify({ success: true, ...fromApiEvent(ev) }), {
                status: 200,
                headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' }
            });
        }
    } catch {
        // fall through
    }

    // 2) TEXIM ONE's own lists + static fallback
    try {
        const results = await Promise.allSettled([
            tmFetch(`/vtc/${VTC_ID}/events`),
            tmFetch(`/vtc/${VTC_ID}/events/attending`)
        ]);
        const seen = new Set();
        for (const result of results) {
            if (result.status !== 'fulfilled') continue;
            for (const item of (result.value || [])) {
                if (seen.has(item.id)) continue;
                seen.add(item.id);
                if (item.id === wanted) {
                    return new Response(JSON.stringify({ success: true, ...fromApiEvent(item) }), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' }
                    });
                }
            }
        }
        const fb = FALLBACK_EVENTS.find((e) => e.id === wanted);
        if (fb) {
            return new Response(JSON.stringify({ success: true, ...fromFallback(fb) }), {
                status: 200,
                headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' }
            });
        }
    } catch {
        // ignore
    }

    return new Response(JSON.stringify({
        success: false,
        message: 'This event could not be loaded automatically. Please add the details manually.'
    }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
    });
}
