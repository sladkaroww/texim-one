import { supabaseClient, getProfile, escapeHtml } from './texim-supabase.js';
const nav = document.querySelector('.nav-list');
if (!nav) return;

const profileIcon = `<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 21c.8-4 3.5-6 8-6s7.2 2 8 6"></path></svg>`;

async function render() {
  const supabase = await supabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  document.getElementById('accountNav')?.remove();
  document.getElementById('adminNav')?.remove();

  const li = document.createElement('li');
  li.id = 'accountNav';
  li.innerHTML = `<a href="${session?.user ? '/profile.html' : '/login.html'}" class="nav-link account-nav-link" aria-label="${session?.user ? 'My Profile' : 'Login'}" title="${session?.user ? 'My Profile' : 'Login'}">${profileIcon}<span>${session?.user ? 'Profile' : 'Login'}</span></a>`;
  nav.appendChild(li);

  if (!session?.user) return;

  const profile = await getProfile(session.user.id);
  if (profile?.role === 'admin') {
    const admin = document.createElement('li');
    admin.id = 'adminNav';
    admin.innerHTML = '<a href="/admin.html" class="nav-link">Admin</a>';
    nav.appendChild(admin);
  }
}

render().catch(console.error);
window.addEventListener('supabase-auth-changed', () => render().catch(console.error));
