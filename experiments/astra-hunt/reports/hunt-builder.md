# Builder bug hunt

### BUILDER-1: `detail: Infinity` is accepted and fails later as an invalid array length
- Severity: P2 (non-finite edge input; not a normal model-author value)
- Repro: `scratch/hunt-builder/hunt-builder-detail.ts` — `npx tsx scratch/hunt-builder/hunt-builder-detail.ts`
- Expected: `createBuilder({ detail })` scales tessellation (docs/api.md:95, 610-618); non-finite values should be rejected at builder construction with a named `detail` error rather than accepted as a usable setting.
- Actual: `createBuilder({ detail: Infinity })` succeeds and reports `b.detail === Infinity`; `b.segments(12)` returns `Infinity`. Building a minimal two-point sweep then throws `RangeError: Invalid array length`. `Number.MAX_VALUE` and `1e300` behave the same. Finite tiny details (`1e-9`) clamp custom segments to 3; `0`, `-1`, and `NaN` are rejected.
- Cause: `src/context.ts:159-166` checks only `detail > 0`, so `Infinity` passes; `src/sweep.ts:598-603` feeds the resulting infinite segment count into geometry arrays.
- Fix: require `Number.isFinite(detail) && detail > 0` in `Ctx` and `detailOf` (and reject non-finite per-shape details), before any tessellation arithmetic.

### BUILDER-2: Public builder types/classes are not re-exported from `src/builder`
- Severity: P1 (type-level trap for documented builder consumers)
- Repro: `scratch/hunt-builder/hunt-builder-exports.ts` — `npx tsc --ignoreConfig --noEmit --target es2022 --module esnext --moduleResolution bundler --strict --skipLibCheck scratch/hunt-builder/hunt-builder-exports.ts`
- Expected: the builder module surface should make `Joint`, `Chain`, `Sweep`, `PartOptions`, `Fill`, and `OutlinePoint` reachable as requested by the SDK docs/brief and the public helper signatures.
- Actual: TypeScript reports no exported member for `Joint` and `Sweep`; `Chain`, `PartOptions`, and `Fill` are declared locally but not exported. Only `OutlinePoint` imports successfully. `src/builder.ts` imports these names with `import type`, but exports only `OutlinePoint`.
- Cause: `src/builder.ts:8,17-18,25,33` imports these names without a corresponding `export type`/`export` declaration; the sole explicit re-export is `export type { OutlinePoint }`.
- Fix: explicitly re-export the public classes/types from their owning modules (`skeleton`, `sweep`, `parts`, `context`, and `outline`) without introducing duplicate definitions.

### BUILDER-3: Malformed literals through builder wrappers lose the called helper/argument in errors
- Severity: P2 (diagnostic mismatch on malformed input; not a normal model-author value)
- Repro: `scratch/hunt-builder/hunt-builder-errors.ts` — `npx tsx scratch/hunt-builder/hunt-builder-errors.ts`
- Expected: a malformed literal passed through a builder helper should throw a stable, named error identifying that helper and the offending argument/value (docs/api.md:104; docs/STATUS.md:63 records this named-error contract).
- Actual: the same malformed `[1, 2]` produces inconsistent lower-level errors: `b.part(..., { at: [1,2] })` says `toPoint(): ... got [1,2]` rather than `part()`/`at`; `b.rod`, `b.capsule`, `b.frustumBox`, `b.sweep`, and `b.chain` report `polyline() point N: ...`; `b.loft` reports `catmull() point 0: ...`; malformed `b.sprout` inputs fail with `p.clone is not a function`; malformed `b.ring` input fails with `Cannot read properties of undefined (reading 'x')`; malformed `b.stick` input fails with `Cannot use 'in' operator to search for 'isVector3' in undefined`. Direct `joint`, `spike`, `slab`, `extrude`, `frame`, `line`, and `polyline` calls do include their helper names.
- Cause: wrappers delegate to generic converters without call labels (`src/parts.ts:61,64`; `src/distribute.ts:72`; `src/sugar.ts:52,108-116`; `src/path.ts:277` and generic `polyline`/`catmull` conversion), while `toFrame` has no validating/call-labelled path (`src/math.ts:40-49`).
- Fix: validate each Builder entry-point argument before delegation (or thread a call/argument label through `toPoint`/`toFrame`/`toPath`) so all malformed literals fail with the public helper and argument name, never a generic TypeError.

## Covered

- `createBuilder({ detail: 0 })`, negative detail, and `NaN` reject immediately with `detail must be positive`; tiny positive detail remains usable and `b.segments` clamps to 3. The uncovered edge is non-finite positive detail (BUILDER-1).
- `b.root` is stable and idempotent: reading it twice returns the same `Group` (`true`), keeps one child root-joint group, and does not duplicate rig records. Building a rod after the first root read succeeds; a later root read returns the same group.
- Paint lifecycle is stable across root reads: a painted part has no map before the first root read, gets the shared `paint` material/map on the next read, and keeps the same map on subsequent reads.
- Two builders in one process are isolated: roots named `one` and `two` retain separate children/joints, and same-colour materials are not shared across builders. Within one builder, `material("#FF0000") === material("#ff0000")` and roughness/metalness are `0.72`/`0.04`.
- Textured material cache also behaves correctly: same texture/tint reuses one `MeshStandardMaterial`, while changing the geometry's vertex-colour presence creates a distinct cached material; `alphaTest` is `0.5`, roughness `0.72`, and metalness `0.04` (`scratch/hunt-builder/hunt-builder-materials.ts`).
- The limit boundary probe built 1001 meshes/parts, registered 161 joints, and requested 65 flat-colour materials without an SDK throw or warning (`scratch/hunt-builder/hunt-builder-limits.ts`). This is consistent with docs/api.md:80 / GUIDE.md:21 saying the author owns lab limits; the SDK does not enforce/report these limits itself.
- The normal forwarding paths exercised by `b.joint`, `b.chain`, `b.rod`, `b.capsule`, `b.spike`, `b.frustumBox`, `b.loft`, `b.sprout`, `b.part`, `b.stick`, `b.slab`, `b.extrude`, `b.lathe`, `b.along`, `b.ring`, `b.pose`, `b.cards`, `b.membrane`, `b.region`, and `b.decal` with ordinary millimetre-to-metre dimensions all succeeded (`scratch/hunt-builder/hunt-builder-forward.ts`). No silent option mismatch was reproduced.
- Known STATUS.md:238 issue confirmed in one line: after a smooth chain sweep, `b.surface(rootJoint)` throws `surface(): no meshes in targets`, while `b.surface(chain.joints[0])` sees the mesh; the mesh is owned by its heaviest span joint.
