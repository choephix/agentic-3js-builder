1. **Quiet the bark texture.** The dense, high-contrast grain overwhelms the sculpted shapes. Replace it with broad warm highlights, cool recesses, and restrained grain so the armor-like bark reads clearly.
2. **Uncover the heartwood seal.** The beard currently hides the central emblem. Give the beard a forked silhouette and move the seal into a clearly framed lower-chest recess.
3. **Strengthen the guardian’s proportions.** Broaden the upper trunk and shoulder burls, enlarge the eyes slightly, and add visible moss to the shoulder armor.
4. **Make the crown feel like an ancient oak.** Replace the uniformly flattened foliage clumps with larger, irregular volumes while retaining the exposed branching silhouette.
5. **Add selective woodland character.** Introduce shelf fungi, stronger hanging ferns, and an earthy, mottled floor rather than adding more small details everywhere.

<<<<<<< SEARCH
  const bark = paint((p, n) => {
    const shade = 0.15 + 0.24 * Math.max(0, n.y);
    const base = woodGrain.at(p, n);
    return mix(base, "#bc8b55", shade);
  });
  const oldBark = grain("#302b26", "#604635", {
    size: 0.065,
    axis: "y",
    seed: 21,
  });
=======
  const bark = paint((p, n) => {
    const light = n.x * 0.28 + n.y * 0.76 + n.z * 0.48;
    const broad = noise(p, 0.48, 21);
    const base = light > 0.34
      ? mix("#96683f", "#bd935b", broad * 0.64)
      : light > -0.28
        ? mix("#604634", "#896041", broad * 0.62)
        : mix("#333a32", "#514034", broad * 0.55);
    return mix(base, woodGrain.at(p, n), 0.12);
  });
  const oldBark = paint((p, n) => {
    const broad = noise(p, 0.37, 31);
    const light = Math.max(0, n.y * 0.7 + n.z * 0.3);
    return mix("#30382f", "#6e5037", 0.19 + broad * 0.45 + light * 0.2);
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const earthPaint = mottle("#272e27", "#4c5037", {
    size: 0.24,
    seed: 10,
  });
=======
  const earthPaint = mottle("#272e27", "#4c5037", {
    size: 0.24,
    seed: 10,
  });
  const forestFloor = paint((p, n) => {
    const patches = noise(p, 0.56, 91);
    const soil = mix("#393b2d", "#696044", noise(p, 0.19, 16));
    const green = mix("#354c35", "#657748", noise(p, 0.25, 17));
    return mix(soil, green, Math.max(0, Math.min(1, (patches - 0.35) * 3)))
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
    (t) => [0.57 + 0.16 * Math.sin(t * Math.PI) + 0.07 * t, 0.39 + 0.035 * Math.sin(t * Math.PI)],
=======
    (t) => [0.61 + 0.21 * Math.sin(t * Math.PI) + 0.13 * t, 0.39 + 0.035 * Math.sin(t * Math.PI)],
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(b.part(new THREE.PlaneGeometry(0.355, 0.16), "#ffffff", {
      at: [x, 3.69, 0.492], rotation: [0, 0, s * 15],
      texture: eyeTexture, bone: head, name: `livingEye${s}`,
    }), 1.4);
=======
    glow(b.part(new THREE.PlaneGeometry(0.39, 0.175), "#ffffff", {
      at: [x, 3.69, 0.497], rotation: [0, 0, s * 15],
      texture: eyeTexture, bone: head, name: `livingEye${s}`,
    }), 1.25);
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Root beard: large separated tapered locks, not a carpet of tiny hairs.
  for (let i = -3; i <= 3; i++) {
    const x = i * 0.095;
    const endY = 2.47 + Math.abs(i) * 0.095;
    b.sweep(
      catmull([
        [x, 3.17, 0.48 - Math.abs(i) * 0.015],
        [x * 1.16, 2.97, 0.62],
        [x * 1.17, 2.72 + Math.abs(i) * 0.06, 0.63],
        [x * 0.9, endY, 0.52],
      ]),
      [0.08, 0.075, 0.045, 0.006],
      { color: i % 2 === 0 ? bark : oldBark, bone: jaw, sides: 5,
        smooth: false, caps: "flat", name: `rootBeard${i + 3}` },
    );
  }
=======
  // Forked root beard: a deliberate opening above the living chest seal.
  for (let i = -3; i <= 3; i++) {
    const x = i * 0.095;
    const endY = 2.88 - Math.abs(i) * 0.065;
    b.sweep(
      catmull([
        [x, 3.17, 0.48 - Math.abs(i) * 0.015],
        [x * 1.18, 3.04, 0.62],
        [x * 1.35, endY + 0.12, 0.65],
        [x * 1.48, endY, 0.55],
      ]),
      [0.078, 0.072, 0.039, 0.006],
      { color: i % 2 === 0 ? bark : oldBark, bone: jaw, sides: 5,
        smooth: false, caps: "flat", name: `rootBeard${i + 3}` },
    );
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Exposed heartwood and the ancient, living ward carved into it.
  growthDisc([0, 2.75, 0.445], 0.285, [0, 0, 1], spine.joints[1], "heartwoodGrowthRings");
  b.part(new THREE.CircleGeometry(0.23, 10), C.woodDark, {
    at: [0, 2.75, 0.492], bone: spine.joints[1], name: "sealDarkInset",
  });
  glow(b.part(new THREE.PlaneGeometry(0.46, 0.46), "#ffffff", {
    at: [0, 2.75, 0.496], texture: sealTexture,
    bone: spine.joints[1], name: "emeraldHeartwoodWard",
  }), 1.15);
  for (const s of [-1, 1]) {
    b.sweep(
      [[s * 0.14, 2.36, 0.46], [s * 0.34, 2.57, 0.5],
        [s * 0.34, 2.91, 0.47], [s * 0.22, 3.17, 0.39]],
      [0.085, 0.075, 0.065, 0.045],
      { color: bark, bone: spine.joints[1], sides: 6, smooth: false,
        name: `heartwoodButtress${s}` },
    );
  }
  const fissure = [
    [0, 2.46, 0.438], [-0.075, 2.33, 0.451], [0.02, 2.19, 0.447],
    [-0.055, 2.03, 0.43], [0.02, 1.9, 0.415],
  ];
=======
  // The seal sits in a projecting heartwood knot, clear of both beard and shingles.
  growthDisc([0, 2.38, 0.545], 0.29, [0, 0, 1], spine.joints[1], "heartwoodGrowthRings");
  b.part(new THREE.CircleGeometry(0.235, 12), "#253b32", {
    at: [0, 2.38, 0.59], bone: spine.joints[1], name: "sealDarkInset",
  });
  glow(b.part(new THREE.PlaneGeometry(0.465, 0.465), "#ffffff", {
    at: [0, 2.38, 0.595], texture: sealTexture,
    bone: spine.joints[1], name: "emeraldHeartwoodWard",
  }), 1.1);
  for (const s of [-1, 1]) {
    b.sweep(
      [[s * 0.14, 2.04, 0.46], [s * 0.34, 2.23, 0.53],
        [s * 0.36, 2.58, 0.52], [s * 0.48, 2.9, 0.39]],
      [0.08, 0.075, 0.07, 0.045],
      { color: bark, bone: spine.joints[1], sides: 6, smooth: false,
        name: `heartwoodButtress${s}` },
    );
    b.sweep(
      [[s * 0.4, 2.7, 0.45], [s * 0.54, 2.88, 0.48],
        [s * 0.67, 3.03, 0.38]],
      [0.05, 0.075, 0.035],
      { color: cutWood, bone: spine.joints[1], sides: 5,
        name: `collarGrowthRidge${s}` },
    );
  }
  const fissure = [
    [0, 2.1, 0.49], [-0.055, 2.02, 0.48], [0.02, 1.94, 0.45],
    [-0.025, 1.83, 0.43],
  ];
>>>>>>> REPLACE

<<<<<<< SEARCH
    const shoulder = ellipsoid(`shoulderBurl${suffix}`, [s * 0.84, 3.11, -0.01],
      [0.47, 0.42, 0.45], bark, arm.joints[0], 1);
    const shoulderSkin = b.surface(shoulder);
    plate(shoulderSkin, [s * 0.9, 3.48, 0.2], 0.57, 0.66, 0.16,
      `shoulderShield${suffix}`, bark, [s * 0.65, 0.7, 0]);
=======
    const shoulder = ellipsoid(`shoulderBurl${suffix}`, [s * 0.84, 3.11, -0.01],
      [0.53, 0.46, 0.48], bark, arm.joints[0], 1);
    const shoulderSkin = b.surface(shoulder);
    plate(shoulderSkin, [s * 0.9, 3.48, 0.2], 0.66, 0.72, 0.16,
      `shoulderShield${suffix}`, bark, [s * 0.65, 0.7, 0]);
    const shoulderMossHit = shoulderSkin.nearest([s * 0.8, 3.52, 0.31]);
    b.stick(new THREE.IcosahedronGeometry(1, 0), moss, shoulderMossHit, {
      scale: [0.34, 0.105, 0.27], embed: 0.15, name: `frontShoulderMoss${suffix}`,
    });
    plate(shoulderSkin, [s * 1.08, 3.3, 0.55], 0.31, 0.37, 0.07,
      `shoulderLichenPlate${suffix}`, moss, [s * 0.3, 1, 0]);
>>>>>>> REPLACE

<<<<<<< SEARCH
        size: [0.24, 0.53], lean: 163, bend: 15, flow: [0, 0, 1],
=======
        size: [0.32, 0.67], lean: 163, bend: 15, flow: [0, 0, 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      const scale = i === 4 ? 0.85 : 1;
      const foliage = ellipsoid(
        `oakLeafMass${i}_${j}`,
        p,
        [0.38 * scale, 0.19 * scale, 0.33 * scale],
        (i + j) % 3 === 0 ? C.leafGold : C.leaf,
        site.bone!,
        0,
      );
      ellipsoid(
        `oakLeafMassShadow${i}_${j}`,
        [p.x + 0.12, p.y - 0.06, p.z - 0.07],
        [0.27 * scale, 0.16 * scale, 0.26 * scale],
        C.leafDark,
        site.bone!,
        0,
      );
      const leafHits = b.surface(foliage).scatter(8, {
        rng: random, minDist: 0.095, filter: (h) => h.n.y > -0.3,
      });
      b.cards(leafHits, leafTexture, {
        size: [0.17, 0.29], lean: 67, bend: 15, vary: 0.25, spin: 40,
        rng: random, flow: [0.15, 0.1, 1], name: `crownOakLeaves${i}_${j}`,
      });
=======
      const scale = (i === 4 ? 0.85 : 1) * (0.88 + random() * 0.28);
      const foliage = ellipsoid(
        `oakLeafMass${i}_${j}`,
        [p.x, p.y + 0.035, p.z],
        [0.47 * scale, (j === 1 ? 0.31 : 0.245) * scale, 0.39 * scale],
        (i + j) % 3 === 0 ? C.leafGold : C.leaf,
        site.bone!,
        0,
      );
      ellipsoid(
        `oakLeafMassShadow${i}_${j}`,
        [p.x + 0.15, p.y - 0.075, p.z - 0.09],
        [0.32 * scale, 0.22 * scale, 0.31 * scale],
        C.leafDark,
        site.bone!,
        0,
      );
      ellipsoid(
        `oakLeafMassHighlight${i}_${j}`,
        [p.x - 0.13, p.y + 0.15 * scale, p.z + 0.09],
        [0.29 * scale, 0.14 * scale, 0.25 * scale],
        (i + j) % 2 === 0 ? C.leafGold : C.mossLight,
        site.bone!,
        0,
      );
      const leafHits = b.surface(foliage).scatter(12, {
        rng: random, minDist: 0.11, filter: (h) => h.n.y > -0.35,
      });
      b.cards(leafHits, leafTexture, {
        size: [0.19, 0.32], lean: 67, bend: 15, vary: 0.3, spin: 40,
        rng: random, flow: [0.15, 0.1, 1], name: `crownOakLeaves${i}_${j}`,
      });
>>>>>>> REPLACE

<<<<<<< SEARCH
  // A broken branch on the back tells the story of a very old survivor.
=======
  // A handful of broad shelf fungi punctuate the wood with aged ivory and rust.
  const fungusSites = [
    { point: [-0.83, 2.18, 0.14], radius: 0.17 },
    { point: [-0.83, 2.0, 0.13], radius: 0.13 },
    { point: [-0.78, 1.85, 0.10], radius: 0.09 },
    { point: [0.79, 2.56, -0.22], radius: 0.13 },
    { point: [0.78, 2.39, -0.25], radius: 0.17 },
  ];
  for (let i = 0; i < fungusSites.length; i++) {
    const { point, radius } = fungusSites[i];
    const hit = trunkSkin.nearest(point);
    const center = hit.at.clone().addScaledVector(hit.n, radius * 0.37);
    const bone = hit.bone!;
    ellipsoid(`shelfFungusIvoryRim${i}`, center,
      [radius, 0.047, radius * 0.83], "#ccb783", bone, 1);
    ellipsoid(`shelfFungusRustCap${i}`,
      center.clone().add(new THREE.Vector3(0, 0.028, 0)),
      [radius * 0.87, 0.041, radius * 0.72], "#965832", bone, 1);
    ellipsoid(`shelfFungusOldCenter${i}`,
      center.clone().add(new THREE.Vector3(0, 0.055, 0)),
      [radius * 0.46, 0.021, radius * 0.40], "#684634", bone, 0);
  }

  // A broken branch on the back tells the story of a very old survivor.
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.CylinderGeometry(1, 1, 0.035, 12), C.mossDark, {
=======
  b.part(new THREE.CylinderGeometry(1, 1, 0.035, 12), forestFloor, {
>>>>>>> REPLACE

<<<<<<< SEARCH
  const forestFloor = paint((p, n) => {
=======
  const forestFloor = paint((p, _n) => {
>>>>>>> REPLACE