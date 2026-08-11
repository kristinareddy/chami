/* Chami v17 — controlled AI client.
   Never place provider API keys in this file or any browser bundle. */

window.ChamiAI = (() => {
  const cfg = () => window.CHAMI_FAMILY?.ai || {};

  function isConfigured(){
    return Boolean(cfg().enabled && cfg().endpoint);
  }

  async function request(payload){
    if(!isConfigured()) throw new Error("AI_NOT_CONFIGURED");

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), cfg().timeoutMs || 5000);
    try{
      const res = await fetch(cfg().endpoint, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(payload),
        signal: controller.signal,
        credentials: "omit"
      });
      if(!res.ok) throw new Error(`AI_HTTP_${res.status}`);
      const data = await res.json();
      if(!data || typeof data.content !== "string") throw new Error("AI_BAD_RESPONSE");
      return data;
    } finally {
      clearTimeout(timer);
    }
  }

  function localStory(payload){
    const en = payload?.targets?.english || [];
    const uk = payload?.targets?.ukrainian || [];
    const a = en[0] || "curious";
    const b = en[1] || "observe";
    const u = uk[0] || "Привіт";
    return {
      source: "local",
      title: "Chami and the Sunflower Door",
      content: `Peach was ${a} about a tiny door under a sunflower. Chami stopped to ${b} the little marks in the dirt. Peach whispered “${u}!” and the door clicked open.`,
      check_question: `What clue helped Chami decide to stop and look carefully?`,
      check_answer: "The little marks in the dirt.",
      used_targets: [a,b,u].filter(Boolean)
    };
  }

  function localExplanation(payload){
    const word = payload?.targets?.english?.[0] || "the word";
    const meaning = payload?.meaning || "";
    return {
      source: "local",
      title: `A clue for ${word}`,
      content: meaning
        ? `${word} means ${meaning}. Imagine Chami noticing it during an adventure and deciding what to do next.`
        : `Think about what ${word} is doing in the sentence. Look for the clue around it.`,
      used_targets: [word]
    };
  }

  async function microStory(payload){
    if(!cfg().allowGeneratedStories) return localStory(payload);
    try{
      const data = await request({...payload, task:"micro_story"});
      return {...data, source:"ai"};
    }catch(err){
      if(cfg().fallbackToLocal !== false) return localStory(payload);
      throw err;
    }
  }

  async function explanation(payload){
    if(!cfg().allowGeneratedExplanations) return localExplanation(payload);
    try{
      const data = await request({...payload, task:"explanation"});
      return {...data, source:"ai"};
    }catch(err){
      if(cfg().fallbackToLocal !== false) return localExplanation(payload);
      throw err;
    }
  }

  return {isConfigured,microStory,explanation};
})();
