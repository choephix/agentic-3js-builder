1. **Shoulders hid the face.** In the three-quarter and low views the near shoulder pad and its spikes covered the jaw. I lowered and widened the pads, spikes and crystals so the head reads clearly.
2. **Eyes were too small.** They are the focal point of a Genshin-style character, so I enlarged the molten eye decals.
3. **Head lacked lava details.** I added glowing cracks on the cheek plates and a molten chin shard so the face reads as lava rock.
4. **Silhouette was a bit bare behind the figure.** I added a floating pyro halo ring with rune nodes behind the golem, a Genshin-style signature that frames the head and flames.
5. **Setting looked thin.** I added glowing lava bits on the platform's front rim to tie it to the sigil.

<<<<<<< SEARCH
    chunk(shJ, "ico", [s * 0.8, 2.42, 0], [0.52, 0.34, 0.5], BASALT, [0, 0, s * -10]);
    chunk(shJ, "ico", [s * 0.82, 2.62, 0], [0.36, 0.22, 0.34], BASALT_P, [0, 20, s * -8]);
=======
    chunk(shJ, "ico", [s * 0.86, 2.32, 0], [0.52, 0.34, 0.5], BASALT, [0, 0, s * -10]);
    chunk(shJ, "ico", [s * 0.88, 2.5, 0], [0.36, 0.22, 0.34], BASALT_P, [0, 20, s * -8]);
>>>>>>> REPLACE
<<<<<<< SEARCH
      b.spike([s * (0.95 + Math.cos(a) * 0.05), 2.5, Math.sin(a) * 0.22], [s * 1, 0.6, Math.sin(a)], 0.26 - Math.abs(k - 1) * 0.04, 0.08, {
=======
      b.spike([s * (1.0 + Math.cos(a) * 0.05), 2.4, Math.sin(a) * 0.22], [s * 1, 0.6, Math.sin(a)], 0.26 - Math.abs(k - 1) * 0.04, 0.08, {
>>>>>>> REPLACE
<<<<<<< SEARCH
    crystal(shJ, [s * 0.76, 2.7, -0.12], [s * 0.25, 1, -0.35], 0.4, 0.13);
    crystal(shJ, [s * 0.86, 2.68, -0.02], [s * 0.5, 1, -0.1], 0.3, 0.1, HOT);
    crystal(shJ, [s * 0.72, 2.7, 0.1], [s * 0.1, 1, 0.3], 0.26, 0.09);
=======
    crystal(shJ, [s * 0.8, 2.56, -0.12], [s * 0.25, 1, -0.35], 0.4, 0.13);
    crystal(shJ, [s * 0.92, 2.54, -0.02], [s * 0.5, 1, -0.1], 0.3, 0.1, HOT);
    crystal(shJ, [s * 0.78, 2.56, 0.1], [s * 0.1, 1, 0.3], 0.26, 0.09);
>>>>>>> REPLACE
<<<<<<< SEARCH
    sign(head, s > 0 ? EYE_L : EYE_R, [s * 0.145, HY + 0.02, HZ + 0.234], [0, 0, 1], [0.25, 0.125], 1.5);
=======
    sign(head, s > 0 ? EYE_L : EYE_R, [s * 0.145, HY + 0.02, HZ + 0.234], [0, 0, 1], [0.29, 0.145], 1.7);
    sign(head, CRACK, [s * 0.356, HY - 0.04, HZ + 0.1], [s, 0, 0], [0.1, 0.24], 1.1);
>>>>>>> REPLACE
<<<<<<< SEARCH
  flame(head, [0, HY + 0.24, HZ - 0.12], -55, 10, 0.2, 0.5);
=======
  flame(head, [0, HY + 0.24, HZ - 0.12], -55, 10, 0.2, 0.5);
  // molten chin shard
  crystal(jaw, [0, HY - 0.36, HZ + 0.32], [0, -1, 0.5], 0.2, 0.1, LAVA_HOT, 1.3);

  // Floating pyro halo behind the golem
  const haloAt: Vec = [0, 2.3, -0.9];
  glow(b.part(new THREE.TorusGeometry(1.0, 0.03, 4, 14), LAVA, { bone: root, at: haloAt, flat: true }), 1.2);
  glow(b.part(new THREE.TorusGeometry(0.86, 0.015, 4, 14), HOT, { bone: root, at: haloAt, flat: true }), 1.2);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const hx = Math.cos(a);
    const hy = Math.sin(a);
    chunk(root, "hex", [hx * 1.0, haloAt[1] + hy * 1.0, haloAt[2]], [0.12, 0.05, 0.12], GOLD, [90, 0, 0]);
    if (i % 2 === 0) orb(root, [hx * 1.0, haloAt[1] + hy * 1.0, haloAt[2]], 0.05, HOT, 1.5);
  }
  // lava glints on the front rim
  for (let i = 0; i < 5; i++) {
    const ang = -0.8 + i * 0.4;
    const [x, z] = polar(ang, 1.46);
    glowBox(root, [x, Y0 + 0.01, z], [0.14, 0.03, 0.06], i % 2 ? LAVA : LAVA_HOT, 1.2, [0, (ang * 180) / Math.PI, 0]);
  }
>>>>>>> REPLACE