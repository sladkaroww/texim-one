// Standalone Node server for Render / Fly / Railway / any Node host.
// Run with: node server.js  (listens on PORT or 3000)
const http = require('http');
const url = require('url');
const { handleEvent } = require('./eventHandler.js');

const PORT = process.env.PORT || 3000;

http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    const q = url.parse(req.url, true).query;
    const link = q.link || q.id;
    const out = await handleEvent(link);
    res.writeHead(out.status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(out.body));
}).listen(PORT, () => console.log(`TEXIM ONE event proxy listening on ${PORT}`));
