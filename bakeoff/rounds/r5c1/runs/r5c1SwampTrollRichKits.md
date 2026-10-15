1. **Brow bars.** The thick teal capsules sat across the eyes and read as a bar over the face in the three-quarter and low views. I made them thinner and raised them, slanting down toward the nose so they read as an angry lid.
2. **Bandolier.** The draped strap zigzagged across the chest like a dark squiggle. I replaced it with a clean diagonal band cut by a tilted plane through the torso, lifted clear of the pecs, with the gold studs kept.
3. **Hands.** The hands read as thin blades in the front view. I gave them a bigger palm and thicker fingers.
4. **Feet.** Feet were small under pillar legs. I widened the foot pad and thickened the toes so the troll looks planted.

<<<<<<< SEARCH
    b.capsule(H(s * 0.02, 0.16, 0.17), H(s * 0.16, 0.2, 0.1), 0.045, { color: SKIN, bone: head });
=======
    b.capsule(H(s * 0.025, 0.175, 0.2), H(s * 0.16, 0.225, 0.11), 0.03, { color: SKIN, bone: head });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const strap = bodySurf.drape(
      catmull([
        [-0.36, 2.02, 0.2],
        [-0.3, 1.8, 0.56],
        [0.0, 1.56, 0.58],
        [0.3, 1.38, 0.4],
        [0.38, 1.3, 0.1],
      ]),
      { lift: 0.015 },
    );
    b.sweep(strap, 0.028, { color: LEATHER_D });
=======
    const strap = torsoSurf.loop([0, 1.62, 0.12], { dir: [0.6, 0.8, 0.0], lift: 0.075 });
    b.sweep(strap, 0.028, { color: LEATHER_D });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(sph(8, 6), SKIN, { bone: wrist, at: pc, dir: d, scale: [0.045, 0.085, 0.075] });
=======
    b.part(sph(8, 6), SKIN, { bone: wrist, at: pc, dir: d, scale: [0.06, 0.09, 0.09] });
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.sweep(fing, [0.032, 0.022], { color: SKIN });
=======
      b.sweep(fing, [0.04, 0.028], { color: SKIN });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(sph(9, 6), SKIN, { bone: ankle, at: [s * 0.3, 0.065, 0.05], scale: [0.105, 0.07, 0.17] });
=======
    b.part(sph(9, 6), SKIN, { bone: ankle, at: [s * 0.3, 0.07, 0.06], scale: [0.14, 0.08, 0.2] });
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.sweep(toe, 0.04, { color: SKIN });
=======
      b.sweep(toe, 0.05, { color: SKIN });
>>>>>>> REPLACE