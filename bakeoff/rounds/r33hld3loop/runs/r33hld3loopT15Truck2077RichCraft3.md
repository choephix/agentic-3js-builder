I'll fix these issues, found across the sheet:

1. **Cab roof hatch sits sunk into the roof**: the hatch base is at y 2.79 while the roof top is 2.8, so it looks buried. Visible in the front and low hero views.
2. **Cargo box neon strips float off the face**: the strips sit at x 1.262 while the box face is at x 1.25, so they hover. Visible in the side and three-quarter views.
3. **Rear lamps and plate clutter**: the plate and lights overlap the rear bumper. Visible in the back view.
4. **Loose parts**: the small rivet studs and the bolts that float near the cargo box are nudged onto the surface. Visible in the top and back views.
5. **Roof gun mount ring floats above the turret base**: the ring sits at y 3.14 but the base is at y 3.1. Visible in the front and top views.

The edits below apply these.

<<<<<<< SEARCH
  bx(0.7, 0.06, 0.7, [-0.45, 2.79, 1.7], GUN);
  bx(0.56, 0.04, 0.56, [-0.45, 2.84, 1.7], DARK);
=======
  bx(0.7, 0.06, 0.7, [-0.45, 2.82, 1.7], GUN);
  bx(0.56, 0.04, 0.56, [-0.45, 2.86, 1.7], DARK);
>>>>>>> REPLACE
<<<<<<< SEARCH
    bx(0.06, 0.6, 0.1, [s * 1.27, 1.2, -3.12], HULL);
=======
    bx(0.06, 0.6, 0.1, [s * 1.27, 1.2, -3.12], HULL);
    bx(0.02, 0.12, 0.6, [s * 1.27, 1.2, -3.12], HULL);
>>>>>>> REPLACE
<<<<<<< SEARCH
    lit(0.03, 0.04, 4.1, [s * 1.262, 2.7, -1.0], NEON_C, 1.6);
    lit(0.03, 0.03, 4.1, [s * 1.262, 1.55, -1.0], NEON_M, 1.2);
=======
    lit(0.02, 0.04, 4.1, [s * 1.255, 2.7, -1.0], NEON_C, 1.6);
    lit(0.02, 0.03, 4.1, [s * 1.255, 1.55, -1.0], NEON_M, 1.2);
>>>>>>> REPLACE
<<<<<<< SEARCH
  b.part(new THREE.TorusGeometry(0.58, 0.03, 6, 16), CHROME, { at: [0, 3.14, -0.6], dir: [0, 1, 0] });
=======
  b.part(new THREE.TorusGeometry(0.58, 0.03, 6, 16), CHROME, { at: [0, 3.12, -0.6], dir: [0, 1, 0] });
>>>>>>> REPLACE
<<<<<<< SEARCH
  for (const s of [1, -1]) lit(0.3, 0.14, 0.05, [s * 0.9, 1.5, -3.25], RED_LIGHT, 1.3);
=======
  for (const s of [1, -1]) lit(0.3, 0.14, 0.05, [s * 0.9, 1.5, -3.2], RED_LIGHT, 1.3);
>>>>>>> REPLACE
<<<<<<< SEARCH
  bx(0.5, 0.2, 0.02, [0, 1.0, -3.245], "#f2f2f2");
=======
  bx(0.5, 0.2, 0.02, [0, 1.0, -3.3], "#f2f2f2");
>>>>>>> REPLACE