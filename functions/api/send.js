// Cloudflare Pages Function: POST /api/send
// Forwards the convoy invitation form to a Discord webhook.
// The webhook URL is stored in the Cloudflare Pages environment variable:
//   DISCORD_WEBHOOK_URL

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ success: false, message: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const webhookUrl = env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
        return new Response(
            JSON.stringify({ success: false, message: 'Webhook URL is not configured. Please set the DISCORD_WEBHOOK_URL environment variable in Cloudflare Pages settings.' }),
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

    // Build the Discord embed
    const embed = {
        title: 'New Convoy Invitation',
        color: 0xff0000,
        timestamp: new Date().toISOString(),
        fields: [
            { name: 'Driver Name', value: data.name || 'N/A', inline: true },
            { name: 'Discord Tag', value: data.discord || 'N/A', inline: true },
            { name: 'Email', value: data.email || 'N/A', inline: false },
            { name: 'Convoy Name', value: data.convoyName || 'N/A', inline: false },
            { name: 'Preferred Date', value: data.date || 'N/A', inline: true },
            { name: 'Preferred Time (UTC)', value: data.time || 'N/A', inline: true },
            { name: 'Additional Details', value: data.details || 'No additional details provided.', inline: false }
        ],
        footer: { text: 'TEXIM ONE - Convoy Invites' }
    };

    const payload = JSON.stringify({
        username: 'TEXIM ONE Bot',
        embeds: [embed]
    });

    try {
        const discordResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload
        });

        if (!discordResponse.ok) {
            const errText = await discordResponse.text();
            return new Response(
                JSON.stringify({ success: false, message: 'Discord webhook error.', error: errText }),
                { status: 502, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({ success: true, message: 'Invitation sent successfully!' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ success: false, message: 'Internal server error.', error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
