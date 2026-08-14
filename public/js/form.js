(function () {
  const form = document.getElementById('inviteForm');
  if (!form) return;

  const message = document.getElementById('formMessage');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    message.textContent = '';
    message.className = 'form-message';

    const submitBtn = form.querySelector('button[type="submit"]');
    const original = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '...';

    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json().catch(() => ({}));
      if (res.ok) {
        message.textContent = typeof window.t === 'function' && window.t('form.success') ? window.t('form.success') : 'Invite sent successfully!';
        message.classList.add('form-message--success');
        form.reset();
      } else {
        message.textContent = (result && result.error) || 'Something went wrong. Please try again.';
        message.classList.add('form-message--error');
      }
    } catch (err) {
      message.textContent = 'Network error. Please try again.';
      message.classList.add('form-message--error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = original;
    }
  });
})();
