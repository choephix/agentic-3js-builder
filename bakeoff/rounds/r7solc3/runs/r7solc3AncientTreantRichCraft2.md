1. **Give him more Warcraft weight.** Broaden the trunk, thicken the forearms and shins, and spread the root feet. The current long, tapered torso and slim wrists make him feel lighter than an ancient guardian.
2. **Break up the broccoli canopy.** Replace round foliage balls with irregular, layered crowns, expose more forked branches, and deepen the foliage in side view.
3. **Carve a more organic face.** Keep the successful emerald eyes, but replace the rectangular mouth and straight beard fringe with a crooked mouth, uneven teeth, and curling, forked beard roots.
4. **Make the grove grow through him.** Add substantial shoulder moss, hanging beard moss, and restrained emerald fissures leading toward the heart—not more scattered decoration.

<<<<<<< SEARCH
          [s * 0.78 + i * 0.34, 0.2, 1.02 - Math.abs(i) * 0.08],
=======
          [s * 0.8 + i * 0.4, 0.2, 1.12 - Math.abs(i) * 0.12],
>>>>>>> REPLACE

<<<<<<< SEARCH
    const foliageMass = ellipsoid(
      [x, y, z],
      [radius, radius * 0.77 * height, radius * 0.85],
      colors[0],
      bone,
      1,
    );
    ellipsoid(
      [x - radius * 0.32, y + radius * 0.29 * height, z + radius * 0.17],
      [radius * 0.76, radius * 0.65 * height, radius * 0.67],
      colors[1],
      bone,
      1,
    );
    ellipsoid(
      [x + radius * 0.41, y + radius * 0.19 * height, z - radius * 0.14],
      [radius * 0.62, radius * 0.54 * height, radius * 0.6],
      colors[2],
      bone,
      1,
    );
    ellipsoid(
      [x + radius * 0.08, y + radius * 0.6 * height, z - radius * 0.08],
      [radius * 0.46, radius * 0.48 * height, radius * 0.47],
      colors[1],
      bone,
    );
=======
    const foliageMass = ellipsoid(
      [x, y - radius * 0.08, z],
      [radius * 1.08, radius * 0.48 * height, radius * 1.12],
      colors[0],
      bone,
      1,
    );
    ellipsoid(
      [x - radius * 0.43, y + radius * 0.19 * height, z + radius * 0.28],
      [radius * 0.73, radius * 0.43 * height, radius * 0.79],
      colors[1],
      bone,
      1,
    );
    ellipsoid(
      [x + radius * 0.49, y + radius * 0.29 * height, z - radius * 0.28],
      [radius * 0.67, radius * 0.35 * height, radius * 0.73],
      colors[2],
      bone,
      1,
    );
    ellipsoid(
      [x - radius * 0.05, y + radius * 0.49 * height, z + radius * 0.04],
      [radius * 0.48, radius * 0.34 * height, radius * 0.58],
      colors[1],
      bone,
    );

    // Visible crooked under-branches make each crown belong to a tree.
    const forkRoot = [x, y - radius * 0.68, z - radius * 0.07];
    for (const sign of [-1, 1]) {
      branch(
        [
          forkRoot,
          [x + sign * radius * 0.32, y - radius * 0.36, z],
          [x + sign * radius * 0.73, y - radius * 0.14, z + radius * 0.12],
          [x + sign * radius * 1.13, y + radius * 0.13, z + radius * 0.16],
        ],
        radius * 0.11,
        bone,
        sign > 0 ? paleWood : bark,
      );
    }
>>>>>>> REPLACE

<<<<<<< SEARCH
      size: [radius * 0.73, radius * 0.89],
      lean: 52,
=======
      size: [radius * 0.82, radius * 0.99],
      lean: 59,
>>>>>>> REPLACE

<<<<<<< SEARCH
      { at: [0, 1.34, 0.02], w: 1.2, h: 0.94 },
      { at: [0, 1.9, -0.035], w: 1.24, h: 1.13 },
      { at: [0, 2.55, -0.14], w: 1.82, h: 1.43 },
      { at: [0, 3.13, -0.17], w: 2.13, h: 1.48 },
      { at: [0, 3.47, -0.08], w: 1.33, h: 1.04 },
=======
      { at: [0, 1.34, -0.04], w: 1.34, h: 1.06 },
      { at: [0, 1.9, -0.115], w: 1.49, h: 1.29 },
      { at: [0, 2.55, -0.245], w: 1.94, h: 1.64 },
      { at: [0, 3.13, -0.28], w: 2.25, h: 1.7 },
      { at: [0, 3.47, -0.14], w: 1.4, h: 1.16 },
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(
    face.p([0, -0.315, 0.43]),
    [H * 0.71, H * 0.095, H * 0.18],
    C.seam,
    head,
  );
=======
  b.extrude(
    [
      [-0.39, 0.015], [-0.29, -0.018], [-0.15, -0.005],
      [-0.045, -0.028], [0.1, -0.012], [0.26, 0.008],
      [0.38, 0.045], [0.29, -0.075], [0.12, -0.095],
      [-0.08, -0.08], [-0.28, -0.073],
    ],
    {
      at: face.p([0, -0.275, 0.49]),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.075,
      bone: head,
      color: C.seam,
      name: "crookedMouthCavity",
    },
  );
  for (const s of [-1, 1]) {
    branch(
      [
        face.p([s * 0.06, -0.265, 0.525]),
        face.p([s * 0.18, -0.285, 0.53]),
        face.p([s * 0.3, -0.255, 0.505]),
        face.p([s * 0.41, -0.205, 0.43]),
      ],
      H * 0.035,
      head,
      paleWood,
    );
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
  // A few uneven wood teeth, not a regular yellow picket fence.
  for (const i of [-2, 0, 2]) {
    b.spike(
      face.p([i * 0.12, -0.355, 0.535]),
      [0, 1, 0],
      H * (i === 0 ? 0.055 : 0.085),
      H * 0.04,
      { bone: jaw, color: paleWood, sides: 4 },
    );
  }

  // Seven substantial root ribbons form a sculptural, readable beard.
  for (let i = -3; i <= 3; i++) {
    const x = i * 0.105;
    const length = 0.63 - Math.abs(i) * 0.082;
    branch(
      [
        face.p([x, -0.42, 0.32]),
        face.p([x * 1.25, -0.55, 0.43]),
        face.p([x * 1.22, -0.42 - length, 0.43]),
        face.p([x * 0.84, -0.49 - length, 0.33]),
      ],
      H * (0.089 - Math.abs(i) * 0.007),
      jaw,
      i % 2 === 0 ? paleWood : bark,
    );
  }
=======
  // Broken wooden teeth, deliberately unequal and recessed in the mouth.
  for (const tooth of [
    { x: -0.245, height: 0.067, width: 0.033 },
    { x: 0.055, height: 0.038, width: 0.026 },
    { x: 0.255, height: 0.082, width: 0.04 },
  ]) {
    b.spike(
      face.p([tooth.x, -0.355, 0.52]),
      [tooth.x * 0.4, 1, -0.1],
      H * tooth.height,
      H * tooth.width,
      { bone: jaw, color: paleWood, sides: 4 },
    );
  }

  // Crooked beard roots curl into unequal forks instead of a straight fringe.
  for (let i = -3; i <= 3; i++) {
    const x = i * 0.105;
    const sign = i < 0 ? -1 : 1;
    const length = 0.75 - Math.abs(i) * 0.105 + (i % 2 === 0 ? 0.065 : 0);
    const rootPoint = face.p([x, -0.4, 0.32]);
    const bendPoint = face.p([x * 1.35, -0.57, 0.46]);
    const forkPoint = face.p([x * 1.18, -0.34 - length, 0.47]);
    branch(
      [
        rootPoint,
        bendPoint,
        forkPoint,
        face.p([x * 0.72 - sign * 0.045, -0.47 - length, 0.39]),
        face.p([x * 0.62 - sign * 0.08, -0.44 - length, 0.32]),
      ],
      H * (0.1 - Math.abs(i) * 0.009),
      jaw,
      i % 2 === 0 ? paleWood : bark,
    );
    if (i % 2 !== 0) {
      branch(
        [
          forkPoint,
          face.p([x * 1.38 + sign * 0.035, -0.45 - length, 0.44]),
          face.p([x * 1.42 + sign * 0.07, -0.49 - length, 0.36]),
        ],
        H * 0.036,
        jaw,
        paleWood,
      );
    }
  }

  b.cards(
    [
      frame(face.p([-0.255, -0.57, 0.48]), [0, 1, 0]),
      frame(face.p([0.13, -0.72, 0.49]), [0, 1, 0]),
    ],
    hangingMoss,
    {
      size: [0.13, 0.39],
      lean: 180,
      flow: [0, 0, 1],
      bone: jaw,
      sink: 0,
      bend: 12,
    },
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
      (t) => [0.47 - t * 0.21, 0.41 - t * 0.16],
=======
      (t) => {
        const forearm = Math.exp(-Math.pow((t - 0.73) / 0.19, 2));
        return [
          0.31 + 0.19 * (1 - t) + 0.11 * forearm,
          0.28 + 0.14 * (1 - t) + 0.075 * forearm,
        ];
      },
>>>>>>> REPLACE

<<<<<<< SEARCH
      [s * 2.29, 2.44, 0.25],
      [0.375, 0.33, 0.31],
=======
      [s * 2.29, 2.44, 0.25],
      [0.405, 0.35, 0.345],
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(leg, [0.38, 0.31, 0.27], {
=======
    b.sweep(leg, [0.43, 0.355, 0.3], {
>>>>>>> REPLACE

<<<<<<< SEARCH
      [s * 0.65, 1.04, 0.1],
      [0.35, 0.33, 0.31],
=======
      [s * 0.65, 1.04, 0.1],
      [0.39, 0.35, 0.35],
>>>>>>> REPLACE

<<<<<<< SEARCH
      [s * 1.03, s > 0 ? 5.5 : 5.86, -0.4],
      s > 0 ? 0.66 : 0.59,
=======
      [s * 1.03, s > 0 ? 5.47 : 5.91, -0.46],
      s > 0 ? 0.62 : 0.58,
>>>>>>> REPLACE

<<<<<<< SEARCH
      [s * 1.76, s > 0 ? 5.27 : 5.52, -0.47],
      s > 0 ? 0.55 : 0.61,
=======
      [s * 1.85, s > 0 ? 5.18 : 5.53, -0.42],
      s > 0 ? 0.51 : 0.56,
>>>>>>> REPLACE

<<<<<<< SEARCH
      [s * 0.42, s > 0 ? 5.88 : 6.17, -0.46],
      s > 0 ? 0.52 : 0.48,
=======
      [s * 0.36, s > 0 ? 5.91 : 6.24, -0.42],
      s > 0 ? 0.47 : 0.44,
>>>>>>> REPLACE

<<<<<<< SEARCH
  leafCluster([0.02, 5.56, -0.95], 0.68, spine.tip!, false, 1.1);
  leafCluster([-0.72, 4.91, -1.03], 0.59, spine.tip!, false, 1.1);
  leafCluster([0.72, 5.07, -1.07], 0.62, spine.tip!, true, 1);
=======
  leafCluster([0.02, 5.44, -1.04], 0.55, spine.tip!, false, 1.1);
  leafCluster([-0.72, 4.77, -1.05], 0.52, spine.tip!, false, 1.1);
  leafCluster([0.79, 5.0, -1.12], 0.57, spine.tip!, true, 1);

  // Bare, forked oak tips interrupt the canopy's continuous green outline.
  for (const L of limbs) {
    const { s, crown, shoulderBough } = L;
    branch(
      [
        [s * 1.51, 5.22, -0.39],
        [s * 1.94, 5.47, -0.2],
        [s * 2.22, 5.83, -0.12],
        [s * 2.18, 6.03, -0.04],
      ],
      0.09,
      crown.joints[2],
      paleWood,
    );
    branch(
      [
        [s * 1.94, 5.47, -0.2],
        [s * 2.27, 5.52, -0.09],
        [s * 2.48, 5.7, 0.02],
      ],
      0.056,
      crown.joints[2],
    );
    branch(
      [
        [s * 1.67, 4.14, -0.48],
        [s * 2.11, 4.13, -0.27],
        [s * 2.49, 4.35, -0.11],
        [s * 2.64, 4.59, -0.15],
      ],
      0.09,
      shoulderBough.joints[1],
    );
    branch(
      [
        [s * 2.11, 4.13, -0.27],
        [s * 2.42, 4.16, -0.45],
        [s * 2.63, 4.34, -0.51],
      ],
      0.05,
      shoulderBough.joints[1],
      paleWood,
    );
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
  const rightShoulder = limbs[1].arm.joints[0];
  mushroom([-1.15, 3.64, 0.08], 0.3, rightShoulder, -0.2);
=======
  const rightShoulder = limbs[1].arm.joints[0];

  // Broad moss saddles connect the shoulder foliage to the weathered timber.
  ellipsoid([-1.01, 3.67, -0.21], [0.39, 0.12, 0.36], C.moss, rightShoulder, 1);
  ellipsoid([-1.29, 3.57, -0.04], [0.27, 0.095, 0.3], C.mossLight, rightShoulder);
  b.cards(
    [
      frame([-1.24, 3.58, 0.32], [0, 1, 0]),
      frame([-1.47, 3.42, 0.21], [0, 1, 0]),
    ],
    hangingMoss,
    {
      size: [0.2, 0.5],
      lean: 180,
      flow: [0, 0, 1],
      bone: rightShoulder,
      sink: 0,
      bend: 12,
    },
  );

  mushroom([-1.15, 3.64, 0.08], 0.3, rightShoulder, -0.2);
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.decal(trunk, knotDrawing, {
    at: [-0.35, 2.03, 0.48],
=======
  // Fine living fissures are seated on the trunk, not floating in front of it.
  for (const fissure of [
    [[-0.18, 2.39, 0.7], [-0.32, 2.23, 0.65], [-0.27, 2.08, 0.61], [-0.4, 1.91, 0.6]],
    [[0.31, 2.94, 0.72], [0.48, 3.04, 0.65], [0.49, 3.17, 0.61], [0.63, 3.26, 0.58]],
    [[-0.31, 2.87, 0.7], [-0.46, 2.94, 0.64], [-0.56, 3.08, 0.6]],
  ]) {
    const route = trunkSurface.drape(fissure, { lift: 0.007 });
    b.sweep(route, [0.024, 0.009], {
      bone: spine.joints[1],
      color: C.seam,
      sides: 4,
      caps: "flat",
    });
    glow(
      b.sweep(trunkSurface.drape(fissure, { lift: 0.017 }), [0.009, 0.002], {
        bone: spine.joints[1],
        color: "#64b982",
        sides: 4,
        caps: "flat",
      }),
      0.65,
    );
  }

  b.decal(trunk, knotDrawing, {
    at: [-0.35, 2.03, 0.48],
>>>>>>> REPLACE