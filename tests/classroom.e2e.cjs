const {chromium}=require('playwright');
const {expect}=require('@playwright/test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');

if(process.env.DATABASE_SCHEMA!=='wecert_dev'||process.env.APP_ORIGIN!=='http://localhost:3000')throw new Error('Classroom integration tests require the isolated development schema');
const base=process.env.APP_ORIGIN;
const suffix=crypto.randomUUID();
const accounts={student:{name:'Fixture Student',email:`wecert-student-${suffix}@example.test`,password:crypto.randomBytes(24).toString('base64url')},teacher:{name:'Fixture Teacher',email:`wecert-teacher-${suffix}@example.test`,password:crypto.randomBytes(24).toString('base64url')},other:{name:'Fixture Other',email:`wecert-other-${suffix}@example.test`,password:crypto.randomBytes(24).toString('base64url')}};
let browser;let inviteUrl='';const errors=[];
async function signup(page,account,route='dashboard') {
 await page.goto(base+'/#'+route);
 await page.locator('[data-action=cloud-auth-mode]').click();
 await page.getByLabel('Display name',{exact:true}).fill(account.name);
 await page.getByLabel('Email address').fill(account.email);
 await page.getByLabel('Password',{exact:true}).fill(account.password);
 await page.locator('#cloud-auth-form button[type=submit]').click();
 await expect(page.locator('#cloud-auth-form')).toHaveCount(0,{timeout:20000});
}
async function signin(page,account) {
 await page.goto(base+'/#dashboard');
 await page.getByLabel('Email address').fill(account.email);await page.getByLabel('Password',{exact:true}).fill(account.password);await page.locator('#cloud-auth-form button[type=submit]').click();
 await expect(page.locator('#cloud-auth-form')).toHaveCount(0,{timeout:20000});
}
async function cleanup() {
 const {getPool}=await import('../backend/auth.mjs');const pool=getPool();
 const {rows}=await pool.query('SELECT id FROM "user" WHERE email=ANY($1::text[])',[Object.values(accounts).map(a=>a.email)]);const ids=rows.map(r=>r.id);
 if(ids.length) {
  await pool.query('BEGIN');
  try {
   await pool.query("UPDATE wc_setup_keys SET used_at=NULL,user_id=NULL WHERE name='first-teacher' AND user_id=ANY($1::text[])",[ids]);
   await pool.query('DELETE FROM wc_teacher_invites WHERE created_by=ANY($1::text[]) OR used_by=ANY($1::text[])',[ids]);
   await pool.query('DELETE FROM wc_learner_notes WHERE teacher_id=ANY($1::text[]) OR learner_id=ANY($1::text[])',[ids]);
   await pool.query('DELETE FROM wc_replies WHERE teacher_id=ANY($1::text[])',[ids]);
   await pool.query('DELETE FROM wc_questions WHERE user_id=ANY($1::text[])',[ids]);
   await pool.query('DELETE FROM wc_announcements WHERE teacher_id=ANY($1::text[])',[ids]);
   await pool.query('DELETE FROM wc_guidance WHERE teacher_id=ANY($1::text[])',[ids]);
   await pool.query('DELETE FROM "session" WHERE "userId"=ANY($1::text[])',[ids]);
   await pool.query('DELETE FROM "account" WHERE "userId"=ANY($1::text[])',[ids]);
   await pool.query('DELETE FROM "user" WHERE id=ANY($1::text[])',[ids]);
   await pool.query('COMMIT');
  }catch(error){await pool.query('ROLLBACK');throw error;}
 }
 await pool.end();
}
(async()=>{
 browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||'/usr/bin/chromium',headless:true});
 const studentContext=await browser.newContext({extraHTTPHeaders:{'X-Real-IP':'127.0.0.21'}}),teacherContext=await browser.newContext({extraHTTPHeaders:{'X-Real-IP':'127.0.0.22'}}),deviceContext=await browser.newContext({extraHTTPHeaders:{'X-Real-IP':'127.0.0.23'}}),otherContext=await browser.newContext({extraHTTPHeaders:{'X-Real-IP':'127.0.0.24'}}),anonymousContext=await browser.newContext();
 const student=await studentContext.newPage(),teacher=await teacherContext.newPage(),device=await deviceContext.newPage(),other=await otherContext.newPage();
 for(const p of [student,teacher,device,other])p.on('pageerror',e=>errors.push(e.message));
 await signup(student,accounts.student);await signup(teacher,accounts.teacher,'teacher');await signup(other,accounts.other);
 await expect(teacher.locator('h1')).toHaveText('Teacher access required');
 assert.equal((await anonymousContext.request.get(base+'/api/teacher/workspace')).status(),401);
 assert.equal((await studentContext.request.get(base+'/api/teacher/workspace')).status(),403);
 assert.equal((await studentContext.request.post(base+'/api/teacher/announcements',{headers:{Origin:base},data:{course:'all',title:'Spoof',body:'Not allowed'}})).status(),403);
 await teacher.goto(base+'/#setup/'+process.env.BOOTSTRAP_TEACHER_CODE);await teacher.getByRole('button',{name:'Activate teacher access',exact:true}).click();
 await expect(teacher.locator('h1')).toHaveText('Teaching overview',{timeout:15000});
 assert.equal((await teacherContext.request.get(base+'/api/me')).status(),200);
 assert.equal((await (await teacherContext.request.get(base+'/api/me')).json()).user.role,'teacher');
 console.log('Verified: signup defaults to student; unauthenticated/student teacher access is rejected; one-time owner setup works.');
 const original=await (await studentContext.request.get(base+'/api/student/workspace')).json();
 const forged=await studentContext.request.put(base+'/api/student/state',{headers:{Origin:base},data:{revision:original.revision,state:{...original.state,role:'teacher',teacher:{learners:[]},quizByCourse:{japanese:true}}}});
 assert.equal(forged.status(),200);
 const after=await (await studentContext.request.get(base+'/api/student/workspace')).json();assert(!after.state.quizByCourse.japanese);
 assert.equal((await (await studentContext.request.get(base+'/api/me')).json()).user.role,'student');
 const deniedOrigin=await teacherContext.request.post(base+'/api/teacher/announcements',{headers:{Origin:'https://untrusted.example'},data:{course:'all',title:'CSRF',body:'Not allowed'}});assert.equal(deniedOrigin.status(),403);
 const replay=await studentContext.request.post(base+'/api/setup/teacher',{headers:{Origin:base},data:{code:process.env.BOOTSTRAP_TEACHER_CODE}});assert.equal(replay.status(),400);
 await student.reload();await signin(device,accounts.student);
 await student.goto(base+'/#course/spreadsheets');await student.locator('[data-action=enrol]').click();await expect(student.locator('h1')).toHaveText('Personal Career Dashboard');
 await student.goto(base+'/#lesson/spreadsheets/1');await student.getByRole('button',{name:'Mark lesson complete',exact:true}).click();await expect(student.locator('.lesson-controls')).toContainText('Lesson completed');
 await device.reload();await expect(device.locator('.stat').first()).toContainText('10% complete',{timeout:15000});
 await student.goto(base+'/#lesson/spreadsheets/3');await expect(student.locator('h1')).toHaveText('Write basic formulas');await student.locator('#comment-recipient').selectOption('Teacher');await student.locator('#lesson-question').fill('How do I total my Hours?');await student.locator('#comment-form button[type=submit]').click();
 await expect(student.locator('.comment')).toContainText('How do I total my Hours?',{timeout:15000});
 const teacherQuestions=(await (await teacherContext.request.get(base+'/api/teacher/workspace')).json()).questions;assert(teacherQuestions.some(q=>q.question==='How do I total my Hours?'),'Teacher API must include the newly saved question');
 await teacher.goto(base+'/#teacher-inbox');const question=teacher.locator('.teacher-question').filter({hasText:'How do I total my Hours?'});await expect(question).toBeVisible({timeout:15000});await question.locator('[data-action=teacher-reply]').click();await teacher.locator('#teacher-reply').fill('Use =SUM(B2:B5).');await teacher.getByRole('button',{name:'Save reply',exact:true}).click();
 await device.goto(base+'/#lesson/spreadsheets/3');await expect(device.locator('.comment')).toContainText('Use =SUM(B2:B5).',{timeout:15000});
 const otherWorkspace=await (await otherContext.request.get(base+'/api/student/workspace')).json();assert.equal(otherWorkspace.state.comments.length,0);
 console.log('Verified: separate-device progress and teacher replies sync; another student cannot read the discussion.');
 await teacher.goto(base+'/#teacher');await teacher.locator('#announcement-course').selectOption('japanese');await teacher.locator('#announcement-title').fill('Japanese only');await teacher.locator('#announcement-body').fill('Review your kana.');await teacher.locator('#teacher-announcement-form button[type=submit]').click();
 await expect(teacher.locator('.teacher-announcement').filter({hasText:'Japanese only'})).toBeVisible({timeout:15000});
 await device.goto(base+'/#dashboard');await expect(device.locator('.student-announcements')).toHaveCount(0);
 await teacher.locator('#announcement-course').selectOption('spreadsheets');await teacher.locator('#announcement-title').fill('Tracker practice');await teacher.locator('#announcement-body').fill('Bring a five-row tracker.');await teacher.locator('#teacher-announcement-form button[type=submit]').click();
 await expect(teacher.locator('.teacher-announcement').filter({hasText:'Tracker practice'})).toBeVisible({timeout:15000});
 await device.reload();await expect(device.locator('.student-announcements')).toContainText('Tracker practice',{timeout:15000});await expect(device.locator('.student-announcements')).not.toContainText('Japanese only');
 await teacher.locator('.teacher-announcement').filter({hasText:'Tracker practice'}).locator('[data-action=teacher-toggle-announcement]').click();await expect(teacher.locator('.teacher-announcement').filter({hasText:'Tracker practice'})).toContainText('Archived');await device.reload();await expect(device.locator('.student-announcements')).toHaveCount(0);
 await teacher.goto(base+'/#teacher-course/spreadsheets');await teacher.locator('[data-action=teacher-guidance][data-lesson="3"]').click();await teacher.locator('#teacher-guidance').fill('Remember to select the whole range.');await teacher.getByRole('button',{name:'Save guidance',exact:true}).click();await expect(teacher.locator('dialog')).not.toBeVisible();
 await device.goto(base+'/#lesson/spreadsheets/3');await expect(device.locator('.teacher-guidance')).toContainText('Remember to select the whole range.');
 const studentId=(await (await studentContext.request.get(base+'/api/me')).json()).user.id;
 await teacher.goto(base+'/#teacher-learner/'+studentId);await teacher.locator('#learner-note').fill('Staff only follow-up note.');await teacher.getByRole('button',{name:'Save teaching note',exact:true}).click();await expect(teacher.locator('#learner-note')).toBeEnabled();
 const safe=JSON.stringify(await (await studentContext.request.get(base+'/api/student/workspace')).json());assert(!safe.includes('Staff only follow-up note.'));
 console.log('Verified: course-scoped announcements, archiving, lesson guidance and private teacher notes.');
 await teacher.goto(base+'/#teacher');await teacher.getByRole('button',{name:'Invite a teacher',exact:true}).click();inviteUrl=await teacher.locator('#teacher-invite-url').inputValue();
 await other.goto(inviteUrl);await other.getByRole('button',{name:'Activate teacher access',exact:true}).click();await expect(other.locator('h1')).toHaveText('Teaching overview',{timeout:15000});
 const reuse=await studentContext.request.post(base+'/api/setup/invite',{headers:{Origin:base},data:{code:inviteUrl.split('/').pop()}});assert.equal(reuse.status(),400);
 const secondTeacher=await (await otherContext.request.get(base+'/api/teacher/workspace')).json();assert(!JSON.stringify(secondTeacher.learnerNotes).includes('Staff only follow-up note.'));
 const sessionCookies=(await teacherContext.cookies()).filter(c=>c.name.includes('session_token'));assert(sessionCookies.length);assert(sessionCookies.every(c=>c.httpOnly));
 await teacher.locator('dialog [data-action=close]').click();await teacher.locator('header [data-action=cloud-account]').click();await teacher.getByRole('button',{name:'Sign out',exact:true}).click();await expect(teacher.locator('header [data-action=cloud-signin]')).toBeVisible({timeout:15000});
 assert.equal((await teacherContext.request.get(base+'/api/teacher/workspace')).status(),401);
 assert.deepEqual(errors,[]);
 console.log('Verified: teacher invitations are single-use; private notes stay private; HttpOnly sessions revoke on sign-out.');
 console.log('Classroom end-to-end verification passed against the real database.');
})().catch(error=>{
 let message=error.stack||error.message;
 for(const secret of [process.env.BOOTSTRAP_TEACHER_CODE,...Object.values(accounts).map(a=>a.password),inviteUrl])if(secret)message=message.split(secret).join('[redacted]');
 console.error(message);process.exitCode=1;
}).finally(async()=>{if(browser)await browser.close();try{await cleanup();}catch(error){console.error('Fixture cleanup failed:',error.code||'database error');process.exitCode=1;}});
