// TEXIM ONE - TruckersMP event proxy
// Deployed on a NON-Cloudflare host (Render / Railway / Fly / Vercel) so it can
// reach the TruckersMP API, which blocks requests coming from Cloudflare Pages.
// Exposes: GET /api/event?id=<truckersmp event id>  ->  normalized JSON
// No external dependencies (uses Node's built-in http + global fetch, Node 18+).

const http = require('http');

const PORT = process.env.PORT || 3000;

function normalize(e) {
  if (!e || !e.id) return null;
  const start = new Date(e.startAt || e.start_at);
  const dep = e.departure || null;
  const arr = e.arrive || null;
  const depCity = dep ? [dep.city, dep.location].filter(Boolean).join(' ') : '';
  const arrCity = arr ? [arr.city, arr.location].filter(Boolean).join(' ') : '';
  const route = [depCity, arrCity].filter(Boolean).join(' → ');
  return {
    id: String(e.id),
    name: e.name || '',
    game: e.game || '',
    server: typeof e.server === 'string' ? e.server : (e.server && e.server.name) || '',
    date: isNaN(start) ? '' : start.toISOString().slice(0, 10),
    time: isNaN(start) ? '' : start.toISOString().slice(11, 16),
    route,
    confirmed: (e.attendances && e.attendances.confirmed) || e.confirmed || 0,
    url: e.url || `https://truckersmp.com/events/${e.id}`,
  };
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;

  if (path === '/' || path === '/health') {
    res.writeHead(200);
    return res.end(JSON.stringify({ ok: true }));
  }

  if (path === '/api/event') {
    const id = url.searchParams.get('id');
    if (!id || !/^\d+$/.test(id)) {
      res.writeHead(400);
      return res.end(JSON.stringify({ error: 'invalid event id' }));
    }
    try {
      const r = await fetch(`https://truckersmp.com/api/v2/events/${id}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'application/json',
        },
      });
      if (!r.ok) {
        res.writeHead(r.status === 404 ? 404 : 502);
        return res.end(JSON.stringify({ error: `truckersmp ${r.status}` }));
      }
      const json = await r.json();
      const e = json.response || json;
      const norm = normalize(e);
      if (!norm) {
        res.writeHead(404);
        return res.end(JSON.stringify({ error: 'event not found' }));
      }
      res.writeHead(200);
      return res.end(JSON.stringify({ success: true, ...norm }));
    } catch (err) {
      res.writeHead(502);
      return res.end(JSON.stringify({ error: String(err) }));
    }
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'not found' }));
});

server.listen(PORT, () => console.log(`TEXIM event proxy listening on :${PORT}`));
