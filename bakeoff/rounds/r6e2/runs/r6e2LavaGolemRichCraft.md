1. **Identity and form (front and head close-up).** The three cues are the molten seams, the glowing eyes and the Pyro emblem.
   - The molten seams read in the arms, legs and belly, but the basalt is so dark that the plates merge into one silhouette.
   - The Pyro emblem reads well on the chest, back and belt.
   - The head is the weak cue. It is a small, dark box under the huge pauldrons, so the eyes are thin slits that vanish in the shadow. I rebuild the whole head at 1.4× through one scale constant `HK` and one placement helper (`hq`/`hb`). Cranium, visor, brows, cheeks, jaw, teeth, tusk, horns and crown flames all scale together, and the eyes become much bigger. The forehead emblem was buried under the gold band, so I drop it. Check the front and head views: a head that fills the space between the pauldrons, with two clear eye glows.
2. **Soundness (top and back).** The pauldron stacks tower over the head and hide it in the three-quarter and top views. I lower them and their spikes and flames. The halo moves up to sit behind the larger head, so the back view shows a ring framing the skull rather than cutting through the cranium.
3. **Composition.** The stage and props already fit the footprint and stay clear of the face, so I leave them. The head scale-up also gives the model a stronger silhouette in the front view.
4. **Finish.** The basalt is lightened into cool lavender-grey and the obsidian is lifted slightly. In the three-quarter and front views the plates now separate from one another and from the warm lava, which is closer to the Genshin look of cool stone against warm glow.

<<<<<<< SEARCH
  const stoneBase = patches("#231e2b", ["#4a4559", "#55506a", "#3f3a4f", "#4c4a63"], { size: 0.17, gap: 0.07, seed: 3 });
=======
  const stoneBase = patches("#332e44", ["#6a6486", "#766f95", "#5d5879", "#6e6b90"], { size: 0.17, gap: 0.07, seed: 3 });
>>>>>>> REPLACE

<<<<<<< SEARCH
      const c = patches("#1d1925", ["#38334a", "#403a55", "#2f2b3e"], { size: 0.13, gap: 0.08, seed: 9 }).at(p, n);
=======
      const c = patches("#2a2538", ["#4e4868", "#575175", "#433e5b"], { size: 0.13, gap: 0.08, seed: 9 }).at(p, n);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const OBS = cel("#2a2540", "#15122a");
=======
  const OBS = cel("#3a3358", "#1e1a38");
>>>>>>> REPLACE

<<<<<<< SEARCH
  const HC = [0, 2.55, -0.9];
=======
  const HC = [0, 2.75, -0.9];
>>>>>>> REPLACE

<<<<<<< SEARCH
  // ------------------------------------------------------------------ head
  blk(head, [0, 2.76, 0.3], [0.62, 0.38, 0.56], [0, 0, 0], BASALT);
  blk(head, [0, 2.775, 0.585], [0.58, 0.21, 0.04], [0, 0, 0], OBS);
  blk(head, [0, 2.97, 0.28], [0.34, 0.08, 0.42], [0, 0, 0], BASALT2);
  blk(head, [0, 2.935, 0.5], [0.66, 0.035, 0.2], [0, 0, 0], GOLD);
  blk(head, [0, 2.62, 0.08], [0.5, 0.2, 0.12], [0, 0, 0], BASALT2);
  glow(b.part(box(0.42, 0.06, 0.42), HOT, { bone: head, at: [0, 2.55, 0.36] }), 1.2);
  lit(EMBLEM, 0.11, 0.11, head, [0, 2.88, 0.589], [0, 0, 1], [0, 1, 0], 1.2);
  for (const s of [1, -1]) {
    blk(head, [s * 0.35, 2.72, 0.33], [0.1, 0.3, 0.42], [0, 0, 0], BASALT2);
    blk(head, [s * 0.2, 2.9, 0.56], [0.22, 0.07, 0.1], [0, 0, s * 14], OBS);
    lit(s > 0 ? EYE_A : EYE_B, 0.27, 0.14, head, [s * 0.15, 2.775, 0.609], [0, 0, 1], [-s * 0.35, 1, 0], 2.2);
    // horns
    const hb = [s * 0.3, 2.9, 0.3];
    const hp = bezier(hb, [s * 0.6, 3.02, 0.1], [s * 0.66, 3.34, -0.2]);
    b.sweep(hp, [0.08, 0], { bone: head, color: OBS, caps: { start: "flat", end: "point" }, sides: 6 });
    b.part(new THREE.TorusGeometry(0.085, 0.022, 4, 6), GOLD, {
      bone: head,
      at: hp.at(0.14),
      dir: hp.tangentAt(0.14),
      axis: "z",
    });
    glow(b.part(new THREE.OctahedronGeometry(0.04, 0), "#ffb52e", { bone: head, at: hp.at(0.93), flat: true }), 1.4);
  }
  flames(head, [[0, 3.0, 0.12], [0, 3.0, 0.24], [0, 3.0, 0.36], [-0.12, 2.99, 0.2], [0.12, 2.99, 0.2], [-0.1, 2.99, 0.34], [0.1, 2.99, 0.34]], [0.15, 0.4], [0, 0, -1], 28, 25);
  // teeth and jaw
  [-0.18, -0.06, 0.06, 0.18].forEach((x) =>
    b.spike([x, 2.575, 0.56], [0, -1, 0], 0.09, 0.032, { bone: head, color: TEETH, sides: 5 }),
  );
  blk(jaw, [0, 2.48, 0.34], [0.5, 0.1, 0.46], [0, 0, 0], BASALT2);
  blk(jaw, [0, 2.45, 0.58], [0.4, 0.14, 0.1], [0, 0, 0], BASALT);
  blk(jaw, [0, 2.4, 0.6], [0.3, 0.05, 0.12], [0, 0, 0], GOLD);
  for (const s of [1, -1]) {
    b.spike([s * 0.2, 2.5, 0.52], [s * 0.1, 1, 0.1], 0.26, 0.05, { bone: jaw, color: TEETH, sides: 6 });
    b.spike([s * 0.08, 2.52, 0.58], [0, 1, 0.05], 0.1, 0.03, { bone: jaw, color: TEETH, sides: 5 });
    blk(jaw, [s * 0.27, 2.47, 0.3], [0.06, 0.14, 0.4], [0, 0, 0], BASALT);
  }
  b.spike([0, 2.4, 0.64], [0, -0.6, 1], 0.18, 0.055, { bone: jaw, color: OBS, sides: 6 });
=======
  // ------------------------------------------------------------------ head (one scale constant)
  const HK = 1.4;
  const HP = [0, 2.6, 0.22];
  const hq = (x: number, y: number, z: number) => [x * HK, HP[1] + (y - HP[1]) * HK, HP[2] + (z - HP[2]) * HK];
  const hb = (bone: any, x: number, y: number, z: number, w: number, h: number, d: number, color: any, rot: number[] = [0, 0, 0]) =>
    b.part(box(w * HK, h * HK, d * HK), color, { bone, at: hq(x, y, z), rotation: rot });
  hb(head, 0, 2.76, 0.3, 0.62, 0.38, 0.56, BASALT);
  hb(head, 0, 2.775, 0.585, 0.58, 0.21, 0.04, OBS);
  hb(head, 0, 2.97, 0.28, 0.34, 0.08, 0.42, BASALT2);
  hb(head, 0, 2.935, 0.5, 0.66, 0.035, 0.2, GOLD);
  hb(head, 0, 2.62, 0.08, 0.5, 0.2, 0.12, BASALT2);
  glow(b.part(box(0.42 * HK, 0.06 * HK, 0.42 * HK), HOT, { bone: head, at: hq(0, 2.55, 0.36) }), 1.2);
  for (const s of [1, -1]) {
    hb(head, s * 0.35, 2.72, 0.33, 0.1, 0.3, 0.42, BASALT2);
    hb(head, s * 0.2, 2.9, 0.56, 0.22, 0.07, 0.1, OBS, [0, 0, s * 14]);
    lit(s > 0 ? EYE_A : EYE_B, 0.4, 0.21, head, hq(s * 0.15, 2.775, 0.612), [0, 0, 1], [-s * 0.35, 1, 0], 2.4);
    // horns
    const hp = bezier(hq(s * 0.3, 2.9, 0.3), hq(s * 0.58, 3.0, 0.2), hq(s * 0.6, 3.32, 0.0));
    b.sweep(hp, [0.1, 0], { bone: head, color: OBS, caps: { start: "flat", end: "point" }, sides: 6 });
    b.part(new THREE.TorusGeometry(0.11, 0.028, 4, 6), GOLD, {
      bone: head,
      at: hp.at(0.14),
      dir: hp.tangentAt(0.14),
      axis: "z",
    });
    glow(b.part(new THREE.OctahedronGeometry(0.05, 0), "#ffb52e", { bone: head, at: hp.at(0.93), flat: true }), 1.4);
  }
  flames(
    head,
    [[0, 3.0, 0.12], [0, 3.0, 0.24], [0, 3.0, 0.36], [-0.12, 2.99, 0.2], [0.12, 2.99, 0.2], [-0.1, 2.99, 0.34], [0.1, 2.99, 0.34]].map((p) => hq(p[0], p[1], p[2])),
    [0.2, 0.52],
    [0, 0, -1],
    28,
    25,
  );
  // teeth and jaw
  [-0.18, -0.06, 0.06, 0.18].forEach((x) =>
    b.spike(hq(x, 2.575, 0.56), [0, -1, 0], 0.09 * HK, 0.032 * HK, { bone: head, color: TEETH, sides: 5 }),
  );
  hb(jaw, 0, 2.48, 0.34, 0.5, 0.1, 0.46, BASALT2);
  hb(jaw, 0, 2.45, 0.58, 0.4, 0.14, 0.1, BASALT);
  hb(jaw, 0, 2.4, 0.6, 0.3, 0.05, 0.12, GOLD);
  for (const s of [1, -1]) {
    b.spike(hq(s * 0.2, 2.5, 0.52), [s * 0.1, 1, 0.1], 0.26 * HK, 0.05 * HK, { bone: jaw, color: TEETH, sides: 6 });
    b.spike(hq(s * 0.08, 2.52, 0.58), [0, 1, 0.05], 0.1 * HK, 0.03 * HK, { bone: jaw, color: TEETH, sides: 5 });
    hb(jaw, s * 0.27, 2.47, 0.3, 0.06, 0.14, 0.4, BASALT);
  }
  b.spike(hq(0, 2.4, 0.64), [0, -0.6, 1], 0.18 * HK, 0.055 * HK, { bone: jaw, color: OBS, sides: 6 });
>>>>>>> REPLACE

<<<<<<< SEARCH
      [0.66, 0.16, 0.74, 2.28, 0.9, 14],
      [0.5, 0.13, 0.58, 2.4, 0.94, 20],
      [0.34, 0.12, 0.42, 2.5, 0.97, 26],
=======
      [0.66, 0.16, 0.74, 2.2, 0.9, 14],
      [0.5, 0.13, 0.58, 2.3, 0.94, 20],
      [0.34, 0.12, 0.42, 2.38, 0.97, 26],
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.spike([s * 0.98, 2.57, z], [s * 0.35, 1, 0], 0.22, 0.055, { bone: sh, color: OBS, sides: 6 }),
    );
    flames(sh, [[s * 0.98, 2.6, -0.05], [s * 0.98, 2.6, 0.13]], [0.12, 0.28], [0, 0, -1], 25, 20);
=======
      b.spike([s * 0.98, 2.45, z], [s * 0.35, 1, 0], 0.22, 0.055, { bone: sh, color: OBS, sides: 6 }),
    );
    flames(sh, [[s * 0.98, 2.48, -0.05], [s * 0.98, 2.48, 0.13]], [0.12, 0.28], [0, 0, -1], 25, 20);
>>>>>>> REPLACE