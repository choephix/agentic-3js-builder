1. **Chest hero:** `OPEN` is now 65. The gold fill is rebuilt as a box topping out at local Y 0.32, and the stacks start at 0.32. The two central stacks are 9 coins tall (about 0.41) and carry gems, and the outer stacks stay low with three extra short stacks so the top reads as a mound. The loose top coins moved up to match.
2. **Break up the barrel wall:** `CZ` is -0.24 and `AZ` is -0.72. Barrel B sits at `BZ = -0.27` and is scaled to 85% through a `BS` constant applied to its profile, hoops, decal, slime and bubbles. `barrelPaint` takes a scale so its height and interior thresholds follow. The floor-spill coins and sparkles are re-placed for the new chest position.
3. **Skeleton:** two extra vertebrae at local Z -0.24 and -0.21 reach the skull's back. The rib centres are lifted to Y 0.009 and the tube radius is 0.012.
4. **Spike trap:** spike base radius is 0.05 and heights are 0.26–0.32. Each solid socket is now a 0.105 outer / 0.075 inner square collar built from four bars. The sixteen-spike grid stays, and the bloodied-tip threshold is raised so only a few tips are red.
5. **Flagstones:** stone variation is now broad 8×4 texel patches plus a small per-texel jitter. The darkest value is kept for joints and one shortened crack. Moss is dimmer and appears on far fewer edge tiles.
6. **Skulls:** the cranium is now a central block, narrow stepped side blocks, a narrower cap (15% less wide) and a back bulge. Two cheek blocks sit under the eyes, and the jaw is shallower and recessed. `SKULLFACE` and `TEETH` stay 1.5 mm outside their supporting surfaces.
7. **Contrast:** hoops are 1.04× the barrel radius through a shared `hoop()` helper, with a thin steel highlight ring on each upper edge. Upward-facing barrel staves are one `WOOD` step lighter. The chest sparkles are reduced to two above the hoard.

## Edits

<<<<<<< SEARCH
    CZ = -0.45,
=======
    CZ = -0.24,
>>>>>>> REPLACE

<<<<<<< SEARCH
    OPEN = 42;
=======
    OPEN = 65;
>>>>>>> REPLACE

<<<<<<< SEARCH
  glow(tb(C, [0.76, 0.12, 0.42], GOLD, 0.012, [0, 0.142, 0], { seed: nsd() }), 0.35);
=======
  glow(tb(C, [0.74, 0.246, 0.4], GOLD, 0.012, [0, 0.197, 0], { seed: nsd() }), 0.35);
>>>>>>> REPLACE

<<<<<<< SEARCH
    let y = 0.202;
=======
    let y = 0.32;
>>>>>>> REPLACE

<<<<<<< SEARCH
  const stacks: [number, number, number][] = [
    [-0.22, -0.03, 3],
    [-0.08, 0.02, 5],
    [0.06, -0.03, 5],
    [0.2, 0.04, 4],
    [-0.3, 0.1, 2],
  ];
=======
  const stacks: [number, number, number][] = [
    [-0.22, -0.03, 3],
    [-0.08, 0.02, 9],
    [0.06, -0.03, 9],
    [0.2, 0.04, 4],
    [-0.3, 0.1, 2],
    [0.3, -0.08, 2],
    [-0.15, -0.12, 4],
    [0.12, 0.12, 3],
  ];
>>>>>>> REPLACE

<<<<<<< SEARCH
  coin([-0.15, 0.245, 0.03], 0.035, 0.01, qe(0, 40, 25));
  coin([0.13, 0.255, 0.0], 0.035, 0.01, qe(0, 10, -30));
=======
  coin([-0.15, 0.335, 0.1], 0.035, 0.01, qe(0, 40, 25));
  coin([0.15, 0.335, -0.1], 0.035, 0.01, qe(0, 10, -30));
>>>>>>> REPLACE

<<<<<<< SEARCH
        [-0.45, 0.82, -0.3],
        [-0.2, 1.0, -0.4],
        [0.05, 0.78, -0.35],
        [-0.3, 0.68, -0.15],
=======
        [-0.46, 0.74, -0.14],
        [-0.2, 0.8, -0.18],
>>>>>>> REPLACE

<<<<<<< SEARCH
    [-0.7, -0.08],
    [-0.52, 0.0],
    [-0.3, -0.04],
    [-0.12, 0.02],
    [0.0, -0.1],
=======
    [-0.85, 0.12],
    [-0.78, 0.24],
    [-0.4, 0.1],
    [0.0, 0.1],
    [0.04, 0.22],
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(gp(rig(-0.4, FY, -0.1, i * 25), new THREE.CylinderGeometry(0.035, 0.035, 0.01, 8), "#e8b52c", [0, 0.005 + i * 0.01, 0]), 0.6);
=======
    glow(gp(rig(-0.22, FY, 0.18, i * 25), new THREE.CylinderGeometry(0.035, 0.035, 0.01, 8), "#e8b52c", [0, 0.005 + i * 0.01, 0]), 0.6);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const HOOPS = [0.1, 0.26, 0.54, 0.7];
=======
  const HOOPS = [0.1, 0.26, 0.54, 0.7];
  const QI = new THREE.Quaternion();
  const hoop = (x: number, y: number, z: number, r: number, q: THREE.Quaternion, d: V3, k = 1) => {
    b.part(new THREE.CylinderGeometry(r, r, 0.05 * k, 8), IRONP, { at: [x, y, z], quat: q, bone: root });
    const rr = r * 1.004;
    b.part(new THREE.CylinderGeometry(rr, rr, 0.008 * k, 8), "#8b93ad", {
      at: [x + d[0] * 0.021 * k, y + d[1] * 0.021 * k, z + d[2] * 0.021 * k],
      quat: q,
      bone: root,
    });
  };
>>>>>>> REPLACE

<<<<<<< SEARCH
  const barrelPaint = (seed: number, ctr?: THREE.Vector3) =>
=======
  const barrelPaint = (seed: number, ctr?: THREE.Vector3, k = 1) =>
>>>>>>> REPLACE

<<<<<<< SEARCH
      const h = s[0];
=======
      const h = s[0] / k;
>>>>>>> REPLACE

<<<<<<< SEARCH
      if (ctr && h > 0.58 && Math.hypot(p.x - ctr.x, p.z - ctr.z) < 0.27)
=======
      if (ctr && h > 0.58 && Math.hypot(p.x - ctr.x, p.z - ctr.z) < 0.27 * k)
>>>>>>> REPLACE

<<<<<<< SEARCH
      const t = 0.38 + 0.3 * hsh(st, seed, 5) + 0.14 * (hsh(q, st + seed * 3, 6) - 0.5);
=======
      const t = 0.38 + 0.3 * hsh(st, seed, 5) + 0.14 * (hsh(q, st + seed * 3, 6) - 0.5) + (n.y > 0.3 ? 0.2 : 0);
>>>>>>> REPLACE

<<<<<<< SEARCH
    AZ = -0.55;
=======
    AZ = -0.72;
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const y of HOOPS) {
    const r = barrelR(y) * 1.1;
    b.part(new THREE.CylinderGeometry(r, r, 0.05, 8), IRONP, { at: [AX, FY + y, AZ], bone: root });
  }
=======
  for (const y of HOOPS) hoop(AX, FY + y, AZ, barrelR(y) * 1.04, QI, [0, 1, 0]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const BX = 1.15,
    BZ = -0.12;
  const bc = new THREE.Vector3(BX, FY, BZ);
  const barrelB = b.lathe(BARREL_OPEN, { at: [BX, FY, BZ], segments: 8, color: barrelPaint(2, bc), bone: root });
  for (const y of HOOPS) {
    const r = barrelR(y) * 1.1;
    b.part(new THREE.CylinderGeometry(r, r, 0.05, 8), IRONP, { at: [BX, FY + y, BZ], bone: root });
  }
  b.decal(barrelB, POISON, { at: [BX, FY + 0.4, BZ + 0.33], dir: [0, 0, 1], size: [0.2, 0.2], segments: 6 });
  glow(b.part(new THREE.CylinderGeometry(0.205, 0.205, 0.03, 8), WHITE, { at: [BX, FY + 0.775, BZ], bone: root, texture: SLIME }), 1.3);
=======
  const BS = 0.85;
  const BX = 1.15,
    BZ = -0.27;
  const bc = new THREE.Vector3(BX, FY, BZ);
  const BARREL_OPEN_S = BARREL_OPEN.map(([x, y]) => [x * BS, y * BS] as [number, number]);
  const barrelB = b.lathe(BARREL_OPEN_S, { at: [BX, FY, BZ], segments: 8, color: barrelPaint(2, bc, BS), bone: root });
  for (const y of HOOPS) hoop(BX, FY + y * BS, BZ, barrelR(y) * 1.04 * BS, QI, [0, 1, 0], BS);
  b.decal(barrelB, POISON, {
    at: [BX, FY + 0.4 * BS, BZ + 0.33 * BS],
    dir: [0, 0, 1],
    size: [0.2 * BS, 0.2 * BS],
    segments: 6,
  });
  glow(
    b.part(new THREE.CylinderGeometry(0.205 * BS, 0.205 * BS, 0.03 * BS, 8), WHITE, {
      at: [BX, FY + 0.775 * BS, BZ],
      bone: root,
      texture: SLIME,
    }),
    1.3,
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(b.part(new THREE.BoxGeometry(0.035, 0.035, 0.035), "#a6f26a", { at: [BX + dx, FY + 0.795, BZ], bone: root }), 1.5);
=======
    glow(
      b.part(new THREE.BoxGeometry(0.035 * BS, 0.035 * BS, 0.035 * BS), "#a6f26a", {
        at: [BX + dx * BS, FY + 0.795 * BS, BZ + dz * BS],
        bone: root,
      }),
      1.5,
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const y of HOOPS) {
    const r = barrelR(y) * 1.1;
    b.part(new THREE.CylinderGeometry(r, r, 0.05, 8), IRONP, {
      at: CBR.p([0, 0, y - 0.4]),
      quat: qe(90, 0, 0),
      bone: root,
    });
  }
=======
  for (const y of HOOPS) {
    const hp = CBR.p([0, 0, y - 0.4]);
    hoop(hp[0], hp[1], hp[2], barrelR(y) * 1.04, qe(90, 0, 0), [0, 0, 1]);
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
      const h = 0.2 + 0.16 * hsh(i, j, 21);
=======
      const h = 0.26 + 0.06 * hsh(i, j, 21);
>>>>>>> REPLACE

<<<<<<< SEARCH
      cb(T, [0.085, 0.02, 0.085], "#2c2f3d", [x, 0.05, z]);
      gp(T, new THREE.ConeGeometry(0.04, h, 4), STEEL, [x, 0.04 + h / 2, z], { q: q45, flat: true });
      if (hsh(i, j, 22) > 0.62) {
=======
      for (const [bx, bz, bw, bd] of [
        [0, 0.045, 0.105, 0.015],
        [0, -0.045, 0.105, 0.015],
        [0.045, 0, 0.015, 0.075],
        [-0.045, 0, 0.015, 0.075],
      ] as [number, number, number, number][])
        cb(T, [bw, 0.03, bd], "#2c2f3d", [x + bx, 0.055, z + bz]);
      gp(T, new THREE.ConeGeometry(0.05, h, 4), STEEL, [x, 0.04 + h / 2, z], { q: q45, flat: true });
      if (hsh(i, j, 22) > 0.8) {
>>>>>>> REPLACE

<<<<<<< SEARCH
        gp(T, new THREE.ConeGeometry(0.04 * f * 1.08, h * f, 4), BLOOD, [x, 0.04 + h - (f * h) / 2, z], {
=======
        gp(T, new THREE.ConeGeometry(0.05 * f * 1.08, h * f, 4), BLOOD, [x, 0.04 + h - (f * h) / 2, z], {
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (let i = 0; i < 9; i++) cb(S, [0.032, 0.03, 0.04], BONE, [0, 0.015, -0.2 + i * 0.05]);
=======
  for (let i = 0; i < 9; i++) cb(S, [0.032, 0.03, 0.04], BONE, [0, 0.015, -0.2 + i * 0.05]);
  cb(S, [0.03, 0.028, 0.035], BONE, [0, 0.018, -0.24]);
  cb(S, [0.028, 0.026, 0.035], BONE, [0, 0.022, -0.21]);
>>>>>>> REPLACE

<<<<<<< SEARCH
    gp(S, new THREE.TorusGeometry(ribR[i], 0.009, 4, 7, Math.PI), BONE, [0, 0, z], { scale: [1, 0.7, 1], flat: true }),
=======
    gp(S, new THREE.TorusGeometry(ribR[i], 0.012, 4, 7, Math.PI), BONE, [0, 0.009, z], { scale: [1, 0.7, 1], flat: true }),
>>>>>>> REPLACE

<<<<<<< SEARCH
        const t = 0.5 + 0.32 * (hsh(k, y >> 1, 1) - 0.5) + 0.1 * (hsh(x >> 4, y >> 4, 2) - 0.5);
=======
        const t = 0.52 + 0.2 * (hsh(x >> 3, y >> 2, 1) - 0.5) + 0.08 * (hsh(k, y >> 1, 2) - 0.5);
>>>>>>> REPLACE

<<<<<<< SEARCH
      for (let i = 0; i < 14; i++) {
=======
      for (let i = 0; i < 9; i++) {
>>>>>>> REPLACE

<<<<<<< SEARCH
            if (hsh(x >> 2, y >> 1, 9) > 0.45 && hsh(x >> 3, 0, 4) > 0.5) g.set(x, y, hsh(x >> 1, y, 6) < 0.5 ? "#2f5a20" : "#4a7a2a");
=======
            if (hsh(x >> 2, y >> 1, 9) > 0.45 && hsh(x >> 3, 0, 4) > 0.5) g.set(x, y, hsh(x >> 1, y, 6) < 0.5 ? "#2c4d20" : "#3d6a26");
>>>>>>> REPLACE

<<<<<<< SEARCH
      tb(rig(-1.28 + i * 0.64, 0, -0.975 + j * 0.65), [0.62, FY, 0.63], (i === 0 || i === 4 || j === 0 || j === 3) && hsh(i, j, 77) > 0.55 ? STONEM : STONE, 0.02, [0, FY / 2, 0], {
=======
      tb(rig(-1.28 + i * 0.64, 0, -0.975 + j * 0.65), [0.62, FY, 0.63], (i === 0 || i === 4 || j === 0 || j === 3) && hsh(i, j, 77) > 0.72 ? STONEM : STONE, 0.02, [0, FY / 2, 0], {
>>>>>>> REPLACE

<<<<<<< SEARCH
    tb(R, [0.17 * s, 0.12 * s, 0.17 * s], BONETEX, 0.012 * s, [0, 0.1 * s, 0]);
    tb(R, [0.13 * s, 0.04 * s, 0.15 * s], BONETEX, 0.012 * s, [0, 0.178 * s, -0.01 * s]);
=======
    tb(R, [0.15 * s, 0.12 * s, 0.17 * s], BONETEX, 0.012 * s, [0, 0.1 * s, 0]);
    for (const sx of [1, -1]) {
      tb(R, [0.016 * s, 0.085 * s, 0.14 * s], BONETEX, 0.012 * s, [sx * 0.083 * s, 0.092 * s, -0.015 * s]);
      tb(R, [0.03 * s, 0.024 * s, 0.02 * s], BONETEX, 0.012 * s, [sx * 0.05 * s, 0.048 * s, 0.082 * s]);
    }
    tb(R, [0.12 * s, 0.09 * s, 0.02 * s], BONETEX, 0.012 * s, [0, 0.1 * s, -0.095 * s]);
    tb(R, [0.11 * s, 0.04 * s, 0.15 * s], BONETEX, 0.012 * s, [0, 0.178 * s, -0.01 * s]);
>>>>>>> REPLACE

<<<<<<< SEARCH
    tb(R, [0.12 * s, 0.05 * s, 0.12 * s], BONETEX, 0.012 * s, [0, 0.02 * s, -0.01 * s]);
    gp(R, new THREE.PlaneGeometry(0.12 * s, 0.045 * s), WHITE, [0, 0.025 * s, 0.0515 * s], { tex: TEETH });
=======
    tb(R, [0.12 * s, 0.05 * s, 0.11 * s], BONETEX, 0.012 * s, [0, 0.02 * s, -0.02 * s]);
    gp(R, new THREE.PlaneGeometry(0.12 * s, 0.045 * s), WHITE, [0, 0.025 * s, 0.0365 * s], { tex: TEETH });
>>>>>>> REPLACE