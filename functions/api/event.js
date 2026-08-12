// Cloudflare Pages Function: GET /api/event?id=XXXX
// Returns simplified fields for a single TruckersMP event so the invite form
// can auto-fill date, time, name and details.
//
// Implementation note: TruckersMP's single-event *API* endpoint
// (api.truckersmp.com/v2/events/{id}) and the public event HTML page both
// block requests from Cloudflare's network. The only reliably reachable source
// is TEXIM ONE's own convoy lists (/vtc/74050/events + /events/attending),
// which cover events the VTC organises or is invited to / attending. That is
// exactly the "invite us to your convoy" use case.

const VTC_ID = '74050';
const USER_AGENT = 'TEXIM-ONE-Site/1.0 (official website; via Cloudflare Pages)';
const TIMEOUT_MS = 8000;

// Static fallback list (kept roughly in sync with /api/events). Used so
// auto-fill still works for known upcoming convoys when the TMP API is
// unreachable (it rate-limits / blocks Cloudflare's network at times).
const FALLBACK_EVENTS = [
    { id: 33929, name: '8yrs on the road with BVAR Trucking', type: 'Convoy', game: 'ETS2', server: 'Event Server', startAt: '2026-08-22T18:00:00.000Z', departure: { location: 'Slots', city: 'Tirana' }, confirmed: 144, url: 'https://truckersmp.com/events/33929-8yrs-on-the-road-with-bvar-trucking' },
    { id: 34193, name: 'Truck Club | 4th Anniversary', type: 'Convoy', game: 'ETS2', server: 'Event Server', startAt: '2026-08-27T19:00:00.000Z', departure: { location: 'Slots', city: 'TruckersMP HQ' }, confirmed: 152, url: 'https://truckersmp.com/events/34193-truck-club|4th-anniversary' },
    { id: 33621, name: 'EGY-TRUCKERS | AUGUST 2026', type: 'Convoy', game: 'ETS2', server: 'Event Server', startAt: '2026-08-28T18:00:00.000Z', departure: null, confirmed: 186, url: 'https://truckersmp.com/events/33621-egy-truckers|-august2026' },
    { id: 34536, name: 'Borry Logistics | 2 YEAR ANNIVERSARY', type: 'Truckfest And Convoy', game: 'ETS2', server: 'Event Server', startAt: '2026-08-31T18:00:00.000Z', departure: null, confirmed: 120, url: 'https://truckersmp.com/events/34536-borry-logistics|2-year-anniversary' },
    { id: 34976, name: 'Krone Liner | 3 Year Anniversary', type: 'Convoy', game: 'ETS2', server: 'Event Server', startAt: '2026-09-06T18:00:00.000Z', departure: null, confirmed: 118, url: 'https://truckersmp.com/events/34976-krone-liner|3-year-anniversary' },
    { id: 34097, name: 'NorthStar Group | Opening Convoy', type: 'Convoy', game: 'ETS2', server: 'To be determined', startAt: '2026-10-03T17:00:00.000Z', departure: null, confirmed: 124, url: 'https://truckersmp.com/events/34097-northstar-group|-opening-convoy' }
];

function normalizeFallback(item) {
    const start = new Date(item.startAt);
    const departure = item.departure ? `${item.departure.city || ''}${item.departure.location ? ' (' + item.departure.location + ')' : ''}`.trim() : '';
    const details = [
        `Game: ${item.game || 'ETS2'}`,
        `Server: ${item.server || ''}`,
        departure ? `Route: ${departure}` : '',
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
        route: departure,
        details
    };
}

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
    const meetup = item.meetup_at ? toDate(item.meetup_at) : start;
    const departure = item.departure ? `${item.departure.city || ''}${item.departure.location ? ' (' + item.departure.location + ')' : ''}`.trim() : '';
    const arrive = item.arrive ? `${item.arrive.city || ''}${item.arrive.location ? ' (' + item.arrive.location + ')' : ''}`.trim() : '';
    const route = [departure, arrive].filter(Boolean).join(' → ');

    const detailsParts = [];
    if (item.game) detailsParts.push(`Game: ${item.game}`);
    if (item.server && item.server.name) detailsParts.push(`Server: ${item.server.name}`);
    if (route) detailsParts.push(`Route: ${route}`);
    detailsParts.push(`Meetup: ${item.meetup_at || item.start_at} UTC`);
    detailsParts.push(`Start: ${item.start_at} UTC`);

    return {
        id: item.id,
        name: item.name || '',
        date: start.toISOString().slice(0, 10),
        time: start.toISOString().slice(11, 16),
        meetup: meetup.toISOString().slice(11, 16),
        server: item.server && item.server.name ? item.server.name : '',
        game: item.game || '',
        route,
        details: detailsParts.join('\n')
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

    try {
        const results = await Promise.allSettled([
            tmFetch('/events'),
            tmFetch('/events/attending')
        ]);

        const seen = new Set();
        let match = null;
        results.forEach((result) => {
            if (result.status !== 'fulfilled' || match) return;
            (result.value || []).forEach((item) => {
                if (seen.has(item.id)) return;
                seen.add(item.id);
                if (item.id === wanted) match = normalize(item);
            });
        });

        if (!match) {
            const fb = FALLBACK_EVENTS.find((e) => e.id === wanted);
            if (fb) match = normalizeFallback(fb);
        }

        if (!match) {
            return new Response(JSON.stringify({
                success: false,
                message: 'This event is not in TEXIM ONE\'s convoy list yet. Please add the details manually, or make sure your VTC has invited TEXIM ONE to attend.'
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ success: true, ...match }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' }
        });
    } catch (err) {
        return new Response(
            JSON.stringify({ success: false, message: err.message || 'Failed to load event' }),
            { status: 502, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
