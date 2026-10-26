Cause: nullable chain tips were passed where the SDK requires definite joint references; the ear outline was typed as sharp-only; and `b.surface()` accepts built geometry, not a `Chain`.

```ts
<<<<<<< SEARCH
    parent: body.tip,
=======
    parent: body.joints[body.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.joints[neck.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      [0, 0],
      [0.12, 0.02],
      [0.16, 0.25, "sharp"],
      [0.035, 0.16],
=======
      [0, 0, "sharp"],
      [0.12, 0.02, "sharp"],
      [0.16, 0.25, "sharp"],
      [0.035, 0.16, "sharp"],
>>>>>>> REPLACE

<<<<<<< SEARCH
  const bodySurface = b.surface(body);
=======
  const bodySurface = b.surface(b.root);
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.ConeGeometry(0.12, 0.18, 6), GOLD, {
    bone: tail.tip,
    at: tail.tip.at,
=======
  const tailTip = tail.tip!;
  b.part(new THREE.ConeGeometry(0.12, 0.18, 6), GOLD, {
    bone: tailTip,
    at: tailTip.at,
>>>>>>> REPLACE

<<<<<<< SEARCH
    dir: tail.tip.axis,
=======
    dir: tailTip.axis,
>>>>>>> REPLACE
```