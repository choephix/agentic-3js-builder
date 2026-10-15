1. **Fix the fuselage’s reversed face winding.** Its exterior is being culled, making the body read as an open trough and exposing cockpit fittings through the sides.
2. **Give the propeller convincing laminated wood.** Replace the sandy-looking grain with broad, warm wood tones and long lamination lines.
3. **Calm the setting’s textures.** Softer grass and directional straw keep the aircraft—not surface noise—as the hero.
4. **Add a little pilot personality without a pilot.** A leather flying cap and brass goggles resting on the seat make the open cockpit feel inhabited.
5. **Finish the low-angle details.** Add underside insignia and correctly align the exhaust’s retaining collars.

<<<<<<< SEARCH
      hullIndices.push(a, a + 1, d, a + 1, d + 1, d);
=======
      hullIndices.push(a, d, a + 1, a + 1, d, d + 1);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const groundPaint = paint((p, n) => {
    if (n.y < 0.3) return "#38525a";
    const v = noise(p, 0.35, 23);
    const speck = noise(p, 0.022, 17);
    const grass = mix("#69816e", "#a6ad81", v);
    return speck > 0.74 ? mix(grass, "#d7c69a", 0.36) : grass;
  });
  const strawPaint = grain("#a58746", "#e3c579", {
    size: 0.013,
    axis: "x",
    seed: 14,
  });
=======
  const groundPaint = paint((p, n) => {
    if (n.y < 0.3) return "#38525a";
    const broad = noise(p, 0.65, 23);
    const fine = noise(p, 0.045, 17);
    return mix("#7d9274", "#a2ad83", 0.22 + broad * 0.48 + fine * 0.10);
  });
  const strawPaint = paint((p, n) => {
    const across = Math.abs(n.z) > Math.abs(n.y) ? p.y : p.z;
    const strand = Math.sin(across * 410 + Math.sin(p.x * 11) * 0.55);
    const broad = noise(p, 0.18, 14);
    const base = mix("#bc9e59", "#ddc17d", 0.32 + broad * 0.35);
    return strand > 0.90 ? mix(base, "#f1d994", 0.24)
      : strand < -0.93 ? mix(base, "#96773d", 0.18)
      : base;
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const propWood = grain("#8b512e", "#d8a26b", {
    size: 0.015,
    axis: [Math.sin(bladeAngle), Math.cos(bladeAngle), 0],
    seed: 33,
  });
=======
  const propWood = paint((p, n) => {
    const cross = p.x * Math.cos(bladeAngle)
      - (p.y - 1.5) * Math.sin(bladeAngle);
    const along = Math.abs(p.x * Math.sin(bladeAngle)
      + (p.y - 1.5) * Math.cos(bladeAngle));
    const layer = Math.floor((cross + 0.20) / 0.037);
    const base = layer % 2 === 0 ? "#c28a4f" : "#e3b577";
    const grainLine = Math.sin(cross * 710 + Math.sin(along * 8) * 0.9);
    const shade = mix(base, "#855333", n.z < 0 ? 0.24 : 0.04);
    return grainLine > 0.95 ? mix(shade, "#89582f", 0.18) : shade;
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.stick(new THREE.CylinderGeometry(0.059, 0.059, 0.026, 8), C.brass,
      exhaust.at(0.32), { bone: aircraft, embed: 0.5 });
=======
    const collarPoint = exhaust.curve().at(0.32);
    const collarAxis = exhaust.curve().tangentAt(0.32);
    b.part(new THREE.CylinderGeometry(0.059, 0.059, 0.026, 8), C.brass, {
      at: collarPoint,
      dir: collarAxis,
      bone: aircraft,
      flat: true,
      name: `exhaust retaining collar ${s}`,
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
  box([0, 1.80, -1.038], [0.26, 0.12, 0.10], C.leatherDark);

  for (const s of [-1, 1]) {
=======
  box([0, 1.80, -1.038], [0.26, 0.12, 0.10], C.leatherDark);

  // The absent aviator's cap and goggles rest on the seat back.
  ellipsoid(
    [0, 1.859, -1.018],
    [0.157, 0.083, 0.107],
    leather,
    aircraft,
    "resting leather flying cap",
  );
  for (const s of [-1, 1]) {
    b.slab([
      [s * 0.124, 1.871, -1.005],
      [s * 0.155, 1.829, -1.013],
      [s * 0.143, 1.747, -0.999],
      [s * 0.103, 1.769, -0.981],
    ], {
      thickness: 0.016,
      color: leather,
      bone: aircraft,
      name: `flying cap ear flap ${s}`,
    });
    cylinder(
      [s * 0.074, 1.857, -0.919],
      0.057,
      0.022,
      C.leatherDark,
      [0, 0, 1],
      aircraft,
      12,
    );
    cylinder(
      [s * 0.074, 1.857, -0.903],
      0.044,
      0.010,
      "#a9d8d3",
      [0, 0, 1],
      aircraft,
      12,
    );
    ring(
      [s * 0.074, 1.857, -0.894],
      0.050,
      0.008,
      C.brass,
      [0, 0, 1],
      aircraft,
      16,
    );
    b.rod(
      [s * 0.093, 1.875, -0.887],
      [s * 0.064, 1.878, -0.887],
      0.004,
      { color: "#e9f5db", bone: aircraft, sides: 4 },
    );
    pin([s * 0.142, 1.788, -0.983], 0.011, C.brass);
  }
  b.rod([-0.025, 1.864, -0.903], [0.025, 1.864, -0.903], 0.009, {
    color: C.brass,
    bone: aircraft,
    sides: 6,
  });
  b.sweep(catmull([
    [-0.13, 1.854, -0.926],
    [-0.154, 1.852, -1.017],
    [0, 1.873, -1.124],
    [0.154, 1.852, -1.017],
    [0.13, 1.854, -0.926],
  ]), 0.012, {
    color: C.leatherDark,
    bone: aircraft,
    sides: 6,
    name: "goggle leather strap",
  });

  for (const s of [-1, 1]) {
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.decal(upperWing, patchTexture, {
=======
  for (const s of [-1, 1]) {
    b.decal(lowerWing, roundel, {
      at: [s * 2.42, 1.02, 0.32],
      dir: [0, -1, 0],
      up: [0, 0, 1],
      size: [0.65, 0.65],
      lift: 0.004,
      segments: 8,
      bone: aircraft,
      name: `underwing circus insignia ${s}`,
    });
  }

  b.decal(upperWing, patchTexture, {
>>>>>>> REPLACE