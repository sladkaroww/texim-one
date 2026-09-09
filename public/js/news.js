(() => {
  const grid = document.getElementById('newsGrid');
  if (!grid) return;

  const news = [
    {
      title: 'TEXIM ONE 🚛 THE ORIGINAL™ MONTHLY CONVOY #6',
      date: 'August 9, 2026',
      link: 'https://truckersmp.com/vtc/74050/news/69793',
      image: 'https://i.ibb.co/MkfzQKw1/ets2-20260808-211431-00.png',
    },
    {
      title: 'TEXIM ONE 🚚 Nova Group | Public Convoy #3',
      date: 'July 27, 2026',
      link: 'https://truckersmp.com/vtc/74050/news/69383',
      image: 'https://i.ibb.co/Mx5wdgyP/ets2-20260725-223444-00.png',
    },
    {
      title: 'TEXIM ONE 🚚 57. Monthly RSL-Event | May',
      date: 'June 1, 2026',
      link: 'https://truckersmp.com/vtc/74050/news/68060',
      image: 'https://i.ibb.co/VYyvW2ff/ets2-20260527-210444-00.png',
    },
    {
      title: 'TEXIM ONE 🎀 Pink Ribbon VTC – 4th Anniversary',
      date: 'May 16, 2026',
      link: 'https://truckersmp.com/vtc/74050/news/67582',
      image: 'https://i.ibb.co/chmtDvVz/ets2-20260515-220356-00.png',
    },
    {
      title: 'TEXIM ONE 🛞 Pink Ribbon VTC – March Convoy',
      date: 'March 16, 2026',
      link: 'https://truckersmp.com/vtc/74050/news/65704',
      image: 'https://i.ibb.co/j9rPBJcR/ets2-20260313-204900-00.png',
    },
  ];

  const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  grid.innerHTML = news.map((item) => `
    <article class="news-card">
      <a class="news-card-image-link" href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer" aria-label="Read ${escapeHtml(item.title)}">
        <img class="news-card-banner" src="${escapeHtml(item.image)}" alt="" loading="lazy" decoding="async">
      </a>
      <div class="news-card-content">
        <span class="news-card-date">${escapeHtml(item.date)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <a class="news-card-link" href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">Read article →</a>
      </div>
    </article>
  `).join('');
})();
