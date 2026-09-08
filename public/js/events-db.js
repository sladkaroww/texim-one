import { supabaseClient, getUser, escapeHtml, formatDate } from './texim-supabase.js';
const supabase = await supabaseClient();
const grid = document.getElementById('dbEventGrid');
if (!grid) return;

async function load() {
  const user = await getUser();
  const { data, error } = await supabase.from('events').select('*, organizer:profiles(display_name,username), event_participants(count)').order('event_date', { ascending: true });
  if (error) throw error;
  grid.innerHTML = data?.length ? data.map((event) => {
    const count = event.event_participants?.[0]?.count ?? 0;
    return `<article class="db-card"><img src="${escapeHtml(event.image_url || 'https://i.ibb.co/YFymQ1vB/ets2-20250308-221702-00.png')}" alt="" style="width:100%;height:170px;object-fit:cover;border-radius:7px;margin-bottom:1rem"><span class="badge">${escapeHtml(event.status)}</span><h2>${escapeHtml(event.title)}</h2><p>${escapeHtml(event.description || '')}</p><p><strong>${escapeHtml(formatDate(event.event_date))}</strong>${event.game ? ` · ${escapeHtml(event.game)}` : ''}</p><p>${count} participant${count === 1 ? '' : 's'}</p><div class="account-actions"><a class="btn" href="/event.html?id=${encodeURIComponent(event.id)}">Details</a>${event.invite_link ? `<a class="btn" href="${escapeHtml(event.invite_link)}" target="_blank" rel="noopener">Invite link</a>` : ''}<button class="btn btn-primary join-event" data-id="${event.id}">${user ? 'Join Event' : 'Log in to join'}</button></div></article>`;
  }).join('') : '<div class="empty-state">No upcoming TEXIM ONE events yet.</div>';
  grid.querySelectorAll('.join-event').forEach((button) => button.addEventListener('click', async () => {
    const current = await getUser();
    if (!current) { location.href = `/login.html?redirect=${encodeURIComponent(location.pathname)}`; return; }
    button.disabled = true;
    const { data: existing } = await supabase.from('event_participants').select('event_id').eq('event_id', button.dataset.id).eq('user_id', current.id).maybeSingle();
    const result = existing
      ? await supabase.from('event_participants').delete().eq('event_id', button.dataset.id).eq('user_id', current.id)
      : await supabase.from('event_participants').insert({ event_id: Number(button.dataset.id), user_id: current.id });
    button.disabled = false;
    if (result.error) alert(result.error.message); else await load();
  }));
}

try {
  await load();
  supabase.channel('event-participants-live').on('postgres_changes', { event: '*', schema: 'public', table: 'event_participants' }, () => load()).subscribe();
  supabase.channel('events-live').on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => load()).subscribe();
} catch (err) { grid.innerHTML = `<div class="empty-state">Could not load events: ${escapeHtml(err.message)}</div>`; }
