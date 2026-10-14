# Triage: loftdistexp

### EXPERIMENTAL-1: Zero contour reach emits degenerate faces with zero normals
- Verdict: confirmed
- Severity: P1 — the exact zero-normal vertices are present in shipped `lifeguardContour` and `sprinterContour` hair meshes (six per hair mesh in the audit), so this is invalid geometry in supported sample output even though the affected cap strip is small. The standard 900px three-quarter/front previews render both samples successfully and the hair is visible, but I could not see a distinct shading artifact at that scale; the zero normals are not visibly apparent in those renders.
- Samples hit: `lifeguardContour`, `sprinterContour` (their `hair` contour starts with `front: 0`, and uses flat start/end caps)
- Fix: In `contour()`/the sweep contour path, either reject zero reaches with a named error (and update the two sample hair profiles/docs) or collapse duplicate section vertices, omit zero-area cap faces, and assign the intended endpoint normal when zero is an intentional flattened section. The existing contour documentation at `src/experimental/contour.ts:42-44` warns to keep reaches above zero except a point cap, but shipped samples currently exercise the unvalidated case.

### LOFTSUGAR-3: A loft that doubles back produces an inside-out ring at the U-turn
- Verdict: confirmed
- Severity: P1 — this is silent, non-finite-free wrong geometry: the rerun measured `wrong: 8/96` triangles for the doubleback versus `0/64` for the straight control. It is not present in the shipped sample lofts I searched, so I rank it below shipped contour corruption rather than P0. A dedicated `preview --shot` of the repro did show a localized dark/inverted patch at the turn in both the three-quarter and front shots, so the defect is render-visible for this input.
- Samples hit: none
- Fix: In `Frames`/path frame transport, handle 180-degree or near-180-degree tangent reversals with a deterministic fallback frame, or split/fillet the U-turn before `sweep` connects rings; add a loft/path regression case for consistent outward winding. No sample change is needed unless a real doubleback path is intentionally added.

### DISTRIBUTE-3: `SproutResult.chain` remains nullable when a positive count guarantees a chain
- Verdict: confirmed
- Severity: P1 — positive-count/default sprout callers receive a non-null chain at runtime but cannot use it without a null check in TypeScript; this is a documented API/type contract trap and affects many shipped sprout callers.
- Samples hit: `amigurumiNarwhal`, `axolotl`, `bobaSlime`, `chibiMechPilot`, `juniperBonsai`, `koiPondIsland`, `marginaliaSnailKnight`, `redLionfishAstra`, `redLionfishKimi`, `redLionfishSonnet`, `tentacleSerpent`, `treehouseDiorama`
- Fix: Add `sprout()` overloads or a conditional result type keyed on `count`, with `chain: null` for literal `count: 0` and `chain: Chain` for positive/omitted counts. Update any sample code that only null-checks a provably positive result if the stronger type makes that check unnecessary; no runtime helper change is required.

### LOFTSUGAR-1: `loft` crashes on a one-station body
- Verdict: confirmed
- Severity: P2 — the public helper leaks a Three.js `TypeError` for an undocumented edge input, but no shipped sample passes a one-station loft and normal loft use is unaffected.
- Samples hit: none
- Fix: Validate `stations.length` in `loft()` and throw a named `loft(): needs at least 2 stations` error, then document the minimum; alternatively define and implement a one-station degenerate contract. Do not leave the error to `CatmullRomCurve3`.

### LOFTSUGAR-2: Coincident loft stations fail instead of handling a repeated station
- Verdict: confirmed
- Severity: P2 — repeated centres are a plausible generated-input edge, but no shipped sample uses them and the current failure is an unrelated `polyline()` error rather than corrupted ordinary output.
- Samples hit: none
- Fix: In `loft()`, detect consecutive duplicate station centres and reject with a named error including the station index (or document and implement an explicit merge rule); update the loft docs to state the repeated-centre policy.

### DISTRIBUTE-2: Non-integer distribution counts silently truncate and skew spacing
- Verdict: confirmed
- Severity: P2 — fractional/negative counts are invalid discrete-item inputs and no shipped sample uses them, but truncation combined with division by the original fraction can silently place items at incorrect parameters.
- Samples hit: none
- Fix: Validate `count` and `joints` in `ring()` and `along()` as finite non-negative integers before array construction, retaining `joints <= count`; throw a named validation error. Document the integer requirement in the distribution API.

### DISTRIBUTE-1: `ring` angle direction is described inconsistently
- Verdict: docs gap
- Severity: P2 — runtime cardinal vectors match `docs/conventions.md` and the repro, so this does not deform shipped renders; the unqualified API wording can nevertheless make authors choose the wrong sign.
- Samples hit: none (all searched ring callers use the working implementation; the issue is the direction description, not their generated geometry)
- Fix: Replace `docs/api.md:567-570`'s unqualified “counter-clockwise” sentence with the conventions' right-hand/viewing rule, including the +Z horizontal and +Y vertical examples. No source or sample change is needed.
