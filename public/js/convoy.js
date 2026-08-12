// Convoy page - load live upcoming convoys from /api/events
document.addEventListener('DOMContentLoaded', () => {
    const list = document.getElementById('eventsList');
    if (!list) return;

    // Build calendar subscription links dynamically from the current domain
    const origin = window.location.origin;
    const webcalUrl = 'webcal://' + origin.replace(/^https?:\/\//, '') + '/api/calendar.ics';

    const googleCalBtn = document.getElementById('googleCalBtn');
    if (googleCalBtn) {
        googleCalBtn.href = 'https://www.google.com/calendar/render?cid=' + encodeURIComponent(webcalUrl);
    }
    const webcalBtn = document.getElementById('webcalBtn');
    if (webcalBtn) {
        webcalBtn.href = webcalUrl;
    }

    async function load() {
        try {
            const res = await fetch('/api/events');
            const json = await res.json();

            if (!json.success) {
                throw new Error(json.message || 'Failed to load events');
            }

            const events = json.events || [];

            if (events.length === 0) {
                list.innerHTML = '<div class="events-empty">' + window.t('convoy.none') + '</div>';
                return;
            }

            list.innerHTML = events.map(eventHTML).join('');
        } catch (err) {
            list.innerHTML = '<div class="events-empty">' + window.t('convoy.error') + '</div>';
        }
    }

    function eventHTML(e) {
        const start = new Date(e.startAt);
        const options = { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' };
        const dateStr = start.toLocaleDateString(undefined, options);
        const timeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const location = e.departure
            ? [e.departure.location, e.departure.city].filter(Boolean).join(', ')
            : 'Location TBA';

        return `
            <div class="event-card">
                <div class="event-date">
                    <div class="event-day">${start.getDate()}</div>
                    <div class="event-month">${start.toLocaleString(undefined, { month: 'short' })}</div>
                    <div class="event-year">${start.getFullYear()}</div>
                </div>
                <div class="event-body">
                    <h3 class="event-title">${escapeHTML(e.name)}</h3>
                    <div class="event-meta">
                        <span class="event-tag">${escapeHTML(e.type || 'Convoy')}</span>
                        <span class="event-tag">${escapeHTML(e.game)}</span>
                        ${e.server ? `<span class="event-tag">${escapeHTML(e.server)}</span>` : ''}
                    </div>
                    <p class="event-when">${dateStr} &middot; ${timeStr}</p>
                    ${location ? `<p class="event-where"><strong>${window.t('convoy.meet')}:</strong> ${escapeHTML(location)}</p>` : ''}
                    ${e.confirmed ? `<p class="event-count">${e.confirmed} confirmed</p>` : ''}
                    ${e.url ? `<a href="${escapeHTML(e.url)}" class="btn btn-outline btn-sm" target="_blank" rel="noopener">${window.t('convoy.view')}</a>` : ''}
                </div>
            </div>
        `;
    }

    function escapeHTML(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    load();

    // Re-render when the language changes
    document.addEventListener('texim:langchange', load);
});
