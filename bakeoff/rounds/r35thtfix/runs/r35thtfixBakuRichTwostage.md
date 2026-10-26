```ts
// Cause: the registration-mark loop destructured array values as indexed entries, and `flat` is not a valid ExtrudeOptions property.

<<<<<<< SEARCH
  for (const [i, [mx, my]] of [
    [-0.092, 0.059],
    [0.081, -0.063],
  ] as [number, number][]) {
=======
  for (const [i, [mx, my]] of [
    [-0.092, 0.059],
    [0.081, -0.063],
  ] as [number, number][][]).entries()) {
>>>>>>> REPLACE

<<<<<<< SEARCH
      flat: true,
      name: "s21ForeheadSealOutline",
=======
      name: "s21ForeheadSealOutline",
>>>>>>> REPLACE

<<<<<<< SEARCH
      flat: true,
      name: "s21ForeheadSealRed",
=======
      name: "s21ForeheadSealRed",
>>>>>>> REPLACE

<<<<<<< SEARCH
      flat: true,
      name: "s21TomoeHeadOutline",
=======
      name: "s21TomoeHeadOutline",
>>>>>>> REPLACE

<<<<<<< SEARCH
      flat: true,
      name: "s21TomoeHead",
=======
      name: "s21TomoeHead",
>>>>>>> REPLACE

<<<<<<< SEARCH
      flat: true,
      name: "s21TomoeEye",
=======
      name: "s21TomoeEye",
>>>>>>> REPLACE
```