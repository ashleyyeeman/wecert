'use strict';

const courses = [
  {id:'office', type:'Career Skills Courses', track:'Digital skills', name:'Basic Office Digital Literacy', mode:'Hybrid', weeks:6, fee:480, icon:'grid', tone:'mint', goal:'Office administration', skill:'Office software', level:'Beginner', about:'Create workplace documents in Word, organise data in Excel and present ideas with PowerPoint.', units:['Write a workplace proposal in Word','Build an Excel tracker with formulas','Present a team update in PowerPoint'], credential:'Course completion record', placement:true},
  {id:'spreadsheets', type:'Career Skills Courses', track:'Digital skills', name:'Spreadsheet Essentials', mode:'Online', weeks:4, fee:280, icon:'grid', tone:'mint', goal:'Office administration', skill:'Spreadsheets', level:'Beginner', about:'Practise formulas, sort and filter data, and build a spreadsheet you can use in office work.', units:['Spreadsheet setup and formatting','Formulas and data organisation','Sort, filter and check your work'], credential:'Course completion record', placement:true},
  {id:'service', type:'Career Skills Courses', track:'Workplace skills', name:'Retail & Customer Service', mode:'In person', weeks:4, fee:320, icon:'people', tone:'sand', goal:'Retail and customer service', skill:'Customer service', level:'Beginner', about:'Practise customer conversations, complaint handling and day-to-day retail tasks.', units:['Serve customers in common scenarios','Handle complaints professionally','Practise till and stock routines'], credential:'Course completion record', placement:true},
  {id:'accounting', type:'Exam Preparation & Qualifications', track:'Exam preparation', name:'Financial Accounting (FA) Preparation', mode:'Hybrid', weeks:8, fee:780, icon:'award', tone:'blue', goal:'Accounting and finance', skill:'Accounting', level:'Beginner', about:'Build a foundation in double-entry bookkeeping and financial statements while preparing for an external exam.', units:['Double-entry bookkeeping','Trial balances and adjustments','Financial statements and practice questions'], credential:'External exam preparation', external:'Financial Accounting (FA) exam'},
  {id:'japanese', type:'Exam Preparation & Qualifications', track:'Language training', name:'Japanese Language Proficiency Preparation', mode:'Online', weeks:8, fee:620, icon:'award', tone:'blue', goal:'Language development', skill:'Japanese', level:'Beginner', about:'Develop reading and listening skills for Japanese language exams. The demo features the introductory N5 route.', units:['Kana and everyday vocabulary','Foundational grammar and reading','Listening and practice questions'], credential:'External exam preparation', external:'Japanese-Language Proficiency Test (JLPT)'},
  {id:'actuarial', type:'Exam Preparation & Qualifications', track:'Professional development', name:'Actuarial Career Foundations', mode:'Hybrid', weeks:8, fee:860, icon:'award', tone:'blue', goal:'Accounting and finance', skill:'Accounting', level:'Intermediate', about:'Explore actuarial work, introductory risk concepts and pathways to professional qualification.', units:['Introduction to actuarial roles','Risk, probability and financial maths','Research professional pathways'], credential:'Course completion record', external:'Actuarial professional pathways'},
  {id:'intermediate', type:'Career Skills Courses', track:'Digital skills', name:'Intermediate Spreadsheets', mode:'Online', weeks:4, fee:420, icon:'chart', tone:'mint', goal:'Office administration', skill:'Spreadsheets', level:'Intermediate', about:'Use lookups, pivot tables and charts to report on workplace data.', units:['Lookups and data validation','Pivot tables and summary reports','Charts for workplace decisions'], credential:'Course completion record'},
  {id:'corporate', type:'Corporate Training', track:'Team development', name:'Digital Skills for Teams', mode:'Hybrid', weeks:4, fee:null, icon:'briefcase', tone:'sand', about:'Arrange a practical training programme for employees, with workshops shaped around your team’s day-to-day work.', units:['Workplace documents and collaboration','Data handling and reporting','Team practice with relevant scenarios'], credential:'Custom employer training'}
];

const lessons = [
  'Tour the spreadsheet workspace', 'Enter and format data', 'Write basic formulas', 'Use cell references',
  'Work with dates and numbers', 'Check data for mistakes', 'Sort and filter your data',
  'Summarise results with functions', 'Present data in a simple chart', 'Complete the final practice task'
];
const lessonPractice = [
  'Identify the cell address, formula bar and sheet tabs.',
  'Format dates consistently and resize each column to fit its values.',
  'Use SUM to add a range and AVERAGE to calculate its mean.',
  'Copy a relative reference, then use a dollar sign to make it absolute.',
  'Choose a date format and apply the correct decimal places to currency.',
  'Look for blanks, duplicated records and inconsistent entries.',
  'Sort the entire table by hours worked. Filter the Status column to show only Open records.',
  'Use COUNTIF to count Open records. Check your result against the filtered rows.',
  'Build a column chart from the category totals. Add a title and check the axis labels.',
  'Create a table, add a formula, filter it by status and summarise the results in a chart.'
];
const goals = ['Office administration','Retail and customer service','Accounting and finance','Language development','Explore my options'];
const skills = ['Office software','Spreadsheets','Customer service','Accounting','Japanese','Data entry'];
const formats = ['Any format','Online','Hybrid','In person'];
const categories = [
  {name:'Career Skills Courses', icon:'grid', tone:'mint', desc:'Practise job-ready skills and explore internship pathways.'},
  {name:'Exam Preparation & Qualifications', icon:'award', tone:'blue', desc:'Prepare for external exams and see what each course awards.'},
  {name:'Corporate Training', icon:'briefcase', tone:'sand', desc:'Develop practical skills with training designed for your team.'}
];
const supportTypes = [
  {name:'CV review', icon:'list', desc:'Get feedback on your CV and how you present your new skills.'},
  {name:'Career guidance', icon:'target', desc:'Discuss job options and plan the next steps in your career.'},
  {name:'Partner job referrals', icon:'people', desc:'Register interest in suitable opportunities with partner employers.'}
];
const sampleProfile = {education:'Secondary school', experience:'1–3 years', skills:['Customer service','Data entry'], goal:'Office administration', mode:'Online', availability:'Weekday evenings', hours:4, budget:500};

// Course content belongs to its own course; only these three routes are complete demos.
const curriculum = {
  spreadsheets: lessons.map((title,i)=>({title, task:lessonPractice[i], guide:[
    'Columns use letters and rows use numbers: B3 is column B, row 3. Find the formula bar above the grid and the sheet tabs below it.',
    'Use one header row and one record per row. Select the date cells and apply one date format. Widen the column until all values are visible.',
    'A formula begins with =. Enter =SUM(B2:B5) to total a range, and =AVERAGE(B2:B5) for its mean. Compare both results with a manual calculation.',
    'Copying =B2*C2 down one row changes it to =B3*C3. A fixed reference such as $F$1 stays unchanged when copied.',
    'Formatting changes how a value is displayed. Use a date format for dates and two decimal places for currency. Check the underlying value in the formula bar.',
    'Check required cells for blanks, use a consistent spelling for each status and review duplicates before removing anything.',
    'Select the full table before sorting so each record stays together. Sort Hours from largest to smallest. Filter Status to Open; clear the filter to restore all rows.',
    'Enter =COUNTIF(C2:C6,"Open") to count matching statuses. Compare the count with visible Open records after filtering.',
    'Select category labels and totals, insert a column chart, then add a clear title. Check that the axes show the correct units.',
    'Build a five-row task tracker with Task, Hours and Status columns. Total Hours with SUM, filter to Open and create a chart of hours by task.'
  ][i]})),
  office: [
    {title:'Write a workplace document',guide:'Give a proposal a descriptive title, purpose, three action points and a deadline. Use heading styles and a short bulleted list. Save a copy before exporting to PDF.',task:'Draft a half-page request for a team meeting. Include the purpose, agenda and date.'},
    {title:'Build a simple office tracker',guide:'Use Task, Owner, Due date and Status columns. Put one task on each row. Use consistent date formatting and filter Status to Open to find unfinished work.',task:'Create a tracker with four tasks. Filter the unfinished tasks and check that each owner stays with the correct task.'},
    {title:'Present a team update',guide:'Use three slides: goal, progress and next action. Keep one main message per slide. Use high contrast text and label any chart with its units.',task:'Write a three-slide outline with a clear action and deadline on the final slide.'}
  ],
  japanese: [
    {title:'Kana and everyday greetings',guide:'Hiragana represents Japanese sounds: あ a, い i, う u, え e, お o. こんにちは (konnichiwa) is a daytime greeting; ありがとうございます (arigatou gozaimasu) means thank you politely.',task:'Read あ・い・う・え・お aloud. Write a short greeting and a polite thank-you. Compare your answer with the examples.'},
    {title:'Introduce yourself with simple sentences',guide:'Use わたしは Alex です (watashi wa Alex desu) for “I am Alex”. は marks the topic and is read wa here. です makes a polite statement; adding か makes it a question.',task:'Write “I am Alex” using the model, then change it into a polite question. Identify the topic marker.'},
    {title:'Read a short everyday exchange',guide:'A: おなまえは？ (What is your name?) B: Alex です (I am Alex). A: ありがとうございます (Thank you). Look for familiar kana and the context before choosing an answer.',task:'In “Alex です”, identify who is being introduced. Read the exchange aloud, then try the introductory knowledge check. This text demo does not assess listening.'}
  ]
};
const courseChecks = {
  spreadsheets:[
    {question:'Which action shows only Open tasks while keeping every record?',choices:['Sort by Status','Filter Status to Open','Delete the Closed rows'],answer:1,explanation:'Filtering temporarily hides non-matching rows and keeps the underlying records.'},
    {question:'Which formula totals B2 through B5?',choices:['=B2+B5','=SUM(B2:B5)','=COUNT(B2:B5)'],answer:1,explanation:'SUM adds every numeric value in the specified range.'},
    {question:'Before sorting by Hours, what should you select?',choices:['The entire table','Only the Hours values','Only the title'],answer:0,explanation:'Select the entire table so the values in each record stay together.'}
  ],
  office:[
    {question:'How should you structure a short workplace proposal?',choices:['One unbroken paragraph','A title, purpose and clear action points','Only a decorative cover'],answer:1,explanation:'A clear structure helps colleagues find the purpose and next actions.'},
    {question:'How can you show only unfinished tasks in an office tracker?',choices:['Filter Status to Open','Delete all other rows','Rename the worksheet'],answer:0,explanation:'Filtering narrows the view while keeping all records.'},
    {question:'What belongs at the end of a team update?',choices:['Every detail from the project','An unrelated picture','A clear action and deadline'],answer:2,explanation:'A specific next action makes the update useful.'}
  ],
  japanese:[
    {question:'Which greeting means a polite “thank you”?',choices:['こんにちは','ありがとうございます','あいうえお'],answer:1,explanation:'ありがとうございます is a polite way to thank someone.'},
    {question:'In わたしは Alex です, what does は mark?',choices:['A number','The topic','A past-tense ending'],answer:1,explanation:'は marks the topic and is pronounced wa in this sentence.'},
    {question:'What does Alex です mean in a self-introduction?',choices:['Goodbye Alex','Where is Alex?','I am Alex'],answer:2,explanation:'In this introduction, the speaker is giving their name.'}
  ]
};
const coursePreparation = {
  spreadsheets:['Review cells and formatting','Practise formulas and filtering','Pass the spreadsheet knowledge check','Review your spreadsheet mistakes'],
  office:['Draft your workplace document','Build your office tracker','Pass the office knowledge check','Review your presentation outline'],
  japanese:['Review kana and greetings','Practise introductions and reading','Pass the Japanese knowledge check','Review language errors; plan listening practice']
};
const courseSchedules = {
  office:{hours:4, slots:['Weekday evenings','Weekends'],requiredSlots:['Weekday evenings','Weekends'],time:'Tue 7–9 PM online + Sat 10 AM–12 PM workshop',location:'Online + proposed Hong Kong community venue (TBC)'},
  spreadsheets:{hours:3, slots:['Weekday evenings','Weekends','Weekday daytime'],time:'Self-paced study + optional Wed 7–8 PM online clinic',location:'Online'},
  service:{hours:4, slots:['Weekends'],time:'Sat 10 AM–2 PM',location:'Proposed Hong Kong community venue (TBC)'},
  accounting:{hours:5, slots:['Weekday evenings','Weekends'],requiredSlots:['Weekday evenings','Weekends'],time:'Tue 7–9 PM online + Sat 10 AM–1 PM workshop',location:'Online + proposed Hong Kong community venue (TBC)'},
  japanese:{hours:3, slots:['Weekday evenings','Weekends'],time:'Self-paced study + optional Thu 7–8 PM online clinic',location:'Online'},
  actuarial:{hours:6, slots:['Weekends'],time:'Sat 10 AM–4 PM',location:'Online + proposed Hong Kong community venue (TBC)'},
  intermediate:{hours:4, slots:['Weekday evenings'],time:'Wed 7–9 PM online + 2 hours independent practice',location:'Online'},
  corporate:{hours:4, slots:['Flexible'],time:'Arranged with employer',location:'Online or employer venue (by arrangement)'}
};
for (const c of courses) {
  c.demo = Boolean(curriculum[c.id]);
  if (c.id === 'japanese') c.icon = 'book';
  if (c.id === 'accounting') c.icon = 'chart';
  if (c.id === 'actuarial') c.icon = 'target';
  c.schedule = courseSchedules[c.id];
  c.language = c.id === 'japanese' ? 'English explanations with introductory Japanese' : 'English (prototype)';
  c.entry = c.id === 'intermediate' ? 'Spreadsheet foundations: formulas, cell references, sorting and filtering.' : c.id === 'actuarial' ? 'Comfort with algebra and probability; adviser review recommended.' : 'No formal qualification required. Basic reading and access to a computer or smartphone.';
}
const courseLessons = c => curriculum[c.id] || c.units.map(title=>({title,guide:'This course is a content preview. A full teaching sequence and assessment are still being developed.',task:'Explore the course outline and discuss your learning goals with an adviser.'}));
const lessonHref = (id,number,ask='') => '#lesson/'+id+'/'+number+(ask?'/'+ask:'');

// The server uses the same catalogue to validate course IDs, lesson progress and quiz answers.
if(typeof module!=='undefined'&&module.exports)module.exports={courses,courseChecks,courseLessons,sampleProfile,goals,skills,formats};
