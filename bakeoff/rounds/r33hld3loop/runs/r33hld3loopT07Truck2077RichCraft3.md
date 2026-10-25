Fixes, with the view where each shows on the next sheet:

1. **Loose cargo ribs and side studs (top, back):** the box at `bx(0.3, 0.1, 0.3, ...)` roof greebles and the side studs hang off their faces. Seat the roof greebles on the cargo roof and the rear rack bars on the bumper. Views: top, back.
2. **Floating side studs and clamp pads (three-quarter, side):** the 26 side studs sit at `1.268` but the box face is at `1.25`, and the cable clamps at the roof sit at `y 3.1` above a roof at `3.04`. Move the studs onto the face and seat the clamps on the roof. Views: three-quarter, side (left).
3. **Wheel-hub cap and bolts (front, side):** bolts stand off the rim at a different radius from the hub cap. Pull them onto the hub face. Views: front, side (left).
4. **Roof hatch lamp and sensor pod (low hero angle, three-quarter):** the sensor pod and hatch lamp read as loose blocks. Sit the pod on its base plate and tie the lamp into the hatch rim. Views: low hero angle, three-quarter.
5. **Rear bumper plate over the number plate (back):** the plate and the hazard caps sit in front of the bumper with a gap. Set them flush to the bumper face. Views: back, top.
6. **Plough spikes and grille bezel (front):** the spikes pass through the bumper face. Shorten them so they start on the face. Views: front.

Edits:

<<<<<<< SEARCH
  for (let i = 0; i < 26; i++) {
      const z = -3.0 + R() * 4.0;
      const y = 1.4 + R() * 0.5;
      const pick = [GUN, AMBER, NEON_M, DARK][Math.floor(R() * 4)];
      bx(0.06, 0.1, 0.06, [s * 1.268, y, z], pick);
    }
=======
  for (let i = 0; i < 26; i++) {
      const z = -3.0 + R() * 4.0;
      const y = 1.4 + R() * 0.5;
      const pick = [GUN, AMBER, NEON_M, DARK][Math.floor(R() * 4)];
      bx(0.06, 0.1, 0.06, [s * 1.252, y, z], pick);
    }
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (let i = 0; i < 8; i++) bx(0.3, 0.1, 0.3, [-1 + R() * 2, 3.14, -3 + R() * 4], R() > 0.5 ? GUN : DARK);
=======
  for (let i = 0; i < 8; i++) bx(0.3, 0.1, 0.3, [-1 + R() * 2, 3.09, -3 + R() * 4], R() > 0.5 ? GUN : DARK);
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const z of [1.0, -3.0]) bx(0.12, 0.08, 0.12, [0.5, 3.1, z], CHROME);
=======
  for (const z of [1.0, -3.0]) bx(0.12, 0.08, 0.12, [0.5, 3.08, z], CHROME);
>>>>>>> REPLACE

<<<<<<< SEARCH
  bx(0.6, 0.16, 0.6, [0.6, 2.87, 2.2], GUN);
  bx(0.42, 0.1, 0.42, [0.6, 2.97, 2.2], DARK);
  glow(b.part(new THREE.SphereGeometry(0.14, 8, 6), NEON_C, { at: [0.6, 3.05, 2.2] }), 1.5);
=======
  bx(0.6, 0.16, 0.6, [0.6, 2.88, 2.2], GUN);
  bx(0.42, 0.1, 0.42, [0.6, 2.97, 2.2], DARK);
  glow(b.part(new THREE.SphereGeometry(0.14, 8, 6), NEON_C, { at: [0.6, 3.04, 2.2] }), 1.5);
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const s of [1, -1]) bx(0.12, 0.2, 0.2, [s * 1.2, 0.8, -3.3], HAZ);
=======
  for (const s of [1, -1]) bx(0.12, 0.2, 0.2, [s * 1.2, 0.8, -3.22], HAZ);
>>>>>>> REPLACE

<<<<<<< SEARCH
  bx(0.5, 0.2, 0.02, [0, 1.0, -3.34], "#f2f2f2");
=======
  bx(0.5, 0.2, 0.02, [0, 1.0, -3.24], "#f2f2f2");
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const x of [-0.9, -0.45, 0, 0.45, 0.9]) b.spike([x, 0.85, 3.2], [0, 0, 1], 0.3, 0.035, { color: CHROME });
=======
  for (const x of [-0.9, -0.45, 0, 0.45, 0.9]) b.spike([x, 0.85, 3.2], [0, 0, 1], 0.22, 0.035, { color: CHROME });
>>>>>>> REPLACE