1. **Head too small for the style.** The skull and beak read as a dot between the wings, and a Genshin character lives in the face. I enlarged the skull about 20% and thickened both beak halves so the head holds up against the chest ruff and wing span.
2. **Eyes lost.** The decals were 9 cm wide and flat-lit. I made them about 40% bigger, moved them slightly outward, and made them glow so the gold iris and white highlights pop.
3. **Flame plumage on the wing arms.** The leading-edge tubes read as bare red pipes, and only the feather tips burn. I added glowing flame cards along the top of each wing arm so the wings themselves look like they are burning.

<<<<<<< SEARCH
    bone: head, at: head.local({ forward: 0.035, up: 0.035 }), scale: [0.092, 0.086, 0.105],
=======
    bone: head, at: head.local({ forward: 0.035, up: 0.035 }), scale: [0.112, 0.105, 0.12],
>>>>>>> REPLACE

<<<<<<< SEARCH
    (t: number): [number, number] => [0.036 * (1 - t) + 0.003, 0.042 * (1 - t) + 0.003],
=======
    (t: number): [number, number] => [0.048 * (1 - t) + 0.003, 0.056 * (1 - t) + 0.003],
>>>>>>> REPLACE

<<<<<<< SEARCH
    (t: number): [number, number] => [0.028 * (1 - t) + 0.003, 0.022 * (1 - t) + 0.003],
=======
    (t: number): [number, number] => [0.038 * (1 - t) + 0.003, 0.03 * (1 - t) + 0.003],
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.decal(skull, EYE, {
      at: head.local({ left: s * 0.09, up: 0.04, forward: 0.07 }),
      dir: [s * 0.85, 0.05, 0.5],
      size: [0.095, 0.067],
      mirror: s > 0,
    });
=======
    glow(
      b.decal(skull, EYE, {
        at: head.local({ left: s * 0.1, up: 0.045, forward: 0.07 }),
        dir: [s * 0.85, 0.05, 0.5],
        size: [0.135, 0.095],
        mirror: s > 0,
      }),
      0.7,
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.cards(armHits, TUFT, { size: [0.06, 0.13], lean: 70, bend: 20, vary: 0.3, rng: rng(62), mirror: s < 0 });
=======
    b.cards(armHits, TUFT, { size: [0.06, 0.13], lean: 70, bend: 20, vary: 0.3, rng: rng(62), mirror: s < 0 });
    const flameHits = b.surface(arm).scatter(9, {
      rng: rng(71 + (s > 0 ? 0 : 5)), minDist: 0.1, filter: (h) => h.n.y > 0.3,
    });
    glow(
      b.cards(flameHits, [FLAME, FLAME_M], {
        size: [0.07, 0.17], lean: 60, bend: 25, flow: [0, 0.2, -1], cross: true, vary: 0.3, rng: rng(72),
      }),
      1,
    );
>>>>>>> REPLACE