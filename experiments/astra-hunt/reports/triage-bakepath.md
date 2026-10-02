### BAKE-3: Export baking scales model-space geometry around the origin
- Verdict: confirmed
- Severity: P1 — `assemble()` silently moves documented model-space/merged vertices by up to 0.3%; this is a consumer-visible export corruption even though the growth was deliberately added as a z-fighting/seam workaround.
- Samples hit: every export with more than one visible mesh (the `grow` calculation is unconditional per part); direct documented model-space callers include arcadeTentacleAlien, blacksmithForgeGemini, blacksmithForgeSonnet, blossomDeer, brassDiver, brutalistWalkerFortress, bunnyBakeryIsland, cactusGunslinger, clockworkCarousel, clockworkCrocodile, clockworkOwl, codexJaguarWarrior, cyberpunkNoodleStall, dieselpunkWarElephant, dosBasilisk, feltPlushSloth, flowerHedgehog, gameboyFrog, gingerbreadGolem, hamsterRover, hedgehogPostie, lighthouseCove, littleLich, mushroomVillage, orcBerserkerOx, picturebookReef, pixelCapybara, pixelHarvestVillage, ps1CaveSpider, ps1Raptor, retroActionHero, scarecrow, steamLocomotive, sushiCat, teapotDragon, tinToyCrab, toonFennec, toonRedPanda, treehouseDiorama, vikingLongship, and others.
- Fix: remove `grow` from `bakePart`/`assemble` for exported coordinates; solve rigid seam/z-fighting with the existing cap/`overlap` mechanisms or render/material ordering. Keep the exact model-space contract in `docs/conventions.md` and add a regression for `b.part(..., { bone, at: [0,0,0] })`.

### BAKE-1: Custom skin weights are copied without normalisation
- Verdict: confirmed
- Severity: P1 — accepted custom weighted meshes can deform in bind pose and the failure is silent; it is lower than P0 because it requires a custom `skinBones`/attribute input and no shipped sample uses that path.
- Samples hit: none (search found no shipped `skinBones`, `skinWeight`, or `skinIndex` usage).
- Fix: validate finite, non-negative indices/weights in `assemble()` and either reject zero/invalid sums or retain the four strongest influences and normalise each vertex's weights before writing the merged `skinWeight` attribute; document the rejection/normalisation rule in `docs/api.md` if changed.

### PATH-3: Two-point closed polylines are rejected
- Verdict: confirmed
- Severity: P1 — the documented `closed` operation promises joining the last point to the first, but the valid two-point case throws before a path exists.
- Samples hit: none (shipped closed paths use rings/loops with at least three distinct points; no two-point `polyline(..., { closed: true })` call was found).
- Fix: change `polyline()`'s closed minimum to two distinct points and preserve the duplicated endpoint/two segments, or explicitly amend `docs/api.md` and the closed-path contract to require three points; the former matches the current wording.

### PATH-5: Arc/spiral knots miss documented 45°/90° marks
- Verdict: confirmed
- Severity: P1 — `src/path.ts` explicitly documents these knot marks and `chain()` defaults to one joint per knot span, so fractional arcs/coils can silently put default stations at the wrong angles.
- Samples hit: none use the affected arc/spiral knots for default chain/station placement. Arc/spiral consumers were checked: sleepySloth (`arc`, but `b.chain(..., { count: 2 })`), tentacleSerpent (`arc`, but `sprout(..., { count: 5 })`), alebrijeJaguar, gameboyFrog, octopusBarista, veiledChameleon and ukiyoeOctopus (spirals, all explicit chain counts), while the remaining arc/spiral samples only sweep the path. Existing `.knots` consumers such as bengalTiger, blossomDeer, axolotl, ramFawn and redFox use Catmull knots, not arc/spiral marks.
- Fix: have `arc()`/`spiral()` pass sample indices for every complete 45°/quarter-turn mark plus the endpoint into `smoothPath({ indices })`; compute each knot from the sampled cumulative length. Keep `chain()`'s default knot-span behavior and update the path regression repro/docs if needed.

### BAKE-2: Atlas overflow retries forever at minimum tile size
- Verdict: confirmed
- Severity: P2 — it is an unbounded hang, but requires an extreme 60,000-unique-texture input far beyond shipped sample usage.
- Samples hit: none (no shipped sample approaches the atlas packing edge case or supplies that texture count).
- Fix: in `buildAtlas()` detect no progress after `shrink()` reaches minimum tiles (or enforce a documented texture/atlas limit) and throw a packing-overflow error instead of continuing the `halvings` loop; no sample changes are needed.

### PATH-1: Equal-parameter slice exposes a NaN path
- Verdict: confirmed
- Severity: P2 — degenerate input is uncommon, but normal `Path` queries return NaNs rather than a named rejection or defined degenerate result.
- Samples hit: none (no shipped sample slices a path with equal endpoints).
- Fix: in `Path.slice()` reject `b - a <= EPS` with a named error, or define finite degenerate-path behavior and make `Path`/`knots` handle zero length without division by zero; add the contract to `docs/api.md`.

### PATH-2: Very-short valid curves are rejected by absolute tolerances
- Verdict: confirmed
- Severity: P2 — arbitrary model-space coordinates are documented, but only sub-micron-scale inputs are affected and no shipped sample uses them.
- Samples hit: none (no sample uses paths at the 1e-9–1e-8 metre scale).
- Fix: replace the absolute duplicate thresholds in `polyline()`/`smoothPath()` with exact-duplicate handling or a scale-relative tolerance, retaining an explicit zero-length check for genuinely degenerate curves; document any minimum if one is intended.

### PATH-4: Curve arc-length queries are chord-polyline approximations
- Verdict: docs gap
- Severity: P2 — the fixed dense sampling creates bounded, measurable error (the repro observed about 0.02% on a full circle and larger position error on a sharp quadratic), but this is the implementation's stated dense-polyline representation rather than an accidental nontermination/corruption bug.
- Samples hit: all shipped samples using `bezier`, `catmull`, `arc`, or `spiral` technically use the approximation; no sample was found that requires analytic/exact arc length or asserts an exact value. The arc/spiral set includes chibiKnight, feltPlushSloth, sleepySloth, tentacleSerpent, treehouseDiorama, clockworkAutomaton, gameboyFrog, octopusBarista, ramFawn, jadeSerpent, marginaliaSnailKnight, stainedGlassMoth, veiledChameleon, alebrijeJaguar, amigurumiNarwhal, and ukiyoeOctopus.
- Fix: clarify in `docs/api.md` that `Path` stores sampled chord polylines and state an accuracy/detail guarantee; if exact curve semantics are required instead, replace fixed `smoothPath()` sampling with adaptive arc-length tables (and add accuracy-focused tests).
