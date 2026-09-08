import { supabaseClient, getUser, getProfile } from './texim-supabase.js';

const DEFAULT_AVATAR = 'https://static.truckersmp.com/avatarsN/4710545.1766443403.png';
const SUPABASE_URL = window.__TEXIM_SUPABASE__?.url || '';
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
    const identifier = String(form.get('identifier') || '').trim();
    const password = String(form.get('password') || '');
    try {
      let result;
      if (identifier.includes('@')) {
        result = await supabase.auth.signInWithPassword({ email: identifier, password });
      } else {
        if (!SUPABASE_URL) throw new Error('Supabase configuration is missing.');
        const response = await fetch(`${SUPABASE_URL}/functions/v1/login-with-username`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: identifier, password }) });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || 'Invalid username or password.');
        if (!payload.access_token || !payload.refresh_token) throw new Error('Login failed.');
        result = await supabase.auth.setSession({ access_token: payload.access_token, refresh_token: payload.refresh_token });
      }
      if (result.error) throw result.error;
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

    const deleteButton = $('deleteProfileButton');
    const deleteModal = $('deleteProfileModal');
    const confirmDeleteButton = $('confirmDeleteButton');
    const holdProgress = confirmDeleteButton?.querySelector('.hold-delete-progress');
    let holdTimer = null;
    let holdStartedAt = 0;
    let holdFrame = null;
    let deletionStarted = false;
    const HOLD_DURATION = 3000;

    const resetHold = () => {
      if (holdTimer) clearTimeout(holdTimer);
      if (holdFrame) cancelAnimationFrame(holdFrame);
      holdTimer = null;
      holdFrame = null;
      holdStartedAt = 0;
      if (holdProgress) holdProgress.style.width = '0%';
      confirmDeleteButton?.classList.remove('is-holding');
    };

    const closeDeleteModal = () => {
      if (deletionStarted) return;
      resetHold();
      if (deleteModal) {
        deleteModal.hidden = true;
        deleteModal.setAttribute('aria-hidden', 'true');
      }
    };

    const openDeleteModal = () => {
      if (!deleteModal || deletionStarted) return;
      deleteModal.hidden = false;
      deleteModal.setAttribute('aria-hidden', 'false');
      resetHold();
      requestAnimationFrame(() => confirmDeleteButton?.focus());
    };

    deleteButton?.addEventListener('click', openDeleteModal);
    deleteModal?.querySelectorAll('[data-delete-close]').forEach((button) => button.addEventListener('click', closeDeleteModal));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && deleteModal && !deleteModal.hidden) closeDeleteModal();
    });

    const finishDeletion = async () => {
      if (deletionStarted) return;
      deletionStarted = true;
      resetHold();
      if (confirmDeleteButton) {
        confirmDeleteButton.disabled = true;
        confirmDeleteButton.querySelector('.hold-delete-label').textContent = 'Deleting…';
      }
      if (deleteButton) deleteButton.disabled = true;
      message('Deleting your profile…');
      try {
        if (!SUPABASE_URL) throw new Error('Supabase configuration is missing.');
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error('Your session has expired. Please log in again.');
        const response = await fetch(`${SUPABASE_URL}/functions/v1/delete-account`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || 'Could not delete your profile.');
        await supabase.auth.signOut();
        location.href = '/';
      } catch (err) {
        deletionStarted = false;
        if (confirmDeleteButton) {
          confirmDeleteButton.disabled = false;
          confirmDeleteButton.querySelector('.hold-delete-label').textContent = 'Press and hold to delete';
        }
        if (deleteButton) deleteButton.disabled = false;
        message(err.message || 'Could not delete your profile.', 'error');
        resetHold();
      }
    };

    const updateHoldProgress = () => {
      if (!holdStartedAt || deletionStarted) return;
      const elapsed = performance.now() - holdStartedAt;
      const progress = Math.min(elapsed / HOLD_DURATION, 1);
      if (holdProgress) holdProgress.style.width = `${progress * 100}%`;
      if (progress < 1) holdFrame = requestAnimationFrame(updateHoldProgress);
    };

    const startHold = (e) => {
      if (deletionStarted || confirmDeleteButton?.disabled) return;
      e.preventDefault();
      holdStartedAt = performance.now();
      confirmDeleteButton.classList.add('is-holding');
      try { confirmDeleteButton.setPointerCapture(e.pointerId); } catch {}
      holdFrame = requestAnimationFrame(updateHoldProgress);
      holdTimer = setTimeout(finishDeletion, HOLD_DURATION);
    };

    const cancelHold = (e) => {
      if (!holdStartedAt || deletionStarted) return;
      e?.preventDefault();
      try { if (e?.pointerId != null) confirmDeleteButton.releasePointerCapture(e.pointerId); } catch {}
      resetHold();
    };

    confirmDeleteButton?.addEventListener('pointerdown', startHold);
    confirmDeleteButton?.addEventListener('pointerup', cancelHold);
    confirmDeleteButton?.addEventListener('pointercancel', cancelHold);
    confirmDeleteButton?.addEventListener('pointerleave', (e) => { if (e.buttons === 0) cancelHold(e); });

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
}
