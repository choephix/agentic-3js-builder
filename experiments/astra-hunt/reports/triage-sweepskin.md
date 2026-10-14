### SWEEPSKIN-2 / SWEEPCORE-1: `sweep.at()` can be off the generated mesh between adaptive rings
- Verdict: confirmed (both repros independently reproduce the same analytic-frame versus tessellated-ring mismatch; `docs/api.md:240` and `docs/conventions.md:16-18` promise a frame on the built surface)
- Severity: P1 — the synthetic 40–50 mm tubes miss by 7.28–18.08 mm (mean 8.19 mm), so geometry attached through the documented handle can visibly float; the shipped impact is scale-dependent. I measured direct `b.stick(..., sweep.at(...))` uses in three real samples: `artNouveauDragonfly` (max 0.343 mm on 10.8–26.1 mm-radius abdomen points, sub-pixel at its 1.2 m scale), `biomechSwarmQueen` (abdomen ridge max 7.29 mm on ~340 mm-radius points, roughly 2 px at the report's 900 px / 3.5 m scale and potentially visible), and `clayWalrus` (sub-nanometre mesh distance at its t=.9 digit attachments, not visible). Thus it is clearly visible in the repro and occasionally measurable in real proportions, but not a universal sample-level gap.
- Samples hit: `artNouveauDragonfly`, `biomechSwarmQueen`, `clayWalrus`, `nileCrocodile` (direct `sweep.at` attachment/query calls; the first three were measured cleanly)
- Fix: In `Sweep.atU` (`src/sweep.ts:470-480`), retain the selected ring representation used by the emitter (`src/sweep.ts:922-975`) and interpolate its posed section/polygon, or insert a query ring under the same sag bound. Update the `sweep.at` docs/status limit and add a regression for curved tubes.

### SWEEPSKIN-1: Splitting a smooth sweep at a sharp path corner drops the corner fillet
- Verdict: confirmed (`src/sweep.ts:644-662` only creates a fillet when the corner is strictly inside the range; `capFor` then gives each cropped half an ordinary round end cap, contrary to `docs/api.md:219`'s two-halves-of-one-tube promise)
- Severity: P1 — a range boundary exactly at a sharp corner silently changes the silhouette from one rounded bend to two perpendicular domes; the repro's radius is 200 mm, so this is a large, visible shape change.
- Samples hit: none with a shipped smooth sweep range boundary intentionally coincident with a sharp path corner. Ranged users (`axolotl`, `barnOwl`, `bengalTiger`, `clockworkAutomaton`, `clockworkStag`, `dreadKnight`, `giantAnteater`, and `hummingbirdAtFlower`) use smooth/continuous or separate material ranges, but none reproduced this exact corner-boundary trigger.
- Fix: In fillet construction, preserve a source corner fillet when `from`/`to` lands on that corner (including its boundary ring), or share one boundary fillet between adjacent range sweeps rather than emitting two end caps; no sample change is needed.

### SWEEPSKIN-3: Round start cap of a flexed leg can protrude from the flank
- Verdict: intended (`b.sweep` has no parent-volume/seated-root input; the documented seating/bury contract belongs to `b.sprout`, `docs/api.md:279-285`)
- Severity: P2 — the direct generic-sweep repro is numerically real (default cap reaches x=.6428 versus body max x=.5; `caps:"none"` reaches x=.5511), but asking an unannotated sweep to infer that its start is buried is outside its API contract. Use `sprout` when the root is a seated appendage.
- Samples hit: `alebrijeJaguar`, `artDecoFalcon`, `barnOwl`, `biomechSwarmQueen`, `blossomDeer`, `brassDiver`, `chibiKnight`, `chibiMechPilot`, `centaurArcher`, `clockworkOwl`, `dreadKnight`, `flowerHedgehog` (direct leg/appendage sweeps with default round starts; they are not evidence of a missing generic-sweep contract)
- Fix: No generic `sweep` change. If a sample needs seated-root semantics, migrate that appendage to `b.sprout(..., { bury })`; only add a sample/docs note clarifying that direct `sweep` caps are not clipped.

### SWEEPSKIN-4: Coloured/banded pieces can rasterize a hairline crack at a shared edge
- Verdict: confirmed (`docs/api.md:228` promises shared boundary vertices and weights with no gap; the repro has matching positions but independently skinned mesh pieces with reversed local bone order and reports a 2.27e-8 m seam)
- Severity: P2 — the geometry is numerically coincident and the defect is a renderer/material-boundary hairline, but it is a shipped-sample-visible cosmetic crack (the same issue is recorded in `docs/STATUS.md:267`).
- Samples hit: `redFox`, `artNouveauDragonfly`, `biomechSwarmQueen`, `axolotl`, `bengalTiger`, `bisonBull`, `bobaSlime`, `blossomDeer`, `chibiKnight`, `clockworkStag` (banded or colour-function smooth sweeps; `redFox` is explicitly the STATUS trigger)
- Fix: Change `src/sweep.ts:887-915`/mesh assembly to keep one deformed vertex buffer and material groups for colour pieces, or use shared vertex-colour/material indirection. Keep the docs promise; no sample workaround should be added.

### SWEEPCORE-2: Narrow sector boundaries become saw-toothed on bent tubes
- Verdict: confirmed (`hunt-sweepcore-known.ts` reproduces a 90-degree bend with two sector meshes; `src/sweep.ts:753-803` connects boundary vertices by greedy ring fractions/chords rather than an edge-following curve; `docs/STATUS.md:265` already lists sector edges as saw-toothed)
- Severity: P2 — this is a visible paint-edge defect, but it affects narrow sector boundaries and not the tube's watertight geometry; it is lower impact than the documented surface-query and silhouette failures.
- Samples hit: `axolotl`, `bengalTiger`, `blossomDeer`, `dromedaryCaravan`, `flyingFox`, `giantAnteater`, `hammerheadShark`, `hydra`, `komodoDragon`, `redFox` (sector paint on curved body/limb sweeps)
- Fix: In `ring`/`connect`, add edge-following boundary tessellation or a dedicated sector-edge strip with curvature/ring spacing limits matching the centreline; update the known-issue note when fixed.

### SWEEPCORE-3: Round caps on rigid box sections leave diagonal wedges at sharp corners
- Verdict: confirmed (`hunt-sweepcore-boxverts.ts` reproduces diagonal ±.1414 vertices alongside the ±.2 box corners; `src/sweep.ts:810-839,854-863,982-993` applies a round dome at rigid corner cuts; `docs/STATUS.md:266` records this known issue)
- Severity: P2 — the wedge is visible but limited to sharp-corner rigid box sweeps; ordinary circle sections, flat caps, and smooth bends are unaffected.
- Samples hit: `atariAnglerfish`, `articulatedDeskLamp`, `mimicHermitCrab` (rigid box sweeps; verify only the sharp-corner paths need the fix)
- Fix: In `capRings`/`capFor`, clip a box corner dome against the adjacent box half-spaces or emit a planar miter/transition that preserves the square faces; retain round caps for ordinary circular sections.

### SWEEPCORE-4: Empty radius profiles throw an opaque internal TypeError
- Verdict: confirmed (`b.sweep(..., [])` reaches `src/sweep.ts:222-225` and throws `TypeError: Cannot read properties of null (reading 'x')` instead of identifying the invalid profile; `docs/api.md:219` and `src/sweep.ts:48` expose `number[]` as a public radius form)
- Severity: P2 — invalid input does not corrupt valid geometry, but the public API gives an unusable internal error and also accepts non-finite/degenerate profile values without a clear contract.
- Samples hit: none (no shipped sample passes an empty radius array)
- Fix: Validate radius arrays at `radiusFn`/the `sweep` entry point as non-empty finite profiles and throw a targeted `sweep(): radius profile...` error before frame/mesh construction; document the non-empty requirement.
