# Chami Learning Adventure

Chami is an installable child-first learning PWA for **Auro** and **Teia**.

It combines:
- adaptive English vocabulary and reading development,
- Ukrainian language learning from beginner level,
- spaced repetition,
- child-specific difficulty,
- a playful Chami/Peach/Auro/Teia visual world.

## Live deployment

GitHub Pages project URL:

`https://kristinareddy.github.io/chami/`

## Refactored structure

```text
chami/
├── index.html
├── css/
│   └── app.css
├── js/
│   ├── app.js
│   ├── phonics-engine.js
│   ├── literacy-model.js
│   └── pwa.js
├── config/
│   └── family.js
├── curriculum/
│   └── data.js
├── assets/
│   ├── auro.png
│   ├── teia.png
│   ├── chami.png
│   ├── peach.png
│   └── world.png
├── manifest.webmanifest
├── service-worker.js
├── apple-touch-icon.png
├── icon-192.png
├── icon-512.png
├── PROJECT.md
├── CURRICULUM.md
├── ARCHITECTURE.md
└── CHANGELOG.md
```

## Non-negotiables

Before changing the app, preserve:

1. separate adaptive profiles for Auro and Teia,
2. independent English and Ukrainian difficulty,
3. spaced recall before new material,
4. learning-day rather than calendar-streak logic,
5. no required new learning when the children are with Dad,
6. installable PWA behavior,
7. child-first guided experience,
8. Chami as the main mascot/guide and Peach as a secondary companion.

## Current persistence

Progress is stored locally in browser storage. Cloud sync is a future production milestone.

## Development priority

## v12 milestone: Today's Adventure

The app now generates one child-facing guided session automatically:

**greeting → due recall/new English → due recall/new Ukrainian → active challenge → tiny story → reward**

The child no longer needs to decide which educational module to study.

## Family configuration and future product path

Family-specific identity now lives in `config/family.js`. This keeps Auro, Teia, Chami, Peach, custody rules and family-specific defaults separate from the reusable learning engine.

For now, optimize Chami for this family. Later, a generic product can replace `family.js` with onboarding and parent-configured profiles without rebuilding the adaptive engine.


## v13 — Active Learning

Today's Adventure now asks the child to demonstrate knowledge rather than mainly self-rate it.

The current retrieval formats are:
- meaning recognition,
- contextual use (English),
- listening recognition (Ukrainian),
- free recall.

Mastery therefore represents repeated evidence across different memory tasks, not exposure alone.


## v14 — Smart Session Planner

Chami now plans around a limited active-screen learning budget rather than blindly filling word quotas.

The default family configuration targets about 12 minutes and treats 15 minutes as the design ceiling. Review has priority. New-word candidates are checked before instruction so vocabulary the child already knows does not waste one of the day's new-word opportunities.

Off-screen missions are architected separately: they pause/avoid the screen-time budget, remain short and skippable, and are intended to send the child away from the device rather than extend app engagement.


## v17 — Controlled AI

Chami now has an optional AI content layer with a strict boundary.

The PWA itself never stores an AI provider key. Real AI requires a separately deployed server endpoint. Until that exists, Chami automatically uses local deterministic content.

AI is permitted to vary stories and explanations around objectives chosen by the learning engine; it does not control curriculum, mastery or session length.


## v18 — Learner Intelligence

The Grown-up area now translates Chami's raw memory records into an interpretable learner map.

Instead of reporting XP, it shows retention, transfer, due review, fragile knowledge, Ukrainian listening, Cyrillic literacy and deterministic next priorities.

The map remains intentionally conservative and reports when too little evidence exists.


## v19 — Adaptive Calibration

Chami now learns each child's approximate task pace locally and uses it to improve the limited-session plan.

The calibration is deliberately simple and interpretable: task-class moving averages, outlier rejection and conservative blending with defaults.

Pace is not scored. Its only purpose is to fit the right amount of high-value learning into the child's screen-time budget.


## v20 — Expressive & Transfer Learning

Chami now asks children to produce language, not only recognize it.

Short typing, imaginative context and speaking tasks provide additional learner evidence while remaining conservative about mastery. Browser speech recognition is optional and never treated as an authoritative pronunciation judge.


## v21 — Curriculum Engine

The curriculum is no longer conceptually a flat list. Chami now has evidence-based English and Ukrainian pathways.

The English ladder is designed to grow toward serious academic/exam vocabulary over years without teaching a young child as if she were already studying for an SAT. Ukrainian grows from sound and useful language toward sentence construction and later literacy/grammar.

Family learner state remains separate from reusable curriculum content.


## v22 — Curriculum Quality + Early Reader Mode

Chami now separates **what a child is capable of learning** from **how much text/typing the interface requires**.

Auro can receive more independent reading and writing. Teia receives audio-supported, short-text, large-tap interactions and speaking before typing. This lets her build vocabulary and reasoning while English decoding fluency develops in parallel.

The release also adds curriculum validation, morphology/word-family metadata, semantic relationships and Ukrainian sentence-frame metadata.


## v23 — Literacy Calibration

Chami now calibrates reading/input mechanics independently from vocabulary knowledge.

This is especially important for Teia: she can learn challenging spoken vocabulary and reasoning while receiving an early-reader interface with read-aloud, two-choice tapping, sound-to-print matching and speaking instead of mandatory typing.

As real reading evidence accumulates, Chami can gradually reduce scaffolding.


## v24 — Phonics, Tactile Practice & Scaffold Fade-Out

Chami now includes three bounded, tap-first English decoding formats:

- hear a word and tap its printed form,
- find a visible letter team inside a word,
- tap word parts in order to build the word.

`js/phonics-engine.js` preserves common English spelling teams such as `sh`, `ch`, `igh` and `tion` and creates deterministic word parts. These are visual spelling supports, not claims about exact phonemes or syllables.

Scaffolding now moves through **full → guided → light → independent** only after varied repeated success. A short run of struggle restores help. This evidence is stored separately for Auro and Teia and never changes vocabulary mastery.

v24 also repairs stale v23 integration references, gives phonics its own timing bucket, and updates the offline cache. Automated model, release and real-browser smoke tests live under `tests/`.
