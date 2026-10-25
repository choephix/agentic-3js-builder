The cause: I passed the SVG texture as the `color` argument in several `P(...)` calls (the hazard stripes), so `part()` received a Texture instead of a colour string. The texture belongs in the options as `texture:`, which is already set on those calls.

Every `P(..., HAZARD, ...)` call sets `texture: HAZARD` in its options, so the `HAZARD` colour argument is the only thing to change. I'm replacing each with `"#ffffff"`.

<<<<<<< SEARCH
    P(box(0.03, 0.12, 3.0), HAZARD, [s * 1.11, 0.6, -0.2], { texture: HAZARD });
=======
    P(box(0.03, 0.12, 3.0), "#ffffff", [s * 1.11, 0.6, -0.2], { texture: HAZARD });
>>>>>>> REPLACE

<<<<<<< SEARCH
  P(box(1.0, 0.1, 0.04), HAZARD, [0, 0.8, 3.61], { texture: HAZARD });
=======
  P(box(1.0, 0.1, 0.04), "#ffffff", [0, 0.8, 3.61], { texture: HAZARD });
>>>>>>> REPLACE

<<<<<<< SEARCH
  P(box(0.72, 0.04, 0.62), HAZARD, [-0.3, 1.7, -0.2], { texture: HAZARD });
=======
  P(box(0.72, 0.04, 0.62), "#ffffff", [-0.3, 1.7, -0.2], { texture: HAZARD });
>>>>>>> REPLACE