## Two stages

This model is built in two stages, and you write the first. Stage 1 is the whole model in flat colours: its silhouette and proportions, every main part, the skeleton when it has one, and a colour per part. Your module renders on its own, and the app shows it the moment it arrives. Stage 2 starts as soon as your module is done: several builders work through a list of requests you write, all at the same time, adding the details you ask for and painting the textures you ask for. They know the model through your module and its list, so the list is how you direct them.

Build the shape and leave room for what you request. Where an emblem, a light bar, a grille, vents, cables, an antenna array, armour plating, a weapon's fittings, a screen or a pattern belongs, keep that surface plain and clear, sized for it, and put it on the list. Stage 2 builds those; you build everything they sit on.

## The request list

The module exports the list as plain data, strings, numbers and `null` only, right after `meta`:

```ts
export const REQUESTS = [
  {
    id: "roofLightBar",
    kind: "add",
    part: "cab",
    what: "Neon light bar across the cab roof: a slim housing, six lamps alternating CYAN and MAGENTA, and the brackets that hold it.",
    at: [0, 2.1, 0.8],
    normal: [0, 1, 0],
    bone: null,
    room: [1.6, 0.3, 0.4],
  },
  {
    id: "hullCamo",
    kind: "texture",
    part: "hullSide",
    what: "Urban digital camo in HULL and HULL_DARK on both hull sides, with a faded unit number near the rear.",
  },
];
```

- `kind: "add"` asks for new geometry at one place. `at` is the model-space point on your surface where it attaches, `normal` the surface's outward direction there, `bone` the name of the joint it rides (`null` on a model without joints), and `room` the size in meters (x, y, z) of the model-space box centred on `at` that you keep clear for it.
- `kind: "texture"` asks for a paint or texture on parts you built. `part` is their `name` (give those parts that `name:` option), and `what` says what the surface shows.
- `what` is a builder's brief: what to build or paint, its look, its colours by your palette's names, and how rich it is. A pair or a row is one request: `at` is one of them, and `what` places the others.
- Write 6–12 add requests and 2–5 texture requests: the details that make the subject read in its style.

## Stage 2's hook

Import `type Builder` from the SDK, declare `export const STAGE2: ((b: Builder) => void)[] = [];` at the top level, and end the default-export function with `for (const add of STAGE2) add(b);` right before `return b.root;`. Stage 2 appends its functions to that list, so they run on your builder once your model is built; with the list empty, your module renders stage 1. Your palette lives at the top level, where stage 2's code can use it by name.
