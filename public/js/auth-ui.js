import { supabaseClient, getProfile, escapeHtml } from './texim-supabase.js';

const nav = document.querySelector('.nav-list');
if (!nav) return;

async function render() {
  const supabase = await supabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  const old = document.getElementById('accountNav');
  if (old) old.remove();

  const li = document.createElement('li');
  li.id = 'accountNav';

  if (!session?.user) {
    li.innerHTML = '<a href="/login.html" class="nav-link">Login</a>';
  } else {
    const profile = await getProfile(session.user.id);
    const label = profile?.display_name || profile?.username || session.user.email?.split('@')[0] || 'Profile';
    li.innerHTML = `<a href="/profile.html" class="nav-link">${escapeHtml(label)}</a>`;
  }
  nav.appendChild(li);
}

render().catch(console.error);
window.addEventListener('supabase-auth-changed', () => render().catch(console.error));
