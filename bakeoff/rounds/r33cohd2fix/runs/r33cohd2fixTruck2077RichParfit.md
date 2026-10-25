Cause: in `cargoBed`, the `container` helper calls `put(geo, STRIPE, ...)`, passing an SVG texture as the `color` argument, but `color` only takes a colour string or a paint (the texture belongs in the `texture` option). The `BAR` and `PANEL` calls are similar. `BAR` has the same problem in the next line, and `PANEL` passes a `"#ffffff"` colour correctly but still follows the broken one.

<<<<<<< SEARCH
      put(box(0.02, 0.18, 0.6), STRIPE, [s * 1.105, y - h * 0.3, z], body, { texture: STRIPE, color: "#ffffff" });
=======
      put(box(0.02, 0.18, 0.6), "#ffffff", [s * 1.105, y - h * 0.3, z], body, { texture: STRIPE });
>>>>>>> REPLACE
<<<<<<< SEARCH
    put(box(0.5, 0.3, 0.02), BAR, [0.5 * (id ? 1 : -1), y + 0.1, z + 0.96], body, { texture: BAR, color: "#ffffff" });
=======
    put(box(0.5, 0.3, 0.02), "#ffffff", [0.5 * (id ? 1 : -1), y + 0.1, z + 0.96], body, { texture: BAR });
>>>>>>> REPLACE