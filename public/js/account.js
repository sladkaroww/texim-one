import { supabaseClient, getUser, getProfile } from './texim-supabase.js';

const DEFAULT_AVATAR = 'https://static.truckersmp.com/avatarsN/4710545.1766443403.png';
const supabase = await supabaseClient();
const $ = (id) => document.getElementById(id);
const message = (text, type = '') => { const el = $('accountMessage'); if (el) { el.textContent = text; el.className = `account-message ${type}`; } };

if ($('registerForm')) {
  $('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault(); message('Creating your account…');
    const form = new FormData(e.currentTarget);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.get('email').trim(), password: form.get('password'),
        options: { data: { username: form.get('username').trim(), display_name: form.get('display_name').trim() } }
      });
      if (error) throw error;
      if (data.session) location.href = '/profile.html';
      else message('Account created. Check your email to confirm your address, then log in.', 'success');
    } catch (err) { message(err.message || 'Registration failed.', 'error'); }
  });
}

if ($('loginForm')) {
  $('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault(); message('Signing you in…');
    const form = new FormData(e.currentTarget);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: form.get('email').trim(), password: form.get('password') });
      if (error) throw error;
      window.dispatchEvent(new Event('supabase-auth-changed'));
      location.href = '/profile.html';
    } catch (err) { message(err.message || 'Login failed.', 'error'); }
  });
}

if ($('forgotForm')) {
  $('forgotForm').addEventListener('submit', async (e) => {
    e.preventDefault(); message('Sending reset email…');
    try {
      const email = new FormData(e.currentTarget).get('email').trim();
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/reset-password.html` });
      if (error) throw error;
      message('If an account exists for that email, a password reset link has been sent.', 'success');
    } catch (err) { message(err.message || 'Could not send reset email.', 'error'); }
  });
}

if ($('resetForm')) {
  $('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault(); message('Updating password…');
    try {
      const password = new FormData(e.currentTarget).get('password');
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      message('Password updated successfully. You can now use it to log in.', 'success');
    } catch (err) { message(err.message || 'Could not update password.', 'error'); }
  });
}

if ($('logoutButton')) {
  $('logoutButton').addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();
    if (error) message(error.message, 'error');
    else location.href = '/';
  });
}

if ($('profileForm')) {
  const user = await getUser();
  if (!user) { location.href = `/login.html?redirect=${encodeURIComponent(location.pathname)}`; }
  else {
    const profile = await getProfile(user.id);
    if (profile) {
      $('username').value = profile.username || '';
      $('display_name').value = profile.display_name || '';
      if ($('profileRole')) $('profileRole').textContent = profile.role || 'member';
      if ($('profileEmail')) $('profileEmail').textContent = user.email || '';
      if ($('profileAvatar')) $('profileAvatar').src = DEFAULT_AVATAR;
    }
  }
  $('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault(); message('Saving profile…');
    try {
      const form = new FormData(e.currentTarget);
      const updates = { username: form.get('username').trim() || null, display_name: form.get('display_name').trim() || null };
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (error) throw error;
      if ($('profileAvatar')) $('profileAvatar').src = DEFAULT_AVATAR;
      message('Profile saved.', 'success');
    } catch (err) { message(err.message || 'Could not save profile.', 'error'); }
  });
}
