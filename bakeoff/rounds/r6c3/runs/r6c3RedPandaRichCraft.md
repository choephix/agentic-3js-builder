1. **Head too small for a Genshin chibi look.** I enlarged the skull and moved the muzzle, nose, jaw, mouth decal, ears and forehead tufts to fit. I also made the ears bigger so the face is the focal point.
2. **Cheek ruffs read as elf ears.** They stuck out sideways like horns, so I moved them onto the larger skull and swept them back and down, shorter and broader.
3. **The scarf was a huge octagon round the chest.** It was cut from the body loft and hid the neck. It is now a ring round the neck with two gold trim rings, and the knot and ribbon tails start from the top of that ring.
4. **Motes drifted across the face.** One floated in front of the eye in the front view. I pushed the floating Dendro motes to a larger radius so they frame the panda instead of covering it.
5. **Tail fur looked like dark thorns.** I tinted the tufts a lighter warm orange.
6. **Moss blobs on the boulder were cabbage-sized.** I shrank them.
7. **Legs and belly read purple.** I warmed `C.dark` to a brown so they read as red-panda dark brown.

<<<<<<< SEARCH
  dark: "#5c3030",
=======
  dark: "#4b2a25",
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.cards(tailHits, TUFT, { size: [0.04, 0.06], lean: 70, bend: 25, vary: 0.25, rng: R, color: C.orange });
=======
  b.cards(tailHits, TUFT, { size: [0.036, 0.05], lean: 72, bend: 25, vary: 0.25, rng: R, color: "#ff9444" });
>>>>>>> REPLACE

<<<<<<< SEARCH
  ), { bone: head, at: HC, scale: [0.115, 0.095, 0.1] });
=======
  ), { bone: head, at: HC, scale: [0.135, 0.11, 0.118] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const muzzle = b.part(new THREE.SphereGeometry(1, 10, 8), MUZZLE_P, { bone: head, at: H(0, -0.035, 0.085), scale: [0.058, 0.042, 0.052] });
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE_P, { bone: head, at: H(0, -0.014, 0.133), scale: [0.021, 0.015, 0.015] });
  b.part(new THREE.SphereGeometry(1, 8, 6), MUZZLE_P, { bone: jaw, at: H(0, -0.085, 0.085), scale: [0.04, 0.02, 0.045] });
  b.decal(b.surface(muzzle), MOUTH, { at: H(0, -0.05, 0.128), dir: [0, 0, 1], size: [0.04, 0.022] });
=======
  const muzzle = b.part(new THREE.SphereGeometry(1, 10, 8), MUZZLE_P, { bone: head, at: H(0, -0.04, 0.1), scale: [0.066, 0.047, 0.058] });
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE_P, { bone: head, at: H(0, -0.017, 0.152), scale: [0.024, 0.017, 0.017] });
  b.part(new THREE.SphereGeometry(1, 8, 6), MUZZLE_P, { bone: jaw, at: H(0, -0.094, 0.1), scale: [0.046, 0.022, 0.05] });
  b.decal(b.surface(muzzle), MOUTH, { at: H(0, -0.058, 0.15), dir: [0, 0, 1], size: [0.045, 0.025] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const EAR: Outline = [[-0.05, 0], [0.05, 0], [0.058, 0.04], [0, 0.092], [-0.058, 0.04]];
=======
  const EAR: Outline = [[-0.06, 0], [0.06, 0], [0.069, 0.046], [0, 0.106], [-0.069, 0.046]];
>>>>>>> REPLACE

<<<<<<< SEARCH
    const earJ = b.joint(`ear${side}`, { parent: head, at: H(s * 0.07, 0.065, 0), dir: [s * 0.4, 1, 0.1], role: "hinge" });
    const ear = b.extrude(EAR, { at: H(s * 0.07, 0.065, 0), x, y, thickness: 0.026, bevel: 0.008, smoothing: 2, color: ORANGE_P, bone: earJ });
=======
    const earJ = b.joint(`ear${side}`, { parent: head, at: H(s * 0.088, 0.07, 0), dir: [s * 0.4, 1, 0.1], role: "hinge" });
    const ear = b.extrude(EAR, { at: H(s * 0.088, 0.07, 0), x, y, thickness: 0.028, bevel: 0.008, smoothing: 2, color: ORANGE_P, bone: earJ });
>>>>>>> REPLACE

<<<<<<< SEARCH
      { at: H(s * 0.088, -0.015, 0.02), dir: [s * 0.7, 0.1, -0.6], L: 0.06 },
      { at: H(s * 0.082, -0.045, 0.0), dir: [s * 0.7, -0.15, -0.65], L: 0.065 },
      { at: H(s * 0.07, -0.07, 0.0), dir: [s * 0.55, -0.4, -0.65], L: 0.055 },
=======
      { at: H(s * 0.112, -0.012, 0.03), dir: [s * 0.45, 0.0, -0.9], L: 0.05 },
      { at: H(s * 0.108, -0.046, 0.015), dir: [s * 0.4, -0.25, -0.85], L: 0.055 },
      { at: H(s * 0.092, -0.078, 0.01), dir: [s * 0.3, -0.5, -0.8], L: 0.05 },
>>>>>>> REPLACE

<<<<<<< SEARCH
    blade(leafOutline(0.055, 0.02), H(k * 0.03, 0.082, 0.035), [k * 0.4, 1, -0.3], [1, 0, 0], 0.012, ORANGE_P, head);
=======
    blade(leafOutline(0.055, 0.02), H(k * 0.035, 0.096, 0.04), [k * 0.4, 1, -0.3], [1, 0, 0], 0.012, ORANGE_P, head);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const collar = bodySurf.loop(frame([0, 0.64, 0.225], [0, 0, 1]), { lift: 0.014 });
  b.sweep(collar, 0.026, { color: SCARF_P });
  for (const z of [0.2, 0.25]) {
    const trim = bodySurf.loop(frame([0, 0.64, z], [0, 0, 1]), { lift: 0.014 });
    b.sweep(trim, 0.007, { color: C.gold });
  }
  const K = new THREE.Vector3(...T(new THREE.Vector3().copy(collar.at(0) as any)));
=======
  const scarfRing = b.ring(frame([0, 0.675, 0.285], [0, 0.08, 1]), { count: 12, radius: 0.115 }).items;
  b.sweep(catmull(scarfRing, { closed: true }), 0.026, { color: SCARF_P, bone: neck, sides: 8 });
  for (const dz of [-0.024, 0.024]) {
    const trimRing = b.ring(frame([0, 0.675 + dz * 0.08, 0.285 + dz], [0, 0.08, 1]), { count: 12, radius: 0.13 }).items;
    b.sweep(catmull(trimRing, { closed: true }), 0.006, { color: C.gold, bone: neck, sides: 6 });
  }
  const K = new THREE.Vector3(...T(new THREE.Vector3().copy(scarfRing[0].at as any)));
>>>>>>> REPLACE

<<<<<<< SEARCH
    const r = 0.4 + R() * 0.3;
=======
    const r = 0.58 + R() * 0.25;
>>>>>>> REPLACE

<<<<<<< SEARCH
    const sz = 0.028 + R() * 0.016;
=======
    const sz = 0.022 + R() * 0.012;
>>>>>>> REPLACE