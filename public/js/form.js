(function () {
  const form = document.getElementById('inviteForm');
  if (!form) return;

  const message = document.getElementById('formMessage');

  // --- TruckersMP event auto-fill ---
  // When someone pastes a truckersmp.com/events/XXXX link, fetch the event via
  // our /api/event-lookup proxy and auto-fill name/date/time + show a preview.
  const t = (k, fallback) => (typeof window.t === 'function' && window.t(k)) || fallback;

  const linkInput = document.getElementById('eventLink');
  const eventDataInput = document.getElementById('eventData');
  const preview = document.getElementById('eventPreview');
  const previewBanner = document.getElementById('eventPreviewBanner');
  const previewName = document.getElementById('eventPreviewName');
  const previewStatus = document.getElementById('eventPreviewStatus');

  let lookupTimer = null;
  let lastId = null;

  function showPreviewStatus(text, isError) {
    previewStatus.textContent = text || '';
    previewStatus.className = 'event-preview-status' + (isError ? ' event-preview-status--error' : '');
  }

  function renderPreview(event) {
    if (event.banner) {
      previewBanner.src = event.banner;
      previewBanner.alt = t('invite.bannerAlt', 'Event banner');
      previewBanner.hidden = false;
    } else {
      previewBanner.hidden = true;
    }
    previewName.textContent = event.name || '';
    showPreviewStatus('', false);
  }

  async function lookupEvent(rawLink) {
    const link = (rawLink || '').trim();
    const m = link.match(/truckersmp\.com\/events\/(\d+)/i) || (/^\d+$/.test(link) ? [null, link] : null);
    if (!m) {
      preview.hidden = true;
      eventDataInput.value = '';
      return;
    }
    const id = m[1];
    if (id === lastId) return; // already loaded this one
    lastId = id;

    preview.hidden = false;
    showPreviewStatus(t('invite.fetching', 'Loading event details...'), false);

    try {
      const res = await fetch(`/api/event-lookup?id=${encodeURIComponent(id)}`);
      const result = await res.json().catch(() => ({}));
      const event = (result && result.event) || null;
      if (!res.ok || !event) {
        previewName.textContent = '';
        renderPreview({ banner: '', name: '' });
        showPreviewStatus(t('invite.lookupError', "Couldn't load this event. Check the link or fill in the fields manually."), true);
        eventDataInput.value = '';
        return;
      }
      // Auto-fill only empty fields — never overwrite something the user typed.
      const nameEl = document.getElementById('eventName');
      const dateEl = document.getElementById('eventDate');
      const timeEl = document.getElementById('eventTime');
      if (nameEl && !nameEl.value.trim()) nameEl.value = event.name || '';
      if (dateEl && !dateEl.value.trim() && event.date) dateEl.value = event.date;
      if (timeEl && !timeEl.value.trim() && event.time) timeEl.value = event.time;
      renderPreview(event);
      // Persist for the Discord embed (banner + route enrichment).
      eventDataInput.value = JSON.stringify(event);
    } catch {
      renderPreview({ banner: '', name: '' });
      showPreviewStatus(t('invite.lookupError', "Couldn't load this event. Check the link or fill in the fields manually."), true);
      eventDataInput.value = '';
    }
  }

  if (linkInput) {
    linkInput.addEventListener('input', () => {
      clearTimeout(lookupTimer);
      const val = linkInput.value;
      // Reset cache if the user cleared/changed to a different link entirely.
      if (!val.trim() || !/truckersmp\.com\/events\/\d+/i.test(val)) {
        lastId = null;
        preview.hidden = true;
        eventDataInput.value = '';
      }
      lookupTimer = setTimeout(() => lookupEvent(val), 700);
    });
    linkInput.addEventListener('paste', () => {
      clearTimeout(lookupTimer);
      setTimeout(() => lookupEvent(linkInput.value), 150);
    });
  }

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
        lastId = null;
        if (preview) preview.hidden = true;
        if (eventDataInput) eventDataInput.value = '';
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
