1. **Shards on the back, flanks and neck, which hide the wolf's anatomy.** The mane and flank tufts are wide, dark, flat plates that stand out sideways like armour spikes, and the back view looks like a porcupine. I'm making them shorter and narrower and laying them along the body, backward and flat. They become a layered pelt. The next render should show a smooth grey back with a low mane crest and no spikes in silhouette.
2. **Cheek ruff covering the face.** The cream blades sit on the cheeks and hide the war paint. I'm moving them behind the jaw, reducing them, and removing the stray cream bars on top of the head. The close-up should show an uncluttered face with the eye, paint and muzzle clear.
3. **Lower jaw hanging below the muzzle.** The jaw is a separate tube sitting about 1 cm too low, so the mouth looks gaping and disconnected. I'm raising it to seat against the upper muzzle and lowering the lower fangs to match. The mouth should read as closed and as one head.
4. **Collar floating as a loose arc.** The draped loop bends away from the neck. I'm replacing it with a torus that sits round the neck, with beads on the same circle. It should show as a clean leather ring with beads and the fang and ice pendant.
5. **Banner crossbar touching the muzzle.** I'm moving the banner pole back so the head silhouette is free in the three-quarter view.

## Edits

<<<<<<< SEARCH
  b.sweep(catmull([P(0, 1.05, 0.84), P(0, 1.035, 1.03), P(0, 1.04, 1.2)]), (t) => [0.056 - 0.026 * t, 0.04 - 0.012 * t], {
=======
  b.sweep(catmull([P(0, 1.062, 0.84), P(0, 1.054, 1.03), P(0, 1.062, 1.2)]), (t) => [0.056 - 0.026 * t, 0.04 - 0.012 * t], {
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike(P(s * 0.02, 1.052, 1.185), [0, 1, 0.1], 0.026, 0.008, BONE, { bone: jaw, section: { ngon: 5 } });
=======
    b.spike(P(s * 0.02, 1.07, 1.185), [0, 1, 0.1], 0.026, 0.008, BONE, { bone: jaw, section: { ngon: 5 } });
>>>>>>> REPLACE

<<<<<<< SEARCH
    for (let k = 0; k < 2; k++)
      tuft(P(s * (0.082 + k * 0.012), 1.25 + k * 0.01, 0.79), V(s * 0.1, 0.4, 0.9), V(0, 0, 1), 0.07, 0.03, maneCream, earJ, 0.008);
=======
>>>>>>> REPLACE

<<<<<<< SEARCH
    [
      [85, -25],
      [85, -8],
      [85, 10],
      [68, -16],
      [68, 2],
    ].forEach(([az, el], i) => {
      const h = hs.around(hc).at(s * az, el);
      if (h) tuft(h.moved([0, -0.012, 0]), V(s * 0.4, -0.3 - i * 0.03, -0.85), h.n, 0.11 + (i % 2) * 0.02, 0.06, maneCream, head);
    });
=======
    [
      [112, -25],
      [112, -5],
      [112, 15],
      [128, -15],
    ].forEach(([az, el], i) => {
      const h = hs.around(hc).at(s * az, el);
      if (h) tuft(h.moved([0, -0.012, 0]), V(s * 0.3, -0.3 - i * 0.03, -0.95), h.n, 0.08 + (i % 2) * 0.015, 0.05, maneCream, head);
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const L = 0.1 + 0.05 * Math.min(1, i / 5);
    tuft(h.moved([0, -0.025, 0]), V(0, 0.8, -0.6), h.n, L, 0.13, maneGrey, undefined, 0.012, V(0.3, 0, -1));
    for (const [s] of SIDES)
      tuft(
        h.moved({ left: s * 0.07, down: 0.04 }),
        V(s * 0.45, 0.6, -0.7),
        h.n,
        L * 0.8,
        0.12,
        maneGrey,
        undefined,
        0.012,
        V(s * 0.5, 0, -1),
      );
=======
    const L = 0.085 + 0.04 * Math.min(1, i / 5);
    tuft(h.moved([0, -0.025, 0]), V(0, 0.4, -1), h.n, L, 0.1, maneGrey, undefined, 0.012, V(1, 0, -0.3));
    for (const [s] of SIDES)
      tuft(
        h.moved({ left: s * 0.07, down: 0.04 }),
        V(s * 0.3, 0.15, -1),
        h.n,
        L * 0.7,
        0.09,
        maneGrey,
        undefined,
        0.012,
        V(1, 0.3, 0),
      );
>>>>>>> REPLACE

<<<<<<< SEARCH
    tuft(it, up, out, 0.13, 0.09, front ? maneCream : maneGrey);
=======
    tuft(it, up, out, 0.1, 0.08, front ? maneCream : maneGrey);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const collar = neckSkin.loop(neck.at(0.55), { lift: 0.018 });
  const nj = neck.joints[1];
  b.sweep(collar, 0.017, { color: LEATHER, bone: nj });
  let bead = 0;
  b.along(collar, 14, (at: any) => {
    bead++;
    b.part(new THREE.SphereGeometry(0.015, 6, 4), bead % 3 === 0 ? ICE : bead % 2 ? BONE : "#3a2a20", { at, bone: nj });
  });
=======
  const nj = neck.joints[1];
  const cpt = neck.at(0.55);
  b.part(new THREE.TorusGeometry(0.126, 0.017, 6, 18), LEATHER, { at: cpt.at, dir: cpt.tangent, axis: "z", bone: nj });
  let bead = 0;
  b.ring(cpt, { count: 14, radius: 0.134 }, (it: any) => {
    bead++;
    b.part(new THREE.SphereGeometry(0.015, 6, 4), bead % 3 === 0 ? ICE : bead % 2 ? BONE : "#3a2a20", { at: it, bone: nj });
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const BX = -0.85;
  const BZ = 0.85;
=======
  const BX = -0.95;
  const BZ = 0.62;
>>>>>>> REPLACE