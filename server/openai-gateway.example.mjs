/**
 * Chami controlled AI gateway — example Node server.
 *
 * IMPORTANT:
 * - Deploy this on a server/serverless host, NOT GitHub Pages.
 * - Set OPENAI_API_KEY in server environment variables.
 * - Set OPENAI_MODEL to a model available to your OpenAI project.
 * - The client never receives the provider API key.
 */

import http from "node:http";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL;
const PORT = Number(process.env.PORT || 8787);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://kristinareddy.github.io";

if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required.");
if (!MODEL) throw new Error("OPENAI_MODEL is required.");

function json(res, status, body){
  res.writeHead(status, {
    "Content-Type":"application/json",
    "Access-Control-Allow-Origin":ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods":"POST,OPTIONS",
    "Access-Control-Allow-Headers":"Content-Type",
    "Cache-Control":"no-store"
  });
  res.end(JSON.stringify(body));
}

function safeRequest(body){
  const task = body?.task;
  if(!["micro_story","explanation"].includes(task)) return null;

  const english = Array.isArray(body?.targets?.english) ? body.targets.english.slice(0,5).map(String) : [];
  const ukrainian = Array.isArray(body?.targets?.ukrainian) ? body.targets.ukrainian.slice(0,5).map(String) : [];
  const known = Array.isArray(body?.targets?.known_words) ? body.targets.known_words.slice(0,12).map(String) : [];

  return {
    task,
    learner:{
      profile_id:String(body?.learner?.profile_id || "child"),
      reading_band:["early_elementary","elementary"].includes(body?.learner?.reading_band)
        ? body.learner.reading_band : "early_elementary"
    },
    targets:{english,ukrainian,known_words:known},
    meaning: body?.meaning ? String(body.meaning).slice(0,180) : "",
    constraints:{
      max_words:Math.max(30,Math.min(120,Number(body?.constraints?.max_words || 80))),
      characters:["Chami","Peach"],
      no_new_ukrainian:true,
      no_open_ended_chat:true
    }
  };
}

function instructionsFor(p){
  return `You create tightly bounded educational content for a young child.
You are NOT a chatbot and must not invite continued conversation.
The learning engine has already chosen the target content; do not change the curriculum.

Characters: Chami is a friendly family dog and main learning guide. Peach is a hamster companion.
Use concrete, warm, playful language.
Never ask for personal information.
Never mention the child's real name.
Never introduce new Ukrainian vocabulary beyond the supplied Ukrainian targets.
Never give medical, legal, sexual, violent, political, commercial, or unsafe content.
Never tell the child to leave home, contact anyone, buy anything, or use another website/app.

Return ONLY valid JSON with:
{
  "title": "short title",
  "content": "bounded educational content",
  "check_question": "optional short question",
  "check_answer": "optional short answer",
  "used_targets": ["only supplied target strings that you used"]
}`;
}

async function generate(payload){
  const input = payload.task === "micro_story"
    ? `Create a ${payload.constraints.max_words}-word maximum micro-story.
English targets: ${JSON.stringify(payload.targets.english)}
Ukrainian targets: ${JSON.stringify(payload.targets.ukrainian)}
Known words you may recycle: ${JSON.stringify(payload.targets.known_words)}
Use at least one target naturally.`
    : `Explain the English target in one short concrete explanation plus one simple example.
Target: ${JSON.stringify(payload.targets.english[0] || "")}
Meaning supplied by curriculum: ${JSON.stringify(payload.meaning || "")}`;

  const response = await client.responses.create({
    model: MODEL,
    store: false,
    instructions: instructionsFor(payload),
    input
  });

  const raw = response.output_text || "";
  const parsed = JSON.parse(raw);
  if(typeof parsed.content !== "string") throw new Error("Invalid model response.");
  return parsed;
}

const server = http.createServer(async (req,res)=>{
  if(req.method==="OPTIONS") return json(res,204,{});
  if(req.method!=="POST" || req.url!=="/api/chami-ai") return json(res,404,{error:"not_found"});

  let raw="";
  req.on("data",chunk=>{
    raw+=chunk;
    if(raw.length>12000) req.destroy();
  });
  req.on("end",async()=>{
    try{
      const payload=safeRequest(JSON.parse(raw||"{}"));
      if(!payload) return json(res,400,{error:"invalid_request"});
      const result=await generate(payload);
      return json(res,200,result);
    }catch(err){
      console.error(err);
      return json(res,500,{error:"generation_failed"});
    }
  });
});

server.listen(PORT,()=>console.log(`Chami AI gateway listening on ${PORT}`));
