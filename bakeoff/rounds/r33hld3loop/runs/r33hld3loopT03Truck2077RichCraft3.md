Fixes, with the view where each shows on the next sheet:

1. **Cab glass and grille**: the front view's grille sits in front of the cab face, so the cab reads flat. Recess the grille bezel and mesh so they sit inside the front plate. Visible in the front and low hero views.
2. **Roof sensor pod floats**: the pod's base sits above the cab roof, and its lens reads as a blob. Lower the pod onto the roof and give the lens a clearer housing. Visible in the three-quarter and front views.
3. **Top view nose plate reads as an odd dark rectangle**: the square hatch on the nose duplicates the grille. Keep it but reposition it toward the bumper, clear of the cab. Visible in the top view.
4. **Loose parts near the cargo box**: the three small boxes 30 mm from the cargo side and the two sweeps 29 mm from the skirt are fine as details, so they stay as they are.

Edits:

<<<<<<< SEARCH
  // Front: grille with neon slats, headlights, plough bar with spikes.
  bx(1.6, 0.5, 0.06, [0, 1.25, 3.11], DARK);
  for (let i = 0; i < 4; i++) lit(1.5, 0.02, 0.04, [0, 1.02 + i * 0.12, 3.14], NEON_C, 1.0);
=======
  // Front: grille with neon slats, headlights, plough bar with spikes. The grille is set into the front plate.
  bx(1.6, 0.5, 0.04, [0, 1.25, 2.98], DARK);
  for (let i = 0; i < 4; i++) lit(1.5, 0.02, 0.03, [0, 1.02 + i * 0.12, 3.0], NEON_C, 1.0);
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Grille bezel and mesh behind the neon slats.
  bx(1.7, 0.08, 0.06, [0, 1.52, 3.12], GUN);
  bx(1.7, 0.08, 0.06, [0, 0.98, 3.12], GUN);
  for (const s of [1, -1]) bx(0.06, 0.56, 0.06, [s * 0.85, 1.25, 3.12], GUN);
=======
  // Grille bezel and mesh behind the neon slats, recessed into the front plate.
  bx(1.7, 0.08, 0.05, [0, 1.52, 2.99], GUN);
  bx(1.7, 0.08, 0.05, [0, 0.98, 2.99], GUN);
  for (const s of [1, -1]) bx(0.06, 0.56, 0.05, [s * 0.85, 1.25, 2.99], GUN);
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Roof sensor pod with a glowing lens, seated on the cab roof.
  bx(0.5, 0.14, 0.5, [0.6, 2.9, 2.2], GUN);
  glow(b.part(new THREE.SphereGeometry(0.11, 8, 6), NEON_C, { at: [0.6, 3.02, 2.2] }), 1.5);
=======
  // Roof sensor pod seated on the cab roof (roof top is at y 2.8), with a glowing lens in a dark housing.
  bx(0.5, 0.14, 0.5, [0.6, 2.87, 2.2], GUN);
  bx(0.34, 0.08, 0.34, [0.6, 2.97, 2.2], DARK);
  glow(b.part(new THREE.SphereGeometry(0.1, 8, 6), NEON_C, { at: [0.6, 3.02, 2.2] }), 1.5);
>>>>>>> REPLACE

<<<<<<< SEARCH
  bx(0.5, 0.2, 0.02, [0, 1.0, -3.34], "#f2f2f2");
=======
  bx(0.5, 0.2, 0.02, [0, 1.0, -3.34], "#f2f2f2");
  // Rear plate sits clear of the cargo doors, so the number reads on the bumper.
>>>>>>> REPLACE