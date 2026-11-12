const {test,expect}=require('@playwright/test');

test('requested button text, language persistence and unsaved form values survive switching',async({page})=>{
  await page.goto('/#assessment');
  await expect(page.locator('header [data-language]')).toHaveText(['繁','简','ENG']);
  await page.locator('#assessment-budget').fill('0');
  await page.locator('#assessment-hours').fill('2');
  await page.getByRole('button',{name:'繁體中文',exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('lang','zh-Hant');
  await expect(page.locator('h1')).toHaveText('技能評估');
  await expect(page.locator('#assessment-budget')).toHaveValue('0');
  await page.getByRole('button',{name:'简体中文',exact:true}).click();
  await expect(page.locator('#assessment-hours')).toHaveValue('2');
  await expect(page.locator('header [data-language="zh-Hans"]')).toHaveAttribute('aria-pressed','true');
  await page.locator('nav a[href="#courses"]').click();
  await expect(page.locator('h1')).toHaveText('探索课程');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang','zh-Hans');
  await expect(page.locator('h1')).toHaveText('探索课程');
  await page.getByRole('button',{name:'English',exact:true}).click();
  await expect(page.locator('h1')).toHaveText('Explore courses');
});
test('both Chinese names work in course search and option values remain canonical',async({page})=>{
  await page.goto('/#courses');
  await page.getByRole('button',{name:'繁體中文',exact:true}).click();
  await page.locator('#course-search').fill('試算表');
  await expect(page.locator('.course-card')).toHaveCount(2);
  await page.getByRole('button',{name:'简体中文',exact:true}).click();
  await page.locator('#course-search').fill('试算表');
  await expect(page.locator('.course-card')).toHaveCount(2);
  await page.locator('#course-mode').selectOption('Online');
  await expect(page.locator('#course-mode')).toHaveValue('Online');
  await page.locator('#course-search').fill('');
  await page.locator('#course-type').selectOption('Exam Preparation & Qualifications');
  await expect(page.locator('.course-card')).toHaveCount(1);
  await expect(page.locator('.course-card')).toContainText('日本语能力试备试课程');
});
test('Chinese assessment submits canonical values and results remain readable after reload',async({page})=>{
  await page.goto('/#assessment');
  await page.getByRole('button',{name:'繁體中文',exact:true}).click();
  await page.locator('#assessment-form button[type=submit]').click();
  await page.locator('#assessment-goal').selectOption('Language development');
  await page.locator('#assessment-form button[type=submit]').click();
  await expect(page.locator('.scenario').first()).toContainText('哪句日語用作日間問候');
  for(const [i,a] of [0,1,2,1].entries())await page.locator(`input[name=q${i}][value="${a}"]`).check();
  await page.locator('#scenario-form button[type=submit]').click();
  await expect(page.locator('.learning-result')).toContainText('4 道情境題答對 4 道');
  await page.reload();
  await expect(page.locator('.learning-result h2')).toHaveText('你的建議學習路徑');
  const profile=await page.evaluate(()=>JSON.parse(localStorage.getItem('skillbridge-hk-demo-v1')).profile);
  expect(profile.goal).toBe('Language development');
});
test('language switches preserve dialog answers, names and questions without translating user content',async({page})=>{
  await page.goto('/#home');
  await page.getByLabel('Display name',{exact:true}).fill('Home');
  await page.locator('#profile-form button[type=submit]').click();
  await page.goto('/#lesson/japanese/3');
  await page.locator('#lesson-question').fill('Home is my display name. Keep this exactly.');
  await page.getByRole('button',{name:'繁體中文',exact:true}).click();
  await expect(page.locator('#lesson-question')).toHaveValue('Home is my display name. Keep this exactly.');
  await page.locator('#comment-form button[type=submit]').click();
  await expect(page.locator('.comment [data-user-content]').first()).toHaveText('Home');
  await expect(page.locator('.comment [data-user-content]').nth(1)).toHaveText('Home is my display name. Keep this exactly.');
  await page.locator('[data-action=quiz]').click();
  await page.locator('dialog input[name=q0][value="1"]').check();
  await page.locator('dialog [data-language="zh-Hans"]').click();
  await expect(page.locator('dialog input[name=q0][value="1"]')).toBeChecked();
  await expect(page.locator('dialog')).toContainText('哪句表达礼貌的');
  await page.locator('dialog input[name=q1][value="1"]').check();
  await page.locator('dialog input[name=q2][value="2"]').check();
  await page.locator('dialog button[type=submit]').click();
  await expect(page.locator('#quiz-feedback')).toContainText('已通过示范测验');
  await page.locator('dialog [data-action=close]').click();
  await page.goto('/#dashboard');
  await expect(page.locator('.page-title p')).toContainText('Home');
  await expect(page.locator('.account-name')).toHaveText('Home');
});
test('all languages fit mobile and desktop layouts without console errors',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const width of [320,390,768,1440]) {
    await page.setViewportSize({width,height:900});
    for(const lang of ['en','zh-Hant','zh-Hans']) {
      for(const route of ['home','courses','course/japanese','assessment','dashboard','lesson/japanese/1','about','proposal','resources']) {
        await page.goto('/#'+route);
        await page.locator(`header [data-language="${lang}"]`).click();
        await expect(page.locator('main h1')).toBeVisible();
        expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width} ${lang} ${route}`).toBeTruthy();
      }
    }
  }
  expect(errors).toEqual([]);
});
