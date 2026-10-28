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

These are complete, typecheck-clean reference modules. They are examples, not templates: design the requested subject yourself, reuse API shapes and construction techniques where useful, and do not copy a reference subject or its composition. The picker supplied three structural matches plus one nearest different subject for topology prop-group.

## Example: tavernBarrelStackSonnet

Brief: Category: Prop group.
Subject: tavern corner with iron-hooped casks, keg rack, barrel-top table, mugs, crates, sign, lantern, banner and mouse.
Style: Blizzard/Warcraft.
Topology: prop-group
Style family: blizzard-warcraft
Notable features: barrels, keg-rack, table, lantern, mouse

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";
import { aim, DEG, rng } from "agentic-3js-builder";
import { catmull, spiral } from "agentic-3js-builder";
import { cells, mix, noise, paint, rgb, smoothstep } from "agentic-3js-builder";
import type { Paint } from "agentic-3js-builder";
import type { Rgb } from "agentic-3js-builder";
import type { Fill } from "agentic-3js-builder";
import type { Joint } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Tavern Corner: Barrel Stack",
  description:
    "A tavern corner in a hand-painted heroic-fantasy style: a pyramid of iron-hooped casks, a keg rack with brass taps, a candlelit barrel-top table with mugs, crates of bottles, a hanging sign, lantern and banner, and a mouse sneaking to a spilled ale.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

type V = [number, number, number];
type Tex = ReturnType<typeof svg>;

const FT = 0.12; // floor top

// ---------------------------------------------------------------------------------------------------------------
// Hand-painted shading: a baked key light from above-front-left, violet shadows, warm highlights, floor occlusion.
// ---------------------------------------------------------------------------------------------------------------
const KEY = new THREE.Vector3(0.38, 0.82, 0.44).normalize();
const hash = (x: number) => {
  const s = Math.sin(x * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const _v = new THREE.Vector3();
const _w = new THREE.Vector3();

function lighten(c: Rgb, p: THREE.Vector3, n: THREE.Vector3, ao = 1): Rgb {
  const t = smoothstep(-0.55, 0.85, n.dot(KEY));
  let out = mix(c, "#2b1c44", (1 - t) * 0.5);
  out = mix(out, "#ffe9a8", Math.max(0, t - 0.6) * 0.55);
  const a = smoothstep(FT - 0.02, FT + 0.6, p.y);
  return mix(out, "#150d22", (1 - a) * 0.4 * ao);
}

/** Painted wood: streaky grain stretched by (sx, sy, sz), two tones, hand-painted lighting. */
function wood(base: string, darkHex: string, o: { sx?: number; sy?: number; sz?: number; size?: number; seed?: number; ao?: number } = {}) {
  const { sx = 1, sy = 1, sz = 1, size = 0.09, seed = 1, ao = 1 } = o;
  return paint((p, n) => {
    _v.set(p.x * sx, p.y * sy, p.z * sz);
    const g = noise(_v, size, seed);
    _w.set(p.x * sx * 3.3, p.y * sy * 3.3, p.z * sz * 3.3);
    const g2 = noise(_w, size, seed + 7);
    let c = mix(base, darkHex, smoothstep(0.45, 0.8, g) * 0.6 + smoothstep(0.62, 0.85, g2) * 0.3);
    c = mix(c, "#f0c47a", smoothstep(0.72, 0.95, g2) * 0.18);
    return lighten(c, p, n, ao);
  });
}

/** Flat-ish painted colour with soft brush mottling and hand-painted lighting. */
function hand(base: string, darkHex: string, o: { size?: number; seed?: number; amt?: number } = {}) {
  const { size = 0.07, seed = 3, amt = 0.5 } = o;
  return paint((p, n) => {
    const g = noise(p, size, seed);
    const c = mix(base, darkHex, smoothstep(0.45, 0.85, g) * amt);
    return lighten(c, p, n);
  });
}

const SEAM = rgb("#2a170d");

const W_CRATE: Paint3[] = [
  wood("#b97d3e", "#6a3c18", { sx: 0.25, sy: 4, sz: 4, seed: 11 }),
  wood("#a66a30", "#5a3014", { sx: 0.25, sy: 4, sz: 4, seed: 12 }),
  wood("#c58b4a", "#7a4a20", { sx: 0.25, sy: 4, sz: 4, seed: 13 }),
];
type Paint3 = Paint;
const W_DARK = wood("#5b3418", "#2c170a", { sx: 1, sy: 1, sz: 1, seed: 21 });
const TIMBER_V = wood("#6a4122", "#33200f", { sx: 4, sy: 0.25, sz: 4, seed: 31 });
const TIMBER_X = wood("#6a4122", "#33200f", { sx: 0.25, sy: 4, sz: 4, seed: 32 });
const TIMBER_Z = wood("#6a4122", "#33200f", { sx: 4, sy: 4, sz: 0.25, seed: 33 });
const TIMBER_D = wood("#6a4122", "#33200f", { sx: 1, sy: 1, sz: 1, seed: 34 });
const WOOD_MUG = wood("#b27637", "#6a3a18", { sx: 3, sy: 0.3, sz: 3, size: 0.05, seed: 41, ao: 0.3 });
const WOOD_LIGHT = wood("#c9954f", "#8a5a28", { sx: 1, sy: 1, sz: 1, seed: 42, size: 0.07 });
const IRON = paint((p, n) => {
  const g = noise(p, 0.05, 51);
  let c = mix("#434b5e", "#262b38", smoothstep(0.4, 0.8, g));
  c = mix(c, "#7a5a3a", smoothstep(0.7, 0.9, noise(p, 0.03, 52)) * 0.5); // rust flecks
  const t = smoothstep(0.3, 0.95, n.dot(KEY));
  c = mix(c, "#9db6d8", t * 0.35);
  return lighten(c, p, n);
});
const STEEL = "#aebfd8";
const BRASS = "#e2a929";
const BRASS_P = hand("#e8b030", "#a0620f", { size: 0.03, seed: 54, amt: 0.6 });
const PEWTER = hand("#9aa6b6", "#5d6a80", { size: 0.04, seed: 55, amt: 0.6 });
const CLAY = hand("#c0623c", "#7a2e22", { size: 0.04, seed: 56, amt: 0.6 });
const BURLAP = paint((p, n) => {
  const w = Math.sin(p.x * 260) * Math.sin(p.y * 240) * Math.sin(p.z * 260);
  let c = mix("#d4b374", "#9c7a44", smoothstep(0.4, 0.85, noise(p, 0.08, 61)));
  c = mix(c, "#7a5c30", w > 0.6 ? 0.2 : 0);
  return lighten(c, p, n);
});
const ROPE = paint((p, n, s) => {
  const tw = (((s[1] - 900 * s[0]) % 90) + 90) % 90;
  let c = mix("#c9a468", "#8a6a3a", tw < 38 ? 0.0 : 0.75);
  c = mix(c, "#6a4a28", smoothstep(0.5, 0.85, noise(p, 0.03, 62)) * 0.4);
  return lighten(c, p, n);
});
const HAY = hand("#e3bf5a", "#a8802a", { size: 0.03, seed: 63 });
const GRAIN = hand("#e1b657", "#a27a2a", { size: 0.02, seed: 64 });
const CHEESE = hand("#f6cc48", "#c8901e", { size: 0.03, seed: 65 });
const WAX = hand("#fbefd2", "#d8c294", { size: 0.03, seed: 66 });
const FOAM = "#fff6dc";
const AMBER = "#e8921c";
const FLESH = hand("#7d6b66", "#4d4046", { size: 0.02, seed: 69 });
const PINK = "#e9a3a3";
const GREEN_H1 = "#8bb23f";
const GREEN_H2 = "#5f9028";

const PLASTER = paint((p, n) => {
  let c = mix("#d9c28e", "#ecdca8", noise(p, 0.4, 3));
  c = mix(c, "#a98458", (1 - smoothstep(0.62, 1.25, p.y)) * 0.5);
  c = mix(c, "#7a6350", smoothstep(1.8, 2.1, p.y) * 0.35);
  c = mix(c, "#b79a6c", smoothstep(0.6, 0.78, noise(p, 0.12, 4)) * 0.35);
  const cl = cells(p, 0.5, 5);
  if (cl.d2 - cl.d1 < 0.012 && noise(p, 0.35, 9) > 0.62) c = rgb("#8a6e4c");
  // fallen plaster revealing the brick beneath
  const dm = noise(p, 0.5, 14);
  if (dm > 0.6 && p.y < 1.55) {
    const course = Math.floor(p.y / 0.075);
    const bx = (p.x + p.z + (course % 2) * 0.07) / 0.14;
    const bf = bx - Math.floor(bx);
    const yf = p.y / 0.075 - course;
    let bc = mix("#a9572f", "#7a3a22", hash(Math.floor(bx) * 1.7 + course * 9.1));
    if (bf < 0.07 || yf < 0.12) bc = mix("#5a4a3a", "#7a6a58", yf);
    c = dm > 0.66 ? bc : mix(c, "#4a3a2a", 0.7);
  }
  return lighten(c, p, n);
});
const COBBLE = paint((p, n) => {
  const cl = cells(p, 0.2, 2);
  const e = cl.d2 - cl.d1;
  const hv = hash(cl.id * 3.1);
  let c = mix(mix("#8f8aa0", "#6b6783", hv), "#a39c8e", hash(cl.id * 7.7) * 0.5);
  c = mix(c, "#d9d4e6", (1 - smoothstep(0, 0.6, cl.d1)) * 0.25);
  if (e < 0.09) c = mix("#3a3448", "#59506a", e / 0.09);
  const moss = smoothstep(0.58, 0.78, noise(p, 0.14, 8)) * (1 - smoothstep(0.1, 0.4, p.y));
  c = mix(c, "#5f8a34", moss * 0.55);
  return lighten(c, p, n, 0.8);
});
const STEELP = hand("#c4d0e6", "#6f7f9c", { size: 0.03, seed: 57, amt: 0.5 });
const CLAD = paint((p, n) => {
  const kk = p.y / 0.15;
  const k = Math.floor(kk);
  const f = kk - k;
  _v.set(p.x * 0.4 + p.z * 0.4, p.y * 6, 0);
  let c = mix(mix("#8a5530", "#aa7040", hash(k * 3.3)), "#4a2c14", smoothstep(0.5, 0.85, noise(_v, 0.1, 81)) * 0.55);
  c = mix(c, "#5f8a34", smoothstep(0.62, 0.8, noise(p, 0.2, 82)) * (1 - smoothstep(0.7, 1.1, p.y)) * 0.5);
  if (f < 0.06) c = rgb("#2a170c");
  return lighten(c, p, n);
});
const FLOOR = paint((p, n) => {
  const rowF = (p.z + 1.5) / 0.23;
  const row = Math.floor(rowF);
  const rz = rowF - row;
  const off = hash(row) * 1.3;
  const colF = (p.x + 1.5 + off) / 1.25;
  const col = Math.floor(colF);
  const lx = (colF - col) * 1.25;
  const tone = hash(row * 7.3 + col * 1.7);
  _v.set(p.x * 0.3, 0, p.z * 4.5);
  const g = noise(_v, 0.1, 71 + row);
  let c = mix(mix("#8c5a2e", "#b3753c", tone), "#4f2c14", smoothstep(0.5, 0.85, g) * 0.55);
  c = mix(c, "#e0a45c", smoothstep(0.5, 0.18, Math.abs(rz - 0.5)) * 0.2);
  const d = Math.hypot(p.x - 0.33, (p.z - 0.6) * 1.15);
  c = mix(c, "#3a1f0e", (1 - smoothstep(0.1, 0.34, d)) * 0.7);
  c = mix(c, "#5b3718", smoothstep(0.55, 0.8, noise(p, 0.45, 72)) * 0.3);
  if (rz < 0.05 || rz > 0.95 || lx < 0.012 || lx > 1.238) c = rgb("#24140a");
  return lighten(c, p, n, 0);
});

// ---------------------------------------------------------------------------------------------------------------
// Barrel paint: staves with painted highlights and seams, planked heads, end-grain rims.
// ---------------------------------------------------------------------------------------------------------------
function barrelPaint(o: {
  base: string;
  dark: string;
  ax: THREE.Vector3;
  c0: THREE.Vector3;
  H: number;
  rE: number;
  seed: number;
  open?: boolean;
}) {
  const ax = o.ax.clone();
  const e1 = Math.abs(ax.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  e1.addScaledVector(ax, -e1.dot(ax)).normalize();
  const e2 = new THREE.Vector3().crossVectors(ax, e1);
  const step = 360 / 14;
  const d = new THREE.Vector3();
  return paint((p, n, s) => {
    d.copy(p).sub(o.c0);
    const a = d.dot(ax);
    const ru = d.dot(e1);
    const rv = d.dot(e2);
    const rad = Math.hypot(ru, rv);
    const axial = n.dot(ax);
    let c: Rgb;
    if (Math.abs(axial) > 0.55) {
      if (rad > o.rE - 0.042) {
        c = mix(o.base, "#ecc47a", 0.4);
        c = mix(c, "#3a2412", smoothstep(0.35, 0.8, noise(p, 0.02, o.seed)) * 0.5);
      } else if (o.open && a > o.H - 0.2 && axial > 0) {
        c = mix("#2a170a", "#150a04", noise(p, 0.05, o.seed));
      } else {
        const w = 0.1;
        const k = Math.floor(ru / w + 0.5);
        const lx = ru - k * w;
        c = mix(mix(o.base, o.dark, hash(k * 3.7 + o.seed) * 0.55), "#efc27c", 0.18);
        _v.set(ru * 2, rv * 14, o.seed);
        c = mix(c, o.dark, smoothstep(0.5, 0.82, noise(_v, 0.05, o.seed)) * 0.6);
        c = mix(c, "#2a170a", smoothstep(o.rE - 0.13, o.rE - 0.045, rad) * 0.5);
        if (Math.abs(lx) > w / 2 - 0.004) c = SEAM;
        if (Math.abs(rad - 0.06) < 0.006) c = mix(c, "#2a170a", 0.6); // growth ring
      }
    } else {
      const rn = (ru * n.dot(e1) + rv * n.dot(e2)) / Math.max(rad, 1e-4);
      if (o.open && a > o.H - 0.14 && rn < -0.3) {
        c = mix("#3a2212", "#1a0e06", smoothstep(o.H - 0.14, o.H - 0.02, a));
      } else {
        const u = s[1] / step;
        const k = Math.floor(u);
        const lf = u - k;
        c = mix(o.base, o.dark, hash(k * 5.1 + o.seed * 1.7) * 0.55);
        c = mix(c, "#f4c883", (1 - smoothstep(0, 0.75, Math.abs(lf - 0.5) * 2)) * 0.24);
        _v.set(s[1] * 0.012, a * 0.35, o.seed);
        c = mix(c, o.dark, smoothstep(0.5, 0.82, noise(_v, 0.07, o.seed)) * 0.55);
        c = mix(c, "#1d130c", (1 - smoothstep(0, 0.22, Math.min(a, o.H - a))) * 0.4);
        if (lf < 0.05 || lf > 0.95) c = mix(c, SEAM, 0.85);
      }
    }
    return lighten(c, p, n);
  });
}

// ---------------------------------------------------------------------------------------------------------------
// SVG drawings
// ---------------------------------------------------------------------------------------------------------------
const BR = "#3a1c0c";
const BRAND_MUG = `<svg viewBox="0 0 128 128"><circle cx="64" cy="64" r="58" fill="none" stroke="${BR}" stroke-width="7"/><circle cx="64" cy="64" r="48" fill="none" stroke="${BR}" stroke-width="3"/><path d="M36 52h46l-4 46q-1 7-8 7H48q-7 0-8-7z" fill="${BR}"/><path d="M82 60h6q12 0 12 11t-12 11h-8" fill="none" stroke="${BR}" stroke-width="7"/><path d="M34 52q2-14 14-10q7-13 18-5q12-5 17 8z" fill="${BR}"/><path d="M46 66l4 24M58 66l2 28" stroke="#d9a35a" stroke-width="3" fill="none"/></svg>`;
const BRAND_WHEAT = `<svg viewBox="0 0 128 128"><circle cx="64" cy="64" r="58" fill="none" stroke="${BR}" stroke-width="7"/><path d="M64 108V30" stroke="${BR}" stroke-width="5"/><path d="M64 34q-12 6-12 18q10-2 12-12zM64 34q12 6 12 18q-10-2-12-12zM64 54q-14 6-14 20q12-3 14-14zM64 54q14 6 14 20q-12-3-14-14zM64 74q-14 6-14 20q12-3 14-14zM64 74q14 6 14 20q-12-3-14-14z" fill="${BR}"/><path d="M64 14l-5 14h10z" fill="${BR}"/></svg>`;
const BRAND_X = `<svg viewBox="0 0 128 128"><circle cx="64" cy="64" r="58" fill="none" stroke="${BR}" stroke-width="7"/><path d="M30 40l24 48M54 40L30 88M74 40l24 48M98 40L74 88" stroke="${BR}" stroke-width="9" fill="none"/><path d="M26 102h76" stroke="${BR}" stroke-width="5"/><path d="M36 22h56" stroke="${BR}" stroke-width="5"/></svg>`;
const BRAND_HOP = `<svg viewBox="0 0 128 128"><circle cx="64" cy="64" r="58" fill="none" stroke="${BR}" stroke-width="7"/><path d="M64 28q-26 10-22 38q6 26 22 36q16-10 22-36q4-28-22-38z" fill="${BR}"/><path d="M64 34v62M50 48q14 8 28 0M46 64q18 10 36 0M50 80q14 8 28 0" stroke="#d9a35a" stroke-width="3" fill="none"/><path d="M64 28q8-14 22-12" stroke="${BR}" stroke-width="5" fill="none"/></svg>`;

const SIGN_ART = `<svg viewBox="0 0 160 120"><rect x="2" y="2" width="156" height="116" rx="12" fill="#8e1f27"/><rect x="2" y="2" width="156" height="116" rx="12" fill="none" stroke="#f2b632" stroke-width="5"/><rect x="11" y="11" width="138" height="98" rx="8" fill="none" stroke="#f7d27a" stroke-width="2.5"/><path d="M52 28h46l-4 44q-1 8-9 8H65q-8 0-9-8z" fill="#f2b632" stroke="#7a4a10" stroke-width="3"/><path d="M98 36h8q14 0 14 13t-14 13h-10" fill="none" stroke="#f2b632" stroke-width="7"/><path d="M48 28q2-16 16-12q8-13 20-5q14-5 18 10z" fill="#fff4d6" stroke="#b8a070" stroke-width="2.5"/><path d="M62 38l3 28M76 38l1 30" stroke="#c98a14" stroke-width="3"/><text x="80" y="104" font-family="Georgia, serif" font-weight="bold" font-size="17" text-anchor="middle" fill="#fbe7b0">THE GILDED KEG</text></svg>`;
const BANNER_ART = `<svg viewBox="0 0 80 150"><path d="M2 2h76v112L40 146 2 114z" fill="#a8242a"/><path d="M2 2h76v112L40 146 2 114z" fill="none" stroke="#f2b632" stroke-width="3.5"/><path d="M9 9h62v102L40 137 9 111z" fill="none" stroke="#f7d27a" stroke-width="1.8"/><circle cx="40" cy="58" r="25" fill="#7a1420" stroke="#f2b632" stroke-width="3"/><path d="M27 44h24l-2 26q0 5-5 5H34q-5 0-5-5z" fill="#f2b632"/><path d="M51 49h4q8 0 8 8t-8 8h-5" fill="none" stroke="#f2b632" stroke-width="4"/><path d="M26 44q1-9 9-6q5-8 11-3q8-3 10 6z" fill="#fff4d6"/><path d="M16 96q24 12 48 0" stroke="#f2b632" stroke-width="3" fill="none"/><path d="M22 104q18 8 36 0" stroke="#f2b632" stroke-width="2" fill="none"/></svg>`;
const SIGN_WIDE = `<svg viewBox="0 0 300 82"><rect x="2" y="2" width="296" height="78" rx="9" fill="#2a3a52"/><rect x="2" y="2" width="296" height="78" rx="9" fill="none" stroke="#f2b632" stroke-width="4"/><rect x="9" y="9" width="282" height="64" rx="6" fill="none" stroke="#f7d27a" stroke-width="1.8"/><text x="150" y="40" font-family="Georgia, serif" font-weight="bold" font-size="25" text-anchor="middle" fill="#f7d27a">THE GILDED KEG</text><path d="M30 50h240" stroke="#f2b632" stroke-width="2"/><text x="150" y="66" font-family="Georgia, serif" font-size="13" text-anchor="middle" fill="#e9dcc0" letter-spacing="2">ALE  ·  MEAD  ·  A WARM BED</text><circle cx="24" cy="41" r="9" fill="#f2b632"/><circle cx="276" cy="41" r="9" fill="#f2b632"/><path d="M20 36h8l-1 10h-6z" fill="#2a3a52"/><path d="M272 36h8l-1 10h-6z" fill="#2a3a52"/></svg>`;
const CHALK_ART = `<svg viewBox="0 0 200 104"><rect width="200" height="104" fill="#2b3840"/><text x="100" y="20" font-family="Georgia, serif" font-weight="bold" font-size="15" text-anchor="middle" fill="#f1efe4">TODAY'S BREW</text><path d="M30 26h140" stroke="#f1efe4" stroke-width="2"/><text x="16" y="48" font-family="Georgia, serif" font-size="13" fill="#f1efe4">AMBER ALE</text><text x="184" y="48" font-family="Georgia, serif" font-size="13" text-anchor="end" fill="#f1efe4">2c</text><text x="16" y="68" font-family="Georgia, serif" font-size="13" fill="#f1efe4">DWARF STOUT</text><text x="184" y="68" font-family="Georgia, serif" font-size="13" text-anchor="end" fill="#f1efe4">4c</text><text x="16" y="88" font-family="Georgia, serif" font-size="13" fill="#f1efe4">HONEY MEAD</text><text x="184" y="88" font-family="Georgia, serif" font-size="13" text-anchor="end" fill="#f1efe4">3c</text><path d="M110 46h58M120 66h48M114 86h54" stroke="#f1efe4" stroke-width="1.2" stroke-dasharray="2 4" opacity="0.0"/></svg>`;
const POSTER_ART = `<svg viewBox="0 0 60 80"><path d="M3 2l12 2 14-2 14 3 14-2 2 74-14 2-14-3-14 3-14-2z" fill="#e8d3a0" stroke="#8a6a38" stroke-width="2"/><text x="30" y="17" font-family="Georgia, serif" font-weight="bold" font-size="10" text-anchor="middle" fill="#8e1f27">WANTED</text><circle cx="30" cy="36" r="11" fill="none" stroke="#3a2a1a" stroke-width="2"/><path d="M24 33h4M32 33h4M25 41q5 4 10 0" stroke="#3a2a1a" stroke-width="2" fill="none"/><path d="M19 26l5 4M41 26l-5 4" stroke="#3a2a1a" stroke-width="2"/><path d="M12 56h36M14 63h32M18 70h24" stroke="#6a4a28" stroke-width="2.2"/><circle cx="46" cy="70" r="5" fill="#8e1f27"/></svg>`;
const CRATE_ART = `<svg viewBox="0 0 120 70"><text x="60" y="38" font-family="Impact, Arial Black, sans-serif" font-weight="bold" font-size="36" text-anchor="middle" fill="#3b2412">HOPS</text><path d="M16 50h88" stroke="#3b2412" stroke-width="4"/><path d="M60 54v12M54 60l6-8 6 8" stroke="#3b2412" stroke-width="4" fill="none"/><path d="M18 8h84" stroke="#3b2412" stroke-width="3"/></svg>`;
const CRATE_ART2 = `<svg viewBox="0 0 120 70"><text x="60" y="34" font-family="Georgia, serif" font-weight="bold" font-size="22" text-anchor="middle" fill="#7a1420">FRAGILE</text><path d="M20 44h80" stroke="#7a1420" stroke-width="3.5"/><path d="M50 52h20l-2 12H52z" fill="none" stroke="#7a1420" stroke-width="3.5"/><path d="M60 10v6" stroke="#7a1420" stroke-width="3.5"/></svg>`;
const SACK_ART = `<svg viewBox="0 0 80 56"><text x="40" y="36" font-family="Georgia, serif" font-weight="bold" font-size="26" text-anchor="middle" fill="#5b2a14">OATS</text><path d="M10 12h60M10 46h60" stroke="#5b2a14" stroke-width="3.5"/></svg>`;
const WEB_ART = `<svg viewBox="0 0 100 100"><path d="M2 2L98 2M2 2L2 98M2 2L92 62M2 2L62 92M2 2L98 28M2 2L28 98" stroke="#dfe7ee" stroke-width="1.8" fill="none"/><path d="M26 2Q26 26 2 26M50 2Q50 50 2 50M74 2Q74 74 2 74M30 6Q36 18 24 30" stroke="#dfe7ee" stroke-width="1.6" fill="none"/></svg>`;
const TAG_ART = `<svg viewBox="0 0 40 60"><path d="M6 14l8-12h20v56H6z" fill="#efe2bd" stroke="#8a6a38" stroke-width="2"/><circle cx="14" cy="12" r="2.5" fill="#8a6a38"/><path d="M12 26h20M12 34h20M12 42h14" stroke="#5b3a1c" stroke-width="2.4"/></svg>`;

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "tavernBarrelStack", paintSize: 2048 });
  const R = rng(17);
  const root = b.joint("root", { at: [0, 0, 0], dir: [0, 1, 0] });
  const bones: Record<string, Joint> = { root };

  const tBrandMug = svg(BRAND_MUG, { size: 256 });
  const tBrandWheat = svg(BRAND_WHEAT, { size: 256 });
  const tBrandX = svg(BRAND_X, { size: 256 });
  const tBrandHop = svg(BRAND_HOP, { size: 256 });
  const tSign = svg(SIGN_ART, { size: 512 });
  const tSignWide = svg(SIGN_WIDE, { size: 1024 });
  const tBanner = svg(BANNER_ART, { size: 512 });
  const tChalk = svg(CHALK_ART, { size: 512 });
  const tPoster = svg(POSTER_ART, { size: 256 });
  const tCrate = svg(CRATE_ART, { size: 256 });
  const tCrate2 = svg(CRATE_ART2, { size: 256 });
  const tSack = svg(SACK_ART, { size: 256 });
  const tWeb = svg(WEB_ART, { size: 256 });
  const tTag = svg(TAG_ART, { size: 128 });

  // ---- merge buckets: static pieces of one object, one bone, one colour become one part ----
  type Bucket = { key: string; color: Fill; bone: string; geos: THREE.BufferGeometry[] };
  const buckets = new Map<string, Bucket>();
  const put = (obj: string, kind: string, color: Fill, geo: THREE.BufferGeometry, m: THREE.Matrix4, bone = "root") => {
    const key = `${obj}_${kind}`;
    let bk = buckets.get(key);
    if (!bk) {
      bk = { key, color, bone, geos: [] };
      buckets.set(key, bk);
    }
    geo.applyMatrix4(m);
    bk.geos.push(geo);
  };
  const flush = () => {
    for (const bk of buckets.values()) {
      const merged = mergeGeometries(bk.geos);
      if (!merged) throw new Error(`merge failed: ${bk.key}`);
      b.part(merged, bk.color, { bone: bones[bk.bone], at: [0, 0, 0], name: bk.key });
    }
  };

  const v3 = (a: V) => new THREE.Vector3(a[0], a[1], a[2]);
  const mat = (pos: V, rot: V = [0, 0, 0], sc: V | number = 1) => {
    const s = typeof sc === "number" ? new THREE.Vector3(sc, sc, sc) : v3(sc);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG, "YXZ"));
    return new THREE.Matrix4().compose(v3(pos), q, s);
  };
  const matQ = (pos: THREE.Vector3, q: THREE.Quaternion, sc: V = [1, 1, 1]) => new THREE.Matrix4().compose(pos, q, v3(sc));
  const mul = (...ms: THREE.Matrix4[]) => ms.reduce((a, m) => a.clone().multiply(m));

  const box = (obj: string, kind: string, color: Fill, size: V, m: THREE.Matrix4, bone?: string) =>
    put(obj, kind, color, new THREE.BoxGeometry(size[0], size[1], size[2]), m, bone);
  const cyl = (obj: string, kind: string, color: Fill, rt: number, rb: number, h: number, seg: number, m: THREE.Matrix4, bone?: string) =>
    put(obj, kind, color, new THREE.CylinderGeometry(rt, rb, h, seg), m, bone);
  const sph = (obj: string, kind: string, color: Fill, r: number, ws: number, hs: number, m: THREE.Matrix4, bone?: string) =>
    put(obj, kind, color, new THREE.SphereGeometry(r, ws, hs), m, bone);
  /** A cylinder between two points. */
  const rod = (obj: string, kind: string, color: Fill, a: V, c: V, r: number, seg = 6, bone?: string) => {
    const pa = v3(a);
    const pc = v3(c);
    const dir = pc.clone().sub(pa);
    put(obj, kind, color, new THREE.CylinderGeometry(r, r, dir.length(), seg), matQ(pa.clone().add(pc).multiplyScalar(0.5), aim(dir)), bone);
  };
  /** A box between two points (square-ish beam), width w, depth d (local x and z). */
  const beam = (obj: string, kind: string, color: Fill, a: V, c: V, w: number, d: number, bone?: string, up: V = [0, 0, 1]) => {
    const pa = v3(a);
    const pc = v3(c);
    const dir = pc.clone().sub(pa);
    put(obj, kind, color, new THREE.BoxGeometry(w, dir.length(), d), matQ(pa.clone().add(pc).multiplyScalar(0.5), aim(dir, up)), bone);
  };

  // =============================================================================================================
  // BASE: stone plinth, plank deck
  // =============================================================================================================
  const boxFaces = (w: number, h: number, d: number, omit: string) => {
    const g = new THREE.BoxGeometry(w, h, d);
    const idx = g.getIndex();
    if (!idx) throw new Error("box has no index");
    const names = ["px", "nx", "py", "ny", "pz", "nz"];
    const keep: number[] = [];
    names.forEach((nm, f) => {
      if (omit.split(" ").includes(nm)) return;
      for (let i = 0; i < 6; i++) keep.push(idx.getX(f * 6 + i));
    });
    g.setIndex(keep);
    g.clearGroups();
    return g;
  };
  b.part(boxFaces(2.9, 0.08, 2.9, "ny"), COBBLE, { bone: root, at: [0, 0.04, 0], name: "plinth" });
  b.part(boxFaces(2.76, 0.04, 2.76, "ny"), FLOOR, { bone: root, at: [0, 0.1, 0], name: "deck" });

  // =============================================================================================================
  // WALLS: stone footing, plaster panels, timber frame
  // =============================================================================================================
  const slab = (name: string, color: Fill, size: V, pos: V, omit = "") =>
    b.part(boxFaces(size[0], size[1], size[2], omit), color, { bone: root, at: pos, name });
  slab("footBack", COBBLE, [2.9, 0.52, 0.2], [0, 0.34, -1.35], "py ny");
  slab("footSide", COBBLE, [0.2, 0.52, 2.9], [-1.35, 0.34, 0], "py ny");
  slab("plasterBack", PLASTER, [2.9, 1.6, 0.16], [0, 1.4, -1.37], "px nx py ny nz");
  slab("plasterSide", PLASTER, [0.16, 1.6, 2.9], [-1.37, 1.4, 0], "pz nz py ny nx");
  // timber frame
  slab("sillBack", TIMBER_X, [2.9, 0.1, 0.2], [0, 0.65, -1.35]);
  slab("plateBack", TIMBER_X, [2.9, 0.16, 0.2], [0, 2.12, -1.35]);
  slab("sillSide", TIMBER_Z, [0.2, 0.1, 2.9], [-1.35, 0.65, 0]);
  slab("plateSide", TIMBER_Z, [0.2, 0.16, 2.9], [-1.35, 2.12, 0]);
  slab("cornerPost", TIMBER_V, [0.22, 2.12, 0.22], [-1.34, 1.14, -1.34]);
  slab("postBackA", TIMBER_V, [0.16, 1.34, 0.2], [0.47, 1.37, -1.35]);
  slab("postBackB", TIMBER_V, [0.16, 1.34, 0.2], [1.37, 1.37, -1.35]);
  slab("postSideA", TIMBER_V, [0.2, 1.34, 0.16], [-1.35, 1.37, 0.57]);
  slab("postSideB", TIMBER_V, [0.2, 1.34, 0.16], [-1.35, 1.37, 1.37]);
  // knee braces
  beam("brace", "back1", TIMBER_D, [-1.2, 1.52, -1.27], [-0.78, 2.05, -1.27], 0.1, 0.12);
  beam("brace", "back2", TIMBER_D, [0.4, 1.55, -1.27], [0.0, 2.05, -1.27], 0.1, 0.12);
  beam("brace", "back3", TIMBER_D, [0.55, 1.55, -1.27], [0.9, 2.05, -1.27], 0.1, 0.12);
  beam("brace", "side1", TIMBER_D, [-1.27, 1.52, -1.2], [-1.27, 2.05, -0.75], 0.12, 0.1);
  beam("brace", "side2", TIMBER_D, [-1.27, 1.55, 0.46], [-1.27, 2.05, 0.06], 0.12, 0.1);
  // wall pegs and plate-end dowels
  for (const [x, y] of [[0.47, 1.2], [0.47, 1.7], [1.37, 1.0], [1.37, 1.6], [-1.34, 0.9], [-1.34, 1.5]] as const)
    cyl("pegs", "wood", WOOD_LIGHT, 0.016, 0.016, 0.03, 6, mul(mat([x, y, -1.235]), mat([0, 0, 0], [90, 0, 0])));
  for (const [z, y] of [[0.57, 1.2], [0.57, 1.7], [1.37, 1.0], [-0.75, 2.12]] as const)
    cyl("pegs", "side", WOOD_LIGHT, 0.016, 0.016, 0.03, 6, mul(mat([-1.235, y, z]), mat([0, 0, 0], [0, 0, 90])));
  // exterior board cladding hides the plaster's outer face
  slab("cladBack1", CLAD, [1.62, 1.34, 0.012], [-0.42, 1.37, -1.439], "px nx py ny pz");
  slab("cladBack2", CLAD, [0.74, 1.34, 0.012], [0.92, 1.37, -1.439], "px nx py ny pz");
  slab("cladSide1", CLAD, [0.012, 1.34, 1.72], [-1.439, 1.37, -0.37], "px py ny pz nz");
  slab("cladSide2", CLAD, [0.012, 1.34, 0.64], [-1.439, 1.37, 0.97], "px py ny pz nz");
  beam("braceOut", "back1", TIMBER_D, [-1.2, 0.74, -1.452], [0.36, 2.02, -1.452], 0.1, 0.02);
  beam("braceOut", "back2", TIMBER_D, [0.58, 2.02, -1.452], [1.26, 0.74, -1.452], 0.09, 0.02);
  beam("braceOut", "side1", TIMBER_D, [-1.452, 0.74, -1.2], [-1.452, 2.02, 0.46], 0.1, 0.02, undefined, [1, 0, 0]);
  beam("braceOut", "side2", TIMBER_D, [-1.452, 2.02, 0.68], [-1.452, 0.74, 1.26], 0.09, 0.02, undefined, [1, 0, 0]);
  // wrought-iron straps with studs around the corner post and the frame posts
  for (const y of [0.95, 1.65]) {
    box("cornerStrap", "iron", IRON, [0.25, 0.1, 0.25], mat([-1.34, y, -1.34]));
    for (const [sx, sz] of [[0.126, 0.0], [0.0, 0.126]] as const)
      for (const k of [-0.07, 0, 0.07]) sph("cornerStrap", "stud", STEEL, 0.014, 5, 3, mat([-1.34 + sx + (sz ? k : 0), y, -1.34 + sz + (sx ? k : 0)]));
  }
  for (const y of [1.0, 1.7]) {
    box("postStraps", "back", IRON, [0.18, 0.08, 0.215], mat([0.47, y, -1.35]));
    box("postStraps", "side", IRON, [0.215, 0.08, 0.18], mat([-1.35, y, 0.57]));
    for (const k of [-0.06, 0.06]) {
      sph("postStraps", "stud", STEEL, 0.012, 5, 3, mat([0.47 + k, y, -1.241]));
      sph("postStraps", "stud", STEEL, 0.012, 5, 3, mat([-1.241, y, 0.57 + k]));
    }
  }

  // =============================================================================================================
  // BARRELS
  // =============================================================================================================
  const hoopGeo = (ri: number, ro: number, y0: number, y1: number) => {
    const c = 0.007;
    const pts = [
      [ri, y0],
      [ro - c, y0],
      [ro, y0 + c],
      [ro, y1 - c],
      [ro - c, y1],
      [ri, y1],
      [ri, y0],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 14);
  };

  type BarrelOpts = {
    id: string;
    c: V;
    axis: V;
    H: number;
    rE: number;
    rM: number;
    base: string;
    dark: string;
    seed: number;
    hoops: number[];
    open?: boolean;
    brand?: { tex: Tex; end: 1 | -1; size: number; up: V };
    bung?: { f: number; dir: V };
  };
  const barrel = (o: BarrelOpts) => {
    const ax = v3(o.axis).normalize();
    const mid = v3(o.c);
    const base0 = mid.clone().addScaledVector(ax, -o.H / 2);
    const rAt = (f: number) => o.rE + (o.rM - o.rE) * (1 - (2 * f - 1) ** 2);
    const lip = 0.045;
    const rim = 0.04;
    const fs = [0, 0.14, 0.3, 0.5, 0.7, 0.86, 1];
    const outline: OutlinePoint[] = [
      [0, lip],
      [o.rE - rim, lip],
      [o.rE - rim, 0],
      ...fs.map((f) => [rAt(f), f * o.H] as OutlinePoint),
      [o.rE - rim, o.H],
    ];
    if (o.open) outline.push([o.rE - rim, o.H - 0.13], [0, o.H - 0.13]);
    else outline.push([o.rE - rim, o.H - lip], [0, o.H - lip]);
    const body = b.lathe(outline, {
      at: base0,
      axis: ax,
      segments: 14,
      bone: root,
      name: o.id,
      color: barrelPaint({ base: o.base, dark: o.dark, ax, c0: base0, H: o.H, rE: o.rE, seed: o.seed, open: o.open }),
    });
    const M = matQ(base0.clone(), aim(ax));
    o.hoops.forEach((f, i) => {
      const y = f * o.H;
      const hh = f < 0.2 || f > 0.8 ? 0.038 : 0.028;
      const r0 = rAt(f);
      const ro = r0 + 0.026;
      put(o.id, "iron", IRON, hoopGeo(r0 - 0.014, ro, y - hh, y + hh), M);
      const n = 11;
      for (let k = 0; k < n; k++) {
        const th = ((k + (i % 2) * 0.5) / n) * Math.PI * 2;
        put(o.id, "rivets", STEEL, new THREE.SphereGeometry(0.0135, 5, 2), mul(M, mat([Math.sin(th) * (ro + 0.003), y, Math.cos(th) * (ro + 0.003)], [0, 0, 0], [1, 1, 1])));
      }
    });
    if (o.bung) {
      const dir = v3(o.bung.dir).normalize();
      const pos = base0.clone().addScaledVector(ax, o.bung.f * o.H).addScaledVector(dir, rAt(o.bung.f) * 0.99);
      put(o.id, "bung", W_DARK, new THREE.CylinderGeometry(0.034, 0.04, 0.05, 8), matQ(pos, aim(dir)));
      put(o.id, "bungHole", "#150c06", new THREE.CylinderGeometry(0.014, 0.014, 0.056, 6), matQ(pos, aim(dir)));
      put(o.id, "bungRing", STEEL, new THREE.TorusGeometry(0.033, 0.005, 4, 8), matQ(pos.clone().addScaledVector(dir, 0.026), aim(dir, [0, 0, 1], "z")));
    }
    if (o.brand) {
      const end = o.brand.end;
      const pos = base0.clone().addScaledVector(ax, end === 1 ? o.H - lip + 0.004 : lip - 0.004);
      b.part(new THREE.PlaneGeometry(o.brand.size, o.brand.size), "#ffffff", {
        bone: root,
        at: pos,
        dir: ax.clone().multiplyScalar(end),
        axis: "z",
        up: o.brand.up,
        texture: o.brand.tex,
        name: `${o.id}_brand`,
      });
    }
    return body;
  };

  // ---- the stack against the back wall: two lying casks and one on top ----
  const RM = 0.41;
  const stackZ = -0.755;
  const y1 = FT + RM;
  const yTop = y1 + RM * Math.sqrt(3);
  barrel({
    id: "caskL",
    c: [-0.8, y1, stackZ],
    axis: [0, 0, 1],
    H: 0.95,
    rE: 0.31,
    rM: RM,
    base: "#a8652c",
    dark: "#5a2f14",
    seed: 3,
    hoops: [0.075, 0.27, 0.73, 0.925],
    brand: { tex: tBrandMug, end: 1, size: 0.4, up: [0, 1, 0] },
    bung: { f: 0.5, dir: [0, 1, 0] },
  });
  barrel({
    id: "caskR",
    c: [0.02, y1, stackZ],
    axis: [0, 0, 1],
    H: 0.95,
    rE: 0.31,
    rM: RM,
    base: "#b27235",
    dark: "#64351a",
    seed: 5,
    hoops: [0.075, 0.27, 0.73, 0.925],
    brand: { tex: tBrandWheat, end: 1, size: 0.4, up: [0, 1, 0] },
    bung: { f: 0.5, dir: [0, 1, 0.1] },
  });
  barrel({
    id: "caskTop",
    c: [-0.39, yTop, stackZ],
    axis: [0, 0, 1],
    H: 0.95,
    rE: 0.31,
    rM: RM,
    base: "#9a5a28",
    dark: "#4e2812",
    seed: 7,
    hoops: [0.075, 0.27, 0.73, 0.925],
    brand: { tex: tBrandX, end: 1, size: 0.4, up: [0, 1, 0] },
    bung: { f: 0.5, dir: [0, 1, 0] },
  });
  // chocks wedging the stack
  for (const z of [-1.04, -0.48]) {
    b.extrude(
      [
        [0, 0],
        [0.2, 0],
        [0, 0.17],
      ],
      { at: [0.38, FT, z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.12, bevel: 0.006, color: W_DARK, bone: root, name: `chock${z}` },
    );
  }

  // ---- standing casks along the side wall ----
  const s1Body = barrel({
    id: "caskS1",
    c: [-0.84, FT + 0.46, 0.12],
    axis: [0, 1, 0],
    H: 0.92,
    rE: 0.29,
    rM: 0.38,
    base: "#b0692e",
    dark: "#5e3216",
    seed: 9,
    hoops: [0.08, 0.28, 0.72, 0.92],
    bung: { f: 0.4, dir: [0.5, 0, 1] },
  });
  const s2Body = barrel({
    id: "caskS2",
    c: [-0.84, FT + 0.4, 0.9],
    axis: [0, 1, 0],
    H: 0.8,
    rE: 0.26,
    rM: 0.34,
    base: "#98582a",
    dark: "#4b2812",
    seed: 13,
    hoops: [0.08, 0.3, 0.72, 0.92],
    open: true,
  });
  const S1TOP = FT + 0.92 - 0.045;
  b.decal(s1Body, tBrandHop, { at: [-0.84 + 0.14, FT + 0.5, 0.12 + 0.36], dir: [0.38, 0, 0.92], size: [0.3, 0.3], up: [0, 1, 0] });
  b.decal(s2Body, tBrandMug, { at: [-0.84 + 0.13, FT + 0.42, 0.9 + 0.31], dir: [0.4, 0, 0.9], size: [0.28, 0.28], up: [0, 1, 0] });
  // ale inside the open cask, plus a ladle
  cyl("caskS2", "ale", AMBER, 0.215, 0.215, 0.012, 14, mat([-0.84, FT + 0.8 - 0.085, 0.9]));
  for (const [dx, dz, r] of [[0.05, 0.04, 0.03], [-0.09, -0.05, 0.022], [0.1, -0.08, 0.018], [-0.05, 0.1, 0.02]] as const)
    sph("caskS2", "foam", FOAM, r, 6, 4, mul(mat([-0.84 + dx, FT + 0.8 - 0.08, 0.9 + dz]), mat([0, 0, 0], [0, 0, 0], [1, 0.5, 1])));
  sph("ladle", "bowl", PEWTER, 0.05, 8, 5, mul(mat([-0.97, FT + 0.74, 0.93]), mat([0, 0, 0], [0, 0, 0], [1, 0.6, 1])));
  rod("ladle", "wood", WOOD_LIGHT, [-0.96, FT + 0.76, 0.94], [-0.6, FT + 1.0, 0.7], 0.012, 6);
  sph("ladle", "hook", WOOD_LIGHT, 0.018, 5, 3, mat([-0.6, FT + 1.0, 0.7]));
  // lid leaning on the open cask
  put("lid", "wood", WOOD_LIGHT, new THREE.CylinderGeometry(0.245, 0.245, 0.04, 14), mul(mat([-0.46, FT + 0.245, 0.97]), mat([0, 0, 0], [0, 0, 90 - 7])));
  put("lid", "band", IRON, new THREE.BoxGeometry(0.02, 0.025, 0.49), mul(mat([-0.436, FT + 0.245, 0.97]), mat([0, 0, 0], [0, 0, -7])));
  put("lid", "ring", STEEL, new THREE.TorusGeometry(0.05, 0.008, 4, 10), mul(mat([-0.43, FT + 0.245, 0.97]), mat([0, 0, 0], [0, 90, -7])));

  // ---- keg rack at the back wall: three kegs on cradles with brass taps ----
  const KM = 0.19;
  const kegY0 = FT + 0.08 + KM;
  const kegX = [0.8, 1.18];
  const kegZ = -0.85;
  for (const z of [-1.0, -0.7]) box("rack", "rail", W_DARK, [0.88, 0.08, 0.075], mat([1.0, FT + 0.04, z]));
  for (const x of [0.575, 1.4]) {
    box("rack", "post", W_DARK, [0.05, 0.5, 0.3], mat([x, FT + 0.25, kegZ]));
    box("rack", "cap", IRON, [0.07, 0.03, 0.32], mat([x, FT + 0.505, kegZ]));
  }
  const kegSpecs = [
    { id: "kegA", x: kegX[0], y: kegY0, base: "#b87a3a", dark: "#663a1a", seed: 21, tex: tBrandHop },
    { id: "kegB", x: kegX[1], y: kegY0, base: "#a46a30", dark: "#5a3216", seed: 23, tex: tBrandMug },
    { id: "kegC", x: (kegX[0] + kegX[1]) / 2, y: kegY0 + Math.sqrt((2 * KM) ** 2 - ((kegX[1] - kegX[0]) / 2) ** 2), base: "#c28645", dark: "#6e4020", seed: 25, tex: tBrandWheat },
  ];
  const kegHeadZ = kegZ + 0.25;
  kegSpecs.forEach((k, i) => {
    barrel({
      id: k.id,
      c: [k.x, k.y, kegZ],
      axis: [0, 0, 1],
      H: 0.5,
      rE: 0.15,
      rM: KM,
      base: k.base,
      dark: k.dark,
      seed: k.seed,
      hoops: [0.09, 0.3, 0.7, 0.91],
      brand: i === 2 ? { tex: k.tex, end: 1, size: 0.2, up: [0, 1, 0] } : undefined,
    });
    // brass tap on the head
    const tx = k.x;
    const ty = k.y - (i === 2 ? 0.02 : 0.045);
    const tz = kegHeadZ - 0.03;
    cyl(k.id, "tapPipe", BRASS, 0.017, 0.017, 0.11, 8, mul(mat([tx, ty, tz + 0.05]), mat([0, 0, 0], [90, 0, 0])));
    cyl(k.id, "tapFlange", BRASS, 0.038, 0.038, 0.015, 8, mul(mat([tx, ty, tz - 0.004]), mat([0, 0, 0], [90, 0, 0])));
    cyl(k.id, "tapSpout", BRASS, 0.014, 0.01, 0.05, 8, mat([tx, ty - 0.022, tz + 0.09]));
    cyl(k.id, "tapStem", BRASS, 0.012, 0.012, 0.05, 8, mat([tx, ty + 0.03, tz + 0.05]));
    sph(k.id, "tapNut", BRASS, 0.02, 6, 4, mat([tx, ty, tz + 0.105]));
    const jn = bones[`tap${i}`] ?? (bones[`tap${i}`] = b.joint(`tap${i}`, { parent: root, at: [tx, ty + 0.055, tz + 0.05], dir: [0, 1, 0], role: "hinge" }));
    box(k.id, "lever", BRASS, [0.012, 0.07, 0.022], mat([tx, ty + 0.09, tz + 0.05]), `tap${i}`);
    sph(k.id, "knob", W_DARK, 0.022, 6, 4, mat([tx, ty + 0.13, tz + 0.05]), `tap${i}`);
    b.pose(jn, { axis: [1, 0, 0], deg: i === 1 ? 52 : i === 0 ? 8 : 0 });
  });
  // drip under the poured tap + small catch cup
  cyl("catch", "wood", WOOD_MUG, 0.075, 0.062, 0.09, 10, mat([kegX[1], FT + 0.045, kegHeadZ + 0.08]));
  cyl("catch", "ale", AMBER, 0.06, 0.06, 0.01, 10, mat([kegX[1], FT + 0.083, kegHeadZ + 0.08]));
  cyl("catch", "foam", FOAM, 0.05, 0.05, 0.012, 10, mat([kegX[1], FT + 0.092, kegHeadZ + 0.08]));
  // keg chalk tally on the front of the rack post
  box("tally", "chalk", "#efe9d8", [0.004, 0.12, 0.02], mat([0.575 - 0.0, FT + 0.34, kegZ + 0.17]));

  // =============================================================================================================
  // CRATES
  // =============================================================================================================
  const crate = (o: { id: string; x: number; z: number; y0: number; s: number; hs: number; rot: number; lid?: "closed" | "open"; art?: Tex; artSize?: V }) => {
    const M = mat([o.x, o.y0, o.z], [0, o.rot, 0]);
    const L = (pos: V, rot: V = [0, 0, 0]) => mul(M, mat(pos, rot));
    const { s, hs } = o;
    const bh = (hs - 0.02) / 3;
    const len = s - 0.1;
    const sides: Array<{ pos: (y: number) => V; rot: V }> = [
      { pos: (y) => [0, y, s / 2 - 0.025], rot: [0, 0, 0] },
      { pos: (y) => [0, y, -s / 2 + 0.025], rot: [0, 0, 0] },
      { pos: (y) => [s / 2 - 0.025, y, 0], rot: [0, 90, 0] },
      { pos: (y) => [-s / 2 + 0.025, y, 0], rot: [0, 90, 0] },
    ];
    sides.forEach((sd, si) => {
      for (let r = 0; r < 3; r++) {
        const y = 0.015 + bh * (r + 0.5) + 0.01;
        const v = Math.floor(R() * 3);
        box(o.id, `w${v}`, W_CRATE[v], [len, bh - 0.012, 0.03], L(sd.pos(y), sd.rot));
        for (const e of [-1, 1]) {
          const lp = sd.pos(y);
          const off: V = si < 2 ? [e * (len / 2 - 0.03), 0, 0.017] : [0, 0, e * (len / 2 - 0.03)];
          const sgn = si === 0 || si === 2 ? 1 : -1;
          const np: V = si < 2 ? [lp[0] + off[0], lp[1], lp[2] + sgn * 0.017] : [lp[0] + sgn * 0.017, lp[1], lp[2] + off[2]];
          sph(o.id, "nail", STEEL, 0.008, 4, 3, L(np));
        }
      }
      // diagonal brace on the back and both sides
      if (si !== 0) {
        const dd = Math.hypot(len - 0.04, hs - 0.1);
        const ang = Math.atan2(hs - 0.1, len - 0.04) / DEG;
        const out = sd.pos(hs / 2);
        const sgn = si === 1 || si === 3 ? -1 : 1;
        const bp: V = si < 2 ? [out[0], out[1], out[2] + sgn * 0.02] : [out[0] + sgn * 0.02, out[1], out[2]];
        box(o.id, "brace", W_DARK, [dd, 0.06, 0.016], L(bp, [0, sd.rot[1], ang]));
      }
    });
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        box(o.id, "post", W_DARK, [0.06, hs, 0.06], L([sx * (s / 2 - 0.03), hs / 2, sz * (s / 2 - 0.03)]));
        // iron corner straps (top and bottom)
        for (const yy of [0.075, hs - 0.075]) {
          box(o.id, "strapA", IRON, [0.066, 0.12, 0.012], L([sx * (s / 2 - 0.03), yy, sz * (s / 2 + 0.002)]));
          box(o.id, "strapB", IRON, [0.012, 0.12, 0.066], L([sx * (s / 2 + 0.002), yy, sz * (s / 2 - 0.03)]));
          sph(o.id, "rivet", STEEL, 0.01, 5, 3, L([sx * (s / 2 - 0.03), yy, sz * (s / 2 + 0.009)]));
          sph(o.id, "rivet", STEEL, 0.01, 5, 3, L([sx * (s / 2 + 0.009), yy, sz * (s / 2 - 0.03)]));
        }
      }
    box(o.id, "floor", W_CRATE[1], [s - 0.06, 0.03, s - 0.06], L([0, 0.015, 0]));
    // hand-hold slots on the sides
    for (const sx of [-1, 1]) box(o.id, "slot", "#1d1007", [0.014, 0.05, 0.17], L([sx * (s / 2 - 0.006), hs * 0.6, 0]));
    if (o.lid === "closed") {
      const pw = (s - 0.02) / 5;
      for (let i = 0; i < 5; i++) {
        const v = Math.floor(R() * 3);
        box(o.id, `lid${v}`, W_CRATE[v], [pw - 0.006, 0.03, s], L([-s / 2 + 0.01 + pw / 2 + i * pw, hs + 0.015, 0]));
      }
      for (const z of [-1, 1]) box(o.id, "batten", W_DARK, [s, 0.026, 0.07], L([0, hs + 0.043, z * (s / 2 - 0.1)]));
      for (const z of [-1, 1]) for (const x of [-1, 1]) sph(o.id, "lidNail", STEEL, 0.009, 4, 3, L([x * (s / 2 - 0.05), hs + 0.058, z * (s / 2 - 0.1)]));
    }
    if (o.art) {
      const sz = o.artSize ?? [s * 0.68, s * 0.4, 0];
      const pos = new THREE.Vector3(0, hs * 0.5 + 0.0, s / 2 - 0.006).applyMatrix4(M);
      const dir = new THREE.Vector3(0, 0, 1).applyQuaternion(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, o.rot * DEG, 0)));
      b.part(new THREE.PlaneGeometry(sz[0], sz[1]), "#ffffff", { bone: root, at: pos, dir, axis: "z", up: [0, 1, 0], texture: o.art, name: `${o.id}_stencil` });
    }
    return M;
  };
  crate({ id: "crateA", x: 1.0, z: 1.0, y0: FT, s: 0.64, hs: 0.62, rot: 0.1, lid: "closed", art: tCrate });
  crate({ id: "crateB", x: 1.02, z: 1.02, y0: FT + 0.62 + 0.06, s: 0.42, hs: 0.36, rot: -0.3, lid: "closed", art: tCrate2, artSize: [0.3, 0.18, 0] });
  // shipping tag on crate A
  b.part(new THREE.PlaneGeometry(0.07, 0.105), "#ffffff", { bone: root, at: [0.8, FT + 0.27, 1.33], dir: [0.1, 0, 1], axis: "z", up: [0, 1, 0], texture: tTag, name: "tag" });
  rod("tagString", "twine", ROPE, [0.8, FT + 0.33, 1.32], [0.79, FT + 0.318, 1.33], 0.004, 4);

  // ---- open crate of bottles with the lid thrown back on a hinge ----
  const C3 = { x: 0.3, z: 1.1, s: 0.56, hs: 0.3 };
  const c3M = crate({ id: "crateC", x: C3.x, z: C3.z, y0: FT, s: C3.s, hs: C3.hs, rot: 0.0 });
  const lidJ = b.joint("crateLid", { parent: root, at: [C3.x, FT + C3.hs + 0.02, C3.z - C3.s / 2 + 0.02], dir: [0, 0, 1], role: "hinge" });
  bones.crateLid = lidJ;
  {
    const pw = (C3.s - 0.02) / 5;
    for (let i = 0; i < 5; i++)
      box("crateLid", "plank", W_CRATE[i % 3], [pw - 0.006, 0.03, C3.s], mat([C3.x - C3.s / 2 + 0.01 + pw / 2 + i * pw, FT + C3.hs + 0.025, C3.z + 0.02]), "crateLid");
    for (const x of [-1, 1]) box("crateLid", "batten", W_DARK, [0.07, 0.026, C3.s], mat([C3.x + x * (C3.s / 2 - 0.1), FT + C3.hs + 0.053, C3.z + 0.02]), "crateLid");
    for (const x of [-1, 1]) box("crateLid", "hinge", IRON, [0.09, 0.012, 0.2], mat([C3.x + x * 0.17, FT + C3.hs + 0.07, C3.z - C3.s / 2 + 0.12]), "crateLid");
    b.pose(lidJ, { axis: [1, 0, 0], deg: -112 });
  }
  // bottles in the open crate
  const bottleGeo = () => {
    const pts = [
      [0, 0],
      [0.045, 0],
      [0.048, 0.012],
      [0.048, 0.2],
      [0.035, 0.26],
      [0.017, 0.3],
      [0.017, 0.37],
      [0.021, 0.375],
      [0.021, 0.39],
      [0, 0.39],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 8);
  };
  const glass = ["#2f8a4a", "#3a6fb0", "#c77a1e"];
  let bi = 0;
  for (const bz of [-0.1, 0.1])
    for (const bx of [-0.15, 0, 0.15]) {
      const col = glass[bi % 3];
      const tilt: V = [(R() - 0.5) * 8, 0, (R() - 0.5) * 8];
      put("bottles", `glass${bi % 3}`, col, bottleGeo(), L2(c3M, [bx, 0.05, bz], tilt));
      cyl("bottles", "cork", "#d2a265", 0.014, 0.017, 0.035, 6, L2(c3M, [bx, 0.05 + 0.41, bz], tilt));
      bi++;
    }
  function L2(M: THREE.Matrix4, pos: V, rot: V) {
    return mul(M, mat(pos, rot));
  }
  // straw in the crate
  for (let i = 0; i < 46; i++) {
    const a = R() * Math.PI * 2;
    const rr = Math.sqrt(R()) * 0.22;
    box("straw", "hay", HAY, [0.008, 0.2 + R() * 0.1, 0.008], mat([C3.x + Math.cos(a) * rr, FT + 0.22 + R() * 0.06, C3.z + Math.sin(a) * rr], [(R() - 0.5) * 80, R() * 360, (R() - 0.5) * 80]));
  }
  // loose straw on the floor around the crates
  for (let i = 0; i < 34; i++) {
    const a = R() * Math.PI * 2;
    const rr = 0.3 + R() * 0.25;
    box("floorStraw", "hay", HAY, [0.008, 0.007, 0.12 + R() * 0.06], mat([C3.x + Math.max(-0.9, Math.min(0.9, Math.cos(a) * rr)), FT + 0.006, Math.min(1.34, C3.z + Math.sin(a) * rr)], [0, R() * 360, 0]));
  }

  // =============================================================================================================
  // MUGS
  // =============================================================================================================
  const mug = (id: string, M: THREE.Matrix4, o: { paintC: Fill; ale?: number; foam?: boolean; band?: boolean; lid?: boolean }) => {
    const h = 0.15;
    const rb = 0.052;
    const rt = 0.062;
    const pts = [
      [0, 0],
      [rb, 0],
      [rt, h],
      [rt - 0.009, h],
      [rb - 0.008, 0.016],
      [0, 0.016],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    put(id, "body", o.paintC, new THREE.LatheGeometry(pts, 10), M);
    put(id, "handle", o.paintC, new THREE.TorusGeometry(0.04, 0.0085, 5, 8, Math.PI), mul(M, mat([0.055, h * 0.5, 0], [0, 0, -90], [1, 1.1, 1])));
    if (o.band !== false) {
      for (const f of [0.18, 0.82]) {
        const r = rb + (rt - rb) * f + 0.0045;
        put(id, "band", IRON, hoopGeo10(r - 0.006, r, f * h - 0.008, f * h + 0.008), M);
      }
    }
    if (o.ale) {
      const top = h * o.ale;
      const rr = rb + (rt - rb) * o.ale - 0.011;
      put(id, "ale", AMBER, new THREE.CylinderGeometry(rr, rr, 0.006, 10), mul(M, mat([0, top, 0])));
      if (o.foam) {
        put(id, "foam", FOAM, new THREE.SphereGeometry(rr + 0.004, 9, 5), mul(M, mat([0, top + 0.012, 0], [0, 0, 0], [1, 0.62, 1])));
        for (const [dx, dz, r] of [[0.03, 0.02, 0.016], [-0.025, 0.03, 0.014], [0.0, -0.035, 0.015]] as const)
          put(id, "foam", FOAM, new THREE.SphereGeometry(r, 6, 4), mul(M, mat([dx, top + 0.022, dz])));
      }
    }
    if (o.lid) {
      put(id, "lid", PEWTER, new THREE.CylinderGeometry(rt - 0.006, rt, 0.012, 10), mul(M, mat([0, h + 0.004, 0], [0, 0, 22])));
    }
  };
  const hoopGeo10 = (ri: number, ro: number, y0: number, y1: number) => {
    const pts = [
      [ri, y0],
      [ro, y0],
      [ro, y1],
      [ri, y1],
      [ri, y0],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 10);
  };

  // ---- S1 tabletop dressing ----
  const s1 = { x: -0.84, z: 0.12 };
  mug("mugS1a", mat([s1.x + 0.1, S1TOP, s1.z - 0.07], [0, 40, 0]), { paintC: WOOD_MUG, ale: 0.88, foam: true });
  mug("mugS1b", mat([s1.x + 0.07, S1TOP, s1.z + 0.14], [0, -20, 0]), { paintC: PEWTER, ale: 0.9, foam: true, lid: false, band: false });
  // plate with cheese
  cyl("plate", "pewter", PEWTER, 0.11, 0.09, 0.016, 12, mat([s1.x - 0.1, S1TOP + 0.008, s1.z + 0.1]));
  cyl("plate", "rim", PEWTER, 0.115, 0.115, 0.006, 12, mat([s1.x - 0.1, S1TOP + 0.017, s1.z + 0.1]));
  put("cheese", "yellow", CHEESE, new THREE.CylinderGeometry(0.085, 0.085, 0.07, 10, 1, false, 0, Math.PI / 2.2), mul(mat([s1.x - 0.1, S1TOP + 0.055, s1.z + 0.1], [0, 30, 0])));
  for (const [dx, dy, dz] of [[0.03, 0.01, 0.03], [0.05, -0.015, 0.0], [0.02, 0.02, 0.05]] as const)
    sph("cheese", "holes", "#d49a22", 0.011, 5, 3, mat([s1.x - 0.1 + dx - 0.0, S1TOP + 0.055 + dy, s1.z + 0.1 + dz * 1.0 - 0.0]));
  // knife
  box("knife", "blade", STEEL, [0.02, 0.008, 0.13], mat([s1.x - 0.02, S1TOP + 0.02, s1.z + 0.0], [0, 20, 0]));
  box("knife", "handle", W_DARK, [0.024, 0.016, 0.06], mat([s1.x - 0.04, S1TOP + 0.022, s1.z - 0.1], [0, 20, 0]));
  // candle in an iron stick, flame glows
  const cx = s1.x - 0.1;
  const cz = s1.z - 0.09;
  put("candle", "dish", IRON, new THREE.LatheGeometry([[0, 0], [0.07, 0], [0.075, 0.012], [0.04, 0.026], [0.03, 0.03], [0, 0.03]].map(([x, y]) => new THREE.Vector2(x, y)), 10), mat([cx, S1TOP, cz]));
  put("candle", "ring", IRON, new THREE.TorusGeometry(0.045, 0.006, 4, 10), mul(mat([cx, S1TOP + 0.02, cz]), mat([0, 0, 0], [90, 0, 0])));
  put("candle", "stem", IRON, new THREE.CylinderGeometry(0.01, 0.016, 0.04, 6), mat([cx, S1TOP + 0.045, cz]));
  put("candle", "wax", WAX, new THREE.CylinderGeometry(0.025, 0.028, 0.13, 8), mat([cx, S1TOP + 0.12, cz]));
  for (const [a, l] of [[0.5, 0.05], [2.8, 0.07], [4.4, 0.04]] as const)
    put("candle", "drip", WAX, new THREE.CapsuleGeometry(0.0055, l, 3, 5), mat([cx + Math.cos(a) * 0.026, S1TOP + 0.17 - l * 0.5, cz + Math.sin(a) * 0.026]));
  put("candle", "wick", "#2a1c14", new THREE.CylinderGeometry(0.0025, 0.0025, 0.02, 4), mat([cx, S1TOP + 0.195, cz]));
  glow(b.part(new THREE.SphereGeometry(0.02, 7, 5), "#ff9a2c", { bone: root, at: [cx, S1TOP + 0.222, cz], scale: [0.7, 1.7, 0.7], name: "flame" }), 1.4);
  glow(b.part(new THREE.SphereGeometry(0.012, 6, 4), "#fff2b0", { bone: root, at: [cx, S1TOP + 0.212, cz], scale: [0.7, 1.5, 0.7], name: "flameCore" }), 1.6);
  // dice and coins
  box("dice", "d1", "#f4eddc", [0.03, 0.03, 0.03], mat([s1.x + 0.19, S1TOP + 0.015, s1.z + 0.02], [0, 25, 0]));
  box("dice", "d2", "#f4eddc", [0.03, 0.03, 0.03], mat([s1.x + 0.215, S1TOP + 0.015, s1.z - 0.02], [0, -12, 0]));
  for (const [dx, dz] of [[0.0, -0.01], [0.0, 0.0], [0.01, 0.02]] as const) {
    sph("dice", "pip", "#7a1420", 0.0042, 4, 3, mat([s1.x + 0.19 + dx * 0.4, S1TOP + 0.031, s1.z + 0.02 + dz * 0.4]));
  }
  for (let i = 0; i < 4; i++)
    cyl("coins", "gold", BRASS, 0.017, 0.017, 0.004, 8, mat([s1.x + 0.19 + (i % 2) * 0.03 - 0.0, S1TOP + 0.002 + (i > 1 ? 0.004 : 0), s1.z - 0.1 + (i % 2) * 0.01 - 0.0], [(i - 1.5) * 4, i * 40, 0]));

  // ---- mug pegs on the back wall ----
  const pegY = 1.22;
  box("pegRail", "board", TIMBER_X, [0.82, 0.09, 0.04], mat([1.0, pegY, -1.27]));
  const pegXs = [0.66, 0.84, 1.02, 1.2, 1.37];
  pegXs.forEach((x, i) => {
    cyl("pegRail", "peg", W_DARK, 0.012, 0.014, 0.1, 6, mul(mat([x, pegY - 0.005, -1.22]), mat([0, 0, 0], [90, 0, 0])));
    sph("pegRail", "pegHead", W_DARK, 0.018, 6, 4, mat([x, pegY - 0.005, -1.17]));
    if (i < 4) {
      const paints = [WOOD_MUG, PEWTER, CLAY, WOOD_MUG];
      mug(`mugPeg${i}`, mat([x - 0.075, pegY - 0.005 - 0.0985, -1.22], [0, 0, 0]), { paintC: paints[i], band: i !== 2 });
      // twine so the mug hangs from its handle
    }
  });

  // ---- stool and its mug ----
  const st = { x: -0.12, z: 0.3 };
  const seatY = FT + 0.46;
  put("stool", "seat", WOOD_LIGHT, new THREE.LatheGeometry([[0, 0], [0.17, 0], [0.185, 0.015], [0.185, 0.035], [0.16, 0.05], [0, 0.05]].map(([x, y]) => new THREE.Vector2(x, y)), 12), mat([st.x, seatY - 0.05, st.z]));
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    rod("stool", "leg", W_DARK, [st.x + Math.cos(a) * 0.1, seatY - 0.04, st.z + Math.sin(a) * 0.1], [st.x + Math.cos(a) * 0.2, FT, st.z + Math.sin(a) * 0.2], 0.026, 6);
    const a2 = a + (Math.PI * 2) / 3;
    rod("stool", "rung", W_DARK, [st.x + Math.cos(a) * 0.155, FT + 0.17, st.z + Math.sin(a) * 0.155], [st.x + Math.cos(a2) * 0.155, FT + 0.17, st.z + Math.sin(a2) * 0.155], 0.014, 5);
  }
  mug("mugStool", mat([st.x + 0.02, seatY, st.z], [0, -35, 0]), { paintC: WOOD_MUG, ale: 0.55, foam: false });
  // gilded trophy stein on top of the stack, a loaf and a mug on the crates
  const TOPY = yTop + 0.38 - 0.012;
  const steinZ = -0.5;
  mug("steinTop", mat([-0.39, TOPY, steinZ], [0, -35, 0], 1.4), { paintC: BRASS_P, ale: 0.85, foam: true, band: true });
  put("steinTop", "lid", BRASS_P, new THREE.CylinderGeometry(0.058, 0.066, 0.014, 10), mat([-0.39, TOPY + 0.216, steinZ], [0, -35, 38]));
  sph("steinTop", "gem", "#c0392b", 0.02, 6, 4, mat([-0.39, TOPY + 0.238, steinZ]));
  {
    const bx = 0.98;
    const bz = 1.0;
    const by = FT + 0.68 + 0.36 + 0.056;
    put("loaf", "crust", "#c9893a", new THREE.SphereGeometry(0.1, 9, 6), mat([bx - 0.06, by + 0.03, bz + 0.05], [0, 30, 0], [1.7, 0.7, 0.9]));
    for (const k of [-1, 0, 1]) put("loaf", "slash", "#f0cf8c", new THREE.BoxGeometry(0.012, 0.004, 0.08), mat([bx - 0.06 + k * 0.055, by + 0.083, bz + 0.05], [0, 30, 60]));
    mug("mugCrate", mat([bx + 0.1, by, bz - 0.06], [0, 80, 0]), { paintC: CLAY, ale: 0.8, foam: true, band: false });
  }

  // ---- spilled mug, puddle and mouse ----
  const spill = mul(mat([0.44, FT + 0.062, 0.56], [0, -60, 0]), new THREE.Matrix4().makeRotationX(90 * DEG), new THREE.Matrix4().makeRotationY(90 * DEG));
  mug("mugSpill", spill, { paintC: WOOD_MUG });
  b.extrude(
    [
      [0, 0.0],
      [0.1, -0.03],
      [0.16, 0.02],
      [0.19, 0.1],
      [0.12, 0.17],
      [0.03, 0.15],
      [-0.05, 0.08],
      [-0.03, 0.01],
    ],
    { at: [0.2, FT + 0.003, 0.42], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.004, smoothing: 2, color: "#b8721a", bone: root, name: "puddle" },
  );
  b.extrude(
    [
      [0, 0.0],
      [0.06, -0.01],
      [0.09, 0.03],
      [0.04, 0.07],
      [-0.01, 0.04],
    ],
    { at: [0.26, FT + 0.0065, 0.47], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.003, smoothing: 2, color: "#e8a53a", bone: root, name: "puddleSheen" },
  );
  // mouse sipping the spill
  {
    const mp = new THREE.Matrix4().compose(new THREE.Vector3(0.33, FT, 0.73), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, (-155 * DEG), 0)), new THREE.Vector3(1, 1, 1));
    const ML = (pos: V, rot: V = [0, 0, 0], sc: V | number = 1) => mul(mp, mat(pos, rot, sc));
    sph("mouse", "body", FLESH, 0.05, 8, 6, ML([0, 0.04, 0], [0, 0, 0], [0.8, 0.78, 1.35]));
    sph("mouse", "head", FLESH, 0.03, 7, 5, ML([0, 0.04, 0.075], [14, 0, 0], [0.85, 0.85, 1.15]));
    sph("mouse", "nose", PINK, 0.009, 5, 4, ML([0, 0.036, 0.108]));
    for (const s of [-1, 1]) {
      cyl("mouse", "ear", PINK, 0.018, 0.018, 0.004, 7, ML([s * 0.026, 0.07, 0.062], [0, 0, s * 70]));
      sph("mouse", "eye", "#120c10", 0.0055, 4, 3, ML([s * 0.018, 0.05, 0.092]));
      sph("mouse", "paw", PINK, 0.009, 4, 3, ML([s * 0.03, 0.009, 0.09]));
      sph("mouse", "foot", PINK, 0.011, 4, 3, ML([s * 0.04, 0.009, -0.03], [0, 0, 0], [0.8, 0.6, 1.5]));
      for (const k of [-1, 1]) rod("mouse", "whisker", "#d8d0c8", [s * 0.012, 0.04 + k * 0.004, 0.1], [s * 0.05, 0.04 + k * 0.016, 0.12], 0.0012, 3);
    }
    const tail = catmull(
      [new THREE.Vector3(0, 0.035, -0.06), new THREE.Vector3(0.02, 0.02, -0.12), new THREE.Vector3(-0.02, 0.01, -0.18), new THREE.Vector3(0, 0.006, -0.24)].map((p) => p.applyMatrix4(mp)),
    );
    b.sweep(tail, [0.007, 0.002], { color: PINK, bone: root, sides: 5, name: "mouseTail" });
  }

  // =============================================================================================================
  // SACKS, ROPE, BUCKET, HOPS
  // =============================================================================================================
  const sack = (id: string, x: number, z: number, r: number, yaw: number, art?: Tex) => {
    const body = b.part(new THREE.SphereGeometry(r, 10, 7), BURLAP, { bone: root, at: [x, FT + r * 0.8, z], scale: [1.12, 0.9, 0.92], rotation: [0, yaw, 0], name: id });
    if (art) b.decal(body, art, { at: [x, FT + r * 0.8, z + r * 0.85], dir: [Math.sin(yaw * DEG), 0, Math.cos(yaw * DEG)], size: [r, r * 0.7], up: [0, 1, 0] });
    const nk = mat([x, FT + r * 0.8 + r * 0.72, z], [0, yaw, 0]);
    put(id, "neck", BURLAP, new THREE.CylinderGeometry(r * 0.5, r * 0.62, r * 0.4, 8), nk);
    put(id, "frill", BURLAP, new THREE.CylinderGeometry(r * 0.78, r * 0.45, r * 0.45, 8), mul(nk, mat([0, r * 0.32, 0], [4, 0, -6])));
    put(id, "tie", ROPE, new THREE.TorusGeometry(r * 0.52, r * 0.07, 5, 10), mul(nk, mat([0, r * 0.06, 0], [90, 0, 0])));
    for (const s of [-1, 1]) put(id, "seam", "#6a4c26", new THREE.BoxGeometry(0.006, r * 0.9, 0.006), mul(mat([x, FT + r * 0.8, z], [0, yaw, 0]), mat([s * r * 0.5, 0, r * 0.82], [0, 0, 0])));
  };
  sack("sackA", 1.2, 0.3, 0.2, -25, tSack);
  sack("sackB", 1.22, -0.14, 0.15, 30);
  cyl("grain", "heap", GRAIN, 0.02, 0.13, 0.05, 9, mat([1.05, FT + 0.025, 0.58]));
  for (let i = 0; i < 14; i++) sph("grain", "kern", GRAIN, 0.008, 4, 3, mat([1.05 + (R() - 0.5) * 0.4, FT + 0.006, 0.58 + (R() - 0.2) * 0.25], [0, 0, 0], [1.4, 0.8, 1]));

  // rope coil
  const coil = spiral([-0.22, FT + 0.02, 1.12], [-0.02, FT + 0.02, 1.12], [0, 1, 0], { turns: 3.6, r1: 0.13, pitch: 0.036 });
  b.sweep(coil, 0.02, { color: ROPE, bone: root, sides: 6, name: "ropeCoil" });
  b.sweep(catmull([[-0.02, FT + 0.02, 1.12], [0.0, FT + 0.02, 1.2], [-0.05, FT + 0.018, 1.32], [-0.2, FT + 0.018, 1.38]]), 0.018, { color: ROPE, bone: root, sides: 6, name: "ropeTail" });

  // bucket with a ladle of water
  {
    const bx = -0.22;
    const bz = 0.7;
    put("bucket", "body", WOOD_MUG, new THREE.LatheGeometry([[0, 0], [0.1, 0], [0.135, 0.22], [0.125, 0.22], [0.092, 0.012], [0, 0.012]].map(([x, y]) => new THREE.Vector2(x, y)), 10), mat([bx, FT, bz]));
    for (const f of [0.2, 0.78]) {
      const r = 0.1 + 0.035 * f + 0.003;
      put("bucket", "band", IRON, hoopGeo10(r - 0.004, r + 0.012, f * 0.22 - 0.016, f * 0.22 + 0.016), mat([bx, FT, bz]));
    }
    cyl("bucket", "water", "#4e93b8", 0.115, 0.115, 0.006, 10, mat([bx, FT + 0.178, bz]));
    put("bucket", "handle", IRON, new THREE.TorusGeometry(0.133, 0.0065, 4, 12, Math.PI), mul(mat([bx, FT + 0.215, bz], [0, 15, 12])));
    for (const s of [-1, 1]) sph("bucket", "ear", STEEL, 0.014, 5, 3, mat([bx + s * 0.131, FT + 0.215, bz]));
  }
  // hop bundles hanging from the side plate
  for (const z of [0.95, 1.18]) {
    rod("hops", "string", ROPE, [-1.245, 2.04, z], [-1.22, 1.94, z], 0.004, 3);
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const rr = 0.028 * (i % 2 ? 0.5 : 1);
      const y = 1.94 - 0.04 - (i % 3) * 0.035;
      put("hops", i % 2 ? "g1" : "g2", i % 2 ? GREEN_H1 : GREEN_H2, new THREE.ConeGeometry(0.03, 0.1, 6), mul(mat([-1.22 + Math.cos(a) * rr, y, z + Math.sin(a) * rr], [180, 0, 0])));
    }
  }

  // =============================================================================================================
  // LANTERN, SIGN, BANNER, SHELF, CHALKBOARD, POSTER, WEB
  // =============================================================================================================
  // lantern arm on the back wall, bolted to post A
  {
    const ax = 0.47;
    const ay = 1.98;
    box("lanternArm", "plate", IRON, [0.1, 0.22, 0.02], mat([ax, ay - 0.06, -1.24]));
    for (const dy of [-0.1, 0.04]) sph("lanternArm", "bolt", STEEL, 0.012, 5, 3, mat([ax, ay + dy - 0.06, -1.228]));
    rod("lanternArm", "iron", IRON, [ax, ay, -1.24], [ax, ay, -0.86], 0.014, 6);
    rod("lanternArm", "strut", IRON, [ax, ay - 0.2, -1.24], [ax, ay - 0.005, -0.98], 0.011, 6);
    put("lanternArm", "scroll", IRON, new THREE.TorusGeometry(0.06, 0.007, 4, 12, Math.PI * 1.4), mul(mat([ax, ay - 0.075, -1.1], [0, 90, 0]), mat([0, 0, 0], [0, 0, 20])));
    sph("lanternArm", "tip", IRON, 0.02, 6, 4, mat([ax, ay, -0.855]));
    const lz = -0.855;
    const ly = 1.42;
    const LM = mat([ax, ly, lz], [0, 0, 0], 1.4);
    const LL = (pos: V, rot: V = [0, 0, 0]) => mul(LM, mat(pos, rot));
    // chain from the arm tip down to the lantern ring
    const ringTop = ly + 0.325 * 1.4;
    const links = Math.ceil((ay - 0.012 - ringTop) / 0.03) + 1;
    for (let i = 0; i < links; i++)
      put("lanternChain", "link", IRON, new THREE.TorusGeometry(0.014, 0.0035, 4, 8), matQ(new THREE.Vector3(ax, ay - 0.012 - i * 0.03, lz), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, (i % 2) * Math.PI * 0.5, 0)), [1, 1.6, 1]));
    put("lantern", "base", IRON, new THREE.LatheGeometry([[0, 0], [0.075, 0], [0.088, 0.02], [0.07, 0.034], [0, 0.034]].map(([x, y]) => new THREE.Vector2(x, y)), 6), LL([0, 0, 0]));
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      box("lantern", "bar", IRON, [0.012, 0.185, 0.012], LL([Math.cos(a) * 0.07, 0.125, Math.sin(a) * 0.07]));
    }
    put("lantern", "roof", IRON, new THREE.ConeGeometry(0.115, 0.075, 6), LL([0, 0.25, 0]));
    put("lantern", "capRing", IRON, new THREE.CylinderGeometry(0.09, 0.09, 0.016, 6), LL([0, 0.215, 0]));
    put("lantern", "ring", IRON, new THREE.TorusGeometry(0.028, 0.006, 4, 8), LL([0, 0.305, 0], [90, 0, 0]));
    put("lantern", "finial", BRASS, new THREE.SphereGeometry(0.013, 5, 4), LL([0, 0.29, 0]));
    glow(b.part(new THREE.CylinderGeometry(0.062, 0.068, 0.18, 6), "#ffb347", { bone: root, at: [ax, ly + 0.125 * 1.4, lz], scale: 1.4, name: "lanternGlass" }), 1.3);
  }

  // hanging sign on a bracket arm from the side wall
  {
    const sy = 1.96;
    const sz = 0.57;
    box("signArm", "plate", IRON, [0.02, 0.2, 0.1], mat([-1.225, sy - 0.07, sz]));
    for (const dy of [-0.14, 0.0]) sph("signArm", "bolt", STEEL, 0.012, 5, 3, mat([-1.213, sy + dy - 0.07, sz]));
    rod("signArm", "iron", IRON, [-1.225, sy, sz], [-0.62, sy, sz], 0.016, 6);
    rod("signArm", "strut", IRON, [-1.225, sy - 0.26, sz], [-0.95, sy - 0.01, sz], 0.012, 6);
    put("signArm", "scroll", IRON, new THREE.TorusGeometry(0.075, 0.008, 4, 12, Math.PI * 1.5), mul(mat([-1.07, sy - 0.1, sz], [0, 0, 0]), mat([0, 0, 0], [0, 0, 10])));
    sph("signArm", "tip", BRASS, 0.025, 6, 4, mat([-0.605, sy, sz]));
    const sj = b.joint("sign", { parent: root, at: [-0.98, sy, sz], dir: [0, -1, 0], role: "hinge" });
    bones.sign = sj;
    const bw = 0.56;
    const bh = 0.4;
    const by = sy - 0.12 - bh / 2;
    const bx = -0.98;
    for (const e of [-1, 1]) {
      for (let i = 0; i < 3; i++)
        put("signChain", "link", IRON, new THREE.TorusGeometry(0.012, 0.003, 4, 8), matQ(new THREE.Vector3(bx + e * 0.2, sy - 0.02 - i * 0.04, sz), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, (i % 2) * Math.PI * 0.5, 0)), [1, 1.6, 1]), "sign");
    }
    put("signBoard", "frame", W_DARK, new THREE.BoxGeometry(bw, bh, 0.05), mat([bx, by, sz]), "sign");
    for (const e of [-1, 1]) sph("signBoard", "eyelet", BRASS, 0.014, 5, 3, mat([bx + e * 0.2, by + bh / 2 + 0.005, sz]), "sign");
    for (const zz of [1, -1])
      b.part(new THREE.PlaneGeometry(bw - 0.03, bh - 0.03), "#ffffff", {
        bone: sj,
        at: [bx, by, sz + zz * 0.032],
        dir: [0, 0, zz],
        axis: "z",
        up: [0, 1, 0],
        texture: tSign,
        name: zz > 0 ? "signFront" : "signBack",
      });
  }

  // banner on the side wall
  {
    const bz = -0.55;
    const bw = 0.42;
    const bh = 0.78;
    const top = 2.0;
    rod("banner", "pole", W_DARK, [-1.24, top, bz - 0.28], [-1.24, top, bz + 0.28], 0.016, 6);
    for (const e of [-1, 1]) {
      sph("banner", "finial", BRASS, 0.026, 6, 4, mat([-1.24, top, bz + e * 0.29]));
      rod("banner", "cord", ROPE, [-1.27, top + 0.1, bz + e * 0.2], [-1.24, top, bz + e * 0.2], 0.004, 3);
    }
    rod("banner", "cordTop", ROPE, [-1.27, top + 0.1, bz - 0.2], [-1.27, top + 0.1, bz + 0.2], 0.004, 3);
    b.part(new THREE.PlaneGeometry(bw, bh), "#ffffff", { bone: root, at: [-1.285 + 0.0, top - bh / 2 - 0.02, bz], dir: [1, 0, 0], axis: "z", up: [0, 1, 0], texture: tBanner, name: "banner" });
    for (let i = 0; i < 4; i++) {
      const tz = bz - 0.15 + i * 0.1;
      rod("banner", "tassel", BRASS, [-1.28, top - bh - 0.0 + 0.1 - (i % 2) * 0.02, tz], [-1.28, top - bh - 0.06 - (i % 2) * 0.02, tz], 0.007, 4);
    }
  }

  // wall shelf with bottles above the keg rack
  {
    const sy = 1.6;
    box("shelf", "board", WOOD_LIGHT, [0.78, 0.04, 0.22], mat([1.0, sy, -1.17]));
    for (const x of [0.68, 1.32]) {
      b.extrude(
        [
          [0, 0],
          [0.18, 0],
          [0, 0.18],
        ],
        { at: [x, sy - 0.02 - 0.18, -1.28], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.03, color: IRON, bone: root, name: `shelfBracket${x}` },
      );
    }
    const cols = ["#2f8a4a", "#3a6fb0", "#c77a1e", "#8a2a4a"];
    const bxs = [0.78, 0.9, 1.12, 1.26];
    bxs.forEach((x, i) => {
      put("shelfBottles", `g${i}`, cols[i], bottleGeo(), mat([x, sy + 0.02, -1.15], [0, 0, 0], 0.78));
      cyl("shelfBottles", "cork", "#d2a265", 0.011, 0.013, 0.028, 6, mat([x, sy + 0.02 + 0.31, -1.15]));
    });
    mug("mugShelf", mat([1.01, sy + 0.02, -1.17], [0, 70, 0]), { paintC: PEWTER, band: false });
    cyl("shelfPlate", "clay", CLAY, 0.1, 0.07, 0.02, 12, mul(mat([1.0, sy + 0.12, -1.27]), mat([0, 0, 0], [90, 0, 0])));
    put("shelfPlate", "rim", CLAY, new THREE.TorusGeometry(0.095, 0.01, 4, 12), mat([1.0, sy + 0.12, -1.265]));
  }

  // chalkboard on the back wall
  {
    const cw = 0.78;
    const ch = 0.4;
    const cxx = -0.26;
    const cyy = 1.82;
    box("chalk", "frame", W_DARK, [cw + 0.08, ch + 0.08, 0.04], mat([cxx, cyy, -1.265]));
    b.part(new THREE.PlaneGeometry(cw, ch), "#ffffff", { bone: root, at: [cxx, cyy, -1.243], dir: [0, 0, 1], axis: "z", up: [0, 1, 0], texture: tChalk, name: "chalkboard" });
    box("chalk", "ledge", W_DARK, [0.5, 0.02, 0.05], mat([cxx, cyy - ch / 2 - 0.05, -1.24]));
    box("chalk", "stick", "#f1efe4", [0.05, 0.012, 0.012], mat([cxx + 0.1, cyy - ch / 2 - 0.034, -1.235], [0, 15, 0]));
  }

  // wanted poster beside the banner on the side wall
  b.part(new THREE.PlaneGeometry(0.2, 0.27), "#ffffff", { bone: root, at: [-1.285, 1.28, -0.1], dir: [1, 0, 0], axis: "z", up: [0, 1, 0], texture: tPoster, name: "poster" });
  for (const dy of [0.115]) sph("poster", "pin", "#c0392b", 0.012, 5, 3, mat([-1.27, 1.28 + dy, -0.1]));

  // crossed axes on a plaque above the open cask
  {
    const pc: V = [-1.275, 1.38, 0.98];
    put("plaque", "wood", W_DARK, new THREE.CylinderGeometry(0.2, 0.2, 0.03, 12), mul(mat(pc), mat([0, 0, 0], [0, 0, 90])));
    put("plaque", "rim", BRASS, new THREE.TorusGeometry(0.2, 0.011, 4, 16), mul(mat([pc[0] + 0.012, pc[1], pc[2]]), mat([0, 0, 0], [0, 90, 0])));
    const th = 38 * DEG;
    for (const s of [-1, 1]) {
      const d: V = [0, Math.cos(th), s * Math.sin(th)];
      const pp: V = [0, -s * Math.sin(th), Math.cos(th)];
      const start: V = [pc[0] + 0.025, pc[1] - d[1] * 0.3, pc[2] - d[2] * 0.3];
      const end: V = [start[0], start[1] + d[1] * 0.64, start[2] + d[2] * 0.64];
      rod("axes", "handle", WOOD_LIGHT, start, end, 0.014, 6);
      put("axes", "pommel", W_DARK, new THREE.SphereGeometry(0.02, 6, 4), mat(start));
      b.extrude(
        [
          [0.4, 0.0],
          [0.5, 0.0],
          [0.5, 0.045],
          [0.58, 0.16],
          [0.43, 0.1],
          [0.4, 0.05],
        ],
        { at: start, x: d, y: pp, thickness: 0.022, bevel: 0.005, smoothing: 0, color: STEELP, bone: root, name: `axeHead${s}` },
      );
      rod("axes", "binding", ROPE, [start[0], start[1] + d[1] * 0.2, start[2] + d[2] * 0.2], [start[0], start[1] + d[1] * 0.3, start[2] + d[2] * 0.3], 0.018, 6);
    }
  }
  // the outside of the tavern wears its name too
  box("outerSign", "frameBack", W_DARK, [1.16, 0.36, 0.02], mat([-0.42, 1.45, -1.458]));
  b.part(new THREE.PlaneGeometry(1.1, 0.3), "#ffffff", { bone: root, at: [-0.42, 1.45, -1.475], dir: [0, 0, -1], axis: "z", up: [0, 1, 0], texture: tSignWide, name: "outerSignBack" });
  box("outerSign", "frameSide", W_DARK, [0.02, 0.56, 0.74], mat([-1.458, 1.45, -0.37]));
  b.part(new THREE.PlaneGeometry(0.68, 0.51), "#ffffff", { bone: root, at: [-1.475, 1.45, -0.37], dir: [-1, 0, 0], axis: "z", up: [0, 1, 0], texture: tSign, name: "outerSignSide" });

  // cobwebs in the upper corner
  b.part(new THREE.PlaneGeometry(0.46, 0.46), "#ffffff", { bone: root, at: [-1.0, 1.96, -1.285], dir: [0, 0, 1], axis: "z", up: [0, 1, 0], texture: tWeb, name: "webBack" });
  b.part(new THREE.PlaneGeometry(0.46, 0.46), "#ffffff", { bone: root, at: [-1.285, 1.96, -1.0], dir: [1, 0, 0], axis: "z", up: [0, 1, 0], texture: tWeb, name: "webSide" });

  flush();
  return b.root;
}
```

## Example: runestoneCircleSonnet

Brief: Category: Prop group.
Subject: ring of carved standing stones with glowing runes, bronze bands and crystal crowns around an altar with braziers and banners.
Style: Blizzard/Warcraft.
Topology: prop-group
Style family: blizzard-warcraft
Notable features: standing-stones, runes, crystals, braziers, altar

```ts
// Runestone circle: eight carved standing stones, glowing rune panels and crystal crowns around a stepped altar.
// Blizzard/Warcraft look: chunky bevelled slabs, hand-painted stone with moss and light-from-above gradients,
// worn bronze bands with rivets, saturated arcane cyan against warm gold, crimson cloth and fire.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";
import { frame } from "agentic-3js-builder";
import type { Frame } from "agentic-3js-builder";
import { DEG, aim, rng } from "agentic-3js-builder";
import { cells, grain, mix, noise, paint, smoothstep } from "agentic-3js-builder";
import { bezier, catmull } from "agentic-3js-builder";
import type { Joint } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Runestone Circle",
  description:
    "A ring of eight carved standing stones with glowing arcane runes, bronze bands and crystal crowns around a stepped altar with a floating crystal, braziers, banners and mossy ruins.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// Palette -------------------------------------------------------------------------------------------------------
const STONE_D = "#2c3650";
const STONE_M = "#56698a";
const STONE_L = "#a3b9d0";
const MOSS_D = "#2d6a2a";
const MOSS = "#5fa835";
const MOSS_L = "#b0dc5c";
const GOLD = "#f2b836";
const GOLD_L = "#ffe27e";
const BRONZE = "#a8692a";
const BRONZE_D = "#5a3216";
const GLOW = "#6cf3ff";
const GLOW_W = "#e4ffff";
const RED = "#b8261d";
const RED_D = "#6a1512";
const WOOD = "#7d5129";
const WOOD_D = "#452818";
const BONE = "#ece0c4";
const BONE_D = "#bba980";
const IRON = "#2a2d38";
const FIRE = "#ff8a1e";
const FIRE_L = "#ffd84c";
const EMBER = "#ff4c1c";
const ROPE = "#c9a468";
const DARK = "#0b1020";
const KERB_A = "#5d7090";
const KERB_B = "#475a7b";
const KERB_C = "#7186a6";

const G = 0.13; // top of the flagstone dais
const RING = 2.3; // radius of the standing stones
const clamp = (x: number, a: number, c: number) => Math.min(c, Math.max(a, x));

// Rune glyphs, drawn in a 100 x 160 panel around (50, 80) ----------------------------------------------------------
const GLYPHS = [
  "M50 30 V130 M50 42 L80 64 M50 66 L80 88",
  "M50 32 L76 80 L50 128 L24 80 Z M50 32 V128 M24 80 H76",
  "M20 80 Q50 42 80 80 Q50 118 20 80 Z M41 80 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0 M50 34 V50 M50 110 V126",
  "M50 72 a8 8 0 0 1 8 8 a16 16 0 0 1 -16 16 a24 24 0 0 1 -24 -24 a32 32 0 0 1 32 -32",
  "M50 132 V38 M50 90 L22 52 M50 90 L78 52 M50 112 L32 96 M50 112 L68 96",
  "M30 36 H70 L30 124 H70 M50 36 V124",
  "M22 124 L50 62 L78 124 Z M50 38 m-8 0 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 M36 104 H64",
  "M50 132 V44 M26 52 V70 Q26 92 50 92 Q74 92 74 70 V52 M50 44 L38 30 M50 44 L62 30",
];

const strokeGlyph = (d: string, k: number, dim: boolean) =>
  `<path d="${d}" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke="#050b16" stroke-width="${13 * k}"/>` +
  `<path d="${d}" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke="${dim ? "#2c5668" : "#1fa8d8"}" stroke-width="${8 * k}"/>` +
  `<path d="${d}" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke="${dim ? "#4f8296" : "#e6ffff"}" stroke-width="${3.2 * k}"/>`;

const panelCache = new Map<string, THREE.Texture>();
function panelSvg(index: number, dim: boolean) {
  const key = `${index % GLYPHS.length}|${dim}`;
  const cached = panelCache.get(key);
  if (cached) return cached;
  const line = dim ? "#2f5a6c" : "#2bb6e2";
  const jewel = dim ? "#4f8296" : "#e6ffff";
  let dots = "";
  for (let i = 0; i < 6; i++) {
    const y = 28 + i * 20.8;
    dots += `<circle cx="9.5" cy="${y}" r="2" fill="${line}"/><circle cx="90.5" cy="${y}" r="2" fill="${line}"/>`;
  }
  const tex = svg(
    `<svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg">` +
      `<rect x="4.5" y="4.5" width="91" height="151" rx="10" fill="none" stroke="#070d1a" stroke-width="7"/>` +
      `<rect x="13" y="13" width="74" height="134" rx="6" fill="none" stroke="${line}" stroke-width="2"/>` +
      `<path d="M50 6 L58 14 L50 22 L42 14 Z M50 138 L58 146 L50 154 L42 146 Z" fill="${jewel}" stroke="#070d1a" stroke-width="1.6"/>` +
      `<path d="M13 30 L30 13 M70 13 L87 30 M13 130 L30 147 M70 147 L87 130" stroke="${line}" stroke-width="2.4" fill="none"/>` +
      dots +
      strokeGlyph(GLYPHS[index % GLYPHS.length], 1, dim) +
      `</svg>`,
    { size: 480 },
  );
  panelCache.set(key, tex);
  return tex;
}

const sigil = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">` +
    `<circle cx="50" cy="50" r="44" fill="none" stroke="#050b16" stroke-width="9"/>` +
    `<circle cx="50" cy="50" r="44" fill="none" stroke="#1fa8d8" stroke-width="4"/>` +
    `<circle cx="50" cy="50" r="44" fill="none" stroke="#e6ffff" stroke-width="1.4" stroke-dasharray="6 5"/>` +
    strokeGlyph("M50 18 L80 70 H20 Z", 0.7, false) +
    strokeGlyph("M50 82 L26 40 H74 Z", 0.7, false) +
    `<circle cx="50" cy="52" r="6" fill="#e6ffff" stroke="#050b16" stroke-width="2.4"/>` +
    `</svg>`,
  { size: 384 },
);

function floorSvg(angles: number[]) {
  let s = `<svg viewBox="-250 -250 500 500" xmlns="http://www.w3.org/2000/svg">`;
  const ring = (r: number, w: number, dash = "") =>
    `<circle cx="0" cy="0" r="${r}" fill="none" stroke="#070d1a" stroke-width="${w + 3.6}" ${dash ? `stroke-dasharray="${dash}"` : ""}/>` +
    `<circle cx="0" cy="0" r="${r}" fill="none" stroke="#25aedc" stroke-width="${w}" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
  s += ring(190, 3.4) + ring(146, 2.8) + ring(168, 1.4, "5 5");
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    const r0 = i % 4 === 0 ? 150 : 178;
    const r1 = 188;
    s += `<path d="M${Math.sin(a) * r0} ${Math.cos(a) * r0} L${Math.sin(a) * r1} ${Math.cos(a) * r1}" stroke="#25aedc" stroke-width="2"/>`;
  }
  angles.forEach((az, i) => {
    const a = az * DEG;
    const gx = Math.sin(a) * 168;
    const gy = Math.cos(a) * 168;
    s += `<g transform="translate(${gx} ${gy}) rotate(${180 - az}) scale(0.36) translate(-50 -80)">`;
    s += `<circle cx="50" cy="80" r="60" fill="#0a1424" stroke="#070d1a" stroke-width="5"/>`;
    s += `<circle cx="50" cy="80" r="60" fill="none" stroke="#25aedc" stroke-width="3.4"/>`;
    s += strokeGlyph(GLYPHS[i % GLYPHS.length], 1.1, false) + `</g>`;
    // inward pointer toward the altar
    const px = Math.sin(a) * 146;
    const py = Math.cos(a) * 146;
    s += `<g transform="translate(${px} ${py}) rotate(${-az})"><path d="M-9 0 L0 -18 L9 0 Z" fill="#e6ffff" stroke="#070d1a" stroke-width="2.6"/></g>`;
  });
  // diamonds at the gaps without a brazier
  for (let i = 0; i < 8; i += 2) {
    const a = (i * 45 * Math.PI) / 180;
    const x = Math.sin(a) * 168;
    const y = Math.cos(a) * 168;
    s += `<g transform="translate(${x} ${y}) rotate(${-i * 45})"><path d="M0 -12 L9 0 L0 12 L-9 0 Z" fill="#e6ffff" stroke="#070d1a" stroke-width="3"/></g>`;
  }
  s += `</svg>`;
  return svg(s, { size: 2048 });
}

// Card drawings ---------------------------------------------------------------------------------------------------
const grassTex = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">` +
    `<path d="M10 64 L6 18 L20 64Z" fill="#3f8a2c"/><path d="M18 64 L24 6 L34 64Z" fill="#62ad38"/>` +
    `<path d="M28 64 L40 14 L44 64Z" fill="#4a9a30"/><path d="M38 64 L56 22 L50 64Z" fill="#8cc94a"/>` +
    `<path d="M24 64 L32 28 L30 64Z" fill="#b4e060"/><path d="M44 64 L62 40 L54 64Z" fill="#3f8a2c"/></svg>`,
  { size: 128 },
);
const fernTex = svg(
  `<svg viewBox="0 0 48 64" xmlns="http://www.w3.org/2000/svg"><path d="M24 64 Q23 34 24 4" stroke="#2a6a28" stroke-width="3" fill="none"/>` +
    [0, 1, 2, 3, 4, 5]
      .map(
        (i) =>
          `<path d="M24 ${58 - i * 9} Q${34 - i} ${52 - i * 9} ${44 - i * 3} ${48 - i * 9} Q${34 - i} ${56 - i * 9} 24 ${60 - i * 9}Z" fill="${i % 2 ? "#4f9d36" : "#6dbb3e"}"/>` +
          `<path d="M24 ${58 - i * 9} Q${14 + i} ${52 - i * 9} ${4 + i * 3} ${48 - i * 9} Q${14 + i} ${56 - i * 9} 24 ${60 - i * 9}Z" fill="${i % 2 ? "#6dbb3e" : "#4f9d36"}"/>`,
      )
      .join("") +
    `</svg>`,
  { size: 128 },
);
const flowerTex = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg"><path d="M16 64 L16 22" stroke="#3a7a2a" stroke-width="3.4"/>` +
    `<path d="M16 48 Q6 44 4 36 Q14 38 16 46Z" fill="#4f9d36"/>` +
    `<g fill="#ffd84c"><circle cx="16" cy="10" r="5"/><circle cx="8" cy="16" r="5"/><circle cx="24" cy="16" r="5"/><circle cx="11" cy="24" r="5"/><circle cx="21" cy="24" r="5"/></g>` +
    `<circle cx="16" cy="17" r="4.4" fill="#d9622b"/></svg>`,
  { size: 96 },
);
const leafTex = svg(
  `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg"><path d="M16 46 C2 34 2 14 16 2 C30 14 30 34 16 46Z" fill="#4f9d36"/>` +
    `<path d="M16 46 C30 34 30 14 16 2Z" fill="#6dbb3e"/><path d="M16 46 L16 8" stroke="#2a6a28" stroke-width="2.6"/></svg>`,
  { size: 96 },
);
const featherTex = (main: string, dark: string, band: string) =>
  svg(
    `<svg viewBox="0 0 32 96" xmlns="http://www.w3.org/2000/svg"><path d="M16 94 C2 62 2 26 16 4 C30 26 30 62 16 94Z" fill="${main}"/>` +
      `<path d="M16 94 C30 62 30 26 16 4Z" fill="${dark}"/><path d="M5 40 Q16 30 27 40 L27 48 Q16 38 5 48Z" fill="${band}"/>` +
      `<path d="M16 96 L16 6" stroke="#f7ecc8" stroke-width="2.4"/></svg>`,
    { size: 128 },
  );
const featherA = featherTex("#c8321f", "#8a1e14", "#f2c037");
const featherB = featherTex("#1fa4cf", "#14708f", "#f2f6ff");
const sigilGold = svg(
  `<svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="M32 12 L50 40 L32 68 L14 40 Z" stroke="#f2b836" stroke-width="5"/>` +
    `<path d="M32 12 V68 M14 40 H50" stroke="#f2b836" stroke-width="4"/>` +
    `<circle cx="32" cy="40" r="7" stroke="#ffe27e" stroke-width="3.4"/></g></svg>`,
  { size: 160 },
);
const inlay = svg(
  `<svg viewBox="0 0 160 24" xmlns="http://www.w3.org/2000/svg">` +
    `<rect x="2" y="2" width="156" height="20" rx="5" fill="none" stroke="#070d1a" stroke-width="4"/>` +
    `<path d="M10 12 H150" stroke="#1d86ad" stroke-width="2.4"/>` +
    [0, 1, 2, 3, 4, 5, 6]
      .map((k) =>
        k === 3
          ? `<path d="M80 3 L90 12 L80 21 L70 12Z" fill="#e6ffff" stroke="#070d1a" stroke-width="1.6"/>`
          : `<path d="M${22 + k * 20} 6 V18 M${22 + k * 20} 12 L${28 + k * 20} 8" stroke="#6cf3ff" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
      )
      .join("") +
    `</svg>`,
  { size: 512 },
);


// Outlines ------------------------------------------------------------------------------------------------------------
type Pt = [number, number];
type Profile = { R: Pt[]; L: Pt[]; T: Pt[]; w: number; h: number };

const TOPS: Pt[][] = [
  [[0.38, 0.9], [0.12, 1.0], [-0.12, 0.95], [-0.34, 0.88]],
  [[0.4, 0.88], [0.3, 0.96], [0.08, 0.96], [0.0, 0.9], [-0.1, 0.93], [-0.28, 0.99], [-0.42, 0.88]],
  [[0.42, 0.89], [0.3, 0.96], [0.1, 1.0], [-0.1, 1.0], [-0.3, 0.96], [-0.42, 0.89]],
  [[0.4, 0.94], [0.2, 1.0], [-0.08, 0.92], [-0.3, 0.85]],
];

function profile(w: number, h: number, style: number, r: () => number): Profile {
  const j = () => (r() - 0.5) * 0.05 * w;
  const R: Pt[] = [
    [0.6 * w + j(), 0],
    [0.56 * w + j(), 0.12 * h],
    [0.5 * w + j(), 0.36 * h],
    [0.53 * w + j(), 0.62 * h],
    [0.47 * w, 0.8 * h],
  ];
  const L: Pt[] = [
    [-0.6 * w + j(), 0],
    [-0.56 * w + j(), 0.12 * h],
    [-0.52 * w + j(), 0.36 * h],
    [-0.5 * w + j(), 0.62 * h],
    [-0.47 * w, 0.8 * h],
  ];
  const T = TOPS[style % TOPS.length].map(([fx, fy]): Pt => [fx * w, fy * h + (r() - 0.5) * 0.02 * h]);
  return { R, L, T, w, h };
}

function interp(list: Pt[], y: number) {
  for (let i = 0; i + 1 < list.length; i++) {
    const [x0, y0] = list[i];
    const [x1, y1] = list[i + 1];
    if (y >= y0 && y <= y1) return x0 + ((x1 - x0) * (y - y0)) / (y1 - y0 || 1);
  }
  return list[list.length - 1][0];
}

function outlineOf(p: Profile): OutlinePoint[] {
  return [...p.L.slice(0, 1), ...p.R, ...p.T, ...[...p.L].reverse().slice(0, p.L.length - 1)].map(([x, y]) => [x, y]);
}

/** Left and right extents of a simple outline at height y. */
function extentAt(pts: OutlinePoint[], y: number): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[(i + 1) % pts.length];
    if ((y0 <= y && y1 >= y) || (y1 <= y && y0 >= y)) {
      if (y0 === y1) {
        lo = Math.min(lo, x0, x1);
        hi = Math.max(hi, x0, x1);
      } else {
        const x = x0 + ((x1 - x0) * (y - y0)) / (y1 - y0);
        lo = Math.min(lo, x);
        hi = Math.max(hi, x);
      }
    }
  }
  return [lo, hi];
}

function topAt(p: Profile, x: number) {
  const full: Pt[] = [p.R[p.R.length - 1], ...p.T, p.L[p.L.length - 1]];
  for (let i = 0; i + 1 < full.length; i++) {
    const [x0, y0] = full[i];
    const [x1, y1] = full[i + 1];
    if (x <= x0 && x >= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0 || 1);
  }
  return p.h * 0.9;
}

// Stone paint -----------------------------------------------------------------------------------------------------------
function stonePaint(seed: number, y0: number, h: number, N?: THREE.Vector3, moss = 0.3) {
  return paint((p, n) => {
    const big = noise(p, 0.55, seed);
    const mid = noise(p, 0.17, seed + 7);
    const t = clamp((p.y - y0) / h, 0, 1);
    const streak = noise(new THREE.Vector3(p.x * 6, p.y * 0.8, p.z * 6), 0.3, seed + 3);
    let c = mix(STONE_D, STONE_M, 0.22 + 0.5 * big + 0.2 * mid + 0.15 * streak);
    c = mix(c, STONE_L, t * t * 0.4 + (n.y > 0.55 ? 0.28 : 0));
    const cell = cells(p, 0.62, seed);
    const edge = cell.id > 0.5 ? smoothstep(0.015, 0.07, cell.d2 - cell.d1) : 1;
    c = mix(STONE_D, c, 0.35 + 0.65 * edge);
    const tt = (p.y - y0) / h + (big - 0.5) * 0.3;
    const m = 1 - smoothstep(0, moss, tt);
    c = mix(c, mix(MOSS_D, MOSS, mid), m * 0.92);
    if (m > 0.3 && mid > 0.62) c = mix(c, MOSS_L, 0.5);
    if (N) {
      const f = Math.abs(n.dot(N));
      if (f < 0.92) c = mix(c, n.y > 0 ? STONE_L : STONE_D, 0.45 * (1 - f));
    }
    return c;
  });
}

const bronzePaint = (y0: number, y1: number) =>
  paint((p, n, s) => {
    const v = clamp((p.y - y0) / (y1 - y0 || 1), 0, 1);
    const wear = noise(p, 0.08, 3);
    let c = mix(BRONZE_D, GOLD, 0.25 + 0.6 * (1 - Math.abs(v - 0.7) * 1.6));
    if (v > 0.8) c = mix(c, GOLD_L, 0.55);
    c = mix(c, BRONZE, wear * 0.35);
    const zig = Math.abs((((s[0] / 0.1) % 1) + 1) % 1 - 0.5) * 2;
    if (v > 0.22 && v < 0.78 && (v - 0.22) / 0.56 < zig * 0.7 && Math.abs(n.y) < 0.5) c = mix(c, BRONZE_D, 0.8);
    return c;
  });

const groundPaint = paint((p) => {
  const r = Math.hypot(p.x, p.z);
  if (r < 2.7) {
    const c = cells(p, 0.5, 11);
    const edge = smoothstep(0.03, 0.14, c.d2 - c.d1);
    const shade = noise(p, 0.9, 5);
    let base = mix(mix("#6a7b95", "#4f607c", c.id), "#8697b0", shade * 0.3 + (c.id > 0.8 ? 0.25 : 0));
    const moss = smoothstep(0.55, 0.85, noise(p, 0.3, 9)) * smoothstep(1.9, 2.6, r);
    base = mix(base, MOSS, moss * 0.8);
    return mix("#1d2538", base, 0.35 + 0.65 * edge);
  }
  const g = noise(p, 0.5, 21);
  const grass = mix(mix("#3d8a2c", "#5faa38", g), "#9bd250", smoothstep(0.62, 0.9, noise(p, 0.15, 3)) * 0.6);
  const dirt = smoothstep(2.82, 2.7, r) * 0.9 + (r > 3.3 ? smoothstep(3.3, 3.5, r) * 0.9 : 0);
  return mix(grass, mix("#6d4b2d", "#4a3220", g), dirt);
});
interface Merger {
  add(
    color: string,
    geo: THREE.BufferGeometry,
    at: THREE.Vector3,
    quat?: THREE.Quaternion,
    scale?: THREE.Vector3 | number,
    strength?: number,
  ): void;
  flush(): void;
}


// ---------------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "runestoneCircle", paintSize: 2048 });
  const root = b.joint("root", { at: [0, 0, 0] });
  type Bone = Joint;
  const rnd = rng(1337);
  const UP = new THREE.Vector3(0, 1, 0);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const polar = (r: number, deg: number) => V(Math.sin(deg * DEG) * r, 0, Math.cos(deg * DEG) * r);
  const yaw = (rad: number) => new THREE.Quaternion().setFromAxisAngle(UP, rad);
  const basisQ = (x: THREE.Vector3, y: THREE.Vector3, z: THREE.Vector3) =>
    new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));

  // Merged small parts: one part per bone, colour and glow strength.
  function merger(bone: Bone): Merger {
    const groups = new Map<string, { color: string; strength: number; geos: THREE.BufferGeometry[] }>();
    return {
      add(
        color: string,
        geo: THREE.BufferGeometry,
        at: THREE.Vector3,
        quat?: THREE.Quaternion,
        scale?: THREE.Vector3 | number,
        strength = 0,
      ) {
        const key = `${color}|${strength}`;
        let group = groups.get(key);
        if (!group) groups.set(key, (group = { color, strength, geos: [] }));
        const sc = typeof scale === "number" ? V(scale, scale, scale) : (scale ?? V(1, 1, 1));
        const g = geo.clone().applyMatrix4(new THREE.Matrix4().compose(at, quat ?? new THREE.Quaternion(), sc));
        group.geos.push(g.index ? g.toNonIndexed() : g);
      },
      flush() {
        for (const g of groups.values()) {
          const part = b.part(mergeGeometries(g.geos)!, g.color, { bone, at: [0, 0, 0], flat: true });
          if (g.strength > 0) glow(part, g.strength);
        }
      },
    };
  }
  const fixed = merger(root);

  // ---- geometry shared by many parts
  const rivetGeo = new THREE.SphereGeometry(0.02, 6, 4);
  const rockGeo = new THREE.IcosahedronGeometry(0.1, 0);
  const crystalBody = new THREE.CylinderGeometry(0.05, 0.065, 0.2, 6);
  const crystalTip = new THREE.ConeGeometry(0.05, 0.11, 6);
  const addCrystal = (m: Merger, at: THREE.Vector3, dir: THREE.Vector3, s: number, color = GLOW, k = 1.4) => {
    const q = aim(dir);
    const d = dir.clone().normalize();
    m.add(color, crystalBody, at.clone().addScaledVector(d, 0.1 * s), q, s, k);
    m.add(color, crystalTip, at.clone().addScaledVector(d, 0.255 * s), q, s, k);
  };

  // ---- ground: grass skirt and flagstone dais
  const groundOutline: OutlinePoint[] = [
    [0, 0],
    [3.5, 0],
    [3.5, 0.05],
    [3.4, 0.075],
    [2.72, 0.075],
    [2.67, G],
    [0, G],
  ];
  b.lathe(groundOutline, { at: [0, 0, 0], segments: 56, color: groundPaint, bone: root, name: "ground" });

  // kerb blocks round the dais, with a gap for the entrance
  for (let i = 0; i < 34; i++) {
    const az = (i / 34) * 360 + 5;
    if (Math.abs(((az + 180) % 360) - 180) < 9) continue;
    const pos = polar(2.7, az);
    pos.y = 0.075 + 0.065 + (rnd() - 0.5) * 0.01;
    fixed.add(
      [KERB_A, KERB_B, KERB_C][i % 3],
      new THREE.BoxGeometry(0.4 + rnd() * 0.04, 0.13 + rnd() * 0.03, 0.2),
      pos,
      yaw(az * DEG),
    );
  }

  // entrance path of worn flagstones through the kerb gap
  for (let k = 0; k < 5; k++) {
    const at = V((rnd() - 0.5) * 0.18, 0.075 + 0.025, 2.55 + k * 0.17);
    fixed.add(
      [KERB_A, KERB_C, KERB_B][k % 3],
      new THREE.BoxGeometry(0.42 + rnd() * 0.1, 0.05, 0.28 + rnd() * 0.06),
      at,
      yaw((rnd() - 0.5) * 0.4),
    );
  }

  // glowing floor ring of runes
  const stoneAz = Array.from({ length: 8 }, (_, i) => 22.5 + 45 * i);
  glow(
    b.part(new THREE.PlaneGeometry(5, 5), "#ffffff", {
      bone: root,
      at: [0, G + 0.004, 0],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, -1],
      texture: floorSvg(stoneAz),
      name: "floorRunes",
    }),
    1.15,
  );

  // ---- standing stones
  const BROKEN = 6;
  const heights = [2.25, 1.98, 2.5, 2.15, 2.35, 1.92, 2.15, 2.3];
  const widths = [0.9, 0.92, 1.0, 0.86, 0.94, 0.88, 0.92, 0.96];
  const styles = [0, 1, 2, 3, 2, 1, 0, 3];
  const T = 0.44;
  const featherSets = [
    { frames: [] as Frame[], flows: [] as THREE.Vector3[] },
    { frames: [] as Frame[], flows: [] as THREE.Vector3[] },
  ];
  const leafFrames: Frame[] = [];
  const tuftFrames: Frame[] = [];
  const fernFrames: Frame[] = [];
  const mushrooms = merger(root);
  const glowSmall = merger(root);

  function placeFrame(O: THREE.Vector3, X: THREE.Vector3, Y: THREE.Vector3) {
    const N = new THREE.Vector3().crossVectors(X, Y).normalize();
    return { O, X, Y, N, pt: (u: number, v: number, w: number) => O.clone().addScaledVector(X, u).addScaledVector(Y, v).addScaledVector(N, w) };
  }

  const crownPoints: THREE.Vector3[] = [];

  for (let i = 0; i < 8; i++) {
    const az = stoneAz[i];
    const h = heights[i];
    const w = widths[i];
    const P = polar(RING, az);
    P.y = G - 0.02;
    const d = polar(1, az + 180);
    const out = d.clone().negate();
    const X = V(d.z, 0, -d.x);
    const lean = ((rnd() - 0.5) * 7 + (i === 3 ? 4 : 0)) * DEG;
    const Yl = V(0, Math.cos(lean), 0).addScaledVector(out, Math.sin(lean));
    const F = placeFrame(P, X, Yl);
    const F0 = placeFrame(P, X, UP);
    const prof = profile(w, h, styles[i], rnd);

    // plinth
    const foot: OutlinePoint[] = [
      [-0.66 * w, 0],
      [0.66 * w, 0],
      [0.64 * w, 0.13],
      [0.57 * w, 0.27],
      [-0.57 * w, 0.27],
      [-0.64 * w, 0.13],
    ];
    b.extrude(foot, {
      at: F0.O,
      x: F0.X,
      y: F0.Y,
      thickness: 0.72,
      bevel: 0.035,
      color: stonePaint(40 + i, G, 1.4, F0.N, 0.5),
      bone: root,
      name: `plinth${i}`,
    });
    // glowing inlay strip on both faces of the plinth
    for (const sd of [1, -1]) {
      glow(
        b.part(new THREE.PlaneGeometry(1.15 * w, 0.17), "#ffffff", {
          bone: root,
          at: F0.pt(0, 0.125, sd * (0.36 + 0.007)),
          dir: F0.N.clone().multiplyScalar(sd),
          axis: "z",
          texture: inlay,
          name: `inlay${i}`,
        }),
        1.0,
      );
    }

    let main: OutlinePoint[];
    let topY = 0;
    if (i === BROKEN) {
      const cut = 0.5 * h;
      const xr = interp(prof.R, cut);
      const xl = interp(prof.L, cut);
      const lower = (side: Pt[]) => side.filter(([, y]) => y < cut);
      const jag: Pt[] = [
        [xr, cut],
        [xr * 0.7, cut + 0.07],
        [xr * 0.4, cut - 0.02],
        [xr * 0.1, cut + 0.13],
        [xl * 0.2, cut + 0.03],
        [xl * 0.55, cut + 0.11],
        [xl * 0.8, cut + 0.0],
        [xl, cut],
      ];
      main = [
        ...lower(prof.L).slice(0, 1),
        ...lower(prof.R),
        ...jag,
        ...[...lower(prof.L)].reverse().slice(0, lower(prof.L).length - 1),
      ].map(([x, y]) => [x, y]);
      topY = cut + 0.1;
    } else {
      main = outlineOf(prof);
      topY = topAt(prof, 0);
    }
    b.extrude(main, {
      at: F.O,
      x: F.X,
      y: F.Y,
      thickness: T,
      bevel: 0.035,
      color: stonePaint(i * 3 + 1, G, h * 0.9, F.N, 0.3),
      bone: root,
      name: `stone${i}`,
    });

    if (i !== BROKEN) {
      // carved rune panel
      const ph = 0.46 * h;
      const pw = ph / 1.6;
      glow(
        b.part(new THREE.PlaneGeometry(pw, ph), "#ffffff", {
          bone: root,
          at: F.pt(0, 0.49 * h, T / 2 + 0.01),
          dir: F.N,
          axis: "z",
          up: F.Y,
          texture: panelSvg(i, false),
          name: `rune${i}`,
        }),
        1.2,
      );
      // outer face carries another glowing rune
      glow(
        b.part(new THREE.PlaneGeometry(pw, ph), "#ffffff", {
          bone: root,
          at: F.pt(0, 0.49 * h, -T / 2 - 0.01),
          dir: F.N.clone().negate(),
          axis: "z",
          up: F.Y,
          texture: panelSvg(i + 3, false),
          name: `runeOuter${i}`,
        }),
        1.0,
      );

      // bronze straps: a heavy one above the panel and a lighter one low on the stone
      const y0 = 0.79 * h;
      const strap = (ya: number, yb: number, count: number): [number, number] => {
        const [la, ra] = extentAt(main, ya + 0.002);
        const [lb, rb] = extentAt(main, yb - 0.002);
        b.extrude(
          [
            [la - 0.045, ya],
            [ra + 0.045, ya],
            [rb + 0.045, yb],
            [lb - 0.045, yb],
          ],
          {
            at: F.O,
            x: F.X,
            y: F.Y,
            thickness: T + 0.1,
            bevel: 0.022,
            color: bronzePaint(F.O.y + ya * Math.cos(lean), F.O.y + yb * Math.cos(lean)),
            bone: root,
            name: `band${i}`,
          },
        );
        for (const side of [1, -1]) {
          for (let k = 0; k < count; k++) {
            const u = la + (ra - la) * (0.08 + (0.84 * (k + 0.5)) / count);
            fixed.add(GOLD_L, rivetGeo, F.pt(u, (ya + yb) / 2, side * (T / 2 + 0.056)));
          }
        }
        return [la, ra];
      };
      const [l0, r0] = strap(y0, y0 + 0.1, 6);
      strap(0.135 * h, 0.135 * h + 0.075, 5);
      // bronze horns flaring from the strap ends
      for (const sd of [1, -1]) {
        const hb = F.pt(sd > 0 ? r0 + 0.05 : l0 - 0.05, y0 + 0.05, 0);
        const hd = F.X.clone().multiplyScalar(sd).addScaledVector(F.Y, 0.55).normalize();
        fixed.add(BRONZE, new THREE.CylinderGeometry(0.075, 0.085, 0.07, 6), hb, aim(hd));
        fixed.add(GOLD, new THREE.ConeGeometry(0.06, 0.4, 5), hb.clone().addScaledVector(hd, 0.2), aim(hd));
        fixed.add(GOLD_L, rivetGeo, hb.clone().addScaledVector(hd, 0.05).addScaledVector(F.N, 0.055));
        fixed.add(GOLD_L, rivetGeo, hb.clone().addScaledVector(hd, 0.05).addScaledVector(F.N, -0.055));
      }
      // hanging talismans on the band edges
      for (const sd of [1, -1]) {
        const u = sd > 0 ? r0 + 0.05 : l0 - 0.05;
        const base = F.pt(u, y0 + 0.01, 0);
        for (let k = 0; k < 2; k++) {
          const at = base.clone().addScaledVector(F.N, (k - 0.5) * 0.2).addScaledVector(F.X, sd * k * 0.04);
          const set = featherSets[(i + k) % 2];
          set.frames.push(frame(at, [0, 1, 0]));
          set.flows.push(d.clone());
        }
        // cord with bead
        const cordTop = F.pt(u, y0 + 0.02, 0.0);
        fixed.add(ROPE, new THREE.CylinderGeometry(0.008, 0.008, 0.2, 5), cordTop.clone().addScaledVector(UP, -0.1));
        fixed.add(BONE, new THREE.SphereGeometry(0.03, 6, 4), cordTop.clone().addScaledVector(UP, -0.22));
        fixed.add(GOLD, new THREE.CylinderGeometry(0.035, 0.035, 0.012, 8), cordTop.clone().addScaledVector(UP, -0.18), basisQ(F.X, F.N, F.Y.clone().negate()));
      }

      // crown: bronze claws round a glowing crystal
      const cb = F.pt(0, topY - 0.02, 0);
      b.lathe(
        [
          [0, 0],
          [0.17, 0],
          [0.15, 0.05],
          [0.09, 0.12],
          [0.0, 0.12],
        ],
        { at: cb, axis: F.Y, segments: 8, color: bronzePaint(cb.y, cb.y + 0.12), bone: root, name: `crown${i}` },
      );
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
        const tiltDir = F.Y.clone()
          .multiplyScalar(Math.cos(0.3))
          .addScaledVector(F.X, Math.cos(a) * Math.sin(0.3))
          .addScaledVector(F.N, Math.sin(a) * Math.sin(0.3));
        fixed.add(
          GOLD,
          new THREE.ConeGeometry(0.022, 0.26, 4),
          cb.clone().addScaledVector(F.Y, 0.2).addScaledVector(F.X, Math.cos(a) * 0.075).addScaledVector(F.N, Math.sin(a) * 0.075),
          aim(tiltDir),
        );
      }
      addCrystal(glowSmall, F.pt(0, topY + 0.08, 0), F.Y, 1.45 + (i % 3) * 0.12);
      crownPoints.push(F.pt(0, topY + 0.55, 0));
    } else {
      // broken stump: glowing crystal shards in the fracture and a dim fragment lying in the grass
      const cb = F.pt(0, topY, 0);
      addCrystal(glowSmall, cb.clone().addScaledVector(F.X, 0.14), F.Y.clone().addScaledVector(F.X, 0.25), 1.0);
      addCrystal(glowSmall, cb.clone().addScaledVector(F.X, -0.12).addScaledVector(F.N, 0.06), F.Y.clone().addScaledVector(F.X, -0.35), 0.8);
      addCrystal(glowSmall, cb.clone().addScaledVector(F.N, -0.05), F.Y.clone().addScaledVector(F.N, 0.2), 0.7);
      glow(
        b.part(new THREE.PlaneGeometry(0.4, 0.6), "#ffffff", {
          bone: root,
          at: F.pt(0, 0.25 * h + 0.18, T / 2 + 0.01),
          dir: F.N,
          axis: "z",
          up: F.Y,
          texture: panelSvg(i, false),
          name: `runeStump`,
        }),
        0.9,
      );
      // fallen top
      const cutH = 0.5 * h;
      const upper = (side: Pt[]) => side.filter(([, y]) => y > cutH).map(([x, y]): Pt => [x, y - cutH]);
      const xr = interp(prof.R, cutH);
      const xl = interp(prof.L, cutH);
      const topOut: OutlinePoint[] = [
        [xl, 0],
        [xl * 0.6, 0.06],
        [xl * 0.2, -0.0],
        [xr * 0.3, 0.1],
        [xr * 0.7, 0.02],
        [xr, 0],
        ...upper(prof.R),
        ...prof.T.map(([x, y]): Pt => [x, y - cutH]),
        ...upper(prof.L).reverse(),
      ].map(([x, y]) => [x, y] as OutlinePoint);
      const tang = V(Math.cos(az * DEG), 0, -Math.sin(az * DEG));
      const lieY = out.clone().multiplyScalar(0.15).addScaledVector(tang, -0.99);
      lieY.y = 0.07;
      lieY.normalize();
      const lieX = new THREE.Vector3().crossVectors(lieY, UP).normalize();
      const lieO = polar(3.0, az - 4);
      lieO.y = 0.075 + T / 2 + 0.03;
      const LF = placeFrame(lieO, lieX, lieY);
      b.extrude(topOut, {
        at: LF.O,
        x: LF.X,
        y: LF.Y,
        thickness: T,
        bevel: 0.035,
        color: stonePaint(77, 0.07, 0.6, LF.N, 0.3),
        bone: root,
        name: "fallenTop",
      });
      b.part(new THREE.PlaneGeometry(0.4, 0.62), "#ffffff", {
        bone: root,
        at: LF.pt(0, 0.62, T / 2 + 0.01),
        dir: LF.N,
        axis: "z",
        up: LF.Y,
        texture: panelSvg(i, true),
        name: "runeFallen",
      });
      // broken chunks
      for (let k = 0; k < 4; k++) {
        const at = polar(2.8 + rnd() * 0.4, az + (rnd() - 0.5) * 28);
        at.y = 0.08 + 0.04;
        fixed.add([STONE_M, "#6a7d9a", STONE_D][k % 3], rockGeo, at, yaw(rnd() * 6), V(1.2 + rnd(), 0.8 + rnd() * 0.6, 1 + rnd() * 0.8));
      }
    }

    // rubble and moss at the plinth
    for (let k = 0; k < 4; k++) {
      const a = rnd() * Math.PI * 2;
      const rr = 0.55 * w + 0.18 + rnd() * 0.25;
      const at = F0.pt(Math.cos(a) * rr * 1.2, 0.03, Math.sin(a) * rr * 0.9);
      fixed.add([STONE_M, "#6a7d9a", STONE_D, "#7f93b0"][k], rockGeo, at, yaw(rnd() * 6), V(0.8 + rnd() * 0.8, 0.6 + rnd() * 0.5, 0.8 + rnd() * 0.8));
    }
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2 + rnd();
      const at = F0.pt(Math.cos(a) * (0.62 * w + 0.12 + rnd() * 0.12), 0.0, Math.sin(a) * (0.5 + rnd() * 0.12));
      (k % 3 === 0 ? fernFrames : tuftFrames).push(frame(at, [0, 1, 0]));
    }

    // glowing crystal clusters and mushrooms at alternating bases
    if (i % 2 === 0) {
      const bx = F0.pt(-0.58 * w - 0.12, 0.02, 0.3);
      addCrystal(glowSmall, bx, V(0.2, 1, 0.1), 1.0);
      addCrystal(glowSmall, bx.clone().add(V(0.12, 0, 0.1)), V(-0.3, 1, 0.1), 0.7);
      addCrystal(glowSmall, bx.clone().add(V(-0.06, 0, -0.1)), V(0.1, 1, -0.4), 0.55);
    } else {
      const bx = F0.pt(0.6 * w + 0.15, 0.02, -0.25);
      for (let k = 0; k < 4; k++) {
        const at = bx.clone().add(V((rnd() - 0.5) * 0.25, 0, (rnd() - 0.5) * 0.25));
        const s = 0.6 + rnd() * 0.7;
        mushrooms.add(BONE, new THREE.CylinderGeometry(0.014 * s, 0.02 * s, 0.07 * s, 5), at.clone().add(V(0, 0.035 * s, 0)));
        mushrooms.add(
          "#58d6ff",
          new THREE.SphereGeometry(0.05 * s, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2),
          at.clone().add(V(0, 0.07 * s, 0)),
          undefined,
          V(1, 0.7, 1),
          1.1,
        );
      }
    }

    // vines winding up some stones
    if (i === 1 || i === 4 || i === 7) {
      const side = i === 4 ? -1 : 1;
      const [lo, hi] = extentAt(main, 0.3 * h);
      const edgeU = side > 0 ? hi : lo;
      const pts: THREE.Vector3[] = [];
      const n = 34;
      for (let k = 0; k <= n; k++) {
        const v = 0.05 + (k / n) * 0.62 * h;
        const eu = (side > 0 ? interp(prof.R, v) : interp(prof.L, v)) || edgeU;
        const th = k * 0.95;
        pts.push(F.pt(eu - side * 0.03 + side * 0.06 * Math.cos(th), v, (T / 2 + 0.03) * Math.sin(th)));
      }
      const path = catmull(pts);
      b.sweep(path, [0.03, 0.012], { color: MOSS_D, bone: root, sides: 5, name: `vine${i}` });
      for (let k = 1; k < 30; k++) {
        const th = (k / 30) * n * 0.95;
        const dirv = F.X.clone().multiplyScalar(side * Math.cos(th)).addScaledVector(F.N, Math.sin(th)).addScaledVector(UP, 0.35);
        leafFrames.push(frame(path.at(k / 30), dirv));
      }
    }
  }

  // ---- small boundary stelae in the gaps, each with its own glowing glyph
  for (let k = 1; k < 8; k++) {
    const az = 45 * k + (k % 2 ? 3 : -3);
    const P = polar(3.0, az);
    P.y = 0.07;
    const d = polar(1, az + 180);
    const F = placeFrame(P, V(d.z, 0, -d.x), UP);
    const sh = 0.6 + (k % 3) * 0.08;
    const sw = 0.4;
    const sp = profile(sw, sh, k, rnd);
    b.extrude(outlineOf(sp), {
      at: F.O,
      x: F.X,
      y: F.Y,
      thickness: 0.2,
      bevel: 0.025,
      color: stonePaint(120 + k, 0.07, sh, F.N, 0.35),
      bone: root,
      name: `stele${k}`,
    });
    glow(
      b.part(new THREE.PlaneGeometry(0.17, 0.27), "#ffffff", {
        bone: root,
        at: F.pt(0, 0.36 * sh + 0.1, 0.108),
        dir: F.N,
        axis: "z",
        up: UP,
        texture: panelSvg(k + 1, false),
        name: `steleRune${k}`,
      }),
      1.0,
    );
    b.extrude(
      [
        [-0.24, 0],
        [0.24, 0],
        [0.21, 0.09],
        [-0.21, 0.09],
      ],
      { at: F.O, x: F.X, y: F.Y, thickness: 0.34, bevel: 0.02, color: stonePaint(140 + k, 0.07, 0.4, F.N, 0.6), bone: root, name: `steleFoot${k}` },
    );
    addCrystal(glowSmall, F.pt(0, topAt(sp, 0) - 0.02, 0), UP, 0.7);
    fixed.add(GOLD, new THREE.CylinderGeometry(0.06, 0.07, 0.04, 6), F.pt(0, topAt(sp, 0) - 0.02, 0));
  }

  // ---- altar
  const tier = (r: number, y0: number, hh: number, seed: number, name: string) =>
    b.lathe(
      [
        [0, 0],
        [r, 0],
        [r, hh - 0.04],
        [r - 0.04, hh],
        [0, hh],
      ],
      { at: [0, y0, 0], segments: 8, spin: 22.5, color: stonePaint(seed, G, 0.6, undefined, 0.15), bone: root, name },
    );
  const t1 = G + 0.14;
  const t2 = t1 + 0.14;
  const t3 = t2 + 0.12;
  tier(1.4, G, 0.14, 91, "tier1");
  tier(1.16, t1, 0.14, 92, "tier2");
  tier(0.9, t2, 0.12, 93, "tier3");
  // bronze trim rings on the tiers
  for (const [r, y, hh] of [
    [1.402, G + 0.075, 0.035],
    [1.162, t1 + 0.075, 0.035],
    [0.902, t2 + 0.06, 0.03],
  ] as const) {
    b.lathe(
      [
        [r - 0.03, 0],
        [r + 0.012, 0],
        [r + 0.012, hh],
        [r - 0.03, hh],
      ],
      { at: [0, y, 0], segments: 8, spin: 22.5, color: bronzePaint(y, y + hh), bone: root, name: "trim" },
    );
  }
  // altar block: a waisted pedestal with a heavy slab on top
  const SA = 1.25;
  const blockOutline: OutlinePoint[] = [
    [-0.5, 0],
    [0.5, 0],
    [0.5, 0.1],
    [0.34, 0.15],
    [0.32, 0.46],
    [0.47, 0.51],
    [0.53, 0.56],
    [0.53, 0.64],
    [-0.53, 0.64],
    [-0.53, 0.56],
    [-0.47, 0.51],
    [-0.32, 0.46],
    [-0.34, 0.15],
    [-0.5, 0.1],
  ].map(([x, y]): OutlinePoint => [x * SA, y * SA]);
  const halfT = 0.33 * SA;
  b.extrude(blockOutline, {
    at: [0, t3, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 2 * halfT,
    bevel: 0.035,
    color: stonePaint(95, t3, 0.8, V(0, 0, 1), 0.08),
    bone: root,
    name: "altarBlock",
  });
  const altarTop = t3 + 0.64 * SA;
  for (const sd of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(0.34 * SA, 0.34 * SA), "#ffffff", {
        bone: root,
        at: [0, t3 + 0.31 * SA, sd * (halfT + 0.008)],
        dir: [0, 0, sd],
        axis: "z",
        texture: sigil,
        name: "altarSigil",
      }),
      1.15,
    );
    // bronze belt and corner brackets
    if (sd > 0)
      b.part(new THREE.BoxGeometry(1.1 * SA, 0.045 * SA, 2 * halfT + 0.04), bronzePaint(t3 + 0.5 * SA, t3 + 0.55 * SA), {
        bone: root,
        at: [0, t3 + 0.525 * SA, 0],
        name: "altarBelt",
      });
    for (const sx of [1, -1]) {
      fixed.add(BRONZE_D, new THREE.BoxGeometry(0.07, 0.34 * SA, 0.07), V(sx * 0.32 * SA, t3 + 0.31 * SA, sd * (halfT - 0.01)));
      fixed.add(GOLD, new THREE.SphereGeometry(0.03, 6, 4), V(sx * 0.32 * SA, t3 + 0.2 * SA, sd * (halfT + 0.03)));
      fixed.add(GOLD, new THREE.SphereGeometry(0.03, 6, 4), V(sx * 0.32 * SA, t3 + 0.42 * SA, sd * (halfT + 0.03)));
      for (let k = 0; k < 4; k++) fixed.add(GOLD_L, rivetGeo, V(sx * (0.14 + k * 0.12) * SA, t3 + 0.525 * SA, sd * (halfT + 0.03)));
    }
  }
  for (const sx of [1, -1])
    glow(
      b.part(new THREE.PlaneGeometry(0.26 * SA, 0.26 * SA), "#ffffff", {
        bone: root,
        at: [sx * (0.32 * SA + 0.008), t3 + 0.31 * SA, 0],
        dir: [sx, 0, 0],
        axis: "z",
        texture: sigil,
        name: "altarSigilSide",
      }),
      1.0,
    );
  b.lathe(
    [
      [0, 0],
      [0.42, 0],
      [0.45, 0.04],
      [0.37, 0.07],
      [0.25, 0.12],
      [0.0, 0.12],
    ],
    { at: [0, altarTop, 0], segments: 8, spin: 22.5, color: bronzePaint(altarTop, altarTop + 0.12), bone: root, name: "cradle" },
  );
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
    const base = V(Math.cos(a) * 0.5, altarTop + 0.02, Math.sin(a) * 0.5);
    fixed.add(GOLD, new THREE.ConeGeometry(0.045, 0.36, 5), base.clone().add(V(0, 0.18, 0)), aim(V(Math.cos(a) * 0.35, 1, Math.sin(a) * 0.35)));
  }
  glowSmall.add(GLOW, new THREE.CylinderGeometry(0.26, 0.26, 0.02, 8), V(0, altarTop + 0.125, 0), undefined, 1, 1.0);

  // floating crystal with halo rings and orbiting shards (own joints so they can spin)
  const orbitC = V(0, altarTop + 0.95, 0);
  const crystalJ = b.joint("crystal", { parent: root, at: orbitC, role: "hinge" });
  const haloJ = b.joint("halo", { parent: crystalJ, at: orbitC, role: "hinge" });
  const shardJ = b.joint("shards", { parent: crystalJ, at: orbitC, role: "hinge" });
  const crystalMerge = merger(crystalJ);
  crystalMerge.add(GLOW, new THREE.OctahedronGeometry(0.24, 0), orbitC.clone(), undefined, V(0.85, 1.6, 0.85), 1.5);
  crystalMerge.add(GLOW_W, new THREE.OctahedronGeometry(0.12, 0), orbitC.clone(), undefined, V(0.8, 1.55, 0.8), 2.0);
  crystalMerge.flush();
  const haloMerge = merger(haloJ);
  haloMerge.add(GOLD, new THREE.TorusGeometry(0.5, 0.02, 4, 20), orbitC.clone(), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2 + 0.35, 0, 0.2)));
  haloMerge.add(GOLD, new THREE.TorusGeometry(0.4, 0.016, 4, 18), orbitC.clone(), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2 - 0.5, 0.4, -0.3)));
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    const ringPos = orbitC.clone().add(V(Math.cos(a) * 0.6, Math.sin(a * 2) * 0.06, Math.sin(a) * 0.6));
    haloMerge.add(GOLD_L, rivetGeo, ringPos, undefined, 1.1);
  }
  haloMerge.flush();
  const shardMerge = merger(shardJ);
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2 + 0.3;
    const r = 0.72 + (k % 2) * 0.1;
    const pos = orbitC.clone().add(V(Math.cos(a) * r, -0.15 + ((k * 37) % 5) * 0.09, Math.sin(a) * r));
    shardMerge.add(GLOW, new THREE.OctahedronGeometry(0.06, 0), pos, yaw(k), V(0.7, 1.5, 0.7), 1.4);
  }
  shardMerge.flush();
  // arcs of arcane energy from every crown crystal to the floating one
  for (const tip of crownPoints) {
    const horiz = V(tip.x, 0, tip.z).normalize();
    const end = orbitC.clone().addScaledVector(horiz, 0.2);
    const ctrl = V((tip.x + end.x) / 2, Math.max(tip.y, end.y) + 0.55, (tip.z + end.z) / 2);
    glow(b.sweep(bezier(tip, ctrl, end), 0.014, { color: GLOW, sides: 4, bone: root, name: "energyArc" }), 1.3);
  }

  // offerings on the lower steps: ram skull, candles, scroll
  function skull(pos: THREE.Vector3, face: THREE.Vector3, s: number, name: string) {
    const f = face.clone().setY(0).normalize();
    const xs = new THREE.Vector3().crossVectors(UP, f).normalize();
    const loc = (u: number, v: number, w: number) => pos.clone().addScaledVector(xs, u * s).addScaledVector(UP, v * s).addScaledVector(f, w * s);
    const q = basisQ(xs, UP, f);
    const m = merger(root);
    m.add(BONE, new THREE.SphereGeometry(0.1 * s, 7, 5), loc(0, 0.09, 0), q, V(1, 0.9, 1.1));
    m.add(BONE_D, new THREE.BoxGeometry(0.1 * s, 0.07 * s, 0.14 * s), loc(0, 0.04, 0.12), q);
    m.add(BONE, new THREE.BoxGeometry(0.085 * s, 0.03 * s, 0.13 * s), loc(0, -0.005, 0.1), q);
    for (const sd of [1, -1]) {
      m.add(DARK, new THREE.SphereGeometry(0.03 * s, 5, 4), loc(sd * 0.05, 0.1, 0.085), q);
      m.add(DARK, new THREE.SphereGeometry(0.012 * s, 4, 3), loc(sd * 0.025, 0.0, 0.19), q);
    }
    m.flush();
    for (const sd of [1, -1]) {
      const p0 = loc(sd * 0.07, 0.15, 0.0);
      const p1 = loc(sd * 0.2, 0.17, -0.04);
      const p2 = loc(sd * 0.26, 0.03, 0.04);
      const p3 = loc(sd * 0.17, -0.03, 0.13);
      b.sweep(catmull([p0, p1, p2, p3]), [0.035 * s, 0.01 * s], { color: BONE, bone: root, sides: 6, caps: { start: "flat", end: "point" }, name });
    }
  }
  skull(V(0, t2 + 0.0, 1.0), V(0, 0.15, 1), 1.0, "ramSkull");
  skull(V(0, t1 + 0.0, 1.3), V(0, 0.15, 1), 0.7, "ramSkullSmall");

  const candles = merger(root);
  for (const [cx, cz, cy] of [
    [0.48, 0.86, t2],
    [0.62, 0.78, t2],
    [-0.5, 0.84, t2],
    [-0.62, 0.76, t2],
    [0.0, -0.95, t2],
    [0.15, -0.9, t2],
    [-0.12, -0.92, t2],
  ] as const) {
    const ch = 0.1 + rnd() * 0.12;
    candles.add(BONE, new THREE.CylinderGeometry(0.03, 0.034, ch, 6), V(cx, cy + ch / 2, cz));
    candles.add(WOOD_D, new THREE.CylinderGeometry(0.003, 0.003, 0.03, 3), V(cx, cy + ch + 0.012, cz));
    candles.add(FIRE_L, new THREE.ConeGeometry(0.018, 0.06, 5), V(cx, cy + ch + 0.05, cz), undefined, undefined, 1.4);
    candles.add(BONE_D, new THREE.CylinderGeometry(0.04, 0.04, 0.012, 6), V(cx, cy + 0.006, cz));
  }
  candles.flush();
  // scroll and bowl of gems on the altar top rim
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.3, 8), "#e9d9a8", {
    bone: root,
    at: [0.32, altarTop + 0.12, 0.2],
    rotation: [0, 70, 90],
    name: "scroll",
  });
  fixed.add(RED, new THREE.CylinderGeometry(0.038, 0.038, 0.03, 8), V(0.32, altarTop + 0.12, 0.2), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 1.2, Math.PI / 2)));

  // ---- braziers at the gaps
  const flames = merger(root);
  for (let k = 0; k < 4; k++) {
    const az = 45 + 90 * k;
    const c = polar(1.65, az);
    const topH = 0.62;
    for (let l = 0; l < 3; l++) {
      const a = (l / 3) * Math.PI * 2 + az * DEG;
      const foot = c.clone().add(V(Math.cos(a) * 0.2, G, Math.sin(a) * 0.2));
      b.rod(foot, c.clone().add(V(Math.cos(a) * 0.09, topH, Math.sin(a) * 0.09)), [0.022, 0.018], { color: IRON, bone: root, sides: 5, name: "brazierLeg" });
      fixed.add(BRONZE, rivetGeo, foot.clone().add(V(0, 0.02, 0)), undefined, 1.4);
    }
    b.lathe(
      [
        [0, 0],
        [0.1, 0],
        [0.13, 0.04],
        [0.2, 0.17],
        [0.225, 0.22],
        [0.2, 0.22],
        [0.12, 0.14],
        [0, 0.12],
      ],
      { at: c.clone().add(V(0, topH - 0.02, 0)), segments: 8, color: IRON, bone: root, name: "brazierBowl" },
    );
    b.lathe(
      [
        [0.2, 0],
        [0.235, 0],
        [0.235, 0.035],
        [0.2, 0.035],
      ],
      { at: c.clone().add(V(0, topH + 0.17, 0)), segments: 8, color: GOLD, bone: root, name: "brazierRim" },
    );
    flames.add(EMBER, new THREE.SphereGeometry(0.17, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2), c.clone().add(V(0, topH + 0.16, 0)), undefined, V(1, 0.5, 1), 1.2);
    flames.add(FIRE, new THREE.ConeGeometry(0.13, 0.44, 6), c.clone().add(V(0, topH + 0.38, 0)), undefined, undefined, 1.5);
    flames.add(FIRE, new THREE.ConeGeometry(0.08, 0.32, 5), c.clone().add(V(0.11, topH + 0.32, 0.04)), aim(V(0.25, 1, 0)), undefined, 1.5);
    flames.add(FIRE, new THREE.ConeGeometry(0.08, 0.28, 5), c.clone().add(V(-0.1, topH + 0.3, -0.05)), aim(V(-0.25, 1, 0.1)), undefined, 1.5);
    flames.add(FIRE_L, new THREE.ConeGeometry(0.075, 0.3, 5), c.clone().add(V(0, topH + 0.33, 0)), undefined, undefined, 1.8);
    for (let e = 0; e < 5; e++) {
      flames.add(FIRE_L, new THREE.OctahedronGeometry(0.014, 0), c.clone().add(V((rnd() - 0.5) * 0.3, topH + 0.7 + rnd() * 0.3, (rnd() - 0.5) * 0.3)), undefined, undefined, 1.8);
    }
  }
  flames.flush();

  // ---- entrance stakes with skulls and crimson banners
  const banner: OutlinePoint[] = [
    [-0.17, 0],
    [0.17, 0],
    [0.17, -0.7],
    [0.0, -0.58],
    [-0.17, -0.7],
  ];
  for (const sd of [1, -1]) {
    const pos = polar(3.15, sd * 30);
    b.sweep([pos, pos.clone().add(V(0, 2.0, 0))], [0.075, 0.05], {
      color: grain(WOOD_D, WOOD, { size: 0.06, axis: "y" }),
      bone: root,
      sides: 6,
      caps: "flat",
      name: "stake",
    });
    // stone cairn at its foot
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      fixed.add([STONE_M, "#6a7d9a", STONE_D][k % 3], rockGeo, pos.clone().add(V(Math.cos(a) * 0.17, 0.1, Math.sin(a) * 0.17)), yaw(k), V(1.1, 0.9, 1.1));
    }
    skull(pos.clone().add(V(0, 1.96, 0)), polar(1, sd * 30), 0.8, "stakeSkull");
    // crossbar and banner on a hinge joint
    const barY = 1.62;
    const swing = b.joint(sd > 0 ? "bannerL" : "bannerR", { parent: root, at: pos.clone().add(V(0, barY, 0)), role: "hinge" });
    const barDir = V(Math.cos(sd * 30 * DEG), 0, -Math.sin(sd * 30 * DEG));
    const outDir = polar(1, sd * 30);
    b.rod(pos.clone().addScaledVector(barDir, -0.26).setY(barY), pos.clone().addScaledVector(barDir, 0.26).setY(barY), 0.022, { color: WOOD_D, bone: swing, sides: 6, name: "crossbar" });
    for (const e of [-1, 1]) fixed.add(GOLD, new THREE.SphereGeometry(0.035, 6, 4), pos.clone().addScaledVector(barDir, e * 0.27).setY(barY));
    b.extrude(banner, {
      at: pos.clone().add(V(0, barY - 0.02, 0)).addScaledVector(outDir, 0.07),
      x: barDir,
      y: UP,
      thickness: 0.016,
      bevel: 0.004,
      color: paint((_p, n, s) => {
        const edge = Math.min(s[0] + 0.17, 0.17 - s[0], 0.0 - s[1] + 0.0);
        if (Math.abs(n.y) < 0.5 && Math.abs(n.dot(outDir)) < 0.5) return BRONZE_D;
        const borderDist = Math.min(0.17 - Math.abs(s[0]), -s[1]);
        if (borderDist < 0.022 || edge < 0.0) return GOLD;
        return mix(RED, RED_D, clamp(-s[1] / 0.7, 0, 1) * 0.6 + noise(new THREE.Vector3(s[0] * 3, s[1] * 3, 0), 0.4, 4) * 0.25);
      }),
      bone: swing,
      name: "banner",
    });
    b.part(new THREE.PlaneGeometry(0.2, 0.25), "#ffffff", {
      bone: swing,
      at: pos.clone().add(V(0, barY - 0.3, 0)).addScaledVector(outDir, 0.07 + 0.012),
      dir: outDir,
      axis: "z",
      texture: sigilGold,
      name: "bannerSigil",
    });
  }

  // ---- dressing: crystals, rocks, plants
  for (let k = 0; k < 5; k++) {
    const az = k * 72 + 20;
    const c = polar(2.95, az);
    c.y = 0.07;
    addCrystal(glowSmall, c, V(0.1, 1, 0.1), 1.3);
    addCrystal(glowSmall, c.clone().add(V(0.14, 0, 0.06)), V(0.5, 1, 0), 0.9);
    addCrystal(glowSmall, c.clone().add(V(-0.1, 0, 0.1)), V(-0.4, 1, 0.3), 0.75);
    for (let m = 0; m < 3; m++) {
      fixed.add([STONE_M, STONE_D, "#6a7d9a"][m], rockGeo, c.clone().add(V((rnd() - 0.5) * 0.4, 0.04, (rnd() - 0.5) * 0.4)), yaw(rnd() * 6), V(1.2, 0.8, 1.1));
    }
  }
  for (let k = 0; k < 26; k++) {
    const az = rnd() * 360;
    if (Math.abs(((az + 180) % 360) - 180) < 14) continue;
    const at = polar(2.8 + rnd() * 0.6, az);
    at.y = 0.07;
    fixed.add([STONE_M, STONE_D, "#6a7d9a", "#7f93b0"][k % 4], rockGeo, at, yaw(rnd() * 6), V(0.5 + rnd() * 0.8, 0.4 + rnd() * 0.5, 0.5 + rnd() * 0.8));
  }
  for (let k = 0; k < 190; k++) {
    const az = rnd() * 360;
    const rr = 2.76 + rnd() * 0.62;
    if (Math.abs(((az + 180) % 360) - 180) < 9 && rr < 2.9) continue;
    const at = polar(rr, az);
    at.y = 0.07;
    (k % 9 === 0 ? fernFrames : tuftFrames).push(frame(at, [0, 1, 0]));
  }
  for (let k = 0; k < 40; k++) {
    const at = polar(2.45 + rnd() * 0.2, rnd() * 360);
    at.y = G;
    tuftFrames.push(frame(at, [0, 1, 0]));
  }
  const flowerFrames: Frame[] = [];
  for (let k = 0; k < 22; k++) {
    const at = polar(2.85 + rnd() * 0.55, rnd() * 360);
    at.y = 0.07;
    flowerFrames.push(frame(at, [0, 1, 0]));
  }
  for (let k = 0; k < 4; k++) {
    const az = 20 + k * 90;
    const c = polar(3.0, az + 30);
    for (let m = 0; m < 5; m++) {
      const at = c.clone().add(V((rnd() - 0.5) * 0.3, 0.07, (rnd() - 0.5) * 0.3));
      const s = 0.6 + rnd() * 0.8;
      mushrooms.add(BONE, new THREE.CylinderGeometry(0.014 * s, 0.02 * s, 0.07 * s, 5), at.clone().add(V(0, 0.035 * s, 0)));
      mushrooms.add("#58d6ff", new THREE.SphereGeometry(0.05 * s, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2), at.clone().add(V(0, 0.07 * s, 0)), undefined, V(1, 0.7, 1), 1.1);
    }
  }

  // cards
  b.cards(tuftFrames, grassTex, { size: [0.17, 0.2], lean: 8, flow: [0.2, -0.3, -1], cross: true, vary: 0.35, spin: 180, rng: rng(5), bone: root });
  b.cards(fernFrames, fernTex, { size: [0.3, 0.38], lean: 25, bend: 40, cross: true, vary: 0.3, spin: 180, rng: rng(6), bone: root });
  b.cards(flowerFrames, flowerTex, { size: [0.08, 0.22], lean: 5, cross: true, vary: 0.3, spin: 180, rng: rng(7), bone: root });
  b.cards(leafFrames, leafTex, { size: [0.1, 0.15], lean: 60, bend: 20, vary: 0.3, spin: 180, rng: rng(8), flow: [0, -0.5, -1], bone: root });
  [featherA, featherB].forEach((tex, n) => {
    const set = featherSets[n];
    b.cards(set.frames, tex, { size: [0.07, 0.26], lean: 180, flow: (_f, k) => set.flows[k], bend: 20, bone: root, sink: 0 });
  });

  fixed.flush();
  mushrooms.flush();
  glowSmall.flush();
  return b.root;
}
```

## Example: armoryWeaponRack

Brief: Category: Prop group.
Subject: chunky hand-painted armory rack crowded with shields, blades, helmets, spear and axe.
Style: Blizzard/Warcraft.
Topology: prop-group
Style family: blizzard-warcraft
Notable features: rack, shields, blades, helmets, spear

```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import type { Fill } from "agentic-3js-builder";
import { grain } from "agentic-3js-builder";

const WOOD_DARK = "#24130f";
const WOOD = grain("#5b3020", "#946038", { size: 0.16, axis: "y", seed: 31 });
const WOOD_LIGHT = "#a66a3f";
const IRON = "#252a31";
const IRON_EDGE = "#4d5861";
const STEEL = "#64717a";
const STEEL_HI = "#b4c1c7";
const GOLD = "#b77c25";
const GOLD_HI = "#edc15a";
const LEATHER = "#3b1d18";
const RED = "#791f27";
const BLUE = "#1d4776";
const CREAM = "#d0b98a";

export const meta = {
  name: "Warcraft Armory Weapon Rack",
  description: "A chunky hand-painted armory rack crowded with shields, blades, helmets, a spear and an axe.",
  style: "Blizzard/Warcraft",
  commit: "9555ebf",
};

type Vec = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "armoryWeaponRack", detail: 1 });
  const root = b.joint("rackRoot", { at: [0, 0, 0], role: "spine" });

  const box = (name: string, size: Vec, at: Vec, color: Fill, rotation?: Vec) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      name,
      bone: root,
      at,
      rotation,
      flat: true,
    });

  const cylinder = (
    name: string,
    radius: number,
    depth: number,
    at: Vec,
    color: Fill,
    rotation?: Vec,
    segments = 10,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, segments), color, {
      name,
      bone: root,
      at,
      rotation,
      flat: true,
    });

  const sphere = (name: string, radius: number, at: Vec, color: Fill) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, { name, bone: root, at, flat: true });

  // Heavy timber carcass: broad feet, a deep plinth, two uprights, a shelf and a crowned lintel.
  box("basePlinth", [2.28, 0.18, 0.64], [0, 0.09, 0], WOOD);
  box("baseFrontLip", [2.12, 0.11, 0.08], [0, 0.19, 0.31], WOOD_LIGHT);
  box("baseShadow", [1.86, 0.08, 0.08], [0, 0.205, -0.31], WOOD_DARK);
  for (const s of [-1, 1]) {
    box(`foot${s < 0 ? "L" : "R"}`, [0.46, 0.18, 0.72], [s * 0.82, 0.27, 0], WOOD_DARK);
    box(`upright${s < 0 ? "L" : "R"}`, [0.2, 1.62, 0.34], [s * 0.95, 1.04, 0], WOOD);
    box(`uprightFace${s < 0 ? "L" : "R"}`, [0.06, 1.43, 0.07], [s * 0.84, 1.07, 0.205], WOOD_LIGHT);
    box(`uprightIronBand${s < 0 ? "L" : "R"}`, [0.26, 0.1, 0.39], [s * 0.95, 1.55, 0], IRON);
    box(`uprightIronBandLow${s < 0 ? "L" : "R"}`, [0.26, 0.1, 0.39], [s * 0.95, 0.48, 0], IRON);
  }
  box("topLintel", [2.22, 0.22, 0.44], [0, 1.88, 0], WOOD);
  box("topLintelFace", [2.0, 0.09, 0.07], [0, 1.79, 0.235], WOOD_LIGHT);
  box("middleShelf", [1.86, 0.14, 0.48], [0, 1.56, -0.01], WOOD_DARK);
  box("middleShelfFront", [1.76, 0.1, 0.08], [0, 1.61, 0.245], WOOD_LIGHT);

  // Back slats and warm metal brackets make the silhouette read as an actual rack.
  for (const [i, x] of [-0.61, 0, 0.61].entries()) {
    box(`backSlat${i}`, [0.22, 1.38, 0.12], [x, 0.89, -0.18], WOOD_DARK);
    box(`backSlatHighlight${i}`, [0.05, 1.22, 0.03], [x + 0.08, 0.92, -0.248], WOOD_LIGHT);
  }
  for (const s of [-1, 1]) {
    box(`shelfBracket${s < 0 ? "L" : "R"}`, [0.1, 0.34, 0.1], [s * 0.69, 1.41, 0.18], GOLD);
    box(`shelfBracketFoot${s < 0 ? "L" : "R"}`, [0.28, 0.07, 0.1], [s * 0.69, 1.25, 0.18], GOLD);
  }

  // Painted iron rivets across the timber joinery.
  const rivetPositions: Vec[] = [
    [-1.0, 1.76, 0.25], [1.0, 1.76, 0.25], [-0.95, 0.57, 0.25], [0.95, 0.57, 0.25],
    [-0.78, 0.2, 0.34], [0.78, 0.2, 0.34], [-0.58, 1.66, 0.27], [0.58, 1.66, 0.27],
  ];
  for (const [i, p] of rivetPositions.entries()) sphere(`rivet${i}`, 0.035, p, GOLD_HI);

  const shieldOutline = (scale: number): [number, number][] => [
    [0, 0], [0.19 * scale, 0.1 * scale], [0.245 * scale, 0.32 * scale],
    [0.17 * scale, 0.56 * scale], [0, 0.69 * scale], [-0.17 * scale, 0.56 * scale],
    [-0.245 * scale, 0.32 * scale], [-0.19 * scale, 0.1 * scale],
  ];

  const shield = (side: -1 | 1, color: string, name: string) => {
    const x = side * 0.62;
    const y = 0.86;
    // Gold outer silhouette under a thick painted shield face.
    b.extrude(shieldOutline(1.08), {
      name: `${name}Rim`,
      bone: root,
      at: [x, y, 0.29],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.055,
      bevel: 0.014,
      color: GOLD,
    });
    b.extrude(shieldOutline(0.96), {
      name: `${name}Face`,
      bone: root,
      at: [x, y + 0.015, 0.335],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.01,
      color,
    });
    b.extrude([
      [-0.13, 0.05], [0.13, 0.05], [0.16, 0.17], [0, 0.3], [-0.16, 0.17],
    ], {
      name: `${name}Chevron`,
      bone: root,
      at: [x, y + 0.03, 0.362],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.004,
      color: side < 0 ? GOLD_HI : CREAM,
    });
    cylinder(`${name}Boss`, 0.075, 0.045, [x, y + 0.33, 0.39], GOLD_HI, [90, 0, 0], 10);
    cylinder(`${name}BossDark`, 0.044, 0.052, [x, y + 0.33, 0.418], IRON, [90, 0, 0], 8);
    for (const [i, [dx, dy]] of [[-0.15, 0.16], [0.15, 0.16], [-0.12, 0.48], [0.12, 0.48]].entries())
      sphere(`${name}Rivet${i}`, 0.021, [x + dx, y + dy, 0.395], GOLD_HI);
  };
  shield(-1, BLUE, "shieldL");
  shield(1, RED, "shieldR");

  // The central greatsword hangs forward of the backboard, with a broad painted blade.
  b.extrude([
    [-0.075, 0], [0.075, 0], [0.062, 0.5], [0.018, 0.8], [0, 0.91, "sharp"],
    [-0.018, 0.8], [-0.062, 0.5],
  ], {
    name: "greatswordBlade",
    bone: root,
    at: [0, 0.48, 0.39],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: [0.052, 0.025],
    bevel: 0.008,
    color: STEEL,
  });
  box("greatswordFuller", [0.025, 0.67, 0.018], [0, 0.88, 0.425], STEEL_HI);
  box("greatswordGuard", [0.34, 0.07, 0.09], [0, 1.3, 0.4], GOLD);
  b.rod([0, 1.33, 0.4], [0, 1.56, 0.4], 0.035, { name: "greatswordGrip", color: LEATHER, bone: root, section: { ngon: 6 } });
  sphere("greatswordPommel", 0.06, [0, 1.6, 0.4], GOLD_HI);
  cylinder("greatswordPommelCap", 0.028, 0.025, [0, 1.65, 0.4], IRON, undefined, 8);

  // A spear is tucked behind the left shield, with a faceted steel point and collar.
  b.rod([-0.32, 0.37, 0.18], [-0.32, 1.54, 0.18], 0.027, { name: "spearShaft", color: WOOD_LIGHT, bone: root, section: { ngon: 6 } });
  cylinder("spearGrip", 0.041, 0.28, [-0.32, 0.57, 0.18], LEATHER, undefined, 8);
  cylinder("spearCollar", 0.052, 0.065, [-0.32, 1.51, 0.18], GOLD, undefined, 8);
  b.spike([-0.32, 1.54, 0.18], [0, 1, 0], 0.3, 0.075, { name: "spearHead", color: STEEL_HI, bone: root, section: { ngon: 6 }, caps: "point" });
  box("spearHeadInlay", [0.024, 0.17, 0.02], [-0.32, 1.66, 0.235], GOLD);

  // An axe leans across the lower right bay; the separate head gives it a readable silhouette.
  b.rod([0.28, 0.36, 0.35], [0.88, 1.4, 0.35], 0.034, { name: "axeHandle", color: WOOD_LIGHT, bone: root, section: { ngon: 6 } });
  cylinder("axeGrip", 0.052, 0.3, [0.42, 0.59, 0.35], LEATHER, [0, 30, 0], 8);
  b.extrude([
    [-0.02, 0], [0.15, 0.04], [0.27, 0.2], [0.24, 0.37], [0.1, 0.46],
    [-0.04, 0.4], [-0.11, 0.2],
  ], {
    name: "axeBlade",
    bone: root,
    at: [0.85, 1.3, 0.42],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: [0.065, 0.03],
    bevel: 0.012,
    color: STEEL,
  });
  box("axeHeadSocket", [0.11, 0.16, 0.12], [0.86, 1.35, 0.42], IRON);
  sphere("axeEndCap", 0.045, [0.28, 0.36, 0.35], GOLD);

  // Two squat helmets sit on the shelf. Low-sided lathes keep the chunky Warcraft facets.
  const helmet = (side: -1 | 1, name: string, accent: string) => {
    const x = side * 0.61;
    b.lathe([
      [0, 0], [0.18, 0], [0.2, 0.055], [0.19, 0.13], [0.145, 0.24], [0.09, 0.31], [0, 0.34],
    ], {
      name: `${name}Dome`, bone: root, at: [x, 1.68, 0.24], segments: 10, color: IRON,
    });
    box(`${name}Brow`, [0.38, 0.07, 0.08], [x, 1.86, 0.39], STEEL);
    box(`${name}NoseGuard`, [0.07, 0.22, 0.07], [x, 1.76, 0.44], STEEL_HI);
    box(`${name}CheekL`, [0.08, 0.2, 0.15], [x - 0.16, 1.73, 0.29], IRON_EDGE, [0, 0, -8]);
    box(`${name}CheekR`, [0.08, 0.2, 0.15], [x + 0.16, 1.73, 0.29], IRON_EDGE, [0, 0, 8]);
    box(`${name}Crest`, [0.055, 0.25, 0.12], [x, 2.02, 0.25], accent, [0, 0, 0]);
    cylinder(`${name}BrowStudL`, 0.025, 0.035, [x - 0.13, 1.87, 0.44], GOLD_HI, [90, 0, 0], 8);
    cylinder(`${name}BrowStudR`, 0.025, 0.035, [x + 0.13, 1.87, 0.44], GOLD_HI, [90, 0, 0], 8);
  };
  helmet(-1, "helmetL", RED);
  helmet(1, "helmetR", BLUE);

  // Small painted trim plates and hanging hooks fill the negative spaces without cluttering the silhouette.
  for (const [i, x] of [-0.4, 0.4].entries()) {
    box(`hookPlate${i}`, [0.16, 0.13, 0.035], [x, 1.53, 0.28], GOLD);
    cylinder(`hook${i}`, 0.018, 0.18, [x, 1.42, 0.3], IRON_EDGE, [90, 0, 0], 7);
    sphere(`hookTip${i}`, 0.026, [x, 1.33, 0.3], GOLD_HI);
  }

  // A few chunky corner caps sell the hand-forged, riveted construction.
  for (const [i, x] of [-1.0, 1.0].entries()) {
    cylinder(`topCap${i}`, 0.09, 0.08, [x, 1.99, 0], GOLD, undefined, 8);
    sphere(`baseCap${i}`, 0.07, [x, 0.38, 0.18], GOLD_HI);
  }

  return b.root;
}
```

## Example: kingCobraSonnet

Brief: Category: Animal.
Subject: rearing king cobra with a huge flared hood, chevron scales, glowing hood rim, throat rune, crest and horns.
Style: League of Legends.
Topology: serpentine
Style family: league-of-legends
Notable features: hood, scales, rearing, glow, crest

```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { frame } from "agentic-3js-builder";
import { DEG } from "agentic-3js-builder";
import { bezier, catmull, polyline } from "agentic-3js-builder";
import { mix, paint, scales, smoothstep } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "King Cobra, Rearing (Arcane Jade)",
  description:
    "A rearing king cobra with a huge flared hood, jade-and-gold chevron scales, a glowing cyan hood rim, rune throat, dorsal crystal crest and back-swept horns, in a League of Legends style.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// ---------- palette ----------
const JADE = "#0e6a73";
const JADE_D = "#07343f";
const JADE_L = "#1f9a9a";
const GOLD = "#ffc43a";
const GOLD_D = "#c47f12";
const CREAM = "#fff0bd";
const BELLY = "#ffd776";
const BELLY_D = "#d99a2c";
const CYAN = "#3df5ff";
const AMBER = "#ffa514";
const MOUTH = "#6b0f3c";
const TONGUE = "#ff3b7a";
const FANG = "#fff8e2";
const BLACK = "#080d12";

// ---------- helpers ----------
function interp(tab: number[][], x: number) {
  if (x <= tab[0][0]) return tab[0][1];
  for (let i = 1; i < tab.length; i++) {
    if (x <= tab[i][0]) {
      const k = (x - tab[i - 1][0]) / (tab[i][0] - tab[i - 1][0]);
      const e = k * k * (3 - 2 * k);
      return tab[i - 1][1] + (tab[i][1] - tab[i - 1][1]) * e;
    }
  }
  return tab[tab.length - 1][1];
}
const sm = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const TAIL_R = [
  [0, 0.011],
  [0.45, 0.028],
  [1.3, 0.066],
  [2.3, 0.092],
  [9, 0.098],
];
const HEAD_R = [
  [0, 0.064],
  [0.3, 0.06],
  [0.8, 0.066],
  [1.3, 0.074],
  [1.9, 0.086],
  [2.7, 0.098],
  [9, 0.098],
];

// ---------- drawings ----------
const EYE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#ff8a00"/>
    <circle cx="50" cy="50" r="40" fill="#ffc21f"/>
    <circle cx="50" cy="50" r="30" fill="#ffe36a"/>
    <ellipse cx="50" cy="50" rx="13" ry="25" fill="#0a0508"/>
    <circle cx="40" cy="38" r="6" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

const SPECTACLE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="42" fill="none" stroke="#3df5ff" stroke-width="7"/>
    <circle cx="50" cy="50" r="27" fill="none" stroke="#3df5ff" stroke-width="5"/>
    <circle cx="50" cy="50" r="10" fill="#3df5ff"/>
    <g stroke="#3df5ff" stroke-width="5" stroke-linecap="round">
      <line x1="50" y1="3" x2="50" y2="15"/><line x1="50" y1="85" x2="50" y2="97"/>
      <line x1="3" y1="50" x2="15" y2="50"/><line x1="85" y1="50" x2="97" y2="50"/>
      <line x1="17" y1="17" x2="25" y2="25"/><line x1="83" y1="17" x2="75" y2="25"/>
      <line x1="17" y1="83" x2="25" y2="75"/><line x1="83" y1="83" x2="75" y2="75"/>
    </g>
  </svg>`,
  { size: 256 },
);


export default function build() {
  const b = createBuilder({ name: "kingCobra" });

  // ================= body path (tail tip -> head base) =================
  const LAM = 2.2;
  const A0 = 0.6;
  const UMAX = 2.45;
  const ZB = 0.34;
  const ground: number[][] = [];
  const us: number[] = [];
  for (let u = UMAX; u > 0.001; u -= 0.11) us.push(u);
  us.push(0);
  let dd = 0;
  let prev: number[] | null = null;
  for (const u of us) {
    const amp = A0 * sm(0, 0.5, u) * (1 - 0.35 * sm(1.4, UMAX, u));
    const x = amp * Math.sin((2 * Math.PI * u) / LAM);
    const z = ZB - u;
    if (prev) dd += Math.hypot(x - prev[0], z - prev[1]);
    prev = [x, z];
    const r = interp(TAIL_R, dd);
    const flick = 0.5 * Math.pow(Math.max(0, 1 - dd / 0.6), 2);
    ground.push([x, r * 0.98 + flick, z]);
  }
  const rise = [
    [0.1, 0.46],
    [0.22, 0.63],
    [0.5, 0.74],
    [0.82, 0.64],
    [1.1, 0.46],
    [1.32, 0.33],
    [1.47, 0.33],
    [1.57, 0.41],
    [1.6, 0.55],
  ].map(([y, z]) => [0, y, z]);
  const pts = [...ground, ...rise];
  const body = catmull(pts);
  const L = body.length;
  const rad = (t: number) => Math.min(interp(TAIL_R, t * L), interp(HEAD_R, (1 - t) * L));

  // ================= skeleton =================
  const corePt = ground[ground.length - 1];
  const coreT = body.closestT(corePt);
  const core = b.joint("core", { at: corePt, dir: [0, 0.2, 1], role: "spine" });
  const neck = b.chain("neck", body.slice(coreT, 1), { parent: core, count: 9, role: "neck" });
  const tT = body.closestT(ground[Math.round(ground.length * 0.42)]);
  const spine = b.chain("spine", body.slice(coreT, tT), { parent: core, count: 9, role: "spine" });
  const tail = b.chain("tail", body.slice(tT, 0), {
    parent: spine.joints[spine.joints.length - 1],
    count: 11,
    role: "tail",
  });

  // ---------- body paint ----------
  const P = 0.2;
  const darkScales = scales(JADE, JADE_D, { size: 0.05, width: 0.14 });
  const goldScales = scales(GOLD, GOLD_D, { size: 0.05, width: 0.14 });
  const bodyPaint = paint((_p, _n, s) => {
    const d = s[0] * L;
    const raw = ((s[1] % 360) + 360) % 360;
    const a = raw > 180 ? 360 - raw : raw;
    if (a > 146) {
      const sc = (((d / 0.055) % 1) + 1) % 1;
      return sc < 0.13 ? BELLY_D : BELLY;
    }
    if (a > 100) return mix(JADE_L, BELLY, smoothstep(104, 148, a));
    const ph = ((((d + 0.0016 * a) / P) % 1) + 1) % 1;
    if (ph < 0.15) return goldScales;
    if (ph < 0.21) return JADE_D;
    return darkScales;
  });

  const bodyS = b.sweep(body, rad, { bone: [tail, spine, core, neck], color: bodyPaint });

  // ================= head =================
  const HS = 1.3;
  const neckEnd = neck.joints[neck.joints.length - 1];
  const head = b.joint("head", { parent: neckEnd, at: body.at(1), dir: [0, -0.2, 1], role: "head" });
  const hp = (o: { forward?: number; up?: number; down?: number; left?: number }) =>
    head.local({
      forward: (o.forward ?? 0) * HS,
      up: (o.up ?? 0) * HS,
      down: (o.down ?? 0) * HS,
      left: (o.left ?? 0) * HS,
    });
  const jaw = b.joint("jaw", {
    parent: head,
    at: hp({ forward: 0.03, down: 0.05 }),
    aim: hp({ forward: 0.3, down: 0.05 }),
    role: "jaw",
  });

  // station tables: forward, up, width, height (scaled by HS)
  const UP = [
    [-0.05, 0.0, 0.13, 0.115],
    [0.04, 0.008, 0.19, 0.13],
    [0.13, 0.012, 0.21, 0.125],
    [0.21, 0.006, 0.16, 0.105],
    [0.29, -0.004, 0.115, 0.088],
    [0.355, -0.012, 0.09, 0.072],
  ].map((r) => r.map((v) => v * HS));
  const LOW = [
    [0.0, -0.06, 0.15, 0.05],
    [0.09, -0.066, 0.17, 0.054],
    [0.19, -0.062, 0.13, 0.046],
    [0.28, -0.056, 0.093, 0.038],
    [0.345, -0.05, 0.07, 0.032],
  ].map((r) => r.map((v) => v * HS));
  const at4 = (tab: number[][], f: number) => {
    let i = 1;
    while (i < tab.length - 1 && f > tab[i][0]) i++;
    const a = tab[i - 1];
    const c = tab[i];
    const k = Math.min(1, Math.max(0, (f - a[0]) / (c[0] - a[0])));
    return { u: a[1] + (c[1] - a[1]) * k, w: a[2] + (c[2] - a[2]) * k, h: a[3] + (c[3] - a[3]) * k };
  };

  const headScales = scales(JADE, JADE_D, { size: 0.042, width: 0.16 });
  const headPaint = paint((_p, _n, s) => {
    const raw = ((s[1] % 360) + 360) % 360;
    const a = raw > 180 ? 360 - raw : raw;
    if (a > 150) return MOUTH;
    if (a > 118) return CREAM;
    if (a > 108) return BLACK;
    if (a > 85) return mix(JADE_L, CREAM, smoothstep(88, 108, a));
    return headScales;
  });

  const skull = b.loft(
    UP.map(([f, u, w, h]) => ({ at: head.local({ forward: f, up: u }), w, h })),
    { bone: head, color: headPaint },
  );
  b.loft(
    LOW.map(([f, u, w, h]) => ({ at: head.local({ forward: f, up: u }), w, h })),
    {
      bone: jaw,
      color: BELLY,
      sectors: [
        [-75, 75, MOUTH],
        [75, 105, CREAM],
        [-105, -75, CREAM],
      ],
    },
  );

  // brow ridges, nostrils, crest horns, eyes
  for (const sx of [1, -1]) {
    b.sweep(
      [
        hp({ forward: 0.25, up: 0.05, left: sx * 0.055 }),
        hp({ forward: 0.16, up: 0.078, left: sx * 0.09 }),
        hp({ forward: 0.06, up: 0.082, left: sx * 0.095 }),
      ],
      [0.01, 0.02],
      { bone: head, color: GOLD, caps: { start: "point", end: "round" }, sides: 6 },
    );
    glow(
      b.decal(skull, EYE, {
        at: hp({ forward: 0.15, up: 0.022, left: sx * 0.1 }),
        dir: [sx, 0.05, 0.35],
        up: [0, 1, 0],
        size: [0.1, 0.1],
        segments: 6,
        lift: 0.003,
        bone: head,
      }),
      1,
    );
    b.stick(new THREE.SphereGeometry(0.013, 5, 4), BLACK, b.surface(skull).nearest(hp({ forward: 0.33, up: 0.02, left: sx * 0.028 })), {
      embed: 0.4,
    });

    // swept-back crown horns
    b.sweep(
      bezier(
        hp({ forward: 0.02, up: 0.055, left: sx * 0.065 }),
        hp({ forward: -0.08, up: 0.1, left: sx * 0.1 }),
        hp({ forward: -0.22, up: 0.2, left: sx * 0.15 }),
      ),
      [0.036, 0.0],
      {
        bone: head,
        color: GOLD,
        bands: [
          [0.3, GOLD_D],
          [1, GOLD],
        ],
        caps: { start: "flat", end: "point" },
        sides: 6,
      },
    );
    // cheek spike
    b.spike(hp({ forward: 0.0, down: 0.03, left: sx * 0.09 }), head.dir([sx * 0.9, -0.9, -0.15]), 0.08, 0.022, {
      bone: head,
      color: GOLD,
      sides: 6,
    });
  }
  // brow gem
  glow(
    b.stick(new THREE.OctahedronGeometry(0.03).scale(0.8, 1.7, 1.0), CYAN, b.surface(skull).nearest(hp({ forward: 0.085, up: 0.1 })), {
      embed: 0.35,
    }),
    1.2,
  );

  // teeth and fangs
  for (const sx of [1, -1]) {
    for (let i = 0; i < 6; i++) {
      const f = (0.11 + i * 0.04) * HS;
      const st = at4(UP, f);
      const base = head.local({ forward: f, up: st.u - 0.64 * (st.h / 2), left: sx * 0.77 * (st.w / 2) });
      b.spike(base, head.dir([0, 0, -1]), 0.026, 0.007, { bone: head, color: FANG, sides: 4 });
    }
    for (let i = 0; i < 6; i++) {
      const f = (0.1 + i * 0.045) * HS;
      const st = at4(LOW, f);
      const base = head.local({ forward: f, up: st.u + 0.64 * (st.h / 2), left: sx * 0.77 * (st.w / 2) });
      b.spike(base, head.dir([0, 0, 1]), 0.024, 0.007, { bone: jaw, color: FANG, sides: 4 });
    }
    b.spike(hp({ forward: 0.255, up: -0.026, left: sx * 0.03 }), head.dir([0, -0.22, -1]), 0.14, 0.02, {
      bone: head,
      color: FANG,
      sides: 6,
    });
    glow(
      b.part(new THREE.SphereGeometry(0.011, 5, 4), CYAN, {
        bone: head,
        at: hp({ forward: 0.235, up: -0.145, left: sx * 0.03 }),
        scale: [1, 1.5, 1],
      }),
      1.4,
    );
  }

  // open the mouth slightly
  b.pose(jaw, { axis: [1, 0, 0], deg: 17 });

  // forked tongue
  const tp = [
    hp({ forward: 0.2, down: 0.055 }),
    hp({ forward: 0.34, down: 0.13 }),
    hp({ forward: 0.46, down: 0.15 }),
    hp({ forward: 0.55, down: 0.135 }),
  ];
  const tongue = b.chain("tongue", catmull(tp), { parent: jaw, count: 3, role: "tentacle" });
  b.sweep(tongue, [0.016, 0.01], { color: TONGUE, sides: 6 });
  const tj = tongue.joints[tongue.joints.length - 1];
  for (const sx of [1, -1]) {
    b.sweep(
      bezier(tp[3], hp({ forward: 0.6, down: 0.13, left: sx * 0.015 }), hp({ forward: 0.65, down: 0.105, left: sx * 0.05 })),
      [0.01, 0.0],
      { bone: tj, color: TONGUE, caps: { end: "point" }, sides: 5 },
    );
  }

  // ================= hood =================
  const tTop = body.closestT([0, 1.5, 0.42]);
  const tBot = body.closestT([0, 0.8, 0.52]);
  const WMAX = 0.44;
  const KR = 8;
  const HOOD_PIV = 0.8;
  const hoodPaint = paint((p, n, s) => {
    const dx = Math.abs(p.x);
    const dy = p.y - HOOD_PIV;
    const ang = Math.atan2(dx, dy) / DEG;
    const r = Math.hypot(dx, dy);
    const step = 9;
    const lat = Math.abs(ang - step * Math.round(ang / step)) * DEG * r;
    const edge = s[1];
    if (Math.abs(n.z) < 0.6) return GOLD_D;
    if (n.z > 0) {
      if (edge > 0.93) return JADE_D;
      if (edge > 0.86) return GOLD;
      if (lat < 0.0065 && r > 0.1) return JADE;
      return mix(CREAM, AMBER, smoothstep(0.3, 0.95, edge));
    }
    if (edge > 0.93) return GOLD_D;
    if (edge > 0.86) return GOLD;
    if (lat < 0.005 && r > 0.12) return GOLD_D;
    return backScales;
  });
  const backScales = scales(JADE, JADE_D, { size: 0.045, width: 0.14 });

  const hoods = [];
  for (const sx of [1, -1]) {
    const S = sx > 0 ? "L" : "R";
    const ribPts: number[][] = [];
    for (let i = 0; i <= KR; i++) {
      const u = i / KR;
      const t = tTop + (tBot - tTop) * u;
      const c = body.at(t);
      const w = 0.075 + (WMAX - 0.075) * Math.sin(Math.PI * Math.pow(u, 0.72));
      ribPts.push([c.x + sx * w, c.y + 0.02 * Math.sin(Math.PI * u), c.z - 0.045 * (w / WMAX)]);
    }
    const rib = b.chain(`hood${S}`, catmull(ribPts), {
      parent: neckEnd,
      names: Array.from({ length: KR + 1 }, (_, i) => `hood${S}${i + 1}`),
      role: "fan",
    });
    hoods.push(b.membrane(body.slice(tTop, tBot), rib, { thickness: 0.03, color: hoodPaint, rows: 4 }));
    glow(b.sweep(rib, 0.016, { color: CYAN, sides: 6 }), 1.1);
    // inner echo arc on the front face of the hood
    const echo: number[][] = [];
    for (let i = 1; i < KR; i++) {
      const u = i / KR;
      const c = body.at(tTop + (tBot - tTop) * u);
      const w = 0.075 + (WMAX - 0.075) * Math.sin(Math.PI * Math.pow(u, 0.72));
      echo.push([c.x + sx * w * 0.78, c.y + 0.016 * Math.sin(Math.PI * u), c.z - 0.036 * (w / WMAX) + 0.02]);
    }
    glow(b.sweep(catmull(echo), 0.0065, { color: CYAN, sides: 4, bone: rib }), 0.9);
    // gold spikes along the hood rim
    for (let i = 1; i < rib.joints.length; i++) {
      const j = rib.joints[i];
      const out = [sx * 0.8, i < 3 ? 0.55 : i > 6 ? -0.5 : 0.15, -0.25];
      const len = 0.05 + 0.06 * Math.sin(Math.PI * (i / rib.joints.length));
      b.spike(j, out, len, 0.018, { bone: j, color: GOLD, sides: 5 });
    }
    // upswept hood tips
    const j0 = rib.joints[0];
    const p0 = j0.at;
    b.sweep(
      bezier(p0, [p0.x + sx * 0.08, p0.y + 0.12, p0.z - 0.01], [p0.x + sx * 0.2, p0.y + 0.22, p0.z - 0.1]),
      [0.03, 0.0],
      {
        bone: j0,
        color: GOLD,
        bands: [
          [0.35, GOLD_D],
          [1, GOLD],
        ],
        caps: { start: "flat", end: "point" },
        sides: 6,
      },
    );
  }

  // spectacle glyphs on the back of the hood, rune ladder on the throat
  const tMid = tTop + (tBot - tTop) * 0.4;
  const cMid = body.at(tMid);
  for (const sx of [1, -1]) {
    glow(
      b.decal(hoods, SPECTACLE, {
        at: [cMid.x + sx * 0.2, cMid.y, cMid.z - 0.06],
        dir: [0, 0, -1],
        up: [0, 1, 0],
        size: [0.22, 0.22],
        segments: 8,
        lift: 0.003,
        mirror: sx > 0,
      }),
      1.1,
    );
  }

  // collar of gold rings and a pendant gem under the hood
  const skin = b.surface(bodyS);
  const tCol = body.closestT([0, 0.78, 0.5]);
  for (const [dt, r] of [
    [0, 0.02],
    [0.012, 0.012],
    [-0.012, 0.012],
  ] as const) {
    const tt = tCol + dt;
    const ring = skin.loop(frame(body.at(tt), body.tangentAt(tt)), { lift: 0.006 });
    b.sweep(ring, r, { color: GOLD, sides: 6 });
  }
  const gemHit = skin.ray([0, body.at(tCol).y, 2], [0, 0, -1]);
  if (gemHit) {
    glow(b.stick(new THREE.OctahedronGeometry(0.04).scale(0.8, 1.5, 0.9), CYAN, gemHit, { embed: 0.3 }), 1.2);
    b.stick(new THREE.CylinderGeometry(0.03, 0.04, 0.02, 6), GOLD, gemHit, { embed: 0.3 });
  }
  // glowing rune ladder down the throat, draped onto the skin
  for (let k = 0; k < 5; k++) {
    const tc = body.closestT([0, 0.98 + k * 0.1, 0.44]);
    const c = body.at(tc);
    const chev = [
      [-0.06, -0.045],
      [-0.03, -0.015],
      [0, 0.0],
      [0.03, -0.015],
      [0.06, -0.045],
    ].map(([x, y]) => [c.x + x, c.y + y, c.z + 0.12]);
    glow(b.sweep(skin.drape(polyline(chev), { lift: 0.004 }), 0.0055, { color: CYAN, sides: 5 }), 1.1);
  }

  // luminous dorsal vein, tail tip to hood
  glow(
    b.sweep(bodyS.line(0, 0.004).slice(0.012, tBot), 0.0075, {
      color: "#19c9e6",
      sides: 4,
      bone: [tail, spine, core, neck],
    }),
    0.8,
  );

  // ================= dorsal crystals =================
  for (let k = 0; ; k++) {
    const d = k * P + 0.6 * P;
    if (d > L - 0.28) break;
    if (d < 0.75) continue;
    const g = sm(0, 1, d / L);
    const h = 0.02 + 0.03 * g;
    const hit = bodyS.at(d / L, 0);
    glow(b.stick(new THREE.OctahedronGeometry(h).scale(0.5, 1.6, 0.6), CYAN, hit, { embed: 0.25 }), 1.2);
  }
  // tail-tip crystal
  const tipHit = bodyS.at(0.004, 0);
  glow(b.stick(new THREE.OctahedronGeometry(0.03).scale(0.7, 2.4, 0.7), CYAN, tipHit, { embed: 0.2 }), 1.4);

  // jewelled gold armbands round the thick body
  for (const at of [
    [0, 0.1, ZB - 1.1],
    [0, 0.1, ZB - 2.2],
    [0, 0.55, 0.72],
  ]) {
    const tb = body.closestT(at);
    for (const [dt, r] of [
      [0, 0.016],
      [0.011, 0.01],
      [-0.011, 0.01],
    ] as const) {
      const ring = skin.loop(frame(body.at(tb + dt), body.tangentAt(tb + dt)), { lift: 0.004 });
      b.sweep(ring, r, { color: GOLD, sides: 6 });
    }
    glow(b.stick(new THREE.OctahedronGeometry(0.03).scale(0.8, 1.3, 0.8), CYAN, bodyS.at(tb, 0), { embed: 0.3 }), 1.3);
  }

  return b.root;
}
```
