```ts
// Cause: ExtrudeOptions supports orientation through its x and y directions, not quat or rotation.

<<<<<<< SEARCH
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.075,
      bevel: 0.012,
      color: C.wood,
      quat: q,
=======
      x: [Math.cos(THREE.MathUtils.degToRad(angle)), Math.sin(THREE.MathUtils.degToRad(angle)), 0],
      y: [-Math.sin(THREE.MathUtils.degToRad(angle)), Math.cos(THREE.MathUtils.degToRad(angle)), 0],
      thickness: 0.075,
      bevel: 0.012,
      color: C.wood,
>>>>>>> REPLACE

<<<<<<< SEARCH
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.005,
      color: C.sail,
      quat: q,
=======
      x: [Math.cos(THREE.MathUtils.degToRad(angle)), Math.sin(THREE.MathUtils.degToRad(angle)), 0],
      y: [-Math.sin(THREE.MathUtils.degToRad(angle)), Math.cos(THREE.MathUtils.degToRad(angle)), 0],
      thickness: 0.018,
      bevel: 0.005,
      color: C.sail,
>>>>>>> REPLACE

<<<<<<< SEARCH
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.006,
      color: C.sail,
      rotation: [0, 0, -12],
=======
      x: [Math.cos(THREE.MathUtils.degToRad(-12)), Math.sin(THREE.MathUtils.degToRad(-12)), 0],
      y: [-Math.sin(THREE.MathUtils.degToRad(-12)), Math.cos(THREE.MathUtils.degToRad(-12)), 0],
      thickness: 0.045,
      bevel: 0.006,
      color: C.sail,
>>>>>>> REPLACE
```