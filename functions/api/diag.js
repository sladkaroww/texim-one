export async function onRequest(context) {
    const { env } = context;
    const proxyUrl = env.TMP_PROXY_URL;
    const out = { hasProxyVar: !!proxyUrl };
    if (proxyUrl) {
        try {
            const ctrl = new AbortController();
            const t = setTimeout(() => ctrl.abort(), 8000);
            const r = await fetch(`${proxyUrl.replace(/\/+$/, '')}/health`, { signal: ctrl.signal });
            clearTimeout(t);
            out.proxyHealth = r.status;
        } catch (e) {
            out.proxyError = String(e);
        }
    }
    return new Response(JSON.stringify(out, null, 2), {
        status: 200,
        headers: { 'content-type': 'application/json' },
    });
}
