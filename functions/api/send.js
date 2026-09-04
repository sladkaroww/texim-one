// Cloudflare Pages Function: POST /api/send
// Sends convoy invitations to Discord and gives admins a one-time calendar token.

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
        const mapped = events.map((e) => ({ id: e.id, name: e.name || 'Our Convoy', date: (e.startAt || e.start_at || '').slice(0, 10) }))
            .filter((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.date));
        return mapped.length ? mapped : FALLBACK_SCHEDULE;
    } catch { return FALLBACK_SCHEDULE; }
}
function json(body, status = 200) { return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }); }
function randomToken() { const bytes = new Uint8Array(32); crypto.getRandomValues(bytes); return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join(''); }

export async function onRequest(context) {
    const { request, env } = context;
    if (request.method !== 'POST') return json({ success: false, message: 'Method not allowed' }, 405);
    const webhookUrl = env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) return json({ success: false, message: 'Discord webhook is not configured.' }, 500);
    let data;
    try { data = await request.json(); } catch { return json({ success: false, message: 'Invalid JSON payload.' }, 400); }

    const eventName = (data.eventName || '').trim(), eventDate = (data.eventDate || '').trim(), eventTime = (data.eventTime || '').trim();
    const discord = (data.discord || '').trim(), email = (data.email || '').trim(), eventLink = (data.eventLink || '').trim(), details = (data.details || '').trim();
    if (!eventName || !eventDate || !discord) return json({ success: false, message: 'Please provide the convoy name, date and Discord.' }, 400);

    const schedule = await getOurSchedule(request);
    const conflict = schedule.find((e) => e.date === eventDate) || null;
    const status = conflict ? 'declined' : 'received';
    const fields = [
        { name: 'Convoy Name', value: eventName, inline: false }, { name: 'Date', value: eventDate, inline: true },
        { name: 'Start Time (UTC)', value: eventTime || 'N/A', inline: true }, { name: 'Invited by (Discord)', value: discord, inline: true },
        { name: 'Email', value: email || 'N/A', inline: false },
        conflict ? { name: 'Auto-Decision', value: `DECLINED — we already have a TEXIM ONE convoy on this date:\n**${conflict.name}** (${conflict.date}).`, inline: false }
            : { name: 'Auto-Decision', value: 'RECEIVED — no calendar conflict. Pending review; use the review button to approve it.', inline: false },
    ];
    if (eventLink) fields.push({ name: 'Convoy Link', value: eventLink, inline: false });
    if (details) fields.push({ name: 'Additional Details', value: details.slice(0, 1000), inline: false });

    let lookedUp = null;
    try { lookedUp = data.eventData ? JSON.parse(data.eventData) : null; } catch { lookedUp = null; }
    if (lookedUp?.route) fields.push({ name: 'Route', value: lookedUp.route, inline: false });
    if (lookedUp?.game) fields.push({ name: 'Game / Server', value: `${lookedUp.game}${lookedUp.server ? ' / ' + lookedUp.server : ''}`, inline: true });
    if (lookedUp?.vtc) fields.push({ name: 'Hosted by VTC', value: lookedUp.vtc, inline: true });

    const embed = { title: conflict ? 'Convoy Invitation — AUTO-DECLINED' : 'New Convoy Invitation', color: conflict ? 0xff0000 : 0x1f6feb, timestamp: new Date().toISOString(), fields, footer: { text: 'TEXIM ONE - Convoy Invites (calendar-checked)' }, ...(lookedUp?.banner ? { image: { url: lookedUp.banner } } : {}) };
    const components = [];
    if (!conflict && env.TEXIM_CALENDAR) {
        const token = randomToken();
        await env.TEXIM_CALENDAR.put(`invite-${token}`, JSON.stringify({ eventName, eventDate, eventTime, eventLink, discord, details }), { expirationTtl: 86400 });
        components.push({ type: 1, components: [{ type: 2, style: 5, label: 'Review & Add to Calendar', url: `${new URL(request.url).origin}/add-convoy?token=${token}` }] });
    }

    try {
        const response = await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'TEXIM ONE Bot', embeds: [embed], ...(components.length ? { components } : {}) }) });
        if (!response.ok) return json({ success: false, message: 'Discord webhook error.' }, 502);
        return json({ success: true, status, message: conflict ? 'Automatically declined: we already have a convoy on that date.' : 'Invite received! We will DM you on Discord with our decision.' });
    } catch (error) { return json({ success: false, message: 'Internal server error.', error: error.message }, 500); }
}
