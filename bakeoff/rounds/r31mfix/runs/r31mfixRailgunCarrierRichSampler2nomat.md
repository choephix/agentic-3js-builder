The `cy` helper takes `(r, h, col, at, bone, axis, sides, o)`, but the stabiliser leg band call passes `BAND` (a texture) as the colour and then also sets `texture: BAND`. `BAND` is the svg texture, so `part()` rejects it as a colour. The fix is to pass a white colour string for the colour and leave the texture in the options.

<<<<<<< SEARCH
    cy(0.205, 0.22, BAND, [s * 2.0, 1.28, z], leg, "y", 10, { texture: BAND });
=======
    cy(0.205, 0.22, "#ffffff", [s * 2.0, 1.28, z], leg, "y", 10, { texture: BAND });
>>>>>>> REPLACE