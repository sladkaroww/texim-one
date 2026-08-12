// Cloudflare Pages Function: POST /api/send
// Forwards the convoy invitation form to a Discord webhook, and attempts to
// auto-fill the convoy details by fetching the TruckersMP event.
//
// NOTE: TruckersMP sits behind Cloudflare's bot challenge, which blocks
// requests from the Pages egress. When the live fetch is blocked we fall back
// to the name parsed from the event link (set on the client) so the invite is
// still useful. A non-Cloudflare proxy is required for 100% reliable fetching.

// The webhook URL is read from the DISCORD_WEBHOOK_URL environment variable
// (recommended). If that is not set, it falls back to the value below.
// Prefer setting DISCORD_WEBHOOK_URL in Cloudflare Pages settings so the real
// webhook URL is not exposed in this public repo.
const FALLBACK_WEBHOOK = 'https://discord.com/api/webhooks/1537097067351122020/RT9l-s5klLMRH6f30Hp7ZwiX9L7TjEqgKnbLa3OYQooLfgbd2_ZkyY8zGTQAq10_pz8I';

const TMP_HOSTS = [
    'https://truckersmp.com/api/v2/events/',
    'https://api.truckersmp.com/v2/events/',
];

function normalizeEvent(e) {
    if (!e || !e.id) return null;
    const start = new Date(e.startAt || e.start_at);
    const departure = e.departure || null;
    const arrive = e.arrive || null;
    const depCity = departure ? [departure.city, departure.location].filter(Boolean).join(' ') : '';
    const arrCity = arrive ? [arrive.city, arrive.location].filter(Boolean).join(' ') : '';
    const route = [depCity, arrCity].filter(Boolean).join(' → ');
    return {
        id: String(e.id),
        name: e.name || '',
        game: e.game || '',
        server: typeof e.server === 'string' ? e.server : (e.server && e.server.name) || '',
        date: isNaN(start) ? '' : start.toISOString().slice(0, 10),
        time: isNaN(start) ? '' : start.toISOString().slice(11, 16),
        route,
        confirmed: (e.attendances && e.attendances.confirmed) || e.confirmed || 0,
        url: e.url || `https://truckersmp.com/events/${e.id}`,
    };
}

async function fetchEvent(id, proxyUrl) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'application/json',
    };
    try {
        // Preferred: a non-Cloudflare proxy (clean IP) that can reach TruckersMP.
        if (proxyUrl) {
            try {
                const r = await fetch(`${proxyUrl.replace(/\/+$/, '')}/api/event?id=${encodeURIComponent(id)}`, {
                    headers,
                    signal: controller.signal,
                });
                if (r.ok) {
                    const j = await r.json();
                    if (j && j.success && j.id) {
                        return {
                            id: String(j.id),
                            name: j.name,
                            game: j.game,
                            url: j.url,
                            date: j.date,
                            time: j.time,
                            route: j.route,
                            confirmed: j.confirmed,
                            server: j.server,
                        };
                    }
                }
            } catch {
                // fall through to direct fetch
            }
        }
        // Fallback: direct from our host (usually blocked by TruckersMP's challenge).
        for (const host of TMP_HOSTS) {
            try {
                const res = await fetch(host + id, { headers, signal: controller.signal });
                if (!res.ok) continue;
                const json = await res.json();
                const e = json.response || json;
                const norm = normalizeEvent(e);
                if (norm) return norm;
            } catch {
                // try the next host
            }
        }
    } finally {
        clearTimeout(timer);
    }
    return null;
}

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ success: false, message: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const webhookUrl = env.DISCORD_WEBHOOK_URL || FALLBACK_WEBHOOK;

    if (!webhookUrl) {
        return new Response(
            JSON.stringify({ success: false, message: 'Webhook URL is not configured.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }

    let data;
    try {
        data = await request.json();
    } catch {
        return new Response(
            JSON.stringify({ success: false, message: 'Invalid JSON payload.' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // Best-effort auto-fetch of the convoy details from TruckersMP.
    // Uses TMP_PROXY_URL (a non-Cloudflare proxy) when set, so details actually
    // fill in; otherwise it falls back to the name parsed from the link.
    const eventId = data.eventId || (data.eventLink || '').match(/truckersmp\.com\/events\/(\d+)/i)?.[1];
    const event = eventId ? await fetchEvent(eventId, env.TMP_PROXY_URL) : null;

    const fields = [
        { name: 'Driver Name', value: data.name || 'N/A', inline: true },
        { name: 'Discord Tag', value: data.discord || 'N/A', inline: true },
        { name: 'Email', value: data.email || 'N/A', inline: false },
    ];

    if (event) {
        fields.push(
            { name: 'Convoy Name', value: event.name || 'N/A', inline: false },
            { name: 'Date', value: event.date || 'N/A', inline: true },
            { name: 'Time (UTC)', value: event.time || 'N/A', inline: true },
            { name: 'Game', value: event.game || 'N/A', inline: true },
            { name: 'Server', value: event.server || 'N/A', inline: true },
        );
        if (event.route) fields.push({ name: 'Route', value: event.route, inline: false });
        if (event.confirmed) fields.push({ name: 'Attending', value: String(event.confirmed), inline: true });
        fields.push({ name: 'Convoy Link', value: event.url || data.eventLink || 'N/A', inline: false });
        fields.push({ name: 'TruckersMP Event ID', value: event.id, inline: true });
    } else {
        fields.push(
            { name: 'Convoy Name', value: data.eventName || 'See event link', inline: false },
            { name: 'Convoy Link', value: data.eventLink || 'N/A', inline: false },
            { name: 'TruckersMP Event ID', value: data.eventId || 'N/A', inline: true },
        );
    }

    if (data.details) {
        fields.push({ name: 'Additional Details', value: data.details, inline: false });
    }

    const embed = {
        title: 'New Convoy Invitation',
        color: 0xff0000,
        timestamp: new Date().toISOString(),
        fields,
        footer: { text: 'TEXIM ONE - Convoy Invites' },
    };

    try {
        const discordResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'TEXIM ONE Bot', embeds: [embed] }),
        });

        if (!discordResponse.ok) {
            const errText = await discordResponse.text();
            return new Response(
                JSON.stringify({ success: false, message: 'Discord webhook error.', error: errText }),
                { status: 502, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({ success: true, message: 'Invitation sent successfully!', fetched: !!event }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ success: false, message: 'Internal server error.', error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
