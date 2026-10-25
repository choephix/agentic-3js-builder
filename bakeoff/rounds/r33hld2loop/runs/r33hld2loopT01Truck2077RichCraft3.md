Fixes, with the view where the next sheet will show each:

1. The loose rear bumper plate floats 50 mm off the hull: moved it onto the rear face (front view, back view).
2. The turret barrel rests on nothing and the turret base hides the gun joint: keep the barrel, but seat the ammo box and turret base on the roof (three-quarter, top).
3. The grille hazard slab overlaps the bumper spikes at the same depth, so they flicker: push the spikes out past the slab (front, top).
4. The cab's side glass slabs sit flush with the cab wall and z-fight: offset them outward (side left, low hero angle).

Edits:

<<<<<<< SEARCH
  // Rear bumper plate.
  b.part(new THREE.BoxGeometry(0.9, 0.3, 0.04), "#d4d8e0", { bone: hull, at: [0, 1.25, -3.27] });
=======
  // Rear bumper plate, seated on the rear face of the hull.
  b.part(new THREE.BoxGeometry(0.9, 0.3, 0.04), "#d4d8e0", { bone: hull, at: [0, 1.25, -3.2] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.BoxGeometry(0.5, 0.3, 0.4), GUN, { bone: hull, at: [0.6, 3.65, -1.4] });
=======
  b.part(new THREE.BoxGeometry(0.5, 0.3, 0.4), GUN, { bone: hull, at: [0.6, 3.6, -1.4] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const x of [-0.95, -0.5, 0, 0.5, 0.95])
    b.spike([x, 0.95, 4.25], [0, 0.2, 1], 0.35, 0.05, { color: STEEL, bone: hull });
=======
  for (const x of [-0.95, -0.5, 0, 0.5, 0.95])
    b.spike([x, 0.95, 4.42], [0, 0.2, 1], 0.35, 0.05, { color: STEEL, bone: hull });
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const s of [1, -1]) {
    b.slab(
      [
        [s * 1.17, 1.9, 2.9],
        [s * 1.17, 2.5, 2.9],
        [s * 1.17, 2.75, 2.6],
        [s * 1.17, 1.9, 2.6],
      ],
      { color: GLASS, thickness: 0.02, bone: hull },
    );
=======
  for (const s of [1, -1]) {
    b.slab(
      [
        [s * 1.2, 1.9, 2.9],
        [s * 1.2, 2.5, 2.9],
        [s * 1.2, 2.75, 2.6],
        [s * 1.2, 1.9, 2.6],
      ],
      { color: GLASS, thickness: 0.02, bone: hull },
    );
>>>>>>> REPLACE