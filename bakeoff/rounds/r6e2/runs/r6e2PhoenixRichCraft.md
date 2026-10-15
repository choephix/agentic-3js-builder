**What the renders show**

Identity cues for this phoenix: spread flame wings, a long flowing flame tail, and a crested, hooked-beak head.
- **Wings:** visible and in proportion. The feather fans and flame tips read clearly from the front and top views.
- **Tail:** the weakest cue. The ribbons lie flat and horizontal, so they are edge-on in the three-quarter, side and back views and almost vanish. The tail is the signature flame plume and currently does not read.
- **Head:** the beak and crest read, but the skull is small beside the body and the eyes are tiny dots from the front. The neck and chest also fall into a muddy mustard-brown in shadow.

**Changes, in priority order**

1. **Tail plume (identity).** Roll each tail ribbon about its own path (`up`), so the blades stand tilted in a cupped V-fan, with the centre feather vertical. Lift the path into a graceful arch. The next three-quarter and back renders will show a large fanned tail where there is now almost nothing. The top view stays full.
2. **Head and eyes (identity).** The skull is bigger and the eye decal larger. The brow bar, circlet spikes and brow gem are re-seated for the larger skull. The front render will show two clear eyes and a more characterful head.
3. **Body colour (finish).** The body paint moves from `GOLD` to a lighter `GOLD_L`, with a brighter red. The shadow tone is derived from it, so the neck and chest turn glowing amber instead of mud. This is visible in the front and head views.
4. **Braziers (composition).** The four pillars are shorter, with smaller flames. They sit at 1.7 m on the diagonals, clear of the wing undersides and the tail fan. The front render will show the wings unobstructed by pillar flames.

## Edits

<<<<<<< SEARCH
const BODY = cel(furEdge(RED, GOLD, { level: -0.05, teeth: 0.32, period: 0.05, along: [0, 0, 1] }));
=======
const BODY = cel(furEdge("#ee4a1e", GOLD_L, { level: -0.05, teeth: 0.32, period: 0.05, along: [0, 0, 1] }));
>>>>>>> REPLACE

<<<<<<< SEARCH
  if ((h > 0.05 && h < 0.09) || (h > 0.5 && h < 0.56) || h > 0.66) c = GOLD;
=======
  if ((h > 0.05 && h < 0.09) || (h > 0.4 && h < 0.46) || h > 0.53) c = GOLD;
>>>>>>> REPLACE

<<<<<<< SEARCH
const PILLAR_PROFILE: Outline = [
  [0, 0],
  [0.17, 0],
  [0.17, 0.05],
  [0.11, 0.09],
  [0.1, 0.5],
  [0.15, 0.58],
  [0.2, 0.7],
  [0.17, 0.7],
  [0.12, 0.62],
  [0, 0.6],
];
=======
const PILLAR_PROFILE: Outline = [
  [0, 0],
  [0.17, 0],
  [0.17, 0.05],
  [0.11, 0.09],
  [0.1, 0.4],
  [0.15, 0.46],
  [0.2, 0.56],
  [0.17, 0.56],
  [0.12, 0.5],
  [0, 0.48],
];
>>>>>>> REPLACE

<<<<<<< SEARCH
    thick = 0.011,
  ) => {
    const path = bezier(p0, p1, p2, p3);
=======
    thick = 0.011,
    up?: THREE.Vector3,
  ) => {
    const path = bezier(p0, p1, p2, p3);
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(path, (t) => [wid(t), thick], { section: "box", color: ribbonPaint(kind), bone, caps: "flat" });
=======
    b.sweep(path, (t) => [wid(t), thick], { section: "box", color: ribbonPaint(kind), bone, caps: "flat", up });
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone,
        from: 0.1,
        to: 0.8,
        caps: "flat",
      }),
=======
        bone,
        from: 0.1,
        to: 0.8,
        caps: "flat",
        up,
      }),
>>>>>>> REPLACE

<<<<<<< SEARCH
    const P1 = P0.clone().addScaledVector(dir, ell * 0.3).add(V(0, 0.08, 0));
    const P2 = P0.clone().addScaledVector(dir, ell * 0.65).add(V(0, -0.1 - 0.015 * a, 0));
    const P3 = P0.clone().addScaledVector(dir, ell * 0.98).add(V(0, 0.12 - 0.015 * a, 0));
    const path = ribbon(P0, P1, P2, P3, 0.12 - 0.008 * a, tailJ, a % 2 === 0 ? 0 : 1);
=======
    const P1 = P0.clone().addScaledVector(dir, ell * 0.3).add(V(0, 0.3, 0));
    const P2 = P0.clone().addScaledVector(dir, ell * 0.65).add(V(0, 0.24 - 0.025 * a, 0));
    const P3 = P0.clone().addScaledVector(dir, ell * 0.98).add(V(0, 0.02 - 0.04 * a, 0));
    const roll = (85 - 12 * a) * DEG;
    const rUp = a === 0 ? V(1, 0, 0) : V(Math.sign(k) * Math.sin(roll), Math.cos(roll), 0);
    const path = ribbon(P0, P1, P2, P3, 0.13 - 0.008 * a, tailJ, a % 2 === 0 ? 0 : 1, 0.011, rUp);
>>>>>>> REPLACE

<<<<<<< SEARCH
      0.055,
      tailJ,
      1,
      0.01,
    );
=======
      0.055,
      tailJ,
      1,
      0.01,
      V(s * 0.9, 0.45, 0),
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
    scale: [0.15, 0.14, 0.17],
=======
    scale: [0.17, 0.16, 0.19],
>>>>>>> REPLACE

<<<<<<< SEARCH
    if (hit) glow(b.decal(skull, EYE, { at: hit, size: [0.16, 0.12], mirror: s < 0 }), 0.8);
    b.rod(H(0.1, 0.17, s * 0.07), H(0.22, 0.14, s * 0.1), 0.017, { color: "#8c1030", bone: head });
=======
    if (hit) glow(b.decal(skull, EYE, { at: hit, size: [0.19, 0.145], mirror: s < 0 }), 0.8);
    b.rod(H(0.1, 0.2, s * 0.08), H(0.24, 0.17, s * 0.11), 0.017, { color: "#8c1030", bone: head });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike(H(0.12, 0.16, lat), V(lat * 3, 1, 0.25), 0.12, 0.024, { color: GOLDM, bone: head });
  }
  glow(b.part(new THREE.IcosahedronGeometry(0.035, 0), "#ff4a2a", { bone: head, at: H(0.22, 0.12, 0), flat: true }), 1.3);
=======
    b.spike(H(0.12, 0.19, lat), V(lat * 3, 1, 0.25), 0.13, 0.026, { color: GOLDM, bone: head });
  }
  glow(b.part(new THREE.IcosahedronGeometry(0.04, 0), "#ff4a2a", { bone: head, at: H(0.24, 0.15, 0), flat: true }), 1.3);
>>>>>>> REPLACE

<<<<<<< SEARCH
for (const a of [40, 140, 220, 320]) {
    const x = Math.sin(a * DEG) * 1.6;
    const z = Math.cos(a * DEG) * 1.6;
    b.lathe(PILLAR_PROFILE, { at: [x, 0, z], axis: [0, 1, 0], segments: 8, color: PILLAR, bone: stage });
    glow(b.part(new THREE.IcosahedronGeometry(0.1, 0), "#ff9a2e", { bone: stage, at: [x, 0.7, z], flat: true }), 1.2);
    braziers.push(frame([x, 0.72, z], [0, 1, 0]));
  }
=======
for (const a of [50, 130, 230, 310]) {
    const x = Math.sin(a * DEG) * 1.7;
    const z = Math.cos(a * DEG) * 1.7;
    b.lathe(PILLAR_PROFILE, { at: [x, 0, z], axis: [0, 1, 0], segments: 8, color: PILLAR, bone: stage });
    glow(b.part(new THREE.IcosahedronGeometry(0.09, 0), "#ff9a2e", { bone: stage, at: [x, 0.55, z], flat: true }), 1.2);
    braziers.push(frame([x, 0.57, z], [0, 1, 0]));
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.cards(braziers, [FLAME, FLAME2], { size: [0.26, 0.5], vary: 0.2, bend: 10, cross: true, rng: R, bone: stage }),
=======
    b.cards(braziers, [FLAME, FLAME2], { size: [0.2, 0.38], vary: 0.2, bend: 10, cross: true, rng: R, bone: stage }),
>>>>>>> REPLACE