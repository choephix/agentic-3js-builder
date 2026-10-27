The errors come from passing nullable/unsupported joint objects as `parent` references, and from outline tuples missing the required `"sharp"` marker.

```text
<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: "shoulder",
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: head,
=======
    parent: "head",
>>>>>>> REPLACE

<<<<<<< SEARCH
    const parent = spine.nearestJoint(root);
=======
    const parent = spine.nearestJoint(root) ?? spine.joints[0];
>>>>>>> REPLACE

<<<<<<< SEARCH
        parent,
=======
        parent: parent.name,
>>>>>>> REPLACE

<<<<<<< SEARCH
      [0, 0, "sharp"],
      [0.09, 0.0],
      [0.075, 0.16],
      [0.17, 0.28, "sharp"],
      [0.22, 0.0],
      [0.30, 0.0],
      [0.40, 0.22, "sharp"],
      [0.47, 0.0],
      [0.57, 0.0],
      [0.70, 0.14, "sharp"],
      [0.76, 0.0],
      [0.84, 0.0],
      [0.93, 0.11, "sharp"],
      [1.0, 0.0],
=======
      [0, 0, "sharp"],
      [0.09, 0.0, "sharp"],
      [0.075, 0.16, "sharp"],
      [0.17, 0.28, "sharp"],
      [0.22, 0.0, "sharp"],
      [0.30, 0.0, "sharp"],
      [0.40, 0.22, "sharp"],
      [0.47, 0.0, "sharp"],
      [0.57, 0.0, "sharp"],
      [0.70, 0.14, "sharp"],
      [0.76, 0.0, "sharp"],
      [0.84, 0.0, "sharp"],
      [0.93, 0.11, "sharp"],
      [1.0, 0.0, "sharp"],
>>>>>>> REPLACE
```