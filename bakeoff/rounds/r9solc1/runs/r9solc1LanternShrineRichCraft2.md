1. **Close the structural gaps.** Extend the torii pillars into the upper beam and add visible roof brackets and rafters, so neither roof nor gate reads as suspended.
2. **Seat the small fittings properly.** Connect door handles to their leaves and lower the incense assembly onto its actual step.
3. **Refine the surface palette.** Replace noisy wood grain, speckled lacquer and camouflage-like stone with quieter, warmer finishes that suit the illustrated fantasy style.
4. **Strengthen the shrine’s story.** Add a modest rack of votive prayer plaques beside the sanctuary, repeating its blossom motif.
5. **Give the setting a sakura accent.** Turn one rear shrub into a flowering ornamental tree, keeping the doorway and guardians clear.

<<<<<<< SEARCH
  const lacquer = paint((p, n) => {
    const t = noise(p, 0.28, 14);
    let col = mix(C.redDark, C.red, 0.55 + 0.3 * t);
    if (n.y > 0.6) col = mix(col, C.scarlet, 0.25);
    if (noise(p, 0.035, 23) > 0.74) col = mix(col, "#eea074", 0.18);
    return col;
  });
=======
  const lacquer = paint((p, n) => {
    const t = noise(p, 0.38, 14);
    let col = mix("#862b3e", "#cc4650", 0.56 + 0.18 * t);
    if (n.y > 0.55) col = mix(col, "#e76c60", 0.2);
    if (p.y < 0.8) col = mix(col, C.redDark, 0.12);
    return col;
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const stone = paint((p, n) => {
    let col = mix(C.stoneDark, C.stoneLight, 0.4 + 0.25 * n.y + 0.2 * noise(p, 0.18, 4));
    if (n.y > 0.35 && noise(p, 0.13, 26) > 0.64)
      col = mix(col, C.moss, 0.4);
    return col;
  });
=======
  const stone = paint((p, n) => {
    let col = mix("#71838b", "#d0d1c5", 0.53 + 0.19 * n.y + 0.1 * noise(p, 0.32, 4));
    if (p.y < 0.44 && n.y > 0.55 && noise(p, 0.24, 26) > 0.67)
      col = mix(col, C.moss, 0.22);
    return col;
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const timber = grain("#422b3c", "#815053", {
    size: 0.018,
    axis: "y",
    seed: 31,
  });
=======
  const timber = grain("#573741", "#70464c", {
    size: 0.045,
    axis: "y",
    seed: 31,
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
    cylinder([x, 1.915, gateZ], 0.16, 0.19, 2.85, lacquer, 12);
=======
    cylinder([x, 1.985, gateZ], 0.16, 0.19, 2.99, lacquer, 12);
>>>>>>> REPLACE

<<<<<<< SEARCH
    cylinder([x, 3.29, gateZ], 0.181, 0.181, 0.095, goldPaint, 12);
=======
    cylinder([x, 3.425, gateZ], 0.181, 0.181, 0.095, goldPaint, 12);
>>>>>>> REPLACE

<<<<<<< SEARCH
    torus([s * 0.325, 1.46, -0.17], 0.043, 0.008, goldPaint);
    cylinder([s * 0.325, 1.507, -0.173], 0.015, 0.015, 0.028, C.goldLight, 8, [0, 0, 1]);
=======
    torus([s * 0.325, 1.46, -0.184], 0.043, 0.008, goldPaint);
    cylinder([s * 0.325, 1.507, -0.202], 0.015, 0.015, 0.047, C.goldLight, 8, [0, 0, 1]);
    cylinder([s * 0.325, 1.507, -0.218], 0.025, 0.025, 0.012, C.goldDark, 8, [0, 0, 1]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Broad tile courses keep the low-poly roof legible.
=======
  // The roof is carried by exposed rafters and stacked timber brackets.
  // Their upper faces bury into the tiled shell rather than floating below it.
  for (const z of [shrineZ - 0.66, shrineZ, shrineZ + 0.66]) {
    b.sweep(
      polyline([
        [-1.34, 2.568, z],
        [-1.15, 2.574, z],
        [-0.85, 2.665, z],
        [0, 3.035, z],
        [0.85, 2.665, z],
        [1.15, 2.574, z],
        [1.34, 2.568, z],
      ]),
      () => [0.036, 0.048],
      {
        section: "box",
        caps: "flat",
        color: C.redDark,
        bone: root,
        name: "exposedRoofRafter",
      },
    );
  }

  for (const s of [-1, 1]) {
    box([s * 0.75, 2.475, shrineZ], [0.15, 0.22, 1.12], lacquer);
    box([s * 0.75, 2.605, shrineZ], [0.245, 0.07, 1.23], C.redDark);
    box([s * 0.75, 2.651, shrineZ], [0.3, 0.035, 1.26], goldPaint);
    for (const z of [shrineZ - 0.51, shrineZ + 0.51]) {
      b.extrude(
        [[-0.035, 0], [0.035, 0], [0.26, 0.19], [0.26, 0.245], [0.14, 0.245]],
        {
          at: [s * 0.75, 2.35, z],
          x: [s, 0, 0],
          y: [0, 1, 0],
          thickness: 0.09,
          color: lacquer,
          bone: root,
          name: "eaveCorbel",
        },
      );
      box([s * 0.943, 2.6, z], [0.23, 0.045, 0.13], goldPaint);
    }
  }

  // Broad tile courses keep the low-poly roof legible.
>>>>>>> REPLACE

<<<<<<< SEARCH
    { at: [0, 0.456, 0.452], color: goldPaint, bone: root, segments: 10 },
  );
  cylinder([0, 0.535, 0.452], 0.092, 0.092, 0.02, "#a19a8b", 12);
  for (let j = 0; j < 5; j++) {
    const x = (j - 2) * 0.026;
    const z = 0.452 + (j % 2 ? 0.013 : -0.015);
    const tipY = 0.746 + (j % 3) * 0.022;
    rod([x, 0.532, z], [x + (j - 2) * 0.005, tipY, z], 0.004, C.redDark);
    glow(ellipsoid([x + (j - 2) * 0.005, tipY, z], [0.006, 0.009, 0.006], "#ffab79"), 1.1);
  }
  for (const s of [-1, 1]) {
    torus([s * 0.135, 0.535, 0.452], 0.032, 0.009, C.goldDark, [0, 90, 0]);
    ellipsoid([s * 0.126, 0.516, 0.452], [0.027, 0.029, 0.027], C.gold);
  }
=======
    { at: [0, 0.35, 0.452], color: goldPaint, bone: root, segments: 10 },
  );
  cylinder([0, 0.429, 0.452], 0.092, 0.092, 0.02, "#a19a8b", 12);
  for (let j = 0; j < 5; j++) {
    const x = (j - 2) * 0.026;
    const z = 0.452 + (j % 2 ? 0.013 : -0.015);
    const tipY = 0.64 + (j % 3) * 0.022;
    rod([x, 0.426, z], [x + (j - 2) * 0.005, tipY, z], 0.004, C.redDark);
    glow(ellipsoid([x + (j - 2) * 0.005, tipY, z], [0.006, 0.009, 0.006], "#ffab79"), 1.1);
  }
  for (const s of [-1, 1]) {
    torus([s * 0.135, 0.429, 0.452], 0.032, 0.009, C.goldDark, [0, 90, 0]);
    ellipsoid([s * 0.126, 0.41, 0.452], [0.027, 0.029, 0.027], C.gold);
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Mossy roadside stones are clustered outside the clear processional path.
=======
  // A small ema rack gives the roadside sanctuary a lived-in ritual purpose.
  // It sits beside, not in front of, the lantern and doorway.
  const prayerArt = svg(
    `<svg viewBox="0 0 120 100">
      <path d="M5 28L60 5L115 28V95H5Z" fill="#c99566" stroke="#6c4645" stroke-width="6"/>
      <path d="M13 35L60 15L107 35V87H13Z" fill="none" stroke="#efca92" stroke-width="3"/>
      <path d="M43 51L50 40L60 45L70 40L77 51L70 62L73 73L60 69L47 73L50 62Z"
        fill="#a94f65"/>
      <circle cx="60" cy="56" r="5" fill="#ffe3a3"/>
      <path d="M20 77H36 M84 77H100" stroke="#81524b" stroke-width="3"/>
    </svg>`,
    { size: 192 },
  );

  const rackX = -2.055;
  const rackZ = -0.39;
  for (const s of [-1, 1]) {
    box([rackX + s * 0.245, 0.255, rackZ], [0.155, 0.1, 0.2], stone);
    box([rackX + s * 0.245, 0.765, rackZ], [0.055, 1.02, 0.065], timber);
    box([rackX + s * 0.245, 1.22, rackZ], [0.07, 0.045, 0.075], goldPaint);
  }
  box([rackX, 1.255, rackZ], [0.64, 0.085, 0.12], lacquer);
  box([rackX, 1.307, rackZ], [0.7, 0.035, 0.16], C.roofDark);
  box([rackX, 1.331, rackZ + 0.084], [0.69, 0.012, 0.012], goldPaint);
  box([rackX, 0.865, rackZ], [0.55, 0.036, 0.045], C.redDark);

  for (let row = 0; row < 2; row++) {
    for (let j = 0; j < 3; j++) {
      const x = rackX + (j - 1) * 0.165;
      const y = 1.08 - row * 0.355;
      const z = rackZ + 0.072;
      const barY = row === 0 ? 1.24 : 0.865;
      b.sweep(
        [[x - 0.018, y + 0.09, z],
         [x, barY, rackZ + 0.035],
         [x + 0.018, y + 0.09, z]],
        0.004,
        { color: C.rope, bone: root, sides: 4, caps: "flat" },
      );
      b.extrude(
        [[-0.067, 0.044], [0, 0.087], [0.067, 0.044], [0.067, -0.07], [-0.067, -0.07]],
        {
          at: [x, y, z],
          x: [1, 0, 0],
          y: [0, 1, 0],
          thickness: 0.016,
          color: "#c99566",
          bone: root,
          name: "woodenPrayerPlaque",
        },
      );
      drawing([x, y + 0.008, z + 0.009], 0.135, 0.155, prayerArt);
    }
  }

  // Mossy roadside stones are clustered outside the clear processional path.
>>>>>>> REPLACE

<<<<<<< SEARCH
      ellipsoid([x + dx, y, z + dz], [0.22, 0.12, 0.19], i % 2 ? C.leaf : C.moss);
      ellipsoid([x + dx + 0.07, y + 0.055, z + dz + 0.07], [0.13, 0.065, 0.12], C.mossLight);
=======
      const flowering = s < 0;
      ellipsoid(
        [x + dx, y, z + dz],
        [0.25, 0.135, 0.215],
        flowering ? (i % 2 ? "#ca7e9e" : "#e8a4b5") : (i % 2 ? C.leaf : C.moss),
      );
      ellipsoid(
        [x + dx + 0.07, y + 0.055, z + dz + 0.07],
        [0.155, 0.075, 0.14],
        flowering ? C.blossomLight : C.mossLight,
      );
      if (flowering) {
        blossom([x + dx - 0.08, y + 0.04, z + dz + 0.18], 0.042);
        blossom([x + dx + 0.1, y - 0.025, z + dz + 0.16], 0.035);
      }
>>>>>>> REPLACE