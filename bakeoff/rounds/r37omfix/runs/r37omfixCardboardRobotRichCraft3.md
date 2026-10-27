The errors come from using nullable `.tip` joints as parents and from an outline typed as requiring `"sharp"` markers on every vertex.

```text
<<<<<<< SEARCH
    parent: spine.tip,
    at: [0, 1.57, 0],
=======
    parent: spine,
    at: [0, 1.57, 0],
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: spine.tip,
      names: ["shoulderL", "elbowL", "handL"],
=======
      parent: spine,
      names: ["shoulderL", "elbowL", "handL"],
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: spine.tip,
      names: ["shoulderR", "elbowR", "handR"],
=======
      parent: spine,
      names: ["shoulderR", "elbowR", "handR"],
>>>>>>> REPLACE

<<<<<<< SEARCH
  const tabOutline: [number, number, "sharp"][] = [
    [-0.07, 0],
    [0.07, 0],
    [0.055, 0.1],
    [0, 0.14, "sharp"],
    [-0.055, 0.1],
  ];
=======
  const tabOutline: [number, number, "sharp"][] = [
    [-0.07, 0, "sharp"],
    [0.07, 0, "sharp"],
    [0.055, 0.1, "sharp"],
    [0, 0.14, "sharp"],
    [-0.055, 0.1, "sharp"],
  ];
>>>>>>> REPLACE
```