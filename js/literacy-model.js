/* Chami v24 — literacy mechanics and scaffold policy.
   This model controls delivery support only. It must never lower vocabulary or reasoning targets. */

window.ChamiLiteracy = (() => {
  const PHONICS_KINDS=['printedWordMatch','patternMatch','wordBuild'];
  const READING_KINDS=['printedWordRecognition','shortSentenceRead','decodingSuccess'];

  function metric(){ return {attempts:0,successes:0,recent:[]}; }

  function normalizeMetric(value){
    const m=value && typeof value==='object' ? value : metric();
    m.attempts=Number.isFinite(m.attempts)?m.attempts:0;
    m.successes=Number.isFinite(m.successes)?m.successes:0;
    m.recent=Array.isArray(m.recent)?m.recent.slice(-12):[];
    return m;
  }

  function ensure(profile){
    profile.literacyModel=profile.literacyModel||{};
    const root=profile.literacyModel;
    root.english=root.english||{};
    const m=root.english;

    for(const key of ['heardWord','printedWordRecognition','shortSentenceRead','decodingSuccess','typingAttempt','typingSuccess','tapAccuracy']){
      if(!Number.isFinite(m[key])) m[key]=0;
    }
    if(!Number.isFinite(m.samples)) m.samples=0;

    m.mechanics=m.mechanics||{};
    for(const key of [...READING_KINDS,'typing','tapAccuracy']){
      m.mechanics[key]=normalizeMetric(m.mechanics[key]);
    }

    // Preserve useful aggregate evidence from v23 when a saved profile first migrates.
    if(!m.v24Migrated){
      for(const key of READING_KINDS){
        const successes=Math.max(0,Number(m[key])||0);
        if(!m.mechanics[key].attempts && successes){
          m.mechanics[key].attempts=successes;
          m.mechanics[key].successes=successes;
        }
      }
      if(!m.mechanics.typing.attempts && m.typingAttempt){
        m.mechanics.typing.attempts=m.typingAttempt;
        m.mechanics.typing.successes=Math.min(m.typingAttempt,m.typingSuccess||0);
      }
      m.v24Migrated=true;
    }

    m.phonics=m.phonics||{activities:{},recent:[]};
    m.phonics.activities=m.phonics.activities||{};
    m.phonics.recent=Array.isArray(m.phonics.recent)?m.phonics.recent.slice(-12):[];
    for(const kind of PHONICS_KINDS){
      m.phonics.activities[kind]=normalizeMetric(m.phonics.activities[kind]);
    }
    return root;
  }

  function addResult(target,ok){
    target.attempts+=1;
    if(ok) target.successes+=1;
    target.recent.push(ok?1:0);
    target.recent=target.recent.slice(-12);
  }

  function observe(profile,kind,ok){
    const m=ensure(profile).english;
    const success=Boolean(ok);
    m.samples+=1;

    if(kind==='typingAttempt'){
      m.typingAttempt+=1;
      if(success) m.typingSuccess+=1;
      addResult(m.mechanics.typing,success);
      return;
    }
    if(kind==='typingSuccess'){
      // Kept for backward-compatible callers; v24 records typing as one attempt.
      if(success) m.typingSuccess+=1;
      return;
    }
    if(kind==='tapAccuracy'){
      if(success) m.tapAccuracy+=1;
      addResult(m.mechanics.tapAccuracy,success);
      return;
    }
    if(kind==='heardWord'){
      if(success) m.heardWord+=1;
      return;
    }
    if(READING_KINDS.includes(kind)){
      if(success) m[kind]+=1;
      addResult(m.mechanics[kind],success);
    }
  }

  function observePhonics(profile,kind,ok){
    if(!PHONICS_KINDS.includes(kind)) return false;
    const m=ensure(profile).english;
    const success=Boolean(ok);
    addResult(m.phonics.activities[kind],success);
    m.phonics.recent.push(success?1:0);
    m.phonics.recent=m.phonics.recent.slice(-12);

    m.samples+=1;
    if(success) m.decodingSuccess+=1;
    addResult(m.mechanics.decodingSuccess,success);
    return true;
  }

  function rate(metricRecord){
    return metricRecord.attempts ? metricRecord.successes/metricRecord.attempts : 0;
  }

  function aggregate(records){
    const attempts=records.reduce((sum,x)=>sum+x.attempts,0);
    const successes=records.reduce((sum,x)=>sum+x.successes,0);
    return {attempts,successes,rate:attempts?successes/attempts:0};
  }

  function stage(profile,configured){
    const m=ensure(profile).english;
    if(configured==='fluent_child_reader') return 'fluent_child_reader';
    const reading=READING_KINDS.map(k=>m.mechanics[k]);
    const total=aggregate(reading);
    const varied=reading.filter(x=>x.attempts>=4).length;
    if(total.attempts>=36 && varied>=3 && total.rate>=0.85) return 'fluent_child_reader';
    if(total.attempts>=12 && varied>=2 && total.rate>=0.72) return 'developing_reader';
    return configured==='developing_reader'?'developing_reader':'early_reader';
  }

  function phonicsSummary(profile){
    const p=ensure(profile).english.phonics;
    const records=PHONICS_KINDS.map(k=>p.activities[k]);
    const total=aggregate(records);
    const recent=p.recent;
    const recentRate=recent.length?recent.reduce((a,b)=>a+b,0)/recent.length:null;
    return {
      attempts:total.attempts,
      successes:total.successes,
      rate:total.rate,
      recentRate,
      variedKinds:records.filter(x=>x.attempts>=3).length,
      activities:p.activities,
      recent:[...recent]
    };
  }

  function scaffoldLevel(profile,configured){
    const s=phonicsSummary(profile);
    if(configured==='fluent_child_reader' && s.attempts<6) return 'independent';

    let level='full';
    const allReady=PHONICS_KINDS.every(k=>s.activities[k].attempts>=6 && rate(s.activities[k])>=0.75);
    if(s.attempts>=6 && s.variedKinds>=2 && s.rate>=0.60) level='guided';
    if(s.attempts>=14 && s.variedKinds>=3 && s.rate>=0.76) level='light';
    if(s.attempts>=24 && allReady && s.recent.length>=8 && s.recentRate>=0.85) level='independent';

    // Hysteresis: support returns quickly after a short run of struggle.
    const last3=s.recent.slice(-3);
    const last4=s.recent.slice(-4);
    if(last3.length===3 && last3.every(x=>x===0)) return 'full';
    if(last4.length===4 && last4.reduce((a,b)=>a+b,0)<=2 && ['light','independent'].includes(level)) return 'guided';
    if(s.recent.slice(-2).length===2 && s.recent.slice(-2).every(x=>x===0) && level==='independent') return 'guided';
    return level;
  }

  function support(profile,configured){
    const currentStage=stage(profile,configured);
    const scaffold=scaffoldLevel(profile,configured);
    const full=scaffold==='full';
    const guided=scaffold==='guided';
    const light=scaffold==='light';
    const fluent=currentStage==='fluent_child_reader';
    return {
      stage:currentStage,
      scaffoldLevel:scaffold,
      choiceCount:full?2:3,
      readAloud:full||guided,
      autoSpeak:full||guided,
      preferVoice:currentStage==='early_reader',
      allowFreeTyping:fluent || currentStage==='developing_reader',
      sentenceWords:fluent?14:(currentStage==='developing_reader'?9:6),
      decodingScaffold:full||guided,
      showWordParts:full||guided,
      showTargetWord:full,
      largeTargets:!fluent || !['light','independent'].includes(scaffold),
      optionalAudio:light||scaffold==='independent'
    };
  }

  function nextPhonicsKind(profile,configured){
    if(scaffoldLevel(profile,configured)==='independent') return null;
    const activities=ensure(profile).english.phonics.activities;
    return [...PHONICS_KINDS].sort((a,b)=>activities[a].attempts-activities[b].attempts || PHONICS_KINDS.indexOf(a)-PHONICS_KINDS.indexOf(b))[0];
  }

  function summary(profile,configured){
    const m=ensure(profile).english;
    return {model:m,support:support(profile,configured),phonics:phonicsSummary(profile)};
  }

  return {
    ensure,observe,observePhonics,stage,support,summary,phonicsSummary,scaffoldLevel,nextPhonicsKind,
    PHONICS_KINDS:[...PHONICS_KINDS]
  };
})();
