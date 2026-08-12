// Convoy invite form submission
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('inviteForm');
    const success = document.getElementById('formSuccess');
    const btnText = document.getElementById('btnText');
    const btnLoading = document.getElementById('btnLoading');
    const closeSuccess = document.getElementById('closeSuccess');

    if (!form) return;

    // --- Auto-fill from a pasted TruckersMP event link ---
    const eventLink = document.getElementById('event-link');
    const eventHint = document.getElementById('eventLinkHint');

    function extractEventId(value) {
        if (!value) return null;
        const match = value.match(/truckersmp\.com\/events\/(\d+)/i);
        return match ? match[1] : null;
    }

    async function fillFromEvent(value) {
        const id = extractEventId(value);
        if (!id) {
            if (eventHint) eventHint.textContent = window.t ? window.t('contact.eventLinkHint') : 'Paste a TruckersMP event link and the form fills in automatically.';
            return;
        }
        if (eventHint) eventHint.textContent = window.t ? window.t('contact.loadingEvent') : 'Loading event details...';

        try {
            const res = await fetch(`/api/event?id=${id}`);
            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                throw new Error('Could not read event data. Try again shortly.');
            }
            if (!data.success) throw new Error(data.message || 'Event not found');

            if (data.name) form.querySelector('#convoy-name').value = data.name;
            if (data.date) form.querySelector('#date').value = data.date;
            if (data.time) form.querySelector('#time').value = data.time;
            if (data.details) {
                const details = form.querySelector('#details');
                details.value = data.details;
            }
            if (eventHint) eventHint.textContent = window.t ? window.t('contact.eventLoaded') : 'Event details loaded — you can add extra info below.';
            // Reset any manual-entry hint from a previous failed lookup
            const cn = form.querySelector('#convoy-name');
            if (cn) cn.placeholder = cn.dataset.originalPlaceholder || cn.placeholder;
        } catch (err) {
            // External event blocked by TruckersMP / not in TEXIM ONE's list:
            // unlock manual entry and guide the user clearly.
            if (eventHint) {
                eventHint.textContent = window.t
                    ? window.t('contact.eventManual')
                    : 'Could not auto-fill this event — please enter the details manually below.';
            }
            const cn = form.querySelector('#convoy-name');
            if (cn) {
                if (!cn.dataset.originalPlaceholder) cn.dataset.originalPlaceholder = cn.placeholder;
                cn.placeholder = window.t ? window.t('contact.manualPlaceholder') : 'Enter Convoy Name Manually...';
            }
            ['#date', '#time'].forEach((sel) => {
                const f = form.querySelector(sel);
                if (f) f.readOnly = false;
            });
        }
    }

    if (eventLink) {
        eventLink.addEventListener('input', (e) => fillFromEvent(e.target.value));
        eventLink.addEventListener('blur', (e) => fillFromEvent(e.target.value));
    }

    // Re-run fill if language changes after the page loads
    document.addEventListener('texim:langchange', () => {
        if (eventHint && eventLink && eventLink.value.trim()) {
            const id = extractEventId(eventLink.value);
            if (id) eventHint.textContent = window.t('contact.eventLoaded');
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
