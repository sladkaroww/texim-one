// Convoy invite form submission
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('inviteForm');
    const success = document.getElementById('formSuccess');
    const btnText = document.getElementById('btnText');
    const btnLoading = document.getElementById('btnLoading');
    const closeSuccess = document.getElementById('closeSuccess');

    if (!form) return;

    // --- Auto-fill the convoy name from a pasted TruckersMP link ---
    // Full auto-fill via the TruckersMP API is blocked from our host by
    // Cloudflare's bot challenge, so we parse the event name out of the URL
    // slug (e.g. .../events/34097-northstar-group-opening-convoy). No network
    // request, so it can never be blocked. Date/time/details stay manual.
    const eventLink = document.getElementById('event-link');
    const eventHint = document.getElementById('eventLinkHint');
    const eventNameInput = form.querySelector('#event-name');
    const eventIdInput = form.querySelector('#event-id');

    function t(key, fallback) {
        return (window.t && typeof window.t === 'function') ? window.t(key) : fallback;
    }

    function titleCase(str) {
        return str.replace(/\b\w/g, (c) => c.toUpperCase());
    }

    function applyLink(value) {
        if (!value) return;
        const idMatch = value.match(/truckersmp\.com\/events\/(\d+)/i);
        const id = idMatch ? idMatch[1] : null;
        if (eventIdInput) eventIdInput.value = id || '';

        const slugMatch = value.match(/truckersmp\.com\/events\/\d+-([^/?#]+)/i);
        if (slugMatch && eventNameInput && !eventNameInput.value.trim()) {
            eventNameInput.value = titleCase(slugMatch[1].replace(/[-_|]+/g, ' ').trim());
        }

        if (eventHint) {
            eventHint.textContent = id
                ? t('contact.eventLinkHint', 'We picked up the convoy name from your link. Add the date, time and any details below.')
                : t('contact.eventLinkHint', 'Paste a TruckersMP convoy link (e.g. https://truckersmp.com/events/34097) so we can pick up the name.');
        }
    }

    if (eventLink) {
        eventLink.addEventListener('input', (e) => applyLink(e.target.value));
        eventLink.addEventListener('blur', (e) => applyLink(e.target.value));
    }

    document.addEventListener('texim:langchange', () => {
        if (eventHint && eventLink && eventLink.value.trim()) applyLink(eventLink.value);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Validate
        const required = ['name', 'discord'];
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
