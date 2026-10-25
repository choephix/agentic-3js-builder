Fixes and additions, with the view where the next sheet shows each one:

1. Loose parts floating off the cargo box and the grille bezel (box .110/.112, part .53, .80–.82): the rear corner guards and the cargo side glow channels float a few centimetres off the hull. Seat them on the box faces at x = ±1.25 so they touch. Check in the back and three-quarter views.
2. Roof hatch and sensor pod edges: the hatch rim lamp and antenna base hang slightly off the cab roof. Lower them onto the roof deck. Check in the front and low hero views.
3. Front plough bar: the hazard face sits in front of the bar and reads as a loose plate. Recess it into the bar front. Check in the front view.
4. Cargo box flanks are a flat dark field with scattered greebles. Add a raised hazard-striped door frame and a row of bolt heads along the lower edge, seated on the box face. Check in the side and three-quarter views.
5. Roof gun: add a bolted mounting ring and two ammo feed boxes on the turret base, seated on the ring. Check in the side and low hero views.
6. Rear bumper: add two chrome tow shackles seated on the bumper face and a reflector strip on each corner guard. Check in the back view.
7. Cab side: add a riveted door-seam trim and a small amber marker lamp on each cab door pillar. Check in the side view.

Edits:

<<<<<<< SEARCH
  for (const s of [1, -1]) {
    bx(0.06, 0.6, 0.1, [s * 1.27, 1.2, -3.12], HULL);
    bx(0.1, 0.1, 0.22, [s * 1.2, 0.78, -3.3], CHROME);
  }
=======
  for (const s of [1, -1]) {
    bx(0.06, 0.6, 0.1, [s * 1.27, 1.2, -3.12], HULL);
    bx(0.1, 0.1, 0.22, [s * 1.2, 0.78, -3.3], CHROME);
    // Reflector strip seated on the corner guard, and a tow shackle on the bumper face.
    bx(0.02, 0.1, 0.04, [s * 1.3, 1.2, -3.12], AMBER);
    b.part(new THREE.TorusGeometry(0.05, 0.015, 6, 10), CHROME, { at: [s * 0.45, 0.78, -3.4], dir: [0, 0, 1] });
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
  bx(0.7, 0.06, 0.7, [-0.45, 2.8, 1.7], GUN);
=======
  bx(0.7, 0.06, 0.7, [-0.45, 2.79, 1.7], GUN);
>>>>>>> REPLACE

<<<<<<< SEARCH
  bx(0.5, 0.04, 0.05, [-0.45, 2.9, 1.42], CHROME);
=======
  bx(0.5, 0.04, 0.05, [-0.45, 2.88, 1.42], CHROME);
>>>>>>> REPLACE

<<<<<<< SEARCH
  bx(2.5, 0.22, 0.3, [0, 0.85, 3.2], DARK);
  bx(2.3, 0.06, 0.02, [0, 0.85, 3.34], HAZ);
=======
  bx(2.5, 0.22, 0.3, [0, 0.85, 3.2], DARK);
  bx(2.3, 0.06, 0.02, [0, 0.85, 3.3], HAZ);
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Cargo side glow channels: recessed behind the neon strips so they sit flush on the box face.
  for (const s of [1, -1]) {
    bx(0.02, 0.1, 4.2, [s * 1.27, 2.6, -1.0], DARK);
    bx(0.02, 0.06, 4.2, [s * 1.27, 1.55, -1.0], DARK);
  }
=======
  // Cargo side glow channels: recessed behind the neon strips so they sit flush on the box face.
  for (const s of [1, -1]) {
    bx(0.02, 0.1, 4.2, [s * 1.25, 2.6, -1.0], DARK);
    bx(0.02, 0.06, 4.2, [s * 1.25, 1.55, -1.0], DARK);
    // Raised hazard-striped door frame with bolt heads along the lower edge.
    bx(0.03, 0.12, 2.2, [s * 1.26, 0.6, -1.4], HAZ);
    for (let i = 0; i < 6; i++) bx(0.03, 0.03, 0.03, [s * 1.27, 0.95, -2.7 + i * 0.4], CHROME);
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
  bx(0.9, 0.12, 0.06, [0, 1.15, -3.38], CHROME);
=======
  bx(0.9, 0.12, 0.06, [0, 1.15, -3.38], CHROME);
  // Roof gun mounting ring and ammo feed boxes on the turret base.
  b.part(new THREE.TorusGeometry(0.58, 0.03, 6, 16), CHROME, { at: [0, 3.12, -0.6], dir: [0, 1, 0] });
  for (const s of [1, -1]) bx(0.22, 0.2, 0.3, [s * 0.6, 3.2, -0.6], GUN);
>>>>>>> REPLACE