// Cloudflare Pages Function: GET /api/event-lookup
// Reads a TruckersMP event from the official API, with a web-host fallback.

const API_ENDPOINTS = [
    'https://api.truckersmp.com/v2/events',
    'https://truckersmp.com/api/v2/events',
];

const TMP_USER_AGENT = 'TEXIM-ONE-Website/1.0.0 (contact@teximone.com)';

function json(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store',
        },
    });
}

function clean(value) {
    return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

function extractId(input) {
    if (!input) return null;
    const value = String(input).trim();
    if (/^\d+$/.test(value)) return value;

    const match = value.match(/(?:https?:\/\/)?(?:www\.)?truckersmp\.com\/events?\/(\d+)(?:[-/?#].*)?$/i);
    return match ? match[1] : null;
}

function dateAndTime(value) {
    const raw = clean(value);
    if (!raw) return { date: '', time: '' };

    const match = raw.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);
    return {
        date: match?.[1] || '',
        time: match?.[2] || '',
    };
}

function normalizeEvent(event, requestedId) {
    if (!event || typeof event !== 'object') return null;

    const start = dateAndTime(event.start_at);
    const meetup = dateAndTime(event.meetup_at);
    const departure = event.departure || {};
    const arrival = event.arrive || {};
    const server = event.server || {};
    const vtc = event.vtc || {};
    const user = event.user || {};
    const attendance = event.attendances || {};

    return {
        id: event.id ?? requestedId,
        type: clean(event.event_type?.name || event.event_type?.key),
        name: clean(event.name),
        slug: clean(event.slug),
        game: clean(event.game),
        server: clean(server.name),
        serverId: server.id ?? null,
        language: clean(event.language),
        date: start.date,
        time: start.time,
        startAt: clean(event.start_at),
        meetupDate: meetup.date,
        meetupTime: meetup.time,
        meetupAt: clean(event.meetup_at),
        departure: clean(departure.city || departure.location),
        departureCity: clean(departure.city),
        departureLocation: clean(departure.location),
        arrival: clean(arrival.city || arrival.location),
        arrivalCity: clean(arrival.city),
        arrivalLocation: clean(arrival.location),
        route: [clean(departure.city || departure.location), clean(arrival.city || arrival.location)]
            .filter(Boolean)
            .join(' -> '),
        banner: clean(event.banner),
        map: clean(event.map),
        description: clean(event.description),
        rule: clean(event.rule),
        voiceLink: clean(event.voice_link),
        externalLink: clean(event.external_link),
        vtc: clean(vtc.name),
        vtcId: vtc.id ?? null,
        creator: clean(user.username),
        creatorId: user.id ?? null,
        attendance: {
            confirmed: attendance.confirmed ?? 0,
            unsure: attendance.unsure ?? 0,
            vtcs: attendance.vtcs ?? 0,
        },
        url: clean(event.url) || `https://truckersmp.com/events/${event.id ?? requestedId}`,
        createdAt: clean(event.created_at),
        updatedAt: clean(event.updated_at),
    };
}

async function requestEvent(endpoint, id, signal) {
    const response = await fetch(`${endpoint}/${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'User-Agent': TMP_USER_AGENT,
        },
        signal,
    });

    console.log(`[TruckersMP] GET event ${id}: HTTP ${response.status}`);
    if (response.status === 403) {
        console.error('[TruckersMP] HTTP 403 Forbidden. Check the User-Agent and API access requirements.');
    } else if (response.status === 200) {
        console.log('[TruckersMP] HTTP 200 OK. Event data received successfully.');
    }

    const rawText = await response.text();
    let data = null;
    try {
        data = rawText ? JSON.parse(rawText) : null;
    } catch (error) {
        console.error('[TruckersMP] Failed to parse JSON response:', error);
    }

    const apiMessage = clean(
        data?.descriptor ||
        (typeof data?.response === 'string' ? data.response : '')
    );

    if (!response.ok) {
        const error = new Error(apiMessage || `TruckersMP API returned HTTP ${response.status}`);
        error.status = response.status;
        throw error;
    }

    if (!data || data.error === true) {
        const error = new Error(apiMessage || 'TruckersMP API reported an error.');
        error.status = response.status || 502;
        throw error;
    }

    return normalizeEvent(data.response, id);
}

async function fetchOfficialEvent(id) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const errors = [];

    try {
        for (const endpoint of API_ENDPOINTS) {
            try {
                const event = await requestEvent(endpoint, id, controller.signal);
                if (event) {
                    return {
                        event,
                        source: endpoint.startsWith('https://api.')
                            ? 'truckersmp-api-v2'
                            : 'truckersmp-web-api-v2',
                    };
                }
            } catch (error) {
                if (error?.name === 'AbortError') throw error;
                errors.push(error);
                if (Number(error?.status) === 404) throw error;
            }
        }

        const lastError = errors.at(-1) || new Error('TruckersMP API request failed.');
        lastError.attempts = errors.map((error) => error?.message || 'Unknown error');
        throw lastError;
    } finally {
        clearTimeout(timeout);
    }
}

export async function onRequest(context) {
    if (context.request.method !== 'GET') {
        return json({ success: false, message: 'Method not allowed.' }, 405);
    }

    const requestUrl = new URL(context.request.url);
    const id = extractId(
        requestUrl.searchParams.get('id') || requestUrl.searchParams.get('url')
    );

    if (!id) {
        return json({
            success: false,
            message: 'Invalid TruckersMP event link. Use https://truckersmp.com/events/12345.',
        }, 400);
    }

    try {
        const result = await fetchOfficialEvent(id);
        const event = result.event;

        if (!event || !event.name || !event.date) {
            return json({
                success: false,
                message: 'TruckersMP returned incomplete event data for this event.',
            }, 502);
        }

        return json({
            success: true,
            source: result.source,
            event,
        });
    } catch (error) {
        if (error?.name === 'AbortError') {
            return json({
                success: false,
                message: 'TruckersMP took too long to respond. Please try again.',
            }, 504);
        }

        const upstreamStatus = Number(error?.status) || 502;
        const status = upstreamStatus === 404 ? 404 : 502;

        return json({
            success: false,
            message: status === 404
                ? 'This TruckersMP event could not be found.'
                : 'Could not read this TruckersMP event right now. Please try again in a moment.',
            ...(error?.message ? { details: error.message } : {}),
            ...(error?.attempts ? { attempts: error.attempts } : {}),
        }, status);
    }
}
