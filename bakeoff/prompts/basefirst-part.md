## Build one part against the real base

The base builder already wrote and rendered this model. Here is its exact source, including the geometry and the part list it declared:

```ts
{
  base;
}
```

You build the add-on part **{id}**: {builds}

- It fills the model-space box {box} and attaches like this: {attaches}
- Joints it rides: {joints}.
- {floor}
- Budget: up to {budget} parts and {triangles} triangles.

Read the base code closely. Place this part against the base's actual dimensions, surfaces and attachment points; do not redesign the base and do not trust a hypothetical layout that conflicts with its code. Keep all of this part inside its box, while meeting the named attachment surfaces. Every listed detail belongs to this function and should be built in flat colours.

Your reply is one ```ts block with imports and exactly one exported function:

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function {fn}(b: Builder) {
  // Build this part into the existing builder. Its coordinates are model space.
}
```

The runner calls your function after the base geometry has been built and before the base's `return b.root`. The `b` argument is the same builder, so append geometry to it; do not call `createBuilder`, return an Object3D, or write a separate default build function. Import SDK names from `agentic-3js-builder` and kits from `agentic-3js-builder/kits/<name>`. Use colour strings only: no textures, paint options or texture helpers. Keep helpers and constants inside your function, and give joints you add names starting with `{id}`.
