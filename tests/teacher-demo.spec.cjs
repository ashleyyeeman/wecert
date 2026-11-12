const {test,expect}=require('@playwright/test');

async function liveRuntime(page){
 await page.route('**/api/runtime',route=>route.fulfill({json:{enabled:true,configured:true}}));
 await page.route('**/api/me',route=>route.fulfill({json:{user:null}}));
}
test('public teacher demo works without an account and keeps teaching changes separate',async({page,context})=>{
 await liveRuntime(page);
 const legacy=JSON.stringify({name:'Existing browser learner',teacher:{name:'Private local teacher'}});
 await page.addInitScript(({legacy})=>{if(localStorage.getItem('skillbridge-hk-demo-v1')===null)localStorage.setItem('skillbridge-hk-demo-v1',legacy);},{legacy});
 await context.addCookies([{name:'better-auth.session_token',value:'existing-session-is-retained',url:'http://127.0.0.1:8000',httpOnly:true}]);
 await page.goto('/#teacher');
 await expect(page.locator('h1')).toHaveText('Teacher edition');
 await expect(page.locator('#cloud-auth-form')).toBeVisible();
 const calls=[];page.on('request',request=>{if(new URL(request.url()).pathname.startsWith('/api/'))calls.push(request.url());});
 await page.locator('.teacher-demo-entry a').click();
 await expect(page.locator('h1')).toHaveText('Teaching overview');
 await expect(page.locator('#cloud-auth-form')).toHaveCount(0);
 await expect(page.locator('.teacher-demo-banner')).toContainText('No sign-in required');
 await expect(page.locator('body')).not.toContainText('Existing browser learner');
 await expect(page.locator('body')).not.toContainText('Private local teacher');
 await page.getByRole('link',{name:'Open inbox',exact:true}).click();
 const question=page.locator('.teacher-question').filter({hasText:'When should I use SUM instead of AVERAGE?'});
 await question.getByRole('button',{name:'Reply',exact:true}).click();await page.locator('#teacher-reply').fill('Use SUM for the total.');await page.getByRole('button',{name:'Save reply',exact:true}).click();
 await expect(page.locator('dialog')).not.toBeVisible();
 await page.locator('#teacher-inbox-status').selectOption('answered');await expect(page.locator('.teacher-saved-reply')).toContainText('Use SUM for the total.');
 await page.getByRole('link',{name:'Teaching overview',exact:true}).click();
 await page.locator('#announcement-title').fill('Demo announcement');await page.locator('#announcement-body').fill('This stays in the public demo only.');await page.locator('#teacher-announcement-form button[type=submit]').click();
 await expect(page.locator('.teacher-announcement')).toContainText('Demo announcement');
 await page.reload();await expect(page.locator('.teacher-announcement')).toContainText('Demo announcement');
 await page.getByRole('link',{name:'Course management',exact:true}).click();await page.locator('a[href="#teacher-course/spreadsheets"]').click();await page.locator('[data-action=teacher-guidance][data-lesson="3"]').click();await page.locator('#teacher-guidance').fill('Select the whole range.');await page.getByRole('button',{name:'Save guidance',exact:true}).click();await expect(page.locator('dialog')).not.toBeVisible();
 await page.locator('.workspace-notice a').click();await page.goto('/?demo=teacher#lesson/spreadsheets/3');await expect(page.locator('.teacher-guidance')).toContainText('Select the whole range.');
 expect(await page.evaluate(()=>localStorage.getItem('skillbridge-hk-demo-v1'))).toEqual(legacy);
 expect(JSON.parse(await page.evaluate(()=>localStorage.getItem('wecert-teacher-demo-v1'))).teacher.announcements).toHaveLength(1);
 expect(calls).toEqual([]);
 await page.getByRole('button',{name:'Reset teacher demo',exact:true}).click();await expect(page.locator('h1')).toHaveText('Teaching overview');await expect(page.locator('.teacher-announcement')).toHaveCount(0);
 expect(await page.evaluate(()=>localStorage.getItem('skillbridge-hk-demo-v1'))).toEqual(legacy);
 expect((await context.cookies()).find(cookie=>cookie.name==='better-auth.session_token')?.value).toBe('existing-session-is-retained');
 expect(calls).toEqual([]);
 await page.getByRole('link',{name:'Live teacher sign in',exact:true}).click();await expect(page.locator('#cloud-auth-form')).toBeVisible();expect(new URL(page.url()).search).toBe('');await expect(page.locator('.teacher-demo-banner')).toHaveCount(0);
});

test('teacher demo links, translations and layouts work on phones and desktops',async({page})=>{
 await liveRuntime(page);const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/');await page.getByRole('link',{name:'Teacher demo · No sign-in required',exact:false}).click();await expect(page.locator('h1')).toHaveText('Teaching overview');
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});for(const language of ['en','zh-Hant','zh-Hans']){
  for(const route of ['teacher','teacher-courses','teacher-inbox','teacher-learners']){await page.goto('/?demo=teacher#'+route);await page.locator('header [data-language="'+language+'"]').click();await expect(page.locator('.teacher-demo-banner')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),width+' '+language+' '+route).toBe(true);}
  await expect(page.locator('.teacher-demo-banner strong')).toHaveText(language==='en'?'Teacher demo · No sign-in required':language==='zh-Hant'?'教師 Demo 展示版 · 毋須登入':'教师 Demo 展示版 · 毋须登入');
 }}expect(errors).toEqual([]);
});
