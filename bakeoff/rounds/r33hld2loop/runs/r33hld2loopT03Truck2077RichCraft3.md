Issues seen on the sheet:

1. Roof antenna array (front, three-quarter, back, top views): the flat wire ladder floats far above the roof and reads as a stray shelf. Lower it onto the roof rail height and make it a tighter, solid mast-mounted array. Visible in the front and low hero angle views.
2. Side ladder (top and front views): the thin ladder is hanging off the left side in space, not attached to the hull. Remove it.
3. Side armour rivets/posts (back and side views): the small dark studs on the right rear corner float off the body. Remove those loose posts.
4. Rear bumper plate (back view): the grey plate floats on the rear door. Seat it flush against the tail door.
5. Wheel bolt rings and hub lights (side views): kept as they are.

The next sheet will show the fixes in the front, side (left), back and top views.

Edits:

<<<<<<< SEARCH
  // Roof rails and rear ladder.
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.05, 0.05, 4.4), SLATE, { bone: hull, at: [s * 1.1, 4.6, -0.6] });
  for (let i = 0; i < 6; i++)
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 2.2, 6), BOLT, {
      bone: hull,
      at: [0, 4.6, -2.6 + i * 0.7],
      rotation: [0, 0, 90],
    });
  for (const s of [1, -1])
    for (let k = 0; k < 6; k++)
      b.part(new THREE.BoxGeometry(0.06, 0.04, 0.04), SLATE, {
        bone: hull,
        at: [s * 1.35, 0.9 + k * 0.45, -3.05],
      });
=======
  // Roof rails: two solid rails on the roof edges, seated on the hull top.
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.08, 0.08, 4.4), SLATE, { bone: hull, at: [s * 1.1, 3.4, -0.6] });
  // Rear bumper plate, flush against the tail door.
  b.part(new THREE.BoxGeometry(0.9, 0.3, 0.04), "#d4d8e0", { bone: hull, at: [0, 1.25, -2.95] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Rear bumper plate, seated on the rear face of the hull.
  b.part(new THREE.BoxGeometry(0.9, 0.3, 0.04), "#d4d8e0", { bone: hull, at: [0, 1.25, -3.2] });
=======
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.ring(frame([center[0] + s * 0.265, center[1], center[2]], [s, 0, 0]), { count: 5, radius: 0.14 }, (h) =>
=======
  b.ring(frame([center[0] + s * 0.265, center[1], center[2]], [s, 0, 0]), { count: 5, radius: 0.14 }, (h) =>
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.sweep(
    catmull([
      [-0.8, 3.45, -2.0],
      [-0.8, 4.1, -2.05],
      [-0.82, 4.6, -2.1],
    ]),
    [0.025, 0.012],
    { color: GUN, bone: hull },
  );
  glow(b.part(new THREE.SphereGeometry(0.04, 8, 6), CYAN, { bone: hull, at: [-0.82, 4.62, -2.1] }), 1.6);
=======
  // Mast with a compact solid antenna array on the roof, low enough to stay attached.
  b.sweep(
    catmull([
      [-0.8, 3.45, -2.0],
      [-0.8, 3.9, -2.05],
      [-0.82, 4.3, -2.1],
    ]),
    [0.025, 0.012],
    { color: GUN, bone: hull },
  );
  b.part(new THREE.BoxGeometry(1.5, 0.06, 0.1), SLATE, { bone: hull, at: [-0.8, 4.3, -2.1] });
  glow(b.part(new THREE.SphereGeometry(0.04, 8, 6), CYAN, { bone: hull, at: [-0.82, 4.36, -2.1] }), 1.6);
>>>>>>> REPLACE