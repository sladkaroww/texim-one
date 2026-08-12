// Cloudflare Pages Function: GET /api/calendar.ics
// Generates a live iCal (.ics) feed of all upcoming TEXIM ONE convoys.
// Subscribe to this URL in Google Calendar, Apple Calendar, or Outlook to
// automatically import upcoming convoys (stays in sync via the TMP API).

const VTC_ID = '74050';
const USER_AGENT = 'TEXIM-ONE-Site/1.0 (official website; via Cloudflare Pages)';

async function tmFetch(path) {
    const url = `https://api.truckersmp.com/v2/vtc/${VTC_ID}${path}`;
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) return [];
    const json = await res.json().catch(() => null);
    if (!json || json.error) return [];
    return json.response || [];
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

export async function onRequest() {
    try {
        const [organized, attending] = await Promise.all([
            tmFetch('/events'),
            tmFetch('/events/attending')
        ]);

        const now = new Date();
        const seen = new Set();
        const events = [];

        [...organized, ...attending].forEach((e) => {
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
            const desc = `Type: ${type}\\nGame: ${e.game}\\nServer: ${e.server}\\nDetails: ${details}`;

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
            'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//TEXIM ONE//Convoys//EN\r\nEND:VCALENDAR\r\n',
            { status: 200, headers: { 'Content-Type': 'text/calendar; charset=utf-8' } }
        );
    }
}
