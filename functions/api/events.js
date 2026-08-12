// Cloudflare Pages Function: GET /api/events
// Fetches upcoming convoys for TEXIM ONE from the TruckersMP API.
// Combines events TEXIM ONE organizes with events it is attending.
// Resilient: uses timeouts, allSettled, and a static fallback so the page
// always shows convoys even if the TMP API is slow or unreachable.

const VTC_ID = '74050';
const USER_AGENT = 'TEXIM-ONE-Site/1.0 (official website; via Cloudflare Pages)';
const TIMEOUT_MS = 8000;

// Static fallback list of upcoming convoys (kept roughly in sync). Used only
// if the TruckersMP API is unreachable so the page never shows an error.
const FALLBACK_EVENTS = [
    {
        id: 33929,
        name: '8yrs on the road with BVAR Trucking',
        type: 'Convoy',
        game: 'ETS2',
        server: 'Event Server',
        startAt: '2026-08-22T18:00:00.000Z',
        departure: { location: 'Slots', city: 'Tirana' },
        confirmed: 144,
        url: 'https://truckersmp.com/events/33929-8yrs-on-the-road-with-bvar-trucking'
    },
    {
        id: 34193,
        name: 'Truck Club | 4th Anniversary',
        type: 'Convoy',
        game: 'ETS2',
        server: 'Event Server',
        startAt: '2026-08-27T19:00:00.000Z',
        departure: { location: 'Slots', city: 'TruckersMP HQ' },
        confirmed: 152,
        url: 'https://truckersmp.com/events/34193-truck-club|4th-anniversary'
    },
    {
        id: 33621,
        name: 'EGY-TRUCKERS | AUGUST 2026',
        type: 'Convoy',
        game: 'ETS2',
        server: 'Event Server',
        startAt: '2026-08-28T18:00:00.000Z',
        departure: null,
        confirmed: 186,
        url: 'https://truckersmp.com/events/33621-egy-truckers|-august2026'
    },
    {
        id: 34536,
        name: 'Borry Logistics | 2 YEAR ANNIVERSARY',
        type: 'Truckfest And Convoy',
        game: 'ETS2',
        server: 'Event Server',
        startAt: '2026-08-31T18:00:00.000Z',
        departure: null,
        confirmed: 120,
        url: 'https://truckersmp.com/events/34536-borry-logistics|2-year-anniversary'
    },
    {
        id: 34976,
        name: 'Krone Liner | 3 Year Anniversary',
        type: 'Convoy',
        game: 'ETS2',
        server: 'Event Server',
        startAt: '2026-09-06T18:00:00.000Z',
        departure: null,
        confirmed: 118,
        url: 'https://truckersmp.com/events/34976-krone-liner|3-year-anniversary'
    },
    {
        id: 34097,
        name: 'NorthStar Group | Opening Convoy',
        type: 'Convoy',
        game: 'ETS2',
        server: 'To be determined',
        startAt: '2026-10-03T17:00:00.000Z',
        departure: null,
        confirmed: 124,
        url: 'https://truckersmp.com/events/34097-northstar-group|-opening-convoy'
    }
];

async function tmFetch(path) {
    const url = `https://api.truckersmp.com/v2/vtc/${VTC_ID}${path}`;
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
        return json.response || [];
    } finally {
        clearTimeout(timer);
    }
}

function toDate(dateStr) {
    return new Date(dateStr.replace(' ', 'T') + 'Z');
}

function normalize(item) {
    const start = toDate(item.start_at);
    const now = new Date();
    if (start.getTime() < now.getTime() - 60 * 60 * 1000) return null;

    const mapLink = `https://truckersmp.com/events/${item.id}`;

    return {
        id: item.id,
        name: item.name,
        type: item.event_type ? item.event_type.name : 'Event',
        game: item.game || 'ETS2',
        server: item.server ? item.server.name : '',
        startAt: start.toISOString(),
        meetupAt: item.meetup_at ? toDate(item.meetup_at).toISOString() : start.toISOString(),
        departure: item.departure
            ? { location: item.departure.location, city: item.departure.city }
            : null,
        arrive: item.arrive
            ? { location: item.arrive.location, city: item.arrive.city }
            : null,
        confirmed: item.attendances ? item.attendances.confirmed || 0 : 0,
        url: mapLink
    };
}

export async function onRequest(context) {
    let liveEvents = [];

    // Try to fetch live data, but never fail the request because of it.
    try {
        const results = await Promise.allSettled([
            tmFetch('/events'),
            tmFetch('/events/attending')
        ]);

        const seen = new Set();
        results.forEach((result) => {
            if (result.status !== 'fulfilled') return;
            (result.value || []).forEach((item) => {
                if (!item.start_at || seen.has(item.id)) return;
                seen.add(item.id);
                const norm = normalize(item);
                if (norm) liveEvents.push(norm);
            });
        });

        liveEvents.sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
    } catch {
        // ignore - fall through to fallback
    }

    // If we got nothing live (API down/empty), use the static fallback.
    const events = liveEvents.length > 0 ? liveEvents : FALLBACK_EVENTS;

    return new Response(JSON.stringify({ success: true, events, live: liveEvents.length > 0 }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300' // cache 5 min
        }
    });
}
