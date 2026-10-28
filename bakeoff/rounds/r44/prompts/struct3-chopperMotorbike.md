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

These are complete, typecheck-clean reference modules. They are examples, not templates: design the requested subject yourself, reuse API shapes and construction techniques where useful, and do not copy a reference subject or its composition. The picker supplied three structural matches for topology vehicle.

## Example: jetFighterSonnet

Brief: Category: Vehicle.
Subject: twin-engine delta-canard strike fighter with landing gear, canopy, hinged controls, missiles, vectoring nozzles and glowing strips.
Style: Overwatch.
Topology: vehicle-winged
Style family: overwatch
Notable features: delta-wings, canards, landing-gear, missiles, glow

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { glow } from "agentic-3js-builder/kits/glow";
import { createBuilder } from "agentic-3js-builder";
import { frame } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";
import { aim, DEG } from "agentic-3js-builder";
import { paint } from "agentic-3js-builder";
import { catmull } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Vanguard VX-04 Strike Fighter",
  description:
    "Twin-engine delta-canard strike fighter parked on its landing gear: white and graphite hull with bold orange colour blocking, panel-lined paint, hinged control surfaces, gear, canopy and vectoring nozzles, underwing missiles and glowing light strips.",
  style: "Overwatch",
  commit: "88fc1f0",
};

type P3 = [number, number, number];

// palette: white hull, graphite trim, one strong orange accent
const WHITE = "#eef2f7";
const WHITE2 = "#dde3ec";
const GREY = "#a9b3c2";
const GREY_D = "#7a8596";
const LINE = "#8f9bad";
const LINE_D = "#566170";
const STEEL = "#4d5666";
const STEEL_L = "#c3cbd7";
const CHROME = "#e3e8f0";
const GRAPH = "#272d38";
const INK = "#12161d";
const ORANGE = "#ff7a14";
const ORANGE_D = "#d4570a";
const TIRE = "#1d2128";
const TIRE2 = "#2a2f38";
const RED = "#ff2d3d";
const GREEN = "#2be072";
const HOT = "#ffd28a";
const STROBE = "#fff8e6";

export default function build() {
  const b = createBuilder({ name: "jetFighter", paintSize: 2048 });
  const hull = b.joint("hull", { at: [0, 2.05, 0] });
  type J = typeof hull;

  // ---------------------------------------------------------------- batching of small static details
  const pending = new Map<string, { bone: J; color: string; geos: THREE.BufferGeometry[] }>();
  const stash = (bone: J, color: string, g: THREE.BufferGeometry) => {
    const key = `${bone.name}|${color}`;
    const slot = pending.get(key) ?? { bone, color, geos: [] };
    slot.geos.push(g);
    pending.set(key, slot);
  };
  const bx = (bone: J, color: string, w: number, h: number, d: number, x: number, y: number, z: number, rot?: P3) => {
    const g = new THREE.BoxGeometry(w, h, d);
    if (rot) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG)));
    g.translate(x, y, z);
    stash(bone, color, g);
  };
  const cyl = (bone: J, color: string, r0: number, r1: number, len: number, from: P3, dir: P3, seg = 8) => {
    const g = new THREE.CylinderGeometry(r1, r0, len, seg);
    g.translate(0, len / 2, 0);
    g.applyQuaternion(aim(dir));
    g.translate(from[0], from[1], from[2]);
    stash(bone, color, g);
  };
  const ball = (bone: J, color: string, r: number, x: number, y: number, z: number, sx = 1, sy = 1, sz = 1) => {
    const g = new THREE.SphereGeometry(r, 5, 3);
    g.scale(sx, sy, sz);
    g.translate(x, y, z);
    stash(bone, color, g);
  };

  // ---------------------------------------------------------------- textures
  const T = {
    number: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 120"><text x="4" y="102" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="124" fill="${GRAPH}">04</text><path d="M158 14 L214 14 L196 46 L140 46 Z" fill="${ORANGE}"/><path d="M146 58 L202 58 L190 80 L134 80 Z" fill="${ORANGE}"/></svg>`,
      { size: 440 },
    ),
    emblem: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="none" stroke="${ORANGE}" stroke-width="9"/><path d="M60 20 L90 84 L60 70 L30 84 Z" fill="${GRAPH}"/><path d="M18 74 L48 62 M102 74 L72 62" stroke="${ORANGE}" stroke-width="7" fill="none"/><rect x="40" y="92" width="40" height="7" fill="${ORANGE}"/></svg>`,
      { size: 360 },
    ),
    panelsA: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 96"><g fill="none" stroke="${LINE_D}" stroke-width="2.4"><rect x="4" y="6" width="104" height="58" rx="5"/><rect x="118" y="6" width="116" height="34" rx="5"/><rect x="118" y="48" width="52" height="40" rx="5"/><path d="M182 88 L234 88 M182 70 L234 70"/></g><g fill="${GRAPH}" font-family="Arial, sans-serif" font-weight="800"><text x="12" y="30" font-size="15">AVIONICS</text><text x="12" y="52" font-size="11">BAY 2 - HOT</text><text x="126" y="30" font-size="14">DATALINK</text><text x="124" y="64" font-size="11">GND</text><text x="124" y="80" font-size="11">PWR</text></g><path d="M82 70 L96 94 L68 94 Z" fill="none" stroke="${ORANGE}" stroke-width="3.2"/><rect x="81" y="78" width="3" height="8" fill="${ORANGE}"/><g fill="${LINE_D}"><circle cx="10" cy="12" r="2"/><circle cx="102" cy="12" r="2"/><circle cx="10" cy="58" r="2"/><circle cx="102" cy="58" r="2"/><circle cx="124" cy="12" r="2"/><circle cx="228" cy="12" r="2"/><circle cx="124" cy="34" r="2"/><circle cx="228" cy="34" r="2"/></g></svg>`,
      { size: 480 },
    ),
    panelsB: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 96"><g fill="none" stroke="${LINE_D}" stroke-width="2.4"><rect x="6" y="8" width="70" height="46" rx="6"/><circle cx="116" cy="30" r="22"/><circle cx="116" cy="30" r="12"/><rect x="152" y="8" width="80" height="46" rx="5"/><path d="M6 72 L232 72 M6 86 L232 86"/></g><g fill="${GRAPH}" font-family="Arial, sans-serif" font-weight="800"><text x="14" y="36" font-size="18">FUEL</text><text x="160" y="30" font-size="13">OXYGEN</text><text x="160" y="46" font-size="10">SERVICE</text></g><path d="M100 30 L132 30 M116 14 L116 46" stroke="${ORANGE}" stroke-width="3.4"/><rect x="6" y="75" width="40" height="8" fill="${ORANGE}"/><rect x="52" y="75" width="40" height="8" fill="${GRAPH}"/><rect x="98" y="75" width="40" height="8" fill="${ORANGE}"/><rect x="144" y="75" width="40" height="8" fill="${GRAPH}"/><rect x="190" y="75" width="40" height="8" fill="${ORANGE}"/></svg>`,
      { size: 480 },
    ),
    rescue: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60"><path d="M6 30 L40 8 L40 22 L74 22 L74 38 L40 38 L40 52 Z" fill="${ORANGE}"/><text x="82" y="42" font-family="Arial, sans-serif" font-weight="900" font-size="30" fill="${GRAPH}">RESCUE</text><path d="M80 10 L196 10" stroke="${GRAPH}" stroke-width="4"/></svg>`,
      { size: 400 },
    ),
    step: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 70"><rect x="3" y="3" width="194" height="64" rx="8" fill="none" stroke="${GRAPH}" stroke-width="4"/><text x="100" y="46" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="34" fill="${GRAPH}">NO STEP</text><path d="M14 12 L30 12 M170 12 L186 12 M14 58 L30 58 M170 58 L186 58" stroke="${ORANGE}" stroke-width="5"/></svg>`,
      { size: 400 },
    ),
    hazard: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 32"><rect width="256" height="32" fill="${GRAPH}"/>${Array.from({ length: 12 }, (_, i) => `<path d="M${i * 24 - 8} 32 L${i * 24 + 8} 0 L${i * 24 + 20} 0 L${i * 24 + 4} 32 Z" fill="${ORANGE}"/>`).join("")}</svg>`,
      { size: 512 },
    ),
    flag: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40"><rect width="160" height="40" fill="#e0202e"/><text x="6" y="26" textLength="148" lengthAdjust="spacingAndGlyphs" font-family="Arial, sans-serif" font-weight="900" font-size="15" fill="#ffffff">REMOVE BEFORE FLIGHT</text></svg>`,
      { size: 320 },
    ),
    core: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#c8480c"/><circle cx="50" cy="50" r="44" fill="#ff6a10"/><circle cx="50" cy="50" r="36" fill="#ff9a2a"/><circle cx="50" cy="50" r="27" fill="#ffd27a"/><circle cx="50" cy="50" r="16" fill="#fff1d0"/><circle cx="50" cy="50" r="7" fill="#ffffff"/><path d="M50 50 L50 6 M50 50 L81 19 M50 50 L94 50 M50 50 L81 81 M50 50 L50 94 M50 50 L19 81 M50 50 L6 50 M50 50 L19 19" stroke="#e5590c" stroke-width="3"/></svg>`,
      { size: 256 },
    ),
    grill: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#0d1015"/><circle cx="50" cy="50" r="46" fill="#171b22"/>${Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const a2 = a + 0.28;
        return `<path d="M${50 + Math.cos(a) * 16} ${50 + Math.sin(a) * 16} L${50 + Math.cos(a) * 45} ${50 + Math.sin(a) * 45} L${50 + Math.cos(a2) * 45} ${50 + Math.sin(a2) * 45} Z" fill="#434d5d"/>`;
      }).join("")}<circle cx="50" cy="50" r="15" fill="#7d8899"/><circle cx="50" cy="50" r="7" fill="#c3cbd7"/></svg>`,
      { size: 256 },
    ),
    danger: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 50"><path d="M4 42 L22 8 L40 42 Z" fill="none" stroke="${ORANGE}" stroke-width="5"/><rect x="20" y="18" width="4" height="12" fill="${ORANGE}"/><text x="50" y="38" font-family="Arial, sans-serif" font-weight="900" font-size="28" fill="${ORANGE}">INTAKE</text></svg>`,
      { size: 320 },
    ),
    walk: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 200"><rect x="3" y="3" width="114" height="194" rx="6" fill="#2b323d" stroke="#eef2f7" stroke-width="4"/>${Array.from({ length: 10 }, (_, r) => Array.from({ length: 6 }, (_, c) => `<circle cx="${14 + c * 18}" cy="${16 + r * 18}" r="3.4" fill="#4a5362"/>`).join("")).join("")}<path d="M6 190 L114 190" stroke="${ORANGE}" stroke-width="5"/></svg>`,
      { size: 300 },
    ),
  };

  // ---------------------------------------------------------------- paints
  const seamNear = (v: number, c: number, w: number) => Math.abs(v - c) < w;
  const TRANS = [5.1, 4.35, 3.55, 2.75, 1.6, 0.5, -0.7, -1.9, -3.1, -4.2, -5.3];
  const ANG_SEAMS: [number, number, number][] = [
    [42, -5, 3.4],
    [74, -4.6, 2],
    [-42, -5.2, 5],
  ];
  const HATCHES: [number, number, number, number][] = [
    [-1.6, -0.35, 6, 30],
    [-3.7, -2.2, -8, 24],
    [4.95, 5.55, 8, 34],
    [1.9, 2.8, 52, 80],
    [-2.6, -1.4, 56, 82],
    [0.2, 1.3, -28, -8],
  ];

  const fusePaint = paint((p, n) => {
    const x = Math.abs(p.x);
    const y = p.y;
    const z = p.z;
    const ang = Math.atan2(y - 2.05, x) / DEG;
    const belly = ang < -36;
    // aft thermal zone
    if (z < -5.75) return n.z < -0.4 ? GRAPH : STEEL;
    if (z < -5.15 && !belly) return z < -5.45 ? STEEL : GREY_D;
    // flank swoosh stripe
    const yc = 2.1 + 0.03 * (z - 2);
    const hh = 0.06 + 0.022 * ((5.8 - z) / 6);
    if (!belly && ang > -30 && ang < 38 && z > -4.2 && z < 5.8) {
      if (Math.abs(y - yc) < hh) return ORANGE;
      if (Math.abs(y - (yc - hh - 0.075)) < 0.013 && z > -3 && z < 5.2) return ORANGE;
    }
    // nose-top stripe
    if (!belly && ang > 50 && z > 4.9 && z < 6.5) {
      if (x < 0.06) return ORANGE;
      if (x < 0.5 - (z - 4.9) * 0.2) return GRAPH;
    }
    // belly bays: nose-gear well and weapons bay
    if (belly) {
      if (x < 0.27 && z > 4.3 && z < 5.55) return INK;
      if (x < 0.5 && z > -0.2 && z < 2.2) return seamNear(x, 0.5, 0.012) || seamNear(z, 2.2, 0.012) || seamNear(z, -0.2, 0.012) ? ORANGE : GREY_D;
      if (x < 0.1 && z < -1) return GREY_D;
    }
    // panel lines
    const lineCol = belly ? LINE_D : LINE;
    for (const t of TRANS) {
      if (seamNear(z, t, 0.009)) return lineCol;
      if (seamNear(z, t - 0.032, 0.004) && Math.floor(ang * 1.1) % 2 === 0 && !belly) return lineCol;
    }
    for (const [a, z0, z1] of ANG_SEAMS) if (z > z0 && z < z1 && seamNear(ang, a, 0.8)) return lineCol;
    for (const [z0, z1, a0, a1] of HATCHES) {
      if (z > z0 - 0.01 && z < z1 + 0.01 && ang > a0 - 0.9 && ang < a1 + 0.9) {
        if (seamNear(z, z0, 0.009) || seamNear(z, z1, 0.009) || seamNear(ang, a0, 0.8) || seamNear(ang, a1, 0.8)) return lineCol;
      }
    }
    return belly ? GREY : WHITE;
  });

  const leZ = (u: number) => (u < 2.4 ? 5.6 - (u - 0.5) * (3.6 / 1.9) : 2.0 - (u - 2.4) * (4.5 / 3.35));
  const hZ = (u: number) => -3.15 - (5.6 - u) * 0.2188;
  const ctrlDepth = (u: number) => 0.58 + (5.58 - u) * 0.06;

  const wingPaint = paint((p, n) => {
    const u = Math.abs(p.x);
    const z = p.z;
    if (u > 5.2) return ORANGE;
    const top = n.y > 0;
    if (Math.abs(n.y) < 0.5) return u > 2.3 && z - leZ(u) > -0.3 ? GREY_D : GREY;
    const dle = (leZ(u) - z) * 0.8;
    if (dle < 0.2) return top ? GREY_D : GRAPH;
    if (dle < 0.235) return ORANGE_D;
    if (top && u > 2.5 && dle > 0.42 && dle < 0.5) return ORANGE;
    if (top && u > 2.5 && dle > 0.5 && dle < 0.53) return GRAPH;
    // trailing zone near hinge line: shadow gap
    const dh = z - hZ(u);
    if (dh < 0.03 && dh > -0.03) return top ? LINE : LINE_D;
    const lc = top ? LINE : LINE_D;
    const a = z + 0.32 * u;
    const ma = ((a % 1.45) + 1.45) % 1.45;
    if (Math.min(ma, 1.45 - ma) < 0.009) return lc;
    const mb = ((u % 1.3) + 1.3) % 1.3;
    if (Math.min(mb, 1.3 - mb) < 0.009 && dle > 0.6) return lc;
    // rivet row beside the rib lines
    if (Math.abs(mb - 0.05) < 0.005 && Math.floor(z * 14) % 2 === 0 && dle > 0.6) return lc;
    // underside bays
    if (!top && u > 1.1 && u < 2.1 && z < 0.7 && z > -2.3 && (seamNear(u, 1.1, 0.012) || seamNear(u, 2.1, 0.012) || seamNear(z, 0.7, 0.012) || seamNear(z, -2.3, 0.012))) return ORANGE_D;
    return top ? WHITE : GREY;
  });

  const ctrlPaint = paint((p, n) => {
    const u = Math.abs(p.x);
    const z = p.z;
    if (Math.abs(n.y) < 0.5) return GREY;
    const top = n.y > 0;
    const trailing = hZ(u) - ctrlDepth(u) - z;
    if (trailing > -0.13) return ORANGE;
    if (trailing > -0.145) return GRAPH;
    const ma = ((u * 1.0) % 0.55 + 0.55) % 0.55;
    if (Math.min(ma, 0.55 - ma) < 0.008) return top ? LINE : LINE_D;
    return top ? WHITE : GREY;
  });

  const finPaint = paint((p, n) => {
    if (Math.abs(n.x) < 0.5) return GREY;
    if (p.y > 3.95) return ORANGE;
    if (p.y > 3.9) return GRAPH;
    if (seamNear(p.y, 3.35, 0.009) || seamNear(p.z, -2.55, 0.009)) return LINE;
    return WHITE;
  });

  const rudderPaint = paint((p, n) => {
    if (Math.abs(n.x) < 0.5) return GREY;
    if (p.y > 3.95) return ORANGE;
    if (p.y > 3.9) return GRAPH;
    if (seamNear(p.y, 3.2, 0.008) || seamNear(p.y, 2.85, 0.008)) return LINE;
    return p.z < -5.3 ? ORANGE : WHITE;
  });

  const tailplanePaint = paint((p, n) => {
    const u = Math.abs(p.x);
    if (Math.abs(n.y) < 0.5) return GREY;
    if (u > 3.3) return ORANGE;
    const top = n.y > 0;
    const a = p.z + 0.5 * u;
    const ma = ((a % 1.1) + 1.1) % 1.1;
    if (Math.min(ma, 1.1 - ma) < 0.008) return top ? LINE : LINE_D;
    return top ? WHITE : GREY;
  });

  const canardPaint = paint((p, n) => {
    const u = Math.abs(p.x);
    if (u > 2.15) return ORANGE;
    if (Math.abs(n.y) < 0.5) return GREY;
    const top = n.y > 0;
    const a = p.z + 0.6 * u;
    const ma = ((a % 0.7) + 0.7) % 0.7;
    if (Math.min(ma, 0.7 - ma) < 0.007) return top ? LINE : LINE_D;
    return top ? GRAPH : STEEL;
  });

  const spinePaint = paint((p, n) => {
    const z = p.z;
    const x = Math.abs(p.x);
    if (n.y > 0.6 && x < 0.1) return ORANGE;
    if (n.y > 0.6 && x < 0.135) return GRAPH;
    for (const t of [1.6, 0.4, -0.9, -2.2, -3.4]) if (seamNear(z, t, 0.009)) return LINE;
    if (n.y < 0.2) return GREY;
    if (z < -3.6) return STEEL;
    return WHITE2;
  });

  const intakePaint = paint((p, n) => {
    const z = p.z;
    if (z > 3.34) return ORANGE;
    if (z > 3.3) return GRAPH;
    if (n.y < -0.4) return GREY;
    if (seamNear(z, 2.4, 0.009) || seamNear(z, 1.2, 0.009) || seamNear(z, 0.2, 0.009)) return LINE;
    if (z > 3.0 && z < 3.3 && Math.abs(p.y - 1.88) > 0.12) return WHITE2;
    return WHITE;
  });

  const sponsonPaint = paint((p, n) => {
    const x = Math.abs(p.x);
    if (n.y < -0.5 && p.z > -2.5 && p.z < 0.5 && Math.abs(x - 1.55) < 0.22) return INK;
    if (n.y < -0.5) return GREY_D;
    if (seamNear(p.z, -0.8, 0.009) || seamNear(p.z, -2.0, 0.009)) return LINE;
    return p.z < -2.9 ? ORANGE : WHITE;
  });

  const doorPaint = paint((p, n) => {
    const sideSign = Math.sign(p.x);
    if (Math.abs(n.x) < 0.5) return GREY_D;
    if (n.x * sideSign < 0) return ORANGE;
    if (seamNear(p.z, -1.0, 0.008)) return LINE;
    return WHITE;
  });

  const radomePaint = paint((p, n) => {
    if (n.y > 0.75 && Math.abs(p.x) < 0.05) return "#7886a0";
    if (seamNear(p.z, 7.35, 0.012) || seamNear(p.z, 7.9, 0.012)) return STEEL;
    return p.z < 6.62 ? ORANGE : "#343c4a";
  });

  const glassPaint = paint((p) => {
    const k = p.x * 0.75 - p.z * 0.5 + p.y * 0.35;
    if (Math.abs(k - 0.02) < 0.035) return "#a9dcf0";
    if (Math.abs(k + 0.2) < 0.012) return "#7fc0e0";
    if (Math.abs(k - 0.34) < 0.05) return "#4f93b8";
    if (p.y > 3.25) return "#2a6a92";
    if (p.y > 3.0) return "#1b4d72";
    return "#12354f";
  });

  const nozzlePaint = paint((_p, n, s) => {
    const seam = ((s[1] % 22.5) + 22.5) % 22.5;
    if (Math.abs(n.y) + Math.abs(n.x) > 0.01 && (seam < 1.4 || seam > 21.1)) return INK;
    if (s[0] > 0.62) return "#6c5f7a";
    if (s[0] > 0.45) return "#59546c";
    return STEEL;
  });

  const podPaint = paint((p) => {
    if (Math.abs(p.z + 2.3) < 0.012 || Math.abs(p.z + 3.4) < 0.012) return GRAPH;
    return p.z > -2.35 ? ORANGE : WHITE;
  });

  const tyrePaint = paint((_p, n, s) => {
    if (Math.abs(n.x) < 0.55) return Math.floor(s[1] / 14) % 2 === 0 ? TIRE : TIRE2;
    return Math.abs(n.x) > 0.95 ? TIRE : "#2f3540";
  });

  // ---------------------------------------------------------------- fuselage
  const fuse = b.loft(
    [
      { at: [0, 1.98, 6.5], w: 0.86, h: 0.78 },
      { at: [0, 2.0, 5.6], w: 1.28, h: 1.05 },
      { at: [0, 2.04, 4.4], w: 1.74, h: 1.38 },
      { at: [0, 2.08, 3.0], w: 2.15, h: 1.62 },
      { at: [0, 2.1, 1.0], w: 2.55, h: 1.72 },
      { at: [0, 2.1, -1.5], w: 2.85, h: 1.74 },
      { at: [0, 2.1, -3.5], w: 2.85, h: 1.64 },
      { at: [0, 2.08, -5.0], w: 2.85, h: 1.5 },
      { at: [0, 2.05, -6.0], w: 2.8, h: 1.34 },
    ],
    { bone: hull, sides: 20, color: fusePaint, caps: { start: "flat", end: "flat" }, name: "fuselage" },
  );

  // radome
  b.lathe(
    [
      [0, 0],
      [0.43, 0],
      [0.425, 0.28],
      [0.35, 0.8],
      [0.22, 1.35],
      [0.09, 1.75],
      [0.0, 1.95],
    ],
    { at: [0, 1.98, 6.45], axis: [0, 0, 1], bone: hull, color: radomePaint, segments: 18, name: "radome" },
  );
  // pitot probe + flag
  b.sweep([[0, 1.98, 8.38], [0, 1.98, 9.15]], [0.026, 0.012], { bone: hull, color: STEEL_L, sides: 6, caps: { start: "flat", end: "point" }, name: "pitot" });
  for (const zz of [8.6, 8.8]) b.sweep([[0, 1.98, zz], [0, 1.98, zz + 0.08]], 0.03, { bone: hull, color: ORANGE, sides: 6, caps: "flat", name: "pitotBand" });
  b.part(new THREE.BoxGeometry(0.36, 0.09, 0.006), "#ffffff", { bone: hull, at: [0, 1.94, 8.5], dir: [0, 0, 1], texture: T.flag, rotation: [0, 0, 0], name: "pitotFlag" });
  // chin sensor ball
  b.part(new THREE.SphereGeometry(0.15, 10, 8), STEEL, { bone: hull, at: [0, 1.46, 5.75], name: "irst" });
  glow(b.part(new THREE.SphereGeometry(0.075, 8, 6), ORANGE, { bone: hull, at: [0, 1.44, 5.87], name: "irstLens" }), 1.2);

  // dorsal spine
  b.loft(
    [
      { at: [0, 2.92, 2.6], w: 0.8, h: 0.4 },
      { at: [0, 2.92, 1.0], w: 1.3, h: 0.44 },
      { at: [0, 2.92, -1.0], w: 1.6, h: 0.46 },
      { at: [0, 2.88, -3.0], w: 1.4, h: 0.4 },
      { at: [0, 2.84, -4.8], w: 0.9, h: 0.3 },
    ],
    { bone: hull, sides: 12, color: spinePaint, name: "spine" },
  );
  // spine vents + antennas
  for (let i = 0; i < 7; i++) bx(hull, GRAPH, 0.34, 0.03, 0.07, 0, 3.15 - i * 0.012, -1.4 - i * 0.28);
  bx(hull, GRAPH, 0.5, 0.05, 0.22, 0, 3.0, -4.75);
  b.extrude([[0, 0], [0.34, 0], [0.16, 0.34], [0.06, 0.34]], { at: [0, 3.05, -2.3], x: [0, 0, -1], thickness: 0.03, bevel: 0.008, color: WHITE, bone: hull, name: "antennaDorsal" });
  b.extrude([[0, 0], [0.3, 0], [0.12, 0.28], [0.04, 0.28]], { x: [0, 0, 1], at: [0, 1.36, 0.3], y: [0, -1, 0], thickness: 0.03, bevel: 0.008, color: GREY, bone: hull, name: "antennaBelly" });
  glow(b.part(new THREE.SphereGeometry(0.06, 8, 6), RED, { bone: hull, at: [0, 3.15, -0.15], name: "beacon" }), 1.4);
  glow(b.part(new THREE.SphereGeometry(0.05, 8, 6), RED, { bone: hull, at: [0, 1.32, -1.0], name: "beaconBelly" }), 1.4);

  // flank decals
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.decal(fuse, T.panelsA, { at: [s * 1.38, 2.0, -2.6], dir: [s, 0, 0], size: [1.5, 0.6], segments: 14, name: `panelsA${side}` });
    b.decal(fuse, T.panelsB, { at: [s * 1.2, 2.18, -0.6], dir: [s, 0, 0], size: [1.5, 0.6], segments: 14, name: `panelsB${side}` });
    b.decal(fuse, T.emblem, { at: [s * 0.82, 2.2, 4.75], dir: [s, 0.25, 0.1], size: [0.4, 0.4], segments: 8, name: `emblem${side}` });
    b.decal(fuse, T.rescue, { at: [s * 0.74, 2.5, 3.2], dir: [s, 0.5, 0], size: [0.55, 0.17], segments: 8, name: `rescue${side}` });
  }

  // ---------------------------------------------------------------- canopy
  const canopy = b.joint("canopy", { parent: hull, at: [0, 2.62, 2.15], dir: [1, 0, 0], role: "hinge" });
  const CC = { y: 2.55, z: 3.95, rx: 0.62, ry: 0.97, rz: 1.85 };
  const glass = new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  b.part(glass, glassPaint, { bone: canopy, at: [0, CC.y, CC.z], scale: [CC.rx, CC.ry, CC.rz], name: "canopyGlass" });
  const rib = (dz: number) => {
    const k = Math.sqrt(Math.max(0, 1 - (dz / CC.rz) ** 2));
    const pts: P3[] = [];
    for (let i = 0; i <= 8; i++) {
      const a = (Math.PI * i) / 8;
      pts.push([Math.cos(a) * CC.rx * k * 1.02, CC.y + Math.sin(a) * CC.ry * k * 1.02, CC.z + dz]);
    }
    return catmull(pts);
  };
  for (const dz of [-1.35, -0.55, 0.45, 1.2]) b.sweep(rib(dz), 0.022, { bone: canopy, color: GRAPH, sides: 6, caps: "none", name: "canopyRib" });
  for (const a of [18, 90, 162]) {
    const pts: P3[] = [];
    for (let i = 0; i <= 10; i++) {
      const dz = -1.45 + (i / 10) * 2.85;
      const k = Math.sqrt(Math.max(0, 1 - (dz / CC.rz) ** 2));
      pts.push([Math.cos(a * DEG) * CC.rx * k * 1.02, CC.y + Math.sin(a * DEG) * CC.ry * k * 1.02, CC.z + dz]);
    }
    b.sweep(catmull(pts), a === 90 ? 0.026 : 0.02, { bone: canopy, color: a === 90 ? ORANGE : GRAPH, sides: 6, caps: "none", name: "canopyRail" });
  }
  {
    const base: P3[] = [];
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      base.push([Math.cos(a) * CC.rx * 1.0, CC.y + 0.02, CC.z + Math.sin(a) * CC.rz * 1.0]);
    }
    b.sweep(catmull(base, { closed: true }), 0.04, { bone: canopy, color: STEEL, sides: 6, name: "canopySill" });
  }
  // windscreen bow and HUD glass bracket
  bx(canopy, GRAPH, 0.9, 0.05, 0.1, 0, 2.86, 5.38, [-18, 0, 0]);
  // canopy glints
  b.part(new THREE.BoxGeometry(0.03, 0.02, 0.9), "#d8f2ff", { bone: canopy, at: [0.26, 3.28, 3.7], rotation: [-8, 0, -30], name: "glint" });
  b.part(new THREE.BoxGeometry(0.03, 0.02, 0.5), "#d8f2ff", { bone: canopy, at: [-0.32, 3.18, 4.4], rotation: [-26, 0, 28], name: "glint2" });

  // ---------------------------------------------------------------- intakes
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const cx = s * 1.35;
    b.loft(
      [
        { at: [cx, 1.88, 3.55], w: 0.82, h: 0.74 },
        { at: [cx + s * 0.005, 1.88, 2.4], w: 0.88, h: 0.8 },
        { at: [cx + s * 0.03, 1.88, 1.0], w: 0.92, h: 0.84 },
        { at: [cx + s * 0.05, 1.88, -0.4], w: 0.78, h: 0.76 },
      ],
      { bone: hull, sides: 8, smooth: false, color: intakePaint, caps: { start: "flat", end: "round" }, name: `intake${side}` },
    );
    b.part(new THREE.CircleGeometry(0.35, 8, 22.5 * DEG), "#ffffff", { bone: hull, at: [cx, 1.88, 3.557], dir: [0, 0, 1], axis: "z", texture: T.grill, name: `grill${side}` });
    // boundary-layer splitter and lip glow
    bx(hull, STEEL_L, 0.03, 0.62, 0.34, s * 0.97, 1.88, 3.35);
    glow(b.part(new THREE.BoxGeometry(0.03, 0.012, 0.22), HOT, { bone: hull, at: [cx + s * 0.32, 1.88, 3.45], name: `intakeGlow${side}` }), 1.2);
    // cheek vents, chine louvers
    for (let i = 0; i < 5; i++) bx(hull, GRAPH, 0.02, 0.2, 0.05, s * (1.37 + 0.45 + 0.0), 1.9, 2.8 - i * 0.3);
    // danger marking
    b.part(new THREE.PlaneGeometry(0.5, 0.16), "#ffffff", { bone: hull, at: [s * 1.805, 2.12, 1.9], dir: [s, 0, 0], axis: "z", texture: T.danger, name: `danger${side}` });
    // intake top ramp wedge
    b.extrude([[0, 0], [1.3, 0], [1.0, 0.1], [0.1, 0.1]], { at: [s * 1.35, 2.25, 3.4], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.7, bevel: 0.02, color: WHITE2, bone: hull, name: `rampTop${side}` });
    // bolt ring round the intake lip
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      ball(hull, CHROME, 0.016, s * 1.35 + Math.cos(a) * 0.4, 1.88 + Math.sin(a) * 0.37, 3.575);
    }
  }

  // ---------------------------------------------------------------- wings & control surfaces
  const wingOutline: OutlinePoint[] = [
    [0.5, 5.6],
    [2.4, 2.0, "sharp"],
    [5.75, -2.5],
    [5.6, -3.15],
    [0.5, hZ(0.5)],
  ];
  const ctrl = (u0: number, u1: number): OutlinePoint[] => [
    [u0, hZ(u0) + 0.02],
    [u1, hZ(u1) + 0.02],
    [u1, hZ(u1) - ctrlDepth(u1)],
    [u0, hZ(u0) - ctrlDepth(u0)],
  ];
  const WY = 2.0;
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.extrude(wingOutline, { at: [0, WY, 0], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.16, bevel: 0.05, color: wingPaint, bone: hull, name: `wing${side}` });
    const ail = b.joint(`aileron${side}`, { parent: hull, at: [s * 3.75, WY, hZ(3.75)], aim: [s * 5.58, WY, hZ(5.58)], role: "hinge" });
    b.extrude(ctrl(3.75, 5.58), { at: [0, WY, 0], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.13, bevel: 0.04, color: ctrlPaint, bone: ail, name: `aileron${side}` });
    for (const u of [4.1, 4.9, 5.4]) cyl(ail, STEEL_L, 0.007, 0.004, 0.26, [s * u, WY, hZ(u) - ctrlDepth(u)], [0, 0, -1], 4);
    const flap = b.joint(`flap${side}`, { parent: hull, at: [s * 1.45, WY, hZ(1.45)], aim: [s * 3.65, WY, hZ(3.65)], role: "hinge" });
    b.extrude(ctrl(1.45, 3.65), { at: [0, WY, 0], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.13, bevel: 0.04, color: ctrlPaint, bone: flap, name: `flap${side}` });
    // hazard strips on the flap hinge line and walkway
    glow(b.part(new THREE.BoxGeometry(0.9, 0.012, 0.03), HOT, { bone: hull, at: [s * 4.65, WY + 0.082, hZ(4.65) + 0.34], rotation: [0, s * 12.4, 0], name: `ailGlow${side}` }), 1.1);
    b.part(new THREE.PlaneGeometry(0.62, 1.02), "#ffffff", { bone: hull, at: [s * 2.3, WY + 0.083, 0.15], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: T.walk, name: `walkway${side}` });
    b.part(new THREE.PlaneGeometry(0.55, 0.19), "#ffffff", { bone: hull, at: [s * 3.0, WY + 0.083, -1.7], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: T.step, name: `noStep${side}` });
    b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", { bone: hull, at: [s * 4.1, WY + 0.083, -2.9], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: T.emblem, name: `wingEmblem${side}` });
    // upper-surface fence
    b.extrude([[0.55, 2.07], [-0.5, 2.07], [-0.6, 2.22], [0.4, 2.3]], { at: [s * 3.3, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.03, bevel: 0.008, color: ORANGE, bone: hull, name: `fence${side}` });
    // vortex generators + LE rivets
    for (let i = 0; i < 9; i++) {
      const u = 2.7 + i * 0.3;
      bx(hull, STEEL, 0.015, 0.05, 0.12, s * u, WY + 0.1, leZ(u) - 0.42, [0, s * 38, 0]);
    }
    for (let i = 0; i < 16; i++) {
      const u = 2.6 + i * 0.19;
      ball(hull, CHROME, 0.011, s * u, WY + 0.082, leZ(u) - 0.17);
    }
    // wing pods (tip rails)
    b.loft(
      [
        { at: [s * 5.78, WY, -1.55], w: 0.14, h: 0.14 },
        { at: [s * 5.78, WY, -2.1], w: 0.26, h: 0.28 },
        { at: [s * 5.78, WY, -3.2], w: 0.28, h: 0.3 },
        { at: [s * 5.78, WY, -4.1], w: 0.14, h: 0.16 },
      ],
      { bone: hull, sides: 10, color: podPaint, name: `tipPod${side}` },
    );
    const lens = s > 0 ? RED : GREEN;
    glow(b.part(new THREE.SphereGeometry(0.065, 8, 6), lens, { bone: hull, at: [s * 5.78, WY, -1.5], name: `navLight${side}` }), 1.5);
    for (const dy of [1, -1]) b.extrude([[-2.5, 0.1], [-3.5, 0.1], [-3.7, 0.4], [-3.2, 0.4]], { at: [s * 5.78, WY, 0], x: [0, 0, 1], y: [0, dy, 0], thickness: 0.035, bevel: 0.01, color: ORANGE_D, bone: hull, name: `podFin${side}` });
    glow(b.part(new THREE.SphereGeometry(0.05, 8, 6), STROBE, { bone: hull, at: [s * 5.78, WY, -4.12], name: `tipStrobe${side}` }), 1.4);
  }

  // ---------------------------------------------------------------- canards & tailplanes
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const canard = b.joint(`canard${side}`, { parent: hull, at: [s * 0.6, 2.35, 3.95], dir: [s, 0, 0], role: "hinge" });
    b.extrude(
      [[0.6, 4.75], [2.7, 3.65], [2.8, 3.2], [0.6, 3.3]],
      { at: [0, 2.35, 0], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.07, bevel: 0.025, color: canardPaint, bone: canard, name: `canard${side}` },
    );
    glow(b.part(new THREE.BoxGeometry(0.4, 0.012, 0.02), HOT, { bone: canard, at: [s * 1.9, 2.39, 3.75], rotation: [0, s * 30, 0], name: `canardGlow${side}` }), 1.1);

    const tail = b.joint(`tailplane${side}`, { parent: hull, at: [s * 1.3, 2.0, -5.4], dir: [s, 0, 0], role: "hinge" });
    b.extrude(
      [[1.3, -4.4], [3.9, -6.0], [3.95, -6.55], [1.3, -6.0]],
      { at: [0, 2.0, 0], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.09, bevel: 0.03, color: tailplanePaint, bone: tail, name: `tailplane${side}` },
    );
    bx(tail, ORANGE_D, 0.03, 0.095, 0.28, s * 3.4, 2.0, -5.9, [0, s * 32, 0]);
    cyl(tail, STEEL, 0.13, 0.13, 0.36, [s * 1.18, 2.0, -5.4], [s, 0, 0], 10);
    cyl(tail, ORANGE, 0.14, 0.14, 0.05, [s * 1.54, 2.0, -5.4], [s, 0, 0], 10);
  }

  // ---------------------------------------------------------------- twin tail fins & rudders
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const cant = 15 * DEG;
    const yd: P3 = [s * Math.sin(cant), Math.cos(cant), 0];
    const base: P3 = [s * 1.1, 2.5, 0];
    const finPt = (z: number, v: number): P3 => [base[0] + v * yd[0], base[1] + v * yd[1], z];
    const finOutline: OutlinePoint[] = [
      [-1.4, -0.25],
      [-1.9, 0.35],
      [-3.9, 2.35],
      [-4.75, 2.35],
      [-5.02, 0.0],
      [-5.02, -0.25],
    ];
    const fin = b.extrude(finOutline, { at: base, x: [0, 0, 1], y: yd, thickness: 0.11, bevel: 0.035, color: finPaint, bone: hull, name: `fin${side}` });
    const rudder = b.joint(`rudder${side}`, { parent: hull, at: finPt(-5.0, 0), aim: finPt(-4.72, 2.36), role: "hinge" });
    b.extrude(
      [[-4.72, 2.36], [-5.5, 2.3], [-5.9, 0.0], [-5.0, 0.0]],
      { at: base, x: [0, 0, 1], y: yd, thickness: 0.085, bevel: 0.028, color: rudderPaint, bone: rudder, name: `rudder${side}` },
    );
    const out: P3 = [s * Math.cos(cant), -Math.sin(cant), 0];
    b.decal(fin, T.number, { at: finPt(-3.45, 1.0), dir: out, size: [1.1, 0.6], segments: 6, name: `finNumber${side}` });
    b.decal(fin, T.emblem, { at: finPt(-2.75, 0.6), dir: out, size: [0.38, 0.38], segments: 4, name: `finEmblem${side}` });
    // tip glow + strobe + fin-tip antenna pod
    glow(b.part(new THREE.BoxGeometry(0.1, 0.015, 0.7), HOT, { bone: hull, at: finPt(-4.35, 2.4), rotation: [0, 0, -s * 15], name: `finTipGlow${side}` }), 1.2);
    glow(b.part(new THREE.SphereGeometry(0.05, 8, 6), STROBE, { bone: rudder, at: finPt(-5.45, 2.3), name: `finStrobe${side}` }), 1.4);
    // LE sensor strip
    cyl(hull, STEEL, 0.03, 0.03, 1.4, finPt(-3.2, 1.5), [0, 0.05, -1], 6);
  }

  // ---------------------------------------------------------------- engines, nozzles and stinger
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const nx = s * 0.86;
    const nozzle = b.joint(`nozzle${side}`, { parent: hull, at: [nx, 2.05, -6.0], dir: [0, 0, -1], role: "hinge" });
    b.lathe(
      [
        [0.6, 0],
        [0.6, 0.3],
        [0.52, 0.42],
        [0.46, 1.0],
        [0.4, 1.0],
        [0.45, 0.42],
        [0.46, 0.0],
      ],
      { at: [nx, 2.05, -6.0], axis: [0, 0, -1], bone: nozzle, color: nozzlePaint, segments: 16, name: `nozzle${side}` },
    );
    b.lathe(
      [
        [0.62, 0.02],
        [0.62, 0.17],
        [0.585, 0.17],
        [0.585, 0.02],
      ],
      { at: [nx, 2.05, -6.0], axis: [0, 0, -1], bone: nozzle, color: ORANGE, segments: 16, name: `nozzleBand${side}` },
    );
    b.ring(frame([nx, 2.05, -6.35], [0, 0, -1]), { count: 12, radius: 0.55, tilt: 5 }, (item) =>
      b.part(new THREE.BoxGeometry(0.2, 0.025, 0.55), "#7b758f", { bone: nozzle, frame: item, name: `petal${side}` }),
    );
    glow(b.part(new THREE.CircleGeometry(0.42, 16), "#ffffff", { bone: nozzle, at: [nx, 2.05, -6.3], dir: [0, 0, -1], axis: "z", texture: T.core, name: `core${side}` }), 1.3);
    // flame-holder struts
    for (let i = 0; i < 3; i++) bx(nozzle, GRAPH, 0.78, 0.025, 0.04, nx, 2.05, -6.28, [0, 0, i * 60]);
  }
  // stinger
  b.spike([0, 2.08, -5.95], [0, 0, -1], 1.35, 0.2, { bone: hull, sides: 10, color: STEEL, name: "stinger" });
  b.sweep([[0, 2.08, -6.0], [0, 2.08, -6.5]], 0.205, { bone: hull, sides: 10, color: ORANGE, caps: "flat", name: "stingerBand" });
  glow(b.part(new THREE.SphereGeometry(0.055, 8, 6), STROBE, { bone: hull, at: [0, 2.08, -7.32], name: "tailLight" }), 1.4);
  bx(hull, GRAPH, 0.3, 0.1, 0.4, 0, 2.3, -6.1);
  for (const s of [1, -1]) {
    // chaff / flare dispensers
    for (let i = 0; i < 4; i++) bx(hull, GRAPH, 0.12, 0.02, 0.2, s * (1.08 + 0.0), 1.55 + 0.0, -4.3 - i * 0.28, [0, 0, s * 10]);
  }

  // ---------------------------------------------------------------- landing gear
  type Wheel = { bone: J; x: number; y: number; z: number; r: number; w: number; side: number };
  const wheel = ({ bone, x, y, z, r, w, side }: Wheel) => {
    b.lathe(
      [
        [0.12, 0],
        [r - 0.07, 0],
        [r - 0.015, w * 0.14],
        [r, w * 0.34],
        [r, w * 0.66],
        [r - 0.015, w * 0.86],
        [r - 0.07, w],
        [0.12, w],
      ],
      { at: [x - w / 2, y, z], axis: [1, 0, 0], bone, color: tyrePaint, segments: 20, name: "tyre" },
    );
    const hubR = r * 0.52;
    cyl(bone, STEEL_L, hubR, hubR, w + 0.012, [x - w / 2 - 0.006, y, z], [1, 0, 0], 12);
    cyl(bone, STEEL, hubR * 0.62, hubR * 0.62, w + 0.03, [x - w / 2 - 0.015, y, z], [1, 0, 0], 10);
    const face = x + side * (w / 2 + 0.018);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ball(bone, CHROME, 0.016, face, y + Math.cos(a) * hubR * 0.82, z + Math.sin(a) * hubR * 0.82);
    }
    b.part(new THREE.CylinderGeometry(hubR * 0.4, hubR * 0.4, 0.03, 10), ORANGE, { bone, at: [face, y, z], dir: [1, 0, 0], name: "hubCap" });
    // brake disc
    cyl(bone, GREY_D, hubR * 0.92, hubR * 0.92, 0.02, [x - side * (w / 2 - 0.02), y, z], [1, 0, 0], 12);
  };

  // nose gear
  const noseGear = b.joint("noseGear", { parent: hull, at: [0, 1.42, 4.8], dir: [0, -1, 0.08], role: "hinge" });
  const noseWheel = b.joint("noseWheel", { parent: noseGear, at: [0, 0.37, 4.884], dir: [1, 0, 0], role: "hinge" });
  cyl(noseGear, STEEL_L, 0.1, 0.1, 0.62, [0, 1.42, 4.8], [0, -1, 0.08], 10);
  cyl(noseGear, CHROME, 0.062, 0.062, 0.62, [0, 0.9, 4.842], [0, -1, 0.08], 10);
  cyl(noseGear, GRAPH, 0.115, 0.115, 0.06, [0, 1.3, 4.79], [0, -1, 0.08], 10);
  bx(noseGear, ORANGE, 0.24, 0.07, 0.14, 0, 0.78, 4.84);
  // axle block, fork, torque links, lamp, hose
  bx(noseGear, STEEL, 0.18, 0.12, 0.14, 0, 0.5, 4.87);
  cyl(noseWheel, STEEL, 0.035, 0.035, 0.62, [-0.31, 0.37, 4.884], [1, 0, 0], 8);
  for (const s of [1, -1]) {
    bx(noseGear, STEEL, 0.03, 0.34, 0.07, s * 0.075, 0.62, 4.95, [-8, 0, 0]);
    bx(noseGear, GREY, 0.025, 0.22, 0.06, s * 0.075, 0.9, 4.74, [14, 0, 0]);
    wheel({ bone: noseWheel, x: s * 0.2, y: 0.37, z: 4.884, r: 0.37, w: 0.2, side: s });
  }
  b.rod([0.1, 1.2, 4.72], [0.07, 0.62, 4.74], 0.012, { bone: noseGear, color: INK, sides: 5, name: "noseHose" });
  glow(b.part(new THREE.BoxGeometry(0.1, 0.06, 0.03), STROBE, { bone: noseGear, at: [0, 1.05, 4.62], name: "taxiLight" }), 1.4);
  // drag brace
  cyl(noseGear, STEEL, 0.035, 0.035, 0.86, [0, 1.4, 4.2], [0, -0.6, 0.62], 6);
  // nose gear doors
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const door = b.joint(`noseDoor${side}`, { parent: hull, at: [s * 0.44, 1.46, 5.45], aim: [s * 0.44, 1.46, 4.25], role: "hinge" });
    b.extrude([[5.45, 0], [4.25, 0], [4.35, 0.5], [5.3, 0.55]], { at: [s * 0.44, 1.46, 0], x: [0, 0, 1], y: [0, -1, 0], thickness: 0.03, bevel: 0.008, color: doorPaint, bone: door, name: `noseDoor${side}` });
  }

  // main gear
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const gx = s * 1.55;
    const gz = -1.3;
    // gear sponson under the wing
    b.loft(
      [
        { at: [gx, 1.78, 1.0], w: 0.5, h: 0.3 },
        { at: [gx, 1.76, 0.4], w: 0.78, h: 0.4 },
        { at: [gx, 1.74, -1.0], w: 0.84, h: 0.42 },
        { at: [gx, 1.75, -2.6], w: 0.74, h: 0.38 },
        { at: [gx, 1.8, -3.4], w: 0.45, h: 0.26 },
      ],
      { bone: hull, sides: 10, color: sponsonPaint, name: `sponson${side}` },
    );
    const leg = b.joint(`mainGear${side}`, { parent: hull, at: [gx, 1.6, gz], dir: [0, -1, 0], role: "hinge" });
    const wj = b.joint(`mainWheel${side}`, { parent: leg, at: [gx, 0.42, gz], dir: [1, 0, 0], role: "hinge" });
    cyl(leg, STEEL_L, 0.115, 0.115, 0.62, [gx, 1.6, gz], [0, -1, 0], 10);
    cyl(leg, GRAPH, 0.125, 0.125, 0.07, [gx, 1.5, gz], [0, -1, 0], 10);
    cyl(leg, CHROME, 0.075, 0.075, 0.5, [gx, 1.0, gz], [0, -1, 0], 10);
    bx(leg, ORANGE, 0.26, 0.08, 0.2, gx, 0.9, gz);
    bx(leg, STEEL, 0.5, 0.07, 0.14, gx, 0.9, gz);
    cyl(wj, STEEL, 0.045, 0.045, 0.6, [gx - 0.3, 0.42, gz], [1, 0, 0], 8);
    for (const o of [1, -1]) {
      cyl(leg, STEEL, 0.04, 0.04, 0.52, [gx + o * 0.0, 0.92, gz + o * 0.0], [o * 0.42, -0.9, 0], 6);
      bx(leg, STEEL_L, 0.03, 0.34, 0.07, gx + o * 0.095, 0.7, gz - 0.12, [0, 0, 0]);
    }
    // scissor links
    bx(leg, GREY, 0.02, 0.3, 0.07, gx, 1.22, gz + 0.14, [16, 0, 0]);
    bx(leg, GREY, 0.02, 0.3, 0.07, gx, 1.0, gz + 0.14, [-16, 0, 0]);
    // brake calipers + hoses
    bx(wj, ORANGE, 0.1, 0.1, 0.12, gx + s * 0.13, 0.42 + 0.3, gz + 0.0);
    b.rod([gx + s * 0.1, 1.45, gz + 0.1], [gx + s * 0.15, 0.78, gz + 0.02], 0.014, { bone: leg, color: INK, sides: 5, name: `brakeHose${side}` });
    wheel({ bone: wj, x: gx, y: 0.42, z: gz, r: 0.42, w: 0.36, side: s });
    // leg tail lamp
    glow(b.part(new THREE.BoxGeometry(0.08, 0.05, 0.03), STROBE, { bone: leg, at: [gx, 1.35, gz + 0.13], name: `legLamp${side}` }), 1.3);
    // gear doors (open, hanging)
    const door = b.joint(`gearDoor${side}`, { parent: hull, at: [s * 1.95, 1.62, 0.5], aim: [s * 1.95, 1.62, -2.5], role: "hinge" });
    b.extrude([[0.5, 0], [-2.5, 0], [-2.35, 0.52], [0.35, 0.52]], { at: [s * 1.95, 1.62, 0], x: [0, 0, 1], y: [0, -1, 0], thickness: 0.035, bevel: 0.01, color: doorPaint, bone: door, name: `gearDoor${side}` });
    // inner hazard strip
    b.part(new THREE.PlaneGeometry(1.2, 0.09), "#ffffff", { bone: door, at: [s * 1.95 - s * 0.021, 1.2, -0.9], dir: [-s, 0, 0], axis: "z", up: [0, 1, 0], texture: T.hazard, name: `doorHazard${side}` });
  }

  // ---------------------------------------------------------------- weapons: pylons + missiles
  type Miss = { s: number; u: number; zt: number; len: number; r: number; y: number };
  const missile = ({ s, u, zt, len, r, y }: Miss) => {
    const x = s * u;
    const zn = zt + len;
    b.sweep(
      [[x, y, zt], [x, y, zn]],
      [r, r],
      {
        bone: hull,
        sides: 10,
        bands: [
          [0.08, STEEL],
          [0.5, WHITE],
          [0.56, ORANGE],
          [0.8, WHITE],
          [0.84, GRAPH],
          [1, GRAPH],
        ],
        caps: { start: "flat", end: "point" },
        extend: [0, r * 1.6],
        name: "missile",
      },
    );
    // fins: tail cruciform and canards
    bx(hull, STEEL_L, r * 4.2, 0.016, 0.26, x, y, zt + 0.2);
    bx(hull, STEEL_L, 0.016, r * 4.2, 0.26, x, y, zt + 0.2);
    bx(hull, ORANGE_D, r * 3.0, 0.012, 0.16, x, y, zn - 0.45);
    bx(hull, ORANGE_D, 0.012, r * 3.0, 0.16, x, y, zn - 0.45);
    // exhaust cone
    cyl(hull, GRAPH, r * 0.7, r * 0.5, 0.06, [x, y, zt - 0.05], [0, 0, 1], 8);
  };
  const pylon = (s: number, u: number, z0: number, z1: number) => {
    b.extrude([[z0, 1.98], [z1, 1.98], [z1 + 0.25, 1.56], [z0 - 0.25, 1.56]], { at: [s * u, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.09, bevel: 0.02, color: GREY, bone: hull, name: "pylon" });
    bx(hull, ORANGE, 0.1, 0.03, 0.5, s * u, 1.545, (z0 + z1) / 2);
  };
  for (const s of [1, -1]) {
    pylon(s, 2.75, -1.1, 1.0);
    missile({ s, u: 2.75, zt: -1.4, len: 3.2, r: 0.125, y: 1.43 });
    pylon(s, 4.35, -3.1, -0.9);
    missile({ s, u: 4.35, zt: -3.2, len: 2.4, r: 0.1, y: 1.5 });
  }

  // ---------------------------------------------------------------- airbrake
  const airbrake = b.joint("airbrake", { parent: hull, at: [0, 3.12, -0.1], dir: [1, 0, 0], role: "hinge" });
  b.extrude(
    [[0.05, -0.15], [0.85, -0.15], [0.9, -0.1], [0.9, 0.1], [0.85, 0.15], [0.05, 0.15], [0, 0.1], [0, -0.1]],
    { at: [0, 3.13, 1.0], x: [0, 0, -1], y: [1, 0, 0], thickness: 0.04, bevel: 0.01, color: ORANGE, bone: airbrake, name: "airbrake" },
  );

  // ---------------------------------------------------------------- extra surface detail
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    // raised wing access panels with screws
    for (const [u, z, w, d] of [[2.9, -0.55, 0.4, 0.6], [2.3, -1.9, 0.5, 0.45], [4.4, -1.6, 0.4, 0.45], [3.9, -2.55, 0.5, 0.32], [1.7, -2.4, 0.55, 0.6]] as const) {
      bx(hull, WHITE2, w, 0.012, d, s * u, WY + 0.086, z);
      for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) ball(hull, CHROME, 0.012, s * (u + dx * (w / 2 - 0.04)), WY + 0.094, z + dz * (d / 2 - 0.04));
    }
    // engine bay louvers and glowing heat slits on the aft flank
    for (let i = 0; i < 5; i++) bx(hull, GRAPH, 0.03, 0.26, 0.05, s * 1.425, 2.1, -3.85 - i * 0.2);
    for (let i = 0; i < 4; i++) glow(b.part(new THREE.BoxGeometry(0.03, 0.24, 0.05), HOT, { bone: hull, at: [s * 1.415, 2.1, -5.3 - i * 0.14], name: `heatSlit${side}` }), 1.2);
    // ventral fins
    const yd: P3 = [s * 0.45, -0.89, 0];
    b.extrude([[-4.2, -0.15], [-5.6, -0.15], [-5.75, 0.5], [-5.0, 0.5]], { at: [s * 0.95, 1.52, 0], x: [0, 0, 1], y: yd, thickness: 0.06, bevel: 0.02, color: ORANGE, bone: hull, name: `ventralFin${side}` });
    // chin glow bar
    glow(b.part(new THREE.BoxGeometry(0.03, 0.03, 0.34), HOT, { bone: hull, at: [s * 0.4, 1.72, 6.0], rotation: [8, s * 6, 0], name: `chinGlow${side}` }), 1.2);
  }
  // arrestor hook
  const hook = b.joint("tailHook", { parent: hull, at: [0, 1.38, -5.2], aim: [0, 1.0, -5.9], role: "hinge" });
  b.rod([0, 1.38, -5.2], [0, 1.05, -6.35], 0.04, { bone: hook, color: STEEL, sides: 6, name: "tailHookArm" });
  b.rod([0, 1.05, -6.35], [0, 1.0, -6.5], 0.045, { bone: hook, color: ORANGE, sides: 6, name: "tailHookTip" });
  bx(hull, GRAPH, 0.18, 0.08, 0.3, 0, 1.4, -5.2);

  // boarding ladder on the right cheek, ahead of the canard
  const ladderZ = [4.92, 5.28];
  for (const z of ladderZ) b.rod([-0.52, 2.42, z], [-1.55, 0.03, z], 0.022, { bone: hull, color: STEEL_L, sides: 6, name: "ladderRail" });
  for (let i = 0; i < 9; i++) {
    const t = 0.06 + i * 0.109;
    cyl(hull, CHROME, 0.014, 0.014, ladderZ[1] - ladderZ[0], [-0.52 - t * 1.03, 2.42 - t * 2.39, ladderZ[0]], [0, 0, 1], 5);
  }
  bx(hull, ORANGE, 0.1, 0.06, 0.44, -0.55, 2.43, 5.1);

  // wheel chocks (ground crew detail)
  const chock = (x: number, zWheel: number, r: number, dir: number, name: string) => {
    const z0 = zWheel + dir * (r - 0.03);
    b.extrude([[z0, 0], [z0 + dir * 0.4, 0], [z0, 0.17]], { at: [x, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.13, bevel: 0.015, color: ORANGE, bone: hull, name });
  };
  for (const s of [1, -1]) {
    chock(s * 1.55, -1.3, 0.42, 1, "chockMainF");
    chock(s * 1.55, -1.3, 0.42, -1, "chockMainR");
    chock(s * 0.2, 4.884, 0.37, 1, "chockNoseF");
    chock(s * 0.2, 4.884, 0.37, -1, "chockNoseR");
  }
  // remove-before-flight tags on the missile seekers
  for (const [x, y, z] of [[2.75, 1.43, 1.9], [-2.75, 1.43, 1.9], [4.35, 1.5, -0.6], [-4.35, 1.5, -0.6]] as const)
    b.part(new THREE.BoxGeometry(0.24, 0.07, 0.006), "#ffffff", { bone: hull, at: [x, y - 0.17, z], texture: T.flag, name: "missileTag" });

  // flush the merged detail parts
  for (const slot of pending.values()) {
    const merged = mergeGeometries(slot.geos);
    if (!merged) throw new Error(`merge failed for ${slot.bone.name} ${slot.color}`);
    b.part(merged, slot.color, { bone: slot.bone, at: [0, 0, 0], name: `detail.${slot.bone.name}.${slot.color.slice(1)}` });
  }

  return b.root;
}
```

## Example: rallyHatchbackSonnet

Brief: Category: Vehicle.
Subject: mud-spattered rally hatchback with fender flares, mud flaps, glowing light pods, cage cabin and blade wing.
Style: League of Legends.
Topology: vehicle
Style family: league-of-legends
Notable features: wheels, cage, light-pods, fender-flares, blade-wing

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { glow } from "agentic-3js-builder/kits/glow";
import { createBuilder } from "agentic-3js-builder";
import type { Fill } from "agentic-3js-builder";
import { mix, noise, paint, smoothstep } from "agentic-3js-builder";
import type { Rgb } from "agentic-3js-builder";
import { catmull, polyline, spiral } from "agentic-3js-builder";
import type { Joint } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Rally Hatchback",
  description:
    "Mud-spattered rally hatchback with swept fender flares, sharp mud flaps, hextech-glow light pods, an open-net cage cabin and a blade wing, in bold League-of-Legends colour blocking.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// ---- palette -----------------------------------------------------------------------------------------------------
const BLUE = "#2358f0";
const BLUE_D = "#132f86";
const NAVY = "#0a1030";
const NAVY_L = "#1b2557";
const GOLD = "#ffbd2b";
const GOLD_D = "#b97616";
const CYAN = "#33f3ff";
const CYAN_D = "#139bb5";
const MAG = "#ff2e78";
const WHITE = "#f2f5ff";
const STEEL = "#aeb8d2";
const STEEL_D = "#5a6384";
const RUBBER = "#15151d";
const TREAD = "#0b0b11";
const MUD = "#573720";
const MUD_L = "#80582f";
const GLASS = "#0b2354";
const LAMP = "#fff3c4";
const TAIL = "#e0102c";

// ---- layout (meters, +Z forward, +X the car's left) ---------------------------------------------------------------
const FZ = 1.2; // front axle
const RZ = -1.2; // rear axle
const WX = 0.78; // wheel centre x
const WY = 0.385; // wheel centre height (tyre radius 0.385 with the treads)
const ARCH_R = 0.47;
const ARCH_YB = 0.28;
const BELT = 1.05; // beltline
const ROOF = 1.395; // roof panel centre

type Pt = [number, number] | [number, number, "sharp"];
type V3 = [number, number, number];

const wx = (y: number) => 0.74 - 0.364 * (y - BELT); // half-width of the greenhouse at height y

// ---- paints ------------------------------------------------------------------------------------------------------
function mudAmount(p: THREE.Vector3) {
  const wide = noise(p, 0.34, 3);
  const fine = noise(p, 0.045, 8);
  let a = 1 - smoothstep(0.26, 0.5 + (wide - 0.5) * 0.55, p.y);
  for (const z of [FZ, RZ]) {
    const d = Math.hypot(p.z - z, p.y - WY);
    const spray = (1 - smoothstep(0.55, 1.1, d)) * smoothstep(0.5, 0.68, fine) * (1 - smoothstep(0.5, 0.8, p.y)) * 0.9;
    a = Math.max(a, spray);
  }
  return Math.min(1, a * (0.5 + 0.5 * smoothstep(0.3, 0.6, fine)));
}
const mudColor = (p: THREE.Vector3) => mix(MUD_L, MUD, noise(p, 0.07, 5));

const bodyPaint = paint((p, n) => {
  const ax = Math.abs(p.x);
  let c: string = BLUE;
  if (Math.abs(n.x) > 0.6 && n.x * p.x < 0) return NAVY_L; // inner wall of the tub
  if (n.y > 0.55 && p.y > 1.3) {
    // roof: twin gold blades, cyan spine
    if (ax < 0.03) c = CYAN;
    else if (ax > 0.2 && ax < 0.32) c = GOLD;
    else if (ax > 0.34 && ax < 0.38) c = NAVY;
    else if (ax > 0.55) c = BLUE_D;
  } else if (n.y > 0.55 && p.z > 0.6 && ax < 0.66) {
    // hood: forward-pointing chevrons
    const q = (p.z + 1.15 * ax) / 0.36;
    const f = q - Math.floor(q);
    if (ax < 0.07) c = GOLD;
    else if (f < 0.2) c = GOLD;
    else if (f > 0.26 && f < 0.32) c = CYAN;
    else c = BLUE;
  } else {
    const t = p.y + 0.3 * p.z;
    if (p.y < 0.46) c = NAVY;
    else if (p.y < 0.495) c = GOLD;
    else if (t < 0.62) c = BLUE_D;
    else if (t < 0.76) c = GOLD;
    else if (t < 0.79) c = NAVY;
    else if (t < 0.83) c = MAG;
  }
  const m = mudAmount(p);
  return m > 0.02 ? mix(c, mudColor(p), m) : c;
});

const plasticPaint = paint((p) => {
  const m = mudAmount(p);
  return m > 0.02 ? mix(NAVY_L, mudColor(p), Math.min(1, m * 1.15)) : NAVY_L;
});

const tirePaint = paint((p, nrm) => {
  const n = noise(p, 0.06, 2);
  const a = (1 - smoothstep(0.1, 0.42 + (n - 0.5) * 0.3, p.y)) * 0.85;
  let base: string = RUBBER;
  if (Math.abs(nrm.x) > 0.7) {
    const zc = p.z > 0 ? FZ : RZ;
    const dy = p.y - WY;
    const dz = p.z - zc;
    const r = Math.hypot(dy, dz);
    const ang = (Math.atan2(dy, dz) + Math.PI) / (2 * Math.PI);
    if (r > 0.272 && r < 0.29 && (ang * 36) % 1 < 0.6) base = GOLD_D;
    else if (r > 0.318 && r < 0.326) base = STEEL_D;
  }
  return mix(base, mix(MUD_L, MUD, n), a);
});

const wingPaint = paint((p, n) => {
  const ax = Math.abs(p.x);
  if (n.y < -0.4) return NAVY;
  if (ax < 0.1) return CYAN;
  if (ax < 0.4) return GOLD;
  if (ax < 0.45) return NAVY;
  return BLUE;
});

const glassPaint = paint((p, _n, s) => {
  const q = (s[0] * 0.8 + s[1]) / 0.42;
  const f = q - Math.floor(q);
  let c: string | Rgb = GLASS;
  if (f < 0.07) c = mix(GLASS, WHITE, 0.35);
  else if (f > 0.14 && f < 0.17) c = mix(GLASS, CYAN, 0.4);
  const m = (1 - smoothstep(1.07, 1.2, p.y + (noise(p, 0.045, 2) - 0.5) * 0.14)) * 0.85;
  return m > 0.02 ? mix(c, MUD, m) : c;
});

const defrostPaint = paint((_p, _n, s) => {
  const f = (s[1] + 1) / 0.045;
  return f - Math.floor(f) < 0.14 ? mix(GLASS, STEEL, 0.5) : GLASS;
});

const flapPaint = paint((p, _n, s) => {
  const v = -s[1] + 1.1 * Math.abs(s[0]);
  const f = v / 0.1 - Math.floor(v / 0.1);
  let c: string = RUBBER;
  if (s[1] > -0.08) c = NAVY_L;
  else if (Math.abs(s[0]) > 0.18) c = GOLD_D;
  else if (s[1] > -0.38 && f < 0.4) c = GOLD;
  const m = (1 - smoothstep(-0.56, -0.3, s[1] + (noise(p, 0.05, 4) - 0.5) * 0.2)) * 0.95;
  return m > 0.02 ? mix(c, mudColor(p), m) : c;
});

const plankPaint = paint((_p, _n, s) => {
  const v = s[0] / 0.07;
  return v - Math.floor(v) < 0.5 ? NAVY : NAVY_L;
});

// ---- textures ----------------------------------------------------------------------------------------------------
function netSvg(w: number, h: number) {
  let g = "";
  for (let x = 0; x <= w; x += 4) g += `<line x1="${x}" y1="0" x2="${x}" y2="${h}"/>`;
  for (let y = 0; y <= h; y += 4) g += `<line x1="0" y1="${y}" x2="${w}" y2="${y}"/>`;
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><g stroke="#d6e6ff" stroke-width="0.34">${g}</g></svg>`,
    { size: 512 },
  );
}

function hexSvg(w: number, h: number, r: number, bg: string, line: string) {
  let g = "";
  const dx = r * 1.732;
  const dy = r * 1.5;
  for (let row = 0; row * dy < h + r; row++)
    for (let col = 0; col * dx < w + r; col++) {
      const cx = col * dx + (row % 2 ? dx / 2 : 0);
      const cy = row * dy;
      const pts = [0, 1, 2, 3, 4, 5]
        .map((k) => {
          const a = (Math.PI / 3) * k + Math.PI / 6;
          return `${(cx + r * 0.92 * Math.cos(a)).toFixed(2)},${(cy + r * 0.92 * Math.sin(a)).toFixed(2)}`;
        })
        .join(" ");
      g += `<polygon points="${pts}"/>`;
    }
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${bg}"/><g fill="none" stroke="${line}" stroke-width="1.2">${g}</g></svg>`,
    { size: 512 },
  );
}

const NET_F = netSvg(40, 28);
const NET_R = netSvg(88, 28);
const GRILLE = hexSvg(70, 24, 4, NAVY, CYAN);
const VENT = hexSvg(40, 40, 4.2, NAVY, GOLD);
const ROUNDEL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <polygon points="50,3 91,26 91,74 50,97 9,74 9,26" fill="#0a1030" stroke="#ffbd2b" stroke-width="5" stroke-linejoin="round"/>
  <polygon points="50,14 82,32 82,68 50,86 18,68 18,32" fill="#f2f5ff"/>
  <path d="M18 68 L50 86 L82 68 L82 60 L50 78 L18 60 Z" fill="#ff2e78"/>
  <text x="50" y="62" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="36" text-anchor="middle" fill="#0a1030">07</text>
  </svg>`,
  { size: 256 },
);
const PLATE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 104 22">
  <rect x="1" y="1" width="102" height="20" rx="4" fill="#f2f5ff" stroke="#0a1030" stroke-width="2"/>
  <rect x="5" y="4" width="12" height="14" fill="#2358f0"/>
  <text x="62" y="16.5" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="14" text-anchor="middle" fill="#0a1030">RLY·07</text>
  </svg>`,
  { size: 416 },
);
const GAUGE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="15" fill="#0a1030" stroke="#ffbd2b" stroke-width="2"/>
  <path d="M6 22 A11 11 0 1 1 26 22" fill="none" stroke="#33f3ff" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M20 22 A11 11 0 0 1 26 22" fill="none" stroke="#ff2e78" stroke-width="2.4"/>
  <line x1="16" y1="17" x2="11" y2="9" stroke="#f2f5ff" stroke-width="1.6" stroke-linecap="round"/>
  <circle cx="16" cy="17" r="2" fill="#ffbd2b"/>
  </svg>`,
  { size: 128 },
);
const SLASH = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 16">
  <polygon points="0,16 6,0 64,0 58,16" fill="#33f3ff"/>
  <polygon points="10,12 14,4 54,4 50,12" fill="#f2f5ff"/>
  </svg>`,
  { size: 256 },
);

// ---- geometry helpers --------------------------------------------------------------------------------------------
/** A single quad facing `out`, uv mapped over its bounding box corners (a textured sheet with an arbitrary outline). */
function quadGeo(p0: V3, p1: V3, p2: V3, p3: V3, out: V3) {
  const g = new THREE.BufferGeometry();
  const pts = [p0, p1, p2, p3].map((p) => new THREE.Vector3(...p));
  const nrm = new THREE.Vector3().subVectors(pts[1], pts[0]).cross(new THREE.Vector3().subVectors(pts[3], pts[0]));
  const flip = nrm.dot(new THREE.Vector3(...out)) < 0;
  const pos: number[] = [];
  for (const p of pts) pos.push(p.x, p.y, p.z);
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
  g.setIndex(flip ? [0, 2, 1, 0, 3, 2] : [0, 1, 2, 0, 2, 3]);
  g.computeVertexNormals();
  return g;
}

function archPoints(cz: number, n = 10): [number, number][] {
  const f0 = Math.asin((ARCH_YB - WY) / ARCH_R);
  const out: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const phi = f0 + ((Math.PI - 2 * f0) * i) / n;
    out.push([cz + ARCH_R * Math.cos(phi), WY + ARCH_R * Math.sin(phi)]);
  }
  return out;
}

/** Hexagonal merged bolt heads for one run of positions (all facing along local +Y, then rotated by `quat`). */
function boltGeo(points: THREE.Vector3[], radius: number, height: number, quat: THREE.Quaternion) {
  const parts = points.map((p) =>
    new THREE.CylinderGeometry(radius, radius, height, 6)
      .applyQuaternion(quat)
      .translate(p.x, p.y, p.z),
  );
  return mergeGeometries(parts)!;
}

export default function build() {
  const b = createBuilder({ name: "rallyHatchback", paintSize: 2048 });

  // ---- skeleton --------------------------------------------------------------------------------------------------
  const chassis = b.joint("chassis", { at: [0, 0.6, 0], dir: [0, 0, 1], role: "spine" });
  const sides = [
    { s: 1, k: "L" },
    { s: -1, k: "R" },
  ];
  const axles = [
    { id: "FL", s: 1, z: FZ, steer: true },
    { id: "FR", s: -1, z: FZ, steer: true },
    { id: "RL", s: 1, z: RZ, steer: false },
    { id: "RR", s: -1, z: RZ, steer: false },
  ];
  const wheelBone: Record<string, Joint> = {};
  const armBone: Record<string, Joint> = {};
  const carrier: Record<string, Joint> = {};
  for (const a of axles) {
    const arm = b.joint(`arm${a.id}`, {
      parent: chassis,
      at: [a.s * 0.3, 0.36, a.z],
      aim: [a.s * WX, WY, a.z],
      role: "hinge",
    });
    const hub = a.steer
      ? b.joint(`steer${a.id}`, { parent: arm, at: [a.s * WX, WY, a.z], dir: [0, 1, 0], role: "hinge" })
      : arm;
    armBone[a.id] = arm;
    carrier[a.id] = hub;
    wheelBone[a.id] = b.joint(`wheel${a.id}`, { parent: hub, at: [a.s * WX, WY, a.z], dir: [a.s, 0, 0], role: "hinge" });
  }
  const doorJ: Record<string, Joint> = {};
  for (const { s, k } of sides)
    doorJ[k] = b.joint(`door${k}`, { parent: chassis, at: [s * 0.86, 0.7, 0.55], dir: [0, 1, 0], role: "hinge" });
  const hood = b.joint("hood", { parent: chassis, at: [0, 1.0, 0.64], dir: [0, 0, 1], role: "hinge" });
  const hatch = b.joint("hatch", { parent: chassis, at: [0, 1.38, -1.22], dir: [0, 0, -1], role: "hinge" });
  const WING = { y: 1.5, z: -1.9 };
  const wingFlap = b.joint("wingFlap", {
    parent: chassis,
    at: [0, WING.y + 0.04, WING.z - 0.1],
    dir: [1, 0, 0],
    role: "hinge",
  });
  const steeringWheel = b.joint("steeringWheel", {
    parent: chassis,
    at: [0.36, 0.93, 0.3],
    dir: [0, 0.35, -1],
    role: "hinge",
  });
  const flapJ: Record<string, Joint> = {};
  for (const a of axles)
    flapJ[a.id] = b.joint(`mudFlap${a.id}`, {
      parent: chassis,
      at: [a.s * 0.86, 0.66, a.z - 0.52],
      dir: [0, -1, 0],
      role: "hinge",
    });

  // ---- wrappers --------------------------------------------------------------------------------------------------
  type PartArgs = Parameters<typeof b.part>;
  const P = (g: THREE.BufferGeometry, color: PartArgs[1], o: NonNullable<PartArgs[2]> = {}) =>
    b.part(g, color, { bone: chassis, ...o });
  const X = (outline: readonly Pt[], o: Parameters<typeof b.extrude>[1]) => b.extrude(outline, { bone: chassis, ...o });
  const L = (outline: readonly (readonly number[])[], o: Parameters<typeof b.lathe>[1]) =>
    b.lathe(outline, { bone: chassis, ...o });
  const R = (a: V3, c: V3, r: number | [number, number], color: Fill, o: Parameters<typeof b.rod>[3] = {}) =>
    b.rod(a, c, r, { bone: chassis, color, ...o });
  const S = (pts: readonly (readonly number[])[], r: number, color: Fill, o: Parameters<typeof b.sweep>[2] = {}) =>
    b.sweep(pts, r, { bone: chassis, color, ...o });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // ================================================================================================================
  // TUB: side sheets with wheel arches, floor, firewall, tail, nose
  // ================================================================================================================
  const sheet: Pt[] = [
    [-1.94, 0.3],
    [-2.0, 0.44],
    [-2.01, 0.8],
    [-1.96, 1.04],
    [-0.4, BELT],
    [0.62, BELT],
    [1.2, 0.98],
    [1.76, 0.93],
    [1.8, 0.8],
    [1.8, ARCH_YB],
    ...archPoints(FZ),
    ...archPoints(RZ),
  ];
  for (const { s, k } of sides)
    X(sheet, { x: [0, 0, 1], at: [s * 0.75, 0, 0], thickness: 0.18, bevel: 0.035, color: bodyPaint, name: `sheet${k}` });

  // wheel-well back walls
  for (const { s, k } of sides)
    for (const [zz, tag] of [
      [FZ, "F"],
      [RZ, "R"],
    ] as const)
      X([...archPoints(zz), [zz - 0.52, ARCH_YB - 0.02], [zz + 0.52, ARCH_YB - 0.02]], {
        x: [0, 0, 1],
        at: [s * 0.625, 0, 0],
        thickness: 0.04,
        color: NAVY,
        name: `well${tag}${k}`,
      });

  // floor, underbody plate, firewall, tail block
  X(
    [
      [-0.66, -1.45],
      [0.66, -1.45],
      [0.66, 0.66],
      [-0.66, 0.66],
    ],
    { at: [0, 0.36, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.05, color: NAVY_L, name: "floor" },
  );
  X(
    [
      [-0.64, -1.72],
      [0.64, -1.72],
      [0.64, 1.72],
      [-0.64, 1.72],
    ],
    { at: [0, 0.285, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.04, color: STEEL_D, name: "underbody" },
  );
  X(
    [
      [-0.5, 0.9],
      [0.5, 0.9],
      [0.38, 1.82],
      [-0.38, 1.82],
    ],
    { at: [0, 0.272, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.03, bevel: 0.01, color: GOLD_D, name: "skidPlate" },
  );
  X(
    [
      [0.6, 0.3],
      [0.6, 0.94],
      [1.8, 0.78],
      [1.8, 0.3],
    ],
    { x: [0, 0, 1], at: [0, 0, 0], thickness: 1.24, color: NAVY, name: "engineBay" },
  );
  X(
    [
      [-2.02, 0.3],
      [-2.02, 0.8],
      [-1.45, 0.8],
      [-1.45, 0.3],
    ],
    { x: [0, 0, 1], at: [0, 0, 0], thickness: 1.3, bevel: 0.03, color: bodyPaint, name: "tail" },
  );
  // dash
  X(
    [
      [0.62, 0.4],
      [0.62, 0.98],
      [0.44, 0.93],
      [0.3, 0.7],
      [0.32, 0.4],
    ],
    { x: [0, 0, 1], at: [0, 0, 0], thickness: 1.28, bevel: 0.02, color: NAVY_L, name: "dash" },
  );
  X(
    [
      [0.58, 0.96],
      [0.52, 1.07],
      [0.42, 1.08],
      [0.4, 0.94],
    ],
    { x: [0, 0, 1], at: [0.37, 0, 0], thickness: 0.36, bevel: 0.01, color: NAVY, name: "binnacle" },
  );
  P(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
    at: [0.37, 1.0, 0.425],
    dir: [0, 0.22, -1],
    up: [0, 1, 0],
    axis: "z",
    texture: GAUGE,
    name: "gaugeL",
  });
  P(new THREE.PlaneGeometry(0.14, 0.14), "#ffffff", {
    at: [0.0, 0.93, 0.5],
    dir: [0, 0.6, -1],
    axis: "z",
    texture: GAUGE,
    name: "gaugeC",
  });
  glow(
    P(box(0.5, 0.012, 0.01), CYAN, { at: [0.0, 0.973, 0.585], name: "dashGlow" }),
    1.2,
  );
  // centre tunnel, handbrake, shifter
  X(
    [
      [0.3, 0.38],
      [0.3, 0.56],
      [0.1, 0.62],
      [-0.5, 0.56],
      [-0.5, 0.38],
    ],
    { x: [0, 0, 1], at: [0, 0, 0], thickness: 0.2, bevel: 0.02, color: NAVY, name: "tunnel" },
  );
  R([0, 0.6, 0.0], [0, 0.68, -0.12], 0.012, GOLD_D);
  P(new THREE.SphereGeometry(0.03, 6, 5), GOLD, { at: [0, 0.7, -0.14], name: "shiftKnob" });
  R([0.0, 0.58, -0.3], [0.0, 0.76, -0.4], 0.016, STEEL);
  R([0.0, 0.76, -0.4], [0.0, 0.78, -0.45], 0.026, MAG);

  // ---- nose ------------------------------------------------------------------------------------------------------
  const nosePlan: Pt[] = [
    [-0.8, 1.62],
    [0.8, 1.62],
    [0.8, 1.86],
    [0.62, 2.06],
    [0.3, 2.12],
    [-0.3, 2.12],
    [-0.62, 2.06],
    [-0.8, 1.86],
  ];
  X(nosePlan, {
    at: [0, 0.55, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.52,
    bevel: 0.03,
    color: bodyPaint,
    name: "nose",
  });
  // splitter blade
  X(
    [
      [-0.88, 1.7],
      [0.88, 1.7],
      [0.96, 1.95],
      [0.7, 2.2, "sharp"],
      [0.34, 2.14],
      [0.0, 2.3, "sharp"],
      [-0.34, 2.14],
      [-0.7, 2.2, "sharp"],
      [-0.96, 1.95],
    ],
    { at: [0, 0.3, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.035, bevel: 0.008, color: NAVY, name: "splitter" },
  );
  glow(S([[-0.34, 0.275, 2.14], [-0.7, 0.275, 2.2], [-0.96, 0.275, 1.95], [-0.88, 0.275, 1.7]], 0.012, CYAN, { caps: "round" }), 1.3);
  glow(S([[0.34, 0.275, 2.14], [0.7, 0.275, 2.2], [0.96, 0.275, 1.95], [0.88, 0.275, 1.7]], 0.012, CYAN, { caps: "round" }), 1.3);
  // canards
  for (const { s } of sides)
    X(
      [
        [0, 0],
        [0.22, 0.08, "sharp"],
        [0.02, 0.16],
      ],
      {
        at: [s * 0.78, 0.55, 1.7],
        x: [s, 0, 0],
        y: [0, 0, 1],
        thickness: 0.02,
        color: GOLD,
        name: "canard",
      },
    );
  // grille
  P(new THREE.PlaneGeometry(0.56, 0.2), "#ffffff", {
    at: [0, 0.47, 2.125],
    dir: [0, 0, 1],
    axis: "z",
    texture: GRILLE,
    name: "grille",
  });
  for (const y of [0.37, 0.57]) R([-0.29, y, 2.125], [0.29, y, 2.125], 0.012, GOLD);
  for (const x of [-0.29, 0.29]) R([x, 0.37, 2.125], [x, 0.57, 2.125], 0.012, GOLD);
  P(new THREE.PlaneGeometry(0.34, 0.09), "#ffffff", {
    at: [0, 0.68, 2.125],
    dir: [0, 0, 1],
    axis: "z",
    texture: PLATE,
    name: "plateF",
  });
  // headlight shards on each nose corner
  for (const { s } of sides) {
    const n: V3 = [s * 0.743, 0, 0.669];
    const off = 0.012;
    const pt = (t: number, y: number): V3 => [
      s * (0.8 - 0.18 * t) + n[0] * off,
      y,
      1.86 + 0.2 * t + n[2] * off,
    ];
    b.slab([pt(0.05, 0.6), pt(0.95, 0.66), pt(0.95, 0.76), pt(0.05, 0.78)], { bone: chassis, color: NAVY, thickness: 0.02, name: "lampHousing" });
    const inset = (t: number, y: number): V3 => {
      const p = pt(t, y);
      return [p[0] + n[0] * 0.012, p[1], p[2] + n[2] * 0.012];
    };
    glow(b.slab([inset(0.14, 0.66), inset(0.84, 0.69), inset(0.84, 0.74), inset(0.14, 0.75)], { bone: chassis, color: LAMP, thickness: 0.012, name: "headlamp" }), 1.8);
    glow(b.slab([inset(0.1, 0.62), inset(0.9, 0.645), inset(0.9, 0.66), inset(0.1, 0.635)], { bone: chassis, color: CYAN, thickness: 0.012, name: "drl" }), 1.4);
    P(
      quadGeo(
        [s * (0.8 - 0.18 * 0.12) + n[0] * 0.008, 0.34, 1.86 + 0.2 * 0.12 + n[2] * 0.008],
        [s * (0.8 - 0.18 * 0.9) + n[0] * 0.008, 0.34, 1.86 + 0.2 * 0.9 + n[2] * 0.008],
        [s * (0.8 - 0.18 * 0.9) + n[0] * 0.008, 0.52, 1.86 + 0.2 * 0.9 + n[2] * 0.008],
        [s * (0.8 - 0.18 * 0.12) + n[0] * 0.008, 0.52, 1.86 + 0.2 * 0.12 + n[2] * 0.008],
        n,
      ),
      "#ffffff",
      { at: [0, 0, 0], texture: VENT, name: "noseVent" },
    );
  }

  // ---- hood-front light pods bar --------------------------------------------------------------------------------
  function pod(at: V3, r: number, dir: V3 = [0, 0, 1], bone = chassis) {
    const outline: [number, number][] = [
      [0, -0.22],
      [r * 0.65, -0.22],
      [r * 0.95, -0.12],
      [r * 1.0, 0.0],
      [r * 1.12, 0.012],
      [r * 1.12, 0.045],
      [0, 0.045],
    ];
    b.lathe(outline, { at, axis: dir, segments: 12, bone, color: NAVY_L, name: "podBody" });
    b.lathe(
      [
        [r * 1.02, 0.02],
        [r * 1.2, 0.02],
        [r * 1.2, 0.07],
        [r * 1.02, 0.07],
      ],
      { at, axis: dir, segments: 12, bone, color: GOLD, name: "podRim" },
    );
    const lens = b.lathe(
      [
        [0, 0.05],
        [r * 0.92, 0.05],
        [r * 0.8, 0.075],
        [r * 0.45, 0.1],
        [0, 0.112],
      ],
      { at, axis: dir, segments: 12, bone, color: LAMP, name: "podLens" },
    );
    glow(lens, 2);
    const ring = b.lathe(
      [
        [r * 0.2, 0.108],
        [r * 0.42, 0.098],
        [r * 0.42, 0.108],
        [r * 0.2, 0.118],
      ],
      { at, axis: dir, segments: 8, bone, color: CYAN, name: "podCore" },
    );
    glow(ring, 1.5);
  }
  R([-0.62, 0.9, 1.8], [0.62, 0.9, 1.8], 0.026, GOLD, { caps: "round" });
  for (const x of [-0.6, 0.6]) {
    R([x, 0.9, 1.8], [x, 0.78, 1.84], 0.03, GOLD_D);
    P(box(0.1, 0.02, 0.1), GOLD_D, { at: [x, 0.79, 1.84], name: "barFoot" });
  }
  for (const x of [-0.2, 0.2]) {
    pod([x, 1.0, 1.88], 0.11);
    R([x, 0.9, 1.8], [x, 0.96, 1.8], 0.03, GOLD_D);
  }
  for (const x of [-0.52, 0.52]) {
    pod([x, 0.99, 1.88], 0.085);
    R([x, 0.9, 1.8], [x, 0.95, 1.8], 0.026, GOLD_D);
  }

  // ================================================================================================================
  // FLARES, bolts, wheel-arch trims, mud flaps
  // ================================================================================================================
  for (const { s, k } of sides)
    for (const [zz, tag] of [
      [FZ, "F"],
      [RZ, "R"],
    ] as const) {
      const band: [number, number, "sharp"?][] = [];
      const a0 = (-16 * Math.PI) / 180;
      const a1 = Math.PI - a0;
      const n = 12;
      for (let i = 0; i <= n; i++) {
        const a = a0 + ((a1 - a0) * i) / n;
        band.push([zz + 0.585 * Math.cos(a), WY + 0.585 * Math.sin(a)]);
      }
      for (let i = n; i >= 0; i--) {
        const a = a0 + ((a1 - a0) * i) / n;
        band.push([zz + (ARCH_R + 0.005) * Math.cos(a), WY + (ARCH_R + 0.005) * Math.sin(a)]);
      }
      band[0] = [band[0][0], band[0][1], "sharp"];
      X(band as Pt[], {
        x: [0, 0, 1],
        at: [s * 0.9, 0, 0],
        thickness: 0.14,
        bevel: 0.025,
        color: plasticPaint,
        name: `flare${tag}${k}`,
      });
      // bolts around the outer face
      const bolts: THREE.Vector3[] = [];
      for (let i = 1; i < 11; i++) {
        const a = a0 + ((a1 - a0) * i) / 11;
        bolts.push(new THREE.Vector3(s * 0.972, WY + 0.53 * Math.sin(a), zz + 0.53 * Math.cos(a)));
      }
      const quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), (-s * Math.PI) / 2);
      P(boltGeo(bolts, 0.018, 0.014, quat), GOLD, { at: [0, 0, 0], name: `flareBolts${tag}${k}` });
      // gold edge line along the flare lip
      const lip: V3[] = [];
      for (let i = 0; i <= 16; i++) {
        const a = a0 + 0.05 + ((a1 - a0 - 0.1) * i) / 16;
        lip.push([s * 0.975, WY + 0.58 * Math.sin(a), zz + 0.58 * Math.cos(a)]);
      }
      S(lip, 0.008, GOLD, { caps: "flat" });
    }

  // mud flaps
  const yaw = (24 * Math.PI) / 180;
  for (const a of axles) {
    const j = flapJ[a.id];
    const x0 = a.s * 0.86;
    const z0 = a.z - 0.52;
    const d = new THREE.Vector3(a.s * Math.cos(yaw), 0, -Math.sin(yaw));
    b.extrude(
      [
        [-0.18, 0],
        [0.18, 0],
        [0.18, -0.44],
        [0.0, -0.56, "sharp"],
        [-0.18, -0.44],
      ],
      { bone: j, at: [x0, 0.66, z0], x: d, y: [0, 1, 0], thickness: 0.024, bevel: 0.006, color: flapPaint, name: `flap${a.id}` },
    );
    b.part(box(0.38, 0.06, 0.05), GOLD_D, { bone: j, at: [x0, 0.65, z0], rotation: [0, a.s * 24, 0], name: `flapBracket${a.id}` });
    const bolts: THREE.Vector3[] = [-0.14, 0, 0.14].map((u) => new THREE.Vector3(x0 + u * d.x, 0.65, z0 + u * d.z));
    b.part(boltGeo(bolts, 0.014, 0.012, new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2)), GOLD, {
      bone: j,
      at: [0, 0, 0],
      name: `flapBolts${a.id}`,
    });
    glow(b.part(box(0.26, 0.012, 0.012), CYAN, { bone: j, at: [x0 + 0.012 * d.z, 0.5, z0 - 0.015], rotation: [0, a.s * 24, 0], name: `flapGlow${a.id}` }), 1.2);
  }

  // ================================================================================================================
  // WHEELS
  // ================================================================================================================
  const tireProfile: [number, number][] = [
    [0.21, -0.12],
    [0.3, -0.135],
    [0.35, -0.115],
    [0.37, -0.07],
    [0.37, 0.07],
    [0.35, 0.115],
    [0.3, 0.135],
    [0.21, 0.12],
  ];
  const spokes: Pt[] = [];
  const NSP = 6;
  for (let k = 0; k < NSP; k++) {
    const a = (k * 2 * Math.PI) / NSP;
    const pol = (r: number, da: number): Pt => [r * Math.cos(a + da), r * Math.sin(a + da)];
    spokes.push(pol(0.215, -0.13), pol(0.215, 0.13, ), [0.085 * Math.cos(a + 0.52), 0.085 * Math.sin(a + 0.52), "sharp"]);
  }
  for (const w of axles) {
    const wb = wheelBone[w.id];
    const c: V3 = [w.s * WX, WY, w.z];
    const out = (d: number): V3 => [c[0] + w.s * d, c[1], c[2]];
    const axis: V3 = [w.s, 0, 0];
    b.lathe(tireProfile, { at: c, axis, segments: 20, bone: wb, color: tirePaint, name: `tire${w.id}` });
    // chunky treads
    const blocks: THREE.BufferGeometry[] = [];
    const N = 22;
    for (let i = 0; i < N; i++) {
      for (const row of [-1, 1]) {
        const th = ((i + (row > 0 ? 0.5 : 0)) * 2 * Math.PI) / N;
        const g = new THREE.BoxGeometry(0.05, 0.085, 0.115);
        g.rotateY(-th);
        g.translate(0.36 * Math.cos(th), row * 0.055, 0.36 * Math.sin(th));
        blocks.push(g);
      }
    }
    b.part(mergeGeometries(blocks)!, TREAD, { bone: wb, at: c, dir: axis, flat: true, name: `tread${w.id}` });
    // rim
    b.lathe(
      [
        [0.185, 0.08],
        [0.25, 0.09],
        [0.255, 0.135],
        [0.185, 0.135],
      ],
      { at: c, axis, segments: 18, bone: wb, color: GOLD, name: `rimLip${w.id}` },
    );
    b.part(new THREE.CylinderGeometry(0.215, 0.215, 0.04, 16), NAVY, { bone: wb, at: out(-0.02), dir: axis, name: `barrel${w.id}` });
    b.extrude(spokes, {
      at: out(0.095),
      bone: wb,
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.008,
      color: GOLD,
      name: `spokes${w.id}`,
    });
    b.lathe(
      [
        [0, 0.0],
        [0.075, 0.0],
        [0.06, 0.03],
        [0.025, 0.045],
        [0, 0.045],
      ],
      { at: out(0.105), axis, segments: 10, bone: wb, color: GOLD_D, name: `hub${w.id}` },
    );
    glow(
      b.lathe(
        [
          [0.028, 0.044],
          [0.05, 0.036],
          [0.05, 0.046],
          [0.028, 0.056],
        ],
        { at: out(0.105), axis, segments: 10, bone: wb, color: CYAN, name: `hubGlow${w.id}` },
      ),
      1.6,
    );
    // brake disc and caliper seen through the spokes
    b.lathe(
      [
        [0.07, 0.0],
        [0.19, 0.0],
        [0.19, 0.022],
        [0.07, 0.022],
      ],
      { at: out(0.035), axis, segments: 18, bone: wb, color: STEEL, name: `disc${w.id}` },
    );
    const calA = Math.PI * 0.62;
    b.part(box(0.07, 0.065, 0.11), MAG, {
      bone: carrier[w.id],
      at: [c[0] + w.s * 0.05, c[1] + 0.14 * Math.sin(calA), c[2] + 0.14 * Math.cos(calA)],
      rotation: [(-calA * 180) / Math.PI + 90, 0, 0],
      name: `caliper${w.id}`,
    });
    // lug nuts
    const lugs: THREE.Vector3[] = [];
    for (let i = 0; i < 5; i++) {
      const a = (i * 2 * Math.PI) / 5 + 0.3;
      lugs.push(new THREE.Vector3(0.05 * Math.cos(a), 0, 0.05 * Math.sin(a)));
    }
    b.part(boltGeo(lugs, 0.014, 0.03, new THREE.Quaternion()), STEEL, {
      bone: wb,
      at: out(0.115),
      dir: axis,
      name: `lugs${w.id}`,
    });
    // hub/arm link visible inside the well
    b.rod([w.s * 0.3, 0.36, w.z], [w.s * 0.66, WY, w.z], 0.022, { bone: carrier[w.id], color: STEEL_D, name: `axle${w.id}` });
    b.part(box(0.07, 0.24, 0.12), GOLD_D, { bone: carrier[w.id], at: [w.s * 0.63, WY, w.z], name: `knuckle${w.id}` });
    if (w.steer) b.rod([w.s * 0.63, 0.3, w.z - 0.05], [w.s * 0.3, 0.3, w.z - 0.12], 0.016, { bone: carrier[w.id], color: STEEL, name: `tieRod${w.id}` });
  }
  // lower control arms and dampers (static dress in the wells)
  for (const { s } of sides)
    for (const z of [FZ, RZ]) {
      const id = `${z > 0 ? "F" : "R"}${s > 0 ? "L" : "R"}`;
      R([s * 0.3, 0.33, z - 0.08], [s * 0.6, 0.38, z - 0.04], 0.018, STEEL_D, { bone: armBone[id] });
      R([s * 0.3, 0.33, z + 0.08], [s * 0.6, 0.38, z + 0.04], 0.018, STEEL_D, { bone: armBone[id] });
      R([s * 0.585, 0.38, z], [s * 0.575, 0.86, z], 0.024, GOLD);
      const coil = spiral([s * 0.58, 0.45, z], [s * 0.58 + 0.045, 0.45, z], [0, 1, 0], { turns: 5, r1: 0.045, pitch: 0.075 });
      b.sweep(coil, 0.008, { bone: chassis, color: CYAN_D, sides: 4, caps: "flat" });
    }

  // ================================================================================================================
  // GREENHOUSE: pillars, roof, glass, nets, cage, seats
  // ================================================================================================================
  for (const { s } of sides) {
    // A pillars
    R([s * 0.74, 1.04, 0.62], [s * 0.62, 1.39, 0.12], 0.04, bodyPaint);
    // B pillars
    R([s * 0.74, 1.04, -0.34], [s * 0.63, 1.38, -0.34], 0.036, NAVY);
    // C pillars
    R([s * 0.74, 1.04, -1.9], [s * 0.62, 1.38, -1.2], 0.05, bodyPaint);
    // roof rails and window sills
    R([s * 0.62, 1.385, 0.12], [s * 0.63, 1.385, -1.2], 0.03, NAVY);
    R([s * 0.75, 1.07, 0.6], [s * 0.75, 1.07, -1.9], 0.022, GOLD);
  }
  // roof panel
  X(
    [
      [-0.6, 0.14],
      [0.6, 0.14],
      [0.66, -0.5],
      [0.66, -1.1],
      [0.6, -1.22],
      [-0.6, -1.22],
      [-0.66, -1.1],
      [-0.66, -0.5],
    ],
    { at: [0, ROOF, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.045, bevel: 0.012, color: bodyPaint, name: "roof" },
  );
  // roof scoop
  X(
    [
      [-0.42, 0],
      [0, 0.085, "sharp"],
      [0, 0],
    ],
    { x: [0, 0, 1], at: [0, ROOF + 0.02, -0.5], thickness: [0.34, 0.28], bevel: 0.008, color: NAVY_L, name: "roofScoop" },
  );
  glow(P(box(0.24, 0.04, 0.012), CYAN, { at: [0, ROOF + 0.06, -0.495], name: "scoopGlow" }), 1.4);
  P(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", {
    at: [0, ROOF + 0.025, -1.0],
    dir: [0, 1, 0],
    up: [0, 0, 1],
    axis: "z",
    texture: VENT,
    name: "roofVent",
  });
  // roof number
  P(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", {
    at: [0, ROOF + 0.024, -0.2],
    dir: [0, 1, 0],
    up: [0, 0, 1],
    axis: "z",
    texture: ROUNDEL,
    name: "roofNumber",
  });
  // roof pod bar
  R([-0.52, 1.5, 0.2], [0.52, 1.5, 0.2], 0.024, GOLD, { caps: "round" });
  for (const x of [-0.5, 0, 0.5]) R([x, 1.42, 0.2], [x, 1.5, 0.2], 0.03, GOLD_D);
  for (const x of [-0.37, -0.125, 0.125, 0.37]) {
    pod([x, 1.58, 0.28], 0.075);
    R([x, 1.5, 0.2], [x, 1.55, 0.2], 0.026, GOLD_D);
  }

  // windshield (dark glass, glint paint), rear window on the hatch
  b.slab(
    [
      [0.7, 1.05, 0.6],
      [-0.7, 1.05, 0.6],
      [-0.6, 1.385, 0.13],
      [0.6, 1.385, 0.13],
    ],
    { bone: chassis, color: glassPaint, thickness: 0.02, name: "windshield" },
  );
  glow(S([[0.66, 1.355, 0.17], [-0.66, 1.355, 0.17]], 0.012, CYAN, { caps: "round" }), 1.3);
  b.slab(
    [
      [0.7, 1.05, 0.6],
      [-0.7, 1.05, 0.6],
      [-0.7, 1.08, 0.6],
      [0.7, 1.08, 0.6],
    ],
    { bone: chassis, color: NAVY, thickness: 0.03, name: "cowlGasket" },
  );
  // wipers
  for (const x of [0.25, -0.15]) R([x, 1.06, 0.6], [x + 0.32, 1.2, 0.5], 0.008, NAVY);
  // side nets
  for (const { s } of sides) {
    const out: V3 = [s, 0.33, 0];
    P(
      quadGeo([s * wx(1.06), 1.06, 0.57], [s * wx(1.06), 1.06, -0.31], [s * wx(1.37), 1.37, -0.31], [s * wx(1.37), 1.37, 0.15], out),
      "#ffffff",
      { at: [0, 0, 0], texture: NET_F, name: "netFront" },
    );
    P(
      quadGeo([s * wx(1.06), 1.06, -0.37], [s * wx(1.06), 1.06, -1.84], [s * wx(1.37), 1.37, -1.2], [s * wx(1.37), 1.37, -0.37], out),
      "#ffffff",
      { at: [0, 0, 0], texture: NET_R, name: "netRear" },
    );
  }

  // roll cage (visible through the nets)
  const cage = (pts: V3[], r = 0.022) => S(pts, r, STEEL);
  cage([[0.62, 0.36, -0.62], [0.62, 1.355, -0.62], [-0.62, 1.355, -0.62], [-0.62, 0.36, -0.62]]);
  cage([[0.62, 0.36, 0.5], [0.63, 1.0, 0.5], [0.6, 1.358, 0.14], [-0.6, 1.358, 0.14], [-0.63, 1.0, 0.5], [-0.62, 0.36, 0.5]]);
  for (const { s } of sides) {
    cage([[s * 0.63, 1.356, 0.14], [s * 0.63, 1.356, -0.62]]);
    cage([[s * 0.63, 1.356, -0.62], [s * 0.64, 1.22, -1.5]]);
    cage([[s * 0.62, 0.62, 0.5], [s * 0.64, 1.0, -0.4]], 0.018);
    cage([[s * 0.62, 1.0, 0.5], [s * 0.64, 0.62, -0.4]], 0.018);
    cage([[s * 0.62, 0.5, -0.62], [s * 0.64, 1.22, -1.5]], 0.018);
  }
  cage([[0.62, 0.36, -0.62], [-0.62, 1.355, -0.62]], 0.018);
  cage([[-0.62, 0.36, -0.62], [0.62, 1.355, -0.62]], 0.018);

  // seats and harness
  for (const { s } of sides) {
    const sx = s * 0.36;
    P(box(0.46, 0.12, 0.5), NAVY_L, { at: [sx, 0.46, -0.1], flat: true, name: "seatBase" });
    P(box(0.5, 0.64, 0.14), NAVY_L, { at: [sx, 0.82, -0.4], rotation: [-10, 0, 0], flat: true, name: "seatBack" });
    P(box(0.2, 0.2, 0.1), NAVY, { at: [sx, 1.2, -0.46], rotation: [-8, 0, 0], flat: true, name: "headrest" });
    for (const bx of [-1, 1]) {
      P(box(0.05, 0.4, 0.22), NAVY, { at: [sx + bx * 0.25, 0.8, -0.34], rotation: [-10, 0, bx * 6], flat: true, name: "bolster" });
      P(box(0.05, 0.1, 0.4), NAVY, { at: [sx + bx * 0.25, 0.5, -0.1], flat: true, name: "bolsterBase" });
      R([sx + bx * 0.12, 1.2, -0.42], [sx + bx * 0.05, 0.62, -0.34], 0.02, MAG);
    }
    glow(R([sx - 0.22, 0.54, -0.36], [sx + 0.22, 0.54, -0.36], 0.008, CYAN), 1.2);
    // harness belts across the shoulders
    R([sx + 0.12, 1.14, -0.43], [sx + 0.03, 0.9, -0.33], 0.02, MAG);
    R([sx - 0.12, 1.14, -0.43], [sx - 0.03, 0.9, -0.33], 0.02, MAG);
  }
  // steering column and wheel
  R([0.36, 0.78, 0.46], [0.36, 0.92, 0.3], 0.03, NAVY);
  b.part(new THREE.TorusGeometry(0.14, 0.02, 6, 14), NAVY_L, { bone: steeringWheel, at: [0.36, 0.93, 0.3], dir: [0, 0.35, -1], axis: "z", name: "steeringRim" });
  b.part(box(0.04, 0.26, 0.03), NAVY_L, { bone: steeringWheel, at: [0.36, 0.93, 0.3], dir: [0, 0.35, -1], axis: "z", name: "steeringSpoke" });
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 8), GOLD, { bone: steeringWheel, at: [0.36, 0.93, 0.3], dir: [0, 0.35, -1], name: "steeringHub" });
  // extinguisher and battery in the rear
  P(new THREE.CylinderGeometry(0.06, 0.06, 0.34, 8), MAG, { at: [-0.5, 0.555, -0.98], name: "extinguisher" });
  P(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), GOLD, { at: [-0.5, 0.744, -0.98], name: "extNozzle" });
  P(box(0.3, 0.22, 0.2), NAVY, { at: [0.42, 0.5, -1.2], name: "battery" });
  P(box(0.3, 0.02, 0.2), GOLD_D, { at: [0.42, 0.62, -1.2], name: "batteryTop" });

  // ================================================================================================================
  // HOOD
  // ================================================================================================================
  const hoodY: V3 = [0, -0.145, 1];
  b.extrude(
    [
      [-0.64, 0],
      [0.64, 0],
      [0.66, 0.6],
      [0.58, 1.1],
      [0.0, 1.42, "sharp"],
      [-0.58, 1.1],
      [-0.66, 0.6],
    ],
    { bone: hood, at: [0, 0.975, 0.62], x: [1, 0, 0], y: hoodY, thickness: 0.05, bevel: 0.012, color: bodyPaint, name: "hoodPanel" },
  );
  // hood scoop with glowing inlet
  b.extrude(
    [
      [-0.5, 0],
      [0.0, 0.1, "sharp"],
      [0.0, 0],
    ],
    { x: [0, 0, 1], bone: hood, at: [0, 0.94, 1.52], thickness: [0.3, 0.22], bevel: 0.008, color: NAVY_L, name: "hoodScoop" },
  );
  glow(b.part(box(0.2, 0.05, 0.014), CYAN, { bone: hood, at: [0, 0.975, 1.53], name: "hoodInlet" }), 1.4);
  // hood vents: louvres each side
  for (const { s } of sides)
    for (let i = 0; i < 4; i++) {
      const z = 0.95 + i * 0.1;
      const y = 0.975 - 0.145 * (z - 0.62) + 0.028;
      b.part(box(0.26, 0.016, 0.035), NAVY, { bone: hood, at: [s * 0.4, y, z], rotation: [-8, -s * 14, 0], name: "louvre" });
      glow(b.part(box(0.2, 0.006, 0.012), CYAN_D, { bone: hood, at: [s * 0.4, y + 0.01, z + 0.014], rotation: [-8, -s * 14, 0], name: "louvreGlow" }), 1.1);
    }
  // hood pins
  for (const [x, z] of [
    [0.45, 0.78],
    [-0.45, 0.78],
    [0.3, 1.7],
    [-0.3, 1.7],
  ] as const) {
    const y = 0.975 - 0.145 * (z - 0.62) + 0.03;
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.045, 6), STEEL, { bone: hood, at: [x, y, z], name: "hoodPin" });
    b.part(new THREE.TorusGeometry(0.03, 0.005, 4, 8), STEEL, { bone: hood, at: [x + 0.03, y + 0.02, z], rotation: [80, 0, 0], name: "pinLoop" });
  }
  // fender gap lines
  for (const { s } of sides) b.rod([s * 0.655, 1.0, 0.62], [s * 0.655, 0.865, 1.9], 0.006, { bone: hood, color: NAVY });

  // ================================================================================================================
  // DOORS
  // ================================================================================================================
  for (const { s, k } of sides) {
    const dj = doorJ[k];
    const xo = s * 0.865;
    b.extrude(
      [
        [0.55, 0.42],
        [0.55, 1.03],
        [-0.2, 1.04],
        [-0.54, 1.03],
        [-0.5, 0.42],
      ],
      { x: [0, 0, 1], bone: dj, at: [xo, 0, 0], thickness: 0.06, bevel: 0.015, color: bodyPaint, name: `door${k}` },
    );
    // belt trim and window frame rail
    b.rod([s * 0.9, 1.035, 0.54], [s * 0.9, 1.04, -0.53], 0.016, { bone: dj, color: GOLD });
    b.rod([s * 0.9, 0.44, 0.54], [s * 0.9, 0.44, -0.49], 0.014, { bone: dj, color: GOLD_D });
    // seam lines
    b.rod([s * 0.9, 0.43, 0.545], [s * 0.9, 1.02, 0.545], 0.007, { bone: dj, color: NAVY });
    b.rod([s * 0.9, 0.43, -0.5], [s * 0.9, 1.02, -0.535], 0.007, { bone: dj, color: NAVY });
    // handle
    b.part(box(0.02, 0.04, 0.16), GOLD, { bone: dj, at: [s * 0.915, 0.96, -0.36], name: "handle" });
    b.part(box(0.026, 0.05, 0.04), NAVY, { bone: dj, at: [s * 0.91, 0.96, -0.28], name: "handleBase" });
    // number roundel
    b.part(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", {
      bone: dj,
      at: [s * 0.9, 0.72, 0.0],
      dir: [s, 0, 0],
      axis: "z",
      texture: ROUNDEL,
      name: "roundel",
    });
    // side-skirt dart (gold blade on the sill)
    b.extrude(
      [
        [0.52, 0],
        [-0.46, 0],
        [-0.52, 0.08, "sharp"],
        [0.4, 0.06],
      ],
      { x: [0, 0, 1], bone: dj, at: [s * 0.9, 0.38, 0], thickness: 0.03, bevel: 0.006, color: NAVY, name: "skirt" },
    );
    glow(b.rod([s * 0.92, 0.395, 0.45], [s * 0.92, 0.395, -0.4], 0.01, { bone: dj, color: CYAN }), 1.4);
    // mirror
    b.rod([s * 0.86, 1.04, 0.45], [s * 0.92, 1.1, 0.4], 0.014, { bone: dj, color: NAVY });
    b.part(box(0.07, 0.1, 0.17), BLUE_D, { bone: dj, at: [s * 0.96, 1.13, 0.4], rotation: [0, 0, s * 6], flat: true, name: "mirror" });
    b.part(box(0.01, 0.075, 0.14), STEEL, { bone: dj, at: [s * 0.96, 1.13, 0.405], name: "mirrorGlass" });
    glow(b.part(box(0.012, 0.012, 0.1), CYAN, { bone: dj, at: [s * 0.995, 1.09, 0.4], name: "mirrorLight" }), 1.4);
    // fuel cap on right rear quarter handled below
  }

  // ================================================================================================================
  // HATCH, tail, wing
  // ================================================================================================================
  b.slab(
    [
      [0.7, 1.05, -1.88],
      [-0.7, 1.05, -1.88],
      [-0.6, 1.385, -1.2],
      [0.6, 1.385, -1.2],
    ],
    { bone: hatch, color: defrostPaint, thickness: 0.02, name: "rearGlass" },
  );
  b.extrude(
    [
      [-0.7, 0.8],
      [0.7, 0.8],
      [0.7, 1.04],
      [-0.7, 1.04],
    ],
    { bone: hatch, at: [0, 0, -1.94], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.07, bevel: 0.012, color: bodyPaint, name: "hatchPanel" },
  );
  b.part(new THREE.PlaneGeometry(0.34, 0.075), "#ffffff", {
    bone: hatch,
    at: [0, 0.9, -1.98],
    dir: [0, 0, -1],
    axis: "z",
    texture: PLATE,
    name: "plateR",
  });
  b.part(new THREE.PlaneGeometry(0.4, 0.1), "#ffffff", { bone: hatch, at: [0, 1.0, -1.981], dir: [0, 0, -1], axis: "z", texture: SLASH, name: "hatchSlash" });
  glow(b.rod([-0.5, 1.045, -1.92], [0.5, 1.045, -1.92], 0.01, { bone: hatch, color: CYAN }), 1.3);
  b.rod([0.7, 1.05, -1.88], [-0.7, 1.05, -1.88], 0.02, { bone: hatch, color: NAVY });
  b.rod([0.6, 1.385, -1.2], [-0.6, 1.385, -1.2], 0.022, { bone: hatch, color: NAVY });
  glow(b.rod([-0.34, 1.372, -1.226], [0.34, 1.372, -1.226], 0.012, { bone: hatch, color: TAIL }), 1.6);
  b.rod([0.0, 1.088, -1.84], [0.46, 1.16, -1.72], 0.008, { bone: hatch, color: NAVY });
  b.part(new THREE.SphereGeometry(0.02, 6, 4), NAVY, { bone: hatch, at: [0.0, 1.088, -1.84], name: "wiperPivot" });
  // tail lights: angular slashes
  for (const { s } of sides) {
    b.slab([[s * 0.34, 0.64, -2.04], [s * 0.82, 0.7, -2.04], [s * 0.82, 0.82, -2.04], [s * 0.34, 0.74, -2.04]], { bone: chassis, color: NAVY, thickness: 0.03, name: "tailHousing" });
    glow(b.slab([[s * 0.4, 0.67, -2.06], [s * 0.78, 0.72, -2.06], [s * 0.78, 0.79, -2.06], [s * 0.4, 0.73, -2.06]], { bone: chassis, color: TAIL, thickness: 0.016, name: "tailLamp" }), 1.8);
    glow(b.slab([[s * 0.4, 0.64, -2.06], [s * 0.6, 0.66, -2.06], [s * 0.6, 0.675, -2.06], [s * 0.4, 0.655, -2.06]], { bone: chassis, color: MAG, thickness: 0.016, name: "tailAccent" }), 1.4);
  }
  // rear bumper valance, diffuser fins, exhaust, tow loop
  X(
    [
      [-0.84, -1.75],
      [0.84, -1.75],
      [0.9, -1.98],
      [0.7, -2.12, "sharp"],
      [-0.7, -2.12, "sharp"],
      [-0.9, -1.98],
    ],
    { at: [0, 0.31, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.05, bevel: 0.01, color: NAVY, name: "rearValance" },
  );
  for (let i = -3; i <= 3; i++)
    X(
      [
        [-0.12, 0],
        [0.0, 0.0],
        [0.0, 0.14],
      ],
      { at: [i * 0.11, 0.33, -2.02], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.014, color: NAVY_L, name: "diffFin" },
    );
  for (const [x, y] of [[0.44, 0.42]] as const) {
    L(
      [
        [0.0, -0.14],
        [0.05, -0.14],
        [0.058, 0.1],
        [0.0, 0.1],
      ],
      { at: [x, y, -2.02], axis: [0, 0, -1], segments: 8, color: STEEL, name: "exhaust" },
    );
    L(
      [
        [0.0, 0.09],
        [0.045, 0.09],
        [0.045, 0.1],
        [0.0, 0.1],
      ],
      { at: [x, y, -2.02], axis: [0, 0, -1], segments: 8, color: NAVY, name: "exhaustMouth" },
    );
  }
  S([[0.55, 0.42, -2.03], [0.62, 0.34, -2.12], [0.7, 0.42, -2.06]], 0.014, MAG, { caps: "round" });
  S([[-0.55, 0.42, -2.03], [-0.62, 0.34, -2.12], [-0.7, 0.42, -2.06]], 0.014, MAG, { caps: "round" });
  // fuel cap
  P(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 8), GOLD, { at: [-0.855, 0.92, -1.62], dir: [-1, 0, 0], name: "fuelCap" });
  P(new THREE.CylinderGeometry(0.03, 0.03, 0.026, 6), NAVY, { at: [-0.862, 0.92, -1.62], dir: [-1, 0, 0], name: "fuelCapCore" });

  // wing: pylons, main plane, flap, end blades
  for (const { s } of sides)
    X(
      [
        [-1.8, 1.0],
        [-1.97, 1.0],
        [-1.94, 1.5],
        [-1.84, 1.5],
      ],
      { x: [0, 0, 1], at: [s * 0.62, 0, 0], thickness: 0.055, bevel: 0.01, color: GOLD, name: "pylon" },
    );
  X(
    [
      [0.28, 0],
      [0.2, 0.045],
      [0.0, 0.07],
      [-0.1, 0.065],
      [-0.1, -0.015],
      [0.12, -0.02],
    ],
    { x: [0, 0, 1], at: [0, WING.y, WING.z], thickness: 1.92, bevel: 0.006, color: wingPaint, name: "wingPlane" },
  );
  b.extrude(
    [
      [0.0, 0.0],
      [-0.2, -0.03],
      [-0.22, -0.06],
      [0.0, -0.075],
    ],
    { x: [0, 0, 1], bone: wingFlap, at: [0, WING.y + 0.065, WING.z - 0.1], thickness: 1.92, bevel: 0.004, color: wingPaint, name: "wingFlap" },
  );
  for (const { s } of sides) {
    X(
      [
        [0.34, -0.14],
        [0.36, 0.08],
        [0.12, 0.12],
        [-0.22, 0.3, "sharp"],
        [-0.42, 0.32, "sharp"],
        [-0.34, 0.0],
        [-0.26, -0.14],
      ],
      { x: [0, 0, 1], at: [s * 0.97, WING.y, WING.z], thickness: 0.03, bevel: 0.008, color: paint((_p, n, c) => (Math.abs(n.x) < 0.5 ? GOLD : c[0] < -0.1 && c[1] > 0.08 ? MAG : c[1] < -0.05 ? NAVY : BLUE)), name: "endBlade" },
    );
    glow(R([s * 0.99, WING.y + 0.1, WING.z + 0.1], [s * 0.99, WING.y + 0.27, WING.z - 0.2], 0.01, CYAN), 1.5);
    glow(R([s * 0.99, WING.y - 0.02, WING.z + 0.33], [s * 0.99, WING.y + 0.08, WING.z + 0.15], 0.01, CYAN), 1.3);
  }

  // underglow strips along the sills
  for (const { s } of sides) glow(R([s * 0.7, 0.27, 0.66], [s * 0.7, 0.27, -0.68], 0.014, CYAN), 1.6);

  // drivetrain under the plate: shaft, diffs, muffler
  R([0, 0.235, -1.2], [0, 0.235, 1.2], 0.035, STEEL_D);
  for (const z of [FZ, RZ]) {
    P(new THREE.SphereGeometry(0.1, 8, 6), GOLD_D, { at: [0, 0.24, z], scale: [1.5, 0.9, 1], name: "diff" });
    R([-0.3, 0.24, z], [0.3, 0.24, z], 0.02, STEEL_D);
  }
  L(
    [
      [0, 0],
      [0.08, 0],
      [0.1, 0.12],
      [0.1, 0.78],
      [0.08, 0.9],
      [0, 0.9],
    ],
    { at: [0.44, 0.235, -0.95], axis: [0, 0, -1], segments: 10, color: STEEL, name: "muffler" },
  );
  R([0.44, 0.235, -1.85], [0.44, 0.38, -2.0], 0.04, STEEL_D);

  // cyan light lines inside each wheel arch
  for (const { s } of sides)
    for (const zz of [FZ, RZ]) {
      const arcPts: V3[] = [];
      for (let i = 0; i <= 12; i++) {
        const a = ((-10 + (200 * i) / 12) * Math.PI) / 180;
        arcPts.push([s * 0.72, WY + (ARCH_R - 0.012) * Math.sin(a), zz + (ARCH_R - 0.012) * Math.cos(a)]);
      }
      glow(S(arcPts, 0.008, CYAN, { caps: "round" }), 1.3);
    }

  // fender blades
  for (const { s } of sides) {
    X(
      [
        [1.64, 0.92],
        [1.25, 1.04],
        [0.72, 1.26, "sharp"],
        [0.92, 1.02],
        [1.2, 0.98],
      ],
      { x: [0, 0, 1], at: [s * 0.8, 0, 0], thickness: 0.03, bevel: 0.006, color: GOLD, name: "fenderBlade" },
    );
    glow(R([s * 0.8, 1.045, 1.24], [s * 0.8, 1.25, 0.74], 0.008, CYAN), 1.4);
    P(new THREE.PlaneGeometry(0.22, 0.22), "#ffffff", { at: [s * 0.847, 0.66, -1.84], dir: [s, 0, 0], axis: "z", texture: VENT, name: "quarterVent" });
  }

  // front tow loop
  for (const s of [1, -1]) S([[s * 0.5, 0.36, 2.1], [s * 0.52, 0.29, 2.17], [s * 0.64, 0.29, 2.17], [s * 0.66, 0.36, 2.1]], 0.016, MAG, { caps: "round" });

  // antenna
  R([-0.5, ROOF + 0.02, -1.15], [-0.5, ROOF + 0.2, -1.17], [0.012, 0.005], STEEL);
  P(new THREE.SphereGeometry(0.018, 6, 4), MAG, { at: [-0.5, ROOF + 0.21, -1.17], name: "antennaTip" });

  // wrap unused helper references
  void [WHITE, CYAN_D, BLUE_D, catmull, polyline, plankPaint];

  return b.root;
}
```

## Example: skyshipGalleonSonnet

Brief: Category: Vehicle.
Subject: hovering swan-prowed flying galleon with cel-shaded hull, three masts, sails, figurehead, wing-fins and ducted propellers.
Style: high-fantasy anime.
Topology: vehicle-winged
Style family: high-fantasy-anime
Notable features: hull, masts, sails, figurehead, propellers

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "agentic-3js-builder";
import type { Builder, OutlinePoint } from "agentic-3js-builder";
import { frame } from "agentic-3js-builder";
import type { Frame } from "agentic-3js-builder";
import { aim, DEG, rng } from "agentic-3js-builder";
import { catmull, polyline, spiral } from "agentic-3js-builder";
import { mix, noise, paint, resolve, rgb, smoothstep } from "agentic-3js-builder";
import type { ColorInput, Rgb } from "agentic-3js-builder";
import type { Fill } from "agentic-3js-builder";
import type { Joint } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { cel, zigzag } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Aurora Sky Galleon",
  description:
    "A swan-prowed flying galleon hovering half a metre up: navy and crimson cel-shaded hull with gold filigree, three masts of cream sails, a winged phoenix figurehead, feathered wing-fins and two ducted propellers.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

type P3 = [number, number, number];
const P = (x: number, y: number, z: number): P3 => [x, y, z];
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const fract = (x: number) => x - Math.floor(x);

// ---------------------------------------------------------------- palette (all cel-shaded, lit tone + hue-shifted shadow)
const LIGHT: P3 = [0, 0.75, 0.45];
const C = (lit: ColorInput, shadow?: ColorInput) => cel(lit, shadow, { light: LIGHT, threshold: -0.02 });
const SOFT_LIGHT = new THREE.Vector3(0, 0.45, 0.55).normalize();
/** Cloth cel: two tones, with a lavender shadow only on faces turned well away from the light. */
const softCel = (inner: ColorInput) =>
  paint((p, n) => {
    const base = resolve(inner, p, n);
    return n.dot(SOFT_LIGHT) > -0.15 ? base : mix(base, rgb("#c3b2ee"), 0.4);
  });
const NAVY = rgb("#2d4a9a");
const NAVY_D = rgb("#1b2b6a");
const CRIM = rgb("#dc3a52");
const GOLD = rgb("#ffd24d");
const GOLD_D = rgb("#cf8a22");
const CREAM = rgb("#fff7e6");
const WHITE = rgb("#fffdf6");
const LAV = rgb("#e6d3ee");
const TEAL = rgb("#34dccb");
const SKY = rgb("#bff3f0");
const WOODC = rgb("#cf8a52");
const DECKC = rgb("#ebba7c");
const ROPE = "#d4b27c";

const GOLDM = C("#ffd24d", "#cf7f22");
const WOODM = C("#cf8a52", "#8f4f4c");
const CRIMM = C("#dc3a52", "#8f1f50");
const IRONM = C("#5a5780", "#363358");
const DECKM = C("#ebba7c", "#c4806a");

// ---------------------------------------------------------------- geometry helpers
const V = (p: P3) => new THREE.Vector3(p[0], p[1], p[2]);

/** Frustum rod between two model-space points (4..8 sided), vertices already in model space. */
function rodG(a: P3, b: P3, r: number, sides = 5, r2?: number) {
  const d = V(b).sub(V(a));
  const g = new THREE.CylinderGeometry(r2 ?? r, r, d.length(), sides, 1, r < 0.04);
  g.applyQuaternion(aim(d.normalize()));
  const m = V(a).add(V(b)).multiplyScalar(0.5);
  g.translate(m.x, m.y, m.z);
  return g;
}

/** Box between two points: w across, h the other side. */
function beamG(a: P3, b: P3, w: number, h: number, up?: P3) {
  const d = V(b).sub(V(a));
  const g = new THREE.BoxGeometry(w, d.length(), h);
  g.applyQuaternion(aim(d.normalize(), up));
  const m = V(a).add(V(b)).multiplyScalar(0.5);
  g.translate(m.x, m.y, m.z);
  return g;
}

function xf(g: THREE.BufferGeometry, at: P3, rot: P3 = [0, 0, 0], scale: P3 = [1, 1, 1]) {
  const m = new THREE.Matrix4().compose(
    V(at),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG, "YXZ")),
    V(scale),
  );
  return g.applyMatrix4(m);
}

/** Small trim batches use flat colours: they cost no paint-sheet area, which keeps the big painted surfaces sharp. */
const FLAT_OF = new Map<Fill, string>([
  [GOLDM, "#f6c540"],
  [WOODM, "#c47d4a"],
  [IRONM, "#5b5880"],
  [DECKM, "#e6b074"],
]);

class Batch {
  private g: THREE.BufferGeometry[] = [];
  private color: Fill;
  constructor(
    private b: Builder,
    color: Fill,
    private bone: Joint,
    private name: string,
    private flat = true,
  ) {
    this.color = FLAT_OF.get(color) ?? color;
  }
  add(geo: THREE.BufferGeometry) {
    const n = geo.index ? geo.toNonIndexed() : geo;
    for (const k of Object.keys(n.attributes)) if (k !== "position" && k !== "normal" && k !== "uv") n.deleteAttribute(k);
    this.g.push(n);
    return this;
  }
  done() {
    if (!this.g.length) return null;
    const made = this.b.part(mergeGeometries(this.g, false)!, this.color, {
      bone: this.bone,
      at: [0, 0, 0],
      name: this.name,
      flat: this.flat,
    });
    this.g = [];
    return made;
  }
}

// ---------------------------------------------------------------- hull station tables (stern -> bow)
const ZS = [-6.2, -4.6, -3.0, -1.4, 0.2, 1.8, 3.4, 4.9, 6.1, 6.9, 7.5];
const WG = [1.85, 2.15, 2.34, 2.43, 2.45, 2.4, 2.2, 1.75, 1.15, 0.6, 0.14]; // gunwale half width
const YT = [3.95, 3.6, 3.25, 2.85, 2.64, 2.7, 2.95, 3.4, 3.85, 4.15, 4.4]; // gunwale height
const KEEL_LIFT = -0.045;
const YK = [2.15, 1.45, 0.95, 0.68, 0.62, 0.66, 0.92, 1.5, 2.35, 3.3, 4.15].map((y, i) => (i >= 3 && i <= 5 ? y + KEEL_LIFT : y));
const ULV = [0, 0.22, 0.5, 0.76, 1];
const FXV = [0, 0.52, 0.88, 1.0, 0.93];
const WMAX = 0.93;

function lerpArr(arr: number[], z: number) {
  if (z <= ZS[0]) return arr[0];
  if (z >= ZS[ZS.length - 1]) return arr[arr.length - 1];
  let i = 0;
  while (z > ZS[i + 1]) i++;
  const t = (z - ZS[i]) / (ZS[i + 1] - ZS[i]);
  return arr[i] + (arr[i + 1] - arr[i]) * t;
}
function fxAt(u: number) {
  u = clamp(u, 0, 1);
  for (let k = 0; k < ULV.length - 1; k++)
    if (u <= ULV[k + 1]) return FXV[k] + ((FXV[k + 1] - FXV[k]) * (u - ULV[k])) / (ULV[k + 1] - ULV[k]);
  return FXV[FXV.length - 1];
}
function halfWidthAt(z: number, y: number) {
  const yk = lerpArr(YK, z);
  const yt = lerpArr(YT, z);
  return (lerpArr(WG, z) / WMAX) * fxAt((y - yk) / Math.max(0.05, yt - yk));
}
const sheerAt = (z: number) => lerpArr(YT, z);
/** Hull line at fraction u of the depth, as a path-ready point list, stern to bow. */
function hullLine(s: number, u: number, dx = 0, dy = 0): P3[] {
  return ZS.map((z, i) => P(s * ((WG[i] / WMAX) * fxAt(u) + (u > 0 ? dx : 0)), YK[i] + u * (YT[i] - YK[i]) + dy, z));
}

// ---------------------------------------------------------------- paints
const hullPaint = cel(
  paint((p, n) => {
    const yk = lerpArr(YK, p.z);
    const yt = lerpArr(YT, p.z);
    const d = Math.max(0.3, yt - yk);
    const u = (p.y - yk) / d;
    const inner = n.x * (p.x >= 0 ? 1 : -1) < -0.4;
    const rowH = 0.2;
    const row = (p.y - yk) / rowH;
    const rf = fract(row);
    const seam = rf < 0.07;
    const butt = Math.abs(fract((p.z + Math.floor(row) * 0.91) / 1.7) - 0.5) > 0.488;
    if (inner) {
      if (seam || butt) return rgb("#a5604f");
      return u > 0.97 ? GOLD : rgb("#d9955a");
    }
    // keel strip
    if (u < 0.2 && Math.abs(p.x) < 0.1) return GOLD_D;
    if (u > 0.965) return GOLD;
    if (u > 0.8 && u < 0.835) return GOLD;
    if (u > 0.53 && u < 0.567) return GOLD;
    if (u >= 0.567 && u <= 0.8) {
      if (Math.abs(u - 0.585) < 0.008 || Math.abs(u - 0.782) < 0.008) return GOLD;
      return mix(CRIM, rgb("#c32d5a"), (seam ? 0.6 : 0) + 0.2 * noise(p, 0.4, 3));
    }
    const base = u > 0.8 ? NAVY : mix(NAVY, NAVY_D, 0.35 * smoothstep(0.3, 0.0, u));
    // sky-foam waves low on the hull
    const wave = u < 0.45 && Math.abs(u - (0.2 + 0.035 * Math.sin(p.z * 3.1 + 0.4))) < 0.012;
    if (wave) return SKY;
    const wave2 = u < 0.45 && u > 0.09 && Math.abs(u - (0.3 + 0.03 * Math.sin(p.z * 3.1 + 2.2))) < 0.008;
    if (wave2) return mix(SKY, NAVY, 0.45);
    if (seam || butt) return mix(base, NAVY_D, 0.65);
    return base;
  }),
  undefined,
  { light: LIGHT, threshold: -0.3 },
);

const deckPaint = C(
  paint((p, n, s) => {
    if (n.y < 0.5) return rgb("#9a5d46");
    const x = s[0];
    const k = Math.floor(x / 0.3 + 200);
    const fx = fract(x / 0.3);
    if (Math.abs(x) < 0.07) return GOLD;
    if (fx < 0.06) return rgb("#b9744e");
    const butt = Math.abs(fract((s[1] + k * 0.83) / 2.3) - 0.5) > 0.487;
    if (butt) return rgb("#b9744e");
    const tone = k % 3 === 0 ? 0 : k % 3 === 1 ? 0.18 : 0.34;
    return mix(DECKC, WOODC, tone * 0.6 + 0.12 * noise(p, 0.6, 5));
  }),
);

function sailPaint(hwTop: number, hwFoot: number, yTop: number, yFoot: number, sag = 0.3) {
  return softCel(
    paint((p) => {
      const t = (p.y - yFoot) / (yTop - yFoot);
      const hw = hwFoot + (hwTop - hwFoot) * t;
      const dSide = hw - Math.abs(p.x);
      const footY = yFoot + sag * (1 - (p.x / hwFoot) ** 2);
      const dFoot = p.y - footY;
      const dTop = yTop - p.y;
      if (dTop < 0.1) return GOLD;
      if (dTop < 0.34) return Math.abs(dTop - 0.22) < 0.025 ? GOLD : CRIM;
      if (dSide < 0.08) return GOLD;
      if (dSide < 0.2) return dSide < 0.14 ? CRIM : mix(CRIM, GOLD, 0.0);
      if (dFoot < 0.09) return GOLD;
      if (dFoot < 0.3) {
        const zz = zigzag(p.x / 0.5);
        return dFoot - 0.09 < 0.21 * (1 - zz) ? CRIM : CREAM;
      }
      const seam = Math.abs(fract(p.x / 0.9 + 0.5) - 0.5) < 0.012;
      const cloud = noise(p, 0.9, 11);
      const c = mix(CREAM, LAV, 0.22 * cloud + 0.1 * (1 - t));
      const swirl = Math.abs(fract((p.y - yFoot + 0.3 * Math.sin(p.x * 1.4 + yFoot)) / 0.75) - 0.5) > 0.47;
      const cc = swirl ? mix(c, SKY, 0.4) : c;
      return seam ? mix(cc, LAV, 0.7) : cc;
    }),
  );
}

function featherPaint(len: number, c1: Rgb, c2: Rgb) {
  return C(
    paint((_p, _n, s) => {
      const x = s[0];
      const y = s[1];
      if (Math.abs(y) < 0.02) return GOLD;
      const t = clamp(x / len, 0, 1);
      if (t > 0.9) return GOLD;
      const bar = fract(x * 4.2 - Math.abs(y) * 2.2);
      const base = mix(c1, c2, smoothstep(0.35, 0.95, t));
      return bar < 0.07 ? mix(base, c1, 0.45) : base;
    }),
  );
}

// ---------------------------------------------------------------- drawings
const EMBLEM = svg(
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#7a3a14" stroke-width="3" stroke-linejoin="round">
    <path d="M100 98 C74 66 34 56 4 74 C26 76 36 86 42 98 C26 100 18 112 22 128 C42 114 60 114 78 124 Z" fill="#fff7e6"/>
    <path d="M100 98 C126 66 166 56 196 74 C174 76 164 86 158 98 C174 100 182 112 178 128 C158 114 140 114 122 124 Z" fill="#fff7e6"/>
    <path d="M18 76 C40 78 52 86 58 98 M24 118 C44 108 60 108 76 116" fill="none" stroke="#e0a028" stroke-width="4"/>
    <path d="M182 76 C160 78 148 86 142 98 M176 118 C156 108 140 108 124 116" fill="none" stroke="#e0a028" stroke-width="4"/>
    <polygon fill="#ffd24d" points="100,6 112,48 152,24 140,66 188,62 156,94 196,118 150,124 172,166 128,150 128,192 100,162 72,192 72,150 28,166 50,124 4,118 44,94 12,62 60,66 48,24 88,48"/>
    <circle cx="100" cy="100" r="46" fill="#dc3a52"/>
    <circle cx="100" cy="100" r="46" fill="none" stroke="#fff7e6" stroke-width="5"/>
    <circle cx="100" cy="100" r="30" fill="#2d4a9a"/>
    <circle cx="100" cy="100" r="30" fill="none" stroke="#ffd24d" stroke-width="4"/>
    <path d="M100 76 L110 100 L100 124 L90 100 Z" fill="#34dccb" stroke="#fff7e6" stroke-width="3"/>
  </g></svg>`,
  { size: 512 },
);

const FILIGREE = svg(
  `<svg viewBox="0 0 240 60" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="#ffd24d" stroke-width="3.6" stroke-linecap="round">
    <path d="M2 30 C14 6 38 6 38 30 C38 46 22 48 20 36 C19 28 28 26 30 31"/>
    <path d="M78 30 C66 54 42 54 42 30 C42 14 58 12 60 24 C61 32 52 34 50 29"/>
    <path d="M78 30 C90 6 114 6 114 30 C114 46 98 48 96 36 C95 28 104 26 106 31"/>
    <path d="M154 30 C142 54 118 54 118 30 C118 14 134 12 136 24 C137 32 128 34 126 29"/>
    <path d="M154 30 C166 6 190 6 190 30 C190 46 174 48 172 36 C171 28 180 26 182 31"/>
    <path d="M238 30 C226 54 202 54 202 30 C202 14 218 12 220 24 C221 32 212 34 210 29"/>
  </g>
  <g fill="#34dccb" stroke="#fff7e6" stroke-width="1.6">
    <circle cx="40" cy="30" r="4.2"/><circle cx="116" cy="30" r="4.2"/><circle cx="192" cy="30" r="4.2"/>
  </g>
  <g fill="#ffd24d"><circle cx="78" cy="30" r="3"/><circle cx="154" cy="30" r="3"/><circle cx="2" cy="30" r="3"/><circle cx="238" cy="30" r="3"/></g>
</svg>`,
  { size: 1024 },
);

const TASSEL = svg(
  `<svg viewBox="0 0 24 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="7" r="6" fill="#ffd24d" stroke="#cf8a22" stroke-width="1.5"/>
  <rect x="8.5" y="12" width="7" height="8" fill="#dc3a52"/>
  <rect x="7.5" y="18" width="9" height="3" fill="#ffd24d"/>
  <path d="M5 22 H19 L22 62 H2 Z" fill="#dc3a52"/>
  <g stroke="#ffd24d" stroke-width="1.6"><path d="M8 24 V60 M12 24 V61 M16 24 V60"/><path d="M4 30 H20"/></g>
</svg>`,
  { size: 192 },
);

const WINDOW = svg(
  `<svg viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 63 V24 Q2 3 20 3 Q38 3 38 24 V63 Z" fill="#a9701f"/>
  <path d="M6 59 V25 Q6 8 20 8 Q34 8 34 25 V59 Z" fill="#ffe3a0"/>
  <path d="M6 59 V42 L34 32 V59 Z" fill="#ffb347"/>
  <path d="M10 22 Q12 14 20 12" fill="none" stroke="#fffbe8" stroke-width="2.4" stroke-linecap="round"/>
  <rect x="18.4" y="8" width="3.2" height="51" fill="#a9701f"/>
  <rect x="6" y="31" width="28" height="3" fill="#a9701f"/>
</svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------- build
export default function build() {
  const b = createBuilder({ name: "skyship_galleon", paintSize: 2048 });

  // ------------------------------------------------------------ skeleton
  const hull = b.joint("hull", { at: [0, 2.0, 0] });
  const rudder = b.joint("rudder", { parent: hull, at: [0, 2.3, -6.4], dir: [0, -1, 0], role: "hinge" });
  const wheel = b.joint("helmWheel", { parent: hull, at: [0, 3.78, -4.45], dir: [0, 0, 1], role: "hinge" });
  const PROP_C: Record<number, P3> = { 1: [3.95, 1.95, 1.7], [-1]: [-3.95, 1.95, 1.7] };
  const propL = b.joint("propL", { parent: hull, at: PROP_C[1], dir: [0, 0, 1], role: "hinge" });
  const propR = b.joint("propR", { parent: hull, at: PROP_C[-1], dir: [0, 0, 1], role: "hinge" });
  const MASTS = { fore: 3.3, main: -0.3, mizzen: -3.75 };
  const yard = (name: string, z: number, y: number) =>
    b.joint(name, { parent: hull, at: [0, y, z], dir: [0, 1, 0], role: "hinge" });
  const yFC = yard("yardForeCourse", MASTS.fore, 7.5);
  const yFT = yard("yardForeTop", MASTS.fore, 10.0);
  const yFG = yard("yardForeGallant", MASTS.fore, 11.7);
  const yMC = yard("yardMainCourse", MASTS.main, 8.4);
  const yMT = yard("yardMainTop", MASTS.main, 11.2);
  const yMG = yard("yardMainGallant", MASTS.main, 13.1);
  const yZT = yard("yardMizzenTop", MASTS.mizzen, 9.6);
  const gaff = yard("gaffMizzen", MASTS.mizzen, 4.4);
  const flagMain = b.joint("flagMain", { parent: hull, at: [0, 14.9, MASTS.main], dir: [0, 1, 0], role: "hinge" });
  const flagFore = b.joint("flagFore", { parent: hull, at: [0, 12.6, MASTS.fore], dir: [0, 1, 0], role: "hinge" });
  const flagMiz = b.joint("flagMizzen", { parent: hull, at: [0, 11.2, MASTS.mizzen], dir: [0, 1, 0], role: "hinge" });

  // ------------------------------------------------------------ hull shell (ruled membranes between five hull lines)
  const hullMeshes: THREE.Mesh[] = [];
  for (const s of [1, -1])
    for (let k = 0; k < 4; k++)
      hullMeshes.push(
        ...b.membrane(hullLine(s, ULV[k]), hullLine(s, ULV[k + 1]), {
          color: hullPaint,
          thickness: 0.14,
          rows: 1,
          cols: 46,
          bone: hull,
          name: `hull${s > 0 ? "L" : "R"}${k}`,
        }),
      );
  const hullSkin = b.surface(hullMeshes);

  // transom: the stern wall closing the hull, with gallery windows
  const tr = ULV.map((u, k) => P((WG[0] / WMAX) * FXV[k] - 0.02, YK[0] + u * (YT[0] - YK[0]), 0)).slice(1);
  const transomOutline: OutlinePoint[] = [
    [0, YK[0]],
    ...tr.map((p) => [p[0], p[1]] as OutlinePoint),
    ...tr
      .slice()
      .reverse()
      .map((p) => [-p[0], p[1]] as OutlinePoint),
  ];
  b.extrude(transomOutline, {
    at: [0, 0, -6.2],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.3,
    color: hullPaint,
    bone: hull,
    name: "transom",
  });
  // gallery windows + frames
  const winGold = new Batch(b, GOLDM, hull, "windowFrames");
  for (const x of [-0.66, 0, 0.66]) {
    glow(b.part(new THREE.PlaneGeometry(0.46, 0.73), "#ffffff", { bone: hull, at: [x, 2.95, -6.365], dir: [0, 0, -1], axis: "z", texture: WINDOW, name: "window" }), 1.1);
    winGold.add(xf(new THREE.BoxGeometry(0.56, 0.06, 0.06), [x, 2.58, -6.37]));
    winGold.add(xf(new THREE.BoxGeometry(0.06, 0.82, 0.06), [x - 0.26, 2.98, -6.37]));
    winGold.add(xf(new THREE.BoxGeometry(0.06, 0.82, 0.06), [x + 0.26, 2.98, -6.37]));
    winGold.add(xf(new THREE.SphereGeometry(0.05, 6, 4), [x, 3.4, -6.37]));
  }
  winGold.done();

  // ------------------------------------------------------------ gold hull trim: rail caps, wales, gunwale posts
  const rails = new Batch(b, GOLDM, hull, "railPosts");
  const woodPosts = new Batch(b, WOODM, hull, "balusters");
  for (const s of [1, -1]) {
    const railP = catmull(hullLine(s, 1, -0.05, 0.46));
    b.sweep(railP, 0.055, { bone: hull, color: GOLDM, sides: 6, caps: "round", name: `railCap${s > 0 ? "L" : "R"}` });
    b.sweep(catmull(hullLine(s, 1, 0.04, -0.05)), 0.05, { bone: hull, color: GOLDM, sides: 6, caps: "none", name: `gunwaleCap${s > 0 ? "L" : "R"}` });
    b.sweep(catmull(hullLine(s, 0.55, 0.045, 0)), 0.045, { bone: hull, color: GOLDM, sides: 5, caps: "none", name: `wale${s > 0 ? "L" : "R"}` });
    b.sweep(catmull(hullLine(s, 0.8, 0.045, 0)), 0.04, { bone: hull, color: GOLDM, sides: 5, caps: "none", name: `waleUp${s > 0 ? "L" : "R"}` });
    const N = 44;
    for (let i = 1; i < N; i++) {
      const p = railP.at(i / N);
      woodPosts.add(rodG(P(p.x, p.y - 0.46, p.z), P(p.x, p.y - 0.03, p.z), 0.03, 5));
      if (i % 4 === 0) {
        rails.add(rodG(P(p.x, p.y - 0.46, p.z), P(p.x, p.y + 0.06, p.z), 0.05, 6));
        rails.add(xf(new THREE.SphereGeometry(0.085, 6, 5), [p.x, p.y + 0.1, p.z]));
      }
    }
  }
  // stern rail across the transom
  b.sweep(polyline([P(1.84, 4.42, -6.22), P(1.2, 4.44, -6.34), P(0, 4.46, -6.4), P(-1.2, 4.44, -6.34), P(-1.84, 4.42, -6.22)]), 0.05, {
    bone: hull,
    color: GOLDM,
    sides: 6,
    caps: "round",
    name: "sternRail",
  });
  for (let i = 0; i <= 12; i++) {
    const x = -1.8 + (3.6 * i) / 12;
    const z = -6.3 - 0.1 * (1 - (x / 1.84) ** 2);
    woodPosts.add(rodG(P(x, 3.96, z), P(x, 4.44, z), 0.028, 5));
  }
  rails.done();
  woodPosts.done();

  // ------------------------------------------------------------ decks
  function deckOutline(y: number, z0: number, z1: number, inset = 0.12): OutlinePoint[] {
    const n = Math.max(2, Math.round((z1 - z0) / 0.7));
    const left: OutlinePoint[] = [];
    for (let i = 0; i <= n; i++) {
      const z = z0 + ((z1 - z0) * i) / n;
      left.push([Math.max(0.2, halfWidthAt(z, y) - inset), z]);
    }
    return [...left, ...left.slice().reverse().map((q) => [-q[0], q[1]] as OutlinePoint)];
  }
  const deck = (y: number, z0: number, z1: number, name: string) =>
    b.extrude(deckOutline(y, z0, z1), {
      at: [0, y - 0.07, 0],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.14,
      color: deckPaint,
      bone: hull,
      name,
    });
  const Y_MAIN = 2.0;
  const Y_QUARTER = 2.95;
  const Y_FORE = 3.0;
  deck(Y_MAIN, -2.95, 4.55, "deckMain");
  deck(Y_QUARTER, -6.12, -2.85, "deckQuarter");
  deck(Y_FORE, 4.45, 6.85, "deckFore");

  // bulkheads, stairs
  const woodWall = (w: number) =>
    C(
      paint((p, n, s) => {
        if (Math.abs(n.z) < 0.6) return rgb("#9a5d46");
        const u = s[0];
        const v = s[1];
        const dx = Math.abs(u - 0.5) * w;
        const door = dx < 0.42 && v < 0.78 - 0.5 * (dx / 0.42) ** 2 * 0.3;
        if (door) {
          if (dx < 0.03) return GOLD;
          return mix(rgb("#4a3250"), rgb("#6a4466"), 0.4 * noise(p, 0.2, 2));
        }
        if (dx < 0.5 && v < 0.84) return GOLD;
        if (v > 0.9) return GOLD;
        const plank = fract(u * w / 0.22) < 0.07;
        return plank ? rgb("#a5604f") : mix(WOODC, DECKC, 0.2 + 0.2 * noise(p, 0.5, 8));
      }),
    );
  b.part(new THREE.BoxGeometry(4.3, 0.95, 0.16), woodWall(4.3), { bone: hull, at: [0, Y_MAIN + 0.475, -2.92], name: "bulkheadQuarter" });
  b.part(new THREE.BoxGeometry(3.4, 1.0, 0.16), woodWall(3.4), { bone: hull, at: [0, Y_MAIN + 0.5, 4.55], name: "bulkheadFore" });
  const steps = new Batch(b, DECKM, hull, "stairs");
  const stepTrim = new Batch(b, GOLDM, hull, "stairTrim");
  for (const s of [1, -1]) {
    for (let i = 0; i < 5; i++) {
      const h = 0.19 * (i + 1);
      steps.add(xf(new THREE.BoxGeometry(0.85, h, 0.34), [s * 1.55, Y_MAIN + h / 2, -2.84 + 0.17 + 0.34 * (4 - i) + 0.17]));
      stepTrim.add(xf(new THREE.BoxGeometry(0.87, 0.03, 0.04), [s * 1.55, Y_MAIN + h + 0.005, -2.84 + 0.34 * (4 - i) + 0.4]));
      const hf = 0.2 * (i + 1);
      steps.add(xf(new THREE.BoxGeometry(0.85, hf, 0.34), [s * 1.2, Y_MAIN + hf / 2, 4.47 - 0.17 - 0.34 * (4 - i) - 0.17]));
      stepTrim.add(xf(new THREE.BoxGeometry(0.87, 0.03, 0.04), [s * 1.2, Y_MAIN + hf + 0.005, 4.47 - 0.34 * (4 - i) - 0.4]));
    }
    // stair handrails
    rails.add(rodG(P(s * 1.97, 2.75, -2.55), P(s * 1.97, 3.55, -3.0), 0.03, 5));
  }
  steps.done();
  stepTrim.done();
  rails.done();

  // ------------------------------------------------------------ stern balcony and swan necks
  b.extrude(
    [
      [0.95, -6.12],
      [1.28, -6.5],
      [0.95, -6.95],
      [0, -7.1],
      [-0.95, -6.95],
      [-1.28, -6.5],
      [-0.95, -6.12],
    ],
    { at: [0, 2.42, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.12, bevel: 0.025, color: GOLDM, bone: hull, name: "balcony" },
  );
  b.sweep(
    catmull([P(0.95, 2.88, -6.2), P(1.28, 2.88, -6.5), P(0.95, 2.88, -6.95), P(0, 2.88, -7.1), P(-0.95, 2.88, -6.95), P(-1.28, 2.88, -6.5), P(-0.95, 2.88, -6.2)]),
    0.035,
    { bone: hull, color: GOLDM, sides: 5, name: "balconyRail" },
  );
  const balPosts = new Batch(b, GOLDM, hull, "balconyPosts");
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const ang = (-80 + 160 * t) * DEG;
    const x = 1.28 * Math.sin(ang) * 0.9;
    const z = -6.55 - 0.55 * Math.cos(ang) * 0.9 + 0.05;
    balPosts.add(rodG(P(x, 2.47, z), P(x, 2.88, z), 0.022, 5));
  }
  balPosts.done();

  // swan-neck stern horns with hanging lanterns
  const lanternGlow = new Batch(b, "#ffd98a", hull, "lanternGlass", false);
  const lanternGold = new Batch(b, GOLDM, hull, "lanternCaps");
  function lantern(at: P3, scale = 1) {
    lanternGlow.add(xf(new THREE.CylinderGeometry(0.11 * scale, 0.14 * scale, 0.34 * scale, 6), [at[0], at[1], at[2]]));
    lanternGold.add(xf(new THREE.CylinderGeometry(0.05 * scale, 0.17 * scale, 0.12 * scale, 6), [at[0], at[1] + 0.23 * scale, at[2]]));
    lanternGold.add(xf(new THREE.ConeGeometry(0.04 * scale, 0.1 * scale, 6), [at[0], at[1] + 0.34 * scale, at[2]]));
    lanternGold.add(xf(new THREE.CylinderGeometry(0.16 * scale, 0.1 * scale, 0.07 * scale, 6), [at[0], at[1] - 0.2 * scale, at[2]]));
    lanternGold.add(xf(new THREE.SphereGeometry(0.035 * scale, 5, 4), [at[0], at[1] - 0.27 * scale, at[2]]));
  }
  for (const s of [1, -1]) {
    const neck = catmull([
      P(s * 1.78, 4.0, -6.1),
      P(s * 1.95, 4.9, -6.5),
      P(s * 1.78, 5.9, -6.45),
      P(s * 1.3, 6.7, -6.0),
      P(s * 0.85, 6.85, -5.55),
      P(s * 0.6, 6.55, -5.35),
      P(s * 0.72, 6.2, -5.4),
    ]);
    b.sweep(neck, [0.17, 0.06], { bone: hull, color: GOLDM, sides: 7, caps: "round", name: `swanNeck${s > 0 ? "L" : "R"}` });
    for (let i = 1; i < 6; i++) {
      const p = neck.at(0.12 + 0.12 * i);
      b.part(new THREE.SphereGeometry(0.2 - i * 0.02, 6, 5), WOODM, { bone: hull, at: [p.x, p.y, p.z], scale: [0.7, 1, 1], name: "swanBead" });
    }
    // feather fin standing on the neck
    b.rod(P(s * 0.72, 6.2, -5.4), P(s * 0.72, 5.75, -5.4), 0.015, { bone: hull, color: ROPE, name: "lanternChain" });
    lantern(P(s * 0.72, 5.5, -5.4), 1.1);
  }

  // ------------------------------------------------------------ gun ports, jewels and filigree on the hull flanks
  const portFrame = new Batch(b, GOLDM, hull, "portFrames");
  const portDark = new Batch(b, "#2a2548", hull, "portDark", true);
  const muzzleGlow = new Batch(b, "#ffd98a", hull, "portGlow", false);
  const jewels = new Batch(b, "#7ffff0", hull, "hullJewels", false);
  const jewelSet = new Batch(b, GOLDM, hull, "jewelSettings");
  for (const s of [1, -1]) {
    for (const z of [-3.0, -1.7, -0.4, 0.9, 2.2, 3.5]) {
      const yk = lerpArr(YK, z);
      const yt = lerpArr(YT, z);
      const y = yk + 0.36 * (yt - yk);
      const hit = hullSkin.ray([s * 9, y, z], [-s, 0, 0]);
      if (!hit) continue;
      const n = hit.n.clone();
      const q = aim(n, [0, 1, 0]);
      const at = hit.at.clone();
      const place = (g: THREE.BufferGeometry, off: number, bag: Batch) => {
        g.applyQuaternion(q);
        g.translate(at.x + n.x * off, at.y + n.y * off, at.z + n.z * off);
        bag.add(g);
      };
      place(new THREE.CylinderGeometry(0.25, 0.25, 0.05, 10), 0.025, portFrame);
      place(new THREE.TorusGeometry(0.24, 0.035, 4, 10).rotateX(Math.PI / 2), 0.06, portFrame);
      place(new THREE.CylinderGeometry(0.19, 0.19, 0.06, 10), 0.04, portDark);
      place(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 10), 0.065, muzzleGlow);
      place(new THREE.BoxGeometry(0.3, 0.04, 0.025), 0.095, portFrame);
      place(new THREE.BoxGeometry(0.025, 0.04, 0.3), 0.095, portFrame);
    }
    // jewels along the crimson band between the filigree
    for (let z = -5.2; z <= 5.8; z += 0.55) {
      const yk = lerpArr(YK, z);
      const yt = lerpArr(YT, z);
      const y = yk + 0.675 * (yt - yk);
      const hit = hullSkin.ray([s * 9, y, z], [-s, 0, 0]);
      if (!hit) continue;
      const q = aim(hit.n, [0, 1, 0]);
      const g1 = new THREE.OctahedronGeometry(0.055).scale(1, 0.55, 1.35);
      g1.applyQuaternion(q);
      g1.translate(hit.at.x + hit.n.x * 0.025, hit.at.y + hit.n.y * 0.025, hit.at.z + hit.n.z * 0.025);
      jewels.add(g1);
      const g2 = new THREE.CylinderGeometry(0.075, 0.08, 0.025, 6);
      g2.applyQuaternion(q);
      g2.translate(hit.at.x + hit.n.x * 0.012, hit.at.y + hit.n.y * 0.012, hit.at.z + hit.n.z * 0.012);
      jewelSet.add(g2);
    }
    for (const z of [-4.2, -2.3, -0.3, 1.7, 3.5]) {
      const yk = lerpArr(YK, z);
      const yt = lerpArr(YT, z);
      const y = yk + 0.68 * (yt - yk);
      const hit = hullSkin.ray([s * 9, y, z], [-s, 0, 0]);
      if (hit) b.decal(hullSkin, FILIGREE, { at: hit, dir: [s, 0, 0], size: [2.0, 0.52], segments: [24, 5], name: "hullFiligree", mirror: s < 0 });
    }
    for (const z of [-3.6, -1.6, 0.4, 2.4, 4.1]) {
      const yk = lerpArr(YK, z);
      const yt = lerpArr(YT, z);
      const hit = hullSkin.ray([s * 9, yk + 0.2 * (yt - yk), z], [-s, 0, 0]);
      if (hit) b.decal(hullSkin, FILIGREE, { at: hit, size: [1.6, 0.38], segments: [20, 4], name: "hullFiligreeLow", mirror: s < 0 });
    }
  }
  portFrame.done();
  portDark.done();
  glow(muzzleGlow.done()!, 1.1);
  glow(jewels.done()!, 1.1);
  jewelSet.done();
  for (const s of [1, -1])
    glow(b.sweep(catmull(hullLine(s, 0.13, 0.035, 0)), 0.03, { bone: hull, color: "#7ffff0", sides: 4, caps: "none", name: "bellyGlow" }), 1.3);

  // stern roundel above the windows
  b.decal(hullSkin, EMBLEM, { at: [0, 3.62, -6.3], dir: [0, 0, -1], size: [0.62, 0.62], segments: 8 });

  // ------------------------------------------------------------ masts
  const hoops = new Batch(b, GOLDM, hull, "mastHoops");
  const finials = new Batch(b, GOLDM, hull, "finials");
  function mast(z: number, y0: number, y1: number, r0: number, name: string) {
    b.sweep([P(0, y0 - 0.1, z), P(0, y1, z)], [r0, r0 * 0.38], { bone: hull, color: WOODM, sides: 8, caps: "flat", name });
    for (const t of [0.04, 0.3, 0.55, 0.8]) {
      const y = y0 + (y1 - y0) * t;
      const r = r0 * (1 - 0.62 * t) + 0.045;
      hoops.add(rodG(P(0, y - 0.06, z), P(0, y + 0.06, z), r, 8));
    }
    finials.add(xf(new THREE.SphereGeometry(r0 * 0.5, 7, 5), [0, y1 + 0.02, z]));
    finials.add(xf(new THREE.ConeGeometry(r0 * 0.28, r0 * 3.2, 6), [0, y1 + r0 * 1.7, z]));
    // mast partner at the deck
    hoops.add(xf(new THREE.CylinderGeometry(r0 * 1.5, r0 * 1.8, 0.2, 8), [0, y0 + 0.1, z]));
  }
  mast(MASTS.main, Y_MAIN, 14.6, 0.27, "mastMain");
  mast(MASTS.fore, Y_MAIN, 12.4, 0.23, "mastFore");
  mast(MASTS.mizzen, Y_QUARTER, 11.0, 0.19, "mastMizzen");
  hoops.done();
  finials.done();

  // crow's nests
  const nestWood = new Batch(b, WOODM, hull, "nestPosts");
  const nestGold = new Batch(b, GOLDM, hull, "nestRims");
  function nest(z: number, y: number, r: number) {
    b.lathe(
      [
        [0, 0],
        [r * 0.8, 0],
        [r, 0.22],
        [r * 0.9, 0.22],
        [r * 0.72, 0.06],
        [0, 0.06],
      ],
      { at: [0, y, z], color: WOODM, bone: hull, segments: 10, name: "crowsNest" },
    );
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      nestWood.add(rodG(P(Math.cos(a) * r * 0.96, y + 0.2, z + Math.sin(a) * r * 0.96), P(Math.cos(a) * r, y + 0.62, z + Math.sin(a) * r), 0.026, 4));
    }
    const ring: P3[] = [];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      ring.push(P(Math.cos(a) * r, y + 0.64, z + Math.sin(a) * r));
    }
    b.sweep(catmull(ring, { closed: true }), 0.04, { bone: hull, color: GOLDM, sides: 5, name: "nestRail" });
    nestGold.add(xf(new THREE.CylinderGeometry(r * 1.02, r * 1.02, 0.05, 10), [0, y + 0.03, z]));
  }
  nest(MASTS.main, 8.7, 0.7);
  nest(MASTS.fore, 8.05, 0.6);
  nestWood.done();
  nestGold.done();
  // mizzen top
  b.part(new THREE.CylinderGeometry(0.46, 0.5, 0.1, 8), GOLDM, { bone: hull, at: [0, 7.6, MASTS.mizzen], name: "mizzenTop" });

  // ------------------------------------------------------------ yards and sails
  const tassels: Frame[] = [];
  const yardWood = new Map<Joint, Batch>();
  const yardGold = new Map<Joint, Batch>();
  const wood = (j: Joint) => yardWood.get(j) ?? (yardWood.set(j, new Batch(b, WOODM, j, `yardWood.${j.name}`)), yardWood.get(j)!);
  const gold = (j: Joint) => yardGold.get(j) ?? (yardGold.set(j, new Batch(b, GOLDM, j, `yardGold.${j.name}`)), yardGold.get(j)!);

  function yardSpar(j: Joint, z: number, y: number, hw: number) {
    wood(j).add(rodG(P(0, y, z), P(hw * 0.86, y, z), 0.095, 6, 0.065));
    wood(j).add(rodG(P(0, y, z), P(-hw * 0.86, y, z), 0.095, 6, 0.065));
    for (const s of [1, -1]) {
      gold(j).add(rodG(P(s * hw * 0.86, y, z), P(s * hw * 0.98, y, z), 0.07, 6, 0.045));
      gold(j).add(xf(new THREE.ConeGeometry(0.045, 0.2, 6), [s * (hw + 0.07), y, z], [0, 0, -s * 90]));
      gold(j).add(xf(new THREE.CylinderGeometry(0.1, 0.1, 0.07, 6), [s * hw * 0.5, y, z], [0, 0, 90]));
      gold(j).add(xf(new THREE.CylinderGeometry(0.1, 0.1, 0.07, 6), [s * hw * 0.22, y, z], [0, 0, 90]));
    }
    gold(j).add(xf(new THREE.SphereGeometry(0.16, 6, 5), [0, y, z]));
  }

  const ropes = new Batch(b, ROPE, hull, "ropes");
  const rope = (a: P3, c: P3, r = 0.022) => ropes.add(rodG(a, c, r, 4));

  function squareSail(
    j: Joint,
    zm: number,
    yTop: number,
    yFoot: number,
    hwTop: number,
    hwFoot: number,
    bulge: number,
    name: string,
    emblem = 0,
  ) {
    const z0 = zm + 0.48;
    const sag = 0.32;
    const nx = 7;
    const topE: P3[] = [];
    const midE: P3[] = [];
    const footE: P3[] = [];
    const yMid = yFoot + (yTop - yFoot) * 0.52;
    for (let i = 0; i < nx; i++) {
      const f = -1 + (2 * i) / (nx - 1); // -1..1 across
      const bl = 1 - f * f * 0.82;
      topE.push(P(f * hwTop, yTop - 0.02, z0 + 0.03 * bl));
      midE.push(P(f * (hwTop + hwFoot) * 0.5, yMid, z0 + bulge * bl));
      footE.push(P(f * hwFoot, yFoot + sag * (1 - f * f), z0 + bulge * 0.85 * bl));
    }
    const color = sailPaint(hwTop, hwFoot, yTop, yFoot, sag);
    const meshes = [
      ...b.membrane(catmull(topE), catmull(midE), { color, thickness: 0.05, rows: 2, cols: 16, bone: j, name: `${name}Up` }),
      ...b.membrane(catmull(midE), catmull(footE), { color, thickness: 0.05, rows: 2, cols: 16, bone: j, name: `${name}Low` }),
    ];
    if (emblem > 0) {
      b.decal(b.surface(meshes), EMBLEM, {
        at: [0, yMid + 0.15, z0 + bulge + 0.5],
        dir: [0, 0, 1],
        size: [emblem, emblem],
        segments: [18, 18],
        name: `${name}Emblem`,
      });
    }
    // tassels hang from the clews and the middle of the foot
    for (const f of [-1, 1]) tassels.push(frame(P(f * hwFoot, yFoot + 0.02, z0 + bulge * 0.02), [0, 1, 0]));
    // sheets: clew to hull, lifts: yard end to mast
    for (const f of [-1, 1]) {
      rope(P(f * hwFoot, yFoot + 0.03, z0 + 0.02), P(f * (hwFoot * 0.78), Math.max(3.2, sheerAt(zm + 0.6) + 0.1), zm + 0.7 + (zm > 0 ? 0.2 : -0.3)), 0.022);
      rope(P(f * hwTop, yTop, z0), P(f * 0.22, yTop + 0.5, zm + 0.1), 0.02);
    }
    return meshes;
  }

  yardSpar(yMC, MASTS.main + 0.38, 8.4, 3.55);
  yardSpar(yMT, MASTS.main + 0.38, 11.2, 2.75);
  yardSpar(yMG, MASTS.main + 0.38, 13.1, 1.85);
  yardSpar(yFC, MASTS.fore + 0.38, 7.5, 3.05);
  yardSpar(yFT, MASTS.fore + 0.38, 10.0, 2.3);
  yardSpar(yFG, MASTS.fore + 0.38, 11.7, 1.55);
  yardSpar(yZT, MASTS.mizzen + 0.38, 9.6, 2.1);

  squareSail(yMC, MASTS.main, 8.3, 4.15, 3.05, 3.45, 0.9, "sailMainCourse", 2.1);
  squareSail(yMT, MASTS.main, 11.1, 8.6, 2.05, 2.55, 0.62, "sailMainTop", 1.1);
  squareSail(yMG, MASTS.main, 13.0, 11.4, 1.25, 1.65, 0.45, "sailMainGallant");
  squareSail(yFC, MASTS.fore, 7.4, 4.1, 2.55, 2.95, 0.8, "sailForeCourse", 1.8);
  squareSail(yFT, MASTS.fore, 9.9, 7.7, 1.75, 2.15, 0.58, "sailForeTop", 0.9);
  squareSail(yFG, MASTS.fore, 11.6, 10.2, 1.1, 1.4, 0.4, "sailForeGallant");
  squareSail(yZT, MASTS.mizzen, 9.5, 7.2, 1.55, 1.95, 0.5, "sailMizzenTop", 0.9);

  // spanker on a gaff and boom
  {
    const mz = MASTS.mizzen - 0.25;
    wood(gaff).add(rodG(P(0, 8.9, mz), P(0, 7.3, mz - 2.9), 0.075, 6, 0.05));
    wood(gaff).add(rodG(P(0, 4.45, mz), P(0, 4.75, mz - 3.0), 0.085, 6, 0.055));
    gold(gaff).add(xf(new THREE.SphereGeometry(0.09, 6, 5), [0, 7.3, mz - 2.92]));
    gold(gaff).add(xf(new THREE.SphereGeometry(0.1, 6, 5), [0, 4.75, mz - 3.02]));
    gold(gaff).add(xf(new THREE.SphereGeometry(0.14, 6, 5), [0, 4.45, mz]));
    const sp: OutlinePoint[] = [
      [0, 4.55],
      [-1.0, 4.62],
      [-2.0, 4.7],
      [-2.78, 4.82],
      [-2.78, 7.3],
      [-1.5, 8.05],
      [0, 8.85],
    ];
    const spanker = b.extrude(sp, {
      at: [0, 0, mz - 0.05],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.06,
      bevel: 0.012,
      color: softCel(
        paint((_p, _n, s) => {
          const [zz, yy] = s;
          const dTop = 8.85 + (7.3 - 8.85) * (-zz / 2.78) - yy; // distance under the gaff line
          const dFoot = yy - (4.55 + 0.27 * (-zz / 2.78));
          const dLeech = 2.78 + zz;
          if (dTop < 0.12 || dFoot < 0.1) return GOLD;
          if (dLeech < 0.1) return GOLD;
          if (dTop < 0.28 || dLeech < 0.2) return CRIM;
          if (dFoot < 0.3) return zigzag(-zz / 0.5) > 0.5 ? CRIM : CREAM;
          return fract(yy / 0.8) < 0.02 ? LAV : mix(WHITE, LAV, 0.12 * noise(new THREE.Vector3(zz, yy, 0), 0.9, 4));
        }),
      ),
      bone: gaff,
      name: "sailSpanker",
    });
    for (const s of [1, -1])
      b.decal(b.surface(spanker), EMBLEM, { at: [s * 0.05, 6.4, mz - 1.5], dir: [s, 0, 0], size: [1.2, 1.2], segments: 12, name: "spankerEmblem" });
    tassels.push(frame(P(0, 4.6, mz - 3.0), [0, 1, 0]));
  }

  // jibs flying from the forestay
  const bowTip = P(0, 7.2, 11.2);
  const jibPaint = (poly: Array<[number, number]>) =>
    softCel(
      paint((_p, _n, s) => {
        let dmin = 9;
        for (let i = 0; i < poly.length; i++) {
          const a = poly[i];
          const c = poly[(i + 1) % poly.length];
          const ex = c[0] - a[0];
          const ey = c[1] - a[1];
          const t = clamp(((s[0] - a[0]) * ex + (s[1] - a[1]) * ey) / (ex * ex + ey * ey), 0, 1);
          dmin = Math.min(dmin, Math.hypot(s[0] - (a[0] + ex * t), s[1] - (a[1] + ey * t)));
        }
        if (dmin < 0.1) return GOLD;
        if (dmin < 0.2) return CRIM;
        return mix(WHITE, LAV, 0.12 * noise(new THREE.Vector3(s[0], s[1], 0), 1.0, 9));
      }),
    );
  const jib1: Array<[number, number]> = [
    [3.95, 12.1],
    [10.5, 7.7],
    [6.0, 5.0],
  ];
  const jib2: Array<[number, number]> = [
    [10.9, 7.55],
    [7.1, 9.9],
    [6.7, 6.2],
  ];
  const jibPart = (poly: Array<[number, number]>, name: string, x: number) =>
    b.extrude(poly, { at: [x, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.05, bevel: 0.01, color: jibPaint(poly), bone: hull, name });
  const jibA = jibPart(jib1, "sailJibOuter", -0.06);
  jibPart(jib2, "sailJibInner", 0.06);
  for (const s of [1, -1]) b.decal(b.surface(jibA), EMBLEM, { at: [s * 0.05 - 0.06, 7.7, 5.9], dir: [s, 0, 0], size: [0.95, 0.95], segments: 10, name: "jibEmblem" });
  tassels.push(frame(P(-0.06, 5.05, 6.0), [0, 1, 0]), frame(P(0.06, 6.25, 6.7), [0, 1, 0]));

  // bowsprit
  b.sweep([P(0, 3.45, 4.9), P(0, 7.1, 11.2)], [0.16, 0.06], { bone: hull, color: WOODM, sides: 8, caps: "flat", name: "bowsprit" });
  for (const t of [0.3, 0.6, 0.9]) {
    const p = V(P(0, 3.45, 4.9)).lerp(V(P(0, 7.1, 11.2)), t);
    hoops.add(rodG(P(0, p.y - 0.06, p.z - 0.03), P(0, p.y + 0.06, p.z + 0.03), 0.2 * (1 - t) + 0.07 * t + 0.04, 8));
  }
  hoops.done();
  b.part(new THREE.SphereGeometry(0.12, 6, 5), GOLDM, { bone: hull, at: bowTip, name: "bowspritCap" });
  // pennants
  const pennant = (j: Joint, zm: number, y: number, len: number, hgt: number, name: string) => {
    const A: P3[] = [];
    const B: P3[] = [];
    for (let i = 0; i <= 7; i++) {
      const t = i / 7;
      const x = 0.32 * Math.sin(t * 6.5 + 0.6) * t;
      A.push(P(x, y + 0.05 * Math.sin(t * 5), zm - 0.1 - len * t));
      B.push(P(x, y - hgt * (1 - t * 0.93) + 0.05 * Math.sin(t * 5), zm - 0.1 - len * t));
    }
    b.membrane(catmull(A), catmull(B), {
      color: softCel(
        paint((_p, _n, s) => {
          const [al, ac] = s;
          const ed = Math.min(ac, 1 - ac) * hgt * (1 - al * 0.93);
          if (ed < 0.045) return GOLD;
          if (al < 0.14 && Math.hypot(al * len - 0.3, (ac - 0.5) * hgt) < 0.16) return TEAL;
          if (al > 0.9) return GOLD;
          return fract(al * 5 + 0.5) < 0.12 ? mix(CRIM, GOLD, 0.2) : CRIM;
        }),
      ),
      thickness: 0.035,
      rows: 2,
      cols: 14,
      bone: j,
      name,
    });
  };
  pennant(flagMain, MASTS.main, 14.7, 3.5, 0.8, "flagMain");
  pennant(flagFore, MASTS.fore, 12.5, 2.8, 0.65, "flagFore");
  pennant(flagMiz, MASTS.mizzen, 11.1, 2.4, 0.55, "flagMizzen");

  for (const j of yardWood.values()) j.done();
  for (const j of yardGold.values()) j.done();

  // ------------------------------------------------------------ rigging: shrouds, ratlines, stays, backstays
  const deadeyes = new Batch(b, GOLDM, hull, "deadeyes");
  function shrouds(zm: number, yTop: number, nPairs: number, xr: number) {
    for (const s of [1, -1]) {
      const ends: Array<[P3, P3]> = [];
      for (let i = 0; i < nPairs; i++) {
        const zoff = -0.95 + (i * 0.95) / Math.max(1, nPairs - 1) * 1.0;
        const zh = zm + zoff - 0.1;
        const top = P(s * 0.3, yTop, zm - 0.18 + (i - (nPairs - 1) / 2) * 0.14);
        const hy = sheerAt(zh) + 0.4;
        const bot = P(s * (halfWidthAt(zh, hy) - 0.05) * xr, hy - 0.1, zh);
        rope(top, bot, 0.026);
        ends.push([top, bot]);
        deadeyes.add(xf(new THREE.SphereGeometry(0.075, 6, 4), bot));
        deadeyes.add(rodG(bot, P(bot[0], bot[1] - 0.6, bot[2]), 0.02, 4));
      }
      const rows = 9;
      for (let r = 1; r <= rows; r++) {
        const t = r / (rows + 1);
        for (let i = 0; i < nPairs - 1; i++) {
          const a = V(ends[i][1]).lerp(V(ends[i][0]), t);
          const c = V(ends[i + 1][1]).lerp(V(ends[i + 1][0]), t);
          rope(P(a.x, a.y, a.z), P(c.x, c.y, c.z), 0.016);
        }
      }
    }
  }
  shrouds(MASTS.main, 8.55, 4, 1.0);
  shrouds(MASTS.fore, 7.9, 4, 1.0);
  shrouds(MASTS.mizzen, 7.5, 3, 1.0);
  // stays
  rope(P(0, 12.3, MASTS.fore + 0.05), bowTip, 0.03);
  rope(P(0, 14.4, MASTS.main), P(0, 12.2, MASTS.fore + 0.1), 0.028);
  rope(P(0, 10.8, MASTS.mizzen), P(0, 8.9, MASTS.main - 0.1), 0.028);
  rope(P(0, 13.0, MASTS.main), P(0, 11.5, MASTS.fore), 0.02);
  // bobstay and bowsprit shrouds
  for (const s of [1, -1]) {
    rope(P(0, 6.9, 10.9), P(s * 0.5, 4.2, 6.6), 0.024);
    rope(P(0, 6.9, 10.9), P(s * 0.9, 4.0, 6.0), 0.02);
  }
  // backstays to the quarter
  for (const s of [1, -1]) {
    rope(P(s * 0.12, 14.0, MASTS.main - 0.15), P(s * 2.05, 3.7, -3.9), 0.022);
    rope(P(s * 0.12, 11.9, MASTS.fore - 0.1), P(s * 1.9, 3.1, 1.0), 0.02);
    rope(P(s * 0.1, 10.5, MASTS.mizzen - 0.1), P(s * 1.75, 4.4, -6.15), 0.02);
  }
  ropes.done();
  deadeyes.done();

  // tassels hang from sail corners, rail posts and the swan necks
  for (const s of [1, -1]) tassels.push(frame(P(s * 0.72, 5.34, -5.4), [0, 1, 0]));
  b.cards(tassels, TASSEL, { size: [0.14, 0.42], lean: 180, flow: [0, 0, 1], sink: 0, cross: true, name: "tassels" });

  // ------------------------------------------------------------ deck clutter, helm, crystal core
  const crates = new Batch(b, C("#c98a54", "#8a4f48"), hull, "crates");
  const crateTrim = new Batch(b, GOLDM, hull, "crateStraps");
  const barrelsM = new Batch(b, C("#a35a3a", "#6a3248"), hull, "barrels", false);
  const barrelBands = new Batch(b, IRONM, hull, "barrelBands");
  const coils = new Batch(b, C("#d9b57a", "#a47a62"), hull, "ropeCoils");
  function crate(x: number, z: number, s: number, rot: number, y = Y_MAIN) {
    crates.add(xf(new THREE.BoxGeometry(s, s, s), [x, y + s / 2, z], [0, rot, 0]));
    for (const k of [-1, 1]) {
      crateTrim.add(xf(new THREE.BoxGeometry(s + 0.03, 0.05, s + 0.03), [x, y + s / 2 + k * s * 0.33, z], [0, rot, 0]));
    }
    crateTrim.add(xf(new THREE.BoxGeometry(0.05, s + 0.03, s + 0.03), [x, y + s / 2, z], [0, rot, 0]));
  }
  function barrel(x: number, z: number, y = Y_MAIN) {
    barrelsM.add(xf(new THREE.CylinderGeometry(0.3, 0.3, 0.7, 10).scale(1, 1, 1), [x, y + 0.35, z]));
    barrelsM.add(xf(new THREE.CylinderGeometry(0.34, 0.3, 0.2, 10), [x, y + 0.45, z]));
    for (const k of [0.12, 0.35, 0.58]) barrelBands.add(xf(new THREE.CylinderGeometry(0.325, 0.325, 0.045, 10), [x, y + k, z]));
  }
  crate(1.5, -1.5, 0.62, 12);
  crate(1.55, -2.15, 0.46, -20);
  crate(1.5, -1.55, 0.4, 5, Y_MAIN + 0.62);
  crate(-1.55, -2.0, 0.6, -8);
  crate(-1.4, 4.05, 0.55, 30);
  crate(1.55, 3.55, 0.5, 8);
  barrel(-1.6, 2.6);
  barrel(-1.65, 3.2);
  barrel(-1.1, 2.9);
  barrel(1.6, 0.9);
  barrel(1.7, 1.55);
  for (const [x, z, y] of [
    [0.55, -0.9, Y_MAIN],
    [-0.5, 3.0, Y_MAIN],
    [1.2, -3.55, Y_QUARTER],
  ] as P3[]) {
    coils.add(xf(new THREE.TorusGeometry(0.26, 0.07, 5, 12), [x, y + 0.08, z], [90, 0, 0]));
    coils.add(xf(new THREE.TorusGeometry(0.26, 0.07, 5, 12), [x, y + 0.2, z], [90, 0, 0]));
  }
  crates.done();
  crateTrim.done();
  barrelsM.done();
  barrelBands.done();
  coils.done();

  // main hatch with a barred grating, and two gold-banded chests on the forecastle
  const hatchDark = new Batch(b, "#2a2548", hull, "hatchWell");
  const hatchGold = new Batch(b, GOLDM, hull, "hatchFrame");
  const hatchBars = new Batch(b, WOODM, hull, "hatchBars");
  hatchDark.add(xf(new THREE.BoxGeometry(1.3, 0.1, 1.0), [0, Y_MAIN + 0.05, -1.45]));
  for (const [w, d, x, z] of [
    [1.46, 0.08, 0, -1.97],
    [1.46, 0.08, 0, -0.93],
    [0.08, 1.0, -0.69, -1.45],
    [0.08, 1.0, 0.69, -1.45],
  ] as Array<[number, number, number, number]>)
    hatchGold.add(xf(new THREE.BoxGeometry(w, 0.16, d), [x, Y_MAIN + 0.08, z]));
  for (let i = 0; i < 6; i++) hatchBars.add(xf(new THREE.BoxGeometry(1.3, 0.06, 0.05), [0, Y_MAIN + 0.13, -1.85 + i * 0.2]));
  for (const [x, z, rot] of [
    [-1.25, 5.7, 18],
    [1.2, 6.15, -24],
  ] as P3[]) {
    crates.add(xf(new THREE.BoxGeometry(0.62, 0.3, 0.38), [x, Y_FORE + 0.15, z], [0, rot, 0]));
    crates.add(xf(new THREE.BoxGeometry(0.64, 0.12, 0.4), [x, Y_FORE + 0.36, z], [0, rot, 0]));
    for (const k of [-0.2, 0.2]) crateTrim.add(xf(new THREE.BoxGeometry(0.07, 0.46, 0.42), [x + k * Math.cos(rot * DEG), Y_FORE + 0.23, z - k * Math.sin(rot * DEG)], [0, rot, 0]));
    crateTrim.add(xf(new THREE.BoxGeometry(0.1, 0.1, 0.1), [x + 0.31 * Math.sin(rot * DEG) * 0.0, Y_FORE + 0.3, z + 0.2 * Math.cos(rot * DEG)], [0, rot, 0]));
  }
  crates.done();
  crateTrim.done();
  hatchDark.done();
  hatchGold.done();
  hatchBars.done();

  // capstan
  b.lathe(
    [
      [0, 0],
      [0.34, 0],
      [0.3, 0.12],
      [0.2, 0.2],
      [0.2, 0.62],
      [0.3, 0.7],
      [0.3, 0.78],
      [0, 0.78],
    ],
    { at: [0, Y_MAIN, 4.0], color: GOLDM, bone: hull, segments: 8, name: "capstan" },
  );
  const capBars = new Batch(b, WOODM, hull, "capstanBars");
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI + 0.4;
    capBars.add(rodG(P(Math.cos(a) * 0.62, Y_MAIN + 0.7, 4.0 + Math.sin(a) * 0.62), P(-Math.cos(a) * 0.62, Y_MAIN + 0.7, 4.0 - Math.sin(a) * 0.62), 0.04, 5));
  }
  capBars.done();

  // helm wheel with pedestal (wheel spins on its own hinge)
  b.part(new THREE.BoxGeometry(0.7, 0.5, 0.34), C("#7a3d46", "#4a2a46"), { bone: hull, at: [0, Y_QUARTER + 0.25, -4.45], name: "helmPedestal" });
  b.part(new THREE.BoxGeometry(0.76, 0.06, 0.4), GOLDM, { bone: hull, at: [0, Y_QUARTER + 0.52, -4.45], name: "helmCap" });
  const wGold = new Batch(b, GOLDM, wheel, "wheelRim");
  const wWood = new Batch(b, WOODM, wheel, "wheelSpokes");
  wGold.add(xf(new THREE.TorusGeometry(0.46, 0.04, 5, 16), [0, 3.78, -4.45]));
  wGold.add(xf(new THREE.CylinderGeometry(0.1, 0.1, 0.16, 8), [0, 3.78, -4.45], [90, 0, 0]));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    wWood.add(rodG(P(0, 3.78, -4.45), P(Math.cos(a) * 0.72, 3.78 + Math.sin(a) * 0.72, -4.45), 0.026, 5));
    wGold.add(xf(new THREE.SphereGeometry(0.05, 5, 4), [Math.cos(a) * 0.74, 3.78 + Math.sin(a) * 0.74, -4.45]));
  }

  // stern cabin under a raised poop deck: front wall with door, glowing portholes, skylight
  const Y_POOP = 3.85;
  const cabinW = 2 * (halfWidthAt(-5.0, 3.4) - 0.1);
  b.part(new THREE.BoxGeometry(cabinW, Y_POOP - Y_QUARTER, 0.16), woodWall(cabinW), { bone: hull, at: [0, (Y_POOP + Y_QUARTER) / 2, -4.98], name: "cabinFront" });
  deck(Y_POOP, -6.12, -4.9, "deckPoop");
  const cabinGlass = new Batch(b, "#ffe3a0", hull, "cabinGlass", false);
  const cabinGold = new Batch(b, GOLDM, hull, "cabinTrim");
  for (const x of [-1.15, 1.15]) {
    cabinGlass.add(xf(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 10), [x, 3.4, -4.88], [90, 0, 0]));
    cabinGold.add(xf(new THREE.TorusGeometry(0.2, 0.04, 4, 10), [x, 3.4, -4.9]));
  }
  cabinGlass.add(xf(new THREE.BoxGeometry(0.8, 0.14, 0.45), [0, Y_POOP + 0.17, -5.55]));
  cabinGold.add(xf(new THREE.BoxGeometry(0.96, 0.07, 0.62), [0, Y_POOP + 0.07, -5.55]));
  cabinGold.add(xf(new THREE.BoxGeometry(0.96, 0.05, 0.05), [0, Y_POOP + 0.2, -5.28]));
  cabinGold.add(xf(new THREE.BoxGeometry(0.96, 0.05, 0.05), [0, Y_POOP + 0.2, -5.82]));
  cabinGold.add(xf(new THREE.BoxGeometry(0.05, 0.05, 0.62), [0, Y_POOP + 0.2, -5.55]));
  glow(cabinGlass.done()!, 1.1);
  cabinGold.done();
  wGold.done();
  wWood.done();

  // aether core: caged crystal on a hatch amidships
  b.lathe(
    [
      [0, 0],
      [0.9, 0],
      [0.9, 0.16],
      [0.62, 0.3],
      [0.5, 0.5],
      [0.18, 0.6],
      [0, 0.6],
    ],
    { at: [0, Y_MAIN, 1.95], color: GOLDM, bone: hull, segments: 8, name: "corePedestal" },
  );
  const coreRods = new Batch(b, GOLDM, hull, "coreCage");
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const c = Math.cos(a);
    const s2 = Math.sin(a);
    const pts: P3[] = [P(c * 0.5, Y_MAIN + 0.55, 1.95 + s2 * 0.5), P(c * 0.74, Y_MAIN + 1.4, 1.95 + s2 * 0.74), P(c * 0.5, Y_MAIN + 2.3, 1.95 + s2 * 0.5), P(c * 0.1, Y_MAIN + 2.75, 1.95 + s2 * 0.1)];
    b.sweep(catmull(pts), 0.035, { bone: hull, color: GOLDM, sides: 4, caps: "round", name: "coreCageBar" });
  }
  coreRods.add(xf(new THREE.TorusGeometry(0.72, 0.035, 4, 12), [0, Y_MAIN + 1.4, 1.95], [90, 0, 0]));
  coreRods.done();
  const crystal = new Batch(b, "#7ffff0", hull, "aetherCrystal", false);
  crystal.add(xf(new THREE.OctahedronGeometry(0.55), [0, Y_MAIN + 1.45, 1.95], [0, 20, 0], [0.8, 1.55, 0.8]));
  glow(crystal.done()!, 1.4);
  const shards = new Batch(b, "#bffff6", hull, "aetherShards", false);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.5;
    shards.add(xf(new THREE.OctahedronGeometry(0.1), [Math.cos(a) * 1.05, Y_MAIN + 1.0 + (i % 3) * 0.55, 1.95 + Math.sin(a) * 1.05], [i * 20, i * 33, 0], [0.7, 1.4, 0.7]));
  }
  glow(shards.done()!, 1.4);

  // lantern posts at stairs and forecastle
  for (const [x, y, z] of [
    [1.95, Y_QUARTER, -2.95],
    [-1.95, Y_QUARTER, -2.95],
    [0.9, Y_FORE, 6.0],
    [-0.9, Y_FORE, 6.0],
    [1.65, Y_MAIN + 1, 4.3],
    [-1.65, Y_MAIN + 1, 4.3],
  ] as P3[]) {
    rails.add(rodG(P(x, y, z), P(x, y + 0.9, z), 0.04, 5));
    lantern(P(x, y + 1.15, z), 0.9);
  }
  rails.done();
  glow(lanternGlow.done()!, 1.3);
  lanternGold.done();

  // ------------------------------------------------------------ rudder
  b.extrude(
    [
      [0, 0],
      [1.0, -0.05],
      [1.15, -0.5],
      [0.95, -1.15],
      [0.45, -1.5],
      [0, -1.45],
    ],
    {
      at: [0, 2.3, -6.4],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.12,
      bevel: 0.025,
      smoothing: 1,
      bone: rudder,
      name: "rudderBlade",
      color: C(
        paint((_p, n, s) => {
          if (Math.abs(n.x) < 0.5) return GOLD;
          const [rx, ry] = s;
          if (ry > -0.16) return GOLD;
          if (Math.abs(fract(ry / 0.28) - 0.5) > 0.46) return GOLD;
          return rx > 0.88 + 0.1 * Math.min(0, ry + 0.5) ? GOLD : mix(NAVY, CRIM, smoothstep(-1.4, -0.1, ry));
        }),
      ),
    },
  );
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.6, 6), GOLDM, { bone: rudder, at: [0, 2.15, -6.5], name: "rudderStock" });

  // ------------------------------------------------------------ wing-fins and propeller pods
  function featherFan(
    bone: Joint,
    root: P3,
    s: number,
    count: number,
    len0: number,
    lenStep: number,
    a0: number,
    aStep: number,
    c1: Rgb,
    c2: Rgb,
    width: number,
    name: string,
    aftDir: P3 = [0, 0, -1],
    lean = 0.28,
  ) {
    for (let i = 0; i < count; i++) {
      const a = (a0 + aStep * i) * DEG;
      const L = len0 - lenStep * i;
      const dirX = V(aftDir).multiplyScalar(Math.cos(a)).add(new THREE.Vector3(0, Math.sin(a), 0)).add(new THREE.Vector3(s * lean, 0, 0)).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const dirY = up.sub(dirX.clone().multiplyScalar(up.dot(dirX))).normalize();
      const w = width * (0.85 + 0.15 * (1 - i / count));
      b.extrude(
        [
          [0, -0.1 * w],
          [L * 0.2, -0.32 * w],
          [L * 0.62, -0.4 * w],
          [L * 0.93, -0.18 * w],
          [L, 0.0, "sharp"],
          [L * 0.7, 0.34 * w],
          [L * 0.3, 0.38 * w],
          [0, 0.16 * w],
        ],
        {
          at: root,
          x: dirX,
          y: dirY,
          thickness: 0.06,
          bevel: 0.015,
          smoothing: 1,
          color: featherPaint(L, c1, c2),
          bone,
          name: `${name}${i}`,
        },
      );
    }
  }

  const struts = new Batch(b, GOLDM, hull, "podStruts");
  const podTrim = new Batch(b, GOLDM, hull, "podTrim");
  const podGlow = new Batch(b, "#7ffff0", hull, "podGlow", false);
  for (const s of [1, -1]) {
    const C0 = PROP_C[s];
    const prop = s > 0 ? propL : propR;
    // pod body (lathe along +Z)
    b.lathe(
      [
        [0, 0],
        [0.3, 0.05],
        [0.46, 0.4],
        [0.5, 0.9],
        [0.46, 1.5],
        [0.38, 1.95],
        [0.2, 2.2],
        [0, 2.28],
      ],
      {
        at: [C0[0], C0[1], C0[2] - 2.35],
        axis: [0, 0, 1],
        segments: 10,
        bone: hull,
        name: `pod${s > 0 ? "L" : "R"}`,
        color: C(
          paint((_p, _n, sc) => {
            const h = sc[0];
            if (Math.abs(h - 0.55) < 0.05 || Math.abs(h - 1.75) < 0.05) return GOLD;
            if (Math.abs(h - 1.1) < 0.1) return NAVY;
            return mix(TEAL, SKY, smoothstep(1.4, 2.3, h) * 0.6);
          }),
        ),
      },
    );
    podTrim.add(xf(new THREE.CylinderGeometry(0.4, 0.4, 0.07, 10), [C0[0], C0[1], C0[2] - 1.0], [90, 0, 0]));
    podGlow.add(xf(new THREE.TorusGeometry(0.4, 0.03, 4, 10), [C0[0], C0[1], C0[2] - 0.45]));
    // struts to the hull flank
    for (const zz of [C0[2] - 1.5, C0[2] - 0.6]) {
      const hy = 1.7;
      const hxx = halfWidthAt(zz, hy) - 0.08;
      struts.add(beamG(P(s * hxx, hy + 0.25, zz), P(C0[0], C0[1] + 0.12, zz), 0.16, 0.12, [0, 0, 1]));
      struts.add(beamG(P(s * hxx, hy - 0.35, zz), P(C0[0], C0[1] - 0.2, zz), 0.14, 0.1, [0, 0, 1]));
      struts.add(xf(new THREE.SphereGeometry(0.15, 6, 5), [s * hxx, hy - 0.05, zz]));
    }
    // wing-fin: a fan of long feathers on the flank, opening outward and aft
    for (let i = 0; i < 6; i++) {
      const k = i / 5;
      featherFan(hull, P(s * (2.42 + 0.03 * i), 2.0 + 0.04 * i, -0.45 - 0.05 * i), s, 1, 4.1 - 0.42 * i, 0, -6 + 15 * i, 0, mix(NAVY, TEAL, k), mix(TEAL, CREAM, k), 0.95 - 0.05 * i, `wing${s > 0 ? "L" : "R"}${i}_`, [0, 0, -1], 0.5);
    }
    b.part(new THREE.SphereGeometry(0.26, 7, 5), GOLDM, { bone: hull, at: [s * 2.48, 2.05, -0.5], scale: [0.8, 1, 1.2], name: "wingRoot" });
    b.part(new THREE.SphereGeometry(0.14, 6, 5), GOLDM, { bone: hull, at: [s * 2.62, 2.1, -0.52], name: "wingJewel" });

    // propeller on its own hinge: hub, spinner, four blades, ducting ring
    const hubG = new Batch(b, GOLDM, prop, `propHub${s > 0 ? "L" : "R"}`);
    hubG.add(xf(new THREE.SphereGeometry(0.2, 8, 6), [C0[0], C0[1], C0[2]]));
    hubG.add(xf(new THREE.ConeGeometry(0.17, 0.44, 8), [C0[0], C0[1], C0[2] + 0.3], [90, 0, 0]));
    const ringPts: P3[] = [];
    const RR = 1.3;
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      ringPts.push(P(C0[0] + Math.cos(a) * RR, C0[1] + Math.sin(a) * RR, C0[2] + 0.05));
    }
    b.sweep(catmull(ringPts, { closed: true }), 0.045, { bone: prop, color: GOLDM, sides: 5, name: `propRing${s > 0 ? "L" : "R"}` });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const rad = new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
      const tan = new THREE.Vector3(-Math.sin(a), Math.cos(a), 0);
      const pitch = tan.clone().multiplyScalar(Math.cos(0.32)).add(new THREE.Vector3(0, 0, Math.sin(0.32)));
      b.extrude(
        [
          [0.14, -0.1],
          [0.42, -0.22],
          [0.95, -0.24],
          [1.28, -0.1],
          [1.28, 0.1],
          [0.95, 0.2],
          [0.42, 0.18],
          [0.14, 0.09],
        ],
        {
          at: [C0[0], C0[1], C0[2] + 0.02],
          x: rad,
          y: pitch,
          thickness: 0.05,
          bevel: 0.012,
          smoothing: 1,
          bone: prop,
          name: `propBlade${s > 0 ? "L" : "R"}${i}`,
          color: C(
            paint((_p, _n, sc) => {
              const x = sc[0];
              if (x > 1.12) return GOLD;
              if (Math.abs(sc[1]) < 0.018) return GOLD;
              return mix(TEAL, SKY, smoothstep(0.3, 1.1, x));
            }),
          ),
        },
      );
    }
    hubG.done();
  }
  struts.done();
  podTrim.done();
  glow(podGlow.done()!, 1.3);

  // ------------------------------------------------------------ bow: stem scroll, figurehead (winged phoenix)
  const stemRoot = P(0, 4.3, 7.3);
  const neck = catmull([stemRoot, P(0, 4.55, 7.9), P(0, 4.55, 8.45), P(0, 4.15, 8.85)]);
  b.sweep(neck, [0.22, 0.14], { bone: hull, color: GOLDM, sides: 8, caps: "round", name: "phoenixNeck" });
  b.part(new THREE.SphereGeometry(1, 8, 6), GOLDM, { bone: hull, at: [0, 4.05, 8.95], scale: [0.2, 0.19, 0.27], name: "phoenixHead" });
  b.part(new THREE.ConeGeometry(0.1, 0.42, 6), CRIMM, { bone: hull, at: [0, 3.98, 9.3], dir: [0, -0.2, 1], name: "phoenixBeak" });
  for (const s of [1, -1]) {
    glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), "#7ffff0", { bone: hull, at: [s * 0.15, 4.12, 9.0], name: "phoenixEye" }), 1.4);
    b.spike(P(s * 0.1, 4.2, 8.85), P(s * 0.35, 4.75, 8.4), null, 0.045, { bone: hull, color: CRIMM, name: "phoenixCrest" });
  }
  b.spike(P(0, 4.25, 8.85), P(0, 4.95, 8.35), null, 0.05, { bone: hull, color: CRIMM, name: "phoenixCrest" });
  for (const s of [1, -1]) {
    featherFan(hull, P(s * 0.22, 4.15, 7.3), s, 4, 1.6, 0.18, 10, 16, CREAM, GOLD, 0.5, `phoenixWing${s > 0 ? "L" : "R"}`, [0, 0, -1], 0.9);
  }
  // stem scroll under the figurehead
  b.sweep(catmull([P(0, 4.0, 7.35), P(0, 3.4, 7.15), P(0, 2.9, 6.5)]), [0.1, 0.06], { bone: hull, color: GOLDM, sides: 6, name: "stemGold" });
  // anchor hung on the left bow flank
  const anchorAt = hullSkin.ray([9, 3.0, 5.5], [-1, 0, 0]);
  if (anchorAt) {
    const ax = anchorAt.at.x + 0.12;
    const ay = anchorAt.at.y + 0.1;
    const az = anchorAt.at.z;
    b.extrude(
      [
        [-0.46, 0.12],
        [-0.4, -0.05],
        [-0.22, -0.2],
        [0, -0.26],
        [0.22, -0.2],
        [0.4, -0.05],
        [0.46, 0.12],
        [0.36, 0.06],
        [0.2, -0.08],
        [0, -0.14],
        [-0.2, -0.08],
        [-0.36, 0.06],
      ],
      { at: [ax, ay, az], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.08, bevel: 0.015, color: IRONM, bone: hull, name: "anchorArms" },
    );
    const ironBits = new Batch(b, IRONM, hull, "anchorShank");
    ironBits.add(xf(new THREE.BoxGeometry(0.08, 0.72, 0.1), [ax, ay + 0.2, az]));
    ironBits.add(xf(new THREE.BoxGeometry(0.07, 0.07, 0.5), [ax, ay + 0.42, az]));
    ironBits.add(xf(new THREE.TorusGeometry(0.08, 0.025, 4, 8), [ax, ay + 0.6, az], [0, 90, 0]));
    ironBits.done();
  }

  // ------------------------------------------------------------ streamers, bunting, rivets, bell, volutes, fife rails
  const ribbon = (root: P3, dir: P3, len: number, w: number, name: string, colA: Rgb, colB: Rgb) => {
    const d = V(dir).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const side = up.clone().cross(d).normalize();
    const A: P3[] = [];
    const B: P3[] = [];
    for (let i = 0; i <= 9; i++) {
      const t = i / 9;
      const c = V(root)
        .addScaledVector(d, len * t)
        .addScaledVector(side, 0.4 * Math.sin(t * 7 + 0.5) * t)
        .addScaledVector(up, -0.7 * t * t + 0.12 * Math.sin(t * 9));
      const half = (w * (1 - 0.8 * t)) / 2;
      const ang = t * 2.4;
      const wv = up.clone().multiplyScalar(Math.cos(ang)).addScaledVector(side, Math.sin(ang));
      A.push(P(c.x + wv.x * half, c.y + wv.y * half, c.z + wv.z * half));
      B.push(P(c.x - wv.x * half, c.y - wv.y * half, c.z - wv.z * half));
    }
    b.membrane(catmull(A), catmull(B), {
      color: softCel(
        paint((_p, _n, s) => {
          if (Math.min(s[1], 1 - s[1]) < 0.12) return GOLD;
          return mix(colA, colB, s[0]);
        }),
      ),
      thickness: 0.03,
      rows: 2,
      cols: 16,
      bone: hull,
      name,
    });
  };
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    ribbon(P(s * 0.72, 6.25, -5.4), [s * 0.18, 0.06, -1], 4.8, 0.6, `ribbonSwan${side}`, TEAL, SKY);
    ribbon(P(s * 1.9, 13.1, MASTS.main + 0.38), [s * 0.25, 0, -1], 2.8, 0.34, `ribbonMain${side}`, CRIM, GOLD);
    ribbon(P(s * 1.5, 11.7, MASTS.fore + 0.38), [s * 0.25, 0, -1], 2.4, 0.3, `ribbonFore${side}`, CRIM, GOLD);
  }

  // signal bunting strung from the main masthead to the mizzen
  const FLAG = svg(
    `<svg viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg"><path d="M1 1 H23 V20 L12 31 L1 20 Z" fill="#ffffff"/><path d="M1 1 H23 V8 H1 Z" fill="#d6d6d6"/></svg>`,
    { size: 96 },
  );
  const buntLine = catmull([P(0, 13.5, MASTS.main - 0.2), P(0, 11.4, -2.2), P(0, 10.5, MASTS.mizzen - 0.2)]);
  b.sweep(buntLine, 0.02, { bone: hull, color: ROPE, sides: 4, caps: "none", name: "buntingLine" });
  const flagSets: Frame[][] = [[], [], []];
  for (let i = 1; i <= 17; i++) {
    const p = buntLine.at(i / 18);
    flagSets[i % 3].push(frame(P(p.x, p.y, p.z), [0, 1, 0]));
  }
  ["#dc3a52", "#34dccb", "#ffd24d"].forEach((col, i) =>
    b.cards(flagSets[i], FLAG, { size: [0.28, 0.38], lean: 180, flow: [1, 0, 0], color: col, sink: 0, name: `bunting${i}` }),
  );

  // fife rails round the mast feet, with belaying pins
  const fife = new Batch(b, GOLDM, hull, "fifeRails");
  const pins = new Batch(b, WOODM, hull, "belayingPins");
  for (const [mz, y0] of [
    [MASTS.main, Y_MAIN],
    [MASTS.fore, Y_MAIN],
    [MASTS.mizzen, Y_QUARTER],
  ] as Array<[number, number]>) {
    fife.add(xf(new THREE.TorusGeometry(0.55, 0.035, 4, 14), [0, y0 + 0.62, mz], [90, 0, 0]));
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const cx = Math.cos(a) * 0.55;
      const cz = mz + Math.sin(a) * 0.55;
      pins.add(rodG(P(cx, y0 + 0.5, cz), P(cx, y0 + 0.86, cz), 0.022, 4));
      if (i % 2 === 0) fife.add(rodG(P(cx, y0, cz), P(cx, y0 + 0.62, cz), 0.03, 4));
    }
  }
  fife.done();
  pins.done();

  // gold rivets along the upper strake
  const rivets = new Batch(b, GOLDM, hull, "hullRivets");
  for (const s of [1, -1]) {
    const line = catmull(hullLine(s, 0.915, 0.03, 0));
    for (let i = 1; i < 56; i++) {
      const p = line.at(i / 56);
      rivets.add(xf(new THREE.BoxGeometry(0.055, 0.055, 0.03), [p.x, p.y, p.z], [0, s * 90, 0]));
    }
  }
  rivets.done();

  // forecastle bell on a gold gallows
  const gallows = new Batch(b, GOLDM, hull, "bellGallows");
  for (const x of [-0.38, 0.38]) gallows.add(rodG(P(x, Y_FORE, 5.45), P(x, Y_FORE + 1.12, 5.45), 0.04, 5));
  gallows.add(rodG(P(-0.4, Y_FORE + 1.12, 5.45), P(0.4, Y_FORE + 1.12, 5.45), 0.035, 5));
  gallows.done();
  b.lathe(
    [
      [0, 0.3],
      [0.12, 0.28],
      [0.16, 0.12],
      [0.24, -0.02],
      [0.2, -0.02],
      [0.12, 0.1],
      [0.08, 0.2],
      [0, 0.2],
    ],
    { at: [0, Y_FORE + 0.8, 5.45], color: GOLDM, bone: hull, segments: 8, name: "shipBell" },
  );

  // gold volutes carved on the flanks near bow and stern
  for (const s of [1, -1])
    for (const z of [5.3, -5.2]) {
      const yk = lerpArr(YK, z);
      const yt = lerpArr(YT, z);
      const hit = hullSkin.ray([s * 9, yk + 0.34 * (yt - yk), z], [-s, 0, 0]);
      if (!hit) continue;
      const c = hit.at.clone().addScaledVector(hit.n, 0.04);
      const from = c.clone().add(new THREE.Vector3(0, 0.34, 0));
      b.sweep(spiral(c, from, hit.n, { turns: -s * 1.35, r1: 0.06 }), [0.04, 0.022], { bone: hull, color: GOLDM, sides: 5, caps: "round", name: "volute" });
    }

  // drifting aether sparkles around the wings, props and wake (glowing four-point star cards)
  const starSvg = (outer: string, inner: string) =>
    svg(
      `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 1 L19.5 12.5 L31 16 L19.5 19.5 L16 31 L12.5 19.5 L1 16 L12.5 12.5 Z" fill="${outer}"/><path d="M16 8 L18 14 L24 16 L18 18 L16 24 L14 18 L8 16 L14 14 Z" fill="${inner}"/></svg>`,
      { size: 96 },
    );
  const STARS = [starSvg("#ffd24d", "#fffbe0"), starSvg("#5ff2e0", "#eaffff")];
  const sparkR = rng(5);
  const sparkFrames: Frame[] = [];
  for (let i = 0; i < 26; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    sparkFrames.push(frame(P(side * (3.0 + sparkR() * 2.6), 0.9 + sparkR() * 4.6, -2.8 + sparkR() * 6.2), [0, 1, 0]));
  }
  for (let i = 0; i < 12; i++) sparkFrames.push(frame(P((sparkR() - 0.5) * 3.4, 3.0 + sparkR() * 3.2, -7.4 - sparkR() * 2.2), [0, 1, 0]));
  glow(b.cards(sparkFrames, STARS, { size: [0.22, 0.22], vary: 0.55, rng: sparkR, spin: 25, cross: true, sink: 0, lean: 0, flow: [0, 0, 1], name: "sparkles" }), 1.3);
  return b.root;
}
```
