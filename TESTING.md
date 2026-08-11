# Chami v24 Test Checklist

## Automated release checks

Run from the project root:

```bash
node tests/validate-v24.mjs
node tests/validate-release.mjs
```

`tests/browser-smoke.mjs` is the browser-level regression test. It verifies a mobile-size Teia session, all three tactile formats, Auro's independent path and uncaught page errors. It needs Playwright plus an installed Chromium/Chrome browser.

## First real-device session — Teia

- Confirm one decoding moment appears without making the adventure longer.
- Confirm whole-word audio plays reliably and the replay button works.
- Confirm hear-and-tap begins with two large choices at full support.
- Confirm letter-team choices are easy to tap and visibly present in the target word.
- Confirm word parts can be built entirely by tapping; dragging is not required.
- Confirm an incorrect build reveals the word gently and allows continuing.
- Confirm free typing remains nonessential.
- Watch whether the visual parts help or confuse; do not coach unless she is stuck.

## First real-device session — Auro

- Confirm no special decoding activity is forced on her fresh fluent-reader profile.
- Confirm independent reading, context questions and written response remain available.
- Confirm Teia's large-target accommodations do not make Auro's path feel babyish.

## Scaffold behavior

- Confirm Auro and Teia show separate literacy histories in Grown-ups.
- Confirm a single success does not fade support.
- Confirm evidence rotates among printed-word match, pattern match and word build.
- Confirm repeated varied success can reach guided, light and independent.
- Confirm two or three recent difficulties bring assistance back.
- Confirm decoding results do not mark word meaning as mastered.

## Regression and deployment

- Switch child profiles repeatedly without an error.
- Complete an English word, Ukrainian item, expressive task and reward flow.
- Confirm timing calibration shows a Phonics practice row.
- Close and reopen the installed app; progress should remain.
- Test once online, then once offline after the new service worker finishes installing.
- Confirm GitHub Pages serves `js/phonics-engine.js` rather than a 404.

Record hesitation, accidental taps, audio failures and visible frustration. Those observations are v25 evidence; session length or superficial engagement is not the goal.
