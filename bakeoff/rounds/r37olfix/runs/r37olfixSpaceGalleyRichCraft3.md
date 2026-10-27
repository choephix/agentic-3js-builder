The lights array was typed as `THREE.Object3D[]`, but `b.part()` returns SDK `Part` handles; store them as `Part` values so `glow()` accepts them.

```text
<<<<<<< SEARCH
  const lights: THREE.Object3D[] = [];
=======
  const lights: ReturnType<typeof b.part>[] = [];
>>>>>>> REPLACE
```