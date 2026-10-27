The errors come from using the SDK’s older `b.chain(path, options)` form; `chain` requires a string name first, and nullable chain tips must be narrowed before use.

```ts
<<<<<<< SEARCH
  const neck = b.chain(
    polyline([
      [0, 1.28, 0.02],
      [0, 1.39, 0.04],
      [0, 1.48, 0.07],
    ]),
    {
=======
  const neck = b.chain(
    "neck",
    polyline([
      [0, 1.28, 0.02],
      [0, 1.39, 0.04],
      [0, 1.48, 0.07],
    ]),
    {
>>>>>>> REPLACE

<<<<<<< SEARCH
  const armL = b.chain(
    catmull([
      [0.19, 1.21, 0.01],
      [0.34, 1.04, 0.08],
      [0.39, 0.86, 0.18],
      [0.38, 0.78, 0.27],
    ]),
    {
=======
  const armL = b.chain(
    "armL",
    catmull([
      [0.19, 1.21, 0.01],
      [0.34, 1.04, 0.08],
      [0.39, 0.86, 0.18],
      [0.38, 0.78, 0.27],
    ]),
    {
>>>>>>> REPLACE

<<<<<<< SEARCH
  const armR = b.chain(
    catmull([
      [-0.19, 1.21, 0.01],
      [-0.34, 1.08, 0.08],
      [-0.43, 0.95, 0.23],
      [-0.49, 1.10, 0.36],
    ]),
    {
=======
  const armR = b.chain(
    "armR",
    catmull([
      [-0.19, 1.21, 0.01],
      [-0.34, 1.08, 0.08],
      [-0.43, 0.95, 0.23],
      [-0.49, 1.10, 0.36],
    ]),
    {
>>>>>>> REPLACE

<<<<<<< SEARCH
  const legL = b.chain(
    polyline([
      [0.14, 0.75, 0],
      [0.18, 0.48, 0.01],
      [0.17, 0.22, 0.07],
      [0.17, 0.12, 0.18],
    ]),
    {
=======
  const legL = b.chain(
    "legL",
    polyline([
      [0.14, 0.75, 0],
      [0.18, 0.48, 0.01],
      [0.17, 0.22, 0.07],
      [0.17, 0.12, 0.18],
    ]),
    {
>>>>>>> REPLACE

<<<<<<< SEARCH
  const legR = b.chain(
    polyline([
      [-0.14, 0.75, 0],
      [-0.18, 0.48, 0.01],
      [-0.17, 0.22, 0.07],
      [-0.17, 0.12, 0.18],
    ]),
    {
=======
  const legR = b.chain(
    "legR",
    polyline([
      [-0.14, 0.75, 0],
      [-0.18, 0.48, 0.01],
      [-0.17, 0.22, 0.07],
      [-0.17, 0.12, 0.18],
    ]),
    {
>>>>>>> REPLACE

<<<<<<< SEARCH
    const c = b.chain(polyline(pts), {
=======
    const c = b.chain(name, polyline(pts), {
>>>>>>> REPLACE

<<<<<<< SEARCH
  const neckBase = spine.tip;
=======
  const neckBase = spine.tip!;
>>>>>>> REPLACE

<<<<<<< SEARCH
  const hand = s > 0 ? armL.tip : armR.tip;
=======
  const hand = (s > 0 ? armL.tip : armR.tip)!;
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: hand,
      at: hand.at,
=======
      bone: hand,
      at: hand.at,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: hand,
      at: [hand.at.x + i * 0.025, hand.at.y - 0.015, hand.at.z + 0.07],
=======
      bone: hand,
      at: [hand.at.x + i * 0.025, hand.at.y - 0.015, hand.at.z + 0.07],
>>>>>>> REPLACE

<<<<<<< SEARCH
    const foot = s > 0 ? legL.tip : legR.tip;
=======
    const foot = (s > 0 ? legL.tip : legR.tip)!;
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: foot,
      at: [s * 0.17, 0.09, 0.17],
=======
      bone: foot,
      at: [s * 0.17, 0.09, 0.17],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: foot,
      at: [s * 0.17, 0.012, 0.18],
=======
      bone: foot,
      at: [s * 0.17, 0.012, 0.18],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: foot,
      at: [s * 0.17, 0.1, 0.34],
=======
      bone: foot,
      at: [s * 0.17, 0.1, 0.34],
>>>>>>> REPLACE
```