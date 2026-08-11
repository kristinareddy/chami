# Chami — Architecture

## Current architecture

Chami is a static client-side PWA hosted on GitHub Pages.

### Files
- `index.html`: semantic screen markup only.
- `css/app.css`: all visual design and responsive rules.
- `curriculum/data.js`: current English/Ukrainian curriculum bank.
- `js/app.js`: learner state, adaptive engine, spaced repetition and UI behavior.
- `js/pwa.js`: service-worker registration.
- `service-worker.js`: offline cache.
- `assets/`: external character/world graphics.
- `manifest.webmanifest`: installation metadata.

## Why this refactor matters

The previous deployment embedded graphics and all application logic inside one ~6 MB HTML document. This worked as a prototype but made future changes risky.

The refactor:
- removes base64 artwork from HTML,
- makes curriculum independently editable,
- separates presentation from learning logic,
- makes GitHub diffs understandable,
- prepares the app for more sophisticated modules.

## Current persistence model

Browser `localStorage`.

This is acceptable for prototype use, but progress is tied to the browser/device.

## Future modules

The next extraction should split `js/app.js` further into:

```text
js/
├── app.js
├── adaptive-engine.js
├── spaced-repetition.js
├── storage.js
├── lesson-generator.js
├── audio.js
└── ui.js
```

Do this only after the current refactored build is verified in production.

## Future data model

Eventually move curriculum from one JS object into structured JSON or a database-backed content service.

Potential learner record:

```text
learner
  id
  language
  skill estimates
  item memory records
  recent performance window
  learning-day count

memory item
  item_id
  seen_count
  retrieval_successes
  interval
  next_due_learning_day
  mastery
  difficulty
```

## Deployment invariants

Any future refactor must preserve:
- relative paths compatible with GitHub Pages project hosting,
- `manifest.webmanifest`,
- iOS metadata,
- service-worker registration,
- app icons,
- offline fallback.

## v12 boundary: core vs family configuration

`config/family.js` is now the first explicit personalization layer.

The reusable core should increasingly avoid hard-coded names, mascots and family rules. Family-specific values should be read from configuration.

This is important for a future generic product, but the immediate UX remains optimized for Auro and Teia.

## Today's Adventure

v12 adds a guided lesson generator on top of the existing adaptive functions.

The generator:
1. checks custody/day mode,
2. increments a learning day only when starting an active session,
3. gathers due items first,
4. calculates new slots independently for English/Ukrainian,
5. assembles the sequence,
6. collects performance evidence,
7. updates item memory and language skill estimates,
8. ends with contextual story + reward.


## v13 — Active-learning evidence layer

Memory records now support a `proof` object recording which retrieval formats have succeeded.

The guided adventure chooses a format based on missing evidence rather than simply displaying a flashcard repeatedly.

This is still implemented inside `js/app.js` for this milestone. A later refactor should extract:
- assessment/retrieval generators,
- mastery estimator,
- answer normalization,
into dedicated modules once behavior has been tested with the children.


## v14 — Session planner

The planner now treats attention/screen time as a scarce resource.

`config/family.js` contains configurable duration estimates and the target/hard screen-time budgets.

Planning uses estimated active interaction seconds rather than wall-clock time. This avoids penalizing a child for putting the phone down during an off-screen task.

Known-word placement releases the teaching time that had been reserved for that candidate.

Future refinement should replace static duration estimates with rolling per-child estimates learned from actual completion times.


## v15 — Ukrainian game layer

The smart session planner can substitute a Ukrainian literacy game for a generic story/application slot when known Ukrainian vocabulary is available.

This keeps games inside the same limited screen-time budget rather than adding extra engagement time.

The current implementation lives in `js/app.js`. Once real-device behavior is validated, Ukrainian game generation should move to its own module.


## v16 — Experience layer

New experience functions remain client-side:
- deterministic garden/world rendering from learner mastery,
- Web Audio API micro-feedback tones,
- CSS-only micro-animations,
- event-driven character reactions.

No third-party animation or analytics SDK is introduced.

This keeps the PWA small, offline-friendly and privacy-preserving.

Future production work may move experience functions into `js/world.js` and `js/feedback.js` after child testing.


## v17 — AI boundary

### Browser
`js/ai-client.js` contains no provider secret.

It calls a configurable family AI endpoint only when enabled. If the endpoint is missing, unavailable or times out, it falls back to deterministic local content.

### Server
`server/openai-gateway.example.mjs` is a reference gateway only. It must be deployed separately from GitHub Pages.

Provider API credentials remain in server environment variables.

The gateway:
- accepts only `micro_story` and `explanation`,
- sanitizes payload sizes,
- uses pseudonymous learner IDs,
- does not require real child names,
- sends tightly scoped instructions,
- requests no open-ended dialogue,
- returns bounded JSON,
- uses `store: false` in the OpenAI Responses API call.

### Privacy
Do not send:
- child photos,
- addresses,
- school names,
- contact information,
- free-form personal diary content,
unless a future explicit privacy design requires it and the parent deliberately opts in.


## v18 — Learner-model interpretation module

Added `js/learner-model.js`.

It is deliberately an interpretation layer over the existing memory records. It does not overwrite raw evidence.

Responsibilities:
- classify item knowledge state,
- aggregate language-level evidence,
- identify fragile/due items,
- detect mismatches such as recognition > recall or Ukrainian listening > literacy,
- generate deterministic priority signals for the grown-up view.

Future predictive modeling should preserve this separation:
**raw learner evidence → interpretable features → lesson decision**.

AI may eventually summarize these features for a parent, but AI should not silently rewrite learner state.


## v19 — Calibration module

Added `js/calibration.js`.

It stores per-profile exponentially weighted moving averages for activity classes:
- placement,
- review,
- new word,
- challenge,
- Ukrainian game,
- story,
- reward.

The first observations remain blended with conservative default estimates. As samples accumulate, the learner-specific estimate gets more weight.

Timing records are local browser state. No analytics service is used.

Outlier pauses over 180 seconds for one screen are ignored because they likely represent interruption rather than learning time.

Planning now combines:
**knowledge state + review need + activity evidence gaps + calibrated duration**.


## v20 — Transfer module

Added `js/transfer.js`.

It chooses expressive tasks from already-seen curriculum items, prioritizing items missing recall/context evidence.

Speech uses the browser Web Speech recognition interface when available and gracefully falls back to a child/grown-up self-confirmation flow when unavailable.

No audio is uploaded by Chami's own code in this release.

Future controlled-AI semantic evaluation may assess a short typed response against a known target meaning, but it must return bounded evidence rather than directly grant mastery.


## v21 — Curriculum frontier

Added `js/curriculum-engine.js`.

The curriculum engine:
- maps item difficulty to named learning bands,
- calculates an evidence-based maximum eligible difficulty,
- creates a frontier of unseen eligible material,
- provides grown-up pathway status.

The curriculum data remains reusable. Family-specific learner history controls where each child sits on the generic pathway.

This separation is important for a future commercial Chami:
**reusable curriculum + reusable learning engine + separate family learner profiles/configuration**.


## v22 — Curriculum quality / literacy delivery module

Added `js/curriculum-quality.js`.

Responsibilities:
- read child-specific literacy interaction configuration,
- validate curriculum item structure,
- expose morphology families and semantic relations,
- support literacy-aware presentation without forking the core curriculum.

The learner model and curriculum remain shared; **delivery mechanics are adaptive**.

This is also commercial-product friendly: future families can configure or auto-assess reading/typing stage without changing the underlying learning engine.


## v23 — Literacy model

Added `js/literacy-model.js`.

It stores per-child local literacy mechanics evidence separately from language mastery.

The model selects delivery support based on:
- configured starting stage,
- accumulated reading/decoding evidence,
- typing evidence.

The lesson engine consumes the support profile to choose interaction mechanics.

This preserves the architecture:
**knowledge target → learner model → literacy delivery adapter → child interaction**.

Future commercial versions can initialize literacy stage through parent onboarding or a short placement game.


## v24 — Phonics engine and scaffold policy

Added `js/phonics-engine.js` as a reusable, family-independent module.

Responsibilities:

- normalize eligible single English words,
- preserve configured multi-letter spelling teams during tokenization,
- create deterministic two- or three-part visual builds,
- select a visible focus pattern,
- produce bounded pattern and printed-word distractor sets.

`js/literacy-model.js` now lazily migrates v23 profiles and stores:

```text
profile.literacyModel.english
├── mechanics
│   ├── printedWordRecognition
│   ├── shortSentenceRead
│   ├── decodingSuccess
│   ├── typing
│   └── tapAccuracy
└── phonics
    ├── recent
    └── activities
        ├── printedWordMatch
        ├── patternMatch
        └── wordBuild
```

Each activity record contains attempts, successes and a bounded recent-result window. Scaffold level is derived rather than permanently asserted, so it can fade after varied evidence and return after recent struggle.

The session planner replaces at most one application/new-placement slot with a decoding step and keeps it inside the existing screen-time budget. `js/calibration.js` tracks these tasks in a separate `phonics` timing bucket.

Integration order is:

**family config → curriculum → shared engines → phonics engine → literacy model → app integration → PWA**.

The service worker caches the new engine under `chami-v24-phonics-tactile-scaffolds`. The browser smoke test protects the repaired interaction-profile wrapper and stale DOM/function references that previously stopped later release layers from loading.
