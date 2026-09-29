# Building a sample

You build one sample for the agentic-3js-builder library: a three.js script that makes the subject named in your brief out of primitives. Creatures get a skeleton; props and scenery can be plain objects. The quality of the finished model is the top priority.

`README.md` in this folder is the API. Read it in full before you write code. `samples/` has working scripts that use it.

## Your sample

- One file, `samples/<slug>.ts`, with a lowerCamel slug. It is the only file you write.
- It default-exports a function with no arguments that returns a `THREE.Object3D`, and exports `meta = { name, description }`.
- It imports `three`, and the SDK by relative path (`../src/builder`, `../src/path`, …).
- Randomness comes from `rng(seed)`, so every run builds the same model.

## The model

- Meters. +Y up, the model faces +Z, its left side is +X, centred on x = 0.
- It rests on y = 0: its lowest point touches the floor.
- Real size, per the brief.
- Creatures are built skeleton first and stand in a rest pose for rigging and animation: a neutral, readable pose, the non-humanoid equivalent of a T-pose, with limbs, digits, wings, tails and tentacles separated and extended, and the mouth built as a separate upper and lower jaw so it can open.
- Joints carry names a rigger recognises (`hipL`, `kneeL`, `jaw`, `tail3`) and chains carry a `role`, so the rig answer key describes the whole skeleton.
- Limits: 1000 parts, 60k triangles, 160 joints, 64 flat colours. Paints and textures share one atlas, which the report sizes.

## Art direction, from Stefan

> By lots of detail I mean mostly a simple base. Each of these is still made out of primitives so they should retain that blocky shape expected of a puppet made out of primitives. The composition, the color and material choice, and the little details on top of those simple shapes should be what give me that wow factor.

Use as many primitives as you need to make it look good. Surfaces can carry more than flat colour: paints (patterns in meters, baked into textures), SVG drawings as textures, and cards (many small textured cut-outs). README's "Paint, textures and cards" covers them.

The wow comes from creativity, not smoothness. The look is low-poly: facets are part of it, and every part gets only enough segments to read as its shape at the size it is seen, spread evenly with none bunched in one place. Paints, textures and cards carry the fine detail. The snap report's "Fine meshes" list names the parts to thin out; README's "Detail and budget" covers the controls.

## Snapshot loop

```
npm run typecheck
npm run snap -- <slug> v01
```

- `snap` bakes the sample on the shared NVIDIA GPU and prints issues, counts, size and the skeleton tree. It writes a contact sheet (front, three-quarter, side, back, top, low hero angle, head close-up, bone colours, two skeleton x-rays and two flex tests that bend every bone at random), the single shots, the texture atlas (`<tag>-atlas.png`: every colour, paint and drawing the model uses, packed into the one texture its GLBs carry), a report and the GLBs to `~/tmp/public/nilo/agentic-3js-builder/snaps/<slug>/`. Look at the contact sheet and both flex shots every round.
- `--report-only` prints the checks without rendering.
- Every snapshot takes a new tag: `v02`, `v03`, `v04-legs`.
- The browser on port 9333 is shared and already running; `snap` connects to it.
- You're done when typecheck passes, the report lists no issues, you're proud of the model from every angle and in both flex shots, and your last snapshot is of your final file.

## Final reply

Slug, name, final tag, part count, triangle count, joint count, colours, size in meters, and a few lines on the design and how it evolved.
