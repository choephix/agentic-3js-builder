The `box` helper was called with an svg texture (`HAZARD`) as its colour argument in the turret loop (`box([0.04, 0.6, 0.9], …, HAZARD)`), so `part()` received a Texture instead of a colour string or paint. Replace that call with a `dec` decal.

<<<<<<< SEARCH
  box([0.04, 0.6, 0.9], [s * 0.95, 2.82, -0.2], HAZARD);
=======
  dec(HAZARD, 0.9, 0.2, [s * 1.205, 2.9, -0.2], [s, 0, 0]);
>>>>>>> REPLACE