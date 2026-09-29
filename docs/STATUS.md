# Status, 2026-09-28

Where the work stands. The API is in `README.md`, the reasons behind it in `docs/DESIGN.md`.

## Origin

Nilo Creature Lab (`~/workspace/nilo-creature-lab`, site https://nilo-creature-lab.netlify.app, data `~/tmp/public/nilo/creature-lab/`) is a library of primitive-built, skeleton-rigged, non-humanoid creatures for benchmarking AI auto-rigging and animation services. Claude Opus 5.5 built 100 of them with only a tiny kit (`harness/kit.ts`); GPT-6 Astra low/xhigh rebuilt them. Scouts read every Opus build and classified all 304 iteration diffs: most builds re-invented world-space joint placement and surface math, and a third of all steps went to tuning surface offsets and retyping dependents. Stefan asked for an SDK that removes that repeated and hard-to-position work, as its own project. His overriding requirement: "a simple, understandable, easy-to-use API is key since we're going to give this work to fast and cheap language models."

## History

All commits are local; nothing is pushed.

| Commit  | Batch   | What                                                                                                                                                                                                                                                                                                                                                                                                |
| ------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| e4f8d12 | 1       | Model-space joints and parts, `aim`, paths, `chain`, `sweep` (+ rod/capsule/spike/frustumBox/loft sugar), `surface`/`stick`, `membrane`/`slab`, `ring`/`along`, IK, `region`.                                                                                                                                                                                                                       |
| 22632e7 | 2       | From a Gemini/Kimi/Grok/Fable brainstorm: `limb` N-segment solver (replaced twoBoneIK), chain `names`, sweep `sectors`/`shift`/`twist`/`extend`, closed paths, `spiral`, `surface.drape`, `sweep.line`, `sprout`.                                                                                                                                                                                   |
| a116bcd | 3       | `b.pose` after building (handles stay live via Capture), `createBuilder({ detail })`, rig answer key (`root.userData.rig`: roles, contacts, hinges), `fan` (later removed). Stefan asked only for `pose`; he kept the rest after the fact.                                                                                                                                                          |
| 4511b18 | 4       | Stefan: "a bone is just a point/line in space". Everything takes Point/Direction/Frame/Path inputs; parts, hits and tube points are Frames; one bone-inheritance rule; `fan` became `b.ring(line, { joints })`; `pose` about any line.                                                                                                                                                              |
| 656fe3c | samples | `samples/` library and the local showcase (Vite, plain TS). Sample contract: `samples/<slug>.ts` default-exports a no-arg function returning a `THREE.Object3D`, optional `meta`.                                                                                                                                                                                                                   |
| 842f88d | 5       | Smooth skinning by default for sweeps, lofts and membranes on chains: one continuous mesh, weights blended ±1 local radius at joints. `skin: "rigid"` opts out.                                                                                                                                                                                                                                     |
| 729f43b | guide   | `GUIDE.md`, the reusable brief for a builder agent, and `npm run snap`.                                                                                                                                                                                                                                                                                                                             |
| ea6266c | guide   | giantAnteater, committed by its Astra builder with type errors (see to-dos).                                                                                                                                                                                                                                                                                                                        |
| 73f24ca | 6       | `extrude` (a 2D outline in any plane; taper, self-fitting bevel, corner-cut smoothing, "sharp" corners) and `lathe` (the same outline spun around an axis). Crossing outlines throw.                                                                                                                                                                                                                |
| 115bc75 | samples | Outline showcase, each built by Claude Opus 5.5 from `GUIDE.md`: stegosaurus (extruded plates, lathed beak and pads; 40.3k tris).                                                                                                                                                                                                                                                                   |
| 0235b83 | samples | sailfish (extruded sail split per spine bone with membrane gap strips, fins and forked tail; lathed eyes and gill cover; 20.5k tris).                                                                                                                                                                                                                                                               |
| 0a62e8b | samples | indianPeafowl (66 extruded eye feathers with stacked extruded eye spots on a 9-joint ring; lathed beak and eyes; 52.0k tris).                                                                                                                                                                                                                                                                       |
| 584237a | samples | triceratops (extruded scalloped frill with sharp tips and beak; lathed horns, frill spots and skin bumps; 36.5k tris; real size, 7.8 m). Opus, 4 renders.                                                                                                                                                                                                                                           |
| 9e97f9e | samples | axolotl (144 extruded gill filaments riding 2-joint gill stalks; lathed toe pads and eye rings; 25.0k tris). Opus, 5 renders.                                                                                                                                                                                                                                                                       |
| dcaafa4 | samples | veiledChameleon (tapered extruded casque with inset core, sawtooth crests that follow the spine; lathed eye turrets on eye joints, claws; 24.6k tris). Opus, 4 renders.                                                                                                                                                                                                                             |
| 55efe7d | samples | mantaRay (extruded jaw, pelvic and dorsal fins, remora fins; lathed eyes, spiracles and remora bodies; 23.0k tris). Opus, 5 renders.                                                                                                                                                                                                                                                                |
| 9a95789 | samples | griffin (extruded wing feathers, coverts, body feathers and ears; lathed cere, eyes and pads; 44.0k tris). Opus, 5 renders.                                                                                                                                                                                                                                                                         |
| 104ac5e | 7       | `sweep`/`loft` `bone` takes a list of chains and joints, in any order and either direction along the path, so tail, trunk and neck can be one tube over a skeleton that forks at the hips.                                                                                                                                                                                                          |
| 8eaed1e | samples | triceratops converted: one loft from tail tip to skull over `[tail, hips, spine]`.                                                                                                                                                                                                                                                                                                                  |
| ffc0eff | samples | stegosaurus converted the same way; plates and thagomizer remapped onto the one tube.                                                                                                                                                                                                                                                                                                               |
| f65bccf | samples | snowLeopard converted; the tail keeps full rings and a black tip by sweeping the same curve and bones in two ranges, since sectors run the whole tube.                                                                                                                                                                                                                                              |
| 5ac9f8d | samples | nileCrocodile converted with the same two-range split; dorsal scutes, nuchal shield and tail crests remapped.                                                                                                                                                                                                                                                                                       |
| 0fcd1bc | samples | wyvern (tail, spine and neck) and griffin (tail, lion body and neck; the throat sliver is gone) as one tube each.                                                                                                                                                                                                                                                                                   |
| 00fd693 | samples | barnOwl (body and neck) and hammerheadShark (trunk and tail) converted.                                                                                                                                                                                                                                                                                                                             |
| 8b2b4d0 | samples | giantAnteater converted; tail bands kept by sweeping the tail range without the body sectors.                                                                                                                                                                                                                                                                                                       |
| 52f67aa | samples | redFox converted; body, red tail and white tag are three ranges of one curve.                                                                                                                                                                                                                                                                                                                       |
| 454b9ad | samples | peacock converted (body and neck).                                                                                                                                                                                                                                                                                                                                                                  |
| 0c29071 | samples | sailfish: body and head on one curve over `[spine, head]`; the chain runs backward from the root, the head forward.                                                                                                                                                                                                                                                                                 |
| d24a526 | samples | axolotl converted. Its v08 report has two inside-out warnings on the tail's side sector strips; their normals face outward (checked against vertex normals and the tube side), so the harness's false alarm (see to-dos).                                                                                                                                                                           |
| fc710a1 | samples | mantaRay converted (body and whip tail).                                                                                                                                                                                                                                                                                                                                                            |
| 4c07f88 | samples | veiledChameleon converted; tail range keeps only the belly sector. v07 has six inside-out warnings on the body's 12° stripe sectors, checked outward-facing: the same false alarm.                                                                                                                                                                                                                  |
| 4dea073 | samples | indianPeafowl: body and neck on one curve instead of a sprouted neck. ramFawn was tried and left unchanged: merging its short tuft changed the rump and tail silhouette. tentacleSerpent keeps its deliberate rigid-armour tail.                                                                                                                                                                    |
| 06fa254 | fix     | Sector clock and `Sweep.at` reference stay continuous where a tube passes vertical; before, a coil's belly stripe and crest jumped sides every half turn (chameleon tail, also in its original v04). Only veiledChameleon and griffin change. Chameleon v08: seven inside-out warnings, all outward-facing strips (the harness false alarm). griffin: unused `zAt` removed, which failed typecheck. |

## Guide test run

On 2026-09-28 six builders each got `GUIDE.md` and one animal.

| Model            | Sample          | Final tag | Result                               | In git                   |
| ---------------- | --------------- | --------- | ------------------------------------ | ------------------------ |
| Claude Opus 5.5  | snowLeopard     | v13-final | good; 34.7k tris, 12 min             | untracked                |
| Claude Opus 5.5  | nileCrocodile   | v10       | good; 24.8k tris, 15 min             | untracked                |
| GPT-6 Astra      | giantAnteater   | v02       | crude                                | ea6266c, fails typecheck |
| GPT-6 Astra      | barnOwl         | v03       | crude                                | untracked                |
| Gemini 3.8 Flash | redFox          | v03       | decent                               | untracked                |
| Gemini 3.8 Flash | hammerheadShark | —         | still running at the time of writing | untracked                |

- Gemini ran through the Cursor account: Antigravity quota is out until 2026-09-29 15:02 UTC. Cursor dropped mid-run and both Gemini builders were resumed.
- Opus build time is almost all model generation (~600 s of ~620 s, ~55k output tokens, 10-13 rounds). A render takes 1-2 s.

## To-do

Friction the builders reported:

- [ ] Triangle limit disagrees: `GUIDE.md` says 60k, `README.md` "Requirements" says 120k. The harness (`harness/assemble.ts` `LIMITS`) errors above 120k and warns above 60k, and GUIDE's done-criterion is a report with no issues.
- [ ] `chain.at(t)`: builders read `.p`/`.joint`; the fields are `.at`/`.bone`. The wrong names crash at run time.
- [ ] `Hit` has no `tangent`; two builders reached for one.
- [ ] `radius: [r0, r1]` reads as an ellipse but is a linear taper; an ellipse needs `(t) => [rx, ry]`.
- [ ] `limb` silently straightens when the target is out of reach.
- [ ] Sloped feet: the round end cap dips below the floor, and the snap report doesn't flag min y < 0.
- [ ] `surface(joint)` finds no meshes on a smooth-skinned chain; the mesh sits under its heaviest bone.
- [ ] Sweep `sectors` on narrow colour-split pieces trigger the harness's inside-out false alarm.
- [ ] README has lines over 1,000 characters (the `b.chain` and membrane paragraphs), which read tools truncate.
- [ ] One broken sample fails `npm run typecheck` for everyone.

Samples:

- [ ] Fix giantAnteater's type errors: a 3-tuple `radius` (~line 55) and `hit.tangent` (line 253).
- [ ] Review and commit the untracked guide-test samples: barnOwl, hammerheadShark (once its builder finishes), nileCrocodile, redFox, snowLeopard.

Known geometry issues:

- [ ] `sweep.at` can sit 3-5 mm off the mesh between rings on strongly curved tubes.
- [ ] The round start of a leg tube bumps out of the flank when flexed.
- [ ] Draped collars lag on hard neck bends.
- [ ] Sector edges are saw-toothed.
- [ ] Box sections: round caps can leave wedges at the corners of sharp bends.

## Sibling repos

- `~/workspace/nilo-creature-lab`: the harness `npm run snap` drives (`harness/snap.ts`). It has to be checked out. SDK-related commits there, also local:
  - db5ed31: the rig answer key goes into the report and the rigged GLB extras.
  - 3964259: keep per-vertex bone weights a part already carries.
  - 1c352fb: `CREATURE_LAB_DIR` sets the snap output folder.
  - The creature-lab site hasn't been redeployed since.
- `~/tmp/public/nilo/creature-lab/GUIDE.md`: the lab's creature contract, which SDK output meets.

## Output locations

Under `~/tmp/public/nilo/agentic-3js-builder/`:

- `snaps/<slug>/<B|A>/`: `npm run snap` output. `snaps/` holds each tag's contact sheet, shots, report and the sample as rendered; `out/` the GLBs. B for rigged samples, A for plain objects. `snaps/index.html` is the harness's progress page.
- `smoke/batch2` … `smoke/batch5`, `smoke/sdkSmoke*`: smoke renders from the SDK batches.
- `showcase/`: showcase screenshots.
