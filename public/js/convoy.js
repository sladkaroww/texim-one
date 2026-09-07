// Convoy page - static list copied from TEXIM ONE's TruckersMP attending events.
document.addEventListener('DOMContentLoaded', () => {
    const list = document.getElementById('calendar');
    if (!list) return;

    const events = [
        { name: 'NorthStar Group | Opening Convoy', url: 'https://truckersmp.com/events/34097', startAt: '2026-10-03T17:00:00', type: 'Convoy', game: 'ETS2', server: 'To be determined' },
        { name: '🎉 EGY-TRUCKERS X ARAB X ANATOLIA X PEAN X NEEDCC 🎉', url: 'https://truckersmp.com/events/34664', startAt: '2026-10-23T18:00:00', type: 'Convoy', game: 'ETS2', server: 'To be determined' },
        { name: 'Truck Club | October Convoy', url: 'https://truckersmp.com/events/35348', startAt: '2026-10-26T19:00:00', type: 'Convoy', game: 'ETS2', server: 'To be determined' },
        { name: '✨🎉 Moonlight Express | 1 Year Anniversary 🎉✨', url: 'https://truckersmp.com/events/34727', startAt: '2026-10-28T19:00:00', type: 'Convoy', game: 'ETS2', server: 'Event Server' },
        { name: 'Pink Ribbon VTC - November Convoy', url: 'https://truckersmp.com/events/35695', startAt: '2026-11-13T19:00:00', type: 'Convoy', game: 'ETS2', server: 'To be determined' },
        { name: 'The Real Ops Group 2YR Anniversary', url: 'https://truckersmp.com/events/35655', startAt: '2026-11-15T18:00:00', type: 'Convoy', game: 'ETS2', server: 'To be determined' },
        { name: 'Truck Club | November Convoy', url: 'https://truckersmp.com/events/35786', startAt: '2026-11-18T19:00:00', type: 'Convoy', game: 'ETS2', server: 'To be determined' },
        { name: '🟡 Nova Group | November Convoy', url: 'https://truckersmp.com/events/36372', startAt: '2026-11-19T17:30:00', type: 'Convoy', game: 'ETS2', server: 'To be determined' },
        { name: 'Pink Ribbon VTC - December Convoy', url: 'https://truckersmp.com/events/36101', startAt: '2026-12-04T19:00:00', type: 'Convoy', game: 'ETS2', server: 'To be determined' },
        { name: '🟡 Nova Group | December Convoy', url: 'https://truckersmp.com/events/37088', startAt: '2026-12-23T17:30:00', type: 'Convoy', game: 'ETS2', server: 'To be determined' },
        { name: '🟡 Nova Group | January Convoy', url: 'https://truckersmp.com/events/37318', startAt: '2027-01-05T17:30:00', type: 'Convoy', game: 'ETS2', server: 'To be determined' },
        { name: "Marking Event | New Year's Event 2027", url: 'https://truckersmp.com/events/36669', startAt: '2027-01-08T18:00:00', type: 'Convoy', game: 'ETS2', server: 'To be determined' },
        { name: 'Pink Ribbon VTC - January Convoy', url: 'https://truckersmp.com/events/36805', startAt: '2027-01-15T19:00:00', type: 'Convoy', game: 'ETS2', server: 'To be determined' },
        { name: 'Central Transport 4th Anniversary Convoy', url: 'https://truckersmp.com/events/37087', startAt: '2027-01-31T17:00:00', type: 'Convoy', game: 'ETS2', server: 'To be determined' },
        { name: 'Pink Ribbon VTC - February Convoy', url: 'https://truckersmp.com/events/37152', startAt: '2027-02-05T19:00:00', type: 'Convoy', game: 'ETS2', server: 'To be determined' }
    ];

    function load() {
        list.innerHTML = events.map(eventHTML).join('');
    }

    function eventHTML(e) {
        const start = new Date(e.startAt);
        const dateStr = start.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
        const timeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return `
            <div class="event-card">
                <div class="event-date">
                    <div class="event-day">${start.getDate()}</div>
                    <div class="event-month">${start.toLocaleString(undefined, { month: 'short' })}</div>
                    <div class="event-year">${start.getFullYear()}</div>
                </div>
                <div class="event-body">
                    <h3 class="event-title"><a href="${escapeHTML(e.url)}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none;">${escapeHTML(e.name)}</a></h3>
                    <div class="event-meta">
                        <span class="event-tag">${escapeHTML(e.type)}</span>
                        <span class="event-tag">${escapeHTML(e.game)}</span>
                        <span class="event-tag">${escapeHTML(e.server)}</span>
                    </div>
                    <p class="event-when">${dateStr} &middot; ${timeStr}</p>
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
    document.addEventListener('texim:langchange', load);
});
