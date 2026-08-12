// Cloudflare Pages Function: GET /api/event?id=XXXX
// Fetches a single TruckersMP event and returns simplified fields so the
// invite form can auto-fill date, time, name and details.
//
// Note: TruckersMP's single-event *API* endpoint (api.truckersmp.com/v2/events/{id})
// blocks requests originating from Cloudflare's network, so we fall back to
// scraping the public event HTML page, which is reachable.

const USER_AGENT = 'TEXIM-ONE-Site/1.0 (official website; via Cloudflare Pages)';
const TIMEOUT_MS = 8000;

const MONTHS = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
};

async function fetchText(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const res = await fetch(url, {
            headers: { 'User-Agent': USER_AGENT, 'Accept': 'text/html,application/json' },
            signal: controller.signal
        });
        if (!res.ok) throw new Error(`Upstream error ${res.status}`);
        return await res.text();
    } finally {
        clearTimeout(timer);
    }
}

function parseHtml(html, id) {
    const pick = (re) => {
        const m = html.match(re);
        return m ? m[1].replace(/\s+/g, ' ').trim() : '';
    };

    const name = pick(/<meta property="og:title" content="([^"]+?) - Events - TruckersMP"/);
    const og = pick(/<meta property="og:description" content="([^"]*?)"/);
    const meetup = pick(/Meetup Time<\/th>\s*<td[^>]*>([^<]+)<\/td>/);
    const location = pick(/<th[^>]*>Location<\/th>\s*<td[^>]*>([^<]+)<\/td>/);
    const destination = pick(/<th[^>]*>Destination<\/th>\s*<td[^>]*>([^<]+)<\/td>/);
    const server = pick(/Server:\s*([^<\n]+)/i);

    // Start time is in the og:description, e.g. "on Sat, Oct 3, 2026 17:00"
    const dm = og.match(/on [A-Za-z]{3}, ([A-Za-z]{3}) (\d{1,2}), (\d{4}) (\d{1,2}):(\d{2})/);
    let date = '';
    let time = '';
    if (dm) {
        const mon = MONTHS[dm[1]] || '01';
        date = `${dm[3]}-${mon}-${dm[2].padStart(2, '0')}`;
        time = `${dm[4].padStart(2, '0')}:${dm[5]}`;
    }

    const route = [location, destination].filter(Boolean).join(' → ');
    const detailsParts = [];
    if (server) detailsParts.push(`Server: ${server}`);
    if (route) detailsParts.push(`Route: ${route}`);
    if (meetup) detailsParts.push(`Meetup: ${meetup}`);
    detailsParts.push(`Link: https://truckersmp.com/events/${id}`);

    return {
        success: true,
        id: Number(id),
        name,
        date,
        time,
        meetup: meetup.replace(/^[A-Za-z]{3}, /, '').replace(/ \d{4}.*$/, '') || '',
        server: server || '',
        game: '',
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

    try {
        // Prefer the API; fall back to the public HTML page (API blocks
        // Cloudflare's network for single-event lookups).
        let html = null;
        try {
            const apiUrl = `https://api.truckersmp.com/v2/events/${id}`;
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
            const apiRes = await fetch(apiUrl, {
                headers: { 'User-Agent': USER_AGENT },
                signal: controller.signal
            });
            clearTimeout(timer);
            if (apiRes.ok) {
                const ev = await apiRes.json();
                if (ev && !ev.error && ev.response) {
                    const e = ev.response;
                    const start = e.start_at ? new Date(e.start_at.replace(' ', 'T') + 'Z') : null;
                    const meet = e.meetup_at ? new Date(e.meetup_at.replace(' ', 'T') + 'Z') : null;
                    const dep = e.departure ? `${e.departure.city || ''}${e.departure.location ? ' (' + e.departure.location + ')' : ''}`.trim() : '';
                    const arr = e.arrive ? `${e.arrive.city || ''}${e.arrive.location ? ' (' + e.arrive.location + ')' : ''}`.trim() : '';
                    const route = [dep, arr].filter(Boolean).join(' → ');
                    const desc = (e.description || '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[#*_>`~-]/g, '').replace(/\n{2,}/g, '\n').trim();
                    const detailsParts = [];
                    if (e.game) detailsParts.push(`Game: ${e.game}`);
                    if (e.server && e.server.name) detailsParts.push(`Server: ${e.server.name}`);
                    if (route) detailsParts.push(`Route: ${route}`);
                    if (meet) detailsParts.push(`Meetup: ${e.meetup_at} UTC`);
                    if (start) detailsParts.push(`Start: ${e.start_at} UTC`);
                    if (desc) detailsParts.push(`\n${desc}`);
                    return new Response(JSON.stringify({
                        success: true,
                        id: e.id,
                        name: e.name || '',
                        date: start ? start.toISOString().slice(0, 10) : '',
                        time: start ? start.toISOString().slice(11, 16) : '',
                        meetup: meet ? meet.toISOString().slice(11, 16) : '',
                        server: e.server && e.server.name ? e.server.name : '',
                        game: e.game || '',
                        route,
                        details: detailsParts.join('\n')
                    }), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' }
                    });
                }
            }
        } catch {
            // fall through to HTML scraping
        }

        html = await fetchText(`https://truckersmp.com/events/${id}`);
        const data = parseHtml(html, id);

        return new Response(JSON.stringify(data), {
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
