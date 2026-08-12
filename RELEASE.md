# Chami v26 — Illustrated Characters

Baseline: complete `Chami_v25_Living_Visual_World` release.

Release purpose: integrate the approved consistent character artwork as functional app UI before the children’s next test session, while preserving the sophisticated adaptive education underneath.

## What is now real and functional

- Home shows Auro, Teia, Chami, and Peach together in the primary illustrated call to action.
- The complete four-scene family image is a large-tap navigation map:
  - meadow discovery → Today’s Adventure,
  - cozy learning → English Words,
  - twilight garden → Stories,
  - proud creation → My Growth.
- Auro has a coral Creative Meadow with nine named, tappable expressions.
- Teia has a purple Wonder Garden with nine different named, tappable expressions.
- Each child’s current expression remains separate when the active learner changes.
- My Growth and Adventure show the correct active child and expression.
- Peach changes pose when her existing helper clue changes.
- All approved art is cached for offline use.

## Character locks

- Auro: older, green eyes, loose golden hair, coral clothing, no braid.
- Teia: younger, blue eyes, one side braid and purple flower, purple clothing, no overalls.
- Chami: cream coat, yellow-green eyes, pink nose, brown collar, gold tag.
- Peach: tiny round chestnut-and-cream hamster with stable markings.

## Privacy and educational integrity

- No real family photograph or HEIC reference is included in the release.
- Expression selection is stored only in the optional `state.ui` branch.
- Character interactions never call the performance recorder or alter mastery/history.
- Auro and Teia retain separate adaptive, literacy, phonics, English, and Ukrainian models.
- The `chami-v12-state` storage key is unchanged, so existing local progress remains available after deployment.
- No points, coins, streak pressure, leaderboard, or screen-time reward was added.

## Validation completed

- Complete JavaScript syntax validation.
- Existing v24 and v25 deterministic regression checks.
- 7 deterministic v26 character/configuration/privacy/integration checks.
- Static release validation for script order, documentation, and all cached files.
- Real mobile Chrome test at 390×844 covering:
  - all four approved images loading,
  - nine Auro and nine Teia expression taps,
  - separate child UI state,
  - Peach reaction changes,
  - all four scene destinations,
  - Adventure and My Growth character use,
  - accessible names and large targets,
  - horizontal overflow,
  - offline reload.

Deployment artifact: `Chami_v26_Illustrated_Characters.zip`.

Next gate: deploy v26 and let each child try one short session with minimal adult explanation. Observe which scene is tapped first, whether the expression page feels recognizably personal, whether the art clarifies the route, and whether it adds too much scrolling before the learning begins.

Likely v27 decision after observation: either simplify/reorder the illustrated Home based on actual taps or begin Adaptive Story Adventures using mastered and due vocabulary. Do not choose based only on aesthetics.
