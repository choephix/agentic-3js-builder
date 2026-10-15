1. **Body too small for the wingspan.** The torso read as a chicken under a huge wingspan. I enlarged the body radii, widened the neck base to match, and moved the collar ring out so it sits on the neck instead of inside it.
2. **Head and eyes too small.** The face is the focal point in the Genshin style, and the eyes were small at distance. I scaled up the skull and the eye decals.
3. **Wings read as a red pole with thin slivers.** The arm tube was bare and the feathers left gaps. I widened the tertials, secondaries and primaries so they overlap into a solid wing surface. I also added fluffy flame cards along the arm so the leading edge is feathered, not a bare red tube.

<<<<<<< SEARCH
  const body = b.sweep(spine, [0.13, 0.22, 0.27, 0.29, 0.25, 0.18], { color: BODY, sides: 10 });
  const neckTube = b.sweep(neck, [0.17, 0.12, 0.1], { color: BODY, sides: 8 });
=======
  const body = b.sweep(spine, [0.17, 0.28, 0.34, 0.36, 0.31, 0.21], { color: BODY, sides: 10 });
  const neckTube = b.sweep(neck, [0.21, 0.14, 0.11], { color: BODY, sides: 8 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const collar = b.ring(neck.at(0.35), { count: 12, radius: 0.155 });
=======
  const collar = b.ring(neck.at(0.35), { count: 12, radius: 0.2 });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(wing, [0.085, 0.065, 0.045, 0.03], { color: ARM, sides: 8 });
=======
    const armTube = b.sweep(wing, [0.085, 0.065, 0.045, 0.03], { color: ARM, sides: 8 });
    const armHits = b.surface(armTube).scatter(46, { rng: R, minDist: 0.07, filter: (h) => h.n.y > -0.3 });
    b.cards(armHits, [FLUFF, FLUFF_R, FLUFF], {
      size: [0.08, 0.17],
      lean: 60,
      flow: [0, -0.2, -1],
      bend: 15,
      vary: 0.25,
      rng: R,
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
      add(lerp(sh, el, (i + 0.5) / 5), 108 - 14 * u, -0.03, 0.62 + 0.1 * u, 0.085, 2, -0.004 * i, false);
=======
      add(lerp(sh, el, (i + 0.5) / 5), 108 - 14 * u, -0.03, 0.62 + 0.1 * u, 0.12, 2, -0.004 * i, false);
>>>>>>> REPLACE

<<<<<<< SEARCH
      add(lerp(el, wr, (i + 0.5) / 8), 88 - 20 * u, -0.01, 0.74 + 0.14 * u, 0.085, 0, 0.002 + 0.003 * i, true);
=======
      add(lerp(el, wr, (i + 0.5) / 8), 88 - 20 * u, -0.01, 0.74 + 0.14 * u, 0.115, 0, 0.002 + 0.003 * i, true);
>>>>>>> REPLACE

<<<<<<< SEARCH
0.04 + 0.1 * u, L, 0.072, 0, 0.012 + 0.003 * i, true);
=======
0.04 + 0.1 * u, L, 0.1, 0, 0.012 + 0.003 * i, true);
>>>>>>> REPLACE

<<<<<<< SEARCH
    scale: [0.115, 0.105, 0.14],
=======
    scale: [0.14, 0.125, 0.16],
>>>>>>> REPLACE

<<<<<<< SEARCH
size: [0.11, 0.082], mirror: s < 0 }), 0.8);
=======
size: [0.14, 0.105], mirror: s < 0 }), 0.8);
>>>>>>> REPLACE