Cause: nullable chain tips were passed as bones, `Part` handles were passed where the SDK requires `Object3D`, and outline tuples need explicit `"sharp"` markers.

```ts
<<<<<<< SEARCH
      C.magenta,
      tail.tip,
      "tailFeatherL",
=======
      C.magenta,
      tail.tip!,
      "tailFeatherL",
>>>>>>> REPLACE

<<<<<<< SEARCH
      C.turquoise,
      tail.tip,
      "tailFeatherC",
=======
      C.turquoise,
      tail.tip!,
      "tailFeatherC",
>>>>>>> REPLACE

<<<<<<< SEARCH
      C.gold,
      tail.tip,
      "tailFeatherR",
=======
      C.gold,
      tail.tip!,
      "tailFeatherR",
>>>>>>> REPLACE

<<<<<<< SEARCH
  const bladeSurface = b.surface(blade);
=======
  const bladeSurface = b.surface(blade.mesh);
>>>>>>> REPLACE

<<<<<<< SEARCH
    const faceHit = bladeSurface.nearest(centre);
=======
    const faceHit = bladeSurface.nearest(centre);
>>>>>>> REPLACE

<<<<<<< SEARCH
    const leftEdgeA = bladeSurface.nearest(
=======
    const leftEdgeA = bladeSurface.nearest(
>>>>>>> REPLACE

<<<<<<< SEARCH
    const rightEdgeA = bladeSurface.nearest(
=======
    const rightEdgeA = bladeSurface.nearest(
>>>>>>> REPLACE

<<<<<<< SEARCH
  const raisedHit = (target: THREE.Object3D, point: THREE.Vector3, lift = 0.012) =>
    surfaceAt(target, point).moved([0, lift, 0]);
=======
  const raisedHit = (target: THREE.Object3D, point: THREE.Vector3, lift = 0.012) =>
    surfaceAt(target, point).moved([0, lift, 0]);
>>>>>>> REPLACE

<<<<<<< SEARCH
    const shaftA = raisedHit(blade, lerpPoint(root, tip, 0.08), 0.014);
=======
    const shaftA = raisedHit(blade.mesh, lerpPoint(root, tip, 0.08), 0.014);
>>>>>>> REPLACE

<<<<<<< SEARCH
    const shaftB = raisedHit(blade, lerpPoint(root, tip, 0.94), 0.014);
=======
    const shaftB = raisedHit(blade.mesh, lerpPoint(root, tip, 0.94), 0.014);
>>>>>>> REPLACE

<<<<<<< SEARCH
      const bandHit = raisedHit(blade, bandPoint, 0.012);
=======
      const bandHit = raisedHit(blade.mesh, bandPoint, 0.012);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const featherOutline = (width: number, length: number): [number, number, "sharp"][] => [
    [-width * 0.5, 0],
    [width * 0.5, 0],
    [width * 0.47, length * 0.2],
    [width * 0.35, length * 0.5],
    [width * 0.16, length * 0.78],
    [0, length, "sharp"],
    [-width * 0.16, length * 0.78],
    [-width * 0.35, length * 0.5],
    [-width * 0.47, length * 0.2],
  ];
=======
  const featherOutline = (width: number, length: number): [number, number, "sharp"][] => [
    [-width * 0.5, 0, "sharp"],
    [width * 0.5, 0, "sharp"],
    [width * 0.47, length * 0.2, "sharp"],
    [width * 0.35, length * 0.5, "sharp"],
    [width * 0.16, length * 0.78, "sharp"],
    [0, length, "sharp"],
    [-width * 0.16, length * 0.78, "sharp"],
    [-width * 0.35, length * 0.5, "sharp"],
    [-width * 0.47, length * 0.2, "sharp"],
  ];
>>>>>>> REPLACE

<<<<<<< SEARCH
  const teardropOutline = (width: number, length: number): [number, number, "sharp"][] => [
    [-width * 0.5, 0],
    [width * 0.5, 0],
    [width * 0.42, length * 0.42],
    [0, length, "sharp"],
    [-width * 0.42, length * 0.42],
  ];
=======
  const teardropOutline = (width: number, length: number): [number, number, "sharp"][] => [
    [-width * 0.5, 0, "sharp"],
    [width * 0.5, 0, "sharp"],
    [width * 0.42, length * 0.42, "sharp"],
    [0, length, "sharp"],
    [-width * 0.42, length * 0.42, "sharp"],
  ];
>>>>>>> REPLACE
```