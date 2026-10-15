1. Beard and smile: the core `bp` now ends near `[0,0.46,0.19]` with a rounded profile that tapers to 12 mm. Five broader locks, staggered with tips at y 0.46–0.52, replace the seven slats, and their roots are buried in the core. The core starts below the mouth, and the moustache is raised. A recessed-looking `SMILE` decal of about 45 × 22 mm sits on the jaw sphere at y 0.675, with a small lower-lip highlight below it.
2. Hat: the last four `hatPath` points move +x by 20, 45, 65 and 75 mm. The height, cuff, goggles and bell are unchanged, and the bell stays at the tip.
3. Thinking pose: the left hand target is now `[0.27,0.53,0.16]`. The screwdriver axis comes from `[-0.3,0.95,0.08]`, after the existing perpendicular fix for the grip. The irises, pupils and highlights in `EYE` shift down and toward that hand.
4. Supports: the wrench sits higher, and a 20 mm leather loop of two legs and an outer plate runs from the belt around the handle, with the legs overlapping the belt by a few mm. A brass stem now joins the lantern roof apex to its ring, leaving the ring's centre open. The valve has a central spindle with a knob and three thin spokes.
5. Propeller: `HUB` moves to `[-0.29,0.84,-0.19]` and the bracket is rebuilt as a curve from a new lid plate that rises to the hub's underside. The tilt is 50° and the blades clear the hat and telescope by well over 15 mm.
6. Backpack mechanism: `PLATE` is now muted blue-grey. The gear train sits 12 mm proud of the panel on steel bearing bosses. Each axle ends in a dark hex fastener with a gilt dot. The lid buckles and straps move to x = ±0.11, clear of the `PATCH` badge.
7. Base: the radius drops to 0.40 and the props move inward. Grass drops to 18 placements behind and beside the boots, and `FLOOR` is a low-contrast tone-on-tone drawing. I kept it opaque because textures are alpha-cut below 50%.
8. Materials: the hat stripe contrast is halved and the beard's second tone is subtler. The green jar's glow drops to 0.7. I removed a duplicate opaque jar cylinder that was hiding the glowing one.

## Edits

<<<<<<< SEARCH
const HAT_L = "#f06a3a";
=======
const HAT_L = "#e5572f";
>>>>>>> REPLACE

<<<<<<< SEARCH
const GREY_W = "#c9c2b0";
=======
const GREY_W = "#d6cfbc";
>>>>>>> REPLACE

<<<<<<< SEARCH
    <circle cx="21" cy="23" r="10" fill="#6a3d1c"/>
    <circle cx="21" cy="23" r="6" fill="#130a08"/>
    <circle cx="17" cy="18.5" r="3.6" fill="#ffffff"/>
    <circle cx="25" cy="27" r="1.8" fill="#ffffff"/>
=======
    <circle cx="23" cy="25" r="10" fill="#6a3d1c"/>
    <circle cx="23" cy="25" r="6" fill="#130a08"/>
    <circle cx="19" cy="20.5" r="3.6" fill="#ffffff"/>
    <circle cx="27" cy="29" r="1.8" fill="#ffffff"/>
>>>>>>> REPLACE

<<<<<<< SEARCH
    <circle cx="100" cy="100" r="95" fill="none" stroke="#9c8a5a" stroke-width="3" opacity=".8"/>
    <circle cx="100" cy="100" r="86" fill="none" stroke="#58544a" stroke-width="2.5" stroke-dasharray="7 5" opacity=".8"/>
    <path d="${gearPath(100, 100, 72, 60, 16)}" fill="none" stroke="#9c8a5a" stroke-width="3" stroke-linejoin="round" opacity=".8"/>
    <circle cx="100" cy="100" r="44" fill="none" stroke="#58544a" stroke-width="2.5" opacity=".8"/>
    <path d="M100 8V192 M8 100H192" stroke="#9c8a5a" stroke-width="2" opacity=".5"/>
=======
    <circle cx="100" cy="100" r="95" fill="none" stroke="#a09b8c" stroke-width="2.5"/>
    <circle cx="100" cy="100" r="86" fill="none" stroke="#777468" stroke-width="2" stroke-dasharray="7 5"/>
    <path d="${gearPath(100, 100, 72, 60, 16)}" fill="none" stroke="#a09b8c" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="100" cy="100" r="44" fill="none" stroke="#777468" stroke-width="2"/>
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.decal(base, FLOOR, { at: [0, 0, 0], dir: [0, 1, 0], up: [0, 0, -1], size: [0.7, 0.7], segments: 16 });
=======
  b.decal(base, FLOOR, { at: [0, 0, 0], dir: [0, 1, 0], up: [0, 0, -1], size: [0.62, 0.62], segments: 16 });
>>>>>>> REPLACE

<<<<<<< SEARCH
    [0, sh(1.17), -0.09],
    [0, sh(1.21), -0.17],
    [0, sh(1.19), -0.25],
    [0, sh(1.13), -0.3],
=======
    [0.02, sh(1.17), -0.09],
    [0.045, sh(1.21), -0.17],
    [0.065, sh(1.19), -0.25],
    [0.075, sh(1.13), -0.3],
>>>>>>> REPLACE

<<<<<<< SEARCH
    const target = s > 0 ? [0.29, 0.45, 0.1] : [-0.3, 0.4, 0.08];
=======
    const target = s > 0 ? [0.27, 0.53, 0.16] : [-0.3, 0.4, 0.08];
>>>>>>> REPLACE

<<<<<<< SEARCH
      const a = ortho(V(-0.5, 1, 0), dir);
=======
      const a = ortho(V(-0.3, 0.95, 0.08).normalize(), dir);
>>>>>>> REPLACE

<<<<<<< SEARCH
  mk(new THREE.SphereGeometry(R, 12, 4, 0, Math.PI * 2, TH, Math.PI - TH), SKINP, jaw, HC.toArray(), { flat: true });
=======
  const jawSkull = mk(new THREE.SphereGeometry(R, 12, 4, 0, Math.PI * 2, TH, Math.PI - TH), SKINP, jaw, HC.toArray(), { flat: true });
>>>>>>> REPLACE

<<<<<<< SEARCH
        [s * 0.03, 0.706, hz(0.03, 0.706, 0.022)],
        [s * 0.065, 0.696, hz(0.065, 0.696, 0.022)],
        [s * 0.1, 0.692, hz(0.1, 0.692, 0.018)],
        [s * 0.13, 0.714, 0.045],
      ]),
      [0.026, 0.03, 0.026, 0.01],
=======
        [s * 0.03, 0.712, hz(0.03, 0.712, 0.02)],
        [s * 0.065, 0.706, hz(0.065, 0.706, 0.02)],
        [s * 0.1, 0.702, hz(0.1, 0.702, 0.016)],
        [s * 0.13, 0.722, 0.045],
      ]),
      [0.022, 0.026, 0.022, 0.008],
>>>>>>> REPLACE

<<<<<<< SEARCH
  const bp = catmull([
    [0, 0.7, 0.075],
    [0, 0.635, 0.135],
    [0, 0.555, 0.18],
    [0, 0.48, 0.2],
    [0, 0.4, 0.2],
  ]);
  const rxF = (t: number) => (0.11 - 0.075 * t) * (1 + 0.15 * Math.sin(Math.PI * t));
  const ryF = (t: number) => (0.055 - 0.02 * t) * (1 + 0.1 * Math.sin(Math.PI * t));
  const beard = b.sweep(bp, (t) => [rxF(t), ryF(t)], {
=======
  const bp = catmull([
    [0, 0.635, 0.105],
    [0, 0.605, 0.14],
    [0, 0.555, 0.168],
    [0, 0.505, 0.186],
    [0, 0.46, 0.19],
  ]);
  const rxF = (t: number) => (0.012 + 0.093 * (1 - t * t)) * (1 + 0.12 * Math.sin(Math.PI * t));
  const ryF = (t: number) => (0.012 + 0.038 * (1 - t * t)) * (1 + 0.1 * Math.sin(Math.PI * t));
  b.sweep(bp, (t) => [rxF(t), ryF(t)], {
>>>>>>> REPLACE

<<<<<<< SEARCH
      const x = xo * (1 + spread * u);
      const k = Math.sqrt(Math.max(0.12, 1 - (x / rxF(t)) ** 2));
      const lift = u === 0 ? -0.012 : 0.006 + 0.012 * Math.sin(Math.PI * Math.min(1, u * 0.9));
      return c.clone().addScaledVector(Xv, x).addScaledVector(nrm, ryF(t) * k + lift).toArray();
    });
    b.sweep(catmull(pts), (t) => [0.03 * (1 - 0.8 * t) + 0.005, 0.02 * (1 - 0.8 * t) + 0.005], {
=======
      const x = Math.sign(xo || 1) * Math.min(Math.abs(xo * (1 + spread * u)), rxF(t) * 0.85);
      const k = Math.sqrt(Math.max(0.12, 1 - (x / rxF(t)) ** 2));
      const lift = u === 0 ? -0.034 : 0.004 + 0.012 * Math.sin(Math.PI * Math.min(1, u * 0.9));
      return c.clone().addScaledVector(Xv, x).addScaledVector(nrm, ryF(t) * k + lift).toArray();
    });
    b.sweep(catmull(pts), (t) => [0.036 * (1 - 0.75 * t) + 0.008, 0.022 * (1 - 0.7 * t) + 0.006], {
>>>>>>> REPLACE

<<<<<<< SEARCH
  lock(0.08, -0.075, 0.46, 0.3, BEARDP);
  lock(0.08, 0.075, 0.48, 0.3, BEARD2);
  lock(0.2, -0.04, 0.44, 0.35, BEARD2);
  lock(0.2, 0.045, 0.5, 0.35, BEARDP);
  lock(0.2, 0.0, 0.455, 0.0, BEARDP);
  lock(0.4, -0.025, 0.43, 0.4, BEARDP);
  lock(0.4, 0.03, 0.47, 0.4, BEARD2);
=======
  lock(0.12, -0.07, 0.49, 0.3, BEARDP);
  lock(0.12, 0.07, 0.52, 0.3, BEARD2);
  lock(0.25, -0.03, 0.46, 0.25, BEARD2);
  lock(0.25, 0.035, 0.5, 0.25, BEARDP);
  lock(0.35, 0.0, 0.47, 0.0, BEARDP);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const mh = b.surface(beard).ray([0, 0.672, 1], [0, 0, -1]);
  if (mh) b.decal(beard, SMILE, { at: mh, dir: [0, 0.2, 1], up: [0, 1, 0], size: [0.05, 0.028], segments: 8 });
=======
  // mouth opening between moustache and beard: dark smile on the chin, small lower-lip highlight
  b.decal(jawSkull, SMILE, { at: [0, 0.675, hz(0, 0.675, 0)], dir: [0, 0.15, 1], up: [0, 1, 0], size: [0.045, 0.022], segments: 8 });
  mk(new THREE.SphereGeometry(1, 6, 4), "#f7a98f", jaw, [0, 0.663, hz(0, 0.663, 0)], { scale: [0.013, 0.004, 0.006] });
>>>>>>> REPLACE

<<<<<<< SEARCH
      { at: [-0.19, 0.27, 0.03], x: [0, 0, 1], y: yv, thickness: 0.012, bevel: 0.002, color: STEEL, bone: TB },
=======
      { at: [-0.19, 0.328, 0.03], x: [0, 0, 1], y: yv, thickness: 0.012, bevel: 0.002, color: STEEL, bone: TB },
>>>>>>> REPLACE

<<<<<<< SEARCH
    mk(new THREE.TorusGeometry(0.014, 0.004, 4, 8), BRASS, TB, [-0.165, 0.375, 0.03], { axis: "z", dir: [1, 0, 0] });
=======
    // leather loop: two legs tucked into the belt, an outer plate round the handle
    for (const dz of [-0.0145, 0.0145])
      mk(new THREE.BoxGeometry(0.0475, 0.02, 0.004), LEATHER_DP, TB, [-0.17175, 0.352, 0.03 + dz]);
    mk(new THREE.BoxGeometry(0.004, 0.02, 0.033), LEATHER_DP, TB, [-0.1935, 0.352, 0.03]);
    mk(new THREE.SphereGeometry(0.005, 5, 4), BRASS, TB, [-0.1955, 0.352, 0.03]);
>>>>>>> REPLACE

<<<<<<< SEARCH
const PLATE = panelled(IRON, { size: 0.135, aspect: 1, rivets: 0.05 });
=======
const PLATE = panelled(lit(mottle("#5b6a7e", "#74849a", { size: 0.06, seed: 21 })), {
    size: 0.135,
    aspect: 1,
    rivets: 0.05,
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
    mk(new THREE.BoxGeometry(0.03, 0.004, 0.152), LEATHERP, pack, [s * 0.07, 0.682, -0.21]);
    mk(new THREE.BoxGeometry(0.026, 0.022, 0.006), BRASS, pack, [s * 0.07, 0.655, -0.292]);
    mk(new THREE.BoxGeometry(0.012, 0.012, 0.01), DARK, pack, [s * 0.07, 0.655, -0.2955]);
=======
    mk(new THREE.BoxGeometry(0.03, 0.004, 0.152), LEATHERP, pack, [s * 0.11, 0.682, -0.21]);
    mk(new THREE.BoxGeometry(0.026, 0.022, 0.006), BRASS, pack, [s * 0.11, 0.655, -0.292]);
    mk(new THREE.BoxGeometry(0.012, 0.012, 0.01), DARK, pack, [s * 0.11, 0.655, -0.2955]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  gearTrain(b, {
    at: [0, 0.45, -0.292],
=======
  const train = gearTrain(b, {
    at: [0, 0.45, -0.304],
>>>>>>> REPLACE

<<<<<<< SEARCH
      { teeth: 18, on: 1, shift: 0.012, spokes: 4 },
    ],
  });
=======
      { teeth: 18, on: 1, shift: 0.012, spokes: 4 },
    ],
  });
  // bearing bosses behind each axle, hex fasteners on the axle ends
  for (const i of [0, 1, 2]) {
    const g = train.gears[i];
    mk(new THREE.CylinderGeometry(0.0125, 0.0145, 0.0145, 8), STEEL, pack, [g.at.x, g.at.y, -0.2935], { dir: [0, 0, 1] });
  }
  for (const i of [0, 2, 3]) {
    const g = train.gears[i];
    mk(new THREE.CylinderGeometry(0.0075, 0.0075, 0.004, 6), "#2b3345", pack, [g.at.x, g.at.y, g.at.z - 0.011], { dir: [0, 0, 1] });
    mk(new THREE.CylinderGeometry(0.0028, 0.0028, 0.0046, 6), GILT, pack, [g.at.x, g.at.y, g.at.z - 0.0125], { dir: [0, 0, 1] });
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
  mk(new THREE.TorusGeometry(0.022, 0.004, 4, 8), "#d6402f", pack, [0.205, 0.615, -0.21], { axis: "z", dir: [0, 1, 0] });
=======
  mk(new THREE.TorusGeometry(0.022, 0.004, 4, 8), "#d6402f", pack, [0.205, 0.615, -0.21], { axis: "z", dir: [0, 1, 0] });
  mk(new THREE.CylinderGeometry(0.004, 0.004, 0.022, 6), IRON, pack, [0.205, 0.617, -0.21]);
  mk(new THREE.SphereGeometry(0.007, 6, 4), "#d6402f", pack, [0.205, 0.629, -0.21]);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    b.rod([0.205, 0.615, -0.21], [0.205 + Math.sin(a) * 0.021, 0.615, -0.21 + Math.cos(a) * 0.021], 0.0025, "#d6402f", {
      bone: pack,
      sides: 4,
    });
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
    const HUB = V(-0.23, 0.82, -0.25);
    mk(new THREE.BoxGeometry(0.06, 0.008, 0.05), BRASS, pack, [-0.125, 0.684, -0.25]);
    for (const dx of [-0.02, 0.02]) mk(new THREE.SphereGeometry(0.005, 5, 4), GILT, pack, [-0.125 + dx, 0.689, -0.25]);
    b.sweep(
      catmull([
        [-0.125, 0.688, -0.25],
        [-0.125, 0.745, -0.25],
        [-0.16, 0.792, -0.25],
        [-0.228, 0.8, -0.25],
      ]),
      0.0085,
      { bone: pack, color: IRON, sides: 6 },
    );
    mk(new THREE.CylinderGeometry(0.02, 0.02, 0.016, 8), BRASS, pack, [HUB.x, 0.806, HUB.z]);
    mk(new THREE.TorusGeometry(0.021, 0.004, 4, 8), GILT, pack, [HUB.x, 0.797, HUB.z], { axis: "z", dir: [0, 1, 0] });
=======
    const HUB = V(-0.29, 0.84, -0.19);
    mk(new THREE.BoxGeometry(0.06, 0.008, 0.05), BRASS, pack, [-0.125, 0.684, -0.19]);
    for (const dx of [-0.02, 0.02]) mk(new THREE.SphereGeometry(0.005, 5, 4), GILT, pack, [-0.125 + dx, 0.689, -0.19]);
    b.sweep(
      catmull([
        [-0.125, 0.688, -0.19],
        [-0.16, 0.69, -0.19],
        [-0.235, 0.712, -0.19],
        [-0.282, 0.76, -0.19],
        [HUB.x, HUB.y - 0.022, HUB.z],
      ]),
      0.0085,
      { bone: pack, color: IRON, sides: 6 },
    );
    mk(new THREE.CylinderGeometry(0.02, 0.02, 0.016, 8), BRASS, pack, [HUB.x, HUB.y - 0.014, HUB.z]);
    mk(new THREE.TorusGeometry(0.021, 0.004, 4, 8), GILT, pack, [HUB.x, HUB.y - 0.023, HUB.z], { axis: "z", dir: [0, 1, 0] });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.pose(rotor, { axis: [1, 0, 0], deg: 30 });
=======
    b.pose(rotor, { axis: [1, 0, 0], deg: 50 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  mk(new THREE.CylinderGeometry(0.028, 0.028, 0.072, 8), GREEN_G, pack, [0.08, 0.7175, -0.19]);
  glow(mk(new THREE.CylinderGeometry(0.027, 0.027, 0.07, 8), GREEN_G, pack, [0.08, 0.7175, -0.19]), 1.3);
=======
  glow(mk(new THREE.CylinderGeometry(0.028, 0.028, 0.072, 8), GREEN_G, pack, [0.08, 0.7175, -0.19]), 0.7);
>>>>>>> REPLACE

<<<<<<< SEARCH
  mk(new THREE.TorusGeometry(0.014, 0.0035, 4, 8), BRASS, pack, [0.225, 0.968, -0.13], { axis: "z", dir: [1, 0, 0] });
=======
  mk(new THREE.TorusGeometry(0.014, 0.0035, 4, 8), BRASS, pack, [0.225, 0.968, -0.13], { axis: "z", dir: [1, 0, 0] });
  mk(new THREE.CylinderGeometry(0.0035, 0.0075, 0.014, 6), BRASS, pack, [0.225, 0.9505, -0.13]);
>>>>>>> REPLACE

<<<<<<< SEARCH
      [0.44, -0.022],
      [0.46, -0.01],
      [0.46, 0.012],
      [0.43, 0.012],
      [0.41, 0],
=======
      [0.38, -0.022],
      [0.4, -0.01],
      [0.4, 0.012],
      [0.37, 0.012],
      [0.35, 0],
>>>>>>> REPLACE

<<<<<<< SEARCH
  const gh = b.surface(base).scatter(34, {
    rng: rng(12),
    minDist: 0.05,
    filter: (h) =>
      Math.hypot(h.at.x, h.at.z) > 0.3 &&
      h.n.y > 0.8 &&
      !(h.at.z > 0.15 && Math.abs(h.at.x) < 0.3) &&
      Math.hypot(h.at.x - 0.22, h.at.z - 0.27) > 0.12 &&
      Math.hypot(h.at.x - 0.28, h.at.z + 0.17) > 0.13,
  });
=======
  const gh = b.surface(base).scatter(18, {
    rng: rng(12),
    minDist: 0.06,
    filter: (h) =>
      Math.hypot(h.at.x, h.at.z) > 0.2 &&
      Math.hypot(h.at.x, h.at.z) < 0.37 &&
      h.n.y > 0.8 &&
      h.at.z < 0.14 &&
      Math.hypot(h.at.x - 0.235, h.at.z + 0.14) > 0.14 &&
      Math.hypot(h.at.x + 0.27, h.at.z - 0.07) > 0.08,
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
  shroom(-0.28, -0.22, 0.1, 0.065, CAPP);
  shroom(-0.36, -0.12, 0.065, 0.04, CAPP);
  shroom(-0.2, -0.3, 0.05, 0.035, "#6fd6ff", true);
=======
  shroom(-0.245, -0.19, 0.1, 0.065, CAPP);
  shroom(-0.31, -0.105, 0.065, 0.04, CAPP);
  shroom(-0.175, -0.26, 0.05, 0.035, "#6fd6ff", true);
>>>>>>> REPLACE

<<<<<<< SEARCH
    const CX = 0.28;
    const CZ = -0.17;
=======
    const CX = 0.235;
    const CZ = -0.14;
>>>>>>> REPLACE

<<<<<<< SEARCH
    [-0.26, 0.22, 16, 0.008],
    [-0.3, 0.1, 11, 0.007],
=======
    [-0.22, 0.2, 16, 0.008],
    [-0.27, 0.07, 11, 0.007],
>>>>>>> REPLACE

<<<<<<< SEARCH
    const bx = 0.22;
    const bz = 0.27;
=======
    const bx = 0.17;
    const bz = 0.22;
>>>>>>> REPLACE