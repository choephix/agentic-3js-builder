## Build the base first

Build only the model's structural base in flat colours: the chassis, hull, body, or main shell that the other parts will sit on. This is the first visible result. Make it a complete, sturdy silhouette with the main proportions and attachment surfaces, but leave secondary parts, trim, weapons, limbs, wheels, windows, lights, emblems and other detail to the part builders.

Your reply is one ```ts block with the module and no prose. It must have this exact interface:

```ts
import * as THREE from "three";
import { createBuilder, type Builder } from "agentic-3js-builder";

export const BASE_PARTS = [
  {
    id: "partName",
    builds: "the complete add-on part and its details",
    box: [
      [-1, 0, -1],
      [1, 2, 1],
    ],
    attaches: "the mount or surface where it meets the base",
    joints: [],
    floor: false,
    budget: 150,
  },
];

export default function build() {
  const b = createBuilder({ name: "model" });
  // Create the base's joints first, then build only the base geometry.
  // The base is centred on x = 0, +Y is up, +Z is front, and rests on y = 0.
  return b.root;
}
```

`BASE_PARTS` is a literal array of 3–6 add-on parts. Every entry must include the fields shown above. The `box` is the part's model-space min and max corners in metres, and all of its pieces must fit inside it. `builds` is a concrete brief for everything that part owns; `attaches` names the exact base surface, mount or joint where it meets the base; `joints` names any base joints it rides; `floor` says whether its lowest points rest on y = 0; budgets add to at most 900. Choose boxes and attachment points from the geometry you actually build, not from a generic plan.

The base call is the only call before the part builders, so make its proportions and surfaces unambiguous in code. Use flat colour strings only: no textures, paint options or texture helpers. Keep the base itself focused and leave room for every listed part. The module must render on its own and return `b.root` from the default `build` function. Do not write any add-on part functions yet.
