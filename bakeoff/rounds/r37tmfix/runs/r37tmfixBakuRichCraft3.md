Cause: `Chain.tip` is nullable, `parent`/`bone` cannot receive `null`, and `extrude` outlines require every tuple to include the `"sharp"` marker.

```text
<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Trunk tip nostrils and a small dark mouth gap.
  for (const s of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.025, 7, 5), BLACK, {
      bone: trunk.tip,
      at: trunk.tip.local([s * 0.045, 0.015, 0.012]),
=======
  // Trunk tip nostrils and a small dark mouth gap.
  const trunkTip = trunk.tip!;
  for (const s of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.025, 7, 5), BLACK, {
      bone: trunkTip,
      at: trunkTip.local([s * 0.045, 0.015, 0.012]),
>>>>>>> REPLACE

<<<<<<< SEARCH
    [0, -0.12],
    [0.09, -0.08],
    [0.12, 0.08],
    [0.075, 0.25],
    [0, 0.3],
    [-0.07, 0.25],
    [-0.12, 0.08],
    [-0.09, -0.08],
=======
    [0, -0.12, "sharp"],
    [0.09, -0.08, "sharp"],
    [0.12, 0.08, "sharp"],
    [0.075, 0.25, "sharp"],
    [0, 0.3, "sharp"],
    [-0.07, 0.25, "sharp"],
    [-0.12, 0.08, "sharp"],
    [-0.09, -0.08, "sharp"],
>>>>>>> REPLACE

<<<<<<< SEARCH
    [-0.28, -0.02],
    [-0.2, 0.08],
    [-0.24, 0.2],
    [-0.11, 0.16],
    [-0.06, 0.31],
    [0, 0.19],
    [0.06, 0.31],
    [0.11, 0.16],
    [0.24, 0.2],
    [0.2, 0.08],
    [0.28, -0.02],
    [0, -0.06],
=======
    [-0.28, -0.02, "sharp"],
    [-0.2, 0.08, "sharp"],
    [-0.24, 0.2, "sharp"],
    [-0.11, 0.16, "sharp"],
    [-0.06, 0.31, "sharp"],
    [0, 0.19, "sharp"],
    [0.06, 0.31, "sharp"],
    [0.11, 0.16, "sharp"],
    [0.24, 0.2, "sharp"],
    [0.2, 0.08, "sharp"],
    [0.28, -0.02, "sharp"],
    [0, -0.06, "sharp"],
>>>>>>> REPLACE