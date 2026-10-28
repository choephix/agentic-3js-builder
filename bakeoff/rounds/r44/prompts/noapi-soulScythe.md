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

These are complete, typecheck-clean reference modules. They are examples, not templates: design the requested subject yourself, reuse API shapes and construction techniques where useful, and do not copy a reference subject or its composition. The picker supplied three structural matches for topology prop-weapon.

## Example: rocketHammerSonnet

Brief: Category: Fantasy weapon.
Subject: rocket-boosted siege war hammer with piston striker, gimballed thruster, booster pods, fuel gauge, hoses, trigger and wrist strap.
Style: Overwatch.
Topology: prop-weapon
Style family: overwatch
Notable features: hammer-head, thruster, boosters, hoses, glow

```ts
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { aim } from "agentic-3js-builder";
import { catmull } from "agentic-3js-builder";
import { mix, noise, paint, smoothstep } from "agentic-3js-builder";
import type { Paint } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Thunderclap Rocket Hammer",
  description:
    "A rocket-boosted siege war hammer on a display stand: pale armour plates on a navy frame, a piston striker face, a big gimballed thruster bell with flame, two side booster pods, fuel tank with glowing gauge, hoses, trigger and wrist strap. Overwatch-style clean bevels, panel lines and one orange accent.",
  style: "Overwatch",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------- palette
const PALE = "#e9eef3";
const PALE_SH = "#c3cddb";
const SEAM = "#8794a8";
const STEEL = "#8696ab";
const STEEL_L = "#b3c0d1";
const STEEL_D = "#4d5b6e";
const NAVY = "#243249";
const NAVY_D = "#161f30";
const GUN = "#30363f";
const GUN_L = "#4b535f";
const BLACK = "#11151b";
const RUBBER = "#1f242c";
const RUBBER_L = "#313945";
const ORANGE = "#ff7a14";
const ORANGE_D = "#c24a08";
const AMBER = "#ffb02e";
const YELLOW = "#ffd84d";
const HOT = "#fff3d0";

// ---------------------------------------------------------------- geometry helpers
const HY = 1.6; // head centre height
const rbox = (w: number, h: number, d: number, r = 0.008, seg = 1) => new RoundedBoxGeometry(w, h, d, seg, r);
const near = (v: number, c: number, w: number) => Math.abs(v - c) < w;
const fract = (v: number) => v - Math.floor(v);

// ---------------------------------------------------------------- paints (all in model space, so panel lines continue across parts)
const pale = (p: THREE.Vector3) => mix(PALE, PALE_SH, smoothstep(0.5, 0.85, noise(p, 0.07, 7)) * 0.65);

const headPaint = paint((p, n) => {
  const x = p.x;
  const y = p.y - HY;
  const z = p.z;
  if (Math.abs(n.z) > 0.7) return n.z > 0 ? NAVY_D : GUN;
  if (n.y > 0.7) {
    if (Math.abs(x) < 0.02) return ORANGE;
    if (near(Math.abs(x), 0.0, 0.026) && Math.abs(x) >= 0.02) return NAVY_D;
    if (near(z, -0.09, 0.003) || near(z, 0.11, 0.003) || near(Math.abs(x), 0.115, 0.003)) return SEAM;
    return pale(p);
  }
  if (n.y < -0.7) return GUN;
  // sides: navy underlay with pale lower seam
  if (near(y, -0.1, 0.004)) return ORANGE_D;
  return y < -0.1 ? NAVY_D : NAVY;
});

const platePaint = paint((p, n) => {
  const y = p.y - HY;
  const z = p.z;
  if (Math.abs(n.x) < 0.7) return PALE_SH;
  if (y < -0.105) return NAVY_D;
  if (near(y, -0.1, 0.004)) return ORANGE;
  if (near(z, 0.125, 0.0025) || near(z, -0.075, 0.0025) || near(y, 0.0, 0.0025 * (z > 0.125 ? 1 : 0))) return SEAM;
  // orange blaze at the rear top corner
  if (z < -0.075 && y > 0.045) {
    if (near(y, 0.045, 0.004)) return ORANGE_D;
    return ORANGE;
  }
  if (z > 0.125 && y < 0.0) return PALE_SH;
  return mix(pale(p), PALE_SH, smoothstep(-0.0, -0.1, y) * 0.55);
});

const crestPaint = paint((p, n, s) => {
  const z = s[0];
  const y = s[1];
  if (Math.abs(n.x) < 0.5) return NAVY;
  if (y > 0.0 && near(y, 0.04, 0.005)) return SEAM;
  if (z < -0.12 && y > 0.05) return ORANGE;
  if (near(z, -0.12, 0.003)) return ORANGE_D;
  return pale(p);
});

const ventPaint = paint((p, n) => {
  if (n.y < 0.5) return NAVY_D;
  return fract(p.z / 0.03) < 0.35 ? NAVY : PALE;
});

const strikerPaint = paint((p, n) => {
  const x = p.x;
  const y = p.y - HY;
  const r = Math.hypot(x, y);
  if (n.z > 0.75 && p.z > 0.46) {
    if (near(r, 0.233, 0.008)) return ORANGE;
    if (r > 0.215) return STEEL_D;
    if (near(r, 0.178, 0.005)) return ORANGE;
    if (near(r, 0.194, 0.004)) return GUN;
    if (r < 0.165) {
      const u = fract((x + y) / 0.024);
      const v = fract((x - y) / 0.024);
      if (u < 0.12 || v < 0.12) return STEEL_D;
      return (Math.floor((x + y) / 0.024) + Math.floor((x - y) / 0.024)) % 2 === 0 ? STEEL_L : STEEL;
    }
    return STEEL;
  }
  // rim / sides
  if (near(p.z, 0.43, 0.01)) return ORANGE;
  if (p.z < 0.41) return GUN;
  return p.z > 0.455 ? STEEL_L : STEEL;
});

const bellPaint = paint((p) => {
  const d = -0.4 - p.z; // metres behind the throat
  const r = Math.hypot(p.x, p.y - HY);
  if (d > 0.245) return ORANGE; // lip
  if (d < 0.0) return GUN;
  if (r < 0.15 + d * 0.15 - 0.012 && d > 0.02) {
    // inner wall: heat-stained
    return d < 0.1 ? "#7a3410" : d < 0.18 ? "#4a2a22" : GUN_L;
  }
  return near(d, 0.12, 0.006) || near(d, 0.2, 0.006) ? STEEL_D : GUN;
});

const chamberPaint = paint((p, n) => {
  const d = -0.26 - p.z;
  if (Math.abs(n.z) > 0.7) return GUN;
  if (near(d, 0.035, 0.012) || near(d, 0.1, 0.012)) return ORANGE;
  const a = Math.atan2(p.x, p.y - HY);
  return fract(a / (Math.PI / 6) + 0.5) < 0.08 ? BLACK : d < 0.0 ? NAVY : GUN_L;
});

const podPaint = paint((p) => {
  const d = 0.17 - p.z;
  if (d < 0.1) return ORANGE;
  if (near(d, 0.1, 0.006)) return ORANGE_D;
  if (d > 0.05 && near(d, 0.205, 0.012)) return NAVY_D;
  if (near(d, 0.3, 0.007)) return ORANGE;
  return PALE;
});

const gripPaint = paint((p) => {
  const y = p.y;
  if (y < 0.425 || y > 0.835) return ORANGE;
  if (y > 0.6 && y < 0.67) {
    if (near(y, 0.635, 0.004)) return ORANGE;
    return near(y, 0.617, 0.002) || near(y, 0.653, 0.002) ? SEAM : PALE;
  }
  const a = Math.atan2(p.x, p.z);
  const u = fract((a / (Math.PI * 2)) * 8 + y / 0.045);
  const v = fract((a / (Math.PI * 2)) * 8 - y / 0.045);
  if (u < 0.16 || v < 0.16) return RUBBER_L;
  return RUBBER;
});

const tankPaint = paint((p) => {
  const y = p.y;
  if (y < 1.062 || y > 1.278) return ORANGE;
  if (near(y, 1.07, 0.006) || near(y, 1.27, 0.006)) return NAVY_D;
  if (near(y, 1.17, 0.003)) return SEAM;
  return pale(p);
});

const shaftPaint = paint((p) => (near(p.y, 1.37, 0.012) || near(p.y, 1.325, 0.006) ? ORANGE : fract(p.y / 0.06) < 0.12 ? GUN_L : GUN));

const baseWallPaint = paint((p, n) => {
  if (n.y > 0.5) return NAVY;
  const a = Math.atan2(p.x, p.z);
  return near(fract(a / (Math.PI / 4) + 0.5), 0.5, 0.02) ? ORANGE_D : NAVY_D;
});

const baseTopPaint = paint((p, n) => {
  const r = Math.hypot(p.x, p.z);
  if (n.y < 0.5) return NAVY_D;
  const a = Math.atan2(p.x, p.z);
  if (r > 0.335 && r < 0.4) return fract((a / Math.PI) * 12) < 0.5 ? ORANGE : NAVY_D;
  if (near(r, 0.32, 0.004)) return STEEL;
  if (r < 0.3) {
    // hex-ish deck seams
    if (near(fract(p.x / 0.1), 0.0, 0.02) || near(fract(p.z / 0.1), 0.0, 0.02)) return GUN_L;
    return GUN;
  }
  return GUN;
});

const housingPaint = paint((p, n) => {
  if (n.z > 0.7 && near(p.x, 0, 0.005)) return ORANGE;
  return n.y > 0.7 ? NAVY : near(p.y, 0.975, 0.004) ? ORANGE_D : PALE_SH;
});

// ---------------------------------------------------------------- textures
const GAUGE = svg(
  `<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#f4f1e6"/>
  <path d="M 50 50 L 17 77 A 48 48 0 0 1 8 56 Z" fill="#ffb02e" opacity="0"/>
  <path d="M 78 20 A 40 40 0 0 1 90 50" fill="none" stroke="#e5551a" stroke-width="9"/>
  <path d="M 20 78 A 40 40 0 0 1 12 55" fill="none" stroke="#2f4e86" stroke-width="9"/>
  ${[...Array(9)]
    .map((_, i) => {
      const a = (-135 + i * 33.75) * (Math.PI / 180);
      const x1 = 50 + Math.sin(a) * 33;
      const y1 = 50 - Math.cos(a) * 33;
      const x2 = 50 + Math.sin(a) * 42;
      const y2 = 50 - Math.cos(a) * 42;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#1a2233" stroke-width="3"/>`;
    })
    .join("")}
  <line x1="50" y1="50" x2="71" y2="29" stroke="#c4300c" stroke-width="5" stroke-linecap="round"/>
  <circle cx="50" cy="50" r="9" fill="#243249"/>
  <circle cx="50" cy="50" r="3.5" fill="#ff7a14"/>
  <rect x="38" y="66" width="24" height="9" rx="3" fill="#243249"/>
  </svg>`,
  { size: 192 },
);

const CHEVRONS = svg(
  `<svg viewBox="0 0 120 20"><rect width="120" height="20" fill="#161f30"/>
  ${[...Array(10)]
    .map((_, i) => `<polygon points="${i * 12 - 4},20 ${i * 12 + 2},20 ${i * 12 + 12},0 ${i * 12 + 6},0" fill="#ff7a14"/>`)
    .join("")}
  <rect width="120" height="2.2" fill="#e9eef3"/><rect y="17.8" width="120" height="2.2" fill="#e9eef3"/>
  </svg>`,
  { size: 512 },
);

const PLAQUE = svg(
  `<svg viewBox="0 0 120 24"><rect width="120" height="24" rx="3" fill="#161f30"/>
  <rect x="1.5" y="1.5" width="117" height="21" rx="2.5" fill="none" stroke="#ff7a14" stroke-width="1.6"/>
  <g transform="translate(10 12) rotate(45)">
    <path d="M -9 -2.2 L 3 -2.2 L 9 0 L 3 2.2 L -9 2.2 Z" fill="#e9eef3"/>
    <path d="M -9 -2.2 L -13 -4.5 L -13 4.5 L -9 2.2 Z" fill="#ff7a14"/>
    <circle cx="0" cy="0" r="1.1" fill="#243249"/>
  </g>
  <rect x="26" y="6" width="58" height="3.2" fill="#e9eef3"/>
  <rect x="26" y="11.2" width="40" height="2.4" fill="#8696ab"/>
  <rect x="26" y="15.6" width="48" height="2.4" fill="#8696ab"/>
  <rect x="92" y="5" width="3" height="14" fill="#ff7a14"/><rect x="98" y="5" width="3" height="14" fill="#ff7a14"/><rect x="104" y="5" width="3" height="14" fill="#ff7a14"/>
  </svg>`,
  { size: 512 },
);

const WARN = svg(
  `<svg viewBox="0 0 40 40"><polygon points="20,3 38,35 2,35" fill="#ff7a14" stroke="#161f30" stroke-width="3" stroke-linejoin="round"/>
  <rect x="18" y="14" width="4" height="12" rx="1" fill="#161f30"/><rect x="18" y="28" width="4" height="4" rx="1" fill="#161f30"/></svg>`,
  { size: 160 },
);

export default function build() {
  const b = createBuilder({ name: "rocketHammer", paintSize: 2048 });

  // ---------------------------------------------------------------- skeleton
  const stand = b.joint("stand", { at: [0, 0.05, 0], dir: [0, 1, 0] });
  const H = b.joint("hammer", { parent: stand, at: [0, 0.25, 0], dir: [0, 1, 0] });
  const trigger = b.joint("trigger", { parent: H, at: [0, 0.995, 0.062], dir: [0, -1, 0.35], role: "hinge" });
  const safety = b.joint("safety", { parent: H, at: [0.032, 0.99, 0.0], dir: [0, 0, 1], role: "hinge" });
  const valve = b.joint("valve", { parent: H, at: [0.098, 1.17, 0], dir: [1, 0, 0], role: "hinge" });
  const nozzle = b.joint("nozzle", { parent: H, at: [0, HY, -0.4], dir: [0, 0, -1], role: "hinge" });
  const ventL = b.joint("ventL", { parent: H, at: [0.085, HY + 0.18, -0.205], dir: [0, 0, 1], role: "hinge" });
  const ventR = b.joint("ventR", { parent: H, at: [-0.085, HY + 0.18, -0.205], dir: [0, 0, 1], role: "hinge" });
  const strap = b.joint("strap", { parent: H, at: [0.07, 0.37, 0], dir: [1, -0.4, 0], role: "hinge" });

  type Opt = Record<string, unknown>;
  const put = (geo: THREE.BufferGeometry, color: string | Paint, at: [number, number, number], o: Opt = {}) =>
    b.part(geo, color, { bone: H, at, ...o });
  const lat = (outline: OutlinePoint[], color: string | Paint, at: [number, number, number], o: Opt = {}) =>
    b.lathe(outline, { bone: H, color, at, ...o });

  // bolts: merged per colour
  const boltGeos: Record<string, THREE.BufferGeometry[]> = {};
  let boltOwner = "stand|";
  const bolt = (color: string, pos: [number, number, number], dir: [number, number, number], r = 0.008) => {
    const g = new THREE.CylinderGeometry(r, r * 1.08, r * 0.8, 6);
    g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...pos), aim(dir), new THREE.Vector3(1, 1, 1)));
    (boltGeos[boltOwner + color] ??= []).push(g);
  };

  // ---------------------------------------------------------------- display stand
  lat(
    [
      [0, 0],
      [0.5, 0],
      [0.5, 0.075],
      [0.46, 0.095],
      [0, 0.095],
    ],
    baseWallPaint,
    [0, 0, 0],
    { bone: stand, segments: 8, spin: 22.5, name: "baseTier1" },
  );
  lat(
    [
      [0, 0.095],
      [0.41, 0.095],
      [0.41, 0.112],
      [0.385, 0.128],
      [0, 0.128],
    ],
    baseTopPaint,
    [0, 0, 0],
    { bone: stand, segments: 16, name: "baseTier2" },
  );
  glow(
    lat(
      [
        [0.3, 0.126],
        [0.314, 0.126],
        [0.314, 0.1325],
        [0.3, 0.1325],
      ],
      ORANGE,
      [0, 0, 0],
      { bone: stand, segments: 32, name: "baseGlowRing" },
    ),
    1.1,
  );
  // pedestal cup
  lat(
    [
      [0, 0.128],
      [0.15, 0.128],
      [0.125, 0.15],
      [0.1, 0.205],
      [0.12, 0.215],
      [0.12, 0.25],
      [0.075, 0.255],
      [0.07, 0.232],
      [0, 0.232],
    ],
    paint((p) => (p.y > 0.21 ? STEEL : p.y < 0.15 ? NAVY_D : GUN)),
    [0, 0, 0],
    { bone: stand, segments: 12, name: "pedestal" },
  );
  // four clamp arms holding the pommel
  for (let k = 0; k < 4; k++) {
    const a = (45 + k * 90) * (Math.PI / 180);
    const radial: [number, number, number] = [Math.sin(a), 0, Math.cos(a)];
    b.extrude(
      [
        [0.1, 0.2],
        [0.15, 0.2],
        [0.15, 0.285],
        [0.12, 0.3],
        [0.098, 0.27],
      ],
      { at: [0, 0, 0], x: radial, y: [0, 1, 0], thickness: 0.026, bevel: 0.005, color: STEEL_D, bone: stand, name: "clampArm" },
    );
    bolt(ORANGE, [radial[0] * 0.152, 0.26, radial[2] * 0.152], radial, 0.011);
    b.part(new THREE.SphereGeometry(0.014, 6, 4), ORANGE, {
      bone: stand,
      at: [radial[0] * 0.125, 0.298, radial[2] * 0.125],
      name: "clampPad",
    });
  }
  // deck bolts
  for (let k = 0; k < 8; k++) {
    const a = (k * 45 + 22.5) * (Math.PI / 180);
    const bg = new THREE.CylinderGeometry(0.012, 0.013, 0.008, 6);
    bg.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(Math.sin(a) * 0.435, 0.099, Math.cos(a) * 0.435), aim([0, 1, 0]), new THREE.Vector3(1, 1, 1)));
    (boltGeos[boltOwner + (k % 2 ? ORANGE : STEEL_L)] ??= []).push(bg);
  }
  // plaque
  b.part(new THREE.PlaneGeometry(0.3, 0.06), "#ffffff", {
    bone: stand,
    at: [0, 0.04, 0.4625],
    dir: [0, 0, 1],
    axis: "z",
    texture: PLAQUE,
    name: "plaque",
  });
  b.part(new THREE.PlaneGeometry(0.05, 0.05), "#ffffff", {
    bone: stand,
    at: [0.24, 0.04, 0.422],
    dir: [Math.sin(Math.PI / 4) * 0.55, 0, 0.84],
    axis: "z",
    texture: WARN,
    name: "warnL",
  });
  b.part(new THREE.PlaneGeometry(0.05, 0.05), "#ffffff", {
    bone: stand,
    at: [-0.24, 0.04, 0.422],
    dir: [-Math.sin(Math.PI / 4) * 0.55, 0, 0.84],
    axis: "z",
    texture: WARN,
    name: "warnR",
  });

  // ---------------------------------------------------------------- haft
  boltOwner = "hammer|";
  // pommel + butt
  lat(
    [
      [0, 0.245],
      [0.042, 0.245],
      [0.062, 0.262],
      [0.064, 0.3],
      [0.084, 0.33],
      [0.09, 0.372],
      [0.07, 0.398],
      [0, 0.398],
    ],
    paint((p) => (near(p.y, 0.32, 0.007) || near(p.y, 0.378, 0.006) ? ORANGE : p.y < 0.275 ? GUN : NAVY)),
    [0, 0, 0],
    { segments: 10, name: "pommel" },
  );
  // grip
  lat(
    [
      [0, 0.398],
      [0.056, 0.398],
      [0.056, 0.42],
      [0.048, 0.436],
      [0.048, 0.598],
      [0.056, 0.606],
      [0.056, 0.664],
      [0.048, 0.672],
      [0.048, 0.826],
      [0.056, 0.842],
      [0.056, 0.862],
      [0, 0.862],
    ],
    gripPaint,
    [0, 0, 0],
    { segments: 12, name: "grip" },
  );
  // hand-stop guard
  lat(
    [
      [0, 0.858],
      [0.115, 0.858],
      [0.122, 0.874],
      [0.116, 0.898],
      [0.075, 0.918],
      [0, 0.918],
    ],
    paint((p, n) => (n.y > 0.6 ? (Math.hypot(p.x, p.z) > 0.1 ? ORANGE : PALE) : near(p.y, 0.878, 0.007) ? ORANGE_D : NAVY)),
    [0, 0, 0],
    { segments: 8, spin: 22.5, name: "guard" },
  );
  // upper shaft
  lat(
    [
      [0, 0.905],
      [0.044, 0.905],
      [0.044, 1.43],
      [0, 1.43],
    ],
    shaftPaint,
    [0, 0, 0],
    { segments: 10, name: "shaft" },
  );
  // trigger housing
  put(rbox(0.08, 0.08, 0.07, 0.012), housingPaint, [0, 0.968, 0.062], { name: "triggerHousing" });
  put(rbox(0.1, 0.028, 0.1, 0.01), NAVY, [0, 0.93, 0.0], { name: "housingCollar" });
  bolt(ORANGE, [0.0, 0.968, 0.0985], [0, 0, 1], 0.011);
  bolt(STEEL_L, [0.041, 0.99, 0.062], [1, 0, 0], 0.008);
  bolt(STEEL_L, [-0.041, 0.99, 0.062], [-1, 0, 0], 0.008);
  // trigger guard
  b.sweep(
    catmull([
      [0, 1.002, 0.098],
      [0, 0.975, 0.142],
      [0, 0.935, 0.136],
      [0, 0.915, 0.09],
      [0, 0.915, 0.04],
    ]),
    0.0095,
    { bone: H, color: NAVY, sides: 6, name: "triggerGuard" },
  );
  // trigger lever (hinged)
  b.extrude(
    [
      [0, 0.012],
      [0.02, 0.0],
      [0.034, -0.045],
      [0.048, -0.08],
      [0.032, -0.084],
      [0.012, -0.05],
      [-0.006, -0.012],
    ],
    {
      at: [0, 0.995, 0.078],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.003,
      smoothing: 1,
      color: ORANGE,
      bone: trigger,
      name: "triggerLever",
    },
  );
  // safety toggle
  b.rod([0.042, 0.99, 0.02], [0.082, 0.99, 0.05], 0.0065, { bone: safety, color: STEEL, sides: 6, name: "safetyLever" });
  b.part(new THREE.SphereGeometry(0.012, 6, 4), ORANGE, { bone: safety, at: [0.084, 0.99, 0.052], name: "safetyKnob" });
  put(new THREE.CylinderGeometry(0.013, 0.013, 0.01, 8), GUN, [0.042, 0.99, 0.02], { dir: [1, 0, 0], name: "safetyBoss" });

  // fuel tank
  lat(
    [
      [0, 1.04],
      [0.082, 1.04],
      [0.1, 1.058],
      [0.106, 1.078],
      [0.106, 1.262],
      [0.1, 1.282],
      [0.082, 1.3],
      [0, 1.3],
    ],
    tankPaint,
    [0, 0, 0],
    { segments: 12, name: "fuelTank" },
  );
  for (const y of [1.075, 1.265]) {
    lat(
      [
        [0.104, y - 0.01],
        [0.114, y - 0.01],
        [0.114, y + 0.01],
        [0.104, y + 0.01],
      ],
      NAVY_D,
      [0, 0, 0],
      { segments: 12, name: "tankStrap" },
    );
  }
  // windows front/back with glowing fuel bars
  for (const s of [1, -1]) {
    put(rbox(0.046, 0.2, 0.014, 0.004), NAVY_D, [0, 1.17, s * 0.103], { name: "gaugeFrame" });
    for (let i = 0; i < 6; i++) {
      const lit = i >= 2;
      const bar = put(rbox(0.034, 0.025, 0.006, 0.002), lit ? ORANGE : RUBBER_L, [0, 1.095 + i * 0.0325, s * 0.1095], { name: "fuelBar" });
      if (lit) glow(bar, 1.3);
    }
    put(rbox(0.012, 0.012, 0.004, 0.001), ORANGE_D, [0.03, 1.27, s * 0.1085], { name: "tankTick" });
    put(rbox(0.012, 0.012, 0.004, 0.001), ORANGE_D, [-0.03, 1.27, s * 0.1085], { name: "tankTick" });
  }
  // valve handwheel (spins on its joint)
  b.rod([0.1, 1.17, 0], [0.128, 1.17, 0], 0.012, { bone: H, color: STEEL_D, sides: 6, name: "valveStem" });
  b.part(new THREE.TorusGeometry(0.04, 0.0065, 5, 10), ORANGE, { bone: valve, at: [0.134, 1.17, 0], dir: [1, 0, 0], axis: "z", name: "valveRing" });
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.018, 8), STEEL, { bone: valve, at: [0.134, 1.17, 0], dir: [1, 0, 0], name: "valveHub" });
  for (let k = 0; k < 3; k++) {
    const a = (k * 60 + 15) * (Math.PI / 180);
    b.rod(
      [0.134, 1.17 + Math.cos(a) * 0.038, Math.sin(a) * 0.038],
      [0.134, 1.17 - Math.cos(a) * 0.038, -Math.sin(a) * 0.038],
      0.005,
      { bone: valve, color: ORANGE_D, sides: 5, name: "valveSpoke" },
    );
  }
  // upper collar rings
  lat(
    [
      [0.042, 1.316],
      [0.064, 1.316],
      [0.064, 1.332],
      [0.042, 1.332],
    ],
    NAVY,
    [0, 0, 0],
    { segments: 10, name: "shaftRing" },
  );
  lat(
    [
      [0.042, 1.352],
      [0.062, 1.352],
      [0.07, 1.372],
      [0.062, 1.392],
      [0.042, 1.392],
    ],
    paint((p) => (near(p.y, 1.372, 0.006) ? ORANGE : STEEL_D)),
    [0, 0, 0],
    { segments: 10, name: "shaftCollar" },
  );
  lat(
    [
      [0, 1.4],
      [0.08, 1.4],
      [0.105, 1.418],
      [0.105, 1.436],
      [0, 1.436],
    ],
    NAVY,
    [0, 0, 0],
    { segments: 8, spin: 22.5, name: "headSocket" },
  );
  // braces from haft collar to head
  for (let k = 0; k < 4; k++) {
    const a = k * 90 * (Math.PI / 180);
    b.extrude(
      [
        [0.07, 1.41],
        [0.16, 1.435],
        [0.07, 1.436],
      ],
      { at: [0, 0, 0], x: [Math.sin(a), 0, Math.cos(a)], y: [0, 1, 0], thickness: 0.02, bevel: 0.003, color: ORANGE, bone: H, name: "brace" },
    );
  }

  // hoses
  const hose = (pts: number[][], r = 0.015) => {
    const path = catmull(pts);
    const len = path.length;
    b.sweep(path, r, {
      bone: H,
      sides: 6,
      caps: "flat",
      color: paint((_p, _n, s) => (Math.floor((s[0] * len) / 0.011) % 2 ? RUBBER_L : RUBBER)),
      name: "hose",
    });
    for (const t of [0, 1]) {
      const at = path.at(t);
      const dir = path.tangentAt(t);
      put(new THREE.CylinderGeometry(r * 1.45, r * 1.45, 0.026, 8), ORANGE, [at.x, at.y, at.z], { dir: [dir.x, dir.y, dir.z], name: "hoseFitting" });
    }
  };
  hose([
    [0, 1.3, -0.03],
    [0, 1.36, -0.11],
    [0, 1.43, -0.2],
    [0, 1.468, -0.3],
  ]);
  for (const s of [1, -1]) {
    hose([
      [s * 0.074, 1.288, -0.04],
      [s * 0.12, 1.335, -0.07],
      [s * 0.2, 1.4, -0.12],
      [s * 0.258, 1.484, -0.12],
    ]);
  }

  // ---------------------------------------------------------------- head
  put(rbox(0.34, 0.34, 0.5, 0.03, 2), headPaint, [0, HY, 0], { name: "headCore" });
  // front & back plates
  put(rbox(0.3, 0.3, 0.03, 0.01), NAVY_D, [0, HY, 0.265], { name: "frontPlate" });
  put(rbox(0.3, 0.3, 0.03, 0.01), NAVY_D, [0, HY, -0.265], { name: "backPlate" });
  // front frame trim
  put(rbox(0.352, 0.036, 0.044, 0.008), PALE, [0, HY + 0.148, 0.24], { name: "frontTrimTop" });
  put(rbox(0.352, 0.036, 0.044, 0.008), NAVY, [0, HY - 0.148, 0.24], { name: "frontTrimBottom" });
  for (const s of [1, -1]) {
    put(rbox(0.036, 0.28, 0.044, 0.008), PALE_SH, [s * 0.158, HY, 0.24], { name: "frontTrimSide" });
    put(rbox(0.032, 0.30, 0.04, 0.008), NAVY, [s * 0.16, HY, -0.24], { name: "backTrimSide" });
  }
  // side armour plates
  for (const s of [1, -1]) {
    put(rbox(0.024, 0.3, 0.42, 0.007), platePaint, [s * 0.18, HY, 0.0], { name: "sidePlate" });
    // gauge
    lat(
      [
        [0.04, 0.0],
        [0.054, 0.0],
        [0.054, 0.013],
        [0.04, 0.013],
      ],
      STEEL_D,
      [s * 0.19, HY + 0.06, 0.04],
      { axis: [s, 0, 0], segments: 12, name: "gaugeBezel" },
    );
    b.part(new THREE.CircleGeometry(0.041, 14), "#ffffff", {
      bone: H,
      at: [s * 0.1925, HY + 0.06, 0.04],
      dir: [s, 0, 0],
      axis: "z",
      up: [0, 1, 0],
      texture: GAUGE,
      name: "gaugeDial",
    });
    // chevron strip
    b.part(new THREE.PlaneGeometry(0.22, 0.037), "#ffffff", {
      bone: H,
      at: [s * 0.1925, HY - 0.128, 0.0],
      dir: [s, 0, 0],
      axis: "z",
      up: [0, 1, 0],
      texture: CHEVRONS,
      name: "chevronStrip",
    });
    // status lights
    for (let i = 0; i < 3; i++) {
      const l = put(rbox(0.004, 0.016, 0.016, 0.0015), i === 2 ? HOT : ORANGE, [s * 0.1935, HY - 0.02, 0.1 + i * 0.03 - 0.0], {
        name: "statusLight",
      });
      glow(l, 1.2);
    }
    // plate bolts
    for (const [z, y] of [
      [0.19, 0.13],
      [0.19, -0.075],
      [-0.19, 0.13],
      [-0.19, -0.075],
      [0.0, 0.13],
      [0.0, -0.075],
    ] as const) {
      bolt(STEEL_L, [s * 0.192, HY + y, z], [s, 0, 0], 0.0075);
    }
    // pod clamp arms (plate to pod)
    for (const z of [-0.1, 0.07]) {
      put(rbox(0.07, 0.04, 0.034, 0.008), NAVY, [s * 0.226, HY - 0.05, z], { name: "podArm" });
    }
  }

  // top deck: intake grille, vents, crest
  put(rbox(0.2, 0.006, 0.19, 0.002), BLACK, [0, HY + 0.172, -0.115], { name: "intake" });
  for (const [s, j] of [
    [1, ventL],
    [-1, ventR],
  ] as const) {
    put(rbox(0.1, 0.012, 0.17, 0.004), ventPaint, [s * 0.085, HY + 0.186, -0.12], { bone: j, name: "ventFlap" });
    put(rbox(0.1, 0.01, 0.014, 0.003), ORANGE, [s * 0.085, HY + 0.18, -0.2], { bone: j, name: "ventHinge" });
  }
  b.extrude(
    [
      [0.22, 0.0],
      [0.17, 0.05],
      [0.02, 0.09],
      [-0.1, 0.19, "sharp"],
      [-0.24, 0.21, "sharp"],
      [-0.25, 0.0],
    ],
    { at: [0, HY + 0.166, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.032, bevel: 0.006, color: crestPaint, bone: H, name: "crest" },
  );
  glow(put(new THREE.SphereGeometry(0.018, 6, 4), ORANGE, [0, HY + 0.18, 0.2], { name: "crestLens" }), 1.4);
  put(rbox(0.04, 0.014, 0.05, 0.004), NAVY_D, [0, HY + 0.173, 0.2], { name: "lensMount" });
  // underside skid plates
  put(rbox(0.2, 0.012, 0.36, 0.004), GUN_L, [0, HY - 0.176, 0.0], { name: "skid" });
  put(rbox(0.3, 0.014, 0.1, 0.005), ORANGE_D, [0, HY - 0.176, 0.2], { name: "skidFront" });

  // fuel filler cap + relief valve on the top deck
  lat(
    [
      [0, 0],
      [0.05, 0],
      [0.05, 0.01],
      [0.04, 0.02],
      [0.04, 0.026],
      [0, 0.026],
    ],
    paint((p, n) => (n.y > 0.8 ? (near(Math.hypot(p.x - 0.1, p.z - 0.1), 0.0, 0.012) ? STEEL_L : ORANGE) : NAVY)),
    [0.1, HY + 0.17, 0.1],
    { segments: 10, name: "fillerCap" },
  );
  put(rbox(0.07, 0.01, 0.014, 0.003), STEEL_D, [0.1, HY + 0.2, 0.1], { name: "capHandle" });
  lat(
    [
      [0, 0],
      [0.034, 0],
      [0.034, 0.012],
      [0.022, 0.03],
      [0.0, 0.034],
    ],
    paint((p, n) => (n.y > 0.5 ? STEEL_L : near(p.y, HY + 0.178, 0.004) ? ORANGE : GUN)),
    [-0.1, HY + 0.17, 0.1],
    { segments: 8, name: "reliefValve" },
  );
  for (const s of [1, -1]) {
    // plate vents + warning decal
    const slits = [0, 1, 2, 3].map((i) => new THREE.BoxGeometry(0.004, 0.03, 0.012).translate(s * 0.1935, HY - 0.128, -0.19 + i * 0.022));
    b.part(mergeGeometries(slits)!, BLACK, { bone: H, at: [0, 0, 0], name: "plateVents" });
    b.part(new THREE.PlaneGeometry(0.036, 0.036), "#ffffff", {
      bone: H,
      at: [s * 0.1925, HY - 0.128, 0.162],
      dir: [s, 0, 0],
      axis: "z",
      up: [0, 1, 0],
      texture: WARN,
      name: "plateWarn",
    });
  }

  // spare fuel cells on the display deck
  for (const s of [1, -1]) {
    const cx = s * 0.27;
    const cz = -0.27;
    lat(
      [
        [0, 0],
        [0.05, 0],
        [0.06, 0.012],
        [0.06, 0.2],
        [0.052, 0.216],
        [0.032, 0.226],
        [0.032, 0.248],
        [0, 0.248],
      ],
      paint((p) => {
        const y = p.y - 0.128;
        if (y < 0.03 || y > 0.186) return ORANGE;
        if (near(y, 0.04, 0.006) || near(y, 0.176, 0.006)) return NAVY_D;
        return PALE;
      }),
      [cx, 0.128, cz],
      { bone: stand, segments: 10, name: "fuelCell" },
    );
    put(rbox(0.026, 0.09, 0.012, 0.003), NAVY_D, [cx, 0.128 + 0.108, cz + 0.06], { bone: stand, name: "cellWindow" });
    glow(put(rbox(0.018, 0.07, 0.006, 0.002), AMBER, [cx, 0.128 + 0.102, cz + 0.0645], { bone: stand, name: "cellGlow" }), 1.2);
    b.sweep(
      catmull([
        [cx - 0.03, 0.128 + 0.255, cz],
        [cx, 0.128 + 0.29, cz],
        [cx + 0.03, 0.128 + 0.255, cz],
      ]),
      0.0055,
      { bone: stand, color: STEEL, sides: 5, name: "cellHandle" },
    );
    put(new THREE.CylinderGeometry(0.066, 0.066, 0.016, 10), NAVY, [cx, 0.128 + 0.012, cz], { bone: stand, name: "cellBase" });
    // feed line across the deck toward the pedestal
    const feed = catmull([
      [cx * 0.86, 0.147, cz * 0.86],
      [cx * 0.7 + s * 0.02, 0.141, cz * 0.7],
      [cx * 0.5 - s * 0.02, 0.141, cz * 0.5],
      [cx * 0.4, 0.15, cz * 0.4],
    ]);
    b.sweep(feed, 0.0095, { bone: stand, sides: 6, caps: "flat", color: RUBBER_L, name: "feedLine" });
    for (const t of [0, 1]) {
      const at = feed.at(t);
      const dir = feed.tangentAt(t);
      put(new THREE.CylinderGeometry(0.0145, 0.0145, 0.02, 8), ORANGE, [at.x, at.y, at.z], { bone: stand, dir: [dir.x, dir.y, dir.z], name: "feedFitting" });
    }
  }

  // piston striker -----------------------------------------------------
  lat(
    [
      [0, 0.28],
      [0.16, 0.28],
      [0.165, 0.295],
      [0.15, 0.31],
      [0.0, 0.31],
    ],
    NAVY,
    [0, HY, 0],
    { axis: [0, 0, 1], segments: 12, name: "strikerCollar" },
  );
  // bellows
  const bellows: OutlinePoint[] = [[0, 0.31]];
  for (let i = 0; i < 6; i++) {
    bellows.push([0.1, 0.31 + i * 0.016 + 0.002]);
    bellows.push([0.118, 0.31 + i * 0.016 + 0.01]);
  }
  bellows.push([0.1, 0.406], [0, 0.406]);
  lat(bellows, RUBBER, [0, HY, 0], { axis: [0, 0, 1], segments: 10, name: "bellows" });
  lat(
    [
      [0, 0.4],
      [0.222, 0.4],
      [0.25, 0.418],
      [0.25, 0.462],
      [0.228, 0.488],
      [0, 0.488],
    ],
    strikerPaint,
    [0, HY, 0],
    { axis: [0, 0, 1], segments: 16, name: "striker" },
  );
  // face boss
  lat(
    [
      [0, 0.486],
      [0.05, 0.486],
      [0.045, 0.5],
      [0, 0.508],
    ],
    ORANGE,
    [0, HY, 0],
    { axis: [0, 0, 1], segments: 8, name: "faceBoss" },
  );
  // shock rods
  for (const sx of [1, -1])
    for (const sy of [1, -1]) {
      b.rod([sx * 0.12, HY + sy * 0.12, 0.29], [sx * 0.12, HY + sy * 0.12, 0.41], 0.012, { bone: H, color: STEEL_L, sides: 6, name: "shockRod" });
      put(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 8), ORANGE_D, [sx * 0.12, HY + sy * 0.12, 0.345], { dir: [0, 0, 1], name: "shockCollar" });
    }
  // striker rim bolts
  for (let k = 0; k < 12; k++) {
    const a = (k * 30 + 15) * (Math.PI / 180);
    bolt(STEEL_L, [Math.sin(a) * 0.24, HY + Math.cos(a) * 0.24, 0.442], [Math.sin(a), Math.cos(a), 0], 0.0075);
  }

  // rear thruster ------------------------------------------------------
  lat(
    [
      [0, 0.0],
      [0.14, 0.0],
      [0.155, 0.02],
      [0.155, 0.1],
      [0.14, 0.125],
      [0.1, 0.14],
      [0, 0.14],
    ],
    chamberPaint,
    [0, HY, -0.26],
    { axis: [0, 0, -1], segments: 12, name: "chamber" },
  );
  // bell nozzle on gimbal
  lat(
    [
      [0.085, 0.0],
      [0.1, 0.05],
      [0.135, 0.12],
      [0.17, 0.2],
      [0.19, 0.26],
      [0.19, 0.275],
      [0.175, 0.275],
      [0.156, 0.2],
      [0.12, 0.12],
      [0.092, 0.05],
      [0.075, 0.0],
    ],
    bellPaint,
    [0, HY, -0.4],
    { axis: [0, 0, -1], bone: nozzle, segments: 16, name: "bell" },
  );
  glow(
    lat(
      [
        [0, 0.06],
        [0.092, 0.06],
        [0.092, 0.068],
        [0, 0.068],
      ],
      AMBER,
      [0, HY, -0.4],
      { axis: [0, 0, -1], bone: nozzle, segments: 10, name: "throatGlow" },
    ),
    1.5,
  );
  for (let k = 0; k < 8; k++) {
    const a = (k * 45 + 22.5) * (Math.PI / 180);
    b.extrude(
      [
        [0.04, 0.09],
        [0.09, 0.145],
        [0.16, 0.19],
        [0.26, 0.212],
        [0.26, 0.185],
        [0.2, 0.17],
        [0.12, 0.125],
      ],
      { at: [0, HY, -0.4], x: [0, 0, -1], y: [Math.sin(a), Math.cos(a), 0], thickness: 0.011, color: k % 2 ? GUN_L : NAVY, bone: nozzle, name: "bellFin" },
    );
  }
  // gimbal ring between chamber and bell
  lat(
    [
      [0.09, -0.02],
      [0.13, -0.02],
      [0.13, 0.014],
      [0.09, 0.014],
    ],
    paint((p) => (near(-0.4 - p.z, -0.003, 0.008) ? ORANGE : STEEL_D)),
    [0, HY, -0.4],
    { axis: [0, 0, -1], bone: nozzle, segments: 12, name: "gimbalRing" },
  );
  for (const s of [1, -1]) {
    put(rbox(0.05, 0.04, 0.05, 0.008), NAVY, [s * 0.142, HY, -0.4], { bone: H, name: "gimbalLug" });
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.05, 8), ORANGE, { bone: nozzle, at: [s * 0.142, HY, -0.4], dir: [1, 0, 0], name: "gimbalPin" });
  }
  // flame: layered teardrop sweeps
  const FZ = -0.4;
  const flame = (z0: number, z1: number, radii: number[], color: string, strength: number, name: string) =>
    glow(
      b.sweep(
        [
          [0, HY, z0],
          [0, HY, z1],
        ],
        radii,
        { bone: nozzle, color, sides: 8, caps: { start: "flat", end: "point" }, name },
      ),
      strength,
    );
  flame(FZ - 0.12, FZ - 0.84, [0.07, 0.15, 0.165, 0.13, 0.09, 0.05, 0.02, 0.0], "#f05a0a", 1, "flameOuter");
  flame(FZ - 0.1, FZ - 0.64, [0.05, 0.1, 0.105, 0.085, 0.055, 0.025, 0.0], AMBER, 1, "flameMid");
  flame(FZ - 0.1, FZ - 0.44, [0.03, 0.06, 0.055, 0.035, 0.0], HOT, 1.2, "flameCore");
  for (let k = 0; k < 7; k++) {
    const a = (k * 51.4 + 10) * (Math.PI / 180);
    const r0 = 0.15;
    const s0 = [Math.sin(a), Math.cos(a)];
    glow(
      b.sweep(
        catmull([
          [s0[0] * r0, HY + s0[1] * r0, FZ - 0.24],
          [s0[0] * (r0 + 0.07), HY + s0[1] * (r0 + 0.07), FZ - 0.5],
          [s0[0] * (r0 + 0.03), HY + s0[1] * (r0 + 0.03), FZ - 0.86],
        ]),
        [0.03, 0.0],
        { bone: nozzle, color: k % 2 ? YELLOW : "#ff6a10", sides: 5, caps: { start: "flat", end: "point" }, name: "flameLick" },
      ),
      1,
    );
  }

  // booster pods -------------------------------------------------------
  for (const s of [1, -1]) {
    const px = s * 0.262;
    const py = HY - 0.05;
    lat(
      [
        [0, 0],
        [0.03, 0.012],
        [0.05, 0.05],
        [0.06, 0.1],
        [0.06, 0.3],
        [0.052, 0.34],
        [0, 0.34],
      ],
      podPaint,
      [px, py, 0.17],
      { axis: [0, 0, -1], segments: 10, name: "pod" },
    );
    lat(
      [
        [0.032, 0.33],
        [0.048, 0.38],
        [0.066, 0.425],
        [0.058, 0.425],
        [0.042, 0.38],
        [0.026, 0.33],
      ],
      GUN,
      [px, py, 0.17],
      { axis: [0, 0, -1], segments: 10, name: "podBell" },
    );
    glow(
      lat(
        [
          [0, 0.37],
          [0.04, 0.37],
          [0.04, 0.376],
          [0, 0.376],
        ],
        AMBER,
        [px, py, 0.17],
        { axis: [0, 0, -1], segments: 8, name: "podThroat" },
      ),
      1.4,
    );
    for (const d of [0.09, 0.205]) {
      lat(
        [
          [0.058, d - 0.016],
          [0.07, d - 0.016],
          [0.07, d + 0.016],
          [0.058, d + 0.016],
        ],
        NAVY,
        [px, py, 0.17],
        { axis: [0, 0, -1], segments: 10, name: "podClamp" },
      );
      bolt(ORANGE, [px + s * 0.07, py, 0.17 - d], [s, 0, 0], 0.008);
    }
    for (const [len, radii, color, name] of [
      [0.3, [0.045, 0.058, 0.04, 0.015, 0], "#e8480a", "podFlameOuter"],
      [0.2, [0.026, 0.036, 0.024, 0.008, 0], AMBER, "podFlameCore"],
    ] as const)
      glow(
        b.sweep(
          [
            [px, py, 0.17 - 0.39],
            [px, py, 0.17 - 0.39 - len],
          ],
          [...radii],
          { bone: H, color, sides: 6, caps: { start: "flat", end: "point" }, name },
        ),
        1,
      );
    put(new THREE.SphereGeometry(0.012, 6, 4), HOT, [px, py, 0.17 + 0.004], { name: "podNoseTip" });
    // stabiliser fins on the pod tail
    for (let k = 0; k < 4; k++) {
      const a = (k * 90 + 45) * (Math.PI / 180);
      b.extrude(
        [
          [0.2, 0.055],
          [0.33, 0.055],
          [0.375, 0.108],
          [0.3, 0.1],
        ],
        { at: [px, py, 0.17], x: [0, 0, -1], y: [Math.sin(a), Math.cos(a), 0], thickness: 0.008, bevel: 0.002, color: k % 2 ? ORANGE_D : NAVY, bone: H, name: "podFin" },
      );
    }
  }

  // ---------------------------------------------------------------- wrist strap + tassel
  b.sweep(
    catmull([
      [0.05, 0.372, 0.0],
      [0.1, 0.36, 0.012],
      [0.135, 0.32, 0.02],
      [0.115, 0.28, 0.012],
      [0.072, 0.292, 0.0],
    ]),
    [0.011, 0.0035],
    { bone: strap, section: "box", color: ORANGE, caps: "flat", name: "strap" },
  );
  put(rbox(0.028, 0.022, 0.03, 0.005), NAVY, [0.052, 0.374, 0], { bone: strap, name: "strapEye" });
  for (let k = 0; k < 3; k++) {
    b.spike([0.11, 0.27, k * 0.014 - 0.014], [0.2 * (k - 1) * 0.1, -1, 0], 0.07, 0.01, { bone: strap, color: k === 1 ? PALE : ORANGE, sides: 5, name: "tassel" });
  }
  put(new THREE.SphereGeometry(0.014, 6, 4), PALE_SH, [0.11, 0.275, 0], { bone: strap, name: "tasselKnot" });

  // ---------------------------------------------------------------- bolts flush
  for (const [key, geos] of Object.entries(boltGeos)) {
    const [owner, color] = key.split("|");
    const merged = mergeGeometries(geos);
    if (!merged) throw new Error("bolt merge failed");
    b.part(merged, color, { bone: owner === "stand" ? stand : H, at: [0, 0, 0], flat: true, name: "bolts" });
  }

  return b.root;
}
```

## Example: runeGreatswordSonnet

Brief: Category: Fantasy weapon.
Subject: blue-steel greatsword in a carved stone shrine with gold fuller, glowing runes, winged guard, ribbon, crystals, moss and rubble.
Style: Blizzard/Warcraft.
Topology: prop-weapon
Style family: blizzard-warcraft
Notable features: blade, runes, crossguard, standing-stone, crystals

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";
import { frame } from "agentic-3js-builder";
import type { Frame } from "agentic-3js-builder";
import type { PartOptions } from "agentic-3js-builder";
import { DEG, rng } from "agentic-3js-builder";
import { catmull } from "agentic-3js-builder";
import { cells, mix, noise, paint, smoothstep } from "agentic-3js-builder";
import type { Paint } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Rune-Forged Greatsword on a Standing Stone",
  description:
    "A chunky two-handed greatsword plunged point-down into a carved octagonal stone shrine: blue steel blade with a gold-lined fuller and glowing runes, winged gold crossguard, wrapped grip with a crimson ribbon, orb pommel, four crystal pylons, moss and rubble. Hand-painted Warcraft look.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Dimensions (meters)

const CAP_TOP = 0.58; // top of the shrine
const SINK = 0.11; // how deep the tip is buried
const BL = 1.1; // blade length, guard seat to tip
const YB = CAP_TOP - SINK + BL; // world y of the blade seat (blade points down)
const YG = YB + 0.01; // guard centre
const WS = 1.28; // blade width scale (chunky)
const GS = 1.18; // crossguard scale
const PS = 1.15; // pommel scale
const GRIP_BOT = YG + 0.16;
const GRIP_LEN = 0.34;
const GRIP_TOP = GRIP_BOT + GRIP_LEN;
const H = 0.8; // shrine footprint scale

// ---------------------------------------------------------------------------------------------------------------
// Palette

const GEM = "#2fc8ff";
const KEY = new THREE.Vector3(0.35, 0.8, 0.5).normalize();

/** Hand-painted three-tone ramp driven by the normal against a key light. */
function shaded(dark: string, mid: string, light: string, seed = 1, wear?: string) {
  return paint((p, n) => {
    const d = n.dot(KEY);
    let c = d < 0.2 ? mix(dark, mid, smoothstep(-0.8, 0.2, d)) : mix(mid, light, smoothstep(0.2, 0.95, d));
    if (wear) {
      const w = noise(p, 0.035, seed);
      if (w > 0.74) c = mix(c, wear, 0.45);
    }
    return c;
  });
}

const GOLD = shaded("#7a3f10", "#e2a21c", "#fff1a0", 3, "#fff8d0");
const GOLD_D = shaded("#5a2c0a", "#b9741a", "#f0c24a", 4);
const IRON = shaded("#141f3d", "#2f4a80", "#8db6f0", 5, "#b6d3ff");
const BRONZE = shaded("#3a1e0c", "#8a4f20", "#d89a50", 6);

const STONE_D = "#59607c";
const STONE_M = "#9198ad";
const STONE_L = "#d6d8e2";
const MOSS_D = "#2f5a1f";
const MOSS_L = "#7fbf3f";

/** Chiselled blue-grey stone: painted blocks, cracks, light on top, dark at the foot, moss only where it is damp. */
function stone(seed: number, size = 0.24, mossy = 0.5) {
  return paint((p, n) => {
    const c = cells(p, size, seed);
    const edge = c.d2 - c.d1;
    const nz = noise(p, 0.14, seed + 5);
    const grit = noise(p, 0.03, seed + 9);
    const warm = noise(p, 0.3, seed + 14);
    const d = n.dot(KEY);
    let col = mix(mix(STONE_D, STONE_M, 0.45 + 0.55 * nz), STONE_L, smoothstep(0.35, 1, d) * 0.85);
    col = mix(col, "#8f8478", smoothstep(0.55, 0.85, warm) * 0.3);
    col = mix(col, "#3a4060", smoothstep(0.35, -0.2, d) * 0.3);
    col = mix(col, STONE_D, (0.7 - 0.45 * c.id) * 0.18);
    col = mix(col, "#2c3150", smoothstep(0.3, 0.0, p.y) * 0.3);
    if (grit > 0.72) col = mix(col, "#e9ecf5", 0.12);
    if (edge < 0.05) col = mix(col, "#1b1f33", 0.8);
    else if (edge < 0.1 && d > 0.2) col = mix(col, "#e6e9f4", 0.3);
    const lim = 0.86 - 0.15 * mossy;
    const damp = noise(p, 0.17, seed + 21) + (0.22 - p.y) * 0.8 + n.y * 0.1;
    if (damp > lim && n.y > 0) {
      const m = noise(p, 0.035, seed + 33);
      col = mix(col, mix(MOSS_D, MOSS_L, 0.2 + 0.6 * m), smoothstep(lim, lim + 0.07, damp));
    }
    return col;
  });
}

const CLOTH = paint((p, n, s) => {
  const fold = noise(p, 0.05, 41);
  let c = mix("#6d0f1c", "#e03a3a", 0.25 + 0.6 * fold * (0.55 + 0.45 * Math.abs(n.x + n.z)));
  if (s[0] > 0.86 && s[0] < 0.91) c = mix("#a8661a", "#ffd24a", 0.6 + 0.4 * fold);
  return c;
});

// ---------------------------------------------------------------------------------------------------------------
// Rune drawings

const GLYPHS = [
  "M10 2 L10 18 M10 6 L16 11 M10 11 L4 16",
  "M5 2 L5 18 M5 3 L15 8 L5 13",
  "M4 2 L16 10 L4 18 M16 2 L16 18",
  "M10 2 L4 10 L10 18 L16 10 Z M10 6 L10 14",
  "M4 18 L10 2 L16 18 M6 12 L14 12",
  "M5 2 L5 18 M15 2 L15 18 M5 10 L15 10",
  "M4 2 L16 18 M16 2 L4 18",
  "M5 2 L5 18 L15 18 M5 8 L12 8",
  "M4 4 L10 10 L16 4 M10 10 L10 18",
  "M10 2 L10 18 M4 7 L10 2 L16 7 M4 13 L16 13",
];

/** A glowing stroke: wide cyan with a pale core. */
const dual = (d: string, w: number) =>
  `<path d="${d}" stroke="#13b4f0" stroke-width="${w * 2.3}"/><path d="${d}" stroke="#c8fbff" stroke-width="${w}"/>`;

function glyphGroup(i: number, tf: string, w: number) {
  const strokes = GLYPHS[i % GLYPHS.length]
    .split(" M")
    .map((seg, k) => dual((k ? "M" : "") + seg, w))
    .join("");
  return `<g transform="${tf}">${strokes}</g>`;
}

const RUNE_COLUMN = (() => {
  const cellH = 190 / 7;
  const rows = [0, 3, 5, 1, 7, 4, 9];
  const body = rows.map((g, i) => glyphGroup(g, `translate(3 ${(i * cellH + (cellH - 20) / 2).toFixed(1)})`, 1.3)).join("");
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 190"><g fill="none" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`,
    { size: 1600 },
  );
})();

const RUNE_CIRCLE = (() => {
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><g fill="none" stroke-linecap="round" stroke-linejoin="round">`;
  s += `<circle cx="200" cy="200" r="192" stroke="#12304f" stroke-width="16"/>`;
  s += `<circle cx="200" cy="200" r="192" stroke="#13b4f0" stroke-width="5"/><circle cx="200" cy="200" r="192" stroke="#c8fbff" stroke-width="2"/>`;
  s += `<circle cx="200" cy="200" r="126" stroke="#13b4f0" stroke-width="6"/><circle cx="200" cy="200" r="126" stroke="#c8fbff" stroke-width="2.4"/>`;
  s += `<circle cx="200" cy="200" r="70" stroke="#13b4f0" stroke-width="5"/><circle cx="200" cy="200" r="70" stroke="#c8fbff" stroke-width="2"/>`;
  for (let k = 0; k < 16; k++) s += glyphGroup(k, `translate(200 200) rotate(${k * 22.5}) translate(-9 -178) scale(0.9)`, 1.6);
  for (let k = 0; k < 8; k++) {
    const a = (k * 45 * Math.PI) / 180;
    const a2 = ((k * 45 + 135) * Math.PI) / 180;
    const x1 = 200 + Math.sin(a) * 126;
    const y1 = 200 - Math.cos(a) * 126;
    const x2 = 200 + Math.sin(a2) * 126;
    const y2 = 200 - Math.cos(a2) * 126;
    s += dual(`M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`, 1.4);
  }
  const rr = rng(77);
  for (let k = 0; k < 7; k++) {
    const a0 = k * 51.4 + 8;
    let d = "";
    let r = 36;
    for (let j = 0; j < 6; j++) {
      const a = ((a0 + (rr() - 0.5) * 22) * Math.PI) / 180;
      d += `${j ? "L" : "M"}${(200 + Math.sin(a) * r).toFixed(1)} ${(200 - Math.cos(a) * r).toFixed(1)} `;
      r += 17 + rr() * 6;
    }
    s += dual(d, 1.2);
  }
  s += `</g></svg>`;
  return svg(s, { size: 2048 });
})();

const PLAQUES = [0, 1, 2, 3, 4, 5, 6, 7].map((g) =>
  svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="0" y="0" width="24" height="24" fill="#10243f"/><rect x="1.2" y="1.2" width="21.6" height="21.6" fill="none" stroke="#0b1a30" stroke-width="1"/><g fill="none" stroke-linecap="round" stroke-linejoin="round">${glyphGroup(g + 2, "translate(2 2)", 1.1)}</g></svg>`,
    { size: 256 },
  ),
);

const PYLON_RUNES = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 66"><rect width="22" height="66" fill="#10243f"/><g fill="none" stroke-linecap="round" stroke-linejoin="round">${[2, 6, 8]
    .map((g, i) => glyphGroup(g, `translate(1 ${i * 22 + 1})`, 1.1))
    .join("")}</g></svg>`,
  { size: 512 },
);

const TUFT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
  <path d="M6 40 Q4 22 1 6 Q9 18 11 40Z" fill="#3d7a22"/>
  <path d="M12 40 Q12 20 14 2 Q20 18 18 40Z" fill="#5ea32c"/>
  <path d="M18 40 Q22 18 27 4 Q28 22 24 40Z" fill="#78bd38"/>
  <path d="M24 40 Q30 24 36 12 Q33 28 30 40Z" fill="#4c9026"/>
  <path d="M30 40 Q34 30 39 24 Q36 34 35 40Z" fill="#3d7a22"/>
  <path d="M14 40 Q14 28 15 16 Q17 28 17 40Z" fill="#a3d95a"/></svg>`,
  { size: 160 },
);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "runeGreatsword", paintSize: 2048 });
  const root = b.joint("base", { at: [0, 0, 0] });
  const R = rng(2024);

  const put = (g: THREE.BufferGeometry, color: string | Paint, at: [number, number, number], o: PartOptions = {}) =>
    b.part(g, color, { bone: root, at, flat: true, ...o });
  const yawPitch = (yaw: number, pitch: number, roll = 0) =>
    new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch * DEG, yaw * DEG, roll * DEG, "YXZ"));
  /** Point at radius r*H (shrine scale) and bearing deg from +Z. */
  const sp = (r: number, deg: number, y: number): [number, number, number] => [r * H * Math.sin(deg * DEG), y, r * H * Math.cos(deg * DEG)];
  const dirOf = (deg: number): [number, number, number] => [Math.sin(deg * DEG), 0, Math.cos(deg * DEG)];
  /** Lathe whose profile radii are shrine-scaled. */
  const slathe = (outline: OutlinePoint[], at: [number, number, number], color: string | Paint, segments = 8, spin = 22.5) =>
    b.lathe(
      outline.map((q): OutlinePoint => (q[2] ? [q[0] * H, q[1], "sharp"] : [q[0] * H, q[1]])),
      { at, segments, spin, color, bone: root },
    );
  const lathe = (outline: OutlinePoint[], at: [number, number, number], color: string | Paint, segments = 8, spin = 22.5) =>
    b.lathe(outline, { at, segments, spin, color, bone: root });

  // =============================================================== THE STONE SHRINE
  // Octagonal tiers: flats face front/back/left/right.
  slathe([[0, 0], [0.96, 0], [1.0, 0.035], [0.97, 0.095], [0, 0.095]], [0, 0, 0], stone(11, 0.3));
  slathe([[0, 0], [0.76, 0], [0.78, 0.02], [0.76, 0.1], [0.72, 0.112], [0, 0.112]], [0, 0.095, 0], stone(12, 0.22));
  slathe([[0, 0], [0.54, 0], [0.52, 0.3], [0.5, 0.31], [0, 0.31]], [0, 0.205, 0], stone(13, 0.2));
  // gold bands round the drum
  slathe([[0.47, 0], [0.545, 0], [0.545, 0.022], [0.5, 0.03], [0.47, 0.03]], [0, 0.2, 0], GOLD_D);
  slathe([[0.45, 0], [0.525, 0], [0.525, 0.026], [0.47, 0.03], [0.45, 0.03]], [0, 0.478, 0], GOLD_D);
  // capstone
  slathe([[0, 0], [0.62, 0], [0.62, 0.02], [0.59, 0.08], [0, 0.08]], [0, 0.5, 0], stone(14, 0.2, 0.1));
  // gold inlay ring on top, a darker well round it, and the rune circle
  slathe([[0.425, 0], [0.455, 0], [0.455, 0.007], [0.425, 0.007]], [0, CAP_TOP, 0], GOLD);
  slathe([[0.455, 0], [0.575, 0], [0.575, 0.004], [0.455, 0.004]], [0, CAP_TOP, 0], shaded("#222842", "#3b4263", "#6c7595", 8));
  glow(
    b.part(new THREE.CircleGeometry(0.42 * H, 32), "#ffffff", {
      bone: root,
      at: [0, CAP_TOP + 0.0015, 0],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, -1],
      texture: RUNE_CIRCLE,
    }),
    1.4,
  );

  // gold corner caps on the capstone (vertices at 22.5 + 45k) and studs
  const studGeo: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 8; k++) {
    const a = 22.5 + 45 * k;
    put(new THREE.ConeGeometry(0.034, 0.055, 4), GOLD, sp(0.585, a, CAP_TOP + 0.022), { rotation: [0, a + 45, 0] });
    const [x, y, z] = sp(0.62, a, 0.51);
    studGeo.push(new THREE.SphereGeometry(0.013, 6, 4).translate(x, y, z));
    const [x2, y2, z2] = sp(0.5, a, 0.35);
    studGeo.push(new THREE.SphereGeometry(0.011, 6, 4).translate(x2, y2, z2));
  }
  b.part(mergeGeometries(studGeo), GOLD, { bone: root, at: [0, 0, 0], flat: true, name: "studs.shrine" });

  // carved plaques on the 8 drum faces
  const plaqueRad = 0.472 * H;
  for (let k = 0; k < 8; k++) {
    const a = k * 45;
    const y = 0.35;
    const w = k % 2 === 0 ? 0.17 : 0.13;
    const rot: [number, number, number] = [0, a, 0];
    const at = (d: number): [number, number, number] => [(plaqueRad + d) * Math.sin(a * DEG), y, (plaqueRad + d) * Math.cos(a * DEG)];
    put(new THREE.BoxGeometry(w + 0.045, w + 0.045, 0.024), GOLD_D, at(0.004), { rotation: rot });
    put(new THREE.BoxGeometry(w + 0.012, w + 0.012, 0.028), BRONZE, at(0.006), { rotation: rot });
    glow(b.part(new THREE.PlaneGeometry(w, w), "#ffffff", { bone: root, at: at(0.0205), dir: dirOf(a), axis: "z", texture: PLAQUES[k] }), 1.2);
    for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
      const lx = dx * (w / 2 + 0.012);
      const cx = plaqueRad + 0.018;
      put(new THREE.SphereGeometry(0.01, 6, 4), GOLD, [
        cx * Math.sin(a * DEG) + lx * Math.cos(a * DEG),
        y + dy * (w / 2 + 0.012),
        cx * Math.cos(a * DEG) - lx * Math.sin(a * DEG),
      ]);
    }
  }

  // broken slabs heaved up round the blade
  for (let k = 0; k < 7; k++) {
    const a = k * (360 / 7) + 12;
    const rad = 0.1 + R() * 0.03;
    put(new THREE.BoxGeometry(0.09 + R() * 0.05, 0.04 + R() * 0.03, 0.07 + R() * 0.03), stone(30 + k, 0.1, 0.1), [rad * Math.sin(a * DEG), CAP_TOP + 0.016, rad * Math.cos(a * DEG)], {
      quat: yawPitch(a, 16 + R() * 14, (R() - 0.5) * 16),
    });
  }
  for (let k = 0; k < 5; k++) {
    const a = k * 72 + 40;
    const rad = 0.17 + R() * 0.05;
    put(new THREE.IcosahedronGeometry(0.026 + R() * 0.016, 0), stone(50 + k, 0.08, 0.1), [rad * Math.sin(a * DEG), CAP_TOP + 0.012, rad * Math.cos(a * DEG)], {
      rotation: [R() * 90, R() * 90, 0],
      scale: [1, 0.6, 1],
    });
  }

  // flagstones on the foundation, skipping the pylon spots (diagonals at 45 + 90k)
  for (let k = 0; k < 16; k++) {
    const a = k * 22.5;
    if (Math.abs((((a % 90) + 90) % 90) - 45) < 15) continue;
    const h = 0.022 + R() * 0.018;
    put(new THREE.BoxGeometry(0.24, h, 0.12), stone(60 + k, 0.12, 0.5), sp(0.84, a, 0.095 + h / 2 - 0.004), {
      rotation: [0, a + (R() - 0.5) * 6, 0],
    });
  }

  // =============================================================== PYLONS
  for (let k = 0; k < 4; k++) {
    const a = 45 + 90 * k;
    const [px, , pz] = sp(0.8, a, 0);
    const pylonStone = stone(70 + k, 0.14, 0.6);
    const hexLathe = (outline: OutlinePoint[], y: number, color: string | Paint) =>
      b.lathe(outline, { at: [px, y, pz], segments: 6, spin: 0, color, bone: root });
    hexLathe([[0, 0], [0.105, 0], [0.1, 0.07], [0.082, 0.085], [0, 0.085]], 0.093, pylonStone);
    hexLathe([[0, 0], [0.08, 0], [0.06, 0.4], [0, 0.4]], 0.175, pylonStone);
    hexLathe([[0.045, 0], [0.084, 0], [0.084, 0.022], [0.06, 0.034], [0.045, 0.034]], 0.205, GOLD_D);
    hexLathe([[0.04, 0], [0.078, 0], [0.078, 0.02], [0.06, 0.045], [0.04, 0.045]], 0.54, GOLD);
    for (let j = 0; j < 4; j++) {
      const aa = j * 90 + 45;
      put(new THREE.ConeGeometry(0.016, 0.09, 4), GOLD, [px + 0.04 * Math.sin(aa * DEG), 0.6, pz + 0.04 * Math.cos(aa * DEG)], {
        rotation: [Math.cos(aa * DEG) * 14, 0, -Math.sin(aa * DEG) * 14],
      });
    }
    glow(put(new THREE.OctahedronGeometry(0.052, 0), GEM, [px, 0.71, pz], { scale: [1, 1.7, 1], rotation: [0, 20 * k, 0] }), 1.6);
    const out = dirOf(a);
    const plaqueR = 0.8 * H + 0.062;
    put(new THREE.BoxGeometry(0.09, 0.23, 0.018), GOLD_D, [plaqueR * Math.sin(a * DEG), 0.37, plaqueR * Math.cos(a * DEG)], { dir: out, axis: "z" });
    glow(
      b.part(new THREE.PlaneGeometry(0.066, 0.2), "#ffffff", {
        bone: root,
        at: [(plaqueR + 0.0095) * Math.sin(a * DEG), 0.37, (plaqueR + 0.0095) * Math.cos(a * DEG)],
        dir: out,
        axis: "z",
        texture: PYLON_RUNES,
      }),
      1.2,
    );
    // a tattered crimson pennant hanging from the collar, beside the plaque
    const tan = dirOf(a + 90);
    const side = k % 2 === 0 ? 1 : -1;
    const base = [px + tan[0] * 0.07 * side, pz + tan[2] * 0.07 * side];
    const pennant = catmull(
      [0.575, 0.52, 0.43, 0.34, 0.27].map((y, i): [number, number, number] => [
        base[0] + dirOf(a)[0] * (0.012 + 0.018 * i) + tan[0] * 0.006 * i * side,
        y,
        base[1] + dirOf(a)[2] * (0.012 + 0.018 * i) + tan[2] * 0.006 * i * side,
      ]),
    );
    b.sweep(pennant, (t) => [0.03 - 0.012 * t, 0.003], { section: "box", color: CLOTH, caps: "flat", bone: root, name: `pennant${k}` });
    const tip = pennant.at(1);
    put(new THREE.ConeGeometry(0.012, 0.03, 4), GOLD, [tip.x, tip.y - 0.008, tip.z], { rotation: [0, 0, 180] });
  }

  // =============================================================== GRASS, MOSS, RUBBLE
  const tuftFrames: Frame[] = [];
  for (let k = 0; k < 28; k++) {
    const [x, , z] = sp(1.06 + R() * 0.2, R() * 360, 0);
    tuftFrames.push(frame([x, 0, z], [0, 1, 0]));
  }
  for (let k = 0; k < 8; k++) {
    const [x, , z] = sp(0.93, 22.5 + 45 * k + (R() - 0.5) * 6, 0);
    tuftFrames.push(frame([x, 0.09, z], [0, 1, 0]));
  }
  for (let k = 0; k < 12; k++) {
    const [x, , z] = sp(0.7 + R() * 0.03, k * 30 + 10, 0);
    tuftFrames.push(frame([x, 0.205, z], [0, 1, 0]));
  }
  b.cards(tuftFrames, TUFT, { size: [0.085, 0.085], cross: true, vary: 0.4, spin: 180, rng: rng(5), lean: 8, bend: 20, flow: [0.3, 0, 1] });

  for (let k = 0; k < 10; k++) {
    const s = 0.04 + R() * 0.07;
    const [x, , z] = sp(1.1 + R() * 0.25, k * 36 + 8 + R() * 14, 0);
    put(new THREE.IcosahedronGeometry(s, 0), stone(90 + k, 0.1, 0.6), [x, s * 0.95, z], {
      rotation: [R() * 30, R() * 360, R() * 30],
      scale: [1.2, 0.75, 1],
    });
  }
  // moss cushions on the step and foundation
  for (let k = 0; k < 8; k++) {
    const onStep = k % 2 === 0;
    const s = 0.028 + R() * 0.025;
    const [x, , z] = sp(onStep ? 0.64 + R() * 0.1 : 0.82 + R() * 0.08, R() * 360, 0);
    put(new THREE.IcosahedronGeometry(s, 0), k % 3 ? "#5f9d34" : "#7fbf3f", [x, (onStep ? 0.207 : 0.097) + s * 0.15, z], {
      scale: [1.5, 0.55, 1.2],
      rotation: [0, R() * 360, 0],
    });
  }
  // little glowing crystal shards in cracks of the foundation
  for (let k = 0; k < 5; k++) {
    const a = 20 + k * 70 + R() * 10;
    const [x, , z] = sp(0.9 + R() * 0.08, a, 0);
    const [x2, , z2] = sp(1.04 + R() * 0.05, a + 10, 0);
    glow(put(new THREE.ConeGeometry(0.018, 0.1 + R() * 0.05, 5), GEM, [x, 0.14, z], { rotation: [R() * 25, 0, R() * 25] }), 1.4);
    glow(put(new THREE.ConeGeometry(0.014, 0.07, 5), GEM, [x2, 0.05, z2], { rotation: [R() * 30, 0, -R() * 30] }), 1.4);
  }

  // votive candles left at the foot of the stone: a warm accent against the cool blue
  for (const [ca, n] of [[338, 5], [24, 4]] as const) {
    const [cx0, , cz0] = sp(0.86, ca, 0);
    put(new THREE.CylinderGeometry(0.075, 0.085, 0.014, 7), "#7b4a22", [cx0, 0.118, cz0]);
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * 360 + ca;
      const rr = i === 0 ? 0 : 0.045;
      const h = 0.05 + R() * 0.09;
      const x = cx0 + rr * Math.sin(ang * DEG);
      const z = cz0 + rr * Math.cos(ang * DEG);
      put(new THREE.CylinderGeometry(0.012, 0.015, h, 6), i % 2 ? "#f3e6c0" : "#e9d3a0", [x, 0.125 + h / 2, z]);
      put(new THREE.SphereGeometry(0.0155, 5, 3), "#fff6dc", [x, 0.125 + h, z], { scale: [1, 0.4, 1] });
      glow(put(new THREE.ConeGeometry(0.0085, 0.032, 5), "#ffb030", [x, 0.125 + h + 0.017, z]), 1.6);
    }
  }

  // =============================================================== THE SWORD
  // ---- blade (built tip-up in sword coordinates, flipped so the tip points down)
  const keys: [number, number][] = [
    [0, 0.082],
    [0.14, 0.082],
    [0.17, 0.128],
    [0.23, 0.11],
    [0.34, 0.112],
    [0.37, 0.098],
    [0.4, 0.112],
    [0.5, 0.112],
    [0.53, 0.098],
    [0.56, 0.114],
    [0.6, 0.114],
  ].map((q): [number, number] => [q[0], q[1] * WS]);
  for (let i = 1; i <= 8; i++) {
    const u = i / 8;
    keys.push([0.6 + (BL - 0.6) * u, Math.max(0.114 * WS * Math.pow(1 - u, 0.7), 0.005)]);
  }
  /** Half width of the blade at distance yl from the guard. */
  const hwAt = (yl: number) => {
    for (let i = 0; i < keys.length - 1; i++) {
      if (yl <= keys[i + 1][0]) return keys[i][1] + ((keys[i + 1][1] - keys[i][1]) * (yl - keys[i][0])) / (keys[i + 1][0] - keys[i][0]);
    }
    return 0.005;
  };
  const SECTION: [number, number][] = [
    [1, 0],
    [0.74, 0.5],
    [0.46, 1],
    [0.32, 0.6],
    [-0.32, 0.6],
    [-0.46, 1],
    [-0.74, 0.5],
    [-1, 0],
  ];
  const TMAX = 0.03;
  const point = (st: [number, number], k: number, side: number) => {
    const [fx, fz] = SECTION[k];
    const t = TMAX * Math.min(1, Math.max(0.12, st[1] / 0.09));
    return new THREE.Vector3(fx * st[1], st[0], side * fz * t);
  };
  const bladeShade = (dark: string, light: string, seed: number, pin = false) =>
    paint((p, n) => {
      const d = n.x * 0.75 + Math.abs(n.z) * 0.35 + n.y * 0.2;
      const yl = YB - p.y;
      let c = mix(dark, light, smoothstep(-0.35, 0.55, d));
      c = mix(c, "#27407a", smoothstep(0.4, 0.0, yl) * 0.28);
      c = mix(c, "#ffffff", smoothstep(0.85, 1.05, yl) * 0.18);
      const sc = noise(new THREE.Vector3(p.x * 9, p.y * 0.7, p.z * 9), 0.06, seed);
      if (sc > 0.72) c = mix(c, "#ffffff", 0.2);
      else if (sc < 0.16) c = mix(c, "#1e3260", 0.2);
      if (pin) {
        const f = Math.abs(p.x) / hwAt(yl);
        if (Math.abs(f - 0.6) < 0.028 && yl > 0.17) c = mix(c, "#ffdc70", 0.85);
      }
      return c;
    });
  const bladeBevel = bladeShade("#6a86b8", "#e6f2ff", 21);
  const bladeFlat = bladeShade("#233f78", "#74a0dc", 22, true);
  const bladeWall = shaded("#6d3a12", "#d89a1c", "#fff0a0", 23, "#fff8d0");
  const bladeFuller = paint((p) => {
    const yl = YB - p.y;
    return mix("#16295a", "#2c63b0", smoothstep(0.9, 0.15, yl) * 0.7 + noise(p, 0.05, 24) * 0.3);
  });
  const bandKind = [bladeBevel, bladeFlat, bladeWall, bladeFuller, bladeWall, bladeFlat, bladeBevel];
  for (const side of [1, -1]) {
    for (let j = 0; j < 7; j++) {
      const pos: number[] = [];
      const push = (...v: THREE.Vector3[]) => v.forEach((q) => pos.push(q.x, q.y, q.z));
      for (let i = 0; i < keys.length - 1; i++) {
        const a0 = point(keys[i], j, side);
        const b0 = point(keys[i], j + 1, side);
        const a1 = point(keys[i + 1], j, side);
        const b1 = point(keys[i + 1], j + 1, side);
        if (side === 1) push(a0, a1, b0, a1, b1, b0);
        else push(a0, b0, a1, a1, b0, b1);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.rotateZ(Math.PI);
      g.translate(0, YB, 0);
      b.part(g, bandKind[j], { bone: root, at: [0, 0, 0], flat: true, name: `blade.${side > 0 ? "f" : "b"}${j}` });
    }
  }

  // runes in the fuller, both faces
  const runeY = YB - 0.41;
  const runeZ = TMAX * 0.6 + 0.0015;
  for (const side of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(0.068, 0.38), "#ffffff", {
        bone: root,
        at: [0, runeY, side * runeZ],
        dir: [0, 0, side],
        axis: "z",
        texture: RUNE_COLUMN,
      }),
      1.5,
    );
  }

  // gold plate over the ricasso with a gem, one per face
  const plate: OutlinePoint[] = [[-0.07, 0], [0.07, 0], [0.078, 0.1], [0, 0.18, "sharp"], [-0.078, 0.1]];
  b.extrude(plate, { at: [0, YB, 0], x: [1, 0, 0], y: [0, -1, 0], thickness: 0.08, bevel: 0.012, color: GOLD, bone: root });
  for (const side of [1, -1]) glow(put(new THREE.OctahedronGeometry(0.02, 0), GEM, [0, YB - 0.08, side * 0.043], { scale: [0.8, 1.4, 0.6] }), 1.6);

  // ---- crossguard
  const wingBase: OutlinePoint[] = [
    [0.05, -0.05],
    [0.13, -0.055],
    [0.2, -0.1, "sharp"],
    [0.215, -0.045],
    [0.27, -0.01],
    [0.33, 0.05],
    [0.375, 0.17, "sharp"],
    [0.31, 0.115],
    [0.24, 0.08],
    [0.17, 0.06],
    [0.05, 0.06],
  ];
  const wing = wingBase.map((q): OutlinePoint => (q[2] ? [q[0] * GS, q[1] * GS, "sharp"] : [q[0] * GS, q[1] * GS]));
  const cx = 0.2 * GS;
  const cy = 0.03 * GS;
  const inset = (k: number): OutlinePoint[] =>
    wing.map((q): OutlinePoint => {
      const x = cx + (q[0] - cx) * k;
      const y = cy + (q[1] - cy) * k;
      return q[2] ? [x, y, "sharp"] : [x, y];
    });
  const wingGold = paint((p, n, s) => {
    let c = GOLD.at(p, n);
    if (Math.abs(n.z) > 0.6) {
      const r = Math.hypot(s[0] - 0.04 * GS, s[1] + 0.02);
      const f = r / 0.03;
      if (r > 0.1 && f - Math.floor(f) < 0.14) c = mix(c, "#5a2c0a", 0.65);
    }
    return c;
  });
  const rivets: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) {
    b.extrude(wing, { at: [0, YG, 0], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.07, bevel: 0.016, color: wingGold, bone: root });
    b.extrude(inset(0.55), { at: [0, YG, 0], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.078, bevel: 0.006, color: IRON, bone: root });
    for (const side of [1, -1]) {
      glow(
        b.part(new THREE.PlaneGeometry(0.056, 0.056), "#ffffff", {
          bone: root,
          at: [s * 0.215 * GS, YG + 0.025 * GS, side * 0.0405],
          dir: [0, 0, side],
          axis: "z",
          texture: PLAQUES[(s > 0 ? 1 : 5) + (side > 0 ? 0 : 1)],
        }),
        1.2,
      );
    }
    for (const q of [[0.1, -0.04], [0.15, 0.045], [0.28, 0.06], [0.33, 0.115], [0.215, -0.07], [0.3, 0.015]]) {
      for (const side of [1, -1]) rivets.push(new THREE.SphereGeometry(0.0095, 5, 3).translate(s * q[0] * GS, YG + q[1] * GS, side * 0.0365));
    }
    put(new THREE.ConeGeometry(0.027, 0.085, 5), GOLD, [s * 0.378 * GS, YG + 0.205 * GS, 0], { rotation: [0, 0, -s * 6] });
    put(new THREE.ConeGeometry(0.022, 0.06, 5), GOLD, [s * 0.2 * GS, YG - 0.125 * GS, 0], { rotation: [0, 0, 180 + s * 3] });
  }
  b.part(mergeGeometries(rivets), GOLD_D, { bone: root, at: [0, 0, 0], flat: true, name: "rivets.guard" });

  // central heart plate with gems
  const heart = ([[-0.09, -0.1], [0.09, -0.1], [0.115, -0.01], [0.092, 0.1], [0, 0.145, "sharp"], [-0.092, 0.1], [-0.115, -0.01]] as OutlinePoint[]).map(
    (q): OutlinePoint => (q[2] ? [q[0] * GS, q[1] * GS, "sharp"] : [q[0] * GS, q[1] * GS]),
  );
  b.extrude(heart, { at: [0, YG, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.12, bevel: 0.026, color: GOLD, bone: root });
  const heartIn = heart.map((q): OutlinePoint => (q[2] ? [q[0] * 0.62, q[1] * 0.62 + 0.014, "sharp"] : [q[0] * 0.62, q[1] * 0.62 + 0.014]));
  b.extrude(heartIn, { at: [0, YG, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.13, bevel: 0.012, color: IRON, bone: root });
  for (const side of [1, -1]) {
    glow(put(new THREE.OctahedronGeometry(0.04, 0), GEM, [0, YG + 0.014, side * 0.074], { scale: [0.9, 1.5, 0.7] }), 1.8);
    for (const q of [[-0.075, -0.07], [0.075, -0.07], [-0.088, 0.04], [0.088, 0.04]])
      put(new THREE.SphereGeometry(0.011, 5, 3), GOLD_D, [q[0] * GS, YG + q[1] * GS, side * 0.0625]);
  }
  // blade collar under the guard, with teeth
  put(new THREE.BoxGeometry(0.22, 0.032, 0.1), IRON, [0, YG - 0.125, 0]);
  for (const s of [1, -1]) put(new THREE.ConeGeometry(0.022, 0.055, 4), GOLD, [s * 0.1, YG - 0.14, 0], { rotation: [0, 45, 180 + s * 14] });

  // ---- grip: wrapped leather with spiral straps
  const gripPaint = paint((p, n, s) => {
    const u = s[1] / 360 + (s[0] * GRIP_LEN) / 0.06;
    const f = u - Math.floor(u);
    const lit = smoothstep(-0.4, 0.9, n.dot(KEY));
    let c = mix(mix("#2f160a", "#7d3d1a", lit), "#c0773a", smoothstep(0.65, 1, lit) * (0.5 - Math.abs(f - 0.5)));
    c = mix(c, "#1b0b05", 0.25 * noise(p, 0.02, 9));
    if (f < 0.1) c = mix("#150803", "#3a1a0c", lit);
    return c;
  });
  b.rod([0, GRIP_BOT, 0], [0, GRIP_TOP, 0], 0.038, { sides: 8, color: gripPaint, bone: root, caps: "flat", name: "grip" });
  for (const [y, h] of [[GRIP_BOT - 0.012, 0.03], [GRIP_TOP - 0.02, 0.03], [(GRIP_BOT + GRIP_TOP) / 2 - 0.012, 0.024]] as const)
    lathe([[0.035, 0], [0.054, 0], [0.054, h], [0.035, h]], [0, y, 0], GOLD, 8);
  // cloth knot and two ribbon tails
  lathe([[0.035, 0], [0.05, 0.006], [0.05, 0.046], [0.035, 0.05]], [0, GRIP_TOP - 0.1, 0], CLOTH, 8);
  for (const s of [1, -1]) {
    const tie = GRIP_TOP - 0.065;
    const path = catmull([
      [s * 0.036, tie, 0],
      [s * 0.075, tie - 0.05, s * 0.04],
      [s * 0.09, tie - 0.13, s * 0.08],
      [s * 0.125, tie - 0.22, s * 0.075],
      [s * 0.12, tie - 0.31, s * 0.115],
      [s * 0.155, tie - 0.39, s * 0.125],
    ]);
    b.sweep(path, (t) => [0.028 + 0.012 * t, 0.003], { section: "box", color: CLOTH, caps: "flat", bone: root, name: `ribbon${s > 0 ? "L" : "R"}` });
    const end = path.at(1);
    put(new THREE.SphereGeometry(0.015, 6, 5), GOLD, [end.x, end.y - 0.012, end.z]);
  }

  // ---- pommel: collar, iron orb in gold rings, crown and gem
  lathe([[0, 0], [0.058, 0], [0.076, 0.014], [0.076, 0.032], [0.055, 0.05], [0, 0.05]], [0, GRIP_TOP, 0], GOLD, 8);
  const orbY = GRIP_TOP + 0.05 + 0.08;
  put(new THREE.SphereGeometry(0.078 * PS, 8, 6), IRON, [0, orbY, 0], { rotation: [0, 22.5, 0] });
  put(new THREE.TorusGeometry(0.083 * PS, 0.012, 5, 12), GOLD, [0, orbY, 0], { rotation: [90, 0, 0] });
  put(new THREE.TorusGeometry(0.083 * PS, 0.012, 5, 12), GOLD, [0, orbY, 0]);
  put(new THREE.TorusGeometry(0.083 * PS, 0.01, 5, 12), GOLD_D, [0, orbY, 0], { rotation: [0, 90, 0] });
  for (const side of [1, -1]) glow(put(new THREE.OctahedronGeometry(0.032, 0), GEM, [0, orbY, side * 0.092], { scale: [1, 1.5, 0.7] }), 1.8);
  lathe([[0, 0], [0.05, 0], [0.036, 0.034], [0, 0.08]], [0, orbY + 0.082, 0], GOLD, 6, 0);
  glow(put(new THREE.OctahedronGeometry(0.022, 0), GEM, [0, orbY + 0.175, 0], { scale: [1, 1.6, 1] }), 1.8);

  return b.root;
}
```

## Example: moonlitBowSonnet

Brief: Category: Fantasy weapon.
Subject: silverwood elven longbow on a moon-phase plinth with gold vines, glowing runes, ribbons, nocked arrow and crescent halo.
Style: high-fantasy anime.
Topology: prop-weapon
Style family: high-fantasy-anime
Notable features: bow, nocked-arrow, runes, halo, ribbons

```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";
import { frame } from "agentic-3js-builder";
import { rng } from "agentic-3js-builder";
import { cells, grain, mottle, paint } from "agentic-3js-builder";
import { catmull, polyline } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { cel } from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "Moonlit Elven Longbow",
  description:
    "A silverwood elven longbow on a moon-phase plinth: gold-vine limbs with glowing runes, a moonstone riser, silk ribbons and tassel, one nocked moonsilver arrow, and a navy crescent halo with star charms.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: every colour is a two-tone cel paint, glow colours stay flat
const FACE = cel(grain("#f4f6ff", "#e1e7fc", { size: 0.012, axis: "y", seed: 2 }), "#9aa6e4");
const BACK = cel("#3a4ca6", "#222d78");
const BELLY = cel("#e3e7ff", "#a3aee6");
const GOLD = cel("#ffd873", "#d98b32");
const GOLD_D = cel("#e9b04a", "#b9651f");
const NAVY = cel("#262d78", "#141847");
const NAVY_B = cel("#2f3a8f", "#1a2058");
const LAV = cel("#bba9ff", "#7e6fd9");
const PEARL = cel("#f7f4ff", "#b6b4ee");
const TEAL = cel("#3bb8ac", "#24788f");
const TEAL_D = cel("#277f86", "#1b4d6a");
const LEAF = cel("#a4e6c8", "#4fa9a6");
const LEAF_B = cel("#7fd6c1", "#3a8f9e");
const STEM = cel("#5bbf9f", "#2f8394");
const STONE = cel(
  mottle("#6f7bc0", "#5d69ab", { size: 0.1, seed: 5 }),
  mottle("#46529a", "#3a4584", { size: 0.1, seed: 5 }),
);
const STONE_CARVED = cel("#3c4789", "#252d63");
const STONE_LIGHT = cel("#8791d6", "#5560ad");
const RUNE_GLOW = "#aef4ff";
const STAR_GLOW = "#fff0b0";
const ARROW_WOOD = cel("#f1ecdc", "#b9b2d6");

// ---------------------------------------------------------------------------------------------------------------
// Drawings
const RUNES = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 200">
  <path d="M20 4 C6 24 34 44 20 64 S6 104 20 124 S34 164 20 196" fill="none" stroke="#18bfff" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M20 34 q10 -10 17 -3 q-8 10 -17 3z M20 94 q-10 -10 -17 -3 q8 10 17 3z M20 154 q10 -10 17 -3 q-8 10 -17 3z" fill="#4fd8ff"/>
  <path d="M20 64 q-10 -8 -16 -2 q7 9 16 2z M20 124 q10 -8 16 -2 q-7 9 -16 2z" fill="#18bfff"/>
  <circle cx="20" cy="64" r="3.6" fill="#ffffff"/><circle cx="20" cy="124" r="3.6" fill="#ffffff"/>
  <circle cx="20" cy="9" r="3" fill="#ffffff"/><circle cx="20" cy="191" r="3" fill="#ffffff"/>
  <path d="M8 96 l4 4 l-4 4 l-4 -4z M32 156 l4 4 l-4 4 l-4 -4z M32 36 l4 4 l-4 4 l-4 -4z" fill="#ffffff"/>
</svg>`,
  { size: 400 },
);

const FILIGREE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 170">
  <path d="M25 4 C22 30 28 50 25 85 S22 140 25 166" fill="none" stroke="#ffd873" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M25 30 C42 24 48 44 36 50 C28 53 27 44 33 43" fill="none" stroke="#ffd873" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M25 52 C8 46 2 66 14 72 C22 75 23 66 17 65" fill="none" stroke="#ffd873" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M25 96 C42 90 48 110 36 116 C28 119 27 110 33 109" fill="none" stroke="#ffd873" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M25 118 C8 112 2 132 14 138 C22 141 23 132 17 131" fill="none" stroke="#ffd873" stroke-width="2.4" stroke-linecap="round"/>
  <circle cx="25" cy="85" r="5" fill="#ffd873"/><circle cx="25" cy="12" r="3.4" fill="#ffd873"/><circle cx="25" cy="158" r="3.4" fill="#ffd873"/>
  <circle cx="44" cy="76" r="2.2" fill="#ffd873"/><circle cx="6" cy="30" r="2.2" fill="#ffd873"/><circle cx="6" cy="150" r="2.2" fill="#ffd873"/><circle cx="44" cy="136" r="2.2" fill="#ffd873"/>
</svg>`,
  { size: 340 },
);

const TASSEL_STRANDS = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 120">
  <g fill="none" stroke-width="3.4" stroke-linecap="round">
    <path d="M30 118 L8 8" stroke="#cdbdff"/><path d="M30 118 L16 4" stroke="#f4f0ff"/><path d="M30 118 L24 2" stroke="#bba9ff"/>
    <path d="M30 118 L30 0" stroke="#f4f0ff"/><path d="M30 118 L36 2" stroke="#cdbdff"/><path d="M30 118 L44 4" stroke="#bba9ff"/>
    <path d="M30 118 L52 8" stroke="#f4f0ff"/>
  </g>
  <g fill="#aef4ff"><circle cx="8" cy="8" r="3.2"/><circle cx="24" cy="3.6" r="3.2"/><circle cx="36" cy="3.6" r="3.2"/><circle cx="52" cy="8" r="3.2"/><circle cx="30" cy="2.4" r="3.2"/></g>
</svg>`,
  { size: 240 },
);

const MOON_DISC = (() => {
  const dx = [0, -5, -9, -14, 99, 14, 9, 5];
  let phases = "";
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 - Math.PI / 2;
    const cx = 100 + 74 * Math.cos(a);
    const cy = 100 + 74 * Math.sin(a);
    phases += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="10" fill="#f6f2ff"/>`;
    if (dx[k] !== 99)
      phases += `<circle cx="${(cx + dx[k]).toFixed(1)}" cy="${cy.toFixed(1)}" r="10" fill="#1c2262"/>`;
    phases += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="11.5" fill="none" stroke="#ffd873" stroke-width="1.6"/>`;
  }
  let rays = "";
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    const r0 = 18;
    const r1 = k % 2 ? 36 : 46;
    rays += `<path d="M${(100 + r0 * Math.cos(a)).toFixed(1)} ${(100 + r0 * Math.sin(a)).toFixed(1)} L${(100 + r1 * Math.cos(a)).toFixed(1)} ${(100 + r1 * Math.sin(a)).toFixed(1)}" stroke="#ffd873" stroke-width="1.8" stroke-linecap="round"/>`;
  }
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="100" fill="#1c2262"/>
  <circle cx="100" cy="100" r="96" fill="none" stroke="#ffd873" stroke-width="3"/>
  <circle cx="100" cy="100" r="90" fill="none" stroke="#5a69c8" stroke-width="1.5"/>
  <circle cx="100" cy="100" r="54" fill="none" stroke="#ffd873" stroke-width="2"/>
  <circle cx="100" cy="100" r="50" fill="none" stroke="#5a69c8" stroke-width="1.2" stroke-dasharray="3 3"/>
  ${phases}${rays}
  <circle cx="100" cy="100" r="15" fill="#f6f2ff"/><circle cx="106" cy="97" r="13" fill="#1c2262"/>
  <path d="M100 6 l2.4 6 l-2.4 -1.6 l-2.4 1.6z M100 194 l2.4 -6 l-2.4 1.6 l-2.4 -1.6z M6 100 l6 2.4 l-1.6 -2.4 l1.6 -2.4z M194 100 l-6 2.4 l1.6 -2.4 l-1.6 -2.4z" fill="#ffd873"/>
</svg>`,
    { size: 640 },
  );
})();

// ---------------------------------------------------------------------------------------------------------------
// Bow layout (bow plane is XY; the archer's side, with the string, is -X; the target side is +X)
const OX = -0.042; // puts the lower tip on x = 0, over the stand's cup
const Y0 = 1.12; // grip height
const K = 0.92; // half-length scale
const HALF: [number, number][] = [
  [0, 0.27],
  [0.12, 0.268],
  [0.3, 0.248],
  [0.48, 0.205],
  [0.64, 0.148],
  [0.76, 0.092],
  [0.85, 0.045],
  [0.915, 0.02],
  [0.96, 0.028],
  [1.0, 0.042],
];
const RX: [number, number][] = [
  [0, 0.036],
  [0.2, 0.033],
  [0.5, 0.027],
  [0.8, 0.019],
  [1, 0.012],
];
const RY: [number, number][] = [
  [0, 0.04],
  [0.2, 0.037],
  [0.5, 0.03],
  [0.8, 0.021],
  [1, 0.0135],
];

function tab(u: number, table: [number, number][]) {
  const x = Math.min(Math.max(u, 0), 1);
  for (let i = 1; i < table.length; i++) {
    if (x <= table[i][0]) {
      const [a, ra] = table[i - 1];
      const [c, rc] = table[i];
      const f = (x - a) / (c - a);
      const s = f * f * (3 - 2 * f);
      return ra + (rc - ra) * (f * 0.5 + s * 0.5);
    }
  }
  return table[table.length - 1][1];
}
const rxAt = (y: number) => tab(Math.abs(y - Y0) / K, RX);
const ryAt = (y: number) => tab(Math.abs(y - Y0) / K, RY);

// the two fittings above and below the grip swell by this much
const FIT_NEAR = 0.075;
const FIT_FAR = 0.24;
const fitExtra = (y: number) => {
  const d = Math.abs(y - Y0);
  if (d < FIT_NEAR || d > FIT_FAR) return 0;
  return 0.01 * Math.pow(1 - (d - FIT_NEAR) / (FIT_FAR - FIT_NEAR), 1.25) + 0.003;
};

function crescentOutline(R1: number, R2: number, d: number, n = 20): OutlinePoint[] {
  const xi = (R2 * R2 - R1 * R1 - d * d) / (2 * d);
  const yi = Math.sqrt(R1 * R1 - xi * xi);
  const th = Math.atan2(yi, xi);
  const ph = Math.atan2(yi, xi + d);
  const out: OutlinePoint[] = [];
  for (let i = 0; i <= n; i++) {
    const a = th + ((-th - th) * i) / n;
    const edge = i === 0 || i === n;
    out.push([R1 * Math.cos(a), R1 * Math.sin(a), ...(edge ? (["sharp"] as const) : [])] as OutlinePoint);
  }
  for (let i = 0; i <= n; i++) {
    const a = -ph + ((ph + ph) * i) / n;
    if (i === 0 || i === n) continue;
    out.push([-d + R2 * Math.cos(a), R2 * Math.sin(a)]);
  }
  return out;
}

function starOutline(R: number, r: number, points = 4): OutlinePoint[] {
  const out: OutlinePoint[] = [];
  for (let i = 0; i < points * 2; i++) {
    const a = (i / (points * 2)) * Math.PI * 2 + Math.PI / 2;
    const rr = i % 2 ? r : R;
    out.push([rr * Math.cos(a), rr * Math.sin(a), "sharp"]);
  }
  return out;
}

const LEAF_OUT: OutlinePoint[] = [
  [0, 0, "sharp"],
  [0.012, 0.008],
  [0.03, 0.0075],
  [0.048, 0, "sharp"],
  [0.03, -0.0075],
  [0.012, -0.008],
];

export default function build() {
  const b = createBuilder({ name: "moonlitElvenLongbow", paintSize: 2048 });
  const root = b.joint("root", { at: [0, 0, 0], dir: [0, 1, 0] });
  const rand = rng(11);

  type Col = Parameters<typeof b.part>[1];
  const P = (g: THREE.BufferGeometry, color: Col, o: NonNullable<Parameters<typeof b.part>[2]> = {}) =>
    b.part(g, color, { bone: root, ...o });

  // --- bow centreline ------------------------------------------------------------------------------------------
  const pts: number[][] = [];
  for (let i = HALF.length - 1; i >= 1; i--) pts.push([HALF[i][1] + OX, Y0 - K * HALF[i][0], 0]);
  for (let i = 0; i < HALF.length; i++) pts.push([HALF[i][1] + OX, Y0 + K * HALF[i][0], 0]);
  const bowPath = catmull(pts);

  const tCache = new Map<number, number>();
  function tAtY(y: number) {
    const key = Math.round(y * 10000);
    const hit = tCache.get(key);
    if (hit !== undefined) return hit;
    let best = 0;
    let bd = 1e9;
    for (let i = 0; i <= 900; i++) {
      const t = i / 900;
      const d = Math.abs(bowPath.at(t).y - y);
      if (d < bd) {
        bd = d;
        best = t;
      }
    }
    tCache.set(key, best);
    return best;
  }
  function limbAt(y: number) {
    const t = tAtY(y);
    const p = bowPath.at(t);
    const T = bowPath.tangentAt(t).clone().normalize();
    const B = new THREE.Vector3(T.y, -T.x, 0).normalize();
    return { t, p, T, B, rx: rxAt(p.y), ry: ryAt(p.y) };
  }
  const radiusAtT = (t: number): [number, number] => {
    const y = bowPath.at(t).y;
    return [rxAt(y), ryAt(y)];
  };

  // gold collar ring round the limb at height y
  function ringAt(y: number, add: number, h: number, color: Col = GOLD) {
    const L = limbAt(y);
    const e = fitExtra(y);
    return P(new THREE.CylinderGeometry(1, 1, h, 12), color, {
      at: [L.p.x, L.p.y, L.p.z],
      dir: [L.T.x, L.T.y, L.T.z],
      up: [0, 0, 1],
      scale: [L.rx + e + add, 1, L.ry + e + add],
    });
  }

  // --- the bow --------------------------------------------------------------------------------------------------
  const bowPaint = paint((_p, n) => {
    const ax = Math.abs(n.x);
    if (ax > 0.7 && ax < 0.8) return GOLD;
    if (n.x >= 0.8) return BACK;
    if (n.x <= -0.8) return BELLY;
    return FACE;
  });
  const limbs = b.sweep(bowPath, radiusAtT, { bone: root, up: [0, 0, 1], sides: 10, color: bowPaint, name: "limbs" });

  // gilded tip sleeves
  const tLo = tAtY(Y0 - K * 0.93);
  const tHi = tAtY(Y0 + K * 0.93);
  for (const [from, to] of [
    [0, tLo],
    [tHi, 1],
  ] as const) {
    b.sweep(bowPath, (t) => [radiusAtT(t)[0] + 0.004, radiusAtT(t)[1] + 0.004], {
      bone: root,
      up: [0, 0, 1],
      from,
      to,
      sides: 10,
      color: GOLD,
      name: "tipSleeve",
    });
  }
  for (const s of [-1, 1]) {
    const nock = limbAt(Y0 + s * K * 0.915);
    ringAt(Y0 + s * K * 0.915, 0.006, 0.016, GOLD_D);
    ringAt(Y0 + s * K * 0.915 + s * 0.025, 0.0045, 0.008, GOLD);
    ringAt(Y0 + s * K * 0.915 - s * 0.025, 0.0045, 0.008, GOLD);
    void nock;
  }
  // moonstone bead on the upper tip
  {
    const tip = bowPath.at(1);
    glow(P(new THREE.SphereGeometry(0.012, 8, 6), "#d9fbff", { at: [tip.x, tip.y + 0.004, 0] }), 1.4);
  }
  // gilded leaf wings flaring from each tip sleeve
  for (const s of [1, -1]) {
    const L = limbAt(Y0 + s * K * 0.84);
    for (const f of [1, -1]) {
      b.extrude(
        [
          [0, 0, "sharp"],
          [0.015, 0.016],
          [0.04, 0.023],
          [0.075, 0.016],
          [0.108, 0.002, "sharp"],
          [0.05, 0.005],
        ],
        {
          at: [L.p.x, L.p.y, f * (L.ry + 0.003)],
          x: [L.T.x * s, L.T.y * s, 0],
          y: [0, 0, f],
          thickness: 0.006,
          bevel: 0.0015,
          smoothing: 1,
          color: GOLD,
          bone: root,
          name: "tipWing",
        },
      );
    }
  }

  // --- fittings (navy, gold-filigreed) above and below the grip -------------------------------------------------
  const fit = (s: 1 | -1) => {
    const ya = Y0 + s * FIT_NEAR;
    const yb = Y0 + s * FIT_FAR;
    const ta = tAtY(ya);
    const tb = tAtY(yb);
    return b.sweep(bowPath, (t) => {
      const y = bowPath.at(t).y;
      const e = fitExtra(y);
      const [rx, ry] = radiusAtT(t);
      return [rx + e + 0.003, ry + e * 0.95 + 0.003];
    }, {
      bone: root,
      up: [0, 0, 1],
      sides: 10,
      from: Math.min(ta, tb),
      to: Math.max(ta, tb),
      color: NAVY,
      caps: s > 0 ? { start: "flat", end: "round" } : { start: "round", end: "flat" },
      name: s > 0 ? "fittingUpper" : "fittingLower",
    });
  };
  const fitU = fit(1);
  const fitL = fit(-1);
  for (const s of [1, -1] as const) {
    ringAt(Y0 + s * (FIT_NEAR + 0.002), 0.006, 0.012, GOLD);
    ringAt(Y0 + s * (FIT_NEAR + 0.032), 0.002, 0.006, GOLD_D);
    ringAt(Y0 + s * (FIT_FAR - 0.004), 0.007, 0.012, GOLD);
  }
  // filigree decals on both faces of both fittings
  for (const [target, s] of [
    [fitU, 1],
    [fitL, -1],
  ] as const) {
    const yc = Y0 + s * 0.16;
    const L = limbAt(yc);
    for (const f of [1, -1]) {
      b.decal(target, FILIGREE, {
        at: [L.p.x, yc, f * 0.04],
        dir: [0, 0, f],
        up: [L.T.x * s, L.T.y * s, 0],
        size: [0.056, 0.15],
        segments: 14,
        bone: root,
        name: "filigree",
      });
    }
  }
  // gold rail lines running down both fittings
  const zAxis = new THREE.Vector3(0, 0, 1);
  for (const s of [1, -1]) {
    for (const phi of [38, 142, -38, -142]) {
      const rail: number[][] = [];
      for (let i = 0; i <= 10; i++) {
        const y = Y0 + s * (FIT_NEAR + 0.006 + ((FIT_FAR - FIT_NEAR - 0.014) * i) / 10);
        const L = limbAt(y);
        const e = fitExtra(y) + 0.003;
        const a = (phi * Math.PI) / 180;
        const q = L.p
          .clone()
          .addScaledVector(L.B, Math.cos(a) * (L.rx + e + 0.0015))
          .addScaledVector(zAxis, Math.sin(a) * (L.ry + e * 0.95 + 0.0015));
        rail.push(q.toArray());
      }
      b.sweep(catmull(rail), 0.0022, { bone: root, sides: 4, color: GOLD, name: "fitRail" });
    }
  }

  // --- grip ------------------------------------------------------------------------------------------------------
  const GX = 0.27 + OX;
  const wrap = paint((p) => {
    const a = Math.atan2(p.z, p.x - GX);
    const v = (((p.y / 0.032 + a / (2 * Math.PI)) % 1) + 1) % 1;
    return v < 0.2 ? GOLD : v < 0.6 ? TEAL : TEAL_D;
  });
  {
    const ta = tAtY(Y0 - 0.092);
    const tb = tAtY(Y0 + 0.08);
    b.sweep(bowPath, (t) => [radiusAtT(t)[0] + 0.007, radiusAtT(t)[1] + 0.006], {
      bone: root,
      up: [0, 0, 1],
      sides: 12,
      from: ta,
      to: tb,
      color: wrap,
      caps: "flat",
      name: "gripWrap",
    });
  }

  // moonstone bezels on the upper fitting, both faces
  for (const f of [1, -1]) {
    const yc = Y0 + 0.185;
    const L = limbAt(yc);
    const hit = b.surface(fitU).ray([L.p.x, yc, f * 1.0], [0, 0, -f]);
    if (hit) {
      b.stick(new THREE.CylinderGeometry(0.019, 0.023, 0.01, 8), GOLD, hit, { embed: 0.3, bone: root });
      glow(b.stick(new THREE.SphereGeometry(0.0145, 8, 6), "#e6fdff", hit.moved([0, 0.006, 0]), { embed: 0.2, bone: root }), 1.5);
    }
  }
  // gold crescent inlay on the lower fitting
  for (const f of [1, -1]) {
    const yc = Y0 - 0.185;
    const L = limbAt(yc);
    const hit = b.surface(fitL).ray([L.p.x, yc, f * 1.0], [0, 0, -f]);
    if (hit) {
      b.extrude(crescentOutline(0.02, 0.02, 0.011, 8), {
        at: [hit.at.x, hit.at.y, hit.at.z + f * 0.001],
        x: [f, 0, 0],
        y: [0, 1, 0],
        thickness: 0.004,
        color: GOLD,
        bone: root,
        name: "lowerCrescent",
      });
    }
  }
  // winged guard on the lower fitting
  for (const f of [1, -1]) {
    const L = limbAt(Y0 - 0.1);
    b.extrude(
      [
        [0, 0],
        [0.03, 0.004],
        [0.07, 0.03],
        [0.088, 0.078, "sharp"],
        [0.052, 0.052],
        [0.022, 0.036],
        [0, 0.032],
      ],
      {
        at: [L.p.x, Y0 - 0.1, f * 0.004],
        x: [0, 0, f],
        y: [0, 1, 0],
        thickness: 0.009,
        bevel: 0.0025,
        smoothing: 1,
        color: GOLD,
        bone: root,
        name: "guardWing",
      },
    );
  }

  // --- arrow rest + string + arrow ------------------------------------------------------------------------------
  const nockL = limbAt(Y0 - K * 0.915);
  const xs = nockL.p.x - nockL.rx - 0.001; // the string sits on the belly face of the nocks
  const stringTop = Y0 + K * 0.915;
  const stringBot = Y0 - K * 0.915;
  glow(
    b.sweep(polyline([[xs, stringBot, 0], [xs, stringTop, 0]]), 0.0042, {
      bone: root,
      sides: 6,
      color: "#e4fbff",
      caps: "flat",
      name: "string",
    }),
    0.9,
  );
  b.sweep(polyline([[xs, Y0 + 0.04, 0], [xs, Y0 + 0.17, 0]]), 0.0068, { bone: root, sides: 8, color: TEAL, caps: "flat", name: "serving" });
  for (const dy of [0.035, 0.175]) P(new THREE.SphereGeometry(0.0085, 8, 6), GOLD, { at: [xs, Y0 + dy, 0] });
  // string loops over the nocks
  for (const y of [stringBot, stringTop]) P(new THREE.TorusGeometry(0.0075, 0.0025, 5, 8), PEARL, { at: [xs, y, 0], dir: [1, 0, 0], axis: "z" });

  const yA = Y0 + 0.108;
  const xr = limbAt(yA).p.x;
  const zR = limbAt(yA).ry + fitExtra(yA) * 0.95 + 0.003 + 0.0075;
  const P0 = new THREE.Vector3(xs + 0.012, yA, 0.007);
  const ang = Math.atan2(zR - P0.z, xr - P0.x);
  const D = new THREE.Vector3(Math.cos(ang), 0, Math.sin(ang));
  const U = new THREE.Vector3(0, 1, 0);
  const W = new THREE.Vector3().crossVectors(D, U).normalize();
  const A = (s: number) => P0.clone().addScaledVector(D, s);
  const ARROW_L = 0.74;

  // arrow shelf
  P(new THREE.BoxGeometry(0.052, 0.006, 0.034), GOLD, { at: [xr, yA - 0.0125, zR - 0.004] });
  P(new THREE.BoxGeometry(0.052, 0.016, 0.006), GOLD_D, { at: [xr, yA - 0.006, zR + 0.015] });

  const shaftPaint = paint((p) => {
    const s = p.clone().sub(P0).dot(D);
    if ((s > 0.178 && s < 0.188) || (s > 0.232 && s < 0.242)) return GOLD;
    if (s > 0.188 && s < 0.232) return NAVY_B;
    if (s > 0.06 && s < 0.066) return TEAL;
    return ARROW_WOOD;
  });
  b.sweep(polyline([A(0.02), A(ARROW_L - 0.06)]), 0.0056, { bone: root, sides: 7, color: shaftPaint, caps: "flat", name: "shaft" });
  // nock
  P(new THREE.CylinderGeometry(0.0078, 0.0066, 0.028, 8), LAV, { at: A(0.012).toArray(), dir: D.toArray() });
  // fletching: three vanes
  const vane = paint((_p, _n, s) => (s[1] > 0.0145 ? TEAL : s[1] < 0.0075 ? LAV : PEARL));
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + Math.PI / 2;
    const R = U.clone().multiplyScalar(Math.cos(a)).addScaledVector(W, Math.sin(a));
    b.extrude(
      [
        [0, 0.004],
        [0.012, 0.021],
        [0.075, 0.023],
        [0.115, 0.016],
        [0.135, 0.004],
      ],
      {
        at: A(0.04).toArray(),
        x: D.toArray(),
        y: R.toArray(),
        thickness: 0.0016,
        smoothing: 1,
        color: vane,
        bone: root,
        name: "vane",
      },
    );
  }
  // head: socket, crossed blades, glowing fuller
  P(new THREE.CylinderGeometry(0.0085, 0.0058, 0.034, 8), GOLD, { at: A(ARROW_L - 0.07).toArray(), dir: D.toArray() });
  const blade: OutlinePoint[] = [
    [0, 0.005],
    [0.01, 0.0185],
    [0.034, 0.021],
    [0.058, 0.011],
    [0.078, 0, "sharp"],
    [0.058, -0.011],
    [0.034, -0.021],
    [0.01, -0.0185],
    [0, -0.005],
  ];
  const BLADE = cel("#f1f5ff", "#8d9bdc");
  for (const [yy, name] of [
    [U, "bladeA"],
    [W, "bladeB"],
  ] as const) {
    b.extrude(blade, { at: A(ARROW_L - 0.06).toArray(), x: D.toArray(), y: yy.toArray(), thickness: 0.0034, bevel: 0.001, smoothing: 1, color: BLADE, bone: root, name });
    glow(
      b.extrude(
        [
          [0.014, 0.0012],
          [0.04, 0.0032],
          [0.062, 0.0009],
          [0.04, -0.0032],
          [0.014, -0.0012],
        ],
        { at: A(ARROW_L - 0.06).toArray(), x: D.toArray(), y: yy.toArray(), thickness: 0.0042, color: RUNE_GLOW, bone: root, name: `${name}Fuller` },
      ),
      1.3,
    );
  }

  // --- runes and gold vines on the limbs ------------------------------------------------------------------------
  for (const s of [1, -1] as const) {
    for (const dy of [0.4, 0.57]) {
      const y = Y0 + s * dy;
      const L = limbAt(y);
      const w = Math.min(0.042, L.rx * 1.75);
      for (const f of [1, -1]) {
        glow(
          b.decal(limbs, RUNES, {
            at: [L.p.x, y, f * L.ry],
            dir: [0, 0, f],
            up: [L.T.x * s, L.T.y * s, 0],
            size: [w, w * 5],
            segments: 12,
            bone: root,
            name: "runes",
          }),
          1.2,
        );
      }
    }
  }
  const upZ = new THREE.Vector3(0, 0, 1);
  function vine(y0: number, y1: number, turns: number, n: number, phase: number) {
    const path: THREE.Vector3[] = [];
    const info: { pos: THREE.Vector3; o: THREE.Vector3; tan: THREE.Vector3 }[] = [];
    for (let i = 0; i <= n; i++) {
      const y = y0 + ((y1 - y0) * i) / n;
      const L = limbAt(y);
      const phi = phase + (turns * Math.PI * 2 * i) / n;
      const add = 0.0035;
      const o = L.B.clone().multiplyScalar(Math.cos(phi)).addScaledVector(upZ, Math.sin(phi));
      const pos = L.p.clone().addScaledVector(L.B, Math.cos(phi) * (L.rx + add)).addScaledVector(upZ, Math.sin(phi) * (L.ry + add));
      path.push(pos);
      info.push({ pos, o, tan: new THREE.Vector3() });
    }
    for (let i = 0; i <= n; i++) info[i].tan.copy(path[Math.min(i + 1, n)]).sub(path[Math.max(i - 1, 0)]).normalize();
    b.sweep(catmull(path), 0.0034, { bone: root, sides: 5, color: GOLD, caps: "round", name: "vine" });
    info.forEach((q, i) => {
      if (i % 3 !== 1) return;
      const side = (i / 3) % 2 ? 1 : -1;
      const x = q.tan.clone().applyAxisAngle(q.o, side * 0.7).normalize();
      const yv = new THREE.Vector3().crossVectors(q.o, x).normalize();
      b.extrude(LEAF_OUT, {
        at: q.pos.clone().addScaledVector(q.o, 0.001).toArray(),
        x: x.toArray(),
        y: yv.toArray(),
        thickness: 0.0032,
        smoothing: 1,
        color: i % 6 === 1 ? LEAF : LEAF_B,
        bone: root,
        name: "vineLeaf",
      });
    });
  }
  for (const s of [1, -1]) {
    vine(Y0 + s * 0.3, Y0 + s * 0.355, 1.5, 16, s > 0 ? 0 : Math.PI);
    vine(Y0 + s * 0.67, Y0 + s * 0.8, 3.2, 38, s > 0 ? 0.5 : Math.PI + 0.5);
  }
  // little gold studs along the belly edge of each limb
  for (const s of [1, -1]) {
    for (let i = 0; i < 6; i++) {
      const y = Y0 + s * (0.3 + i * 0.09);
      const L = limbAt(y);
      P(new THREE.SphereGeometry(0.0055, 6, 4), GOLD, { at: [L.p.x - L.rx * 0.92, y, 0.0] });
    }
  }

  // --- tassel -----------------------------------------------------------------------------------------------------
  {
    const yT = Y0 - 0.205;
    const L = limbAt(yT);
    ringAt(yT, 0.0075, 0.012, GOLD);
    const ax = L.p.x - L.rx - 0.03;
    const attach: [number, number, number] = [ax, yT, 0];
    P(new THREE.BoxGeometry(0.03, 0.007, 0.007), GOLD, { at: [L.p.x - L.rx - 0.012, yT, 0] });
    const tas = b.chain(
      "tassel",
      polyline([attach, [ax, yT - 0.075, 0], [ax, yT - 0.2, 0]]),
      { parent: root, names: ["tasselA", "tasselB", "tasselTip"], role: "tail" },
    );
    const [ja, jb] = tas.joints;
    b.part(new THREE.TorusGeometry(0.0085, 0.0025, 5, 8), GOLD, { at: attach, dir: [1, 0, 0], axis: "z", bone: ja });
    b.sweep(polyline([[ax, yT - 0.008, 0], [ax, yT - 0.07, 0]]), 0.0032, { bone: ja, sides: 5, color: LAV, name: "tasselCord" });
    b.part(new THREE.SphereGeometry(0.0125, 8, 6), GOLD, { at: [ax, yT - 0.045, 0], bone: ja });
    b.part(new THREE.SphereGeometry(0.0125, 8, 6), PEARL, { at: [ax, yT - 0.074, 0], bone: jb });
    b.lathe(
      [
        [0, 0],
        [0.011, 0],
        [0.015, -0.012],
        [0.013, -0.026],
        [0, -0.026],
      ],
      { at: [ax, yT - 0.082, 0], bone: jb, color: GOLD, segments: 8, name: "tasselHead" },
    );
    b.cards([frame([ax, yT - 0.106, 0], [0, 1, 0])], TASSEL_STRANDS, { size: [0.075, 0.115], lean: 180, flow: [0, 0, 1], cross: true, bone: jb });
    b.part(new THREE.SphereGeometry(0.008, 6, 4), RUNE_GLOW, { at: [ax, yT - 0.222, 0], bone: jb });
  }

  // --- silk ribbons ------------------------------------------------------------------------------------------------
  const ribbonPaint = paint((_p, _n, s) => {
    const t = s[0];
    if (t < 0.035) return GOLD;
    return t < 0.18 ? PEARL : t < 0.6 ? LAV : cel("#8d7bf0", "#5b4cc2");
  });
  const ribbon = (name: string, ya: number, pt: number[][], w0: number, tw: number) => {
    const L = limbAt(ya);
    ringAt(ya, 0.006, 0.012, GOLD);
    const path = catmull(pt.map(([dx, dy, z]) => [L.p.x + dx, ya + dy, z]));
    const ch = b.chain(name, path, { parent: root, up: [0, 0, 1], count: 5, twist: tw, role: "tail" });
    b.sweep(ch, (t) => [w0 * (1 - 0.42 * t), 0.0032], { section: "box", color: ribbonPaint, caps: "point", name });
  };
  ribbon("ribbonTop", Y0 + 0.225, [[0.02, 0, -0.012], [0.13, 0.045, -0.02], [0.25, -0.005, -0.02], [0.37, 0.04, -0.02], [0.5, -0.01, -0.02]], 0.044, 70);
  ribbon("ribbonLow", Y0 - 0.225, [[0.02, 0, -0.012], [0.14, -0.04, -0.02], [0.26, 0.0, -0.02], [0.4, -0.05, -0.02], [0.52, -0.01, -0.02]], 0.038, -60);

  // --- the stand --------------------------------------------------------------------------------------------------
  const sideStone = paint((_p, n, s) => {
    if (n.y > 0.6) return STONE;
    const blocks = Math.floor(s[1] / 15);
    if (s[0] > 0.016 && s[0] < 0.046 && blocks % 2 === 0) return STONE_CARVED;
    return STONE;
  });
  const plinth = (outline: OutlinePoint[], color: Col, name: string) =>
    b.lathe(outline, { at: [0, 0, 0], bone: root, color, segments: 20, name });
  plinth(
    [
      [0, 0],
      [0.49, 0],
      [0.5, 0.012],
      [0.5, 0.05],
      [0.48, 0.062],
      [0, 0.062],
    ],
    sideStone,
    "plinthBase",
  );
  plinth(
    [
      [0, 0.062],
      [0.425, 0.062],
      [0.431, 0.075],
      [0.425, 0.095],
      [0, 0.095],
    ],
    STONE,
    "plinthMid",
  );
  plinth(
    [
      [0, 0.095],
      [0.366, 0.095],
      [0.371, 0.108],
      [0.356, 0.12],
      [0, 0.12],
    ],
    STONE_LIGHT,
    "plinthTop",
  );
  for (const [r, y] of [
    [0.501, 0.0505],
    [0.431, 0.0955],
    [0.371, 0.1085],
  ] as const)
    plinth(
      [
        [r - 0.012, y - 0.004],
        [r + 0.003, y - 0.004],
        [r + 0.003, y + 0.004],
        [r - 0.012, y + 0.004],
      ],
      GOLD,
      "plinthTrim",
    );
  P(new THREE.CircleGeometry(0.345, 28), "#ffffff", { at: [0, 0.1214, 0], dir: [0, 1, 0], axis: "z", up: [0, 0, -1], texture: MOON_DISC, name: "moonDisc" });
  // pedestal and cup that hold the lower tip
  b.lathe(
    [
      [0, 0.12],
      [0.05, 0.12],
      [0.048, 0.132],
      [0.028, 0.148],
      [0.02, 0.168],
      [0.03, 0.18],
      [0, 0.18],
    ],
    { at: [0, 0, 0], bone: root, color: STONE_LIGHT, segments: 10, name: "pedestal" },
  );
  b.lathe(
    [
      [0.0, 0.186],
      [0.024, 0.2],
      [0.04, 0.232],
      [0.05, 0.238],
      [0.05, 0.23],
      [0.038, 0.19],
      [0.022, 0.168],
      [0.0, 0.168],
    ],
    { at: [0, 0, 0], bone: root, color: GOLD, segments: 10, name: "cup" },
  );

  // claw that cradles the lower limb, with its rod
  {
    const yc = 0.6;
    const L = limbAt(yc);
    const arc: number[][] = [];
    for (let i = 0; i <= 18; i++) {
      const phi = ((-150 + (300 * i) / 18) * Math.PI) / 180;
      const q = L.p.clone().addScaledVector(L.B, Math.cos(phi) * (L.rx + 0.011)).addScaledVector(upZ, Math.sin(phi) * (L.ry + 0.011));
      arc.push(q.toArray());
    }
    b.sweep(catmull(arc), 0.0065, { bone: root, sides: 6, color: GOLD, caps: "round", name: "claw" });
    for (const f of [-1, 1]) {
      const phi = (f * 150 * Math.PI) / 180;
      const q = L.p.clone().addScaledVector(L.B, Math.cos(phi) * (L.rx + 0.011)).addScaledVector(upZ, Math.sin(phi) * (L.ry + 0.011));
      glow(P(new THREE.SphereGeometry(0.0085, 6, 4), "#dffcff", { at: q.toArray() }), 1.3);
    }
    const end = L.p.clone().addScaledVector(L.B, L.rx + 0.011);
    const rod = catmull([[0.27, 0.12, 0], [0.33, 0.26, 0], [0.335, 0.42, 0], [end.x + 0.045, end.y - 0.05, 0], end.toArray()]);
    b.sweep(rod, [0.0135, 0.0095], {
      bone: root,
      sides: 8,
      color: GOLD_D,
      bands: [[0.1, GOLD], [0.46, LAV], [0.52, GOLD], [0.92, LAV], [1, GOLD]],
      name: "claw rod",
    });
    b.lathe(
      [
        [0, 0.12],
        [0.036, 0.12],
        [0.03, 0.134],
        [0.016, 0.148],
        [0, 0.148],
      ],
      { at: [0.27, 0, 0], bone: root, color: GOLD, segments: 8, name: "rodFoot" },
    );
  }

  // --- the halo crescent --------------------------------------------------------------------------------------------
  const CZ = -0.2;
  const R1 = 0.9;
  const R2 = 0.9;
  const CD = 0.2;
  const C1X = -0.3;
  const navyStar = paint((p) => {
    const c = cells(p, 0.085, 11);
    if (c.d1 < 0.07) return "#fff3c4";
    return c.id > 0.5 ? NAVY_B : NAVY;
  });
  b.extrude(crescentOutline(R1 + 0.014, R2 - 0.014, CD, 22), {
    at: [C1X, Y0, CZ],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.026,
    color: GOLD,
    bone: root,
    name: "crescentRim",
  });
  b.extrude(crescentOutline(R1, R2, CD, 22), {
    at: [C1X, Y0, CZ],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.032,
    bevel: 0.007,
    color: navyStar,
    bone: root,
    name: "crescent",
  });
  // gold inlay lines on the crescent face
  const arcLine = (cx: number, r: number, a0: number, a1: number, z: number) => {
    const out: number[][] = [];
    for (let i = 0; i <= 30; i++) {
      const a = ((a0 + ((a1 - a0) * i) / 30) * Math.PI) / 180;
      out.push([cx + r * Math.cos(a), Y0 + r * Math.sin(a), z]);
    }
    return out;
  };
  for (const f of [1, -1]) {
    const z = CZ + f * 0.0175;
    b.sweep(catmull(arcLine(C1X, R1 - 0.03, -70, 70, z)), 0.0032, { bone: root, sides: 5, color: GOLD, name: "crescentInlayOuter" });
    b.sweep(catmull(arcLine(C1X - CD, R2 + 0.03, -66, 66, z)), 0.0032, { bone: root, sides: 5, color: GOLD, name: "crescentInlayInner" });
  }
  // glowing stars and a constellation line set in both faces of the crescent
  for (const f of [1, -1]) {
    const degs = f > 0 ? [-58, -38, -18, 0, 18, 38, 58] : [-54, -34, -12, 8, 26, 44, 60];
    const spot = (deg: number) => {
      const a = (deg * Math.PI) / 180;
      const r = R1 - 0.5 * CD * Math.cos(a);
      return [C1X + r * Math.cos(a), Y0 + r * Math.sin(a), CZ + f * 0.0165];
    };
    degs.forEach((deg, i) => {
      const sz = i % 3 === 0 ? 0.026 : 0.017;
      glow(
        b.extrude(starOutline(sz, sz * 0.32), {
          at: spot(deg),
          x: [1, 0, 0],
          y: [0, 1, 0],
          thickness: 0.004,
          color: STAR_GLOW,
          bone: root,
          name: "crescentStar",
        }),
        1.1,
      );
    });
    glow(
      b.sweep(polyline(degs.map(spot)), 0.0016, { bone: root, sides: 4, color: STAR_GLOW, caps: "flat", name: "constellation" }),
      0.8,
    );
  }
  // crescent post, gold, from the plinth
  {
    const q = C1X + Math.sqrt(R1 * R1 - 0.52 * 0.52) - 0.012;
    b.sweep(catmull([[0.3, 0.12, CZ], [0.34, 0.3, CZ], [q, Y0 - 0.52, CZ]]), [0.016, 0.012], {
      bone: root,
      sides: 8,
      color: GOLD_D,
      bands: [[0.18, GOLD], [0.5, NAVY_B], [0.58, GOLD], [1, NAVY_B]],
      name: "post",
    });
    b.lathe(
      [
        [0, 0.12],
        [0.04, 0.12],
        [0.03, 0.136],
        [0.018, 0.15],
        [0, 0.15],
      ],
      { at: [0.3, 0, CZ], bone: root, color: GOLD, segments: 8, name: "postFoot" },
    );
  }
  // hanging star charms from both horns
  const horn = Math.sqrt(R1 * R1 - ((R2 * R2 - R1 * R1 - CD * CD) / (2 * CD)) ** 2);
  const hornX = C1X + (R2 * R2 - R1 * R1 - CD * CD) / (2 * CD);
  for (const s of [1, -1]) {
    const hy = Y0 + s * horn;
    const len = s > 0 ? 0.2 : 0.1;
    const name = s > 0 ? "charmTop" : "charmLow";
    const ch = b.chain(name, polyline([[hornX, hy - s * 0.006, CZ], [hornX, hy - s * 0.006 - len * 0.5, CZ], [hornX, hy - s * 0.006 - len, CZ]]), {
      parent: root,
      names: [name, `${name}B`, `${name}Tip`],
      role: "tail",
    });
    const [ja, jb] = ch.joints;
    b.part(new THREE.TorusGeometry(0.009, 0.0026, 5, 8), GOLD, { at: [hornX, hy - s * 0.004 + (s > 0 ? -0.006 : 0.006), CZ], dir: [1, 0, 0], axis: "z", bone: ja });
    b.sweep(polyline([[hornX, hy - s * 0.016, CZ], [hornX, hy - s * 0.006 - len + 0.03, CZ]]), 0.0026, { bone: ja, sides: 5, color: GOLD, name: "charmChain" });
    b.part(new THREE.SphereGeometry(0.0075, 6, 4), PEARL, { at: [hornX, hy - s * 0.006 - len * 0.5, CZ], bone: jb });
    b.extrude(starOutline(0.036, 0.012, 4), {
      at: [hornX, hy - s * 0.006 - len - 0.002, CZ],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.008,
      bevel: 0.002,
      color: GOLD,
      bone: jb,
      name: "charmStar",
    });
    glow(b.part(new THREE.SphereGeometry(0.0095, 6, 4), "#e0fcff", { at: [hornX, hy - s * 0.006 - len - 0.002, CZ + 0.006], bone: jb }), 1.4);
  }

  // --- plinth dressing: crystals, moon-lilies, fallen leaves -------------------------------------------------------
  const shard = (x: number, z: number, h: number, lean: [number, number], rad: number, tint: string) => {
    glow(
      P(new THREE.ConeGeometry(rad, h, 5), tint, {
        at: [x + lean[0] * h * 0.5, 0.095 + h * 0.5 - 0.004, z + lean[1] * h * 0.5],
        dir: [lean[0], 1, lean[1]],
        name: "shard",
      }),
      1.1,
    );
  };
  shard(-0.3, 0.25, 0.15, [-0.15, 0.1], 0.022, "#bff7ff");
  shard(-0.35, 0.2, 0.1, [-0.35, -0.05], 0.017, "#d9fbff");
  shard(-0.27, 0.29, 0.085, [0.1, 0.3], 0.016, "#9aeeff");
  shard(-0.33, 0.27, 0.06, [-0.4, 0.3], 0.012, "#e8fdff");

  const lily = (x: number, z: number, h: number, bx: number, bz: number, k: number) => {
    const top = [x + bx, 0.095 + h, z + bz];
    b.sweep(catmull([[x, 0.095, z], [x + bx * 0.1, 0.095 + h * 0.5, z + bz * 0.1], top]), [0.0045, 0.0032], { bone: root, sides: 5, color: STEM, name: "lilyStem" });
    const dir = [bx * 1.5, 1, bz * 1.5];
    b.ring(frame(top, dir), { count: 6, radius: 0.004, tilt: 58, fromDeg: 0, toDeg: 300 }, (item) =>
      b.spike(item, item, 0.042, 0.0105, { color: PEARL, bone: root, sides: 4, name: "petal" }),
    );
    glow(P(new THREE.SphereGeometry(0.0085, 6, 4), "#fff3b0", { at: [top[0], top[1] + 0.006, top[2]] }), 1.2);
    // one blade leaf at the base
    const a = k * 2.1;
    b.extrude(LEAF_OUT, {
      at: [x, 0.098, z],
      x: [Math.cos(a), 0, Math.sin(a)],
      y: [-Math.sin(a), 0, Math.cos(a)],
      thickness: 0.003,
      smoothing: 1,
      color: LEAF,
      bone: root,
      name: "lilyLeaf",
    });
  };
  lily(0.2, 0.33, 0.15, 0.03, 0.04, 0);
  lily(0.29, 0.28, 0.2, 0.05, 0.0, 1);
  lily(0.12, 0.37, 0.11, -0.01, 0.05, 2);

  // leaves strewn over the lower steps
  for (let i = 0; i < 14; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.445 + rand() * 0.035;
    const h = 0.0625;
    const hd = rand() * Math.PI * 2;
    const sc = 1.1 + rand() * 0.9;
    const col = i % 3 === 0 ? LAV : i % 3 === 1 ? LEAF : LEAF_B;
    const outline = LEAF_OUT.map(([x, y]) => [x * sc, y * sc] as OutlinePoint);
    b.extrude(outline, {
      at: [r * Math.cos(a), h + 0.0015, r * Math.sin(a)],
      x: [Math.cos(hd), 0, Math.sin(hd)],
      y: [-Math.sin(hd), 0, Math.cos(hd)],
      thickness: 0.0032,
      smoothing: 1,
      color: col,
      bone: root,
      name: "fallenLeaf",
    });
  }

  return b.root;
}
```
