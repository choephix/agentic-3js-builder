1. **Seat the tailoring and eyes more convincingly.** The waistcoat trim and pocket watch read slightly detached in the side views; give them proper contact and bring the eyes closer to the face.
2. **Quiet the surface patterns.** The beard, waistcoat and floor currently compete with the face. Softer material variation will let the facets, embroidery and gadgets carry the detail.
3. **Reshape the beard into overlapping, irregular locks.** Break up the straight, comb-like bottom edge while preserving its separate jaw rig.
4. **Add a tucked carpenter’s pencil.** A readable little profession cue beside the ear, without obstructing the eyes.
5. **Ground the loose floor tool and finish the display with an inventor’s nameplate.**

<<<<<<< SEARCH
  const wood = grain("#654038", "#9d6950", {
    size: 0.028,
    axis: "x",
    seed: 5,
  });
=======
  const wood = grain("#765344", "#956b52", {
    size: 0.045,
    axis: "x",
    seed: 5,
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const waistcoat = grain("#b57931", "#e9b65c", {
    size: 0.012,
    axis: "y",
    seed: 21,
  });
=======
  const waistcoat = paint((p, n) => {
    const weave = Math.sin(p.x * 560) * Math.sin(p.y * 600) * 0.012;
    return mix(
      "#bd873e",
      "#e9bd70",
      0.48 + n.y * 0.18 + noise(p, 0.12, 21) * 0.15 + weave,
    );
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const hair = grain("#d9bf94", "#fff3d6", {
    size: 0.009,
    axis: "y",
    seed: 44,
  });
  const paleHair = grain("#efdbb8", "#fff9df", {
    size: 0.007,
    axis: "y",
    seed: 45,
  });
=======
  const hair = paint((p, n) => {
    const strands = Math.sin(p.x * 370 + Math.sin(p.y * 18)) * 0.025;
    return mix(
      "#d9c3a3",
      "#fff0d1",
      0.49 + n.y * 0.17 + n.z * 0.1 + strands,
    );
  });
  const paleHair = paint((p, n) => {
    const strands = Math.sin(p.x * 410 + Math.sin(p.y * 15)) * 0.019;
    return mix(
      "#ead7b8",
      "#fff6dc",
      0.57 + n.y * 0.17 + n.z * 0.08 + strands,
    );
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const gauge = gaugeTexture({ needle: 48, label: "PUFF", size: 256 });
=======
  const gauge = gaugeTexture({ needle: 48, label: "PUFF", size: 256 });
  const nameplateTexture = drawing(`
    <rect x="3" y="3" width="314" height="74" rx="9"
      fill="#264953" stroke="#edcb80" stroke-width="5"/>
    <path d="M17 20 H43 M17 60 H43 M277 20 H303 M277 60 H303"
      stroke="#b88f56" stroke-width="3"/>
    <text x="160" y="36" text-anchor="middle" font-family="serif"
      font-weight="bold" font-size="23" fill="#fff0c5">POCKETWHISTLE</text>
    <text x="160" y="59" text-anchor="middle" font-family="monospace"
      font-size="14" fill="#adcfbf">INVENTOR · FIELD KIT VII</text>
  `, "0 0 320 80", 512);
>>>>>>> REPLACE

<<<<<<< SEARCH
  tube([-0.59, 0.11, 0.19], [-0.67, 0.11, 0.32], 0.01, steel, floorBone);
  box([-0.66, 0.113, 0.32], [0.065, 0.025, 0.032], copper, floorBone, "spare key bow");
=======
  tube([-0.59, 0.096, 0.19], [-0.67, 0.096, 0.32], 0.01, steel, floorBone);
  box([-0.66, 0.099, 0.32], [0.065, 0.025, 0.032], copper, floorBone, "spare key bow");
>>>>>>> REPLACE

<<<<<<< SEARCH
  // ---------------------------------------------------------------------------
  // Torso: a gold waistcoat inside a teal, scalloped workshop jacket.
  // ---------------------------------------------------------------------------
=======
  box([0, 0.04, 0.565], [0.354, 0.057, 0.031], brass, floorBone, "inventor nameplate frame");
  imagePlane([0, 0.041, 0.582], [0.326, 0.048], nameplateTexture, floorBone);
  for (const s of sides) {
    pin([s * 0.164, 0.04, 0.585], 0.005, floorBone, copper);
  }

  // ---------------------------------------------------------------------------
  // Torso: a gold waistcoat inside a teal, scalloped workshop jacket.
  // ---------------------------------------------------------------------------
>>>>>>> REPLACE

<<<<<<< SEARCH
        at: [s * 0.018, 0.485, 0.178],
        x: [s, 0, 0],
        y: [0, 1, -0.085],
        thickness: 0.018,
=======
        at: [s * 0.018, 0.485, 0.166],
        x: [s, 0, 0],
        y: [0, 1, -0.085],
        thickness: 0.038,
>>>>>>> REPLACE

<<<<<<< SEARCH
        at: [s * 0.148, 0.637, 0.175],
        x: [s, 0, 0],
        y: [0, 1, -0.1],
        thickness: 0.027,
=======
        at: [s * 0.148, 0.637, 0.166],
        x: [s, 0, 0],
        y: [0, 1, -0.1],
        thickness: 0.041,
>>>>>>> REPLACE

<<<<<<< SEARCH
      [s * 0.113, 0.595, 0.199],
=======
      [s * 0.113, 0.595, 0.179],
>>>>>>> REPLACE

<<<<<<< SEARCH
    pin([0, 0.542 + i * 0.062, 0.202], 0.012, spine.joints[0], brass);
=======
    pin([0, 0.542 + i * 0.062, 0.193 - i * 0.004], 0.012, spine.joints[0], brass);
>>>>>>> REPLACE

<<<<<<< SEARCH
  torus([-0.178, 0.588, 0.21], 0.033, 0.007, brass, spine.joints[0]);
=======
  b.part(new THREE.CylinderGeometry(0.033, 0.033, 0.041, 12), brass, {
    at: [-0.178, 0.588, 0.191],
    dir: [0, 0, 1],
    bone: spine.joints[0],
    flat: true,
    name: "pocket watch case",
  });
  torus([-0.178, 0.588, 0.21], 0.033, 0.007, brass, spine.joints[0]);
>>>>>>> REPLACE

<<<<<<< SEARCH
    const eye = ell(hp(s * 0.083, 0.039, 0.134), [0.057, 0.058, 0.028], cream, head, "eye white");
    b.decal(eye, eyeTexture, {
      at: hp(s * 0.083, 0.039, 0.164),
=======
    const eye = ell(hp(s * 0.083, 0.039, 0.125), [0.057, 0.058, 0.028], cream, head, "eye white");
    b.decal(eye, eyeTexture, {
      at: hp(s * 0.083, 0.039, 0.155),
>>>>>>> REPLACE

<<<<<<< SEARCH
  ell([0, 0.864, 0.145], [0.162, 0.171, 0.092], hair, jaw, "beard silhouette");
  for (let i = -3; i <= 3; i++) {
    const x = i * 0.041;
    const y = 0.986 - Math.abs(i) * 0.017;
    const z = 0.197 - Math.abs(i) * 0.004;
    beardLock(
      [x, y, z],
      0.067,
      0.197 - Math.abs(i) * 0.017,
      i * 0.12,
      i % 2 === 0 ? paleHair : hair,
      jaw,
    );
  }
  for (let i = -2; i <= 2; i++) {
    beardLock(
      [i * 0.05, 0.878 - Math.abs(i) * 0.008, 0.232],
      0.063,
      0.17 - Math.abs(i) * 0.015,
      i * 0.16,
      i % 2 === 0 ? hair : paleHair,
      jaw,
    );
  }
=======
  ell([0, 0.852, 0.149], [0.158, 0.179, 0.091], hair, jaw, "beard silhouette");
  for (let i = -3; i <= 3; i++) {
    const x = i * 0.039;
    const y = 0.977 - Math.abs(i) * 0.012;
    const z = 0.197 - Math.abs(i) * 0.004;
    beardLock(
      [x, y, z],
      0.073 - Math.abs(i) * 0.003,
      0.202 - Math.abs(i) * 0.019 + (i % 2 === 0 ? 0.008 : 0),
      i * 0.1,
      i % 2 === 0 ? paleHair : hair,
      jaw,
    );
  }
  const lowerLocks = [
    { x: -0.093, y: 0.866, width: 0.063, length: 0.132, lean: -0.2 },
    { x: -0.045, y: 0.889, width: 0.075, length: 0.185, lean: -0.11 },
    { x: 0.015, y: 0.864, width: 0.082, length: 0.196, lean: 0.03 },
    { x: 0.073, y: 0.883, width: 0.071, length: 0.161, lean: 0.15 },
    { x: 0.117, y: 0.855, width: 0.054, length: 0.119, lean: 0.22 },
  ];
  for (let i = 0; i < lowerLocks.length; i++) {
    const lock = lowerLocks[i];
    beardLock(
      [lock.x, lock.y, 0.226 + (i % 2) * 0.008],
      lock.width,
      lock.length,
      lock.lean,
      i % 2 === 0 ? paleHair : hair,
      jaw,
    );
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
  // ---------------------------------------------------------------------------
  // Whimsical cap: broad brim, bent cone, stitched badge and forehead goggles.
  // ---------------------------------------------------------------------------
=======
  // A pencil tucked behind the left ear: a yellow hexagonal barrel,
  // real sharpened wood, graphite point, ferrule and worn pink eraser.
  const pencilBase = hp(0.193, -0.015, -0.019);
  const pencilShoulder = hp(0.212, 0.191, -0.027);
  const pencilWoodTip = hp(0.216, 0.226, -0.028);
  const pencilTip = hp(0.217, 0.239, -0.029);
  b.rod(pencilBase, pencilShoulder, 0.012, {
    color: "#e6b44c",
    bone: head,
    section: { ngon: 6 },
    smooth: false,
    name: "tucked carpenter pencil",
  });
  b.rod(
    hp(0.191, -0.038, -0.018),
    hp(0.194, -0.005, -0.019),
    0.014,
    { color: brass, bone: head, sides: 6, smooth: false },
  );
  b.rod(
    hp(0.189, -0.061, -0.017),
    hp(0.191, -0.039, -0.018),
    0.013,
    { color: "#dc8d85", bone: head, sides: 6, smooth: false },
  );
  b.rod(pencilShoulder, pencilWoodTip, [0.012, 0.004], {
    color: "#e9cea0", bone: head, sides: 6, smooth: false,
  });
  b.spike(pencilWoodTip, pencilTip, null, 0.004, {
    color: ink, bone: head, sides: 6,
  });

  // ---------------------------------------------------------------------------
  // Whimsical cap: broad brim, bent cone, stitched badge and forehead goggles.
  // ---------------------------------------------------------------------------
>>>>>>> REPLACE