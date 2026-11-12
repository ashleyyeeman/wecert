import {Hono} from 'hono';
import {bodyLimit} from 'hono/body-limit';
import {secureHeaders} from 'hono/secure-headers';
import {readFile} from 'node:fs/promises';
import {randomUUID,randomBytes,createHash} from 'node:crypto';
import {appOrigin,getAuth,getPool,withTransaction} from './backend/auth.mjs';
import {actorFrom,studentWorkspace,teacherWorkspace,learnerRecord} from './backend/data.mjs';
import {HttpError,text,courseAndLesson,validCourse,sanitiseLearner,courseChecks,courseLessons} from './backend/domain.mjs';

const app=new Hono();
const hash=value=>createHash('sha256').update(value).digest('hex');
const jsonBody=async c=>{try{return await c.req.json();}catch{throw new HttpError(400,'Invalid request');}};
app.use('/api/*',secureHeaders());
app.use('/api/*',bodyLimit({maxSize:128*1024}));
app.use('/api/*',async(c,next)=>{
  c.header('Cache-Control','no-store');c.header('Vary','Cookie');
  if(!['GET','HEAD','OPTIONS'].includes(c.req.method)) {
    if(c.req.header('origin')!==appOrigin())return c.json({error:'Request origin is not allowed'},403);
    if(!c.req.header('content-type')?.startsWith('application/json'))return c.json({error:'JSON required'},415);
  }
  await next();
});
app.get('/api/runtime',c=>c.json({enabled:true,configured:Boolean(process.env.DATABASE_URL&&process.env.BETTER_AUTH_SECRET),version:1}));
app.on(['GET','POST'],'/api/auth/*',c=>getAuth().handler(c.req.raw));
app.get('/api/me',async c=>{const actor=await actorFrom(c.req.raw,false);return c.json({user:actor});});
async function requireActor(c,teacher=false) {
  const actor=await actorFrom(c.req.raw);
  if(teacher&&actor.role!=='teacher')throw new HttpError(403,'Teacher access required');
  return actor;
}
async function limit(actor,action,max=120) {
  const key=actor.id+':'+action;
  const {rows}=await getPool().query(`INSERT INTO wc_api_limits(key,window_start,count) VALUES($1,now(),1)
    ON CONFLICT(key) DO UPDATE SET count=CASE WHEN wc_api_limits.window_start<now()-interval '1 minute' THEN 1 ELSE wc_api_limits.count+1 END,
    window_start=CASE WHEN wc_api_limits.window_start<now()-interval '1 minute' THEN now() ELSE wc_api_limits.window_start END RETURNING count`,[key]);
  if(rows[0].count>max)throw new HttpError(429,'Too many requests. Try again shortly.');
}
app.get('/api/student/workspace',async c=>c.json(await studentWorkspace(await requireActor(c))));
app.put('/api/student/state',async c=>{
  const actor=await requireActor(c);await limit(actor,'state');const body=await jsonBody(c);
  if(!Number.isInteger(body.revision))throw new HttpError(400,'A state revision is required');
  const record=await learnerRecord(actor);const state=sanitiseLearner(body.state,record.state);
  const {rows}=await getPool().query('UPDATE wc_learners SET state=$1::jsonb,revision=revision+1,updated_at=now() WHERE user_id=$2 AND revision=$3 RETURNING revision',[JSON.stringify(state),actor.id,body.revision]);
  if(!rows.length)return c.json({error:'Another device updated your data. Reload before saving again.'},409);
  return c.json({revision:rows[0].revision});
});
app.post('/api/student/questions',async c=>{
  const actor=await requireActor(c);await limit(actor,'question',20);const body=await jsonBody(c);
  const course=courseAndLesson(body.course,body.lesson);const question=text(body.question,350);const record=await learnerRecord(actor);
  const recipient=body.recipient==='Sample tutor'?'Sample tutor':'Teacher';const unit=courseLessons(course)[body.lesson-1];
  const tutorReply=recipient==='Sample tutor'?(course.demo?'From “'+unit.title+'”: '+unit.guide+' Practice: '+unit.task+' This scripted response uses the current lesson and does not interpret every question.':'This course is a preview; detailed tutor guidance is not available yet. Explore the outline or switch to a complete demo route.'):null;
  await getPool().query('INSERT INTO wc_questions(id,user_id,course,lesson,question,author_name,recipient,tutor_reply) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[randomUUID(),actor.id,body.course,body.lesson,question,record.state.name,recipient,tutorReply]);
  return c.json(await studentWorkspace(actor),201);
});
app.post('/api/student/quiz',async c=>{
  const actor=await requireActor(c);await limit(actor,'quiz',20);const body=await jsonBody(c);validCourse(body.course);
  const questions=courseChecks[body.course];
  if(!questions||!Array.isArray(body.answers)||body.answers.length!==questions.length||body.answers.some(a=>!Number.isInteger(a)))throw new HttpError(400,'Invalid knowledge check');
  const correct=questions.filter((q,i)=>q.answer===body.answers[i]).length;const passed=correct===questions.length;
  await learnerRecord(actor);
  if(passed)await withTransaction(async client=>{
    const {rows}=await client.query('SELECT state FROM wc_learners WHERE user_id=$1 FOR UPDATE',[actor.id]);const state=rows[0].state;
    (state.quizByCourse||={})[body.course]=true;(state.examByCourse||={})[body.course]=[...new Set([...(state.examByCourse[body.course]||[]),2])];
    await client.query('UPDATE wc_learners SET state=$1::jsonb,revision=revision+1,updated_at=now() WHERE user_id=$2',[JSON.stringify(state),actor.id]);
  });
  return c.json({correct,passed,...await studentWorkspace(actor)});
});
app.get('/api/teacher/workspace',async c=>c.json(await teacherWorkspace(await requireActor(c,true))));
app.put('/api/teacher/questions/:id/reply',async c=>{
  const actor=await requireActor(c,true);await limit(actor,'reply');const body=await jsonBody(c);const reply=text(body.body,1500);
  const {rowCount}=await getPool().query("SELECT id FROM wc_questions WHERE id::text=$1 AND recipient='Teacher'",[c.req.param('id')]);if(!rowCount)throw new HttpError(404,'Question not found');
  await getPool().query('INSERT INTO wc_replies(question_id,teacher_id,body) SELECT id,$2,$3 FROM wc_questions WHERE id::text=$1 ON CONFLICT(question_id) DO UPDATE SET teacher_id=EXCLUDED.teacher_id,body=EXCLUDED.body,updated_at=now()',[c.req.param('id'),actor.id,reply]);
  return c.json(await teacherWorkspace(actor));
});
app.put('/api/teacher/guidance',async c=>{
  const actor=await requireActor(c,true);await limit(actor,'guidance');const body=await jsonBody(c);courseAndLesson(body.course,body.lesson);const note=text(body.body,1500,false);
  if(note)await getPool().query('INSERT INTO wc_guidance(course,lesson,body,teacher_id) VALUES($1,$2,$3,$4) ON CONFLICT(course,lesson) DO UPDATE SET body=EXCLUDED.body,teacher_id=EXCLUDED.teacher_id,updated_at=now()',[body.course,body.lesson,note,actor.id]);
  else await getPool().query('DELETE FROM wc_guidance WHERE course=$1 AND lesson=$2',[body.course,body.lesson]);
  return c.json(await teacherWorkspace(actor));
});
app.post('/api/teacher/announcements',async c=>{
  const actor=await requireActor(c,true);await limit(actor,'announcement');const body=await jsonBody(c);validCourse(body.course,true);
  await getPool().query('INSERT INTO wc_announcements(id,course,title,body,teacher_id) VALUES($1,$2,$3,$4,$5)',[randomUUID(),body.course,text(body.title,80),text(body.body,1200),actor.id]);
  return c.json(await teacherWorkspace(actor),201);
});
app.put('/api/teacher/announcements/:id',async c=>{
  const actor=await requireActor(c,true);await limit(actor,'announcement');const body=await jsonBody(c);validCourse(body.course,true);
  if(typeof body.published!=='boolean')throw new HttpError(400,'Invalid announcement status');
  const {rowCount}=await getPool().query('UPDATE wc_announcements SET course=$1,title=$2,body=$3,published=$4,updated_at=now() WHERE id::text=$5',[body.course,text(body.title,80),text(body.body,1200),body.published,c.req.param('id')]);
  if(!rowCount)throw new HttpError(404,'Announcement not found');return c.json(await teacherWorkspace(actor));
});
app.put('/api/teacher/learners/:id/note',async c=>{
  const actor=await requireActor(c,true);await limit(actor,'note');const body=await jsonBody(c);const note=text(body.body,1200,false);const id=c.req.param('id');
  const {rowCount}=await getPool().query("SELECT user_id FROM wc_roles WHERE user_id=$1 AND role='student'",[id]);if(!rowCount)throw new HttpError(404,'Learner not found');
  if(note)await getPool().query('INSERT INTO wc_learner_notes(teacher_id,learner_id,body) VALUES($1,$2,$3) ON CONFLICT(teacher_id,learner_id) DO UPDATE SET body=EXCLUDED.body',[actor.id,id,note]);
  else await getPool().query('DELETE FROM wc_learner_notes WHERE teacher_id=$1 AND learner_id=$2',[actor.id,id]);
  return c.json(await teacherWorkspace(actor));
});
app.post('/api/teacher/invites',async c=>{
  const actor=await requireActor(c,true);await limit(actor,'invite',10);const code=randomBytes(32).toString('base64url');
  await getPool().query('INSERT INTO wc_teacher_invites(id,token_hash,created_by) VALUES($1,$2,$3)',[randomUUID(),hash(code),actor.id]);
  return c.json({url:appOrigin()+'/#invite/'+code},201);
});
app.post('/api/setup/teacher',async c=>{
  const actor=await requireActor(c);await limit(actor,'setup',5);const body=await jsonBody(c);const code=text(body.code,100);if(code.length<40)throw new HttpError(400,'Invalid or expired setup link');
  await withTransaction(async client=>{
    const setup=await client.query("UPDATE wc_setup_keys SET used_at=now(),user_id=$2 WHERE name='first-teacher' AND token_hash=$1 AND used_at IS NULL RETURNING name",[hash(code),actor.id]);
    if(!setup.rowCount)throw new HttpError(400,'Invalid or expired setup link');
    await client.query("UPDATE wc_roles SET role='teacher' WHERE user_id=$1",[actor.id]);
  });return c.json({success:true});
});
app.post('/api/setup/invite',async c=>{
  const actor=await requireActor(c);await limit(actor,'setup',5);const body=await jsonBody(c);const code=text(body.code,100);if(code.length<40)throw new HttpError(400,'Invalid or expired invitation');
  await withTransaction(async client=>{
    const invite=await client.query('UPDATE wc_teacher_invites SET used_by=$2,used_at=now() WHERE token_hash=$1 AND used_at IS NULL AND expires_at>now() RETURNING id',[hash(code),actor.id]);
    if(!invite.rowCount)throw new HttpError(400,'Invalid or expired invitation');
    await client.query("UPDATE wc_roles SET role='teacher' WHERE user_id=$1",[actor.id]);
  });return c.json({success:true});
});
app.onError((error,c)=>{
  const status=error instanceof HttpError?error.status:503;
  if(status>=500)console.error('WeCert API failure',{path:new URL(c.req.url).pathname,code:typeof error.code==='string'?error.code:'SERVER_ERROR'});
  return c.json({error:status>=500?'Service temporarily unavailable. Please try again.':error.message},status);
});
const browserFiles=new Set(['style.css','translations.js','i18n.js','course-data.js','assessment.js','teacher-data.js','storage.js','assessment-views.js','learning-views.js','information-views.js','teacher-views.js','teacher-actions.js','remote.js','app.js']);
const assetFiles=new Set(['bridge.svg','learners.jpg','instructor.jpg','spreadsheet-lesson.mp4','Sans-Regular.woff2','Sans-Medium.woff2','Sans-Semibold.woff2','Sans-Bold.woff2']);
async function staticResponse(c,file) {
  const bytes=await readFile(new URL('./'+file,import.meta.url));
  const extension=file.split('.').pop();const types={js:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8',svg:'image/svg+xml',jpg:'image/jpeg',mp4:'video/mp4',woff2:'font/woff2'};
  c.header('Content-Type',types[extension]||'application/octet-stream');c.header('Cache-Control','public, max-age=0, must-revalidate');c.header('X-Content-Type-Options','nosniff');
  const etag='"'+createHash('sha1').update(bytes).digest('hex')+'"';c.header('ETag',etag);
  if(c.req.header('if-none-match')===etag)return c.body(null,304);
  const range=c.req.header('range')?.match(/^bytes=(\d+)-(\d*)$/);
  if(range){const start=Number(range[1]),end=Math.min(Number(range[2]||bytes.length-1),bytes.length-1);if(start>end||start>=bytes.length){c.header('Content-Range','bytes */'+bytes.length);return c.body(null,416);}c.header('Accept-Ranges','bytes');c.header('Content-Range',`bytes ${start}-${end}/${bytes.length}`);return c.body(bytes.subarray(start,end+1),206);}
  return c.body(bytes);
}
app.get('/assets/:asset',c=>assetFiles.has(c.req.param('asset'))?staticResponse(c,'assets/'+c.req.param('asset')):c.notFound());
app.get('/:file',c=>browserFiles.has(c.req.param('file'))?staticResponse(c,c.req.param('file')):c.notFound());
app.get('/',async c=>c.html(await readFile(new URL('./index.html',import.meta.url),'utf8')));
app.notFound(c=>c.json({error:'Not found'},404));
export default app;
