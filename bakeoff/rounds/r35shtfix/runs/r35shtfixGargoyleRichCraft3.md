The ear outlines were cast to `[number, number, "sharp"?][]`, whose optional third element is `"sharp" | undefined`; the SDK's `OutlinePoint` only accepts `[x, y]` or `[x, y, "sharp"]`. Typing them as `OutlinePoint[]` fixes both lines.

<<<<<<< SEARCH
    const earOutline = [
      [0, 0],
      [0.08, 0],
      [0.13, 0.12],
      [0.12, 0.26, "sharp"],
      [0.06, 0.18],
      [0, 0.14],
    ] as [number, number, "sharp"?][];
=======
    const earOutline: OutlinePoint[] = [
      [0, 0],
      [0.08, 0],
      [0.13, 0.12],
      [0.12, 0.26, "sharp"],
      [0.06, 0.18],
      [0, 0.14],
    ];
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.extrude(
      [
        [0.02, 0.02],
        [0.07, 0.02],
        [0.1, 0.11],
        [0.1, 0.2, "sharp"],
        [0.06, 0.15],
        [0.02, 0.12],
      ] as [number, number, "sharp"?][],
=======
    const earInner: OutlinePoint[] = [
      [0.02, 0.02],
      [0.07, 0.02],
      [0.1, 0.11],
      [0.1, 0.2, "sharp"],
      [0.06, 0.15],
      [0.02, 0.12],
    ];
    b.extrude(
      earInner,
>>>>>>> REPLACE

<<<<<<< SEARCH
import type { Fill, JointRef } from "agentic-3js-builder";
=======
import type { Fill, JointRef } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";
>>>>>>> REPLACE