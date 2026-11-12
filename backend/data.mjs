import {getAuth,getPool} from './auth.mjs';
import {freshLearner,HttpError} from './domain.mjs';

export async function actorFrom(request,required=true) {
  const session=await getAuth().api.getSession({headers:request.headers});
  if(!session){if(required)throw new HttpError(401,'Sign in required');return null;}
  await getPool().query("INSERT INTO wc_roles(user_id) VALUES($1) ON CONFLICT DO NOTHING",[session.user.id]);
  const {rows}=await getPool().query('SELECT role FROM wc_roles WHERE user_id=$1',[session.user.id]);
  return {id:session.user.id,name:session.user.name,email:session.user.email,role:rows[0].role};
}
export async function learnerRecord(actor) {
  await getPool().query('INSERT INTO wc_learners(user_id,state) VALUES($1,$2::jsonb) ON CONFLICT DO NOTHING',[actor.id,JSON.stringify(freshLearner(actor.name))]);
  const {rows}=await getPool().query('SELECT state,revision FROM wc_learners WHERE user_id=$1',[actor.id]);return rows[0];
}
const iso=value=>value?.toISOString?.()||value;
export function mapQuestion(row) {
  return {id:row.id,course:row.course,lesson:row.lesson,question:row.question,authorName:row.author_name,learnerId:row.user_id,recipient:row.recipient,source:'remote',createdAt:iso(row.created_at),
    reply:row.recipient==='Sample tutor'?row.tutor_reply:'Awaiting teacher reply',teacherReply:row.reply_body?{body:row.reply_body,name:row.teacher_name,at:iso(row.reply_at)}:undefined};
}
export const questionSelect=`SELECT q.*,r.body AS reply_body,r.updated_at AS reply_at,u.name AS teacher_name FROM wc_questions q LEFT JOIN wc_replies r ON r.question_id=q.id LEFT JOIN "user" u ON u.id=r.teacher_id`;
export async function sharedTeaching(publishedOnly=true) {
  const [announcements,guidance]=await Promise.all([
    getPool().query('SELECT * FROM wc_announcements '+(publishedOnly?'WHERE published=true ':'')+'ORDER BY created_at'),
    getPool().query('SELECT g.*,u.name FROM wc_guidance g JOIN "user" u ON u.id=g.teacher_id')
  ]);
  const lessonNotes={};for(const row of guidance.rows)(lessonNotes[row.course]||={})[row.lesson]={body:row.body,name:row.name,at:iso(row.updated_at)};
  return {announcements:announcements.rows.map(a=>({id:a.id,course:a.course,title:a.title,body:a.body,published:a.published,createdAt:iso(a.created_at),updatedAt:iso(a.updated_at)})),lessonNotes};
}
export async function studentWorkspace(actor) {
  const [record,shared,questions]=await Promise.all([learnerRecord(actor),sharedTeaching(),getPool().query(questionSelect+' WHERE q.user_id=$1 ORDER BY q.created_at',[actor.id])]);
  return {state:{...record.state,comments:questions.rows.map(mapQuestion),teacher:{name:'',...shared,learners:[],questions:[],learnerNotes:{}}},revision:record.revision};
}
export async function teacherWorkspace(actor) {
  if(actor.role!=='teacher')throw new HttpError(403,'Teacher access required');
  const [shared,learners,questions,notes]=await Promise.all([
    sharedTeaching(false),getPool().query(`SELECT l.user_id,l.state FROM wc_learners l JOIN wc_roles r ON r.user_id=l.user_id WHERE r.role='student' ORDER BY l.updated_at DESC`),
    getPool().query(questionSelect+" WHERE q.recipient='Teacher' ORDER BY q.created_at DESC"),getPool().query('SELECT learner_id,body FROM wc_learner_notes WHERE teacher_id=$1',[actor.id])
  ]);
  return {name:actor.name,...shared,learners:learners.rows.map(l=>({id:l.user_id,name:l.state.name,courses:l.state.courses||{},quizByCourse:l.state.quizByCourse||{},goal:l.state.profile?.goal,assessed:l.state.assessed})),
    questions:questions.rows.map(mapQuestion),learnerNotes:Object.fromEntries(notes.rows.map(n=>[n.learner_id,n.body]))};
}
