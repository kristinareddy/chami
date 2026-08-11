const DATA=window.CHAMI_DATA;
const KEY='chami-v12-state';
const LEGACY_KEYS=['chirle-v8-state','wordgarden-v7-state','wordgarden-v6-state'];
function loadStoredState(){
  let raw=localStorage.getItem(KEY);
  if(raw) return JSON.parse(raw);
  for(const k of LEGACY_KEYS){
    raw=localStorage.getItem(k);
    if(raw){
      try { const migrated=JSON.parse(raw); localStorage.setItem(KEY,JSON.stringify(migrated)); return migrated; } catch(e){}
    }
  }
  return null;
}
let state=loadStoredState()||{child:'Aurora',custody:'mom',dayIndex:0,profiles:{
Aurora:{learningDays:0,todayDone:0,history:{en:{},uk:{}},skills:{en:{level:2,correct:0,attempts:0,recent:[]},uk:{level:1,correct:0,attempts:0,recent:[]}}},
Teia:{learningDays:0,todayDone:0,history:{en:{},uk:{}},skills:{en:{level:1,correct:0,attempts:0,recent:[]},uk:{level:1,correct:0,attempts:0,recent:[]}}}
}};
let lang='en',queue=[],qi=0,current=null,typedWord=null,listeningWord=null;

function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function p(){return state.profiles[state.child]}
function skill(l){return p().skills[l]}
function rec(l,t){return p().history[l][t]||{seen:0,success:0,interval:0,due:state.dayIndex,mastered:false,last:-1,difficulty:1}}
function dueWords(l){return DATA[state.child][l].filter(w=>{let r=rec(l,w.t);return r.seen>0&&r.due<=state.dayIndex})}
function unseenNearLevel(l){let level=skill(l).level;return DATA[state.child][l].filter(w=>rec(l,w.t).seen===0 && w.difficulty<=level+1).sort((a,b)=>Math.abs(a.difficulty-level)-Math.abs(b.difficulty-level))}
function masteryAtLevel(l){let level=skill(l).level,arr=DATA[state.child][l].filter(w=>w.difficulty===level);if(!arr.length)return 0;let mastered=arr.filter(w=>rec(l,w.t).mastered).length;return mastered/arr.length}
function accuracy(l){let s=skill(l);return s.attempts?s.correct/s.attempts:0}
function recentAccuracy(l){let r=skill(l).recent;if(!r.length)return null;return r.reduce((a,b)=>a+b,0)/r.length}
function updateAdaptiveLevel(l){
 let s=skill(l),ra=recentAccuracy(l),backlog=dueWords(l).length,mastery=masteryAtLevel(l);
 if(ra!==null && rlen(s.recent)>=8){
   if(ra>=0.85 && backlog<=4 && mastery>=0.35) s.level=Math.min(5,s.level+1);
   else if((ra<0.70 && s.level>1) || backlog>=10) s.level=Math.max(1,s.level-1);
 }
}
function rlen(a){return a.length}
function recordPerformance(l,ok){
 let s=skill(l);s.attempts++;if(ok)s.correct++;s.recent.push(ok?1:0);if(s.recent.length>12)s.recent.shift();updateAdaptiveLevel(l);save()
}
function go(id,el){document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));document.getElementById(id).classList.add('active');document.querySelectorAll('.navbtn').forEach(x=>x.classList.remove('active'));if(el)el.classList.add('active');document.body.classList.toggle('adventure-open',id==='adventure')}
function setChild(c){state.child=c;save();buildQueue();renderAll();newTyped();newListening();newComp();newFamily();newRead()}
function setCustody(c){state.custody=c;save();renderAll()}
function setLang(l){lang=l;enTab.classList.toggle('active',l==='en');ukTab.classList.toggle('active',l==='uk');buildQueue();renderCurrent()}

function buildQueue(){
 let d=dueWords(lang),u=unseenNearLevel(lang),maxNew=state.custody==='mom'?5:0;
 let ra=recentAccuracy(lang);let newSlots=maxNew;
 if(d.length>=5)newSlots=Math.max(1,maxNew-2);
 if(d.length>=8)newSlots=0;
 if(ra!==null && ra<0.75)newSlots=Math.max(0,newSlots-2);
 if(ra!==null && ra>=0.9 && d.length<=2)newSlots=Math.min(5,newSlots+1);
 let dueSorted=[...d].sort((a,b)=>rec(lang,a.t).due-rec(lang,b.t).due);
 queue=[...dueSorted.slice(0,5).map(w=>({...w,mode:'review'})),...u.slice(0,newSlots).map(w=>({...w,mode:'new'}))];
 if(!queue.length&&state.custody==='mom')queue=u.slice(0,Math.min(5,maxNew)).map(w=>({...w,mode:'new'}));
 qi=0;current=queue[0]||null;
}
function startDaily(){if(state.custody==='dad'){go('progress');return}if(p().todayDone===0){p().learningDays++;state.dayIndex++;save()}go('words');buildQueue();renderCurrent();renderAll()}
function renderCurrent(){
 current=queue[qi]||null;
 if(!current){term.textContent='Done';phon.textContent='';meaning.textContent='The adaptive queue is clear for now.';queueText.textContent='';return}
 term.textContent=current.t;phon.textContent=current.ph||'';meaning.textContent=current.m;modeBadge.textContent=`${current.mode==='review'?'REVIEW':'NEW'} · L${current.difficulty}`;queueText.textContent=`${qi+1} / ${queue.length}`;example.textContent=current.e;extra.textContent=lang==='uk'?`${current.eph} — ${current.eng}`:(current.family?`Word family: ${current.family}`:'');example.style.display='none';extra.style.display='none';
}
function showContext(){example.style.display='block';extra.style.display='block'}
function speakText(text,locale){let u=new SpeechSynthesisUtterance(text);u.lang=locale;speechSynthesis.speak(u)}
function speakCurrent(){if(current)speakText(current.t,lang==='uk'?'uk-UA':'en-US')}
function rate(score){
 if(!current)return;let r=rec(lang,current.t);r.seen++;r.last=state.dayIndex;r.difficulty=current.difficulty;
 if(score===1){r.interval=0;r.due=state.dayIndex;recordPerformance(lang,false)}
 if(score===2){r.success++;r.interval=Math.max(1,Math.min(3,(r.interval||1)+1));r.due=state.dayIndex+r.interval;recordPerformance(lang,true)}
 if(score===3){r.success++;r.interval=Math.max(3,Math.min(21,(r.interval||2)*2));r.due=state.dayIndex+r.interval;recordPerformance(lang,true)}
 r.mastered=r.success>=4&&r.interval>=7;p().history[lang][current.t]=r;p().todayDone=Math.min(10,p().todayDone+1);save();qi++;if(qi>=queue.length)buildQueue();else current=queue[qi];renderCurrent();renderAll()
}

function poolNearLevel(l){let level=skill(l).level;let a=DATA[state.child][l].filter(w=>Math.abs(w.difficulty-level)<=1);return a.length?a:DATA[state.child][l]}
function newTyped(){
 let l=Math.random()<.5?'en':'uk',pool=poolNearLevel(l);typedWord=pool[Math.floor(Math.random()*pool.length)];
 typeFeedback.dataset.lang=l;typePrompt.innerHTML=l==='uk'?`Type the English meaning of <b>${typedWord.t}</b>.`:`Type the word that means: <b>${typedWord.m}</b>.`;typeInput.value='';typeFeedback.style.display='none'
}
function norm(s){return s.trim().toLowerCase().replace(/[.,!?]/g,'')}
function checkTyped(){
 if(!typedWord)return;let l=typeFeedback.dataset.lang,ans=norm(typeInput.value),correct=l==='uk'?norm(typedWord.m).split(' / ')[0]:norm(typedWord.t),ok=ans===correct||(l==='uk'&&norm(typedWord.m).includes(ans)&&ans.length>1);recordPerformance(l,ok);typeFeedback.textContent=ok?'Correct.':`Answer: ${l==='uk'?typedWord.m:typedWord.t}`;typeFeedback.style.display='block';renderAll()
}
function newListening(){
 let pool=poolNearLevel('uk');listeningWord=pool[Math.floor(Math.random()*pool.length)];let opts=[listeningWord.m];while(opts.length<4){let x=pool[Math.floor(Math.random()*pool.length)].m;if(!opts.includes(x))opts.push(x)}opts.sort(()=>Math.random()-.5);listenOptions.innerHTML=opts.map(o=>`<button class="quizopt" onclick="answerListening(this,'${o.replaceAll("'","&#39;")}')">${o}</button>`).join('');listenFeedback.style.display='none'
}
function playListening(){if(listeningWord)speakText(listeningWord.t,'uk-UA')}
function answerListening(btn,a){let ok=a===listeningWord.m;document.querySelectorAll('#listenOptions .quizopt').forEach(b=>b.disabled=true);btn.classList.add(ok?'correct':'wrong');recordPerformance('uk',ok);listenFeedback.textContent=ok?'Correct.':`It means: ${listeningWord.m}`;listenFeedback.style.display='block';renderAll()}

function newComp(){
 let level=skill('en').level;
 let sets=[
 [1,'Mina put on boots and carried an umbrella. Dark clouds filled the sky.','What will likely happen?',['It may rain.','It will snow indoors.','The sun will disappear forever.'],'It may rain.'],
 [2,'Leo saw crumbs beside an open cookie jar and chocolate on his brother’s face.','What can Leo infer?',['His brother ate a cookie.','The jar is a hat.','The cookies flew away.'],'His brother ate a cookie.'],
 [3,'A sign said the bridge was temporarily closed while workers repaired loose boards. By Friday, the sign had been removed.','What does temporarily mean here?',['For a limited time.','Forever.','Without warning.'],'For a limited time.'],
 [4,'Mateo gave two explanations for the broken lamp, but they contradicted each other. His sister pointed out the difference.','What can you infer?',['At least one explanation may be inaccurate.','Both explanations must be true.','The lamp was never broken.'],'At least one explanation may be inaccurate.'],
 [5,'The article presented two theories about why the population declined, but only one was supported by multiple independent sources.','Which theory is stronger?',['The one supported by several independent sources.','The one stated first.','The one with the longest title.'],'The one supported by several independent sources.']
 ];
 let candidates=sets.filter(s=>Math.abs(s[0]-level)<=1),s=candidates[Math.floor(Math.random()*candidates.length)];passage.textContent=s[1];question.textContent=s[2];compOptions.innerHTML=s[3].map(o=>`<button class="quizopt" onclick="answerComp(this,'${o.replaceAll("'","&#39;")}','${s[4].replaceAll("'","&#39;")}')">${o}</button>`).join('');compFeedback.style.display='none'
}
function answerComp(btn,a,c){let ok=a===c;document.querySelectorAll('#compOptions .quizopt').forEach(b=>b.disabled=true);btn.classList.add(ok?'correct':'wrong');recordPerformance('en',ok);compFeedback.textContent=ok?'Correct.':`Answer: ${c}`;compFeedback.style.display='block';renderAll()}

function newFamily(){
 let pool=poolNearLevel('en').filter(w=>w.family);if(!pool.length)pool=DATA[state.child].en.filter(w=>w.family);let w=pool[Math.floor(Math.random()*pool.length)];let others=DATA[state.child].en.filter(x=>x.family&&x.family!==w.family).sort(()=>Math.random()-.5).slice(0,3).map(x=>x.family);let opts=[w.family,...others].sort(()=>Math.random()-.5);familyPrompt.innerHTML=`Which word belongs to the same family as <b>${w.t}</b>?`;familyOptions.innerHTML=opts.map(o=>`<button class="quizopt" onclick="answerFamily(this,'${o}','${w.family}')">${o}</button>`).join('');familyFeedback.style.display='none'
}
function answerFamily(btn,a,c){let ok=a===c;document.querySelectorAll('#familyOptions .quizopt').forEach(b=>b.disabled=true);btn.classList.add(ok?'correct':'wrong');recordPerformance('en',ok);familyFeedback.textContent=ok?'Correct.':`Answer: ${c}`;familyFeedback.style.display='block';renderAll()}

function renderAlphabet(){alphaGrid.innerHTML=DATA.alphabet.map((x,i)=>`<div class="letter" onclick="showLetter(${i})">${x.l}<small>${x.sound}</small></div>`).join('')}
function showLetter(i){let x=DATA.alphabet[i];alphaInfo.textContent=`${x.l} = ${x.sound} · like ${x.hint}`;alphaInfo.style.display='block';speakText(x.l,'uk-UA')}
function newRead(){
 let pool=poolNearLevel('uk'),w=pool[Math.floor(Math.random()*pool.length)];readTerm.textContent=w.t;let opts=[w.m];while(opts.length<4){let x=pool[Math.floor(Math.random()*pool.length)].m;if(!opts.includes(x))opts.push(x)}opts.sort(()=>Math.random()-.5);readOptions.innerHTML=opts.map(o=>`<button class="quizopt" onclick="answerRead(this,'${o.replaceAll("'","&#39;")}','${w.m.replaceAll("'","&#39;")}')">${o}</button>`).join('');readFeedback.style.display='none'
}
function answerRead(btn,a,c){let ok=a===c;document.querySelectorAll('#readOptions .quizopt').forEach(b=>b.disabled=true);btn.classList.add(ok?'correct':'wrong');recordPerformance('uk',ok);readFeedback.textContent=ok?'Correct.':`Answer: ${c}`;readFeedback.style.display='block';renderAll()}

function renderReport(){
 let enAcc=Math.round(accuracy('en')*100)||0,ukAcc=Math.round(accuracy('uk')*100)||0;
 report.innerHTML=`<div class="report"><b>English accuracy</b><div class="tiny">${enAcc}% · level ${skill('en').level}</div></div><div class="report"><b>Ukrainian accuracy</b><div class="tiny">${ukAcc}% · level ${skill('uk').level}</div></div><div class="report"><b>Review backlog</b><div class="tiny">${dueWords('en').length} English · ${dueWords('uk').length} Ukrainian</div></div><div class="report"><b>Learning days</b><div class="tiny">${p().learningDays}</div></div>`;
}
function renderAll(){
 AuroraBtn.classList.toggle('active',state.child==='Aurora');TeiaBtn.classList.toggle('active',state.child==='Teia');document.getElementById('kidFace')?.replaceChildren();kidHello.textContent='Hi, '+childDisplayName()+'!';kidMessage.textContent=state.custody==='mom'?'Your next little adventure is ready.':'Your learning garden is resting today.';custodyPill.textContent=state.custody==='mom'?'With Mom today':'With Dad today';custodyText.textContent=state.custody==='mom'?'Mom':'Dad';custodySelect.value=state.custody;
 engLevel.textContent='L'+skill('en').level;ukLevel.textContent='L'+skill('uk').level;dueCount.textContent=dueWords('en').length+dueWords('uk').length;
 let estNew=(state.custody==='mom'?5:0)+(state.custody==='mom'?5:0);if(dueWords('en').length+dueWords('uk').length>=8)estNew=Math.max(2,estNew-4);newSlots.textContent=estNew;
 dayBar.style.width=Math.min(100,p().todayDone*10)+'%';dayText.textContent=`${p().todayDone} of 10 word slots completed`;dayBadge.textContent=state.custody==='mom'?'LEARNING DAY':'OPTIONAL REVIEW';heroTitle.textContent=state.custody==='mom'?('Ready, '+(state.child==='Aurora'?'Auro':'Teia')+'?'):'Rest day 🌙';heroSub.textContent=state.custody==='mom'?'A few words, a little play, and you are done.':'Nothing required today. Your progress is safe.';
 engProfile.textContent=`English Level ${skill('en').level}`;ukProfile.textContent=`Ukrainian Level ${skill('uk').level}`;engMeter.style.width=(skill('en').level/5*100)+'%';ukMeter.style.width=(skill('uk').level/5*100)+'%';renderReport()
}
buildQueue();renderCurrent();renderAlphabet();renderAll();newTyped();newListening();newComp();newFamily();newRead();


/* =========================================================
   v12 — Today's Adventure generator
   ========================================================= */
let adventurePlan = [];
let adventureIndex = 0;
let adventureCurrent = null;
let adventureAnswered = false;

function childDisplayName(){
  const cfg=window.CHAMI_FAMILY?.children?.[state.child];
  return cfg?.displayName || state.child;
}

function adaptiveNewSlots(l){
  if(state.custody!=='mom') return 0;
  const d=dueWords(l).length;
  const ra=recentAccuracy(l);
  let slots=5;
  if(d>=5) slots=3;
  if(d>=8) slots=1;
  if(d>=10) slots=0;
  if(ra!==null && ra<0.75) slots=Math.max(0,slots-2);
  if(ra!==null && ra>=0.9 && d<=2) slots=Math.min(5,slots+1);
  return slots;
}

function chooseAdventureItems(l){
  const due=[...dueWords(l)].sort((a,b)=>rec(l,a.t).due-rec(l,b.t).due);
  const fresh=unseenNearLevel(l);
  const newSlots=adaptiveNewSlots(l);
  const reviewCap=Math.min(3,due.length);
  return [
    ...due.slice(0,reviewCap).map(w=>({...w,mode:'review',lang:l})),
    ...fresh.slice(0,newSlots).map(w=>({...w,mode:'new',lang:l}))
  ];
}

function generateAdventurePlan(){
  if(state.custody!=='mom'){
    return [{kind:'rest'}];
  }

  const enItems=chooseAdventureItems('en');
  const ukItems=chooseAdventureItems('uk');
  const plan=[];

  plan.push({kind:'welcome'});

  // Due recall always gets priority because chooseAdventureItems is due-first.
  enItems.forEach(item=>plan.push({kind:'word',...item}));
  ukItems.forEach(item=>plan.push({kind:'word',...item}));

  // One active challenge, chosen from the skill that most needs evidence.
  const enRecent=recentAccuracy('en');
  const ukRecent=recentAccuracy('uk');
  if(ukRecent===null || (enRecent!==null && ukRecent<enRecent)){
    plan.push({kind:'listen'});
  } else {
    plan.push({kind:'comprehension'});
  }

  plan.push({kind:'story'});
  plan.push({kind:'reward'});
  return plan;
}

function startAdventure(){
  if(state.custody==='mom' && p().todayDone===0){
    p().learningDays++;
    state.dayIndex++;
    save();
  }
  adventurePlan=generateAdventurePlan();
  adventureIndex=0;
  go('adventure');
  renderAdventureStep();
}

function finishAdventureEarly(){
  save();
  go('home');
  renderAll();
}

function adventureSetMap(stage){
  const ids=['mapReview','mapEnglish','mapUkrainian','mapChallenge','mapReward'];
  ids.forEach(id=>document.getElementById(id)?.classList.remove('done'));
  if(['welcome','word','listen','comprehension','story','reward'].includes(stage)) mapReview?.classList.add('done');
  if(['word','listen','comprehension','story','reward'].includes(stage)) mapEnglish?.classList.add('done');
  if(['listen','comprehension','story','reward'].includes(stage)) mapUkrainian?.classList.add('done');
  if(['story','reward'].includes(stage)) mapChallenge?.classList.add('done');
  if(stage==='reward') mapReward?.classList.add('done');
}

function adventureNext(){
  adventureIndex++;
  adventureAnswered=false;
  adventureFeedback.style.display='none';
  if(adventureIndex>=adventurePlan.length){
    go('home');
    renderAll();
    return;
  }
  renderAdventureStep();
}

function renderAdventureStep(){
  adventureCurrent=adventurePlan[adventureIndex];
  const total=adventurePlan.length;
  adventureStepCount.textContent=`${Math.min(adventureIndex+1,total)} / ${total}`;
  adventureProgressBar.style.width=`${((adventureIndex)/Math.max(1,total-1))*100}%`;
  adventureCharacter.src='assets/chami.png';
  adventureFeedback.style.display='none';
  adventureActions.className='adventure-actions';
  adventureActions.innerHTML='';
  adventureBody.innerHTML='';
  adventureSetMap(adventureCurrent.kind);

  const step=adventureCurrent;
  if(step.kind==='rest'){
    adventureStageBadge.textContent='REST DAY';
    adventureTitle.textContent='Your garden can rest today';
    adventureSpeech.textContent='Nothing is required. I’ll keep your progress safe until next time.';
    adventureBody.innerHTML='<div class="reward-burst">🌙🐾</div><p class="reward-copy">Optional practice is still available from Home.</p>';
    adventureActions.innerHTML='<button onclick="finishAdventureEarly()">Back home</button>';
    return;
  }

  if(step.kind==='welcome'){
    adventureStageBadge.textContent="TODAY'S ADVENTURE";
    adventureTitle.textContent=`Hi, ${childDisplayName()}!`;
    const due=dueWords('en').length+dueWords('uk').length;
    const newTotal=adaptiveNewSlots('en')+adaptiveNewSlots('uk');
    adventureSpeech.textContent=due
      ? `I found ${due} thing${due===1?'':'s'} your brain is ready to remember.`
      : `Your memory is clear, so we can discover something new.`;
    adventureBody.innerHTML=`
      <div class="reward-burst">🐾✨</div>
      <p class="reward-copy">Today I picked about <b>${newTotal}</b> new-word slots plus whatever review you need. You don't have to choose anything.</p>`;
    adventureActions.innerHTML='<button onclick="adventureNext()">Follow Chami →</button>';
    return;
  }

  if(step.kind==='word'){
    return renderActiveWord(step);
  }

  if(false && step.kind==='word'){
    const isUk=step.lang==='uk';
    adventureStageBadge.textContent=step.mode==='review'?'MEMORY TRAIL':(isUk?'UKRAINIAN DISCOVERY':'ENGLISH DISCOVERY');
    adventureTitle.textContent=step.mode==='review'?'Do you remember this?':'Meet a new word';
    adventureSpeech.textContent=step.mode==='review'
      ? 'Try to remember it before you look at the clue.'
      : (isUk?'Listen first. Then notice how the Cyrillic looks.':'Say it aloud once. Then make a picture of it in your mind.');
    adventureBody.innerHTML=`
      <div class="adventure-word">${step.t}</div>
      ${step.ph?`<div class="adventure-pronunciation">${step.ph}</div>`:''}
      <div class="adventure-meaning">${step.m}</div>
      <div id="adventureClue" class="adventure-clue" style="display:none">
        ${step.e||''}
        ${isUk && step.eph?`<br><span class="tiny">${step.eph} — ${step.eng}</span>`:''}
      </div>`;
    adventureActions.classList.add('three');
    adventureActions.innerHTML=`
      <button class="warn" onclick="adventureRateWord(1)">😅 Tricky</button>
      <button class="secondary" onclick="adventureRateWord(2)">🙂 Got it</button>
      <button class="good" onclick="adventureRateWord(3)">😎 Easy!</button>
      <button class="ghost" onclick="adventureHearWord()" style="grid-column:1/-1">🔊 Hear it</button>
      <button class="ghost" onclick="document.getElementById('adventureClue').style.display='block'" style="grid-column:1/-1">💡 Show me in a sentence</button>`;
    return;
  }

  if(step.kind==='listen'){
    const pool=poolNearLevel('uk');
    listeningWord=pool[Math.floor(Math.random()*pool.length)];
    let opts=[listeningWord.m];
    while(opts.length<3){
      const x=pool[Math.floor(Math.random()*pool.length)].m;
      if(!opts.includes(x)) opts.push(x);
    }
    opts.sort(()=>Math.random()-.5);
    adventureStageBadge.textContent='LISTENING CHALLENGE';
    adventureTitle.textContent='What did Chami say?';
    adventureSpeech.textContent='No reading first. Use your ears.';
    adventureBody.innerHTML='<div class="reward-burst">🎧🇺🇦</div><p class="reward-copy">Tap play, then choose the meaning.</p>';
    adventureActions.innerHTML=`<button onclick="speakText(listeningWord.t,'uk-UA')">▶ Hear the Ukrainian</button>`+
      opts.map(o=>`<button class="adventure-choice" onclick="adventureListeningAnswer(this,${JSON.stringify(o).replace(/"/g,'&quot;')})">${o}</button>`).join('');
    return;
  }

  if(step.kind==='comprehension'){
    adventureStageBadge.textContent='STORY CLUE';
    adventureTitle.textContent='Use the clue';
    adventureSpeech.textContent='You don’t need to know everything. Look for evidence.';
    const level=skill('en').level;
    const sets=[
      [1,'Mina carried an umbrella. Dark clouds filled the sky.','What will probably happen?',['It may rain.','Her umbrella will vanish.','The sky will fall.'],'It may rain.'],
      [2,'Leo saw crumbs beside an open cookie jar and chocolate on his brother’s face.','What can Leo infer?',['His brother ate a cookie.','The jar is a hat.','The cookies flew away.'],'His brother ate a cookie.'],
      [3,'The bridge was temporarily closed for repairs. On Friday it reopened.','What does temporarily mean?',['For a limited time.','Forever.','Without a reason.'],'For a limited time.'],
      [4,'Two explanations contradicted each other.','What is most reasonable?',['At least one may be inaccurate.','Both must be true.','Neither was spoken.'],'At least one may be inaccurate.'],
      [5,'One theory was supported by several independent sources; another had no evidence.','Which is stronger?',['The supported theory.','The theory stated first.','The shorter theory.'],'The supported theory.']
    ];
    const candidates=sets.filter(s=>Math.abs(s[0]-level)<=1);
    const s=candidates[Math.floor(Math.random()*candidates.length)];
    adventureCurrent.challenge={answer:s[4]};
    adventureBody.innerHTML=`<div class="story-box">${s[1]}</div><p><b>${s[2]}</b></p>`;
    adventureActions.innerHTML=s[3].map(o=>`<button class="adventure-choice" onclick="adventureCompAnswer(this,${JSON.stringify(o).replace(/"/g,'&quot;')})">${o}</button>`).join('');
    return;
  }

  if(step.kind==='story'){
    const learnedEn=DATA[state.child].en.filter(w=>rec('en',w.t).seen>0);
    const learnedUk=DATA[state.child].uk.filter(w=>rec('uk',w.t).seen>0);
    const a=learnedEn[0]||DATA[state.child].en[0];
    const b=learnedEn[1]||DATA[state.child].en[1];
    const u=learnedUk[0]||DATA[state.child].uk[0];
    adventureStageBadge.textContent='TINY STORY';
    adventureTitle.textContent='Chami & Peach found a clue';
    adventureSpeech.textContent='Listen for words your brain already knows.';
    adventureCharacter.src='assets/peach.png';
    adventureBody.innerHTML=`
      <div class="story-box">
        Peach was <b>${a.t}</b> about a tiny door under a sunflower.
        Chami stopped to <b>${b.t}</b> the pawprints nearby.
        Then Peach whispered, “<b>${u.t}</b>!” and the door opened.
      </div>`;
    adventureActions.innerHTML='<button onclick="adventureNext()">See my reward →</button>';
    return;
  }

  if(step.kind==='reward'){
    adventureStageBadge.textContent='ADVENTURE COMPLETE';
    adventureTitle.textContent='You grew your garden!';
    adventureSpeech.textContent='Brains grow when they remember, struggle, try again, and discover.';
    adventureCharacter.src='assets/chami.png';
    const learned=p().todayDone;
    adventureBody.innerHTML=`
      <div class="reward-burst">🌻⭐🐾</div>
      <div class="reward-title">Adventure complete!</div>
      <p class="reward-copy">You worked through ${learned} word moments today. Your next adventure will change based on what your brain remembers.</p>`;
    adventureActions.innerHTML='<button class="good" onclick="completeAdventure()">Finish 🌱</button>';
  }
}

function adventureHearWord(){
  if(!adventureCurrent || adventureCurrent.kind!=='word') return;
  speakText(adventureCurrent.t,adventureCurrent.lang==='uk'?'uk-UA':'en-US');
}

function adventureRateWord(score){
  const item=adventureCurrent;
  if(!item || item.kind!=='word' || adventureAnswered) return;
  adventureAnswered=true;
  const l=item.lang;
  const r=rec(l,item.t);
  r.seen++;
  r.last=state.dayIndex;
  r.difficulty=item.difficulty;
  if(score===1){
    r.interval=0;
    r.due=state.dayIndex;
    recordPerformance(l,false);
    adventureFeedback.textContent='Good try. Chami will bring this one back sooner.';
  } else if(score===2){
    r.success++;
    r.interval=Math.max(1,Math.min(3,(r.interval||1)+1));
    r.due=state.dayIndex+r.interval;
    recordPerformance(l,true);
    adventureFeedback.textContent='Got it. We’ll check it again later.';
  } else {
    r.success++;
    r.interval=Math.max(3,Math.min(21,(r.interval||2)*2));
    r.due=state.dayIndex+r.interval;
    recordPerformance(l,true);
    adventureFeedback.textContent='Easy! Chami can wait longer before asking again.';
  }
  r.mastered=r.success>=4&&r.interval>=7;
  p().history[l][item.t]=r;
  p().todayDone=Math.min(20,p().todayDone+1);
  save();
  adventureFeedback.style.display='block';
  adventureActions.innerHTML='<button onclick="adventureNext()">Next pawprint →</button>';
  renderAll();
}

function adventureListeningAnswer(btn,answer){
  if(adventureAnswered) return;
  adventureAnswered=true;
  const ok=answer===listeningWord.m;
  btn.classList.add(ok?'correct':'wrong');
  recordPerformance('uk',ok);
  adventureFeedback.textContent=ok?'Yes! Your ears caught it.':`Almost. It means “${listeningWord.m}.”`;
  adventureFeedback.style.display='block';
  adventureActions.querySelectorAll('button').forEach(b=>b.disabled=true);
  adventureActions.insertAdjacentHTML('beforeend','<button onclick="adventureNext()">Continue →</button>');
}

function adventureCompAnswer(btn,answer){
  if(adventureAnswered) return;
  adventureAnswered=true;
  const ok=answer===adventureCurrent.challenge.answer;
  btn.classList.add(ok?'correct':'wrong');
  recordPerformance('en',ok);
  adventureFeedback.textContent=ok?'Exactly. You used the clue.':`Look at the evidence again. Best answer: ${adventureCurrent.challenge.answer}`;
  adventureFeedback.style.display='block';
  adventureActions.querySelectorAll('button').forEach(b=>b.disabled=true);
  adventureActions.insertAdjacentHTML('beforeend','<button onclick="adventureNext()">Continue →</button>');
}

function completeAdventure(){
  p().lastAdventureDay=state.dayIndex;
  p().adventuresCompleted=(p().adventuresCompleted||0)+1;
  p().todayDone=0; // reset session completion counter for next active learning day
  save();
  go('home');
  renderAll();
}


/* =========================================================
   v13 — Objective Active Learning
   ========================================================= */

function shuffled(arr){
  return [...arr].sort(()=>Math.random()-.5);
}

function wordPool(lang){
  return DATA[state.child][lang] || [];
}

function distractorMeanings(item,lang,count=2){
  const pool=shuffled(wordPool(lang).filter(x=>x.t!==item.t && x.m!==item.m));
  return pool.slice(0,count).map(x=>x.m);
}

function distractorWords(item,lang,count=2){
  const pool=shuffled(wordPool(lang).filter(x=>x.t!==item.t));
  return pool.slice(0,count).map(x=>x.t);
}

function proofCount(r){
  return Object.values(r.proof||{}).filter(Boolean).length;
}

function updateMastery(r){
  // Mastery requires successful evidence from at least 3 formats,
  // at least 4 successes, and a spaced interval of >= 7 learning days.
  r.mastered = r.success>=4 && r.interval>=7 && proofCount(r)>=3;
}

function recordObjectiveResult(lang,item,format,ok){
  const r=rec(lang,item.t);
  r.seen++;
  r.last=state.dayIndex;
  r.difficulty=item.difficulty || r.difficulty || 1;
  r.proof=r.proof||{};

  if(ok){
    r.success++;
    r.proof[format]=true;
    const base=r.interval||1;
    r.interval=Math.min(21, Math.max(1, base*2));
    r.due=state.dayIndex+r.interval;
  }else{
    r.interval=0;
    r.due=state.dayIndex; // return soon
  }
  updateMastery(r);
  p().history[lang][item.t]=r;
  recordPerformance(lang,ok);
  p().todayDone=Math.min(20,(p().todayDone||0)+1);
  save();
  return r;
}

function chooseActiveFormat(step){
  const r=rec(step.lang,step.t);
  const proof=r.proof||{};

  // New words get meaning recognition first; reviews seek missing evidence.
  if(step.mode==='new' && !proof.meaning) return 'meaning';
  if(!proof.context && step.lang==='en') return 'context';
  if(!proof.listening && step.lang==='uk') return 'listening';
  if(!proof.recall) return 'recall';

  // Rotate mastered formats rather than repeating the same card.
  const options=step.lang==='uk'
    ? ['meaning','listening','recall']
    : ['meaning','context','recall'];
  return options[(r.seen||0)%options.length];
}

function renderProofBadges(r,lang){
  const defs=lang==='uk'
    ? [['meaning','Meaning'],['listening','Listening'],['recall','Recall']]
    : [['meaning','Meaning'],['context','Context'],['recall','Recall']];
  return `<div class="memory-proof">${defs.map(([k,label])=>`<span class="${r.proof?.[k]?'earned':''}">${r.proof?.[k]?'✓ ':''}${label}</span>`).join('')}</div>`;
}

function renderActiveWord(step){
  adventureCurrent=step;
  adventureAnswered=false;
  const format=chooseActiveFormat(step);
  step.activeFormat=format;
  const r=rec(step.lang,step.t);
  const isUk=step.lang==='uk';

  adventureStageBadge.textContent=step.mode==='review'?'MEMORY CHALLENGE':(isUk?'UKRAINIAN DISCOVERY':'ENGLISH DISCOVERY');
  adventureTitle.textContent=step.mode==='review'?'Show Chami what you remember':'Learn it, then prove it';
  adventureSpeech.textContent=step.mode==='new'
    ? 'First understand it. Then I’ll ask your brain to do something with it.'
    : 'No self-rating this time. Your answer tells me what to bring back later.';

  if(format==='meaning'){
    const options=shuffled([step.m,...distractorMeanings(step,step.lang,2)]);
    adventureBody.innerHTML=`
      <div class="adventure-word">${step.t}</div>
      ${step.ph?`<div class="adventure-pronunciation">${step.ph}</div>`:''}
      <div class="retrieval-prompt">Which meaning fits best?</div>
      ${renderProofBadges(r,step.lang)}
      <div class="choice-grid">${options.map(o=>`<button onclick="activeChoice(this,'meaning',${JSON.stringify(o===step.m)})">${o}</button>`).join('')}</div>`;
    adventureActions.innerHTML=isUk?'<button class="ghost" onclick="adventureHearWord()">🔊 Hear it</button>':'';
    return;
  }

  if(format==='context'){
    const correct=step.e || `The word ${step.t} belongs here.`;
    const wrong1=`I put ${step.t} in my shoe because it was raining.`;
    const wrong2=`The ${step.t} barked loudly at the mail carrier.`;
    const options=shuffled([[correct,true],[wrong1,false],[wrong2,false]]);
    adventureBody.innerHTML=`
      <div class="adventure-word">${step.t}</div>
      <div class="retrieval-prompt">Which sentence uses the word most sensibly?</div>
      ${renderProofBadges(r,step.lang)}
      <div class="choice-grid">${options.map(([o,ok])=>`<button onclick="activeChoice(this,'context',${ok})">${o}</button>`).join('')}</div>`;
    adventureActions.innerHTML='';
    return;
  }

  if(format==='listening'){
    const options=shuffled([step.m,...distractorMeanings(step,'uk',2)]);
    adventureBody.innerHTML=`
      <div class="reward-burst">🎧</div>
      <div class="retrieval-prompt">Listen without looking at the Ukrainian word. What does it mean?</div>
      ${renderProofBadges(r,'uk')}
      <div class="choice-grid">${options.map(o=>`<button onclick="activeChoice(this,'listening',${JSON.stringify(o===step.m)})">${o}</button>`).join('')}</div>`;
    adventureActions.innerHTML='<button onclick="speakText(adventureCurrent.t,\'uk-UA\')">▶ Hear it</button>';
    setTimeout(()=>speakText(step.t,'uk-UA'),250);
    return;
  }

  // Free recall: prompt from meaning, type the target.
  adventureBody.innerHTML=`
    <div class="retrieval-prompt">Type the word that means:</div>
    <div class="hidden-answer">${step.m}</div>
    ${isUk?`<div class="tiny" style="text-align:center">You can type Cyrillic or the pronunciation shown when you learned it.</div>`:''}
    ${renderProofBadges(r,step.lang)}
    <input id="activeRecallInput" class="recall-input" autocomplete="off" autocapitalize="none" placeholder="Your answer…">
    <div id="activeRecallHint" class="explain-box" style="display:none">${isUk?(step.ph||''):`Starts with “${step.t.slice(0,1)}”`}</div>`;
  adventureActions.innerHTML=`
    <button onclick="checkActiveRecall()">Check my answer</button>
    <button class="ghost" onclick="document.getElementById('activeRecallHint').style.display='block'">💡 Hint</button>`;
  setTimeout(()=>document.getElementById('activeRecallInput')?.focus(),100);
}

function activeChoice(btn,format,ok){
  if(adventureAnswered) return;
  adventureAnswered=true;
  const item=adventureCurrent;
  const result=recordObjectiveResult(item.lang,item,format,ok);

  btn.classList.add(ok?'correct-choice':'wrong-choice');
  adventureBody.querySelectorAll('button').forEach(b=>b.disabled=true);

  adventureFeedback.style.display='block';
  if(ok){
    adventureFeedback.innerHTML=`Yes. That is evidence you know it. ${result.mastered?'<b>Mastered across several kinds of memory!</b>':''}`;
  }else{
    adventureFeedback.innerHTML=`Not yet — that tells Chami to bring <b>${item.t}</b> back sooner.<div class="explain-box"><b>${item.t}</b>${item.ph?` · ${item.ph}`:''}<br>${item.m}<br>${item.e||''}</div>`;
  }
  adventureActions.innerHTML='<button onclick="adventureNext()">Next pawprint →</button>';
  renderAll();
}

function normalizeRecall(s){
  return (s||'').toLowerCase().trim().replace(/[.,!?'"’]/g,'').replace(/\s+/g,' ');
}

function checkActiveRecall(){
  if(adventureAnswered) return;
  const item=adventureCurrent;
  const input=document.getElementById('activeRecallInput');
  const guess=normalizeRecall(input?.value);
  const targets=[normalizeRecall(item.t)];
  if(item.lang==='uk' && item.ph) targets.push(normalizeRecall(item.ph));
  const ok=targets.includes(guess);

  adventureAnswered=true;
  const result=recordObjectiveResult(item.lang,item,'recall',ok);
  if(input) input.disabled=true;

  adventureFeedback.style.display='block';
  adventureFeedback.innerHTML=ok
    ? `Yes — you pulled <b>${item.t}</b> out of memory.${result.mastered?' <b>This word is now mastered.</b>':''}`
    : `The answer is <b>${item.t}</b>${item.ph?` (${item.ph})`:''}. Chami will ask again sooner.`;

  adventureActions.innerHTML='<button onclick="adventureNext()">Next pawprint →</button>';
  renderAll();
}


/* =========================================================
   v14 — Smart Session Planner
   ========================================================= */

const SESSION_CFG = window.CHAMI_FAMILY?.learning || {};
let smartSession = null;
let placementQueue = [];
let placementTarget = null;
let placementLang = null;
let placementKnownCorrect = 0;

function secondsFor(kind,mode){
  if(kind==='placement') return SESSION_CFG.placementSeconds||18;
  if(kind==='word') return mode==='new' ? (SESSION_CFG.newWordSeconds||50) : (SESSION_CFG.reviewSeconds||35);
  if(kind==='listen'||kind==='comprehension') return SESSION_CFG.challengeSeconds||55;
  if(kind==='story') return SESSION_CFG.storySeconds||55;
  if(kind==='reward') return SESSION_CFG.rewardSeconds||25;
  return 20;
}

function screenBudgetSeconds(){
  return (SESSION_CFG.maxScreenMinutes||15)*60;
}

function targetBudgetSeconds(){
  return (SESSION_CFG.targetScreenMinutes||12)*60;
}

function sessionSecondsRemaining(){
  if(!smartSession) return targetBudgetSeconds();
  return Math.max(0, smartSession.plannedSeconds-smartSession.usedSeconds);
}

function formatApproxMinutes(seconds){
  const m=Math.max(1,Math.ceil(seconds/60));
  return `~${m} min left`;
}

function updateAdventureTime(){
  const el=document.getElementById('adventureTime');
  if(!el) return;
  if(!smartSession){ el.textContent='~12 min'; return; }
  el.textContent=formatApproxMinutes(sessionSecondsRemaining());
}

function markStepTime(step){
  if(!smartSession || !step || step._timeCounted) return;
  step._timeCounted=true;
  // Planning uses estimated active screen time. Off-screen missions deliberately cost 0 screen seconds.
  smartSession.usedSeconds += step.estimatedSeconds||secondsFor(step.kind,step.mode);
  updateAdventureTime();
}

function rapidPlacementCandidates(lang,limit=5){
  const unseen=unseenNearLevel(lang);
  return unseen.slice(0,limit);
}

function buildSmartPlan(){
  if(state.custody!=='mom') return [{kind:'rest',estimatedSeconds:15}];

  const budget=Math.min(screenBudgetSeconds(),targetBudgetSeconds());
  const plan=[{kind:'welcome',estimatedSeconds:20}];
  let used=20;

  // 1. Due retrieval has first claim on the time budget.
  ['en','uk'].forEach(lang=>{
    const due=[...dueWords(lang)].sort((a,b)=>rec(lang,a.t).due-rec(lang,b.t).due);
    for(const item of due){
      const sec=secondsFor('word','review');
      if(used+sec+secondsFor('reward')>budget) break;
      plan.push({kind:'word',...item,mode:'review',lang,estimatedSeconds:sec});
      used+=sec;
    }
  });

  // 2. Reserve rapid placement slots. A known candidate never consumes a new-word slot.
  // Placement is resolved live: known words are recorded and replaced until either
  // a genuinely new candidate is found or the language's new-word ceiling/time budget is reached.
  for(const lang of ['en','uk']){
    const maxNew=lang==='en'?(SESSION_CFG.maxNewEnglish||5):(SESSION_CFG.maxNewUkrainian||5);
    const candidates=rapidPlacementCandidates(lang,Math.max(maxNew*2,8));
    let slots=adaptiveNewSlots(lang);
    slots=Math.min(slots,maxNew);
    for(let i=0;i<slots && i<candidates.length;i++){
      const placementSec=secondsFor('placement');
      const learnSec=secondsFor('word','new');
      if(used+placementSec+learnSec+secondsFor('challenge')+secondsFor('reward')>budget) break;
      plan.push({
        kind:'placement',
        candidate:candidates[i],
        candidateIndex:i,
        lang,
        remainingCandidates:candidates.slice(i+1),
        estimatedSeconds:placementSec,
        learnSeconds:learnSec
      });
      used+=placementSec+learnSec; // reserve both; known placement later releases learn time
    }
  }

  // 3. One transfer challenge if it fits.
  const challengeSec=secondsFor('comprehension');
  if(used+challengeSec+secondsFor('reward')<=budget){
    const enRecent=recentAccuracy('en');
    const ukRecent=recentAccuracy('uk');
    plan.push({
      kind:(ukRecent===null || (enRecent!==null && ukRecent<enRecent))?'listen':'comprehension',
      estimatedSeconds:challengeSec
    });
    used+=challengeSec;
  }

  // 4. Story if there is room. It is useful application, not filler.
  const storySec=secondsFor('story');
  if(used+storySec+secondsFor('reward')<=budget){
    plan.push({kind:'story',estimatedSeconds:storySec});
    used+=storySec;
  }

  plan.push({kind:'reward',estimatedSeconds:secondsFor('reward')});
  used+=secondsFor('reward');

  smartSession={
    plannedSeconds:Math.min(budget,used),
    usedSeconds:0,
    startedAt:Date.now(),
    newLearned:{en:0,uk:0},
    knownAtPlacement:{en:0,uk:0},
    skipped:0
  };
  return plan;
}

// v14 takes ownership of plan generation.
generateAdventurePlan = buildSmartPlan;

const _v13RenderAdventureStep = renderAdventureStep;
renderAdventureStep = function(){
  _v13RenderAdventureStep();
  const step=adventureCurrent;
  updateAdventureTime();
  if(!step) return;

  if(step.kind==='placement'){
    renderPlacement(step);
    return;
  }
  markStepTime(step);

  if(step.kind==='welcome' && smartSession){
    const mins=Math.ceil(smartSession.plannedSeconds/60);
    adventureSpeech.textContent=`I planned about ${mins} minutes of useful learning. If your brain is done sooner, we stop sooner.`;
    adventureBody.innerHTML=`
      <div class="reward-burst">🐾✨</div>
      <p class="reward-copy">Review comes first. New words only count if they are actually new to you.</p>`;
  }

  if(step.kind==='reward' && smartSession){
    const n=smartSession.newLearned.en+smartSession.newLearned.uk;
    const known=smartSession.knownAtPlacement.en+smartSession.knownAtPlacement.uk;
    adventureSpeech.textContent='That is enough learning for today. Chami is done.';
    adventureBody.innerHTML=`
      <div class="session-finished">
        <div class="big">🌻🐾</div>
        <div class="reward-title">Adventure complete</div>
        <p class="reward-copy">You learned ${n} genuinely new word${n===1?'':'s'}.</p>
        ${known?`<p class="reward-copy">And you showed Chami you already knew ${known} candidate${known===1?'':'s'} — those did not use your new-word slots.</p>`:''}
        <p class="reward-copy"><b>No more schoolwork in Chami today.</b></p>
      </div>`;
    adventureActions.innerHTML='<button class="good" onclick="completeAdventure()">Chami needs a nap 🌙</button>';
  }
};

function renderPlacement(step){
  adventureCurrent=step;
  adventureAnswered=false;
  placementTarget=step.candidate;
  placementLang=step.lang;
  const item=placementTarget;
  const isUk=step.lang==='uk';
  adventureStageBadge.textContent='QUICK CHECK';
  adventureTitle.textContent='Is this really new?';
  adventureSpeech.textContent='A word you already know does not count as one of today’s new words.';
  adventureBody.innerHTML=`
    <div class="placement-card">
      ${isUk?'<div class="reward-burst">🎧</div>':`<div class="adventure-word">${item.t}</div>`}
      <div class="placement-question">${isUk?'Listen. Which meaning is right?':'Which meaning fits best?'}</div>
      <div class="choice-grid" id="placementChoices"></div>
    </div>`;
  const options=shuffled([item.m,...distractorMeanings(item,step.lang,2)]);
  placementChoices.innerHTML=options.map(o=>`<button onclick="answerPlacement(this,${JSON.stringify(o===item.m)})">${o}</button>`).join('');
  adventureActions.innerHTML=isUk?'<button onclick="speakText(placementTarget.t,\'uk-UA\')">▶ Hear it</button>':'';
  if(isUk) setTimeout(()=>speakText(item.t,'uk-UA'),250);
  markStepTime(step);
}

function answerPlacement(btn,correct){
  if(adventureAnswered) return;
  adventureAnswered=true;
  const step=adventureCurrent;
  const item=step.candidate;
  const lang=step.lang;
  btn.classList.add(correct?'correct-choice':'wrong-choice');
  document.querySelectorAll('#placementChoices button').forEach(b=>b.disabled=true);

  if(correct){
    // One fast correct placement answer = probable prior knowledge, NOT mastery.
    const r=rec(lang,item.t);
    r.seen++;
    r.last=state.dayIndex;
    r.proof=r.proof||{};
    r.proof.placement=true;
    r.success++;
    r.interval=Math.max(r.interval||0,2);
    r.due=state.dayIndex+r.interval;
    updateMastery(r);
    p().history[lang][item.t]=r;
    recordPerformance(lang,true);
    smartSession.knownAtPlacement[lang]++;
    // Release the time we had reserved for teaching this candidate.
    smartSession.plannedSeconds=Math.max(smartSession.usedSeconds,smartSession.plannedSeconds-(step.learnSeconds||secondsFor('word','new')));
    save();
    adventureFeedback.style.display='block';
    adventureFeedback.innerHTML=`You already knew <b>${item.t}</b>. It doesn’t use a new-word slot.`;
    adventureActions.innerHTML='<button onclick="adventureNext()">Find the next useful thing →</button>';
  }else{
    // Wrong placement means this is genuinely useful new material.
    adventureFeedback.style.display='block';
    adventureFeedback.innerHTML=`Good — now Chami knows this one is worth teaching.`;
    // Convert the current step into a new-word learning step before advancing.
    const learnStep={kind:'word',...item,mode:'new',lang,estimatedSeconds:step.learnSeconds||secondsFor('word','new'),_v14GenuineNew:true};
    adventurePlan.splice(adventureIndex+1,0,learnStep);
    adventureActions.innerHTML='<button onclick="adventureNext()">Learn it →</button>';
  }
  updateAdventureTime();
}

const _v13RecordObjectiveResult = recordObjectiveResult;
recordObjectiveResult = function(lang,item,format,ok){
  const result=_v13RecordObjectiveResult(lang,item,format,ok);
  if(adventureCurrent?._v14GenuineNew && smartSession && !adventureCurrent._newCounted){
    adventureCurrent._newCounted=true;
    smartSession.newLearned[lang]++;
  }
  return result;
};

// Optional real-world missions are deliberately OUTSIDE the screen-time budget.
// They should be short, skippable and never block completion.
function makeOffscreenMission(lang='uk'){
  const known=wordPool(lang).filter(w=>rec(lang,w.t).seen>0);
  const item=known[Math.floor(Math.random()*known.length)] || wordPool(lang)[0];
  return {
    kind:'offscreen',
    lang,
    item,
    estimatedSeconds:0
  };
}

function renderOffscreenMission(step){
  adventureStageBadge.textContent='OFF-SCREEN MISSION';
  adventureTitle.textContent='Put the phone down';
  adventureSpeech.textContent='This does not use your Chami screen-time budget.';
  adventureBody.innerHTML=`
    <div class="offscreen-card">
      <div class="mission-icon">🏠🔎</div>
      <p><b>Find something in the house that matches:</b></p>
      <div class="adventure-word">${step.item.m}</div>
      <p>Come back and tell Chami the ${step.lang==='uk'?'Ukrainian':'English'} word.</p>
      <div class="offscreen-note">Aim for 1–3 minutes. If you can’t find it quickly, skip it. Searching for ten minutes is not the lesson.</div>
    </div>`;
  adventureActions.innerHTML=`
    <button onclick="adventureNext()">I found something ✓</button>
    <button class="ghost" onclick="adventureNext()">Couldn’t find it — skip</button>`;
}

// Support off-screen steps if future planners insert them.
const _v14RenderAdventureStep = renderAdventureStep;
renderAdventureStep = function(){
  if(adventurePlan[adventureIndex]?.kind==='offscreen'){
    adventureCurrent=adventurePlan[adventureIndex];
    adventureStepCount.textContent=`${Math.min(adventureIndex+1,adventurePlan.length)} / ${adventurePlan.length}`;
    adventureProgressBar.style.width=`${((adventureIndex)/Math.max(1,adventurePlan.length-1))*100}%`;
    adventureFeedback.style.display='none';
    renderOffscreenMission(adventureCurrent);
    updateAdventureTime();
    return;
  }
  _v14RenderAdventureStep();
};


/* =========================================================
   v15 — Ukrainian Play
   Meaning/sound first; Cyrillic is attached to known language.
   ========================================================= */

const UK_LETTERS = [
  ['А','a'],['Б','b'],['В','v'],['Г','h'],['Ґ','g'],['Д','d'],['Е','e'],
  ['Є','ye'],['Ж','zh'],['З','z'],['И','y'],['І','i'],['Ї','yi'],['Й','y'],
  ['К','k'],['Л','l'],['М','m'],['Н','n'],['О','o'],['П','p'],['Р','r'],
  ['С','s'],['Т','t'],['У','u'],['Ф','f'],['Х','kh'],['Ц','ts'],['Ч','ch'],
  ['Ш','sh'],['Щ','shch'],['Ь','soft'],['Ю','yu'],['Я','ya']
];

function cyrillicLetters(word){
  return [...(word||'').toUpperCase()].filter(ch=>/[А-ЯІЇЄҐЬ]/.test(ch));
}

function ukrainianKnownWords(){
  return wordPool('uk').filter(w=>rec('uk',w.t).seen>0);
}

function ukrainianPlayCandidates(){
  const known=ukrainianKnownWords();
  return known.length ? known : wordPool('uk').slice(0,3);
}

function chooseUkGame(){
  const words=ukrainianPlayCandidates().filter(w=>cyrillicLetters(w.t).length>=2);
  if(!words.length) return null;
  const item=words[Math.floor(Math.random()*words.length)];
  const r=rec('uk',item.t);
  r.proof=r.proof||{};

  // Progress from sound/letter recognition to construction.
  if(!r.proof.letterHunt) return {kind:'ukLetterHunt',item,estimatedSeconds:45};
  if(!r.proof.missingLetter) return {kind:'ukMissingLetter',item,estimatedSeconds:50};
  if(!r.proof.buildWord) return {kind:'ukBuildWord',item,estimatedSeconds:65};

  const kinds=['ukLetterHunt','ukMissingLetter','ukBuildWord'];
  return {kind:kinds[(r.seen||0)%kinds.length],item,estimatedSeconds:55};
}

// Extend v14 planner: replace a generic story/challenge with one Ukrainian
// literacy game when the child has Ukrainian vocabulary available and it fits.
const _v14BuildSmartPlan = buildSmartPlan;
buildSmartPlan = function(){
  const plan=_v14BuildSmartPlan();
  if(state.custody!=='mom') return plan;

  const game=chooseUkGame();
  if(!game) return plan;

  const rewardIndex=plan.findIndex(x=>x.kind==='reward');
  if(rewardIndex<0) return plan;

  // Prefer replacing story, otherwise insert only if budget allows.
  const storyIndex=plan.findIndex(x=>x.kind==='story');
  if(storyIndex>=0){
    const old=plan[storyIndex];
    plan.splice(storyIndex,1,game);
    if(smartSession) smartSession.plannedSeconds=Math.max(
      smartSession.usedSeconds,
      smartSession.plannedSeconds-(old.estimatedSeconds||55)+game.estimatedSeconds
    );
  }else if(smartSession && smartSession.plannedSeconds+game.estimatedSeconds<=screenBudgetSeconds()){
    plan.splice(rewardIndex,0,game);
    smartSession.plannedSeconds+=game.estimatedSeconds;
  }
  return plan;
};
generateAdventurePlan = buildSmartPlan;

function ukBridge(item){
  return `<div class="known-word-bridge">
    <div class="meaning">${item.m}</div>
    ${item.ph?`<div class="phonetic">${item.ph}</div>`:''}
    <button class="ghost" onclick="speakText(${JSON.stringify('PLACEHOLDER')},'uk-UA')" style="display:none"></button>
  </div>`;
}

function ukGameHeader(item,title,instruction){
  adventureStageBadge.textContent='UKRAINIAN PLAY';
  adventureTitle.textContent=title;
  adventureSpeech.textContent=instruction;
  adventureCharacter.src='assets/peach.png';
  adventureFeedback.style.display='none';
  adventureActions.innerHTML=`<button class="ghost" onclick="speakText(adventureCurrent.item.t,'uk-UA')">🔊 Hear the word</button>`;
}

function renderUkLetterHunt(step){
  const item=step.item;
  const letters=cyrillicLetters(item.t);
  const target=letters[Math.floor(Math.random()*letters.length)];
  step.targetLetter=target;

  const other=shuffled(UK_LETTERS.map(x=>x[0]).filter(x=>x!==target)).slice(0,5);
  const options=shuffled([target,...other]);

  ukGameHeader(item,'Letter Hunt','You already know the sound and meaning. Now find one piece of its Ukrainian shape.');
  adventureBody.innerHTML=`
    <div class="uk-game-shell">
      <div class="uk-game-icon">🔎🇺🇦</div>
      <div class="known-word-bridge">
        <div class="meaning">${item.m}</div>
        ${item.ph?`<div class="phonetic">${item.ph}</div>`:''}
        <div class="adventure-word" style="font-size:34px">${item.t}</div>
      </div>
      <div class="placement-question">Find <b>${target}</b> inside the letter garden.</div>
      <div class="letter-grid">
        ${options.map(l=>`<button class="letter-tile" onclick="answerUkLetterHunt(this,${JSON.stringify(l)})">${l}</button>`).join('')}
      </div>
    </div>`;
}

function answerUkLetterHunt(btn,letter){
  if(adventureAnswered) return;
  adventureAnswered=true;
  const ok=letter===adventureCurrent.targetLetter;
  btn.classList.add(ok?'correct-choice':'wrong-choice');
  if(ok){
    const r=rec('uk',adventureCurrent.item.t);
    r.proof=r.proof||{};
    r.proof.letterHunt=true;
    p().history.uk[adventureCurrent.item.t]=r;
    recordPerformance('uk',true);
    save();
    adventureFeedback.innerHTML=`Yes — <b>${letter}</b> is part of <b>${adventureCurrent.item.t}</b>.`;
  }else{
    recordPerformance('uk',false);
    adventureFeedback.innerHTML=`Almost. Look for <b>${adventureCurrent.targetLetter}</b>.`;
  }
  adventureFeedback.style.display='block';
  adventureActions.innerHTML='<button onclick="adventureNext()">Next →</button>';
}

function renderUkMissingLetter(step){
  const item=step.item;
  const letters=cyrillicLetters(item.t);
  const idx=Math.floor(Math.random()*letters.length);
  const missing=letters[idx];
  step.targetLetter=missing;
  step.missingIndex=idx;
  const display=letters.map((l,i)=>i===idx?'_':l).join('');
  const options=shuffled([missing,...shuffled(UK_LETTERS.map(x=>x[0]).filter(x=>x!==missing)).slice(0,2)]);

  ukGameHeader(item,"Chami's Missing Letter",'A letter fell out. Use the sound and the word shape to put it back.');
  adventureBody.innerHTML=`
    <div class="uk-game-shell">
      <div class="uk-game-icon">🐾❓</div>
      <div class="known-word-bridge">
        <div class="meaning">${item.m}</div>
        ${item.ph?`<div class="phonetic">${item.ph}</div>`:''}
      </div>
      <div class="missing-word">${display}</div>
      <div class="tile-bank">
        ${options.map(l=>`<button onclick="answerUkMissing(this,${JSON.stringify(l)})">${l}</button>`).join('')}
      </div>
    </div>`;
}

function answerUkMissing(btn,letter){
  if(adventureAnswered) return;
  adventureAnswered=true;
  const ok=letter===adventureCurrent.targetLetter;
  btn.classList.add(ok?'correct-choice':'wrong-choice');
  const r=rec('uk',adventureCurrent.item.t);
  r.proof=r.proof||{};
  if(ok){
    r.proof.missingLetter=true;
    recordPerformance('uk',true);
    adventureFeedback.innerHTML=`You fixed it: <b>${adventureCurrent.item.t}</b>.`;
  }else{
    recordPerformance('uk',false);
    adventureFeedback.innerHTML=`The missing letter was <b>${adventureCurrent.targetLetter}</b>. The whole word is <b>${adventureCurrent.item.t}</b>.`;
  }
  p().history.uk[adventureCurrent.item.t]=r;
  save();
  adventureFeedback.style.display='block';
  adventureActions.innerHTML='<button onclick="adventureNext()">Next →</button>';
}

function renderUkBuildWord(step){
  const item=step.item;
  const letters=cyrillicLetters(item.t);
  step.buildTarget=letters;
  step.built=[];
  const distractors=shuffled(UK_LETTERS.map(x=>x[0]).filter(x=>!letters.includes(x))).slice(0,Math.min(2,letters.length));
  step.buildBank=shuffled([...letters,...distractors]);

  ukGameHeader(item,'Build the Word','Peach mixed up the letters. Build the Ukrainian word you already know.');
  adventureBody.innerHTML=`
    <div class="uk-game-shell">
      <div class="uk-game-icon">🐹🧩</div>
      <div class="known-word-bridge">
        <div class="meaning">${item.m}</div>
        ${item.ph?`<div class="phonetic">${item.ph}</div>`:''}
      </div>
      <div id="ukBuildSlots" class="word-builder">
        ${letters.map(()=>'<div class="word-slot"></div>').join('')}
      </div>
      <div id="ukTileBank" class="tile-bank">
        ${step.buildBank.map((l,i)=>`<button id="uktile${i}" onclick="addUkBuildLetter(${i},${JSON.stringify(l)})">${l}</button>`).join('')}
      </div>
    </div>`;
  adventureActions.innerHTML=`
    <button class="ghost" onclick="speakText(adventureCurrent.item.t,'uk-UA')">🔊 Hear it</button>
    <button class="ghost" onclick="resetUkBuild()">↺ Start over</button>`;
}

function addUkBuildLetter(index,letter){
  if(adventureAnswered) return;
  const step=adventureCurrent;
  step.built.push({index,letter});
  const b=document.getElementById('uktile'+index);
  if(b) b.disabled=true;
  refreshUkBuildSlots();

  if(step.built.length===step.buildTarget.length){
    const built=step.built.map(x=>x.letter).join('');
    const target=step.buildTarget.join('');
    const ok=built===target;
    adventureAnswered=true;
    const r=rec('uk',step.item.t);
    r.proof=r.proof||{};
    if(ok){
      r.proof.buildWord=true;
      recordPerformance('uk',true);
      adventureFeedback.innerHTML=`Yes — you built <b>${step.item.t}</b> yourself.`;
    }else{
      recordPerformance('uk',false);
      adventureFeedback.innerHTML=`Almost. The word is <b>${step.item.t}</b>.`;
    }
    p().history.uk[step.item.t]=r;
    save();
    adventureFeedback.style.display='block';
    adventureActions.innerHTML='<button onclick="adventureNext()">Continue →</button>';
  }
}

function refreshUkBuildSlots(){
  const slots=document.querySelectorAll('#ukBuildSlots .word-slot');
  slots.forEach((s,i)=>s.textContent=adventureCurrent.built[i]?.letter||'');
}

function resetUkBuild(){
  adventureCurrent.built=[];
  adventureAnswered=false;
  document.querySelectorAll('#ukTileBank button').forEach(b=>b.disabled=false);
  refreshUkBuildSlots();
  adventureFeedback.style.display='none';
}

const _v15PreviousRender = renderAdventureStep;
renderAdventureStep = function(){
  const step=adventurePlan[adventureIndex];
  if(step && ['ukLetterHunt','ukMissingLetter','ukBuildWord'].includes(step.kind)){
    adventureCurrent=step;
    adventureAnswered=false;
    adventureStepCount.textContent=`${Math.min(adventureIndex+1,adventurePlan.length)} / ${adventurePlan.length}`;
    adventureProgressBar.style.width=`${((adventureIndex)/Math.max(1,adventurePlan.length-1))*100}%`;
    if(step.kind==='ukLetterHunt') renderUkLetterHunt(step);
    if(step.kind==='ukMissingLetter') renderUkMissingLetter(step);
    if(step.kind==='ukBuildWord') renderUkBuildWord(step);
    markStepTime(step);
    updateAdventureTime();
    return;
  }
  _v15PreviousRender();
};


/* =========================================================
   v16 — Chami World
   Purposeful feedback only: no infinite animation loops.
   ========================================================= */

function ensureWorldState(){
  const prof=p();
  if(!prof.world) prof.world={flowersSeen:0,lastMastered:0};
  if(typeof prof.soundEnabled!=='boolean') prof.soundEnabled=true;
}

function masteredCount(lang){
  return Object.values(p().history?.[lang]||{}).filter(r=>r?.mastered).length;
}

function totalMastered(){
  return masteredCount('en')+masteredCount('uk');
}

function worldStage(){
  const n=totalMastered();
  if(n<3) return {name:'Seed Garden', plants:['🌱','🌱','🌱']};
  if(n<8) return {name:'Little Garden', plants:['🌱','🌷','🌱','🌼']};
  if(n<15) return {name:'Blooming Garden', plants:['🌷','🌼','🌻','🌸','🌱']};
  if(n<25) return {name:'Chami Meadow', plants:['🌻','🌷','🌸','🌼','🌺','🌱']};
  return {name:'Adventure Garden', plants:['🌻','🌺','🌸','🌷','🌼','🌿','🍓','🌱']};
}

function renderChamiWorld(){
  if(!document.getElementById('gardenGrid')) return;
  ensureWorldState();
  const stage=worldStage();
  worldTitle.textContent=stage.name;
  const mastered=totalMastered();
  const prev=p().world.lastMastered||0;

  gardenGrid.innerHTML='';
  const visible=Math.max(3,Math.min(12, 3+Math.floor(mastered/2)));
  for(let i=0;i<visible;i++){
    const plant=document.createElement('div');
    plant.className='garden-plant'+(mastered>prev && i===visible-1?' grow':'');
    plant.textContent=stage.plants[i%stage.plants.length];
    gardenGrid.appendChild(plant);
  }
  worldStats.innerHTML=`
    <div class="world-stat">📚 ${masteredCount('en')} English mastered</div>
    <div class="world-stat">🇺🇦 ${masteredCount('uk')} Ukrainian mastered</div>
  `;
  p().world.lastMastered=mastered;
  save();
}

function chamiReact(type){
  const img=document.getElementById('adventureCharacter');
  if(!img) return;
  const cls=type==='correct'?'character-react-correct':type==='wrong'?'character-react-wrong':'character-react-listen';
  img.classList.remove('character-react-correct','character-react-wrong','character-react-listen');
  // force animation restart
  void img.offsetWidth;
  img.classList.add(cls);
  setTimeout(()=>img.classList.remove(cls),800);
}

function tinyCelebration(){
  const icons=['⭐','🌼','✨','🌱'];
  for(let i=0;i<6;i++){
    const e=document.createElement('div');
    e.className='mini-confetti';
    e.textContent=icons[i%icons.length];
    e.style.left=(45+Math.random()*10)+'vw';
    e.style.top=(45+Math.random()*8)+'vh';
    e.style.setProperty('--dx',`${(Math.random()-.5)*180}px`);
    e.style.setProperty('--dy',`${-60-Math.random()*100}px`);
    document.body.appendChild(e);
    setTimeout(()=>e.remove(),900);
  }
}

function audioCtx(){
  if(!window.__chamiAudioCtx){
    const AC=window.AudioContext||window.webkitAudioContext;
    if(AC) window.__chamiAudioCtx=new AC();
  }
  return window.__chamiAudioCtx;
}

function playTone(freq=440,duration=.09,type='sine',gain=.04){
  ensureWorldState();
  if(!p().soundEnabled) return;
  const ctx=audioCtx();
  if(!ctx) return;
  const osc=ctx.createOscillator(), g=ctx.createGain();
  osc.type=type; osc.frequency.value=freq;
  g.gain.setValueAtTime(gain,ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+duration);
  osc.connect(g);g.connect(ctx.destination);
  osc.start();osc.stop(ctx.currentTime+duration);
}

function soundCorrect(){
  playTone(523,.08,'sine',.035);
  setTimeout(()=>playTone(659,.09,'sine',.035),75);
}

function soundWrong(){
  playTone(240,.12,'triangle',.025);
}

function soundReward(){
  playTone(523,.08,'sine',.03);
  setTimeout(()=>playTone(659,.08,'sine',.03),70);
  setTimeout(()=>playTone(784,.12,'sine',.03),140);
}

function toggleChamiSound(){
  ensureWorldState();
  p().soundEnabled=!p().soundEnabled;
  save();
  updateSoundToggle();
  if(p().soundEnabled) soundCorrect();
}

function updateSoundToggle(){
  const b=document.getElementById('soundToggle');
  if(!b) return;
  ensureWorldState();
  b.textContent=p().soundEnabled?'🔊 Sound on':'🔇 Sound off';
}

// Wrap answer handlers to add non-looping character/sound feedback.
const _v16ActiveChoice=activeChoice;
activeChoice=function(btn,format,ok){
  _v16ActiveChoice(btn,format,ok);
  chamiReact(ok?'correct':'wrong');
  if(ok){soundCorrect();tinyCelebration();} else soundWrong();
};

const _v16CheckRecall=checkActiveRecall;
checkActiveRecall=function(){
  const before=adventureAnswered;
  _v16CheckRecall();
  if(before===adventureAnswered) return;
  const item=adventureCurrent;
  const input=document.getElementById('activeRecallInput');
  const guess=normalizeRecall(input?.value);
  const targets=[normalizeRecall(item?.t)];
  if(item?.lang==='uk' && item?.ph) targets.push(normalizeRecall(item.ph));
  const ok=targets.includes(guess);
  chamiReact(ok?'correct':'wrong');
  if(ok){soundCorrect();tinyCelebration();} else soundWrong();
};

const _v16Placement=answerPlacement;
answerPlacement=function(btn,correct){
  _v16Placement(btn,correct);
  chamiReact(correct?'correct':'listen');
  if(correct) soundCorrect(); else playTone(390,.08,'sine',.025);
};

const _v16LetterHunt=answerUkLetterHunt;
answerUkLetterHunt=function(btn,letter){
  const target=adventureCurrent?.targetLetter;
  _v16LetterHunt(btn,letter);
  const ok=letter===target;
  chamiReact(ok?'correct':'wrong');
  if(ok){soundCorrect();tinyCelebration();} else soundWrong();
};

const _v16Missing=answerUkMissing;
answerUkMissing=function(btn,letter){
  const target=adventureCurrent?.targetLetter;
  _v16Missing(btn,letter);
  const ok=letter===target;
  chamiReact(ok?'correct':'wrong');
  if(ok){soundCorrect();tinyCelebration();} else soundWrong();
};

const _v16AddBuild=addUkBuildLetter;
addUkBuildLetter=function(index,letter){
  const step=adventureCurrent;
  _v16AddBuild(index,letter);
  if(step?.built?.length===step?.buildTarget?.length){
    const ok=step.built.map(x=>x.letter).join('')===step.buildTarget.join('');
    chamiReact(ok?'correct':'wrong');
    if(ok){soundCorrect();tinyCelebration();} else soundWrong();
  }else{
    playTone(430,.035,'sine',.012);
  }
};

const _v16Complete=completeAdventure;
completeAdventure=function(){
  soundReward();
  tinyCelebration();
  _v16Complete();
  renderChamiWorld();
};

// Make speech visually animate Chami listening/speaking.
const _v16Speak=speakText;
speakText=function(text,lang){
  chamiReact('listen');
  return _v16Speak(text,lang);
};

// Home render extension.
const _v16RenderAll=renderAll;
renderAll=function(){
  _v16RenderAll();
  updateSoundToggle();
  renderChamiWorld();
};

// Initial world render after current scripts settle.
setTimeout(()=>{
  try{
    ensureWorldState();
    updateSoundToggle();
    renderChamiWorld();
  }catch(e){}
},100);


/* =========================================================
   v17 — Controlled AI Chami
   AI decorates curriculum; it does not choose curriculum.
   ========================================================= */

function aiReadingBand(){
  return state.child==='Aurora' ? 'elementary' : 'early_elementary';
}

function aiProfileId(){
  // Pseudonymous family-local identifier. Do not send real child name by default.
  return state.child==='Aurora' ? 'learner_a' : 'learner_t';
}

function aiKnownWords(lang,limit=8){
  return wordPool(lang)
    .filter(w=>rec(lang,w.t).success>0)
    .sort((a,b)=>(rec(lang,b.t).success||0)-(rec(lang,a.t).success||0))
    .slice(0,limit)
    .map(w=>w.t);
}

function aiStoryPayload(englishTargets=[],ukTargets=[]){
  return {
    learner:{
      profile_id:aiProfileId(),
      reading_band:aiReadingBand()
    },
    targets:{
      english:englishTargets.slice(0,3),
      ukrainian:ukTargets.slice(0,2),
      known_words:[...aiKnownWords('en',6),...aiKnownWords('uk',4)]
    },
    constraints:{
      max_words:80,
      tone:'warm, playful, concrete',
      no_new_ukrainian:true,
      no_open_ended_chat:true
    }
  };
}

async function renderControlledStory(){
  const learnedEn=DATA[state.child].en.filter(w=>rec('en',w.t).seen>0);
  const learnedUk=DATA[state.child].uk.filter(w=>rec('uk',w.t).seen>0);
  const english=learnedEn.slice(0,3).map(w=>w.t);
  const ukrainian=learnedUk.slice(0,2).map(w=>w.t);

  adventureStageBadge.textContent='CHAMI STORY';
  adventureTitle.textContent='A story made for today';
  adventureSpeech.textContent='I use the words your learning plan already chose.';

  adventureBody.innerHTML=`
    <div class="story-box" id="aiStoryBox">
      <div style="text-align:center;padding:18px">🐾 Chami is making a tiny story…</div>
    </div>`;
  adventureActions.innerHTML='';

  const result=await window.ChamiAI.microStory(aiStoryPayload(english,ukrainian));
  const badge=result.source==='ai'?'✨ Personalized':'🌱 Offline story';
  aiStoryBox.innerHTML=`
    <div class="badge">${badge}</div>
    <h2>${escapeHtml(result.title||'Chami Story')}</h2>
    <div>${escapeHtml(result.content||'')}</div>
    ${result.check_question?`<div class="explain-box"><b>Think:</b> ${escapeHtml(result.check_question)}</div>`:''}`;

  adventureActions.innerHTML='<button onclick="adventureNext()">Continue →</button>';
}

function escapeHtml(s){
  return String(s??'').replace(/[&<>"']/g,c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

// Replace v15/v16 static story rendering with bounded AI/local content.
const _v17RenderAdventureStep = renderAdventureStep;
renderAdventureStep = function(){
  const step=adventurePlan[adventureIndex];
  if(step?.kind==='story'){
    adventureCurrent=step;
    adventureAnswered=false;
    adventureStepCount.textContent=`${Math.min(adventureIndex+1,adventurePlan.length)} / ${adventurePlan.length}`;
    adventureProgressBar.style.width=`${((adventureIndex)/Math.max(1,adventurePlan.length-1))*100}%`;
    adventureFeedback.style.display='none';
    markStepTime(step);
    updateAdventureTime();
    renderControlledStory().catch(()=>{
      adventureBody.innerHTML='<div class="story-box">Chami could not make a story this time. That is okay — your learning progress is still saved.</div>';
      adventureActions.innerHTML='<button onclick="adventureNext()">Continue →</button>';
    });
    return;
  }
  _v17RenderAdventureStep();
};

async function aiExplainCurrentWord(){
  const item=adventureCurrent;
  if(!item?.t) return;
  adventureFeedback.style.display='block';
  adventureFeedback.innerHTML='🐾 Chami is finding another way to explain it…';
  const result=await window.ChamiAI.explanation({
    learner:{profile_id:aiProfileId(),reading_band:aiReadingBand()},
    targets:{english:item.lang==='en'?[item.t]:[],ukrainian:[],known_words:aiKnownWords('en',6)},
    meaning:item.m||'',
    constraints:{max_words:55,no_open_ended_chat:true}
  });
  adventureFeedback.innerHTML=`<b>${escapeHtml(result.title||'Another clue')}</b><br>${escapeHtml(result.content||'')}`;
}

// Add bounded explanation button after wrong English objective answers.
const _v17RecordObjectiveResult = recordObjectiveResult;
recordObjectiveResult=function(lang,item,format,ok){
  const r=_v17RecordObjectiveResult(lang,item,format,ok);
  if(!ok && lang==='en'){
    setTimeout(()=>{
      if(adventureActions && adventureCurrent?.t===item.t){
        adventureActions.insertAdjacentHTML('beforeend',
          '<button class="ghost" onclick="aiExplainCurrentWord()">🐾 Explain another way</button>');
      }
    },0);
  }
  return r;
};


/* =========================================================
   v18 — Learner Intelligence / Grown-up knowledge map
   ========================================================= */

function learnerMap(lang){
  return window.ChamiLearner.languageMap({
    history:p().history?.[lang]||{},
    items:DATA[state.child]?.[lang]||[],
    lang,
    dayIndex:state.dayIndex
  });
}

function pct(x){ return `${Math.round((x||0)*100)}%`; }

function learnerStageLabel(stage){
  return ({
    unseen:'Unseen',
    exposed:'Just exposed',
    recognized:'Recognizes',
    fragile:'Fragile',
    usable:'Can use/recall',
    forgetting:'Forgetting',
    mastered:'Mastered',
    mastered_due:'Mastered, due'
  })[stage]||stage;
}

function topKnowledgeRows(map,lang,limit=6){
  const priority={forgetting:0,fragile:1,mastered_due:2,usable:3,recognized:4,exposed:5,mastered:6,unseen:7};
  return map.records
    .filter(x=>x.record?.seen)
    .sort((a,b)=>(priority[a.evidence.stage]??9)-(priority[b.evidence.stage]??9))
    .slice(0,limit)
    .map(x=>{
      const due=(x.record?.due??Infinity)<=state.dayIndex;
      const risk=due?'due':x.record?.mastered?'strong':'';
      const riskText=due?'Review due':x.record?.mastered?'Strong':`${x.evidence.proofs} proof${x.evidence.proofs===1?'':'s'}`;
      return `<div class="knowledge-row">
        <b>${escapeHtml(x.item.t)}</b>
        <span class="knowledge-stage">${learnerStageLabel(x.evidence.stage)}</span>
        <span class="knowledge-risk ${risk}">${riskText}</span>
      </div>`;
    }).join('');
}

function inferredLearningNote(en,uk){
  const notes=[];
  if(en.recognition.length>en.recall.length+2) notes.push('English recognition is ahead of retrieval.');
  if(en.transfer.length>=Math.max(2,en.recall.length-1)) notes.push('English is beginning to transfer into context, not just definition matching.');
  if(uk.listening.length>uk.literacy.length+1) notes.push('Ukrainian listening is currently ahead of Cyrillic literacy.');
  if(uk.literacy.length>uk.listening.length+1) notes.push('Ukrainian literacy is currently ahead of listening evidence.');
  if(en.due.length+uk.due.length>=5) notes.push('Review load is high, so Chami should introduce less new material.');
  return notes[0] || 'Chami needs more sessions before making a strong learning-pattern inference.';
}

function renderLearnerIntelligence(){
  if(!document.getElementById('intelSummary')) return;
  const en=learnerMap('en'), uk=learnerMap('uk');
  const name=childDisplayName();
  const allSeen=en.seen.length+uk.seen.length;
  const allMastered=en.mastered.length+uk.mastered.length;
  const priorities=[
    ...window.ChamiLearner.priorities(en,'en'),
    ...window.ChamiLearner.priorities(uk,'uk')
  ].slice(0,4);

  intelTitle.textContent=`What Chami knows about ${name}`;
  intelSummary.innerHTML=allSeen
    ? `<b>${name} has evidence on ${allSeen} learning items.</b> ${allMastered} currently meet Chami's multi-format spaced mastery rule.<br><span class="tiny">${escapeHtml(inferredLearningNote(en,uk))}</span>`
    : `Chami does not have enough learning evidence yet. The map will become useful after several sessions.`;

  intelSignals.innerHTML=`
    <div class="intel-signal">
      <div class="label">English retained</div>
      <div class="value">${en.mastered.length}/${en.seen.length||0}</div>
      <div class="note">${pct(en.retention)} of encountered English items currently meet mastery.</div>
    </div>
    <div class="intel-signal">
      <div class="label">English transfer</div>
      <div class="value">${en.transfer.length}</div>
      <div class="note">Items with evidence beyond simple recognition.</div>
    </div>
    <div class="intel-signal">
      <div class="label">Ukrainian listening</div>
      <div class="value">${uk.listening.length}</div>
      <div class="note">Words recognized through listening evidence.</div>
    </div>
    <div class="intel-signal">
      <div class="label">Cyrillic literacy</div>
      <div class="value">${uk.literacy.length}</div>
      <div class="note">Known words with letter/word-building evidence.</div>
    </div>
    <div class="intel-signal">
      <div class="label">Review due</div>
      <div class="value">${en.due.length+uk.due.length}</div>
      <div class="note">Memory items whose next retrieval is due now.</div>
    </div>
    <div class="intel-signal">
      <div class="label">Fragile / forgetting</div>
      <div class="value">${en.fragile.length+uk.fragile.length}</div>
      <div class="note">Useful targets for reinforcement before adding more content.</div>
    </div>`;

  intelNext.innerHTML=`
    <h3>Chami's next priorities</h3>
    ${priorities.length
      ? priorities.map(x=>`<div class="intel-priority">${escapeHtml(x)}</div>`).join('')
      : '<div class="intel-priority">Keep collecting varied retrieval evidence. No strong remediation signal yet.</div>'}
    ${(en.seen.length||uk.seen.length)?`
      <h3 style="margin-top:14px">Items to watch</h3>
      <div class="knowledge-list">
        ${topKnowledgeRows(en,'en',3)}
        ${topKnowledgeRows(uk,'uk',3)}
      </div>`:''}`;
}

// Render when Grown-ups is visited / all UI refreshes.
const _v18RenderAll=renderAll;
renderAll=function(){
  _v18RenderAll();
  renderLearnerIntelligence();
};
setTimeout(()=>{try{renderLearnerIntelligence();}catch(e){}},120);


/* =========================================================
   v19 — Adaptive Calibration
   ========================================================= */

let calibrationStepStartedAt = null;
let calibrationStepRef = null;
let calibrationSessionStartedAt = null;

function calibrationProfile(){
  const prof=p();
  window.ChamiCalibration.ensure(prof);
  return prof;
}

function calibratedSecondsFor(kind,mode){
  const prof=calibrationProfile();
  let key='other', fallback=40;

  if(kind==='placement'){ key='placement'; fallback=SESSION_CFG.placementSeconds||18; }
  else if(kind==='word' && mode==='new'){ key='newWord'; fallback=SESSION_CFG.newWordSeconds||50; }
  else if(kind==='word'){ key='review'; fallback=SESSION_CFG.reviewSeconds||35; }
  else if(kind==='listen'||kind==='comprehension'){ key='challenge'; fallback=SESSION_CFG.challengeSeconds||55; }
  else if(['phonicsWordMatch','phonicsPatternMatch','phonicsBuild'].includes(kind)){ key='phonics'; fallback=50; }
  else if(['ukLetterHunt','ukMissingLetter','ukBuildWord'].includes(kind)){ key='ukGame'; fallback=55; }
  else if(kind==='story'){ key='story'; fallback=SESSION_CFG.storySeconds||55; }
  else if(kind==='reward'){ key='reward'; fallback=SESSION_CFG.rewardSeconds||25; }

  return Math.round(window.ChamiCalibration.estimate(prof,key,fallback));
}

// v19 replaces fixed timing estimates with the child's calibrated pace.
secondsFor = calibratedSecondsFor;

function startCalibrationStep(step){
  if(!step || step.kind==='offscreen'){
    calibrationStepStartedAt=null;
    calibrationStepRef=null;
    return;
  }
  calibrationStepStartedAt=Date.now();
  calibrationStepRef=step;
}

function finishCalibrationStep(){
  if(!calibrationStepStartedAt || !calibrationStepRef) return;
  const seconds=(Date.now()-calibrationStepStartedAt)/1000;
  window.ChamiCalibration.observe(calibrationProfile(),calibrationStepRef,seconds);
  calibrationStepStartedAt=null;
  calibrationStepRef=null;
  save();
}

const _v19StartAdventure = startAdventure;
startAdventure=function(){
  calibrationSessionStartedAt=Date.now();
  _v19StartAdventure();
};

const _v19AdventureNext = adventureNext;
adventureNext=function(){
  finishCalibrationStep();
  _v19AdventureNext();
};

const _v19FinishEarly = finishAdventureEarly;
finishAdventureEarly=function(){
  finishCalibrationStep();
  _v19FinishEarly();
};

const _v19CompleteAdventure = completeAdventure;
completeAdventure=function(){
  finishCalibrationStep();
  if(calibrationSessionStartedAt){
    const sec=(Date.now()-calibrationSessionStartedAt)/1000;
    window.ChamiCalibration.recordSession(calibrationProfile(),sec);
    calibrationSessionStartedAt=null;
    save();
  }
  _v19CompleteAdventure();
  renderCalibration();
};

const _v19RenderAdventureStep = renderAdventureStep;
renderAdventureStep=function(){
  _v19RenderAdventureStep();
  startCalibrationStep(adventureCurrent);
};

// Richer activity selection using v18 learner signals.
function chooseCalibratedChallenge(){
  const en=learnerMap('en');
  const uk=learnerMap('uk');

  // Most urgent: too much recognition, too little retrieval.
  if(en.seen.length>=3 && en.recallRate<0.5){
    return {kind:'comprehension',reason:'English needs stronger retrieval/transfer evidence.'};
  }

  // Ukrainian listening / literacy imbalance.
  if(uk.seen.length>=3 && uk.listening.length>uk.literacy.length+1){
    const g=chooseUkGame();
    if(g) return {...g,reason:'Ukrainian listening is ahead of Cyrillic literacy.'};
  }

  if(uk.seen.length>=3 && uk.literacy.length>uk.listening.length+1){
    return {kind:'listen',reason:'Ukrainian literacy is ahead of listening evidence.'};
  }

  // Fragile memory in either language means prioritize retrieval over novelty.
  if(en.fragile.length+uk.fragile.length>=3){
    return {kind: uk.fragile.length>en.fragile.length ? 'listen' : 'comprehension',
      reason:'Several items are fragile; reinforcement is more useful than novelty.'};
  }

  return null;
}

// Rebalance the smart plan without exceeding the screen-time budget.
const _v19BuildSmartPlan = buildSmartPlan;
buildSmartPlan=function(){
  const plan=_v19BuildSmartPlan();
  if(state.custody!=='mom' || !smartSession) return plan;

  const calibrated=chooseCalibratedChallenge();
  if(!calibrated) return plan;

  // Replace one generic challenge/story slot with the evidence-driven activity.
  const replaceIndex=plan.findIndex(x=>['listen','comprehension','story','ukLetterHunt','ukMissingLetter','ukBuildWord'].includes(x.kind));
  if(replaceIndex>=0){
    const old=plan[replaceIndex];
    const sec=secondsFor(calibrated.kind,calibrated.mode);
    plan[replaceIndex]={...calibrated,estimatedSeconds:sec};
    smartSession.plannedSeconds=Math.max(
      smartSession.usedSeconds,
      smartSession.plannedSeconds-(old.estimatedSeconds||40)+sec
    );
  }
  return plan;
};
generateAdventurePlan=buildSmartPlan;

function renderCalibration(){
  if(!document.getElementById('calibrationSignals')) return;
  const name=childDisplayName();
  const s=window.ChamiCalibration.summary(calibrationProfile());
  calibrationTitle.textContent=`How Chami is learning ${name}'s pace`;

  const row=(label,key)=>{
    const r=s.rows[key];
    const val=r.mean===null?'—':`${Math.round(r.mean)}s`;
    const note=r.count?`${r.count} observation${r.count===1?'':'s'}`:'Using default estimate';
    return `<div class="intel-signal">
      <div class="label">${label}</div>
      <div class="value">${val}</div>
      <div class="note">${note}</div>
    </div>`;
  };

  calibrationSignals.innerHTML=
    row('Quick check','placement')+
    row('Review item','review')+
    row('New word','newWord')+
    row('Challenge','challenge')+
    row('Phonics practice','phonics')+
    row('Ukrainian game','ukGame')+
    row('Story','story');

  const avg=s.avgSession ? `${Math.round(s.avgSession/60)} min` : 'not enough sessions yet';
  calibrationNote.innerHTML=`
    <div class="calibration-note">
      <b>Recent real-session average:</b> ${avg}<br>
      Chami has ${s.totalSamples} usable timing observation${s.totalSamples===1?'':'s'}.
      <div class="calibration-confidence">Calibration confidence: ${s.confidence}</div>
    </div>`;
}

const _v19RenderAll=renderAll;
renderAll=function(){
  _v19RenderAll();
  renderCalibration();
};

setTimeout(()=>{try{renderCalibration();}catch(e){}},140);


/* =========================================================
   v20 — Expressive & Transfer Learning
   ========================================================= */

function chooseTransferTask(){
  const en=window.ChamiTransfer.chooseEnglish(p().history?.en||{},DATA[state.child]?.en||[]);
  const uk=window.ChamiTransfer.chooseUkrainian(p().history?.uk||{},DATA[state.child]?.uk||[]);

  // Prefer English expression until enough Ukrainian spoken vocabulary exists.
  if(en && (!uk || Math.random()<0.7)) return window.ChamiTransfer.englishTask(en);
  if(uk) return window.ChamiTransfer.ukrainianTask(uk);
  return null;
}

const _v20BuildSmartPlan=buildSmartPlan;
buildSmartPlan=function(){
  const plan=_v20BuildSmartPlan();
  if(state.custody!=='mom' || !smartSession) return plan;
  const task=chooseTransferTask();
  if(!task) return plan;

  // Replace story/application rather than adding more screen time.
  let i=plan.findIndex(x=>x.kind==='story');
  if(i<0) i=plan.findIndex(x=>['listen','comprehension'].includes(x.kind));
  if(i>=0){
    const old=plan[i];
    plan[i]=task;
    smartSession.plannedSeconds=Math.max(
      smartSession.usedSeconds,
      smartSession.plannedSeconds-(old.estimatedSeconds||55)+task.estimatedSeconds
    );
  }
  return plan;
};
generateAdventurePlan=buildSmartPlan;

function normalizeExpressive(s){
  return String(s||'').trim().toLowerCase()
    .replace(/[.,!?;:"“”'’()[\]{}]/g,' ')
    .replace(/\s+/g,' ');
}

function expressiveContainsTarget(text,item){
  const n=normalizeExpressive(text);
  const target=normalizeExpressive(item.t);
  if(n.includes(target)) return true;
  if(item.ph && n.includes(normalizeExpressive(item.ph))) return true;
  return false;
}

function renderExpressiveText(step){
  adventureStageBadge.textContent='USE IT';
  adventureTitle.textContent='Make it yours';
  adventureSpeech.textContent='Knowing a word means being able to use it somewhere new.';
  adventureBody.innerHTML=`
    <div class="expressive-card">
      <div class="transfer-scene">🐾💭</div>
      <div class="expressive-prompt">${escapeHtml(step.prompt)}</div>
      <input id="expressiveInput" class="expressive-input" autocomplete="off" autocapitalize="sentences" placeholder="Type a short answer…">
      <div class="tiny">Meaning clue: ${escapeHtml(step.hint||'')}</div>
    </div>`;
  adventureActions.innerHTML='<button onclick="checkExpressiveText()">Check my sentence →</button><button class="ghost" onclick="skipExpressive()">Skip</button>';
}

function checkExpressiveText(){
  if(adventureAnswered) return;
  const text=document.getElementById('expressiveInput')?.value||'';
  if(text.trim().length<3){
    adventureFeedback.style.display='block';
    adventureFeedback.textContent='Try a tiny sentence first — even four or five words is enough.';
    return;
  }
  adventureAnswered=true;
  const step=adventureCurrent;
  const hasTarget=expressiveContainsTarget(text,step.item);
  const r=rec(step.lang,step.item.t);
  r.proof=r.proof||{};
  if(hasTarget){
    // This is evidence of attempted expressive use, not semantic correctness/mastery by itself.
    r.proof.expression=true;
    r.expressionSamples=(r.expressionSamples||0)+1;
    recordPerformance(step.lang,true);
    adventureFeedback.innerHTML=`You used <b>${escapeHtml(step.item.t)}</b> in your own sentence. Chami will check this skill again another day.`;
    chamiReact('correct');soundCorrect();tinyCelebration();
  }else{
    recordPerformance(step.lang,false);
    adventureFeedback.innerHTML=`Try to include <b>${escapeHtml(step.item.t)}</b>. It means ${escapeHtml(step.item.m)}.`;
    chamiReact('wrong');soundWrong();
  }
  p().history[step.lang][step.item.t]=r;save();
  adventureFeedback.style.display='block';
  adventureActions.innerHTML='<button onclick="adventureNext()">Continue →</button>';
}

let recognitionInstance=null;
let recognitionTranscript='';

function speechRecognitionAvailable(){
  return Boolean(window.SpeechRecognition||window.webkitSpeechRecognition);
}

function startExpressiveVoice(){
  if(!speechRecognitionAvailable()){
    document.getElementById('voiceHeard').textContent='Voice checking is not available in this browser. Say it aloud to your grown-up, then tap “I said it.”';
    return;
  }
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  recognitionInstance=new SR();
  recognitionInstance.lang=adventureCurrent.lang==='uk'?'uk-UA':'en-US';
  recognitionInstance.interimResults=false;
  recognitionInstance.maxAlternatives=1;
  recognitionInstance.onresult=e=>{
    recognitionTranscript=e.results?.[0]?.[0]?.transcript||'';
    document.getElementById('voiceHeard').textContent=`Chami heard: “${recognitionTranscript}”`;
  };
  recognitionInstance.onerror=()=>{
    document.getElementById('voiceHeard').textContent='Chami could not hear that clearly. You can try again or use “I said it.”';
  };
  recognitionInstance.start();
  chamiReact('listen');
}

function renderExpressiveVoice(step){
  adventureStageBadge.textContent='SAY IT';
  adventureTitle.textContent=step.lang==='uk'?'Speak Ukrainian':'Use your voice';
  adventureSpeech.textContent='Speaking is practice too. Chami does not need a perfect accent.';
  adventureBody.innerHTML=`
    <div class="expressive-card">
      <div class="transfer-scene">${step.lang==='uk'?'🇺🇦🎙️':'🐾🎙️'}</div>
      <div class="expressive-prompt">${escapeHtml(step.prompt)}</div>
      <div class="voice-box">
        <button onclick="startExpressiveVoice()">🎙️ Listen to me</button>
        <div id="voiceHeard" class="voice-heard">${speechRecognitionAvailable()?'Tap when you are ready.':'Say it aloud; browser voice checking may be unavailable.'}</div>
      </div>
      <div class="tiny">Need a clue? ${escapeHtml(step.hint||'')}</div>
    </div>`;
  adventureActions.innerHTML='<button onclick="checkExpressiveVoice()">I said it ✓</button><button class="ghost" onclick="skipExpressive()">Skip</button>';
}

function checkExpressiveVoice(){
  if(adventureAnswered) return;
  adventureAnswered=true;
  const step=adventureCurrent;
  const r=rec(step.lang,step.item.t);r.proof=r.proof||{};
  const transcriptOk=recognitionTranscript ? expressiveContainsTarget(recognitionTranscript,step.item) : null;

  // Browser speech recognition is supportive evidence only. It is too variable
  // for young-child pronunciation to grant mastery by itself.
  r.proof.spokenAttempt=true;
  r.spokenAttempts=(r.spokenAttempts||0)+1;
  if(transcriptOk===true) r.proof.spokenRecognition=true;

  p().history[step.lang][step.item.t]=r;
  save();
  adventureFeedback.style.display='block';
  adventureFeedback.innerHTML=transcriptOk===false
    ? `Chami heard something different, but speaking practice still counts as an attempt. The target was <b>${escapeHtml(step.item.t)}</b>.`
    : `Good speaking practice. Chami will bring this word back later so it becomes easier to retrieve.`;
  chamiReact('correct');soundCorrect();
  adventureActions.innerHTML='<button onclick="adventureNext()">Continue →</button>';
  recognitionTranscript='';
}

function renderExpressiveScene(step){
  adventureStageBadge.textContent='IMAGINE';
  adventureTitle.textContent='New situation';
  adventureSpeech.textContent='Can you carry the word into a situation you have not seen before?';
  adventureBody.innerHTML=`
    <div class="expressive-card">
      <div class="transfer-scene">🏡🐾🔎</div>
      <div class="expressive-prompt">${escapeHtml(step.prompt)}</div>
      <textarea id="expressiveInput" class="expressive-input" rows="3" placeholder="Tell Chami what could happen…"></textarea>
      <div class="tiny">Use the word: <b>${escapeHtml(step.item.t)}</b></div>
    </div>`;
  adventureActions.innerHTML='<button onclick="checkExpressiveText()">Done →</button><button class="ghost" onclick="skipExpressive()">Skip</button>';
}

function skipExpressive(){
  if(adventureAnswered) return;
  adventureAnswered=true;
  if(smartSession) smartSession.skipped=(smartSession.skipped||0)+1;
  adventureFeedback.style.display='block';
  adventureFeedback.textContent='Skipped. Chami can try another kind of practice later.';
  adventureActions.innerHTML='<button onclick="adventureNext()">Continue →</button>';
}

function renderBoundedOffscreen(step){
  adventureStageBadge.textContent='REAL-WORLD MISSION';
  adventureTitle.textContent='Phone down';
  adventureSpeech.textContent='Learning can leave the screen.';
  adventureBody.innerHTML=`
    <div class="offscreen-card">
      <div class="mission-icon">🏠🔎</div>
      <p><b>${escapeHtml(step.prompt||`Find something that makes you think of “${step.item?.t||''}”.`)}</b></p>
      <p>Come back and tell your grown-up what you found and why.</p>
      <div class="offscreen-timer-note">Try for about 1–3 minutes. If it is not easy to find, skip it. The phone does not need to stay on.</div>
    </div>`;
  adventureActions.innerHTML='<button onclick="adventureNext()">I did it ✓</button><button class="ghost" onclick="adventureNext()">Skip</button>';
}

const _v20RenderAdventureStep=renderAdventureStep;
renderAdventureStep=function(){
  const step=adventurePlan[adventureIndex];
  if(step && ['expressiveText','expressiveVoice','expressiveScene'].includes(step.kind)){
    adventureCurrent=step;adventureAnswered=false;
    adventureStepCount.textContent=`${Math.min(adventureIndex+1,adventurePlan.length)} / ${adventurePlan.length}`;
    adventureProgressBar.style.width=`${((adventureIndex)/Math.max(1,adventurePlan.length-1))*100}%`;
    adventureFeedback.style.display='none';
    if(step.kind==='expressiveText') renderExpressiveText(step);
    if(step.kind==='expressiveVoice') renderExpressiveVoice(step);
    if(step.kind==='expressiveScene') renderExpressiveScene(step);
    markStepTime(step);updateAdventureTime();startCalibrationStep(step);
    return;
  }
  if(step?.kind==='offscreen' && step.prompt){
    adventureCurrent=step;adventureAnswered=false;
    renderBoundedOffscreen(step);updateAdventureTime();startCalibrationStep(step);
    return;
  }
  _v20RenderAdventureStep();
};


/* =========================================================
   v21 — Curriculum Engine Expansion
   ========================================================= */

function curriculumStatus(lang){
  return window.ChamiCurriculum.status(
    p().history?.[lang]||{},
    DATA[state.child]?.[lang]||[],
    lang,
    state.dayIndex
  );
}

// Wrap new-item selection so unseen vocabulary cannot jump arbitrarily ahead.
const _v21PickNew=typeof pickNew==='function'
  ? pickNew
  : (lang=>unseenNearLevel(lang)[0] || DATA[state.child]?.[lang]?.[0] || null);
pickNew=function(lang){
  const items=DATA[state.child]?.[lang]||[];
  const history=p().history?.[lang]||{};
  const pool=window.ChamiCurriculum.candidatePool(history,items,lang,state.dayIndex);
  if(pool.frontier.length){
    // Keep deterministic variety but favor the current learning frontier.
    return pool.frontier[Math.floor(Math.random()*pool.frontier.length)];
  }
  return _v21PickNew(lang);
};

function renderCurriculumPath(){
  if(!document.getElementById('curriculumPathSignals')) return;
  const en=curriculumStatus('en'), uk=curriculumStatus('uk');
  curriculumPathTitle.textContent=`${childDisplayName()}'s learning pathway`;

  const card=(label,s,lang)=>{
    const pctTotal=s.total?Math.round(s.seen/s.total*100):0;
    return `<div class="intel-signal">
      <div class="label">${label}</div>
      <div class="path-band">${escapeHtml(s.band.name)}</div>
      <div class="path-desc">${escapeHtml(s.band.description)}</div>
      <div class="path-meter"><span style="width:${Math.min(100,pctTotal)}%"></span></div>
      <div class="note">${s.seen} encountered · ${s.mastered} mastered · curriculum difficulty ≤ ${s.max}</div>
    </div>`;
  };

  curriculumPathSignals.innerHTML=
    card('English pathway',en,'en')+
    card('Ukrainian pathway',uk,'uk');

  curriculumPathNote.innerHTML=`
    <div class="calibration-note">
      <b>How advancement works:</b> Chami opens harder material only when retention, recall and review load support it.
      Age does not automatically push a child forward, and a difficult week does not permanently push her backward.
    </div>`;
}

const _v21RenderAll=renderAll;
renderAll=function(){
  _v21RenderAll();
  renderCurriculumPath();
};
setTimeout(()=>{try{renderCurriculumPath();}catch(e){}},160);


/* =========================================================
   v22 — Literacy-aware delivery + curriculum quality
   ========================================================= */

function interactionProfile(){
  return window.ChamiQuality.interactionProfile(state.child);
}

function isEarlyReader(){
  return interactionProfile().mode==='early_reader';
}

function applyLiteracyMode(){
  document.body.classList.toggle('early-reader',isEarlyReader());
}

function speakEnglishSupport(text){
  speakText(text,'en-US');
}

function childSafeSentence(text,maxWords){
  const words=String(text||'').split(/\s+/);
  return words.length<=maxWords ? text : words.slice(0,maxWords).join(' ')+'…';
}

function meaningEmoji(item){
  const m=(item?.m||'').toLowerCase();
  const pairs=[
    ['dog','🐶'],['cat','🐱'],['book','📚'],['water','💧'],['home','🏠'],
    ['school','🏫'],['apple','🍎'],['red','🔴'],['blue','🔵'],['green','🟢'],
    ['happy','😊'],['tired','😴'],['big','🐘'],['small','🐭'],['look','👀'],
    ['listen','👂'],['speak','🗣️'],['write','✏️'],['think','💭'],['surprised','😮']
  ];
  for(const [k,e] of pairs) if(m.includes(k)) return e;
  return '✨';
}

function earlyReaderMeaningChoices(step){
  const count=interactionProfile().choiceCount||2;
  const opts=shuffled([step.m,...distractorMeanings(step,step.lang,count-1)]).slice(0,count);
  return opts.map(o=>{
    const fake={m:o};
    return `<button class="picture-choice" onclick="activeChoice(this,'meaning',${JSON.stringify(o===step.m)})">
      <span class="pic">${meaningEmoji(fake)}</span>
      <span>${escapeHtml(o)}</span>
    </button>`;
  }).join('');
}

// Wrap v13/v20 word renderer: for Teia-like early readers, force low-reading-load recognition/listening
// more often and avoid free typing unless profile later enables it.
const _v22ChooseActiveFormat=chooseActiveFormat;
chooseActiveFormat=function(step){
  if(isEarlyReader()){
    const r=rec(step.lang,step.t); r.proof=r.proof||{};
    if(step.lang==='uk'){
      if(!r.proof.listening) return 'listening';
      if(!r.proof.meaning) return 'meaning';
      return 'listening';
    }
    if(!r.proof.meaning) return 'meaning';
    if(!r.proof.context) return 'meaning';
    // No free typing as a default early-reader requirement.
    return 'meaning';
  }
  return _v22ChooseActiveFormat(step);
};

const _v22RenderActiveWord=renderActiveWord;
renderActiveWord=function(step){
  if(!isEarlyReader()) return _v22RenderActiveWord(step);

  adventureCurrent=step;
  adventureAnswered=false;
  const format=chooseActiveFormat(step);
  step.activeFormat=format;
  const r=rec(step.lang,step.t);
  const isUk=step.lang==='uk';
  const profile=interactionProfile();

  adventureStageBadge.textContent=step.mode==='review'?'MEMORY CHALLENGE':(isUk?'UKRAINIAN DISCOVERY':'WORD DISCOVERY');
  adventureTitle.textContent=step.mode==='review'?'Show Chami what you remember':'Meet a word';
  adventureSpeech.textContent='You can listen first. You do not have to read everything by yourself.';

  if(format==='listening' && isUk){
    const options=shuffled([step.m,...distractorMeanings(step,'uk',1)]).slice(0,2);
    adventureBody.innerHTML=`
      <div class="reward-burst">🎧</div>
      <div class="retrieval-prompt">Listen. What does it mean?</div>
      ${renderProofBadges(r,'uk')}
      <div class="choice-grid">${options.map(o=>`<button class="picture-choice" onclick="activeChoice(this,'listening',${JSON.stringify(o===step.m)})"><span class="pic">${meaningEmoji({m:o})}</span><span>${escapeHtml(o)}</span></button>`).join('')}</div>`;
    adventureActions.innerHTML='<button class="read-aloud-btn" onclick="speakText(adventureCurrent.t,\'uk-UA\')">🔊 Hear it again</button>';
    setTimeout(()=>speakText(step.t,'uk-UA'),250);
    return;
  }

  adventureBody.innerHTML=`
    <div class="adventure-word">${escapeHtml(step.t)}</div>
    ${step.ph?`<div class="adventure-pronunciation">${escapeHtml(step.ph)}</div>`:''}
    <button class="read-aloud-btn" onclick="speakText(adventureCurrent.t,${isUk?"'uk-UA'":"'en-US'"})">🔊 Hear the word</button>
    <div class="retrieval-prompt">Which meaning fits?</div>
    ${renderProofBadges(r,step.lang)}
    <div class="choice-grid">${earlyReaderMeaningChoices(step)}</div>`;
  adventureActions.innerHTML='';
};

// Early reader comprehension: read prompt aloud and use two choices, short text.
const _v22RenderAdventureStep=renderAdventureStep;
renderAdventureStep=function(){
  _v22RenderAdventureStep();
  applyLiteracyMode();

  if(isEarlyReader() && adventureCurrent?.kind==='comprehension'){
    // Existing comprehension already rendered; add read-aloud support and reduce text load.
    const text=adventureBody?.innerText||'';
    if(text && !document.getElementById('readPromptAloud')){
      adventureActions.insertAdjacentHTML('afterbegin',
        `<button id="readPromptAloud" class="read-aloud-btn" onclick="speakEnglishSupport(${JSON.stringify(text)})">🔊 Read this to me</button>`);
    }
    const buttons=[...adventureActions.querySelectorAll('.adventure-choice')];
    buttons.slice(2).forEach(b=>b.style.display='none');
  }
};

// Expressive tasks become tap/speak first for early readers.
const _v22ChooseTransfer=chooseTransferTask;
chooseTransferTask=function(){
  const task=_v22ChooseTransfer();
  if(!task) return task;
  if(isEarlyReader()){
    if(task.lang==='en'){
      return {
        kind:'expressiveVoice',
        prompt:`Say a tiny sentence with “${task.item.t}”.`,
        hint:task.item.m,
        item:task.item,lang:'en',estimatedSeconds:50
      };
    }
  }
  return task;
};

// Word-family mini learning for fluent reader, auditory family noticing for early reader.
function renderMorphologyMoment(item){
  const family=window.ChamiQuality.familyCluster(item);
  if(family.length<2) return '';
  if(isEarlyReader()){
    return `<div class="morph-card"><b>Word family:</b><br>${family.map(x=>`<span class="decoding-chip">${escapeHtml(x)}</span>`).join('')}
      <button class="read-aloud-btn" onclick="speakEnglishSupport(${JSON.stringify(family.join('. '))})">🔊 Hear the family</button></div>`;
  }
  return `<div class="morph-card"><b>Word family:</b> ${family.map(x=>`<span class="decoding-chip">${escapeHtml(x)}</span>`).join('')}</div>`;
}

// Add morphology after successful English response, without extending mastery claims.
const _v22ActiveChoice=activeChoice;
activeChoice=function(btn,format,ok){
  const item=adventureCurrent;
  _v22ActiveChoice(btn,format,ok);
  if(ok && item?.lang==='en'){
    const extra=renderMorphologyMoment(item);
    if(extra) adventureFeedback.insertAdjacentHTML('beforeend',extra);
  }
};

// Parent view: literacy delivery + validator.
function renderDeliveryMode(){
  if(!document.getElementById('deliverySignals')) return;
  const prof=interactionProfile();
  const name=childDisplayName();
  deliveryTitle.textContent=`How Chami presents learning to ${name}`;
  deliverySignals.innerHTML=`
    <div class="intel-signal">
      <div class="label">Reading mode</div>
      <div class="value" style="font-size:19px">${prof.mode==='early_reader'?'Early reader':'Fluent child reader'}</div>
      <div class="note">${prof.mode==='early_reader'?'Audio-supported, short text, large tap choices.':'More independent reading and written response.'}</div>
    </div>
    <div class="intel-signal">
      <div class="label">Free typing</div>
      <div class="value" style="font-size:19px">${prof.allowFreeTyping?'Available':'Not required'}</div>
      <div class="note">Typing should never block vocabulary or reasoning progress.</div>
    </div>`;
  const issues=window.ChamiQuality.validateDataset(DATA);
  qualityValidation.innerHTML=issues.length
    ? `<div class="calibration-note"><b>Curriculum validator:</b> ${issues.length} metadata issue${issues.length===1?'':'s'} found for future cleanup. The app can continue using valid items.</div>`
    : `<div class="calibration-note"><b>Curriculum validator:</b> current dataset passed structural checks.</div>`;
}

const _v22RenderAll=renderAll;
renderAll=function(){
  _v22RenderAll();
  applyLiteracyMode();
  renderDeliveryMode();
};
setTimeout(()=>{try{applyLiteracyMode();renderDeliveryMode();}catch(e){}},180);


/* =========================================================
   v23 — Literacy Calibration & Multimodal Scaffolding
   ========================================================= */

function configuredReadingStage(){
  return window.CHAMI_FAMILY?.children?.[state.child]?.literacy?.englishReadingStage || 'early_reader';
}

function literacyProfile(){
  return window.ChamiLiteracy.summary(p(),configuredReadingStage()).support;
}

const _v23BaseInteractionProfile=interactionProfile;
function adaptiveInteractionProfile(){
  const base=_v23BaseInteractionProfile();
  const lit=literacyProfile();
  return {
    ...base,
    mode:lit.stage,
    preferAudio:lit.readAloud || base.preferAudio,
    allowFreeTyping:lit.allowFreeTyping,
    choiceCount:lit.choiceCount,
    maxSentenceWords:lit.sentenceWords,
    largeTargets:lit.stage!=='fluent_child_reader',
    decodingScaffold:lit.decodingScaffold,
    preferVoice:lit.preferVoice,
    scaffoldLevel:lit.scaffoldLevel,
    autoSpeak:lit.autoSpeak,
    showWordParts:lit.showWordParts,
    showTargetWord:lit.showTargetWord,
    optionalAudio:lit.optionalAudio
  };
}

// v23 uses the literacy model rather than only static family configuration.
interactionProfile = adaptiveInteractionProfile;

function recordLiteracy(kind,ok){
  window.ChamiLiteracy.observe(p(),kind,Boolean(ok));
  save();
}

function syllableLikeChunks(word){
  return window.ChamiPhonics.parts(word);
}

function readingScaffoldHtml(word){
  if(!interactionProfile().decodingScaffold) return '';
  const chunks=syllableLikeChunks(word);
  return `<div class="reading-helper">
    <div class="tiny" style="text-align:center">Try these spelling parts:</div>
    <div class="segment-strip">${chunks.map(c=>`<span class="segment">${escapeHtml(c)}</span>`).join('')}</div>
    <button class="read-aloud-btn" onclick="speakEnglishSupport(${JSON.stringify(word)})">🔊 Hear it</button>
  </div>`;
}

// Observe objective English choices as literacy mechanics evidence separately from vocabulary evidence.
const _v23ActiveChoice = activeChoice;
activeChoice=function(btn,format,ok){
  const item=adventureCurrent;
  _v23ActiveChoice(btn,format,ok);
  if(item?.lang==='en'){
    if(format==='meaning') recordLiteracy('printedWordRecognition',ok);
    if(format==='context') recordLiteracy('shortSentenceRead',ok);
    recordLiteracy('tapAccuracy',ok);
  }
};

// Observe typing separately.
const _v23CheckActiveRecall = checkActiveRecall;
checkActiveRecall=function(){
  const before=adventureAnswered;
  const item=adventureCurrent;
  const input=document.getElementById('activeRecallInput');
  const guess=normalizeRecall(input?.value);
  const target=item ? normalizeRecall(item.t) : '';
  _v23CheckActiveRecall();
  if(!before && adventureAnswered && item?.lang==='en'){
    recordLiteracy('typingAttempt',guess===target);
  }
};

// Enhance early/developing reader word display with optional decoding scaffold.
const _v23RenderActiveWord=renderActiveWord;
renderActiveWord=function(step){
  _v23RenderActiveWord(step);
  const prof=interactionProfile();
  if(step.lang==='en' && prof.decodingScaffold){
    const host=document.querySelector('#adventureBody .adventure-word');
    if(host && !document.getElementById('v23ReadingScaffold')){
      const wrap=document.createElement('div');
      wrap.id='v23ReadingScaffold';
      wrap.innerHTML=readingScaffoldHtml(step.t);
      host.insertAdjacentElement('afterend',wrap);
    }
  }
};

// Multimodal mini-decoding task: audio -> choose printed word.
function chooseDecodingTask(){
  if(interactionProfile().mode==='fluent_child_reader') return null;
  const items=(DATA[state.child]?.en||[]).filter(w=>rec('en',w.t).seen>0);
  if(!items.length) return null;
  const item=items[Math.floor(Math.random()*items.length)];
  return {kind:'decodeWord',item,lang:'en',estimatedSeconds:45};
}

const _v23BuildSmartPlan=buildSmartPlan;
buildSmartPlan=function(){
  const plan=_v23BuildSmartPlan();
  if(state.custody!=='mom' || !smartSession) return plan;
  const decoding=chooseDecodingTask();
  if(!decoding) return plan;

  // Replace one reading-heavy application slot for early/developing readers.
  let i=plan.findIndex(x=>x.kind==='comprehension');
  if(i<0) i=plan.findIndex(x=>x.kind==='story');
  if(i>=0){
    const old=plan[i];
    plan[i]=decoding;
    smartSession.plannedSeconds=Math.max(
      smartSession.usedSeconds,
      smartSession.plannedSeconds-(old.estimatedSeconds||55)+decoding.estimatedSeconds
    );
  }
  return plan;
};
generateAdventurePlan=buildSmartPlan;

function renderDecodeWord(step){
  adventureStageBadge.textContent='LISTEN & FIND';
  adventureTitle.textContent='Which word did Chami say?';
  adventureSpeech.textContent='Listen first. Then find the printed word.';
  const pool=(DATA[state.child]?.en||[]).filter(x=>x.t!==step.item.t && (x.difficulty||1)<=((step.item.difficulty||1)+1));
  const distractor=pool[Math.floor(Math.random()*Math.max(1,pool.length))] || {t:'garden'};
  const opts=shuffled([step.item.t,distractor.t]).slice(0,2);

  adventureBody.innerHTML=`
    <div class="expressive-card">
      <div class="transfer-scene">👂➡️📖</div>
      <button class="read-aloud-btn" onclick="speakEnglishSupport(${JSON.stringify(step.item.t)})">🔊 Hear the word</button>
      <div class="large-tap-grid">
        ${opts.map(o=>`<button onclick="answerDecodeWord(this,${JSON.stringify(o===step.item.t)})">${escapeHtml(o)}</button>`).join('')}
      </div>
      ${readingScaffoldHtml(step.item.t)}
    </div>`;
  adventureActions.innerHTML='<button class="ghost" onclick="adventureNext()">Skip</button>';
  setTimeout(()=>speakEnglishSupport(step.item.t),250);
}

function answerDecodeWord(btn,ok){
  if(adventureAnswered) return;
  adventureAnswered=true;
  btn.classList.add(ok?'correct-choice':'wrong-choice');
  recordLiteracy('heardWord',true);
  recordLiteracy('tapAccuracy',ok);
  recordPhonics('printedWordMatch',ok);

  adventureFeedback.style.display='block';
  adventureFeedback.innerHTML=ok
    ? `Yes — you matched the sound to <b>${escapeHtml(adventureCurrent.item.t)}</b>.`
    : `That printed word was <b>${escapeHtml(adventureCurrent.item.t)}</b>. Listen once more and notice its shape.`;
  chamiReact(ok?'correct':'listen');
  if(ok) soundCorrect();
  adventureActions.innerHTML='<button onclick="adventureNext()">Continue →</button>';
}

// Early-reader expressive task choice should follow calibrated support.
const _v23ChooseTransferTask=chooseTransferTask;
chooseTransferTask=function(){
  const task=_v23ChooseTransferTask();
  if(!task) return task;
  const prof=interactionProfile();
  if(task.lang==='en' && prof.preferVoice){
    return {
      kind:'expressiveVoice',
      prompt:`Say a tiny sentence with “${task.item.t}”.`,
      hint:task.item.m,
      item:task.item,lang:'en',estimatedSeconds:50
    };
  }
  if(task.lang==='en' && !prof.allowFreeTyping && task.kind!=='expressiveVoice'){
    task.kind='expressiveVoice';
  }
  return task;
};

const _v23RenderAdventureStep=renderAdventureStep;
renderAdventureStep=function(){
  const step=adventurePlan[adventureIndex];
  if(step?.kind==='decodeWord'){
    adventureCurrent=step;adventureAnswered=false;
    adventureStepCount.textContent=`${Math.min(adventureIndex+1,adventurePlan.length)} / ${adventurePlan.length}`;
    adventureProgressBar.style.width=`${((adventureIndex)/Math.max(1,adventurePlan.length-1))*100}%`;
    adventureFeedback.style.display='none';
    renderDecodeWord(step);
    markStepTime(step);updateAdventureTime();startCalibrationStep(step);
    applyLiteracyMode();
    return;
  }
  _v23RenderAdventureStep();
};

// Parent literacy calibration view.
function renderLiteracyCalibration(){
  if(!document.getElementById('literacySignals')) return;
  const s=window.ChamiLiteracy.summary(p(),configuredReadingStage());
  const m=s.model, sup=s.support;
  const name=childDisplayName();

  literacyTitle.textContent=`${name}'s reading & input readiness`;

  const rate=(n,d)=>d?Math.round(n/d*100):0;
  const typingRate=rate(m.typingSuccess,m.typingAttempt);
  const readingEvidence=m.printedWordRecognition+m.shortSentenceRead+m.decodingSuccess;

  literacySignals.innerHTML=`
    <div class="intel-signal">
      <div class="label">Current delivery stage</div>
      <div class="value" style="font-size:19px">${escapeHtml(sup.stage.replaceAll('_',' '))}</div>
      <div class="note">Controls text load and input mechanics, not curriculum ceiling.</div>
    </div>
    <div class="intel-signal">
      <div class="label">Reading evidence</div>
      <div class="value">${readingEvidence}</div>
      <div class="note">Printed recognition + short reading + decoding successes.</div>
    </div>
    <div class="intel-signal">
      <div class="label">Typing success</div>
      <div class="value">${m.typingAttempt?typingRate+'%':'—'}</div>
      <div class="note">${m.typingAttempt||0} typing attempt${m.typingAttempt===1?'':'s'} recorded.</div>
    </div>
    <div class="intel-signal">
      <div class="label">Audio support</div>
      <div class="value" style="font-size:19px">${sup.readAloud?'High':'Optional'}</div>
      <div class="note">Read-aloud fades only when mechanics no longer need it.</div>
    </div>`;

  literacyNote.innerHTML=`
    <div class="calibration-note">
      <b>Important:</b> Chami does not interpret slow decoding or clumsy typing as low vocabulary ability.
      Delivery can become easier while the language/reasoning target stays challenging.
    </div>`;
}

const _v23RenderAll=renderAll;
renderAll=function(){
  _v23RenderAll();
  renderLiteracyCalibration();
};
setTimeout(()=>{try{renderLiteracyCalibration();}catch(e){}},200);


/* =========================================================
   v24 — Phonics, Tactile Practice & Scaffold Fade-Out
   ========================================================= */

const V24_PHONICS_STEP_KINDS=['phonicsWordMatch','phonicsPatternMatch','phonicsBuild'];
const V24_MODEL_KIND={
  phonicsWordMatch:'printedWordMatch',
  phonicsPatternMatch:'patternMatch',
  phonicsBuild:'wordBuild'
};

function recordPhonics(kind,ok){
  window.ChamiLiteracy.observePhonics(p(),kind,Boolean(ok));
  save();
}

function v24PhonicsPool(){
  return (DATA[state.child]?.en||[]).filter(window.ChamiPhonics.eligible);
}

function v24PlannedEnglishItems(plan){
  const items=[];
  for(const step of plan||[]){
    if(step.lang!=='en') continue;
    if(step.kind==='word' && step.t) items.push(step);
    if(step.kind==='placement' && step.candidate) items.push(step.candidate);
  }
  return items;
}

function chooseV24PhonicsItem(plan,modelKind){
  const pool=v24PhonicsPool();
  const seen=pool.filter(item=>rec('en',item.t).seen>0);
  const ordered=[...seen,...v24PlannedEnglishItems(plan),...pool];
  const unique=[];
  const used=new Set();
  for(const item of ordered){
    if(!window.ChamiPhonics.eligible(item) || used.has(item.t)) continue;
    used.add(item.t);unique.push(item);
  }
  if(modelKind==='patternMatch'){
    return unique.find(item=>window.ChamiPhonics.focusPattern(item.t))||null;
  }
  if(modelKind==='wordBuild'){
    return unique.find(item=>window.ChamiPhonics.parts(item.t).length>=2)||null;
  }
  return unique[0]||null;
}

function chooseV24PhonicsTask(plan){
  const modelKind=window.ChamiLiteracy.nextPhonicsKind(p(),configuredReadingStage());
  if(!modelKind) return null;
  let item=chooseV24PhonicsItem(plan,modelKind);
  let actualKind=modelKind;
  if(!item){
    actualKind='printedWordMatch';
    item=chooseV24PhonicsItem(plan,actualKind);
  }
  if(!item) return null;
  const kind=actualKind==='patternMatch'?'phonicsPatternMatch':(actualKind==='wordBuild'?'phonicsBuild':'phonicsWordMatch');
  return {
    kind,item,lang:'en',
    supportLevel:window.ChamiLiteracy.scaffoldLevel(p(),configuredReadingStage()),
    estimatedSeconds:secondsFor(kind)
  };
}

const _v24BuildSmartPlan=buildSmartPlan;
buildSmartPlan=function(){
  const plan=_v24BuildSmartPlan();
  if(state.custody!=='mom' || !smartSession) return plan;
  const phonics=chooseV24PhonicsTask(plan);
  if(!phonics) return plan;

  let index=plan.findIndex(step=>step.kind==='decodeWord');
  if(index<0) index=plan.findIndex(step=>['comprehension','story'].includes(step.kind));
  if(index<0){
    const englishPlacements=plan
      .map((step,i)=>({step,i}))
      .filter(x=>x.step.kind==='placement' && x.step.lang==='en');
    if(englishPlacements.length>1) index=englishPlacements[englishPlacements.length-1].i;
  }
  if(index<0) return plan;

  const previous=plan[index];
  plan[index]=phonics;
  smartSession.plannedSeconds=Math.max(
    smartSession.usedSeconds,
    smartSession.plannedSeconds-(previous.estimatedSeconds||55)+phonics.estimatedSeconds
  );
  return plan;
};
generateAdventurePlan=buildSmartPlan;

function v24SupportLabel(level){
  return ({full:'Full help',guided:'Guided help',light:'Light help',independent:'Independent'})[level]||'Guided help';
}

function v24SupportBanner(step){
  return `<div class="phonics-support-row">
    <span class="phonics-support-pill ${escapeHtml(step.supportLevel)}">${v24SupportLabel(step.supportLevel)}</span>
    <span class="tiny">Chami changes the help from real decoding practice.</span>
  </div>`;
}

function v24PartsHtml(word){
  return `<div class="segment-strip">${window.ChamiPhonics.parts(word).map(part=>`<span class="segment">${escapeHtml(part)}</span>`).join('')}</div>`;
}

function v24ReplayButton(word){
  return `<button class="read-aloud-btn phonics-replay" onclick="speakEnglishSupport(${JSON.stringify(word)})">🔊 Hear the whole word</button>`;
}

function renderV24WordMatch(step){
  const support=step.supportLevel;
  const count=support==='full'?2:3;
  const options=shuffled(window.ChamiPhonics.wordOptions(step.item,v24PhonicsPool(),count)).slice(0,count);
  const first=window.ChamiPhonics.tokenize(step.item.t)[0]||step.item.t[0];
  adventureStageBadge.textContent='HEAR & TAP';
  adventureTitle.textContent='Tap the word Chami says';
  adventureSpeech.textContent=support==='full'?'Listen. I will give you a small first-part clue.':'Listen to the whole word, then decode the choices.';
  adventureBody.innerHTML=`
    <div class="phonics-card">
      ${v24SupportBanner(step)}
      <div class="phonics-icon">👂 → 👆</div>
      ${support==='full'?`<div class="phonics-cue">It starts with <b>${escapeHtml(first)}</b>.</div>`:''}
      ${v24ReplayButton(step.item.t)}
      <div class="large-tap-grid phonics-choice-grid">
        ${options.map(item=>`<button class="phonics-choice" onclick="answerV24PhonicsChoice(this,${JSON.stringify(item.t===step.item.t)})">${escapeHtml(item.t)}</button>`).join('')}
      </div>
    </div>`;
  adventureActions.innerHTML='<button class="ghost" onclick="adventureNext()">Skip</button>';
  if(['full','guided'].includes(support)) setTimeout(()=>speakEnglishSupport(step.item.t),250);
}

function renderV24PatternMatch(step){
  const support=step.supportLevel;
  const count=support==='full'?2:3;
  const target=window.ChamiPhonics.focusPattern(step.item.t);
  const options=shuffled(window.ChamiPhonics.patternOptions(step.item.t,v24PhonicsPool().map(x=>x.t),count)).slice(0,count);
  step.phonicsTargetPattern=target;
  adventureStageBadge.textContent='LETTER-TEAM MATCH';
  adventureTitle.textContent='Find the spelling pattern';
  adventureSpeech.textContent='Hear the whole word. Then tap the letter team you can see inside it.';
  adventureBody.innerHTML=`
    <div class="phonics-card">
      ${v24SupportBanner(step)}
      <div class="phonics-focus-word">${escapeHtml(step.item.t)}</div>
      ${v24ReplayButton(step.item.t)}
      <div class="large-tap-grid phonics-choice-grid">
        ${options.map(pattern=>`<button class="phonics-choice letter-team" onclick="answerV24PhonicsChoice(this,${JSON.stringify(pattern===target)})">${escapeHtml(pattern)}</button>`).join('')}
      </div>
    </div>`;
  adventureActions.innerHTML='<button class="ghost" onclick="adventureNext()">Skip</button>';
  if(['full','guided'].includes(support)) setTimeout(()=>speakEnglishSupport(step.item.t),250);
}

function renderV24Build(step){
  const support=step.supportLevel;
  const parts=window.ChamiPhonics.parts(step.item.t);
  const tiles=shuffled(parts.map((part,sequence)=>({part,sequence})));
  step.phonicsParts=parts;
  step.phonicsTiles=tiles;
  step.phonicsBuildIndex=0;

  adventureStageBadge.textContent='TAP & BUILD';
  adventureTitle.textContent='Build the word in order';
  adventureSpeech.textContent=support==='full'?'Copy the word by tapping its parts in order.':'Listen, then tap the word parts in order.';
  adventureBody.innerHTML=`
    <div class="phonics-card">
      ${v24SupportBanner(step)}
      <div class="phonics-icon">👂 → 🧩</div>
      ${support==='full'?`<div class="phonics-copy-model">${escapeHtml(step.item.t)}</div>${v24PartsHtml(step.item.t)}`:''}
      ${support==='guided'?`<div class="phonics-copy-model">${escapeHtml(step.item.t)}</div>`:''}
      ${support==='light'?`<div class="phonics-cue">It starts with <b>${escapeHtml(step.item.t[0])}</b>.</div>`:''}
      ${v24ReplayButton(step.item.t)}
      <div class="word-builder phonics-builder" aria-label="Built word">
        ${parts.map((part,index)=>`<span id="phonicsSlot${index}" class="word-slot phonics-slot" aria-label="part ${index+1}"></span>`).join('')}
      </div>
      <div class="tile-bank phonics-tile-bank">
        ${tiles.map((tile,index)=>`<button class="phonics-tile" onclick="tapV24PhonicsTile(this,${index})">${escapeHtml(tile.part)}</button>`).join('')}
      </div>
    </div>`;
  adventureActions.innerHTML='<button class="ghost" onclick="adventureNext()">Skip</button>';
  if(['full','guided'].includes(support)) setTimeout(()=>speakEnglishSupport(step.item.t),250);
}

function renderV24PhonicsStep(step){
  adventureCharacter.src='assets/chami.png';
  if(step.kind==='phonicsPatternMatch') renderV24PatternMatch(step);
  else if(step.kind==='phonicsBuild') renderV24Build(step);
  else renderV24WordMatch(step);
}

function finishV24Phonics(ok){
  if(adventureAnswered) return;
  adventureAnswered=true;
  const step=adventureCurrent;
  const modelKind=V24_MODEL_KIND[step.kind];
  recordPhonics(modelKind,ok);
  adventureBody.querySelectorAll('.phonics-choice,.phonics-tile').forEach(button=>button.disabled=true);
  adventureFeedback.style.display='block';
  adventureFeedback.innerHTML=ok
    ? `Yes — you decoded <b>${escapeHtml(step.item.t)}</b>.${v24PartsHtml(step.item.t)}`
    : `That one needs more help. Here is <b>${escapeHtml(step.item.t)}</b> in reading parts:${v24PartsHtml(step.item.t)}`;
  chamiReact(ok?'correct':'listen');
  if(ok) soundCorrect();
  adventureActions.innerHTML='<button onclick="adventureNext()">Continue →</button>';
  applyLiteracyMode();
  renderLiteracyCalibration();
}

function answerV24PhonicsChoice(button,ok){
  if(adventureAnswered) return;
  button.classList.add(ok?'correct-choice':'wrong-choice');
  finishV24Phonics(Boolean(ok));
}

function tapV24PhonicsTile(button,tileIndex){
  if(adventureAnswered) return;
  const step=adventureCurrent;
  const tile=step.phonicsTiles?.[tileIndex];
  const expected=step.phonicsBuildIndex||0;
  if(!tile || tile.sequence!==expected){
    button.classList.add('wrong-choice');
    (step.phonicsParts||[]).forEach((part,index)=>{
      const slot=document.getElementById(`phonicsSlot${index}`);
      if(slot) slot.textContent=part;
    });
    finishV24Phonics(false);
    return;
  }
  const slot=document.getElementById(`phonicsSlot${expected}`);
  if(slot){ slot.textContent=tile.part; slot.classList.add('filled'); }
  button.disabled=true;
  button.classList.add('selected');
  step.phonicsBuildIndex=expected+1;
  if(step.phonicsBuildIndex>=step.phonicsParts.length) finishV24Phonics(true);
}

const _v24RenderAdventureStep=renderAdventureStep;
renderAdventureStep=function(){
  const step=adventurePlan[adventureIndex];
  if(step && V24_PHONICS_STEP_KINDS.includes(step.kind)){
    adventureCurrent=step;
    adventureAnswered=false;
    adventureStepCount.textContent=`${Math.min(adventureIndex+1,adventurePlan.length)} / ${adventurePlan.length}`;
    adventureProgressBar.style.width=`${(adventureIndex/Math.max(1,adventurePlan.length-1))*100}%`;
    adventureFeedback.style.display='none';
    renderV24PhonicsStep(step);
    markStepTime(step);
    updateAdventureTime();
    startCalibrationStep(step);
    applyLiteracyMode();
    return;
  }
  _v24RenderAdventureStep();
};

// v24 makes the body sizing follow actual support rather than a fixed child label.
applyLiteracyMode=function(){
  const profile=interactionProfile();
  document.body.classList.toggle('early-reader',Boolean(profile.largeTargets));
  document.body.dataset.scaffold=profile.scaffoldLevel||'guided';
};

function v24Percent(successes,attempts){
  return attempts?`${Math.round(successes/attempts*100)}%`:'—';
}

renderLiteracyCalibration=function(){
  const signals=document.getElementById('literacySignals');
  const note=document.getElementById('literacyNote');
  const title=document.getElementById('literacyTitle');
  if(!signals || !note || !title) return;
  const summary=window.ChamiLiteracy.summary(p(),configuredReadingStage());
  const m=summary.model;
  const sup=summary.support;
  const ph=summary.phonics;
  const name=childDisplayName();
  const stageLabel=sup.stage.replaceAll('_',' ');
  title.textContent=`${name}'s reading & input readiness`;
  signals.innerHTML=`
    <div class="intel-signal">
      <div class="label">Current delivery stage</div>
      <div class="value v24-stage-value">${escapeHtml(stageLabel)}</div>
      <div class="note">Controls text and input mechanics, never the vocabulary or reasoning ceiling.</div>
    </div>
    <div class="intel-signal">
      <div class="label">Decoding support</div>
      <div class="value v24-stage-value">${escapeHtml(v24SupportLabel(sup.scaffoldLevel))}</div>
      <div class="note">Fades after varied success and returns automatically after struggle.</div>
    </div>
    <div class="intel-signal">
      <div class="label">Phonics evidence</div>
      <div class="value">${ph.attempts?v24Percent(ph.successes,ph.attempts):'—'}</div>
      <div class="note">${ph.attempts} attempt${ph.attempts===1?'':'s'} across ${ph.variedKinds} practiced activity type${ph.variedKinds===1?'':'s'}.</div>
    </div>
    <div class="intel-signal">
      <div class="label">Typing success</div>
      <div class="value">${v24Percent(m.mechanics.typing.successes,m.mechanics.typing.attempts)}</div>
      <div class="note">Typing is tracked separately and never blocks language progress.</div>
    </div>`;
  note.innerHTML=`
    <div class="calibration-note"><b>Practice balance:</b>
      hear-and-tap ${ph.activities.printedWordMatch.attempts},
      letter-team match ${ph.activities.patternMatch.attempts},
      word build ${ph.activities.wordBuild.attempts}.
    </div>`;
};

renderDeliveryMode=function(){
  const signals=document.getElementById('deliverySignals');
  const title=document.getElementById('deliveryTitle');
  const quality=document.getElementById('qualityValidation');
  if(!signals || !title || !quality) return;
  const profile=interactionProfile();
  const name=childDisplayName();
  title.textContent=`How Chami presents learning to ${name}`;
  signals.innerHTML=`
    <div class="intel-signal">
      <div class="label">Reading mode</div>
      <div class="value v24-stage-value">${escapeHtml(profile.mode.replaceAll('_',' '))}</div>
      <div class="note">Text load follows reading mechanics while concept difficulty stays separate.</div>
    </div>
    <div class="intel-signal">
      <div class="label">Response mode</div>
      <div class="value v24-stage-value">${profile.allowFreeTyping?'Typing available':'Tap / speak first'}</div>
      <div class="note">Every decoding activity works with taps; dragging is never required.</div>
    </div>`;
  const issues=window.ChamiQuality.validateDataset(DATA);
  quality.innerHTML=issues.length
    ? `<div class="calibration-note"><b>Curriculum validator:</b> ${issues.length} metadata issue${issues.length===1?'':'s'} found for future cleanup.</div>`
    : '<div class="calibration-note"><b>Curriculum validator:</b> current dataset passed structural checks.</div>';
};

setTimeout(()=>{try{applyLiteracyMode();renderDeliveryMode();renderLiteracyCalibration();}catch(e){}},220);
