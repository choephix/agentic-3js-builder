`lerp()` in the SDK operates on 3D Points/Vectors rather than scalar numbers; replace the tripod midpoint calculation with arithmetic averaging.

## Edits

<<<<<<< SEARCH
import {
  createBuilder,
  frame,
  aim,
  DEG,
  lerp,
  offset,
  rng,
  catmull,
  grain,
  mottle,
  paint,
  svg,
} from "agentic-3js-builder";
=======
import {
  createBuilder,
  frame,
  aim,
  DEG,
  offset,
  rng,
  catmull,
  grain,
  mottle,
  paint,
  svg,
} from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(
      catmull([
        [topX, TRIPOD_RING_Y, topZ],
        [lerp(topX, botX, 0.5) + 0.008, TRIPOD_RING_Y - 0.05, lerp(topZ, botZ, 0.5)],
        [botX, TABLE_TOP_Y, botZ],
      ]),
      0.005,
      { bone: root, color: DARK_BRASS },
    );
=======
    b.sweep(
      catmull([
        [topX, TRIPOD_RING_Y, topZ],
        [(topX + botX) * 0.5 + 0.008, TRIPOD_RING_Y - 0.05, (topZ + botZ) * 0.5],
        [botX, TABLE_TOP_Y, botZ],
      ]),
      0.005,
      { bone: root, color: DARK_BRASS },
    );
>>>>>>> REPLACE