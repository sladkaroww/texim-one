export async function onRequest() {
  const out = {};
  const tests = [
    ['vtc-events', 'https://truckersmp.com/api/v2/vtc/74050/events'],
    ['vtc-attending', 'https://truckersmp.com/api/v2/vtc/74050/events/attending'],
    ['events-global', 'https://truckersmp.com/api/v2/events'],
    ['events-byid', 'https://truckersmp.com/api/v2/events/34097'],
  ];
  for (const [name, url] of tests) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'TEXIM-ONE/1.0' } });
      const text = await res.text();
      out[name] = { status: res.status, len: text.length, head: text.slice(0, 120) };
    } catch (e) {
      out[name] = { error: String(e) };
    }
  }
  return new Response(JSON.stringify(out, null, 2), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
