# Frame/math, IK, and skeleton triage

### FRAMEMATH-1: `Frame.moved()` silently changes orientation for non-cardinal frames
- Verdict: confirmed
- Severity: P0 — this is a silent violation of the documented “same orientation” guarantee and it changes shipped sample geometry wherever the returned frame is consumed by `stick` or `cards` (not `part({ frame })`, which reads the intact quaternion).
- Verification note: the repro also fails for `frame(..., [1, 0, 0])`/`[-1, 0, 0]` (returned axis becomes +Z); only several Y/Z cardinal cases happen to mask the defect.
- Samples hit: **wrong oriented geometry** — `blossomDeer`, `feltPlushSloth`, `hedgehogPostie`, `inkwashCrane`, `islandTortoise`, `lifeguardSculpt`, `mossStoneGolem`, `orcBerserkerSonnet`, `pangolin`, `pixelMammoth`, `porcelainElephant`, `robotGardener`, `scarecrow`, `secretaryBirdSonnet`, `sprinterSculpt`, `warthogKimi`, `warthogSonnet`; **non-axis `moved` calls whose result is used only as a point/path input (position is correct, orientation is discarded)** — `amigurumiNarwhal`, `barnOwl`, `biomechSwarmQueen`, `centaurArcher`, `cyberpunkNoodleStall`, `emperorPenguin`, `flowerHedgehog`, `giantAnteater`, `griffin`, `hydra`, `indianPeafowl` (crest/train only), `leafySeadragon`, `lizardfolkHunter`, `peacock`, `pico8Rooster`, `picturebookReef`, `redLionfishAstra`, `redLionfishKimi`, `sailfish`, `stegosaurus`, `tinToyDragon`, `warthogOx`, `wyvern`; local-only uses on diagonal joints/parts (including `alebrijeJaguar`, `barnOwl`, `blacksmithForgeOx`, `centaurArcher`, `curiosityJackalope`, `dromedaryCaravan`, `emperorPenguin`, `flyingFox`, `goldenPheasant`, `griffin`, `hammerheadShark`, `hamsterRover`, `inkwashCrane`, `bengalTiger`, `snowLeopard`, and others) are geometrically correct because `local()` does not mutate the quaternion. `part({ frame })` also reads the moved frame's intact `quat`, so frame-only uses in `bengalTiger`, `goldenPheasant`, `indianPeafowl` (head), `orcBerserkerKimi`, `redFox`, `secretaryBirdGemini`, and `snowLeopard` are not wrong; the bad `axis` matters to axis-based consumers such as `stick` and `cards`.
- Fix: in `Frame.moved()`, pass the original quaternion to `Spot` and use `quat.clone().invert()` only for the local facing conversion. Add a regression for arbitrary diagonal and weighted frames; no sample rewrite is needed because the samples express the documented API.

### SKELETON-1: A second parentless joint is silently parented instead of rejected
- Verdict: confirmed
- Severity: P1 — the API explicitly promises exactly one root, but malformed rigs silently acquire a misleading parent; the repro prints `second.parent === root`.
- Samples hit: none (the shipped samples use one root and explicit/derived parenting thereafter).
- Fix: in `createJoint()`, branch before `boneFor()`: if `options.parent === undefined` and `ctx.rootJoint` already exists, throw the documented second-root error. Keep nearest-joint fallback only for the documented derived-parent cases.

### FRAMEMATH-2: `line()` crashes for coincident endpoints
- Verdict: confirmed
- Severity: P1 — `line(a, b)` is documented for two Points without excluding equality, and it leaks `aim(): zero-length direction` instead of handling or explicitly diagnosing the line case.
- Samples hit: none (all shipped SDK `line()` calls use visibly distinct endpoints; unrelated SVG/string `line()` calls were excluded).
- Fix: add a coincident-endpoint branch in `Segment`/`line()` with a documented stable fallback orientation, or throw a line-specific validation error if zero-length lines are intentionally unsupported; update `docs/api.md` either way.

### IK-1: Reachable targets at or below the 1e-9 distance threshold are mirrored away from the target
- Verdict: confirmed
- Severity: P1 — a reachable positive-distance target crosses a hard threshold and the solver returns the opposite direction; the rerun reproduces a 2e-9 target error of ~2.9e-16 and a 1e-9 target error of ~2.0e-9.
- Samples hit: none (no sample intentionally targets a limb within 1e-9 m of its root).
- Fix: in `limb()`, use the normalized target direction whenever `d > 0`; reserve the fallback direction for `d === 0`. Keep the existing deterministic coincident-target plane fallback.

### IK-2: Empty, negative, and non-finite segment lengths silently produce invalid limbs
- Verdict: confirmed
- Severity: P1 — invalid inputs return NaN vectors or silently reinterpret negative lengths, violating the “exactly supplied lengths” contract and making downstream rig construction unsafe.
- Samples hit: none (all sample `limb()` calls provide finite positive lengths).
- Fix: validate `lengths` at the start of `limb()` for non-empty, finite, strictly positive entries and throw a named `limb()` error. This should be documented; no sample changes are required.

### SKELETON-3: `Chain.tip` remains nullable when a tip name guarantees a runtime tip
- Verdict: docs gap
- Severity: P1 — runtime behavior is correct, but TypeScript users must defeat a guaranteed-nullability warning in a common named-chain pattern; this was reported as repeated authoring friction.
- Samples hit: `hunt-skeleton-roots` repro only; shipped sample chains commonly use a final tip name but do not depend on the nullable type in a way found by the static search.
- Fix: add a type-level overload/generic for `chain()`/`Chain` that narrows `tip` when `names` is statically `spans + 1`, while retaining the nullable type for dynamic/unknown name arrays. Clarify the static/runtime distinction in the API docs.

### IK-3: Finite very-large lengths overflow the solver and collapse to zero-length geometry
- Verdict: confirmed
- Severity: P2 — finite inputs produce silently collapsed geometry, but the trigger is an extreme magnitude (around `1e308`) and no shipped sample approaches it.
- Samples hit: none.
- Fix: solve in a scaled coordinate range and rescale the resulting points, or reject magnitudes that cannot be solved safely with a clear `limb()` error. Document the chosen numeric boundary; no samples need changing.

### IK-4: `sole` accepts one extra bend hint and silently discards it
- Verdict: confirmed
- Severity: P2 — the documented count is exact enough that silently dropping an author-supplied hint can hide a rigging mistake; the only current occurrence is the API example, not a sample slug.
- Samples hit: none (the extra-hint case is present in `docs/api.md:543-552`, not `samples/*.ts`).
- Fix: make the `sole` check require `hints.length === n - 2` and update the API example to the documented count, or explicitly document surplus-hint dropping if that is intentional. Prefer rejection because it catches authoring errors.

### FRAMEMATH-3: `offset()` silently treats a zero direction as no movement
- Verdict: confirmed
- Severity: P2 — zero has no direction, and silently returning the original point is ambiguous; it also differs from `aim()`'s explicit zero-direction validation, but no shipped sample passes this input.
- Samples hit: none.
- Fix: validate the converted direction before normalization in `offset()` and throw a clear `offset(): zero-length direction` error; add the zero-vector rule to the math docs.

### SKELETON-2: `Role` has no `pelvis` or `foot` values
- Verdict: intended (`docs/api.md:163-165` explicitly says pelvis is encoded as the root/first `spine` and a foot/hoof is the tip of a `leg`/`arm` chain)
- Severity: P2 — this is authoring friction, not a runtime correctness bug; the guide documents the supported taxonomy and workaround.
- Samples hit: none as a failure; samples use the documented `spine`/chain-tip encoding.
- Fix: no code change. Optionally add a short rationale to the role-type comment or guide so authors do not mistake the omission for an unsupported skeleton feature.
