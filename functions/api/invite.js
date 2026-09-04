// Cloudflare Pages Function: GET /api/invite
// Returns a pending invite by its short-lived, single-use capability token.
export async function onRequest(context) {
    const { request, env } = context;
    if (request.method !== 'GET') return json({ success: false, message: 'Method not allowed' }, 405);
    if (!env.TEXIM_CALENDAR) return json({ success: false, message: 'Calendar storage is not configured.' }, 500);
    const token = new URL(request.url).searchParams.get('token') || '';
    if (!/^[a-f0-9]{64}$/i.test(token)) return json({ success: false, message: 'Invalid invitation token.' }, 403);
    const invite = await env.TEXIM_CALENDAR.get(`invite-${token}`, { type: 'json' });
    if (!invite) return json({ success: false, message: 'This invitation has expired or was already used.' }, 410);
    return json({ success: true, invite });
}
function json(body, status = 200) { return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }); }
