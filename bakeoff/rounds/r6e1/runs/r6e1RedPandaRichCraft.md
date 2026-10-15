**Identity check**
- **Cream-rimmed round ears:** visible and in proportion in the front and head views.
- **White tear-stripe face with a cream muzzle:** reads clearly, with both eyes visible from the front.
- **Ringed bushy tail:** the silhouette is right, but the rings are low-contrast and the shaded side goes near-black red. From the front it also hides directly behind the head.
- **Dark legs:** they read, but they are thin and nearly black plum.

**Changes, in priority order**
1. **Identity: tail.** I sweep the tail out to the panda's left as it rises and raise the ring contrast (orange against dark rust, with a lighter shadow tone). In the front and back views the tail will show beside the head, with clear banding instead of a dark column. The three-quarter view will show crisper rings.
2. **Soundness: scarf tails.** They currently shoot up from the nape like antennae, which is most visible in the front and three-quarter views. I drape them flat along the back with `surface.drape` and end each in a gold bead. They will lie on the fur in the top and back views and no longer stick out above the head.
3. **Identity: forehead tufts.** They read as orange horns. I lay them back along the skull, so the head view shows a soft fringe and a cleaner crown.
4. **Form: legs.** I thicken the limb radii and lighten the leg and belly colour from plum-black to warm brown. In the front and back views the legs will look sturdier, with more readable colour.
5. **Composition: moss.** I make the moss clumps on the stone rim fewer and smaller. The paws and legs will stand clear of the moss in the front view.

## Edits

<<<<<<< SEARCH
  dark: "#4a2a3c",
=======
  dark: "#5c3345",
>>>>>>> REPLACE

<<<<<<< SEARCH
const TAIL_P = cel(
  paint((_p, _n, s) => (s[0] > 0.93 ? "#5a2c36" : Math.floor(s[0] * 11) % 2 ? C.rust : C.orange)),
);
=======
const TAIL_P = cel(
  paint((_p, _n, s) => (s[0] > 0.93 ? "#5a2c36" : Math.floor(s[0] * 11) % 2 ? "#b73e1a" : "#f77a30")),
  paint((_p, _n, s) => (s[0] > 0.93 ? "#40202c" : Math.floor(s[0] * 11) % 2 ? "#8e2c1a" : "#d85a26")),
);
>>>>>>> REPLACE

<<<<<<< SEARCH
    [0, 0.64, -0.45],
    [0, 0.72, -0.62],
    [0, 0.89, -0.7],
    [0, 1.06, -0.66],
    [0, 1.16, -0.55],
=======
    [0.02, 0.64, -0.45],
    [0.1, 0.72, -0.62],
    [0.2, 0.88, -0.7],
    [0.27, 1.04, -0.64],
    [0.28, 1.16, -0.52],
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(fl, [0.055, 0.045, 0.037], { color: DARK_P });
=======
    b.sweep(fl, [0.065, 0.055, 0.045], { color: DARK_P });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(hl, [0.075, 0.055, 0.042, 0.037], { color: DARK_P });
=======
    b.sweep(hl, [0.085, 0.065, 0.05, 0.045], { color: DARK_P });
>>>>>>> REPLACE

<<<<<<< SEARCH
    blade(leafOutline(0.055, 0.02), H(k * 0.03, 0.082, 0.035), [k * 0.4, 1, -0.3], [1, 0, 0], 0.012, ORANGE_P, head);
=======
    blade(leafOutline(0.06, 0.02), H(k * 0.03, 0.07, 0.03), [k * 0.3, 0.45, -0.85], [1, 0, 0], 0.012, ORANGE_P, head);
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const s of [1, -1]) {
    const kp = (dx: number, dy: number, dz: number): T3 => [K.x + dx, K.y + dy, K.z + dz];
    const rib = bezier(kp(0, 0, 0), kp(s * 0.05, 0.06, -0.04), kp(s * 0.11, 0.13, -0.14), kp(s * 0.16, 0.12, -0.3));
    b.sweep(rib, (t) => [0.03 * (1 - 0.25 * t), 0.0045], {
      section: "box",
      caps: "flat",
      up: [0, 1, 0],
      bone: chest,
      bands: [[0.84, SCARF_P], [0.89, C.gold], [1, SCARF_P]],
    });
    const end = rib.at(1);
    b.spike(T(new THREE.Vector3().copy(end as any)), [0, -1, 0], 0.06, 0.016, { color: C.gold, bone: chest });
  }
=======
  for (const s of [1, -1]) {
    const ky = K.y + 0.05;
    const rough = catmull([
      [s * 0.012, ky, K.z - 0.01],
      [s * 0.05, ky, K.z - 0.07],
      [s * 0.085, ky, K.z - 0.13],
      [s * 0.095, ky, K.z - 0.18],
    ]);
    const rib = bodySurf.drape(rough, { lift: 0.012 });
    b.sweep(rib, (t) => [0.03 * (1 - 0.2 * t), 0.005], {
      section: "box",
      caps: "flat",
      bone: chest,
      bands: [[0.84, SCARF_P], [0.9, C.gold], [1, SCARF_P]],
    });
    const end = new THREE.Vector3().copy(rib.at(1) as any);
    b.part(new THREE.SphereGeometry(0.014, 6, 5), C.gold, { bone: chest, at: T(end) });
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + R() * 0.3;
=======
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2 + R() * 0.3;
>>>>>>> REPLACE

<<<<<<< SEARCH
    const sz = 0.05 + R() * 0.025;
=======
    const sz = 0.04 + R() * 0.02;
>>>>>>> REPLACE