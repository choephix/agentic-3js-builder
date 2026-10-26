The first error passes nullable `spine.tip` as a joint parent; the second passes a `Chain` where `b.surface` requires built geometry such as a `Sweep`.

```ts
<<<<<<< SEARCH
  const head = b.joint("head", {
    parent: spine.tip,
=======
  const head = b.joint("head", {
    parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.sweep(tail, (t: number) => 0.13 * (1 - t) + 0.018, {
=======
  const tailTube = b.sweep(tail, (t: number) => 0.13 * (1 - t) + 0.018, {
>>>>>>> REPLACE

<<<<<<< SEARCH
  const bodySurface = b.surface([body, tail]);
=======
  const bodySurface = b.surface([body, tailTube]);
>>>>>>> REPLACE
```