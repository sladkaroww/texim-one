// Cloudflare Pages Function: POST /api/add-convoy
// Stores a convoy invite (confirmed by a TEXIM ONE admin via the confirmation
// page) into the TEXIM_CALENDAR KV namespace, so it appears on the website
// calendar and in the .ics feed. Requires the TEXIM_CALENDAR KV binding.

function keyFor(d) {
    const m = (d.link || '').match(/truckersmp\.com\/events\/(\d+)/i);
    if (m) return 'convoy-' + m[1];
    const slug = (d.name || 'convoy')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    return 'convoy-' + (d.date || '0000') + '-' + slug;
}

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ success: false, message: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    let data;
    try {
        data = await request.json();
    } catch {
        return new Response(JSON.stringify({ success: false, message: 'Invalid JSON payload.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const name = (data.name || '').trim();
    const date = (data.date || '').trim();
    if (!name || !date) {
        return new Response(JSON.stringify({ success: false, message: 'Missing convoy name or date.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    if (!env.TEXIM_CALENDAR) {
        return new Response(
            JSON.stringify({ success: false, message: 'Calendar storage is not configured (TEXIM_CALENDAR KV missing).' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const m = (data.link || '').match(/truckersmp\.com\/events\/(\d+)/i);
    const id = m ? m[1] : keyFor(data).replace('convoy-', '');
    const record = {
        id,
        name,
        date,
        time: (data.time || '').trim(),
        link: (data.link || '').trim(),
        discord: (data.discord || '').trim(),
        details: (data.details || '').trim(),
        addedAt: new Date().toISOString(),
    };

    await env.TEXIM_CALENDAR.put(keyFor(data), JSON.stringify(record));

    return new Response(JSON.stringify({ success: true, message: 'Added to calendar.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
