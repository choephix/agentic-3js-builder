Cause: `glow` belongs to the glow kit, `chain.tip` is nullable, and the spike overload needs an explicitly typed `null` length.

```ts
<<<<<<< SEARCH
import { cel, glow } from "agentic-3js-builder/kits/toon";
=======
import { cel } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";
>>>>>>> REPLACE

<<<<<<< SEARCH
    const clawBone = leg.chain.tip;
=======
    const clawBone = leg.chain.tip ?? leg.chain.joints[leg.chain.joints.length - 1];
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.spike(base, tip, null, 0.052, {
=======
      b.spike(base, tip, null as null, 0.052, {
>>>>>>> REPLACE