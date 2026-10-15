1. **Spike trap now reads as a trap.** The spikes were short and hidden behind the lying barrel, so I made them taller (0.26–0.46 m) with slimmer cones. The helmet-bearing spike is now 0.55 m tall and visibly pierces the helmet, which tells the story from the front view.
2. **Lying barrel moved off the pit's sightline.** It now sits further back-right at (1.05, 0.5), clear of the pit's right side, and its poison puddles moved with it. The next three-quarter render should show most of the spike field.
3. **Burnt torch shifted** to (0.58, 0.93) so it no longer overlaps the barrel's puddle or the purple rune.
4. **Wall halos behind the torches shrunk and dimmed.** In the three-quarter view they looked like detached orange squares floating beside the flames. They should now read as a soft glow on the wall.

<<<<<<< SEARCH
      const h = tall ? 0.36 : 0.18 + 0.14 * hsh(i, j, 21);
      put(new THREE.ConeGeometry(0.052, h, 4), (i + j) % 3 === 0 ? SPIKEB : SPIKEP, [sx, 0.07 + h / 2 - 0.005, sz], {
=======
      const h = tall ? 0.55 : 0.26 + 0.2 * hsh(i, j, 21);
      put(new THREE.ConeGeometry(0.046, h, 4), (i + j) % 3 === 0 ? SPIKEB : SPIKEP, [sx, 0.07 + h / 2 - 0.005, sz], {
>>>>>>> REPLACE
<<<<<<< SEARCH
barrel(1.0, 0.4, "lying");
=======
barrel(1.05, 0.5, "lying");
>>>>>>> REPLACE
<<<<<<< SEARCH
      glow(put(new THREE.CylinderGeometry(0.15, 0.15, 0.008, 8), "#44d65e", [x, FY + 0.004, z + 0.42], { flat: true }), 0.7);
=======
      glow(put(new THREE.CylinderGeometry(0.15, 0.15, 0.008, 8), "#44d65e", [x, FY + 0.004, z + 0.36], { flat: true }), 0.7);
>>>>>>> REPLACE
<<<<<<< SEARCH
      glow(put(new THREE.CylinderGeometry(0.09, 0.09, 0.008, 8), "#44d65e", [x + 0.12, FY + 0.004, z + 0.48], { flat: true }), 0.7);
=======
      glow(put(new THREE.CylinderGeometry(0.09, 0.09, 0.008, 8), "#44d65e", [x + 0.12, FY + 0.004, z + 0.4], { flat: true }), 0.7);
>>>>>>> REPLACE
<<<<<<< SEARCH
    const [bx, bz] = [0.62, 0.9];
=======
    const [bx, bz] = [0.58, 0.93];
>>>>>>> REPLACE
<<<<<<< SEARCH
    glow(plane(0.42, 0.42, "#ffffff", [x, fb.y + 0.1, -0.79], { texture: HALO }), 0.8);
=======
    glow(plane(0.3, 0.3, "#ffffff", [x, fb.y + 0.08, -0.797], { texture: HALO }), 0.5);
>>>>>>> REPLACE