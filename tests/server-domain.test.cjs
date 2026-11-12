const {test}=require('node:test');const assert=require('node:assert/strict');
const domain=import('../backend/domain.mjs');
test('student state cannot grant teacher access, create replies or mark a quiz passed',async()=>{
 const {freshLearner,sanitiseLearner}=await domain;const original=freshLearner('Student');
 const actual=sanitiseLearner({...original,teacher:{name:'Fake teacher'},role:'teacher',quizByCourse:{japanese:true},comments:[{teacherReply:{body:'fake'}}]},original);
 assert(!Object.hasOwn(actual,'teacher'));assert.equal(actual.role,undefined);assert.deepEqual(actual.quizByCourse,{});assert.deepEqual(actual.comments,[]);
});
test('learner changes preserve authoritative quiz results and reject invalid assessment input',async()=>{
 const {freshLearner,sanitiseLearner}=await domain;const previous=freshLearner('Student');previous.quizByCourse={japanese:true};
 const actual=sanitiseLearner({...previous,quizByCourse:{},examByCourse:{japanese:[]}},previous);
 assert.equal(actual.quizByCourse.japanese,true);assert.deepEqual(actual.examByCourse.japanese,[2]);
 assert.throws(()=>sanitiseLearner({...previous,profile:{...previous.profile,budget:-1}},previous));
});
test('the backend validates course and lesson boundaries before storing a question',async()=>{
 const {courseAndLesson}=await domain;
 assert.equal(courseAndLesson('japanese',3).id,'japanese');assert.throws(()=>courseAndLesson('japanese',4));assert.throws(()=>courseAndLesson('unknown',1));
});
