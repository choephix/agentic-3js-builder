The cause: `HAZARD && WEAR` evaluates to `WEAR` (fine), but `HAZARD as any` is passed as the colour in two places, and a Texture is not a colour string or paint. The line at 91 is `bx(0.08, 0.06, 0.8, HAZARD as any, ...)`, and the rear bar and ram bumper have the same problem. The colour must be a string, with the texture passed through `texture:`.

<<<<<<< SEARCH
    bx(0.12, 0.25, 1.0, HAZARD && WEAR, s * 1.3, 1.1, -3.2);
    bx(0.08, 0.06, 0.8, HAZARD as any, s * 1.35, 0.8, -1.4, { texture: HAZARD });
=======
    bx(0.12, 0.25, 1.0, WEAR, s * 1.3, 1.1, -3.2);
    bx(0.08, 0.06, 0.8, "#ffffff", s * 1.35, 0.8, -1.4, { texture: HAZARD });
>>>>>>> REPLACE
<<<<<<< SEARCH
  bx(2.6, 0.18, 0.18, HAZARD as any, 0, 1.4, -3.78, { texture: HAZARD });
=======
  bx(2.6, 0.18, 0.18, "#ffffff", 0, 1.4, -3.78, { texture: HAZARD });
>>>>>>> REPLACE