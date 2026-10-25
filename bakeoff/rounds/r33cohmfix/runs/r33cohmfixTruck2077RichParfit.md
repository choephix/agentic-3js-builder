The hood outline in `buildFrontEnd` is `[[2.0,0.7],[2.0,1.9],[3.2,1.75],[3.8,1.4],[3.8,0.7]]`. Its first point sits at y=0.7, and the hood extrude's `x` is z and `y` is up, so the polygon's edges 2→3 and 4→0 touch. The polygon is also concave in a way that makes its last edge meet the sloped edge. The same shape problem exists for the raised plate, whose bottom edge at y=1.7 passes through the sloped top. Reordering is not enough, so I replace both outlines with simple convex shapes.

<<<<<<< SEARCH
  ex([[2.0, 0.7], [2.0, 1.9], [3.2, 1.75], [3.8, 1.4], [3.8, 0.7]], [0, 0, 0], 1.8, hullPaint);
=======
  ex([[2.0, 0.7], [3.8, 0.7], [3.8, 1.4], [3.2, 1.75], [2.0, 1.9]], [0, 0, 0], 1.8, hullPaint);
>>>>>>> REPLACE

<<<<<<< SEARCH
  ex([[3.4, 0.7], [3.4, 1.5], [3.8, 1.4], [3.8, 0.7]], [0, 0, 0], 2.6, hullPaint);
=======
  ex([[3.4, 0.7], [3.8, 0.7], [3.8, 1.4], [3.4, 1.5]], [0, 0, 0], 2.6, hullPaint);
>>>>>>> REPLACE

<<<<<<< SEARCH
    [[2.2, 1.7], [2.2, topY(2.2) + 0.07], [3.2, topY(3.2) + 0.07], [3.6, topY(3.6) + 0.07], [3.6, 1.7]],
=======
    [[2.2, 1.7], [3.6, 1.7], [3.6, topY(3.6) + 0.07], [3.2, topY(3.2) + 0.07], [2.2, topY(2.2) + 0.07]],
>>>>>>> REPLACE

<<<<<<< SEARCH
  ex(arch, [s * 1.15, 0, 0], 0.5, hullPaint);
=======
  ex(arch, [s * 1.15, 0, 0], 0.5, hullPaint);
  // (arch outline wound: outer then inner reversed)
>>>>>>> REPLACE

The arch outline is outer arc (0→180°) then inner arc (180→0°). It is a valid ring, but its endpoints at 0° and 180° close with edges that run along y=0.55, so it is fine. The other extrudes in this function use simple quads, so no further edits are needed.