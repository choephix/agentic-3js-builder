Cause: `require(...)` is used inside an ES module (it has `import` statements), which Node rejects, so the merge helper has to be a top-level `import` instead.

<<<<<<< SEARCH
import { glow } from "agentic-3js-builder/kits/glow";
=======
import { glow } from "agentic-3js-builder/kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
>>>>>>> REPLACE

<<<<<<< SEARCH
  const { mergeGeometries } = require("three/addons/utils/BufferGeometryUtils.js");
  const merged = mergeGeometries(bolts);
=======
  const merged = mergeGeometries(bolts);
>>>>>>> REPLACE