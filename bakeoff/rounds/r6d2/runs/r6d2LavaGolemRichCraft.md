1. **Head lost between the shoulders.** The pauldron stacks rise higher than the jaw and crowd the head in the front and three-quarter views. I'm lowering and slimming them, moving their spikes and flames down with them, and lowering the trapezius blocks. The next render should show the whole face above the shoulder line, with the horns and flames framing it more clearly.
2. **Face read.** The two eye glyphs touch at the centre of the visor. I'm shrinking them slightly and spacing them out. I'm also adding gold-ringed cheek tusks on each side so the head has a chunkier, more characterful outline. Expect two clearly separate glowing eyes and tusks pointing out and forward.
3. **Hands look weak.** The fingers are thin sticks under big fist blocks. I'm thickening the fingers and thumbs so the golem has heavy, readable fists.

## Edits

<<<<<<< SEARCH
      [0.66, 0.16, 0.74, 2.34, 0.9, 14],
      [0.54, 0.13, 0.62, 2.46, 0.95, 20],
      [0.4, 0.11, 0.48, 2.56, 0.99, 26],
=======
      [0.6, 0.15, 0.68, 2.25, 0.9, 14],
      [0.48, 0.12, 0.56, 2.35, 0.95, 20],
      [0.36, 0.1, 0.42, 2.43, 0.99, 26],
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.spike([s * 1.0, 2.62, z], [s * 0.35, 1, 0], 0.26, 0.055, { bone: sh, color: OBS, sides: 6 }),
=======
      b.spike([s * 1.0, 2.5, z], [s * 0.35, 1, 0], 0.26, 0.055, { bone: sh, color: OBS, sides: 6 }),
>>>>>>> REPLACE

<<<<<<< SEARCH
    flames(sh, [[s * 0.98, 2.66, -0.05], [s * 0.98, 2.66, 0.13]], [0.12, 0.3], [0, 0, -1], 25, 20);
=======
    flames(sh, [[s * 0.98, 2.54, -0.05], [s * 0.98, 2.54, 0.13]], [0.12, 0.3], [0, 0, -1], 25, 20);
>>>>>>> REPLACE

<<<<<<< SEARCH
    blk(spine3, [s * 0.42, 2.4, -0.02], [0.46, 0.14, 0.52], [0, 0, -s * 22], BASALT);
    blk(spine3, [s * 0.42, 2.32, -0.02], [0.5, 0.03, 0.56], [0, 0, -s * 22], GOLD);
=======
    blk(spine3, [s * 0.42, 2.34, -0.02], [0.46, 0.14, 0.52], [0, 0, -s * 22], BASALT);
    blk(spine3, [s * 0.42, 2.26, -0.02], [0.5, 0.03, 0.56], [0, 0, -s * 22], GOLD);
>>>>>>> REPLACE

<<<<<<< SEARCH
    lit(s > 0 ? EYE_A : EYE_B, 0.25, 0.125, head, [s * 0.15, 2.77, 0.609], [0, 0, 1], [-s * 0.35, 1, 0], 1.6);
=======
    lit(s > 0 ? EYE_A : EYE_B, 0.24, 0.12, head, [s * 0.16, 2.77, 0.609], [0, 0, 1], [-s * 0.35, 1, 0], 1.6);
    // cheek tusks
    b.spike([s * 0.36, 2.64, 0.5], [s * 0.45, -0.1, 1], 0.24, 0.065, { bone: head, color: TEETH, sides: 6 });
    b.part(new THREE.TorusGeometry(0.07, 0.022, 4, 6), GOLD, {
      bone: head,
      at: [s * 0.37, 2.645, 0.53],
      dir: [s * 0.45, -0.1, 1],
      axis: "z",
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.sweep(fc, [0.062, 0.045], { color: OBS, section: { ngon: 6 } });
=======
      b.sweep(fc, [0.08, 0.055], { color: OBS, section: { ngon: 6 } });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(tc, [0.065, 0.045], { color: OBS, section: { ngon: 6 } });
=======
    b.sweep(tc, [0.085, 0.055], { color: OBS, section: { ngon: 6 } });
>>>>>>> REPLACE