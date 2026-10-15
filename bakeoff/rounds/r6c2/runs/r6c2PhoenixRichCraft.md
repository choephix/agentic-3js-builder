1. **Wings lie flat, so from the front they read as thin sticks.** I raise the wrist and hand points and tilt each feather plane with a dihedral. The feathers also rise along that angle. Wings now show their full fan from the front and three-quarter views, and the silhouette is bolder.
2. **Body fluff is drab olive-brown.** Downward-facing cards shade dark. A weak self-glow (0.4) on the chest, back, neck and arm fluff keeps it gold and fiery. This matches the glowing-plumage idea and the Genshin Pyro look.
3. **Tail ribbons are a flat horizontal fan of sticks.** The centre plumes now arc up and the outer ones droop, so the tail reads as a graceful peacock-like fan from the side.
4. **Head is small against the crest and wings.** I enlarge the skull and the eyes so the face reads as a characterful focal point.
5. **Legs are spindly under the heavy body.** I thicken them.
6. **Ember filter must follow the raised wings.** I lift its limit so embers don't spawn inside the wings.

<<<<<<< SEARCH
  const R = rng(7);
=======
  const R = rng(7);
  const glowCards = (k: number, ...a: Parameters<typeof b.cards>) => glow(b.cards(...a), k);
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.cards(chestHits, [FLUFF, FLUFF, FLUFF_R], {
=======
  glowCards(0.4, chestHits, [FLUFF, FLUFF, FLUFF_R], {
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.cards(backHits, [FLUFF_R, FLUFF_R, FLUFF], {
=======
  glowCards(0.4, backHits, [FLUFF_R, FLUFF_R, FLUFF], {
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.cards(neckHits, [FLUFF, FLUFF_R], { size: [0.08, 0.14], lean: 55, flow: [0, -1, -0.2], bend: 15, vary: 0.2, rng: R });
=======
  glowCards(0.4, neckHits, [FLUFF, FLUFF_R], { size: [0.08, 0.14], lean: 55, flow: [0, -1, -0.2], bend: 15, vary: 0.2, rng: R });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.cards(armHits, [FLUFF, FLUFF_R, FLUFF], {
=======
    glowCards(0.4, armHits, [FLUFF, FLUFF_R, FLUFF], {
>>>>>>> REPLACE

<<<<<<< SEARCH
    const nrm = UP.clone().addScaledVector(x, -UP.dot(x)).normalize();
=======
    const sgn = Math.sign(dir.x) || 1;
    const tiltUp = V(-sgn * 0.32, 1, 0);
    const nrm = tiltUp.addScaledVector(x, -tiltUp.dot(x)).normalize();
>>>>>>> REPLACE

<<<<<<< SEARCH
    const el = V(s * 0.8, 1.27, -0.02);
    const wr = V(s * 1.38, 1.42, -0.1);
    const hd = V(s * 1.86, 1.55, -0.04);
=======
    const el = V(s * 0.8, 1.4, -0.02);
    const wr = V(s * 1.38, 1.72, -0.1);
    const hd = V(s * 1.86, 2.0, -0.04);
>>>>>>> REPLACE

<<<<<<< SEARCH
      const d = V(s * Math.cos(aDeg * DEG), rise, -Math.sin(aDeg * DEG)).normalize();
=======
      const d = V(s * Math.cos(aDeg * DEG), rise + 0.3 * Math.cos(aDeg * DEG), -Math.sin(aDeg * DEG)).normalize();
>>>>>>> REPLACE

<<<<<<< SEARCH
    const P1 = P0.clone().addScaledVector(dir, ell * 0.3).add(V(0, 0.08, 0));
    const P2 = P0.clone().addScaledVector(dir, ell * 0.65).add(V(0, -0.1 - 0.015 * a, 0));
    const P3 = P0.clone().addScaledVector(dir, ell * 0.98).add(V(0, 0.12 - 0.015 * a, 0));
=======
    const P1 = P0.clone().addScaledVector(dir, ell * 0.3).add(V(0, 0.1, 0));
    const P2 = P0.clone().addScaledVector(dir, ell * 0.65).add(V(0, 0.0 - 0.03 * a, 0));
    const P3 = P0.clone().addScaledVector(dir, ell * 0.98).add(V(0, 0.3 - 0.12 * a, 0));
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(leg, [0.075, 0.055, 0.036, 0.03], { color: LEG, sides: 6 });
=======
    b.sweep(leg, [0.095, 0.068, 0.046, 0.038], { color: LEG, sides: 6 });
>>>>>>> REPLACE

<<<<<<< SEARCH
    scale: [0.14, 0.125, 0.16],
=======
    scale: [0.165, 0.15, 0.185],
>>>>>>> REPLACE

<<<<<<< SEARCH
size: [0.14, 0.105], mirror: s < 0 }), 0.8);
=======
size: [0.17, 0.128], mirror: s < 0 }), 0.8);
>>>>>>> REPLACE

<<<<<<< SEARCH
    const inWing = y > 1.0 && y < 1.95 && Math.abs(x) < 2.4 && z > -1.0 && z < 0.25;
=======
    const inWing = y > 1.0 && y < 2.5 && Math.abs(x) < 2.4 && z > -1.0 && z < 0.25;
>>>>>>> REPLACE