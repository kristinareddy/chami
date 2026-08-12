# Chami — Family App to Future Product

## Phase 1: Family-first

Current priority.

Build the best possible learning experience for Auro and Teia.

Use real family context:
- their names,
- Chami and Peach,
- their learning history,
- their custody rhythm,
- their actual strengths and weaknesses,
- topics they enjoy.

Do **not** make the child experience generic merely to prepare for sale.

## Phase 2: Separate what is universal

Maintain a clean boundary:

### Reusable core
- adaptive learner model,
- spaced repetition,
- lesson generator,
- English curriculum system,
- Ukrainian curriculum system,
- progress analytics,
- rewards engine,
- PWA/app shell.

### Family configuration
- child names/profiles,
- starting levels,
- schedule rules,
- mascots,
- artwork,
- interests,
- parent goals.

v12 starts this separation with `config/family.js`.

## Phase 3: Pilot product

After Chami works consistently with the children:
- replace hard-coded family config with parent onboarding,
- let parents add child name/age/level/goals,
- offer generic mascot packs or optional uploaded family mascots,
- create privacy-safe cloud sync,
- test with a small number of outside families.

## Phase 4: Sellable product

Possible formats:
- paid family subscription,
- one-time downloadable app,
- school/teacher version,
- specialized language-learning packs,
- premium personalized character packs.

Do not decide pricing or business model before the family version demonstrates actual repeated use and learning value.

## Product advantage to protect

The strongest differentiator is not “5 vocabulary words.”

It is:
**a child-specific adaptive learning adventure whose curriculum changes automatically from real performance, wrapped in emotionally meaningful characters and stories.**

## v24 product boundary

v24 strengthens the reusable core without making the family experience generic:

- `js/phonics-engine.js` contains no Auro/Teia names or family rules,
- scaffold thresholds operate on a supplied learner profile,
- family configuration still sets each child's starting reading stage,
- decoding evidence remains local and separate from curriculum mastery,
- a future onboarding flow could initialize the same model for another child,
- tactile interactions require taps only, making the core more portable across phones and tablets.

Do not commercialize the scaffold thresholds from laboratory assumptions alone. First validate them through repeated real use with Auro and Teia, then pilot conservatively with outside families.

## v25 product boundary

v25 strengthens the emotional family experience while making the reusable boundary clearer:

- Auro/Teia/Chami/Peach art paths live in `config/family.js`.
- The visual engine receives any compatible learner profile and contains no family names.
- Gardens and achievements are computed from the same direct evidence the learning engine already stores.
- Inline-SVG icons can be reused across future themes without shipping an icon library.
- A future parent-onboarding product could swap a character pack and keep the same garden/achievement rules.

The current custom artwork is deliberately optimized for this family. Do not add public avatar upload, sharing, friends, leaderboards, or a marketplace before repeated child use shows the underlying learning loop is valuable and the privacy model is ready.

## v26 product boundary

v26 adds a reusable character-pack layer without turning private family identity into a platform feature:

- `js/illustrated-characters.js` maps any compatible 3×3 expression atlas to named UI reactions.
- Family-specific PNG paths remain in `config/family.js` and `assets/character-bible/`.
- The reusable destination map knows only app routes, not educational scores or family photographs.
- Expression choices are local presentation preferences and are not analytics, assessment, or inferred emotion recognition.
- No camera, face recognition, photo upload, social sharing, avatar marketplace, or cloud identity service is added.
- A future generic family can supply a different reviewed character pack while retaining the same adaptive engine.

The leading v27 candidate remains **Adaptive Story Adventures**—short Chami/Peach stories that reuse mastered and due vocabulary—but the decision must follow the v26 child observation. If the richer Home creates hesitation or excessive scrolling, v27 should first simplify and reorder the illustrated experience.
