import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
globalThis.window=globalThis;

function load(relative){
  const filename=path.join(root,relative);
  vm.runInThisContext(fs.readFileSync(filename,'utf8'),{filename});
}

load('config/family.js');
load('js/visual-world.js');

const results=[];
function test(name,fn){ fn(); results.push(name); }

test('family configuration points to four separate v25 character assets',()=>{
  const auro=ChamiVisuals.characterPaths(CHAMI_FAMILY,'Aurora');
  const teia=ChamiVisuals.characterPaths(CHAMI_FAMILY,'Teia');
  assert.match(auro.child,/auro-v25\.jpg$/);
  assert.match(teia.child,/teia-v25\.jpg$/);
  assert.notEqual(auro.child,teia.child);
  assert.match(auro.chami,/chami-v25\.jpg$/);
  assert.match(auro.peach,/peach-v25\.jpg$/);
});

test('fresh learner visuals begin with evidence-free seeds and locked achievements',()=>{
  const profile={learningDays:0,history:{en:{},uk:{}}};
  const literacy={phonics:{attempts:0,successes:0}};
  const summary=ChamiVisuals.summary(profile,literacy);
  const garden=ChamiVisuals.garden(profile,literacy);
  const achievements=ChamiVisuals.achievements(profile,literacy);
  assert.equal(summary.mastered,0);
  assert.ok(garden.every(plot=>plot.level===0));
  assert.ok(achievements.every(item=>item.unlocked===false));
  assert.equal('points' in summary,false);
  assert.equal('streak' in summary,false);
});

test('garden growth is reproducible from real mastery, listening, expression, and phonics evidence',()=>{
  const profile={
    learningDays:6,
    history:{
      en:{
        bright:{seen:5,mastered:true,proof:{meaning:true,context:true,recall:true,expression:true}},
        curious:{seen:4,mastered:true,proof:{meaning:true,context:true,recall:true}},
        gentle:{seen:4,mastered:true,proof:{meaning:true,context:true,recall:true}}
      },
      uk:{
        tak:{seen:3,mastered:true,proof:{meaning:true,listening:true,recall:true}},
        soniachnyk:{seen:2,mastered:false,proof:{listening:true}}
      }
    }
  };
  const literacy={phonics:{attempts:8,successes:6}};
  const plots=Object.fromEntries(ChamiVisuals.garden(profile,literacy).map(plot=>[plot.id,plot]));
  assert.ok(plots.english.level>=2);
  assert.ok(plots.ukrainian.level>=1);
  assert.ok(plots.decoding.level>=2);
  assert.ok(plots.expression.level>=2);
});

test('achievements unlock only from named learning evidence',()=>{
  const profile={
    learningDays:5,
    history:{
      en:{a:{seen:4,mastered:true,proof:{recall:true}},b:{seen:4,mastered:true,proof:{recall:true}},c:{seen:4,mastered:true,proof:{recall:true}}},
      uk:{d:{seen:2,mastered:false,proof:{listening:true}}}
    }
  };
  const badges=Object.fromEntries(ChamiVisuals.achievements(profile,{phonics:{attempts:1,successes:1}}).map(item=>[item.id,item]));
  assert.equal(badges.explorer.unlocked,true);
  assert.equal(badges.listener.unlocked,true);
  assert.equal(badges.builder.unlocked,true);
  assert.equal(badges.rememberer.unlocked,true);
  assert.equal(badges.grower.unlocked,true);
  assert.equal(badges.pathfinder.unlocked,true);
});

test('every reusable interface icon renders as accessible inline SVG',()=>{
  for(const name of ['paw','book','listen','write','puzzle','garden','star','home','chart','grownups','flag','heart','lock']){
    const markup=ChamiVisuals.icon(name,name);
    assert.match(markup,/^<svg/);
    assert.match(markup,/aria-label=/);
    assert.match(markup,/<\/svg>$/);
  }
});

test('release shell loads the visual module and contains functional visual destinations',()=>{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const sw=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
  assert.match(html,/js\/visual-world\.js/);
  assert.match(html,/id="v25Hero"/);
  assert.match(html,/id="v25Garden"/);
  assert.match(html,/id="v25Achievements"/);
  assert.ok((html.match(/onclick="openV25Module\('/g)||[]).length>=6);
  assert.doesNotMatch(html,/class="hero-art"/);
  assert.match(sw,/chami-v(?:25-living-visual-world|26-illustrated-characters)/);
  for(const file of ['auro-v25.jpg','teia-v25.jpg','chami-v25.jpg','peach-v25.jpg']){
    assert.ok(sw.includes(file));
    assert.ok(fs.existsSync(path.join(root,'assets','characters',file)));
  }
});

console.log(`v25 visual-world validation passed: ${results.length} checks`);
