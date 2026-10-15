Geometry was being created for the dais and scenery before defining the root joint.

<<<<<<< SEARCH
export default function build() {
  const b = createBuilder({ name: "elven_ranger_archer", detail: 1.1 });

  // 1. Staged Dais Base & Setting (Resting squarely on y = 0)
  // -------------------------------------------------------------------------------------------------------------
  const baseBottomY = 0.015;
  const baseTopY = 0.045;
  const daisFloorY = 0.06; // Standing ground for archer's boots

  // Dais Tier 1 (Bottom foundation)
  b.part(new THREE.CylinderGeometry(0.64, 0.68, 0.03, 28), STONE_BASE, {
    at: [0, baseBottomY, 0],
    group: "scenery",
  });
  // Dais Tier 2 (Upper runic dais)
  b.part(new THREE.CylinderGeometry(0.57, 0.6, 0.03, 28), STONE_TOP, {
    at: [0, baseTopY, 0],
    group: "scenery",
  });
  // Carved elven runic circle decal on top of dais
  b.part(new THREE.PlaneGeometry(1.08, 1.08), "#ffffff", {
    at: [0, daisFloorY + 0.001, 0],
    dir: [0, 1, 0],
    axis: "z",
    texture: ELF_RUNE_CIRCLE,
    group: "scenery",
  });

  // Ancient elven waypoint stone monolith behind the archer
  const obeliskAt = [-0.34, daisFloorY + 0.22, -0.32];
  b.frustumBox(
    [-0.34, daisFloorY, -0.32],
    [-0.34, daisFloorY + 0.44, -0.32],
    [0.15, 0.12],
    [0.08, 0.06],
    { color: STONE_BASE, group: "scenery" }
  );
  b.part(
    new THREE.ConeGeometry(0.06, 0.08, 4),
    STONE_TOP,
    { at: [-0.34, daisFloorY + 0.48, -0.32], rotation: [0, 45, 0], group: "scenery" }
  );
  // Glowing rune glyph on monolith front face
  makeGlow(
    b.part(new THREE.PlaneGeometry(0.08, 0.16), "#ffffff", {
      at: [-0.338, daisFloorY + 0.24, -0.258],
      dir: [0.18, 0, 0.98],
      axis: "z",
      texture: RUNIC_GLYPH,
      group: "scenery",
    }),
    2.0
  );
  // Ivy vines coiling around the stone
  b.sweep(
    catmull([
      [-0.38, daisFloorY + 0.02, -0.27],
      [-0.29, daisFloorY + 0.12, -0.26],
      [-0.38, daisFloorY + 0.22, -0.36],
      [-0.3, daisFloorY + 0.32, -0.33],
      [-0.35, daisFloorY + 0.42, -0.29],
    ]),
    0.006,
    { color: VINE_GREEN, group: "scenery" }
  );

  // Glowing fairy nightcaps (magic mushrooms) beside the obelisk
  const shrooms = [
    { pos: [-0.24, daisFloorY, -0.22], h: 0.09, r: 0.038, col: "#22f5c8" },
    { pos: [-0.28, daisFloorY, -0.16], h: 0.06, r: 0.026, col: "#38e0ff" },
    { pos: [-0.19, daisFloorY, -0.27], h: 0.045, r: 0.02, col: "#6df8ff" },
  ];
  for (const s of shrooms) {
    b.capsule(s.pos, [s.pos[0], s.pos[1] + s.h * 0.7, s.pos[2]], 0.007, {
      color: PALE_LINEN,
      group: "scenery",
    });
    makeGlow(
      b.part(
        new THREE.SphereGeometry(s.r, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.58),
        s.col,
        {
          at: [s.pos[0], s.pos[1] + s.h * 0.7, s.pos[2]],
          scale: [1, 1.25, 1],
          group: "scenery",
        }
      ),
      1.8
    );
  }

  // Clumps of elven fern fronds & scattered leaves
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72 * Math.PI) / 180;
    const fx = Math.cos(angle) * 0.48;
    const fz = Math.sin(angle) * 0.48;
    b.extrude(
      [
        [0, 0],
        [0.03, 0.08],
        [0.015, 0.14],
        [0, 0.18],
        [-0.015, 0.14],
        [-0.03, 0.08],
      ],
      {
        at: [fx, daisFloorY, fz],
        x: [Math.cos(angle), 0, Math.sin(angle)],
        y: [0, 1, 0],
        thickness: 0.004,
        color: MOSS_GREEN,
        group: "scenery",
      }
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // 2. Skeletal Rig Setup
  // -------------------------------------------------------------------------------------------------------------

  // Root joint: Pelvis / Hips
  const hips = b.joint("hips", {
    at: [0, 0.94, 0.0],
    dir: [0, 1, 0],
    role: "spine",
    group: "body",
  });

  // Spine & Torso joints
  const spinePts = [
    [0, 0.94, 0.0],
    [0, 1.1, -0.01],
    [0, 1.28, -0.015],
  ];
  const spineChain = b.chain("spine", spinePts, {
    parent: hips,
    names: ["spine", "chest"],
    role: "spine",
    group: "body",
  });
  const chest = spineChain.joints[1];

  // Neck, Head, Jaw
  const neck = b.joint("neck", {
    parent: chest,
    at: [0, 1.4, 0.0],
    dir: [0, 1, 0.08],
    role: "neck",
    group: "head",
  });
  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.5, 0.02],
    dir: [0, 0.1, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.47, 0.05],
    dir: [0, -0.15, 0.4],
    role: "jaw",
    group: "head",
  });

  // Leg IK Setup: Left (+X) and Right (-X) legs standing gracefully on dais floor
  const legChains: Record<string, any> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipPos = [s * 0.11, 0.93, 0.0];
    const anklePos = [s * 0.14, daisFloorY + 0.07, s * -0.01];
    const toePos = [s * 0.14, daisFloorY + 0.02, 0.11];

    // limb IK solve for knee position
    const pts = limb(hipPos, anklePos, [0.44, 0.4], [0, 0, 1]);
    pts.push(new THREE.Vector3(...toePos));

    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `toe${side}`],
      role: "leg",
      contact: [s * 0.14, daisFloorY, 0.06],
      group: "legs",
    });
    legChains[side] = leg;
  }

  // Arm Setup: Noble archer A-pose
  // Left arm holds the Great Elven Bow; Right arm is poised near hip/quiver
  const armChains: Record<string, any> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulderPos = [s * 0.17, 1.34, -0.02];
    const wristPos = s > 0 ? [0.42, 0.96, 0.08] : [-0.38, 0.94, 0.04];
    const handPos = s > 0 ? [0.48, 0.88, 0.1] : [-0.44, 0.86, 0.06];

    const armPts = limb(shoulderPos, wristPos, [0.28, 0.26], [s * 0.15, 0, -1]);
    armPts.push(new THREE.Vector3(...handPos));

    const arm = b.chain(`arm${side}`, armPts, {
      parent: chest,
      names: [
        `shoulder${side}`,
        `elbow${side}`,
        `wrist${side}`,
        `hand${side}`,
      ],
      role: "arm",
      group: "arms",
    });
    armChains[side] = arm;
  }
=======
export default function build() {
  const b = createBuilder({ name: "elven_ranger_archer", detail: 1.1 });

  const daisFloorY = 0.06; // Standing ground for archer's boots

  // -------------------------------------------------------------------------------------------------------------
  // 1. Skeletal Rig Setup (Built first so root and limb bones exist for all parts)
  // -------------------------------------------------------------------------------------------------------------

  // Root joint: Pelvis / Hips
  const hips = b.joint("hips", {
    at: [0, 0.94, 0.0],
    dir: [0, 1, 0],
    role: "spine",
    group: "body",
  });

  // Spine & Torso joints
  const spinePts = [
    [0, 0.94, 0.0],
    [0, 1.1, -0.01],
    [0, 1.28, -0.015],
  ];
  const spineChain = b.chain("spine", spinePts, {
    parent: hips,
    names: ["spine", "chest"],
    role: "spine",
    group: "body",
  });
  const chest = spineChain.joints[1];

  // Neck, Head, Jaw
  const neck = b.joint("neck", {
    parent: chest,
    at: [0, 1.4, 0.0],
    dir: [0, 1, 0.08],
    role: "neck",
    group: "head",
  });
  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.5, 0.02],
    dir: [0, 0.1, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.47, 0.05],
    dir: [0, -0.15, 0.4],
    role: "jaw",
    group: "head",
  });

  // Leg IK Setup: Left (+X) and Right (-X) legs standing gracefully on dais floor
  const legChains: Record<string, any> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipPos = [s * 0.11, 0.93, 0.0];
    const anklePos = [s * 0.14, daisFloorY + 0.07, s * -0.01];
    const toePos = [s * 0.14, daisFloorY + 0.02, 0.11];

    // limb IK solve for knee position
    const pts = limb(hipPos, anklePos, [0.44, 0.4], [0, 0, 1]);
    pts.push(new THREE.Vector3(...toePos));

    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `toe${side}`],
      role: "leg",
      contact: [s * 0.14, daisFloorY, 0.06],
      group: "legs",
    });
    legChains[side] = leg;
  }

  // Arm Setup: Noble archer A-pose
  // Left arm holds the Great Elven Bow; Right arm is poised near hip/quiver
  const armChains: Record<string, any> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulderPos = [s * 0.17, 1.34, -0.02];
    const wristPos = s > 0 ? [0.42, 0.96, 0.08] : [-0.38, 0.94, 0.04];
    const handPos = s > 0 ? [0.48, 0.88, 0.1] : [-0.44, 0.86, 0.06];

    const armPts = limb(shoulderPos, wristPos, [0.28, 0.26], [s * 0.15, 0, -1]);
    armPts.push(new THREE.Vector3(...handPos));

    const arm = b.chain(`arm${side}`, armPts, {
      parent: chest,
      names: [
        `shoulder${side}`,
        `elbow${side}`,
        `wrist${side}`,
        `hand${side}`,
      ],
      role: "arm",
      group: "arms",
    });
    armChains[side] = arm;
  }

  // -------------------------------------------------------------------------------------------------------------
  // 2. Staged Dais Base & Setting (Resting squarely on y = 0)
  // -------------------------------------------------------------------------------------------------------------
  const baseBottomY = 0.015;
  const baseTopY = 0.045;

  // Dais Tier 1 (Bottom foundation)
  b.part(new THREE.CylinderGeometry(0.64, 0.68, 0.03, 28), STONE_BASE, {
    at: [0, baseBottomY, 0],
    bone: hips,
    group: "scenery",
  });
  // Dais Tier 2 (Upper runic dais)
  b.part(new THREE.CylinderGeometry(0.57, 0.6, 0.03, 28), STONE_TOP, {
    at: [0, baseTopY, 0],
    bone: hips,
    group: "scenery",
  });
  // Carved elven runic circle decal on top of dais
  b.part(new THREE.PlaneGeometry(1.08, 1.08), "#ffffff", {
    at: [0, daisFloorY + 0.001, 0],
    dir: [0, 1, 0],
    axis: "z",
    texture: ELF_RUNE_CIRCLE,
    bone: hips,
    group: "scenery",
  });

  // Ancient elven waypoint stone monolith behind the archer
  b.frustumBox(
    [-0.34, daisFloorY, -0.32],
    [-0.34, daisFloorY + 0.44, -0.32],
    [0.15, 0.12],
    [0.08, 0.06],
    { bone: hips, color: STONE_BASE, group: "scenery" }
  );
  b.part(
    new THREE.ConeGeometry(0.06, 0.08, 4),
    STONE_TOP,
    { at: [-0.34, daisFloorY + 0.48, -0.32], rotation: [0, 45, 0], bone: hips, group: "scenery" }
  );
  // Glowing rune glyph on monolith front face
  makeGlow(
    b.part(new THREE.PlaneGeometry(0.08, 0.16), "#ffffff", {
      at: [-0.338, daisFloorY + 0.24, -0.258],
      dir: [0.18, 0, 0.98],
      axis: "z",
      texture: RUNIC_GLYPH,
      bone: hips,
      group: "scenery",
    }),
    2.0
  );
  // Ivy vines coiling around the stone
  b.sweep(
    catmull([
      [-0.38, daisFloorY + 0.02, -0.27],
      [-0.29, daisFloorY + 0.12, -0.26],
      [-0.38, daisFloorY + 0.22, -0.36],
      [-0.3, daisFloorY + 0.32, -0.33],
      [-0.35, daisFloorY + 0.42, -0.29],
    ]),
    0.006,
    { bone: hips, color: VINE_GREEN, group: "scenery" }
  );

  // Glowing fairy nightcaps (magic mushrooms) beside the obelisk
  const shrooms = [
    { pos: [-0.24, daisFloorY, -0.22], h: 0.09, r: 0.038, col: "#22f5c8" },
    { pos: [-0.28, daisFloorY, -0.16], h: 0.06, r: 0.026, col: "#38e0ff" },
    { pos: [-0.19, daisFloorY, -0.27], h: 0.045, r: 0.02, col: "#6df8ff" },
  ];
  for (const s of shrooms) {
    b.capsule(s.pos, [s.pos[0], s.pos[1] + s.h * 0.7, s.pos[2]], 0.007, {
      bone: hips,
      color: PALE_LINEN,
      group: "scenery",
    });
    makeGlow(
      b.part(
        new THREE.SphereGeometry(s.r, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.58),
        s.col,
        {
          at: [s.pos[0], s.pos[1] + s.h * 0.7, s.pos[2]],
          scale: [1, 1.25, 1],
          bone: hips,
          group: "scenery",
        }
      ),
      1.8
    );
  }

  // Clumps of elven fern fronds & scattered leaves
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72 * Math.PI) / 180;
    const fx = Math.cos(angle) * 0.48;
    const fz = Math.sin(angle) * 0.48;
    b.extrude(
      [
        [0, 0],
        [0.03, 0.08],
        [0.015, 0.14],
        [0, 0.18],
        [-0.015, 0.14],
        [-0.03, 0.08],
      ],
      {
        at: [fx, daisFloorY, fz],
        x: [Math.cos(angle), 0, Math.sin(angle)],
        y: [0, 1, 0],
        thickness: 0.004,
        bone: hips,
        color: MOSS_GREEN,
        group: "scenery",
      }
    );
  }
>>>>>>> REPLACE