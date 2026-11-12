'use strict';

const supportedLanguages = ['en','zh-Hant','zh-Hans'];
const languageStorageKey = 'wecert-language';
let language = 'en';
try {
  const savedLanguage = localStorage.getItem(languageStorageKey);
  if (supportedLanguages.includes(savedLanguage)) language = savedLanguage;
} catch {}
const textSources = new WeakMap();
const attributeSources = new WeakMap();
let titleSource = '';
let titleRendered = '';
const escapePattern = text => text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const messageKeys = Object.keys(localeMessages['zh-Hant']).sort((a,b)=>b.length-a.length);
// Match complete English phrases in composed sentences, once, without translating values twice.
const messagePattern = new RegExp('(?<![A-Za-z])(?:'+messageKeys.map(escapePattern).join('|')+')(?![A-Za-z])','g');
function translateText(source,lang=language) {
  if (lang === 'en') return source;
  const messages = localeMessages[lang];
  const greeting = source.match(/^Welcome back, (.+)\. Pick up where you left off\.$/);
  if (greeting) return lang === 'zh-Hans' ? `欢迎回来，${greeting[1]}。继续上次的学习。` : `歡迎回來，${greeting[1]}。繼續上次的學習。`;
  const exact = messages[source.trim()];
  if (exact) return source.replace(source.trim(),exact);
  const simplified = lang === 'zh-Hans';
  const tr = (traditional,simple) => simplified ? simple : traditional;
  let result = source
    .replace(/^Complete all lessons in (.+?) and pass its knowledge check first\. Placement interest is a local demonstration only\.$/,(_,name)=>tr(`請先完成「${translateText(name,lang)}」的所有課堂並通過知識測驗。實習意向僅作本機示範。`,`请先完成「${translateText(name,lang)}」的所有课堂并通过知识测验。实习意向仅作本机示范。`))
    .replace(/^You completed (.+?) and passed its demo knowledge check\. Try registering interest; no real placement is offered\.$/,(_,name)=>tr(`你已完成「${translateText(name,lang)}」並通過示範知識測驗，可試用登記意向。本示範不提供真實實習。`,`你已完成「${translateText(name,lang)}」并通过示范知识测验，可试用登记意向。本示范不提供真实实习。`))
    .replace(/^From “(.+?)”: /,(_,title)=>tr(`教材「${translateText(title,lang)}」內容：`,`教材「${translateText(title,lang)}」内容：`))
    .replace(/Welcome back, (.+)\. Pick up where you left off\./g,(_,name)=>tr(`歡迎回來，${name}。繼續上次的學習。`,`欢迎回来，${name}。继续上次的学习。`))
    .replace(/Complete Lesson (\d+), then try its practice task\./g,(_,n)=>tr(`完成第 ${n} 課，再嘗試練習任務。`,`完成第 ${n} 课，再尝试练习任务。`))
    .replace(/Meets your budget, (\d+)-hour weekly limit and (.+?) availability\./g,(_,n,slot)=>tr(`符合你的預算、每週 ${n} 小時上限及${translateText(slot,lang)}安排。`,`符合你的预算、每周 ${n} 小时上限及${translateText(slot,lang)}安排。`))
    .replace(/(\d+) of (\d+) scenarios answered correctly/g,(_,n,total)=>tr(`${total} 道情境題答對 ${n} 道`,`${total} 道情境题答对 ${n} 道`))
    .replace(/(\d+) of (\d+) prep tasks/g,(_,n,total)=>tr(`已完成 ${n}／${total} 項準備任務`,`已完成 ${n}／${total} 项准备任务`))
    .replace(/(\d+) of (\d+) lessons completed/g,(_,n,total)=>tr(`已完成 ${n}／${total} 課`,`已完成 ${n}／${total} 课`))
    .replace(/(\d+) of (\d+) preview topics explored/g,(_,n,total)=>tr(`已閱覽 ${n}／${total} 個預覽主題`,`已阅览 ${n}／${total} 个预览主题`))
    .replace(/(\d+) of (\d+) correct\./g,(_,n,total)=>tr(`${total} 題答對 ${n} 題。`,`${total} 题答对 ${n} 题。`))
    .replace(/(\d+) lessons completed/g,(_,n)=>tr(`已完成 ${n} 課`,`已完成 ${n} 课`))
    .replace(/(\d+)% complete/g,(_,n)=>tr(`已完成 ${n}%`,`已完成 ${n}%`))
    .replace(/Lesson (\d+) of (\d+)/g,(_,n,total)=>tr(`第 ${n} 課，共 ${total} 課`,`第 ${n} 课，共 ${total} 课`))
    .replace(/Preview topic (\d+) of (\d+)/g,(_,n,total)=>tr(`預覽主題 ${n}，共 ${total} 個`,`预览主题 ${n}，共 ${total} 个`))
    .replace(/Open (.+) lesson (\d+)/g,(_,name,n)=>tr(`開啟${translateText(name,lang)}第 ${n} 課`,`打开${translateText(name,lang)}第 ${n} 课`))
    .replace(/Lesson (\d+)/g,(_,n)=>tr(`第 ${n} 課`,`第 ${n} 课`))
    .replace(/(\d+) courses?/g,(_,n)=>tr(`${n} 門課程`,`${n} 门课程`))
    .replace(/(\d+) weeks/g,(_,n)=>tr(`${n} 週`,`${n} 周`))
    .replace(/(\d+) hours\/week/g,(_,n)=>tr(`每週 ${n} 小時`,`每周 ${n} 小时`))
    .replace(/(\d+) hours/g,(_,n)=>tr(`${n} 小時`,`${n} 小时`))
    .replace(/(\d+) months/g,(_,n)=>`${n} 個月`.replace('個',simplified?'个':'個'))
    .replace(/(HK\$[\d,]+) total/g,(_,amount)=>tr(`總費用 ${amount}`,`总费用 ${amount}`));
  return result.replace(messagePattern,match=>messages[match]);
}
const t = source => translateText(source);
function restoreOrTranslate(node,sourceMap,read,write) {
  const current = read();
  const previous = sourceMap.get(node);
  const source = previous && previous.rendered === current ? previous.source : current;
  const rendered = t(source);
  if (current !== rendered) write(rendered);
  sourceMap.set(node,{source,rendered});
}
function localize(root=document.body) {
  document.documentElement.lang = language;
  document.querySelector('meta[name=description]')?.setAttribute('content',t('Explore affordable vocational training, a free skills assessment and career support in the WeCert prototype.'));
  const walker = document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.parentElement || node.parentElement.closest('script,style,textarea,[data-i18n-skip],[data-user-content],[data-localized-time],.account-name,.avatar')) continue;
    restoreOrTranslate(node,textSources,()=>node.nodeValue,value=>{node.nodeValue=value;});
  }
  for (const el of root.querySelectorAll('[aria-label],[placeholder],[alt]')) {
    if (el.closest('[data-i18n-skip],[data-user-content]')) continue;
    let sources = attributeSources.get(el);
    if (!sources) {sources = {}; attributeSources.set(el,sources);}
    for (const name of ['aria-label','placeholder','alt']) {
      if (!el.hasAttribute(name)) continue;
      const current = el.getAttribute(name);
      const previous = sources[name];
      const source = previous && previous.rendered === current ? previous.source : current;
      const rendered = t(source);
      if (current !== rendered) el.setAttribute(name,rendered);
      sources[name]={source,rendered};
    }
  }
  for (const time of root.querySelectorAll('time[data-localized-time]')) {
    const date=new Date(time.getAttribute('datetime'));
    if(!Number.isNaN(date.getTime()))time.textContent=new Intl.DateTimeFormat(language==='en'?'en-HK':language==='zh-Hans'?'zh-Hans-CN':'zh-Hant-HK',{dateStyle:'medium',timeStyle:'short'}).format(date);
  }
  for (const button of document.querySelectorAll('[data-language]')) button.setAttribute('aria-pressed',String(button.dataset.language===language));
  if (document.title !== titleRendered) titleSource = document.title;
  titleRendered = t(titleSource);
  document.title = titleRendered;
}
function setLanguage(nextLanguage) {
  if (!supportedLanguages.includes(nextLanguage)) return;
  language = nextLanguage;
  try {localStorage.setItem(languageStorageKey,language);} catch {}
  localize();
}
function languageControls() {
  return `<div class="language-switch" role="group" aria-label="Language / 語言 / 语言" data-i18n-skip>${[['zh-Hant','繁','繁體中文'],['zh-Hans','简','简体中文'],['en','ENG','English']].map(([id,label,name])=>`<button type="button" data-language="${id}" lang="${id}" aria-label="${name}" aria-pressed="${language===id}">${label}</button>`).join('')}</div>`;
}
