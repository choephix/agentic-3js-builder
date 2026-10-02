# Paint bug hunt

### PAINT-1: `spots()` misreads a documented RGB tuple as a colour list and bakes spots black
- Severity: P0 (silent wrong output on documented use)
- Repro: `scratch/hunt-paint/hunt-paint-spots-rgb-bake.ts` — `npx tsx scratch/hunt-paint/hunt-paint-spots-rgb-bake.ts`
- Expected: `docs/api.md:439` says every colour argument accepts an RGB `[r,g,b]`, while `spots`'s `spot` argument is a colour/list (`docs/api.md:431`). A red tuple `[1, 0, 0]` should produce red spots over a white sweep.
- Actual: the script builds a 0.25 m radius sweep with `spots("#ffffff", [1,0,0], { size: 0.1, amount: 1 })`; its 512×476 paint sheet has 176,638 pure-black texels, 64,808 white, and **0 red** (of 243,712 texels). Direct samples also return a scalar instead of an RGB tuple for 956/10,000 points and non-finite tuples for another 1,438.
- Cause: `src/paint.ts:246-249` uses `Array.isArray(colors)` to detect a list. `Rgb` is itself a 3-number array, so `pick()` returns a number; `resolve()` passes that number through `rgb()`, and `bakeSheet` then reads `color[0..2]` as undefined, which writes zero bytes.
- Fix: distinguish a numeric 3-tuple from a list (e.g. test `typeof colors[0] === "number"` first), or use a non-ambiguous tagged colour representation before `pick()`.
  - The same `pick()` path also breaks the documented RGB form for `scales`'s `base`: `scratch/hunt-paint/hunt-paint-scales-rgb.ts` sampled 10,000 points and got non-finite output at all 10,000.

## Known confirmations (existing status items)

- Round-cap coordinates collapse along the cap: `scratch/hunt-paint/hunt-paint-coords.ts` saw 26,080 cap texel samples, all with `s[0]` exactly 0 or 1 (body ranged between the ends); this is the documented/STATUS limitation that cap and body cannot be distinguished from `s`.
- Extrude side walls intentionally reuse the outline `[x,y]`: the same repro saw 135,957 wall samples with `s[1]` spanning 0..1, while face samples also use outline coordinates; no wall/face discriminator exists except normal `n` as documented.
- `mix()` still returns `Rgb`, while `Fill` is only `string | Paint`: `scratch/hunt-paint/hunt-paint-mix-type.ts` with `npm run typecheck -- ...` fails at the documented-looking `color: mix(...)` call (`Rgb` not assignable to `Fill`).
- `npm run snap` double-baking remains a known STATUS item; no source fix attempted.

## Covered

- `stripes(..., { axis: "z" })` and `{ axis: [0,0,1] }` agree exactly (same seed/size/point); ordinary vector-axis and mirrored-coordinate handling was smoke-tested.
- Nested `Paint.at` preserves surface coordinates, both when an outer paint returns a child paint and when it explicitly calls `child.at(p,n,s)`; both returned the expected red/blue split at `s[0]=0.25/0.75`.
- `countershade`, `mottle`, `spots` with string/list colours, `grain`, `mix` clamping, and deterministic nested reads returned finite values in ordinary metre-scale cases.
- A curved/vertical sweep's dorsal clock coordinates showed no wrap seam: straight-tube bake samples had max 0.46° disagreement against geometric clock angle and zero samples over 20° error, including the 0°/360° seam (`scratch/hunt-paint/hunt-paint-clock.ts`).
- Building the same deterministic painted model twice produced identical paint-sheet bytes (991,232 bytes, 0 differences) (`scratch/hunt-paint/hunt-paint-determinism.ts`).
