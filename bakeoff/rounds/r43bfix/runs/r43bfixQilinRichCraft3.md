The `size` option of `b.cards` takes a number or a `[number, number]` tuple, but the tail tuft loop declares `size` as `number[]`, which the compiler rejects. I changed that type to `[number, number]`.

<<<<<<< SEARCH
  for (const [t, size, tilt] of [
    [1, [0.2, 0.6], 55],
    [0.82, [0.16, 0.42], 70],
  ] as [number, number[], number][]) {
=======
  for (const [t, size, tilt] of [
    [1, [0.2, 0.6], 55],
    [0.82, [0.16, 0.42], 70],
  ] as [number, [number, number], number][]) {
>>>>>>> REPLACE