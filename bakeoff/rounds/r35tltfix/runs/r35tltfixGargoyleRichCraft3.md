The errors come from nullable chain tips, using `Vector3` values as indexable arrays, passing nullable joints as parents/bones, and passing a plain point to `sprout()` instead of a `Frame`.

```text
<<<<<<< SEARCH
  createBuilder,
  catmull,
=======
  createBuilder,
  catmull,
  frame,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      [s * 0.16, 1.62, 0.31],
      catmull([
=======
      frame([s * 0.16, 1.62, 0.31], [0, 1, 0]),
      catmull([
>>>>>>> REPLACE

<<<<<<< SEARCH
    const foot = chain.tip.at;
=======
    const tip = chain.tip!;
    const foot = tip.at;
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: chain.tip,
=======
      bone: tip,
>>>>>>> REPLACE

<<<<<<< SEARCH
      const x = foot[0] + s * i * 0.045;
=======
      const x = foot.x + s * i * 0.045;
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.spike([x, 0.24, foot[2] + 0.07], [s * i * 0.25, -0.02, 0.97], 0.13, 0.018, {
=======
      b.spike([x, 0.24, foot.z + 0.07], [s * i * 0.25, -0.02, 0.97], 0.13, 0.018, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    const hand = chain.tip.at;
=======
    const tip = chain.tip!;
    const hand = tip.at;
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: chain.tip,
=======
      bone: tip,
>>>>>>> REPLACE

<<<<<<< SEARCH
        [hand[0] + s * i * 0.035, hand[1] - 0.015, hand[2] + 0.045],
=======
        [hand.x + s * i * 0.035, hand.y - 0.015, hand.z + 0.045],
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: tail.tip,
=======
    bone: tail.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.spike(tail.tip.at, [0.35, 0.18, 0.8], 0.22, 0.045, {
=======
  b.spike(tail.tip!.at, [0.35, 0.18, 0.8], 0.22, 0.045, {
>>>>>>> REPLACE
```