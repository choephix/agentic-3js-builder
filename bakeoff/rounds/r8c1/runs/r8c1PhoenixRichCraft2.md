1. **Eyes were tiny and hard to read.** The head is now 20% bigger (`HS` 1.2, so every head-relative part scales together) and the eye decals are about 40% larger, so the face reads from the front and three-quarter views.
2. **Wing arms looked like bare olive sticks.** Their gold belly shading read as brown against the red plumage. They now carry a red scaled paint with a dark seam, matching the body, so the arm sits inside the feathers.
3. **The tail was thin in side view.** The tail flame ribbons are about 50% wider at the centre, so the train reads as a flowing plume.
4. **The embers were sparse specks.** There are more of them (70) and they are larger, so the air around the pyre carries more fire.

<<<<<<< SEARCH
  const HS = 1.0; // head scale constant
=======
  const HS = 1.2; // head scale constant
>>>>>>> REPLACE

<<<<<<< SEARCH
    if (hit) glow(b.decal(skull, EYE, { at: hit, size: [0.058, 0.08], mirror: s > 0 }), 0.7);
=======
    if (hit) glow(b.decal(skull, EYE, { at: hit, size: [0.058 * HS * 1.15, 0.08 * HS * 1.15], mirror: s > 0 }), 0.7);
>>>>>>> REPLACE

<<<<<<< SEARCH
    const armTube = b.sweep(arm, [0.085, 0.07, 0.05, 0.032], { color: BODY });
=======
    const ARMP = scales(["#c4161c", "#d6241c", "#e0381c"], "#7c0c18", { size: 0.05, width: 0.12 });
    const armTube = b.sweep(arm, [0.085, 0.07, 0.05, 0.032], { color: ARMP });
>>>>>>> REPLACE

<<<<<<< SEARCH
      0.1 - 0.02 * a,
=======
      0.15 - 0.035 * a,
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (let i = 0; i < 44; i++) {
=======
  for (let i = 0; i < 70; i++) {
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.cards(emberFrames, EMBER, { size: 0.05, vary: 0.6, cross: true, lean: 0, flow: [0, 0, 1], rng: r, bone: hips }),
=======
    b.cards(emberFrames, EMBER, { size: 0.07, vary: 0.6, cross: true, lean: 0, flow: [0, 0, 1], rng: r, bone: hips }),
>>>>>>> REPLACE