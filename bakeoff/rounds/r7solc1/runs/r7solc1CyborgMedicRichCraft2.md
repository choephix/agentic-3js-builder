1. **Remove the oversized black neck wedge.** The torso’s rounded end cap rises into the neck; a flat termination gives the collar and head a clean connection.
2. **Rebuild the face’s lower planes.** Remove the bead-like cheeks and stacked chin pieces, seat the mouth on the jaw, and slightly reduce the eyes for a more confident hero expression.
3. **Replace noisy surface finishes.** Clean ceramic, broad silver hair tones, and restrained metal shading better match the polished, graphic style.
4. **Strengthen the torso silhouette.** Broaden the waist slightly and add fitted flank armor so the breastplate feels integrated rather than suspended.
5. **Give the staff a readable focal point.** A dark induction core lets the luminous medical symbol stand out instead of disappearing into a glowing disc.

<<<<<<< SEARCH
  const ceramic = paint((p, n) => {
    const shade = Math.max(0, n.y * 0.55 + n.z * 0.22 + 0.3);
    let col = mix("#a7c5c7", "#f5f4e8", shade);
    const fleck = noise(p, 0.018, 17);
    if (fleck > 0.77 && n.y < 0.5) col = mix(col, "#789b9d", 0.25);
    if (p.y < 0.39) col = mix(col, "#6d8b91", 0.13);
    return col;
  });
=======
  const ceramic = paint((p, n) => {
    const shade = Math.max(0, n.y * 0.55 + n.z * 0.22 + 0.3);
    let col = mix("#adc8ce", "#fff9e8", shade);
    if (p.y < 0.29) col = mix(col, "#77949d", 0.075);
    return col;
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const suit = grain("#142335", "#2a4252", {
    size: 0.008,
    axis: "y",
    seed: 9,
  });
  const skin = paint((_p, n) =>
    mix("#b47870", "#e8b598", 0.56 + n.y * 0.2 + n.z * 0.2),
  );
  const hair = grain("#859fa7", "#e6eee4", {
    size: 0.018,
    axis: [0.8, 0.5, -0.2],
    seed: 4,
  });
  const brushed = grain("#526e7c", "#afc6c7", {
    size: 0.01,
    axis: "y",
    seed: 23,
  });
=======
  const suit = paint((_p, n) =>
    mix("#142538", "#304b5b", 0.3 + n.y * 0.22 + n.z * 0.18),
  );
  const skin = paint((_p, n) =>
    mix("#ba8177", "#efbfa2", 0.56 + n.y * 0.2 + n.z * 0.2),
  );
  const hair = paint((_p, n) => {
    const light = n.y * 0.7 + n.z * 0.2;
    return light > 0.48
      ? "#eef4e8"
      : light > -0.12
        ? "#bacfd0"
        : "#7d9eac";
  });
  const brushed = paint((p, n) =>
    mix(
      "#607e90",
      "#c2d5d4",
      Math.max(0, Math.min(1, 0.44 + n.y * 0.3 + n.z * 0.18 + (noise(p, 0.18, 23) - 0.5) * 0.06)),
    ),
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
  grain,
  noise,
=======
  noise,
>>>>>>> REPLACE

<<<<<<< SEARCH
      flat: true,
    },
  );

  ellipsoid(
    face.p([0, -0.104, 0.028]),
    [face.s(0.116), face.s(0.076), face.s(0.111)],
    skin,
    jaw,
  );
  ellipsoid(
    face.p([0, -0.064, 0.092]),
    [face.s(0.09), face.s(0.042), face.s(0.065)],
    skin,
    head,
  );

  for (const s of [1, -1]) {
=======
      flat: false,
    },
  );

  const lowerFace = b.part(
    new THREE.SphereGeometry(1, 12, 8),
    skin,
    {
      at: face.p([0, -0.105, 0.022]),
      scale: [face.s(0.117), face.s(0.067), face.s(0.109)],
      bone: jaw,
      flat: false,
    },
  );

  for (const s of [1, -1]) {
>>>>>>> REPLACE

<<<<<<< SEARCH
      size: [face.s(0.119), face.s(0.079)],
=======
      size: [face.s(0.107), face.s(0.069)],
>>>>>>> REPLACE

<<<<<<< SEARCH
    ellipsoid(
      face.p([s * 0.104, -0.054, 0.106]),
      [0.041, 0.025, 0.023],
      skin,
      head,
    );

    cylinder(
=======
    cylinder(
>>>>>>> REPLACE

<<<<<<< SEARCH
  graphic(
    face.p([0, -0.117, 0.132]),
    face.s(0.105),
    face.s(0.035),
    mouthTexture,
    jaw,
  );
  ellipsoid(
    face.p([0, -0.156, 0.077]),
    [0.059, 0.023, 0.055],
    skin,
    jaw,
  );
=======
  b.decal(lowerFace, mouthTexture, {
    at: face.p([0, -0.105, 0.133]),
    dir: [0, 0, 1],
    size: [face.s(0.098), face.s(0.029)],
    segments: 6,
    lift: 0.0018,
    bone: jaw,
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
      { at: [0, 1.065, 0], w: 0.36, h: 0.255 },
      { at: [0, 1.24, 0], w: 0.302, h: 0.228 },
      { at: [0, 1.49, 0], w: 0.467, h: 0.283 },
      { at: [0, 1.625, 0], w: 0.375, h: 0.235 },
    ],
    { color: suit, bone: [hips, spine], sides: 8 },
=======
      { at: [0, 1.065, 0], w: 0.37, h: 0.255 },
      { at: [0, 1.24, 0], w: 0.35, h: 0.248 },
      { at: [0, 1.49, 0], w: 0.49, h: 0.293 },
      { at: [0, 1.625, 0], w: 0.375, h: 0.235 },
    ],
    { color: suit, bone: [hips, spine], sides: 8, caps: "flat" },
>>>>>>> REPLACE

<<<<<<< SEARCH
    // Side ribs leave the dark undersuit visible between the ceramic blocks.
    for (let i = 0; i < 3; i++) {
=======
    // Fitted flank shells connect the breastplate to the abdominal assembly.
    b.extrude(
      [
        [-0.094, 0],
        [0.093, 0],
        [0.119, 0.116],
        [0.103, 0.231],
        [-0.087, 0.222],
        [-0.117, 0.118],
      ],
      {
        at: [s * 0.174, 1.229, 0],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.055,
        bevel: 0.007,
        color: teal,
        bone: spine.joints[1],
      },
    );
    b.rod(
      [s * 0.205, 1.251, 0.088],
      [s * 0.218, 1.414, 0.104],
      0.013,
      { bone: spine.joints[1], color: C.navy, sides: 6 },
    );

    // Broad rib bands sit over the fitted shell rather than bridging empty space.
    for (let i = 0; i < 3; i++) {
>>>>>>> REPLACE

<<<<<<< SEARCH
  glow(
    ellipsoid([staffX, coreY, staffZ], [0.087, 0.105, 0.059], C.mint, staff, 10),
    1.15,
  );
  glow(
    graphic([staffX, coreY, staffZ + 0.069], 0.144, 0.144, inductionTexture, staff),
    1.2,
  );
=======
  ellipsoid(
    [staffX, coreY, staffZ],
    [0.087, 0.105, 0.059],
    C.deepTeal,
    staff,
    10,
  );
  glow(
    graphic([staffX, coreY, staffZ + 0.069], 0.144, 0.144, inductionTexture, staff),
    0.95,
  );
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.OctahedronGeometry(0.025), C.mintPale, {
        at: [staffX, coreY + s * 0.092, staffZ + 0.015],
        scale: [0.7, 1, 0.65],
        bone: staff,
      }),
      0.85,
    );
  }
>>>>>>> REPLACE