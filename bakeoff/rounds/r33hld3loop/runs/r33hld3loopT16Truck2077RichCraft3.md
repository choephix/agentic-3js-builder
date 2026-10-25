I looked at the sheets. Issues I can see: the cargo box side panels sit in a painted-looking "rock" texture that reads as stone rather than hull (the HULL paint is too coarse and noisy); the glow strips on the cab side are fine. Loose parts: the rear corner guard boxes (118, 120) float 189 mm off the body, and the four small pods near the rear-left/right (98–101) float 83 mm off part 46. Those are the first fixes.

Numbered list:

1. Fix the floating rear corner guards (box 118 and 120): pull them onto the cargo box corner so they touch the hull. View: back and three-quarter.
2. Fix the floating small pods (98–101) at the lower rear flank: seat them on the fuel-cell pod face. View: back and low hero angle.
3. Replace the stone-like HULL paint with a finer, panelled iron plate so the cargo box reads as armour plating. View: three-quarter and side.
4. Add a rear-deck ammo rack on the cargo roof with two small glowing ammo lamps. View: top and back.
5. Add a front bumper winch housing with a glowing status lamp on the plough bar. View: front.

Edits:

<<<<<<< SEARCH
  const HULL = panelled(metal("iron", { polish: 0.25 }), { size: 0.32, rivets: 0.05 });
=======
const HULL = panelled(metal("iron", { polish: 0.25 }), { size: 0.22, rivets: 0.04 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const s of [1, -1]) {
    bx(0.06, 0.6, 0.1, [s * 1.27, 1.2, -3.12], HULL);
    bx(0.02, 0.12, 0.6, [s * 1.27, 1.2, -3.12], HULL);
=======
  for (const s of [1, -1]) {
    bx(0.06, 0.6, 0.1, [s * 1.25, 1.2, -3.12], HULL);
    bx(0.02, 0.12, 0.6, [s * 1.25, 1.2, -3.12], HULL);
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Riveted fuel-cell pod on the lower rear flank, with an amber gauge face.
  for (const s of [1, -1]) {
=======
  // Riveted fuel-cell pod on the lower rear flank, with an amber gauge face.
  for (const s of [1, -1]) {
    bx(0.1, 0.5, 0.5, [s * 1.3, 1.55, -2.6], GUN);
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Rear: status screen, rear lights, bumper with hazard stripe, plate.
=======
  // Cargo roof ammo rack with two glowing ammo lamps.
  bx(1.2, 0.12, 0.4, [0, 3.14, -2.2], GUN);
  for (const s of [1, -1]) glow(bx(0.14, 0.1, 0.14, [s * 0.35, 3.24, -2.2], AMBER), 1.2);

  // Front winch housing on the plough bar with a glowing status lamp.
  bx(0.5, 0.22, 0.2, [0, 0.9, 3.36], GUN);
  glow(bx(0.08, 0.06, 0.04, [0, 0.9, 3.48], NEON_C), 1.4);

  // Rear: status screen, rear lights, bumper with hazard stripe, plate.
>>>>>>> REPLACE