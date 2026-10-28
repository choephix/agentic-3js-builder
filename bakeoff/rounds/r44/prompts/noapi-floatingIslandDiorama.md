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

# SDK conventions

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

These are complete, typecheck-clean reference modules. They are examples, not templates: design the requested subject yourself, reuse API shapes and construction techniques where useful, and do not copy a reference subject or its composition. The picker supplied three structural matches for topology diorama.

## Example: teaHouseDioramaSonnet

Brief: Category: Diorama.
Subject: mountain tea house on a mossy cliff with tiled roofs, bridge, torii, stream, cherry tree, lanterns, tea terraces and sleeping cat.
Style: high-fantasy anime.
Topology: diorama
Style family: high-fantasy-anime
Notable features: building, bridge, waterfall, tree, lanterns

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";
import { frame } from "agentic-3js-builder";
import type { Frame } from "agentic-3js-builder";
import { aim, rng } from "agentic-3js-builder";
import { bezier, catmull } from "agentic-3js-builder";
import { cells, grain, mottle, noise, paint, stripes } from "agentic-3js-builder";
import type { Paint } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { cel, furEdge } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Cherry Bridge Tea House",
  description:
    "A mountain tea house on a mossy cliff terrace: two-tier tiled roofs with gold ridge ornaments and lit shoji, a vermilion arched bridge and torii over a stream that falls from a snow-peaked cliff, a shrine cherry tree in full bloom with drifting glowing petals, stone lanterns, tea terraces, a picnic mat and a sleeping cat.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

type V = [number, number, number];
type P2 = [number, number];
type Mat = Paint | string;

const DEG = Math.PI / 180;
const hash3 = (x: number, y: number, z: number, s: number) => {
  const v = Math.sin(x * 127.1 + y * 311.7 + z * 74.7 + s * 19.19) * 43758.5453;
  return v - Math.floor(v);
};

export default function build() {
  const b = createBuilder({ name: "teaHouseDiorama", paintSize: 2048 });
  const base = b.joint("base", { at: [0, 0, 0] });

  // ---------------------------------------------------------------------------------------------------------------
  // Palette (all cel-shaded paints; shadow tones are hue-shifted by the toon kit)
  const GRASS_RAW = mottle("#7fd857", "#abec6c", { size: 0.17, seed: 5 });
  const TERRAIN = (top: number) =>
    cel(
      furEdge(
        GRASS_RAW,
        paint((p) => (p.y > top - 0.075 ? "#a97c55" : ROCK_RAW)),
        {
          by: "position",
          axis: [0, 1, 0],
          level: top - 0.034,
          teeth: 0.022,
          period: 0.05,
          along: [1, 0, 1],
          ink: "#4f9a3f",
          inkWidth: 0.004,
        },
      ),
    );
  const ROCK_TONES = ["#a99dc0", "#9488b0", "#b9aed0", "#8d82a8"];
  const ROCK_RAW = paint((p, n) => {
    if (p.y > 1.5 + (noise(p, 0.3, 9) - 0.5) * 0.22) return "#f6f8ff";
    const layer = Math.floor((p.y + (noise(p, 0.4, 2) - 0.5) * 0.06) / 0.05);
    const c = cells(p, 0.32, 4);
    let col = ROCK_TONES[(((layer * 7) % 4) + 4) % 4];
    if (c.d2 - c.d1 < 0.05) col = "#6f6590";
    if (n.y > 0.7 && p.y < 1.2 && noise(p, 0.2, 6) > 0.58) col = "#86c46a";
    return col;
  });
  const ROCK = cel(ROCK_RAW);
  const ROCK_DARK = cel("#9d92bb", "#6f6590");
  const STONE = cel(
    paint((p, n) => {
      const row = Math.floor(p.y / 0.026);
      const seam = Math.abs(n.y) < 0.5 && (((Math.abs(n.x) > Math.abs(n.z) ? p.z : p.x) / 0.07 + row * 0.5) % 1 + 1) % 1 < 0.06;
      if (seam || (((p.y / 0.026) % 1) + 1) % 1 < 0.05) return "#a79bb5";
      return "#d9d0e3";
    }),
  );
  const STONE_PLAIN = cel("#d9d0e3", "#a79bb5");
  const WOOD_RED = cel(grain("#e24a35", "#c93a2c", { size: 0.012, axis: "y" }));
  const WOOD_RED_FLAT = cel("#e24a35");
  const WOOD_DARK = cel(grain("#8a4030", "#6f3027", { size: 0.012, axis: "y" }));
  const WOOD_LIGHT = cel(grain("#e9b878", "#d29e5c", { size: 0.01, axis: "x" }));
  const WOOD_BROWN = cel("#a4673e");
  const GOLD = cel("#ffd35a", "#e0952f");
  const PLASTER = cel(mottle("#ffeccb", "#ffe0b8", { size: 0.07, seed: 3 }), "#d9b0b8");
  const STRAW = cel(stripes("#d9d98a", "#bfc274", { size: 0.04, axis: "x", width: 0.5 }));
  const SOFFIT = cel("#6f3a38");
  const TILE = cel(
    paint((p, n) => {
      const col = Math.abs(n.z) > Math.abs(n.x) ? p.x : p.z;
      const a = ((col / 0.028) % 1 + 1) % 1;
      const row = (((p.y + 0.2 * (a > 0.5 ? 0.0 : 0)) / 0.02) % 1 + 1) % 1;
      if (a < 0.1 || row < 0.1) return "#2a4f8c";
      return a < 0.52 ? "#4f8fd8" : "#3f7ac4";
    }),
  );
  const WATER = cel(
    paint((p, n) => {
      if (n.y > 0.5) {
        const bank = Math.min(p.x - xL(p.z), xR(p.z) - p.x);
        const ripple = Math.sin(p.x * 46 + 4.5 * Math.sin(p.z * 6.5) + p.z * 9) > 0.86;
        const foam = bank < 0.045 + 0.02 * Math.sin(p.z * 31);
        if (foam) return "#f4fdff";
        if (ripple) return "#c8f6ff";
        return noise(p, 0.12, 4) > 0.55 ? "#4fc3e6" : "#38aee0";
      }
      const streak = Math.sin(p.x * 95 + 3 * noise(p, 0.08, 2)) > 0.55;
      return streak ? "#eafcff" : "#6fd2f2";
    }),
  );
  const WATERFALL = cel(
    paint((p, n) => {
      if (n.y > 0.5) return "#5ccbea";
      const streak = Math.sin(p.x * 120 + 5 * noise(p, 0.1, 7)) > 0.35 || Math.sin(p.x * 61 + p.y * 3) > 0.9;
      if (p.y < 0.36) return "#ffffff";
      return streak ? "#f3feff" : "#7bd8f4";
    }),
  );
  const FOAM = cel("#ffffff", "#c6d8f0");
  const PINE_A = cel("#2e9c78");
  const PINE_B = cel("#3fb87c");
  const CHERRY_A = cel(mottle("#ffc2dc", "#ffa6cb", { size: 0.1, seed: 12 }));
  const CHERRY_B = cel(mottle("#ffdcea", "#ffc0d9", { size: 0.1, seed: 13 }));
  const CHERRY_C = cel(mottle("#ff9ec8", "#ff86b8", { size: 0.1, seed: 14 }));
  const BARK = cel(grain("#7a5160", "#563a49", { size: 0.012, axis: "y" }));
  const CLOUD = cel("#ffffff", "#c9d2f4");
  const RED_CLOTH = cel("#e2433a");
  const BAMBOO = cel("#7bc76a");
  const BAMBOO_NODE = cel("#a8e08a", "#6aa87c");
  const TEA = cel(mottle("#3fae5c", "#5cc86c", { size: 0.09, seed: 21 }));
  const TEA_NEW = cel(mottle("#8be07a", "#aaf08a", { size: 0.06, seed: 22 }));
  const CREAM = cel("#fff2da", "#e3c8cc");
  const INDIGO = cel("#34479a");
  const BLACK = cel("#3a2a3f", "#241a30");

  // ---------------------------------------------------------------------------------------------------------------
  // Geometry bins: small static pieces are placed in model space and merged per paint into one part each.
  const bins = new Map<Mat, THREE.BufferGeometry[]>();
  const lights = new Map<string, THREE.BufferGeometry[]>();
  type PutOpts = { rx?: number; ry?: number; rz?: number; q?: THREE.Quaternion; s?: number | V };
  const xform = (g: THREE.BufferGeometry, p: V, o: PutOpts) => {
    const q = o.q ?? new THREE.Quaternion().setFromEuler(new THREE.Euler((o.rx ?? 0) * DEG, (o.ry ?? 0) * DEG, (o.rz ?? 0) * DEG, "YXZ"));
    const sc = typeof o.s === "number" ? [o.s, o.s, o.s] : (o.s ?? [1, 1, 1]);
    g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...p), q, new THREE.Vector3(sc[0], sc[1], sc[2])));
    return g;
  };
  const put = (mat: Mat, g: THREE.BufferGeometry, p: V, o: PutOpts = {}) => {
    xform(g, p, o);
    const list = bins.get(mat);
    if (list) list.push(g);
    else bins.set(mat, [g]);
  };
  const lamp = (color: string, g: THREE.BufferGeometry, p: V, o: PutOpts = {}) => {
    xform(g, p, o);
    const list = lights.get(color);
    if (list) list.push(g);
    else lights.set(color, [g]);
  };
  const flatten = (list: THREE.BufferGeometry[]) => {
    const flat = list.map((g) => {
      const n = g.index ? g.toNonIndexed() : g;
      for (const name of Object.keys(n.attributes)) if (name !== "position" && name !== "normal" && name !== "uv") n.deleteAttribute(name);
      return n;
    });
    return mergeGeometries(flat);
  };
  let binCount = 0;
  const flush = () => {
    for (const [mat, list] of bins) {
      const g = flatten(list);
      if (g) b.part(g, mat, { bone: base, at: [0, 0, 0], flat: true, name: `mass${++binCount}` });
    }
    for (const [color, list] of lights) {
      const g = flatten(list);
      if (g) glow(b.part(g, color, { bone: base, at: [0, 0, 0], flat: true, name: `lit${++binCount}` }), 1);
    }
  };
  const box = (m: Mat, p: V, s: V, o: PutOpts = {}) => put(m, new THREE.BoxGeometry(s[0], s[1], s[2]), p, o);
  const cyl = (m: Mat, p: V, rt: number, rb: number, h: number, seg: number, o: PutOpts = {}) =>
    put(m, new THREE.CylinderGeometry(rt, rb, h, seg), p, o);
  const cone = (m: Mat, p: V, r: number, h: number, seg: number, o: PutOpts = {}) =>
    put(m, new THREE.ConeGeometry(r, h, seg), p, o);
  const ball = (m: Mat, p: V, r: number, o: PutOpts = {}, ws = 6, hs = 4) =>
    put(m, new THREE.SphereGeometry(r, ws, hs), p, o);
  const rodBetween = (a: V, c: V, r: number, seg = 6) => {
    const d = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    const len = d.length();
    return {
      geo: new THREE.CylinderGeometry(r, r, len, seg),
      at: [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2] as V,
      o: { q: aim(d.toArray() as V) } as PutOpts,
    };
  };
  const rod = (m: Mat, a: V, c: V, r: number, seg = 6) => {
    const k = rodBetween(a, c, r, seg);
    put(m, k.geo, k.at, k.o);
  };
  const lampRod = (color: string, a: V, c: V, r: number, seg = 6) => {
    const k = rodBetween(a, c, r, seg);
    lamp(color, k.geo, k.at, k.o);
  };

  // ---------------------------------------------------------------------------------------------------------------
  // Layout constants
  const HX = -0.95; // tea house centre
  const HZ = -0.25;
  const FLOOR = 0.62; // house floor level
  const PLATEAU = 0.5; // left plateau top
  const PLATEAU_R = 0.4; // right plateau top
  const WATER_Y = 0.22;
  const BZ = 0.6; // bridge z

  // ---------------------------------------------------------------------------------------------------------------
  // Textures
  const shoji = (extra = "") =>
    svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 48"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc766"/><stop offset="1" stop-color="#fff0bd"/></linearGradient></defs><rect width="60" height="48" fill="url(#g)"/>${extra}<g stroke="#8a4a2b" stroke-width="1.7" fill="none"><path d="M15 0V48M30 0V48M45 0V48M0 12H60M0 24H60M0 36H60"/><rect x="0.9" y="0.9" width="58.2" height="46.2" stroke-width="2.2"/></g></svg>`,
      { size: 256 },
    );
  const SHOJI_A = shoji();
  const SHOJI_B = shoji(
    `<path d="M2 44C14 36 22 32 32 25S50 14 58 6" stroke="#b5532a" stroke-width="2.2" fill="none"/><g fill="#ff9f7a"><circle cx="22" cy="32" r="2.6"/><circle cx="34" cy="24" r="2.8"/><circle cx="46" cy="17" r="2.6"/><circle cx="54" cy="9" r="2.2"/></g>`,
  );
  const SHOJI_C = shoji(
    `<path d="M0 36Q12 24 22 30T44 22T60 18V48H0Z" fill="#ffb25a" opacity="0.7"/><circle cx="46" cy="12" r="6" fill="#ff7a4a" opacity="0.85"/>`,
  );
  const MOON = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><radialGradient id="g"><stop offset="0" stop-color="#fff6cf"/><stop offset="1" stop-color="#ffc766"/></radialGradient></defs><circle cx="24" cy="24" r="23" fill="url(#g)"/><g stroke="#8a4a2b" stroke-width="1.7" fill="none"><path d="M24 1V47M1 24H47M7.7 7.7L40.3 40.3M40.3 7.7L7.7 40.3"/><circle cx="24" cy="24" r="11"/></g><circle cx="24" cy="24" r="22.4" stroke="#e0a63a" stroke-width="2.6" fill="none"/></svg>`,
    { size: 192 },
  );
  const cupEmblem = (fill: string) =>
    `<g fill="${fill}" stroke="${fill}"><path d="M-8 0H8C8 9 3 13 0 13C-3 13 -8 9 -8 0Z" stroke="none"/><path d="M-6 15H6" stroke-width="1.8" fill="none"/><path d="M-3 -3Q-6 -7 -3 -10T-3 -17M3 -3Q0 -7 3 -10T3 -17" stroke-width="1.7" fill="none"/></g>`;
  const NOREN = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40"><g transform="translate(0 40) scale(1 -1)"><g fill="#34479a"><rect x="0" y="0" width="60" height="6"/><rect x="1" y="6" width="18" height="34"/><rect x="21" y="6" width="18" height="34"/><rect x="41" y="6" width="18" height="34"/></g><g fill="#fff6e4"><rect x="1" y="34" width="18" height="2.4"/><rect x="21" y="34" width="18" height="2.4"/><rect x="41" y="34" width="18" height="2.4"/></g><g transform="translate(30 24) scale(0.8)">${cupEmblem("#fff6e4")}</g><g fill="#ffb7d3"><circle cx="10" cy="20" r="3"/><circle cx="7" cy="16" r="1.6"/><circle cx="14" cy="24" r="1.8"/><circle cx="50" cy="20" r="3"/><circle cx="53" cy="16" r="1.6"/><circle cx="46" cy="24" r="1.8"/></g><rect x="0" y="0" width="60" height="1.6" fill="#ffd35a"/></g></svg>`,
    { size: 256 },
  );
  const BANNER = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 100"><g transform="translate(0 100) scale(1 -1)"><rect width="30" height="100" fill="#e2433a"/><rect x="0" y="0" width="30" height="6" fill="#ffd35a"/><rect x="0" y="94" width="30" height="6" fill="#ffd35a"/><rect x="2" y="8" width="2" height="84" fill="#fff6e4"/><rect x="26" y="8" width="2" height="84" fill="#fff6e4"/><g transform="translate(15 44) scale(1.1)">${cupEmblem("#fff6e4")}</g><path d="M6 72Q10 68 15 72T24 72M6 78Q10 74 15 78T24 78" stroke="#fff6e4" stroke-width="1.6" fill="none"/><g fill="#ffb7d3"><circle cx="15" cy="16" r="3"/><circle cx="15" cy="88" r="3"/></g></g></svg>`,
    { size: 256 },
  );
  const SIGN = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 36"><rect x="1" y="1" width="78" height="34" rx="3" fill="#7a2f2a" stroke="#ffd35a" stroke-width="2.4"/><rect x="5" y="5" width="70" height="26" rx="2" fill="none" stroke="#ffd35a" stroke-width="1.2"/><g transform="translate(40 17) scale(0.95)">${cupEmblem("#ffd35a")}</g><g fill="#ffb7d3"><circle cx="14" cy="18" r="3.4"/><circle cx="10" cy="14" r="2"/><circle cx="66" cy="18" r="3.4"/><circle cx="70" cy="14" r="2"/></g></svg>`,
    { size: 256 },
  );
  const MURAL = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 48"><rect x="0" y="0" width="24" height="48" fill="#fff0cc"/><rect x="0" y="0" width="24" height="3" fill="#8a4030"/><rect x="0" y="45" width="24" height="3" fill="#8a4030"/><circle cx="16" cy="12" r="4" fill="#e2433a"/><path d="M2 36L10 18L15 28L19 22L23 36Z" fill="#6f8fd0"/><path d="M8 21L10 18L12 22Z" fill="#fff"/><path d="M0 40Q6 36 12 40T24 40V45H0Z" fill="#8fcfe8"/></svg>`,
    { size: 192 },
  );
  const KARAKUSA = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 12"><rect width="120" height="12" fill="#9c2f2c"/><g stroke="#ffd35a" stroke-width="1.3" fill="none">${[0, 1, 2, 3, 4, 5]
      .map((i) => `<path d="M${i * 20 + 1} 9C${i * 20 + 5} 1 ${i * 20 + 12} 1 ${i * 20 + 12} 6C${i * 20 + 12} 9 ${i * 20 + 8} 9 ${i * 20 + 8} 6S${i * 20 + 14} 11 ${i * 20 + 19} 4"/>`)
      .join("")}</g><g fill="#ffd35a">${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${i * 20 + 10}" cy="6" r="1.3"/>`).join("")}</g></svg>`,
    { size: 640 },
  );
  const blossom = (petal: string, edge: string, heart: string) =>
    svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><g fill="${petal}" stroke="${edge}" stroke-width="1.1">${[0, 1, 2, 3, 4]
        .map((k) => `<ellipse cx="20" cy="9.5" rx="7" ry="9.5" transform="rotate(${k * 72} 20 20)"/>`)
        .join("")}</g><circle cx="20" cy="20" r="3.6" fill="${heart}"/><g stroke="#ff4f8e" stroke-width="0.9">${[0, 1, 2, 3, 4]
        .map((k) => `<path d="M20 20L20 14.5" transform="rotate(${k * 72 + 36} 20 20)"/>`)
        .join("")}</g></svg>`,
      { size: 96 },
    );
  const BLOSSOM = [
    blossom("#ffc6de", "#f68cb6", "#ff7aa8"),
    blossom("#fff0f6", "#ffb3cf", "#ff9ec0"),
    blossom("#ffa6cb", "#f0699f", "#ff5f98"),
  ];
  const PETAL = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffb0d0"/><stop offset="1" stop-color="#fff0f6"/></linearGradient></defs><path d="M12 31C2 24 0 12 6 2L12 8L18 2C24 12 22 24 12 31Z" fill="url(#g)" stroke="#ff9cc4" stroke-width="1.2"/></svg>`,
    { size: 96 },
  );
  const GRASS_TUFT = [
    svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 48"><g fill="#63c444"><path d="M20 48C19 30 14 14 6 2C18 12 24 28 24 48Z"/><path d="M14 48C15 34 12 24 2 14C12 22 19 32 20 48Z"/><path d="M22 48C24 30 30 14 38 4C34 20 32 34 30 48Z"/></g><g fill="#94e45e"><path d="M18 48C20 34 22 22 26 10C28 24 27 38 26 48Z"/></g></svg>`,
      { size: 96 },
    ),
    svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 48"><g fill="#4fb85a"><path d="M16 48C14 34 10 20 4 8C14 18 20 32 22 48Z"/><path d="M24 48C26 30 32 18 36 10C34 24 32 38 30 48Z"/></g><g fill="#86dc62"><path d="M18 48C19 32 21 18 20 4C25 20 26 36 24 48Z"/></g></svg>`,
      { size: 96 },
    ),
  ];
  const flower = (head: string, centre: string) =>
    svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 40"><path d="M12 40V16" stroke="#4aa84a" stroke-width="2.2" fill="none"/><path d="M12 32Q5 30 3 24Q10 25 12 32M12 28Q19 26 21 20Q14 21 12 28" fill="#5cc25a"/><g fill="${head}">${[0, 1, 2, 3, 4, 5]
        .map((k) => `<ellipse cx="12" cy="6.4" rx="2.8" ry="5" transform="rotate(${k * 60} 12 12)"/>`)
        .join("")}</g><circle cx="12" cy="12" r="2.8" fill="${centre}"/></svg>`,
      { size: 96 },
    );
  const FLOWERS = [flower("#ffffff", "#ffd43a"), flower("#ffe05a", "#ff9a2a"), flower("#c7a6ff", "#ffffff"), flower("#ffa0c4", "#fff0a0")];
  const BAMBOO_LEAF = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 64"><path d="M8 63C1 40 2 16 8 1C14 16 15 40 8 63Z" fill="#72c955"/><path d="M8 62V4" stroke="#4aa23c" stroke-width="1.8" fill="none"/></svg>`,
    { size: 128 },
  );
  const SHIDE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 56"><path d="M10 0L18 8L6 16L18 24L6 32L18 40L10 56L2 40L14 32L2 24L14 16L2 8Z" fill="#ffffff" stroke="#bdb8e6" stroke-width="1.4"/></svg>`,
    { size: 128 },
  );
  const CHIME_STRIP = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 40"><g transform="translate(0 40) scale(1 -1)"><path d="M1 0H11V36L6 40L1 36Z" fill="#fff2a8" stroke="#ff9a2a" stroke-width="1.4"/><path d="M6 6V30" stroke="#e2433a" stroke-width="1.6"/></g></svg>`,
    { size: 96 },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Terrain
  function xL(z: number) {
    return -0.3 + 0.05 * Math.sin(2.6 * z + 0.4);
  }
  function xR(z: number) {
    return 0.3 + 0.05 * Math.sin(2.6 * z + 1.2);
  }
  const bankZ = [-0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1.0, 1.15];
  const LEFT: P2[] = [
    [xL(1.15), 1.15],
    [-0.7, 1.17],
    [-1.15, 1.15],
    [-1.4, 1.02],
    [-1.52, 0.65],
    [-1.48, 0.25],
    [-1.53, -0.15],
    [-1.5, -0.6],
    [-1.52, -1.0],
    [-1.36, -1.44],
    [-1.0, -1.5],
    [-0.55, -1.5],
    [-0.4, -1.05],
    ...bankZ.slice(0, 8).map((z): P2 => [xL(z), z]),
  ];
  const RIGHT: P2[] = [
    [xR(1.15), 1.15],
    [0.75, 1.17],
    [1.2, 1.15],
    [1.42, 1.02],
    [1.52, 0.6],
    [1.47, 0.1],
    [1.52, -0.4],
    [1.48, -0.9],
    [1.35, -1.42],
    [1.0, -1.5],
    [0.55, -1.5],
    [0.4, -1.0],
    ...bankZ.slice(0, 8).map((z): P2 => [xR(z), z]),
  ];
  const slabXZ = (pts: P2[], y0: number, y1: number, color: Mat, extra: { bevel?: number; smoothing?: number } = {}) =>
    b.extrude(
      pts.map(([x, z]): OutlinePoint => [x, -z]),
      { at: [0, (y0 + y1) / 2, 0], x: [1, 0, 0], y: [0, 0, -1], thickness: y1 - y0, color, bone: base, ...extra },
    );
  const rockL = 0.43;
  const rockR = 0.34;
  const capH = 0.075;
  const topL = rockL + capH;
  const topR = PLATEAU_R;
  const capL = slabXZ(LEFT, 0, topL, TERRAIN(topL), { smoothing: 1, bevel: 0.012 });
  const capR = slabXZ(RIGHT, 0, topR, TERRAIN(topR), { smoothing: 1, bevel: 0.012 });
  slabXZ(
    [
      [-0.62, -1.5],
      [0.62, -1.5],
      [0.62, -0.8],
      [-0.62, -0.8],
    ],
    0,
    0.34,
    ROCK,
  );

  // Water: a slab whose front face is the front waterfall
  slabXZ(
    [
      [-0.45, -0.82],
      [0.45, -0.82],
      [0.45, 1.19],
      [-0.45, 1.19],
    ],
    0,
    WATER_Y,
    WATER,
    { bevel: 0.016 },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Mountains: faceted tapered columns with strata, snow, pines
  const lumps: [number, number, number, number, number, number, number][] = [
    // cx, cz, y0, rb, rt, h, sides
    [-1.1, -1.08, 0.3, 0.4, 0.015, 1.8, 7],
    [-0.66, -1.15, 0.3, 0.32, 0.015, 1.4, 6],
    [-1.3, -0.85, 0.3, 0.26, 0.015, 0.8, 6],
    [0.5, -1.12, 0.3, 0.34, 0.015, 1.35, 7],
    [1.05, -1.08, 0.3, 0.4, 0.015, 0.9, 7],
    [0.88, -0.74, 0.3, 0.27, 0.02, 0.45, 6],
    [1.38, -0.7, 0.3, 0.2, 0.02, 0.35, 6],
    [-0.08, -1.2, 0.3, 0.26, 0.015, 1.5, 6],
    [-0.88, -1.2, 0.3, 0.26, 0.015, 1.15, 6],
    [-1.3, -1.2, 0.3, 0.26, 0.015, 1.0, 6],
    [0.2, -1.2, 0.3, 0.26, 0.015, 1.2, 6],
    [-0.35, -1.2, 0.3, 0.24, 0.015, 0.95, 6],
    [0.8, -1.2, 0.3, 0.26, 0.015, 1.0, 6],
    [1.32, -1.15, 0.3, 0.24, 0.015, 0.7, 6],
    [-0.62, -1.04, 0.3, 0.46, 0.03, 1.0, 7],
    [0.75, -1.0, 0.3, 0.5, 0.03, 0.9, 7],
    [-0.9, -0.95, 0.3, 0.3, 0.03, 0.7, 7],
    [-0.36, -0.94, 0.3, 0.2, 0.04, 0.72, 6],
    [0.31, -0.93, 0.3, 0.2, 0.04, 0.55, 6],
  ];
  const lumpGeo = (l: number[], seed: number, jit: number) => {
    const [cx, cz, y0, rb, rt, h, sides] = l;
    const g = new THREE.CylinderGeometry(rt, rb, h, sides, 5, false);
    g.rotateY(hash3(seed, 1, 2, 3) * Math.PI);
    g.translate(cx, y0 + h / 2, cz);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const k = jit * (0.4 + (1 - Math.min(1, (y - y0) / h)) * 0.9);
      pos.setXYZ(
        i,
        x + (hash3(x, y, z, seed) - 0.5) * k,
        y + (y > y0 + 0.01 ? (hash3(x, y, z, seed + 5) - 0.5) * k * 0.6 : 0),
        z + (hash3(x, y, z, seed + 9) - 0.5) * k,
      );
    }
    g.computeVertexNormals();
    return g;
  };
  lumps.forEach((l, i) => put(ROCK, lumpGeo(l, 3 + i, 0.12), [0, 0, 0]));
  // the waterfall cliff wall and flanking shoulders
  const wall = new THREE.BoxGeometry(0.7, 1.05, 0.5, 2, 4, 2);
  wall.translate(-0.03, 0.825, -1.05);
  {
    const pos = wall.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const front = z > -0.9;
      const k = front ? 0.012 : 0.05;
      pos.setXYZ(i, x + (hash3(x, y, z, 31) - 0.5) * k, y + (hash3(x, y, z, 32) - 0.5) * k * 0.4, z + (hash3(x, y, z, 33) - 0.5) * k * 0.6);
    }
    wall.computeVertexNormals();
  }
  put(ROCK, wall, [0, 0, 0]);
  // boulders along the water and the base
  const boulders: [number, number, number, number][] = [
    [-0.36, 0.95, rockL, 0.07],
    [-0.4, 0.2, rockL, 0.06],
    [-0.38, -0.5, rockL, 0.08],
    [0.4, -0.45, rockR, 0.07],
    [0.36, 0.25, rockR, 0.06],
    [0.4, 0.95, rockR, 0.08],
    [-1.35, 0.98, rockL + 0.03, 0.09],
    [1.35, 0.95, rockR + 0.03, 0.09],
    [-0.5, 0.2, rockL + 0.07, 0.04],
    [0.55, -0.55, rockR + 0.07, 0.05],
  ];
  boulders.forEach(([x, z, y, r], i) => {
    const g = new THREE.IcosahedronGeometry(r, 0);
    const pos = g.attributes.position;
    for (let j = 0; j < pos.count; j++) {
      const px = pos.getX(j);
      const py = pos.getY(j);
      const pz = pos.getZ(j);
      const k = 1 + (hash3(px, py, pz, i) - 0.5) * 0.35;
      pos.setXYZ(j, px * k * 1.2, py * k * 0.75, pz * k);
    }
    g.computeVertexNormals();
    put(ROCK_DARK, g, [x, y + r * 0.35, z], { ry: i * 40 });
  });

  // Waterfall: upper river ledge, falling sheet, foam
  box(WATERFALL, [0.0, 1.38, -1.0], [0.17, 0.05, 0.42]);
  box(WATERFALL, [0.0, 0.78, -0.78], [0.17, 1.16, 0.05]);
  for (let i = 0; i < 5; i++) ball(FOAM, [-0.07 + i * 0.035, 1.4, -0.77], 0.028 + 0.004 * (i % 2), {}, 6, 4);
  for (let i = 0; i < 8; i++) {
    const a = i * 0.9;
    ball(FOAM, [Math.sin(a) * 0.12, 0.25 + (i % 3) * 0.02, -0.74 + Math.cos(a) * 0.04], 0.04 + 0.012 * (i % 3), { s: [1, 0.8, 1] });
  }
  box(FOAM, [0, 0.62, -0.75], [0.04, 0.2, 0.016]);
  // front fall
  for (let i = 0; i < 9; i++) {
    const a = i * 0.74;
    ball(FOAM, [Math.sin(a * 2) * 0.17, 0.035 + (i % 3) * 0.02, 1.2 + (i % 2) * 0.015], 0.04 + 0.01 * (i % 3), { s: [1, 0.8, 1] });
  }

  // Pines hugging the slopes
  const pine = (x: number, y: number, z: number, h: number, tone: Paint) => {
    cyl(BARK, [x, y + h * 0.1, z], h * 0.04, h * 0.05, h * 0.25, 5);
    for (let k = 0; k < 4; k++) {
      const r = h * (0.34 - k * 0.07);
      cone(tone, [x, y + h * (0.28 + k * 0.2), z], r, h * 0.34, 7, { ry: k * 25 });
    }
  };
  const slopePoint = (li: number, y: number, deg: number): V => {
    const [cx, cz, y0, rb, rt, h] = lumps[li];
    const r = rb + (rt - rb) * ((y - y0) / h) - 0.03;
    return [cx + r * Math.sin(deg * DEG), y, cz + r * Math.cos(deg * DEG)];
  };
  const pinePlan: [number, number, number, number][] = [
    [0, 0.5, -40, 0.2],
    [0, 0.72, 15, 0.17],
    [0, 0.95, 55, 0.14],
    [0, 0.6, 70, 0.16],
    [1, 0.5, -20, 0.18],
    [1, 0.85, 35, 0.15],
    [2, 0.45, 10, 0.17],
    [2, 0.62, -50, 0.13],
    [3, 0.5, 30, 0.2],
    [3, 0.8, -35, 0.15],
    [3, 1.05, 10, 0.12],
    [4, 0.5, 20, 0.2],
    [4, 0.7, -50, 0.16],
    [5, 0.45, 0, 0.14],
    [4, 0.52, 70, 0.17],
    [6, 0.42, -10, 0.14],
    [1, 1.1, -10, 0.12],
    [0, 1.2, -20, 0.11],
    [1, 0.62, -60, 0.14],
    [3, 0.62, 60, 0.15],
    [4, 0.85, -10, 0.12],
    [0, 0.45, -70, 0.17],
    [7, 0.55, 20, 0.14],
    [14, 0.5, 10, 0.16],
    [14, 0.7, -40, 0.13],
    [15, 0.5, -20, 0.17],
    [15, 0.65, 40, 0.14],
    [16, 0.45, 0, 0.13],
    [16, 0.55, 30, 0.11],
    [12, 0.5, 10, 0.13],
    [13, 0.45, 0, 0.12],
  ];
  pinePlan.forEach(([li, y, deg, h], i) => {
    const [x, yy, z] = slopePoint(li, y, deg);
    pine(x, yy, z, h, i % 2 ? PINE_A : PINE_B);
  });
  // pines on the plateaus and by the water
  [
    [-1.4, 0.0, 0.22, 0.45],
  ].forEach(([x, z, h], i) => pine(x, PLATEAU - 0.01, z, h, i % 2 ? PINE_A : PINE_B));

  // Clouds
  const cloud = (cx: number, cy: number, cz: number, s: number) => {
    const parts: [number, number, number, number][] = [
      [0, 0, 0, 0.1],
      [0.1, 0.02, 0.02, 0.08],
      [-0.1, 0.01, -0.01, 0.08],
      [0.2, -0.005, 0, 0.06],
      [-0.19, -0.01, 0.01, 0.06],
    ];
    parts.forEach(([x, y, z, r]) => ball(CLOUD, [cx + x * s, cy + y * s, cz + z * s], r * s, { s: [1, 0.6, 0.9] }, 8, 5));
  };
  cloud(-1.35, 1.05, -0.45, 1.2);
  cloud(0.95, 0.9, -1.1, 1.0);
  cloud(-0.55, 1.6, -1.35, 0.9);
  cloud(1.3, 1.1, -0.55, 0.8);

  // sky lanterns drifting up past the peaks
  const skyLantern = (x: number, y: number, z: number, s: number, turn: number) => {
    lamp("#ffc878", new THREE.CylinderGeometry(0.034 * s, 0.026 * s, 0.075 * s, 4), [x, y, z], { ry: 45 + turn });
    put(RED_CLOTH, new THREE.CylinderGeometry(0.037 * s, 0.037 * s, 0.008 * s, 4), [x, y + 0.04 * s, z], { ry: 45 + turn });
    put(GOLD, new THREE.CylinderGeometry(0.03 * s, 0.03 * s, 0.006 * s, 4), [x, y - 0.04 * s, z], { ry: 45 + turn });
    lamp("#fff2b0", new THREE.SphereGeometry(0.008 * s, 5, 4), [x, y - 0.05 * s, z]);
  };
  [
    [-0.28, 1.12, -0.46, 1.0, 10],
    [0.2, 1.58, -0.3, 1.2, 30],
    [-0.75, 1.78, -0.32, 1.1, 5],
    [0.62, 1.88, -0.5, 1.0, 20],
    [-0.05, 1.98, -0.1, 0.9, 40],
    [1.1, 2.0, -0.2, 0.8, 15],
  ].forEach(([x, y, z, s, t]) => skyLantern(x, y, z, s, t));

  // ---------------------------------------------------------------------------------------------------------------
  // Tea house
  const hx = (l: number) => HX + l;
  const hz = (l: number) => HZ + l;
  // podium and steps
  box(STONE, [HX, 0.55, HZ], [0.96, 0.1, 0.7]);
  box(STONE_PLAIN, [HX, 0.605, HZ], [0.99, 0.022, 0.73]);
  box(WOOD_LIGHT, [HX, 0.62, HZ], [0.92, 0.012, 0.66]);
  for (let i = 0; i < 3; i++) box(STONE, [HX, 0.585 - i * 0.03, HZ + 0.36 + i * 0.05], [0.26 - i * 0.02, 0.03, 0.05]);
  for (const s of [1, -1]) box(STONE, [HX + s * 0.17, 0.55, HZ + 0.4], [0.03, 0.1, 0.13], { ry: 0 });

  // walls
  const WALL_B = FLOOR - 0.0;
  const wallY = WALL_B + 0.125; // centre of a 0.25 tall wall
  const zf = hz(0.15);
  const zb = hz(-0.29);
  const zc = (zf + zb) / 2;
  box(PLASTER, [HX, wallY, zb + 0.01], [0.58, 0.25, 0.02]);
  box(PLASTER, [hx(0.29), wallY, zc], [0.02, 0.25, 0.44]);
  box(PLASTER, [hx(-0.29), wallY, zc], [0.02, 0.25, 0.44]);
  box(WOOD_DARK, [HX, WALL_B + 0.25, zc], [0.6, 0.02, 0.46]);
  box(STRAW, [HX, FLOOR + 0.016, zc], [0.54, 0.02, 0.4]);
  box(PLASTER, [hx(-0.095 - 0.0) - 0.0, wallY, zf - 0.01], [0.2, 0.25, 0.02]);
  box(PLASTER, [hx(0.095 + 0.0), wallY, zf - 0.01], [0.2, 0.25, 0.02]);
  // front wall pieces: left bay [-0.29,-0.095], right bay [0.095,0.29], lintel above the doorway
  // (the two boxes above are centred on the bays; recentre them properly)
  box(PLASTER, [hx(0.0), WALL_B + 0.21, zf - 0.01], [0.19, 0.08, 0.02]);
  // kneewall boards under the windows
  for (const s of [1, -1]) {
    box(WOOD_LIGHT, [hx(s * 0.195), FLOOR + 0.04, zf + 0.004], [0.17, 0.07, 0.012]);
    for (let k = 1; k < 5; k++) box(WOOD_DARK, [hx(s * 0.195 - 0.085 + k * 0.034), FLOOR + 0.04, zf + 0.011], [0.004, 0.07, 0.004]);
  }
  // posts
  const POST_H = 0.25;
  for (const lx of [-0.29, -0.095, 0.095, 0.29]) {
    box(WOOD_DARK, [hx(lx), WALL_B + POST_H / 2, zf + 0.002], [0.026, POST_H, 0.026]);
    box(GOLD, [hx(lx), WALL_B + POST_H - 0.02, zf + 0.002], [0.03, 0.006, 0.03]);
  }
  for (const lz of [-0.29, -0.07]) {
    box(WOOD_DARK, [hx(-0.29), WALL_B + POST_H / 2, hz(lz)], [0.026, POST_H, 0.026]);
    box(WOOD_DARK, [hx(0.29), WALL_B + POST_H / 2, hz(lz)], [0.026, POST_H, 0.026]);
  }
  // beams
  box(WOOD_DARK, [HX, WALL_B + POST_H - 0.01, zf + 0.002], [0.62, 0.024, 0.028]);
  box(WOOD_DARK, [HX, FLOOR + 0.082, zf + 0.002], [0.62, 0.012, 0.026]);
  box(WOOD_DARK, [hx(0.29), WALL_B + POST_H - 0.01, zc], [0.028, 0.024, 0.46]);
  box(WOOD_DARK, [hx(-0.29), WALL_B + POST_H - 0.01, zc], [0.028, 0.024, 0.46]);
  box(WOOD_DARK, [hx(0.29), FLOOR + 0.082, zc], [0.026, 0.012, 0.44]);
  box(WOOD_DARK, [hx(-0.29), FLOOR + 0.082, zc], [0.026, 0.012, 0.44]);
  box(WOOD_DARK, [HX, FLOOR + 0.004, zf + 0.002], [0.6, 0.012, 0.03]); // sill

  const plane = (tex: THREE.Texture, c: V, out: V, w: number, h: number, strength = 1) =>
    glow(
      b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: base, at: c, dir: out, axis: "z", texture: tex, name: "pane" }),
      strength,
    );
  const winFrame = (c: V, out: V, w: number, h: number, mat: Mat = WOOD_DARK) => {
    const onZ = Math.abs(out[2]) > 0.5;
    const sgn = onZ ? Math.sign(out[2]) : Math.sign(out[0]);
    const off = 0.003 * sgn;
    const bar = (dx: number, dy: number, sw: number, sh: number) => {
      if (onZ) box(mat, [c[0] + dx, c[1] + dy, c[2] + off], [sw, sh, 0.01]);
      else box(mat, [c[0] + off, c[1] + dy, c[2] + dx], [0.01, sh, sw]);
    };
    bar(0, h / 2 + 0.005, w + 0.02, 0.012);
    bar(0, -h / 2 - 0.005, w + 0.02, 0.012);
    bar(w / 2 + 0.005, 0, 0.012, h + 0.02);
    bar(-w / 2 - 0.005, 0, 0.012, h + 0.02);
  };
  const win = (c: V, out: V, w: number, h: number, tex: THREE.Texture) => {
    plane(tex, [c[0] + out[0] * 0.003, c[1], c[2] + out[2] * 0.003], out, w, h);
    winFrame(c, out, w, h);
  };
  // ground floor windows
  win([hx(-0.195), FLOOR + 0.145, zf + 0.002], [0, 0, 1], 0.165, 0.115, SHOJI_B);
  win([hx(0.195), FLOOR + 0.145, zf + 0.002], [0, 0, 1], 0.165, 0.115, SHOJI_A);
  win([hx(0.29) + 0.002, FLOOR + 0.145, zc], [1, 0, 0], 0.3, 0.115, SHOJI_C);
  win([hx(-0.29) - 0.002, FLOOR + 0.145, zc], [-1, 0, 0], 0.3, 0.115, SHOJI_B);
  win([HX, FLOOR + 0.145, zb + 0.022], [0, 0, 1], 0.3, 0.1, SHOJI_A);
  // lintel gold karakusa
  b.part(new THREE.PlaneGeometry(0.19, 0.019), "#ffffff", { bone: base, at: [HX, FLOOR + 0.2, zf + 0.0], dir: [0, 0, 1], axis: "z", texture: KARAKUSA, name: "lintel" });
  // interior
  box(WOOD_DARK, [HX, FLOOR + 0.07, zb + 0.025], [0.5, 0.004, 0.04]);
  b.part(new THREE.PlaneGeometry(0.075, 0.14), "#ffffff", { bone: base, at: [HX + 0.1, FLOOR + 0.13, zb + 0.022], dir: [0, 0, 1], axis: "z", texture: MURAL, name: "mural" });
  const ZT = zc - 0.01;
  box(WOOD_BROWN, [HX, FLOOR + 0.058, ZT], [0.12, 0.012, 0.08]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(WOOD_DARK, [HX + sx * 0.05, FLOOR + 0.04, ZT + sz * 0.03], [0.012, 0.04, 0.012]);
  for (const sz of [-1, 1]) box(RED_CLOTH, [HX, FLOOR + 0.04, ZT + sz * 0.1], [0.075, 0.022, 0.075]);
  box(CREAM, [HX - 0.03, FLOOR + 0.07, ZT], [0.03, 0.012, 0.03]);
  ball(CREAM, [HX + 0.03, FLOOR + 0.078, ZT], 0.014, { s: [1, 0.85, 1] });
  lampRod("#ffe7a0", [HX, FLOOR + 0.245, ZT], [HX, FLOOR + 0.2, ZT], 0.002);
  lamp("#ffd27a", new THREE.SphereGeometry(0.022, 8, 6), [HX, FLOOR + 0.185, ZT], { s: [1, 1.2, 1] });
  // noren rod and hinged curtain
  const norenJ = b.joint("noren", { parent: base, at: [HX, FLOOR + 0.2, zf + 0.012], dir: [0, -1, 0], role: "hinge" });
  b.rod([hx(-0.1), FLOOR + 0.2, zf + 0.012], [hx(0.1), FLOOR + 0.2, zf + 0.012], 0.005, { color: WOOD_DARK, bone: base, caps: "round" });
  b.cards([frame([HX, FLOOR + 0.196, zf + 0.012], [0, 1, 0])], NOREN, {
    size: [0.19, 0.11],
    lean: 180,
    flow: [0, 0, 1],
    bone: norenJ,
    sink: 0,
  });

  // veranda posts and railings
  const verandaPosts: [number, number][] = [
    [-0.39, 0.305],
    [0.39, 0.305],
    [-0.39, -0.315],
    [0.39, -0.315],
  ];
  for (const [lx, lz] of verandaPosts) {
    cyl(WOOD_RED, [hx(lx), FLOOR + 0.135, hz(lz)], 0.013, 0.015, 0.27, 8);
    cyl(STONE_PLAIN, [hx(lx), FLOOR + 0.012, hz(lz)], 0.022, 0.026, 0.024, 8);
    cyl(GOLD, [hx(lx), FLOOR + 0.245, hz(lz)], 0.017, 0.017, 0.012, 8);
    box(WOOD_RED_FLAT, [hx(lx), FLOOR + 0.268, hz(lz)], [0.052, 0.014, 0.052]);
  }
  const rail = (a: V, c: V, y: number) => {
    rod(WOOD_RED_FLAT, [a[0], y, a[2]], [c[0], y, c[2]], 0.0075, 6);
  };
  rail([hx(-0.39), 0, hz(0.305)], [hx(-0.13), 0, hz(0.305)], FLOOR + 0.085);
  rail([hx(0.13), 0, hz(0.305)], [hx(0.39), 0, hz(0.305)], FLOOR + 0.085);
  rail([hx(-0.39), 0, hz(0.305)], [hx(-0.39), 0, hz(-0.315)], FLOOR + 0.085);
  rail([hx(0.39), 0, hz(0.305)], [hx(0.39), 0, hz(-0.315)], FLOOR + 0.085);
  rail([hx(-0.39), 0, hz(0.305)], [hx(-0.13), 0, hz(0.305)], FLOOR + 0.04);
  rail([hx(0.13), 0, hz(0.305)], [hx(0.39), 0, hz(0.305)], FLOOR + 0.04);
  for (const sx of [-1, 1])
    for (let k = 1; k < 4; k++) {
      const lz = 0.305 - k * 0.155;
      cyl(WOOD_RED_FLAT, [hx(sx * 0.39), FLOOR + 0.05, hz(lz)], 0.005, 0.005, 0.085, 5);
    }
  for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) cyl(WOOD_RED_FLAT, [hx(sx * (0.2 + k * 0.065) ), FLOOR + 0.05, hz(0.305)], 0.005, 0.005, 0.085, 5);
  for (const sx of [-1, 1]) for (let k = 0; k < 2; k++) void k, sx;

  // roofs
  type RoofSpec = { hw: number; hd: number; tw: number; td: number; h: number; lift: number; pw: number; thick: number; K: number; L: number };
  const roofPoint = (r: RoofSpec, t: number, u: number, v: number): V => {
    const hxx = r.hw + (r.tw - r.hw) * t;
    const hzz = r.hd + (r.td - r.hd) * t;
    const c = Math.abs(u * v);
    return [u * hxx, r.h * Math.pow(t, r.pw) + r.lift * c * c * (1 - t) * (1 - t), v * hzz];
  };
  const ringUV = (K: number) => {
    const pts: P2[] = [];
    for (let i = 0; i < K; i++) pts.push([-1 + (2 * i) / K, 1]);
    for (let i = 0; i < K; i++) pts.push([1, 1 - (2 * i) / K]);
    for (let i = 0; i < K; i++) pts.push([1 - (2 * i) / K, -1]);
    for (let i = 0; i < K; i++) pts.push([-1, -1 + (2 * i) / K]);
    return pts;
  };
  const mkGeo = (arr: number[]) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(new Array((arr.length / 3) * 2).fill(0), 2));
    g.computeVertexNormals();
    return g;
  };
  const roof = (cx: number, cy: number, cz: number, r: RoofSpec, ridge: boolean) => {
    const uv = ringUV(r.K);
    const N = uv.length;
    const top: number[] = [];
    const under: number[] = [];
    const fas: number[] = [];
    const P = (t: number, i: number, dy = 0): V => {
      const [u, v] = uv[i % N];
      const q = roofPoint(r, t, u, v);
      return [cx + q[0], cy + q[1] + dy, cz + q[2]];
    };
    const tri = (arr: number[], p: V, q: V, s: V) => {
      const ux = q[0] - p[0];
      const uy = q[1] - p[1];
      const uz = q[2] - p[2];
      const vx = s[0] - p[0];
      const vy = s[1] - p[1];
      const vz = s[2] - p[2];
      const cxp = uy * vz - uz * vy;
      const cyp = uz * vx - ux * vz;
      const czp = ux * vy - uy * vx;
      if (cxp * cxp + cyp * cyp + czp * czp < 1e-12) return;
      arr.push(...p, ...q, ...s);
    };
    for (let k = 0; k < r.L; k++) {
      const t0 = k / r.L;
      const t1 = (k + 1) / r.L;
      for (let i = 0; i < N; i++) {
        tri(top, P(t0, i), P(t0, i + 1), P(t1, i + 1));
        tri(top, P(t0, i), P(t1, i + 1), P(t1, i));
        tri(under, P(t0, i, -r.thick), P(t1, i + 1, -r.thick), P(t0, i + 1, -r.thick));
        tri(under, P(t0, i, -r.thick), P(t1, i, -r.thick), P(t1, i + 1, -r.thick));
      }
    }
    for (let i = 0; i < N; i++) {
      tri(fas, P(0, i), P(0, i, -r.thick), P(0, i + 1, -r.thick));
      tri(fas, P(0, i), P(0, i + 1, -r.thick), P(0, i + 1));
    }
    put(TILE, mkGeo(top), [0, 0, 0]);
    put(SOFFIT, mkGeo(under), [0, 0, 0]);
    put(GOLD, mkGeo(fas), [0, 0, 0]);
    // hip lines and ridge in gold-trimmed blue
    for (const [u, v] of [
      [-1, 1],
      [1, 1],
      [1, -1],
      [-1, -1],
    ] as P2[]) {
      for (let k = 0; k < r.L; k++) {
        const a = roofPoint(r, k / r.L, u, v);
        const c = roofPoint(r, (k + 1) / r.L, u, v);
        rod(cel("#7cb6ee", "#4a78c0"), [cx + a[0], cy + a[1] + 0.004, cz + a[2]], [cx + c[0], cy + c[1] + 0.004, cz + c[2]], 0.0065, 5);
      }
    }
    if (ridge) {
      const a = roofPoint(r, 1, -1, 0);
      const c = roofPoint(r, 1, 1, 0);
      rod(cel("#7cb6ee", "#4a78c0"), [cx + a[0], cy + a[1] + 0.006, cz], [cx + c[0], cy + c[1] + 0.006, cz], 0.0085, 6);
      rod(GOLD, [cx + a[0] - 0.012, cy + a[1] + 0.012, cz], [cx + c[0] + 0.012, cy + c[1] + 0.012, cz], 0.0035, 5);
      // gold ridge-end ornaments: upswept shachi-like horns
      for (const s of [-1, 1]) {
        const ex = cx + s * (r.tw + 0.006);
        const ey = cy + r.h + 0.004;
        cone(GOLD, [ex + s * 0.012, ey + 0.032, cz], 0.016, 0.07, 6, { rz: -s * 24 });
        ball(GOLD, [ex + s * 0.002, ey + 0.006, cz], 0.016, {}, 6, 4);
        cone(GOLD, [ex + s * 0.03, ey + 0.066, cz], 0.006, 0.03, 5, { rz: -s * 55 });
      }
      // hōju finial in the middle of the ridge
      ball(GOLD, [cx, cy + r.h + 0.03, cz], 0.02, { s: [1, 1.15, 1] }, 8, 6);
      cone(GOLD, [cx, cy + r.h + 0.062, cz], 0.012, 0.04, 6);
      cyl(GOLD, [cx, cy + r.h + 0.01, cz], 0.014, 0.017, 0.014, 8);
    }
    // gold bells hanging from the four eave corners
    for (const [u, v] of [
      [-1, 1],
      [1, 1],
      [1, -1],
      [-1, -1],
    ] as P2[]) {
      const q = roofPoint(r, 0, u, v);
      const bx = cx + q[0] + u * 0.012;
      const bz = cz + q[2] + v * 0.012;
      const by = cy + q[1] - r.thick;
      rod(GOLD, [bx, by, bz], [bx, by - 0.016, bz], 0.0016, 4);
      cone(GOLD, [bx, by - 0.03, bz], 0.011, 0.02, 6, { rx: 180 });
      ball(GOLD, [bx, by - 0.04, bz], 0.0035, {}, 4, 3);
    }
    // eave end-tile discs
    for (let i = 0; i < N; i++) {
      const [u, v] = uv[i];
      const p = P(0, i, -r.thick * 0.5);
      const n: V = Math.abs(v) > 0.99 ? [0, 0, Math.sign(v)] : [Math.sign(u), 0, 0];
      const d = 0.01;
      const geo = new THREE.CylinderGeometry(0.0125, 0.0125, 0.006, 8);
      put(WOOD_RED_FLAT, geo, [p[0] + n[0] * d, p[1], p[2] + n[2] * d], { q: aim(n) });
      put(GOLD, new THREE.CylinderGeometry(0.0055, 0.0055, 0.008, 6), [p[0] + n[0] * (d + 0.001), p[1], p[2] + n[2] * (d + 0.001)], { q: aim(n) });
    }
  };
  const lowerRoof: RoofSpec = { hw: 0.45, hd: 0.36, tw: 0.25, td: 0.17, h: 0.135, lift: 0.04, pw: 1.5, thick: 0.014, K: 8, L: 5 };
  const upperRoof: RoofSpec = { hw: 0.38, hd: 0.29, tw: 0.12, td: 0.0, h: 0.19, lift: 0.045, pw: 1.7, thick: 0.014, K: 8, L: 6 };
  const ROOF_Y = FLOOR + 0.265;
  roof(HX, ROOF_Y, HZ, lowerRoof, false);
  // upper floor
  const UF = ROOF_Y + lowerRoof.h - 0.012; // floor of upper storey
  const UH = 0.22;
  const uz = HZ - 0.0;
  box(PLASTER, [HX, UF + UH / 2, uz], [0.46, UH, 0.32]);
  box(WOOD_DARK, [HX, UF + UH - 0.01, uz], [0.5, 0.022, 0.36]);
  box(WOOD_DARK, [HX, UF + 0.01, uz], [0.5, 0.022, 0.36]);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) box(WOOD_DARK, [HX + sx * 0.23, UF + UH / 2, uz + sz * 0.16], [0.026, UH, 0.026]);
  for (const sx of [-0.115, 0.115]) box(WOOD_DARK, [HX + sx, UF + UH / 2, uz + 0.162], [0.02, UH, 0.012]);
  win([HX - 0.165, UF + UH / 2 - 0.005, uz + 0.162], [0, 0, 1], 0.1, 0.13, SHOJI_A);
  win([HX + 0.165, UF + UH / 2 - 0.005, uz + 0.162], [0, 0, 1], 0.1, 0.13, SHOJI_C);
  // central gold-framed round window
  plane(MOON, [HX, UF + UH / 2, uz + 0.165], [0, 0, 1], 0.12, 0.12);
  win([HX + 0.232, UF + UH / 2, uz], [1, 0, 0], 0.2, 0.13, SHOJI_B);
  win([HX - 0.232, UF + UH / 2, uz], [-1, 0, 0], 0.2, 0.13, SHOJI_A);
  win([HX, UF + UH / 2, uz - 0.162], [0, 0, -1], 0.2, 0.13, SHOJI_C);
  // balcony rail in front of the upper storey, resting on the lower roof
  rod(WOOD_RED_FLAT, [HX - 0.26, UF + 0.045, uz + 0.2], [HX + 0.26, UF + 0.045, uz + 0.2], 0.007, 6);
  rod(WOOD_RED_FLAT, [HX - 0.26, UF + 0.02, uz + 0.2], [HX + 0.26, UF + 0.02, uz + 0.2], 0.0045, 5);
  for (let i = 0; i <= 8; i++) cyl(WOOD_RED_FLAT, [HX - 0.26 + i * 0.065, UF + 0.03, uz + 0.2], 0.0055, 0.0055, 0.05, 5);
  for (const s of [-1, 1]) {
    cyl(WOOD_RED, [HX + s * 0.26, UF + 0.03, uz + 0.2], 0.01, 0.01, 0.07, 6);
    ball(GOLD, [HX + s * 0.26, UF + 0.07, uz + 0.2], 0.011, {}, 6, 4);
  }
  roof(HX, UF + UH, uz, upperRoof, true);
  // petals resting on the roof slopes
  {
    const rr = rng(91);
    const onRoof = (spec: RoofSpec, cx: number, cy: number, cz: number, ts: number[], nrm: V): Frame[] =>
      ts.map((t) => {
        const q = roofPoint(spec, t, -0.7 + rr() * 1.4, 1);
        return frame([cx + q[0], cy + q[1] + 0.004, cz + q[2]], nrm);
      });
    const roofPetals = [
      ...onRoof(lowerRoof, HX, ROOF_Y, HZ, [0.2, 0.35, 0.5, 0.65, 0.3, 0.55, 0.45, 0.75], [0, 0.82, 0.58]),
      ...onRoof(upperRoof, HX, UF + UH, uz, [0.15, 0.3, 0.45, 0.6, 0.25, 0.5], [0, 0.84, 0.54]),
    ];
    b.cards(roofPetals, PETAL, {
      size: 0.032,
      lean: 90,
      flow: (_f, i) => [Math.cos(i * 2.2), -0.4, Math.sin(i * 2.2)],
      vary: 0.3,
      rng: rng(92),
      bone: base,
      sink: 0,
      mirror: true,
    });
  }

  // under-eave brackets and veranda beam
  for (const [lx, lz] of verandaPosts) {
    box(WOOD_DARK, [hx(lx), ROOF_Y - 0.004, hz(lz)], [0.07, 0.01, 0.07]);
    box(GOLD, [hx(lx), ROOF_Y - 0.012, hz(lz)], [0.03, 0.006, 0.03]);
  }
  box(WOOD_DARK, [HX, ROOF_Y - 0.01, hz(0.305)], [0.8, 0.014, 0.022]);

  // hanging paper lanterns (hinged)
  const hangLantern = (name: string, x: number, y: number, z: number, scale: number) => {
    const j = b.joint(name, { parent: base, at: [x, y, z], dir: [0, -1, 0], role: "hinge" });
    const cy = y - 0.075 * scale;
    glow(b.part(new THREE.SphereGeometry(0.03 * scale, 8, 6), "#ff9a3c", { bone: j, at: [x, cy, z], scale: [1, 1.25, 1], name: `${name}Body` }), 1.2);
    b.part(new THREE.CylinderGeometry(0.019 * scale, 0.022 * scale, 0.01 * scale, 8), BLACK, { bone: j, at: [x, y - 0.03 * scale, z], name: `${name}Cap` });
    b.part(new THREE.CylinderGeometry(0.022 * scale, 0.019 * scale, 0.01 * scale, 8), BLACK, { bone: j, at: [x, y - 0.12 * scale, z], name: `${name}Foot` });
    b.part(new THREE.CylinderGeometry(0.0015, 0.0015, 0.03 * scale, 4), "#3a2a3f", { bone: j, at: [x, y - 0.012 * scale, z], name: `${name}Cord` });
    for (const k of [-0.35, 0.35]) b.part(new THREE.CylinderGeometry(0.0315 * scale, 0.0315 * scale, 0.004 * scale, 8), BLACK, { bone: j, at: [x, cy + k * 0.045 * scale * 1.3, z], name: `${name}Rib${k}` });
    b.part(new THREE.ConeGeometry(0.009 * scale, 0.045 * scale, 5), GOLD, { bone: j, at: [x, y - 0.15 * scale, z], rotation: [180, 0, 0], name: `${name}Tassel` });
  };
  hangLantern("lanternL", hx(-0.3), ROOF_Y + 0.002, hz(0.335), 1.0);
  hangLantern("lanternR", hx(0.3), ROOF_Y + 0.002, hz(0.335), 1.0);
  hangLantern("lanternBack", hx(0.43), ROOF_Y - 0.012, hz(-0.03), 0.85);

  // hanging sign on a bracket arm
  {
    const sx = hx(0.39);
    const sz = hz(0.305);
    const sy = FLOOR + 0.2;
    rod(WOOD_DARK, [sx, sy, sz], [sx + 0.12, sy, sz], 0.005, 5);
    rod(WOOD_DARK, [sx + 0.0, sy - 0.04, sz], [sx + 0.06, sy, sz], 0.004, 5);
    ball(GOLD, [sx + 0.122, sy, sz], 0.008, {}, 6, 4);
    const sj = b.joint("sign", { parent: base, at: [sx + 0.095, sy - 0.004, sz], dir: [0, -1, 0], role: "hinge" });
    b.part(new THREE.BoxGeometry(0.1, 0.07, 0.012), WOOD_DARK, { bone: sj, at: [sx + 0.095, sy - 0.05, sz], name: "signBoard" });
    b.part(new THREE.PlaneGeometry(0.09, 0.0405), "#ffffff", { bone: sj, at: [sx + 0.095, sy - 0.05, sz + 0.0068], dir: [0, 0, 1], axis: "z", texture: SIGN, name: "signFace" });
    for (const s of [-1, 1]) b.part(new THREE.CylinderGeometry(0.0015, 0.0015, 0.016, 4), "#3a2a3f", { bone: sj, at: [sx + 0.095 + s * 0.04, sy - 0.012, sz], name: `signChain${s}` });
  }

  // wind chime on the upper eave
  {
    const cx0 = HX + 0.3;
    const cy0 = UF + UH + 0.0;
    const cz0 = uz + 0.2;
    const j = b.joint("chime", { parent: base, at: [cx0, cy0, cz0], dir: [0, -1, 0], role: "hinge" });
    b.part(new THREE.ConeGeometry(0.018, 0.026, 8, 1, true), cel("#9fe8f0", "#58b6d6"), { bone: j, at: [cx0, cy0 - 0.032, cz0], rotation: [180, 0, 0], name: "chimeBell" });
    b.part(new THREE.CylinderGeometry(0.0012, 0.0012, 0.02, 4), "#3a2a3f", { bone: j, at: [cx0, cy0 - 0.012, cz0], name: "chimeCord" });
    b.part(new THREE.CylinderGeometry(0.0012, 0.0012, 0.03, 4), "#3a2a3f", { bone: j, at: [cx0, cy0 - 0.04, cz0], name: "chimeClapper" });
    b.cards([frame([cx0, cy0 - 0.054, cz0], [0, 1, 0])], CHIME_STRIP, { size: [0.012, 0.05], lean: 180, flow: [0, 0, 1], bone: j, sink: 0 });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Nobori banners at the foot of the steps
  for (const s of [-1, 1]) {
    const px = HX + s * 0.34;
    const pz = HZ + 0.52;
    cyl(WOOD_DARK, [px, PLATEAU + 0.28, pz], 0.006, 0.007, 0.56, 6);
    cone(GOLD, [px, PLATEAU + 0.585, pz], 0.011, 0.03, 6);
    cyl(STONE, [px, PLATEAU + 0.012, pz], 0.025, 0.03, 0.024, 6);
    rod(WOOD_DARK, [px, PLATEAU + 0.52, pz], [px + s * -0.09, PLATEAU + 0.52, pz], 0.0045, 5);
    ball(GOLD, [px - s * 0.09, PLATEAU + 0.52, pz], 0.0065, {}, 5, 4);
    const nj = b.joint(s > 0 ? "noboriL" : "noboriR", { parent: base, at: [px - s * 0.045, PLATEAU + 0.518, pz], dir: [0, -1, 0], role: "hinge" });
    b.cards([frame([px - s * 0.045, PLATEAU + 0.516, pz], [0, 1, 0])], BANNER, {
      size: [0.085, 0.28],
      lean: 180,
      flow: [0, 0, 1],
      bone: nj,
      sink: 0,
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Bridge
  const deckPath = bezier([-0.58, 0.515, BZ], [-0.22, 0.9, BZ], [0.18, 0.9, BZ], [0.66, 0.42, BZ]);
  const deckAt = (t: number) => {
    const p = deckPath.at(t);
    const tg = deckPath.tangentAt(t);
    return { p: [p.x, p.y, p.z] as V, tg: [tg.x, tg.y, tg.z] as V };
  };
  const PLANKS = 26;
  for (let i = 0; i < PLANKS; i++) {
    const { p, tg } = deckAt((i + 0.5) / PLANKS);
    const q = aim(tg, [0, 1, 0], "x");
    put(i % 2 ? WOOD_LIGHT : cel(grain("#f0c488", "#d9a362", { size: 0.01, axis: "x" })), new THREE.BoxGeometry(0.047, 0.014, 0.19), [p[0], p[1] - 0.007, p[2]], { q });
  }
  // under-beams and arched stringers
  for (const s of [-1, 1]) {
    const pts: V[] = [];
    for (let i = 0; i <= 12; i++) {
      const { p } = deckAt(i / 12);
      pts.push([p[0], p[1] - 0.03, BZ + s * 0.07]);
    }
    b.sweep(catmull(pts), () => [0.012, 0.018], { section: "box", color: WOOD_RED_FLAT, bone: base, caps: "flat" });
  }
  // end beams buried in the banks
  for (const [x, y] of [
    [-0.62, 0.5],
    [0.7, 0.4],
  ])
    box(STONE, [x, y + 0.005, BZ], [0.12, 0.03, 0.26]);
  // posts, caps and rails
  const POSTS = 11;
  for (const s of [-1, 1]) {
    const railTop: V[] = [];
    const railLow: V[] = [];
    for (let i = 0; i < POSTS; i++) {
      const { p } = deckAt(i / (POSTS - 1));
      const z = BZ + s * 0.095;
      const big = i === 0 || i === POSTS - 1;
      cyl(WOOD_RED, [p[0], p[1] + 0.045, z], big ? 0.014 : 0.01, big ? 0.015 : 0.011, 0.09, 8);
      ball(GOLD, [p[0], p[1] + 0.098, z], big ? 0.017 : 0.0125, { s: [1, 1.15, 1] }, 7, 5);
      cyl(GOLD, [p[0], p[1] + 0.088, z], big ? 0.017 : 0.013, big ? 0.017 : 0.013, 0.006, 8);
      railTop.push([p[0], p[1] + 0.078, z]);
      railLow.push([p[0], p[1] + 0.04, z]);
    }
    b.sweep(catmull(railTop), 0.0085, { color: WOOD_RED_FLAT, bone: base, sides: 6, caps: "round" });
    b.sweep(catmull(railLow), 0.006, { color: WOOD_RED_FLAT, bone: base, sides: 5, caps: "round" });
    // balusters between posts
    for (let i = 0; i < 20; i++) {
      const { p } = deckAt((i + 0.5) / 20);
      cyl(WOOD_RED_FLAT, [p[0], p[1] + 0.036, BZ + s * 0.095], 0.003, 0.003, 0.07, 4);
    }
  }
  // koshi lattice facing on the deck edge boards
  for (const s of [-1, 1]) {
    const pts: V[] = [];
    for (let i = 0; i <= 12; i++) {
      const { p } = deckAt(i / 12);
      pts.push([p[0], p[1] + 0.003, BZ + s * 0.1]);
    }
    b.sweep(catmull(pts), () => [0.004, 0.006], { section: "box", color: GOLD, bone: base, caps: "flat" });
  }

  // torii over the bridge's far end
  {
    const tx = 0.8;
    const gy = PLATEAU_R;
    const legZ = [BZ - 0.17, BZ + 0.17];
    const H = 0.34;
    for (const z of legZ) {
      cyl(WOOD_RED, [tx, gy + H / 2, z], 0.017, 0.021, H, 8);
      cyl(BLACK, [tx, gy + 0.02, z], 0.024, 0.024, 0.04, 8);
      cyl(BLACK, [tx, gy + H - 0.045, z], 0.0195, 0.0195, 0.012, 8);
    }
    rod(WOOD_RED_FLAT, [tx, gy + H - 0.085, legZ[0] - 0.03], [tx, gy + H - 0.085, legZ[1] + 0.03], 0.0125, 6);
    // kasagi upper beam with upswept ends
    const ky = gy + H + 0.005;
    const kas: V[] = [];
    for (let i = 0; i <= 10; i++) {
      const u = (i / 10) * 2 - 1;
      kas.push([tx, ky + 0.03 * u * u * u * u + 0.008 * Math.abs(u) ** 2, BZ + u * 0.25]);
    }
    b.sweep(catmull(kas), [0.018, 0.018], { color: BLACK, bone: base, sides: 6, caps: "round" });
    const shi: V[] = [];
    for (let i = 0; i <= 8; i++) {
      const u = (i / 8) * 2 - 1;
      shi.push([tx, ky - 0.028 + 0.012 * u * u, BZ + u * 0.22]);
    }
    b.sweep(catmull(shi), 0.011, { color: WOOD_RED_FLAT, bone: base, sides: 6, caps: "round" });
    // gaku plaque
    box(GOLD, [tx, gy + H - 0.05, BZ], [0.012, 0.05, 0.075]);
    box(INDIGO, [tx, gy + H - 0.05, BZ], [0.016, 0.04, 0.065]);
    for (const s of [-1, 1]) lamp("#ffd35a", new THREE.CylinderGeometry(0.008, 0.008, 0.02, 8), [tx + s * 0.0095, gy + H - 0.05, BZ], { rz: 90 });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Stone lanterns (toro)
  const toro = (x: number, y: number, z: number, s: number) => {
    cyl(STONE, [x, y + 0.01 * s, z], 0.05 * s, 0.056 * s, 0.02 * s, 6);
    cyl(STONE, [x, y + 0.062 * s, z], 0.014 * s, 0.017 * s, 0.085 * s, 6);
    cyl(STONE, [x, y + 0.118 * s, z], 0.042 * s, 0.032 * s, 0.022 * s, 6);
    cyl(STONE_PLAIN, [x, y + 0.155 * s, z], 0.03 * s, 0.03 * s, 0.05 * s, 4, { ry: 45 });
    for (const a of [0, 90, 180, 270]) {
      const nx = Math.sin(a * DEG);
      const nz = Math.cos(a * DEG);
      lamp("#ffd27a", new THREE.BoxGeometry(0.026 * s, 0.03 * s, 0.006 * s), [x + nx * 0.0215 * s, y + 0.156 * s, z + nz * 0.0215 * s], { ry: a });
    }
    cone(STONE, [x, y + 0.205 * s, z], 0.062 * s, 0.045 * s, 6);
    cyl(STONE, [x, y + 0.178 * s, z], 0.044 * s, 0.044 * s, 0.01 * s, 6);
    ball(GOLD, [x, y + 0.235 * s, z], 0.013 * s, {}, 6, 4);
    cone(GOLD, [x, y + 0.254 * s, z], 0.007 * s, 0.02 * s, 5);
  };
  toro(-0.47, PLATEAU - 0.005, 0.9, 1.1);
  toro(0.72, PLATEAU_R - 0.005, 0.92, 1.1);
  toro(0.58, PLATEAU_R - 0.005, 0.3, 0.9);

  // Stepping stones
  const stone = (x: number, y: number, z: number, r: number, i: number) =>
    cyl(STONE_PLAIN, [x, y + 0.006, z], r, r * 1.06, 0.014, 7, { ry: i * 33, s: [1, 1, 0.82 + (i % 3) * 0.1] });
  const pathL: P2[] = [
    [HX + 0.0, HZ + 0.52],
    [HX + 0.08, HZ + 0.6],
    [HX + 0.14, HZ + 0.7],
    [HX + 0.2, HZ + 0.8],
    [HX + 0.24, HZ + 0.9],
    [-0.74, 0.5],
  ];
  pathL.forEach(([x, z], i) => stone(x + 0.0, PLATEAU, z - 0.0, 0.04 + 0.006 * (i % 2), i));
  const pathR: P2[] = [
    [0.8, 0.52],
    [0.9, 0.46],
    [0.98, 0.38],
    [1.06, 0.3],
    [1.06, 0.2],
  ];
  pathR.forEach(([x, z], i) => stone(x, PLATEAU_R, z, 0.036 + 0.005 * (i % 2), i + 3));
  // path from steps to the bench
  [
    [HX - 0.18, HZ + 0.55],
    [HX - 0.26, HZ + 0.62],
  ].forEach(([x, z], i) => stone(x, PLATEAU, z, 0.035, i + 9));

  // ---------------------------------------------------------------------------------------------------------------
  // Tea terrace rows, bench with parasol, bamboo
  for (let r = 0; r < 3; r++) {
    const z = 0.7 + r * 0.17;
    const g = new THREE.SphereGeometry(1, 10, 5);
    put(TEA, g, [-1.27, PLATEAU + 0.012, z], { s: [0.14, 0.07, 0.065], ry: r * 3 });
    put(TEA_NEW, new THREE.SphereGeometry(1, 8, 4), [-1.27, PLATEAU + 0.044, z + 0.003], { s: [0.12, 0.04, 0.05] });
    cyl(WOOD_BROWN, [-1.43, PLATEAU + 0.03, z], 0.006, 0.006, 0.06, 5);
    cyl(WOOD_BROWN, [-1.11, PLATEAU + 0.03, z], 0.006, 0.006, 0.06, 5);
  }
  // harvest basket with leaves
  put(cel("#d9a860"), new THREE.CylinderGeometry(0.035, 0.026, 0.05, 8, 1, true), [-1.12, PLATEAU + 0.03, 0.92]);
  cyl(cel("#d9a860"), [-1.12, PLATEAU + 0.006, 0.92], 0.026, 0.026, 0.01, 8);
  ball(TEA_NEW, [-1.12, PLATEAU + 0.045, 0.92], 0.032, { s: [1, 0.6, 1] }, 7, 4);
  // bench
  {
    const bx = -1.02;
    const bz = 0.38;
    box(RED_CLOTH, [bx, PLATEAU + 0.056, bz], [0.22, 0.014, 0.08]);
    box(RED_CLOTH, [bx, PLATEAU + 0.036, bz + 0.042], [0.22, 0.028, 0.006]);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(WOOD_DARK, [bx + sx * 0.095, PLATEAU + 0.026, bz + sz * 0.03], [0.012, 0.052, 0.012]);
    box(WOOD_DARK, [bx, PLATEAU + 0.045, bz], [0.2, 0.008, 0.012]);
    // parasol
    const px = bx - 0.03;
    const pz = bz - 0.06;
    cyl(WOOD_BROWN, [px, PLATEAU + 0.24, pz], 0.006, 0.007, 0.48, 6);
    const cone8 = new THREE.ConeGeometry(0.2, 0.075, 12, 2);
    const parasolPaint = cel(
      paint((p) => {
        const ang = Math.atan2(p.z - pz, p.x - px);
        const seg = Math.floor(((ang + Math.PI) / (Math.PI * 2)) * 12);
        return seg % 2 ? "#fff3dc" : "#e2433a";
      }),
    );
    put(parasolPaint, cone8, [px, PLATEAU + 0.47, pz]);
    ball(GOLD, [px, PLATEAU + 0.512, pz], 0.012, {}, 6, 4);
    cyl(GOLD, [px, PLATEAU + 0.44, pz], 0.012, 0.012, 0.02, 6);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      rod(WOOD_BROWN, [px, PLATEAU + 0.425, pz], [px + Math.cos(a) * 0.19, PLATEAU + 0.4375 - 0.0, pz + Math.sin(a) * 0.19], 0.0016, 4);
    }
    // tea set
    ball(cel("#fffaf0"), [bx - 0.05, PLATEAU + 0.082, bz], 0.022, { s: [1, 0.85, 1] }, 8, 5);
    cyl(cel("#fffaf0"), [bx - 0.05, PLATEAU + 0.105, bz], 0.008, 0.012, 0.01, 8);
    ball(GOLD, [bx - 0.05, PLATEAU + 0.113, bz], 0.005, {}, 5, 4);
    rod(cel("#fffaf0"), [bx - 0.026, PLATEAU + 0.082, bz], [bx - 0.01, PLATEAU + 0.094, bz], 0.004, 5);
    put(cel("#fffaf0"), new THREE.TorusGeometry(0.012, 0.0032, 4, 8, Math.PI), [bx - 0.075, PLATEAU + 0.082, bz], { rz: -90 });
    cyl(cel("#9fd8f2"), [bx + 0.005, PLATEAU + 0.069, bz + 0.02], 0.011, 0.008, 0.016, 8);
    cyl(cel("#9fd8f2"), [bx + 0.035, PLATEAU + 0.069, bz - 0.015], 0.011, 0.008, 0.016, 8);
    cyl(cel("#4fa96c"), [bx + 0.005, PLATEAU + 0.077, bz + 0.02], 0.0095, 0.0095, 0.002, 8);
    cyl(cel("#4fa96c"), [bx + 0.035, PLATEAU + 0.077, bz - 0.015], 0.0095, 0.0095, 0.002, 8);
    // dango plate
    cyl(cel("#fffaf0"), [bx + 0.075, PLATEAU + 0.065, bz + 0.015], 0.025, 0.02, 0.006, 10);
    rod(WOOD_LIGHT, [bx + 0.055, PLATEAU + 0.075, bz + 0.015], [bx + 0.095, PLATEAU + 0.075, bz + 0.015], 0.0017, 4);
    ball(cel("#ff9ec8"), [bx + 0.062, PLATEAU + 0.077, bz + 0.015], 0.0095, {}, 6, 4);
    ball(cel("#fffaf0"), [bx + 0.076, PLATEAU + 0.077, bz + 0.015], 0.0095, {}, 6, 4);
    ball(cel("#8fd46a"), [bx + 0.09, PLATEAU + 0.077, bz + 0.015], 0.0095, {}, 6, 4);
  }

  // bamboo grove
  const bamboo: [number, number, number, number][] = [
    [-1.42, 0.12, 1.05, 3],
    [-1.37, 0.2, 0.85, -2],
    [-1.44, 0.27, 1.2, 2],
    [-1.34, 0.3, 0.95, -4],
    [-1.4, 0.38, 0.75, 3],
    [-1.46, 0.18, 0.7, -3],
  ];
  const leafFrames: Frame[] = [];
  bamboo.forEach(([x, z, h, lean], i) => {
    const top: V = [x + Math.sin(lean * DEG) * h * 0.5, PLATEAU + h, z];
    cyl(BAMBOO, [(x + top[0]) / 2, PLATEAU + h / 2, z], 0.011, 0.014, h, 6, { rz: -lean });
    const nodes = Math.floor(h / 0.1);
    for (let k = 1; k <= nodes; k++) {
      const t = (k * 0.1) / h;
      const nx = x + (top[0] - x) * t;
      cyl(BAMBOO_NODE, [nx, PLATEAU + k * 0.1, z], 0.0145 - t * 0.003, 0.0145 - t * 0.003, 0.006, 6);
    }
    for (let k = 0; k < 5; k++) {
      const t = 0.62 + k * 0.09;
      const a = i * 2.1 + k * 1.7;
      leafFrames.push(frame([x + (top[0] - x) * t, PLATEAU + h * t, z], [Math.cos(a) * 0.9, 0.25, Math.sin(a) * 0.9]));
    }
    leafFrames.push(frame(top, [0, 1, 0]));
  });
  b.cards(leafFrames, BAMBOO_LEAF, {
    size: [0.05, 0.17],
    lean: 55,
    bend: 25,
    flow: (_f, i) => [Math.cos(i * 1.7), -0.2, Math.sin(i * 1.7)],
    vary: 0.3,
    rng: rng(17),
    cross: true,
    bone: base,
    sink: 0.05,
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Cherry tree
  const limbs: [V[], number, number][] = [
    [[[0.95, 0.37, 0.05], [0.94, 0.55, 0.05], [0.88, 0.78, 0.03], [0.78, 0.98, 0.0], [0.64, 1.14, -0.02]], 0.078, 0.034],
    [[[0.88, 0.78, 0.03], [1.0, 0.96, 0.0], [1.12, 1.12, -0.06], [1.26, 1.22, -0.06]], 0.034, 0.012],
    [[[0.78, 0.98, 0.0], [0.82, 1.18, -0.1], [0.9, 1.38, -0.16]], 0.03, 0.011],
    [[[0.64, 1.14, -0.02], [0.52, 1.26, 0.04], [0.4, 1.3, 0.1]], 0.03, 0.01],
    [[[0.94, 0.55, 0.05], [1.1, 0.72, 0.1], [1.28, 0.8, 0.16]], 0.032, 0.011],
    [[[0.78, 0.98, 0.0], [0.72, 1.06, 0.18], [0.66, 1.16, 0.32]], 0.026, 0.01],
    [[[0.64, 1.14, -0.02], [0.66, 1.32, -0.04], [0.74, 1.52, -0.02]], 0.026, 0.01],
    [[[1.0, 0.96, 0.0], [1.02, 1.2, 0.08], [1.1, 1.42, 0.06]], 0.024, 0.009],
    [[[1.12, 1.12, -0.06], [1.2, 1.3, 0.0], [1.24, 1.46, -0.02]], 0.014, 0.007],
    [[[0.9, 1.38, -0.16], [0.96, 1.5, -0.1], [1.0, 1.62, -0.04]], 0.012, 0.006],
  ];
  for (const [pts, r0, r1] of limbs) b.sweep(catmull(pts), [r0, r1], { color: BARK, bone: base, sides: 7, caps: "round" });
  // roots
  [
    [0.95, 0.05, 0.1, 0.12],
    [0.95, 0.05, 0.1, -1.4],
    [0.95, 0.05, -0.1, 0.3],
    [0.95, 0.05, 0.1, 2.2],
    [0.95, 0.05, -0.1, -2.6],
  ].forEach(([x, z, r, a]) => {
    const ex = x + Math.cos(a) * (0.12 + r);
    const ez = z + Math.sin(a) * (0.12 + r);
    b.sweep(catmull([[x, 0.46, z], [x + Math.cos(a) * 0.08, 0.41, z + Math.sin(a) * 0.08], [ex, 0.395, ez]]), [0.032, 0.012], { color: BARK, bone: base, sides: 6, caps: "round" });
  });
  // canopy
  const canopy: [number, number, number, number][] = [
    [0.4, 1.3, 0.1, 0.19],
    [0.55, 1.28, -0.02, 0.23],
    [0.72, 1.5, -0.02, 0.22],
    [0.9, 1.4, -0.14, 0.25],
    [1.1, 1.45, 0.06, 0.24],
    [1.26, 1.24, -0.04, 0.22],
    [1.1, 1.15, 0.1, 0.24],
    [0.85, 1.22, 0.08, 0.24],
    [0.66, 1.18, 0.3, 0.17],
    [1.28, 0.86, 0.16, 0.17],
    [1.02, 1.05, 0.28, 0.14],
    [0.95, 1.6, 0.02, 0.2],
    [0.62, 1.4, 0.1, 0.2],
    [-0.4, 0.6, 0.36, 0.1],
    [-0.46, 0.58, 0.42, 0.075],
    [-0.62, 0.6, 1.0, 0.11],
    [-0.55, 0.58, 1.05, 0.075],
    [-1.22, 0.6, 0.5, 0.09],
    [-1.16, 0.58, 0.55, 0.065],
  ];
  const canopyBins: THREE.BufferGeometry[][] = [[], [], []];
  const cr = rng(41);
  canopy.forEach(([x, y, z, r], ci) => {
    const subs: [number, number, number, number][] = [
      [0, 0, 0, r],
      [(cr() - 0.5) * r * 1.1, (cr() - 0.2) * r * 0.6, (cr() - 0.5) * r * 1.1, r * 0.72],
      [(cr() - 0.5) * r * 1.2, (cr() - 0.7) * r * 0.5, (cr() - 0.5) * r * 1.2, r * 0.66],
    ];
    subs.forEach(([dx, dy, dz, rr], si) => {
      const g = new THREE.IcosahedronGeometry(rr * 0.93, 1);
      const pos = g.attributes.position;
      for (let j = 0; j < pos.count; j++) {
        const px = pos.getX(j);
        const py = pos.getY(j);
        const pz = pos.getZ(j);
        const k = 1 + (hash3(px + ci, py, pz + si, 5) - 0.5) * 0.2;
        pos.setXYZ(j, px * k, py * k * 0.9, pz * k);
      }
      g.translate(x + dx, y + dy, z + dz);
      g.computeVertexNormals();
      canopyBins[(ci + si * 2) % 3 === 0 ? 1 : (ci + si) % 3 === 0 ? 2 : 0].push(g);
    });
  });
  const canopyParts = [CHERRY_A, CHERRY_B, CHERRY_C].map((m, i) => {
    const g = flatten(canopyBins[i]);
    return g ? b.part(g, m, { bone: base, at: [0, 0, 0], flat: true, name: `canopy${i}` }) : null;
  });
  const canopySurface = b.surface(canopyParts.filter((p): p is NonNullable<typeof p> => p !== null));
  const blossomHits = canopySurface.scatter(1000, { rng: rng(51), minDist: 0.045, filter: (h) => h.n.y > -0.4 });
  b.cards(blossomHits, BLOSSOM, {
    size: [0.088, 0.088],
    lean: 90,
    flow: (_f, i) => [Math.cos(i * 2.399), 0.15, Math.sin(i * 2.399)],
    vary: 0.3,
    rng: rng(52),
    bone: base,
    sink: 0,
    mirror: false,
  });
  // sacred shimenawa rope with shide
  {
    const rp = catmull(limbs[0][0]);
    const t = 0.2;
    const ctr = rp.at(t);
    const ringLine = frame(rp.at(t), rp.tangentAt(t));
    const ring = b.ring(ringLine, { count: 12, radius: 0.092 });
    void ctr;
    b.sweep(catmull(ring.items.map((it) => it.at), { closed: true }), 0.0085, { color: cel("#f1dfa8", "#c9a96a"), bone: base, sides: 6 });
    const hangF = ring.items.filter((_, i) => i % 2 === 0).map((it) => frame([it.at.x, it.at.y - 0.004, it.at.z], [0, 1, 0]));
    b.cards(hangF, SHIDE, { size: [0.018, 0.06], lean: 180, flow: [0, 0, 1], bone: base, sink: 0, cross: true });
    for (const it of ring.items.filter((_, i) => i % 3 === 0)) ball(GOLD, [it.at.x, it.at.y, it.at.z], 0.0075, {}, 5, 3);
  }

  // ground petals, on grass, stones and water
  const petalFrames: Frame[] = [];
  const pr = rng(61);
  for (let i = 0; i < 110; i++) {
    const a = pr() * Math.PI * 2;
    const d = Math.sqrt(pr()) * 0.5;
    const x = 0.92 + Math.cos(a) * d * 1.0;
    const z = 0.14 + Math.sin(a) * d * 0.85;
    if (x > 1.44) continue;
    const onWater = x < xR(z) - 0.015;
    if (onWater && x > xL(z) + 0.02) petalFrames.push(frame([x, WATER_Y + 0.003, z], [0, 1, 0]));
    else if (x > xR(z) + 0.03 && z < 1.05) petalFrames.push(frame([x, PLATEAU_R + capH - 0.05 + 0.004, z], [0, 1, 0]));
  }
  for (let i = 0; i < 40; i++) {
    const x = -0.28 + pr() * 0.56;
    const z = -0.6 + pr() * 1.7;
    if (x > xL(z) + 0.03 && x < xR(z) - 0.03) petalFrames.push(frame([x, WATER_Y + 0.003, z], [0, 1, 0]));
  }
  b.cards(petalFrames, PETAL, {
    size: 0.036,
    lean: 90,
    flow: (_f, i) => [Math.cos(i * 1.9), 0, Math.sin(i * 1.9)],
    vary: 0.3,
    rng: rng(62),
    bone: base,
    sink: 0,
    mirror: true,
  });
  // drifting glowing petals spiralling round the tree
  {
    const fr: Frame[] = [];
    for (let i = 0; i < 46; i++) {
      const t = i / 46;
      const a = t * Math.PI * 5.5;
      const rad = 0.38 + 0.3 * Math.sin(t * 3.2) + 0.1 * pr();
      const x = 0.88 + Math.cos(a) * rad;
      const z = 0.08 + Math.sin(a) * rad * 0.9;
      const y = 0.55 + t * 1.15;
      fr.push(frame([x, y, z], [0, 1, 0]));
    }
    glow(
      b.cards(fr, PETAL, {
        size: 0.06,
        lean: 70,
        flow: (_f, i) => [Math.cos(i * 2.7), -0.3, Math.sin(i * 2.7)],
        vary: 0.25,
        rng: rng(63),
        bone: base,
        sink: 0,
        mirror: true,
      }),
      1,
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Picnic mat, jizo, cat
  {
    const mx = 1.08;
    const mz = 0.7;
    const ang = 18 * DEG;
    const matPaint = cel(
      paint((p) => {
        const dx = p.x - mx;
        const dz = p.z - mz;
        const u = dx * Math.cos(ang) - dz * Math.sin(ang);
        const w = dx * Math.sin(ang) + dz * Math.cos(ang);
        if (Math.abs(u) > 0.155 || Math.abs(w) > 0.115) return "#fff6e4";
        const cx = Math.floor((u + 1) / 0.04);
        const cz = Math.floor((w + 1) / 0.04);
        return (cx + cz) % 2 ? "#e2433a" : "#ffdce6";
      }),
    );
    box(matPaint, [mx, PLATEAU_R + capH - 0.045, mz], [0.34, 0.012, 0.26], { ry: -18 });
    // tea set
    const yy = PLATEAU_R + capH - 0.034;
    const at = (u: number, w: number): V => [mx + u * Math.cos(ang) + w * Math.sin(ang), yy, mz - u * Math.sin(ang) + w * Math.cos(ang)];
    const tp = at(-0.06, -0.02);
    ball(cel("#6fc7e8"), [tp[0], yy + 0.026, tp[2]], 0.032, { s: [1, 0.85, 1] }, 8, 5);
    cyl(cel("#6fc7e8"), [tp[0], yy + 0.058, tp[2]], 0.012, 0.018, 0.012, 8);
    ball(GOLD, [tp[0], yy + 0.068, tp[2]], 0.006, {}, 5, 4);
    rod(cel("#6fc7e8"), [tp[0] + 0.03, yy + 0.03, tp[2]], [tp[0] + 0.052, yy + 0.048, tp[2]], 0.0055, 5);
    put(GOLD, new THREE.TorusGeometry(0.018, 0.0035, 4, 8, Math.PI), [tp[0] - 0.036, yy + 0.03, tp[2]], { rz: 90 });
    for (const [u, w] of [[0.02, 0.0], [0.05, 0.05]] as P2[]) {
      const c = at(u, w);
      cyl(cel("#fffaf0"), [c[0], yy + 0.012, c[2]], 0.014, 0.01, 0.02, 8);
      cyl(cel("#4fa96c"), [c[0], yy + 0.021, c[2]], 0.012, 0.012, 0.002, 8);
    }
    const dg = at(0.1, -0.03);
    cyl(cel("#fffaf0"), [dg[0], yy + 0.005, dg[2]], 0.03, 0.025, 0.006, 10);
    for (let k = 0; k < 3; k++) ball(k === 0 ? cel("#ff9ec8") : k === 1 ? cel("#fffaf0") : cel("#8fd46a"), [dg[0] + (k - 1) * 0.019, yy + 0.016, dg[2]], 0.0105, {}, 6, 4);
    // cat curled up on the mat corner
    const cat = at(0.02, -0.075);
    const ORANGE = cel("#ffb65c", "#e88a54");
    ball(ORANGE, [cat[0], yy + 0.018, cat[2]], 0.04, { s: [1.25, 0.62, 0.9], ry: 20 }, 8, 5);
    ball(CREAM, [cat[0] + 0.012, yy + 0.026, cat[2] + 0.016], 0.026, { s: [1.2, 0.5, 0.8], ry: 20 }, 6, 4);
    ball(ORANGE, [cat[0] - 0.045, yy + 0.022, cat[2] + 0.012], 0.022, { s: [1, 0.9, 1] }, 7, 5);
    cone(ORANGE, [cat[0] - 0.057, yy + 0.043, cat[2] + 0.003], 0.0075, 0.016, 4);
    cone(ORANGE, [cat[0] - 0.05, yy + 0.043, cat[2] + 0.024], 0.0075, 0.016, 4);
    ball(cel("#ff9ab0"), [cat[0] - 0.064, yy + 0.02, cat[2] + 0.014], 0.004, {}, 4, 3);
    put(BLACK, new THREE.BoxGeometry(0.006, 0.0016, 0.001), [cat[0] - 0.062, yy + 0.03, cat[2] + 0.0035], { ry: 100 });
    put(BLACK, new THREE.BoxGeometry(0.006, 0.0016, 0.001), [cat[0] - 0.056, yy + 0.03, cat[2] + 0.027], { ry: 100 });
    b.sweep(catmull([[cat[0] + 0.04, yy + 0.014, cat[2] + 0.02], [cat[0] + 0.05, yy + 0.012, cat[2] + 0.055], [cat[0] + 0.0, yy + 0.012, cat[2] + 0.062], [cat[0] - 0.035, yy + 0.014, cat[2] + 0.04]]), [0.011, 0.007], { color: ORANGE, bone: base, sides: 5 });
    ball(CREAM, [cat[0] + 0.02, yy + 0.014, cat[2] + 0.06], 0.008, {}, 4, 3);
  }
  // jizo statue with red bib and hat
  {
    const jx = 1.3;
    const jz = 0.22;
    const gy = PLATEAU_R + capH - 0.05;
    cyl(STONE, [jx, gy + 0.012, jz], 0.04, 0.046, 0.026, 6);
    cyl(STONE, [jx, gy + 0.03, jz], 0.03, 0.034, 0.016, 6);
    cyl(STONE_PLAIN, [jx, gy + 0.065, jz], 0.016, 0.026, 0.06, 8);
    ball(STONE_PLAIN, [jx, gy + 0.107, jz], 0.02, {}, 8, 6);
    cone(RED_CLOTH, [jx, gy + 0.138, jz], 0.027, 0.028, 8);
    cyl(RED_CLOTH, [jx, gy + 0.082, jz + 0.005], 0.024, 0.024, 0.012, 8);
    put(BLACK, new THREE.BoxGeometry(0.007, 0.0016, 0.001), [jx - 0.007, gy + 0.109, jz + 0.0185]);
    put(BLACK, new THREE.BoxGeometry(0.007, 0.0016, 0.001), [jx + 0.007, gy + 0.109, jz + 0.0185]);
    cone(GOLD, [jx, gy + 0.098, jz + 0.0215], 0.003, 0.004, 4);
    // small offering cup of petals
    ball(cel("#ffd9e8"), [jx + 0.05, gy + 0.008, jz + 0.03], 0.012, { s: [1, 0.5, 1] }, 5, 3);
  }

  // ema rack of wishing plaques beside the jizo
  {
    const EMA = svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 24"><g transform="translate(0 24) scale(1 -1)"><path d="M1 24L1 8L10 0L19 8L19 24Z" fill="#d9a05a" stroke="#8a4030" stroke-width="1.4"/><g fill="#ff9ec8">${[0, 1, 2, 3, 4].map((k) => `<ellipse cx="10" cy="11" rx="2.6" ry="3.6" transform="rotate(${k * 72} 10 14)"/>`).join("")}</g><circle cx="10" cy="14" r="1.8" fill="#ffd35a"/><path d="M5 20H15" stroke="#8a4030" stroke-width="1.3"/></g></svg>`,
      { size: 96 },
    );
    const ex = 1.4;
    const ey = PLATEAU_R + capH - 0.05;
    for (const z of [0.42, 0.66]) {
      cyl(WOOD_DARK, [ex, ey + 0.07, z], 0.008, 0.009, 0.14, 6);
      box(WOOD_RED_FLAT, [ex, ey + 0.145, z], [0.022, 0.01, 0.022]);
    }
    rod(WOOD_DARK, [ex, ey + 0.125, 0.4], [ex, ey + 0.125, 0.68], 0.006, 5);
    const emaFrames = [0.45, 0.51, 0.57, 0.63].map((z) => frame([ex, ey + 0.12, z], [0, 1, 0]));
    b.cards(emaFrames, EMA, { size: [0.04, 0.048], lean: 180, flow: [-1, 0, 0], bone: base, sink: 0, cross: false });
  }
  // petals resting on the bridge planks
  {
    const bp: Frame[] = [];
    for (let i = 0; i < 18; i++) {
      const { p } = deckAt(0.08 + (i / 18) * 0.84);
      bp.push(frame([p[0] + (pr() - 0.5) * 0.03, p[1] + 0.002, BZ + (pr() - 0.5) * 0.14], [0, 1, 0]));
    }
    b.cards(bp, PETAL, { size: 0.03, lean: 90, flow: (_f, i) => [Math.cos(i * 2.3), 0, Math.sin(i * 2.3)], rng: rng(64), bone: base, sink: 0, mirror: true });
  }

  // koi and lily pads
  const KOI_O = cel("#ff8f3a", "#e0603a");
  const KOI_W = cel("#fffaf0", "#cdbbd8");
  const koi: [number, number, number, number][] = [
    [-0.07, 0.15, 12, 1.0],
    [0.1, -0.12, -30, 0.9],
    [0.0, 0.4, 170, 0.8],
  ];
  koi.forEach(([x, z, ry, s]) => {
    const y = WATER_Y + 0.003;
    ball(KOI_W, [x, y, z], 0.026 * s, { s: [1, 0.55, 2.6], ry }, 7, 4);
    const fx = Math.sin(ry * DEG);
    const fz = Math.cos(ry * DEG);
    ball(KOI_O, [x + fx * 0.004, y + 0.006, z + fz * 0.004], 0.02 * s, { s: [1, 0.5, 1.8], ry }, 6, 3);
    ball(KOI_O, [x - fx * 0.03 * s, y + 0.004, z - fz * 0.03 * s], 0.014 * s, { s: [1, 0.5, 1.6], ry }, 5, 3);
    ball(BLACK, [x + fx * 0.04 * s - fz * 0.01, y + 0.012, z + fz * 0.04 * s + fx * 0.01], 0.004, {}, 4, 3);
    ball(BLACK, [x + fx * 0.04 * s + fz * 0.01, y + 0.012, z + fz * 0.04 * s - fx * 0.01], 0.004, {}, 4, 3);
    cone(KOI_O, [x - fx * 0.085 * s, y + 0.003, z - fz * 0.085 * s], 0.028 * s, 0.05 * s, 4, { q: aim([fx, 0, fz]), s: [1, 0.12, 1] });
    for (const sd of [-1, 1]) cone(KOI_O, [x + fx * 0.012 * s + sd * fz * 0.03, y + 0.002, z + fz * 0.012 * s - sd * fx * 0.03], 0.012 * s, 0.03 * s, 3, { q: aim([fx * 0.5 - sd * fz, 0, fz * 0.5 + sd * fx]), s: [1, 0.12, 1] });
  });
  for (const [x, z, r] of [
    [0.13, 0.05, 0.034],
    [-0.14, -0.1, 0.03],
    [0.18, -0.15, 0.026],
    [-0.1, 0.55, 0.032],
    [0.12, 0.85, 0.03],
  ] as V[]) {
    cyl(cel("#4fb85a"), [x, WATER_Y + 0.003, z], r, r, 0.004, 9);
    cyl(cel("#74d86a"), [x, WATER_Y + 0.0055, z], r * 0.5, r * 0.5, 0.002, 8);
  }
  cone(cel("#ff9ec8"), [0.13, WATER_Y + 0.016, 0.05], 0.012, 0.022, 6);
  cone(cel("#ffd9e8"), [0.135, WATER_Y + 0.02, 0.055], 0.008, 0.02, 5);
  // ripples
  for (const [x, z, r] of [
    [-0.07, 0.15, 0.06],
    [0.1, -0.12, 0.055],
    [0.0, 0.4, 0.05],
  ] as V[]) {
    put(FOAM, new THREE.RingGeometry(r, r + 0.006, 14).rotateX(-Math.PI / 2), [x, WATER_Y + 0.0035, z]);
    put(FOAM, new THREE.RingGeometry(r * 1.55, r * 1.55 + 0.005, 16).rotateX(-Math.PI / 2), [x, WATER_Y + 0.0035, z]);
  }

  // water wheel turning in the stream
  {
    const wy = 0.4;
    const wz = -0.5;
    const wr = 0.2;
    const wj = b.joint("waterWheel", { parent: base, at: [0, wy, wz], role: "hinge" });
    const rimGeos: THREE.BufferGeometry[] = [];
    const paddleGeos: THREE.BufferGeometry[] = [];
    for (const sx of [-0.068, 0.068]) {
      rimGeos.push(xform(new THREE.TorusGeometry(wr, 0.008, 4, 16), [sx, wy, wz], { ry: 90 }));
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * Math.PI;
        rimGeos.push(xform(new THREE.BoxGeometry(0.01, wr * 2, 0.008), [sx, wy, wz], { rx: a / DEG }));
      }
    }
    rimGeos.push(xform(new THREE.CylinderGeometry(0.03, 0.03, 0.16, 8), [0, wy, wz], { rz: 90 }));
    rimGeos.push(xform(new THREE.CylinderGeometry(0.008, 0.008, 0.72, 6), [0, wy, wz], { rz: 90 }));
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      paddleGeos.push(xform(new THREE.BoxGeometry(0.15, 0.05, 0.01), [0, wy + Math.cos(a) * (wr - 0.01), wz + Math.sin(a) * (wr - 0.01)], { rx: a / DEG }));
    }
    const rimMerged = flatten(rimGeos);
    const paddleMerged = flatten(paddleGeos);
    if (rimMerged) b.part(rimMerged, WOOD_DARK, { bone: wj, at: [0, 0, 0], flat: true, name: "wheelRim" });
    if (paddleMerged) b.part(paddleMerged, WOOD_LIGHT, { bone: wj, at: [0, 0, 0], flat: true, name: "wheelPaddles" });
    for (let k = 0; k < 4; k++) ball(FOAM, [-0.06 + k * 0.04, WATER_Y + 0.012, wz + 0.1 + (k % 2) * 0.03], 0.016, { s: [1, 0.7, 1] }, 5, 3);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Grass tufts and wild flowers
  const keepOut: [number, number, number][] = [
    [-0.72, 0.6, 0.2],
    [0.68, 0.6, 0.2],
    [-1.02, 0.38, 0.22],
    [-1.27, 0.7, 0.2],
    [-1.27, 0.87, 0.2],
    [-1.27, 1.04, 0.2],
    [-1.12, 0.92, 0.07],
    [-1.4, 0.26, 0.17],
    [0.95, 0.05, 0.14],
    [1.08, 0.7, 0.25],
    [1.3, 0.22, 0.08],
    [-0.47, 0.9, 0.07],
    [0.72, 0.92, 0.07],
    [0.58, 0.3, 0.06],
    [-0.9, 0.7, 0.05],
    [HX, HZ + 0.56, 0.2],
    [HX - 0.34, HZ + 0.52, 0.05],
    [HX + 0.34, HZ + 0.52, 0.05],
    [-1.4, 0.0, 0.05],
    [-0.42, 0.38, 0.12],
    [-0.6, 1.02, 0.12],
    [-1.2, 0.52, 0.1],
  ];
  const free = (x: number, z: number) => {
    if (Math.abs(x - HX) < 0.53 && z > HZ - 0.4 && z < HZ + 0.45) return false;
    return !keepOut.some(([kx, kz, kr]) => (x - kx) ** 2 + (z - kz) ** 2 < kr * kr);
  };
  const capSurface = b.surface([capL, capR]);
  const tufts = capSurface.scatter(330, { rng: rng(71), minDist: 0.055, filter: (h) => h.n.y > 0.85 && free(h.at.x, h.at.z) });
  b.cards(tufts, GRASS_TUFT, {
    size: [0.055, 0.06],
    lean: 8,
    flow: (_f, i) => [Math.cos(i * 1.3), 0.0, Math.sin(i * 1.3)],
    vary: 0.35,
    rng: rng(72),
    bone: base,
    cross: true,
    sink: 0.15,
  });
  const flowers = capSurface.scatter(110, { rng: rng(73), minDist: 0.1, filter: (h) => h.n.y > 0.85 && free(h.at.x, h.at.z) });
  b.cards(flowers, FLOWERS, {
    size: [0.035, 0.058],
    lean: 4,
    flow: (_f, i) => [Math.cos(i * 2.1), 0.0, Math.sin(i * 2.1)],
    vary: 0.3,
    rng: rng(74),
    bone: base,
    cross: true,
    sink: 0.1,
  });

  // glowing sparkle motes round the tree and in the mist of the falls
  {
    const SPARKLE = svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4Z" fill="#fff3b8"/><path d="M12 6L13.3 10.7L18 12L13.3 13.3L12 18L10.7 13.3L6 12L10.7 10.7Z" fill="#ffffff"/></svg>`,
      { size: 64 },
    );
    const sr = rng(81);
    const fr: Frame[] = [];
    for (let i = 0; i < 34; i++) fr.push(frame([0.25 + sr() * 1.2, 0.6 + sr() * 1.25, -0.4 + sr() * 1.1], [0, 1, 0]));
    for (let i = 0; i < 16; i++) fr.push(frame([-0.2 + sr() * 0.4, 0.35 + sr() * 0.9, -0.74 + sr() * 0.3], [0, 1, 0]));
    glow(
      b.cards(fr, SPARKLE, {
        size: 0.045,
        lean: 0,
        flow: (_f, i) => [Math.cos(i * 1.7), 0, Math.sin(i * 1.7)],
        vary: 0.5,
        rng: rng(82),
        cross: true,
        bone: base,
        sink: 0,
      }),
      1.3,
    );
  }
  flush();
  return b.root;
}
```

## Example: streetCornerSetSonnet

Brief: Category: Diorama.
Subject: storybook street corner with lamp post, glowing lantern, mailbox, bench, cat, flower boxes and half-timbered teahouse.
Style: whimsical Genshin mix.
Topology: diorama
Style family: whimsical-genshin
Notable features: lamp, mailbox, bench, cat, building

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";
import { frame } from "agentic-3js-builder";
import type { Frame, Spot } from "agentic-3js-builder";
import { DEG, rng } from "agentic-3js-builder";
import { bezier, catmull, spiral } from "agentic-3js-builder";
import { grain, paint, stripes } from "agentic-3js-builder";
import type { Paint } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { cel } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Windwheel Street Corner",
  description:
    "A storybook street corner: tall gold-and-navy lamp post with a glowing lantern, a red arched mailbox with a flag, a wooden bench with a napping cat, and flower boxes, tubs and hanging baskets, set against a half-timbered teahouse corner with teal roof, shutters and bunting.",
  style: "whimsical Genshin mix",
  commit: "88fc1f0",
};

type V = [number, number, number];
type Col = string | Paint;

// ---------------------------------------------------------------------------------------------------------------
// Palette: every surface is a two-tone cel paint; tiny details too, so the whole set shades the same way.
const K = (lit: Col, shadow?: Col) => cel(lit, shadow);
const GOLD = K("#f6c94e", "#c9852a");
const GOLD_PALE = K("#ffe8a0", "#e2b45a");
const NAVY = K("#3b4a6b", "#273252");
const NAVY_DEEP = K("#2a3550", "#1b2238");
const CREAM = K("#fbf0d6", "#e3cfaa");
const STONE = K("#d9d1bd", "#a9a3a6");
const STONE_DK = K("#b9b3a4", "#8a869a");
const TEAL = K("#33b5b1", "#217f9a");
const TEAL_DK = K("#238f9b", "#1b5f7e");
const TEAL_LT = K("#5fd3c2", "#3a9fb4");
const RED = K("#ec5a4f", "#b2314a");
const RED_DK = K("#c43f46", "#8a2442");
const TERRA = K("#e5875a", "#b85a58");
const SOIL = K("#5b3b2e", "#3a2530");
const WOOD_DK = K("#8a5a3c", "#5e3a3f");
const GREEN = K("#6cc24a", "#37935a");
const GREEN_DK = K("#3f9a3c", "#26705a");
const ORANGE_CAT = K("#f2a24a", "#c76a45");
const CAT_WHITE = K("#fff6e6", "#d7c3bd");
const BIRD_Y = K("#ffd84a", "#e39a3a");
const WHITE = K("#ffffff", "#cfd6ec");
const INKC = K("#2b1d3a", "#1a1226");
const PAPER = K("#fffaf0", "#e8dcc8");
const BOOK = K("#4f86d8", "#3a559e");
const GLASS = "#ffd98a";

const hash = (a: number, c: number) => {
  const s = Math.sin(a * 127.1 + c * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const fract = (x: number) => x - Math.floor(x);

// ---------------------------------------------------------------------------------------------------------------
// Layout (meters). +Z faces the viewer, the teahouse wall stands at the back.
const SW = 0.14; // sidewalk top
const ST = 0.06; // street top
const WALL_Z = -1.4; // wall front face
const WALL_B = -2.3; // wall back face
const SIDE_X = 0.85; // right end wall face
const LX = -1.55;
const LZ = 0.3; // lamp post
const DX = -1.25; // door
const WX = -0.03; // window
const MX = 0.8;
const MZ = -0.5; // mailbox
const BX = -0.2;
const BZ = -1.08; // bench centre

// ---------------------------------------------------------------------------------------------------------------
// Surface paints (all cel-shaded): painted detail lives here rather than in geometry.
const FLAGS = [K("#ddd5c1"), K("#d1c9b4"), K("#e4ddcb"), K("#c8c0ab")];
const MORTAR = K("#9d9a8f", "#77768a");

const sidewalkPaint = K(
  paint((p, n) => {
    if (n.y < 0.5) return STONE_DK;
    const dl = Math.hypot(p.x - LX, p.z - LZ);
    if (dl < 0.46) {
      const a = Math.atan2(p.z - LZ, p.x - LX);
      const petal = 0.2 + 0.07 * Math.cos(a * 8);
      if (dl < 0.08) return GOLD;
      if (dl < petal) return Math.floor((a / (Math.PI * 2)) * 16 + 16) % 2 ? TEAL : TEAL_LT;
      if (dl > 0.34 && dl < 0.38) return GOLD;
      if (dl > 0.4 && dl < 0.43) return TEAL_DK;
      return CREAM;
    }
    if (p.z > 0.6 - 0.16 || p.x > 1.0 - 0.16) {
      // gutter band of narrow stones beside the curb
      const along = p.z > 0.6 - 0.16 ? p.x : p.z;
      const c = Math.floor(along / 0.16);
      if (fract(along / 0.16) < 0.08 || Math.abs(p.z - (0.6 - 0.16)) < 0.01) return MORTAR;
      return hash(c, 5) > 0.5 ? STONE : STONE_DK;
    }
    const row = Math.floor(p.z / 0.22);
    const xo = p.x + (row % 2) * 0.16;
    const col = Math.floor(xo / 0.32);
    if (fract(p.z / 0.22) < 0.07 || fract(xo / 0.32) < 0.05) return MORTAR;
    return FLAGS[Math.floor(hash(row, col) * 4)];
  }),
);

const COBBLES = [K("#8f95a9"), K("#9ba1b4"), K("#80879d"), K("#a5aabb"), K("#8a8fa3")];
const streetPaint = K(
  paint((p, n) => {
    if (n.y < 0.5) return STONE_DK;
    // zebra crossing bars across the front street
    if (p.z > 0.8 && p.z < 1.62 && p.x > -1.55 && p.x < -0.15) {
      const u = fract((p.x + 1.55) / 0.26);
      if (u < 0.5) return K(paint((q) => (hash(Math.floor(q.x * 40), Math.floor(q.z * 40)) > 0.82 ? "#d7d1c0" : "#f6efdc")));
    }
    // cobbles: Worley-like, built from a jittered grid
    const s = 0.17;
    const gx = Math.floor(p.x / s);
    const gz = Math.floor(p.z / s);
    let d1 = 9;
    let d2 = 9;
    let id = 0;
    for (let i = -1; i <= 1; i++)
      for (let j = -1; j <= 1; j++) {
        const cx = gx + i;
        const cz = gz + j;
        const fx = (cx + 0.2 + 0.6 * hash(cx, cz)) * s;
        const fz = (cz + 0.2 + 0.6 * hash(cz, cx + 9)) * s;
        const d = Math.hypot(p.x - fx, p.z - fz);
        if (d < d1) {
          d2 = d1;
          d1 = d;
          id = hash(cx + 3, cz + 7);
        } else if (d < d2) d2 = d;
      }
    if (d2 - d1 < 0.022) return K("#5d6177");
    return COBBLES[Math.floor(id * 5)];
  }),
);

const plasterTone = (y: number) => (y > 2.36 ? "#f3e2c0" : "#fbf0d6");
const wallPaint = K(
  paint((p, n) => {
    const y = p.y;
    const side = Math.abs(n.x) > 0.5;
    const x = side ? -p.z : p.x;
    const posts = side ? [1.42, 2.28] : [-1.76, -0.815, 0.78];
    const TIMBER = "#7d4d36";
    // stone plinth
    if (y < 0.74) {
      const row = Math.floor((y - 0.1) / 0.13);
      const xo = x + (row % 2) * 0.11;
      const col = Math.floor(xo / 0.22);
      if (fract((y - 0.1) / 0.13) < 0.09 || fract(xo / 0.22) < 0.07) return "#8f8b9c";
      return hash(row, col) > 0.6 ? "#cdc6b5" : hash(row, col) > 0.3 ? "#d9d2bf" : "#bfb9ab";
    }
    if (y < 0.82) return TIMBER;
    if (y > 2.28 && y < 2.36) return TIMBER;
    if (y > 2.76 && !side) return TIMBER;
    for (const px of posts) if (Math.abs(x - px) < 0.045) return TIMBER;
    if (y > 2.36) {
      for (const px of posts) {
        const d = y - 2.36;
        if (d < 0.38 && (Math.abs(x - (px + d)) < 0.03 || Math.abs(x - (px - d)) < 0.03)) return TIMBER;
      }
      if (!side && Math.abs(fract((x + 0.2) / 0.42) - 0.5) < 0.03) return TIMBER;
    }
    if (y > 2.4 && y < 2.72) {
      const u = fract((x + 0.07) / 0.14) - 0.5;
      const dd = Math.abs(u) * 0.14 + Math.abs(y - 2.56);
      if (dd < 0.02) return "#f6c94e";
      if (dd < 0.04) return "#33b5b1";
    }
    // faint hand-painted plaster mottling
    const t = hash(Math.floor(x * 9), Math.floor(y * 9));
    return t > 0.88 ? "#f2e4c4" : plasterTone(y);
  }),
);

const roofPaint = K(
  paint((p, n) => {
    if (n.y < 0.2 && n.z > 0) return TEAL_DK;
    const row = Math.floor(p.y / 0.075);
    const u = fract((p.x + (row % 2) * 0.06) / 0.12);
    const v = fract(p.y / 0.075);
    const col = Math.floor((p.x + (row % 2) * 0.06) / 0.12);
    if (v < 0.2 + 0.18 * Math.abs(2 * u - 1) * 0.0 + 0.16 * (1 - (2 * u - 1) ** 2) * 0 && v < 0.16) return "#1d6c82";
    if (Math.abs(u - 0.5) > 0.47) return "#1d6c82";
    const h = hash(row, col);
    return h > 0.66 ? "#43c7bc" : h > 0.33 ? "#33b0b2" : "#2a9aa8";
  }),
);

const woodGrain = (a: string, c: string, size = 0.035, axis: "x" | "y" | "z" = "x") => K(grain(a, c, { size, axis, seed: 3 }));
const WOOD = woodGrain("#d99f62", "#c68650");
const WOOD_LT = woodGrain("#e6b274", "#d49a5c");
const WOOD_Y = woodGrain("#d99f62", "#c68650", 0.03, "y");
const WOOD_DKG = woodGrain("#8a5a3c", "#774b33", 0.03, "x");

const brickPaint = K(
  paint((p) => {
    const row = Math.floor(p.y / 0.07);
    const xo = p.x + p.z + (row % 2) * 0.09;
    if (fract(p.y / 0.07) < 0.12 || fract(xo / 0.18) < 0.08) return "#a8908a";
    return hash(row, Math.floor(xo / 0.18)) > 0.5 ? "#d8836a" : "#c9705e";
  }),
);

const doorPaint = K(
  paint((p) => {
    const u = p.x - (DX - 0.32);
    const v = p.y - SW;
    if (v > 0.26 && v < 0.34) return NAVY;
    if (v > 0.92 && v < 1.0) return NAVY;
    if (fract(u / 0.1067) < 0.045) return "#5e3a3f";
    const g = hash(Math.floor(u / 0.1067), Math.floor(v * 7));
    return g > 0.55 ? "#a76642" : "#9a5a3a";
  }),
);

const louver = (cx: number, cy: number) =>
  K(
    paint((p) => {
      const d = Math.hypot(p.x - cx, p.y - cy);
      if (d < 0.055) return GOLD;
      if (d < 0.07) return "#1f6f7f";
      if (fract(p.y / 0.05) < 0.3) return "#1f7f8d";
      return "#36b4b0";
    }),
  );

function planterPaint(cx: number, y0: number, h: number, pw: number, base: Col, panel: Col, edge: Col, alongZ = false) {
  return K(
    paint((p) => {
      const k = Math.round(((alongZ ? p.z : p.x) - cx) / pw);
      const u = (alongZ ? p.z : p.x) - cx - k * pw;
      const v = p.y - y0;
      const hw = pw * 0.38;
      const top = h * 0.5;
      const inArch = Math.abs(u) < hw && v > h * 0.14 && (v < top || Math.hypot(u, v - top) < hw);
      if (inArch) {
        const e = Math.min(hw - Math.abs(u), v - h * 0.14, v < top ? 9 : hw - Math.hypot(u, v - top));
        return e < 0.014 ? edge : panel;
      }
      return base;
    }),
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Textures (SVG drawings): flowers, leaves, bunting, tassels, emblems, glowing glass.
const petals = (n: number, rx: number, ry: number, cy: number, fill: string, stroke: string) =>
  Array.from(
    { length: n },
    (_, k) =>
      `<ellipse cx="0" cy="${-cy}" rx="${rx}" ry="${ry}" transform="rotate(${(k * 360) / n})" fill="${fill}" stroke="${stroke}" stroke-width="0.8"/>`,
  ).join("");
const SVG = (inner: string, vb: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${inner}</svg>`;
const STEM = `<path d="M24 80 C24 62 25 46 24 30" stroke="#3f9a3a" stroke-width="3.4" fill="none"/><path d="M24 64 C14 60 10 52 9 46 C18 48 23 54 24 64Z" fill="#58b848"/><path d="M24 56 C33 54 38 48 39 42 C30 43 25 48 24 56Z" fill="#4aa43c"/>`;
const daisy = (fill: string, light: string, stroke: string, center: string) =>
  svg(
    SVG(
      `${STEM}<g transform="translate(24 22)">${petals(8, 6, 10, 12, fill, stroke)}${petals(8, 3, 5, 10, light, light)}<circle r="5.6" fill="${center}" stroke="#c98a2b" stroke-width=".8"/><circle cx="-1.6" cy="-1.8" r="1.8" fill="#fff3b0"/></g>`,
      "0 0 48 80",
    ),
    { size: 192 },
  );
const FL_PINK = daisy("#ff8fb1", "#ffc7d8", "#d9567f", "#ffd24a");
const FL_BLUE = daisy("#7fa8ff", "#c3d6ff", "#4a6fd0", "#fff0a0");
const FL_WHITE = daisy("#ffffff", "#fff6d6", "#c9c3d6", "#ffc83a");
const FL_LAV = svg(
  SVG(
    `<path d="M24 80 C24 62 24 44 24 14" stroke="#3f9a3a" stroke-width="3.2" fill="none"/><path d="M24 66 C14 62 11 55 10 49 C18 51 23 57 24 66Z" fill="#58b848"/>${Array.from(
      { length: 8 },
      (_, i) =>
        `<ellipse cx="${24 + (i % 2 ? 4.4 : -4.4)}" cy="${18 + i * 4.6}" rx="4.4" ry="3.6" fill="${i % 3 === 0 ? "#b79cff" : i % 3 === 1 ? "#9c80f0" : "#c9b3ff"}" stroke="#6f55c4" stroke-width="0.7"/>`,
    ).join("")}<ellipse cx="24" cy="10" rx="3.4" ry="4.4" fill="#c9b3ff" stroke="#6f55c4" stroke-width="0.7"/>`,
    "0 0 48 80",
  ),
  { size: 192 },
);
const FL_TULIP = svg(
  SVG(
    `${STEM}<path d="M24 4 C30 10 38 14 36 26 C33 35 15 35 12 26 C10 14 18 10 24 4Z" fill="#ffb234" stroke="#d9741d" stroke-width="1"/><path d="M24 4 C20 12 19 24 24 34 C29 24 28 12 24 4Z" fill="#ffd45e" stroke="#d9741d" stroke-width=".8"/><path d="M14 20 C16 26 20 30 24 34" stroke="#e98a28" stroke-width="1" fill="none"/>`,
    "0 0 48 80",
  ),
  { size: 192 },
);
const FL_BABY = svg(
  SVG(
    `<path d="M24 80 C24 60 24 50 24 40 M24 54 C18 46 14 40 12 30 M24 48 C30 40 34 32 36 22 M24 40 C23 30 24 20 24 12" stroke="#4aa43c" stroke-width="2.6" fill="none"/>${[
      [12, 28],
      [36, 20],
      [24, 10],
      [17, 38],
      [31, 32],
      [24, 24],
    ]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.2" fill="#fffdf4" stroke="#cfc9de" stroke-width=".8"/><circle cx="${x}" cy="${y}" r="1.4" fill="#ffd45e"/>`)
      .join("")}`,
    "0 0 48 80",
  ),
  { size: 192 },
);
const LEAF = svg(
  SVG(
    `<path d="M32 64 C14 52 8 30 16 8 C30 18 36 42 32 64Z" fill="#3f9a3c"/><path d="M32 64 C50 52 56 30 48 8 C34 18 28 42 32 64Z" fill="#4fb043"/><path d="M32 64 C22 46 26 22 32 2 C38 22 42 46 32 64Z" fill="#74cf55"/><path d="M32 64 C29 46 30 24 32 2 C34 22 35 46 32 64Z" fill="#8fe06a"/>`,
    "0 0 64 64",
  ),
  { size: 128 },
);
const LEAF_Y = svg(
  SVG(
    `<path d="M32 64 C14 52 8 30 16 8 C30 18 36 42 32 64Z" fill="#6aa83a"/><path d="M32 64 C50 52 56 30 48 8 C34 18 28 42 32 64Z" fill="#7bbb42"/><path d="M32 64 C22 46 26 22 32 2 C38 22 42 46 32 64Z" fill="#a4d95a"/>`,
    "0 0 64 64",
  ),
  { size: 128 },
);
const IVY = svg(
  SVG(
    `<path d="M16 96 C14 70 18 40 16 4" stroke="#3f8a3a" stroke-width="2.6" fill="none"/>${[8, 26, 44, 62, 80]
      .map(
        (y, i) =>
          `<path d="M16 ${y} C${i % 2 ? 26 : 6} ${y - 10} ${i % 2 ? 30 : 2} ${y + 4} 16 ${y + 8}Z" fill="${i % 2 ? "#5cba45" : "#4aa43c"}"/>`,
      )
      .join("")}`,
    "0 0 32 96",
  ),
  { size: 192 },
);
const GRASS = svg(
  SVG(
    `<path d="M6 32 C6 20 4 10 2 4 C10 12 12 22 14 32Z" fill="#4aa43c"/><path d="M12 32 C12 18 14 8 16 0 C20 10 20 22 22 32Z" fill="#6cc24a"/><path d="M20 32 C22 22 26 14 30 8 C30 18 28 26 28 32Z" fill="#58b848"/>`,
    "0 0 32 32",
  ),
  { size: 96 },
);
const TASSEL = svg(
  SVG(
    `<path d="M12 96 L12 86" stroke="#c9852a" stroke-width="2.4"/><circle cx="12" cy="82" r="5" fill="#f6c94e" stroke="#c9852a" stroke-width="1"/><path d="M4 78 L20 78 L22 70 L2 70Z" fill="#f6c94e" stroke="#c9852a" stroke-width="1"/><path d="M2 70 L22 70 L20 8 L4 8Z" fill="#33b5b1"/><path d="M6 70 L6 8 M10 70 L10 8 M14 70 L14 8 M18 70 L18 8" stroke="#217f9a" stroke-width="1.2"/><path d="M2 58 L22 58" stroke="#f6c94e" stroke-width="2.6"/>`,
    "0 0 24 96",
  ),
  { size: 192 },
);
const FLAG = svg(SVG(`<path d="M0 64 L64 64 L32 4Z" fill="#ffffff"/><path d="M6 60 L58 60 L32 12Z" fill="#e8e8e8"/>`, "0 0 64 64"), { size: 96 });
const EMBLEM = svg(
  SVG(
    `<circle cx="32" cy="32" r="29" fill="#fff4d2" stroke="#f1b93c" stroke-width="3.4"/><circle cx="32" cy="32" r="23" fill="none" stroke="#e8d3a0" stroke-width="1.6"/><path d="M14 36 C16 20 32 12 44 20 C34 18 26 24 28 32 C30 40 40 40 44 34" stroke="#2aa8a6" stroke-width="4.4" stroke-linecap="round" fill="none"/><path d="M20 46 C28 52 42 50 50 38" stroke="#7fd6c8" stroke-width="3.4" stroke-linecap="round" fill="none"/><circle cx="46" cy="20" r="3" fill="#f1b93c"/>`,
    "0 0 64 64",
  ),
  { size: 192 },
);
const SIGN = svg(
  SVG(
    `<rect x="2" y="2" width="116" height="86" rx="12" fill="#fbf0d6" stroke="#f1b93c" stroke-width="4"/><rect x="9" y="9" width="102" height="72" rx="8" fill="none" stroke="#2aa8a6" stroke-width="2.4"/><path d="M36 44 L84 44 C84 64 74 72 60 72 C46 72 36 64 36 44Z" fill="#ffffff" stroke="#3b4a6b" stroke-width="3"/><path d="M84 48 C94 46 96 58 84 60" fill="none" stroke="#3b4a6b" stroke-width="3"/><path d="M40 52 L80 52" stroke="#4f86d8" stroke-width="3"/><path d="M50 38 C46 30 54 28 50 20 M60 38 C56 30 64 28 60 18 M70 38 C66 30 74 28 70 20" stroke="#e5875a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M22 66 C16 56 20 48 28 46 C28 56 26 62 22 66Z" fill="#58b848"/><path d="M98 66 C104 56 100 48 92 46 C92 56 94 62 98 66Z" fill="#58b848"/>`,
    "0 0 120 90",
  ),
  { size: 320 },
);
const WINDOW_GLASS = svg(
  SVG(
    `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe6a0"/><stop offset="1" stop-color="#ffb45c"/></linearGradient></defs><path d="M0 100 V30 A30 30 0 0 1 60 30 V100Z" fill="url(#g)"/><path d="M0 100 V34 C6 40 10 60 16 100Z" fill="#ff8fb1"/><path d="M60 100 V34 C54 40 50 60 44 100Z" fill="#ff8fb1"/><path d="M0 34 C8 44 12 60 16 100 M60 34 C52 44 48 60 44 100" stroke="#d9567f" stroke-width="1.2" fill="none"/><path d="M20 100 V84 H40 V100Z" fill="#7a4a36"/><path d="M30 84 C24 72 22 66 18 62 C26 62 30 70 30 84Z M30 84 C34 70 38 64 44 60 C38 70 34 76 30 84Z" fill="#3f8a3a"/><circle cx="30" cy="54" r="5" fill="#ff8fb1"/>`,
    "0 0 60 100",
  ),
  { size: 256 },
);
const LANTERN_GLASS = svg(
  SVG(
    `<defs><linearGradient id="l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3b8"/><stop offset="1" stop-color="#ffc260"/></linearGradient></defs><rect width="600" height="200" fill="url(#l)"/>${Array.from(
      { length: 6 },
      (_, i) =>
        `<g transform="translate(${i * 100} 0)"><path d="M12 188 V70 A38 38 0 0 1 88 70 V188Z" fill="#fff9d8" stroke="#d98a2a" stroke-width="4"/><path d="M50 20 L55 40 L74 45 L55 50 L50 70 L45 50 L26 45 L45 40Z" fill="#ffc94a"/><path d="M20 140 H80" stroke="#d98a2a" stroke-width="3"/><path d="M50 74 V188" stroke="#d98a2a" stroke-width="3"/></g>`,
    ).join("")}`,
    "0 0 600 200",
  ),
  { size: 512 },
);
const MANHOLE = svg(
  SVG(
    `<circle cx="64" cy="64" r="62" fill="#4a5470" stroke="#2a3550" stroke-width="4"/><circle cx="64" cy="64" r="52" fill="none" stroke="#7684a8" stroke-width="3"/>${Array.from(
      { length: 8 },
      (_, k) =>
        `<path d="M64 64 C80 52 92 54 96 66 C88 62 80 66 78 76Z" fill="#7684a8" transform="rotate(${k * 45} 64 64)"/>`,
    ).join("")}<circle cx="64" cy="64" r="9" fill="#f6c94e" stroke="#c9852a" stroke-width="2.4"/>`,
    "0 0 128 128",
  ),
  { size: 256 },
);
const GRATE = svg(
  SVG(
    `<rect width="64" height="24" rx="3" fill="#2a3550"/>${Array.from({ length: 8 }, (_, i) => `<rect x="${5 + i * 7}" y="4" width="3.4" height="16" fill="#0f1424"/>`).join("")}`,
    "0 0 64 24",
  ),
  { size: 192 },
);
const SEED = svg(SVG(`<path d="M16 32 L16 12" stroke="#fff" stroke-width="1.4"/>${petals(10, 1.4, 6, 0, "#ffffff", "#ffffff")}`, "-16 -16 32 32"), { size: 96 });
const CHALK = svg(
  SVG(
    `<rect width="68" height="100" rx="5" fill="#2e4a50"/><rect x="4" y="4" width="60" height="92" rx="3" fill="none" stroke="#f3ead2" stroke-width="1.6" stroke-dasharray="3 3"/><path d="M20 44 L48 44 C48 58 42 64 34 64 C26 64 20 58 20 44Z" fill="#fff6dc" stroke="#f3ead2" stroke-width="1.6"/><path d="M48 47 C56 46 57 56 48 57" fill="none" stroke="#f3ead2" stroke-width="2"/><path d="M26 52 H42" stroke="#7fd6c8" stroke-width="2"/><path d="M28 38 C24 32 32 30 28 22 M36 38 C32 32 40 30 36 20 M44 38 C40 32 48 30 44 22" stroke="#f3ead2" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M14 74 H54 M18 82 H50 M24 90 H44" stroke="#f3ead2" stroke-width="2.4" stroke-linecap="round"/><path d="M34 16 C24 8 18 14 24 18 C28 20 32 18 34 16 C36 18 40 20 44 18 C50 14 44 8 34 16Z" fill="#ff8fb1"/>`,
    "0 0 68 100",
  ),
  { size: 256 },
);
const AUTUMN = svg(
  SVG(`<path d="M16 30 C4 20 2 8 16 1 C30 8 28 20 16 30Z" fill="#ffffff"/><path d="M16 30 L16 6" stroke="#cfcfcf" stroke-width="1.4"/>`, "0 0 32 32"),
  { size: 96 },
);
const HEART = svg(
  SVG(`<path d="M12 21 C-2 11 2 1 8 3 C10 4 11 6 12 7 C13 6 14 4 16 3 C22 1 26 11 12 21Z" fill="#ffffff"/>`, "0 0 24 24"),
  { size: 96 },
);

// ---------------------------------------------------------------------------------------------------------------
const b = createBuilder({ name: "streetCorner", paintSize: 2048 });
const base = b.joint("base", { at: [0, 0, 0] });
const R = rng(2024);

const arch = (w: number, h: number, n = 8): OutlinePoint[] => {
  const r = w / 2;
  const pts: OutlinePoint[] = [
    [-r, 0],
    [r, 0],
    [r, h - r],
  ];
  for (let i = 1; i < n; i++) {
    const a = (i / n) * Math.PI;
    pts.push([Math.cos(a) * r, h - r + Math.sin(a) * r]);
  }
  pts.push([-r, h - r]);
  return pts;
};

const box = (w: number, h: number, d: number, color: Col, at: V, rot?: V, bone = base) =>
  b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, rotation: rot });
const cyl = (rt: number, rb: number, h: number, seg: number, color: Col, at: V, bone = base, rot?: V) =>
  b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, rotation: rot });
const ball = (r: number, color: Col, at: V, scale?: V, bone = base, seg = 8) =>
  b.part(new THREE.SphereGeometry(r, seg, Math.max(4, seg - 2)), color, { bone, at, scale });
const rod = (a: V, c: V, r: number | [number, number], color: Col, sides = 6, bone = base) =>
  b.rod(a, c, r, { color, sides, bone });
const lathe = (outline: [number, number][], at: V, color: Col, segments = 10, bone = base, smoothing = 0) =>
  b.lathe(outline as OutlinePoint[], { at, color, segments, bone, smoothing });
const ring = (r: number, tube: number, color: Col, at: V, bone = base, rot: V = [90, 0, 0]) =>
  b.part(new THREE.TorusGeometry(r, tube, 5, 12), color, { bone, at, rotation: rot });
const plane = (w: number, h: number, tex: THREE.Texture, at: V, dir: V, bone = base, up?: V) =>
  b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex, up });

// merged little things: one part per colour
const batch = new Map<Col, THREE.BufferGeometry[]>();
function stamp(color: Col, geo: THREE.BufferGeometry, at: V, rot: V = [0, 0, 0], scale: V = [1, 1, 1]) {
  const g = geo.clone();
  g.applyMatrix4(
    new THREE.Matrix4().compose(
      new THREE.Vector3(...at),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG, "YXZ")),
      new THREE.Vector3(...scale),
    ),
  );
  let list = batch.get(color);
  if (!list) batch.set(color, (list = []));
  list.push(g);
}
function flush() {
  for (const [color, list] of batch) b.part(mergeGeometries(list)!, color, { bone: base, at: [0, 0, 0] });
  batch.clear();
}
const BOX1 = new THREE.BoxGeometry(1, 1, 1);
const SPH = new THREE.SphereGeometry(1, 6, 4);
const CONE = new THREE.ConeGeometry(1, 1, 6);

// ---------------------------------------------------------------------------------------------------------------
// 1. Ground: cobbled street, flagstone sidewalk with a rounded corner, curb stones.
box(3.6, ST, 4.55, streetPaint, [0, ST / 2, -0.475]);
{
  const sw: OutlinePoint[] = [[-1.8, -0.6]];
  // outline in (x, -z): front edge z = 0.6, rounded corner centre (0.5, 0.1) radius 0.5, right edge x = 1.0
  sw.push([0.5, -0.6]);
  for (let i = 1; i < 6; i++) {
    const a = (i / 6) * (Math.PI / 2);
    sw.push([0.5 + Math.sin(a) * 0.5, -(0.1 + Math.cos(a) * 0.5)]);
  }
  sw.push([1.0, -0.1], [1.0, 2.75], [-1.8, 2.75]);
  b.extrude(sw, {
    at: [0, (ST + SW) / 2, 0],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: SW - ST,
    bevel: 0.006,
    color: sidewalkPaint,
    bone: base,
  });
}
// curb blocks
{
  const bh = 0.13;
  const cy = ST + bh / 2;
  let i = 0;
  for (let x = -1.65; x < 0.45; x += 0.3) stamp(i++ % 2 ? STONE : STONE_DK, BOX1, [x, cy, 0.6], [0, 0, 0], [0.28, bh, 0.15]);
  for (let k = 0; k < 5; k++) {
    const a = ((k + 0.5) / 5) * (Math.PI / 2);
    stamp(i++ % 2 ? STONE : STONE_DK, BOX1, [0.5 + Math.sin(a) * 0.5, cy, 0.1 + Math.cos(a) * 0.5], [0, a * (180 / Math.PI), 0], [0.2, bh, 0.15]);
  }
  for (let z = 0.0; z > -2.7; z -= 0.3) stamp(i++ % 2 ? STONE : STONE_DK, BOX1, [1.0, cy, z], [0, 0, 0], [0.15, bh, 0.28]);
}
// manhole + storm grate on the street
plane(0.62, 0.62, MANHOLE, [1.42, ST + 0.003, 0.5], [0, 1, 0], base, [0, 0, -1]);
plane(0.5, 0.19, GRATE, [-0.55, ST + 0.003, 0.7], [0, 1, 0], base, [0, 0, -1]);
// grass tufts in the gaps, fallen leaves, dandelion seeds
{
  const spots: V[] = [];
  for (let i = 0; i < 26; i++) {
    const x = -1.75 + R() * 2.7;
    spots.push([x, SW, -1.38 + R() * 0.07]);
  }
  for (let i = 0; i < 7; i++) spots.push([0.94 + R() * 0.02, SW, -1.2 + R() * 1.2]);
  b.cards(spots.map((p) => frame(p, [0, 1, 0])), GRASS, { size: [0.07, 0.08], lean: 15, flow: [0, 0, 1], vary: 0.4, rng: R, cross: true, bone: base });
  const leaves: V[] = [];
  for (let i = 0; i < 12; i++) leaves.push([-1.5 + R() * 2.4, SW + 0.004, -0.8 + R() * 1.3]);
  for (let i = 0; i < 6; i++) leaves.push([-1.7 + R() * 2.6, ST + 0.004, 0.9 + R() * 0.8]);
  const lf = leaves.map((p) => frame(p, [0, 1, 0]));
  const tints = ["#f0a63a", "#e0703a", "#f6c94e", "#8cc84a"];
  for (let t = 0; t < tints.length; t++)
    b.cards(
      lf.filter((_, i) => i % tints.length === t),
      AUTUMN,
      { size: 0.07, lean: 90, flow: (_f, i) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)], mirror: true, color: tints[t], bone: base, sink: 0 },
    );
}

// ---------------------------------------------------------------------------------------------------------------
// 2. The teahouse corner: half-timbered wall, teal roof, door, window, shutters, sign.
b.extrude(
  [
    [WALL_Z, 0.1],
    [WALL_B, 0.1],
    [WALL_B, 2.73],
    [-1.8, 3.23],
    [WALL_Z, 2.83],
  ],
  { at: [(-1.8 + SIDE_X) / 2, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: SIDE_X + 1.8, color: wallPaint, bone: base },
);
// roof: two slopes meeting at a ridge
const roofW = SIDE_X + 1.8 + 0.3;
const roofC = (-1.95 + (SIDE_X + 0.15)) / 2;
b.extrude(
  [
    [-1.12, 2.55],
    [-1.12, 2.67],
    [-1.8, 3.35],
    [-1.8, 3.23],
  ],
  { at: [roofC, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: roofW, color: roofPaint, bevel: 0.01, bone: base },
);
b.extrude(
  [
    [-1.8, 3.35],
    [-2.48, 2.67],
    [-2.48, 2.55],
    [-1.8, 3.23],
  ],
  { at: [roofC, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: roofW, color: roofPaint, bevel: 0.01, bone: base },
);
// eave trim, drops, ridge cap
rod([-1.95, 2.6, -1.1], [SIDE_X + 0.15, 2.6, -1.1], 0.03, GOLD, 6);
for (let x = -1.9; x < SIDE_X + 0.15; x += 0.2) stamp(GOLD, CONE, [x, 2.5, -1.1], [180, 0, 0], [0.03, 0.1, 0.03]);
rod([-1.95, 2.6, -2.5], [SIDE_X + 0.15, 2.6, -2.5], 0.03, GOLD, 6);
rod([-1.98, 3.37, -1.8], [SIDE_X + 0.18, 3.37, -1.8], 0.04, TEAL_DK, 6);
for (let x = -1.8; x < SIDE_X + 0.1; x += 0.25) ball(0.05, GOLD, [x, 3.4, -1.8], [1, 0.7, 1.4], base, 5);
for (const x of [-1.98, SIDE_X + 0.18]) {
  ball(0.05, GOLD, [x, 3.4, -1.8]);
  cyl(0.0, 0.03, 0.16, 5, GOLD, [x + Math.sign(x) * 0.0, 3.5, -1.8]);
}
// gable end trims
for (const x of [-1.95, SIDE_X + 0.15]) {
  rod([x, 2.58, -1.12], [x, 3.38, -1.8], 0.025, GOLD, 6);
  rod([x, 3.38, -1.8], [x, 2.58, -2.48], 0.025, GOLD, 6);
}
// chimney
box(0.34, 0.65, 0.34, brickPaint, [0.35, 3.15, -1.62]);
box(0.42, 0.06, 0.42, STONE, [0.35, 3.5, -1.62]);
cyl(0.06, 0.07, 0.14, 6, TERRA, [0.3, 3.58, -1.62]);
cyl(0.06, 0.07, 0.14, 6, TERRA, [0.42, 3.58, -1.62]);
// downspout and wall brackets
rod([SIDE_X - 0.03, 2.55, -1.33], [SIDE_X - 0.03, SW, -1.33], 0.028, NAVY, 6);
for (const y of [0.5, 1.3, 2.1]) box(0.08, 0.025, 0.1, GOLD, [SIDE_X - 0.03, y, -1.36]);
ball(0.05, NAVY, [SIDE_X - 0.03, SW + 0.02, -1.33]);
// timber post feet
for (const px of [-1.76, -0.815, SIDE_X - 0.07]) box(0.12, 0.05, 0.05, STONE_DK, [px, 0.77, WALL_Z + 0.02]);

// door --------------------------------------------------------------------------------------------
b.extrude(arch(0.86, 1.68, 10), {
  at: [DX, SW, WALL_Z - 0.02],
  x: [1, 0, 0],
  y: [0, 1, 0],
  thickness: 0.08,
  bevel: 0.01,
  color: STONE,
  bone: base,
});
b.extrude(arch(0.66, 1.54, 10), {
  at: [DX, SW, WALL_Z + 0.02],
  x: [1, 0, 0],
  y: [0, 1, 0],
  thickness: 0.05,
  bevel: 0.006,
  color: doorPaint,
  bone: base,
});
box(0.07, 0.07, 0.03, GOLD, [DX, SW + 1.7, WALL_Z + 0.04], [0, 0, 45]); // keystone
ball(0.03, GOLD, [DX, SW + 1.7, WALL_Z + 0.055]);
glow(cyl(0.085, 0.085, 0.02, 10, GLASS, [DX, SW + 1.18, WALL_Z + 0.05], base, [90, 0, 0]), 1.3);
ring(0.095, 0.014, GOLD, [DX, SW + 1.18, WALL_Z + 0.055], base, [0, 0, 0]);
box(0.012, 0.17, 0.012, GOLD, [DX, SW + 1.18, WALL_Z + 0.06]);
box(0.17, 0.012, 0.012, GOLD, [DX, SW + 1.18, WALL_Z + 0.06]);
for (const s of [-1, 1]) {
  box(0.24, 0.035, 0.012, GOLD, [DX + s * 0.2, SW + 0.3, WALL_Z + 0.052]);
  box(0.24, 0.035, 0.012, GOLD, [DX + s * 0.2, SW + 0.96, WALL_Z + 0.052]);
  for (const v of [0.3, 0.96]) ball(0.017, GOLD, [DX + s * 0.29, SW + v, WALL_Z + 0.06], undefined, base, 5);
}
ring(0.04, 0.008, GOLD, [DX - 0.02, SW + 0.9, WALL_Z + 0.07], base, [0, 0, 0]);
cyl(0.03, 0.03, 0.012, 8, GOLD, [DX - 0.02, SW + 0.95, WALL_Z + 0.06], base, [90, 0, 0]);
// chalkboard A-frame sign
{
  const ax = DX - 0.05;
  const az = -0.72;
  const tilt = 12;
  for (const s of [1, -1]) box(0.42, 0.74, 0.03, s > 0 ? WOOD_DKG : WOOD_DK, [ax, SW + 0.37, az + s * 0.1], [-s * tilt, 0, 0]);
  box(0.46, 0.04, 0.05, GOLD, [ax, SW + 0.745, az]);
  plane(0.34, 0.5, CHALK, [ax, SW + 0.4, az + 0.1 + 0.0165 + Math.sin((tilt * Math.PI) / 180) * 0.0], [0, Math.sin((tilt * Math.PI) / 180), Math.cos((tilt * Math.PI) / 180)]);
  for (const s of [-1, 1]) ball(0.012, GOLD, [ax + s * 0.2, SW + 0.745, az], undefined, base, 4);
}
ball(0.04, GOLD, [DX + 0.22, SW + 0.78, WALL_Z + 0.075]);
cyl(0.05, 0.05, 0.012, 8, GOLD, [DX + 0.22, SW + 0.78, WALL_Z + 0.055], base, [90, 0, 0]);
box(0.012, 0.03, 0.01, INKC, [DX + 0.22, SW + 0.68, WALL_Z + 0.056]);
// step and mat
box(0.9, 0.1, 0.38, STONE, [DX, SW + 0.05, WALL_Z + 0.2]);
box(0.8, 0.012, 0.28, K(stripes("#e5875a", "#fbf0d6", { size: 0.09, axis: "x" })), [DX, SW + 0.106, WALL_Z + 0.2]);
// wall lantern at the right post
const WLX = SIDE_X - 0.07;
cyl(0.03, 0.03, 0.025, 6, GOLD, [WLX, 1.62, WALL_Z + 0.015], base, [90, 0, 0]);
rod([WLX, 1.62, WALL_Z + 0.02], [WLX, 1.62, WALL_Z + 0.16], 0.012, GOLD, 5);
glow(cyl(0.055, 0.045, 0.13, 6, GLASS, [WLX, 1.55, WALL_Z + 0.17]), 1.4);
cyl(0.0, 0.075, 0.07, 6, TEAL, [WLX, 1.655, WALL_Z + 0.17]);
ball(0.014, GOLD, [WLX, 1.7, WALL_Z + 0.17], undefined, base, 5);
for (let k = 0; k < 6; k++) {
  const a = (k / 6) * Math.PI * 2;
  rod([WLX + Math.sin(a) * 0.052, 1.49, WALL_Z + 0.17 + Math.cos(a) * 0.052], [WLX + Math.sin(a) * 0.062, 1.6, WALL_Z + 0.17 + Math.cos(a) * 0.062], 0.006, GOLD, 4);
}

// window -------------------------------------------------------------------------------------------
b.extrude(arch(0.98, 1.12, 10), { at: [WX, 1.2, WALL_Z - 0.02], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.06, bevel: 0.008, color: CREAM, bone: base });
b.extrude(arch(0.8, 0.94, 10), { at: [WX, 1.27, WALL_Z + 0.015], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.03, color: TEAL_DK, bone: base });
glow(plane(0.62, 0.78, WINDOW_GLASS, [WX, 1.4 + 0.39, WALL_Z + 0.036], [0, 0, 1]), 1.2);
box(0.022, 0.78, 0.022, TEAL_DK, [WX, 1.79, WALL_Z + 0.045]);
box(0.62, 0.022, 0.022, TEAL_DK, [WX, 1.72, WALL_Z + 0.045]);
box(0.62, 0.022, 0.022, TEAL_DK, [WX, 1.5, WALL_Z + 0.045]);
box(0.08, 0.08, 0.04, GOLD, [WX, 2.3, WALL_Z + 0.0], [0, 0, 45]);
// sill + brackets
box(1.08, 0.06, 0.26, STONE, [WX, 1.2, WALL_Z + 0.1]);
for (const s of [-1, 1]) {
  const c = catmull([[WX + s * 0.4, 1.17, WALL_Z + 0.02], [WX + s * 0.4, 1.06, WALL_Z + 0.05], [WX + s * 0.4, 1.03, WALL_Z + 0.17], [WX + s * 0.4, 1.0, WALL_Z + 0.2]]);
  b.sweep(c, 0.016, { color: NAVY, sides: 5, bone: base });
  ball(0.02, GOLD, [WX + s * 0.4, 1.0, WALL_Z + 0.2], undefined, base, 5);
}
// shutters on hinges
// shutter hinge joints carry their panels
for (const s of [1, -1]) {
  const hx = WX + s * 0.5;
  const j = b.joint(s > 0 ? "shutterL" : "shutterR", { parent: base, at: [hx, 1.26, WALL_Z + 0.03], dir: [0, 1, 0], role: "hinge" });
  // (j is the shutter's bone)
  b.extrude(
    [
      [0, 0],
      [0.23, 0],
      [0.23, 0.92],
      [0.115, 1.02],
      [0, 0.92],
    ],
    { at: [hx, 1.26, WALL_Z + 0.02], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.03, bevel: 0.004, color: louver(hx + s * 0.115, 1.26 + 0.55), bone: j },
  );
  ball(0.015, GOLD, [hx + s * 0.02, 1.4, WALL_Z + 0.042], undefined, j, 5);
  ball(0.015, GOLD, [hx + s * 0.02, 2.12, WALL_Z + 0.042], undefined, j, 5);
}

// side windows on both end walls, each with a round attic window in the gable
for (const sg of [1, -1]) {
  const sz = (WALL_Z + WALL_B) / 2;
  const fx = sg > 0 ? SIDE_X : -1.8;
  b.extrude(arch(0.66, 0.96, 8), { at: [fx - sg * 0.02, 1.3, sz], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.06, bevel: 0.008, color: CREAM, bone: base });
  b.extrude(arch(0.5, 0.8, 8), { at: [fx + sg * 0.015, 1.38, sz], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.03, color: TEAL_DK, bone: base });
  glow(plane(0.4, 0.66, WINDOW_GLASS, [fx + sg * 0.036, 1.44 + 0.33, sz], [sg, 0, 0]), 1.2);
  box(0.022, 0.66, 0.022, TEAL_DK, [fx + sg * 0.045, 1.77, sz]);
  box(0.022, 0.022, 0.4, TEAL_DK, [fx + sg * 0.045, 1.72, sz]);
  box(0.022, 0.022, 0.4, TEAL_DK, [fx + sg * 0.045, 1.56, sz]);
  box(0.06, 0.06, 0.03, GOLD, [fx, 2.34, sz], [45, 0, 0]);
  box(0.26, 0.06, 0.78, STONE, [fx + sg * 0.1, 1.3, sz]);
  for (const s of [-1, 1]) {
    b.sweep(catmull([[fx + sg * 0.02, 1.27, sz + s * 0.3], [fx + sg * 0.05, 1.14, sz + s * 0.3], [fx + sg * 0.17, 1.1, sz + s * 0.3], [fx + sg * 0.2, 1.08, sz + s * 0.3]]), 0.016, { color: NAVY, sides: 5, bone: base });
    ball(0.02, GOLD, [fx + sg * 0.2, 1.08, sz + s * 0.3], undefined, base, 5);
  }
  // attic porthole
  glow(cyl(0.1, 0.1, 0.02, 10, GLASS, [fx + sg * 0.02, 2.93, sz], base, [0, 0, 90]), 1.3);
  ring(0.11, 0.016, GOLD, [fx + sg * 0.03, 2.93, sz], base, [0, 90, 0]);
  box(0.014, 0.2, 0.014, GOLD, [fx + sg * 0.04, 2.93, sz]);
  box(0.014, 0.014, 0.2, GOLD, [fx + sg * 0.04, 2.93, sz]);
}

// hanging sign on a bracket (swings)
{
  const sx = -0.815;
  const bz0 = WALL_Z + 0.03;
  const arm = catmull([[sx, 2.12, bz0], [sx, 2.13, bz0 + 0.3], [sx, 2.1, bz0 + 0.6], [sx, 2.02, bz0 + 0.78]]);
  b.sweep(arm, 0.014, { color: NAVY, sides: 5, bone: base });
  rod([sx, 1.7, bz0], [sx, 2.1, bz0 + 0.4], 0.01, NAVY, 5);
  const curl = spiral([sx, 1.98, bz0 + 0.46], [sx, 2.12, bz0 + 0.5], [1, 0, 0], { turns: 0.9, r1: 0.02 });
  b.sweep(curl, 0.009, { color: GOLD, sides: 5, bone: base });
  ball(0.026, GOLD, [sx, 2.02, bz0 + 0.8], undefined, base, 6);
  const hinge = b.joint("signSwing", { parent: base, at: [sx, 2.0, bz0 + 0.6], dir: [0, -1, 0], role: "hinge" });
  rod([sx, 2.0, bz0 + 0.6], [sx, 1.9, bz0 + 0.6], 0.008, GOLD, 4, hinge);
  b.extrude(
    [
      [-0.26, 0],
      [0.26, 0],
      [0.28, 0.06],
      [0.28, 0.34],
      [0.2, 0.4],
      [-0.2, 0.4],
      [-0.28, 0.34],
      [-0.28, 0.06],
    ],
    { at: [sx, 1.52, bz0 + 0.6], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.04, bevel: 0.008, color: WOOD_DKG, bone: hinge },
  );
  for (const sd of [1, -1]) {
    plane(0.52, 0.39, SIGN, [sx + sd * 0.0225, 1.72, bz0 + 0.6], [sd, 0, 0], hinge);
  }
  for (const zz of [-0.2, 0.2]) {
    rod([sx, 1.9, bz0 + 0.6 + zz], [sx, 1.93, bz0 + 0.6 + zz], 0.006, GOLD, 4, hinge);
    ball(0.012, GOLD, [sx, 1.92, bz0 + 0.6 + zz], undefined, hinge, 5);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// 3. Street lamp
const lampIron = K(
  paint((p) => {
    const v = p.y - SW;
    if (v > 0.05 && v < 0.075) return GOLD;
    if (v > 0.24 && v < 0.265) return GOLD;
    if (v > 0.36 && v < 0.375) return GOLD;
    return NAVY;
  }),
);
lathe(
  [
    [0, 0],
    [0.2, 0],
    [0.2, 0.03],
    [0.16, 0.06],
    [0.14, 0.1],
    [0.12, 0.2],
    [0.14, 0.25],
    [0.1, 0.31],
    [0.07, 0.37],
    [0.06, 0.44],
    [0, 0.44],
  ],
  [LX, SW, LZ],
  lampIron,
  8,
);
for (let k = 0; k < 4; k++) {
  const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
  const c = (r: number, y: number): V => [LX + Math.cos(a) * r, y, LZ + Math.sin(a) * r];
  b.sweep(catmull([c(0.2, SW + 0.04), c(0.26, SW + 0.1), c(0.18, SW + 0.2), c(0.1, SW + 0.24)]), 0.014, { color: NAVY, sides: 5, bone: base });
  ball(0.022, GOLD, c(0.2, SW + 0.04), undefined, base, 5);
}
// shaft
b.rod([LX, SW + 0.44, LZ], [LX, 2.28, LZ], [0.05, 0.034], { color: NAVY, sides: 8, bone: base });
for (const [y, r] of [[0.58, 0.06], [1.1, 0.05], [1.65, 0.045]] as const) {
  cyl(r + 0.02, r + 0.02, 0.035, 8, GOLD, [LX, y, LZ]);
  cyl(r + 0.012, r + 0.03, 0.03, 8, NAVY, [LX, y - 0.03, LZ]);
}
ball(0.055, GOLD, [LX, 1.3, LZ]);
for (let k = 0; k < 4; k++) {
  const a = (k / 4) * Math.PI * 2;
  stamp(GOLD, SPH, [LX + Math.cos(a) * 0.06, 1.3, LZ + Math.sin(a) * 0.06], [0, 0, 0], [0.018, 0.018, 0.018]);
}
// arms
const armR = catmull([[LX, 1.7, LZ], [LX + 0.14, 1.72, LZ], [LX + 0.3, 1.84, LZ], [LX + 0.47, 1.88, LZ]]);
const armL = catmull([[LX, 1.7, LZ], [LX - 0.13, 1.72, LZ], [LX - 0.26, 1.82, LZ], [LX - 0.36, 1.86, LZ]]);
b.sweep(armR, 0.016, { color: NAVY, sides: 6, bone: base });
b.sweep(armL, 0.016, { color: NAVY, sides: 6, bone: base });
b.sweep(spiral([LX + 0.47, 1.82, LZ], [LX + 0.47, 1.88, LZ], [0, 0, -1], { turns: 0.85, r1: 0.02 }), 0.011, { color: GOLD, sides: 5, bone: base });
b.sweep(spiral([LX - 0.36, 1.8, LZ], [LX - 0.36, 1.86, LZ], [0, 0, 1], { turns: 0.85, r1: 0.02 }), 0.011, { color: GOLD, sides: 5, bone: base });
rod([LX, 1.4, LZ], [LX + 0.3, 1.82, LZ], 0.011, GOLD, 5);
rod([LX, 1.4, LZ], [LX - 0.25, 1.8, LZ], 0.011, GOLD, 5);
// scroll braces under the lantern
for (let k = 0; k < 4; k++) {
  const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
  const c = (r: number, y: number): V => [LX + Math.cos(a) * r, y, LZ + Math.sin(a) * r];
  b.sweep(catmull([c(0.03, 2.16), c(0.13, 2.2), c(0.2, 2.32), c(0.15, 2.4)]), 0.011, { color: GOLD, sides: 5, bone: base });
}
// lantern
lathe(
  [
    [0, 0],
    [0.1, 0],
    [0.14, 0.04],
    [0.22, 0.09],
    [0.22, 0.12],
    [0.18, 0.13],
    [0.15, 0.14],
    [0, 0.14],
  ],
  [LX, 2.3, LZ],
  GOLD,
  6,
);
ball(0.05, GOLD, [LX, 2.27, LZ]);
const lanternGlass = b.part(new THREE.CylinderGeometry(0.17, 0.145, 0.44, 6, 1, true), "#ffffff", {
  bone: base,
  at: [LX, 2.66, LZ],
  texture: LANTERN_GLASS,
});
glow(lanternGlass, 1.5);
for (let k = 0; k < 6; k++) {
  const a = (k / 6) * Math.PI * 2;
  const rb = 0.145 / Math.cos(Math.PI / 6) * 0.0 + 0.145;
  const rt = 0.17;
  rod([LX + Math.sin(a) * rb, 2.44, LZ + Math.cos(a) * rb], [LX + Math.sin(a) * rt, 2.88, LZ + Math.cos(a) * rt], 0.012, GOLD, 5);
}
lathe(
  [
    [0, 0],
    [0.22, 0],
    [0.22, 0.03],
    [0.18, 0.06],
    [0.16, 0.06],
    [0, 0.06],
  ],
  [LX, 2.87, LZ],
  GOLD,
  6,
);
lathe(
  [
    [0, 0],
    [0.3, 0],
    [0.3, 0.02],
    [0.25, 0.07],
    [0.15, 0.15],
    [0.07, 0.24],
    [0.04, 0.28],
    [0, 0.28],
  ],
  [LX, 2.93, LZ],
  K(paint((p) => (fract((Math.atan2(p.z - LZ, p.x - LX) / Math.PI) * 3) < 0.09 ? GOLD : fract((p.y - 2.93) / 0.06) < 0.2 ? "#1f7f8d" : "#33b5b1"))),
  6,
);
ball(0.035, GOLD, [LX, 3.23, LZ]);
cyl(0.0, 0.015, 0.1, 5, GOLD, [LX, 3.3, LZ]);
for (const a of [0, 90]) box(0.12, 0.028, 0.006, GOLD_PALE, [LX, 3.37, LZ], [0, a, 20]);
ball(0.014, GOLD, [LX, 3.37, LZ], undefined, base, 5);
ring(0.205, 0.014, GOLD, [LX, 2.46, LZ], base, [90, 30, 0]);

// hanging flower basket on the right arm
const BAS: V = [LX + 0.47, 1.5, LZ];
lathe(
  [
    [0, 0],
    [0.07, 0],
    [0.11, 0.03],
    [0.14, 0.09],
    [0.15, 0.14],
    [0.13, 0.14],
    [0.12, 0.1],
    [0.08, 0.05],
    [0, 0.03],
  ],
  BAS,
  TERRA,
  8,
);
ring(0.15, 0.014, GOLD, [BAS[0], BAS[1] + 0.14, BAS[2]]);
cyl(0.13, 0.13, 0.01, 8, SOIL, [BAS[0], BAS[1] + 0.125, BAS[2]]);
for (let k = 0; k < 3; k++) {
  const a = (k / 3) * Math.PI * 2 + 0.5;
  rod([LX + 0.47, 1.78, LZ], [BAS[0] + Math.cos(a) * 0.145, BAS[1] + 0.14, BAS[2] + Math.sin(a) * 0.145], 0.005, GOLD, 4);
}
ball(0.024, GOLD, [LX + 0.47, 1.8, LZ], undefined, base, 5);

// tassels
b.cards(
  [frame([LX + 0.17, 2.4, LZ + 0.17], [0, 1, 0]), frame([LX - 0.17, 2.4, LZ + 0.17], [0, 1, 0]), frame([LX - 0.36, 1.84, LZ], [0, 1, 0])],
  TASSEL,
  { size: [0.05, 0.2], lean: 180, flow: [0, 0, 1], cross: true, bone: base, sink: 0 },
);

// bird on the left arm
{
  const bp = armL.at(0.55);
  const bx = bp.x;
  const by = bp.y + 0.016;
  ball(0.045, BIRD_Y, [bx, by + 0.05, LZ], [1, 0.9, 1.2]);
  ball(0.03, BIRD_Y, [bx, by + 0.105, LZ + 0.04]);
  b.part(new THREE.ConeGeometry(0.012, 0.03, 5), TERRA, { bone: base, at: [bx, by + 0.1, LZ + 0.075], dir: [0, -0.15, 1] });
  b.part(new THREE.ConeGeometry(0.02, 0.07, 5), TERRA, { bone: base, at: [bx, by + 0.045, LZ - 0.075], dir: [0, 0.2, -1] });
  b.part(new THREE.SphereGeometry(0.035, 6, 4), K("#f5b92f", "#d98a2a"), { bone: base, at: [bx + 0.035, by + 0.06, LZ], scale: [0.4, 0.8, 1.2] });
  b.part(new THREE.SphereGeometry(0.035, 6, 4), K("#f5b92f", "#d98a2a"), { bone: base, at: [bx - 0.035, by + 0.06, LZ], scale: [0.4, 0.8, 1.2] });
  ball(0.006, INKC, [bx + 0.018, by + 0.115, LZ + 0.06], undefined, base, 4);
  ball(0.006, INKC, [bx - 0.018, by + 0.115, LZ + 0.06], undefined, base, 4);
  rod([bx + 0.008, by + 0.01, LZ + 0.005], [bx + 0.008, by - 0.005, LZ + 0.005], 0.004, TERRA, 4);
  rod([bx - 0.008, by + 0.01, LZ + 0.005], [bx - 0.008, by - 0.005, LZ + 0.005], 0.004, TERRA, 4);
}

// bunting from the lamp arm to the sign bracket
{
  const p0: V = [LX + 0.47, 1.93, LZ];
  const p1: V = [-0.815, 2.04, WALL_Z + 0.03 + 0.8];
  const mid: V = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 - 0.5, (p0[2] + p1[2]) / 2];
  const path = bezier(p0, mid, p1);
  b.sweep(path, 0.007, { color: GOLD, sides: 4, bone: base });
  const dx = p1[0] - p0[0];
  const dz = p1[2] - p0[2];
  const fl = Math.hypot(dx, dz);
  const flowD: V = [dz / fl, 0, -dx / fl];
  const tints = ["#ec5a4f", "#f6c94e", "#33b5b1", "#ff8fb1"];
  for (let t = 0; t < 4; t++) {
    const frames: Spot[] = [];
    for (let i = t; i < 8; i += 4) {
      const q = path.at(0.09 + (i / 7) * 0.82);
      frames.push(frame([q.x, q.y, q.z], [0, 1, 0]));
    }
    b.cards(frames, FLAG, { size: [0.13, 0.17], lean: 180, flow: flowD, color: tints[t], bone: base, sink: 0, bend: 8 });
  }
}

// ---------------------------------------------------------------------------------------------------------------
// 4. Mailbox on a post
{
  const top = SW + 0.95;
  b.rod([MX, SW, MZ], [MX, top, MZ], [0.06, 0.048], { color: WOOD_Y, sides: 8, bone: base });
  cyl(0.085, 0.095, 0.06, 8, STONE, [MX, SW + 0.03, MZ]);
  box(0.16, 0.035, 0.16, CREAM, [MX, top + 0.01, MZ]);
  box(0.38, 0.03, 0.6, NAVY, [MX, top + 0.045, MZ]);
  for (const s of [1, -1]) {
    b.sweep(catmull([[MX, top - 0.12, MZ + s * 0.05], [MX, top - 0.02, MZ + s * 0.12], [MX, top + 0.02, MZ + s * 0.22], [MX, top + 0.04, MZ + s * 0.28]]), 0.012, { color: NAVY, sides: 5, bone: base });
    ball(0.02, GOLD, [MX, top + 0.04, MZ + s * 0.28], undefined, base, 5);
  }
  const y0 = top + 0.06;
  const mbPaint = K(
    paint((p, n) => {
      const v = p.y - y0;
      if (n.y < -0.5) return RED_DK;
      if (v < 0.035) return NAVY;
      for (const d of [-0.215, -0.205, 0.205, 0.215]) if (Math.abs(p.z - MZ - d) < 0.0035) return GOLD;
      return RED;
    }),
  );
  b.extrude(arch(0.32, 0.38, 10), { at: [MX, y0, MZ], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.52, bevel: 0.012, color: mbPaint, bone: base });
  rod([MX, y0 + 0.381, MZ - 0.25], [MX, y0 + 0.381, MZ + 0.25], 0.012, GOLD, 6);
  // front door on a hinge
  const door = b.joint("mailDoor", { parent: base, at: [MX, y0 + 0.025, MZ + 0.27], dir: [0, 1, 0], role: "hinge" });
  b.extrude(arch(0.3, 0.355, 10), { at: [MX, y0 + 0.025, MZ + 0.261], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.02, bevel: 0.004, color: GOLD, bone: door });
  b.extrude(arch(0.25, 0.31, 10), { at: [MX, y0 + 0.045, MZ + 0.274], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, bevel: 0.003, color: RED, bone: door });
  ball(0.02, GOLD, [MX, y0 + 0.22, MZ + 0.292], undefined, door, 6);
  box(0.12, 0.012, 0.01, GOLD, [MX, y0 + 0.28, MZ + 0.284], undefined, door);
  box(0.1, 0.005, 0.012, INKC, [MX, y0 + 0.28, MZ + 0.29], undefined, door);
  // emblems on the sides
  for (const s of [1, -1]) plane(0.19, 0.19, EMBLEM, [MX + s * 0.1625, y0 + 0.19, MZ], [s, 0, 0]);
  // flag
  const flag = b.joint("mailFlag", { parent: base, at: [MX + 0.17, y0 + 0.14, MZ - 0.06], dir: [0, 1, 0], up: [-1, 0, 0], role: "hinge" });
  ball(0.022, GOLD, [MX + 0.172, y0 + 0.14, MZ - 0.06], undefined, flag, 6);
  rod([MX + 0.172, y0 + 0.14, MZ - 0.06], [MX + 0.172, y0 + 0.34, MZ - 0.06], 0.008, GOLD, 5, flag);
  b.extrude(
    [
      [0, 0],
      [0.15, 0.0],
      [0.11, 0.05],
      [0.15, 0.1],
      [0, 0.1],
    ],
    { at: [MX + 0.172, y0 + 0.25, MZ - 0.06], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.012, color: TEAL, bone: flag },
  );
  b.cards([frame([MX + 0.18, y0 + 0.03, MZ + 0.2], [0, 1, 0])], TASSEL, { size: [0.035, 0.14], lean: 180, flow: [1, 0, 0], cross: true, bone: base, sink: 0 });
  // a letter peeking out of the top slot
  box(0.1, 0.01, 0.006, GOLD, [MX, y0 + 0.382, MZ + 0.12]);
  box(0.09, 0.075, 0.003, PAPER, [MX, y0 + 0.4, MZ + 0.12], [-8, 0, 0]);
  b.part(new THREE.PlaneGeometry(0.03, 0.03), "#ff6a86", { bone: base, at: [MX, y0 + 0.405, MZ + 0.1235], dir: [0, -0.14, 1], axis: "z", texture: HEART });
}

// ---------------------------------------------------------------------------------------------------------------
// 5. Bench with a napping cat
{
  const bw = 1.3;
  const seatY = SW + 0.46;
  for (let i = 0; i < 4; i++) {
    box(bw, 0.035, 0.088, i % 2 ? WOOD : WOOD_LT, [BX, seatY - 0.0175, BZ - 0.16 + i * 0.1]);
  }
  // backrest slats lean back against the wall
  for (let i = 0; i < 3; i++) {
    const yy = seatY + 0.2 + i * 0.14;
    box(bw, 0.1, 0.03, i % 2 ? WOOD_LT : WOOD, [BX, yy, BZ - 0.235 - i * 0.02], [-10, 0, 0]);
  }
  // rails under the seat
  rod([BX - bw / 2, seatY - 0.06, BZ - 0.1], [BX + bw / 2, seatY - 0.06, BZ - 0.1], 0.016, NAVY, 5);
  rod([BX - bw / 2, seatY - 0.06, BZ + 0.12], [BX + bw / 2, seatY - 0.06, BZ + 0.12], 0.016, NAVY, 5);
  for (const s of [1, -1]) {
    const x = BX + s * (bw / 2 - 0.03);
    // front leg with foot curl, back leg + back support, armrest with scroll
    b.sweep(catmull([[x, SW, BZ + 0.2], [x, SW + 0.15, BZ + 0.17], [x, seatY - 0.05, BZ + 0.16]]), 0.017, { color: NAVY, sides: 6, bone: base });
    b.sweep(catmull([[x, SW, BZ - 0.3], [x, SW + 0.2, BZ - 0.26], [x, seatY + 0.2, BZ - 0.26], [x, seatY + 0.48, BZ - 0.32]]), 0.017, { color: NAVY, sides: 6, bone: base });
    b.sweep(catmull([[x, seatY - 0.04, BZ + 0.16], [x, seatY + 0.14, BZ + 0.2], [x, seatY + 0.24, BZ + 0.1], [x, seatY + 0.28, BZ - 0.1], [x, seatY + 0.25, BZ - 0.24]]), 0.015, { color: NAVY, sides: 6, bone: base });
    b.sweep(spiral([x, seatY + 0.17, BZ + 0.2], [x, seatY + 0.14, BZ + 0.2], [s, 0, 0], { turns: 0.8, r1: 0.02 }), 0.012, { color: GOLD, sides: 5, bone: base });
    b.sweep(spiral([x, SW + 0.04, BZ + 0.25], [x, SW, BZ + 0.2], [s, 0, 0], { turns: -0.7, r1: 0.015 }), 0.012, { color: GOLD, sides: 5, bone: base });
    ball(0.024, GOLD, [x, seatY + 0.48, BZ - 0.32], undefined, base, 6);
    // curved decorative brace
    b.sweep(catmull([[x, seatY - 0.05, BZ + 0.12], [x, seatY - 0.15, BZ - 0.02], [x, seatY - 0.18, BZ - 0.26]]), 0.009, { color: GOLD, sides: 4, bone: base });
    box(0.07, 0.02, 0.1, NAVY_DEEP, [x, SW + 0.01, BZ + 0.2]);
    box(0.07, 0.02, 0.1, NAVY_DEEP, [x, SW + 0.01, BZ - 0.3]);
  }
  // seat screws
  for (let i = 0; i < 4; i++) for (const s of [1, -1]) stamp(GOLD, SPH, [BX + s * (bw / 2 - 0.05), seatY + 0.002, BZ - 0.16 + i * 0.1], [0, 0, 0], [0.007, 0.004, 0.007]);
  // plaque on the back
  box(0.2, 0.05, 0.006, GOLD, [BX, seatY + 0.34, BZ - 0.285], [-10, 0, 0]);
  box(0.17, 0.028, 0.004, CREAM, [BX, seatY + 0.34, BZ - 0.279], [-10, 0, 0]);
  // cushion + book
  b.part(new THREE.SphereGeometry(0.1, 8, 5), TEAL, { bone: base, at: [BX + 0.42, seatY + 0.03, BZ - 0.02], scale: [1.4, 0.35, 1.1], rotation: [0, 12, 0] });
  b.part(new THREE.SphereGeometry(0.02, 6, 4), GOLD, { bone: base, at: [BX + 0.42, seatY + 0.065, BZ - 0.02], scale: [1, 0.6, 1] });
  box(0.17, 0.035, 0.12, BOOK, [BX + 0.36, seatY + 0.08, BZ - 0.0], [0, -18, 0]);
  box(0.155, 0.025, 0.11, PAPER, [BX + 0.363, seatY + 0.08, BZ + 0.003], [0, -18, 0]);
  box(0.02, 0.037, 0.12, GOLD, [BX + 0.29, seatY + 0.08, BZ - 0.0], [0, -18, 0]);
  // the cat, curled up on the left
  const cx = BX - 0.3;
  const cz = BZ - 0.02;
  const cyy = seatY;
  b.part(new THREE.SphereGeometry(0.12, 8, 6), ORANGE_CAT, { bone: base, at: [cx, cyy + 0.07, cz], scale: [1.15, 0.7, 1.0] });
  b.part(new THREE.SphereGeometry(0.075, 8, 6), ORANGE_CAT, { bone: base, at: [cx + 0.13, cyy + 0.08, cz + 0.07] });
  b.part(new THREE.SphereGeometry(0.05, 6, 4), CAT_WHITE, { bone: base, at: [cx + 0.15, cyy + 0.065, cz + 0.12], scale: [1.1, 0.8, 0.9] });
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.03, 0.06, 4), ORANGE_CAT, { bone: base, at: [cx + 0.13 + s * 0.04, cyy + 0.15, cz + 0.06], rotation: [0, 0, -s * 14] });
    b.part(new THREE.ConeGeometry(0.014, 0.035, 4), K("#ffb4a2", "#d9809a"), { bone: base, at: [cx + 0.13 + s * 0.04, cyy + 0.147, cz + 0.07], rotation: [0, 0, -s * 14] });
    b.part(new THREE.SphereGeometry(0.04, 6, 4), CAT_WHITE, { bone: base, at: [cx + 0.02 + s * 0.15, cyy + 0.04, cz + 0.13], scale: [0.8, 0.6, 1.2] });
    box(0.034, 0.005, 0.006, INKC, [cx + 0.13 + s * 0.032, cyy + 0.096, cz + 0.137]);
    for (const w of [-1, 1]) rod([cx + 0.13 + s * 0.05, cyy + 0.075, cz + 0.14], [cx + 0.13 + s * 0.1, cyy + 0.075 + w * 0.012, cz + 0.13], 0.0025, WHITE, 3);
  }
  ball(0.012, K("#ff8fa6"), [cx + 0.13, cyy + 0.078, cz + 0.143], undefined, base, 4);
  // tail curled around, with stripes
  b.sweep(catmull([[cx - 0.1, cyy + 0.05, cz - 0.06], [cx - 0.05, cyy + 0.03, cz - 0.17], [cx + 0.1, cyy + 0.03, cz - 0.15], [cx + 0.2, cyy + 0.04, cz - 0.03]]), [0.03, 0.022], {
    color: K(stripes("#f2a24a", "#c76a45", { size: 0.06, axis: "z" })),
    sides: 6,
    bone: base,
  });
  // stripes on the back
  for (let i = 0; i < 3; i++) box(0.012, 0.004, 0.09, K("#c76a45"), [cx - 0.08 + i * 0.07, cyy + 0.13 - i * 0.004, cz - 0.01], [0, 0, 0]);
}

// ---------------------------------------------------------------------------------------------------------------
// 6. Flower boxes and planters
function bloom(area: { cx: number; cz: number; y: number; w: number; d: number }, seed: number, n: number, set: THREE.Texture[], height = 0.26) {
  const r = rng(seed);
  const leafF: Spot[] = [];
  const flF: Spot[] = [];
  for (let i = 0; i < n * 1.4; i++) {
    const x = area.cx + (r() - 0.5) * (area.w - 0.06);
    const z = area.cz + (r() - 0.5) * (area.d - 0.05);
    leafF.push(frame([x, area.y, z], [0, 1, 0]));
  }
  for (let i = 0; i < n; i++) {
    const x = area.cx + (r() - 0.5) * (area.w - 0.08);
    const z = area.cz + (r() - 0.5) * (area.d - 0.06);
    flF.push(frame([x, area.y, z], [0, 1, 0]));
  }
  const outward = (f: Frame): V => {
    const dx = f.at.x - area.cx;
    const dz = f.at.z - area.cz;
    const l = Math.hypot(dx, dz) || 1;
    return [dx / l, 0, dz / l];
  };
  b.cards(leafF, LEAF, { size: [0.17, 0.2], lean: 38, flow: (f) => outward(f), cross: true, vary: 0.3, rng: r, bone: base, bend: 14 });
  b.cards(leafF.filter((_, i) => i % 3 === 0), LEAF_Y, { size: [0.14, 0.16], lean: 55, flow: (f) => outward(f), vary: 0.3, rng: r, bone: base });
  b.cards(flF, set, { size: [0.12, height], lean: 12, flow: (f) => outward(f), cross: true, vary: 0.3, rng: r, bone: base });
}

function trailing(x0: number, x1: number, y: number, z: number, n: number, seed: number) {
  const r = rng(seed);
  const fr: Spot[] = [];
  for (let i = 0; i < n; i++) fr.push(frame([x0 + ((x1 - x0) * (i + 0.3 + r() * 0.4)) / n, y, z], [0, 1, 0]));
  b.cards(fr, IVY, { size: [0.07, 0.12 + r() * 0.1], lean: 180, flow: [0, 0, 1], vary: 0.5, rng: r, cross: true, bone: base, sink: 0 });
}

function woodBox(opts: { cx: number; cz: number; y0: number; w: number; d: number; h: number; base: Col; panel: Col; edge: Col; trim: Col; legs?: boolean; alongZ?: boolean }) {
  const { cx, cz, y0, w, d, h } = opts;
  const long = opts.alongZ ? d : w;
  const pw = Math.max(0.2, long / Math.round(long / 0.26));
  box(w, h, d, planterPaint(opts.alongZ ? cz : cx, y0, h, pw, opts.base, opts.panel, opts.edge, opts.alongZ), [cx, y0 + h / 2, cz]);
  box(w + 0.05, 0.035, d + 0.05, opts.trim, [cx, y0 + h + 0.0, cz]);
  box(w + 0.03, 0.03, d + 0.03, opts.trim, [cx, y0 + 0.015, cz]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    box(0.04, h + 0.02, 0.04, opts.trim, [cx + sx * (w / 2), y0 + h / 2, cz + sz * (d / 2)]);
    ball(0.018, GOLD, [cx + sx * (w / 2), y0 + h + 0.03, cz + sz * (d / 2)], undefined, base, 5);
  }
  box(w - 0.04, 0.02, d - 0.04, SOIL, [cx, y0 + h + 0.015, cz]);
  if (opts.legs) for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.05, y0 - SW, 0.05, WOOD_DK, [cx + sx * (w / 2 - 0.06), SW + (y0 - SW) / 2, cz + sz * (d / 2 - 0.04)]);
  return y0 + h + 0.025;
}
const MIX = [FL_PINK, FL_BLUE, FL_WHITE, FL_LAV, FL_TULIP, FL_BABY, FL_PINK, FL_TULIP];

// window box on the sill
{
  const top = woodBox({ cx: WX, cz: WALL_Z + 0.1, y0: 1.23, w: 0.9, d: 0.2, h: 0.16, base: WOOD_DKG, panel: K("#b27346"), edge: GOLD, trim: TEAL });
  bloom({ cx: WX, cz: WALL_Z + 0.1, y: top, w: 0.9, d: 0.2 }, 31, 13, MIX, 0.3);
  trailing(WX - 0.4, WX + 0.4, 1.3, WALL_Z + 0.215, 7, 5);
}
// side window boxes (hang over the street and the left corner)
for (const sg of [1, -1]) {
  const sz = (WALL_Z + WALL_B) / 2;
  const bx = (sg > 0 ? SIDE_X : -1.8) + sg * 0.1;
  const top = woodBox({ cx: bx, cz: sz, y0: 1.33, w: 0.2, d: 0.7, h: 0.16, base: WOOD_DKG, panel: K("#b27346"), edge: GOLD, trim: TEAL, alongZ: true });
  bloom({ cx: bx, cz: sz, y: top, w: 0.2, d: 0.7 }, 44 + sg * 7, 10, MIX, 0.28);
  const r3 = rng(19 + sg);
  const fr: Spot[] = [];
  for (let i = 0; i < 6; i++) fr.push(frame([bx + sg * 0.115, 1.4, sz - 0.3 + (0.6 * (i + 0.3 + r3() * 0.4)) / 6], [0, 1, 0]));
  b.cards(fr, IVY, { size: [0.07, 0.14 + r3() * 0.08], lean: 180, flow: [sg, 0, 0], vary: 0.5, rng: r3, cross: true, bone: base, sink: 0 });
}
// long curbside planter on short legs
{
  const pcx = -0.55;
  const top = woodBox({ cx: pcx, cz: 0.32, y0: SW + 0.1, w: 1.2, d: 0.3, h: 0.26, base: WOOD_DKG, panel: K("#c28850"), edge: GOLD, trim: CREAM, legs: true });
  bloom({ cx: pcx, cz: 0.32, y: top, w: 1.2, d: 0.3 }, 77, 24, MIX, 0.34);
  trailing(pcx - 0.55, pcx + 0.55, SW + 0.1 + 0.27, 0.32 + 0.16, 9, 8);
  // little watering can next to it
  const wx = 0.2;
  const wz = 0.05;
  b.part(new THREE.CylinderGeometry(0.06, 0.07, 0.11, 8), TEAL, { bone: base, at: [wx, SW + 0.055, wz] });
  ring(0.062, 0.006, GOLD, [wx, SW + 0.11, wz], base);
  rod([wx - 0.05, SW + 0.06, wz], [wx - 0.13, SW + 0.15, wz], 0.012, TEAL_DK, 5);
  b.part(new THREE.ConeGeometry(0.014, 0.05, 5), GOLD, { bone: base, at: [wx - 0.14, SW + 0.16, wz], rotation: [0, 0, 55] });
  b.sweep(catmull([[wx + 0.05, SW + 0.1, wz], [wx + 0.12, SW + 0.16, wz], [wx + 0.07, SW + 0.2, wz], [wx + 0.0, SW + 0.12, wz]]), 0.007, { color: GOLD, sides: 4, bone: base });
}
// tub with a cone topiary beside the bench, pot by the mailbox
{
  const tx = 0.7;
  const tz = -1.2;
  lathe(
    [
      [0, 0],
      [0.14, 0],
      [0.19, 0.28],
      [0.21, 0.3],
      [0.19, 0.3],
      [0.17, 0.27],
      [0, 0.27],
    ],
    [tx, SW, tz],
    TERRA,
    8,
  );
  ring(0.2, 0.015, GOLD, [tx, SW + 0.29, tz]);
  ring(0.17, 0.01, GOLD, [tx, SW + 0.12, tz]);
  b.part(new THREE.ConeGeometry(0.17, 0.48, 7), GREEN_DK, { bone: base, at: [tx, SW + 0.5, tz] });
  b.part(new THREE.ConeGeometry(0.12, 0.32, 7), GREEN, { bone: base, at: [tx, SW + 0.72, tz] });
  ball(0.035, GOLD, [tx, SW + 0.9, tz], undefined, base, 6);
  const bl: Spot[] = [];
  const r2 = rng(14);
  for (let i = 0; i < 14; i++) {
    const a = r2() * Math.PI * 2;
    const h = 0.34 + r2() * 0.45;
    const rr = 0.17 * (1 - (h - 0.3) / 0.7) + 0.02;
    bl.push(frame([tx + Math.cos(a) * rr, SW + h, tz + Math.sin(a) * rr], [Math.cos(a), 0.4, Math.sin(a)]));
  }
  b.cards(bl, [FL_PINK, FL_WHITE], { size: 0.08, lean: 80, flow: [0, -1, 0], vary: 0.3, rng: r2, bone: base, sink: 0.4 });
  // round pot beside the mailbox
  const px = 0.32;
  const pz = -0.28;
  lathe(
    [
      [0, 0],
      [0.09, 0],
      [0.13, 0.19],
      [0.15, 0.21],
      [0.13, 0.21],
      [0.11, 0.18],
      [0, 0.18],
    ],
    [px, SW, pz],
    TERRA,
    8,
  );
  ring(0.14, 0.012, GOLD, [px, SW + 0.2, pz]);
  cyl(0.11, 0.11, 0.008, 8, SOIL, [px, SW + 0.195, pz]);
  bloom({ cx: px, cz: pz, y: SW + 0.2, w: 0.2, d: 0.2 }, 61, 6, [FL_TULIP, FL_PINK, FL_BLUE], 0.3);
}
// ivy climbing the left corner and over the door
{
  const IVYLEAF = svg(
    SVG(
      `<path d="M16 30 C4 24 0 12 6 6 C10 2 14 4 16 10 C18 4 22 2 26 6 C32 12 28 24 16 30Z" fill="#4aa43c"/><path d="M16 30 C10 24 8 14 11 9 C13 12 15 16 16 24Z" fill="#5cba45"/><path d="M16 30 L16 12" stroke="#2f7a30" stroke-width="1.4"/>`,
      "0 0 32 32",
    ),
    { size: 96 },
  );
  const vine = catmull([
    [-1.79, SW + 0.05, WALL_Z + 0.015],
    [-1.75, 0.8, WALL_Z + 0.02],
    [-1.79, 1.3, WALL_Z + 0.02],
    [-1.74, 1.9, WALL_Z + 0.02],
    [-1.6, 2.02, WALL_Z + 0.02],
    [-1.4, 1.98, WALL_Z + 0.02],
    [-1.2, 2.06, WALL_Z + 0.02],
    [-1.0, 2.0, WALL_Z + 0.02],
  ]);
  b.sweep(vine, 0.007, { color: GREEN_DK, sides: 4, bone: base });
  const ri = rng(23);
  const lf: Spot[] = [];
  for (let i = 0; i < 44; i++) {
    const q = vine.at(0.02 + (i / 43) * 0.96);
    lf.push(frame([q.x + (ri() - 0.5) * 0.1, q.y + (ri() - 0.5) * 0.08, WALL_Z + 0.02], [0, 0, 1]));
  }
  b.cards(lf, IVYLEAF, { size: 0.1, lean: 85, flow: (_f, i) => [Math.cos(i * 2.1), Math.sin(i * 2.7) * 0.8 - 0.2, 0], vary: 0.35, rng: ri, spin: 40, bone: base, sink: 0 });
}
// hanging basket blooms
bloom({ cx: BAS[0], cz: BAS[2], y: BAS[1] + 0.13, w: 0.3, d: 0.3 }, 91, 9, [FL_PINK, FL_BLUE, FL_WHITE, FL_TULIP], 0.26);
trailing(BAS[0] - 0.12, BAS[0] + 0.12, BAS[1] + 0.12, BAS[2] + 0.15, 4, 12);
trailing(BAS[0] - 0.12, BAS[0] + 0.12, BAS[1] + 0.12, BAS[2] - 0.15, 4, 13);

// floating dandelion seeds drifting by the lamp
b.cards(
  [frame([-0.9, 1.3, 0.55], [0, 1, 0]), frame([-0.2, 2.0, 0.4], [0, 1, 0]), frame([-1.9, 2.5, 0.1], [0, 1, 0])],
  SEED,
  { size: 0.14, lean: 0, flow: [0, 0, 1], cross: true, bone: base, sink: 0 },
);


// ---------------------------------------------------------------------------------------------------------------
// 7. Back of the house: lit windows, a plain door, barrel and crates
{
  const bz = WALL_B;
  for (const wx of [-1.25, 0.5]) {
    b.extrude(arch(0.7, 0.96, 8), { at: [wx, 1.3, bz + 0.02], x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.06, bevel: 0.008, color: CREAM, bone: base });
    b.extrude(arch(0.54, 0.8, 8), { at: [wx, 1.38, bz - 0.015], x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.03, color: TEAL_DK, bone: base });
    glow(plane(0.44, 0.66, WINDOW_GLASS, [wx, 1.77, bz - 0.036], [0, 0, -1]), 1.2);
    box(0.022, 0.66, 0.022, TEAL_DK, [wx, 1.77, bz - 0.045]);
    box(0.44, 0.022, 0.022, TEAL_DK, [wx, 1.72, bz - 0.045]);
    box(0.44, 0.022, 0.022, TEAL_DK, [wx, 1.56, bz - 0.045]);
    box(0.06, 0.06, 0.03, GOLD, [wx, 2.34, bz], [0, 0, 45]);
    box(0.8, 0.06, 0.26, STONE, [wx, 1.3, bz - 0.1]);
    const top = woodBox({ cx: wx, cz: bz - 0.1, y0: 1.33, w: 0.64, d: 0.18, h: 0.14, base: WOOD_DKG, panel: K("#b27346"), edge: GOLD, trim: TEAL });
    bloom({ cx: wx, cz: bz - 0.1, y: top, w: 0.64, d: 0.18 }, 90 + Math.round(wx * 10), 8, MIX, 0.26);
  }
  const dx = -0.4;
  b.extrude(arch(0.86, 1.68, 8), { at: [dx, SW, bz + 0.02], x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.08, bevel: 0.01, color: STONE, bone: base });
  b.extrude(arch(0.66, 1.54, 8), { at: [dx, SW, bz - 0.02], x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.05, bevel: 0.006, color: WOOD_DKG, bone: base });
  for (const v of [0.3, 0.96]) box(0.62, 0.035, 0.012, NAVY, [dx, SW + v, bz - 0.05]);
  for (const v of [0.3, 0.96]) for (const s of [-1, 1]) ball(0.017, GOLD, [dx + s * 0.29, SW + v, bz - 0.056], undefined, base, 5);
  ball(0.035, GOLD, [dx + 0.22, SW + 0.78, bz - 0.07]);
  box(0.07, 0.07, 0.03, GOLD, [dx, SW + 1.7, bz - 0.03], [0, 0, 45]);
  box(0.9, 0.1, 0.36, STONE, [dx, SW + 0.05, bz - 0.2]);
  // lantern over the door
  rod([dx, SW + 1.95, bz - 0.02], [dx, SW + 1.95, bz - 0.2], 0.012, GOLD, 5);
  glow(cyl(0.055, 0.045, 0.13, 6, GLASS, [dx, SW + 1.86, bz - 0.2]), 1.4);
  cyl(0.0, 0.075, 0.07, 6, TEAL, [dx, SW + 1.965, bz - 0.2]);
  ball(0.014, GOLD, [dx, SW + 2.01, bz - 0.2], undefined, base, 5);
  // rain barrel under a downspout
  const brx = 0.72;
  const brz = bz - 0.22;
  lathe(
    [
      [0, 0],
      [0.15, 0],
      [0.19, 0.12],
      [0.2, 0.25],
      [0.19, 0.38],
      [0.15, 0.5],
      [0, 0.5],
    ],
    [brx, SW, brz],
    WOOD_Y,
    10,
  );
  for (const [yy, rr] of [[0.08, 0.17], [0.25, 0.205], [0.42, 0.175]] as const) ring(rr, 0.012, NAVY, [brx, SW + yy, brz]);
  cyl(0.14, 0.14, 0.012, 10, TEAL_LT, [brx, SW + 0.49, brz]);
  rod([brx, 2.55, bz - 0.04], [brx, SW + 0.62, brz + 0.04], 0.026, NAVY, 6);
  // crates with apples and a sack
  const kx = -1.3;
  const kz = bz - 0.25;
  const crate = planterPaint(kx, SW, 0.3, 0.17, WOOD_DKG, K("#c28850"), GOLD);
  box(0.38, 0.3, 0.32, crate, [kx, SW + 0.15, kz]);
  box(0.42, 0.03, 0.36, WOOD_LT, [kx, SW + 0.3, kz]);
  box(0.3, 0.24, 0.27, crate, [kx + 0.02, SW + 0.45, kz], [0, 18, 0]);
  for (const [ax, az] of [[-0.08, -0.05], [0.06, -0.07], [0.0, 0.05], [0.1, 0.04], [-0.07, 0.07]] as const)
    stamp(RED, SPH, [kx + ax, SW + 0.6, kz + az], [0, 0, 0], [0.04, 0.038, 0.04]);
  b.part(new THREE.SphereGeometry(0.15, 8, 6), K("#e8d9a8", "#b8a77e"), { bone: base, at: [kx + 0.5, SW + 0.11, kz + 0.02], scale: [1, 0.8, 0.9] });
  ball(0.05, K("#e8d9a8", "#b8a77e"), [kx + 0.5, SW + 0.23, kz + 0.02], [1, 0.6, 1]);
  ring(0.05, 0.01, TEAL, [kx + 0.5, SW + 0.2, kz + 0.02]);
}
// ---------------------------------------------------------------------------------------------------------------
// 8. Handcart full of flowers, parked on the side street
{
  const cx = 1.45;
  const cz = -1.5;
  const by = ST + 0.38;
  const wy = ST + 0.2;
  for (const s of [-1, 1]) {
    const wx = cx + s * 0.3;
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 12), WOOD, { bone: base, at: [wx, wy, cz], rotation: [0, 0, 90] });
    ring(0.2, 0.014, NAVY, [wx, wy, cz], base, [0, 90, 0]);
    cyl(0.045, 0.045, 0.08, 8, GOLD, [wx + s * 0.02, wy, cz], base, [0, 0, 90]);
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 4;
      rod([wx + s * 0.026, wy - Math.cos(a) * 0.19, cz - Math.sin(a) * 0.19], [wx + s * 0.026, wy + Math.cos(a) * 0.19, cz + Math.sin(a) * 0.19], 0.011, WOOD_DK, 5);
    }
  }
  rod([cx - 0.3, wy, cz], [cx + 0.3, wy, cz], 0.016, NAVY, 5);
  box(0.54, 0.05, 0.84, WOOD, [cx, by, cz]);
  const side = planterPaint(cz, by, 0.2, 0.28, WOOD_DKG, K("#c28850"), GOLD, true);
  for (const s of [-1, 1]) {
    box(0.035, 0.2, 0.84, side, [cx + s * 0.2775, by + 0.1, cz]);
    rod([cx + s * 0.2775, by + 0.2, cz - 0.42], [cx + s * 0.2775, by + 0.2, cz + 0.42], 0.014, GOLD, 5);
    rod([cx + s * 0.2, by + 0.04, cz + 0.42], [cx + s * 0.2, ST + 0.2, cz + 1.05], 0.016, WOOD_DK, 5);
    ball(0.026, GOLD, [cx + s * 0.2, ST + 0.2, cz + 1.05], undefined, base, 5);
    rod([cx + s * 0.2, ST + 0.22, cz + 0.93], [cx + s * 0.2, ST, cz + 0.93], 0.012, WOOD_DK, 5);
    box(0.04, 0.06, 0.02, GOLD, [cx + s * 0.2, by + 0.03, cz + 0.425]);
  }
  for (const s of [-1, 1]) box(0.54, 0.2, 0.035, WOOD_DKG, [cx, by + 0.1, cz + s * 0.4125]);
  box(0.5, 0.02, 0.8, SOIL, [cx, by + 0.15, cz]);
  bloom({ cx, cz, y: by + 0.16, w: 0.5, d: 0.8 }, 111, 18, MIX, 0.32);
}

flush();
export default function build() {
  return b.root;
}
```

## Example: orcWarCampDioramaSonnet

Brief: Category: Diorama.
Subject: fortified orc war camp with hide-roofed hut, tusk and skull totems, banners, cauldron fire, drum, weapon rack, palisade and clutter.
Style: Blizzard/Warcraft.
Topology: diorama
Style family: blizzard-warcraft
Notable features: hut, totems, fire, palisade, weapon-rack

```ts
// Orc war camp diorama, Blizzard/Warcraft style: chunky timber hut, tusk totems, clan banners, a cauldron fire.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "agentic-3js-builder";
import { frame } from "agentic-3js-builder";
import { aim, DEG, rng } from "agentic-3js-builder";
import { catmull } from "agentic-3js-builder";
import { mix, mottle, grain, noise, paint, resolve, smoothstep } from "agentic-3js-builder";
import type { ColorInput, Paint } from "agentic-3js-builder";
import type { Joint } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Orc War Camp",
  description:
    "A diorama of a fortified orc war camp: a hide-roofed timber hut with tusk horns and lit slit windows, a carved tusk totem and a skull totem, two clan banners, a cauldron over a stone-ringed fire, a war drum, weapon rack, palisade and camp clutter.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

type V = [number, number, number];
type Col = string | Paint;

const G = 0.2; // top of the earth base: every object stands here
const K = 0.88; // scene scale applied to everything stood on the base
const FIRE: V = [0.45 * K, G, 0.6 * K];

const C = {
  dirt: "#7b5a3a",
  dirt2: "#5d4229",
  dirtD: "#3d2a1a",
  ash: "#2b2623",
  grass: "#8d8b3f",
  grass2: "#aaa650",
  wL: "#aa7540",
  wM: "#7b4e2b",
  wD: "#4e301b",
  wK: "#2b1a10",
  hideL: "#dcb67f",
  hide: "#bb8d58",
  hideD: "#85593a",
  fur: "#3d2c23",
  furL: "#6c4b39",
  red: "#b8261f",
  redD: "#7c1713",
  redL: "#e4502e",
  ironL: "#9aa0ab",
  iron: "#5a5e69",
  ironD: "#2e3039",
  rust: "#8c4b2b",
  bone: "#ece1c4",
  boneD: "#b9a982",
  stoneL: "#a8a295",
  stone: "#86817b",
  stoneD: "#5e5a54",
  stoneK: "#3f3c39",
  rope: "#c9a76e",
  ropeD: "#8f7242",
  fire1: "#fff2ae",
  fire2: "#ffc233",
  fire3: "#ff7a1c",
  fire4: "#e03d17",
  green: "#628f38",
  greenD: "#3e6a26",
  brew: "#92e03e",
  black: "#1a1618",
  white: "#f4efe2",
  gold: "#d1a13a",
  amber: "#ffb43c",
};

export default function build() {
  const b = createBuilder({ name: "orcWarCamp", paintSize: 2048 });
  const root = b.joint("camp", { at: [0, 0, 0] });
  const rand = rng(41);

  // ------------------------------------------------------------------------------------------------------------
  // Transform stack and part collector. Everything is baked into model space and merged per object/bone/colour.
  let T = new THREE.Matrix4();
  const tv = new THREE.Vector3();
  const W = (x: number, y: number, z: number): V => {
    tv.set(x, y, z).applyMatrix4(T);
    return [tv.x, tv.y, tv.z];
  };
  const Dv = (x: number, y: number, z: number): V => {
    tv.set(x, y, z).transformDirection(T);
    return [tv.x, tv.y, tv.z];
  };
  let S = K; // current uniform scale, for sweep radii
  const area = (at: V, rot: V | number, fn: () => void, s = 1) => {
    const old = T;
    const oldS = S;
    const r: V = typeof rot === "number" ? [0, rot, 0] : rot;
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0] * DEG, r[1] * DEG, r[2] * DEG, "YXZ"));
    T = old
      .clone()
      .multiply(new THREE.Matrix4().compose(new THREE.Vector3(...at), q, new THREE.Vector3(s, s, s)));
    S = oldS * s;
    fn();
    T = old;
    S = oldS;
  };

  let grp = "camp";
  let bone: Joint = root;
  const setGroup = (name: string, joint: Joint = root) => {
    grp = name;
    bone = joint;
  };

  type Bucket = { geos: THREE.BufferGeometry[]; color: Col; bone: Joint; name: string; glow: number };
  const buckets = new Map<string, Bucket>();
  type PutOpts = { smooth?: boolean; glow?: number };

  const putM = (geo: THREE.BufferGeometry, color: Col, m: THREE.Matrix4, o: PutOpts = {}) => {
    const g = geo.index ? geo.toNonIndexed() : geo;
    g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(T, m));
    for (const k of Object.keys(g.attributes)) if (k !== "position" && k !== "normal" && k !== "uv") g.deleteAttribute(k);
    if (!o.smooth) g.computeVertexNormals();
    g.clearGroups();
    const key = `${grp}|${bone.name}|${String(color)}|${o.glow ?? 0}`;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { geos: [], color, bone, name: `${grp}.${buckets.size}`, glow: o.glow ?? 0 };
      buckets.set(key, bucket);
    }
    bucket.geos.push(g);
  };

  const mat = (at: V, rot: V = [0, 0, 0], scale: number | V = 1) =>
    new THREE.Matrix4().compose(
      new THREE.Vector3(...at),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG, "YXZ")),
      typeof scale === "number" ? new THREE.Vector3(scale, scale, scale) : new THREE.Vector3(...scale),
    );
  const put = (geo: THREE.BufferGeometry, color: Col, at: V, rot: V = [0, 0, 0], scale: number | V = 1, o?: PutOpts) =>
    putM(geo, color, mat(at, rot, scale), o);

  const box = (w: number, h: number, d: number, color: Col, at: V, rot?: V, o?: PutOpts) =>
    put(new THREE.BoxGeometry(w, h, d), color, at, rot, 1, o);
  const cyl = (rt: number, rb: number, h: number, seg: number, color: Col, at: V, rot?: V, o?: PutOpts) =>
    put(new THREE.CylinderGeometry(rt, rb, h, seg, 1), color, at, rot, 1, o);
  const cone = (r: number, h: number, seg: number, color: Col, at: V, rot?: V, o?: PutOpts) =>
    put(new THREE.ConeGeometry(r, h, seg, 1), color, at, rot, 1, o);
  const ball = (r: number, color: Col, at: V, scale: number | V = 1, o?: PutOpts, detail = 1) =>
    put(new THREE.IcosahedronGeometry(r, detail), color, at, [0, 0, 0], scale, o);
  const tube = (a: V, c: V, r0: number, r1: number, color: Col, seg = 6, o?: PutOpts) => {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...c);
    const d = vb.clone().sub(va);
    const m = new THREE.Matrix4().compose(
      va.clone().add(vb).multiplyScalar(0.5),
      aim(d),
      new THREE.Vector3(1, 1, 1),
    );
    putM(new THREE.CylinderGeometry(r1, r0, d.length(), seg, 1), color, m, o);
  };
  const shapeG = (pts: [number, number][], depth: number, bevel = 0) => {
    const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
    const g = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: bevel > 0,
      bevelSize: bevel,
      bevelThickness: bevel,
      bevelSegments: 1,
      curveSegments: 4,
    });
    g.translate(0, 0, -depth / 2);
    return g;
  };
  const poly = (pts: [number, number][], depth: number, color: Col, at: V, rot?: V, bevel = 0, o?: PutOpts) =>
    put(shapeG(pts, depth, bevel), color, at, rot, 1, o);

  const rockG = () => {
    const g = new THREE.IcosahedronGeometry(1, 0);
    const pos = g.getAttribute("position");
    const f = new Map<string, number>();
    for (let i = 0; i < pos.count; i++) {
      const k = `${pos.getX(i).toFixed(3)},${pos.getY(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`;
      let s = f.get(k);
      if (s === undefined) f.set(k, (s = 0.74 + rand() * 0.46));
      pos.setXYZ(i, pos.getX(i) * s, pos.getY(i) * s, pos.getZ(i) * s);
    }
    return g;
  };
  const rock = (at: V, sx: number, sy: number, sz: number, color: Col, yaw = rand() * 360) =>
    put(rockG(), color, at, [0, yaw, 0], [sx, sy, sz]);

  const sw = (
    pts: V[],
    radius: number | [number, number] | ((t: number) => number),
    color: Col,
    o: { sides?: number; caps?: "round" | "flat" | "point" | "none"; glow?: number; name?: string } = {},
  ) => {
    const r =
      typeof radius === "number" ? radius * S : Array.isArray(radius) ? ([radius[0] * S, radius[1] * S] as [number, number]) : radius;
    const s = b.sweep(catmull(pts.map((p) => W(...p))), r, {
      color,
      bone,
      sides: o.sides ?? 6,
      caps: o.caps ?? "round",
      group: grp,
      name: o.name,
    });
    if (o.glow) glow(s, o.glow);
    return s;
  };

  const tex = (geo: THREE.BufferGeometry, texture: THREE.Texture, m: THREE.Matrix4, glowing = 0, name?: string) => {
    geo.applyMatrix4(new THREE.Matrix4().multiplyMatrices(T, m));
    const p = b.part(geo, "#ffffff", { bone, at: [0, 0, 0], texture, group: grp, name });
    if (glowing) glow(p, glowing);
    return p;
  };
  const decal = (texture: THREE.Texture, w: number, h: number, at: V, rot: V = [0, 0, 0], glowing = 0) =>
    tex(new THREE.PlaneGeometry(w, h), texture, mat(at, rot), glowing);

  // ------------------------------------------------------------------------------------------------------------
  // Hand-painted surface library: every colour goes through `hp`, which paints in contact shadow near the ground,
  // sky light on top faces, cool underside shadow, brush noise, firelight near the fire and soot at its edge.
  const hp = (c: ColorInput): Paint =>
    paint((p, n) => {
      const [r0, g0, b0] = resolve(c, p, n);
      const h = p.y - G;
      const k =
        (0.66 + 0.34 * smoothstep(0, 0.32, h)) *
        (1 + 0.14 * smoothstep(0.2, 1, n.y) - 0.2 * smoothstep(0.2, -0.9, n.y)) *
        (0.94 + 0.12 * noise(p, 0.07, 9));
      let r = r0 * k;
      let g = g0 * k;
      let bl = b0 * k * (0.95 + 0.07 * smoothstep(0.3, -0.8, n.y));
      const dx = FIRE[0] - p.x;
      const dy = FIRE[1] + 0.12 - p.y;
      const dz = FIRE[2] - p.z;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d < 1.2) {
        const facing = Math.max(0, (n.x * dx + n.y * dy + n.z * dz) / d);
        const w = (1 - smoothstep(0.15, 1.2, d)) * (0.18 + 0.82 * facing) * 0.6;
        r += (1.0 - r) * w;
        g += (0.6 - g) * w;
        bl += (0.2 - bl) * w;
        const dd = Math.hypot(dx, dz);
        if (dd < 0.52 && h < 0.5) {
          const s = (1 - smoothstep(0.2, 0.52, dd)) * (1 - smoothstep(0.08, 0.5, h)) * 0.55;
          r += (0.07 - r) * s;
          g += (0.06 - g) * s;
          bl += (0.055 - bl) * s;
        }
      }
      return [Math.min(r, 1), Math.min(g, 1), Math.min(bl, 1)];
    });

  const woodA = hp(grain(C.wM, C.wD, { size: 0.03, axis: "y", seed: 1 }));
  const woodB = hp(grain(C.wL, C.wM, { size: 0.03, axis: "y", seed: 2 }));
  const woodC = hp(grain(C.wD, C.wK, { size: 0.03, axis: "y", seed: 3 }));
  const woodX = hp(grain(C.wM, C.wD, { size: 0.03, axis: "x", seed: 4 }));
  const woodZ = hp(grain(C.wM, C.wD, { size: 0.03, axis: "z", seed: 5 }));
  const woodLX = hp(grain(C.wL, C.wM, { size: 0.03, axis: "x", seed: 6 }));
  const woodLZ = hp(grain(C.wL, C.wM, { size: 0.03, axis: "z", seed: 7 }));
  const plankSet = [woodB, woodA, woodB, woodC, woodA];
  const palisadeSet = [
    hp(grain("#7a6650", "#4a3b2d", { size: 0.03, axis: "y", seed: 61 })),
    hp(grain("#6b5846", "#3f3228", { size: 0.03, axis: "y", seed: 62 })),
    hp(grain("#8a735a", "#54443a", { size: 0.03, axis: "y", seed: 63 })),
  ];
  const hideP = hp(mottle(C.hide, C.hideD, { size: 0.12, contrast: 1.1, seed: 11 }));
  const hideLP = hp(mottle(C.hideL, C.hide, { size: 0.1, seed: 12 }));
  const hideDP = hp(mottle(C.hideD, C.fur, { size: 0.1, seed: 13 }));
  const roofA = hp(mottle("#b3814e", "#6b4a2d", { size: 0.14, contrast: 1.25, seed: 51 }));
  const roofB = hp(mottle("#d9bc88", "#9a7048", { size: 0.12, contrast: 1.15, seed: 52 }));
  const roofC = hp(mottle("#86593a", "#4c3322", { size: 0.12, contrast: 1.25, seed: 53 }));
  const furP = hp(mottle(C.fur, C.furL, { size: 0.05, contrast: 1.2, seed: 14 }));
  const redP = hp(mottle(C.red, C.redD, { size: 0.09, seed: 15 }));
  const ironP = hp(mottle(C.iron, C.ironD, { size: 0.05, contrast: 1.2, seed: 16 }));
  const ironLP = hp(mottle(C.ironL, C.iron, { size: 0.04, seed: 17 }));
  const boneP = hp(mottle(C.bone, C.boneD, { size: 0.045, seed: 18 }));
  const rockP = hp(mottle(C.stone, C.stoneD, { size: 0.16, contrast: 1.3, seed: 19 }));
  const rockLP = hp(mottle(C.stoneL, C.stone, { size: 0.12, seed: 20 }));
  const rockDP = hp(mottle(C.stoneD, C.stoneK, { size: 0.14, seed: 21 }));
  const ropeP = hp(grain(C.rope, C.ropeD, { size: 0.012, axis: "x", seed: 22 }));
  const greenP = hp(mottle(C.green, C.greenD, { size: 0.07, seed: 23 }));
  const blackP = hp(mottle("#4b4352", "#2b2630", { size: 0.06, seed: 24 }));
  const sackP = hp(mottle("#c9ab76", "#a88a58", { size: 0.06, seed: 25 }));

  // ------------------------------------------------------------------------------------------------------------
  // Textures
  const star = (n: number, ro: number, ri: number) =>
    Array.from({ length: n * 2 }, (_, i) => {
      const a = (i * Math.PI) / n - Math.PI / 2;
      const r = i % 2 ? ri : ro;
      return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`;
    }).join(" ");

  const bannerRed = svg(
    `<svg viewBox="0 0 200 400"><defs><linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d6382a"/><stop offset="0.55" stop-color="#b3221b"/><stop offset="1" stop-color="#7e1410"/></linearGradient></defs>
<path d="M0 0H200V352L150 400L100 338L50 400L0 352Z" fill="url(#c)"/>
<path d="M0 0H200V16H0Z" fill="#5a0f0c"/>
<path d="M10 24H190V340L150 382L100 322L50 382L10 340Z" fill="none" stroke="#2a0e0c" stroke-width="6"/>
<path d="M19 30H181V334L150 366L100 308L50 366L19 334Z" fill="none" stroke="#e7c35c" stroke-width="3.5" stroke-dasharray="10 7"/>
<g transform="translate(100 140)"><polygon points="${star(12, 66, 49)}" fill="#1b1517" stroke="#e7c35c" stroke-width="4"/>
<circle r="44" fill="#8f1914" stroke="#2a0e0c" stroke-width="5"/>
<path d="M-32 -26C-38 14 -16 36 0 36C16 36 38 14 32 -26C24 6 13 21 0 21C-13 21 -24 6 -32 -26Z" fill="#efe4c6" stroke="#3a2a1a" stroke-width="3.5"/>
<path d="M-27 -10L-6 -3L-11 9Z" fill="#1a1416"/><path d="M27 -10L6 -3L11 9Z" fill="#1a1416"/>
<path d="M0 3L-5 15H5Z" fill="#1a1416"/></g>
<g stroke="#1a1416" stroke-width="9" stroke-linecap="round"><path d="M62 240L84 318"/><path d="M92 236L114 314"/><path d="M122 240L144 318"/></g>
<g stroke="#e8d9a8" stroke-width="3" stroke-linecap="round"><path d="M64 242L85 316"/><path d="M94 238L115 312"/><path d="M124 242L145 316"/></g>
</svg>`,
    { size: 512 },
  );

  const bannerDark = svg(
    `<svg viewBox="0 0 160 360"><defs><linearGradient id="d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#352d31"/><stop offset="1" stop-color="#1c1719"/></linearGradient></defs>
<path d="M0 0H160V300L120 360L80 296L40 360L0 300Z" fill="url(#d)"/>
<path d="M8 10H152V294L120 336L80 282L40 336L8 294Z" fill="none" stroke="#e8dcb8" stroke-width="3.5" stroke-dasharray="9 6"/>
<g fill="#f1e8cc" stroke="#2a2326" stroke-width="2"><path d="M8 0L20 30L32 0Z"/><path d="M36 0L48 30L60 0Z"/><path d="M64 0L76 30L88 0Z"/><path d="M92 0L104 30L116 0Z"/><path d="M120 0L132 30L144 0Z"/></g>
<g stroke="#1a1214" stroke-width="22" stroke-linecap="round"><path d="M48 80L104 226"/><path d="M86 70L142 216"/></g>
<g stroke="#d33a24" stroke-width="15" stroke-linecap="round"><path d="M46 78L102 224"/><path d="M84 68L140 214"/><path d="M14 98L62 224"/></g>
<g stroke="#ffb066" stroke-width="3.5" stroke-linecap="round"><path d="M42 76L96 218"/><path d="M80 66L134 208"/></g>
<g transform="translate(80 270)"><circle r="15" fill="#efe4c6" stroke="#1a1214" stroke-width="3"/><path d="M-9 -3L-2 0L-5 5Z" fill="#1a1214"/><path d="M9 -3L2 0L5 5Z" fill="#1a1214"/></g>
</svg>`,
    { size: 512 },
  );

  const orcFace = svg(
    `<svg viewBox="0 0 100 100"><path d="M6 30L47 42L47 51L6 41Z" fill="#1b1a12"/><path d="M94 30L53 42L53 51L94 41Z" fill="#1b1a12"/>
<ellipse cx="27" cy="52" rx="13" ry="6.5" fill="#241810"/><ellipse cx="73" cy="52" rx="13" ry="6.5" fill="#241810"/>
<path d="M43 46L57 46L63 68L37 68Z" fill="#4c7a2e" stroke="#1e3a12" stroke-width="3"/><ellipse cx="43" cy="66" rx="4" ry="2.6" fill="#15240c"/><ellipse cx="57" cy="66" rx="4" ry="2.6" fill="#15240c"/>
<path d="M12 74Q50 84 88 74L86 88Q50 98 14 88Z" fill="#2a0f0c" stroke="#150806" stroke-width="2.5"/>
<path d="M20 90L25 60L35 90Z" fill="#f1e8c8" stroke="#6b5a3a" stroke-width="2.5"/><path d="M80 90L75 60L65 90Z" fill="#f1e8c8" stroke="#6b5a3a" stroke-width="2.5"/>
<g stroke="#c9291d" stroke-width="5" stroke-linecap="round"><path d="M8 58L26 70"/><path d="M92 58L74 70"/><path d="M6 66L20 78"/><path d="M94 66L80 78"/></g>
<path d="M30 14L50 4L70 14L50 24Z" fill="#c9291d" stroke="#5a0f0c" stroke-width="3"/></svg>`,
    { size: 256 },
  );
  const boarFace = svg(
    `<svg viewBox="0 0 100 100"><path d="M8 34L46 44L46 52L8 44Z" fill="#1b1410"/><path d="M92 34L54 44L54 52L92 44Z" fill="#1b1410"/>
<ellipse cx="50" cy="72" rx="26" ry="19" fill="#d79a78" stroke="#4a2418" stroke-width="4"/>
<ellipse cx="40" cy="72" rx="5.5" ry="8" fill="#3a1a12"/><ellipse cx="60" cy="72" rx="5.5" ry="8" fill="#3a1a12"/>
<path d="M25 86Q50 96 75 86" fill="none" stroke="#3a1a12" stroke-width="4"/>
<g stroke="#f1e8c8" stroke-width="5" stroke-linecap="round"><path d="M16 56L34 62"/><path d="M84 56L66 62"/></g>
<g stroke="#1b1410" stroke-width="5" stroke-linecap="round"><path d="M48 14L50 34"/><path d="M38 18L42 36"/><path d="M62 18L58 36"/></g></svg>`,
    { size: 256 },
  );
  const ravenEye = svg(
    `<svg viewBox="0 0 100 100"><path d="M6 50Q30 30 50 44Q40 66 6 62Z" fill="#f4efe2" stroke="#1a1618" stroke-width="4"/><path d="M94 50Q70 30 50 44Q60 66 94 62Z" fill="#f4efe2" stroke="#1a1618" stroke-width="4"/><path d="M14 54L38 50L34 58Z" fill="#1a1618"/><path d="M86 54L62 50L66 58Z" fill="#1a1618"/></svg>`,
    { size: 128 },
  );
  const drumRune = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#d6b27c"/><circle cx="50" cy="50" r="44" fill="none" stroke="#7a1713" stroke-width="5"/><circle cx="50" cy="50" r="35" fill="none" stroke="#2a1a10" stroke-width="3" stroke-dasharray="7 5"/>
<polygon points="${star(8, 30, 20).replace(/(-?[\d.]+),(-?[\d.]+)/g, (_m, x, y) => `${+x + 50},${+y + 50}`)}" fill="#a81f19" stroke="#2a0e0c" stroke-width="3"/>
<circle cx="50" cy="50" r="12" fill="#1a1618"/><path d="M42 46L58 46L50 60Z" fill="#efe4c6"/></svg>`,
    { size: 256 },
  );
  const shieldEmblem = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#8a5a30"/><path d="M50 50L50 2A48 48 0 0 1 98 50Z" fill="#b8261f"/><path d="M50 50L50 98A48 48 0 0 1 2 50Z" fill="#b8261f"/><path d="M50 50L98 50A48 48 0 0 1 50 98Z" fill="#1d1a1c"/><path d="M50 50L2 50A48 48 0 0 1 50 2Z" fill="#1d1a1c"/><circle cx="50" cy="50" r="47" fill="none" stroke="#3a2412" stroke-width="4"/></svg>`,
    { size: 192 },
  );
  const hideSign = svg(
    `<svg viewBox="0 0 100 120"><path d="M6 8L50 0L94 8L100 40L92 70L98 104L50 120L8 106L2 70L8 38Z" fill="#d1a76e" stroke="#6a4424" stroke-width="4"/>
<path d="M14 16L50 10L86 16L90 40L84 70L88 98L50 110L16 98L12 70L18 40Z" fill="none" stroke="#6a4424" stroke-width="2.5" stroke-dasharray="6 5"/>
<g stroke="#7d1511" stroke-width="10" stroke-linecap="round"><path d="M28 24L44 94"/><path d="M48 22L64 92"/><path d="M68 24L82 90"/></g>
<g stroke="#d9442b" stroke-width="4" stroke-linecap="round"><path d="M27 26L42 90"/><path d="M47 24L62 88"/><path d="M67 26L80 86"/></g></svg>`,
    { size: 256 },
  );
  const grassTex = svg(
    `<svg viewBox="0 0 64 64"><path d="M6 64L10 14L16 64Z" fill="#8a8a36"/><path d="M14 64L26 4L24 64Z" fill="#a8a64e"/><path d="M22 64L38 18L32 64Z" fill="#7a7c30"/><path d="M30 64L50 8L38 64Z" fill="#b4ae58"/><path d="M38 64L58 22L46 64Z" fill="#8a8a36"/><path d="M44 64L52 30L50 64Z" fill="#a8a64e"/></svg>`,
    { size: 128 },
  );
  const tuft = svg(
    `<svg viewBox="0 0 32 32"><path d="M2 32L6 6L10 32Z" fill="#9a9a3e"/><path d="M9 32L17 1L16 32Z" fill="#b8b45a"/><path d="M16 32L28 9L22 32Z" fill="#82843a"/></svg>`,
    { size: 64 },
  );

  // ------------------------------------------------------------------------------------------------------------
  // Shared prop builders (all in the current local space)
  const skull = (at: V, s: number, yaw: number, kind: "orc" | "horned" | "small" = "orc", pitch = 0) => {
    area(
      at,
      [pitch, yaw, 0],
      () => {
        ball(0.5, boneP, [0, 0.52, 0], [1, 0.88, 1.1], undefined, 1);
        box(0.62, 0.12, 0.4, boneP, [0, 0.66, 0.34]); // brow ridge
        box(0.5, 0.22, 0.5, boneP, [0, 0.12, 0.42], [-4, 0, 0]); // upper jaw
        box(0.46, 0.13, 0.5, boneP, [0, -0.1, 0.34], [-6, 0, 0]); // lower jaw
        for (const s2 of [1, -1]) {
          ball(0.14, C.black, [s2 * 0.2, 0.46, 0.5], [1, 1.05, 0.7], undefined, 0); // eye socket
          ball(0.04, C.fire3, [s2 * 0.2, 0.46, 0.57], 1, { glow: 0 }, 0);
        }
        cone(0.07, 0.16, 3, C.black, [0, 0.24, 0.66], [180, 0, 0]); // nose hole
        for (let i = -3; i <= 3; i++) box(0.055, 0.09, 0.05, C.bone, [i * 0.065, 0.0, 0.66]);
        for (let i = -2; i <= 2; i++) box(0.055, 0.08, 0.05, C.bone, [i * 0.07, -0.01, 0.6], [0, 0, 0]);
        if (kind === "orc") {
          for (const s2 of [1, -1]) {
            tube([s2 * 0.22, -0.05, 0.66], [s2 * 0.3, 0.24, 0.8], 0.06, 0.012, C.bone, 5);
          }
          box(0.12, 0.2, 0.1, boneP, [0, 0.9, 0.16], [30, 0, 0]); // sagittal crest
        } else if (kind === "horned") {
          for (const s2 of [1, -1]) {
            tube([s2 * 0.42, 0.72, 0.0], [s2 * 0.78, 0.82, -0.05], 0.1, 0.07, boneP, 6);
            tube([s2 * 0.78, 0.82, -0.05], [s2 * 0.98, 1.2, 0.05], 0.07, 0.015, boneP, 6);
          }
        }
      },
      s,
    );
  };

  const torch = (x: number, z: number, h: number, yaw = 0) => {
    area([x, 0, z], yaw, () => {
      setGroup("torch");
      tube([0, -0.02, 0], [0, h, 0], 0.03, 0.026, woodA, 6);
      cyl(0.075, 0.045, 0.1, 7, ironP, [0, h + 0.04, 0]);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        cone(0.014, 0.06, 4, ironLP, [Math.cos(a) * 0.075, h + 0.11, Math.sin(a) * 0.075]);
      }
      cyl(0.082, 0.082, 0.02, 7, C.ironD, [0, h + 0.075, 0]);
      cyl(0.04, 0.04, 0.05, 6, ropeP, [0, h - 0.3, 0]);
      cyl(0.04, 0.04, 0.05, 6, ropeP, [0, h - 0.45, 0]);
      const fl = (p: V, tip: V, r: number, color: string, g: number) =>
        sw([p, [p[0] * 0.4 + tip[0] * 0.6 + 0.01, (p[1] + tip[1]) / 2, p[2] * 0.4 + tip[2] * 0.6], tip], [r, 0.002], color, {
          sides: 5,
          caps: "point",
          glow: g,
        });
      fl([0, h + 0.09, 0], [0.02, h + 0.32, 0.01], 0.055, C.fire3, 1.3);
      fl([0.03, h + 0.09, 0.01], [0.06, h + 0.26, 0.02], 0.04, C.fire2, 1.4);
      fl([-0.03, h + 0.09, -0.01], [-0.05, h + 0.24, 0], 0.04, C.fire2, 1.4);
      fl([0, h + 0.09, 0], [0.0, h + 0.22, 0.01], 0.03, C.fire1, 1.5);
    });
  };

  const crossedBones = (at: V, yaw: number, len: number) => {
    area(at, [0, yaw, 0], () => {
      for (const s2 of [1, -1]) {
        const a: V = [-s2 * len, -len * 0.25, 0];
        const c: V = [s2 * len, len * 0.25, 0];
        tube(a, c, 0.025, 0.025, boneP, 6);
        for (const e of [a, c]) for (const dz of [0.02, -0.02]) ball(0.03, boneP, [e[0], e[1], dz], 1, undefined, 0);
      }
    });
  };

  const cloth = (w: number, h: number, amp: number, phase: number) => {
    const g = new THREE.PlaneGeometry(w, h, 5, 10);
    const pos = g.getAttribute("position");
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const k = (h / 2 - y) / h;
      pos.setZ(i, amp * k * Math.sin(k * 5.2 + phase + x * 4.5));
      pos.setX(i, x * (1 - 0.05 * k));
    }
    g.computeVertexNormals();
    return g;
  };
  const backFace = (g: THREE.BufferGeometry, dz: number) => {
    const c = g.clone();
    const idx = c.getIndex()!;
    for (let i = 0; i < idx.count; i += 3) {
      const t = idx.getX(i + 1);
      idx.setX(i + 1, idx.getX(i + 2));
      idx.setX(i + 2, t);
    }
    const uv = c.getAttribute("uv");
    for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i));
    const nrm = c.getAttribute("normal");
    for (let i = 0; i < nrm.count; i++) nrm.setXYZ(i, -nrm.getX(i), -nrm.getY(i), -nrm.getZ(i));
    c.translate(0, 0, dz);
    return c;
  };

  // ------------------------------------------------------------------------------------------------------------
  // 1. Earth base
  setGroup("base");
  const RB = 1.5;
  const outline: [number, number][] = Array.from({ length: 22 }, (_, i) => {
    const a = (i / 22) * Math.PI * 2;
    const r = RB * (0.97 + 0.035 * Math.sin(a * 3 + 1) + 0.025 * Math.sin(a * 5) + (rand() - 0.5) * 0.04);
    return [Math.cos(a) * r, Math.sin(a) * r];
  });
  const groundMottle = mottle(C.dirt, C.dirt2, { size: 0.2, contrast: 1.2, seed: 3 });
  const groundP = paint((p, n) => {
    if (n.y < 0.55) {
      const lip = smoothstep(G - 0.055, G - 0.02, p.y);
      return mix(mix(C.stoneD, C.dirt2, smoothstep(0.07, 0.13, p.y)), C.dirtD, lip * 0.6);
    }
    let c = resolve(groundMottle, p, n);
    const rr = Math.hypot(p.x, p.z);
    const g = noise(p, 0.38, 5) + smoothstep(0.85, 1.4, rr) * 0.3;
    c = mix(c, noise(p, 0.05, 8) > 0.5 ? C.grass : C.grass2, smoothstep(0.55, 0.72, g) * 0.9);
    const d = Math.hypot(p.x - FIRE[0], p.z - FIRE[2]);
    const ax = -0.4 * K;
    const az = 0.32 * K;
    const sx = FIRE[0] - ax;
    const sz = FIRE[2] - az;
    const u = Math.min(Math.max(((p.x - ax) * sx + (p.z - az) * sz) / (sx * sx + sz * sz), 0), 1);
    const pd = Math.hypot(p.x - (ax + sx * u), p.z - (az + sz * u));
    c = mix(c, [0.31, 0.22, 0.14], (1 - smoothstep(0.05, 0.14, pd)) * 0.8);
    c = mix(c, [0.9, 0.5, 0.2], (1 - smoothstep(0.3, 1.0, d)) * 0.2);
    c = mix(c, C.ash, (1 - smoothstep(0.22, 0.52, d)) * 0.88);
    c = mix(c, [0.16, 0.12, 0.09], (1 - smoothstep(0.3, 0.75, d)) * 0.35 * noise(p, 0.1, 2));
    const ao = 1 - 0.18 * smoothstep(RB - 0.22, RB, rr);
    return [c[0] * ao, c[1] * ao, c[2] * ao];
  });
  const baseG = shapeG(outline, 0.12);
  baseG.translate(0, 0, 0.06);
  baseG.rotateX(-Math.PI / 2);
  put(baseG, groundP, [0, 0.08, 0]);
  const plinthG = shapeG(outline.map(([x, y]) => [x * 0.94, y * 0.94] as [number, number]), 0.08);
  plinthG.translate(0, 0, 0.04);
  plinthG.rotateX(-Math.PI / 2);
  put(plinthG, rockDP, [0, 0, 0]);
  // rim rocks
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2 + rand() * 0.1;
    const r = RB * 0.99 + rand() * 0.04;
    const s = 0.075 + rand() * 0.06;
    rock([Math.cos(a) * r, 0.1 + s * 0.35, Math.sin(a) * r], s * 1.2, s * 0.9, s * 1.1, rand() > 0.55 ? rockP : rockLP);
  }
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + 0.2;
    const r = RB * 0.97;
    const s = 0.05 + rand() * 0.03;
    rock([Math.cos(a) * r, G + s * 0.25, Math.sin(a) * r], s * 1.3, s * 0.8, s, rockLP);
  }
  T = new THREE.Matrix4().makeTranslation(0, G, 0).multiply(new THREE.Matrix4().makeScale(K, K, K));

  // pebbles and dust scatter
  setGroup("pebbles");
  for (let i = 0; i < 46; i++) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * (RB - 0.12);
    const s = 0.012 + rand() * 0.018;
    rock([Math.cos(a) * r, s * 0.2, Math.sin(a) * r], s * 1.4, s * 0.7, s, rand() > 0.5 ? rockP : rockDP);
  }
  // stepping stones door -> fire
  for (const [x, z, s] of [
    [-0.42, 0.3, 0.1],
    [-0.28, 0.4, 0.09],
    [-0.12, 0.47, 0.085],
    [0.03, 0.53, 0.08],
  ] as [number, number, number][]) {
    rock([x, 0.005, z], s * 1.3, s * 0.18, s, rockLP);
  }

  // ------------------------------------------------------------------------------------------------------------
  // 2. Palisade at the back
  setGroup("palisade");
  {
    const N = 27;
    const R = 1.52;
    const stakes: { at: V; top: V; inner: V; h: number }[] = [];
    for (let k = 0; k < N; k++) {
      const th = (102 + (k / (N - 1)) * 158) * DEG;
      const r = R + (rand() - 0.5) * 0.05;
      const h = 0.5 + rand() * 0.34 + (k % 5 === 2 ? 0.1 : 0);
      const rad = 0.068 + rand() * 0.016;
      const x = Math.sin(th) * r;
      const z = Math.cos(th) * r;
      const lean: V = [(rand() - 0.5) * 6, 0, (rand() - 0.5) * 6];
      const paintK = palisadeSet[k % 3];
      area([x, -0.03, z], [lean[0], th / DEG + 90, lean[2]], () => {
        cyl(rad * 0.94, rad, h, 7, paintK, [0, h / 2, 0]);
        cone(rad * 0.94, 0.17, 7, palisadeSet[(k + 1) % 3], [0, h + 0.085, 0]);
        // charred tip band
        cyl(rad * 0.97, rad * 0.97, 0.03, 7, C.wK, [0, h - 0.015, 0]);
        if (k % 3 === 1) cyl(rad * 1.12, rad * 1.12, 0.04, 7, ropeP, [0, h * 0.62, 0]);
      });
      stakes.push({ at: [x, 0, z], top: [x, h, z], inner: [Math.sin(th) * (r - 0.1), 0, Math.cos(th) * (r - 0.1)], h });
    }
    for (let k = 0; k < N - 1; k++) {
      for (const y of [0.14, 0.36]) {
        const a = stakes[k].inner;
        const c = stakes[k + 1].inner;
        tube([a[0], y, a[2]], [c[0], y + 0.015, c[2]], 0.026, 0.026, woodC, 5);
      }
    }
    for (const k of [3, 9, 15, 21]) {
      const s = stakes[k];
      area([s.at[0], s.h + 0.17, s.at[2]], Math.atan2(s.at[0], s.at[2]) / DEG, () => skull([0, 0, 0], 0.17, 0, k % 2 ? "orc" : "small"), 1);
    }
    // pennants on a few stakes
    for (const k of [6, 13, 19]) {
      const s = stakes[k];
      const th = Math.atan2(s.at[0], s.at[2]) / DEG;
      area([s.at[0], s.h - 0.2, s.at[2]], th, () => {
        poly([[0, 0], [0.2, -0.05], [0.14, -0.1], [0.2, -0.16], [0, -0.16]], 0.012, k === 13 ? C.black : C.red, [-0.0, 0, 0.1], [0, 90, 0]);
      });
    }
  }

  // ------------------------------------------------------------------------------------------------------------
  // 3. Hut
  const HW = 0.57;
  const HD = 0.45;
  const WH = 0.78;
  const RH = 1.34;
  const OV = 0.14;
  const hutYaw = 12;
  const hutAt: V = [-0.55, 0, -0.5];
  const doorTop: V = [0, 0.7, HD + 0.075];
  let doorHinge!: Joint;
  area(hutAt, hutYaw, () => {
    doorHinge = b.joint("doorFlap", {
      parent: root,
      at: W(...doorTop),
      dir: [0, -1, 0],
      up: Dv(0, 0, 1),
      role: "hinge",
    });
    setGroup("hut.frame");
    // stone footing
    for (let i = 0; i < 40; i++) {
      const u = i / 40;
      const per = 2 * (2 * HW + 2 * HD);
      let d = u * per;
      let x: number;
      let z: number;
      if (d < 2 * HW) { x = -HW + d; z = HD; }
      else if ((d -= 2 * HW) < 2 * HD) { x = HW; z = HD - d; }
      else if ((d -= 2 * HD) < 2 * HW) { x = HW - d; z = -HD; }
      else { d -= 2 * HW; x = -HW; z = -HD + d; }
      if (z > HD - 0.01 && Math.abs(x) < 0.3) continue;
      const s = 0.07 + rand() * 0.035;
      rock([x * 1.02 + (rand() - 0.5) * 0.02, s * 0.4, z * 1.02 + (rand() - 0.5) * 0.02], s * 1.5, s * 0.85, s * 1.2, rand() > 0.5 ? rockP : rockLP);
    }
    // corner posts
    for (const sx of [1, -1])
      for (const sz of [1, -1]) {
        tube([sx * (HW + 0.005), 0, sz * (HD + 0.005)], [sx * (HW + 0.005), 1.0, sz * (HD + 0.005)], 0.062, 0.055, woodB, 7);
        cone(0.058, 0.13, 7, boneP, [sx * (HW + 0.005), 1.06, sz * (HD + 0.005)]);
        cyl(0.07, 0.07, 0.04, 7, ropeP, [sx * (HW + 0.005), 0.5, sz * (HD + 0.005)]);
        cyl(0.07, 0.07, 0.04, 7, ropeP, [sx * (HW + 0.005), 0.86, sz * (HD + 0.005)]);
      }
    // planks
    const planks = (name: string, axis: "x" | "z", len: number, pos: number, skip?: (u: number) => boolean) => {
      setGroup(name);
      const n = Math.round(len / 0.1);
      const w = len / n;
      for (let i = 0; i < n; i++) {
        const u = -len / 2 + (i + 0.5) * w;
        if (skip?.(u)) continue;
        const h = WH - 0.08 + (rand() - 0.5) * 0.06;
        const pk = plankSet[Math.floor(rand() * plankSet.length)];
        const jit = (rand() - 0.5) * 0.012;
        if (axis === "x") box(w * 0.94, h, 0.06, pk, [u, 0.08 + h / 2, pos + jit], [0, 0, (rand() - 0.5) * 2]);
        else box(0.06, h, w * 0.94, pk, [pos + jit, 0.08 + h / 2, u], [0, 0, (rand() - 0.5) * 2]);
      }
    };
    planks("hut.front", "x", 2 * HW - 0.1, HD, (u) => Math.abs(u) < 0.25);
    planks("hut.back", "x", 2 * HW - 0.1, -HD);
    planks("hut.left", "z", 2 * HD - 0.1, HW);
    planks("hut.right", "z", 2 * HD - 0.1, -HW);
    // bands + studs
    setGroup("hut.trim");
    for (const y of [0.24, 0.56]) {
      for (const sz of [1, -1]) {
        for (const [x0, x1] of sz > 0 ? [[-HW, -0.25], [0.25, HW]] : [[-HW, HW]])
          box(x1 - x0, 0.026, 0.016, ropeP, [(x0 + x1) / 2, y, sz * (HD + 0.036)]);
      }
      for (const sx of [1, -1]) box(0.016, 0.026, 2 * HD, ropeP, [sx * (HW + 0.036), y, 0]);
    }
    for (const y of [0.24, 0.56])
      for (let i = 0; i < 9; i++) {
        const x = -HW + 0.08 + i * 0.125;
        if (Math.abs(x) < 0.3) continue;
        ball(0.016, ironLP, [x, y, HD + 0.046], 1, undefined, 0);
        ball(0.016, ironLP, [x, y, -HD - 0.046], 1, undefined, 0);
      }
    // door frame
    setGroup("hut.door");
    for (const sx of [1, -1]) {
      tube([sx * 0.255, 0, HD + 0.02], [sx * 0.255, 0.74, HD + 0.02], 0.04, 0.04, woodB, 6);
      box(0.03, 0.62, 0.06, woodC, [sx * 0.235, 0.35, HD - 0.02]);
      for (let i = 0; i < 4; i++) ball(0.014, ironLP, [sx * 0.255, 0.12 + i * 0.17, HD + 0.06], 1, undefined, 0);
    }
    box(0.62, 0.075, 0.09, woodB, [0, 0.755, HD + 0.02]);
    box(0.64, 0.025, 0.1, ironP, [0, 0.8, HD + 0.02]);
    box(0.5, 0.66, 0.05, C.black, [0, 0.36, HD - 0.1]); // dark interior
    box(0.44, 0.012, 0.3, redP, [0, 0.005, HD - 0.02]); // rug
    // flap on the hinge
    setGroup("hut.flap", doorHinge);
    box(0.52, 0.62, 0.028, hideP, [0, 0.7 - 0.33, HD + 0.085]);
    box(0.52, 0.035, 0.034, hideDP, [0, 0.7 - 0.02, HD + 0.088]);
    for (const dx of [-0.2, -0.07, 0.07, 0.2]) {
      cyl(0.012, 0.012, 0.05, 5, boneP, [dx, 0.7 - 0.04, HD + 0.115], [90, 0, 0]);
    }
    tube([-0.22, 0.7 - 0.17, HD + 0.102], [0.22, 0.7 - 0.17, HD + 0.102], 0.008, 0.008, ropeP, 4);
    tube([-0.22, 0.7 - 0.42, HD + 0.102], [0.22, 0.7 - 0.42, HD + 0.102], 0.008, 0.008, ropeP, 4);
    for (let i = 0; i < 6; i++) {
      const x = -0.2 + i * 0.08;
      tube([x, 0.7 - 0.17, HD + 0.102], [x + 0.04, 0.7 - 0.42, HD + 0.102], 0.006, 0.006, ropeP, 4);
    }
    poly(
      [[-0.02, 0], [0.02, 0], [0.03, -0.1], [0, -0.14], [-0.03, -0.1]],
      0.01,
      C.red,
      [0.14, 0.7 - 0.47, HD + 0.1],
    );
    decal(hideSign, 0.2, 0.24, [0, 0.7 - 0.31, HD + 0.103]);
    ring3(0, 0.7 - 0.55, HD + 0.112);

    function ring3(x: number, y: number, z: number) {
      put(new THREE.TorusGeometry(0.03, 0.007, 4, 8), ironLP, [x, y, z]);
    }

    // steps
    setGroup("hut.steps");
    box(0.56, 0.05, 0.2, rockLP, [0, 0.0, HD + 0.16]);
    box(0.44, 0.045, 0.14, rockP, [0, 0.0, HD + 0.3]);
    for (const sx of [1, -1]) rock([sx * 0.3, 0.02, HD + 0.24], 0.07, 0.045, 0.06, rockP);

    // gable infill planks
    setGroup("hut.gable");
    const roofY = (x: number) => RH - 0.04 - ((RH - WH) / (HW + OV)) * 0.95 * Math.abs(x) - 0.02;
    for (const sz of [1, -1]) {
      const n = 11;
      for (let i = 0; i < n; i++) {
        const x = -HW + 0.055 + i * ((2 * HW - 0.11) / (n - 1));
        const top = roofY(x);
        const h = top - WH + 0.04;
        if (h < 0.05) continue;
        box(0.108, h, 0.055, plankSet[i % 5], [x, WH - 0.04 + h / 2, sz * (HD + 0.0)], [0, 0, (rand() - 0.5) * 2]);
      }
      box(2 * HW + 0.1, 0.05, 0.08, woodC, [0, WH - 0.04, sz * (HD + 0.03)]);
    }

    // roof
    setGroup("hut.roof");
    const dy = RH - WH + 0.02;
    const dx = HW + OV;
    const slopeLen = Math.hypot(dx, dy);
    const ang = Math.atan2(dy, dx) / DEG;
    const nz = 3;
    const rd = 2 * (HD + OV);
    for (const s2 of [1, -1]) {
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < nz; c++) {
          const u = (r + 0.5) / 2;
          const along = (r + 0.5) * (slopeLen / 2);
          const px = s2 * dx * (1 - u);
          const py = WH - 0.02 + dy * u;
          const off = r === 1 ? 0.012 : 0;
          const nx = Math.sin(ang * DEG) * s2;
          const ny = Math.cos(ang * DEG);
          const pk = [roofA, roofB, roofC][(r * 2 + c + (s2 > 0 ? 0 : 1)) % 3];
          void along;
          box(slopeLen / 2 + 0.03, 0.05, rd / nz + 0.02, pk, [px + nx * (0.03 + off), py + ny * (0.03 + off), -rd / 2 + (c + 0.5) * (rd / nz)], [0, 0, -s2 * ang]);
        }
      }
      // stitched seams
      for (let c = 1; c < nz; c++) {
        const z = -rd / 2 + c * (rd / nz);
        tube([s2 * dx, WH - 0.02 + 0.07, z], [0, RH + 0.07, z], 0.008, 0.008, ropeP, 4);
        const nSt = 10;
        for (let i = 0; i < nSt; i++) {
          const u = (i + 0.5) / nSt;
          const px2 = s2 * dx * (1 - u);
          const py2 = WH - 0.02 + dy * u + 0.075;
          box(0.012, 0.012, 0.05, ropeP, [px2, py2, z], [0, 0, -s2 * ang]);
        }
      }
      // eave fascia
      box(0.05, 0.05, rd + 0.04, woodC, [s2 * (dx + 0.01), WH - 0.03, 0], [0, 0, -s2 * ang]);
      for (let i = 0; i < 13; i++) {
        const z = -rd / 2 + (i + 0.5) * (rd / 13);
        cone(0.03, 0.1, 4, i % 2 ? furP : hideDP, [s2 * (dx + 0.03), WH - 0.1, z], [180, 0, 0]);
      }
      // purlin ends poking out front/back
      for (const u of [0.22, 0.52, 0.82]) {
        const px = s2 * dx * (1 - u);
        const py = WH - 0.02 + dy * u - 0.01;
        tube([px, py, -HD - OV - 0.09], [px, py, HD + OV + 0.1], 0.026, 0.026, woodB, 6);
        cyl(0.02, 0.02, 0.012, 6, C.wL, [px, py, HD + OV + 0.105], [90, 0, 0]);
      }
    }
    // ridge
    tube([0, RH + 0.04, -HD - OV - 0.1], [0, RH + 0.04, HD + OV + 0.12], 0.05, 0.05, woodB, 7);
    box(0.16, 0.04, rd + 0.1, furP, [0, RH + 0.03, 0]);
    for (let i = 0; i < 7; i++) cone(0.026, 0.12, 5, boneP, [0, RH + 0.12, -HD - OV + 0.1 + i * 0.17]);
    // tusk horns at the ridge front
    for (const s2 of [1, -1]) {
      sw(
        [
          [s2 * 0.03, RH + 0.04, HD + OV + 0.04],
          [s2 * 0.15, RH + 0.06, HD + OV + 0.17],
          [s2 * 0.27, RH + 0.22, HD + OV + 0.2],
          [s2 * 0.3, RH + 0.45, HD + OV + 0.14],
        ],
        [0.05, 0.005],
        boneP,
        { sides: 6, caps: "point" },
      );
      cyl(0.06, 0.06, 0.04, 7, ironP, [s2 * 0.06, RH + 0.045, HD + OV + 0.07], [90, s2 * 20, 0]);
      // back horns, shorter
      sw(
        [
          [s2 * 0.03, RH + 0.04, -HD - OV - 0.04],
          [s2 * 0.12, RH + 0.08, -HD - OV - 0.14],
          [s2 * 0.2, RH + 0.26, -HD - OV - 0.14],
        ],
        [0.04, 0.005],
        boneP,
        { sides: 6, caps: "point" },
      );
    }
    // skull + crossed bones over the door
    setGroup("hut.skull");
    crossedBones([0, 0.98, HD + 0.06], 0, 0.13);
    skull([0, 0.88, HD + 0.075], 0.21, 0, "horned");
    skull([0, 1.08, -HD - 0.075], 0.15, 180, "small");
    decal(hideSign, 0.2, 0.24, [0, 0.9, -HD - 0.05], [0, 180, 0]);
    // iron plate with studs on the gable
    setGroup("hut.trim");
    for (const sx of [1, -1]) {
      poly([[0, 0], [0.1, 0.05], [0.1, 0.16], [0, 0.2], [-0.02, 0.1]], 0.014, ironP, [sx * 0.34, 0.82, HD + 0.04], [0, sx > 0 ? 0 : 180, 0], 0.004);
    }
    // pelt on the front wall (left of the door)
    setGroup("hut.pelt");
    const pelt: [number, number][] = [
      [-0.04, 0], [0.05, 0.02], [0.1, -0.05], [0.12, -0.18], [0.09, -0.3], [0.1, -0.4], [0.05, -0.38], [0.04, -0.26],
      [0, -0.3], [-0.05, -0.26], [-0.06, -0.4], [-0.11, -0.4], [-0.1, -0.3], [-0.12, -0.18], [-0.1, -0.05],
    ];
    poly(pelt, 0.012, furP, [-0.4, 0.72, HD + 0.06], [0, 0, 0], 0.003);
    poly(pelt, 0.012, hideDP, [HW + 0.05, 0.72, -0.22], [0, 90, 0], 0.003);
    poly(pelt, 0.012, furP, [-HW - 0.05, 0.72, 0.22], [0, -90, 0], 0.003);
    for (const [px, pz, ry] of [[HW + 0.05, -0.22, 90], [-HW - 0.05, 0.22, -90]] as [number, number, number][])
      tube([px, 0.74, pz - 0.1 * Math.sign(ry)], [px, 0.74, pz + 0.1 * Math.sign(ry)], 0.012, 0.012, woodC, 5);
    tube([-0.5, 0.74, HD + 0.062], [-0.3, 0.74, HD + 0.062], 0.012, 0.012, woodC, 5);
    // window slits (lit)
    setGroup("hut.windows");
    for (const [wx, wy, wz, ry] of [
      [HW + 0.03, 0.5, 0.05, 90],
      [-HW - 0.03, 0.5, -0.1, -90],
      [0.4, 0.5, HD + 0.03, 0],
    ] as [number, number, number, number][]) {
      area([wx, wy, wz], ry, () => {
        box(0.2, 0.26, 0.03, C.ironD, [0, 0, 0]);
        box(0.15, 0.2, 0.02, C.amber, [0, 0, 0.012], [0, 0, 0], { glow: 1.2 });
        for (const bx of [-0.05, 0.0, 0.05]) box(0.014, 0.2, 0.026, C.ironD, [bx, 0, 0.02]);
        box(0.2, 0.014, 0.026, C.ironD, [0, 0, 0.02]);
        box(0.24, 0.025, 0.05, woodC, [0, 0.14, 0.01]);
        cone(0.02, 0.08, 4, boneP, [0.1, 0.2, 0.02]);
        cone(0.02, 0.08, 4, boneP, [-0.1, 0.2, 0.02]);
      });
    }
    // hanging trophies under the front eave
    setGroup("hut.trophies");
    for (const sx of [1, -1]) {
      const x0 = sx * 0.62;
      tube([x0, WH - 0.05, HD + OV - 0.04], [x0, 0.5, HD + OV - 0.04], 0.006, 0.006, ropeP, 4);
      skull([x0, 0.43, HD + OV - 0.04], 0.07, sx * 20, "small");
      for (let i = 0; i < 3; i++) tube([x0, 0.66 - i * 0.05, HD + OV - 0.04], [x0 + 0.045 * (i % 2 ? 1 : -1), 0.63 - i * 0.05, HD + OV - 0.04], 0.01, 0.007, boneP, 4);
    }
  });
  // door opens a little (pose after the flap is built)
  b.pose(doorHinge, { axis: [1, 0, 0], deg: -22 });

  // torches by the hut steps
  torch(-0.98, 0.2, 0.92);
  torch(1.35, 0.3, 0.82);

  // ------------------------------------------------------------------------------------------------------------
  // 4. Big tusk totem
  area([1.15, 0, -0.5], -24, () => {
    setGroup("totem");
    // stone footing
    box(0.56, 0.1, 0.56, rockDP, [0, 0.05, 0], [0, 8, 0]);
    box(0.44, 0.09, 0.44, rockP, [0, 0.14, 0], [0, -6, 0]);
    for (const [x, z, s] of [[0.28, 0.2, 0.1], [-0.27, 0.22, 0.09], [0.1, -0.3, 0.11], [-0.24, -0.2, 0.08]] as [number, number, number][])
      rock([x, s * 0.35, z], s * 1.2, s, s, rockLP);
    const y0 = 0.18;
    tube([0, y0, 0], [0, 2.12, 0], 0.12, 0.11, woodA, 8);
    // --- boar block
    const blk = (y: number, h: number, w: number, color: Col) => {
      box(w, h, w * 0.92, color, [0, y + h / 2, 0]);
      box(w + 0.03, 0.035, w * 0.92 + 0.03, woodC, [0, y + 0.0, 0]);
      box(w + 0.03, 0.035, w * 0.92 + 0.03, woodC, [0, y + h, 0]);
    };
    blk(y0, 0.46, 0.36, hp(mottle("#8a3a26", "#5e2418", { size: 0.06, seed: 31 })));
    box(0.2, 0.16, 0.16, hp(mottle("#d79a78", "#b87a5a", { size: 0.05, seed: 32 })), [0, y0 + 0.15, 0.24]);
    decal(boarFace, 0.32, 0.32, [0, y0 + 0.27, 0.173]);
    for (const s2 of [1, -1]) {
      sw(
        [
          [s2 * 0.07, y0 + 0.1, 0.3],
          [s2 * 0.16, y0 + 0.08, 0.34],
          [s2 * 0.24, y0 + 0.2, 0.32],
          [s2 * 0.26, y0 + 0.36, 0.26],
        ],
        [0.032, 0.004],
        boneP,
        { sides: 5, caps: "point" },
      );
      cone(0.07, 0.15, 4, redP, [s2 * 0.19, y0 + 0.5, 0.0], [0, 0, -s2 * 20]); // ears
      ball(0.026, C.amber, [s2 * 0.1, y0 + 0.31, 0.19], 1, { glow: 1.6 }, 0);
    }
    // --- orc face block
    const y1 = y0 + 0.5;
    blk(y1, 0.5, 0.38, greenP);
    decal(orcFace, 0.34, 0.34, [0, y1 + 0.2, 0.178]);
    box(0.4, 0.07, 0.1, greenP, [0, y1 + 0.34, 0.16], [-10, 0, 0]);
    for (const s2 of [1, -1]) {
      ball(0.03, C.amber, [s2 * 0.09, y1 + 0.27, 0.2], [1.3, 0.7, 0.8], { glow: 1.8 }, 0);
      tube([s2 * 0.19, y1 + 0.23, 0.02], [s2 * 0.3, y1 + 0.2, 0.0], 0.04, 0.03, greenP, 5); // ears
      cone(0.05, 0.12, 4, greenP, [s2 * 0.33, y1 + 0.2, -0.01], [0, 0, -s2 * 90]);
      for (let i = 0; i < 3; i++) ball(0.016, C.gold, [s2 * 0.3, y1 + 0.13 - i * 0.03, 0.03], 1, undefined, 0);
    }
    // feather headdress behind/above the orc face
    const feather = (len: number, w: number): [number, number][] => [
      [0, 0], [w * 0.8, len * 0.2], [w, len * 0.55], [w * 0.55, len * 0.9], [0, len], [-w * 0.55, len * 0.9], [-w, len * 0.55], [-w * 0.8, len * 0.2],
    ];
    for (let k = 0; k < 9; k++) {
      const a = -70 + k * 17.5;
      const col = [C.red, C.white, C.black, C.red, C.white][k % 5];
      area([0, y1 + 0.5, -0.04], [0, 0, a], () => poly(feather(0.3 - Math.abs(a) * 0.0012, 0.04), 0.008, col, [0, 0.0, 0.0 + (k % 2) * 0.012], undefined, 0.002));
    }
    // --- wings block
    const y2 = y1 + 0.54;
    blk(y2, 0.3, 0.3, hp(mottle("#2e2528", "#1a1618", { size: 0.05, seed: 33 })));
    for (const s2 of [1, -1]) {
      const rows: [number, number, number, Col][] = [
        [0.16, 0.05, 5, C.red],
        [0.27, 0.055, 5, C.white],
        [0.4, 0.06, 5, C.black],
        [0.52, 0.06, 5, C.red],
      ];
      rows.forEach(([len, w, n, col], ri) => {
        for (let k = 0; k < n; k++) {
          const phi = (-6 - k * (68 / (n - 1)) - ri * 2) * DEG;
          const psi = Math.atan2(Math.sin(phi), s2 * Math.cos(phi));
          area([s2 * 0.12, y2 + 0.22 - ri * 0.003, 0.055 + ri * 0.011], [0, 0, psi / DEG - 90], () =>
            poly(feather(len, w), 0.008, ri % 2 ? col : col, [0, 0, 0], undefined, 0.002),
          );
        }
      });
      // wing bone arm
      tube([s2 * 0.1, y2 + 0.24, 0.04], [s2 * 0.5, y2 + 0.25, 0.04], 0.026, 0.02, woodC, 5);
      ball(0.03, boneP, [s2 * 0.52, y2 + 0.25, 0.04], 1, undefined, 0);
    }
    // --- raven head block
    const y3 = y2 + 0.34;
    blk(y3, 0.34, 0.3, blackP);
    decal(ravenEye, 0.3, 0.2, [0, y3 + 0.22, 0.14]);
    sw(
      [
        [0, y3 + 0.2, 0.14],
        [0, y3 + 0.2, 0.3],
        [0, y3 + 0.14, 0.4],
        [0, y3 + 0.05, 0.42],
      ],
      [0.075, 0.008],
      hp(mottle("#e0b348", "#b88a2c", { size: 0.04, seed: 34 })),
      { sides: 5, caps: "point" },
    );
    for (const s2 of [1, -1]) {
      ball(0.025, C.amber, [s2 * 0.09, y3 + 0.24, 0.17], 1, { glow: 1.8 }, 0);
      sw([[s2 * 0.1, y3 + 0.34, 0], [s2 * 0.22, y3 + 0.52, -0.03], [s2 * 0.32, y3 + 0.66, 0.02]], [0.04, 0.006], boneP, { sides: 5, caps: "point" });
    }
    cone(0.05, 0.4, 5, ironLP, [0, y3 + 0.54, 0]);
    cyl(0.07, 0.07, 0.03, 6, ropeP, [0, y3 + 0.36, 0]);
    // rope + spiked bands between blocks
    for (const y of [y0 + 0.48, y1 + 0.52, y2 + 0.32]) {
      cyl(0.145, 0.145, 0.04, 8, ropeP, [0, y, 0]);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + 0.3;
        cone(0.022, 0.1, 4, ironP, [Math.sin(a) * 0.19, y + 0.005, Math.cos(a) * 0.19], [Math.cos(a) * 90, 0, -Math.sin(a) * 90]);
      }
    }
    // hanging skulls/bones on chains from wings
    for (const s2 of [1, -1]) {
      tube([s2 * 0.38, y2 + 0.24, 0.07], [s2 * 0.38, y2 - 0.02, 0.07], 0.007, 0.007, C.ironD, 4);
      skull([s2 * 0.38, y2 - 0.1, 0.08], 0.1, s2 * 15, "small");
    }
    // war-paint banner strip hanging from the front
    setGroup("totem.cloth");
    poly([[0, 0], [0.18, 0], [0.18, -0.34], [0.09, -0.26], [0, -0.34]], 0.01, redP, [-0.09, y0 + 0.86, 0.2], undefined, 0.002);
  }, 0.85);

  // ------------------------------------------------------------------------------------------------------------
  // 5. Skull totem
  area([-1.05, 0, 1.0], 22, () => {
    setGroup("skullTotem");
    for (const [x, z, s] of [[0.12, 0.1, 0.1], [-0.12, 0.08, 0.09], [0.0, -0.14, 0.1], [-0.1, -0.1, 0.07], [0.15, -0.08, 0.07]] as [number, number, number][])
      rock([x, s * 0.4, z], s * 1.3, s, s * 1.1, rand() > 0.5 ? rockP : rockLP);
    tube([0, 0, 0], [0, 1.08, 0], 0.052, 0.042, woodC, 6);
    for (const s2 of [1, -1]) {
      tube([s2 * 0.2, 0.0, -0.05], [s2 * 0.02, 0.32, 0], 0.025, 0.02, woodA, 5);
    }
    cyl(0.06, 0.06, 0.05, 6, ropeP, [0, 0.32, 0]);
    // stacked skulls
    skull([0, 0.36, 0.0], 0.15, 0, "orc", -4);
    skull([0, 0.6, 0.0], 0.13, 8, "orc", -4);
    skull([0, 0.92, 0.0], 0.2, 0, "horned", -4);
    cyl(0.06, 0.06, 0.04, 6, ropeP, [0, 0.85, 0]);
    // cross bar with chimes
    tube([-0.3, 0.74, 0], [0.3, 0.74, 0], 0.02, 0.02, woodA, 5);
    for (const s2 of [1, -1]) {
      ball(0.028, boneP, [s2 * 0.31, 0.74, 0], 1, undefined, 0);
      for (let i = 0; i < 3; i++) {
        const x = s2 * (0.12 + i * 0.09);
        const len = 0.14 + ((i * 7) % 3) * 0.04;
        tube([x, 0.73, 0.02], [x, 0.73 - len, 0.02], 0.004, 0.004, ropeP, 4);
        tube([x, 0.73 - len, 0.02], [x + 0.005, 0.73 - len - 0.09, 0.02], 0.014, 0.01, boneP, 5);
      }
      poly([[0, 0], [0.025, -0.04], [0.03, -0.14], [0, -0.22], [-0.03, -0.14], [-0.025, -0.04]], 0.006, s2 > 0 ? C.red : C.black, [s2 * 0.26, 0.74, 0.03], undefined, 0);
    }
    // feathers at top
    for (const s2 of [1, -1])
      poly([[0, 0], [0.02, 0.08], [0.025, 0.22], [0, 0.32], [-0.025, 0.22], [-0.02, 0.08]], 0.006, s2 > 0 ? C.red : C.white, [s2 * 0.08, 1.12, -0.05], [0, 0, -s2 * 22]);
  });

  // ------------------------------------------------------------------------------------------------------------
  // 6. Clan banners (cloth hangs on hinge joints)
  const banner = (
    name: string,
    at: V,
    yaw: number,
    H: number,
    texture: THREE.Texture,
    w: number,
    h: number,
    barLen: number,
    phase: number,
  ) => {
    const hinge = b.joint(name, { parent: root, at: W(at[0], at[1] + H - 0.12, at[2]), dir: [0, -1, 0], up: [0, 0, 1], role: "hinge" });
    area(at, yaw, () => {
      setGroup(name + "Pole");
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + rand();
        const s = 0.07 + rand() * 0.04;
        rock([Math.cos(a) * 0.1, s * 0.4, Math.sin(a) * 0.1], s * 1.3, s * 1.1, s, rand() > 0.5 ? rockP : rockLP);
      }
      tube([0, 0, 0], [0, H, 0], 0.036, 0.03, woodA, 7);
      cyl(0.045, 0.045, 0.05, 7, ropeP, [0, 0.22, 0]);
      cyl(0.042, 0.042, 0.05, 7, ropeP, [0, H - 0.5, 0]);
      // spearhead
      cyl(0.045, 0.045, 0.08, 7, ironP, [0, H + 0.02, 0]);
      poly([[0, 0], [0.055, 0.06], [0.04, 0.2], [0, 0.3], [-0.04, 0.2], [-0.055, 0.06]], 0.016, ironLP, [0, H + 0.04, 0], undefined, 0.003);
      for (const s2 of [1, -1]) {
        sw([[s2 * 0.03, H - 0.03, 0], [s2 * 0.12, H - 0.04, 0.02], [s2 * 0.2, H + 0.06, 0.02], [s2 * 0.2, H + 0.18, 0.0]], [0.022, 0.004], boneP, { sides: 5, caps: "point" });
      }
      // crossbar
      const by = H - 0.12;
      tube([-barLen / 2, by, 0], [barLen / 2, by, 0], 0.022, 0.022, woodB, 6);
      for (const s2 of [1, -1]) {
        cone(0.03, 0.12, 5, ironP, [s2 * (barLen / 2 + 0.05), by, 0], [0, 0, -s2 * 90]);
        cyl(0.034, 0.034, 0.03, 6, ropeP, [s2 * (barLen / 2 - 0.03), by, 0], [0, 0, 90]);
        // hanging bone tassels
        tube([s2 * (barLen / 2 - 0.03), by, 0.0], [s2 * (barLen / 2 - 0.03), by - 0.12, 0.0], 0.004, 0.004, ropeP, 4);
        skull([s2 * (barLen / 2 - 0.03), by - 0.15, 0.0], 0.05, 0, "small");
      }
      cyl(0.04, 0.04, 0.05, 7, ropeP, [0, by, 0]);
      // loops tying cloth to the bar
      for (let i = 0; i < 5; i++) {
        const x = (i / 4 - 0.5) * (w - 0.05);
        cyl(0.012, 0.012, 0.04, 5, ropeP, [x, by - 0.02, 0.0]);
      }
      // the cloth, front and back, on the hinge
      setGroup(name + "Cloth", hinge);
      const g = cloth(w, h, 0.05, phase);
      tex(g.clone(), texture, mat([0, by - h / 2 - 0.01, 0.004]), 0, name + ".front");
      tex(backFace(g, -0.008), texture, mat([0, by - h / 2 - 0.01, 0]), 0, name + ".back");
    });
    return hinge;
  };
  const bannerA = banner("bannerA", [-1.35, 0, 0.35], 25, 1.72, bannerRed, 0.42, 0.84, 0.56, 0.4);
  const bannerB = banner("bannerB", [0.14, 0, 0.15], -12, 1.42, bannerDark, 0.34, 0.74, 0.46, 1.6);

  // ------------------------------------------------------------------------------------------------------------
  // 7. Campfire with cauldron
  area([FIRE[0], 0, FIRE[2]], 0, () => {
    setGroup("fire");
    // ash bed + stone ring
    cyl(0.33, 0.35, 0.02, 10, C.ash, [0, 0.01, 0]);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + 0.2;
      const s = 0.085 + rand() * 0.03;
      rock([Math.cos(a) * 0.36, s * 0.45, Math.sin(a) * 0.36], s * 1.3, s * 0.95, s * 1.1, rand() > 0.4 ? rockP : rockDP);
    }
    // logs: teepee of charred sticks and two crossed logs
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + 0.4;
      tube([Math.cos(a) * 0.3, 0.05, Math.sin(a) * 0.3], [Math.cos(a) * 0.05, 0.28 + (i % 3) * 0.04, Math.sin(a) * 0.05], 0.04, 0.03, woodC, 6);
    }
    tube([-0.27, 0.05, 0.1], [0.27, 0.07, -0.08], 0.05, 0.05, woodX, 7);
    tube([0.1, 0.05, 0.27], [-0.08, 0.07, -0.27], 0.045, 0.045, woodZ, 7);
    // embers on the bed
    for (let i = 0; i < 9; i++) {
      const a = rand() * Math.PI * 2;
      const r = rand() * 0.25;
      ball(0.018 + rand() * 0.012, i % 2 ? C.fire3 : C.fire4, [Math.cos(a) * r, 0.04, Math.sin(a) * r], [1.3, 0.6, 1], { glow: 1.2 }, 0);
    }
    // flames: tongues licking up round the pot
    const tongue = (a: number, r: number, h: number, w: number, color: string, g: number, lean: number) => {
      const p0: V = [Math.cos(a) * r, 0.06, Math.sin(a) * r];
      const p1: V = [Math.cos(a) * (r + lean * 0.4), 0.06 + h * 0.5, Math.sin(a) * (r + lean * 0.4)];
      const p2: V = [Math.cos(a + 0.2) * (r + lean), 0.06 + h, Math.sin(a + 0.2) * (r + lean)];
      sw([p0, p1, p2], [w, 0.003], color, { sides: 5, caps: "point", glow: g });
    };
    for (let i = 0; i < 8; i++) tongue((i / 8) * Math.PI * 2 + 0.1, 0.2, 0.34 + (i % 3) * 0.08, 0.06, C.fire3, 1.3, 0.03);
    for (let i = 0; i < 7; i++) tongue((i / 7) * Math.PI * 2 + 0.5, 0.17, 0.3 + (i % 2) * 0.1, 0.05, C.fire2, 1.4, 0.02);
    for (let i = 0; i < 6; i++) tongue((i / 6) * Math.PI * 2 + 0.2, 0.13, 0.24 + (i % 2) * 0.06, 0.04, C.fire1, 1.5, 0.01);
    // sparks
    for (let i = 0; i < 8; i++) {
      const a = rand() * Math.PI * 2;
      const r = 0.1 + rand() * 0.25;
      put(new THREE.OctahedronGeometry(0.012 + rand() * 0.01, 0), C.fire1, [Math.cos(a) * r, 0.6 + rand() * 0.5, Math.sin(a) * r], [rand() * 90, rand() * 90, 0], 1, { glow: 1.6 });
    }
    // tripod
    setGroup("tripod");
    const apex: V = [0, 1.0, 0];
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.5;
      tube([Math.cos(a) * 0.5, 0, Math.sin(a) * 0.5], [Math.cos(a) * 0.04, apex[1] + 0.08, Math.sin(a) * 0.04], 0.034, 0.024, woodA, 6);
      cyl(0.036, 0.036, 0.04, 6, ropeP, [Math.cos(a) * 0.1, 0.9, Math.sin(a) * 0.1]);
    }
    cyl(0.06, 0.06, 0.07, 6, ropeP, [0, apex[1] + 0.05, 0]);
    // hook + chain
    for (let i = 0; i < 7; i++)
      put(new THREE.TorusGeometry(0.02, 0.0065, 4, 6), i % 2 ? ironP : ironLP, [0, apex[1] - 0.02 - i * 0.04, 0], [0, i % 2 ? 0 : 90, 0]);
    // cauldron
    setGroup("cauldron");
    const potY = 0.6;
    const potPts = [
      [0.0, -0.17], [0.1, -0.17], [0.2, -0.12], [0.255, -0.03], [0.255, 0.06], [0.22, 0.14], [0.2, 0.15], [0.19, 0.12], [0.0, 0.12],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    put(new THREE.LatheGeometry(potPts, 9), ironP, [0, potY, 0]);
    put(new THREE.TorusGeometry(0.215, 0.022, 4, 9), ironLP, [0, potY + 0.15, 0], [90, 0, 0]);
    cyl(0.195, 0.195, 0.012, 9, C.brew, [0, potY + 0.11, 0], undefined, { glow: 1.2 });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ball(0.025, C.brew, [Math.cos(a) * 0.1 + 0.01, potY + 0.135, Math.sin(a) * 0.12], [1, 0.7, 1], { glow: 1.5 }, 0);
    }
    for (const yy of [-0.02, 0.07]) put(new THREE.TorusGeometry(0.256 - Math.abs(yy) * 0.02, 0.012, 4, 9), C.ironD, [0, potY + yy, 0], [90, 0, 0]);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      tube([Math.cos(a) * 0.12, potY - 0.16, Math.sin(a) * 0.12], [Math.cos(a) * 0.15, potY - 0.22, Math.sin(a) * 0.15], 0.02, 0.016, ironP, 5);
    }
    // bail handle
    put(new THREE.TorusGeometry(0.2, 0.01, 4, 9, Math.PI), ironLP, [0, potY + 0.14, 0], [0, 0, 0]);
    // ladle leaning on the pot
    tube([0.28, 0.2, 0.18], [0.14, potY + 0.2, 0.0], 0.012, 0.012, woodB, 5);
    cyl(0.04, 0.03, 0.03, 7, ironP, [0.13, potY + 0.2, 0.0], [20, 0, 0]);
    // skewers with meat on stones
    setGroup("skewers");
    for (const [a, h] of [[0.6, 0.4], [1.0, 0.36]] as [number, number][]) {
      const x = Math.cos(a) * 0.56;
      const z = Math.sin(a) * 0.56 + 0.2;
      tube([x, 0, z], [x - 0.12, h, z - 0.1], 0.01, 0.007, woodB, 4);
      for (let k = 0; k < 3; k++) {
        const t = 0.35 + k * 0.2;
        ball(0.04 - k * 0.004, hp(mottle("#9a4a2e", "#6a2c1c", { size: 0.03, seed: 41 })), [x - 0.12 * t, h * t, z - 0.1 * t], [1, 0.85, 1], undefined, 0);
      }
    }
  });

  // log seats around the fire
  setGroup("seats");
  for (const [x, z, yaw, len] of [
    [1.0, 0.95, -35, 0.6],
    [0.5, 1.32, 10, 0.55],
  ] as [number, number, number, number][]) {
    area([x, 0, z], yaw, () => {
      tube([-len / 2, 0.09, 0], [len / 2, 0.09, 0], 0.09, 0.09, woodX, 7);
      cyl(0.08, 0.08, 0.012, 7, C.wL, [len / 2 + 0.005, 0.09, 0], [0, 0, 90]);
      cyl(0.08, 0.08, 0.012, 7, C.wL, [-len / 2 - 0.005, 0.09, 0], [0, 0, 90]);
      rock([len / 2 - 0.05, 0.02, 0.06], 0.05, 0.03, 0.05, rockP);
      rock([-len / 2 + 0.05, 0.02, -0.06], 0.05, 0.03, 0.05, rockP);
      // hide cushion
      box(0.22, 0.03, 0.14, hideLP, [0.08, 0.195, 0.0], [0, 8, 0]);
    });
  }

  // ------------------------------------------------------------------------------------------------------------
  // 8. War drum
  area([-0.1, 0, 1.32], 30, () => {
    setGroup("drum");
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.3;
      tube([Math.cos(a) * 0.3, 0, Math.sin(a) * 0.3], [Math.cos(a) * 0.14, 0.32, Math.sin(a) * 0.14], 0.026, 0.02, woodA, 5);
      cyl(0.03, 0.03, 0.04, 5, ropeP, [Math.cos(a) * 0.2, 0.17, Math.sin(a) * 0.2]);
    }
    area([0, 0.4, 0], [-20, 0, 0], () => {
      const body = [[0, -0.16], [0.17, -0.16], [0.2, -0.08], [0.215, 0], [0.2, 0.08], [0.17, 0.16], [0, 0.16]].map(([x, y]) => new THREE.Vector2(x, y));
      put(new THREE.LatheGeometry(body, 10), woodB, [0, 0, 0]);
      for (const y of [0.165, -0.165]) {
        cyl(0.2, 0.2, 0.014, 10, hideLP, [0, y + (y > 0 ? 0.005 : -0.005), 0]);
        cyl(0.205, 0.205, 0.03, 10, C.ironD, [0, y * 0.97, 0]);
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * Math.PI * 2;
          ball(0.013, ironLP, [Math.cos(a) * 0.208, y * 0.96 + (y > 0 ? 0.016 : -0.016), Math.sin(a) * 0.208], 1, undefined, 0);
        }
      }
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const a2 = a + Math.PI / 10;
        tube([Math.cos(a) * 0.19, 0.15, Math.sin(a) * 0.19], [Math.cos(a2) * 0.19, -0.15, Math.sin(a2) * 0.19], 0.006, 0.006, ropeP, 4);
        tube([Math.cos(a2) * 0.19, -0.15, Math.sin(a2) * 0.19], [Math.cos(a + Math.PI / 5) * 0.19, 0.15, Math.sin(a + Math.PI / 5) * 0.19], 0.006, 0.006, ropeP, 4);
      }
      // painted war bands around the belly
      cyl(0.218, 0.218, 0.05, 10, redP, [0, 0, 0]);
      cyl(0.222, 0.222, 0.012, 10, C.gold, [0, 0.032, 0]);
      cyl(0.222, 0.222, 0.012, 10, C.gold, [0, -0.032, 0]);
      decal(drumRune, 0.4, 0.4, [0, 0.185, 0], [-90, 0, 0]);
    });
    // mallets
    tube([0.28, 0.025, 0.18], [0.5, 0.025, 0.28], 0.014, 0.014, boneP, 5);
    ball(0.04, hideP, [0.5, 0.04, 0.28], 1, undefined, 0);
    tube([0.25, 0.025, 0.28], [0.44, 0.025, 0.4], 0.014, 0.014, boneP, 5);
    ball(0.04, hideP, [0.44, 0.04, 0.4], 1, undefined, 0);
  }, 0.9);

  // ------------------------------------------------------------------------------------------------------------
  // 9. Weapon rack with axes, maul, spears and a shield
  const axeHead = (big: number): [number, number][] => [
    [0, 0.035 * big],
    [0.06 * big, 0.11 * big],
    [0.15 * big, 0.15 * big],
    [0.17 * big, 0.0],
    [0.15 * big, -0.15 * big],
    [0.06 * big, -0.11 * big],
    [0, -0.035 * big],
  ];
  area([0.45, 0, -1.22], 0, () => {
    setGroup("rack");
    for (const s2 of [1, -1]) {
      tube([s2 * 0.3, 0, 0], [s2 * 0.3, 0.94, 0], 0.04, 0.036, woodA, 6);
      cone(0.042, 0.08, 6, woodC, [s2 * 0.3, 0.97, 0]);
      tube([s2 * 0.3, 0.0, -0.15], [s2 * 0.3, 0.0, 0.15], 0.04, 0.04, woodC, 6);
      cyl(0.052, 0.052, 0.04, 6, ropeP, [s2 * 0.3, 0.3, 0]);
    }
    for (const y of [0.34, 0.74]) {
      tube([-0.34, y, 0.0], [0.34, y, 0.0], 0.026, 0.026, woodB, 6);
      for (const s2 of [1, -1]) cyl(0.036, 0.036, 0.02, 6, ropeP, [s2 * 0.3, y, 0]);
    }
    // axes, hung on the top bar
    const axe = (x: number, z: number, lean: number, len: number, yaw: number) => {
      area([x, 0.12, z], [lean, yaw, 0], () => {
        tube([0, 0, 0], [0, len, 0], 0.016, 0.014, woodB, 5);
        cyl(0.02, 0.02, 0.05, 5, C.ironD, [0, len + 0.0, 0]);
        poly(axeHead(1.1), 0.02, ironLP, [0, len - 0.06, 0], [90, 0, 90], 0.004);
        tube([0, len - 0.06, 0.0], [0, len + 0.02, 0.0], 0.026, 0.026, ironP, 6);
        cone(0.014, 0.08, 4, ironLP, [0, len + 0.07, 0]);
        for (let k = 0; k < 4; k++) cyl(0.018, 0.018, 0.02, 5, ropeP, [0, 0.08 + k * 0.03, 0]);
      });
    };
    axe(-0.2, 0.07, -4, 0.68, 20);
    axe(-0.08, 0.07, -3, 0.62, -30);
    axe(0.06, 0.07, -4, 0.7, 10);
    // maul
    area([0.19, 0.12, 0.07], [-4, 0, 0], () => {
      tube([0, 0, 0], [0, 0.72, 0], 0.017, 0.016, woodB, 5);
      box(0.1, 0.1, 0.2, ironP, [0, 0.72, 0], [0, 0, 0]);
      box(0.12, 0.03, 0.22, C.ironD, [0, 0.78, 0]);
      box(0.12, 0.03, 0.22, C.ironD, [0, 0.66, 0]);
      cone(0.03, 0.08, 5, ironLP, [0, 0.82, 0]);
    });
    // spears leaning behind the rack
    for (const [x, lean] of [[-0.34, 8], [0.36, -8]] as [number, number][])
      area([x, 0, -0.09], [0, 0, lean], () => {
        tube([0, 0, 0], [0, 1.3, 0], 0.018, 0.015, woodA, 5);
        poly([[0, 0], [0.04, 0.06], [0.03, 0.16], [0, 0.26], [-0.03, 0.16], [-0.04, 0.06]], 0.014, ironLP, [0, 1.28, 0], undefined, 0.002);
        cyl(0.03, 0.03, 0.03, 5, redP, [0, 1.25, 0]);
        poly([[0, 0], [0.1, -0.03], [0.14, -0.1], [0.04, -0.12], [0, -0.1]], 0.006, C.red, [0, 1.22, 0.02], [0, 0, 0]);
      });
    // shield leaning on the rack
    area([-0.02, 0.0, 0.2], [-18, 0, 0], () => {
      cyl(0.17, 0.17, 0.035, 10, woodB, [0, 0.2, 0], [90, 0, 0]);
      cyl(0.185, 0.185, 0.02, 10, ironP, [0, 0.2, -0.0], [90, 0, 0]);
      decal(shieldEmblem, 0.31, 0.31, [0, 0.2, 0.0185]);
      put(new THREE.SphereGeometry(0.05, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), ironLP, [0, 0.2, 0.02], [90, 0, 0]);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        cone(0.014, 0.05, 4, ironLP, [Math.cos(a) * 0.13, 0.2 + Math.sin(a) * 0.13, 0.04], [90, 0, 0]);
      }
    });
  });

  // ------------------------------------------------------------------------------------------------------------
  // 10. Barrels, crates, sacks near the hut
  area([-0.65, 0, 0.98], -15, () => {
    setGroup("barrels");
    const barrel = (x: number, z: number, open: boolean) => {
      const staves = [[0, 0], [0.115, 0], [0.145, 0.07], [0.155, 0.15], [0.145, 0.23], [0.12, 0.3]].map(([r, y]) => new THREE.Vector2(r, y));
      put(new THREE.LatheGeometry(staves, 9), woodA, [x, 0, z]);
      if (open) {
        cyl(0.115, 0.115, 0.012, 9, C.brew, [x, 0.26, z], undefined, { glow: 1.1 });
        cyl(0.126, 0.126, 0.02, 9, woodC, [x, 0.3, z]);
        tube([x - 0.04, 0.2, z + 0.02], [x + 0.09, 0.46, z - 0.02], 0.012, 0.012, woodB, 5);
      } else {
        cyl(0.12, 0.12, 0.02, 9, woodLZ, [x, 0.305, z]);
        for (const d of [-0.05, 0.05]) box(0.004, 0.006, 0.22, C.wD, [x + d, 0.318, z]);
      }
      for (const [y, r] of [[0.05, 0.13], [0.13, 0.158], [0.23, 0.15]] as [number, number][]) cyl(r, r, 0.03, 9, ironP, [x, y, z]);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ball(0.01, ironLP, [x + Math.cos(a) * 0.162, 0.13, z + Math.sin(a) * 0.162], 1, undefined, 0);
      }
    };
    barrel(0, 0, false);
    barrel(0.28, 0.06, true);
    // crate stack and sacks
    setGroup("crates");
    const crate = (x: number, y: number, z: number, s: number, yaw: number) => {
      area([x, y, z], yaw, () => {
        box(s, s, s, woodLX, [0, s / 2, 0]);
        for (const sx of [1, -1]) for (const sz of [1, -1]) box(0.03, s + 0.01, 0.03, woodC, [sx * s * 0.5, s / 2, sz * s * 0.5]);
        for (const sy of [0.035, s - 0.035]) box(s + 0.02, 0.03, s + 0.02, woodC, [0, sy, 0]);
        for (const sz of [1, -1]) {
          tube([-s * 0.45, 0.05, sz * (s / 2 + 0.012)], [s * 0.45, s - 0.05, sz * (s / 2 + 0.012)], 0.012, 0.012, woodC, 4);
          for (const sx of [1, -1]) ball(0.012, ironLP, [sx * s * 0.45, s - 0.05, sz * (s / 2 + 0.02)], 1, undefined, 0);
        }
        for (const sx of [1, -1]) for (const sz of [1, -1]) box(0.05, 0.05, 0.05, ironP, [sx * (s / 2 - 0.02), s - 0.01, sz * (s / 2 - 0.02)]);
      });
    };
    crate(-0.3, 0, 0.0, 0.24, 10);
    crate(-0.3, 0.24, 0.0, 0.17, 32);
  });

  // ------------------------------------------------------------------------------------------------------------
  // 11. Firewood stack, chopping stump and axe
  area([0.62, 0, -0.56], -8, () => {
    setGroup("firewood");
    for (let row = 0; row < 3; row++)
      for (let i = 0; i < 4 - (row > 1 ? 1 : 0); i++) {
        const x = -0.15 + i * 0.1 + (row % 2) * 0.05;
        const y = 0.045 + row * 0.085;
        tube([x, y, -0.12], [x, y, 0.12], 0.045, 0.045, i % 2 ? woodZ : woodLZ, 6);
        cyl(0.04, 0.04, 0.01, 6, C.wL, [x, y, 0.123], [90, 0, 0]);
      }
    tube([-0.2, 0.0, 0.14], [-0.2, 0.28, 0.14], 0.016, 0.016, woodC, 4);
    const sack = (x: number, z: number, s: number) => {
      ball(s, sackP, [x, s * 0.75, z], [1, 1.1, 0.95], undefined, 1);
      cone(s * 0.35, s * 0.5, 5, sackP, [x, s * 1.75, z]);
      cyl(s * 0.3, s * 0.3, 0.02, 6, ropeP, [x, s * 1.45, z]);
    };
    sack(0.26, 0.1, 0.09);
    sack(0.3, 0.26, 0.075);
  });
  area([1.0, 0, 0.28], 20, () => {
    setGroup("stump");
    cyl(0.15, 0.17, 0.26, 8, woodA, [0, 0.13, 0]);
    cyl(0.145, 0.145, 0.014, 8, C.wL, [0, 0.265, 0]);
    for (const r of [0.04, 0.085, 0.12]) put(new THREE.TorusGeometry(r, 0.004, 3, 10), C.wM, [0, 0.274, 0], [90, 0, 0]);
    for (let i = 0; i < 4; i++) {
      const a = i * 1.6;
      tube([Math.cos(a) * 0.14, 0.0, Math.sin(a) * 0.14], [Math.cos(a) * 0.24, 0.0, Math.sin(a) * 0.24], 0.03, 0.012, woodC, 4);
    }
    // cleaver axe stuck in the stump
    area([0.02, 0.27, 0.0], [8, 0, 16], () => {
      tube([0, 0, 0], [0, 0.46, 0], 0.017, 0.015, woodB, 5);
      poly(axeHead(1.4), 0.024, ironLP, [0.0, 0.14, 0], [0, 90, 0], 0.004);
      box(0.04, 0.11, 0.04, ironP, [0, 0.12, 0]);
      for (let k = 0; k < 4; k++) cyl(0.02, 0.02, 0.02, 5, ropeP, [0, 0.3 + k * 0.035, 0]);
    });
    // wood chips
    for (let i = 0; i < 5; i++) box(0.04, 0.012, 0.02, C.wL, [0.2 + rand() * 0.12, 0.006, -0.25 + rand() * 0.5], [0, rand() * 180, 0]);
  });

  // ------------------------------------------------------------------------------------------------------------
  // 11b. Hide drying rack
  area([-1.3, 0, -0.16], 78, () => {
    setGroup("hideRack");
    for (const s2 of [1, -1]) {
      tube([s2 * 0.3, -0.02, 0.04], [s2 * 0.3, 0.92, 0.04], 0.03, 0.026, woodA, 6);
      tube([s2 * 0.3, -0.02, -0.26], [s2 * 0.3, 0.88, 0.0], 0.026, 0.022, woodC, 5);
      cone(0.032, 0.07, 6, boneP, [s2 * 0.3, 0.96, 0.04]);
      cyl(0.04, 0.04, 0.04, 6, ropeP, [s2 * 0.3, 0.5, 0.04]);
    }
    tube([-0.34, 0.86, 0.04], [0.34, 0.86, 0.04], 0.022, 0.022, woodB, 6);
    tube([-0.34, 0.12, 0.04], [0.34, 0.12, 0.04], 0.022, 0.022, woodB, 6);
    const hide: [number, number][] = [
      [-0.22, 0.2], [-0.11, 0.16], [0, 0.19], [0.12, 0.15], [0.22, 0.22], [0.25, 0.4], [0.21, 0.55], [0.24, 0.72],
      [0.15, 0.8], [0.05, 0.75], [-0.05, 0.81], [-0.16, 0.76], [-0.24, 0.7], [-0.2, 0.5], [-0.25, 0.35],
    ];
    poly(hide, 0.012, hideLP, [0, 0, 0.04], undefined, 0.003);
    for (const [hx, hy] of hide) {
      const bx = Math.sign(hx) * 0.3;
      const by = hy > 0.5 ? 0.86 : hy < 0.3 ? 0.12 : hy;
      if (Math.abs(hx) < 0.27) tube([hx, hy, 0.05], [Math.abs(hx) > 0.2 ? bx : hx, by, 0.045], 0.004, 0.004, ropeP, 3);
    }
    for (const [a, c] of [[[-0.12, 0.3], [0.1, 0.62]], [[0.0, 0.28], [0.18, 0.5]], [[-0.15, 0.6], [0.02, 0.7]]] as [number, number][][])
      tube([a[0], a[1], 0.05], [c[0], c[1], 0.05], 0.014, 0.014, C.red, 4);
    for (let i = 0; i < 3; i++) rock([Math.cos(i * 2.1) * 0.08, 0.02, Math.sin(i * 2.1) * 0.08 - 0.16], 0.04, 0.03, 0.04, rockP);
  });

  // ------------------------------------------------------------------------------------------------------------
  // 12. Bones, ribs, trophies on the ground
  setGroup("bones");
  const femur = (x: number, z: number, yaw: number, len: number) => {
    area([x, 0.025, z], yaw, () => {
      tube([-len / 2, 0, 0], [len / 2, 0, 0], 0.012, 0.012, boneP, 5);
      for (const s2 of [1, -1]) for (const dz of [0.01, -0.01]) ball(0.017, boneP, [s2 * len / 2, 0, dz], 1, undefined, 0);
    });
  };
  femur(0.9, 0.78, 50, 0.22);
  femur(0.03, 0.74, -20, 0.18);
  femur(-0.35, 0.82, 80, 0.2);
  for (let i = 0; i < 5; i++) {
    area([-0.55 + i * 0.045, 0.0, 0.66], [0, 20, 0], () => {
      put(new THREE.TorusGeometry(0.09 - Math.abs(i - 2) * 0.01, 0.01, 4, 8, Math.PI), boneP, [0, 0, 0], [0, 0, 0]);
    });
  }
  skull([0.95, 0.03, 0.9], 0.1, -60, "orc", 0);
  skull([-0.3, 0.03, 0.62], 0.08, 150, "small", 0);
  skull([1.2, 0.03, 0.3], 0.1, -110, "orc", 0);
  // skull pikes
  for (const [x, z, h, yaw] of [[-0.75, 0.4, 0.95, 10], [0.95, 0.45, 0.7, 30]] as [number, number, number, number][]) {
    area([x, 0, z], yaw, () => {
      tube([0, -0.02, 0], [0.01, h, 0], 0.016, 0.012, woodA, 5);
      cone(0.016, 0.1, 5, ironLP, [0.01, h + 0.14, 0]);
      skull([0.01, h - 0.06, 0.0], 0.12, 0, "orc", -8);
      for (let i = 0; i < 3; i++) cyl(0.022, 0.022, 0.02, 5, ropeP, [0, 0.08 + i * 0.05, 0]);
      for (let i = 0; i < 3; i++) rock([Math.cos(i * 2) * 0.05, 0.015, Math.sin(i * 2) * 0.05], 0.03, 0.025, 0.03, rockP);
    });
  }

  // ------------------------------------------------------------------------------------------------------------
  // 13. Grass tufts (cards)
  const keepOut: [number, number, number][] = [
    [-0.55, -0.5, 0.85], [1.15, -0.5, 0.35], [0.45, 0.6, 0.55], [0.45, -1.22, 0.4], [-0.1, 1.32, 0.35], [-0.65, 0.98, 0.5], [-1.05, 1.0, 0.25],
    [-1.35, 0.35, 0.2], [0.14, 0.15, 0.2], [0.62, -0.56, 0.3], [1.0, 0.28, 0.25], [1.0, 0.95, 0.35], [0.5, 1.32, 0.3], [-0.4, 0.35, 0.2], [-0.75, 0.4, 0.15], [0.95, 0.45, 0.15], [-0.98, 0.2, 0.12], [1.35, 0.3, 0.12],
  ];
  const tuftPts: V[] = [];
  let guard = 0;
  while (tuftPts.length < 70 && guard++ < 2000) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * (RB - 0.1);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (keepOut.some(([kx, kz, kr]) => Math.hypot(x - kx * K, z - kz * K) < kr * K)) continue;
    tuftPts.push([x, G, z]);
  }
  b.cards(
    tuftPts.map((p) => frame(p, [0, 1, 0])),
    [grassTex, tuft],
    { size: [0.1, 0.12], lean: 10, flow: [0, -0.3, 1], vary: 0.4, spin: 180, cross: true, rng: rand, bone: root, group: "grass" },
  );
  const tuftPts2: V[] = [];
  for (let i = 0; i < 20; i++) {
    const a = rand() * Math.PI * 2;
    const x = Math.cos(a) * (RB - 0.2 + rand() * 0.1);
    const z = Math.sin(a) * (RB - 0.2 + rand() * 0.1);
    tuftPts2.push([x, G, z]);
  }
  b.cards(
    tuftPts2.map((p) => frame(p, [0, 1, 0])),
    grassTex,
    { size: [0.12, 0.16], lean: 6, flow: [0, -0.3, 1], vary: 0.3, spin: 180, cross: true, rng: rand, bone: root, group: "grass" },
  );

  // ------------------------------------------------------------------------------------------------------------
  // flush merged parts
  for (const bk of buckets.values()) {
    const merged = bk.geos.length > 1 ? mergeGeometries(bk.geos, false) : bk.geos[0];
    if (!merged) throw new Error(`merge failed for ${bk.name}`);
    const p = b.part(merged, bk.color, { bone: bk.bone, at: [0, 0, 0], name: bk.name });
    if (bk.glow) glow(p, bk.glow);
  }
  void bannerA;
  void bannerB;

  return b.root;
}
```
