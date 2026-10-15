1. **Face reads weakly.** The eyes are tiny under a heavy brim. I'm enlarging the eye decals and lowering them slightly so the blue irises read from the front.
2. **Helmet sits low and flares too wide.** It reads as a sombrero and eats the forehead and brow. I'm raising it, narrowing the brim, and matching the brass rim ring to the new brim.
3. **Red plume looks like a broken bent stick.** It is a thin, kinked quadratic curve. I'm rebuilding it as a thicker, smooth arched plume.
4. **Knee guards are oversized discs.** They cover the tabard hem and the legs. I'm shrinking them so the boots and tabard read.
5. **Powder keg has no glow.** I'm adding a glowing fuse ember so the lantern isn't the only light.

<<<<<<< SEARCH
      size: [0.062, 0.044],
=======
      size: [0.088, 0.062],
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: P(s * 0.08, 1.283, 0.2),
=======
      at: P(s * 0.078, 1.277, 0.2),
>>>>>>> REPLACE

<<<<<<< SEARCH
    [0.22, 0],
    [0.255, 0.015],
    [0.235, 0.03],
    [0.17, 0.04],
    [0.167, 0.09],
=======
    [0.2, 0],
    [0.228, 0.015],
    [0.21, 0.03],
    [0.168, 0.04],
    [0.165, 0.09],
>>>>>>> REPLACE

<<<<<<< SEARCH
  const HY = 1.355;
=======
  const HY = 1.38;
>>>>>>> REPLACE

<<<<<<< SEARCH
  torus(BRASS, P(0, HY + 0.015, HZ), 0.25, 0.01, [0, 1, 0], head, 14);
=======
  torus(BRASS, P(0, HY + 0.015, HZ), 0.225, 0.01, [0, 1, 0], head, 14);
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.sweep(bezier(P(0, HY + 0.17, HZ), P(0, HY + 0.33, HZ - 0.1), P(0, HY + 0.24, HZ - 0.27)), [0.03, 0.004], {
=======
  b.sweep(catmull([P(0, HY + 0.16, HZ), P(0, HY + 0.27, HZ - 0.04), P(0, HY + 0.3, HZ - 0.14), P(0, HY + 0.24, HZ - 0.27)]), [0.042, 0.005], {
>>>>>>> REPLACE

<<<<<<< SEARCH
    blob(STEEL, kp, [0.075, 0.07, 0.04], knee, { seg: 7 });
    torus(BRASS, kp, 0.07, 0.008, [0, 0.1, 1], knee, 10);
=======
    blob(STEEL, kp, [0.052, 0.05, 0.032], knee, { seg: 7 });
    torus(BRASS, kp, 0.05, 0.007, [0, 0.1, 1], knee, 10);
>>>>>>> REPLACE

<<<<<<< SEARCH
  // spare cannonballs
=======
  // glowing fuse ember on the keg
  glow(blob("#ff7a1a", [KX + 0.1, Y0 + 0.285, KZ + 0.06], 0.014, hips, { seg: 6 }), 2.2);
  rod([KX + 0.09, Y0 + 0.28, KZ + 0.05], [KX + 0.04, Y0 + 0.26, KZ + 0.0], 0.005, LEATHER_D, hips);
  // spare cannonballs
>>>>>>> REPLACE