Cause: chain tips are nullable, joint parents require non-null `JointRef`s, and `b.surface()` accepts the built sweep—not a `Chain`.

```ts
<<<<<<< SEARCH
  const neck = b.chain("neck", neckPath, {
    parent: spine.tip,
=======
  const neck = b.chain("neck", neckPath, {
    parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    spine.tip,
=======
    spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.sweep(spine, [0.30, 0.36, 0.28, 0.22], {
=======
  const spineSweep = b.sweep(spine, [0.30, 0.36, 0.28, 0.22], {
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.decal(b.surface(spine), rosette, {
=======
    b.decal(b.surface(spineSweep), rosette, {
>>>>>>> REPLACE
```