(function(global){
  const ICONS={
    paw:'<path d="M12 13.2c-3.8 0-7 2.5-7 5.4 0 2 1.6 3.4 3.7 3.4 1.3 0 2.2-.7 3.3-.7s2 .7 3.3.7c2.1 0 3.7-1.4 3.7-3.4 0-2.9-3.2-5.4-7-5.4Z"/><ellipse cx="5.1" cy="10.2" rx="2.4" ry="3"/><ellipse cx="18.9" cy="10.2" rx="2.4" ry="3"/><ellipse cx="9.2" cy="5.7" rx="2.4" ry="3.1"/><ellipse cx="14.8" cy="5.7" rx="2.4" ry="3.1"/>',
    book:'<path d="M3 5.4c3.2-.9 6.1-.4 9 1.5v13c-2.9-1.9-5.8-2.4-9-1.5v-13Zm18 0c-3.2-.9-6.1-.4-9 1.5v13c2.9-1.9 5.8-2.4 9-1.5v-13Z"/><path d="M12 6.9v13" fill="none" stroke="currentColor" stroke-width="1.5"/>',
    listen:'<path d="M5 10h3l4-4v12l-4-4H5v-4Z"/><path d="M15 8.5c1.2.8 1.8 1.9 1.8 3.5S16.2 14.7 15 15.5M17.7 6.2c2 1.4 3 3.3 3 5.8s-1 4.4-3 5.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    write:'<path d="m5 16.5-1 4 4-1L19.2 8.3l-3.5-3.5L5 16.5Z"/><path d="m14.7 5.8 3.5 3.5M4 21h16" fill="none" stroke="currentColor" stroke-width="1.7"/>',
    puzzle:'<path d="M4 4h6v3a2 2 0 1 0 4 0V4h6v6h-3a2 2 0 1 0 0 4h3v6h-6v-3a2 2 0 1 0-4 0v3H4v-6h3a2 2 0 1 0 0-4H4V4Z"/>',
    garden:'<path d="M12 21v-9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 13C6 13 4 9 4 5c5 0 8 2.7 8 8ZM12 16c6 0 8-4 8-8-5 0-8 2.7-8 8Z"/><path d="M5 21h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    star:'<path d="m12 2.7 2.8 5.7 6.3.9-4.6 4.4 1.1 6.3-5.6-3-5.6 3 1.1-6.3-4.6-4.4 6.3-.9L12 2.7Z"/>',
    home:'<path d="m3 11 9-8 9 8v10h-6v-7H9v7H3V11Z"/>',
    chart:'<path d="M4 20V10h4v10H4Zm6 0V4h4v16h-4Zm6 0v-7h4v7h-4Z"/>',
    grownups:'<circle cx="8" cy="8" r="4"/><circle cx="17" cy="9" r="3"/><path d="M2.5 21c.3-4 2.2-6 5.5-6s5.2 2 5.5 6h-11Zm11-1c.2-3.1 1.6-4.7 4.3-4.7 2.4 0 3.8 1.9 4 4.7h-8.3Z"/>',
    flag:'<path d="M5 22V3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6 4h13l-3 4 3 4H6V4Z"/>',
    heart:'<path d="M12 21S3 15.8 3 9.1C3 5 8 3.4 12 7.3 16 3.4 21 5 21 9.1 21 15.8 12 21 12 21Z"/>',
    lock:'<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2"/>'
  };

  function icon(name,label=''){
    const body=ICONS[name]||ICONS.star;
    return `<svg class="chami-icon" viewBox="0 0 24 24" role="img" aria-label="${escape(label||name)}" focusable="false">${body}</svg>`;
  }

  function escape(value){
    return String(value??'').replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':'&quot;',"'":"&#39;"})[char]);
  }

  function records(profile,lang){
    return Object.values(profile?.history?.[lang]||{}).filter(Boolean);
  }

  function countProof(profile,key,lang){
    const langs=lang?[lang]:['en','uk'];
    return langs.reduce((total,code)=>total+records(profile,code).filter(record=>Boolean(record.proof?.[key])).length,0);
  }

  function stage(value,thresholds=[1,3,7,12]){
    let level=0;
    thresholds.forEach(threshold=>{ if(value>=threshold) level++; });
    return Math.min(4,level);
  }

  function nextThreshold(value,thresholds){
    return thresholds.find(threshold=>value<threshold)||thresholds[thresholds.length-1];
  }

  function garden(profile,literacy){
    const enMastered=records(profile,'en').filter(record=>record.mastered).length;
    const ukMastered=records(profile,'uk').filter(record=>record.mastered).length;
    const phonicsSuccess=literacy?.phonics?.successes||0;
    const expression=countProof(profile,'expression')+countProof(profile,'spokenAttempt')+countProof(profile,'context','en');
    const plots=[
      {id:'english',name:'English blooms',icon:'book',value:enMastered,thresholds:[1,3,7,12],color:'coral'},
      {id:'ukrainian',name:'Ukrainian sunflowers',icon:'listen',value:ukMastered,thresholds:[1,3,6,10],color:'blue'},
      {id:'decoding',name:'Word-building sprouts',icon:'puzzle',value:phonicsSuccess,thresholds:[1,4,10,20],color:'violet'},
      {id:'expression',name:'Story blossoms',icon:'write',value:expression,thresholds:[1,3,7,14],color:'gold'}
    ];
    return plots.map(plot=>{
      const level=stage(plot.value,plot.thresholds);
      const next=nextThreshold(plot.value,plot.thresholds);
      const previous=level===0?0:plot.thresholds[Math.min(level-1,plot.thresholds.length-1)];
      const complete=level===4;
      const pct=complete?100:Math.max(8,Math.round(((plot.value-previous)/Math.max(1,next-previous))*100));
      return {...plot,level,next,complete,pct};
    });
  }

  function achievements(profile,literacy){
    const seen=records(profile,'en').filter(r=>r.seen>0).length+records(profile,'uk').filter(r=>r.seen>0).length;
    const mastered=records(profile,'en').filter(r=>r.mastered).length+records(profile,'uk').filter(r=>r.mastered).length;
    const listening=countProof(profile,'listening','uk');
    const recall=countProof(profile,'recall');
    const phonicsAttempts=literacy?.phonics?.attempts||0;
    const learningDays=Number(profile?.learningDays||0);
    return [
      {id:'explorer',name:'Word Explorer',detail:'Met a word and tried to understand it.',icon:'book',unlocked:seen>=1,evidence:`${seen} encountered`},
      {id:'listener',name:'Big Listener',detail:'Used listening to understand Ukrainian.',icon:'listen',unlocked:listening>=1,evidence:`${listening} listening proof${listening===1?'':'s'}`},
      {id:'builder',name:'Brave Builder',detail:'Practised decoding by tapping word parts.',icon:'puzzle',unlocked:phonicsAttempts>=1,evidence:`${phonicsAttempts} decoding attempt${phonicsAttempts===1?'':'s'}`},
      {id:'rememberer',name:'Memory Keeper',detail:'Recalled meaning without being shown.',icon:'heart',unlocked:recall>=3,evidence:`${recall} recall proof${recall===1?'':'s'}`},
      {id:'grower',name:'Garden Grower',detail:'Built strong memory across several formats.',icon:'garden',unlocked:mastered>=3,evidence:`${mastered} mastered`},
      {id:'pathfinder',name:'Learning Pathfinder',detail:'Returned to learn on different learning days.',icon:'flag',unlocked:learningDays>=5,evidence:`${learningDays} learning day${learningDays===1?'':'s'}`}
    ];
  }

  function summary(profile,literacy){
    const en=records(profile,'en');
    const uk=records(profile,'uk');
    const masteredEn=en.filter(r=>r.mastered).length;
    const masteredUk=uk.filter(r=>r.mastered).length;
    return {
      seen:en.filter(r=>r.seen>0).length+uk.filter(r=>r.seen>0).length,
      mastered:masteredEn+masteredUk,
      masteredEn,
      masteredUk,
      recall:countProof(profile,'recall'),
      listening:countProof(profile,'listening','uk'),
      decoding:literacy?.phonics?.attempts||0,
      learningDays:Number(profile?.learningDays||0)
    };
  }

  function characterPaths(family,child){
    return {
      child:family?.children?.[child]?.avatar||'',
      chami:family?.characters?.Chami?.image||'',
      peach:family?.characters?.Peach?.image||''
    };
  }

  global.ChamiVisuals={icon,escape,garden,achievements,summary,characterPaths};
})(window);
