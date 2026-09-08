import { supabaseClient, escapeHtml, formatDate } from './texim-supabase.js';
const supabase = await supabaseClient();
const root = document.getElementById('newsArticle');
const slug = new URLSearchParams(location.search).get('slug');
if (!slug) root.innerHTML = '<div class="empty-state">No article selected.</div>';
else try {
  const { data, error } = await supabase.from('news').select('*, author:profiles(display_name,username,avatar_url)').eq('slug', slug).eq('published', true).maybeSingle();
  if (error) throw error;
  if (!data) { root.innerHTML = '<div class="empty-state">Article not found.</div>'; }
  else {
    root.innerHTML = `<img src="${escapeHtml(data.image_url || 'https://i.ibb.co/4n4FZpq4/viber-2025-03-10-09-33-32-746.jpg')}" alt="" style="width:100%;max-height:420px;object-fit:cover;border-radius:8px"><div style="margin-top:1.5rem"><span class="news-date">${escapeHtml(formatDate(data.published_at || data.created_at))}</span><h1 class="account-title">${escapeHtml(data.title)}</h1><p class="account-muted">${escapeHtml(data.author?.display_name || data.author?.username || 'TEXIM ONE')}</p><div style="white-space:pre-wrap;line-height:1.8">${escapeHtml(data.content || data.excerpt || '')}</div></div>`;
  }
} catch (err) { root.innerHTML = `<div class="empty-state">${escapeHtml(err.message)}</div>`; }
