1. **Refine the face:** reduce the protruding lower jaw and round-eyed look, giving the ranger a more elegant anime expression.
2. **Fix the armour layering:** uncover the buried shoulder leaves and align the bracer plates with the forearms.
3. **Improve the hair and neckline:** replace thin forehead strands with broader locks and give the collar a clean, continuous rim.
4. **Strengthen the colour hierarchy:** keep ivory at the sleeves, introduce sage trousers, and enlarge the signature chest emblem.
5. **Polish the setting:** make the base shallower, add fuller ferns, and give the waystone restrained magical illumination.

<<<<<<< SEARCH
  const leather = paint((p, n) => {
=======
  const trouserCloth = paint((p, n) =>
    mix(
      "#798c78",
      "#bac5a5",
      Math.max(
        0.20,
        Math.min(0.92, 0.57 + n.y * 0.16 + noise(p, 0.035, 61) * 0.10),
      ),
    ),
  );
  const leather = paint((p, n) => {
>>>>>>> REPLACE

<<<<<<< SEARCH
  function leafPlate(
    at: number[],
    width: number,
    height: number,
    bone: Joint,
    color: ColorInput,
    name: string,
  ) {
    const outline = leafOutline.map(
      (p) => [p[0] * width, p[1] * height] as OutlinePoint,
    );
=======
  function leafPlate(
    at: number[],
    width: number,
    height: number,
    bone: Joint,
    color: ColorInput,
    name: string,
    angleDeg = 0,
  ) {
    const angle = angleDeg * Math.PI / 180;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const outline = leafOutline.map((p) => {
      const x = p[0] * width;
      const y = p[1] * height;
      return [x * c - y * s, x * s + y * c] as OutlinePoint;
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.rod(
      [at[0], at[1] - 0.075 * height, at[2] + 0.014],
      [at[0], at[1] + 0.074 * height, at[2] + 0.014],
      0.0028,
      { color: C.goldLight, bone, sides: 5 },
    );
  }
=======
    b.rod(
      [at[0] + 0.075 * height * s, at[1] - 0.075 * height * c, at[2] + 0.014],
      [at[0] - 0.074 * height * s, at[1] + 0.074 * height * c, at[2] + 0.014],
      0.0028,
      { color: C.goldLight, bone, sides: 5 },
    );
    for (const side of [1, -1]) {
      for (const y of [-0.027, 0.027]) {
        const rootY = y * height;
        const tipX = side * 0.035 * width;
        const tipY = (y + 0.025) * height;
        b.rod(
          [at[0] - rootY * s, at[1] + rootY * c, at[2] + 0.014],
          [
            at[0] + tipX * c - tipY * s,
            at[1] + tipX * s + tipY * c,
            at[2] + 0.014,
          ],
          0.0018,
          { color: C.jade, bone, sides: 5, name: "leaf_guard_inlaid_vein" },
        );
      }
    }
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
  const lowerJaw = ellipsoid(
    face.p([0, -0.064, 0.002]),
    [face.s(0.084), face.s(0.063), face.s(0.083)],
    skin,
    jaw,
    "lower_jaw",
    16,
  );
=======
  const lowerJaw = ellipsoid(
    face.p([0, -0.063, -0.009]),
    [face.s(0.080), face.s(0.065), face.s(0.073)],
    skin,
    jaw,
    "lower_jaw",
    18,
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
      size: [face.s(0.100), face.s(0.115)],
=======
      size: [face.s(0.097), face.s(0.097)],
>>>>>>> REPLACE

<<<<<<< SEARCH
        face.p([s * 0.028, 0.082, 0.083]),
        face.p([s * 0.065, 0.098, 0.089]),
        face.p([s * 0.102, 0.077, 0.066]),
=======
        face.p([s * 0.028, 0.070, 0.090]),
        face.p([s * 0.065, 0.083, 0.089]),
        face.p([s * 0.102, 0.066, 0.070]),
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.extrude(
    [
      [0, 0.010],
      [0.018, -0.018],
      [0.029, -0.023],
      [0.017, -0.035],
      [0, -0.030],
    ],
    {
      at: face.p([0, -0.009, 0.091]),
      thickness: 0.017,
      color: skin,
      bone: head,
      name: "small_angular_nose",
    },
  );
  ellipsoid(
    face.p([0, -0.034, 0.119]),
    [0.009, 0.004, 0.004],
    "#ffe4cc",
    head,
    "nose_highlight",
    8,
  );
  b.decal(lowerJaw, mouthTexture, {
    at: face.p([0, -0.080, 0.082]),
    dir: [0, 0, 1],
    size: [0.060, 0.021],
=======
  b.extrude(
    [
      [0, 0.010],
      [0.012, -0.014],
      [0.021, -0.020],
      [0.014, -0.027],
      [0, -0.025],
    ],
    {
      at: face.p([0, -0.009, 0.093]),
      thickness: 0.015,
      color: skin,
      bone: head,
      name: "small_angular_nose",
    },
  );
  ellipsoid(
    face.p([0, -0.028, 0.114]),
    [0.007, 0.003, 0.003],
    "#ffe4cc",
    head,
    "nose_highlight",
    8,
  );
  b.decal(lowerJaw, mouthTexture, {
    at: face.p([0, -0.079, 0.074]),
    dir: [0, 0, 1],
    size: [0.048, 0.015],
>>>>>>> REPLACE

<<<<<<< SEARCH
  ellipsoid(
    face.p([0, 0.052, -0.052]),
    [face.s(0.138), face.s(0.165), face.s(0.111)],
    silverHair,
    head,
    "silver_hair_cap",
    16,
  );
=======
  ellipsoid(
    face.p([0, 0.052, -0.052]),
    [face.s(0.138), face.s(0.165), face.s(0.120)],
    silverHair,
    head,
    "silver_hair_cap",
    16,
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.sweep(
        bezier(
          face.p([rootX, 0.167 - i * 0.006, -0.006]),
          face.p([s * (0.044 + i * 0.029), 0.124, 0.082]),
          face.p([tipX, 0.082 - i * 0.003, 0.092 - i * 0.011]),
        ),
        (t) => [face.s(0.021 * (1 - t) + 0.002), face.s(0.009)],
        {
          color: i % 2 ? silverHair : C.hairLight,
          bone: head,
          caps: "point",
          sides: 6,
          name: "parted_forehead_lock",
        },
      );
=======
      const fringe = b.sweep(
        bezier(
          face.p([rootX, 0.167 - i * 0.006, -0.006]),
          face.p([s * (0.044 + i * 0.029), 0.130, 0.087]),
          face.p([tipX, 0.090 - i * 0.003, 0.094 - i * 0.011]),
        ),
        (t) => [
          face.s((0.028 - i * 0.001) * (1 - t) + 0.001),
          face.s(0.0065 * (1 - t * 0.65)),
        ],
        {
          color: silverHair,
          bone: head,
          caps: "point",
          section: { ngon: 4 },
          name: "broad_parted_forehead_lock",
        },
      );
      b.sweep(fringe.line(0, 0.0007).slice(0.12, 0.83), [0.0018, 0.0005], {
        color: C.hairLight,
        bone: head,
        sides: 5,
        name: "fringe_drawn_highlight",
      });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const collar = b.surface(torso).loop([0, 1.365, 0], {
    dir: [0, 1, 0],
    lift: 0.003,
  });
  b.sweep(collar, 0.016, { color: C.deep, bone: chest, name: "standing_tunic_collar" });
  b.sweep(
    b.surface(torso).loop([0, 1.352, 0], { dir: [0, 1, 0], lift: 0.009 }),
    0.0038,
    { color: gold, bone: chest, sides: 5, name: "collar_gold_piping" },
  );
=======
  b.lathe(
    [
      [0.060, 0],
      [0.086, 0],
      [0.082, 0.025],
      [0.071, 0.066],
      [0.059, 0.066],
      [0.058, 0.025],
    ],
    {
      at: [0, 1.373, 0],
      axis: [0, 1, 0],
      color: C.deep,
      bone: chest,
      segments: 12,
      name: "clean_high_ranger_collar",
    },
  );
  for (const band of [
    { y: 1.380, radius: 0.086 },
    { y: 1.438, radius: 0.071 },
  ]) {
    b.part(new THREE.TorusGeometry(band.radius, 0.0032, 5, 16), gold, {
      at: [0, band.y, 0],
      rotation: [90, 0, 0],
      bone: chest,
      name: "collar_continuous_gilt_rim",
    });
  }
  drawing(
    [0, 1.409, 0.078],
    0.057,
    0.024,
    runeTexture,
    chest,
    [0, 0, 1],
    "collar_elven_woven_script",
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
  drawing([0.045, 1.271, 0.133], 0.105, 0.139, leafEmblem, chest, [0, 0, 1], "verdant_moon_crest");
=======
  drawing([0.044, 1.252, 0.134], 0.121, 0.165, leafEmblem, chest, [0, 0, 1], "verdant_moon_crest");
>>>>>>> REPLACE

<<<<<<< SEARCH
    const shoulderAt = [s * 0.225, 1.364, 0.035];
    ellipsoid(shoulderAt, [0.104, 0.070, 0.095], C.deep, chain.joints[0], "shoulder_armour", 10);
=======
    const shoulderAt = [s * 0.225, 1.364, -0.010];
    ellipsoid(shoulderAt, [0.080, 0.045, 0.062], C.deep, chain.joints[0], "shoulder_armour_underplate", 10);
>>>>>>> REPLACE

<<<<<<< SEARCH
    leafPlate(
      [s * 0.646, 1.203, 0.063],
      0.75,
      0.68,
      chain.joints[1],
      C.forest,
      "bracer_leaf_guard",
    );
=======
    leafPlate(
      [s * 0.646, 1.203, 0.061],
      0.70,
      0.83,
      chain.joints[1],
      C.forest,
      "bracer_leaf_guard",
      s * 68,
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(chain, [0.089, 0.074, 0.056], {
      color: paleCloth,
      sides: 8,
      name: `fitted_trouser${side}`,
    });
=======
    b.sweep(chain, [0.083, 0.070, 0.054], {
      color: trouserCloth,
      sides: 8,
      name: `fitted_trouser${side}`,
    });
    b.sweep(chain, (t) => [0.085 - t * 0.019, 0.052 - t * 0.006], {
      from: 0.04,
      to: 0.45,
      color: trouserCloth,
      sectors: [[-20, 20, C.deep]],
      sides: 8,
      caps: "flat",
      name: `tailored_trouser_seam${side}`,
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.CylinderGeometry(1.14, 1.16, 0.076, 32), groundPaint, {
    at: [0.02, 0.038, 0],
    scale: [1.035, 1, 0.59],
    bone: hips,
    name: "oval_mossy_woodland_base",
  });
  b.part(new THREE.CylinderGeometry(1.16, 1.16, 0.018, 32), C.stoneDark, {
    at: [0.02, 0.011, 0],
    scale: [1.035, 1, 0.59],
    bone: hips,
    name: "dark_base_plinth",
  });
=======
  b.part(new THREE.CylinderGeometry(1.14, 1.16, 0.076, 32), groundPaint, {
    at: [0.02, 0.038, 0],
    scale: [1.035, 1, 0.46],
    bone: hips,
    name: "oval_mossy_woodland_base",
  });
  b.part(new THREE.CylinderGeometry(1.16, 1.16, 0.018, 32), C.stoneDark, {
    at: [0.02, 0.011, 0],
    scale: [1.035, 1, 0.46],
    bone: hips,
    name: "dark_base_plinth",
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const z = Math.sin(a) * 0.595;
=======
    const z = Math.sin(a) * 0.457;
>>>>>>> REPLACE

<<<<<<< SEARCH
  drawing([-0.737, 0.231, -0.214], 0.104, 0.173, waystoneTexture, hips, [0, 0, 1], "carved_elven_waymarker");
=======
  glow(
    drawing(
      [-0.737, 0.231, -0.214],
      0.104,
      0.173,
      waystoneTexture,
      hips,
      [0, 0, 1],
      "carved_elven_waymarker",
    ),
    0.40,
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
  fern([-0.91, 0.082, -0.35], -1, 0.20);
  fern([0.60, 0.082, -0.36], 1, 0.18);
  fern([0.82, 0.082, 0.12], 1, 0.13);
=======
  fern([-0.83, 0.082, -0.25], -1, 0.20);
  fern([-0.87, 0.082, -0.22], 1, 0.13);
  fern([-0.80, 0.082, -0.27], 1, 0.16);
  fern([0.60, 0.082, -0.31], 1, 0.18);
  fern([0.63, 0.082, -0.28], -1, 0.13);
  fern([0.82, 0.082, 0.12], 1, 0.13);
  fern([0.84, 0.082, 0.09], -1, 0.095);
>>>>>>> REPLACE