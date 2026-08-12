// Convoy invite form submission
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('inviteForm');
    const success = document.getElementById('formSuccess');
    const btnText = document.getElementById('btnText');
    const btnLoading = document.getElementById('btnLoading');
    const closeSuccess = document.getElementById('closeSuccess');

    if (!form) return;

    // --- Auto-fill from TEXIM ONE's convoy list (reachable from Cloudflare) ---
    const eventLink = document.getElementById('event-link');
    const eventHint = document.getElementById('eventLinkHint');
    const convoySelect = document.getElementById('convoy-select');

    let convoyList = [];
    const convoyById = new Map();

    function t(key, fallback) {
        return (window.t && typeof window.t === 'function') ? window.t(key) : fallback;
    }

    function setHint(kind) {
        if (!eventHint) return;
        const map = {
            reset: t('contact.eventLinkHint', 'Pick a convoy from the list above, or paste a link to one of our events to auto-fill.'),
            loaded: t('contact.eventLoaded', 'Event details loaded — you can add extra info below.')
        };
        eventHint.textContent = map[kind] || map.reset;
    }

    function fillForm(c) {
        if (!c || !c.startAt) return;
        const start = new Date(c.startAt);
        const date = start.toISOString().slice(0, 10);
        const time = start.toISOString().slice(11, 16);
        const dep = c.departure ? `${c.departure.city || ''}${c.departure.location ? ' (' + c.departure.location + ')' : ''}`.trim() : '';
        const arr = c.arrive ? `${c.arrive.city || ''}${c.arrive.location ? ' (' + c.arrive.location + ')' : ''}`.trim() : '';
        const route = [dep, arr].filter(Boolean).join(' → ');
        const details = [
            c.game ? `Game: ${c.game}` : '',
            c.server ? `Server: ${c.server}` : '',
            route ? `Route: ${route}` : '',
            `Start: ${c.startAt.replace('T', ' ').replace('.000Z', '')} UTC`
        ].filter(Boolean).join('\n');

        form.querySelector('#convoy-name').value = c.name || '';
        form.querySelector('#date').value = date;
        form.querySelector('#time').value = time;
        form.querySelector('#details').value = details;
    }

    function extractEventId(value) {
        if (!value) return null;
        const match = value.match(/truckersmp\.com\/events\/(\d+)/i);
        return match ? match[1] : null;
    }

    function buildOptions() {
        if (!convoySelect) return;
        convoySelect.innerHTML = '<option value="">— ' + t('contact.pickConvoy', 'Select a convoy') + ' —</option>';
        convoyList.forEach((c) => {
            const d = new Date(c.startAt);
            const opt = document.createElement('option');
            opt.value = String(c.id);
            opt.textContent = `${d.toLocaleDateString()} — ${c.name}`;
            convoySelect.appendChild(opt);
        });
    }

    async function loadConvoyList() {
        try {
            const res = await fetch('/api/events');
            const json = await res.json();
            convoyList = (json.events || []).filter((e) => e.startAt);
            convoyList.forEach((c) => convoyById.set(String(c.id), c));
            buildOptions();
        } catch {
            // leave the dropdown empty; manual entry still works
        }
    }

    if (convoySelect) {
        convoySelect.addEventListener('change', (e) => {
            const c = convoyById.get(e.target.value);
            if (c) {
                fillForm(c);
                setHint('loaded');
            } else {
                setHint('reset');
            }
        });
    }

    if (eventLink) {
        eventLink.addEventListener('input', (e) => {
            const id = extractEventId(e.target.value);
            if (id && convoyById.get(id)) {
                convoySelect.value = id;
                fillForm(convoyById.get(id));
                setHint('loaded');
            } else {
                setHint('reset');
            }
        });
        eventLink.addEventListener('blur', (e) => {
            const id = extractEventId(e.target.value);
            if (id && convoyById.get(id)) {
                convoySelect.value = id;
                fillForm(convoyById.get(id));
                setHint('loaded');
            } else if (e.target.value.trim()) {
                setHint('reset');
            }
        });
    }

    loadConvoyList();

    // Rebuild options / refresh hint when the language changes
    document.addEventListener('texim:langchange', () => {
        if (convoyList.length) buildOptions();
        if (eventHint && eventLink && eventLink.value.trim()) {
            const id = extractEventId(eventLink.value);
            if (id && convoyById.get(id)) eventHint.textContent = window.t('contact.eventLoaded');
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Validate
        const required = ['name', 'discord', 'convoyName', 'date', 'time'];
        for (const field of required) {
            if (!data[field]) {
                alert('Please fill in all required fields.');
                return;
            }
        }

        // Show loading state
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline-block';

        try {
            const response = await fetch('/api/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to send invite. Please try again.');
            }

            const result = await response.json();

            if (result.success) {
                // Show success
                form.style.display = 'none';
                success.style.display = 'block';
                success.style.animation = 'fadeIn 0.5s ease';
            } else {
                throw new Error(result.message || 'Something went wrong.');
            }
        } catch (error) {
            alert(error.message);
        } finally {
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    });

    // Close success message and reset
    if (closeSuccess) {
        closeSuccess.addEventListener('click', () => {
            form.reset();
            form.style.display = 'grid';
            success.style.display = 'none';
        });
    }
});
