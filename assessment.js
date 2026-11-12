'use strict';

const assessmentQuestions = {
  'Office administration':[
    {skill:'Spreadsheets',question:'You need to show only unfinished tasks in a spreadsheet. Which tool would you use?',choices:['Filter Status to Open','Delete completed rows','Change the font colour'],answer:0,explanation:'A filter shows matching rows without removing records.'},
    {skill:'Spreadsheets',question:'Which formula adds every value from B2 to B5?',choices:['=B2+B5','=SUM(B2:B5)','=COUNT(B2:B5)'],answer:1,explanation:'SUM adds the full range, including B3 and B4.'},
    {skill:'Office software',question:'A colleague needs to scan a proposal quickly. What helps most?',choices:['A single long paragraph','More decorative fonts','Headings and clear action points'],answer:2,explanation:'Headings and action points make a document easier to scan.'},
    {skill:'Data entry',question:'Two customer records appear identical. What should you do first?',choices:['Delete both','Check the source and identifiers','Ignore them'],answer:1,explanation:'Verify records before changing data.'}
  ],
  'Retail and customer service':[
    {skill:'Customer service',question:'A customer says an item is faulty. What is the best first response?',choices:['Listen and clarify the problem','Blame the customer','Promise any refund without checking'],answer:0,explanation:'Listen, clarify, then check the applicable policy.'},
    {skill:'Customer service',question:'You are unsure about a return policy. What should you do?',choices:['Invent a rule','Check the policy or ask a supervisor','Refuse to help'],answer:1,explanation:'Check a reliable source before giving advice.'},
    {skill:'Data entry',question:'A stock count differs from the system. What comes next?',choices:['Change it without checking','Discard the list','Recount and record the discrepancy'],answer:2,explanation:'Verify and record the difference for follow-up.'},
    {skill:'Office software',question:'Which message gives a useful handover?',choices:['“All done”','“Order 24 awaits collection; call at 3 PM”','An empty message'],answer:1,explanation:'A useful handover identifies the task and next action.'}
  ],
  'Accounting and finance':[
    {skill:'Accounting',question:'Which document usually supports an expense entry?',choices:['A receipt or invoice','A memory of the purchase','An unrelated email'],answer:0,explanation:'Keep source documentation for each entry.'},
    {skill:'Accounting',question:'What is the basic accounting equation?',choices:['Assets = revenue only','Assets = liabilities + equity','Cash = all profit'],answer:1,explanation:'Assets are funded by liabilities and equity.'},
    {skill:'Spreadsheets',question:'How should you compare a spreadsheet total with the source records?',choices:['Assume the total is correct','Hide the source records','Reconcile the values and investigate differences'],answer:2,explanation:'Reconciliation checks completeness and accuracy.'},
    {skill:'Data entry',question:'A transaction date is unclear. What should you do?',choices:['Guess','Verify it against the source','Leave a false date'],answer:1,explanation:'Resolve uncertainty with the source record.'}
  ],
  'Language development':[
    {skill:'Japanese',question:'Which expression is a daytime Japanese greeting?',choices:['こんにちは','ありがとうございます','さようなら'],answer:0,explanation:'こんにちは is a daytime greeting.'},
    {skill:'Japanese',question:'Which hiragana represents the sound “a”?',choices:['い','あ','う'],answer:1,explanation:'あ represents a; い is i and う is u.'},
    {skill:'Japanese',question:'What does ありがとうございます express?',choices:['A question','A number','Polite thanks'],answer:2,explanation:'This is a polite thank-you.'},
    {skill:'Japanese',question:'In わたしは Alex です, who is being introduced?',choices:['A shop','The speaker, Alex','A train station'],answer:1,explanation:'The speaker is introducing themself as Alex.'}
  ]
};
assessmentQuestions['Explore my options'] = [assessmentQuestions['Office administration'][0],assessmentQuestions['Retail and customer service'][0],assessmentQuestions['Accounting and finance'][0],assessmentQuestions['Language development'][0]];
const questionsFor = p => assessmentQuestions[p.goal] || assessmentQuestions['Explore my options'];
function assessmentEvidence(p,answers) {
  const groups = {};
  questionsFor(p).forEach((q,i)=>{
    const g = groups[q.skill] ||= {correct:0,total:0};
    g.total++; if (Number(answers?.[i]) === q.answer && answers?.[i] !== undefined) g.correct++;
  });
  return groups;
}
function hasPrerequisite(c,p,answers,completedCourses={}) {
  if (c.id === 'intermediate') {
    const completed = completedCourses.spreadsheets || [];
    const evidence = assessmentEvidence(p,answers).Spreadsheets;
    return curriculum.spreadsheets.every((_,i)=>completed.includes(i+1)) ||
      (p.skills.includes('Spreadsheets') && evidence?.total >= 2 && evidence.correct === evidence.total);
  }
  // A self-report alone cannot establish the maths prerequisite for this preview.
  return c.id !== 'actuarial';
}
function assessmentMatches(profile,answers=state.assessmentAnswers,completedCourses=state.courses) {
  const evidence = assessmentEvidence(profile,answers);
  return courses.filter(c=>c.fee !== null && c.fee <= profile.budget &&
    c.schedule.hours <= profile.hours &&
    (profile.availability === 'Flexible' || c.schedule.slots.includes(profile.availability)) &&
    (profile.mode === 'Any format' || profile.mode === c.mode) &&
    hasPrerequisite(c,profile,answers,completedCourses)).map(course=>{
      const matchGoal = course.goal === profile.goal;
      const gap = evidence[course.skill] && evidence[course.skill].correct < evidence[course.skill].total;
      const score = 10*matchGoal + 3*gap + 2*course.demo - course.fee/1000;
      return {course,score,matchGoal,matchMode:true,gap};
    }).sort((a,b)=>b.score-a.score).slice(0,3);
}
