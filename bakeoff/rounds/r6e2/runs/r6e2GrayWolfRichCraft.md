1. **Identity and form (head close-up, front view).** The cues are a long-snouted wolf head, tall upright ears with a thick ruff, and a gray coat with a cream underside. The ears and the gray-cream coat read well. The muzzle is the weak point: it is a thin greyhound-like beak, the cream lower jaw hangs below it, and the head is small against the body. I'm rebuilding the head loft as a broader, shorter, chunkier muzzle, with a jaw tucked under it, a bigger nose, new fang positions, a re-draped lip line, larger eyes and bigger ears. The front and head views will show a heftier, more Warcraft-style face with the eyes bigger. I'm also thickening the legs and paws a little and widening the neck-ruff blades so they read as a mane instead of thin shards, which shows in the three-quarter and front views.
2. **Soundness.** The tail currently ends past the plinth edge, so I'm curling its tip in. The pine, banner, rocks and mounds are pulled inside the smaller plinth. The three-quarter and top views will show every prop on the base.
3. **Composition.** The plinth is too large for the wolf. I'm shrinking its radius and rune ring so the wolf fills more of the frame. The waystone obelisk currently sits in front of the muzzle in the three-quarter view, so I'm moving it behind the wolf's right flank, and the face will be clear of it. The front crystals move slightly inward.
4. **Finish.** The glow, runes, banner and war paint are unchanged.

## Edits

<<<<<<< SEARCH
    catmull([P(0, 0.84, -0.5), P(0, 0.74, -0.78), P(0, 0.56, -1.0), P(0, 0.36, -1.1)]),
=======
    catmull([P(0, 0.84, -0.5), P(0, 0.74, -0.76), P(0, 0.58, -0.94), P(0, 0.4, -1.0)]),
>>>>>>> REPLACE

<<<<<<< SEARCH
      { at: P(0, 1.18, 0.72), w: 0.22, h: 0.24 },
      { at: P(0, 1.185, 0.86), w: 0.26, h: 0.26 },
      { at: P(0, 1.16, 0.99), w: 0.17, h: 0.17 },
      { at: P(0, 1.135, 1.12), w: 0.12, h: 0.115 },
      { at: P(0, 1.12, 1.22), w: 0.09, h: 0.085 },
=======
      { at: P(0, 1.18, 0.72), w: 0.25, h: 0.27 },
      { at: P(0, 1.185, 0.86), w: 0.29, h: 0.29 },
      { at: P(0, 1.165, 0.98), w: 0.2, h: 0.2 },
      { at: P(0, 1.135, 1.1), w: 0.15, h: 0.14 },
      { at: P(0, 1.115, 1.19), w: 0.125, h: 0.115 },
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.sweep(catmull([P(0, 1.05, 0.84), P(0, 1.035, 1.03), P(0, 1.04, 1.2)]), (t) => [0.056 - 0.026 * t, 0.04 - 0.012 * t], {
=======
  b.sweep(catmull([P(0, 1.06, 0.86), P(0, 1.045, 1.0), P(0, 1.047, 1.17)]), (t) => [0.07 - 0.03 * t, 0.036 - 0.01 * t], {
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.SphereGeometry(0.032, 8, 6), NOSE, { bone: head, at: P(0, 1.123, 1.25), scale: [1.1, 0.8, 0.9] });
  b.part(new THREE.SphereGeometry(0.007, 5, 4), "#ffffff", { bone: head, at: P(-0.01, 1.14, 1.268) });
=======
  b.part(new THREE.SphereGeometry(0.04, 8, 6), NOSE, { bone: head, at: P(0, 1.118, 1.2), scale: [1.1, 0.8, 0.9] });
  b.part(new THREE.SphereGeometry(0.008, 5, 4), "#ffffff", { bone: head, at: P(-0.012, 1.14, 1.232) });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike(P(s * 0.043, 1.088, 1.15), [0, -1, 0.12], 0.05, 0.013, BONE, { bone: head, section: { ngon: 5 } });
    b.spike(P(s * 0.02, 1.052, 1.185), [0, 1, 0.1], 0.026, 0.008, BONE, { bone: jaw, section: { ngon: 5 } });
=======
    b.spike(P(s * 0.05, 1.08, 1.11), [0, -1, 0.12], 0.055, 0.015, BONE, { bone: head, section: { ngon: 5 } });
    b.spike(P(s * 0.032, 1.05, 1.14), [0, 1, 0.1], 0.03, 0.009, BONE, { bone: jaw, section: { ngon: 5 } });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.decal(headLoft, EYE, { at: hit, dir: [s * 0.55, 0.2, 0.8], up: [0, 1, 0], size: [0.09, 0.057], mirror: s > 0, segments: 8 });
=======
    b.decal(headLoft, EYE, { at: hit, dir: [s * 0.55, 0.2, 0.8], up: [0, 1, 0], size: [0.105, 0.066], mirror: s > 0, segments: 8 });
>>>>>>> REPLACE

<<<<<<< SEARCH
      catmull([P(s * 0.07, 1.085, 0.93), P(s * 0.062, 1.078, 1.05), P(s * 0.045, 1.08, 1.17), P(s * 0.02, 1.09, 1.24)]),
=======
      catmull([P(s * 0.075, 1.08, 0.9), P(s * 0.07, 1.07, 1.0), P(s * 0.055, 1.07, 1.1), P(s * 0.03, 1.075, 1.18)]),
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.extrude(tuftEar(0.07, 0.26), {
=======
    b.extrude(tuftEar(0.08, 0.3), {
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.extrude(tuftEar(0.044, 0.2), {
=======
    b.extrude(tuftEar(0.05, 0.23), {
>>>>>>> REPLACE

<<<<<<< SEARCH
  if (p.z > 1.235) c = NOSE as any;
=======
  if (p.z > 1.17) c = NOSE as any;
>>>>>>> REPLACE

<<<<<<< SEARCH
    tuft(it, up, out, 0.17, 0.12, front ? maneCream : maneGrey);
=======
    tuft(it, up, out, 0.18, 0.17, front ? maneCream : maneGrey);
>>>>>>> REPLACE

<<<<<<< SEARCH
    tuft(it, up, out, 0.12, 0.1, it.t > 0.3 && it.t < 0.7 ? maneCream : maneGrey);
=======
    tuft(it, up, out, 0.13, 0.15, it.t > 0.3 && it.t < 0.7 ? maneCream : maneGrey);
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(fl, [0.105, 0.082, 0.062, 0.054], { color: coat });
=======
    b.sweep(fl, [0.115, 0.092, 0.07, 0.06], { color: coat });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(hl, [0.11, 0.076, 0.05, 0.042], { color: coat });
=======
    b.sweep(hl, [0.115, 0.085, 0.058, 0.05], { color: coat });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.SphereGeometry(1, 8, 6), PAWP, { bone: joint, at: [x, G + 0.05, z + 0.05], scale: [0.058, 0.052, 0.1] });
=======
    b.part(new THREE.SphereGeometry(1, 8, 6), PAWP, { bone: joint, at: [x, G + 0.055, z + 0.05], scale: [0.07, 0.058, 0.115] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const CZ = 0.1;
=======
  const CZ = 0.05;
>>>>>>> REPLACE

<<<<<<< SEARCH
      [1.28, 0],
      [1.28, 0.06],
      [1.2, 0.1],
=======
      [1.16, 0],
      [1.16, 0.06],
      [1.08, 0.1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      [1.2, 0.095],
      [1.22, 0.11],
      [1.12, G],
      [0.7, G + 0.004],
=======
      [1.08, 0.095],
      [1.1, 0.11],
      [1.02, G],
      [0.65, G + 0.004],
>>>>>>> REPLACE

<<<<<<< SEARCH
    bp(new THREE.PlaneGeometry(2.1, 2.1), "#ffffff", {
=======
    bp(new THREE.PlaneGeometry(1.9, 1.9), "#ffffff", {
>>>>>>> REPLACE

<<<<<<< SEARCH
    [-0.72, -0.85, 0.2],
    [0.85, 0.85, 0.17],
    [-0.8, 0.05, 0.15],
    [0.25, -1.0, 0.16],
=======
    [-0.75, 0.4, 0.2],
    [0.7, 0.75, 0.17],
    [0.82, -0.35, 0.15],
    [0.1, -0.9, 0.16],
>>>>>>> REPLACE

<<<<<<< SEARCH
    [0.98, 0.45, 0.14, 0.1, 0.12, 50],
    [-0.3, -1.0, 0.15, 0.09, 0.13, 70],
    [-0.58, -0.45, 0.13, 0.08, 0.11, 10],
    [-1.0, -0.4, 0.14, 0.1, 0.12, 25],
    [0.4, 1.02, 0.12, 0.08, 0.1, 35],
=======
    [0.85, 0.45, 0.14, 0.1, 0.12, 50],
    [-0.3, -0.9, 0.15, 0.09, 0.13, 70],
    [-0.55, 0.0, 0.13, 0.08, 0.11, 10],
    [-0.92, -0.1, 0.14, 0.1, 0.12, 25],
    [0.4, 0.9, 0.12, 0.08, 0.1, 35],
>>>>>>> REPLACE

<<<<<<< SEARCH
      filter: (h: any) => Math.hypot(h.at.x, h.at.z - CZ) > 0.88 && h.n.y > 0.7,
=======
      filter: (h: any) => Math.hypot(h.at.x, h.at.z - CZ) > 0.8 && h.n.y > 0.7,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const OX = -0.9;
=======
  const OX = -0.62;
>>>>>>> REPLACE

<<<<<<< SEARCH
  const OZ = 0.6;
=======
  const OZ = -0.42;
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(b.spike([-0.45 + dx, G, 1.0 + dz], d, len, r, ICE, { bone: baseJ, section: { ngon: 6 } }), 1.3);
=======
    glow(b.spike([-0.4 + dx, G, 0.88 + dz], d, len, r, ICE, { bone: baseJ, section: { ngon: 6 } }), 1.3);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const PX = 0.6;
  const PZ = -0.9;
=======
  const PX = 0.55;
  const PZ = -0.7;
>>>>>>> REPLACE

<<<<<<< SEARCH
    const r = 0.3 - 0.07 * k;
=======
    const r = 0.27 - 0.06 * k;
>>>>>>> REPLACE

<<<<<<< SEARCH
  const BX = 1.05;
=======
  const BX = 0.95;
>>>>>>> REPLACE