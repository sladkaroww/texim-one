// Cloudflare Pages Function: GET /api/events
// Fetches all upcoming convoys for TEXIM ONE from the TruckersMP API.
// Combines events TEXIM ONE organizes with events it is attending,
// filters to upcoming ones, and returns them as JSON, newest upcoming first.

const VTC_ID = '74050';
const USER_AGENT = 'TEXIM-ONE-Site/1.0 (official website; via Cloudflare Pages)';

async function tmFetch(path) {
    const url = `https://api.truckersmp.com/v2/vtc/${VTC_ID}${path}`;
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) {
        throw new Error(`TruckersMP API error ${res.status}`);
    }
    const json = await res.json();
    if (json.error) {
        throw new Error('TruckersMP API returned an error');
    }
    return json.response || [];
}

function toDate(dateStr) {
    // API returns "YYYY-MM-DD HH:MM:SS" in UTC
    return new Date(dateStr.replace(' ', 'T') + 'Z');
}

export async function onRequest(context) {
    try {
        const [organized, attending] = await Promise.all([
            tmFetch('/events'),
            tmFetch('/events/attending')
        ]);

        const now = new Date();
        const seen = new Set();
        const events = [];

        const candidates = [...organized, ...attending];
        candidates.forEach((e) => {
            if (!e.start_at || seen.has(e.id)) return;
            const start = toDate(e.start_at);
            // Keep only upcoming events, plus anything within the last hour
            if (start.getTime() < now.getTime() - 60 * 60 * 1000) return;
            seen.add(e.id);

            const mapLink = e.map
                ? `https://truckersmp.com${e.url || ''}`
                : `https://truckersmp.com/events/${e.id}`;

            events.push({
                id: e.id,
                name: e.name,
                type: e.event_type ? e.event_type.name : 'Event',
                game: e.game || 'ETS2',
                server: e.server ? e.server.name : '',
                startAt: start.toISOString(),
                meetupAt: e.meetup_at ? toDate(e.meetup_at).toISOString() : start.toISOString(),
                departure: e.departure
                    ? { location: e.departure.location, city: e.departure.city }
                    : null,
                arrive: e.arrive
                    ? { location: e.arrive.location, city: e.arrive.city }
                    : null,
                confirmed: e.attendances ? e.attendances.confirmed || 0 : 0,
                url: mapLink
            });
        });

        events.sort((a, b) => new Date(a.startAt) - new Date(b.startAt));

        return new Response(JSON.stringify({ success: true, events }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=300' // cache 5 min
            }
        });
    } catch (error) {
        return new Response(
            JSON.stringify({ success: false, message: error.message, events: [] }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
