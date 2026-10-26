Cause: the helper parameters use `ColorInput` while the builder expects `Fill`, `neck.tip` may be null, and the relic outline requires explicitly sharp corners.

```text
<<<<<<< SEARCH
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
=======
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color as Fill, {
>>>>>>> REPLACE
<<<<<<< SEARCH
  return b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
=======
  return b.part(new THREE.SphereGeometry(radius, 8, 6), color as Fill, {
>>>>>>> REPLACE
<<<<<<< SEARCH
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
=======
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color as Fill, {
>>>>>>> REPLACE
<<<<<<< SEARCH
      parent: neck.tip,
=======
      parent: neck.tip ?? undefined,
>>>>>>> REPLACE
<<<<<<< SEARCH
      [-0.065, -0.085],
      [0.065, -0.085],
      [0.085, 0],
      [0.045, 0.085],
      [-0.045, 0.085],
      [-0.085, 0],
=======
      [-0.065, -0.085, "sharp"],
      [0.065, -0.085, "sharp"],
      [0.085, 0, "sharp"],
      [0.045, 0.085, "sharp"],
      [-0.045, 0.085, "sharp"],
      [-0.085, 0, "sharp"],
>>>>>>> REPLACE
```