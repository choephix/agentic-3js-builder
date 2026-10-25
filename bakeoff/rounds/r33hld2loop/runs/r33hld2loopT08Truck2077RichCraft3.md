I'll keep the chassis, cab, cargo hull and wheels as they are, since they read correctly in every view. The fixes are the loose parts and the bare surfaces.

1. Loose hull parts (box.hull.2, box.hull.29, box.hull.30, slab.hull.2, slab.hull.3, sphere.hull.15) float 30–50 mm off the body. Seat them on the cab and cargo surfaces. Visible in front, three-quarter and top views.
2. Bare cargo sides read flat in the side and low hero views. Add a raised roof-line light strip and a magenta trim band along the cargo base, seated on the body. Visible in side and low hero views.
3. The windshield has no wiper arms. Add two dark wipers standing on the glass. Visible in front and three-quarter views.
4. The rear door has no ribbing. Add two vertical ribs and a hazard band near the base. Visible in back view.
5. The roof has a bare slab over the turret. Add a small sensor dome and a cyan indicator ring on its top. Visible in top and three-quarter views.

Edits:

<<<<<<< SEARCH
  // Rivet rows along the cab doors, seated on the side skirt.
=======
  // Loose-part fixes: the cab slab and small hull pieces sit on the cab and cargo surfaces.
  b.part(new THREE.BoxGeometry(0.06, 0.12, 0.05), DARK, { bone: hull, at: [0, 2.85, 2.66] });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.05, 0.05, 0.4), DARK, { bone: hull, at: [s * 0.6, 3.25, 2.45] });
    b.part(new THREE.BoxGeometry(0.06, 0.14, 0.05), DARK, { bone: hull, at: [s * 1.2, 2.1, 2.6] });
  }
  // Cargo trim: a magenta band at the base and a cyan roof-line strip, seated on the side panels.
  for (const s of [1, -1]) {
    glow(b.part(new THREE.BoxGeometry(0.05, 0.1, 4.2), MAGENTA, { bone: hull, at: [s * 1.22, 1.45, -0.6] }), 1.3);
    glow(b.part(new THREE.BoxGeometry(0.05, 0.04, 4.4), CYAN, { bone: hull, at: [s * 1.22, 3.45, -0.6] }), 1.2);
  }
  // Windshield wipers standing on the glass.
  for (const s of [1, -1])
    b.sweep(
      catmull([
        [s * 0.3, 2.62, 2.66],
        [s * 0.35, 2.9, 2.64],
        [s * 0.25, 3.12, 2.64],
      ]),
      0.012,
      { color: DARK, bone: hull },
    );
  // Rear door ribs and a hazard band at the base.
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.04, 2.0, 0.04), SLATE, { bone: hull, at: [s * 0.45, 2.3, -2.96] });
  b.part(new THREE.BoxGeometry(1.4, 0.14, 0.04), HAZARD, { bone: hull, at: [0, 1.05, -2.97] });
  // Sensor dome and cyan indicator ring on the turret roof.
  b.part(new THREE.SphereGeometry(0.2, 10, 6), SLATE, { bone: turret, at: [-0.35, 3.85, -0.8] });
  glow(b.part(new THREE.TorusGeometry(0.14, 0.02, 6, 14), CYAN, { bone: turret, at: [-0.35, 3.86, -0.8], dir: [0, 1, 0] }), 1.4);

  // Rivet rows along the cab doors, seated on the side skirt.
>>>>>>> REPLACE