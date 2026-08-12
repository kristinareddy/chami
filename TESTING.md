# Chami v26 Test Checklist

## Automated release checks

Run from the project root:

```bash
node tests/validate-v24.mjs
node tests/validate-v25.mjs
node tests/validate-v26.mjs
node tests/validate-release.mjs
```

Browser checks:

- `tests/browser-smoke.mjs` protects the v24 Teia phonics formats and Auro's independent path.
- `tests/browser-v25.mjs` protects the new Home/My Growth visuals, functional destinations, model isolation, mobile width, accessible button names/target sizes, character loading, and offline reload.
- `tests/browser-v26.mjs` protects the approved PNG loading, expression sprites, separate Auro/Teia UI choices, Peach reactions, all four scene destinations, mobile sizing, and offline reload.

## v26 character interaction checks

- Home’s main illustration shows Auro, Teia, Chami, and Peach together and starts the Adventure when tapped.
- Each quadrant of the four-scene illustration opens its named destination.
- Auro’s page says **Auro’s Creative Meadow** and uses only the Auro expression sheet.
- Teia’s page says **Teia’s Wonder Garden** and uses only the Teia expression sheet.
- Tap several expressions for each child; the large portrait and supportive sentence must change immediately.
- Switch between children; each child’s last expression must remain separate.
- Tap Peach; her pose and evidence-aware clue must update together.
- Start an Adventure and open My Growth; both must show the active learner’s correct expression artwork.
- Confirm no private photo/HEIC files are present anywhere in the release folder.
- Confirm expression taps do not change learning levels, due reviews, mastery, garden growth, or achievements.

The browser tests require Playwright and Chrome/Chromium.

## Before the children use it

- Confirm the selected profile portrait changes between Auro and Teia.
- Tap Chami: Today's Adventure should start.
- Tap Peach: the speech bubble should change to a current, evidence-aware clue.
- Tap all six Home destinations: each must open a real activity or evidence view.
- Open My Garden: it should explain that growth comes from learning.
- Open My Growth: evidence and locked/unlocked milestones should match the selected child.
- Close/reopen online, then test once offline after the v26 service worker activates.

## First child session — observe before explaining

For each child, record:

- What does she tap first?
- Does she recognize which profile is selected?
- Does the Start button feel obvious?
- Does she understand that Chami guides and Peach helps?
- Does she try every illustrated tile, or ignore some?
- Can she return Home without help?
- Does the garden feel connected to learning, or like unrelated decoration?
- Do locked achievements motivate curiosity without creating disappointment?
- Does the richer Home delay the start of learning?

## Teia-specific checks

- The new visuals must not increase reading load inside phonics activities.
- Hear-and-tap, letter-team match, and word building remain large and tap-first.
- Chami's larger portrait must not hide choices on iPhone.
- Audio/replay still works reliably.
- Scaffold help still fades only after varied decoding success and returns after struggle.

## Auro-specific checks

- Her portrait and My Growth should feel age-appropriate, not babyish.
- No special decoding activity is forced on her fresh fluent-reader profile.
- Independent reading, context, expression, and written response remain available.
- Achievements should describe actual evidence rather than trivial app use.

## Regression checks

- Switching profiles never mixes the two learner histories.
- Garden growth is different when their saved evidence differs.
- Decoding evidence does not mark vocabulary meaning as mastered.
- Garden/badge calculation does not add points, change skill levels, or change review dates.
- Adventure stays within the configured screen-time budget.
- Reduced-motion mode removes meaningful animation without hiding information.
- The app works at 390 px wide without sideways scrolling.

The v26 test question is not simply “Do they like the pictures?” It is: **Do the consistent characters help each child recognize her own space, know what is clickable, and begin real learning without extra explanation?**
