# outlinedocs triage

### OUTLINE-1: Lathe profiles that touch the axis emit degenerate triangles
- Verdict: confirmed
- Severity: P1 — this is a documented, common solid-profile form and shipped samples use axis-closing profiles; it inflates triangle counts and leaves measurable zero normals, even though the zero-area faces did not produce a visible hole or shading change in the repro.
- Samples hit: alebrijeJaguar, axolotl, artDecoFalcon, blacksmithForgeKimi, blacksmithForgeOx, blacksmithForgeSonnet, blossomDeer, bunnyBakeryIsland, cactusGunslinger, chibiKnight, clockworkAutomaton, clockworkCarousel, clockworkCrocodile, clockworkOwl, clockworkStag, curiosityJackalope, dieselpunkWarElephant, dosBasilisk, dromedaryCaravan, gbcSlimeKing, goldenPheasant, graffitiSkateRat, griffin, hamsterRover, hedgehogPostie, honeyBee, indianPeafowl, inkwashCrane, jadeSerpent, koiPondIsland, leafTanuki, littleLich, mantaRay, marginaliaSnailKnight, mochiCatBaker, neonScorpion, octopusBarista, oldFisherman, orcBerserkerOx, orcBerserkerSonnet, paperDragonKite, penguinIceCreamCart, picturebookReef, pixelCapybara, pixelMammoth, porcelainElephant, sailfish, scarecrow, secretaryBirdGemini, sleepySloth, steamLocomotive, stegosaurus, teapotDragon, tinToyCrab, tinToyDragon, toonRedPanda, treehouseDiorama, triceratops, ukiyoeKappa, vgaSkeletonWarrior, wanderingMerchant, wyvern
- Downstream: the repro remains finite and renders; `meshFromWorld()` computes zero-length normals for vertices belonging only to degenerate flat faces (72 zero normals in the 6-segment probe, 24 in the 12-segment probe). `harness/assemble.ts` counts the faces and their area but has no degenerate-face issue, and no GLB rejection was observed; the primary shipped impact is measurable triangle/normal waste rather than a visible artefact.
- Fix: In `lathe()` (`src/outline.ts`), represent each x=0 profile point as one pole and emit one non-degenerate triangle per sector to/from it, rather than a full coincident column. Keep the profile/paint coordinates and add a focused axis-pole regression check; no sample changes are needed.

### DOCS-4: GUIDE’s documented report-only path workflow fails for required hyphenated scratch files
- Verdict: docs gap
- Severity: P1 — the mandated `scratch/<slug>/` workflow and `hunt-docs-*.ts` naming cannot reach the documented report-only command; the wrapper accepts the path but the harness rejects its derived slug.
- Samples hit: none (affects throwaway path-based scripts, not shipped sample source)
- Downstream: `npm run preview -- scratch/hunt-docs/hunt-docs-triangle-budget.ts` succeeds, while `npm run snap -- scratch/hunt-docs/hunt-docs-triangle-budget.ts --report-only` exits 2 with “Missing or invalid <slug>”; no model/GLB is produced.
- Fix: Align `scripts/snap.ts` path handling with `harness/snap.ts`: either pass a sanitized slug or permit `-`/`_` in the harness slug regex. Update the usage text and GUIDE workflow together; no sample changes.

### DOCS-2: API examples hard-code the author’s absolute checkout
- Verdict: docs gap
- Severity: P1 — copied snippets fail as soon as the reader uses another checkout, directly contradicting the relative-import contract in GUIDE.md.
- Samples hit: none (the bad imports exist only in `docs/api.md` examples)
- Downstream: the audit found all eight absolute source imports in the module/type examples; copied code resolves only under this checkout and cannot typecheck elsewhere. This is a documentation/tooling failure, not generated geometry or GLB corruption.
- Fix: Replace `/home/cx/noodlespace/agentic-3js-builder/src/...` with `../src/...` in `docs/api.md:86-92,369`, and state that snippets are relative to `samples/<slug>.ts`. No sample changes.

### OUTLINE-2: Self-fitting bevel reaches a collapsing inset on thin outlines
- Verdict: confirmed
- Severity: P1 — an allowed, ordinary outline can silently produce near-zero-area faces; I retain P1 despite no shipped sample hit because the geometry is numerically unstable and the documented “shrinks until it fits” guarantee is not met.
- Samples hit: none (the shipped extrudes use bevels below the collapse threshold; no shipped call matched the 10 m × 0.01 m outline with a 1 m request)
- Downstream: the repro produced 8/60 faces below the harness-scale degeneracy threshold and a minimum cross-product magnitude of `1.2052200567606576e-12`. Normals remained finite/nonzero in this flat-shaded probe, so no visible shading defect or harness issue/GLB rejection was observed; it is near-degenerate geometry and wasted triangles today, with unstable normal direction as the risk.
- Fix: Tighten `insetFits()` to require positive edge-length/clearance margin, return a bevel strictly below the first collapse in `fitBevel()`, and defensively omit residual zero-area wall triangles in `extrude()`. Add a regression repro; no sample changes.

### DOCS-6: API promises a nonexistent `kit.rng(seed)` helper
- Verdict: docs gap
- Severity: P1 — the documented deterministic-randomness alternative throws at runtime and fails TypeScript for every shipped kit.
- Samples hit: none (a search of `samples/*.ts` found no `kit.rng` call; all use `rng` from `src/math` or local deterministic helpers)
- Downstream: `scratch/hunt-docs/hunt-docs-kit-rng.ts` fails (`kit.rng is not a function`), and no `rng` export exists in `kits/*.ts`; there is no model, geometry, or GLB impact until a user copies the example.
- Fix: Remove `kit.rng(seed)` from `docs/api.md:79` and document/import `rng` from `../src/math` as the sole SDK helper. No kit or sample changes.

### OUTLINE-3: Beveled knife-edge taper emits collapsed triangles
- Verdict: confirmed
- Severity: P1 — `thickness: [0, positive]` is explicitly documented and accepted, but the bevel path indexes faces whose endpoint ring has collapsed.
- Samples hit: none (no shipped `b.extrude` call uses a zero endpoint; `b.spike` is a sweep helper and is not this path)
- Downstream: the repro produced 4 exactly zero-area faces out of 60 and 12 zero-length normals; the remaining knife-edge surface is finite and the collapsed faces are not visibly rasterized. No harness issue or GLB rejection was observed, so the current effect is measurable topology/normal waste rather than a visible shading artefact.
- Fix: In `extrude()`/`band()`, treat a zero-thickness endpoint as a pole and omit side/bevel faces whose two rings coincide, while retaining the silhouette. Add a zero-end taper regression check and clarify the knife-edge tessellation in the API docs if the implementation chooses a specific pole convention.

### DOCS-1: Closed polyline sweep semantics contradict across docs
- Verdict: docs gap
- Severity: P2 — implementation and `docs/conventions.md` agree, but the API sentence can mislead authors of closed polygonal loops into expecting no cap geometry.
- Samples hit: blacksmithForgeOx, hamsterRover, tinToyCrab, wyvern (closed `polyline` sweeps; smooth closed `catmull` loops follow the capless path)
- Downstream: the square repro built one mesh with 82 vertices and bounds extending to about ±0.6 for a ±0.5 path with radius 0.1, demonstrating overlapping round seam caps. This is intentional visible geometry, not a harness/GLB failure.
- Fix: Rewrite `docs/api.md:151` to say smooth closed seams are welded/capless, while corner seams such as closed polylines receive overlapping round caps, matching `docs/conventions.md:72`. No code or sample changes.

### DOCS-3: GUIDE misstates the triangle limit as a hard 60k cap
- Verdict: docs gap
- Severity: P2 — it changes author decisions and may cause unnecessary simplification, but does not reject or corrupt a build.
- Samples hit: none (the wording is in GUIDE.md, not a shipped sample)
- Downstream: the triangle-budget repro previews at 65,024 triangles with only `WARNING 65024 triangles is above the 60000 soft budget`; `harness/assemble.ts` defines 60,000 soft and 120,000 hard. No geometry, normals, harness error, or GLB validity issue follows from the wording.
- Fix: Change `GUIDE.md:21` to “120k triangles hard limit, 60k soft budget,” matching `docs/api.md:80` and `harness/assemble.ts:85,397-402`. No sample changes.

### DOCS-5: Mid-body rooting example contains invalid TypeScript ellipsis
- Verdict: docs gap
- Severity: P2 — the example cannot be copied or typechecked, but it does not affect runtime library behavior or shipped samples.
- Samples hit: none (the invalid expression exists only in `docs/api.md:180-187`)
- Downstream: `npm run typecheck -- scratch/hunt-docs/hunt-docs-chain-snippet.ts` reports two `TS1109: Expression expected` errors at the bare `...` tokens. There is no geometry, normals, harness, or GLB impact.
- Fix: Replace the prose ellipses with valid intermediate arrays and spread syntax, for example `catmull([...tailPoints, rootPoint, ...headPoints])`, or move the omission explanation outside the TypeScript expression. No sample changes.

### Covered review: part/cards and pose
- The `hunt-partscards.md` Covered cases remain correctly classified as intended/documented: `b.part({ bone })` without `at` intentionally places geometry at the bone joint, and region literal/`region.p()` behavior matches the current docs.
- The single `hunt-pose.md` Covered case is also correctly classified as fine: the posed decal had finite vertices and followed its pre-pose surface hit. No additional finding was added.
