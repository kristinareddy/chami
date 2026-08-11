/* Chami v21 — scalable curriculum progression.
   Difficulty is earned from evidence; age alone never advances a learner. */
window.ChamiCurriculum=(()=>{
  const EN_BANDS=[
    {max:1,name:"Explorer",description:"rich everyday vocabulary"},
    {max:2,name:"Builder",description:"precise vocabulary and early reasoning"},
    {max:3,name:"Thinker",description:"academic language used across school subjects"},
    {max:4,name:"Analyst",description:"evidence, inference and structured reasoning"},
    {max:5,name:"Scholar",description:"advanced academic vocabulary"},
    {max:6,name:"Advanced Scholar",description:"high-level academic and exam-ready language"}
  ];
  const UK_BANDS=[
    {max:1,name:"Sounds & Core",description:"high-frequency concrete words"},
    {max:2,name:"First Words",description:"useful nouns and greetings"},
    {max:3,name:"Little Phrases",description:"descriptions and basic requests"},
    {max:4,name:"Sentence Builder",description:"simple conversation and sentence frames"},
    {max:5,name:"Growing Speaker",description:"personal expression and connected phrases"},
    {max:6,name:"Independent Path",description:"later grammar, reading and conversation"}
  ];

  function bandFor(lang,difficulty){
    const bands=lang==="en"?EN_BANDS:UK_BANDS;
    return bands.find(b=>difficulty<=b.max)||bands[bands.length-1];
  }

  function eligibleMaxDifficulty(history,items,lang,currentDay=0){
    const seen=items.filter(x=>history?.[x.t]?.seen);
    if(seen.length<5) return lang==="en"?2:2;

    const mastered=seen.filter(x=>history[x.t]?.mastered);
    const recall=seen.filter(x=>history[x.t]?.proof?.recall);
    const due=seen.filter(x=>(history[x.t]?.due??Infinity)<=currentDay);
    const masteryRate=mastered.length/seen.length;
    const recallRate=recall.length/seen.length;

    let max=Math.max(2,...seen.map(x=>x.difficulty||1));
    // Advance only with broad evidence and manageable review debt.
    if(seen.length>=8 && masteryRate>=0.62 && recallRate>=0.55 && due.length<=Math.ceil(seen.length*.35)){
      max+=1;
    }
    // Back pressure: do not keep escalating while retention is weak.
    if(seen.length>=8 && (masteryRate<0.35 || due.length>seen.length*.55)){
      max=Math.max(1,max-1);
    }
    return Math.min(lang==="en"?6:5,max);
  }

  function candidatePool(history,items,lang,currentDay=0){
    const max=eligibleMaxDifficulty(history,items,lang,currentDay);
    const unseen=items.filter(x=>!history?.[x.t]?.seen && (x.difficulty||1)<=max);
    const frontier=unseen.filter(x=>(x.difficulty||1)>=Math.max(1,max-1));
    return {max,unseen,frontier:frontier.length?frontier:unseen};
  }

  function status(history,items,lang,currentDay=0){
    const max=eligibleMaxDifficulty(history,items,lang,currentDay);
    const band=bandFor(lang,max);
    const seen=items.filter(x=>history?.[x.t]?.seen).length;
    const mastered=items.filter(x=>history?.[x.t]?.mastered).length;
    return {max,band,seen,mastered,total:items.length};
  }

  return {EN_BANDS,UK_BANDS,bandFor,eligibleMaxDifficulty,candidatePool,status};
})();
