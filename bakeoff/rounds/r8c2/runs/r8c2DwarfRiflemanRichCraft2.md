1. **Eyes were lost under the brow ridge and cheeks.** I enlarged the eye decals and moved them outward. I lowered and slimmed the brow ridge and raised the brows, so the blue irises read from the front and three-quarter views. I also lowered the cheek blobs so they stop covering the lower lids.
2. **The back and sides of the skull were bare skin under the hat.** I added an orange hair cap and sideburn tufts in the beard colours, so the head matches the beard and the side view no longer shows a bald dome.
3. **The helmet floated high on the head like a pith hat.** I lowered it a little (goggles, plume and studs follow, since they are relative to `HY`), so the brim sits at the brow and frames the face.
4. **The left arm splayed out sideways.** I pulled the hand closer to the hip so the arm hangs naturally against the body.
5. **The `EMBLEM` texture was defined but never used.** I put the anvil crest on both ends of the bedroll. It shows in the side view and ties the gear to the tabard.

<<<<<<< SEARCH
  const HY = 1.38;
=======
  const HY = 1.365;
>>>>>>> REPLACE

<<<<<<< SEARCH
    const hand = s === 1 ? P(0.4, 0.6, 0.1) : GRIP.toArray();
=======
    const hand = s === 1 ? P(0.34, 0.6, 0.1) : GRIP.toArray();
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(CREAM, P(0, 1.2, 0.18), [0.07, 0.014, 0.02], jaw);
=======
  box(CREAM, P(0, 1.2, 0.18), [0.07, 0.014, 0.02], jaw);
  // hair cap and sideburn tufts behind and beside the face
  blob(BEARD, P(0, 1.285, -0.045), [0.158, 0.14, 0.115], head, { seg: 9 });
  for (const s of [1, -1]) {
    blob(BEARD_HI, P(s * 0.14, 1.3, -0.06), [0.036, 0.075, 0.07], head, { seg: 6 });
    blob(BEARD, P(s * 0.12, 1.2, -0.04), [0.04, 0.06, 0.06], head, { seg: 6 });
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
    rod(P(s * 0.015, 1.325, 0.2), P(s * 0.14, 1.32, 0.12), 0.034, SKIN, head);
    b.sweep(bezier(P(s * 0.01, 1.338, 0.215), P(s * 0.07, 1.358, 0.21), P(s * 0.135, 1.328, 0.14)), [0.03, 0.01], {
=======
    rod(P(s * 0.015, 1.343, 0.19), P(s * 0.14, 1.335, 0.11), 0.026, SKIN, head);
    b.sweep(bezier(P(s * 0.01, 1.352, 0.205), P(s * 0.07, 1.372, 0.2), P(s * 0.135, 1.342, 0.13)), [0.028, 0.01], {
>>>>>>> REPLACE

<<<<<<< SEARCH
    blob(SKIN, P(s * 0.095, 1.235, 0.14), 0.058, head, { seg: 7, flat: false });
=======
    blob(SKIN, P(s * 0.1, 1.208, 0.13), 0.05, head, { seg: 7, flat: false });
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: P(s * 0.078, 1.277, 0.2),
      dir: [0, 0, 1],
      size: [0.088, 0.062],
=======
      at: P(s * 0.09, 1.274, 0.2),
      dir: [0, 0, 1],
      size: [0.1, 0.072],
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const x of [-0.12, 0.12]) torus(LEATHER_D, P(x, 1.1, -0.2), 0.073, 0.01, [1, 0, 0], chest, 10);
=======
  for (const x of [-0.12, 0.12]) torus(LEATHER_D, P(x, 1.1, -0.2), 0.073, 0.01, [1, 0, 0], chest, 10);
  for (const s of [1, -1])
    b.part(new THREE.CircleGeometry(0.064, 12), "#ffffff", {
      bone: chest,
      at: P(s * 0.214, 1.1, -0.2),
      dir: [s, 0, 0],
      axis: "z",
      texture: EMBLEM,
    });
>>>>>>> REPLACE