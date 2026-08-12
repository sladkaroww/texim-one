// Vercel serverless function: /api/event?link=... or ?id=...
// Deploy the `proxy/` folder to Vercel. Vercel treats `api/*.js` as functions.
const { handleEvent } = require('../eventHandler.js');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(204).end();

    const link = req.query.link || req.query.id;
    const out = await handleEvent(link);
    res.status(out.status).json(out.body);
};
