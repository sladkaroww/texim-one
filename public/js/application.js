import { supabaseClient, getUser, escapeHtml } from './texim-supabase.js';
const supabase = await supabaseClient();
const form = document.getElementById('applicationForm');
const status = document.getElementById('applicationStatus');
const message = (text, ok=false) => { status.textContent=text; status.className=`account-message ${ok?'success':'error'}`; };

async function loadStatus(user) {
  const { data, error } = await supabase.from('applications').select('id,truckersmp_username,status,created_at,reviewed_at').eq('user_id', user.id).order('created_at',{ascending:false});
  if (error) throw error;
  const box=document.getElementById('myApplications');
  if (!box) return;
  box.innerHTML=data?.length ? data.map(a=>`<div class="db-card"><strong>${escapeHtml(a.truckersmp_username)}</strong><p class="status">${escapeHtml(a.status)}</p><small>${new Date(a.created_at).toLocaleString()}</small></div>`).join('') : '<div class="empty-state">No applications submitted yet.</div>';
}

const user=await getUser();
if (!user) { message('You need an account to apply.'); if(form) form.innerHTML='<a class="btn btn-primary" href="/login.html?redirect=/apply.html">Log in to apply</a>'; }
else {
  try { await loadStatus(user); } catch(err) { message(err.message); }
  form?.addEventListener('submit', async (e)=>{
    e.preventDefault(); message('Submitting application…', true);
    const f=new FormData(form);
    const payload={user_id:user.id,truckersmp_username:f.get('truckersmp_username').trim(),discord_username:f.get('discord_username').trim(),age:Number(f.get('age')),experience:f.get('experience').trim(),reason:f.get('reason').trim()};
    const {error}=await supabase.from('applications').insert(payload);
    if(error){message(error.message);return;}
    form.reset(); message('Application submitted. You can track its status below.',true); await loadStatus(user);
  });
}
