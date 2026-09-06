// Cloudflare Pages Function: GET /api/event-lookup
// Reads a TruckersMP event directly from the official TruckersMP Web API v2.

const API_BASE = 'https://api.truckersmp.com/v2';

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

    // TruckersMP event URLs can contain a slug after the numeric ID.
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

async function fetchOfficialEvent(id) {
    const endpoint = `${API_BASE}/events/${encodeURIComponent(id)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
        // The official OpenAPI specification exposes this endpoint without an
        // API-key requirement. Keep the request minimal so Cloudflare's
        // Workers fetch runtime does not have to emulate a browser.
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: { Accept: 'application/json' },
            signal: controller.signal,
        });

        const rawText = await response.text();
        let data = null;
        try {
            data = rawText ? JSON.parse(rawText) : null;
        } catch {
            data = null;
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
        const event = await fetchOfficialEvent(id);

        if (!event || !event.name || !event.date) {
            return json({
                success: false,
                message: 'TruckersMP returned incomplete event data for this event.',
            }, 502);
        }

        return json({
            success: true,
            source: 'truckersmp-api-v2',
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
        }, status);
    }
}
