Cause: `Chain.tip` is nullable and a `Chain` itself is not a valid `SurfaceTarget`; use non-null tip joints and retain the torso `Sweep` for surface queries.

```ts
<<<<<<< SEARCH
      parent: spine.tip,
=======
      parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.sweep(spine, (t) => 0.27 - t * 0.035, {
=======
  const torsoSweep = b.sweep(spine, (t) => 0.27 - t * 0.035, {
>>>>>>> REPLACE

<<<<<<< SEARCH
  const torsoSurface = b.surface(spine);
=======
  const torsoSurface = b.surface(torsoSweep);
>>>>>>> REPLACE
```