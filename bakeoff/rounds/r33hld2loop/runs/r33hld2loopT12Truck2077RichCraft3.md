Fixes and additions, each with the view where the next sheet shows it:

1. Loose tail and cargo-door details (box.hull.2, .30, .31, .49, .50) floated 40–51 mm off their surfaces. Seat them on the body so they touch it (back view and side view).
2. Rear wheel mud guards sit on the wheel tops and hover above the tyres (side view, back view). Lower them onto the skirt line.
3. Front bumper hazard block reads as a flat stripe on the grille (front view). Keep it, but pull the grille bars forward so they clear it.
4. Added a roof-mounted searchlight on the turret ring, seen from the three-quarter and low hero views.
5. Added panel cut-lines and small status lights on the cab door, seen from the side view.
6. Added rear door hinge caps and a rear light cluster, seen from the back view.

Edits:

<<<<<<< SEARCH
  // Rear door ribs and a hazard band at the base.
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.04, 2.0, 0.04), SLATE, { bone: hull, at: [s * 0.45, 2.3, -2.96] });
  b.part(new THREE.BoxGeometry(1.4, 0.14, 0.04), HAZARD, { bone: hull, at: [0, 1.05, -2.97] });
=======
  // Rear door ribs and a hazard band at the base, seated on the tail door face.
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.04, 2.0, 0.04), SLATE, { bone: hull, at: [s * 0.45, 2.3, -2.99] });
  b.part(new THREE.BoxGeometry(1.4, 0.14, 0.04), HAZARD, { bone: hull, at: [0, 1.05, -3.0] });
  // Hinge caps on the tail door, seated flush against the door.
  for (const y of [1.6, 3.0])
    b.part(new THREE.BoxGeometry(0.12, 0.12, 0.06), SLATE, { bone: hull, at: [-1.0, y, -3.0] });
  // Rear light cluster above the tail door.
  for (const s of [1, -1])
    glow(b.part(new THREE.BoxGeometry(0.18, 0.1, 0.04), RED, { bone: hull, at: [s * 0.55, 3.1, -3.0] }), 1.3);
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Mud flaps hanging behind each rear wheel, touching the ground.
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.42, 0.5, 0.03), TYRE, { bone: hull, at: [s * 1.2, 0.7, -2.9] });
=======
  // Mud flaps hanging behind each rear wheel, touching the ground.
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.42, 0.5, 0.03), TYRE, { bone: hull, at: [s * 1.2, 0.7, -3.0] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Rear mud guards with a lip over each rear wheel.
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.5, 0.06, 0.5), BODY, { bone: hull, at: [s * 1.2, 1.1, -2.7] });
=======
  // Rear mud guards with a lip over each rear wheel, seated on the skirt line.
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.5, 0.06, 0.5), BODY, { bone: hull, at: [s * 1.2, 1.25, -2.7] });

  // Roof searchlight on the turret ring, seated on the turret plate.
  glow(b.part(new THREE.CylinderGeometry(0.1, 0.13, 0.22, 12), HOT, { bone: turret, at: [0.35, 3.82, -0.8] }), 1.5);
  b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.04, 12), SLATE, { bone: turret, at: [0.35, 3.7, -0.8] });

  // Cab door panel seams and status lights, seated on the cab side.
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.02, 1.3, 0.02), DARK, { bone: hull, at: [s * 1.52, 2.0, 2.2] });
    glow(b.part(new THREE.BoxGeometry(0.04, 0.05, 0.04), CYAN, { bone: hull, at: [s * 1.52, 2.6, 2.2] }), 1.2);
  }
>>>>>>> REPLACE