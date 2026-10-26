The first error passes the broader `ColorInput` type where `b.part` expects `Fill`; the second repeats `color` inside `PartOptions`, where it must only be the second argument.

```text
<<<<<<< SEARCH
import { type Builder, createBuilder, noise, paint, type ColorInput, catmull, svg } from "agentic-3js-builder";
=======
import { type Builder, createBuilder, noise, paint, type Fill, catmull, svg } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
    color: ColorInput,
=======
    color: Fill,
>>>>>>> REPLACE

<<<<<<< SEARCH
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      color,
      name,
      rotation,
      flat: true,
    });
=======
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name,
      rotation,
      flat: true,
    });
>>>>>>> REPLACE
```