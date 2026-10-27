Cause: the `b.ring` line-frame object requires `THREE.Vector3` values for `at` and `axis`, not number arrays.

```ts
<<<<<<< SEARCH
      { at: [0, y, z], axis: [0, -0.96, -0.28] },
=======
      { at: new THREE.Vector3(0, y, z), axis: new THREE.Vector3(0, -0.96, -0.28) },
>>>>>>> REPLACE
```