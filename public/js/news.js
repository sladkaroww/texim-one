import { supabaseClient, escapeHtml, formatDay } from './texim-supabase.js';
const supabase = await supabaseClient();
const grid = document.getElementById('newsGrid');
const status = document.getElementById('newsStatus');
if (!grid) return;

async function load() {
  const { data, error } = await supabase.from('news').select('id,title,slug,excerpt,image_url,published_at,created_at').eq('published', true).order('published_at', { ascending: false, nullsFirst: false });
  if (error) throw error;
  grid.innerHTML = data?.length ? data.map((item) => `<article class="db-card"><img src="${escapeHtml(item.image_url || 'https://i.ibb.co/4n4FZpq4/viber-2025-03-10-09-33-32-746.jpg')}" alt="" style="width:100%;height:180px;object-fit:cover;border-radius:7px;margin-bottom:1rem"><span class="news-date">${escapeHtml(formatDay(item.published_at || item.created_at))}</span><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.excerpt || '')}</p><a class="btn btn-primary" href="/article.html?slug=${encodeURIComponent(item.slug)}">Read article</a></article>`).join('') : '<div class="empty-state">No published news yet.</div>';
  if (status) status.textContent = '';
}

try { await load(); supabase.channel('news-live').on('postgres_changes', {event:'*',schema:'public',table:'news'}, load).subscribe(); } catch (err) { if (status) status.textContent = `Could not load news: ${err.message}`; }
