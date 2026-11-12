'use strict';

const teacherDemoMode=typeof location!=='undefined'&&new URLSearchParams(location.search).get('demo')==='teacher';
const teacherDemoHref='?demo=teacher#teacher';
const liveTeacherHref=()=>location.pathname+'#teacher';

function defaultTeacherState() {
  return {
    name:'Jamie Lee',announcements:[],lessonNotes:{},learnerNotes:{},
    learners:[
      {id:'sample-maya',name:'Maya Wong',courses:{spreadsheets:[1,2,3],office:[]},quizByCourse:{}},
      {id:'sample-chris',name:'Chris Lam',courses:{office:[1,2],spreadsheets:[1,2,3,4,5,6,7,8,9,10]},quizByCourse:{spreadsheets:true}},
      {id:'sample-jordan',name:'Jordan Lee',courses:{japanese:[1,2,3]},quizByCourse:{japanese:true}}
    ],
    questions:[
      {id:'sample-question-1',learnerId:'sample-maya',course:'spreadsheets',lesson:3,question:'When should I use SUM instead of AVERAGE?',createdAt:'2026-11-12T01:00:00Z'},
      {id:'sample-question-2',learnerId:'sample-jordan',course:'japanese',lesson:2,question:'Why is は read as wa in this sentence?',createdAt:'2026-11-12T02:00:00Z'}
    ]
  };
}
function normaliseTeacherState(saved) {
  const fresh = defaultTeacherState();
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return fresh;
  return {...fresh,...saved,
    name:typeof saved.name==='string'&&saved.name.trim()?saved.name.slice(0,40):fresh.name,
    announcements:Array.isArray(saved.announcements)?saved.announcements.filter(a=>a&&typeof a.id==='string'&&typeof a.title==='string'&&typeof a.body==='string'&&(a.course==='all'||courses.some(c=>c.id===a.course))):[],
    lessonNotes:saved.lessonNotes&&typeof saved.lessonNotes==='object'?saved.lessonNotes:{},
    learnerNotes:saved.learnerNotes&&typeof saved.learnerNotes==='object'?saved.learnerNotes:{},
    learners:fresh.learners,
    questions:Array.isArray(saved.questions)?fresh.questions.map(q=>({...q,teacherReply:saved.questions.find(s=>s.id===q.id)?.teacherReply})):fresh.questions
  };
}
function teacherLearners() {
  if(remoteActive())return state.teacher.learners;
  return [{id:'current',name:state.name,courses:state.courses,quizByCourse:state.quizByCourse,current:true},...state.teacher.learners];
}
function teacherQuestions() {
  if(remoteActive())return state.teacher.questions;
  const current = state.comments.filter(c=>c.recipient==='Teacher').map(c=>({...c,source:'current',authorName:c.authorName||state.name}));
  const samples = state.teacher.questions.map(q=>({...q,source:'sample',authorName:state.teacher.learners.find(l=>l.id===q.learnerId)?.name||'Sample learner'}));
  return [...current,...samples];
}
function learnerCourseProgress(learner,id) {
  const course = courses.find(c=>c.id===id);
  if (!course) return 0;
  const completed = learner.courses[id]||[];
  return Math.round(courseLessons(course).filter((_,i)=>completed.includes(i+1)).length/courseLessons(course).length*100);
}
function visibleCourseAnnouncements(id) {
  return state.teacher.announcements.filter(a=>a.published&&(a.course==='all'||a.course===id));
}
function saveTeacherChange(change) {
  // Re-read before a teacher write so an open student tab's newer progress is retained.
  const latest = readState();
  change(latest);
  state = latest;
  save();
}
const teacherRoute = route => ['teacher','teacher-courses','teacher-course','teacher-learners','teacher-learner','teacher-inbox'].includes(route);
