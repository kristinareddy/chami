import assert from 'node:assert/strict';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const baseUrl=process.env.CHAMI_BASE_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({
  headless:true,
  ...(process.env.CHAMI_BROWSER_PATH?{executablePath:process.env.CHAMI_BROWSER_PATH}:{})
});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
const errors=[];
page.on('pageerror',error=>errors.push(`page: ${error.message}`));
page.on('console',message=>{ if(message.type()==='error') errors.push(`console: ${message.text()}`); });

try{
  await page.goto(baseUrl,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>typeof window.renderV25World==='function' && typeof window.ChamiVisuals==='object' && typeof window.ChamiCharacters==='object');
  await page.locator('#v25Hero').waitFor();

  assert.equal(await page.locator('.v25-module').count(),6);
  assert.equal(await page.locator('#v25Garden .v25-plot').count(),4);
  assert.equal(await page.locator('#homeAchievements .v25-mini-badge').count(),3);
  assert.ok(await page.locator('[data-v25-icon] svg').count()>=10);
  assert.match(await page.locator('.v26-family-hero-art').evaluate(element=>getComputedStyle(element).backgroundImage),/family-scenes-v26\.png/);
  assert.match(await page.locator('#heroPeach').evaluate(element=>element.style.backgroundImage),/peach-expressions-v26\.png/);
  const accessibility=await page.evaluate(()=>({
    unnamed:[...document.querySelectorAll('button')].filter(button=>!(button.innerText||button.getAttribute('aria-label')||'').trim()).length,
    smallModules:[...document.querySelectorAll('.v25-module')].filter(button=>button.getBoundingClientRect().height<48||button.getBoundingClientRect().width<48).length
  }));
  assert.equal(accessibility.unnamed,0);
  assert.equal(accessibility.smallModules,0);

  const fresh=await page.evaluate(()=>({
    child:state.child,
    unlocked:ChamiVisuals.achievements(p(),v25LiteracySummary()).filter(item=>item.unlocked).length,
    overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
  }));
  assert.equal(fresh.child,'Aurora');
  assert.equal(fresh.unlocked,0);
  assert.ok(fresh.overflow<=1,`horizontal overflow: ${fresh.overflow}px`);

  await page.evaluate(()=>{
    setChild('Teia');
    p().history.en.testword={seen:4,success:4,interval:8,due:20,mastered:true,proof:{meaning:true,context:true,recall:true,expression:true}};
    p().history.uk.tak={seen:3,success:2,interval:2,due:8,mastered:false,proof:{meaning:true,listening:true,recall:true}};
    ChamiLiteracy.observePhonics(p(),'printedWordMatch',true);
    ChamiLiteracy.observePhonics(p(),'patternMatch',true);
    p().learningDays=5;
    save();
    renderAll();
  });
  assert.match(await page.locator('#v26ExpressionHero').evaluate(element=>element.style.backgroundImage),/teia-expressions-v26\.png/);
  assert.ok(await page.locator('#homeAchievements .unlocked').count()>=1);
  assert.ok(await page.locator('#v25Garden .level-1,#v25Garden .level-2,#v25Garden .level-3,#v25Garden .level-4').count()>=1);

  const modelIsolation=await page.evaluate(()=>{
    const teiaSeen=Boolean(state.profiles.Teia.history.en.testword);
    setChild('Aurora');
    const auroSeen=Boolean(state.profiles.Aurora.history.en.testword);
    setChild('Teia');
    return {teiaSeen,auroSeen};
  });
  assert.deepEqual(modelIsolation,{teiaSeen:true,auroSeen:false});

  await page.locator('.v25-module.words').click();
  assert.equal(await page.locator('#words').evaluate(element=>element.classList.contains('active')),true);
  await page.evaluate(()=>go('home'));
  await page.locator('.v26-peach-helper').click();
  assert.doesNotMatch(await page.locator('#peachTip').textContent(),/Tap Peach/);

  if(process.env.CHAMI_HOME_SCREENSHOT_PATH){
    await page.evaluate(()=>go('home'));
    await page.screenshot({path:process.env.CHAMI_HOME_SCREENSHOT_PATH,fullPage:true});
  }
  if(process.env.CHAMI_PROGRESS_SCREENSHOT_PATH){
    await page.evaluate(()=>go('progress'));
    await page.screenshot({path:process.env.CHAMI_PROGRESS_SCREENSHOT_PATH,fullPage:true});
  }

  await page.evaluate(()=>go('home'));
  await page.waitForFunction(()=>Boolean(navigator.serviceWorker?.controller),null,{timeout:10000});
  await page.context().setOffline(true);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('#v25Hero').waitFor();
  assert.equal(await page.locator('.v26-scene-image-wrap>img').evaluate(image=>image.complete&&image.naturalWidth>0),true);
  await page.context().setOffline(false);

  assert.deepEqual(errors,[]);
  console.log('v25 visual-state regression passed inside v26: evidence growth, model isolation, mobile width, and offline reload');
}finally{
  await browser.close();
}
