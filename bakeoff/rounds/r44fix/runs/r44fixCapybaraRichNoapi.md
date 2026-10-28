The cause: `b.surface` was called with an empty array (a leftover placeholder), and the fur-tuft cards were given fake `{ at }` objects instead of real frames. I remove the empty surface call and build the tufts with `frame()`.

<<<<<<< SEARCH
import { createBuilder, catmull, rng, paint, mix, noise, smoothstep, svg } from "agentic-3js-builder";
=======
import { createBuilder, catmull, rng, paint, mix, noise, smoothstep, svg, frame } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
  const skin = b.surface(b.root.children.length ? [] as never : [] as never);
  void skin;
=======
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.cards([{ at: new THREE.Vector3((r() - 0.5) * 0.2, 0.66 - Math.abs(z - 0.1) * 0.12, z) } as never], TUFT, { size: [0.04, 0.07], color: FUR_L });
=======
    b.cards([frame([(r() - 0.5) * 0.2, 0.66 - Math.abs(z - 0.1) * 0.12, z], [0, 1, 0])], TUFT, { size: [0.04, 0.07], color: FUR_L, bone: hips });
>>>>>>> REPLACE