The errors come from using nullable chain `.tip` values as guaranteed joints, passing unsupported `flat` options to sweep helpers, and providing ear-outline points without the required `"sharp"` tuple marker.

```text
<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE
<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.joints[neck.joints.length - 1],
>>>>>>> REPLACE
<<<<<<< SEARCH
    parent: d.z > 0 ? spine.tip : spine.joints[0],
=======
    parent: d.z > 0 ? spine.joints[spine.joints.length - 1] : spine.joints[0],
>>>>>>> REPLACE
<<<<<<< SEARCH
    const tip = leg.tip.at;
=======
    const tipJoint = leg.joints[leg.joints.length - 1];
    const tip = tipJoint.at;
>>>>>>> REPLACE
<<<<<<< SEARCH
    sphere(b, INK, tip, [0.105, 0.07, 0.13], leg.tip, `ink-paw-${i}`);
=======
    sphere(b, INK, tip, [0.105, 0.07, 0.13], tipJoint, `ink-paw-${i}`);
>>>>>>> REPLACE
<<<<<<< SEARCH
      leg.tip,
=======
      tipJoint,
>>>>>>> REPLACE
<<<<<<< SEARCH
        bone: leg.tip,
=======
        bone: tipJoint,
>>>>>>> REPLACE
<<<<<<< SEARCH
    flat: true,
    name: "heavy-indigo-body",
=======
    name: "heavy-indigo-body",
>>>>>>> REPLACE
<<<<<<< SEARCH
    flat: true,
    name: "warm-belly",
=======
    name: "warm-belly",
>>>>>>> REPLACE
<<<<<<< SEARCH
    flat: true,
    name: "indigo-neck",
=======
    name: "indigo-neck",
>>>>>>> REPLACE
<<<<<<< SEARCH
    flat: true,
    caps: { start: "round", end: "round" },
=======
    caps: { start: "round", end: "round" },
>>>>>>> REPLACE
<<<<<<< SEARCH
    flat: true,
    name: `sturdy-leg-${i}`,
=======
    name: `sturdy-leg-${i}`,
>>>>>>> REPLACE
<<<<<<< SEARCH
    flat: true,
    name: "curling-tail",
=======
    name: "curling-tail",
>>>>>>> REPLACE
<<<<<<< SEARCH
    flat: true,
    caps: "point",
=======
    caps: "point",
>>>>>>> REPLACE
<<<<<<< SEARCH
      flat: true,
      caps: "point",
=======
      caps: "point",
>>>>>>> REPLACE
<<<<<<< SEARCH
    [0.13, 0.31, "sharp"],
    [0.1, 0.43, "sharp"],
=======
    [0.13, 0.31, "sharp"],
    [0.1, 0.43, "sharp"],
>>>>>>> REPLACE
<<<<<<< SEARCH
        [0.025, 0.04],
        [0.1, 0.055],
        [0.145, 0.13],
        [0.13, 0.28],
        [0.09, 0.34],
        [0.045, 0.27],
=======
        [0.025, 0.04, "sharp"],
        [0.1, 0.055, "sharp"],
        [0.145, 0.13, "sharp"],
        [0.13, 0.28, "sharp"],
        [0.09, 0.34, "sharp"],
        [0.045, 0.27, "sharp"],
>>>>>>> REPLACE
<<<<<<< SEARCH
    flat: true,
    caps: "point",
    name: "ink-black-mane",
=======
    caps: "point",
    name: "ink-black-mane",
>>>>>>> REPLACE
<<<<<<< SEARCH
      flat: true,
      caps: "point",
      name: "blue-mane-highlight",
=======
      caps: "point",
      name: "blue-mane-highlight",
>>>>>>> REPLACE
<<<<<<< SEARCH
    bone: spine.tip,
=======
    bone: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE
<<<<<<< SEARCH
      bone: spine.tip,
=======
      bone: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE
<<<<<<< SEARCH
    flat: true,
    caps: "point",
    name: "dream-wisp-right",
=======
    caps: "point",
    name: "dream-wisp-right",
>>>>>>> REPLACE
<<<<<<< SEARCH
    flat: true,
    caps: "point",
    name: "dream-wisp-left",
=======
    caps: "point",
    name: "dream-wisp-left",
>>>>>>> REPLACE
<<<<<<< SEARCH
    sphere(b, GOLD, [p.x + 0.065, p.y + 0.02, p.z], [0.026, 0.026, 0.026], spine.joints[1], `mane-bead-${i}`);
=======
    sphere(
      b,
      GOLD,
      [p.x + 0.065, p.y + 0.02, p.z],
      [0.026, 0.026, 0.026],
      spine.joints[1],
      `mane-bead-${i}`,
    );
>>>>>>> REPLACE
```