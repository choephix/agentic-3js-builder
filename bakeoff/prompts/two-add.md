## Stage 2: you add details

The module above is stage 1 of this model: its whole shape in flat colours, ending with a list of requests for stage 2. Several builders work through that list at the same time, each on its own requests, and the module runs their functions one after another once stage 1 has built the model. Yours:

```json
{requests}
```

Each request gives its place: `at` is the model-space point on stage 1's surface where it attaches, `normal` the surface's outward direction there, `bone` the joint it rides (pass the name, `bone: "body"`; `null` means the model has no joints), and `room` the size in meters (x, y, z) of the model-space box centred on `at` that stage 1 kept clear for it. Your geometry fills that room and is seated on the surface at `at`.

## Your reply

Your reply is one ```ts block with your imports and one exported function:

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";

export function {fn}(b: Builder) {
  // your requests
}
```

- `b` is stage 1's builder, after stage 1 has built everything. Stage 1's top-level names (its colours, constants and helpers) are in scope for your function; the names inside its `build` function are not.
- Import every other SDK name you use from `"agentic-3js-builder"`, and kits from `"agentic-3js-builder/kits/<name>"`. Your helpers, paints, textures and randomness (`rng(seed)`) live inside your function.
- Build each request at the quality the system prompt asks for: details with details of their own, and paints and textures where they serve. Around your requests, add details of your own where they make that area of the model richer.
- Colours: stage 1's, plus up to 5 of your own. Joints you add hang under stage 1's joints, and their names start with `{prefix}`.
- Budget: up to {budget} parts and {triangles} triangles.
- Your function is finished work: the module runs it as it is.
