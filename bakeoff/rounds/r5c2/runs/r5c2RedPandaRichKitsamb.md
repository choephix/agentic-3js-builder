1. **Vision gem was hidden.** The Dendro Vision sat inside the neck volume and never showed. I now ray-cast the front of neck and chest and seat the gold frame and glowing gem on that hit, so the Vision hangs visibly under the scarf knot.
2. **Body read as a thin weasel.** Red pandas are stocky, so I thickened the torso and the neck, which also fills out the scarf area.
3. **Head too small for the chibi look.** I enlarged the skull about 8%. The eye decals follow the skull surface, so the bigger eyes stay seated.
4. **Whiskers covered the face.** They were long, thick cream rods that hid the eyes and muzzle from the front. I made them shorter, finer and tidier so the anime eyes and the tear marks show.
5. **Dendro motes were too faint.** I made them bigger and more numerous so they read as magic atmosphere.

<<<<<<< SEARCH
    (t) => [0.092 + 0.03 * Math.sin(Math.PI * t), 0.072 + 0.03 * Math.sin(Math.PI * t)],
=======
    (t) => [0.108 + 0.04 * Math.sin(Math.PI * t), 0.088 + 0.036 * Math.sin(Math.PI * t)],
>>>>>>> REPLACE

<<<<<<< SEARCH
  const neckTube = b.sweep(neck, [0.088, 0.08, 0.075], { color: P.neck, sides: 10 });
=======
  const neckTube = b.sweep(neck, [0.104, 0.094, 0.084], { color: P.neck, sides: 10 });
>>>>>>> REPLACE

<<<<<<< SEARCH
    scale: [0.108, 0.092, 0.1],
=======
    scale: [0.117, 0.1, 0.108],
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.rod([s * 0.04, T + 0.345 + k * 0.008, 0.55], [s * 0.15, T + 0.35 + k * 0.03, 0.5], 0.0025, WHISKER, {
=======
      b.rod([s * 0.05, T + 0.345 + k * 0.008, 0.56], [s * 0.125, T + 0.35 + k * 0.026, 0.53], 0.0018, WHISKER, {
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (let i = 0; i < 12; i++) {
    const a = R() * Math.PI * 2;
=======
  for (let i = 0; i < 22; i++) {
    const a = R() * Math.PI * 2;
>>>>>>> REPLACE

<<<<<<< SEARCH
  glow(b.cards(motes, STAR, { size: 0.05, flow: [0, 0, 1], vary: 0.5, spin: 20, rng: R, bone: root }), 1.5);
=======
  glow(b.cards(motes, STAR, { size: 0.075, flow: [0, 0, 1], vary: 0.5, spin: 20, rng: R, bone: root }), 1.8);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const chest = b.surface(body).nearest([0, T + 0.21, 0.4]);
=======
  const chest =
    b.surface([neckTube, body]).ray([0, T + 0.2, 0.9], [0, 0, -1]) ?? b.surface(body).nearest([0, T + 0.21, 0.4]);
>>>>>>> REPLACE