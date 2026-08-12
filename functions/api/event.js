// Cloudflare Pages Function: GET /api/event?id=XXXX
// Fetches a single TruckersMP event by ID and returns simplified fields
// so the invite form can auto-fill date, time, name and details.

const USER_AGENT = 'TEXIM-ONE-Site/1.0 (official website; via Cloudflare Pages)';
const TIMEOUT_MS = 8000;

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

function stripHtmlAndMarkdown(text) {
    if (!text) return '';
    return text
        .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links -> text
        .replace(/[#*_>`~-]/g, '') // markdown symbols
        .replace(/\r/g, '')
        .replace(/\n{2,}/g, '\n')
        .trim();
}

export async function onRequest(context) {
    const id = context.request.query.get('id');
    if (!id || !/^\d+$/.test(id)) {
        return new Response(JSON.stringify({ success: false, message: 'Invalid event id' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const ev = await tmFetch(`/events/${id}`);
        if (!ev) throw new Error('Event not found');

        const start = ev.start_at ? new Date(ev.start_at.replace(' ', 'T') + 'Z') : null;
        const meetup = ev.meetup_at ? new Date(ev.meetup_at.replace(' ', 'T') + 'Z') : null;

        const departure = ev.departure ? `${ev.departure.city || ''}${ev.departure.location ? ' (' + ev.departure.location + ')' : ''}`.trim() : '';
        const arrive = ev.arrive ? `${ev.arrive.city || ''}${ev.arrive.location ? ' (' + ev.arrive.location + ')' : ''}`.trim() : '';
        const route = [departure, arrive].filter(Boolean).join(' → ');

        const detailsParts = [];
        if (ev.game) detailsParts.push(`Game: ${ev.game}`);
        if (ev.server && ev.server.name) detailsParts.push(`Server: ${ev.server.name}`);
        if (route) detailsParts.push(`Route: ${route}`);
        if (meetup) detailsParts.push(`Meetup: ${ev.meetup_at} UTC`);
        if (start) detailsParts.push(`Start: ${ev.start_at} UTC`);
        const desc = stripHtmlAndMarkdown(ev.description);
        if (desc) detailsParts.push(`\n${desc}`);

        const data = {
            success: true,
            id: ev.id,
            name: ev.name || '',
            date: start ? start.toISOString().slice(0, 10) : '',
            time: start ? start.toISOString().slice(11, 16) : '',
            meetup: meetup ? meetup.toISOString().slice(11, 16) : '',
            server: ev.server && ev.server.name ? ev.server.name : '',
            game: ev.game || '',
            route,
            details: detailsParts.join('\n')
        };

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=300'
            }
        });
    } catch (err) {
        return new Response(
            JSON.stringify({ success: false, message: err.message || 'Failed to load event' }),
            { status: 502, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
