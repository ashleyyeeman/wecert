const {test,expect}=require('@playwright/test');
const key='skillbridge-hk-demo-v1';
async function goto(page,hash){await page.goto('/#'+hash);await expect(page.locator('main h1')).toBeVisible();}
async function assessment(page,{budget='500',hours='4',goal='Office administration'}={}) {
  await goto(page,'assessment');
  await page.getByLabel('Course budget (HK$)').fill(budget);
  await page.getByLabel('Hours available per week').fill(hours);
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await page.getByLabel('Career goal',{exact:true}).selectOption(goal);
  await page.getByRole('button',{name:'Try skill scenarios'}).click();
  for(let i=0;i<4;i++) await page.locator(`input[name=q${i}]`).first().check();
  await page.getByRole('button',{name:'Build my learning path'}).click();
  await expect(page.getByRole('heading',{name:'Your recommended learning path'})).toBeVisible();
}
test('Japanese deep links, tutor, quiz and checklist remain course-specific across reload',async({page})=>{
  await goto(page,'lesson/japanese/3');
  await expect(page.locator('main')).toContainText('Alex です');
  await page.getByLabel('Your question',{exact:true}).fill('Can you explain this?');
  await page.getByRole('button',{name:'Save question'}).click();
  await expect(page.locator('.comment')).toContainText('Alex です');
  await expect(page.locator('.comment')).not.toContainText('Sorting');
  await page.getByRole('button',{name:'Take knowledge check'}).click();
  await expect(page.locator('dialog')).toContainText('Japanese');
  await expect(page.locator('dialog')).not.toContainText('Spreadsheet');
  for(const [i,answer] of [1,1,2].entries()) await page.locator(`dialog input[name=q${i}][value="${answer}"]`).check();
  await page.getByRole('button',{name:'Check answers'}).click();
  await expect(page.locator('#quiz-feedback')).toContainText('passed');
  await page.getByRole('button',{name:'Close dialog'}).click();
  await goto(page,'dashboard');
  await expect(page.locator('.checklist')).toContainText('kana');
  await expect(page.locator('.checklist')).not.toContainText('formulas');
  await expect(page.locator('.next-course')).not.toContainText('Intermediate Spreadsheets');
  await page.reload();
  await expect(page.locator('.stat').nth(1)).toContainText('Passed');
  await goto(page,'lesson/spreadsheets/1');
  await goto(page,'dashboard');
  await expect(page.locator('.stat').nth(1)).not.toContainText('Passed');
});
test('assessment yields evidence and honest prerequisites; profile is collapsed',async({page})=>{
  await assessment(page);
  await expect(page.locator('.matches-list')).toContainText('Spreadsheet Essentials');
  await expect(page.locator('.matches-list')).not.toContainText('Intermediate Spreadsheets');
  await expect(page.locator('.learning-result')).toContainText('after foundations');
  await expect(page.locator('.profile-details')).not.toHaveAttribute('open');
  await page.reload();
  await expect(page.getByRole('heading',{name:'Your recommended learning path'})).toBeVisible();
});
test('zero budget and too few hours still offer free resources and a local funding enquiry',async({page})=>{
  await assessment(page,{budget:'0',hours:'1'});
  await expect(page.locator('.learning-result')).toContainText('No paid course meets');
  await page.getByRole('link',{name:'Free starter resources',exact:true}).first().click();
  await page.getByRole('link',{name:'Open free starter lesson'}).last().click();
  await expect(page.locator('main')).toContainText('Kana');
  await goto(page,'resources');
  await page.getByRole('button',{name:'Save a demo funding enquiry'}).click();
  await page.getByRole('button',{name:'Save local demo enquiry'}).click();
  const stored=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
  expect(stored.fundingEnquiry).toBeTruthy();
});
test('income handles zero baseline and follow-ups save once per month with employment hours',async({page})=>{
  await goto(page,'dashboard');
  await page.getByRole('button',{name:'Income calculator',exact:true}).click();
  await page.getByLabel('Monthly income before (HK$)').fill('0');
  await page.getByLabel('Monthly income after (HK$)').fill('8000');
  await page.getByRole('button',{name:'Calculate and save example'}).click();
  await expect(page.locator('main')).toContainText('Percentage change is undefined');
  for(const m of ['3','6','12']) {
    await page.getByRole('button',{name:'Add follow-up'}).click();
    await page.getByLabel('Months after completion').selectOption(m);
    await page.getByRole('button',{name:'Save example follow-up'}).click();
  }
  await page.reload();
  await expect(page.locator('tbody tr')).toHaveCount(3);
  await expect(page.locator('tbody')).toContainText('N/A (zero baseline)');
});
test('legacy links are deterministic and unknown lessons show a recovery page',async({page})=>{
  await goto(page,'lesson/japanese/1');
  await goto(page,'lesson/7');
  await expect(page).toHaveURL(/#lesson\/spreadsheets\/7$/);
  await expect(page.locator('main h1')).toHaveText('Sort and filter your data');
  await goto(page,'lesson/japanese/99');
  await expect(page.locator('main h1')).toHaveText('Page not found');
});
test('office completion unlocks its own local internship interest, not the spreadsheet quiz',async({page})=>{
  for(let i=1;i<=3;i++) {
    await goto(page,'lesson/office/'+i);
    await page.getByRole('button',{name:'Mark lesson complete'}).click();
  }
  await page.getByRole('button',{name:'Take knowledge check'}).click();
  for(const [i,a] of [1,0,2].entries()) await page.locator(`dialog input[name=q${i}][value="${a}"]`).check();
  await page.getByRole('button',{name:'Check answers'}).click();
  await page.getByRole('button',{name:'Close dialog'}).click();
  await goto(page,'dashboard');
  await page.getByRole('button',{name:'Check demo eligibility'}).click();
  await expect(page.getByRole('button',{name:'Register demo interest'})).toBeVisible();
});
test('all pages render without errors or mobile document overflow',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:390,height:844});
  for(const route of ['home','courses','course/japanese','assessment','dashboard','lesson/japanese/1','about','proposal','resources']) {
    await goto(page,route);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  }
  expect(errors).toEqual([]);
  await page.screenshot({path:'test-results/mobile-resources.png',fullPage:true});
});
