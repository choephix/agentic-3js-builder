# Your task

You write one three.js model in code: the subject in the user's pitch, built from primitives with the agentic-3js-builder SDK. An application runs your module and shows the model in 3D. You get one reply, so the module you send is the finished model. The quality of the model is the top priority.

## Your reply

Your reply is one TypeScript module in a single ```ts code block. Text outside the block is ignored.

- `import * as THREE from "three";` for three.js (r185).
- Every SDK export comes from one module: `import { createBuilder, frame, rng, ... } from "agentic-3js-builder";`. The reference below may show per-file import paths; all of them are exports of `"agentic-3js-builder"`.
- The module default-exports a function with no arguments that returns a `THREE.Object3D` (the builder's `b.root`), and exports `meta = { name, description }`.
- Randomness comes from `rng(seed)`, so every run builds the same model.
- The module runs as it is: every name it uses is defined or imported.

## The model

- Meters. +Y up, the model faces +Z, its left side is +X, centred on x = 0.
- It stands on y = 0: its lowest points touch the floor or sink into it by up to 2% of the model's height, and nothing hangs above it. A model the pitch places off the ground (a bird in flight, a hanging lantern) keeps that height.
- Real-world size for the subject, unless the pitch says otherwise.
- Creatures are built skeleton first and stand in a rest pose for rigging and animation: a neutral, readable pose, the non-humanoid equivalent of a T-pose, with limbs, digits, wings, tails and tentacles separated and extended, and the mouth built as a separate upper and lower jaw so it can open.
- Joints carry names a rigger recognises (`hipL`, `kneeL`, `jaw`, `tail3`) and chains carry a `role` (`spine neck head jaw hinge tail leg arm wing digit tentacle fan`).
- Props and scenery can be plain objects without joints.
- Every piece of geometry joins the model through the builder (`b.part(geometry, color, { at, bone })`, `b.stick` and the shape helpers), which puts it on its bone and shares its material.
- Limits: 1000 parts, 60k triangles, 160 joints, 64 flat colours.

## Art direction

> By lots of detail I mean mostly a simple base. Each of these is still made out of primitives so they should retain that blocky shape expected of a puppet made out of primitives. The composition, the color and material choice, and the little details on top of those simple shapes should be what give me that wow factor.

The look is stylized: bold, readable shapes and proportions, a clear colour palette, and features shaped with character and emphasised where that helps the subject read. Use as many primitives as you need to make it look good. Surfaces can carry more than flat colour: paints, SVG drawings as textures, decals on curved surfaces, and cards.

The wow comes from creativity, not smoothness. The look is low-poly: facets are part of it, and every part gets only enough segments to read as its shape at the size it is seen. Paints, textures and cards carry the fine detail.

## How to build

Build with the SDK throughout. Its helpers are the tested way to get bodies that bend smoothly with the rig, details seated exactly on curved surfaces, and patterns painted across parts: chains and sweeps or lofts for bodies, necks, tails and limbs; `surface` hits with `stick`, `ring` and `along` for everything placed on a body; extrudes, lathes and membranes for flat, turned and webbed shapes; paints, textures, decals and cards for surface detail. Plain three.js geometry fits the simplest pieces.

## The target

The finished models people single out in this library share a profile: 180–340 parts, 5–12 textures, and modules of 700–1,100 lines. The textures are where the character lives: SVG drawings for eyes, faces, emblems, runes, labels, patterned cloth and trim, and paints for fur, wood, stone, metal and skin. Lanterns, fire, crystals, magic and screens glow. The subject is the whole deliverable: ground, rocks, props or scenery appear only where the brief names them, sized to the subject, and its style is unmistakable from the first glance.

Decide the parts and the textures, then write the whole module: it is the deliverable, so give it the length the model needs.

## Craft

The models that delight share these habits:

- **The subject is the hero.** Settle its proportions first, pushed the way the style pushes them: a characterful head, big readable eyes, chunky hands and paws, heavy shoulders, short sturdy legs on cute subjects, a bold silhouette on vehicles and weapons. A scale constant per feature (`const H = 1.3` for the head, used for every head position and size) keeps a feature's parts together while you tune it. The identity cues of the subject (a red panda's round cream-rimmed ears and cheek ruffs, a dwarf's braided beard, a troll's tusks and mohawk) are built big and clear.
- **The face is settled before anything is built around it.** Two eyes that read from the front, a muzzle or mouth that gives the head its shape, ears and brows placed by the head's scale constant, and nothing in front of them: hats, weapons, scarves and props sit above, beside or behind the face.
- **Signature features get the richest construction.** Hair, manes, beards and crests are a solid silhouette plus a modest number of broad, overlapping shaped blades or drawn cards with a root-to-tip palette; a few bold shapes carry them. Accessories are assemblies: a scarf has its loop, trim, ribbon tails and tassels; a book has covers and an inset page block; a weapon has its bands, plates and fittings; ornament repeats one motif across crown, doors, sides and contents.
- **Surfaces are painted by place.** A custom `paint((p, n) => …)` lights the form (warm on top, cool below), and puts each wear where it belongs: moss on upward faces, mud at the feet, a pale belly, soot near the fire. Drawings carry faces, eyes, emblems, runes, cloth patterns and trim, layered in a dark outline, a main colour and a fine highlight.
- **The subject gets the code.** Spend the module on the subject itself: its body, face, signature features, accessories and small details. Anything the brief stages it on or with (a mossy stone, a treasure pile) is built to the subject's footprint and kept simpler than the subject; nothing else is added around it.
- **Every part sits where it is meant.** Each layer of a stacked or mirrored shape carries the same explicit axes; ornaments, ears and caps are placed relative to the part they belong to, so nothing floats free of the body.

Write the helpers this asks for (a placement helper, a fur tuft, a trim, a tassel) once and reuse them: the module grows long through craft, and that length is welcome.

# SDK reference

The API of agentic-3js-builder: helpers for writing primitive-built, skeleton-rigged three.js models in code. You describe the model in model space; the SDK builds joints, tubes, membranes and stuck-on details, and returns a plain `THREE.Object3D` tree that meets the Nilo Creature Lab contract (`~/tmp/public/nilo/creature-lab/GUIDE.md`).

## Which helper for which job

- A body, neck, tail, limb or tentacle that bends: `b.chain` for the joints, then `b.sweep` along it (`b.loft` when the cross-section changes shape along the body).
- Leg or arm joints that land a foot or hand exactly on a point: `limb(root, target, lengths, bends)` from `src/ik`.
- A limb, horn, tentacle or neck growing out of a built body: `b.sprout(name, hit, tip, radius)`.
- A point on a built body to put something on: `b.surface(body)` and its `.nearest(p)`, `.around(center).at(azimuth, elevation)` or `.ray(origin, dir)`; each returns a `Hit` facing out of the surface.
- A part seated on a body (a scale, stud, spine, hoof, eye): `b.stick(geometry, color, hit)`.
- Many things spread over a body (spots, spines, fur cards): `surface.scatter(count)`, then `b.stick` or `b.cards` on the hits.
- Things around a limb, eye, horn, neck or waist (toes, a ruff, lashes, petals, a spine ring): `b.ring(line, { count, radius })`, where the line is that joint, eye or hit.
- Things in a row along a curve or tube (dorsal spines, vertebrae, buttons): `b.along(path, count, (at) => {})`.
- A band round a body (belt, collar, cuff, bandolier) and rows of studs or plates on it: `surface.loop(joint or point)`, then `b.sweep` or `b.along`.
- A strap on any other route over a body: `surface.drape(roughPath)`.
- A drawing on a curved surface (an eye, an emblem): `b.decal`.
- A flat shape with thickness (fin, blade, plate): `b.extrude`; a turned shape (dome, vase, helmet bowl): `b.lathe`; a web or wing skin between two edges: `b.membrane`.
- A head or other cluster whose size is one number: `b.region`.

Hits, joints and tube points carry their bones, so what you build from them stays on the body and moves with it. The sections below give every option.

## Cheat sheet

Bones work, and so does any other point, line or frame: an eye, a horn, a surface hit, a point on a tube, or something you make up. Every helper takes one of five geometric kinds and converts whatever you pass.

| Kind          | What it is                                                                   | What converts to it                                                                                                                                                                                                                                                                     |
| ------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Point**     | a position                                                                   | `[x, y, z]`, `Vector3`, a raw `Mesh` (bounding-box centre), and anything that converts to a Frame (its position)                                                                                                                                                                        |
| **Direction** | a vector                                                                     | `[x, y, z]`, `Vector3`, and anything that converts to a Frame (its facing `axis`)                                                                                                                                                                                                       |
| **Line**      | a point plus a direction                                                     | any Frame: its position and facing `axis`. `line(a, b)` makes one from two points; a plain `{ at, axis }` works too                                                                                                                                                                     |
| **Frame**     | a point with a full orientation, a facing `axis` and the bones it moves with | a `Joint` (bone +Y), a `Part` (the axis it was aimed or stuck along), a `Sweep` (its start, along the tube), a `Hit` (its normal), `chain.at(t)` (the tangent), `sweep.at(t)` (the surface normal), a `Region`, ring and along items, `frame(at, dir, up?)`, `line(a, b)`, `f.moved(p)` |
| **Path**      | an arc-length curve                                                          | a point array (any Points), `polyline`, `bezier`, `catmull`, `arc`, `spiral`, a `Chain` or a `Sweep` (its current centreline), `sweep.line(deg)`, `surface.drape(path)`                                                                                                                 |

| Helper                                                                                                 | Takes                                                          |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| `b.joint({ at, aim, dir, up })`                                                                        | Point, Point, Direction, Direction                             |
| `b.chain(name, path)`, `b.sweep(path, radius, { color })`, `b.membrane(edgeA, edgeB)`, `b.along(path)` | Path                                                           |
| `b.rod/capsule/frustumBox(a, b)`, `b.slab(points)`, `b.loft(stations[].at)`, `limb(root, target)`      | Points                                                         |
| `b.spike(base, dirOrTip, len, r)`                                                                      | Point, then a Direction (`len` number) or a Point (`len` null) |
| `b.part(geometry, color, { at, bone, frame, aim, dir, up })`                                           | Point, Joint, Frame, Point, Direction, Direction               |
| `b.extrude(outline, { at, x, y })`, `b.lathe(outline, { at, axis })`                                   | 2D outline, then a Point and Directions                        |
| `b.stick(geo, color, on)`, `b.sprout(name, on, ...)`                                                   | Frame (seated along its facing axis)                           |
| `b.cards(frames, texture, ...)`                                                                        | Frames (one card on each, standing along its facing axis)      |
| `b.ring(line, ...)`, `b.pose(joint, { about })`                                                        | Line                                                           |
| `surface.nearest/ray/around`, `aim`, `offset`, `lerp`, `mid`, `bezier/catmull/arc/spiral`              | Points and Directions                                          |

**Bone inheritance.** Geometry and joints built from an input that came from something built take that thing's bones:

- A spike on `sweep.at(t)` rides the tube there (both bones inside a joint's blend window).
- Lashes ringed around an eye ride the eye's bone.
- A rod from an eye to a joint rides the eye's bone (the first endpoint).
- A sweep of `bezier(hit, ...)` rides the hit's bone.
- An input made from nothing (a tuple, a `Vector3`, `frame()`/`line()` from literals) has no bone, and the geometry goes to the joint whose bone passes closest to it (a bone runs from a joint to each child joint and belongs to the parent).
- An explicit `bone:` always wins.
- Items handed to `ring` and `along` callbacks carry their bone, so callbacks don't pass `bone:`.
- `offset()`, `lerp()` and `f.local()` return plain `Vector3`s; use `f.moved(p)` for a derived point that keeps `f`'s bone.

Frames stay valid under `pose()`: each is stored relative to its bones.

**Skinning.** Tubes, lofts and membranes on a chain are one continuous mesh that bends smoothly at every joint: each vertex near a joint is shared by the two bones there, so bodies, necks, tails and legs don't crack or crease. Add `skin: "rigid"` for the old puppet style, one hinged piece per bone. Anything you place on a point takes that point's bones: a spot stuck on a bend bends with the skin, a horn on the head stays rigid on the head, and an explicit `bone:` always makes it rigid on that bone.

## Target

A creature module that:

- builds the skeleton first (`joint`, `chain`), then hangs geometry on it;
- states every position and direction once, in model space (+Y up, faces +Z, left is +X, meters), and derives the rest from handles (joints, parts, sweeps, hits, `chain.at(t)`, `sweep.at(t)`), so moving one point moves everything that depends on it;
- never calls `updateMatrixWorld`, `attach`, `worldToLocal`, `setFromUnitVectors` or `lookAt`, and never hand-tunes surface offsets or filler spheres.

## Requirements the SDK enforces or guarantees

- Static models may omit joints entirely: builder geometry then stays in model space under the untagged root group, with zero exported joints. Rigged models have exactly one root joint (the first `joint` without `parent`); a second one throws. Joint names match `/^[A-Za-z][A-Za-z0-9_]*$/` and are unique.
- Joints and everything above them are unscaled. Scale lives on meshes (`part({ scale })`, `region`).
- Every mesh sits under its heaviest bone. A mesh that follows several bones carries per-vertex weights (`skinIndex` / `skinWeight` attributes indexing `userData.skinBones`, at most 4 bones per vertex); the creature-lab harness exports them as they are. Everything else is rigid: every vertex on that one bone.
- A three.js mesh you build yourself rides the joint you add it to: `joint.add(mesh)`. One added straight to `b.root` rides the root joint.
- Materials: one shared `MeshStandardMaterial` per colour string (roughness 0.72, metalness 0.04). Painted parts share one material whose map is the paint sheet; textured parts and cards get one material per texture and tint, cut away where the texture is transparent (`alphaTest` 0.5).
- Deterministic: randomness only through an `rng` you pass (`rng(seed)` here, or `kit.rng(seed)`).
- You still own the lab's limits (1000 parts, 120k triangles with a 60k soft budget, 160 joints, 64 flat colours) and resting on y = 0. Textures and paints don't count as colours; they share one atlas (see "Paint, textures and cards"). Parts cost nothing below the limit: the lab merges every part into one mesh on export, so build each piece as its own part. Merging geometry by hand only matters near 1000 parts, and a merged piece is one part on one bone.

## Module

```ts
import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame, line } from "../src/frame";
import { aim, lerp, mid, offset, rng } from "../src/math";
import { arc, bezier, catmull, polyline, spiral } from "../src/path";
import { limb } from "../src/ik";
import { countershade, paint, spots, stripes } from "../src/paint";
import { svg } from "../src/texture";

export default function build() {
  const b = createBuilder({ name: "wyvern" }); // { detail } scales tessellation, see "Detail and budget"
  const hips = b.joint("hips", { at: [0, 1, 0] });
  // ...
  return b.root;
}
```

`src/index.ts` re-exports the whole SDK as one module, for apps that map a single import name to it.

**Colour.** Every shape takes `color`: a colour string or a paint. Without one, a shape takes the colour of the nearest part already built, measured from where it starts (its `at`, first point or path start), and the first part of a model is grey `#999999`.

Every helper copies its inputs and returns fresh vectors. `V3` is a literal `[x, y, z]` or `THREE.Vector3`; `PointInput`, `DirectionInput`, `FrameInput` and `PathInput` are the kinds above. Plain number arrays are Points and Directions wherever they come from: literals, variables, object fields (`spike.dir`) and `.map` results all type-check as they are, and a point list is a `number[][]`. A literal that isn't exactly 3 numbers throws, naming the call and the value.

## Frames

Every Frame has `at`, `quat`, `axis` (facing, unit), `weights` (the bones it moves with, heaviest first: one for a rigid point, two on a smooth bend, none for frames made from nothing), `bone` (the heaviest, or null), `local(p)` (a point near the frame, to model space), `dir(v)` and `moved(p)` (the frame shifted to a point, same orientation and bone).

`local` and `moved` take a point two ways:

- Words: model directions from the frame's point, in meters, whichever way the frame is aimed. `head.local({ forward: 0.3, up: 0.05 })` is 0.3 m toward the model's front and 0.05 m above the head joint; the words are `right`, `left`, `up`, `down`, `forward`, `back`, and `right` is the model's right (world −X).
- Numbers `[x, y, z]`: the frame's own axes, which turn with it (see the roll convention below). `hit.moved([0, 0.01, 0])` is 1 cm out along the hit's normal.

`moved` returns a Frame there. Pass it the point itself; `f.moved(f.local(q))` would apply the frame twice.

- `frame(at, dir, up?)` faces `dir` with roll from `up` (see `aim`); it takes `at`'s bones when `at` came from something built.
- `line(a, b)` faces from `a` to `b` and adds `length` and `end`; it takes `a`'s bones, else `b`'s.
- A `Joint`'s axis is its bone (+Y). A `Part` faces the axis it was aimed along (`aim`/`dir` with `axis`, default +Y); a stuck part faces the surface normal; a slab faces its polygon's normal. A `Sweep` converts to its start frame (+Y along the tube). A `Hit` faces its normal `n`. `chain.at(t)` faces the tangent (+Z = `normal`, +X = `binormal`). `sweep.at(t)` faces the outward surface normal `n` (+Z = `tangent`).

## Orientation: `aim` and the roll convention

`aim(dir, up?, axis = "y")` returns a `Quaternion` whose local `axis` points along `dir`. It is the only orientation helper, and joints, chains, sweeps, parts and `stick` all use it.

- Axis "y" with `up`: local +Z leans toward `up`.
- Axis "y" without `up` (the default for bones and tubes): local +X stays as close to the creature's right (world −X) as possible. In the mid-plane, a bone pointing forward has +Z up, down means +Z forward, up means +Z back, and backward means +Z down. Widths always run along world X. A bone pointing straight sideways falls back to +Z = world up.
- Axis "z" or "x": local +Y leans toward `up` (default world +Y), like `lookAt`.

So for a head joint aimed forward, `head.local([0, 0.3, 0.05])` is 0.3 ahead and 0.05 up: local +Y runs along the bone and +Z is up, so a forward head's numbers read [right, forward, up]. The words form `head.local({ forward: 0.3, up: 0.05 })` gives the same point without the axis order.

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
const head = b.joint("head", { at: neck.at(1), dir: [0, -0.15, 1], group: "head" }); // parent: neck.at(1)'s joint
const jaw = b.joint("jaw", { parent: head, at: head.local([0, 0.02, -0.06]), aim: head.local([0, 0.3, -0.1]) });
```

`b.joint(name, { parent?, at, aim?, dir?, up?, group?, role? })` returns a `Joint`. `aim` is a target point and `dir` a direction; bone +Y points along it. With neither, the joint keeps its parent's orientation. Without `parent`, the first joint is the root; later joints take `at`'s bone when it came from something built, else the nearest joint. A `Joint` is a Frame (its `bone` is itself) with `name`, `object` and `parent`.

- `joint.add(...objects)` adds three.js objects under `joint.object`, in the joint's local space as in three.js, and returns the joint; their meshes ride its bone.
- `joint.position`, `joint.rotation` and `joint.userData` are `joint.object`'s, relative to the parent joint as in three.js; the model-space position is `joint.at`. Turn joints with `b.pose`, which keeps skins and every handle on them in step.
- Wherever a joint is taken (`parent`, `bone`, `pose`), pass the `Joint`, its name, a `Chain` (its last joint) or `joint.object`.

`role` is one of `spine neck head jaw hinge tail leg arm wing digit tentacle fan`, and `joint`, `chain`, `ring` (default "fan") and `sprout` all take it. A role names a whole chain or joint: the hips or pelvis are the root or first `spine` joint; a hand, foot or hoof is the tip of its `arm` or `leg` chain (see `names` on `chain`); fingers and toes are `digit`; lids, wing cases and flaps are `hinge`. Roles feed the rig answer key (see "Rig answer key").

`b.chain(name, path, { parent?, up?, twist?, group?, count?, names?, role?, contact? })` returns a `Chain` of joints `${name}1..N`, or the names you give (`(i) => string` or an array; auto-riggers key on them).

- A chain has one joint per span between its points: joint i sits at its span start and aims at the next, and the last span ends at the path end.
- So a path of hip, knee and ankle points takes two names, `["hipL", "kneeL"]`; give one name more, `["hipL", "kneeL", "ankleL"]`, and the chain also gets a tip joint at the path's end (the hand, foot or hoof bone), aimed along the path's end tangent, child of the last span joint, last in `joints` and also in `chain.tip`.
- The default count is one joint per knot span; `count` resamples by arc length, and names follow `count` the same way. A `names` list that fits neither (spans, or spans plus a tip) sets the count itself: that many joints, spread by arc length.
- Roll starts from `aim(tangent, up)` and is parallel-transported, so it never flips.
- `twist` then rolls it about the path: a number is the total in degrees, spread evenly from start to end; `(t) => deg` sets it per t. Joints and chain sweeps both follow it (a pronated forearm, a twisting tentacle).
- A `Chain` has `joints`, `tip` (or null), `length`, `ts` (joint t's plus 1), `at(t)` returning a `ChainPoint` (`.at`, `.bone`, `.t`, `.tangent`, `.normal`, `.binormal`), `jointAt(t)` and `span(i)` returning `[t0, t1]`.
- `chain.at(t)` is in the current pose (see "Posing after building"); `chain.path` is the curve as built. `chain.nearestJoint(p)` is the joint whose bone segment passes closest to `p`.
- Tubes and membranes on a chain bend with its span joints; the tip joint carries what you attach to it. `role` and `contact` feed the rig answer key.

To root a chain mid-body (quadrupeds with a tail, serpents, centipedes), cut one curve into two chains from the same parent, then skin one tube over both so the body has no seam:

```ts
const body = catmull([tailTip, ..., rootPoint, ..., headEnd]);
const core = b.joint("core", { at: rootPoint });
const rootT = body.closestT(core.at);
const front = b.chain("front", body.slice(rootT, 1), { parent: core, count: 5 });
const back = b.chain("back", body.slice(rootT, 0), { parent: core, count: 7 });
b.sweep(body, radii, { bone: [back, core, front], color: SKIN }); // or b.loft(stations, { bone: [...] })
```

## Parts

`b.part(geometry, color, { bone?, frame?, at?, quat? | aim? | dir? (+ up?, axis?) | rotation?, scale?, group?, name? })` places a mesh in model space under its bone and returns a `Part`: a Frame at the geometry's origin and orientation, with `mesh`. The same call takes one object: `b.part({ geometry, color, at, bone })`. `part.position`, `part.rotation` and `part.scale` are its mesh's, relative to its bone as in three.js; the Part's frame keeps the placement it was built with.

- Every builder that makes meshes takes `name` and `group`. A mesh without `name` is named after what made it and its group, else its bone: `box.head`, `sweep.legL`, then `sweep.legL.2` for the next one there. The report, the preview questions (`--gap`, `--box`, `--bones`) and the GLB use these names; they stay the same when you edit other groups.
- It follows `bone` (rigid), else the bones of `at`/`frame` (on a smooth bend: both, blended), else the nearest joint to `at` (with no position at all: the root).
- `frame` places the geometry on a frame (its position, and its orientation unless another orientation option is given); `at` sets the position alone.
- Orientation priority is `quat`, then `aim`/`dir`, then `rotation` (XYZ degrees), then `frame`, then world axes.
- `axis` picks which geometry axis `aim`/`dir` points (default "y", the axis of three's cylinders and cones) and is the part's facing `axis`.

Geometry you built in model space (merged pieces, hand-built meshes) goes in with `at: [0, 0, 0]`, plus `bone` when it should ride a particular joint; without `at`, `bone` places the geometry's origin at that joint. `flat: true` renders the geometry with faceted normals (one normal per triangle), for the crisp low-poly look on three.js shapes; `b.stick` takes it too.

```ts
const eye = b.part(new THREE.SphereGeometry(0.035), DARK, {
  bone: head,
  at: head.local([s * 0.09, 0.07, 0.12]),
  dir: head.dir([s * 0.8, 0.5, 0.3]),
});
b.ring(eye, { count: 7, radius: 0.03, fromDeg: -75, toDeg: 75, tilt: 35 }, (lash) =>
  b.spike(lash, lash, 0.045, 0.006, { color: BONE }),
);
b.rod(eye, crest, 0.012, { color: BONE }); // from an eye to a joint, on the eye's bone
```

## Sweep

`b.sweep(source, radius, options?)` returns a `Sweep`. Use it for every tube: bodies, necks, tails, limbs, horns, tentacles, whiskers. The radius can also go in the options, `b.sweep(path, { radius: 0.05, color })`, and the same holds for `rod`, `capsule`, `spike` and `sprout`. These five also take the colour right after the radius, before the options: `b.rod(a, b, 0.02, BARK, { bone })`.

- `source` is a Path input (one mesh; its bones are `bone`, else the path's own bones when it was made from built inputs, else the joint nearest its start) or a `Chain`. For a path that runs through chains and joints (a loft body over a spine, or tail, hips, spine and neck on one curve), `bone: chain` or `bone: [tail, hips, spine, head]` skins it like a chain source: one mesh that bends at every listed joint. List them in any order; each chain may run either way along the path. `from`/`to` crop the source range and change nothing else.
- A `bone` list suits a path that runs along those chains. Each joint owns the path from where it projects onto it; joints that project past the path's far end own none of it and are left out, so a feather or fin swept along part of a longer chain keeps its tip on the last bone it reaches. A path that crosses a chain (a ray standing up from a spine) rides one bone: `bone: joint`.
- `radius` is `r`, `[r0, r1]` (linear), `number[]` (evenly keyed over the swept range, smooth), `(t) => r` or `(t) => [rx, ry]`. `rx` runs sideways (binormal) and `ry` along the frame normal. For boxes these are half extents. Every t is source t, the t of the path or chain you swept: radius and shift functions, colour functions, `bands`, sector ranges, twist and `sweep.at(t)`. A profile keyed at `chain.ts` or at curve knots therefore stays put when you sweep only part of the source, and sweeping `[0, a]` and `[a, 1]` with the same options gives the two halves of one tube.
- `shift` is `[x, y]` or `(t) => [x, y]` in the same axes as `[rx, ry]`: it moves the section centre off the path, so a heavy belly hangs below the spine while the bones stay on the spine line.
- `section` is `"circle"` (default, `sides` = 8 × `detail`, smooth), `"box"` or `{ ngon: n }` (faceted). `smooth` overrides the shading. Circles are circumscribed: flat faces sit exactly at `r`, top and bottom are flat, so a tube of radius r whose axis is at height r touches the floor. `detail` sets this tube's own tessellation (default sides, rings along it), see "Detail and budget".
- `caps` is `"round"` (default), `"flat"`, `"point"`, `"none"`, or `{ start, end }`. With round caps, a 2-point sweep is a capsule. `extend: d | [start, end]` continues the tube straight past its ends at the end radius (meters) before the cap.
- `skin` is `"smooth"` (default) or `"rigid"`.
  - Smooth: one continuous mesh; around each joint the rings blend the two bones either side over about ±1 local radius (at most 45% of either span), and corners of the path are rounded over the same distance, so the tube bends like skin.
  - Rigid: one piece per joint span, cut with round caps on both pieces; each cap stays inside the continuing tube's radius, so it is hidden while straight and fills the gap when the joint bends.
  - `overlap: k` (rigid only) instead extends each piece k × radius past the cut with a flat end.
  - Rigid point-array sweeps are split the same way at corners sharper than 20°, inside one mesh.
- `color` is a string or `(t) => string`; a colour function splits the tube exactly where the colour changes. `bands: [[tEnd, color], ...]` splits it at band edges. Colour pieces share their boundary vertices and weights, so they bend together with no gap.
- `sectors: [[fromDeg, toDeg, color], ...]` colours strips around the tube on the dorsal clock (0 = the side facing world up, 180 = belly, +90 clockwise looking along the tube; the clock stays continuous where the tube passes vertical, so a coil keeps its belly on one side).
  - Uncovered angles keep the piece colour.
  - Each sector is its own mesh per piece, sector edges have no walls, and neighbouring sectors share their edge vertices exactly.
  - This composes with bands and chain splits.
  - For countershading, use `sectors: [[-65, 65, DARK], [125, 235, CREAM]]`.
  - `[fromDeg, toDeg, color, fromT, toT]` limits a sector to that stretch of the tube (source t), so one sweep can carry a back stripe and belly on the body and full rings on the tail: `sectors: [[-65, 65, DARK, tagT, 1], [125, 235, CREAM, hipsT, 1]]` with `bands: [[tagT, WHITE]]` gives a fox's dark back, pale belly and white tail tip on one tube.
  - Sectors only need to avoid overlapping where their stretches meet.
- Sectors sit on that world-up clock, so `twist` doesn't turn them. A stripe that spirals round a tube is a paint on its surface coordinates (see "Paint").
- Path sources take `up` (start roll) and `twist` (total degrees or `(t) => deg`, as on `chain`). Chain sources use the chain's roll.
- Ring spacing adapts to curvature and twist (about 10° per ring) and to radius or shift change. Straight constant tubes use 2 rings.

`sweep.at(t, angleDeg = 0, lift = 0)` returns a `SweepPoint` frame on the built surface (on the same dorsal clock) at source t, with `t`, `n`, `tangent` and `radius`, with the tube's weights there (both bones inside a blend window).

- `sweep.from` and `sweep.to` are its swept range.
- `sweep.line(angleDeg, lift = 0)` returns the `Path` along the built surface at that clock angle, with knots at the bone cuts; closed tubes give closed lines. Use it as a membrane or sweep edge that lies on the skin (dorsal fins, manes, ridges).
- `sweep.meshes` lists the meshes, `sweep.bone` is the joint at its start, `sweep.frame` its start frame (what it converts to as a Point, Line or Frame) and `sweep.curve()` its centreline Path in the current pose.

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
b.along(neckTube, 5, (at) => b.spike(at, at, 0.12, 0.035, { color: BONE })); // each spike on its tube joint
```

These shorthands are each one call to `sweep`:

| Call                                            | Shape                                                                                                                                     |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `b.rod(a, b, r \| [r0, r1], opts?)`             | flat ends                                                                                                                                 |
| `b.capsule(a, b, r \| [r0, r1], opts?)`         | round ends                                                                                                                                |
| `b.spike(base, dirOrTip, len, r, opts?)`        | cone to a point; `len` number means direction (a frame gives its axis: `spike(hit, hit, len, r)`), `len` null means `dirOrTip` is the tip |
| `b.frustumBox(a, b, [w0, h0], [w1, h1], opts?)` | box section, full width × height, flat ends                                                                                               |
| `b.loft([{ at, w, h }, ...], opts?)`            | catmull through station centres, full width/height interpolated; `bone: chain` or `[chains and joints]` skins it to them                  |

A `frustumBox`'s ends are square to its a→b axis, so a tilted box standing on the floor dips one edge below it. Keep the axis vertical and lean the box with `shift`, or lift it.

`b.sprout(name, on, pathOrTip, radius, { count?, bury?, names?, twist?, role?, ...sweep options })` roots an appendage (limb, horn, tentacle, neck) on another volume at a Frame (usually a surface hit) and returns `{ chain, sweep }`.

- `pathOrTip` is a tip Point (straight out) or a Path; the frame's point is prepended when the path starts elsewhere.
- The first joint sits at the frame's point, parented to its heaviest bone (else the nearest joint), and `count` joints follow (default one per knot span).
- A single joint takes the sprout's own name (`b.sprout("hornL", ...)` makes joint `hornL`); more joints are `${name}1..N` unless `names` is given.
- With `count: 0` there are no joints (`chain` is null) and the tube rides on that bone.
- The tube's root continues `bury` (default: the root radius) back along its start tangent into the parent, so it never floats on a curved surface and no joint is wasted inside the body.

```ts
const hit = b
  .surface(skull)
  .around(skull.at)
  .at(s * 55, 40);
const coil = spiral(offset(hit, [0, -1, -0.3], 0.09), hit, [s, 0, 0], { turns: -s * 1.15, r1: 0.04, pitch: 0.08 });
b.sprout(`horn${side}`, hit, coil, [0.045, 0.01], { count: 0, color: HORN, caps: { end: "point" } });
b.sprout("tail", rump, catmull([rump, mid, tip]), [0.07, 0.03], { count: 2, names: ["tailBase", "tailTip"] });
```

## Surface and stick

`b.surface(targets)` takes meshes, `Part`s, a `Sweep`, a `Joint` (its meshes; for a joint that owns none, the blend-skinned meshes that bend with it), any other three.js object (every mesh under it, so `b.surface(b.root)` is the whole model) or nested arrays, and returns a `Surface` that queries the built triangles.

- `.nearest(p)` returns a `Hit`: a Frame facing the outward face normal `n`, with `mesh`, with the skin's weights there (interpolated on a blend-skinned mesh, else the mesh's bone).
- `.ray(origin, dir)` returns the first hit or null.
- `.around(center?).at(azimuthDeg, elevationDeg)` returns the outermost hit in that direction from `center` (default: bounding-box centre). Azimuth 0 is +Z, 90 is +X; elevation 90 is up.
- `.scatter(count, { rng?, minDist?, keepOut?, filter? })` returns up to `count` area-weighted hits, deterministic for a given `rng`. It rejects points buried inside other target meshes and tries at most `60 × count` candidates. `minDist` is the minimum spacing in meters within this call; nearby-point checks use a spatial grid, so dense coats keep the same sampling without repeatedly transforming every accepted hit.
- `.drape(path, { lift? })` pulls a path onto the built surface: every sample moves to its nearest surface point, then `lift` out along the normal. Knots and closedness carry over, and the path takes the weights of its first hit. Draw a rough loop around the body and drape it for a strap or collar, or drape a short curve for a mouth line or gill slit, then sweep it.
- `.loop(on, { dir?, lift? })` returns the path where a plane cuts the built surface: belts, collars, cuffs, bands, bandoliers, and rows to place studs, plates or feathers `along`.
  - The plane passes through `on`'s point and faces `dir`.
  - `dir` defaults to `on`'s facing axis when `on` is a Frame, so a joint cuts across its own bone (a belt round the hips, a girth round a quadruped's body, a cuff round a forearm), and to world up for a literal point.
  - When the plane cuts several loops (the torso and both arms), it takes the smallest loop around the point, else the nearest one.
  - The path starts at angle 0 as on `ring` (the direction closest to world up; world +Z when `dir` is vertical), runs counter-clockwise about `dir`, sits `lift` out along the surface and carries the average skin weights along it.
  - It is closed unless the surface is open there, and a plane that misses the surface throws.
  - `loop.slice(t0, t1)` takes an arc of it; `loop.slice(0.9, 1).concat(loop.slice(0, 0.1))` is an arc across the start.

`b.stick(geometry, color, on, { embed = 0.2, flow?, spin?, bone?, scale?, group?, name? })` seats a part on any Frame (a hit, a tube point, a ring item, a joint) and returns the `Part`. Local +Y follows the frame's facing axis (a hit's normal), and the part sinks by `embed` × its own height along it, so resizing the part needs no retuning. `flow` is the preferred surface direction for the part's +Z (scales, shingles), `spin` is degrees about the axis, and it takes the frame's weights (a spot on a bend bends with the skin) unless `bone` makes it rigid.

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
b.sweep(skin.drape(loop, { lift: 0.012 }), 0.018, { color: STRAP }); // weights: the draped path's first hit
const belt = skin.loop(hips, { lift: 0.02 }); // across the hips bone
b.sweep(belt, 0.02, { color: STRAP });
b.along(skin.loop(hips, { lift: 0.04 }), 12, (at) => b.part(new THREE.SphereGeometry(0.012, 6, 4), BRASS, { at }));
```

## Membranes and slabs

`b.membrane(edgeA, edgeB, { color?, thickness?, rows?, cols?, detail?, scallop?, skin?, split?, bone?, group?, name? })` skins between two edges (each a `Chain`, path or points), resampled by arc length.

- `thickness` defaults to 2% of the membrane's width (the mean distance between its edges).
- Chain edges are read in their current pose.
- `rows` defaults to 4 × `detail`.
- It returns closed, double-sided meshes.
- Smooth (default): one mesh whose vertices blend from edge A's bones to edge B's across the width, and between neighbouring joints along each chain edge.
- `skin: "rigid"`: one mesh per bone; with `split: "mid"` (default) cells nearer A go to A's joint at that t and cells nearer B go to B's, and `"a"` or `"b"` assigns everything to one edge.
- Path edges follow `bone`, which is a joint, or a Chain followed along its nearest point; without `bone`, the path's own bones, else the other edge's chain, else the nearest joint. A fin between `tube.line(0)` and a raised line then follows the spine.
- Every bone span boundary gets a column.
- `scallop` (a fraction of the length) pulls the trailing edge between the two tips inward.
- Run both edges in the same direction, from root to tip.

`b.slab(points, { color?, thickness?, bone?, group?, name? })` turns a roughly planar polygon (any Points) into a thin closed prism for fins, ears, leaves and plates, and returns a `Part` centred on it, facing its normal. Its `thickness` defaults to 2% of the narrower side of its outline. It follows `bone` (rigid), else the first built point's bones, else the nearest joint. Use it when the corners come from built things (hits, tube points); to draw a shape, use `extrude`.

```ts
b.membrane(finger1, finger2, { thickness: 0.02, color: WING, scallop: 0.18 });
b.membrane(finger3, [wrist, flankFront, flankBack], { thickness: 0.02, color: WING, bone: spine.joints[0] });
b.membrane(neckTube.line(0, -0.01).slice(0.05, 0.45), neckTube.line(0, 0.12).slice(0.05, 0.45), {
  thickness: 0.015,
  color: FIN,
  bone: neck,
});
```

## Outlines: extrude and lathe

Both take an outline: at least 3 corners `[x, y]` in meters, drawn in order around the shape (at most 512 after smoothing).

- The loop always closes; a last point repeating the first is dropped, and so is a point repeating the one before it.
- Mark a corner `[x, y, "sharp"]` to keep it pointed through smoothing.
- An outline held in a variable is fine as written; its type is `OutlinePoint[]` (`import type { OutlinePoint } from "../src/builder"`).
- A corner that isn't `[x, y]` or `[x, y, "sharp"]` throws, naming its index.
- An outline that crosses or touches itself throws, naming the two edges.
- Both return a `Part` and follow `bone` (rigid), else `at`'s bones, else the nearest joint.

- `smoothing: 0..3` cuts every unsharp corner into two, a quarter of the way along each neighbouring edge, per round. Few points plus smoothing 2 draws a leaf or petal. It throws when a cut corner would cross another edge, naming the corners; mark one "sharp" or lower it.

`b.extrude(outline, { at, x, y?, thickness, bevel?, smoothing?, detail?, color?, bone?, group?, name? })` pushes the outline into a flat slab whose silhouette is the drawing: fins, sails, blades, plates, leaves, feathers, ears, crests.

- The outline's origin sits at `at`; its +x runs along the model-space Direction `x` and its +y along `y` (default `[0, 1, 0]`, up). `x` is required: name the way the drawing runs, `[0, 0, 1]` for a side view drawn front to back, `[1, 0, 0]` for a front view drawn across the model's left, or the direction along a blade, wing or handle you laid out with other parts. Thickness runs along x × y, centred on the drawing.
- `thickness` is a number, or `[atLowest, atHighest]` for a linear taper from the outline's lowest y to its highest y. Either end can be 0 for a knife edge. Both faces stay flat. `depth`, three.js's name for it, is read as `thickness`.
- `bevel` rounds the front and back rims inward along a quarter circle, so the outline stays the silhouette. It is capped at half the thickness and shrinks until it fits sharp and concave corners. It is drawn in 3 × `detail` steps; one step is a plain chamfer.
- The returned Part's local x, y and z are the outline's x, y and the thickness axis: `fin.local([u, v, 0])` is a point of the drawing, and `fin.local([u, v, t / 2])` is on its front face. Build spots and ribs from it.
- Mirror a pair by mirroring the directions: `x: [s, 0, 0]`, or `x: [0, 0, 1], y: [s * 0.3, 1, 0]`. The outline stays the same.

`b.lathe(outline, { at, axis?, segments?, detail?, spin?, smoothing?, color?, bone?, group?, name? })` spins half a cross-section around `axis` (default `[0, 1, 0]`) through `at`: hats, domes, bells, collars, bottles, vases, buttons, beaks, turned legs and anything round whose profile doubles back, which a sweep can't draw.

- The outline's x is the distance from the axis and never negative; its y is the height along `axis`. For a solid, run from the axis out around the shape and back to it. For a shell (a bell, a hat brim), draw both walls so the loop has thickness.
- `segments` (3 to 64, default 12 × `detail`) is the steps around. Below 12 the sides shade flat: 6 gives a hex column, 4 a square spire. `spin` turns the first step by that many degrees.
- Profile corners sharper than 35° stay creased; gentler ones (and smoothed curves) shade smooth.

```ts
const sail = b.extrude(
  [
    [0, 0],
    [0.9, 0],
    [0.75, 0.25],
    [0.1, 0.55, "sharp"],
  ],
  { at: spine.at(0.2), x: [0, 0, -1], thickness: [0.03, 0.006], bevel: 0.006, smoothing: 2, color: SAIL },
);
b.stick(new THREE.SphereGeometry(0.03), SPOT, sail.moved(sail.local([0.4, 0.2, 0.015])));
for (const s of [1, -1])
  b.extrude(petal, { at: collar.local([s * 0.06, 0, 0]), x: [s, 0, 0], thickness: 0.01, bevel: 0.003, color: PINK });
b.lathe(
  [
    [0, 0],
    [0.32, 0],
    [0.32, 0.015],
    [0.14, 0.03],
    [0.13, 0.2],
    [0, 0.22],
  ],
  { at: head.local([0, 0.12, 0]), bone: head, smoothing: 1, color: FELT },
); // a wide-brimmed hat
```

## Paint, textures and cards

### Paint

Every `color` option also takes a **Paint**: a colour at each surface point, from its model-space position `p` and outward normal `n`.

- That covers sweeps, lofts, `part`, `stick`, membranes, slabs, `extrude`, `lathe`, and sweep `bands` and `sectors`.
- Reading `b.root` bakes every painted part into one shared texture at one texel density over the whole model, so a pattern keeps its size in meters and runs on across body, legs, tail and head when they share the paint.
- A part is painted where it stands when it is built, and the pattern stays on it through later poses.

The paints come from `src/paint`:

| Paint                                                            | Look                                                                                                                            |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `mottle(a, b, { size, contrast?, seed? })`                       | soft cloudy blotches about `size` across: mottled skin, lichen, stone, moss                                                     |
| `spots(base, spot, { size, amount?, rosette?, seed? })`          | spots about `size` apart, `amount` 0..1 (default 0.5) of cover; `rosette` rings them                                            |
| `stripes(base, stripe, { size, axis?, width?, wobble?, seed? })` | wavy, tapering bands across `axis` (`"x"`, `"y"`, `"z"` or a Direction; default `"z"`, so they ring a body): tiger, zebra, wasp |
| `patches(base, patch, { size, gap?, seed? })`                    | irregular patches split by `base` lines: giraffe, cow, tortoiseshell, cracked mud                                               |
| `scales(base, edge, { size, width?, seed? })`                    | outlined cells, each shaded a little differently: scales, plates, cobbles, bark plates                                          |
| `countershade(back, belly, { level?, soft? })`                   | `back` where the surface faces up, `belly` where it faces down (level −1..1, default 0)                                         |
| `gradient(a, b, from, to)`                                       | `a` at point `from` to `b` at point `to`: socks, tail tips, faded tops                                                          |
| `grain(a, b, { size, axis?, seed? })`                            | fine streaks along `axis` (`"x"`, `"y"`, `"z"` or a Direction; default `"y"`): wood, bark, reeds, hair                          |

- Every colour argument takes a colour string, `[r, g, b]` (sRGB, 0..1) or another paint, so paints nest. `spot`, `patch` and the `base` of `scales` also take a list: each cell gets one of them.
- `paint((p, n, s) => colour)` makes your own, and may return another paint (`p.y < 0.2 ? SOCK : coat`). Build them with `noise(p, size, seed?)` (smooth, 0..1), `cells(p, size, seed?)` (Worley: `{ d1, d2, id, center }`, with `d2 - d1` 0 on a cell border), `mix(a, b, t)` and `smoothstep(e0, e1, x)`. Read `p`, `n` and `s`; leave them unchanged. Typecheck rejects unused parameters, so name them with a leading underscore: `paint((_p, _n, s) => ...)`.
- `s` is the part's own surface coordinates at the point, for patterns that follow the shape rather than space: sweeps and lofts give `[t, deg]` (source t, and the dorsal clock angle of `sweep.at`: 0 faces world up, 180 the belly), so a stripe spiralling round a trunk or bands across a curled tail are one condition on `s`. `extrude` gives the outline's `[x, y]` in meters (rays on a fin), `lathe` `[height, deg]`, membranes `[along, across]` (0..1 from edge A's start), slabs `[x, y]` in meters in the polygon's plane, three.js geometries their `uv`, and anything else `[0, 0]`.
- The same seed gives the same field everywhere, so two parts with one paint continue each other.
- The paint sheet is 1024 texels wide, shared by every painted part at one density: a few millimetres a texel on a 1.5 m animal. `createBuilder({ paintSize: 2048 })` doubles it for fine weaves, stitches and hairline stripes (512 halves it). It doesn't change any geometry.

```ts
const coat = countershade(stripes(ORANGE, BLACK, { size: 0.09 }), CREAM, { level: -0.3 });
b.sweep(body, radii, { bone: [tail, hips, spine], color: coat });
b.sweep(legL, [0.07, 0.05], { color: gradient(coat, DARK, [0, 0.25, 0], [0, 0.04, 0]) });
b.part(new THREE.SphereGeometry(0.1, 16, 12), coat, { bone: head, at: head.local([0, 0.05, 0.1]) });
```

### Textures

`svg(markup, { size?, pixelated? })` from `src/texture` turns an SVG drawing into a texture. It is rasterised at `size` pixels on its longest side (default 256, up to 2048), with the aspect of its `viewBox`; SVG text renders too. Transparent pixels cut the surface away (below half opacity), so a stroke needs about 3 raster pixels of width to survive: a strand 1/80 of the drawing wide wants `size: 256`. The drawing's bottom edge is v = 0 and its left edge u = 0. Use one texture for many parts; each distinct texture (and tint) takes its own space in the atlas.

`pixelated: true` is for pixel art: the drawing is rasterised with crisp edges and magnified without smoothing, so each raster pixel shows as a hard square. Draw on the pixel grid (a `viewBox` of `0 0 16 16` with `size: 16`, one `<rect>` per pixel or run) so the squares are the ones you drew. The atlas has one sampler, so one pixelated texture makes the whole model's atlas, paint sheet included, magnify without smoothing.

- `b.cards(frames, texture, ...)`, below.
- `b.part` and `b.stick` take `texture:`, mapped by the geometry's own UVs. A drawing in colour shows its own colours whatever the part's `color`; a drawing only in greys (white to black) is tinted by the part's `color` string. Like every part, a textured part shows its front faces only; for a drawing seen from both sides, use a card.
  - `PlaneGeometry` and `CircleGeometry` face their +Z and show the whole drawing (a circle crops it to a disc), upright along +Y. Place one with `dir` and `axis: "z"` (plus `up` for its roll): a flat decal facing a direction.
  - A `BoxGeometry` shows the whole drawing on each of its six faces. A `SphereGeometry` wraps it round once (u round the equator from its seam, v from the bottom pole to the top), and a partial sphere (`thetaLength`) stretches the whole drawing over what it keeps.
  - A drawn face laid on another part sits a few millimetres off it; two surfaces at the same depth flicker into each other.
- Sweeps, lofts, `extrude`, `lathe`, membranes and slabs take paints.

### Cards

`b.cards(frames, texture | texture[], options)` roots one double-sided textured quad on each frame and returns the meshes, one per distinct texture. The frames can be hits from `surface.scatter`, `sweep.at` points, ring and along items, joints or `frame()`. A card's bottom edge (the drawing's bottom) sits on its frame, and the card stands along the frame's facing axis. Each card takes its frame's bones, so a coat of cards bends with the skin under it.

- `size`: `[width, length]` in meters, or one number for both.
- `lean` (degrees, default 0) tips the card from the facing axis toward `flow`: 0 stands straight out, 90 lies along the surface.
- `flow` (default `[0, -0.3, -1]`, back and down), flattened onto the surface: the way cards lean and curl. `(frame, i) => direction` gives each card its own (flight feathers fanning out, hair parting along a spine).
- A card's face looks along `flow`: with the default flow, standing cards face front and back and are seen edge-on from the side. Seen from downstream (from `flow`'s side, looking back), the drawing reads as drawn; `mirror: true` flips it left to right, for the other side of a body.
- `bend` (degrees, default 0) curls each card further toward `flow` from root to tip, one segment per 20° of curl (2 at least).
- `cross: true` adds a second card at right angles through each one, so a tuft reads from every side.
- `vary` (a share: 0.3 means 70% to 130% size), `spin` (± degrees about the facing axis) and `rng` randomise them. With a list of textures, `rng` picks one per card; list a texture twice to pick it twice as often.
- `color` tints the cards: one colour string, or a Paint read at each card's root.
- `sink` (default 0.1 of the length) roots each card that far back into the surface. `bone` makes them all rigid on one bone.
- Cards are shaded with their frame's facing axis as the normal, so they light like the surface they grow from. To lay a card flat and lit from above, give it a frame facing up (`frame(at, [0, 1, 0])`) and `lean: 90`.
- A card is 4 triangles flat and 8 per curl segment with `bend` (16 at `bend: 40`); `cross` doubles that. Parts count meshes, so a thousand cards of one texture are one part.
- `surface.scatter` spaces one set of points evenly. For finer cards in one region (a throat, a face), scatter that region on its own with a smaller `minDist`.

```ts
const tuft = svg(`<svg viewBox="0 0 32 64">...</svg>`, { size: 128 });
const hits = b.surface(bodyTube).scatter(600, { rng: rng(3), minDist: 0.02, filter: (h) => h.n.y > -0.3 });
b.cards(hits, tuft, { size: [0.03, 0.07], lean: 65, bend: 30, vary: 0.3, rng: rng(4), color: coat });
```

### Budget

The harness bakes the model into one mesh with one texture, the atlas: a block of flat colour cells, every chart of the paint sheet as its own tile (at the lowest resolution its paint survives, so a flat-coloured chart costs one texel), and every texture with its tint. It packs into a power-of-two square or 2:1 rectangle up to 4096 texels and shrinks tiles when they don't fit; the report prints the atlas size.

### Decals

`b.decal(target, texture, { at, dir?, up?, size: [w, h], segments?, lift?, roll?, mirror?, color?, bone?, name?, group? })` lays a drawing onto a curved built surface (a head, a flank) and returns the `Part`.

- `target` is anything `b.surface` takes.
- `at` is a point on or near the surface; a `Hit` also sets `dir` to its normal.
- `dir` is the way the drawing faces, out of the surface toward its viewer: `[0, 0, 1]` for a face looking forward, `[1, 0, 0]` on the model's left flank. A grid of `segments` quads (default 10 along the longer side) is projected onto the surface against it, `lift` (default 1.5 mm) off it, so the drawing reads undistorted from the front.
- `up` (default world +Y) sets the drawing's top, `roll` turns it by degrees counter-clockwise seen from the front, `mirror` flips it left to right (the other eye).
- Every vertex takes the skin weights of the point it lands on, so a decal across a bend bends with it; `bone` makes it rigid.

```ts
const eye = animeEye({ iris: "#27dccb" }); // kits/toon
for (const s of [1, -1])
  b.decal(head, eye, {
    at: head.local({ left: s * 0.09, up: 0.05, forward: 0.2 }),
    dir: [0, 0, 1],
    size: [0.1, 0.14],
    mirror: s > 0,
  });
```

## Distribution, IK, regions

- `b.ring(line, { count, radius?, fromDeg?, toDeg?, tilt?, joints?, name?, names?, parent?, group?, role? }, (item) => {}?)` places `count` frames on a circle around any Line (see "Rings and joint groups") and returns `{ joints, items }`. The callback is optional: `b.ring(line, options).items` hands the frames to `b.cards` or a loop.
- `b.along(chain | sweep | path, count, (at) => {}, { from?, to? })` places frames at the centres of `count` equal parts of `from`..`to` (default 0..1, a sweep's own swept range) and returns them: `chain.at(t)`, `sweep.at(t)` (dorsal surface point) or a `PathPoint` (`t`, facing the `tangent`, +Z the transported normal, with the path's bones).
- `limb(root, target, lengths, bends, { sole? })` returns the joint points `[root, ..., end]` of a limb whose segments have exactly `lengths` and whose end lands exactly on `target`.
  - Build the chain through them (one name per point gives the end its own tip joint) and put feet at `y = footRadius`.
  - `bends` gives one direction per inner joint, or one for all (alone or as a list of one), saying which way that joint points. Alternate them for digitigrade legs (knee forward, hock back); keep them the same for an even curl.
  - The limb lies in the plane of root, target and the first hint.
  - For 3 or more segments, the last one runs parallel to root→target (a vertical cannon under a hip) when that respects its hint and reach; otherwise every joint turns by the same angle.
  - With `sole: dir`, the last segment points exactly along `dir` (a toe or flat foot on the floor) and the rest solves to its heel.
  - With `sole`, `bends` needs one direction fewer, because `sole` sets the joint above the last segment.
  - Targets out of reach straighten the limb toward them. Two lengths is plain two-bone IK.
- `b.region({ at, scale = 1, quat?, bone? })` is an authoring Frame, not a scene node.
  - It rides on `bone` (default: `at`'s bones when it came from something built) and follows its later poses.
  - Its axes are the model's (+X left, +Y up, +Z forward) turned by `quat`, so without `quat` region units read like model space scaled about `at`; a joint's `local` axes follow its bone instead (see "Orientation").
  - It has `.p(localPoint)`, `.d(dir)`, `.s(length)`, `.q(quat?)`, plus `.part(...)`, which bakes region scale into mesh scale, and `.joint(...)`, which moves and rotates joints but never scales them.
  - Literal points and directions given to these are in region units; built inputs (joints, hits, parts) and anything `.p()`/`.d()` returned are already in model space and pass through, so `head.joint("jaw", { at: [0, -0.05, 0.1] })` and `head.joint("jaw", { at: head.p([0, -0.05, 0.1]) })` place the same joint.
  - `region.local(p)` is in meters, `region.p(p)` in region units. Resize a head by editing one number.

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

## Rings and joint groups

`b.ring(line, options, (item) => {})` places `count` frames on a circle of `radius` (default 0) around any Line: a joint's bone, an eye's gaze, a horn, a hit's normal, a tube point, `line(a, b)`, `frame(at, dir)` or a plain `{ at, axis }`.

- Angle 0 is the direction closest to world up (world +Z when the line is vertical) and angles run counter-clockwise about the line's axis.
- `fromDeg`..`toDeg` defaults to a full turn with even spacing; a partial range puts items on both ends.
- `tilt` leans every item that many degrees toward the line's direction, which makes cones (quill rings, a swept-back frill).
- Each item is a `RingItem` frame with `i`, `t` (0..1), `outward` (= its facing axis; +Z leans toward the line's direction) and a `bone`: the line's bone, or its group joint.

`joints: k` (with `name`, or `names`) creates k group joints, each owning a contiguous run of items, so the joint count is a number you choose: 24 train feathers cost 6 bones.

- They hang under `parent`, else the line's bone, else the nearest joint.
- Each sits `radius` out along its run's centre direction, +Y along it, +Z toward the line's direction; posing one by +deg about its local X lifts its run toward the line's direction.
- The tradeoff comes from rigid skinning: when group joints rotate apart, neighbouring items on different joints separate in steps.
- With 3 to 5 items per joint, moderate poses still read as one fan; `joints: count` gives every item its own joint.

```ts
const train = b.ring(
  frame([0, 0.62, -0.3], [0, 1, 0]), // a made-up vertical line behind the rump
  { count: 24, fromDeg: 125, toDeg: 235, tilt: -8.5, joints: 6, name: "train", parent: hips, role: "tail" },
  (feather) => b.sweep(bezier(feather, bend, offset(feather, feather, 1.05)), [0.012, 0.005], { color: GREEN }),
);
for (const joint of train.joints) b.pose(joint, { axis: joint.dir([1, 0, 0]), deg: 72 }); // 6 joints raise 24 feathers
const band = b.ring(front.at(0.5), { count: 8, radius: 0.16 });
b.sweep(catmull(band.items, { closed: true }), 0.025, { color: TIP }); // a collar on the neck's joint
b.pose(crest, { about: line(eyeR, eyeL), deg: -25 }); // hinge a crest about the line through both eyes
```

## Posing after building

`b.pose(joint, rotation)` rotates a joint, with everything under it.

- It sets a new rest pose (open a jaw, raise a tail, fold a ring's joint group) without rebuilding.
- `rotation` is in model space: about the joint's own position, a `Quaternion`, `{ axis, deg }` (right-hand rule; `axis` is any Direction, so a frame's facing axis works), or `{ dir }` / `{ aim }` for the smallest swing that points the bone (+Y) that way; about any Line in space, `{ about, deg }`, a made-up hinge (the joint's position swings around it too).
- With `{ axis: [1, 0, 0], deg }`, positive degrees tip a forward-pointing bone down (open a jaw) and lift a backward-pointing one (raise a tail).

Every handle stays valid afterwards, and anything built later lands in the new pose:

- `joint.at`, `quat`, `local()` and `dir()` read the scene.
- Every other Frame (parts, hits, tube and chain points, ring and along items, regions, `frame()`/`line()` results with bones) is stored relative to its bones, blended when it has two.
- Blend-skinned meshes are re-deformed from their weights.
- `chain.at`, `sweep.at`, `sweep.line` and `sweep.curve()` map their build-time data through each owning joint's motion since it was captured.
- Surfaces re-read their meshes on the next query after a pose.
- Sweeps and membranes built on a chain after a pose follow the posed chain.

## Detail and budget

The look is low-poly: facets are part of it, and a part needs only enough segments to read as its shape at the size it is seen. A 2 cm eye is a 6 × 4 sphere, a horn or toe takes 6 to 8 sides, and paints, textures and cards carry the fine detail.

- **Per shape.** `sides` on a tube, `segments` on a lathe, `rows`/`cols` on a membrane, `smoothing` and `bevel` on an extrude, and the segment arguments of three.js geometries set the counts directly. Every shape also takes `detail`, a multiplier on the SDK's defaults for that shape alone: `sweep`, `loft`, the tube helpers, `sprout`, `membrane`, `extrude`, `lathe` and `cards`.
- **Whole model.** `createBuilder({ detail })` scales every default: circle sides (8 × detail), lathe steps (12 × detail), membrane cells, bevel steps, card curl segments and the radius tolerance. `b.segments(n, detail?)` gives `max(3, round(n × detail))` for your own geometry.
- **Rings along a tube** come from its shape: one ring per step round the section (360° / sides, 45° at most) of bend or roll, more where the radius or `shift` changes or where a thin tube would cut the corner of its path, up to three at each joint of a smooth-skinned tube (the edges and middle of the bend), and never closer together than about the edge length round the tube. Fewer sides therefore also means fewer rings.
- **The snap report** lists "Fine meshes": the parts whose mean triangle edge is under 1/150 of the model's diagonal, most triangles first, named by `name` (or the default name, see `b.part`) with bone and group. Cards and other cut-out parts are left out.

## Rig answer key

Reading `b.root` writes `root.userData.rig`, evaluated in the current pose. The render harness (`harness/`) copies it into the report JSON and the rigged GLB's extras (`creatureLab.rig`), so auto-riggers can be scored against it.

```ts
{
  version: 1,
  chains: [{ name, role, side, joints: string[], contact?: [x, y, z] }], // chains with a role
  joints: [{ name, role, side, hinge?: [x, y, z] }],                      // joints with a role
  rings: [{ name, role, side, pivot, axis, joints: [{ joint, items }] }], // every ring with joints
}
```

- `role` values and their meaning are under "Skeleton".
- `side` is derived: "L" when every joint sits at x > 0 (the creature's left), "R" when every joint sits at x < 0, "C" otherwise.
- A `leg` records `contact`, which defaults to the chain tip (the `limb` target). Pass `contact` for the floor point under a foot.
- `jaw` and `hinge` joints (lids, wing cases, flaps) record `hinge`, the bone's local X in model space. With the default roll it runs across the body.
- Rings with joints always record their group joints and item counts.

## Non-goals

Auto weights for plain meshes, a mirroring helper, grid/row helpers, a ground-shift helper, auto-merge batching, repeating (tiled) textures and UV-mapped images on SDK shapes (paint those). Mirror with `for (const s of [1, -1])`.


## Conventions

The behaviours and conventions to know before building with the SDK. Each answer is checked against `src/`. The API reference is [`api.md`](api.md).

## Handedness and frames

- Model space is +Y up, the model faces +Z, and its left is +X. A viewer facing the model sees its left (+X) on their right.
- With the default roll, local +X of every SDK frame (joints, chain points, hits, parts aimed along "y") points as close to the model's **right** (world −X) as it can. So `head.local([0.1, 0, 0])` on a head aimed forward is 10 cm to the model's right, and in `for (const s of [1, -1])` over `head.local([s * x, y, z])`, `s = 1` is the right side.
- Where local +Z points depends on where the frame's +Y points: forward → +Z up; down → +Z forward; up → +Z back; backward → +Z down; straight sideways → +Z world up. So `joint.local([x, y, z])` reads [right, along the bone, +Z]: on a head or snout joint aimed forward that is [right, forward, up], on a leg joint aimed down [right, down, forward].
- `hit.local([x, y, z])`: y is out along the normal `n`. On the front, top or back of a body, x runs toward the model's right and z runs along the surface (up on a front hit, back on a top hit). On a side hit (n ≈ ±X) the fallback applies: z is world up and x runs forward on the left side (n = +X) and backward on the right. `hit.moved([0, d, 0])` is `d` out along the normal.

| Handle             | Where it sits        | +Y (its `axis`)    | +Z                                | +X           | Fields                                                       |
| ------------------ | -------------------- | ------------------ | --------------------------------- | ------------ | ------------------------------------------------------------ |
| `Joint`            | at the joint         | along the bone     | default roll (above)              | model right  | `.at`, `.name`, `.parent`, `.object`                         |
| `b.region`         | at its `at`          | model up           | model forward                     | model left   | `.p()`, `.d()`, `.s()`, `.q()` (axes turned by `quat`)       |
| `chain.at(t)`      | on the centreline    | tangent            | transported `normal`              | `binormal`   | `.at` (point), `.bone` (joint), `.t`, `.normal`, `.binormal` |
| `sweep.at(t, deg)` | on the built surface | outward normal `n` | `tangent`                         | n × tangent  | `.at`, `.n`, `.tangent`, `.radius`, `.t`, `.bone`            |
| ring item          | on the circle        | `outward`          | leans toward the line's direction | —            | `.i`, `.t`, `.outward`, `.bone`                              |
| `Hit`              | on the built surface | `n`                | default roll                      | default roll | `.at`, `.n`, `.mesh`, `.bone`                                |

A `ChainPoint` has no `.joint` or `.position`; read `.bone` for the joint and `.at` for the point. `b.spike(p, p, len, r)` stands along each handle's +Y: along the chain on a chain point, straight out of the skin on a sweep point or hit.

**Angles around a line** all turn the same way: right-handed about the direction of travel, which is clockwise seen looking along it. On a tube running toward +Z, 0 is up and 90 is −X.

- `sweep.at(t, deg)`, `sweep.line(deg)`, `sectors` and paint `s[1]`: 0 is the side facing world up. On a vertical stretch 0 is the tube's normal side (back on a tube running up, front on a tube running down), kept continuous along the whole path.
- `b.ring(line)`: 0 is the direction closest to world up; on a vertical line it is world +Z (front).
- `b.lathe` paint `s[1]`: 0 is the lathe frame's local +Z, 90 its local +X. On the default upright axis that is 0 = back (−Z), 90 = the model's right (−X), 180 = front, 270 = left.

## Placing geometry with `b.part`

- `b.part` takes `(geometry, color, options)` or the same as one object, `{ geometry, color, ...options }`. Give every part its `color`; a shape left without one takes the colour of the nearest part already built (grey `#999999` for the first part of a model).
- The geometry's origin goes to `at`, else to `frame`'s point, else to the bone's joint. With `bone` and no `at`, geometry you already built in model space lands shifted by the joint's position.
- For geometry whose vertices are already in model space (translated, merged), pass `at: [0, 0, 0]` together with `bone`, and no orientation option:

```ts
b.part(merged, BRASS, { bone: head, at: [0, 0, 0] }); // vertices stay exactly where you put them
```

- Pair `at: [0, 0, 0]` with `bone`: without `bone`, the part goes to the joint nearest the model origin.
- A mesh you make with `new THREE.Mesh` goes on a joint with `joint.add(mesh)`. Its position and rotation are then in the joint's local space (the joint's axes, see the table above), as under any three.js parent. A mesh added straight to `b.root` stays in model space and rides the root joint.
- `part.position`, `part.rotation` and `part.scale` are the part's mesh's, relative to its bone, as under any three.js parent. `joint.position` and `joint.rotation` are the joint group's, relative to its parent joint; turn joints with `b.pose`.

### One part per bone and colour

Every mesh counts as a part (limit 1000). Many small static pieces on one bone with one colour belong in one part: place each copy in model space, merge, and add the result once.

```ts
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
const studs = rivets.map((p) => new THREE.SphereGeometry(0.01, 6, 4).translate(p.x, p.y, p.z));
b.part(mergeGeometries(studs), BRASS, { bone: body, at: [0, 0, 0] });
```

`mergeGeometries` needs every input to carry the same attributes and to be all indexed or all non-indexed (three.js geometries are indexed); otherwise it returns null. Group by bone, colour (or paint) and texture: one merged part per combination.

## Tube sections and radius

- The radius follows the path or endpoints, `b.rod(a, b, 0.02, { color })`, or goes in the options as `radius`: `b.rod(a, b, { radius: 0.02, color })`. Both forms work for `sweep`, `rod`, `capsule`, `spike` and `sprout`, and so does a colour right after the radius: `b.rod(a, b, 0.02, BARK, { bone })`.
- `section: { ngon: n }` puts a **vertex** on the tube's normal side, at exactly `r`. Its flat faces sit at `r · cos(180°/n)`, so they dip `r · (1 − cos(180°/n))` inside the radius: 29% for 4, 19% for 5, 13% for 6, 8% for 8. An even ngon also has a vertex opposite; an odd one has a flat face there.
- `sides: n` (a circle, optionally `smooth: false`) puts a **flat face** on the normal side, at exactly `r`; its vertices reach `r / cos(180°/n)`. An even count also has a flat face opposite, so a tube of radius r whose axis is at height r rests flat on the floor; an odd count has a vertex opposite.
- The normal side is the frame's +Z (see the table above): up on tubes running forward or sideways, front on tubes running down, back on tubes running up, down on tubes running backward. `up:` on a path sweep sets it.

| Section (horizontal tube, radius 0.1) | top             | bottom          | sides           |
| ------------------------------------- | --------------- | --------------- | --------------- |
| `sides: 4`                            | face at 0.100   | face at 0.100   | face at 0.100   |
| `sides: 5`                            | face at 0.100   | vertex at 0.124 | 0.118           |
| `{ ngon: 4 }`                         | vertex at 0.100 | vertex at 0.100 | vertex at 0.100 |
| `{ ngon: 5 }`                         | vertex at 0.100 | face at 0.081   | 0.095           |
| `{ ngon: 6 }`                         | vertex at 0.100 | vertex at 0.100 | face at 0.087   |

- `radius: [r0, r1]` is a linear taper from the start to the end of the swept range, never an ellipse. An ellipse is a function returning a pair: `() => [0.2, 0.1]` is 0.2 sideways (binormal) by 0.1 along the normal; `(t) => [rx(t), ry(t)]` varies it. `number[]` with three or more keys is a smooth taper over the swept range.

## Ends of tubes

- `caps: "round"` adds a dome of the end radius beyond the path end; `caps: "point"` adds a cone whose tip sits one end radius (the larger of rx, ry) beyond the path end. A tube whose end radius is 0 (`[r, 0]`, `b.spike`) ends exactly at the path end with either cap. For a point that lands exactly on a target, taper the radius to 0 or end the path one end radius short.
- `extend` continues the tube straight past the end at the end radius; the extension carries the end's `t` in paints.
- Closed paths (`closed: true`, swept whole): where the path's end meets its start smoothly (within 20°), the tube is welded into a loop with no caps. Where the seam is a corner (a closed polyline), both ends get round caps that overlap at the corner.

## Paint surface coordinates `s`

A paint `(p, n, s) => colour` gets `p` (model-space point, in the pose where the part was built), `n` (unit outward normal) and `s`, the part's own coordinates. Each texel reads `s` interpolated across its triangle.

| Shape                                    | `s`                                                                                                                                           |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| sweep, loft, rod, capsule, spike, sprout | `[t, deg]`: source t (the t of the path or chain you swept), and the dorsal clock angle (0 = world up, 90 = clockwise looking along the tube) |
| `extrude`                                | `[x, y]`: the outline's coordinates in meters, on the faces **and** the side walls                                                            |
| `lathe`                                  | `[height, deg]`: the outline's y in meters, and the angle round the axis (see "Angles around a line")                                         |
| `membrane`                               | `[along, across]`: 0..1 along the edges from their start, 0 at edge A to 1 at edge B                                                          |
| `slab`                                   | `[x, y]`: meters from the polygon's centre in its plane, y leaning toward world up                                                            |
| `part`, `stick` (three.js geometry)      | the geometry's `uv` (0..1)                                                                                                                    |
| geometry without `uv`                    | `[0, 0]`                                                                                                                                      |

### Sweeps and lofts

- `deg` sits on the world-up clock, like `sectors`. `twist` rolls the section but leaves the clock where it is: a twisted tube paints exactly like an untwisted one. A spiral stripe is a condition on both coordinates: `(((s[1] - 720 * s[0]) % 90) + 90) % 90 < 20` draws four stripes that each wind twice round the tube.
- On a tilted tube 0 is its most upward side; through vertical stretches the clock stays continuous, so a coil keeps its belly on one side.
- Round and point caps take the end's `t` on every vertex (`from` or `to`, usually 0 or 1) and the clock angle round the axis. A pattern keyed to `t` therefore stops at the cap and the whole dome takes one colour. To run a pattern over the tip, key it to the distance along the end tangent:

```ts
const end = path.at(1);
const T = path.tangentAt(1);
const tipBands = paint((p) => (Math.floor((p.clone().sub(end).dot(T) + 1) / 0.04) % 2 ? DARK : PALE));
```

`gradient(a, b, from, to)` does the same projection for a soft blend (a dark tail tip: `gradient(COAT, DARK, path.at(0.8), path.at(1))`).

- Closed sweeps: t runs 0 → 1 from the path's start round to the start again. In the last ring gap before the start, `s[0]` is interpolated from about 1 back down to 0, so a pattern keyed to `t` shows a smeared band there. Key rims, collars and straps to `deg` or to `p`, or place the path's start where the smear is hidden.

### Extrude walls and faces

The side walls sit on the outline, so a wall texel reads the same `[x, y]` as the edge of the face it borders, and a pattern in `s` runs straight across the wall. Tell them apart by the normal: the faces' normal is along the thickness axis `x × y`, the walls' normal is square to it.

```ts
const thick = new THREE.Vector3(...X).cross(new THREE.Vector3(...Y)).normalize(); // the directions you pass as x and y
const fin = paint((_p, n, s) => (Math.abs(n.dot(thick)) < 0.5 ? RIM : s[1] > 0.1 ? TIP : BASE));
```

### Mirrored extrudes

The part's local +z (its facing `axis`, the thickness direction) is `x × y`. Mirroring one of the two directions flips it relative to the mirrored side:

- `x: [s, 0, 0]` (outline drawn along X, y up): +z is world +Z for `s = 1` and world −Z for `s = −1`.
- `x: [0, 0, 1], y: [s * 0.3, 1, 0]`: +z points toward world −X on both sides, so it is the outer face on the right and the inner face on the left.

Pick the face from the axis and the direction you want it to face. For fins standing out sideways, `const out = fin.axis.dot(new THREE.Vector3(s, 0, 0)) > 0 ? 1 : -1; fin.local([u, v, (out * t) / 2])` is on the face pointing away from the mid-plane on both sides.

## Surface placement

`surface.scatter(count, { minDist, rng, keepOut, filter })` places up to `count` hits with spacing measured in model-space meters within that call. It tries at most `60 × count` candidates, so tight spacing or a small filtered region can return fewer hits. The SDK indexes accepted positions for nearby-point checks; builders can request dense fur or foliage directly. Returned hits remain live frames that follow later `b.pose()` calls, and a new scatter has its own spacing set.

## Cards

A card stands on its frame: its root (the drawing's bottom edge, v = 0) sits on the frame point and it grows along the frame's facing axis. `flow` is flattened onto the plane square to that axis; if it is parallel to the axis, −Z is used (then +X).

- **Facing.** Upright cards (`lean: 0`) lie in the plane of the facing axis and the card's width, and face along `flow`. With the default flow (`[0, -0.3, -1]`) on an upward frame, standing cards face front and back and are edge-on from the side.
- **Which side reads unmirrored.** Seen from downstream (from the side `flow` points to, looking back), the drawing reads as drawn. From upstream it is mirrored. `mirror: true` swaps the two.
- **`lean`** (degrees) tips the card from the facing axis toward `flow`: 0 stands straight out, 90 lies along the surface pointing downstream, 180 points back along the axis. Negative values lean upstream.
- **`bend`** curls each card further in the lean direction from root to tip: positive curls toward `flow`, negative away from it.
- **`sink`** (default 0.1) moves the root back along the card's starting direction by that share of its length (into the surface for a standing card, upstream along it for a flat one), then out along the facing axis by 2% of the length.
- **`cross: true`** adds a second card through the same spine, turned 90° about it.
- **Lighting.** Every card vertex takes the frame's facing axis as its normal, on both sides. A card on a frame facing down shades like the underside of something: dark.
- **Hanging cards** (tassels, icicles, moss): put the frame at the attachment point facing **up** and use `lean: 180`. The card hangs straight down and shades like an upward surface. Seen from downstream it shows the drawing upside down (root edge on top), not mirrored.

```ts
b.cards(
  knots.map((p) => frame(p, [0, 1, 0])),
  tassel,
  { size: [0.03, 0.12], lean: 180, flow: [0, 0, 1] },
);
```

- **Flat, lit from above** (lily pads, fallen leaves, floor decals): frame facing up and `lean: 90`. The card lies along `flow`, the drawing's top toward `flow`. Seen from above it is mirrored, so add `mirror: true`.

```ts
b.cards([frame([0.3, 0.001, 0.2], [0, 1, 0])], leaf, { size: 0.12, lean: 90, flow: [1, 0, 0], mirror: true });
```

- `color` tints cards with one colour, or reads a Paint once at each card's root (one colour per card).

## Textures

- A textured `part` or `stick` shows its **front faces only**: from behind, a `PlaneGeometry` is invisible. For a drawing seen from both sides, use a card. A drawing in colour keeps its own colours; a drawing only in greys takes the part's `color` string as its tint.
- `PlaneGeometry` and `CircleGeometry` face their local +Z and show the whole drawing upright along +Y. Place one with `dir` and `axis: "z"`: `b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", { at, dir: [0, 0, 1], axis: "z", texture })`.
- `BoxGeometry` shows the whole drawing on each of its six faces.
- `SphereGeometry` wraps the drawing round once: its seam is at local −X, u = 0.25 at +Z, the drawing's middle (u = 0.5) at +X, v from the bottom pole to the top, unmirrored from outside. Turn the drawing's middle to face front with `rotation: [0, -90, 0]`. The front half of the sphere shows only the middle half of the drawing, so draw it twice as wide as it should look.
- `svg(markup, { size })` rasterises at `size` pixels on the longest side, clamped to 8..2048: a 4-pixel drawing is rasterised at 8, each drawn pixel becoming 2 × 2.
- Pixels below half opacity are cut away. A stroke's raster width is `strokeWidth × size / viewBoxLongestSide`; keep it at 3 raster pixels or more (a 1-unit stroke in a `0 0 64 64` viewBox wants `size: 192`). Pixel art with `pixelated: true` keeps single pixels drawn as `<rect>`s on the grid.

## Bounding boxes

SDK meshes hang under their bone's joint, with vertices stored in that bone's local frame; tubes over several bones are re-deformed on the CPU after each pose. `new THREE.Box3().setFromObject(obj)` transforms each mesh's local bounding box by its bone and boxes the result, so on any rotated or posed bone it returns a box that is too large (measured: 0.28 m past the true front of a posed tail tube).

Read true bounds with the precise flag, which visits every vertex:

```ts
const box = new THREE.Box3().setFromObject(b.root, true); // exact, in the current pose
```

For a contact point, ask the built surface instead of a box: `b.surface(foot).ray([x, 1, z], [0, -1, 0])` is the first hit straight down, and `sweep.at(t, 180)` is the underside of a tube.

## IK

`limb(root, target, lengths, bends)` returns a chain that ends exactly on `target` when it can reach. When the target is farther than the summed lengths, it returns the limb stretched straight toward the target, ending short of it, without an error. Check the reach when a foot must be planted:

```ts
const pts = limb(hip, foot, [0.3, 0.3], [0, 0, 1]);
if (pts[pts.length - 1].distanceTo(vec(foot)) > 1e-3) throw new Error("leg too short for its foot");
```

## Rig answer key

A chain's or joint's `side` is derived from the x of its joints when `b.root` is read: "L" when every joint is at x > 1 mm, "R" when every joint is at x < −1 mm, "C" otherwise. Start a limb chain off the mid-plane (its first joint at the shoulder or hip socket, not at x = 0), or it records "C".

## Paint sheet and atlas

- `createBuilder({ paintSize })` takes 512, 1024 (default) or 2048; any other value throws. It is the paint sheet's width in texels; the sheet's height is trimmed to what the painted parts use.
- Texel density follows the painted area: about `sqrt(0.7 · paintSize² / total painted area)` texels per meter, at most 4000. Doubling `paintSize` halves the texel size; painting more surface makes every texel larger.
- The exported atlas is the smallest power-of-two square or 2:1 rectangle from 256 × 256 to 4096 × 4096 that holds the flat-colour block, every texture (each with an 8-texel gutter on every side) and the paint sheet's charts, each packed as its own tile. The empty space of the sheet is left out.
- Each chart is stored at the lowest resolution its paint survives: halved while every texel the model samples stays within 2/255 of the full-resolution bake, so a flat-coloured chart costs one texel and a smooth gradient a fraction of its area, while fine detail (stripes, text, grain) keeps every texel. A chart at full resolution keeps the 4 texels of padding it has on the sheet; a smaller one gets a 4-texel gutter.
- Tiles are packed with MaxRects, turned a quarter where that fits better. When everything does not fit in 4096 × 4096, every tile, the charts included, is halved until it does. The snap report prints the atlas size.

# Style kits

Kits sit on top of the SDK and carry a look: their helpers are the tested way to get it. Import a kit from `"agentic-3js-builder/kits/<name>"`, e.g. `import { cel, INK } from "agentic-3js-builder/kits/toon";`. `glow` makes surfaces self-lit in any style.

## Kit: clockwork

# Clockwork kit

`kits/clockwork.ts` is for clockwork, steampunk and machine builds: automata, brass animals, gearboxes, carousels,
clocks. It gives you toothed gears as real geometry and as drawings, gear trains whose teeth sit in each other's gaps
and that turn together on their own joints, metal paints and riveted plating, a pressure gauge drawing and a coil-spring
path.

```ts
import {
  coil,
  gaugeTexture,
  gearGeometry,
  gearSize,
  gearTexture,
  gearTrain,
  metal,
  panelled,
  TINT,
} from "agentic-3js-builder/kits/clockwork";
```

Everything here is in meters and model space, like the rest of the SDK.

## Metal paints

### `metal(kind, options?) → Paint`

`kind` is `"brass" | "gilt" | "bronze" | "copper" | "steel" | "blued" | "iron"`. The paint drifts between the metal's
dark and light tone with fine streaks, darkens in tarnish blotches, gathers verdigris on faces turned down and away from
the light, and takes a bright sheen on up-facing surfaces. `"blued"` is heat-tempered steel drifting through straw,
purple and blue.

| Option      | Meaning                                                                  |
| ----------- | ------------------------------------------------------------------------ |
| `polish`    | 0..1, sheen on up-facing surfaces (each kind has its own default)        |
| `tarnish`   | 0..1, dark oxidised blotches                                             |
| `verdigris` | 0..1, blue-green patina patches on down-facing faces (default 0)         |
| `size`      | size of the broad colour drift in meters (default 0.07); blotches follow |
| `seed`      | noise seed; parts with one kind and seed continue one field              |

```ts
const BRASS = metal("brass");
const OLD_BRASS = metal("brass", { tarnish: 0.7, verdigris: 0.6, polish: 0.1 });
const GILT = metal("gilt");
const COPPER = metal("copper", { verdigris: 0.4 });
const BLUED = metal("blued");
const IRON = metal("iron");
```

Make one paint per look at module level and reuse it, so parts that share it continue one pattern.

### `panelled(base, options?) → Paint`

Riveted plating over any colour or paint: dark 2.5 mm seams on a grid laid on the dominant face direction (side, top or
front), a bright bevel beside each seam and a row of round rivet heads along it. It works on boxes, lofts, sweeps and
lathes alike.

| Option   | Meaning                                                   |
| -------- | --------------------------------------------------------- |
| `size`   | panel width in meters (default 0.13)                      |
| `aspect` | panel height as a share of its width (default 0.7)        |
| `rivets` | rivet spacing in meters (default 0.03); 0 for plain seams |
| `seam`   | seam colour (default `INK`)                               |

```ts
const HULL = panelled(metal("iron"), { size: 0.12 });
b.loft(stations, { bone: [tail, hips, spine], color: panelled(metal("copper", { verdigris: 0.5 }), { size: 0.1 }) });
```

`INK` (engraving and seam brown-black) and `GLINT` (bevel and rivet highlight) are exported as `Rgb` for your own paints.

## Gear shape

A gear is described by a `GearShape`:

| Field        | Meaning                                                                            |
| ------------ | ---------------------------------------------------------------------------------- |
| `teeth`      | tooth count, 8 or more                                                             |
| `module`     | meters; pitch radius = teeth × module / 2. Give `module` or `radius`               |
| `radius`     | pitch radius in meters (the circle two meshing gears roll on)                      |
| `thickness`  | face width along the axle (default 2 × module)                                     |
| `toothDepth` | 0.5..1 share of standard depth (addendum 1 module, dedendum 1.25), default 1       |
| `bore`       | radius of an axle hole through the middle                                          |
| `spokes`     | spoke count: windows between hub and rim (appear when the wheel has room for them) |
| `holes`      | round lightening holes between hub and rim, used when `spokes` is not set          |

Two gears mesh when they share a module and their centres sit `pitchA + pitchB` apart with a tooth of one in a gap of
the other. `gearTrain` does both for you. Any two gears of one module stay clear of each other through a full turn.

### `gearSize(shape) → GearSize`

The dimensions: `{ teeth, module, pitch, outer, root, rim, hub, thickness, plane }`. `pitch` is the pitch radius,
`outer` the tip radius, `root` the bottom of the gaps, `rim` the inner edge of the rim, `hub` the hub radius, and
`plane` the side of the square that `gearTexture` fills.

### `gearGeometry(shape) → BufferGeometry`

The gear as flat-shaded extruded geometry: axle along local +Y, centred on the origin, tooth 0 on local +Z. Place it with
`b.part` and `dir` along the axle:

```ts
const wheel = { teeth: 30, module: 0.006, spokes: 5, bore: 0.006 };
b.part(gearGeometry(wheel), metal("brass"), { bone: chest, at: chest.local([0, 0.05, 0.2]), dir: [0, 0, 1] });
```

A paint's surface coordinate `s` on a gear is the face position in meters from the axle (seen from +Y, tooth 0 up), so
`paint((p, n, s) => (Math.hypot(s[0], s[1]) < 0.02 ? GILT : BRASS))` gilds the hub. Its UVs lay `gearTexture(shape)` over
both faces at scale, so `texture: gearTexture(wheel)` engraves the real gear with its own drawing.

## Gear drawings

### `gearTexture(shape, options?) → Texture`

The drawing of a gear shape, pale grey so a tint colours it: the same teeth, spoke windows, holes and bore as
`gearGeometry` (cut away), a gradient face, engraved rim and hub rings, and a dotted rivet ring on wide rims. Tooth 0
points up. Options: `dots` (default true where the rim has room), `size` (raster pixels, default 256).

Tint it with `TINT`: `{ brass, gilt, bronze, copper, steel, iron }` colour strings.

```ts
const cog = { teeth: 18, module: 0.004, spokes: 4 };
const tex = gearTexture(cog);
const side = gearSize(cog).plane;
b.part(new PlaneGeometry(side, side), TINT.brass, { bone: head, at: cheek, dir: cheekNormal, axis: "z", texture: tex });
b.cards(skin.scatter(40, { rng: rng(3), minDist: 0.05 }), tex, { size: 0.05, lean: 90, color: TINT.copper });
```

A flat gear seen from both sides is two planes back to back or a card; `gearTrain`'s `style: "flat"` builds that for
you.

## Gear trains

### `gearTrain(b, options) → GearTrain`

Lays out and builds a train of meshing gears. `gears[0]` sits at `at`; every other gear either meshes with an earlier
gear (`from`, default the previous one) at `angle`, pitch circles touching and teeth phased into the gaps, or shares an
axle with an earlier gear (`on`) and moves to another layer along the axle with `shift`. Gears that share an axle turn
as one piece, so a small pinion on a big wheel's axle (a compound gear) carries the train into a second plane.

| Option      | Meaning                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------- |
| `at`        | centre of `gears[0]`                                                                              |
| `axis`      | axle direction of the whole train (a Frame gives its facing axis)                                 |
| `up`        | where angle 0 points in the plane (default world up, world +Z for a vertical axle)                |
| `module`    | module in meters, shared by every gear of the train                                               |
| `gears`     | the `TrainGear` list, below                                                                       |
| `style`     | `"solid"` (default, extruded) or `"flat"` (two textured faces and a rim band per gear)            |
| `thickness` | face width for every gear (default 2 × module)                                                    |
| `color`     | colours cycled over the gears (default brass, copper, gilt, blued steel, bronze; tints when flat) |
| `arbor`     | axle pin colour, or `false` for none (default steel)                                              |
| `spin`      | joint-name prefix: each axle gets its own joint `${spin}1`, `${spin}2`, …, bone +Y along the axle |
| `bone`      | parent of the spin joints, and the bone for every part when there are none                        |
| `group`     | group tag for every joint and part                                                                |

Each `TrainGear` takes the `GearShape` fields except `module`/`radius`, plus:

| Field     | Meaning                                                                                   |
| --------- | ----------------------------------------------------------------------------------------- |
| `from`    | index of the earlier gear it meshes with (default the previous gear)                      |
| `angle`   | degrees in the train plane from `from`'s centre: 0 along `up`, right-handed about `axis`  |
| `on`      | index of an earlier gear whose axle (and joint) it shares                                 |
| `shift`   | with `on`: meters along the axle from that gear; its own followers mesh in this layer     |
| `phase`   | tooth-0 angle in degrees, for `gears[0]` and `on` gears (meshed gears are phased for you) |
| `color`   | its own colour: a Paint or colour string; a tint string when it is textured               |
| `texture` | `true` for its own `gearTexture` on its faces, or a Texture                               |
| `name`    | joint name for its axle, instead of the numbered one                                      |

Keep a shift at least one face width, so layers clear each other. Two gears in one layer that are not a meshing pair
must clear each other's tips; the train throws naming both gears when they would overlap, so change an `angle` or
`shift` one.

The result is `{ gears, spin(deg) }`. Each entry of `gears` is a `PlacedGear`: `index`, `size` (`GearSize`), `at`
(centre), `frame` (facing the axle, local +Z toward tooth 0), `phase` (degrees), `ratio` (turn rate relative to
`gears[0]`, negative for the opposite direction), `joint` (its axle joint or null) and `parts`. `spin(deg)` poses every
axle joint so `gears[0]` turns `deg` about the axis and every other gear follows its ratio, teeth still in the gaps. An
animator turns joint `i` by `deg × ratio` for the same motion.

```ts
const drive = gearTrain(b, {
  at: chest.local([0, 0.02, 0.18]),
  axis: [0, 0, 1],
  module: 0.008,
  spin: "gear",
  bone: chest,
  group: "body",
  gears: [
    { teeth: 24, spokes: 5 }, // 0: great wheel
    { teeth: 12, angle: 60 }, // 1: pinion, up and to the right
    { teeth: 16, from: 0, angle: -110, holes: 4, color: metal("gilt") }, // 2: off the great wheel, to the left
    { teeth: 28, on: 1, shift: 0.03, spokes: 6, texture: true, color: TINT.brass }, // 3: on 1's axle, front layer
    { teeth: 10, from: 3, angle: 160 }, // 4: meshes 3 in the front layer
  ],
});
drive.spin(12); // a rest pose with the wheels turned a little

gearTrain(b, {
  at: flank,
  axis: [1, 0, 0],
  module: 0.005,
  style: "flat",
  bone: hips,
  gears: [
    { teeth: 20, spokes: 4 },
    { teeth: 14, angle: 120 },
  ],
});
```

`style: "flat"` suits many small gears on a body (cheek wheels, tail trains): each gear is two drawn faces and a rim band,
a few triangles each. `"solid"` suits hero wheels seen edge-on.

## Extras

### `gaugeTexture(options?) → Texture`

A pressure gauge face: cream enamel, a 270° scale of ticks and numerals, a red zone, a label and a hub. Options:
`needle` (degrees, 0 straight up, clockwise positive; leave it out and build the needle as a part on its own joint),
`red` (`[fromDeg, toDeg]`, default `[81, 135]`), `label` (default `"PSI"`), `face` (colour), `size` (default 192).

```ts
b.part(new CylinderGeometry(0.05, 0.05, 0.012, 16), metal("gilt"), { bone: chest, at: dialAt, dir: dialNormal });
b.part(new CircleGeometry(0.043, 24), "#ffffff", {
  bone: chest,
  at: offset(dialAt, dialNormal, 0.007),
  dir: dialNormal,
  axis: "z",
  texture: gaugeTexture({ needle: 60 }),
});
```

### `coil(a, b, radius, turns) → Path`

A coil spring's centreline from `a` to `b`: `turns` turns of `radius` around the a→b line. Sweep it thin.

```ts
b.sweep(coil(hip, knee, 0.025, 8), 0.004, { bone: thigh, color: metal("blued") });
```

### Source: kits/clockwork.ts

```ts
// Clockwork kit: toothed gears as real geometry and as drawings, meshing gear trains that can spin on their own
// joints, metal paints (brass, gilt, bronze, copper, steel, blued steel, iron) with tarnish and verdigris, riveted
// panel seams, a pressure gauge drawing and a coil-spring path.
import {
  CylinderGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Matrix4,
  PlaneGeometry,
  Quaternion,
  Shape,
  Vector2,
  Vector3,
} from "three";
import type { BufferGeometry, Texture } from "three";
import { SURFACE } from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";
import type { Fill, JointRef } from "agentic-3js-builder";
import { Spot } from "agentic-3js-builder";
import type { Frame } from "agentic-3js-builder";
import { aim, DEG, toDirection, toPoint } from "agentic-3js-builder";
import type { DirectionInput, PointInput } from "agentic-3js-builder";
import { mix, noise, paint, resolve, rgb, smoothstep } from "agentic-3js-builder";
import type { ColorInput, Paint, Rgb } from "agentic-3js-builder";
import type { Part } from "agentic-3js-builder";
import { spiral } from "agentic-3js-builder";
import type { Joint } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";

const TAU = Math.PI * 2;
const fract = (x: number) => x - Math.floor(x);
const wrap = (x: number, m: number) => ((x % m) + m) % m;

// ---------------------------------------------------------------------------------------------------------------
// Metal paints

export type MetalKind = "brass" | "gilt" | "bronze" | "copper" | "steel" | "blued" | "iron";

export type MetalOptions = {
  /** 0..1: bright streaky sheen on up-facing surfaces. */
  polish?: number;
  /** 0..1: dark blotches of oxidised metal. */
  tarnish?: number;
  /** 0..1: blue-green patina patches gathering on faces turned down and away from the light. */
  verdigris?: number;
  /** Size of the broad colour drift in meters (default 0.07); the other blotches scale with it. */
  size?: number;
  /** Noise seed; parts that share kind and seed continue one field. */
  seed?: number;
};

type MetalBase = { lo: string; hi: string; tarn: string; sheen: string; polish: number; tarnish: number };
const METALS: Record<MetalKind, MetalBase> = {
  brass: { lo: "#aa7a30", hi: "#e4b65a", tarn: "#4a3014", sheen: "#ffe69e", polish: 0.35, tarnish: 0.3 },
  gilt: { lo: "#d6a23a", hi: "#ffe692", tarn: "#7a5a22", sheen: "#fff4c4", polish: 0.6, tarnish: 0.1 },
  bronze: { lo: "#7e5a2a", hi: "#b88e46", tarn: "#2a1a0a", sheen: "#e8c888", polish: 0.15, tarnish: 0.5 },
  copper: { lo: "#a44622", hi: "#ec8652", tarn: "#3a1a0e", sheen: "#ffc49a", polish: 0.35, tarnish: 0.35 },
  steel: { lo: "#6c7280", hi: "#dfe4ec", tarn: "#343844", sheen: "#ffffff", polish: 0.5, tarnish: 0.2 },
  blued: { lo: "#20305e", hi: "#6a82c4", tarn: "#0e1428", sheen: "#c4d4ff", polish: 0.4, tarnish: 0.2 },
  iron: { lo: "#22212a", hi: "#6a6d7c", tarn: "#0b0a0d", sheen: "#a4a8b8", polish: 0.3, tarnish: 0.4 },
};
const KINDS = Object.keys(METALS) as MetalKind[];
const VERDIGRIS: Rgb = [0.27, 0.68, 0.56];
/** Engraving and seam ink: a deep warm brown-black. */
export const INK: Rgb = [0.13, 0.08, 0.04];
/** Bevel and rivet-head highlight. */
export const GLINT: Rgb = [1, 0.93, 0.66];

/**
 * A metal as a Paint: a slow drift between the metal's dark and light tone with fine streaks, tarnish blotches,
 * verdigris on faces turned away from the light, sheen on up-facing surfaces and a little ambient darkening
 * underneath. "blued" is heat-tempered steel drifting through straw, purple and blue.
 */
export function metal(kind: MetalKind, options: MetalOptions = {}): Paint {
  const m = METALS[kind];
  const polish = options.polish ?? m.polish;
  const tarnish = options.tarnish ?? m.tarnish;
  const verdigris = options.verdigris ?? 0;
  const size = options.size ?? 0.07;
  const seed = options.seed ?? KINDS.indexOf(kind) + 1;
  const [lo, hi, tarn, sheen] = [rgb(m.lo), rgb(m.hi), rgb(m.tarn), rgb(m.sheen)];
  return paint((p, n) => {
    const big = noise(p, size, seed);
    const fine = noise(p, size * 0.13, seed + 5);
    let c: Rgb = mix(lo, hi, smoothstep(0.2, 0.8, big) * 0.75 + fine * 0.25);
    if (kind === "blued") {
      const t = smoothstep(0, 1, noise(p, size * 0.7, seed + 31));
      c = mix(c, mix("#9a7a3c", "#5c3f8a", t), 0.45 * (1 - smoothstep(0.3, 0.9, t)));
    }
    if (tarnish) c = mix(c, tarn, tarnish * smoothstep(0.45, 0.8, noise(p, size * 0.45, seed + 9)));
    if (verdigris)
      c = mix(
        c,
        VERDIGRIS,
        verdigris * smoothstep(0.58, 0.72, noise(p, size * 0.23, seed + 13)) * smoothstep(0.75, -0.3, n.y),
      );
    if (polish) c = mix(c, sheen, polish * smoothstep(0.5, 1, n.y) * smoothstep(0.35, 0.75, fine));
    const ao = 0.8 + 0.2 * smoothstep(-0.9, 0.4, n.y);
    return [c[0] * ao, c[1] * ao, c[2] * ao];
  });
}

export type PanelOptions = {
  /** Panel width in meters (default 0.13). */
  size?: number;
  /** Panel height as a share of its width (default 0.7). */
  aspect?: number;
  /** Rivet spacing along the seams in meters (default 0.03); 0 leaves the seams plain. */
  rivets?: number;
  /** Seam colour (default `INK`). */
  seam?: ColorInput;
};

/**
 * Riveted plating over any base colour or paint: dark 2.5 mm seams on a grid laid on the dominant face direction
 * (side, top or front), a bright bevel beside each seam and a row of round rivet heads along it. Works on any shape.
 */
export function panelled(base: ColorInput, options: PanelOptions = {}): Paint {
  const cu = options.size ?? 0.13;
  const cv = cu * (options.aspect ?? 0.7);
  const pitch = options.rivets ?? 0.03;
  const seam = options.seam ?? INK;
  const r = Math.min(pitch * 0.18, 0.0045);
  const inset = 0.006 + r;
  return paint((p, n) => {
    const col = resolve(base, p, n);
    const ax = Math.abs(n.x);
    const ay = Math.abs(n.y);
    const az = Math.abs(n.z);
    const [u, v] = ax >= ay && ax >= az ? [p.z, p.y] : ay >= az ? [p.x, p.z] : [p.x, p.y];
    // Distances in meters past the last seam on each axis.
    const du = fract(u / cu) * cu;
    const dv = fract(v / cv) * cv;
    if (du < 0.0025 || dv < 0.0025) return mix(col, resolve(seam, p, n), 0.85);
    if (du < 0.0055 || dv < 0.0055) return mix(col, GLINT, 0.28);
    if (pitch > 0) {
      const along = (x: number) => (fract(x / pitch) - 0.5) * pitch;
      const d = Math.min(Math.hypot(du - inset, along(v)), Math.hypot(dv - inset, along(u)));
      if (d < r * 0.65) return mix(col, GLINT, 0.65);
      if (d < r) return mix(col, INK, 0.45);
    }
    return col;
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Gear shape. Gear plane coordinates: axis +Y, tooth 0 on local +Z, angles right-handed about +Y (from +Z toward
// +X). A point at angle a and radius r is (sin a · r, 0, cos a · r). Seen from +Y, angles run counter-clockwise.

export type GearShape = {
  /** Tooth count, 8 or more. */
  teeth: number;
  /** Module in meters: pitch radius = teeth × module / 2. Give `module` or `radius`. */
  module?: number;
  /** Pitch radius in meters (the circle where two gears roll on each other). */
  radius?: number;
  /** Face width along the axis in meters (default 2 × module). */
  thickness?: number;
  /** Tooth depth as a share of standard (addendum 1 module, dedendum 1.25), 0.5..1, default 1. */
  toothDepth?: number;
  /** Radius of an axle hole through the middle, meters (default none). */
  bore?: number;
  /** Spoke windows between hub and rim (big wheels): the count of spokes. */
  spokes?: number;
  /** Round lightening holes on a circle between hub and rim, when `spokes` is not set: their count. */
  holes?: number;
};

export type GearSize = {
  teeth: number;
  module: number;
  /** Pitch radius: meshing gears sit pitchA + pitchB apart. */
  pitch: number;
  /** Tip radius. */
  outer: number;
  /** Radius at the bottom of the tooth gaps. */
  root: number;
  /** Inner edge of the rim, where spoke windows start. */
  rim: number;
  /** Outer radius of the hub. */
  hub: number;
  thickness: number;
  /** Side of the square a `gearTexture` drawing of this gear fills: a PlaneGeometry this size shows it at scale. */
  plane: number;
};

/** The dimensions of a gear shape. */
export function gearSize(shape: GearShape): GearSize {
  const teeth = Math.round(shape.teeth);
  if (!(teeth >= 8)) throw new Error(`gear: teeth must be 8 or more (got ${shape.teeth})`);
  const module = shape.module ?? (shape.radius !== undefined ? (2 * shape.radius) / teeth : NaN);
  if (!(module > 0)) throw new Error("gear: give `module` or `radius` (meters, > 0)");
  const k = shape.toothDepth ?? 1;
  if (!(k >= 0.5 && k <= 1)) throw new Error(`gear: toothDepth must be 0.5..1 (got ${k})`);
  const pitch = (teeth * module) / 2;
  const outer = pitch + module * k;
  const root = pitch - 1.25 * module * k;
  const hub = Math.max((shape.bore ?? 0) * 1.7, pitch * 0.22, module * 1.5);
  const rim = root - Math.max(module * 1.4, pitch * 0.1);
  return {
    teeth,
    module,
    pitch,
    outer,
    root,
    rim,
    hub,
    thickness: shape.thickness ?? 2 * module,
    plane: (outer * 100) / 48,
  };
}

type Loop = Vector2[];
/** Plane point (right, up) as seen from +Y with tooth 0 up: right = −x, up = z. */
const at2 = (r: number, a: number) => new Vector2(-r * Math.sin(a), r * Math.cos(a));

/** Outline and holes of a gear, in the plane seen from +Y (x right, y toward tooth 0). */
function gearLoops(shape: GearShape, size: GearSize) {
  const { teeth, module, pitch, outer, root, rim, hub } = size;
  const step = TAU / teeth;
  // Straight 25° flanks, tooth half width 0.22 pitch-arcs at the pitch circle: any two gears of one module (8 teeth
  // and up, depth ≤ 1) stay clear of each other through a full turn with a tooth in each gap.
  const k = shape.toothDepth ?? 1;
  const halfWidth = (r: number) => 0.22 * Math.PI * module - (Math.tan(25 * DEG) * (r - pitch)) / k;
  const hr = Math.min(halfWidth(root) / root, 0.42 * step);
  const ht = Math.max(Math.min(halfWidth(outer) / outer, 0.3 * step), 0.06 * step);
  const outline: Loop = [];
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    outline.push(at2(root, a - hr), at2(outer, a - ht), at2(outer, a + ht), at2(root, a + hr));
  }
  const holes: Loop[] = [];
  const hubOut = hub + module * 0.6;
  const spokes = Math.round(shape.spokes ?? 0);
  const count = Math.round(shape.holes ?? 0);
  if (spokes >= 2 && rim - hubOut > 2.5 * module) {
    const half = TAU / spokes / 2;
    const w = Math.max(module * 0.9, pitch * 0.06);
    const ho = half - w / rim;
    const hi = half - w / hubOut;
    if (ho > 0.05 && hi > 0.02) {
      const arcSteps = Math.max(2, Math.ceil((2 * ho) / (15 * DEG)));
      for (let s = 0; s < spokes; s++) {
        const a = (s + 0.5) * 2 * half;
        const loop: Loop = [];
        for (let j = 0; j <= arcSteps; j++) loop.push(at2(rim, a - ho + (2 * ho * j) / arcSteps));
        loop.push(at2(hubOut, a + hi), at2(hubOut, a - hi));
        holes.push(loop);
      }
    }
  } else if (count >= 2 && rim - hubOut > 2 * module) {
    const rm = (rim + hubOut) / 2;
    const rh = Math.min(0.38 * (rim - hubOut), rm * Math.sin(Math.PI / count) * 0.6);
    for (let s = 0; s < count; s++) {
      const c = at2(rm, (s + 0.5) * (TAU / count));
      const loop: Loop = [];
      for (let j = 0; j < 10; j++)
        loop.push(new Vector2(c.x + rh * Math.cos((j * TAU) / 10), c.y + rh * Math.sin((j * TAU) / 10)));
      holes.push(loop);
    }
  }
  const bore = shape.bore ?? 0;
  if (bore > 0) {
    const loop: Loop = [];
    for (let j = 0; j < 12; j++) loop.push(at2(bore, (j * TAU) / 12));
    holes.push(loop);
  }
  return { outline, holes };
}

// Plane (right, up, out-of-plane) → gear local (x, y, z) = (−right, out, up).
const PLANE_TO_GEAR = new Matrix4().set(-1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1);
const PLANE_QUAT = new Quaternion().setFromRotationMatrix(PLANE_TO_GEAR);
// The same drawing seen from −Y: right = +x.
const BACK_QUAT = new Quaternion().setFromRotationMatrix(
  new Matrix4().set(1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1),
);

/**
 * A toothed gear as geometry: axis along local +Y, centred on the origin, tooth 0 on local +Z, flat-shaded. Place it
 * with `b.part(geo, color, { at, dir: axle })`. Its UVs lay `gearTexture(shape)` over the faces at scale (the rim and
 * tooth sides take one plain texel of the drawing), and a paint's `s` on it is the face position in meters from the
 * axle, seen from +Y with tooth 0 up.
 */
export function gearGeometry(shape: GearShape): BufferGeometry {
  const size = gearSize(shape);
  const { outline, holes } = gearLoops(shape, size);
  const s = new Shape(outline);
  for (const h of holes) s.holes.push(new Shape(h));
  const t = size.thickness;
  const geo = new ExtrudeGeometry(s, { depth: t, bevelEnabled: false, curveSegments: 1, steps: 1 });
  geo.translate(0, 0, -t / 2);
  const pos = geo.getAttribute("position");
  const uv = new Float32Array(pos.count * 2);
  const surface = new Float32Array(pos.count * 2);
  const caps = geo.groups[0]?.count ?? pos.count;
  const sideV = 0.5 + (size.pitch + size.outer) / 2 / size.plane;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    surface[i * 2] = x;
    surface[i * 2 + 1] = y;
    uv[i * 2] = i < caps ? 0.5 + x / size.plane : 0.5;
    uv[i * 2 + 1] = i < caps ? 0.5 + y / size.plane : sideV;
  }
  geo.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  geo.setAttribute(SURFACE, new Float32BufferAttribute(surface, 2));
  geo.applyMatrix4(PLANE_TO_GEAR);
  geo.clearGroups();
  return geo;
}

export type GearDrawing = {
  /** A dotted rivet ring on the rim (default true when there is room). */
  dots?: boolean;
  /** Raster size in pixels (default 256). */
  size?: number;
};

/**
 * The drawing of a gear shape, pale grey so a tint colours it (see `TINT`): the same teeth, spoke windows, holes and
 * bore as `gearGeometry` (cut away), a gradient face, engraved rim and hub rings. Tooth 0 points up. Map it on a
 * `PlaneGeometry(size.plane, size.plane)` for a flat gear, on `b.cards` for a scatter of cogs, or on the faces of
 * `gearGeometry` via `texture:`.
 */
export function gearTexture(shape: GearShape, options: GearDrawing = {}): Texture {
  const size = gearSize(shape);
  const { outline, holes } = gearLoops(shape, size);
  const k = 48 / size.outer;
  const pt = (v: Vector2) => `${(50 + v.x * k).toFixed(2)} ${(50 - v.y * k).toFixed(2)}`;
  const loop = (l: Loop) => `M${l.map(pt).join("L")}Z`;
  const d = [outline, ...holes].map(loop).join("");
  const ring = (r: number, w: number, extra = "") =>
    `<circle cx="50" cy="50" r="${(r * k).toFixed(2)}" fill="none" stroke="#5a5a5a" stroke-width="${w}" ${extra}/>`;
  const rimRing = (shape.spokes ?? 0) > 0 || (shape.holes ?? 0) > 0 ? size.rim : (size.root + size.hub) / 2;
  const dots = (options.dots ?? true) && (size.root - rimRing) * k > 5;
  const bore = shape.bore ?? 0;
  const hubR = size.hub + size.module * 0.6;
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="g" cx="0.4" cy="0.35" r="0.85"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#b0b0b0"/></radialGradient></defs>
      <path d="${d}" fill="url(#g)" fill-rule="evenodd" stroke="#4a4a4a" stroke-width="1.2" stroke-linejoin="round"/>
      ${ring(size.root - size.module * 0.5, 0.9)}
      ${ring(rimRing - size.module * 0.4, 1.1)}
      ${dots ? ring((size.root + rimRing) / 2, 1.8, `stroke-dasharray="1.6 3.4"`) : ""}
      ${ring(hubR, 1.2)}
      ${ring(Math.max(bore * 1.25, hubR * 0.5), 1.4)}
    </svg>`,
    { size: options.size ?? 256 },
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Gear trains

/** Gear tints for textured gears (drawings are pale grey; the tint makes them metal). */
export const TINT = {
  brass: "#e6b95c",
  gilt: "#f7d980",
  bronze: "#b98a44",
  copper: "#d98552",
  steel: "#8ea0d2",
  iron: "#6a6d7c",
} as const;

const DEFAULT_PAINTS: readonly Paint[] = [
  metal("brass", { verdigris: 0.2 }),
  metal("copper", { verdigris: 0.3 }),
  metal("gilt"),
  metal("blued"),
  metal("bronze", { verdigris: 0.4 }),
];
const DEFAULT_TINTS: readonly string[] = [TINT.brass, TINT.copper, TINT.gilt, TINT.steel, TINT.bronze];
const ARBOR = metal("steel");

export type TrainGear = Omit<GearShape, "module" | "radius"> & {
  /** Mesh with this earlier gear (index into `gears`), default the previous one. Ignored for `gears[0]` and `on`. */
  from?: number;
  /** Direction from `from`'s centre, degrees in the train plane: 0 along `up`, right-handed about `axis`. */
  angle?: number;
  /** Share the axle (and joint) of this earlier gear instead of meshing: a compound gear. */
  on?: number;
  /** With `on`: offset along the axis from that gear, meters; the new gear meshes in that layer. */
  shift?: number;
  /** Tooth phase in degrees for `gears[0]` and `on` gears (meshed gears are phased for you). */
  phase?: number;
  /** Colour: a Paint or colour string, or a tint string for textured gears. Default: the train's `color` cycle. */
  color?: Fill;
  /** Map the gear's drawing (`true`: `gearTexture` of its shape) on its faces; `color` is then a tint string. */
  texture?: Texture | boolean;
  /** Joint name for this gear's axle (with `spin`), overriding the numbered default. */
  name?: string;
};

export type GearTrainOptions = {
  /** Centre of `gears[0]`. */
  at: PointInput;
  /** Axle direction of every gear in the train (a Frame gives its facing axis). */
  axis: DirectionInput;
  /** Where angle 0 points in the plane (default world up, or world +Z for a vertical axis). */
  up?: DirectionInput;
  /** Module in meters, shared by every gear of the train. */
  module: number;
  gears: readonly TrainGear[];
  /** "solid" (default): extruded gears. "flat": two textured faces and a rim band, cheaper for many small gears. */
  style?: "solid" | "flat";
  /** Face width for every gear (default 2 × module). */
  thickness?: number;
  /** Colours cycled over the gears (default brass, copper, gilt, blued steel, bronze; tints when textured). */
  color?: Fill | readonly Fill[];
  /** Axle pin through every axle: its colour, or false for none (default steel). */
  arbor?: Fill | false;
  /** Joint-name prefix: each axle gets its own joint `${spin}1`, `${spin}2`, …, bone +Y along the axle. */
  spin?: string;
  /** Parent of the spin joints, and the bone for everything when there are none. Default: the nearest joint. */
  bone?: JointRef;
  group?: string;
};

export type PlacedGear = {
  index: number;
  size: GearSize;
  /** Centre in model space. */
  at: Vector3;
  /** Frame at the centre: facing the axle, local +Z toward tooth 0. */
  frame: Frame;
  /** Tooth-0 angle in degrees in the train plane. */
  phase: number;
  /** Turn rate relative to `gears[0]`: negative turns the other way. */
  ratio: number;
  /** The axle's joint (with `spin`), shared by gears on one axle. */
  joint: Joint | null;
  /** The meshes built for this gear (the gear, then faces or pin). */
  parts: Part[];
};

export type GearTrain = {
  gears: PlacedGear[];
  /** Pose every axle joint so `gears[0]` turns `deg` about the axis and the rest follow their ratios. */
  spin(deg: number): void;
};

type Layout = { size: GearSize; x: number; y: number; z: number; theta: number; ratio: number; axle: number };

/** Positions, phases and ratios of the gears in the train's local frame (y = along the axis). */
function layout(o: GearTrainOptions) {
  const out: Layout[] = [];
  const axleOf: number[] = [];
  o.gears.forEach((g, i) => {
    const size = gearSize({ ...g, module: o.module, thickness: g.thickness ?? o.thickness });
    const phase = (g.phase ?? 0) * DEG;
    if (i === 0) {
      out.push({ size, x: 0, y: 0, z: 0, theta: phase, ratio: 1, axle: 0 });
      axleOf.push(0);
      return;
    }
    if (g.on !== undefined) {
      const on = out[g.on];
      if (!on) throw new Error(`gearTrain: gears[${i}].on = ${g.on} is not an earlier gear`);
      out.push({ size, x: on.x, y: on.y + (g.shift ?? 0), z: on.z, theta: phase, ratio: on.ratio, axle: on.axle });
      return;
    }
    const from = g.from ?? i - 1;
    const p = out[from];
    if (!p) throw new Error(`gearTrain: gears[${i}].from = ${from} is not an earlier gear`);
    const phi = (g.angle ?? 0) * DEG;
    const dist = p.size.pitch + size.pitch;
    const x = p.x + Math.sin(phi) * dist;
    const z = p.z + Math.cos(phi) * dist;
    // The parent's nearest tooth sits delta past the line of centres; put a gap of ours opposite it.
    const stepP = TAU / p.size.teeth;
    const delta = wrap(p.theta - phi, stepP);
    const theta = phi + Math.PI - (delta * p.size.pitch + (stepP * p.size.pitch) / 2) / size.pitch;
    out.push({ size, x, y: p.y, z, theta, ratio: (-p.ratio * p.size.teeth) / size.teeth, axle: axleOf.length });
    axleOf.push(i);
  });
  // Gears in one layer that are not a meshing pair must stay clear of each other.
  for (let i = 0; i < out.length; i++)
    for (let j = i + 1; j < out.length; j++) {
      const a = out[i];
      const b = out[j];
      if (a.axle === b.axle || Math.abs(a.y - b.y) >= (a.size.thickness + b.size.thickness) / 2) continue;
      const d = Math.hypot(a.x - b.x, a.z - b.z);
      const pair = o.gears[j].on === undefined && (o.gears[j].from ?? j - 1) === i;
      if (pair) continue;
      if (d < a.size.outer + b.size.outer)
        throw new Error(
          `gearTrain: gears[${i}] and gears[${j}] overlap in one layer (${d.toFixed(4)} m apart, need ${(a.size.outer + b.size.outer).toFixed(4)}); change an angle or shift one`,
        );
    }
  return out;
}

/**
 * A train of meshing gears in one plane (and parallel layers, through `on` + `shift`): `gears[0]` sits at `at`, each
 * other gear meshes with `from` at `angle`, pitch circles touching and teeth phased into the gaps, or shares an axle
 * with `on`. With `spin`, every axle gets a joint and `spin(deg)` turns the whole train in step.
 */
export function gearTrain(b: Builder, o: GearTrainOptions): GearTrain {
  const center = toPoint(o.at);
  const axis = toDirection(o.axis).normalize();
  const up = o.up ? toDirection(o.up) : Math.abs(axis.y) > 0.95 ? new Vector3(0, 0, 1) : new Vector3(0, 1, 0);
  const q = aim(axis, up);
  const style = o.style ?? "solid";
  const list = layout(o);
  const colors: readonly Fill[] | null =
    o.color === undefined ? null : typeof o.color === "string" || !Array.isArray(o.color) ? [o.color as Fill] : o.color;
  const toModel = (x: number, y: number, z: number) => new Vector3(x, y, z).applyQuaternion(q).add(center);
  const joints: Joint[] = [];
  const axles = new Map<number, number[]>();
  list.forEach((l, i) => axles.set(l.axle, [...(axles.get(l.axle) ?? []), i]));
  for (const [axle, members] of axles) {
    if (!o.spin) break;
    const first = list[members[0]];
    const name = members.map((m) => o.gears[m].name).find(Boolean) ?? `${o.spin}${axle + 1}`;
    joints[axle] = b.joint(name, { parent: o.bone, at: toModel(first.x, first.y, first.z), dir: axis, group: o.group });
  }
  const tag = (i: number, what: string) => ({ group: o.group, name: `${o.spin ?? "gear"}${i + 1}${what}` });
  const gears: PlacedGear[] = list.map((l, i) => {
    const g = o.gears[i];
    const shape: GearShape = { ...g, module: o.module, thickness: l.size.thickness };
    const at = toModel(l.x, l.y, l.z);
    const gq = q.clone().multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), l.theta));
    const joint = joints[l.axle] ?? null;
    const bone = joint ?? o.bone;
    const textured = style === "flat" || !!g.texture;
    const fill =
      g.color ?? (colors ? colors[i % colors.length] : textured ? DEFAULT_TINTS[i % 5] : DEFAULT_PAINTS[i % 5]);
    if (textured && typeof fill !== "string")
      throw new Error(`gearTrain: gears[${i}] is textured, so its color must be a tint string (see TINT)`);
    const tex = typeof g.texture === "object" ? g.texture : textured ? gearTexture(shape) : undefined;
    const parts: Part[] = [];
    const t = l.size.thickness;
    if (style === "solid") {
      parts.push(b.part(gearGeometry(shape), fill, { bone, at, quat: gq, texture: tex, ...tag(i, "") }));
    } else {
      const face = new PlaneGeometry(l.size.plane, l.size.plane);
      const lift = t / 2 + 0.0008;
      parts.push(
        b.part(face, fill, {
          bone,
          at: at.clone().addScaledVector(axis, lift),
          quat: gq.clone().multiply(PLANE_QUAT),
          texture: tex,
          ...tag(i, "front"),
        }),
        b.part(face, fill, {
          bone,
          at: at.clone().addScaledVector(axis, -lift),
          quat: gq.clone().multiply(BACK_QUAT),
          texture: tex,
          ...tag(i, "back"),
        }),
        b.part(new CylinderGeometry(l.size.root, l.size.root, t, Math.max(8, l.size.teeth), 1, true), fill, {
          bone,
          at,
          quat: gq,
          ...tag(i, "rim"),
        }),
      );
    }
    return {
      index: i,
      size: l.size,
      at,
      frame: new Spot(at, gq, parts[0].weights),
      phase: l.theta / DEG,
      ratio: l.ratio,
      joint,
      parts,
    };
  });
  if (o.arbor !== false) {
    const arborFill = o.arbor ?? ARBOR;
    for (const [axle, members] of axles) {
      const lo = Math.min(...members.map((m) => list[m].y - list[m].size.thickness / 2)) - o.module * 1.2;
      const hi = Math.max(...members.map((m) => list[m].y + list[m].size.thickness / 2)) + o.module * 1.2;
      const g0 = list[members[0]];
      const bore = Math.min(...members.map((m) => o.gears[m].bore ?? Infinity));
      const r = Math.min(bore, Math.min(...members.map((m) => list[m].size.hub)) * 0.55);
      gears[members[0]].parts.push(
        b.part(new CylinderGeometry(r, r, hi - lo, 8), arborFill, {
          bone: joints[axle] ?? o.bone,
          at: toModel(g0.x, (lo + hi) / 2, g0.z),
          quat: q,
          ...tag(members[0], "arbor"),
        }),
      );
    }
  }
  return {
    gears,
    spin(deg: number) {
      if (!o.spin) throw new Error("gearTrain: spin() needs the `spin` option (a joint per axle)");
      for (const [axle, members] of axles) b.pose(joints[axle], { axis, deg: deg * list[members[0]].ratio });
    },
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Extras

export type GaugeOptions = {
  /** Needle angle in degrees, 0 straight up, clockwise positive (−135..135 on the scale); omit for a needle part. */
  needle?: number;
  /** Red zone from..to in degrees on the same clock (default 81..135). */
  red?: readonly [number, number];
  /** Word under the hub (default "PSI"). */
  label?: string;
  /** Face colour (default cream enamel). */
  face?: string;
  /** Raster size in pixels (default 192). */
  size?: number;
};

/** A pressure gauge face: cream enamel, a 270° scale of ticks and numerals, a red zone, a label and a hub. */
export function gaugeTexture(options: GaugeOptions = {}): Texture {
  const pt = (r: number, deg: number) =>
    `${(50 + r * Math.sin(deg * DEG)).toFixed(2)} ${(50 - r * Math.cos(deg * DEG)).toFixed(2)}`;
  let ticks = "";
  for (let i = 0; i <= 20; i++) {
    const a = -135 + (i * 270) / 20;
    ticks += `<path d="M${pt(42, a)} L${pt(i % 2 ? 37.5 : 33.5, a)}" stroke="#2a1d10" stroke-width="${i % 2 ? 1.6 : 2.6}"/>`;
  }
  let nums = "";
  for (let i = 0; i <= 10; i += 2) {
    const [x, y] = pt(25.5, -135 + (i * 270) / 10).split(" ");
    nums += `<text x="${x}" y="${(Number(y) + 3.2).toFixed(1)}" text-anchor="middle" font-family="serif" font-weight="bold" font-size="10" fill="#2a1d10">${i}</text>`;
  }
  const [r0, r1] = options.red ?? [81, 135];
  const needle =
    options.needle === undefined
      ? ""
      : `<path d="M${pt(3, options.needle - 90)} L${pt(38, options.needle)} L${pt(3, options.needle + 90)} L${pt(9, options.needle + 180)}Z" fill="#1c140c"/>`;
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="49" fill="${options.face ?? "#efe3c2"}" stroke="#3a2a14" stroke-width="2.5"/>
      <path d="M${pt(40, r0)} A40 40 0 ${r1 - r0 > 180 ? 1 : 0} 1 ${pt(40, r1)}" stroke="#b3261e" stroke-width="6" fill="none"/>
      ${ticks}${nums}
      <text x="50" y="70" text-anchor="middle" font-family="serif" font-weight="bold" font-size="9" fill="#2a1d10">${options.label ?? "PSI"}</text>
      ${needle}
      <circle cx="50" cy="50" r="3.5" fill="#2a1d10"/>
    </svg>`,
    { size: options.size ?? 192 },
  );
}

/** A coil spring's centreline from `a` to `b`: `turns` turns of `radius` around the a→b line. Sweep it thin. */
export function coil(a: PointInput, b: PointInput, radius: number, turns: number) {
  const p = toPoint(a);
  const axis = toPoint(b).sub(p);
  const len = axis.length();
  const side = new Vector3(1, 0, 0).applyQuaternion(aim(axis));
  return spiral(p, p.clone().addScaledVector(side, radius), axis, { turns, pitch: len / Math.abs(turns) });
}
```

## Kit: glow

# Glow kit

`kits/glow.ts` makes surfaces self-lit: lantern glass, lit windows, embers and fire, glowing eyes, neon tubes,
crystals, runes and magic. A glowing part keeps its own colours and shows them at full brightness whatever the
lighting. It works through the standard three.js `emissive` material properties, which the GLB carries as glTF's
emissive colour and texture, so any engine that imports the GLB sees it. Bloom and halos are the importing
renderer's choice.

```ts
import { glow } from "agentic-3js-builder/kits/glow";
```

## `glow(target, strength = 1)`

`target` is anything built with meshes: a `Part` (from `b.part`, `b.stick`, `b.extrude`, `b.lathe`, ...), a sweep or
loft, the meshes `b.cards` returns, or plain meshes. It returns `target`, so it wraps a call:

```ts
glow(b.part(new THREE.BoxGeometry(0.16, 0.2, 0.16), "#ffb347", { bone: post, at: [0, 1.1, 0] }), 1.5);
glow(b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", { bone: post, at: [0, 0.6, 0.05], texture: RUNE }));
```

- `strength` 1 shows the part's colours at full brightness; higher values read as brighter light where the renderer
  supports it (the GLB records them with `KHR_materials_emissive_strength`).
- Flat colours glow in that colour. Textured parts and cards glow in their texture's own colours, so a drawing can
  glow in some places and stay dark in others: draw the dark parts dark.
- Only the parts you pass glow; other parts of the same colour stay lit normally.
- Painted surfaces (a `Paint` as `color`) can't glow: give the glowing piece its own part with a flat colour or a
  texture.
- A plain three.js mesh can set `emissive` (the same colour as its `color`) and `emissiveIntensity` on its own
  `MeshStandardMaterial`; that is all `glow` does.

### Source: kits/glow.ts

```ts
// Glow kit: self-lit surfaces (lanterns, windows, embers, eyes, neon, crystals, magic). A glowing part keeps its
// own colours and emits them, through the standard three.js `emissive` material properties, which GLB exporters
// write as glTF's emissive factor and texture. Nothing here changes the SDK; see kits/glow.md.
import { MeshStandardMaterial } from "three";
import type { Mesh } from "three";

/** What `glow` lights: a Part (`.mesh`), a Sweep or loft (`.meshes`), the meshes `b.cards` returns, or meshes. */
export type Glowing = Mesh | readonly Mesh[] | { readonly mesh: Mesh } | { readonly meshes: readonly Mesh[] };

const isMeshList = (target: Glowing): target is readonly Mesh[] => Array.isArray(target);

/** One glowing copy per source material and strength, so parts that shared a material still share one. */
const copies = new WeakMap<MeshStandardMaterial, Map<number, MeshStandardMaterial>>();

/**
 * Makes `target` emit its own colours at `strength` (1 = its colour at full brightness regardless of light; more
 * blooms brighter where the renderer allows). Flat colours and textures (drawings, cards, pixel tiles) glow;
 * painted surfaces don't, so give a glowing part a flat colour or a texture. Returns `target`.
 */
export function glow<T extends Glowing>(target: T, strength = 1): T {
 const source: Glowing = target;
 const meshes: readonly Mesh[] = isMeshList(source)
  ? source
  : "isMesh" in source
   ? [source]
   : "meshes" in source
    ? source.meshes
    : [source.mesh];
 for (const mesh of meshes) {
  const material = mesh.material;
  if (!(material instanceof MeshStandardMaterial))
   throw new Error(`glow(): ${mesh.name || "a mesh"} has no single MeshStandardMaterial`);
  if (material.name === "paint")
   throw new Error(`glow(): ${mesh.name || "a part"} is painted; give a glowing part a flat colour or a texture`);
  let byStrength = copies.get(material);
  if (!byStrength) copies.set(material, (byStrength = new Map()));
  let copy = byStrength.get(strength);
  if (!copy) {
   copy = material.clone();
   copy.emissive.copy(material.color);
   copy.emissiveMap = material.map;
   copy.emissiveIntensity = strength;
   byStrength.set(strength, copy);
  }
  mesh.material = copy;
 }
 return target;
}
```

## Kit: pixel

# Pixel kit

`kits/pixel.ts` is for pixel-art and retro looks (NES, Game Boy, Atari, DOS/VGA, PS1, Minecraft-style voxels): every surface shows hard square texels of one size. It covers five jobs:

- pixel textures from character rows or a draw callback;
- boxes whose faces crop a tile at a fixed texel size;
- Minecraft-style skin boxes that read named rectangles of one sheet;
- a paint quantized to square cells in meters, with ramps and Bayer dither;
- staircase outlines for `b.extrude`.

```ts
import {
  pixelArt,
  pixelTexture,
  tileBox,
  skinLayout,
  skinFaces,
  skinBox,
  cellPaint,
  pick,
  bayer,
  snapColor,
  stepped,
} from "agentic-3js-builder/kits/pixel";
```

A textured part shows a pixel texture drawn in colour as drawn, whatever its `color`; a texture drawn only in greys is tinted by the part's `color`. Every kit texture is pixelated, which makes the whole atlas (paint sheet included) magnify without smoothing.

Pick one texel size in meters for the model (`const TEXEL = 0.02`) and use it for boxes, skin boxes and paints, so all texels match. Use half or a third of it for small parts that need finer detail.

## Pixel textures

Grid coordinates: x runs from the left and y runs down from the top row, as in the drawing. The top row of a grid maps to the top of the texture (v = 1). A `Rect` is `[x, y, w, h]` in pixels.

Every grid pixel is rasterised as an exact square block of raster pixels. Grids smaller than 8 pixels, the smallest raster `svg()` makes, are scaled up by a whole number. Grids can be up to 2048 pixels on a side.

### `pixelArt(rows, palette): Texture`

Takes character rows, top row first, with one character per pixel. `"."` and `" "` are transparent. Every other character must be a key of `palette`, which maps characters to colour strings. All rows must be the same width.

```ts
const EYE = pixelArt(["kkkk", "kwwk", "kwgk", "kkkk"], { k: "#0b0b12", w: "#ffffff", g: "#3a3d5c" });
b.part(new THREE.BoxGeometry(0.03, 0.03, 0.006), "#ffffff", { texture: EYE, bone: head, at, dir, axis: "z" });
```

### `pixelTexture(w, h, draw: (g: PixelGrid) => void): Texture`

Gives `draw` a blank `w` × `h` grid; the grid you leave behind becomes the texture. Pixels start transparent. `PixelGrid` has:

| Member                       | Does                                                                                                                                                           |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `w`, `h`                     | grid size                                                                                                                                                      |
| `get(x, y)`                  | colour there, `""` when transparent or off the grid                                                                                                            |
| `set(x, y, color)`           | sets one pixel (`""` clears it). Pixels off the grid are skipped, so art can hang over an edge                                                                 |
| `fill(fn, rect?)`            | `fn(x, y, w, h)` for every pixel of `rect` (default: the whole grid), with x and y local to the rect. Returning `""` or `undefined` leaves the pixel as it was |
| `stamp(x, y, rows, palette)` | draws character rows with their top-left corner at (x, y), like `pixelArt`. `"."` and `" "` leave pixels as they were                                          |

```ts
const WOOD = pixelTexture(32, 24, (g) => {
  g.fill((x, y) => (y % 6 === 0 ? SEAM : y % 6 === 1 ? LIGHT : pick(BROWN, 0.4 + 0.3 * r(), bayer(x, y))));
  g.stamp(10, 2, ["n.n"], { n: NAIL });
});
```

## Boxes

### `tileBox(size, tile, texel, { rand?, step? }?): BoxGeometry`

Makes a box `size` (`[w, h, d]` in meters). Each face shows a crop of `tile` at `texel` meters per tile pixel, so texels are square on every face at any box size. Use one tile for many planks, bricks, crates and stone plates.

- By default each crop starts at the tile's top-left corner. `rand` (an `rng(seed)`) moves each face's crop to a random whole-pixel offset.
- `step` (a number or `[x, y]`, in pixels) snaps those offsets to multiples, so rows in the tile stay aligned. With 6-pixel planks drawn from the tile's top, `step: [1, 6]` keeps every plank whole.
- A face larger than the tile at `texel` shows the whole tile with larger texels, which are still square. Make the tile at least as many pixels as the largest face is texels to keep one texel size.
- `tile` must come from `pixelTexture` or `pixelArt`.

```ts
const PLANKS = pixelTexture(32, 30, drawPlanks);
b.part(tileBox([0.36, 0.17, 0.26], PLANKS, 0.0115, { rand, step: [1, 6] }), WOOD, {
  texture: PLANKS,
  bone: body,
  at: [0, 0.125, -0.02],
});
```

### Skin boxes

A skin box is a box whose six faces show six rectangles of one sheet, in the Minecraft skin layout. Draw faces (eyes on the front, a mouth, a darker top) straight onto the sheet.

`BoxFace` is `"px" | "nx" | "py" | "ny" | "pz" | "nz"` (+x is the model's left, +z its front). `SkinFaces` is `Record<BoxFace, Rect>`.

#### `skinFaces(x, y, [w, h, d]): SkinFaces`

Gives the Minecraft layout of a box `w` × `h` × `d` pixels, with its top-left corner at (x, y) on the sheet. The block is `2(w + d)` wide and `d + h` tall:

```
        [ py  w×d ][ ny  w×d ]
[nx d×h][ pz  w×h ][ px  d×h ][ nz  w×h ]
```

Each rectangle shows its face as seen from outside the box. Side faces are upright. The top face (py) has the back edge on its top row, and the bottom face (ny) has the front edge on its top row. In a face rectangle, `x` runs to the viewer's right and `y` runs down.

#### `skinLayout(boxes, width = 64): { size: [w, h], faces }`

Packs several boxes (`{ name: [w, h, d] }` in pixels) in rows on one sheet `width` pixels wide, in the order given. It returns the sheet `size` and each box's `SkinFaces`.

#### `skinBox(sheet, faces, scale): BoxGeometry`

Makes the box that reads `faces` of `sheet`. If `scale` is a number, it is meters per pixel: the box is the pixel size of the front (pz) and side (px) rectangles times `scale`, so texels are square. If `scale` is a size `[x, y, z]` in meters, the box has that size and the texels stretch to fit. `sheet` must come from `pixelTexture` or `pixelArt`.

```ts
const layout = skinLayout({ head: [8, 8, 8], body: [10, 8, 16] });
const SHEET = pixelTexture(...layout.size, (g) => {
  for (const faces of Object.values(layout.faces))
    for (const rect of Object.values(faces)) g.fill((x, y, _w, h) => pick(FUR, 0.7 - y / h / 2, bayer(x, y)), rect);
  const f = layout.faces.head.pz;
  g.stamp(f[0], f[1] + 2, [".ww..ww.", ".wk..kw."], { w: "#ffffff", k: "#000000" });
});
b.part(skinBox(SHEET, layout.faces.head, TEXEL), "#ffffff", {
  texture: SHEET,
  bone: head,
  at: head.local([0, 0.12, 0.1]),
});
```

## Quantized paint

### `cellPaint(size, fn: (c: Cell) => ColorInput, { dither? }?): Paint`

This paint works in square cells `size` meters across. Each surface point is taken to the face orientation (±x, ±y or ±z) its normal is closest to, then snapped to that face's cell grid, so cells stay square on boxes, tubes, lofts, extrudes and spheres. `fn` gets the point's cell and returns its colour: a colour string, `Rgb`, or another paint. Use it anywhere a `color` takes a paint.

`Cell` has:

- `at`: the cell's centre in model space. Read positions and `noise(c.at, ...)` here so every texel of the cell gets the same value.
- `u`, `v`: whole cell indices across the face. `u` runs along x (along z on ±x faces), and `v` runs along y (along z on ±y faces).
- `depth`: the whole cell index along the face normal.
- `axis`: the face orientation, `0` for ±x, `1` for ±y, `2` for ±z.
- `n`, `s`: the point's normal and surface coordinates, as any paint gets them.
- `threshold`: `bayer(u, v)` when `dither: true`, else `0.5`.
- `pick(ramp, value)`: two arguments; it picks with this cell's `threshold`, so it dithers exactly when the paint has `dither: true`.
- `random(seed = 0)`: a fixed number in [0, 1) for this cell, for specks, grain and per-cell palette picks.

With `dither: true`, a value between two ramp steps becomes an ordered 4 × 4 checker of both. Without it, the value rounds to the nearest step. Cells are baked into the shared paint sheet, which has a few millimetres per texel on a 1.5 m model. Keep `size` several paint texels wide (1.5 to 3 cm on an animal that size) so cell edges stay crisp; `createBuilder({ paintSize: 2048 })` makes the sheet finer.

```ts
const GREEN = ["#0c1808", "#1a3010", "#2c5018", "#457c1c", "#6aa42c", "#9ccc4c"].map((c) => snapColor(c, 64));
const SKIN = cellPaint(
  0.02,
  (c) => (c.random(3) < 0.05 ? "#0a0806" : c.pick(GREEN, 0.4 + 0.35 * c.n.y + 0.6 * (noise(c.at, 0.12, 2) - 0.5))),
  { dither: true },
);
b.sweep(tail, [0.08, 0.035], { color: SKIN });
```

### `pick(ramp, value, threshold = 0.5)`

Returns the step of `ramp` for `value` in 0..1 (clamped). Between two steps, it takes the upper one when the fraction past the lower one is over `threshold`: `0.5` rounds, and a `bayer` value dithers. The ramp can hold any values, not only colours.

### `bayer(x, y): number`

The 4 × 4 Bayer ordered-dither threshold at integer cell (x, y). It returns one of 16 evenly spaced values in (0, 1) and tiles every 4 cells, negative cells included. Use it on grid pixels (`pick(RAMP, v, bayer(x, y))`) and for dithered edges (`if (shade < bayer(c.u, c.v)) ...`).

### `snapColor(color, palette | levels): string`

With a palette (a list of colour strings or `Rgb`), returns the entry nearest to `color` by straight sRGB distance. With a number, snaps each channel of `color` to that many evenly spaced levels: 64 for VGA's 6-bit DAC, 32 for 15-bit colour, 4 for EGA-like steps. Either way it returns `"#rrggbb"`. Snap your ramps once at the top of the file.

## Staircase outlines

### `stepped(spans, cell, { rows?, start? }?): [x, y, "sharp"][]`

Makes a pixel-staircase outline for `b.extrude` (or `b.lathe`), with every corner sharp. `spans` gives one `[from, to]` per column, left to right, in cells. Column i covers x from `start + i` to `start + i + 1` (`start` defaults to 0) and y from `from` to `to`. With `rows: true`, spans are rows, bottom to top: row i covers y from `start + i` to `start + i + 1` and x from `from` to `to`. `cell` is meters per cell, or `[x, y]`. Neighbouring spans must overlap so the outline stays one piece.

```ts
// A pointed ear, one row per cell, bottom first, mirrored by the extrude's x direction.
const EAR = stepped(
  [
    [0, 3],
    [0, 3],
    [1, 3],
    [1, 2],
  ],
  TEXEL,
  { rows: true },
);
for (const s of [1, -1])
  b.extrude(EAR, { at: head.local([s * 0.1, 0.12, 0]), x: [s, 0, 0], thickness: 0.02, color: SKIN, bone: head });
// A symmetric crest from half widths: rows [-hw, hw].
const CREST = stepped(
  [3, 3, 2, 1].map((hw) => [-hw, hw] as [number, number]),
  TEXEL,
  { rows: true },
);
```

### Source: kits/pixel.ts

```ts
// Pixel-art kit: hard square texels on textures, boxes and paints. Pixel textures come from character grids or a
// draw callback; boxes crop a tile or read a Minecraft-style skin sheet at a fixed texel size; `cellPaint` snaps a
// paint to square cells in meters with optional ordered dither; `stepped` draws staircase outlines for `extrude`.
import { BoxGeometry, Vector3 } from "three";
import type { Texture } from "three";
import { vec } from "agentic-3js-builder";
import type { V3 } from "agentic-3js-builder";
import { paint, rgb } from "agentic-3js-builder";
import type { ColorInput, Paint, Rgb, SurfaceCoords } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";

// ---------------------------------------------------------------------------------------------------------------
// Pixel textures

/** A pixel rectangle `[x, y, w, h]`: x from the left, y down from the top row. */
export type Rect = readonly [number, number, number, number];

/** A w × h grid of colour strings ("" is transparent), x from the left, y down from the top row. */
export class PixelGrid {
  private readonly cells: string[][];

  constructor(
    readonly w: number,
    readonly h: number,
  ) {
    if (!(Number.isInteger(w) && Number.isInteger(h) && w > 0 && h > 0))
      throw new Error(`PixelGrid: size ${w} x ${h} must be positive whole pixels`);
    this.cells = Array.from({ length: h }, () => Array<string>(w).fill(""));
  }

  /** The colour at (x, y); "" when transparent or outside the grid. */
  get(x: number, y: number) {
    return this.cells[y]?.[x] ?? "";
  }

  /** Sets one pixel; "" clears it. Pixels outside the grid are skipped, so stamps may hang over an edge. */
  set(x: number, y: number, color: string) {
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.cells[y][x] = color;
  }

  /**
   * Fills every pixel of `rect` (default: the whole grid) from `fn(x, y, w, h)`, with x and y local to the rect and
   * w, h its size. Returning "" or undefined leaves that pixel as it is.
   */
  fill(fn: (x: number, y: number, w: number, h: number) => string | undefined, rect: Rect = [0, 0, this.w, this.h]) {
    const [rx, ry, rw, rh] = rect;
    for (let y = 0; y < rh; y++)
      for (let x = 0; x < rw; x++) {
        const c = fn(x, y, rw, rh);
        if (c) this.set(rx + x, ry + y, c);
      }
  }

  /** Draws character rows with their top-left corner at (x, y); "." and " " leave pixels as they are. */
  stamp(x: number, y: number, rows: readonly string[], palette: Readonly<Record<string, string>>) {
    rows.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        const ch = row[i];
        if (ch === "." || ch === " ") continue;
        const c = palette[ch];
        if (c === undefined) throw new Error(`stamp(): "${ch}" (row ${j}, column ${i}) is not in the palette`);
        this.set(x + i, y + j, c);
      }
    });
  }
}

/**
 * A pixel texture drawn on a `w` × `h` grid by `draw`. Every grid pixel becomes an exact square block of raster
 * pixels (grids under 8 pixels are scaled up by a whole number), magnified without smoothing.
 */
export function pixelTexture(w: number, h: number, draw: (g: PixelGrid) => void): Texture {
  const g = new PixelGrid(w, h);
  draw(g);
  return rasterize(g);
}

/**
 * A pixel texture from character rows (top row first), one character per pixel, coloured from `palette`. "." and
 * " " are transparent; any other character must be in the palette.
 */
export function pixelArt(rows: readonly string[], palette: Readonly<Record<string, string>>): Texture {
  const w = rows[0]?.length ?? 0;
  const ragged = rows.findIndex((r) => r.length !== w);
  if (ragged >= 0) throw new Error(`pixelArt(): row ${ragged} is ${rows[ragged].length} wide, row 0 is ${w}`);
  return pixelTexture(w, rows.length, (g) => g.stamp(0, 0, rows, palette));
}

/** The largest raster `svg()` makes. */
const MAX_RASTER = 2048;
/** The smallest raster `svg()` makes. */
const MIN_RASTER = 8;

function rasterize(g: PixelGrid) {
  const { w, h } = g;
  const long = Math.max(w, h);
  if (long > MAX_RASTER) throw new Error(`pixelTexture(): ${w} x ${h} is over ${MAX_RASTER} pixels on a side`);
  const scale = Math.ceil(MIN_RASTER / long);
  const rects: string[] = [];
  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      const c = g.get(x, y);
      let n = 1;
      while (x + n < w && g.get(x + n, y) === c) n++;
      if (c) rects.push(`<rect x="${x}" y="${y}" width="${n}" height="1" fill="${c}"/>`);
      x += n;
    }
  }
  const texture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${rects.join("")}</svg>`,
    { size: long * scale, pixelated: true },
  );
  texture.userData.pixels = [w, h];
  return texture;
}

/** The grid size of a kit texture. */
function gridOf(texture: Texture, caller: string): readonly [number, number] {
  const size = texture.userData.pixels as readonly [number, number] | undefined;
  if (!size) throw new Error(`${caller}: the texture must come from pixelTexture() or pixelArt()`);
  return size;
}

// ---------------------------------------------------------------------------------------------------------------
// Boxes

/** The box faces in `BoxGeometry` order: +x, −x, +y, −y, +z, −z. */
export type BoxFace = "px" | "nx" | "py" | "ny" | "pz" | "nz";
const FACES: readonly BoxFace[] = ["px", "nx", "py", "ny", "pz", "nz"];

function boxSize(size: V3) {
  const s = vec(size);
  if (!(s.x > 0 && s.y > 0 && s.z > 0)) throw new Error(`box size ${s.x}, ${s.y}, ${s.z} must be positive`);
  return s;
}

/**
 * A `BoxGeometry` of `size` meters whose faces each show a crop of `tile` at `texel` meters per pixel, so texels
 * are square on every face of any box. A face larger than the tile at that texel size shows the whole tile with
 * bigger (still square) texels. Crops start at the tile's top-left; `rand` moves each face's crop to a random whole
 * pixel offset, in multiples of `step` pixels (a number, or `[x, y]`: `[1, 6]` keeps 6-pixel planks aligned).
 */
export function tileBox(
  size: V3,
  tile: Texture,
  texel: number,
  options: { rand?: () => number; step?: number | readonly [number, number] } = {},
) {
  const [tw, th] = gridOf(tile, "tileBox()");
  if (!(texel > 0)) throw new Error(`tileBox(): texel ${texel} must be positive`);
  const s = boxSize(size);
  const [sx, sy] = typeof options.step === "number" ? [options.step, options.step] : (options.step ?? [1, 1]);
  const offset = (free: number, step: number) =>
    options.rand ? Math.floor(options.rand() * (Math.floor(free / step + 1e-9) + 1)) * step : 0;
  const geo = new BoxGeometry(s.x, s.y, s.z);
  const uv = geo.getAttribute("uv");
  // Face width and height in meters, in BoxGeometry face order.
  const faces = [
    [s.z, s.y],
    [s.z, s.y],
    [s.x, s.z],
    [s.x, s.z],
    [s.x, s.y],
    [s.x, s.y],
  ];
  faces.forEach(([fw, fh], f) => {
    const fit = Math.max(1, fw / texel / tw, fh / texel / th);
    const nu = fw / texel / fit;
    const nv = fh / texel / fit;
    const x0 = offset(tw - nu, sx);
    const y0 = offset(th - nv, sy);
    for (let i = 0; i < 4; i++) {
      const k = f * 4 + i;
      uv.setXY(k, (x0 + uv.getX(k) * nu) / tw, 1 - (y0 + (1 - uv.getY(k)) * nv) / th);
    }
  });
  return geo;
}

/** Where each face of a skin box sits on its sheet. */
export type SkinFaces = Readonly<Record<BoxFace, Rect>>;

/**
 * The Minecraft skin layout of a box `w` × `h` × `d` pixels with its top-left corner at (x, y): a block
 * 2(w + d) wide and d + h tall, with top (py) and bottom (ny) in the first d rows, then the sides left to right:
 * nx, pz (front), px, nz (back).
 */
export function skinFaces(x: number, y: number, [w, h, d]: readonly [number, number, number]): SkinFaces {
  return {
    py: [x + d, y, w, d],
    ny: [x + d + w, y, w, d],
    nx: [x, y + d, d, h],
    pz: [x + d, y + d, w, h],
    px: [x + d + w, y + d, d, h],
    nz: [x + 2 * d + w, y + d, w, h],
  };
}

/**
 * Packs several skin boxes (`name: [w, h, d]` pixels) on one sheet `width` pixels wide, in rows, in the order
 * given. Returns the sheet `size` to draw with `pixelTexture(...size, draw)` and each box's `faces`.
 */
export function skinLayout<K extends string>(
  boxes: Readonly<Record<K, readonly [number, number, number]>>,
  width = 64,
): { size: [number, number]; faces: Record<K, SkinFaces> } {
  const entries = Object.entries(boxes) as [K, readonly [number, number, number]][];
  const sheetW = Math.max(width, ...entries.map(([, [w, , d]]) => 2 * (w + d)));
  const faces = {} as Record<K, SkinFaces>;
  let x = 0;
  let y = 0;
  let shelf = 0;
  for (const [name, dims] of entries) {
    const [w, h, d] = dims;
    if (x + 2 * (w + d) > sheetW) {
      x = 0;
      y += shelf;
      shelf = 0;
    }
    faces[name] = skinFaces(x, y, dims);
    x += 2 * (w + d);
    shelf = Math.max(shelf, d + h);
  }
  return { size: [sheetW, y + shelf], faces };
}

/**
 * A `BoxGeometry` whose six faces show the rectangles `faces` of `sheet`. Each rectangle is its face as seen from
 * outside: sides upright, the top with the back edge at the rectangle's top row, the bottom with the front edge at
 * its top row. `scale` is meters per pixel (the box is the pixel size of the front and side rectangles, so texels
 * are square), or a box size in meters.
 */
export function skinBox(sheet: Texture, faces: SkinFaces, scale: number | V3) {
  const [W, H] = gridOf(sheet, "skinBox()");
  const s =
    typeof scale === "number"
      ? boxSize([faces.pz[2] * scale, faces.pz[3] * scale, faces.px[2] * scale])
      : boxSize(scale);
  const geo = new BoxGeometry(s.x, s.y, s.z);
  const uv = geo.getAttribute("uv");
  FACES.forEach((face, f) => {
    const [rx, ry, rw, rh] = faces[face];
    for (let i = 0; i < 4; i++) {
      const k = f * 4 + i;
      uv.setXY(k, (rx + uv.getX(k) * rw) / W, 1 - (ry + (1 - uv.getY(k)) * rh) / H);
    }
  });
  return geo;
}

// ---------------------------------------------------------------------------------------------------------------
// Quantized paint

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/** The 4 × 4 Bayer ordered-dither threshold at integer cell (x, y): one of 16 evenly spaced values in (0, 1). */
export function bayer(x: number, y: number) {
  return (BAYER[Math.floor(y) & 3][Math.floor(x) & 3] + 0.5) / 16;
}

/**
 * The step of `ramp` (dark to light, or any order) for `value` 0..1 (clamped). Between two steps it takes the
 * upper one where the fraction past the lower one exceeds `threshold`: 0.5 rounds to the nearest step, a `bayer`
 * value dithers.
 */
export function pick<C>(ramp: readonly C[], value: number, threshold = 0.5): C {
  if (ramp.length === 0) throw new Error("pick(): the ramp is empty");
  if (ramp.length === 1) return ramp[0];
  const x = Math.min(Math.max(value, 0), 1) * (ramp.length - 1);
  const i = Math.min(Math.floor(x), ramp.length - 2);
  return x - i > threshold ? ramp[i + 1] : ramp[i];
}

/**
 * The colour of `palette` nearest `color` (straight sRGB distance), or with a number, `color` with each channel
 * snapped to that many evenly spaced levels (64 for VGA's 6-bit DAC, 32 for 15-bit colour). Returns `"#rrggbb"`.
 */
export function snapColor(color: string | Rgb, palette: readonly (string | Rgb)[] | number): string {
  const c = rgb(color);
  let out: Rgb;
  if (typeof palette === "number") {
    if (!(Number.isInteger(palette) && palette >= 2))
      throw new Error(`snapColor(): ${palette} levels must be 2 or more`);
    const n = palette - 1;
    out = [Math.round(c[0] * n) / n, Math.round(c[1] * n) / n, Math.round(c[2] * n) / n];
  } else {
    if (palette.length === 0) throw new Error("snapColor(): the palette is empty");
    let best = Infinity;
    out = c;
    for (const entry of palette) {
      const p = rgb(entry);
      const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2;
      if (d < best) {
        best = d;
        out = p;
      }
    }
  }
  return `#${out
    .map((v) =>
      Math.round(Math.min(Math.max(v, 0), 1) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

/** Offset of the cell boundaries along the face normal, so a face lying on a round number stays in one cell. */
const DEPTH_SHIFT = 0.37;

/** One square cell of a `cellPaint`, as seen on the face orientation the surface point is closest to. */
export class Cell {
  constructor(
    /** The cell's centre in model space: read positions and noise here so every texel of the cell agrees. */
    readonly at: Vector3,
    /** Whole cell indices across the face: u runs along x (along z on ±x faces), v along y (along z on ±y faces). */
    readonly u: number,
    readonly v: number,
    /** Whole cell index along the face normal. */
    readonly depth: number,
    /** The face orientation: 0 for ±x, 1 for ±y, 2 for ±z. */
    readonly axis: 0 | 1 | 2,
    /** The surface point's unit outward normal and surface coordinates, as a paint gets them. */
    readonly n: Vector3,
    readonly s: SurfaceCoords,
    /** `bayer(u, v)` when the paint dithers, else 0.5. */
    readonly threshold: number,
  ) {}

  /** The step of `ramp` for `value` 0..1, dithered by this cell's `threshold`. */
  pick<C>(ramp: readonly C[], value: number): C {
    return pick(ramp, value, this.threshold);
  }

  /** A deterministic number in [0, 1) for this cell and `seed`: speckles, grain, per-cell palette picks. */
  random(seed = 0) {
    let h = Math.imul(this.u, 374761393) ^ Math.imul(this.v, 668265263) ^ Math.imul(this.depth, 1274126177);
    h ^= Math.imul(this.axis + 1, 2246822519) ^ Math.imul(seed, 1442695041);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
}

/**
 * A paint in square cells `size` meters across. Each surface point is taken to the face orientation (±x, ±y, ±z)
 * its normal is closest to and snapped to that face's cell grid, so cells stay square on boxes and tubes alike.
 * `fn` returns the cell's colour (any colour or paint); `c.pick(ramp, value)` picks a ramp step, dithered with the
 * 4 × 4 Bayer pattern when `dither` is true.
 */
export function cellPaint(size: number, fn: (c: Cell) => ColorInput, options: { dither?: boolean } = {}): Paint {
  if (!(size > 0)) throw new Error(`cellPaint(): size ${size} must be positive`);
  const dither = options.dither ?? false;
  return paint((p, n, s) => {
    const ax = Math.abs(n.x);
    const ay = Math.abs(n.y);
    const az = Math.abs(n.z);
    const axis: 0 | 1 | 2 = ay >= ax && ay >= az ? 1 : ax >= az ? 0 : 2;
    const q = [p.x / size, p.y / size, p.z / size];
    const idx = q.map((c, k) => (k === axis ? Math.floor(c + DEPTH_SHIFT) : Math.floor(c)));
    const centre = idx.map((c, k) => (c + 0.5 - (k === axis ? DEPTH_SHIFT : 0)) * size);
    const u = axis === 0 ? idx[2] : idx[0];
    const v = axis === 1 ? idx[2] : idx[1];
    const cell = new Cell(
      new Vector3(centre[0], centre[1], centre[2]),
      u,
      v,
      idx[axis],
      axis,
      n,
      s,
      dither ? bayer(u, v) : 0.5,
    );
    return fn(cell);
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Staircase outlines

/**
 * A pixel-staircase outline for `b.extrude`, every corner sharp. `spans` lists one `[from, to]` per column, left to
 * right, in cells (column i covers x from `start + i` to `start + i + 1`, y from `from` to `to`); with `rows: true`
 * one per row, bottom to top (row i covers y from `start + i`, x from `from` to `to`). `cell` is meters per cell, or
 * `[x, y]`. Neighbouring spans must overlap so the outline stays one piece.
 */
export function stepped(
  spans: readonly (readonly [number, number])[],
  cell: number | readonly [number, number],
  options: { rows?: boolean; start?: number } = {},
): [number, number, "sharp"][] {
  if (spans.length === 0) throw new Error("stepped(): no spans");
  spans.forEach(([a, b], i) => {
    if (!(b > a)) throw new Error(`stepped(): span ${i} [${a}, ${b}] must run low to high`);
    if (i > 0 && !(a < spans[i - 1][1] && b > spans[i - 1][0]))
      throw new Error(`stepped(): spans ${i - 1} and ${i} don't overlap`);
  });
  const [cx, cy] = typeof cell === "number" ? [cell, cell] : cell;
  const start = options.start ?? 0;
  // Trace in (along, across) cells: low edges forward, high edges back.
  const loop: [number, number][] = [];
  spans.forEach(([lo], i) => loop.push([start + i, lo], [start + i + 1, lo]));
  for (let i = spans.length - 1; i >= 0; i--) loop.push([start + i + 1, spans[i][1]], [start + i, spans[i][1]]);
  // Drop repeated points and the middles of straight runs.
  const pts = loop.filter(([x, y], i) => {
    const [px, py] = loop[(i + loop.length - 1) % loop.length];
    return x !== px || y !== py;
  });
  const corners = pts.filter(([x, y], i) => {
    const [px, py] = pts[(i + pts.length - 1) % pts.length];
    const [nx, ny] = pts[(i + 1) % pts.length];
    return !((px === x && x === nx) || (py === y && y === ny));
  });
  return corners.map(([a, b]) => (options.rows ? [b * cx, a * cy, "sharp"] : [a * cx, b * cy, "sharp"]));
}
```

## Kit: toon

# Toon kit

Cel-shaded cartoon look in the spirit of Wind Waker and modern anime games, baked into paints:

- every colour is two tones, a lit tone and one hard shadow tone, picked by the surface normal against a fixed key
  light; the shadow is hue-shifted (warm colours go redder, cool colours bluer), never just darker;
- zig-zag fur edges divide one colour from the next;
- ink lines sit where they read: on fur edges, at set normal angles, and as thin dark sweeps;
- big shiny anime eyes are SVG drawings conformed onto the skull with `b.decal`.

```ts
import { animeEye, cel, furEdge, INK, inkLines, KEY_LIGHT, shadowOf, zigzag } from "agentic-3js-builder/kits/toon";
```

All paints below return a `Paint`, usable anywhere a `color` option takes one, and nest inside each other and inside
your own `paint((p, n, s) => ...)`.

## Palette

Build the palette once at the top of the file, one `cel` per surface colour:

```ts
const ORANGE = cel("#ffb036"); // shadow tone derived by shadowOf
const CREAM = cel("#fff4d2", "#f9d4a6"); // shadow tone given
const TEAL = cel("#27dccb");
const NOSE = cel("#3c2258", INK);
```

Ink itself is a flat colour string (`INK`), used for lines, pupils and toe beans.

## `cel(lit, shadow?, options?)`

```ts
cel(lit: ColorInput, shadow?: ColorInput, options?: { light?: V3; threshold?: number }): Paint
```

`lit` where `n · light > threshold`, `shadow` elsewhere, with a hard edge. `light` defaults to `KEY_LIGHT`,
`threshold` to 0.1 (raise it for more shadow). `shadow` defaults to `shadowOf(lit)`. `lit` may be another paint: its
colour at each point is shaded there, so a patterned coat turns cel-shaded in one call.

```ts
const COAT = cel(furEdge("#ff6a2b", "#fff6df", { level: -0.1, teeth: 0.26, period: 0.03 }));
```

## `shadowOf(color)`

```ts
shadowOf(color: string | Rgb): Rgb
```

The shadow tone `cel` derives: darker, hue turned toward blue-violet. `#ffb036` → `#f06414`, `#27dccb` → `#289eb2`.
Pass an explicit shadow to `cel` when a colour needs a specific one.

## `KEY_LIGHT`, `INK`

```ts
KEY_LIGHT: V3 = [0.35, 0.8, 0.5]; // up, in front, a little to the creature's left
INK = "#22112f"; // deep plum-black
```

## `furEdge(above, below, options)`

```ts
furEdge(above: ColorInput, below: ColorInput, options: {
  teeth: number;          // tooth depth, in the measure's units
  period: number;         // tooth spacing, meters
  axis?: V3;              // measured direction, default [0, 1, 0]
  by?: "normal" | "position"; // measure n · axis (default, -1..1) or p · axis (meters)
  level?: number;         // where the edge sits, default 0
  along?: V3;             // direction the teeth march along, default [0, 0, 1]
  ink?: ColorInput;       // an ink line on the edge
  inkWidth?: number;      // default 0.06 (normal) / 0.004 m (position)
}): Paint
```

`above` where the measure is past the toothed edge, `below` short of it. The edge swings between `level` and
`level + teeth` in a triangle wave along `along`.

```ts
// Cream belly under an orange coat on a body running along z, inked edge.
const coat = furEdge(ORANGE, CREAM, { level: -0.22, teeth: 0.22, period: 0.024, ink: INK });

// Cream muzzle below a height on the head, teeth marching across x.
const face = furEdge(ORANGE, CREAM, { by: "position", level: 0.25, teeth: 0.016, period: 0.022, along: [1, 0, 0] });

// Cream bib facing forward.
const bib = furEdge(CREAM, coat, { axis: [0, 0, 1], level: 0.12, teeth: 0.3, period: 0.02, along: [1, 0, 0] });
```

## `inkLines(base, options)`

```ts
inkLines(base: ColorInput, options: {
  levels: readonly number[]; // values of n · axis where lines are drawn
  width?: number;            // in n · axis units, default 0.06
  axis?: V3;                 // default [0, 0, 1]
  ink?: ColorInput;          // default INK
}): Paint
```

Ink rings where the surface normal crosses set angles to `axis`: level 0 rings a part where it turns away from
`axis` (a rim round a snout seen from the front), other levels draw creases, cuffs and eyelid lines.

```ts
const snout = inkLines(ORANGE, { levels: [0.2], axis: [0, 0, 1] }); // rim a little in front of the widest ring
const cuff = inkLines(TEAL, { levels: [-0.5, 0.5], axis: [0, 1, 0], width: 0.08 });
```

## `zigzag(x)`

```ts
zigzag(x: number): number
```

Triangle wave, period 1, range 0..1: the teeth of any zig-zag edge in your own paints.

```ts
const saddle = paint((p, n) => (n.y > 0.5 && Math.abs(p.x) < 0.006 + 0.009 * zigzag(p.z / 0.03) ? RUST : ORANGE));
```

## `animeEye(options)`

```ts
animeEye(options: {
  iris: string;          // iris middle colour
  irisLight?: string;    // lower glow, default iris lightened
  irisDark?: string;     // upper shade under the lid, default a double shadowOf(iris)
  ink?: string;          // default INK
  blush?: string | false; // default "#ff7aa6"
  brow?: boolean;        // default true
  size?: number;         // raster px, default 512
}): Texture
```

A big shiny anime eye, 70 × 96 (width : height 0.73): ink almond, three-tone iris, a tall pupil, two hard highlights,
lash flicks, a brow and a blush. As drawn it is the creature's right eye seen from the front (lash flicks and blush at
the outer corner, on the drawing's left); `mirror: true` on the decal makes the left eye. Make one texture and use it
for both eyes.

```ts
const EYE = animeEye({ iris: "#ff8a1c" });
const skull = b.part(new SphereGeometry(1, 16, 12), skullPaint, { bone: head, at: HEAD_C, scale: [0.08, 0.066, 0.07] });
const skin = b.surface(skull);
for (const s of [1, -1]) {
  const hit = skin.around(HEAD_C).at(s * 38, 2)!; // s = 1: the creature's left (+x)
  b.decal(skin, EYE, { at: hit, size: [0.05, 0.068], mirror: s > 0 });
}
```

The eye rides the bones under it; size it so it covers a good share of the face.

### Source: kits/toon.ts

```ts
// Toon kit: cel shading baked into paints. Every colour is a lit tone and one hard, hue-shifted shadow tone chosen by
// the surface normal against a fixed key light; zig-zag fur edges split one colour from the next; ink lines sit at
// normal thresholds; big shiny anime eyes are SVG drawings meant for `b.decal`.
import { Color, SRGBColorSpace } from "three";
import type { Texture } from "three";
import { vec } from "agentic-3js-builder";
import type { V3 } from "agentic-3js-builder";
import { mix, Paint, paint, resolve, rgb } from "agentic-3js-builder";
import type { ColorInput, Rgb } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";

/** The fixed key light every cel paint shades against: up, in front, a little to the creature's left. */
export const KEY_LIGHT: V3 = [0.35, 0.8, 0.5];

/** The default ink: a deep plum-black that reads as line work, not a hole. */
export const INK = "#22112f";

const WARM_TO_COOL = 0.78; // hue (0..1) shadows drift toward: blue-violet
const HUE_SHIFT = 0.04;
const scratch = new Color();
const out = { r: 0, g: 0, b: 0 };
const hsl = { h: 0, s: 0, l: 0 };

/**
 * The shadow tone of a colour: darker, hue turned toward blue-violet (warm colours go redder, cool colours bluer),
 * so shade reads as coloured light rather than grey. `#ffb036` → `#f06414`, `#27dccb` → `#289eb2`.
 */
export function shadowOf(color: string | Rgb): Rgb {
  const [r, g, b] = rgb(color);
  scratch.setRGB(r, g, b, SRGBColorSpace).getHSL(hsl, SRGBColorSpace);
  let toward = WARM_TO_COOL - hsl.h;
  if (toward > 0.5) toward -= 1;
  if (toward < -0.5) toward += 1;
  const h = hsl.h + Math.sign(toward) * Math.min(Math.abs(toward), HUE_SHIFT) + 1;
  scratch.setHSL(h % 1, hsl.s * 0.88, hsl.l * 0.84, SRGBColorSpace).getRGB(out, SRGBColorSpace);
  return [out.r, out.g, out.b];
}

export type CelOptions = {
  /** Key light direction (default `KEY_LIGHT`). */
  light?: V3;
  /** Lit where `n · light` exceeds this (default 0.1): higher puts more of the surface in shadow. */
  threshold?: number;
};

/**
 * Two-tone cel paint: `lit` where the surface faces the key light, `shadow` elsewhere, with a hard edge between.
 * `shadow` defaults to `shadowOf(lit)`. `lit` may be another paint (a patterned coat): its colour at each point is
 * shaded there.
 */
export function cel(lit: ColorInput, shadow?: ColorInput, options: CelOptions = {}): Paint {
  const light = vec(options.light ?? KEY_LIGHT).normalize();
  const threshold = options.threshold ?? 0.1;
  const fixedShadow = shadow ?? (lit instanceof Paint ? null : shadowOf(lit));
  return paint((p, n) => {
    if (n.dot(light) > threshold) return lit;
    return fixedShadow ?? shadowOf(resolve(lit, p, n));
  });
}

/** Triangle wave, period 1, range 0..1: the teeth of a zig-zag edge. */
export function zigzag(x: number) {
  return Math.abs((x - Math.floor(x)) * 2 - 1);
}

export type FurEdgeOptions = {
  /** The direction measured (default [0, 1, 0]: `above` on top, `below` underneath). */
  axis?: V3;
  /** Measure the surface normal along `axis` ("normal", default, -1..1) or the model-space position ("position", m). */
  by?: "normal" | "position";
  /** Where the edge sits along the measure (default 0). */
  level?: number;
  /** Tooth depth, in the measure's units: the edge swings from `level` to `level + teeth`. */
  teeth: number;
  /** Tooth spacing in meters. */
  period: number;
  /** The direction the teeth march along (default [0, 0, 1], along a body that runs along z). */
  along?: V3;
  /** An ink line drawn on the edge. */
  ink?: ColorInput;
  /** Ink line width, in the measure's units (default 0.06 for normals, 0.004 m for positions). */
  inkWidth?: number;
};

/**
 * A zig-zag fur edge: `above` where the measure along `axis` is past the toothed edge, `below` where it is short of
 * it. A belly: `furEdge(COAT, CREAM, { level: -0.2, teeth: 0.22, period: 0.024 })`.
 */
export function furEdge(above: ColorInput, below: ColorInput, options: FurEdgeOptions): Paint {
  const axis = vec(options.axis ?? [0, 1, 0]).normalize();
  const along = vec(options.along ?? [0, 0, 1]).normalize();
  const byNormal = (options.by ?? "normal") === "normal";
  const level = options.level ?? 0;
  const half = (options.inkWidth ?? (byNormal ? 0.06 : 0.004)) / 2;
  return paint((p, n) => {
    const d = (byNormal ? n : p).dot(axis) - (level + options.teeth * zigzag(p.dot(along) / options.period));
    if (options.ink !== undefined && Math.abs(d) < half) return options.ink;
    return d >= 0 ? above : below;
  });
}

export type InkLinesOptions = {
  /** Values of `n · axis` where lines are drawn (-1..1): 0 rings the part where it turns away from `axis`. */
  levels: readonly number[];
  /** Line width in `n · axis` units (default 0.06). */
  width?: number;
  /** Direction the normal is measured along (default [0, 0, 1], the front). */
  axis?: V3;
  /** Line colour (default `INK`). */
  ink?: ColorInput;
};

/**
 * Ink lines painted where the surface normal crosses set angles to `axis`: a rim round a snout, a crease round an
 * eyelid, bands round a cuff. `base` everywhere else.
 */
export function inkLines(base: ColorInput, options: InkLinesOptions): Paint {
  const axis = vec(options.axis ?? [0, 0, 1]).normalize();
  const half = (options.width ?? 0.06) / 2;
  const ink = options.ink ?? INK;
  return paint((_p, n) => {
    const c = n.dot(axis);
    return options.levels.some((level) => Math.abs(c - level) < half) ? ink : base;
  });
}

export type AnimeEyeOptions = {
  /** Iris middle colour. */
  iris: string;
  /** Iris lower glow (default a lighter `iris`). */
  irisLight?: string;
  /** Iris upper shade under the lid (default `shadowOf(iris)` darkened). */
  irisDark?: string;
  /** Line colour (default `INK`). */
  ink?: string;
  /** Blush under the eye, or false for none (default "#ff7aa6"). */
  blush?: string | false;
  /** Brow stroke above the eye (default true). */
  brow?: boolean;
  /** Raster size, longest side in pixels (default 512). */
  size?: number;
};

const hex = (c: Rgb) => `#${new Color().setRGB(c[0], c[1], c[2], SRGBColorSpace).getHexString(SRGBColorSpace)}`;

/**
 * A big shiny anime eye as a texture, 70 × 96 (width : height 0.73). As drawn it is the creature's RIGHT eye seen
 * from the front: lash flicks and blush at the outer corner, on the drawing's left. Pass `mirror: true` to `b.decal`
 * for the left eye. Ink almond, three-tone iris, a tall pupil, two hard highlights, a brow and a blush.
 */
export function animeEye(options: AnimeEyeOptions): Texture {
  const ink = options.ink ?? INK;
  const light = options.irisLight ?? hex(mix(options.iris, "#ffffff", 0.45));
  const dark = options.irisDark ?? hex(shadowOf(shadowOf(options.iris)));
  const blush = options.blush ?? "#ff7aa6";
  return svg(
    `<svg viewBox="0 0 70 96">
    <defs><clipPath id="iris"><ellipse cx="39" cy="52" rx="22" ry="29"/></clipPath></defs>
    ${blush ? `<ellipse cx="17" cy="85" rx="13" ry="7" fill="${blush}"/>` : ""}
    ${blush ? `<path d="M9 89 l4 -7 M16 90 l4 -7 M23 89 l4 -7" stroke="${hex(shadowOf(blush))}" stroke-width="2.4" stroke-linecap="round" fill="none"/>` : ""}
    <ellipse cx="39" cy="50" rx="27" ry="35" fill="${ink}"/>
    <g clip-path="url(#iris)">
      <rect x="0" y="0" width="70" height="96" fill="${options.iris}"/>
      <rect x="0" y="60" width="70" height="40" fill="${light}"/>
      <ellipse cx="39" cy="22" rx="28" ry="15" fill="${dark}"/>
    </g>
    <ellipse cx="39" cy="52" rx="22" ry="29" fill="none" stroke="${ink}" stroke-width="2.4"/>
    <ellipse cx="39" cy="54" rx="10.5" ry="18" fill="${ink}"/>
    <ellipse cx="29" cy="37" rx="8.5" ry="10.5" fill="#ffffff"/>
    <circle cx="48" cy="67" r="4.4" fill="#ffffff"/>
    <circle cx="52" cy="57" r="2" fill="#ffffff"/>
    <path d="M14 30 Q6 22 2 11" stroke="${ink}" stroke-width="5.5" stroke-linecap="round" fill="none"/>
    <path d="M13 43 Q6 42 1 37" stroke="${ink}" stroke-width="4" stroke-linecap="round" fill="none"/>
    ${options.brow === false ? "" : `<path d="M29 9 Q44 1 62 11" stroke="${ink}" stroke-width="4.6" stroke-linecap="round" fill="none"/>`}
  </svg>`,
    { size: options.size ?? 512 },
  );
}
```

# Selected SDK source

These files are part of the module `"agentic-3js-builder"`.

## src/paint.ts

```ts
// Paints: colour as a function of model-space position and surface normal (and, where the part has them, its own
// surface coordinates). Any `color` option takes one; the SDK bakes it into a texture over the part's surface, so a
// pattern runs on across body, legs and tail at one size in meters. The ready-made paints below take colours or
// other paints for every colour, so they nest.
import { Color, SRGBColorSpace, Vector3 } from "three";
import { axisVector, toPoint } from "./math";
import type { Axis, PointInput, V3 } from "./math";

/** An sRGB colour, each channel 0..1. */
export type Rgb = readonly [number, number, number];
/** A colour anywhere a paint takes one: `"#rrggbb"` (any CSS colour name works), an `Rgb`, or another paint. */
export type ColorInput = string | Rgb | Paint;
/** One colour or a list; a list gives each spot, patch or scale one of them at random. */
export type Colors = ColorInput | readonly ColorInput[];
/**
 * A part's own coordinates at a surface point: sweeps and lofts `[t, deg]` (source t, and the dorsal clock angle of
 * `sweep.at`), extrude `[x, y]` (the outline's meters), lathe `[height, deg]`, membranes `[along, across]` (0..1),
 * slabs `[x, y]` (meters in the polygon's plane), three.js geometries their `uv`, and `[0, 0]` elsewhere.
 */
export type SurfaceCoords = readonly [number, number];
export type PaintFn = (p: Vector3, n: Vector3, s: SurfaceCoords) => ColorInput;

let nextId = 0;
const NOWHERE: SurfaceCoords = [0, 0];
/** The surface coordinates of the point being painted, so paints nested inside another read them too. */
let current: SurfaceCoords = NOWHERE;

/**
 * A colour at every surface point. `at(p, n, s?)` reads it: `p` a model-space point, `n` the unit outward normal
 * there, `s` the part's own surface coordinates (see `SurfaceCoords`).
 */
export class Paint {
  readonly id = ++nextId;

  constructor(private readonly fn: PaintFn) {}

  at(p: Vector3, n: Vector3, s?: SurfaceCoords): Rgb {
    if (!s) return resolve(this.fn(p, n, current), p, n);
    const outer = current;
    current = s;
    try {
      return resolve(this.fn(p, n, s), p, n);
    } finally {
      current = outer;
    }
  }

  /** Sweeps compare colours as strings when they split a tube; every paint is its own colour. */
  toString() {
    return `paint#${this.id}`;
  }
}

/**
 * Your own paint: `(p, n, s) => colour`, where the colour may be another paint (`p.y < 0.3 ? SOCK : coat`) and `s`
 * is the part's own surface coordinates (on a tube, a stripe that spirals round it depends on both t and angle).
 */
export function paint(fn: PaintFn) {
  return new Paint(fn);
}

const parsed = new Map<string, Rgb>();
const scratch = new Color();

/** The sRGB channels of a colour string, an `Rgb` as it is. */
export function rgb(color: string | Rgb): Rgb {
  if (typeof color !== "string") return color;
  let out = parsed.get(color);
  if (!out) {
    scratch.setStyle(color, SRGBColorSpace);
    const target = { r: 0, g: 0, b: 0 };
    scratch.getRGB(target, SRGBColorSpace);
    out = [target.r, target.g, target.b];
    parsed.set(color, out);
  }
  return out;
}

/** The colour of `c` at a surface point. */
export function resolve(c: ColorInput, p: Vector3, n: Vector3): Rgb {
  return c instanceof Paint ? c.at(p, n) : rgb(c);
}

/** `a` blended toward `b` by `t` (0 = a, 1 = b). */
export function mix(a: string | Rgb, b: string | Rgb, t: number): Rgb {
  const x = rgb(a);
  const y = rgb(b);
  const s = Math.min(Math.max(t, 0), 1);
  return [x[0] + (y[0] - x[0]) * s, x[1] + (y[1] - x[1]) * s, x[2] + (y[2] - x[2]) * s];
}

/** 0 below `e0`, 1 above `e1`, a smooth ramp between. */
export function smoothstep(e0: number, e1: number, x: number) {
  const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1);
  return t * t * (3 - 2 * t);
}

// ---------------------------------------------------------------------------------------------------------------
// Noise

function hash(x: number, y: number, z: number, seed: number) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 1274126177) + Math.imul(seed, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

/** A deterministic number in [0, 1) for integer coordinates. */
const unit = (x: number, y: number, z: number, seed: number) => hash(x, y, z, seed) / 4294967296;

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

// The gradient for each of the 16 hash values: `GX[h] * x + GY[h] * y + GZ[h] * z`.
const GX = [1, -1, 1, -1, 1, -1, 1, -1, 0, 0, 0, 0, 1, -1, 0, 0];
const GY = [1, 1, -1, -1, 0, 0, 0, 0, 1, -1, 1, -1, 1, 1, -1, -1];
const GZ = [0, 0, 0, 0, 1, 1, -1, -1, 1, 1, -1, -1, 0, 0, 1, -1];

function grad(h: number, x: number, y: number, z: number) {
  const i = h & 15;
  return GX[i] * x + GY[i] * y + GZ[i] * z;
}

/** Gradient noise, about -1..1, one feature per unit. */
function perlin(x: number, y: number, z: number, seed: number) {
  const X = Math.floor(x);
  const Y = Math.floor(y);
  const Z = Math.floor(z);
  const fx = x - X;
  const fy = y - Y;
  const fz = z - Z;
  const u = fade(fx);
  const v = fade(fy);
  const w = fade(fz);
  const g000 = grad(hash(X, Y, Z, seed), fx, fy, fz);
  const g100 = grad(hash(X + 1, Y, Z, seed), fx - 1, fy, fz);
  const g010 = grad(hash(X, Y + 1, Z, seed), fx, fy - 1, fz);
  const g110 = grad(hash(X + 1, Y + 1, Z, seed), fx - 1, fy - 1, fz);
  const g001 = grad(hash(X, Y, Z + 1, seed), fx, fy, fz - 1);
  const g101 = grad(hash(X + 1, Y, Z + 1, seed), fx - 1, fy, fz - 1);
  const g011 = grad(hash(X, Y + 1, Z + 1, seed), fx, fy - 1, fz - 1);
  const g111 = grad(hash(X + 1, Y + 1, Z + 1, seed), fx - 1, fy - 1, fz - 1);
  const x00 = g000 + u * (g100 - g000);
  const x10 = g010 + u * (g110 - g010);
  const x01 = g001 + u * (g101 - g001);
  const x11 = g011 + u * (g111 - g011);
  const y0 = x00 + v * (x10 - x00);
  const y1 = x01 + v * (x11 - x01);
  return y0 + w * (y1 - y0);
}

/**
 * Smooth cloudy noise in 0..1 (mean 0.5) with features about `size` meters across: three octaves of gradient noise.
 * The same `seed` gives the same field everywhere, so neighbouring parts continue it.
 */
export function noise(p: Vector3, size: number, seed = 0) {
  let sum = 0;
  let amp = 1;
  let f = 1 / size;
  for (let o = 0; o < 3; o++) {
    sum += amp * perlin(p.x * f + o * 17.1, p.y * f + o * 31.7, p.z * f + o * 11.3, seed + o * 101);
    amp *= 0.5;
    f *= 2;
  }
  return Math.min(Math.max(0.5 + sum * 0.55, 0), 1);
}

/** The nearest scattered feature point to `p`: cells about `size` meters across. */
export type Cell = {
  /** Distance to the nearest feature point, in units of `size`. */
  d1: number;
  /** Distance to the second nearest; `d2 - d1` is 0 on a border between two cells. */
  d2: number;
  /** A random number in [0, 1) that is the same over the whole cell. */
  id: number;
  /** The nearest feature point, model space. */
  center: Vector3;
};

/** Cellular (Worley) noise: which randomly placed cell `p` falls in, and how far it is from the cell border. */
export function cells(p: Vector3, size: number, seed = 0): Cell {
  const x = p.x / size;
  const y = p.y / size;
  const z = p.z / size;
  const X = Math.floor(x);
  const Y = Math.floor(y);
  const Z = Math.floor(z);
  let d1 = Infinity;
  let d2 = Infinity;
  // The nearest cell's integer corner and its feature point.
  let bx = 0;
  let by = 0;
  let bz = 0;
  let fx = 0;
  let fy = 0;
  let fz = 0;
  for (let i = -1; i <= 1; i++)
    for (let j = -1; j <= 1; j++)
      for (let k = -1; k <= 1; k++) {
        const cx = X + i;
        const cy = Y + j;
        const cz = Z + k;
        const px = cx + unit(cx, cy, cz, seed);
        const py = cy + unit(cx, cy, cz, seed + 7);
        const pz = cz + unit(cx, cy, cz, seed + 13);
        const dx = px - x;
        const dy = py - y;
        const dz = pz - z;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d < d1) {
          d2 = d1;
          d1 = d;
          bx = cx;
          by = cy;
          bz = cz;
          fx = px;
          fy = py;
          fz = pz;
        } else if (d < d2) d2 = d;
      }
  return {
    d1,
    d2,
    id: unit(bx, by, bz, seed + 29),
    center: new Vector3(fx * size, fy * size, fz * size),
  };
}

/** `p` pushed about by smooth noise, up to `amount` meters: ragged, organic edges for any pattern read at it. */
function warp(p: Vector3, size: number, amount: number, seed: number) {
  if (!amount) return p;
  const f = 1 / size;
  return new Vector3(
    p.x + amount * perlin(p.x * f, p.y * f, p.z * f, seed + 1),
    p.y + amount * perlin(p.x * f + 5.2, p.y * f + 1.3, p.z * f, seed + 2),
    p.z + amount * perlin(p.x * f, p.y * f + 9.1, p.z * f + 3.7, seed + 3),
  );
}

/** One colour from a list by `t`; an `[r, g, b]` tuple is one colour, not a list. */
const pick = (colors: Colors, t: number): ColorInput =>
  Array.isArray(colors) && typeof colors[0] !== "number"
    ? (colors as readonly ColorInput[])[Math.min(Math.floor(t * colors.length), colors.length - 1)]
    : (colors as ColorInput);

/** `a` over `b` by coverage `t`, each resolved only when needed. */
function blend(a: ColorInput, b: ColorInput, t: number, p: Vector3, n: Vector3): Rgb {
  if (t <= 0) return resolve(a, p, n);
  if (t >= 1) return resolve(b, p, n);
  return mix(resolve(a, p, n), resolve(b, p, n), t);
}

// ---------------------------------------------------------------------------------------------------------------
// Ready-made paints. Every size is in meters; every colour may be a paint.

/** Two colours in soft cloudy blotches about `size` across: mottled skin, lichen, stone, moss, dappled coats. */
export function mottle(a: ColorInput, b: ColorInput, options: { size: number; seed?: number; contrast?: number }) {
  const { size, seed = 0, contrast = 1 } = options;
  const half = 0.25 / contrast;
  return paint((p, n) => blend(a, b, smoothstep(0.5 - half, 0.5 + half, noise(p, size, seed)), p, n));
}

/**
 * Spots on `base`, spaced about `size` apart: leopard, cheetah, dalmatian, fawn, toadstool. `amount` (0..1, default
 * 0.5) sets how much of the surface they cover. `rosette` draws each as a broken ring with a darker centre. A
 * colour list gives each spot one of them.
 */
export function spots(
  base: ColorInput,
  spot: Colors,
  options: { size: number; amount?: number; rosette?: boolean; seed?: number },
) {
  const { size, amount = 0.5, rosette = false, seed = 0 } = options;
  const edge = 0.06;
  return paint((p, n) => {
    const q = warp(p, size * 0.5, size * 0.12, seed);
    const c = cells(q, size, seed);
    if (unit(Math.floor(c.id * 1e6), 0, 0, seed + 3) > 0.35 + amount) return resolve(base, p, n);
    const r = (0.2 + 0.3 * amount) * (0.7 + 0.6 * unit(Math.floor(c.id * 1e6), 1, 0, seed));
    const color = pick(spot, c.id);
    if (!rosette) return blend(base, color, smoothstep(r + edge, r - edge, c.d1), p, n);
    const ring = smoothstep(r + edge, r - edge, c.d1) * smoothstep(r * 0.5 - edge, r * 0.5 + edge, c.d1);
    const broken = ring * smoothstep(0.38, 0.5, noise(q, size * 0.35, seed + 5));
    const inside = c.d1 < r * 0.5 + edge ? 0.3 * smoothstep(r * 0.5 + edge, r * 0.5 - edge, c.d1) : 0;
    return blend(base, color, Math.max(broken, inside), p, n);
  });
}

/**
 * Bands across `axis` ("x", "y", "z" or a direction; default "z", so they ring a body that runs along z), about `size` apart, with wavy,
 * forking, tapering edges: tiger, zebra, okapi legs, wasp, bands on a tail. `width` (0..1, default 0.35) is the
 * stripe share of each repeat, `wobble` (default 0.5) how far they wander.
 */
export function stripes(
  base: ColorInput,
  stripe: Colors,
  options: { size: number; axis?: Axis | V3; width?: number; wobble?: number; seed?: number },
) {
  const { size, width = 0.35, wobble = 0.5, seed = 0 } = options;
  const axis = axisVector(options.axis ?? "z", "stripes()");
  return paint((p, n) => {
    const s = p.dot(axis) / size + wobble * 2 * (noise(p, size * 1.6, seed) - 0.5);
    const k = Math.floor(s);
    const f = s - k;
    const taper = smoothstep(0.28, 0.5, noise(p, size * 1.2, seed + 9));
    const w = width * (0.6 + 0.8 * unit(k, 0, 0, seed)) * taper;
    const d = Math.abs(f - 0.5);
    return blend(base, pick(stripe, unit(k, 1, 0, seed)), smoothstep(w / 2 + 0.03, w / 2 - 0.03, d), p, n);
  });
}

/**
 * Irregular patches about `size` across, separated by lines of `base` `gap` wide (share of `size`, default 0.1):
 * giraffe, cow, tortoise shell, crazy paving, cracked mud. A colour list varies the patches.
 */
export function patches(base: ColorInput, patch: Colors, options: { size: number; gap?: number; seed?: number }) {
  const { size, gap = 0.1, seed = 0 } = options;
  return paint((p, n) => {
    const c = cells(warp(p, size * 0.6, size * 0.1, seed), size, seed);
    const e = c.d2 - c.d1;
    return blend(base, pick(patch, c.id), smoothstep(gap - 0.03, gap + 0.03, e), p, n);
  });
}

/**
 * Scales or tiles about `size` across, each shaded a little differently, outlined in `edge` (line width `width`
 * as a share of `size`, default 0.12): reptile and fish scales, pangolin plates, cobbles, bark plates.
 */
export function scales(base: Colors, edge: ColorInput, options: { size: number; width?: number; seed?: number }) {
  const { size, width = 0.12, seed = 0 } = options;
  return paint((p, n) => {
    const c = cells(p, size, seed);
    const shade = 0.88 + 0.2 * c.id - 0.12 * Math.min(c.d1, 1);
    const face = resolve(pick(base, unit(Math.floor(c.id * 1e6), 2, 0, seed)), p, n);
    const lit: Rgb = [Math.min(face[0] * shade, 1), Math.min(face[1] * shade, 1), Math.min(face[2] * shade, 1)];
    return mix(resolve(edge, p, n), lit, smoothstep(width * 0.5, width, c.d2 - c.d1));
  });
}

/**
 * Dark back, light belly, by which way the surface faces: `back` where it faces up, `belly` where it faces down,
 * blended over `soft` (default 0.35) around `level` (default 0; −1 faces straight down, 1 straight up).
 */
export function countershade(back: ColorInput, belly: ColorInput, options: { level?: number; soft?: number } = {}) {
  const { level = 0, soft = 0.35 } = options;
  return paint((p, n) => blend(belly, back, smoothstep(level - soft, level + soft, n.y), p, n));
}

/** `a` at `from`, `b` at `to`, blended between along the line joining them: socks, tail tips, sun-faded tops. */
export function gradient(a: ColorInput, b: ColorInput, from: PointInput, to: PointInput) {
  const start = toPoint(from, "gradient()");
  const d = toPoint(to, "gradient()").sub(start);
  const len2 = Math.max(d.lengthSq(), 1e-12);
  const q = new Vector3();
  return paint((p, n) => blend(a, b, q.copy(p).sub(start).dot(d) / len2, p, n));
}

/**
 * Fine streaks running along `axis` ("x", "y", "z" or a direction; default "y"), about `size` apart: wood grain, bark, reeds, hair,
 * brushed metal, sedimentary stone.
 */
export function grain(a: ColorInput, b: ColorInput, options: { size: number; axis?: Axis | V3; seed?: number }) {
  const { size, seed = 0 } = options;
  const axis = axisVector(options.axis ?? "y", "grain()");
  const u = new Vector3(1, 0, 0);
  if (Math.abs(axis.dot(u)) > 0.9) u.set(0, 0, 1);
  const side = u.sub(axis.clone().multiplyScalar(u.dot(axis))).normalize();
  const other = axis.clone().cross(side);
  const q = new Vector3();
  return paint((p, n) => {
    q.set(p.dot(side), p.dot(other), p.dot(axis) / 8);
    const v = noise(q, size * 2, seed);
    const band = 0.5 + 0.5 * Math.sin(v * 40 + noise(q, size * 0.5, seed + 1) * 3);
    return blend(a, b, smoothstep(0.35, 0.85, band), p, n);
  });
}
```

## src/texture.ts

```ts
// `svg()`: an SVG drawing as a texture for cards and textured parts. The drawing is rasterised by the browser (the
// showcase and the creature-lab harness both run in one); under Node the texture keeps its size and markup and stays
// blank. Transparent pixels cut the surface away, so a drawn leaf on a card is a leaf.
import {
  Color,
  DataTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  NearestFilter,
  RGBAFormat,
  SRGBColorSpace,
  UnsignedByteType,
} from "three";
import { dilate } from "./bake";

/** Longest side of the raster, in pixels, when `svg()` gets no `size`. */
const DEFAULT_SIZE = 256;

/**
 * A texture drawn from SVG markup. The drawing fills the texture: its left edge is u = 0, its bottom edge v = 0.
 * `size` is the longest side of the raster in pixels (default 256, 8 to 2048); the other side keeps the drawing's
 * aspect (its `viewBox`, else `width`/`height`). Reuse one texture for many cards and parts: each distinct texture
 * takes its own space in the creature's texture atlas. `pixelated` draws the SVG with crisp (unantialiased) edges
 * and magnifies it without smoothing, so every raster pixel shows as a hard-edged square.
 */
export function svg(markup: string, options: { size?: number; pixelated?: boolean } = {}) {
  const open = /<svg\b[^>]*>/i.exec(markup);
  if (!open) throw new Error("svg(): the markup has no <svg> element");
  const attr = (name: string) => new RegExp(`\\s${name}\\s*=\\s*["']([^"']*)["']`, "i").exec(open[0])?.[1];
  const box = attr("viewBox")
    ?.trim()
    .split(/[\s,]+/)
    .map(Number);
  const [w, h] =
    box?.length === 4 && box[2] > 0 && box[3] > 0
      ? [box[2], box[3]]
      : [parseFloat(attr("width") ?? ""), parseFloat(attr("height") ?? "")];
  if (!(w > 0 && h > 0)) throw new Error("svg(): give the <svg> a viewBox (or width and height) so it has a size");
  const side = Math.min(Math.max(Math.round(options.size ?? DEFAULT_SIZE), 8), 2048);
  const width = Math.max(1, Math.round(w >= h ? side : (side * w) / h));
  const height = Math.max(1, Math.round(h >= w ? side : (side * h) / w));
  const tag = open[0]
    .replace(/\s(width|height)\s*=\s*["'][^"']*["']/gi, "")
    .replace(
      /^<svg\b/i,
      `<svg width="${width}" height="${height}"${/\sxmlns\s*=/.test(open[0]) ? "" : ' xmlns="http://www.w3.org/2000/svg"'}${options.pixelated && !/\sshape-rendering\s*=/i.test(open[0]) ? ' shape-rendering="crispEdges"' : ""}`,
    );
  const source = markup.replace(open[0], tag);

  const data = new Uint8Array(width * height * 4);
  const texture = new DataTexture(data, width, height, RGBAFormat, UnsignedByteType);
  texture.name = "svg";
  texture.colorSpace = SRGBColorSpace;
  texture.magFilter = options.pixelated ? NearestFilter : LinearFilter;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 8;
  texture.userData.svg = markup;
  texture.userData.coloured = inColour(markup);
  if (typeof document === "undefined") return texture;

  const parsed = new DOMParser().parseFromString(source, "image/svg+xml");
  const error = parsed.querySelector("parsererror");
  if (error) throw new Error(`svg(): the markup is not valid SVG: ${error.textContent?.trim().split("\n")[0] ?? ""}`);
  const image = new Image(width, height);
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
  texture.userData.ready = image
    .decode()
    .catch(() => {
      throw new Error(`svg(): the browser could not draw this SVG (${markup.slice(0, 80)}…)`);
    })
    .then(() => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true })!;
      context.drawImage(image, 0, 0, width, height);
      const pixels = context.getImageData(0, 0, width, height).data;
      // Texture rows run bottom-up (v = 0 at the bottom); canvas rows run top-down.
      const row = width * 4;
      for (let y = 0; y < height; y++) data.set(pixels.subarray((height - 1 - y) * row, (height - y) * row), y * row);
      const filled = new Uint8Array(width * height);
      for (let i = 0; i < filled.length; i++) filled[i] = data[i * 4 + 3] > 0 ? 1 : 0;
      dilate(data, filled, width, height, 8);
      texture.needsUpdate = true;
    });
  return texture;
}

/**
 * Whether a drawing uses any colour beyond greys (white to black), read from its fill, stroke and stop colours.
 * A textured part tints a grey drawing by its `color` and shows a coloured drawing as drawn.
 */
function inColour(markup: string) {
  const color = new Color();
  for (const [, , value] of markup.matchAll(
    /(fill|stroke|stop-color|flood-color|color)\s*(?:=\s*["']|:)\s*([^"';>]+)/gi,
  )) {
    const token = value.trim().toLowerCase();
    const hex = /^#([0-9a-f]{3,8})$/.exec(token)?.[1];
    const [a = "0", b = "0", c] = token.match(/-?[\d.]+%?/g) ?? [];
    const unit = (v: string, full: number) => (v.endsWith("%") ? parseFloat(v) / 100 : parseFloat(v) / full);
    if (hex) {
      const six = hex.length < 6 ? [...hex.slice(0, 3)].map((ch) => ch + ch).join("") : hex.slice(0, 6);
      color.setHex(parseInt(six, 16), SRGBColorSpace);
    } else if (token in Color.NAMES) color.setHex(Color.NAMES[token as keyof typeof Color.NAMES], SRGBColorSpace);
    else if (/^rgba?\(/.test(token) && c) color.setRGB(unit(a, 255), unit(b, 255), unit(c, 255), SRGBColorSpace);
    else if (/^hsla?\(/.test(token) && c)
      color.setHSL((parseFloat(a) / 360) % 1, unit(b, 100), unit(c, 100), SRGBColorSpace);
    else continue;
    const rgb = color.getRGB({ r: 0, g: 0, b: 0 }, SRGBColorSpace);
    if (Math.max(rgb.r, rgb.g, rgb.b) - Math.min(rgb.r, rgb.g, rgb.b) > 0.03) return true;
  }
  return false;
}
```

# Whole-module examples

These are complete, typecheck-clean reference modules. They are examples, not templates: design the requested subject yourself, reuse API shapes and construction techniques where useful, and do not copy a reference subject or its composition. The picker supplied three structural matches plus one nearest different subject for topology biped.

## Example: yordleMageSonnet

Brief: Category: Humanoid character.
Subject: knee-high furry mage in an indigo mantle and crooked star hat, holding a tall staff with a glowing cyan orb.
Style: League of Legends.
Topology: biped
Style family: league-of-legends
Notable features: humanoid-rig, hat, staff, orb-glow, robe

```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";
import { frame } from "agentic-3js-builder";
import { limb } from "agentic-3js-builder";
import { offset, rng } from "agentic-3js-builder";
import { bezier, catmull, spiral } from "agentic-3js-builder";
import { gradient, mix, mottle, noise, paint, smoothstep } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Yordle Starweaver",
  description:
    "A knee-high furry yordle mage in a gold-trimmed indigo mantle and a crooked star hat, gripping a staff taller than himself that cradles a glowing cyan orb in a golden crescent.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette

const AMBER = "#f29a2e";
const AMBER_D = "#c4601a";
const CREAM = "#ffeac4";
const CREAM_D = "#e9c58c";
const BROWN = "#4a2616";
const PINK = "#ff8fa8";
const INDIGO = "#2b3fb4";
const INDIGO_D = "#171f78";
const INDIGO_L = "#4d6ae0";
const GOLD = "#ffc83a";
const GOLD_D = "#b97a12";
const CYAN = "#4ff6ff";
const MAGENTA = "#ff3fa4";
const WOOD = "#7a4421";
const WOOD_D = "#4a2812";
const LEATHER = "#8a3b2a";
const INK = "#22112f";
const WHITE = "#fffaf0";

// ---------------------------------------------------------------------------------------------------------------
// Paints

const FUR = mottle(AMBER, AMBER_D, { size: 0.045, contrast: 0.55, seed: 3 });
const FUR_CREAM = mottle(CREAM, CREAM_D, { size: 0.04, contrast: 0.5, seed: 5 });
const PAW = paint((p, n) => {
  const soft = mix(AMBER, AMBER_D, noise(p, 0.04, 9));
  return n.y < -0.5 ? INK : soft;
});

const HEAD = paint((p, n) => {
  const m = Math.hypot(p.x / 0.14, (p.y - 0.845) / 0.1, (p.z - 0.2) / 0.11);
  const cheek = Math.hypot((Math.abs(p.x) - 0.1) / 0.06, (p.y - 0.865) / 0.05, (p.z - 0.14) / 0.08);
  if (m < 1 || cheek < 1) {
    const cream = mix(CREAM, CREAM_D, smoothstep(0.7, 1.2, Math.min(m, cheek)) * 0.5);
    const blush = Math.hypot((Math.abs(p.x) - 0.108) / 0.032, (p.y - 0.868) / 0.022, (p.z - 0.19) / 0.05);
    return blush < 1 ? mix(cream, PINK, 0.75 * (1 - blush)) : cream;
  }
  if (p.y > 0.99 && n.y > 0.5) return AMBER_D;
  return FUR;
});

const EAR_L = paint((p, n) => {
  const tip = smoothstep(1.1, 1.19, p.y);
  const base = n.z > 0.45 ? mix(PINK, "#ffb8c8", noise(p, 0.03, 4)) : FUR.at(p, n);
  return mix(base, BROWN, tip * 0.9);
});

const ROBE = paint((p, n) => {
  // brocade lattice with gold studs at the crossings, plus a gold hem line
  const ang = Math.atan2(p.x, p.z) * 0.17;
  const fu = ((((ang + p.y) / 0.1) % 1) + 1) % 1;
  const fv = ((((ang - p.y) / 0.1) % 1) + 1) % 1;
  const du = Math.min(fu, 1 - fu);
  const dv = Math.min(fv, 1 - fv);
  if (du < 0.1 && dv < 0.1) return GOLD;
  if (p.y < 0.215 && p.y > 0.2) return GOLD;
  const shade = noise(p, 0.08, 2);
  const base = mix(INDIGO_D, INDIGO, 0.35 + 0.65 * Math.min(1, Math.max(0, n.y * 0.5 + 0.6)));
  if (du < 0.035 || dv < 0.035) return mix(base, INDIGO_L, 0.55);
  return mix(base, INDIGO_L, shade * 0.28);
});

const HAT = paint((p, n) => {
  const shade = noise(p, 0.1, 6);
  const band = Math.sin((p.y - 1.05) * 60 + Math.atan2(p.x, p.z) * 3) > 0.92;
  return band ? INDIGO_L : mix(INDIGO_D, INDIGO, 0.4 + 0.5 * shade + 0.1 * n.y);
});

const CAPE = paint((p, n) => {
  const thick = Math.abs(n.z) < 0.6 && Math.abs(n.y) < 0.6;
  if (thick) return GOLD;
  return mix(INDIGO_D, INDIGO, 0.2 + 0.6 * smoothstep(0.35, 0.7, p.y));
});

const WOODP = paint((p) => {
  const g = noise(new THREE.Vector3(p.x * 6, p.y * 0.7, p.z * 6), 0.1, 8);
  return mix(WOOD, WOOD_D, g * 0.8);
});

const LEATHERP = paint((_p, _n, s) => (((s[1] + s[0] * 5200) % 90) + 90) % 90 < 28 ? "#5f2418" : LEATHER);

// ---------------------------------------------------------------------------------------------------------------
// Textures

const EYE = svg(
  `<svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="i" cx="50%" cy="62%" r="62%"><stop offset="0" stop-color="#eaffff"/><stop offset="0.4" stop-color="#4ff6ff"/><stop offset="1" stop-color="#1668d8"/></radialGradient></defs>
  <ellipse cx="32" cy="42" rx="29" ry="36" fill="#fffaf0"/>
  <ellipse cx="32" cy="45" rx="24" ry="31" fill="url(#i)"/>
  <ellipse cx="32" cy="47" rx="11" ry="17" fill="#0b1235"/>
  <ellipse cx="23" cy="31" rx="7" ry="9" fill="#ffffff"/>
  <circle cx="42" cy="60" r="3.5" fill="#ffffff"/>
  <ellipse cx="32" cy="42" rx="29" ry="36" fill="none" stroke="#2b1208" stroke-width="3.5"/>
  <path d="M1 22 Q30 -2 63 16 L60 25 Q32 12 6 31 Z" fill="#2b1208"/>
  <path d="M61 18 L68 12" stroke="#2b1208" stroke-width="4" fill="none"/>
</svg>`,
  { size: 256 },
);

const TUFT = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 0 C24 12 31 38 27 64 L5 64 C1 38 8 12 16 0Z" fill="#ffffff"/>
  <path d="M16 6 C18 24 20 44 16 64" stroke="#c8c8c8" stroke-width="2.5" fill="none"/>
  <path d="M9 24 C10 40 10 52 9 64 M23 26 C22 42 22 54 23 64" stroke="#dcdcdc" stroke-width="2" fill="none"/>
</svg>`,
  { size: 128 },
);

const RIBBON = svg(
  `<svg viewBox="0 0 16 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M1 0 L15 0 L15 52 L8 64 L1 52 Z" fill="#ffffff"/>
  <path d="M3 4 L13 4 M8 4 L8 56" stroke="#c8c8c8" stroke-width="1.5" fill="none"/>
</svg>`,
  { size: 128 },
);

function rune(d: string) {
  return svg(
    `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg"><path d="${d}" stroke="#7bf9ff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    { size: 192 },
  );
}
const RUNES = [
  rune("M16 4 L16 44 M6 14 L16 24 L26 14 M8 34 L24 34"),
  rune("M8 6 L24 6 L8 42 L24 42 M16 6 L16 42"),
  rune("M16 4 L28 24 L16 44 L4 24 Z M16 14 L16 34"),
  rune("M6 8 L26 8 M16 8 L16 44 M6 28 L16 38 L26 28"),
  rune("M24 6 L8 24 L24 42 M12 24 L28 24"),
];

const STAR = svg(
  `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 1 L20 12 L31 12 L22 19 L26 31 L16 24 L6 31 L10 19 L1 12 L12 12 Z" fill="#ffc83a" stroke="#fff3b0" stroke-width="1.5" stroke-linejoin="round"/>
</svg>`,
  { size: 128 },
);

const EMBLEM = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="29" fill="none" stroke="#ffc83a" stroke-width="4"/>
  <circle cx="32" cy="32" r="22" fill="#171f78"/>
  <path d="M32 6 L37 25 L58 32 L37 39 L32 58 L27 39 L6 32 L27 25 Z" fill="#ffc83a"/>
  <path d="M32 16 L35 29 L48 32 L35 35 L32 48 L29 35 L16 32 L29 29 Z" fill="#4ff6ff"/>
  <circle cx="32" cy="32" r="4" fill="#ffffff"/>
</svg>`,
  { size: 192 },
);

const BOOK_RUNE = svg(
  `<svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="3" width="26" height="34" rx="2" fill="none" stroke="#ffc83a" stroke-width="2.5"/>
  <path d="M16 9 L22 20 L16 31 L10 20 Z" fill="#4ff6ff"/>
  <circle cx="16" cy="20" r="2.5" fill="#ffffff"/>
</svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------

function ringPoints(center: THREE.Vector3, normal: THREE.Vector3, radius: number, count: number) {
  const n = normal.clone().normalize();
  const ref = Math.abs(n.z) < 0.9 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(1, 0, 0);
  const u = new THREE.Vector3().crossVectors(n, ref).normalize();
  const v = new THREE.Vector3().crossVectors(n, u).normalize();
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    pts.push(center.clone().addScaledVector(u, Math.cos(a) * radius).addScaledVector(v, Math.sin(a) * radius));
  }
  return pts;
}

export default function build() {
  const b = createBuilder({ name: "yordleMage", paintSize: 2048 });
  const R = rng(17);

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton

  const hips = b.joint("hips", { at: [0, 0.36, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.4, 0],
      [0, 0.51, 0.012],
      [0, 0.62, 0.022],
      [0, 0.71, 0.03],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 0.71, 0.03], aim: [0, 0.79, 0.05], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.79, 0.05], aim: [0, 0.95, 0.1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.83, 0.13], aim: [0, 0.82, 0.25], role: "jaw" });

  // ears
  const ears = [1, -1].map((s) => {
    const name = s > 0 ? "L" : "R";
    const ch = b.chain(
      `ear${name}`,
      catmull([
        [s * 0.15, 0.985, 0.02],
        [s * 0.215, 1.075, 0.0],
        [s * 0.27, 1.16, -0.05],
        [s * 0.3, 1.23, -0.1],
      ]),
      { parent: head, names: [`ear${name}1`, `ear${name}2`, `ear${name}3`] },
    );
    return ch;
  });

  // tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.4, -0.1],
      [0, 0.37, -0.26],
      [0, 0.45, -0.4],
      [0, 0.62, -0.46],
      [0, 0.8, -0.4],
    ]),
    { parent: hips, count: 4, role: "tail" },
  );

  // legs
  const legs = [1, -1].map((s) => {
    const name = s > 0 ? "L" : "R";
    const hipP: [number, number, number] = [s * 0.085, 0.36, 0];
    const pts = limb(hipP, [s * 0.1, 0.07, 0.03], [0.17, 0.17], [0, 0, 1]);
    const ch = b.chain(`leg${name}`, catmull(pts), {
      parent: hips,
      names: [`hip${name}`, `knee${name}`, `ankle${name}`],
      role: "leg",
    });
    return ch;
  });

  // arms: left open, right gripping the staff
  const STAFF_B = new THREE.Vector3(-0.3, 0, 0.14);
  const STAFF_T = new THREE.Vector3(-0.4, 1.62, 0.2);
  const STAFF_A = STAFF_T.clone().sub(STAFF_B).normalize();
  const onStaff = (y: number) => STAFF_B.clone().addScaledVector(STAFF_A, y / STAFF_A.y);
  const gripC = onStaff(0.56);

  const armL = b.chain(
    "armL",
    catmull([
      [0.17, 0.63, 0.01],
      [0.3, 0.5, 0.05],
      [0.37, 0.46, 0.17],
    ]),
    { parent: chest, names: ["shoulderL", "elbowL", "wristL"], role: "arm" },
  );
  const armR = b.chain(
    "armR",
    catmull([
      [-0.17, 0.63, 0.01],
      [-0.3, 0.45, 0.04],
      [gripC.x, gripC.y, gripC.z],
    ]),
    { parent: chest, names: ["shoulderR", "elbowR", "wristR"], role: "arm" },
  );
  const wristL = armL.tip!;
  const wristR = armR.tip!;

  // -------------------------------------------------------------------------------------------------------------
  // Torso and robe

  const torso = b.sweep(
    spine,
    (t) => {
      const w = 0.118 + 0.05 * Math.sin(Math.min(1, t * 1.25) * Math.PI * 0.8) + (t > 0.8 ? -0.03 * (t - 0.8) * 5 : 0);
      return [w, w * 0.88];
    },
    { color: ROBE, detail: 1 },
  );
  const skin = b.surface(torso);

  const skirt = b.lathe(
    [
      [0.152, 0.31],
      [0.185, 0.24],
      [0.22, 0.12],
      [0.262, 0.0],
      [0.248, -0.006],
      [0.205, 0.12],
      [0.172, 0.24],
      [0.14, 0.31],
    ],
    { at: [0, 0.19, 0], bone: hips, segments: 14, color: ROBE },
  );
  const skirtSurf = b.surface(skirt);
  const onSkirt = (deg: number, y: number) => {
    const r = (deg * Math.PI) / 180;
    return skirtSurf.ray([Math.sin(r) * 0.7, y, Math.cos(r) * 0.7], [-Math.sin(r), 0, -Math.cos(r)]);
  };
  // gold hem and waist band
  const hemY = 0.205;
  const hemR = 0.262 - 0.0 + 0.004;
  const hemPts = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2;
    return [Math.cos(a) * hemR, hemY, Math.sin(a) * hemR];
  });
  b.sweep(catmull(hemPts, { closed: true }), 0.012, { color: GOLD, bone: hips, sides: 6 });
  // hem tassels: little teal-gold bells around the skirt
  const hemItems = Array.from({ length: 10 }, (_, i) => {
    const a = ((i + 0.5) / 10) * Math.PI * 2;
    return [Math.cos(a) * (hemR + 0.004), hemY - 0.012, Math.sin(a) * (hemR + 0.004)];
  });
  for (const p of hemItems)
    b.part(new THREE.ConeGeometry(0.014, 0.034, 6), GOLD, { at: [p[0], p[1] - 0.012, p[2]], bone: hips, rotation: [180, 0, 0] });

  b.decal(skirt, EMBLEM, { at: [0, 0.3, 0.195], dir: [0, 0, 1], size: [0.11, 0.11], bone: hips, lift: 0.004 });

  // belt
  const beltY = 0.49;
  b.sweep(skin.loop([0, beltY, 0], { lift: 0.012 }), 0.026, { color: GOLD_D, bone: spine.joints[0], sides: 6 });
  b.sweep(skin.loop([0, beltY, 0], { lift: 0.026 }), 0.008, { color: GOLD, bone: spine.joints[0], sides: 6 });
  const beltFront = skin.ray([0, beltY, 1], [0, 0, -1]);
  const bz = (beltFront?.at.z ?? 0.15) + 0.026;
  b.part(new THREE.BoxGeometry(0.075, 0.062, 0.02), GOLD, { at: [0, beltY, bz], bone: spine.joints[0] });
  glow(
    b.part(new THREE.OctahedronGeometry(0.027, 0), CYAN, { at: [0, beltY, bz + 0.012], bone: spine.joints[0], scale: [1, 1.25, 0.8], flat: true }),
    1.2,
  );
  // crossing sash with gold studs and a star charm
  const sash = skin.drape(
    catmull([
      [-0.11, 0.7, 0.07],
      [-0.05, 0.63, 0.15],
      [0.04, 0.55, 0.17],
      [0.15, 0.48, 0.1],
    ]),
    { lift: 0.006 },
  );
  b.sweep(sash, () => [0.024, 0.008], { color: LEATHER, bone: chest, sides: 6 });
  b.along(sash, 5, (at) => b.part(new THREE.SphereGeometry(0.0085, 6, 4), GOLD, { at, bone: chest }));
  glow(b.part(new THREE.OctahedronGeometry(0.02, 0), CYAN, { at: offset(sash.at(0.5), [0, 0.2, 1], 0.02), bone: chest, scale: [1, 1.3, 0.8], flat: true }), 1.2);
  // collar rolls at the neck: cream fur ruff
  const ruffPath = catmull(ringPoints(new THREE.Vector3(0, 0.71, 0.02), new THREE.Vector3(0, 1, 0), 0.14, 12), { closed: true });
  const ruff = b.sweep(ruffPath, 0.04, { color: FUR_CREAM, bone: chest, sides: 6 });
  b.cards(
    b.surface(ruff).scatter(130, { rng: R, minDist: 0.026, filter: (h) => h.n.y > -0.2 }),
    TUFT,
    { size: [0.04, 0.05], lean: 72, bend: 24, flow: [0, 0.2, 1], vary: 0.25, rng: R, color: FUR_CREAM, bone: chest },
  );

  // shoulder mantle fur and clasps
  for (const s of [1, -1]) {
    const m = b.part(new THREE.SphereGeometry(0.085, 9, 7), FUR_CREAM, {
      at: [s * 0.185, 0.68, 0.0],
      scale: [1.1, 0.75, 1.05],
      bone: chest,
    });
    b.cards(
      b.surface(m).scatter(36, { rng: R, minDist: 0.03, filter: (h) => h.n.y > -0.1 }),
      TUFT,
      { size: [0.04, 0.05], lean: 72, bend: 26, flow: [s * 1, -0.2, 0], vary: 0.25, rng: R, color: FUR_CREAM, bone: chest },
    );
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.016, 8), GOLD, {
      at: [s * 0.185, 0.708, 0.07],
      dir: [0, 0.35, 1],
      bone: chest,
    });
    glow(b.part(new THREE.OctahedronGeometry(0.015, 0), CYAN, { at: [s * 0.185, 0.712, 0.08], bone: chest, flat: true }), 1.2);
  }

  // cape panels
  b.extrude(
    [
      [-0.12, 0],
      [0.12, 0],
      [0.128, -0.14],
      [0.115, -0.24],
      [0.06, -0.2, "sharp"],
      [0, -0.29, "sharp"],
      [-0.06, -0.2, "sharp"],
      [-0.115, -0.24],
      [-0.128, -0.14],
    ] as OutlinePoint[],
    {
      at: [0, 0.7, -0.15],
      x: [1, 0, 0],
      y: [0, 1, -0.18],
      thickness: 0.02,
      bevel: 0.004,
      color: CAPE,
      bone: chest,
    },
  );
  for (const s of [1, -1])
    b.extrude(
      [
        [0, 0],
        [0.1, -0.005],
        [0.16, -0.1],
        [0.17, -0.2],
        [0.12, -0.17, "sharp"],
        [0.07, -0.25, "sharp"],
        [0.02, -0.2, "sharp"],
        [0, -0.2],
      ] as OutlinePoint[],
      {
        at: [s * 0.115, 0.7, -0.145],
        x: [s * 0.93, 0, -0.36],
        y: [0, 1, -0.15],
        thickness: 0.02,
        bevel: 0.004,
        color: CAPE,
        bone: chest,
      },
    );

  // tall back collar blades
  const bladeAng = [-62, -31, 0, 31, 62];
  for (const [i, deg] of bladeAng.entries()) {
    const r = (deg * Math.PI) / 180;
    const h = 0.17 + 0.13 * Math.cos(r * 1.1);
    b.extrude(
      [
        [-0.04, 0],
        [0.04, 0],
        [0.042, h * 0.5],
        [0, h, "sharp"],
        [-0.042, h * 0.5],
      ] as OutlinePoint[],
      {
        at: [Math.sin(r) * 0.05, 0.69, -0.17 + (i % 2) * 0.005],
        x: [Math.cos(r), -Math.sin(r), 0],
        y: [Math.sin(r), Math.cos(r), 0.12],
        thickness: 0.016,
        bevel: 0.004,
        color: CAPE,
        bone: chest,
      },
    );
  }

  // pouch, potion, book on the skirt
  const pouchHit = onSkirt(-62, 0.4);
  if (pouchHit) {
    const out = pouchHit.n.clone();
    const pa = pouchHit.at.clone().addScaledVector(out, 0.022);
    const rot: [number, number, number] = [0, -62, 0];
    b.part(new THREE.BoxGeometry(0.08, 0.074, 0.044), LEATHER, { at: pa, rotation: rot, bone: hips });
    b.part(new THREE.BoxGeometry(0.086, 0.034, 0.05), "#5f2418", { at: pa.clone().add(new THREE.Vector3(0, 0.03, 0)), rotation: rot, bone: hips });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), GOLD, { at: pa.clone().addScaledVector(out, 0.03), bone: hips });
    b.rod([-0.128, 0.485, 0.11], pa.clone().add(new THREE.Vector3(0, 0.05, 0)), 0.006, { color: GOLD_D, bone: hips, sides: 4 });
  }
  const potionHit = onSkirt(60, 0.38);
  if (potionHit) {
    const out = potionHit.n.clone();
    const pc = potionHit.at.clone().addScaledVector(out, 0.045);
    b.rod([0.125, 0.485, 0.115], pc.clone().add(new THREE.Vector3(0, 0.07, 0)), 0.005, { color: LEATHER, bone: hips, sides: 4 });
    glow(b.part(new THREE.SphereGeometry(0.038, 8, 6), MAGENTA, { at: pc, bone: hips }), 1.0);
    b.part(new THREE.CylinderGeometry(0.012, 0.015, 0.036, 6), WHITE, { at: pc.clone().add(new THREE.Vector3(0, 0.05, 0)), bone: hips });
    b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.018, 6), WOOD, { at: pc.clone().add(new THREE.Vector3(0, 0.078, 0)), bone: hips });
  }
  const bookHit = onSkirt(140, 0.36);
  if (bookHit) {
    const out = bookHit.n.clone();
    const bc = bookHit.at.clone().addScaledVector(out, 0.02);
    const rot: [number, number, number] = [0, 140, 0];
    b.part(new THREE.BoxGeometry(0.1, 0.12, 0.034), "#7d2a8c", { at: bc, rotation: rot, bone: hips });
    b.part(new THREE.BoxGeometry(0.094, 0.112, 0.03), CREAM, { at: bc.clone().addScaledVector(out, -0.004), rotation: rot, bone: hips });
    b.part(new THREE.PlaneGeometry(0.08, 0.1), "#ffffff", {
      at: bc.clone().addScaledVector(out, 0.0185),
      dir: out,
      axis: "z",
      bone: hips,
      texture: BOOK_RUNE,
    });
    b.part(new THREE.BoxGeometry(0.012, 0.124, 0.038), GOLD_D, {
      at: bc.clone().addScaledVector(new THREE.Vector3(Math.cos((140 * Math.PI) / 180), 0, -Math.sin((140 * Math.PI) / 180)), 0.048),
      rotation: rot,
      bone: hips,
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Head

  const skull = b.part(new THREE.SphereGeometry(0.17, 14, 10), HEAD, {
    at: [0, 0.91, 0.06],
    scale: [1.14, 0.98, 1.0],
    bone: head,
  });
  b.part(new THREE.SphereGeometry(0.065, 10, 8), HEAD, {
    at: [0, 0.865, 0.21],
    scale: [1.15, 0.8, 1.0],
    bone: head,
  });
  b.part(new THREE.SphereGeometry(0.056, 10, 8), FUR_CREAM, { at: [0, 0.805, 0.2], scale: [1.15, 0.58, 1.0], bone: jaw });
  b.part(new THREE.SphereGeometry(0.04, 8, 6), "#c43a5a", { at: [0, 0.83, 0.2], scale: [1.1, 0.5, 1.0], bone: jaw });
  b.part(new THREE.SphereGeometry(0.02, 6, 5), "#e86a8a", { at: [0, 0.822, 0.23], scale: [1.3, 0.5, 1.4], bone: jaw });

  // eyes
  for (const s of [1, -1])
    glow(
      b.decal(skull, EYE, {
        at: [s * 0.08, 0.935, 0.22],
        dir: [s * 0.15, 0.04, 1],
        size: [0.092, 0.115],
        mirror: s > 0,
        roll: s * -8,
        bone: head,
        lift: 0.003,
      }),
      0.55,
    );
  // brows
  for (const s of [1, -1]) {
    b.capsule([s * 0.125, 1.0, 0.185], [s * 0.045, 0.993, 0.235], [0.011, 0.007], { color: BROWN, bone: head, sides: 5 });
    b.spike([s * 0.13, 1.0, 0.18], [s * 0.15, 1.018, 0.162], null, 0.009, { color: BROWN, bone: head, sides: 5 });
  }
  // nose, mouth, teeth
  b.part(new THREE.SphereGeometry(0.021, 8, 6), "#4a1f3a", { at: [0, 0.889, 0.268], scale: [1.25, 0.85, 1.0], bone: head });
  b.part(new THREE.SphereGeometry(0.006, 5, 4), WHITE, { at: [-0.007, 0.896, 0.284], bone: head });
  b.sweep(
    catmull([
      [-0.05, 0.848, 0.232],
      [-0.024, 0.832, 0.263],
      [0.0, 0.84, 0.272],
      [0.024, 0.832, 0.263],
      [0.05, 0.848, 0.232],
    ]),
    0.0045,
    { color: INK, bone: head, sides: 5, caps: "round" },
  );
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.016, 0.026, 0.008), WHITE, { at: [s * 0.009, 0.826, 0.268], bone: head });
  // whiskers
  for (const s of [1, -1])
    for (const [i, dy] of [-0.012, 0.006, 0.024].entries())
      b.sweep(
        bezier(
          [s * 0.07, 0.87 + dy * 0.4, 0.235],
          [s * 0.14, 0.87 + dy, 0.26],
          [s * 0.22, 0.86 + dy * 1.6 - 0.01 * i, 0.19],
        ),
        [0.0035, 0.0012],
        { color: "#fff4e0", bone: head, sides: 4, caps: "none" },
      );

  // cheek and brow fur
  const headSurf = b.surface(skull);
  b.cards(
    headSurf.scatter(70, {
      rng: R,
      minDist: 0.03,
      filter: (h) => Math.abs(h.at.x) > 0.11 && h.at.y < 0.95 && h.at.y > 0.8 && h.at.z > -0.02,
    }),
    TUFT,
    {
      size: [0.042, 0.06],
      lean: 70,
      bend: 20,
      flow: (f) => [Math.sign(f.at.x) * 0.6, -0.25, -1],
      vary: 0.3,
      rng: R,
      color: FUR_CREAM,
      bone: head,
    },
  );
  b.cards(
    headSurf.scatter(40, { rng: R, minDist: 0.035, filter: (h) => h.at.y > 0.98 && h.at.z < 0.12 && h.n.y > 0.3 }),
    TUFT,
    { size: [0.035, 0.07], lean: 50, bend: 18, flow: [0, 0.1, -1], vary: 0.3, rng: R, color: FUR, bone: head },
  );


  // ears
  for (const [i, ch] of ears.entries()) {
    const s = i === 0 ? 1 : -1;
    const ear = b.sweep(
      ch,
      (t) => [0.062 - 0.034 * t * t + 0.012 * Math.sin(t * 3.14), 0.016 - 0.007 * t],
      { color: EAR_L, caps: "round" },
    );
    b.cards(
      b.surface(ear).scatter(12, { rng: R, minDist: 0.03, filter: (h) => h.at.y > 1.12 }),
      TUFT,
      { size: [0.024, 0.05], lean: 70, flow: [s * 0.4, 0.2, -1], rng: R, color: BROWN, vary: 0.2 },
    );
    // gold ear cuff
    const cuffT = 0.2;
    const cp = ch.at(cuffT);
    b.sweep(
      catmull(ringPoints(new THREE.Vector3(...cp.at.toArray()), new THREE.Vector3(...cp.tangent.toArray()), 0.062, 10), { closed: true }),
      0.0075,
      { color: GOLD, bone: ch.joints[0], sides: 5 },
    );
    glow(b.part(new THREE.OctahedronGeometry(0.012, 0), CYAN, { at: offset(cp.at, [0, 0, 1], 0.03), bone: ch.joints[0], flat: true }), 1.2);
  }

  // hat: crooked cone with a bell and a star
  const hatPath = catmull([
    [0, 1.055, 0.02],
    [0, 1.15, 0.0],
    [0.01, 1.25, -0.04],
    [0.06, 1.33, -0.1],
    [0.15, 1.37, -0.16],
  ]);
  const hat = b.sweep(hatPath, (t) => 0.125 * Math.pow(1 - t, 0.9) + 0.012, { color: HAT, bone: head, caps: "round", sides: 10 });
  const hatSurf = b.surface(hat);
  for (const [az, y] of [
    [24, 1.13],
    [-38, 1.17],
    [82, 1.2],
    [-85, 1.1],
    [-10, 1.24],
  ]) {
    const ar = (az * Math.PI) / 180;
    const h = hatSurf.ray([Math.sin(ar) * 0.5, y, 0.01 + Math.cos(ar) * 0.5], [-Math.sin(ar), 0, -Math.cos(ar)]);
    if (h) glow(b.decal(hat, STAR, { at: h.at, dir: h.n, size: [0.04, 0.04], bone: head, roll: az * 0.6, lift: 0.002 }), 0.5);
  }
  b.lathe(
    [
      [0.0, 0.0],
      [0.15, 0.0],
      [0.19, 0.012],
      [0.19, 0.026],
      [0.14, 0.026],
      [0.0, 0.03],
    ],
    { at: [0, 1.05, 0.03], bone: head, segments: 14, color: HAT, axis: [0, 1, 0.06] },
  );
  b.sweep(catmull(ringPoints(new THREE.Vector3(0, 1.062, 0.03), new THREE.Vector3(0, 1, 0.06), 0.122, 14), { closed: true }), 0.012, {
    color: GOLD,
    bone: head,
    sides: 6,
  });
  b.sweep(catmull(ringPoints(new THREE.Vector3(0, 1.052, 0.03), new THREE.Vector3(0, 1, 0.06), 0.19, 18), { closed: true }), 0.007, {
    color: GOLD,
    bone: head,
    sides: 5,
  });
  b.part(new THREE.BoxGeometry(0.05, 0.045, 0.012), GOLD, { at: [0, 1.065, 0.152], bone: head });
  glow(b.part(new THREE.OctahedronGeometry(0.02, 0), CYAN, { at: [0, 1.066, 0.16], bone: head, scale: [1, 1.2, 0.8], flat: true }), 1.3);
  const tipP = hatPath.at(1);
  b.part(new THREE.SphereGeometry(0.024, 8, 6), GOLD, { at: [tipP.x + 0.01, tipP.y - 0.01, tipP.z - 0.015], bone: head });
  glow(b.part(new THREE.OctahedronGeometry(0.02, 0), CYAN, { at: [tipP.x + 0.03, tipP.y - 0.005, tipP.z - 0.03], bone: head, flat: true }), 1.4);
  // jaunty feather tucked in the hatband
  const featherPath = catmull([
    [-0.095, 1.068, 0.1],
    [-0.14, 1.13, 0.135],
    [-0.18, 1.22, 0.13],
    [-0.2, 1.31, 0.09],
  ]);
  b.sweep(featherPath, (t) => [0.034 * Math.sin(Math.PI * Math.pow(t, 0.7)) + 0.004, 0.005], {
    color: gradient(MAGENTA, CYAN, [-0.095, 1.068, 0.1], [-0.2, 1.31, 0.09]),
    bone: head,
    caps: "point",
    sides: 6,
  });
  b.sweep(featherPath, 0.0035, { color: GOLD, bone: head, sides: 4, caps: "round" });

  // -------------------------------------------------------------------------------------------------------------
  // Tail

  const tailTube = b.sweep(tail, (t) => 0.045 + 0.095 * Math.sin(Math.min(1, t * 1.15) * Math.PI * 0.85) + (t > 0.7 ? 0.01 : 0), {
    color: gradient(FUR, FUR_CREAM, [0, 0.55, -0.46], [0, 0.78, -0.4]),
    caps: "round",
    sides: 10,
  });
  b.cards(
    b.surface(tailTube).scatter(90, { rng: R, minDist: 0.04, filter: (h) => h.at.y > 0.4 }),
    TUFT,
    {
      size: [0.05, 0.075],
      lean: 55,
      bend: 22,
      flow: [0, 1, 0.1],
      vary: 0.3,
      rng: R,
      color: gradient(FUR, FUR_CREAM, [0, 0.55, -0.46], [0, 0.78, -0.4]),
    },
  );
  // tail ring: gold band with glowing gem
  const tb = tail.at(0.18);
  b.sweep(
    catmull(ringPoints(new THREE.Vector3(...tb.at.toArray()), new THREE.Vector3(...tb.tangent.toArray()), 0.07, 10), { closed: true }),
    0.009,
    { color: GOLD, bone: tail.joints[0], sides: 5 },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Legs and feet

  for (const [i, ch] of legs.entries()) {
    const s = i === 0 ? 1 : -1;
    const name = s > 0 ? "L" : "R";
    b.sweep(ch, (t) => 0.062 - 0.012 * t, { color: FUR, sides: 8 });
    const ankle = ch.joints[2];
    const fx = s * 0.1;
    // paw/foot
    b.sweep(
      catmull([
        [fx, 0.075, -0.03],
        [fx, 0.058, 0.07],
        [fx, 0.05, 0.15],
      ]),
      [0.056, 0.05],
      { color: PAW, bone: ankle, sides: 8, caps: "round" },
    );
    b.cards(
      b.surface(b.part(new THREE.SphereGeometry(0.06, 8, 6), FUR, { at: [fx, 0.09, -0.01], bone: ankle, scale: [1, 0.7, 1.3] })).scatter(18, {
        rng: R,
        minDist: 0.03,
        filter: (h) => h.n.y > 0,
      }),
      TUFT,
      { size: [0.028, 0.05], lean: 75, flow: [0, -0.1, 1], rng: R, color: FUR_CREAM, bone: ankle },
    );
    // toes
    for (const [j, dx] of [-0.034, 0, 0.034].entries()) {
      const tx = fx + dx;
      const toe = b.chain(
        `toe${name}${j + 1}`,
        [
          [tx, 0.04, 0.14],
          [tx + dx * 0.35, 0.036, 0.19],
        ],
        { parent: ankle, names: [`toe${name}${j + 1}`], role: "digit" },
      );
      b.sweep(toe, [0.022, 0.02], { color: FUR_CREAM, caps: "round", sides: 6 });
      b.spike([tx + dx * 0.35, 0.036, 0.205], [0, -0.1, 1], 0.026, 0.009, { color: BROWN, bone: toe.joints[0], sides: 5 });
    }
    // anklet
    const ap = ch.at(0.97);
    b.sweep(
      catmull(ringPoints(new THREE.Vector3(...ap.at.toArray()), new THREE.Vector3(0, 1, 0), 0.058, 10), { closed: true }),
      0.01,
      { color: GOLD, bone: ankle, sides: 5 },
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Arms and hands

  const arms: [typeof armL, number][] = [
    [armL, 1],
    [armR, -1],
  ];
  for (const [ch, s] of arms) {
    const sf = s > 0 ? "L" : "R";
    const wrist = s > 0 ? wristL : wristR;
    b.sweep(ch, (t) => 0.056 - 0.014 * t, { color: FUR, sides: 8 });
    // bell sleeve
    b.sweep(ch, (t) => 0.066 + 0.05 * smoothstep(0.15, 0.55, t), { from: 0, to: 0.56, color: ROBE, sides: 10, caps: "flat" });
    b.sweep(ch, (t) => 0.066 + 0.05 * smoothstep(0.15, 0.55, t) + 0.006, { from: 0.53, to: 0.58, color: GOLD, sides: 10, caps: "flat" });
    b.sweep(ch, (t) => 0.066 + 0.05 * smoothstep(0.15, 0.55, t) + 0.003, { from: 0.5, to: 0.515, color: GOLD_D, sides: 10, caps: "flat" });
    const cuff = ch.at(0.59);
    const cuffRing = b.sweep(
      catmull(ringPoints(new THREE.Vector3(...cuff.at.toArray()), new THREE.Vector3(...cuff.tangent.toArray()), 0.112, 12), { closed: true }),
      0.02,
      { color: FUR_CREAM, bone: ch.joints[1], sides: 6 },
    );
    b.cards(b.surface(cuffRing).scatter(44, { rng: R, minDist: 0.024 }), TUFT, {
      size: [0.036, 0.045],
      lean: 72,
      bend: 20,
      flow: cuff.tangent.toArray(),
      vary: 0.25,
      rng: R,
      color: FUR_CREAM,
      bone: ch.joints[1],
    });
    const w = wrist.at;
    // palm
    const palm = b.part(new THREE.SphereGeometry(0.058, 9, 7), PAW, { at: [w.x, w.y, w.z], scale: [1, 0.9, 1.0], bone: wrist });
    b.cards(
      b.surface(palm).scatter(16, { rng: R, minDist: 0.03, filter: (h) => h.n.y > -0.1 }),
      TUFT,
      { size: [0.024, 0.045], lean: 70, flow: [0, -0.2, -1], rng: R, color: FUR_CREAM, bone: wrist },
    );
    if (s > 0) {
      // open hand: three fingers forward, thumb out
      for (const [j, dx] of [-0.036, 0, 0.036].entries()) {
        const fx = w.x + dx * 1.3;
        const f = b.chain(
          `finger${sf}${j + 1}`,
          catmull([
            [fx - dx * 0.2, w.y + 0.01, w.z + 0.04],
            [fx, w.y + 0.025, w.z + 0.09],
            [fx + dx * 0.15, w.y + 0.05, w.z + 0.13],
          ]),
          { parent: wrist, names: [`finger${sf}${j + 1}a`, `finger${sf}${j + 1}b`, `finger${sf}${j + 1}c`], role: "digit" },
        );
        b.sweep(f, [0.02, 0.016], { color: PAW, caps: "round", sides: 6 });
        b.spike(f.tip!, f.tip!, 0.022, 0.008, { color: BROWN, sides: 5 });
      }
      const thumb = b.chain(
        `thumb${sf}`,
        catmull([
          [w.x + 0.04, w.y + 0.01, w.z + 0.02],
          [w.x + 0.085, w.y + 0.03, w.z + 0.045],
          [w.x + 0.11, w.y + 0.06, w.z + 0.06],
        ]),
        { parent: wrist, names: [`thumb${sf}a`, `thumb${sf}b`, `thumb${sf}c`], role: "digit" },
      );
      b.sweep(thumb, [0.022, 0.017], { color: PAW, caps: "round", sides: 6 });
      b.spike(thumb.tip!, thumb.tip!, 0.022, 0.008, { color: BROWN, sides: 5 });
    } else {
      // fist round the staff
      for (const [j, dy] of [-0.044, -0.01, 0.024].entries()) {
        const f = b.chain(
          `finger${sf}${j + 1}`,
          catmull([
            [w.x - 0.05, w.y + dy, w.z + 0.01],
            [w.x - 0.034, w.y + dy, w.z + 0.056],
            [w.x + 0.02, w.y + dy, w.z + 0.064],
            [w.x + 0.052, w.y + dy, w.z + 0.02],
          ]),
          {
            parent: wrist,
            names: [`finger${sf}${j + 1}a`, `finger${sf}${j + 1}b`, `finger${sf}${j + 1}c`, `finger${sf}${j + 1}d`],
            role: "digit",
          },
        );
        b.sweep(f, 0.018, { color: PAW, caps: "round", sides: 6 });
        b.spike(f.tip!, f.tip!, 0.02, 0.008, { color: BROWN, sides: 5 });
      }
      const thumb = b.chain(
        `thumb${sf}`,
        catmull([
          [w.x + 0.05, w.y + 0.07, w.z - 0.01],
          [w.x + 0.045, w.y + 0.07, w.z + 0.04],
          [w.x + 0.005, w.y + 0.072, w.z + 0.068],
        ]),
        { parent: wrist, names: [`thumb${sf}a`, `thumb${sf}b`], role: "digit" },
      );
      b.sweep(thumb, 0.019, { color: PAW, caps: "round", sides: 6 });
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // The staff

  const staff = b.joint("staff", { parent: wristR, at: STAFF_B, aim: STAFF_T });
  const shaftPath = [STAFF_B.clone().addScaledVector(STAFF_A, 0.2), STAFF_T.clone()];
  const shaft = b.sweep(shaftPath, (t) => 0.03 + 0.003 * Math.sin(t * 38), {
    color: WOODP,
    bone: staff,
    sides: 8,
    caps: "flat",
  });
  // ferrule on the floor
  b.spike(STAFF_B.clone().addScaledVector(STAFF_A, 0.22), STAFF_B, null, 0.04, { color: GOLD_D, bone: staff, sides: 8 });
  b.rod(onStaff(0.2), onStaff(0.24), 0.043, { color: GOLD, bone: staff, sides: 8 });
  b.rod(onStaff(0.245), onStaff(0.262), 0.036, { color: GOLD_D, bone: staff, sides: 8 });
  // grip wrap
  b.rod(onStaff(0.44), onStaff(0.7), 0.035, { color: LEATHERP, bone: staff, sides: 8 });
  b.rod(onStaff(0.435), onStaff(0.455), 0.04, { color: GOLD, bone: staff, sides: 8 });
  b.rod(onStaff(0.685), onStaff(0.705), 0.04, { color: GOLD, bone: staff, sides: 8 });
  // gold bands and a gold wire coil up the shaft
  for (const y of [0.95, 1.2, 1.42]) {
    b.rod(onStaff(y), onStaff(y + 0.02), 0.038, { color: GOLD, bone: staff, sides: 8 });
    b.rod(onStaff(y + 0.024), onStaff(y + 0.036), 0.034, { color: GOLD_D, bone: staff, sides: 8 });
  }
  b.sweep(
    spiral(onStaff(0.96), onStaff(0.96).add(new THREE.Vector3(0.036, 0, 0)), STAFF_A, { turns: 4, r1: 0.036, pitch: 0.06 }),
    0.005,
    { color: GOLD, bone: staff, sides: 4, detail: 0.5 },
  );
  b.rod(onStaff(1.53), onStaff(1.6), [0.034, 0.04], { color: GOLD_D, bone: staff, sides: 8 });
  // glowing runes down the shaft
  const shaftSurf = b.surface(shaft);
  for (const [i, y] of [0.8, 1.06, 1.3].entries()) {
    const c = onStaff(y);
    const hit = shaftSurf.ray([c.x, c.y, c.z + 0.3], [0, 0, -1]);
    if (hit)
      glow(
        b.decal(shaft, RUNES[i % RUNES.length], { at: hit.at, dir: [0, 0, 1], size: [0.04, 0.06], bone: staff, lift: 0.0015 }),
        1.3,
      );
  }
  // hanging ribbons and charm just under the head
  const ribJ = b.joint("ribbonAnchor", { parent: staff, at: onStaff(1.5), dir: [0, -1, 0] });
  for (const r of [
    { n: "ribbonA", off: [-0.03, 0, 0.035], len: 0.26 },
    { n: "ribbonB", off: [0.035, 0, -0.025], len: 0.2 },
  ]) {
    const base = onStaff(1.5).add(new THREE.Vector3(...r.off));
    const ch = b.chain(
      r.n,
      catmull([
        base,
        base.clone().add(new THREE.Vector3(0.0, -r.len * 0.5, 0.0)),
        base.clone().add(new THREE.Vector3(0.0, -r.len * 0.98, 0.0)),
      ]),
      { parent: ribJ, names: [`${r.n}1`, `${r.n}2`, `${r.n}3`] },
    );
    b.cards([frame(base, [0, 1, 0])], RIBBON, { size: [0.04, r.len], lean: 180, flow: [0, 0, 1], color: INDIGO_L, bone: ch.joints[0] });
    b.part(new THREE.SphereGeometry(0.014, 6, 5), GOLD, { at: ch.at(1).at.clone().add(new THREE.Vector3(0, -0.01, 0)), bone: ch.joints[2] });
  }

  // crescent head
  const C = STAFF_T.clone().addScaledVector(STAFF_A, 0.25);
  const side = new THREE.Vector3(1, 0, 0);
  const crescent: OutlinePoint[] = [];
  const Rout = 0.25;
  const Rin = 0.185;
  for (let i = 0; i <= 12; i++) {
    const a = ((158 + (i / 12) * 224) * Math.PI) / 180;
    crescent.push(i === 0 || i === 12 ? [Math.cos(a) * Rout, Math.sin(a) * Rout, "sharp"] : [Math.cos(a) * Rout, Math.sin(a) * Rout]);
  }
  for (let i = 0; i <= 12; i++) {
    const a = ((382 - (i / 12) * 224) * Math.PI) / 180;
    crescent.push([Math.cos(a) * Rin, 0.06 + Math.sin(a) * Rin]);
  }
  b.extrude(crescent, { at: C, x: side, y: STAFF_A, thickness: 0.036, bevel: 0.01, color: GOLD, bone: staff });
  // glowing cyan inlay on the crescent
  const inlay: OutlinePoint[] = [];
  for (let i = 0; i <= 12; i++) {
    const a = ((174 + (i / 12) * 192) * Math.PI) / 180;
    inlay.push([Math.cos(a) * 0.232, Math.sin(a) * 0.232]);
  }
  for (let i = 0; i <= 12; i++) {
    const a = ((364 - (i / 12) * 192) * Math.PI) / 180;
    inlay.push([Math.cos(a) * 0.205, 0.06 + Math.sin(a) * 0.205]);
  }
  glow(b.extrude(inlay, { at: C, x: side, y: STAFF_A, thickness: 0.041, color: CYAN, bone: staff }), 1.2);
  // horns of the crescent
  for (const s of [1, -1]) {
    const tip = C.clone().addScaledVector(side, s * 0.232).addScaledVector(STAFF_A, 0.094);
    b.spike(tip, STAFF_A, 0.1, 0.02, { color: GOLD, bone: staff, sides: 6 });
    glow(b.part(new THREE.OctahedronGeometry(0.016, 0), MAGENTA, { at: tip.clone().addScaledVector(STAFF_A, 0.115), bone: staff, scale: [1, 1.5, 1], flat: true }), 1.2);
  }
  // crescent seat collar
  b.rod(STAFF_T.clone().addScaledVector(STAFF_A, -0.04), STAFF_T.clone().addScaledVector(STAFF_A, 0.02), 0.042, { color: GOLD, bone: staff, sides: 8 });
  b.rod(STAFF_T.clone().addScaledVector(STAFF_A, 0.02), STAFF_T.clone().addScaledVector(STAFF_A, 0.075), [0.044, 0.026], { color: GOLD_D, bone: staff, sides: 8 });
  // gem at the crescent's foot
  glow(
    b.part(new THREE.OctahedronGeometry(0.026, 0), MAGENTA, {
      at: STAFF_T.clone().addScaledVector(STAFF_A, 0.1).add(new THREE.Vector3(0, 0, 0.03)),
      bone: staff,
      scale: [1, 1.3, 0.8],
      flat: true,
    }),
    1.3,
  );

  // orb with orbiting halos and shards
  const OC = C.clone().addScaledVector(STAFF_A, 0.06);
  const orbit = b.joint("orbit", { parent: staff, at: OC, dir: STAFF_A });
  glow(b.part(new THREE.IcosahedronGeometry(0.125, 1), CYAN, { at: OC, bone: orbit, flat: true }), 1.5);
  glow(b.part(new THREE.OctahedronGeometry(0.07, 0), "#e8ffff", { at: OC, bone: orbit, flat: true, rotation: [20, 30, 0] }), 1.8);
  const halo1 = b.joint("halo1", { parent: orbit, at: OC, dir: STAFF_A });
  const halo2 = b.joint("halo2", { parent: orbit, at: OC, dir: STAFF_A });
  const n1 = new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), (32 * Math.PI) / 180);
  const n2 = new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(1, 0, 0), (-32 * Math.PI) / 180);
  b.sweep(catmull(ringPoints(OC, n1, 0.2, 22), { closed: true }), 0.0095, { color: GOLD, bone: halo1, sides: 5 });
  b.sweep(catmull(ringPoints(OC, n2, 0.175, 20), { closed: true }), 0.0085, { color: CYAN, bone: halo2, sides: 5 });
  for (const [i, p] of ringPoints(OC, n1, 0.2, 5).entries()) {
    glow(
      b.part(new THREE.OctahedronGeometry(i % 2 ? 0.02 : 0.028, 0), i % 2 ? MAGENTA : CYAN, {
        at: p,
        bone: halo1,
        scale: [0.8, 1.5, 0.8],
        rotation: [15 * i, 40 * i, 10],
        flat: true,
      }),
      1.3,
    );
  }
  for (const [i, p] of ringPoints(OC, n2, 0.175, 3).entries())
    glow(b.part(new THREE.OctahedronGeometry(0.018, 0), "#e8ffff", { at: p, bone: halo2, scale: [1, 1.4, 1], rotation: [20 * i, 0, 30], flat: true }), 1.4);

  // -------------------------------------------------------------------------------------------------------------
  // Left-hand wisp

  const wisp = b.joint("wisp", { parent: wristL, at: [0.4, 0.62, 0.25], dir: [0, 1, 0] });
  glow(b.part(new THREE.IcosahedronGeometry(0.04, 1), "#ffd96a", { at: [0.4, 0.62, 0.25], bone: wisp, flat: true }), 1.6);
  glow(b.part(new THREE.OctahedronGeometry(0.022, 0), "#ffffff", { at: [0.4, 0.62, 0.25], bone: wisp, flat: true }), 1.8);
  b.sweep(
    catmull(ringPoints(new THREE.Vector3(0.4, 0.62, 0.25), new THREE.Vector3(0.2, 1, 0.3), 0.07, 12), { closed: true }),
    0.004,
    { color: CYAN, bone: wisp, sides: 4 },
  );
  b.sweep(bezier([0.4, 0.57, 0.24], [0.39, 0.52, 0.22], [0.385, 0.49, 0.2]), [0.012, 0.0], { color: "#ffe9a0", bone: wisp, sides: 5, caps: "none" });

  // drifting motes of light
  const motes = b.joint("motes", { parent: staff, at: OC, dir: [0, 1, 0] });
  for (const [i, m] of [
    [-0.2, 1.72, 0.3],
    [-0.05, 1.98, 0.35],
    [-0.7, 1.82, 0.12],
    [-0.62, 1.5, 0.3],
    [-0.18, 1.45, 0.4],
    [-0.78, 2.0, 0.28],
    [0.1, 1.3, 0.34],
    [0.55, 0.95, 0.4],
  ].entries()) {
    glow(
      b.part(new THREE.OctahedronGeometry(i % 3 === 0 ? 0.016 : 0.01, 0), i % 2 ? CYAN : "#ffe9a0", { at: m as [number, number, number], bone: motes, flat: true }),
      1.3,
    );
  }
  return b.root;
}
```

## Example: windSwordsmanSonnet

Brief: Category: Humanoid character.
Subject: cel-shaded anemo swordsman in a travelling coat with scarf, straw hat and glowing wind blade.
Style: Genshin Impact.
Topology: biped
Style family: genshin-impact
Notable features: humanoid-rig, scarf, sword, glow, coat

```ts
// Wandering wind swordsman, Genshin Impact style: cel-shaded white-and-navy travelling coat with teal anemo trims,
// gold filigree, a long wind-caught scarf, a straw hat on his back and a glowing wind blade held low in his right hand.
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";
import { frame } from "agentic-3js-builder";
import { lerp, rng } from "agentic-3js-builder";
import { arc, bezier, catmull, polyline, spiral } from "agentic-3js-builder";
import { limb } from "agentic-3js-builder";
import { paint } from "agentic-3js-builder";
import type { Chain, Joint } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { animeEye, cel } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Wandering Wind Swordsman",
  description:
    "A cel-shaded anemo swordsman in a white travelling coat with teal and gold trims, a wind-blown scarf, a straw hat slung on his back and a glowing wind blade held low at his side.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------- palette
const WHITE = cel("#f7f3e8", "#b7c6dc");
const TEAL = cel("#3ed6bd", "#2a86b4");
const TEAL_D = cel("#1f929c", "#1a5a8c");
const NAVY = cel("#26365f", "#171f48");
const NAVY_L = cel("#3d5683", "#262f66");
const GOLD = cel("#f6c552", "#b9742c");
const LEATHER = cel("#7c4e33", "#4a2b33");
const SKIN = cel("#ffe0c6", "#f2b3a2");
const HAIR = cel("#2d4272", "#1a2250");
const HAIR_TIP = cel("#8ff2da", "#42b0c6");
const STRAW = cel("#e6c378", "#b5834c");
const STRAW_D = cel("#c99a56", "#8f5f3e");
const WHITE2 = cel("#e9f1ef", "#a9bcd6");
const CLOTH = paint((p, _n, _s) => {
  const u = p.x + p.z * 0.9;
  return (Math.floor(u * 34 + p.y * 34) + Math.floor(u * 34 - p.y * 34)) % 2 === 0 ? WHITE : WHITE2;
});
const LIP = "#d9707a";
const MINT = "#b9fff1"; // glowing wind
const MINT_D = "#4fe6c8";
const IRIS = "#3fe0c4";

type Pt = [number, number, number];
const prof = (keys: [number, number][]) => (t: number) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, r0] = keys[i - 1];
      const [t1, r1] = keys[i];
      return r0 + ((r1 - r0) * (t - t0)) / (t1 - t0);
    }
  }
  return keys[keys.length - 1][1];
};
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const ringPts = (c: Pt, rx: number, rz: number, n = 10, tilt = 0): Pt[] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [c[0] + Math.sin(a) * rx, c[1] + Math.cos(a) * tilt, c[2] + Math.cos(a) * rz];
  });

// ---------------------------------------------------------------- drawings
const EYE = animeEye({ iris: IRIS, irisLight: "#c8fff0", irisDark: "#1b6ea8", blush: "#ff8fa0" });

const FEATHER = svg(
  `<svg viewBox="0 0 40 100"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
  <stop offset="0" stop-color="#1f929c"/><stop offset="0.45" stop-color="#3ed6bd"/><stop offset="1" stop-color="#f7f3e8"/></linearGradient></defs>
  <path d="M20 99 C3 80 1 38 20 1 C39 38 37 80 20 99Z" fill="url(#g)" stroke="#f6c552" stroke-width="4"/>
  <path d="M20 94 L20 14" stroke="#1a5a8c" stroke-width="3" stroke-linecap="round"/>
  <path d="M20 70 L8 56 M20 56 L10 42 M20 42 L12 30 M20 70 L32 56 M20 56 L30 42 M20 42 L28 30" stroke="#1a5a8c" stroke-width="2.4" stroke-linecap="round" opacity="0.7"/>
  </svg>`,
  { size: 192 },
);

const FILIGREE = svg(
  `<svg viewBox="0 0 160 24"><g fill="none" stroke="#f6c552" stroke-width="2.2" stroke-linecap="round">
  <path d="M0 12 H160" stroke-width="1.6"/>
  ${Array.from({ length: 8 }, (_, i) => {
    const x = 10 + i * 20;
    return `<path d="M${x - 8} 12 C${x - 8} 2 ${x + 4} 2 ${x + 4} 9 C${x + 4} 14 ${x - 2} 14 ${x - 2} 10"/><path d="M${x + 2} 12 C${x + 2} 22 ${x + 14} 22 ${x + 14} 15 C${x + 14} 10 ${x + 8} 10 ${x + 8} 14"/>`;
  }).join("")}
  </g></svg>`,
  { size: 640 },
);

const GUST = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#1f2a52" stroke="#f6c552" stroke-width="4"/>
  <g fill="none" stroke="#7ff3d8" stroke-width="4.4" stroke-linecap="round">
  <path d="M32 32 C32 24 42 22 44 30 C46 40 32 46 22 40 C14 34 18 20 30 16 C40 13 50 18 52 26"/>
  <path d="M14 46 C20 52 30 54 38 51" stroke="#f6c552" stroke-width="3"/><path d="M12 24 C14 18 20 14 26 12" stroke="#f6c552" stroke-width="3"/></g></svg>`,
  { size: 192 },
);

const SWIRL_SIDE = svg(
  `<svg viewBox="0 0 64 64"><g fill="none" stroke="#f6c552" stroke-width="3" stroke-linecap="round">
  <circle cx="32" cy="32" r="28" stroke-width="2"/>
  <path d="M32 32 C32 26 38 25 39 30 C40 36 31 38 27 34 C22 29 26 21 33 20 C41 19 46 25 45 32"/>
  <path d="M10 32 C12 20 22 12 32 10 M54 32 C52 44 42 52 32 54"/></g></svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "windSwordsman" });

  // ================================================================ skeleton
  const hips = b.joint("hips", { at: [0, 0.96, 0], role: "spine", group: "torso" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.96, 0],
      [0, 1.1, 0],
      [0, 1.26, 0.01],
      [0, 1.42, 0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine", group: "torso" },
  );
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 1.43, 0], aim: [0, 1.545, 0.015], role: "neck", group: "head" });
  const head = b.joint("head", { parent: neck, at: [0, 1.545, 0.015], aim: [0, 1.7, 0.03], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.585, -0.02], aim: [0, 1.56, 0.06], role: "jaw", group: "head" });

  // ================================================================ legs
  const legs: Record<string, Chain> = {};
  const toes: Record<string, Joint> = {};
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const pts = limb([s * 0.09, 0.93, 0], [s * 0.1, 0.1, -0.005], [0.43, 0.41], [0, 0, 1]);
    const leg = b.chain(`leg${L}`, pts, {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `ankle${L}`],
      role: "leg",
      contact: [s * 0.1, 0, 0.04],
      group: "legs",
    });
    legs[L] = leg;
    toes[L] = b.joint(`toe${L}`, { parent: leg.tip ?? leg.joints[2], at: [s * 0.1, 0.045, 0.1], aim: [s * 0.1, 0.035, 0.2], role: "hinge", group: "legs" });
  }

  // ================================================================ arms
  const arms: Record<string, Chain> = {};
  const armPts: Record<string, Pt[]> = {};
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const shoulder: Pt = [s * 0.19, 1.385, 0];
    const lm = limb(shoulder, [s * 0.465, 0.95, 0.075], [0.29, 0.26], [0, 0, -1]);
    const pts: Pt[] = [[s * 0.045, 1.4, 0], ...lm.map((p) => [p.x, p.y, p.z] as Pt)];
    armPts[L] = pts;
    arms[L] = b.chain(`arm${L}`, polyline(pts), {
      parent: chest,
      names: [`clav${L}`, `shoulder${L}`, `elbow${L}`, `wrist${L}`],
      role: "arm",
      group: "arms",
    });
  }

  // ================================================================ torso
  const torsoPaint = paint((p, _n, _s) => {
    const front = p.z > 0.0;
    const open = Math.max(0, (p.y - 1.1) / 0.33) * 0.1;
    if (front && p.y > 1.1 && Math.abs(p.x) < open) return NAVY;
    if (p.y > 1.35 && Math.abs(p.x) > 0.075) return TEAL;
    if (p.y < 1.03) return NAVY;
    if (front && p.y > 1.1 && Math.abs(p.x) < open + 0.008) return GOLD;
    return CLOTH;
  });
  const torso = b.loft(
    [
      { at: [0, 0.9, 0], w: 0.28, h: 0.19 },
      { at: [0, 0.98, 0], w: 0.31, h: 0.2 },
      { at: [0, 1.1, 0.005], w: 0.27, h: 0.18 },
      { at: [0, 1.26, 0.01], w: 0.33, h: 0.21 },
      { at: [0, 1.37, 0.0], w: 0.35, h: 0.2 },
      { at: [0, 1.44, -0.005], w: 0.15, h: 0.14 },
    ],
    { bone: [spine, hips], color: torsoPaint, sides: 12, group: "torso" },
  );
  const skin = b.surface(torso);

  // navy collar and lapels
  b.sweep(catmull(ringPts([0, 1.465, 0], 0.075, 0.07, 10), { closed: true }), [0.012, 0.028], {
    section: "box", bone: neck, color: NAVY, sides: 10, name: "collar",
  });
  b.sweep(catmull(ringPts([0, 1.488, 0], 0.07, 0.066, 10), { closed: true }), [0.006, 0.01], {
    section: "box", bone: neck, color: GOLD, name: "collarTrim",
  });
  for (const s of [1, -1]) {
    const lap = skin.drape(
      catmull([
        [s * 0.085, 1.43, 0.06],
        [s * 0.06, 1.36, 0.1],
        [s * 0.03, 1.25, 0.115],
        [s * 0.003, 1.13, 0.115],
      ]),
      { lift: 0.008 },
    );
    b.sweep(lap, [0.012, 0.006], { section: "box", color: GOLD, name: "lapel" });
    // gold coat buttons
  }
  for (let i = 0; i < 4; i++) {
    const hit = skin.ray([0, 1.4 - i * 0.06, 0.5], [0, 0, -1]);
    if (hit) b.stick(new THREE.SphereGeometry(0.01, 6, 4), GOLD, hit, { embed: 0.3, name: "button" });
  }

  // belt / sash
  const beltPath = skin.loop([0, 1.065, 0], { lift: 0.012 });
  b.sweep(beltPath, [0.014, 0.055], { section: "box", color: paint((_p, _n, s) => (Math.abs(((s[0] * 40) % 1) - 0.5) < 0.04 ? GOLD : NAVY_L)), name: "sash" });
  b.sweep(skin.loop([0, 1.115, 0], { lift: 0.012 }), [0.01, 0.01], { color: GOLD, name: "sashTrimU" });
  b.sweep(skin.loop([0, 1.015, 0], { lift: 0.012 }), [0.01, 0.01], { color: GOLD, name: "sashTrimD" });
  b.along(skin.loop([0, 1.065, 0], { lift: 0.034 }), 26, (at) => b.part(new THREE.SphereGeometry(0.0072, 5, 4), GOLD, { at, name: "sashStud" }));
  // buckle
  const buckle = b.lathe(
    [
      [0, 0],
      [0.04, 0],
      [0.048, 0.008],
      [0.04, 0.016],
      [0, 0.016],
    ],
    { at: [0, 1.065, 0.115], axis: [0, 0.05, 1], bone: hips, color: GOLD, segments: 8, name: "buckle" },
  );
  b.part(new THREE.CircleGeometry(0.036, 16), "#ffffff", { at: [0, 1.065, 0.1325], dir: [0, 0, 1], axis: "z", texture: GUST, bone: hips, name: "buckleEmblem" });
  void buckle;

  // coat tails on chains hanging from the hips
  const tailPaint = (tealBand: boolean) =>
    paint((_p, _n, s) => (s[0] > 0.955 ? GOLD : s[0] > 0.9 ? (tealBand ? TEAL : NAVY_L) : s[0] > 0.885 ? GOLD : CLOTH));
  const tailsUp = (s: number): [number, number, number] => [s, 0, 0];
  type Tail = { name: string; pts: Pt[]; up?: [number, number, number]; w: [number, number]; dir: [number, number, number] };
  const tails: Tail[] = [];
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    tails.push(
      { name: `frontTail${L}`, w: [0.08, 0.072], dir: [0, 0, 1], pts: [[s * 0.085, 1.04, 0.104], [s * 0.09, 0.9, 0.128], [s * 0.1, 0.74, 0.14], [s * 0.115, 0.6, 0.136]] },
      { name: `sideTail${L}`, w: [0.075, 0.07], dir: [s, 0, 0], up: tailsUp(s), pts: [[s * 0.15, 1.035, 0.0], [s * 0.19, 0.9, 0.0], [s * 0.21, 0.75, -0.01], [s * 0.225, 0.62, -0.045]] },
      { name: `backTail${L}`, w: [0.075, 0.068], dir: [0, 0, -1], pts: [[s * 0.07, 1.035, -0.105], [s * 0.09, 0.88, -0.13], [s * 0.115, 0.68, -0.16], [s * 0.14, 0.5, -0.22]] },
    );
  }
  for (const t of tails) {
    const ch = b.chain(t.name, catmull(t.pts), { parent: hips, up: t.up, count: 3, group: "coat" });
    const sw = b.sweep(ch, (u) => [t.w[0] + (t.w[1] - t.w[0]) * u, 0.011], { section: "box", color: tailPaint(t.name.includes("front")), name: t.name });
    const pt = sw.at(0.8, 0);
    b.decal(sw, FILIGREE, { at: pt.at, dir: t.dir, size: [0.13, 0.02], segments: 8, name: `${t.name}Fil` });
    if (t.name.includes("front")) b.decal(sw, SWIRL_SIDE, { at: sw.at(0.5, 0).at, dir: t.dir, size: [0.07, 0.07], segments: 6, name: `${t.name}Swirl` });
  }
  // sash knot and tassel ties on the left hip
  const knotAt: Pt = [0.15, 1.06, 0.075];
  b.part(new THREE.SphereGeometry(0.03, 8, 6), NAVY_L, { at: knotAt, bone: hips, scale: [1, 0.9, 0.8], name: "sashKnot" });
  const tie = b.chain("sashTie", catmull([[0.16, 1.05, 0.08], [0.2, 0.92, 0.1], [0.23, 0.78, 0.09], [0.24, 0.68, 0.07]]), { parent: hips, count: 3, group: "coat" });
  b.sweep(tie, prof([[0, 0.014], [0.7, 0.012], [1, 0.008]]), { section: "box", color: tailPaint(true), name: "sashTieTail" });
  b.sweep(tie, [0.007, 0.001], { color: GOLD, from: 0.92, to: 1, extend: 0.0, name: "tieTip" });
  const tasselEnd = tie.at(1).at;
  glow(b.part(new THREE.SphereGeometry(0.014, 6, 4), MINT_D, { at: [tasselEnd.x, tasselEnd.y - 0.02, tasselEnd.z], bone: tie.joints[2], name: "tieBead" }), 1);

  // ================================================================ neck, scarf
  b.sweep(catmull([[0, 1.42, 0], [0, 1.5, 0.012], [0, 1.56, 0.02]]), 0.043, { bone: neck, color: SKIN, name: "neck" });
  const scarfWrap = paint((p, _n, _s) => (Math.abs(((p.x * 1.2 + p.z) * 22) % 1) < 0.1 ? GOLD : TEAL));
  b.sweep(catmull(ringPts([0, 1.435, 0], 0.084, 0.082, 10, 0.008), { closed: true }), 0.03, { bone: neck, color: scarfWrap, sides: 8, name: "scarfLow" });
  b.sweep(catmull(ringPts([0, 1.47, -0.002], 0.077, 0.075, 10, -0.008), { closed: true }), 0.026, { bone: neck, color: TEAL, sides: 8, name: "scarfHigh" });
  b.part(new THREE.SphereGeometry(0.036, 8, 6), TEAL_D, { at: [0.06, 1.44, 0.075], bone: neck, scale: [1, 0.85, 0.9], name: "scarfKnot" });
  const scarfPaint = paint((p, _n, s) => {
    if (s[0] > 0.96) return GOLD;
    if (s[0] > 0.9) return WHITE;
    return Math.abs(Math.sin((p.y + p.z) * 16)) < 0.1 ? GOLD : TEAL;
  });
  const scarfA = b.chain(
    "scarfA",
    catmull([[0.07, 1.43, -0.06], [0.16, 1.31, -0.19], [0.27, 1.14, -0.31], [0.34, 0.95, -0.4], [0.3, 0.77, -0.52], [0.2, 0.64, -0.68], [0.08, 0.6, -0.84]]),
    { parent: chest, count: 6, twist: 160, role: "tail", group: "scarf" },
  );
  b.sweep(scarfA, (t) => [0.048 + 0.012 * t, 0.008], { section: "box", color: scarfPaint, name: "scarfTailA", caps: "flat" });
  const scarfB = b.chain(
    "scarfB",
    catmull([[-0.06, 1.43, -0.07], [-0.13, 1.28, -0.2], [-0.2, 1.1, -0.3], [-0.23, 0.92, -0.38], [-0.17, 0.82, -0.5], [-0.12, 0.74, -0.6]]),
    { parent: chest, count: 5, twist: -120, role: "tail", group: "scarf" },
  );
  b.sweep(scarfB, (t) => [0.04 + 0.01 * t, 0.008], { section: "box", color: scarfPaint, name: "scarfTailB", caps: "flat" });

  // ================================================================ head
  const skullC: Pt = [0, 1.635, 0.005];
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), SKIN, { bone: head, at: skullC, scale: [0.098, 0.105, 0.105], name: "skull" });
  const face = b.loft(
    [
      { at: [0, 1.625, 0.026], w: 0.17, h: 0.17 },
      { at: [0, 1.595, 0.032], w: 0.166, h: 0.16 },
      { at: [0, 1.572, 0.036], w: 0.15, h: 0.148 },
    ],
    { bone: head, color: SKIN, sides: 12, caps: { start: "flat", end: "round" }, name: "cheeks" },
  );
  const chin = b.loft(
    [
      { at: [0, 1.583, 0.034], w: 0.152, h: 0.15 },
      { at: [0, 1.553, 0.04], w: 0.125, h: 0.13 },
      { at: [0, 1.53, 0.052], w: 0.075, h: 0.095 },
      { at: [0, 1.517, 0.062], w: 0.036, h: 0.05 },
    ],
    { bone: jaw, color: SKIN, sides: 12, name: "chin" },
  );
  const faceSurf = b.surface([skull, face, chin]);
  for (const s of [1, -1]) {
    const hit = faceSurf.around(V(0, 1.62, 0.0)).at(s * 29, -8);
    if (hit) b.decal(faceSurf, EYE, { at: hit, dir: [s * 0.18, 0, 1], size: [0.066, 0.09], mirror: s > 0, segments: 12, name: `eye${s > 0 ? "L" : "R"}` });
  }
  // nose and mouth
  b.part(new THREE.ConeGeometry(0.011, 0.028, 5), SKIN, { at: [0, 1.598, 0.121], dir: [0, -0.35, 1], name: "nose" });
  const mouthHit = faceSurf.ray([0, 1.552, 0.5], [0, 0, -1]);
  if (mouthHit) {
    const mp = faceSurf.drape(catmull([[-0.022, 1.553, 0.1], [-0.008, 1.548, 0.108], [0.008, 1.549, 0.108], [0.022, 1.555, 0.1]]), { lift: 0.0015 });
    b.sweep(mp, 0.0028, { color: LIP, bone: head, sides: 4, name: "mouth" });
  }
  // ears with earring
  for (const s of [1, -1]) {
    b.extrude(
      [[-0.03, -0.005], [-0.012, -0.03], [0.008, -0.026], [0.02, 0.0], [0.014, 0.03], [-0.004, 0.052, "sharp"], [-0.03, 0.02]],
      { at: [s * 0.096, 1.612, 0.0], x: [0, 0, 1], y: [s * 0.3, 1, 0], thickness: 0.012, bevel: 0.003, color: SKIN, bone: head, name: `ear${s > 0 ? "L" : "R"}` },
    );
  }
  b.part(new THREE.TorusGeometry(0.014, 0.0035, 5, 10), GOLD, { at: [0.098, 1.585, 0.0], dir: [1, 0, 0], axis: "z", bone: head, name: "earring" });
  glow(b.part(new THREE.OctahedronGeometry(0.011), MINT_D, { at: [0.099, 1.565, 0.0], bone: head, scale: [0.8, 1.6, 0.8], name: "earringGem" }), 1);
  b.cards([frame([0.099, 1.555, 0.0], [0, 1, 0])], FEATHER, { size: [0.022, 0.07], lean: 180, flow: [0, 0, 1], bone: head, sink: 0, name: "earFeather" });

  // ================================================================ hair
  const capC = V(0, 1.645, -0.01);
  const cap = b.part(new THREE.SphereGeometry(1, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.555), paintCap(), {
    bone: head,
    at: capC,
    rotation: [-25, 0, 0],
    scale: [0.113, 0.113, 0.117],
    name: "hairCap",
  });
  function paintCap() {
    return paint((p, _n, _s) => (p.y < 1.585 + 0.03 * Math.sin(p.x * 40) && p.z < 0.0 ? HAIR_TIP : HAIR));
  }
  const capSurf = b.surface(cap);
  const HAIR_LOCK = paint((_p, _n, s) => (s[0] > 0.68 ? HAIR_TIP : s[0] > 0.6 ? TEAL : HAIR));
  const hairAt = (az: number, el: number) => capSurf.around(capC).at(az, el);
  const lockDefs: [number, number, Pt, number, number][] = [
    // bangs
    [-50, 40, [-0.098, 1.628, 0.088], 0.03, 0.022],
    [-34, 52, [-0.07, 1.64, 0.118], 0.035, 0.025],
    [-12, 58, [-0.03, 1.625, 0.128], 0.045, 0.028],
    [10, 58, [0.022, 1.64, 0.128], 0.04, 0.026],
    [30, 52, [0.07, 1.648, 0.119], 0.035, 0.025],
    [48, 40, [0.1, 1.63, 0.09], 0.03, 0.022],
    // long side locks
    [76, 8, [0.112, 1.49, 0.07], 0.025, 0.03],
    [-76, 8, [-0.112, 1.49, 0.07], 0.025, 0.03],
    [68, 22, [0.098, 1.46, 0.09], 0.02, 0.022],
    [-68, 22, [-0.098, 1.46, 0.09], 0.02, 0.022],
    // nape and back
    [150, -4, [0.07, 1.44, -0.105], 0.03, 0.032],
    [-150, -4, [-0.07, 1.44, -0.105], 0.03, 0.032],
    [178, -8, [0.02, 1.4, -0.12], 0.03, 0.03],
    [-178, -8, [-0.02, 1.4, -0.12], 0.03, 0.03],
    [128, -2, [0.112, 1.49, -0.06], 0.03, 0.03],
    [-128, -2, [-0.112, 1.49, -0.06], 0.03, 0.03],
    [165, 30, [0.1, 1.5, -0.14], 0.035, 0.03],
    [-165, 30, [-0.1, 1.5, -0.14], 0.035, 0.03],
    // crown flicks
    [160, 55, [0.07, 1.67, -0.18], 0.035, 0.024],
    [-160, 55, [-0.07, 1.67, -0.18], 0.035, 0.024],
    [110, 62, [0.14, 1.67, -0.08], 0.035, 0.024],
    [-110, 62, [-0.14, 1.67, -0.08], 0.035, 0.024],
    // inner fringe strands
    [-22, 50, [-0.045, 1.612, 0.126], 0.03, 0.014],
    [2, 52, [0.0, 1.605, 0.13], 0.03, 0.014],
    [18, 50, [0.045, 1.615, 0.126], 0.03, 0.014],
    [38, 45, [0.085, 1.605, 0.108], 0.03, 0.014],
    [-42, 45, [-0.085, 1.61, 0.108], 0.03, 0.014],
    // cowlick
    [20, 80, [0.04, 1.8, 0.1], 0.07, 0.016],
  ];
  lockDefs.forEach(([az, el, tip, lift, r], i) => {
    const hit = hairAt(az, el);
    if (!hit) return;
    const ctrl = lerp(hit, tip, 0.5).addScaledVector(hit.n, lift);
    b.sprout(`lock${i}`, hit, bezier(hit, ctrl, tip), [r, 0.003], { count: 0, color: HAIR_LOCK, caps: { end: "point" }, sides: 6, group: "hair" });
  });
  // ponytail
  const tieHit = hairAt(180, 28)!;
  const pony = b.sprout(
    "ponytail",
    tieHit,
    catmull([tieHit, [0, 1.68, -0.2], [0.0, 1.58, -0.27], [0.03, 1.42, -0.31], [0.05, 1.26, -0.3], [0.04, 1.12, -0.26]]),
    [0.04, 0.005],
    { count: 4, role: "tail", color: HAIR_LOCK, caps: { end: "point" }, sides: 8, group: "hair" },
  );
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const sp = b.chain(
      `ponyStrand${L}`,
      catmull([[s * 0.01, 1.69, -0.14], [s * 0.05, 1.62, -0.3], [s * 0.1, 1.46, -0.37], [s * 0.13, 1.3, -0.34]]),
      { parent: head, count: 3, role: "tail", group: "hair" },
    );
    b.sweep(sp, [0.03, 0.004], { color: HAIR_LOCK, caps: { end: "point" }, sides: 6, name: `ponyStrand${L}` });
  }
  const ponyBase = pony.chain?.joints[0];
  b.part(new THREE.TorusGeometry(0.036, 0.009, 5, 10), GOLD, { at: tieHit.moved([0, 0.05, 0]), dir: [0, 0.7, -1], axis: "z", bone: ponyBase ?? head, name: "hairTie" });
  b.part(new THREE.SphereGeometry(0.014, 6, 4), TEAL, { at: tieHit.moved([0.03, 0.05, 0]), bone: head, name: "hairTieBead" });
  // hairpin with tassel at the right temple
  b.rod([-0.09, 1.7, 0.03], [-0.115, 1.665, 0.04], 0.005, { bone: head, color: GOLD, name: "hairpin" });
  glow(b.part(new THREE.OctahedronGeometry(0.014), MINT_D, { at: [-0.118, 1.66, 0.042], bone: head, scale: [1, 1.3, 1], name: "hairpinGem" }), 1);
  b.cards([frame([-0.118, 1.648, 0.042], [0, 1, 0])], FEATHER, { size: [0.03, 0.1], lean: 180, flow: [0, 0, 1], bone: head, sink: 0, name: "hairpinFeather" });

  // ================================================================ legs: trousers, boots
  const PANTS = NAVY;
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const leg = legs[L];
    b.sweep(leg, prof([[0, 0.088], [0.25, 0.082], [0.5, 0.066], [0.66, 0.07]]), { from: 0, to: 0.66, color: PANTS, sides: 10, caps: { start: "round", end: "flat" }, name: `trousers${L}` });
    b.sweep(leg, prof([[0.6, 0.057], [0.66, 0.057], [0.8, 0.05], [1, 0.046]]), { from: 0.6, to: 1, color: paint((p, _n, _s) => (p.y < 0.22 && p.y > 0.2 ? GOLD : NAVY_L)), sides: 10, caps: { start: "flat", end: "round" }, name: `boot${L}` });
    b.sweep(leg, prof([[0.6, 0.066], [1, 0.066]]), { from: 0.6, to: 0.645, color: GOLD, sides: 10, caps: "flat", name: `bootCuff${L}` });
    b.sweep(leg, prof([[0.72, 0.056], [1, 0.056]]), { from: 0.72, to: 0.745, color: LEATHER, sides: 10, caps: "flat", name: `bootStrapA${L}` });
    b.sweep(leg, prof([[0.84, 0.052], [1, 0.052]]), { from: 0.84, to: 0.865, color: LEATHER, sides: 10, caps: "flat", name: `bootStrapB${L}` });
    for (const t of [0.73, 0.85]) {
      const bp = leg.at(t);
      b.part(new THREE.BoxGeometry(0.012, 0.022, 0.022), GOLD, { at: [bp.at.x + s * 0.05, bp.at.y, bp.at.z + 0.018], bone: bp.bone ?? undefined, name: `bootBuckle${L}` });
    }
    // knee guard
    const kc = leg.at(0.5);
    b.part(new THREE.SphereGeometry(0.05, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.45), GOLD, { at: [kc.at.x, kc.at.y + 0.005, kc.at.z + 0.045], dir: [0, 0.4, 1], bone: kc.bone ?? undefined, scale: [0.9, 1, 0.5], name: `kneeGuard${L}` });
    // feet
    const bootP = paint((p, _n, _s) => (p.y < 0.02 ? LEATHER : p.z > 0.15 ? GOLD : NAVY_L));
    b.loft(
      [
        { at: [s * 0.1, 0.066, -0.06], w: 0.09, h: 0.132 },
        { at: [s * 0.1, 0.05, 0.025], w: 0.098, h: 0.1 },
        { at: [s * 0.1, 0.039, 0.095], w: 0.098, h: 0.078 },
      ],
      { bone: legs[L].tip ?? legs[L].joints[2], color: bootP, sides: 10, name: `foot${L}` },
    );
    b.loft(
      [
        { at: [s * 0.1, 0.039, 0.09], w: 0.098, h: 0.078 },
        { at: [s * 0.1, 0.032, 0.16], w: 0.082, h: 0.064 },
        { at: [s * 0.1, 0.0235, 0.225], w: 0.05, h: 0.047 },
      ],
      { bone: toes[L], color: bootP, sides: 10, name: `toe${L}` },
    );
    // gold wing flares at the ankle
    for (const o of [1, -1]) {
      b.extrude([[0, 0], [0.075, 0.03], [0.14, 0.1, "sharp"], [0.09, 0.09], [0.03, 0.075], [-0.045, 0.045]], {
        at: [s * (0.1 + o * 0.053), 0.1, -0.035], x: [0, 0, -1], y: [o * 0.35, 1, 0], thickness: 0.008, bevel: 0.002, color: GOLD, bone: legs[L].tip ?? legs[L].joints[2], name: `ankleWing${L}${o > 0 ? "a" : "b"}`,
      });
    }
  }

  // ================================================================ arms: sleeves, bracers, pauldrons, hands
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const arm = arms[L];
    b.sweep(arm, prof([[0, 0.058], [0.23, 0.06], [0.45, 0.05], [0.63, 0.044], [0.85, 0.04], [1, 0.036]]), { color: NAVY, sides: 9, name: `underSleeve${L}` });
    const sleeve = b.sweep(arm, prof([[0.1, 0.07], [0.3, 0.076], [0.52, 0.082]]), { from: 0.1, to: 0.52, color: paint((_p, _n, st) => (st[0] > 0.5 || st[0] < 0.17 ? TEAL : CLOTH)), sides: 10, caps: { start: "round", end: "flat" }, name: `sleeve${L}` });
    b.sweep(arm, prof([[0.5, 0.085], [0.53, 0.085]]), { from: 0.5, to: 0.535, color: GOLD, sides: 10, caps: "flat", name: `sleeveTrim${L}` });
    for (const deg of [0, 90, 180, 270]) {
      const sp = sleeve.at(0.41, deg);
      b.decal(sleeve, FILIGREE, { at: sp.at, dir: sp.n.toArray() as Pt, size: [0.095, 0.015], segments: 6, name: `sleeveFil${L}${deg}` });
    }
    // bracer
    b.sweep(arm, prof([[0.78, 0.047], [0.97, 0.04]]), { from: 0.78, to: 0.97, color: paint((_p, _n, st) => (st[0] < 0.8 || st[0] > 0.95 ? GOLD : LEATHER)), sides: 9, caps: "flat", name: `bracer${L}` });
    for (const t of [0.83, 0.88, 0.93]) b.sweep(arm, 0.043 - (t - 0.8) * 0.05, { from: t, to: t + 0.012, color: NAVY_L, sides: 9, caps: "flat", name: `bracerStrap${L}` });
  }

  // left pauldron: layered anemo feathers
  {
    const [c0, c1] = [armPts.L[1], armPts.L[2]];
    const dir = V(c1[0] - c0[0], c1[1] - c0[1], c1[2] - c0[2]).normalize();
    const cl = arms.L.joints[0];
    for (let k = 0; k < 3; k++) {
      const p0 = V(c0[0], c0[1], c0[2]).addScaledVector(dir, 0.0 + k * 0.04);
      const ringL = b.ring(frame(p0, dir), { count: 9 - k, radius: 0.07 + k * 0.012 }, () => undefined);
      b.cards(ringL.items, FEATHER, { size: [0.07 - k * 0.006, 0.13 - k * 0.012], lean: 62 - k * 5, bend: 14, flow: dir, bone: cl, vary: 0.12, rng: rng(20 + k), sink: 0.05, name: `featherEpaulet${k}` });
    }
    b.sweep(catmull(ringPts([c0[0], c0[1] + 0.01, c0[2]], 0.082, 0.082, 10), { closed: true }), 0.007, { bone: cl, color: GOLD, sides: 5, name: "pauldronRingL" });
  }
  // right pauldron: layered gold plates
  {
    const [c0, c1] = [armPts.R[1], armPts.R[2]];
    const dir = V(c1[0] - c0[0], c1[1] - c0[1], c1[2] - c0[2]).normalize();
    const cl = arms.R.joints[0];
    const cols = [GOLD, TEAL, WHITE];
    for (let k = 0; k < 3; k++) {
      const pk = V(c0[0], c0[1], c0[2]).addScaledVector(dir, 0.0 + k * 0.045).add(V(0, 0.02 - k * 0.012, 0));
      b.part(new THREE.SphereGeometry(0.1 - k * 0.006, 10, 5, 0, Math.PI * 2, 0, Math.PI * 0.42), cols[k], { at: pk, dir: [dir.x, dir.y + 1.4, dir.z], bone: cl, scale: [1, 0.55, 1], name: `plateR${k}` });
    }
    b.sweep(catmull(ringPts([c0[0], c0[1] + 0.02, c0[2]], 0.095, 0.095, 10), { closed: true }), 0.006, { bone: cl, color: GOLD, sides: 5, name: "pauldronRingR" });
    // gold strap rivets
    b.along(catmull(ringPts([c0[0], c0[1] + 0.03, c0[2]], 0.088, 0.088, 8), { closed: true }), 8, (at) => b.part(new THREE.SphereGeometry(0.008, 5, 4), GOLD, { at, bone: cl, name: "plateRivet" }));
  }

  // ---- left hand: open, relaxed
  {
    const pts = armPts.L;
    const wrist = V(...pts[3]);
    const f = wrist.clone().sub(V(...pts[2])).normalize();
    const wj = arms.L.tip ?? arms.L.joints[3];
    const palmC = wrist.clone().addScaledVector(f, 0.05);
    b.part(new THREE.BoxGeometry(0.04, 0.085, 0.085), SKIN, { at: palmC, dir: f.toArray() as Pt, bone: wj, scale: [1, 1, 1], name: "palmL" });
    const spread = V(0, 0, 1);
    const inward = V(-1, 0, 0);
    const defs: [number, number, number, number][] = [
      [0.03, 0.062, 0.7, 0.5], // index
      [0.01, 0.07, 0.4, 0.55],
      [-0.011, 0.065, 0.1, 0.55],
      [-0.03, 0.052, -0.3, 0.6],
    ];
    defs.forEach(([z, len, splay, curl], i) => {
      const base = palmC.clone().addScaledVector(f, 0.042).addScaledVector(spread, z);
      const dir = f.clone().addScaledVector(spread, splay * 0.18).addScaledVector(inward, curl * 0.12).normalize();
      const p1 = base.clone().addScaledVector(dir, len * 0.5);
      const dir2 = dir.clone().addScaledVector(inward, curl * 0.3).normalize();
      const p2 = p1.clone().addScaledVector(dir2, len * 0.5);
      const ch = b.chain(`fingerL${i + 1}`, catmull([base, p1, p2]), { parent: wj, count: 2, role: "digit", group: "handL" });
      b.sweep(ch, [0.0105, 0.008], { color: SKIN, sides: 6, name: `fingerL${i + 1}` });
    });
    const tb = palmC.clone().addScaledVector(spread, 0.04).addScaledVector(f, 0.0);
    const td = f.clone().addScaledVector(spread, 0.8).addScaledVector(inward, 0.2).normalize();
    const t1 = tb.clone().addScaledVector(td, 0.03);
    const t2 = t1.clone().addScaledVector(td.clone().addScaledVector(f, 0.3).normalize(), 0.032);
    const th = b.chain("thumbL", catmull([tb, t1, t2]), { parent: wj, count: 2, role: "digit", group: "handL" });
    b.sweep(th, [0.0125, 0.0095], { color: SKIN, sides: 6, name: "thumbL" });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), SKIN, { at: wrist.clone().addScaledVector(f, 0.01), bone: wj, scale: [0.85, 1, 0.9], name: "wristL" });
  }

  // ---- right hand gripping the wind blade
  const swordDir = V(-0.22, -0.28, 0.93).normalize();
  {
    const pts = armPts.R;
    const wrist = V(...pts[3]);
    const f = wrist.clone().sub(V(...pts[2])).normalize();
    const wj = arms.R.tip ?? arms.R.joints[3];
    const d = swordDir;
    const H = wrist.clone().addScaledVector(f, 0.055);
    const ein = V(1, 0, 0).addScaledVector(d, -d.x).normalize();
    const eup = new THREE.Vector3().crossVectors(d, ein).normalize();
    const eout = ein.clone().negate();
    const sword = b.joint("sword", { parent: wj, at: H.toArray() as Pt, dir: d.toArray() as Pt, group: "sword" });
    // palm and knuckles
    b.part(new THREE.SphereGeometry(0.036, 8, 6), SKIN, { at: H.clone().addScaledVector(eup, 0.015).addScaledVector(ein, 0.008), bone: wj, scale: [1, 1, 1], name: "palmR" });
    b.capsule(wrist.clone().addScaledVector(f, -0.01), H.clone().addScaledVector(eup, 0.01), 0.032, { bone: wj, color: SKIN, sides: 8, name: "wristR" });
    const R0 = 0.0245;
    const gripA = [0.034, 0.011, -0.011, -0.033];
    gripA.forEach((a, i) => {
      const c = H.clone().addScaledVector(d, a);
      const from = c.clone().addScaledVector(eup, R0 * 0.8).addScaledVector(eout, R0 * 0.6);
      const path = arc(c, from, d, 215);
      const ch = b.chain(`fingerR${i + 1}`, path, { parent: wj, count: 2, role: "digit", group: "handR" });
      b.sweep(ch, [0.0105, 0.0075], { color: SKIN, sides: 6, name: `fingerR${i + 1}` });
    });
    const tc = H.clone().addScaledVector(d, 0.045);
    const tfrom = tc.clone().addScaledVector(ein, R0).addScaledVector(eup, 0.003);
    const tpath = arc(tc, tfrom, d, 95);
    const thR = b.chain("thumbR", tpath, { parent: wj, count: 2, role: "digit", group: "handR" });
    b.sweep(thR, [0.0125, 0.0095], { color: SKIN, sides: 6, name: "thumbR" });

    // ----- the blade
    const guardP = H.clone().addScaledVector(d, 0.1);
    const wdir = V(0, 1, 0).addScaledVector(d, -d.y).normalize();
    const side = new THREE.Vector3().crossVectors(d, wdir).normalize(); // thickness axis (sideways)
    const blade = b.extrude(
      [[0, -0.025], [0.5, -0.029], [0.74, -0.026], [0.87, -0.008, "sharp"], [0.9, 0.004, "sharp"], [0.72, 0.027], [0.0, 0.025]],
      { at: guardP.clone().addScaledVector(d, 0.012), x: d.toArray() as Pt, y: wdir.toArray() as Pt, thickness: [0.009, 0.006], bevel: 0.0025, color: cel("#eaf6f4", "#9cb8d8"), bone: sword, name: "blade" },
    );
    void blade;
    glow(
      b.extrude(
        [[0.03, -0.008], [0.5, -0.0075], [0.8, -0.001], [0.5, 0.0075], [0.03, 0.008]],
        { at: guardP.clone().addScaledVector(d, 0.012), x: d.toArray() as Pt, y: wdir.clone().add(side.clone().multiplyScalar(0)).toArray() as Pt, thickness: 0.0116, color: MINT_D, bone: sword, name: "bladeGlow" },
      ),
      1.2,
    );
    // gold ricasso and edge line
    b.extrude(
      [[0, -0.029], [0.06, -0.03], [0.075, -0.012], [0.075, 0.012], [0.06, 0.03], [0, 0.029]],
      { at: guardP.clone().addScaledVector(d, 0.012), x: d.toArray() as Pt, y: wdir.toArray() as Pt, thickness: 0.0125, bevel: 0.002, color: GOLD, bone: sword, name: "ricasso" },
    );
    // guard: winged
    const gOut: OutlinePoint[] = [
      [-0.125, 0.035, "sharp"], [-0.1, 0.012], [-0.06, 0.02], [-0.03, 0.03], [0.03, 0.03], [0.06, 0.02], [0.1, 0.012],
      [0.125, 0.035, "sharp"], [0.125, -0.002], [0.07, -0.016], [0, -0.012], [-0.07, -0.016], [-0.125, -0.002],
    ];
    b.extrude(gOut, { at: guardP, x: side.toArray() as Pt, y: d.toArray() as Pt, thickness: 0.02, bevel: 0.004, color: GOLD, bone: sword, name: "guard" });
    glow(b.part(new THREE.OctahedronGeometry(0.018), MINT_D, { at: guardP.clone().addScaledVector(d, 0.005), bone: sword, scale: [1, 1, 1.3], dir: d.toArray() as Pt, name: "guardGem" }), 1.2);
    // grip, pommel
    const gripEnd = H.clone().addScaledVector(d, -0.1);
    b.rod(gripEnd, guardP, 0.0165, { bone: sword, color: paint((_p, _n, s) => ((Math.floor(s[0] * 14) + Math.floor(s[1] / 40)) % 2 ? NAVY : NAVY_L)), sides: 8, name: "grip" });
    b.lathe(
      [[0, 0], [0.026, 0.002], [0.03, 0.012], [0.024, 0.026], [0.012, 0.034], [0, 0.036]],
      { at: gripEnd.clone().addScaledVector(d, -0.036), axis: d.clone().negate().toArray() as Pt, bone: sword, color: GOLD, segments: 8, name: "pommel" },
    );
    b.part(new THREE.SphereGeometry(0.016, 6, 4), TEAL, { at: gripEnd.clone().addScaledVector(d, -0.045), bone: sword, name: "pommelBead" });
    // tassel
    const P0 = gripEnd.clone().addScaledVector(d, -0.04);
    const tas = b.chain(
      "swordTassel",
      catmull([P0, [P0.x + 0.02, P0.y - 0.08, P0.z - 0.02], [P0.x + 0.03, P0.y - 0.19, P0.z - 0.03], [P0.x + 0.03, P0.y - 0.29, P0.z - 0.02]]),
      { parent: sword, count: 3, group: "sword" },
    );
    b.sweep(tas, prof([[0, 0.006], [0.45, 0.007], [0.55, 0.022], [0.75, 0.024], [1, 0.012]]), { color: paint((_p, _n, s) => (s[0] > 0.5 ? TEAL : GOLD)), sides: 6, caps: { end: "point" }, name: "tasselBody" });
    glow(b.part(new THREE.SphereGeometry(0.014, 6, 4), MINT_D, { at: tas.at(0.5).at, bone: tas.joints[1], name: "tasselBead" }), 1);
    // wind ribbons spiralling round the blade
    [0, 1].forEach((k) => {
      const c = guardP.clone().addScaledVector(d, 0.14 + k * 0.22);
      const start = c.clone().addScaledVector(eup, 0.07 - k * 0.01);
      const sp = spiral(c, start, d, { turns: 1.4 + k * 0.2, r1: 0.014, pitch: 0.2 });
      glow(b.sweep(sp, [0.008, 0.0012], { bone: sword, color: k ? MINT_D : MINT, sides: 4, caps: { end: "point" }, name: `windRibbon${k}` }), 1);
    });
    const tip = guardP.clone().addScaledVector(d, 0.92);
    glow(b.sweep(catmull([tip, [tip.x - 0.04, tip.y - 0.01, tip.z + 0.05], [tip.x - 0.07, tip.y + 0.03, tip.z + 0.09], [tip.x - 0.05, tip.y + 0.08, tip.z + 0.11]]), [0.007, 0.0012], { bone: sword, color: MINT, sides: 5, caps: { end: "point" }, name: "windTip" }), 1);
    const LEAF = svg(
      `<svg viewBox="0 0 40 80"><path d="M20 78 C2 56 4 22 20 2 C36 22 38 56 20 78Z" fill="#8ff7de" stroke="#e8fffa" stroke-width="4"/><path d="M20 74 L20 14" stroke="#2fc9b0" stroke-width="3.4" stroke-linecap="round"/></svg>`,
      { size: 128 },
    );
    const leaves = Array.from({ length: 9 }, (_, i) => {
      const a = i * 2.4;
      const off = eup.clone().multiplyScalar(Math.cos(a)).addScaledVector(side, Math.sin(a)).multiplyScalar(0.075 + 0.02 * (i % 3));
      const pos = guardP.clone().addScaledVector(d, 0.08 + i * 0.095).add(off);
      return frame(pos.toArray() as Pt, off.clone().normalize().toArray() as Pt);
    });
    glow(b.cards(leaves, LEAF, { size: [0.035, 0.065], lean: 55, bend: 20, flow: d.toArray() as Pt, bone: sword, vary: 0.2, rng: rng(5), sink: 0, cross: true, name: "windLeaves" }), 1.2);
  }

  // ================================================================ scabbard on the left hip
  {
    const M = V(0.205, 1.03, 0.085);
    const D = V(0.17, -0.72, -0.66).normalize();
    const T = M.clone().addScaledVector(D, 0.9);
    const sheath = b.joint("scabbard", { parent: hips, at: M.toArray() as Pt, dir: D.toArray() as Pt, group: "scabbard" });
    const scabbardBody = b.frustumBox(M, T, [0.062, 0.028], [0.046, 0.022], { bone: sheath, color: paint((_p, _n, s) => (Math.abs(((s[0] * 18) % 1) - 0.5) < 0.03 ? GOLD : NAVY)), name: "scabbard" });
    const sfeat = (t: number, w: number, h: number, col: typeof GOLD, nm: string) =>
      b.frustumBox(M.clone().addScaledVector(D, 0.9 * (t - 0.012)), M.clone().addScaledVector(D, 0.9 * (t + 0.012)), [w, h], [w, h], { bone: sheath, color: col, name: nm });
    sfeat(0.03, 0.07, 0.036, GOLD, "scabbardMouth");
    sfeat(0.3, 0.066, 0.032, GOLD, "scabbardBandA");
    sfeat(0.62, 0.058, 0.03, GOLD, "scabbardBandB");
    b.spike(T.clone().addScaledVector(D, -0.05), D, 0.09, 0.026, { bone: sheath, color: GOLD, name: "scabbardChape" });
    glow(b.part(new THREE.SphereGeometry(0.012, 6, 4), MINT_D, { at: M.clone().addScaledVector(D, 0.2).add(V(0.0, 0, 0.0)), bone: sheath, name: "scabbardGem" }), 1);
    b.cards([frame(M.clone().add(V(0.035, -0.02, 0.055)).toArray() as Pt, [0, 1, 0])], FEATHER, { size: [0.03, 0.11], lean: 180, flow: [0, 0, 1], bone: sheath, sink: 0, name: "scabbardTassel" });
    b.part(new THREE.SphereGeometry(0.013, 6, 4), TEAL, { at: M.clone().add(V(0.035, -0.015, 0.055)).toArray() as Pt, bone: sheath, name: "scabbardTasselBead" });
    b.decal(b.surface(scabbardBody), SWIRL_SIDE, { at: M.clone().addScaledVector(D, 0.45).add(V(0.03, 0, 0)), dir: [1, 0.15, 0.2], size: [0.04, 0.04], name: "scabbardSwirl" });
    // hanging strap
    b.sweep(catmull([[0.19, 1.07, 0.1], [0.2, 1.02, 0.1], M.toArray() as Pt]), 0.01, { bone: hips, color: LEATHER, name: "hanger" });
  }

  // ================================================================ straw hat on the back, strap, pouch, gourd
  {
    const HC = V(0.0, 1.2, -0.135);
    const axis = V(0, 0.28, -1).normalize();
    const hatPaint = paint((p, _n, _s) => {
      const rel = p.clone().sub(HC);
      const along = rel.dot(axis);
      const r = rel.clone().addScaledVector(axis, -along).length();
      if (r > 0.188) return TEAL_D;
      if (r > 0.18) return GOLD;
      const ring = Math.floor(r / 0.013);
      const ang = Math.floor((Math.atan2(rel.x, rel.y - 0.0) * 10) / Math.PI);
      return (ring + ang) % 2 ? STRAW : STRAW_D;
    });
    b.lathe(
      [[0, 0.1], [0.06, 0.088], [0.13, 0.052], [0.2, 0.0], [0.2, -0.007], [0.125, 0.043], [0.06, 0.08], [0, 0.092]],
      { at: HC.toArray() as Pt, axis: axis.toArray() as Pt, bone: chest, color: hatPaint, segments: 16, name: "strawHat" },
    );
    b.part(new THREE.SphereGeometry(0.018, 6, 4), GOLD, { at: HC.clone().addScaledVector(axis, 0.1).toArray() as Pt, bone: chest, name: "hatKnob" });
    for (const x of [-0.12, 0, 0.12]) {
      const hy = 1.01 + Math.abs(x) * 0.28;
      b.part(new THREE.SphereGeometry(0.011, 5, 4), GOLD, { at: [x, hy, -0.19], bone: chest, name: "hatBead" });
      b.cards([frame([x, hy, -0.19], [0, 1, 0])], FEATHER, { size: [0.032, 0.095], lean: 180, flow: [0, 0, 1], bone: chest, sink: 0, name: "hatTassel" });
    }
    // chin cord looping over to the chest
    b.sweep(
      skin.drape(
        catmull(
          [[-0.125, 1.405, -0.01], [-0.1, 1.33, 0.09], [-0.03, 1.25, 0.118], [0.07, 1.17, 0.11], [0.17, 1.12, 0.04], [0.14, 1.19, -0.09], [0.04, 1.3, -0.1], [-0.08, 1.4, -0.07]],
          { closed: true },
        ),
        { lift: 0.01 },
      ),
      [0.011, 0.007],
      { section: "box", color: LEATHER, name: "hatStrap" },
    );
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.01, 8), GOLD, { at: [-0.04, 1.27, 0.128], dir: [0, 0.2, 1], bone: chest, name: "strapBuckle" });
    b.decal(skin, GUST, { at: [0.06, 1.355, 0.1], dir: [0, 0, 1], size: [0.055, 0.055], name: "chestEmblem" });
    b.part(new THREE.TorusGeometry(0.03, 0.004, 4, 10), GOLD, { at: [0.06, 1.355, 0.112], dir: [0, 0, 1], axis: "z", bone: chest, name: "emblemRing" });
  }
  // pouch and gourd on the right hip
  {
    const pouch = b.part(new THREE.SphereGeometry(1, 8, 6), LEATHER, { at: [-0.215, 0.99, 0.045], scale: [0.045, 0.06, 0.04], bone: hips, name: "pouch" });
    b.part(new THREE.SphereGeometry(1, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.5), cel("#946040", "#5c3a37"), { at: [-0.215, 1.02, 0.045], scale: [0.048, 0.03, 0.043], bone: hips, name: "pouchFlap" });
    b.part(new THREE.SphereGeometry(0.01, 6, 4), GOLD, { at: [-0.215, 0.99, 0.087], bone: hips, name: "pouchClasp" });
    void pouch;
    b.sweep(catmull([[-0.19, 1.07, 0.05], [-0.21, 1.04, 0.05], [-0.215, 1.02, 0.046]]), 0.008, { bone: hips, color: LEATHER, name: "pouchStrap" });
    // gourd flask on a cord
    const gc = V(-0.15, 0.93, -0.1);
    b.lathe([[0, 0], [0.03, 0.004], [0.044, 0.028], [0.038, 0.058], [0.02, 0.07], [0.022, 0.09], [0.012, 0.105], [0, 0.107]], {
      at: gc.toArray() as Pt, bone: hips, color: paint((_p, _n, s) => (s[0] > 0.066 ? LEATHER : cel("#4fbf9c", "#2a7f9c"))), segments: 8, axis: [0, 1, 0], name: "gourd",
    });
    b.part(new THREE.CylinderGeometry(0.014, 0.016, 0.02, 6), GOLD, { at: gc.clone().add(V(0, 0.115, 0)).toArray() as Pt, bone: hips, name: "gourdCork" });
    b.sweep(catmull([[-0.1, 1.07, -0.09], [-0.14, 1.04, -0.1], gc.clone().add(V(0, 0.115, 0)).toArray() as Pt]), 0.006, { bone: hips, color: LEATHER, name: "gourdCord" });
  }

  // wind charm hanging from the belt: ring, jade bead, feather tassel
  {
    const charm = b.chain("charm", catmull([[0.09, 1.06, 0.13], [0.1, 1.0, 0.156], [0.105, 0.94, 0.166]]), { parent: hips, count: 2, group: "coat" });
    b.sweep(charm, 0.004, { color: GOLD, caps: "round", sides: 5, name: "charmCord" });
    b.part(new THREE.TorusGeometry(0.018, 0.004, 5, 10), GOLD, { at: [0.09, 1.07, 0.128], dir: [0.2, 0, 1], axis: "z", bone: hips, name: "charmRing" });
    glow(b.part(new THREE.SphereGeometry(0.02, 8, 6), MINT_D, { at: [0.1, 1.0, 0.157], bone: charm.joints[0], scale: [1, 1.1, 1], name: "charmJade" }), 1);
    b.part(new THREE.SphereGeometry(0.012, 6, 4), GOLD, { at: [0.104, 0.955, 0.165], bone: charm.joints[1], name: "charmCap" });
    b.cards([frame([0.105, 0.945, 0.166], [0, 1, 0])], FEATHER, { size: [0.028, 0.09], lean: 180, flow: [0, 0, 1], bone: charm.joints[1], sink: 0, name: "charmFeather" });
  }
  // glowing wind wisps trailing the scarf tips
  {
    const tipA = scarfA.at(1).at;
    glow(b.sweep(catmull([tipA, [tipA.x + 0.05, tipA.y + 0.03, tipA.z - 0.08], [tipA.x + 0.02, tipA.y + 0.1, tipA.z - 0.16], [tipA.x - 0.06, tipA.y + 0.12, tipA.z - 0.2]]), [0.007, 0.001], { bone: scarfA.joints[5], color: MINT, sides: 5, caps: { end: "point" }, name: "scarfWisp" }), 1);
    const tipB = scarfB.at(1).at;
    glow(b.sweep(catmull([tipB, [tipB.x - 0.04, tipB.y + 0.02, tipB.z - 0.08], [tipB.x - 0.03, tipB.y + 0.08, tipB.z - 0.15]]), [0.006, 0.001], { bone: scarfB.joints[4], color: MINT_D, sides: 5, caps: { end: "point" }, name: "scarfWispB" }), 1);
  }
  for (const sc of [scarfA, scarfB]) {
    const j = sc.joints[sc.joints.length - 1];
    const e = sc.at(1).at;
    b.cards(
      [-1, 0, 1].map((k) => frame([e.x + k * 0.03, e.y - 0.005, e.z - 0.01], [0, 1, 0])),
      FEATHER,
      { size: [0.03, 0.09], lean: 180, flow: [0, 0, 1], bone: j, sink: 0, name: "scarfFringe" },
    );
  }

  return b.root;
}
```

## Example: oldFisherman

Brief: Category: Humanoid character.
Subject: weathered fisherman with knitted cap, beard, pipe, oilskin coat, rope, rod, lantern and fish crate.
Style: low-poly.
Topology: biped
Style family: low-poly
Notable features: humanoid-rig, beard, lantern, rod, crate

```ts
// Old Fisherman: a weathered sea-dog in a yellow oilskin coat over a cable-knit sweater, flat low-poly.
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import type { Chain, Joint } from "agentic-3js-builder";
import { frame } from "agentic-3js-builder";
import { limb } from "agentic-3js-builder";
import { rng } from "agentic-3js-builder";
import { catmull, polyline } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Old Fisherman",
  description:
    "A 1.75 m weathered fisherman in a knitted cap, grey beard and pipe, yellow oilskin coat over a cable-knit sweater, rubber boots, rope coil on his shoulder, rod in one hand, lantern in the other, and a crate of fish at his feet.",
};

// ---------------------------------------------------------------- palette
const YEL = "#d3a21f";
const YEL_D = "#a27712";
const WOOL = "#d8ceb0";
const NAVY = "#3f5367";
const BOOT = "#2b3a30";
const BOOT_L = "#46604e";
const SOLE = "#8a3b2c";
const SKIN = "#c68f6a";
const NOSE = "#c7705a";
const GREY = "#b4b2aa";
const GREY_L = "#dcdbd3";
const CAP = "#2e4566";
const RUST = "#b5482e";
const WOOD = "#9a7447";
const WOOD_D = "#6e4f2e";
const ROPE = "#b89a62";
const IRON = "#2b2b2e";
const BRIAR = "#5a3520";
const CORK = "#b98a54";
const ROD = "#5b4630";
const STEEL = "#8d8f94";
const FISH_BACK = "#46707a";
const FISH_BELLY = "#c9d6da";
const ICE = "#dcecf2";
const RED = "#c2382c";
const CREAM = "#e9e0c8";

type P = THREE.Vector3;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const lerpTable = (table: ReadonlyArray<readonly number[]>, y: number) => {
  if (y <= table[0][0]) return table[0].slice(1);
  for (let i = 1; i < table.length; i++) {
    if (y <= table[i][0]) {
      const k = (y - table[i - 1][0]) / (table[i][0] - table[i - 1][0]);
      return table[i].slice(1).map((v, j) => table[i - 1][j + 1] + (v - table[i - 1][j + 1]) * k);
    }
  }
  return table[table.length - 1].slice(1);
};
const basisQuat = (x: P, y: P, z: P) =>
  new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));

// ---------------------------------------------------------------- drawings
function drawings() {
  // knitted cap: vertical ribs with V stitches, a cream and a rust stripe low on the dome
  const cap = svg(
    `<svg viewBox="0 0 96 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="96" height="48" fill="${CAP}"/>
      <g stroke="#243652" stroke-width="0.7">${Array.from({ length: 48 }, (_, i) => `<line x1="${i * 2 + 1}" y1="0" x2="${i * 2 + 1}" y2="48"/>`).join("")}</g>
      <rect y="6" width="96" height="5" fill="${CREAM}"/>
      <rect y="14" width="96" height="3" fill="${RUST}"/>
      <g stroke="#4a6a93" stroke-width="0.8" fill="none">${Array.from({ length: 6 }, (_, r) => Array.from({ length: 24 }, (_, i) => `<path d="M${i * 4} ${20 + r * 4} l2 3 l2 -3"/>`).join("")).join("")}</g>
    </svg>`,
    { size: 192 },
  );
  // folded cuff: 2x2 rib
  const cuff = svg(
    `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="16" fill="${CAP}"/>
      ${Array.from({ length: 16 }, (_, i) => `<rect x="${i * 4}" width="2" height="16" fill="#3c5a84"/>`).join("")}
      <rect y="0" width="64" height="1.2" fill="#243652"/><rect y="14.8" width="64" height="1.2" fill="#243652"/>
    </svg>`,
    { size: 128 },
  );
  // sweater rib for turtleneck and cuffs
  const wool = svg(
    `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="16" fill="${WOOL}"/>
      ${Array.from({ length: 16 }, (_, i) => `<rect x="${i * 4}" width="2" height="16" fill="#b9ae8d"/>`).join("")}
    </svg>`,
    { size: 128 },
  );
  // cable-knit panel for the open coat front (portrait)
  const cable = svg(
    `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="128" fill="${WOOL}"/>
      ${[8, 56]
        .map(
          (x) =>
            `<rect x="${x - 4}" width="8" height="128" fill="#c2b797"/><g stroke="#a89c7c" stroke-width="1.2">${Array.from({ length: 16 }, (_, r) => `<line x1="${x - 4}" y1="${r * 8 + 2}" x2="${x + 4}" y2="${r * 8 + 6}"/>`).join("")}</g>`,
        )
        .join("")}
      ${[20, 44]
        .map((x) =>
          Array.from(
            { length: 8 },
            (_, r) =>
              `<path d="M${x} ${r * 16} q-9 8 0 16 q9 8 0 16" fill="none" stroke="#a89c7c" stroke-width="3.4"/><path d="M${x} ${r * 16} q-9 8 0 16" fill="none" stroke="#efe8d2" stroke-width="1.4" transform="translate(-0.4 0)"/>`,
          ).join(""),
        )
        .join("")}
      <g>${Array.from({ length: 8 }, (_, r) => `<path d="M32 ${r * 16 + 8} l5 -4 l-5 -4 l-5 4 z" fill="#c2b797" stroke="#a89c7c" stroke-width="1.6" transform="translate(0 ${r * 16 - r * 16})"/>`).join("")}</g>
    </svg>`,
    { size: 256 },
  );
  // face: squinting eyes, crow's feet, forehead lines, ruddy cheeks (1 unit = 1 mm)
  const face = svg(
    `<svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
      <g fill="#c9705a"><ellipse cx="34" cy="78" rx="17" ry="11"/><ellipse cx="126" cy="78" rx="17" ry="11"/></g>
      <g stroke="#8c5640" stroke-width="2.2" fill="none" stroke-linecap="round">
        <path d="M40 10 q40 -6 80 0"/><path d="M36 20 q44 -7 88 0"/><path d="M46 29 q34 -5 68 0"/>
        <path d="M14 46 l-10 -5 M14 52 l-12 2 M16 58 l-10 7"/>
        <path d="M146 46 l10 -5 M146 52 l12 2 M144 58 l10 7"/>
        <path d="M40 66 q14 7 28 0 M92 66 q14 7 28 0"/>
        <path d="M70 46 q-4 18 -2 28 M90 46 q4 18 2 28"/>
      </g>
      ${[50, 110]
        .map(
          (x) => `<g><path d="M${x - 15} 50 q15 -13 30 0 q-15 9 -30 0z" fill="#f0e6d2"/>
        <circle cx="${x}" cy="49.5" r="5.2" fill="#3b2a1f"/><circle cx="${x + 1.5}" cy="47.8" r="1.5" fill="#f0e6d2"/>
        <path d="M${x - 17} 50 q17 -17 34 0" fill="none" stroke="#6b4030" stroke-width="4" stroke-linecap="round"/>
        <path d="M${x - 12} 55 q12 7 24 0" fill="none" stroke="#8c5640" stroke-width="2" stroke-linecap="round"/></g>`,
        )
        .join("")}
    </svg>`,
    { size: 640 },
  );
  // grey beard strands for cards
  const strands = svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 64 q-6 -30 -2 -60 q6 26 8 60z" fill="${GREY}"/>
      <path d="M12 64 q2 -34 10 -62 q4 30 -2 62z" fill="${GREY_L}"/>
      <path d="M20 64 q4 -24 10 -44 q0 26 -6 44z" fill="#9a9992"/>
    </svg>`,
    { size: 128 },
  );
  // pipe smoke puffs (flat grey polygons)
  const smoke = svg(
    `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
      <polygon points="26,96 18,86 20,74 30,68 40,74 40,88 34,96" fill="#d5d6d8"/>
      <polygon points="22,72 14,62 18,50 30,46 42,52 42,66 34,72" fill="#e3e4e6"/>
      <polygon points="34,52 28,42 32,30 44,26 54,32 54,44 46,52" fill="#eeeff0"/>
      <polygon points="40,28 36,20 40,10 50,6 58,12 56,22 48,28" fill="#f6f6f7"/>
    </svg>`,
    { size: 192 },
  );
  // rope twist (diagonal strands) for the coil
  const rope = svg(
    `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="16" fill="${ROPE}"/>
      ${Array.from({ length: 8 }, (_, i) => `<polygon points="${i * 8},0 ${i * 8 + 4},0 ${i * 8 + 12},16 ${i * 8 + 8},16" fill="#8a6f3f"/>`).join("")}
    </svg>`,
    { size: 128 },
  );
  // fringe of a rope end
  const fringe = svg(
    `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0 l-6 32 l4 -6 z" fill="${ROPE}"/><path d="M16 0 l0 32 l4 -10 z" fill="#8a6f3f"/><path d="M16 0 l8 28 l-12 -8 z" fill="#d1b77f"/>
    </svg>`,
    { size: 96 },
  );
  // wooden planks for crate walls
  const planks = svg(
    `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="32" fill="${WOOD}"/>
      <rect y="10" width="64" height="1.6" fill="${WOOD_D}"/><rect y="21" width="64" height="1.6" fill="${WOOD_D}"/>
      <g stroke="#83603a" stroke-width="0.8">
        <line x1="4" y1="3" x2="30" y2="3"/><line x1="20" y1="7" x2="52" y2="7"/><line x1="8" y1="15" x2="40" y2="15"/>
        <line x1="30" y1="18" x2="60" y2="18"/><line x1="2" y1="26" x2="24" y2="26"/><line x1="26" y1="29" x2="58" y2="29"/>
      </g>
      <g fill="#3b2b1a"><circle cx="3" cy="5" r="1"/><circle cx="61" cy="5" r="1"/><circle cx="3" cy="16" r="1"/><circle cx="61" cy="16" r="1"/><circle cx="3" cy="27" r="1"/><circle cx="61" cy="27" r="1"/></g>
    </svg>`,
    { size: 192 },
  );
  // stencil on crate side
  const stencil = svg(
    `<svg viewBox="0 0 128 48" xmlns="http://www.w3.org/2000/svg">
      <text x="64" y="30" font-family="Impact, Arial Black, sans-serif" font-weight="900" font-size="26" text-anchor="middle" fill="#1f2a33">HERRING</text>
      <text x="64" y="44" font-family="Arial, sans-serif" font-weight="700" font-size="11" text-anchor="middle" fill="#1f2a33">No. 7  -  LK 147</text>
      <path d="M8 6 q14 -8 28 0 l8 -4 l0 8 l-8 -4 q-14 8 -28 0z" fill="#1f2a33"/>
      <path d="M120 6 q-14 -8 -28 0 l-8 -4 l0 8 l8 -4 q14 8 28 0z" fill="#1f2a33"/>
    </svg>`,
    { size: 384 },
  );
  // hurricane lantern glass: six flame windows
  const glass = svg(
    `<svg viewBox="0 0 96 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="96" height="32" fill="#ffb347"/>
      ${Array.from({ length: 6 }, (_, i) => `<path d="M${i * 16 + 8} 4 q6 10 3 18 q-3 7 -3 7 q-6 0 -6 -8 q0 -8 6 -17z" fill="#ffe9a0"/><path d="M${i * 16 + 8} 12 q3 6 1.6 11 q-1.6 4 -1.6 4 q-3 -1 -3 -5 q0 -5 3 -10z" fill="#fff8d6"/>`).join("")}
    </svg>`,
    { size: 192 },
  );
  // coat weathering: salt streaks and stains
  const stains = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <polygon points="8,10 30,6 44,16 38,30 20,34 6,24" fill="${YEL_D}" opacity="0.85"/>
      <polygon points="60,50 82,44 94,56 88,74 70,78 56,66" fill="${YEL_D}" opacity="0.85"/>
      <polygon points="30,70 46,64 52,78 42,92 26,90" fill="#e3bd45"/>
      <polygon points="70,8 90,12 86,26 72,24" fill="#e3bd45"/>
      <g stroke="#ecd98f" stroke-width="2" stroke-linecap="round"><line x1="14" y1="44" x2="40" y2="44"/><line x1="18" y1="50" x2="52" y2="50"/><line x1="10" y1="56" x2="34" y2="56"/></g>
    </svg>`,
    { size: 256 },
  );
  // boat number on the back
  const boatNo = svg(
    `<svg viewBox="0 0 160 80" xmlns="http://www.w3.org/2000/svg">
      <text x="80" y="44" font-family="Impact, Arial Black, sans-serif" font-weight="900" font-size="44" text-anchor="middle" fill="#2a2620">LK 147</text>
      <text x="80" y="68" font-family="Arial, sans-serif" font-weight="700" font-size="17" text-anchor="middle" fill="#2a2620">SEA WOLF</text>
      <g fill="${YEL}"><rect x="20" y="14" width="18" height="2"/><rect x="92" y="28" width="22" height="2"/><rect x="44" y="52" width="16" height="2"/><rect x="120" y="36" width="14" height="2"/></g>
    </svg>`,
    { size: 384 },
  );
  // pocket with flap and stitches
  const pocket = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="60" height="58" fill="#c69319"/>
      <rect x="2" y="4" width="60" height="22" fill="#b98616"/>
      <g stroke="${YEL_D}" stroke-width="2" fill="none" stroke-dasharray="4 3"><rect x="5" y="7" width="54" height="52"/></g>
      <rect x="28" y="20" width="8" height="10" fill="${IRON}"/>
      <rect x="2" y="26" width="60" height="2" fill="${YEL_D}"/>
    </svg>`,
    { size: 192 },
  );
  // trouser knee patch
  const patch = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <polygon points="8,6 58,4 60,56 6,60" fill="#4a5664"/>
      <g stroke="#9aa6b2" stroke-width="2" fill="none" stroke-dasharray="4 3"><polygon points="12,10 54,8 56,52 10,55"/></g>
      <g stroke="#232c36" stroke-width="2"><line x1="20" y1="22" x2="44" y2="20"/><line x1="18" y1="34" x2="46" y2="33"/></g>
    </svg>`,
    { size: 128 },
  );
  // boot grime and scuffs
  const grime = svg(
    `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
      <polygon points="0,50 0,36 10,28 18,38 28,26 38,36 50,24 62,38 72,28 84,40 92,30 100,38 100,50" fill="#5a4a36"/>
      <polygon points="14,14 30,10 36,18 22,22" fill="#4c6152"/>
      <polygon points="60,8 78,6 82,14 66,16" fill="#4c6152"/>
    </svg>`,
    { size: 256 },
  );
  // mackerel stripes seen from above
  const mackerel = svg(
    `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#1f3f47" stroke-width="3" stroke-linecap="round">
        ${Array.from({ length: 9 }, (_, i) => `<path d="M${24 + i * 10} 4 q4 6 0 12 q-4 6 0 12"/>`).join("")}
      </g>
    </svg>`,
    { size: 240 },
  );
  // elbow patch / darker stitched oval
  const elbow = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <polygon points="10,10 54,8 58,50 14,56" fill="${YEL_D}"/>
      <g stroke="#e3bd45" stroke-width="2" fill="none" stroke-dasharray="4 3"><polygon points="14,14 50,12 54,46 18,51"/></g>
    </svg>`,
    { size: 128 },
  );
  // strands of kelp hanging off the crate
  const kelp = svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
      <polygon points="14,0 20,0 22,14 18,26 24,40 20,52 16,64 12,50 14,38 10,26 14,12" fill="#4d6b3a"/>
      <polygon points="20,0 24,4 26,18 22,30 26,44 22,54 20,52 24,40 18,26 22,14" fill="#6f8a4a"/>
      <polygon points="6,10 12,14 14,30 10,44 6,34 4,22" fill="#3c5530"/>
    </svg>`,
    { size: 128 },
  );
  // salt bloom on oilskin trousers
  const salt = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <polygon points="10,14 34,8 46,22 36,38 14,36" fill="#5d7489"/>
      <polygon points="58,44 82,38 92,54 80,70 60,66" fill="#5d7489"/>
      <polygon points="20,60 40,54 48,72 30,88 14,78" fill="#36485a"/>
      <polygon points="64,8 84,12 80,26 66,24" fill="#36485a"/>
    </svg>`,
    { size: 192 },
  );
  // tide line and drips on rubber boots
  const tide = svg(
    `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
      <polygon points="0,8 10,2 20,10 30,3 40,11 50,2 60,10 70,3 80,11 90,2 100,8 100,18 0,18" fill="#8fa693"/>
      <polygon points="14,18 20,18 17,34" fill="#8fa693"/><polygon points="52,18 60,18 56,38" fill="#8fa693"/><polygon points="82,18 88,18 85,30" fill="#8fa693"/>
    </svg>`,
    { size: 192 },
  );
  return {
    cap,
    cuff,
    wool,
    cable,
    face,
    strands,
    smoke,
    rope,
    fringe,
    planks,
    stencil,
    glass,
    stains,
    boatNo,
    pocket,
    patch,
    grime,
    mackerel,
    elbow,
    kelp,
    salt,
    tide,
  };
}

// ---------------------------------------------------------------- build
export default function build() {
  const b = createBuilder({ name: "oldFisherman", paintSize: 512 });
  const T = drawings();
  const rand = rng(11);

  // ---- skeleton: hips, spine, neck, head, jaw
  const hips = b.joint("hips", { at: [0, 0.93, 0], role: "spine" });
  const spine = b.chain("spine", polyline([V(0, 0.93, 0), V(0, 1.06, 0.005), V(0, 1.2, 0.01), V(0, 1.35, 0.01)]), {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  const chest = spine.joints[2];
  const neck = b.chain("neck", catmull([V(0, 1.35, 0.01), V(0, 1.425, 0.015), V(0, 1.5, 0.025)]), {
    parent: chest,
    names: ["neck1", "neck2"],
    role: "neck",
    count: 2,
  });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.5, 0.025], dir: [0, 1, 0.03], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.565, -0.005], aim: [0, 1.525, 0.1], role: "jaw" });

  // ---- legs: hip, knee, ankle (foot tip)
  const legs = {} as Record<string, { chain: Chain; pts: P[]; knee: Joint; ankle: Joint }>;
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb(V(s * 0.095, 0.9, 0), V(s * 0.105, 0.085, 0), [0.415, 0.41], [0, 0, 1]);
    const chain = b.chain(`leg${side}`, polyline(pts), {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    legs[side] = { chain, pts, knee: chain.joints[1], ankle: chain.tip ?? chain.joints[2] };
  }

  // ---- arms held out: shoulder, elbow, hand
  const arms = {} as Record<string, { chain: Chain; sh: P; el: P; wr: P; hand: Joint; f: P }>;
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh = V(s * 0.225, 1.37, 0);
    const el = sh.clone().add(
      V(s * 0.86, -0.5, 0.06)
        .normalize()
        .multiplyScalar(0.29),
    );
    const f = V(s * 0.84, -0.42, 0.34).normalize();
    const wr = el.clone().addScaledVector(f, 0.26);
    const chain = b.chain(`arm${side}`, polyline([sh, el, wr]), {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `hand${side}`],
      role: "arm",
    });
    arms[side] = { chain, sh, el, wr, hand: chain.tip ?? chain.joints[2], f };
  }

  // ---- torso: oilskin coat with the sweater showing through the open front
  const COAT = [
    [0.72, 0.24, 0.195],
    [0.85, 0.215, 0.175],
    [1.0, 0.2, 0.14],
    [1.15, 0.21, 0.145],
    [1.3, 0.225, 0.15],
    [1.38, 0.215, 0.14],
    [1.42, 0.12, 0.1],
    [1.45, 0.07, 0.06],
  ] as const;
  const coatPath = polyline([V(0, 0.72, 0), V(0, 1.06, 0.005), V(0, 1.45, 0.012)]);
  const coat = b.sweep(
    coatPath,
    (t) => {
      const [rx, ry] = lerpTable(COAT, 0.72 + t * 0.73);
      return [rx, ry] as const;
    },
    {
      bone: spine,
      sides: 8,
      smooth: false,
      caps: { start: "flat", end: "flat" },
      color: YEL,
      sectors: [[158, 202, WOOL, 0.3, 0.98]],
    },
  );

  // ================================================================ head
  const skull = b.part(new THREE.SphereGeometry(1, 9, 6), SKIN, {
    bone: head,
    at: [0, 1.595, 0],
    scale: [0.088, 0.1, 0.098],
    flat: true,
  });
  b.part(new THREE.BoxGeometry(0.13, 0.07, 0.12), SKIN, { bone: jaw, at: [0, 1.51, 0.045], flat: true });
  b.decal(skull, T.face, { at: [0, 1.6, 0.1], dir: [0, 0, 1], size: [0.16, 0.1], segments: [16, 10], bone: head });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 5, 4), SKIN, {
      bone: head,
      at: [s * 0.088, 1.59, -0.005],
      scale: [0.012, 0.03, 0.022],
      flat: true,
    });
    b.part(new THREE.BoxGeometry(0.052, 0.015, 0.022), GREY, {
      bone: head,
      at: [s * 0.038, 1.628, 0.09],
      rotation: [-8, 0, -12 * s],
      flat: true,
    });
  }
  b.part(new THREE.SphereGeometry(1, 6, 4), NOSE, {
    bone: head,
    at: [0, 1.578, 0.106],
    scale: [0.024, 0.032, 0.03],
    flat: true,
  });
  b.part(new THREE.SphereGeometry(1, 5, 4), SKIN, {
    bone: head,
    at: [0, 1.603, 0.094],
    scale: [0.014, 0.028, 0.02],
    flat: true,
  });

  // knitted cap with folded cuff and pom
  b.part(new THREE.SphereGeometry(1, 12, 7, 0, Math.PI * 2, 0, Math.PI * 0.56), CAP, {
    bone: head,
    at: [0, 1.665, -0.008],
    scale: [0.108, 0.072, 0.112],
    texture: T.cap,
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(1, 1, 1, 12), CAP, {
    bone: head,
    at: [0, 1.668, -0.006],
    scale: [0.112, 0.05, 0.118],
    texture: T.cuff,
    flat: true,
  });
  b.part(new THREE.IcosahedronGeometry(0.026, 0), RUST, { bone: head, at: [0, 1.725, -0.012], flat: true });

  // grey hair under the cap
  const hairHits = b
    .surface(skull)
    .scatter(18, { rng: rand, minDist: 0.03, filter: (h) => h.at.y < 1.64 && h.at.y > 1.52 && h.n.z < 0.35 });
  b.cards(hairHits, T.strands, {
    size: [0.028, 0.05],
    lean: 60,
    flow: [0, -1, -0.2],
    vary: 0.25,
    rng: rand,
    bone: head,
  });
  const hair = b.part(new THREE.SphereGeometry(1, 8, 5), GREY, {
    bone: head,
    at: [0, 1.585, -0.022],
    scale: [0.093, 0.075, 0.092],
    flat: true,
  });
  const locks = b
    .surface(hair)
    .scatter(24, { rng: rand, minDist: 0.03, filter: (h) => h.n.z < 0.1 && h.at.y < 1.6 && h.at.y > 1.53 });
  b.cards(locks, T.strands, {
    size: [0.045, 0.085],
    lean: 20,
    bend: 10,
    flow: [0, -1, -0.1],
    vary: 0.25,
    rng: rand,
    bone: head,
  });

  // beard: a bib on the jaw, whiskers on the cheeks, a drooping moustache
  const bib = b.loft(
    [
      { at: [0, 1.535, 0.07], w: 0.17, h: 0.07 },
      { at: [0, 1.49, 0.096], w: 0.17, h: 0.1 },
      { at: [0, 1.44, 0.108], w: 0.12, h: 0.1 },
      { at: [0, 1.385, 0.1], w: 0.045, h: 0.05 },
    ],
    { bone: jaw, color: GREY, sides: 6, smooth: false, caps: { start: "flat", end: "point" } },
  );
  for (const s of [1, -1]) {
    b.sweep(
      catmull([V(s * 0.085, 1.572, 0.01), V(s * 0.08, 1.545, 0.04), V(s * 0.065, 1.515, 0.075)]),
      [0.019, 0.017],
      {
        bone: head,
        color: GREY,
        sides: 6,
        smooth: false,
      },
    );
    b.sweep(
      catmull([V(s * 0.004, 1.543, 0.108), V(s * 0.036, 1.538, 0.112), V(s * 0.066, 1.512, 0.098)]),
      [0.018, 0.01],
      {
        bone: head,
        color: GREY_L,
        sides: 5,
        smooth: false,
      },
    );
  }
  const beardHits = b
    .surface(bib)
    .scatter(26, { rng: rand, minDist: 0.035, filter: (h) => h.n.z > -0.2 && h.at.y < 1.5 });
  b.cards(beardHits, T.strands, {
    size: [0.04, 0.05],
    lean: 60,
    bend: 10,
    flow: [0, -1, 0.3],
    vary: 0.3,
    rng: rand,
    bone: jaw,
  });

  // pipe
  const pipeStem = [V(0.032, 1.536, 0.112), V(0.05, 1.528, 0.16), V(0.058, 1.52, 0.2)];
  b.sweep(catmull(pipeStem), 0.0055, { bone: jaw, color: IRON, sides: 4, smooth: false, detail: 0.6 });
  b.lathe(
    [
      [0, 0],
      [0.013, 0],
      [0.02, 0.01],
      [0.023, 0.03],
      [0.021, 0.044],
      [0.015, 0.042],
      [0, 0.046],
    ],
    { at: [0.06, 1.51, 0.212], segments: 6, bone: jaw, color: BRIAR },
  );
  glow(
    b.part(new THREE.CylinderGeometry(0.013, 0.013, 0.004, 8), "#ff8a3c", {
      bone: jaw,
      at: [0.06, 1.549, 0.212],
      flat: true,
    }),
    1.4,
  );
  const smokeFrames = [0, 1].map((i) => frame([0.06 + i * 0.012, 1.56 + i * 0.075, 0.212 + i * 0.012], [0, 1, 0]));
  b.cards(smokeFrames, T.smoke, { size: [0.07, 0.1], flow: [0, 0, 1], cross: true, rng: rand, bone: jaw });

  // ================================================================ legs and boots
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const { chain, pts, knee, ankle } = legs[side];
    const pants = b.sweep(chain, [0.098, 0.092, 0.09], {
      color: NAVY,
      sides: 6,
      smooth: false,
      from: 0.15,
      to: 0.6,
      caps: { start: "flat", end: "none" },
    });
    const shinAt = (y: number) => pts[1].clone().lerp(pts[2], (pts[1].y - y) / (pts[1].y - pts[2].y));
    const shaft = b.sweep(polyline([shinAt(0.4), shinAt(0.1)]), [0.088, 0.072], {
      bone: knee,
      color: BOOT,
      sides: 6,
      smooth: false,
      caps: { start: "flat", end: "flat" },
    });
    b.part(new THREE.CylinderGeometry(0.098, 0.092, 0.04, 6), BOOT_L, { bone: knee, at: shinAt(0.395), flat: true });
    const x0 = s * 0.105;
    b.extrude(
      [
        [-0.095, 0],
        [0.31, 0],
        [0.318, 0.028],
        [-0.095, 0.03],
      ],
      { x: [0, 0, 1], at: [x0, 0, 0], thickness: 0.136, bevel: 0.004, bone: ankle, color: SOLE },
    );
    const foot = b.extrude(
      [
        [-0.08, 0.03],
        [0.28, 0.03],
        [0.305, 0.05],
        [0.305, 0.085],
        [0.2, 0.118],
        [0.07, 0.175],
        [-0.07, 0.175],
        [-0.087, 0.09],
      ],
      { x: [0, 0, 1], at: [x0, 0, 0], thickness: 0.13, bevel: 0.012, bone: ankle, color: BOOT },
    );
    b.decal(foot, T.grime, {
      at: [x0 + s * 0.2, 0.07, 0.11],
      dir: [s, 0, 0],
      size: [0.3, 0.12],
      segments: [12, 5],
      bone: ankle,
    });
    b.decal(shaft, T.grime, {
      at: [shinAt(0.2).x + s * 0.2, 0.2, shinAt(0.2).z],
      dir: [s, 0, 0],
      size: [0.18, 0.12],
      segments: [8, 5],
      bone: knee,
    });
    for (const dz of [0.2, -0.2]) {
      b.decal(pants, T.salt, {
        at: [pts[0].x, 0.62, dz],
        dir: [0, 0, -(-Math.sign(dz))],
        size: [0.16, 0.16],
        segments: 6,
        mirror: dz < 0,
      });
      b.decal(shaft, T.tide, {
        at: [shinAt(0.3).x, 0.3, dz],
        dir: [0, 0, -(-Math.sign(dz))],
        size: [0.17, 0.07],
        segments: [8, 3],
        mirror: dz < 0,
        bone: knee,
      });
    }
    b.decal(pants, T.patch, {
      at: [pts[1].x, pts[1].y + 0.02, pts[1].z + 0.12],
      dir: [0, 0, 1],
      size: [0.1, 0.1],
      segments: 6,
    });
  }

  // ================================================================ arms, sleeves and fists
  // A fist closes around a grip of radius `bar` centred at `c`; fingers wrap in the plane square to the grip.
  const fist = (hand: Joint, f: P, g0: P, bar: number, palmSide: 1 | -1, tag: string) => {
    const g = g0.clone().addScaledVector(f, -g0.dot(f)).normalize();
    const n = new THREE.Vector3().crossVectors(g, f).normalize();
    if (n.y * palmSide < 0) n.negate();
    const a = new THREE.Vector3().crossVectors(n, f).normalize();
    const palmT = 0.04;
    const c = hand.at.addScaledVector(f, 0.108).addScaledVector(n, -(bar + palmT / 2));
    const palmAt = c
      .clone()
      .addScaledVector(n, bar + palmT / 2)
      .addScaledVector(f, -0.054);
    b.part(new THREE.BoxGeometry(0.104, palmT, 0.108), SKIN, {
      bone: hand,
      at: palmAt,
      quat: basisQuat(a, n, f),
      flat: true,
    });
    const wrap = (off: number, radius: number, from: number, to: number) =>
      Array.from({ length: 5 }, (_, k) => {
        const phi = ((from + ((to - from) * k) / 4) * Math.PI) / 180;
        return c
          .clone()
          .addScaledVector(a, off)
          .addScaledVector(f, radius * Math.cos(phi))
          .addScaledVector(n, radius * Math.sin(phi));
      });
    const names = ["pinky", "ring", "middle", "index"];
    [-0.0378, -0.0126, 0.0126, 0.0378].forEach((off, i) => {
      const chain = b.chain(`${names[i]}${tag}`, catmull(wrap(off, bar + 0.015, 90, -140)), {
        parent: hand,
        count: 3,
        role: "digit",
        names: (k) => `${names[i]}${tag}${k + 1}`,
      });
      b.sweep(chain, [0.013, 0.0105], { color: SKIN, sides: 4, smooth: false, detail: 0.35 });
    });
    const thumb = b.chain(`thumb${tag}`, catmull(wrap(0.066, bar + 0.02, 112, 8)), {
      parent: hand,
      count: 2,
      role: "digit",
      names: (k) => `thumb${tag}${k + 1}`,
    });
    b.sweep(thumb, [0.015, 0.0108], { color: SKIN, sides: 4, smooth: false, detail: 0.35 });
    return { c, g, n, a };
  };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const { chain, sh, el, wr, f } = arms[side];
    const sleeve = b.sweep(chain, [0.092, 0.082, 0.072, 0.066], {
      color: YEL,
      sides: 6,
      smooth: false,
      caps: { start: "round", end: "flat" },
    });
    b.part(new THREE.SphereGeometry(0.098, 7, 5), YEL, { bone: chain.joints[0], at: sh, flat: true });
    b.part(new THREE.CylinderGeometry(0.057, 0.054, 0.06, 8), WOOL, {
      bone: chain.joints[1],
      at: wr.clone().addScaledVector(f, -0.012),
      dir: f,
      texture: T.wool,
      flat: true,
    });
    b.decal(sleeve, T.elbow, { at: el.clone().add(V(0, 0, -0.1)), dir: [0, 0, -1], size: [0.1, 0.1], segments: 6 });
    b.decal(sleeve, T.stains, {
      at: sh
        .clone()
        .lerp(el, 0.55)
        .add(V(0, 0.12, 0)),
      dir: [0, 1, 0],
      up: [0, 0, 1],
      size: [0.12, 0.16],
      segments: [6, 8],
    });
  }
  const fR = fist(arms.R.hand, arms.R.f, V(-0.15, 0.12, 0.9), 0.0195, -1, "R");
  const fL = fist(arms.L.hand, arms.L.f, V(0, 0, 1), 0.008, 1, "L");

  // ---- fishing rod
  {
    const { c, g, n, a } = fR;
    const hand = arms.R.hand;
    const butt = c.clone().addScaledVector(g, -0.2);
    const tip = c
      .clone()
      .addScaledVector(g, 1.35)
      .add(V(0, -0.08, 0));
    const rodPath = catmull([
      butt,
      c.clone().addScaledVector(g, 0.3),
      c
        .clone()
        .addScaledVector(g, 0.85)
        .add(V(0, -0.02, 0)),
      tip,
    ]);
    b.sweep(rodPath, [0.0125, 0.0035], {
      bone: hand,
      color: ROD,
      sides: 5,
      smooth: false,
      caps: { start: "flat", end: "round" },
    });
    b.sweep(polyline([butt, c.clone().addScaledVector(g, 0.17)]), 0.0205, {
      bone: hand,
      color: CORK,
      sides: 6,
      smooth: false,
    });
    b.part(new THREE.SphereGeometry(0.023, 6, 4), IRON, { bone: hand, at: butt, flat: true });
    const reelAt = c.clone().addScaledVector(g, 0.2).addScaledVector(n, 0.05);
    b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.028, 8), STEEL, { bone: hand, at: reelAt, dir: a, flat: true });
    b.rod(reelAt, c.clone().addScaledVector(g, 0.2), 0.008, { bone: hand, color: IRON, sides: 4, smooth: false });
    b.rod(
      reelAt.clone().addScaledVector(a, 0.015),
      reelAt.clone().addScaledVector(a, 0.045).addScaledVector(n, 0.03),
      0.004,
      {
        bone: hand,
        color: IRON,
        sides: 4,
        smooth: false,
      },
    );
    for (const t of [0.24, 0.42, 0.6, 0.78, 0.94]) {
      b.part(new THREE.TorusGeometry(0.011, 0.0018, 3, 5), IRON, {
        bone: hand,
        at: rodPath.at(t).addScaledVector(n, 0.012),
        dir: rodPath.tangentAt(t),
        axis: "z",
        flat: true,
      });
    }
    // line, bobber and hook
    const linePath = catmull([
      tip,
      tip.clone().add(V(0, -0.22, 0.05)),
      tip.clone().add(V(0.01, -0.5, 0.09)),
      tip.clone().add(V(0, -0.8, 0.1)),
    ]);
    b.sweep(linePath, 0.0028, {
      bone: hand,
      color: CREAM,
      sides: 4,
      smooth: false,
      detail: 0.35,
      caps: { start: "none", end: "round" },
    });
    const bob = linePath.at(0.55);
    b.part(new THREE.SphereGeometry(0.02, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2), RED, {
      bone: hand,
      at: bob,
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.02, 6, 3, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), CREAM, {
      bone: hand,
      at: bob,
      flat: true,
    });
    const end = linePath.at(1);
    b.sweep(
      catmull([
        end,
        end.clone().add(V(0, -0.03, 0.0)),
        end.clone().add(V(0, -0.05, 0.02)),
        end.clone().add(V(0, -0.03, 0.035)),
      ]),
      0.0025,
      {
        bone: hand,
        color: STEEL,
        sides: 4,
        smooth: false,
        detail: 0.35,
      },
    );
  }

  // ---- hurricane lantern
  {
    const { c, g } = fL;
    const hand = arms.L.hand;
    const top = c.y - 0.095;
    const x = c.x;
    const z = c.z;
    const wire = [
      V(x, top + 0.018, z).addScaledVector(g, -0.012),
      c.clone().addScaledVector(g, -0.05),
      c.clone().addScaledVector(g, 0.05),
      V(x, top + 0.018, z).addScaledVector(g, 0.012),
    ];
    b.sweep(polyline(wire), 0.0045, { bone: hand, color: IRON, sides: 4, smooth: false });
    b.part(new THREE.ConeGeometry(0.052, 0.045, 6), IRON, { bone: hand, at: [x, top - 0.0225, z], flat: true });
    b.part(new THREE.CylinderGeometry(0.012, 0.016, 0.022, 6), IRON, {
      bone: hand,
      at: [x, top + 0.008, z],
      flat: true,
    });
    glow(
      b.part(new THREE.CylinderGeometry(0.046, 0.046, 0.13, 6), "#ffffff", {
        bone: hand,
        at: [x, top - 0.11, z],
        texture: T.glass,
        flat: true,
      }),
      1.2,
    );
    b.part(new THREE.CylinderGeometry(0.05, 0.043, 0.04, 6), IRON, { bone: hand, at: [x, top - 0.195, z], flat: true });
    for (let i = 0; i < 6; i++) {
      const th = (i * Math.PI) / 3;
      const cx = x + 0.047 * Math.sin(th);
      const cz = z + 0.047 * Math.cos(th);
      b.rod([cx, top - 0.05, cz], [cx, top - 0.178, cz], 0.0028, { bone: hand, color: IRON, sides: 4, smooth: false });
    }
  }

  // ================================================================ coat details
  b.part(new THREE.CylinderGeometry(1, 1, 1, 8), WOOL, {
    bone: neck.joints[0],
    at: [0, 1.475, 0.02],
    scale: [0.07, 0.09, 0.07],
    texture: T.wool,
    flat: true,
  });
  b.lathe(
    [
      [0.074, 0],
      [0.102, 0],
      [0.12, 0.06],
      [0.108, 0.066],
      [0.084, 0.04],
    ],
    { at: [0, 1.425, 0.012], segments: 8, bone: neck.joints[0], color: YEL },
  );
  b.decal(coat, T.cable, { at: [0, 1.18, 0.17], dir: [0, 0, 1], size: [0.125, 0.46], segments: [5, 14] });
  for (const angle of [158, 202]) {
    b.sweep(coat.line(angle, 0.004).slice(0.3, 0.98), 0.006, { bone: spine, color: YEL_D, sides: 4, smooth: false });
  }
  for (const t of [0.5, 0.63, 0.76]) {
    b.stick(new THREE.BoxGeometry(0.014, 0.014, 0.055), BRIAR, coat.at(t, 158), {
      spin: 90,
      bone: spine.joints[1],
      flat: true,
    });
  }
  for (const s of [1, -1]) {
    b.decal(coat, T.pocket, { at: [s * 0.115, 0.86, 0.17], dir: [0, 0, 1], size: [0.11, 0.11], segments: 6 });
  }
  b.decal(coat, T.stains, { at: [0.13, 0.85, 0.17], dir: [0, 0, 1], size: [0.15, 0.15], segments: 7 });
  b.decal(coat, T.stains, { at: [-0.12, 1.1, -0.16], dir: [0, 0, -1], size: [0.16, 0.16], segments: 7, mirror: true });
  b.decal(coat, T.boatNo, { at: [0, 1.2, -0.16], dir: [0, 0, -1], size: [0.2, 0.1], segments: [10, 5] });
  b.sweep(b.surface(coat).loop(V(0, 0.76, 0), { lift: 0.004 }), 0.007, { color: YEL_D, sides: 4, smooth: false });
  b.sweep(b.surface(coat).loop(V(0, 1.3, 0), { lift: 0.003 }), 0.006, { color: YEL_D, sides: 4, smooth: false });
  b.sweep(coat.line(0, 0.003).slice(0.08, 0.9), 0.006, { bone: spine, color: YEL_D, sides: 4, smooth: false });

  // ---- rope coil on the right shoulder, with a tail down the chest
  {
    const cR = V(-0.17, 1.44, 0.005);
    const ax = V(-0.45, 0.88, 0.1).normalize();
    for (let k = 0; k < 4; k++) {
      b.part(new THREE.TorusGeometry(0.105, 0.02, 5, 12), ROPE, {
        bone: chest,
        at: cR.clone().addScaledVector(ax, k * 0.036),
        dir: ax,
        axis: "z",
        texture: T.rope,
        flat: true,
      });
    }
    const tailPath = b
      .surface(coat)
      .drape(catmull([V(-0.15, 1.47, 0.09), V(-0.16, 1.38, 0.15), V(-0.17, 1.25, 0.17), V(-0.16, 1.12, 0.17)]), {
        lift: 0.012,
      });
    b.sweep(tailPath, 0.016, {
      bone: chest,
      color: ROPE,
      sides: 5,
      smooth: false,
      caps: { start: "round", end: "flat" },
    });
    const endAt = tailPath.at(1);
    b.cards(
      [0, 1, 2].map((i) => frame([endAt.x + (i - 1) * 0.012, endAt.y, endAt.z + 0.004], [0, 1, 0])),
      T.fringe,
      { size: [0.04, 0.06], lean: 180, flow: [0, 0, 1], bone: chest },
    );
  }

  // ================================================================ crate of fish at his feet
  {
    const yaw = 14;
    const C = V(0.43, 0, 0.17);
    const toW = (lx: number, ly: number, lz: number) =>
      V(lx, ly, lz)
        .applyAxisAngle(V(0, 1, 0), (yaw * Math.PI) / 180)
        .add(C);
    const box = (
      sx: number,
      sy: number,
      sz: number,
      lx: number,
      ly: number,
      lz: number,
      color: string,
      texture?: THREE.Texture,
    ) =>
      b.part(new THREE.BoxGeometry(sx, sy, sz), color, {
        bone: hips,
        at: toW(lx, ly, lz),
        rotation: [0, yaw, 0],
        texture,
        flat: true,
      });
    box(0.4, 0.02, 0.28, 0, 0.01, 0, WOOD_D);
    for (const z of [-1, 1]) {
      box(0.42, 0.17, 0.018, 0, 0.105, z * 0.141, WOOD, T.planks);
    }
    for (const x of [-1, 1]) {
      box(0.018, 0.17, 0.264, x * 0.201, 0.105, 0, WOOD, T.planks);
    }
    for (const x of [-1, 1]) {
      for (const z of [-1, 1]) {
        box(0.032, 0.2, 0.032, x * 0.202, 0.1, z * 0.142, WOOD_D);
      }
    }
    box(0.385, 0.03, 0.265, 0, 0.165, 0, ICE);
    b.cards(
      [toW(0.205, 0.2, 0.07), toW(0.205, 0.2, -0.06), toW(-0.17, 0.2, 0.152), toW(0.12, 0.2, 0.152)].map((p) =>
        frame(p, [0, 1, 0]),
      ),
      T.kelp,
      { size: [0.06, 0.13], lean: 180, flow: [0.4, 0, 1], cross: true, vary: 0.2, rng: rand, bone: hips },
    );
    const iceRand = rng(5);
    for (let i = 0; i < 11; i++) {
      const r = 0.018 + iceRand() * 0.016;
      b.part(new THREE.IcosahedronGeometry(r, 0), ICE, {
        bone: hips,
        at: toW((iceRand() - 0.5) * 0.36, 0.185 + iceRand() * 0.01, (iceRand() - 0.5) * 0.24),
        rotation: [iceRand() * 180, iceRand() * 180, 0],
        flat: true,
      });
    }
    b.part(new THREE.PlaneGeometry(0.26, 0.097), "#ffffff", {
      bone: hips,
      at: toW(0, 0.105, 0.1515),
      dir: V(0, 0, 1).applyAxisAngle(V(0, 1, 0), (yaw * Math.PI) / 180),
      axis: "z",
      texture: T.stencil,
    });
    const fishSpecs = [
      { x: -0.05, z: -0.07, phi: 8, y: 0.212 },
      { x: 0.03, z: 0.02, phi: -12, y: 0.214 },
      { x: -0.08, z: 0.09, phi: 4, y: 0.212 },
      { x: 0.09, z: -0.08, phi: 170, y: 0.23 },
      { x: -0.02, z: 0.0, phi: 192, y: 0.235 },
      { x: 0.05, z: 0.1, phi: 184, y: 0.232 },
      { x: 0.0, z: -0.02, phi: 96, y: 0.252 },
    ];
    const fishTable = [
      [0, 0.008, 0.005],
      [0.1, 0.026, 0.014],
      [0.35, 0.038, 0.021],
      [0.65, 0.03, 0.017],
      [0.9, 0.013, 0.008],
      [1, 0.009, 0.006],
    ] as const;
    const Y = V(0, 1, 0);
    for (const fs of fishSpecs) {
      const ph = (fs.phi * Math.PI) / 180;
      const d = V(Math.cos(ph), 0, Math.sin(ph)).applyAxisAngle(Y, (yaw * Math.PI) / 180);
      const centre = toW(fs.x, fs.y, fs.z);
      const head = centre.clone().addScaledVector(d, 0.15);
      const tail = centre.clone().addScaledVector(d, -0.14);
      const lat = new THREE.Vector3().crossVectors(d.clone().negate(), Y).normalize();
      const body = b.sweep(
        polyline([head, tail]),
        (t) => {
          const [rx, ry] = lerpTable(fishTable, t);
          return [rx, ry] as const;
        },
        {
          bone: hips,
          color: FISH_BELLY,
          sectors: [[55, 125, FISH_BACK]],
          sides: 6,
          smooth: false,
          caps: { start: "round", end: "flat" },
        },
      );
      b.extrude(
        [
          [0, 0],
          [0.05, 0.035],
          [0.038, 0],
          [0.05, -0.035],
        ],
        { at: tail, x: d.clone().negate(), y: lat, thickness: 0.004, bone: hips, color: FISH_BACK },
      );
      b.part(new THREE.SphereGeometry(0.0075, 5, 4), IRON, {
        bone: hips,
        at: head
          .clone()
          .addScaledVector(d, -0.04)
          .addScaledVector(lat, 0.01)
          .add(V(0, 0.013, 0)),
        flat: true,
      });
      b.decal(body, T.mackerel, {
        at: centre.clone().add(V(0, 0.04, 0)),
        dir: [0, 1, 0],
        up: lat,
        size: [0.25, 0.07],
        segments: [14, 5],
        bone: hips,
      });
    }
  }

  return b.root;
}
```

## Example: wildBoarSonnet

Brief: Category: Animal.
Subject: battle-scarred wild boar with a wedge head, tusks, bristling mane and cloven hooves.
Style: Blizzard/Warcraft.
Topology: quadruped
Style family: blizzard-warcraft
Notable features: jaw, tusks, mane, hooves, painted-fur

```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";
import type { Sweep, SweepPoint } from "agentic-3js-builder";
import { frame } from "agentic-3js-builder";
import { rng } from "agentic-3js-builder";
import { bezier, catmull } from "agentic-3js-builder";
import { limb } from "agentic-3js-builder";
import { grain, mix, noise, paint, resolve, smoothstep } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Wild Boar",
  description:
    "A battle-scarred wild boar built in a hand-painted Warcraft style: a hunched, heavy-shouldered body, a huge wedge head with a snapped and a bronze-banded tusk, a ridge of bristling mane spikes, dry-brushed fur and cloven hooves.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette (hand-painted: warm lights, cool-purple shadows, saturated mid-tones)
const FUR_DEEP = "#22140f";
const FUR_DARK = "#3a2218";
const FUR_MID = "#5e3a26";
const FUR_LIGHT = "#a06836";
const FUR_TIP = "#d29a4c";
const BELLY = "#a2814f";
const BELLY_D = "#6e5233";
const MUD = "#5a4733";
const MUZZLE = "#93805f";
const SNOUT = "#9c6f68";
const SNOUT_D = "#6d4743";
const NOSTRIL = "#241114";
const HORN = "#2a201c";
const HORN_HI = "#5f4b3c";
const IVORY = "#efe0b4";
const BRONZE = "#b8742f";
const BRONZE_D = "#6e401a";
const EYE = "#f3a51c";
const BLACK = "#0f0807";
const WHITE = "#fff7e6";
const TEETH = "#ece0bf";
const TONGUE = "#c85a6c";
const MOUTH = "#5a1a24";
const EAR_IN = "#a8705a";
const EAR_IN_D = "#7a4a3c";
const SCAR = "#e2c496";

// ---------------------------------------------------------------------------------------------------------------
// Paints

const backFur = grain(FUR_MID, FUR_LIGHT, { size: 0.024, axis: "z", seed: 2 });
const flankFur = grain(FUR_DARK, "#744a2c", { size: 0.022, axis: "z", seed: 5 });
const bellyFur = grain(BELLY_D, BELLY, { size: 0.022, axis: "z", seed: 8 });

const coat = paint((p, n) => {
  const a = resolve(backFur, p, n);
  const f = resolve(flankFur, p, n);
  const bl = resolve(bellyFur, p, n);
  let c = mix(f, a, smoothstep(-0.2, 0.8, n.y));
  c = mix(c, bl, smoothstep(-0.3, -0.85, n.y) * 0.95);
  // dry-brushed highlights on the upward facing fur, dark blotches in the shade
  const dry = smoothstep(0.55, 0.8, noise(p, 0.11, 11)) * smoothstep(0.1, 0.9, n.y);
  c = mix(c, FUR_TIP, dry * 0.4);
  c = mix(c, FUR_DEEP, smoothstep(0.55, 0.8, noise(p, 0.28, 4)) * 0.4);
  c = mix(c, FUR_DEEP, smoothstep(0.12, 0.0, Math.abs(p.x)) * smoothstep(0.4, 0.9, n.y) * 0.55);
  // dark stockings on the lower legs, mud splashed on belly and legs
  c = mix(c, FUR_DEEP, smoothstep(0.3, 0.1, p.y));
  const mud = smoothstep(0.44, 0.12, p.y) * smoothstep(0.4, 0.68, noise(p, 0.07, 21));
  c = mix(c, MUD, mud * 0.75);
  // pale grizzled muzzle, dark palate under the upper jaw
  if (p.z > 1.0) {
    c = mix(c, MUZZLE, smoothstep(1.1, 1.32, p.z) * 0.6);
    if (n.y < -0.5 && p.y > 0.28) c = mix(c, MOUTH, smoothstep(-0.5, -0.8, n.y));
  }
  return c;
});

const tuftTint = paint((p, n) => mix(resolve(coat, p, n), FUR_TIP, 0.5));

const jawPaint = paint((p, n) => {
  if (n.y > 0.55) return MOUTH;
  return mix(resolve(coat, p, n), MUZZLE, 0.55);
});

const spikePaint = paint((_p, _n, s) => {
  const lo = mix(FUR_DEEP, "#7c4a22", smoothstep(0.05, 0.6, s[0]));
  return mix(lo, FUR_TIP, smoothstep(0.65, 1.0, s[0]));
});

const tuskPaint = paint((_p, _n, s) => {
  const t = s[0];
  let c = mix("#6f4f2a", IVORY, smoothstep(0.04, 0.4, t));
  c = mix(c, "#fff8e2", smoothstep(0.55, 1.0, t));
  if (Math.sin(t * 64) > 0.9) c = mix(c, "#9a7a48", 0.5);
  return c;
});

const brokenTuskPaint = paint((_p, _n, s) => {
  const t = s[0];
  let c = mix("#6f4f2a", IVORY, smoothstep(0.04, 0.35, t));
  if (Math.sin(t * 64) > 0.9) c = mix(c, "#9a7a48", 0.5);
  c = mix(c, "#7c5d34", smoothstep(0.85, 1, t));
  return c;
});

const hoofPaint = paint((_p, _n, s) => mix(HORN_HI, HORN, smoothstep(0.0, 0.07, s[1])));

const noseTop = paint((p, n) => mix(mix(SNOUT, SNOUT_D, smoothstep(0.3, -0.7, n.y)), "#c8978a", smoothstep(0.55, 0.9, noise(p, 0.03, 3)) * 0.5));

// ---------------------------------------------------------------------------------------------------------------
// Drawings

const TUFT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#a8a8a8"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
  <polygon points="3,64 8,64 5,4" fill="url(#g)"/>
  <polygon points="10,64 17,64 16,0" fill="url(#g)"/>
  <polygon points="17,64 24,64 21,8" fill="url(#g)"/>
  <polygon points="24,64 30,64 29,14" fill="url(#g)"/>
</svg>`,
  { size: 128 },
);

const MANE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 80">
  <defs><linearGradient id="m" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#22140f"/><stop offset="0.5" stop-color="#7c4a22"/><stop offset="1" stop-color="#e2b872"/></linearGradient></defs>
  <polygon points="2,80 14,80 6,12" fill="url(#m)"/>
  <polygon points="10,80 28,80 20,0" fill="url(#m)"/>
  <polygon points="24,80 38,80 35,16" fill="url(#m)"/>
</svg>`,
  { size: 192 },
);

const SCARS = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
  <g stroke-linecap="round" fill="none">
    <path d="M8,10 L40,50" stroke="${SCAR}" stroke-width="4.5"/><path d="M8,10 L40,50" stroke="#a8745a" stroke-width="1.4"/>
    <path d="M20,6 L50,42" stroke="${SCAR}" stroke-width="4"/><path d="M20,6 L50,42" stroke="#a8745a" stroke-width="1.3"/>
    <path d="M32,4 L56,32" stroke="${SCAR}" stroke-width="3.4"/><path d="M32,4 L56,32" stroke="#a8745a" stroke-width="1.2"/>
  </g>
</svg>`,
  { size: 256 },
);

const SCARS_R = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
  <g stroke-linecap="round" fill="none">
    <path d="M6,34 L50,6" stroke="${SCAR}" stroke-width="4.5"/><path d="M6,34 L50,6" stroke="#a8745a" stroke-width="1.4"/>
    <path d="M14,38 L56,18" stroke="${SCAR}" stroke-width="3.6"/><path d="M14,38 L56,18" stroke="#a8745a" stroke-width="1.2"/>
  </g>
</svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "wildBoar", paintSize: 1024 });
  const r = rng(7);

  // --- skeleton ------------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.58, -0.35], dir: [0, 0.05, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.63, 0.0],
      [0, 0.74, 0.32],
      [0, 0.66, 0.58],
    ]),
    { parent: hips, names: ["spine1", "chest"], role: "spine" },
  );
  const chest = spine.joints[1];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.66, 0.58],
      [0, 0.59, 0.77],
      [0, 0.53, 0.92],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.53, 0.92], dir: [0, -0.25, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.42, 0.97], aim: [0, 0.32, 1.3], role: "jaw" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.59, -0.66],
      [0, 0.61, -0.8],
      [0, 0.71, -0.88],
      [0, 0.84, -0.86],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // --- body ----------------------------------------------------------------------------------------------------
  const body = b.loft(
    [
      { at: [0, 0.56, -0.72], w: 0.36, h: 0.36 },
      { at: [0, 0.58, -0.35], w: 0.56, h: 0.46 },
      { at: [0, 0.63, 0.0], w: 0.56, h: 0.46 },
      { at: [0, 0.74, 0.32], w: 0.74, h: 0.6 },
      { at: [0, 0.66, 0.58], w: 0.6, h: 0.5 },
      { at: [0, 0.59, 0.77], w: 0.5, h: 0.44 },
      { at: [0, 0.53, 0.92], w: 0.42, h: 0.4 },
    ],
    { bone: [hips, spine, neck], color: coat, sides: 10, name: "body" },
  );

  b.sweep(tail, [0.045, 0.012], { color: coat, sides: 6, name: "tailTube" });
  b.cards([frame(tail.at(1), [0, 1, 0.15])], TUFT, {
    size: [0.07, 0.18],
    lean: 30,
    flow: [0, 0, -1],
    cross: true,
    vary: 0.2,
    color: FUR_TIP,
  });
  b.cards(
    [frame(tail.at(1), [0, 0.8, 0.5]), frame(tail.at(1), [0, 0.8, -0.4])],
    TUFT,
    { size: [0.06, 0.14], lean: 40, flow: [0, -0.5, -1], cross: true, color: "#e0b070" },
  );

  // --- head ----------------------------------------------------------------------------------------------------
  const skull = b.loft(
    [
      { at: [0, 0.56, 0.86], w: 0.5, h: 0.5 },
      { at: [0, 0.55, 0.98], w: 0.46, h: 0.47 },
      { at: [0, 0.5, 1.1], w: 0.36, h: 0.36 },
      { at: [0, 0.445, 1.25], w: 0.25, h: 0.25 },
      { at: [0, 0.4, 1.37], w: 0.21, h: 0.21 },
    ],
    { bone: head, color: coat, sides: 10, caps: { start: "round", end: "flat" }, name: "skull" },
  );
  const jawBody = b.loft(
    [
      { at: [0, 0.315, 1.0], w: 0.26, h: 0.12 },
      { at: [0, 0.29, 1.15], w: 0.2, h: 0.11 },
      { at: [0, 0.3, 1.32], w: 0.14, h: 0.09 },
    ],
    { bone: jaw, color: jawPaint, sides: 8, name: "jawBody" },
  );

  // snout disc and nostrils
  b.part(new THREE.CylinderGeometry(0.1, 0.106, 0.075, 8), noseTop, {
    bone: head,
    at: [0, 0.395, 1.405],
    dir: [0, -0.28, 1],
    scale: [1.05, 1, 0.92],
    name: "snoutDisc",
  });
  for (const sx of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.024, 6, 4), NOSTRIL, {
      bone: head,
      at: [sx * 0.045, 0.393, 1.444],
      scale: [1.05, 0.75, 0.5],
    });
    b.part(new THREE.SphereGeometry(0.007, 4, 3), WHITE, { bone: head, at: [sx * 0.05, 0.42, 1.448] });
  }
  // upper lip wrinkle ridge
  b.capsule([-0.085, 0.445, 1.37], [0.085, 0.445, 1.37], 0.015, { bone: head, color: SNOUT_D, name: "noseBridge" });

  // teeth
  for (const sx of [-1, 1])
    for (const k of [0.5, 1.5]) {
      b.part(new THREE.ConeGeometry(0.0125, 0.04, 5), TEETH, { bone: head, at: [sx * k * 0.03, 0.32, 1.395], dir: [0, -1, 0] });
      b.part(new THREE.ConeGeometry(0.011, 0.036, 5), TEETH, { bone: jaw, at: [sx * k * 0.027, 0.36, 1.372] });
    }
  b.part(new THREE.BoxGeometry(0.1, 0.022, 0.2), TONGUE, { bone: jaw, at: [0, 0.344, 1.14] });

  // eyes and brows
  const eyeSkin = b.surface(skull);
  for (const sx of [1, -1]) {
    const hit = eyeSkin.nearest([sx * 0.2, 0.6, 1.1]);
    const E = hit.at.clone();
    b.stick(new THREE.SphereGeometry(0.036, 8, 6), "#2a1410", hit, { embed: 0.55, bone: head });
    b.part(new THREE.SphereGeometry(0.031, 7, 5), EYE, { bone: head, at: E.clone().addScaledVector(hit.n, 0.026) });
    b.part(new THREE.SphereGeometry(0.0155, 6, 4), BLACK, { bone: head, at: E.clone().addScaledVector(hit.n, 0.05) });
    const glint = E.clone().addScaledVector(hit.n, 0.062).add(new THREE.Vector3(0, 0.01, 0.008));
    b.part(new THREE.SphereGeometry(0.0065, 4, 3), WHITE, { bone: head, at: glint });
    // heavy angry brow, inner end lower than the outer
    const brA = E.clone().add(new THREE.Vector3(0, 0.046, -0.055)).addScaledVector(hit.n, 0.012);
    const brB = E.clone().add(new THREE.Vector3(0, 0.03, 0.06)).addScaledVector(hit.n, 0.012);
    b.capsule(brA, brB, [0.027, 0.019], { bone: head, color: FUR_DEEP, sides: 6, name: "brow" });
  }

  // ears
  for (const sx of [1, -1]) {
    const inner = new THREE.Vector3(sx * 0.4, 0, 0.9).normalize();
    const earJoint = b.joint(sx > 0 ? "earL" : "earR", {
      parent: head,
      at: [sx * 0.15, 0.75, 0.9],
      dir: [sx * 0.4, 1, -0.28],
      role: "hinge",
    });
    const outline: OutlinePoint[] =
      sx > 0
        ? [
            [-0.075, 0],
            [0.075, 0],
            [0.08, 0.07],
            [0.06, 0.15],
            [0.032, 0.14, "sharp"],
            [0.03, 0.2],
            [0.0, 0.27, "sharp"],
            [-0.04, 0.18],
            [-0.08, 0.07],
          ]
        : [
            [-0.075, 0],
            [0.075, 0],
            [0.08, 0.07],
            [0.045, 0.17],
            [0.0, 0.27, "sharp"],
            [-0.04, 0.18],
            [-0.08, 0.07],
          ];
    const earPaint = paint((p, n, s) => {
      if (n.dot(inner) > 0.4) return mix(EAR_IN, EAR_IN_D, smoothstep(0.03, 0.26, s[1]) * 0.7 + smoothstep(0.04, 0.075, Math.abs(s[0])) * 0.3);
      return mix(resolve(coat, p, n), FUR_DEEP, smoothstep(0.1, 0.27, s[1]) * 0.6);
    });
    const ear = b.extrude(outline, {
      at: [sx * 0.15, 0.75, 0.9],
      x: [sx * 0.9, 0, -0.4],
      y: [sx * 0.4, 1, -0.28],
      thickness: [0.03, 0.01],
      bevel: 0.008,
      smoothing: 1,
      color: earPaint,
      bone: earJoint,
      name: sx > 0 ? "earL" : "earR",
    });
    // bristle fringe on the ear's rim
    b.cards(
      [ear.moved([0.0, 0.26, 0]), ear.moved([0.04, 0.2, 0]), ear.moved([-0.04, 0.2, 0])],
      TUFT,
      { size: [0.03, 0.07], lean: 0, flow: [0, 0, -1], color: FUR_TIP },
    );
  }

  // tusks (lower canines, ride the jaw): one snapped, one banded in bronze
  const tuskLeftPath = bezier([0.08, 0.33, 1.22], [0.21, 0.35, 1.34], [0.29, 0.52, 1.42], [0.21, 0.78, 1.33]);
  const tuskRightFull = bezier([-0.08, 0.33, 1.22], [-0.21, 0.35, 1.34], [-0.29, 0.52, 1.42], [-0.21, 0.78, 1.33]);
  const tuskRightPath = tuskRightFull.slice(0, 0.76);
  b.sweep(tuskLeftPath, [0.056, 0.0], { bone: jaw, color: tuskPaint, sides: 8, caps: { start: "flat", end: "point" }, name: "tuskL" });
  b.sweep(tuskRightPath, [0.056, 0.026], { bone: jaw, color: brokenTuskPaint, sides: 8, caps: { start: "flat", end: "flat" }, name: "tuskR" });
  // jagged break on the snapped tusk
  const brk = tuskRightPath.at(1);
  b.part(new THREE.ConeGeometry(0.012, 0.03, 5), "#cdb98a", { bone: jaw, at: brk, dir: tuskRightPath.tangentAt(1), name: "tuskChip" });

  // bronze band on the left tusk with rivets, and a worn cuff on the right
  for (const [path, t, rad, key] of [
    [tuskLeftPath, 0.3, 0.047, "L"],
    [tuskRightPath, 0.24, 0.055, "R"],
  ] as const) {
    const c = path.at(t);
    const d = path.tangentAt(t);
    b.part(new THREE.CylinderGeometry(rad, rad + 0.004, 0.05, 10), BRONZE, { bone: jaw, at: c, dir: d, name: `band${key}` });
    for (const edge of [-0.027, 0.027])
      b.part(new THREE.CylinderGeometry(rad + 0.005, rad + 0.005, 0.008, 10), BRONZE_D, {
        bone: jaw,
        at: c.clone().addScaledVector(d, edge),
        dir: d,
      });
    b.ring(frame(c, d), { count: 5, radius: rad + 0.004 }, (item) => {
      b.part(new THREE.SphereGeometry(0.007, 4, 3), "#e7b25b", { bone: jaw, at: item.at });
    });
  }

  // small upper tusks
  for (const sx of [1, -1]) {
    b.sweep(
      bezier([sx * 0.09, 0.36, 1.31], [sx * 0.125, 0.37, 1.37], [sx * 0.15, 0.41, 1.4], [sx * 0.155, 0.49, 1.37]),
      [0.024, 0.0],
      { bone: head, color: tuskPaint, sides: 6, caps: { start: "flat", end: "point" }, name: "upperTusk" },
    );
    // fleshy lip pad where the lower tusk leaves the mouth, and two warty cheek knobs
    b.part(new THREE.SphereGeometry(0.04, 6, 4), SNOUT_D, { bone: jaw, at: [sx * 0.1, 0.345, 1.25], scale: [1, 0.7, 1.2], name: "lipPad" });
    for (const [x, y, z, rr] of [
      [0.2, 0.5, 1.03, 0.022],
      [0.17, 0.44, 1.15, 0.017],
    ] as const) {
      const wart = eyeSkin.nearest([sx * x, y, z]);
      b.stick(new THREE.SphereGeometry(rr, 5, 4), "#7a5646", wart, { embed: 0.3, bone: head, name: "wart" });
    }
  }

  // --- legs ----------------------------------------------------------------------------------------------------
  const legRadii = [0.135, 0.11, 0.082, 0.066, 0.056, 0.053];
  const legSweeps: Sweep[] = [];
  const addLeg = (
    sx: number,
    root: [number, number, number],
    foot: [number, number, number],
    lengths: number[],
    bends: [number, number, number][],
    names: string[],
    parent: typeof hips,
  ) => {
    const pts = limb(root, foot, lengths, bends);
    const leg = b.chain(`${names[0]}Leg${sx > 0 ? "L" : "R"}`, pts, {
      parent,
      names: names.map((n) => n + (sx > 0 ? "L" : "R")),
      role: "leg",
      contact: [foot[0], 0, foot[2]],
    });
    legSweeps.push(b.sweep(leg, legRadii, { color: coat, sides: 8, name: `leg${sx > 0 ? "L" : "R"}${names[0]}` }));
    const hoof = leg.tip!;
    for (const k of [-1, 1]) {
      b.extrude(
        [
          [0, 0],
          [0.108, 0],
          [0.115, 0.02],
          [0.085, 0.06],
          [0.04, 0.086],
          [-0.012, 0.082],
          [-0.024, 0.04],
        ],
        {
          x: [0, 0, 1],
          at: [foot[0] + k * 0.03, 0, foot[2] - 0.055],
          thickness: 0.056,
          bevel: 0.005,
          color: hoofPaint,
          bone: hoof,
          name: "hoof",
        },
      );
      b.spike([foot[0] + k * 0.04, 0.115, foot[2] - 0.045], [0, -0.5, -1], 0.045, 0.014, { bone: hoof, color: HORN });
    }
    return leg;
  };

  for (const sx of [1, -1]) {
    const front = addLeg(
      sx,
      [sx * 0.27, 0.54, 0.38],
      [sx * 0.24, 0.075, 0.43],
      [0.23, 0.21, 0.06],
      [[0, 0, -1], [0, 0, 1], [0, 0, -1]],
      ["shoulder", "elbow", "carpus", "hoofF"],
      chest,
    );
    // shoulder muscle
    b.part(new THREE.SphereGeometry(1, 8, 6), coat, {
      bone: front.joints[0],
      at: [sx * 0.27, 0.54, 0.37],
      scale: [0.125, 0.23, 0.21],
      name: "shoulderMuscle",
    });
    const hind = addLeg(
      sx,
      [sx * 0.26, 0.5, -0.42],
      [sx * 0.23, 0.075, -0.5],
      [0.24, 0.21, 0.06],
      [[0, 0, 1], [0, 0, -1], [0, 0, 1]],
      ["hip", "knee", "hock", "hoofH"],
      hips,
    );
    // ham
    b.part(new THREE.SphereGeometry(1, 8, 6), coat, {
      bone: hind.joints[0],
      at: [sx * 0.25, 0.5, -0.42],
      scale: [0.14, 0.24, 0.22],
      name: "ham",
    });
  }

  // --- mane: ridge of bristle spikes from the crown down the spine --------------------------------------------
  const maneHeight = (t: number) => 0.12 + 0.26 * Math.exp(-(((t - 0.6) / 0.2) ** 2));
  for (const [deg, scale, count] of [
    [0, 1, 16],
    [40, 0.55, 14],
    [-40, 0.55, 14],
  ] as const) {
    for (let i = 0; i < count; i++) {
      const t = 0.1 + (0.86 * (i + 0.5)) / count;
      const pt = body.at(t, deg);
      const h = maneHeight(t) * scale * (0.9 + 0.2 * r());
      const base = pt.at.clone().addScaledVector(pt.n, -0.02);
      const back = pt.tangent.clone().multiplyScalar(-1);
      const p1 = pt.at.clone().addScaledVector(pt.n, h * 0.5);
      const p2 = pt.at.clone().addScaledVector(pt.n, h * 0.82).addScaledVector(back, h * 0.14);
      const tip = pt.at.clone().addScaledVector(pt.n, h * 0.96).addScaledVector(back, h * 0.38);
      b.sweep(bezier(base, p1, p2, tip), [0.014 + 0.03 * scale, 0.0], {
        bone: pt.bone ?? hips,
        color: spikePaint,
        sides: 5,
        name: "maneSpike",
      });
    }
  }
  // crown spikes between the ears and brow
  for (const [deg, t, h] of [
    [0, 0.0, 0.1],
    [0, 0.2, 0.12],
    [0, 0.4, 0.1],
    [28, 0.1, 0.08],
    [-28, 0.1, 0.08],
    [28, 0.3, 0.07],
    [-28, 0.3, 0.07],
  ] as const) {
    const pt = skull.at(0.08 + t * 0.8, deg);
    const back = pt.tangent.clone().multiplyScalar(-1);
    const base = pt.at.clone().addScaledVector(pt.n, -0.015);
    const tip = pt.at.clone().addScaledVector(pt.n, h).addScaledVector(back, h * 0.5);
    b.sweep(bezier(base, pt.at.clone().addScaledVector(pt.n, h * 0.5), tip), [0.02, 0.0], {
      bone: head,
      color: spikePaint,
      sides: 5,
      name: "crownSpike",
    });
  }

  // --- fur cards -----------------------------------------------------------------------------------------------
  const bodySkin = b.surface([body, ...legSweeps]);
  const tufts = bodySkin.scatter(360, { rng: rng(3), minDist: 0.07, filter: (h) => h.n.y > -0.55 && h.at.y > 0.2 });
  b.cards(tufts, TUFT, { size: [0.045, 0.1], lean: 68, bend: 22, vary: 0.3, rng: rng(4), color: tuftTint, flow: [0, -0.3, -1] });

  // mane fuzz between the spikes: bold painted bristle cards
  const fuzz: SweepPoint[] = [];
  for (let i = 0; i < 30; i++) fuzz.push(body.at(0.08 + (0.88 * i) / 29, i % 2 ? 14 : -14));
  b.cards(fuzz, MANE, {
    size: [0.07, 0.16],
    lean: 28,
    bend: 12,
    flow: [0, -0.2, -1],
    vary: 0.3,
    rng: rng(5),
    cross: true,
  });

  // shaggy beard, cheek tufts and jowls
  const headSkin = b.surface([skull, jawBody]);
  const beard = headSkin.scatter(70, {
    rng: rng(6),
    minDist: 0.04,
    filter: (h) => h.at.z > 0.9 && h.at.z < 1.3 && (h.n.y < -0.1 || Math.abs(h.n.x) > 0.7) && h.at.y > 0.24,
  });
  b.cards(beard, TUFT, { size: [0.04, 0.09], lean: 70, bend: 16, vary: 0.3, rng: rng(8), color: "#c8a878", flow: [0, -0.5, -1] });
  // chest bib and neck ruff
  const ruff = b.surface(body).scatter(90, {
    rng: rng(9),
    minDist: 0.05,
    filter: (h) => h.at.z > 0.5 && h.at.z < 0.92 && h.n.y < 0.2,
  });
  b.cards(ruff, MANE, { size: [0.07, 0.15], lean: 70, bend: 16, vary: 0.25, rng: rng(10), flow: [0, -0.6, -1] });

  // --- scars (decals on the flanks) ----------------------------------------------------------------------------
  const flank = b.surface(body);
  const scarHit = flank.around([0, 0.64, 0.05]).at(90, 5);
  if (scarHit) b.decal(flank, SCARS, { at: scarHit, dir: [1, 0, 0], size: [0.24, 0.24], roll: 6, segments: 12 });
  const scarHitR = flank.around([0, 0.64, -0.2]).at(-90, 10);
  if (scarHitR) b.decal(flank, SCARS_R, { at: scarHitR, dir: [-1, 0, 0], size: [0.26, 0.17], mirror: true, segments: 12 });

  // --- open the jaw a little, last --------------------------------------------------------------------------
  b.pose(jaw, { axis: [1, 0, 0], deg: 13 });

  return b.root;
}
```
