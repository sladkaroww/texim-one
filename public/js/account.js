import { supabaseClient, getUser, getProfile, escapeHtml } from './texim-supabase.js';

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
      $('avatar_url').value = profile.avatar_url || '';
      if ($('profileRole')) $('profileRole').textContent = profile.role || 'member';
      if ($('profileEmail')) $('profileEmail').textContent = user.email || '';
      if ($('profileAvatar')) $('profileAvatar').src = profile.avatar_url || 'https://i.ibb.co/21RJ4r30/TEXIM-ONE-TRUE-CUT.png';
    }
  }
  $('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault(); message('Saving profile…');
    try {
      const form = new FormData(e.currentTarget);
      const updates = { username: form.get('username').trim() || null, display_name: form.get('display_name').trim() || null, avatar_url: form.get('avatar_url').trim() || null };
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (error) throw error;
      if ($('profileAvatar')) $('profileAvatar').src = updates.avatar_url || 'https://i.ibb.co/21RJ4r30/TEXIM-ONE-TRUE-CUT.png';
      message('Profile saved.', 'success');
    } catch (err) { message(err.message || 'Could not save profile.', 'error'); }
  });
}

if ($('avatarForm')) {
  const user = await getUser();
  if (user) $('avatarForm').addEventListener('submit', async (e) => {
    e.preventDefault(); message('Uploading avatar…');
    try {
      const file = new FormData(e.currentTarget).get('avatar');
      if (!(file instanceof File) || !file.size) throw new Error('Choose an image first.');
      if (file.size > 4 * 1024 * 1024) throw new Error('Avatar must be smaller than 4 MB.');
      if (!file.type.startsWith('image/')) throw new Error('Avatar must be an image.');
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const { error } = await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id);
      if (error) throw error;
      if ($('profileAvatar')) $('profileAvatar').src = `${data.publicUrl}?v=${Date.now()}`;
      message('Avatar updated.', 'success');
    } catch (err) { message(err.message || 'Avatar upload failed.', 'error'); }
  });
}
