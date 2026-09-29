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
- **`Sweep.at` angle reference** is world up projected into the section (the tube's normal where the tube is vertical), not the frame normal, so `at(t)` / `along(sweep)` land on the visual top (dorsal) side regardless of tube direction. That projection flips to the opposite side wherever the tube passes vertical, which put a chameleon's coiled belly stripe on alternate sides every half turn. The reference is now sampled along the whole source path and kept continuous across those flips, with the overall side chosen to agree with world up where the path lies most level; sampling the whole path keeps range splits of one path on the same side.
- **Round caps on elliptical/box sections** are the section shrunk on a quarter circle with depth max(rx, ry), which contains the gap of any bend for ellipses. Caps at cuts are also clamped to the continuing tube's radius and centre at each depth (batch 2), because on a fast taper a hemisphere is wider than the next piece just past the cut and showed as a collar once sectors put colour boundaries across it. Box sections can leave small wedges at the corners of sharp bends (rare; `frustumBox` is usually single-bone).
- **Path corners.** A point-array sweep is split into round-capped segments inside one mesh at corners sharper than 20°; gentler corners get one ring on the averaged tangent.
- **`sweep({ bone: chain })`** cuts a Path sweep where the path passes each joint of a chain, one mesh per joint; `loft` passes it through. (Batch 1 called this `split: chain` and `loft({ chain })`; batch 2 folded it into `bone`, which `membrane` shares.)
- **`spike(base, dirOrTip, len, r)`**: `len` number means `dirOrTip` is a direction; `len` null means it is the tip point.
- **Sweep t.** Radius, colour, bands and `Sweep.at` all use t ∈ [0, 1] over the swept range (`from`..`to` of the source).
- **`along`** places stations at the centres of `count` equal parts of [from, to], not at the ends.
- **Region** has `part()` and `joint()` in addition to `p/d/s/q`: parts get the region scale baked into mesh scale; joints are moved and rotated, never scaled.
- **Surface scatter** rejects points buried inside other target meshes (odd ray-crossing parity), so scattering over a chain-split sweep never lands on caps hidden inside a neighbour.
- **`membrane`** gains `bone` (owner for Path/point edges) and `cols`; each bone's cells form one closed, flat-shaded prism.

## Batch 2: limbs, names, sectors, skin lines, sprout, spiral, twist, closed, shift

These eight items came from a cross-model brainstorm over the batch 1 SDK: several models wrote creatures against it and listed what they still hand-rolled. Each one is an option on an existing call or a function in an existing module. Only `limb`, `sprout`, `spiral`, `drape` and `line` are new names.

1. **`limb(root, target, lengths, bends, { sole? })` replaces `twoBoneIK`.** Hind legs of dogs, birds, frogs and camels have three or four segments whose joints alternate direction, and `twoBoneIK` forced builders to pick hock heights by hand. The extra freedom needs a rule, so there is one: the last segment runs parallel to root→target when that respects its hint and reach, otherwise every joint turns by the same angle and the chain rotates in its plane to end on the target. One bisection finds that angle, so lengths are exact and the end lands on the target to about 1e-16. For a dog leg the result is a vertical cannon under the hip with the hock behind it. `sole` fixes the last segment's direction (a toe along the floor) and solves the rest to the heel. Two lengths reproduce two-bone IK, so the old function was removed rather than kept as an alias.
2. **`chain({ names })`.** Auto-riggers and animation retargeters key on bone names (hip/knee/hock, shoulder/elbow), and renaming generated `legHL1..3` afterwards was busywork. It takes an array or `(i) => string`, and the default stays `${name}1..N`.
3. **`sweep({ sectors })`.** Countershading (dark back, pale belly) is the most common colour pattern on real animals, and one colour per mesh made it impossible on a single tube. Sectors run on the existing dorsal clock of `Sweep.at` (0 = world up projected into the section), so "back" means back whatever the frame roll. Each sector is its own open strip per piece. Its boundary vertices are computed exactly on the section polygon at the cut angle, so neighbours share edges. Strips with different vertex counts (when the up reference rotates against the frame) are stitched by arc-length fraction.
4. **`surface.drape(path)` and `sweep.line(angleDeg)`.** Straps, collars, mouth lines, gill slits, dorsal ridges and wing-root edges all need a curve that lies on the built skin. Builders were re-deriving it from analytic stand-ins, which is the same epsilon problem `surface` solved for points. `drape` projects samples to the nearest real surface point. `line` samples `Sweep.at` at one clock angle, with knots at bone cuts. Both return ordinary Paths, so they feed `sweep`, `membrane` and `chain` unchanged. `membrane({ bone: chain })` hands each cell on a path edge to the nearest chain joint, so a fin on `line(0)` follows the spine.
5. **`sprout(name, hit, pathOrTip, radius, opts)`.** Rooting a horn, tentacle or limb on a curved body needed three steps that builders got wrong in different ways: a joint at the surface, the tube buried so no gap shows around the rim, and no joint wasted inside the body. It is sugar over `chain` plus `sweep` with the new `extend` option (straight continuation past the ends at the end radius). The burial runs along the start tangent rather than the hit normal, so the root has no kink; for a path leaving the surface outward that direction points into the body anyway.
6. **`spiral(center, from, axis, { turns, r1?, pitch? })`.** Ram horns, snail shells and coiled tails. The signature mirrors `arc(center, from, axis, angle)`, so the start radius comes from `from` instead of a separate `r0`. The radius changes geometrically (a log spiral), which is how horns and shells grow. Parallel transport keeps the roll free of flips under any taper.
7. **`twist` and `closed`.** `twist` is a roll about the tangent after parallel transport, on `chain` (joints and chain sweeps follow) and on path sweeps: twisted horns, narwhal tusks, pronated forearms. A number is the total over the length, because a constant roll is what `up` already does. `closed` on `polyline`/`catmull` makes rims, collars and straps. Transport around a loop comes back rotated (holonomy), so frames spread that correction evenly along the loop. The seam ring reuses the first ring's vertices when the seam is smooth, and a sharp seam is treated like any interior corner. Closedness is a property of the path, so there is no separate sweep option.
8. **`sweep({ shift })`.** A heavy belly hangs below the spine, but a loft centred on the spine line puts equal mass above and below. `shift` moves the section centre in the same (binormal, normal) axes as `[rx, ry]`, so bones stay on the spine. Ring spacing, caps and `Sweep.at` include it (surface normals come from the actual surface derivative).

Smoke renders showed two defects, both fixed. Round caps at bone cuts poked out of fast tapers (see "Round caps" above). Numeric `twist` was first applied as a constant roll, which left the tusk untwisted.

## Batch 3: fans, posing, detail, rig answer key

Stefan approved these after reading the Opus build evidence. Each one reuses an existing mechanism where it can.

1. **`fan()`: a joint budget for repeated appendages.** pufferFishOpus spent 106 of its 132 joints on one joint per quill, close to the 160 limit. crestedPorcupineOpus gave its quills no joints, so they can't be raised. fanPeacockOpus hand-built three joints per bank (fanR/fanRMid/fanRTip ×3), and frilledLizardOpus used one joint per frill rib (14). `fan` spreads items about an axis, like `ring` generalised to a partial arc and a cone, and gives each contiguous run one bank joint. The joint count is then a number you choose (default one per 4 items). Bank joints use the normal `aim()` roll with `up = axis`, so "raise" is always +deg about the bank's local X. The callback builds item geometry with the existing helpers, which keeps `fan` free of any geometry code. Rigid skinning is the limit: when banks open, items on neighbouring banks separate in steps. The README states the tradeoff instead of enforcing a ratio, because a starfish (5 arms, 5 banks) needs ratio 1. Distribution along a chain or sweep line did not fall out naturally, since those items already have `along()` and the chain's own joints, so it was left out.
2. **`pose()` after building.** There were 90 rest-pose iteration steps, and 8 builds wrote poseJoint/rotateWorld workarounds because moving a joint broke every stored position. The scene graph is the one source of truth. Joint handles already read `matrixWorld`. Everything that caches model-space data (chain curves, sweep rings, fan items, region frames) now stores a `Capture`: each owning joint's `matrixWorld` at capture time. On read, it maps through `joint.matrixWorld × captured⁻¹`, which is rigid because joints are unscaled. Nothing is updated on pose, and no registry of handles has to be kept in sync. Surfaces cache world triangles for speed and rebuild them when the builder's pose counter has changed. A sweep or membrane built on a chain after a pose reads the posed chain, because it goes through the same mapping. `pose` changes local transforms in place instead of re-adding the object, so child order, and with it the harness's joint order, stays stable.
3. **`detail`.** There were 22 performance steps, and 9 Opus builds finished over the 60k soft budget (mossPigletOpus at 77k). One multiplier on the defaults the SDK owns covers it: circle sides, ring spacing, radius tolerance and membrane cells. `b.segments(n)` extends the same knob to geometry the builder makes itself, such as spheres. Explicit per-call counts still win.
4. **The rig answer key.** The SDK knows semantics the benchmark wants to score auto-riggers on. `role` on joint, chain, fan and sprout names them. Side is derived from joint positions. Legs record a ground contact, defaulting to the chain tip, which is exactly the `limb` target. Jaws and hinges record their hinge axis, and fans record banks and item counts. Records are closures evaluated when `b.root` is read, so the block always describes the final pose. `limb()` stays a pure solver, so "leg" is one word on the chain rather than inferred. The block lives on `root.userData.rig`. A two-line harness change (`page.ts`) copies it into the report JSON and into the rigged GLB's `creatureLab` extras. Creatures without it are unaffected, because an undefined `rig` drops out of both JSON outputs.

Smoke renders caught three example bugs, none in the SDK: toe spikes offset by 1 m (`offset()` normalises its direction), a nose ray-cast along world −Z after the head had been re-posed (it should use `head.d()`), and a frill spread under the neck instead of over it (the sign of the spread angle).

## Batch 4: points, lines and frames, not just bones

Stefan's feedback on batch 3: the SDK was too bone-centric. A bone is only a point and a line in space. Every helper should work the same way around an eye, a horn, a surface hit, a point on a tube or a made-up point, vector or line, and bones should stay one source among many.

- **Five input kinds with one set of conversions** (`math.ts`: `toPoint`, `toDirection`, `toFrame`; `path.ts`: `toPath`). Point, Direction, Frame and Path each have a type (`PointInput`, `DirectionInput`, `FrameInput`, `PathInput`). A Line is a Frame read as "point + facing axis", so it has no type of its own; `line(a, b)` and `frame(at, dir)` make one from nothing. Every helper now declares its kind instead of taking only tuples, and the conversions are the only place that knows what a Joint, Part, Hit or Sweep is. Joints are Frames. A Sweep converts through its start `frame`, and a Chain or Sweep converts to a Path through `curve()`, so coercion needs no runtime imports of those classes.
- **One Frame class hierarchy.** `Frame` (abstract: `at`, `quat`, `bone`, `axis`, `local`, `dir`, `moved`) has two families. `Joint` reads the scene. `Spot` stores its transform relative to its bone, which is what keeps every handle valid under `pose()`. `Part`, `Hit`, `ChainPoint`, `SweepPoint`, `RingItem`, `PathPoint`, `Segment` and `Region` are Spots. This replaced batch 3's region-specific `Capture` and the plain `{ p, n, joint }` records, and `p`/`joint` became `at`/`bone` everywhere (a clean rename with no aliases, since nothing outside this repo uses it).
- **Bone inheritance** (`boneFor` in `context.ts`) is one rule used by joint, chain, part, sweep and its shorthands, slab, stick, sprout, membrane and ring. An explicit `bone` wins. Otherwise the geometry takes the bone of the first input that came from something built; Paths carry the bone of their first built defining point. Otherwise it goes to the joint whose bone segment passes closest. The nearest-bone fallback beats "root" because an unowned point almost always sits on the body part it decorates. The rule also frees `joint({ parent })` and `chain({ parent })` from being mandatory after the root.
- **`ring` replaces `fan`.** A fan was a ring around a line plus a joint budget. `b.ring(line, { joints })` keeps the joint budget (and the rig record, renamed `rings` with `joints` instead of `banks`) and accepts any Line: an eye's gaze, a hit normal, a bone, a made-up line. The cone option became `tilt` in degrees instead of an axial component hidden in a `from` vector. `along` also moved onto the builder and returns its frames.
- **`pose({ about, deg })`** rotates a joint about any Line through space: the crest in the wyvern sample hinges on the line through both eyes.
- **`moved(p)`** was added because `offset()`/`local()` return plain vectors and therefore lose the bone. Inside ring and along callbacks the natural derived point (a feather's eye spot, a rib tip) needs to keep its item's bone without writing `bone:`.

## Samples and showcase

Stefan wanted "not a library of GLBs, a library of little scripts … the showcase just runs that script, takes the output, puts it in the showcase scene, and that's that". The smoke examples became `samples/`: `wyvern`, `ramFawn` (was `quadruped`), `tentacleSerpent` (was `serpent`) and `peacock`, now with real names in `meta`. Earlier batch notes that say "example" refer to these files. The contract is a module whose default export takes no arguments and returns an Object3D, plus optional `meta`. It doesn't depend on the SDK; `samples/lantern.ts` is plain three.js with no joints, to keep it honest. `tsc` includes `samples/`, so SDK changes that break a sample fail the typecheck.

The showcase is Vite with plain TypeScript and no framework. Nothing needs a server: `import.meta.glob("../samples/*.ts")` finds the samples at dev and build time, and a second glob with `?raw` supplies their source. `showcase/catalog.ts` owns both globs and accepts its own hot updates. Editing a sample or any SDK file propagates to it, the new tables are handed to the page, and the page re-runs the selected sample without a reload.

## Batch 5: smooth skinning

Stefan asked why the samples looked like chained sausages. `sweep` on a chain cut one mesh per bone span with round caps, because the harness skinned rigidly (every vertex of a part fully on that part's bone), and the cuts plus the harness's small per-part growth showed as creases and collars. His one overriding requirement for the fix: "a simple, understandable, and easy-to-use API is key since we're going to give this work to fast and cheap language models." So the best outcome is that a model writes the same code as before and gets bodies that bend like skin.

- **Smooth is the default and needs no new code.** Sweeps, lofts and membranes on a chain are one continuous mesh with per-vertex weights. Around each joint, rings blend the two bones either side with a smoothstep over ±1 local radius (at most 45% of either span); everywhere else a ring is 100% on one bone, so no vertex has more than two influences. Membranes blend across the width between the two edges' bones and along each chain edge (±25% of the shorter span), which can give a corner vertex up to four. Sharp path corners (limb knees from `limb()`, polyline elbows) are rounded with a bezier over the same ±1 radius, so a knee is a bend rather than two tubes meeting.
- **One option to opt out, no knob.** `skin: "rigid"` on `sweep` (and so on its shorthands, `loft`, `sprout`) and `membrane` brings back the hinged puppet pieces exactly as before. A blend-width knob was left out: ±1 radius read well on every sample, and a number a cheap model would have to guess isn't worth the vocabulary. `overlap` and membrane `split` only apply to rigid skin.
- **One rule for attachments.** Bone inheritance became weight inheritance: anything placed on a point takes that point's bones. On a bend that's two, so a dapple stuck on the belly bends with the belly; on a head it's one, so horns stay rigid; an explicit `bone:` is always rigid. A model can predict it without knowing where the blend windows are.
- **Colour boundaries stay closed.** A mesh still has one colour, so bands, sectors and colour functions split meshes, but the pieces share exact vertices and weights at the boundary. A colour function now splits the tube where its value changes (found by bisection) rather than once per piece, since smooth tubes no longer have per-bone pieces to evaluate it on.
- **Plain meshes stay rigid.** Distance-based auto weights for arbitrary `part` meshes were left out. Distance to bone segments leaks across bones that pass close by but aren't related (a thigh near the belly, a jaw near the neck), a cheap model can't predict or fix that, and anything that should bend can be built as a sweep or loft on the chain instead.
- **One source of truth under `pose()`.** Weights live in `skinIndex` / `skinWeight` geometry attributes indexing `userData.skinBones`, so the harness change is to keep them (a few lines in `assemble.ts`; rigid parts export byte-identically, checked on hearthHoundOpus). Frames became a bind transform plus weights: `Spot` maps through `Capture.blend`, which is exact for one bone and linear-blend skinning for several. Blend-skinned meshes register a re-deform step that every `pose()` runs, sweep rings are built in bind pose and posed by their weights, and surface hits interpolate the weights of the triangle they land on. The mesh hangs under its heaviest bone, which stays its `bone` tag for the false-colour view and head grouping.
- **Rigid still has its place.** The tentacle serpent's tail keeps `skin: "rigid"` as segmented armour, so both modes are shown.

## Batch 6: outlines

Stefan asked for a tool that lets a model draw a flat 2D shape point by point, with no curves, and extrude it to any thickness. `slab` already made a prism, but from model-space corners, so a fin or sail meant computing every 3D corner by hand. A drawing needs a plane and 2D points.

- **`extrude(outline, { at, x, y })`.** The outline is drawn in the plane of two model-space Directions with its origin at `at`; the default is a side view (x forward, y up), which is how fins, sails, crests and plates are drawn. Mirrored pairs mirror the directions, not the points. The returned Part's local axes are the drawing's, so spots and ribs are placed with `part.local([u, v, t / 2])`.
- **The loop always closes.** No "close if far enough apart" threshold: a deliberate last point near the first would be ambiguous. A last point equal to the first is dropped.
- **Crossing outlines throw.** Triangulation silently produces broken faces on a self-crossing loop, so the check names the two edges.
- **Taper is a gradient, not per-point thickness.** `thickness: [atLowest, atHighest]` varies linearly with the outline's y, applied by scaling each vertex's z. Both faces stay planar; per-point thickness would fold the faces along arbitrary triangulation edges.
- **Smoothing is corner cutting, not radius rounding.** Rounding with a radius overlaps once the radius passes half an edge. Corner cutting (a quarter of the way along each neighbouring edge) can't overshoot; it only crosses on a narrow notch, which is re-checked after smoothing and reported by the corners that caused it. `"sharp"` corners keep fin tips pointed.
- **Bevel clamps itself.** A bevel shrinks the faces inward; on sharp or concave corners a large one turns the shape inside out. It is capped at half the thickness, then halved until the inset outline keeps every edge's direction and stays simple.
- **`lathe(outline, { at, axis })`.** The same outline spun around an axis: x is the radius. Sweeps already make round tubes, but a lathe draws profiles that double back (hat brims, bells, collars, rims). Low `segments` give faceted columns; corners sharper than 35° stay creased.

## Batch 7: one tube over several chains

Stefan asked why builders made the body and the tail as two overlapping tubes. A smooth sweep could only follow one chain in its own direction, and a quadruped's skeleton forks at the hips: the spine runs forward, the tail backward. So every builder, and the tentacle serpent before them, used two tubes and buried the seam, which left a collar at the join and let the tail root poke through on hard bends.

- **`bone` takes a list of chains and joints.** Sweep skinning only ever needed an ordered run of bones along the curve and where each one starts; a chain was just one way to supply it. Each joint is projected onto the path, and the same smoothstep blend around each joint applies.
- **Ownership comes from bone direction.** A bone points at its child, so on a curve drawn from the tail tip, each tail joint owns the stretch behind it (from its child, or the chain tip) and each spine joint the stretch ahead. A lone joint owns from its own position. Of several spans starting at one point (hips, `tail1` and `spine1` often coincide), the last listed keeps it, so zero-length spans never shut the blend window.
- **Listed, not inferred.** Picking bones by distance alone grabs the wrong ones where parts come close (thigh bones under the belly, a leg root inside the trunk). The builder already knows which chains the body runs through.
- **Blend stays around the joints.** Weights are 1 on a bone's own span and blend over about ±1 radius at each joint. Blending across whole spans would make a mid-thigh ring half follow the shin, and linear blend skinning loses volume wherever weights are split.

## Batch 8: source t everywhere

- **`from`/`to` only crop.** Before, radius and shift functions, `color`, `bands` and `sweep.at` took t from 0 to 1 over the swept range. Builders key profiles at `chain.ts` and curve knots, so a leg swept `to: t3` squeezed its whole thigh-to-paw profile into the range, and a tube split into two ranges for colour drew the profile twice (the red fox's thigh-thick black socks and its white ball of a tail tip). Now every t is the source's own t, and two ranges with the same options are the two halves of one tube. Radius arrays still spread over the swept range, because they carry no t.
- **Sectors take a t range.** Colour strips around the tube used to run its whole length, which was the one reason to split a body into ranges: a back stripe on the body but full rings or a white tip on the tail. `[fromDeg, toDeg, color, fromT, toT]` limits a sector to a stretch, so the tail, rump and back can stay one sweep. When any sector is ranged, every ring gets a vertex at every sector edge angle, so rings either side of a range edge share their vertices.
- **Migration kept every accepted sample.** Samples that had worked around range-local t (remaps like `t / hipsT`) were rewritten in source t and build identical geometry. Only three changed on purpose: the red fox (rebuilt tail and legs), the snow leopard's legs (the knee now sits at the knee) and the giant anteater's belly sag (now under the chest, where its code put it).

## Batch 9: paint, textures and cards

Stefan: language models already draw decent SVGs, so let them draw textures too, fill surfaces with small textured planes, and get far more detail for very little geometry. Hair, fur, feathers, grass and leaves have been cut-out cards in games for twenty years for that reason.

- **Paint is a function of position and normal, not of UVs.** A builder can't see a UV layout, and every shape (sweeps, lathes, three.js primitives) lays its UVs out differently. A paint says what colour the model is at a point in meters, so stripes keep their width from body to leg to tail and continue across separate parts that share the paint. Countershading needs the normal. Nesting colours (any colour argument can be a paint) composes patterns without a layer system.
- **Charts, not the shapes' own UVs.** Each painted mesh is cut, when built, into charts of triangles that face the same way (±x, ±y, ±z) and share edges, each laid flat along its axis. Such a chart never folds over itself, so no texel is claimed twice, and it works the same for every shape. `b.root` packs every chart of every painted part into one sheet at one texel density, so texel density is uniform and all painted parts share one material. Chart seams are invisible because the paint is continuous in 3D; 4 texels of dilated margin keep filtering and mip levels off the neighbours.
- **Painted where built.** Charts keep the bind-pose position of every vertex, so a pattern is fixed to the surface and follows later poses.
- **SVG for drawn things.** Cards, eyes, signs and markings are drawings, and SVG is what models draw best. The browser rasterises it (the showcase and the harness both run in one); under Node the texture keeps its size and stays blank, so modules still import. Pixels are stored bottom-up with colour dilated into transparent texels, so cut-out edges filter to the right colour.
- **Cards are one call over frames.** Placement already has every tool (`scatter`, `sweep.at`, `ring`, `along`); cards only add the quad: root on the frame, lean toward a flow, curl, cross, random size and spin. Each card takes its frame's weights, so fur bends with the skin. Normals come from the frame's facing axis, the usual hair-card trick, so a coat is lit like the body and a canopy like one volume. Double-sided by geometry (a back face per quad), because the harness has one material for everything. One mesh per texture keeps a thousand cards one part.
- **One atlas, like a sprite sheet.** The harness used to put flat colours in 8-texel cells of a palette texture with nearest filtering and threw textures away. Now the colour block is one tile among the textures and the paint sheet, each padded by 8 repeated edge texels, with linear filtering and mips. Flat parts point every vertex at the centre of a 16-texel cell, so their UV derivative is zero and they sample exactly their colour: the existing samples render pixel-identically (ramFawn, griffin, snowLeopard, lantern checked). The material cuts away texels below alpha 0.5 only when some tile has transparency.
- **The GLB keeps the atlas exactly.** three's exporter writes images through a canvas, which premultiplies alpha and blanks the colour of transparent texels; the harness writes the atlas PNG itself so the dilated colour survives into other engines.
- **Not done:** repeating textures (atlas tiles can't wrap; paint instead), UV-mapped images on SDK shapes, and alpha blending (cut-outs only: a single mesh can't sort its own transparent triangles).

## Batch 10: what the texture round asked for

Five Opus builders (bonsai, golden pheasant, Highland cow, koi, scarecrow) used batch 9 without help; every one finished clean. Their friction, and what changed:

- **Paints get the part's own coordinates.** A position-and-normal paint can't draw a stripe spiralling round a curving trunk or rays across a fin; both builders rebuilt the shape's frame by hand. Paints now take a third argument `s`: `[t, deg]` on sweeps (the same clock as `sweep.at` and `sectors`), outline `[x, y]` on extrusions, `[height, deg]` on lathes, `[along, across]` on membranes, plane coordinates on slabs, uv on three.js geometry. Shapes record it per vertex before charting, the bake interpolates it (unwrapping angles across 0°), and nested paints read the same `s`, so no built-in paint had to change.
- **Cards take a flow per card and mirror.** Flat flight feathers each needed their own flow, which forced one call (one part) per feather. `flow` also takes `(frame, i) => direction`. Which way a drawing reads on a card is now documented, and `mirror` flips it for the other side of a body. A texture listed twice (to weight the random pick) no longer makes a second mesh.
- **Bones past a short path.** A feather swept along the start of a tail chain projected every further joint onto its tip, and the last one listed (the chain's far end) took the tip, which flew off in flex tests. Spans that start beyond the path's far end now own nothing and are dropped; spans before the start still own the stretch to the next joint. The hammerhead shark had the same fault unnoticed (two shards under its tail in flex A); the other samples build identical geometry.
- **Harness checks.** The inside-out test needs a closed, non-flat part: a decal disc's sign was floating-point noise, and open colour-sector strips were the long-standing false alarm. Issue labels name the bone and group. The floor check warns from 5 mm (a 1.9 cm dip went unreported); it now flags barnOwl (+14 mm) and tentacleSerpent (−6 mm). UVs within 0.07 of 0..1 (sphere poles) clamp silently.
- **Documented, not changed:** textured parts are single-sided like every part; how drawings sit on planes, circles, boxes and spheres; a drawn face needs a few millimetres of clearance; raster size for thin strokes; the paint sheet doubles at `detail` above 1; `moved(p)` takes local points; sectors don't follow `twist`; a `bone` list wants a path running along its chains; `frustumBox` ends are square to its axis; per-region scatter density.

## Batch 11: lean meshes

Stefan, looking at the Highland cow in wireframe: the body, legs, horns and ears carry more segments than their size needs. Builders could set sides around a tube, lathe steps and membrane cells, but not rings along a tube, bevel steps or card curl segments, and the only lever for those was the global `detail`. The paint sheet only grew with `detail` above 1, so the scarecrow raised geometry everywhere to get sharper stitches. GUIDE asked for as many primitives as needed and said nothing about economy; builders picked 14 to 18 sides on parts where fewer read the same.

- **`detail` on every shape.** `sweep` (and `loft`, the tube helpers, `sprout`), `membrane`, `extrude`, `lathe` and `cards` take their own `detail`, which replaces the builder's for that shape; `b.segments(n, detail)` does the same for three.js geometry. One concept the builder already knows, not a knob per internal count.
- **Three rings per smooth joint, not five.** The blend window's edges and middle; the quarter rings added little to the bend. Curvature and radius changes still add rings where the shape needs them.
- **Card curls cost what they bend.** One segment per 20° of curl (at least 2) instead of always 4: most hair and feather curls are 20° to 40°.
- **Bevel steps scale with `detail`.** 3 at detail 1; 1 is a chamfer.
- **`paintSize` is its own setting.** `createBuilder({ paintSize: 2048 })` sharpens the paint sheet without touching geometry; `detail` no longer changes it. The scarecrow moved from `detail: 1.25` to `paintSize: 2048`.
- **GUIDE asks for lean meshes** as a goal: the fewest segments that keep each silhouette smooth at the size it is seen, with paints, textures and cards carrying the fine detail.

Across the 24 samples, triangles fell 9% (531.6k to 483.7k) with no sample edited except the scarecrow's builder line: the Highland cow 37.1k to 22.4k, the golden pheasant 24.2k to 15.6k, the scarecrow 33.9k to 22.6k, the bonsai 29.7k to 23.4k. The cow, scarecrow and snow leopard renders (`v30-lowpoly`) match their earlier finals, flex tests included.
