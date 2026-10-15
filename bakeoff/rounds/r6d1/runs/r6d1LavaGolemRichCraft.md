1. **Head reads better.** The face block was dark stone on a dark visor, so the head was a black slab. I give the face block its own lighter basalt tone (`FACE`) and enlarge the visor and the glowing eyes. The eyes should now be the clear focal point in the close-up, with a visible stone brow and cheeks around them.
2. **Pauldrons stop burying the head.** The top tier of each shoulder stack is lower and thinner, and its spikes and flames are lowered with it. The three-quarter view should now show the head and horns above the shoulders.
3. **Halo and back are sounder.** The halo moves up to sit behind the head as a nimbus. Its connecting rod is shorter and now runs from the top of the back slab, so it no longer crosses the back emblem. The back view should show the emblem clearly with the halo ringing the head.
4. **Pillars no longer hide the legs.** The three lava pillars sit nearer the stage edge and are shorter. They were blocking the back and side views of the legs, and the base should read as a tighter frame.

<<<<<<< SEARCH
  const OBS = cel("#2a2540", "#15122a");
=======
  const OBS = cel("#2a2540", "#15122a");
  const FACE = cel("#7a7396", "#4d4668");
>>>>>>> REPLACE
<<<<<<< SEARCH
    [-1.2, -0.8, 0.75],
    [1.25, -0.75, 0.5],
    [0.5, -1.3, 0.9],
=======
    [-1.3, -0.5, 0.6],
    [1.3, -0.55, 0.45],
    [0.8, -1.15, 0.55],
>>>>>>> REPLACE
<<<<<<< SEARCH
  const HC = [0, 2.55, -0.9];
=======
  const HC = [0, 2.85, -0.9];
>>>>>>> REPLACE
<<<<<<< SEARCH
  b.rod([0, 2.2, -0.58], [0, 1.94, -0.88], 0.04, GOLD, { bone: spine3 });
=======
  b.rod([0, 2.46, -0.58], [0, 2.26, -0.88], 0.04, GOLD, { bone: spine3 });
>>>>>>> REPLACE
<<<<<<< SEARCH
  blk(head, [0, 2.76, 0.3], [0.62, 0.38, 0.56], [0, 0, 0], BASALT);
  blk(head, [0, 2.76, 0.585], [0.5, 0.17, 0.04], [0, 0, 0], OBS);
=======
  blk(head, [0, 2.76, 0.3], [0.62, 0.38, 0.56], [0, 0, 0], FACE);
  blk(head, [0, 2.77, 0.585], [0.58, 0.22, 0.04], [0, 0, 0], OBS);
>>>>>>> REPLACE
<<<<<<< SEARCH
    lit(s > 0 ? EYE_A : EYE_B, 0.2, 0.1, head, [s * 0.17, 2.77, 0.609], [0, 0, 1], [-s * 0.35, 1, 0], 1.5);
=======
    lit(s > 0 ? EYE_A : EYE_B, 0.25, 0.125, head, [s * 0.15, 2.77, 0.609], [0, 0, 1], [-s * 0.35, 1, 0], 1.6);
>>>>>>> REPLACE
<<<<<<< SEARCH
      [0.54, 0.14, 0.62, 2.5, 0.95, 20],
      [0.4, 0.14, 0.48, 2.64, 0.99, 26],
=======
      [0.54, 0.13, 0.62, 2.46, 0.95, 20],
      [0.4, 0.11, 0.48, 2.56, 0.99, 26],
>>>>>>> REPLACE
<<<<<<< SEARCH
      b.spike([s * 1.0, 2.7, z], [s * 0.35, 1, 0], 0.26, 0.055, { bone: sh, color: OBS, sides: 6 }),
=======
      b.spike([s * 1.0, 2.62, z], [s * 0.35, 1, 0], 0.26, 0.055, { bone: sh, color: OBS, sides: 6 }),
>>>>>>> REPLACE
<<<<<<< SEARCH
    flames(sh, [[s * 0.98, 2.74, -0.05], [s * 0.98, 2.74, 0.13]], [0.12, 0.3], [0, 0, -1], 25, 20);
=======
    flames(sh, [[s * 0.98, 2.66, -0.05], [s * 0.98, 2.66, 0.13]], [0.12, 0.3], [0, 0, -1], 25, 20);
>>>>>>> REPLACE