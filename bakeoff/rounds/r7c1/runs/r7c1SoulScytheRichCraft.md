1. **Rib cage.** The four bone ribs were 1.2 m tall, flared past the dais edge and read as stray horns. I lowered them, pulled them inward and thinned them so they arch over the dais and cage the haft.
2. **Dais spikes.** The six cone spikes pointed sideways off the front edge and read as loose white cones. They are now eight upright, slightly outward-leaning spikes seated on the dais corners.
3. **Ghost cards.** Nine crossed ghost cards wrapped the haft and hid the banners, which clutters the silhouette and the hero details. I cut them to five, smaller and lower around the dais base. I also removed the wisp that hovered in the skull's face.
4. **Haft.** It was too thin against the huge blade and skull, so I thickened it for a sturdier read.

<<<<<<< SEARCH
  b.ring(frame([0, 0.1, 0], [0, 1, 0]), { count: 6, radius: 0.6, fromDeg: -80, toDeg: 80, tilt: 35 }, (it) =>
    b.spike(it, it, 0.15, 0.035, { color: BONE, bone: root }),
  );
=======
  for (let k = 0; k < 8; k++) {
    const a = ((22.5 + k * 45) * Math.PI) / 180;
    b.spike([Math.sin(a) * 0.6, 0.07, Math.cos(a) * 0.6], [Math.sin(a) * 0.3, 1, Math.cos(a) * 0.3], 0.17, 0.03, {
      color: k % 2 ? BONE_D : BONE,
      bone: root,
    });
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
      catmull([P(0.57, 0.06), P(0.7, 0.3 * h), P(0.66, 0.62 * h), P(0.45, 0.9 * h), P(0.24, 1.02 * h)]),
      [0.05, 0.008],
=======
      catmull([P(0.5, 0.06), P(0.58, 0.3 * h), P(0.52, 0.62 * h), P(0.36, 0.9 * h), P(0.18, 1.0 * h)]),
      [0.042, 0.007],
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.SphereGeometry(0.06, 7, 5), BONE_D, { at: P(0.58, 0.08), bone: root, flat: true });
    b.spike(P(0.69, 0.3 * h), [Math.sin(a) * 0.6, 0.7, Math.cos(a) * 0.6], 0.07, 0.016, { color: BONE, bone: root });
  };
  rib(105, 0.9);
  rib(150, 1.15);
  rib(210, 1.15);
  rib(255, 0.95);
=======
    b.part(new THREE.SphereGeometry(0.052, 7, 5), BONE_D, { at: P(0.5, 0.08), bone: root, flat: true });
    b.spike(P(0.58, 0.3 * h), [Math.sin(a) * 0.6, 0.7, Math.cos(a) * 0.6], 0.07, 0.016, { color: BONE, bone: root });
  };
  rib(105, 0.62);
  rib(150, 0.78);
  rib(210, 0.78);
  rib(255, 0.66);
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.sweep(haft, (t) => 0.036 - 0.004 * t, { color: GRIP, sides: 8 });
=======
  b.sweep(haft, (t) => 0.045 - 0.006 * t, { color: GRIP, sides: 8 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  wisp(-0.55, 2.15, 0.15, 0.7, 1);
=======
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (let i = 0; i < 9; i++) {
    const a = i * 0.9;
    const r = 0.42 + 0.06 * Math.sin(i);
    stream.push(frame([r * Math.sin(a), 0.35 + i * 0.2, r * Math.cos(a)], [0, 1, 0]));
  }
  glow(b.cards(stream, WISP, { size: [0.1, 0.16], lean: 0, flow: [0, 0, 1], cross: true, vary: 0.25, rng: R, bone: root }), 1.1);
=======
  for (let i = 0; i < 5; i++) {
    const a = 0.6 + i * 1.3;
    const r = 0.62 + 0.05 * Math.sin(i);
    stream.push(frame([r * Math.sin(a), 0.3 + i * 0.13, r * Math.cos(a)], [0, 1, 0]));
  }
  glow(b.cards(stream, WISP, { size: [0.08, 0.13], lean: 0, flow: [0, 0, 1], cross: true, vary: 0.2, rng: R, bone: root }), 1.1);
>>>>>>> REPLACE