1. **The chest lid hovered ajar at 42° over the gold.** It hid the hoard and read as half-shut. I open it to 100° so the lid stands up behind the chest with its inner planks facing the viewer, and move the chest forward 0.1 m so the lid clears the slab edge.
2. **The gold hid behind the front wall.** I build the heap in taller tiers, so the gold, gems and coins mound above the rim and glint from the front and three-quarter views. The coins spilled on the floor move forward to match the chest.
3. **Barrel B clipped the spike trap's corner.** I shift it right and back so there is clear floor between them.
4. **The slab was a flat, cold purple.** I add dithered pixel pools of warm light under both torches and a gold glow in front of the chest. That ties the glowing props to the floor and gives the scene a lit-from-within look.

<<<<<<< SEARCH
  const CX = -0.35,
    CZ = -0.45,
    CW = 0.95,
    CD = 0.6,
    WT = 0.06,
    OPEN = 42;
=======
  const CX = -0.35,
    CZ = -0.35,
    CW = 0.95,
    CD = 0.6,
    WT = 0.06,
    OPEN = 100;
>>>>>>> REPLACE

<<<<<<< SEARCH
    tb(C, [0.56, 0.09, 0.3], GOLD, 0.012, [0.05, 0.247, 0], { seed: nsd() }),
    tb(C, [0.34, 0.09, 0.2], GOLD, 0.012, [-0.04, 0.33, 0.02], { seed: nsd() }),
=======
    tb(C, [0.56, 0.12, 0.3], GOLD, 0.012, [0.05, 0.29, 0], { seed: nsd() }),
    tb(C, [0.36, 0.12, 0.2], GOLD, 0.012, [-0.04, 0.38, 0.02], { seed: nsd() }),
>>>>>>> REPLACE

<<<<<<< SEARCH
    [[-0.06, 0.4, 0.04], "#e0243a", [30, 45, 20]],
    [[0.2, 0.31, 0.06], "#2c8cff", [20, 30, 40]],
    [[-0.22, 0.3, -0.05], "#2fd36a", [40, 20, 10]],
    [[0.1, 0.395, -0.03], "#e8e0ff", [10, 50, 30]],
=======
    [[-0.06, 0.47, 0.04], "#e0243a", [30, 45, 20]],
    [[0.2, 0.37, 0.06], "#2c8cff", [20, 30, 40]],
    [[-0.22, 0.36, -0.05], "#2fd36a", [40, 20, 10]],
    [[0.1, 0.47, -0.03], "#e8e0ff", [10, 50, 30]],
>>>>>>> REPLACE

<<<<<<< SEARCH
    [[0.12, 0.385, 0.05], [70, 0, 20]],
    [[-0.12, 0.292, 0.12], [20, 0, 80]],
    [[0.28, 0.296, -0.06], [60, 30, 0]],
    [[0.0, 0.42, 0.01], [10, 0, 60]],
=======
    [[0.12, 0.45, 0.05], [70, 0, 20]],
    [[-0.12, 0.36, 0.12], [20, 0, 80]],
    [[0.28, 0.36, -0.06], [60, 30, 0]],
    [[0.0, 0.5, 0.01], [10, 0, 60]],
>>>>>>> REPLACE

<<<<<<< SEARCH
    [-0.7, -0.08],
    [-0.52, 0.0],
    [-0.3, -0.04],
    [-0.12, 0.02],
    [0.0, -0.1],
=======
    [-0.7, 0.06],
    [-0.52, 0.14],
    [-0.3, 0.1],
    [-0.12, 0.16],
    [0.0, 0.04],
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(gp(rig(-0.4, FY, -0.1, i * 25), new THREE.CylinderGeometry(0.035, 0.035, 0.01, 8), "#e8b52c", [0, 0.005 + i * 0.01, 0]), 0.6);
=======
    glow(gp(rig(-0.4, FY, 0.1, i * 25), new THREE.CylinderGeometry(0.035, 0.035, 0.01, 8), "#e8b52c", [0, 0.005 + i * 0.01, 0]), 0.6);
>>>>>>> REPLACE

<<<<<<< SEARCH
  // ================================================================== torches
=======
  // ================================================================== light pools on the floor
  const pool = (col: string, tight: number) =>
    pixelTexture(24, 24, (g) => {
      g.fill((x, y) => {
        const d = Math.hypot(x - 11.5, y - 11.5) / 12;
        return d < 1 && (1 - d) * tight > bayer(x, y) ? col : "";
      });
    });
  const FIREPOOL = pool("#ff9a3a", 1.7);
  const GOLDPOOL = pool("#ffd34a", 1.4);
  for (const [px, pz, sz, tex] of [
    [-1.25, -0.85, 1.7, FIREPOOL],
    [1.25, -0.85, 1.7, FIREPOOL],
    [-0.35, 0.2, 1.3, GOLDPOOL],
  ] as [number, number, number, THREE.Texture][])
    glow(
      b.part(new THREE.PlaneGeometry(sz, sz), WHITE, {
        at: [px, FY + 0.004, pz],
        dir: [0, 1, 0],
        up: [0, 0, -1],
        axis: "z",
        bone: root,
        texture: tex,
      }),
      0.55,
    );

  // ================================================================== torches
>>>>>>> REPLACE

<<<<<<< SEARCH
  const BX = 1.15,
    BZ = -0.12;
=======
  const BX = 1.28,
    BZ = -0.2;
>>>>>>> REPLACE