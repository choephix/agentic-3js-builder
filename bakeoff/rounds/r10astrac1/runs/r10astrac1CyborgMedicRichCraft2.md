1. **Refine the face:** enlarge the eyes, soften the protruding cheeks and muzzle, and replace the pointed nose with a shaped bridge. The expression should read as a confident medic, not a mask.
2. **Fix the hair silhouette:** shorten the backward-projecting blades and overlap them into a deliberate swept quiff.
3. **Strengthen the hero proportions:** give the shoulders more substantial armor and frame the exposed neck with a protective collar.
4. **Make the equipment feel manufactured:** recess the wrist display into a proper bezel, add shoulder fasteners, and build a visible emergency-dose rack.
5. **Improve presentation:** expose the plinth’s partially buried identification plaque and add restrained illuminated deck markings.

<<<<<<< SEARCH
  ellipsoid("upper_muzzle", [0, 1.795, 0.113], [0.057, 0.029, 0.025], skinPaint, head);
=======
  ellipsoid("upper_muzzle", [0, 1.795, 0.105], [0.047, 0.021, 0.019], skinPaint, head);
>>>>>>> REPLACE

<<<<<<< SEARCH
    [[-0.096, 0.045], [-0.082, -0.028], [-0.047, -0.065], [0.047, -0.065], [0.082, -0.028], [0.096, 0.045]],
    [0, 1.79, 0.065], 0.091, skinPaint, jaw,
=======
    [[-0.085, 0.041], [-0.073, -0.025], [-0.042, -0.06], [0.042, -0.06], [0.073, -0.025], [0.085, 0.041]],
    [0, 1.79, 0.061], 0.079, skinPaint, jaw,
>>>>>>> REPLACE

<<<<<<< SEARCH
    [[-0.039, 1.782, 0.135], [0, 1.779, 0.141], [0.039, 1.782, 0.135]],
    0.0032,
=======
    [[-0.035, 1.786, 0.12], [-0.012, 1.781, 0.125], [0.012, 1.781, 0.125], [0.035, 1.786, 0.12]],
    0.0025,
>>>>>>> REPLACE

<<<<<<< SEARCH
    [[-0.022, 1.77, 0.135], [0, 1.766, 0.139], [0.022, 1.77, 0.135]],
    0.0025,
=======
    [[-0.02, 1.775, 0.119], [0, 1.772, 0.123], [0.02, 1.775, 0.119]],
    0.002,
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.ConeGeometry(0.022, 0.053, 4), skinPaint, {
    bone: head, at: [0, 1.838, 0.137], rotation: [-22, 45, 180], name: "angular_nose",
  });
=======
  b.loft(
    [
      { at: [0, 1.88, 0.119], w: 0.017, h: 0.016 },
      { at: [0, 1.85, 0.133], w: 0.021, h: 0.022 },
      { at: [0, 1.826, 0.143], w: 0.031, h: 0.022 },
      { at: [0, 1.817, 0.127], w: 0.027, h: 0.013 },
    ],
    {
      bone: head, color: skinPaint, section: { ngon: 6 },
      caps: "flat", name: "sculpted_nose_bridge",
    },
  );
  for (const s of sides) {
    ellipsoid(
      `nostril_${s}`, [s * 0.011, 1.818, 0.137],
      [0.004, 0.0025, 0.003], C.lip, head, 6,
    );
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
      `cheek_${s}`, [s * 0.093, 1.814, 0.073], [0.041, 0.036, 0.035], skinPaint, head,
=======
      `cheek_${s}`, [s * 0.087, 1.821, 0.068], [0.034, 0.03, 0.023], skinPaint, head,
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: [s * 0.061, 1.877, 0.13],
      dir: [s * 0.13, 0, 1],
      size: [0.086, 0.043],
=======
      at: [s * 0.059, 1.878, 0.13],
      dir: [s * 0.13, 0, 1],
      size: [0.096, 0.054],
>>>>>>> REPLACE

<<<<<<< SEARCH
    const mark = b.surface(cheek).nearest([s * 0.107, 1.817, 0.12]);
    b.stick(new THREE.BoxGeometry(0.023, 0.003, 0.006), C.orange, mark, {
=======
    const mark = b.surface(cheek).nearest([s * 0.097, 1.822, 0.105]);
    b.stick(new THREE.BoxGeometry(0.018, 0.002, 0.004), C.orange, mark, {
>>>>>>> REPLACE

<<<<<<< SEARCH
  const hairBlades = [
    { x: -0.092, w: 0.057, top: 2.059, tip: -0.148, z: 0.054 },
    { x: -0.047, w: 0.066, top: 2.09, tip: -0.097, z: 0.064 },
    { x: 0.005, w: 0.068, top: 2.104, tip: -0.035, z: 0.064 },
    { x: 0.056, w: 0.062, top: 2.086, tip: 0.032, z: 0.05 },
    { x: 0.098, w: 0.049, top: 2.052, tip: 0.079, z: 0.027 },
  ];
=======
  const hairBlades = [
    { x: -0.092, w: 0.066, top: 2.042, tip: -0.098, z: 0.046 },
    { x: -0.047, w: 0.077, top: 2.071, tip: -0.063, z: 0.07 },
    { x: 0.005, w: 0.081, top: 2.081, tip: -0.023, z: 0.077 },
    { x: 0.056, w: 0.075, top: 2.062, tip: 0.024, z: 0.059 },
    { x: 0.098, w: 0.058, top: 2.033, tip: 0.067, z: 0.027 },
  ];
>>>>>>> REPLACE

<<<<<<< SEARCH
        { at: [h.x, 1.961, h.z], w: h.w, h: 0.052 },
        { at: [h.x - 0.014, h.top - 0.016, h.z - 0.037], w: h.w * 1.05, h: 0.059 },
        { at: [h.tip, h.top, -0.11], w: h.w * 0.65, h: 0.039 },
        { at: [h.tip - 0.017, h.top - 0.023, -0.159], w: 0.009, h: 0.008 },
=======
        { at: [h.x, 1.974, h.z], w: h.w, h: 0.047 },
        { at: [h.x - 0.014, h.top - 0.018, h.z - 0.023], w: h.w * 1.06, h: 0.054 },
        { at: [h.tip, h.top - 0.018, -0.061], w: h.w * 0.79, h: 0.042 },
        { at: [h.tip - 0.008, h.top - 0.055, -0.114], w: 0.025, h: 0.017 },
>>>>>>> REPLACE

<<<<<<< SEARCH
  const chestBone = spine.joints[2];
  panel(
    "chest_teal_carrier",
=======
  const chestBone = spine.joints[2];

  // A protective collar bridges the apparent long neck without obstructing
  // the chin or changing the neutral skeleton.
  for (const s of sides) {
    b.loft(
      [
        { at: [s * 0.104, 1.579, 0.012], w: 0.08, h: 0.145 },
        { at: [s * 0.104, 1.652, -0.002], w: 0.054, h: 0.123 },
        { at: [s * 0.088, 1.719, -0.027], w: 0.033, h: 0.083 },
      ],
      {
        bone: chestBone, color: armorPaint, section: { ngon: 6 },
        caps: "flat", name: `raised_rescue_collar_${s}`,
      },
    );
    b.sweep(
      [
        [s * 0.12, 1.613, 0.073],
        [s * 0.112, 1.662, 0.058],
        [s * 0.09, 1.709, 0.018],
      ],
      0.008,
      {
        bone: chestBone, color: C.teal, sides: 6,
        name: `collar_soft_edge_${s}`,
      },
    );
    luminousBar(
      `collar_link_${s}`, [s * 0.113, 1.649, 0.064],
      [0.012, 0.028, 0.006], chestBone,
    );
  }
  panel(
    "chest_teal_carrier",
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(
      [[s * 0.318, 1.55, -0.012], [s * 0.446, 1.55, -0.012]],
      () => [0.12, 0.127],
      { color: armorPaint, bone: upper, section: { ngon: 6 }, caps: "flat", name: `pauldron_${side}` },
    );
=======
    b.loft(
      [
        { at: [s * 0.286, 1.548, -0.012], w: 0.197, h: 0.2 },
        { at: [s * 0.348, 1.566, -0.012], w: 0.26, h: 0.267 },
        { at: [s * 0.431, 1.557, -0.012], w: 0.248, h: 0.247 },
        { at: [s * 0.477, 1.534, -0.012], w: 0.178, h: 0.173 },
      ],
      {
        color: armorPaint, bone: upper, section: { ngon: 8 },
        caps: "flat", name: `pauldron_${side}`,
      },
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
    box(`shoulder_top_stripe_${side}`, [s * 0.385, 1.678, -0.012], [0.084, 0.013, 0.071], C.orange, upper);

    b.sweep(arm, 0.06, {
=======
    box(`shoulder_top_stripe_${side}`, [s * 0.385, 1.695, -0.012], [0.072, 0.012, 0.071], C.orange, upper);
    b.sweep(
      [
        [s * 0.466, 1.592, 0.074],
        [s * 0.484, 1.536, 0.081],
        [s * 0.458, 1.475, 0.072],
      ],
      0.012,
      { color: C.deepTeal, bone: upper, sides: 6, name: `pauldron_outer_trim_${side}` },
    );
    for (const dx of [-0.055, 0.055]) {
      bolt(
        `shoulder_fixing_${side}_${dx}`,
        [s * 0.384 + dx, 1.584, 0.125], upper, 0.007,
      );
    }

    b.sweep(arm, 0.06, {
>>>>>>> REPLACE

<<<<<<< SEARCH
      glow(drawing("wrist_vitals", monitorTex, [0.831, 1.517, 0.109], 0.098, 0.118, lower), 0.65);
      for (let i = 0; i < 3; i++) {
=======
      glow(drawing("wrist_vitals", monitorTex, [0.831, 1.517, 0.109], 0.086, 0.108, lower), 0.65);
      for (const dx of [-0.055, 0.055]) {
        box(
          `monitor_bezel_vertical_${dx}`,
          [0.831 + dx, 1.517, 0.112],
          [0.012, 0.129, 0.014], C.shadow, lower,
        );
      }
      for (const dy of [-0.06, 0.06]) {
        box(
          `monitor_bezel_horizontal_${dy}`,
          [0.831, 1.517 + dy, 0.112],
          [0.098, 0.011, 0.014], C.shadow, lower,
        );
      }
      for (let i = 0; i < 3; i++) {
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Healing staff: an unmistakable tall, open tuning-fork silhouette.
=======
  // Emergency-dose rack: three protected ampoules, readable from the front.
  // It occupies the outside of the thigh rather than the central leg gap.
  const rackBone = limbs[1].leg.joints[0];
  box(
    "dose_rack_backplate", [-0.274, 0.913, 0.055],
    [0.13, 0.18, 0.037], C.navy, rackBone, [0, 0, -7],
  );
  for (let i = 0; i < 3; i++) {
    const x = -0.315 + i * 0.04;
    cylinder(
      `dose_ampoule_${i}`, [x, 0.913, 0.086],
      0.014, 0.113, C.shadow, rackBone, [0, 1, 0], 8,
    );
    glow(cylinder(
      `dose_solution_${i}`, [x, 0.914, 0.086],
      0.0145, 0.047, C.cyan, rackBone, [0, 1, 0], 8,
    ), 0.7);
    cylinder(
      `dose_cap_${i}`, [x, 0.977, 0.086],
      0.017, 0.02, C.orange, rackBone, [0, 1, 0], 8,
    );
    cylinder(
      `dose_base_${i}`, [x, 0.851, 0.086],
      0.016, 0.018, C.paleSteel, rackBone, [0, 1, 0], 8,
    );
  }
  for (const y of [0.875, 0.948]) {
    box(
      `dose_retaining_bar_${y}`, [-0.275, y, 0.102],
      [0.126, 0.014, 0.012], C.deepTeal, rackBone,
    );
  }

  // Healing staff: an unmistakable tall, open tuning-fork silhouette.
>>>>>>> REPLACE

<<<<<<< SEARCH
  box("front_plaque_back", [0.1, 0.065, 0.649], [0.422, 0.074, 0.018], C.dark, baseBone);
  drawing("front_plaque", serialTex, [0.1, 0.065, 0.66], 0.387, 0.065, baseBone);
=======
  box("front_plaque_back", [0.1, 0.065, 0.675], [0.422, 0.074, 0.018], C.dark, baseBone);
  drawing("front_plaque", serialTex, [0.1, 0.065, 0.686], 0.387, 0.065, baseBone);

  // A thin, broken launch-pad outline puts the visual emphasis beneath
  // the hero rather than on the broad empty ends of the platform.
  for (const s of sides) {
    glow(b.sweep(
      [
        [s * 0.38, 0.126, 0.36],
        [s * 0.49, 0.126, 0.28],
        [s * 0.49, 0.126, -0.13],
      ],
      0.004,
      {
        bone: baseBone, color: C.cyan, sides: 5,
        name: `deployment_outline_${s}`,
      },
    ), 0.6);
    for (let i = 0; i < 3; i++) {
      box(
        `deployment_caution_${s}_${i}`,
        [s * (0.54 + i * 0.033), 0.125, 0.17],
        [0.016, 0.003, 0.055], C.orange, baseBone, [0, 25, 0],
      );
    }
  }
>>>>>>> REPLACE