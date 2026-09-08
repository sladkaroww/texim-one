import { supabaseClient, escapeHtml } from './texim-supabase.js';
const supabase = await supabaseClient();
const grid = document.getElementById('memberGrid');
try {
  const { data, error } = await supabase.from('profiles').select('id,username,display_name,avatar_url,role,created_at').order('created_at', { ascending: true });
  if (error) throw error;
  grid.innerHTML = data?.length ? data.map((member) => `<article class="member-card"><div class="profile-head"><img class="avatar" src="${escapeHtml(member.avatar_url || 'https://i.ibb.co/21RJ4r30/TEXIM-ONE-TRUE-CUT.png')}" alt="" /><div><h2 style="margin:0">${escapeHtml(member.display_name || member.username || 'TEXIM ONE Member')}</h2><p class="account-muted" style="margin:.2rem 0">@${escapeHtml(member.username || 'member')}</p><span class="badge ${member.role === 'admin' ? 'badge--admin' : ''}">${escapeHtml(member.role || 'member')}</span></div></div></article>`).join('') : '<div class="empty-state">No members yet.</div>';
} catch (err) { grid.innerHTML = `<div class="empty-state">Could not load members: ${escapeHtml(err.message)}</div>`; }
