// TEXIM ONE - TruckersMP event proxy (HTML scraper)
// The TruckersMP JSON API is blocked for server IPs by Cloudflare, but the
// public event *page* (HTML) is reachable. This proxy fetches the event page
// by id and parses the structured fields out of the HTML.
// Exposes: GET /api/event?id=<truckersmp event id>  ->  normalized JSON
// No external dependencies (Node built-ins only).

const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 3000;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

function decode(s) {
  return (s || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function stripHtml(s) {
  return decode((s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function match(re, html, group = 1) {
  const m = re.exec(html);
  return m ? decode(m[group]) : null;
}

function parseEvent(html, id) {
  const titleRaw = match(/<title>([\s\S]*?)<\/title>/i, html);
  const name = titleRaw
    ? titleRaw
        .replace(/\s*[-—]\s*Event\s*[-—]?\s*TruckersMP/i, '')
        .replace(/\s*[-—]\s*TruckersMP/i, '')
        .replace(/\s+/g, ' ')
        .trim()
    : '';
  const game = match(/title="Game"><\/i>\s*<b[^>]*>([^<]+)<\/b>/i, html);
  const eventType = match(/title="Event Type"><\/i>\s*<b[^>]*>([^<]+)<\/b>/i, html);
  const server = match(/title="Server"><\/i>\s*<b[^>]*>([^<]+)<\/b>/i, html);
  const organizer = match(/title="Organizer"><\/i>\s*<span[^>]*>\s*<a[^>]*>([^<]+)<\/a>/i, html);

  const rows = [...html.matchAll(/<th[^>]*>([\s\S]*?)<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>/gi)];
  const table = {};
  for (const r of rows) {
    const k = stripHtml(r[1]).toLowerCase();
    const v = stripHtml(r[2]);
    if (k) table[k] = v;
  }

  const meetupTime = table['meetup time'] || null;
  const location = table['location'] || null;
  const destination = table['destination'] || null;
  const language = table['main language'] || null;
  const communication = table['communication'] || null;
  const link = table['link'] || null;

  const route = [location, destination].filter(Boolean).join(' -> ');

  return {
    id: String(id),
    name: name || '',
    game: game || '',
    eventType: eventType || '',
    server: server || '',
    organizer: organizer || '',
    meetupTime: meetupTime || '',
    route,
    location: location || '',
    destination: destination || '',
    language: language || '',
    communication: communication || '',
    link: link || '',
    url: `https://truckersmp.com/events/${id}`,
    source: 'html',
  };
}

function fetchHtml(id) {
  return new Promise((resolve) => {
    const tryUrl = (url, depth) => {
      if (depth > 5) return resolve(null);
      const client = url.startsWith('https:') ? https : http;
      const req = client.get(
        url,
        { headers: { 'User-Agent': UA, Accept: 'text/html' } },
        (res) => {
          const redirected = [301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location;
          if (redirected) {
            res.resume();
            const next = new URL(res.headers.location, url).href;
            return tryUrl(next, depth + 1);
          }
          let data = '';
          res.setEncoding('utf8');
          res.on('data', (c) => (data += c));
          res.on('end', () => resolve(data));
        }
      );
      req.on('error', () => resolve(null));
      req.setTimeout(9000, () => {
        req.destroy();
        resolve(null);
      });
    };
    tryUrl(`https://truckersmp.com/events/${encodeURIComponent(id)}`, 0);
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;

  if (path === '/' || path === '/health') {
    res.writeHead(200);
    return res.end(JSON.stringify({ ok: true, ts: Date.now() }));
  }

  if (path === '/api/event') {
    const id = url.searchParams.get('id');
    if (!id || !/^\d+$/.test(id)) {
      res.writeHead(400);
      return res.end(JSON.stringify({ error: 'invalid event id' }));
    }
    const html = await fetchHtml(id);
    const challenged = !html || /just a moment/i.test(html) || /cf-chl/i.test(html) || /attention required/i.test(html);
    if (challenged) {
      res.writeHead(502);
      return res.end(JSON.stringify({ error: 'TruckersMP blocked the page fetch (Cloudflare challenge)' }));
    }
    const data = parseEvent(html, id);
    if (!data.name) {
      res.writeHead(502);
      return res.end(JSON.stringify({ error: 'could not parse event page' }));
    }
    res.writeHead(200);
    return res.end(JSON.stringify({ success: true, ...data }));
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'not found' }));
});

server.listen(PORT, () => console.log(`TEXIM event proxy listening on :${PORT}`));
