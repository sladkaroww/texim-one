// Convoy invite form submission
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('inviteForm');
    const success = document.getElementById('formSuccess');
    const successTitle = document.getElementById('successTitle');
    const successText = document.getElementById('successText');
    const btnText = document.getElementById('btnText');
    const btnLoading = document.getElementById('btnLoading');
    const closeSuccess = document.getElementById('closeSuccess');

    if (!form) return;

    function t(key, fallback) {
        return (window.t && typeof window.t === 'function') ? window.t(key) : fallback;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Validate required fields
        const required = ['eventName', 'eventDate', 'discord'];
        for (const field of required) {
            if (!data[field] || !String(data[field]).trim()) {
                alert(t('contact.required', 'Please fill in all required fields (Convoy Name, Date, Email).'));
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
                if (result.status === 'declined') {
                    successTitle.textContent = t('contact.declinedTitle', 'Auto-Declined — Date Conflict');
                    successText.textContent = t('contact.declinedText', "We already have a TEXIM ONE convoy on that date, so this invite was automatically declined. We'll email you to confirm.");
                } else {
                    successTitle.textContent = t('contact.sent', 'Invite Sent!');
                    successText.textContent = t('contact.sentText', 'Your convoy invite has been sent. We will confirm attendance by email (or Discord).');
                }
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
