/* Chami v18 — Learner intelligence / knowledge map.
   This module interprets existing evidence. It does not invent mastery. */

window.ChamiLearner = (() => {
  function safeProof(r){ return r?.proof || {}; }
  function proofN(r){ return Object.values(safeProof(r)).filter(Boolean).length; }

  function classify(r, dayIndex){
    if(!r || !r.seen) return "unseen";
    const due = (r.due ?? Infinity) <= dayIndex;
    if(r.mastered && !due) return "mastered";
    if(r.mastered && due) return "mastered_due";
    if(r.success >= 3 && proofN(r) >= 2) return due ? "forgetting" : "usable";
    if(r.success >= 1 && proofN(r) >= 1) return due ? "fragile" : "recognized";
    return "exposed";
  }

  function itemEvidence(r, lang){
    const proof=safeProof(r);
    const transfer = lang==="en"
      ? Boolean(proof.context && proof.recall)
      : Boolean((proof.listening || proof.letterHunt) && (proof.recall || proof.buildWord));
    return {
      stage:null,
      proofs:proofN(r),
      recognition:Boolean(proof.meaning || proof.placement),
      recall:Boolean(proof.recall),
      context:Boolean(proof.context),
      listening:Boolean(proof.listening),
      literacy:Boolean(proof.letterHunt || proof.missingLetter || proof.buildWord),
      transfer
    };
  }

  function languageMap({history, items, lang, dayIndex}){
    const records=items.map(item=>{
      const r=history?.[item.t] || null;
      const evidence=itemEvidence(r,lang);
      const stage=classify(r,dayIndex);
      evidence.stage=stage;
      return {item,record:r,evidence};
    });

    const seen=records.filter(x=>x.record?.seen);
    const mastered=records.filter(x=>x.record?.mastered);
    const due=seen.filter(x=>(x.record?.due ?? Infinity)<=dayIndex);
    const transfer=seen.filter(x=>x.evidence.transfer);
    const recall=seen.filter(x=>x.evidence.recall);
    const recognition=seen.filter(x=>x.evidence.recognition);
    const listening=seen.filter(x=>x.evidence.listening);
    const literacy=seen.filter(x=>x.evidence.literacy);
    const fragile=seen.filter(x=>["fragile","forgetting","mastered_due"].includes(x.evidence.stage));

    return {
      records, seen, mastered, due, transfer, recall, recognition, listening, literacy, fragile,
      retention: seen.length ? mastered.length/seen.length : 0,
      transferRate: seen.length ? transfer.length/seen.length : 0,
      recallRate: seen.length ? recall.length/seen.length : 0
    };
  }

  function priorities(map, lang){
    const out=[];
    if(map.due.length>=3) out.push(`${map.due.length} ${lang==="en"?"English":"Ukrainian"} items are due for retrieval.`);
    if(map.fragile.length) out.push(`${map.fragile.length} ${lang==="en"?"English":"Ukrainian"} items look fragile or are starting to be forgotten.`);
    if(map.seen.length>=3 && map.recallRate<0.5) out.push(`${lang==="en"?"English":"Ukrainian"} recognition is ahead of free recall; ask for more retrieval without clues.`);
    if(map.seen.length>=4 && map.transferRate<0.35) out.push(`${lang==="en"?"English":"Ukrainian"} needs more transfer into new contexts rather than more exposure.`);
    if(lang==="uk" && map.seen.length>=3 && map.listening.length>map.literacy.length+2) out.push(`Ukrainian listening is ahead of Cyrillic decoding; use short literacy games on known words.`);
    if(lang==="uk" && map.literacy.length>map.listening.length+2) out.push(`Ukrainian Cyrillic recognition is ahead of listening; prioritize sound-first work.`);
    return out;
  }

  return {classify,itemEvidence,languageMap,priorities};
})();
