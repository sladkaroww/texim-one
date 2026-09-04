// Cloudflare Pages Function: POST /api/add-convoy
// Consumes a one-time invitation token and stores the approved convoy in KV.
function keyFor(d) {
    const m = (d.link || '').match(/truckersmp\.com\/events\/(\d+)/i);
    if (m) return 'convoy-' + m[1];
    const slug = (d.name || 'convoy').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return 'convoy-' + (d.date || '0000') + '-' + slug;
}
function json(body, status = 200) { return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }); }
export async function onRequest(context) {
    const { request, env } = context;
    if (request.method !== 'POST') return json({ success: false, message: 'Method not allowed' }, 405);
    if (!env.TEXIM_CALENDAR) return json({ success: false, message: 'Calendar storage is not configured.' }, 500);
    let data; try { data = await request.json(); } catch { return json({ success: false, message: 'Invalid JSON payload.' }, 400); }
    const token = String(data.token || '').trim();
    if (!/^[a-f0-9]{64}$/i.test(token)) return json({ success: false, message: 'Invalid or expired invitation token.' }, 403);
    const key = `invite-${token}`;
    const invite = await env.TEXIM_CALENDAR.get(key, { type: 'json' });
    if (!invite) return json({ success: false, message: 'This invitation has expired or was already used.' }, 410);
    const name = String(invite.eventName || '').trim(), date = String(invite.eventDate || '').trim();
    if (!name || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ success: false, message: 'Invalid invitation data.' }, 400);
    const conflict = await env.TEXIM_CALENDAR.get(`date-lock-${date}`);
    if (conflict) return json({ success: false, message: 'A TEXIM ONE convoy is already saved for this date.' }, 409);
    const record = {
        id: ((invite.eventLink || '').match(/truckersmp\.com\/events\/(\d+)/i) || [null, null])[1] || `${date}-${name}`,
        name, date, time: String(invite.eventTime || '').trim(), link: String(invite.eventLink || '').trim(),
        discord: String(invite.discord || '').trim(), details: String(invite.details || '').trim(), addedAt: new Date().toISOString(),
    };
    const recordKey = keyFor(record);
    await env.TEXIM_CALENDAR.put(recordKey, JSON.stringify(record));
    await env.TEXIM_CALENDAR.put(`date-lock-${date}`, JSON.stringify({ key: recordKey, addedAt: record.addedAt }));
    await env.TEXIM_CALENDAR.delete(key);
    return json({ success: true, message: 'Added to calendar.' });
}
