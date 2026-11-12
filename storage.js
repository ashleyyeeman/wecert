'use strict';

// Keep the existing key so returning learners retain their progress.
const storageKey = 'skillbridge-hk-demo-v1';
function demoState() {
  return {version:2,name:'Alex Chan',courses:{spreadsheets:[1,2,3,4,5,6]},
    examByCourse:{spreadsheets:[0,1]},quizByCourse:{},profile:structuredClone(sampleProfile),
    assessmentAnswers:[],assessed:false,review:false,comments:[],appointment:null,
    salary:null,followups:[],interestByCourse:{},selectedCourse:'spreadsheets'};
}
function normaliseState(saved) {
  const fresh = demoState();
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return fresh;
  const merged = {...fresh,...saved,profile:{...fresh.profile,...saved.profile}};
  // Old global exam/quiz values belonged to the spreadsheet course only.
  merged.examByCourse = saved.examByCourse || {spreadsheets:Array.isArray(saved.exam)?saved.exam:[0,1]};
  merged.quizByCourse = saved.quizByCourse || (saved.quiz ? {spreadsheets:true} : {});
  merged.courses = Object.fromEntries(Object.entries(saved.courses || fresh.courses)
    .filter(([id,done])=>getStoredCourse(id) && Array.isArray(done))
    .map(([id,done])=>[id,[...new Set(done.filter(n=>Number.isInteger(n)&&n>0&&n<=courseLessons(getStoredCourse(id)).length))]]));
  for (const id of Object.keys(merged.examByCourse)) {
    merged.examByCourse[id] = Array.isArray(merged.examByCourse[id]) ? [...new Set(merged.examByCourse[id].filter(n=>Number.isInteger(n)&&n>=0&&n<4))] : [];
  }
  merged.profile.additionalAvailability = Array.isArray(merged.profile.additionalAvailability) ? merged.profile.additionalAvailability.filter(slot=>studyTimes.includes(slot)) : [];
  merged.profile.skills = Array.isArray(merged.profile.skills) ? merged.profile.skills.filter(s=>skills.includes(s)) : [];
  merged.name = typeof merged.name === 'string' && merged.name.trim() ? merged.name.slice(0,40) : fresh.name;
  merged.comments = Array.isArray(merged.comments) ? merged.comments.filter(c=>c&&typeof c==='object') : [];
  merged.followups = Array.isArray(merged.followups) ? merged.followups.filter(f=>f&&[3,6,12].includes(f.month)) : [];
  merged.assessmentAnswers = Array.isArray(merged.assessmentAnswers) ? merged.assessmentAnswers : [];
  merged.assessed = Boolean(merged.assessed && merged.assessmentAnswers.length === 4);
  merged.interestByCourse = saved.interestByCourse || (saved.interest ? {spreadsheets:true} : {});
  delete merged.interest;
  merged.version=2;
  delete merged.exam; delete merged.quiz;
  return merged;
}
const getStoredCourse = id => courses.find(c=>c.id===id);
function readState() {
  try { return normaliseState(JSON.parse(localStorage.getItem(storageKey))); }
  catch { return demoState(); }
}
