'use strict';

async function handleTeacherAction(button) {
  const id=button.dataset.id;
  switch(button.dataset.action) {
    case 'teacher-demo-reset':
      if(!teacherDemoMode)return true;
      try{localStorage.removeItem(storageKey);}catch{}
      state=demoState();step=0;teacherInboxFilter={course:'all',status:'unanswered'};viewHasUnsavedChanges=false;
      if(dialog.open)dialog.close();go('teacher');note('Teacher demo reset.');return true;
    case 'teacher-profile':
      if(remoteActive()){showAccountProfile();return true;}
      modal('Teacher profile',`<form id="teacher-profile-form" class="dialog-form"><div class="field"><label for="teacher-name">Teacher display name</label><input id="teacher-name" class="input" name="name" value="${esc(state.teacher.name)}" maxlength="40" required></div>${submitButton('Save teacher profile')}</form>`);return true;
    case 'teacher-reply': {
      const q=teacherQuestions().find(q=>q.id===id);if(!q)return true;
      modal('Reply to learner',`<div class="inline-note"><strong data-user-content>${esc(q.authorName)}</strong><p>${esc(courseName(q.course))} · Lesson ${q.lesson}</p><p class="user-copy" ${q.source==='current'?'data-user-content':''}>${esc(q.question)}</p></div><form id="teacher-reply-form" data-id="${esc(q.id)}" data-source="${q.source}" class="dialog-form"><div class="field"><label for="teacher-reply">Your reply</label><textarea id="teacher-reply" name="reply" class="input" rows="5" maxlength="1500" required>${esc(q.teacherReply?.body||'')}</textarea></div><p class="fineprint">${remoteActive()?'Your reply is visible to the learner who asked this question.':'Replies to the current learner appear in that lesson. Sample-classmate replies stay in this demo.'}</p>${submitButton('Save reply')}</form>`);return true;
    }
    case 'teacher-guidance': {
      const c=getCourse(button.dataset.course);const lesson=Number(button.dataset.lesson);
      if(!c||!courseLessons(c)[lesson-1])return true;
      modal('Edit lesson guidance',`<p>${esc(c.name)} · Lesson ${lesson}</p><form id="teacher-guidance-form" data-course="${c.id}" data-lesson="${lesson}" class="dialog-form"><div class="field"><label for="teacher-guidance">Teacher guidance</label><textarea id="teacher-guidance" name="guidance" class="input" rows="5" maxlength="1500">${esc(state.teacher.lessonNotes[c.id]?.[lesson]?.body||'')}</textarea></div><p class="fineprint">Leave blank and save to remove this guidance. Original lesson material stays unchanged.</p>${submitButton('Save guidance')}</form>`);return true;
    }
    case 'teacher-new-announcement':
      modal('Publish an announcement',announcementForm({course:button.dataset.course||'all'}));return true;
    case 'teacher-edit-announcement': {
      const a=state.teacher.announcements.find(a=>a.id===id);if(a)modal('Edit announcement',announcementForm(a));return true;
    }
    case 'teacher-toggle-announcement':
      if(remoteActive()){const a=state.teacher.announcements.find(a=>a.id===id);if(a)state.teacher=await classroomApi('/teacher/announcements/'+encodeURIComponent(id),{method:'PUT',body:{course:a.course,title:a.title,body:a.body,published:!a.published}});render();note('Announcement visibility updated.');return true;}
      saveTeacherChange(latest=>{const a=latest.teacher.announcements.find(a=>a.id===id);if(a){a.published=!a.published;a.updatedAt=new Date().toISOString();}});
      render();note('Announcement visibility updated.');return true;
    default:return false;
  }
}
async function handleTeacherSubmit(form,data) {
  const now=new Date().toISOString();
  switch(form.id) {
    case 'teacher-profile-form': {
      const name=String(data.get('name')||'').trim();if(!name){note('Enter a display name.');return true;}
      saveTeacherChange(latest=>{latest.teacher.name=name.slice(0,40);});dialog.close();render();note('Teacher profile saved.');return true;
    }
    case 'teacher-reply-form': {
      const body=String(data.get('reply')||'').trim();if(!body){note('Enter a reply before saving.');return true;}
      if(remoteActive()){state.teacher=await classroomApi('/teacher/questions/'+encodeURIComponent(form.dataset.id)+'/reply',{method:'PUT',body:{body}});dialog.close();render();note('Reply saved.');return true;}
      saveTeacherChange(latest=>{
        const questions=form.dataset.source==='current'?latest.comments:latest.teacher.questions;
        const q=questions.find(q=>q.id===form.dataset.id);
        if(q)q.teacherReply={body,name:latest.teacher.name,at:now};
      });dialog.close();render();note('Reply saved in the teaching demo.');return true;
    }
    case 'teacher-guidance-form': {
      const id=form.dataset.course;const lesson=Number(form.dataset.lesson);const body=String(data.get('guidance')||'').trim();
      const c=getCourse(id);if(!c||!courseLessons(c)[lesson-1])return true;
      if(remoteActive()){state.teacher=await classroomApi('/teacher/guidance',{method:'PUT',body:{course:id,lesson,body}});dialog.close();render();note('Lesson guidance saved.');return true;}
      saveTeacherChange(latest=>{
        const notes=latest.teacher.lessonNotes[id]||={};
        if(body)notes[lesson]={body,name:latest.teacher.name,at:now};else delete notes[lesson];
      });dialog.close();render();note('Lesson guidance saved.');return true;
    }
    case 'teacher-announcement-form': {
      const title=String(data.get('title')||'').trim();const body=String(data.get('body')||'').trim();const course=data.get('course');
      if(!title||!body){note('Enter a title and message.');return true;}
      if(course!=='all'&&!getCourse(course))return true;
      if(remoteActive()){const previous=state.teacher.announcements.find(a=>a.id===form.dataset.id);state.teacher=await classroomApi('/teacher/announcements'+(previous?'/'+encodeURIComponent(previous.id):''),{method:previous?'PUT':'POST',body:{title,body,course,published:previous?.published??true}});if(dialog.open)dialog.close();render();note('Announcement published.');return true;}
      saveTeacherChange(latest=>{
        const previous=latest.teacher.announcements.find(a=>a.id===form.dataset.id);
        if(previous)Object.assign(previous,{title,body,course,updatedAt:now});
        else latest.teacher.announcements.push({id:crypto.randomUUID(),title,body,course,published:true,createdAt:now});
      });if(dialog.open)dialog.close();render();note('Announcement saved in the teaching demo.');return true;
    }
    case 'teacher-learner-note-form': {
      const id=form.dataset.learner;if(!teacherLearners().some(l=>l.id===id))return true;
      const body=String(data.get('note')||'').trim();
      if(remoteActive())state.teacher=await classroomApi('/teacher/learners/'+encodeURIComponent(id)+'/note',{method:'PUT',body:{body}});
      else saveTeacherChange(latest=>{if(body)latest.teacher.learnerNotes[id]=body;else delete latest.teacher.learnerNotes[id];});
      viewHasUnsavedChanges=false;note('Teaching note saved.');return true;
    }
    default:return false;
  }
}
