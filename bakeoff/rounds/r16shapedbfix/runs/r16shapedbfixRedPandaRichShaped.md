Cause: the module imported the SDK through relative `src/` paths while the kits import it as `"agentic-3js-builder"`. That gives two copies of the SDK, so the kit's `Paint` instances (`cel`, `furEdge`) fail the builder's `instanceof Paint` check, get treated as colour strings, and nothing opaque renders. The fix is to import everything from the single package name.

<<<<<<< SEARCH
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { offset, rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { limb } from "../../../../src/ik";
import { mottle, noise, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
=======
import { createBuilder, frame, offset, rng, bezier, catmull, limb, mottle, noise, paint, svg } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";
>>>>>>> REPLACE