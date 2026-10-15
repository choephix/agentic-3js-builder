1. **Hat band:** the dark band was a thick slab hiding the brow and the top of the face. I made it thinner so the eyes sit under a readable rim.
2. **Boots and trousers:** the boot shaft was narrower than the trouser flare, so they z-fought and gave a ragged, torn look. I widened the shaft and cuff so the trousers tuck cleanly into the boots.
3. **Eyes:** they were tiny and hard to read next to the huge nose. I enlarged the eyes and pupils a little for more character.
4. **Stray navy block:** the hammer head was poking out of the top of the pack as an unexplained blue box, with its handle buried inside. I moved the hammer onto the pack's back face with a visible handle, head and leather loops.
5. **Boiler tank:** it hung loose below the pack and its end caps stuck out past the sides. I shortened it, raised it so it tucks into the pack's underside, and moved the valve to hang beneath it.

<<<<<<< SEARCH
  { size: 256 },
);

const WRENCH
=======
  { size: 256 },
);

const WRENCH
>>>>>>> REPLACE

<<<<<<< SEARCH
  [0.115, 0], [0.15, 0], [0.15, 0.05], [0.115, 0.05],
=======
  [0.118, 0], [0.15, 0], [0.15, 0.034], [0.118, 0.034],
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.CylinderGeometry(0.068, 0.076, 0.09, 8), BOOT, { bone: ankle, at: [x, 0.13, 0.025] });
    b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.026, 8), BOOT_CUFF, { bone: ankle, at: [x, 0.185, 0.025] });
=======
    b.part(new THREE.CylinderGeometry(0.076, 0.082, 0.1, 8), BOOT, { bone: ankle, at: [x, 0.125, 0.025] });
    b.part(new THREE.CylinderGeometry(0.086, 0.086, 0.026, 8), BOOT_CUFF, { bone: ankle, at: [x, 0.185, 0.025] });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const eye = b.stick(new THREE.SphereGeometry(0.024, 8, 6), WHITE, hitAt(s * 26, 6), { embed: 0.35 });
=======
    const eye = b.stick(new THREE.SphereGeometry(0.03, 8, 6), WHITE, hitAt(s * 26, 6), { embed: 0.35 });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const pup = b.part(new THREE.SphereGeometry(0.0135, 8, 6), INK_C, {
      bone: head,
      at: offset(eye.at, gaze, 0.014),
    });
    b.part(new THREE.SphereGeometry(0.005, 5, 4), WHITE, {
      bone: head,
      at: offset(offset(pup.at, gaze, 0.0105), [0, 1, 0], 0.006),
    });
=======
    const pup = b.part(new THREE.SphereGeometry(0.017, 8, 6), INK_C, {
      bone: head,
      at: offset(eye.at, gaze, 0.018),
    });
    b.part(new THREE.SphereGeometry(0.006, 5, 4), WHITE, {
      bone: head,
      at: offset(offset(pup.at, gaze, 0.0135), [0, 1, 0], 0.007),
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.rod([-0.17, 0.48, -0.14], [-0.17, 0.74, -0.14], 0.01, WOOD, { bone: chest });
  b.part(new THREE.BoxGeometry(0.035, 0.04, 0.075), BLUED, { bone: chest, at: [-0.17, 0.755, -0.14] });
=======
  b.rod([-0.115, 0.4, -0.295], [-0.115, 0.65, -0.295], 0.011, WOOD, { bone: chest });
  b.part(new THREE.BoxGeometry(0.08, 0.036, 0.04), BLUED, { bone: chest, at: [-0.115, 0.668, -0.295] });
  for (const y of [0.45, 0.58]) {
    b.part(new THREE.BoxGeometry(0.03, 0.012, 0.024), LEATHER_D, { bone: chest, at: [-0.115, y, -0.292] });
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.3, 10), COPPER, { bone: chest, at: [0, 0.32, -0.2], dir: [1, 0, 0] });
  for (const x of [-0.09, 0.09]) {
    b.part(new THREE.TorusGeometry(0.05, 0.008, 5, 10), GILT, { bone: chest, at: [x, 0.32, -0.2], dir: [1, 0, 0], axis: "z" });
  }
  for (const x of [-0.155, 0.155]) {
    b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.02, 10), GILT, { bone: chest, at: [x, 0.32, -0.2], dir: [1, 0, 0] });
  }
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.03, 6), BRASS, { bone: chest, at: [0.05, 0.36, -0.2] });
  b.part(new THREE.TorusGeometry(0.02, 0.005, 4, 8), BRASS, { bone: chest, at: [0.05, 0.378, -0.2], dir: [0, 1, 0], axis: "z" });
=======
  b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.26, 10), COPPER, { bone: chest, at: [0, 0.37, -0.2], dir: [1, 0, 0] });
  for (const x of [-0.08, 0.08]) {
    b.part(new THREE.TorusGeometry(0.054, 0.008, 5, 10), GILT, { bone: chest, at: [x, 0.37, -0.2], dir: [1, 0, 0], axis: "z" });
  }
  for (const x of [-0.135, 0.135]) {
    b.part(new THREE.CylinderGeometry(0.056, 0.056, 0.02, 10), GILT, { bone: chest, at: [x, 0.37, -0.2], dir: [1, 0, 0] });
  }
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.035, 6), BRASS, { bone: chest, at: [0.05, 0.3, -0.2] });
  b.part(new THREE.TorusGeometry(0.02, 0.005, 4, 8), BRASS, { bone: chest, at: [0.05, 0.28, -0.2], dir: [0, 1, 0], axis: "z" });
>>>>>>> REPLACE