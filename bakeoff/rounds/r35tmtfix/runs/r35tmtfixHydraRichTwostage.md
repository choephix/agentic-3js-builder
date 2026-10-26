Cause: `paint` was not imported, and nullable chain tips/parents were passed where the SDK requires a definite `JointRef`.

```ts
<<<<<<< SEARCH
import { type Builder, createBuilder, catmull, limb, spiral, frame } from "agentic-3js-builder";
=======
import { type Builder, createBuilder, catmull, limb, spiral, frame, paint } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
    const head = neck.tip;
=======
    const head = neck.tip!;
>>>>>>> REPLACE

<<<<<<< SEARCH
      { color: PALETTE.hideLight, bone: head.parent?.userData?.joint ?? head, section: "box", name: `${neckName}Armor` },
=======
      { color: PALETTE.hideLight, bone: head, section: "box", name: `${neckName}Armor` },
>>>>>>> REPLACE
```