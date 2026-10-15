1. **Light pools hung off the slab.** The orange dithered torch pools were 1.7 m squares centred at x = ±1.25, so they spilled past the 3.2 × 2.6 m floor and read as floating pixels in the front, side and low renders. I shrank them to 0.9 m squares inside the slab edge, so each pool still sits under a torch.
2. **No setting behind the props.** The scene was a flat slab with nothing framing it. I added a broken stone back wall in running-bond courses, built from the same pixel stone tile at the same texel size. Its ragged top steps from 1.0 m up to 1.5 m and down again. The wall gives the torches and the chest a backdrop and fills out the silhouette. It sits at z = -1.2, so it stays behind the torch bases and the open lid.
3. **Wall detail.** I hung an iron wall plate, a chain and an open manacle on the tall section, clear of the chest lid. This tells the dungeon story and gives the right half of the wall a focal point.
4. **Skeleton was too faint.** The ribs were thin and low, so the skeleton barely read in the renders. I thickened the ribs and made them taller.
5. **Chest gold didn't spill.** The hoard stayed inside the box. I added a few glowing coins resting on the front lip so the gold reads as overflowing.

<<<<<<< SEARCH
    [-1.25, -0.85, 1.7, FIREPOOL],
    [1.25, -0.85, 1.7, FIREPOOL],
=======
    [-1.15, -0.85, 0.9, FIREPOOL],
    [1.15, -0.85, 0.9, FIREPOOL],
>>>>>>> REPLACE
<<<<<<< SEARCH
  // ================================================================== treasure chest
=======
  // ================================================================== broken back wall
  const WZ = -1.2;
  const wallH = (x: number) => (x < -0.9 ? 1.0 : x < 0.4 ? 1.5 : x < 1.0 ? 0.9 : 1.25);
  const W0 = rig(0, FY, 0);
  for (let r = 0; r < 8; r++) {
    let x = -1.6;
    let k = 0;
    while (x < 1.595) {
      let w = 0.34 + 0.12 * hsh(r, k, 31);
      if (k === 0 && r % 2) w = 0.2;
      w = Math.min(w, 1.6 - x);
      if (w < 0.05) break;
      const xc = x + w / 2;
      const top = wallH(xc) - 0.14 * hsh(Math.floor(xc * 4), 3, 33);
      const y0 = r * 0.19;
      if (y0 + 0.1 < top) {
        const h = Math.min(0.19, top - y0);
        tb(W0, [w - 0.01, h - 0.005, 0.18], STONE, 0.02, [xc, y0 + h / 2, WZ - 0.02 * hsh(r, k, 34)], { seed: nsd() });
      }
      x += w;
      k++;
    }
  }
  // iron wall plate, chain and open manacle
  const WR = rig(0.2, FY, -1.1);
  tb(WR, [0.12, 0.12, 0.04], IRON, 0.015, [0, 1.36, 0], { seed: nsd() });
  for (let i = 0; i < 4; i++)
    gp(WR, new THREE.TorusGeometry(0.03, 0.008, 4, 6), "#8a90a8", [0, 1.27 - i * 0.07, 0.025], {
      q: qe(0, i % 2 ? 90 : 0, 0),
      flat: true,
    });
  gp(WR, new THREE.TorusGeometry(0.065, 0.017, 4, 8, Math.PI * 1.6), "#6b7189", [0, 0.97, 0.03], {
    q: qe(0, 0, 50),
    flat: true,
  });
  cb(WR, [0.05, 0.03, 0.04], "#454a5e", [0, 1.04, 0.03]);

  // ================================================================== treasure chest
>>>>>>> REPLACE
<<<<<<< SEARCH
  // coins on the floor
=======
  // coins spilling over the chest lip
  for (const [l, r] of [
    [[-0.2, 0.365, 0.275], [8, 0, 0]],
    [[0.05, 0.37, 0.285], [0, 0, 14]],
    [[0.3, 0.366, 0.27], [12, 30, 0]],
  ] as [V3, V3][])
    glow(gp(C, new THREE.CylinderGeometry(0.035, 0.035, 0.01, 8), "#e8b52c", l, { q: qe(r[0], r[1], r[2]) }), 0.8);
  // coins on the floor
>>>>>>> REPLACE
<<<<<<< SEARCH
    gp(S, new THREE.TorusGeometry(ribR[i], 0.009, 4, 7, Math.PI), BONE, [0, 0, z], { scale: [1, 0.7, 1], flat: true }),
=======
    gp(S, new THREE.TorusGeometry(ribR[i], 0.013, 4, 7, Math.PI), BONE, [0, 0, z], { scale: [1, 0.9, 1], flat: true }),
>>>>>>> REPLACE