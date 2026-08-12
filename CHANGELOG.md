# Changelog

## v26 — Illustrated Characters
- Added the approved high-resolution Auro, Teia, Peach, and four-scene family artwork under `assets/character-bible/`.
- Added `js/illustrated-characters.js` as a pure character-sheet/sprite metadata module.
- Replaced the Home hero’s loose portrait collage with one clickable all-together family scene.
- Added a four-quadrant illustrated scene map that opens Adventure, Words, Stories, and My Growth.
- Added distinct Auro and Teia character worlds with nine large, tappable expression choices each.
- Preserved Auro’s green eyes/loose hair/coral identity and Teia’s blue eyes/single braid/purple identity across the app.
- Stored each child’s chosen expression separately as presentation-only UI state.
- Added the selected child’s expression to Adventure and My Growth.
- Connected Peach’s nine-pose sheet to her existing evidence-aware helper clue.
- Kept all character interactions outside learning evidence, mastery, difficulty, reviews, and achievements.
- Excluded every real photographic reference from the release tree and deployment package.
- Updated the offline cache to `chami-v26-illustrated-characters` and cached all four approved PNGs plus the new module.
- Added deterministic character-boundary tests and a real-browser mobile/offline/click-navigation test.
- Preserved the `chami-v12-state` key, independent learner models, v24 decoding scaffolds, and v25 evidence visuals.

## v25 — Living Visual World
- Replaced the static world image and decorative character row with a functional illustrated Home.
- Added separate generated Auro, Teia, Chami and Peach artwork under `assets/characters/`.
- Connected the active child's portrait to profile selection and My Growth.
- Connected Chami to Today's Adventure and Peach to evidence-aware help.
- Added six large illustrated destinations for Words, Listen, Build, Stories, Garden and My Growth.
- Added `js/visual-world.js` with reusable inline-SVG icons and pure evidence-to-visual derivation.
- Added four evidence-grown garden plots for English, Ukrainian, decoding and expression/context.
- Added six named achievements with visible unlock evidence and no XP/streak dependency.
- Rebuilt My Growth as a visual learning trail while preserving the detailed performance report.
- Replaced remaining hard-coded v24 character references inside Adventure with configured v25 assets.
- Fixed navigation active-state restoration when screens are opened programmatically.
- Fixed the Adventure card width so mobile activities use the available screen.
- Added reduced-motion support, large visual tap targets and accessible icon labels.
- Updated offline cache to `chami-v25-living-visual-world` and included every new runtime asset.
- Added deterministic v25 visual-model tests and a real-browser mobile/offline/accessibility test.
- Preserved the v24 phonics/scaffold behavior and separate Auro/Teia local learner models.

## v24 — Phonics, Tactile Practice & Scaffold Fade-Out
- Added `js/phonics-engine.js` with deterministic English letter-team tokenization and word parts.
- Added hear-and-tap printed-word matching.
- Added visible letter-team matching.
- Added tap-in-order word building; dragging is never required.
- Added per-child attempts, successes and bounded recent evidence for each decoding format.
- Added full, guided, light and independent support levels.
- Added conservative, varied-evidence scaffold fade-out and rapid restoration after struggle.
- Kept phonics evidence separate from vocabulary and reasoning mastery.
- Added v23 literacy-profile migration without deleting local progress.
- Added a phonics timing-calibration bucket.
- Ensured supported sessions reserve at most one decoding moment inside the existing budget.
- Preserved Auro's fluent-reader independent path and Teia's audio/tap-first path.
- Fixed the v23 recursive interaction-profile wrapper.
- Fixed stale `kidFace` and undefined `pickNew` integration references that could halt app initialization.
- Fixed curriculum review-debt calculations so the current learning day is passed into the reusable frontier engine.
- Removed the v23 decoding path's accidental write into vocabulary proof.
- Added deterministic model, release-integrity and real-browser smoke tests.
- Added a favicon reference to prevent a needless missing-resource request.
- Hid global profile/navigation chrome during an Adventure so mobile controls are not obscured.
- Updated PWA cache to `chami-v24-phonics-tactile-scaffolds`.

## v23 — Literacy Calibration & Multimodal Scaffolding
- Added `js/literacy-model.js`.
- Added independent per-child literacy mechanics model.
- Added early/developing/fluent reader delivery stages.
- Added sound-to-print English decoding activity.
- Added audio-first read support for nonfluent readers.
- Added visual word chunking support.
- Added adaptive read-aloud/fewer-choice/voice-over-typing behavior.
- Added Grown-up literacy calibration dashboard.
- Literacy evidence is kept separate from vocabulary/reasoning mastery.
- Slow reading/typing does not lower the curriculum ceiling.
- Updated PWA cache to `chami-v23-literacy-calibration`.

## v22 — Curriculum Quality + Early Reader Mode
- Added child-specific literacy/interaction configuration.
- Auro configured as a fluent child reader with written-response access.
- Teia configured as an early reader with developing computer/typing comfort.
- Added audio-supported early-reader word delivery.
- Reduced early-reader meaning choices to two large targets.
- Early-reader mode avoids mandatory free typing.
- Added read-aloud support for reading-heavy prompts.
- Early-reader expressive tasks prefer speaking over typing.
- Added curriculum-quality validator.
- Added English morphology metadata and semantic-relation metadata.
- Added word-family feedback moments.
- Added Ukrainian sentence-frame/pattern metadata.
- Preserved shared core curriculum while adapting delivery mechanics per learner.
- Updated PWA cache to `chami-v22-quality-early-reader`.

## v21 — Curriculum Engine Expansion
- Added `js/curriculum-engine.js`.
- Expanded English with a multi-band academic/reasoning vocabulary ladder.
- Added later advanced terms such as infer, justify, synthesize, corroborate, nuance and refute.
- Expanded Ukrainian with greetings, household vocabulary, descriptions, sentence frames, conversation and feelings.
- Preserved English transliteration for Ukrainian beginner support.
- Added evidence-based curriculum frontier.
- Harder material unlocks from retention/recall/readiness rather than age alone.
- Weak retention creates consolidation pressure instead of endless difficulty escalation.
- Added Grown-up Curriculum Path display.
- Updated PWA cache to `chami-v21-curriculum-engine`.

## v20 — Expressive & Transfer Learning
- Added `js/transfer.js`.
- Added short learner-generated English sentence tasks.
- Added novel-context/imagination transfer prompts.
- Added spoken English/Ukrainian practice.
- Added optional browser speech recognition with graceful fallback.
- Speech recognition is supportive evidence only and cannot independently grant mastery.
- Added expressive/spoken evidence fields to learner records.
- Expressive activities replace story/application slots instead of extending session time.
- Added bounded off-screen mission rendering architecture.
- Preserved 1–3 minute, skippable, zero-screen-budget rule for real-world missions.
- Updated PWA cache to `chami-v20-expressive-transfer`.

## v19 — Adaptive Calibration
- Added per-child local task-duration calibration.
- Added `js/calibration.js`.
- Smart Session Planner now uses learner-specific timing estimates as evidence accumulates.
- Initial estimates are blended with defaults until enough observations exist.
- Long pauses and off-screen missions do not distort screen-time calibration.
- Added Grown-up calibration dashboard with observed task pace and confidence.
- Added knowledge-map-driven activity rebalancing:
  - recognition > recall → retrieval/transfer,
  - Ukrainian listening > literacy → Cyrillic game,
  - literacy > listening → listening work,
  - fragile memory → reinforcement.
- Timing is explicitly not treated as a score or reward.
- Updated PWA cache to `chami-v19-adaptive-calibration`.

## v18 — Learner Intelligence
- Added `js/learner-model.js` as an interpretable knowledge-map layer.
- Added Grown-up learner dashboard based on actual learning evidence rather than XP.
- Added item states: exposed, recognized, fragile, usable, forgetting, mastered and mastered-due.
- Added English retention and transfer signals.
- Added Ukrainian listening vs Cyrillic literacy signals.
- Added review-load and fragile-memory reporting.
- Added deterministic next-priority recommendations.
- Added conservative “not enough evidence yet” behavior.
- Raw learner evidence remains unchanged; the knowledge map interprets rather than overwrites it.
- Updated PWA cache to `chami-v18-learner-intelligence`.

## v17 — Controlled AI Chami
- Added optional controlled AI client with deterministic offline fallback.
- AI can generate bounded micro-stories from engine-selected target/known words.
- Added optional alternative explanations after incorrect English responses.
- Added `ai/contract.json` documenting the allowed request/response boundary.
- Added server-side OpenAI gateway example.
- Browser code contains no provider API key.
- Added pseudonymous learner IDs for AI requests.
- AI is disabled by default until a secure endpoint is configured.
- Core learning remains fully functional offline/non-AI.
- Updated PWA cache to `chami-v17-controlled-ai`.

## v16 — Chami World
- Added a Chami vector logo/wordmark with pink nose and yellow-green eyes.
- Added a mastery-driven learning garden on Home.
- Garden growth reflects mastered English/Ukrainian items rather than XP or screen time.
- Added short Chami reaction animations for correct, incorrect and listening moments.
- Added small celebratory particles for demonstrated success.
- Added lightweight Web Audio API feedback tones.
- Added a child-accessible sound on/off control.
- Kept all animation event-driven; no looping attention animations.
- Added Chami logo to PWA offline cache.
- Updated PWA cache to `chami-v16-chami-world`.

## v15 — Ukrainian Play
- Added Cyrillic literacy games tied to already encountered Ukrainian vocabulary.
- Added Letter Hunt.
- Added Chami's Missing Letter.
- Added Build the Word with letter tiles.
- Added Ukrainian literacy proof fields to each word's learner record.
- Games progress from recognition toward reconstruction instead of isolated alphabet memorization.
- Ukrainian play participates in the v14 smart-session time budget instead of extending screen time.
- Peach now appears as the companion for Ukrainian game interactions.
- Updated PWA cache to `chami-v15-ukrainian-play`.

## v14 — Smart Session Planner
- Added a target ~12-minute active-screen session budget with a 15-minute design ceiling.
- Reframed 5+5 new words as maximums rather than quotas.
- Added rapid placement checks before candidate words consume teaching time.
- Known candidate words are recorded as probable prior knowledge and do not consume a new-word slot.
- One placement success does not grant mastery.
- Due reviews receive first claim on the session budget.
- Added estimated-duration planning for review, placement, new learning, challenge, story and reward activities.
- Added explicit end-of-session language rather than endless continuation.
- Added architecture for bounded, skippable off-screen missions that do not count against screen time.
- Updated PWA cache to `chami-v14-smart-session`.

## v13 — Active Learning
- Replaced self-rating as the primary word-learning evidence inside Today's Adventure.
- Added objective meaning-recognition challenges.
- Added English contextual-use challenges.
- Added Ukrainian listening-without-text challenges.
- Added free-recall typing challenges.
- Added per-word multi-format `proof` evidence.
- Mastery now requires spaced success plus evidence across multiple retrieval formats.
- Wrong answers shorten the review interval and immediately show a concise explanation.
- Existing v12 learner state remains compatible; old memory records gain proof data lazily.
- Updated PWA cache to `chami-v13-active-learning`.

## v12 — Today's Adventure
- Added an automatically generated guided child session.
- Today's Adventure sequences language work without requiring the child to choose modules.
- Due review remains higher priority than new material.
- English and Ukrainian new-item counts are independently throttled from recent performance and review backlog.
- Added guided listening/comprehension challenge selection.
- Added tiny learned-word story and completion reward.
- Added Chami/Peach character participation inside the lesson flow.
- Added `config/family.js` to separate family personalization from reusable learning logic.
- Added `PRODUCT_PATH.md` describing the family-first → generic-product path.
- Updated service-worker cache to `chami-v12-adventure`.
- Preserves v11 refactor structure and attempts to migrate earlier local learner state.

## v11 — Refactor
- Split monolithic HTML into maintainable source files.
- Moved CSS to `css/app.css`.
- Moved curriculum bank to `curriculum/data.js`.
- Moved application logic to `js/app.js`.
- Moved PWA registration to `js/pwa.js`.
- Restored generated character/world art as normal external assets instead of base64 data.
- Updated service-worker cache.
- Added README, product requirements, curriculum spec and architecture documentation.
- Preserved current adaptive engine and child profiles.

## v10
- Embedded approved visual artwork directly into the prototype.

## v9
- Chami became the primary mascot.
- Corrected child names to Auro and Teia.
- Shifted interface toward child-facing adventure/game design.

## v7–v8
- Added independent adaptive difficulty for each child and language.
- Added spaced repetition, English skills, Ukrainian listening/Cyrillic practice and parent reporting.

## Earlier prototypes
- Established 5-English + 5-Ukrainian active-day target.
- Added custody-aware learning-day logic.
