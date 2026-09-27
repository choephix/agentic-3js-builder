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
import { arc, bezier, catmull, polyline, spiral } from "/home/cx/noodlespace/agentic-3js-builder/src/path";
import { along, ring } from "/home/cx/noodlespace/agentic-3js-builder/src/distribute";
import { limb } from "/home/cx/noodlespace/agentic-3js-builder/src/ik";

export default function build() {
  const b = createBuilder({ name: "wyvern" }); // { detail } scales tessellation, see "Detail and budget"
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

| Call                                                           | Result                                                                                                                                                              |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `polyline(points, { closed? })`                                | straight segments; knots at the points                                                                                                                              |
| `bezier(p0, p1, p2, p3?)`                                      | quadratic or cubic; knots at 4 equal spans                                                                                                                          |
| `catmull(points, { tension?, closed? })`                       | smooth through the points (centripetal unless `tension`); knots at the points                                                                                       |
| `arc(center, from, axis, angleDeg)`                            | circular arc, right-hand rule about `axis`; one knot span per 45°                                                                                                   |
| `spiral(center, from, axis, { turns, r1?, pitch? })`           | coil starting at `from` like `arc`; radius goes geometrically to `r1` (ram horns, shells), `pitch` = advance along `axis` per turn (0 = flat coil); knots every 90° |
| `p.at(t)`, `p.tangentAt(t)`, `p.length`, `p.knots`, `p.closed` | queries                                                                                                                                                             |
| `p.concat(other)`                                              | joined (straight bridge if they don't touch)                                                                                                                        |
| `p.slice(t0, t1)`                                              | sub-path; `t1 < t0` reverses it                                                                                                                                     |
| `p.closestT(point)`                                            | t of the nearest point on the path                                                                                                                                  |

A point array is accepted anywhere a path is, as a polyline.

`closed: true` joins the last point back to the first. A closed catmull is smooth through the seam; a closed polyline has a corner there like any other. Sweeps of closed paths get no caps and no seam: the transported roll is evened out around the loop so it meets itself. Use closed paths for rims, collars and straps. Slices and concatenations are open.

Spiral turns follow the right-hand rule about `axis`. A mirrored pair has mirrored axes, so flip the sign of `turns` with the side (`turns: -s * 1.15`) to coil both the same way.

## Skeleton

```ts
const hips = b.joint("hips", { at: [0, 1, 0] }); // root joint
const head = b.joint("head", { parent: neck.joints[3], at: neck.at(1).p, dir: [0, -0.15, 1], group: "head" });
const jaw = b.joint("jaw", { parent: head, at: head.local([0, 0.02, -0.06]), aim: head.local([0, 0.3, -0.1]) });
```

`b.joint(name, { parent?, at, aim?, dir?, up?, group?, role? })` returns a `Joint`. `aim` is a target point and `dir` a direction; bone +Y points along it. With neither, the joint keeps its parent's orientation. `Joint` has `name`, `object`, `parent`, `at` (position), `quat`, `local(p)` (joint-frame point to model space) and `dir(v)` (joint-frame vector to model space).

`b.chain(name, path, { parent, up?, twist?, group?, count?, names?, role?, contact? })` returns a `Chain` of joints `${name}1..N`, or the names you give (`names: ["hipHL", "kneeHL", "hockHL"]` or `(i) => string`; auto-riggers key on them). Joint i sits at its span start and aims at the next; the last span ends at the path end. The default count is one joint per knot span; `count` resamples by arc length. Roll starts from `aim(tangent, up)` and is parallel-transported, so it never flips. `twist` then rolls it about the path: a number is the total in degrees, spread evenly from start to end; `(t) => deg` sets it per t. Joints and chain sweeps both follow it (a pronated forearm, a twisting tentacle). A `Chain` has `joints`, `length`, `ts` (joint t's plus 1), `at(t)` returning `{ t, p, tangent, normal, binormal, joint }`, `jointAt(t)` and `span(i)` returning `[t0, t1]`. `chain.at(t)` is in the current pose (see "Posing after building"); `chain.path` is the curve as built. `chain.nearestJoint(p)` is the joint whose bone segment passes closest to `p`. `role` and `contact` feed the rig answer key.

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

- `source` is a path or point array (one mesh on `bone`, default root) or a `Chain` (one mesh per joint span, each on its joint). For a path that runs along a chain in the same direction (a loft body over a spine), `bone: chain` cuts it where it passes each joint, one mesh per joint. `from`/`to` restrict the source range.
- `radius` is `r`, `[r0, r1]` (linear), `number[]` (evenly keyed, smooth), `(t) => r` or `(t) => [rx, ry]`. `rx` runs sideways (binormal) and `ry` along the frame normal. For boxes these are half extents. Radius, shift, colour, bands and `at` all use t from 0 to 1 over the swept range.
- `shift` is `[x, y]` or `(t) => [x, y]` in the same axes as `[rx, ry]`: it moves the section centre off the path, so a heavy belly hangs below the spine while the bones stay on the spine line.
- `section` is `"circle"` (default, `sides` = 8 × `detail`, smooth), `"box"` or `{ ngon: n }` (faceted). `smooth` overrides the shading. Circles are circumscribed: flat faces sit exactly at `r`, top and bottom are flat, so a tube of radius r whose axis is at height r touches the floor.
- `caps` is `"round"` (default), `"flat"`, `"point"`, `"none"`, or `{ start, end }`. With round caps, a 2-point sweep is a capsule. `extend: d | [start, end]` continues the tube straight past its ends at the end radius (meters) before the cap.
- Chain cuts get round caps on both pieces. Each cap stays inside the continuing tube's radius, so it is hidden while straight (even on a fast taper) and fills the gap when the joint bends. You never add filler spheres. `overlap: k` instead extends each piece k × radius past the cut with a flat end. Point-array sweeps are split the same way at corners sharper than 20°, inside one mesh.
- `color` is a string or `(t) => string`, evaluated once per piece. `bands: [[tEnd, color], ...]` splits the tube along its length at band edges, keeping the same bone and no cap.
- `sectors: [[fromDeg, toDeg, color], ...]` colours strips around the tube on the dorsal clock (0 = the side facing world up, 180 = belly, +90 clockwise looking along the tube). Uncovered angles keep the piece colour. Each sector is its own mesh per piece, sector edges have no walls, and neighbouring sectors share their edge vertices exactly. This composes with bands and chain splits. For countershading, use `sectors: [[-65, 65, DARK], [125, 235, CREAM]]`.
- Path sources take `up` (start roll) and `twist` (total degrees or `(t) => deg`, as on `chain`). Chain sources use the chain's roll.
- Ring spacing adapts to curvature and twist (about 10° per ring) and to radius or shift change. Straight constant tubes use 2 rings.

`sweep.at(t, angleDeg = 0, lift = 0)` returns `{ t, p, n, tangent, radius, joint }` on the built surface, on the same dorsal clock. `sweep.line(angleDeg, lift = 0)` returns the `Path` along the built surface at that clock angle, with knots at the bone cuts; closed tubes give closed lines. Use it as a membrane or sweep edge that lies on the skin (dorsal fins, manes, ridges). `sweep.meshes` lists the meshes.

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

| Call                                            | Shape                                                                                              |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `b.rod(a, b, r \| [r0, r1], opts?)`             | flat ends                                                                                          |
| `b.capsule(a, b, r \| [r0, r1], opts?)`         | round ends                                                                                         |
| `b.spike(base, dirOrTip, len, r, opts?)`        | cone to a point; `len` number means direction, `len` null means `dirOrTip` is the tip              |
| `b.frustumBox(a, b, [w0, h0], [w1, h1], opts?)` | box section, full width × height, flat ends                                                        |
| `b.loft([{ at, w, h }, ...], opts?)`            | catmull through station centres, full width/height interpolated; `bone: chain` splits it per joint |

`b.sprout(name, hit, pathOrTip, radius, { count?, bury?, names?, twist?, ...sweep options })` roots an appendage (limb, horn, tentacle, neck) on another volume at a surface hit and returns `{ chain, sweep }`. `pathOrTip` is a tip point (straight out) or a path or points; the hit point is prepended when the path starts elsewhere. The first joint sits at the hit, parented to `hit.joint`, and `count` joints follow (default one per knot span). With `count: 0` there are no joints (`chain` is null) and the tube rides on `hit.joint`. The tube's root continues `bury` (default: the root radius) back along its start tangent into the parent, so it never floats on a curved surface and no joint is wasted inside the body.

```ts
const hit = b
  .surface(skull)
  .around(skull.at)
  .at(s * 55, 40);
const coil = spiral(offset(hit.p, [0, -1, -0.3], 0.09), hit.p, [s, 0, 0], { turns: -s * 1.15, r1: 0.04, pitch: 0.08 });
b.sprout(`horn${side}`, hit, coil, [0.045, 0.01], { count: 0, color: HORN, caps: { end: "point" } });
b.sprout("tail", rump, catmull([rump.p, mid, tip]), [0.07, 0.03], { count: 2, names: ["tailBase", "tailTip"] });
```

## Surface and stick

`b.surface(targets)` takes meshes, a `Sweep`, a `Joint` (its meshes) or nested arrays, and returns a `Surface` that queries the built triangles.

- `.nearest(p)` returns a `Hit` `{ p, n, mesh, joint }`, where `n` is the outward face normal and `joint` owns the mesh.
- `.ray(origin, dir)` returns the first hit or null.
- `.around(center?).at(azimuthDeg, elevationDeg)` returns the outermost hit in that direction from `center` (default: bounding-box centre). Azimuth 0 is +Z, 90 is +X; elevation 90 is up.
- `.scatter(count, { rng?, minDist?, keepOut?, filter? })` returns area-weighted hits, deterministic for a given `rng`. It rejects points buried inside other target meshes.
- `.drape(path, { lift? })` pulls a path onto the built surface: every sample moves to its nearest surface point, then `lift` out along the normal. Knots and closedness carry over. Draw a rough loop around the body and drape it for a strap or collar, or drape a short curve for a mouth line or gill slit, then sweep it.

`b.stick(geometry, color, hit, { embed = 0.2, flow?, spin?, bone?, scale?, group?, name? })` seats a part on a hit. Local +Y follows the normal, and the part sinks by `embed` × its own height along the normal, so resizing the part needs no retuning. `flow` is the preferred surface direction for the part's +Z (scales, shingles), `spin` is degrees about the normal, and the bone defaults to the hit's joint.

```ts
const skin = b.surface(bodyLoft);
for (const hit of skin.scatter(26, { rng: rng(7), minDist: 0.12, filter: (h) => h.n.y > -0.3 }))
  b.stick(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 10), SPOT, hit, { embed: 0.5 });
const crown = b.surface(head).around(head.at).at(0, 70);
if (crown) b.stick(new THREE.ConeGeometry(0.035, 0.14, 8), HORN, crown);
const loop = catmull(
  [
    [0.45, 0.95, 0.2],
    [0, 1.5, 0.2],
    [-0.45, 0.95, 0.2],
    [0, 0.5, 0.2],
  ],
  { closed: true },
);
b.sweep(skin.drape(loop, { lift: 0.012 }), 0.018, { bone: skin.nearest([0, 1.4, 0.2]).joint, color: STRAP });
```

## Membranes and slabs

`b.membrane(edgeA, edgeB, { color, thickness, rows?, cols?, scallop?, split?, bone?, group?, name? })` skins between two edges (each a `Chain`, path or points), resampled by arc length. Chain edges are read in their current pose. `rows` defaults to 4 × `detail`. It returns one closed, double-sided mesh per bone. With `split: "mid"` (default), cells nearer A go to A's joint at that t and cells nearer B go to B's. `"a"` or `"b"` assigns everything to one edge. Cells on path edges go to `bone`, which is a joint, or a Chain whose nearest joint takes each cell. A fin between `tube.line(0)` and a raised line then follows the spine. Every bone span boundary gets a column. `scallop` (a fraction of the length) pulls the trailing edge between the two tips inward. Run both edges in the same direction, from root to tip.

`b.slab(points, { color, thickness, bone?, group?, name? })` turns a roughly planar polygon into a thin closed prism for fins, ears, leaves and plates.

```ts
b.membrane(finger1, finger2, { thickness: 0.02, color: WING, scallop: 0.18 });
b.membrane(finger3, [wrist, flankFront, flankBack], { thickness: 0.02, color: WING, bone: spine.joints[0] });
b.membrane(neckTube.line(0, -0.01).slice(0.05, 0.45), neckTube.line(0, 0.12).slice(0.05, 0.45), {
  thickness: 0.015,
  color: FIN,
  bone: neck,
});
```

## Distribution, IK, regions

- `ring(center, axis, radius, count, (p, outward, i) => {}, { startDeg? })` works around any axis. Angle 0 is the in-plane direction closest to world up (world +Z for a vertical axis), and angles run counter-clockwise about `axis`.
- `along(chain | sweep | path, count, (at, i) => {}, { from?, to? })` places stations at the centres of `count` equal parts. `at` is `chain.at(t)`, `sweep.at(t)` (dorsal surface point) or `{ t, p, tangent }`.
- `limb(root, target, lengths, bends, { sole? })` returns the joint points `[root, ..., end]` of a limb whose segments have exactly `lengths` and whose end lands exactly on `target`. Build the chain through them and put feet at `y = footRadius`. `bends` gives one direction per inner joint, or one for all, saying which way that joint points. Alternate them for digitigrade legs (knee forward, hock back); keep them the same for an even curl. The limb lies in the plane of root, target and the first hint. For 3 or more segments, the last one runs parallel to root→target (a vertical cannon under a hip) when that respects its hint and reach; otherwise every joint turns by the same angle. With `sole: dir`, the last segment points exactly along `dir` (a toe or flat foot on the floor) and the rest solves to its heel. Targets out of reach straighten the limb toward them. Two lengths is plain two-bone IK.
- `b.region({ at, scale = 1, quat?, bone? })` is an authoring frame, not a scene node. With `bone`, it rides on that joint and follows its later poses. It has `.p(localPoint)`, `.d(dir)`, `.s(length)`, `.q(quat?)`, plus `.part(...)`, which bakes region scale into mesh scale, and `.joint(...)`, which moves and rotates joints but never scales them. Resize a head by editing one number.

```ts
const hind = limb(
  hip,
  [x, footR, z],
  [0.36, 0.34, 0.26],
  [
    [0, 0, 1],
    [0, 0, -1],
  ],
); // knee forward, hock back
const leg = b.chain("legHL", hind, { parent: spine.joints[0], names: ["hipHL", "kneeHL", "hockHL"] });
const bird = limb(
  hip,
  [x, toeR, z + 0.3],
  [0.34, 0.36, 0.3, 0.16],
  [
    [0, 0, 1],
    [0, 0, -1],
    [0, 0, 1],
  ],
  { sole: [0, 0, 1] },
);
const head = b.region({ at: [0, 1.4, 0.92], scale: 1.15, bone: neck.joints[1] });
const skull = head.joint("head", { parent: neck.joints[1], at: [0, 0, 0], dir: [0, 0, 1] });
b.frustumBox(
  head.p([0, -0.02, 0.08]),
  head.p([0, -0.05, 0.34]),
  [head.s(0.2), head.s(0.17)],
  [head.s(0.14), head.s(0.1)],
  { bone: skull, color: PALE },
);
```

## Fans: many appendages, few joints

`b.fan(name, { parent, at, axis, from, angleDeg, count, banks?, radius?, names?, group?, role? }, (item) => { ... })` spreads `count` items over `angleDeg` about `axis` through `at` (right-hand rule; 360 means evenly all round), starting along `from`. A component of `from` along `axis` tilts every item into a cone, which gives rings of quills on a ball. Items start `radius` out from the pivot. Each run of about count/banks items is owned by one bank joint (default: one bank per 4 items), so the fan costs exactly `banks` joints. The callback gets `{ i, t, p, dir, joint, bank }` and builds that item's geometry with `bone: item.joint`. It returns a `Fan` with `banks` (the joints) and `items` (in the current pose).

Bank joints sit `radius` out along their run's centre direction, with +Y along it and +Z toward `axis`. Posing a bank by +deg about its local X (`bank.dir([1, 0, 0])`) raises its run out of the fan plane. Posing about its local Z swings it within the plane.

The tradeoff comes from rigid skinning: items move with their bank, so when banks rotate apart, neighbouring items on different banks separate in steps. With 3 to 5 items per bank, moderate poses still read as one fan. `banks: count` gives every item its own joint.

```ts
const train = b.fan(
  "train",
  { parent: hips, at: rump, axis: [0, 1, 0], from: backLeft, angleDeg: 110, count: 24, banks: 6, role: "tail" },
  (item) =>
    b.sweep(bezier(item.p, mid, offset(item.p, item.dir, 1.05)), [0.012, 0.005], { bone: item.joint, color: GREEN }),
);
for (const bank of train.banks) b.pose(bank, { axis: bank.dir([1, 0, 0]), deg: 72 }); // display: 6 joints raise 24 feathers
```

## Posing after building

`b.pose(joint, rotation)` rotates a joint, with everything under it, about the joint's own position. It sets a new rest pose (open a jaw, raise a tail, fold a fan bank) without rebuilding. `rotation` is in model space: a `Quaternion`, `{ axis, deg }` (right-hand rule), or `{ dir }` / `{ aim }` for the smallest swing that points the bone (+Y) that way. With `{ axis: [1, 0, 0], deg }`, positive degrees tip a forward-pointing bone down (open a jaw) and lift a backward-pointing one (raise a tail).

Every handle stays valid afterwards, and anything built later lands in the new pose:

- `joint.at`, `quat`, `local()` and `dir()` read the scene.
- `chain.at`, `sweep.at`, `sweep.line`, `fan.items` and regions with `bone` map their build-time data through each owning joint's motion since it was captured.
- Surfaces re-read their meshes on the next query after a pose.
- Sweeps and membranes built on a chain after a pose follow the posed chain.

## Detail and budget

`createBuilder({ detail })` scales the tessellation the SDK chooses: default circle sides (8 × detail), ring spacing (a ring per 10° / detail of turn), radius tolerance and membrane cells. `b.segments(n)` gives `max(3, round(n × detail))` for your own geometry (`new SphereGeometry(r, b.segments(12), b.segments(8))`), so hitting the triangle budget is one edit. Explicit `sides`, `rows` and `cols` still win. Triangles scale roughly with detail²: the peacock example has 10.7k triangles at detail 1 and 6.3k at 0.8.

## Rig answer key

Reading `b.root` writes `root.userData.rig`, evaluated in the current pose. The creature-lab harness copies it into the report JSON and the rigged GLB's extras (`creatureLab.rig`), so auto-riggers can be scored against it.

```ts
{
  version: 1,
  chains: [{ name, role, side, joints: string[], contact?: [x, y, z] }], // chains with a role
  joints: [{ name, role, side, hinge?: [x, y, z] }],                      // joints with a role
  fans: [{ name, role, side, pivot, axis, banks: [{ joint, items }] }],   // every fan
}
```

- `role` is one of `spine neck head jaw hinge tail leg arm wing digit tentacle fan`. Set it on `joint`, `chain`, `fan` or `sprout`.
- `side` is derived: "L" when every joint sits at x > 0 (the creature's left), "R" when every joint sits at x < 0, "C" otherwise.
- A `leg` records `contact`, which defaults to the chain tip (the `limb` target). Pass `contact` for the floor point under a foot.
- `jaw` and `hinge` joints (lids, wing cases, flaps) record `hinge`, the bone's local X in model space. With the default roll it runs across the body.
- Fans always record their banks and item counts.

## Non-goals

No per-vertex skin weights, textures, mirroring helper, grid/row helpers, ground-shift helper or auto-merge batching. Mirror with `for (const s of [1, -1])`.

## Development

```
npm install
npm run typecheck
```

To smoke-render an example, point a scratch creature-lab slug's `B/creature.ts` at it (`export { default, meta } from "/home/cx/noodlespace/agentic-3js-builder/examples/wyvern";`) and run `node_modules/.bin/tsx harness/snap.ts <slug> B v01` from `~/workspace/nilo-creature-lab`. Delete the scratch slug afterwards.
