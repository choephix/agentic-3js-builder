# Faster builds, earlier first pixel

The goal and the experiment queue for the next token-burning session. Read this when Stefan says "let's burn some tokens" or asks about build time.

## Goal (Stefan, 2026-10-24)

- A single-run build an app can show in about **one minute**, and **something on screen as early as possible** even if the full model arrives later. Cut anything that doesn't change what ends up on screen.
- **Quality is Stefan's call**, from the verdict pages (`bakeoff/gap*_page.py`). Model judges, LLM critics and an agent's own impressions of a render are not evidence; the judge-based conclusions in `STATUS.md` are unconfirmed for that reason. Facts that don't need taste (wall time, tokens, module size, crash and typecheck counts, overlap with examples) are what these experiments measure. Quality rows are left for Stefan.

## Where the time goes

Sonnet 5.5 streams at ~132 output tokens/s (Opus 5.5 ~102, Haiku 5.5 ~210). Wall time is billed output tokens ÷ that rate; the 84k-token prompt is cached and prefills in seconds. One craft3 build at high effort (r24, 124 builds):

| Share of billed output | Tokens (median) |   Time | What it is                                     |
| ---------------------: | --------------: | -----: | ---------------------------------------------- |
|                    86% |            ~55k | ~7 min | thinking (returned only as a 36k-char summary) |
|                    14% |             ~9k |  ~68 s | the module (24.5 KB)                           |

Estimate: billed completion tokens minus code chars ÷ 2.8 minus prose chars ÷ 4.2. So **the code alone is already about a minute; thinking is the other seven.** Textures and paint are 14–25% of module chars, so deferring them saves at most ~15 s of the code minute.

What the past rounds say about the dials (medians; crash = failed first render, all later repaired):

| Round       | Effort / prompt                        | Out tokens |  Module |        Wall |         Crash |  Cost |
| ----------- | -------------------------------------- | ---------: | ------: | ----------: | ------------: | ----: |
| r24         | high, craft3 + kits                    |      63.8k | 24.5 KB |     8.1 min |         8/123 | $0.69 |
| r24max      | max                                    |       128k |    none |      16 min | 10/10 no code | $1.29 |
| r24opus     | Opus high                              |      84.3k |   33 KB |    13.4 min |          1/10 | $2.02 |
| r20medcraft | medium                                 |      43.2k | 20.5 KB |     5.5 min |          1/28 | $0.66 |
| r20lowcraft | low                                    |      32.0k | 15.8 KB |     4.1 min |          2/28 | $0.49 |
| r22lean     | low, game-asset brief, no rig          |      17.6k | 11.5 KB |     2.4 min |          2/25 | $0.26 |
| r22nothink  | "thinking off" (see gateway note), low |      14.0k | 24.3 KB | **1.5 min** |     **14/25** | $0.25 |
| r2          | medium, the early docs-only prompt     |       7.6k |  6.6 KB |     0.9 min |         9/280 | $0.09 |

Readings:

- **Thinking buys correctness, not size.** r22nothink wrote modules as big as r24's in a fifth of the time; half of them crashed. Its crashes are API-shape guesses, not design failures: `hit.point` / `hit.p` for a Spot's position, `{x, y}` on a SweepPoint, a paint where a colour string goes, `{x, y, z}` objects for `[x, y, z]`, a `[x, y, "sharp"]` outline. 12 of the 14 have TypeScript errors; `npm run typecheck -- <file>` finds them in under a second. The check pipeline skipped typecheck (`typecheckSkipped: true`) and the repairs were whole-module rewrites (`r22nothinkfix`: 13k tokens, 1.1 min).
- **Max effort is unusable single-run:** 10/10 spent the whole 128k cap thinking.
- **Ambition is the other axis.** The early prompt (r2) got 6.6 KB modules in 56 s; the lean brief (r22lean) 11.5 KB in 2.4 min at low. Whether the smaller modules are acceptable is a verdict-page question nobody has answered: `bakeoff/judging/` holds Stefan's phase-2 verdicts only, none for the r20–r22 speed arms (`gap3/`).
- **The gateway can't switch thinking off for Sonnet 5.5.** `--no-thinking` omits the parameter and pins effort low; 21/25 r22nothink replies still carried a thinking block. `budget_tokens` is dropped for adaptive models. A "no thinking" arm run through it measures the gateway, not the model.
- Opus 5.5 at high was slower and dearer. Stefan's only verdict so far: one Opus part (a snowflake) is wildly goofier than anything he has seen; the rest is unjudged.
- Repeat draws of one brief vary a lot (r24d3 ran 5 subjects × 3); any arm with fewer than ~20 briefs is noise.

## Stefan's hypotheses, answered

- **"Is it 90% thinking?"** Yes: ~86% of billed output at high effort, ~7 of 8 minutes. The module itself is already about one minute.
- **"Yield a partial result without textures first."** Textures are 14–25% of the code, so a texture-last ordering shaves ≤15 s off the ~68 s of code, and only once thinking is down. Nothing is runnable until `build()` closes, so staging needs three things together: low effort, an emission order the model keeps (skeleton and masses first, paint last), and an SDK call that paints an already-built assembly by part name. Rated E6 below: worth doing after the examples result, not before.
- **"Put the plan in the output."** The thinking summaries show what the 55k tokens do: the build sheet (skeleton plan, limb placement, numbers). A bounded visible build sheet (≤40 lines) is the standard substitute for thinking when thinking is off, and it survives any reordering we impose on the code. It is cheap (~1k tokens, ~8 s) and worth one arm (E4). It is not the lever: the lever is removing the 55k.
- **"Maybe I'm overthinking it."** My read: the hidden thinking and a visible plan don't stack well while adaptive thinking is on (the model thinks and then writes the plan it already made). Low effort stays the floor because quality is the bar (Stefan, 2026-10-25), so the remaining cut has to come from the model needing less deliberation: examples and templates, measured as billed thinking at low. Plan-vs-no-plan is a smaller question after that.
- **"Build more machinery beforehand; examples and templates."** The no-thinking crashes are exactly the class that examples fix (the model copies field names and argument shapes it has seen) and that machinery fixes (fewer shapes to guess). Examples are a correctness lever, templates (a skeleton with slots) a speed lever: fill-in-the-blank asks for far less deliberation than open design. Both are experiments E2 and E3; their prep (P4, P5) costs no model tokens. The copying risk is measurable without taste: n-gram overlap with the examples in context.

## Zero-token prep (do before the next burn)

| ID  | Work                                                                                                                                                                                                                                                                                                   | Why                                                                                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | Typecheck gate in the check pipeline (automated, <1 s; count real type errors, not TS6133 unused-variable notes), then on a typecheck or render failure one **edit-style** repair call (SEARCH/REPLACE blocks given the error text) instead of a whole-module rewrite. One iteration, only on failure. | 12/14 nothink crashes typecheck; edit repairs are seconds (`refine-edits.md` has <1% failing); the rewrite repair took 13k tokens and 1.1 min. |
| P2  | Record per reply whether a thinking block came back and its billed size (output minus estimated code). Already partly in the r22 records; make it standard. A request path that truly disables thinking is not needed: low effort is the floor, quality is the bar.                                    | Every speed claim needs the thinking share next to it.                                                                                         |
| P3  | Stream the reply and record `firstCodeMs` (opening fence), `codeCloseMs` (closing fence), `wallMs` per run. `bakeoff/replay.ts` already streams.                                                                                                                                                       | Time to first pixel is the goal; today we only have wall time.                                                                                 |
| P4  | Example library: brief → module pairs, picked by Stefan from a facts table (renders, typechecks clean, kits used, size, rig topology from the check report) over `samples/` and `bakeoff/rounds/r24*/builds/`, tagged by structure, style family and features. See "Examples test" below.              | E2 needs human-picked examples; LLM-picked ones would bias toward what LLMs like.                                                              |
| P5  | Four templates (quadruped, biped, object/vehicle, diorama): a complete module with the fixed parts written and the subject-specific slots marked, each slot naming what goes there and its typical size.                                                                                               | E3.                                                                                                                                            |
| P6  | List the shapes the no-thinking builds guessed (from the r22nothink TS errors) and decide which the API should accept (`{x,y,z}`/`Vector3` where `[x,y,z]` is documented, colour-or-paint where either makes sense, a position getter name). Stefan decides; it trades API simplicity for forgiveness. | Kills a crash class at every effort, for free at run time.                                                                                     |
| P7  | Stefan's verdicts on `gap3/` (r20–r22 speed arms vs r24-quality builds).                                                                                                                                                                                                                               | The speed trade has no quality data yet.                                                                                                       |

## Experiment queue, rated

Yield = how far it can move first-pixel and full-build time with quality holding by Stefan's eye. Cost = builds × per-build dollars, plus the 7-day meter: on 2026-10-24, 154 high-effort builds moved marcellus's 7-day meter 11 points (~14 builds/point, ~$11/point); low/no-thinking builds are roughly 3× cheaper. Every arm uses the 25 gap3 briefs so results compare across rounds.

| Rank | ID  | Experiment                                                                                                                                                                                                                                           | Needs   | Builds | ≈ Cost       | Yield  | What we learn                                                                                                                     |
| ---: | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -----: | ------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------- |
|    1 | E2  | **Examples in context** (design below): four arms at low effort, 25 briefs each.                                                                                                                                                                     | P1, P4  |    100 | $55, 3–4 pts | high   | Does seeing real pairs cut thinking and crashes at low; does the model copy; does variety survive; can examples replace `api.md`. |
|    2 | E1  | **Low + typecheck-gated edit repair**, no examples. This is E2's arm A; pipeline time counts the repair.                                                                                                                                             | P1      |   (25) | in E2        | high   | The baseline: low's time, thinking share and crash rate with a cheap repair.                                                      |
|    3 | E5  | **Blockout + full, in parallel.** Call A: ≤3k-token flat-colour skeleton and masses, low effort (target ≤30 s). Call B: the full build. The app shows A, swaps in B.                                                                                 | P3      |     50 | $10, 1 pt    | high   | A first pixel under 30 s regardless of B's time; whether A's silhouette matches B closely enough to swap without a jump.          |
|    4 | E3  | **Templates.** Fill-in-the-slots modules (P5), low effort.                                                                                                                                                                                           | P5      |     25 | $7, 1 pt     | medium | Whether fill-in-the-blank removes the remaining thinking and crashes; how samey the results are.                                  |
|    5 | E4  | **Bounded visible plan.** A ≤40-line build sheet first, then the module, one call, low effort. Compare with E1's no-plan arm.                                                                                                                        | —       |     25 | $7, 1 pt     | medium | Whether a visible plan replaces thinking for coherence, and what it costs in seconds.                                             |
|    6 | E7  | **Haiku 5.5, low effort, with examples.** 210 tok/s against Sonnet's 132.                                                                                                                                                                            | P4      |     25 | $1           | medium | A cheap lottery ticket: a 9k-token module streams in ~45 s if Haiku can write one.                                                |
|    7 | E8  | **Ambition dial.** `ambition2.md` targets vs half targets, low effort.                                                                                                                                                                               | —       |     25 | $6, 1 pt     | medium | How module size and time scale with the stated target, and where Stefan draws the line.                                           |
|    8 | E6  | **Late paint.** Prompt orders the module skeleton → masses → paint; SDK paints a built assembly by part name; harness runs at the first closing fence.                                                                                               | SDK, P3 |     25 | $7, 1 pt     | low    | ≤15 s off first pixel. Only after thinking is gone.                                                                               |
|    9 | E9  | **"Decide, don't draft" at high effort.** Hypothesis: the model writes the code once in thinking and again in the reply. The summary hides it; measure billed thinking tokens with and without the instruction.                                      | —       |     25 | $17, 2 pts   | low    | Even a 30% cut leaves five minutes; useful only if high effort stays the quality bar.                                             |
|   10 | E10 | **Gallery.** Repair the 10 crashed r24 builds (edit repair); run the 204 r24 briefs that never went out (`bakeoff/pitches-r24.json` minus `bakeoff/rounds/r24/runs/`). Style choice from a short list, since open choice converged (7/20 Delftware). | —       | 10–204 | $0.70/build  | fun    | Gallery content; a style-list arm shows whether a menu keeps variety.                                                             |

Order of play for a session: P1, P3 and P4 first (harness work and picking, no model tokens), then E2 (which contains E1), then E5, then whichever of E3/E4/E7/E8 the E2 numbers make interesting. E6 and E9 wait.

## Examples test (E2), design

The product idea (Stefan, 2026-10-25): a large library of builds (cars, spaceships, tanks, rifles, creatures, in many styles); a cheap router picks the nearest few for a prompt ("futuristic militarized truck from 2077" → a pickup, a boxy spaceship, a tank, a laser rifle); they go into the prompt as examples of SDK use; the model builds the new thing to spec. The test skips the router: for each brief the examples are hand-picked as if the router had chosen them.

Design choices:

- **Pick by structure and style, not only subject.** Axes for the tags: rig topology (quadruped, biped, flyer, serpent/fish, wheeled, flying/space, handheld, building/diorama, prop, mech), style family (kit or painterly family), notable features (wheels, wings, weapons, faces, fur). A brief gets one example per axis it needs; subject match is its own arm.
- **Pairs.** Each example is its brief followed by its module, so the model sees the mapping. Examples sit after the static docs block (cached) and before the brief.
- **Instruction:** the examples show how the SDK is used; the subject, proportions and construction are the model's own.
- **Copy detector:** 8-gram overlap of the output with each example and with the rest of the library; variety across repeat draws of one brief. Reported as numbers, judged by Stefan.

Arms (25 gap3 briefs, low effort, craft3 prompt, typecheck-gated edit repair):

| Arm | Context                                                                       | Question                                               |
| --- | ----------------------------------------------------------------------------- | ------------------------------------------------------ |
| A   | no examples                                                                   | baseline (= E1)                                        |
| B   | 3 structural examples: other subjects, matching rig topology and style family | correctness and thinking with no subject to lean on    |
| C   | B plus one near-same-subject example (koala → red panda, truck → truck)       | the real library's common case; worst case for copying |
| D   | B's examples with `docs/api.md` cut to its 4k brief                           | do examples replace 66 KB of reference?                |

Library target: ~24 pairs, two style families per topology, from `samples/` and the r24 rounds. The facts table is generated; the cull is Stefan's. Tags are mechanical (imports, joint names, category from the brief), so the product router can be a tag match rather than a model.

## Metrics every arm records

Per build: `wallMs`, `firstCodeMs`, `codeCloseMs` (after P3), billed output tokens, estimated code tokens, thinking block present, module KB, parts and textures (from the check), typecheck error count, first-render crash, repair calls and their time, cost. Per arm: medians and the crash rate. Quality: a `gap`-style page with Stefan's verdict buttons; nothing else counts.
