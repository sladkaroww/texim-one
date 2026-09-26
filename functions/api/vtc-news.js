const RSS_URL = 'https://steamcommunity.com/groups/tex1m/rss/';

const stripCdata = (value = '') => value.replace(/^\s*<!\[CDATA\[/, '').replace(/\]\]>\s*$/, '').trim();
const decodeXml = (value = '') => stripCdata(value)
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'");

const getTag = (xml, tag) => {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decodeXml(match[1]) : '';
};

const getImage = (xml, description) => {
  const enclosure = xml.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*>/i)?.[1];
  if (enclosure) return enclosure;
  return description.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] || '';
};

const stripHtml = (value = '') => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

export async function onRequestGet() {
  try {
    const items = await getRssItems();

    return new Response(JSON.stringify({ items }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Could not fetch TruckersMP RSS news.',
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      },
    );
  }
}

async function getRssItems() {
  const response = await fetch(RSS_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36',
      Accept: 'application/rss+xml, application/xml, text/xml',
      Referer: 'https://truckersmp.com/vtc/74050/news',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  if (!response.ok) throw new Error(`TruckersMP RSS returned ${response.status}.`);

  const xml = await response.text();
  return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)]
    .map((match) => match[1])
    .map((item) => {
      const description = getTag(item, 'description');
      return {
        title: getTag(item, 'title'),
        link: getTag(item, 'link'),
        pubDate: getTag(item, 'pubDate'),
        description: stripHtml(description),
        image: getImage(item, description),
      };
    })
    .filter((item) => item.title && item.link);
}
