document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('newsGrid');
    const status = document.getElementById('newsStatus');
    const more = document.getElementById('newsMore');
    if (!grid) return;

    const t = (key, fallback) => (typeof window.t === 'function' && window.t(key)) || fallback;

    // Keep the page useful even if the Cloudflare Function / TruckersMP API is unavailable.
    const fallbackNews = [
        {
            id: 69793,
            title: 'TEXIM ONE THE ORIGINAL™ MONTHLY CONVOY #6',
            date: '2026-08-09',
            summary: 'On 8 August 2026 we took part in THE ORIGINAL Monthly Convoy #6.',
            image: 'https://i.ibb.co/MkfzQKw1/ets2-20260808-211431-00.png',
            url: 'https://truckersmp.com/vtc/74050/news/69793'
        },
        {
            id: 69383,
            title: 'TEXIM ONE Nova Group | Public Convoy #3',
            date: '2026-07-27',
            summary: 'On 25 July 2026 we joined Nova Group | Public Convoy #3.',
            image: 'https://i.ibb.co/Mx5wdgyP/ets2-20260725-223444-00.png',
            url: 'https://truckersmp.com/vtc/74050/news/69383'
        },
        {
            id: 68663,
            title: 'TEXIM ONE Vtc x TEXIM ONE Ltd MERCH!',
            date: '2026-06-28',
            summary: 'Our official merch collaboration with TEXIM ONE Ltd.',
            image: 'https://static.truckersmp.com/images/vtc/cover/texim-one.1767262417.jpg',
            url: 'https://truckersmp.com/vtc/74050/news/68663'
        }
    ];

    let allNews = [...fallbackNews];
    let visible = 6;

    function escapeHTML(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function formatDate(value) {
        if (!value) return '';
        const date = new Date(`${value}T12:00:00`);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleDateString(undefined, {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    }

    function render() {
        const items = allNews.slice(0, visible);
        grid.innerHTML = items.map((item) => `
            <article class="news-card">
                <div class="news-image-wrap">
                    <img src="${escapeHTML(item.image || 'https://static.truckersmp.com/images/vtc/cover/texim-one.1767262417.jpg')}" alt="${escapeHTML(item.title)}" class="news-image" loading="lazy" onerror="this.src='https://static.truckersmp.com/images/vtc/cover/texim-one.1767262417.jpg'">
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

    async function loadLiveNews() {
        try {
            const res = await fetch('/api/news', {
                method: 'GET',
                headers: { Accept: 'application/json' },
                cache: 'no-store'
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            if (!json || !json.success || !Array.isArray(json.news) || !json.news.length) {
                throw new Error('Invalid news response');
            }

            allNews = json.news;
            visible = 6;
            render();

            if (status) {
                status.textContent = json.live === false
                    ? t('media.news.fallback', 'Showing saved TEXIM ONE articles.')
                    : '';
            }
        } catch (error) {
            // Do not blank the page when the API fails. The saved articles are already rendered.
            allNews = [...fallbackNews];
            visible = 6;
            render();
            if (status) status.textContent = t('media.news.fallback', 'Showing saved TEXIM ONE articles.');
            console.warn('TEXIM ONE news API unavailable:', error);
        }
    }

    if (more) {
        more.addEventListener('click', () => {
            visible += 6;
            render();
        });
    }

    // Render immediately; the API can replace these with the complete archive afterward.
    render();
    loadLiveNews();
    document.addEventListener('texim:langchange', render);
});
