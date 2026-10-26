The errors come from nullable `Chain.tip` values being passed where the SDK requires a definite joint, plus a few calls using callback/options shapes that do not match the SDK overloads.

```ts
<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.joints[neck.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: jaw,
=======
    parent: jaw,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: hips,
    names: ["tailBase", "tailMid", "tailTip", "tailEnd"],
=======
    parent: hips,
    names: ["tailBase", "tailMid", "tailTip", "tailEnd"],
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike(
      [x, toeBaseY, toeZ],
      [0, -0.06, 1],
      0.105,
      0.026,
      {
        bone,
=======
    b.spike(
      [x, toeBaseY, toeZ],
      [0, -0.06, 1],
      0.105,
      0.026,
      {
        bone: bone ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
  addHoof(hindFootL, hindL.tip, 1, "hind_L");
  addHoof(hindFootR, hindR.tip, -1, "hind_R");
  addHoof(foreFootL, foreL.tip, 1, "fore_L");
  addHoof(foreFootR, foreR.tip, -1, "fore_R");
=======
  addHoof(hindFootL, hindL.joints[hindL.joints.length - 1], 1, "hind_L");
  addHoof(hindFootR, hindR.joints[hindR.joints.length - 1], -1, "hind_R");
  addHoof(foreFootL, foreL.joints[foreL.joints.length - 1], 1, "fore_L");
  addHoof(foreFootR, foreR.joints[foreR.joints.length - 1], -1, "fore_R");
>>>>>>> REPLACE

<<<<<<< SEARCH
  const topRidge = b.along(body, 7, (at, i) => {
    const height = i % 2 === 0 ? 0.13 : 0.095;
    b.spike(at, at, height, 0.035, {
      color: INDIGO_LIGHT,
      caps: "point",
      group: "mane",
      name: `mane_ridge_${i}`,
    });
  });
=======
  b.along(body, 7, (at) => {
    b.spike(at, at, 0.115, 0.035, {
      color: INDIGO_LIGHT,
      group: "mane",
      name: "mane_ridge",
    });
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: whiskerBone,
        color: INK,
        caps: "round",
=======
        bone: whiskerBone ?? undefined,
        color: INK,
        caps: "round",
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: whiskerBone,
        color: INK,
        caps: "round",
=======
        bone: whiskerBone ?? undefined,
        color: INK,
        caps: "round",
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: whiskerBone,
        color: INK,
        caps: "round",
=======
        bone: whiskerBone ?? undefined,
        color: INK,
        caps: "round",
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: upperJaw.tip,
=======
    bone: upperJaw.joints[upperJaw.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: tail.tip,
=======
    parent: tail.joints[tail.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: lowerJaw.tip,
=======
      bone: lowerJaw.joints[lowerJaw.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: chain.tip,
=======
      bone: chain.joints[chain.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: tail.tip,
=======
      bone: tail.joints[tail.joints.length - 1],
>>>>>>> REPLACE
```