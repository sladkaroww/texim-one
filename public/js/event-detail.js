import { supabaseClient, getUser, escapeHtml, formatDate } from './texim-supabase.js';
const supabase = await supabaseClient();
const root = document.getElementById('eventDetail');
const id = new URLSearchParams(location.search).get('id');
if (!id) { root.innerHTML = '<div class="empty-state">No event selected.</div>'; } else {
  async function load() {
    const { data: event, error } = await supabase.from('events').select('*, organizer:profiles(display_name,username), event_participants(user_id, profiles(display_name,username,avatar_url))').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!event) { root.innerHTML = '<div class="empty-state">Event not found.</div>'; return; }
    const user = await getUser();
    const participants = event.event_participants || [];
    const joined = user && participants.some((p) => p.user_id === user.id);
    root.innerHTML = `<img src="${escapeHtml(event.image_url || 'https://i.ibb.co/YFymQ1vB/ets2-20250308-221702-00.png')}" alt="" style="width:100%;max-height:360px;object-fit:cover;border-radius:8px"><div style="margin-top:1.5rem"><span class="badge">${escapeHtml(event.status)}</span><h1 class="account-title">${escapeHtml(event.title)}</h1><p class="account-muted">${escapeHtml(formatDate(event.event_date))}${event.game ? ` · ${escapeHtml(event.game)}` : ''}</p><p>${escapeHtml(event.description || 'No description provided.')}</p>${event.route ? `<p><strong>Route:</strong> ${escapeHtml(event.route)}</p>` : ''}<div class="account-actions"><button id="joinDetail" class="btn btn-primary">${joined ? 'Leave Event' : (user ? 'Join Event' : 'Log in to join')}</button>${event.invite_link ? `<a class="btn" href="${escapeHtml(event.invite_link)}" target="_blank" rel="noopener">Invite link</a>` : ''}</div><h2 style="margin-top:2rem">Participants (${participants.length})</h2><div class="member-grid">${participants.length ? participants.map((p) => `<div class="member-card"><div class="profile-head"><img class="avatar avatar--small" src="${escapeHtml(p.profiles?.avatar_url || 'https://i.ibb.co/21RJ4r30/TEXIM-ONE-TRUE-CUT.png')}" alt=""><strong>${escapeHtml(p.profiles?.display_name || p.profiles?.username || 'Member')}</strong></div></div>`).join('') : '<div class="empty-state">No one has joined yet.</div>'}</div></div>`;
    document.getElementById('joinDetail').addEventListener('click', async () => {
      if (!user) { location.href = `/login.html?redirect=${encodeURIComponent(location.pathname + location.search)}`; return; }
      const result = joined ? await supabase.from('event_participants').delete().eq('event_id', id).eq('user_id', user.id) : await supabase.from('event_participants').insert({ event_id: Number(id), user_id: user.id });
      if (result.error) alert(result.error.message); else load();
    });
  }
  try { await load(); supabase.channel(`event-detail-${id}`).on('postgres_changes', {event:'*',schema:'public',table:'event_participants',filter:`event_id=eq.${id}`}, load).subscribe(); } catch (err) { root.innerHTML = `<div class="empty-state">${escapeHtml(err.message)}</div>`; }
}
