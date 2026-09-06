// Cloudflare Pages Function: GET /api/event-lookup
// Reads a TruckersMP event directly from the official TruckersMP Web API.

const API_BASE = 'https://api.truckersmp.com/v2';

function extractId(input) {
    if (!input) return null;
    const value = String(input).trim();
    if (/^\d+$/.test(value)) return value;

    const match = value.match(/(?:https?:\/\/)?(?:www\.)?truckersmp\.com\/events\/(\d+)/i);
    return match ? match[1] : null;
}

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

function dateAndTime(value) {
    const raw = clean(value);
    if (!raw) return { date: '', time: '' };

    // TruckersMP documents event times as UTC. Keep the API's date/time
    // rather than converting it to the visitor's local timezone.
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
    const attendance = event.attendances || {};

    return {
        id: event.id ?? requestedId,
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
        route: [clean(departure.city), clean(arrival.city)].filter(Boolean).join(' -> '),

        banner: clean(event.banner),
        map: clean(event.map),
        description: clean(event.description),
        rule: clean(event.rule),
        voiceLink: clean(event.voice_link),
        externalLink: clean(event.external_link),

        vtc: clean(vtc.name),
        vtcId: vtc.id ?? null,
        creator: clean(event.user?.username),
        creatorId: event.user?.id ?? null,

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
    const response = await fetch(`${API_BASE}/events/${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'User-Agent': 'TEXIM-ONE/1.0 (+https://vtc.texim.one)',
        },
        cf: {
            cacheTtl: 0,
            cacheEverything: false,
        },
    });

    let data = null;
    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        const message = clean(data?.descriptor || data?.response);
        const error = new Error(message || `TruckersMP API returned HTTP ${response.status}`);
        error.status = response.status;
        throw error;
    }

    if (data?.error === true) {
        const error = new Error(clean(data?.descriptor || data?.response) || 'TruckersMP API reported an error.');
        error.status = 502;
        throw error;
    }

    return normalizeEvent(data?.response, id);
}

export async function onRequest(context) {
    const requestUrl = new URL(context.request.url);
    const id = extractId(requestUrl.searchParams.get('id') || requestUrl.searchParams.get('url'));

    if (!id) {
        return json({
            success: false,
            message: 'Invalid TruckersMP event link.',
        }, 400);
    }

    try {
        const event = await fetchOfficialEvent(id);

        if (!event || !event.name) {
            return json({
                success: false,
                message: 'TruckersMP returned no event data for this event ID.',
            }, 404);
        }

        return json({
            success: true,
            source: 'truckersmp-api-v2',
            event,
        });
    } catch (error) {
        const status = Number(error?.status) === 404 ? 404 : 502;
        return json({
            success: false,
            message: status === 404
                ? 'This TruckersMP event could not be found.'
                : 'Could not reach the official TruckersMP API. Please try again in a moment.',
        }, status);
    }
}
