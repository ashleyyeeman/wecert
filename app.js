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

const courses = [
  {id:'office', type:'Main courses', track:'Digital skills', name:'Basic Office Digital Literacy', mode:'Hybrid', weeks:6, fee:480, icon:'grid', tone:'mint', goal:'Office administration', skill:'Office software', level:'Beginner', about:'Create workplace documents in Word, organise data in Excel and present ideas with PowerPoint.', units:['Write a workplace proposal in Word','Build an Excel tracker with formulas','Present a team update in PowerPoint'], credential:'Course completion record', placement:true},
  {id:'spreadsheets', type:'Main courses', track:'Digital skills', name:'Spreadsheet Essentials', mode:'Online', weeks:4, fee:280, icon:'grid', tone:'mint', goal:'Office administration', skill:'Spreadsheets', level:'Beginner', about:'Practise formulas, sort and filter data, and build a spreadsheet you can use in office work.', units:['Spreadsheet setup and formatting','Formulas and data organisation','Sort, filter and check your work'], credential:'Course completion record', placement:true},
  {id:'service', type:'Main courses', track:'Workplace skills', name:'Retail & Customer Service', mode:'In person', weeks:4, fee:320, icon:'people', tone:'sand', goal:'Retail and customer service', skill:'Customer service', level:'Beginner', about:'Practise customer conversations, complaint handling and day-to-day retail tasks.', units:['Serve customers in common scenarios','Handle complaints professionally','Practise till and stock routines'], credential:'Course completion record', placement:true},
  {id:'accounting', type:'Certification courses', track:'Exam preparation', name:'Financial Accounting (FA) Preparation', mode:'Hybrid', weeks:8, fee:780, icon:'award', tone:'blue', goal:'Accounting and finance', skill:'Accounting', level:'Beginner', about:'Build a foundation in double-entry bookkeeping and financial statements while preparing for an external exam.', units:['Double-entry bookkeeping','Trial balances and adjustments','Financial statements and practice questions'], credential:'External exam preparation', external:'Financial Accounting (FA) exam'},
  {id:'japanese', type:'Certification courses', track:'Language training', name:'Japanese Language Proficiency Preparation', mode:'Online', weeks:8, fee:620, icon:'award', tone:'blue', goal:'Language development', skill:'Japanese', level:'Beginner', about:'Develop reading and listening skills for Japanese language exams. The demo features the introductory N5 route.', units:['Kana and everyday vocabulary','Foundational grammar and reading','Listening and practice questions'], credential:'External exam preparation', external:'Japanese-Language Proficiency Test (JLPT)'},
  {id:'actuarial', type:'Certification courses', track:'Professional development', name:'Actuarial Career Foundations', mode:'Hybrid', weeks:8, fee:860, icon:'award', tone:'blue', goal:'Accounting and finance', skill:'Accounting', level:'Intermediate', about:'Explore actuarial work, introductory risk concepts and pathways to professional qualification.', units:['Introduction to actuarial roles','Risk, probability and financial maths','Research professional pathways'], credential:'Course completion record', external:'Actuarial professional pathways'},
  {id:'intermediate', type:'Main courses', track:'Digital skills', name:'Intermediate Spreadsheets', mode:'Online', weeks:4, fee:420, icon:'chart', tone:'mint', goal:'Office administration', skill:'Spreadsheets', level:'Intermediate', about:'Use lookups, pivot tables and charts to report on workplace data.', units:['Lookups and data validation','Pivot tables and summary reports','Charts for workplace decisions'], credential:'Course completion record'},
  {id:'corporate', type:'Corporate training', track:'Team development', name:'Digital Skills for Teams', mode:'Hybrid', weeks:4, fee:null, icon:'briefcase', tone:'sand', about:'Arrange a practical training programme for employees, with workshops shaped around your team’s day-to-day work.', units:['Workplace documents and collaboration','Data handling and reporting','Team practice with relevant scenarios'], credential:'Custom employer training'}
];

const lessons = [
  'Tour the spreadsheet workspace', 'Enter and format data', 'Write basic formulas', 'Use cell references',
  'Work with dates and numbers', 'Check data for mistakes', 'Sort and filter your data',
  'Summarise results with functions', 'Present data in a simple chart', 'Complete the final practice task'
];
const lessonPractice = [
  'Identify the cell address, formula bar and sheet tabs.',
  'Format dates consistently and resize each column to fit its values.',
  'Use SUM to add a range and AVERAGE to calculate its mean.',
  'Copy a relative reference, then use a dollar sign to make it absolute.',
  'Choose a date format and apply the correct decimal places to currency.',
  'Look for blanks, duplicated records and inconsistent entries.',
  'Sort the entire table by hours worked. Filter the Status column to show only Open records.',
  'Use COUNTIF to count Open records. Check your result against the filtered rows.',
  'Build a column chart from the category totals. Add a title and check the axis labels.',
  'Create a table, add a formula, filter it by status and summarise the results in a chart.'
];
const goals = ['Office administration','Retail and customer service','Accounting and finance','Language development','Explore my options'];
const skills = ['Office software','Spreadsheets','Customer service','Accounting','Japanese','Data entry'];
const formats = ['Any format','Online','Hybrid','In person'];
const categories = [
  {name:'Main courses', icon:'grid', tone:'mint', desc:'Practise job-ready skills and explore internship pathways.'},
  {name:'Certification courses', icon:'award', tone:'blue', desc:'Prepare for external exams and see what each course awards.'},
  {name:'Corporate training', icon:'briefcase', tone:'sand', desc:'Develop practical skills with training designed for your team.'}
];
const supportTypes = [
  {name:'CV review', icon:'list', desc:'Get feedback on your CV and how you present your new skills.'},
  {name:'Career guidance', icon:'target', desc:'Discuss job options and plan the next steps in your career.'},
  {name:'Partner job referrals', icon:'people', desc:'Register interest in suitable opportunities with partner employers.'}
];
const sampleProfile = {education:'Secondary school', experience:'1–3 years', skills:['Customer service','Data entry'], goal:'Office administration', mode:'Online', availability:'Weekday evenings', hours:4, budget:500};
const storageKey = 'skillbridge-hk-demo-v1';
function demoState() {
  return {
    name:'Alex Chan', courses:{spreadsheets:[1,2,3,4,5,6]}, exam:[0,1], quiz:false,
    profile:{...sampleProfile}, assessed:false, review:false, comments:[], appointment:null,
    salary:null, interest:false, selectedCourse:'spreadsheets'
  };
}
function readState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return saved && typeof saved === 'object' ? {...demoState(), ...saved} : demoState();
  } catch { return demoState(); }
}
let state = readState();
const app = document.querySelector('#app');
const dialog = document.querySelector('#modal');
const announce = document.querySelector('#announcement');
let step = 0;
let filter = {type:'All courses', mode:'Any format', query:''};
let activeLesson = 7;
const navItems = [['home','Home'],['courses','Courses'],['assessment','Skills Assessment'],['dashboard','Career Dashboard'],['about','About']];
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
const save = () => { try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch {} };
const currentRoute = () => location.hash.slice(1).split('/')[0] || 'home';
const subroute = () => location.hash.slice(1).split('/')[1];
const titleBlock = (title, desc, aside='') => `<div class="section-heading page-title"><div><h1>${title}</h1><p>${desc}</p></div>${aside}</div>`;
const crumb = (text, base='') => `<div class="breadcrumb"><a href="#home">Home</a>${chevron()}${base}<b>${text}</b></div>`;
const logo = `<a href="#home" class="logo" aria-label="WeCert home"><img src="assets/bridge.svg" width="37" height="37" alt=""><span>We<b>Cert</b></span></a>`;
function header(route) {
  const selected = route === 'course' ? 'courses' : route === 'lesson' ? 'dashboard' : route;
  return `<header><div class="container navbar">${logo}<nav aria-label="Main navigation">${navItems.map(([id,name]) =>
    `<a href="#${id}" ${id === selected ? 'class="selected" aria-current="page"' : ''}>${name}</a>`).join('')}</nav>
    <div class="account">${state.name === 'Alex Chan' && route === 'home' ?
      action('Try demo', 'demo', 'compact', arrow()) :
      `<button class="profile-link" type="button" data-action="profile"><span class="avatar">${esc(state.name.split(/\s+/).slice(0,2).map(n=>n[0]).join('').toUpperCase())}</span><span class="account-name">${esc(state.name)}</span>${icon('chev', 15)}</button>`}</div></div></header>`;
}
function footer() {
  return `<footer><div class="container footer-inner"><span class="footer-brand">WeCert <span>· Interactive prototype</span></span><div><a href="#about">About us</a><button type="button" data-action="help">Help centre</button><button type="button" data-action="privacy">Demo privacy</button></div></div></footer>`;
}
function home() {
  return `<main class="container home" id="main-content" tabindex="-1"><div class="home-grid">
    <section class="hero"><div class="hero-picture"></div><div class="hero-copy">
      <div class="hero-kicker"><i></i> Vocational training in Hong Kong</div>
      <h1>Build skills for your<br>next career move.</h1>
      <p>Find affordable training, take a free skills assessment and get support as you move into work.</p>
      <div class="hero-actions">${link('Start free assessment','#assessment','light',arrow())}${link('Browse courses','#courses','hero-secondary')}</div>
    </div></section>
    <section class="card registration"><div class="register-symbol">${tile('people')}</div><h2>Create your demo profile</h2><p>Try the learner experience with a display name, or continue with the sample profile.</p>
      <form id="profile-form"><div class="field"><label for="display-name">Display name</label><input id="display-name" class="input" name="name" placeholder="e.g. Alex Chan" maxlength="40" required autocomplete="off"></div>
      <button class="button full" type="submit">Create profile${arrow()}</button></form>
      <div class="account-hint"><a href="#dashboard">${state.name === "Alex Chan" ? "Continue as Alex Chan" : "Open learner dashboard"} ${chevron()}</a></div>
    </section></div>
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
  return `<article class="card course-card"><div class="course-card-top">${tile(course.icon,course.tone)}${badge(course.track,course.tone)}</div>
    <h2><a href="#course/${course.id}">${course.name}</a></h2><p>${course.about}</p>
    <div class="course-meta"><span>${icon('book',16)} ${course.mode}</span><span>${icon('clock',16)} ${course.weeks} weeks</span>${course.level ? `<span>${course.level}</span>` : ''}</div>
    <div class="course-card-bottom"><strong>${course.fee === null ? 'Custom quote' : money(course.fee)}</strong><a href="#course/${course.id}" class="text-link">View course ${chevron()}</a></div></article>`;
}
function catalogItems() {
  const query = filter.query.trim().toLowerCase();
  const results = courses.filter(c => (filter.type === 'All courses' || filter.type === c.type) &&
    (filter.mode === 'Any format' || filter.mode === c.mode) && (!query || [c.name,c.about,c.track].join(' ').toLowerCase().includes(query)));
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
  const corporate = course.type === 'Corporate training';
  const enrolled = Object.hasOwn(state.courses, course.id);
  return `<main class="container inner" id="main-content" tabindex="-1">${crumb(course.name,`<a href="#courses">Courses</a>${chevron()}`)}
    <div class="course-banner"><div>${badge(course.type,course.tone)}<h1>${course.name}</h1><p>${course.about}</p><div class="course-meta"><span>${icon('book',17)} ${course.mode}</span><span>${icon('clock',17)} ${course.weeks} weeks</span>${course.level ? `<span>${course.level}</span>` : ''}</div></div>${tile(course.icon,course.tone)}</div>
    <div class="detail-grid"><section class="card padded"><h2>What you’ll learn</h2><ol class="numbered-list">${course.units.map(u=>`<li>${u}</li>`).join('')}</ol>
      ${course.placement ? '<div class="inline-note"><strong>Internship pathway</strong><p>After completing the course and meeting the assessment standard, learners can be considered for a placement with a partner employer.</p></div>' : ''}
    </section><section class="card padded"><h2>${corporate ? 'Discuss team training' : 'Fees & qualifications'}</h2>
      <p class="detail-price">${corporate ? 'Custom quote' : money(course.fee)}</p>
      <p class="fineprint">${corporate ? 'Training can be adapted to your team’s needs.' : 'Illustrative course fee for this demo.'}</p>
      <dl><dt>Course outcome</dt><dd>${course.credential}</dd>${course.external ? `<dt>External pathway</dt><dd>${course.external}</dd>` : ''}</dl>
      <p class="fineprint">${course.external ? 'Exam entry and fees are separate. Exam subsidies and partner arrangements are proposed and subject to confirmation.' : corporate ? 'Send a sample enquiry to try the employer flow.' : 'CEF reimbursement is a proposed route for eligible registered courses. Eligibility and recognition must be confirmed.'}</p>
      ${corporate ? action('Try an employer enquiry','employer','',arrow()) : enrolled ? action('Open in dashboard','enrol','',arrow(),`data-id="${course.id}"`) : action('Try demo enrolment','enrol','',arrow(),`data-id="${course.id}"`)}
    </section></div></main>`;
}
function options(items, selected) {
  return items.map(value=>`<option value="${esc(value)}" ${value === selected ? 'selected' : ''}>${esc(value)}</option>`).join('');
}

function assessmentMatches(profile) {
  const ranked = courses.filter(c => c.fee !== null && c.fee <= profile.budget).map(course => {
    const matchGoal = course.goal === profile.goal;
    const matchMode = profile.mode === 'Any format' || profile.mode === course.mode;
    const matchSkill = !profile.skills.includes(course.skill);
    const matchHours = course.mode === 'Online' || profile.hours >= 4;
    const levelFit = course.level !== 'Intermediate' || profile.skills.includes(course.skill);
    const score = 6 * matchGoal + 3 * matchMode + 2 * matchSkill + 2 * matchHours + 3 * levelFit - course.fee / 500;
    return {course, score, matchGoal, matchMode, matchSkill};
  }).sort((a,b)=>b.score-a.score || a.course.fee-b.course.fee);
  return ranked.slice(0,3);
}
const fieldSelect = (label,name,items,value) => `<div class="field"><label for="assessment-${name}">${label}</label><select class="input" id="assessment-${name}" name="${name}" required>${options(items,value)}</select></div>`;
function assessment() {
  const profile = state.profile;
  const stepLabels = ['Your profile','Skills & goals','Course matches'];
  const steps = stepLabels.map((name,i)=>`<div class="step ${i === step ? 'current' : i < step ? 'done' : ''}" ${i === step ? 'aria-current="step"' : ''}><span class="step-circle">${i < step ? icon('check',16) : i+1}</span><b>${name}</b></div>`).join('<span class="step-line"></span>');
  return `<main class="container inner assessment" id="main-content" tabindex="-1">${crumb('Skills Assessment')}${titleBlock('Skills Assessment','Review your current skills and find training that fits your goals, schedule and budget.',badge('Free for all users'))}
  <div class="steps" aria-label="Assessment steps">${steps}</div>${step === 2 ? matchResults(profile) : assessmentForm(profile)}</main>`;
}
function assessmentForm(p) {
  const profileStep = step === 0;
  const fields = profileStep ? 
    `${fieldSelect('Highest education level','education',['Secondary school','Vocational training','Diploma or associate degree','Bachelor’s degree or above','Prefer not to say'],p.education)}
    ${fieldSelect('Work experience','experience',['No formal work experience','Less than 1 year','1–3 years','More than 3 years','Prefer not to say'],p.experience)}
    ${fieldSelect('Preferred study format','mode',formats,p.mode)}
    ${fieldSelect('When can you study?','availability',['Weekday evenings','Weekday daytime','Weekends','Flexible'],p.availability)}
    <div class="field"><label for="assessment-hours">Hours available per week</label><input type="number" id="assessment-hours" class="input" name="hours" min="1" max="40" value="${p.hours}" required></div>
    <div class="field"><label for="assessment-budget">Course budget (HK$)</label><input type="number" id="assessment-budget" class="input" name="budget" min="0" max="100000" value="${p.budget}" required></div>` :
    `${fieldSelect('Career goal','goal',goals,p.goal)}
    <fieldset class="span-two skills-fields"><legend>Which skills can you already use?</legend><div class="choice-grid">${skills.map(skill=>`<label class="choice"><input type="checkbox" name="skills" value="${skill}" ${p.skills.includes(skill) ? 'checked' : ''}> ${skill}</label>`).join('')}</div></fieldset>`;
  return `<div class="assessment-grid"><section class="card profile"><div class="panel-title">${tile(profileStep ? 'list' : 'target')}<div><h2>${profileStep ? 'Tell us about your starting point' : 'Choose your skills and career goal'}</h2><p>${profileStep ? 'Use the example answers or adjust them for your demo.' : 'Your choices help us identify training worth exploring.'}</p></div></div>
    <form id="assessment-form"><div class="field-grid">${fields}</div><div class="profile-bottom">${profileStep ? action('See sample matches','sample','outline') : action('Back','assessment-back','outline')}<button type="submit" class="button">${profileStep ? 'Continue' : 'See my course matches'}${arrow()}</button></div></form></section>
    <aside class="card padded assessment-aside"><div class="panel-title">${tile('shield','blue')}<div><h2>How matching works</h2><p>Take the assessment at your own pace.</p></div></div><ul class="plain-list"><li>We compare your career goal with course content.</li><li>We look for gaps between your current skills and what you want to learn.</li><li>We prioritise affordable options that suit your study preferences.</li></ul><p class="fineprint">Your answers stay in this browser. Sample details work throughout the demo.</p></aside></div>`;
}
function matchResults(p) {
  const ranked = assessmentMatches(p);
  return `<div class="assessment-grid"><section class="card profile"><div class="panel-title">${tile('list')}<div><h2>Your assessment profile</h2><p>Details used to match you with suitable training.</p></div></div>
    <dl class="profile-summary">
      <div><dt>Highest education level</dt><dd>${esc(p.education)}</dd></div><div><dt>Work experience</dt><dd>${esc(p.experience)}</dd></div>
      <div class="span-two"><dt>Current skills</dt><dd>${p.skills.length ? p.skills.map(s=>badge(s)).join(' ') : 'Starting from the basics'}</dd></div>
      <div><dt>Career goal</dt><dd>${esc(p.goal)}</dd></div><div><dt>Study availability</dt><dd>${esc(p.availability)} · ${p.hours} hours weekly</dd></div>
      <div><dt>Learning preference</dt><dd>${esc(p.mode)}</dd></div><div><dt>Course budget</dt><dd>Up to ${money(p.budget)}</dd></div>
    </dl><div class="profile-bottom">${action('Edit assessment','edit-assessment','outline')}<span>${icon('check',16)} Assessment completed</span></div></section>
    <div class="matches-col"><section class="card matches"><div class="panel-title">${tile('sparkle')}<div><h2>Your course matches</h2><p>Ranked for your goals, skill gaps, availability and budget.</p></div></div>
    ${ranked.length ? ranked.map(({course:c,matchGoal,matchMode},i)=>`<article class="match ${i===0?'best':''}"><div class="match-top">${i===0?badge('Best fit'):'<span class="match-label">Alternative</span>'}<b>${money(c.fee)}</b></div><h3>${c.name}</h3><p>${matchGoal ? 'Matches your career goal.' : 'An option within your budget.'} ${matchMode ? 'Fits your study preference.' : 'Consider a different study format.'}</p><div class="match-bottom"><span>${c.mode} · ${c.weeks} weeks</span><a class="text-link" href="#course/${c.id}">View course ${chevron()}</a></div></article>`).join('') :
    `<div class="inline-note"><strong>No courses within this budget</strong><p>Adjust your budget or ask a career adviser about funding options.</p></div>`}</section>
    <section class="review">${tile('shield')}<div><h3>Career adviser review</h3><p>Try requesting a review of your course matches.</p></div>${state.review?badge('Pending review','sand'):action('Request review','review','outline compact')}</section></div></div>`;
}

function dashboard() {
  const selected = getCourse(state.selectedCourse) || getCourse('spreadsheets');
  const completed = state.courses[selected.id] || [];
  const total = selected.id === 'spreadsheets' ? lessons.length : selected.units.length;
  const percentage = Math.round(completed.length * 100 / total);
  const next = Array.from({length:total},(_,i)=>i+1).find(i=>!completed.includes(i)) || total;
  const lessonTitle = (selected.id === 'spreadsheets' ? lessons : selected.units)[next-1];
  const stats = [
    ['chart','mint','Course progress',percentage + '% complete',completed.length + ' of ' + total + ' lessons completed'],
    ['award','blue','Exam preparation',state.exam.length + ' of 4 tasks',state.exam.length === 4 ? 'Checklist complete' : 'Review your exam checklist'],
    ['calendar','sand','Career support',state.appointment ? state.appointment.type + ' booked' : 'Book an appointment',state.appointment ? state.appointment.slot : 'CV, guidance and job referrals'],
    ['target','mint','Long-term goal',state.profile.goal === 'Office administration' ? 'Administrative assistant' : state.profile.goal,'Based on your assessment']
  ];
  return `<main class="container inner dashboard" id="main-content" tabindex="-1">${crumb('Career Dashboard')}${titleBlock('Personal Career Dashboard',`Welcome back, ${esc(state.name.split(/\s+/)[0])}. Pick up where you left off.`,action('View learning plan','plan','outline',arrow()))}
    <section class="dashboard-stats" aria-label="Progress summary">${stats.map(([symbol,tone,label,value,desc])=>`<article class="card stat">${tile(symbol,tone)}<div><span>${label}</span><strong>${esc(value)}</strong><small>${esc(desc)}</small></div></article>`).join('')}</section>
    <div class="dashboard-grid"><section class="card lesson"><div class="lesson-title"><div><h2>Continue learning</h2><p>${selected.name}</p></div>${badge(percentage === 100 ? 'Completed' : 'In progress')}</div>
      <div class="lesson-body"><a class="video" href="#lesson/${next}" aria-label="Open lesson ${next}"><span class="video-play">${icon('play',28)}</span>${selected.id==='spreadsheets'&&next===7?'<span class="duration">0:32</span>':''}</a>
      <div class="lesson-detail"><div class="lesson-index">Lesson ${next} of ${total}</div><h3>${lessonTitle}</h3><p>${selected.id === 'spreadsheets' ? lessonPractice[next-1] : selected.about}</p>${link(percentage === 100 ? 'Review lesson' : 'Resume lesson','#lesson/'+next,'',icon('play',17))}
      <div class="lesson-progress">${bar(percentage)}<span>${percentage}%</span></div></div></div>
      <div class="discussion"><div class="discussion-head"><div>${icon('chat',21)}<h3>Lesson comments</h3></div><div class="discussion-options">${link('Ask AI','#lesson/'+next+'/ai','outline compact',icon('sparkle',15))}${link('Ask your teacher','#lesson/'+next+'/teacher','outline compact')}</div></div><p class="fineprint">Ask a question or review your saved discussion in the lesson.</p></div>
    </section><div class="dashboard-side"><section class="card prep"><div class="panel-title">${tile('award','blue')}<div><h2>Exam preparation</h2><p>Practice checklist</p></div></div>
      <div class="checklist">${['Review spreadsheet basics','Complete formulas practice','Take the practice test','Review mistakes before the exam'].map((item,i)=>`<label><input type="checkbox" data-exam="${i}" ${state.exam.includes(i)?'checked':''}> ${item}</label>`).join('')}</div>
    </section><section class="card support"><div class="panel-title">${tile('briefcase','sand')}<div><h2>Employment support</h2><p>Free after training for eligible low-income learners.</p></div></div>
      <div class="support-links">${supportTypes.map(s=>action(s.name,'book','outline compact','',`data-type="${s.name}"`)).join('')}</div>
      ${state.appointment?`<p class="fineprint">Booked in demo · ${esc(state.appointment.slot)}</p>${action('Manage appointment','book','plain-button')}`:'<p class="fineprint">Choose a service to try booking a sample appointment.</p>'}</section></div></div>
    <section class="next-course"><div>${tile('chart')}<div><h3>Recommended next course</h3><p>Intermediate Spreadsheets · A follow-on from Spreadsheet Essentials</p></div></div>${link('View course','#course/intermediate','outline compact',arrow())}</section>
    <div class="dashboard-extra"><section class="card padded"><div class="panel-title">${tile('people','sand')}<div><h2>Internship pathway</h2><p>Practise your new skills with a partner employer.</p></div></div>
      <p>Complete a qualifying main course and meet its assessment standard before applying. An internship can lead to further job opportunities based on performance and employer availability.</p>
      ${state.interest?badge('Interest saved'):action('Check demo eligibility','internship','outline',arrow())}</section>
    <section class="card padded"><div class="panel-title">${tile('chart')}<div><h2>Income after employment</h2><p>Compare monthly pay before and after training.</p></div></div>
      ${state.salary?`<p class="salary-summary">${salaryResult(state.salary)}</p>`:'<p>Try the Income Improvement After Employment (IIAE) calculator with example figures.</p>'}
      ${action(state.salary?'Update example figures':'Try income calculator','income','outline',arrow())}</section></div></main>`;
}
function lessonPage() {
  const c = getCourse(state.selectedCourse) || getCourse('spreadsheets');
  const names = c.id === 'spreadsheets' ? lessons : c.units;
  activeLesson = Math.min(Math.max(Number(subroute()) || 1,1),names.length);
  const ask = location.hash.slice(1).split('/')[2];
  const completed = state.courses[c.id] || [];
  const player = c.id === 'spreadsheets' && activeLesson === 7;
  const savedComments = state.comments.filter(comment=>comment.course === c.id && comment.lesson === activeLesson);
  return `<main class="container inner" id="main-content" tabindex="-1">${crumb('Lesson '+activeLesson,`<a href="#dashboard">Career Dashboard</a>${chevron()}`)}
  ${titleBlock(names[activeLesson-1],c.name+' · Lesson '+activeLesson+' of '+names.length,link('Back to dashboard','#dashboard','outline'))}
  <div class="learning-grid"><section class="card padded lesson-page">
    ${player ? `<video class="lesson-video" controls playsinline preload="metadata" poster="assets/instructor.jpg" aria-label="Sort and filter your data lesson"><source src="assets/spreadsheet-lesson.mp4" type="video/mp4"><a href="assets/spreadsheet-lesson.mp4">Open the lesson video</a></video>` : ''}
    <h2>Practice task</h2><p>${c.id === 'spreadsheets' ? lessonPractice[activeLesson-1] : 'Work through this topic and note two ways you could use it in your own workplace.'}</p>
    ${player ? '<details class="inline-note"><summary>Read the video transcript</summary><p>Sort changes the order of your rows. Select the full table, then sort Hours from largest to smallest. Filter hides rows that do not match. Select Open in the Status column to show open tasks only. Clear the filter to see every row again.</p></details>' : ''}
    <div class="lesson-controls">${completed.includes(activeLesson)?badge('Lesson completed'):action('Mark lesson complete','complete','',icon('check',17))}${activeLesson<names.length?link('Next lesson','#lesson/'+(activeLesson+1),'outline',arrow()):action('Take practice test','quiz','outline',arrow())}</div>
    <section class="lesson-comments"><h2>Lesson comments</h2><p>Ask about the lesson. The demo gives a sample AI reply or saves a question for your teacher.</p>
    <form id="comment-form"><div class="field"><label for="comment-recipient">Send question to</label><select class="input" id="comment-recipient" name="recipient">${options(['AI tutor','Teacher'],ask === 'teacher' ? 'Teacher' : 'AI tutor')}</select></div>
    <div class="field"><label for="lesson-question">Your question</label><textarea id="lesson-question" name="question" class="input" placeholder="What is the difference between sorting and filtering?" rows="3" maxlength="350" required></textarea></div><button class="button" type="submit">Post question${arrow()}</button></form>
    ${savedComments.map(comment=>`<div class="comment"><strong>${esc(state.name)} → ${esc(comment.recipient)}</strong><p>${esc(comment.question)}</p><strong>${comment.recipient==='AI tutor'?'AI tutor · Demo reply':'Teacher · Demo status'}</strong><p>${esc(comment.reply)}</p></div>`).join('')}</section>
  </section><aside class="card padded curriculum"><h2>Course lessons</h2>${names.map((name,i)=>`<a href="#lesson/${i+1}" ${activeLesson===i+1?'class="current" aria-current="page"':''}><span>${completed.includes(i+1)?icon('check',16):i+1}</span>${name}</a>`).join('')}</aside></div></main>`;
}
function about() {
  return `<main class="container inner" id="main-content" tabindex="-1">${crumb('About WeCert')}${titleBlock('About WeCert','Affordable training and career support for people facing barriers to work in Hong Kong.')}
    <section class="about-banner"><div><h2>Make career change more accessible</h2><p>WeCert is a proposed social enterprise for unemployed people and people on low incomes. It combines flexible vocational training, qualification pathways and support into employment to widen access to career opportunities.</p>${link('Explore learner services','#courses','light',arrow())}</div><img src="assets/learners.jpg" alt="Two adult learners working together on a laptop"></section>
    <section class="about-grid">
      <article class="card padded">${tile('book')}<h2>Hybrid learning</h2><p>Study online, attend practical face-to-face sessions or combine both. Instructors, course coordinators and the technical team support delivery.</p></article>
      <article class="card padded">${tile('briefcase','sand')}<h2>Pathways into work</h2><p>Qualifying learners can be considered for internships. After training, eligible learners can access free CV review, career guidance and partner job referrals.</p></article>
      <article class="card padded">${tile('award','blue')}<h2>Qualifications & funding</h2><p>Course pages distinguish completion records from external examinations. The proposal plans to use Specification of Generic Competencies (SGC) courses and follow Qualifications Framework award titles and credit rules where applicable. It also considers CEF reimbursement for eligible courses and exam subsidies through confirmed partners.</p></article>
      <article class="card padded">${tile('chart')}<h2>Measuring social impact</h2><p>The proposal sets a target of 15–20% average growth in monthly income one year after training, measured through the Income Improvement After Employment (IIAE) indicator.</p><p class="fineprint">This figure is a proposed target.</p></article>
    </section>
    <section class="card padded proposal"><h2>Pilot proposal</h2><div class="proposal-grid">
      <div><h3>Funding and sustainability</h3><p>The proposal identifies the Cyberport Creative Micro Fund, SIE Fund and HKSTP Ideation as potential startup funding routes. Course fees, corporate training and advertising are planned revenue sources. The six-month forecast excludes grants.</p></div>
      <div><h3>Six-month financial assumptions</h3><dl class="financials"><dt>Projected revenue</dt><dd>HK$420,000</dd><dt>Estimated expenditure</dt><dd>HK$642,200</dd><dt>Projected shortfall</dt><dd>HK$222,200</dd></dl></div>
      <div><h3>Checks before launch</h3><p>Confirm qualification recognition, internship and referral arrangements, any employment-matching licence requirements, and privacy and data-retention procedures before offering services.</p></div>
    </div></section></main>`;
}
function notFound() {
  return `<main class="container inner" id="main-content" tabindex="-1">${titleBlock('Page not found','Return to the homepage or explore available courses.')}${link('Back to homepage','#home','',arrow())}</main>`;
}

function modal(title, body) {
  dialog.innerHTML = `<div class="modal-head"><h2 id="modal-title">${title}</h2><button type="button" data-action="close" class="icon-button" aria-label="Close dialog">×</button></div>${body}`;
  dialog.setAttribute('aria-labelledby','modal-title');
  if (!dialog.open) dialog.showModal();
}
function note(text) {
  announce.textContent = text;
  const previous = document.querySelector('.toast');
  if (previous) previous.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = text;
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
  modal('Spreadsheet practice test', `<p>Choose the action that shows only rows marked Open while keeping every row in the sheet.</p><form id="quiz-form" class="dialog-form"><fieldset class="skills-fields"><legend>What would you use?</legend><div class="quiz-options">${['Sort by Status','Filter Status to Open','Delete the Closed rows'].map((choice,i)=>`<label class="choice"><input type="radio" name="answer" value="${i}" required> ${choice}</label>`).join('')}</div></fieldset><p id="quiz-feedback" aria-live="polite"></p>${submitButton('Check answer')}</form>`);
}
function render(moveFocus=false) {
  const route = currentRoute();
  const views = {home,courses:catalog,course:()=>courseDetail(getCourse(subroute())),assessment,dashboard,lesson:lessonPage,about};
  app.innerHTML = header(route) + (Object.hasOwn(views,route) ? views[route]() : notFound()) + footer();
  const heading = document.querySelector('main h1');
  document.title = route === 'home' ? 'WeCert | Vocational Training & Career Support' : (heading?.textContent.trim() || 'Page') + ' | WeCert';
  if (moveFocus) document.querySelector('#main-content')?.focus({preventScroll:true});
}
function go(route) {
  if (location.hash === '#'+route) { render(true); return; }
  location.hash = route;
}
function refreshAssessment() {
  save();
  render(true);
}
function changeFilter() {
  document.querySelector('#course-results').innerHTML = catalogItems();
}
function resetModal() {
  modal('Demo privacy', `<p>Demo profiles, assessment answers, comments, bookings and income examples are stored in this browser. Use sample details. The demo does not create an account, process payments or send questions and bookings to staff.</p><p>You can clear your changes and return to the sample profile.</p><div class="modal-actions">${action('Reset demo data','reset','outline')}${action('Done','close')}</div>`);
}
function actions(button) {
  switch (button.dataset.action) {
    case 'close': dialog.close(); break;
    case 'demo': go('dashboard'); break;
    case 'profile':
      modal('Learner profile', `<p>Change the display name for this browser.</p><form id="profile-form" class="dialog-form"><div class="field"><label for="modal-name">Display name</label><input class="input" id="modal-name" name="name" value="${esc(state.name)}" maxlength="40" required></div>${submitButton('Save profile')}</form>`);
      break;
    case 'sample':
      if (state.assessed) state.review = false;
      state.profile = {...sampleProfile};
      state.assessed = true;
      step = 2;
      refreshAssessment();
      break;
    case 'edit-assessment':
    case 'assessment-back':
      step = 0;
      render(true);
      break;
    case 'review':
      state.review = true;
      save();
      render();
      note('Demo adviser review requested.');
      break;
    case 'clear-filters':
      filter = {type:'All courses',mode:'Any format',query:''};
      go('courses');
      break;
    case 'enrol': {
      const course = getCourse(button.dataset.id);
      if (!course) break;
      if (!Object.hasOwn(state.courses,course.id)) state.courses[course.id] = [];
      state.selectedCourse = course.id;
      save();
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
      save();
      dialog.close();
      render();
      break;
    case 'complete': {
      const id = state.selectedCourse;
      const completed = state.courses[id] || [];
      state.courses[id] = [...new Set([...completed,activeLesson])];
      save();
      render();
      note('Lesson complete. Your course progress was updated.');
      break;
    }
    case 'quiz': quiz(); break;
    case 'book': showBooking(button.dataset.type); break;
    case 'cancel-booking':
      state.appointment = null;
      save();
      dialog.close();
      render();
      note('Demo booking cancelled.');
      break;
    case 'income': {
      const s = state.salary || {before:10000,after:11750};
      modal('Income improvement calculator', `<p>Use example monthly income before training and after employment. Amounts are in Hong Kong dollars.</p>
        <form id="income-form" class="dialog-form"><div class="field-grid"><div class="field"><label for="income-before">Monthly income before (HK$)</label><input id="income-before" name="before" type="number" class="input" min="0" max="10000000" value="${s.before}" required></div>
        <div class="field"><label for="income-after">Monthly income after (HK$)</label><input id="income-after" name="after" type="number" class="input" min="0" max="10000000" value="${s.after}" required></div></div>${submitButton('Calculate and save example')}</form>`);
      break;
    }
    case 'internship': {
      const eligible = lessons.every((_,i)=>state.courses.spreadsheets?.includes(i+1)) && state.quiz;
      modal('Internship eligibility', `<p>${eligible ? 'You completed the Spreadsheet Essentials demo lessons and passed the practice test. Try registering interest in a placement.' : 'To try this pathway, complete all ten Spreadsheet Essentials demo lessons and pass the spreadsheet practice test.'}</p><div class="modal-actions">${eligible ? action('Register demo interest','save-interest','',arrow()) : action('Take practice test','quiz','outline')}${action('Close','close','outline')}</div>`);
      break;
    }
    case 'save-interest':
      state.interest = true;
      save();
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
document.addEventListener('click',event=>{
  const button = event.target.closest('button[data-action]');
  if (button) actions(button);
  const anchor = event.target.closest('a[href^="#"]');
  if (anchor && dialog.open) dialog.close();
  if (anchor?.classList.contains('skip')) {
    event.preventDefault();
    document.querySelector('#main-content').focus();
  }
});
document.addEventListener('input',event=>{
  if (event.target.id !== 'course-search') return;
  filter.query = event.target.value;
  changeFilter();
});
document.addEventListener('change',event=>{
  const field = event.target;
  if (field.id === 'course-type') { filter.type = field.value; changeFilter(); }
  if (field.id === 'course-mode') { filter.mode = field.value; changeFilter(); }
  if (field.dataset.exam !== undefined) {
    const task = Number(field.dataset.exam);
    state.exam = field.checked ? [...new Set([...state.exam,task])] : state.exam.filter(n=>n!==task);
    save();
    const stats = document.querySelectorAll('.stat');
    stats[1].querySelector('strong').textContent = state.exam.length+' of 4 tasks';
    stats[1].querySelector('small').textContent = state.exam.length===4?'Checklist complete':'Review your exam checklist';
  }
});
function tutorReply(question) {
  if (/filter|sort/i.test(question)) return 'Sorting rearranges rows. Filtering hides rows that do not match your condition. Try sorting the full table by Hours, then filtering Status to Open.';
  if (/formula|sum|average|count/i.test(question)) return 'Start a formula with an equals sign. For example, =SUM(B2:B5) adds the values in cells B2 to B5. Check the range before you press Enter.';
  if (/chart|graph/i.test(question)) return 'Select the labels and values you want to chart, then choose a column chart. A short title and clear axis labels help people read the result.';
  return 'Try repeating the practice task with two or three example rows. Check the result after each step and note where it differs from what you expected.';
}
document.addEventListener('submit',event=>{
  const form = event.target;
  const data = new FormData(form);
  event.preventDefault();
  switch (form.id) {
    case 'profile-form': {
      const name = data.get('name').trim();
      if (!name) {
        const field = form.elements.name;
        field.setCustomValidity('Enter a display name.');
        field.reportValidity();
        field.addEventListener('input',()=>field.setCustomValidity(''),{once:true});
        return;
      }
      state.name = name;
      save();
      if (dialog.open) { dialog.close(); render(); } else { go('dashboard'); }
      note('Demo profile saved.');
      break;
    }
    case 'assessment-form':
      if (step === 0) {
        state.profile = {...state.profile,education:data.get('education'),experience:data.get('experience'),mode:data.get('mode'),availability:data.get('availability'),hours:Number(data.get('hours')),budget:Number(data.get('budget'))};
      } else {
        state.profile = {...state.profile,goal:data.get('goal'),skills:data.getAll('skills')};
        state.assessed = true;
        state.review = false;
      }
      step++;
      refreshAssessment();
      break;
    case 'comment-form': {
      const question = data.get('question').trim();
      if (!question) return;
      const recipient = data.get('recipient');
      const reply = recipient === 'AI tutor' ? tutorReply(question) : 'Question saved in the demo. In a live course, your teacher would reply in this discussion.';
      state.comments.push({course:state.selectedCourse,lesson:activeLesson,recipient,question,reply});
      save();
      render();
      document.querySelector('.comment:last-child')?.scrollIntoView({block:'nearest'});
      note(recipient === 'AI tutor' ? 'Sample AI reply added.' : 'Teacher question saved in this demo.');
      break;
    }
    case 'booking-form':
      state.appointment = {type:data.get('type'),slot:data.get('slot')};
      save();
      dialog.close();
      render();
      note('Career appointment saved in this demo.');
      break;
    case 'income-form':
      state.salary = {before:Number(data.get('before')),after:Number(data.get('after'))};
      save();
      dialog.close();
      render();
      note('Income comparison saved in this demo.');
      break;
    case 'quiz-form': {
      const correct = data.get('answer') === '1';
      document.querySelector('#quiz-feedback').textContent = correct ? 'Correct. Filtering hides rows outside your chosen condition and keeps the underlying data.' : 'Try again. Which action keeps the data and hides rows temporarily?';
      if (correct) {
        state.quiz = true;
        state.exam = [...new Set([...state.exam,2])];
        save();
      }
      break;
    }
    case 'employer-form':
      modal('Sample enquiry',`<p>${esc(data.get('topic').trim())}</p><p>This previews the training request a company could submit.</p><div class="modal-actions">${action('Done','close')}</div>`);
      break;
  }
});
function routeChanged() {
  if (dialog.open) dialog.close();
  if (currentRoute()==='assessment') step = state.assessed ? 2 : 0;
  if (currentRoute()==='courses') {
    const category = categories.find(c=>encodeURIComponent(c.name)===subroute());
    filter = {type:category?.name||'All courses',mode:'Any format',query:''};
  }
  render(true);
  window.scrollTo(0,0);
}
window.addEventListener('hashchange',routeChanged);
routeChanged();
