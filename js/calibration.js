/* Chami v19 — per-child adaptive timing calibration.
   Stores only local aggregate task timing. No remote analytics. */

window.ChamiCalibration = (() => {
  const DEFAULTS = {
    placement:18,
    review:35,
    newWord:50,
    challenge:55,
    story:55,
    reward:25,
    ukGame:55,
    phonics:50
  };

  const MAX_VALID_SECONDS = 180; // longer = likely interruption, ignore
  const MIN_VALID_SECONDS = 2;
  const ALPHA = 0.28; // EWMA weighting for recent observations

  function ensure(profile){
    if(!profile.calibration){
      profile.calibration = {
        buckets:{},
        totalSamples:0,
        sessions:0,
        recentSessionSeconds:[],
        lastSessionSeconds:null
      };
    }
    if(!profile.calibration.buckets) profile.calibration.buckets={};
    if(!Array.isArray(profile.calibration.recentSessionSeconds)) profile.calibration.recentSessionSeconds=[];
    return profile.calibration;
  }

  function bucketKey(step){
    if(!step) return "other";
    if(step.kind==="placement") return "placement";
    if(step.kind==="word") return step.mode==="new" ? "newWord" : "review";
    if(step.kind==="listen" || step.kind==="comprehension") return "challenge";
    if(step.kind==="story") return "story";
    if(step.kind==="reward") return "reward";
    if(["ukLetterHunt","ukMissingLetter","ukBuildWord"].includes(step.kind)) return "ukGame";
    if(["phonicsWordMatch","phonicsPatternMatch","phonicsBuild"].includes(step.kind)) return "phonics";
    if(step.kind==="offscreen") return "offscreen";
    return step.kind || "other";
  }

  function observe(profile, step, seconds){
    const key=bucketKey(step);
    if(key==="offscreen") return false;
    if(!Number.isFinite(seconds) || seconds<MIN_VALID_SECONDS || seconds>MAX_VALID_SECONDS) return false;

    const c=ensure(profile);
    const b=c.buckets[key] || {mean:null,count:0,last:null};
    b.mean = b.mean===null ? seconds : (ALPHA*seconds + (1-ALPHA)*b.mean);
    b.count += 1;
    b.last = seconds;
    c.buckets[key]=b;
    c.totalSamples=(c.totalSamples||0)+1;
    return true;
  }

  function estimate(profile, key, fallback){
    const c=ensure(profile);
    const b=c.buckets[key];
    if(!b || !b.count || !Number.isFinite(b.mean)) return fallback ?? DEFAULTS[key] ?? 40;

    // Blend calibrated estimate with default until enough samples exist.
    const confidence=Math.min(1,b.count/8);
    const base=fallback ?? DEFAULTS[key] ?? b.mean;
    return (confidence*b.mean)+((1-confidence)*base);
  }

  function recordSession(profile, seconds){
    const c=ensure(profile);
    if(Number.isFinite(seconds) && seconds>=60 && seconds<=1200){
      c.lastSessionSeconds=seconds;
      c.recentSessionSeconds.push(seconds);
      c.recentSessionSeconds=c.recentSessionSeconds.slice(-8);
      c.sessions=(c.sessions||0)+1;
    }
  }

  function avgSession(profile){
    const c=ensure(profile);
    if(!c.recentSessionSeconds.length) return null;
    return c.recentSessionSeconds.reduce((a,b)=>a+b,0)/c.recentSessionSeconds.length;
  }

  function confidence(profile){
    const c=ensure(profile);
    if(c.totalSamples<5) return "low";
    if(c.totalSamples<20) return "growing";
    return "useful";
  }

  function summary(profile){
    const c=ensure(profile);
    const rows={};
    for(const key of ["placement","review","newWord","challenge","phonics","ukGame","story"]){
      const b=c.buckets[key];
      rows[key]=b ? {mean:b.mean,count:b.count} : {mean:null,count:0};
    }
    return {
      totalSamples:c.totalSamples||0,
      sessions:c.sessions||0,
      avgSession:avgSession(profile),
      confidence:confidence(profile),
      rows
    };
  }

  return {ensure,bucketKey,observe,estimate,recordSession,avgSession,confidence,summary,DEFAULTS};
})();
