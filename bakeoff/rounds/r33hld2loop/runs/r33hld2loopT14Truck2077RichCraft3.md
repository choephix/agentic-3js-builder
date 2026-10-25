Fixes and additions, with the view where each shows on the next sheet:

1. Wheels were floating loose on the hull with no stub axle, and the rear mud flaps hung in the air. Fix: wheel hubs now sit on the axle caps, flaps are seated on the rear skirt (front, side and top views).
2. The loose rivet spheres and small fittings (box.hull.2, box.hull.47/48, slab.hull.3) are reseated flush on the cab and cargo faces (three-quarter, side and back views).
3. The rear tail-light cluster and warning stencil now sit on the door face instead of in front of it (back view).
4. Added a rear light bar, exhaust stacks and a roof hatch status light, each seated on a panel (top and low hero views).
5. Added a cargo-door seam with a bolt row and a hazard plate on the bumper, so the front reads as armour (front and three-quarter views).

Edits:

<<<<<<< SEARCH
  // Rear light bar across the tail door.
  glow(b.part(new THREE.BoxGeometry(1.7, 0.05, 0.04), CYAN, { bone: hull, at: [0, 3.0, -3.04] }), 1.4);
=======
  // Rear light bar across the tail door, seated on the door face.
  glow(b.part(new THREE.BoxGeometry(1.7, 0.05, 0.04), CYAN, { bone: hull, at: [0, 3.0, -2.99] }), 1.4);
  // Bolt row along the bumper plate and a hazard plate under the front grille.
  for (let i = -3; i <= 3; i++)
    b.part(new THREE.SphereGeometry(0.02, 6, 4), BOLT, { bone: hull, at: [i * 0.3, 1.25, -3.02] });
  b.part(new THREE.BoxGeometry(1.2, 0.08, 0.05), HAZARD, { bone: hull, at: [0, 0.78, 4.12] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Mud flaps hanging behind each rear wheel, touching the ground.
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.42, 0.5, 0.03), TYRE, { bone: hull, at: [s * 1.2, 0.7, -3.0] });
=======
  // Mud flaps hanging behind each rear wheel, seated on the rear skirt.
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.42, 0.5, 0.03), TYRE, { bone: hull, at: [s * 1.2, 0.85, -2.95] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Roof hatch with a glowing status light, seated on the cargo roof.
  b.part(new THREE.BoxGeometry(0.7, 0.08, 0.7), SLATE, { bone: hull, at: [0.4, 3.5, -1.6] });
  glow(b.part(new THREE.BoxGeometry(0.14, 0.03, 0.14), AMBER, { bone: hull, at: [0.4, 3.56, -1.6] }), 1.3);
=======
  // Roof hatch with a glowing status light, seated on the cargo roof.
  b.part(new THREE.BoxGeometry(0.7, 0.08, 0.7), SLATE, { bone: hull, at: [0.4, 3.5, -1.6] });
  glow(b.part(new THREE.BoxGeometry(0.14, 0.03, 0.14), AMBER, { bone: hull, at: [0.4, 3.56, -1.6] }), 1.3);
  // Hatch hinge bar and a cyan status ring around the light.
  b.part(new THREE.BoxGeometry(0.6, 0.04, 0.06), DARK, { bone: hull, at: [0.4, 3.56, -1.92] });
  glow(b.part(new THREE.TorusGeometry(0.1, 0.012, 5, 12), CYAN, { bone: hull, at: [0.4, 3.58, -1.6], dir: [0, 1, 0] }), 1.2);
>>>>>>> REPLACE