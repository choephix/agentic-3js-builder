1. **The body reads muddy olive-brown, not fire.** The fluff cards on chest, back, neck and wing arms glow at only 0.4, so their gold-to-orange gradients sink into shadow brown. I raise them to ~1.0 so the body plumage stays bright flame colours, which the cel-shaded Genshin look needs.
2. **The head and eyes are too small for the style.** The skull is slightly bigger and the eye decals are about 20% larger, so the face reads from a distance.
3. **The beak is a stub half-buried in the skull.** I lengthen and thicken both the upper and lower beak so they stay separate and can open.
4. **The wings are thin and sparse.** The primary and secondary feathers are wider, which gives a fuller, more majestic spread without changing the rig.

<<<<<<< SEARCH
  glowCards(0.4, chestHits, [FLUFF, FLUFF, FLUFF_R], {
=======
  glowCards(1, chestHits, [FLUFF, FLUFF, FLUFF_R], {
>>>>>>> REPLACE

<<<<<<< SEARCH
  glowCards(0.4, backHits, [FLUFF_R, FLUFF_R, FLUFF], {
=======
  glowCards(1, backHits, [FLUFF_R, FLUFF_R, FLUFF], {
>>>>>>> REPLACE

<<<<<<< SEARCH
  glowCards(0.4, neckHits, [FLUFF, FLUFF_R], { size: [0.08, 0.14], lean: 55, flow: [0, -1, -0.2], bend: 15, vary: 0.2, rng: R });
=======
  glowCards(1, neckHits, [FLUFF, FLUFF_R], { size: [0.09, 0.15], lean: 55, flow: [0, -1, -0.2], bend: 15, vary: 0.2, rng: R });
>>>>>>> REPLACE

<<<<<<< SEARCH
    glowCards(0.4, armHits, [FLUFF, FLUFF_R, FLUFF], {
=======
    glowCards(1, armHits, [FLUFF, FLUFF_R, FLUFF], {
>>>>>>> REPLACE

<<<<<<< SEARCH
      add(lerp(el, wr, (i + 0.5) / 8), 88 - 20 * u, -0.01, 0.74 + 0.14 * u, 0.115, 0, 0.002 + 0.003 * i, true);
=======
      add(lerp(el, wr, (i + 0.5) / 8), 88 - 20 * u, -0.01, 0.74 + 0.14 * u, 0.155, 0, 0.002 + 0.003 * i, true);
>>>>>>> REPLACE

<<<<<<< SEARCH
      const tip = add(lerp(wr, hd, 0.12 + 0.88 * u), 62 - 54 * u, 0.04 + 0.1 * u, L, 0.1, 0, 0.012 + 0.003 * i, true);
=======
      const tip = add(lerp(wr, hd, 0.12 + 0.88 * u), 62 - 54 * u, 0.04 + 0.1 * u, L, 0.14, 0, 0.012 + 0.003 * i, true);
>>>>>>> REPLACE

<<<<<<< SEARCH
    scale: [0.165, 0.15, 0.185],
=======
    scale: [0.18, 0.165, 0.2],
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.sweep(bezier(H(0.15, 0.015, 0), H(0.3, 0.035, 0), H(0.38, 0, 0), H(0.43, -0.07, 0)), (t) => [0.054 * (1 - t) + 0.004, 0.047 * (1 - t) + 0.004], {
=======
  b.sweep(bezier(H(0.18, 0.02, 0), H(0.36, 0.045, 0), H(0.47, 0.01, 0), H(0.54, -0.09, 0)), (t) => [0.07 * (1 - t) + 0.004, 0.06 * (1 - t) + 0.004], {
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.sweep(bezier(H(0.15, -0.045, 0), H(0.25, -0.05, 0), H(0.33, -0.05, 0)), [0.04, 0.004], {
=======
  b.sweep(bezier(H(0.18, -0.06, 0), H(0.3, -0.065, 0), H(0.43, -0.065, 0)), [0.05, 0.004], {
>>>>>>> REPLACE

<<<<<<< SEARCH
    if (hit) glow(b.decal(skull, EYE, { at: hit, size: [0.17, 0.128], mirror: s < 0 }), 0.8);
=======
    if (hit) glow(b.decal(skull, EYE, { at: hit, size: [0.21, 0.157], mirror: s < 0 }), 0.9);
>>>>>>> REPLACE