// Cloudflare Pages Function: POST /api/send
// Forwards the convoy invitation form to a Discord webhook and checks our own
// calendar. If we already have a TEXIM ONE convoy on the invited date, the
// invite is automatically declined (so we never double-book).

// The webhook URL is read from the DISCORD_WEBHOOK_URL environment variable
// (recommended). If that is not set, it falls back to the value below.
// Prefer setting DISCORD_WEBHOOK_URL in Cloudflare Pages settings so the real
// webhook URL is not exposed in this public repo.
const FALLBACK_WEBHOOK = 'https://discord.com/api/webhooks/1537097067351122020/RT9l-s5klLMRH6f30Hp7ZwiX9L7TjEqgKnbLa3OYQooLfgbd2_ZkyY8zGTQAq10_pz8I';

// Our schedule, kept in sync with functions/api/events.js. Used as a fallback
// when the live calendar fetch is unavailable. Format: YYYY-MM-DD.
const FALLBACK_SCHEDULE = [
    { id: 33929, name: '8yrs on the road with BVAR Trucking', date: '2026-08-22' },
    { id: 34193, name: 'Truck Club | 4th Anniversary', date: '2026-08-27' },
    { id: 33621, name: 'EGY-TRUCKERS | AUGUST 2026', date: '2026-08-28' },
    { id: 34536, name: 'Borry Logistics | 2 YEAR ANNIVERSARY', date: '2026-08-31' },
    { id: 34976, name: 'Krone Liner | 3 Year Anniversary', date: '2026-09-06' },
    { id: 34097, name: 'NorthStar Group | Opening Convoy', date: '2026-10-03' },
];

async function getOurSchedule(request) {
    try {
        const origin = new URL(request.url).origin;
        const res = await fetch(`${origin}/api/events`, { headers: { 'User-Agent': 'TEXIM-ONE-Site/1.0' } });
        if (!res.ok) return FALLBACK_SCHEDULE;
        const json = await res.json();
        const events = json.events || [];
        const mapped = events
            .map((e) => {
                const raw = e.startAt || e.start_at || '';
                const date = raw.slice(0, 10);
                return { id: e.id, name: e.name || 'Our Convoy', date };
            })
            .filter((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.date));
        return mapped.length ? mapped : FALLBACK_SCHEDULE;
    } catch {
        return FALLBACK_SCHEDULE;
    }
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

    const eventName = (data.eventName || '').trim();
    const eventDate = (data.eventDate || '').trim();
    const eventTime = (data.eventTime || '').trim();
    const discord = (data.discord || '').trim();
    const email = (data.email || '').trim();
    const eventLink = (data.eventLink || '').trim();
    const details = (data.details || '').trim();

    // --- Calendar conflict check ---
    const schedule = await getOurSchedule(request);
    const conflict = schedule.find((e) => e.date === eventDate) || null;
    const status = conflict ? 'declined' : 'received';

    const fields = [
        { name: 'Convoy Name', value: eventName || 'N/A', inline: false },
        { name: 'Date', value: eventDate || 'N/A', inline: true },
        { name: 'Start Time (UTC)', value: eventTime || 'N/A', inline: true },
        { name: 'Invited by (Discord)', value: discord || 'N/A', inline: true },
        { name: 'Email', value: email || 'N/A', inline: false },
    ];

    if (conflict) {
        fields.push({
            name: 'Auto-Decision',
            value: `DECLINED — we already have a TEXIM ONE convoy on this date:\n**${conflict.name}** (${conflict.date}).`,
            inline: false,
        });
    } else {
        fields.push({
            name: 'Auto-Decision',
            value: 'RECEIVED — no calendar conflict. Pending review; we will DM you on Discord with our decision.',
            inline: false,
        });
    }

    if (eventLink) fields.push({ name: 'Convoy Link', value: eventLink, inline: false });
    if (details) fields.push({ name: 'Additional Details', value: details, inline: false });

    const embed = {
        title: conflict ? 'Convoy Invitation — AUTO-DECLINED' : 'New Convoy Invitation',
        color: conflict ? 0xff0000 : 0x1f6feb,
        timestamp: new Date().toISOString(),
        fields,
        footer: { text: 'TEXIM ONE - Convoy Invites (calendar-checked, DM via Discord)' },
    };

    // "Add to Calendar" link button — opens our site's confirmation page where
    // an admin reviews and saves the convoy into the website calendar (KV).
    const addParams = new URLSearchParams({
        name: eventName,
        date: eventDate,
        time: eventTime,
        link: eventLink,
        discord: discord,
        details: details,
    });
    const addUrl = `${new URL(request.url).origin}/add-convoy?${addParams.toString()}`;
    const components = [
        {
            type: 1,
            components: [
                {
                    type: 2,
                    style: 5,
                    label: 'Add to Calendar',
                    url: addUrl,
                },
            ],
        },
    ];

    try {
        const discordResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'TEXIM ONE Bot', embeds: [embed], components }),
        });

        if (!discordResponse.ok) {
            const errText = await discordResponse.text();
            return new Response(
                JSON.stringify({ success: false, message: 'Discord webhook error.', error: errText }),
                { status: 502, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const message = conflict
            ? 'Automatically declined: we already have a convoy on that date. We will DM you on Discord to confirm.'
            : 'Invite received! We will DM you on Discord with our decision.';

        return new Response(
            JSON.stringify({ success: true, status, message }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ success: false, message: 'Internal server error.', error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
