Cause: `ColorInput` is broader than the SDK’s `Fill` type, a painted color was passed to a helper typed for strings, and two tuple loops destructured coordinates instead of `[index, point]`; the latter produced numeric `at` values.

```ts
<<<<<<< SEARCH
  color: ColorInput,
=======
  color: string | Paint,
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: string,
  name: string,
=======
  color: string | Paint,
  name: string,
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const [i, p] of [
    [-1.312, 1.035, 0.110],
    [-1.235, 0.985, 0.110],
  ] as [number, number, number][]) {
=======
  for (const [i, p] of (
    [
      [-1.312, 1.035, 0.110],
      [-1.235, 0.985, 0.110],
    ] as [number, number, number][]
  ).entries()) {
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const [i, p] of [
    [-0.485, 0.985, 0.078],
    [-0.215, 1.020, 0.078],
  ] as [number, number, number][]) {
=======
  for (const [i, p] of (
    [
      [-0.485, 0.985, 0.078],
      [-0.215, 1.020, 0.078],
    ] as [number, number, number][]
  ).entries()) {
>>>>>>> REPLACE
```