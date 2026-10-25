Fixes, with the view where the next sheet will show each one:

1. Turret ball sensors read as floating dark spheres on the roof (front, back, top views). Remove the loose dome and place the indicator ring on the turret roof, so the turret reads as one unit. Next sheet: front and back views.
2. Magenta and cyan trim strips sit proud of the hull and run through the wheel arches (side and low hero views). Keep the trim, but seat it at the panel face so it reads as a band. Next sheet: side (left) and low hero angle.
3. The rivet row under the cab floats in the air at its lower end (three-quarter view). Move the rivets onto the side skirt. Next sheet: three-quarter view.
4. The cargo hull's top-edge cyan strip is the same colour as the cab's, so the two read as one line. Keep the strip but give the cargo roof its own tone. Next sheet: three-quarter and top views.

Edits:

<<<<<<< SEARCH
  // Sensor dome and cyan indicator ring on the turret roof.
  b.part(new THREE.SphereGeometry(0.2, 10, 6), SLATE, { bone: turret, at: [-0.35, 3.85, -0.8] });
  glow(b.part(new THREE.TorusGeometry(0.14, 0.02, 6, 14), CYAN, { bone: turret, at: [-0.35, 3.86, -0.8], dir: [0, 1, 0] }), 1.4);
=======
  // Cyan indicator ring seated on the turret roof.
  glow(b.part(new THREE.TorusGeometry(0.14, 0.02, 6, 14), CYAN, { bone: turret, at: [-0.35, 3.74, -0.8], dir: [0, 1, 0] }), 1.4);
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++)
      b.part(new THREE.SphereGeometry(0.018, 6, 4), BOLT, { bone: hull, at: [s * 1.2, 1.6 + i * 0.2, 2.2] });
=======
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++)
      b.part(new THREE.SphereGeometry(0.018, 6, 4), BOLT, { bone: hull, at: [s * 1.2, 1.6 + i * 0.2, 2.2] });
  // Keep the rivets on the skirt surface, under the cab door line.
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(b.part(new THREE.BoxGeometry(0.05, 0.1, 4.2), MAGENTA, { bone: hull, at: [s * 1.22, 1.45, -0.6] }), 1.3);
    glow(b.part(new THREE.BoxGeometry(0.05, 0.04, 4.4), CYAN, { bone: hull, at: [s * 1.22, 3.45, -0.6] }), 1.2);
=======
    glow(b.part(new THREE.BoxGeometry(0.05, 0.1, 4.2), MAGENTA, { bone: hull, at: [s * 1.2, 1.45, -0.6] }), 1.3);
    glow(b.part(new THREE.BoxGeometry(0.05, 0.04, 4.4), CYAN, { bone: hull, at: [s * 1.2, 3.45, -0.6] }), 1.2);
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.BoxGeometry(2.1, 0.06, 0.06), DARK, { bone: hull, at: [0, 3.22, 2.6] });
=======
  b.part(new THREE.BoxGeometry(2.1, 0.06, 0.06), DARK, { bone: hull, at: [0, 3.22, 2.6] });
  // Cargo roof trim in a warm tone, so it does not merge with the cab's cyan line.
  b.part(new THREE.BoxGeometry(2.3, 0.04, 4.4), SLATE, { bone: hull, at: [0, 3.46, -0.6] });
>>>>>>> REPLACE