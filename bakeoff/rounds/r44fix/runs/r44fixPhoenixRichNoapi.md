Cause: `mix()` returns an `Rgb` array, and the skull `b.part` call passed it as `color`, which only accepts a colour string or a paint.

<<<<<<< SEARCH
  b.part(new THREE.SphereGeometry(1, 10, 8), mix(CRIM, ORNG, 0.3) as any, { bone: head,
=======
  b.part(new THREE.SphereGeometry(1, 10, 8), "#e94a23", { bone: head,
>>>>>>> REPLACE