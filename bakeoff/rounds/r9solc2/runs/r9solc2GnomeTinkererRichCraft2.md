1. **Seat the loose details properly:** project the freckles onto the cheeks and anchor the backpack aerial in a brass socket.
2. **Clean up the hat:** constrain the goggle strap to the cap itself, avoiding accidental attachment to nearby details.
3. **Replace the block-like boot soles:** use thinner, foot-shaped soles so the boots look handmade rather than perched on rectangular risers.
4. **Give the hair more character:** add a few broad, tapered rear locks and subtle strand shading to the beard without losing its primitive-built silhouette.
5. **Quiet the setting:** reduce the floor’s high-contrast grain and the oversized gold rim’s mottling so the face and gadget pack remain the heroes.

<<<<<<< SEARCH
  const wood = grain("#765344", "#956b52", {
    size: 0.045,
    axis: "x",
    seed: 5,
  });
=======
  const wood = grain("#785746", "#896650", {
    size: 0.062,
    axis: "x",
    seed: 5,
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
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
=======
  const hair = paint((p, n) => {
    const strands = Math.pow(
      0.5 + 0.5 * Math.sin(p.x * 240 + Math.sin(p.y * 19) * 1.4),
      10,
    ) * 0.16;
    return mix(
      "#d9c3a3",
      "#fff0d1",
      0.49 + n.y * 0.17 + n.z * 0.1 - strands,
    );
  });
  const paleHair = paint((p, n) => {
    const strands = Math.pow(
      0.5 + 0.5 * Math.sin(p.x * 260 + Math.sin(p.y * 17) * 1.2),
      10,
    ) * 0.12;
    return mix(
      "#ead7b8",
      "#fff6dc",
      0.57 + n.y * 0.17 + n.z * 0.08 - strands,
    );
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.CylinderGeometry(0.887, 0.9, 0.025, 12), brass, {
    at: [0, 0.0625, -0.045],
=======
  b.part(new THREE.CylinderGeometry(0.887, 0.9, 0.025, 12), brassFlat, {
    at: [0, 0.0625, -0.045],
>>>>>>> REPLACE

<<<<<<< SEARCH
    box([s * 0.225, 0.115, 0.136], [0.205, 0.06, 0.313], ink, foot, `sole ${side}`);
    ell([s * 0.225, 0.164, 0.162], [0.11, 0.079, 0.163], bootLeather, foot, `boot ${side}`);
=======
    const soleOutline = [
      [-0.066, -0.144],
      [0.066, -0.144],
      [0.096, -0.099],
      [0.112, 0.068],
      [0.093, 0.129],
      [0.052, 0.156],
      [-0.052, 0.156],
      [-0.093, 0.129],
      [-0.112, 0.068],
      [-0.096, -0.099],
    ];
    b.extrude(soleOutline, {
      at: [s * 0.225, 0.103, 0.136],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.036,
      bevel: 0.005,
      color: "#3b3038",
      bone: foot,
      name: `shaped boot sole ${side}`,
    });
    const weltRoute = polyline(
      soleOutline.map(([x, z]) => [s * 0.225 + x, 0.12, 0.136 + z]),
      { closed: true },
    );
    b.sweep(weltRoute, 0.004, {
      color: "#b18a66",
      bone: foot,
      sides: 5,
      caps: "none",
      name: `boot welt ${side}`,
    });
    b.along(weltRoute.slice(0.28, 0.86), 13, (at) =>
      b.part(new THREE.SphereGeometry(0.0035, 5, 3), cream, {
        at,
        bone: foot,
        name: "sole stitching",
      }),
    );
    ell([s * 0.225, 0.164, 0.162], [0.11, 0.079, 0.163], bootLeather, foot, `boot ${side}`);
>>>>>>> REPLACE

<<<<<<< SEARCH
  ell(hp(0, -0.013, -0.088), [0.194, 0.175, 0.12], hair, head, "back of hair");

  for (const s of sides) {
=======
  const backHair = ell(
    hp(0, -0.013, -0.088),
    [0.194, 0.175, 0.12],
    hair,
    head,
    "back of hair",
  );
  const backHairSurface = b.surface(backHair);
  for (let i = 0; i < 7; i++) {
    const hit = backHairSurface.around(hp(0, -0.013, -0.088)).at(
      108 + i * 24,
      -7 + (i % 2) * 9,
    );
    if (!hit) continue;
    const root = hit.at;
    const length = 0.092 + (i % 3) * 0.015;
    const outward = hit.n.clone().multiplyScalar(0.022);
    const bend = root.clone()
      .add(outward)
      .add(new THREE.Vector3((i - 3) * 0.006, -length * 0.5, -0.011));
    const tip = root.clone()
      .add(new THREE.Vector3((i - 3) * 0.011, -length, -0.008));
    b.sweep(bezier(hit, bend, tip), [0.035, 0.037, 0.019, 0], {
      color: i % 2 === 0 ? paleHair : hair,
      bone: head,
      sides: 6,
      smooth: false,
      caps: { start: "round", end: "point" },
      name: "tousled rear hair lock",
    });
  }

  for (const s of sides) {
>>>>>>> REPLACE

<<<<<<< SEARCH
    ell(hp(s * 0.125, -0.054, 0.092), [0.063, 0.049, 0.035], "#eda080", head, "cheek");
    const eye = ell(hp(s * 0.083, 0.039, 0.125), [0.057, 0.058, 0.028], cream, head, "eye white");
=======
    const cheek = ell(
      hp(s * 0.125, -0.054, 0.092),
      [0.063, 0.049, 0.035],
      "#eda080",
      head,
      "cheek",
    );
    const cheekSurface = b.surface(cheek);
    const eye = ell(hp(s * 0.083, 0.039, 0.125), [0.057, 0.058, 0.028], cream, head, "eye white");
>>>>>>> REPLACE

<<<<<<< SEARCH
    for (let i = 0; i < 3; i++) {
      pin(hp(s * (0.121 + i * 0.014), -0.045 - (i % 2) * 0.009, 0.13), 0.004, head, rust);
    }
=======
    for (let i = 0; i < 3; i++) {
      const hit = cheekSurface.ray(
        hp(s * (0.121 + i * 0.014), -0.045 - (i % 2) * 0.009, 0.2),
        [0, 0, -1],
      );
      if (hit) {
        b.stick(
          new THREE.CylinderGeometry(0.004, 0.004, 0.002, 6),
          rust,
          hit,
          { embed: 0.5, bone: head, name: "seated cheek freckle" },
        );
      }
    }
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.lathe(
    [
      [0, 0],
      [0.222, 0],
      [0.248, 0.018],
      [0.249, 0.049],
      [0.216, 0.07],
      [0, 0.07],
    ],
=======
  const capBrim = b.lathe(
    [
      [0, 0],
      [0.222, 0],
      [0.248, 0.018],
      [0.249, 0.049],
      [0.216, 0.07],
      [0, 0.07],
    ],
>>>>>>> REPLACE

<<<<<<< SEARCH
  const goggleBand = b.surface(b.root).drape(
=======
  const goggleBand = b.surface([capBrim, cap]).drape(
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Aerial stays behind the hat rather than crossing the face.
  tube([0.021, 0.933, -0.388], [0.038, 1.235, -0.391], 0.006, steel, packBone);
=======
  // Aerial stays behind the hat, firmly plugged into the pack's top flap.
  b.part(new THREE.CylinderGeometry(0.018, 0.024, 0.028, 8), brass, {
    at: [0.021, 0.923, -0.388],
    bone: packBone,
    flat: true,
    name: "aerial mounting socket",
  });
  tube([0.021, 0.905, -0.388], [0.038, 1.235, -0.391], 0.006, steel, packBone);
>>>>>>> REPLACE