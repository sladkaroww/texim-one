// Shared logic for the TEXIM ONE event proxy.
// Fetches a single TruckersMP event by id/link and returns simplified,
// CORS-friendly JSON. Deployed on a non-Cloudflare host (Vercel/Render/etc)
// so TruckersMP's block of Cloudflare's shared egress IPs is bypassed.

const UA = 'TEXIM-ONE-Proxy/1.0 (event autofill proxy)';

function extractId(input) {
    if (!input) return null;
    const s = String(input).trim();
    const m = s.match(/\/events\/(\d+)/);
    if (m) return m[1];
    if (/^\d+$/.test(s)) return s;
    return null;
}

function normalize(e) {
    const start = new Date(e.start_at.replace(' ', 'T') + 'Z');
    const meetup = e.meetup_at ? new Date(e.meetup_at.replace(' ', 'T') + 'Z') : start;
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

async function handleEvent(rawInput) {
    const id = extractId(rawInput);
    if (!id) {
        return { status: 400, body: { success: false, message: 'Invalid or missing event link/id' } };
    }
    try {
        const res = await fetch(`https://api.truckersmp.com/v2/events/${id}`, {
            headers: { 'User-Agent': UA }
        });
        const json = await res.json();
        if (json.error || !json.response) {
            return { status: 404, body: { success: false, message: 'Event not found on TruckersMP' } };
        }
        return { status: 200, body: { success: true, ...normalize(json.response) } };
    } catch (err) {
        return { status: 502, body: { success: false, message: 'Failed to reach TruckersMP' } };
    }
}

module.exports = { handleEvent, extractId };
