/* Chami v20 — expressive/transfer task generation.
   Deterministic curriculum selection; no open chat. */
window.ChamiTransfer=(()=>{
  function seenItems(history,items){
    return items.filter(x=>history?.[x.t]?.seen>0);
  }
  function chooseEnglish(history,items){
    const pool=seenItems(history,items);
    if(!pool.length) return null;
    const weak=pool.filter(x=>!history[x.t]?.proof?.recall || !history[x.t]?.proof?.context);
    return (weak.length?weak:pool)[Math.floor(Math.random()*(weak.length?weak.length:pool.length))];
  }
  function chooseUkrainian(history,items){
    const pool=seenItems(history,items);
    if(!pool.length) return null;
    const weak=pool.filter(x=>!history[x.t]?.proof?.recall);
    return (weak.length?weak:pool)[Math.floor(Math.random()*(weak.length?weak.length:pool.length))];
  }
  function englishTask(item){
    const variants=[
      {kind:"expressiveText",prompt:`Write a tiny sentence using “${item.t}”.`,hint:item.m},
      {kind:"expressiveScene",prompt:`Imagine Chami finds something ${item.t}. What could be happening?`,hint:item.m},
      {kind:"expressiveVoice",prompt:`Say one sentence using “${item.t}”.`,hint:item.m}
    ];
    return {...variants[Math.floor(Math.random()*variants.length)],item,lang:"en",estimatedSeconds:65};
  }
  function ukrainianTask(item){
    return {
      kind:"expressiveVoice",
      prompt:`Say the Ukrainian word for “${item.m}”.`,
      hint:item.ph||item.t,
      item,lang:"uk",estimatedSeconds:50
    };
  }
  return {chooseEnglish,chooseUkrainian,englishTask,ukrainianTask};
})();