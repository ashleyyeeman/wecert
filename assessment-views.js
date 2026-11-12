'use strict';

const fieldSelect = (label,name,items,value) => `<div class="field"><label for="assessment-${name}">${label}</label><select class="input" id="assessment-${name}" name="${name}" required>${options(items,value)}</select></div>`;
function assessment() {
  const profile = state.profile;
  const stepLabels = ['Your profile','Skills & goals','Skill scenarios','Your learning path'];
  const steps = stepLabels.map((name,i)=>`<div class="step ${i === step ? 'current' : i < step ? 'done' : ''}" ${i === step ? 'aria-current="step"' : ''}><span class="step-circle">${i < step ? icon('check',16) : i+1}</span><b>${name}</b></div>`).join('<span class="step-line"></span>');
  return `<main class="container inner assessment" id="main-content" tabindex="-1">${crumb('Skills Assessment')}${titleBlock('Skills Assessment','Review your current skills and find training that fits your goals, schedule and budget.',badge('Free for all users'))}
  <div class="steps" aria-label="Assessment steps">${steps}</div>${step === 3 ? matchResults(profile) : step === 2 ? scenarioForm(profile) : assessmentForm(profile)}</main>`;
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
    <form id="assessment-form"><div class="field-grid">${fields}</div><div class="profile-bottom">${profileStep ? action('Try sample profile','sample','outline') : action('Back','assessment-back','outline')}<button type="submit" class="button">${profileStep ? 'Continue' : 'Try skill scenarios'}${arrow()}</button></div></form></section>
    <aside class="card padded assessment-aside"><div class="panel-title">${tile('shield','blue')}<div><h2>How matching works</h2><p>Take the assessment at your own pace.</p></div></div><ul class="plain-list"><li>We check four goal-specific scenarios alongside your self-reported skills.</li><li>Budget, weekly hours, timetable, format and prerequisites determine which courses fit.</li><li>Education and experience guide support suggestions; they do not restrict access to beginner courses.</li></ul><p class="fineprint">Your answers stay in this browser. Sample details work throughout the demo.</p></aside></div>`;
}
function scenarioForm(p) {
  return `<section class="card padded scenario-panel"><h2>Try four short scenarios</h2><p>${esc(p.goal)} · This learning check is a starting point, not a certified skills test.</p><form id="scenario-form" class="dialog-form">
    ${questionsFor(p).map((q,i)=>`<fieldset class="scenario"><legend>${i+1}. ${q.question}</legend>${q.choices.map((c,j)=>`<label class="choice"><input type="radio" name="q${i}" value="${j}" ${String(state.assessmentAnswers[i])===String(j)?'checked':''} required> ${c}</label>`).join('')}</fieldset>`).join('')}
    <div class="modal-actions">${action('Back to skills','skills-back','outline')}${submitButton('Build my learning path')}</div></form></section>`;
}
function supportSuggestion(p) {
  const suggestions = [];
  if (p.education === 'Secondary school' || p.education === 'Prefer not to say') suggestions.push('Beginner routes have no formal qualification requirement. Ask for study guidance if returning to learning.');
  if (['No formal work experience','Less than 1 year'].includes(p.experience)) suggestions.push('Start a small practice portfolio, then explore CV support and internship eligibility.');
  else suggestions.push('Use examples from your work experience in practice tasks and your next CV.');
  return suggestions.join(' ');
}
function matchResults(p) {
  const ranked = assessmentMatches(p);
  const evidence = assessmentEvidence(p,state.assessmentAnswers);
  const strong = Object.entries(evidence).filter(([,v])=>v.correct===v.total).map(([k])=>k);
  const gaps = Object.entries(evidence).filter(([,v])=>v.correct<v.total).map(([k])=>k);
  const right = questionsFor(p).filter((q,i)=>Number(state.assessmentAnswers[i])===q.answer).length;
  const intermediateBlocked = p.goal === 'Office administration' && !hasPrerequisite(getCourse('intermediate'),p,state.assessmentAnswers,state.courses);
  return `<section class="card padded learning-result"><div class="panel-title">${tile('target')}<div><h2>Your recommended learning path</h2><p>${right} of 4 scenarios answered correctly · ${esc(p.goal)}</p></div></div>
    <div class="evidence-grid"><div><h3>Skills demonstrated in this check</h3><p>${strong.length ? strong.map(s=>badge(s)).join(' ') : 'No skill area fully demonstrated yet. Start with guided practice.'}</p></div><div><h3>Skills to strengthen</h3><p>${gaps.length ? gaps.map(s=>badge(s,'sand')).join(' ') : 'All four scenarios correct. Build confidence through practical work.'}</p></div></div>
    <p class="fineprint">This brief check samples a few skills; it does not verify workplace competence. Your self-reported skills are kept separately below.</p>
    <ol class="learning-sequence"><li><strong>Learn</strong><span>${ranked[0] ? esc(ranked[0].course.name) : 'Start with free guided material'}</span></li><li><strong>Practise</strong><span>Complete course tasks and the relevant knowledge check.</span></li><li><strong>Prepare for work</strong><span>Build a CV, discuss opportunities and track your progress.</span></li></ol>
    <div class="matches-list">${ranked.map(({course:c,matchGoal,gap},i)=>`<article class="match ${i===0?'best':''}"><div class="match-top">${badge(i===0?'Best available fit':'Alternative',c.demo?'mint':'sand')}<b>${money(c.fee)} total</b></div><h3>${c.name}</h3><p>${matchGoal?'Supports your career goal.':'An exploratory option; it does not directly match your chosen career goal.'} ${gap?'Addresses a gap in your scenario answers.':''} Meets your budget, ${p.hours}-hour weekly limit and ${esc(p.availability.toLowerCase())} availability.</p><p class="fineprint">${c.schedule.time} · ${c.demo?'Complete demo route':'Course preview only'}</p><a class="text-link" href="#course/${c.id}">View course ${chevron()}</a></article>`).join('')}</div>
    ${!ranked.length?'<div class="inline-note"><strong>No paid course meets all your current constraints</strong><p>Keep your budget and schedule. Start with free resources below or save a sample funding enquiry.</p></div>':''}
    ${intermediateBlocked?'<div class="inline-note"><strong>Intermediate Spreadsheets: after foundations</strong><p>Complete Spreadsheet Essentials first, or report spreadsheet experience and answer both spreadsheet scenarios correctly. It is not an immediate recommendation.</p></div>':''}
    <div class="resource-strip"><div><h3>A next step at every budget</h3><p>Free introductory lessons need no enrolment. Funding options remain subject to confirmation.</p></div>${link('Free starter resources','#resources','outline')}${action('Ask about funding','funding','outline')}</div>
    <details class="profile-details"><summary>Profile, matching inputs and scenario feedback</summary><dl class="profile-summary"><div><dt>Education</dt><dd>${esc(p.education)}</dd></div><div><dt>Work experience</dt><dd>${esc(p.experience)}</dd></div><div><dt>Self-reported skills</dt><dd>${esc(p.skills.join(', ')||'Starting from the basics')}</dd></div><div><dt>Budget and format</dt><dd>${money(p.budget)} · ${esc(p.mode)}</dd></div><div><dt>Availability</dt><dd>${esc(p.availability)} · ${p.hours} hours/week</dd></div></dl><p>${supportSuggestion(p)}</p>
    ${questionsFor(p).map((q,i)=>`<div class="scenario-feedback"><strong>${Number(state.assessmentAnswers[i])===q.answer?'Correct':'Practise this'} · ${q.skill}</strong><p>${q.question}</p><p>Your answer: ${esc(q.choices[state.assessmentAnswers[i]]||'Not answered')}. ${q.explanation}</p></div>`).join('')}</details>
    <div class="profile-bottom">${action('Edit assessment','edit-assessment','outline')}${state.review?badge('Demo review saved','sand'):action('Request adviser review','review','outline')}</div><p class="fineprint">Adviser requests are saved locally; no staff member is notified.</p></section>`;
}

