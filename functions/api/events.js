// Cloudflare Pages Function: GET /api/events
// Returns TEXIM ONE's upcoming convoys (organizing + attending) for the
// convoy page. TruckersMP sits behind Cloudflare's bot challenge, which
// intermittently blocks requests from the Pages egress, so we always fall
// back to a static list when the live fetch fails.

const VTC_ID = '74050';

// Static fallback (kept in sync with our known schedule). Used whenever the
// live TruckersMP API is unreachable from our host.
const FALLBACK_EVENTS = [
    { id: 33929, name: '8yrs on the road with BVAR Trucking', type: 'Convoy', game: 'ETS2', server: 'Event Server', startAt: '2026-08-22T18:00:00.000Z', departure: { location: 'Slots', city: 'Tirana' }, confirmed: 144, url: 'https://truckersmp.com/events/33929' },
    { id: 34193, name: 'Truck Club | 4th Anniversary', type: 'Convoy', game: 'ETS2', server: 'Event Server', startAt: '2026-08-27T19:00:00.000Z', departure: { location: 'Slots', city: 'TruckersMP HQ' }, confirmed: 152, url: 'https://truckersmp.com/events/34193' },
    { id: 33621, name: 'EGY-TRUCKERS | AUGUST 2026', type: 'Convoy', game: 'ETS2', server: 'Event Server', startAt: '2026-08-28T18:00:00.000Z', departure: null, confirmed: 186, url: 'https://truckersmp.com/events/33621' },
    { id: 34536, name: 'Borry Logistics | 2 YEAR ANNIVERSARY', type: 'Truckfest And Convoy', game: 'ETS2', server: 'Event Server', startAt: '2026-08-31T18:00:00.000Z', departure: null, confirmed: 120, url: 'https://truckersmp.com/events/34536' },
    { id: 34976, name: 'Krone Liner | 3 Year Anniversary', type: 'Convoy', game: 'ETS2', server: 'Event Server', startAt: '2026-09-06T18:00:00.000Z', departure: null, confirmed: 118, url: 'https://truckersmp.com/events/34976' },
    { id: 34097, name: 'NorthStar Group | Opening Convoy', type: 'Convoy', game: 'ETS2', server: 'To be determined', startAt: '2026-10-03T17:00:00.000Z', departure: null, confirmed: 124, url: 'https://truckersmp.com/events/34097' },
];

function normalize(e) {
    return {
        id: e.id,
        name: e.name,
        type: e.type || (e.event_type && (e.event_type.name || e.event_type.key)) || 'Convoy',
        game: e.game,
        server: typeof e.server === 'string' ? e.server : (e.server && e.server.name) || '',
        startAt: e.startAt || e.start_at,
        departure: e.departure || null,
        confirmed: (e.attendances && e.attendances.confirmed) || e.confirmed || 0,
        url: e.url || `https://truckersmp.com/events/${e.id}`,
    };
}

export async function onRequest() {
    try {
        const headers = { 'User-Agent': 'TEXIM-ONE-Site/1.0' };
        const [orgRes, attRes] = await Promise.all([
            fetch(`https://truckersmp.com/api/v2/vtc/${VTC_ID}/events`, { headers }),
            fetch(`https://truckersmp.com/api/v2/vtc/${VTC_ID}/events/attending`, { headers }),
        ]);

        if (!orgRes.ok || !attRes.ok) throw new Error('TMP unavailable');

        const [orgJson, attJson] = await Promise.all([orgRes.json(), attRes.json()]);
        const raw = [...(orgJson.response || []), ...(attJson.response || [])];
        const seen = new Set();
        const events = [];
        for (const e of raw) {
            if (!e || !e.startAt) continue;
            if (seen.has(e.id)) continue;
            seen.add(e.id);
            events.push(normalize(e));
        }
        if (events.length === 0) throw new Error('No live events');

        events.sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
        return json({ success: true, live: true, events });
    } catch {
        const events = [...FALLBACK_EVENTS].sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
        return json({ success: true, live: false, events });
    }
}

function json(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' },
    });
}
