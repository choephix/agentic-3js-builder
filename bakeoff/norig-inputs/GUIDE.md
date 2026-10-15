# Building a sample

You build one sample for the agentic-3js-builder library: a three.js script that makes the subject named in your brief out of primitives. The quality of the finished model is the top priority.

Read these in full before you write code: [`docs/api.md`](docs/api.md), the API; [`docs/conventions.md`](docs/conventions.md), the coordinates, sections, paint coordinates, cards and bounds that every build relies on; and the style kit doc your brief names ([`kits/pixel.md`](kits/pixel.md), [`kits/toon.md`](kits/toon.md), [`kits/clockwork.md`](kits/clockwork.md)). A kit's helpers are the tested way to get its look; use them rather than writing your own. For self-lit surfaces (lanterns, windows, fire, glowing eyes, neon, crystals) in any style, read [`kits/glow.md`](kits/glow.md). `samples/` has working scripts; open one only for a specific technique your brief points you to.

## Your sample

- One file, `samples/<slug>.ts`, with a lowerCamel slug. It is the only file you write.
- It default-exports a function with no arguments that returns a `THREE.Object3D`, and exports `meta = { name, description }`.
- It imports `three`, the SDK by relative path (`../src/builder`, `../src/path`, …) and any kit (`../kits/pixel`).
- Randomness comes from `rng(seed)`, so every run builds the same model. `build()` creates every generator it draws from, so building twice gives the same model twice.

## The model

- Meters. +Y up, the model faces +Z, its left side is +X, centred on x = 0.
- It stands on y = 0: its lowest points touch the floor or sink into it by up to 2% of the model's height, and nothing hangs above it. A model the brief places off the ground (a bird in flight, a hanging lantern) keeps that height.
- Real size, per the brief.
- Limits: 1000 parts, 60k triangles, 64 flat colours. Parts are free below the limit (the lab merges them into one mesh), so each piece stays its own part. Paints and textures share one atlas, which the report sizes.

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
npm run snap -- <slug> --report-only
npm run sheet -- <slug>@v01 <slug>@v02 --view three-quarter
```

- `typecheck -- <slug>` checks your file and what it imports with the project's settings (unused names are errors), and nothing else, so other samples never block or hide your result. It prints `No type errors in <slug>.` when you're clean.
- `preview` takes about a second and costs no render. It writes every texture your model uses (each drawing and the paint sheet) as PNG, a parts table with world bounds, the parts sunk deeper than the floor allowance with their depth, and with `--shot` a three-quarter and a front image, to `~/tmp/public/nilo/agentic-3js-builder/preview/<slug>/`. Run it after every change you want to see: a drawing, a paint, a placement, the floor contact. A run without `--shot` keeps the previous shots.
- Every snapshot takes a new tag: `v02`, `v03`, `v04-legs`.
- Throwaway scripts go in `scratch/<slug>/` (gitignored); both `preview` and `snap` take a path there as well as a slug. Delete them when you finish.
- The browser on port 9333 is shared and already running; `preview` and `snap` connect to it.
- You're done when `npm run typecheck -- <slug>` is clean, the report lists no issues, you're proud of the model from every angle, and your last snapshot is of your final file.

## Final reply

Slug, name, final tag, part count, triangle count, colours, size in meters, and a few lines on the design and how it evolved.
