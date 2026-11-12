const {test,expect}=require('@playwright/test');

test('a hybrid course appears only after selecting all required time slots',async({page})=>{
  await page.goto('/#assessment');
  await page.locator('#assessment-mode').selectOption('Hybrid');
  await page.locator('#assessment-budget').fill('1000');
  await page.locator('#assessment-hours').fill('5');
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await page.getByRole('button',{name:'Try skill scenarios'}).click();
  for(let i=0;i<4;i++)await page.locator(`input[name=q${i}]`).first().check();
  await page.getByRole('button',{name:'Build my learning path'}).click();
  await expect(page.locator('.matches-list')).not.toContainText('Basic Office Digital Literacy');
  await page.getByRole('button',{name:'Edit assessment'}).click();
  await page.locator('input[name=additionalAvailability][value=Weekends]').check();
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await page.getByRole('button',{name:'Try skill scenarios'}).click();
  await page.getByRole('button',{name:'Build my learning path'}).click();
  await expect(page.locator('.matches-list')).toContainText('Basic Office Digital Literacy');
  await page.reload();
  await expect(page.locator('.matches-list')).toContainText('Basic Office Digital Literacy');
});
test('dashboard next action and follow-on course respect assessment and zero budget',async({page})=>{
  await page.goto('/#dashboard');
  await expect(page.locator('.next-step')).toContainText('Complete your skills assessment');
  await expect(page.locator('.next-step a')).toHaveAttribute('href','#assessment');
  await page.locator('.next-step a').click();
  await page.locator('#assessment-budget').fill('0');
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await page.getByRole('button',{name:'Try skill scenarios'}).click();
  for(let i=0;i<4;i++)await page.locator(`input[name=q${i}]`).first().check();
  await page.getByRole('button',{name:'Build my learning path'}).click();
  await page.locator('nav a[href="#dashboard"]').click();
  await expect(page.locator('.next-step')).toContainText('Complete Lesson 7');
  await expect(page.locator('.next-course')).not.toContainText('Intermediate Spreadsheets');
  await expect(page.locator('.next-course a')).toHaveAttribute('href','#resources');
});
test('learner supporting text remains at least 14px on mobile and booking can be managed',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/#dashboard');
  for(const selector of ['.course-meta','.lesson-index','.lesson-progress','.checklist','.next-course p','.dashboard-side .panel-title p']) {
    const sizes=await page.locator(selector).evaluateAll(elements=>elements.map(e=>parseFloat(getComputedStyle(e).fontSize)));
    expect(sizes.every(size=>size>=14),selector).toBeTruthy();
  }
  await page.getByRole('button',{name:'CV review',exact:true}).click();
  await page.getByRole('button',{name:'Confirm demo booking'}).click();
  await page.getByRole('button',{name:'Manage appointment',exact:true}).click();
  await page.getByRole('button',{name:'Cancel booking'}).click();
  await expect(page.getByRole('button',{name:'Manage appointment',exact:true})).toHaveCount(0);
});
