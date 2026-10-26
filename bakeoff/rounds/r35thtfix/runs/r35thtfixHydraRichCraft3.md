```ts
// Causes: several helpers were imported from the wrong package, PathPoint has no `i`, and `b.stick` requires a Frame rather than a bare Vector3.

<<<<<<< SEARCH
  b,
  catmull,
  countershade,
  createBuilder,
  furEdge,
  gradient,
  limb,
  mottle,
  rng,
  scales,
  svg,
} from "agentic-3js-builder";
import { animeEye, INK, inkLines } from "agentic-3js-builder/kits/toon";
=======
  catmull,
  countershade,
  createBuilder,
  gradient,
  limb,
  mottle,
  rng,
  scales,
  svg,
} from "agentic-3js-builder";
import { cel, furEdge, animeEye, INK, inkLines } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";
>>>>>>> REPLACE

<<<<<<< SEARCH
        name: `neck-collar-rivet-${record.tag}-${at.i}`,
=======
        name: `neck-collar-rivet-${record.tag}-${Math.round(at.t * 100)}`,
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.stick(
        new THREE.SphereGeometry(0.052, 7, 5),
        BONE,
        head.local([side * 0.27, 0.12, -0.11]),
        {
          embed: 0.42,
          spin: side * 20,
          group: "face-armor",
          name: `jaw-hinge-stud-${tag}-${side}`,
        },
      );
=======
      b.part(
        new THREE.SphereGeometry(0.052, 7, 5),
        BONE,
        {
          bone: head,
          at: head.local([side * 0.27, 0.12, -0.11]),
          group: "face-armor",
          name: `jaw-hinge-stud-${tag}-${side}`,
        },
      );
>>>>>>> REPLACE

<<<<<<< SEARCH
        name: `hip-rivet-${at.i}`,
=======
        name: `hip-rivet-${Math.round(at.t * 100)}`,
>>>>>>> REPLACE
```