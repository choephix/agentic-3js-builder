# agentic-3js-builder

Helpers for writing primitive-built, skeleton-rigged three.js creatures in code. You describe the creature in model space; the SDK builds joints, tubes, membranes and stuck-on details, and returns a plain `THREE.Object3D` tree that meets the Nilo Creature Lab contract (`~/tmp/public/nilo/creature-lab/GUIDE.md`).

Why each helper exists, with the evidence from 100 builds: [`docs/DESIGN.md`](docs/DESIGN.md). Working examples: [`examples/`](examples).

## Target

A creature module that:

- builds the skeleton first (`joint`, `chain`), then hangs geometry on it;
- states every position and direction once, in model space (+Y up, faces +Z, left is +X, meters), and derives the rest from handles (`joint.at`, `chain.at(t)`, `sweep.at(t)`, surface hits) so moving one point moves everything that depends on it;
- never calls `updateMatrixWorld`, `attach`, `worldToLocal`, `setFromUnitVectors` or `lookAt`, and never hand-tunes surface offsets or filler spheres.

## Requirements the SDK enforces or guarantees

- Exactly one root joint (the first `joint` without `parent`); a second one throws. Joint names match `/^[A-Za-z][A-Za-z0-9_]*$/` and are unique.
- Joints and everything above them are unscaled. Scale lives on meshes (`part({ scale })`, `region`).
- Every mesh sits under the joint that owns it (rigid skinning: one bone per mesh). Geometry that must follow several bones is split into one mesh per bone span.
- One shared `MeshStandardMaterial` per colour (roughness 0.72, metalness 0.04).
- Deterministic: randomness only through an `rng` you pass (`rng(seed)` here, or `kit.rng(seed)`).
- You still own the lab's limits (1000 parts, 120k triangles, 160 joints, 64 colours) and resting on y = 0.

## Module

```ts
import * as THREE from "three";
import { createBuilder } from "/home/cx/noodlespace/agentic-3js-builder/src/builder";
import { aim, lerp, mid, offset, rng } from "/home/cx/noodlespace/agentic-3js-builder/src/math";
import { arc, bezier, catmull, polyline } from "/home/cx/noodlespace/agentic-3js-builder/src/path";
import { along, ring } from "/home/cx/noodlespace/agentic-3js-builder/src/distribute";
import { twoBoneIK } from "/home/cx/noodlespace/agentic-3js-builder/src/ik";

export default function build() {
  const b = createBuilder({ name: "wyvern" });
  const hips = b.joint("hips", { at: [0, 1, 0] });
  // ...
  return b.root;
}
```

`snap.ts` bundles the SDK with your module and maps every `three` import to the page's single copy.

A point or direction is `V3` = `[x, y, z]` or `THREE.Vector3`. Every helper copies its inputs and returns fresh vectors.

## Orientation: `aim` and the roll convention

`aim(dir, up?, axis = "y")` returns a `Quaternion` whose local `axis` points along `dir`. It is the only orientation helper, and joints, chains, sweeps, parts and `stick` all use it.

- Axis "y" with `up`: local +Z leans toward `up`.
- Axis "y" without `up` (the default for bones and tubes): local +X stays as close to the creature's right (world −X) as possible. In the mid-plane, a bone pointing forward has +Z up, down means +Z forward, up means +Z back, and backward means +Z down. Widths always run along world X. A bone pointing straight sideways falls back to +Z = world up.
- Axis "z" or "x": local +Y leans toward `up` (default world +Y), like `lookAt`.

So for a head joint aimed forward, `head.local([0, 0.3, 0.05])` is 0.3 ahead and 0.05 up.

`lerp(a, b, t)`, `mid(a, b)`, `offset(p, dir, dist)` return `Vector3`. `DEG`, `vec(p)` and `rng(seed)` are also exported from `math`.

## Paths

A `Path` is arc-length parametrised: `t` in [0, 1] is the fraction of its length.

| Call                                               | Result                                                                        |
| -------------------------------------------------- | ----------------------------------------------------------------------------- |
| `polyline(points)`                                 | straight segments; knots at the points                                        |
| `bezier(p0, p1, p2, p3?)`                          | quadratic or cubic; knots at 4 equal spans                                    |
| `catmull(points, tension?)`                        | smooth through the points (centripetal unless `tension`); knots at the points |
| `arc(center, from, axis, angleDeg)`                | circular arc, right-hand rule about `axis`; one knot span per 45°             |
| `p.at(t)`, `p.tangentAt(t)`, `p.length`, `p.knots` | queries                                                                       |
| `p.concat(other)`                                  | joined (straight bridge if they don't touch)                                  |
| `p.slice(t0, t1)`                                  | sub-path; `t1 < t0` reverses it                                               |
| `p.closestT(point)`                                | t of the nearest point on the path                                            |

A point array is accepted anywhere a path is, as a polyline.

## Skeleton

```ts
const hips = b.joint("hips", { at: [0, 1, 0] }); // root joint
const head = b.joint("head", { parent: neck.joints[3], at: neck.at(1).p, dir: [0, -0.15, 1], group: "head" });
const jaw = b.joint("jaw", { parent: head, at: head.local([0, 0.02, -0.06]), aim: head.local([0, 0.3, -0.1]) });
```

`b.joint(name, { parent?, at, aim?, dir?, up?, group? })` returns a `Joint`. `aim` is a target point and `dir` a direction; bone +Y points along it. With neither, the joint keeps its parent's orientation. `Joint` has `name`, `object`, `parent`, `at` (position), `quat`, `local(p)` (joint-frame point to model space) and `dir(v)` (joint-frame vector to model space).

`b.chain(name, path, { parent, up?, group?, count? })` returns a `Chain` of joints `${name}1..N`. Joint i sits at its span start and aims at the next; the last span ends at the path end. The default count is one joint per knot span; `count` resamples by arc length. Roll starts from `aim(tangent, up)` and is parallel-transported, so it never flips. A `Chain` has `joints`, `path`, `length`, `ts` (joint t's plus 1), `at(t)` returning `{ t, p, tangent, normal, binormal, joint }`, `jointAt(t)` and `span(i)` returning `[t0, t1]`.

To root a chain mid-body (serpents, centipedes), cut one curve into two chains from the same parent:

```ts
const body = catmull([tailTip, ..., rootPoint, ..., headEnd]);
const core = b.joint("core", { at: rootPoint });
const rootT = body.closestT(core.at);
const front = b.chain("front", body.slice(rootT, 1), { parent: core, count: 5 });
const back = b.chain("back", body.slice(rootT, 0), { parent: core, count: 7 });
```

## Parts

`b.part(geometry, color, { bone?, at?, quat? | aim? | dir? (+ up?, axis?) | rotation?, scale?, group?, name? })` returns a `Mesh` placed in model space under `bone` (a `Joint` or a name; the root joint by default). `at` defaults to the bone position. Orientation priority is `quat`, then `aim`/`dir`, then `rotation` (XYZ degrees), then world axes. `axis` picks which geometry axis `aim`/`dir` points (default "y", the axis of three's cylinders and cones).

## Sweep

`b.sweep(source, radius, options?)` returns a `Sweep`. Use it for every tube: bodies, necks, tails, limbs, horns, tentacles, whiskers.

- `source` is a path or point array (one mesh on `options.bone`, default root) or a `Chain` (one mesh per joint span, each on its joint). `from`/`to` restrict the source range.
- `radius` is `r`, `[r0, r1]` (linear), `number[]` (evenly keyed, smooth), `(t) => r` or `(t) => [rx, ry]`. `rx` runs sideways (binormal) and `ry` along the frame normal. For boxes these are half extents. Radius t, colour t, bands and `at` t all run 0..1 over the swept range.
- `section` is `"circle"` (default, `sides` = 8, smooth), `"box"` or `{ ngon: n }` (faceted). `smooth` overrides the shading. Circles are circumscribed: flat faces sit exactly at `r`, top and bottom are flat, so a tube of radius r whose axis is at height r touches the floor.
- `caps` is `"round"` (default), `"flat"`, `"point"`, `"none"`, or `{ start, end }`. With round caps, a 2-point sweep is a capsule.
- Chain cuts get round caps of the local radius on both pieces. They hide inside the neighbour when straight and fill the gap when the joint bends, so you never add filler spheres. `overlap: k` instead extends each piece k × radius past the cut with a flat end. Point-array sweeps are split the same way at corners sharper than 20°, inside one mesh.
- `color` is a string or `(t) => string`, evaluated once per piece. `bands: [[tEnd, color], ...]` splits the tube at band edges, keeping the same bone and no cap.
- `up` sets the start roll for path sources. `split: chain` cuts a path sweep where it passes each joint of `chain`, one mesh per joint.
- Ring spacing adapts to curvature (about 10° per ring) and radius change. Straight constant tubes use 2 rings.

`sweep.at(t, angleDeg = 0, lift = 0)` returns `{ t, p, n, tangent, radius, joint }` on the built surface. Angle 0 is the side facing world up (dorsal); +90 turns clockwise looking along the tube. `sweep.meshes` lists the meshes.

```ts
const tail = b.chain(
  "tail",
  catmull([
    [0, 1, 0],
    [0, 0.95, -0.55],
    [0, 0.95, -1],
    [0, 1.1, -1.45],
  ]),
  { parent: hips, count: 6 },
);
b.sweep(tail, (t) => 0.2 * (1 - t) + 0.025, {
  bands: [
    [0.8, GREEN],
    [1, BONE],
  ],
});
b.sweep(bezier(base, ctrl, tip), [0.045, 0], { bone: head, color: BONE, caps: { start: "flat", end: "point" } }); // curved horn
```

These shorthands are each one call to `sweep`:

| Call                                               | Shape                                                                                        |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `b.rod(a, b, r \| [r0, r1], opts?)`                | flat ends                                                                                    |
| `b.capsule(a, b, r \| [r0, r1], opts?)`            | round ends                                                                                   |
| `b.spike(base, dirOrTip, len, r, opts?)`           | cone to a point; `len` number means direction, `len` null means `dirOrTip` is the tip        |
| `b.frustumBox(a, b, [w0, h0], [w1, h1], opts?)`    | box section, full width × height, flat ends                                                  |
| `b.loft([{ at, w, h }, ...], { chain?, ...opts })` | catmull through station centres, full width/height interpolated; `chain` splits it per joint |

## Surface and stick

`b.surface(targets)` takes meshes, a `Sweep`, a `Joint` (its meshes) or nested arrays, and returns a `Surface` that queries the built triangles.

- `.nearest(p)` returns a `Hit` `{ p, n, mesh, joint }`, where `n` is the outward face normal and `joint` owns the mesh.
- `.ray(origin, dir)` returns the first hit or null.
- `.around(center?).at(azimuthDeg, elevationDeg)` returns the outermost hit in that direction from `center` (default: bounding-box centre). Azimuth 0 is +Z, 90 is +X; elevation 90 is up.
- `.scatter(count, { rng?, minDist?, keepOut?, filter? })` returns area-weighted hits, deterministic for a given `rng`. It rejects points buried inside other target meshes.

`b.stick(geometry, color, hit, { embed = 0.2, flow?, spin?, bone?, scale?, group?, name? })` seats a part on a hit. Local +Y follows the normal, and the part sinks by `embed` × its own height along the normal, so resizing the part needs no retuning. `flow` is the preferred surface direction for the part's +Z (scales, shingles), `spin` is degrees about the normal, and the bone defaults to the hit's joint.

```ts
const skin = b.surface(bodyLoft);
for (const hit of skin.scatter(26, { rng: rng(7), minDist: 0.12, filter: (h) => h.n.y > -0.3 }))
  b.stick(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 10), SPOT, hit, { embed: 0.5 });
const crown = b.surface(head).around(head.at).at(0, 70);
if (crown) b.stick(new THREE.ConeGeometry(0.035, 0.14, 8), HORN, crown);
```

## Membranes and slabs

`b.membrane(edgeA, edgeB, { color, thickness, rows?, cols?, scallop?, split?, bone?, group?, name? })` skins between two edges (each a `Chain`, path or points), resampled by arc length. It returns one closed, double-sided mesh per bone. With `split: "mid"` (default), cells nearer A go to A's joint at that t and cells nearer B go to B's. `"a"` or `"b"` assigns everything to one edge. Path edges use `bone`. Every bone span boundary gets a column. `scallop` (a fraction of the length) pulls the trailing edge between the two tips inward. Run both edges in the same direction, from root to tip.

`b.slab(points, { color, thickness, bone?, group?, name? })` turns a roughly planar polygon into a thin closed prism for fins, ears, leaves and plates.

```ts
b.membrane(finger1, finger2, { thickness: 0.02, color: WING, scallop: 0.18 });
b.membrane(finger3, [wrist, flankFront, flankBack], { thickness: 0.02, color: WING, bone: spine.joints[0] });
```

## Distribution, IK, regions

- `ring(center, axis, radius, count, (p, outward, i) => {}, { startDeg? })` works around any axis. Angle 0 is the in-plane direction closest to world up (world +Z for a vertical axis), and angles run counter-clockwise about `axis`.
- `along(chain | sweep | path, count, (at, i) => {}, { from?, to? })` places stations at the centres of `count` equal parts. `at` is `chain.at(t)`, `sweep.at(t)` (dorsal surface point) or `{ t, p, tangent }`.
- `twoBoneIK(root, target, [l1, l2], bendHint)` returns the knee or elbow point. Build the limb chain through `[root, knee, target]` and the foot lands exactly on `target`, so put feet at `y = footRadius`.
- `b.region({ at, scale = 1, quat? })` is an authoring frame, not a scene node. It has `.p(localPoint)`, `.d(dir)`, `.s(length)`, `.q(quat?)`, plus `.part(...)`, which bakes region scale into mesh scale, and `.joint(...)`, which moves and rotates joints but never scales them. Resize a head by editing one number.

```ts
const knee = twoBoneIK(hip, [x, footR, z], [0.46, 0.44], [0, 0, 1]);
const leg = b.chain("legHL", [hip, knee, [x, footR, z]], { parent: spine.joints[0] });
const head = b.region({ at: [0, 1.4, 0.92], scale: 1.15 });
const skull = head.joint("head", { parent: neck.joints[1], at: [0, 0, 0], dir: [0, 0, 1] });
b.frustumBox(
  head.p([0, -0.02, 0.08]),
  head.p([0, -0.05, 0.34]),
  [head.s(0.2), head.s(0.17)],
  [head.s(0.14), head.s(0.1)],
  { bone: skull, color: PALE },
);
```

## Non-goals

No per-vertex skin weights, textures, mirroring helper, grid/row helpers, ground-shift helper or auto-merge batching. Mirror with `for (const s of [1, -1])`.

## Development

```
npm install
npm run typecheck
```

To smoke-render an example, point a scratch creature-lab slug's `B/creature.ts` at it (`export { default, meta } from "/home/cx/noodlespace/agentic-3js-builder/examples/wyvern";`) and run `node_modules/.bin/tsx harness/snap.ts <slug> B v01` from `~/workspace/nilo-creature-lab`. Delete the scratch slug afterwards.
