1. **Hero grimoire.** I replaced the leaning end of `row(-0.59, -0.24, BT[4], …)` with a 0.22 × 0.27 × 0.055 m display book at x = -0.43, yawed -12° and rolled -8°. Its height is solved so the lowest cover corner touches `BT[4]`. It has a wine cover with a drawn border, rune ring and star, a recessed page block, a spine board, four bright gilt corners and a gilt crescent clasp cradling a small glowing gem. One narrow upright book stands on each side.
2. **Crown framing.** The render camera belongs to the harness, not this module, so I could not change its target or scale. I made no layout changes for it, and the crescent and the tallest flames are still the highest points of the prop.
3. **Cabinet surfaces.** `WOOD_V`, `WOOD_H` and `RAIL` are now lighter, lower-contrast plum-brown. The `lit` shading is softened so sides and back no longer collapse to black, and `WOOD_D` is unchanged for recesses. `RAIL` is lighter than the panel centres. The cornice, plinth and uprights are now 4 mm bevelled extrudes.
4. **Colour hierarchy.** About two-thirds of thin books now take a `MUTED` palette, and about 75% of them get the plain spine. Bright covers and fancy spines are kept for the tomes, the remaining thin books and the grimoire. `GILT` stays bright for the crest and magical pieces. A new darker `AGED` bronze and `AGED_C` replace it on shelf strips, plinth trim, upright lines, cornice studs and book fittings.
5. **Orbs.** `orbTex()` is rebuilt with an off-centre core, a visible cloud and swirl on the front hemisphere, a darker lower rim and one pale highlight. The detached highlight sphere is about half its former area. The cyan tint on the blue orb's cup and shelf is wider and stronger, and the violet orbs are dimmed to 0.8.
6. **Platform.** Moss is limited to three muted patches at outer joints, and the stone contrast is reduced. The rug checker is darker with the border unchanged, and the floor crystals are more muted and dimmer.
7. **Props.** Scroll ends now carry a drawn dark spiral. The ribbon knot with two tails sits on top of the scroll and the wax seal is moved to a different spot. The hourglass vessel is a pale glass lattice of meridian ribs and rings, with a separate sand mass in each bulb and a thin central stream. The brass supports stay outside it.

<<<<<<< SEARCH
const WAX_HI = "#fff8e2";
=======
const WAX_HI = "#fff8e2";
const AGED_C = "#a8812f";
const MUTED = ["#2e2a5e", "#3e2148", "#5a2234", "#2e5a58", "#35305a", "#4a2a40"];
>>>>>>> REPLACE
<<<<<<< SEARCH
// dark coloured rim at the sphere's sides/poles, luminous cloudy core, soft internal swirl
const orbTex = (rim: string, mid: string, core: string, sw: string) => {
  const inner = `<path d="M8 42 C18 20 34 54 56 26" stroke="${sw}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <ellipse cx="30" cy="34" rx="14" ry="8" fill="${sw}" opacity="0.7"/>
    <ellipse cx="42" cy="22" rx="9" ry="5" fill="${core}" opacity="0.8"/>`;
  return svg(
    `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="h" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${rim}"/><stop offset="0.28" stop-color="${mid}"/><stop offset="0.5" stop-color="${core}"/><stop offset="0.72" stop-color="${mid}"/><stop offset="1" stop-color="${rim}"/></linearGradient>
        <linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${rim}" stop-opacity="0.9"/><stop offset="0.28" stop-color="${rim}" stop-opacity="0"/><stop offset="0.72" stop-color="${rim}" stop-opacity="0"/><stop offset="1" stop-color="${rim}" stop-opacity="0.9"/></linearGradient>
        <filter id="b" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="3.2"/></filter>
      </defs>
      <rect x="0" y="0" width="64" height="64" fill="url(#h)"/>
      <rect x="64" y="0" width="64" height="64" fill="url(#h)"/>
      <g filter="url(#b)" opacity="0.45">${inner}<g transform="translate(64 0)">${inner}</g></g>
      <rect x="0" y="0" width="128" height="64" fill="url(#v)"/>
    </svg>`,
    { size: 256 },
  );
};
=======
// dark rim at the limbs and underside, off-centre luminous core, visible cloud and swirl, one pale highlight
const orbTex = (rim: string, mid: string, core: string, sw: string) => {
  const half = `<rect width="64" height="64" fill="${rim}"/>
    <rect width="64" height="64" fill="url(#c)"/>
    <g filter="url(#b)">
      <path d="M4 40 C14 22 26 50 40 34 S56 38 62 24" stroke="${sw}" stroke-width="4.5" fill="none" stroke-linecap="round" opacity="0.7"/>
      <path d="M8 54 C20 44 32 60 56 48" stroke="${mid}" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.9"/>
      <path d="M12 24 C22 14 32 28 46 18" stroke="${core}" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.6"/>
      <ellipse cx="36" cy="34" rx="9" ry="7" fill="${core}" opacity="0.9"/>
    </g>
    <rect width="64" height="64" fill="url(#lo)"/>
    <ellipse cx="22" cy="19" rx="4.2" ry="2.3" transform="rotate(-28 22 19)" fill="#ffffff" opacity="0.85"/>`;
  return svg(
    `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="c" cx="0.56" cy="0.54" r="0.62"><stop offset="0" stop-color="${core}"/><stop offset="0.45" stop-color="${mid}"/><stop offset="1" stop-color="${rim}"/></radialGradient>
        <linearGradient id="lo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${rim}" stop-opacity="0.5"/><stop offset="0.25" stop-color="${rim}" stop-opacity="0"/><stop offset="0.6" stop-color="${rim}" stop-opacity="0"/><stop offset="1" stop-color="${rim}" stop-opacity="0.95"/></linearGradient>
        <filter id="b" filterUnits="userSpaceOnUse" x="0" y="0" width="64" height="64"><feGaussianBlur stdDeviation="1.4"/></filter>
      </defs>
      <g>${half}</g><g transform="translate(64 0)">${half}</g>
    </svg>`,
    { size: 256 },
  );
};
>>>>>>> REPLACE
<<<<<<< SEARCH
const PLAQUE = svg(
=======
const HERO = (() => {
  let ticks = "";
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    ticks += `<path d="M${(9.5 + 6.3 * Math.cos(a)).toFixed(2)} ${(12 + 6.3 * Math.sin(a)).toFixed(2)} L${(9.5 + 7.4 * Math.cos(a)).toFixed(2)} ${(12 + 7.4 * Math.sin(a)).toFixed(2)}" stroke="#f2c14e" stroke-width="0.35" stroke-linecap="round"/>`;
  }
  return svg(
    `<svg viewBox="0 0 19 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.5" y="0.5" width="18" height="23" rx="0.6" fill="none" stroke="#f2c14e" stroke-width="0.5"/>
      <rect x="1.4" y="1.4" width="16.2" height="21.2" rx="0.4" fill="none" stroke="#c89a34" stroke-width="0.25"/>
      <circle cx="9.5" cy="12" r="6.2" fill="none" stroke="#f2c14e" stroke-width="0.4"/>
      <circle cx="9.5" cy="12" r="7.6" fill="none" stroke="#c89a34" stroke-width="0.25"/>
      ${ticks}
      <polygon points="${starPts(9.5, 12, 5.2, 1.9, 8)}" fill="#7a2a5a" stroke="#f2c14e" stroke-width="0.3"/>
      <path d="M5 3.6 H14 M6.5 4.8 H12.5 M5 20.4 H14 M6.5 19.2 H12.5" stroke="#f2c14e" stroke-width="0.3" stroke-linecap="round"/>
    </svg>`,
    { size: 384 },
  );
})();

const SPIRAL = (() => {
  let d = "";
  for (let i = 0; i <= 60; i++) {
    const a = i * 0.32;
    const r = 3 + a * 1.45;
    d += `${i ? "L" : "M"}${(32 + r * Math.cos(a)).toFixed(1)} ${(32 + r * Math.sin(a)).toFixed(1)} `;
  }
  return svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="32" fill="#e4cf9b"/><path d="${d}" fill="none" stroke="#4a2a14" stroke-width="2.2" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );
})();

const PLAQUE = svg(
>>>>>>> REPLACE
<<<<<<< SEARCH
  const cyl = (r: number, h: number, seg: number, color: Fill, at: V, o: Opt = {}) =>
=======
  const bev = (w: number, h: number, d: number, color: Fill, at: V, bv = 0.004) =>
    b.extrude(
      [
        [-w / 2, -h / 2],
        [w / 2, -h / 2],
        [w / 2, h / 2],
        [-w / 2, h / 2],
      ],
      { at, x: [1, 0, 0], y: [0, 1, 0], thickness: d, bevel: bv, color, bone: root },
    );
  const cyl = (r: number, h: number, seg: number, color: Fill, at: V, o: Opt = {}) =>
>>>>>>> REPLACE
<<<<<<< SEARCH
      const dark = mix(c, "#1a1030", 0.2 * (1 - up) * (1 - front));
      return mix(dark, "#6a5088", 0.2 * up + 0.08 * front);
=======
      const dark = mix(c, "#241528", 0.14 * (1 - up) * (1 - front));
      return mix(dark, "#8a6a74", 0.22 * up + 0.1 * front);
>>>>>>> REPLACE
<<<<<<< SEARCH
  const WOOD_V = lit(grain("#30203f", "#3b294f", { size: 0.09, axis: "y" }));
  const WOOD_H = lit(grain("#30203f", "#3b294f", { size: 0.09, axis: "x" }));
=======
  const WOOD_V = lit(grain("#40303b", "#463540", { size: 0.09, axis: "y" }));
  const WOOD_H = lit(grain("#40303b", "#463540", { size: 0.09, axis: "x" }));
>>>>>>> REPLACE
<<<<<<< SEARCH
  const RAIL = lit(grain("#3a2a50", "#45335c", { size: 0.09, axis: "y" }));
=======
  const RAIL = lit(grain("#4a3944", "#513f4a", { size: 0.09, axis: "y" }));
>>>>>>> REPLACE
<<<<<<< SEARCH
  const BRASS = metal("brass");
=======
  const BRASS = metal("brass");
  const AGED = metal("bronze", { tarnish: 0.25, polish: 0.1, seed: 4 });
>>>>>>> REPLACE
<<<<<<< SEARCH
  const STONE = scales(["#4a496f", "#524f78", "#444366"], "#23223a", { size: 0.14, width: 0.1 });
  const PLAT = paint((p, n) => {
    const e = Math.max(Math.abs(p.x) / 0.9, Math.abs(p.z - 0.2) / 0.45);
    if (n.y > 0.5 && e > 0.92 && noise(p, 0.08, 3) > 0.6) return "#4a7a48";
    return STONE;
  });
=======
  const STONE = scales(["#44436a", "#494770", "#40405f"], "#2c2b48", { size: 0.14, width: 0.08 });
  const MOSS_AT: [number, number][] = [
    [-0.82, 0.6],
    [0.86, -0.18],
    [0.3, 0.665],
  ];
  const PLAT = paint((p, n) => {
    if (n.y > 0.5 && MOSS_AT.some(([mx, mz]) => Math.hypot(p.x - mx, p.z - mz) < 0.09 * (0.6 + noise(p, 0.05, 3))))
      return "#44604a";
    return STONE;
  });
>>>>>>> REPLACE
<<<<<<< SEARCH
    return (Math.floor(p.x / 0.05) + Math.floor(p.z / 0.05)) & 1 ? "#8a1f45" : "#7a1a3c";
=======
    return (Math.floor(p.x / 0.05) + Math.floor(p.z / 0.05)) & 1 ? "#6a1a38" : "#5c1530";
>>>>>>> REPLACE
<<<<<<< SEARCH
  box(1.38, 0.11, 0.44, WOOD_D, [0, 0.125, 0]);
  box(1.4, 0.014, 0.46, GILT, [0, 0.187, 0]);
=======
  bev(1.38, 0.11, 0.44, WOOD_V, [0, 0.125, 0]);
  box(1.4, 0.014, 0.46, AGED, [0, 0.187, 0]);
>>>>>>> REPLACE
<<<<<<< SEARCH
    box(0.05, 1.84, 0.4, WOOD_V, [s * 0.625, 1.1, 0]);
    box(0.012, 1.8, 0.012, GILT, [s * 0.6, 1.1, 0.204]);
    box(0.012, 1.8, 0.012, GILT, [s * 0.65, 1.1, 0.204]);
=======
    bev(0.05, 1.84, 0.4, WOOD_V, [s * 0.625, 1.1, 0]);
    box(0.012, 1.8, 0.012, AGED, [s * 0.6, 1.1, 0.204]);
    box(0.012, 1.8, 0.012, AGED, [s * 0.65, 1.1, 0.204]);
>>>>>>> REPLACE
<<<<<<< SEARCH
    box(1.2, 0.012, 0.01, GILT, [0, t - 0.004, 0.205]);
=======
    box(1.2, 0.012, 0.01, AGED, [0, t - 0.004, 0.205]);
>>>>>>> REPLACE
<<<<<<< SEARCH
  box(1.42, 0.04, 0.46, WOOD_H, [0, 2.0, 0]);
  box(1.46, 0.014, 0.48, GILT, [0, 2.027, 0]);
  for (let i = -4; i <= 4; i++) ball(0.011, GOLD, [i * 0.15, 2.0, 0.235]);
=======
  bev(1.42, 0.04, 0.46, WOOD_H, [0, 2.0, 0]);
  box(1.46, 0.014, 0.48, AGED, [0, 2.027, 0]);
  for (let i = -4; i <= 4; i++) ball(0.011, AGED_C, [i * 0.15, 2.0, 0.235]);
>>>>>>> REPLACE
<<<<<<< SEARCH
    const ci = Math.floor(R() * COVERS.length);
    const cov = COVERS[ci];
=======
    const r0 = R();
    const ci = Math.floor(r0 * COVERS.length);
    const cov =
      kind === "tome"
        ? COVERS[ci]
        : r0 < 0.67
          ? MUTED[Math.floor((r0 / 0.67) * MUTED.length)]
          : COVERS[Math.floor(((r0 - 0.67) / 0.33) * 6)];
>>>>>>> REPLACE
<<<<<<< SEARCH
    const tex = kind === "tome" ? SP.fancy[Math.floor(R() * SP.fancy.length)] : R() < 0.4 ? SP.plain : SP.fancy[Math.floor(R() * SP.fancy.length)];
=======
    const tex = kind === "tome" ? SP.fancy[Math.floor(R() * SP.fancy.length)] : R() < 0.75 ? SP.plain : SP.fancy[Math.floor(R() * SP.fancy.length)];
>>>>>>> REPLACE
<<<<<<< SEARCH
        box(0.026, t + 0.004, 0.026, GOLD, at(sx * (w / 2 - 0.011), t / 2, sz * (d / 2 - 0.011)), { rotation: ro });
=======
        box(0.026, t + 0.004, 0.026, AGED_C, at(sx * (w / 2 - 0.011), t / 2, sz * (d / 2 - 0.011)), { rotation: ro });
>>>>>>> REPLACE
<<<<<<< SEARCH
    box(0.03, 0.006, 0.03, GOLD, at(w * 0.28, t + 0.004, 0), { rotation: ro });
=======
    box(0.03, 0.006, 0.03, AGED_C, at(w * 0.28, t + 0.004, 0), { rotation: ro });
>>>>>>> REPLACE
<<<<<<< SEARCH
    P(new THREE.TorusGeometry(r * 1.05, 0.005, 5, 10), rib, [cx + len * 0.18, cy, cz], { rotation: [0, 90, 0] });
    cyl(0.011, 0.006, 8, "#b3202e", [cx + len * 0.18, cy, cz + r * 1.08], { rotation: [90, 0, 0] });
=======
    for (const sg of [-1, 1])
      P(new THREE.CircleGeometry(r * 0.98, 12), "#ffffff", [cx + sg * (len / 2 + 0.0018), cy, cz], {
        dir: [sg, 0, 0],
        axis: "z",
        texture: SPIRAL,
      });
    const kx = cx + len * 0.18;
    P(new THREE.TorusGeometry(r * 1.05, 0.005, 5, 10), rib, [kx, cy, cz], { rotation: [0, 90, 0] });
    ball(r * 0.34, rib, [kx, cy + r * 1.06, cz]);
    for (const s2 of [1, -1])
      box(0.007, 0.003, 0.03, rib, [kx, cy + r * 0.98, cz + s2 * 0.016], { rotation: [-s2 * 35, 0, 0] });
    cyl(0.013, 0.007, 10, "#b3202e", [cx - len * 0.2, cy, cz + r * 1.0], { rotation: [90, 0, 0] });
    cyl(0.007, 0.009, 6, "#7a1220", [cx - len * 0.2, cy, cz + r * 1.0], { rotation: [90, 0, 0] });
>>>>>>> REPLACE
<<<<<<< SEARCH
    glow(
      lathe(
        [[0, 0], [0.038, 0.005], [0.04, 0.03], [0.032, 0.06], [0.006, 0.095], [0.006, 0.105], [0.032, 0.14], [0.04, 0.17], [0.038, 0.195], [0, 0.2]],
        [x, y + 0.014, z],
        "#f6dc8a",
        10,
      ),
      0.8,
    );
=======
    const y0 = y + 0.014;
    const GL = "#cfe6ee";
    const SAND = "#f2c14e";
    const prof: [number, number][] = [
      [0.038, 0.005],
      [0.04, 0.03],
      [0.032, 0.06],
      [0.014, 0.088],
      [0.006, 0.1],
      [0.014, 0.112],
      [0.032, 0.14],
      [0.04, 0.17],
      [0.038, 0.195],
    ];
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4 + 0.39;
      b.sweep(
        catmull(prof.map(([rr, h]): V => [x + rr * Math.cos(a), y0 + h, z + rr * Math.sin(a)])),
        0.0028,
        { color: GL, sides: 5, bone: root },
      );
    }
    for (const h of [0.03, 0.17]) P(new THREE.TorusGeometry(0.04, 0.003, 4, 14), GL, [x, y0 + h, z], { rotation: [90, 0, 0] });
    glow(lathe([[0, 0], [0.034, 0], [0.034, 0.006], [0.02, 0.03], [0, 0.042]], [x, y0 + 0.008, z], SAND, 10), 0.8);
    glow(lathe([[0, 0], [0.0065, 0], [0.016, 0.016], [0.027, 0.032], [0.031, 0.042], [0, 0.036]], [x, y0 + 0.106, z], SAND, 10), 0.8);
    glow(cyl(0.0025, 0.058, 5, SAND, [x, y0 + 0.078, z]), 0.8);
>>>>>>> REPLACE
<<<<<<< SEARCH
      P(new THREE.SphereGeometry(r * 0.16, 6, 4), "#ffffff", [x + r * 0.34, cy + r * 0.5, z + r * 0.76], {
=======
      P(new THREE.SphereGeometry(r * 0.115, 6, 4), "#ffffff", [x + r * 0.34, cy + r * 0.5, z + r * 0.76], {
>>>>>>> REPLACE
<<<<<<< SEARCH
  const SHELF_BLUE = tintNear(WOOD_H, [0, BT[1], 0.04], 0.24, "#5fd0ff", 0.45);
=======
  const SHELF_BLUE = tintNear(WOOD_H, [0, BT[1], 0.06], 0.3, "#5fd0ff", 0.7);
>>>>>>> REPLACE
<<<<<<< SEARCH
  const CUP_BLUE = tintNear(GILT, [0, BT[1] + 0.2, 0.04], 0.16, "#7fe8ff", 0.5);
=======
  const CUP_BLUE = tintNear(GILT, [0, BT[1] + 0.2, 0.04], 0.2, "#7fe8ff", 0.75);
>>>>>>> REPLACE
<<<<<<< SEARCH
  orb(-0.02, BT[4], 0.04, 0.055, ORB_VIOLET, true, GILT, 1.0);
=======
  orb(-0.02, BT[4], 0.04, 0.055, ORB_VIOLET, true, GILT, 0.8);
>>>>>>> REPLACE
<<<<<<< SEARCH
  orb(0.65, f3, 0.4, 0.058, ORB_VIOLET, false, GILT, 1.0);
=======
  orb(0.65, f3, 0.4, 0.058, ORB_VIOLET, false, GILT, 0.8);
>>>>>>> REPLACE
<<<<<<< SEARCH
      lathe([[0, 0], [0.03, 0], [0.03, 0.08], [0, 0.14]], [cx, 0.07, cz], "#7fe0ff", 6, {
        rotation: rot,
        scale: [sc2, sc2, sc2],
      }),
      1.0,
=======
      lathe([[0, 0], [0.03, 0], [0.03, 0.08], [0, 0.14]], [cx, 0.07, cz], "#5fa0b8", 6, {
        rotation: rot,
        scale: [sc2, sc2, sc2],
      }),
      0.7,
>>>>>>> REPLACE
<<<<<<< SEARCH
  row(-0.59, -0.24, BT[4], 0.2, 0.27, true);
=======
  placeBook(-0.582, BT[4] + 0.115, 0.026, 0.23, 0.22, 0.04, 0, "thin");
  placeBook(-0.262, BT[4] + 0.1, 0.03, 0.2, 0.22, 0.04, 0, "thin");
  {
    // hero display grimoire: broad cover facing forward, yawed and rolled, lowest corner on the shelf
    const gw = 0.22;
    const gh = 0.27;
    const gt = 0.055;
    const yaw = -12;
    const roll = -8;
    const gx = -0.43;
    const gz = 0.12;
    const ar = roll * DEG;
    const ay = yaw * DEG;
    const gy = BT[4] + (gw / 2) * Math.sin(Math.abs(ar)) + (gh / 2) * Math.cos(ar);
    const gl = (dx: number, dy: number, dz: number): V => {
      const x1 = dx * Math.cos(ar) - dy * Math.sin(ar);
      const y1 = dx * Math.sin(ar) + dy * Math.cos(ar);
      return [gx + x1 * Math.cos(ay) + dz * Math.sin(ay), gy + y1, gz - x1 * Math.sin(ay) + dz * Math.cos(ay)];
    };
    const gd = (dx: number, dy: number, dz: number): V => {
      const a = gl(dx, dy, dz);
      return [a[0] - gx, a[1] - gy, a[2] - gz];
    };
    const gro: V = [0, yaw, roll];
    const GC = "#5c1a44";
    box(gw, gh, 0.012, GC, gl(0, 0, -gt / 2 + 0.006), { rotation: gro });
    box(gw, gh, 0.012, GC, gl(0, 0, gt / 2 - 0.006), { rotation: gro });
    box(0.02, gh, gt, "#44122f", gl(-gw / 2 + 0.01, 0, 0), { rotation: gro });
    box(gw - 0.032, gh - 0.024, gt - 0.024, PAGES, gl(0.004, 0, 0), { rotation: gro });
    P(new THREE.PlaneGeometry(gw - 0.03, gh - 0.03), "#ffffff", gl(0.006, 0, gt / 2 + 0.0015), {
      rotation: gro,
      texture: HERO,
    });
    for (const sx of [1, -1])
      for (const sy of [1, -1])
        box(0.04, 0.04, gt + 0.008, GILT, gl(sx * (gw / 2 - 0.02), sy * (gh / 2 - 0.02), 0), { rotation: gro });
    const clasp: Pt[] = crescent().map((q): Pt =>
      q.length === 3 ? [q[0] * 0.4, q[1] * 0.4, "sharp"] : [q[0] * 0.4, q[1] * 0.4],
    );
    b.extrude(clasp, {
      at: gl(0.006, -0.016, gt / 2 + 0.006),
      x: gd(0, 1, 0),
      y: gd(-1, 0, 0),
      thickness: 0.011,
      bevel: 0.002,
      color: GILT,
      bone: root,
    });
    glow(ball(0.013, "#bff6ff", gl(0.006, 0.008, gt / 2 + 0.012)), 1.1);
  }
>>>>>>> REPLACE