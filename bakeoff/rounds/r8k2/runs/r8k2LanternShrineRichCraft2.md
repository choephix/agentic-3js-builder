1. **Torii:** it now stands at `TZ = 1.65` with posts at `±1.4` and radii `0.115/0.135`. The lower crossbar is 3.5 m, the beam half-widths are `2.2/2.3`, and the gold collars, end fittings and hanging lanterns are moved to match. `ropeP` is rebuilt between the new posts from seven sagging points, with its knots and tassels placed at the new post faces.
2. **Sakura:** I replaced the evenly rounded clumps with nine non-uniform, yawed lobes grouped into three masses: a dominant crown, a windswept sweep to the left and a smaller rear crown. The uppermost cap sits at `y = 3.3` and the far-left lobe at `x = -3.35`. Each satellite is reached by its own tapered limb ending inside the foliage. The crown is kept left of the roof ornaments, and gaps are left between lobes so the branches show.
3. **Foxes:** rebuilt with a 12% narrower head raised 0.05 m and a tapered neck from chest to skull. The muzzle and nose are 0.04 m further forward and the ear tips about 0.05 m higher. Eyes are slanted wedges tilted to the cheek, with small red brow marks, and the haunches are narrower. The tail radius now falls to a point, and the collar and bib are refitted to the thinner neck.
4. **Offerings:** the right toro is at `(2.45, 1.5)` and the table at `TX = 2.05`, `TZ2 = -0.85`. The barrel pyramid is replaced by two grounded barrels, the second at 0.85 scale. The grass-exclusion zones are updated to match. To keep the toro roof inside the curb I enlarged the ground and curb radii by about 0.25 m.
5. **Base:** the curb opening is about 1.8 m wide, with gate stones at `x = ±1.0`. The six curb sections now vary in height (0.24–0.32 m) and have irregular inner and outer edges. The single paving block at `z = 3.4` is replaced by two tilted slabs continuing past the opening, and the sigil is 0.8 m across at a third of its previous glow.
6. **Hokora:** each side wall gets a dark sill and two 0.04 × 0.045 m rails at `y0 + 0.15` and `y0 + 0.73`. The rear wall gets two vermilion uprights at `x = ±0.23` between the deck and rear header, plus a dark timber strip under the plaster.
7. **Materials:** moss on `STONE` is now confined to a few large patches at ground contact, curb joints and low upward ledges. `ROOF` is a consistent indigo field with darker tile channels and a narrow pale eave edge. `GOLD` is mostly ochre, with pale yellow only on upward faces. Airborne petals drop from 34 to 18 and are rejected near the fox heads and the altar opening.

## Edits

<<<<<<< SEARCH
const GOLD = cel("#ffdc7a", "#d8962f");
=======
const GOLD = cel(paint((_p, n) => (n.y > 0.7 ? "#f1c866" : "#c18a36")), "#7d5220");
>>>>>>> REPLACE

<<<<<<< SEARCH
const STONE = cel(
  paint((p, n) => {
    const m = noise(p, 0.18, 7);
    if (p.y < GY + 0.45 && n.y > 0.7 && m > 0.6) return "#7fae5c"; // moss on low upward ledges
    if (p.y < GY + 0.12 && m > 0.65) return "#7fa468"; // moss in ground crevices
    return STONE_BASE;
  }),
);
=======
const CURB_OPEN = 14.5;
const CURB_N = 6;
const CURB_GAP = 2;
const CURB_SPAN = (360 - 2 * CURB_OPEN - CURB_GAP * (CURB_N - 1)) / CURB_N;
const CURB_JOINTS = Array.from(
  { length: CURB_N - 1 },
  (_, k) => CURB_OPEN + (k + 1) * CURB_SPAN + (k + 0.5) * CURB_GAP,
);
const STONE = cel(
  paint((p, n) => {
    const patch = noise(p, 0.85, 7); // large, connected moss patches
    const grown = p.y < GY + 0.06 && patch > 0.58; // ground contact
    const ledge = n.y > 0.7 && p.y < GY + 0.5 && patch > 0.62; // sheltered low ledges
    let joint = false;
    if (Math.hypot(p.x, p.z) > 3.3 && p.y < 0.5) {
      let a = (Math.atan2(p.x, p.z) * 180) / Math.PI;
      if (a < 0) a += 360;
      joint = patch > 0.42 && CURB_JOINTS.some((j) => Math.abs(a - j) < 3.5); // curb joints
    }
    return grown || ledge || joint ? "#7fae5c" : STONE_BASE;
  }),
);
>>>>>>> REPLACE

<<<<<<< SEARCH
const ROOF = cel(
  paint((p) => {
    const f = p.x / 0.12 - Math.floor(p.x / 0.12);
    if (f < 0.1) return "#1f2248";
    return noise(p, 0.35, 2) > 0.55 ? "#505ca8" : "#3d4789";
  }),
);
=======
const ROOF = cel(
  paint((p, n) => {
    if (n.y < -0.2) return "#262a55"; // underside
    if (p.x > -1.5 && Math.abs(p.z + 1.5) > 0.93 && n.y > 0.1) return "#7c88cf"; // narrow lighter eave edge
    const f = p.x / 0.12 - Math.floor(p.x / 0.12);
    if (f < 0.12) return "#24295a"; // tile channels
    return "#4651a0"; // consistent indigo field
  }),
);
>>>>>>> REPLACE

<<<<<<< SEARCH
      [3.3, 0],
      [3.3, 0.12],
      [3.2, GY],
=======
      [3.7, 0],
      [3.7, 0.12],
      [3.6, GY],
>>>>>>> REPLACE

<<<<<<< SEARCH
  // curb: arc sections with a 1.3 m gate toward +z
  const OPEN = 11.5;
  const SECT = 6;
  const GAP = 2;
  const span = (360 - 2 * OPEN - GAP * (SECT - 1)) / SECT;
  for (let k = 0; k < SECT; k++) {
    const a0 = OPEN + k * (span + GAP);
    const a1 = a0 + span;
    const n = Math.max(2, Math.ceil(span / 12));
    const pts: O[] = [];
    for (let i = 0; i <= n; i++) {
      const a = (a0 + ((a1 - a0) * i) / n) * RAD;
      pts.push([3.42 * Math.sin(a), 3.42 * Math.cos(a)]);
    }
    for (let i = n; i >= 0; i--) {
      const a = (a0 + ((a1 - a0) * i) / n) * RAD;
      pts.push([3.18 * Math.sin(a), 3.18 * Math.cos(a)]);
    }
    b.extrude(pts, { at: [0, 0.14, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.28, color: STONE });
  }
  // gate stones
  for (const s of [1, -1]) {
    put(box(0.3, 0.5, 0.36), STONE, [s * 0.8, 0.25, 3.22], { rotation: [0, s * OPEN, 0] });
    put(box(0.36, 0.06, 0.42), STONE, [s * 0.8, 0.53, 3.22], { rotation: [0, s * OPEN, 0] });
  }
=======
  // curb: six irregular arc sections with a ~1.8 m road opening toward +z
  const curbH = [0.3, 0.24, 0.32, 0.26, 0.31, 0.25];
  const outA = [0.0, 0.08, -0.04, 0.06, 0.0, 0.07];
  const outB = [0.08, -0.04, 0.06, 0.0, 0.07, 0.02];
  for (let k = 0; k < CURB_N; k++) {
    const a0 = CURB_OPEN + k * (CURB_SPAN + CURB_GAP);
    const a1 = a0 + CURB_SPAN;
    const n = Math.max(2, Math.ceil(CURB_SPAN / 12));
    const pts: O[] = [];
    for (let i = 0; i <= n; i++) {
      const a = (a0 + ((a1 - a0) * i) / n) * RAD;
      const r = 3.7 + outA[k] + ((outB[k] - outA[k]) * i) / n;
      pts.push([r * Math.sin(a), r * Math.cos(a)]);
    }
    for (let i = n; i >= 0; i--) {
      const a = (a0 + ((a1 - a0) * i) / n) * RAD;
      const r = 3.46 + (outA[k] + ((outB[k] - outA[k]) * i) / n) * 0.4;
      pts.push([r * Math.sin(a), r * Math.cos(a)]);
    }
    b.extrude(pts, { at: [0, curbH[k] / 2, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: curbH[k], color: STONE });
  }
  // gate stones
  for (const s of [1, -1]) {
    put(box(0.3, 0.5, 0.36), STONE, [s * 1.0, 0.25, 3.45], { rotation: [0, s * CURB_OPEN, 0] });
    put(box(0.36, 0.06, 0.42), STONE, [s * 1.0, 0.53, 3.45], { rotation: [0, s * CURB_OPEN, 0] });
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
  put(cyl(0.62, 0.62, 0.012, 20), PAVE2, [0, GY + 0.05, 2.62]);
  glow(
    put(new THREE.PlaneGeometry(1.05, 1.05), "#ffffff", [0, GY + 0.058, 2.62], {
      dir: [0, 1, 0],
      axis: "z",
      texture: SIGIL,
    }),
    0.7,
  );
  put(box(1.0, GY + 0.05, 0.5), PAVE2, [0, (GY + 0.05) / 2, 3.4]);
=======
  put(cyl(0.46, 0.46, 0.012, 20), PAVE2, [0, GY + 0.05, 2.62]);
  glow(
    put(new THREE.PlaneGeometry(0.8, 0.8), "#ffffff", [0, GY + 0.058, 2.62], {
      dir: [0, 1, 0],
      axis: "z",
      texture: SIGIL,
    }),
    0.35,
  );
  // two broad, slightly irregular road slabs continuing past the opening
  put(box(1.5, GY + 0.045, 0.8), PAVE2, [0.03, (GY + 0.045) / 2, 3.6], { rotation: [0, 3, 0] });
  put(box(1.3, GY + 0.03, 0.75), PAVE, [-0.08, (GY + 0.03) / 2, 4.55], { rotation: [0, -4, 0] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const TZ = 1.0;
  for (const s of [1, -1]) {
    const x = s * 1.15;
    put(cyl(0.2, 0.25, 0.2, 10), BLKSTONE, [x, GY + 0.1, TZ]);
    put(cyl(0.125, 0.15, 2.9, 12), VERM, [x, GY + 0.18 + 1.45, TZ]);
    put(cyl(0.162, 0.17, 0.07, 12), GOLD, [x, GY + 0.36, TZ]);
    put(cyl(0.14, 0.14, 0.07, 12), GOLD, [x, GY + 2.72, TZ]);
    put(cyl(0.136, 0.136, 0.04, 12), GOLD, [x, GY + 2.62, TZ]);
    put(box(0.05, 0.2, 0.2), GOLD, [s * 1.51, GY + 2.4, TZ]);
    put(box(0.04, 0.2, 0.42), GOLD, [s * 2.07, GY + 3.26, TZ], { rotation: [0, 0, s * -22] });
  }
  put(box(3.0, 0.15, 0.15), VERM, [0, GY + 2.4, TZ]);
=======
  const TZ = 1.65;
  for (const s of [1, -1]) {
    const x = s * 1.4;
    put(cyl(0.2, 0.25, 0.2, 10), BLKSTONE, [x, GY + 0.1, TZ]);
    put(cyl(0.115, 0.135, 2.9, 12), VERM, [x, GY + 0.18 + 1.45, TZ]);
    put(cyl(0.148, 0.155, 0.07, 12), GOLD, [x, GY + 0.36, TZ]);
    put(cyl(0.13, 0.13, 0.07, 12), GOLD, [x, GY + 2.72, TZ]);
    put(cyl(0.125, 0.125, 0.04, 12), GOLD, [x, GY + 2.62, TZ]);
    put(box(0.05, 0.2, 0.2), GOLD, [s * 1.76, GY + 2.4, TZ]);
    put(box(0.04, 0.2, 0.42), GOLD, [s * 2.33, GY + 3.26, TZ], { rotation: [0, 0, s * -22] });
  }
  put(box(3.5, 0.15, 0.15), VERM, [0, GY + 2.4, TZ]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.extrude(beam(1.95, 0.02, 0.24, -0.14, 0.06), {
=======
  b.extrude(beam(2.2, 0.02, 0.24, -0.14, 0.06), {
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.extrude(beam(2.05, 0.11, 0.34, 0.0, 0.22), {
=======
  b.extrude(beam(2.3, 0.11, 0.34, 0.0, 0.22), {
>>>>>>> REPLACE

<<<<<<< SEARCH
  const ropeP = catmull([
    [-1.03, GY + 2.22, TZ],
    [-0.55, GY + 2.04, TZ],
    [0, GY + 1.97, TZ],
    [0.55, GY + 2.04, TZ],
    [1.03, GY + 2.22, TZ],
  ]);
  b.sweep(ropeP, 0.05, { color: ROPE });
  for (const s of [1, -1]) {
    put(ball(0.075, 7, 5), ROPE, [s * 1.03, GY + 2.22, TZ], { flat: true });
    put(cyl(0.01, 0.05, 0.22, 7), ROPE, [s * 1.03, GY + 2.06, TZ + 0.05]);
  }
=======
  const ropeP = catmull([
    [-1.29, GY + 2.22, TZ],
    [-0.9, GY + 2.08, TZ],
    [-0.45, GY + 2.0, TZ],
    [0, GY + 1.97, TZ],
    [0.45, GY + 2.0, TZ],
    [0.9, GY + 2.08, TZ],
    [1.29, GY + 2.22, TZ],
  ]);
  b.sweep(ropeP, 0.05, { color: ROPE });
  for (const s of [1, -1]) {
    put(ball(0.075, 7, 5), ROPE, [s * 1.29, GY + 2.22, TZ], { flat: true });
    put(cyl(0.01, 0.05, 0.22, 7), ROPE, [s * 1.29, GY + 2.06, TZ + 0.05]);
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const s of [1, -1]) chochin(s * 1.38, GY + 1.98, TZ, 1, 0.2);
=======
  for (const s of [1, -1]) chochin(s * 1.62, GY + 1.98, TZ, 1, 0.2);
>>>>>>> REPLACE

<<<<<<< SEARCH
  toro(2.2, 1.25);
=======
  toro(2.45, 1.5);
>>>>>>> REPLACE

<<<<<<< SEARCH
  put(box(1.4, 0.9, 0.04), PLASTER, [0, y0 + 0.45, Zb + 0.02]);
=======
  put(box(1.4, 0.9, 0.04), PLASTER, [0, y0 + 0.45, Zb + 0.02]);
  // rear wall: three plaster bays between slim vermilion uprights, on a dark timber strip
  for (const sx of [0.23, -0.23]) put(box(0.05, 0.95, 0.05), VERM, [sx, y0 + 0.475, Zb - 0.015]);
  put(box(1.5, 0.06, 0.08), DSILL, [0, y0 + 0.03, Zb - 0.005]);
>>>>>>> REPLACE

<<<<<<< SEARCH
    put(box(0.04, 0.9, 0.9), PLASTER, [s * 0.68, y0 + 0.45, zc]);
=======
    put(box(0.04, 0.9, 0.9), PLASTER, [s * 0.68, y0 + 0.45, zc]);
    // side walls: dark sill and two restrained rails
    put(box(0.08, 0.06, 0.9), DSILL, [s * 0.7, y0 + 0.03, zc]);
    for (const ry of [0.15, 0.73]) put(box(0.04, 0.045, 0.81), DWOOD, [s * 0.715, y0 + ry, zc]);
>>>>>>> REPLACE

<<<<<<< SEARCH
const LACQ = cel("#38294a", "#1b1426");
=======
const LACQ = cel("#38294a", "#1b1426");
const DSILL = cel("#4b3028", "#2f1c19");
>>>>>>> REPLACE

<<<<<<< SEARCH
    for (const t of [1, -1]) {
      put(ball(1, 8, 6), FOXW, L(t * 0.12, 0.17, -0.08), { scale: [0.1, 0.17, 0.19], flat: true });
      b.rod(L(t * 0.075, 0.38, 0.12), L(t * 0.075, 0.03, 0.17), [0.05, 0.042], { color: FOXW, sides: 6 });
      put(ball(1, 6, 4), FOXW, L(t * 0.075, 0.03, 0.2), { scale: [0.055, 0.035, 0.075], flat: true });
      // eye on the visible cheek surface of the head ellipsoid
      put(box(0.058, 0.02, 0.014), INKC, L(t * 0.066, 0.63, 0.263), { rotation: [0, t * 30, t * 18] });
      // broad-based ears
      b.extrude(
        [
          [-0.07, 0],
          [0.07, 0],
          [0, 0.19],
        ],
        { at: L(t * 0.095, 0.66, 0.12), x: [1, 0, 0], y: [0, 1, -0.3], thickness: 0.04, color: FOXW },
      );
      b.extrude(
        [
          [-0.04, 0.012],
          [0.04, 0.012],
          [0, 0.14],
        ],
        { at: L(t * 0.095, 0.66, 0.12), x: [1, 0, 0], y: [0, 1, -0.3], thickness: 0.045, color: RED },
      );
    }
    b.capsule(L(0, 0.2, -0.1), L(0, 0.45, 0.1), [0.15, 0.12], { color: FOXW, sides: 8 });
    put(ball(1, 10, 7), FOXW, L(0, 0.6, 0.15), { scale: [0.115 * H, 0.1 * H, 0.11 * H], flat: true });
    // long tapered muzzle and crisp dark wedge nose
    put(cyl(0.03, 0.065, 0.19, 6), FOXW, L(0, 0.565, 0.285), { dir: [0, -0.1, 1] });
    b.extrude(
      [
        [-0.036, 0.018],
        [0.036, 0.018],
        [0, -0.028],
      ],
      { at: L(0, 0.556, 0.385), x: [1, 0, 0], y: [0, 1, 0], thickness: 0.04, color: INKC },
    );
    put(new THREE.TorusGeometry(0.125, 0.03, 6, 10), RED, L(0, 0.47, 0.1), { dir: [0, 0.35, 0.25], axis: "z" });
    b.extrude(
      [
        [-0.08, 0],
        [0.08, 0],
        [0, -0.16],
      ],
      { at: L(0, 0.46, 0.2), x: [1, 0, 0], y: [0, 1, 0], thickness: 0.03, color: RED },
    );
    put(ball(0.025, 6, 4), GOLD, L(0, 0.32, 0.225));
    b.sweep(
      catmull([L(0, 0.1, -0.15), L(0, 0.12, -0.3), L(s * 0.1, 0.4, -0.34), L(s * 0.05, 0.62, -0.22)]),
      [0.05, 0.1, 0.12, 0.02],
      { color: FOXW, caps: { start: "round", end: "point" } },
    );
=======
    for (const t of [1, -1]) {
      // narrow haunch and slim foreleg
      put(ball(1, 8, 6), FOXW, L(t * 0.1, 0.17, -0.08), { scale: [0.075, 0.15, 0.17], flat: true });
      b.rod(L(t * 0.075, 0.38, 0.12), L(t * 0.075, 0.03, 0.17), [0.045, 0.037], { color: FOXW, sides: 6 });
      put(ball(1, 6, 4), FOXW, L(t * 0.075, 0.03, 0.2), { scale: [0.05, 0.033, 0.07], flat: true });
      // slanted wedge eye seated on the cheek (thickness axis tilted outward with the surface)
      b.extrude(
        [
          [-0.028, -0.003],
          [0.0, -0.012],
          [0.034, 0.014],
          [0.0, 0.006],
        ],
        { at: L(t * 0.05, 0.67, 0.252), x: [t, 0, -0.45], y: [0, 1, 0], thickness: 0.012, color: INKC },
      );
      // restrained red brow mark
      b.extrude(
        [
          [-0.025, -0.004],
          [0.03, 0.012],
          [0.03, 0.02],
          [-0.025, 0.002],
        ],
        { at: L(t * 0.056, 0.715, 0.23), x: [t, 0, -0.45], y: [0, 1, 0], thickness: 0.01, color: RED },
      );
      // tall pointed ears
      b.extrude(
        [
          [-0.065, 0],
          [0.065, 0],
          [0, 0.21],
        ],
        { at: L(t * 0.08, 0.7, 0.12), x: [1, 0, 0], y: [0, 1, -0.3], thickness: 0.04, color: FOXW },
      );
      b.extrude(
        [
          [-0.037, 0.012],
          [0.037, 0.012],
          [0, 0.16],
        ],
        { at: L(t * 0.08, 0.7, 0.12), x: [1, 0, 0], y: [0, 1, -0.3], thickness: 0.045, color: RED },
      );
    }
    b.capsule(L(0, 0.2, -0.08), L(0, 0.44, 0.1), [0.14, 0.115], { color: FOXW, sides: 8 });
    // tapered neck from chest to skull
    b.rod(L(0, 0.4, 0.07), L(0, 0.64, 0.14), [0.095, 0.062], { color: FOXW, sides: 8 });
    put(ball(1, 10, 7), FOXW, L(0, 0.65, 0.15), {
      scale: [0.115 * H * 0.88, 0.1 * H, 0.11 * H * 0.88],
      flat: true,
    });
    // long tapered muzzle (further forward) and crisp dark wedge nose
    put(cyl(0.03, 0.065, 0.19, 6), FOXW, L(0, 0.615, 0.325), { dir: [0, -0.1, 1] });
    b.extrude(
      [
        [-0.036, 0.018],
        [0.036, 0.018],
        [0, -0.028],
      ],
      { at: L(0, 0.606, 0.43), x: [1, 0, 0], y: [0, 1, 0], thickness: 0.04, color: INKC },
    );
    put(new THREE.TorusGeometry(0.1, 0.028, 6, 10), RED, L(0, 0.5, 0.1), { dir: [0, 0.24, 0.07], axis: "z" });
    b.extrude(
      [
        [-0.08, 0],
        [0.08, 0],
        [0, -0.16],
      ],
      { at: L(0, 0.485, 0.2), x: [1, 0, 0], y: [0, 1, 0.35], thickness: 0.03, color: RED },
    );
    put(ball(0.025, 6, 4), GOLD, L(0, 0.32, 0.158));
    b.sweep(
      catmull([L(0, 0.1, -0.15), L(0, 0.12, -0.3), L(s * 0.1, 0.4, -0.34), L(s * 0.05, 0.62, -0.22)]),
      [0.04, 0.1, 0.105, 0.055, 0.012],
      { color: FOXW, caps: { start: "round", end: "point" } },
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
  const TX = 1.95;
  const TZ2 = -1.0;
=======
  const TX = 2.05;
  const TZ2 = -0.85;
>>>>>>> REPLACE

<<<<<<< SEARCH
  barrel(1.75, 0.0, GY, 1);
  barrel(2.45, -0.1, GY, 1);
  barrel(2.1, -0.08, GY + 0.6, 0.85);
=======
  barrel(1.65, -0.05, GY, 1);
  barrel(2.28, -0.15, GY, 0.85);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const branches: [V, V, V][] = [
    [[-2.0, 1.7, -1.78], [-2.55, 2.0, -1.6], [-3.1, 2.42, -1.35]], // outer-left mass B
    [[-2.0, 2.0, -1.85], [-1.75, 2.4, -2.4], [-1.55, 2.95, -2.85]], // back mass C
    [[-2.05, 2.2, -1.85], [-2.4, 2.6, -2.1], [-2.7, 2.8, -2.2]], // transition T1
    [[-2.0, 2.3, -1.9], [-1.7, 2.55, -2.1], [-1.65, 2.55, -2.4]], // transition T3
    [[-2.1, 1.55, -1.78], [-2.5, 1.8, -1.2], [-2.6, 2.2, -0.9]], // transition T2 front-left
  ];
  for (const br of branches) b.sweep(catmull(br), [0.1, 0.03], { color: BARK, sides: 6 });
=======
  const branches: V[][] = [
    [[-2.0, 1.7, -1.78], [-2.55, 2.0, -1.6], [-3.1, 2.45, -1.4]], // outward sweep B
    [[-2.0, 2.0, -1.85], [-1.75, 2.4, -2.4], [-1.6, 3.0, -2.95]], // rear crown C
    [[-2.05, 2.2, -1.85], [-2.45, 2.7, -2.05], [-2.8, 3.0, -2.05]], // crown left A3
    [[-2.0, 2.3, -1.9], [-1.75, 2.5, -2.2], [-1.65, 2.6, -2.5]], // rear lobe C2
    [[-2.1, 1.55, -1.78], [-2.5, 1.85, -1.2], [-2.65, 2.2, -0.9]], // front-left lobe
    [[-2.0, 2.4, -1.9], [-1.8, 3.0, -2.2], [-1.55, 3.3, -2.25]], // crown right A2
  ];
  for (const br of branches) b.sweep(catmull(br), [0.1, 0.03], { color: BARK, sides: 6 });
  // limbs into the two outlying satellites (upper cap, far-left lobe)
  const limbs: V[][] = [
    [[-2.0, 2.3, -1.88], [-2.15, 2.85, -1.6], [-2.2, 3.25, -1.27]],
    [[-2.55, 2.0, -1.6], [-3.0, 2.07, -1.15], [-3.3, 2.1, -0.8]],
  ];
  for (const br of limbs) b.sweep(catmull(br), [0.07, 0.02], { color: BARK, sides: 6 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  // [x, y, z, radius, vertical scale]
  const CLUMPS: number[][] = [
    [-2.0, 2.9, -1.95, 0.92, 0.62], // main A
    [-3.25, 2.45, -1.3, 0.68, 0.6], // main B (outer left)
    [-1.55, 3.1, -3.0, 0.7, 0.6], // main C (back)
    [-2.8, 2.9, -2.35, 0.42, 0.7],
    [-2.65, 2.15, -0.8, 0.36, 0.7],
    [-1.65, 2.6, -2.45, 0.4, 0.7],
    [-3.6, 2.1, -0.75, 0.3, 0.7],
    [-2.2, 3.5, -1.2, 0.34, 0.7],
  ];
  const canopy = CLUMPS.map(([x, y, z, r, sy], i) =>
    put(new THREE.IcosahedronGeometry(r, 1), PINKS[i % 4], [x, y, z], {
      flat: true,
      rotation: [0, R() * 90, 0],
      scale: [1, sy, 1],
    }),
  );
  const hits = b.surface(canopy).scatter(80, { rng: R, minDist: 0.14, filter: (h: any) => h.n.y > -0.2 && h.n.y < 0.75 });
=======
  // [x, y, z, rx, ry, rz, yaw]: dominant crown (A), windswept sweep (B), small rear crown (C) + satellites
  const LOBES: number[][] = [
    [-2.25, 3.05, -2.0, 0.95, 0.58, 0.8, 20], // A1 dominant crown
    [-1.5, 3.35, -2.25, 0.55, 0.4, 0.5, 50], // A2
    [-2.85, 3.0, -2.0, 0.55, 0.4, 0.5, 80], // A3
    [-2.2, 3.3, -1.25, 0.36, 0.26, 0.34, 40], // upper cap (lowered to 3.3)
    [-3.15, 2.5, -1.4, 0.9, 0.36, 0.55, -15], // B1 outward sweep
    [-3.35, 2.1, -0.75, 0.3, 0.22, 0.3, 0], // far-left (drawn inward to -3.35)
    [-2.65, 2.25, -0.85, 0.42, 0.3, 0.38, 30], // front-left lobe
    [-1.6, 3.05, -3.0, 0.7, 0.42, 0.55, 10], // C1 rear crown
    [-1.65, 2.6, -2.5, 0.4, 0.28, 0.36, 0], // C2
  ];
  const canopy = LOBES.map(([x, y, z, rx, ry, rz, yaw], i) =>
    put(new THREE.IcosahedronGeometry(1, 1), PINKS[i % 4], [x, y, z], {
      flat: true,
      rotation: [0, yaw, 0],
      scale: [rx, ry, rz],
    }),
  );
  const hits = b.surface(canopy).scatter(70, { rng: R, minDist: 0.14, filter: (h: any) => h.n.y > -0.2 && h.n.y < 0.75 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (let i = 0; i < 34; i++) {
    const d: V = [R() - 0.5, R() - 0.5, R() - 0.5];
    air.push(frame([R() * 5.2 - 2.7, 0.5 + R() * 2.7, R() * 4.6 - 2.2], d));
  }
=======
  for (let i = 0; i < 300 && air.length < 18; i++) {
    const d: V = [R() - 0.5, R() - 0.5, R() - 0.5];
    const p: V = [R() * 5.2 - 2.7, 0.5 + R() * 2.7, R() * 4.6 - 2.2];
    const nearFox = [0.78, -0.78].some((fx) => Math.hypot(p[0] - fx, p[1] - 1.1, p[2] - 0.2) < 0.55);
    const nearAltar = Math.abs(p[0]) < 0.9 && p[1] < 2.0 && p[2] > -2.1 && p[2] < 0.6;
    if (nearFox || nearAltar) continue;
    air.push(frame(p, d));
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
    [2.2, 1.25, 0.6],
    [-2.2, 1.25, 0.6],
    [1.15, 1.0, 0.35],
    [-1.15, 1.0, 0.35],
    [0.78, 0.0, 0.5],
    [-0.78, 0.0, 0.5],
    [1.95, -1.0, 0.75],
    [2.1, -0.05, 0.85],
=======
    [2.45, 1.5, 0.6],
    [-2.2, 1.25, 0.6],
    [1.4, 1.65, 0.4],
    [-1.4, 1.65, 0.4],
    [0.78, 0.0, 0.5],
    [-0.78, 0.0, 0.5],
    [2.05, -0.85, 0.75],
    [1.95, -0.1, 0.85],
>>>>>>> REPLACE