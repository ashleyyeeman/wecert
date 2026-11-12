'use strict';

function dashboard() {
  const selected = getCourse(state.selectedCourse) || getCourse('spreadsheets');
  const units = courseLessons(selected);
  const completed = state.courses[selected.id] || [];
  const total = units.length;
  const percentage = Math.round(completed.length * 100 / total);
  const next = units.findIndex((_,i)=>!completed.includes(i+1))+1 || total;
  const prep = state.examByCourse[selected.id] || [];
  const passed = state.quizByCourse[selected.id];
  const learned = completed.length === total;
  const nextText = !state.assessed ? 'Complete your skills assessment to personalise this learning plan.' : !selected.demo ? 'Explore this preview or switch to a complete demo route.' : !learned ? `Complete Lesson ${next}, then try its practice task.` : !passed ? 'Try your course knowledge check and review any mistakes.' : 'Prepare your CV and explore career support.';
  const nextLink = !state.assessed ? '#assessment' : !selected.demo ? '#courses' : !learned ? lessonHref(selected.id,next) : null;
  const recommendation = nextCourseRecommendation(selected,state);
  const followOn = recommendation?.course;
  const stats = [
    ['chart','mint','Course progress',percentage + '% complete',completed.length + ' of ' + total + (selected.demo?' lessons completed':' preview topics explored')],
    ['award','blue','Knowledge check',selected.demo?(passed?'Passed':prep.length + ' of 4 prep tasks'):'Preview only',selected.demo?'Course-specific practice; not an external award':'No assessment available yet'],
    ['calendar','sand','Career support',state.appointment ? 'Demo booking saved' : 'Explore support',state.appointment ? state.appointment.slot : 'CV, guidance and referral interests'],
    ['target','mint','Long-term goal',state.profile.goal === 'Office administration' ? 'Administrative assistant' : state.profile.goal,'A goal to explore, not a job guarantee']
  ];
  const stage = !state.assessed?0:!selected.demo||!learned?1:!passed?2:3;
  return `<main class="container inner dashboard" id="main-content" tabindex="-1">${crumb('Career Dashboard')}${titleBlock('Personal Career Dashboard',`Welcome back, ${esc(state.name.split(/\s+/)[0])}. Pick up where you left off.`,action('Switch course','plan','outline',arrow()))}
    <section class="next-step"><div>${badge('Your next step')}<h2>${nextText}</h2><p>${selected.name} · ${selected.demo?'Complete demo route':'Course preview'}</p></div>${nextLink?link(!state.assessed?'Start free assessment':selected.demo?'Continue learning':'Explore courses',nextLink,'light',arrow()):!passed?action('Take knowledge check','quiz','light'):action('Explore career support','book','light')}</section>
    <ol class="personal-path" aria-label="Your career pathway">${['Assessment','Training','Practice & check','Career preparation'].map((label,i)=>`<li class="${i===stage?'current':i<stage?'done':''}" ${i===stage?'aria-current="step"':''}><span>${i<stage?'✓':i+1}</span>${label}</li>`).join('')}</ol>
    ${!state.assessed?`<p class="inline-note">You are exploring a sample learning plan. ${link('Personalise it with the assessment','#assessment','outline compact')}</p>`:''}
    <section class="dashboard-stats" aria-label="Progress summary">${stats.map(([symbol,tone,label,value,desc])=>`<article class="card stat">${tile(symbol,tone)}<div><span>${label}</span><strong>${esc(value)}</strong><small>${esc(desc)}</small></div></article>`).join('')}</section>
    <div class="dashboard-grid"><section class="card lesson"><div class="lesson-title"><div><h2>${learned?'Review learning':'Continue learning'}</h2><p>${selected.name}</p></div>${badge(selected.demo?(percentage===100?'Lessons completed':'In progress'):'Preview','mint')}</div>
      <div class="lesson-body"><a class="video course-visual ${selected.tone}" href="${lessonHref(selected.id,next)}" aria-label="Open ${esc(selected.name)} lesson ${next}">${icon(selected.icon,58)}<span class="video-play">${icon('play',28)}</span></a>
      <div class="lesson-detail"><div class="lesson-index">${selected.demo?'Lesson':'Preview topic'} ${next} of ${total}</div><h3>${units[next-1].title}</h3><p>${units[next-1].task}</p>${link(learned?'Review lesson':'Resume lesson',lessonHref(selected.id,next),'',icon('play',17))}<div class="lesson-progress">${bar(percentage)}<span>${percentage}%</span></div></div></div>
      <div class="discussion"><div class="discussion-head"><div>${icon('chat',21)}<h3>Lesson questions</h3></div><div class="discussion-options">${link('Sample tutor',lessonHref(selected.id,next,'ai'),'outline compact',icon('sparkle',15))}${link('Ask your teacher',lessonHref(selected.id,next,'teacher'),'outline compact')}</div></div><p class="fineprint">Tutor replies are scripted from the lesson; teacher questions stay in this browser.</p></div>
    </section><div class="dashboard-side"><section class="card prep"><div class="panel-title">${tile('award','blue')}<div><h2>Course preparation</h2><p>${selected.demo?'Your course checklist':'Preview — no exam yet'}</p></div></div>
      ${selected.demo?`<div class="checklist">${coursePreparation[selected.id].map((item,i)=>`<label><input type="checkbox" data-exam="${i}" ${prep.includes(i)?'checked':''} ${i===2?'disabled':''}> ${item}${i===2?' (automatic)':''}</label>`).join('')}</div>${action(passed?'Review knowledge check':'Try knowledge check','quiz','outline compact')}`:'<p class="fineprint">Switch to Spreadsheet Essentials, Office Digital Literacy or Japanese for the complete demo.</p>'}
    </section><section class="card support"><div class="panel-title">${tile('briefcase','sand')}<div><h2>Employment support</h2><p>Proposed free service after training for eligible learners.</p></div></div><div class="support-links">${supportTypes.map(s=>action(s.name,'book','outline compact','',`data-type="${s.name}"`)).join('')}</div><p class="fineprint">${state.appointment?'Sample booking saved · '+esc(state.appointment.slot):'Sample appointments only. Nothing is sent to staff.'}</p>${state.appointment?action('Manage appointment','book','outline compact'):''}</section></div></div>
    <section class="next-course"><div>${tile('chart')}<div><h3>${followOn?'Your possible next course':'Build your next learning plan'}</h3><p>${followOn?followOn.name+(!recommendation.ready?' · After completing spreadsheet foundations':' · Fits your budget, study times and career direction'):'No further course currently fits your goal, budget and study times. Explore free resources or review your assessment.'}</p></div></div>${link(followOn?'View course':'Free starter resources',followOn?'#course/'+followOn.id:'#resources','outline compact',arrow())}</section>
    <div class="dashboard-extra"><section class="card padded"><div class="panel-title">${tile('people','sand')}<div><h2>Internship pathway</h2><p>Connect learning to workplace practice.</p></div></div><p>${selected.placement?'Complete this career skills course and pass its knowledge check to try registering placement interest.':'This course does not include an internship pathway. You can still explore CV and career guidance.'} Employer partnerships and placements are proposed.</p>${selected.placement?(state.interestByCourse[selected.id]?badge('Demo placement interest saved'):action('Check demo eligibility','internship','outline',arrow())):action('Explore career guidance','book','outline','', 'data-type="Career guidance"')}</section>
    <section class="card padded"><div class="panel-title">${tile('chart')}<div><h2>Income & employment follow-up</h2><p>IIAE · Example records at 3, 6 and 12 months.</p></div></div><p>${state.salary?salaryResult(state.salary):'Compare income after employment and track status and working hours over time.'}</p><div class="modal-actions">${action('Income calculator','income','outline')}${action('Add follow-up','followup','outline')}</div><p class="fineprint">All records are illustrative, saved only in this browser. No real outcomes are claimed.</p>${followupTable()}</section></div></main>`;
}
function followupTable() {
  if (!state.followups.length) return '';
  return `<div class="table-scroll"><table><caption>Illustrative follow-up records</caption><thead><tr><th>After course</th><th>Employment</th><th>Hours/week</th><th>Monthly pay</th><th>IIAE</th></tr></thead><tbody>${[...state.followups].sort((a,b)=>a.month-b.month).map(f=>`<tr><td>${f.month} months</td><td>${esc(f.status)}</td><td>${f.hours}</td><td>${money(f.income)}</td><td>${state.salary?(state.salary.before===0?'N/A (zero baseline)':((f.income-state.salary.before)/state.salary.before*100).toFixed(1)+'%'):'Set baseline'}</td></tr>`).join('')}</tbody></table></div>`;
}

function lessonPage() {
  const parts = location.hash.slice(1).split('/');
  const c = getCourse(parts[1]);
  if (!c || !/^\d+$/.test(parts[2] || '')) return notFound();
  const units = courseLessons(c);
  activeLesson = Number(parts[2]);
  if (activeLesson < 1 || activeLesson > units.length) return notFound();
  const ask = parts[3];
  state.selectedCourse = c.id;
  save();
  const unit = units[activeLesson-1];
  const completed = state.courses[c.id] || [];
  const player = c.id === 'spreadsheets' && activeLesson === 7;
  const savedComments = state.comments.filter(comment=>comment.course === c.id && comment.lesson === activeLesson);
  return `<main class="container inner" id="main-content" tabindex="-1">${crumb('Lesson '+activeLesson,`<a href="#course/${c.id}">${c.name}</a>${chevron()}`)}
  ${titleBlock(unit.title,c.name+' · '+(c.demo?'Lesson ':'Preview topic ')+activeLesson+' of '+units.length,link('Back to dashboard','#dashboard','outline'))}
  <div class="learning-grid"><section class="card padded lesson-page">
    ${!c.demo?'<p class="inline-note"><strong>Course preview</strong> · Full teaching materials and assessment are not yet available.</p>':''}
    ${player ? `<video class="lesson-video" controls playsinline preload="metadata" poster="assets/instructor.jpg" aria-label="Sort and filter your data lesson"><source src="assets/spreadsheet-lesson.mp4" type="video/mp4"><a href="assets/spreadsheet-lesson.mp4">Open the lesson video</a></video>` : `<div class="lesson-cover ${c.tone}" aria-hidden="true">${icon(c.icon,48)}<span>${c.track}</span></div>`}
    <h2>Lesson guide</h2><p class="lesson-guide">${unit.guide}</p><h2>Practice task</h2><p>${unit.task}</p>
    ${player ? '<details class="inline-note"><summary>Read the video transcript</summary><p>Sort changes the order of your rows. Select the full table, then sort Hours from largest to smallest. Filter hides rows that do not match. Select Open in the Status column to show open tasks only. Clear the filter to see every row again.</p></details>' : ''}
    <div class="lesson-controls">${completed.includes(activeLesson)?badge(c.demo?'Lesson completed':'Preview explored'):action(c.demo?'Mark lesson complete':'Mark preview explored','complete','',icon('check',17))}${activeLesson<units.length?link('Next lesson',lessonHref(c.id,activeLesson+1),'outline',arrow()):c.demo?action('Take knowledge check','quiz','outline',arrow()):link('Explore complete demo routes','#courses','outline')}</div>
    <section class="lesson-comments"><h2>Lesson questions</h2><p>Sample tutor responses use this course’s guide. This is scripted assistance, not live AI. Teacher questions are stored locally.</p>
    <form id="comment-form"><div class="field"><label for="comment-recipient">Question recipient</label><select class="input" id="comment-recipient" name="recipient">${options(['Sample tutor','Teacher'],ask==='teacher'?'Teacher':'Sample tutor')}</select></div>
    <div class="field"><label for="lesson-question">Your question</label><textarea id="lesson-question" name="question" class="input" placeholder="Which part of this lesson should I practise again?" rows="3" maxlength="350" required></textarea></div><button class="button" type="submit">Save question${arrow()}</button></form>
    ${savedComments.map(comment=>`<div class="comment"><strong><span data-user-content>${esc(state.name)}</span> → ${esc(comment.recipient)}</strong><p data-user-content>${esc(comment.question)}</p><strong>${comment.recipient==='Teacher'?'Teacher · Local demo status':'Sample tutor · Scripted reply'}</strong><p>${esc(comment.reply)}</p></div>`).join('')}</section>
  </section><aside class="card padded curriculum"><h2>Course lessons</h2>${units.map((u,i)=>`<a href="${lessonHref(c.id,i+1)}" ${activeLesson===i+1?'class="current" aria-current="page"':''}><span>${completed.includes(i+1)?icon('check',16):i+1}</span>${u.title}</a>`).join('')}</aside></div></main>`;
}

