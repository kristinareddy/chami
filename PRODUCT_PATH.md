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
