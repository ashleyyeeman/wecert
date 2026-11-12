'use strict';

const icons = {
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  chev: '<path d="m8 10 4 4 4-4"/>',
  right: '<path d="m10 6 6 6-6 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  briefcase: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12a24 24 0 0 0 18 0m-9 1v3"/>',
  grid: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11m6-11v11m-12-5h18"/>',
  award: '<circle cx="12" cy="8.5" r="5"/><path d="m8.5 12-1.6 8 5.1-2.8 5.1 2.8-1.6-8"/>',
  people: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v2m1-15a3 3 0 0 1 0 6m1 2a5 5 0 0 1 4 5v2"/>',
  shield: '<path d="M12 22s7-3.4 7-10V5l-7-3-7 3v7c0 6.6 7 10 7 10Z"/><path d="m9 12 2 2 4-4"/>',
  book: '<path d="M12 6v15m-8-5V4h4a4 4 0 0 1 4 3 4 4 0 0 1 4-3h4v12h-4a4 4 0 0 0-4 3 4 4 0 0 0-4-3H4Z"/>',
  chart: '<path d="M4 4v16h16M8 15l4-5 3 2 5-6"/>',
  play: '<path d="m9 5 11 7-11 7V5Z" fill="currentColor" stroke="none"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18m-13 5h2m4 0h2"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  chat: '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l1.5-4A8.5 8.5 0 1 1 21 11.5Z"/><path d="M8 11h8m-8 4h4"/>',
  sparkle: '<path d="M12 2.8c.9 5 3.3 7.4 8.2 8.2-4.9.9-7.3 3.3-8.2 8.2-.8-4.9-3.3-7.3-8.2-8.2 4.9-.8 7.4-3.2 8.2-8.2ZM19 16v5m-2.5-2.5h5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  list: '<rect x="5" y="5" width="14" height="16" rx="2"/><path d="M9 5V3h6v2M9 10h6m-6 4h6m-6 4h3"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>'
};
const icon = (name, size = 20) => '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + icons[name] + '</svg>';

let state = readState();
const app = document.querySelector('#app');
const dialog = document.querySelector('#modal');
const announce = document.querySelector('#announcement');
let step = 0;
let filter = {type:'All courses', mode:'Any format', query:''};
let activeLesson = 7;
let viewHasUnsavedChanges = false;
const navItems = [['home','Home'],['courses','Courses'],['assessment','Skills Assessment'],['dashboard','Career Dashboard'],['about','About'],['proposal','Project Proposal']];
const money = n => 'HK$' + new Intl.NumberFormat('en-HK').format(n);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const chevron = () => icon('right', 15);
const arrow = () => icon('arrow', 17);
const tile = (name, tone='mint') => `<span class="icon-tile ${tone}">${icon(name, 21)}</span>`;
const badge = (text, tone='mint') => `<span class="badge ${tone}">${esc(text)}</span>`;
const link = (label, href, cls='', end='') => `<a class="button ${cls}" href="${href}">${label}${end}</a>`;
const action = (label, name, cls='', end='', data='') => `<button class="button ${cls}" type="button" data-action="${name}" ${data}>${label}${end}</button>`;
const bar = value => `<div class="progress" role="progressbar" aria-label="Course progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}"><i style="width:${value}%"></i></div>`;
const getCourse = id => courses.find(course => course.id === id);
const save = () => { if(classroom.enabled&&!classroom.user)return Promise.reject(new Error('Sign in required'));if(remoteActive())return queueStudentSave(state);try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch {}return Promise.resolve(); };
const currentRoute = () => location.hash.slice(1).split('/')[0] || 'home';
const subroute = () => location.hash.slice(1).split('/')[1];
const titleBlock = (title, desc, aside='') => `<div class="section-heading page-title"><div><h1>${title}</h1><p>${desc}</p></div>${aside}</div>`;
const crumb = (text, base='') => `<div class="breadcrumb"><a href="#home">Home</a>${chevron()}${base}<b>${text}</b></div>`;
const logo = `<a href="#home" class="logo" aria-label="WeCert home"><img src="assets/bridge.svg" width="37" height="37" alt=""><span>We<b>Cert</b></span></a>`;
function header(route) {
  const teaching=teacherRoute(route);
  const selected=teaching?(route==='teacher-course'?'teacher-courses':route==='teacher-learner'?'teacher-learners':route):route==='course'?'courses':route==='lesson'?'dashboard':route;
  const name=classroom.user?(teaching?classroom.user.name:state.name):teaching?state.teacher.name:state.name;
  return `<header><div class="container navbar">${logo}<nav aria-label="Main navigation">${(teaching?teacherNavItems:navItems).map(([id,label])=>`<a href="#${id}" ${id===selected?'class="selected" aria-current="page"':''}>${label}</a>`).join('')}</nav><div class="account">${languageControls()}${classroom.enabled&&!classroom.user?action('Sign in','cloud-signin','compact'):!teaching&&name==='Alex Chan'&&route==='home'?action('Try demo','demo','compact',arrow()):`<button class="profile-link" type="button" data-action="${remoteActive()?'cloud-account':teaching?'teacher-profile':'profile'}"><span class="avatar">${esc(name.split(/\s+/).slice(0,2).map(n=>n[0]).join('').toUpperCase())}</span><span class="account-name">${esc(name)}</span>${icon('chev',15)}</button>`}</div></div></header>`;
}
function footer() {
  return `<footer><div class="container footer-inner"><span class="footer-brand">WeCert <span>${classroom.enabled?'· Classroom platform':'· Interactive prototype'}</span></span><div><a href="#about">About us</a><a href="#resources">Free starter resources</a><a href="#proposal">Project Proposal</a><button type="button" data-action="help">Help centre</button><button type="button" data-action="privacy">${classroom.enabled?'Account privacy':'Demo privacy'}</button></div></div></footer>`;
}
function homeRegistration() {
  if(classroom.enabled)return `<section class="card registration">${tile('shield','blue')}<h2>${classroom.user?'Your learning, wherever you are':'Continue on any device'}</h2><p>Use your account to keep progress, questions and teacher feedback together.</p><div class="modal-actions">${classroom.user?link('Open learner dashboard','#dashboard','',arrow()):action('Sign in','cloud-signin','',arrow())}${!classroom.user?action('Create account','cloud-start-signup','outline'):action('Your account','cloud-account','outline')}</div>${syncIndicator()}</section>`;
  return `<section class="card registration"><div class="register-symbol">${tile('people')}</div><h2>Create your demo profile</h2><p>Try the learner experience with a display name, or continue with the sample profile.</p>
      <form id="profile-form"><div class="field"><label for="display-name">Display name</label><input id="display-name" class="input" name="name" placeholder="e.g. Alex Chan" maxlength="40" required autocomplete="off"></div>
      <button class="button full" type="submit">Create profile${arrow()}</button></form>
      <div class="account-hint"><a href="#dashboard">${state.name === "Alex Chan" ? "Continue as Alex Chan" : "Open learner dashboard"} ${chevron()}</a></div>
    </section>`;
}
function home() {
  return `<main class="container home" id="main-content" tabindex="-1"><section class="workspace-entry" aria-label="Choose your workspace"><div><strong>Choose your workspace</strong><p>Learn as a student or manage teaching.</p></div><a class="workspace-choice" href="#dashboard">${tile('book')}<span><strong>Student edition</strong><small>Courses, practice & career support</small></span>${arrow()}</a><a class="workspace-choice teacher-choice" href="#teacher">${tile('briefcase','blue')}<span><strong>Teacher edition</strong><small>Courses, progress & learner questions</small></span>${arrow()}</a></section><p class="workspace-entry-note">${classroom.enabled?'Students and teachers use separate accounts. Your progress is available across devices.':'Demo workspaces share data in this browser.'}</p><div class="home-grid">
    <section class="hero"><div class="hero-picture"></div><div class="hero-copy">
      <div class="hero-kicker"><i></i> Vocational training in Hong Kong</div>
      <h1>Build skills for your<br>next career move.</h1>
      <p class="brand-tagline">Build skills. Unlock opportunities.</p><p>Find affordable training, take a free skills assessment and get support as you move into work.</p>
      <div class="hero-actions">${link('Start free assessment','#assessment','light',arrow())}${link('Browse courses','#courses','hero-secondary')}</div>
    </div></section>
    ${homeRegistration()}</div>
    <section class="journey-section"><div class="section-heading"><div><h2>A clear path from skills to opportunity</h2><p>Start where you are. Take one practical step at a time.</p></div></div>
      <ol class="journey"><li><b>01</b><h3>Assess your skills</h3><p>Try four short workplace scenarios.</p></li><li><b>02</b><h3>Build your learning plan</h3><p>Match skills, schedule and budget.</p></li><li><b>03</b><h3>Train and practise</h3><p>Learn, apply and check your understanding.</p></li><li><b>04</b><h3>Get career support</h3><p>Prepare your CV and explore opportunities.</p></li></ol>
      <article class="card example-journey">${badge('Illustrative learner journey','sand')}<h3>From retail experience to office skills</h3><p>A sample retail worker builds on customer service experience, practises a task tracker in Spreadsheet Essentials, then prepares an administration CV with career support. A referral or job is never guaranteed.</p>${link('Find your starting point','#assessment','outline',arrow())}</article>
    </section>
    <section class="categories"><div class="section-heading"><div><h2>Explore course categories</h2><p>Learn online, in person or through a mix of both.</p></div><a class="text-link" href="#courses">View all courses ${arrow()}</a></div>
      <div class="category-grid">${categories.map(c=>`<a class="card category" href="#courses/${encodeURIComponent(c.name)}">${tile(c.icon,c.tone)}<div><h3>${c.name}</h3><p>${c.desc}</p></div><span class="category-arrow">${chevron()}</span></a>`).join('')}</div>
    </section>
    <section class="benefits" aria-label="Learner services">
      <div>${icon('book',22)}<span><strong>Free platform tools</strong><small>Browse courses, preview a lesson and track progress.</small></span></div>
      <div>${icon('target',22)}<span><strong>Free skills assessment</strong><small>See which courses match your skills and goals.</small></span></div>
      <div>${icon('people',22)}<span><strong>Post-training career support</strong><small>Free CV reviews, guidance and job referrals for eligible learners.</small></span></div>
    </section>
    </main>`;
}

function courseCard(course) {
  return `<article class="card course-card"><div class="course-cover ${course.tone}" aria-hidden="true">${icon(course.icon,40)}<span>${esc(course.track)}</span><i></i></div>
    ${badge(course.demo ? 'Complete demo route' : 'Course preview',course.demo?'mint':'sand')}<h2><a href="#course/${course.id}">${course.name}</a></h2><p>${course.about}</p>
    <div class="course-meta"><span>${icon('book',16)} ${course.mode}</span><span>${icon('clock',16)} ${course.weeks} weeks</span>${course.level ? `<span>${course.level}</span>` : ''}</div>
    <div class="course-card-bottom"><strong>${course.fee === null ? 'Custom quote' : money(course.fee)}</strong><a href="#course/${course.id}" class="text-link">View course ${chevron()}</a></div></article>`;
}
function catalogItems() {
  const query = filter.query.trim().toLowerCase();
  const results = courses.filter(c => (filter.type === 'All courses' || filter.type === c.type) &&
    (filter.mode === 'Any format' || filter.mode === c.mode) && (!query || [c.name,c.about,c.track].flatMap(text=>[text,translateText(text,'zh-Hant'),translateText(text,'zh-Hans')]).join(' ').toLowerCase().includes(query)));
  return `<div class="result-count">${results.length} ${results.length === 1 ? 'course' : 'courses'}</div>` +
    (results.length ? `<div class="catalog-grid">${results.map(courseCard).join('')}</div>` :
      `<div class="card empty"><h2>No courses found</h2><p>Try a different keyword or clear your filters.</p>${action('Clear filters','clear-filters','outline')}</div>`);
}
function catalog() {
  return `<main class="container inner" id="main-content" tabindex="-1">${crumb('Courses')}${titleBlock('Explore courses','Compare practical training, exam preparation and employer programmes.',link('Find my course matches','#assessment','outline',arrow()))}
    <div class="card catalog-filters">
      <div class="field"><label for="course-search">Search courses</label><input type="search" class="input" id="course-search" placeholder="Try Excel, customer service or Japanese" value="${esc(filter.query)}"></div>
      <div class="field"><label for="course-type">Course category</label><select id="course-type" class="input">${options(['All courses',...categories.map(c=>c.name)],filter.type)}</select></div>
      <div class="field"><label for="course-mode">Study format</label><select id="course-mode" class="input">${options(formats,filter.mode)}</select></div>
    </div><section id="course-results" aria-live="polite">${catalogItems()}</section>
    <p class="fineprint">Course prices, durations and availability are illustrative. Check funding and qualification details before enrolling in a real programme.</p></main>`;
}
function courseDetail(course) {
  if (!course) return notFound();
  const corporate = course.type === 'Corporate Training';
  const enrolled = Object.hasOwn(state.courses, course.id);
  return `<main class="container inner" id="main-content" tabindex="-1">${crumb(course.name,`<a href="#courses">Courses</a>${chevron()}`)}
    <div class="course-banner"><div>${badge(course.type,course.tone)}<h1>${course.name}</h1><p>${course.about}</p><div class="course-meta"><span>${icon('book',17)} ${course.mode}</span><span>${icon('clock',17)} ${course.weeks} weeks</span>${course.level ? `<span>${course.level}</span>` : ''}</div></div>${tile(course.icon,course.tone)}</div>
    <div class="detail-grid"><section class="card padded"><h2>What you’ll learn</h2><p class="inline-note">${course.demo ? 'Complete demo: course-specific lessons and knowledge check are available.' : 'Course preview: explore the outline. Full lessons and assessment are not yet available.'}</p><ol class="numbered-list">${course.units.map(u=>`<li>${u}</li>`).join('')}</ol>
      ${course.placement ? '<div class="inline-note"><strong>Internship pathway</strong><p>After completing the course and meeting the assessment standard, learners can be considered for a placement with a partner employer.</p></div>' : ''}
      <h2 class="spaced-heading">Is this course for you?</h2><dl><dt>Entry requirements</dt><dd>${course.entry}</dd><dt>Teaching language</dt><dd>${course.language}</dd><dt>Weekly study time</dt><dd>${course.schedule.hours} hours</dd><dt>Sample timetable (Hong Kong time)</dt><dd>${course.schedule.time}</dd><dt>Location</dt><dd>${course.schedule.location}</dd></dl><p class="fineprint">All timetables are illustrative; there is no confirmed intake or venue in this prototype.</p>
    </section><section class="card padded"><h2>${corporate ? 'Discuss team training' : 'Fees & qualifications'}</h2>
      <p class="detail-price">${corporate ? 'Custom quote' : money(course.fee)}</p>
      <p class="fineprint">${corporate ? 'Training can be adapted to your team’s needs.' : 'Illustrative total fee for the whole course, not a monthly charge. Includes teaching materials, practice tasks and learner support. No payment is collected.'}</p>
      <dl><dt>Course outcome</dt><dd>${course.credential}</dd>${course.external ? `<dt>External pathway</dt><dd>${course.external}</dd>` : ''}</dl>
      <p class="fineprint">${course.external ? 'Exam entry and fees are separate. Exam subsidies and partner arrangements are proposed and subject to confirmation.' : corporate ? 'Send a sample enquiry to try the employer flow.' : 'CEF reimbursement is a proposed route for eligible registered courses. Eligibility and recognition must be confirmed.'}</p>
      ${!corporate ? link('Try free starter material',lessonHref(course.id,1),'outline',arrow()) : ''}${corporate ? action('Try an employer enquiry','employer','',arrow()) : enrolled ? action('Open in dashboard','enrol','',arrow(),`data-id="${course.id}"`) : action(classroom.enabled?'Add to learning plan':course.demo ? 'Try demo enrolment' : 'Add preview to plan','enrol','',arrow(),`data-id="${course.id}"`)}
    </section></div></main>`;
}
function options(items, selected) {
  return items.map(value=>`<option value="${esc(value)}" ${value === selected ? 'selected' : ''}>${esc(value)}</option>`).join('');
}

function notFound() {
  return `<main class="container inner" id="main-content" tabindex="-1">${titleBlock('Page not found','Return to the homepage or explore available courses.')}${link('Back to homepage','#home','',arrow())}</main>`;
}

function modal(title, body) {
  dialog.innerHTML = `<div class="modal-head"><h2 id="modal-title">${title}</h2><button type="button" data-action="close" class="icon-button" aria-label="Close dialog">×</button></div><div class="modal-languages">${languageControls()}</div>${body}`;
  dialog.setAttribute('aria-labelledby','modal-title');
  localize(dialog);
  if (!dialog.open) dialog.showModal();
}
function note(text) {
  announce.textContent = t(text);
  const previous = document.querySelector('.toast');
  if (previous) previous.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = t(text);
  document.body.append(toast);
  setTimeout(()=>toast.remove(),3300);
}
function submitButton(label) {
  return `<button type="submit" class="button">${label}${arrow()}</button>`;
}
function salaryResult(salary) {
  const {before, after} = salary;
  if (before === 0) return `${money(before)} → ${money(after)} per month. Percentage change is undefined when starting income is zero.`;
  const change = (after-before) / before * 100;
  const percentage = new Intl.NumberFormat('en-HK',{maximumFractionDigits:1,signDisplay:'exceptZero'}).format(change);
  return `${money(before)} → ${money(after)} per month (${percentage}%).`;
}
function showBooking(type) {
  const appointment = state.appointment;
  const selected = type || appointment?.type || supportTypes[0].name;
  const desc = supportTypes.find(item=>item.name===selected)?.desc || '';
  const slots = ['24 Nov 2026 · 4:00 PM','26 Nov 2026 · 11:00 AM','1 Dec 2026 · 5:30 PM'];
  modal(appointment ? 'Manage career appointment' : 'Book career support', `<p>${desc} Try a sample slot in Hong Kong time.</p>
    <form id="booking-form" class="dialog-form"><div class="field"><label for="service-type">Support service</label><select class="input" id="service-type" name="type">${options(supportTypes.map(s=>s.name),selected)}</select></div>
    <div class="field"><label for="service-time">Appointment slot</label><select class="input" id="service-time" name="slot">${options(slots,appointment?.slot)}</select></div>
    <div class="modal-actions">${submitButton(appointment ? 'Update demo booking' : 'Confirm demo booking')}${appointment ? action('Cancel booking','cancel-booking','outline') : ''}</div></form>`);
}
function quiz() {
  const c = getCourse(state.selectedCourse);
  const questions = courseChecks[c?.id];
  if (!questions) { note('This preview does not have a knowledge check yet.'); return; }
  modal(c.name+' · Knowledge check', `<p>Answer all three questions correctly to pass this demo check. This is not an external examination or certificate.</p><form id="quiz-form" data-course="${c.id}" class="dialog-form">${questions.map((q,i)=>`<fieldset class="scenario"><legend>${i+1}. ${q.question}</legend>${q.choices.map((choice,j)=>`<label class="choice"><input type="radio" name="q${i}" value="${j}" required> ${choice}</label>`).join('')}</fieldset>`).join('')}<div id="quiz-feedback" aria-live="polite"></div>${submitButton('Check answers')}</form>`);
}
function render(moveFocus=false) {
  const route = currentRoute();
  const views = {home,courses:catalog,course:()=>courseDetail(getCourse(subroute())),assessment,dashboard,lesson:lessonPage,about,proposal,resources,teacher:teacherOverview,'teacher-courses':teacherCourses,'teacher-course':teacherCourse,'teacher-learners':teacherLearnerList,'teacher-learner':teacherLearner,'teacher-inbox':teacherInbox};
  app.innerHTML = header(route) + (workspaceGate(route) || (Object.hasOwn(views,route) ? views[route]() : notFound())) + footer();
  viewHasUnsavedChanges=false;
  const heading = document.querySelector('main h1');
  document.title = route === 'home' ? 'WeCert | Vocational Training & Career Support' : (heading?.textContent.trim() || 'Page') + ' | WeCert';
  localize();
  if (moveFocus) document.querySelector('#main-content')?.focus({preventScroll:true});
}
function go(route) {
  if (location.hash === '#'+route) { render(true); return; }
  location.hash = route;
}
async function refreshAssessment() {
  await save();
  render(true);
}
function changeFilter() {
  document.querySelector('#course-results').innerHTML = catalogItems();
  localize(document.querySelector('#course-results'));
}
function resetModal() {
  if(remoteActive()){modal('Your account privacy',`<p>Account progress and class messages are stored in the classroom database. Teachers can access learning records and questions; students can access their own records and published class messages.</p><p>Sign out when using a shared device.</p><div class="modal-actions">${action('Your account','cloud-account','outline')}${action('Done','close')}</div>`);return;}
  modal('Demo privacy', `<p>Demo profiles, assessment answers, comments, bookings and income examples are stored in this browser. Use sample details. The demo does not create an account, process payments or send questions and bookings to staff.</p><p>You can clear your changes and return to the sample profile.</p><div class="modal-actions">${action('Reset demo data','reset','outline')}${action('Done','close')}</div>`);
}
async function actions(button) {
  if(await handleCloudAction(button))return;
  if(await handleTeacherAction(button))return;
  switch (button.dataset.action) {
    case 'close': dialog.close(); break;
    case 'demo': go('dashboard'); break;
    case 'profile':
      modal('Learner profile', `<p>Change the display name for this browser.</p><form id="profile-form" class="dialog-form"><div class="field"><label for="modal-name">Display name</label><input class="input" id="modal-name" name="name" value="${esc(state.name)}" maxlength="40" required></div>${submitButton('Save profile')}</form>`);
      break;
    case 'sample':
      if (state.assessed) state.review = false;
      state.profile = structuredClone(sampleProfile);
      state.assessmentAnswers = [];
      state.assessed = false;
      step = 2;
      await refreshAssessment();
      break;
    case 'skills-back': step = 1; render(true); break;
    case 'edit-assessment':
    case 'assessment-back':
      step = 0;
      render(true);
      break;
    case 'review':
      state.review = true;
      await save();
      render();
      note('Demo review saved locally. No adviser was contacted.');
      break;
    case 'clear-filters':
      filter = {type:'All courses',mode:'Any format',query:''};
      go('courses');
      break;
    case 'enrol': {
      const course = getCourse(button.dataset.id);
      if (!course) break;
      if(classroom.enabled&&!classroom.user){sessionStorage.setItem('wecert-pending-course',course.id);go('dashboard');note('Sign in to add this course to your learning plan.');break;}
      if (!Object.hasOwn(state.courses,course.id)) state.courses[course.id] = [];
      state.selectedCourse = course.id;
      await save();
      go('dashboard');
      note('Course opened in your demo learning plan.');
      break;
    }
    case 'plan':
      modal('Your learning plan', `<p>Select a course to display it on your dashboard.</p><div class="plan-list">${Object.keys(state.courses).map(id=>{const course=getCourse(id);return course?`<button type="button" data-action="select-course" data-id="${id}">${tile(course.icon,course.tone)}<span><strong>${course.name}</strong><small>${state.courses[id].length} lessons completed</small></span>${chevron()}</button>`:'';}).join('')}</div>${link('Explore more courses','#courses','outline',arrow())}`);
      break;
    case 'select-course':
      if (!getCourse(button.dataset.id)) break;
      state.selectedCourse = button.dataset.id;
      await save();
      dialog.close();
      render();
      break;
    case 'complete': {
      const id = state.selectedCourse;
      const completed = state.courses[id] || [];
      state.courses[id] = [...new Set([...completed,activeLesson])];
      await save();
      render();
      note('Lesson complete. Your course progress was updated.');
      break;
    }
    case 'quiz': quiz(); break;
    case 'book': showBooking(button.dataset.type); break;
    case 'cancel-booking':
      state.appointment = null;
      await save();
      dialog.close();
      render();
      note('Demo booking cancelled.');
      break;
    case 'funding':
      modal('Funding guidance · Demo', `<p>Save an enquiry about a free or low-cost route. Your budget and schedule can be discussed with an adviser in a live service; no subsidy is guaranteed here.</p><form id="funding-form" class="dialog-form"><div class="field"><label for="funding-topic">What support would help?</label><textarea id="funding-topic" name="topic" class="input" rows="3" maxlength="350" required>${esc(state.fundingEnquiry||t('I would like help finding a free or affordable learning route.'))}</textarea></div>${submitButton('Save local demo enquiry')}</form><p class="fineprint">No staff member is contacted.</p>`);
      break;
    case 'followup': {
      modal('Employment follow-up · Example data', `<p>Record a sample snapshot after course completion. One record per follow-up month; saving again updates it.</p><form id="followup-form" class="dialog-form"><div class="field"><label for="followup-month">Months after completion</label><select class="input" name="month" id="followup-month">${[3,6,12].map(m=>`<option value="${m}">${m} months</option>`).join('')}</select></div><div class="field"><label for="followup-status">Employment status</label><select id="followup-status" class="input" name="status">${options(['Employed full-time','Employed part-time','Self-employed','Seeking work','Not in paid work'],'Employed part-time')}</select></div><div class="field"><label for="followup-hours">Hours worked per week</label><input id="followup-hours" class="input" name="hours" type="number" min="0" max="168" step="0.5" value="20" required></div><div class="field"><label for="followup-income">Monthly employment income (HK$)</label><input id="followup-income" class="input" name="income" type="number" min="0" max="10000000" value="8000" required></div><div id="followup-feedback" aria-live="polite"></div>${submitButton('Save example follow-up')}</form>`);
      break;
    }
    case 'income': {
      const s = state.salary || {before:10000,after:11750};
      modal('Income improvement calculator', `<p>Use example monthly income before training and after employment. Amounts are in Hong Kong dollars.</p>
        <form id="income-form" class="dialog-form"><div class="field-grid"><div class="field"><label for="income-before">Monthly income before (HK$)</label><input id="income-before" name="before" type="number" class="input" min="0" max="10000000" value="${s.before}" required></div>
        <div class="field"><label for="income-after">Monthly income after (HK$)</label><input id="income-after" name="after" type="number" class="input" min="0" max="10000000" value="${s.after}" required></div></div>${submitButton('Calculate and save example')}</form>`);
      break;
    }
    case 'internship': {
      const c = getCourse(state.selectedCourse);
      const eligible = c.placement && c.demo && courseLessons(c).every((_,i)=>state.courses[c.id]?.includes(i+1)) && state.quizByCourse[c.id];
      modal('Internship eligibility', `<p>${eligible ? 'You completed '+c.name+' and passed its demo knowledge check. Try registering interest; no real placement is offered.' : 'Complete all lessons in '+c.name+' and pass its knowledge check first. Placement interest is a local demonstration only.'}</p><div class="modal-actions">${eligible ? action('Register demo interest','save-interest','',arrow()) : link('Continue course',lessonHref(c.id,1),'outline')}${action('Close','close','outline')}</div>`);
      break;
    }
    case 'save-interest':
      state.interestByCourse[state.selectedCourse] = true;
      await save();
      dialog.close();
      render();
      note('Internship interest saved in this demo.');
      break;
    case 'employer':
      modal('Team training enquiry', `<p>Try describing a workplace training need.</p><form id="employer-form" class="dialog-form"><div class="field"><label for="employer-topic">Training goal</label><textarea class="input" id="employer-topic" name="topic" rows="3" maxlength="300" placeholder="e.g. Help our team produce consistent monthly reports" required></textarea></div>${submitButton('Preview enquiry')}</form>`);
      break;
    case 'help':
      modal('Help centre', `<p>Start with the free skills assessment to compare courses, or open the learner dashboard to try a lesson and explore career support.</p><div class="modal-actions">${link('Skills assessment','#assessment')}${link('Career dashboard','#dashboard','outline')}</div>`);
      break;
    case 'privacy': resetModal(); break;
    case 'reset':
      modal('Reset demo data?', `<p>This clears the changes you made in this browser and restores the sample learner profile.</p><div class="modal-actions">${action('Reset demo','confirm-reset')}${action('Cancel','close','outline')}</div>`);
      break;
    case 'confirm-reset':
      state = demoState();
      step = 0;
      filter = {type:'All courses',mode:'Any format',query:''};
      try { localStorage.removeItem(storageKey); } catch {}
      dialog.close();
      go('home');
      note('Demo reset to the sample learner.');
      break;
  }
}
document.addEventListener('click',async event=>{
  try {
  const languageButton = event.target.closest('button[data-language]');
  if (languageButton) {setLanguage(languageButton.dataset.language); return;}
  const button = event.target.closest('button[data-action]');
  if(button){const wasDisabled=button.disabled;button.disabled=true;try{await actions(button);}finally{if(button.isConnected)button.disabled=wasDisabled;}}
  const anchor = event.target.closest('a[href^="#"]');
  if (anchor && dialog.open) dialog.close();
  if (anchor?.classList.contains('skip')) {
    event.preventDefault();
    document.querySelector('#main-content').focus();
  }
  localize();
  }catch(error){showCloudError(error);}
});
document.addEventListener('input',event=>{
  if(event.target.closest('form'))viewHasUnsavedChanges=true;
  if (event.target.id !== 'course-search') return;
  filter.query = event.target.value;
  changeFilter();
});
document.addEventListener('change',async event=>{
  try {
  const field = event.target;
  if(field.closest('form'))viewHasUnsavedChanges=true;
  if(field.id==='teacher-inbox-course'){teacherInboxFilter.course=field.value;render();return;}
  if(field.id==='teacher-inbox-status'){teacherInboxFilter.status=field.value;render();return;}
  if (field.id === 'course-type') { filter.type = field.value; changeFilter(); }
  if (field.id === 'course-mode') { filter.mode = field.value; changeFilter(); }
  if (field.dataset.exam !== undefined) {
    const task = Number(field.dataset.exam);
    const id = state.selectedCourse;
    const prep = state.examByCourse[id] || [];
    state.examByCourse[id] = field.checked ? [...new Set([...prep,task])] : prep.filter(n=>n!==task);
    await save();
    const stat = document.querySelectorAll('.stat')[1];
    if (stat) stat.querySelector('strong').textContent = t(state.quizByCourse[id] ? 'Passed' : state.examByCourse[id].length+' of 4 prep tasks');
  }
  }catch(error){showCloudError(error);}
});
function tutorReply(question) {
  const c = getCourse(state.selectedCourse);
  const unit = courseLessons(c)[activeLesson-1];
  if (!c.demo) return 'This course is a preview; detailed tutor guidance is not available yet. Explore the outline or switch to a complete demo route.';
  return 'From “'+unit.title+'”: '+unit.guide+' Practice: '+unit.task+' This scripted response uses the current lesson and does not interpret every question.';
}
document.addEventListener('submit',async event=>{
  const form = event.target;
  const data = new FormData(form);
  event.preventDefault();
  const submit=form.querySelector('button[type=submit]');
  const controls=[...form.elements].map(el=>({el,disabled:el.disabled}));
  for(const {el} of controls)el.disabled=true;
  try {
  if(await handleCloudSubmit(form,data))return;
  if(await handleTeacherSubmit(form,data))return;
  switch (form.id) {
    case 'profile-form': {
      const name = data.get('name').trim();
      if (!name) {
        const field = form.elements.name;
        field.setCustomValidity(t('Enter a display name.'));
        field.reportValidity();
        field.addEventListener('input',()=>field.setCustomValidity(''),{once:true});
        return;
      }
      state.name = name;
      await save();
      if (dialog.open) { dialog.close(); render(); } else { go('dashboard'); }
      note('Demo profile saved.');
      break;
    }
    case 'assessment-form':
      if (step === 0) {
        state.assessed = false;
        state.review = false;
        state.profile = {...state.profile,education:data.get('education'),experience:data.get('experience'),mode:data.get('mode'),availability:data.get('availability'),additionalAvailability:data.getAll('additionalAvailability'),hours:Number(data.get('hours')),budget:Number(data.get('budget'))};
      } else {
        if (state.profile.goal !== data.get('goal')) state.assessmentAnswers = [];
        state.profile = {...state.profile,goal:data.get('goal'),skills:data.getAll('skills')};
        state.assessed = false;
        state.review = false;
      }
      step++;
      await refreshAssessment();
      break;
    case 'scenario-form':
      state.assessmentAnswers = questionsFor(state.profile).map((_,i)=>Number(data.get('q'+i)));
      state.assessed = true;
      state.review = false;
      step = 3;
      await refreshAssessment();
      break;
    case 'funding-form':
      state.fundingEnquiry = data.get('topic').trim();
      await save(); dialog.close(); note('Funding enquiry saved in this browser. No adviser was contacted.');
      break;
    case 'followup-form': {
      const record = {month:Number(data.get('month')),status:data.get('status'),hours:Number(data.get('hours')),income:Number(data.get('income'))};
      if (['Seeking work','Not in paid work'].includes(record.status) && (record.hours!==0 || record.income!==0)) {
        document.querySelector('#followup-feedback').textContent = t('For a status without paid work, enter zero hours and income, or choose an employed status.');
        return;
      }
      state.followups = state.followups.filter(f=>f.month!==record.month).concat(record);
      await save(); dialog.close(); render(); note('Illustrative follow-up saved.');
      break;
    }
    case 'comment-form': {
      const question = data.get('question').trim();
      if (!question) return;
      const recipient = data.get('recipient');
      if(remoteActive()){await studentSaveChain;applyCloudStudent(await classroomApi('/student/questions',{method:'POST',body:{course:state.selectedCourse,lesson:activeLesson,question,recipient}}));render();note(recipient==='Teacher'?'Question sent to your teacher.':'Scripted tutor reply added.');break;}
      const reply = recipient !== 'Teacher' ? tutorReply(question) : 'Question saved in the demo. In a live course, your teacher would reply in this discussion.';
      state.comments.push({id:crypto.randomUUID(),authorName:state.name,course:state.selectedCourse,lesson:activeLesson,recipient,question,reply,createdAt:new Date().toISOString()});
      await save();
      render();
      document.querySelector('.comment:last-child')?.scrollIntoView({block:'nearest'});
      note(recipient !== 'Teacher' ? 'Scripted tutor reply added.' : 'Teacher question saved in this demo.');
      break;
    }
    case 'booking-form':
      state.appointment = {type:data.get('type'),slot:data.get('slot')};
      await save();
      dialog.close();
      render();
      note('Career appointment saved in this demo.');
      break;
    case 'income-form':
      state.salary = {before:Number(data.get('before')),after:Number(data.get('after'))};
      await save();
      dialog.close();
      render();
      note('Income comparison saved in this demo.');
      break;
    case 'quiz-form': {
      const id = form.dataset.course;
      const questions = courseChecks[id];
      let correct = questions.filter((q,i)=>Number(data.get('q'+i))===q.answer).length;
      let passed = correct === questions.length;
      if(remoteActive()){await studentSaveChain;const result=await classroomApi('/student/quiz',{method:'POST',body:{course:id,answers:questions.map((_,i)=>Number(data.get('q'+i)))}});applyCloudStudent(result);correct=result.correct;passed=result.passed;}
      document.querySelector('#quiz-feedback').innerHTML = `<strong>${correct} of ${questions.length} correct. ${passed?'Demo check passed.':'Review the explanations and try again.'}</strong>${questions.map((q,i)=>`<p>${i+1}. ${q.explanation}</p>`).join('')}`;
      localize(dialog);
      if (passed) {
        state.quizByCourse[id] = true;
        state.examByCourse[id] = [...new Set([...(state.examByCourse[id]||[]),2])];
        if(!remoteActive())await save(); render();
      }
      break;
    }
    case 'employer-form':
      modal('Sample enquiry',`<p data-user-content>${esc(data.get('topic').trim())}</p><p>This previews the training request a company could submit.</p><div class="modal-actions">${action('Done','close')}</div>`);
      break;
  }
  }catch(error){showCloudError(error);}
  finally{for(const {el,disabled} of controls)if(el.isConnected)el.disabled=disabled;}
});
async function routeChanged() {
  // Old numeric links always belonged to the original spreadsheet lesson route.
  if (/^#lesson\/\d+(?:\/(?:ai|teacher))?$/.test(location.hash)) {
    const parts = location.hash.slice(1).split('/');
    history.replaceState(null,'',lessonHref('spreadsheets',Number(parts[1]),parts[2]||''));
  }
  if (dialog.open) dialog.close();
  if(remoteActive()&&(teacherRoute(currentRoute())||protectedStudentRoutes.includes(currentRoute()))){
    app.innerHTML=header(currentRoute())+`<main class="container inner" id="main-content" tabindex="-1">${titleBlock('Opening your workspace','Checking your account and classroom connection…')}</main>`+footer();
    localize();
    try{await refreshClassroom(false);}catch(error){showCloudError(error);}
  }
  if (currentRoute()==='assessment') step = state.assessed ? 3 : 0;
  if (currentRoute()==='courses') {
    const category = categories.find(c=>encodeURIComponent(c.name)===subroute());
    filter = {type:category?.name||'All courses',mode:'Any format',query:''};
  }
  render(true);
  window.scrollTo(0,0);
}
window.addEventListener('storage',event=>{
  if(classroom.enabled)return;
  if(event.key!==storageKey)return;
  state=readState();
  if(dialog.open||viewHasUnsavedChanges){note('Workspace data updated. Your unfinished text has been kept.');return;}
  render();
});
window.addEventListener('hashchange',routeChanged);
routeChanged();
initializeClassroom();
