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

Build from simple primitives: boxes, spheres, cylinders, cones, capsules and tori from three.js, each a clear, readable shape placed and aimed with `b.part`, and rigged on the skeleton you make with `b.joint` and `b.chain`. Reach for the SDK's shaping helpers (sweeps, lofts, extrudes, lathes, membranes, surface hits, paints, cards) only for the pieces simple primitives can't express: a tail or neck that must bend as one smooth piece, a wing membrane, a flat fin or blade outline, a pattern across a body.

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
| **Line**      | a point plus a direction                                                     | any Frame: its position and facing `axis`. `line(a, b)` makes one from two points                                                                                                                                                                                                       |
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

- Exactly one root joint (the first `joint` without `parent`); a second one throws. Joint names match `/^[A-Za-z][A-Za-z0-9_]*$/` and are unique.
- Joints and everything above them are unscaled. Scale lives on meshes (`part({ scale })`, `region`).
- Every mesh sits under its heaviest bone. A mesh that follows several bones carries per-vertex weights (`skinIndex` / `skinWeight` attributes indexing `userData.skinBones`, at most 4 bones per vertex); the creature-lab harness exports them as they are. Everything else is rigid: every vertex on that one bone.
- A three.js mesh you build yourself rides the joint you add it to: `joint.add(mesh)`. One added straight to `b.root` rides the root joint.
- Materials: one shared `MeshStandardMaterial` per colour string (roughness 0.72, metalness 0.04). Painted parts share one material whose map is the paint sheet; textured parts and cards get one material per texture and tint, cut away where the texture is transparent (`alphaTest` 0.5).
- Deterministic: randomness only through an `rng` you pass (`rng(seed)` here, or `kit.rng(seed)`).
- You still own the lab's limits (1000 parts, 120k triangles with a 60k soft budget, 160 joints, 64 flat colours) and resting on y = 0. Textures and paints don't count as colours; they share one atlas (see "Paint, textures and cards"). Parts cost nothing below the limit: the lab merges every part into one mesh on export, so build each piece as its own part. Merging geometry by hand only matters near 1000 parts, and a merged piece is one part on one bone.

## Module

```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { frame, line } from "agentic-3js-builder";
import { aim, lerp, mid, offset, rng } from "agentic-3js-builder";
import { arc, bezier, catmull, polyline, spiral } from "agentic-3js-builder";
import { limb } from "agentic-3js-builder";
import { countershade, paint, spots, stripes } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";

export default function build() {
  const b = createBuilder({ name: "wyvern" }); // { detail } scales tessellation, see "Detail and budget"
  const hips = b.joint("hips", { at: [0, 1, 0] });
  // ...
  return b.root;
}
```

`src/index.ts` re-exports the whole SDK as one module, for apps that map a single import name to it.

Every helper copies its inputs and returns fresh vectors. `V3` is a literal `[x, y, z]` or `THREE.Vector3`; `PointInput`, `DirectionInput`, `FrameInput` and `PathInput` are the kinds above. Plain number arrays are Points and Directions wherever they come from: literals, variables, object fields (`spike.dir`) and `.map` results all type-check as they are, and a point list is a `number[][]`. A literal that isn't exactly 3 numbers throws, naming the call and the value.
