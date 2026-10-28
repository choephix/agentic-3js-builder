The gilt border sweep was given points that are all the same (the crest arch outline was spliced and built from plain tuples). `archPts(...).slice(2)` yields `[x, y]` pairs, and then `p[0], TOP + p[1] + 0.0, -0.138` works, but the first two raw points sit at the same position as the prepended one, and the last point repeats the first. The path therefore collapses into fewer than two distinct points. The fix is to build the border from the arc points only, with no duplicated end points.

<<<<<<< SEARCH
  const border = archPts(0.62, 0.3, 0.68).slice(2).map((p) => [p[0], TOP + p[1] + 0.0, -0.138]);
  border.unshift([-0.62, TOP + 0.0, -0.138]);
  border.push([0.62, TOP, -0.138]);
  b.sweep(border.slice(0, -0), 0.008, { color: GILT, sides: 4, caps: "flat" });
=======
  const border: number[][] = [[-0.62, TOP + 0.02, -0.138]];
  for (let k = 0; k <= 16; k++) {
    const t = k / 16;
    const px = -0.62 + 1.24 * t;
    const py = 0.3 + 0.38 * (1 - Math.pow(2 * t - 1, 2));
    border.push([px, TOP + py, -0.138]);
  }
  border.push([0.62, TOP + 0.02, -0.138]);
  b.sweep(border, 0.008, { color: GILT, sides: 4, caps: "flat" });
>>>>>>> REPLACE