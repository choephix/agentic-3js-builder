# API


Read with it: [`conventions.md`](conventions.md) (coordinates, sections, paint coordinates, cards, bounds: the behaviours to know before building) and the style kit that matches your brief, if any: [`kits/pixel.md`](../kits/pixel.md) (pixel art and retro), [`kits/toon.md`](../kits/toon.md) (cel-shaded cartoon), [`kits/clockwork.md`](../kits/clockwork.md) (gears and metals); [`kits/glow.md`](../kits/glow.md) makes parts self-lit in any style. Kits are optional helpers built on this API.

## Which helper for which job

- A point on a built body to put something on: `b.surface(body)` and its `.nearest(p)`, `.around(center).at(azimuth, elevation)` or `.ray(origin, dir)`; each returns a `Hit` facing out of the surface.
- A part seated on a body (a scale, stud, spine, hoof, eye): `b.stick(geometry, color, hit)`.
- Many things spread over a body (spots, spines, fur cards): `surface.scatter(count)`, then `b.stick` or `b.cards` on the hits.
- Things in a row along a curve or tube (dorsal spines, vertebrae, buttons): `b.along(path, count, (at) => {})`.
- A strap on any other route over a body: `surface.drape(roughPath)`.
- A drawing on a curved surface (an eye, an emblem): `b.decal`.
- A flat shape with thickness (fin, blade, plate): `b.extrude`; a turned shape (dome, vase, helmet bowl): `b.lathe`; a web or wing skin between two edges: `b.membrane`.
- A head or other cluster whose size is one number: `b.region`.


## Cheat sheet


| Kind          | What it is                                                                   | What converts to it                                                                                                                                                                                                                                                                     |
| ------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Point**     | a position                                                                   | `[x, y, z]`, `Vector3`, a raw `Mesh` (bounding-box centre), and anything that converts to a Frame (its position)                                                                                                                                                                        |
| **Direction** | a vector                                                                     | `[x, y, z]`, `Vector3`, and anything that converts to a Frame (its facing `axis`)                                                                                                                                                                                                       |
| **Line**      | a point plus a direction                                                     | any Frame: its position and facing `axis`. `line(a, b)` makes one from two points; a plain `{ at, axis }` works too                                                                                                                                                                     |

| Helper                                                                                                 | Takes                                                          |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| `b.sweep(path, radius, { color })`, `b.membrane(edgeA, edgeB)`, `b.along(path)` | Path                                                           |
| `b.rod/capsule/frustumBox(a, b)`, `b.slab(points)`, `b.loft(stations[].at)`      | Points                                                         |
| `b.spike(base, dirOrTip, len, r)`                                                                      | Point, then a Direction (`len` number) or a Point (`len` null) |
| `b.extrude(outline, { at, x, y })`, `b.lathe(outline, { at, axis })`                                   | 2D outline, then a Point and Directions                        |
| `b.stick(geo, color, on)`                                                   | Frame (seated along its facing axis)                           |
| `b.cards(frames, texture, ...)`                                                                        | Frames (one card on each, standing along its facing axis)      |
| `surface.nearest/ray/around`, `aim`, `offset`, `lerp`, `mid`, `bezier/catmull/arc/spiral`              | Points and Directions                                          |





## Target

A creature module that:

- never calls `updateMatrixWorld`, `attach`, `worldToLocal`, `setFromUnitVectors` or `lookAt`, and never hand-tunes surface offsets or filler spheres.

## Requirements the SDK enforces or guarantees

- Materials: one shared `MeshStandardMaterial` per colour string (roughness 0.72, metalness 0.04). Painted parts share one material whose map is the paint sheet; textured parts and cards get one material per texture and tint, cut away where the texture is transparent (`alphaTest` 0.5).
- Deterministic: randomness only through an `rng` you pass (`rng(seed)` here, or `kit.rng(seed)`).

## Module



`snap.ts` bundles the SDK with your module and maps every `three` import to the page's single copy.

`src/index.ts` re-exports the whole SDK as one module, for apps that map a single import name to it.

**Colour.** Every shape takes `color`: a colour string or a paint. Without one, a shape takes the colour of the nearest part already built, measured from where it starts (its `at`, first point or path start), and the first part of a model is grey `#999999`.

Every helper copies its inputs and returns fresh vectors. `V3` is a literal `[x, y, z]` or `THREE.Vector3`; `PointInput`, `DirectionInput`, `FrameInput` and `PathInput` are the kinds above. Plain number arrays are Points and Directions wherever they come from: literals, variables, object fields (`spike.dir`) and `.map` results all type-check as they are, and a point list is a `number[][]`. A literal that isn't exactly 3 numbers throws, naming the call and the value.

## Frames


`local` and `moved` take a point two ways:

- Numbers `[x, y, z]`: the frame's own axes, which turn with it (see the roll convention below). `hit.moved([0, 0.01, 0])` is 1 cm out along the hit's normal.

`moved` returns a Frame there. Pass it the point itself; `f.moved(f.local(q))` would apply the frame twice.


## Orientation: `aim` and the roll convention


- Axis "y" with `up`: local +Z leans toward `up`.
- Axis "z" or "x": local +Y leans toward `up` (default world +Y), like `lookAt`.


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

## Parts


- `frame` places the geometry on a frame (its position, and its orientation unless another orientation option is given); `at` sets the position alone.
- Orientation priority is `quat`, then `aim`/`dir`, then `rotation` (XYZ degrees), then `frame`, then world axes.
- `axis` picks which geometry axis `aim`/`dir` points (default "y", the axis of three's cylinders and cones) and is the part's facing `axis`.




## Sweep


- `section` is `"circle"` (default, `sides` = 8 × `detail`, smooth), `"box"` or `{ ngon: n }` (faceted). `smooth` overrides the shading. Circles are circumscribed: flat faces sit exactly at `r`, top and bottom are flat, so a tube of radius r whose axis is at height r touches the floor. `detail` sets this tube's own tessellation (default sides, rings along it), see "Detail and budget".
- `caps` is `"round"` (default), `"flat"`, `"point"`, `"none"`, or `{ start, end }`. With round caps, a 2-point sweep is a capsule. `extend: d | [start, end]` continues the tube straight past its ends at the end radius (meters) before the cap.
  - `` (rigid only) instead extends each piece k × radius past the cut with a flat end.
  - Rigid point-array sweeps are split the same way at corners sharper than 20°, inside one mesh.
- `color` is a string or `(t) => string`; a colour function splits the tube exactly where the colour changes. `bands: [[tEnd, color], ...]` splits it at band edges. Colour pieces share their boundary vertices and weights, so they bend together with no gap.
- `sectors: [[fromDeg, toDeg, color], ...]` colours strips around the tube on the dorsal clock (0 = the side facing world up, 180 = belly, +90 clockwise looking along the tube; the clock stays continuous where the tube passes vertical, so a coil keeps its belly on one side).
  - Uncovered angles keep the piece colour.
  - Each sector is its own mesh per piece, sector edges have no walls, and neighbouring sectors share their edge vertices exactly.
  - For countershading, use `sectors: [[-65, 65, DARK], [125, 235, CREAM]]`.
  - `[fromDeg, toDeg, color, fromT, toT]` limits a sector to that stretch of the tube (source t), so one sweep can carry a back stripe and belly on the body and full rings on the tail: `sectors: [[-65, 65, DARK, tagT, 1], [125, 235, CREAM, hipsT, 1]]` with `bands: [[tagT, WHITE]]` gives a fox's dark back, pale belly and white tail tip on one tube.
  - Sectors only need to avoid overlapping where their stretches meet.
- Sectors sit on that world-up clock, so `twist` doesn't turn them. A stripe that spirals round a tube is a paint on its surface coordinates (see "Paint").
- Ring spacing adapts to curvature and twist (about 10° per ring) and to radius or shift change. Straight constant tubes use 2 rings.


- `sweep.from` and `sweep.to` are its swept range.



These shorthands are each one call to `sweep`:

| Call                                            | Shape                                                                                                                                     |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `b.rod(a, b, r \| [r0, r1], opts?)`             | flat ends                                                                                                                                 |
| `b.capsule(a, b, r \| [r0, r1], opts?)`         | round ends                                                                                                                                |
| `b.spike(base, dirOrTip, len, r, opts?)`        | cone to a point; `len` number means direction (a frame gives its axis: `spike(hit, hit, len, r)`), `len` null means `dirOrTip` is the tip |
| `b.frustumBox(a, b, [w0, h0], [w1, h1], opts?)` | box section, full width × height, flat ends                                                                                               |

A `frustumBox`'s ends are square to its a→b axis, so a tilted box standing on the floor dips one edge below it. Keep the axis vertical and lean the box with `shift`, or lift it.


- `pathOrTip` is a tip Point (straight out) or a Path; the frame's point is prepended when the path starts elsewhere.



## Surface and stick


- `.ray(origin, dir)` returns the first hit or null.
- `.around(center?).at(azimuthDeg, elevationDeg)` returns the outermost hit in that direction from `center` (default: bounding-box centre). Azimuth 0 is +Z, 90 is +X; elevation 90 is up.
- `.scatter(count, { rng?, minDist?, keepOut?, filter? })` returns up to `count` area-weighted hits, deterministic for a given `rng`. It rejects points buried inside other target meshes and tries at most `60 × count` candidates. `minDist` is the minimum spacing in meters within this call; nearby-point checks use a spatial grid, so dense coats keep the same sampling without repeatedly transforming every accepted hit.
- `.drape(path, { lift? })` pulls a path onto the built surface: every sample moves to its nearest surface point, then `lift` out along the normal. Knots and closedness carry over, and the path takes the weights of its first hit. Draw a rough loop around the body and drape it for a strap or collar, or drape a short curve for a mouth line or gill slit, then sweep it.
- `.loop(on, { dir?, lift? })` returns the path where a plane cuts the built surface: belts, collars, cuffs, bands, bandoliers, and rows to place studs, plates or feathers `along`.
  - The plane passes through `on`'s point and faces `dir`.
  - When the plane cuts several loops (the torso and both arms), it takes the smallest loop around the point, else the nearest one.
  - It is closed unless the surface is open there, and a plane that misses the surface throws.
  - `loop.slice(t0, t1)` takes an arc of it; `loop.slice(0.9, 1).concat(loop.slice(0, 0.1))` is an arc across the start.




## Membranes and slabs


- `thickness` defaults to 2% of the membrane's width (the mean distance between its edges).
- `rows` defaults to 4 × `detail`.
- It returns closed, double-sided meshes.
- `scallop` (a fraction of the length) pulls the trailing edge between the two tips inward.
- Run both edges in the same direction, from root to tip.


```ts
b.membrane(finger1, finger2, { thickness: 0.02, color: WING, scallop: 0.18 });
b.membrane(finger3, [wrist, flankFront, flankBack], { thickness: 0.02, color: WING, [0] });
b.membrane(neckTube.line(0, -0.01).slice(0.05, 0.45), neckTube.line(0, 0.12).slice(0.05, 0.45), {
  thickness: 0.015,
  color: FIN,
  });
```

## Outlines: extrude and lathe

Both take an outline: at least 3 corners `[x, y]` in meters, drawn in order around the shape (at most 512 after smoothing).

- The loop always closes; a last point repeating the first is dropped, and so is a point repeating the one before it.
- Mark a corner `[x, y, "sharp"]` to keep it pointed through smoothing.
- An outline held in a variable is fine as written; its type is `OutlinePoint[]` (`import type { OutlinePoint } from "../src/builder"`).
- A corner that isn't `[x, y]` or `[x, y, "sharp"]` throws, naming its index.
- An outline that crosses or touches itself throws, naming the two edges.

- `smoothing: 0..3` cuts every unsharp corner into two, a quarter of the way along each neighbouring edge, per round. Few points plus smoothing 2 draws a leaf or petal. It throws when a cut corner would cross another edge, naming the corners; mark one "sharp" or lower it.


- The outline's origin sits at `at`; its +x runs along the model-space Direction `x` and its +y along `y` (default `[0, 1, 0]`, up). `x` is required: name the way the drawing runs, `[0, 0, 1]` for a side view drawn front to back, `[1, 0, 0]` for a front view drawn across the model's left, or the direction along a blade, wing or handle you laid out with other parts. Thickness runs along x × y, centred on the drawing.
- `thickness` is a number, or `[atLowest, atHighest]` for a linear taper from the outline's lowest y to its highest y. Either end can be 0 for a knife edge. Both faces stay flat. `depth`, three.js's name for it, is read as `thickness`.
- `bevel` rounds the front and back rims inward along a quarter circle, so the outline stays the silhouette. It is capped at half the thickness and shrinks until it fits sharp and concave corners. It is drawn in 3 × `detail` steps; one step is a plain chamfer.
- The returned Part's local x, y and z are the outline's x, y and the thickness axis: `fin.local([u, v, 0])` is a point of the drawing, and `fin.local([u, v, t / 2])` is on its front face. Build spots and ribs from it.
- Mirror a pair by mirroring the directions: `x: [s, 0, 0]`, or `x: [0, 0, 1], y: [s * 0.3, 1, 0]`. The outline stays the same.


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
  { at: head.local([0, 0.12, 0]), smoothing: 1, color: FELT },
); // a wide-brimmed hat
```

## Paint, textures and cards

### Paint

Every `color` option also takes a **Paint**: a colour at each surface point, from its model-space position `p` and outward normal `n`.

- That covers sweeps, lofts, `part`, `stick`, membranes, slabs, `extrude`, `lathe`, and sweep `bands` and `sectors`.
- Reading `b.root` bakes every painted part into one shared texture at one texel density over the whole model, so a pattern keeps its size in meters and runs on across body, legs, tail and head when they share the paint.

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


- `size`: `[width, length]` in meters, or one number for both.
- `lean` (degrees, default 0) tips the card from the facing axis toward `flow`: 0 stands straight out, 90 lies along the surface.
- `flow` (default `[0, -0.3, -1]`, back and down), flattened onto the surface: the way cards lean and curl. `(frame, i) => direction` gives each card its own (flight feathers fanning out, hair parting along a spine).
- A card's face looks along `flow`: with the default flow, standing cards face front and back and are seen edge-on from the side. Seen from downstream (from `flow`'s side, looking back), the drawing reads as drawn; `mirror: true` flips it left to right, for the other side of a body.
- `bend` (degrees, default 0) curls each card further toward `flow` from root to tip, one segment per 20° of curl (2 at least).
- `cross: true` adds a second card at right angles through each one, so a tuft reads from every side.
- `vary` (a share: 0.3 means 70% to 130% size), `spin` (± degrees about the facing axis) and `rng` randomise them. With a list of textures, `rng` picks one per card; list a texture twice to pick it twice as often.
- `color` tints the cards: one colour string, or a Paint read at each card's root.
- Cards are shaded with their frame's facing axis as the normal, so they light like the surface they grow from. To lay a card flat and lit from above, give it a frame facing up (`frame(at, [0, 1, 0])`) and `lean: 90`.
- A card is 4 triangles flat and 8 per curl segment with `bend` (16 at `bend: 40`); `cross` doubles that. Parts count meshes, so a thousand cards of one texture are one part.
- `surface.scatter` spaces one set of points evenly. For finer cards in one region (a throat, a face), scatter that region on its own with a smaller `minDist`.

```ts
const tuft = svg(`<svg viewBox="0 0 32 64">...</svg>`, { size: 128 });
const hits = b.surface(bodyTube).scatter(600, { rng: rng(3), minDist: 0.02, filter: (h) => h.n.y > -0.3 });
b.cards(hits, tuft, { size: [0.03, 0.07], lean: 65, bend: 30, vary: 0.3, rng: rng(4), color: coat });
```

### Budget

The harness bakes the model into one mesh with one texture, the atlas: a block of flat colour cells, the paint sheet (`paintSize` texels wide) and every texture with its tint. It packs up to 4096 texels square and shrinks textures when they don't fit; the report prints the atlas size.

### Decals


- `target` is anything `b.surface` takes.
- `at` is a point on or near the surface; a `Hit` also sets `dir` to its normal.
- `dir` is the way the drawing faces, out of the surface toward its viewer: `[0, 0, 1]` for a face looking forward, `[1, 0, 0]` on the model's left flank. A grid of `segments` quads (default 10 along the longer side) is projected onto the surface against it, `lift` (default 1.5 mm) off it, so the drawing reads undistorted from the front.
- `up` (default world +Y) sets the drawing's top, `roll` turns it by degrees counter-clockwise seen from the front, `mirror` flips it left to right (the other eye).

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

  - The limb lies in the plane of root, target and the first hint.
  - With `sole: dir`, the last segment points exactly along `dir` (a toe or flat foot on the floor) and the rest solves to its heel.
  - `region.local(p)` is in meters, `region.p(p)` in region units. Resize a head by editing one number.





- Angle 0 is the direction closest to world up (world +Z when the line is vertical) and angles run counter-clockwise about the line's axis.
- `fromDeg`..`toDeg` defaults to a full turn with even spacing; a partial range puts items on both ends.
- `tilt` leans every item that many degrees toward the line's direction, which makes cones (quill rings, a swept-back frill).


- Each sits `radius` out along its run's centre direction, +Y along it, +Z toward the line's direction; posing one by +deg about its local X lifts its run toward the line's direction.



## Detail and budget

The look is low-poly: facets are part of it, and a part needs only enough segments to read as its shape at the size it is seen. A 2 cm eye is a 6 × 4 sphere, a horn or toe takes 6 to 8 sides, and paints, textures and cards carry the fine detail.

- **Per shape.** `sides` on a tube, `segments` on a lathe, `rows`/`cols` on a membrane, `smoothing` and `bevel` on an extrude, and the segment arguments of three.js geometries set the counts directly. Every shape also takes `detail`, a multiplier on the SDK's defaults for that shape alone: `sweep`, `loft`, the tube helpers, `membrane`, `extrude`, `lathe` and `cards`.
- **Whole model.** `createBuilder({ detail })` scales every default: circle sides (8 × detail), lathe steps (12 × detail), membrane cells, bevel steps, card curl segments and the radius tolerance. `b.segments(n, detail?)` gives `max(3, round(n × detail))` for your own geometry.

## Non-goals

Auto weights for plain meshes, a mirroring helper, grid/row helpers, a ground-shift helper, auto-merge batching, repeating (tiled) textures and UV-mapped images on SDK shapes (paint those). Mirror with `for (const s of [1, -1])`.
