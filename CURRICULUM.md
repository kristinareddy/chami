# Chami — Adaptive Curriculum

## Core adaptive rule

The curriculum must always adjust automatically to the child.

Each child has separate English and Ukrainian models. Difficulty can move independently by language.

Signals include:
- recent recall accuracy,
- active-test accuracy,
- current review backlog,
- mastery of current-level material,
- per-item difficulty,
- repeated spaced retrieval.

## New-material throttle

The target is a maximum, not a quota.

On an active learning day:
- up to 5 new English items,
- up to 5 new Ukrainian items.

Reduce new items automatically when:
- too many reviews are due,
- recent accuracy drops,
- current-level mastery is weak.

## Mastery

An item is not mastered after one exposure.

Progression:
1. Seen
2. Recognized
3. Recalled
4. Used
5. Mastered after successful spaced retrieval on different learning days

## English pathway

Vocabulary → context → synonym/antonym relations → word families → prefixes/roots/suffixes → inference → evidence → reading comprehension → argument/analysis → later exam-style reasoning.

English should become substantially larger over time: hundreds and eventually thousands of graded items selected adaptively.

## Ukrainian pathway

Children begin essentially from zero.

Use English as the bridge language.

Early presentation:
- Cyrillic,
- English-friendly pronunciation,
- English meaning,
- audio,
- useful sentence.

Progression:
listening → speaking → high-frequency vocabulary → phrases → sentence building → Cyrillic recognition → reading → grammar → writing → independent comprehension.

Do not force alphabet memorization in isolation before meaningful spoken words. Introduce Cyrillic through language the children already recognize.

## Difficulty control

Suggested behavior:
- sustained recent accuracy ≥ 85% + manageable review backlog → increase challenge,
- 70–84% → maintain,
- below 70% or excessive backlog → reduce challenge and reinforce.

This logic is directional rather than a permanent fixed threshold; future versions can improve the learner model.


## v13 — Evidence-based mastery

Each memory item now tracks successful proof formats.

English proof types:
- meaning recognition,
- contextual use,
- free recall.

Ukrainian proof types:
- meaning recognition,
- listening recognition,
- free recall.

Current mastery requires:
- at least 4 successful retrievals,
- an interval of at least 7 learning days,
- successful evidence from at least 3 retrieval formats.

These thresholds are an initial model and should be calibrated from Auro and Teia's actual use rather than treated as educational constants.


## v14 — Placement before instruction

A new-word candidate is not assumed to be new.

Before spending teaching time on it, Chami may run a rapid placement probe:
- correct answer → probable prior knowledge; schedule later verification and replace the candidate;
- incorrect answer → candidate is useful new material; teach it;
- one placement answer never grants mastery.

This prevents known vocabulary from wasting the child's limited learning budget.

## Time-aware curriculum allocation

The session planner allocates estimated active-screen seconds in this order:
1. due retrieval,
2. placement of candidate new material,
3. genuinely new material,
4. one transfer/application challenge,
5. story/application when time remains,
6. completion/reward.

The item ceilings remain up to 5 new English and up to 5 new Ukrainian words, but the time budget can reduce either number to zero.


## v15 — Cyrillic acquisition evidence

Ukrainian literacy now records additional proof:
- `letterHunt`: recognizes a constituent Cyrillic letter in a known word,
- `missingLetter`: can restore a missing letter,
- `buildWord`: can reconstruct the known word from letter tiles.

These are literacy evidence and complement—not replace—meaning, listening and recall evidence.

Do not require alphabet mastery before meaningful Ukrainian vocabulary. Letter knowledge should emerge repeatedly from useful words.


## v16 — Reward integrity

Visual progression is derived from **mastered knowledge**.

Do not reward:
- raw screen minutes,
- meaningless repeated taps,
- artificially extended sessions.

The garden is a representation of retained learning, not an engagement metric.


## v17 — Generative content rule

Generative content may vary the **context**, never the required learning objective.

Example:
- engine target = `reluctant`;
- AI may create a Chami mystery using `reluctant`;
- AI may not replace it with another vocabulary target because it prefers a different story.

The learner model remains the source of truth.


## v18 — Knowledge-state interpretation

Chami distinguishes different forms of knowing.

A child may:
1. have seen an item,
2. recognize the meaning,
3. retrieve it without clues,
4. use/understand it in context,
5. transfer it to a new situation,
6. retain it after spacing.

Ukrainian additionally separates:
- listening,
- spoken/meaning recall,
- Cyrillic recognition,
- word reconstruction.

A single numeric level cannot faithfully represent these dimensions. The learner map should drive lesson allocation while mastery remains based on direct performance evidence.


## v19 — Pace is adaptive, not a performance score

Task duration is a planning signal, not an achievement metric.

Auro and Teia may legitimately need different amounts of time for:
- retrieval,
- new vocabulary,
- listening,
- Cyrillic games,
- contextual reasoning.

The planner should learn those differences so that each child receives a useful amount of material within the same maximum screen-time philosophy.

Do not interpret slower completion as weaker learning without corroborating accuracy/retention evidence.


## v20 — Expression and transfer evidence

Knowing vocabulary should eventually include the ability to retrieve and apply it without being shown the answer.

New evidence fields may include:
- `expression`: child produced a typed response containing the target,
- `spokenAttempt`: child attempted spoken production,
- `spokenRecognition`: browser speech recognition also detected the target.

These are intentionally not equivalent to semantic mastery.

A typed sentence containing a word can still misuse it. Until semantic evaluation is sufficiently reliable and bounded, Chami treats expression as additional evidence and schedules later verification.

Speech recognition must never become a pronunciation gate for young multilingual learners.


## v21 — Long-range curriculum architecture

### English pathway
1. Explorer — rich everyday vocabulary
2. Builder — precision and early reasoning
3. Thinker — cross-subject academic vocabulary
4. Analyst — inference, evidence and structured reasoning
5. Scholar — advanced academic vocabulary
6. Advanced Scholar — high-level academic/exam-ready language

This is not an SAT cram list for young children. The long-term goal is to build the semantic, morphological and reasoning foundation that later makes standardized-test vocabulary substantially easier.

### Ukrainian pathway
1. Sounds & Core
2. First Words
3. Little Phrases
4. Sentence Builder
5. Growing Speaker
6. Independent Path (future)

The sequence remains sound/meaning first, then Cyrillic on familiar language. Useful phrases and sentence frames are introduced before abstract grammar terminology.

### Advancement
Difficulty is not unlocked because of birthday/grade alone.

Readiness uses:
- breadth of encountered items,
- spaced mastery,
- free recall evidence,
- review debt.

When retention is weak, the frontier can temporarily narrow so Chami consolidates rather than continuously adding harder material.


## v22 — Separate language knowledge from decoding burden

For an early reader, Chami should distinguish:
- understands a spoken English word,
- recognizes its meaning,
- can hear/use it in context,
- can decode the printed form,
- can type/write it.

These are different abilities.

A child should not fail a vocabulary target because she reads slowly.

### Teia delivery sequence
Preferred early-stage English:
1. hear the word,
2. hear/see a short meaning,
3. choose from two large options,
4. hear the word in a tiny sentence,
5. say it in a tiny sentence,
6. gradually notice/read the printed word,
7. later introduce independent typing when mechanics no longer interfere.

### Auro delivery sequence
Auro can use more:
- independent reading,
- 3-choice context tasks,
- short free recall,
- sentence writing,
- morphology/word-family reasoning.

## Morphology
English items now carry morphology metadata and semantic relations.

Word families should help compress vocabulary knowledge:
`predict → prediction → predictable`, etc.

For an early reader, morphology can begin aurally: hear related words and notice shared sound/meaning before requiring spelling analysis.

## Ukrainian composition
Useful Ukrainian sentence frames are metadata-driven:
- `Я хочу + [thing]`
- `Я бачу + [thing]`
- `У мене є + [thing]`
- `Мені подобається + [activity/thing]`

Teach these as reusable communicative patterns before abstract grammar labels.


## v23 — Literacy as a parallel curriculum

English vocabulary learning and English decoding are now parallel tracks.

For an early reader, Chami can teach:
- spoken meaning,
- contextual understanding,
- oral use,
while separately practicing:
- printed-word recognition,
- decoding,
- short sentence reading,
- typing mechanics.

This avoids the common error of restricting vocabulary to only words the child can already decode.

### Decoding scaffolding
Current support includes:
- audio-first word presentation,
- two-choice sound-to-print matching,
- large tap targets,
- simple visual chunking of long words,
- optional read-aloud,
- speaking before typing.

The chunking is a visual aid, not a formal syllabification system. Future phonics work should use a linguistically stronger model.


## v24 — Structured decoding practice

v24 replaces arbitrary three-character chunking with deterministic spelling-aware word parts. Common multi-letter spellings such as `sh`, `ch`, `th`, `igh`, `tion`, vowel teams and common endings are kept intact where possible.

The activity sequence rotates among three distinct kinds of evidence:

1. **Printed-word match:** hear the complete word, then tap its printed form.
2. **Letter-team match:** hear and see the word, then find a spelling pattern inside it.
3. **Word build:** hear the word, then tap its visible parts in order.

These are decoding mechanics, not vocabulary tests. A correct response adds literacy evidence but does not mark the word meaning as mastered. A wrong response restores or maintains support without lowering the English curriculum frontier.

### Scaffold policy

- **Full:** two choices, automatic whole-word audio, large targets and explicit visual cues.
- **Guided:** three choices, automatic whole-word audio and selected visual support.
- **Light:** three choices, optional replay and minimal cues.
- **Independent:** the special decoding activity fades out; ordinary age-appropriate reading remains.

Moving forward requires repeated success across all three activity types, not speed, age or one lucky streak. Recent difficulty overrides older success so assistance can return quickly.

Chami speaks the whole word rather than pretending browser text-to-speech can reliably pronounce isolated graphemes. The engine calls its output “spelling parts” or “word parts,” not formal phonemes or syllables.
