The torso sweep's radius argument was a malformed ternary-like expression: `[...].length ? (t) => [...]` has no `:` branch. Replacing it with a plain radius function fixes it.

<<<<<<< SEARCH
  b.sweep(catmull([[0, 0.5, -0.15], [0, 0.6, 0.0], [0, 0.78, 0.14], [0, 0.88, 0.2]]), [0.19, 0.22, 0.2, 0.16].length ? (t: number) => [0.2 - 0.03 * t + 0.04 * Math.sin(t * 3), 0.19], {
=======
  b.sweep(catmull([[0, 0.5, -0.15], [0, 0.6, 0.0], [0, 0.78, 0.14], [0, 0.88, 0.2]]), (t: number): [number, number] => [0.2 - 0.03 * t + 0.04 * Math.sin(t * 3), 0.19], {
>>>>>>> REPLACE