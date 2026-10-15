1. **Tails:** the tuft cards on the nine tails read as dark grey shards, and the gold band loop wandered across neighbouring tails like a stray squiggle. I removed both and replaced the band with a clean gold ring seated on each tail.
2. **Proportions:** the head was small and the muzzle needle-thin for the anime look, and the torso and legs were skinny. I enlarged the head scale, thickened the muzzle, and widened the body and forelegs.
3. **Front view:** a foxfire orb sat right in front of the fox's legs and hid them. I moved it to the left side.
4. **Foxfire:** the white orb bases were bigger than the flames above them. I shrank the orbs and enlarged the flames, and made the tail-tip flames larger so the spirit fire is a stronger focal point.

<<<<<<< SEARCH
const H = 1.15; // top of head scale
=======
const H = 1.15; // top of head scale
>>>>>>> REPLACE

Correction: the real line is `const H = 1.15; // head scale`, so the block below uses that.

<<<<<<< SEARCH
const H = 1.15; // head scale
=======
const H = 1.28; // head scale
>>>>>>> REPLACE

<<<<<<< SEARCH
    (t) => [0.115 + 0.03 * Math.sin(Math.PI * t), 0.13 + 0.045 * t + 0.02 * Math.sin(Math.PI * t)],
=======
    (t) => [0.135 + 0.035 * Math.sin(Math.PI * t), 0.15 + 0.045 * t + 0.025 * Math.sin(Math.PI * t)],
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.sweep([hp(0.1, -0.045), hp(0.26, -0.065)], (t) => [(0.06 - 0.032 * t) * H, (0.048 - 0.024 * t) * H], {
=======
  b.sweep([hp(0.1, -0.045), hp(0.26, -0.065)], (t) => [(0.07 - 0.036 * t) * H, (0.056 - 0.028 * t) * H], {
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(fl, [0.056, 0.042, 0.032], { color: SOCKS });
=======
    b.sweep(fl, [0.066, 0.05, 0.038], { color: SOCKS });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const surf = b.surface(ts);
    // gold band
    const band = surf.loop(chain.at(0.3), { lift: 0.006 });
    b.sweep(band, 0.011, { color: GOLD, sides: 5 });
    // fur tufts
    b.cards(surf.scatter(15, { rng: rng(40 + i), minDist: 0.07, filter: (h) => h.n.y > -0.5 }), TUFTTEX, {
      size: [0.07, 0.13],
      lean: 58,
      bend: 24,
      vary: 0.3,
      rng: R,
      color: tipPaint,
    });
=======
    void ts;
    // gold ring seated on the tail
    const bandRing = b.ring(chain.at(0.3), { count: 10, radius: 0.092 * scale });
    b.sweep(catmull(bandRing.items, { closed: true }), 0.008, { color: GOLD, sides: 5, bone: chain.joints[1] });
>>>>>>> REPLACE

<<<<<<< SEARCH
    flame([tip.x, tip.y - 0.02, tip.z], [0.15, 0.3], [FLAME_A, FLAME_B], lastJoint, 1.5);
    flame([tip.x, tip.y - 0.02, tip.z], [0.1, 0.18], [FLAME_B, FLAME_A], lastJoint, 1.3);
=======
    flame([tip.x, tip.y - 0.02, tip.z], [0.2, 0.4], [FLAME_A, FLAME_B], lastJoint, 1.6);
    flame([tip.x, tip.y - 0.02, tip.z], [0.12, 0.24], [FLAME_B, FLAME_A], lastJoint, 1.4);
>>>>>>> REPLACE

<<<<<<< SEARCH
  [0.1, 0.35, 0.92],
=======
  [-0.95, 0.4, 0.5],
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(b.part(new THREE.IcosahedronGeometry(0.04, 1), "#d9fbff", { bone: root, at: p, flat: true }), 1.7);
    flame([p[0], p[1] + 0.01, p[2]], [0.15, 0.27], [FLAME_A, FLAME_B], root, 1.5);
=======
    glow(b.part(new THREE.IcosahedronGeometry(0.028, 1), "#d9fbff", { bone: root, at: p, flat: true }), 1.7);
    flame([p[0], p[1] + 0.01, p[2]], [0.19, 0.34], [FLAME_A, FLAME_B], root, 1.5);
>>>>>>> REPLACE