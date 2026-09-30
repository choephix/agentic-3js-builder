# Building a sample

You build one sample for the agentic-3js-builder library: a three.js script that makes the subject named in your brief out of primitives. Creatures get a skeleton; props and scenery can be plain objects. The quality of the finished model is the top priority.

Read these in full before you write code: [`docs/api.md`](docs/api.md), the API; [`docs/conventions.md`](docs/conventions.md), the coordinates, sections, paint coordinates, cards and bounds that every build relies on; and the style kit doc your brief names ([`kits/pixel.md`](kits/pixel.md), [`kits/toon.md`](kits/toon.md), [`kits/clockwork.md`](kits/clockwork.md)). A kit's helpers are the tested way to get its look; use them rather than writing your own. For self-lit surfaces (lanterns, windows, fire, glowing eyes, neon, crystals) in any style, read [`kits/glow.md`](kits/glow.md). `samples/` has working scripts; open one only for a specific technique your brief points you to.

## Your sample

- One file, `samples/<slug>.ts`, with a lowerCamel slug. It is the only file you write.
- It default-exports a function with no arguments that returns a `THREE.Object3D`, and exports `meta = { name, description }`.
- It imports `three`, the SDK by relative path (`../src/builder`, `../src/path`, …) and any kit (`../kits/pixel`).
- Randomness comes from `rng(seed)`, so every run builds the same model.

## The model

- Meters. +Y up, the model faces +Z, its left side is +X, centred on x = 0.
- It stands on y = 0: its lowest points touch the floor or sink into it by up to 2% of the model's height, and nothing hangs above it. A model the brief places off the ground (a bird in flight, a hanging lantern) keeps that height.
- Real size, per the brief.
- Creatures are built skeleton first and stand in a rest pose for rigging and animation: a neutral, readable pose, the non-humanoid equivalent of a T-pose, with limbs, digits, wings, tails and tentacles separated and extended, and the mouth built as a separate upper and lower jaw so it can open.
- Joints carry names a rigger recognises (`hipL`, `kneeL`, `jaw`, `tail3`) and chains carry a `role` (`spine neck head jaw hinge tail leg arm wing digit tentacle fan`), so the rig answer key describes the whole skeleton.
- Limits: 1000 parts, 60k triangles, 160 joints, 64 flat colours. Parts are free below the limit (the lab merges them into one mesh), so each piece stays its own part. Paints and textures share one atlas, which the report sizes.

## Art direction, from Stefan

> By lots of detail I mean mostly a simple base. Each of these is still made out of primitives so they should retain that blocky shape expected of a puppet made out of primitives. The composition, the color and material choice, and the little details on top of those simple shapes should be what give me that wow factor.

The look is stylized unless the brief asks otherwise: bold, readable shapes and proportions, a clear colour palette, and features that are shaped with character and emphasised where that helps the subject read.

Use as many primitives as you need to make it look good. Surfaces can carry more than flat colour: paints (patterns in meters, baked into textures), SVG drawings as textures, decals on curved surfaces, and cards (many small textured cut-outs). `docs/api.md` "Paint, textures and cards" covers them.

The wow comes from creativity, not smoothness. The look is low-poly: facets are part of it, and every part gets only enough segments to read as its shape at the size it is seen, spread evenly with none bunched in one place. Paints, textures and cards carry the fine detail. The snap report's "Fine meshes" list names the parts to thin out; `docs/api.md` "Detail and budget" covers the controls.

## Build loop

```
npm run typecheck -- <slug>
npm run preview -- <slug> --shot
npm run snap -- <slug> v01
npm run sheet -- <slug>@v01 <slug>@v02 --view three-quarter
```

- `typecheck -- <slug>` checks your file and what it imports with the project's settings (unused names are errors), and nothing else, so other samples never block or hide your result. It prints `No type errors in <slug>.` when you're clean.
- `preview` takes about a second and costs no render. It writes every texture your model uses (each drawing and the paint sheet) as PNG, a parts table with world bounds, the parts sunk deeper than the floor allowance with their depth, and with `--shot` a three-quarter and a front image, to `~/tmp/public/nilo/agentic-3js-builder/preview/<slug>/`. Run it after every change you want to see: a drawing, a paint, a placement, the floor contact.
- `preview` answers `--gap <A> <B>` (surface distance between two parts, groups or bones), `--bones <A>` (which bones move them, by share) and `--box <A>` (their combined world bounds, size and centre), so you can measure what a screenshot cannot show before spending a render. `snap --report-only` costs no render either and also lists loose parts (solid parts touching nothing near the main body, largest gap first) and stiff parts (large parts moved by one bone while joints below that bone pivot inside them): measurements to judge against the brief.
- `snap` is the full render. It bakes the sample on the shared NVIDIA GPU and prints issues, counts, size and the skeleton tree. It writes a contact sheet (front, three-quarter, side, back, top, low hero angle, head close-up, bone colours, two skeleton x-rays and two flex tests that bend every bone at random), the single shots, the texture atlas (`<tag>-atlas.png`), a report and the GLBs to `~/tmp/public/nilo/agentic-3js-builder/snaps/<slug>/`. Look at the contact sheet and both flex shots every round.
- `--report-only` prints the snap checks without rendering.
- `sheet` lays rendered shots side by side without rendering anything: `<slug>@<tag>` picks a version, a bare slug its latest, `--view` one of the snap's single shots (`front`, `three-quarter`, `side`, `back`, `top`, `low`, `head`, `bones`, `skeleton`, `skeleton-side`, `flex-a`, `flex-b`). Use it to compare versions or to see your model next to a sample in the library. It prints where it wrote the image.
- Every snapshot takes a new tag: `v02`, `v03`, `v04-legs`.
- Throwaway scripts go in `scratch/<slug>/` (gitignored); both `preview` and `snap` take a path there as well as a slug. Delete them when you finish.
- The browser on port 9333 is shared and already running; `preview` and `snap` connect to it.
- You're done when `npm run typecheck -- <slug>` is clean, the report lists no issues, you're proud of the model from every angle and in both flex shots, and your last snapshot is of your final file.

## Final reply

Slug, name, final tag, part count, triangle count, joint count, colours, size in meters, and a few lines on the design and how it evolved.
