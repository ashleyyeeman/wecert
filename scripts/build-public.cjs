const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');const dest=path.join(root,'public');
fs.rmSync(dest,{recursive:true,force:true});fs.mkdirSync(dest,{recursive:true});
const files=['index.html','style.css','translations.js','i18n.js','course-data.js','assessment.js','teacher-data.js','storage.js','assessment-views.js','learning-views.js','information-views.js','teacher-views.js','teacher-actions.js','remote.js','app.js'];
for(const file of files)fs.copyFileSync(path.join(root,file),path.join(dest,file));
fs.cpSync(path.join(root,'assets'),path.join(dest,'assets'),{recursive:true});
console.log('Public assets prepared. Server code and secrets are excluded.');
