1. The brake discs hid the wheel hubs and spokes behind big grey plates. I shrank them to slim rings so the spokes and neon rim show.
2. Six chunky spokes looked toy-like. Wheels now have 12 thinner spokes alternating orange and chrome.
3. The tank is plain orange and navy. It now has two cream racing stripes along the top, which gives the hero-shooter paint-job read.
4. The pad is bare at the corners. I added five hex bollards with glowing teal caps and orange collars, which frame the bike and echo the hex and neon language.

<<<<<<< SEARCH
    b.ring(j, { count: 6, radius: ri - 0.004 }, (it) => {
      b.rod(j, it, [0.026, 0.017], ORANGE, { bone: j });
    });
=======
    b.ring(j, { count: 12, radius: ri - 0.004 }, (it) => {
      b.rod(j, it, [0.016, 0.01], it.i % 2 ? ORANGE : CHROME, { bone: j });
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
      [0.07, 0],
      [0.19, 0],
      [0.19, 0.008],
      [0.07, 0.008],
=======
      [0.1, 0],
      [0.17, 0],
      [0.17, 0.008],
      [0.1, 0.008],
>>>>>>> REPLACE

<<<<<<< SEARCH
      [0.07, 0],
      [0.18, 0],
      [0.18, 0.008],
      [0.07, 0.008],
=======
      [0.1, 0],
      [0.16, 0],
      [0.16, 0.008],
      [0.1, 0.008],
>>>>>>> REPLACE

<<<<<<< SEARCH
const TANK = countershade(ORANGE, NAVY_D, { level: -0.5, soft: 0.1 });
=======
const TANK_BASE = countershade(ORANGE, NAVY_D, { level: -0.5, soft: 0.1 });
const TANK = paint((p, n) => (n.y > 0.35 && Math.abs(Math.abs(p.x) - 0.075) < 0.009 ? CREAM : TANK_BASE));
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.02, 6), ORANGE, { bone: chassis, at: v(-0.62, 0.83, -1.0), flat: true });
=======
  b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.02, 6), ORANGE, { bone: chassis, at: v(-0.62, 0.83, -1.0), flat: true });

  // hex bollards at the pad corners
  const bollards: [number, number, number][] = [
    [0.76, 1.0, 0.36],
    [-0.76, 1.0, 0.3],
    [0.76, -1.0, 0.42],
    [0, 1.6, 0.5],
    [0, -1.6, 0.26],
  ];
  for (const [bx, bz, bh] of bollards) {
    b.part(new THREE.CylinderGeometry(0.075, 0.09, bh, 6), NAVY, { bone: chassis, at: v(bx, bh / 2, bz), flat: true });
    b.part(new THREE.CylinderGeometry(0.095, 0.095, 0.025, 6), ORANGE, { bone: chassis, at: v(bx, bh * 0.7, bz), flat: true });
    glow(b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 6), TEAL, { bone: chassis, at: v(bx, bh + 0.02, bz), flat: true }), 1.7);
  }
>>>>>>> REPLACE