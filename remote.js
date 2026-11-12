'use strict';

const classroom={initializing:true,enabled:false,configured:false,user:null,revision:0,status:'loading',error:null,blocked:false};
const classroomOrigin='https://wecert-wheat.vercel.app';
let authMode='signin';
let studentSaveChain=Promise.resolve();
const protectedStudentRoutes=['dashboard','assessment','lesson'];
const remoteActive=()=>classroom.enabled&&Boolean(classroom.user);
function syncIndicator() {
  if(!classroom.enabled)return '';
  return `<span class="sync-indicator ${classroom.status==='error'?'sync-error':''}" role="status">${classroom.status==='saving'?'Saving changes':classroom.status==='error'?'Sync needs attention':classroom.user?'Synced to your account':'Secure classroom'}</span>`;
}
async function classroomApi(path,{method='GET',body}={}) {
  if(teacherDemoMode)throw new Error('Open the live classroom to use account services.');
  if(method!=='GET')updateSyncStatus('saving');
  const response=await fetch('/api'+path,{method,credentials:'same-origin',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});
  let result;try{result=await response.json();}catch{throw new Error('Service temporarily unavailable. Please try again.');}
  if(!response.ok){if(response.status===401&&classroom.user){classroom.user=null;state=readState();}if(method!=='GET')updateSyncStatus('error');const error=new Error(result.error?.message||result.message||result.error||'Request failed');error.status=response.status;throw error;}
  if(method!=='GET')updateSyncStatus('synced');
  return result;
}
function updateSyncStatus(status) {
  classroom.status=status;
  for(const el of document.querySelectorAll('.sync-indicator')){el.classList.toggle('sync-error',status==='error');el.textContent=t(status==='saving'?'Saving changes':status==='error'?'Sync needs attention':'Synced to your account');}
}
function applyCloudStudent(result) {
  state={...demoState(),...result.state,teacher:result.state.teacher};
  classroom.revision=result.revision;
}
async function refreshClassroom(renderPage=true) {
  if(!classroom.user)return;
  const owner=classroom.user.id;
  await studentSaveChain;
  const previous=JSON.stringify(state);
  const result=await classroomApi('/student/workspace');
  let teaching;
  if(classroom.user?.id===owner&&classroom.user.role==='teacher')teaching=await classroomApi('/teacher/workspace');
  await studentSaveChain;
  if(classroom.user?.id!==owner||result.revision<classroom.revision||(classroom.blocked&&renderPage))return;
  applyCloudStudent(result);
  if(teaching)state.teacher=teaching;
  classroom.blocked=false;classroom.error=null;updateSyncStatus('synced');
  if(renderPage&&previous!==JSON.stringify(state)&&!dialog.open&&!viewHasUnsavedChanges)render();
}
async function queueStudentSave(snapshot) {
  if(!classroom.user)throw new Error('Sign in required');
  const owner=classroom.user.id;
  const payload=JSON.parse(JSON.stringify(snapshot));delete payload.teacher;delete payload.comments;
  updateSyncStatus('saving');
  const task=async()=>{
    updateSyncStatus('saving');
    if(classroom.blocked)throw new Error('Another device updated your data. Reload before saving again.');
    if(classroom.user?.id!==owner)throw new Error('Sign in required');
    try {
      const result=await classroomApi('/student/state',{method:'PUT',body:{state:payload,revision:classroom.revision}});
      classroom.revision=result.revision;updateSyncStatus('synced');
    }catch(error){classroom.blocked=true;classroom.error=error.message;updateSyncStatus('error');throw error;}
  };
  const operation=studentSaveChain.then(task,task);studentSaveChain=operation.catch(()=>{});return operation;
}
function workspaceGate(route) {
  if(!teacherRoute(route)&&!protectedStudentRoutes.includes(route)&&!['setup','invite'].includes(route))return null;
  if(classroom.initializing)return `<main class="container inner" id="main-content" tabindex="-1">${titleBlock('Opening your workspace','Checking your account and classroom connection…')}</main>`;
  if(!classroom.enabled)return null;
  if(!classroom.configured||classroom.error&& !classroom.user)return `<main class="container inner" id="main-content" tabindex="-1">${titleBlock('Classroom connection unavailable','Your data has not been replaced with sample records. Please try again shortly.')}${action('Try again','cloud-retry','outline')}</main>`;
  if(!classroom.user)return authPage(teacherRoute(route)||['setup','invite'].includes(route));
  if(['setup','invite'].includes(route))return `<main class="container inner" id="main-content" tabindex="-1">${titleBlock('Activate teacher access','This link grants teacher access to the account you are currently signed in to.')}<section class="card padded auth-panel"><p data-user-content>${esc(classroom.user.email)}</p><p>Use this page only if you received this setup or invitation link from the school owner.</p>${action('Activate teacher access','cloud-claim')}</section></main>`;
  if(teacherRoute(route)&&classroom.user.role!=='teacher')return `<main class="container inner" id="main-content" tabindex="-1">${titleBlock('Teacher access required','Student accounts cannot open teaching records or change course messages.')}${teacherDemoEntry()}<section class="card padded auth-panel"><p>Ask an existing teacher for a teacher invitation link.</p><div class="modal-actions">${link('Student edition','#dashboard','outline')}${action('Use another account','cloud-signout','outline')}</div></section></main>`;
  return null;
}
function authPage(teacher=false) {
  const signup=authMode==='signup';
  const offerDemo=teacher&&teacherRoute(currentRoute());
  return `<main class="container inner auth-page" id="main-content" tabindex="-1">${crumb(teacher?'Teacher edition':'Student edition')}${titleBlock(signup?'Create your account':teacher?'Teacher edition':'Student sign in',offerDemo&&!signup?'Explore the demo or sign in to manage your classroom.':'Sign in on any device to continue with your saved progress.')}${offerDemo?teacherDemoEntry():''}
    <section class="card padded auth-panel"><div class="panel-title">${tile(teacher?'briefcase':'book')}<div><h2>${teacher?'Teacher edition':'Student edition'}</h2><p>Teacher access is granted by a setup or invitation link.</p></div></div><form id="cloud-auth-form" class="dialog-form">${signup?'<div class="field"><label for="auth-name">Display name</label><input id="auth-name" name="name" class="input" maxlength="40" autocomplete="name" required></div>':''}<div class="field"><label for="auth-email">Email address</label><input id="auth-email" name="email" type="email" class="input" autocomplete="email" maxlength="254" required></div><div class="field"><label for="auth-password">Password</label><input id="auth-password" name="password" type="password" class="input" minlength="12" maxlength="128" autocomplete="${signup?'new-password':'current-password'}" required></div><p class="fineprint">Use at least 12 characters. Passwords are never stored in the browser.</p><p id="auth-feedback" class="form-feedback" role="alert"></p>${submitButton(signup?'Create account':'Sign in')}</form><div class="auth-switch"><p>${signup?'Already have an account?':'New to WeCert?'}</p>${action(signup?'Sign in instead':'Create account','cloud-auth-mode','outline compact')}</div><p class="fineprint">New accounts start as students. Choosing Teacher edition does not grant teacher permissions.</p></section></main>`;
}
function showAccountProfile() {
  modal('Your account',`<p data-user-content>${esc(classroom.user.email)}</p><form id="cloud-profile-form" class="dialog-form"><div class="field"><label for="account-name">Display name</label><input id="account-name" class="input" name="name" maxlength="40" value="${esc(classroom.user.name)}" required></div>${submitButton('Save profile')}</form><div class="modal-actions">${action('Change password','cloud-password','outline')}${action('Sign out','cloud-signout','outline')}</div><p class="fineprint">Signing out here does not sign out your other devices.</p>`);
}
async function handleCloudAction(button) {
  switch(button.dataset.action) {
    case 'cloud-auth-mode':authMode=authMode==='signin'?'signup':'signin';render();return true;
    case 'cloud-account':showAccountProfile();return true;
    case 'cloud-signin':authMode='signin';go('dashboard');return true;
    case 'cloud-start-signup':authMode='signup';go('dashboard');return true;
    case 'cloud-signout':
      await studentSaveChain;await classroomApi('/auth/sign-out',{method:'POST',body:{}});classroom.user=null;classroom.blocked=false;state=readState();if(dialog.open)dialog.close();go('home');render();return true;
    case 'cloud-refresh':
      await refreshClassroom(false);if(!viewHasUnsavedChanges&&!dialog.open)render();else note('Workspace data updated. Your unfinished text has been kept.');return true;
    case 'cloud-retry':await initializeClassroom();return true;
    case 'cloud-claim':
      await classroomApi(currentRoute()==='setup'?'/setup/teacher':'/setup/invite',{method:'POST',body:{code:subroute()}});
      classroom.user=(await classroomApi('/me')).user;await refreshClassroom(false);history.replaceState(null,'','#teacher');render();note('Teacher access activated.');return true;
    case 'cloud-invite': {
      const invite=await classroomApi('/teacher/invites',{method:'POST',body:{}});
      modal('Invite a teacher',`<p>This single-use link expires in 3 days. Share it only with the teacher you want to invite.</p><div class="field"><label for="teacher-invite-url">Invitation link</label><input id="teacher-invite-url" class="input" readonly value="${esc(invite.url)}" data-i18n-skip></div><p class="fineprint">The recipient creates or signs in to their own account before accepting.</p>`);return true;
    }
    case 'cloud-password':
      modal('Change password',`<form id="cloud-password-form" class="dialog-form"><div class="field"><label for="old-password">Current password</label><input id="old-password" name="old" class="input" type="password" autocomplete="current-password" required></div><div class="field"><label for="new-password">New password</label><input id="new-password" name="next" class="input" type="password" minlength="12" maxlength="128" autocomplete="new-password" required></div>${submitButton('Update password')}</form>`);return true;
    default:return false;
  }
}
async function handleCloudSubmit(form,data) {
  switch(form.id) {
    case 'cloud-auth-form': {
      const signup=authMode==='signup';const body={email:String(data.get('email')).trim(),password:data.get('password')};if(signup)body.name=String(data.get('name')).trim();
      await classroomApi(signup?'/auth/sign-up/email':'/auth/sign-in/email',{method:'POST',body});classroom.user=(await classroomApi('/me')).user;await refreshClassroom(false);const pending=sessionStorage.getItem('wecert-pending-course');if(getCourse(pending)){state.courses[pending]||=[];state.selectedCourse=pending;await queueStudentSave(state);sessionStorage.removeItem('wecert-pending-course');}render();return true;
    }
    case 'cloud-profile-form': {
      const name=String(data.get('name')).trim();if(!name)throw new Error('Enter a display name.');
      await classroomApi('/auth/update-user',{method:'POST',body:{name}});classroom.user=(await classroomApi('/me')).user;state.name=name;await queueStudentSave(state);await refreshClassroom(false);dialog.close();render();note('Profile updated.');return true;
    }
    case 'cloud-password-form':
      await classroomApi('/auth/change-password',{method:'POST',body:{currentPassword:data.get('old'),newPassword:data.get('next'),revokeOtherSessions:true}});dialog.close();note('Password updated. Other sessions have been signed out.');return true;
    default:return false;
  }
}
function showCloudError(error) {
  if(error.status===401)render();
  const target=document.querySelector('#auth-feedback');if(target)target.textContent=t(error.message);else note(error.message||'Request failed');
}
async function initializeClassroom() {
  if(location.hostname.endsWith('.github.io')){location.replace(classroomOrigin+'/'+(teacherDemoMode?'?demo=teacher':'')+location.hash);return;}
  if(teacherDemoMode){classroom.initializing=false;classroom.enabled=false;classroom.configured=false;classroom.user=null;classroom.status='demo';if(!location.hash)history.replaceState(null,'',teacherDemoHref);render();return;}
  try {
    const response=await fetch('/api/runtime',{cache:'no-store'});
    if(!response.ok)throw new Error('API unavailable');
    const runtime=await response.json();classroom.enabled=runtime.enabled===true;classroom.configured=runtime.configured===true;
    if(classroom.enabled&&classroom.configured){classroom.user=(await classroomApi('/me')).user;if(classroom.user)await refreshClassroom(false);}
  } catch(error) {
    const production=location.hostname.endsWith('.vercel.app')||location.port==='3000';
    classroom.enabled=production;classroom.configured=false;if(production)classroom.error='Service temporarily unavailable. Please try again.';
  } finally{classroom.initializing=false;render();}
}
setInterval(async()=>{
  if(!remoteActive()||document.visibilityState!=='visible'||viewHasUnsavedChanges||dialog?.open||classroom.status==='saving'||classroom.blocked)return;
  try{await refreshClassroom();}catch(error){updateSyncStatus('error');if(error.status===401)render();}
},15000);
