Cause: `b.extrude` outlines require every point to be marked `"sharp"`, and `ExtrudeOptions` has no `quat`; rotate the outline through its `x` and `y` directions instead.

```text
<<<<<<< SEARCH
  const bladeOutline: [number, number, "sharp"][] = [
    [-0.075, 0],
    [0.075, 0],
    [0.2, 0.5],
    [0.14, 1.2],
    [0.045, 1.58, "sharp"],
    [-0.03, 1.28],
    [-0.12, 0.56],
  ];
=======
  const bladeOutline: [number, number, "sharp"][] = [
    [-0.075, 0, "sharp"],
    [0.075, 0, "sharp"],
    [0.2, 0.5, "sharp"],
    [0.14, 1.2, "sharp"],
    [0.045, 1.58, "sharp"],
    [-0.03, 1.28, "sharp"],
    [-0.12, 0.56, "sharp"],
  ];
>>>>>>> REPLACE
<<<<<<< SEARCH
  for (const angle of [0, 120, 240]) {
    const q = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      (angle * Math.PI) / 180,
    );
    b.extrude(bladeOutline, {
      at: [0, 0.9, 3.48],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.055,
      bevel: 0.012,
      quat: q,
      bone: propeller,
=======
  for (const angle of [0, 120, 240]) {
    const a = (angle * Math.PI) / 180;
    b.extrude(bladeOutline, {
      at: [0, 0.9, 3.48],
      x: [Math.cos(a), Math.sin(a), 0],
      y: [-Math.sin(a), Math.cos(a), 0],
      thickness: 0.055,
      bevel: 0.012,
      bone: propeller,
>>>>>>> REPLACE
```