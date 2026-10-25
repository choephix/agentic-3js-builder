Fixes, with the view where the next sheet shows each:

1. **Wheel-arch skirts and mud flaps float off the body**: the side armour skirts and rear mud flaps are fine, but the loose-part list flags the hull side panels; the back view shows the tail door bumper plate floating below the body. Seat the rear bumper plate on the tail door bottom. Shown in: back.
2. **Windscreen wiper and loose cab fittings**: the wipers and fittings on the glass sit in front of the cab face and read as stray sticks. Pull them onto the glass plane. Shown in: front and top.
3. **Stray lamp boxes on the cargo roof**: the roof hatch and the turret searchlight read as floating blocks on the roof. Lower the searchlight onto the turret plate and sit the hatch on the roof trim. Shown in: three-quarter and top.
4. **Rear light clusters and hazard band overlap the tail door face**: the red lights and cyan bar sit at slightly different depths and z-fight. Move them to one clear depth in front of the door. Shown in: back.
5. **Loose parts near the body**: the parts flagged as loose (hull side boxes, slab and extrude pieces) get placed on the surfaces they belong to. Shown in: side (left) and low hero angle.

Edits:

<<<<<<< SEARCH
  // Rear bumper plate, flush against the tail door.
  b.part(new THREE.BoxGeometry(0.9, 0.3, 0.04), "#d4d8e0", { bone: hull, at: [0, 1.25, -2.95] });
=======
  // Rear bumper plate, seated on the tail door bottom edge.
  b.part(new THREE.BoxGeometry(0.9, 0.3, 0.04), "#d4d8e0", { bone: hull, at: [0, 1.25, -3.0] });
>>>>>>> REPLACE

<<<<<<< SEARCH
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
=======
  // Windshield wipers lying on the glass plane.
  for (const s of [1, -1])
    b.sweep(
      catmull([
        [s * 0.3, 2.62, 2.64],
        [s * 0.35, 2.9, 2.63],
        [s * 0.25, 3.12, 2.63],
      ]),
      0.012,
      { color: DARK, bone: hull },
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
  glow(b.part(new THREE.CylinderGeometry(0.1, 0.13, 0.22, 12), HOT, { bone: turret, at: [0.35, 3.82, -0.8] }), 1.5);
  b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.04, 12), SLATE, { bone: turret, at: [0.35, 3.7, -0.8] });
=======
  glow(b.part(new THREE.CylinderGeometry(0.1, 0.13, 0.22, 12), HOT, { bone: turret, at: [0.35, 3.66, -0.8] }), 1.5);
  b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.04, 12), SLATE, { bone: turret, at: [0.35, 3.6, -0.8] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.BoxGeometry(0.7, 0.08, 0.7), SLATE, { bone: hull, at: [0.4, 3.62, -1.6] });
  glow(b.part(new THREE.BoxGeometry(0.14, 0.03, 0.14), AMBER, { bone: hull, at: [0.4, 3.72, -1.6] }), 1.3);
=======
  b.part(new THREE.BoxGeometry(0.7, 0.08, 0.7), SLATE, { bone: hull, at: [0.4, 3.5, -1.6] });
  glow(b.part(new THREE.BoxGeometry(0.14, 0.03, 0.14), AMBER, { bone: hull, at: [0.4, 3.56, -1.6] }), 1.3);
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const s of [1, -1])
    glow(b.part(new THREE.BoxGeometry(0.18, 0.1, 0.04), RED, { bone: hull, at: [s * 0.55, 3.1, -3.0] }), 1.3);
=======
  for (const s of [1, -1])
    glow(b.part(new THREE.BoxGeometry(0.18, 0.1, 0.04), RED, { bone: hull, at: [s * 0.55, 3.1, -3.04] }), 1.3);
>>>>>>> REPLACE

<<<<<<< SEARCH
  glow(b.part(new THREE.BoxGeometry(1.7, 0.05, 0.04), CYAN, { bone: hull, at: [0, 3.0, -2.95] }), 1.4);
=======
  glow(b.part(new THREE.BoxGeometry(1.7, 0.05, 0.04), CYAN, { bone: hull, at: [0, 3.0, -3.04] }), 1.4);
>>>>>>> REPLACE