1. **Refine the face:** soften the severe faceted shading, reduce the protruding lower jaw, and enlarge the eyes slightly for a stronger anime expression.
2. **Restore the leaf-armour silhouette:** bring the buried shoulder and skirt plates forward, with their edging attached to the actual panels.
3. **Improve materials:** replace the noisy, bark-like leather with restrained warm leather; quiet the bow’s wood grain.
4. **Fix floating details:** seat the bow ornaments directly on its limbs, support the quiver, and attach the tabard to the belt.
5. **Finish the setting:** connect the fern leaflets to their stems rather than leaving disconnected green fragments.

<<<<<<< SEARCH
  const skin = cel(C.skin, "#dca7a0");
=======
  const skin = paint((_p, n) =>
    mix("#dcae9e", "#ffe0c5", Math.max(0, Math.min(1, 0.62 + n.y * 0.22 + n.z * 0.18)))
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
  const leather = grain("#553a2f", "#79553b", { size: 0.014, axis: "y", seed: 8 });
  const wood = grain("#7a4931", "#d7a465", { size: 0.019, axis: "y", seed: 7 });
=======
  const leather = paint((p, n) =>
    mix("#513b32", "#806047",
      Math.max(0, Math.min(1, 0.42 + n.y * 0.2 + noise(p, 0.038, 8) * 0.22)))
  );
  const wood = grain("#91623e", "#b78b58", { size: 0.034, axis: "y", seed: 7 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const skull = ellipsoid("face", [0, 1.732, 0.019], [0.143, 0.177, 0.119], skin, head);
  ellipsoid("separate_lower_jaw", [0, 1.631, 0.049], [0.092, 0.069, 0.085], skin, jaw);
=======
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), skin, {
    at: [0, 1.732, 0.019], scale: [0.143, 0.177, 0.119],
    bone: head, name: "face"
  });
  b.part(new THREE.SphereGeometry(1, 12, 8), skin, {
    at: [0, 1.631, 0.035], scale: [0.077, 0.057, 0.076],
    bone: jaw, name: "separate_lower_jaw"
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
      dir: [s * 0.12, 0, 1], size: [0.087, 0.115],
=======
      dir: [s * 0.12, 0, 1], size: [0.096, 0.124],
>>>>>>> REPLACE

<<<<<<< SEARCH
      leafPlate(`shoulder_leaf_${side}_${i}`, [x, 1.354 - i * 0.013, 0.043],
        0.123 - i * 0.013, 0.143 - i * 0.012,
        i % 2 ? greenLight : green, arm.joints[0],
        [s, 0, 0], [s * 0.25, 1, -0.12]);
      b.rod([x, 1.365 - i * 0.013, 0.057], [x + s * 0.023, 1.474 - i * 0.023, 0.043],
        0.003, { color: C.gold, bone: arm.joints[0], sides: 5 });
=======
      const shoulderPlate = leafPlate(
        `shoulder_leaf_${side}_${i}`,
        [x, 1.335 - i * 0.018, 0.082],
        0.132 - i * 0.013, 0.145 - i * 0.012,
        i % 2 ? greenLight : green, arm.joints[0],
        [s, 0, 0], [s * 0.25, 1, -0.12]
      );
      const front = s * 0.012;
      const plateHeight = 0.145 - i * 0.012;
      b.rod(
        shoulderPlate.local([0, 0.018, front]),
        shoulderPlate.local([0, plateHeight * 0.87, front]),
        0.0035, { color: C.gold, bone: arm.joints[0], sides: 5 }
      );
      bead(shoulderPlate.local([0, plateHeight * 0.65, front]),
        0.006, C.lightGold, arm.joints[0]);
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.extrude([
      [-0.055, 0], [-0.109, -0.22], [-0.016, -0.33],
      [0.069, -0.235], [0.067, 0]
    ], {
      at: [s * 0.104, 1.02, 0.016], x: [s, 0, 0], y: [0, 1, -0.22],
      thickness: 0.035, bevel: 0.005, color: green, bone: hips, name: `split_tunic_${s}`
    });
    b.sweep([
      [s * 0.165, 1.015, 0.046], [s * 0.211, 0.802, 0.097], [s * 0.121, 0.707, 0.115]
    ], 0.006, { color: C.gold, bone: hips, sides: 5 });
=======
    const skirt = b.extrude([
      [-0.055, 0], [-0.072, -0.22], [-0.016, -0.33],
      [0.105, -0.235], [0.067, 0]
    ], {
      at: [s * 0.104, 1.02, 0.105], x: [s, 0, 0], y: [0, 1, -0.22],
      thickness: 0.025, bevel: 0.004, color: green, bone: hips, name: `split_tunic_${s}`
    });
    b.sweep([
      skirt.local([0.06, -0.012, s * 0.014]),
      skirt.local([0.099, -0.231, s * 0.014]),
      skirt.local([-0.016, -0.319, s * 0.014])
    ], 0.005, { color: C.gold, bone: hips, sides: 5 });
    b.sweep([
      skirt.local([0.012, -0.035, s * 0.014]),
      skirt.local([0.025, -0.16, s * 0.014]),
      skirt.local([-0.013, -0.29, s * 0.014])
    ], 0.003, { color: "#8dbb84", bone: hips, sides: 5 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  drawing("tabard_brocade", brocade, [0, 0.87, 0.139], 0.14, 0.264, hips);

  const beltLoop = b.surface(torso).loop([0, 1.055, 0], { dir: [0, 1, 0], lift: 0.006 });
=======
  drawing("tabard_brocade", brocade, [0, 0.87, 0.139], 0.14, 0.264, hips);
  for (const s of [1, -1]) {
    box(`tabard_belt_loop_${s}`, [s * 0.052, 1.025, 0.12],
      [0.023, 0.07, 0.022], leather, hips);
    bead([s * 0.052, 1.005, 0.135], 0.0055, gold, hips);
  }

  const beltLoop = b.surface(torso).loop([0, 1.055, 0], { dir: [0, 1, 0], lift: 0.006 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const quiverB = new THREE.Vector3(-0.313, 1.563, -0.243);
  b.sweep([quiverA, quiverB], [0.071, 0.083], {
=======
  const quiverB = new THREE.Vector3(-0.313, 1.563, -0.243);
  b.sweep([
    [-0.155, 1.405, 0.075], [-0.186, 1.445, -0.035],
    [-0.215, 1.424, -0.143], [-0.259, 1.391, -0.221]
  ], 0.019, {
    color: leather, bone: spine.joints[1], sides: 6, name: "quiver_upper_suspension"
  });
  b.sweep([
    [-0.116, 1.077, -0.049], [-0.142, 1.09, -0.125],
    [-0.177, 1.125, -0.211]
  ], 0.018, {
    color: leather, bone: spine.joints[1], sides: 6, name: "quiver_lower_suspension"
  });
  b.sweep([quiverA, quiverB], [0.071, 0.083], {
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const s of [1, -1]) {
    leafPlate(`bow_leaf_fitting_${s}`, [bowX + 0.063, bowY + s * 0.29 - 0.065, bowZ + 0.016],
      0.075, 0.13, gold, bowHand);
    bead([bowX + 0.071, bowY + s * 0.29, bowZ + 0.034], 0.019, "#64bea9", bowHand);
    glow(drawing(`bow_runes_${s}`, runes,
      [bowX + 0.105, bowY + s * 0.39, bowZ + 0.025], 0.025, 0.15, bowHand), 0.6);
    bead([bowX - 0.037, bowY + s * 0.64, bowZ], 0.017, gold, bowHand);
  }
=======
  const bowSurface = b.surface(bow);
  for (const s of [1, -1]) {
    const seat = bowSurface.nearest([bowX + 0.14, bowY + s * 0.29, bowZ + 0.07]);
    const fitting = leafPlate(
      `bow_leaf_fitting_${s}`,
      [seat.at.x, seat.at.y - 0.049, seat.at.z + 0.004],
      0.052, 0.098, gold, bowHand
    );
    bead(fitting.local([0, 0.051, 0.014]), 0.014, "#64bea9", bowHand);
    glow(b.decal(bow, runes, {
      at: [bowX + 0.105, bowY + s * 0.40, bowZ + 0.065],
      dir: [0, 0, 1], size: [0.021, 0.135],
      segments: 10, lift: 0.0015, bone: bowHand, name: `bow_runes_${s}`
    }), 0.8);
    bead([bowX - 0.037, bowY + s * 0.64, bowZ], 0.017, gold, bowHand);
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.sweep(bezier(root, [x, 0.11 + size * 0.75, z], tip), [0.003, 0.001], {
        color: "#86a66d", bone: hips, sides: 4
      });
      for (let k = 1; k <= 3; k++) {
        const t = k / 4;
        const px = x + (tip[0] - x) * t;
        const py = 0.11 + size * 0.65 * Math.sin(t * Math.PI * 0.7);
        const pz = z + (tip[2] - z) * t;
=======
      const frondPath = bezier(root, [x, 0.11 + size * 0.75, z], tip);
      b.sweep(frondPath, [0.003, 0.001], {
        color: "#86a66d", bone: hips, sides: 4
      });
      for (let k = 1; k <= 3; k++) {
        const t = k / 4;
        const attachment = frondPath.at(t);
        const px = attachment.x;
        const py = attachment.y;
        const pz = attachment.z;
>>>>>>> REPLACE