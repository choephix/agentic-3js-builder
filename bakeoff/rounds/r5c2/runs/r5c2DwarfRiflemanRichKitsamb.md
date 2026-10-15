1. **Pine overhang:** the pine sat on the plinth's rim and its cones hung over the edge. I moved it inward, shrank the cones, added a fourth tier and gave it a mottled green paint.
2. **Knee guards:** they read as loose grey pebbles. I added a gilt spike on each knee to match the shoulder spikes and give the Warcraft armour feel.
3. **Face:** the eyes are lost behind the beard and moustache. I enlarged them slightly so the face reads from a distance.
4. **Helmet:** there is no focal accent. I added a glowing blue gem on the brow band.
5. **Blunderbuss:** the muzzle is a flat black hole. I added a hot glowing ember core in the bore, so the gun reads as loaded.
6. **Plinth runes:** they were tiny and barely visible, and overhung the rim. I made them bigger and brighter, and moved them inward onto the stone.
7. **Setting:** I added a cluster of glowing blue crystals beside the rocks, so the base has a magical light source that echoes the helmet gem.

<<<<<<< SEARCH
      size: [0.07, 0.049],
=======
      size: [0.085, 0.06],
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.SphereGeometry(0.014, 5, 3), GILT, {
      bone: leg.joints[1],
      at: offset(pts[1], fwdKnee, 0.08),
    });
=======
    b.part(new THREE.SphereGeometry(0.014, 5, 3), GILT, {
      bone: leg.joints[1],
      at: offset(pts[1], fwdKnee, 0.08),
    });
    b.spike(offset(pts[1], fwdKnee, 0.07), fwdKnee, 0.05, 0.014, {
      color: GILT,
      bone: leg.joints[1],
      sides: 5,
      smooth: false,
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.SphereGeometry(0.016, 5, 3), GILT, { bone: head, at: H({ up: 0.28, forward: 0.0 }) });
=======
  b.part(new THREE.SphereGeometry(0.016, 5, 3), GILT, { bone: head, at: H({ up: 0.28, forward: 0.0 }) });
  glow(
    b.part(new THREE.OctahedronGeometry(0.02, 0), "#4fc3ff", {
      bone: head,
      at: H({ up: 0.178, forward: 0.158 }),
      scale: [1, 1.2, 0.7],
      flat: true,
    }),
    1.8,
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.CircleGeometry(0.055, 10), DARK, { bone: GB, at: gp(0.7425, 0.0265), dir: Dg, axis: "z" });
=======
  b.part(new THREE.CircleGeometry(0.055, 10), DARK, { bone: GB, at: gp(0.7425, 0.0265), dir: Dg, axis: "z" });
  glow(
    b.part(new THREE.CircleGeometry(0.03, 8), "#ff6a1a", { bone: GB, at: gp(0.7435, 0.0265), dir: Dg, axis: "z" }),
    2,
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
    runeFrames.push(frame([Math.sin(a) * 0.565, 0.072, Math.cos(a) * 0.565], [0, 1, 0]));
=======
    runeFrames.push(frame([Math.sin(a) * 0.52, 0.072, Math.cos(a) * 0.52], [0, 1, 0]));
>>>>>>> REPLACE

<<<<<<< SEARCH
      size: [0.17, 0.026],
=======
      size: [0.24, 0.05],
>>>>>>> REPLACE

<<<<<<< SEARCH
    1.4,
=======
    2.2,
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.CylinderGeometry(0.025, 0.035, 0.2, 6), LEATHER_D, { bone: hips, at: P(-0.46, 0.1, -0.35) });
  for (let i = 0; i < 3; i++) {
    const r = 0.17 - i * 0.04;
    b.part(new THREE.ConeGeometry(r, 0.24, 7), "#2f5d3a", { bone: hips, at: P(-0.46, 0.2 + i * 0.13, -0.35), flat: true });
    b.part(new THREE.ConeGeometry(r * 0.75, 0.12, 7), SNOW, { bone: hips, at: P(-0.46, 0.25 + i * 0.13, -0.35), flat: true });
  }
=======
  const PINE = mottle("#27562f", "#3b7b45", { size: 0.06, seed: 51 });
  b.part(new THREE.CylinderGeometry(0.025, 0.035, 0.2, 6), LEATHER_D, { bone: hips, at: P(-0.28, 0.1, -0.36) });
  for (let i = 0; i < 4; i++) {
    const r = 0.14 - i * 0.03;
    b.part(new THREE.ConeGeometry(r, 0.2, 7), PINE, { bone: hips, at: P(-0.28, 0.18 + i * 0.11, -0.36), flat: true });
    b.part(new THREE.ConeGeometry(r * 0.75, 0.1, 7), SNOW, { bone: hips, at: P(-0.28, 0.22 + i * 0.11, -0.36), flat: true });
  }
  // glowing crystals by the rocks
  for (const [cx, cz, ch] of [
    [0.3, -0.36, 0.15],
    [0.38, -0.29, 0.09],
    [-0.1, -0.5, 0.11],
  ] as [number, number, number][]) {
    glow(
      b.part(new THREE.ConeGeometry(0.035, ch, 5), "#4fb6ff", { bone: hips, at: P(cx, ch / 2, cz), flat: true }),
      1.8,
    );
  }
>>>>>>> REPLACE