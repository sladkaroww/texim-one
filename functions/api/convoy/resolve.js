// functions/api/convoy/resolve.js
// Cloudflare Pages Functions have global fetch(), no need to import anything.

const TMP_BASE = 'https://api.truckersmp.com/v2';

function extractEventIdFromUrl(url) {
  // Supports:
  // https://truckersmp.com/event/12345
  // https://truckersmp.com/events/12345
  const match = url.match(/\/events?\/(\d+)/i);
  if (!match) {
    throw new Error('Invalid TruckersMP event URL');
  }
  return match[1];
}

export async function onRequestPost({ request }) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({ error: 'Content-Type must be application/json' }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid "url" field' }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }

    const eventId = extractEventIdFromUrl(url);

    const eventRes = await fetch(`${TMP_BASE}/events/${eventId}`);
    const eventJson = await eventRes.json();

    if (!eventRes.ok || eventJson.error) {
      return new Response(
        JSON.stringify({
          error: 'Event not found or API error',
          details: eventJson,
        }),
        { status: 404, headers: { 'content-type': 'application/json' } }
      );
    }

    // Optionally fetch slots
    let slots = null;
    try {
      const slotsRes = await fetch(`${TMP_BASE}/events/${eventId}/slots`);
      if (slotsRes.ok) {
        const slotsJson = await slotsRes.json();
        if (!slotsJson.error) {
          slots = slotsJson.response;
        }
      }
    } catch {
      // ignore slots errors
    }

    const data = {
      event: eventJson.response,
      slots,
    };

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Internal error', message: err.message }),
      {
        status: 500,
        headers: {
          'content-type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
