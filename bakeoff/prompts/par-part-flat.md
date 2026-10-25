## You build one part

Several builders build this model at the same time, each writing one function that builds one part of it into a shared builder; the module runs the functions one after another. This shared spec fixes the whole model:

```json
{spec}
```

You build the part **{id}**: {builds}

- It fills the box {box} and attaches like this: {attaches}
- Joints it rides: {joints}.
- {floor}
- Budget: up to {budget} parts and {triangles} triangles.

## Your reply

Your reply is one ```ts block with your imports and one exported function, in place of the whole module the system prompt describes:

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function {fn}({ b, J, P, M }: Ctx) {
  // the part
}
```

- The module provides `Ctx` and calls your function with it: `b` is the shared builder, `J` the spec's joints by name (`J.body`), already created; `P` the palette by name (`P.hull`); `M` the mounts by name as `[x, y, z]` (`M.deckTop`).
- Import every other SDK name you use from `"agentic-3js-builder"`, and kits from `"agentic-3js-builder/kits/<name>"`. Helpers, constants and randomness (`rng(seed)`) live inside your function.
- Your geometry fills your box and meets the other parts at the spec's mounts, on the joints listed for your part (`bone: J.body`).
- Flat colours: each part's `color` is one colour string, from the palette or up to 6 of your own, and parts carry no texture or paint option. Geometry carries the fine detail: stripes, seams, lights, emblems and trim are small parts in their own colours, seated on the surface.
- Joints you add hang under the spec's joints, and their names start with `{id}` (`{id}Hatch`).
- Your function is the finished part, at the quality the system prompt asks for: the module runs it as it is.
