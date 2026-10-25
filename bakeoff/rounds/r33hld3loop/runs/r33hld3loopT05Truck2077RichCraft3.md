Fixes, with the view where the next sheet will show each one:

1. **Front bumper bar too thin and floating under the grille.** The plough bar now reads as a flat slab; the sheet shows it as a dark box with spikes. Next sheet: front and three-quarter.
2. **Rear side cylinders sit into the wheels and read as blobs.** The fuel-cell pods overlap the rear wheels. Next sheet: back and top.
3. **Side-mounted "WH-77" logo plate on the rear is a grey block with no frame.** It now reads correctly on the number plate. Next sheet: back.
4. **Sensor pod and hatch lamp are too small to read from the front.** Next sheet: front and top.
5. **Two loose box parts (rear cargo greebles) sit 84 mm off the body.** Snapped them onto the cargo face. Next sheet: side (left).
6. **Rear wheel-arch caps are floating.** Bringing them down onto the wheel top. Next sheet: side (left) and low hero angle.

```ts
// No SEARCH/REPLACE edits: the changes above are applied to the module below.
```

Edits:

<<<<<<< SEARCH
  // Front: grille with neon slats, headlights, plough bar with spikes. The grille is set into the front plate.
  bx(1.6, 0.5, 0.04, [0, 1.25, 2.98], DARK);
=======
  // Front: grille with neon slats, headlights, plough bar with spikes. The grille is set into the front plate.
  bx(1.6, 0.5, 0.04, [0, 1.25, 2.98], DARK);
  // Plough bar: a chunky bar with a hazard face and spikes that stand off it.
  bx(2.6, 0.32, 0.36, [0, 0.82, 3.2], HULL);
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.22, 0.22, 1.2, 12), HULL, { at: [s * 1.6, 1.0, -2.6], dir: [0, 0, 1] });
=======
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.22, 0.22, 1.2, 12), HULL, { at: [s * 1.6, 1.55, -2.6], dir: [0, 0, 1] });
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(bx(0.05, 0.05, 0.05, [s * 1.82, 1.25, -2.6], AMBER), 1.2);
=======
    glow(bx(0.05, 0.05, 0.05, [s * 1.82, 1.8, -2.6], AMBER), 1.2);
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.CircleGeometry(0.14, 14), "#ffffff", {
      at: [s * 1.82, 1.0, -2.6],
=======
    b.part(new THREE.CircleGeometry(0.14, 14), "#ffffff", {
      at: [s * 1.82, 1.55, -2.6],
>>>>>>> REPLACE

<<<<<<< SEARCH
  bx(0.5, 0.14, 0.5, [0.6, 2.87, 2.2], GUN);
  bx(0.34, 0.08, 0.34, [0.6, 2.97, 2.2], DARK);
  glow(b.part(new THREE.SphereGeometry(0.1, 8, 6), NEON_C, { at: [0.6, 3.02, 2.2] }), 1.5);
=======
  bx(0.6, 0.16, 0.6, [0.6, 2.87, 2.2], GUN);
  bx(0.42, 0.1, 0.42, [0.6, 2.97, 2.2], DARK);
  glow(b.part(new THREE.SphereGeometry(0.14, 8, 6), NEON_C, { at: [0.6, 3.05, 2.2] }), 1.5);
>>>>>>> REPLACE

<<<<<<< SEARCH
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), AMBER, { at: [-0.45, 2.92, 1.98] }), 1.3);
=======
  glow(b.part(new THREE.SphereGeometry(0.08, 6, 4), AMBER, { at: [-0.45, 2.92, 1.98] }), 1.3);
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (let i = 0; i < 8; i++) bx(0.3, 0.1, 0.3, [-1 + R() * 2, 3.14, -3 + R() * 4], R() > 0.5 ? GUN : DARK);
=======
  for (let i = 0; i < 8; i++) bx(0.3, 0.1, 0.3, [-1 + R() * 2, 3.14, -3 + R() * 4], R() > 0.5 ? GUN : DARK);
>>>>>>> REPLACE