Fixes, in the order the sheets show them:

1. **Rear door panel (back view):** the cargo tail door shows a hazard-stripe card and an amber reflector; the stripe card reads as a sticker and clashes with the cyan light bar. I'll keep the card but remove the duplicate tail-door rib stack that floats in front of the door, so the back reads as one clean plate. Visible in the back view.
2. **Cargo roof trim (top view):** the roof-line cyan strips and the slate roof panel overlap, so the roof edge reads as a doubled line. I'll drop the redundant slate roof panel so the cyan rim sits on the roof alone. Visible in the top view.
3. **Floating loose parts:** the small hull pieces listed as loose (hull boxes 2, 13, 15, 30, 31, 50, 51 and the hull part near the cab) sit off the body. I'll seat the hatch and loose cab-door fittings onto the cargo wall surface at the same positions so they touch. Visible in the three-quarter and low hero views.
4. **Turret sensor dome:** the cyan dome on the turret reads as a stray blob against the roof. I'll lower it onto the turret plate so it sits in the bolt ring. Visible in the three-quarter and top views.

Edits:

<<<<<<< SEARCH
  // Riveted roof panel and a cyan light strip along the cargo roof rim.
  b.part(new THREE.BoxGeometry(2.2, 0.05, 4.2), SLATE, { bone: hull, at: [0, 3.5, -0.6] });
  for (const s of [1, -1])
=======
  // Cyan light strip along the cargo roof rim (the roof panel is dropped so the rim reads cleanly).
  for (const s of [1, -1])
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Loose-part fixes: the cab slab and small hull pieces sit on the cab and cargo surfaces.
  b.part(new THREE.BoxGeometry(0.06, 0.12, 0.05), DARK, { bone: hull, at: [0, 2.85, 2.66] });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.05, 0.05, 0.4), DARK, { bone: hull, at: [s * 0.6, 3.25, 2.45] });
    b.part(new THREE.BoxGeometry(0.06, 0.14, 0.05), DARK, { bone: hull, at: [s * 1.2, 2.1, 2.6] });
  }
=======
  // Loose-part fixes: the cab fittings sit on the cab glass and the cargo wall, flush with their surfaces.
  b.part(new THREE.BoxGeometry(0.06, 0.12, 0.05), DARK, { bone: hull, at: [0, 2.85, 2.7] });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.05, 0.05, 0.4), DARK, { bone: hull, at: [s * 0.6, 3.25, 2.5] });
    b.part(new THREE.BoxGeometry(0.06, 0.14, 0.05), DARK, { bone: hull, at: [s * 1.22, 2.1, 2.6] });
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
  glow(b.part(new THREE.SphereGeometry(0.09, 10, 8), CYAN, { bone: turret, at: [0, 3.86, -0.8] }), 1.5);
=======
  glow(b.part(new THREE.SphereGeometry(0.09, 10, 8), CYAN, { bone: turret, at: [0, 3.78, -0.8] }), 1.5);
>>>>>>> REPLACE