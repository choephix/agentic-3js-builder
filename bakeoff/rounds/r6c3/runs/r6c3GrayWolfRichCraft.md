1. **Mane and back spikes.** The mane blades stand upright and edge-on, so the wolf reads as a porcupine. They now lie flat on the back, swept backwards, shingled and shorter. The neck ruff blades are shorter too.
2. **Lower jaw.** It hangs as a separate bar under the head. I raised it, thinned it and shifted the lower fang so it seats against the upper jaw.
3. **Eyes.** They are small for an "alert" gaze, so I enlarged the decals.
4. **Pine tree.** It blocks the side view of the hindquarters. I moved it behind the wolf, made it a little smaller, and moved a rock that would have clashed with it.
5. **Banner.** The pole sits right in front of the muzzle in the three-quarter view. I moved it to the front-left edge of the plinth, away from the face. The flag now hangs toward the wolf, and the pendant tassel is attached to the banner's bottom edge instead of floating below it.

<<<<<<< SEARCH
    tuft(h.moved([0, -0.025, 0]), V(0, 0.55, -1), V(1, 0, 0), L * 1.05, 0.14, maneGrey);
    for (const [s] of SIDES)
      tuft(h.moved({ left: s * 0.06, down: 0.035 }), V(s * 0.45, 0.12, -1), h.n, L * 0.85, 0.1, maneGrey);
=======
    tuft(h.moved([0, -0.02, 0]), V(0, 0.3, -1), V(0, 1, 0), L * 0.8, 0.13, i % 2 ? maneGrey : maneCream, undefined, 0.01);
    for (const [s] of SIDES)
      tuft(h.moved({ left: s * 0.06, down: 0.035 }), V(s * 0.5, 0.1, -1), h.n, L * 0.7, 0.1, maneGrey);
>>>>>>> REPLACE
<<<<<<< SEARCH
    tuft(it, up, out, 0.2, 0.11, front ? maneCream : maneGrey);
=======
    tuft(it, up, out, 0.15, 0.1, front ? maneCream : maneGrey);
>>>>>>> REPLACE
<<<<<<< SEARCH
    tuft(it, up, out, 0.15, 0.08, it.t > 0.3 && it.t < 0.7 ? maneCream : maneGrey);
=======
    tuft(it, up, out, 0.11, 0.08, it.t > 0.3 && it.t < 0.7 ? maneCream : maneGrey);
>>>>>>> REPLACE
<<<<<<< SEARCH
  b.sweep(catmull([P(0, 1.05, 0.84), P(0, 1.035, 1.03), P(0, 1.04, 1.2)]), (t) => [0.056 - 0.026 * t, 0.04 - 0.012 * t], {
=======
  b.sweep(catmull([P(0, 1.066, 0.84), P(0, 1.052, 1.03), P(0, 1.056, 1.2)]), (t) => [0.05 - 0.024 * t, 0.032 - 0.01 * t], {
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.spike(P(s * 0.02, 1.052, 1.185), [0, 1, 0.1], 0.026, 0.008, BONE, { bone: jaw, section: { ngon: 5 } });
=======
    b.spike(P(s * 0.02, 1.07, 1.185), [0, 1, 0.1], 0.026, 0.008, BONE, { bone: jaw, section: { ngon: 5 } });
>>>>>>> REPLACE
<<<<<<< SEARCH
size: [0.075, 0.047], mirror: s > 0, segments: 8 }),
=======
size: [0.092, 0.058], mirror: s > 0, segments: 8 }),
>>>>>>> REPLACE
<<<<<<< SEARCH
    [-0.4, -0.97, 0.13, 0.08, 0.11, 10],
=======
    [0.2, -1.04, 0.13, 0.08, 0.11, 10],
>>>>>>> REPLACE
<<<<<<< SEARCH
  const PX = 0.92;
  const PZ = -0.5;
=======
  const PX = -0.55;
  const PZ = -0.95;
>>>>>>> REPLACE
<<<<<<< SEARCH
    const r = 0.3 - 0.07 * k;
=======
    const r = 0.25 - 0.06 * k;
>>>>>>> REPLACE
<<<<<<< SEARCH
  const BX = -0.75;
  const BZ = 0.85;
  b.rod([BX, G, BZ], [BX, G + 1.05, BZ], 0.022, WOODP, { bone: baseJ });
  b.spike([BX, G + 1.05, BZ], [0, 1, 0], 0.12, 0.03, IRON, { bone: baseJ });
  b.rod([BX + 0.02, G + 0.93, BZ], [BX - 0.38, G + 0.93, BZ], 0.014, WOODP, { bone: baseJ });
  bp(new THREE.SphereGeometry(0.02, 6, 4), IRON, { at: [BX - 0.39, G + 0.93, BZ] });
  bp(new THREE.PlaneGeometry(0.3, 0.48), "#ffffff", { at: [BX - 0.2, G + 0.67, BZ + 0.004], dir: [0, 0, 1], axis: "z", texture: BANNER });
  bp(new THREE.PlaneGeometry(0.3, 0.48), "#ffffff", { at: [BX - 0.2, G + 0.67, BZ - 0.004], dir: [0, 0, -1], axis: "z", texture: BANNER });
  b.spike([BX - 0.2, G + 0.4, BZ], [0, -1, 0], 0.07, 0.014, "#d8ecff", { bone: baseJ });
=======
  const BX = -1.0;
  const BZ = 0.5;
  b.rod([BX, G, BZ], [BX, G + 1.05, BZ], 0.022, WOODP, { bone: baseJ });
  b.spike([BX, G + 1.05, BZ], [0, 1, 0], 0.12, 0.03, IRON, { bone: baseJ });
  b.rod([BX - 0.02, G + 0.93, BZ], [BX + 0.38, G + 0.93, BZ], 0.014, WOODP, { bone: baseJ });
  bp(new THREE.SphereGeometry(0.02, 6, 4), IRON, { at: [BX + 0.39, G + 0.93, BZ] });
  bp(new THREE.PlaneGeometry(0.3, 0.48), "#ffffff", { at: [BX + 0.2, G + 0.67, BZ + 0.004], dir: [0, 0, 1], axis: "z", texture: BANNER });
  bp(new THREE.PlaneGeometry(0.3, 0.48), "#ffffff", { at: [BX + 0.2, G + 0.67, BZ - 0.004], dir: [0, 0, -1], axis: "z", texture: BANNER });
  b.spike([BX + 0.2, G + 0.44, BZ], [0, -1, 0], 0.07, 0.014, "#d8ecff", { bone: baseJ });
>>>>>>> REPLACE