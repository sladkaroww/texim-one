// Cloudflare Pages Function: GET /api/events
// Returns TEXIM ONE's upcoming convoys (organizing + attending) for the convoy page.
// The source of truth is TruckersMP; the small fallback is only used if TMP is unavailable.
const VTC_ID = '74050';
const FALLBACK_EVENTS = [
    { id: 34097, name: 'NorthStar Group | Opening Convoy', type: 'Convoy', game: 'ETS2', server: 'To be determined', startAt: '2026-10-03T17:00:00.000Z', departure: null, confirmed: 124, url: 'https://truckersmp.com/events/34097' },
];
const HIDDEN_EVENT_IDS = new Set([34976]);

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
        url: e.url || `https://truckersmp.com/events/${e.id}`
    };
}

async function getKvConvoys(env, seen) {
    if (!env?.TEXIM_CALENDAR) return [];
    try {
        const list = await env.TEXIM_CALENDAR.list();
        const out = [];
        for (const k of list.keys) {
            if (k.name.startsWith('invite-') || k.name.startsWith('date-lock-')) continue;
            const v = await env.TEXIM_CALENDAR.get(k.name, { type: 'json' });
            if (!v || !v.date || seen.has(v.id) || HIDDEN_EVENT_IDS.has(Number(v.id))) continue;
            seen.add(v.id);
            out.push({
                id: v.id,
                name: v.name,
                type: 'Invited Convoy',
                game: '',
                server: 'Invited',
                startAt: `${v.date}T${v.time || '00:00'}:00.000Z`,
                departure: null,
                confirmed: 0,
                url: v.link || ''
            });
        }
        return out;
    } catch {
        return [];
    }
}

async function fetchTmpEvents(path, headers) {
    const res = await fetch(`https://truckersmp.com/api/v2/vtc/${VTC_ID}/events${path}`, { headers });
    if (!res.ok) throw new Error(`TruckersMP returned ${res.status}`);
    const json = await res.json();
    return Array.isArray(json.response) ? json.response : [];
}

export async function onRequest(context) {
    const { env } = context;
    const headers = { 'User-Agent': 'TEXIM-ONE-Site/1.0' };
    const seen = new Set();
    const events = [];

    // Fetch both sources independently. If one TMP endpoint has a temporary
    // problem, the other can still keep the calendar updated.
    const results = await Promise.allSettled([
        fetchTmpEvents('', headers),
        fetchTmpEvents('/attending', headers)
    ]);

    for (const result of results) {
        if (result.status !== 'fulfilled') continue;
        for (const e of result.value) {
            if (!e || !e.startAt || seen.has(e.id) || HIDDEN_EVENT_IDS.has(Number(e.id))) continue;
            seen.add(e.id);
            events.push(normalize(e));
        }
    }

    // If TruckersMP supplied at least one event, it is the source of truth.
    // Add locally submitted invites without duplicating TMP events.
    if (events.length) {
        events.push(...await getKvConvoys(env, seen));
        events.sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
        return json({ success: true, live: true, events });
    }

    // Only use fallback data when both TruckersMP endpoints are unavailable.
    const fallback = FALLBACK_EVENTS.filter((e) => !HIDDEN_EVENT_IDS.has(Number(e.id)));
    for (const e of fallback) seen.add(e.id);
    events.push(...fallback);
    events.push(...await getKvConvoys(env, seen));
    events.sort((a, b) => new Date(a.startAt) - new Date(b.startAt));

    return json({ success: true, live: false, events });
}

function json(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'content-type': 'application/json',
            // Keep TMP data fresh while avoiding an API request on every page load.
            'cache-control': 'public, max-age=300'
        }
    });
}
