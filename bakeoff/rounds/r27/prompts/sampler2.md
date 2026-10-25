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

## Samplers

At the end of this prompt are samplers picked for this request: recipe files from vehicles of this kind (a pickup and its variants, armour, mounted weapons, sci-fi hull detail, 2077 paints and neon). They show what vehicles like this carry and how the SDK builds hard shapes.

The pitch is the subject. Imagine the vehicle it describes: who drives it, what it is for, what it has been through. Build that vehicle rich, your own design and your own construction throughout: body, proportions, signature features and the intricate details on top. The samplers are there to spark ideas and show technique; every line of the module is new.

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

# Samplers

Reference only. Your module imports `three` and the SDK.

## Sampler: catalogs/truck.ts

```ts
/**
 * catalogs/truck.ts: wheeled-vehicle sampler. A finished pickup base plus named constructions of each of its parts.
 * Every variant of a slot has one signature and one mounting convention, so they
 * swap freely, in `assemble` and in your module. This file holds the base, the cab and bed slots and `assemble`;
 * catalogs/truckGear.ts holds wheel, suspension, bumper, headlight, grille, mirror, exhaust and rack.
 *
 * SIGNATURE   variant(b: Builder, m: Mount, c: Roles): void
 *   Mount = { bone, at, s, n, root, tag }
 *     bone  the joint the part rides: a wheel's spin joint, a suspension's travel joint, else the chassis
 *     at    the mount point [x, y, z] in model space, meters; a variant builds everything relative to it
 *     s     side sign: 1 = model left (+X), -1 = right; 1 on the centre line
 *     n     the mount's outward normal: [0,0,1] front face, [0,0,-1] rear, [±1,0,0] flanks, [0,1,0] top
 *     root  the chassis joint, for pieces that must stay still while `bone` moves (a spring's chassis end)
 *     tag   suffix for joints a variant creates ("" on the assembled truck, "_<variant>" on the board)
 *   Roles = colours by part role { body, trim, glass, light, tyre, rim, steel, dark, weapon }: colour strings or
 *   Paints (`Fill`). PLAIN is the grey set; materials2077.ts builds styled ones. Lamps glow in `light`.
 *   Needs `box(w, h, d)` and `cyl(r, h, sides)`, the two one-line geometry helpers below.
 *
 * BASE  truckBase(b, c, parent?) → Anchors. Pickup: 5.5 m long, 2.1 m wide, wheels r 0.42 at x ±0.86, z ±1.55.
 *   Skeleton: chassis (root) → suspFL/FR/RL/RR (travel, hinge X) → steerFL/FR (hinge Y, front only) → wheelFL.. (spin).
 *   Anchors (every one a Mount, with its normal): wheelFL FR RL RR (hub, bone = spin), suspFL.. (hub, bone = travel),
 *   cab (cab floor centre), bed (bed floor centre), roof (cab top centre), roofFront (light bar), roofRear (hatch),
 *   roofCorner and roofCornerFront (right-rear and right-front of the roof: antenna, dome), hood (top centre: ERA),
 *   hoodL R (hood sides: vents), fenderL R (front fender tops: smoke launchers), cabFront (windscreen centre, n
 *   front: vision blocks), grille, headlightL R, bumperFront, bumperRear, rear (tail face: thrusters), tailgate
 *   (rear face: panels, decals), cabRear (behind the cab above the bed, n back: headache rack, rifle rack, screen),
 *   mirrorL R, exhaustL R (tail corners under the bed), flankL R (rocker between the wheels: skirts, tracks),
 *   bedSideL R (outer bed walls: plates, rifle rack, decals).
 *
 * SLOTS  (mount → variants, one line each on the construction)
 *   cab (anchors.cab; cab z ±0.75, hood ahead to z+2.0, roof y+1.23, belt y+0.6, width 1.9; door hinge joints doorL/R)
 *     cabBoxy     slab cab, upright flat windscreen, flat hood with a centre ridge, square fenders
 *     cabWedge    raked windscreen and a nose that slopes to the bumper (frustumBox hood), flush fenders
 *     cabCabover  flat-nosed cab over the front axle, no hood: tall two-pane screen, step wells, lower apron
 *     cabCrew     four doors (two hinge joints a side), short hood, long glasshouse
 *     cabCage     open tube frame: roll cage rods, mesh floor, windscreen frame and a wire glass, stub fenders
 *     cabBubble   half-cylinder canopy roof, rounded nose, bulged round fenders
 *   bed (anchors.bed; bed z ±1.1, width 1.95, rails y+0.6; a tailgate hinge joint where there is one)
 *     bedOpen     open box with ribbed floor, rails, tie-down hooks and a hinged tailgate
 *     bedFlat     flatbed deck on crossbeams with stake pockets, a headboard and chain rings
 *     bedCanopy   hard shell on the box with a side window strip and a hinged rear hatch
 *     bedCage     low box under a tube roll cage with a spare wheel and jerry cans
 *     bedTank     cylindrical tank on two cradles with a filler dome, valve and hose reel
 *     bedDump     tipper box on a hinge at the rear with a hydraulic ram (joint tipper)
 *   wheel, suspension, bumper, headlight, grille, mirror, exhaust, rack: see catalogs/truckGear.ts.
 *
 * PICKS  assemble(picks) → THREE.Object3D (a complete truck, for the app's placeholder). Each pick is the variant name
 *   without its slot prefix ("offroad" for wheelOffroad), one per slot; a missing slot takes the default (DEFAULT_PICKS).
 *   picks.armour / weapons / hull / style reach into the other catalogs, each on its default anchor:
 *     armour:  { track?, skirt?, plate?, era?, hatch?, vision?, smoke? }   (catalogs/armour.ts)
 *     weapons: { roof?: { turret, barrel? | laser? | railgun?, pod? }, bed?: same, rifle?: { rifle, rack? } }
 *     hull:    { thruster?, vent?, antenna?, dome?, panel?, lightBar?, cable? } (catalogs/scifiHull.ts)
 *     style:   { palette?, body?, trim?, neon?, decal?, screen? }           (catalogs/materials2077.ts)
 *   A reply's pick list reads one pick a line: `wheel: offroad → double-wide, 8 lugs, mud flaps`; the text after the
 *   arrow is the deviation the module commits to.
 */
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";
import type { Fill } from "agentic-3js-builder";
import type { Joint } from "agentic-3js-builder";
import { wheels, suspensions, bumpers, headlights, grilles, mirrors, exhausts, racks } from "./truckGear";
import * as armour from "./armour";
import * as weapons from "./mountedWeapons";
import * as hull from "./scifiHull";
import * as style2077 from "./materials2077";

export type V3 = [number, number, number];
export type Mount = { bone: Joint; at: V3; s: 1 | -1; n: V3; root: Joint; tag: string };
export type Roles = {
  body: Fill;
  trim: Fill;
  glass: Fill;
  light: string;
  tyre: Fill;
  rim: Fill;
  steel: Fill;
  dark: Fill;
  weapon: Fill;
};
export type Variant = (b: Builder, m: Mount, c: Roles) => void;
export const PLAIN: Roles = {
  body: "#9aa0a6",
  trim: "#6b7177",
  glass: "#b9d3dc",
  light: "#fff2b0",
  tyre: "#2b2d31",
  rim: "#8d9196",
  steel: "#767b81",
  dark: "#3a3d42",
  weapon: "#5a6066",
};
export const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
export const cyl = (r: number, h: number, sides = 8) => new THREE.CylinderGeometry(r, r, h, sides);

// ---------------------------------------------------------------- base

export type Anchors = Record<
  | "cab"
  | "bed"
  | "roof"
  | "roofFront"
  | "roofRear"
  | "roofCorner"
  | "roofCornerFront"
  | "hoodL"
  | "hoodR"
  | "fenderL"
  | "fenderR"
  | "cabFront"
  | "hood"
  | "grille"
  | "headlightL"
  | "headlightR"
  | "bumperFront"
  | "bumperRear"
  | "rear"
  | "tailgate"
  | "cabRear"
  | "mirrorL"
  | "mirrorR"
  | "exhaustL"
  | "exhaustR"
  | "flankL"
  | "flankR"
  | "bedSideL"
  | "bedSideR"
  | "wheelFL"
  | "wheelFR"
  | "wheelRL"
  | "wheelRR"
  | "suspFL"
  | "suspFR"
  | "suspRL"
  | "suspRR",
  Mount
> & { chassis: Joint };

/** The pickup's frame and running gear skeleton; every slot hangs on the anchors it returns. */
export function truckBase(b: Builder, c: Roles, parent?: Joint): Anchors {
  const chassis = b.joint("chassis", { at: [0, 0.6, 0], role: "spine", ...(parent ? { parent } : {}) });
  const mk = (at: V3, s: 1 | -1, n: V3, bone = chassis): Mount => ({ bone, at, s, n, root: chassis, tag: "" });
  for (const s of [1, -1] as const) {
    b.part(box(0.1, 0.16, 4.9), c.dark, { bone: chassis, at: [s * 0.5, 0.58, 0] }); // frame rail
    b.rod([s * 0.95, 0.5, -0.95], [s * 0.95, 0.5, 1.15], 0.04, c.steel, { bone: chassis, sides: 6 }); // step bar
    for (const z of [-0.7, 0.9]) b.rod([s * 0.95, 0.5, z], [s * 0.55, 0.52, z], 0.025, c.steel, { bone: chassis });
    b.part(box(0.05, 0.06, 2.0), c.dark, { bone: chassis, at: [s * 0.5, 0.68, 0.5] }); // cab mount strip
  }
  for (const z of [-2.3, -1.0, 0.3, 1.3, 2.25])
    b.part(box(1.1, 0.1, 0.08), c.dark, { bone: chassis, at: [0, 0.58, z] });
  b.rod([0, 0.5, 0.9], [0, 0.5, -1.5], 0.035, c.steel, { bone: chassis, sides: 8 }); // driveshaft
  b.part(cyl(0.08, 0.3, 8), c.steel, { bone: chassis, at: [0, 0.52, 0.95], rotation: [90, 0, 0] }); // transfer case
  b.part(cyl(0.16, 0.7, 10), c.steel, { bone: chassis, at: [0.3, 0.46, -1.0], rotation: [90, 0, 0], flat: true }); // tank
  b.part(box(0.9, 0.04, 1.4), c.dark, { bone: chassis, at: [0, 0.7, 0.5] }); // cab floor pan
  const wheels = {} as Record<"FL" | "FR" | "RL" | "RR", Mount>;
  const susp = {} as Record<"FL" | "FR" | "RL" | "RR", Mount>;
  for (const [k, s, z] of [
    ["FL", 1, 1.55],
    ["FR", -1, 1.55],
    ["RL", 1, -1.55],
    ["RR", -1, -1.55],
  ] as const) {
    const front = z > 0;
    const travel = b.joint(`susp${k}`, {
      parent: chassis,
      at: [s * 0.5, 0.58, z + (front ? -0.55 : 0.55)],
      dir: [0, 1, 0],
      role: "hinge",
    });
    const hub: V3 = [s * 0.86, 0.42, z];
    const steer = front
      ? b.joint(`steer${k}`, { parent: travel, at: hub, dir: [0, 0, 1], up: [1, 0, 0], role: "hinge" })
      : travel;
    const spin = b.joint(`wheel${k}`, { parent: steer, at: hub, dir: [0, 1, 0], role: "hinge" });
    wheels[k] = mk(hub, s, [s, 0, 0], spin);
    susp[k] = mk(hub, s, [0, -1, 0], travel);
  }
  return {
    chassis,
    cab: mk([0, 0.72, 0.5], 1, [0, 1, 0]),
    bed: mk([0, 0.8, -1.45], 1, [0, 1, 0]),
    roof: mk([0, 1.95, 0.5], 1, [0, 1, 0]),
    roofFront: mk([0, 1.95, 1.05], 1, [0, 1, 0]),
    roofRear: mk([0.45, 1.95, 0.05], 1, [0, 1, 0]),
    roofCorner: mk([-0.8, 1.95, 0.1], -1, [0, 1, 0]),
    roofCornerFront: mk([-0.8, 1.95, 0.95], -1, [0, 1, 0]),
    hoodL: mk([0.55, 1.36, 1.9], 1, [0, 1, 0]),
    hoodR: mk([-0.55, 1.36, 1.9], -1, [0, 1, 0]),
    fenderL: mk([0.9, 1.4, 1.55], 1, [0, 1, 0]),
    fenderR: mk([-0.9, 1.4, 1.55], -1, [0, 1, 0]),
    cabFront: mk([0, 1.62, 1.27], 1, [0, 0, 1]),
    hood: mk([0, 1.36, 1.9], 1, [0, 1, 0]),
    grille: mk([0, 1.0, 2.5], 1, [0, 0, 1]),
    headlightL: mk([0.65, 1.05, 2.5], 1, [0, 0, 1]),
    headlightR: mk([-0.65, 1.05, 2.5], -1, [0, 0, 1]),
    bumperFront: mk([0, 0.55, 2.62], 1, [0, 0, 1]),
    bumperRear: mk([0, 0.55, -2.65], 1, [0, 0, -1]),
    rear: mk([0, 0.95, -2.57], 1, [0, 0, -1]),
    tailgate: mk([0, 1.1, -2.55], 1, [0, 0, -1]),
    cabRear: mk([0, 1.6, -0.3], 1, [0, 0, -1]),
    mirrorL: mk([0.96, 1.45, 1.15], 1, [1, 0, 0]),
    mirrorR: mk([-0.96, 1.45, 1.15], -1, [-1, 0, 0]),
    exhaustL: mk([0.7, 0.45, -2.5], 1, [0, 0, -1]),
    exhaustR: mk([-0.7, 0.45, -2.5], -1, [0, 0, -1]),
    flankL: mk([0.97, 0.6, 0], 1, [1, 0, 0]),
    flankR: mk([-0.97, 0.6, 0], -1, [-1, 0, 0]),
    bedSideL: mk([0.98, 1.1, -1.45], 1, [1, 0, 0]),
    bedSideR: mk([-0.98, 1.1, -1.45], -1, [-1, 0, 0]),
    wheelFL: wheels.FL,
    wheelFR: wheels.FR,
    wheelRL: wheels.RL,
    wheelRR: wheels.RR,
    suspFL: susp.FL,
    suspFR: susp.FR,
    suspRL: susp.RL,
    suspRR: susp.RR,
  };
}

// ---------------------------------------------------------------- cab

/** A hinged door on side `s`: joint door{L|R}{tag} at the front edge, panel, window, handle, two hinge pins. */
export function door(
  b: Builder,
  m: Mount,
  c: Roles,
  s: 1 | -1,
  zFront: number,
  zBack: number,
  name = `door${s > 0 ? "L" : "R"}${m.tag}`,
) {
  const [, y] = m.at;
  const len = zFront - zBack;
  const zc = (zFront + zBack) / 2;
  const j = b.joint(name, {
    parent: m.bone,
    at: [s * 0.95, y + 0.6, zFront],
    dir: [0, 0, 1],
    up: [1, 0, 0],
    role: "hinge",
  });
  b.part(box(0.06, 0.56, len - 0.04), c.body, { bone: j, at: [s * 0.95, y + 0.33, zc] });
  b.part(box(0.04, 0.5, len - 0.12), c.glass, { bone: j, at: [s * 0.95, y + 0.88, zc] });
  for (const dz of [-1, 1])
    b.part(box(0.06, 0.58, 0.05), c.body, { bone: j, at: [s * 0.95, y + 0.9, zc + dz * (len / 2 - 0.04)] });
  b.part(box(0.06, 0.05, len - 0.04), c.body, { bone: j, at: [s * 0.95, y + 1.16, zc] });
  b.part(box(0.03, 0.04, 0.14), c.steel, { bone: j, at: [s * 0.99, y + 0.52, zBack + 0.2] }); // handle
  for (const dy of [0.25, 0.95])
    b.part(cyl(0.025, 0.1, 6), c.steel, { bone: j, at: [s * 0.95, y + dy, zFront + 0.02] });
  return j;
}

export function cabBoxy(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(1.9, 0.6, 1.5), c.body, { bone: B, at: [x, y + 0.3, z] }); // lower cab
  b.part(box(1.9, 0.1, 1.5), c.body, { bone: B, at: [x, y + 1.2, z] }); // roof
  b.part(box(1.78, 0.56, 0.06), c.glass, { bone: B, at: [x, y + 0.88, z + 0.72] }); // windscreen
  b.part(box(1.78, 0.56, 0.05), c.glass, { bone: B, at: [x, y + 0.88, z - 0.72] }); // rear glass
  for (const s of [1, -1] as const) {
    b.part(box(0.08, 0.6, 0.08), c.body, { bone: B, at: [x + s * 0.91, y + 0.9, z + 0.71] }); // A pillar
    b.part(box(0.08, 0.6, 0.08), c.body, { bone: B, at: [x + s * 0.91, y + 0.9, z - 0.71] }); // C pillar
    b.part(box(0.06, 0.6, 0.25), c.body, { bone: B, at: [x + s * 0.92, y + 0.9, z - 0.62] }); // rear quarter
    b.part(box(0.3, 0.32, 1.2), c.body, { bone: B, at: [x + s * 0.95, y + 0.3, z + 1.05] }); // square fender
    b.part(box(0.3, 0.06, 1.3), c.trim, { bone: B, at: [x + s * 0.95, y + 0.49, z + 1.05] }); // fender lip
    door(b, m, c, s, z + 0.62, z - 0.5);
  }
  b.part(box(1.6, 0.5, 1.3), c.body, { bone: B, at: [x, y + 0.38, z + 1.4] }); // hood block
  b.part(box(1.64, 0.08, 1.3), c.body, { bone: B, at: [x, y + 0.6, z + 1.4] }); // hood lid
  b.part(box(0.2, 0.05, 1.2), c.trim, { bone: B, at: [x, y + 0.66, z + 1.4] }); // centre ridge
  b.part(box(1.86, 0.25, 0.2), c.body, { bone: B, at: [x, y + 0.18, z + 1.95] }); // nose apron
}

export function cabWedge(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(1.9, 0.6, 1.5), c.body, { bone: B, at: [x, y + 0.3, z] });
  b.part(box(1.7, 0.1, 1.1), c.body, { bone: B, at: [x, y + 1.2, z - 0.2] }); // roof, set back
  b.part(box(1.72, 0.76, 0.04), c.glass, { bone: B, at: [x, y + 0.92, z + 0.52], rotation: [-37, 0, 0] }); // raked screen
  b.part(box(1.76, 0.03, 0.03), c.body, { bone: B, at: [x, y + 0.62, z + 0.76] });
  for (const s of [1, -1] as const) {
    b.rod([x + s * 0.9, y + 0.6, z + 0.75], [x + s * 0.86, y + 1.22, z + 0.3], 0.04, c.body, {
      bone: B,
      section: "box",
    });
    b.part(box(0.08, 0.6, 0.08), c.body, { bone: B, at: [x + s * 0.91, y + 0.9, z - 0.71] });
    b.part(box(0.06, 0.6, 0.25), c.body, { bone: B, at: [x + s * 0.92, y + 0.9, z - 0.62] });
    b.part(box(0.1, 0.5, 1.2), c.trim, { bone: B, at: [x + s * 0.97, y + 0.3, z + 1.1] }); // flush fender band
    door(b, m, c, s, z + 0.62, z - 0.5);
  }
  b.frustumBox([x, y + 0.3, z + 0.75], [x, y + 0.2, z + 2.0], [1.9, 0.6], [1.8, 0.36], { bone: B, color: c.body }); // nose
  b.part(box(1.5, 0.03, 1.2), c.trim, { bone: B, at: [x, y + 0.55, z + 1.3], rotation: [10, 0, 0] }); // hood seam
}

export function cabCabover(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(1.9, 0.6, 2.7), c.body, { bone: B, at: [x, y + 0.3, z + 0.6] }); // long lower cab over the axle
  b.part(box(1.9, 0.1, 2.7), c.body, { bone: B, at: [x, y + 1.2, z + 0.6] });
  b.part(box(1.72, 0.56, 0.06), c.glass, { bone: B, at: [x, y + 0.9, z + 1.96] }); // tall screen, upper
  b.part(box(1.72, 0.2, 0.06), c.glass, { bone: B, at: [x, y + 0.5, z + 1.96] }); // lower pane
  b.part(box(1.9, 0.08, 0.1), c.body, { bone: B, at: [x, y + 0.65, z + 1.96] }); // mullion
  b.part(box(1.9, 0.4, 0.08), c.trim, { bone: B, at: [x, y + 0.2, z + 1.98] }); // lower apron
  b.part(box(1.78, 0.56, 0.05), c.glass, { bone: B, at: [x, y + 0.88, z - 0.72] });
  for (const s of [1, -1] as const) {
    b.part(box(0.08, 0.6, 0.08), c.body, { bone: B, at: [x + s * 0.91, y + 0.9, z + 1.94] });
    b.part(box(0.08, 0.6, 0.08), c.body, { bone: B, at: [x + s * 0.91, y + 0.9, z - 0.71] });
    b.part(box(0.06, 0.6, 1.5), c.body, { bone: B, at: [x + s * 0.92, y + 0.9, z + 0.6 + 0.6] }); // side panel ahead
    b.part(box(0.06, 0.6, 0.25), c.body, { bone: B, at: [x + s * 0.92, y + 0.9, z - 0.62] });
    for (const dy of [0.06, 0.26])
      b.part(box(0.3, 0.04, 0.4), c.steel, { bone: B, at: [x + s * 0.85, y - dy, z - 0.3] }); // step well
    door(b, m, c, s, z + 0.4, z - 0.5);
  }
}

export function cabCrew(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(1.9, 0.6, 2.1), c.body, { bone: B, at: [x, y + 0.3, z - 0.1] }); // cab reaches back over the bed front
  b.part(box(1.9, 0.1, 2.1), c.body, { bone: B, at: [x, y + 1.2, z - 0.1] });
  b.part(box(1.78, 0.56, 0.06), c.glass, { bone: B, at: [x, y + 0.88, z + 0.92] });
  b.part(box(1.78, 0.56, 0.05), c.glass, { bone: B, at: [x, y + 0.88, z - 1.12] });
  for (const s of [1, -1] as const) {
    b.part(box(0.08, 0.6, 0.08), c.body, { bone: B, at: [x + s * 0.91, y + 0.9, z + 0.91] });
    b.part(box(0.08, 0.6, 0.08), c.body, { bone: B, at: [x + s * 0.91, y + 0.9, z - 1.11] });
    b.part(box(0.08, 0.6, 0.08), c.body, { bone: B, at: [x + s * 0.91, y + 0.9, z - 0.1] }); // B pillar
    b.part(box(0.3, 0.32, 1.0), c.body, { bone: B, at: [x + s * 0.95, y + 0.3, z + 1.1] });
    door(b, m, c, s, z + 0.85, z - 0.06, `doorF${s > 0 ? "L" : "R"}${m.tag}`);
    door(b, m, c, s, z - 0.14, z - 1.05, `doorB${s > 0 ? "L" : "R"}${m.tag}`);
  }
  b.part(box(1.6, 0.5, 1.0), c.body, { bone: B, at: [x, y + 0.38, z + 1.5] }); // short hood
  b.part(box(1.64, 0.08, 1.0), c.body, { bone: B, at: [x, y + 0.6, z + 1.5] });
  b.part(box(1.86, 0.25, 0.2), c.body, { bone: B, at: [x, y + 0.18, z + 1.95] });
}

export function cabCage(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  const r = 0.04;
  const tube = (a: V3, d: V3) => b.rod(a, d, r, c.steel, { bone: B, sides: 6 });
  b.part(box(1.8, 0.05, 1.4), c.dark, { bone: B, at: [x, y + 0.03, z] }); // mesh floor plate
  for (let i = -0.8; i <= 0.8; i += 0.2) b.part(box(0.02, 0.02, 1.4), c.steel, { bone: B, at: [x + i, y + 0.07, z] });
  for (const s of [1, -1] as const) {
    const px = x + s * 0.85;
    tube([px, y, z + 0.7], [px, y + 1.2, z + 0.4]); // A post
    tube([px, y, z - 0.7], [px, y + 1.22, z - 0.7]); // rear post
    tube([px, y + 1.2, z + 0.4], [px, y + 1.22, z - 0.7]); // roof rail
    tube([px, y + 0.5, z + 0.7], [px, y + 0.5, z - 0.7]); // side bar
    tube([px, y, z - 0.7], [px, y + 0.5, z + 0.1]); // diagonal
    b.part(box(0.25, 0.04, 0.9), c.trim, { bone: B, at: [x + s * 0.95, y + 0.45, z + 1.1] }); // stub fender
    b.rod([px, y + 0.3, z + 0.7], [px, y + 0.1, z + 2.0], 0.035, c.steel, { bone: B, sides: 6 }); // nose bar
  }
  tube([x - 0.85, y + 1.2, z + 0.4], [x + 0.85, y + 1.2, z + 0.4]);
  tube([x - 0.85, y + 1.22, z - 0.7], [x + 0.85, y + 1.22, z - 0.7]);
  tube([x - 0.85, y + 0.5, z + 0.7], [x + 0.85, y + 0.5, z + 0.7]); // dash bar
  b.part(box(1.6, 0.5, 0.03), c.glass, { bone: B, at: [x, y + 0.85, z + 0.55], rotation: [-15, 0, 0] }); // wire glass
  b.part(box(1.0, 0.3, 0.5), c.dark, { bone: B, at: [x, y + 0.18, z + 1.5] }); // engine block, exposed
  for (const dx of [-0.3, -0.1, 0.1, 0.3])
    b.part(cyl(0.05, 0.3, 6), c.steel, { bone: B, at: [x + dx, y + 0.45, z + 1.5] });
  b.part(box(1.5, 0.06, 1.0), c.body, { bone: B, at: [x, y + 0.6, z + 1.5] }); // hood skin
}

export function cabBubble(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(1.9, 0.6, 1.5), c.body, { bone: B, at: [x, y + 0.3, z] });
  b.part(new THREE.CylinderGeometry(0.75, 0.75, 1.9, 10, 1, false, 0, Math.PI), c.glass, {
    bone: B,
    at: [x, y + 0.6, z],
    rotation: [0, 0, 90],
    flat: true,
  }); // half-cylinder canopy, axis along X
  b.part(box(1.9, 0.05, 1.5), c.trim, { bone: B, at: [x, y + 0.6, z] }); // sill ring
  for (const a of [30, 90, 150])
    b.part(box(1.92, 0.04, 0.04), c.body, {
      bone: B,
      at: [x, y + 0.6 + 0.76 * Math.sin((a * Math.PI) / 180), z + 0.76 * Math.cos((a * Math.PI) / 180)],
      rotation: [-a + 90, 0, 0],
    }); // canopy ribs
  for (const s of [1, -1] as const) {
    b.part(new THREE.SphereGeometry(0.5, 10, 6), c.body, {
      bone: B,
      at: [x + s * 0.85, y + 0.1, z + 1.05],
      scale: [0.6, 0.8, 1.3],
      flat: true,
    }); // bulged fender
    door(b, m, c, s, z + 0.62, z - 0.5);
  }
  b.part(new THREE.SphereGeometry(0.9, 12, 8), c.body, {
    bone: B,
    at: [x, y + 0.1, z + 1.3],
    scale: [0.95, 0.5, 0.8],
    flat: true,
  }); // rounded nose
  b.part(box(1.4, 0.04, 0.9), c.trim, { bone: B, at: [x, y + 0.54, z + 1.35] });
}

export const cabs = {
  boxy: cabBoxy,
  wedge: cabWedge,
  cabover: cabCabover,
  crew: cabCrew,
  cage: cabCage,
  bubble: cabBubble,
};

// ---------------------------------------------------------------- bed

export function bedOpen(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(1.95, 0.06, 2.2), c.body, { bone: B, at: [x, y, z] }); // floor
  for (let i = -0.9; i <= 0.9; i += 0.3) b.part(box(0.08, 0.03, 2.1), c.dark, { bone: B, at: [x + i, y + 0.04, z] }); // floor ribs
  b.part(box(1.95, 0.6, 0.06), c.body, { bone: B, at: [x, y + 0.3, z + 1.07] }); // headboard
  for (const s of [1, -1] as const) {
    b.part(box(0.06, 0.6, 2.2), c.body, { bone: B, at: [x + s * 0.95, y + 0.3, z] }); // wall
    b.part(box(0.1, 0.05, 2.2), c.trim, { bone: B, at: [x + s * 0.95, y + 0.62, z] }); // rail cap
    b.part(box(0.3, 0.32, 1.1), c.body, { bone: B, at: [x + s * 0.98, y - 0.2, z - 0.1] }); // rear fender
    for (const dz of [-0.8, 0, 0.8])
      b.part(new THREE.TorusGeometry(0.04, 0.012, 5, 8), c.steel, {
        bone: B,
        at: [x + s * 0.9, y + 0.1, z + dz],
        rotation: [0, 90, 0],
      }); // tie-downs
  }
  const gate = b.joint(`tailgate${m.tag}`, { parent: B, at: [x, y + 0.03, z - 1.1], dir: [0, 1, 0], role: "hinge" });
  b.part(box(1.84, 0.56, 0.06), c.body, { bone: gate, at: [x, y + 0.31, z - 1.1] });
  b.part(box(0.4, 0.05, 0.03), c.steel, { bone: gate, at: [x, y + 0.5, z - 1.14] }); // gate handle
  for (const s of [1, -1] as const)
    b.rod([x + s * 0.92, y + 0.55, z - 1.0], [x + s * 0.92, y + 0.1, z - 1.12], 0.012, c.steel, { bone: gate }); // cables
}

export function bedFlat(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(2.1, 0.06, 2.2), c.body, { bone: B, at: [x, y + 0.05, z] }); // deck
  for (const dz of [-0.9, -0.3, 0.3, 0.9]) b.part(box(2.1, 0.08, 0.08), c.dark, { bone: B, at: [x, y - 0.02, z + dz] }); // crossbeams
  b.part(box(2.1, 0.7, 0.05), c.body, { bone: B, at: [x, y + 0.42, z + 1.08] }); // headboard
  for (const dx of [-0.8, -0.4, 0, 0.4, 0.8])
    b.part(box(0.04, 0.6, 0.04), c.steel, { bone: B, at: [x + dx, y + 0.4, z + 1.05] }); // headboard bars
  for (const s of [1, -1] as const) {
    for (const dz of [-0.9, -0.3, 0.3, 0.9]) {
      b.part(box(0.1, 0.12, 0.1), c.dark, { bone: B, at: [x + s * 1.0, y + 0.02, z + dz] }); // stake pocket
      b.part(new THREE.TorusGeometry(0.035, 0.01, 5, 8), c.steel, {
        bone: B,
        at: [x + s * 1.06, y + 0.06, z + dz + 0.15],
        rotation: [0, 90, 0],
      }); // chain ring
    }
    b.part(box(0.3, 0.3, 1.1), c.body, { bone: B, at: [x + s * 0.98, y - 0.2, z - 0.1] });
    b.part(box(0.05, 0.04, 2.2), c.trim, { bone: B, at: [x + s * 1.03, y + 0.1, z] }); // rub rail
  }
}

export function bedCanopy(b: Builder, m: Mount, c: Roles) {
  bedOpen(b, m, c);
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(1.95, 0.08, 2.2), c.body, { bone: B, at: [x, y + 1.14, z] }); // shell roof
  b.part(box(1.95, 0.5, 0.06), c.body, { bone: B, at: [x, y + 0.88, z + 1.07] });
  for (const s of [1, -1] as const) {
    b.part(box(0.06, 0.12, 2.2), c.body, { bone: B, at: [x + s * 0.95, y + 0.7, z] }); // sill band
    b.part(box(0.05, 0.3, 2.0), c.glass, { bone: B, at: [x + s * 0.95, y + 0.92, z] }); // window strip
    b.part(box(0.06, 0.5, 0.1), c.body, { bone: B, at: [x + s * 0.95, y + 0.88, z + 1.03] });
    b.part(box(0.06, 0.5, 0.1), c.body, { bone: B, at: [x + s * 0.95, y + 0.88, z - 1.03] });
  }
  const hatch = b.joint(`canopyHatch${m.tag}`, {
    parent: B,
    at: [x, y + 1.12, z - 1.08],
    dir: [0, 1, 0],
    role: "hinge",
  });
  b.part(box(1.8, 0.46, 0.04), c.glass, { bone: hatch, at: [x, y + 0.88, z - 1.1] });
  b.part(box(1.84, 0.05, 0.06), c.body, { bone: hatch, at: [x, y + 1.12, z - 1.1] });
  b.part(box(0.3, 0.04, 0.04), c.steel, { bone: hatch, at: [x, y + 0.7, z - 1.13] });
}

export function bedCage(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(1.95, 0.06, 2.2), c.body, { bone: B, at: [x, y, z] });
  for (const s of [1, -1] as const) {
    b.part(box(0.06, 0.3, 2.2), c.body, { bone: B, at: [x + s * 0.95, y + 0.15, z] }); // low wall
    b.part(box(0.3, 0.32, 1.1), c.body, { bone: B, at: [x + s * 0.98, y - 0.2, z - 0.1] });
    const px = x + s * 0.88;
    b.rod([px, y + 0.3, z + 1.0], [px, y + 1.1, z + 0.9], 0.04, c.steel, { bone: B, sides: 6 });
    b.rod([px, y + 0.3, z - 1.0], [px, y + 1.05, z - 0.8], 0.04, c.steel, { bone: B, sides: 6 });
    b.rod([px, y + 1.1, z + 0.9], [px, y + 1.05, z - 0.8], 0.04, c.steel, { bone: B, sides: 6 });
    b.rod([px, y + 0.3, z - 1.0], [px, y + 1.1, z + 0.9], 0.03, c.steel, { bone: B, sides: 6 }); // X brace
    b.part(box(0.18, 0.3, 0.4), c.trim, { bone: B, at: [x + s * 0.8, y + 0.18, z + 0.5] }); // jerry can
    b.part(box(0.06, 0.04, 0.12), c.steel, { bone: B, at: [x + s * 0.8, y + 0.35, z + 0.5] });
  }
  b.rod([x - 0.88, y + 1.1, z + 0.9], [x + 0.88, y + 1.1, z + 0.9], 0.04, c.steel, { bone: B, sides: 6 });
  b.rod([x - 0.88, y + 1.05, z - 0.8], [x + 0.88, y + 1.05, z - 0.8], 0.04, c.steel, { bone: B, sides: 6 });
  b.part(cyl(0.42, 0.3, 12), c.tyre, { bone: B, at: [x, y + 0.45, z - 0.3], rotation: [0, 0, 20], flat: true }); // spare
  b.part(cyl(0.22, 0.32, 8), c.rim, { bone: B, at: [x, y + 0.45, z - 0.3], rotation: [0, 0, 20], flat: true });
  b.part(box(1.95, 0.5, 0.06), c.body, { bone: B, at: [x, y + 0.25, z + 1.07] });
}

export function bedTank(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(1.95, 0.06, 2.2), c.body, { bone: B, at: [x, y, z] });
  for (const s of [1, -1] as const)
    b.part(box(0.3, 0.32, 1.1), c.body, { bone: B, at: [x + s * 0.98, y - 0.2, z - 0.1] });
  for (const dz of [-0.7, 0.7]) {
    b.part(box(1.7, 0.25, 0.12), c.dark, { bone: B, at: [x, y + 0.15, z + dz] }); // cradle
    b.part(new THREE.TorusGeometry(0.72, 0.03, 5, 12), c.steel, { bone: B, at: [x, y + 0.85, z + dz] }); // strap
  }
  b.part(cyl(0.7, 2.0, 12), c.trim, { bone: B, at: [x, y + 0.85, z], rotation: [90, 0, 0], flat: true }); // tank
  for (const dz of [-1.02, 1.02])
    b.part(cyl(0.6, 0.06, 12), c.trim, { bone: B, at: [x, y + 0.85, z + dz], rotation: [90, 0, 0], flat: true }); // dished ends
  b.part(cyl(0.18, 0.16, 10), c.steel, { bone: B, at: [x, y + 1.6, z + 0.4] }); // filler dome
  b.part(cyl(0.05, 0.3, 6), c.steel, { bone: B, at: [x - 0.3, y + 1.6, z - 0.5] }); // vent pipe
  b.part(cyl(0.06, 0.25, 6), c.steel, { bone: B, at: [x + 0.4, y + 0.3, z - 1.06], rotation: [90, 0, 0] }); // valve stub
  b.part(new THREE.TorusGeometry(0.1, 0.02, 5, 8), c.steel, { bone: B, at: [x + 0.4, y + 0.3, z - 1.2] }); // valve wheel
  b.part(cyl(0.2, 0.2, 10), c.dark, { bone: B, at: [x - 0.6, y + 0.3, z - 1.0], rotation: [0, 0, 90] }); // hose reel
  b.part(new THREE.TorusGeometry(0.14, 0.035, 6, 10), c.tyre, {
    bone: B,
    at: [x - 0.6, y + 0.3, z - 1.0],
    rotation: [0, 90, 0],
  });
}

export function bedDump(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(1.0, 0.1, 2.1), c.dark, { bone: B, at: [x, y - 0.02, z] }); // subframe
  for (const s of [1, -1] as const)
    b.part(box(0.3, 0.32, 1.1), c.body, { bone: B, at: [x + s * 0.98, y - 0.2, z - 0.1] });
  const tip = b.joint(`tipper${m.tag}`, { parent: B, at: [x, y + 0.05, z - 1.05], dir: [0, 1, 0], role: "hinge" });
  b.part(box(1.95, 0.08, 2.2), c.body, { bone: tip, at: [x, y + 0.1, z] });
  b.part(box(1.95, 0.7, 0.06), c.body, { bone: tip, at: [x, y + 0.45, z + 1.07] });
  for (const s of [1, -1] as const) {
    b.part(box(0.06, 0.6, 2.2), c.body, { bone: tip, at: [x + s * 0.95, y + 0.4, z] });
    for (const dz of [-0.7, 0, 0.7])
      b.part(box(0.06, 0.6, 0.08), c.trim, { bone: tip, at: [x + s * 0.99, y + 0.4, z + dz] }); // wall ribs
  }
  b.part(box(1.84, 0.56, 0.05), c.body, { bone: tip, at: [x, y + 0.42, z - 1.1] });
  b.rod([x, y + 0.05, z + 0.9], [x, y + 0.6, z + 0.5], 0.08, c.steel, { bone: B, sides: 8 }); // ram cylinder
  b.rod([x, y + 0.6, z + 0.5], [x, y + 0.9, z + 0.3], 0.045, c.rim, { bone: tip, sides: 8 }); // ram piston
}

export const beds = { open: bedOpen, flat: bedFlat, canopy: bedCanopy, cage: bedCage, tank: bedTank, dump: bedDump };

// ---------------------------------------------------------------- assemble

export type Picks = {
  cab?: keyof typeof cabs;
  bed?: keyof typeof beds;
  wheel?: keyof typeof wheels;
  suspension?: keyof typeof suspensions;
  bumperFront?: keyof typeof bumpers;
  bumperRear?: keyof typeof bumpers;
  headlight?: keyof typeof headlights;
  grille?: keyof typeof grilles;
  mirror?: keyof typeof mirrors;
  exhaust?: keyof typeof exhausts;
  rack?: keyof typeof racks;
  armour?: armour.Picks;
  weapons?: weapons.Picks;
  hull?: hull.Picks;
  style?: style2077.Picks;
};

export const DEFAULT_PICKS: Required<
  Pick<
    Picks,
    | "cab"
    | "bed"
    | "wheel"
    | "suspension"
    | "bumperFront"
    | "bumperRear"
    | "headlight"
    | "grille"
    | "mirror"
    | "exhaust"
  >
> = {
  cab: "boxy",
  bed: "open",
  wheel: "offroad",
  suspension: "leaf",
  bumperFront: "bar",
  bumperRear: "bar",
  headlight: "round",
  grille: "bars",
  mirror: "stalk",
  exhaust: "tail",
};

/** The truck with these picks built into `b` (under `parent` on a board); returns the base's anchors. */
export function assembleInto(b: Builder, picks: Picks, parent?: Joint) {
  const p = { ...DEFAULT_PICKS, ...picks };
  const c = picks.style ? style2077.roles(picks.style) : PLAIN;
  const a = truckBase(b, c, parent);
  if (p.cab === "cabover") a.cabFront = { ...a.cabFront, at: [0, 1.62, 2.52] }; // its screen is at the nose
  cabs[p.cab](b, a.cab, c);
  beds[p.bed](b, a.bed, c);
  const track = picks.armour?.track;
  for (const k of ["FL", "FR", "RL", "RR"] as const) {
    suspensions[p.suspension](b, a[`susp${k}`], c);
    if (!track || (track === "half" && k[0] === "F")) wheels[p.wheel](b, a[`wheel${k}`], c);
  }
  if (track)
    for (const side of ["L", "R"] as const) {
      const flank = a[`flank${side}`];
      armour.tracks[track](b, { ...flank, at: [flank.s * 0.86, 0.42, track === "half" ? -1.0 : 0] }, c);
    }
  bumpers[p.bumperFront](b, a.bumperFront, c);
  bumpers[p.bumperRear](b, a.bumperRear, c);
  headlights[p.headlight](b, a.headlightL, c);
  headlights[p.headlight](b, a.headlightR, c);
  grilles[p.grille](b, a.grille, c);
  mirrors[p.mirror](b, a.mirrorL, c);
  mirrors[p.mirror](b, a.mirrorR, c);
  exhausts[p.exhaust](b, a.exhaustL, c);
  exhausts[p.exhaust](b, a.exhaustR, c);
  if (p.rack) racks[p.rack](b, p.rack === "headache" ? a.cabRear : p.rack === "ladder" ? a.bed : a.roof, c);
  if (picks.armour) armour.dress(b, a, c, picks.armour);
  if (picks.weapons) weapons.dress(b, a, c, picks.weapons);
  if (picks.hull) hull.dress(b, a, c, picks.hull);
  if (picks.style) style2077.dress(b, a, c, picks.style);
  return a;
}

/** A complete truck from a pick list: the app's placeholder while the builder's own module streams in. */
export function assemble(picks: Picks) {
  const b = createBuilder({ name: "truck" });
  assembleInto(b, picks);
  return b.root;
}
```

## Sampler: catalogs/truckGear.ts

```ts
/**
 * catalogs/truckGear.ts: the pickup's running gear and trim: wheels, suspension, bumpers, headlights, grilles,
 * mirrors, exhausts, racks. Same contract as catalogs/truck.ts, which holds the base, the cab and bed slots and
 * `assemble`: every variant is `variant(b: Builder, m: Mount, c: Roles)`, Mount = { bone, at, s, n, root, tag }
 * (bone the joint it rides, at the mount point in model space, s the side sign, n the outward normal, root the
 * chassis, tag a joint-name suffix), Roles = colours by part role, `box(w, h, d)` and `cyl(r, h, sides)` the two
 * geometry one-liners from truck.ts. Positions are model space relative to `m.at`; wheels build with their axle
 * along X and their outer face at x + s·0.16.
 *
 * SLOTS (mount → variants, one line each on the construction)
 *   wheel (anchors.wheelFL FR RL RR; tyre r 0.42, width 0.32; bone spins)
 *     wheelOffroad   staggered tread blocks round a carcass, 6 lugs, hub cap
 *     wheelSpoked    low tyre, 5 box spokes from a hub to a rim ring
 *     wheelSteelie   solid steel disc with 4 slots and 8 lugs, torus tyre with a sidewall ridge
 *     wheelBeadlock  outer beadlock ring with 16 bolts over a fat torus tyre
 *     wheelMesh      12 thin rod spokes to a torus rim, thin tyre
 *     wheelDually    twin tyres on one long hub, 8 lugs
 *     wheelHubless   open centre: three struts from the axle to an inner ring inside the tyre
 *     wheelArmoured  flat cover disc riveted over the face, 10-sided run-flat tyre, centre boss
 *   suspension (anchors.suspFL.., one wheel at a time; bone = travel joint at the rail, root = chassis)
 *     suspensionLeaf         half axle tube, three-leaf stack, U-bolts, shackle and one shock
 *     suspensionCoil         upper and lower A-arms, coil-over spring of stacked rings, knuckle
 *     suspensionLift         tall coil, drop bracket, track bar, twin shocks, bump stop
 *     suspensionIndependent  double wishbones, pushrod to a rocker with an inboard horizontal spring
 *     suspensionAirbag       bellows of alternating fat and thin drums on a trailing arm, air line
 *     suspensionPortal       portal gear box hanging under a raised axle tube, single spring plate, shock
 *   bumper (anchors.bumperFront / bumperRear; n gives the facing; 2.1 m wide at y 0.55)
 *     bumperBar     steel bar, end caps, two tow hooks, frame brackets
 *     bumperRam     two angled plough plates meeting at a centre boss, a row of teeth along the lower edge
 *     bumperTube    bull bar swept from a tube path with a top hoop and vertical mesh rods
 *     bumperWinch   plate bumper with a winch drum, roller fairlead, cable and hook
 *     bumperSpikes  bar with seven forward spikes and two rivet rows
 *     bumperBlade   dozer blade (extruded curved profile) on two hydraulic arms, cutting edge, teeth
 *   headlight (anchors.headlightL / R; n front; the lens glows in c.light)
 *     headlightRound    torus bezel with a glowing lens disc and three rivets
 *     headlightSlit     wide thin housing with a glowing strip and a brow lip
 *     headlightPod      two round pods on a stalk rising from the mount
 *     headlightSquare   framed square lens behind a rod guard grid
 *     headlightCluster  three stacked small lenses in one housing
 *     headlightCowl     lens recessed under a half-cylinder hood
 *   grille (anchors.grille; 1.0 × 0.4 opening)
 *     grilleBars    five horizontal rods in a frame
 *     grilleMesh    rod grid both ways over a dark backing
 *     grilleSlats   angled louvre slats in a frame
 *     grilleGuard   seven thick vertical bars and a hex emblem plate
 *     grilleSplit   two openings with three bars each around a centre beam
 *     grilleIntake  open scoop with a turbine fan inside (spin joint fan{tag})
 *   mirror (anchors.mirrorL / R)    mirrorStalk two rods to a square mirror · mirrorCamera stub, pod and lens
 *   exhaust (anchors.exhaustL / R)  exhaustTail twin tips out the back · exhaustStack pipe forward then up to a
 *                                   capped stack behind the cab · exhaustSide pipe along the flank, muffler, shield
 *   rack                            rackRoof (anchors.roof) rails, crossbars, lamp pods · rackHeadache
 *                                   (anchors.cabRear) mesh frame with lamps · rackLadder (anchors.bed) four
 *                                   uprights, two bars, crossbars
 *
 * Registries (wheels, suspensions, bumpers, headlights, grilles, mirrors, exhausts, racks) map the pick name
 * ("offroad") to the variant; truck.ts `assemble` reads them.
 */
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";
import type { Joint } from "agentic-3js-builder";
import { polyline } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { box, cyl } from "./truck";
import type { Mount, Roles, V3 } from "./truck";
import { PLAIN } from "./truck";

const R90: V3 = [0, 0, 90]; // a cylinder's axis turned along X
const TAU = Math.PI * 2;

// ---------------------------------------------------------------- wheel

/** `count` small parts in a ring of radius `r` round the wheel axis, each turned to face outward. */
function lugs(b: Builder, m: Mount, c: Roles, count: number, r: number, dx: number, geo: THREE.BufferGeometry) {
  const [x, y, z] = m.at;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * TAU;
    b.part(geo, c.steel, {
      bone: m.bone,
      at: [x + m.s * dx, y + r * Math.cos(a), z + r * Math.sin(a)],
      rotation: R90,
      flat: true,
    });
  }
}

export function wheelOffroad(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(cyl(0.36, 0.3, 12), c.tyre, { bone: B, at: [x, y, z], rotation: R90, flat: true }); // carcass
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * TAU;
    b.part(box(0.15, 0.1, 0.13), c.tyre, {
      bone: B,
      at: [x + (i % 2 ? 0.075 : -0.075), y + 0.37 * Math.cos(a), z + 0.37 * Math.sin(a)],
      rotation: [(a * 180) / Math.PI, 0, 0],
      flat: true,
    });
  }
  b.part(cyl(0.22, 0.32, 8), c.rim, { bone: B, at: [x, y, z], rotation: R90, flat: true });
  b.part(cyl(0.09, 0.36, 6), c.steel, { bone: B, at: [x, y, z], rotation: R90, flat: true }); // hub cap
  lugs(b, m, c, 6, 0.14, 0.17, cyl(0.025, 0.04, 6));
}

export function wheelSpoked(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(cyl(0.42, 0.26, 16), c.tyre, { bone: B, at: [x, y, z], rotation: R90, flat: true }); // low tyre
  b.part(cyl(0.33, 0.28, 16), c.rim, { bone: B, at: [x, y, z], rotation: R90, flat: true }); // rim ring
  b.part(cyl(0.3, 0.3, 16), c.dark, { bone: B, at: [x, y, z], rotation: R90, flat: true }); // dish
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU;
    b.part(box(0.06, 0.28, 0.07), c.rim, {
      bone: B,
      at: [x + m.s * 0.1, y + 0.17 * Math.cos(a), z + 0.17 * Math.sin(a)],
      rotation: [(a * 180) / Math.PI, 0, 0],
      flat: true,
    });
  }
  b.part(cyl(0.08, 0.34, 8), c.rim, { bone: B, at: [x, y, z], rotation: R90, flat: true });
  lugs(b, m, c, 5, 0.05, 0.18, cyl(0.015, 0.02, 6));
}

export function wheelSteelie(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(new THREE.TorusGeometry(0.3, 0.12, 6, 16), c.tyre, {
    bone: B,
    at: [x, y, z],
    rotation: [0, 90, 0],
    flat: true,
  }); // torus tyre
  b.part(new THREE.TorusGeometry(0.28, 0.14, 4, 16), c.tyre, {
    bone: B,
    at: [x, y, z],
    rotation: [0, 90, 0],
    scale: [1, 1, 0.6],
    flat: true,
  }); // sidewall ridge
  b.part(cyl(0.3, 0.08, 12), c.rim, { bone: B, at: [x + m.s * 0.12, y, z], rotation: R90, flat: true }); // steel disc
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + 0.4;
    b.part(box(0.03, 0.06, 0.1), c.dark, {
      bone: B,
      at: [x + m.s * 0.16, y + 0.2 * Math.cos(a), z + 0.2 * Math.sin(a)],
      rotation: [(a * 180) / Math.PI, 0, 0],
    }); // slots
  }
  b.part(cyl(0.06, 0.08, 8), c.steel, { bone: B, at: [x + m.s * 0.17, y, z], rotation: R90, flat: true });
  lugs(b, m, c, 8, 0.1, 0.17, cyl(0.018, 0.03, 6));
}

export function wheelBeadlock(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(new THREE.TorusGeometry(0.27, 0.15, 8, 16), c.tyre, {
    bone: B,
    at: [x, y, z],
    rotation: [0, 90, 0],
    flat: true,
  });
  b.part(cyl(0.26, 0.3, 12), c.rim, { bone: B, at: [x, y, z], rotation: R90, flat: true }); // rim drum
  b.part(cyl(0.3, 0.05, 16), c.steel, { bone: B, at: [x + m.s * 0.16, y, z], rotation: R90, flat: true }); // beadlock ring
  lugs(b, m, c, 16, 0.27, 0.19, cyl(0.013, 0.02, 6)); // ring bolts
  b.part(cyl(0.12, 0.34, 8), c.dark, { bone: B, at: [x, y, z], rotation: R90, flat: true });
  lugs(b, m, c, 6, 0.08, 0.18, cyl(0.02, 0.03, 6));
}

export function wheelMesh(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(cyl(0.42, 0.22, 16), c.tyre, { bone: B, at: [x, y, z], rotation: R90, flat: true });
  b.part(new THREE.TorusGeometry(0.3, 0.03, 6, 16), c.rim, {
    bone: B,
    at: [x + m.s * 0.06, y, z],
    rotation: [0, 90, 0],
  }); // rim hoop
  b.part(cyl(0.07, 0.26, 8), c.rim, { bone: B, at: [x, y, z], rotation: R90, flat: true });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    b.rod([x + m.s * 0.1, y, z], [x + m.s * 0.05, y + 0.3 * Math.cos(a), z + 0.3 * Math.sin(a)], 0.012, c.rim, {
      bone: B,
      sides: 5,
    });
  }
  lugs(b, m, c, 5, 0.04, 0.14, cyl(0.012, 0.02, 6));
}

export function wheelDually(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  for (const dx of [0.1, -0.24]) {
    b.part(cyl(0.42, 0.28, 12), c.tyre, { bone: B, at: [x + m.s * dx, y, z], rotation: R90, flat: true });
    b.part(cyl(0.24, 0.3, 10), c.rim, { bone: B, at: [x + m.s * dx, y, z], rotation: R90, flat: true });
  }
  b.part(cyl(0.12, 0.7, 8), c.steel, { bone: B, at: [x + m.s * -0.07, y, z], rotation: R90, flat: true }); // long hub
  b.part(cyl(0.11, 0.1, 8), c.rim, { bone: B, at: [x + m.s * 0.26, y, z], rotation: R90, flat: true });
  lugs(b, m, c, 8, 0.15, 0.27, cyl(0.02, 0.04, 6));
}

export function wheelHubless(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(new THREE.TorusGeometry(0.32, 0.1, 6, 16), c.tyre, {
    bone: B,
    at: [x, y, z],
    rotation: [0, 90, 0],
    flat: true,
  });
  b.part(new THREE.TorusGeometry(0.24, 0.035, 6, 16), c.rim, { bone: B, at: [x, y, z], rotation: [0, 90, 0] }); // inner ring
  b.part(cyl(0.06, 0.2, 8), c.steel, { bone: B, at: [x, y, z], rotation: R90, flat: true }); // axle stub
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU;
    b.rod([x, y, z], [x, y + 0.22 * Math.cos(a), z + 0.22 * Math.sin(a)], 0.025, c.steel, { bone: B, sides: 6 });
  }
}

export function wheelArmoured(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(cyl(0.42, 0.3, 10), c.tyre, { bone: B, at: [x, y, z], rotation: R90, flat: true }); // run-flat
  b.part(cyl(0.4, 0.05, 10), c.rim, { bone: B, at: [x + m.s * 0.17, y, z], rotation: R90, flat: true }); // cover disc
  lugs(b, m, c, 12, 0.34, 0.2, cyl(0.015, 0.015, 6)); // rivets
  b.part(cyl(0.12, 0.08, 8), c.steel, { bone: B, at: [x + m.s * 0.22, y, z], rotation: R90, flat: true }); // boss
  b.part(cyl(0.05, 0.04, 6), c.dark, { bone: B, at: [x + m.s * 0.28, y, z], rotation: R90, flat: true });
}

export const wheels = {
  offroad: wheelOffroad,
  spoked: wheelSpoked,
  steelie: wheelSteelie,
  beadlock: wheelBeadlock,
  mesh: wheelMesh,
  dually: wheelDually,
  hubless: wheelHubless,
  armoured: wheelArmoured,
};

// ---------------------------------------------------------------- suspension (one wheel at a time)

/** A coil spring between two points: `n` stacked rings. */
function coil(b: Builder, bone: Joint, c: Roles, from: V3, to: V3, r: number, n: number) {
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    b.part(new THREE.TorusGeometry(r, r * 0.18, 5, 8), c.steel, {
      bone,
      at: [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t, from[2] + (to[2] - from[2]) * t],
      rotation: [90, 0, 0],
    });
  }
}

export function suspensionLeaf(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const s = m.s;
  const B = m.bone;
  b.rod([x, y, z], [x - s * 0.9, y, z], 0.06, c.dark, { bone: B, sides: 8 }); // half axle
  if (s === 1) b.part(new THREE.SphereGeometry(0.17, 8, 6), c.dark, { bone: B, at: [x - 0.75, y, z], flat: true }); // pumpkin
  for (const [h, len] of [
    [0.1, 1.2],
    [0.13, 0.95],
    [0.16, 0.7],
  ])
    b.part(box(0.08, 0.025, len), c.steel, { bone: B, at: [x - s * 0.36, y + h, z] }); // leaves
  b.part(box(0.12, 0.04, 0.16), c.dark, { bone: B, at: [x - s * 0.36, y + 0.19, z] }); // U-bolt plate
  for (const dz of [-0.06, 0.06])
    b.rod([x - s * 0.36, y - 0.05, z + dz], [x - s * 0.36, y + 0.22, z + dz], 0.012, c.steel, { bone: B, sides: 5 });
  b.part(box(0.04, 0.16, 0.05), c.steel, { bone: m.root, at: [x - s * 0.36, y + 0.16, z - 0.62] }); // shackle on the frame
  b.rod([x - s * 0.3, y + 0.02, z - 0.15], [x - s * 0.42, y + 0.45, z + 0.1], 0.035, c.rim, { bone: B, sides: 8 }); // shock
}

export function suspensionCoil(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const s = m.s;
  const B = m.bone;
  b.part(box(0.1, 0.3, 0.14), c.dark, { bone: B, at: [x - s * 0.17, y, z] }); // knuckle
  for (const dz of [-0.25, 0.25]) {
    b.rod([x - s * 0.2, y - 0.1, z], [x - s * 0.52, y - 0.08, z + dz], 0.025, c.steel, { bone: B, sides: 6 }); // lower A-arm
    b.rod([x - s * 0.2, y + 0.14, z], [x - s * 0.5, y + 0.16, z + dz], 0.022, c.steel, { bone: B, sides: 6 }); // upper A-arm
  }
  coil(b, B, c, [x - s * 0.32, y - 0.06, z], [x - s * 0.4, y + 0.3, z], 0.08, 5);
  b.rod([x - s * 0.3, y - 0.1, z], [x - s * 0.42, y + 0.34, z], 0.03, c.rim, { bone: B, sides: 8 }); // damper inside
  b.part(box(0.12, 0.04, 0.12), c.dark, { bone: m.root, at: [x - s * 0.42, y + 0.34, z] }); // top mount
}

export function suspensionLift(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const s = m.s;
  const B = m.bone;
  b.rod([x, y, z], [x - s * 0.9, y, z], 0.06, c.dark, { bone: B, sides: 8 });
  b.part(box(0.1, 0.25, 0.1), c.dark, { bone: m.root, at: [x - s * 0.36, y + 0.4, z + 0.5] }); // drop bracket
  coil(b, B, c, [x - s * 0.36, y + 0.04, z], [x - s * 0.36, y + 0.44, z], 0.09, 8);
  b.part(cyl(0.05, 0.08, 6), c.tyre, { bone: m.root, at: [x - s * 0.36, y + 0.48, z + 0.2] }); // bump stop
  b.rod([x - s * 0.1, y + 0.06, z + 0.1], [x - s * 1.0, y + 0.3, z + 0.1], 0.025, c.steel, { bone: B, sides: 6 }); // track bar
  for (const dz of [-0.18, 0.18])
    b.rod([x - s * 0.25, y, z + dz], [x - s * 0.5, y + 0.48, z + dz * 1.5], 0.03, c.rim, { bone: B, sides: 7 }); // twin shocks
}

export function suspensionIndependent(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const s = m.s;
  const B = m.bone;
  b.part(box(0.08, 0.36, 0.12), c.dark, { bone: B, at: [x - s * 0.16, y, z] }); // upright
  for (const dz of [-0.28, 0.28]) {
    b.rod([x - s * 0.18, y - 0.14, z], [x - s * 0.6, y - 0.1, z + dz], 0.022, c.steel, { bone: B, sides: 6 });
    b.rod([x - s * 0.18, y + 0.16, z], [x - s * 0.55, y + 0.2, z + dz], 0.02, c.steel, { bone: B, sides: 6 });
  }
  b.rod([x - s * 0.22, y - 0.12, z], [x - s * 0.5, y + 0.42, z], 0.018, c.rim, { bone: B, sides: 6 }); // pushrod
  b.part(box(0.04, 0.16, 0.08), c.dark, { bone: m.root, at: [x - s * 0.5, y + 0.42, z] }); // rocker
  coil(b, m.root, c, [x - s * 0.52, y + 0.46, z], [x - s * 0.86, y + 0.46, z], 0.045, 7); // inboard spring, horizontal
  b.part(cyl(0.025, 0.36, 6), c.rim, { bone: m.root, at: [x - s * 0.69, y + 0.46, z], rotation: R90 });
}

export function suspensionAirbag(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const s = m.s;
  const B = m.bone;
  b.part(box(0.08, 0.08, 0.7), c.dark, { bone: B, at: [x - s * 0.36, y, z + 0.3] }); // trailing arm
  b.rod([x, y, z], [x - s * 0.9, y, z], 0.06, c.dark, { bone: B, sides: 8 });
  for (let i = 0; i < 4; i++)
    b.part(cyl(i % 2 ? 0.08 : 0.12, 0.09, 10), i % 2 ? c.dark : c.tyre, {
      bone: B,
      at: [x - s * 0.36, y + 0.09 + i * 0.09, z],
      flat: true,
    }); // bellows
  b.part(cyl(0.11, 0.03, 10), c.steel, { bone: m.root, at: [x - s * 0.36, y + 0.46, z] }); // top plate
  b.rod([x - s * 0.36, y + 0.46, z], [x - s * 0.7, y + 0.5, z + 0.3], 0.01, c.rim, { bone: m.root, sides: 5 }); // air line
}

export function suspensionPortal(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const s = m.s;
  const B = m.bone;
  b.part(box(0.2, 0.34, 0.26), c.dark, { bone: B, at: [x - s * 0.1, y + 0.12, z] }); // portal gear box
  for (const dz of [-0.09, 0.09])
    b.part(cyl(0.02, 0.02, 6), c.steel, { bone: B, at: [x, y + 0.2, z + dz], rotation: R90 }); // cover bolts
  b.rod([x - s * 0.15, y + 0.24, z], [x - s * 0.9, y + 0.24, z], 0.05, c.dark, { bone: B, sides: 8 }); // raised axle
  b.part(box(0.08, 0.03, 0.8), c.steel, { bone: B, at: [x - s * 0.38, y + 0.3, z] }); // single spring plate
  b.rod([x - s * 0.3, y + 0.26, z - 0.1], [x - s * 0.42, y + 0.5, z + 0.1], 0.03, c.rim, { bone: B, sides: 8 });
  b.part(box(0.06, 0.06, 0.06), c.steel, { bone: m.root, at: [x - s * 0.42, y + 0.5, z + 0.1] });
}

export const suspensions = {
  leaf: suspensionLeaf,
  coil: suspensionCoil,
  lift: suspensionLift,
  independent: suspensionIndependent,
  airbag: suspensionAirbag,
  portal: suspensionPortal,
};

// ---------------------------------------------------------------- bumper (n gives the facing)

export function bumperBar(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const f = m.n[2];
  const B = m.bone;
  b.part(box(2.1, 0.22, 0.16), c.trim, { bone: B, at: [x, y, z] });
  for (const s of [1, -1] as const) {
    b.part(box(0.16, 0.26, 0.2), c.trim, { bone: B, at: [x + s * 1.05, y, z] }); // end cap
    b.part(new THREE.TorusGeometry(0.06, 0.02, 5, 8, Math.PI), c.steel, {
      bone: B,
      at: [x + s * 0.6, y - 0.11, z + f * 0.06],
      rotation: [0, 0, 180],
    }); // tow hook
    b.part(box(0.08, 0.1, 0.3), c.dark, { bone: B, at: [x + s * 0.5, y, z - f * 0.2] }); // frame bracket
  }
}

export function bumperRam(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const f = m.n[2];
  const B = m.bone;
  for (const s of [1, -1] as const) {
    b.part(box(1.1, 0.4, 0.06), c.trim, { bone: B, at: [x + s * 0.5, y, z - f * 0.14], rotation: [0, s * f * 25, 0] }); // angled plate
    for (let i = 0; i < 4; i++) {
      const u = 0.12 + i * 0.26;
      b.spike([x + s * u, y - 0.17, z + f * (0.08 - u * 0.45)], [0, 0, f], 0.14, 0.03, c.steel, { bone: B, sides: 5 }); // teeth
    }
  }
  b.part(cyl(0.12, 0.12, 8), c.steel, { bone: B, at: [x, y, z + f * 0.08], rotation: [90, 0, 0], flat: true }); // centre boss
  b.part(box(1.0, 0.08, 0.3), c.dark, { bone: B, at: [x, y + 0.05, z - f * 0.25] });
}

export function bumperTube(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const f = m.n[2];
  const B = m.bone;
  const bar = polyline([
    [x + 0.9, y - 0.12, z - f * 0.3],
    [x + 0.9, y - 0.12, z + f * 0.1],
    [x + 0.5, y - 0.12, z + f * 0.2],
    [x - 0.5, y - 0.12, z + f * 0.2],
    [x - 0.9, y - 0.12, z + f * 0.1],
    [x - 0.9, y - 0.12, z - f * 0.3],
  ]);
  b.sweep(bar, 0.05, c.steel, { bone: B, sides: 8, caps: "flat" });
  const hoop = polyline([
    [x + 0.6, y - 0.1, z + f * 0.15],
    [x + 0.6, y + 0.5, z + f * 0.1],
    [x + 0.35, y + 0.6, z + f * 0.08],
    [x - 0.35, y + 0.6, z + f * 0.08],
    [x - 0.6, y + 0.5, z + f * 0.1],
    [x - 0.6, y - 0.1, z + f * 0.15],
  ]);
  b.sweep(hoop, 0.04, c.steel, { bone: B, sides: 8, caps: "flat" });
  for (const dx of [-0.4, -0.2, 0, 0.2, 0.4])
    b.rod([x + dx, y - 0.1, z + f * 0.15], [x + dx, y + 0.56, z + f * 0.1], 0.012, c.steel, { bone: B, sides: 5 });
  b.rod([x - 0.6, y + 0.25, z + f * 0.12], [x + 0.6, y + 0.25, z + f * 0.12], 0.02, c.steel, { bone: B, sides: 6 });
}

export function bumperWinch(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const f = m.n[2];
  const B = m.bone;
  b.part(box(2.0, 0.3, 0.14), c.trim, { bone: B, at: [x, y, z] });
  b.part(box(0.9, 0.3, 0.3), c.dark, { bone: B, at: [x, y + 0.02, z - f * 0.12] }); // winch housing
  b.part(cyl(0.09, 0.5, 10), c.steel, { bone: B, at: [x, y + 0.08, z + f * 0.02], rotation: R90 }); // drum
  b.part(cyl(0.07, 0.56, 8), c.rim, { bone: B, at: [x, y + 0.08, z + f * 0.02], rotation: R90 }); // cable layer
  b.part(box(0.5, 0.18, 0.06), c.steel, { bone: B, at: [x, y + 0.08, z + f * 0.1] }); // fairlead
  for (const dy of [-0.06, 0.06])
    b.part(cyl(0.02, 0.44, 6), c.rim, { bone: B, at: [x, y + 0.08 + dy, z + f * 0.14], rotation: R90 }); // rollers
  b.rod([x, y + 0.08, z + f * 0.14], [x, y - 0.05, z + f * 0.28], 0.012, c.rim, { bone: B, sides: 5 });
  b.part(new THREE.TorusGeometry(0.05, 0.015, 5, 8, Math.PI * 1.5), c.steel, {
    bone: B,
    at: [x, y - 0.1, z + f * 0.3],
    rotation: [0, 90, 0],
  }); // hook
  for (const s of [1, -1] as const) b.part(box(0.1, 0.12, 0.3), c.dark, { bone: B, at: [x + s * 0.5, y, z - f * 0.2] });
}

export function bumperSpikes(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const f = m.n[2];
  const B = m.bone;
  b.part(box(2.1, 0.26, 0.2), c.trim, { bone: B, at: [x, y, z] });
  for (let i = 0; i < 7; i++)
    b.spike([x - 0.9 + i * 0.3, y, z + f * 0.1], [0, 0, f], 0.3, 0.045, c.steel, { bone: B, sides: 6 });
  for (const dy of [-0.09, 0.09])
    for (let i = 0; i < 8; i++)
      b.part(cyl(0.015, 0.02, 6), c.steel, {
        bone: B,
        at: [x - 1.0 + i * 0.3 + 0.07, y + dy, z + f * 0.1],
        rotation: [90, 0, 0],
      });
  for (const s of [1, -1] as const) b.part(box(0.1, 0.12, 0.3), c.dark, { bone: B, at: [x + s * 0.5, y, z - f * 0.2] });
}

export function bumperBlade(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const f = m.n[2];
  const B = m.bone;
  const blade = b.extrude(
    [
      [0, -0.25],
      [0.12, -0.25, "sharp"],
      [0.02, 0.0],
      [0.1, 0.3],
      [0.28, 0.45, "sharp"],
      [0.2, 0.45, "sharp"],
      [0.0, 0.3],
      [-0.06, 0.0],
    ],
    { at: [x, y, z + f * 0.2], x: [0, 0, f], y: [0, 1, 0], thickness: 2.2, smoothing: 1, bone: B, color: c.trim },
  );
  void blade;
  b.part(box(2.2, 0.06, 0.1), c.steel, { bone: B, at: [x, y - 0.26, z + f * 0.28] }); // cutting edge
  for (let i = 0; i < 6; i++)
    b.spike([x - 1.0 + i * 0.4, y - 0.26, z + f * 0.3], [0, -0.5, f], 0.12, 0.03, c.steel, { bone: B, sides: 5 });
  for (const s of [1, -1] as const) {
    b.rod([x + s * 0.5, y + 0.3, z - f * 0.3], [x + s * 0.5, y + 0.1, z + f * 0.1], 0.04, c.steel, {
      bone: B,
      sides: 8,
    }); // arm
    b.rod([x + s * 0.7, y + 0.1, z - f * 0.3], [x + s * 0.7, y + 0.35, z + f * 0.1], 0.03, c.rim, {
      bone: B,
      sides: 7,
    }); // hydraulic
    b.rod([x + s * 0.7, y + 0.1, z - f * 0.3], [x + s * 0.7, y + 0.2, z - f * 0.14], 0.045, c.steel, {
      bone: B,
      sides: 7,
    });
  }
}

export const bumpers = {
  bar: bumperBar,
  ram: bumperRam,
  tube: bumperTube,
  winch: bumperWinch,
  spikes: bumperSpikes,
  blade: bumperBlade,
};

// ---------------------------------------------------------------- headlight (per side; lens glows)

export function headlightRound(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(new THREE.TorusGeometry(0.13, 0.03, 6, 12), c.steel, { bone: B, at: [x, y, z + 0.02] }); // bezel
  glow(b.part(cyl(0.12, 0.04, 12), c.light, { bone: B, at: [x, y, z + 0.01], rotation: [90, 0, 0], flat: true }));
  for (const a of [90, 210, 330])
    b.part(cyl(0.012, 0.02, 6), c.steel, {
      bone: B,
      at: [x + 0.14 * Math.cos((a * Math.PI) / 180), y + 0.14 * Math.sin((a * Math.PI) / 180), z + 0.04],
      rotation: [90, 0, 0],
    });
}

export function headlightSlit(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(0.5, 0.12, 0.08), c.dark, { bone: B, at: [x, y, z] }); // housing
  glow(b.part(box(0.44, 0.04, 0.02), c.light, { bone: B, at: [x, y, z + 0.04] }));
  b.part(box(0.54, 0.03, 0.14), c.trim, { bone: B, at: [x, y + 0.08, z + 0.02] }); // brow
}

export function headlightPod(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.rod([x, y + 0.1, z - 0.1], [x, y + 0.4, z - 0.1], 0.03, c.steel, { bone: B, sides: 6 }); // stalk
  for (const dx of [-0.13, 0.13]) {
    b.part(cyl(0.1, 0.16, 10), c.dark, { bone: B, at: [x + dx, y + 0.42, z - 0.1], rotation: [90, 0, 0], flat: true }); // pod
    glow(
      b.part(cyl(0.08, 0.02, 10), c.light, {
        bone: B,
        at: [x + dx, y + 0.42, z - 0.01],
        rotation: [90, 0, 0],
        flat: true,
      }),
    );
  }
  b.part(box(0.36, 0.04, 0.04), c.steel, { bone: B, at: [x, y + 0.42, z - 0.18] }); // pod bar
}

export function headlightSquare(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(0.34, 0.26, 0.06), c.trim, { bone: B, at: [x, y, z] }); // frame
  glow(b.part(box(0.28, 0.2, 0.02), c.light, { bone: B, at: [x, y, z + 0.03] }));
  for (const dy of [-0.08, 0, 0.08])
    b.rod([x - 0.17, y + dy, z + 0.06], [x + 0.17, y + dy, z + 0.06], 0.008, c.steel, { bone: B, sides: 5 });
  for (const dx of [-0.07, 0.07])
    b.rod([x + dx, y - 0.13, z + 0.06], [x + dx, y + 0.13, z + 0.06], 0.008, c.steel, { bone: B, sides: 5 });
}

export function headlightCluster(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(0.18, 0.4, 0.08), c.dark, { bone: B, at: [x, y, z] });
  for (const dy of [-0.13, 0, 0.13]) {
    b.part(new THREE.TorusGeometry(0.05, 0.012, 5, 10), c.steel, { bone: B, at: [x, y + dy, z + 0.04] });
    glow(
      b.part(cyl(0.045, 0.02, 10), c.light, { bone: B, at: [x, y + dy, z + 0.04], rotation: [90, 0, 0], flat: true }),
    );
  }
}

export function headlightCowl(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.26, 8, 1, false, -Math.PI / 2, Math.PI), c.trim, {
    bone: B,
    at: [x, y, z - 0.1],
    rotation: [90, 0, 0],
    flat: true,
  }); // half-cylinder hood, open underneath, axis along Z
  b.part(cyl(0.14, 0.2, 10), c.dark, { bone: B, at: [x, y - 0.02, z - 0.14], rotation: [90, 0, 0], flat: true });
  glow(
    b.part(cyl(0.11, 0.02, 10), c.light, { bone: B, at: [x, y - 0.02, z - 0.03], rotation: [90, 0, 0], flat: true }),
  );
}

export const headlights = {
  round: headlightRound,
  slit: headlightSlit,
  pod: headlightPod,
  square: headlightSquare,
  cluster: headlightCluster,
  cowl: headlightCowl,
};

// ---------------------------------------------------------------- grille (1.0 × 0.4 at the front face)

function grilleFrame(b: Builder, m: Mount, c: Roles, w = 1.0, h = 0.4) {
  const [x, y, z] = m.at;
  b.part(box(w, h, 0.04), c.dark, { bone: m.bone, at: [x, y, z - 0.02] }); // dark backing
  for (const s of [1, -1] as const)
    b.part(box(0.04, h + 0.04, 0.06), c.trim, { bone: m.bone, at: [x + (s * w) / 2, y, z] });
  for (const s of [1, -1] as const)
    b.part(box(w + 0.04, 0.04, 0.06), c.trim, { bone: m.bone, at: [x, y + (s * h) / 2, z] });
}

export function grilleBars(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  grilleFrame(b, m, c);
  for (let i = 0; i < 5; i++)
    b.rod([x - 0.48, y - 0.15 + i * 0.075, z + 0.02], [x + 0.48, y - 0.15 + i * 0.075, z + 0.02], 0.016, c.steel, {
      bone: m.bone,
      sides: 6,
    });
}

export function grilleMesh(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  grilleFrame(b, m, c);
  for (let i = 0; i < 9; i++)
    b.rod([x - 0.4 + i * 0.1, y - 0.19, z + 0.01], [x - 0.4 + i * 0.1, y + 0.19, z + 0.01], 0.008, c.steel, {
      bone: m.bone,
      sides: 4,
    });
  for (let i = 0; i < 4; i++)
    b.rod([x - 0.48, y - 0.15 + i * 0.1, z + 0.025], [x + 0.48, y - 0.15 + i * 0.1, z + 0.025], 0.008, c.steel, {
      bone: m.bone,
      sides: 4,
    });
}

export function grilleSlats(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  grilleFrame(b, m, c);
  for (let i = 0; i < 6; i++)
    b.part(box(0.96, 0.07, 0.015), c.trim, {
      bone: m.bone,
      at: [x, y - 0.17 + i * 0.068, z + 0.01],
      rotation: [35, 0, 0],
    });
}

export function grilleGuard(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  grilleFrame(b, m, c);
  for (let i = 0; i < 7; i++)
    b.part(box(0.05, 0.42, 0.06), c.steel, { bone: m.bone, at: [x - 0.42 + i * 0.14, y, z + 0.03] });
  b.part(cyl(0.11, 0.03, 6), c.trim, { bone: m.bone, at: [x, y, z + 0.07], rotation: [90, 0, 0], flat: true }); // hex emblem
}

export function grilleSplit(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  grilleFrame(b, m, c);
  b.part(box(0.1, 0.44, 0.08), c.trim, { bone: m.bone, at: [x, y, z + 0.01] }); // centre beam
  for (const s of [1, -1] as const)
    for (let i = 0; i < 3; i++)
      b.rod(
        [x + s * 0.07, y - 0.12 + i * 0.12, z + 0.02],
        [x + s * 0.48, y - 0.12 + i * 0.12, z + 0.02],
        0.014,
        c.steel,
        { bone: m.bone, sides: 6 },
      );
}

export function grilleIntake(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  grilleFrame(b, m, c, 0.9, 0.44);
  b.part(box(0.9, 0.44, 0.3), c.dark, { bone: m.bone, at: [x, y, z - 0.17] }); // scoop throat
  const fan = b.joint(`fan${m.tag}`, {
    parent: m.bone,
    at: [x, y, z - 0.1],
    dir: [0, 1, 0],
    up: [1, 0, 0],
    role: "hinge",
  });
  b.part(cyl(0.05, 0.1, 8), c.steel, { bone: fan, at: [x, y, z - 0.1], rotation: [90, 0, 0] });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * 360;
    b.part(box(0.04, 0.15, 0.015), c.rim, {
      bone: fan,
      at: [x + 0.11 * Math.sin((a * Math.PI) / 180), y + 0.11 * Math.cos((a * Math.PI) / 180), z - 0.1],
      rotation: [0, 30, -a],
    }); // blades
  }
}

export const grilles = {
  bars: grilleBars,
  mesh: grilleMesh,
  slats: grilleSlats,
  guard: grilleGuard,
  split: grilleSplit,
  intake: grilleIntake,
};

// ---------------------------------------------------------------- extras: mirror, exhaust, rack

export function mirrorStalk(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const s = m.s;
  for (const dy of [0, -0.12])
    b.rod([x, y + dy, z], [x + s * 0.3, y + 0.05 + dy, z + 0.05], 0.015, c.steel, { bone: m.bone, sides: 6 });
  b.part(box(0.04, 0.26, 0.2), c.dark, { bone: m.bone, at: [x + s * 0.32, y, z + 0.05] });
  b.part(box(0.01, 0.22, 0.16), c.glass, { bone: m.bone, at: [x + s * 0.32, y, z + 0.075] });
}

export function mirrorCamera(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const s = m.s;
  b.part(box(0.14, 0.05, 0.08), c.dark, { bone: m.bone, at: [x + s * 0.06, y, z] });
  b.part(new THREE.SphereGeometry(0.06, 8, 6), c.trim, { bone: m.bone, at: [x + s * 0.16, y, z], flat: true });
  b.part(cyl(0.025, 0.05, 8), c.dark, { bone: m.bone, at: [x + s * 0.16, y, z + 0.06], rotation: [90, 0, 0] }); // lens
}

export const mirrors = { stalk: mirrorStalk, camera: mirrorCamera };

export function exhaustTail(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  for (const dx of [-0.06, 0.06]) {
    b.rod([x + dx, y, z + 0.6], [x + dx, y, z - 0.12], 0.035, c.steel, { bone: m.bone, sides: 8 });
    b.rod([x + dx, y, z - 0.12], [x + dx, y, z - 0.18], 0.045, c.dark, { bone: m.bone, sides: 8 }); // tip
  }
  b.part(box(0.2, 0.14, 0.4), c.steel, { bone: m.bone, at: [x, y, z + 0.5] }); // muffler
}

export function exhaustStack(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const s = m.s;
  const top = y + 2.1;
  const px = x + s * 0.3; // beside the bed wall
  b.rod([x, y, z], [x, y + 0.25, z + 0.3], 0.035, c.steel, { bone: m.bone, sides: 8 }); // up to the bed floor
  b.rod([x, y + 0.25, z + 0.3], [px, y + 0.25, z + 2.0], 0.035, c.steel, { bone: m.bone, sides: 8 }); // along it
  b.rod([px, y + 0.25, z + 2.0], [px, top, z + 2.0], 0.05, c.steel, { bone: m.bone, sides: 8 }); // stack
  b.part(cyl(0.065, 0.5, 8), c.rim, { bone: m.bone, at: [px, y + 0.9, z + 2.0] }); // heat shield
  b.part(box(0.14, 0.03, 0.16), c.dark, {
    bone: m.bone,
    at: [px, top + 0.04, z + 2.0],
    rotation: [-20, 0, 0],
  }); // rain cap
  b.part(cyl(0.01, 0.08, 4), c.dark, { bone: m.bone, at: [px, top + 0.03, z + 2.06] });
}

export function exhaustSide(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const s = m.s;
  const px = x + s * 0.3;
  b.rod([x, y, z + 1.0], [px, y, z + 0.9], 0.03, c.steel, { bone: m.bone, sides: 8 });
  b.part(cyl(0.09, 0.6, 10), c.steel, { bone: m.bone, at: [px, y, z + 0.6], rotation: [90, 0, 0], flat: true }); // muffler can
  b.rod([px, y, z + 0.3], [px, y, z - 0.2], 0.03, c.steel, { bone: m.bone, sides: 8 });
  b.part(cyl(0.045, 0.14, 8), c.dark, { bone: m.bone, at: [px, y, z - 0.2], rotation: [90, 0, 0] });
  b.part(box(0.04, 0.12, 0.7), c.rim, { bone: m.bone, at: [px + s * 0.1, y + 0.08, z + 0.6] }); // heat shield
  for (const dz of [0.35, 0.85])
    b.part(box(0.02, 0.1, 0.04), c.dark, { bone: m.bone, at: [px - s * 0.1, y + 0.1, z + dz] }); // hangers
}

export const exhausts = { tail: exhaustTail, stack: exhaustStack, side: exhaustSide };

export function rackRoof(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  for (const s of [1, -1] as const) {
    b.rod([x + s * 0.8, y + 0.12, z - 0.6], [x + s * 0.8, y + 0.12, z + 0.6], 0.025, c.steel, { bone: B, sides: 6 });
    for (const dz of [-0.5, 0.5])
      b.rod([x + s * 0.8, y, z + dz], [x + s * 0.8, y + 0.12, z + dz], 0.02, c.dark, { bone: B, sides: 6 }); // feet
  }
  for (const dz of [-0.5, 0, 0.5])
    b.rod([x - 0.8, y + 0.12, z + dz], [x + 0.8, y + 0.12, z + dz], 0.02, c.steel, { bone: B, sides: 6 });
  for (const dx of [-0.45, -0.15, 0.15, 0.45]) {
    b.part(cyl(0.07, 0.1, 8), c.dark, { bone: B, at: [x + dx, y + 0.2, z + 0.55], rotation: [90, 0, 0], flat: true }); // lamp pod
    glow(
      b.part(cyl(0.055, 0.02, 8), c.light, {
        bone: B,
        at: [x + dx, y + 0.2, z + 0.61],
        rotation: [90, 0, 0],
        flat: true,
      }),
    );
  }
}

export function rackHeadache(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  for (const s of [1, -1] as const)
    b.rod([x + s * 0.9, y - 0.75, z], [x + s * 0.9, y + 0.45, z], 0.03, c.steel, { bone: B, sides: 6 });
  b.rod([x - 0.9, y + 0.45, z], [x + 0.9, y + 0.45, z], 0.03, c.steel, { bone: B, sides: 6 });
  b.rod([x - 0.9, y - 0.2, z], [x + 0.9, y - 0.2, z], 0.025, c.steel, { bone: B, sides: 6 });
  for (let i = -0.75; i <= 0.75; i += 0.15)
    b.rod([x + i, y - 0.2, z], [x + i, y + 0.45, z], 0.008, c.steel, { bone: B, sides: 4 }); // mesh
  for (const dx of [-0.6, 0.6]) {
    b.part(box(0.14, 0.1, 0.1), c.dark, { bone: B, at: [x + dx, y + 0.52, z] });
    glow(b.part(box(0.1, 0.06, 0.02), c.light, { bone: B, at: [x + dx, y + 0.52, z - 0.06] }));
  }
}

export function rackLadder(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  for (const s of [1, -1] as const)
    for (const dz of [-0.9, 0.9])
      b.rod([x + s * 0.95, y + 0.6, z + dz], [x + s * 0.95, y + 1.5, z + dz], 0.03, c.steel, { bone: B, sides: 6 });
  for (const s of [1, -1] as const)
    b.rod([x + s * 0.95, y + 1.5, z - 1.0], [x + s * 0.95, y + 1.5, z + 1.0], 0.03, c.steel, { bone: B, sides: 6 });
  for (const dz of [-0.9, 0, 0.9])
    b.rod([x - 0.95, y + 1.52, z + dz], [x + 0.95, y + 1.52, z + dz], 0.025, c.steel, { bone: B, sides: 6 });
  for (const dz of [-0.9, 0.9])
    b.rod([x - 0.95, y + 1.0, z + dz], [x + 0.95, y + 1.0, z + dz], 0.02, c.steel, { bone: B, sides: 6 });
}

export const racks = { roof: rackRoof, headache: rackHeadache, ladder: rackLadder };
```

## Sampler: catalogs/armour.ts

```ts
/**
 * catalogs/armour.ts: tracked and armoured-vehicle parts. Same contract as catalogs/truck.ts: every variant is
 * `variant(b: Builder, m: Mount, c: Roles)`, Mount = { bone, at, s, n, root, tag }, Roles = colours by part role.
 * Parts that sit on a face build in the mount's frame `f = frame(m.at, m.n)`: `f.local([u, v, w])` is u across the
 * face, v out along n, w along the face the other way (up on a flank or a front; back on a top face), and parts
 * placed with `{ frame: f.moved([u, v, w]) }` take that orientation. Needs `box`, `cyl` from truck.ts.
 *
 * SLOTS
 *   track (one side at a time: m.at = [±0.78, 0.42, zCentre] on the hub line, n = ±X, bone = chassis; the unit
 *          reaches 1.7 m each way and stands on the floor; road wheels get spin joints road{L|R}{i}{tag})
 *     trackBelt      continuous box-section belt swept round a stadium loop, pads along it, 5 road wheels, sprocket
 *                    with teeth, idler, two return rollers
 *     trackSlat      two thin chains with angled grouser slats between them, 4 road wheels, toothed sprocket
 *     trackHalf      short rear unit (1 m each way) with a raised front idler, 3 road wheels, fender over the top
 *     trackTriangle  one triangular unit per wheel position (z ±1.55): high drive wheel, two bottom rollers, belt
 *   roadWheel (hub mount like a wheel, r 0.25, bone spins)
 *     roadWheelSolid   dished steel disc with a rubber rim and 6 bolts
 *     roadWheelSpoked  6 box spokes to a rim ring
 *     roadWheelTwin    two thin discs on one hub with a gap for the guide horns
 *   skirt (anchors.flankL / R; rocker between the wheels, n = ±X; hangs from y+0.15 to y-0.25 over z ±1.0)
 *     skirtPlate     four plates in a row with gaps, two bolts each, top rail
 *     skirtSlatted   bar armour: a frame with vertical rods
 *     skirtChain     a rail with hanging rods ending in balls (chain curtain)
 *     skirtAngled    three plates tilted 20° outward on stand-off tubes
 *   plate (any face; default anchors.bedSideL / R; field 0.8 × 0.5 round m.at, out along n)
 *     plateBoltOn    flat plate on four stand-offs, four corner bolts
 *     plateSpaced    inner plate and a smaller outer plate on tubes with a gap between
 *     plateWedge     two plates meeting at a ridge that points out of the face
 *     plateMesh      cage armour: a frame with a rod grid
 *     plateLamellar  five overlapping tilted strips with rivets
 *   era (reactive blocks; default anchors.hood; field 0.8 × 0.5)
 *     eraBricks     4 × 3 bricks with gaps
 *     eraHex        seven hex prisms in two staggered rows
 *     eraStaggered  two rows offset by half a brick, a bolt in each brick
 *     eraWedge      bricks that taper outward (frustumBox)
 *   hatch (default anchors.roofRear, n up; lid hinge joint hatch{tag} at the back edge)
 *     hatchRound    round lid with a rim ring, hinge arm and a grab handle
 *     hatchSquare   square lid with two hinge knuckles, a T handle and corner bolts
 *     hatchSplit    two half lids hinged at opposite edges (two joints)
 *     hatchCupola   raised ring of six vision slits under a round lid
 *     hatchSliding  flat lid on two rails with rollers (no joint)
 *   vision (vertical face; default anchors.cabFront)
 *     visionSlit       recessed slot with three bars and a brow
 *     visionBlock      three glass blocks in a frame, tilted back
 *     visionPeriscope  box rising from the face with a glass front and a cap
 *     visionDome       camera half-sphere in a lens ring
 *   smoke (default anchors.fenderL / R, n up; tubes fire forward and out)
 *     smokeBank     four tubes in a row in a bracket
 *     smokeCluster  2 × 3 tubes in a block
 *     smokeDrum     a drum with eight holes on a post
 *     smokeSingle   one fat launcher with a cap and a lever
 *
 * PICKS (truck.ts assemble, `armour: { track?, skirt?, plate?, era?, hatch?, vision?, smoke? }`): variant names
 *   without the slot prefix; `dress(b, anchors, c, picks)` mounts each on its default anchor; a track pick replaces
 *   the wheels (half keeps the front pair).
 */
import * as THREE from "three";
import type { Builder } from "agentic-3js-builder";
import type { Joint } from "agentic-3js-builder";
import { frame } from "agentic-3js-builder";
import type { Frame } from "agentic-3js-builder";
import { catmull } from "agentic-3js-builder";
import { createBuilder } from "agentic-3js-builder";
import { box, cyl } from "./truck";
import type { Anchors, Mount, Roles, V3, Variant } from "./truck";
import { PLAIN } from "./truck";

const R90: V3 = [0, 0, 90];
const TAU = Math.PI * 2;

// ---------------------------------------------------------------- track

/** A stadium loop in the YZ plane at x: straight runs at yTop and yBottom between z0 and z1 with semicircular ends. */
function stadium(x: number, yTop: number, yBottom: number, z0: number, z1: number) {
  const r = (yTop - yBottom) / 2;
  const yc = (yTop + yBottom) / 2;
  const pts: V3[] = [];
  for (let i = 0; i <= 6; i++) {
    const a = -Math.PI / 2 + (i / 6) * Math.PI;
    pts.push([x, yc + r * Math.sin(a), z1 + r * Math.cos(a)]);
  }
  for (let i = 0; i <= 6; i++) {
    const a = Math.PI / 2 + (i / 6) * Math.PI;
    pts.push([x, yc + r * Math.sin(a), z0 + r * Math.cos(a)]);
  }
  return catmull(pts, { closed: true });
}

function sprocket(b: Builder, bone: Joint, c: Roles, at: V3, r: number, teeth: number) {
  b.part(cyl(r, 0.12, teeth), c.steel, { bone, at, rotation: R90, flat: true });
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * TAU;
    b.part(box(0.1, 0.05, 0.04), c.steel, {
      bone,
      at: [at[0], at[1] + (r + 0.02) * Math.cos(a), at[2] + (r + 0.02) * Math.sin(a)],
      rotation: [(a * 180) / Math.PI, 0, 0],
    });
  }
}

export function roadWheelSolid(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  b.part(cyl(0.25, 0.1, 12), c.tyre, { bone: m.bone, at: [x, y, z], rotation: R90, flat: true }); // rubber rim
  b.part(cyl(0.19, 0.14, 12), c.steel, { bone: m.bone, at: [x, y, z], rotation: R90, flat: true }); // dish
  b.part(cyl(0.07, 0.18, 8), c.dark, { bone: m.bone, at: [x, y, z], rotation: R90, flat: true });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    b.part(cyl(0.015, 0.02, 6), c.dark, {
      bone: m.bone,
      at: [x + m.s * 0.08, y + 0.12 * Math.cos(a), z + 0.12 * Math.sin(a)],
      rotation: R90,
    });
  }
}

export function roadWheelSpoked(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  b.part(new THREE.TorusGeometry(0.21, 0.04, 6, 12), c.tyre, {
    bone: m.bone,
    at: [x, y, z],
    rotation: [0, 90, 0],
    flat: true,
  });
  b.part(cyl(0.06, 0.16, 8), c.steel, { bone: m.bone, at: [x, y, z], rotation: R90, flat: true });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    b.part(box(0.05, 0.16, 0.04), c.steel, {
      bone: m.bone,
      at: [x, y + 0.12 * Math.cos(a), z + 0.12 * Math.sin(a)],
      rotation: [(a * 180) / Math.PI, 0, 0],
    });
  }
}

export function roadWheelTwin(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  for (const dx of [-0.08, 0.08]) {
    b.part(cyl(0.25, 0.05, 12), c.tyre, { bone: m.bone, at: [x + dx, y, z], rotation: R90, flat: true });
    b.part(cyl(0.2, 0.06, 12), c.steel, { bone: m.bone, at: [x + dx, y, z], rotation: R90, flat: true });
  }
  b.part(cyl(0.06, 0.24, 8), c.dark, { bone: m.bone, at: [x, y, z], rotation: R90, flat: true });
}

export const roadWheels = { solid: roadWheelSolid, spoked: roadWheelSpoked, twin: roadWheelTwin };

/** Road wheels with spin joints at the given z offsets, at height yHub. */
function roadWheels5(b: Builder, m: Mount, c: Roles, zs: number[], yHub: number, wheel: Variant = roadWheelSolid) {
  const side = m.s > 0 ? "L" : "R";
  zs.forEach((dz, i) => {
    const at: V3 = [m.at[0], yHub, m.at[2] + dz];
    const j = b.joint(`road${side}${i}${m.tag}`, { parent: m.bone, at, dir: [0, 1, 0], role: "hinge" });
    wheel(b, { ...m, bone: j, at }, c);
  });
}

export function trackBelt(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  const loop = stadium(x, y + 0.26, y - 0.31, z - 1.4, z + 1.4);
  b.sweep(loop, () => [0.17, 0.05], { bone: B, section: "box", color: c.tyre });
  b.along(loop, 40, (at) => b.part(box(0.36, 0.08, 0.04), c.dark, { frame: at.moved([0, 0, -0.06]), bone: B })); // pads
  roadWheels5(b, m, c, [-1.0, -0.5, 0, 0.5, 1.0], y - 0.12);
  sprocket(b, B, c, [x, y - 0.05, z - 1.4], 0.24, 10);
  b.part(cyl(0.24, 0.14, 12), c.steel, { bone: B, at: [x, y - 0.05, z + 1.4], rotation: R90, flat: true }); // idler
  for (const dz of [-0.6, 0.6])
    b.part(cyl(0.08, 0.12, 8), c.dark, { bone: B, at: [x, y + 0.14, z + dz], rotation: R90, flat: true }); // return rollers
  b.part(box(0.1, 0.16, 2.6), c.dark, { bone: B, at: [x - m.s * 0.15, y + 0.02, z] }); // suspension beam
}

export function trackSlat(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  const loop = stadium(x, y + 0.26, y - 0.31, z - 1.3, z + 1.3);
  for (const dx of [-0.15, 0.15])
    b.sweep(stadium(x + dx, y + 0.26, y - 0.31, z - 1.3, z + 1.3), () => [0.025, 0.035], {
      bone: B,
      section: "box",
      color: c.steel,
    }); // two chains
  const tilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.7);
  b.along(loop, 36, (at) =>
    b.part(box(0.36, 0.1, 0.015), c.dark, {
      at: at.moved([0, 0, -0.04]),
      quat: at.quat.clone().multiply(tilt),
      bone: B,
    }),
  ); // grouser slats
  roadWheels5(b, m, c, [-0.9, -0.3, 0.3, 0.9], y - 0.12, roadWheelSpoked);
  sprocket(b, B, c, [x, y - 0.05, z - 1.3], 0.24, 8);
  b.part(cyl(0.24, 0.1, 10), c.steel, { bone: B, at: [x, y - 0.05, z + 1.3], rotation: R90, flat: true });
  b.part(box(0.1, 0.14, 2.4), c.dark, { bone: B, at: [x - m.s * 0.15, y + 0.02, z] });
}

export function trackHalf(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  const pts: V3[] = [];
  for (let i = 0; i <= 6; i++)
    pts.push([
      x,
      y - 0.01 + 0.3 * Math.sin(-Math.PI / 2 + (i / 6) * Math.PI),
      z + 0.95 + 0.3 * Math.cos(-Math.PI / 2 + (i / 6) * Math.PI),
    ]); // raised front idler
  for (let i = 0; i <= 6; i++)
    pts.push([
      x,
      y - 0.15 + 0.16 * Math.sin(Math.PI / 2 + (i / 6) * Math.PI),
      z - 1.0 + 0.16 * Math.cos(Math.PI / 2 + (i / 6) * Math.PI),
    ]); // low rear
  const loop = catmull(pts, { closed: true });
  b.sweep(loop, () => [0.17, 0.05], { bone: B, section: "box", color: c.tyre });
  b.along(loop, 26, (at) => b.part(box(0.36, 0.09, 0.04), c.dark, { frame: at.moved([0, 0, -0.06]), bone: B }));
  roadWheels5(b, m, c, [-0.6, -0.1, 0.4], y - 0.14, roadWheelTwin);
  sprocket(b, B, c, [x, y - 0.01, z + 0.95], 0.24, 9);
  b.part(cyl(0.12, 0.12, 8), c.steel, { bone: B, at: [x, y - 0.2, z - 1.0], rotation: R90, flat: true });
  b.part(box(0.44, 0.04, 1.6), c.trim, { bone: B, at: [x, y + 0.36, z + 0.1] }); // fender
  b.part(box(0.1, 0.12, 1.8), c.dark, { bone: B, at: [x - m.s * 0.15, y, z] });
}

export function trackTriangle(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  for (const dz of [-1.55, 1.55]) {
    const zc = z + dz;
    const loop = catmull(
      [
        [x, y + 0.3, zc],
        [x, y + 0.1, zc + 0.5],
        [x, y - 0.275, zc + 0.5],
        [x, y - 0.275, zc - 0.5],
        [x, y + 0.1, zc - 0.5],
      ],
      { closed: true },
    );
    b.sweep(loop, () => [0.16, 0.05], { bone: B, section: "box", color: c.tyre });
    b.along(loop, 22, (at) => b.part(box(0.34, 0.07, 0.04), c.dark, { frame: at.moved([0, 0, -0.06]), bone: B }));
    const side = m.s > 0 ? "L" : "R";
    const drive = b.joint(`drive${side}${dz > 0 ? "F" : "R"}${m.tag}`, {
      parent: B,
      at: [x, y + 0.15, zc],
      dir: [0, 1, 0],
      role: "hinge",
    });
    sprocket(b, drive, c, [x, y + 0.15, zc], 0.14, 8);
    for (const d of [-0.35, 0.35])
      b.part(cyl(0.12, 0.14, 10), c.steel, { bone: B, at: [x, y - 0.25, zc + d], rotation: R90, flat: true }); // bottom rollers
    b.part(box(0.08, 0.5, 0.1), c.dark, { bone: B, at: [x, y - 0.1, zc], rotation: [0, 0, 0] }); // frame
    b.rod([x, y - 0.25, zc - 0.35], [x, y - 0.25, zc + 0.35], 0.03, c.dark, { bone: B, sides: 6 });
  }
}

export const tracks = { belt: trackBelt, slat: trackSlat, half: trackHalf, triangle: trackTriangle };

// ---------------------------------------------------------------- skirt (flank)

export function skirtPlate(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const s = m.s;
  const B = m.bone;
  b.part(box(0.06, 0.06, 2.1), c.dark, { bone: B, at: [x + s * 0.06, y + 0.15, z] }); // top rail
  for (let i = 0; i < 4; i++) {
    const zc = z - 0.78 + i * 0.52;
    b.part(box(0.04, 0.4, 0.48), c.trim, { bone: B, at: [x + s * 0.09, y - 0.07, zc] });
    for (const dz of [-0.16, 0.16])
      b.part(cyl(0.02, 0.02, 6), c.steel, { bone: B, at: [x + s * 0.12, y + 0.08, zc + dz], rotation: R90 });
  }
}

export function skirtSlatted(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const s = m.s;
  const B = m.bone;
  for (const dy of [0.15, -0.25]) b.part(box(0.05, 0.05, 2.1), c.dark, { bone: B, at: [x + s * 0.1, y + dy, z] });
  for (let i = 0; i < 15; i++)
    b.rod([x + s * 0.1, y + 0.15, z - 1.0 + i * 0.143], [x + s * 0.1, y - 0.25, z - 1.0 + i * 0.143], 0.012, c.steel, {
      bone: B,
      sides: 5,
    });
  for (const dz of [-1.0, 0, 1.0])
    b.part(box(0.1, 0.04, 0.04), c.dark, { bone: B, at: [x + s * 0.05, y + 0.15, z + dz] }); // stand-offs
}

export function skirtChain(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const s = m.s;
  const B = m.bone;
  b.part(box(0.08, 0.05, 2.1), c.dark, { bone: B, at: [x + s * 0.06, y + 0.15, z] });
  for (let i = 0; i < 17; i++) {
    const zc = z - 1.0 + i * 0.125;
    b.rod([x + s * 0.09, y + 0.12, zc], [x + s * 0.09, y - 0.2, zc], 0.008, c.steel, { bone: B, sides: 4 });
    b.part(new THREE.SphereGeometry(0.03, 6, 4), c.steel, { bone: B, at: [x + s * 0.09, y - 0.22, zc], flat: true });
  }
}

export function skirtAngled(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const s = m.s;
  const B = m.bone;
  for (let i = 0; i < 3; i++) {
    const zc = z - 0.7 + i * 0.7;
    b.part(box(0.04, 0.42, 0.66), c.trim, { bone: B, at: [x + s * 0.14, y - 0.05, zc], rotation: [0, 0, s * 20] });
    for (const dz of [-0.25, 0.25])
      b.rod([x, y + 0.1, zc + dz], [x + s * 0.1, y + 0.12, zc + dz], 0.015, c.steel, { bone: B, sides: 6 }); // stand-off tubes
  }
}

export const skirts = { plate: skirtPlate, slatted: skirtSlatted, chain: skirtChain, angled: skirtAngled };

// ---------------------------------------------------------------- plate (any face, built in the mount frame)

export function plateBoltOn(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(0.8, 0.05, 0.5), c.trim, { frame: f.moved([0, 0.08, 0]), bone: m.bone });
  for (const u of [-0.34, 0.34])
    for (const w of [-0.19, 0.19]) {
      b.part(cyl(0.025, 0.06, 6), c.steel, { frame: f.moved([u, 0.03, w]), bone: m.bone }); // stand-off
      b.part(cyl(0.02, 0.02, 6), c.steel, { frame: f.moved([u, 0.11, w]), bone: m.bone }); // bolt
    }
}

export function plateSpaced(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(0.8, 0.04, 0.5), c.trim, { frame: f.moved([0, 0.03, 0]), bone: m.bone });
  b.part(box(0.7, 0.04, 0.42), c.trim, { frame: f.moved([0, 0.15, 0]), bone: m.bone });
  for (const u of [-0.28, 0.28])
    for (const w of [-0.15, 0.15]) b.part(cyl(0.02, 0.1, 6), c.dark, { frame: f.moved([u, 0.09, w]), bone: m.bone });
}

export function plateWedge(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  const tilt = (deg: number) =>
    f.quat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), (deg * Math.PI) / 180));
  for (const s of [1, -1])
    b.part(box(0.42, 0.04, 0.5), c.trim, { at: f.local([s * 0.2, 0.1, 0]), quat: tilt(s * -22), bone: m.bone });
  b.part(box(0.04, 0.12, 0.5), c.steel, { frame: f.moved([0, 0.15, 0]), bone: m.bone }); // ridge
  for (const w of [-0.18, 0.18]) b.part(box(0.76, 0.04, 0.04), c.dark, { frame: f.moved([0, 0.03, w]), bone: m.bone }); // mounting rails
}

export function plateMesh(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  for (const u of [-0.4, 0.4]) b.part(box(0.04, 0.04, 0.5), c.steel, { frame: f.moved([u, 0.1, 0]), bone: m.bone });
  for (const w of [-0.25, 0.25]) b.part(box(0.84, 0.04, 0.04), c.steel, { frame: f.moved([0, 0.1, w]), bone: m.bone });
  for (let i = 1; i < 8; i++)
    b.rod(f.local([-0.4 + i * 0.1, 0.1, -0.25]), f.local([-0.4 + i * 0.1, 0.1, 0.25]), 0.008, c.steel, {
      bone: m.bone,
      sides: 4,
    });
  for (let i = 1; i < 5; i++)
    b.rod(f.local([-0.4, 0.1, -0.25 + i * 0.1]), f.local([0.4, 0.1, -0.25 + i * 0.1]), 0.008, c.steel, {
      bone: m.bone,
      sides: 4,
    });
  for (const u of [-0.3, 0.3]) b.part(cyl(0.02, 0.1, 6), c.dark, { frame: f.moved([u, 0.05, 0]), bone: m.bone });
}

export function plateLamellar(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  const tilt = f.quat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.26));
  for (let i = 0; i < 5; i++) {
    b.part(box(0.8, 0.03, 0.16), c.trim, {
      at: f.local([0, 0.06 + i * 0.015, 0.22 - i * 0.11]),
      quat: tilt,
      bone: m.bone,
    });
    for (const u of [-0.3, 0, 0.3])
      b.part(cyl(0.012, 0.015, 6), c.steel, { frame: f.moved([u, 0.085 + i * 0.015, 0.2 - i * 0.11]), bone: m.bone });
  }
}

export const plates = {
  boltOn: plateBoltOn,
  spaced: plateSpaced,
  wedge: plateWedge,
  mesh: plateMesh,
  lamellar: plateLamellar,
};

// ---------------------------------------------------------------- era (reactive blocks)

export function eraBricks(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 3; j++)
      b.part(box(0.18, 0.1, 0.14), c.trim, { frame: f.moved([-0.3 + i * 0.2, 0.05, -0.16 + j * 0.16]), bone: m.bone });
}

export function eraHex(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  for (const [u, w] of [
    [-0.3, -0.09],
    [-0.1, -0.09],
    [0.1, -0.09],
    [0.3, -0.09],
    [-0.2, 0.09],
    [0, 0.09],
    [0.2, 0.09],
  ]) {
    b.part(cyl(0.1, 0.08, 6), c.trim, { frame: f.moved([u, 0.04, w]), bone: m.bone, flat: true });
    b.part(cyl(0.02, 0.02, 6), c.steel, { frame: f.moved([u, 0.09, w]), bone: m.bone });
  }
}

export function eraStaggered(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  for (let j = 0; j < 2; j++)
    for (let i = 0; i < 4; i++) {
      const u = -0.3 + i * 0.2 + (j ? 0.1 : 0);
      b.part(box(0.18, 0.12, 0.2), c.trim, { frame: f.moved([u, 0.06, -0.11 + j * 0.22]), bone: m.bone });
      b.part(cyl(0.025, 0.02, 6), c.steel, { frame: f.moved([u, 0.13, -0.11 + j * 0.22]), bone: m.bone });
    }
}

export function eraWedge(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 2; j++)
      b.frustumBox(
        f.local([-0.3 + i * 0.2, 0.0, -0.12 + j * 0.24]),
        f.local([-0.3 + i * 0.2, 0.14, -0.12 + j * 0.24]),
        [0.18, 0.22],
        [0.12, 0.14],
        { bone: m.bone, color: c.trim },
      );
}

export const eras = { bricks: eraBricks, hex: eraHex, staggered: eraStaggered, wedge: eraWedge };

// ---------------------------------------------------------------- hatch (top face; hinge at the back edge)

/** A lid hinge joint whose axis runs across the mount frame (its local X), at w along the face. */
function lidJoint(b: Builder, m: Mount, w: number, name: string) {
  const f = frame(m.at, m.n);
  return b.joint(name, {
    parent: m.bone,
    at: f.local([0, 0.02, w]),
    dir: f.dir([0, 0, 1]),
    up: f.dir([0, 1, 0]),
    role: "hinge",
  });
}

export function hatchRound(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  const lid = lidJoint(b, m, 0.32, `hatch${m.tag}`);
  b.part(new THREE.TorusGeometry(0.3, 0.03, 6, 14), c.trim, {
    at: f.local([0, 0.03, 0]),
    dir: m.n,
    axis: "z",
    bone: m.bone,
  });
  b.part(cyl(0.3, 0.04, 14), c.trim, { frame: f.moved([0, 0.07, 0]), bone: lid, flat: true });
  b.part(box(0.08, 0.04, 0.14), c.steel, { frame: f.moved([0, 0.1, 0.27]), bone: lid }); // hinge arm
  b.part(box(0.04, 0.06, 0.12), c.steel, { frame: f.moved([0, 0.04, 0.34]), bone: m.bone }); // hinge post
  b.rod(f.local([-0.1, 0.12, -0.1]), f.local([0.1, 0.12, -0.1]), 0.012, c.steel, { bone: lid, sides: 5 }); // grab handle
}

export function hatchSquare(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  const lid = lidJoint(b, m, 0.31, `hatch${m.tag}`);
  b.part(box(0.6, 0.04, 0.6), c.trim, { frame: f.moved([0, 0.05, 0]), bone: lid });
  for (const u of [-0.2, 0.2])
    b.part(cyl(0.03, 0.1, 6), c.steel, {
      frame: f.moved([u, 0.04, 0.31]),
      bone: m.bone,
      quat: f.quat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2)),
    }); // knuckles
  for (const u of [-0.25, 0.25])
    for (const w of [-0.25, 0.25]) b.part(cyl(0.02, 0.02, 6), c.steel, { frame: f.moved([u, 0.08, w]), bone: lid });
  b.rod(f.local([0, 0.1, -0.05]), f.local([0, 0.16, -0.05]), 0.012, c.steel, { bone: lid, sides: 5 });
  b.rod(f.local([-0.08, 0.16, -0.05]), f.local([0.08, 0.16, -0.05]), 0.012, c.steel, { bone: lid, sides: 5 }); // T handle
}

export function hatchSplit(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(0.64, 0.03, 0.64), c.dark, { frame: f.moved([0, 0.015, 0]), bone: m.bone }); // coaming
  for (const s of [1, -1]) {
    const lid = lidJoint(b, m, s * 0.31, `hatch${s > 0 ? "A" : "B"}${m.tag}`);
    b.part(box(0.6, 0.04, 0.28), c.trim, { frame: f.moved([0, 0.05, s * 0.155]), bone: lid });
    b.part(box(0.1, 0.03, 0.04), c.steel, { frame: f.moved([0, 0.085, s * 0.08]), bone: lid });
  }
}

export function hatchCupola(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(cyl(0.32, 0.22, 12), c.trim, { frame: f.moved([0, 0.11, 0]), bone: m.bone, flat: true });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    b.part(box(0.14, 0.05, 0.03), c.glass, {
      frame: f.moved([0.31 * Math.sin(a), 0.15, 0.31 * Math.cos(a)]),
      bone: m.bone,
      quat: f.quat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), a)),
    }); // vision slits
  }
  const lid = lidJoint(b, m, 0.28, `hatch${m.tag}`);
  b.part(cyl(0.3, 0.04, 12), c.trim, { frame: f.moved([0, 0.24, 0]), bone: lid, flat: true });
  b.part(box(0.06, 0.04, 0.1), c.steel, { frame: f.moved([0, 0.27, 0.26]), bone: lid });
}

export function hatchSliding(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  for (const u of [-0.32, 0.32])
    b.part(box(0.04, 0.05, 1.0), c.steel, { frame: f.moved([u, 0.025, 0.1]), bone: m.bone }); // rails
  b.part(box(0.6, 0.04, 0.5), c.trim, { frame: f.moved([0, 0.07, -0.1]), bone: m.bone });
  for (const u of [-0.3, 0.3])
    for (const w of [-0.3, 0.1])
      b.part(cyl(0.03, 0.03, 8), c.dark, {
        frame: f.moved([u, 0.05, w]),
        bone: m.bone,
        quat: f.quat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2)),
      }); // rollers
  b.part(box(0.2, 0.03, 0.04), c.steel, { frame: f.moved([0, 0.1, -0.3]), bone: m.bone });
}

export const hatches = {
  round: hatchRound,
  square: hatchSquare,
  split: hatchSplit,
  cupola: hatchCupola,
  sliding: hatchSliding,
};

// ---------------------------------------------------------------- vision (vertical face)

export function visionSlit(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(0.56, 0.06, 0.14), c.dark, { frame: f.moved([0, 0.02, 0]), bone: m.bone });
  b.part(box(0.5, 0.02, 0.06), c.glass, { frame: f.moved([0, 0.06, 0]), bone: m.bone });
  for (const u of [-0.17, 0, 0.17])
    b.part(box(0.02, 0.04, 0.1), c.steel, { frame: f.moved([u, 0.07, 0]), bone: m.bone });
  b.part(box(0.6, 0.12, 0.03), c.trim, { frame: f.moved([0, 0.08, 0.09]), bone: m.bone }); // brow
}

export function visionBlock(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  const tilt = f.quat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.35));
  b.part(box(0.6, 0.06, 0.2), c.dark, { frame: f.moved([0, 0.03, 0]), bone: m.bone });
  for (const u of [-0.19, 0, 0.19]) {
    b.part(box(0.16, 0.08, 0.14), c.glass, { at: f.local([u, 0.09, 0]), quat: tilt, bone: m.bone });
    b.part(box(0.18, 0.02, 0.16), c.steel, { at: f.local([u, 0.14, 0]), quat: tilt, bone: m.bone });
  }
}

export function visionPeriscope(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(0.2, 0.14, 0.3), c.trim, { frame: f.moved([0, 0.07, 0.1]), bone: m.bone });
  b.part(box(0.16, 0.02, 0.1), c.glass, { frame: f.moved([0, 0.15, 0.08]), bone: m.bone });
  b.part(box(0.24, 0.04, 0.06), c.dark, { frame: f.moved([0, 0.14, 0.17]), bone: m.bone }); // cap
  b.part(box(0.22, 0.04, 0.32), c.dark, { frame: f.moved([0, 0.02, 0.1]), bone: m.bone });
}

export function visionDome(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(new THREE.TorusGeometry(0.12, 0.025, 6, 12), c.steel, {
    frame: f.moved([0, 0.02, 0]),
    bone: m.bone,
    quat: f.quat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2)),
  });
  b.part(new THREE.SphereGeometry(0.11, 10, 6, 0, TAU, 0, Math.PI / 2), c.glass, {
    frame: f.moved([0, 0.02, 0]),
    bone: m.bone,
    flat: true,
  });
  b.part(cyl(0.04, 0.03, 8), c.dark, { frame: f.moved([0, 0.12, 0]), bone: m.bone });
}

export const visions = { slit: visionSlit, block: visionBlock, periscope: visionPeriscope, dome: visionDome };

// ---------------------------------------------------------------- smoke launchers (top face; fire forward = -w)

function tube(b: Builder, m: Mount, c: Roles, f: Frame, u: number, w: number, r = 0.03) {
  b.rod(f.local([u, 0.04, w]), f.local([u, 0.24, w - 0.16]), r, c.weapon, { bone: m.bone, sides: 7 });
  b.part(cyl(r * 1.2, 0.03, 7), c.dark, {
    at: f.local([u, 0.25, w - 0.17]),
    dir: f.dir([0, 0.78, -0.62]),
    bone: m.bone,
  });
}

export function smokeBank(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(0.36, 0.06, 0.12), c.dark, { frame: f.moved([0, 0.03, 0.02]), bone: m.bone });
  for (let i = 0; i < 4; i++) tube(b, m, c, f, -0.12 + i * 0.08, 0);
}

export function smokeCluster(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(0.3, 0.08, 0.2), c.dark, { frame: f.moved([0, 0.04, 0.04]), bone: m.bone });
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) tube(b, m, c, f, -0.09 + i * 0.09, j * 0.08, 0.028);
}

export function smokeDrum(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(cyl(0.04, 0.14, 6), c.steel, { frame: f.moved([0, 0.07, 0]), bone: m.bone });
  b.part(cyl(0.16, 0.1, 12), c.weapon, { frame: f.moved([0, 0.19, 0]), bone: m.bone, flat: true });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    b.part(cyl(0.022, 0.03, 6), c.dark, {
      frame: f.moved([0.11 * Math.sin(a), 0.245, 0.11 * Math.cos(a)]),
      bone: m.bone,
    });
  }
}

export function smokeSingle(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(0.14, 0.06, 0.14), c.dark, { frame: f.moved([0, 0.03, 0.03]), bone: m.bone });
  tube(b, m, c, f, 0, 0, 0.05);
  b.rod(f.local([0.06, 0.1, 0.02]), f.local([0.14, 0.18, 0.06]), 0.01, c.steel, { bone: m.bone, sides: 5 }); // lever
}

export const smokes = { bank: smokeBank, cluster: smokeCluster, drum: smokeDrum, single: smokeSingle };

// ---------------------------------------------------------------- picks and dress

export type Picks = {
  track?: keyof typeof tracks;
  skirt?: keyof typeof skirts;
  plate?: keyof typeof plates;
  era?: keyof typeof eras;
  hatch?: keyof typeof hatches;
  vision?: keyof typeof visions;
  smoke?: keyof typeof smokes;
};

/** Mounts each picked armour part on its default truck anchor (tracks are placed by truck.ts, with the wheels). */
export function dress(b: Builder, a: Anchors, c: Roles, p: Picks) {
  if (p.skirt) for (const side of ["L", "R"] as const) skirts[p.skirt](b, a[`flank${side}`], c);
  if (p.plate) for (const side of ["L", "R"] as const) plates[p.plate](b, a[`bedSide${side}`], c);
  if (p.era) eras[p.era](b, a.hood, c);
  if (p.hatch) hatches[p.hatch](b, a.roofRear, c);
  if (p.vision) visions[p.vision](b, a.cabFront, c);
  if (p.smoke) for (const side of ["L", "R"] as const) smokes[p.smoke](b, a[`fender${side}`], c);
}
```

## Sampler: catalogs/mountedWeapons.ts

```ts
/**
 * catalogs/mountedWeapons.ts: turrets, barrels, missile pods, laser emitters, railguns and a handheld laser rifle
 * with a rack. Same contract as catalogs/truck.ts (Mount = { bone, at, s, n, root, tag }, Roles by part role; needs
 * `box`, `cyl` from truck.ts). Weapons build in model space: +Y up, the muzzle toward +Z from `m.at`.
 *
 * SLOTS
 *   turret (a top face: anchors.roof or a pedestal on anchors.bed; m.at = ring centre on the deck)
 *     turret*(b, m, c) → Mount: makes joints yaw{tag} (hinge about the deck normal) and pitch{tag} (hinge X) and
 *     returns the weapon mount: bone = pitch, at = trunnion, n = [0, 0, 1]. Barrels, pods, lasers and railguns
 *     all take that mount, so any weapon fits any turret.
 *     turretRing    bolted ring on the deck, low drum base, two cheek plates holding a trunnion rod
 *     turretPintle  post with a fork; the trunnion pin runs between the fork arms
 *     turretRemote  boxy remote station: yaw box with a sensor window, pitch cradle through it
 *     turretDome    hemisphere with a front slot; the pitch joint sits inside
 *     turretArm     a hinged arm (joint arm{tag}) raises the pitch cradle above the deck
 *     turretTwin    wide cradle with two trunnion plates and ammo boxes outboard
 *   barrel (on a turret's mount; breech behind the trunnion, tube forward)
 *     barrelCannon      long tube, fume extractor bulge, muzzle brake with side ports, breech block, recoil cylinder
 *     barrelMinigun     six tubes round a spin joint (spin{tag}), front clamp ring, rear housing, feed chute
 *     barrelAutocannon  boxy receiver, perforated shroud, thin tube, ammo box on the side
 *     barrelMortar      short fat tube with a breech sphere and a base ring
 *     barrelTwin        two tubes clamped by two plates, one breech box
 *     barrelFlamer      flared nozzle with a glowing pilot, fuel drum behind, feed hose
 *   pod (on a turret mount, or anywhere with n = forward)
 *     podBox    box with 2 × 2 recessed tubes and missile noses inside
 *     podTubes  seven round tubes in a hex pattern between two end plates
 *     podRail   a rail with two finned missiles hanging under it
 *     podRack   four rockets stacked between two side plates
 *   laser (on a turret mount)
 *     laserLens   housing with three focusing rings and a glowing lens disc
 *     laserCoil   glowing core rod inside eight rings, capacitor box behind
 *     laserPrism  glowing octahedron crystal in a four-rod cage
 *     laserArray  3 × 3 small emitters with glowing tips on a plate
 *   railgun (on a turret mount)
 *     railgunRails  two parallel rails with a glowing gap, sliding armature, three capacitor drums, breech
 *     railgunCoil   six coil rings shrinking toward the muzzle round a core tube, glowing ring faces, power cables
 *   rifle (handheld; m.at = the rifle's centre, muzzle toward +Z, about 0.9 m long)
 *     rifleCarbine  receiver, barrel, stock, grip, magazine, top rail, glowing muzzle lens
 *     rifleLong     long barrel with heat-sink fins, scope, bipod, stock
 *     rifleBullpup  magazine behind the grip, carry handle, short barrel, glowing side strip
 *   rack (a vertical face, default anchors.bedSideL; rack*(b, m, c) → Mount for a rifle lying along the face)
 *     rackClip    backplate with two C clips
 *     rackCradle  shelf with two half-ring cradles and a strap
 *
 * PICKS (truck.ts assemble, `weapons: { roof?: TurretPick, bed?: TurretPick, rifle?: { rifle, rack? } }`):
 *   TurretPick = { turret, barrel? | laser? | railgun?, pod? }: the first of barrel/laser/railgun goes on the mount,
 *   a pod rides outboard on the pitch joint. A bed turret stands on a pedestal above the bed walls.
 */
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";
import type { Joint } from "agentic-3js-builder";
import { frame } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { box, cyl } from "./truck";
import type { Anchors, Mount, Roles, V3 } from "./truck";
import { PLAIN } from "./truck";

const TAU = Math.PI * 2;
export type MountVariant = (b: Builder, m: Mount, c: Roles) => Mount;

// ---------------------------------------------------------------- turret

/** yaw{tag} on the deck normal and pitch{tag} across, at `h` above the deck; returns the weapon mount. */
function turretJoints(b: Builder, m: Mount, h: number): [Joint, Joint, Mount] {
  const f = frame(m.at, m.n);
  const yaw = b.joint(`yaw${m.tag}`, {
    parent: m.bone,
    at: f.local([0, 0.02, 0]),
    dir: f.dir([1, 0, 0]),
    up: f.dir([0, 0, 1]),
    role: "hinge",
  });
  const at: V3 = [m.at[0], m.at[1] + h, m.at[2]];
  const pitch = b.joint(`pitch${m.tag}`, { parent: yaw, at, dir: [0, 0, 1], role: "hinge" });
  return [yaw, pitch, { bone: pitch, at, s: 1, n: [0, 0, 1], root: m.root, tag: m.tag }];
}

export function turretRing(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const [yaw, pitch, w] = turretJoints(b, m, 0.38);
  b.part(new THREE.TorusGeometry(0.42, 0.035, 6, 16), c.steel, {
    bone: m.bone,
    at: [x, y + 0.03, z],
    rotation: [90, 0, 0],
  });
  for (let i = 0; i < 8; i++)
    b.part(cyl(0.02, 0.02, 6), c.dark, {
      bone: m.bone,
      at: [x + 0.42 * Math.cos((i / 8) * TAU), y + 0.07, z + 0.42 * Math.sin((i / 8) * TAU)],
    });
  b.part(cyl(0.36, 0.14, 12), c.weapon, { bone: yaw, at: [x, y + 0.12, z], flat: true }); // base drum
  for (const s of [1, -1]) b.part(box(0.05, 0.3, 0.36), c.weapon, { bone: yaw, at: [x + s * 0.2, y + 0.3, z] }); // cheek plates
  b.rod([x - 0.24, y + 0.38, z], [x + 0.24, y + 0.38, z], 0.035, c.steel, { bone: pitch, sides: 8 }); // trunnion rod
  return w;
}

export function turretPintle(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const [yaw, pitch, w] = turretJoints(b, m, 0.62);
  b.part(cyl(0.16, 0.04, 10), c.steel, { bone: m.bone, at: [x, y + 0.02, z], flat: true });
  b.part(cyl(0.05, 0.4, 8), c.steel, { bone: m.bone, at: [x, y + 0.22, z] }); // post
  b.part(cyl(0.07, 0.1, 8), c.weapon, { bone: yaw, at: [x, y + 0.45, z] });
  for (const s of [1, -1])
    b.rod([x, y + 0.48, z], [x + s * 0.14, y + 0.62, z], 0.025, c.weapon, { bone: yaw, sides: 6 }); // fork arms
  b.rod([x - 0.16, y + 0.62, z], [x + 0.16, y + 0.62, z], 0.02, c.steel, { bone: pitch, sides: 6 }); // pin
  return w;
}

export function turretRemote(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const [yaw, pitch, w] = turretJoints(b, m, 0.3);
  b.part(box(0.6, 0.06, 0.6), c.steel, { bone: m.bone, at: [x, y + 0.03, z] });
  b.part(box(0.5, 0.3, 0.5), c.weapon, { bone: yaw, at: [x, y + 0.21, z] }); // yaw box
  b.part(box(0.16, 0.2, 0.2), c.dark, { bone: yaw, at: [x + 0.32, y + 0.3, z + 0.1] }); // sensor box
  b.part(box(0.12, 0.1, 0.02), c.glass, { bone: yaw, at: [x + 0.32, y + 0.32, z + 0.21] });
  b.part(box(0.24, 0.16, 0.3), c.weapon, { bone: pitch, at: [x, y + 0.3, z + 0.1] }); // pitch cradle
  return w;
}

export function turretDome(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const [yaw, , w] = turretJoints(b, m, 0.25);
  b.part(cyl(0.48, 0.06, 14), c.steel, { bone: m.bone, at: [x, y + 0.03, z], flat: true });
  b.part(new THREE.SphereGeometry(0.45, 14, 7, 0, TAU, 0, Math.PI / 2), c.weapon, {
    bone: yaw,
    at: [x, y + 0.06, z],
    flat: true,
  });
  b.part(box(0.3, 0.16, 0.1), c.dark, { bone: yaw, at: [x, y + 0.25, z + 0.4] }); // front slot
  return w;
}

export function turretArm(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const f = frame(m.at, m.n);
  const yaw = b.joint(`yaw${m.tag}`, {
    parent: m.bone,
    at: f.local([0, 0.02, 0]),
    dir: f.dir([1, 0, 0]),
    up: f.dir([0, 0, 1]),
    role: "hinge",
  });
  const arm = b.joint(`arm${m.tag}`, { parent: yaw, at: [x, y + 0.15, z - 0.2], dir: [0, 0, 1], role: "hinge" });
  const at: V3 = [x, y + 0.65, z + 0.1];
  const pitch = b.joint(`pitch${m.tag}`, { parent: arm, at, dir: [0, 0, 1], role: "hinge" });
  b.part(cyl(0.3, 0.1, 10), c.weapon, { bone: yaw, at: [x, y + 0.08, z], flat: true });
  b.part(box(0.2, 0.14, 0.16), c.steel, { bone: yaw, at: [x, y + 0.15, z - 0.2] });
  b.rod([x, y + 0.15, z - 0.2], [x, y + 0.65, z + 0.1], 0.05, c.weapon, { bone: arm, section: "box", caps: "flat" }); // arm
  b.rod([x + 0.08, y + 0.2, z - 0.1], [x + 0.08, y + 0.55, z + 0.1], 0.02, c.steel, { bone: arm, sides: 6 }); // hydraulic
  b.part(box(0.2, 0.12, 0.16), c.steel, { bone: pitch, at: [x, y + 0.65, z + 0.1] });
  return { bone: pitch, at, s: 1, n: [0, 0, 1], root: m.root, tag: m.tag } as Mount;
}

export function turretTwin(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const [yaw, pitch, w] = turretJoints(b, m, 0.34);
  b.part(cyl(0.4, 0.04, 12), c.steel, { bone: m.bone, at: [x, y + 0.02, z], flat: true });
  b.part(box(0.9, 0.14, 0.5), c.weapon, { bone: yaw, at: [x, y + 0.11, z] });
  for (const s of [1, -1]) {
    b.part(box(0.05, 0.3, 0.3), c.weapon, { bone: yaw, at: [x + s * 0.3, y + 0.3, z] }); // trunnion plates
    b.part(box(0.2, 0.22, 0.34), c.dark, { bone: yaw, at: [x + s * 0.5, y + 0.3, z - 0.05] }); // ammo boxes
  }
  b.rod([x - 0.33, y + 0.34, z], [x + 0.33, y + 0.34, z], 0.03, c.steel, { bone: pitch, sides: 8 });
  return w;
}

export const turrets = {
  ring: turretRing,
  pintle: turretPintle,
  remote: turretRemote,
  dome: turretDome,
  arm: turretArm,
  twin: turretTwin,
};

// ---------------------------------------------------------------- barrel (muzzle toward +Z)

export function barrelCannon(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(0.2, 0.2, 0.34), c.weapon, { bone: B, at: [x, y, z - 0.17] }); // breech
  b.rod([x, y, z], [x, y, z + 1.5], 0.06, c.weapon, { bone: B, sides: 10 });
  b.part(cyl(0.085, 0.28, 10), c.weapon, { bone: B, at: [x, y, z + 0.8], rotation: [90, 0, 0], flat: true }); // fume extractor
  b.part(box(0.16, 0.16, 0.16), c.dark, { bone: B, at: [x, y, z + 1.52] }); // muzzle brake
  for (const s of [1, -1])
    b.part(cyl(0.04, 0.18, 8), c.steel, { bone: B, at: [x + s * 0.08, y, z + 1.52], rotation: [0, 0, 90] }); // side ports
  b.rod([x, y - 0.1, z - 0.2], [x, y - 0.1, z + 0.35], 0.035, c.steel, { bone: B, sides: 8 }); // recoil cylinder
}

export function barrelMinigun(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(0.22, 0.24, 0.4), c.weapon, { bone: B, at: [x, y, z - 0.15] }); // rear housing
  const spin = b.joint(`spin${m.tag}`, {
    parent: B,
    at: [x, y, z + 0.05],
    dir: [0, 1, 0],
    up: [1, 0, 0],
    role: "hinge",
  });
  for (let i = 0; i < 6; i++)
    b.rod(
      [x + 0.06 * Math.cos((i / 6) * TAU), y + 0.06 * Math.sin((i / 6) * TAU), z + 0.05],
      [x + 0.06 * Math.cos((i / 6) * TAU), y + 0.06 * Math.sin((i / 6) * TAU), z + 0.8],
      0.018,
      c.steel,
      { bone: spin, sides: 6 },
    );
  b.part(cyl(0.095, 0.05, 10), c.dark, { bone: spin, at: [x, y, z + 0.7], rotation: [90, 0, 0] }); // front clamp
  b.part(cyl(0.09, 0.05, 10), c.dark, { bone: spin, at: [x, y, z + 0.1], rotation: [90, 0, 0] });
  b.rod([x + 0.11, y - 0.12, z - 0.15], [x + 0.3, y - 0.3, z - 0.3], 0.03, c.dark, { bone: B, section: "box" }); // feed chute
}

export function barrelAutocannon(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(0.2, 0.24, 0.6), c.weapon, { bone: B, at: [x, y, z - 0.1] }); // receiver
  b.part(cyl(0.065, 0.5, 8), c.weapon, { bone: B, at: [x, y, z + 0.45], rotation: [90, 0, 0], flat: true }); // shroud
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    for (const dz of [0.3, 0.45, 0.6])
      b.part(cyl(0.012, 0.02, 6), c.dark, {
        bone: B,
        at: [x + 0.065 * Math.cos(a), y + 0.065 * Math.sin(a), z + dz],
        rotation: [0, 0, (a * 180) / Math.PI + 90],
      }); // perforations
  }
  b.rod([x, y, z + 0.7], [x, y, z + 1.2], 0.035, c.weapon, { bone: B, sides: 8 });
  b.part(box(0.2, 0.2, 0.3), c.dark, { bone: B, at: [x + 0.2, y - 0.04, z - 0.15] }); // ammo box
}

export function barrelMortar(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(new THREE.SphereGeometry(0.14, 10, 6), c.weapon, { bone: B, at: [x, y, z - 0.1], flat: true }); // breech
  b.rod([x, y, z], [x, y, z + 0.7], 0.11, c.weapon, { bone: B, sides: 10 });
  b.part(cyl(0.13, 0.06, 10), c.dark, { bone: B, at: [x, y, z + 0.68], rotation: [90, 0, 0], flat: true }); // muzzle ring
  b.part(new THREE.TorusGeometry(0.13, 0.02, 6, 10), c.steel, { bone: B, at: [x, y, z + 0.2] });
}

export function barrelTwin(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(0.34, 0.18, 0.3), c.weapon, { bone: B, at: [x, y, z - 0.15] });
  for (const s of [1, -1])
    b.rod([x + s * 0.1, y, z], [x + s * 0.1, y, z + 1.1], 0.045, c.weapon, { bone: B, sides: 8 });
  for (const dz of [0.4, 0.9]) b.part(box(0.3, 0.12, 0.05), c.dark, { bone: B, at: [x, y, z + dz] }); // clamp plates
}

export function barrelFlamer(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(cyl(0.12, 0.4, 10), c.dark, { bone: B, at: [x, y, z - 0.25], rotation: [90, 0, 0], flat: true }); // fuel drum
  b.rod([x, y, z], [x, y, z + 0.5], 0.04, c.weapon, { bone: B, sides: 8 });
  b.part(new THREE.CylinderGeometry(0.08, 0.04, 0.12, 10), c.weapon, {
    bone: B,
    at: [x, y, z + 0.56],
    rotation: [90, 0, 0],
    flat: true,
  }); // flared nozzle
  glow(b.part(cyl(0.02, 0.03, 6), c.light, { bone: B, at: [x, y + 0.07, z + 0.5], rotation: [90, 0, 0] })); // pilot
  b.rod([x + 0.08, y - 0.08, z - 0.1], [x + 0.06, y - 0.05, z + 0.4], 0.015, c.steel, { bone: B, sides: 6 }); // hose
}

export const barrels = {
  cannon: barrelCannon,
  minigun: barrelMinigun,
  autocannon: barrelAutocannon,
  mortar: barrelMortar,
  twin: barrelTwin,
  flamer: barrelFlamer,
};

// ---------------------------------------------------------------- pods

export function podBox(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(0.5, 0.5, 0.6), c.weapon, { bone: B, at: [x, y, z + 0.2] });
  for (const dx of [-0.12, 0.12])
    for (const dy of [-0.12, 0.12]) {
      b.part(cyl(0.1, 0.06, 10), c.dark, { bone: B, at: [x + dx, y + dy, z + 0.5], rotation: [90, 0, 0] });
      b.spike([x + dx, y + dy, z + 0.46], [0, 0, 1], 0.12, 0.06, c.steel, { bone: B, sides: 8 }); // missile nose
    }
}

export function podTubes(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  for (const dz of [0, 0.7])
    b.part(cyl(0.22, 0.04, 6), c.weapon, { bone: B, at: [x, y, z + dz], rotation: [90, 0, 0], flat: true }); // end plates
  b.rod([x, y, z], [x, y, z + 0.72], 0.06, c.dark, { bone: B, sides: 8 });
  for (let i = 0; i < 6; i++)
    b.rod(
      [x + 0.13 * Math.cos((i / 6) * TAU), y + 0.13 * Math.sin((i / 6) * TAU), z],
      [x + 0.13 * Math.cos((i / 6) * TAU), y + 0.13 * Math.sin((i / 6) * TAU), z + 0.72],
      0.06,
      c.dark,
      { bone: B, sides: 8 },
    );
}

export function podRail(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(0.08, 0.08, 1.0), c.weapon, { bone: B, at: [x, y, z + 0.2] });
  for (const dx of [-0.12, 0.12]) {
    b.rod([x + dx, y - 0.1, z - 0.2], [x + dx, y - 0.1, z + 0.6], 0.05, c.steel, { bone: B, sides: 8 });
    b.spike([x + dx, y - 0.1, z + 0.6], [0, 0, 1], 0.2, 0.05, c.dark, { bone: B, sides: 8 });
    for (const a of [0, 90, 180, 270])
      b.part(box(0.1, 0.02, 0.14), c.dark, {
        bone: B,
        at: [x + dx + 0.07 * Math.cos((a * Math.PI) / 180), y - 0.1 + 0.07 * Math.sin((a * Math.PI) / 180), z - 0.1],
        rotation: [0, 0, a],
      }); // fins
    b.part(box(0.04, 0.1, 0.1), c.weapon, { bone: B, at: [x + dx, y - 0.04, z + 0.2] }); // hanger
  }
}

export function podRack(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  for (const s of [1, -1]) b.part(box(0.04, 0.5, 0.7), c.weapon, { bone: B, at: [x + s * 0.1, y, z + 0.15] });
  for (let i = 0; i < 4; i++) {
    const yy = y - 0.18 + i * 0.12;
    b.rod([x, yy, z - 0.1], [x, yy, z + 0.4], 0.04, c.steel, { bone: B, sides: 7 });
    b.spike([x, yy, z + 0.4], [0, 0, 1], 0.14, 0.04, c.dark, { bone: B, sides: 7 });
  }
}

export const pods = { box: podBox, tubes: podTubes, rail: podRail, rack: podRack };

// ---------------------------------------------------------------- lasers

export function laserLens(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(cyl(0.09, 0.7, 10), c.weapon, { bone: B, at: [x, y, z + 0.2], rotation: [90, 0, 0], flat: true });
  for (const [dz, r] of [
    [0.3, 0.12],
    [0.45, 0.11],
    [0.58, 0.1],
  ])
    b.part(new THREE.TorusGeometry(r, 0.02, 6, 12), c.steel, { bone: B, at: [x, y, z + dz] });
  glow(b.part(cyl(0.07, 0.03, 12), c.light, { bone: B, at: [x, y, z + 0.56], rotation: [90, 0, 0], flat: true }));
}

export function laserCoil(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(0.24, 0.2, 0.3), c.weapon, { bone: B, at: [x, y, z - 0.12] }); // capacitor box
  glow(b.rod([x, y, z], [x, y, z + 0.85], 0.03, c.light, { bone: B, sides: 8 }));
  for (let i = 0; i < 8; i++)
    b.part(new THREE.TorusGeometry(0.08, 0.018, 6, 10), c.steel, { bone: B, at: [x, y, z + 0.08 + i * 0.1] });
  for (const s of [1, -1])
    b.rod([x + s * 0.09, y, z + 0.03], [x + s * 0.09, y, z + 0.8], 0.012, c.dark, { bone: B, sides: 5 }); // rails
}

export function laserPrism(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(cyl(0.1, 0.3, 8), c.weapon, { bone: B, at: [x, y, z + 0.05], rotation: [90, 0, 0], flat: true });
  glow(
    b.part(new THREE.OctahedronGeometry(0.13), c.light, {
      bone: B,
      at: [x, y, z + 0.42],
      scale: [1, 1, 1.6],
      flat: true,
    }),
  );
  for (const a of [45, 135, 225, 315])
    b.rod(
      [x + 0.1 * Math.cos((a * Math.PI) / 180), y + 0.1 * Math.sin((a * Math.PI) / 180), z + 0.2],
      [x + 0.1 * Math.cos((a * Math.PI) / 180), y + 0.1 * Math.sin((a * Math.PI) / 180), z + 0.66],
      0.012,
      c.steel,
      { bone: B, sides: 5 },
    ); // cage
  b.part(new THREE.TorusGeometry(0.11, 0.015, 5, 8), c.steel, { bone: B, at: [x, y, z + 0.66] });
}

export function laserArray(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(0.34, 0.34, 0.2), c.weapon, { bone: B, at: [x, y, z + 0.1] });
  for (const dx of [-0.1, 0, 0.1])
    for (const dy of [-0.1, 0, 0.1]) {
      b.part(cyl(0.03, 0.14, 8), c.dark, { bone: B, at: [x + dx, y + dy, z + 0.26], rotation: [90, 0, 0] });
      glow(b.part(cyl(0.022, 0.02, 8), c.light, { bone: B, at: [x + dx, y + dy, z + 0.34], rotation: [90, 0, 0] }));
    }
}

export const lasers = { lens: laserLens, coil: laserCoil, prism: laserPrism, array: laserArray };

// ---------------------------------------------------------------- railguns

export function railgunRails(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(0.3, 0.26, 0.4), c.weapon, { bone: B, at: [x, y, z - 0.2] }); // breech
  for (const s of [1, -1]) b.part(box(0.04, 0.1, 1.5), c.steel, { bone: B, at: [x + s * 0.07, y, z + 0.75] }); // rails
  glow(b.part(box(0.1, 0.03, 1.4), c.light, { bone: B, at: [x, y, z + 0.75] }));
  b.part(box(0.1, 0.09, 0.12), c.dark, { bone: B, at: [x, y, z + 0.3] }); // armature
  for (const dz of [0.2, 0.6, 1.0])
    for (const s of [1, -1])
      b.part(cyl(0.07, 0.3, 8), c.dark, {
        bone: B,
        at: [x + s * 0.17, y - 0.02, z + dz],
        rotation: [90, 0, 0],
        flat: true,
      }); // capacitor drums
  for (const dz of [0.5, 1.45]) b.part(box(0.22, 0.16, 0.05), c.steel, { bone: B, at: [x, y, z + dz] }); // clamps
}

export function railgunCoil(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(0.28, 0.24, 0.36), c.weapon, { bone: B, at: [x, y, z - 0.18] });
  b.rod([x, y, z], [x, y, z + 1.4], 0.04, c.dark, { bone: B, sides: 8 });
  for (let i = 0; i < 6; i++) {
    const r = 0.16 - i * 0.018;
    b.part(cyl(r, 0.1, 10), c.weapon, { bone: B, at: [x, y, z + 0.15 + i * 0.22], rotation: [90, 0, 0], flat: true });
    glow(
      b.part(new THREE.TorusGeometry(r - 0.03, 0.012, 5, 10), c.light, { bone: B, at: [x, y, z + 0.21 + i * 0.22] }),
    );
  }
  for (const s of [1, -1])
    b.rod([x + s * 0.1, y + 0.1, z], [x + s * 0.12, y + 0.14, z + 1.2], 0.012, c.dark, { bone: B, sides: 5 }); // power cables
}

export const railguns = { rails: railgunRails, coil: railgunCoil };

// ---------------------------------------------------------------- handheld laser rifle (centre at m.at, muzzle +Z)

export function rifleCarbine(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(0.06, 0.08, 0.4), c.weapon, { bone: B, at: [x, y, z] }); // receiver
  b.part(box(0.07, 0.025, 0.3), c.dark, { bone: B, at: [x, y + 0.05, z + 0.02] }); // top rail
  b.rod([x, y + 0.01, z + 0.2], [x, y + 0.01, z + 0.48], 0.02, c.dark, { bone: B, sides: 8 });
  glow(b.part(cyl(0.025, 0.02, 8), c.light, { bone: B, at: [x, y + 0.01, z + 0.48], rotation: [90, 0, 0] }));
  b.part(box(0.05, 0.1, 0.22), c.dark, { bone: B, at: [x, y - 0.02, z - 0.3] }); // stock
  b.part(box(0.04, 0.12, 0.05), c.dark, { bone: B, at: [x, y - 0.1, z - 0.06], rotation: [-15, 0, 0] }); // grip
  b.part(box(0.04, 0.14, 0.06), c.steel, { bone: B, at: [x, y - 0.1, z + 0.08], rotation: [10, 0, 0] }); // magazine
  b.part(box(0.05, 0.04, 0.16), c.steel, { bone: B, at: [x, y - 0.05, z + 0.3] }); // foregrip rail
}

export function rifleLong(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(0.06, 0.08, 0.36), c.weapon, { bone: B, at: [x, y, z - 0.1] });
  b.rod([x, y + 0.01, z + 0.05], [x, y + 0.01, z + 0.6], 0.022, c.dark, { bone: B, sides: 8 });
  for (let i = 0; i < 4; i++)
    b.part(box(0.08, 0.06, 0.02), c.steel, { bone: B, at: [x, y + 0.01, z + 0.12 + i * 0.06] }); // heat-sink fins
  glow(b.part(cyl(0.028, 0.02, 8), c.light, { bone: B, at: [x, y + 0.01, z + 0.6], rotation: [90, 0, 0] }));
  b.part(cyl(0.025, 0.22, 8), c.dark, { bone: B, at: [x, y + 0.08, z - 0.05], rotation: [90, 0, 0] }); // scope
  for (const s of [1, -1])
    b.rod([x, y - 0.02, z + 0.35], [x + s * 0.08, y - 0.2, z + 0.38], 0.008, c.steel, { bone: B, sides: 5 }); // bipod
  b.part(box(0.05, 0.1, 0.24), c.dark, { bone: B, at: [x, y - 0.02, z - 0.4] });
  b.part(box(0.04, 0.12, 0.05), c.dark, { bone: B, at: [x, y - 0.1, z - 0.18], rotation: [-15, 0, 0] });
}

export function rifleBullpup(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(0.07, 0.1, 0.5), c.weapon, { bone: B, at: [x, y, z - 0.1] }); // long receiver reaching the shoulder
  b.part(box(0.04, 0.16, 0.05), c.steel, { bone: B, at: [x, y - 0.12, z - 0.2], rotation: [10, 0, 0] }); // magazine behind the grip
  b.part(box(0.04, 0.12, 0.05), c.dark, { bone: B, at: [x, y - 0.1, z + 0.02], rotation: [-15, 0, 0] }); // grip
  b.rod([x, y + 0.06, z - 0.3], [x, y + 0.06, z + 0.05], 0.015, c.dark, { bone: B, sides: 6 }); // carry handle
  for (const dz of [-0.3, 0.05]) b.part(box(0.03, 0.05, 0.03), c.dark, { bone: B, at: [x, y + 0.045, z + dz] });
  b.rod([x, y + 0.01, z + 0.15], [x, y + 0.01, z + 0.4], 0.022, c.dark, { bone: B, sides: 8 });
  glow(b.part(cyl(0.028, 0.02, 8), c.light, { bone: B, at: [x, y + 0.01, z + 0.4], rotation: [90, 0, 0] }));
  glow(b.part(box(0.01, 0.02, 0.3), c.light, { bone: B, at: [x + 0.04, y, z - 0.1] })); // side strip
}

export const rifles = { carbine: rifleCarbine, long: rifleLong, bullpup: rifleBullpup };

/** A rack on a vertical face; the rifle lies along the face 0.12 m out from it. */
export function rackClip(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(0.6, 0.02, 0.2), c.dark, { frame: f.moved([0, 0.01, 0]), bone: m.bone });
  for (const u of [-0.2, 0.2])
    b.part(new THREE.TorusGeometry(0.06, 0.012, 5, 10, Math.PI * 1.4), c.steel, {
      at: f.local([u, 0.12, 0]),
      quat: f.quat
        .clone()
        .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2 + 0.95)),
      bone: m.bone,
    });
  return {
    bone: m.bone,
    at: f.local([0, 0.12, 0]).toArray() as V3,
    s: m.s,
    n: [0, 0, 1],
    root: m.root,
    tag: m.tag,
  } as Mount;
}

export function rackCradle(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(0.7, 0.16, 0.03), c.steel, { frame: f.moved([0, 0.08, -0.08]), bone: m.bone }); // shelf
  for (const u of [-0.22, 0.22])
    b.part(new THREE.TorusGeometry(0.06, 0.012, 5, 10, Math.PI), c.steel, {
      at: f.local([u, 0.12, -0.06]),
      quat: f.quat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2)),
      bone: m.bone,
    });
  b.part(box(0.04, 0.14, 0.02), c.tyre, { frame: f.moved([0, 0.12, 0.02]), bone: m.bone }); // strap
  return {
    bone: m.bone,
    at: f.local([0, 0.12, 0]).toArray() as V3,
    s: m.s,
    n: [0, 0, 1],
    root: m.root,
    tag: m.tag,
  } as Mount;
}

export const racks = { clip: rackClip, cradle: rackCradle };

// ---------------------------------------------------------------- picks and dress

export type TurretPick = {
  turret: keyof typeof turrets;
  barrel?: keyof typeof barrels;
  laser?: keyof typeof lasers;
  railgun?: keyof typeof railguns;
  pod?: keyof typeof pods;
};
export type Picks = {
  roof?: TurretPick;
  bed?: TurretPick;
  rifle?: { rifle: keyof typeof rifles; rack?: keyof typeof racks };
};

function mountTurret(b: Builder, m: Mount, c: Roles, p: TurretPick) {
  const w = turrets[p.turret](b, m, c);
  if (p.barrel) barrels[p.barrel](b, w, c);
  else if (p.laser) lasers[p.laser](b, w, c);
  else if (p.railgun) railguns[p.railgun](b, w, c);
  else if (p.pod) pods[p.pod](b, w, c);
  if (p.pod && (p.barrel || p.laser || p.railgun)) pods[p.pod](b, { ...w, at: [w.at[0] + 0.4, w.at[1], w.at[2]] }, c);
}

export function dress(b: Builder, a: Anchors, c: Roles, p: Picks) {
  if (p.roof) mountTurret(b, { ...a.roof, tag: "Roof" }, c, p.roof);
  if (p.bed) {
    const [x, y, z] = a.bed.at;
    b.part(cyl(0.3, 0.5, 10), c.steel, { bone: a.bed.bone, at: [x, y + 0.25, z], flat: true }); // pedestal
    mountTurret(b, { ...a.bed, at: [x, y + 0.5, z], tag: "Bed" }, c, p.bed);
  }
  if (p.rifle) rifles[p.rifle.rifle](b, racks[p.rifle.rack ?? "clip"](b, a.bedSideL, c), c);
}
```

## Sampler: catalogs/scifiHull.ts

```ts
/**
 * catalogs/scifiHull.ts: spaceship-style hard-surface detail: thrusters, vents, antennas, sensor domes, panels,
 * light bars, cable runs. Same contract as catalogs/truck.ts (Mount = { bone, at, s, n, root, tag }, Roles by part
 * role; needs `box`, `cyl` from truck.ts). Every part builds in the mount frame `f = frame(m.at, m.n)`:
 * `f.local([u, v, w])` is u across the face, v out along n, w along the face the other way; a cylinder placed with
 * `{ at, dir: m.n }` stands out of the face, a torus with `{ at, dir: m.n, axis: "z" }` lies flat on it.
 *
 * SLOTS
 *   thruster (a face; default anchors.rear, n = -Z; the nozzle opens along n)
 *     thrusterBell     lathed bell shell, two rings, glowing throat disc, three struts
 *     thrusterBox      rectangular vectoring nozzle (frustumBox) with four flaps and a glowing slab inside
 *     thrusterRing     ring with eight radial vanes round a hub, glowing back ring
 *     thrusterCluster  four small bells on a plate
 *     thrusterIon      flat grid of 5 × 5 glowing emitters in a shroud
 *   vent (any face; field 0.5 × 0.3)
 *     ventLouvre  frame with five angled slats
 *     ventGrille  frame with a rod grid
 *     ventSlots   six recessed slots in a raised surround
 *     ventScoop   wedge scoop rising from the face with an open mouth
 *     ventFan     round housing, hub and six blades on a spin joint ventFan{tag}, guard ring
 *   antenna (a top face; default anchors.roofCorner)
 *     antennaWhip   base coil, tapering 1.2 m whip, tip ball
 *     antennaDish   post, yaw joint dish{tag}, shallow lathed dish, feed arm
 *     antennaBlade  flat fin (extrude) on a base plate
 *     antennaArray  crossbar on a post with four short rods
 *     antennaMast   three telescoping sections with collars, a cross at the top
 *   dome (a top face; default anchors.roofCornerFront)
 *     domeSensor   ring base, glass half sphere over a core cylinder
 *     domeCamera   half sphere with a lens cylinder poking out under a hood plate
 *     domeFaceted  six-sided lathed dome
 *     domeCluster  plate with three small domes
 *   panel (any face; field 0.8 × 0.5; default anchors.tailgate)
 *     panelRaised    bevelled plate (extrude) with four bolts
 *     panelRecessed  frame strips round a sunk inner plate with two latches
 *     panelGreeble   plate with a deterministic scatter of small boxes and drums
 *     panelStrips    six parallel ribs
 *     panelHex       five hex tiles with centre bolts
 *   lightBar (a top face; default anchors.roofFront; runs across, 1.2 m)
 *     lightBarRoof    housing with four pod lamps
 *     lightBarStrip   one long glowing strip in a housing
 *     lightBarDual    two stacked strips, the lower one short
 *     lightBarBeacon  dome lamp over a reflector on a spin joint beacon{tag}
 *   cable (signature cable*(b, m, c, to: [x, y, z]); runs from m.at to `to` with a sag; m.bone carries it)
 *     cableRun      one cable with three clips
 *     cableBundle   three cables side by side
 *     cableConduit  box-section conduit with two junction boxes
 *     cableHose     ribbed hose: a tube with rings along it
 *
 * PICKS (truck.ts assemble, `hull: { thruster?, vent?, antenna?, dome?, panel?, lightBar?, cable? }`): thrusters
 *   pair on the tail, vents on both hood sides, the cable runs from behind the cab to the left bed rail.
 */
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";
import { frame } from "agentic-3js-builder";
import { rng } from "agentic-3js-builder";
import { catmull } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { box, cyl } from "./truck";
import type { Anchors, Mount, Roles, V3 } from "./truck";
import { PLAIN } from "./truck";

const TAU = Math.PI * 2;

// ---------------------------------------------------------------- thruster (opens along n)

export function thrusterBell(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.lathe(
    [
      [0, 0],
      [0.18, 0],
      [0.14, 0.1],
      [0.3, 0.5],
      [0.26, 0.5],
      [0.11, 0.12],
      [0, 0.14],
    ],
    { at: m.at, axis: m.n, segments: 10, bone: m.bone, color: c.steel },
  );
  for (const [h, r] of [
    [0.2, 0.19],
    [0.4, 0.26],
  ])
    b.part(new THREE.TorusGeometry(r, 0.02, 5, 10), c.dark, {
      at: f.local([0, h, 0]),
      dir: m.n,
      axis: "z",
      bone: m.bone,
    });
  glow(b.part(cyl(0.1, 0.03, 10), c.light, { at: f.local([0, 0.13, 0]), dir: m.n, bone: m.bone, flat: true }));
  for (const a of [90, 210, 330])
    b.rod(
      f.local([0.17 * Math.cos((a * Math.PI) / 180), 0.02, 0.17 * Math.sin((a * Math.PI) / 180)]),
      f.local([0.3 * Math.cos((a * Math.PI) / 180), 0.42, 0.3 * Math.sin((a * Math.PI) / 180)]),
      0.012,
      c.dark,
      { bone: m.bone, sides: 5 },
    ); // struts
}

export function thrusterBox(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.frustumBox(f.local([0, 0, 0]), f.local([0, 0.4, 0]), [0.44, 0.3], [0.56, 0.22], { bone: m.bone, color: c.steel });
  glow(b.part(box(0.4, 0.02, 0.14), c.light, { frame: f.moved([0, 0.12, 0]), bone: m.bone }));
  for (const [u, w, rot] of [
    [0.3, 0, 12],
    [-0.3, 0, -12],
  ])
    b.part(box(0.03, 0.3, 0.26), c.dark, {
      at: f.local([u, 0.42, w]),
      quat: f.quat
        .clone()
        .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), (rot * Math.PI) / 180)),
      bone: m.bone,
    }); // side flaps
  for (const [w, rot] of [
    [0.13, -12],
    [-0.13, 12],
  ])
    b.part(box(0.56, 0.3, 0.03), c.dark, {
      at: f.local([0, 0.42, w]),
      quat: f.quat
        .clone()
        .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), (rot * Math.PI) / 180)),
      bone: m.bone,
    }); // top and bottom flaps
}

export function thrusterRing(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(new THREE.TorusGeometry(0.3, 0.05, 6, 14), c.steel, {
    at: f.local([0, 0.1, 0]),
    dir: m.n,
    axis: "z",
    bone: m.bone,
  });
  b.part(cyl(0.08, 0.2, 8), c.dark, { at: f.local([0, 0.1, 0]), dir: m.n, bone: m.bone });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    b.part(box(0.2, 0.08, 0.02), c.dark, {
      at: f.local([0.18 * Math.cos(a), 0.1, 0.18 * Math.sin(a)]),
      quat: f.quat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -a)),
      bone: m.bone,
    }); // vanes
  }
  glow(
    b.part(new THREE.TorusGeometry(0.22, 0.02, 5, 14), c.light, {
      at: f.local([0, 0.02, 0]),
      dir: m.n,
      axis: "z",
      bone: m.bone,
    }),
  );
}

export function thrusterCluster(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(0.6, 0.04, 0.6), c.dark, { frame: f.moved([0, 0.02, 0]), bone: m.bone });
  for (const u of [-0.15, 0.15])
    for (const w of [-0.15, 0.15]) {
      b.lathe(
        [
          [0, 0],
          [0.08, 0],
          [0.06, 0.06],
          [0.13, 0.24],
          [0.1, 0.24],
          [0.045, 0.07],
          [0, 0.08],
        ],
        { at: f.local([u, 0.04, w]), axis: m.n, segments: 8, bone: m.bone, color: c.steel },
      );
      glow(b.part(cyl(0.04, 0.02, 8), c.light, { at: f.local([u, 0.11, w]), dir: m.n, bone: m.bone }));
    }
}

export function thrusterIon(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(0.7, 0.12, 0.7), c.steel, { frame: f.moved([0, 0.06, 0]), bone: m.bone });
  b.part(box(0.6, 0.04, 0.6), c.dark, { frame: f.moved([0, 0.12, 0]), bone: m.bone });
  for (let i = 0; i < 5; i++)
    for (let j = 0; j < 5; j++)
      glow(
        b.part(cyl(0.035, 0.03, 6), c.light, {
          at: f.local([-0.22 + i * 0.11, 0.15, -0.22 + j * 0.11]),
          dir: m.n,
          bone: m.bone,
          flat: true,
        }),
      );
  for (const u of [-0.36, 0.36]) b.part(box(0.04, 0.3, 0.76), c.dark, { frame: f.moved([u, 0.15, 0]), bone: m.bone }); // shroud walls
}

export const thrusters = {
  bell: thrusterBell,
  box: thrusterBox,
  ring: thrusterRing,
  cluster: thrusterCluster,
  ion: thrusterIon,
};

// ---------------------------------------------------------------- vent (any face, 0.5 × 0.3)

function surround(b: Builder, m: Mount, c: Roles, w = 0.5, h = 0.3) {
  const f = frame(m.at, m.n);
  b.part(box(w, 0.02, h), c.dark, { frame: f.moved([0, 0.01, 0]), bone: m.bone });
  for (const u of [-w / 2, w / 2])
    b.part(box(0.03, 0.04, h + 0.03), c.steel, { frame: f.moved([u, 0.02, 0]), bone: m.bone });
  for (const v of [-h / 2, h / 2])
    b.part(box(w + 0.03, 0.04, 0.03), c.steel, { frame: f.moved([0, 0.02, v]), bone: m.bone });
  return f;
}

export function ventLouvre(b: Builder, m: Mount, c: Roles) {
  const f = surround(b, m, c);
  const tilt = f.quat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.6));
  for (let i = 0; i < 5; i++)
    b.part(box(0.46, 0.015, 0.07), c.trim, { at: f.local([0, 0.03, -0.1 + i * 0.05]), quat: tilt, bone: m.bone });
}

export function ventGrille(b: Builder, m: Mount, c: Roles) {
  const f = surround(b, m, c);
  for (let i = 0; i < 9; i++)
    b.rod(f.local([-0.2 + i * 0.05, 0.03, -0.13]), f.local([-0.2 + i * 0.05, 0.03, 0.13]), 0.006, c.steel, {
      bone: m.bone,
      sides: 4,
    });
  for (let i = 0; i < 4; i++)
    b.rod(f.local([-0.23, 0.035, -0.09 + i * 0.06]), f.local([0.23, 0.035, -0.09 + i * 0.06]), 0.006, c.steel, {
      bone: m.bone,
      sides: 4,
    });
}

export function ventSlots(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(0.54, 0.05, 0.34), c.trim, { frame: f.moved([0, 0.025, 0]), bone: m.bone });
  for (let i = 0; i < 6; i++)
    b.part(box(0.44, 0.02, 0.025), c.dark, { frame: f.moved([0, 0.05, -0.125 + i * 0.05]), bone: m.bone });
}

export function ventScoop(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.frustumBox(f.local([0, 0.0, -0.2]), f.local([0, 0.0, 0.2]), [0.4, 0.02], [0.5, 0.22], {
    bone: m.bone,
    color: c.trim,
  }); // wedge, rising along w
  b.part(box(0.44, 0.16, 0.03), c.dark, { frame: f.moved([0, 0.1, 0.22]), bone: m.bone }); // open mouth
  for (const u of [-0.15, 0, 0.15])
    b.part(box(0.02, 0.14, 0.03), c.steel, { frame: f.moved([u, 0.1, 0.22]), bone: m.bone });
}

export function ventFan(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(cyl(0.2, 0.08, 12), c.dark, { at: f.local([0, 0.04, 0]), dir: m.n, bone: m.bone, flat: true });
  const fan = b.joint(`ventFan${m.tag}`, {
    parent: m.bone,
    at: f.local([0, 0.06, 0]),
    dir: f.dir([1, 0, 0]),
    up: f.dir([0, 0, 1]),
    role: "hinge",
  });
  b.part(cyl(0.04, 0.06, 8), c.steel, { at: f.local([0, 0.07, 0]), dir: m.n, bone: fan });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    b.part(box(0.04, 0.012, 0.13), c.trim, {
      at: f.local([0.1 * Math.sin(a), 0.07, 0.1 * Math.cos(a)]),
      quat: f.quat
        .clone()
        .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), a))
        .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), 0.6)),
      bone: fan,
    });
  }
  b.part(new THREE.TorusGeometry(0.18, 0.012, 5, 14), c.steel, {
    at: f.local([0, 0.1, 0]),
    dir: m.n,
    axis: "z",
    bone: m.bone,
  });
  for (const a of [0, 60, 120])
    b.rod(
      f.local([0.18 * Math.cos((a * Math.PI) / 180), 0.1, 0.18 * Math.sin((a * Math.PI) / 180)]),
      f.local([-0.18 * Math.cos((a * Math.PI) / 180), 0.1, -0.18 * Math.sin((a * Math.PI) / 180)]),
      0.006,
      c.steel,
      { bone: m.bone, sides: 4 },
    ); // guard
}

export const vents = { louvre: ventLouvre, grille: ventGrille, slots: ventSlots, scoop: ventScoop, fan: ventFan };

// ---------------------------------------------------------------- antenna (top face)

export function antennaWhip(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(cyl(0.05, 0.04, 8), c.dark, { at: f.local([0, 0.02, 0]), dir: m.n, bone: m.bone });
  for (let i = 0; i < 4; i++)
    b.part(new THREE.TorusGeometry(0.03, 0.01, 5, 8), c.steel, {
      at: f.local([0, 0.06 + i * 0.03, 0]),
      dir: m.n,
      axis: "z",
      bone: m.bone,
    }); // base coil
  b.spike(f.local([0, 0.16, 0]), m.n, 1.2, 0.015, c.steel, { bone: m.bone, sides: 5 });
  b.part(new THREE.SphereGeometry(0.025, 6, 4), c.dark, { at: f.local([0, 1.36, 0]), bone: m.bone, flat: true });
}

export function antennaDish(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(cyl(0.04, 0.3, 8), c.steel, { at: f.local([0, 0.15, 0]), dir: m.n, bone: m.bone });
  const yaw = b.joint(`dish${m.tag}`, {
    parent: m.bone,
    at: f.local([0, 0.3, 0]),
    dir: f.dir([1, 0, 0]),
    up: f.dir([0, 0, 1]),
    role: "hinge",
  });
  const aim = f.dir([0, 0.8, -0.6]);
  b.lathe(
    [
      [0, 0],
      [0.3, 0.12],
      [0.3, 0.14],
      [0, 0.03],
    ],
    { at: f.local([0, 0.34, -0.02]), axis: aim, segments: 12, bone: yaw, color: c.trim },
  );
  b.part(cyl(0.05, 0.08, 8), c.dark, { at: f.local([0, 0.33, 0]), dir: aim, bone: yaw });
  b.rod(f.local([0, 0.36, -0.02]), f.local([0, 0.62, -0.23]), 0.012, c.steel, { bone: yaw, sides: 5 }); // feed arm
  b.part(new THREE.SphereGeometry(0.03, 6, 4), c.dark, { at: f.local([0, 0.62, -0.23]), bone: yaw, flat: true });
}

export function antennaBlade(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(0.2, 0.02, 0.4), c.dark, { frame: f.moved([0, 0.01, 0]), bone: m.bone });
  b.extrude(
    [
      [-0.16, 0],
      [0.16, 0],
      [0.06, 0.42, "sharp"],
      [-0.02, 0.42, "sharp"],
    ],
    { at: f.local([0, 0.02, 0]), x: f.dir([0, 0, 1]), y: m.n, thickness: 0.025, bone: m.bone, color: c.trim },
  );
}

export function antennaArray(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(cyl(0.03, 0.6, 6), c.steel, { at: f.local([0, 0.3, 0]), dir: m.n, bone: m.bone });
  b.rod(f.local([-0.4, 0.6, 0]), f.local([0.4, 0.6, 0]), 0.015, c.steel, { bone: m.bone, sides: 6 });
  for (const u of [-0.4, -0.13, 0.13, 0.4])
    b.spike(f.local([u, 0.6, 0]), m.n, 0.35, 0.008, c.dark, { bone: m.bone, sides: 4 });
}

export function antennaMast(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  for (let i = 0; i < 3; i++) {
    b.part(cyl(0.05 - i * 0.013, 0.5, 8), c.steel, { at: f.local([0, 0.25 + i * 0.45, 0]), dir: m.n, bone: m.bone });
    b.part(cyl(0.065 - i * 0.013, 0.05, 8), c.dark, { at: f.local([0, 0.5 + i * 0.45, 0]), dir: m.n, bone: m.bone }); // collar
  }
  b.rod(f.local([-0.12, 1.5, 0]), f.local([0.12, 1.5, 0]), 0.008, c.dark, { bone: m.bone, sides: 4 });
  b.rod(f.local([0, 1.5, -0.12]), f.local([0, 1.5, 0.12]), 0.008, c.dark, { bone: m.bone, sides: 4 });
}

export const antennas = {
  whip: antennaWhip,
  dish: antennaDish,
  blade: antennaBlade,
  array: antennaArray,
  mast: antennaMast,
};

// ---------------------------------------------------------------- dome (top face)

export function domeSensor(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(cyl(0.24, 0.05, 12), c.steel, { at: f.local([0, 0.025, 0]), dir: m.n, bone: m.bone, flat: true });
  b.part(cyl(0.08, 0.2, 8), c.dark, { at: f.local([0, 0.12, 0]), dir: m.n, bone: m.bone });
  b.part(new THREE.SphereGeometry(0.2, 12, 6, 0, TAU, 0, Math.PI / 2), c.glass, {
    at: f.local([0, 0.05, 0]),
    dir: m.n,
    bone: m.bone,
    flat: true,
  });
}

export function domeCamera(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(new THREE.SphereGeometry(0.18, 12, 6, 0, TAU, 0, Math.PI / 2), c.trim, {
    at: f.local([0, 0.02, 0]),
    dir: m.n,
    bone: m.bone,
    flat: true,
  });
  b.part(cyl(0.05, 0.14, 8), c.dark, { at: f.local([0, 0.1, -0.12]), dir: f.dir([0, 0.5, -1]), bone: m.bone });
  b.part(cyl(0.035, 0.02, 8), c.glass, { at: f.local([0, 0.13, -0.19]), dir: f.dir([0, 0.5, -1]), bone: m.bone });
  b.part(box(0.2, 0.02, 0.16), c.steel, { frame: f.moved([0, 0.2, -0.1]), bone: m.bone }); // hood plate
}

export function domeFaceted(b: Builder, m: Mount, c: Roles) {
  b.lathe(
    [
      [0, 0],
      [0.24, 0],
      [0.22, 0.1],
      [0.14, 0.2],
      [0, 0.24],
    ],
    { at: m.at, axis: m.n, segments: 6, bone: m.bone, color: c.trim },
  );
}

export function domeCluster(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(cyl(0.26, 0.03, 8), c.dark, { at: f.local([0, 0.015, 0]), dir: m.n, bone: m.bone, flat: true });
  for (const a of [90, 210, 330])
    b.part(new THREE.SphereGeometry(0.08, 8, 4, 0, TAU, 0, Math.PI / 2), c.glass, {
      at: f.local([0.13 * Math.cos((a * Math.PI) / 180), 0.03, 0.13 * Math.sin((a * Math.PI) / 180)]),
      dir: m.n,
      bone: m.bone,
      flat: true,
    });
}

export const domes = { sensor: domeSensor, camera: domeCamera, faceted: domeFaceted, cluster: domeCluster };

// ---------------------------------------------------------------- panel (any face, 0.8 × 0.5)

export function panelRaised(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.extrude(
    [
      [-0.4, -0.25],
      [0.4, -0.25],
      [0.4, 0.25],
      [-0.4, 0.25],
    ],
    {
      at: f.local([0, 0.025, 0]),
      x: f.dir([1, 0, 0]),
      y: f.dir([0, 0, 1]),
      thickness: 0.05,
      bevel: 0.02,
      bone: m.bone,
      color: c.trim,
    },
  );
  for (const u of [-0.33, 0.33])
    for (const w of [-0.18, 0.18])
      b.part(cyl(0.02, 0.015, 6), c.steel, { at: f.local([u, 0.055, w]), dir: m.n, bone: m.bone });
}

export function panelRecessed(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(0.7, 0.01, 0.4), c.dark, { frame: f.moved([0, 0.005, 0]), bone: m.bone });
  for (const u of [-0.37, 0.37]) b.part(box(0.06, 0.04, 0.5), c.trim, { frame: f.moved([u, 0.02, 0]), bone: m.bone });
  for (const w of [-0.22, 0.22]) b.part(box(0.8, 0.04, 0.06), c.trim, { frame: f.moved([0, 0.02, w]), bone: m.bone });
  for (const u of [-0.2, 0.2])
    b.part(box(0.08, 0.02, 0.04), c.steel, { frame: f.moved([u, 0.02, 0.19]), bone: m.bone }); // latches
}

export function panelGreeble(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  const r = rng(11);
  b.part(box(0.8, 0.03, 0.5), c.trim, { frame: f.moved([0, 0.015, 0]), bone: m.bone });
  for (let i = 0; i < 14; i++) {
    const u = (r() - 0.5) * 0.7;
    const w = (r() - 0.5) * 0.4;
    if (i % 3)
      b.part(box(0.04 + r() * 0.1, 0.02 + r() * 0.04, 0.04 + r() * 0.08), i % 2 ? c.dark : c.steel, {
        frame: f.moved([u, 0.04, w]),
        bone: m.bone,
      });
    else
      b.part(cyl(0.02 + r() * 0.03, 0.03 + r() * 0.04, 8), c.dark, {
        at: f.local([u, 0.04, w]),
        dir: m.n,
        bone: m.bone,
      });
  }
}

export function panelStrips(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(0.8, 0.02, 0.5), c.trim, { frame: f.moved([0, 0.01, 0]), bone: m.bone });
  for (let i = 0; i < 6; i++)
    b.part(box(0.76, 0.03, 0.04), c.steel, { frame: f.moved([0, 0.035, -0.2 + i * 0.08]), bone: m.bone });
}

export function panelHex(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  for (const [u, w] of [
    [-0.3, 0],
    [-0.15, 0.2],
    [0, 0],
    [0.15, 0.2],
    [0.3, 0],
  ]) {
    b.part(cyl(0.12, 0.04, 6), c.trim, { at: f.local([u, 0.02, w]), dir: m.n, bone: m.bone, flat: true });
    b.part(cyl(0.025, 0.02, 6), c.steel, { at: f.local([u, 0.05, w]), dir: m.n, bone: m.bone });
  }
}

export const panels = {
  raised: panelRaised,
  recessed: panelRecessed,
  greeble: panelGreeble,
  strips: panelStrips,
  hex: panelHex,
};

// ---------------------------------------------------------------- light bar (top face, across)

export function lightBarRoof(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(1.2, 0.08, 0.12), c.dark, { frame: f.moved([0, 0.1, 0]), bone: m.bone });
  for (const u of [-0.45, 0.45]) b.part(box(0.04, 0.08, 0.06), c.steel, { frame: f.moved([u, 0.04, 0]), bone: m.bone }); // feet
  for (const u of [-0.45, -0.15, 0.15, 0.45]) {
    b.part(cyl(0.06, 0.08, 8), c.steel, {
      at: f.local([u, 0.17, 0]),
      dir: f.dir([0, 0, -1]),
      bone: m.bone,
      flat: true,
    });
    glow(
      b.part(cyl(0.05, 0.02, 8), c.light, {
        at: f.local([u, 0.17, -0.05]),
        dir: f.dir([0, 0, -1]),
        bone: m.bone,
        flat: true,
      }),
    );
  }
}

export function lightBarStrip(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(1.2, 0.06, 0.1), c.dark, { frame: f.moved([0, 0.07, 0]), bone: m.bone });
  glow(b.part(box(1.1, 0.03, 0.02), c.light, { frame: f.moved([0, 0.08, -0.05]), bone: m.bone }));
  for (const u of [-0.5, 0.5]) b.part(box(0.04, 0.06, 0.06), c.steel, { frame: f.moved([u, 0.02, 0]), bone: m.bone });
}

export function lightBarDual(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(1.2, 0.14, 0.1), c.dark, { frame: f.moved([0, 0.09, 0]), bone: m.bone });
  glow(b.part(box(1.1, 0.03, 0.02), c.light, { frame: f.moved([0, 0.13, -0.05]), bone: m.bone }));
  glow(b.part(box(0.6, 0.03, 0.02), c.light, { frame: f.moved([0, 0.06, -0.05]), bone: m.bone }));
  for (const u of [-0.5, 0.5]) b.part(box(0.04, 0.04, 0.06), c.steel, { frame: f.moved([u, 0.01, 0]), bone: m.bone });
}

export function lightBarBeacon(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(cyl(0.12, 0.05, 10), c.dark, { at: f.local([0, 0.025, 0]), dir: m.n, bone: m.bone, flat: true });
  const spin = b.joint(`beacon${m.tag}`, {
    parent: m.bone,
    at: f.local([0, 0.05, 0]),
    dir: f.dir([1, 0, 0]),
    up: f.dir([0, 0, 1]),
    role: "hinge",
  });
  b.part(box(0.1, 0.1, 0.02), c.steel, { frame: f.moved([0, 0.11, 0.03]), bone: spin }); // reflector
  glow(
    b.part(new THREE.SphereGeometry(0.1, 10, 5, 0, TAU, 0, Math.PI / 2), c.light, {
      at: f.local([0, 0.05, 0]),
      dir: m.n,
      bone: m.bone,
      flat: true,
    }),
  );
}

export const lightBars = { roof: lightBarRoof, strip: lightBarStrip, dual: lightBarDual, beacon: lightBarBeacon };

// ---------------------------------------------------------------- cable (m.at → to, with a sag)

export type CableVariant = (b: Builder, m: Mount, c: Roles, to: V3) => void;

function route(m: Mount, to: V3, sag = 0.15) {
  const [x, y, z] = m.at;
  return catmull([[x, y, z], [(x + to[0]) / 2, (y + to[1]) / 2 - sag, (z + to[2]) / 2], to]);
}

export function cableRun(b: Builder, m: Mount, c: Roles, to: V3) {
  const path = route(m, to);
  b.sweep(path, 0.015, c.dark, { bone: m.bone, sides: 6 });
  b.along(path, 3, (at) => b.part(box(0.05, 0.03, 0.03), c.steel, { frame: at, bone: m.bone }));
}

export function cableBundle(b: Builder, m: Mount, c: Roles, to: V3) {
  for (const [du, sag] of [
    [-0.03, 0.14],
    [0, 0.17],
    [0.03, 0.15],
  ])
    b.sweep(route({ ...m, at: [m.at[0] + du, m.at[1], m.at[2]] }, [to[0] + du, to[1], to[2]], sag), 0.012, c.dark, {
      bone: m.bone,
      sides: 5,
    });
  b.part(box(0.1, 0.05, 0.05), c.steel, { at: route(m, to).at(0.5), bone: m.bone }); // tie
}

export function cableConduit(b: Builder, m: Mount, c: Roles, to: V3) {
  const path = route(m, to, 0.05);
  b.sweep(path, () => [0.03, 0.02], { bone: m.bone, section: "box", color: c.steel });
  b.along(path, 2, (at) => b.part(box(0.1, 0.08, 0.08), c.dark, { frame: at, bone: m.bone }));
}

export function cableHose(b: Builder, m: Mount, c: Roles, to: V3) {
  const path = route(m, to, 0.2);
  b.sweep(path, 0.02, c.tyre, { bone: m.bone, sides: 7 });
  b.along(path, 14, (at) =>
    b.part(new THREE.TorusGeometry(0.024, 0.008, 4, 8), c.dark, {
      at,
      quat: at.quat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2)),
      bone: m.bone,
    }),
  );
}

export const cables = { run: cableRun, bundle: cableBundle, conduit: cableConduit, hose: cableHose };

// ---------------------------------------------------------------- picks and dress

export type Picks = {
  thruster?: keyof typeof thrusters;
  vent?: keyof typeof vents;
  antenna?: keyof typeof antennas;
  dome?: keyof typeof domes;
  panel?: keyof typeof panels;
  lightBar?: keyof typeof lightBars;
  cable?: keyof typeof cables;
};

export function dress(b: Builder, a: Anchors, c: Roles, p: Picks) {
  if (p.thruster)
    for (const s of [1, -1]) thrusters[p.thruster](b, { ...a.rear, at: [s * 0.55, a.rear.at[1], a.rear.at[2]] }, c);
  if (p.vent) for (const side of ["L", "R"] as const) vents[p.vent](b, { ...a[`hood${side}`], tag: side }, c);
  if (p.antenna) antennas[p.antenna](b, a.roofCorner, c);
  if (p.dome) domes[p.dome](b, a.roofCornerFront, c);
  if (p.panel) panels[p.panel](b, a.tailgate, c);
  if (p.lightBar) lightBars[p.lightBar](b, a.roofFront, c);
  if (p.cable)
    cables[p.cable](b, { ...a.cabRear, at: [0.7, a.cabRear.at[1] - 0.1, a.cabRear.at[2]] }, c, [
      a.bedSideL.at[0],
      a.bedSideL.at[1] + 0.3,
      a.bedSideL.at[2] - 0.3,
    ]);
}
```

## Sampler: catalogs/materials2077.ts

```ts
/**
 * catalogs/materials2077.ts: paint and texture recipes for a low-poly 2077 look. The topology catalogs are painted
 * plainly; this one makes the Roles (colours by part role) they take, plus neon strips, decals and screens that
 * `truck.ts assemble` lays on the finished truck.
 *
 * ROLES   roles(picks) → Roles for the topology catalogs: a palette's flat colours with the body and trim recipes
 *   applied. Roles = { body, trim, glass, light, tyre, rim, steel, dark, weapon }; a Palette adds neon, neon2.
 *
 * PALETTES (flat faceted colour sets, `palettes.<name>`)
 *   nightOps  gunmetal body, black trim, cyan glass and lamps, magenta and cyan neon
 *   hazard    industrial yellow body, black trim, orange lamps, orange and white neon
 *   arctic    bone-white body, cobalt trim, ice-blue lamps, blue and white neon
 *   ember     oxblood body, soot trim, orange lamps, red and amber neon
 *
 * BODY PAINTS (`bodyPaints.<name>(palette)` → Fill; each a different pattern, in meters, baked to the atlas)
 *   flat        the palette body colour as is
 *   camo        digitalCamo: three tones quantised to a 12 cm grid from two octaves of noise
 *   panels      panelLines: a 45 cm panel grid in a darker seam, on the two axes across each face
 *   worn        wornEdges: bare-metal chips from fine noise, more on faces that look up
 *   grime       grime: a mottled dirt gradient climbing from the floor
 *   wornPanels  panel lines under worn edges (recipes nest)
 * TRIM PAINTS (`trimPaints.<name>(palette)` for bumpers, rails, cradles)
 *   flat      the palette trim colour
 *   chevrons  hazardChevrons: 45° stripes in the palette's hazard pair
 *   bands     horizontal stripes every 6 cm
 *   checker   8 cm checkerboard
 * NEON (`neons.<name>`, laid by `dress`; neonStrip(b, from, to, colour, bone, r) is one glowing rod)
 *   flank      a strip along each flank at the belt line
 *   outline    strips along the roof, hood and bed-rail edges
 *   underglow  strips under the frame rails and across the axles
 *   rings      a glowing ring on each wheel
 * DECALS (`decals.<name>()` → Texture; `decal(b, texture, m, w, h)` lays one on a face)
 *   unitNumber  a stencilled two-digit number in a frame
 *   warning     yellow triangle with a lightning glyph
 *   brand       hexagon mark with a chevron
 * SCREENS (`screens.<name>()` → Texture; `screen(b, texture, m, w, h)` lays one on a face and makes it glow)
 *   hud      reticle, grid, status bars, "SYS OK"
 *   map      contour lines with a blip
 *   warning  red "!" over hazard bars
 *
 * PICKS (truck.ts assemble, `style: { palette?, body?, trim?, neon?, decal?, screen? }`): names from the lists above;
 *   `dress` lays the unit number on the bed sides, the warning and brand on the tailgate, the screen on the back of the cab.
 */
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";
import type { Fill } from "agentic-3js-builder";
import type { Joint } from "agentic-3js-builder";
import { gradient, mottle, noise, paint } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import type { Anchors, Mount, Roles, V3 } from "./truck";
import { box, cyl } from "./truck";

export type Palette = Roles & { body: string; trim: string; neon: string; neon2: string; hazard: [string, string] };

export const palettes: Record<"nightOps" | "hazard" | "arctic" | "ember", Palette> = {
  nightOps: {
    body: "#2f343c",
    trim: "#1c1f24",
    glass: "#8fd3ff",
    light: "#7df9ff",
    tyre: "#17191c",
    rim: "#4b5159",
    steel: "#6a7079",
    dark: "#101214",
    weapon: "#262a30",
    neon: "#ff2bd6",
    neon2: "#2bf0ff",
    hazard: ["#e9c32a", "#15161a"],
  },
  hazard: {
    body: "#d9a21b",
    trim: "#1b1b1b",
    glass: "#b0e0ff",
    light: "#ff8a00",
    tyre: "#1a1a1a",
    rim: "#8a8f96",
    steel: "#7a7f86",
    dark: "#242628",
    weapon: "#3a3d42",
    neon: "#ff6a00",
    neon2: "#ffffff",
    hazard: ["#1b1b1b", "#d9a21b"],
  },
  arctic: {
    body: "#e4e9ee",
    trim: "#2d5fa3",
    glass: "#8ad7ff",
    light: "#9ff8ff",
    tyre: "#22252a",
    rim: "#b8c0c8",
    steel: "#8c949c",
    dark: "#3a4048",
    weapon: "#5a6470",
    neon: "#2b8cff",
    neon2: "#ffffff",
    hazard: ["#2d5fa3", "#e4e9ee"],
  },
  ember: {
    body: "#4a1f22",
    trim: "#161214",
    glass: "#ffb380",
    light: "#ff5a1f",
    tyre: "#1a1416",
    rim: "#6a5a52",
    steel: "#7c6f68",
    dark: "#241a1c",
    weapon: "#3a2a2c",
    neon: "#ff1f3d",
    neon2: "#ffb000",
    hazard: ["#ff8a1f", "#161214"],
  },
};

// ---------------------------------------------------------------- paints (model-space patterns)

/** Three tones quantised to a `size` grid: two octaves of noise read at each cell's corner. */
export function digitalCamo(tones: [string, string, string], size = 0.12, seed = 3) {
  return paint((p) => {
    const q = new THREE.Vector3(
      Math.floor(p.x / size) * size,
      Math.floor(p.y / size) * size,
      Math.floor(p.z / size) * size,
    );
    const v = noise(q, size * 4, seed) * 0.65 + noise(q, size * 1.6, seed + 1) * 0.35;
    return v < 0.42 ? tones[0] : v < 0.58 ? tones[1] : tones[2];
  });
}

/** A `size` panel grid drawn in `line`, on the two axes that run across the face (the one along its normal is skipped). */
export function panelLines(base: Fill, line: string, size = 0.45, width = 0.012) {
  const near = (v: number) => {
    const f = (((v / size) % 1) + 1) % 1;
    return Math.min(f, 1 - f) * size < width;
  };
  return paint((p, n) =>
    (Math.abs(n.x) < 0.7 && near(p.x + 0.17)) ||
    (Math.abs(n.y) < 0.7 && near(p.y + 0.05)) ||
    (Math.abs(n.z) < 0.7 && near(p.z + 0.31))
      ? line
      : base,
  );
}

/** Bare-metal chips where fine noise peaks; faces that look up chip more. */
export function wornEdges(base: Fill, bare: string, amount = 0.5, seed = 5) {
  return paint((p, n) =>
    noise(p, 0.035, seed) > 0.8 - amount * 0.12 - Math.max(0, n.y) * 0.05 && noise(p, 0.012, seed + 9) > 0.45
      ? bare
      : base,
  );
}

/** Mottled dirt climbing from `yLow` (full) to `yHigh` (clean). */
export function grime(base: Fill, dirt: string, yLow = 0.25, yHigh = 1.3) {
  return gradient(base, mottle(dirt, base, { size: 0.22, contrast: 0.9, seed: 7 }), [0, yHigh, 0], [0, yLow, 0]);
}

/** 45° stripes `size` apart in the XY plane (the front and back faces of a bumper read them as chevrons). */
export function hazardChevrons(a: string, b: string, size = 0.12) {
  return paint((p) => (((((p.x + p.y) / size) % 1) + 1) % 1 < 0.5 ? a : b));
}

export function bands(a: string, b: string, size = 0.06) {
  return paint((p) => (((((p.y + 0.02) / size) % 1) + 1) % 1 < 0.5 ? a : b));
}

export function checker(a: string, b: string, size = 0.08) {
  return paint((p) => ((Math.floor(p.x / size) + Math.floor(p.y / size) + Math.floor(p.z / size)) % 2 ? a : b));
}

export const bodyPaints = {
  flat: (k: Palette): Fill => k.body,
  camo: (k: Palette): Fill => digitalCamo([k.body, k.trim, k.steel as string]),
  panels: (k: Palette): Fill => panelLines(k.body, k.dark as string),
  worn: (k: Palette): Fill => wornEdges(k.body, k.rim as string),
  grime: (k: Palette): Fill => grime(k.body, k.dark as string),
  wornPanels: (k: Palette): Fill => wornEdges(panelLines(k.body, k.dark as string), k.rim as string),
};

export const trimPaints = {
  flat: (k: Palette): Fill => k.trim,
  chevrons: (k: Palette): Fill => hazardChevrons(k.hazard[0], k.hazard[1]),
  bands: (k: Palette): Fill => bands(k.hazard[0], k.hazard[1]),
  checker: (k: Palette): Fill => checker(k.hazard[0], k.hazard[1]),
};

// ---------------------------------------------------------------- neon

/** One glowing tube from `from` to `to`. */
export function neonStrip(b: Builder, from: V3, to: V3, color: string, bone: Joint, r = 0.012) {
  return glow(b.rod(from, to, r, color, { bone, sides: 6, caps: "flat" }), 1.6);
}

/** Truck coordinates (the base's chassis joint sits at [0, 0.6, 0]) shifted to wherever this chassis is. */
function truckSpace(a: Anchors) {
  const o = a.chassis.at;
  return (x: number, y: number, z: number): V3 => [o.x + x, o.y - 0.6 + y, o.z + z];
}

export const neons = {
  flank(b: Builder, a: Anchors, k: Palette) {
    const P = truckSpace(a);
    for (const s of [1, -1]) {
      neonStrip(b, P(s * 1.0, 1.33, -2.5), P(s * 1.0, 1.33, -0.4), k.neon, a.chassis);
      neonStrip(b, P(s * 1.0, 1.33, -0.2), P(s * 1.0, 1.33, 1.2), k.neon2, a.chassis);
    }
  },
  outline(b: Builder, a: Anchors, k: Palette) {
    const P = truckSpace(a);
    for (const s of [1, -1]) {
      neonStrip(b, P(s * 0.95, 1.97, -0.2), P(s * 0.95, 1.97, 1.2), k.neon, a.chassis);
      neonStrip(b, P(s * 0.82, 1.38, 1.3), P(s * 0.82, 1.38, 2.45), k.neon, a.chassis);
      neonStrip(b, P(s * 0.97, 1.44, -2.5), P(s * 0.97, 1.44, -0.4), k.neon2, a.chassis);
    }
    neonStrip(b, P(-0.95, 1.97, 1.2), P(0.95, 1.97, 1.2), k.neon, a.chassis);
  },
  underglow(b: Builder, a: Anchors, k: Palette) {
    const P = truckSpace(a);
    for (const s of [1, -1]) neonStrip(b, P(s * 0.62, 0.47, -2.2), P(s * 0.62, 0.47, 2.2), k.neon, a.chassis, 0.015);
    for (const z of [-1.0, 0.3]) neonStrip(b, P(-0.6, 0.47, z), P(0.6, 0.47, z), k.neon2, a.chassis, 0.015);
  },
  rings(b: Builder, a: Anchors, k: Palette) {
    for (const key of ["wheelFL", "wheelFR", "wheelRL", "wheelRR"] as const) {
      const m = a[key];
      glow(
        b.part(new THREE.TorusGeometry(0.3, 0.012, 5, 16), k.neon, {
          bone: m.bone,
          at: [m.at[0] + m.s * 0.18, m.at[1], m.at[2]],
          rotation: [0, 90, 0],
        }),
        1.6,
      );
    }
  },
};

// ---------------------------------------------------------------- decals and screens (SVG textures)

const FONT = 'font-family="Arial Black, Arial, Helvetica, sans-serif" font-weight="900"';

export const decals = {
  unitNumber: (n = "07") =>
    svg(
      `<svg viewBox="0 0 128 72"><rect x="4" y="4" width="120" height="64" rx="6" fill="none" stroke="#f2f2f2" stroke-width="5"/><text x="64" y="58" ${FONT} font-size="56" fill="#f2f2f2" text-anchor="middle">${n}</text></svg>`,
      { size: 256 },
    ),
  warning: () =>
    svg(
      `<svg viewBox="0 0 96 96"><polygon points="48,6 92,88 4,88" fill="#f2c20a" stroke="#111" stroke-width="5"/><polygon points="52,26 36,54 48,54 42,76 62,44 50,44 56,26" fill="#111"/></svg>`,
      { size: 256 },
    ),
  brand: () =>
    svg(
      `<svg viewBox="0 0 96 96"><polygon points="48,4 88,26 88,70 48,92 8,70 8,26" fill="#15161a" stroke="#f2f2f2" stroke-width="4"/><polyline points="22,60 48,30 74,60" fill="none" stroke="#f2f2f2" stroke-width="9"/><polyline points="32,74 48,54 64,74" fill="none" stroke="#f2f2f2" stroke-width="7"/></svg>`,
      { size: 256 },
    ),
};

export const screens = {
  hud: () =>
    svg(
      `<svg viewBox="0 0 160 100"><rect width="160" height="100" fill="#06131a"/><g stroke="#0f4b5a" stroke-width="1">${[20, 40, 60, 80, 100, 120, 140].map((x) => `<line x1="${x}" y1="0" x2="${x}" y2="100"/>`).join("")}${[20, 40, 60, 80].map((y) => `<line x1="0" y1="${y}" x2="160" y2="${y}"/>`).join("")}</g><circle cx="80" cy="50" r="22" fill="none" stroke="#2bf0ff" stroke-width="2"/><circle cx="80" cy="50" r="4" fill="#2bf0ff"/><line x1="52" y1="50" x2="108" y2="50" stroke="#2bf0ff" stroke-width="2"/><rect x="8" y="78" width="60" height="6" fill="#0f4b5a"/><rect x="8" y="78" width="44" height="6" fill="#2bf0ff"/><rect x="8" y="88" width="60" height="6" fill="#0f4b5a"/><rect x="8" y="88" width="22" height="6" fill="#ff2bd6"/><text x="152" y="18" font-family="monospace" font-size="12" fill="#2bf0ff" text-anchor="end">SYS OK</text></svg>`,
      { size: 320 },
    ),
  map: () =>
    svg(
      `<svg viewBox="0 0 160 100"><rect width="160" height="100" fill="#071a10"/><g fill="none" stroke="#1f7a3a" stroke-width="2"><path d="M10 80 C 40 60, 60 90, 90 60 S 140 40, 155 20"/><path d="M5 50 C 30 30, 70 70, 100 30 S 130 10, 158 40"/><path d="M20 95 C 50 80, 80 95, 120 75 S 150 70, 160 80"/></g><circle cx="96" cy="46" r="5" fill="#5dff8a"/><circle cx="96" cy="46" r="12" fill="none" stroke="#5dff8a" stroke-width="2"/><text x="8" y="16" font-family="monospace" font-size="11" fill="#5dff8a">GRID 44N</text></svg>`,
      { size: 320 },
    ),
  warning: () =>
    svg(
      `<svg viewBox="0 0 160 100"><rect width="160" height="100" fill="#1a0404"/>${[0, 32, 64, 96, 128].map((x) => `<polygon points="${x},0 ${x + 16},0 ${x + 32},16 ${x + 16},16" fill="#ff3a2a"/>`).join("")}${[0, 32, 64, 96, 128].map((x) => `<polygon points="${x},84 ${x + 16},84 ${x + 32},100 ${x + 16},100" fill="#ff3a2a"/>`).join("")}<text x="80" y="68" ${FONT} font-size="52" fill="#ff3a2a" text-anchor="middle">!</text></svg>`,
      { size: 320 },
    ),
};

/** A drawing on a flat face, a few millimetres out along the mount normal. */
export function decal(
  b: Builder,
  texture: THREE.Texture,
  m: Mount,
  w: number,
  h: number,
  up: V3 = [0, 1, 0],
  lift = 0.006,
) {
  const [x, y, z] = m.at;
  return b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
    bone: m.bone,
    at: [x + m.n[0] * lift, y + m.n[1] * lift, z + m.n[2] * lift],
    dir: m.n,
    up,
    axis: "z",
    texture,
  });
}

/** A glowing drawing on a flat face: a screen in a bezel. */
export function screen(b: Builder, texture: THREE.Texture, m: Mount, w: number, h: number, up: V3 = [0, 1, 0]) {
  const [x, y, z] = m.at;
  b.part(box(w + 0.04, h + 0.04, 0.02), "#111214", {
    bone: m.bone,
    at: [x + m.n[0] * 0.01, y + m.n[1] * 0.01, z + m.n[2] * 0.01],
    dir: m.n,
    up,
    axis: "z",
  }); // bezel
  return glow(decal(b, texture, m, w, h, up, 0.024), 1.4);
}

// ---------------------------------------------------------------- picks, roles and dress

export type Picks = {
  palette?: keyof typeof palettes;
  body?: keyof typeof bodyPaints;
  trim?: keyof typeof trimPaints;
  neon?: keyof typeof neons;
  decal?: keyof typeof decals | "all";
  screen?: keyof typeof screens;
};

export function roles(p: Picks): Roles {
  const k = palettes[p.palette ?? "nightOps"];
  return { ...k, body: bodyPaints[p.body ?? "flat"](k), trim: trimPaints[p.trim ?? "flat"](k) };
}

export function dress(b: Builder, a: Anchors, _c: Roles, p: Picks) {
  const k = palettes[p.palette ?? "nightOps"];
  if (p.neon) neons[p.neon](b, a, k);
  const d = p.decal;
  if (d === "unitNumber" || d === "all")
    for (const side of ["L", "R"] as const)
      decal(b, decals.unitNumber(), { ...a[`bedSide${side}`], at: [a[`bedSide${side}`].at[0], 1.12, -1.0] }, 0.36, 0.2);
  if (d === "warning" || d === "all")
    decal(b, decals.warning(), { ...a.tailgate, at: [0.55, 1.1, a.tailgate.at[2] - 0.03] }, 0.24, 0.24);
  if (d === "brand" || d === "all")
    decal(b, decals.brand(), { ...a.tailgate, at: [-0.5, 1.1, a.tailgate.at[2] - 0.03] }, 0.3, 0.3);
  if (p.screen)
    screen(
      b,
      screens[p.screen](),
      { ...a.cabRear, at: [0.45, a.cabRear.at[1] - 0.05, a.cabRear.at[2] - 0.01] },
      0.4,
      0.25,
    );
}
```
