export async function onRequest() {
  const id = '34097';
  const hosts = [
    'https://truckersmp.com/api/v2/events/' + id,
    'https://api.truckersmp.com/v2/events/' + id,
  ];
  const out = {};
  for (const url of hosts) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' } });
      const text = await res.text();
      out[url] = { status: res.status, len: text.length, head: text.slice(0, 140) };
    } catch (e) {
      out[url] = { error: String(e) };
    }
  }
  return new Response(JSON.stringify(out, null, 2), { status: 200, headers: { 'content-type': 'application/json' } });
}
