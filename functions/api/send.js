// Cloudflare Pages Function: POST /api/send
// Resolves the submitted TruckersMP event URL through /api/event-lookup,
// checks the TEXIM ONE calendar, then sends the invitation to Discord.

const FALLBACK_SCHEDULE = [
    { id: 33929, name: '8yrs on the road with BVAR Trucking', date: '2026-08-22' },
    { id: 34193, name: 'Truck Club | 4th Anniversary', date: '2026-08-27' },
    { id: 33621, name: 'EGY-TRUCKERS | AUGUST 2026', date: '2026-08-28' },
    { id: 34536, name: 'Borry Logistics | 2 YEAR ANNIVERSARY', date: '2026-08-31' },
    { id: 34976, name: 'Krone Liner | 3 Year Anniversary', date: '2026-09-06' },
    { id: 34097, name: 'NorthStar Group | Opening Convoy', date: '2026-10-03' },
];

function json(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store',
        },
    });
}

function randomToken() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function extractEventId(link) {
    const match = String(link || '').match(/(?:https?:\/\/)?(?:www\.)?truckersmp\.com\/events?\/(\d+)/i);
    return match ? match[1] : null;
}

async function getOurSchedule(request) {
    try {
        const origin = new URL(request.url).origin;
        const res = await fetch(`${origin}/api/events`, {
            headers: { 'User-Agent': 'TEXIM-ONE-Site/1.0' },
        });
        if (!res.ok) return FALLBACK_SCHEDULE;
        const data = await res.json();
        const events = data.events || [];
        const mapped = events
            .map((e) => ({
                id: e.id,
                name: e.name || 'Our Convoy',
                date: (e.startAt || e.start_at || '').slice(0, 10),
            }))
            .filter((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.date));
        return mapped.length ? mapped : FALLBACK_SCHEDULE;
    } catch {
        return FALLBACK_SCHEDULE;
    }
}

async function resolveEvent(request, eventLink) {
    const origin = new URL(request.url).origin;
    const response = await fetch(
        `${origin}/api/event-lookup?url=${encodeURIComponent(eventLink)}`,
        { headers: { Accept: 'application/json' }, cache: 'no-store' }
    );

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.success || !data?.event) {
        const error = new Error(data?.message || 'Unable to read the TruckersMP event.');
        error.status = response.status || 502;
        throw error;
    }
    return data.event;
}

export async function onRequest(context) {
    const { request, env } = context;
    if (request.method !== 'POST') return json({ success: false, message: 'Method not allowed' }, 405);

    const webhookUrl = env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) return json({ success: false, message: 'Discord webhook is not configured.' }, 500);

    if (!env.TEXIM_CALENDAR) {
        return json({ success: false, message: 'Calendar storage is not configured.' }, 500);
    }

    let data;
    try {
        data = await request.json();
    } catch {
        return json({ success: false, message: 'Invalid JSON payload.' }, 400);
    }

    const discord = String(data.discord || '').trim();
    const email = String(data.email || '').trim();
    const eventLink = String(data.eventLink || '').trim();
    const details = String(data.details || '').trim();

    if (!eventLink || !extractEventId(eventLink)) {
        return json({ success: false, message: 'Please provide a valid TruckersMP event link.' }, 400);
    }
    if (!discord) {
        return json({ success: false, message: 'Please provide your Discord.' }, 400);
    }

    let event;
    try {
        // Never trust the editable form fields as the source of truth.
        // The server resolves the event again directly through the API-backed endpoint.
        event = await resolveEvent(request, eventLink);
    } catch (error) {
        return json({
            success: false,
            message: error?.message || 'Could not read the TruckersMP event.',
        }, Number(error?.status) >= 400 && Number(error?.status) < 600 ? error.status : 502);
    }

    const eventName = String(event.name || '').trim();
    const eventDate = String(event.date || '').trim();
    const eventTime = String(event.time || '').trim();

    if (!eventName || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
        return json({ success: false, message: 'TruckersMP returned incomplete event information.' }, 502);
    }

    const schedule = await getOurSchedule(request);
    const conflict = schedule.find((e) => e.date === eventDate) || null;
    const status = conflict ? 'declined' : 'received';

    const fields = [
        { name: 'Convoy Name', value: eventName, inline: false },
        { name: 'Date', value: eventDate, inline: true },
        { name: 'Start Time (UTC)', value: eventTime || 'N/A', inline: true },
        { name: 'Invited by (Discord)', value: discord, inline: true },
        { name: 'Event ID', value: String(event.id), inline: true },
        { name: 'Game / Server', value: `${event.game || 'N/A'}${event.server ? ` / ${event.server}` : ''}`, inline: true },
        { name: 'Route', value: event.route || 'N/A', inline: false },
        conflict
            ? { name: 'Auto-Decision', value: `DECLINED — we already have a TEXIM ONE convoy on this date:\n**${conflict.name}** (${conflict.date}).`, inline: false }
            : { name: 'Auto-Decision', value: 'RECEIVED — no calendar conflict. Pending review; use the review button to approve it.', inline: false },
    ];

    if (email) fields.push({ name: 'Email', value: email, inline: false });
    if (event.vtc) fields.push({ name: 'Hosted by VTC', value: event.vtc, inline: true });
    if (event.externalLink) fields.push({ name: 'External Link', value: event.externalLink, inline: false });
    if (event.voiceLink) fields.push({ name: 'Voice Link', value: event.voiceLink, inline: false });
    if (eventLink) fields.push({ name: 'TruckersMP Event', value: event.url || eventLink, inline: false });
    if (details) fields.push({ name: 'Additional Details', value: details.slice(0, 1000), inline: false });

    const embed = {
        title: conflict ? 'Convoy Invitation — AUTO-DECLINED' : 'New Convoy Invitation',
        color: conflict ? 0xff0000 : 0x1f6feb,
        timestamp: new Date().toISOString(),
        fields,
        footer: { text: 'TEXIM ONE - Convoy Invites (TruckersMP API)' },
        ...(event.banner ? { image: { url: event.banner } } : {}),
    };

    const components = [];
    if (!conflict) {
        const token = randomToken();
        await env.TEXIM_CALENDAR.put(`invite-${token}`, JSON.stringify({
            eventName,
            eventDate,
            eventTime,
            eventLink: event.url || eventLink,
            discord,
            email,
            details,
            eventData: event,
        }), { expirationTtl: 86400 });

        components.push({
            type: 1,
            components: [{
                type: 2,
                style: 5,
                label: 'Review & Add to Calendar',
                url: `${new URL(request.url).origin}/add-convoy?token=${token}`,
            }],
        });
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'TEXIM ONE Bot',
                embeds: [embed],
                ...(components.length ? { components } : {}),
            }),
        });

        if (!response.ok) {
            return json({ success: false, message: 'Discord webhook error.' }, 502);
        }

        return json({
            success: true,
            status,
            event,
            message: conflict
                ? 'Automatically declined: we already have a convoy on that date.'
                : 'Invite received! We will DM you on Discord with our decision.',
        });
    } catch {
        return json({ success: false, message: 'Internal server error.' }, 500);
    }
}
