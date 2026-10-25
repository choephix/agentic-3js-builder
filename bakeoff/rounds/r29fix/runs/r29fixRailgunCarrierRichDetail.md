Cause: the railgun's `gbox` helper takes `color` as its 4th argument, but the hazard-stripe calls pass the `HAZARD` texture there. It ends up in `b.part(..., color, ...)`, which rejects it. The fix is to pass a colour string as `color` and the texture through `o`.

<<<<<<< SEARCH
  gbox(1.0, 0.2, 1.2, HAZARD, -0.55, 0, 0.6, { texture: HAZARD });
=======
  gbox(1.0, 0.2, 1.2, "#ffffff", -0.55, 0, 0.6, { texture: HAZARD });
>>>>>>> REPLACE

<<<<<<< SEARCH
  gbox(0.9, 0.04, 0.6, HAZARD, 4.4, 0, 0.78, { texture: HAZARD });
=======
  gbox(0.9, 0.04, 0.6, "#ffffff", 4.4, 0, 0.78, { texture: HAZARD });
>>>>>>> REPLACE