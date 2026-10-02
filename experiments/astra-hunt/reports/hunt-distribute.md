# Distribution bug hunt

### DISTRIBUTE-1: `ring` angle direction is described inconsistently
- Severity: P1 (docs/code mismatch that can mislead model authors)
- Repro: `scratch/hunt-distribute/hunt-distribute-basics.ts` — run `npx tsx scratch/hunt-distribute/hunt-distribute-basics.ts`; inspect the `horizontal` and `vertical` lines.
- Expected: `docs/conventions.md:23-27` defines right-handed angles (on a +Z line, 0 is +Y and +90 is −X; on a vertical line, 0 is +Z), while `docs/api.md:569` says angles run “counter-clockwise about the line's axis.” Those descriptions need to communicate the same viewing convention.
- Actual: The implementation follows the conventions cardinal vectors: for a horizontal +Z line, the four radius-1 items are `[0,1,0]`, `[-1,0,0]`, `[0,-1,0]`, `[1,0,0]`; for a vertical +Y line they are `[0,0,1]`, `[1,0,0]`, `[0,0,-1]`, `[-1,0,0]`. The API's unqualified “counter-clockwise” conflicts with this and leaves fan authors to guess the sign.
- Cause: `docs/api.md:567-570` uses the ambiguous/opposite “counter-clockwise” wording; `src/distribute.ts:81-92` computes the right-handed basis (`v = axis × u`) and `src/distribute.ts:85` advances positive angles accordingly.
- Fix: Replace the API sentence with the conventions' explicit right-hand/viewing rule and include the horizontal +Z and vertical +Y four-item examples above.

### DISTRIBUTE-2: Non-integer distribution counts silently truncate and skew spacing
- Severity: P2 (edge-input validation/incorrect spacing)
- Repro: `scratch/hunt-distribute/hunt-distribute-basics.ts` — run `npx tsx scratch/hunt-distribute/hunt-distribute-basics.ts`; inspect `count-1.5`, `count-2.5`, `along path 1.5`, `along path 2.5`, and the `joints: 1.5` group.
- Expected: `count` and `joints` describe numbers of discrete items/joints, so non-negative integers should be required (or rejected with a clear error). A fractional count must not be silently converted to a different item count or used as the spacing denominator.
- Actual: `ring(...,{ count: 1.5 })` returns one item; `{ count: 2.5 }` returns two items at `t = 0` and `0.4` (not the centres of two equal parts). `along(path, 1.5, ...)` returns one item at `t = 1/3`, and `along(path, 2.5, ...)` returns two at `t = 0.2, 0.6`. `ring(...,{count:4,joints:1.5,name:"h"})` creates two joints, with `h1` owning three items and `h2` one. Negative counts silently return zero items.
- Cause: `src/distribute.ts:75-85,94-105,132-138,178-187` passes raw values to `Array.from({ length: count })`/loop bounds; JavaScript truncates fractional lengths while the angle/along formulas still divide by the original fractional value.
- Fix: Validate `count` and `joints` as finite non-negative integers (and retain `joints <= count`), before constructing items or group joints; reject invalid values rather than truncating.

### DISTRIBUTE-3: `SproutResult.chain` remains nullable when a positive count guarantees a chain
- Severity: P1 (type-level trap on documented usage)
- Repro: `scratch/hunt-distribute/hunt-distribute-nullability.ts` — run `npm run typecheck -- scratch/hunt-distribute/hunt-distribute-nullability.ts`; it reports `TS18047: 'result.chain' is possibly 'null'` on `result.chain.at(0)` even though the call passes `{ count: 2 }`.
- Expected: `docs/api.md:282-284` says the sprout has joints by default/for positive counts and that `count: 0` is the no-joint case. A caller passing a positive literal count should be able to use `result.chain` without an unnecessary null assertion (or the API should expose an explicit narrowing helper/type).
- Actual: Runtime `scratch/hunt-distribute/hunt-distribute-sprout.ts` confirms `{ count: 2 }` returns a non-null chain with joints `tail1`, `tail2`; only `{ count: 0 }` returned `chain: null`. Nevertheless TypeScript rejects direct use for the positive-count call.
- Cause: `src/sugar.ts:118-138` infers one return shape from `count === 0 ? null : createChain(...)`, so `chain` is always exposed as `Chain | null`, with no overload/conditional return type for positive count.
- Fix: Add overloads/conditional result types distinguishing `count: 0` from positive/omitted counts, while keeping `chain: null` for the zero-joint case.

## Covered
- Ring callback omission works and returns frames directly; count 0 returns no items, and count 1 correctly uses angle 0 for a full turn or the range midpoint for a partial turn.
- Ring group joints with ordinary integer options (`count: 4, joints: 2`) own contiguous item runs (`g1,g1,g2,g2`) and move their items after `pose()`.
- Horizontal and vertical ring start angles and positive-angle cardinal positions match `docs/conventions.md`; the issue is the conflicting API wording, not these computed vectors.
- `along` over a plain Path excludes endpoints and uses equal-part centres (`count: 4` on a 2 m path gives `t=.125,.375,.625,.875`); Chain and Sweep inputs preserve their `.t`, tangent/normal orientation, and explicit ranges. Sweep defaults to its own `from`/`to`.
- `along` Chain/Sweep frames and sprout Chain/Sweep frames update after `pose()`, including surface orientation.
- `sprout` default naming, explicit count naming, `count: 0` null chain, root burial setup, and paths whose first point is not `on` were exercised. A non-starting path was prepended at the `on` point and produced the expected extra span/joints.
