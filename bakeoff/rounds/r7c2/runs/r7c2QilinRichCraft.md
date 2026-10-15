1. **Whiskers.** They were long straight gold rods running from the muzzle past the neck to oversized discs, reading as a handlebar in front view. They are now short, thicker, curved whiskers that droop beside the jaw and end in a small downward fan.
2. **Floating gold lines.** The trim sweeps along the back and the girth loop rose above the body as stray rods, with a vertical pole behind the shoulder. I removed both.
3. **Muddy neck.** The cream belly paint turned brown across the neck and chest. The neck is now mostly jade with the cream pushed lower, so the colour stays clean and anime-bright.
4. **Shoulder and thigh blobs.** The mass spheres were too large and read as balls stuck on the legs, so I made them smaller.

<<<<<<< SEARCH
  const neckS = b.sweep(neck, [0.2, 0.15, 0.12, 0.1], { color: COAT, sides: 8 });
=======
  const neckS = b.sweep(neck, [0.2, 0.15, 0.12, 0.1], {
    color: countershade(BACK, BELLYS, { level: -0.7, soft: 0.2 }),
    sides: 8,
  });
>>>>>>> REPLACE
<<<<<<< SEARCH
const COAT = countershade(BACK, BELLYS, { level: -0.2, soft: 0.22 });
=======
const COAT = countershade(BACK, BELLYS, { level: -0.5, soft: 0.2 });
>>>>>>> REPLACE
<<<<<<< SEARCH
        scale: front ? [0.13, 0.19, 0.18] : [0.14, 0.2, 0.2],
=======
        scale: front ? [0.1, 0.16, 0.15] : [0.11, 0.17, 0.17],
>>>>>>> REPLACE
<<<<<<< SEARCH
  for (const s of [1, -1]) {
    for (const a of [125, 35]) {
      const ang = (s * a + 360) % 360;
      safe(() => b.sweep(body.line(ang, 0.008), 0.01, { color: GOLD, sides: 5 }));
    }
  }
=======
>>>>>>> REPLACE
<<<<<<< SEARCH
  safe(() => {
    const girth = bodySkin.loop(spine.joints[2], { lift: 0.02 });
    b.sweep(girth, 0.022, { color: GOLD, sides: 6 });
    b.along(girth, 10, (at) => {
      b.part(new THREE.SphereGeometry(0.03, 6, 4), GOLD_DARK, { at });
    });
  });
=======
>>>>>>> REPLACE
<<<<<<< SEARCH
    const wh = catmull([
      hp(s * 0.08, -0.03, 0.33),
      hp(s * 0.2, -0.05, 0.3),
      hp(s * 0.34, -0.07, 0.12),
      hp(s * 0.46, -0.1, -0.1),
      hp(s * 0.52, -0.1, -0.36),
    ]);
    b.sweep(wh, [0.012, 0.003], { bone: head, color: GOLD, sides: 5, caps: { end: "point" } });
    fan(hp(s * 0.52, -0.1, -0.36), V(s * 0.35, -0.1, -1), V(0, 1, 0), 3, 0.7, 0.2, 0.045, GOLD_PAL, head);
=======
    const wh = catmull([
      hp(s * 0.07, -0.03, 0.34),
      hp(s * 0.17, -0.06, 0.3),
      hp(s * 0.24, -0.16, 0.18),
      hp(s * 0.25, -0.3, 0.06),
      hp(s * 0.2, -0.42, -0.06),
    ]);
    b.sweep(wh, [0.016, 0.004], { bone: head, color: GOLD, sides: 5, caps: { end: "point" } });
    fan(hp(s * 0.2, -0.4, -0.05), V(s * 0.1, -0.9, -0.35), V(0, 0, 1), 3, 0.7, 0.15, 0.04, GOLD_PAL, head);
>>>>>>> REPLACE