const RSS_URL = 'https://truckersmp.com/vtc/74050/news/rss';

const stripCdata = (value = '') => value.replace(/^\s*<!\[CDATA\[/, '').replace(/\]\]>\s*$/, '').trim();
const decodeXml = (value = '') => stripCdata(value).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const getTag = (xml, tag) => {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decodeXml(match[1]) : '';
};
const getImage = (xml, description) => {
  const enclosure = xml.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*>/i)?.[1];
  if (enclosure) return enclosure;
  return description.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] || '';
};
const stripHtml = (value = '') => value.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim();

export async function onRequestGet() {
  try {
    const response = await fetch(RSS_URL, {
      headers: { 'User-Agent': 'TEXIM-ONE-News/1.0', Accept: 'application/rss+xml, application/xml, text/xml' },
      cf: { cacheTtl: 300, cacheEverything: true },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `TruckersMP returned ${response.status}.` }), { status: 502, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
    }

    const xml = await response.text();
    const items = [...xml.matchAll(/<item(?:\\s[^>]*)?>([\\s\\S]*?)<\\/item>/gi)].map((match) => match[1]).map((item) => {
      const description = getTag(item, 'description');
      return {
        title: getTag(item, 'title'),
        link: getTag(item, 'link'),
        pubDate: getTag(item, 'pubDate'),
        description: stripHtml(description),
        image: getImage(item, description),
      };
    }).filter((item) => item.title && item.link);

    return new Response(JSON.stringify({ items }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=300, s-maxage=300' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Could not fetch TruckersMP news.' }), { status: 502, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  }
}
