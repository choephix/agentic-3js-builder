I'll keep the strong silhouette, riveted cargo box, roof turret, neon accents and emblems that already read well. Fixes target the front plough bar and the cargo-side pods, which sit loose or clip, and the cab-roof hatch, which reads as a floating block.

1. Front plough bar: the cladding slab reads as a floating box below the grille. Seat it on the chassis rails and tie it to the nose. View: front, three-quarter.
2. Side fuel pods: the cylinders hang off the cargo flank with a gap. Bring them flush against the box and add mounting collars. View: back, three-quarter.
3. Cab roof hatch: the lid floats above the roof. Lower it onto the roof plate and add a handle bar. View: side (left), low hero angle.
4. Roof turret and mast: add a bolted base ring and a cable harness that runs into the turret. View: three-quarter, top.
5. Add a cargo-side cable run and a rear light guard so the rear reads as finished. View: back, side (left).

<<<<<<< SEARCH
  // Plough bar: a chunky bar with a hazard face and spikes that stand off it.
  bx(2.6, 0.32, 0.36, [0, 0.82, 3.2], HULL);
=======
  // Plough bar: a chunky bar with a hazard face and spikes that stand off it.
  bx(2.6, 0.32, 0.36, [0, 0.82, 3.2], HULL);
  for (const s of [1, -1]) bx(0.14, 0.5, 0.5, [s * 1.2, 0.75, 3.0], DARK);
  bx(2.7, 0.08, 0.42, [0, 0.64, 3.18], GUN);
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.CylinderGeometry(0.22, 0.22, 1.2, 12), HULL, { at: [s * 1.6, 1.55, -2.6], dir: [0, 0, 1] });
=======
    b.part(new THREE.CylinderGeometry(0.22, 0.22, 1.2, 12), HULL, { at: [s * 1.45, 1.55, -2.6], dir: [0, 0, 1] });
    for (const z of [-2.2, -3.0]) bx(0.06, 0.5, 0.06, [s * 1.45, 1.55, z], CHROME);
    bx(0.1, 0.42, 0.42, [s * 1.3, 1.55, -2.6], GUN);
>>>>>>> REPLACE

<<<<<<< SEARCH
  bx(0.7, 0.06, 0.7, [-0.45, 2.84, 1.7], GUN);
  bx(0.56, 0.04, 0.56, [-0.45, 2.88, 1.7], DARK);
=======
  bx(0.7, 0.06, 0.7, [-0.45, 2.8, 1.7], GUN);
  bx(0.56, 0.04, 0.56, [-0.45, 2.84, 1.7], DARK);
  bx(0.5, 0.04, 0.05, [-0.45, 2.9, 1.42], CHROME);
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.14, 8), DARK, { at: [0, 3.6, 0.98], dir: [0, 0, 1] });
=======
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.14, 8), DARK, { at: [0, 3.6, 0.98], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.62, 0.62, 0.06, 16), GUN, { at: [0, 3.1, -0.6], dir: [0, 1, 0] });
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI * 2) / 6;
    bx(0.05, 0.05, 0.05, [0.5 * Math.cos(a), 3.14, -0.6 + 0.5 * Math.sin(a)], CHROME);
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const s of [1, -1]) lit(0.3, 0.14, 0.05, [s * 0.9, 1.5, -3.25], RED_LIGHT, 1.3);
=======
  for (const s of [1, -1]) lit(0.3, 0.14, 0.05, [s * 0.9, 1.5, -3.25], RED_LIGHT, 1.3);
  for (const s of [1, -1]) for (let i = 0; i < 3; i++) bx(0.03, 0.03, 0.03, [s * (0.75 + i * 0.12), 1.7, -3.3], CHROME);
  bx(1.4, 0.03, 0.03, [0, 1.75, -3.3], CHROME);
>>>>>>> REPLACE