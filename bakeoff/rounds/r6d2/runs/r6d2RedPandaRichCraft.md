1. **Scarf**: it was a body-width octagon around the chest, like a harness. It now wraps the neck just behind the head, with gold trim rings, a knot at the model's left side and two flat ribbons trailing along the flank. The next render should show a collar framing the head instead of an octagon.
2. **Proportions**: the weasel-long torso and the scorpion-style upward tail made it read less like a red panda. I shortened the body about 6 cm and moved the hind legs forward. I thickened the legs and made the tail bushier and lower, with a gentle upward curl. I also raised the ring contrast on the tail, so the next render should show a stockier animal with a plump ringed tail.
3. **Legs and belly colour**: the cel shadow turned them near-black, so I lightened the dark brown and its shadow tone. The legs and underside should show brown with form.
4. **Face markings**: the tear stripes were not showing. They are now larger, set lower and further in from the eye, with a slightly higher decal lift. The white brow spots move up and outward above each eye instead of sitting mid-forehead.

## Edits

<<<<<<< SEARCH
  dark: "#6a3a38",
=======
  dark: "#7d4235",
>>>>>>> REPLACE

<<<<<<< SEARCH
const DARK_P = cel(C.dark, "#47252f");
=======
const DARK_P = cel(C.dark, "#57292c");
>>>>>>> REPLACE

<<<<<<< SEARCH
  paint((_p, _n, s) => (s[0] > 0.93 ? "#5a2c36" : Math.floor(s[0] * 11) % 2 ? C.rust : C.orange)),
=======
  paint((_p, _n, s) => (s[0] > 0.94 ? "#5a2c36" : Math.floor(s[0] * 9) % 2 ? "#c0401a" : "#ff8a3a")),
>>>>>>> REPLACE

<<<<<<< SEARCH
  const tailPts: T3[] = [
    [0, 0.62, -0.26],
    [0, 0.65, -0.43],
    [0, 0.7, -0.6],
    [0, 0.8, -0.72],
    [0, 0.93, -0.78],
    [0, 1.03, -0.74],
  ];
=======
  const tailPts: T3[] = [
    [0, 0.62, -0.2],
    [0, 0.63, -0.37],
    [0, 0.64, -0.54],
    [0, 0.68, -0.7],
    [0, 0.76, -0.82],
    [0, 0.87, -0.86],
  ];
>>>>>>> REPLACE

<<<<<<< SEARCH
      { at: [0, 0.58, -0.27], w: 0.2, h: 0.2 },
      { at: [0, 0.61, -0.16], w: 0.29, h: 0.28 },
=======
      { at: [0, 0.58, -0.2], w: 0.22, h: 0.22 },
      { at: [0, 0.61, -0.11], w: 0.3, h: 0.29 },
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.capsule([0, 0.64, 0.2], [0, 0.69, 0.34], 0.105, { color: ORANGE_P, bone: neck });
=======
  const neckTube = b.capsule([0, 0.64, 0.2], [0, 0.69, 0.34], 0.105, { color: ORANGE_P, bone: neck });
>>>>>>> REPLACE

<<<<<<< SEARCH
    (t) => 0.045 + 0.055 * Math.sin(Math.PI * Math.pow(t, 0.7)) - 0.02 * t * t * t,
=======
    (t) => 0.06 + 0.07 * Math.sin(Math.PI * Math.pow(t, 0.75)) - 0.03 * t * t * t,
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(fl, [0.055, 0.045, 0.037], { color: DARK_P });
=======
    b.sweep(fl, [0.06, 0.052, 0.045], { color: DARK_P });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const hPts = limb([s * 0.1, 0.56, -0.17], [s * 0.11, FOOT, -0.2], [0.11, 0.11, 0.08], [[0, 0, 1], [0, 0, -1]]);
=======
    const hPts = limb([s * 0.1, 0.56, -0.12], [s * 0.11, FOOT, -0.14], [0.11, 0.11, 0.08], [[0, 0, 1], [0, 0, -1]]);
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(hl, [0.075, 0.055, 0.042, 0.037], { color: DARK_P });
=======
    b.sweep(hl, [0.08, 0.06, 0.048, 0.043], { color: DARK_P });
>>>>>>> REPLACE

<<<<<<< SEARCH
      [hl.tip!, [s * 0.11, FOOT, -0.2], 0.07, 0.042],
=======
      [hl.tip!, [s * 0.11, FOOT, -0.14], 0.07, 0.046],
>>>>>>> REPLACE

<<<<<<< SEARCH
    const tear = skin.around(HC).at(s * 27, -26);
    if (tear) b.decal(skin, TEAR, { at: tear, size: [0.022, 0.052], roll: s * 8 });
    const brow = skin.around(HC).at(s * 36, 31);
    if (brow) b.decal(skin, BROW, { at: brow, size: [0.042, 0.025], roll: -s * 22 });
=======
    const tear = skin.around(HC).at(s * 32, -33);
    if (tear) b.decal(skin, TEAR, { at: tear, size: [0.03, 0.08], lift: 0.003 });
    const brow = skin.around(HC).at(s * 38, 27);
    if (brow) b.decal(skin, BROW, { at: brow, size: [0.045, 0.026], roll: -s * 15 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const collar = bodySurf.loop(frame([0, 0.64, 0.215], [0, 0, 1]), { lift: 0.012 });
  b.sweep(collar, 0.02, { color: SCARF_P });
  for (const z of [0.19, 0.24]) {
    const trim = bodySurf.loop(frame([0, 0.64, z], [0, 0, 1]), { lift: 0.014 });
    b.sweep(trim, 0.007, { color: C.gold });
  }
  const K = new THREE.Vector3(...T(new THREE.Vector3().copy(collar.at(0) as any)));
  b.part(new THREE.SphereGeometry(1, 8, 6), SCARF_P, { bone: chest, at: T(K), scale: [0.036, 0.03, 0.04] });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 8), C.gold, { bone: chest, at: T(K.clone().add(new THREE.Vector3(0, 0.022, 0.02))), dir: [0, 0.6, 1] });
  for (const s of [1, -1]) {
    const kp = (dx: number, dy: number, dz: number): T3 => [K.x + dx, K.y + dy, K.z + dz];
    const rib = bezier(kp(0, 0, 0), kp(s * 0.04, 0.04, -0.06), kp(s * 0.09, 0.03, -0.17), kp(s * 0.13, -0.005, -0.3));
    b.sweep(rib, (t) => [0.03 * (1 - 0.25 * t), 0.0045], {
      section: "box",
      caps: "flat",
      up: [0, 1, 0],
      bone: chest,
      bands: [[0.84, SCARF_P], [0.89, C.gold], [1, SCARF_P]],
    });
    const end = rib.at(1);
    b.spike(T(new THREE.Vector3().copy(end as any)), [s * 0.2, -0.3, -1], 0.05, 0.014, { color: C.gold, bone: chest });
  }
=======
  const neckSurf = b.surface(neckTube);
  const collar = neckSurf.loop(frame([0, 0.658, 0.27], [0, 0, 1]), { lift: 0.018 });
  b.sweep(collar, 0.026, { color: SCARF_P, bone: neck });
  for (const z of [0.245, 0.295]) {
    const trim = neckSurf.loop(frame([0, 0.66, z], [0, 0, 1]), { lift: 0.022 });
    b.sweep(trim, 0.007, { color: C.gold, bone: neck });
  }
  let kt = 0.25;
  let kx = -1;
  for (let i = 0; i <= 100; i++) {
    const q = collar.at(i / 100) as any;
    if (q.x > kx) {
      kx = q.x;
      kt = i / 100;
    }
  }
  const K = new THREE.Vector3().copy(collar.at(kt) as any);
  b.part(new THREE.SphereGeometry(1, 8, 6), SCARF_P, { bone: neck, at: T(K), scale: [0.036, 0.034, 0.04] });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 8), C.gold, { bone: neck, at: T(K.clone().add(new THREE.Vector3(0.028, 0.004, 0.002))), dir: [1, 0, 0.2] });
  for (const [i, len] of [[0, 0.2], [1, 0.14]] as [number, number][]) {
    const kp = (dx: number, dy: number, dz: number): T3 => [K.x + dx, K.y + dy, K.z + dz];
    const rib = bezier(
      kp(0.01, -0.01, 0),
      kp(0.04 + i * 0.01, -0.03 - i * 0.03, -0.07),
      kp(0.06 + i * 0.01, -0.04 - i * 0.05, -len * 0.6),
      kp(0.065 + i * 0.015, -0.06 - i * 0.07, -len),
    );
    b.sweep(rib, (t) => [0.005, 0.03 * (1 - 0.25 * t)], {
      section: "box",
      caps: "flat",
      up: [0, 1, 0],
      bone: chest,
      bands: [[0.84, SCARF_P], [0.89, C.gold], [1, SCARF_P]],
    });
    const end = rib.at(1);
    b.spike(T(new THREE.Vector3().copy(end as any)), [0.1, -0.3, -1], 0.05, 0.014, { color: C.gold, bone: chest });
  }
>>>>>>> REPLACE