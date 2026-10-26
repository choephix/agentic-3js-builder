Cause: nullable `Chain.tip`/joint values were passed where the SDK requires a definite `JointRef`; the conditional leg sweep also produced an invalid overload.

<<<<<<< SEARCH
    { parent: spine.tip, names: ["neck", "neckTop"], role: "neck" },
=======
    { parent: spine.joints[1], names: ["neck", "neckTop"], role: "neck" },
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.joints[1],
>>>>>>> REPLACE

<<<<<<< SEARCH
    { parent: spine.tip, names: ["shoulderL", "elbowL", "wristL", "handL"], role: "arm" },
=======
    { parent: spine.joints[1], names: ["shoulderL", "elbowL", "wristL", "handL"], role: "arm" },
>>>>>>> REPLACE

<<<<<<< SEARCH
    { parent: spine.tip, names: ["shoulderR", "elbowR", "wristR", "handR"], role: "arm" },
=======
    { parent: spine.joints[1], names: ["shoulderR", "elbowR", "wristR", "handR"], role: "arm" },
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(legL.path && s > 0 ? legL : legR, [0.14, 0.105], {
      color: BOOT,
      skin: "rigid",
      section: { ngon: 6 },
    });
=======
    b.sweep(s > 0 ? legL : legR, [0.14, 0.105], {
      color: BOOT,
      skin: "rigid",
      section: { ngon: 6 },
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const a = s > 0 ? armL : armR;
=======
    const a = s > 0 ? armL : armR;
    const hand = a.joints[a.joints.length - 1];
>>>>>>> REPLACE

<<<<<<< SEARCH
        { color: LEATHER_L, bone: a.tip, section: { ngon: 6 } },
=======
        { color: LEATHER_L, bone: hand, section: { ngon: 6 } },
>>>>>>> REPLACE

<<<<<<< SEARCH
    sphere(0.105, a.tip.at, SKIN_LIGHT, a.tip, [1, 0.8, 1.1]);
=======
    sphere(0.105, hand.at, SKIN_LIGHT, hand, [1, 0.8, 1.1]);
>>>>>>> REPLACE

<<<<<<< SEARCH
      const p = a.tip.local([s * (0.045 + i * 0.035), 0.04, 0.02]);
      b.spike(p, [0, 0, 1], 0.075, 0.018, { color: SKIN, bone: a.tip });
=======
      const p = hand.local([s * (0.045 + i * 0.035), 0.04, 0.02]);
      b.spike(p, [0, 0, 1], 0.075, 0.018, { color: SKIN, bone: hand });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const hammerHead = box([0.34, 0.18, 0.16], [-0.37, 0.96, 0.69], IRON_HI, armR.tip);
=======
  const hammerHead = box(
    [0.34, 0.18, 0.16],
    [-0.37, 0.96, 0.69],
    IRON_HI,
    armR.joints[armR.joints.length - 1],
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
    { color: LEATHER_L, bone: armR.tip, section: { ngon: 6 } },
=======
    { color: LEATHER_L, bone: armR.joints[armR.joints.length - 1], section: { ngon: 6 } },
>>>>>>> REPLACE