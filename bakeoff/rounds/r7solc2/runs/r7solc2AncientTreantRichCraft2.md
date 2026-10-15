1. **Make the canopy feel like a living oak, not stacked green shelves.** Fuller, irregular foliage masses, larger edge leaves, and restrained hanging moss preserve the faceted style while improving the silhouette.
2. **Give the guardian more physical weight.** Deepen the chest, thicken the upper arms and palms, and add flared shoulder bark. He should read as an ancient siege-sized protector.
3. **Make the heart feel grown into the tree.** Replace the hexagonal badge with an organic knot, conform the glowing rune to its surface, and strengthen the surrounding root framework.
4. **Add characterful age rather than more small clutter.** Carved forehead furrows, substantial moss streamers, and a few large acorns give the face and crown richer storytelling.

<<<<<<< SEARCH
      <path d="M80 8 L141 45 L141 129 L80 171 L19 129 L19 45 Z"
        fill="#152a23" stroke="#78bc77" stroke-width="5"/>
      <path d="M80 22 L127 52 L127 122 L80 154 L33 122 L33 52 Z"
        fill="none" stroke="#416d48" stroke-width="4"/>
=======
      <path d="M79 9 C105 30 143 40 139 83
        C146 119 106 151 80 172 C53 146 17 122 21 86
        C16 48 57 29 79 9 Z"
        fill="#142a22" stroke="#8da16c" stroke-width="7"/>
      <path d="M79 22 C100 43 128 46 125 85
        C132 113 100 142 80 154 C60 134 32 113 35 85
        C30 56 61 42 79 22 Z"
        fill="none" stroke="#3d6744" stroke-width="5"/>
      <path d="M29 77 Q43 101 34 116 M119 48 Q109 69 128 91
        M55 137 Q73 131 80 155"
        fill="none" stroke="#78965f" stroke-width="4"/>
>>>>>>> REPLACE

<<<<<<< SEARCH
  const baseLabel = svg(
=======
  const hangingMoss = svg(
    `<svg viewBox="0 0 100 200">
      <path d="M13 0 L88 0 L81 29 L89 44 L73 63 L78 88
        L64 113 L68 135 L53 161 L49 196 L39 176 L38 148
        L26 130 L30 102 L16 80 L23 56 L10 33 Z"
        fill="#3a6243"/>
      <path d="M26 0 L62 0 L57 34 L66 53 L52 78 L57 101
        L44 126 L47 149 L40 174 L37 138 L28 119 L35 93
        L26 72 L35 47 Z" fill="#729051"/>
      <path d="M73 0 L82 0 L74 31 L81 46 L64 67 L68 88
        L57 108 L59 127 L50 148 L53 117 L46 99 L57 76
        L52 57 L67 33 Z" fill="#9aac65"/>
      <path d="M44 5 L45 37 L39 58 M60 83 L48 101 L49 122
        M32 85 L40 99" fill="none" stroke="#bcc482" stroke-width="3"/>
    </svg>`,
    { size: 384 },
  );

  const baseLabel = svg(
>>>>>>> REPLACE

<<<<<<< SEARCH
    ellipsoid(
      [x, y, z],
      [radius, radius * 0.56 * height, radius * 0.73],
      colors[0],
      bone,
    );
    ellipsoid(
      [x - radius * 0.27, y + radius * 0.21 * height, z + radius * 0.1],
      [radius * 0.72, radius * 0.48 * height, radius * 0.61],
      colors[1],
      bone,
    );
    ellipsoid(
      [x + radius * 0.38, y + radius * 0.22 * height, z - radius * 0.07],
      [radius * 0.61, radius * 0.38 * height, radius * 0.52],
      colors[2],
      bone,
    );
    const sprays = [];
    for (let i = 0; i < 3; i++) {
      const angle = i * 2.1 + random();
      sprays.push(
        frame(
          [
            x + Math.cos(angle) * radius * 0.67,
            y + radius * 0.23,
            z + Math.sin(angle) * radius * 0.48,
          ],
          [Math.cos(angle) * 0.6, 0.75, Math.sin(angle) * 0.4],
        ),
      );
    }
    b.cards(sprays, leafDrawing, {
      size: [radius * 0.62, radius * 0.7],
      lean: 35,
      flow: [0, 0.1, 1],
      bone,
      sink: 0.18,
      cross: true,
    });
=======
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

    const canopySkin = b.surface(foliageMass);
    const sprays = [];
    for (let i = 0; i < 4; i++) {
      const hit = canopySkin.around(center).at(i * 90 + random() * 30, 4 + random() * 21);
      if (hit) sprays.push(hit);
    }
    b.cards(sprays, leafDrawing, {
      size: [radius * 0.73, radius * 0.89],
      lean: 52,
      flow: [0, -0.15, 1],
      bone,
      sink: 0.24,
      cross: false,
    });

    if (gold) {
      for (const azimuth of [-35, 58]) {
        const hit = canopySkin.around(center).at(azimuth, -23);
        if (hit) {
          b.cards([frame(hit.at, [0, 1, 0])], hangingMoss, {
            size: [radius * 0.33, radius * 0.85],
            lean: 180,
            flow: [0, 0, 1],
            bone,
            sink: 0,
            bend: 8,
          });
        }
      }
    }
>>>>>>> REPLACE

<<<<<<< SEARCH
      { at: [0, 1.34, 0.02], w: 1.15, h: 0.85 },
      { at: [0, 1.9, 0], w: 1.17, h: 0.99 },
      { at: [0, 2.55, -0.04], w: 1.62, h: 1.17 },
      { at: [0, 3.13, -0.04], w: 2.04, h: 1.17 },
      { at: [0, 3.47, -0.01], w: 1.21, h: 0.86 },
=======
      { at: [0, 1.34, 0.02], w: 1.2, h: 0.94 },
      { at: [0, 1.9, -0.035], w: 1.24, h: 1.13 },
      { at: [0, 2.55, -0.14], w: 1.82, h: 1.43 },
      { at: [0, 3.13, -0.17], w: 2.13, h: 1.48 },
      { at: [0, 3.47, -0.08], w: 1.33, h: 1.04 },
>>>>>>> REPLACE

<<<<<<< SEARCH
  ellipsoid(
    [0, 2.76, 0.575],
    [0.39, 0.46, 0.15],
    C.seam,
    spine.joints[1],
  );
=======
  const heartSocket = ellipsoid(
    [0, 2.76, 0.575],
    [0.39, 0.46, 0.18],
    C.seam,
    spine.joints[1],
    1,
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
  glow(
    b.part(new THREE.PlaneGeometry(0.48, 0.56), "#ffffff", {
      at: [0, 2.76, 0.735],
      bone: spine.joints[1],
      texture: heartRune,
      name: "livingHeartRune",
    }),
    1.15,
  );
=======
  glow(
    b.decal(heartSocket, heartRune, {
      at: [0, 2.76, 0.76],
      dir: [0, 0, 1],
      size: [0.48, 0.6],
      segments: 8,
      lift: 0.007,
      bone: spine.joints[1],
      name: "livingHeartRune",
    }),
    1.05,
  );

  for (const s of [1, -1]) {
    branch(
      [
        [s * 0.08, 2.29, 0.6],
        [s * 0.26, 2.49, 0.7],
        [s * 0.32, 2.88, 0.72],
        [s * 0.17, 3.13, 0.59],
      ],
      0.065,
      spine.joints[1],
      paleWood,
    );
    b.sweep(
      [
        [s * 0.38, 2.7, 0.65],
        [s * 0.53, 2.84, 0.59],
        [s * 0.69, 3.15, 0.51],
        [s * 0.88, 3.3, 0.4],
      ],
      [0.052, 0.085, 0.11, 0.02],
      {
        bone: spine.joints[1],
        color: paleWood,
        sides: 5,
        smooth: false,
      },
    );
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (let i = -1; i <= 1; i++) {
    b.extrude(
=======
  for (const s of [1, -1]) {
    const forehead = b.surface(skull).drape(
      [
        face.p([s * 0.14, 0.24, 0.49]),
        face.p([s * 0.19, 0.35, 0.41]),
        face.p([s * 0.16, 0.46, 0.3]),
      ],
      { lift: 0.005 },
    );
    b.sweep(forehead, [0.015, 0.012, 0.005], {
      bone: head,
      color: C.seam,
      sides: 5,
    });
    const furrow = b.surface(skull).drape(
      [
        face.p([s * 0.29, 0.28, 0.43]),
        face.p([s * 0.34, 0.36, 0.34]),
        face.p([s * 0.35, 0.43, 0.23]),
      ],
      { lift: 0.006 },
    );
    b.sweep(furrow, [0.022, 0.014, 0.003], {
      bone: head,
      color: paleWood,
      sides: 5,
    });
  }

  for (let i = -1; i <= 1; i++) {
    b.extrude(
>>>>>>> REPLACE

<<<<<<< SEARCH
      (t) => [0.4 - t * 0.17, 0.36 - t * 0.15],
=======
      (t) => [0.47 - t * 0.21, 0.41 - t * 0.16],
>>>>>>> REPLACE

<<<<<<< SEARCH
      [0.53, 0.47, 0.46],
=======
      [0.6, 0.51, 0.53],
>>>>>>> REPLACE

<<<<<<< SEARCH
      [0.345, 0.31, 0.26],
=======
      [0.375, 0.33, 0.31],
>>>>>>> REPLACE

<<<<<<< SEARCH
    const armSkin = b.surface(armTube);
=======
    // Broad, overlapping bark splinters make the shoulders look ancient
    // and armored without introducing manufactured metal fittings.
    for (let i = 0; i < 3; i++) {
      b.extrude(
        [
          [-0.19, -0.17], [-0.25, 0.14], [-0.16, 0.42],
          [0.04, 0.67 - i * 0.09], [0.14, 0.33],
          [0.23, 0.12], [0.16, -0.23],
        ],
        {
          at: [s * (0.99 + i * 0.18), 3.3 - i * 0.1, -0.17 - i * 0.07],
          x: [s, 0, -0.15],
          y: [s * 0.3, 1, -0.17],
          thickness: [0.18, 0.05],
          bone: arm.joints[0],
          color: i === 1 ? paleWood : bark,
        },
      );
    }

    const armSkin = b.surface(armTube);
>>>>>>> REPLACE

<<<<<<< SEARCH
      [s * 1.03, s > 0 ? 5.58 : 5.77, -0.4],
      s > 0 ? 0.68 : 0.6,
=======
      [s * 1.03, s > 0 ? 5.5 : 5.86, -0.4],
      s > 0 ? 0.66 : 0.59,
>>>>>>> REPLACE

<<<<<<< SEARCH
      [s * 1.76, s > 0 ? 5.42 : 5.58, -0.47],
      s > 0 ? 0.57 : 0.64,
=======
      [s * 1.76, s > 0 ? 5.27 : 5.52, -0.47],
      s > 0 ? 0.55 : 0.61,
>>>>>>> REPLACE

<<<<<<< SEARCH
      [s * 0.42, s > 0 ? 5.95 : 6.12, -0.46],
      s > 0 ? 0.55 : 0.5,
=======
      [s * 0.42, s > 0 ? 5.88 : 6.17, -0.46],
      s > 0 ? 0.52 : 0.48,
>>>>>>> REPLACE

<<<<<<< SEARCH
  // An asymmetric shrine-stone pauldron and a small colony of shelf fungi.
=======
  // Large acorns provide one legible oak-specific detail below the crown.
  function acorn(at: number[], size: number, bone: Joint) {
    const [x, y, z] = at;
    b.sweep(
      [[x, y + size * 1.5, z], [x + size * 0.12, y + size * 0.5, z]],
      size * 0.075,
      { bone, color: rootWood, sides: 5 },
    );
    b.lathe(
      [
        [0, -size * 0.8], [size * 0.27, -size * 0.63],
        [size * 0.42, -size * 0.17], [size * 0.4, size * 0.26],
        [size * 0.28, size * 0.43], [0, size * 0.43],
      ],
      {
        at,
        bone,
        segments: 7,
        color: paleWood,
      },
    );
    b.lathe(
      [
        [0, size * 0.23], [size * 0.48, size * 0.23],
        [size * 0.47, size * 0.43], [size * 0.29, size * 0.59],
        [size * 0.08, size * 0.64], [0, size * 0.58],
      ],
      {
        at,
        bone,
        segments: 7,
        color: rootWood,
      },
    );
  }

  acorn([1.86, 4.2, -0.28], 0.24, limbs[0].shoulderBough.joints[1]);
  acorn([2.08, 4.29, -0.37], 0.18, limbs[0].shoulderBough.joints[1]);
  acorn([-1.38, 5.13, -0.09], 0.23, limbs[1].crown.joints[2]);

  // An asymmetric shrine-stone pauldron and a small colony of shelf fungi.
>>>>>>> REPLACE