# Chami — Product Requirements

## Mission

Build a warm, playful learning app that quietly delivers serious individualized language education.

The child should experience an adventure. The adaptive engine should decide what the child is ready to learn.

## Learners

### Auro
- Separate learner model.
- English starts at a higher challenge level than Teia's.
- Long-term direction: rich vocabulary, academic language, inference, evidence, morphology, analysis and eventual standardized-test readiness.
- Ukrainian begins from beginner level.

### Teia
- Separate learner model.
- English begins more gently but must automatically accelerate when performance shows readiness.
- Ukrainian begins from beginner level.

## Characters

### Chami
Main mascot and guide.
Visual traits that must be preserved:
- cream/light coat,
- pink nose,
- yellow-green eyes.

### Peach
Hamster companion and reward/story character.

### Auro and Teia
Use recognizable but cartoonish character designs. Avoid photorealistic portraits.

## Custody-aware learning logic

The children are exchanged frequently between parents; the schedule is not week-on/week-off.

- With Mom: normal adaptive session, up to 5 new English + 5 new Ukrainian items plus review.
- With Dad: no required new material; optional lightweight review only.
- Count learning days, not calendar streaks.
- Never punish missed calendar days.

## Child UX

The child should usually not select a study module manually.

Preferred opening:
**“Hi Auro! Chami has today’s adventure ready.”**

The app should guide one short session automatically with minimal reading and large touch targets.

## Grown-up UX

Keep analytics, adaptation details, curriculum settings and progress reports in a separate grown-up area.

## Product principle

**The educational engine can be sophisticated; the child experience should feel simple, warm and playful.**

## v25 — Purposeful visual-world rule

The richer artwork is part of the interface, not a gallery laid on top of it.

- The selected child's portrait communicates whose learner model is active and opens her learning trail.
- Chami is the primary action/guide for Today's Adventure and learning feedback.
- Peach provides secondary clues, story/context support and gentle review cues.
- Illustrated module tiles must open a real activity or evidence view.
- Garden growth must be reproducible from saved learning evidence.
- Achievements must name the evidence that unlocked them.
- Never add invented coins, XP, leaderboards, calendar streak pressure, or rewards for keeping the screen open.
- Use short event-driven motion only; respect reduced-motion preferences.
- Keep family artwork in configuration and reusable visual-state derivation in the core.

v26 continues this rule by turning the approved character sheets and family scenes into large-tap destinations and reactions rather than adding a passive gallery.

## v26 — Character consistency and interaction rule

- Auro is always the older green-eyed character with loose golden hair, coral clothing, and no braid.
- Teia is always the younger blue-eyed character with one side braid, a purple flower clip, purple clothing, and no overalls.
- Peach keeps the same chestnut-and-cream markings in every pose.
- Chami keeps his cream coat, pink nose, yellow-green eyes, brown collar, and gold tag.
- Home must show the whole Chami family together.
- Auro and Teia must each have their own visibly different character world.
- Every scene hotspot and expression face must respond to a tap.
- Expression selection is presentation-only UI state. It cannot change curriculum, difficulty, mastery, review timing, or achievement evidence.
- Real family photographs are reference material only and must never be packaged in the PWA.


## v13 learning-quality rule

Self-rating is not sufficient evidence of learning.

Chami should increasingly estimate knowledge from observable retrieval:
- choosing the correct meaning,
- identifying correct contextual use,
- recognizing Ukrainian from audio,
- recalling/typing a word without seeing it.

A child may still receive hints and explanations, but mastery must be based on successful retrieval across multiple formats and learning days.


## v14 — Maximum learning, minimum screen time

Chami uses a **screen-time learning budget**, not a fixed lesson length.

- Target planning budget: about 12 minutes.
- Hard design ceiling: 15 minutes of active screen learning.
- The session may end earlier when there is no higher-value work.
- Five new words per language is a ceiling, not a quota.
- Candidate words are rapidly placement-checked. If the child already knows one, it is recorded as probable prior knowledge and replaced; it does not consume a new-word slot.
- Due retrieval has priority over new material.
- New material is reduced when review load, errors, or the time budget make it inappropriate.
- Chami explicitly ends the academic session rather than encouraging infinite continuation.

### Off-screen missions

Real-world missions do **not** consume the screen-time budget because the purpose is to get the child away from the device.

They must nevertheless be bounded:
- normally 1–3 minutes,
- always skippable,
- never required to complete the session,
- no long scavenger hunts,
- if the object is not found quickly, Chami says to skip it.

The distinction is therefore:
**15-minute screen ceiling ≠ 15-minute wall-clock ceiling.**


## v15 — Ukrainian Play

Cyrillic learning is now introduced through Ukrainian vocabulary the child has already encountered.

The guiding sequence is:
**sound/meaning → familiar spoken word → whole Cyrillic word → letter recognition → missing-letter reconstruction → word building**.

The child should experience this as play rather than alphabet study.

Current games:
- Letter Hunt
- Chami's Missing Letter
- Build the Word

Peach participates as a playful companion in Ukrainian literacy tasks.

Future games may add finger tracing, sound discrimination and more tactile drag interactions after the current mechanics are tested on real devices.


## v16 — Chami World

The child-facing layer now gets a coherent identity and feedback system without changing the adaptive curriculum.

Principles:
- animation is short and event-driven, never an infinite attention loop;
- sound reinforces action/correctness and can be disabled;
- the world grows from **demonstrated mastery**, not time spent or taps;
- rewards do not unlock more required screen time;
- Chami reacts as a guide, Peach remains the companion.

A simple vector Chami logo was added using Chami's identifying pink nose and yellow-green eyes.

The learning garden is deliberately small. It shows visible growth from mastered English/Ukrainian items rather than XP.


## v17 — Controlled AI Chami

AI is an optional **experience generator**, not the curriculum authority.

The deterministic/adaptive engine continues to control:
- what the child should learn,
- which items are due,
- difficulty,
- session length,
- mastery,
- Ukrainian vocabulary constraints.

AI may currently generate only:
- bounded micro-stories using selected target/known words,
- an alternative short explanation for an English word.

AI must not:
- create an open chat with the child,
- change learning targets,
- ask for personal information,
- introduce arbitrary new Ukrainian vocabulary,
- extend the learning session,
- require network access for core learning.

The PWA always has a local fallback.


## v18 — Learner intelligence

The grown-up view should answer **what the child can actually do**, not merely how much the child used the app.

Chami now interprets item evidence into states such as:
- just exposed,
- recognizes,
- fragile,
- can use/recall,
- forgetting,
- mastered,
- mastered but due for retrieval.

The map is evidence-based and must remain conservative. It should say when there is not enough data.

Parent reporting should emphasize:
- retention,
- recall,
- transfer,
- review load,
- Ukrainian listening,
- Cyrillic literacy,
- fragile/forgetting items,
- next educational priorities.

Do not replace evidence with engagement metrics or opaque AI judgments.


## v19 — Adaptive Calibration

Chami should gradually learn **how this particular child learns**, not only what the child knows.

The app now calibrates task-duration estimates separately inside each learner profile.

Rules:
- use local aggregate timing only;
- ignore off-screen missions;
- ignore very long pauses/interruption outliers;
- do not treat fast completion as inherently better;
- timing exists only to improve session planning within the 15-minute screen ceiling;
- never reward rushing.

The richer v18 knowledge map also influences which type of activity is selected:
- recognition ahead of recall → retrieval/transfer,
- Ukrainian listening ahead of literacy → Cyrillic play,
- literacy ahead of listening → listening work,
- fragile memory → reinforcement before novelty.


## v20 — Expressive & Transfer Learning

Chami now begins moving beyond recognition/tapping into learner-generated responses.

Added activity classes:
- short typed sentence using an English target,
- imaginative transfer prompt in a novel situation,
- spoken English/Ukrainian attempt,
- architecture for bounded real-world missions.

Principles:
- expression is evidence, not automatic mastery;
- browser speech recognition is supportive only and must not penalize a child's accent/pronunciation;
- speaking attempts may be recorded even when automatic transcription is imperfect;
- tasks remain short and skippable;
- expressive tasks replace other application activities rather than extending screen time;
- off-screen missions are bounded to roughly 1–3 minutes and do not count as screen time.


## v21 — Curriculum Engine Expansion

Chami now has an explicit scalable curriculum frontier rather than a flat word list.

English:
- expanded toward cross-curricular academic vocabulary and later exam-ready reasoning language;
- difficulty bands run from rich everyday vocabulary through advanced academic language;
- advancement is evidence-based rather than age-based.

Ukrainian:
- expanded from core words into greetings, concrete nouns, descriptions, requests, sentence frames, conversation and personal expression;
- transliteration remains available because the children begin as English-speaking Ukrainian beginners;
- Cyrillic is layered onto words already encountered through sound/meaning.

The engine opens harder material only when retention, recall and review debt indicate readiness.


## v22 — Literacy-aware delivery

Auro and Teia must not receive identical interaction mechanics merely because they use the same curriculum engine.

Current family literacy configuration:

### Auro
- fluent English child reader,
- comfortable enough with writing/typing for age-appropriate written tasks,
- may receive independent reading, context questions and short expressive typing.

### Teia
- early English reader,
- knows letters but reads simple words slowly,
- computer interaction is developing/clumsy,
- should receive audio-supported instructions, large tap targets, fewer choices, very short text and speaking/tapping before typing,
- free typing is **not required** at this stage.

Critical principle:
**reading fluency must not cap vocabulary, reasoning or Ukrainian listening growth.**

Teia can learn sophisticated *spoken* vocabulary before she can independently decode the same vocabulary on screen. Chami should teach the concept orally/visually and let literacy catch up through controlled exposure.

As her reading/typing evidence improves, family configuration or a future automatic literacy model can gradually enable more independent text.


## v23 — Literacy Calibration & Multimodal Scaffolding

Chami now models **reading/input mechanics separately from vocabulary and reasoning knowledge**.

The literacy model can move among:
- early reader,
- developing reader,
- fluent child reader.

It uses local evidence from:
- printed-word recognition,
- short sentence reading,
- sound-to-print decoding,
- typing attempts/success,
- tap accuracy.

This model controls delivery mechanics only.

A child can therefore remain on intellectually rich vocabulary while receiving:
- more read-aloud,
- fewer/larger choices,
- sound-to-print matching,
- visual word chunking,
- voice response instead of typing.

Teia starts from an early-reader configuration. Auro starts from fluent-child-reader configuration, but both can accumulate independent literacy evidence.

Do not use literacy stage as a proxy for intelligence, vocabulary ceiling or general academic potential.


## v24 — Phonics, Tactile Practice & Scaffold Fade-Out

Status: release candidate completed and validated; real-device child observation remains the deployment gate.

Delivered:

- deterministic English spelling-team and word-part engine,
- hear-and-tap printed-word matching,
- letter-team matching,
- tap-in-order word building,
- one bounded decoding moment per supported session,
- per-child, per-activity success/attempt histories,
- automatic support levels: full, guided, light and independent,
- rapid support restoration after repeated struggle,
- independent default retained for Auro,
- vocabulary/reasoning mastery kept separate from decoding evidence,
- phonics-specific timing calibration,
- v23 saved-profile migration,
- repair of the recursive v23 interaction-profile wrapper,
- repair of stale `kidFace` and `pickNew` load-chain references,
- repair of the curriculum frontier's missing current-day input,
- removal of the v23 decoding path's vocabulary-proof leakage,
- updated PWA cache and complete release documentation.

Acceptance policy:

- taps are the required interaction; dragging is never required,
- full/guided support may replay audio automatically,
- light support keeps audio available without forcing it,
- independent support removes the decoding activity from the session,
- fade-out requires at least 24 attempts, evidence across all three formats and strong recent accuracy,
- two to three consecutive difficulties bring support back quickly,
- no phonics result grants or removes word-meaning mastery.

Historical v24 gate: deterministic model checks, static release checks, and mobile Chrome smoke checks passed before the v25 visual layer was built.

## Current release status — v26

v26 integrates the approved Auro, Teia, Peach, and family-scene PNGs as a reusable sprite-based character system. The four family scenes open Adventure, Words, Stories, and My Growth. The two girls retain separate expression choices, and Peach reacts to her current helper clue. The character UI does not write learning evidence.

Where development stopped: deterministic v26 character tests and the real-browser mobile/offline interaction test pass. Next: deploy the complete v26 ZIP and observe one short session with each child—especially which scene they tap, whether the expression choices feel genuinely like them, and whether the new art makes starting easier rather than lengthening screen time.
