Fixes and additions, with the view where the next sheet shows each:

1. Loose parts: the cargo-box corner guards and the rear-bumper pieces hang off the box (back and three-quarter views). Seat them on the box faces so they touch.
2. Loose roof hatch lamp and the lower rear fuel pods (top and back views): anchor them to their bases.
3. Cargo box side neon and rivet strips (side and three-quarter views): add a rim of bevelled chrome along the roof edge so the top reads as a plate, not a bare slab.
4. Front plough bar (front and low hero views): add a centre skid plate and two tow hooks on it, so the nose reads as armour.
5. Cab roof (front and top views): add a glowing sensor lens on the hatch rim and a small antenna base, so the roof has more readable detail.
6. Rear fuel pods (back view): add a hazard collar and an amber status lamp on each pod.

Edits:

<<<<<<< SEARCH
  for (const s of [1, -1]) bx(0.08, 0.2, 0.2, [s * 1.22, 0.8, -3.2], HAZ);
=======
  for (const s of [1, -1]) bx(0.08, 0.2, 0.2, [s * 1.22, 0.8, -3.2], HAZ);
  // Rear corner guards seated flush on the box corners, tied to the bumper.
  for (const s of [1, -1]) {
    bx(0.06, 0.6, 0.1, [s * 1.27, 1.2, -3.12], HULL);
    bx(0.1, 0.1, 0.22, [s * 1.2, 0.78, -3.3], CHROME);
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
  glow(b.part(new THREE.SphereGeometry(0.08, 6, 4), AMBER, { at: [-0.45, 2.86, 1.98] }), 1.3);
=======
  glow(b.part(new THREE.SphereGeometry(0.08, 6, 4), AMBER, { at: [-0.45, 2.86, 1.98] }), 1.3);
  // Sensor lens on the hatch rim and a small antenna base beside it.
  bx(0.14, 0.05, 0.14, [-0.2, 2.84, 1.7], GUN);
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), NEON_C, { at: [-0.2, 2.9, 1.7] }), 1.4);
  b.part(new THREE.CylinderGeometry(0.02, 0.025, 0.4, 6), CHROME, { at: [-0.2, 3.04, 1.42], dir: [0, 1, 0] });
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(bx(0.05, 0.05, 0.05, [s * 1.82, 1.8, -2.6], AMBER), 1.2);
  }
=======
    glow(bx(0.05, 0.05, 0.05, [s * 1.82, 1.8, -2.6], AMBER), 1.2);
    // Hazard collar and amber status lamp seated on each pod.
    b.part(new THREE.CylinderGeometry(0.235, 0.235, 0.12, 12), HAZ, { at: [s * 1.45, 1.55, -2.45], dir: [0, 0, 1] });
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), AMBER, { at: [s * 1.45, 1.78, -2.6] }), 1.2);
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
  bx(2.3, 0.06, 0.02, [0, 0.85, 3.34], HAZ);
=======
  bx(2.3, 0.06, 0.02, [0, 0.85, 3.34], HAZ);
  // Centre skid plate and two tow hooks on the plough bar.
  bx(0.7, 0.14, 0.06, [0, 0.62, 3.36], CHROME);
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.07, 0.018, 6, 10), CHROME, { at: [s * 0.55, 0.7, 3.36], dir: [0, 0, 1] });
  }
>>>>>>> REPLACE