1. **The head is too small.** It is lost between the pauldrons and flames, and a monster's face needs to read first. I scale the whole head, jaw joint, eyes, horns and teeth by 1.35, so the glowing eyes and fangs read from the front.
2. **The pauldron stack buries the head.** The pauldrons are shrunk and lowered, and the tall spike on each is shortened, so the head and horns rise clear in the silhouette.
3. **The foreground base rocks block the feet.** The big dodecahedra at the front of the base hide the feet and the rune circle. They are made smaller and pushed out to the rim.
4. **The eyes need more punch.** They are now bigger and sit on the scaled face, which also gives the angry brow wedges more weight.

<<<<<<< SEARCH
    const r = 2.05 + R() * 0.15;
    const k = 0.18 + R() * 0.2;
=======
    const r = 2.2 + R() * 0.12;
    const k = 0.12 + R() * 0.12;
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.part(rock(0.52), ROCK_LIT, { bone: shoulder, at: [s * 1.18, 2.8, 0], scale: [1.1, 0.75, 1], rotation: [0, s * 20, 0], flat: true });
    b.part(rock(0.34), ROCK_MID, { bone: shoulder, at: [s * 1.3, 3.15, -0.05], rotation: [20, s * 30, 10], flat: true });
    b.spike([s * 1.38, 3.2, -0.05], [s * 0.6, 1, 0], 0.4, 0.12, { bone: shoulder, color: ROCK_DARK, sides: 6 });
=======
    b.part(rock(0.44), ROCK_LIT, { bone: shoulder, at: [s * 1.22, 2.7, 0], scale: [1.1, 0.75, 1], rotation: [0, s * 20, 0], flat: true });
    b.part(rock(0.25), ROCK_MID, { bone: shoulder, at: [s * 1.36, 2.98, -0.05], rotation: [20, s * 30, 10], flat: true });
    b.spike([s * 1.42, 3.0, -0.05], [s * 0.6, 1, 0], 0.28, 0.09, { bone: shoulder, color: ROCK_DARK, sides: 6 });
>>>>>>> REPLACE
<<<<<<< SEARCH
    at: head.local({ forward: 0.02, up: -0.12 }),
    aim: head.local({ forward: 0.5, up: -0.12 }),
=======
    at: head.local({ forward: 0.03, up: -0.16 }),
    aim: head.local({ forward: 0.7, up: -0.16 }),
>>>>>>> REPLACE
<<<<<<< SEARCH
  const hl = (f: number, u: number, l = 0) => head.local({ forward: f, up: u, left: l });
=======
  const HK = 1.35;
  const hl = (f: number, u: number, l = 0) => head.local({ forward: f * HK, up: u * HK, left: l * HK });
>>>>>>> REPLACE
<<<<<<< SEARCH
  b.part(new THREE.BoxGeometry(0.66, 0.44, 0.58), ROCK_LIT, { bone: head, at: hl(0.2, 0.2) });
  b.part(new THREE.BoxGeometry(0.2, 0.14, 0.14), ROCK_MID, { bone: head, at: hl(0.52, 0.06) });
  b.part(new THREE.BoxGeometry(0.58, 0.12, 0.4), ROCK_MID, { bone: head, at: hl(0.3, -0.06) });
=======
  b.part(new THREE.BoxGeometry(0.66 * HK, 0.44 * HK, 0.58 * HK), ROCK_LIT, { bone: head, at: hl(0.2, 0.2) });
  b.part(new THREE.BoxGeometry(0.2 * HK, 0.14 * HK, 0.14 * HK), ROCK_MID, { bone: head, at: hl(0.52, 0.06) });
  b.part(new THREE.BoxGeometry(0.58 * HK, 0.12 * HK, 0.4 * HK), ROCK_MID, { bone: head, at: hl(0.3, -0.06) });
>>>>>>> REPLACE
<<<<<<< SEARCH
  glow(b.part(new THREE.OctahedronGeometry(0.06, 0), LAVA_HOT, { bone: head, at: hl(0.5, 0.36), scale: [1, 1.4, 0.8] }), 1.4);
=======
  glow(b.part(new THREE.OctahedronGeometry(0.06 * HK, 0), LAVA_HOT, { bone: head, at: hl(0.5, 0.36), scale: [1, 1.4, 0.8] }), 1.4);
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.part(rock(0.14), ROCK_DARK, { bone: head, at: hl(0.05 - Math.abs(k) * 0.05, 0.46, k * 0.15), scale: [1, 1.3, 1], flat: true });
=======
    b.part(rock(0.14 * HK), ROCK_DARK, { bone: head, at: hl(0.05 - Math.abs(k) * 0.05, 0.46, k * 0.15), scale: [1, 1.3, 1], flat: true });
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.part(new THREE.ConeGeometry(0.03, 0.1, 4), TOOTH, { bone: head, at: hl(0.49, -0.15, x), dir: [0, -1, 0] });
=======
    b.part(new THREE.ConeGeometry(0.03 * HK, 0.1 * HK, 4), TOOTH, { bone: head, at: hl(0.49, -0.15, x), dir: [0, -1, 0] });
>>>>>>> REPLACE
<<<<<<< SEARCH
  b.part(new THREE.BoxGeometry(0.54, 0.14, 0.44), ROCK_DARK, { bone: jaw, at: hl(0.28, -0.23) });
  glow(b.part(new THREE.BoxGeometry(0.46, 0.03, 0.34), LAVA, { bone: jaw, at: hl(0.28, -0.155) }), 1.2);
=======
  b.part(new THREE.BoxGeometry(0.54 * HK, 0.14 * HK, 0.44 * HK), ROCK_DARK, { bone: jaw, at: hl(0.28, -0.23) });
  glow(b.part(new THREE.BoxGeometry(0.46 * HK, 0.03 * HK, 0.34 * HK), LAVA, { bone: jaw, at: hl(0.28, -0.155) }), 1.2);
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.part(new THREE.ConeGeometry(0.03, 0.09, 4), TOOTH, { bone: jaw, at: hl(0.47, -0.13, x), dir: [0, 1, 0] });
  });
  b.part(new THREE.ConeGeometry(0.07, 0.2, 5), ROCK_MID, { bone: jaw, at: hl(0.5, -0.32), dir: [0, -1, 0.5] });
=======
    b.part(new THREE.ConeGeometry(0.03 * HK, 0.09 * HK, 4), TOOTH, { bone: jaw, at: hl(0.47, -0.13, x), dir: [0, 1, 0] });
  });
  b.part(new THREE.ConeGeometry(0.07 * HK, 0.2 * HK, 5), ROCK_MID, { bone: jaw, at: hl(0.5, -0.32), dir: [0, -1, 0.5] });
>>>>>>> REPLACE
<<<<<<< SEARCH
    const eyeGeo = new THREE.PlaneGeometry(0.22, 0.11);
=======
    const eyeGeo = new THREE.PlaneGeometry(0.24 * HK, 0.12 * HK);
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.part(new THREE.BoxGeometry(0.34, 0.1, 0.22), ROCK_DARK, { bone: head, at: hl(0.44, 0.33, s * 0.17), rotation: [0, 0, s * 14] });
    // cheek plates
    b.part(new THREE.BoxGeometry(0.1, 0.3, 0.4), ROCK_DARK, { bone: head, at: hl(0.15, 0.12, s * 0.36) });
    // nostril vents
    glow(b.part(new THREE.BoxGeometry(0.03, 0.03, 0.03), LAVA, { bone: head, at: hl(0.6, 0.07, s * 0.05) }), 1.2);
=======
    b.part(new THREE.BoxGeometry(0.34 * HK, 0.1 * HK, 0.22 * HK), ROCK_DARK, { bone: head, at: hl(0.44, 0.33, s * 0.17), rotation: [0, 0, s * 14] });
    // cheek plates
    b.part(new THREE.BoxGeometry(0.1 * HK, 0.3 * HK, 0.4 * HK), ROCK_DARK, { bone: head, at: hl(0.15, 0.12, s * 0.36) });
    // nostril vents
    glow(b.part(new THREE.BoxGeometry(0.03 * HK, 0.03 * HK, 0.03 * HK), LAVA, { bone: head, at: hl(0.6, 0.07, s * 0.05) }), 1.2);
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.sweep(bezier(p0, p1, p2), [0.1, 0.05], { bone: head, color: HORN, section: { ngon: 6 }, caps: { start: "flat", end: "round" } });
=======
    b.sweep(bezier(p0, p1, p2), [0.12, 0.05], { bone: head, color: HORN, section: { ngon: 6 }, caps: { start: "flat", end: "round" } });
>>>>>>> REPLACE