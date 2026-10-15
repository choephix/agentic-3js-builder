1. **Clean up the materials:** replace the noisy cloth, leather and bow grain with restrained, directional wear. The silhouette and embroidery should dominate, not camouflage-like surface noise.
2. **Refine the anime face:** enlarge the amber eyes, soften the chin and skin shading, replace protruding blush pieces with painted blush, and slightly shorten the ears.
3. **Improve the hair and shoulders:** add broad crown locks and replace the upright shoulder “fences” with overlapping, downward-sloping leaf armour.
4. **Rebuild the boots:** connect the ankles cleanly to sculpted, pointed feet instead of rectangular shoe blocks.
5. **Finish the accessories:** seat the bow beads directly on its surface and put the cloak’s embroidery on its actual fabric.

<<<<<<< SEARCH
  const skin = paint((_p, n) =>
    mix(C.skinShade, C.skin, Math.max(0.15, Math.min(1, 0.69 + n.y * 0.25 + n.z * 0.12))),
  );
=======
  const skin = paint((_p, n) =>
    mix(
      "#e9b9a3",
      "#ffe1c4",
      Math.max(0.30, Math.min(1, 0.76 + n.y * 0.17 + n.z * 0.08)),
    ),
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
  const paleCloth = grain("#c6cbbd", C.ivory, {
    size: 0.007,
    axis: "y",
    seed: 12,
  });
  const leather = grain(C.leatherDark, C.leather, {
    size: 0.009,
    axis: "y",
    seed: 15,
  });
=======
  const paleCloth = paint((p, n) => {
    const weave =
      Math.sin(p.y * 760) * Math.sin((p.x + p.z) * 810) * 0.013;
    return mix(
      "#c0c8b4",
      "#eee9d4",
      Math.max(0.20, Math.min(0.94, 0.70 + n.y * 0.14 + weave)),
    );
  });
  const leather = paint((p, n) => {
    const wear = noise(p, 0.14, 15);
    const pores = noise(p, 0.006, 16);
    return mix(
      "#443831",
      "#84624a",
      Math.max(
        0.16,
        Math.min(0.91, 0.48 + n.y * 0.18 + wear * 0.18 + pores * 0.025),
      ),
    );
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const bowWood = grain("#425c44", "#a1ad6a", {
    size: 0.014,
    axis: "y",
    seed: 32,
  });
=======
  const bowGrain = grain("#576349", "#879166", {
    size: 0.025,
    axis: "y",
    seed: 32,
  });
  const bowWood = paint((p, n) =>
    mix(
      bowGrain.at(p, n),
      "#6e8055",
      0.67 - Math.max(0, n.y) * 0.10,
    ),
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
        <ellipse cx="56" cy="61" rx="12" ry="26" fill="#25342e"/>
=======
        <ellipse cx="56" cy="61" rx="14" ry="23" fill="#25342e"/>
>>>>>>> REPLACE

<<<<<<< SEARCH
  const mouthTexture = svg(
=======
  const blushTexture = svg(
    `<svg viewBox="0 0 120 45">
      <defs>
        <radialGradient id="rose">
          <stop offset="0" stop-color="#eaa89d" stop-opacity=".65"/>
          <stop offset=".72" stop-color="#eaa89d" stop-opacity=".30"/>
          <stop offset="1" stop-color="#eaa89d" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="23" rx="57" ry="20" fill="url(#rose)"/>
      <path d="M43 28 L47 17 M57 29 L61 18 M71 28 L75 17"
        stroke="#cb8c80" stroke-width="3.5" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const mouthTexture = svg(
>>>>>>> REPLACE

<<<<<<< SEARCH
  const lowerJaw = ellipsoid(
    face.p([0, -0.071, 0.003]),
    [face.s(0.077), face.s(0.059), face.s(0.081)],
    skin,
    jaw,
    "lower_jaw",
    16,
  );
=======
  const lowerJaw = ellipsoid(
    face.p([0, -0.064, 0.002]),
    [face.s(0.084), face.s(0.063), face.s(0.083)],
    skin,
    jaw,
    "lower_jaw",
    16,
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
      size: [face.s(0.086), face.s(0.103)],
=======
      size: [face.s(0.100), face.s(0.115)],
>>>>>>> REPLACE

<<<<<<< SEARCH
    ellipsoid(
      face.p([s * 0.079, -0.040, 0.075]),
      [0.028, 0.008, 0.005],
      C.blush,
      head,
      "cheek_blush",
      12,
    );
=======
    b.decal(skull, blushTexture, {
      at: face.p([s * 0.081, -0.044, 0.078]),
      dir: [s * 0.24, -0.02, 1],
      size: [0.045, 0.018],
      lift: 0.0015,
      segments: 6,
      bone: head,
      name: "painted_cheek_blush",
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
      ear.map((p) => [face.s(p[0]), face.s(p[1])] as OutlinePoint),
=======
      ear.map((p) => [face.s(p[0] * 0.85), face.s(p[1])] as OutlinePoint),
>>>>>>> REPLACE

<<<<<<< SEARCH
        [0.096, 0.008],
        [0.155, 0.061, "sharp"],
        [0.057, 0.024],
=======
        [0.083, 0.008],
        [0.132, 0.061, "sharp"],
        [0.050, 0.024],
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.sweep(hairChain, (t) => [0.100 * (1 - t * 0.73), 0.052 * (1 - t * 0.7)], {
=======
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const z = 0.017 - i * 0.035;
      b.sweep(
        bezier(
          face.p([s * 0.011, 0.207 - i * 0.004, z - 0.021]),
          face.p([s * 0.104, 0.205 - i * 0.010, z]),
          face.p([s * 0.132, 0.058 - i * 0.020, z - 0.009]),
        ),
        (t) => [
          face.s(0.022 * Math.sin(Math.PI * (0.09 + t * 0.87)) + 0.001),
          face.s(0.008 * (1 - t * 0.6)),
        ],
        {
          color: i === 1 ? C.hairLight : silverHair,
          bone: head,
          sides: 6,
          caps: "point",
          name: "swept_crown_hair_lock",
        },
      );
    }
  }

  b.sweep(hairChain, (t) => [0.100 * (1 - t * 0.73), 0.052 * (1 - t * 0.7)], {
>>>>>>> REPLACE

<<<<<<< SEARCH
    for (let i = 0; i < 3; i++) {
      leafPlate(
        [s * (0.220 + i * 0.054), 1.391 - i * 0.022, 0.092],
        0.73 - i * 0.08,
        0.62,
        chain.joints[0],
        i % 2 ? C.forest : C.green,
        "overlapping_pauldron_leaf",
      );
    }
=======
    for (let i = 0; i < 3; i++) {
      const x = s * (0.211 + i * 0.049);
      const y = 1.407 - i * 0.024;
      const outline: OutlinePoint[] = [
        [-0.043, 0.008],
        [0.009, 0.039],
        [0.063, 0.002],
        [0.085, -0.057, "sharp"],
        [0.015, -0.049],
        [-0.043, -0.020],
      ];
      const origin = [x, y, 0.048];
      const X = [s * 0.95, -0.31, 0];
      const Y = [s * 0.31, 0.95, 0];
      b.extrude(outline, {
        at: origin,
        x: X,
        y: Y,
        thickness: 0.034,
        bevel: 0.004,
        color: i % 2 ? C.forest : C.green,
        bone: chain.joints[0],
        name: "sloping_overlapping_pauldron_leaf",
      });
      const border = outline.map((p) => [
        origin[0] + X[0] * p[0] + Y[0] * p[1],
        origin[1] + X[1] * p[0] + Y[1] * p[1],
        origin[2] + 0.020,
      ]);
      b.sweep(polyline(border, { closed: true }), 0.0035, {
        color: gold,
        bone: chain.joints[0],
        sides: 5,
        name: "pauldron_leaf_gilt_border",
      });
      b.rod(
        [x - s * 0.014, y + 0.003, 0.071],
        [x + s * 0.060, y - 0.045, 0.071],
        0.003,
        {
          color: C.goldLight,
          bone: chain.joints[0],
          sides: 5,
          name: "pauldron_leaf_midvein",
        },
      );
    }
>>>>>>> REPLACE

<<<<<<< SEARCH
    box(
      [s * 0.15, 0.127, 0.117],
      [0.150, 0.094, 0.294],
      leather,
      chain.tip!,
      `flat_boot_foot${side}`,
    );
    box(
      [s * 0.15, 0.088, 0.120],
      [0.157, 0.016, 0.302],
      C.leatherDark,
      chain.tip!,
      "boot_sole",
    );
    box(
      [s * 0.15, 0.095, -0.009],
      [0.129, 0.029, 0.070],
      C.leatherDark,
      chain.tip!,
      "boot_heel",
    );
    b.frustumBox(
      [s * 0.15, 0.137, 0.175],
      [s * 0.15, 0.137, 0.269],
      [0.146, 0.078],
      [0.100, 0.043],
      { color: C.deep, bone: chain.tip!, name: "pointed_boot_toe" },
    );
    b.rod(
      [s * 0.15, 0.165, 0.177],
      [s * 0.15, 0.161, 0.273],
      0.004,
      { color: gold, bone: chain.tip!, sides: 5, name: "toe_cap_seam" },
    );
=======
    b.extrude(
      [
        [-0.036, 0.008],
        [0.212, 0.008],
        [0.250, 0.032, "sharp"],
        [0.214, 0.062],
        [0.115, 0.089],
        [0.072, 0.145],
        [0.065, 0.190],
        [-0.026, 0.190],
      ],
      {
        at: [s * 0.15, 0.08, 0],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.137,
        bevel: 0.012,
        color: leather,
        bone: chain.tip!,
        name: `sculpted_pointed_boot${side}`,
      },
    );
    b.extrude(
      [
        [-0.039, 0],
        [0.214, 0],
        [0.252, 0.023, "sharp"],
        [0.214, 0.030],
        [-0.039, 0.024],
      ],
      {
        at: [s * 0.15, 0.08, 0],
        x: [0, 0, 1],
        thickness: 0.143,
        bevel: 0.003,
        color: C.leatherDark,
        bone: chain.tip!,
        name: "shaped_boot_sole",
      },
    );
    box(
      [s * 0.15, 0.095, -0.009],
      [0.123, 0.029, 0.065],
      C.leatherDark,
      chain.tip!,
      "boot_heel",
    );
    b.slab(
      [
        [s * 0.15 - 0.065, 0.161, 0.137],
        [s * 0.15 + 0.065, 0.161, 0.137],
        [s * 0.15 + 0.039, 0.143, 0.218],
        [s * 0.15, 0.119, 0.249],
        [s * 0.15 - 0.039, 0.143, 0.218],
      ],
      {
        thickness: 0.008,
        color: C.deep,
        bone: chain.tip!,
        name: "leaf_shaped_boot_toe_cap",
      },
    );
    b.sweep(
      [
        [s * 0.15 - 0.065, 0.166, 0.137],
        [s * 0.15, 0.155, 0.186],
        [s * 0.15 + 0.065, 0.166, 0.137],
      ],
      0.0038,
      {
        color: gold,
        bone: chain.tip!,
        sides: 5,
        name: "boot_toe_cap_gilt_edge",
      },
    );
    b.rod(
      [s * 0.15, 0.157, 0.184],
      [s * 0.15, 0.126, 0.245],
      0.003,
      { color: gold, bone: chain.tip!, sides: 5, name: "toe_leaf_midvein" },
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.membrane(inside, outside, {
      color: cloakPaint,
      thickness: 0.014,
      rows: 4,
      cols: 7,
      bone: joint,
      name: "split_woodland_cloak",
    });
=======
    const cloakPanel = b.membrane(inside, outside, {
      color: cloakPaint,
      thickness: 0.014,
      rows: 4,
      cols: 7,
      bone: joint,
      name: "split_woodland_cloak",
    });
    b.decal(cloakPanel, embroidery, {
      at: [s * 0.240, 0.856, -0.28],
      dir: [0, 0, 1],
      size: [0.290, 0.112],
      lift: 0.002,
      segments: 12,
      bone: joint,
      mirror: s < 0,
      name: "front_cloak_ivy_embroidery",
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
    drawing(
      [s * 0.240, 0.850, -0.305],
      0.319,
      0.117,
      embroidery,
      joint,
      [0, 0, -1],
      "ivy_embroidered_cloak_hem",
    );
=======
    b.decal(cloakPanel, embroidery, {
      at: [s * 0.240, 0.856, -0.29],
      dir: [0, 0, -1],
      size: [0.290, 0.112],
      lift: 0.003,
      segments: 12,
      bone: joint,
      mirror: s > 0,
      name: "back_cloak_ivy_embroidery",
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
        b.stick(new THREE.SphereGeometry(0.0045, 6, 4), gold, item, {
          embed: 0.25,
          bone: bowBone,
          name: "bow_binding_bead",
        });
=======
        const seated = b.surface(bow).nearest(item.at);
        b.stick(new THREE.SphereGeometry(0.0045, 6, 4), gold, seated, {
          embed: 0.40,
          bone: bowBone,
          name: "bow_binding_bead",
        });
>>>>>>> REPLACE