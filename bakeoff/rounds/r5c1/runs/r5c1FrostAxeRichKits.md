1. **Gold binding on the blade.** The head is all dark blue and ice, with no gold along the blade edges, so it misses the ornate gold-and-sapphire look of League of Legends weapons. I add gold beads along the upper and lower inner edges, running out to the horn tips.
2. **Gold frame round the rune panel.** The snowflake plate sits flat on the blade. A slightly inflated gold plate behind it makes a framed insignia and separates the panel from the crescent.
3. **Collar and rivets.** A flared gold collar under the socket, plus gold studs at the panel corners, hide the abrupt socket-to-haft join and add small-scale detail.
4. **Ribbon tails.** They read as thin grey wires from the side. I add a gold ring where they tie on and widen them, so they read as cloth.
5. **Drifting frost.** A few glowing motes around the head and blade tips add atmosphere to the silhouette and the "frost-forged" feel.

<<<<<<< SEARCH
  // rear fang, hooking upward
=======
  // gold frame behind the rune panel
  const FRAME_OUT: Pt[] = PANEL_OUT.map(([x, y]) => [0.16 + (x - 0.16) * 1.12, y * 1.16] as Pt);
  b.extrude(FRAME_OUT, { at: [0, HY, 0], thickness: 0.046, bevel: 0.006, color: GOLD });
  // rivets on the panel corners
  for (const s of [1, -1]) {
    for (const [u, v] of [
      [0.2, 0.15],
      [0.2, -0.15],
      [0.28, 0.0],
    ]) {
      b.part(new THREE.SphereGeometry(0.012, 6, 4), GOLD, { at: [s * 0.028, HY + v, u] });
    }
  }
  // gold binding along the blade's inner edges, out to the horn tips
  for (const sg of [1, -1]) {
    b.sweep(
      catmull([
        [0, HY + sg * 0.14, 0.02],
        [0, HY + sg * 0.2, 0.2],
        [0, HY + sg * 0.3, 0.34],
        [0, HY + sg * 0.38, 0.5],
      ]),
      [0.024, 0.008],
      { color: GOLD, section: { ngon: 6 }, caps: "point" },
    );
  }
  // flared gold collar under the socket
  b.lathe(
    [
      [0, 0],
      [0.034, 0],
      [0.07, 0.03],
      [0.074, 0.05],
      [0.06, 0.07],
      [0.04, 0.08],
      [0, 0.08],
    ],
    { at: [0, HY - 0.3, 0], segments: 8, color: GOLD },
  );
  // drifting frost motes
  const motes: [number, number, number][] = [
    [0.05, 0.42, 0.3],
    [-0.06, 0.34, 0.5],
    [0.04, -0.4, 0.46],
    [-0.05, -0.28, 0.58],
    [0.06, 0.5, 0.42],
    [-0.04, 0.22, -0.34],
  ];
  for (const [x, y, z] of motes) {
    glow(
      b.part(new THREE.OctahedronGeometry(0.014 + R() * 0.01, 0), "#d9f7ff", {
        at: [x, HY + y, z],
        scale: [0.7, 1.5, 0.7],
        rotation: [R() * 90, R() * 180, 0],
        flat: true,
      }),
      1.2,
    );
  }

  // rear fang, hooking upward
>>>>>>> REPLACE

<<<<<<< SEARCH
      (t) => [0.03 * (1 - 0.5 * t), 0.004],
=======
      (t) => [0.04 * (1 - 0.45 * t), 0.005],
>>>>>>> REPLACE

<<<<<<< SEARCH
  // ---------------------------------------------------------------- ribbons
=======
  // ---------------------------------------------------------------- ribbons
  b.part(new THREE.TorusGeometry(0.034, 0.007, 5, 10), GOLD, { at: [0, 1.12, 0], dir: [0, 1, 0], axis: "z" });
>>>>>>> REPLACE