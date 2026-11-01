// Cloudflare Pages Function: POST /api/send
// Sends manually entered convoy invitation details to the Discord webhook.

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

    const eventName = String(data.eventName || '').trim();
    const eventDate = String(data.eventDate || '').trim();
    const eventTime = String(data.eventTime || '').trim();
    const eventLink = String(data.eventLink || '').trim();
    const discord = String(data.discord || '').trim();
    const email = String(data.email || '').trim();
    const details = String(data.details || '').trim();

    if (!eventName) return json({ success: false, message: 'Please provide the event name.' }, 400);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
        return json({ success: false, message: 'Please provide a valid event date.' }, 400);
    }
    if (!discord) return json({ success: false, message: 'Please provide your Discord.' }, 400);

    const fields = [
        { name: 'Convoy Name', value: eventName, inline: false },
        { name: 'Date', value: eventDate, inline: true },
        { name: 'Start Time (UTC)', value: eventTime || 'N/A', inline: true },
        { name: 'Invited by (Discord)', value: discord, inline: true },
    ];

    if (email) fields.push({ name: 'Email', value: email, inline: false });
    if (eventLink) fields.push({ name: 'TruckersMP Event', value: eventLink, inline: false });
    if (details) fields.push({ name: 'Additional Details', value: details.slice(0, 1000), inline: false });

    const token = randomToken();
    await env.TEXIM_CALENDAR.put(`invite-${token}`, JSON.stringify({
        eventName,
        eventDate,
        eventTime,
        eventLink,
        discord,
        email,
        details,
    }), { expirationTtl: 86400 });

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'TEXIM ONE Bot',
                embeds: [{
                    title: 'New Convoy Invitation',
                    color: 0x1f6feb,
                    timestamp: new Date().toISOString(),
                    fields,
                    footer: { text: 'TEXIM ONE - Convoy Invites' },
                }],
                components: [{
                    type: 1,
                    components: [{
                        type: 2,
                        style: 5,
                        label: 'Review & Add to Calendar',
                        url: `${new URL(request.url).origin}/add-convoy?token=${token}`,
                    }],
                }],
            }),
        });

        if (!response.ok) return json({ success: false, message: 'Discord webhook error.' }, 502);

        return json({
            success: true,
            status: 'received',
            message: 'Invite received! We will DM you on Discord with our decision.',
        });
    } catch {
        return json({ success: false, message: 'Internal server error.' }, 500);
    }
}
