// Cloudflare Pages Function: GET /api/event-lookup
// Proxies the TruckersMP event API so the browser can auto-fill the invite
// form from a pasted truckersmp.com/events/XXXX link (avoids CORS, normalizes
// the response into the exact fields the form needs).

function extractId(input) {
    if (!input) return null;
    const s = String(input).trim();
    if (/^\d+$/.test(s)) return s; // bare ID
    const m = s.match(/truckersmp\.com\/events\/(\d+)/i); // URL
    return m ? m[1] : null;
}

function json(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'content-type': 'application/json',
            'cache-control': 'public, max-age=60',
        },
    });
}

export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);
    const id = extractId(url.searchParams.get('id') || url.searchParams.get('url'));

    if (!id) {
        return json({ success: false, message: 'Invalid event link or ID.' }, 400);
    }

    try {
        const res = await fetch(`https://api.truckersmp.com/v2/events/${id}`, {
            headers: { 'User-Agent': 'TEXIM-ONE-Site/1.0' },
        });

        if (!res.ok) {
            return json({ success: false, message: 'Event not found on TruckersMP.' }, 404);
        }

        const data = await res.json();
        const ev = data && data.response;
        if (!ev) {
            return json({ success: false, message: 'Event not found on TruckersMP.' }, 404);
        }

        // TruckersMP returns start_at as "2026-09-06 18:00:00" (UTC)
        const startRaw = ev.start_at || '';
        let date = '';
        let time = '';
        const m = startRaw.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/);
        if (m) {
            date = m[1];
            time = m[2];
        }

        const departureCity = ev.departure && ev.departure.city;
        const arrivalCity = ev.arrive && ev.arrive.city;
        const route = [departureCity, arrivalCity].filter(Boolean).join(' -> ');

        return json({
            success: true,
            event: {
                id: ev.id,
                name: ev.name || '',
                date,
                time,
                game: ev.game || '',
                server: typeof ev.server === 'string' ? ev.server : (ev.server && ev.server.name) || '',
                route,
                departure: departureCity || (ev.departure && ev.departure.location) || '',
                arrival: arrivalCity || (ev.arrive && ev.arrive.location) || '',
                banner: ev.banner || '',
                vtc: (ev.vtc && ev.vtc.name) || '',
                url: `https://truckersmp.com/events/${ev.id}`,
            },
        });
    } catch (e) {
        return json({ success: false, message: 'Failed to reach TruckersMP.' }, 502);
    }
}
