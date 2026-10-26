Cause: `C.counter` is not defined, and the `label` helper incorrectly requires a 3D `V3` even though labels use 2D `[width, height]` sizes.

```text
<<<<<<< SEARCH
    size: V3,
    background = C.black,
=======
    size: readonly [number, number],
    background = C.black,
>>>>>>> REPLACE

<<<<<<< SEARCH
  box([3.18, 0.15, 0.78], [0, 1.095, -0.05], C.counter, {
=======
  box([3.18, 0.15, 0.78], [0, 1.095, -0.05], C.panel, {
>>>>>>> REPLACE
```