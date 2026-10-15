1. **Flames read as fish.** The forked-tail flame outline looks like a goldfish. I'm replacing it with a teardrop that has one curling tip, so the spirit fire reads as fire.
2. **A hitodama blocks the fox's chest and face in the front view.** I'm moving the orbiting flame ring to start at 35° and span 35°–291°, which skips the front arc.
3. **The torii roof and plaque panel are pure black.** That flattens the shrine and loses the roof's shape, so I'm lifting them to a deep indigo.
4. **Ears are thin red sticks and the eyes are tiny.** The anime eyes and ears carry the face, so I'm enlarging both.
5. **Tail tuft cards stick out as dirty grey shards under the tails.** I'm laying them flatter and making them smaller so they read as fur layering.

<<<<<<< SEARCH
const flameShape = (k: number): Outline => [
  [0, 0],
  [0.055 * k, 0.03 * k],
  [0.07 * k, 0.09 * k],
  [0.05 * k, 0.15 * k],
  [0.03 * k, 0.2 * k],
  [0.055 * k, 0.3 * k, "sharp"],
  [0, 0.24 * k],
  [-0.03 * k, 0.2 * k],
  [-0.06 * k, 0.13 * k],
  [-0.06 * k, 0.05 * k],
];
const EAR: Outline = [
  [-0.05, 0],
  [0.05, 0],
  [0.04, 0.09],
  [0, 0.23, "sharp"],
  [-0.04, 0.09],
];
const EAR_IN: Outline = [
  [-0.03, 0.015],
  [0.03, 0.015],
  [0.022, 0.09],
  [0, 0.19, "sharp"],
  [-0.022, 0.09],
];
=======
const flameShape = (k: number): Outline => [
  [0, 0],
  [0.05 * k, 0.03 * k],
  [0.068 * k, 0.09 * k],
  [0.052 * k, 0.16 * k],
  [0.028 * k, 0.23 * k],
  [0.012 * k, 0.34 * k, "sharp"],
  [-0.02 * k, 0.22 * k],
  [-0.055 * k, 0.14 * k],
  [-0.065 * k, 0.07 * k],
  [-0.04 * k, 0.02 * k],
];
const EAR: Outline = [
  [-0.065, 0],
  [0.065, 0],
  [0.052, 0.12],
  [0.005, 0.3, "sharp"],
  [-0.05, 0.12],
];
const EAR_IN: Outline = [
  [-0.04, 0.02],
  [0.04, 0.02],
  [0.03, 0.12],
  [0.003, 0.25, "sharp"],
  [-0.03, 0.12],
];
>>>>>>> REPLACE

<<<<<<< SEARCH
const BLACKW = "#241c2e";
=======
const BLACKW = "#3a2b5a";
>>>>>>> REPLACE

<<<<<<< SEARCH
      size: [0.07, 0.036],
=======
      size: [0.095, 0.048],
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.cards(hits, TUFT, { size: [0.06, 0.11], lean: 60, bend: 20, flow: dirV, cross: true, vary: 0.3, rng: rng(60 + i) });
=======
    b.cards(hits, TUFT, { size: [0.05, 0.09], lean: 78, bend: 15, flow: dirV, cross: true, vary: 0.3, rng: rng(60 + i) });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const phi = (-110 + 27.5 * i) * DEG;
=======
    const phi = (35 + 32 * i) * DEG;
>>>>>>> REPLACE