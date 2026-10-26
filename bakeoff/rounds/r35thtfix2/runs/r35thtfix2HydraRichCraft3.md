```ts
// Cause: b is not an SDK export, while cel and furEdge come from the toon kit and glow comes from the glow kit.

<<<<<<< SEARCH
import {
  bezier,
  b,
  catmull,
  countershade,
  createBuilder,
  furEdge,
  glow,
  gradient,
  inkLines,
  limb,
  mottle,
  rng,
  scales,
  svg,
} from "agentic-3js-builder";
=======
import {
  bezier,
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
import { cel, furEdge, inkLines, INK } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";
>>>>>>> REPLACE

<<<<<<< SEARCH
import { animeEye, INK, inkLines } from "agentic-3js-builder/kits/toon";
=======
import { animeEye } from "agentic-3js-builder/kits/toon";
>>>>>>> REPLACE
```