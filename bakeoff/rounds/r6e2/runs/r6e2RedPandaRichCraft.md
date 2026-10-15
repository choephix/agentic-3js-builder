1. **Identity and form.** In the head close-up the red panda cues are present but small. The tear marks are not visible at all. The head is too small for a chibi Genshin proportion, and the scarf octagon in the front view swallows it. The ringed tail reads, but it is thin and rises like a scorpion stinger, and it stands behind the head as a tall pillar. I'm enlarging the head with one scale constant (`HS = 1.2`) and rebuilding the tail path lower, with a lateral S-curve and a thicker, bushier profile. Then the three-quarter and front views show a big-headed panda with a fat ringed tail curling up beside the body, and the front view shows the whole face. The enlarged head and larger eye decals also give the tear marks and brow spots more room to read.
2. **Soundness.** The cheek ruffs point straight out sideways like horns in the front view. I'm re-angling them back and down, and widening them, so they read as ruffs. Everything else stays seated.
3. **Composition.** A leaf mote sits in front of the chin in the front view. I'm moving the motes and leaves to the sides and rear arcs, so the face stays clear. The tail now ends inside the platform.
4. **Finish.** The face decals scale with the head. The atmosphere (motes, runes, mushrooms) is unchanged.

## Edits

<<<<<<< SEARCH
  const H = (x: number, y: number, z: number): T3 => [HC[0] + x, HC[1] + y, HC[2] + z];
=======
  const HS = 1.2; // head scale
  const H = (x: number, y: number, z: number): T3 => [HC[0] + x * HS, HC[1] + y * HS, HC[2] + z * HS];
>>>>>>> REPLACE

<<<<<<< SEARCH
    [0, 0.62, -0.26],
    [0.02, 0.64, -0.45],
    [0.1, 0.72, -0.62],
    [0.2, 0.88, -0.7],
    [0.27, 1.04, -0.64],
    [0.28, 1.16, -0.52],
  ];
=======
    [0, 0.62, -0.26],
    [0, 0.65, -0.42],
    [0.1, 0.7, -0.56],
    [0.26, 0.73, -0.64],
    [0.38, 0.83, -0.6],
    [0.43, 0.97, -0.48],
  ];
>>>>>>> REPLACE

<<<<<<< SEARCH
    (t) => 0.045 + 0.055 * Math.sin(Math.PI * Math.pow(t, 0.7)) - 0.02 * t * t * t,
=======
    (t) => 0.06 + 0.075 * Math.sin(Math.PI * Math.pow(t, 0.7)) - 0.03 * t * t * t,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const tailHits = b.surface(tail).scatter(80, { rng: R, minDist: 0.04, filter: (h) => h.at.y > 0.62 || h.n.y > 0 });
=======
  const tailHits = b.surface(tail).scatter(110, { rng: R, minDist: 0.04, filter: (h) => h.at.y > 0.62 || h.n.y > 0 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  ), { bone: head, at: HC, scale: [0.115, 0.095, 0.1] });
=======
  ), { bone: head, at: HC, scale: [0.115 * HS, 0.095 * HS, 0.1 * HS] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const muzzle = b.part(new THREE.SphereGeometry(1, 10, 8), MUZZLE_P, { bone: head, at: H(0, -0.035, 0.085), scale: [0.058, 0.042, 0.052] });
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE_P, { bone: head, at: H(0, -0.014, 0.133), scale: [0.021, 0.015, 0.015] });
  b.part(new THREE.SphereGeometry(1, 8, 6), MUZZLE_P, { bone: jaw, at: H(0, -0.085, 0.085), scale: [0.04, 0.02, 0.045] });
  b.decal(b.surface(muzzle), MOUTH, { at: H(0, -0.05, 0.128), dir: [0, 0, 1], size: [0.04, 0.022] });
=======
  const muzzle = b.part(new THREE.SphereGeometry(1, 10, 8), MUZZLE_P, { bone: head, at: H(0, -0.035, 0.085), scale: [0.058 * HS, 0.042 * HS, 0.052 * HS] });
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE_P, { bone: head, at: H(0, -0.014, 0.133), scale: [0.021 * HS, 0.015 * HS, 0.015 * HS] });
  b.part(new THREE.SphereGeometry(1, 8, 6), MUZZLE_P, { bone: jaw, at: H(0, -0.085, 0.085), scale: [0.04 * HS, 0.02 * HS, 0.045 * HS] });
  b.decal(b.surface(muzzle), MOUTH, { at: H(0, -0.05, 0.128), dir: [0, 0, 1], size: [0.04 * HS, 0.022 * HS] });
>>>>>>> REPLACE

<<<<<<< SEARCH
    if (eye) b.decal(skin, EYE, { at: eye, size: [0.052, 0.07], mirror: s > 0 });
    const tear = skin.around(HC).at(s * 27, -26);
    if (tear) b.decal(skin, TEAR, { at: tear, size: [0.022, 0.052], roll: s * 8 });
    const brow = skin.around(HC).at(s * 36, 31);
    if (brow) b.decal(skin, BROW, { at: brow, size: [0.042, 0.025], roll: -s * 22 });
=======
    if (eye) b.decal(skin, EYE, { at: eye, size: [0.052 * HS, 0.07 * HS], mirror: s > 0 });
    const tear = skin.around(HC).at(s * 30, -30);
    if (tear) b.decal(skin, TEAR, { at: tear, size: [0.026 * HS, 0.06 * HS], roll: s * 8 });
    const brow = skin.around(HC).at(s * 36, 31);
    if (brow) b.decal(skin, BROW, { at: brow, size: [0.042 * HS, 0.025 * HS], roll: -s * 22 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const EAR: Outline = [[-0.05, 0], [0.05, 0], [0.058, 0.04], [0, 0.092], [-0.058, 0.04]];
=======
  const EAR: Outline = scaled([[-0.05, 0], [0.05, 0], [0.058, 0.04], [0, 0.092], [-0.058, 0.04]], HS);
>>>>>>> REPLACE

<<<<<<< SEARCH
      { at: H(s * 0.088, -0.015, 0.02), dir: [s, 0.12, 0.12], L: 0.085 },
      { at: H(s * 0.082, -0.045, 0.0), dir: [s, -0.2, -0.18], L: 0.09 },
      { at: H(s * 0.07, -0.07, 0.0), dir: [s, -0.5, -0.3], L: 0.075 },
=======
      { at: H(s * 0.088, -0.015, 0.02), dir: [s * 0.8, 0.05, -0.5], L: 0.08 },
      { at: H(s * 0.082, -0.045, 0.0), dir: [s * 0.7, -0.3, -0.5], L: 0.085 },
      { at: H(s * 0.07, -0.07, 0.0), dir: [s * 0.5, -0.6, -0.4], L: 0.07 },
>>>>>>> REPLACE

<<<<<<< SEARCH
    for (const sp of specs) blade(leafOutline(sp.L, 0.03), sp.at, sp.dir, [0, 1, 0], 0.014, CREAM_P, head);
=======
    for (const sp of specs) blade(leafOutline(sp.L, 0.038), sp.at, sp.dir, [0, 1, 0], 0.014, CREAM_P, head);
>>>>>>> REPLACE

<<<<<<< SEARCH
    const a = (R() - 0.5) * 4.4;
=======
    const a = (i % 2 ? 1 : -1) * (0.95 + R() * 1.7);
>>>>>>> REPLACE