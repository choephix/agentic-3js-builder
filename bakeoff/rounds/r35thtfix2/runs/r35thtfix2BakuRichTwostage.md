Cause: the `as [number, number][][]` cast is followed by an extra `)`, so `.entries()` is parsed outside the expression.

<<<<<<< SEARCH
  for (const [i, [mx, my]] of [
    [-0.092, 0.059],
    [0.081, -0.063],
  ] as [number, number][][]).entries()) {
=======
  for (const [i, [mx, my]] of (
    [
      [-0.092, 0.059],
      [0.081, -0.063],
    ] as [number, number][]).entries()) {
>>>>>>> REPLACE