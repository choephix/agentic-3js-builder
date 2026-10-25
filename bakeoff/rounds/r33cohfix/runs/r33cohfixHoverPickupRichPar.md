Cause: in `buildCab`, the visor line `put(box(2.3, 0.04, 0.08), HAZ, ...)` passes the SVG texture `HAZ` as the colour argument, but `part()` accepts only a colour string or a paint. The textured plane on the next line already draws the hazard stripes, so I removed the bad call.

<<<<<<< SEARCH
  put(box(2.3, 0.04, 0.08), HAZ, [0, 2.0, 1.5], { rotation: [-20, 0, 0] });
=======
  put(box(2.3, 0.04, 0.08), P.trim, [0, 2.0, 1.5], { rotation: [-20, 0, 0] });
>>>>>>> REPLACE