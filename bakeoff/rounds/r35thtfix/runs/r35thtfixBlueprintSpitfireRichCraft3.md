```ts
// Cause: SVG textures were passed as the part color; use a valid tint color and provide each texture through texture:.

// Replace the canopy side planes:
<<<<<<< SEARCH
    b.part(new THREE.PlaneGeometry(0.92, 0.32), CANOPY_WINDOW, {
=======
    b.part(new THREE.PlaneGeometry(0.92, 0.32), WHITE, {
      texture: CANOPY_WINDOW,
>>>>>>> REPLACE

// Replace the windscreen:
<<<<<<< SEARCH
  b.part(new THREE.PlaneGeometry(0.76, 0.32), CANOPY_WINDOW, {
=======
  b.part(new THREE.PlaneGeometry(0.76, 0.32), WHITE, {
    texture: CANOPY_WINDOW,
>>>>>>> REPLACE

// Replace the instrument panel:
<<<<<<< SEARCH
  b.part(new THREE.PlaneGeometry(0.52, 0.27), INSTRUMENTS, {
=======
  b.part(new THREE.PlaneGeometry(0.52, 0.27), WHITE, {
    texture: INSTRUMENTS,
>>>>>>> REPLACE
```