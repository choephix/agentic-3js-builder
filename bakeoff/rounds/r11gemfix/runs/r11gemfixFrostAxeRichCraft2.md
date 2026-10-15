The glow kit rejects procedural `Paint` instances; glowing True Ice elements must use a flat color string.

```ts
<<<<<<< SEARCH
  // True Ice: luminous glacial blue with internal refraction noise and frost glints
  const TRUE_ICE_PAINT = paint((p, n) => {
    const abyssal = [0.05, 0.25, 0.45] as const;
    const luminousCyan = [0.12, 0.76, 0.92] as const;
    const frostRim = [0.88, 0.98, 1.0] as const;
    const internalNoise = noise(p, 0.07, 43);
    const fineFrost = noise(p, 0.018, 88);
    let col = mix(abyssal, luminousCyan, internalNoise * 0.75 + fineFrost * 0.25);
    if (n.y > 0.55 || fineFrost > 0.78) {
      col = mix(col, frostRim, 0.42);
    }
    return col;
  });
=======
  // True Ice: luminous glacial cyan flat colour for glowing crystal elements
  const TRUE_ICE = "#2be4ff";
>>>>>>> REPLACE
<<<<<<< SEARCH
    // Primary crystal spire
    glow(
      b.part(new THREE.ConeGeometry(r, h, 6), TRUE_ICE_PAINT, {
        bone: altarBone,
        at: [px, 0.17 + h * 0.45, pz],
        dir: lean,
        flat: true,
        name: `crystal_spire_${idx}`,
      }),
      1.1,
    );

    // Small satellite shard
    const subRad = rad + 0.15;
    const subX = Math.cos(subRad) * (dist - 0.04);
    const subZ = Math.sin(subRad) * (dist - 0.04);
    glow(
      b.part(new THREE.ConeGeometry(r * 0.55, h * 0.45, 5), TRUE_ICE_PAINT, {
        bone: altarBone,
        at: [subX, 0.17 + h * 0.2, subZ],
        dir: [Math.cos(subRad) * 0.5, 0.9, Math.sin(subRad) * 0.5],
        flat: true,
        name: `crystal_sub_${idx}`,
      }),
      1.0,
    );
=======
    // Primary crystal spire
    glow(
      b.part(new THREE.ConeGeometry(r, h, 6), TRUE_ICE, {
        bone: altarBone,
        at: [px, 0.17 + h * 0.45, pz],
        dir: lean,
        flat: true,
        name: `crystal_spire_${idx}`,
      }),
      1.1,
    );

    // Small satellite shard
    const subRad = rad + 0.15;
    const subX = Math.cos(subRad) * (dist - 0.04);
    const subZ = Math.sin(subRad) * (dist - 0.04);
    glow(
      b.part(new THREE.ConeGeometry(r * 0.55, h * 0.45, 5), TRUE_ICE, {
        bone: altarBone,
        at: [subX, 0.17 + h * 0.2, subZ],
        dir: [Math.cos(subRad) * 0.5, 0.9, Math.sin(subRad) * 0.5],
        flat: true,
        name: `crystal_sub_${idx}`,
      }),
      1.0,
    );
>>>>>>> REPLACE
<<<<<<< SEARCH
  glow(
    b.extrude(TRUE_ICE_MAIN_OUTLINE, {
      bone: bladeMain,
      at: [0, 1.59, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.024,
      bevel: 0.004,
      smoothing: 1,
      color: TRUE_ICE_PAINT,
      name: "blade_main_true_ice",
    }),
    1.25,
  );

  // D. Crystalline Spikes Jutting from the Blade Spine
  const spineSpikes = [
    { at: [0.16, 1.76, 0], dir: [0.32, 0.92, 0], len: 0.09, r: 0.016 },
    { at: [0.22, 1.81, 0], dir: [0.44, 0.82, 0], len: 0.11, r: 0.018 },
    { at: [0.28, 1.86, 0], dir: [0.55, 0.72, 0], len: 0.08, r: 0.014 },
  ];
  spineSpikes.forEach((spk, idx) => {
    glow(
      b.spike(spk.at, spk.dir, spk.len, spk.r, {
        bone: bladeMain,
        color: TRUE_ICE_PAINT,
        section: { ngon: 5 },
        name: `spine_spike_${idx}`,
      }),
      1.3,
    );
  });

  // E. Crystalline Icicles Hanging from Bearded Blade Hook
  const icicles = [
    { at: [0.32, 1.15, 0], len: 0.09, r: 0.009 },
    { at: [0.28, 1.2, 0], len: 0.065, r: 0.007 },
    { at: [0.24, 1.25, 0], len: 0.045, r: 0.006 },
  ];
  icicles.forEach((ici, idx) => {
    glow(
      b.spike(ici.at, [0, -1, 0], ici.len, ici.r, {
        bone: bladeMain,
        color: TRUE_ICE_PAINT,
        section: { ngon: 5 },
        name: `icicle_${idx}`,
      }),
      1.2,
    );
  });
=======
  glow(
    b.extrude(TRUE_ICE_MAIN_OUTLINE, {
      bone: bladeMain,
      at: [0, 1.59, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.024,
      bevel: 0.004,
      smoothing: 1,
      color: TRUE_ICE,
      name: "blade_main_true_ice",
    }),
    1.25,
  );

  // D. Crystalline Spikes Jutting from the Blade Spine
  const spineSpikes = [
    { at: [0.16, 1.76, 0], dir: [0.32, 0.92, 0], len: 0.09, r: 0.016 },
    { at: [0.22, 1.81, 0], dir: [0.44, 0.82, 0], len: 0.11, r: 0.018 },
    { at: [0.28, 1.86, 0], dir: [0.55, 0.72, 0], len: 0.08, r: 0.014 },
  ];
  spineSpikes.forEach((spk, idx) => {
    glow(
      b.spike(spk.at, spk.dir, spk.len, spk.r, {
        bone: bladeMain,
        color: TRUE_ICE,
        section: { ngon: 5 },
        name: `spine_spike_${idx}`,
      }),
      1.3,
    );
  });

  // E. Crystalline Icicles Hanging from Bearded Blade Hook
  const icicles = [
    { at: [0.32, 1.15, 0], len: 0.09, r: 0.009 },
    { at: [0.28, 1.2, 0], len: 0.065, r: 0.007 },
    { at: [0.24, 1.25, 0], len: 0.045, r: 0.006 },
  ];
  icicles.forEach((ici, idx) => {
    glow(
      b.spike(ici.at, [0, -1, 0], ici.len, ici.r, {
        bone: bladeMain,
        color: TRUE_ICE,
        section: { ngon: 5 },
        name: `icicle_${idx}`,
      }),
      1.2,
    );
  });
>>>>>>> REPLACE
<<<<<<< SEARCH
  glow(
    b.extrude(TRUE_ICE_HOOK_OUTLINE, {
      bone: bladeBack,
      at: [0, 1.59, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.022,
      bevel: 0.004,
      smoothing: 1,
      color: TRUE_ICE_PAINT,
      name: "blade_back_true_ice",
    }),
    1.25,
  );

  // C. Back Hook Ice Spikes
  glow(
    b.spike([-0.18, 1.7, 0], [-0.5, 0.8, 0], 0.075, 0.014, {
      bone: bladeBack,
      color: TRUE_ICE_PAINT,
      section: { ngon: 5 },
      name: "back_spike_0",
    }),
    1.3,
  );
  glow(
    b.spike([-0.25, 1.66, 0], [-0.7, 0.6, 0], 0.09, 0.016, {
      bone: bladeBack,
      color: TRUE_ICE_PAINT,
      section: { ngon: 5 },
      name: "back_spike_1",
    }),
    1.3,
  );
=======
  glow(
    b.extrude(TRUE_ICE_HOOK_OUTLINE, {
      bone: bladeBack,
      at: [0, 1.59, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.022,
      bevel: 0.004,
      smoothing: 1,
      color: TRUE_ICE,
      name: "blade_back_true_ice",
    }),
    1.25,
  );

  // C. Back Hook Ice Spikes
  glow(
    b.spike([-0.18, 1.7, 0], [-0.5, 0.8, 0], 0.075, 0.014, {
      bone: bladeBack,
      color: TRUE_ICE,
      section: { ngon: 5 },
      name: "back_spike_0",
    }),
    1.3,
  );
  glow(
    b.spike([-0.25, 1.66, 0], [-0.7, 0.6, 0], 0.09, 0.016, {
      bone: bladeBack,
      color: TRUE_ICE,
      section: { ngon: 5 },
      name: "back_spike_1",
    }),
    1.3,
  );
>>>>>>> REPLACE
<<<<<<< SEARCH
  glow(
    b.extrude(SPEAR_CROSS_OUTLINE, {
      bone: topSpike,
      at: [0, 1.73, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.002,
      color: TRUE_ICE_PAINT,
      name: "spear_blade_cross",
    }),
    1.2,
  );
=======
  glow(
    b.extrude(SPEAR_CROSS_OUTLINE, {
      bone: topSpike,
      at: [0, 1.73, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.002,
      color: TRUE_ICE,
      name: "spear_blade_cross",
    }),
    1.2,
  );
>>>>>>> REPLACE
```