1. **Face:** The two cheek blobs per side are now one angular `frustumBox` wedge (`hc(s*0.07,-0.005,0.13)` to `hc(s*0.15,-0.07,0.16)`), and the muzzle lobe is a flat upper-lip box. The nose is ~35 mm longer and ~20 mm lower, with a narrow bridge and a broad nostril tip. The chin bead is a flat, forward-set underbite block. `FACEPAINT` is re-projected over skull, cheek wedges, muzzle and nose with a finer grid, and the chin tendrils are re-rooted under the new chin.
2. **Anatomy:** The arm sweep has a fuller upper third and a tapered elbow, and the biceps, forearm and elbow blobs are cut ~15%. Each knee is a flattened `[0.085,0.075,0.065]` kneecap embedded in a thigh that tapers into it. The upper torso is ~8% broader (waist unchanged), and the hump and traps are larger and sunk deeper into it.
3. **Mohawk:** Central blade thickness is 0.095, with outer rows at ±0.045 and a 0.78 height multiplier. There are now six stations: large, overlapping locks at the crown that diminish down the neck.
4. **Necklace and belt fetishes:** The collar is rebuilt on explicit chest and trapezius contact points, with the rear run on the upper back below the mohawk roots and 0.01 lift. Fangs are shifted so their bases enter the cord by ~4 mm, and rear ornaments are beads only. The pendant is on the chest, lower and with two feathers. `beltAt` now offsets along the torso's horizontal normal.
5. **Diorama:** The mud radius is 1.08. Totem is `TS = 0.52` at `[0.72, -0.65]`, cauldron `CS = 0.65` at `[-0.68, -0.58]`, and rune ring 0.68 with glow cut to 0.15. Stones, puddles, mushrooms, bones and reeds are all pulled inside the base.
6. **Fetishes:** Skull is `0.09*k` with a dark recessed socket and a small green centre, and the bone ends at `y - 0.26*k`. Crossbar and extra feather are replaced by one red wrap and two separated feathers, and each fetish has a leather knot with cord tails. Skull teeth drop from 5 to 3.
7. **Paint:** Spot coverage is 0.05 and the back mark 0.3. The head is lighter, with dark eye sockets and nose underside. The pauldron is six warm-brown panels with dark seams and a light leather rim. Mushrooms are muted plum with low glow, and puddles and lily pads are darker.

<<<<<<< SEARCH
const SKIN_BASE = spots(HIDE, "#2a5e4b", { size: 0.09, amount: 0.13, seed: 8 });
=======
const SKIN_BASE = spots(HIDE, "#2a5e4b", { size: 0.09, amount: 0.05, seed: 8 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const c = mix(mix(base0, "#2a5e4b", backMark * 0.6), BELLY.at(p, n), warm * 0.9);
=======
  const c1 = mix(mix(base0, "#2a5e4b", backMark * 0.3), BELLY.at(p, n), warm * 0.9);
  const hm = smoothstep(1.62, 1.68, p.y) * smoothstep(0.42, 0.52, p.z);
  const ed = Math.hypot(Math.abs(p.x) - 0.08, p.y - 1.79, p.z - 0.725);
  const sock = hm * smoothstep(0.085, 0.045, ed);
  const noseU = hm * smoothstep(-0.25, -0.65, n.y) * smoothstep(0.66, 0.72, p.z);
  const c = mix(mix(mix(c1, "#7cc79a", hm * 0.3), "#1d4a3a", sock * 0.75), "#1d4a3a", noseU * 0.6);
>>>>>>> REPLACE

<<<<<<< SEARCH
const LEATHERP = grain("#5a3820", "#7d5230", { size: 0.02, axis: "y", seed: 3 });
=======
const LEATHERP = paint((_p, _n, s) => {
  const h = s[0];
  const deg = ((s[1] % 360) + 360) % 360;
  const d = deg % 60;
  if (h < 0.045) return "#b98c58";
  if (h < 0.056) return "#33200f";
  if (d < 2.5 || d > 57.5) return "#33200f";
  if (h > 0.145) return "#5a3a1e";
  return Math.floor(deg / 60) % 2 ? "#8c5c30" : "#7a4d27";
});
>>>>>>> REPLACE

<<<<<<< SEARCH
    <path d="M32 32 L58.3 22.4 A28 28 0 1 0 58.3 41.6Z" fill="#3f8a3a" stroke="#1f4a22" stroke-width="2"/>
    <path d="M32 32 L10 20 M32 32 L6 36 M32 32 L16 54 M32 32 L38 6" stroke="#6fb54a" stroke-width="1.8"/>
=======
    <path d="M32 32 L58.3 22.4 A28 28 0 1 0 58.3 41.6Z" fill="#3d6a38" stroke="#1c3320" stroke-width="2"/>
    <path d="M32 32 L10 20 M32 32 L6 36 M32 32 L16 54 M32 32 L38 6" stroke="#55873c" stroke-width="1.8"/>
>>>>>>> REPLACE

<<<<<<< SEARCH
    for (const s of [1, -1]) {
      const e = b.part(sphereG(6, 4), o.eye ?? INK, {
        bone,
        at: L(s * 0.2, 0.03, 0.46),
        quat: q,
        scale: [size * 0.13, size * 0.15, size * 0.07],
      });
      if (o.eye) glow(e, 0.6);
    }
=======
    for (const s of [1, -1]) {
      b.part(sphereG(6, 4), INK, {
        bone,
        at: L(s * 0.2, 0.03, 0.455),
        quat: q,
        scale: [size * 0.17, size * 0.19, size * 0.08],
      });
      if (o.eye)
        glow(
          b.part(sphereG(5, 4), o.eye, {
            bone,
            at: L(s * 0.2, 0.03, 0.49),
            quat: q,
            scale: [size * 0.055, size * 0.065, size * 0.03],
          }),
          0.8,
        );
    }
>>>>>>> REPLACE

<<<<<<< SEARCH
    for (let i = 0; i < 5; i++)
      b.part(new THREE.BoxGeometry(size * 0.05, size * 0.08, size * 0.04), BONE_D, {
        bone,
        at: L((i - 2) * 0.075, -0.3, 0.42),
        quat: q,
      });
=======
    for (let i = 0; i < 3; i++)
      b.part(new THREE.BoxGeometry(size * 0.085, size * 0.1, size * 0.05), BONE_D, {
        bone,
        at: L((i - 1) * 0.12, -0.3, 0.43),
        quat: q,
      });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const fetish = (top: V, bone: Joint, k = 1) => {
    const [x, y, z] = top;
    b.rod([x, y, z], [x, y - 0.06 * k, z], 0.006 * k, { color: LEATHER_D, bone });
    skull([x, y - 0.095 * k, z], [0, 0, 1], 0.07 * k, bone, { eye: GLOWG });
    boneRod([x, y - 0.13 * k, z], [x, y - 0.31 * k, z], 0.013 * k, bone);
    boneRod([x - 0.065 * k, y - 0.18 * k, z], [x + 0.065 * k, y - 0.18 * k, z], 0.01 * k, bone);
    b.part(new THREE.TorusGeometry(0.02 * k, 0.006 * k, 5, 8), RED, {
      bone,
      at: [x, y - 0.18 * k, z],
      rotation: [90, 0, 0],
    });
    feathers(
      [[x - 0.035 * k, y - 0.3 * k, z], [x, y - 0.31 * k, z], [x + 0.035 * k, y - 0.3 * k, z]],
      bone,
      [0.06 * k, 0.13 * k],
      [0, 0, 1],
      25,
    );
  };
=======
  const fetish = (top: V, bone: Joint, k = 1) => {
    const [x, y, z] = top;
    // leather knot with two cord tails
    b.part(sphereG(6, 4), LEATHER_D, { bone, at: [x, y, z], scale: [0.026 * k, 0.022 * k, 0.026 * k] });
    b.rod([x, y, z], [x - 0.03 * k, y - 0.045 * k, z], 0.007 * k, { color: LEATHER, bone });
    b.rod([x, y, z], [x + 0.025 * k, y - 0.04 * k, z], 0.007 * k, { color: LEATHER, bone });
    b.rod([x, y, z], [x, y - 0.055 * k, z], 0.008 * k, { color: LEATHER_D, bone });
    skull([x, y - 0.1 * k, z], [0, 0, 1], 0.09 * k, bone, { eye: GLOWG });
    boneRod([x, y - 0.14 * k, z], [x, y - 0.26 * k, z], 0.016 * k, bone);
    b.part(new THREE.TorusGeometry(0.022 * k, 0.008 * k, 5, 8), RED, {
      bone,
      at: [x, y - 0.2 * k, z],
      rotation: [90, 0, 0],
    });
    feathers([[x - 0.04 * k, y - 0.25 * k, z], [x + 0.04 * k, y - 0.25 * k, z]], bone, [0.075 * k, 0.17 * k], [0, 0, 1], 40);
  };
>>>>>>> REPLACE

<<<<<<< SEARCH
  const torso = b.sweep(spine, ramp([[0, 0.2, 0.17], [0.35, 0.19, 0.16], [0.7, 0.3, 0.22], [0.85, 0.33, 0.24], [1, 0.32, 0.23]]), {
=======
  const torso = b.sweep(spine, ramp([[0, 0.2, 0.17], [0.35, 0.19, 0.16], [0.7, 0.324, 0.238], [0.85, 0.356, 0.259], [1, 0.346, 0.248]]), {
>>>>>>> REPLACE

<<<<<<< SEARCH
  const hump = blob(SKIN, chestJ, [0, 1.57, 0.1], [0.3, 0.15, 0.22]);
  const trapL = blob(SKIN, chestJ, [0.2, 1.58, 0.18], [0.17, 0.12, 0.16]);
  const trapR = blob(SKIN, chestJ, [-0.2, 1.58, 0.18], [0.17, 0.12, 0.16]);
=======
  const hump = blob(SKIN, chestJ, [0, 1.55, 0.08], [0.33, 0.19, 0.25]);
  const trapL = blob(SKIN, chestJ, [0.19, 1.55, 0.16], [0.2, 0.14, 0.19]);
  const trapR = blob(SKIN, chestJ, [-0.19, 1.55, 0.16], [0.2, 0.14, 0.19]);
>>>>>>> REPLACE

<<<<<<< SEARCH
    cheeks.push(blob(SKIN, head, hc(s * 0.12, -0.05, 0.1), [0.08, 0.065, 0.08], { flat: true }));
    blob(SKIN, head, hc(s * 0.1, -0.03, 0.17), [0.06, 0.05, 0.06], { flat: true });
=======
    cheeks.push(
      b.frustumBox(hc(s * 0.07, -0.005, 0.13), hc(s * 0.15, -0.07, 0.16), [0.09, 0.05], [0.07, 0.06], {
        color: SKIN,
        bone: head,
      }),
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
    blob("#1d3b30", head, hc(s * 0.02, -0.06, 0.262), [0.012, 0.01, 0.01]);
=======
    blob("#14291f", head, hc(s * 0.032, -0.087, 0.28), [0.014, 0.01, 0.012]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.frustumBox(hc(0, -0.015, 0.07), hc(0, -0.05, 0.2), [0.24, 0.13], [0.17, 0.1], { color: SKIN, bone: head });
  blob(SKIN, head, hc(0, -0.02, 0.2), [0.07, 0.05, 0.05], { flat: true });
  b.sweep(bezier(hc(0, 0.03, 0.17), hc(0, 0.045, 0.26), hc(0, -0.05, 0.24)), [0.048, 0.03], {
    color: SKIN,
    bone: head,
    sides: 6,
  });
=======
  const muzzle = b.frustumBox(hc(0, -0.015, 0.07), hc(0, -0.05, 0.2), [0.24, 0.13], [0.17, 0.1], {
    color: SKIN,
    bone: head,
  });
  b.part(new THREE.BoxGeometry(0.15, 0.05, 0.07), SKIN, { bone: head, at: hc(0, -0.052, 0.2) });
  const nose = b.sweep(
    bezier(hc(0, 0.03, 0.16), hc(0, 0.06, 0.285), hc(0, -0.07, 0.275)),
    (t) => [0.02 + 0.032 * t, 0.034 - 0.01 * t],
    { color: SKIN, bone: head, sides: 6 },
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
  blob(SKIN, jaw, hc(0, -0.165, 0.18), [0.1, 0.05, 0.07]);
=======
  b.part(new THREE.BoxGeometry(0.17, 0.085, 0.1), SKIN, { bone: jaw, at: hc(0, -0.145, 0.225) });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const tp = bezier(hc(s * 0.05, -0.18, 0.17), hc(s * 0.07, -0.27, 0.2), hc(s * 0.055, -0.35, 0.18));
=======
    const tp = bezier(hc(s * 0.05, -0.185, 0.22), hc(s * 0.07, -0.27, 0.235), hc(s * 0.055, -0.35, 0.225));
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.decal([skullP, ...cheeks], FACEPAINT, { at: hc(0, 0.01, 0.19), dir: [0, 0, 1], size: [0.36, 0.21] });
=======
  b.decal([skullP, ...cheeks, muzzle, nose], FACEPAINT, {
    at: hc(0, 0.0, 0.2),
    dir: [0, 0, 1],
    size: [0.34, 0.2],
    segments: 18,
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const stations: Array<[number, number]> = [
    [0.62, 0.8], [0.54, 1.05], [0.46, 1.1], [0.38, 0.7], [0.3, 0.52], [0.22, 0.46], [0.15, 0.42], [0.08, 0.36],
  ];
=======
  const stations: Array<[number, number]> = [[0.6, 1.0], [0.5, 1.25], [0.4, 1.15], [0.3, 0.8], [0.2, 0.58], [0.1, 0.4]];
>>>>>>> REPLACE

<<<<<<< SEARCH
    for (const [dx, kk, tilt] of [[0, 1, 0], [0.032, 0.68, 1], [-0.032, 0.68, -1]]) {
=======
    for (const [dx, kk, tilt] of [[0, 1, 0], [0.045, 0.78, 1], [-0.045, 0.78, -1]]) {
>>>>>>> REPLACE

<<<<<<< SEARCH
        thickness: tilt ? [0.04, 0.01] : [0.065, 0.012],
=======
        thickness: tilt ? [0.055, 0.012] : [0.095, 0.016],
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(arm, [0.12, 0.1, 0.09, 0.075], { color: SKIN });
    blob(SKIN, shJ, arr(pts[0]), 0.15);
    blob(SKIN, shJ, arr(lerp(pts[0], pts[1], 0.45)), [0.115, 0.16, 0.11]);
    blob(SKIN, elJ, arr(lerp(pts[1], pts[2], 0.3)), [0.1, 0.14, 0.095]);
    blob(SKIN, elJ, arr(pts[1]), 0.09);
=======
    b.sweep(arm, [0.135, 0.13, 0.08, 0.085, 0.07], { color: SKIN });
    blob(SKIN, shJ, arr(pts[0]), 0.15);
    blob(SKIN, shJ, arr(lerp(pts[0], pts[1], 0.45)), [0.098, 0.136, 0.094]);
    blob(SKIN, elJ, arr(lerp(pts[1], pts[2], 0.3)), [0.085, 0.119, 0.081]);
    blob(SKIN, elJ, arr(pts[1]), 0.077);
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(leg, [0.15, 0.11, 0.075], { color: SKIN });
    blob(SKIN, hipJ, arr(lerp(pts[0], pts[1], 0.4)), [0.15, 0.2, 0.15]);
    blob(SKIN, kneeJ, arr(pts[1]), 0.1);
    blob(SKIN, kneeJ, arr(lerp(pts[1], pts[2], 0.3).add(new THREE.Vector3(0, 0, -0.04))), [0.085, 0.14, 0.09]);
=======
    b.sweep(leg, [0.15, 0.135, 0.1, 0.092, 0.075], { color: SKIN });
    blob(SKIN, hipJ, arr(lerp(pts[0], pts[1], 0.35)), [0.14, 0.19, 0.14]);
    blob(SKIN, kneeJ, [pts[1].x, pts[1].y, pts[1].z + 0.05], [0.085, 0.075, 0.065]);
    blob(SKIN, kneeJ, arr(lerp(pts[1], pts[2], 0.3).add(new THREE.Vector3(0, 0, -0.04))), [0.072, 0.12, 0.077]);
>>>>>>> REPLACE

<<<<<<< SEARCH
    const q = pos(beltPath.at(beltPath.closestT(target)));
    return [q.x, q.y + 0.008, q.z + 0.02];
=======
    const q = pos(beltPath.at(beltPath.closestT(target)));
    const n = torsoSurf.nearest(q).n;
    const hn = Math.hypot(n.x, n.z) || 1;
    return [q.x + (n.x / hn) * 0.055, q.y - 0.004, q.z + (n.z / hn) * 0.055];
>>>>>>> REPLACE

<<<<<<< SEARCH
  const collarRough = catmull(
    [
      [0, 1.36, 0.5], [0.2, 1.44, 0.45], [0.34, 1.56, 0.3], [0.26, 1.7, 0.18],
      [0, 1.78, 0.1], [-0.26, 1.7, 0.18], [-0.34, 1.56, 0.3], [-0.2, 1.44, 0.45],
    ],
    { closed: true },
  );
  const collar = bodySurf.drape(collarRough, { lift: 0.02 });
  b.sweep(collar, 0.012, { color: LEATHER_D });
  const fang = new THREE.ConeGeometry(0.02, 0.12, 5).translate(0, 0.06, 0);
  let bi = 0;
  b.along(collar, 15, (at) => {
    const k = bi++ % 3;
    if (k === 0) b.part(fang, BONE, { frame: at, dir: [0, -1, 0] });
    else if (k === 1) b.part(sphereG(5, 4), RED, { frame: at, scale: [0.022, 0.022, 0.022] });
    else b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.06, 5), BONE_D, { frame: at, dir: [0, 1, 0.2] });
  });
  const pend = pos(collar.at(0));
  const crownP: V = [pend.x, pend.y - 0.03, pend.z + 0.03];
  skull([pend.x, pend.y - 0.095, pend.z + 0.03], [0, -0.2, 1], 0.12, spine.joints[1], { eye: GLOWG });
  b.rod(arr(pend), crownP, 0.008, { color: LEATHER_D, bone: spine.joints[1] });
  b.part(new THREE.TorusGeometry(0.016, 0.005, 5, 8), LEATHER_D, { bone: spine.joints[1], at: crownP });
  feathers(
    [[pend.x - 0.045, pend.y - 0.13, pend.z + 0.04], [pend.x, pend.y - 0.14, pend.z + 0.04], [pend.x + 0.045, pend.y - 0.13, pend.z + 0.04]],
    spine.joints[1],
    [0.07, 0.15],
    [0, 0, 1],
    25,
  );
=======
  const collarRough = catmull(
    [
      [0, 1.32, 0.5], [0.19, 1.4, 0.46], [0.26, 1.52, 0.34], [0.24, 1.62, 0.14], [0.17, 1.62, -0.08],
      [0, 1.57, -0.17], [-0.17, 1.62, -0.08], [-0.24, 1.62, 0.14], [-0.26, 1.52, 0.34], [-0.19, 1.4, 0.46],
    ],
    { closed: true },
  );
  const collar = bodySurf.drape(collarRough, { lift: 0.01 });
  b.sweep(collar, 0.012, { color: LEATHER_D });
  const fang = new THREE.ConeGeometry(0.02, 0.12, 5).translate(0, 0.068, 0);
  let bi = 0;
  b.along(collar, 15, (at) => {
    const rear = at.at.z < 0.02;
    const k = rear ? 1 + (bi++ % 2) : bi++ % 3;
    if (k === 0) b.part(fang, BONE, { frame: at, dir: [0, -1, 0] });
    else if (k === 1) b.part(sphereG(5, 4), RED, { frame: at, scale: [0.022, 0.022, 0.022] });
    else b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.06, 5), BONE_D, { frame: at, dir: [0, 1, 0.2] });
  });
  const pend = pos(collar.at(0));
  b.part(sphereG(6, 4), LEATHER_D, {
    bone: spine.joints[1],
    at: [pend.x, pend.y - 0.005, pend.z + 0.012],
    scale: [0.02, 0.018, 0.02],
  });
  b.rod([pend.x, pend.y - 0.005, pend.z + 0.012], [pend.x, pend.y - 0.058, pend.z + 0.045], 0.008, {
    color: LEATHER_D,
    bone: spine.joints[1],
  });
  skull([pend.x, pend.y - 0.108, pend.z + 0.048], [0, -0.2, 1], 0.12, spine.joints[1], { eye: GLOWG });
  feathers(
    [[pend.x - 0.04, pend.y - 0.17, pend.z + 0.055], [pend.x + 0.04, pend.y - 0.17, pend.z + 0.055]],
    spine.joints[1],
    [0.07, 0.11],
    [0, 0, 1],
    40,
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
    const r = 1.3 + 0.05 * Math.sin(3 * a + 0.5) + 0.035 * Math.sin(7 * a + 1.2);
=======
    const r = 1.08 + 0.04 * Math.sin(3 * a + 0.5) + 0.03 * Math.sin(7 * a + 1.2);
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.CircleGeometry(0.82, 32), "#ffffff", {
      bone: base,
      at: [0, G + 0.004, 0],
      dir: [0, 1, 0],
      axis: "z",
      texture: RUNES,
    }),
    0.4,
=======
    b.part(new THREE.CircleGeometry(0.68, 32), "#ffffff", {
      bone: base,
      at: [0, G + 0.004, 0],
      dir: [0, 1, 0],
      axis: "z",
      texture: RUNES,
    }),
    0.15,
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.CylinderGeometry(r, r, 0.01, 12), "#1f4a45", { bone: base, at: [x, G + 0.002, z] });
=======
    b.part(new THREE.CylinderGeometry(r, r, 0.01, 12), "#17302d", { bone: base, at: [x, G + 0.002, z] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  puddle(0.62, 0.66, 0.3);
  puddle(-0.62, 0.55, 0.24);
=======
  puddle(0.4, 0.7, 0.2);
  puddle(-0.4, 0.72, 0.2);
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const [x, z, r] of [[1.02, 0.3, 0.12], [-1.0, 0.1, 0.1], [0.3, 1.02, 0.09], [-0.35, 1.0, 0.08], [0.1, -1.05, 0.12]] as number[][])
=======
  for (const [x, z, r] of [[0.92, -0.02, 0.1], [-0.92, -0.15, 0.09], [0.02, 0.97, 0.08], [0.4, -0.85, 0.09], [-0.35, -0.88, 0.07]] as number[][])
>>>>>>> REPLACE

<<<<<<< SEARCH
      color: "#8a46c8",
=======
      color: "#7a5580",
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(cap, 0.9);
=======
    glow(cap, 0.2);
>>>>>>> REPLACE

<<<<<<< SEARCH
  mushroom(0.95, 0.7, 1);
  mushroom(1.02, 0.55, 0.7);
  mushroom(-0.95, 0.5, 1.1);
  mushroom(-0.85, 0.7, 0.7);
=======
  mushroom(0.78, 0.42, 0.9);
  mushroom(0.84, 0.28, 0.6);
  mushroom(-0.8, 0.36, 0.9);
  mushroom(-0.68, 0.55, 0.6);
>>>>>>> REPLACE

<<<<<<< SEARCH
  boneRod([-0.35, G + 0.025, 0.85], [-0.1, G + 0.025, 0.95], 0.016, base);
  boneRod([0.35, G + 0.025, 0.9], [0.55, G + 0.025, 1.0], 0.014, base);
=======
  boneRod([-0.18, G + 0.025, 0.72], [0.05, G + 0.025, 0.78], 0.016, base);
  boneRod([-0.1, G + 0.025, -0.8], [0.15, G + 0.025, -0.9], 0.014, base);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const TS = 0.7;
  const TX = 0.88;
  const TZ = -0.52;
=======
  const TS = 0.52;
  const TX = 0.72;
  const TZ = -0.65;
>>>>>>> REPLACE

<<<<<<< SEARCH
  const CS = 0.8;
  const CX = -0.82;
  const CZ = -0.55;
=======
  const CS = 0.65;
  const CX = -0.68;
  const CZ = -0.58;
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (let i = 0; i < 12; i++) reedFrames.push(frame(polar(148 + i * 6.5, 1.2 + 0.08 * R()), [0, 1, 0]));
  for (const a of [112, 120, 128]) reedFrames.push(frame(polar(a, 1.27 + 0.05 * R()), [0, 1, 0]));
=======
  for (let i = 0; i < 9; i++) reedFrames.push(frame(polar(150 + i * 6.5, 0.97 + 0.06 * R()), [0, 1, 0]));
  for (const a of [100, 108, 116]) reedFrames.push(frame(polar(a, 1.0 + 0.04 * R()), [0, 1, 0]));
>>>>>>> REPLACE