import assert from 'node:assert/strict';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const baseUrl=process.env.CHAMI_BASE_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({
  headless:true,
  ...(process.env.CHAMI_BROWSER_PATH?{executablePath:process.env.CHAMI_BROWSER_PATH}:{})
});
const page=await browser.newPage({viewport:{width:390,height:844}});
const errors=[];
page.on('pageerror',error=>errors.push(`page: ${error.message}`));
page.on('console',message=>{ if(message.type()==='error') errors.push(`console: ${message.text()}`); });

try{
  await page.goto(baseUrl,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>typeof window.startAdventure==='function' && typeof window.ChamiPhonics==='object');

  const teia=await page.evaluate(()=>{
    setChild('Teia');
    const profile=interactionProfile();
    startAdventure();
    const index=adventurePlan.findIndex(step=>['phonicsWordMatch','phonicsPatternMatch','phonicsBuild'].includes(step.kind));
    if(index>=0){ adventureIndex=index; renderAdventureStep(); }
    return {profile,kind:index>=0?adventurePlan[index].kind:null,index};
  });
  assert.equal(teia.profile.scaffoldLevel,'full',`unexpected Teia profile ${JSON.stringify(teia.profile)}; errors: ${errors.join(' | ')}`);
  assert.ok(teia.index>=0,'Teia session did not include a decoding activity');
  await page.locator('.phonics-card').waitFor();
  assert.ok(await page.locator('.phonics-choice,.phonics-tile').count()>=2);

  if(teia.kind==='phonicsBuild'){
    const total=await page.evaluate(()=>adventureCurrent.phonicsParts.length);
    for(let sequence=0;sequence<total;sequence++){
      await page.evaluate(seq=>{
        const index=adventureCurrent.phonicsTiles.findIndex(tile=>tile.sequence===seq);
        document.querySelectorAll('.phonics-tile')[index].click();
      },sequence);
    }
  }else{
    await page.evaluate(()=>{
      const correct=[...document.querySelectorAll('.phonics-choice')].find(button=>button.getAttribute('onclick').includes('true'));
      correct.click();
    });
  }
  assert.equal(await page.locator('#adventureFeedback').isVisible(),true);
  assert.equal(await page.evaluate(()=>ChamiLiteracy.phonicsSummary(p()).attempts),1);

  await page.evaluate(()=>{
    const item=DATA.Teia.en.find(candidate=>ChamiPhonics.eligible(candidate) && ChamiPhonics.focusPattern(candidate.t));
    adventurePlan=[{kind:'phonicsPatternMatch',item,lang:'en',supportLevel:'full',estimatedSeconds:50}];
    adventureIndex=0;
    adventureAnswered=false;
    smartSession={plannedSeconds:50,usedSeconds:0,newLearned:{en:0,uk:0},knownAtPlacement:{en:0,uk:0}};
    renderAdventureStep();
  });
  assert.ok(await page.locator('.phonics-choice.letter-team').count()>=2);

  await page.evaluate(()=>{
    const item=DATA.Teia.en.find(candidate=>ChamiPhonics.eligible(candidate) && ChamiPhonics.parts(candidate.t).length>=2);
    adventurePlan=[{kind:'phonicsBuild',item,lang:'en',supportLevel:'guided',estimatedSeconds:50}];
    adventureIndex=0;
    adventureAnswered=false;
    smartSession={plannedSeconds:50,usedSeconds:0,newLearned:{en:0,uk:0},knownAtPlacement:{en:0,uk:0}};
    renderAdventureStep();
  });
  const buildParts=await page.evaluate(()=>adventureCurrent.phonicsParts.length);
  assert.ok(buildParts>=2);
  if(process.env.CHAMI_SCREENSHOT_PATH){
    await page.screenshot({path:process.env.CHAMI_SCREENSHOT_PATH,fullPage:true});
  }
  for(let sequence=0;sequence<buildParts;sequence++){
    await page.evaluate(seq=>{
      const index=adventureCurrent.phonicsTiles.findIndex(tile=>tile.sequence===seq);
      document.querySelectorAll('.phonics-tile')[index].click();
    },sequence);
  }
  assert.equal(await page.locator('#adventureFeedback').isVisible(),true);

  const auro=await page.evaluate(()=>{
    setChild('Aurora');
    const profile=interactionProfile();
    startAdventure();
    return {
      profile,
      phonicsSteps:adventurePlan.filter(step=>['phonicsWordMatch','phonicsPatternMatch','phonicsBuild','decodeWord'].includes(step.kind)).length
    };
  });
  assert.equal(auro.profile.mode,'fluent_child_reader');
  assert.equal(auro.profile.scaffoldLevel,'independent');
  assert.equal(auro.phonicsSteps,0);
  assert.deepEqual(errors,[]);
  console.log('v24 browser smoke passed: Teia tactile activities render; Auro remains independent; no page errors');
}finally{
  await browser.close();
}
