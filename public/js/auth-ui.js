import { supabaseClient, getProfile, escapeHtml } from './texim-supabase.js';

const nav = document.querySelector('.nav-list');
const DEFAULT_AVATAR = '/img/icons/USER.svg';

async function render() {
  if (!nav) return;

  const supabase = await supabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  document.getElementById('accountNav')?.remove();
  document.getElementById('adminNav')?.remove();

  const li = document.createElement('li');
  li.id = 'accountNav';
  li.className = 'account-nav';

  if (!session?.user) {
    li.innerHTML = `
      <a href="/login.html" class="account-avatar-button" aria-label="Login" title="Login">
        <img src="${DEFAULT_AVATAR}" alt="User" class="account-avatar-icon">
      </a>`;
    nav.appendChild(li);
    return;
  }

  const profile = await getProfile(session.user.id);
  const displayName = profile?.display_name || profile?.username || session.user.email?.split('@')[0] || 'Member';
  const username = profile?.username ? `@${profile.username}` : '';
  const avatar = profile?.avatar_url || DEFAULT_AVATAR;

  li.innerHTML = `
    <button type="button" class="account-avatar-button" aria-label="Open profile preview" aria-expanded="false" aria-haspopup="true">
      <img src="${escapeHtml(avatar)}" alt="${escapeHtml(displayName)}" class="account-avatar-icon">
    </button>
    <div class="profile-dropdown" hidden>
      <div class="profile-dropdown-head">
        <img src="${escapeHtml(avatar)}" alt="${escapeHtml(displayName)}" class="profile-dropdown-avatar">
        <div class="profile-dropdown-info">
          <strong>${escapeHtml(displayName)}</strong>
          ${username ? `<span>${escapeHtml(username)}</span>` : ''}
          <span>${escapeHtml(session.user.email || '')}</span>
        </div>
      </div>
      <div class="profile-dropdown-divider"></div>
      <a href="/profile.html" class="profile-dropdown-link">View profile</a>
      <a href="/logout.html" class="profile-dropdown-link">Log out</a>
    </div>`;

  nav.appendChild(li);

  const button = li.querySelector('.account-avatar-button');
  const dropdown = li.querySelector('.profile-dropdown');

  button.addEventListener('click', (event) => {
    event.stopPropagation();
    const open = !dropdown.hidden;
    dropdown.hidden = open;
    button.setAttribute('aria-expanded', String(!open));
  });

  document.addEventListener('click', (event) => {
    if (!li.contains(event.target)) {
      dropdown.hidden = true;
      button.setAttribute('aria-expanded', 'false');
    }
  });

  if (profile?.role === 'admin') {
    const admin = document.createElement('li');
    admin.id = 'adminNav';
    admin.innerHTML = '<a href="/admin.html" class="nav-link">Admin</a>';
    nav.appendChild(admin);
  }
}

render().catch(console.error);
window.addEventListener('supabase-auth-changed', () => render().catch(console.error));
