The errors come from nullable chain tips being passed where the SDK requires a definite `JointRef`, plus `feather` being cast from two-tuples to sharp outline tuples.

```text
<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: tail.joints[1],
=======
      bone: tail.joints[1]!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: tail.joints[1],
=======
      bone: tail.joints[1]!,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const feather = [
    [-0.075, 0],
    [0.075, 0],
    [0.055, 0.46],
    [0, 0.61],
    [-0.055, 0.46],
  ] as [number, number, "sharp"][];
=======
  const feather: [number, number, "sharp"][] = [
    [-0.075, 0, "sharp"],
    [0.075, 0, "sharp"],
    [0.055, 0.46, "sharp"],
    [0, 0.61, "sharp"],
    [-0.055, 0.46, "sharp"],
  ];
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: legL.tip,
=======
      bone: legL.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: legR.tip,
=======
      bone: legR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: s > 0 ? legL.tip : legR.tip,
=======
      bone: s > 0 ? legL.tip! : legR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: s > 0 ? legL.tip : legR.tip,
=======
      bone: s > 0 ? legL.tip! : legR.tip!,
>>>>>>> REPLACE
```