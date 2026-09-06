(function () {
  const form = document.getElementById('inviteForm');
  if (!form) return;

  const message = document.getElementById('formMessage');
  const t = (k, fallback) => (typeof window.t === 'function' && window.t(k)) || fallback;

  const linkInput = document.getElementById('eventLink');
  const eventDataInput = document.getElementById('eventData');
  const preview = document.getElementById('eventPreview');
  const previewBanner = document.getElementById('eventPreviewBanner');
  const previewName = document.getElementById('eventPreviewName');
  const previewMeta = document.getElementById('eventPreviewMeta');
  const previewStatus = document.getElementById('eventPreviewStatus');

  let lookupTimer = null;
  let lastId = null;
  let requestId = 0;

  function showPreviewStatus(text, isError) {
    if (!previewStatus) return;
    previewStatus.textContent = text || '';
    previewStatus.className = 'event-preview-status' + (isError ? ' event-preview-status--error' : '');
  }

  function renderPreview(event, loading = false) {
    if (!preview) return;
    preview.hidden = false;

    if (previewBanner) {
      if (event.banner) {
        previewBanner.src = event.banner;
        previewBanner.alt = t('invite.bannerAlt', 'TruckersMP event banner');
        previewBanner.hidden = false;
      } else {
        previewBanner.hidden = true;
        previewBanner.removeAttribute('src');
      }
    }

    if (previewName) {
      previewName.textContent = event.name || (loading ? 'Reading TruckersMP event…' : '');
    }

    if (previewMeta) {
      const parts = [];
      if (event.type) parts.push(event.type);
      if (event.game) parts.push(event.game);
      if (event.server) parts.push(event.server);
      if (event.date) parts.push(event.date);
      if (event.time) parts.push(`${event.time} UTC`);
      if (event.meetupDate && event.meetupTime) parts.push(`Meetup ${event.meetupDate} ${event.meetupTime} UTC`);
      if (event.route) parts.push(event.route);
      if (event.vtc) parts.push(`Hosted by ${event.vtc}`);
      if (event.attendance?.confirmed != null) parts.push(`${event.attendance.confirmed} confirmed`);
      previewMeta.textContent = parts.join(' • ');
    }
  }

  function eventIdFromLink(rawLink) {
    const link = (rawLink || '').trim();
    const match = link.match(/(?:https?:\/\/)?(?:www\.)?truckersmp\.com\/events?\/(\d+)/i);
    if (match) return match[1];
    if (/^\d+$/.test(link)) return link;
    return null;
  }

  async function lookupEvent(rawLink) {
    const id = eventIdFromLink(rawLink);
    if (!id) {
      lastId = null;
      requestId++;
      if (preview) preview.hidden = true;
      if (eventDataInput) eventDataInput.value = '';
      return;
    }
    if (id === lastId && eventDataInput?.value) return;

    const currentRequest = ++requestId;
    lastId = null;
    if (preview) preview.hidden = false;
    renderPreview({}, true);
    showPreviewStatus(t('invite.fetching', 'Reading event details from TruckersMP…'), false);

    try {
      const res = await fetch(`/api/event-lookup?id=${encodeURIComponent(id)}`, { cache: 'no-store' });
      const result = await res.json().catch(() => ({}));
      if (currentRequest !== requestId) return;

      const event = result?.event || null;
      if (!res.ok || !event) {
        lastId = null;
        renderPreview({}, false);
        showPreviewStatus(result?.message || t('invite.lookupError', 'Couldn’t read this event. Check the link.'), true);
        if (eventDataInput) eventDataInput.value = '';
        return;
      }

      const nameEl = document.getElementById('eventName');
      const dateEl = document.getElementById('eventDate');
      const timeEl = document.getElementById('eventTime');
      if (nameEl) nameEl.value = event.name || '';
      if (dateEl && event.date) dateEl.value = event.date;
      if (timeEl && event.time) timeEl.value = event.time;

      renderPreview(event);
      showPreviewStatus(t('invite.loaded', 'Event loaded automatically from TruckersMP.'), false);
      if (eventDataInput) eventDataInput.value = JSON.stringify(event);
      lastId = id;
    } catch {
      if (currentRequest !== requestId) return;
      lastId = null;
      renderPreview({}, false);
      showPreviewStatus(t('invite.lookupError', 'Couldn’t read this event. Check your connection or the link.'), true);
      if (eventDataInput) eventDataInput.value = '';
    }
  }

  if (linkInput) {
    linkInput.addEventListener('input', () => {
      clearTimeout(lookupTimer);
      const val = linkInput.value;
      if (!eventIdFromLink(val)) {
        lastId = null;
        requestId++;
        if (preview) preview.hidden = true;
        if (eventDataInput) eventDataInput.value = '';
        return;
      }
      lookupTimer = setTimeout(() => lookupEvent(val), 350);
    });

    linkInput.addEventListener('paste', () => {
      clearTimeout(lookupTimer);
      setTimeout(() => lookupEvent(linkInput.value), 100);
    });

    // Also supports a link already present after browser autofill/restore.
    if (eventIdFromLink(linkInput.value)) lookupEvent(linkInput.value);
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
        requestId++;
        if (preview) preview.hidden = true;
        if (eventDataInput) eventDataInput.value = '';
      } else {
        message.textContent = result?.message || result?.error || 'Something went wrong. Please try again.';
        message.classList.add('form-message--error');
      }
    } catch {
      message.textContent = 'Network error. Please try again.';
      message.classList.add('form-message--error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = original;
    }
  });
})();
