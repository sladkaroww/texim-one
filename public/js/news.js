(() => {
  const grid = document.getElementById('newsGrid');
  const status = document.getElementById('newsStatus');
  if (!grid || !status) return;

  const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const renderNews = (news) => {
    const visibleNews = news.slice(0, 6);
    const hiddenNews = news.slice(6);

    const renderCard = (item) => {
      const image = item.image
        ? `<img class="news-card-banner" src="${escapeHtml(item.image)}" alt="" loading="lazy" decoding="async">`
        : '';

      return `
        <article class="news-card">
          <a class="news-card-image-link" href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer" aria-label="Read ${escapeHtml(item.title)}">
            ${image}
          </a>
          <div class="news-card-content">
            <span class="news-card-date">${escapeHtml(formatDate(item.pubDate))}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <a class="news-card-link" href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">Read article →</a>
          </div>
        </article>
      `;
    };

    grid.innerHTML = visibleNews.map(renderCard).join('');

    if (hiddenNews.length > 0) {
      const more = document.createElement('div');
      more.className = 'news-more';
      more.style.cssText = 'display:flex;justify-content:center;margin-top:1.5rem;';
      more.innerHTML = '<button type="button" class="btn btn-primary news-more-button">Show more</button>';
      grid.after(more);

      more.querySelector('.news-more-button').addEventListener('click', () => {
        grid.insertAdjacentHTML('beforeend', hiddenNews.map(renderCard).join(''));
        more.remove();
      });
    }
  };

  const loadNews = async () => {
    status.textContent = 'Loading latest news…';

    try {
      const response = await fetch('/api/vtc-news', {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`News request failed with ${response.status}.`);

      const data = await response.json();
      if (!Array.isArray(data.items) || data.items.length === 0) {
        throw new Error('No news items were returned.');
      }

      renderNews(data.items);
      status.textContent = '';
    } catch (error) {
      grid.innerHTML = '';
      status.textContent = 'Latest news is temporarily unavailable. Please try again later.';
      console.error('Could not load TruckersMP news:', error);
    }
  };

  loadNews();
})();
