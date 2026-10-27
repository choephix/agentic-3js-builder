# Rotation side quest

Parts that face, tilt or turn the wrong way in model-built three.js. Stefan made this an official side quest on 2026-10-27. This file is where it starts and where its state lives. Read it whole before doing anything.

The record at the bottom has every message of the conversation that started the quest, word for word: Stefan's (S1–S7) and Claude Opus 5.5's answers (C1–C6). The sections above cite them, and quote rather than paraphrase where the wording matters. When a section and the record disagree, the record is what was said; the section is the current reading.

Full web research, with links: `research/rotation-papers.md` (studies and benchmarks), `research/rotation-practice.md` (how tools and agent skills handle orientation), `research/rotation-conventions.md` (conventions per tool, from official docs).

## The quest, in Stefan's words

From S4:

> make the full journey from defining this problem accurately to testing different approaches for mitigation (actual reasonable ideas) and test them out.
>
> This is going to involve building the right new "platform" to work on. Have actual pitches and tasks specifically devised for making this error happen as much, as often, and in as many different ways as possible. Be nasty about it. Come up with tasks that are specifically designed to bring this issue to the surface and then we experiment with different language models, with different reasonings, but most importantly, different hypotheses on what will fix this.
>
> Mostly I assume by fiddling with the instruction prompt but if we come to a different idea then we should be able to apply that as well.

## Ground rules

- **Single runs.** One request, one module, as an app runs it. S3: "a render check is obviously not going to fly. We're trying to make this work for single runs. You understand that, right? [...] Obviously we can fix things by looking at them and fixing them. That's outside everything that we're talking about here." A fix counts only if it works inside the single run: the prompt, the SDK, or anything else the model gets before it writes.
- **Nasty tasks.** S4: "Be nasty about it." The tasks exist to make the error happen, in as many forms as possible.
- **Three axes, the third first.** S4: "different language models, with different reasonings, but most importantly, different hypotheses on what will fix this."
- **Prompt first, other ideas welcome.** S4: "Mostly I assume by fiddling with the instruction prompt but if we come to a different idea then we should be able to apply that as well." SDK changes are such an idea; an API change is Stefan's call before it lands in `src/`.
- **Reason as a member of the group.** S3: "don't guess what models will do as a third party, based on your internet knowledge, cutoff, and shit like that. Rather understand that you are in fact part of this group." Hypotheses come from your own habits as a model writing this code (C3 is the first round of that), and the runs decide.
- **Measure, don't judge.** Whether a part points the right way is a fact a script can compute from the built scene, so scores here are mechanical. How a build looks overall stays Stefan's call (`AGENTS.md`).
- **Stefan picks the models, and whether plain three.js runs, every round.** S7: "I should be asked every time because I'm going to make that decision depending on how much quota I have from any given provider." And: "I will specify which models I want to check as we go. I definitely don't want to automatically drain my usage with a given provider because I'm silently, while I'm trying to gauge another provider." Before each round, ask which models, which efforts and whether the plain three.js arm runs; run only what he names.
- **Writing this file.** S5: Stefan's messages and the answers he got stay findable as they were said. Quote them; add new exchanges to the record when they shape the quest.

## The problem

What Stefan sees (S1), across "almost everything that a language model builds using 3JS, with and without our SDK kit":

> These are often spikes on puppets facing the wrong way, little diagonal "V" details flipped the other way around. Very often this has even resulted in houses and structures with their slanted roof being turned the other way around: instead of a lambda it looks like a V.

> It always does this for some things, yes, and for other things, no.

His example: the wheels of `r33pfmd2Truck2077RichParflat` (Sonnet 5.5, medium, parflat arm), render `/home/cx/tmp/public/nilo/agentic-3js-builder/snaps/r33pfmd2Truck2077RichParflat/B/snaps/v01-three-quarter.png`: "The little yellow details are a little bit inconsistent in terms of direction."

**Working definition (for scoring):** an orientation error is a part whose position is right and whose pointing axis, measured in world space after the build, is not the direction the pitch implies. Kinds worth telling apart, because different causes predict different kinds:

- **flipped:** about 180° off (a spike pointing inward, a roof slope tilted the other way, so Λ becomes V);
- **mirrored:** right up to a reflection (the left horn tilted like the right one should be);
- **quarter-turn:** about 90° off (a stripe lying along the rim instead of across it);
- **drifting:** the error changes from item to item around a ring (the truck);
- **wrong axis:** turned about a different axis than intended.

## Evidence so far

### The truck wheel

`bakeoff/rounds/r33pfmd2/builds/r33pfmd2Truck2077RichParflat.ts:254-263` places 8 stripe boxes around the hub at angle `a`, position `[y, z] = [cos a, sin a] × 0.5`, and orients each with `rotation: [90 − a, 0, 0]` (XYZ degrees). The right value is `[a, 0, 0]`: in three.js a positive X rotation turns +Y toward +Z. Each stripe is off from pointing out of the hub by `|90° − 2a|`, checked with three.js `Euler`:

| Stripe angle `a`                 | 0°  | 22.5° | 45° | 67.5° | 90° | 112.5° | 135° | 157.5° | 180° |
| -------------------------------- | --- | ----- | --- | ----- | --- | ------ | ---- | ------ | ---- |
| Off from pointing out of the hub | 90° | 45°   | 0°  | 45°   | 90° | 45°    | 0°   | 45°    | 90°  |

The same formula orients the tread blocks, centre ribs, sidewall stripes, rim spokes and two more rings (lines 237, 245, 260, 273, 312, 335): one slip, copied six times.

C3's reading of the slip: `90 − a` is exactly right if the angle is measured from +Z (forward) toward +Y, that is if the position were `[sin a, cos a]`. The position line measures from +Y (a clock face, 0 at 12 o'clock); the rotation line measures from +Z (a maths graph, 0 at 3 o'clock). Each line is consistent with its own picture; the two pictures disagree.

The same file also sets rotations directly on three.js meshes, outside the SDK's options: `.mesh.rotation.x = Math.PI / 2` at lines 115, 180 and 181 (C3 says "twice"; it is three statements).

### Angle rotations in recent builds

Files using Euler rotations (`rotation: [`, `.rotation.x/y/z =`, `.rotateX/Y/Z`) against files using the SDK's direction options (`dir:`, `aim:`, `b.ring(`):

| Round    | Builds | With angle rotations | With `dir`/`aim`/`ring` |
| -------- | -----: | -------------------: | ----------------------: |
| r24      |    123 |                   73 |                     120 |
| r34dt    |     40 |                   26 |                      39 |
| r34dtd2  |     40 |                   24 |                      38 |
| r33pfmd2 |     19 |                   17 |                      16 |

In r24: 171 `rotation: [...]` calls against 863 `dir:`/`aim:` uses. Models use both, often in the same file.

### Earlier sightings in this repo

- `docs/STATUS.md`, first catalogs (2026-10-25): the catalogs were built by Fable 5.1 at high in an agentic session with renders, and STATUS says "`bumperRam` had its plates yawed the wrong way (a scoop instead of a forward point); fixed, demo snap v05." The same session listed SDK gaps it worked around, two about orientation: "`part({ frame, rotation })` replaces the frame's orientation instead of composing; yaw hinges need `dir`/`up` juggling".

### What the SDK offers today

From `docs/api.md`: `b.part(geometry, color, { at, quat | aim | dir (+ up, axis) | rotation, ... })`, where orientation priority is `quat`, then `aim`/`dir`, then `rotation` (XYZ degrees), then `frame`. `dir`/`aim` point the geometry's `axis` (default +Y, the axis of three's cylinders and cones). `b.ring(line, { count, radius })` places frames around any line; `b.spike(base, dir, len, r)`; `b.rod(a, b)`, `b.slab(points)`, `frame(at, dir, up)`. `b.pose(joint, { axis, deg })` uses the right-hand rule. Raw three.js stays reachable through `part.mesh`.

### Web research (digest)

From the three research files; details and links there.

- **Models measurably confuse clockwise and counter-clockwise.** RotBench: GPT-4o identified 52 of 300 clockwise image rotations correctly, and 90° vs 270° confusion survived captions, depth maps and chain of thought. 3DSRBench: GPT-4o 21.6% on object-orientation questions, humans 97.7%. These are vision benchmarks, not code.
- **No paper counts sign or mirror errors in generated 3D code.** The CAD and Blender-code papers report overall scores only.
- **Single-run-compatible fixes with evidence:**
  - Relations, directions and endpoints instead of angles: SceneCraft scored 3.2 without its relation graph against 88.9 with it (but that system also renders and critiques). The mature APIs all take a direction plus an up, or two points: three.js `lookAt`/`setFromUnitVectors`, Unity `LookRotation`, Godot `look_at`, Blender `to_track_quat`, OpenSCAD BOSL2 anchors and `orient=`, CadQuery workplanes.
  - Explicit axes and poses in the prompt: SpatialPIN took GPT-4o from 69.0% to 87.3% on orientation questions (vision, not code).
  - Worked example plus reasoning: 3D-PreMise, GPT-4 Blender-code pass rate 7.0% → 17.5%. Plain chain of thought alone is mixed.
  - A real rule from an agent skill (img2threejs): "Every `-l`/`-r` pair is a MIRROR, not a rotation".
  - Warnings like "be careful with rotation": no evidence found either way.
- **Out of scope by the ground rules:** render-and-critique loops, the strongest result in the literature (SceneCraft 26.1 without its inner loop, 88.9 with it).
- **Conventions differ across tools** (`research/rotation-conventions.md` has the documented table): three.js and glTF right-handed and Y-up, Blender and OpenSCAD Z-up, Unity left-handed, CSS screen-down; Euler order XYZ in three.js and Blender, extrinsic ZXY in Unity, YXZ in Godot; cylinders along Y in three.js, along Z in Blender. The convention table in C1 is simplified; the research file is the reference.
- **Search terms:** LLM spatial reasoning; mental rotation; perspective-taking; object-centric orientation; clockwise vs counter-clockwise (90°/270°) confusion; handedness / chirality; Euler angle order; look-at / aim constraint; LLM CAD code generation (CadQuery, OpenSCAD, Blender Python); SceneCraft; img2threejs.

## Hypotheses

Causes proposed so far, each with what it predicts. None is tested yet.

| ID  | Cause                                                                                                                                                                                                                                                                   | Source       | Predicts                                                                                                                                                               |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H1  | **Two pictures.** Position and orientation come from two different mental pictures (clock face vs maths graph) and nothing checks they agree.                                                                                                                           | C3, truck    | Drifting errors on rings and anything placed by angle; they vanish when the direction is taken from the same vector as the position.                                   |
| H2  | **Side and top views.** The front view (XY, turning about Z) matches school maths. Side (YZ, about X) and top (XZ, about Y) views are pictured from a side the model never chose, so the sign is a coin flip.                                                           | C3           | Errors cluster on X and Y rotations; a gable roof with its ridge along X (slopes turn about X) fails more than one with its ridge along Z.                             |
| H3  | **Mirrored Euler pairs.** Mirroring across x = 0 flips the Y and Z angles but not X; the model flips all or none.                                                                                                                                                       | C3           | Mirrored pairs fail when their tilt has an X component; pairs given as directions (flip x, like positions) don't.                                                      |
| H4  | **Three.js habit.** `mesh.rotation.x = …` is the most common three.js idiom and wins over `dir` even when `dir` is offered.                                                                                                                                             | C3, counts   | Removing `rotation` from `b.part` moves some rotations to `part.mesh.rotation` instead of to `dir`.                                                                    |
| H5  | **No doubt signal.** The wrong formula doesn't feel wrong, so a warning never fires at the moment it applies.                                                                                                                                                           | C3           | A stern-warning arm scores like the baseline.                                                                                                                          |
| H6  | **Convention mix.** Training material mixes three.js, Blender, Unity and CSS conventions.                                                                                                                                                                               | C1, research | If this were the main cause, stating "three.js, right-handed, Y-up" would help. C3 expects it not to ("The truck code knew").                                          |
| H7  | **Effort.** At low effort the model writes the formula without the one-value check ("at a = 0 the item sits at the top; does your rotation point it up?").                                                                                                              | C3           | Error rate falls with effort, and a prompt that asks for the one-value check helps more at low effort than at high.                                                    |
| H8  | **Path of least resistance (the cost side of F6).** A model builds what is easy to express. Without angles, tilts need trig and an `up`, random orientations need a random direction and up, so the model tilts fewer parts and spends more tokens on the ones it does. | C6           | Removal arms write more output tokens per tilted part, have fewer tilted (non-axis-aligned) parts, and move some angles to `part.mesh.rotation` (radians), as H4 says. |

## Fix ideas to test

Each idea is an arm; most are prompt files, two touch the SDK. C3 ranked what would help Claude itself, best first: directions or points instead of angles; worked examples of the risky patterns; the exact rule plus a one-value check; knowing it's three.js; a stern warning. That ranking is introspection, and the runs decide.

| ID  | Idea                                                                                                                                                                                                                                                                                                                            | Kind   | Tests      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------- |
| F0  | Baseline: the current `craft3` prompt with the SDK; plus plain three.js (`prompts/contract-plain.md`), since S1 says the error shows "with and without our SDK kit".                                                                                                                                                            | arm    | control    |
| F1  | One statement of the frame: three.js, right-handed, +Y up, model faces +Z, left is +X.                                                                                                                                                                                                                                          | prompt | H6         |
| F2  | A stern warning about rotation.                                                                                                                                                                                                                                                                                                 | prompt | H5         |
| F3  | The exact rule (positive X turns +Y toward +Z, Y turns +Z toward +X, Z turns +X toward +Y) plus "check one value" for every computed rotation.                                                                                                                                                                                  | prompt | H2, H7     |
| F4  | Worked examples of the risky patterns built with `dir`, `ring` and points: a ring of pointing items, a gable roof, a mirrored pair.                                                                                                                                                                                             | prompt | H1, H3     |
| F5  | "Orient with `dir`/`aim`/`ring`, build slants from points, take a ring item's direction from the same numbers as its position", without examples.                                                                                                                                                                               | prompt | H1         |
| F6a | `rotation` absent from the docs only: a copy of `docs/api.md` without it, the SDK unchanged. Counts how many builds write `rotation:` anyway.                                                                                                                                                                                   | prompt | H4, H8     |
| F6b | `rotation` removed from `b.part` in an SDK copy, and a leftover `rotation:` throws an error that names `dir` (a crash in a single run).                                                                                                                                                                                         | SDK    | H4, H8     |
| F6c | As F6b, but a leftover `rotation:` is ignored, as unknown options are today (the part sits unrotated).                                                                                                                                                                                                                          | SDK    | H4, H8     |
| F7  | Semantic helpers. First candidate (C6): `tilt: { toward: [0, 0, 1], deg: 30 }`, "lean the part's top toward the front by 30°", which separates the sign (a direction) from the amount (an unsigned angle) and keeps plain and random angles. Others: a facing word such as "out" or "forward", a roof from its ridge and eaves. | SDK    | H1, H2, H8 |

Combinations (F4 + F6 above all, per C3: "The API change takes away the habit; the examples give the right pattern to copy in its place") and effort levels come after the single arms. The API change is tested both ways (S7: "isn't that the kind of thing that we want to experiment with one way and then the other as well?"): every F6 and F7 arm runs against the baseline that keeps `rotation`, and is measured on its costs (H8) as well as its orientation scores.

## Platform: first draft

A starting point; the session that builds it owns the design.

**Two layers of tasks.**

1. **Probes:** short pitches with an exact answer key, one trap each, with every part to be scored named in the pitch so the scorer can find it. Each family comes in variants across the three axes, both sides of the model, mirrored and compound, so a cause shows up as a pattern (H2 predicts X and Y fail, Z holds).
2. **Nasty pitches:** ordinary-looking subjects dense with traps, scored the same way through required part names.

**Trap families (seed list):**

- rings of pointing items around X, Y and Z: wheel treads and stripes, a spiked collar, gear teeth, petals, a crown, a saw blade;
- slants: gable roofs with ridge along X and along Z, dormers, an A-frame tent, a ramp rising toward a given side, a tank glacis facing forward;
- chevrons, arrows and V details on the front, flanks, top and rear: a hazard barrier, a sleeve chevron, road signs pointing left or forward;
- mirrored pairs tilted outward or swept back: horns, ears, wings, mirrors on a truck, oars and shields on both sides of a longship;
- spikes along curves and bodies: a stegosaurus's plates, porcupine quills, a mace;
- items that must ignore their parent's turn: Ferris-wheel gondolas hanging straight down;
- compound turns: tilt then yaw, a spiral staircase, a clock tower with four faces, windmill blades with pitch.
- angle-friendly controls, where angles are harmless, so that removing them shows its cost: a random scatter of rocks or debris, a hat tilted at a jaunty angle, a 45° diamond pattern.

**Scoring principles.**

- Score from world-space geometry after the build, not from the rotation values in the code, so a score holds whatever the model wrote (`dir`, `rotation`, `mesh.rotation`, `geometry.rotateX`).
- Each scored part has an expected direction (outward from a hub, along a ridge, mirrored from its twin); classify it as right, flipped, mirrored, quarter-turn, drifting or wrong axis (definitions above), with a tolerance.
- Report per task, per family, per axis and per arm, with crash and missing-part counts kept apart from orientation errors.
- Measure the costs next to the scores: output tokens, time, module size, part count, crashes, and the number of tilted (non-axis-aligned) parts, a mechanical stand-in for stiff builds. Renders of the nasty pitches go on sheets for Stefan.
- `npm run preview` already builds a module in the shared Chromium in about a second and writes a parts table (`scripts/preview.ts`, `preview-page`); a scorer can read each named part's world matrix and vertices from there.

**Runs.** The bakeoff tooling fits as it is: pitches in `bakeoff/pitches-*.json`, arms in `bakeoff/arms-*.json` (prompt files through `extra`, a three.js-only arm through `contract-plain.md`), rounds through `npm run bakeoff -- run <round> --model … --effort … --arm-set … --pitches … --subjects …`, typecheck and render through `npm run bakeoff -- check`. `bakeoff/README.md` has the details. Sonnet 5.5 at low with the craft3 prompt ran about 26–29 s and $0.06–0.09 per build in r34dt (`docs/SPEED.md` has the other models).

**Models.** Stefan names them per round (ground rules). Candidates so far:

- Claude Sonnet 5.5, Opus 5.5 and Haiku 5.5 through the gateway.
- GPT-6.1 Sol, GPT-6 Astra and GPT-6.1 Terra (Codex subscription). In r37 they crashed on 7–13 of 20 builds with the SDK (Sonnet 1–4 in r35), so crashes may bury their orientation scores in SDK arms.
- Gemini, which Stefan wants tested (S7: "especially 3.8 Flash but also Argon"). `google-antigravity/gemini-3.8-flash` is in the nilo profile's model list. Gemini 4 Argon ran as `google-antigravity/gemini-4-argon` in r23 (`bakeoff/README.md`) but is missing from the profile's list on 2026-10-27, so check it before a round. Both run on the Antigravity subscription; the list also shows them under `cursor` and `openrouter-curated`, and those routes stay unused (Cursor is never used; OpenRouter only when Stefan names it).
- Fable is out. S7: "Also just drop Fable from the running. No it is good. So far I haven't seen a reason to use it."

**Accounts.** Check the meters of the provider Stefan named before each batch (`~/.local/bin/omp usage -p <provider>`): on 2026-10-27 stefan@revoltage.io was at 99% of its Anthropic 7-day meter and marcellus@nilo.io at 20%.

## Decisions and open questions

- Plain three.js arm: Stefan decides per round (S7).
- Models and efforts: Stefan names them per round; Fable is out; Gemini 3.8 Flash and Argon are on the list (S7).
- API change: tested both ways, with its costs measured (S7, C6). Whether it ever lands in `src/` is Stefan's call after the data; the migration work is set aside for now (S7: "Forget the migration work").

## Record (verbatim)

The conversation that started the quest, 2026-10-27, session `01a17153-dbc9-77fd-8eea-191249db828a` (Claude Opus 5.5, in the middle of the r34dt type-declarations work). Stefan dictates with speech-to-text. Messages and answers are unchanged; in the answers, headings are demoted to fit this file.

### S1, Stefan

[Image: the truck render, `/home/cx/tmp/public/nilo/agentic-3js-builder/snaps/r33pfmd2Truck2077RichParflat/B/snaps/v01-three-quarter.png`]

> All right forget the type checks for a second. I have a question that has been bugging me since the beginning of building things with 3JS and language models.
>
> Do you see the tires on this truck? They're a little bit inconsistent. The little yellow details are a little bit inconsistent in terms of direction. I suspect that the language model that was building this wanted the diagonal yellow elements to be rotated the other way around.
>
> that's a very small nitpick and a very small example but it is a great example: just the easiest one that I could reach for immediately. It is of something that I have been noticing on almost everything that a language model builds using 3JS, with and without our SDK kit. That is rotating things. It very often gets them wrong.
>
> These are often spikes on puppets facing the wrong way, little diagonal "V" details flipped the other way around. Very often this has even resulted in houses and structures with their slanted roof being turned the other way around: instead of a lambda it looks like a V. You know what I mean?
>
> It always does this for some things, yes, and for other things, no. It's utterly making me crazy and I don't understand.
>
> Is it a particular quirk of how three.js does rotation that mismatches how rotation is done in something like Blender? With the models, maybe the language models just get confused or forget or just fall back into a baked-in/pre-trained habit or something like that.
>
> I don't know why it's happening but I need to understand how I can fix it. Is this something that I can fix in the instruction, like just tell it, "Use this way to rotate," or "Be careful about this"? I don't know how to even begin to articulate the problem, let alone the solution.

### S2, Stefan (sent while C1 was being written)

> Also after you answer, I would love for you to spawn a few subagents to research this online. I'm sure other people have already explored this problem and maybe have even found their own solutions but again I don't even know how to articulate it well enough to Google search for it.

### C1, Claude

The model used the wrong formula, and it's the same slip copied six times. I found it in the code.

#### What happened on this truck

The yellow stripes on each wheel are 8 small boxes placed around the hub. For a stripe at angle `a`:

|                          |                                 |
| ------------------------ | ------------------------------- |
| Position (correct)       | `[y, z] = [cos a, sin a] × 0.5` |
| Rotation the model wrote | `rotation: [90 − a, 0, 0]`      |
| Rotation that was needed | `rotation: [a, 0, 0]`           |

The model got the turning direction backwards and added a 90° offset. So the stripes spin twice as fast as they go around the wheel, and in the wrong direction. I checked it numerically in three.js:

| Stripe angle                           | 0°  | 22° | 45°    | 67° | 90° | 112° | 135°   |
| -------------------------------------- | --- | --- | ------ | --- | --- | ---- | ------ |
| Angle off from pointing out of the hub | 90° | 45° | **0°** | 45° | 90° | 45°  | **0°** |

Only two stripes per wheel point straight out of the hub; the rest tilt more and more. The tread blocks, rim spokes and two other rings use the same formula (`/home/cx/noodlespace/agentic-3js-builder/bakeoff/rounds/r33pfmd2/builds/r33pfmd2Truck2077RichParflat.ts:237,245,260,273,312,335`).

#### Why it happens

**1. The model rotates "in its head" and never looks.** An angle is a number with a sign. Getting the sign right means applying the right-hand rule correctly every time: in three.js, a positive X rotation turns +Y toward +Z. Nothing checks it. At low effort the model writes the formula without working it out.

**2. Each tool it learned from uses a different convention.** This is the closest thing to the "Blender vs three.js" idea:

|              | Up            | Front | Positive rotation                        |
| ------------ | ------------- | ----- | ---------------------------------------- |
| three.js     | +Y            | +Z    | counter-clockwise (right-hand)           |
| Blender      | +Z            | −Y    | counter-clockwise, but on different axes |
| Unity        | +Y            | +Z    | clockwise (left-handed)                  |
| CSS / screen | y points down | n/a   | clockwise on screen                      |

[INFERENCE] The model learned rotation from a mix of all of these, and Blender tutorials are a large share of the 3D material online. Its habits are a blend, and the sign is effectively a coin flip unless it works the problem out.

**3. Why some things come out right and others don't (your "sometimes yes, sometimes no").** A wrong sign only shows if the object looks different flipped:

| Object                               | Flipped by mistake                   | Do you notice? |
| ------------------------------------ | ------------------------------------ | -------------- |
| Box, cylinder, a stripe turned 180°  | looks identical                      | no             |
| Symmetric pair (left and right ears) | the two swap places                  | rarely         |
| Roof, spike, chevron, one diagonal   | Λ becomes V, the spike points inward | **yes**        |

So the model makes the mistake about as often everywhere. You only see it on objects that aren't symmetric.

**4. Mirrored left/right pairs double the risk.** The model mirrors the position with `s = ±1`. It then has to remember whether the angle flips too, and it sometimes gets that wrong.

#### How to fix it

Telling the model "be careful with rotation" won't help much. It already knows the rule; it just doesn't apply it carefully every time. The better fix is to remove the angle altogether:

1. **Give a direction instead of an angle.** The SDK already has this: `b.part(…, { at, dir })` points the part's long axis along a vector. On the wheel, that's `dir: [0, cos a, sin a]`, the same numbers as the position, so it can't disagree with the position. `b.ring` around the axle does the whole ring for you.
2. **Build slanted things from points.** A roof made from the ridge point and the two eave points can't come out as a V when the ridge is higher than the eaves. `b.slab(points)` and `b.rod(a, b)` work this way.
3. **Remove or restrict `rotation` (Euler angles) in the SDK.** In r24, 73 of 123 builds still used it (171 calls, against 863 `dir`/`aim` calls). This is an API change, so it's your call. A softer option: keep it, and tell the model in `docs/api.md` to orient with `dir`/`aim`/`ring` and use points for slants.

**Search terms you can use:** "LLM spatial reasoning", "orientation errors", "handedness", "Euler angle sign errors", "LLM CAD code generation".

#### Research running now

I started three research agents, as you asked:

| Agent               | What it looks for                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| RotationPapers      | studies and benchmarks of LLMs getting 3D orientation wrong, and fixes with measured results                                   |
| RotationPractice    | how tools that have LLMs write three.js / Blender / OpenSCAD code handle it: prompt rules, API designs, render-and-check loops |
| RotationConventions | an exact convention table from the official docs, plus API design advice for orientation                                       |

I'll merge their findings into one file in the repo and send you the summary when they finish.

### C2, Claude (after the research agents finished)

The research backs up what I found in the truck code. Other people hit the same problem, and the fixes that work avoid angles altogether.

**What the three research agents found:**

- **This is a known weakness that hasn't been solved.** In image tests, models are poor at telling clockwise from counter-clockwise. In one benchmark (RotBench), GPT-4o identified only 52 of 300 clockwise rotations correctly. Adding hints and step-by-step thinking barely helped. In another (3DSRBench), it answered 21.6% of "which way is this object facing" questions correctly, against 97.7% for humans.
- **No study counts wrong-way rotations in model-written 3D code.** The 3D-code papers report only overall scores, so I can't give you a number for how often it happens in code like ours.
- **What works, strongest evidence first:**
  1. **Render the result, look at it, then fix.** SceneCraft has a model write Blender code, then renders it and has a vision model critique the render. With that loop it scored 88.9; without it, 26.1. Several projects stress using several views, because one front view hides mirrored details.
  2. **Use directions, endpoints or relations ("on top of", "facing") instead of angles.** Almost every mature 3D tool offers this, and our SDK already has `dir`, `aim`, `b.ring`, `rod(a, b)` and `slab(points)`.
  3. **Give the model explicit axes and worked examples.** This helps measurably, but less.
  4. **"Be careful with rotation" in the prompt:** I found no evidence that it helps.
- **One rule from a real project (img2threejs) fits your mirrored-pair problem:** "a left/right pair is a reflection, never a rotation."
- **Search terms that work:** "LLM spatial reasoning", "mental rotation", "clockwise vs counter-clockwise confusion", "handedness / chirality", "look-at constraint", "LLM CAD code generation", "SceneCraft", "img2threejs".

**Where it's saved:**

- Summary: `/home/cx/noodlespace/agentic-3js-builder/docs/ROTATION.md`. It has the truck diagnosis, the reasons, the fixes ranked by evidence, and how often our builds use angles. In r24, 73 of 123 builds rotated parts by angle.
- Full reports with all links: `/home/cx/noodlespace/agentic-3js-builder/docs/research/rotation-papers.md`, `rotation-practice.md` and `rotation-conventions.md`.
- Committed locally as `abbe5914`. Nothing in the SDK or the prompts has changed yet.

**Your call — three options, cheapest first:**

1. **A docs rule in `docs/api.md`:** point parts with `dir`/`aim`/`ring`, build roofs and chevrons from points, and take a ring item's direction from the same numbers as its position.
2. **Remove or restrict `rotation` (angles) on `b.part` in the SDK.** This is an API change.
3. **A render check that names what should be true**, such as "roof ridge above the eaves" or "spike tip pointing away from the body". The turntable shots already exist.

I'd start with option 1 and measure it the way we measured the declarations test. The catch is that we can't count wrong-way details automatically, so whether it helped would be your call from the sheets.

### S3, Stefan

> All right a render check is obviously not going to fly. We're trying to make this work for single runs. You understand that, right? I don't know why you're even suggesting this. Obviously we can fix things by looking at them and fixing them. That's outside everything that we're talking about here. Just shut up about this.
>
> Tell me how the API change helps and how likely it is to help.
>
> And most importantly don't guess what models will do as a third party, based on your internet knowledge, cutoff, and shit like that. Rather understand that you are in fact part of this group. I would say you are one of the best 3D-generating language models. You are Claude Opus 5.5 and you are the slightly better version of Sonnet 5.5.
>
> Dig deep into your own understanding, feelings, and habits on the matter and tell me what makes sense to you as a possible cause of this rotation problem. Tell me what, for example, would help you the best in not making this error again. Is it the explicit knowledge that you're working with three.js, which would lead you down the proper path when devising formulas? Or is it an explicit mathematical explanation of how rotations work with that engine, or is it a stern warning, or what? Just think about it pretty well and tell me right now: if you had to write something like this, why would you make this mistake?

### C3, Claude

I would make exactly this mistake. Looking at the truck code, I don't think it's a sign error, and not a three.js quirk either. It's two lines of code, each built from a different mental picture.

#### What happened in the truck code, from the inside

- **Line 1, the position:** `y = cos a, z = sin a`. The angle starts at the top and goes forward. That's a clock face: 0 is 12 o'clock.
- **Line 2, the rotation:** `90 − a`. I checked the maths: this is exactly right if the angle starts at "forward" and goes up. That's a maths graph: 0 is 3 o'clock.

Each line is correct inside its own picture, but the two pictures disagree by 90° and run in opposite directions, so the stripes wander. When I write a ring of things, I write the position by reflex and work out the rotation from a picture. Nothing makes me check that both came from the same picture.

#### Why it never feels like an error

There's no moment of doubt. Rotating something on a ring feels routine, so I don't stop to check it the way I'd check something I know is tricky. A stern warning would fail for that reason: I'd agree with it and still not notice that the warning applies right now.

#### Why some things are always right and others aren't

My picture of the front view matches school maths exactly: x to the right, y up, positive turns counter-clockwise. So rotations about Z (tilting things in the front view) usually come out right.

The side view and the top view are different. When I picture a wheel or a roof from the side, I don't keep track of which side I'm looking from. From the left, positive rotation about X looks counter-clockwise; from the right, it looks clockwise. The sign then depends on a side I never chose.

A roof with its ridge running left to right gets its slant from a rotation about X, in the side view. That's the one that comes out as a V.

**This is a prediction I can test:** wrong-way details should cluster on rotations about X and Y.

#### What would help me, best first

1. **Not having to produce an angle at all.** I'm reliable at "which way does it point" and unreliable at "which way does it turn". "Points up and forward" is `[0, 0.87, 0.5]`: a position-like answer, the kind I get right. On the wheel I'd write `dir: [0, cos a, sin a]`, the same numbers as the position, so the two can't disagree. A roof built from its eave and ridge points has no sign to pick at all.
2. **A correct worked example of each risky pattern:** a ring of pointing items, a gable roof, a mirrored pair, each built with directions or points. I copy patterns: the truck copied one wrong formula six times, and a correct pattern would get copied six times too.
3. **The exact rule, with a one-value check.** Positive X turns +Y toward +Z, positive Y turns +Z toward +X, positive Z turns +X toward +Y. Then: "check one value: at a = 0 the item sits at the top; does your rotation point it up?" That would catch the truck bug, but it depends on me doing the check, and at low effort I often won't.
4. **Knowing it's three.js:** no help. The truck code knew; it even has a comment saying a cylinder's axis is Y.
5. **A stern warning:** least helpful, for the reason above.

#### How the API change helps, and how likely it is to work

**Where it helps a lot:**

- **Rings and radial items** (treads, spikes around a collar, petals). Using `dir`, the position and the direction come from the same numbers. This error class disappears.
- **Mirrored pairs.** To mirror a direction, you flip x, the same as for a position. To mirror Euler angles, you flip the Y and Z angles but not X. I don't reliably remember that, and I'd guess no model does.

**Where it helps partly:** roofs and slants given with `dir` still have a sign to pick. But it's a "which way does it point" sign, which I'm good at. Built from points, there's no sign at all.

**Where it doesn't help:**

- **Raw three.js.** `mesh.rotation.x = …` is the most common three.js habit there is. The truck uses it twice even though the SDK offered `dir`, and in r24, 73 of 123 builds set some rotation by angle. Taking `rotation` out of `b.part` doesn't stop a model from reaching for the mesh directly.
- **A runtime gap.** If `rotation` is removed, a build that still passes it fails the typecheck. But when it runs, the SDK just ignores the option, so the part sits unrotated and nobody is told. It would need to throw an error that names `dir`.

**So the change only works if the docs also show the risky patterns built with `dir` and points (item 2).** The API change takes away the habit; the examples give the right pattern to copy in its place. Either one alone is weaker.

**How likely, as a number:** I can't give one honestly yet. This could be measured without your eyes: a set of small single-run tasks with known right answers ("8 boxes pointing out of a wheel on the X axis", "a gable roof, ridge left to right", "a mirrored pair of horns tilted outward"). A script then computes each part's direction and scores it right or wrong.

- **Arms:** current docs; docs plus worked examples; `rotation` removed.
- **Cost:** a few dollars on Sonnet low.
- **It also tests the X/Y prediction above.**

**Your call:** whether to run that test before deciding on the API change.

### S4, Stefan

> All right I want to pull on this thread and make it a whole thing. This is now an official side quest that we want to take: make the full journey from defining this problem accurately to testing different approaches for mitigation (actual reasonable ideas) and test them out.
>
> This is going to involve building the right new "platform" to work on. Have actual pitches and tasks specifically devised for making this error happen as much, as often, and in as many different ways as possible. Be nasty about it. Come up with tasks that are specifically designed to bring this issue to the surface and then we experiment with different language models, with different reasonings, but most importantly, different hypotheses on what will fix this.
>
> Mostly I assume by fiddling with the instruction prompt but if we come to a different idea then we should be able to apply that as well.
>
> I think the context of the current conversation is already a little bit spoiled by the type check stuff. Maybe I should bring this to a different conversation or maybe I'm wrong and it's not as bad. What do you think? What should we do? Should we write a handoff, like a fully detailed complete handoff document, and start a new conversation or can we keep going here?

### C4, Claude

**Start a new conversation, with the handoff written into the repo as the side quest's own document.** I'm not worried that the typecheck material will confuse the rotation work. The problem is length: this conversation has already been compacted once, and building a test platform will add a lot more. A fresh session starts with full room and a clean brief.

**Why the handoff costs little:**

- Most of what matters is already committed: the truck diagnosis and the research in `/home/cx/noodlespace/agentic-3js-builder/docs/ROTATION.md` and `/home/cx/noodlespace/agentic-3js-builder/docs/research/`.
- What exists only in this chat is small but important, and has to be written down:
  - **Your rules:** single run only, no looking at renders and fixing, and be nasty with the tasks. Test models, effort levels and, above all, different ideas for what fixes it. Mostly prompt changes, but other ideas are allowed.
  - **The two-pictures cause:** in the truck code, the position and the rotation were each built from a different mental picture.
  - **The side-view prediction:** the front view matches school maths, the side and top views don't, so errors should cluster on X and Y rotations. This is a hypothesis to test, not a finding.
  - **My ranking of what would help** (directions or points first, worked examples second, the exact rule plus a one-value check third; knowing it's three.js and stern warnings last), along with the gaps in the API change: raw `mesh.rotation` and the silently ignored option.
  - **The scoring idea:** small tasks with known right answers, where a script computes each part's direction and marks it right or wrong. Quality isn't involved; the scores are facts.

**What I'd write:** I'd turn `/home/cx/noodlespace/agentic-3js-builder/docs/ROTATION.md` into the side quest's document, the way `docs/SPEED.md` works for speed:

- the problem, defined precisely, with the evidence
- your rules
- the hypotheses, each with the fix it implies
- a first draft of the platform: task families, how scoring works, the test setups, which models and effort levels
- the open questions

Any later session reads that file first, so nothing depends on this chat.

**Two ways to start the new session:**

1. **You open it yourself** and say "read `docs/ROTATION.md` and start". This is better if you want to steer it closely.
2. **I start it through Paseo** in this workspace, with the document as its brief. It shows up in your sidebar.

**Your call:** say go and I'll write the document, commit it, and tell you which of the two I used, or start the session if you pick option 2.

### S5, Stefan

> All right definitely go but I want to make sure we understand each other on how to actually write the thing.
>
> You have a tendency to paraphrase things in your head quite a lot and I want to make sure that you don't do that. If I asked you something and you told me something and then I try to remember, "Okay I asked you something and you told me something," and I try to find it in the document, it is paraphrased to oblivion. That's not a good experience.
>
> Also I don't want you to write a transcript of our conversation, right? That doesn't make sense as a handoff, not fully at least. I guess all this is to say, if you're going to err one way or the other, lean toward the latter.

Then: "Write it up." The first version of this file was the result; Stefan read its three open questions and asked for more.

### S6, Stefan

> Elaborate on the three questions.

### C5, Claude

Short version, then details on each:

- **Plain three.js:** run it in the baseline round and on the prompt-only fixes, not in every round.
- **API change:** test it first as a docs-only arm, with no change to `src/`. Removing it for real would break 196 sample files.
- **Models:** Sonnet low does most of the work. Haiku, Opus, a higher Sonnet effort, GPT and Fable each get a smaller, targeted slice.

#### 1. Should a plain three.js setup run alongside the SDK?

**What it means:** the same tasks, but the model gets a prompt with no SDK at all (`bakeoff/prompts/contract-plain.md`) and writes raw three.js.

**Why it matters:** in S1 you said the error shows up "with and without our SDK kit". A plain setup answers two questions:

- **Does our SDK make the error rarer, or not?** The SDK already offers `dir` and `ring`. Without a plain baseline we can't tell whether they help.
- **Does a fix work because of the model or because of our API?** If the rule-plus-one-value-check prompt (F3) helps in both setups, it's a fix in how the model writes code. It would then carry over to anything else that has models write three.js, Nilo included.

**What it can and can't test:**

| Fix                                                                 | Works in plain three.js?                                                                                |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| F0–F3 (baseline, "you're in three.js", stern warning, rule + check) | yes, unchanged                                                                                          |
| F4–F5 (directions and points instead of angles)                     | yes, written with three.js's own tools: `lookAt`, `Quaternion.setFromUnitVectors`, building from points |
| F6–F7 (SDK changes)                                                 | no, they only exist in our SDK                                                                          |

**Cost:** the plain prompt is much smaller than craft3's ~84k tokens, so each plain build is cheaper. It does double the builds for every fix it runs on.

**My recommendation:** run it in the first baseline round and for the prompt fixes (F0–F5). Leave it out of SDK-only rounds.

#### 2. The API change

**What it means:** F6 removes the `rotation` option from `b.part` (`/home/cx/noodlespace/agentic-3js-builder/src/parts.ts:76,132`). Parts would then be oriented only with `dir`/`aim` (plus `up`), `quat` or `frame`.

**What I found when I checked:**

- **Our prompt hardly teaches `rotation`.** `docs/api.md` mentions it 5 times, `docs/conventions.md` 3 times, and the kits never. Yet 73 of 123 r24 builds used angles. So the habit comes from three.js itself (H4), not from our docs.
- **Removing it is a big migration.** 196 of the 496 files in `samples/` use `rotation: [`, 867 calls in all, plus 6 catalog files. The repo rule is that a `src/` change fixes every sample it breaks in the same commit.
- **Angles stay reachable either way.** `part.rotation` and `part.mesh.rotation.x = …` are plain three.js, so the change removes one route, not angles altogether.
- **Some legitimate uses would go too.** For example, spinning a hex nut 30° about its own axis. `up` can do that, but less directly. Separately, Fable reported a real gap: `part({ frame, rotation })` replaces the frame's orientation instead of adding to it.

**Hard choice: what happens when a model still writes `rotation:` after removal?**

| Behaviour                                                      | Result in a single run                      |
| -------------------------------------------------------------- | ------------------------------------------- |
| Throw an error naming `dir`                                    | a crash: nothing on screen                  |
| Ignore it silently (what happens today with an unknown option) | the part sits unrotated: wrong, but visible |

**Cheapest way to test, with no change to `src/`:** a docs-only arm. It gets a copy of `docs/api.md` with `rotation` removed and the risky patterns shown with `dir` and points (F4 + F5), and the scorer counts how many builds still write `rotation:` anyway. That answers the real question, whether the habit survives when our docs never mention angles, at zero migration cost.

**Your call:**

1. Is the docs-only arm fine as the first test? It touches only a prompt file.
2. If the data points that way, may the side quest run builds against a modified SDK copy outside `src/`? That needs a little tooling to point imports at the copy. The real `src/` change, with the 196-sample migration, would wait for the results and your decision.

#### 3. Which models

Per-build figures from past rounds:

| Model                       | Cost and time per build                                  | Role in this quest                                                                                                                                                                                                                                |
| --------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sonnet 5.5 low              | $0.06–0.09, ~30 s (r34dt)                                | **the workhorse.** It's the production target, and cheap enough for hundreds of builds                                                                                                                                                            |
| Sonnet 5.5 medium / high    | ~$0.21–0.31, ~2.5 min / $0.69, ~8 min                    | the effort axis (H7: does more thinking mean fewer errors?). Used on a subset                                                                                                                                                                     |
| Haiku 5.5 low               | no single-build cost on record; fastest at ~210 tokens/s | the low end. If a fix lifts Haiku, that's a strong signal                                                                                                                                                                                         |
| Opus 5.5                    | $1.96, 13 min at high (r24opus); low not yet measured    | your S3 point: is the error tied to model ability? A subset at low and high                                                                                                                                                                       |
| GPT-6.1 Sol / Astra / Terra | Codex subscription                                       | a different model family, so it tests H6 (the convention mix) properly. But in r37 they crashed on 7–13 of 20 builds with our SDK (Sonnet: 1–4), so their crashes would bury the rotation scores there. Run them in the plain three.js setup only |
| Fable 5.1                   | $1.47, 6.9 min at low (r25fable)                         | Fable at high, working with renders, still built the bumper ram turned the wrong way. Small subset, only if Opus still makes the error                                                                                                            |

**Account limit:** all Claude runs go through marcellus. revoltage was at 99% of its weekly meter on 2026-10-27. The dollar figures are list prices; the real limit is the subscription meters.

**My recommendation, in phases:**

1. **Sonnet low only, baseline:** find which traps fire, and test the X/Y-axis prediction (H2).
2. **Fixes:** run them on Sonnet low and Haiku low.
3. **The best 2–3 fixes** on Sonnet high, a slice of Opus at low and high, and one GPT model in the plain setup.
4. **Fable** only if the error survives Opus at high.

When you've answered, I'll add your decisions to the open questions in `/home/cx/noodlespace/agentic-3js-builder/docs/ROTATION.md`, word for word, so the new session starts with them.

### S7, Stefan

> > Should a plain three.js setup run alongside the SDK?
>
> I should be asked every time because I'm going to make that decision depending on how much quota I have from any given provider.
>
> > The API change
>
> Forget the migration work. Tell me, what are the serious fallbacks of doing this? Are we limiting the models creatively or forcing them to write more code with this change? I assume the latter means, inherently, the former as well.
>
> Also isn't that the kind of thing that we want to experiment with one way and then the other as well?
>
> > Which models
>
> On models again, I will specify which models I want to check as we go. I definitely don't want to automatically drain my usage with a given provider because I'm silently, while I'm trying to gauge another provider.
>
> Also just drop Fable from the running. No it is good. So far I haven't seen a reason to use it.
>
> And we want to remember that we also want to test Gemini, especially 3.8 Flash but also Argon, on these as well.

### C6, Claude

**Yes to both: removing `rotation` would limit the models creatively, and the main way it does so is by making some things more code.** Here is what it costs, from my own habits.

#### What gets harder without angles

| What I want                                                                   | With `rotation`        | With `dir` only                                                                        |
| ----------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------- |
| Lean a box 30° forward                                                        | `rotation: [30, 0, 0]` | `dir: [0, 0.87, 0.5]`, plus `up` so the box's width stays sideways                     |
| Spin a hex nut 30° about its own axis                                         | `rotation: [0, 30, 0]` | no direct way: `up` sets the roll, so I'd derive an up vector from the angle with trig |
| A 45° diamond pattern of tiles                                                | one angle, repeated    | the same trig for every tile                                                           |
| Scatter rocks at random orientations                                          | three random angles    | a random direction and a random up                                                     |
| Tilt, then turn (a windmill blade with pitch, a leaning sign on a yawed post) | one triple             | compose two turns into one vector by hand: the arithmetic that fails today, moved      |

#### The serious drawbacks

1. **Roll comes back as `up`.** `dir` says where the part's axis points. For cylinders and spikes that's all there is. For a box, a card or anything with a distinct width, the turn about that axis still matters, and the SDK takes it as an `up` vector. "Lean 30° forward, width sideways" is easy; "spin 30° about your own axis" means deriving `up` from an angle, so the trig and its sign come back by the side door.
2. **The habit leaks to raw three.js.** `part.mesh.rotation.x = Math.PI / 6` stays available, and I would reach for it. That swaps degrees for radians, a new error class, and the SDK's frame no longer knows the part's orientation.
3. **Path of least resistance.** A single run has a token budget and, at low effort, little patience. I build what is cheap to express. If every tilt costs a line of trig, I tilt fewer parts: posts stay vertical, signs stay square, debris lies flat. Builds get stiffer. That is the creative limit, and it's the cost I'd expect to see first. It can be counted: the number of parts whose axes aren't aligned with the world's.
4. **Random and decorative angles are the natural case for angles.** Scatter, jitter, "a hat at a jaunty angle", a diamond pattern: angles are harmless there and the alternative is only more code.
5. **It may only move the sign problem.** With `dir`, "forward" is a `+z` in the vector, a fact I know, instead of "positive X turns +Y toward +Z", a rule I have to apply. I believe that is one layer less (C3). But for compound turns and for `up`, I'd still be composing by hand, and the sign can go wrong there too.

Where the change still helps: rings and anything placed by angle (the direction comes from the same numbers as the position), mirrored pairs (flip x, like a position), and anything that points at something.

#### Testing it both ways

Yes. Every arm that removes `rotation` runs against the baseline that keeps it, on the same tasks, and both sides are measured: the orientation errors, and the costs above: output tokens, module size, the tilted-part count, how often `mesh.rotation` appears, crashes. The tasks get a few angle-friendly controls (a scatter, a tilted hat, a diamond pattern) so the cost can show. Three removal variants: docs-only (the SDK unchanged; count how many builds write `rotation:` anyway), an SDK copy where a leftover `rotation:` throws an error naming `dir`, and one where it is ignored.

A middle ground to put in the same test (F7): `tilt: { toward: [0, 0, 1], deg: 30 }`, "lean the part's top toward the front by 30°". The sign becomes a direction, the amount an unsigned angle, and plain and random angles stay.

#### Your decisions, recorded

- Which models, which efforts, and whether plain three.js runs: asked before every round, word for word in the ground rules.
- Fable is out.
- Gemini 3.8 Flash and Argon are on the list. `google-antigravity/gemini-3.8-flash` is in the nilo profile's model list today; Gemini 4 Argon ran in r23 as `google-antigravity/gemini-4-argon` but isn't in the list on 2026-10-27, so it needs a check before a round.

The document is updated with all of this (hypothesis H8, arms F6a–c and the `tilt` idea under F7, the models list, the decisions) and committed.
