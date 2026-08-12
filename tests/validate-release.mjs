import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const exists=relative=>fs.existsSync(path.join(root,relative));

const index=read('index.html');
const scripts=[...index.matchAll(/<script\s+src="([^"]+)"/g)].map(match=>match[1]);
const styles=[...index.matchAll(/<link\s+rel="stylesheet"\s+href="([^"]+)"/g)].map(match=>match[1]);
for(const asset of [...scripts,...styles]) assert.ok(exists(asset),`index references missing file: ${asset}`);

assert.ok(scripts.indexOf('js/phonics-engine.js')<scripts.indexOf('js/literacy-model.js'),'phonics engine must load before literacy model');
assert.ok(scripts.indexOf('js/literacy-model.js')<scripts.indexOf('js/app.js'),'literacy model must load before app integration');
assert.ok(scripts.indexOf('js/visual-world.js')<scripts.indexOf('js/app.js'),'visual-world module must load before app integration');
assert.ok(scripts.indexOf('js/illustrated-characters.js')<scripts.indexOf('js/app.js'),'illustrated-character module must load before app integration');

const worker=read('service-worker.js');
assert.match(worker,/chami-v26-illustrated-characters/);
const cached=[...worker.matchAll(/'\.\/([^']+)'/g)].map(match=>match[1]);
for(const asset of cached){
  if(asset==='') continue;
  assert.ok(exists(asset),`service worker caches missing file: ${asset}`);
}
assert.ok(cached.includes('js/phonics-engine.js'),'phonics engine is not cached for offline use');
assert.ok(cached.includes('js/visual-world.js'),'visual-world module is not cached for offline use');
assert.ok(cached.includes('js/illustrated-characters.js'),'illustrated-character module is not cached for offline use');
for(const asset of ['auro-v25.jpg','teia-v25.jpg','chami-v25.jpg','peach-v25.jpg']){
  assert.ok(cached.some(item=>item.endsWith(asset)),`${asset} is not cached for offline use`);
}
for(const asset of ['auro-expressions-v26.png','teia-expressions-v26.png','peach-expressions-v26.png','family-scenes-v26.png']){
  assert.ok(cached.some(item=>item.endsWith(asset)),`${asset} is not cached for offline use`);
}

const app=read('js/app.js');
assert.match(app,/const _v23BaseInteractionProfile=interactionProfile/,'v23 recursion regression guard missing');
assert.doesNotMatch(app,/function adaptiveInteractionProfile\(\)\{\s*const base=interactionProfile\(\)/,'recursive interaction profile returned');
assert.doesNotMatch(app,/proof\.printedRecognition\s*=\s*true/,'decoding evidence leaked into vocabulary proof');

const docs=['README.md','PROJECT.md','CURRICULUM.md','ARCHITECTURE.md','CHANGELOG.md','RELEASE.md','TESTING.md','DEPLOY.md','AI_SETUP.md','PRODUCT_PATH.md'];
for(const doc of docs){
  assert.ok(exists(doc),`missing documentation: ${doc}`);
  assert.match(read(doc),/v26/i,`${doc} has not been updated for v26`);
}

console.log(`v26 release validation passed: ${scripts.length} scripts, ${cached.length} cached assets, ${docs.length} docs`);
