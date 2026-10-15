1. **Tusks.** They are tiny and hidden behind the gold rings, and a troll's tusks are its identity cue. I'll make them thicker, longer and upturned, built from one shared curve (the old code built the path twice), with a bulge at the jaw root and bigger rings. The next render should show two clear ivory tusks curving up beside the nose.
2. **Head mass and brow.** The head is small against the huge torso and reads as a lizard. I'll enlarge the cranium and the muzzle, thicken the nose bridge so it reads as a big troll nose, and deepen the brow ridge so the scowl is clearer. The head should read as a troll rather than a goblin. The face decal sits on a sphere with the same enlargement, so it stays seated.

<<<<<<< SEARCH
    const tusk = b.sweep(
      bezier(L(jaw, 0.22, 0.0, s * 0.1), L(jaw, 0.31, 0.08, s * 0.16), L(jaw, 0.33, 0.16, s * 0.14)),
      [0.036, 0],
      { bone: jaw, color: IVORY, sides: 7, caps: { start: "flat", end: "point" } },
    );
    for (const t of [0.3, 0.6]) {
      const path = bezier(L(jaw, 0.22, 0.0, s * 0.1), L(jaw, 0.31, 0.08, s * 0.16), L(jaw, 0.33, 0.16, s * 0.14));
      void tusk;
      torus(path.at(t), [path.tangentAt(t).x, path.tangentAt(t).y, path.tangentAt(t).z], 0.034 * (1 - t) + 0.01, 0.009, GOLD, jaw);
    }
=======
    const tuskPath = bezier(
      L(jaw, 0.2, -0.03, s * 0.1),
      L(jaw, 0.27, 0.0, s * 0.175),
      L(jaw, 0.35, 0.13, s * 0.18),
      L(jaw, 0.36, 0.27, s * 0.15),
    );
    put(geoS(1, 6, 5), skin, jaw, L(jaw, 0.2, -0.02, s * 0.1), { scale: [0.05, 0.04, 0.05] });
    b.sweep(tuskPath, [0.05, 0], { bone: jaw, color: IVORY, sides: 7, caps: { start: "flat", end: "point" } });
    for (const t of [0.28, 0.55]) {
      const tg = tuskPath.tangentAt(t);
      torus(tuskPath.at(t), [tg.x, tg.y, tg.z], 0.048 * (1 - t) + 0.012, 0.011, GOLD, jaw);
    }
>>>>>>> REPLACE

<<<<<<< SEARCH
  put(geoS(1, 10, 8), skin, head, L(head, 0.07, 0.06), { scale: [0.15, 0.14, 0.18] });
=======
  put(geoS(1, 10, 8), skin, head, L(head, 0.07, 0.06), { scale: [0.17, 0.16, 0.19] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  put(geoS(1, 8, 6), skin, head, L(head, 0.27, -0.01), { scale: [0.115, 0.075, 0.12] }); // muzzle
  b.sweep(bezier(L(head, 0.21, 0.11), L(head, 0.35, 0.12), L(head, 0.355, -0.005)), [0.05, 0.036], {
=======
  put(geoS(1, 8, 6), skin, head, L(head, 0.27, -0.01), { scale: [0.13, 0.09, 0.13] }); // muzzle
  b.sweep(bezier(L(head, 0.21, 0.11), L(head, 0.37, 0.14), L(head, 0.385, -0.01)), [0.065, 0.05], {
>>>>>>> REPLACE

<<<<<<< SEARCH
    put(geoB(0.14, 0.035, 0.1), skin, head, L(head, 0.2, 0.128, s * 0.075), { rotation: [0, 0, 15 * s] });
=======
    put(geoB(0.15, 0.055, 0.12), skin, head, L(head, 0.2, 0.135, s * 0.075), { rotation: [0, 0, 18 * s] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const crown = put(geoS(1, 10, 8), skin, head, L(head, 0.07, 0.06), { scale: [0.152, 0.142, 0.182] });
=======
  const crown = put(geoS(1, 10, 8), skin, head, L(head, 0.07, 0.06), { scale: [0.172, 0.162, 0.192] });
>>>>>>> REPLACE