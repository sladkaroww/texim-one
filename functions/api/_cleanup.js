export async function onRequest(context) {
    const { env } = context;
    if (!env.TEXIM_CALENDAR) return new Response('no kv', { status: 500 });
    await env.TEXIM_CALENDAR.delete('convoy-88888');
    return new Response('deleted test convoy', { status: 200 });
}
