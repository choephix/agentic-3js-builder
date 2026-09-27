# agentic-3js-builder: SDK spec

A TypeScript helper SDK for LLMs writing primitive-built, skeleton-rigged three.js creatures in code. Its output must satisfy the Nilo Creature Lab contract (`~/tmp/public/nilo/creature-lab/GUIDE.md`, "Tagging and skeleton"): the SDK returns a plain `THREE.Object3D` tree using the same `userData` tags as `~/workspace/nilo-creature-lab/harness/kit.ts` (`joint`, `bone`, `group`), exactly one root joint, no scale on joints or anything above a joint, every mesh resolving to a bone, one flat colour per mesh.

## Why it exists (evidence from 100 Claude Opus builds + 304 iteration diffs)

1. ~88/100 builds re-invented world-space joint/part placement (6 incompatible flavours); ~60% keep all joints unrotated so `local = world − parentWorld` works, which exports bones with world-aligned axes. 70 iteration steps (~405 lines) were "parent moved → retype every dependent literal"; 27 steps bolted on subtree-rescale workarounds.
2. ~64 builds wrote their own surface point+normal math (ellipsoid gradient, lathe finite differences, SDFs, raycasts); 110 steps (36%) were epsilon tuning of lift/inset against analytic stand-ins.
3. 79 jointed chains + 32 tapered curves built as stacked cylinders with hand-sized filler balls; 48 steps fixing seams/gaps/ridges at bends, 29 steps hand-tuning Euler bend angles.
4. 71 builds wrote a two-point tapered cylinder, 59 a `basis(dir, hint)`; the only defect-driven geometry fixes were roll bugs from `setFromUnitVectors`.
5. 33 builds hand-rolled membranes (Newell normal → 2D → triangulate → walls), almost all rigid on one bone.
6. ~30 `boneAt(t)` threshold ladders repeating joint positions; ~33 vertex-deformed box frustums; ~17 rings around tilted axes.

Not worth helpers (evidence: correct everywhere): L/R mirroring via `for (const s of [1,-1])`, radial arrays around Y, rows/grids, global floor shift, eye stacks, geometry shorthands, rng/vector utils, caches.

## Principles

- **Author in model space.** Every position/direction argument is a model-space point (`[x,y,z]` tuple or `THREE.Vector3`). The SDK converts to parent-local and keeps world matrices consistent itself; the user never calls `updateMatrixWorld`, `attach` or `worldToLocal`.
- **Handles, not literals.** Joints, chains, sweeps and surfaces return objects you can query (`.at`, `.local(...)`, `.at(t)`), so dependents reference them and follow when the source line changes.
- **One code path per concern.** Orientation = `aim()`. Tubes of any kind = `sweep()`. `rod`, `capsule`, `spike`, `frustumBox`, `loft` are one-line sugar over `sweep`, never separate implementations.
- **Skeleton first.** Only `joint()` and `chain()` create joints. Geometry helpers consume joints/chains; they never create them.
- **Rigid skinning.** The harness skins per mesh (one bone per mesh). "Geometry following several bones" means splitting into one mesh per bone span.

## API

Entry: `createBuilder(options?)` → builder `b`. `b.root` is the returned root `Group`. Material cache: one shared `MeshStandardMaterial` per colour (roughness 0.72, metalness 0.04), like kit.

### Transform basics

- `aim(dir, up = +Y-ish default, axis = "y")` → `Quaternion` whose local `axis` points along `dir`, roll chosen so the local "up" leans toward `up`. One pinned convention (document it). Deterministic fallback when `dir ∥ up`. This replaces every `basis()`/`lookAt`/`setFromUnitVectors`.
- `lerp(a, b, t)`, `offset(p, dir, dist)`, `mid(a, b)` → `Vector3`. Small, but they make declarative expressions read well.

### Joints

- `b.joint(name, { parent?, at, aim?, dir?, up?, group? })` → `Joint`. `parent` omitted = root joint (error if a root already exists). `aim` is a target point, `dir` a direction; bone +Y points along it with roll from `up`. Neither → keep parent orientation. `Joint` exposes: `name`, `object`, `at` (world position), `quat` (world), `local(p)` (point in this joint's frame → world), `dir(v)` (direction in joint frame → world).
- `b.chain(name, path, { parent, up?, group?, count? })` → `Chain`. Joints `${name}1..N` along the path; joint i sits at its span start, aimed at the next; the tip is the path end. Roll by parallel transport from `up` (no twist flips). `path` is a `Path` or point array; `count` resamples by arc length. Chain exposes `joints`, `length`, `at(t)` → `{ p, tangent, normal, binormal, joint }` by arc length (normal = transported up), `jointAt(t)`, `span(i)` → `[t0, t1]`. Must support chains rooted mid-body growing both ways (serpents, centipedes): e.g. `chain(name, path, { parent, rootAt: t })` or two chains from the same parent. Pick the cleaner design.

### Paths

`Path` = arc-length parametrised curve with `at(t)`, `tangentAt(t)`, `length`. Constructors: `polyline(points)`, `bezier(p0, p1, p2[, p3])`, `catmull(points, tension?)`, `arc(center, from, axis, angleDeg)`, plus `path.concat(other)`. A point array anywhere a path is accepted = polyline.

### Parts

- `b.part(geometry, color, { bone, at?, aim?, dir?, up?, quat?, rotation? (deg), scale?, group?, name? })` → `Mesh`, placed in model space and parented under `bone` (a `Joint` or joint name) keeping its world transform.

### Sweep (the core geometry primitive)

`b.sweep(source, radius, options)` → `Sweep`.

- `source`: a `Path`/point array (one mesh, bone from `options.bone`) or a `Chain` (one mesh per joint span, each tagged to that span's joint; `options.from/to` in t may restrict the range).
- `radius`: `number` | `[r0, r1]` (linear) | `number[]` (evenly keyed, smoothly interpolated) | `(t) => number` | `(t) => [rx, ry]` (elliptical/box half-extents). Continuous along the path: no per-segment radius steps.
- `section`: `"circle"` (default) | `"box"` | `{ ngon: n }`, with `sides` / smoothing options. Roll of the section follows the parallel-transported frame (or the chain's).
- `caps`: `"round"` | `"flat"` | `"point"` | `"none"`, or `{ start, end }`. Round = hemispherical cap of the local radius (elliptical/box sections get the analogous rounded end). With round caps a 2-point sweep is a (tapered) capsule, a curved one a bent capsule.
- Chain splits: at every cut both pieces get round caps of the tube's radius at that point by default, which fills the gap when the joint bends and is invisible when straight. No separate filler spheres. `overlap` option extends pieces past cuts instead.
- `color`: `string` or `(t) => string` (colour changes only at piece/band boundaries; add a `bands: [[tEnd, color], ...]` option if cleaner).
- Segment density adapts to curvature and length with sensible defaults; low-poly by default (these are primitive puppets, 6–10 sides).
- Returns `Sweep` with `meshes`, `at(t, angleDeg?, lift?)` → `{ p, n, tangent, radius, joint }` for putting bands, spikes, plates on the tube surface.

Sugar, each one line over `sweep`: `rod(a, b, r | [r0, r1], opts)` (flat caps), `capsule(a, b, r | [r0, r1], opts)` (round caps), `spike(base, dirOrTip, len, r, opts)` (point end), `frustumBox(a, b, [w0, h0], [w1, h1], opts)` (box section), `loft(stations: { at, w, h }[], opts)` (catmull path through station centres, radius interpolated from stations; accepts a `Chain` to split by bone).

### Surface

- `b.surface(targets)` → `Surface`, targets = meshes, a `Sweep`, a `Joint` (its meshes), or arrays of these. Queries the REAL built geometry (raycast / closest point), not an analytic stand-in.
- `.nearest(p)` → `{ p, n, mesh, joint }`; `.ray(origin, dir)` → hit or null; `.around(center?)` giving `.at(azimuthDeg, elevationDeg)` (ray from centre outward; default centre = bbox centre); `.scatter(count, { rng, minDist, keepOut?: (p) => boolean, filter? })` area-weighted with rejection, deterministic given `rng`.
- Hits carry the joint that owns the hit mesh.

### Stick

`b.stick(geometry, color, hit, { embed = 0.2, flow?, spin?, bone? })` → `Mesh`. Seats a part on a surface hit: local +Y along the normal, pushed out so it penetrates by `embed × part's own extent along the normal` (so size changes don't need epsilon retuning). `flow` = preferred tangent direction for the part's +Z (scales, fur shingles), `spin` degrees about the normal. Bone defaults to the hit's joint.

### Membranes

- `b.membrane(edgeA, edgeB, { thickness, color, rows?, scallop?, split = "mid" })`: skin between two edges (each a `Chain`, `Path` or points), resampled by arc length. With chains, cells are split per bone: each half (nearest A / nearest B) goes to that edge's joint at that t, one mesh per bone. Double-sided with side walls (thickness > 0), correct winding without user effort. `scallop` insets the trailing edge between ribs.
- `b.slab(points, { thickness, color, bone })`: planar (roughly planar) polygon → thin prism (fins, leaves, plates).

### Distribution helpers

- `ring(center, axis, radius, count, (p, outward, i) => void, { startDeg? })` around any axis.
- `along(source: Chain | Sweep | Path, count, (at, i) => void, { from?, to? })`, where `at` includes the owning joint for chains.

### Solvers

- `twoBoneIK(root, target, [l1, l2], bendHint)` → middle point (knee/elbow); used to plant feet at exact floor contacts without hand-tuned heights.

### Region

- `b.region({ at, scale = 1, quat? })` → a coordinate frame (not a scene node): `.p(localPoint)` → world, `.d(dir)`, `.s(length)`. Author a head or prop in local units and resize/move it by editing one line. Parts created through it bake scale into mesh scale/geometry; joint positions are transformed, never scaled.

## Non-goals

No per-vertex skin weights, no textures, no mirroring helper, no grids/rows helpers, no ground-shift helper, no auto-merge batching (harness concern).

## Implementation decisions

Where the spec left a choice open, or where the first smoke renders changed the plan:

- **Default roll.** `aim(dir)` with axis "y" and no `up` keeps local +X as close to world −X (the creature's right) as possible, so every bone in the mid-plane is a pure pitch: forward-pointing bones have +Z up, down-pointing +Z forward, up-pointing +Z back, backward-pointing +Z down, and section widths always run along world X. The singular direction is straight sideways (±X), where +Z falls back to world up. The first version kept +X = world +X, which put +Z _down_ on forward bones (heads, snouts), so `head.local([0, 0, 0.3])` pointed at the chin. The alternative, "+Z leans to world up" (Blender's roll 0), is singular for vertical bones and swaps ellipse width/height on legs that lean sideways instead of forward, and legs are far more common than straight-sideways bones. Chains and path sweeps take their start frame from the same `aim()` and then parallel-transport it.
- **Mid-body roots.** Two chains from the same parent, cut from one curve with `path.slice(rootT, 1)` and `path.slice(rootT, 0)` (reversed). `path.closestT(p)` finds `rootT`. No `rootAt` option.
- **Circle sections are circumscribed.** Flat faces sit exactly at the radius (vertices at r / cos(π/n)), with flat top and bottom faces. A tube of radius r whose axis is at height r touches y = 0 exactly; the first renders left 5 mm gaps under feet with inscribed polygons.
- **`Sweep.at` angle reference** is world up projected into the section (the tube's normal where the tube is vertical), not the frame normal, so `at(t)` / `along(sweep)` land on the visual top (dorsal) side regardless of tube direction.
- **Round caps on elliptical/box sections** are the section shrunk on a quarter circle with depth max(rx, ry), which contains the gap of any bend for ellipses. Box sections can leave small wedges at the corners of sharp bends (rare; `frustumBox` is usually single-bone).
- **Path corners.** A point-array sweep is split into round-capped segments inside one mesh at corners sharper than 20°; gentler corners get one ring on the averaged tangent.
- **`sweep({ split: chain })`** cuts a Path sweep where the path passes each joint of a chain, one mesh per joint. `loft({ chain })` uses it.
- **`spike(base, dirOrTip, len, r)`**: `len` number means `dirOrTip` is a direction; `len` null means it is the tip point.
- **Sweep t.** Radius, colour, bands and `Sweep.at` all use t ∈ [0, 1] over the swept range (`from`..`to` of the source).
- **`along`** places stations at the centres of `count` equal parts of [from, to], not at the ends.
- **Region** has `part()` and `joint()` in addition to `p/d/s/q`: parts get the region scale baked into mesh scale; joints are moved and rotated, never scaled.
- **Surface scatter** rejects points buried inside other target meshes (odd ray-crossing parity), so scattering over a chain-split sweep never lands on caps hidden inside a neighbour.
- **`membrane`** gains `bone` (owner for Path/point edges) and `cols`; each bone's cells form one closed, flat-shaded prism.
