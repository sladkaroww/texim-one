(async () => {
  const grid = document.getElementById('newsGrid');
  const status = document.getElementById('newsStatus');
  const RSS_PROXY = '/api/vtc-news';

  if (!grid) return;

  const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const stripHtml = (value = '') => {
    const doc = new DOMParser().parseFromString(String(value), 'text/html');
    return (doc.body?.textContent || '').replace(/\s+/g, ' ').trim();
  };

  const firstText = (node, names) => {
    for (const name of names) {
      const match = node.querySelector(name);
      if (match?.textContent?.trim()) return match.textContent.trim();
    }
    return '';
  };

  const firstAttribute = (node, selectors, attribute) => {
    for (const selector of selectors) {
      const match = node.querySelector(selector);
      const value = match?.getAttribute(attribute);
      if (value) return value;
    }
    return '';
  };

  const extractImage = (html = '') => {
    const match = String(html).match(/<img[^>]+src=["']([^"']+)["']/i);
    return match?.[1] || '';
  };

  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  function parseFeed(xml) {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    if (doc.querySelector('parsererror')) throw new Error('The TruckersMP news feed could not be read.');

    const rssItems = [...doc.querySelectorAll('item')];
    const atomEntries = [...doc.querySelectorAll('entry')];
    const nodes = rssItems.length ? rssItems : atomEntries;

    return nodes.map((node) => {
      const isAtom = node.tagName.toLowerCase() === 'entry';
      const title = firstText(node, ['title']);
      const description = firstText(node, ['description', 'summary', 'content']);
      const content = firstText(node, ['content\\:encoded', 'content']) || description;
      const link = isAtom
        ? (node.querySelector('link[rel="alternate"]')?.getAttribute('href') || node.querySelector('link')?.getAttribute('href') || '')
        : firstText(node, ['link']);
      const date = firstText(node, ['pubDate', 'published', 'updated']);
      const image = firstAttribute(node, ['enclosure[type^="image/"]', 'media\\:content[type^="image/"]', 'media\\:thumbnail'], 'url') || extractImage(content);

      return {
        title: stripHtml(title),
        description: stripHtml(description),
        link,
        date,
        image,
      };
    }).filter((item) => item.title && item.link);
  }

  function render(items) {
    grid.innerHTML = items.length
      ? items.map((item) => {
          const excerpt = item.description.length > 180 ? `${item.description.slice(0, 177).trimEnd()}…` : item.description;
          const image = item.image || 'https://i.ibb.co/4n4FZpq4/viber-2025-03-10-09-33-32-746.jpg';
          return `<article class="db-card news-card">
            <img src="${escapeHtml(image)}" alt="" loading="lazy" style="width:100%;height:180px;object-fit:cover;border-radius:7px;margin-bottom:1rem">
            ${item.date ? `<span class="news-date">${escapeHtml(formatDate(item.date))}</span>` : ''}
            <h2>${escapeHtml(item.title)}</h2>
            ${excerpt ? `<p>${escapeHtml(excerpt)}</p>` : ''}
            <a class="btn btn-primary" href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">Read article</a>
          </article>`;
        }).join('')
      : '<div class="empty-state">No TEXIM ONE news has been published yet.</div>';

    if (status) status.textContent = '';
  }

  async function load() {
    const response = await fetch(RSS_PROXY, { headers: { Accept: 'application/rss+xml, application/xml, text/xml' } });
    if (!response.ok) throw new Error('Could not load the latest TEXIM ONE news.');
    const xml = await response.text();
    render(parseFeed(xml));
  }

  load().catch((error) => {
    grid.innerHTML = '<div class="empty-state">The latest news could not be loaded right now.</div>';
    if (status) status.textContent = error.message || 'Could not load news.';
  });
})();
