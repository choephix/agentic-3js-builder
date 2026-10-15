1. **Side of the case:** the sides were big, flat, noisy purple walls. They now carry a gilt-framed inset panel with a glowing moon emblem on each side, so the side view reads as designed.
2. **Wood and gold:** the wood grain and the gilt paint looked like mottled carpet and dirty yellow. The grain is finer with more contrast, and the gold is calmer and brighter, which cleans up the gable roof and every trim piece.
3. **Sparkle stars:** the floating stars were single flat extrudes and turned into thin lines from the side. Each is now two crossed extrudes, so it reads from every angle.
4. **Composition:** the scroll basket hid the candelabra base in the front view. The candelabra moves to the right edge behind the basket, and the basket moves forward, so both read.
5. **Setting:** two glowing crystal clusters now flank the case back corners, which frames the dais and balances the silhouette.
6. **Wizard prop:** a pointed wizard hat with a gilt band and star buckle sits on the dais. The loose scroll moves aside to make room.
7. **Cleanup:** I removed a stray no-op call.

<<<<<<< SEARCH
  const WOOD_V = grain("#45245a", "#6c3d84", { size: 0.03, axis: "y", seed: 2 });
  const WOOD_H = grain("#45245a", "#6c3d84", { size: 0.03, axis: "x", seed: 2 });
=======
  const WOOD_V = grain("#3d1f52", "#7a4695", { size: 0.014, axis: "y", seed: 2 });
  const WOOD_H = grain("#3d1f52", "#7a4695", { size: 0.014, axis: "x", seed: 2 });
>>>>>>> REPLACE
<<<<<<< SEARCH
  const GILT = metal("gilt");
=======
  const GILT = metal("gilt", { tarnish: 0.04, polish: 0.5, size: 0.35 });
>>>>>>> REPLACE
<<<<<<< SEARCH
  for (const s of [1, -1]) box(0.06, 1.83, 0.44, WOOD_V, s * 0.72, 1.215, 0);
=======
  for (const s of [1, -1]) box(0.06, 1.83, 0.44, WOOD_V, s * 0.72, 1.215, 0);
  // side panels with glowing moon emblem
  for (const s of [1, -1]) {
    box(0.006, 1.56, 0.32, GILT, s * 0.753, 1.2, 0);
    box(0.006, 1.5, 0.28, WOOD_LT, s * 0.7565, 1.2, 0);
    glow(
      put(new THREE.PlaneGeometry(0.22, 0.22), "#ffffff", [s * 0.7599, 1.2, 0], [0, s * 90, 0], CASE, { texture: T.emblem }),
      0.8,
    );
    glow(
      put(new THREE.PlaneGeometry(0.1, 0.5), "#ffffff", [s * 0.7599, 0.78, 0], [0, s * 90, 0], CASE, { texture: T.rune }),
      0.8,
    );
    glow(
      put(new THREE.PlaneGeometry(0.1, 0.5), "#ffffff", [s * 0.7599, 1.62, 0], [0, s * 90, 0], CASE, { texture: T.eye }),
      0.8,
    );
  }
>>>>>>> REPLACE
<<<<<<< SEARCH
  b.cylinderPlaceholder?.();
=======
>>>>>>> REPLACE
<<<<<<< SEARCH
    const cx = 1.0;
=======
    const cx = 1.08;
>>>>>>> REPLACE
<<<<<<< SEARCH
    const cz = 0.25;
=======
    const cz = 0.05;
>>>>>>> REPLACE
<<<<<<< SEARCH
    const bx = 0.8;
    const bz = 0.6;
=======
    const bx = 0.7;
    const bz = 0.75;
>>>>>>> REPLACE
<<<<<<< SEARCH
  scroll(-0.45, 0.15, 0.95, 0.3, 0.03, [0, 20, 0], "#c8344a");
=======
  scroll(-0.1, 0.15, 1.05, 0.3, 0.03, [0, 20, 0], "#c8344a");
>>>>>>> REPLACE
<<<<<<< SEARCH
  for (const [mx, my, mz, ms] of motes) {
    glow(
      b.extrude(starOutline(ms), { at: [mx, my, mz], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.005, color: "#ffe9a0", bone: root }),
      1.4,
    );
  }
=======
  for (const [mx, my, mz, ms] of motes) {
    glow(
      b.extrude(starOutline(ms), { at: [mx, my, mz], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.005, color: "#ffe9a0", bone: root }),
      1.4,
    );
    glow(
      b.extrude(starOutline(ms), { at: [mx, my, mz], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.005, color: "#ffe9a0", bone: root }),
      1.4,
    );
  }

  // crystal clusters flanking the case
  const crystal = (x: number, z: number, h: number, r: number, col: string, rx: number, rz: number) =>
    glow(
      put(new THREE.OctahedronGeometry(r, 0).scale(1, h / r / 2, 1).translate(0, h / 2, 0), col, [x, 0.12, z], [rx, 0, rz], undefined, { flat: true }),
      0.9,
    );
  for (const s of [1, -1]) {
    crystal(s * 1.0, -0.65, 0.55, 0.085, CYAN, 0, 0);
    crystal(s * 0.9, -0.58, 0.32, 0.06, "#ff8fd0", 12, -s * 20);
    crystal(s * 1.1, -0.55, 0.26, 0.05, "#b9a2ff", -14, s * 16);
    crystal(s * 1.05, -0.75, 0.3, 0.05, CYAN, -10, -s * 12);
  }

  // wizard hat on the dais
  {
    const hx = -0.5;
    const hz = 0.75;
    lathe(
      [[0, 0], [0.2, 0], [0.21, 0.012], [0.18, 0.028], [0.115, 0.05], [0.095, 0.2], [0.05, 0.3], [0, 0.34]],
      [hx, 0.12, hz], NAVY, 12,
    );
    put(new THREE.TorusGeometry(0.113, 0.011, 4, 14), GILT, [hx, 0.195, hz], [90, 0, 0]);
    glow(
      b.extrude(starOutline(0.032), { at: [hx, 0.195, hz + 0.122], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.008, color: "#ffe9a0", bone: root }),
      1.3,
    );
    glow(put(new THREE.SphereGeometry(0.014, 6, 4), "#ffe9a0", [hx, 0.12 + 0.345, hz]), 1.3);
  }
>>>>>>> REPLACE