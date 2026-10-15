1. **Skulls:** `skull()` now has a 0.17 central block with a narrower 0.13 crown stepped in 0.02·s per side, a 0.144×0.12 face plane (SKULLFACE's 1.2 aspect, so no stretching), and the jaw sitting on y=0. The loose skull is now `yaw 20`, pitch 0, and the glowing eyes are dropped from the barrel-top and floor-skeleton skulls.
2. **Barrel C:** `CBY` is now `FY + 0.35`, so the barrel and all four hoops lift together. The chocks are 0.08 high, centred at 0.04, and their top edges meet the lower barrel facets.
3. **Slime:** the cylinder is now radius 0.205 centred at 0.775 (top 0.79, below the 0.8 rim). The three bubbles sit at 0.795, half in the liquid.
4. **Torches:** the post is 0.78 tall (centre 0.57), the bands are at 0.22/0.62/0.86, and the rod endpoints are at 0.86/1.12. The bowl, rim, coals, both flame cards and the embers are lowered by 0.22.
5. **Paving:** `STONE` is rebuilt from 3×2 texel clusters over a narrow mid-value range. The darkest colour is limited to the far-edge joints and a single crack, and the near edges get a light bevel. A separate `STONEM` tile with a few moss clusters is used only on some perimeter tiles.
6. **Coin mound:** a low gold fill (glow 0.35) now sits under 19 stacked coins and 2 tilted ones, all 8-sided in 3 tones. Four gems rest on stack tops, and a coin trail runs from the rim to the chest base plate and out onto the floor.
7. **Iron and glow:** `IRONP` now lifts up-facing and lit side facets by face, with little speckle. The torch rims get a warm `RIMWARM` top lip. The gold fill glow is reduced and only every fifth coin glows.

## Edits

<<<<<<< SEARCH
  function skull(R: Rig, s: number, eye?: string) {
    tb(R, [0.17 * s, 0.15 * s, 0.17 * s], BONETEX, 0.012 * s, [0, 0.105 * s, 0]);
    gp(R, new THREE.PlaneGeometry(0.17 * s, 0.142 * s), WHITE, [0, 0.105 * s, 0.0865 * s], { tex: SKULLFACE });
=======
  function skull(R: Rig, s: number, eye?: string) {
    tb(R, [0.17 * s, 0.12 * s, 0.17 * s], BONETEX, 0.012 * s, [0, 0.1 * s, 0]);
    tb(R, [0.13 * s, 0.04 * s, 0.15 * s], BONETEX, 0.012 * s, [0, 0.178 * s, -0.01 * s]);
    gp(R, new THREE.PlaneGeometry(0.144 * s, 0.12 * s), WHITE, [0, 0.1 * s, 0.0865 * s], { tex: SKULLFACE });
>>>>>>> REPLACE

<<<<<<< SEARCH
  skull(rig(1.28, FY, 0.75, -150, -10), 0.9);
=======
  skull(rig(1.28, FY, 0.75, 20), 0.9);
>>>>>>> REPLACE

<<<<<<< SEARCH
  skull(rig(AX, FY + 0.8, AZ, 15), 0.9, "#ff3a2a");
=======
  skull(rig(AX, FY + 0.8, AZ, 15), 0.9);
>>>>>>> REPLACE

<<<<<<< SEARCH
  skull(S.sub([0, 0.05, -0.3], 0, -35), 1.0, "#ff3a2a");
=======
  skull(S.sub([0, 0.05, -0.3], 0, -35), 1.0);
>>>>>>> REPLACE

<<<<<<< SEARCH
    CBY = FY + 0.31;
=======
    CBY = FY + 0.35;
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const sx of [1, -1]) tb(rig(CBX + sx * 0.18, FY, CBZ), [0.06, 0.05, 0.5], POST, 0.0125, [0, 0.025, 0], { seed: nsd() });
=======
  for (const sx of [1, -1]) tb(rig(CBX + sx * 0.18, FY, CBZ), [0.06, 0.08, 0.5], POST, 0.0125, [0, 0.04, 0], { seed: nsd() });
>>>>>>> REPLACE

<<<<<<< SEARCH
  glow(b.part(new THREE.CylinderGeometry(0.215, 0.215, 0.03, 8), WHITE, { at: [BX, FY + 0.715, BZ], bone: root, texture: SLIME }), 1.3);
=======
  glow(b.part(new THREE.CylinderGeometry(0.205, 0.205, 0.03, 8), WHITE, { at: [BX, FY + 0.775, BZ], bone: root, texture: SLIME }), 1.3);
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(b.part(new THREE.BoxGeometry(0.035, 0.035, 0.035), "#a6f26a", { at: [BX + dx, FY + 0.74, BZ + dz], bone: root }), 1.5);
=======
    glow(b.part(new THREE.BoxGeometry(0.035, 0.035, 0.035), "#a6f26a", { at: [BX + dx, FY + 0.795, BZ + dz], bone: root }), 1.5);
>>>>>>> REPLACE

<<<<<<< SEARCH
    tb(R, [0.14, 1.0, 0.14], POST, 0.0175, [0, 0.68, 0]);
    for (const y of [0.22, 0.62, 1.08]) tb(R, [0.19, 0.06, 0.19], IRON, 0.015, [0, y, 0], { seed: nsd() });
    for (const sx of [1, -1])
      for (const sz of [1, -1])
        b.rod(R.p([sx * 0.095, 1.08, sz * 0.095]), R.p([sx * 0.14, 1.34, sz * 0.14]), 0.012, "#3a3f52", {
          bone: root,
          sides: 4,
        });
    b.lathe(BOWL, { at: R.p([0, 1.2, 0]), segments: 8, color: IRONP, bone: root });
    b.lathe(RIMP, { at: R.p([0, 1.2, 0]), segments: 8, color: IRONP, bone: root });
    glow(gp(R, new THREE.CylinderGeometry(0.17, 0.17, 0.05, 8), WHITE, [0, 1.405, 0], { tex: COALS }), 1.1);
    glow(
      b.cards([frame(R.p([0, 1.43, 0]), [0, 1, 0])], FLAME, {
=======
    tb(R, [0.14, 0.78, 0.14], POST, 0.0175, [0, 0.57, 0]);
    for (const y of [0.22, 0.62, 0.86]) tb(R, [0.19, 0.06, 0.19], IRON, 0.015, [0, y, 0], { seed: nsd() });
    for (const sx of [1, -1])
      for (const sz of [1, -1])
        b.rod(R.p([sx * 0.095, 0.86, sz * 0.095]), R.p([sx * 0.14, 1.12, sz * 0.14]), 0.012, "#3a3f52", {
          bone: root,
          sides: 4,
        });
    b.lathe(BOWL, { at: R.p([0, 0.98, 0]), segments: 8, color: IRONP, bone: root });
    b.lathe(RIMP, { at: R.p([0, 0.98, 0]), segments: 8, color: RIMWARM, bone: root });
    glow(gp(R, new THREE.CylinderGeometry(0.17, 0.17, 0.05, 8), WHITE, [0, 1.185, 0], { tex: COALS }), 1.1);
    glow(
      b.cards([frame(R.p([0, 1.21, 0]), [0, 1, 0])], FLAME, {
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.cards([frame(R.p([0.07, 1.43, -0.05]), [0, 1, 0])], FLAME, {
=======
      b.cards([frame(R.p([0.07, 1.21, -0.05]), [0, 1, 0])], FLAME, {
>>>>>>> REPLACE

<<<<<<< SEARCH
      [0.05, 1.98, 0.03],
      [-0.07, 2.05, -0.02],
      [0.02, 2.12, 0.06],
      [-0.03, 1.92, -0.07],
      [0.09, 2.02, -0.05],
=======
      [0.05, 1.76, 0.03],
      [-0.07, 1.83, -0.02],
      [0.02, 1.9, 0.06],
      [-0.03, 1.7, -0.07],
      [0.09, 1.8, -0.05],
>>>>>>> REPLACE

<<<<<<< SEARCH
  const IRONP = cellPaint(0.02, (c) => c.pick(IRONR, 0.25 + 0.3 * c.random(2) + 0.2 * Math.max(0, c.n.y)), {
    dither: true,
  });
=======
  const IRONP = cellPaint(
    0.02,
    (c) => {
      let v = 0.3 + 0.08 * c.random(2);
      if (c.n.y > 0.4) v += 0.28;
      else if (c.n.y < -0.4) v -= 0.08;
      else if (c.n.z > 0.3 || c.n.x > 0.3) v += 0.12;
      return c.pick(IRONR, v);
    },
    { dither: false },
  );
  const RIMWARM = cellPaint(
    0.02,
    (c) => (c.n.y > 0.5 ? (c.random(4) < 0.35 ? "#d9803a" : "#b5642e") : c.pick(IRONR, 0.3 + 0.1 * c.random(3))),
    { dither: false },
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
  const STONE = pixelTexture(32, 32, (g) => {
    g.fill((x, y) => {
      let t = 0.45 + 0.35 * (hsh(x >> 1, y >> 1, 1) - 0.5) + 0.25 * (hsh(x >> 3, y >> 3, 2) - 0.5);
      if (y < 2 || x < 2) t += 0.22;
      if (y > 29 || x > 29) t -= 0.25;
      return pick(STONER, t, bayer(x, y));
    });
    let cx = 9;
    for (let i = 0; i < 16; i++) {
      g.set(cx, 4 + i, STONER[0]);
      if (hsh(i, 0, 5) < 0.5) cx++;
    }
    for (let x = 0; x < 32; x++)
      for (let y = 0; y < 5; y++)
        if (hsh(x >> 1, y, 9) > 0.8 - y * 0.05 && hsh(x >> 3, 0, 4) > 0.55) g.set(x, y + 2, hsh(x, y, 6) < 0.5 ? "#2f5a20" : "#4a7a2a");
  });
=======
  const mkStone = (moss: boolean) =>
    pixelTexture(32, 32, (g) => {
      g.fill((x, y) => {
        if (x === 31 || y === 31) return STONER[0];
        if (x === 0 || y === 0) return STONER[3];
        const k = Math.floor((x + ((y >> 1) % 3)) / 3);
        const t = 0.5 + 0.32 * (hsh(k, y >> 1, 1) - 0.5) + 0.1 * (hsh(x >> 4, y >> 4, 2) - 0.5);
        return pick(STONER, t);
      });
      let cx = 9;
      for (let i = 0; i < 14; i++) {
        g.set(cx, 5 + i, STONER[0]);
        if (hsh(i, 0, 5) < 0.5) cx++;
      }
      if (moss)
        for (let x = 1; x < 31; x++)
          for (let y = 1; y < 6; y++)
            if (hsh(x >> 2, y >> 1, 9) > 0.45 && hsh(x >> 3, 0, 4) > 0.5) g.set(x, y, hsh(x >> 1, y, 6) < 0.5 ? "#2f5a20" : "#4a7a2a");
    });
  const STONE = mkStone(false);
  const STONEM = mkStone(true);
>>>>>>> REPLACE

<<<<<<< SEARCH
      tb(rig(-1.28 + i * 0.64, 0, -0.975 + j * 0.65), [0.62, FY, 0.63], STONE, 0.02, [0, FY / 2, 0], {
=======
      tb(rig(-1.28 + i * 0.64, 0, -0.975 + j * 0.65), [0.62, FY, 0.63], (i === 0 || i === 4 || j === 0 || j === 3) && hsh(i, j, 77) > 0.55 ? STONEM : STONE, 0.02, [0, FY / 2, 0], {
>>>>>>> REPLACE

<<<<<<< SEARCH
  // gold heap
  const heap = [
    tb(C, [0.76, 0.12, 0.42], GOLD, 0.012, [0, 0.142, 0], { seed: nsd() }),
    tb(C, [0.56, 0.09, 0.3], GOLD, 0.012, [0.05, 0.247, 0], { seed: nsd() }),
    tb(C, [0.34, 0.09, 0.2], GOLD, 0.012, [-0.04, 0.33, 0.02], { seed: nsd() }),
  ];
  for (const h of heap) glow(h, 0.7);
  const gems: [V3, string, V3][] = [
    [[-0.06, 0.4, 0.04], "#e0243a", [30, 45, 20]],
    [[0.2, 0.31, 0.06], "#2c8cff", [20, 30, 40]],
    [[-0.22, 0.3, -0.05], "#2fd36a", [40, 20, 10]],
    [[0.1, 0.395, -0.03], "#e8e0ff", [10, 50, 30]],
  ];
  for (const [l, col, r] of gems) glow(cb(C, [0.04, 0.04, 0.04], col, l, qe(r[0], r[1], r[2])), 1.6);
  for (const [l, r] of [
    [[0.12, 0.385, 0.05], [70, 0, 20]],
    [[-0.12, 0.292, 0.12], [20, 0, 80]],
    [[0.28, 0.296, -0.06], [60, 30, 0]],
    [[0.0, 0.42, 0.01], [10, 0, 60]],
  ] as [V3, V3][])
    glow(gp(C, new THREE.CylinderGeometry(0.035, 0.035, 0.01, 8), "#e8b52c", l, { q: qe(r[0], r[1], r[2]) }), 0.8);
=======
  // gold fill + irregular coin mound
  glow(tb(C, [0.76, 0.12, 0.42], GOLD, 0.012, [0, 0.142, 0], { seed: nsd() }), 0.35);
  const rc = rng(41);
  const COINC = ["#e8b52c", "#ffd34a", "#c8901c"];
  let ci = 0;
  const coin = (l: V3, r: number, th: number, q: THREE.Quaternion) => {
    const n = ci++;
    const part = gp(C, new THREE.CylinderGeometry(r, r, th, 8), COINC[n % 3], l, { q });
    if (n % 5 === 0) glow(part, 0.8);
    return part;
  };
  const stacks: [number, number, number][] = [
    [-0.22, -0.03, 3],
    [-0.08, 0.02, 5],
    [0.06, -0.03, 5],
    [0.2, 0.04, 4],
    [-0.3, 0.1, 2],
  ];
  const tops: number[] = [];
  for (const [sx0, sz0, n] of stacks) {
    let y = 0.202;
    for (let k = 0; k < n; k++) {
      const r = 0.025 + 0.015 * rc();
      const th = 0.008 + 0.004 * rc();
      coin([sx0 + (rc() - 0.5) * 0.03, y + th / 2, sz0 + (rc() - 0.5) * 0.03], r, th, qe(0, rc() * 360, 0));
      y += th;
    }
    tops.push(y);
  }
  coin([-0.15, 0.245, 0.03], 0.035, 0.01, qe(0, 40, 25));
  coin([0.13, 0.255, 0.0], 0.035, 0.01, qe(0, 10, -30));
  const gemAt: [number, number, number, string, V3][] = [
    [-0.22, -0.03, tops[0], "#2fd36a", [20, 40, 10]],
    [-0.08, 0.02, tops[1], "#e0243a", [20, 45, 20]],
    [0.06, -0.03, tops[2], "#2c8cff", [15, 30, 25]],
    [0.2, 0.04, tops[3], "#e8e0ff", [10, 50, 20]],
  ];
  for (const [gx, gz, gy, col, r] of gemAt)
    glow(cb(C, [0.04, 0.04, 0.04], col, [gx, gy + 0.018, gz], qe(r[0], r[1], r[2])), 1.6);
  // coin trail: over the front rim, onto the base plate, out to the floor spill
  coin([0.19, 0.365, 0.285], 0.035, 0.01, qe(0, 20, 6));
  coin([0.2, 0.372, 0.318], 0.033, 0.01, qe(35, 0, 0));
  coin([0.17, 0.045, 0.3], 0.033, 0.01, qe(0, 60, 0));
  coin([0.2, 0.005, 0.36], 0.035, 0.01, qe(0, 10, 0));
  coin([0.23, 0.005, 0.42], 0.033, 0.01, qe(0, 70, 0));
>>>>>>> REPLACE