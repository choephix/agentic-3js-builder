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

These are complete, typecheck-clean reference modules. They are examples, not templates: design the requested subject yourself, reuse API shapes and construction techniques where useful, and do not copy a reference subject or its composition. The picker supplied three structural matches for topology quadruped.

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

## Example: rhinocerosBeetleSonnet

Brief: Category: Animal.
Subject: Hercules rhinoceros beetle with paired horns, six spined legs and lamellate antennae.
Style: low-poly.
Topology: quadruped
Style family: low-poly
Notable features: six-legs, horns, antennae, elytra, painted-patterns

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, type OutlinePoint } from "agentic-3js-builder";
import { cells, mix, noise, paint, smoothstep, type Rgb } from "agentic-3js-builder";
import { rng } from "agentic-3js-builder";
import { bezier, catmull, polyline } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Hercules Rhinoceros Beetle",
  description:
    "Male Dynastes hercules at real size (about 17 cm with horns): a gleaming black thoracic horn and a shorter lower head horn closing like pincers, olive elytra with black blotches and ridge rows, orange pubescence under the horn and belly, six spined legs and lamellate antennae, low-poly and fully rigged.",
  style: "low-poly",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Units: everything below is written in centimetres and converted once.
const cm = 0.01;
const P = (x: number, y: number, z: number): [number, number, number] => [x * cm, y * cm, z * cm];
/** Linear lookup through evenly spaced keys. */
const K = (keys: number[], t: number) => {
  const f = Math.min(Math.max(t, 0), 1) * (keys.length - 1);
  const i = Math.min(Math.floor(f), keys.length - 2);
  return keys[i] + (keys[i + 1] - keys[i]) * (f - i);
};
/** An outline drawn in centimetres, as metres. */
const O = (pts: [number, number][]): OutlinePoint[] => pts.map(([x, y]) => [x * cm, y * cm]);

// Palette ---------------------------------------------------------------------------------------------------------
const JET = "#1d1921";
const JET_HI = "#585266";
const CHESTNUT = "#53281a";
const RUST = "#964318";
const AMBER = "#d27a22";
const OLIVE_D = "#434f20";
const OLIVE = "#738034";
const OLIVE_L = "#b0ae66";
const BLACK = "#0d0a0e";
const EYE = "#2b1208";
const SHINE = "#ddd6c6";
const WING = "#7a5530";
const WING_V = "#34200f";

export default function build() {
  const b = createBuilder({ name: "herculesBeetle", paintSize: 2048 });
  const rand = rng(11);

  // =============================================================================================================
  // Skeleton
  const body = b.joint("body", { at: P(0, 3.5, -0.4), dir: [0, 0, 1], role: "spine" });
  const abdomen = b.joint("abdomen", { parent: body, at: P(0, 3.4, -0.4), aim: P(0, 3.3, -5.8), role: "spine" });
  const prothorax = b.joint("prothorax", { parent: body, at: P(0, 3.6, 0.8), aim: P(0, 3.7, 3.8), role: "spine" });
  const head = b.joint("head", { parent: prothorax, at: P(0, 3.4, 3.7), aim: P(0, 3.15, 5.6), role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: P(0, 2.6, 4.6), aim: P(0, 2.5, 5.8), role: "jaw" });

  // =============================================================================================================
  // Paints
  const elytraPaint = paint((p, n) => {
    const zf = smoothstep(-0.054, -0.004, p.z); // 0 at the rear tip, 1 near the shoulders
    const warm = noise(p, 0.026, 2);
    let c = mix(OLIVE, OLIVE_L, Math.min(Math.max(warm * 1.6 - 0.35 + zf * 0.3, 0), 1));
    c = mix(c, OLIVE_D, (1 - zf) * 0.55);
    // big black blotches with ragged edges
    const cl = cells(p, 0.0105, 5);
    const rad = 0.3 + cl.id * 0.34 + (noise(p, 0.006, 6) - 0.5) * 0.45;
    if (cl.id > 0.25) c = mix(c, BLACK, 1 - smoothstep(rad - 0.07, rad, cl.d1));
    // medium blotches, smaller and sparser
    const cm2 = cells(p, 0.0056, 14);
    if (cm2.id > 0.62) c = mix(c, BLACK, 0.9 * (1 - smoothstep(0.13, 0.2, cm2.d1)));
    // fine puncture dots
    const sp = cells(p, 0.0026, 9);
    if (sp.id > 0.4) c = mix(c, OLIVE_D, 0.75 * (1 - smoothstep(0.1, 0.2, sp.d1)));
    // dark margin skirt and sutural line
    c = mix(c, BLACK, smoothstep(-0.25, -0.75, n.y) * 0.95);
    const x = Math.abs(p.x);
    c = mix(c, BLACK, 1 - smoothstep(0.0009, 0.0024, x));
    c = mix(c, OLIVE_D, 0.35 * (1 - smoothstep(0.0024, 0.007, x)));
    // sheen on the crown
    return mix(c, "#dde08f", smoothstep(0.82, 1, n.y) * 0.2);
  });

  const pronotumPaint = paint((p, n) => {
    const hl = smoothstep(0.45, 1, n.y) * (0.5 + 0.5 * noise(p, 0.02, 4));
    let c = mix(JET, JET_HI, hl * 0.85);
    const pit = cells(p, 0.0034, 11);
    if (pit.id > 0.35) c = mix(c, BLACK, 0.7 * (1 - smoothstep(0.1, 0.2, pit.d1)));
    c = mix(c, BLACK, 0.7 * (1 - smoothstep(0.0006, 0.0016, Math.abs(p.x))));
    c = mix(c, CHESTNUT, smoothstep(0.1, -0.5, n.y) * 0.5 * (0.6 + 0.4 * noise(p, 0.01, 8)));
    return mix(c, RUST, smoothstep(-0.5, -0.9, n.y) * 0.5);
  });

  const hornPaint = (t0: number) =>
    paint((p, n, s) => {
      const hl = smoothstep(0.4, 1, n.y) * (0.55 + 0.45 * noise(p, 0.015, 3));
      let c = mix(JET, JET_HI, hl * 0.8);
      c = mix(c, CHESTNUT, smoothstep(0.0, -0.7, n.y) * 0.75);
      return mix(c, RUST, smoothstep(t0, 1, s[0]) * 0.8);
    });

  const bellyPaint = paint((p, n) => {
    const seam = ((((p.z + 0.053) / 0.0074) % 1) + 1) % 1;
    let c = mix(CHESTNUT, "#2c140c", noise(p, 0.012, 7));
    c = mix(c, RUST, smoothstep(0.12, 0.0, seam) * 0.8);
    c = mix(c, BLACK, 1 - smoothstep(0.0008, 0.002, Math.abs(p.x)));
    return mix(c, JET, smoothstep(0.1, 0.9, n.y) * 0.8);
  });

  const headPaint = paint((p, n) => {
    const hl = smoothstep(0.5, 1, n.y) * (0.45 + 0.55 * noise(p, 0.012, 13));
    let c = mix(JET, JET_HI, hl * 0.85);
    const pit = cells(p, 0.0026, 17);
    if (pit.id > 0.3) c = mix(c, BLACK, 0.8 * (1 - smoothstep(0.1, 0.22, pit.d1)));
    return mix(c, CHESTNUT, smoothstep(0.0, -0.7, n.y) * 0.75);
  });

  const wingPaint = paint((p) => {
    const rib = (((p.z / 0.0034) % 1) + 1) % 1;
    const v = Math.abs(rib - 0.5);
    return mix(mix(WING, "#a07a48", noise(p, 0.01, 4)), WING_V, (1 - smoothstep(0.02, 0.1, v)) * 0.65);
  });

  // =============================================================================================================
  // Hair texture (the orange pubescence)
  const tuft = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 48">
      <path d="M12 0 L16 48 H8Z" fill="#e39a33"/>
      <path d="M5 9 L9 48 H1Z" fill="#c9701d"/>
      <path d="M19 12 L23 48 H15Z" fill="#f0b855"/>
      <path d="M9 20 L13 48 H5Z" fill="#a85a17"/>
    </svg>`,
    { size: 120 },
  );
  const hairOpts = { lean: 62, bend: 16, vary: 0.35, spin: 25 };

  // =============================================================================================================
  // Elytra, wings, scutellum, pygidium
  const ELY_RX = [0.47, 1.05, 1.34, 1.4, 1.28, 1.0];
  const ELY_RY = [0.47, 1.1, 1.48, 1.54, 1.36, 1.0];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hinge = b.joint(`elytron${side}`, {
      parent: body,
      at: P(s * 0.8, 4.7, 0.7),
      aim: P(s * 1.0, 3.5, -5.0),
      role: "hinge",
    });
    const path = catmull([
      P(s * 0.95, 3.3, -5.6),
      P(s * 0.95, 3.5, -3.7),
      P(s * 0.95, 3.6, -1.2),
      P(s * 0.95, 3.55, 0.2),
    ]);
    const shell = b.sweep(path, (t) => [K(ELY_RX, t) * cm, K(ELY_RY, t) * cm], {
      bone: hinge,
      color: elytraPaint,
      sides: 10,
      smooth: false,
      name: `elytron${side}`,
    });
    // raised ridge rows (costae)
    for (const a of [64, 38, 12, -14, -40]) {
      b.sweep(shell.line(-s * a, -0.0006).slice(0.06, 0.92), [0.0003, 0.0003], {
        bone: hinge,
        color: elytraPaint,
        sides: 4,
        smooth: false,
        caps: "none",
        name: `ridge${side}`,
      });
    }
    // dark lower margin rim
    b.sweep(shell.line(-s * 108, -0.0004).slice(0.04, 0.96), [0.0005, 0.0005], {
      bone: hinge,
      color: BLACK,
      sides: 4,
      smooth: false,
      caps: "none",
      name: `rim${side}`,
    });
    // humeral callus at the shoulder
    b.part(new THREE.SphereGeometry(0.0036, 6, 4), OLIVE_L, { bone: hinge, at: P(s * 1.95, 4.5, 0.15), flat: true, name: "callus" });
    // folded hind wing: a brown membrane that peeks out under the elytron tip
    const wingBone = b.joint(`wing${side}`, {
      parent: body,
      at: P(s * 0.8, 3.8, 0.3),
      aim: P(s * 0.95, 3.1, -6.6),
      role: "wing",
    });
    b.extrude(
      O([
        [0, 0],
        [1.5, 0.5],
        [3.2, 0.45],
        [5.7, 0.2],
        [6.5, -0.1],
        [5.5, -0.6],
        [2.8, -0.75],
        [0.8, -0.5],
      ]),
      {
        at: P(s * 0.8, 3.05, -0.15),
        x: [0, 0, -1],
        y: [-s, 0, 0],
        thickness: 0.0008,
        color: wingPaint,
        bone: wingBone,
        name: `hindwing${side}`,
      },
    );
  }
  // scutellum
  b.extrude(
    O([
      [-0.5, 0],
      [0.5, 0],
      [0, 0.7],
    ]),
    { at: P(0, 4.75, 0.95), x: [1, 0, 0], y: [0, 0.3, -1], thickness: 0.0016, bevel: 0.0004, color: JET, bone: body, name: "scutellum" },
  );
  // pygidium (last tergite) peeking past the elytra
  b.part(new THREE.SphereGeometry(0.0065, 6, 4), CHESTNUT, {
    bone: abdomen,
    at: P(0, 2.95, -5.9),
    scale: [1.5, 0.85, 0.85],
    flat: true,
    name: "pygidium",
  });

  // =============================================================================================================
  // Belly, prothorax, head
  const belly = b.sweep(
    catmull([P(0, 2.5, -5.5), P(0, 2.45, -1.9), P(0, 2.45, 1.5), P(0, 2.6, 3.3)]),
    (t) => [K([0.6, 1.3, 1.55, 1.5, 1.0], t) * cm, K([0.45, 0.7, 0.72, 0.68, 0.55], t) * cm],
    { bone: body, color: bellyPaint, sides: 10, smooth: false, name: "belly" },
  );
  const pron = b.sweep(
    catmull([P(0, 3.7, 0.55), P(0, 3.8, 2.2), P(0, 3.65, 3.7)]),
    (t) => [K([1.45, 1.8, 1.78, 1.45, 0.95], t) * cm, K([1.0, 1.25, 1.25, 1.1, 0.75], t) * cm],
    { bone: prothorax, color: pronotumPaint, sides: 10, smooth: false, name: "pronotum" },
  );
  for (const s of [1, -1]) {
    // glossy rim ridge along each pronotum margin
    b.sweep(pron.line(-s * 80, -0.0005).slice(0.12, 0.9), [0.0004, 0.0004], {
      bone: prothorax,
      color: JET,
      sides: 4,
      smooth: false,
      caps: "none",
      name: "pronotumRim",
    });
  }
  const skull = b.sweep(
    catmull([P(0, 3.3, 3.4), P(0, 3.2, 4.4), P(0, 3.0, 5.25)]),
    (t) => [K([1.15, 1.1, 0.78], t) * cm, K([0.95, 0.85, 0.58], t) * cm],
    { bone: head, color: headPaint, sides: 10, smooth: false, name: "skull" },
  );
  // clypeus, a notched plate in front of the head
  b.extrude(
    O([
      [-0.8, 0],
      [0.8, 0],
      [0.95, 0.5],
      [0.6, 1.05],
      [0.2, 1.15],
      [0, 0.8],
      [-0.2, 1.15],
      [-0.6, 1.05],
      [-0.95, 0.5],
    ]),
    { at: P(0, 3.15, 4.55), x: [1, 0, 0], y: [0, 0, 1], thickness: 0.0042, bevel: 0.001, color: headPaint, bone: head, name: "clypeus" },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0034, 6, 5), EYE, { bone: head, at: P(s * 0.98, 3.25, 4.15), scale: [0.7, 1, 1.2], flat: true, name: "eye" });
    b.part(new THREE.SphereGeometry(0.0007, 4, 3), SHINE, { bone: head, at: P(s * 1.17, 3.38, 4.2), flat: true, name: "eyeGlint" });
    // brow ridge over each eye
    b.capsule(P(s * 1.05, 3.55, 3.8), P(s * 1.0, 3.5, 4.7), 0.0011, { bone: head, color: JET, sides: 5, name: "brow" });
  }

  // =============================================================================================================
  // Horns
  const thPath = catmull([P(0, 4.3, 2.0), P(0, 5.5, 3.3), P(0, 6.4, 5.3), P(0, 6.9, 7.7), P(0, 6.6, 9.7), P(0, 5.7, 11.0)]);
  const TH = [1.1, 0.92, 0.7, 0.5, 0.36, 0.14];
  const thoracicHorn = b.sweep(thPath, (t) => [K(TH, t) * cm, K(TH, t) * 0.92 * cm], {
    bone: prothorax,
    color: hornPaint(0.8),
    section: { ngon: 6 },
    caps: "point",
    name: "thoracicHorn",
  });
  const cephPath = catmull([P(0, 3.5, 4.4), P(0, 3.55, 6.2), P(0, 3.85, 8.0), P(0, 4.6, 9.4), P(0, 5.2, 10.3)]);
  const CE = [0.72, 0.56, 0.44, 0.32, 0.14];
  const cephalicHorn = b.sweep(cephPath, (t) => [K(CE, t) * cm, K(CE, t) * 0.9 * cm], {
    bone: head,
    color: hornPaint(0.82),
    section: { ngon: 6 },
    caps: "point",
    name: "cephalicHorn",
  });
  // teeth on the cephalic horn, and prongs on the thoracic horn
  for (const [t, len, r] of [
    [0.46, 0.55, 0.19],
    [0.62, 0.45, 0.15],
    [0.78, 0.32, 0.11],
  ] as const) {
    const at = cephalicHorn.at(t, 0);
    b.spike(at, at, len * cm, r * cm, { color: JET, sides: 5, name: "cephTooth" });
  }
  for (const s of [1, -1]) {
    const lat = thoracicHorn.at(0.9, -s * 70);
    b.spike(lat, lat, 0.3 * cm, 0.09 * cm, { color: JET, sides: 5, name: "thoracicProng" });
    const lat2 = thoracicHorn.at(0.55, -s * 60);
    b.spike(lat2, lat2, 0.24 * cm, 0.12 * cm, { color: JET, sides: 5, name: "thoracicTubercle" });
    const lat3 = thoracicHorn.at(0.2, -s * 75);
    b.spike(lat3, lat3, 0.26 * cm, 0.13 * cm, { color: JET, sides: 5, name: "thoracicTubercle" });
  }
  // orange fringe under the thoracic horn and the cephalic horn
  b.cards(
    b.surface(thoracicHorn).scatter(100, { rng: rand, minDist: 0.0032, filter: (h) => h.n.y < -0.4 }),
    tuft,
    { size: [0.0034, 0.0075], flow: [0, -0.35, -1], ...hairOpts, rng: rand },
  );
  b.cards(
    b.surface(cephalicHorn).scatter(55, { rng: rand, minDist: 0.0032, filter: (h) => h.n.y < -0.35 && h.at.z > 0.055 }),
    tuft,
    { size: [0.0028, 0.006], flow: [0, -0.35, -1], ...hairOpts, rng: rand },
  );

  // =============================================================================================================
  // Mouthparts and antennae
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const mand = b.joint(`mandible${side}`, { parent: head, at: P(s * 0.6, 2.85, 4.85), aim: P(s * 0.28, 2.75, 6.2), role: "jaw" });
    b.sweep(bezier(P(s * 0.6, 2.85, 4.85), P(s * 0.88, 2.8, 5.7), P(s * 0.2, 2.75, 6.25)), [0.0036, 0.0003], {
      bone: mand,
      color: BLACK,
      section: { ngon: 5 },
      caps: "point",
      name: "mandible",
    });
    b.spike(P(s * 0.55, 2.8, 5.7), [-s, 0.1, 0.3], 0.0045, 0.0012, { bone: mand, color: BLACK, sides: 5, name: "mandibleTooth" });
    // palps on the lower lip
    b.capsule(P(s * 0.3, 2.5, 5.1), P(s * 0.5, 2.45, 5.75), [0.0009, 0.0006], { bone: jaw, color: RUST, sides: 5, name: "palp" });

    // antenna: three stalk joints, then a three-leaf lamellate club
    const a = [P(s * 0.65, 3.15, 4.85), P(s * 1.0, 3.2, 5.5), P(s * 1.32, 3.3, 6.0), P(s * 1.62, 3.42, 6.4)];
    const antenna = b.chain(`antenna${side}`, polyline(a), {
      parent: head,
      names: [`antenna${side}1`, `antenna${side}2`, `antenna${side}3`],
      role: "tentacle",
    });
    b.sweep(antenna, [0.0013, 0.0008], { color: CHESTNUT, section: { ngon: 5 }, name: "antennaStalk" });
    const end = new THREE.Vector3(...a[3]);
    const dir = end.clone().sub(new THREE.Vector3(...a[2])).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    for (let j = 0; j < 3; j++) {
      const yDir = up.clone().applyAxisAngle(dir, (j * Math.PI) / 3 + 0.3);
      b.extrude(
        O([
          [0, 0],
          [0.15, 0.2],
          [0.6, 0.25],
          [0.95, 0.1],
          [1.0, 0],
          [0.95, -0.1],
          [0.6, -0.25],
          [0.15, -0.2],
        ]),
        { at: end, x: dir.toArray(), y: yDir.toArray(), thickness: 0.0004, color: j === 1 ? AMBER : RUST, bone: antenna.joints[2], name: "antennaLeaf" },
      );
    }
  }
  b.extrude(
    O([
      [-0.55, 0],
      [0.55, 0],
      [0.62, 0.55],
      [0.2, 1.05],
      [-0.2, 1.05],
      [-0.62, 0.55],
    ]),
    { at: P(0, 2.52, 4.55), x: [1, 0, 0], y: [0, 0, 1], thickness: 0.0025, bevel: 0.0006, color: CHESTNUT, bone: jaw, name: "labium" },
  );

  // =============================================================================================================
  // Legs
  type Leg = { name: string; hip: number[]; knee: number[]; ankle: number[]; toe: number[]; parent: typeof body; front: boolean };
  const legs: Leg[] = [
    { name: "1", hip: [1.2, 2.4, 2.5], knee: [3.1, 2.9, 3.5], ankle: [4.3, 1.3, 4.6], toe: [5.1, 0.68, 5.9], parent: prothorax, front: true },
    { name: "2", hip: [1.3, 2.4, 0.3], knee: [3.4, 2.9, 0.8], ankle: [5.0, 1.3, 1.2], toe: [6.0, 0.68, 1.9], parent: body, front: false },
    { name: "3", hip: [1.2, 2.4, -1.9], knee: [3.1, 2.8, -3.0], ankle: [4.5, 1.3, -4.0], toe: [5.5, 0.68, -5.0], parent: abdomen, front: false },
  ];
  const legColor = (t1: number, t2: number) =>
    paint((p, n, s) => {
      const t = s[0];
      let c: Rgb;
      if (t < t1) c = mix(JET, CHESTNUT, smoothstep(t1 * 0.55, t1, t) * 0.85 + (1 - smoothstep(0, t1 * 0.25, t)) * 0.4);
      else if (t < t2) c = mix(CHESTNUT, JET, 0.45 + 0.4 * noise(p, 0.01, 21));
      else c = mix(CHESTNUT, RUST, 0.5);
      return mix(c, JET_HI, smoothstep(0.6, 1, n.y) * 0.35 * (1 - smoothstep(t2 - 0.02, t2, t)));
    });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const leg of legs) {
      const m = (q: number[]) => P(s * q[0], q[1], q[2]);
      const hip = m(leg.hip);
      const knee = m(leg.knee);
      const ankle = m(leg.ankle);
      const toe = m(leg.toe);
      const id = `${side}${leg.name}`;
      const chain = b.chain(`leg${id}`, polyline([hip, knee, ankle, toe]), {
        parent: leg.parent,
        names: [`hip${id}`, `knee${id}`, `ankle${id}`, `foot${id}`],
        role: "leg",
        contact: [toe[0], 0, toe[2]],
      });
      const L1 = new THREE.Vector3(...hip).distanceTo(new THREE.Vector3(...knee));
      const L2 = new THREE.Vector3(...knee).distanceTo(new THREE.Vector3(...ankle));
      const L3 = new THREE.Vector3(...ankle).distanceTo(new THREE.Vector3(...toe));
      const tot = L1 + L2 + L3;
      const t1 = L1 / tot;
      const t2 = (L1 + L2) / tot;
      const fw = leg.front ? 1.2 : 1;
      const r = (t: number) => {
        if (t < t1) return (0.54 - 0.1 * (t / t1) + 0.08 * Math.sin((t / t1) * Math.PI)) * cm;
        if (t < t2) return (0.4 * fw - 0.12 * ((t - t1) / (t2 - t1))) * cm;
        return (0.2 - 0.06 * ((t - t2) / (1 - t2))) * cm;
      };
      const tube = b.sweep(chain, r, { section: { ngon: 6 }, color: legColor(t1, t2), name: `leg${id}` });
      const [hipJ, kneeJ, ankleJ] = chain.joints;
      const foot = chain.tip ?? ankleJ;

      // coxa and knee knuckles
      b.part(new THREE.SphereGeometry(0.0068, 6, 4), CHESTNUT, { bone: hipJ, at: hip, flat: true, name: "coxa" });
      b.part(new THREE.SphereGeometry(0.0046, 6, 4), CHESTNUT, { bone: kneeJ, at: knee, flat: true, name: "knee" });

      const kv = new THREE.Vector3(...knee);
      const av = new THREE.Vector3(...ankle);
      const tv = new THREE.Vector3(...toe);
      const shin = av.clone().sub(kv).normalize();
      const out = new THREE.Vector3(s, 0, 0);
      // tibial teeth along the outer edge (broad on the digging fore legs)
      const teeth: number[] = leg.front ? [0.4, 0.62, 0.84] : [0.5, 0.8];
      for (const u of teeth) {
        const base = kv.clone().lerp(av, u).addScaledVector(out, r(t1 + (t2 - t1) * u) * 0.8);
        const d = out.clone().addScaledVector(shin, leg.front ? 0.9 : 0.5).addScaledVector(new THREE.Vector3(0, -1, 0), 0.1).normalize();
        b.spike(base, d, (leg.front ? 0.55 : 0.34) * cm, (leg.front ? 0.19 : 0.11) * cm, { bone: kneeJ, color: BLACK, sides: 5, name: "tibialTooth" });
      }
      // end spurs
      const spread = new THREE.Vector3().crossVectors(shin, out).normalize();
      for (const k of [-1, 1]) {
        const d = shin.clone().addScaledVector(spread, 0.35 * k).addScaledVector(out, 0.25).normalize();
        b.spike(av.clone().addScaledVector(spread, 0.14 * cm * k).addScaledVector(shin, -0.2 * cm), d, 0.45 * cm, 0.09 * cm, { bone: ankleJ, color: CHESTNUT, sides: 5, name: "spur" });
      }
      // beaded tarsus segments
      const beads: THREE.BufferGeometry[] = [];
      for (let i = 0; i < 5; i++) {
        const q = av.clone().lerp(tv, (i + 0.6) / 5.2);
        beads.push(new THREE.SphereGeometry((0.23 - 0.02 * i) * cm, 5, 4).translate(q.x, q.y, q.z));
      }
      const merged = mergeGeometries(beads);
      if (merged) b.part(merged, CHESTNUT, { bone: ankleJ, at: [0, 0, 0], flat: true, name: "tarsus" });
      // claws and sole pad
      const d = tv.clone().sub(av).normalize();
      const lat = new THREE.Vector3().crossVectors(d, new THREE.Vector3(0, 1, 0)).normalize();
      for (const k of [-1, 1]) {
        const root = tv.clone().addScaledVector(lat, 0.08 * cm * k);
        const mid = root.clone().addScaledVector(d, 0.4 * cm).addScaledVector(lat, 0.12 * cm * k);
        const tip = root.clone().addScaledVector(d, 0.65 * cm).addScaledVector(lat, 0.3 * cm * k).add(new THREE.Vector3(0, -0.34 * cm, 0));
        b.sweep(bezier(root, mid, tip), [0.0008, 0.0001], { bone: foot, color: BLACK, section: { ngon: 4 }, caps: "point", name: "claw" });
      }
      b.part(new THREE.SphereGeometry(0.0018, 5, 4), AMBER, { bone: foot, at: tv.clone().addScaledVector(d, 0.1 * cm).toArray(), flat: true, name: "pad" });
      // hairs on the thigh
      b.cards(b.surface(tube).scatter(14, { rng: rand, minDist: 0.003, filter: (h) => h.n.y < -0.3 && h.at.y > 0.017 }), tuft, {
        size: [0.0024, 0.0052],
        flow: [0, -0.3, -1],
        ...hairOpts,
        rng: rand,
      });
    }
  }

  // =============================================================================================================
  // Underside pubescence
  b.cards(b.surface(belly).scatter(260, { rng: rand, minDist: 0.0034, filter: (h) => h.n.y < -0.15 }), tuft, {
    size: [0.0032, 0.0068],
    flow: [0, -0.3, -1],
    ...hairOpts,
    rng: rand,
  });
  b.cards(b.surface(skull).scatter(25, { rng: rand, minDist: 0.0032, filter: (h) => h.n.y < -0.2 }), tuft, {
    size: [0.0024, 0.005],
    flow: [0, -0.3, -1],
    ...hairOpts,
    rng: rand,
  });

  return b.root;
}
```

## Example: hippopotamusSonnet

Brief: Category: Animal.
Subject: standing hippopotamus with a broad muzzle, sleepy eyes and a small support pack.
Style: Overwatch.
Topology: quadruped
Style family: overwatch
Notable features: muzzle, jaw, pack, glossy-eyes, accent-colour

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "agentic-3js-builder";
import { limb } from "agentic-3js-builder";
import { rng } from "agentic-3js-builder";
import { catmull } from "agentic-3js-builder";
import { mix, noise, paint, smoothstep } from "agentic-3js-builder";
import type { Rgb } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Gentle Giant Hippo",
  description:
    "A standing, mouth-closed hippopotamus in a polished Overwatch-style look: periwinkle hide with a crisp pink underside, wide bevelled muzzle, sleepy glossy eyes and a clean white-navy support pack with one strong orange accent.",
  style: "Overwatch",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: periwinkle hide, pink underside, white/navy tech, ONE accent (orange).
const SKIN_HI = "#b6c2f0";
const SKIN = "#8c9acf";
const SKIN_LO = "#6574b0";
const DEEP = "#4a5588";
const BELLY = "#ffcbd0";
const PINK = "#ef93a6";
const PINK_DK = "#d4647f";
const FOOT = "#5a6396";
const HOOF = "#2b2e4d";
const IVORY = "#f8f0da";
const NAVY = "#222744";
const NAVY_LT = "#3a4170";
const WHITE = "#eef2fb";
const STEEL = "#b3bdd4";
const ORANGE = "#ff7a1a";
const ORANGE_DK = "#d4570a";
const GLOWC = "#ffc766";
const NOSTRIL = "#3a2748";

const ease = (a: number, b: number, u: number) => a + ((b - a) * (1 - Math.cos(Math.PI * u))) / 2;
/** Smooth [rx, ry] profile through keys [t, rx, ry]. */
function profile(keys: Array<[number, number, number]>) {
  return (t: number): [number, number] => {
    if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const u = (t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]);
        return [ease(keys[i - 1][1], keys[i][1], u), ease(keys[i - 1][2], keys[i][2], u)];
      }
    }
    const k = keys[keys.length - 1];
    return [k[1], k[2]];
  };
}

/** Rounded/chamfered rectangle outline, half extents hx × hy, chamfer c. */
function chamfered(hx: number, hy: number, c: number): Array<[number, number]> {
  return [
    [-hx + c, -hy],
    [hx - c, -hy],
    [hx, -hy + c],
    [hx, hy - c],
    [hx - c, hy],
    [-hx + c, hy],
    [-hx, hy - c],
    [-hx, -hy + c],
  ];
}

// ---------------------------------------------------------------------------------------------------------------
// Paints
const blushPoints: Array<[THREE.Vector3, number, number]> = [];
for (const s of [1, -1]) {
  blushPoints.push([new THREE.Vector3(s * 0.49, 1.0, 1.42), 0.2, 0.7]); // cheek
  blushPoints.push([new THREE.Vector3(s * 0.31, 1.46, 1.22), 0.16, 0.6]); // around the eye
  blushPoints.push([new THREE.Vector3(s * 0.5, 0.98, 1.92), 0.17, 0.55]); // lip corner
  blushPoints.push([new THREE.Vector3(s * 0.2, 1.38, 1.6), 0.12, 0.6]); // nostril
  blushPoints.push([new THREE.Vector3(s * 0.47, 0.52, 0.42), 0.14, 0.5]); // elbow
  blushPoints.push([new THREE.Vector3(s * 0.45, 0.5, -0.86), 0.14, 0.5]); // knee
}

const skin = paint((p, n) => {
  const j = noise(p, 0.4, 11);
  let c: Rgb = mix(SKIN_LO, SKIN, smoothstep(-0.55, 0.2, n.y));
  c = mix(c, SKIN_HI, smoothstep(0.55, 0.95, n.y) * 0.9);
  // crisp, hand-painted pink underside with a wobbly edge
  const edge = n.y + (j - 0.5) * 0.34;
  c = mix(c, BELLY, 1 - smoothstep(-0.46, -0.38, edge));
  // cloudy blotches
  c = mix(c, SKIN_LO, smoothstep(0.58, 0.82, noise(p, 0.2, 3)) * 0.22);
  // neck folds
  const fz = smoothstep(0.52, 0.72, p.z) * (1 - smoothstep(1.0, 1.18, p.z)) * smoothstep(0.55, 0.8, p.y);
  const f = Math.abs(Math.sin(p.z * 30 + noise(p, 0.5, 4) * 4));
  c = mix(c, DEEP, (1 - smoothstep(0.05, 0.13, f)) * fz * 0.6);
  // leg wrinkles
  const lw = 1 - smoothstep(0.28, 0.46, p.y);
  const f2 = Math.abs(Math.sin(p.y * 42 + noise(p, 0.3, 6) * 3));
  c = mix(c, DEEP, (1 - smoothstep(0.06, 0.14, f2)) * lw * 0.45);
  // blush: hippo pink around eyes, cheeks, joints
  let b = 0;
  for (const [pt, r, k] of blushPoints) b = Math.max(b, (1 - smoothstep(r * 0.25, r, p.distanceTo(pt))) * k);
  c = mix(c, PINK, b);
  // lower-jaw lips are a warmer pink
  if (p.z > 1.1 && p.y < 0.9) c = mix(c, BELLY, smoothstep(0.9, 0.82, p.y) * 0.65);
  // whisker follicles in staggered rows on the muzzle
  if (p.z > 1.45 && p.y > 1.1 && n.y > 0.4) {
    const row = Math.round(p.z / 0.07);
    const col = Math.round((p.x + (row % 2) * 0.035) / 0.07);
    const dx = p.x + (row % 2) * 0.035 - col * 0.07;
    const dz = p.z - row * 0.07;
    c = mix(c, DEEP, 0.7 * (1 - smoothstep(0.005, 0.012, Math.hypot(dx, dz))));
  }
  return c;
});

const packTop = paint((_p, n, s) => {
  if (Math.abs(n.y) < 0.5) return NAVY;
  const [x, y] = s;
  const ax = Math.abs(x);
  if (ax < 0.022) return ORANGE;
  if (ax < 0.03) return NAVY;
  if (Math.abs(y - 0.14) < 0.005 || Math.abs(y + 0.2) < 0.005) return NAVY_LT;
  if (ax > 0.085 && ax < 0.13 && y > -0.28 && y < -0.22 && Math.sin(x * 220) > 0) return NAVY;
  if (ax > 0.085 && ax < 0.13 && y > 0.17 && y < 0.26 && Math.sin(y * 260) > 0) return NAVY_LT;
  return mix(WHITE, STEEL, 0.25 * noise(new THREE.Vector3(x, y, 0), 0.12, 2));
});
const canisterPaint = paint((_p, n, s) => {
  const t = s[0];
  if (Math.abs(t - 0.18) < 0.02 || Math.abs(t - 0.82) < 0.02) return NAVY;
  if (Math.abs(t - 0.5) < 0.012) return NAVY_LT;
  if (n.y < -0.35) return STEEL;
  return mix(WHITE, SKIN_HI, 0.12 * (1 - n.y));
});
const packBase = paint((_p, n, s) => {
  if (Math.abs(n.y) < 0.5) return NAVY_LT;
  const ax = Math.abs(s[0]);
  const ay = Math.abs(s[1]);
  if (ax > 0.3 || ay > 0.4) return ORANGE_DK;
  return NAVY;
});

// ---------------------------------------------------------------------------------------------------------------
// Textures
const EYE = svg(
  `<svg viewBox="0 0 256 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="ir" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#ffd25a"/><stop offset="0.65" stop-color="#ff9a1e"/><stop offset="1" stop-color="#b8480a"/>
    </radialGradient>
  </defs>
  <rect width="256" height="128" fill="#2a1b30"/>
  <ellipse cx="128" cy="64" rx="44" ry="40" fill="#f6eee8"/>
  <circle cx="128" cy="64" r="29" fill="#3a2040"/>
  <circle cx="128" cy="64" r="26" fill="url(#ir)"/>
  <circle cx="128" cy="64" r="12" fill="#1c1024"/>
  <circle cx="117" cy="51" r="8" fill="#ffffff"/>
  <circle cx="139" cy="77" r="3.5" fill="#ffffff" fill-opacity="0.9"/>
</svg>`,
  { size: 256 },
);
const BRISTLE = svg(
  `<svg viewBox="0 0 16 48" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 48 L6.5 20 Q6 8 3 2 Q8 6 9.5 20 L9.5 48Z" fill="#4a3c5c"/>
  <path d="M9 48 L10 24 Q11 12 14 5 Q11.5 14 11.5 26 L12 48Z" fill="#3a2f4d"/>
  <path d="M4.5 48 L5 28 Q4 20 1 15 Q6 20 6.5 30Z" fill="#3a2f4d"/>
</svg>`,
  { size: 96 },
);
const FRINGE = svg(
  `<svg viewBox="0 0 16 32" xmlns="http://www.w3.org/2000/svg">
  <path d="M5 32 Q4 16 8 2 Q11 16 11 32Z" fill="#4a3c5c"/>
</svg>`,
  { size: 96 },
);

export default function build() {
  const b = createBuilder({ name: "hippopotamus", paintSize: 2048 });

  // ------------------------------------------------------------------------------------------------------------
  // Skeleton
  const hips = b.joint("hips", { at: [0, 1.02, -0.78], dir: [0, 0.02, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.02, -0.78],
      [0, 1.03, -0.15],
      [0, 1.05, 0.4],
      [0, 1.07, 0.8],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.07, 0.8],
      [0, 1.09, 0.95],
      [0, 1.1, 1.05],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.1, 1.05], dir: [0, -0.02, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.95, 1.15], aim: [0, 0.82, 1.55], role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.1, -1.4],
      [0, 1.07, -1.62],
      [0, 0.97, -1.78],
      [0, 0.83, -1.85],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // ------------------------------------------------------------------------------------------------------------
  // Body barrel + neck (one skinned loft)
  const bodyPath = catmull([
    [0, 1.04, -1.12],
    [0, 1.02, -0.78],
    [0, 1.03, -0.15],
    [0, 1.05, 0.4],
    [0, 1.07, 0.8],
    [0, 1.09, 1.0],
  ]);
  const bodyR = profile([
    [0, 0.42, 0.43],
    [0.09, 0.57, 0.52],
    [0.24, 0.66, 0.55],
    [0.5, 0.69, 0.57],
    [0.75, 0.66, 0.56],
    [0.9, 0.55, 0.5],
    [1, 0.44, 0.44],
  ]);
  const body = b.sweep(bodyPath, bodyR, {
    bone: [hips, spine, neck],
    color: skin,
    shift: (): [number, number] => [0, -0.04],
    sides: 14,
    caps: "round",
    name: "body",
  });
  const bodyS = b.surface(body);

  // ------------------------------------------------------------------------------------------------------------
  // Head: upper skull + muzzle, lower jaw
  const skullR = profile([
    [0, 0.46, 0.44],
    [0.35, 0.5, 0.4],
    [0.75, 0.53, 0.34],
    [1, 0.52, 0.31],
  ]);
  const skull = b.sweep(
    catmull([
      [0, 1.15, 0.98],
      [0, 1.14, 1.32],
      [0, 1.08, 1.5],
      [0, 1.04, 1.6],
    ]),
    skullR,
    { bone: head, color: skin, sides: 14, caps: "round", name: "skull" },
  );
  const jawR = profile([
    [0, 0.38, 0.24],
    [0.4, 0.42, 0.22],
    [0.8, 0.47, 0.2],
    [1, 0.46, 0.19],
  ]);
  const lower = b.sweep(
    catmull([
      [0, 0.9, 1.1],
      [0, 0.86, 1.34],
      [0, 0.83, 1.5],
      [0, 0.82, 1.55],
    ]),
    jawR,
    { bone: jaw, color: skin, sides: 14, caps: "round", name: "lowerJaw" },
  );
  const headS = b.surface([skull, lower]);

  // closed-mouth seam, with a small friendly lift at the corners
  const seamPts = [
    [0.42, 1.0, 1.28],
    [0.47, 0.94, 1.42],
    [0.5, 0.92, 1.62],
    [0.44, 0.9, 1.82],
    [0.22, 0.89, 1.95],
    [0, 0.89, 1.98],
    [-0.22, 0.89, 1.95],
    [-0.44, 0.9, 1.82],
    [-0.5, 0.92, 1.62],
    [-0.47, 0.94, 1.42],
    [-0.42, 1.0, 1.28],
  ];
  b.sweep(headS.drape(catmull(seamPts), { lift: 0.006 }), 0.011, { bone: head, color: NAVY, sides: 4, caps: "round", name: "mouthLine" });

  // lip pads, nostril bumps, brow/eye turrets, cheeks
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.2, 12, 8), skin, { bone: head, at: [s * 0.28, 1.0, 1.84], scale: [1, 0.92, 1.05], name: "lipPad" });
    b.part(new THREE.SphereGeometry(0.075, 8, 6), skin, { bone: head, at: [s * 0.2, 1.36, 1.6], scale: [1, 0.7, 1.15], name: "nostrilBump" });
    b.part(new THREE.SphereGeometry(0.04, 6, 4), NOSTRIL, {
      bone: head,
      at: [s * 0.2, 1.395, 1.64],
      scale: [0.42, 0.22, 1.05],
      rotation: [0, s * 18, 0],
      name: "nostril",
    });
    b.part(new THREE.SphereGeometry(0.28, 10, 8), skin, { bone: head, at: [s * 0.32, 0.98, 1.4], scale: [0.95, 0.8, 1.3], name: "cheek" });
    // eye turret
    const turret = new THREE.Vector3(s * 0.31, 1.46, 1.2);
    b.part(new THREE.SphereGeometry(0.13, 10, 8), skin, { bone: head, at: turret.toArray(), name: "eyeTurret" });
    const face = new THREE.Vector3(s * 0.5, 0.3, 0.8).normalize();
    const eyeAt = turret.clone().addScaledVector(face, 0.085);
    b.part(new THREE.SphereGeometry(0.07, 12, 8), "#ffffff", {
      bone: head,
      at: eyeAt.toArray(),
      rotation: [0, Math.atan2(face.x, face.z) * (180 / Math.PI) - 90, 0],
      texture: EYE,
      name: "eye",
    });
    b.part(new THREE.SphereGeometry(0.079, 10, 5, 0, Math.PI * 2, 0, 1.0), skin, {
      bone: head,
      at: eyeAt.toArray(),
      dir: [s * 0.1, 1, -0.25],
      name: "eyelid",
    });
    // brow ridge over the lid
    b.rod([s * 0.2, 1.54, 1.18], [s * 0.4, 1.48, 1.26], [0.03, 0.025], { bone: head, color: SKIN_LO, sides: 6, name: "brow" });
  }

  // tusks: the lower canines peek out beside the closed lips
  for (const s of [1, -1]) {
    const base = new THREE.Vector3(s * 0.5, 0.93, 1.6);
    const dir = new THREE.Vector3(s * 0.2, 1, 0.3).normalize();
    b.spike(base, dir, 0.21, 0.04, { bone: jaw, color: IVORY, sides: 7, name: "tusk" });
    const band0 = base.clone().addScaledVector(dir, 0.05);
    const band1 = base.clone().addScaledVector(dir, 0.08);
    b.rod(band0, band1, 0.036, { bone: jaw, color: ORANGE, sides: 8, name: "tuskBand" });
  }

  // ears
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ear = b.joint(`ear${side}`, { parent: head, at: [s * 0.2, 1.47, 1.0], dir: [s * 0.45, 1, 0.1], role: "hinge" });
    const outline: Array<[number, number]> = [
      [-0.085, 0],
      [-0.105, 0.07],
      [-0.065, 0.15],
      [0, 0.195],
      [0.065, 0.15],
      [0.105, 0.07],
      [0.085, 0],
    ];
    const e = b.extrude(outline, {
      at: [s * 0.2, 1.47, 1.0],
      x: [1, 0, 0],
      y: [s * 0.45, 1, 0.1],
      thickness: 0.05,
      bevel: 0.012,
      smoothing: 1,
      color: skin,
      bone: ear,
      name: "ear",
      detail: 0.5,
    });
    b.extrude(
      outline.map(([x, y]) => [x * 0.62, y * 0.74 + 0.012] as [number, number]),
      {
        at: [s * 0.2, 1.47, 1.0 + 0.021],
        x: [1, 0, 0],
        y: [s * 0.45, 1, 0.1],
        thickness: 0.012,
        bevel: 0.004,
        smoothing: 1,
        color: PINK,
        bone: ear,
        name: "earInner",
        detail: 0.4,
      },
    );
    // orange ear tag
    b.extrude(chamfered(0.026, 0.02, 0.008), {
      at: e.local([s * 0.07, 0.1, 0.0]),
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.003,
      color: ORANGE,
      bone: ear,
      name: "earTag",
      detail: 0.4,
    });
    glow(b.part(new THREE.SphereGeometry(0.011, 6, 4), GLOWC, { bone: ear, at: e.local([s * 0.087, 0.1, 0.0]), name: "earTagLight" }));
    // ear fringe
    const earS = b.surface(e);
    b.cards(earS.scatter(8, { rng: rng(30 + s), minDist: 0.03, filter: (h) => h.at.y > 1.56 }), FRINGE, {
      size: [0.025, 0.05],
      lean: 25,
      vary: 0.25,
      rng: rng(31),
      flow: [0, 0.4, 0.4],
    });
  }

  // bristles on the muzzle and chin
  b.cards(
    headS.scatter(34, {
      rng: rng(5),
      minDist: 0.07,
      filter: (h) => h.at.z > 1.5 && h.n.y > 0.3 && h.at.y > 1.15 && Math.abs(h.at.x) < 0.4,
    }),
    BRISTLE,
    { size: [0.03, 0.08], lean: 45, flow: [0, 0.3, 1], vary: 0.3, rng: rng(6), bend: 15 },
  );
  b.cards(
    headS.scatter(24, {
      rng: rng(7),
      minDist: 0.07,
      filter: (h) => h.at.z > 1.55 && h.n.y < -0.25 && h.at.y < 0.85,
    }),
    BRISTLE,
    { size: [0.03, 0.07], lean: 40, flow: [0, -0.3, 1], vary: 0.3, rng: rng(8) },
  );

  // ------------------------------------------------------------------------------------------------------------
  // Tail
  const tailTube = b.sweep(tail, (t) => [0.115 - 0.05 * t, 0.075 - 0.025 * t], {
    color: skin,
    sides: 10,
    caps: "round",
    name: "tail",
  });
  const tailS = b.surface(tailTube);
  b.sweep(tailS.loop(tail.joints[2], { lift: 0.01 }), 0.016, { color: WHITE, sides: 6, name: "tailBand" });
  b.sweep(tailS.loop(tail.at(0.97), { lift: 0.004 }), 0.011, { color: ORANGE, sides: 6, name: "tailBandAccent" });
  b.cards(
    tailS.scatter(30, { rng: rng(11), minDist: 0.025, filter: (h) => h.at.z < -1.74 }),
    BRISTLE,
    { size: [0.025, 0.07], lean: 50, flow: [0, -1, -0.4], vary: 0.3, rng: rng(12) },
  );

  // ------------------------------------------------------------------------------------------------------------
  // Legs: sweeps + feet + toes
  const makeLeg = (s: number, front: boolean) => {
    const side = s > 0 ? "L" : "R";
    const x = s * (front ? 0.47 : 0.42);
    const z = front ? 0.5 : -0.95;
    const root: [number, number, number] = [x, 0.92, z];
    const target: [number, number, number] = [x, 0.17, z + 0.02];
    const pts = limb(root, target, front ? [0.4, 0.38] : [0.4, 0.38], [0, 0, front ? -1 : 1]);
    const names = front ? [`shoulder${side}`, `elbow${side}`, `hand${side}`] : [`hip${side}`, `knee${side}`, `foot${side}`];
    const chain = b.chain(`leg${front ? "F" : "H"}${side}`, pts, {
      parent: front ? spine.joints[2] : hips,
      names,
      role: "leg",
      contact: [x, 0, z + 0.04],
    });
    const radii = front ? [0.31, 0.28, 0.235, 0.21, 0.2] : [0.3, 0.27, 0.23, 0.21, 0.2];
    const tube = b.sweep(chain, radii, { color: skin, sides: 10, caps: "round", name: `leg${front ? "F" : "H"}${side}` });
    const tip = chain.tip!;
    // foot pad
    const fz = z + 0.05;
    b.part(new THREE.SphereGeometry(1, 12, 8), FOOT, { bone: tip, at: [x, 0.115, fz], scale: [0.225, 0.115, 0.29], name: "foot" });
    // toes
    const dx = [-0.135, -0.047, 0.047, 0.135];
    dx.forEach((ox, i) => {
      const k = i + 1;
      const tz = fz + 0.235 - Math.abs(ox) * 0.7;
      const toeAt: [number, number, number] = [x + ox * s, 0.065, tz];
      const toe = b.joint(`toe${front ? "F" : "H"}${side}${k}`, {
        parent: tip,
        at: toeAt,
        aim: [toeAt[0], toeAt[1] - 0.01, toeAt[2] + 0.1],
        role: "digit",
      });
      b.part(new THREE.SphereGeometry(0.068, 8, 6), FOOT, { bone: toe, at: toeAt, scale: [0.95, 0.85, 1.2], name: "toe" });
      b.part(new THREE.SphereGeometry(0.05, 6, 5), HOOF, {
        bone: toe,
        at: [toeAt[0], 0.045, toeAt[2] + 0.07],
        scale: [1.05, 0.62, 0.85],
        name: "nail",
      });
      b.part(new THREE.SphereGeometry(0.02, 5, 4), PINK_DK, {
        bone: toe,
        at: [toeAt[0], 0.075, toeAt[2] + 0.025],
        scale: [1.2, 0.5, 0.8],
        name: "toeTip",
      });
    });
    // anklet: white cuff with an orange stripe and a light
    const legS = b.surface(tube);
    const cuffY = 0.33;
    b.sweep(legS.loop([x, cuffY, z], { lift: 0.012 }), [0.02, 0.014], { section: "box", color: NAVY, name: "cuffBase" });
    b.sweep(legS.loop([x, cuffY + 0.035, z], { lift: 0.018 }), 0.019, { color: WHITE, sides: 8, name: "cuff" });
    b.sweep(legS.loop([x, cuffY - 0.028, z], { lift: 0.014 }), 0.009, { color: ORANGE, sides: 6, name: "cuffStripe" });
    glow(
      b.part(new THREE.BoxGeometry(0.03, 0.014, 0.016), GLOWC, {
        bone: chain.joints[1],
        at: [x + s * 0.0, cuffY + 0.035, z + 0.225],
        name: "cuffLight",
      }),
    );
  };
  for (const s of [1, -1]) {
    makeLeg(s, true);
    makeLeg(s, false);
  }

  // ------------------------------------------------------------------------------------------------------------
  // Support pack on the back
  const backY = (z: number) => bodyS.ray([0, 3, z], [0, -1, 0])!.at.y;
  const packZ = -0.12;
  const yTop = backY(packZ);
  const packBone = spine.joints[1];
  b.extrude(chamfered(0.34, 0.46, 0.12), {
    at: [0, yTop + 0.015, packZ],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.14,
    bevel: 0.025,
    color: packBase,
    bone: packBone,
    name: "packBase",
  });
  b.extrude(chamfered(0.15, 0.32, 0.07), {
    at: [0, yTop + 0.1, packZ - 0.02],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.09,
    bevel: 0.02,
    color: packTop,
    bone: packBone,
    name: "packTop",
  });
  // canisters
  for (const s of [1, -1]) {
    const cx = s * 0.255;
    const cy = yTop + 0.115;
    const za = packZ - 0.34;
    const zb = packZ + 0.34;
    b.rod([cx, cy, za], [cx, cy, zb], 0.082, { bone: packBone, color: canisterPaint, sides: 10, name: "canister" });
    for (const [z, w] of [
      [za + 0.03, 0.05],
      [zb - 0.03, 0.05],
    ] as const) {
      b.rod([cx, cy, z - w / 2], [cx, cy, z + w / 2], 0.09, { bone: packBone, color: ORANGE, sides: 10, name: "canisterRing" });
    }
    b.rod([cx, cy, packZ - 0.03], [cx, cy, packZ + 0.03], 0.087, { bone: packBone, color: NAVY, sides: 10, name: "canisterBand" });
    b.part(new THREE.SphereGeometry(0.082, 8, 3, 0, Math.PI * 2, 0, Math.PI / 2), NAVY, {
      bone: packBone,
      at: [cx, cy, zb],
      dir: [0, 0, 1],
      name: "canisterCap",
    });
    b.part(new THREE.SphereGeometry(0.082, 8, 3, 0, Math.PI * 2, 0, Math.PI / 2), NAVY, {
      bone: packBone,
      at: [cx, cy, za],
      dir: [0, 0, -1],
      name: "canisterCap",
    });
    // glow strip along the canister
    glow(
      b.rod([cx, cy + 0.083, packZ - 0.2], [cx, cy + 0.083, packZ + 0.2], [0.012, 0.012], {
        bone: packBone,
        color: GLOWC,
        sides: 4,
        name: "canisterGlow",
      }),
    );
  }
  // status lights on the module
  [-0.06, 0, 0.06].forEach((ox, i) =>
    glow(
      b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 8), i === 1 ? GLOWC : ORANGE, {
        bone: packBone,
        at: [ox, yTop + 0.148, packZ + 0.1],
        name: "statusLight",
      }),
    ),
  );
  // antenna
  const antBase: [number, number, number] = [0.07, yTop + 0.145, packZ - 0.28];
  b.rod(antBase, [0.09, yTop + 0.38, packZ - 0.34], [0.009, 0.005], { bone: packBone, color: STEEL, sides: 5, name: "antenna" });
  glow(b.part(new THREE.SphereGeometry(0.02, 8, 6), GLOWC, { bone: packBone, at: [0.09, yTop + 0.395, packZ - 0.345], name: "antennaTip" }), 1.5);
  b.rod(antBase, [0.07, yTop + 0.17, packZ - 0.28], [0.022, 0.022], { bone: packBone, color: NAVY, sides: 6, name: "antennaMount" });

  // bolts on the pack
  const bolts: THREE.BufferGeometry[] = [];
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      bolts.push(new THREE.SphereGeometry(0.014, 5, 3).translate(sx * 0.26, yTop + 0.082, packZ + sz * 0.39));
      bolts.push(new THREE.SphereGeometry(0.014, 5, 3).translate(sx * 0.115, yTop + 0.146, packZ - 0.02 + sz * 0.27));
    }
  b.part(mergeGeometries(bolts)!, STEEL, { bone: packBone, at: [0, 0, 0], name: "packBolts" });

  // straps round the barrel, with buckles on the flanks
  const strapAt = (z: number, label: string) => {
    const loop = bodyS.loop([0, 1.0, z], { dir: [0, 0, 1], lift: 0.012 });
    b.sweep(loop, () => [0.04, 0.012], { section: "box", color: NAVY, name: `strap${label}` });
    b.sweep(bodyS.loop([0, 1.0, z], { dir: [0, 0, 1], lift: 0.024 }), () => [0.015, 0.007], {
      section: "box",
      color: ORANGE,
      name: `strapStripe${label}`,
    });
    const studs: THREE.BufferGeometry[] = [];
    const lp = bodyS.loop([0, 1.0, z], { dir: [0, 0, 1], lift: 0.03 });
    for (let i = 0; i < 10; i++) {
      const q = lp.at((i + 0.5) / 10);
      studs.push(new THREE.SphereGeometry(0.014, 5, 3).translate(q.x, q.y, q.z));
    }
    b.part(mergeGeometries(studs)!, STEEL, { bone: packBone, at: [0, 0, 0], name: `strapStuds${label}` });
    for (const s of [1, -1]) {
      const hit = bodyS.around([0, 1.0, z]).at(s * 90, -12);
      if (!hit) continue;
      b.stick(new THREE.BoxGeometry(0.13, 0.045, 0.1), NAVY, hit, { embed: 0.15, bone: packBone, name: "buckle" });
      b.stick(new THREE.BoxGeometry(0.085, 0.032, 0.06), STEEL, hit.moved([0, 0.012, 0]), { embed: 0.15, bone: packBone, name: "buckleFace" });
      b.stick(new THREE.BoxGeometry(0.02, 0.026, 0.05), ORANGE, hit.moved([0, 0.026, 0]), { embed: 0.1, bone: packBone, name: "buckleTab" });
    }
  };
  strapAt(-0.45, "Rear");
  strapAt(0.22, "Front");

  // collar with a glowing medallion on each side
  const collarZ = 0.93;
  b.sweep(bodyS.loop([0, 1.08, collarZ], { dir: [0, 0, 1], lift: 0.016 }), () => [0.05, 0.016], {
    section: "box",
    color: NAVY,
    name: "collar",
  });
  b.sweep(bodyS.loop([0, 1.08, collarZ], { dir: [0, 0, 1], lift: 0.03 }), () => [0.014, 0.007], {
    section: "box",
    color: ORANGE,
    name: "collarStripe",
  });
  for (const s of [1, -1]) {
    const hit = bodyS.around([0, 1.08, collarZ]).at(s * 90, 0);
    if (!hit) continue;
    b.stick(new THREE.CylinderGeometry(0.085, 0.085, 0.03, 6), NAVY, hit.moved([0, 0.02, 0]), { embed: 0.2, bone: neck.joints[1], name: "medallion" });
    b.stick(new THREE.CylinderGeometry(0.062, 0.062, 0.02, 6), WHITE, hit.moved([0, 0.035, 0]), { embed: 0.2, bone: neck.joints[1], name: "medallionFace" });
    glow(b.stick(new THREE.CylinderGeometry(0.03, 0.03, 0.016, 10), ORANGE, hit.moved([0, 0.05, 0]), { embed: 0.2, bone: neck.joints[1], name: "medallionCore" }), 1.3);
  }

  // side flank plates: slim white armour tiles with navy trim, an orange stripe and vents
  const flankPaint = paint((_p, n, st) => {
    if (Math.abs(n.x) < 0.5) return NAVY;
    const [u, v] = st;
    const au = Math.abs(u);
    const av = Math.abs(v);
    if (au > 0.205 || av > 0.108) return NAVY_LT;
    if (av < 0.014) return ORANGE;
    if (av < 0.02) return NAVY;
    if (v > 0.03 && v < 0.09 && u > -0.12 && u < 0.12 && Math.sin(u * 150) > 0.2) return STEEL;
    if (v < -0.03 && v > -0.09 && au < 0.13 && Math.abs(Math.abs(u) - 0.065) < 0.004) return NAVY_LT;
    return mix(WHITE, STEEL, 0.2);
  });
  for (const s of [1, -1]) {
    const hit = bodyS.around([0, 1.05, -0.12]).at(s * 90, 8);
    if (!hit) continue;
    b.extrude(chamfered(0.23, 0.12, 0.05), {
      at: hit.moved([0, 0.018, 0]).at,
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.04,
      bevel: 0.012,
      color: flankPaint,
      bone: spine.joints[1],
      name: "flankPlate",
    });
    glow(b.stick(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 8), ORANGE, hit.moved([0, 0.04, 0.0]), { embed: 0.3, bone: spine.joints[1], name: "flankLight" }));
  }

  // utility pouches hanging off the rear strap
  for (const s of [1, -1]) {
    const hit = bodyS.around([0, 1.0, -0.66]).at(s * 90, -4);
    if (!hit) continue;
    b.stick(new THREE.BoxGeometry(0.15, 0.09, 0.15), NAVY_LT, hit, { embed: 0.2, bone: hips, name: "pouch" });
    b.stick(new THREE.BoxGeometry(0.14, 0.02, 0.18), NAVY, hit.moved([0, 0.058, 0]), { embed: 0.2, bone: hips, name: "pouchFlap" });
    b.stick(new THREE.BoxGeometry(0.04, 0.012, 0.05), ORANGE, hit.moved([0, 0.07, 0.0]), { embed: 0.2, bone: hips, name: "pouchTab" });
  }

  return b.root;
}
```
