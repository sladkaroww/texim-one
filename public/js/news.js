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

  function parseFeed(xml) {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    if (doc.querySelector('parsererror')) throw new Error('The TruckersMP news feed could not be read.');

    const rssItems = [...doc.querySelectorAll('item')];
    const atomEntries = [...doc.querySelectorAll('entry')];
    const nodes = rssItems.length ? rssItems : atomEntries;

    return nodes.map((node) => {
      const isAtom = node.tagName.toLowerCase() === 'entry';
      const title = firstText(node, ['title']);
      const content = firstText(node, ['content\\:encoded', 'description', 'summary', 'content']);
      const link = isAtom
        ? (node.querySelector('link[rel="alternate"]')?.getAttribute('href') || node.querySelector('link')?.getAttribute('href') || '')
        : firstText(node, ['link']);
      const image = firstAttribute(node, ['enclosure[type^="image/"]', 'media\\:content[type^="image/"]', 'media\\:thumbnail'], 'url') || extractImage(content);

      return {
        title: title.replace(/\s+/g, ' ').trim(),
        link,
        image,
      };
    }).filter((item) => item.title && item.link);
  }

  function render(items) {
    grid.innerHTML = items.length
      ? items.map((item) => {
          const image = item.image || 'https://i.ibb.co/4n4FZpq4/viber-2025-03-10-09-33-32-746.jpg';
          return `<article class="news-card">
            <img class="news-card-banner" src="${escapeHtml(image)}" alt="" loading="lazy">
            <div class="news-card-content">
              <h3>${escapeHtml(item.title)}</h3>
              <a class="news-card-link" href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">Read article →</a>
            </div>
          </article>`;
        }).join('')
      : '<div class="empty-state">No TEXIM ONE news has been published yet.</div>';

    if (status) status.textContent = '';
  }

  async function load() {
    const response = await fetch(RSS_PROXY, { headers: { Accept: 'application/rss+xml, application/xml, text/xml' } });
    if (!response.ok) throw new Error('Could not load the latest TEXIM ONE news.');
    render(parseFeed(await response.text()));
  }

  const style = document.createElement('style');
  style.textContent = `
    #newsGrid.news-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:1.25rem; }
    #newsGrid .news-card { background:#fff; border:1px solid #e3e8e8; border-radius:10px; overflow:hidden; box-shadow:0 4px 14px rgba(0,0,0,.05); transition:transform .2s ease, box-shadow .2s ease; }
    #newsGrid .news-card:hover { transform:translateY(-3px); box-shadow:0 8px 22px rgba(0,0,0,.08); }
    #newsGrid .news-card-banner { width:100%; aspect-ratio:16/9; object-fit:cover; display:block; background:#e9e9eb; }
    #newsGrid .news-card-content { padding:1rem; }
    #newsGrid .news-card h3 { font-family:'Orbitron',sans-serif; font-size:.95rem; line-height:1.4; margin:0 0 .8rem; color:#111; }
    #newsGrid .news-card-link { font-size:.85rem; font-weight:600; color:#111; }
    #newsGrid .news-card-link:hover { text-decoration:underline; }
    @media (max-width:900px) { #newsGrid.news-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
    @media (max-width:600px) { #newsGrid.news-grid { grid-template-columns:1fr; } }
  `;
  document.head.appendChild(style);

  load().catch((error) => {
    grid.innerHTML = '<div class="empty-state">The latest news could not be loaded right now.</div>';
    if (status) status.textContent = error.message || 'Could not load news.';
  });
})();