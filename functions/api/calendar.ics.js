// Cloudflare Pages Function: GET /api/calendar.ics
// Generates a live iCal (.ics) feed of all upcoming TEXIM ONE convoys.
// Subscribe to this URL in Google Calendar, Apple Calendar, or Outlook to
// automatically import upcoming convoys (stays in sync via the TMP API).

const VTC_ID = '74050';
const USER_AGENT = 'TEXIM-ONE-Site/1.0 (official website; via Cloudflare Pages)';

async function tmFetch(path) {
    try {
        const url = `https://api.truckersmp.com/v2/vtc/${VTC_ID}${path}`;
        const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
        if (!res.ok) return [];
        const json = await res.json().catch(() => null);
        if (!json || json.error) return [];
        return json.response || [];
    } catch {
        return [];
    }
}

function toDate(str) {
    return new Date(str.replace(' ', 'T') + 'Z');
}

function esc(text) {
    return String(text == null ? '' : text)
        .replace(/\\/g, '\\\\')
        .replace(/\n/g, '\\n')
        .replace(/,/g, '\\,')
        .replace(/;/g, '\\;');
}

function icalDate(d) {
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

// Pull convoys an admin saved from invite webhooks (stored in KV).
async function getKvConvoys(env) {
    if (!env || !env.TEXIM_CALENDAR) return [];
    try {
        const list = await env.TEXIM_CALENDAR.list();
        const out = [];
        for (const k of list.keys) {
            const v = await env.TEXIM_CALENDAR.get(k.name, { type: 'json' });
            if (!v) continue;
            out.push({
                id: v.id,
                name: v.name,
                start_at: `${v.date}T${(v.time || '00:00')}:00.000Z`,
                game: '',
                server: { name: 'Invited' },
                event_type: { name: 'Convoy' },
                departure: null,
            });
        }
        return out;
    } catch {
        return [];
    }
}

export async function onRequest(context) {
    const { env } = context;
    try {
        const [organized, attending] = await Promise.all([
            tmFetch('/events'),
            tmFetch('/events/attending')
        ]);

        // TruckersMP is behind Cloudflare's bot challenge, which can block the
        // Pages egress. Fall back to a static list when the live fetch is empty.
        const FALLBACK = [
            { id: 33929, name: '8yrs on the road with BVAR Trucking', start_at: '2026-08-22T18:00:00', game: 'ETS2', server: { name: 'Event Server' }, event_type: { name: 'Convoy' }, departure: { location: 'Slots', city: 'Tirana' } },
            { id: 34193, name: 'Truck Club | 4th Anniversary', start_at: '2026-08-27T19:00:00', game: 'ETS2', server: { name: 'Event Server' }, event_type: { name: 'Convoy' }, departure: { location: 'Slots', city: 'TruckersMP HQ' } },
            { id: 33621, name: 'EGY-TRUCKERS | AUGUST 2026', start_at: '2026-08-28T18:00:00', game: 'ETS2', server: { name: 'Event Server' }, event_type: { name: 'Convoy' }, departure: null },
            { id: 34536, name: 'Borry Logistics | 2 YEAR ANNIVERSARY', start_at: '2026-08-31T18:00:00', game: 'ETS2', server: { name: 'Event Server' }, event_type: { name: 'Truckfest And Convoy' }, departure: null },
            { id: 34976, name: 'Krone Liner | 3 Year Anniversary', start_at: '2026-09-06T18:00:00', game: 'ETS2', server: { name: 'Event Server' }, event_type: { name: 'Convoy' }, departure: null },
            { id: 34097, name: 'NorthStar Group | Opening Convoy', start_at: '2026-10-03T17:00:00', game: 'ETS2', server: { name: 'To be determined' }, event_type: { name: 'Convoy' }, departure: null },
        ];
        const source = (organized.length === 0 && attending.length === 0) ? FALLBACK : [...organized, ...attending];

        if (env && env.TEXIM_CALENDAR) {
            const kv = await getKvConvoys(env);
            if (kv.length) source.push(...kv);
        }

        const now = new Date();
        const seen = new Set();
        const events = [];

        source.forEach((e) => {
            if (!e.start_at || seen.has(e.id)) return;
            const start = toDate(e.start_at);
            if (start.getTime() < now.getTime() - 60 * 60 * 1000) return;
            seen.add(e.id);

            const duration = e.duration || 3 * 60 * 60 * 1000; // default 3h
            const end = new Date(start.getTime() + duration);

            const location = (e.departure && e.departure.location)
                ? [e.departure.location, e.departure.city].filter(Boolean).join(', ')
                : (e.server ? e.server.name : '');

            const details = `https://truckersmp.com/events/${e.id}`;
            const type = e.event_type ? e.event_type.name : 'Convoy';
            const serverName = e.server && typeof e.server === 'object' ? e.server.name : e.server;
            const desc = `Type: ${type}\\nGame: ${e.game}\\nServer: ${serverName}\\nDetails: ${details}`;

            events.push({ id: e.id, name: e.name, start, end, location, desc });
        });

        events.sort((a, b) => a.start - b.start);

        const lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//TEXIM ONE//Convoys//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'X-WR-CALNAME:TEXIM ONE Convoys',
            'X-WR-CALDESC:Upcoming TEXIM ONE trucking convoys'
        ];

        events.forEach((e) => {
            lines.push('BEGIN:VEVENT');
            lines.push(`UID:${VTC_ID}-${e.id}@teximone.org`);
            lines.push(`DTSTAMP:${icalDate(e.start)}`);
            lines.push(`DTSTART:${icalDate(e.start)}`);
            lines.push(`DTEND:${icalDate(e.end)}`);
            lines.push(`SUMMARY:${esc(e.name)}`);
            lines.push(`LOCATION:${esc(e.location)}`);
            lines.push(`DESCRIPTION:${esc(e.desc)}`);
            lines.push('END:VEVENT');
        });

        lines.push('END:VCALENDAR');

        return new Response(lines.join('\r\n') + '\r\n', {
            status: 200,
            headers: {
                'Content-Type': 'text/calendar; charset=utf-8',
                'Content-Disposition': 'attachment; filename="texim-one-convoys.ics"',
                'Cache-Control': 'public, max-age=300'
            }
        });
    } catch (error) {
        return new Response(
            'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//TEXIM ONE//Convoys//EN\r\nX-ERR:' + (error && error.message ? error.message : String(error)) + '\r\nEND:VCALENDAR\r\n',
            { status: 200, headers: { 'Content-Type': 'text/calendar; charset=utf-8' } }
        );
    }
}
