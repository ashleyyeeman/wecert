const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const context=vm.createContext({structuredClone,localStorage:{getItem:()=>null}});
for(const f of ['course-data.js','assessment.js','storage.js']) vm.runInContext(fs.readFileSync(f,'utf8'),context);
vm.runInContext('const state = demoState()',context);
const run = expr=>JSON.parse(JSON.stringify(vm.runInContext(expr,context)));

test('sample learner cannot receive intermediate spreadsheets before foundations',()=>{
  assert(!run('assessmentMatches(sampleProfile).map(m=>m.course.id)').includes('intermediate'));
});
test('self-report alone cannot establish spreadsheet prerequisites',()=>{
  assert.equal(run("hasPrerequisite(courses.find(c=>c.id==='intermediate'),{...sampleProfile,skills:['Spreadsheets']},[0,0,2,1],{})"),false);
  assert.equal(run("hasPrerequisite(courses.find(c=>c.id==='intermediate'),{...sampleProfile,skills:['Spreadsheets']},[0,1,2,1],{})"),true);
});
test('budget, weekly hours, timetable and format are hard constraints',()=>{
  assert.deepEqual(run('assessmentMatches({...sampleProfile,budget:0})'),[]);
  assert.deepEqual(run('assessmentMatches({...sampleProfile,hours:1})'),[]);
  assert(!run("assessmentMatches({...sampleProfile,goal:'Retail and customer service',mode:'Any format',budget:1000,availability:'Weekday evenings'}).map(m=>m.course.id)").includes('service'));
  assert(run('assessmentMatches(sampleProfile).every(m=>m.course.mode===sampleProfile.mode)'));
});
test('each career goal has four complete scenarios',()=>{
  assert(run('goals.every(goal=>questionsFor({goal}).length===4 && questionsFor({goal}).every(q=>q.choices[q.answer]))'));
});
test('legacy global exam and quiz migrate only to spreadsheets',()=>{
  const migrated=run('normaliseState({exam:[0,2],quiz:true,selectedCourse:"japanese",courses:{japanese:[1]}})');
  assert.deepEqual(migrated.examByCourse,{spreadsheets:[0,2]});
  assert.deepEqual(migrated.quizByCourse,{spreadsheets:true});
  assert.deepEqual(migrated.courses.japanese,[1]);
});
test('stale assessments are not labelled completed without scenario answers',()=>{
  assert.equal(run('normaliseState({assessed:true}).assessed'),false);
});
test('only representative courses expose complete course-specific checks',()=>{
  assert.deepEqual(run('courses.filter(c=>c.demo).map(c=>c.id)'),['office','spreadsheets','japanese']);
  assert(run('courses.filter(c=>c.demo).every(c=>courseChecks[c.id].length===3 && coursePreparation[c.id].length===4)'));
  assert(!run('JSON.stringify(courseChecks.japanese)+JSON.stringify(curriculum.japanese)').includes('SUM'));
});
