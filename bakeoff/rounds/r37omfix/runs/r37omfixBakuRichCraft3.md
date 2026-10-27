Cause: nullable chain tips and frames were passed where the SDK requires a definite joint, the ear outline omitted required `"sharp"` markers, and one point argument was inferred too broadly.

```ts
<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.joints[4],
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.joints[2],
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: l.chain.tip,
=======
        bone: l.chain.joints[l.chain.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
          bone: l.chain.tip,
=======
          bone: l.chain.joints[l.chain.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: at.bone,
=======
      bone: head,
>>>>>>> REPLACE

<<<<<<< SEARCH
      [0, 1.19, 1.31],
=======
      [0, 1.19, 1.31] as [number, number, number],
>>>>>>> REPLACE

<<<<<<< SEARCH
    [0, 0],
    [0.15, 0.02],
    [0.19, 0.17],
    [0.12, 0.31, "sharp"],
    [0.025, 0.2],
=======
    [0, 0, "sharp"],
    [0.15, 0.02, "sharp"],
    [0.19, 0.17, "sharp"],
    [0.12, 0.31, "sharp"],
    [0.025, 0.2, "sharp"],
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: l.chain.tip,
=======
        bone: l.chain.joints[l.chain.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: l.chain.tip,
=======
      bone: l.chain.joints[l.chain.joints.length - 1],
>>>>>>> REPLACE
```