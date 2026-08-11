/* Chami v22 — curriculum quality + literacy-aware delivery */
window.ChamiQuality=(()=>{
  function childConfig(childId){
    return window.CHAMI_FAMILY?.children?.[childId]?.literacy || {};
  }

  function interactionProfile(childId){
    const l=childConfig(childId);
    if(l.englishReadingStage==="early_reader"){
      return {
        mode:"early_reader",
        preferAudio:true,
        allowFreeTyping:Boolean(l.allowFreeTyping),
        choiceCount:2,
        maxSentenceWords:l.maxIndependentSentenceWords||6,
        largeTargets:true
      };
    }
    return {
      mode:"fluent_reader",
      preferAudio:Boolean(l.preferAudioSupport),
      allowFreeTyping:l.allowFreeTyping!==false,
      choiceCount:3,
      maxSentenceWords:l.maxIndependentSentenceWords||14,
      largeTargets:false
    };
  }

  function validateItem(item,lang){
    const issues=[];
    if(!item?.t) issues.push("missing target");
    if(!item?.m) issues.push("missing meaning");
    if(!item?.difficulty) issues.push("missing difficulty");
    if(lang==="en"){
      if(!item?.e) issues.push("missing example");
      if(!item?.pos) issues.push("missing part of speech");
      if(!item?.morphology) issues.push("missing morphology metadata");
      if(!item?.relations) issues.push("missing semantic relations");
    }else{
      if(!item?.ph) issues.push("missing transliteration");
      if(!item?.e) issues.push("missing Ukrainian example");
      if(!item?.eng) issues.push("missing English example meaning");
    }
    return issues;
  }

  function validateDataset(data){
    const report=[];
    for(const [learner,sets] of Object.entries(data||{})){
      for(const lang of ["en","uk"]){
        const seen=new Set();
        for(const item of sets?.[lang]||[]){
          const issues=validateItem(item,lang);
          if(seen.has(item.t)) issues.push("duplicate target");
          seen.add(item.t);
          if(issues.length) report.push({learner,lang,target:item.t||"(missing)",issues});
        }
      }
    }
    return report;
  }

  function familyCluster(item){
    const out=[item.t];
    if(item.family) out.push(item.family);
    for(const f of item.morphology?.family||[]) if(f && !out.includes(f)) out.push(f);
    return out;
  }

  function semanticNeighbors(item,items){
    const names=new Set([
      ...(item.relations?.syn||[]),
      ...(item.relations?.ant||[])
    ]);
    return items.filter(x=>names.has(x.t));
  }

  return {interactionProfile,validateItem,validateDataset,familyCluster,semanticNeighbors};
})();