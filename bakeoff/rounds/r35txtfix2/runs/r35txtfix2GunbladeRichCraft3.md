Cause: `wrappedGrip` passes the painted `DARK_IRON` value alongside `GRIP_TEXTURE`, but textured parts require a string tint.

```text
<<<<<<< SEARCH
  const grip = b.part(
    new THREE.CylinderGeometry(0.098, 0.114, handleLength, 8, 1, false),
    DARK_IRON,
    {
=======
  const grip = b.part(
    new THREE.CylinderGeometry(0.098, 0.114, handleLength, 8, 1, false),
    "#ffffff",
    {
>>>>>>> REPLACE
```