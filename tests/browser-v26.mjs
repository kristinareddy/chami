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
  await page.waitForFunction(()=>typeof window.renderV26Characters==='function' && typeof window.ChamiCharacters==='object');
  await page.locator('#v26ExpressionGrid .v26-expression-choice').first().waitFor();

  assert.equal(await page.locator('.v26-scene-hotspots button').count(),4);
  assert.equal(await page.locator('#v26ExpressionGrid .v26-expression-choice').count(),9);
  assert.equal(await page.locator('.v26-scene-image-wrap>img').evaluate(image=>image.complete&&image.naturalWidth>0),true);

  const loaded=await page.evaluate(async()=>{
    const assets=[...Object.values(ChamiCharacters.sheets),ChamiCharacters.familyScenes];
    return Promise.all(assets.map(async asset=>({asset,ok:(await fetch(asset)).ok})));
  });
  assert.ok(loaded.every(item=>item.ok),JSON.stringify(loaded));

  const auro=await page.evaluate(()=>({
    child:state.child,
    title:v26ChildWorldTitle.textContent,
    avatar:AuroraAvatar.style.backgroundImage,
    hero:v26ExpressionHero.style.backgroundImage,
    overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
  }));
  assert.equal(auro.child,'Aurora');
  assert.match(auro.title,/Auro's Creative Meadow/);
  assert.match(auro.avatar,/auro-expressions-v26\.png/);
  assert.match(auro.hero,/auro-expressions-v26\.png/);
  assert.ok(auro.overflow<=1,`horizontal overflow: ${auro.overflow}px`);

  await page.locator('#v26ExpressionGrid .v26-expression-choice').nth(6).click();
  assert.equal(await page.locator('#v26ExpressionGrid .v26-expression-choice').nth(6).getAttribute('aria-pressed'),'true');
  assert.match(await page.locator('#v26ExpressionName').textContent(),/Playful/);

  await page.evaluate(()=>setChild('Teia'));
  assert.match(await page.locator('#v26ChildWorldTitle').textContent(),/Teia's Wonder Garden/);
  assert.match(await page.locator('#v26ExpressionHero').evaluate(element=>element.style.backgroundImage),/teia-expressions-v26\.png/);
  await page.locator('#v26ExpressionGrid .v26-expression-choice').nth(5).click();
  assert.match(await page.locator('#v26ExpressionName').textContent(),/Tricky/);

  const separateUi=await page.evaluate(()=>{
    setChild('Aurora');
    const auro=v26SelectedExpression();
    setChild('Teia');
    const teia=v26SelectedExpression();
    return {auro,teia};
  });
  assert.deepEqual(separateUi,{auro:6,teia:5});

  const peachBefore=await page.locator('#heroPeach').getAttribute('data-expression');
  await page.locator('.v26-peach-helper').click();
  const peachAfter=await page.locator('#heroPeach').getAttribute('data-expression');
  assert.notEqual(peachAfter,peachBefore);
  assert.doesNotMatch(await page.locator('#peachTip').textContent(),/Tap Peach/);

  await page.evaluate(()=>openV26Scene('learning'));
  assert.equal(await page.locator('#words').evaluate(element=>element.classList.contains('active')),true);
  await page.evaluate(()=>{go('home');openV26Scene('twilight');});
  assert.equal(await page.locator('#skills').evaluate(element=>element.classList.contains('active')),true);
  await page.evaluate(()=>{go('home');openV26Scene('creation');});
  assert.equal(await page.locator('#progress').evaluate(element=>element.classList.contains('active')),true);
  assert.match(await page.locator('#v26ProgressExpression').evaluate(element=>element.style.backgroundImage),/teia-expressions-v26\.png/);

  await page.evaluate(()=>{go('home');openV26Scene('discovery');});
  assert.equal(await page.locator('#adventure').evaluate(element=>element.classList.contains('active')),true);
  assert.match(await page.locator('#v26AdventureFace').evaluate(element=>element.style.backgroundImage),/teia-expressions-v26\.png/);

  await page.evaluate(()=>go('home'));
  const accessibility=await page.evaluate(()=>({
    unnamed:[...document.querySelectorAll('button')].filter(button=>!(button.innerText||button.getAttribute('aria-label')||'').trim()).length,
    small:[...document.querySelectorAll('.v26-expression-choice,.v26-scene-hotspots button,.v26-peach-helper')].filter(button=>button.getBoundingClientRect().height<48||button.getBoundingClientRect().width<48).length
  }));
  assert.equal(accessibility.unnamed,0);
  assert.equal(accessibility.small,0);

  if(process.env.CHAMI_HOME_SCREENSHOT_PATH){
    await page.evaluate(()=>{setChild('Aurora');go('home');});
    await page.screenshot({path:process.env.CHAMI_HOME_SCREENSHOT_PATH,fullPage:true});
  }
  if(process.env.CHAMI_TEIA_SCREENSHOT_PATH){
    await page.evaluate(()=>{setChild('Teia');go('home');});
    await page.screenshot({path:process.env.CHAMI_TEIA_SCREENSHOT_PATH,fullPage:true});
  }

  await page.evaluate(()=>go('home'));
  await page.waitForFunction(()=>Boolean(navigator.serviceWorker?.controller),null,{timeout:15000});
  await page.context().setOffline(true);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('#v26ExpressionGrid .v26-expression-choice').first().waitFor();
  assert.match(await page.locator('#v26ExpressionHero').evaluate(element=>element.style.backgroundImage),/teia-expressions-v26\.png/);
  assert.equal(await page.locator('.v26-scene-image-wrap>img').evaluate(image=>image.complete&&image.naturalWidth>0),true);
  await page.context().setOffline(false);

  assert.deepEqual(errors,[]);
  console.log('v26 browser validation passed: approved art loads, expressions stay child-specific, scene art navigates, Peach reacts, mobile fits, and offline reload works');
}finally{
  await browser.close();
}
