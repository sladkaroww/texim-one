document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('newsGrid');
    const status = document.getElementById('newsStatus');
    const more = document.getElementById('newsMore');
    if (!grid) return;

    const t = (key, fallback) => (typeof window.t === 'function' && window.t(key)) || fallback;
    let allNews = [];
    let visible = 6;

    function escapeHTML(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    function formatDate(value) {
        if (!value) return '';
        const date = new Date(`${value}T12:00:00`);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    function render() {
        const items = allNews.slice(0, visible);
        if (!items.length) {
            grid.innerHTML = `<div class="news-empty">${escapeHTML(t('media.news.none', 'No news articles found.'))}</div>`;
            if (more) more.hidden = true;
            return;
        }

        grid.innerHTML = items.map((item) => `
            <article class="news-card">
                <div class="news-image-wrap">
                    <img src="${escapeHTML(item.image || 'https://static.truckersmp.com/images/vtc/cover/texim-one.1767262417.jpg')}" alt="${escapeHTML(item.title)}" class="news-image" loading="lazy">
                </div>
                <div class="news-body">
                    <span class="news-date">${escapeHTML(formatDate(item.date))}</span>
                    <h3 class="news-title">${escapeHTML(item.title)}</h3>
                    ${item.summary ? `<p class="news-text">${escapeHTML(item.summary)}</p>` : ''}
                    <a href="${escapeHTML(item.url)}" class="btn btn-outline btn-sm" target="_blank" rel="noopener noreferrer">${escapeHTML(t('media.news.read', 'Read on TruckersMP'))}</a>
                </div>
            </article>
        `).join('');

        if (more) more.hidden = visible >= allNews.length;
    }

    async function load() {
        grid.innerHTML = `<div class="news-loading">${escapeHTML(t('media.news.loading', 'Loading TruckersMP news...'))}</div>`;
        if (status) status.textContent = '';
        try {
            const res = await fetch('/api/news', { headers: { Accept: 'application/json' } });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || 'Failed to load news');
            allNews = Array.isArray(json.news) ? json.news : [];
            visible = 6;
            render();
            if (status && json.live === false) status.textContent = t('media.news.fallback', 'TruckersMP is temporarily unavailable. Showing the latest saved articles.');
        } catch {
            grid.innerHTML = `<div class="news-empty">${escapeHTML(t('media.news.error', 'Could not load TruckersMP news right now.'))}</div>`;
            if (more) more.hidden = true;
        }
    }

    if (more) {
        more.addEventListener('click', () => {
            visible += 6;
            render();
        });
    }

    load();
    document.addEventListener('texim:langchange', render);
});
