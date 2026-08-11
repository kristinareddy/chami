/* Chami v24 — deterministic English decoding helpers.
   These are visual spelling supports, not claims about exact pronunciation or syllables. */

window.ChamiPhonics = (() => {
  const LETTER_TEAMS = [
    'tion','sion','tch','dge','igh','eigh','ough',
    'sh','ch','th','ph','wh','ck','ng','nk','qu',
    'ee','ea','ai','ay','oa','oo','ou','ow','oi','oy',
    'ar','or','er','ir','ur','aw','au','ew'
  ].sort((a,b)=>b.length-a.length || a.localeCompare(b));

  const PREFIXES = ['under','over','inter','dis','mis','pre','non','un','re'];
  const SUFFIXES = ['ation','ition','tion','sion','ture','ment','ness','less','able','ible','ful','ous','ive','ing','est','er','ed','ly','al','tle'];

  function normalize(word){
    return String(word||'').toLowerCase().replace(/[^a-z]/g,'');
  }

  function tokenize(word){
    const clean=normalize(word);
    const tokens=[];
    let i=0;
    while(i<clean.length){
      const team=LETTER_TEAMS.find(x=>clean.startsWith(x,i));
      if(team){ tokens.push(team); i+=team.length; }
      else { tokens.push(clean[i]); i+=1; }
    }
    return tokens;
  }

  function commonPatterns(word){
    const clean=normalize(word);
    return LETTER_TEAMS
      .filter(team=>clean.includes(team))
      .sort((a,b)=>b.length-a.length || clean.indexOf(a)-clean.indexOf(b));
  }

  function focusPattern(word){
    return commonPatterns(word)[0] || null;
  }

  function balancedGroups(tokens,count){
    const groups=[];
    let cursor=0;
    for(let i=0;i<count;i++){
      const remaining=tokens.length-cursor;
      const slots=count-i;
      const take=Math.ceil(remaining/slots);
      groups.push(tokens.slice(cursor,cursor+take).join(''));
      cursor+=take;
    }
    return groups.filter(Boolean);
  }

  function parts(word){
    const clean=normalize(word);
    if(clean.length<=3) return clean?[clean]:[];

    let prefix='';
    let suffix='';
    let core=clean;

    const prefixHit=PREFIXES.find(x=>core.startsWith(x) && core.length-x.length>=4);
    if(prefixHit){ prefix=prefixHit; core=core.slice(prefixHit.length); }

    const suffixHit=SUFFIXES.find(x=>core.endsWith(x) && core.length-x.length>=3);
    if(suffixHit){ suffix=suffixHit; core=core.slice(0,-suffixHit.length); }

    const fixed=[prefix,core,suffix].filter(Boolean);
    if(fixed.length>=2 && fixed.length<=3 && fixed.every(x=>x.length<=7)) return fixed;

    const tokens=tokenize(clean);
    const count=tokens.length>=7?3:2;
    return balancedGroups(tokens,Math.min(count,tokens.length));
  }

  function patternOptions(word,words,count=3){
    const target=focusPattern(word);
    if(!target) return [];
    const candidates=[];
    for(const other of words||[]){
      for(const pattern of commonPatterns(other)){
        if(pattern!==target && !candidates.includes(pattern)) candidates.push(pattern);
      }
    }
    for(const fallback of ['sh','ch','th','ee','oa','ai','er','ou']){
      if(fallback!==target && !candidates.includes(fallback)) candidates.push(fallback);
    }
    candidates.sort((a,b)=>Math.abs(a.length-target.length)-Math.abs(b.length-target.length) || a.localeCompare(b));
    return [target,...candidates.slice(0,Math.max(0,count-1))];
  }

  function wordOptions(item,items,count=3){
    const target=normalize(item?.t);
    const candidates=(items||[])
      .filter(x=>normalize(x?.t) && normalize(x.t)!==target)
      .sort((a,b)=>{
        const aWord=normalize(a.t), bWord=normalize(b.t);
        const lengthDiff=Math.abs(aWord.length-target.length)-Math.abs(bWord.length-target.length);
        if(lengthDiff) return lengthDiff;
        const difficultyDiff=Math.abs((a.difficulty||1)-(item?.difficulty||1))-Math.abs((b.difficulty||1)-(item?.difficulty||1));
        return difficultyDiff || aWord.localeCompare(bWord);
      });
    return [item,...candidates.slice(0,Math.max(0,count-1))];
  }

  function eligible(item){
    const clean=normalize(item?.t);
    return clean.length>=3 && clean.length<=16 && clean===String(item?.t||'').toLowerCase();
  }

  return {
    normalize,tokenize,commonPatterns,focusPattern,parts,patternOptions,wordOptions,eligible,
    LETTER_TEAMS:[...LETTER_TEAMS]
  };
})();
