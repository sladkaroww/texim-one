const RSS_URL = 'https://truckersmp.com/vtc/74050/news/rss';

export async function onRequestGet() {
  try {
    const response = await fetch(RSS_URL, {
      headers: { 'User-Agent': 'TEXIM-ONE-News/1.0' },
      cf: { cacheTtl: 300, cacheEverything: true },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `TruckersMP returned ${response.status}.` }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      });
    }

    return new Response(await response.text(), {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Could not fetch TruckersMP news.' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }
}
