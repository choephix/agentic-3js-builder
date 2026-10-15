1. **Repair the clothing attachments.** Seat the diagonal harness over the belly and chest, bridge the loincloth to its belt, and recess the floating navel.
2. **Improve the materials.** Replace the conspicuously striped ivory with softly weathered bone, and quiet the leather grain so the silhouette and ornament lead.
3. **Strengthen the head.** Broaden the mohawk so it reads from the front, seat its highlights on the blades, and narrow the eyes slightly for a more formidable expression.
4. **Add restrained Warcraft-style character.** Build heavier trapezius muscles, a bound chin braid, swamp warts, and one luminous shamanic bracer charm.
5. **Finish the swamp.** Add a few lily pads and water bubbles without enlarging or crowding the stage.

<<<<<<< SEARCH
  const leather = grain("#432e31", "#735044", {
    size: 0.025,
    axis: "y",
    seed: 15,
  });
  const bone = grain("#bbac7d", "#f1e2b6", {
    size: 0.018,
    axis: "y",
    seed: 44,
  });
=======
  const leather = grain("#49363a", "#624b43", {
    size: 0.045,
    axis: "y",
    seed: 15,
  });
  const bone = paint((p, n) => {
    const weather = noise(p, 0.11, 44);
    const fine = noise(p, 0.023, 45);
    return mix(
      "#c9b586",
      "#f0e0b5",
      0.39 + weather * 0.24 + fine * 0.06 + Math.max(0, n.y) * 0.24,
    );
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
  ellipsoid([0, 1.56, 0.17], [0.405, 0.355, 0.225], bellySkin, spine.joints[0], "belly");
  for (const s of [1, -1]) {
    ellipsoid(
      [s * 0.275, 1.94, 0.175],
      [0.315, 0.225, 0.185],
      skin,
      spine.joints[2],
      "pectoral",
    );
  }
  ellipsoid([0, 1.40, 0.395], [0.034, 0.025, 0.012], DEEP, spine.joints[0], "navel");
=======
  const belly = ellipsoid(
    [0, 1.56, 0.17],
    [0.405, 0.355, 0.225],
    bellySkin,
    spine.joints[0],
    "belly",
  );
  const pectorals = [];
  for (const s of [1, -1]) {
    pectorals.push(ellipsoid(
      [s * 0.275, 1.94, 0.175],
      [0.315, 0.225, 0.185],
      skin,
      spine.joints[2],
      "pectoral",
    ));
    ellipsoid(
      [s * 0.37, 2.125, -0.105],
      [0.28, 0.23, 0.245],
      skin,
      spine.joints[2],
      "heavyTrapezius",
    );
  }
  const bellySurface = b.surface(belly);
  const navelHit = bellySurface.nearest([0, 1.40, 0.42]);
  b.stick(
    new THREE.SphereGeometry(1, 8, 5),
    DEEP,
    navelHit,
    {
      scale: [0.026, 0.009, 0.019],
      embed: 0.48,
      bone: spine.joints[0],
      name: "navel",
    },
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
    ellipsoid(hp(s * 0.205, 0.11, 0.31), [0.143, 0.110, 0.073], INK, head, "eyeSocket");

    const eyeball = ellipsoid(
      hp(s * 0.205, 0.105, 0.365),
      [0.100, 0.077, 0.041],
=======
    ellipsoid(hp(s * 0.205, 0.11, 0.31), [0.138, 0.094, 0.073], INK, head, "eyeSocket");

    const eyeball = ellipsoid(
      hp(s * 0.205, 0.105, 0.365),
      [0.100, 0.063, 0.041],
>>>>>>> REPLACE

<<<<<<< SEARCH
        size: [0.187, 0.129],
=======
        size: [0.187, 0.106],
>>>>>>> REPLACE

<<<<<<< SEARCH
  hoop(hp(0, -0.185, 0.577), 0.071, 0.014, GOLD, head);
  ellipsoid(hp(0, -0.263, 0.577), [0.022, 0.022, 0.017], GOLD_LIGHT, head);
=======
  hoop(hp(0, -0.185, 0.577), 0.071, 0.014, GOLD, head);
  ellipsoid(hp(0, -0.263, 0.577), [0.022, 0.022, 0.017], GOLD_LIGHT, head);

  // A short bound chin braid sharpens the lower-face silhouette.
  // Each strand begins inside the separate lower jaw and rides its hinge.
  const beardColor = "#254947";
  const beardHighlight = "#42685b";
  b.sweep(
    catmull([
      hp(0, -0.405, 0.345),
      hp(0, -0.505, 0.36),
      hp(0, -0.635, 0.315),
      hp(0, -0.735, 0.285),
    ]),
    [0.079, 0.066, 0.046, 0],
    {
      color: beardColor,
      bone: jaw,
      sides: 7,
      smooth: false,
      name: "chinBraidCore",
    },
  );
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        hp(s * 0.045, -0.425, 0.365),
        hp(-s * 0.035, -0.495, 0.403),
        hp(s * 0.025, -0.565, 0.367),
        hp(-s * 0.018, -0.635, 0.337),
      ]),
      [0.030, 0.027, 0.021, 0.012],
      {
        color: s > 0 ? beardHighlight : beardColor,
        bone: jaw,
        sides: 6,
        smooth: false,
        name: "interwovenChinBraid",
      },
    );
  }
  b.part(new THREE.CylinderGeometry(0.048, 0.043, 0.049, 8), GOLD, {
    at: hp(0, -0.635, 0.315),
    bone: jaw,
    dir: [0, -1, -0.2],
    flat: true,
    name: "chinBraidCuff",
  });
  ellipsoid(
    hp(0, -0.636, 0.361),
    [0.015, 0.015, 0.009],
    GOLD_LIGHT,
    jaw,
    "braidCuffStud",
    6,
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
  crestRoots.forEach(([y, z, height], i) => {
    b.extrude(
      [
        [-0.025, 0],
        [0.16, -0.025],
        [0.235, height * 0.58],
        [0.185, height],
        [0.11, height * 0.82],
        [0.025, height * 0.46],
      ],
      {
        at: [0, y, z],
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: [0.17, 0.065],
        bevel: 0.009,
        bone: head,
        color: hair,
        name: `mohawkBlade${i + 1}`,
      },
    );
    for (const s of [1, -1]) {
      b.extrude(
        [[0.035, 0.05], [0.079, 0.08], [0.176, height * 0.88], [0.135, height * 0.63]],
        {
          at: [s * 0.065, y, z],
          x: [0, 0, -1],
          y: [0, 1, 0],
          thickness: 0.009,
          color: i % 2 ? "#bb526b" : "#d36b7a",
          bone: head,
          name: "crestCarvedHighlight",
        },
      );
    }
  });
=======
  crestRoots.forEach(([y, z, height], i) => {
    const blade = b.extrude(
      [
        [-0.025, 0],
        [0.16, -0.025],
        [0.235, height * 0.58],
        [0.185, height],
        [0.11, height * 0.82],
        [0.025, height * 0.46],
      ],
      {
        at: [0, y, z],
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: [0.265, 0.12],
        bevel: 0.009,
        bone: head,
        color: hair,
        name: `mohawkBlade${i + 1}`,
      },
    );
    const bladeSurface = b.surface(blade);
    for (const s of [1, -1]) {
      // Pull the accent onto the tapered blade instead of leaving a
      // constant-width highlight floating beside its narrow upper edge.
      const highlightPath = bladeSurface.drape(
        catmull([
          [s * 0.16, y + 0.055, z - 0.065],
          [s * 0.14, y + height * 0.38, z - 0.105],
          [s * 0.11, y + height * 0.67, z - 0.145],
          [s * 0.085, y + height * 0.89, z - 0.177],
        ]),
        { lift: 0.002 },
      );
      b.sweep(highlightPath, [0.010, 0.008, 0.004], {
        color: i % 2 ? "#b95068" : "#cf6879",
        bone: head,
        sides: 5,
        caps: "flat",
        name: "crestCarvedHighlight",
      });
    }
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const harnessRoute = b.surface(torso).drape(
=======
  const harnessRoute = b.surface([torso, belly, pectorals]).drape(
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.along(beltLoop, 16, (at) =>
    b.part(new THREE.SphereGeometry(0.017, 6, 4), GOLD, {
      at,
      bone: hips,
      name: "beltRivet",
    }),
  );

  const frontCloth = b.extrude(
=======
  b.along(beltLoop, 16, (at) =>
    b.part(new THREE.SphereGeometry(0.017, 6, 4), GOLD, {
      at,
      bone: hips,
      name: "beltRivet",
    }),
  );

  // A substantial leather yoke bridges the belt and the hanging cloth.
  // The original front panel sat forward of the torso with no attachment.
  block(
    [0, 1.175, 0.305],
    [0.57, 0.115, 0.18],
    leather,
    hips,
    "loinclothLeatherYoke",
  );
  b.rod(
    [-0.275, 1.205, 0.398],
    [0.275, 1.205, 0.398],
    0.012,
    { color: LEATHER_EDGE, bone: hips, sides: 5, name: "yokeTopTrim" },
  );
  for (const x of [-0.235, -0.145, 0.145, 0.235]) {
    b.rod(
      [x - 0.016, 1.21, 0.407],
      [x + 0.016, 1.145, 0.407],
      0.009,
      { color: "#c5ac78", bone: hips, sides: 5, name: "loinclothAttachmentLacing" },
    );
  }

  const frontCloth = b.extrude(
>>>>>>> REPLACE

<<<<<<< SEARCH
  // ---------------------------------------------------------------------------
  // Little swamp stage. Low and quiet, with the troll remaining the clear hero.
  // ---------------------------------------------------------------------------
=======
  // Raised swamp warts add species character without replacing the broad forms.
  // Each grows from an actual surface hit and inherits its limb's bone.
  for (const { s, arm, leg } of limbs) {
    const shoulderSurface = b.surface(arm.joints[0]);
    for (const [dx, dy, radius] of [
      [0.00, 0.00, 0.030],
      [0.075, -0.045, 0.021],
      [-0.045, -0.075, 0.018],
    ]) {
      if (s > 0) continue; // Keep the armored shoulder clean.
      const hit = shoulderSurface.nearest([
        s * (0.79 + dx),
        2.055 + dy,
        0.28,
      ]);
      b.stick(
        new THREE.SphereGeometry(1, 7, 5),
        "#789b75",
        hit,
        {
          scale: [radius, radius * 0.58, radius],
          embed: 0.45,
          bone: arm.joints[0],
          name: "shoulderWart",
        },
      );
    }
    const kneeSurface = b.surface(leg.joints[1]);
    for (const [dx, dy, radius] of [
      [0.055, 0.015, 0.022],
      [0.085, -0.040, 0.016],
    ]) {
      const hit = kneeSurface.nearest([
        s * (0.35 + dx),
        0.79 + dy,
        0.28,
      ]);
      b.stick(
        new THREE.SphereGeometry(1, 6, 4),
        "#7f9b72",
        hit,
        {
          scale: [radius, radius * 0.55, radius],
          embed: 0.45,
          bone: leg.joints[1],
          name: "kneeWart",
        },
      );
    }
  }

  // One magical focal accent, framed by leather and bone rather than a halo.
  const charmRune = svg(
    `<svg viewBox="0 0 100 120">
      <path d="M50 7 L86 39 L73 92 L50 113 L27 92 L14 39Z"
            fill="#203d3b" stroke="#b79c63" stroke-width="6"/>
      <path d="M50 25 L65 46 L50 61 L35 46Z
               M50 62 L50 91 M33 77 L50 92 L67 77"
            fill="none" stroke="#81dfb8" stroke-width="7"
            stroke-linecap="square" stroke-linejoin="miter"/>
      <path d="M50 31 L59 46 L50 54 L41 46Z" fill="#b7f0cc"/>
    </svg>`,
    { size: 256 },
  );
  const charmBone = limbs[1].arm.joints[1];
  b.sweep(
    catmull([
      [-1.185, 1.76, 0.17],
      [-1.205, 1.63, 0.235],
      [-1.205, 1.56, 0.235],
    ]),
    0.012,
    { color: CORD, bone: charmBone, sides: 5, name: "bracerCharmCord" },
  );
  b.extrude(
    [[0, 0.11], [0.075, 0.05], [0.05, -0.06], [0, -0.105], [-0.05, -0.06], [-0.075, 0.05]],
    {
      at: [-1.205, 1.53, 0.24],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.033,
      color: leather,
      bone: charmBone,
      name: "bracerCharmBacking",
    },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.14, 0.205), "#ffffff", {
      at: [-1.205, 1.53, 0.259],
      bone: charmBone,
      texture: charmRune,
      name: "mireSpiritRune",
    }),
    0.85,
  );
  for (const s of [1, -1]) {
    b.spike(
      [-1.205 + s * 0.049, 1.49, 0.255],
      [s * 0.15, -1, 0.08],
      0.095,
      0.022,
      {
        color: bone,
        bone: charmBone,
        sides: 6,
        name: "bracerCharmFang",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Little swamp stage. Low and quiet, with the troll remaining the clear hero.
  // ---------------------------------------------------------------------------
>>>>>>> REPLACE

<<<<<<< SEARCH
  // One old offering half sunk in the mud tells the story without adding a prop wall.
=======
  // Small floating leaves make the water read as a swamp rather than painted discs.
  function lilyPad(x: number, z: number, radius: number, turn: number) {
    const padPoints = [];
    for (let i = 0; i <= 11; i++) {
      const angle = turn + 0.23 + (i / 11) * (Math.PI * 2 - 0.46);
      padPoints.push([
        x + Math.cos(angle) * radius,
        0.137,
        z + Math.sin(angle) * radius * 0.81,
      ]);
    }
    padPoints.push([x, 0.137, z]);
    b.slab(padPoints, {
      color: "#668653",
      thickness: 0.006,
      bone: root,
      name: "notchedLilyPad",
    });
    for (const angle of [turn + 1.15, turn + 2.7, turn + 4.25]) {
      b.rod(
        [x, 0.142, z],
        [
          x + Math.cos(angle) * radius * 0.77,
          0.142,
          z + Math.sin(angle) * radius * 0.62,
        ],
        0.0035,
        { color: "#91a36a", bone: root, sides: 4, name: "lilyPadVein" },
      );
    }
  }
  lilyPad(-1.07, 0.43, 0.115, 0.6);
  lilyPad(-0.80, 0.27, 0.082, -1.2);
  lilyPad(0.98, -0.30, 0.102, 2.0);

  for (const [x, z, radius] of [
    [-1.11, 0.23, 0.014],
    [-1.16, 0.27, 0.010],
    [0.79, -0.39, 0.015],
    [0.82, -0.355, 0.008],
  ]) {
    ellipsoid(
      [x, 0.134, z],
      [radius, radius * 0.48, radius],
      "#86a78a",
      root,
      "swampBubble",
      7,
    );
  }

  // One old offering half sunk in the mud tells the story without adding a prop wall.
>>>>>>> REPLACE