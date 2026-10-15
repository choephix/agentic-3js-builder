1. **Eyes**: they were pinpricks under the brows, so I enlarged them. The eyes are the face's focal point in the Warcraft look.
2. **Helmet brim**: it was an oversized dish that read as a hat. I narrowed it so the helm has a tighter, sturdier profile.
3. **Knee guards**: they hung forward of the leg like floating pebbles in the side view. I seated them closer so they read as armour on the knee.
4. **Hands**: they were tiny against the huge gauntlet-and-spike silhouette. I made them chunkier, which fits the chunky Warcraft proportions.
5. **Glow and setting**: the plinth was a plain stone slab. I added a ring of glowing orange runes, echoing the glowing runes on the blunderbuss, so the base tells the "dwarven forge magic" story.

<<<<<<< SEARCH
      size: [0.056, 0.039],
=======
      size: [0.07, 0.049],
>>>>>>> REPLACE

<<<<<<< SEARCH
      [0.205, 0.004],
      [0.205, 0.016],
=======
      [0.178, 0.004],
      [0.178, 0.016],
>>>>>>> REPLACE

<<<<<<< SEARCH
    const kneeAt = offset(pts[1], fwdKnee, 0.068);
=======
    const kneeAt = offset(pts[1], fwdKnee, 0.05);
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: offset(pts[1], fwdKnee, 0.098),
=======
      at: offset(pts[1], fwdKnee, 0.08),
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.BoxGeometry(0.082, 0.088, 0.076), GLOVE, { bone: tip, at: a.fist, dir: Dg, up: Ug });
=======
    b.part(new THREE.BoxGeometry(0.1, 0.1, 0.09), GLOVE, { bone: tip, at: a.fist, dir: Dg, up: Ug });
>>>>>>> REPLACE

<<<<<<< SEARCH
  // rocks
=======
  // glowing rune ring on the plinth
  const runeFrames: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.2;
    runeFrames.push(frame([Math.sin(a) * 0.565, 0.072, Math.cos(a) * 0.565], [0, 1, 0]));
  }
  glow(
    b.cards(runeFrames, RUNES, {
      size: [0.17, 0.026],
      lean: 90,
      mirror: true,
      bone: hips,
      flow: (_f: unknown, i: number) => {
        const a = (i / 10) * Math.PI * 2 + 0.2;
        return [Math.sin(a), 0, Math.cos(a)];
      },
    }),
    1.4,
  );

  // rocks
>>>>>>> REPLACE