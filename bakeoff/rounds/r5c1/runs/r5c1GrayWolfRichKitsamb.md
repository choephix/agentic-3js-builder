1. **Head raised for "alert".** The head sat at shoulder height and read as a lope. I lifted the neck and head and levelled the gaze, so the wolf stands taller with its muzzle forward.
2. **Coat lightened.** The back was near-black and, with the spikes and cards, read as a porcupine. It is now a proper wolf gray. The mane spikes are fewer, shorter and slate-toned, so they act as the Warcraft accent and don't bury the body.
3. **Legs made grayer.** The muddy olive-beige legs clashed with the coat, so they now match it.
4. **Rocks fixed.** They were black, and their snow caps sat half inside the stone and read as white "eyes". The rocks are now lighter slate and the caps sit on top.
5. **Rune stone moved** back and to the side, so the wolf's head no longer hides it. I nudged one rock so it doesn't clip the stone.
6. **Eyes enlarged** so the glowing amber reads from a distance.

<<<<<<< SEARCH
const GREY = mottle(mottle("#5a5f67", "#80858c", { size: 0.045, seed: 5 }), "#3a3d44", {
=======
const GREY = mottle(mottle("#7b8189", "#a7acb2", { size: 0.045, seed: 5 }), "#50545d", {
>>>>>>> REPLACE
<<<<<<< SEARCH
const LEG = countershade(mottle("#6e695f", "#8d8777", { size: 0.05, seed: 21 }), CREAM, { level: -0.5, soft: 0.3 });
=======
const LEG = countershade(mottle("#72767d", "#979a9f", { size: 0.05, seed: 21 }), "#cbc4b0", { level: -0.5, soft: 0.3 });
>>>>>>> REPLACE
<<<<<<< SEARCH
const MOSSY = mottle(STONE, "#4f6b4a", { size: 0.18, seed: 6, contrast: 0.8 });
=======
const MOSSY = mottle(STONE, "#4f6b4a", { size: 0.18, seed: 6, contrast: 0.8 });
const ROCK = mottle("#80848e", "#5d616c", { size: 0.1, seed: 17 });
>>>>>>> REPLACE
<<<<<<< SEARCH
  const neck = b.chain("neck", catmull([P(0, 0.84, 0.5), P(0, 0.98, 0.64), P(0, 1.12, 0.78)]), {
=======
  const neck = b.chain("neck", catmull([P(0, 0.84, 0.5), P(0, 1.02, 0.62), P(0, 1.26, 0.8)]), {
>>>>>>> REPLACE
<<<<<<< SEARCH
  const HEAD = P(0, 1.12, 0.78);
=======
  const HEAD = P(0, 1.26, 0.8);
>>>>>>> REPLACE
<<<<<<< SEARCH
  const head = b.joint("head", { parent: neck, at: HEAD, dir: [0, -0.15, 1], role: "head" });
=======
  const head = b.joint("head", { parent: neck, at: HEAD, dir: [0, -0.04, 1], role: "head" });
>>>>>>> REPLACE
<<<<<<< SEARCH
      size: [0.075, 0.047],
=======
      size: [0.09, 0.056],
>>>>>>> REPLACE
<<<<<<< SEARCH
  b.along(body, 9, (at) =>
    b.spike(at, at.n.clone().addScaledVector(at.tangent, -1.1), 0.07 + 0.05 * at.t, 0.03, { color: DARKFUR }),
=======
  b.along(body, 7, (at) =>
    b.spike(at, at.n.clone().addScaledVector(at.tangent, -1.1), 0.06 + 0.04 * at.t, 0.028, { color: "#454951" }),
>>>>>>> REPLACE
<<<<<<< SEARCH
    [-1.1, -0.45, 0.2, 0.2, 0.18, 5],
=======
    [-1.15, -0.75, 0.2, 0.2, 0.18, 5],
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.part(new THREE.IcosahedronGeometry(1, 0), STONE, {
=======
    b.part(new THREE.IcosahedronGeometry(1, 0), ROCK, {
>>>>>>> REPLACE
<<<<<<< SEARCH
      at: [x, y + sy * 0.78, z], scale: [sx * 0.8, sy * 0.35, sz * 0.8], rotation: [0, ang, 0], flat: true, ...SCENE,
=======
      at: [x, y + sy * 1.05, z], scale: [sx * 0.75, sy * 0.38, sz * 0.75], rotation: [0, ang, 0], flat: true, ...SCENE,
>>>>>>> REPLACE
<<<<<<< SEARCH
  const sx0 = -1.0;
  const sz0 = 0.15;
=======
  const sx0 = -0.95;
  const sz0 = -0.2;
>>>>>>> REPLACE