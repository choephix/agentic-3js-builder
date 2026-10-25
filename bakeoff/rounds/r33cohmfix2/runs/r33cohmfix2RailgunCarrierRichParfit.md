In `buildTurretMount`, the glacis hazard strip passes the `hazard` texture as the part's `color` (`b.part(geo, hazard, { texture: hazard })`), but `color` only takes a colour string or a paint.

<<<<<<< SEARCH
  b.part(new THREE.BoxGeometry(1.2, 0.08, 0.16), hazard, { bone: T, at: [0, 2.4, 0.15], texture: hazard });
=======
  b.part(new THREE.BoxGeometry(1.2, 0.08, 0.16), "#ffffff", { bone: T, at: [0, 2.4, 0.15], texture: hazard });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.BoxGeometry(0.9, 0.12, 0.02), hazard, { bone: T, at: [0, 2.78, -3.86], texture: hazard });
=======
  b.part(new THREE.BoxGeometry(0.9, 0.12, 0.02), "#ffffff", { bone: T, at: [0, 2.78, -3.86], texture: hazard });
>>>>>>> REPLACE