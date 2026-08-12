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

function pngSize(relative){
  const buffer=fs.readFileSync(path.join(root,relative));
  assert.equal(buffer.toString('ascii',1,4),'PNG',`${relative} is not a PNG`);
  return {width:buffer.readUInt32BE(16),height:buffer.readUInt32BE(20)};
}

function filesUnder(relative){
  const base=path.join(root,relative);
  return fs.readdirSync(base,{recursive:true,withFileTypes:true})
    .filter(entry=>entry.isFile())
    .map(entry=>path.join(entry.parentPath||entry.path,entry.name));
}

load('config/family.js');
load('js/visual-world.js');
load('js/illustrated-characters.js');

const results=[];
function test(name,fn){ fn(); results.push(name); }

test('family configuration points to the approved v26 character bible',()=>{
  assert.equal(CHAMI_FAMILY.visuals.characterBibleVersion,26);
  assert.match(CHAMI_FAMILY.children.Aurora.expressionSheet,/auro-expressions-v26\.png$/);
  assert.match(CHAMI_FAMILY.children.Teia.expressionSheet,/teia-expressions-v26\.png$/);
  assert.match(CHAMI_FAMILY.characters.Peach.expressionSheet,/peach-expressions-v26\.png$/);
  assert.match(CHAMI_FAMILY.visuals.familyScenes,/family-scenes-v26\.png$/);
});

test('Auro, Teia, and Peach each expose nine stable sprite positions',()=>{
  const expected=['0% 0%','50% 0%','100% 0%','0% 50%','50% 50%','100% 50%','0% 100%','50% 100%','100% 100%'];
  for(const character of ['Aurora','Teia','Peach']){
    assert.equal(ChamiCharacters.expressions[character].length,9);
    assert.equal(new Set(ChamiCharacters.expressions[character].map(item=>item.label)).size,9);
    assert.deepEqual(expected.map((_,index)=>ChamiCharacters.backgroundPosition(index)),expected);
    assert.match(ChamiCharacters.spriteStyle(character,8),/background-size|background-position|background-image/);
    assert.match(ChamiCharacters.expression(character,0).sheet,/v26\.png$/);
  }
});

test('all four scene quadrants have a distinct functional destination',()=>{
  assert.deepEqual(ChamiCharacters.scenes.map(scene=>scene.id),['discovery','learning','twilight','creation']);
  assert.deepEqual(ChamiCharacters.scenes.map(scene=>scene.destination),['adventure','words','stories','progress']);
  assert.equal(new Set(ChamiCharacters.scenes.map(scene=>scene.destination)).size,4);
});

test('approved source files are intact, high resolution, and locally packaged',()=>{
  for(const relative of Object.values(ChamiCharacters.sheets)){
    const size=pngSize(relative);
    assert.ok(size.width>=1200&&size.height>=1200,`${relative} is unexpectedly small`);
  }
  const family=pngSize(ChamiCharacters.familyScenes);
  assert.ok(family.width>=1500&&family.height>=1000);
  assert.ok(family.width>family.height);
});

test('the child-facing shell loads the character module and exposes clickable art',()=>{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.ok(html.indexOf('js/illustrated-characters.js')<html.indexOf('js/app.js'));
  assert.match(html,/id="v26ExpressionGrid"/);
  assert.match(html,/id="v26AdventureFace"/);
  assert.equal((html.match(/openV26Scene\('/g)||[]).length,4);
  assert.match(html,/family-scenes-v26\.png/);
});

test('v26 interaction code cannot alter learning evidence or mastery',()=>{
  const app=fs.readFileSync(path.join(root,'js/app.js'),'utf8');
  const section=app.slice(app.indexOf('v26 — Illustrated Characters'));
  assert.doesNotMatch(section,/recordPerformance\(/);
  assert.doesNotMatch(section,/\.mastered\s*=/);
  assert.doesNotMatch(section,/\.history\s*\[/);
  assert.match(section,/state\.ui\.characterExpressions/);
});

test('only approved app assets—not private reference photos—were packaged',()=>{
  const files=filesUnder('assets');
  assert.equal(files.filter(file=>/character-bible/.test(file)).length,4);
  assert.ok(files.every(file=>!/\.(heic|heif)$/i.test(file)));
  assert.ok(files.every(file=>!/(9414|9418|9423|7302|7508|9395|1395|5159|1391|1380)/.test(file)));
});

console.log(`v26 illustrated-character validation passed: ${results.length} checks`);
