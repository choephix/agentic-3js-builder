1. The haft was thin for such a big blade and a big skull, so I made it thicker and widened the gold bands and vertebrae seating so they still wrap it cleanly.
2. The soul orb floated free inside the crescent, disconnected from the blade. I added two curved gold cradle arms from the orb cage up to the inner edge of the blade, each with a collar at the blade, so it hangs from the weapon.
3. The skull read small and flat from behind, with a hard gap between it and the blade. I added a swept-back bone frill fan on each side of the skull, with an inset glowing teal plate. This gives the head a bolder, more dragon-like silhouette.

<<<<<<< SEARCH
  b.sweep(haft, (t) => 0.045 - 0.006 * t, { color: GRIP, sides: 8 });
=======
  b.sweep(haft, (t) => 0.056 - 0.01 * t, { color: GRIP, sides: 8 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const band = (t: number, color: ColorInput, h = 0.045, r = 0.054) => {
=======
  const band = (t: number, color: ColorInput, h = 0.045, r = 0.07) => {
>>>>>>> REPLACE

<<<<<<< SEARCH
  band(0.34, GOLD_D, 0.025, 0.05);
  band(0.66, GOLD_D, 0.025, 0.05);
=======
  band(0.34, GOLD_D, 0.025, 0.066);
  band(0.66, GOLD_D, 0.025, 0.064);
>>>>>>> REPLACE

<<<<<<< SEARCH
  band(0.82, GOLD, 0.05, 0.056);
=======
  band(0.82, GOLD, 0.05, 0.068);
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.pose(jawJ, { axis: [1, 0, 0], deg: 14 });
=======
  b.pose(jawJ, { axis: [1, 0, 0], deg: 14 });

  // swept-back frill fans behind the skull
  const FRILL: [number, number][] = [
    [0, -0.02],
    [0.14, 0.0],
    [0.1, 0.06],
    [0.22, 0.12],
    [0.1, 0.15],
    [0.18, 0.27],
    [0.04, 0.17],
    [0, 0.12],
  ];
  const FRILL_IN: [number, number][] = FRILL.map(([x, y]) => [0.02 + x * 0.62, 0.015 + y * 0.62] as [number, number]);
  for (const s of [1, -1]) {
    b.extrude(FRILL, {
      at: H(s * 0.07, 0.03, -0.1),
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.014,
      bevel: 0.003,
      color: BONE_D,
      bone: headJ,
    });
    glow(
      b.extrude(FRILL_IN, {
        at: H(s * 0.07 + s * 0.0004, 0.03, -0.1),
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: 0.02,
        color: "#46ecd2",
        bone: headJ,
      }),
      1.2,
    );
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
  const C: V3 = [0.78, 1.74, ZB];
=======
  const C: V3 = [0.78, 1.74, ZB];
  for (const [t, dx] of [
    [0.5, -0.07],
    [0.72, 0.07],
  ] as [number, number][]) {
    const p = innerP.at(t);
    b.sweep(
      catmull([
        [C[0] + dx, C[1] + 0.14, ZB],
        [(C[0] + dx + p.x) / 2, (C[1] + p.y) / 2 + 0.03, ZB],
        [p.x, p.y - 0.02, ZB],
      ]),
      0.014,
      { color: GOLD_D, bone: bladeJ, sides: 6 },
    );
    b.part(new THREE.CylinderGeometry(0.03, 0.035, 0.05, 6), GOLD, { at: [p.x, p.y - 0.01, ZB], bone: bladeJ, flat: true });
  }
>>>>>>> REPLACE