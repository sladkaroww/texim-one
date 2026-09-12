// functions/api/convoy/resolve.js
// Cloudflare Pages Function for resolving a TruckersMP event and its optional slots.

const TMP_BASE = 'https://api.truckersmp.com/v2';
const TMP_USER_AGENT = 'TEXIM-ONE-Website/1.0.0 (sladkaroww@gmail.com)';

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...extraHeaders,
    },
  });
}

function extractEventIdFromUrl(url) {
  const match = url.match(/\/events?\/(\d+)/i);
  if (!match) throw new Error('Invalid TruckersMP event URL');
  return match[1];
}

async function fetchTruckersMP(path) {
  const response = await fetch(`${TMP_BASE}${path}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'User-Agent': TMP_USER_AGENT,
    },
  });

  console.log(`[TruckersMP] GET ${path}: HTTP ${response.status}`);
  if (response.status === 403) {
    console.error('[TruckersMP] HTTP 403 Forbidden. Check the User-Agent and API access requirements.');
  } else if (response.status === 200) {
    console.log('[TruckersMP] HTTP 200 OK.');
  }

  const rawText = await response.text();
  let data = null;
  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch (error) {
    console.error('[TruckersMP] Failed to parse JSON response:', error);
  }

  return { response, data };
}

export async function onRequestPost({ request }) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return json({ error: 'Content-Type must be application/json' }, 400);
    }

    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return json({ error: 'Missing or invalid "url" field' }, 400);
    }

    const eventId = extractEventIdFromUrl(url);
    const { response: eventRes, data: eventJson } = await fetchTruckersMP(`/events/${eventId}`);

    if (!eventRes.ok || !eventJson || eventJson.error) {
      const status = eventRes.status === 403 ? 502 : (eventRes.status === 404 ? 404 : 502);
      return json({
        error: 'Event not found or API error',
        status: eventRes.status,
        details: eventJson,
      }, status);
    }

    let slots = null;
    try {
      const { response: slotsRes, data: slotsJson } = await fetchTruckersMP(`/events/${eventId}/slots`);
      if (slotsRes.ok && slotsJson && !slotsJson.error) {
        slots = slotsJson.response;
      }
    } catch (error) {
      console.error('[TruckersMP] Slots request failed:', error);
    }

    return json({
      event: eventJson.response,
      slots,
    }, 200, {
      'Access-Control-Allow-Origin': '*',
    });
  } catch (err) {
    console.error('[TruckersMP] Convoy resolve error:', err);
    return json({
      error: 'Internal error',
      message: err?.message || 'Unknown error',
    }, 500, {
      'Access-Control-Allow-Origin': '*',
    });
  }
}
