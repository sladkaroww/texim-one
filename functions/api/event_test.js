export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const eventLink = url.searchParams.get('link');

  if (!eventLink) {
    return new Response(JSON.stringify({ error: "Missing link parameter" }), { status: 400 });
  }

  const match = eventLink.match(/\/events\/(\d+)/);
  if (!match) {
    return new Response(JSON.stringify({ error: "Invalid TruckersMP event link" }), { status: 400 });
  }

  const eventId = match[1];

  try {
    const response = await fetch(`https://api.truckersmp.com/v2/events/${eventId}`);
    const data = await response.json();

    if (data.error) {
      return new Response(JSON.stringify({ error: "Event not found on TruckersMP" }), { status: 404 });
    }

    return new Response(JSON.stringify(data.response), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to fetch event data" }), { status: 500 });
  }
}
