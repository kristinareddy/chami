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

load('js/phonics-engine.js');
load('js/literacy-model.js');
load('js/calibration.js');
load('js/curriculum-engine.js');
load('curriculum/data.js');

const results=[];
function test(name,fn){
  fn();
  results.push(name);
}

test('common English letter teams stay intact',()=>{
  assert.deepEqual(ChamiPhonics.tokenize('ship').slice(0,1),['sh']);
  assert.ok(ChamiPhonics.tokenize('bright').includes('igh'));
  assert.ok(ChamiPhonics.tokenize('action').includes('tion'));
});

test('word parts always rebuild the original eligible curriculum word',()=>{
  for(const child of ['Aurora','Teia']){
    for(const item of CHAMI_DATA[child].en.filter(ChamiPhonics.eligible)){
      assert.equal(ChamiPhonics.parts(item.t).join(''),item.t,`${child}: ${item.t}`);
    }
  }
});

test('pattern and word options contain one target without duplicates',()=>{
  const items=CHAMI_DATA.Teia.en.filter(ChamiPhonics.eligible);
  const target=items.find(item=>ChamiPhonics.focusPattern(item.t));
  const patterns=ChamiPhonics.patternOptions(target.t,items.map(x=>x.t),3);
  assert.equal(patterns[0],ChamiPhonics.focusPattern(target.t));
  assert.equal(new Set(patterns).size,patterns.length);
  const words=ChamiPhonics.wordOptions(target,items,3);
  assert.equal(words[0].t,target.t);
  assert.equal(new Set(words.map(x=>x.t)).size,words.length);
});

test('fresh child profiles start with child-appropriate support',()=>{
  assert.equal(ChamiLiteracy.scaffoldLevel({},'early_reader'),'full');
  assert.equal(ChamiLiteracy.scaffoldLevel({},'fluent_child_reader'),'independent');
  assert.equal(ChamiLiteracy.stage({},'fluent_child_reader'),'fluent_child_reader');
});

test('varied successful decoding fades support automatically',()=>{
  const profile={};
  for(let round=0;round<8;round++){
    for(const kind of ChamiLiteracy.PHONICS_KINDS) ChamiLiteracy.observePhonics(profile,kind,true);
  }
  assert.equal(ChamiLiteracy.scaffoldLevel(profile,'early_reader'),'independent');
  assert.equal(ChamiLiteracy.summary(profile,'early_reader').phonics.attempts,24);
});

test('support returns after a short run of struggle',()=>{
  const profile={};
  for(let round=0;round<8;round++){
    for(const kind of ChamiLiteracy.PHONICS_KINDS) ChamiLiteracy.observePhonics(profile,kind,true);
  }
  ChamiLiteracy.observePhonics(profile,'wordBuild',false);
  ChamiLiteracy.observePhonics(profile,'patternMatch',false);
  assert.equal(ChamiLiteracy.scaffoldLevel(profile,'early_reader'),'guided');
  ChamiLiteracy.observePhonics(profile,'printedWordMatch',false);
  assert.equal(ChamiLiteracy.scaffoldLevel(profile,'early_reader'),'full');
});

test('activity selection balances evidence types',()=>{
  const profile={};
  assert.equal(ChamiLiteracy.nextPhonicsKind(profile,'early_reader'),'printedWordMatch');
  ChamiLiteracy.observePhonics(profile,'printedWordMatch',true);
  assert.equal(ChamiLiteracy.nextPhonicsKind(profile,'early_reader'),'patternMatch');
  ChamiLiteracy.observePhonics(profile,'patternMatch',true);
  assert.equal(ChamiLiteracy.nextPhonicsKind(profile,'early_reader'),'wordBuild');
});

test('v23 literacy aggregates migrate without losing evidence',()=>{
  const profile={literacyModel:{english:{printedWordRecognition:4,shortSentenceRead:2,decodingSuccess:3,typingAttempt:2,typingSuccess:1,samples:11}}};
  const model=ChamiLiteracy.ensure(profile).english;
  assert.equal(model.mechanics.printedWordRecognition.successes,4);
  assert.equal(model.mechanics.typing.attempts,2);
  assert.equal(model.mechanics.typing.successes,1);
  assert.ok(model.v24Migrated);
});

test('phonics evidence never mutates vocabulary history',()=>{
  const profile={history:{en:{enormous:{seen:2,success:1}},uk:{}}};
  const before=JSON.stringify(profile.history);
  ChamiLiteracy.observePhonics(profile,'wordBuild',true);
  assert.equal(JSON.stringify(profile.history),before);
});

test('phonics timing uses its own calibration bucket',()=>{
  const profile={};
  assert.equal(ChamiCalibration.bucketKey({kind:'phonicsBuild'}),'phonics');
  assert.ok(ChamiCalibration.observe(profile,{kind:'phonicsBuild'},42));
  assert.equal(ChamiCalibration.summary(profile).rows.phonics.count,1);
});

test('curriculum review debt uses the supplied learning day',()=>{
  const items=Array.from({length:8},(_,index)=>({t:`word${index}`,difficulty:2}));
  const history=Object.fromEntries(items.map(item=>[item.t,{seen:1,mastered:true,due:5,proof:{recall:true}}]));
  const beforeDue=ChamiCurriculum.eligibleMaxDifficulty(history,items,'en',0);
  const whenDue=ChamiCurriculum.eligibleMaxDifficulty(history,items,'en',5);
  assert.ok(whenDue<beforeDue);
});

console.log(`v24 model validation passed: ${results.length} checks`);
