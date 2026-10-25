Fixes, with the view where each shows on the next sheet:

1. Wheels float off the chassis and the rear axle shows through the skirt: the wheels sit at y = 0.6 with radius 0.6 and the hull bottom at y ≈ 0.8, so the tyres look detached in the side view. Lower them to touch the floor and tuck them under the skirts (side and three-quarter views).
2. The cargo emblem and the rear stencil clip into surfaces: the decal and card are at the wrong offsets, so one edge pokes through the hull (side and back views).
3. Loose hub bolts and roof-trim fixes float in the air beside the wheels and the cab: sphere bolts `hull.4/5/9/10` and the two box fixes `hull.56/58` are placed off the surfaces they belong to. Seat them on the wheel faces and on the cab wall (front and top views).
4. The roof hatch and its status ring sit above the cargo roof with no base: seat the hatch on the roof plate (top and low hero angle views).
5. The mud flaps hang detached behind the rear wheels: move them onto the tail skirt (back and low hero angle views).
6. The grille/hazard bumper and the headlights sit proud of the nose: pull them onto the front face (front and three-quarter views).

Edits:

<<<<<<< SEARCH
  for (const ax of AXLES)
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const center: [number, number, number] = [s * WHEEL_X, WHEEL_Y, ax.z];
=======
  for (const ax of AXLES)
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const center: [number, number, number] = [s * WHEEL_X, 0.6, ax.z];
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.5, 0.06, 0.5), BODY, { bone: hull, at: [s * 1.2, 1.25, -2.7] });
=======
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.5, 0.06, 0.5), BODY, { bone: hull, at: [s * 1.2, 1.25, -2.62] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.42, 0.5, 0.03), TYRE, { bone: hull, at: [s * 1.2, 0.85, -2.95] });
=======
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.42, 0.5, 0.03), TYRE, { bone: hull, at: [s * 1.2, 0.85, -3.05] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.BoxGeometry(0.7, 0.08, 0.7), SLATE, { bone: hull, at: [0.4, 3.5, -1.6] });
  glow(b.part(new THREE.BoxGeometry(0.14, 0.03, 0.14), AMBER, { bone: hull, at: [0.4, 3.56, -1.6] }), 1.3);
=======
  b.part(new THREE.BoxGeometry(0.7, 0.08, 0.7), SLATE, { bone: hull, at: [0.4, 3.5, -1.6] });
  b.part(new THREE.BoxGeometry(0.5, 0.06, 0.5), DARK, { bone: hull, at: [0.4, 3.52, -1.6] });
  glow(b.part(new THREE.BoxGeometry(0.14, 0.03, 0.14), AMBER, { bone: hull, at: [0.4, 3.56, -1.6] }), 1.3);
>>>>>>> REPLACE

<<<<<<< SEARCH
  glow(b.part(new THREE.TorusGeometry(0.1, 0.012, 5, 12), CYAN, { bone: hull, at: [0.4, 3.58, -1.6], dir: [0, 1, 0] }), 1.2);
=======
  glow(b.part(new THREE.TorusGeometry(0.1, 0.012, 5, 12), CYAN, { bone: hull, at: [0.4, 3.57, -1.6], dir: [0, 1, 0] }), 1.2);
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.BoxGeometry(1.9, 0.35, 0.06), DARK, { bone: hull, at: [0, 1.42, 3.99] });
=======
  b.part(new THREE.BoxGeometry(1.9, 0.35, 0.06), DARK, { bone: hull, at: [0, 1.42, 3.97] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const s of [1, -1])
    glow(b.part(new THREE.SphereGeometry(0.12, 10, 8), HOT, { bone: hull, at: [s * 0.85, 1.45, 3.98] }), 1.8);
=======
  for (const s of [1, -1])
    glow(b.part(new THREE.SphereGeometry(0.12, 10, 8), HOT, { bone: hull, at: [s * 0.85, 1.45, 3.92] }), 1.8);
>>>>>>> REPLACE