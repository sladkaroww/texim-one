import { supabaseClient, getProfile, escapeHtml } from './texim-supabase.js';
const nav = document.querySelector('.nav-list');
if (!nav) return;
async function render() {
  const supabase = await supabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  document.getElementById('accountNav')?.remove(); document.getElementById('adminNav')?.remove();
  const li=document.createElement('li'); li.id='accountNav';
  if(!session?.user){li.innerHTML='<a href="/login.html" class="nav-link">Login</a>';nav.appendChild(li);return;}
  const profile=await getProfile(session.user.id); const label=profile?.display_name||profile?.username||session.user.email?.split('@')[0]||'Profile';
  li.innerHTML=`<a href="/profile.html" class="nav-link">${escapeHtml(label)}</a>`; nav.appendChild(li);
  if(profile?.role==='admin'){const admin=document.createElement('li');admin.id='adminNav';admin.innerHTML='<a href="/admin.html" class="nav-link">Admin</a>';nav.appendChild(admin);}
}
render().catch(console.error); window.addEventListener('supabase-auth-changed',()=>render().catch(console.error));
