const {test,expect}=require('@playwright/test');

test('home provides distinct student and teacher workspace entries',async({page})=>{
 await page.goto('/');
 await expect(page.locator('.workspace-choice')).toHaveCount(2);
 await page.getByRole('link',{name:/Teacher edition Courses/}).click();
 await expect(page.locator('h1')).toHaveText('Teaching overview');
 await expect(page.locator('nav')).toContainText('Course management');
 await page.locator('.workspace-notice a').click();
 await expect(page.locator('h1')).toHaveText('Personal Career Dashboard');
});
test('teacher screens support all languages and mobile layouts',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:900});
  for(const lang of ['en','zh-Hant','zh-Hans']){
   for(const route of ['teacher','teacher-courses','teacher-course/japanese','teacher-learners','teacher-learner/current','teacher-inbox']){
    await page.goto('/#'+route);await page.locator(`header [data-language="${lang}"]`).click();await expect(page.locator('main h1')).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width} ${lang} ${route}`).toBeTruthy();
   }
  }
 }
 expect(errors).toEqual([]);
});
