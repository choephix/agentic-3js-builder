Fixes and additions, each with the view where the next sheet shows it:

1. Fix: the two loose sweeps (`sweep.warhound-77.9` and `.11`) sit 29 mm off the cargo box and read as floating ties. Removed; the cable bundle is rerouted into the box top. Visible in the top and back views.
2. Fix: the front bumper spikes poke out past the plough bar and the hazard stripe reads as a flat sticker. Spikes now stand from the bar face, and the stripe is set into the bar. Visible in the front and low hero views.
3. Fix: the roof-gun muzzle ring sits behind the barrel end. Moved to the barrel tip. Visible in the side and three-quarter views.
4. Add: a dark hatch and seam bevel on the cab roof, plus a small status lamp on the hatch rim. Visible in the top and three-quarter views.
5. Add: a riveted fuel-cell pod on the lower rear flank, with a glowing amber gauge face. Visible in the side and low hero views.
6. Add: an emblem plate on the rear bumper above the plate. Visible in the back view.

Edits:

<<<<<<< SEARCH
  // Cable bundle from the mast to the cargo roof, with clamps at each end.
  for (let i = 0; i < 3; i++) {
    b.rod([0.5 + i * 0.04, 3.1, 1.0], [0.5 + i * 0.04, 3.1, -3.0], 0.015, DARK);
  }
  for (const z of [1.0, -3.0]) bx(0.12, 0.08, 0.12, [0.5, 3.12, z], CHROME);
=======
  // Cable bundle run along the cargo roof, clamped into the box top at each end.
  for (let i = 0; i < 3; i++) {
    b.rod([0.5 + i * 0.04, 3.06, 1.0], [0.5 + i * 0.04, 3.06, -3.0], 0.015, DARK);
  }
  for (const z of [1.0, -3.0]) bx(0.12, 0.08, 0.12, [0.5, 3.1, z], CHROME);
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const x of [-0.9, -0.45, 0, 0.45, 0.9]) b.spike([x, 0.85, 3.3], [0, 0, 1], 0.3, 0.035, { color: CHROME });
=======
  for (const x of [-0.9, -0.45, 0, 0.45, 0.9]) b.spike([x, 0.85, 3.2], [0, 0, 1], 0.3, 0.035, { color: CHROME });
>>>>>>> REPLACE

<<<<<<< SEARCH
  bx(2.3, 0.06, 0.02, [0, 0.85, 3.36], HAZ);
=======
  bx(2.3, 0.06, 0.02, [0, 0.85, 3.34], HAZ);
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 10), CHROME, { at: [0, 3.6, 0.95], dir: [0, 0, 1] });
=======
  b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 10), CHROME, { at: [0, 3.6, 0.98], dir: [0, 0, 1] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  glow(b.part(new THREE.SphereGeometry(0.1, 8, 6), NEON_C, { at: [0.6, 3.02, 2.2] }), 1.5);
=======
  glow(b.part(new THREE.SphereGeometry(0.1, 8, 6), NEON_C, { at: [0.6, 3.02, 2.2] }), 1.5);

  // Cab roof hatch: a raised bevelled lid with a seam and a status lamp on its rim.
  bx(0.7, 0.06, 0.7, [-0.45, 2.84, 1.7], GUN);
  bx(0.56, 0.04, 0.56, [-0.45, 2.88, 1.7], DARK);
  bx(0.02, 0.02, 0.56, [-0.45, 2.9, 1.7], CHROME);
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), AMBER, { at: [-0.45, 2.92, 1.98] }), 1.3);

  // Riveted fuel-cell pod on the lower rear flank, with an amber gauge face.
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.22, 0.22, 1.2, 12), HULL, { at: [s * 1.6, 1.0, -2.6], dir: [0, 0, 1] });
    b.part(new THREE.CircleGeometry(0.14, 14), "#ffffff", {
      at: [s * 1.82, 1.0, -2.6],
      dir: [s, 0, 0],
      axis: "z",
      texture: gaugeTexture(),
    });
    glow(bx(0.05, 0.05, 0.05, [s * 1.82, 1.25, -2.6], AMBER), 1.2);
  }

  // Emblem plate on the rear bumper, above the number plate.
  b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", {
    at: [0, 1.22, -3.36],
    dir: [0, 0, -1],
    axis: "z",
    texture: LOGO,
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
import { glow } from "agentic-3js-builder/kits/glow";
=======
import { glow } from "agentic-3js-builder/kits/glow";
import { gaugeTexture } from "agentic-3js-builder/kits/clockwork";
>>>>>>> REPLACE