1. **Face clear of shards.** In the head close-up, the cheek ruffs lie flat and point forward across the muzzle and eye, and the forehead fringe sticks out like horizontal plates. I'm rebuilding the cheek ruffs as vertical tufts that sweep back and down along the jaw. The fringe becomes a small upward tuft. The next render should show the eye and muzzle unobstructed, with fur flowing back from the cheeks.

2. **Bigger eyes, sturdier muzzle.** The eyes are small and turned too far to the side. I'm enlarging the decal about 20% and moving it slightly toward the front. The snout is also too needle-thin, so I'm thickening it. In the front and head views the eyes should read as large amber anime eyes with the red kumadori swooshes, and the face should look less rat-like.

3. **Sturdier legs.** The legs are thin stilts under heavy shoulders and haunches. Thickening them should make the stance read as a solid fox.

4. **Cleaner tail tufts.** The tail-tip tufts use a cel shadow tone that renders as dark, near-black teal shards, which is most visible from the back. I'm giving them the lighter shadow tone already used for the tail gradient, so the back view stays luminous instead of grimy.

<<<<<<< SEARCH
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++)
      blade({
        at: H(s * 0.125, -0.02 - 0.022 * i, 0.02 - 0.03 * i),
        dir: [s * (0.9 - 0.1 * i), -0.12 - 0.18 * i, -0.4 - 0.1 * i],
        wdir: [0, 1, 0.5],
        len: 0.16 - 0.012 * i,
        w: 0.075,
=======
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++)
      blade({
        at: H(s * 0.112, -0.03 - 0.024 * i, -0.015 - 0.025 * i),
        dir: [s * 0.4, -0.25 - 0.12 * i, -0.85],
        wdir: [0, 1, 0],
        len: 0.15 - 0.012 * i,
        w: 0.07,
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: H(k * 0.04, 0.11, 0.07),
      dir: [k * 0.3, 0.35, 0.9],
      wdir: [1, 0, 0],
      len: 0.11,
      w: 0.055,
=======
      at: H(k * 0.04, 0.105, 0.03),
      dir: [k * 0.35, 0.9, 0.3],
      wdir: [1, 0, 0],
      len: 0.085,
      w: 0.05,
>>>>>>> REPLACE

<<<<<<< SEARCH
        size: [0.064, 0.088],
=======
        size: [0.078, 0.106],
>>>>>>> REPLACE

<<<<<<< SEARCH
    const eyeHit = skullSurf.around(HC).at(s * 46, 6);
=======
    const eyeHit = skullSurf.around(HC).at(s * 43, 4);
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.sweep(polyline([H(0, -0.02, 0.1), H(0, -0.05, 0.31)]), (t) => [0.075 - 0.047 * t, 0.06 - 0.033 * t], {
=======
  b.sweep(polyline([H(0, -0.02, 0.1), H(0, -0.05, 0.31)]), (t) => [0.088 - 0.05 * t, 0.07 - 0.038 * t], {
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(fore, [0.068, 0.045, 0.035, 0.032], { color: legPaint });
=======
    b.sweep(fore, [0.078, 0.054, 0.043, 0.04], { color: legPaint });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(hind, [0.09, 0.05, 0.037, 0.034], { color: legPaint });
=======
    b.sweep(hind, [0.1, 0.058, 0.044, 0.04], { color: legPaint });
>>>>>>> REPLACE

<<<<<<< SEARCH
        color: cel(tip[0]),
=======
        color: cel(tip[0], TIPS_SHADOW[i % 2]),
>>>>>>> REPLACE