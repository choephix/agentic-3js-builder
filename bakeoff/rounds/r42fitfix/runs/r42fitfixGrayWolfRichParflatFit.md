The crash comes from the render harness, not the module: Playwright asserts on an unexpected Chrome extension service-worker target (`chrome-extension://…/thunk.js`) before any model code runs. The fix is to launch the harness browser without extensions, for example a clean profile or `--disable-extensions`, which I can't change from the module. I'm only removing the unused `limb` import so strict unused-import checks can't fail the module as well.

<<<<<<< SEARCH
import { createBuilder, type Builder, type Joint, frame, rng, catmull, limb } from "agentic-3js-builder";
=======
import { createBuilder, type Builder, type Joint, frame, rng, catmull } from "agentic-3js-builder";
>>>>>>> REPLACE