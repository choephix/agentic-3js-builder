1. **Eyes:** they read tiny under the brows and helmet, and the eyes are the face. I enlarged the eye decals about 25% so the blue irises show clearly from the front.
2. **Beard:** the cards look thin and sparse over the beard blobs. I made them broader and longer and added more of them, so the beard reads as a fuller ginger mass with a stronger silhouette.
3. **Shoulders:** the pauldrons are clean blue and steel, with nothing tying them to the snowy setting. I added a snow dusting on each, set at the back of the pad so it doesn't cover the glowing rune gem.
4. **Setting:** the warm and cool balance is all cold blue and white. I added a glowing brass lantern on the crate, a warm light that echoes the amber blunderbuss flint and the beard, and tells a "camp in the snow" story.

<<<<<<< SEARCH
    if (hit) b.decal(skull, EYE, { at: hit, size: [0.072, 0.045], segments: 10, mirror: s < 0 });
=======
    if (hit) b.decal(skull, EYE, { at: hit, size: [0.09, 0.056], segments: 10, mirror: s < 0 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const hits = beardSurf.scatter(90, { rng: rng(5), minDist: 0.035, filter: (h) => h.n.z > -0.1 });
  b.cards(hits, TUFT, {
    size: [0.045, 0.09],
=======
  const hits = beardSurf.scatter(120, { rng: rng(5), minDist: 0.03, filter: (h) => h.n.z > -0.1 });
  b.cards(hits, TUFT, {
    size: [0.062, 0.115],
>>>>>>> REPLACE

<<<<<<< SEARCH
    // forearm bracer
=======
    // snow dusting on the pauldron, toward the back so the rune gem stays visible
    blob(SNOW_P, sh.at.clone().add(V(s * 0.08, 0.148, -0.055)), sh, [0.075, 0.02, 0.07], {
      rotation: [0, 0, tilt],
    });
    blob(SNOW_P, sh.at.clone().add(V(s * 0.1, 0.13, 0.07)), sh, [0.04, 0.014, 0.035], {
      rotation: [0, 0, tilt],
    });
    // forearm bracer
>>>>>>> REPLACE

<<<<<<< SEARCH
  // signpost
=======
  // glowing brass lantern on the crate
  {
    const lc = V(0.3, 0.205, -0.38);
    b.part(new THREE.BoxGeometry(0.056, 0.014, 0.056), BRASS_P, { at: lc.clone().add(V(0, 0.007, 0)), bone: root });
    glow(
      b.part(new THREE.BoxGeometry(0.04, 0.062, 0.04), "#ffb347", { at: lc.clone().add(V(0, 0.045, 0)), bone: root }),
      1.8,
    );
    for (const [x, z] of [
      [-0.021, -0.021],
      [0.021, -0.021],
      [-0.021, 0.021],
      [0.021, 0.021],
    ])
      b.part(new THREE.BoxGeometry(0.006, 0.066, 0.006), BRASS_P, {
        at: lc.clone().add(V(x, 0.045, z)),
        bone: root,
      });
    b.part(new THREE.ConeGeometry(0.043, 0.03, 4), GOLD_P, {
      at: lc.clone().add(V(0, 0.092, 0)),
      rotation: [0, 45, 0],
      bone: root,
      flat: true,
    });
    torus(GOLD_P, 0.018, 0.0035, lc.clone().add(V(0, 0.118, 0)), [1, 0, 0], root);
  }
  // signpost
>>>>>>> REPLACE