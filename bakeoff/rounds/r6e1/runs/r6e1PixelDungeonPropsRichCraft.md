**Brief check.** The cues for this dungeon vignette are the open treasure chest with glowing gold, the wall torches with flames, and the barrels and bones. The chest and barrels read clearly. The flames are too small and are lost in a coarse speckle halo.

1. **Identity and form: torches.** Each flame is a small red blob under a large, coarse halo of orange dots. I'm enlarging the flame slabs (cell 0.02 to 0.03 m) so the red, orange and yellow cores read as a flame. I'm also rebuilding the halo as a finer 32 px dither at a smaller size. In the front and three-quarter views, each torch will show a bigger, layered flame with a tighter glow.
2. **Identity and form: bones.** In the front view the ribcage curves up behind the skull and reads as ram horns. I'm moving the skull and the two crossed femurs to the left floor edge, clear of the ribcage. In the front and top views the skull will read as a skull beside a separate ribcage.
3. **Soundness: wall top.** The hanging chain starts at FY+1.22, above the right wall top at FY+1.0, so it sticks up like a floating hammer shape in the front, back and three-quarter views. I'm rehanging it from a bracket on the wall face at FY+0.93. A loose rubble stone also floats 5 cm above the broken wall top, and I'm seating it on the wall. The back view will show a clean wall top with no stray pieces.
4. **Composition and finish.** The set is otherwise well framed, so I'm leaving the rest as it is.

## Edits

<<<<<<< SEARCH
  box(0.28, 0.1, 0.16, STONEP, [0.95, FY + 1.05 + 0.05 - 0.0, -0.9], { rotation: [0, 8, 0] });
=======
  box(0.28, 0.1, 0.16, STONEP, [0.95, FY + 1.05, -0.9], { rotation: [0, 8, 0] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(0.07, 0.04, 0.04, IRONP, [0.95, FY + 1.22, -0.78]);
  for (let i = 0; i < 9; i++) {
    const flat = i % 2 === 0;
    box(flat ? 0.034 : 0.012, 0.055, flat ? 0.012 : 0.034, IRONP, [0.95, FY + 1.17 - i * 0.048, -0.775]);
  }
  box(0.08, 0.05, 0.05, IRONP, [0.95, FY + 1.17 - 9 * 0.048 - 0.02, -0.775]);
=======
  box(0.07, 0.04, 0.04, IRONP, [0.95, FY + 0.93, -0.78]);
  for (let i = 0; i < 9; i++) {
    const flat = i % 2 === 0;
    box(flat ? 0.034 : 0.012, 0.055, flat ? 0.012 : 0.034, IRONP, [0.95, FY + 0.88 - i * 0.048, -0.775]);
  }
  box(0.08, 0.05, 0.05, IRONP, [0.95, FY + 0.88 - 9 * 0.048 - 0.02, -0.775]);
>>>>>>> REPLACE

<<<<<<< SEARCH
const haloTex = () =>
  pixelTexture(16, 16, (g) => {
    g.fill((x, y) => {
      const v = 1 - Math.hypot(x - 7.5, y - 7.5) / 8;
=======
const haloTex = () =>
  pixelTexture(32, 32, (g) => {
    g.fill((x, y) => {
      const v = 1 - Math.hypot(x - 15.5, y - 15.5) / 16;
>>>>>>> REPLACE

<<<<<<< SEARCH
  const FLAME_O = stepped([[-2, 2], [-3, 3], [-3, 3], [-3, 2], [-2, 3], [-2, 2], [-1, 2], [-1, 1], [0, 1]], 0.02, { rows: true });
  const FLAME_M = stepped([[-1.5, 1.5], [-2, 2], [-2, 1.5], [-1.5, 2], [-1, 1.5], [-0.5, 1]], 0.02, { rows: true });
  const FLAME_I = stepped([[-1, 1], [-1, 1], [-1, 0.5], [-0.5, 1]], 0.02, { rows: true });
=======
  const FLAME_O = stepped([[-2, 2], [-3, 3], [-3, 3], [-3, 2], [-2, 3], [-2, 2], [-1, 2], [-1, 1], [0, 1]], 0.03, { rows: true });
  const FLAME_M = stepped([[-1.5, 1.5], [-2, 2], [-2, 1.5], [-1.5, 2], [-1, 1.5], [-0.5, 1]], 0.03, { rows: true });
  const FLAME_I = stepped([[-1, 1], [-1, 1], [-1, 0.5], [-0.5, 1]], 0.03, { rows: true });
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(plane(0.55, 0.55, "#ffffff", [x, fb.y + 0.1, -0.79], { texture: HALO }), 0.8);
=======
    glow(plane(0.5, 0.5, "#ffffff", [x, fb.y + 0.12, -0.79], { texture: HALO }), 0.8);
>>>>>>> REPLACE

<<<<<<< SEARCH
  skull(-0.72, 0.8, 18);
=======
  skull(-1.18, 0.8, 25);
>>>>>>> REPLACE

<<<<<<< SEARCH
  femur(-1.12, 0.68, 30, 0.34);
  femur(-1.1, 0.7, -35, 0.32, 0.034);
=======
  femur(-1.0, 0.42, 30, 0.34);
  femur(-1.0, 0.44, -35, 0.32, 0.034);
>>>>>>> REPLACE