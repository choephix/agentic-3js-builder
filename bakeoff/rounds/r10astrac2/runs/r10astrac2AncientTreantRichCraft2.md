1. **Give the guardian more weight from the side.** Add a gnarled rear trunk and root buttresses; the current torso reads too much like a thin suit of armor.
2. **Make the face sterner and less mechanical.** Shorten the projecting nose, straighten the smiling mouth, and soften the uniform tooth-and-beard rhythm.
3. **Make the bark read as ancient wood, not plain polygonal plating.** Paint long branching fissures with restrained worn-edge highlights, and add a few deeper structural splits.
4. **Open up the crown.** Expose the tallest fork, thin the rear foliage, introduce muted autumn gold, and reduce the overly bright leaf-vein contrast.
5. **Integrate the magic and vegetation.** Let subtle sap-light escape through shoulder cracks, add moss to the beard tips, and hang two small acorn clusters from the crown.

<<<<<<< SEARCH
    return mix(base, woodGrain.at(p, n), 0.12);
=======
    const timber = mix(base, woodGrain.at(p, n), 0.19);
    // Long, wandering cracks; their spacing stays consistent across the shingles.
    const across = Math.abs(n.x) > Math.abs(n.z)
      ? p.z + p.x * 0.16
      : p.x + p.z * 0.16;
    const wander =
      0.032 * Math.sin(p.y * 4.1 + across * 3.0) +
      0.014 * Math.sin(p.y * 10.8 + across * 12.0);
    const phase = (across + wander) / 0.145;
    const distance = Math.abs(phase - Math.round(phase));
    const gate = noise(p, 0.35, 118);
    const crackWidth = 0.025 + gate * 0.04;
    const verticalFace = 1 - Math.abs(n.y);
    if (verticalFace > 0.36 && gate > 0.28 && distance < crackWidth)
      return mix("#292e26", timber, 0.17);
    if (verticalFace > 0.42 && gate > 0.31 &&
        distance >= crackWidth && distance < crackWidth + 0.032)
      return mix(timber, "#c39a61", 0.36);
    return timber;
>>>>>>> REPLACE

<<<<<<< SEARCH
      <path d="M48 13 L48 147" fill="none" stroke="#dac985" stroke-width="4"/>
=======
      <path d="M48 13 L48 147" fill="none" stroke="#b3b475" stroke-width="3"/>
>>>>>>> REPLACE

<<<<<<< SEARCH
        stroke="#c0b66c" stroke-width="3" fill="none"/>
      <path d="M51 19 L57 28 L51 123Z" fill="#b3b65c"/>
=======
        stroke="#a4a365" stroke-width="2.5" fill="none"/>
      <path d="M51 19 L57 28 L51 123Z" fill="#a2aa58"/>
>>>>>>> REPLACE

<<<<<<< SEARCH
  const trunkSkin = b.surface(trunk);
  b.sweep(neck, [0.34, 0.35], {
=======
  const trunkSkin = b.surface(trunk);

  // The rear of an old oak is a substantial trunk, not the back of a breastplate.
  const rearTrunk = b.sweep(
    catmull([
      [0, 1.87, -0.23],
      [0, 2.22, -0.37],
      [0, 2.68, -0.36],
      [0, 3.03, -0.18],
    ]),
    (t) => [
      0.43 + Math.sin(t * Math.PI) * 0.13,
      0.29 + Math.sin(t * Math.PI) * 0.075,
    ],
    {
      bone: spine, color: oldBark, sides: 7, smooth: false,
      caps: "round", name: "heavyRearTrunk",
    },
  );
  const rearSkin = b.surface(rearTrunk);
  for (let row = 0; row < 3; row++) {
    for (const side of [-1, 1]) {
      plate(
        rearSkin,
        [side * 0.26, 2.04 + row * 0.34, -1],
        0.43, 0.64, 0.12,
        `rearTrunkRidge${row}_${side}`,
        bark,
        [side * 0.18, 1, 0],
      );
    }
  }
  for (const side of [-1, 1]) {
    b.sweep(
      catmull([
        [side * 0.45, 1.73, -0.18],
        [side * 0.56, 2.05, -0.4],
        [side * 0.57, 2.51, -0.42],
        [side * 0.71, 2.99, -0.16],
      ]),
      [0.14, 0.17, 0.16, 0.11],
      {
        bone: spine, color: bark, sides: 5, smooth: false,
        name: `rearRootButtress${side}`,
      },
    );
  }

  b.sweep(neck, [0.34, 0.35], {
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(
      [[s * 0.4, 3.48, 0.46], [s * 0.36, 3.32, 0.54], [s * 0.24, 3.23, 0.58]],
      [0.055, 0.033],
      { color: oldBark, bone: head, sides: 5, name: `cheekFurrow${s}` },
    );
=======
    b.sweep(
      [[s * 0.4, 3.49, 0.46], [s * 0.34, 3.39, 0.54], [s * 0.29, 3.25, 0.56]],
      [0.054, 0.028],
      { color: oldBark, bone: head, sides: 5, name: `cheekFurrow${s}` },
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
    [[-0.095, 0.24], [-0.125, -0.02], [-0.19, -0.14], [-0.075, -0.19],
      [0, -0.135], [0.075, -0.19], [0.19, -0.14], [0.125, -0.02], [0.095, 0.24]],
    {
      at: [0, 3.51, 0.535], x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.21, bevel: 0.025, color: bark, bone: head, name: "forkedTimberNose",
    },
  );
  b.sweep([[0, 3.76, 0.65], [-0.025, 3.55, 0.66], [0, 3.38, 0.66]],
    [0.022, 0.012], { color: C.woodEdge, bone: head, sides: 5, name: "noseRidge" });
  for (const s of [1, -1]) {
    ellipsoid(`nostril${s}`, [s * 0.111, 3.365, 0.651],
      [0.047, 0.025, 0.017], C.deepest, head);
  }
=======
    [[-0.075, 0.24], [-0.095, -0.02], [-0.155, -0.12], [-0.064, -0.17],
      [0, -0.125], [0.064, -0.17], [0.155, -0.12], [0.095, -0.02], [0.075, 0.24]],
    {
      at: [0, 3.51, 0.535], x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.145, bevel: 0.018, color: bark, bone: head, name: "forkedTimberNose",
    },
  );
  b.sweep([[0, 3.75, 0.614], [-0.017, 3.55, 0.62], [0, 3.39, 0.62]],
    [0.018, 0.009], { color: C.woodEdge, bone: head, sides: 5, name: "noseRidge" });
  for (const s of [1, -1]) {
    ellipsoid(`nostril${s}`, [s * 0.092, 3.365, 0.61],
      [0.032, 0.017, 0.011], C.deepest, head);
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
    [[-0.32, 3.31, 0.49], [-0.16, 3.285, 0.59], [0, 3.30, 0.6],
      [0.16, 3.285, 0.59], [0.32, 3.31, 0.49]],
=======
    [[-0.32, 3.245, 0.49], [-0.16, 3.285, 0.59], [0, 3.295, 0.6],
      [0.16, 3.285, 0.59], [0.32, 3.245, 0.49]],
>>>>>>> REPLACE

<<<<<<< SEARCH
    [[-0.28, 3.20, 0.49], [-0.13, 3.18, 0.59], [0.13, 3.18, 0.59], [0.28, 3.20, 0.49]],
=======
    [[-0.28, 3.185, 0.49], [-0.13, 3.205, 0.59], [0.13, 3.205, 0.59], [0.28, 3.185, 0.49]],
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike([s * 0.095, 3.18, 0.6], [s * 0.09, 3.265, 0.6], null, 0.032,
=======
    b.spike([s * 0.095, 3.20, 0.6], [s * 0.09, s === 1 ? 3.245 : 3.23, 0.6], null, 0.026,
>>>>>>> REPLACE

<<<<<<< SEARCH
    const endY = 2.88 - Math.abs(i) * 0.065;
=======
    const endY = 2.88 - Math.abs(i) * 0.065 + (i % 2 === 0 ? 0.035 : -0.045);
>>>>>>> REPLACE

<<<<<<< SEARCH
  plate(b.surface(lowerJaw), [0, 3.08, 0.9], 0.24, 0.27, 0.06, "chinHeartwood", cutWood);
=======
  plate(b.surface(lowerJaw), [0, 3.08, 0.9], 0.24, 0.27, 0.06, "chinHeartwood", bark);

  // Moss-grown whisker roots frame, rather than obscure, the heart seal.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 2; i++) {
      const x = s * (0.30 + i * 0.055);
      b.sweep(
        catmull([
          [x, 3.13 - i * 0.04, 0.45],
          [x + s * 0.035, 2.97, 0.55],
          [x + s * 0.07, 2.78 - i * 0.055, 0.55],
          [x + s * 0.035, 2.67 - i * 0.045, 0.49],
        ]),
        [0.043, 0.038, 0.024, 0.003],
        {
          bone: jaw, color: moss, sides: 5, smooth: false,
          caps: "flat", name: `mossBeardTress${s}_${i}`,
        },
      );
    }
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
    growthDisc([s * 1.33, 3.0, 0.272], 0.13, [0, 0, 1],
      arm.joints[1], `elbowKnot${suffix}`);
=======
    // Deep structural cracks are seated on the burl, not floating in front of it.
    const scar = shoulderSkin.drape(
      [
        [s * 0.72, 3.33, 0.52],
        [s * 0.82, 3.23, 0.57],
        [s * 0.77, 3.13, 0.58],
        [s * 0.91, 3.01, 0.55],
      ],
      { lift: 0.016 },
    );
    b.sweep(scar, 0.026, {
      color: C.deepest, bone: arm.joints[0], sides: 5,
      name: `shoulderAncientSplit${suffix}`,
    });
    glow(b.sweep(scar.slice(0.24, 0.81), 0.010, {
      color: "#43b995", bone: arm.joints[0], sides: 5,
      name: `shoulderSapGlimmer${suffix}`,
    }), 0.65);

    growthDisc([s * 1.33, 3.0, 0.272], 0.13, [0, 0, 1],
      arm.joints[1], `elbowKnot${suffix}`);
>>>>>>> REPLACE

<<<<<<< SEARCH
    const leafSites = i === 2
      ? [forks[0].at(0.87)]
      : [main.at(0.78), forks[0].at(0.72), forks[1].at(0.88)];
=======
    const leafSites = i === 2
      ? []
      : i === 3
        ? [main.at(0.87), forks[0].at(0.8)]
        : [main.at(0.78), forks[0].at(0.72), forks[1].at(0.88)];
>>>>>>> REPLACE

<<<<<<< SEARCH
        (i + j) % 3 === 0 ? C.leafGold : C.leaf,
=======
        i === 4 ? "#a18b3e" : (i + j) % 3 === 0 ? C.leafGold : C.leaf,
>>>>>>> REPLACE

<<<<<<< SEARCH
        (i + j) % 2 === 0 ? C.leafGold : C.mossLight,
=======
        i === 4 ? "#c2a354" : (i + j) % 2 === 0 ? C.leafGold : C.mossLight,
>>>>>>> REPLACE

<<<<<<< SEARCH
      const leafHits = b.surface(foliage).scatter(12, {
        rng: random, minDist: 0.11, filter: (h) => h.n.y > -0.35,
      });
      b.cards(leafHits, leafTexture, {
        size: [0.19, 0.32], lean: 67, bend: 15, vary: 0.3, spin: 40,
=======
      const leafHits = b.surface(foliage).scatter(9, {
        rng: random, minDist: 0.13, filter: (h) => h.n.y > -0.35,
      });
      b.cards(leafHits, leafTexture, {
        size: [0.19, 0.32], lean: 76, bend: 15, vary: 0.3, spin: 40,
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Moss follows selected body surfaces, avoiding facial features and the seal.
=======
  // Oversized old-oak acorns: small narrative accents beneath the outer forks.
  for (const index of [0, 1]) {
    const fork = crown[index].forks[0];
    const root = fork.at(0.65);
    for (let nut = 0; nut < 2; nut++) {
      const side = index === 0 ? -1 : 1;
      const p = root.at.clone().add(new THREE.Vector3(
        side * (0.08 + nut * 0.13), -0.19 - nut * 0.07, 0.1,
      ));
      b.sweep(
        [root, p.clone().add(new THREE.Vector3(0, 0.035, 0))],
        [0.018, 0.012],
        {
          bone: root.bone!, color: oldBark, sides: 5, caps: "flat",
          name: `acornStem${index}_${nut}`,
        },
      );
      ellipsoid(
        `acornCup${index}_${nut}`, p,
        [0.085, 0.053, 0.085], oldBark, root.bone!, 1,
      );
      ellipsoid(
        `acornNut${index}_${nut}`,
        p.clone().add(new THREE.Vector3(0, -0.083, 0)),
        [0.064, 0.105, 0.064], cutWood, root.bone!, 1,
      );
    }
  }

  // Moss follows selected body surfaces, avoiding facial features and the seal.
>>>>>>> REPLACE