Fixes and additions, with the view where each shows on the next sheet:

1. Loose hull bolts and rivets (box.hull.2, box.hull.30/31, sphere.hull.13–15) float off the body. Seat them on the cargo face and skirt surfaces, or drop them. Visible in: side (left), low hero angle.
2. The cargo box shows a flat, glossy top and a roof trim that reads as a dark slab. Add a riveted roof panel and a cyan light strip on the roof rim, seated on the cargo top. Visible in: top, three-quarter.
3. The turret cage has no read at the top. Add a small glowing sensor dome and a ring of bolts on the turret plate. Visible in: front, low hero angle.
4. The rear door has a bare centre. Add a warning stencil card and two rear reflectors in amber. Visible in: back.
5. Fender skirts sit under the wheels with no lip. Add a rim lip and a mud guard on each rear wheel. Visible in: side (left).

Edits:

<<<<<<< SEARCH
  // Rivet rows along the cab doors, seated on the side skirt.
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++)
      b.part(new THREE.SphereGeometry(0.018, 6, 4), BOLT, { bone: hull, at: [s * 1.2, 1.6 + i * 0.2, 2.2] });
  // Keep the rivets on the skirt surface, under the cab door line.
=======
  // Rivet rows along the cab doors, seated on the cargo side panels.
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++)
      b.stick(new THREE.SphereGeometry(0.018, 6, 4), BOLT, cargo.nearest ? cargo : b.surface(cargo).nearest([s * 1.21, 1.6 + i * 0.2, 2.2]));

  // Riveted roof panel and a cyan light strip along the cargo roof rim.
  b.part(new THREE.BoxGeometry(2.2, 0.05, 4.2), SLATE, { bone: hull, at: [0, 3.5, -0.6] });
  for (const s of [1, -1])
    glow(b.part(new THREE.BoxGeometry(0.03, 0.03, 4.3), CYAN, { bone: hull, at: [s * 1.13, 3.53, -0.6] }), 1.4);

  // Turret sensor dome and bolt ring on the turret plate.
  glow(b.part(new THREE.SphereGeometry(0.09, 10, 8), CYAN, { bone: turret, at: [0, 3.86, -0.8] }), 1.5);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.02, 6, 4), BOLT, { bone: turret, at: [Math.cos(a) * 0.38, 3.6, -0.8 + Math.sin(a) * 0.36] });
  }

  // Rear warning stencil and amber reflectors.
  b.part(new THREE.PlaneGeometry(0.8, 0.5), "#ffffff", {
    bone: hull,
    at: [0, 2.9, -2.98],
    dir: [0, 0, -1],
    axis: "z",
    texture: HAZARD_CARD,
  });
  for (const s of [1, -1])
    glow(b.part(new THREE.BoxGeometry(0.1, 0.06, 0.03), AMBER, { bone: hull, at: [s * 1.1, 1.3, -2.98] }), 1.3);

  // Rear mud guards with a lip over each rear wheel.
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.5, 0.06, 0.5), BODY, { bone: hull, at: [s * 1.2, 1.1, -2.7] });
>>>>>>> REPLACE

<<<<<<< SEARCH
const HUD = svg(
=======
const HAZARD_CARD = svg(
  `<svg viewBox="0 0 80 50" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="50" fill="#0c0d12"/>
    <path d="M0 50 L20 0 L30 0 L10 50Z M30 50 L50 0 L60 0 L40 50Z M60 50 L80 0 L80 10 L70 50Z" fill="#ffd23f"/>
  </svg>`,
  { size: 256 },
);
const HUD = svg(
>>>>>>> REPLACE