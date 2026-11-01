import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/api/send.js';

test('sends a manually entered invite through the Discord webhook', async () => {
  const stored = new Map();
  const webhookRequests = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    webhookRequests.push({ url, options });
    return new Response(null, { status: 204 });
  };

  try {
    const response = await onRequest({
      request: new Request('https://texim.example/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: 'Manual Convoy',
          eventDate: '2026-11-15',
          eventTime: '18:30',
          eventLink: 'not-a-truckersmp-link',
          discord: '@driver',
          email: 'driver@example.com',
          details: 'Meet at the service station.',
        }),
      }),
      env: {
        DISCORD_WEBHOOK_URL: 'https://discord.example/webhook',
        TEXIM_CALENDAR: {
          async put(key, value) {
            stored.set(key, value);
          },
        },
      },
    });

    const result = await response.json();
    assert.equal(response.status, 200);
    assert.equal(result.success, true);
    assert.equal(webhookRequests.length, 1);
    assert.equal(webhookRequests[0].url, 'https://discord.example/webhook');

    const payload = JSON.parse(webhookRequests[0].options.body);
    assert.equal(payload.username, 'TEXIM ONE Bot');
    assert.equal(payload.embeds[0].title, 'New Convoy Invitation');
    assert.deepEqual(
      payload.embeds[0].fields.slice(0, 4).map(({ name, value }) => ({ name, value })),
      [
        { name: 'Convoy Name', value: 'Manual Convoy' },
        { name: 'Date', value: '2026-11-15' },
        { name: 'Start Time (UTC)', value: '18:30' },
        { name: 'Invited by (Discord)', value: '@driver' },
      ],
    );
    assert.equal(payload.embeds[0].fields.at(-1).value, 'Meet at the service station.');
    assert.equal(stored.size, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
