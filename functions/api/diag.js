export async function onRequest() {
  const out = {};
  const browserHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'Referer': 'https://truckersmp.com/',
  };
  const tests = [
    ['byid-browser', 'https://truckersmp.com/api/v2/events/34097'],
    ['byid-apihost-browser', 'https://api.truckersmp.com/v2/events/34097'],
    ['global-browser', 'https://truckersmp.com/api/v2/events'],
  ];
  for (const [name, url] of tests) {
    try {
      const res = await fetch(url, { headers: browserHeaders });
      const text = await res.text();
      out[name] = { status: res.status, len: text.length, head: text.slice(0, 160) };
    } catch (e) {
      out[name] = { error: String(e) };
    }
  }
  return new Response(JSON.stringify(out, null, 2), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
