Fixes, with the view where each shows on the next sheet:

1. **Loose parts on the cargo box and the roof** (box 108/110, the cable bundle, the spring mount): they hang in air, 82 to 192 mm off the body. Seat them on the cargo face or the roof deck. Shows in the three-quarter and top views.
2. **Orange cable loop on the cab roof** (the coil at the front and back) reads as a stray hoop floating above the hatch. Drop the coil and stand the hatch lamp on the rim instead. Shows in the front and back views.
3. **Rear plate sitting proud of the bumper** with the logo half clipped by the hazard strip. Lower it onto the bumper face and keep the logo clear. Shows in the back view.
4. **Hazard-striped corner guards on the rear** poke out past the cargo box. Pull them flush with the box corner. Shows in the back and top views.
5. **Cargo face texture reads as noise** because the iron panel grid is too fine at this scale. Enlarge the panel size so the seams and rivets read as plating. Shows in the side and low hero views.

Edits:

<<<<<<< SEARCH
  // Cab roof hatch: a raised bevelled lid with a seam and a status lamp on its rim.
  bx(0.7, 0.06, 0.7, [-0.45, 2.8, 1.7], GUN);
  bx(0.56, 0.04, 0.56, [-0.45, 2.84, 1.7], DARK);
  bx(0.5, 0.04, 0.05, [-0.45, 2.9, 1.42], CHROME);
  bx(0.02, 0.02, 0.56, [-0.45, 2.9, 1.7], CHROME);
  glow(b.part(new THREE.SphereGeometry(0.08, 6, 4), AMBER, { at: [-0.45, 2.92, 1.98] }), 1.3);
=======
  // Cab roof hatch: a raised bevelled lid with a seam and a status lamp on its rim.
  bx(0.7, 0.06, 0.7, [-0.45, 2.8, 1.7], GUN);
  bx(0.56, 0.04, 0.56, [-0.45, 2.84, 1.7], DARK);
  bx(0.5, 0.04, 0.05, [-0.45, 2.9, 1.42], CHROME);
  bx(0.02, 0.02, 0.56, [-0.45, 2.9, 1.7], CHROME);
  glow(b.part(new THREE.SphereGeometry(0.08, 6, 4), AMBER, { at: [-0.45, 2.86, 1.98] }), 1.3);
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Cable bundle run along the cargo roof, clamped into the box top at each end.
  for (let i = 0; i < 3; i++) {
    b.rod([0.5 + i * 0.04, 3.06, 1.0], [0.5 + i * 0.04, 3.06, -3.0], 0.015, DARK);
  }
  for (const z of [1.0, -3.0]) bx(0.12, 0.08, 0.12, [0.5, 3.08, z], CHROME);
=======
  // Cable bundle run along the cargo roof, clamped into the box top at each end.
  for (let i = 0; i < 3; i++) {
    b.rod([0.5 + i * 0.04, 3.07, 1.0], [0.5 + i * 0.04, 3.07, -3.0], 0.015, DARK);
  }
  for (const z of [1.0, -3.0]) bx(0.12, 0.08, 0.12, [0.5, 3.06, z], CHROME);
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Rear plate sits clear of the cargo doors, so the number reads on the bumper.
=======
  // Rear plate sits clear of the cargo doors, so the number reads on the bumper.
  bx(0.5, 0.2, 0.02, [0, 1.0, -3.245], "#f2f2f2");
>>>>>>> REPLACE

<<<<<<< SEARCH
  bx(0.5, 0.2, 0.02, [0, 1.0, -3.24], "#f2f2f2");
=======
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Hazard-stripe bumper caps at the rear corners.
  for (const s of [1, -1]) bx(0.12, 0.2, 0.2, [s * 1.2, 0.8, -3.22], HAZ);
=======
  // Hazard-stripe bumper caps at the rear corners, flush with the box corner.
  for (const s of [1, -1]) bx(0.08, 0.2, 0.2, [s * 1.22, 0.8, -3.2], HAZ);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const b = createBuilder({ name: "warhound-77" });
=======
  const b = createBuilder({ name: "warhound-77" });
>>>>>>> REPLACE