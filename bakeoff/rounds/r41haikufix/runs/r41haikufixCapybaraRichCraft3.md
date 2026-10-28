Cause: line 78 passes a raw `Vector3` (from `neck.local(...)`) to `b.stick`, which needs a Frame, so the hit must be a Frame such as `neck.local` mapped through a frame helper, or simply a point wrapped with `frame()`.

Fix: wrap the point in `frame(point, [0, 0, 1])` so `stick` gets a Frame, and keep the scarf trim facing forward.

<<<<<<< SEARCH
  b.stick(new THREE.BoxGeometry(0.05, 0.1, 0.02), SCARF_TRIM, neck.local({ forward: 0.2, up: -0.12 }), {
    embed: 0.2,
  });
=======
  b.stick(new THREE.BoxGeometry(0.05, 0.1, 0.02), SCARF_TRIM, frame(neck.local({ forward: 0.2, up: -0.12 }), [0, 0, 1]), {
    embed: 0.2,
  });
>>>>>>> REPLACE

The import line also needs `frame`:

<<<<<<< SEARCH
import { createBuilder, rng } from "agentic-3js-builder";
=======
import { createBuilder, frame, rng } from "agentic-3js-builder";
>>>>>>> REPLACE