1. **Round the tyre shoulders.** The current wheels read as solid drums; a faceted, rounded tyre profile keeps their chunky charm while making the landing gear more convincing.
2. **Clean up the fuselage paint and enrich the golden wings.** The scattered bright patches distract from the lovely silhouette and circus graphics. Wear becomes restrained and localized.
3. **Add golden leading-edge piping.** This gives the thin wings a clearer, finished silhouette without making them bulky.
4. **Add an aviator’s teal scarf draped over the cockpit rim.** Two distinct tails, cream woven stripes, and tassels bring personality without obscuring the engine or markings.
5. **Deepen the windsock’s opening.** Its red disk currently resembles a closed cap rather than a hollow fabric mouth.

<<<<<<< SEARCH
    const col = mix("#d5a54a", "#ffe7a0", 0.42 + light);
    return rib < 0.11 ? mix(col, C.cream, 0.35) : col;
  });

  const fuselagePaint = paint((p, n) => {
    if (n.y < -0.38) return "#efd2a0";
    const warm = 0.22 + Math.max(0, n.y) * 0.40;
    let col = mix("#a6373c", "#ec6750", warm);
    const wear = noise(p, 0.10, 7);
    if (wear > 0.73 && n.y > 0.2)
      col = mix(col, "#f6b17c", 0.2);
    return col;
  });
=======
    const col = mix("#d6a044", "#ffe498", 0.58 + light);
    return rib < 0.11 ? mix(col, C.cream, 0.30) : col;
  });

  const fuselagePaint = paint((p, n) => {
    if (n.y < -0.38) return "#efd2a0";
    const warm = 0.30 + Math.max(0, n.y) * 0.35;
    let col = mix("#b33c3c", "#eb694e", warm);
    // Soft, restrained tonal drift instead of conspicuous all-over chipping.
    col = mix(col, "#ef8058", noise(p, 0.48, 7) * 0.045);
    if (p.z > 1.03 && p.z < 1.55 && n.y < -0.12)
      col = mix(col, "#69423a", 0.15);
    return col;
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const skin = b.surface(wing.part);
    for (let i = -10; i <= 10; i++) {
=======
    const skin = b.surface(wing.part);
    const leadingEdge = skin.drape(
      polyline([
        [-wing.span, wing.y, wing.z + 0.375],
        [-wing.span + 0.26, wing.y, wing.z + 0.57],
        [-2.70, wing.y, wing.z + wing.chord * 0.49],
        [0, wing.y, wing.z + wing.chord * 0.49],
        [2.70, wing.y, wing.z + wing.chord * 0.49],
        [wing.span - 0.26, wing.y, wing.z + 0.57],
        [wing.span, wing.y, wing.z + 0.375],
      ]),
      { lift: 0.004 },
    );
    b.sweep(leadingEdge, 0.013, {
      color: C.gold,
      bone: aircraft,
      sides: 6,
      caps: "round",
      name: `golden leading-edge binding ${wing.y}`,
    });
    for (let i = -10; i <= 10; i++) {
>>>>>>> REPLACE

<<<<<<< SEARCH
  box([0, 1.17, -0.65], [0.54, 0.07, 0.78], C.leatherDark);
=======
  // A scarf laid over the rear-left coaming: the broad cloth tails stand
  // outside the narrowing hull, rather than disappearing into its shell.
  const scarfCloth = paint((p, n) => {
    const band = ((p.y * 15 + p.z * 1.2) % 1 + 1) % 1;
    const weave = Math.sin(p.y * 650) * Math.sin(p.z * 650);
    const base = mix("#247a82", "#4dafad", 0.42 + Math.max(0, n.y) * 0.22);
    if (band < 0.075) return "#ffe9b9";
    if (band > 0.13 && band < 0.165) return "#c9d8bb";
    return mix(base, "#94c2b0", Math.max(0, weave) * 0.025);
  });
  b.sweep(
    catmull([
      [0.24, 1.771, -1.07],
      [0.34, 1.685, -1.095],
      [0.385, 1.606, -1.115],
    ]),
    () => [0.055, 0.019],
    {
      color: scarfCloth,
      bone: aircraft,
      sides: 8,
      caps: "round",
      name: "scarf folded over cockpit rim",
    },
  );
  ellipsoid(
    [0.392, 1.594, -1.115],
    [0.048, 0.047, 0.065],
    scarfCloth,
    aircraft,
    "scarf knot",
  );
  b.membrane(
    [
      [0.397, 1.576, -1.15],
      [0.455, 1.43, -1.24],
      [0.470, 1.29, -1.36],
      [0.449, 1.14, -1.47],
    ],
    [
      [0.397, 1.576, -1.23],
      [0.455, 1.43, -1.37],
      [0.470, 1.29, -1.50],
      [0.449, 1.14, -1.62],
    ],
    {
      color: scarfCloth,
      thickness: 0.013,
      rows: 2,
      cols: 6,
      bone: aircraft,
      name: "long draped scarf tail",
    },
  );
  b.membrane(
    [
      [0.409, 1.574, -1.105],
      [0.485, 1.46, -1.075],
      [0.497, 1.34, -1.15],
    ],
    [
      [0.409, 1.574, -1.18],
      [0.485, 1.46, -1.19],
      [0.497, 1.34, -1.275],
    ],
    {
      color: scarfCloth,
      thickness: 0.014,
      rows: 2,
      cols: 4,
      bone: aircraft,
      name: "short draped scarf tail",
    },
  );
  for (const end of [
    { x: 0.449, y: 1.14, z0: -1.47, z1: -1.62 },
    { x: 0.497, y: 1.34, z0: -1.15, z1: -1.275 },
  ]) {
    b.rod(
      [end.x, end.y + 0.017, end.z0],
      [end.x, end.y + 0.017, end.z1],
      0.009,
      { color: C.cream, bone: aircraft, sides: 6 },
    );
    for (let i = 0; i < 7; i++) {
      const z = end.z0 + (end.z1 - end.z0) * (i + 0.5) / 7;
      b.sweep(
        polyline([
          [end.x, end.y, z],
          [end.x + 0.009, end.y - 0.033, z - 0.003],
          [end.x + 0.004, end.y - 0.063, z - 0.010],
        ]),
        [0.006, 0.003],
        {
          color: i % 2 === 0 ? C.cream : "#82b6ad",
          bone: aircraft,
          sides: 4,
          caps: "round",
        },
      );
    }
  }

  box([0, 1.17, -0.65], [0.54, 0.07, 0.78], C.leatherDark);
>>>>>>> REPLACE

<<<<<<< SEARCH
    cylinder([x, 0.59, 1.0], 0.45, 0.215, C.rubber, [s, 0, 0], wheel, 20);
    ring([x + s * 0.093, 0.59, 1.0], 0.355, 0.057, "#424448", [s, 0, 0], wheel);
=======
    b.lathe(
      [
        [0, -0.105],
        [0.30, -0.105],
        [0.395, -0.105],
        [0.435, -0.075],
        [0.450, -0.025],
        [0.450, 0.025],
        [0.435, 0.075],
        [0.395, 0.105],
        [0.30, 0.105],
        [0, 0.105],
      ],
      {
        at: [x, 0.59, 1.0],
        axis: [s, 0, 0],
        color: C.rubber,
        bone: wheel,
        segments: 20,
        name: `rounded balloon tyre ${s > 0 ? "L" : "R"}`,
      },
    );
    ring([x + s * 0.110, 0.59, 1.0], 0.331, 0.008,
      "#505156", [s, 0, 0], wheel);
>>>>>>> REPLACE

<<<<<<< SEARCH
  cylinder([windsockX + 0.204, 1.97, windsockZ], 0.116, 0.012,
    C.redDark, [1, 0, -0.15], scene, 12);
=======
  cylinder([windsockX + 0.247, 1.966, windsockZ - 0.007], 0.120, 0.012,
    C.ink, [1, 0, -0.15], scene, 12);
>>>>>>> REPLACE