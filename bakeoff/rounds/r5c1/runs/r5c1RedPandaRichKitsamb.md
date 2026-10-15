1. **Body too deep, legs stubby.** The torso hangs down almost to the feet, so the panda reads as a low cat. I slimmed the body radii so more leg shows and the stance looks lighter.
2. **Moss "lily pads" on the stone top.** The flat green discs read as floating pads. I replaced them with smaller, lumpy faceted moss tufts sunk into the stone's shoulder.
3. **Cheek fluff reads as fangs.** The white spikes pointed straight down beside the mouth. I swept them back along the jaw like real cheek ruff.
4. **Back fur is spiky and scale-like.** I made the cards smaller, lying flatter and curling slightly, so they read as a soft coat.
5. **Scarf tails hang stiffly in front of the chest.** I angled them back so they trail like cloth in motion.
6. **Eyes are a bit small for the Genshin face.** I enlarged them so the anime eye is the focal point.

<<<<<<< SEARCH
    (t) => [0.1 + 0.03 * Math.sin(Math.PI * t), 0.095 + 0.035 * Math.sin(Math.PI * t)],
=======
    (t) => [0.092 + 0.03 * Math.sin(Math.PI * t), 0.072 + 0.03 * Math.sin(Math.PI * t)],
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + R() * 0.3;
    const rr = 0.27 + R() * 0.03;
    b.part(new THREE.SphereGeometry(1, 7, 5), P.moss, {
      bone: root,
      at: [Math.cos(a) * rr, T - 0.005, Math.sin(a) * rr],
      scale: [0.05 + R() * 0.04, 0.025, 0.05 + R() * 0.04],
    });
  }
=======
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + R() * 0.3;
    const rr = 0.25 + R() * 0.04;
    b.part(new THREE.IcosahedronGeometry(1, 0), P.moss, {
      bone: root,
      at: [Math.cos(a) * rr, T - 0.012, Math.sin(a) * rr],
      scale: [0.03 + R() * 0.025, 0.028 + R() * 0.015, 0.03 + R() * 0.025],
      rotation: [R() * 40, R() * 180, R() * 40],
      flat: true,
    });
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
      [[s * 0.095, T + 0.35, 0.44], [s, -0.3, -0.2]],
      [[s * 0.093, T + 0.325, 0.4], [s, -0.6, -0.1]],
      [[s * 0.088, T + 0.3, 0.37], [s * 0.8, -1, -0.1]],
=======
      [[s * 0.095, T + 0.35, 0.44], [s, -0.1, -0.5]],
      [[s * 0.093, T + 0.325, 0.42], [s, -0.3, -0.6]],
      [[s * 0.088, T + 0.3, 0.4], [s * 0.7, -0.5, -0.7]],
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.decal(skin, EYE, { at: eyeHit, size: [0.05, 0.068], mirror: s > 0 });
=======
    b.decal(skin, EYE, { at: eyeHit, size: [0.056, 0.077], mirror: s > 0 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.cards(furHits, TUFT, { size: [0.04, 0.05], lean: 60, bend: 20, vary: 0.3, rng: R });
=======
  b.cards(furHits, TUFT, { size: [0.032, 0.04], lean: 75, bend: 25, vary: 0.3, rng: R });
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const s of [1, -1]) b.spike(knot, [s * 0.35, -1, 0.3], 0.12, 0.028, { color: P.scarf, sides: 6 });
=======
  for (const s of [1, -1]) b.spike(knot, [s * 0.4, -0.8, -0.5], 0.14, 0.028, { color: P.scarf, sides: 6 });
>>>>>>> REPLACE