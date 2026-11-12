import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
export const {courses,courseChecks,courseLessons,sampleProfile,goals,skills,formats}=require('../course-data.js');
const courseById=id=>courses.find(c=>c.id===id);
export class HttpError extends Error{constructor(status,message){super(message);this.status=status;}}
export function text(value,max,required=true) {
  if(typeof value!=='string'||value.length>max||(required&&!value.trim()))throw new HttpError(400,'Invalid text');
  return value.trim();
}
export function courseAndLesson(id,lesson) {
  const course=courseById(id);
  if(!course||!Number.isInteger(lesson)||lesson<1||lesson>courseLessons(course).length)throw new HttpError(400,'Invalid course or lesson');
  return course;
}
export function validCourse(id,all=false){if((all&&id==='all')||courseById(id))return id;throw new HttpError(400,'Invalid course');}
export function freshLearner(name) {
  return {version:3,name,courses:{},examByCourse:{},quizByCourse:{},profile:{...sampleProfile,skills:[],additionalAvailability:[]},
    assessmentAnswers:[],assessed:false,review:false,comments:[],appointment:null,salary:null,followups:[],interestByCourse:{},selectedCourse:'spreadsheets'};
}
const bounded=(n,min,max)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
export function sanitiseLearner(input,previous) {
  if(!input||typeof input!=='object'||Array.isArray(input))throw new HttpError(400,'Invalid learner state');
  const next={...previous};
  if(input.name!==undefined)next.name=text(input.name,40);
  const p=input.profile;
  if(p) {
    if(!goals.includes(p.goal)||!formats.includes(p.mode)||!bounded(p.hours,1,40)||!bounded(p.budget,0,100000))throw new HttpError(400,'Invalid assessment profile');
    next.profile={education:text(p.education,80),experience:text(p.experience,80),goal:p.goal,mode:p.mode,hours:p.hours,budget:p.budget,
      skills:Array.isArray(p.skills)?p.skills.filter(s=>skills.includes(s)):[],availability:['Weekday evenings','Weekday daytime','Weekends','Flexible'].includes(p.availability)?p.availability:'Flexible',
      additionalAvailability:Array.isArray(p.additionalAvailability)?p.additionalAvailability.filter(s=>['Weekday evenings','Weekday daytime','Weekends'].includes(s)):[]};
  }
  if(input.courses&&typeof input.courses==='object') {
    next.courses=Object.fromEntries(courses.filter(c=>Object.hasOwn(input.courses,c.id)&&Array.isArray(input.courses[c.id])).map(c=>[c.id,[...new Set(input.courses[c.id].filter(n=>Number.isInteger(n)&&n>=1&&n<=courseLessons(c).length))]]));
  }
  if(input.examByCourse&&typeof input.examByCourse==='object') {
    next.examByCourse=Object.fromEntries(courses.filter(c=>Array.isArray(input.examByCourse[c.id])).map(c=>[c.id,[...new Set(input.examByCourse[c.id].filter(n=>Number.isInteger(n)&&n>=0&&n<4&&n!==2))]]));
    for(const id of Object.keys(next.quizByCourse||{}))if(next.quizByCourse[id])next.examByCourse[id]=[...new Set([...(next.examByCourse[id]||[]),2])];
  }
  next.assessmentAnswers=Array.isArray(input.assessmentAnswers)?input.assessmentAnswers.slice(0,4).filter(n=>Number.isInteger(n)&&n>=0&&n<=2):[];
  next.assessed=Boolean(input.assessed&&next.assessmentAnswers.length===4);
  next.review=Boolean(input.review);
  if(courseById(input.selectedCourse))next.selectedCourse=input.selectedCourse;
  if(input.salary===null)next.salary=null;
  else if(input.salary&&bounded(input.salary.before,0,10000000)&&bounded(input.salary.after,0,10000000))next.salary={before:input.salary.before,after:input.salary.after};
  if(Array.isArray(input.followups))next.followups=input.followups.slice(0,3).filter(f=>[3,6,12].includes(f.month)&&bounded(f.hours,0,168)&&bounded(f.income,0,10000000)&&['Employed full-time','Employed part-time','Self-employed','Seeking work','Not in paid work'].includes(f.status)).map(f=>({month:f.month,hours:f.hours,income:f.income,status:f.status}));
  if(input.appointment===null)next.appointment=null;
  else if(input.appointment)next.appointment={type:text(input.appointment.type,80),slot:text(input.appointment.slot,100)};
  if(typeof input.fundingEnquiry==='string')next.fundingEnquiry=text(input.fundingEnquiry,350,false);
  if(input.interestByCourse&&typeof input.interestByCourse==='object')next.interestByCourse=Object.fromEntries(courses.filter(c=>c.placement&&input.interestByCourse[c.id]===true).map(c=>[c.id,true]));
  // Roles, teacher data, discussion replies and passed quiz flags are never accepted from learner state.
  delete next.teacher;
  return next;
}
