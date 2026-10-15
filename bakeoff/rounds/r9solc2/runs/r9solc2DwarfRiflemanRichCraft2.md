1. **Make the beard read as woven hair, not strings of beads.** Replace the round braid segments with overlapping angular plaits and fine strand grooves.
2. **Finish the hood.** Cover the exposed rear scalp, soften the oversized cloth grid into subtle woven fabric, and add a deliberate embroidered forehead band.
3. **Strengthen the armor.** Add seated pauldron rivets and sculpted ram horns; replace the rounded shoe-like toe caps with broad, angular sabatons.
4. **Clean up the setting.** Lift the snow caps enough to eliminate exposed stone centers, and move the nameplate forward so both lines remain readable.

<<<<<<< SEARCH
  const CLOTH = paint((p, n) => {
    const u = (p.x + p.y) / 0.085;
    const v = (p.x - p.y) / 0.085;
    const edge = Math.min(
      Math.abs(u - Math.round(u)),
      Math.abs(v - Math.round(v)),
    );
    const base = mix("#294a3c", "#56764f", 0.35 + 0.3 * Math.max(0, n.y));
    return edge < 0.045 ? mix(base, "#142c28", 0.5) : base;
  });
=======
  const CLOTH = paint((p, n) => {
    const weave =
      Math.sin(p.x * 1500) * Math.sin(p.y * 1500) * 0.018;
    const wear = (noise(p, 0.11, 23) - 0.5) * 0.065;
    return mix(
      "#234334",
      "#658252",
      0.38 + Math.max(0, n.y) * 0.3 + wear + weave,
    );
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
      ell([x, 0.162, z], [0.17, 0.022, 0.105], C.snow, root);
=======
      ell([x, 0.181, z], [0.17, 0.028, 0.105], C.snow, root);
>>>>>>> REPLACE

<<<<<<< SEARCH
  box([0, 0.13, 0.787], [0.64, 0.17, 0.055], BRASS, root, [-12, 0, 0]);
  drawing([0, 0.135, 0.821], 0.61, 0.19, plaqueTexture, root, [0, 0.2, 1]);
=======
  box([0, 0.12, 0.875], [0.67, 0.185, 0.06], BRASS, root);
  drawing([0, 0.12, 0.908], 0.64, 0.18, plaqueTexture, root);
  for (const s of [1, -1]) {
    ell([s * 0.316, 0.12, 0.912], [0.009, 0.009, 0.005], C.goldLight);
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
    ell([s * 0.28, 0.302, 0.252], [0.151, 0.085, 0.096], STEEL, foot);
    box([s * 0.28, 0.337, 0.29], [0.22, 0.019, 0.025], BRASS, foot);
=======
    b.frustumBox(
      [s * 0.28, 0.294, 0.16],
      [s * 0.28, 0.272, 0.335],
      [0.305, 0.155],
      [0.275, 0.115],
      { color: STEEL, bone: foot },
    );
    box([s * 0.28, 0.316, 0.339], [0.245, 0.018, 0.018], BRASS, foot);
    line(
      [s * 0.28, 0.367, 0.164],
      [s * 0.28, 0.331, 0.325],
      0.009,
      BRASS,
      foot,
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
    ell([s * 0.467, 1.318, 0], [0.229, 0.137, 0.232], STEEL, shoulder);

    for (let i = 0; i < 3; i++) {
=======
    const shoulderShell = ell(
      [s * 0.467, 1.318, 0],
      [0.229, 0.137, 0.232],
      STEEL,
      shoulder,
    );
    const shoulderSurface = b.surface(shoulderShell);
    for (const azimuth of [-125, -65, 0, 65, 125, 180]) {
      const hit = shoulderSurface
        .around([s * 0.467, 1.318, 0])
        .at(azimuth, 28);
      if (hit) {
        b.stick(
          new THREE.CylinderGeometry(0.014, 0.018, 0.012, 6),
          BRASS,
          hit,
          { embed: 0.35, bone: shoulder },
        );
      }
    }
    const crownRib = shoulderSurface.drape(
      [
        [s * 0.467, 1.37, -0.21],
        [s * 0.467, 1.48, -0.1],
        [s * 0.467, 1.48, 0.075],
        [s * 0.467, 1.37, 0.21],
      ],
      { lift: 0.006 },
    );
    b.sweep(crownRib, 0.011, {
      color: BRASS,
      bone: shoulder,
      sides: 5,
    });

    for (let i = 0; i < 3; i++) {
>>>>>>> REPLACE

<<<<<<< SEARCH
    drawing([s * 0.458, 1.307, 0.283], 0.184, 0.213, ramTexture, shoulder);
    for (const dx of [-0.073, 0.073]) {
=======
    drawing([s * 0.458, 1.307, 0.283], 0.184, 0.213, ramTexture, shoulder);
    for (const hornSide of [1, -1]) {
      const cx = s * 0.458;
      b.sweep(
        catmull([
          [cx + hornSide * 0.035, 1.339, 0.295],
          [cx + hornSide * 0.061, 1.372, 0.299],
          [cx + hornSide * 0.085, 1.351, 0.3],
          [cx + hornSide * 0.079, 1.318, 0.302],
          [cx + hornSide * 0.055, 1.319, 0.304],
          [cx + hornSide * 0.057, 1.338, 0.306],
        ]),
        [0.012, 0.014, 0.013, 0.011, 0.008, 0.003],
        {
          color: BRASS,
          bone: shoulder,
          sides: 6,
          caps: "flat",
        },
      );
    }
    for (const dx of [-0.073, 0.073]) {
>>>>>>> REPLACE

<<<<<<< SEARCH
    const pitch = (top - bottom) / courses;
    for (let i = 0; i < courses; i++) {
      const y = top - pitch * (i + 0.5);
      const taper = 1 - i * 0.045;
      for (const side of [1, -1]) {
        ell(
          [
            x + side * width * 0.235 * taper,
            y + side * pitch * 0.12,
            z + 0.046 + (i % 2 === 0 ? side : -side) * 0.009,
          ],
          [width * 0.38 * taper, pitch * 0.68, width * 0.34],
          (i + (side > 0 ? 1 : 0)) % 2 ? HAIR_LIGHT : HAIR,
          jaw, [0, 0, side * 43],
        );
      }
    }
=======
    const pitch = (top - bottom) / courses;
    for (let i = 0; i < courses; i++) {
      const y = top - pitch * (i + 0.5);
      const taper = 1 - i * 0.04;
      const w = width * taper;
      for (const side of [-1, 1]) {
        const cy = y + side * pitch * 0.19;
        const front = z + 0.047 + (side > 0 ? 0.009 : 0);
        const plait = b.extrude(
          [
            [-w * 0.46, pitch * 0.37],
            [-w * 0.22, pitch * 0.64],
            [w * 0.37, pitch * 0.05],
            [w * 0.38, -pitch * 0.31],
            [w * 0.13, -pitch * 0.53],
            [-w * 0.25, -pitch * 0.06],
          ],
          {
            at: [x, cy, front],
            x: [side, 0, 0],
            y: [0, 1, 0],
            thickness: w * 0.47,
            bevel: w * 0.075,
            color: side > 0 ? HAIR_LIGHT : HAIR,
            bone: jaw,
            name: `braid_${x < 0 ? "R" : x > 0 ? "L" : "C"}_${i}_${side > 0 ? "over" : "under"}`,
          },
        );
        const faceSign = side > 0 ? 1 : -1;
        for (const groove of [-0.075, 0.075]) {
          b.sweep(
            bezier(
              plait.local([
                -w * 0.25 + groove * w,
                pitch * 0.37,
                faceSign * w * 0.244,
              ]),
              plait.local([
                w * 0.02 + groove * w,
                pitch * 0.1,
                faceSign * w * 0.247,
              ]),
              plait.local([
                w * 0.23 + groove * w,
                -pitch * 0.25,
                faceSign * w * 0.244,
              ]),
            ),
            [0.0018, 0.0022, 0.0008],
            {
              color: groove < 0 ? C.beardDark : C.beardLight,
              bone: jaw,
              sides: 4,
              caps: "flat",
            },
          );
        }
      }
    }
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Rifleman's green peaked hood: forehead clear, folded sides, thick woven lip.
  b.lathe(
=======
  // Rifleman's green peaked hood: forehead clear, folded sides, thick woven lip.
  b.loft(
    [
      { at: [0, 1.365, -0.158], w: 0.33, h: 0.105 },
      { at: [0, 1.47, -0.186], w: 0.44, h: 0.115 },
      { at: [0, 1.58, -0.172], w: 0.48, h: 0.14 },
      { at: [0, 1.687, -0.128], w: 0.43, h: 0.15 },
    ],
    {
      color: CLOTH,
      bone: head,
      sides: 8,
      caps: "flat",
      name: "hood_rear_drape",
    },
  );
  const hoodShell = b.lathe(
>>>>>>> REPLACE

<<<<<<< SEARCH
    { at: [0, 1.628, 0.005], axis: [0, 1, -0.1], segments: 10, color: CLOTH, bone: head },
  );
  b.sweep(
    catmull([[0.035, 1.847, -0.01], [0.081, 1.903, -0.025], [0.159, 1.888, -0.069], [0.209, 1.833, -0.092]]),
=======
    { at: [0, 1.628, 0.005], axis: [0, 1, -0.1], segments: 10, color: CLOTH, bone: head },
  );
  b.decal(hoodShell, knotTexture, {
    at: [0, 1.717, 0.246],
    dir: [0, 0.16, 1],
    up: [0, 1, 0],
    size: [0.39, 0.047],
    segments: 10,
    lift: 0.002,
    bone: head,
    name: "embroidered_hood_band",
  });
  b.sweep(
    catmull([[0.035, 1.847, -0.01], [0.081, 1.903, -0.025], [0.159, 1.888, -0.069], [0.209, 1.833, -0.092]]),
>>>>>>> REPLACE