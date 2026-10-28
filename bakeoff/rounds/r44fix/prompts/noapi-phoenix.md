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

These are complete, typecheck-clean reference modules. They are examples, not templates: design the requested subject yourself, reuse API shapes and construction techniques where useful, and do not copy a reference subject or its composition. The picker supplied three structural matches for topology winged.

## Example: thunderbirdSonnet

Brief: Category: Fantastical creature.
Subject: giant storm eagle with spread wings, indigo plumage, cream breastplate, gold talons and cyan lightning feather tips.
Style: Overwatch/League mix.
Topology: winged
Style family: overwatch-league
Notable features: spread-wings, flight-feathers, talons, lightning, beak

```ts
import * as THREE from "three";
import type { OutlinePoint } from "agentic-3js-builder";
import { createBuilder } from "agentic-3js-builder";
import { limb } from "agentic-3js-builder";
import { rng } from "agentic-3js-builder";
import { bezier, catmull } from "agentic-3js-builder";
import type { Paint } from "agentic-3js-builder";
import { countershade, mix, mottle, paint, scales, smoothstep } from "agentic-3js-builder";
import type { Joint } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Thunderbird",
  description:
    "A giant storm eagle, indigo plumage and cream breastplate, gold beak and talons, every flight feather tipped with crackling cyan lightning.",
  style: "Overwatch/League mix",
  commit: "88fc1f0",
};

// Palette: storm indigo plumage, cream chest, warm gold trim, one electric cyan accent.
const NIGHT = "#12163a";
const INDIGO_D = "#1f2557";
const INDIGO = "#2d3a8c";
const INDIGO_L = "#4656c8";
const LAV = "#8d97e6";
const CREAM = "#fbf0d2";
const CREAM_D = "#e0d0a2";
const IVORY = "#fffaea";
const GOLD = "#f2b73c";
const GOLD_D = "#b97a1e";
const GOLD_L = "#ffd96a";
const TALON = "#262a45";
const CYAN = "#37e8ff";
const CYAN_W = "#d6fcff";
const EYE = "#ffe45c";
const MOUTH = "#5a1630";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const DEGR = Math.PI / 180;

// Feather outlines: [u along length, lead half-width, trail half-width] as shares of the feather width.
type Row = [number, number, number];
const FLIGHT: Row[] = [
  [0, 0.1, 0.1],
  [0.16, 0.38, 0.6],
  [0.7, 0.4, 0.62],
  [0.9, 0.26, 0.42],
  [1, 0, 0],
];
const COVERT: Row[] = [
  [0, 0.1, 0.1],
  [0.16, 0.5, 0.5],
  [0.75, 0.5, 0.5],
  [0.93, 0.3, 0.3],
  [1, 0, 0],
];
const TAILF: Row[] = [
  [0, 0.14, 0.14],
  [0.1, 0.5, 0.5],
  [0.78, 0.5, 0.5],
  [0.92, 0.36, 0.36],
  [1, 0, 0],
];

function rowAt(rows: Row[], u: number): [number, number] {
  for (let i = 1; i < rows.length; i++) {
    if (u <= rows[i][0]) {
      const f = (u - rows[i - 1][0]) / (rows[i][0] - rows[i - 1][0]);
      return [
        rows[i - 1][1] + (rows[i][1] - rows[i - 1][1]) * f,
        rows[i - 1][2] + (rows[i][2] - rows[i - 1][2]) * f,
      ];
    }
  }
  return [0, 0];
}

function outline(rows: Row[], L: number, W: number, u0 = 0): OutlinePoint[] {
  const [l0, t0] = rowAt(rows, u0);
  const pts: Row[] = [[u0, l0, t0], ...rows.filter((r) => r[0] > u0)];
  const out: OutlinePoint[] = pts.map((r, i): OutlinePoint => (i === pts.length - 1 ? [L, 0, "sharp"] : [r[0] * L, r[1] * W]));
  for (let i = pts.length - 2; i >= 0; i--) out.push([pts[i][0] * L, -pts[i][2] * W]);
  return out;
}

const FEATHER = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64"><path d="M16 1 L27 22 L24 44 L16 63 L8 44 L5 22 Z" fill="#ececec"/><path d="M16 4 L16 62" stroke="#a4a4a4" stroke-width="2"/><path d="M16 16 L25 30 M16 28 L23 42 M16 16 L7 30 M16 28 L9 42" stroke="#c2c2c2" stroke-width="1.6" fill="none"/></svg>`,
  { size: 128 },
);

const MASK = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32"><path d="M0 12 L22 6 L58 10 L64 14 L52 20 L30 19 L24 28 L18 20 L0 18Z" fill="${NIGHT}"/><path d="M28 17 L35 12 L39 16 L48 11 L56 14" stroke="${CYAN}" stroke-width="2" fill="none"/></svg>`,
  { size: 256 },
);

const BOLT_OUTLINE: OutlinePoint[] = [
  [0.62, 1],
  [0.22, 0.5],
  [0.46, 0.5],
  [0.3, 0],
  [0.82, 0.58],
  [0.56, 0.58],
  [0.84, 1],
];

const keyed =
  (keys: [number, number, number][]) =>
  (t: number): [number, number] => {
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const f = (t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]);
        return [
          keys[i - 1][1] + (keys[i][1] - keys[i - 1][1]) * f,
          keys[i - 1][2] + (keys[i][2] - keys[i - 1][2]) * f,
        ];
      }
    }
    const last = keys[keys.length - 1];
    return [last[1], last[2]];
  };

export default function build() {
  const b = createBuilder({ name: "thunderbird", paintSize: 2048 });
  const rand = rng(2024);

  // ---------- helpers ----------
  type PlateOpts = {
    root: THREE.Vector3;
    dir: THREE.Vector3;
    normal: THREE.Vector3;
    ref: THREE.Vector3;
    rows: Row[];
    L: number;
    W: number;
    thick: number;
    color: string | Paint;
    bone: Joint;
    lift?: number;
    u0?: number;
    name?: string;
  };
  const plate = (o: PlateOpts) => {
    const dir = o.dir.clone().normalize();
    const y = new THREE.Vector3().crossVectors(o.normal, dir).normalize();
    if (y.dot(o.ref) < 0) y.negate();
    const at = o.root.clone().addScaledVector(o.normal, o.lift ?? 0);
    return b.extrude(outline(o.rows, o.L, o.W, o.u0 ?? 0), {
      at,
      x: dir,
      y,
      thickness: o.thick,
      bevel: o.thick * 0.3,
      detail: 0.34,
      color: o.color,
      bone: o.bone,
      name: o.name,
    });
  };

  const featherPaint = (L: number, dark: string, base: string, light: string, band: string | null) =>
    paint((_p, n, s) => {
      const u = s[0] / L;
      const shaft = Math.abs(s[1]) < 0.0065 && u > 0.04 && u < 0.97;
      if (n.y < -0.4) {
        if (shaft) return CREAM;
        return u > 0.7 && u < 0.78 && band ? CREAM : mix(base, LAV, 0.55);
      }
      if (shaft) return light;
      if (band && u > 0.69 && u < 0.77) return band;
      const col = mix(dark, base, smoothstep(0.02, 0.55, u));
      return s[1] > 0 ? mix(col, light, 0.22 * smoothstep(0.1, 0.9, u)) : col;
    });

  const bolt = (
    a: THREE.Vector3,
    c: THREE.Vector3,
    o: { bone: Joint; seg?: number; amp?: number; r?: number; seed?: number },
  ) => {
    const seg = o.seg ?? 5;
    const amp = o.amp ?? 0.08;
    const r = rng(o.seed ?? 1);
    const dir = c.clone().sub(a);
    const ref = Math.abs(dir.clone().normalize().y) > 0.9 ? V(1, 0, 0) : UP;
    const p1 = new THREE.Vector3().crossVectors(dir, ref).normalize();
    const p2 = new THREE.Vector3().crossVectors(dir, p1).normalize();
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= seg; i++) {
      const q = a.clone().lerp(c, i / seg);
      if (i > 0 && i < seg) q.addScaledVector(p1, (r() - 0.5) * 2 * amp).addScaledVector(p2, (r() - 0.5) * 2 * amp);
      pts.push(q);
    }
    const rad = o.r ?? 0.016;
    glow(b.sweep(pts, [rad, rad * 0.5], { bone: o.bone, color: CYAN, section: { ngon: 4 }, caps: "flat" }), 1.4);
    glow(
      b.sweep(pts, [rad * 0.45, rad * 0.25], { bone: o.bone, color: CYAN_W, section: { ngon: 4 }, caps: "flat" }),
      1.8,
    );
    return pts;
  };

  // ---------- skeleton: spine and neck ----------
  const hips = b.joint("hips", { at: [0, 1.2, -0.2], dir: [0, 0.6, 0.4], role: "spine" });
  const bodyPath = catmull([
    [0, 1.2, -0.2],
    [0, 1.42, 0.02],
    [0, 1.72, 0.25],
    [0, 2.0, 0.42],
    [0, 2.22, 0.52],
    [0, 2.38, 0.66],
  ]);
  const tN = bodyPath.closestT([0, 2.0, 0.42]);
  const spine = b.chain("spine", bodyPath.slice(0, tN), { parent: hips, count: 3, role: "spine" });
  const spineTop = spine.spanJoints[2];
  const neck = b.chain("neck", bodyPath.slice(tN, 1), { parent: spineTop, count: 3, role: "neck" });
  const head = b.joint("head", { parent: neck.spanJoints[2], at: bodyPath.at(1), dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.06, up: -0.08 }),
    aim: head.local({ forward: 0.3, up: -0.09 }),
    role: "jaw",
  });
  const crest = b.joint("crest", {
    parent: head,
    at: head.local({ forward: -0.05, up: 0.12 }),
    aim: head.local({ forward: -0.25, up: 0.25 }),
    role: "hinge",
  });

  // ---------- body ----------
  const bodyPaint = countershade(
    scales([INDIGO, INDIGO_L, INDIGO], NIGHT, { size: 0.1, width: 0.1 }),
    scales(CREAM, CREAM_D, { size: 0.075, width: 0.1 }),
    { level: -0.1, soft: 0.3 },
  );
  const body = b.sweep(bodyPath, keyed([
    [0, 0.29, 0.26],
    [0.21, 0.4, 0.33],
    [0.47, 0.49, 0.4],
    [0.62, 0.44, 0.37],
    [0.7, 0.35, 0.3],
    [0.86, 0.24, 0.22],
    [1, 0.17, 0.16],
  ]), {
    bone: [spine, neck],
    color: paint((_p, _n, s) => (s[0] > 0.78 ? IVORY : bodyPaint)),
    name: "body",
  });
  const skin = b.surface(body);

  // collar and chest gem
  const collarLoop = skin.loop(neck.spanJoints[0], { lift: 0.012 });
  b.sweep(collarLoop, [0.03, 0.012], { section: "box", color: GOLD, name: "collar" });
  b.sweep(skin.loop(neck.spanJoints[0], { lift: 0.014 }), [0.008, 0.014], {
    section: "box",
    color: GOLD_D,
    shift: [0, 0],
    name: "collarEdge",
  });
  const chestHit = skin.ray([0, 1.78, 2], [0, 0, -1]);
  if (chestHit) {
    b.stick(new THREE.CylinderGeometry(0.1, 0.115, 0.04, 8), GOLD, chestHit, { embed: 0.45, name: "gemBase" });
    glow(b.stick(new THREE.OctahedronGeometry(0.075), CYAN, chestHit.moved([0, 0.04, 0]), { embed: 0.2, name: "gem" }), 1.6);
  }
  for (const s of [1, -1]) {
    const rough = catmull([
      [s * 0.2, 2.02, 0.7],
      [s * 0.27, 1.86, 0.78],
      [s * 0.25, 1.62, 0.68],
      [s * 0.15, 1.42, 0.5],
    ]);
    glow(b.sweep(skin.drape(rough, { lift: 0.012 }), 0.011, { color: CYAN, section: { ngon: 4 }, name: "conduit" }), 1.3);
  }

  // feather cards: neck ruff, breast fringe, mantle
  b.cards(
    skin.scatter(80, {
      rng: rng(11),
      minDist: 0.085,
      filter: (h) => h.at.y > 2.06 && h.at.y < 2.36 && h.n.y > -0.3,
    }),
    FEATHER,
    { size: [0.12, 0.21], lean: 50, flow: [0, -1, -0.35], bend: 20, vary: 0.25, rng: rng(12), color: IVORY },
  );
  b.cards(
    skin.scatter(170, {
      rng: rng(13),
      minDist: 0.08,
      filter: (h) => h.at.y > 1.32 && h.at.y < 2.0 && h.n.z > 0.1 && h.n.y > -0.75,
    }),
    FEATHER,
    { size: [0.13, 0.21], lean: 58, flow: [0, -1, -0.1], bend: 18, vary: 0.2, rng: rng(14), color: CREAM },
  );
  b.cards(
    skin.scatter(110, {
      rng: rng(15),
      minDist: 0.09,
      filter: (h) => h.at.y > 1.5 && h.n.y > 0.4 && h.n.z < 0.2,
    }),
    FEATHER,
    { size: [0.14, 0.24], lean: 62, flow: [0, -0.3, -1], bend: 16, vary: 0.25, rng: rng(16), color: INDIGO_L },
  );

  // ---------- head ----------
  const skull = b.part(new THREE.SphereGeometry(1, 12, 8), IVORY, {
    bone: head,
    at: head.local({ forward: 0.04, up: 0.01 }),
    scale: [0.172, 0.16, 0.21],
    name: "skull",
  });
  // beak
  const bk0 = head.local({ forward: 0.15, up: -0.015 });
  const upperPath = bezier(
    bk0,
    head.local({ forward: 0.27, up: 0.03 }),
    head.local({ forward: 0.375, up: -0.01 }),
    head.local({ forward: 0.37, up: -0.17 }),
  );
  b.sweep(upperPath, (t) => [0.085 * (1 - t) ** 0.8 + 0.006, 0.1 * (1 - t) ** 0.7 + 0.006], {
    bone: head,
    color: (t) => (t > 0.84 ? TALON : GOLD),
    sectors: [[-28, 28, GOLD_L]],
    sides: 8,
    name: "upperBeak",
  });
  b.sweep(
    [
      head.local({ forward: 0.08, up: -0.075 }),
      head.local({ forward: 0.2, up: -0.088 }),
      head.local({ forward: 0.31, up: -0.082 }),
      head.local({ forward: 0.345, up: -0.062 }),
    ],
    [0.065, 0.014],
    { bone: jaw, color: (t) => (t > 0.86 ? TALON : GOLD_D), sides: 8, name: "lowerBeak" },
  );
  b.sweep(
    [head.local({ forward: 0.12, up: -0.052 }), head.local({ forward: 0.33, up: -0.058 })],
    0.028,
    { bone: head, color: MOUTH, sides: 6, name: "mouth" },
  );
  b.part(new THREE.SphereGeometry(1, 8, 6), GOLD_D, {
    bone: head,
    at: head.local({ forward: 0.15, up: 0.0 }),
    scale: [0.085, 0.075, 0.07],
    name: "cere",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.014, 6, 4), NIGHT, {
      bone: head,
      at: head.local({ left: s * 0.032, forward: 0.2, up: 0.032 }),
      name: "nostril",
    });
    // eye
    const E = head.local({ left: s * 0.122, up: 0.06, forward: 0.115 });
    const out = V(s * 0.7, 0.1, 0.7).normalize();
    b.part(new THREE.TorusGeometry(0.054, 0.013, 5, 10), GOLD, { bone: head, at: E, dir: out, axis: "z", name: "eyeRing" });
    glow(b.part(new THREE.SphereGeometry(0.046, 8, 6), EYE, { bone: head, at: E, name: "eye" }), 1.5);
    b.part(new THREE.SphereGeometry(1, 6, 4), NIGHT, {
      bone: head,
      at: E.clone().addScaledVector(out, 0.043),
      scale: [0.011, 0.028, 0.011],
      name: "pupil",
    });
    glow(
      b.part(new THREE.SphereGeometry(0.009, 5, 4), IVORY, {
        bone: head,
        at: E.clone().addScaledVector(out, 0.041).add(V(-s * 0.013, 0.024, 0.004)),
        name: "glint",
      }),
      1.5,
    );
    // brow plate
    b.sweep(
      [
        head.local({ left: s * 0.065, up: 0.128, forward: 0.2 }),
        head.local({ left: s * 0.14, up: 0.125, forward: 0.12 }),
        head.local({ left: s * 0.165, up: 0.095, forward: 0.0 }),
      ],
      [0.038, 0.018],
      { bone: head, color: INDIGO_D, sides: 6, name: "brow" },
    );
    b.decal(skull, MASK, {
      at: head.local({ left: s * 0.16, up: 0.04, forward: 0.04 }),
      dir: [s, 0, 0.1],
      size: [0.3, 0.15],
      mirror: s > 0,
      lift: 0.003,
      name: "mask",
    });
  }
  // crest of ivory blades with lightning tips
  for (const s of [1, -1]) {
    for (let k = 0; k < 5; k++) {
      const e = (12 + k * 14) * DEGR;
      const dir = V(s * 0.28, Math.sin(e), -Math.cos(e));
      const L = 0.34 + 0.06 * Math.sin((k / 4) * Math.PI);
      const root = head.local({ left: s * 0.045, up: 0.115, forward: -0.03 - k * 0.012 });
      plate({
        root,
        dir,
        normal: V(1, 0, 0),
        ref: UP,
        rows: FLIGHT,
        L,
        W: 0.13,
        thick: 0.014,
        color: k % 2 ? CREAM : IVORY,
        bone: crest,
        lift: s * 0.002 * k,
        name: "crestBlade",
      });
      glow(
        plate({
          root,
          dir,
          normal: V(1, 0, 0),
          ref: UP,
          rows: FLIGHT,
          L,
          W: 0.13,
          thick: 0.018,
          color: CYAN,
          bone: crest,
          lift: s * 0.002 * k,
          u0: 0.8,
          name: "crestTip",
        }),
        1.4,
      );
    }
  }
  // lightning mane: three glowing bolts rising behind the head
  for (const [k, ang] of [
    [0, 14],
    [1, 38],
    [2, -38],
  ] as [number, number][]) {
    const a = ang * DEGR;
    glow(
      b.extrude(
        BOLT_OUTLINE.map((p): OutlinePoint => [p[0] * (k === 0 ? 0.7 : 0.5), p[1] * (k === 0 ? 0.6 : 0.42)]),
        {
          at: head.local({ forward: -0.17, up: 0.1, left: Math.sin(a) * 0.1 }),
          x: V(Math.sin(a), 0, -Math.cos(a)),
          y: V(0, 0.95, -0.25),
          thickness: 0.03,
          bevel: 0.006,
          detail: 0.34,
          color: k === 0 ? CYAN_W : CYAN,
          bone: crest,
          name: "maneBolt",
        },
      ),
      1.6,
    );
  }

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.12, -0.36],
      [0, 0.98, -0.7],
      [0, 0.8, -1.0],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  b.sweep(tail, [0.15, 0.08], { color: INDIGO_D, name: "tailBase" });
  const d0 = V(0, -0.5, -0.9).normalize();
  const tailN = new THREE.Vector3().crossVectors(V(1, 0, 0), d0).normalize();
  const tailBase = V(0, 0.99, -0.58);
  const tailBone = tail.spanJoints[1];
  for (let layer = 0; layer < 2; layer++) {
    const n = layer === 0 ? 9 : 8;
    for (let i = 0; i < n; i++) {
      const k = layer === 0 ? i - 4 : i - 3.5;
      const dir = d0.clone().applyAxisAngle(tailN, k * 8.8 * DEGR * (layer === 0 ? 1 : 1.0));
      const L = (layer === 0 ? 1.32 : 1.18) - 0.012 * k * k;
      const root = tailBase.clone().addScaledVector(V(1, 0, 0), k * 0.018);
      const lift = layer === 0 ? 0.012 + 0.004 * (4 - Math.abs(k)) : -0.03;
      const col = featherPaint(L, NIGHT, layer === 0 ? INDIGO : INDIGO_D, INDIGO_L, CREAM);
      plate({ root, dir, normal: tailN, ref: V(1, 0, 0), rows: TAILF, L, W: 0.24, thick: 0.014, color: col, bone: tailBone, lift, name: "tailFeather" });
      glow(
        plate({
          root,
          dir,
          normal: tailN,
          ref: V(1, 0, 0),
          rows: TAILF,
          L,
          W: 0.24,
          thick: 0.018,
          color: CYAN,
          bone: tailBone,
          lift,
          u0: 0.84,
          name: "tailTip",
        }),
        1.3,
      );
    }
  }
  for (let i = 0; i < 7; i++) {
    const k = i - 3;
    const dir = d0.clone().applyAxisAngle(tailN, k * 11 * DEGR);
    plate({
      root: tailBase.clone().addScaledVector(V(1, 0, 0), k * 0.03).addScaledVector(d0, -0.1),
      dir,
      normal: tailN,
      ref: V(1, 0, 0),
      rows: COVERT,
      L: 0.5 - 0.02 * Math.abs(k),
      W: 0.22,
      thick: 0.016,
      color: featherPaint(0.5, INDIGO_D, INDIGO_L, LAV, null),
      bone: tailBone,
      lift: 0.045,
      name: "tailCovert",
    });
  }

  // ---------- legs ----------
  const FLOOR = 0;
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipPos = V(s * 0.22, 1.12, -0.1);
    const foot = V(s * 0.3, 0.24, 0.32);
    const pts = limb(hipPos, foot, [0.42, 0.52, 0.38], [[0, 0, 1], [0, 0, -1]]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `ankle${side}`],
      role: "leg",
    });
    const trouser = mottle(CREAM, CREAM_D, { size: 0.12 });
    const scutes = scales(GOLD, GOLD_D, { size: 0.045, width: 0.14 });
    const legSweep = b.sweep(
      leg,
      keyed([
        [0, 0.2, 0.2],
        [0.3, 0.14, 0.14],
        [0.5, 0.115, 0.115],
        [0.7, 0.085, 0.085],
        [0.76, 0.058, 0.058],
        [1, 0.052, 0.052],
      ]),
      { color: paint((_p, _n, t) => (t[0] > 0.74 ? scutes : trouser)), sides: 8, name: "leg" },
    );
    b.cards(
      b.surface(legSweep).scatter(44, {
        rng: rng(30 + (s > 0 ? 1 : 2)),
        minDist: 0.08,
        filter: (h) => h.at.y > 0.62,
      }),
      FEATHER,
      { size: [0.12, 0.2], lean: 55, flow: [0, -1, 0], bend: 15, vary: 0.2, rng: rng(33), color: CREAM },
    );
    // anklet
    const ank = leg.at(0.86);
    b.lathe(
      [
        [0.058, -0.045],
        [0.088, -0.045],
        [0.088, 0.045],
        [0.058, 0.045],
      ],
      { at: ank, axis: ank, bone: leg.spanJoints[2], color: GOLD, segments: 8, name: "anklet" },
    );
    glow(
      b.lathe(
        [
          [0.058, -0.012],
          [0.095, -0.012],
          [0.095, 0.012],
          [0.058, 0.012],
        ],
        { at: ank, axis: ank, bone: leg.spanJoints[2], color: CYAN, segments: 8, name: "ankletGlow" },
      ),
      1.4,
    );
    const ankleJ = leg.tip as Joint;
    // toes
    const toeDirs: [string, number][] = [
      ["A", -30],
      ["B", 0],
      ["C", 30],
    ];
    for (const [tag, ang] of toeDirs) {
      const a = (ang + s * 4) * DEGR;
      const dir = V(Math.sin(a), 0, Math.cos(a));
      const p0 = foot.clone();
      const p1 = foot.clone().addScaledVector(dir, 0.17).add(V(0, -0.13, 0));
      const p2 = p1.clone().addScaledVector(dir, 0.17).add(V(0, -0.06, 0));
      const toe = b.chain(`toe${tag}${side}`, [p0, p1, p2], {
        parent: ankleJ,
        names: [`toe${tag}${side}1`, `toe${tag}${side}2`, `toe${tag}${side}3`],
        role: "digit",
      });
      b.sweep(toe, [0.058, 0.044], {
        color: paint(() => scutes),
        sides: 6,
        name: "toe",
      });
      b.part(new THREE.SphereGeometry(0.056, 6, 4), GOLD_D, { bone: toe.spanJoints[0], at: p1, name: "knuckle" });
      const tip = p2.clone().addScaledVector(dir, 0.11).add(V(0, -0.05 - 0.0, 0));
      b.sweep(bezier(p2, p2.clone().addScaledVector(dir, 0.08).add(V(0, 0.01, 0)), tip), [0.044, 0], {
        bone: toe.tip as Joint,
        color: TALON,
        sides: 6,
        name: "claw",
      });
      // scorch spark running off each claw along the floor
      bolt(V(tip.x, FLOOR + 0.014, tip.z), V(tip.x + dir.x * 0.4, FLOOR + 0.014, tip.z + dir.z * 0.4), {
        bone: toe.tip as Joint,
        seg: 3,
        amp: 0.05,
        r: 0.01,
        seed: 100 + Math.round(ang) + (s > 0 ? 7 : 0),
      });
    }
    // hallux
    const h0 = foot.clone().add(V(-s * 0.01, -0.03, -0.02));
    const h1 = foot.clone().add(V(0, -0.1, -0.13));
    const h2 = h1.clone().add(V(0, -0.075, -0.1));
    const hal = b.chain(`hallux${side}`, [h0, h1, h2], {
      parent: ankleJ,
      names: [`hallux${side}1`, `hallux${side}2`, `hallux${side}3`],
      role: "digit",
    });
    b.sweep(hal, [0.06, 0.045], { color: paint(() => scutes), sides: 6, name: "hallux" });
    b.sweep(bezier(h2, h2.clone().add(V(0, 0, -0.06)), h2.clone().add(V(0, -0.075, -0.05))), [0.05, 0], {
      bone: hal.tip as Joint,
      color: TALON,
      sides: 6,
      name: "halluxClaw",
    });
  }

  // ---------- wings ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(
      `wing${side}`,
      catmull([
        [s * 0.3, 1.95, 0.22],
        [s * 1.4, 2.02, 0.04],
        [s * 2.35, 2.1, 0.2],
        [s * 3.05, 2.15, 0.1],
      ]),
      {
        parent: spineTop,
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
        role: "wing",
      },
    );
    b.sweep(arm, (t): [number, number] => [0.125 - 0.065 * t, 0.062 - 0.03 * t], { color: CREAM, sides: 8, name: "armTube" });
    for (const t of [0.12, 0.4]) {
      const bf = arm.at(t);
      b.lathe(
        [
          [0.07, -0.032],
          [0.14, -0.032],
          [0.14, 0.032],
          [0.07, 0.032],
        ],
        { at: bf, axis: bf, bone: arm.jointAt(t), color: GOLD, segments: 8, name: "armBand" },
      );
      glow(
        b.lathe(
          [
            [0.07, -0.008],
            [0.146, -0.008],
            [0.146, 0.008],
            [0.07, 0.008],
          ],
          { at: bf, axis: bf, bone: arm.jointAt(t), color: CYAN, segments: 8, name: "armBandGlow" },
        ),
        1.4,
      );
    }
    // pauldron cap over the shoulder: indigo dome, gold rim, cyan core
    const pd = V(s * 0.45, 1.97, 0.2);
    b.lathe(
      [
        [0, 0],
        [0.19, 0],
        [0.19, 0.03],
        [0.155, 0.09],
        [0.08, 0.135],
        [0, 0.15],
      ],
      { at: pd, axis: [s, 0, 0], bone: arm.spanJoints[0], color: INDIGO_L, segments: 10, name: "pauldron" },
    );
    b.lathe(
      [
        [0.185, -0.012],
        [0.215, -0.012],
        [0.215, 0.034],
        [0.185, 0.034],
      ],
      { at: pd, axis: [s, 0, 0], bone: arm.spanJoints[0], color: GOLD, segments: 10, name: "pauldronRim" },
    );
    glow(
      b.part(new THREE.OctahedronGeometry(0.05), CYAN, {
        bone: arm.spanJoints[0],
        at: pd.clone().add(V(s * 0.15, 0.02, 0)),
        name: "pauldronGem",
      }),
      1.6,
    );
    const ts = arm.ts;
    const R = V(s, 0, 0);
    const dirOf = (aDeg: number) => V(s * Math.sin(aDeg * DEGR), -0.04, -Math.cos(aDeg * DEGR)).normalize();

    type Fe = { t: number; bone: Joint; a: number; L: number; W: number; k: number; tips: boolean };
    const feathers: Fe[] = [];
    // tertials
    for (let i = 0; i < 7; i++) {
      const f = i / 6;
      feathers.push({ t: ts[1] * (0.3 + 0.68 * f), bone: arm.spanJoints[0], a: -16 + 14 * f, L: 0.8 + 0.4 * f, W: 0.23, k: i, tips: false });
    }
    // secondaries
    for (let i = 0; i < 10; i++) {
      const f = i / 9;
      feathers.push({ t: ts[1] + (ts[2] - ts[1]) * (0.04 + 0.92 * f), bone: arm.spanJoints[1], a: -2 + 14 * f, L: 1.28 - 0.1 * f, W: 0.2, k: i, tips: true });
    }
    // primaries
    const primL = [1.42, 1.48, 1.52, 1.52, 1.47, 1.4, 1.3, 1.17, 1.02, 0.86];
    for (let i = 0; i < 10; i++) {
      const f = i / 9;
      feathers.push({ t: ts[2] + (1 - ts[2]) * (0.05 + 0.9 * f), bone: arm.spanJoints[2], a: 28 + 66 * f, L: primL[i], W: 0.17, k: i, tips: true });
    }
    const primaryTips: THREE.Vector3[] = [];
    for (const fe of feathers) {
      const root = arm.path.at(fe.t);
      const dir = dirOf(fe.a);
      const lift = -0.025 + 0.004 * fe.k;
      plate({
        root,
        dir,
        normal: UP,
        ref: V(0, 0, 1),
        rows: FLIGHT,
        L: fe.L,
        W: fe.W,
        thick: 0.013,
        color: featherPaint(fe.L, NIGHT, INDIGO, INDIGO_L, CREAM),
        bone: fe.bone,
        lift,
        name: "flight",
      });
      if (fe.tips) {
        glow(
          plate({
            root,
            dir,
            normal: UP,
            ref: V(0, 0, 1),
            rows: FLIGHT,
            L: fe.L,
            W: fe.W,
            thick: 0.017,
            color: CYAN,
            bone: fe.bone,
            lift,
            u0: 0.84,
            name: "flightTip",
          }),
          1.3,
        );
      }
      if (fe.bone === arm.spanJoints[2]) primaryTips.push(root.clone().addScaledVector(dir, fe.L));
      // greater coverts
      plate({
        root: root.clone().addScaledVector(dir, 0.05),
        dir,
        normal: UP,
        ref: V(0, 0, 1),
        rows: COVERT,
        L: 0.42 * fe.L + 0.1,
        W: fe.W * 1.05,
        thick: 0.013,
        color: featherPaint(0.42 * fe.L + 0.1, INDIGO, INDIGO_L, "#7a89f0", CREAM),
        bone: fe.bone,
        lift: 0.03 + 0.003 * fe.k,
        name: "covertA",
      });
      // median coverts, offset between the greater ones
      plate({
        root: root.clone().addScaledVector(dir, 0.0).addScaledVector(R, 0.04),
        dir: dirOf(fe.a + 3),
        normal: UP,
        ref: V(0, 0, 1),
        rows: COVERT,
        L: 0.24 * fe.L + 0.06,
        W: fe.W,
        thick: 0.013,
        color: featherPaint(0.24 * fe.L + 0.06, INDIGO_L, "#6a7af0", CREAM, null),
        bone: fe.bone,
        lift: 0.055 + 0.003 * fe.k,
        name: "covertB",
      });
    }
    // leading-edge cream coverts along the arm
    for (let i = 0; i < 14; i++) {
      const t = 0.04 + 0.93 * (i / 13);
      const bone = arm.jointAt(t);
      plate({
        root: arm.path.at(t).add(V(0, 0, 0.02)),
        dir: dirOf(20 + 62 * (i / 13)),
        normal: UP,
        ref: V(0, 0, 1),
        rows: COVERT,
        L: 0.2,
        W: 0.15,
        thick: 0.014,
        color: featherPaint(0.2, CREAM_D, CREAM, IVORY, null),
        bone,
        lift: 0.085 + 0.002 * i,
        name: "covertC",
      });
    }
    // gold wrist guard, gem and claw
    const wf = arm.at(ts[2] + 0.05);
    b.lathe(
      [
        [0.06, -0.07],
        [0.13, -0.07],
        [0.13, 0.07],
        [0.06, 0.07],
      ],
      { at: wf, axis: wf, bone: arm.spanJoints[2], color: GOLD, segments: 8, name: "wristGuard" },
    );
    glow(
      b.part(new THREE.OctahedronGeometry(0.055), CYAN, {
        bone: arm.spanJoints[2],
        at: wf.at.clone().add(V(0, 0.1, 0.04)),
        name: "wristGem",
      }),
      1.6,
    );
    b.spike(wf.at.clone().add(V(0, 0.02, 0.1)), V(0, 0.1, 1), 0.16, 0.035, {
      bone: arm.spanJoints[2],
      color: TALON,
      sides: 6,
      name: "wristClaw",
    });

    // lightning crackling over the wing
    const wr = arm.spanJoints[2];
    bolt(V(s * 2.45, 2.28, 0.3), V(s * 3.4, 2.3, 0.12), { bone: wr, seg: 6, amp: 0.07, seed: 40 + (s > 0 ? 0 : 50) });
    bolt(V(s * 1.5, 2.2, 0.12), V(s * 2.3, 2.3, 0.28), { bone: arm.spanJoints[1], seg: 5, amp: 0.06, seed: 41 + (s > 0 ? 0 : 50) });
    // spanwise lightning veins lying on the coverts
    bolt(V(s * 0.55, 2.24, -0.42), V(s * 1.45, 2.26, -0.46), { bone: arm.spanJoints[0], seg: 5, amp: 0.045, r: 0.02, seed: 120 + (s > 0 ? 0 : 50) });
    bolt(V(s * 1.5, 2.26, -0.46), V(s * 2.35, 2.32, -0.4), { bone: arm.spanJoints[1], seg: 5, amp: 0.045, r: 0.02, seed: 121 + (s > 0 ? 0 : 50) });
    bolt(V(s * 2.4, 2.32, -0.42), V(s * 3.2, 2.32, -0.5), { bone: wr, seg: 5, amp: 0.045, r: 0.02, seed: 122 + (s > 0 ? 0 : 50) });
    for (const [i, j] of [
      [2, 4],
      [5, 7],
      [7, 9],
    ] as [number, number][]) {
      bolt(primaryTips[i].clone().add(V(0, 0.01, 0)), primaryTips[j].clone().add(V(0, 0.01, 0)), {
        bone: wr,
        seg: 4,
        amp: 0.09,
        r: 0.014,
        seed: 60 + i + (s > 0 ? 0 : 50),
      });
    }
    bolt(primaryTips[9].clone().add(V(0, 0.02, 0)), primaryTips[9].clone().add(V(s * 0.45, 0.55, 0.15)), {
      bone: wr,
      seg: 5,
      amp: 0.08,
      seed: 80 + (s > 0 ? 0 : 50),
    });
    // spark shards drifting off the wing
    for (let i = 0; i < 9; i++) {
      const tipOf = primaryTips[i];
      const p = tipOf.clone().add(V(s * 0.08 + (rand() - 0.5) * 0.3, 0.1 + rand() * 0.35, (rand() - 0.5) * 0.3));
      glow(
        b.part(new THREE.OctahedronGeometry(0.018 + rand() * 0.02), i % 3 ? CYAN : CYAN_W, { bone: wr, at: p, name: "shard" }),
        1.6,
      );
    }
  }

  // body-hugging arcs and ground sparks
  bolt(V(0.5, 1.95, 0.55), V(0.95, 1.35, 0.7), { bone: spineTop, seg: 5, amp: 0.07, seed: 7 });
  bolt(V(-0.5, 1.95, 0.55), V(-0.95, 1.4, 0.65), { bone: spineTop, seg: 5, amp: 0.07, seed: 8 });
  bolt(V(0.0, 2.55, 0.35), V(0.35, 2.85, -0.05), { bone: head, seg: 4, amp: 0.06, seed: 9 });
  bolt(V(0.0, 0.5, -1.35), V(0.3, 0.2, -1.6), { bone: tail.spanJoints[1], seg: 4, amp: 0.06, seed: 10 });

  return b.root;
}
```

## Example: pegasusSonnet

Brief: Category: Fantastical creature.
Subject: pearl-white winged horse with layered feather wings, flowing mane and tail, golden hooves and a brow gem.
Style: low-poly.
Topology: quadruped-winged
Style family: low-poly
Notable features: four-legs, feather-wings, mane, tail, gem

```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";
import type { Fill } from "agentic-3js-builder";
import { DEG } from "agentic-3js-builder";
import { limb } from "agentic-3js-builder";
import { catmull, polyline } from "agentic-3js-builder";
import { countershade, mottle, noise, paint, spots } from "agentic-3js-builder";
import type { Chain, Joint } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Pegasus",
  description:
    "A pearl-white winged horse with spread, layered feather wings, a flowing blue-violet mane and tail, golden hooves and a gem-set brow band.",
  style: "low-poly",
  commit: "88fc1f0",
};

const COAT = "#f3f4fb";
const BELLY = "#cdd3ec";
const SOCK = "#aebcf0";
const PINK = "#f1c3d2";
const PINK_D = "#b5607f";
const GOLD = "#e8b83a";
const GOLD_D = "#a97a1c";
const GOLD_L = "#ffe07a";
const GEM = "#3d7bff";
const GEM_L = "#9fd0ff";
const MANE_D = "#4f5fe0";
const MANE_M = "#7f8cf2";
const MANE_L = "#b9aaf8";
const MANE_P = "#f3aedb";
const TEETH = "#fffaf0";

type Vec = THREE.Vector3;

export default function build() {
  const b = createBuilder({ name: "pegasus", paintSize: 2048 });
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const UP = v(0, 1, 0);
  const facet = (p: { at(t: number): THREE.Vector3 }, n: number, closed = true) =>
    polyline(
      Array.from({ length: n }, (_, i) => p.at(closed ? i / n : i / (n - 1))),
      { closed },
    );
  const interp = (keys: readonly (readonly [number, number])[]) => (t: number) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const [t0, a] = keys[i - 1];
        const [t1, c] = keys[i];
        return a + ((c - a) * (t - t0)) / (t1 - t0);
      }
    }
    return keys[keys.length - 1][1];
  };

  // ------------------------------------------------------------------ skeleton
  const Y0 = 0.1; // body lift over the first draft: longer legs
  const hips = b.joint("hips", { at: [0, 1.22 + Y0, -0.6] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.22 + Y0, -0.6],
      [0, 1.22 + Y0, -0.15],
      [0, 1.25 + Y0, 0.3],
      [0, 1.28 + Y0, 0.5],
    ]),
    { parent: hips, role: "spine", names: ["spine1", "spine2", "spine3"] },
  );
  const chest = spine.joints[2];

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.42 + Y0, 0.48],
      [0, 1.7 + Y0, 0.7],
      [0, 1.99 + Y0, 0.9],
      [0, 2.14 + Y0, 1.12],
    ]),
    { parent: chest, role: "neck", names: ["neck1", "neck2", "neck3"] },
  );

  const D = v(0, -0.5, 0.866).normalize();
  const U = v(0, 0.866, 0.5).normalize();
  const P0 = neck.at(1).at.clone();
  const HS = 1.18; // head scale
  const hp = (f: number, u: number, x = 0) =>
    P0.clone().addScaledVector(D, f * HS).addScaledVector(U, u * HS).add(v(x * HS, 0, 0));
  const head = b.joint("head", { parent: neck.joints[2], at: P0, dir: D, role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: hp(0.1, -0.1), aim: hp(0.56, -0.13), role: "jaw" });
  const ears: Joint[] = [];
  for (const s of [1, -1])
    ears.push(
      b.joint(`ear${s > 0 ? "L" : "R"}`, {
        parent: head,
        at: hp(-0.03, 0.1, s * 0.07),
        dir: [s * 0.4, 0.8, -0.35],
        role: "hinge",
      }),
    );

  // legs
  type Leg = { s: number; chain: Chain; front: boolean };
  const legs: Leg[] = [];
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const fpts = limb(
      [s * 0.2, 1.1 + Y0, 0.5],
      [s * 0.19, 0.1, 0.56],
      [0.32, 0.4, 0.32, 0.15],
      [
        [0, 0, -1],
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    legs.push({
      s,
      front: true,
      chain: b.chain(`legF${k}`, fpts, {
        parent: chest,
        role: "leg",
        names: [`shoulder${k}`, `elbow${k}`, `knee${k}`, `fetlock${k}`, `hoof${k}`],
        contact: [s * 0.19, 0, 0.56],
      }),
    });
    const hpts = limb(
      [s * 0.2, 1.12 + Y0, -0.6],
      [s * 0.18, 0.1, -0.8],
      [0.48, 0.48, 0.32, 0.13],
      [
        [0, 0, 1],
        [0, 0, -1],
        [0, 0, 1],
      ],
    );
    legs.push({
      s,
      front: false,
      chain: b.chain(`legH${k}`, hpts, {
        parent: hips,
        role: "leg",
        names: [`hip${k}`, `stifle${k}`, `hock${k}`, `fetlockH${k}`, `hoofH${k}`],
        contact: [s * 0.18, 0, -0.8],
      }),
    });
  }

  // tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.3 + Y0, -0.88],
      [0, 1.3 + Y0, -1.15],
      [0, 1.1 + Y0, -1.42],
      [0, 0.8 + Y0, -1.6],
      [0, 0.45, -1.58],
    ]),
    { parent: hips, role: "tail", names: ["tail1", "tail2", "tail3", "tail4"] },
  );

  // wings
  type WingFeather = {
    cls: "pri" | "sec" | "ter" | "gc" | "mc" | "lc" | "alula";
    t: number;
    phi: number;
    L: number;
    W: number;
    lift: number;
    group: string;
    dir: Vec;
    root: Vec;
  };
  type Wing = {
    s: number;
    k: string;
    chain: Chain;
    groups: Record<string, Joint>;
    feathers: WingFeather[];
  };
  const wings: Wing[] = [];
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const armPts = [
      v(s * 0.26, 1.58 + Y0, 0.3),
      v(s * 0.85, 1.95 + Y0, 0.0),
      v(s * 1.5, 2.3 + Y0, 0.4),
      v(s * 2.05, 2.52 + Y0, 0.3),
    ];
    const arm = catmull(armPts);
    const chain = b.chain(`wing${k}`, arm, {
      parent: chest,
      role: "wing",
      names: [`wingShoulder${k}`, `wingElbow${k}`, `wingWrist${k}`, `wingTip${k}`],
    });
    const dirFor = (phi: number, slope: number) => {
      const r = phi * DEG;
      return v(s * Math.cos(r), slope * Math.cos(r) - 0.1 * Math.sin(r), -Math.sin(r)).normalize();
    };
    const list: WingFeather[] = [];
    const mk = (
      cls: WingFeather["cls"],
      t: number,
      phi: number,
      L: number,
      W: number,
      lift: number,
      group: string,
      slope = 0.42,
    ) => {
      list.push({
        cls,
        t,
        phi,
        L,
        W,
        lift,
        group,
        dir: dirFor(phi, slope),
        root: arm.at(t).clone().add(v(0, lift, -0.015)),
      });
    };
    const priL = [0.62, 0.78, 0.88, 0.94, 0.97, 0.96, 0.92, 0.88, 0.84];
    const secL = [0.8, 0.79, 0.78, 0.77, 0.75, 0.73, 0.72, 0.7, 0.69, 0.67];
    const terL = [0.62, 0.56, 0.5, 0.45];
    const flight: WingFeather[] = [];
    for (let i = 0; i < 9; i++) {
      mk("pri", 0.97 - i * 0.026, 8 + i * 6.5, priL[i], 0.088, 0.004 * i, `pri${Math.floor(i / 3) + 1}`);
    }
    for (let i = 0; i < 10; i++) {
      mk("sec", 0.72 - i * 0.045, 68 + i * 3, secL[i], 0.092, 0.004 * i, `sec${i < 4 ? 1 : i < 7 ? 2 : 3}`, 0.15);
    }
    for (let i = 0; i < 4; i++) mk("ter", 0.25 - i * 0.065, 100 + i * 6, terL[i], 0.095, 0.004 * i, "ter", 0.06);
    flight.push(...list);
    flight.forEach((f, i) => {
      if (f.cls === "ter") return;
      const sl = f.cls === "pri" ? 0.42 : 0.15;
      mk("gc", f.t, f.phi, f.cls === "pri" ? 0.36 : 0.34, 0.07, 0.03 + f.lift, f.group, sl);
      if (i % 2 === 0) {
        mk("mc", f.t - 0.01, f.phi + 2, 0.23, 0.055, 0.05 + f.lift, f.group, sl);
        mk("lc", f.t - 0.015, f.phi + 4, 0.15, 0.047, 0.07 + f.lift, f.group, sl);
      }
    });
    for (let i = 0; i < 15; i++) {
      const t = 0.05 + i * 0.062;
      const near = flight.reduce((a, f) => (Math.abs(f.t - t) < Math.abs(a.t - t) ? f : a));
      mk("lc", t, 80 + 6 * Math.sin(i), 0.2, 0.058, 0.07, near.group, near.cls === "pri" ? 0.42 : 0.15);
      list[list.length - 1].root.z += 0.045;
    }
    for (let i = 0; i < 3; i++) mk("alula", 0.78 + i * 0.012, -36 + i * 14, 0.24 - i * 0.03, 0.04, 0.085 + i * 0.004, "alula", 0.42);

    const groups: Record<string, Joint> = {};
    const names = [...new Set(list.map((f) => f.group))];
    for (const g of names) {
      const members = list.filter((f) => f.group === g && f.cls !== "gc" && f.cls !== "mc" && f.cls !== "lc");
      const mean = members.reduce((a, f) => a.add(f.dir), v(0, 0, 0)).normalize();
      const rootMean = members.reduce((a, f) => a.add(f.root), v(0, 0, 0)).multiplyScalar(1 / members.length);
      const parent = g.startsWith("sec") ? chain.joints[1] : g === "ter" ? chain.joints[0] : chain.joints[2];
      groups[g] = b.joint(`${g}${k}`, { parent, at: rootMean, dir: mean, role: "fan" });
    }
    wings.push({ s, k, chain, groups, feathers: list });
  }

  // ------------------------------------------------------------------ paints
  const coatBase = countershade(spots(mottle(COAT, "#e6e9f8", { size: 0.22 }), "#d8ddf3", { size: 0.12, amount: 0.3, seed: 4 }), BELLY, { level: -0.2 });
  const coat = paint((p) => (p.y < 0.3 + 0.07 * noise(p, 0.07, 5) ? SOCK : coatBase));
  const muzzle = hp(0.6, -0.05);
  const headCoat = paint((p) => (p.distanceTo(muzzle) < 0.14 ? PINK : coat));

  const featherPaint = (L: number, W: number, root: string, mid: string, tip: string, quill: string) =>
    paint((_p, _n, s) => {
      const u = s[0] / L;
      const a = Math.abs(s[1]) / W;
      if (a < 0.09 && u > 0.03 && u < 0.97) return quill;
      if (u > 0.76 - 0.14 * a) return tip;
      if (u > 0.48 - 0.12 * a) return mid;
      return root;
    });

  const featherOutline = (L: number, W: number) =>
    [
      [0, -0.3 * W],
      [0.2 * L, -0.55 * W],
      [0.6 * L, -0.66 * W],
      [0.86 * L, -0.55 * W],
      [0.96 * L, -0.28 * W],
      [L, 0.02 * W, "sharp"],
      [0.95 * L, 0.45 * W],
      [0.82 * L, 0.85 * W],
      [0.55 * L, W],
      [0.2 * L, 0.88 * W],
      [0, 0.35 * W],
    ] as OutlinePoint[];

  const feather = (o: {
    at: Vec;
    dir: Vec;
    L: number;
    W: number;
    color: Fill;
    bone: Joint;
    vertical?: boolean;
    thick?: number;
  }) => {
    const x = o.dir.clone().normalize();
    let y: Vec;
    if (o.vertical) y = UP.clone().addScaledVector(x, -UP.dot(x)).normalize();
    else {
      y = new THREE.Vector3().crossVectors(UP, x).normalize();
      if (y.z > 0) y.negate();
    }
    return b.extrude(featherOutline(o.L, o.W), {
      at: o.at,
      x: x.toArray() as [number, number, number],
      y: y.toArray() as [number, number, number],
      thickness: o.thick ?? 0.012,
      color: o.color,
      bone: o.bone,
    });
  };

  // ------------------------------------------------------------------ body
  const bodyRx = interp([
    [0, 0.27],
    [0.25, 0.31],
    [0.6, 0.32],
    [1, 0.28],
  ]);
  const bodyRy = interp([
    [0, 0.33],
    [0.25, 0.36],
    [0.6, 0.39],
    [1, 0.38],
  ]);
  const body = b.sweep(spine, (t) => [bodyRx(t), bodyRy(t)], {
    color: coat,
    sides: 12,
    smooth: false,
    shift: (t) => [0, -0.01 - 0.05 * t],
    name: "body",
  });

  const neckRx = interp([
    [0, 0.2],
    [1, 0.115],
  ]);
  const neckRy = interp([
    [0, 0.26],
    [1, 0.14],
  ]);
  const neckTube = b.sweep(neck, (t) => [neckRx(t), neckRy(t)], {
    color: coat,
    sides: 8,
    smooth: false,
    name: "neck",
  });

  // head
  const st = (f: number, u: number, w: number, h: number) => ({ at: hp(f, u), w: w * HS, h: h * HS });
  const skull = b.loft([st(-0.1, -0.01, 0.2, 0.24), st(0.08, -0.04, 0.23, 0.3), st(0.28, -0.04, 0.16, 0.2), st(0.46, -0.045, 0.12, 0.15), st(0.6, -0.05, 0.13, 0.13)], {
    bone: head,
    color: headCoat,
    sides: 8,
    smooth: false,
    name: "skull",
  });
  const jawTube = b.loft([st(0.06, -0.15, 0.14, 0.12), st(0.26, -0.14, 0.1, 0.08), st(0.46, -0.12, 0.09, 0.07), st(0.57, -0.11, 0.1, 0.07)], {
    bone: jaw,
    color: headCoat,
    sides: 6,
    smooth: false,
    name: "jaw",
  });
  // teeth
  b.part(new THREE.BoxGeometry(0.07, 0.012, 0.015), TEETH, { bone: head, at: hp(0.6, -0.1), dir: D.toArray() as [number, number, number] });
  b.part(new THREE.BoxGeometry(0.06, 0.012, 0.015), TEETH, { bone: jaw, at: hp(0.58, -0.105), dir: D.toArray() as [number, number, number] });
  for (const s of [1, -1]) {
    const mouth = b.surface([skull, jawTube]).drape(
      polyline([hp(0.595, -0.075, s * 0.04), hp(0.5, -0.088, s * 0.07), hp(0.3, -0.1, s * 0.09), hp(0.17, -0.07, s * 0.115)]),
      { lift: 0.004 },
    );
    b.sweep(facet(mouth, 6, false), 0.006, { color: PINK_D, sides: 4, bone: head, name: "mouthLine" });
  }
  for (const s of [1, -1]) {
    // nostrils
    b.part(new THREE.IcosahedronGeometry(0.016, 0), PINK_D, {
      bone: head,
      at: hp(0.6, -0.02, s * 0.04),
      scale: [1, 0.6, 1.5],
      dir: D.toArray() as [number, number, number],
      flat: true,
    });
    // ears: outer + inner
    const ear = ears[s > 0 ? 0 : 1];
    b.spike(ear, [s * 0.4, 0.8, -0.35], 0.3, 0.06, { color: coat, sides: 4, smooth: false, bone: ear });
    b.spike(ear.at.clone().add(v(0, 0.012, 0.02)), [s * 0.4, 0.8, -0.35], 0.24, 0.036, {
      color: PINK,
      sides: 4,
      smooth: false,
      bone: ear,
    });
  }

  // eyes
  const eyeTex = svg(
    `<svg viewBox="0 0 64 48">
      <path d="M3 27 Q32 -3 61 25 Q32 52 3 27Z" fill="#241a4a"/>
      <circle cx="32" cy="26" r="16" fill="#5c4fd0"/>
      <circle cx="32" cy="27" r="10" fill="#2b2170"/>
      <path d="M20 30 Q32 40 44 30" stroke="#8fa6ff" stroke-width="3" fill="none"/>
      <circle cx="25" cy="19" r="5.5" fill="#ffffff"/>
      <circle cx="39" cy="33" r="2.6" fill="#d6e4ff"/>
      <path d="M2 28 Q30 -8 62 22" stroke="#241a4a" stroke-width="4" fill="none"/>
      <path d="M58 20 L63 12" stroke="#241a4a" stroke-width="3.5"/>
      <path d="M52 15 L56 7" stroke="#241a4a" stroke-width="3.5"/>
    </svg>`,
    { size: 192 },
  );
  for (const s of [1, -1])
    b.decal(skull, eyeTex, {
      at: hp(0.2, 0.01, s * 0.1),
      dir: [s * 0.9, 0.2, 0.35],
      up: U.toArray() as [number, number, number],
      size: [0.13, 0.098],
      mirror: s < 0,
      name: `eye${s > 0 ? "L" : "R"}`,
    });

  // brow band, gem and noseband
  const brow = b.surface(skull).loop(hp(0.12, 0), { dir: D, lift: 0.006 });
  b.sweep(brow, 0.012, { color: GOLD, sides: 4, bone: head, name: "browband" });
  const noseband = b.surface(skull).loop(hp(0.44, 0), { dir: D, lift: 0.006 });
  b.sweep(facet(noseband, 10), 0.009, { color: GOLD, sides: 4, bone: head, name: "noseband" });
  const gemHit = b.surface(skull).ray(hp(0.12, 0.4), U.clone().negate());
  if (gemHit) {
    b.stick(new THREE.OctahedronGeometry(0.032, 0), GEM, gemHit, { embed: 0.3, flat: true, bone: head, name: "browGem" });
    b.stick(new THREE.OctahedronGeometry(0.044, 0), GOLD, gemHit, { embed: 0.55, flat: true, bone: head, name: "browSetting" });
    b.stick(new THREE.OctahedronGeometry(0.014, 0), GEM_L, gemHit.moved([0, 0.02, 0]), { embed: 0, flat: true, bone: head, name: "browGlint" });
  }

  // ------------------------------------------------------------------ legs
  const frontR = interp([
    [0, 0.095],
    [0.3, 0.08],
    [0.5, 0.062],
    [0.6, 0.05],
    [0.64, 0.04],
    [0.86, 0.04],
    [0.9, 0.05],
    [1, 0.045],
  ]);
  const hindR = interp([
    [0, 0.13],
    [0.25, 0.1],
    [0.45, 0.07],
    [0.62, 0.058],
    [0.68, 0.043],
    [0.88, 0.04],
    [0.92, 0.05],
    [1, 0.045],
  ]);
  for (const leg of legs) {
    const c = leg.chain;
    const tube = b.sweep(c, leg.front ? frontR : hindR, { color: coat, sides: 6, smooth: false, name: `leg${leg.front ? "F" : "H"}${leg.s > 0 ? "L" : "R"}` });
    const [, , j2, j3] = c.joints;
    const tip = c.tip as Joint;
    b.part(new THREE.IcosahedronGeometry(leg.front ? 0.058 : 0.062, 0), coat, { bone: j2, at: j2.at, flat: true });
    const j0 = c.joints[0];
    if (leg.front)
      b.part(new THREE.IcosahedronGeometry(0.16, 1), coat, {
        bone: j0,
        at: j0.at.clone().add(v(leg.s * 0.01, -0.05, -0.02)),
        scale: [0.85, 1.25, 1.05],
        flat: true,
        name: "shoulderMass",
      });
    else
      b.part(new THREE.IcosahedronGeometry(0.165, 1), coat, {
        bone: j0,
        at: j0.at.clone().add(v(leg.s * 0.0, -0.08, -0.03)),
        scale: [0.72, 1.25, 1.15],
        flat: true,
        name: "thighMass",
      });
    b.part(new THREE.CylinderGeometry(0.056, 0.074, 0.105, 6), GOLD, {
      bone: tip,
      at: [tip.at.x, 0.0525, tip.at.z + 0.012],
      flat: true,
      name: "hoof",
    });
    b.part(new THREE.CylinderGeometry(0.05, 0.056, 0.02, 6), GOLD_D, {
      bone: tip,
      at: [tip.at.x, 0.105, tip.at.z + 0.008],
      flat: true,
      name: "hoofRim",
    });
    // anklet and fetlock feathers
    const band = b.surface(tube).loop(c.at(0.74), { lift: 0.008 });
    b.sweep(facet(band, 8), 0.012, { color: GOLD, sides: 4, bone: j3, name: "anklet" });
    b.ring(j3, { count: 6, radius: 0.04, tilt: 62 }, (it) =>
      b.spike(it, it, 0.14, 0.03, { color: MANE_L, sides: 4, smooth: false }),
    );
    b.ring(j3, { count: 4, radius: 0.03, tilt: 75, fromDeg: 120, toDeg: 240 }, (it) =>
      b.spike(it, it, 0.19, 0.026, { color: MANE_M, sides: 4, smooth: false }),
    );
  }

  // ------------------------------------------------------------------ tail
  const dockR = interp([
    [0, 0.07],
    [0.3, 0.055],
    [1, 0.025],
  ]);
  const dock = b.sweep(tail, dockR, {
    color: (t) => (t < 0.28 ? coat : MANE_D),
    sides: 6,
    smooth: false,
    name: "dock",
  });
  const lockCols = [MANE_D, MANE_M, MANE_L, MANE_M, MANE_D, MANE_P, MANE_L, MANE_M, MANE_D, MANE_L, MANE_M, MANE_P];
  for (let kk = 0; kk < 12; kk++) {
    const th = (kk * 2.4) % (Math.PI * 2);
    const t0 = 0.05 + 0.04 * (kk % 3);
    const pts: Vec[] = [];
    const steps = [0, 0.3, 0.6, 1];
    for (const u of steps) {
      const t = t0 + u * (1 - t0);
      const cp = tail.at(t);
      const rho = 0.03 + 0.17 * Math.sin(Math.min(1, u * 1.3) * 1.6) * (0.7 + 0.3 * ((kk * 7) % 3));
      const off = cp.binormal.clone().multiplyScalar(Math.cos(th) * rho).addScaledVector(cp.normal, Math.sin(th) * rho * 0.6);
      pts.push(cp.at.clone().add(off));
    }
    const endTan = tail.at(1).tangent.clone();
    pts.push(
      pts[pts.length - 1]
        .clone()
        .addScaledVector(endTan, 0.14 + 0.09 * (kk % 3))
        .add(v(0.16 * Math.cos(th), -0.03 - 0.03 * (kk % 4), -0.14 - 0.06 * (kk % 2))),
    );
    b.sweep(catmull(pts), [0.035, 0.1 - 0.012 * (kk % 3), 0.085, 0.045, 0], {
      bone: tail,
      color: lockCols[kk],
      sides: 5,
      smooth: false,
      caps: { start: "flat", end: "point" },
      name: `tailLock${kk}`,
    });
  }

  // ------------------------------------------------------------------ mane
  const flame = (L: number, w: number) =>
    [
      [0, w * 0.6],
      [0.2 * L, w * 0.9],
      [0.5 * L, w * 0.7],
      [0.8 * L, w * 0.1],
      [L, -w * 0.9, "sharp"],
      [0.78 * L, -w * 0.55],
      [0.5 * L, -w * 0.35],
      [0.2 * L, -w * 0.45],
      [0, -w * 0.6],
    ] as OutlinePoint[];
  const tuft = (at: Vec, dir: Vec, L: number, w: number, color: Fill, bone: Joint) => {
    const x = dir.clone().normalize();
    const y = UP.clone().addScaledVector(x, -UP.dot(x)).normalize();
    return b.extrude(flame(L, w), {
      at,
      x: x.toArray() as [number, number, number],
      y: y.toArray() as [number, number, number],
      thickness: 0.026,
      color,
      bone,
    });
  };
  b.along(neckTube, 12, (at) => {
    const i = Math.round(at.t * 12);
    const L = 0.42 + 0.12 * Math.sin(i * 1.7) + 0.1 * at.t;
    const base = at.at.clone();
    for (const [dx, lean, col, ll, ww] of [
      [0, 0, MANE_D, 1, 0.095],
      [0.05, 1, MANE_M, 0.9, 0.085],
      [-0.05, -1, MANE_M, 0.9, 0.085],
      [0.025, 0.5, MANE_L, 0.72, 0.07],
    ] as [number, number, string, number, number][]) {
      const dir = v(lean * 0.55, -0.4 + 0.05 * Math.sin(i), -0.8).normalize();
      tuft(base.clone().add(v(dx, 0.02 - Math.abs(dx) * 0.3, 0)), dir, L * ll, ww, col, at.bone as Joint);
    }
  });
  // forelock
  for (let i = 0; i < 5; i++) {
    const s = (i - 2) / 2;
    const dir = v(s * 0.35, -0.45 - 0.1 * (1 - Math.abs(s)), 0.75).normalize();
    tuft(hp(-0.02, 0.1, s * 0.05), dir, 0.24 - Math.abs(s) * 0.05, 0.05, i % 2 ? MANE_M : MANE_D, head);
  }

  // ------------------------------------------------------------------ collar and chest gem
  const collar = b.surface(neckTube).loop(neck.at(0.14), { lift: 0.014 });
  b.sweep(collar, 0.02, { color: GOLD, sides: 4, bone: neck.joints[0], name: "collar" });
  b.along(collar, 14, (at) => b.part(new THREE.IcosahedronGeometry(0.014, 0), GOLD_L, { at, bone: neck.joints[0], flat: true, name: "collarStud" }));
  const front = b.surface(neckTube).around(neck.at(0.14).at).at(0, -12);
  if (front) {
    b.stick(new THREE.OctahedronGeometry(0.05, 0), GOLD, front, { embed: 0.6, flat: true, name: "pendantSetting" });
    b.stick(new THREE.OctahedronGeometry(0.038, 0), GEM, front, { embed: 0.2, flat: true, name: "pendantGem" });
  }
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.05;
    const dir = v(x * 3, -0.92, 0.28 - Math.abs(x)).normalize();
    tuft(front ? front.at.clone().add(v(x, -0.05, 0.02)) : v(x, 1.4, 0.9), dir, 0.24 - Math.abs(x) * 0.5, 0.05, [MANE_M, MANE_L, MANE_P, MANE_L, MANE_M][i], neck.joints[0]);
  }
  const tailBand = b.surface(dock).loop(tail.at(0.2), { lift: 0.008 });
  b.sweep(facet(tailBand, 8), 0.016, { color: GOLD, sides: 4, bone: tail.joints[0], name: "tailBand" });
  const girth = b.surface(body).loop(spine.at(0.8), { lift: 0.012 });
  b.sweep(girth, 0.022, { color: GOLD, sides: 4, name: "girth" });
  for (const t of [0.75, 0.85]) b.sweep(b.surface(body).loop(spine.at(t), { lift: 0.01 }), 0.008, { color: GOLD_D, sides: 4, name: "girthEdge" });
  b.along(girth, 18, (at) => b.part(new THREE.IcosahedronGeometry(0.015, 0), GOLD_L, { at, flat: true, name: "girthStud" }));

  // ------------------------------------------------------------------ flank constellation
  const star = (cx: number, cy: number, r: number) => {
    const pts: string[] = [];
    for (let i = 0; i < 10; i++) {
      const a = (-90 + i * 36) * DEG;
      const rr = i % 2 ? r * 0.45 : r;
      pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
    }
    return `<polygon points="${pts.join(" ")}" fill="#ffd45a"/>`;
  };
  const cons = svg(
    `<svg viewBox="0 0 120 90">
      <polyline points="14,64 38,30 66,44 92,16 106,52" stroke="#e8b83a" stroke-width="3" fill="none"/>
      ${star(14, 64, 9)}${star(38, 30, 11)}${star(66, 44, 8)}${star(92, 16, 12)}${star(106, 52, 9)}
    </svg>`,
    { size: 256 },
  );
  for (const s of [1, -1])
    b.decal(body, cons, {
      at: [s * 0.36, 1.18 + Y0, -0.2],
      dir: [s, 0, 0],
      size: [0.62, 0.465],
      mirror: s < 0,
      name: `constellation${s > 0 ? "L" : "R"}`,
    });

  // ------------------------------------------------------------------ wings
  const wingR = interp([
    [0, 0.06],
    [0.4, 0.045],
    [0.75, 0.032],
    [1, 0.022],
  ]);
  for (const w of wings) {
    const [shoulder, elbow, wrist] = w.chain.joints;
    const armTube = b.sweep(w.chain, wingR, { color: coat, sides: 6, smooth: false, name: `wingArm${w.k}` });
    b.part(new THREE.IcosahedronGeometry(0.115, 0), coat, { bone: shoulder, at: shoulder.at, flat: true });
    for (const t of [0.34, 0.7]) {
      const cuff = b.surface(armTube).loop(w.chain.at(t), { lift: 0.01 });
      b.sweep(facet(cuff, 8), 0.014, { color: GOLD, sides: 4, bone: t < 0.5 ? elbow : wrist, name: `wingCuff${w.k}` });
    }
    // wing claw
    b.spike(w.chain.at(0.78).at, [w.s * 0.25, 0.2, 0.8], 0.1, 0.025, { color: GOLD_D, sides: 4, bone: wrist });

    for (const f of w.feathers) {
      const bone = w.groups[f.group];
      let color: Fill;
      switch (f.cls) {
        case "pri":
          color = featherPaint(f.L, f.W, "#f7f7fd", "#c4cff6", "#7b8fe6", "#d6aa40");
          break;
        case "sec":
          color = featherPaint(f.L, f.W, "#f7f7fd", "#d3c8f3", "#9b88e0", "#d6aa40");
          break;
        case "ter":
          color = featherPaint(f.L, f.W, "#f7f7fd", "#e2dcf8", "#b3a6f0", "#d6aa40");
          break;
        case "gc":
          color = featherPaint(f.L, f.W, "#fbfbfe", "#e6eafb", "#c3cff8", "#e8c860");
          break;
        case "mc":
          color = featherPaint(f.L, f.W, "#fdfdff", "#f0f2fd", "#dfe5fb", "#f0d878");
          break;
        case "lc":
          color = featherPaint(f.L, f.W, "#ffffff", "#f7f8fe", "#eaeefc", "#f4e090");
          break;
        default:
          color = featherPaint(f.L, f.W, "#f7f7fd", "#c4cff6", "#7b8fe6", "#d6aa40");
      }
      feather({ at: f.root, dir: f.dir, L: f.L, W: f.W, color, bone });
    }
  }


  return b.root;
}
```

## Example: mantaRay

Brief: Category: Animal.
Subject: giant oceanic manta ray gliding with spread wings, rolled cephalic fins, spotted belly, whip tail and remoras.
Style: low-poly.
Topology: winged-serpentine
Style family: low-poly
Notable features: membrane-wings, cephalic-fins, whip-tail, gill-slits, remoras

```ts
// Giant oceanic manta ray (Mobula birostris), 4.6 m across the wings, 3.5 m from cephalic fins to tail tip.
// A gliding rest pose: the pectoral wings spread level, each a smooth lens-section sweep on a five-joint chain so it
// flaps and bends as one skin; the rolled cephalic fins curl forward off the head on two-joint chains. The body and
// whip tail are one continuous skin over the spine and tail chains, with the tail tapering to a fine tip. The lower
// jaw, pelvic fins and dorsal fin are extruded plates; the eyes, spiracles and the two hitchhiking remoras (body,
// sucking disc) are turned lathe profiles.
import { CylinderGeometry, SphereGeometry } from "three";
import { createBuilder } from "agentic-3js-builder";
import { offset, rng } from "agentic-3js-builder";
import type { V3 } from "agentic-3js-builder";
import type { Sweep } from "agentic-3js-builder";
import { catmull, polyline } from "agentic-3js-builder";

export const meta = {
  name: "Giant Manta Ray",
  builtBy: "Claude Opus 5.5",
  description:
    "A 4.6 m oceanic manta gliding with wings spread: black back with pale shoulder chevrons, rolled cephalic fins, a spotted white belly with gill slits, a whip tail and two remoras riding underneath.",
};

const BACK = "#272c35";
const SHOULDER = "#e3e6e2";
const SHOULDER_EDGE = "#9ea4a8";
const BELLY = "#eef0ec";
const MARGIN = "#4a515b";
const MOUTH = "#5a5f67";
const GAPE = "#0a0b0e";
const GILL = "#3a3f48";
const SPOT = "#23262c";
const CEPH_INNER = "#b9bdbf";
const EYE_RIM = "#2e3238";
const IRIS = "#6b5638";
const LENS = "#050608";
const GLINT = "#f2f6fa";
const CLASPER = "#c9cdcc";
const REMORA = "#6d6a63";
const REMORA_STRIPE = "#2f2d2a";
const DISC = "#b3aa98";

/** Piecewise cosine interpolation through `[x, y]` keys sorted by x. */
function curve(keys: readonly (readonly [number, number])[]) {
  return (x: number) => {
    if (x <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [x1, y1] = keys[i];
      if (x <= x1) {
        const [x0, y0] = keys[i - 1];
        const u = (1 - Math.cos((Math.PI * (x - x0)) / (x1 - x0))) / 2;
        return y0 + (y1 - y0) * u;
      }
    }
    return keys[keys.length - 1][1];
  };
}

export default function build() {
  const b = createBuilder({ name: "mantaRay" });
  const random = rng(23);

  // ---------------------------------------------------------------- Skeleton
  // The body axis runs level at Y0; z = 0.55 is the pectoral girdle, the snout z = 1.03, the tail tip z = -2.45.
  const Y0 = 0.252;
  const root = b.joint("root", { at: [0, Y0, 0.55], role: "spine", group: "body" });
  const spine = b.chain(
    "spine",
    polyline([
      [0, Y0, 0.55],
      [0, Y0, -0.35],
      [0, Y0, -0.95],
    ]),
    { parent: root, names: ["spine1", "spine2"], role: "spine", group: "body" },
  );
  const [spine1, spine2] = spine.joints;
  const tail = b.chain(
    "tail",
    catmull([
      [0, Y0, -0.95],
      [0, Y0 + 0.01, -1.6],
      [0, Y0 + 0.03, -2.45],
    ]),
    { parent: spine2, count: 6, names: (i) => `tail${i + 1}`, role: "tail", group: "tail" },
  );
  const head = b.joint("head", { parent: root, at: [0, Y0, 0.6], dir: [0, 0, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, Y0 - 0.06, 0.84], dir: [0, 0, 1], role: "jaw", group: "jaw" });

  // The body path continues through the tail tip so its ring at the tail root is shared by both sector palettes. The
  // three tail stations match the old whip-tail curve; the first body station keeps its fine circular base.
  const bodyStations = [
    { at: [0, Y0 + 0.03, -2.45], w: 0.006, h: 0.006 },
    { at: [0, Y0 + 0.01, -1.6], w: 0.036, h: 0.036 },
    { at: [0, Y0, -0.95], w: 0.078, h: 0.078 },
    { at: [0, Y0, -0.85], w: 0.2, h: 0.12 },
    { at: [0, Y0, -0.6], w: 0.52, h: 0.24 },
    { at: [0, Y0 + 0.01, -0.3], w: 0.86, h: 0.36 },
    { at: [0, Y0 + 0.01, 0.1], w: 1.02, h: 0.42 },
    { at: [0, Y0, 0.45], w: 0.98, h: 0.38 },
    { at: [0, Y0, 0.75], w: 0.8, h: 0.26 },
  ] as const;
  const bodyPath = catmull(bodyStations.map((station) => station.at));
  const tailT = bodyPath.closestT([0, Y0, -0.95]);
  const mergedBones = [tail, spine, root] as const;
  b.sweep(bodyPath, (u) => 0.036 * (u / tailT) ** 1.3 + 0.003, {
    bone: mergedBones,
    to: tailT,
    color: BACK,
    sectors: [[125, 235, MARGIN]],
    caps: { start: "round", end: "none" },
    sides: 12,
    group: "tail",
  });
  const body = b.loft(bodyStations, {
    bone: mergedBones,
    from: tailT,
    color: BACK,
    sectors: [[100, 260, BELLY]],
    caps: { start: "none", end: "round" },
    sides: 12,
    group: "body",
  });

  // Head: the broad flat snout, rigid on the head bone and buried in the body behind the eyes.
  const headLoft = b.loft(
    [
      { at: [0, Y0, 0.5], w: 0.74, h: 0.26 },
      { at: [0, Y0 + 0.005, 0.75], w: 0.84, h: 0.22 },
      { at: [0, Y0 + 0.012, 0.92], w: 0.8, h: 0.15 },
      { at: [0, Y0 + 0.02, 1.0], w: 0.74, h: 0.09 },
    ],
    { bone: head, color: BACK, sectors: [[110, 250, BELLY]], sides: 16, group: "head" },
  );
  const skin = b.surface([body, headLoft]);

  // Mouth: a dark gape under the snout, closed from below by the extruded lower-jaw plate.
  b.frustumBox([0, Y0 - 0.035, 0.86], [0, Y0 - 0.035, 1.03], [0.6, 0.05], [0.64, 0.05], {
    bone: head,
    color: GAPE,
    group: "head",
  });
  b.extrude(
    [
      [-0.29, 0],
      [0.29, 0],
      [0.31, 0.1],
      [0.28, 0.17],
      [0, 0.19],
      [-0.28, 0.17],
      [-0.31, 0.1],
    ],
    {
      at: jaw,
      bone: jaw,
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.05,
      bevel: 0.015,
      detail: 0.5,
      smoothing: 1,
      color: MOUTH,
      group: "jaw",
    },
  );
  b.pose(jaw, { axis: [1, 0, 0], deg: 9 });

  // Gill slits: five curved pairs draped on the white underside behind the mouth.
  for (const s of [1, -1])
    for (let i = 0; i < 5; i++) {
      const z = 0.58 - 0.085 * i;
      const x0 = 0.11 + 0.012 * i;
      const draft: V3[] = [
        [s * x0, Y0 - 0.4, z],
        [s * (x0 + 0.11), Y0 - 0.4, z + 0.018],
        [s * (x0 + 0.23), Y0 - 0.4, z - 0.004],
      ];
      b.sweep(skin.drape(catmull(draft), { lift: 0.003 }), 0.009, {
        bone: spine1,
        color: GILL,
        sides: 5,
        group: "body",
      });
    }

  // Belly spots between and behind the gills, each on its own patch of skin.
  for (const hit of skin.scatter(18, {
    rng: random,
    minDist: 0.07,
    filter: (h) => h.n.y < -0.8 && Math.abs(h.at.x) < 0.3 && h.at.z < 0.62 && h.at.z > -0.45,
  })) {
    const r = 0.018 + 0.022 * random();
    b.stick(new CylinderGeometry(r, r, 0.006, 8), SPOT, hit, { embed: 0.5, group: "body" });
  }

  // ---------------------------------------------------------------- Wings
  // Each pectoral wing is one smooth sweep over a five-joint chain: an elliptical lens section whose chord (rx)
  // shrinks from 1.6 m at the root to a swept-back falcate tip, thinning from 22 cm to 2 cm, the tip curling up.
  const halfChord = curve([
    [0, 0.8],
    [0.15, 0.64],
    [0.35, 0.46],
    [0.6, 0.27],
    [0.8, 0.13],
    [0.93, 0.055],
    [1, 0.02],
  ]);
  const halfThick = curve([
    [0, 0.11],
    [0.2, 0.075],
    [0.5, 0.045],
    [0.8, 0.025],
    [1, 0.012],
  ]);
  const wings: Sweep[] = [];
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const wing = b.chain(
      `wing${side}`,
      catmull([
        [s * 0.3, Y0, 0.0],
        [s * 0.9, Y0 + 0.01, 0.0],
        [s * 1.5, Y0 + 0.01, -0.12],
        [s * 1.95, Y0 + 0.03, -0.27],
        [s * 2.3, Y0 + 0.08, -0.5],
      ]),
      {
        parent: spine1,
        up: [0, 1, 0],
        count: 5,
        names: (i) => `wing${side}${i + 1}`,
        role: "wing",
        group: `wing${side}`,
      },
    );
    // Dorsal clock on this tube: +90 is the leading edge on the left wing and the trailing edge on the right.
    const clock = (a0: number, a1: number): [number, number] => (s > 0 ? [a0, a1] : [-a1, -a0]);
    const wingSweep = b.sweep(wing, (t) => [halfChord(t), halfThick(t)], {
      shift: (t) => [s * 0.05 * Math.sin(Math.PI * t), 0],
      color: BACK,
      sectors: [[...clock(94, 266), BELLY]],
      sides: 16,
      extend: [0.2, 0],
      group: `wing${side}`,
    });
    wings.push(wingSweep);

    // Shoulder chevron: a pale triangle behind a thin black leading edge, widest at the root and tapering out along
    // the front of the wing, fading to grey at its rear edge. Narrow strips between lines of the built skin, so each
    // hugs the curved surface. Edges are chord fractions (+1 = leading edge), turned into the polar clock angle.
    const STRIPS = 8;
    const edge = (k: number) =>
      Array.from({ length: 12 }, (_, i) => {
        const u = i / 11;
        const t = 0.04 + 0.38 * u;
        const front = 0.9 - 0.08 * u;
        const rear = -0.45 + 1.18 * u;
        const f = rear + ((front - rear) * k) / STRIPS;
        const deg = (Math.atan2(f * halfChord(t), halfThick(t) * Math.sqrt(1 - f * f)) * 180) / Math.PI;
        return wingSweep.at(t, s * deg, 0.004);
      });
    for (let k = 0; k < STRIPS; k++)
      b.membrane(edge(k), edge(k + 1), {
        thickness: 0.003,
        rows: 1,
        cols: 11,
        bone: wing,
        color: k === 0 ? SHOULDER_EDGE : SHOULDER,
        group: `wing${side}`,
      });

    // ---------------------------------------------------------------- Cephalic fins
    // Rolled into forward-pointing horns, pale on the inner face, with the spiral edge of the rolled lobe.
    const ceph = b.chain(
      `cephalic${side}`,
      catmull([
        [s * 0.34, Y0 - 0.01, 0.93],
        [s * 0.37, Y0 - 0.02, 1.12],
        [s * 0.365, Y0 - 0.035, 1.28],
        [s * 0.32, Y0 - 0.05, 1.36],
      ]),
      {
        parent: head,
        count: 2,
        names: [`cephalic${side}1`, `cephalic${side}2`],
        role: "hinge",
        group: `cephalic${side}`,
      },
    );
    const horn = b.sweep(ceph, (t) => [0.042 - 0.016 * t, 0.052 - 0.022 * t], {
      color: BACK,
      sectors: [[...clock(60, 200), CEPH_INNER]],
      sides: 16,
      group: `cephalic${side}`,
    });
    const seam = Array.from({ length: 15 }, (_, i) => {
      const t = 0.08 + (0.84 * i) / 14;
      return horn.at(t, s * (120 + 420 * t), 0.002).at.clone();
    });
    b.sweep(catmull(seam), 0.0055, { bone: ceph, color: GAPE, group: `cephalic${side}` });

    // ---------------------------------------------------------------- Eyes and spiracles
    const eyeHit = skin.ray([s * 1, Y0 + 0.03, 0.8], [-s, 0, 0]);
    if (!eyeHit) throw new Error("mantaRay: eye ray missed the head");
    const gaze = eyeHit.n;
    b.lathe(
      [
        [0.028, -0.02],
        [0.05, -0.02],
        [0.046, 0.008],
        [0.034, 0.018],
        [0.028, 0.012],
      ],
      { at: eyeHit, axis: gaze, bone: head, smoothing: 1, color: EYE_RIM, group: "head" },
    );
    b.lathe(
      [
        [0, -0.012],
        [0.03, -0.012],
        [0.03, 0.008],
        [0.02, 0.012],
        [0, 0.012],
      ],
      { at: eyeHit, axis: gaze, bone: head, color: IRIS, group: "head" },
    );
    const lens = b.lathe(
      [
        [0, 0],
        [0.017, 0],
        [0.015, 0.008],
        [0.009, 0.014],
        [0, 0.016],
      ],
      { at: eyeHit, axis: gaze, bone: head, color: LENS, group: "head" },
    );
    b.part(new SphereGeometry(0.004, 4, 3), GLINT, { bone: head, at: lens.local([0.005, 0.014, 0.005]) });

    const spiracle = skin.ray([s * 0.3, Y0 + 1, 0.62], [0, -1, 0]);
    if (spiracle)
      b.lathe(
        [
          [0.012, -0.01],
          [0.024, -0.01],
          [0.022, 0.006],
          [0.014, 0.004],
        ],
        { at: spiracle, axis: spiracle.n, bone: head, color: GAPE, group: "head" },
      );

    // ---------------------------------------------------------------- Pelvic fins and claspers
    b.extrude(
      [
        [0, 0],
        [0.12, 0.03],
        [0.2, 0.12],
        [0.19, 0.22, "sharp"],
        [0.1, 0.2],
        [0.02, 0.14],
      ],
      {
        at: [s * 0.08, Y0 - 0.03, -0.72],
        bone: spine2,
        x: [s, 0, 0],
        y: [0, 0, -1],
        thickness: 0.026,
        bevel: 0.008,
        detail: 0.5,
        smoothing: 1,
        color: BACK,
        group: "body",
      },
    );
    b.capsule([s * 0.07, Y0 - 0.05, -0.84], [s * 0.1, Y0 - 0.055, -1.14], [0.02, 0.013], {
      bone: spine2,
      color: CLASPER,
      group: "body",
    });
  }

  const tail1 = tail.joints[0];
  b.extrude(
    [
      [0.05, 0],
      [-0.02, 0.07],
      [-0.1, 0.12, "sharp"],
      [-0.09, 0.06],
      [-0.16, 0],
    ],
    {
      x: [0, 0, 1],
      at: [0, Y0 + 0.02, -0.9],
      bone: tail1,
      thickness: [0.03, 0.006],
      bevel: 0.006,
      detail: 0.5,
      smoothing: 1,
      color: BACK,
      group: "tail",
    },
  );

  // ---------------------------------------------------------------- Remoras
  // Two sharksuckers stuck to the white underside, facing forward, each a turned spindle hanging from its disc.
  const riders: { at: [number, number]; len: number }[] = [
    { at: [0.18, -0.28], len: 0.36 },
    { at: [-0.62, -0.12], len: 0.3 },
  ];
  const underside = b.surface([body, ...wings]);
  for (const rider of riders) {
    const [x, z] = rider.at;
    const hit = underside.ray([x, Y0 - 1, z], [0, 1, 0]);
    if (!hit) throw new Error("mantaRay: remora ray missed the underside");
    const L = rider.len;
    const R = 0.11 * L;
    const DISC_H = 0.025 * L;
    const bone = hit.bone ?? spine1;
    const axisPoint = offset(hit, [0, -1, 0], R + DISC_H * 0.6);
    const tailEnd = offset(axisPoint, [0, 0, -1], L / 2);
    const fish = b.lathe(
      [
        [0, 0],
        [0.03 * L, 0.02 * L],
        [0.07 * L, 0.2 * L],
        [R, 0.55 * L],
        [0.09 * L, 0.85 * L],
        [0.05 * L, 0.97 * L],
        [0, L],
      ],
      { at: tailEnd, axis: [0, 0, 1], bone, smoothing: 1, color: REMORA, group: "remoras" },
    );
    // Dark lateral stripe, the forked tail and the long dorsal and anal fins.
    for (const s of [1, -1])
      b.capsule(fish.local([s * R * 0.92, 0.25 * L, 0]), fish.local([s * R * 0.72, 0.9 * L, 0]), 0.018 * L, {
        bone,
        color: REMORA_STRIPE,
        group: "remoras",
      });
    b.extrude(
      [
        [0.05 * L, 0],
        [-0.12 * L, 0.14 * L, "sharp"],
        [-0.07 * L, 0],
        [-0.12 * L, -0.14 * L, "sharp"],
      ],
      {
        at: tailEnd,
        bone,
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.012 * L,
        smoothing: 1,
        color: REMORA_STRIPE,
        group: "remoras",
      },
    );
    for (const d of [1, -1])
      b.extrude(
        [
          [0.08 * L, 0],
          [0.38 * L, 0],
          [0.3 * L, d * 0.06 * L],
          [0.12 * L, d * 0.05 * L],
        ],
        {
          at: offset(tailEnd, [0, d, 0], R * 0.7),
          bone,
          x: [0, 0, 1],
          y: [0, 1, 0],
          thickness: 0.01 * L,
          smoothing: 1,
          color: REMORA,
          group: "remoras",
        },
      );
    // The oval sucking disc on top of the head, pressed against the manta's skin.
    b.lathe(
      [
        [0, 0],
        [0.05 * L, 0],
        [0.055 * L, DISC_H * 0.6],
        [0.045 * L, DISC_H],
        [0, DISC_H],
      ],
      {
        at: fish.local([0, 0.78 * L, R * 0.9]),
        axis: [0, 1, 0],
        bone,
        segments: 12,
        color: DISC,
        group: "remoras",
      },
    );
  }

  return b.root;
}
```
