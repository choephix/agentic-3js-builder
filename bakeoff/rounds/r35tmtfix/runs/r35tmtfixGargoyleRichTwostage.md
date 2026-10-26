Cause: the module passes `null` where the SDK requires an omitted/valid joint reference, and the spike calls use the wrong overload form for point-to-point claws and fingers.

```ts
<<<<<<< SEARCH
  return b.part(new THREE.BoxGeometry(...size), color, {
    at,
    bone,
    name,
    flat: true,
  });
=======
  return b.part(new THREE.BoxGeometry(...size), color, {
    at,
    ...(bone ? { bone } : {}),
    name,
    flat: true,
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
  return b.part(new THREE.SphereGeometry(radius, sides, rings), color, {
    at,
    bone,
    name,
    flat: true,
  });
=======
  return b.part(new THREE.SphereGeometry(radius, sides, rings), color, {
    at,
    ...(bone ? { bone } : {}),
    name,
    flat: true,
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
      [0.46, 0.2, 0.56],
=======
      [0.46, 0.2, 0.56],
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(b, [2.9, 0.22, 1.55], [0, 0.11, 0.02], LEDGE_MASONRY, null, "ledge");
  box(b, [3.15, 0.16, 0.22], [0, 0.29, 0.67], LEDGE_MASONRY, null, "ledgeFrontCap");
  box(b, [2.7, 0.16, 0.2], [0, 0.29, -0.68], LEDGE_MASONRY, null, "ledgeBackCap");
=======
  box(b, [2.9, 0.22, 1.55], [0, 0.11, 0.02], LEDGE_MASONRY, undefined, "ledge");
  box(b, [3.15, 0.16, 0.22], [0, 0.29, 0.67], LEDGE_MASONRY, undefined, "ledgeFrontCap");
  box(b, [2.7, 0.16, 0.2], [0, 0.29, -0.68], LEDGE_MASONRY, undefined, "ledgeBackCap");
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(b, [0.38, 0.28, 0.32], [1.22, 0.33, 0.52], LEDGE_MASONRY, null, "ledgeCornerR");
  box(b, [0.38, 0.28, 0.32], [-1.22, 0.33, 0.52], LEDGE_MASONRY, null, "ledgeCornerL");
  box(b, [0.42, 0.035, 0.2], [0.8, 0.315, 0.34], MOSS, null, "ledgeMossR");
  box(b, [0.38, 0.035, 0.18], [-0.82, 0.315, -0.3], MOSS, null, "ledgeMossL");
=======
  box(b, [0.38, 0.28, 0.32], [1.22, 0.33, 0.52], LEDGE_MASONRY, undefined, "ledgeCornerR");
  box(b, [0.38, 0.28, 0.32], [-1.22, 0.33, 0.52], LEDGE_MASONRY, undefined, "ledgeCornerL");
  box(b, [0.42, 0.035, 0.2], [0.8, 0.315, 0.34], MOSS, undefined, "ledgeMossR");
  box(b, [0.38, 0.035, 0.18], [-0.82, 0.315, -0.3], MOSS, undefined, "ledgeMossL");
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.spike(foot, [s * 0.58, 0.21, 0.78], null, 0.045, {
=======
      b.spike(foot, [s * 0.58, 0.21, 0.78], 0.16, 0.045, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike(foot, [s * 0.46, 0.21, 0.84], null, 0.045, {
=======
    b.spike(foot, [s * 0.46, 0.21, 0.84], 0.18, 0.045, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike(foot, [s * 0.34, 0.21, 0.75], null, 0.045, {
=======
    b.spike(foot, [s * 0.34, 0.21, 0.75], 0.13, 0.045, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike(hand, [s * 0.57, 0.55, 1.05], null, 0.035, {
=======
    b.spike(hand, [s * 0.57, 0.55, 1.05], 0.25, 0.035, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike(hand, [s * 0.49, 0.51, 1.08], null, 0.035, {
=======
    b.spike(hand, [s * 0.49, 0.51, 1.08], 0.29, 0.035, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike(hand, [s * 0.41, 0.54, 1.02], null, 0.035, {
=======
    b.spike(hand, [s * 0.41, 0.54, 1.02], 0.22, 0.035, {
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.spike(
        [s * 0.31, 1.69, 0.62],
        [s * 0.43, 1.58, 0.58],
        null,
        0.055,
=======
      b.spike(
        [s * 0.31, 1.69, 0.62],
        [s * 0.43, 1.58, 0.58],
        0.16,
        0.055,
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike(
      [s * 0.095, 1.65, 0.83],
      [s * 0.095, 1.45, 0.9],
      null,
      0.028,
=======
    b.spike(
      [s * 0.095, 1.65, 0.83],
      [s * 0.095, 1.45, 0.9],
      0.20,
      0.028,
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike(
      [s * 0.18, 1.98, 0.55],
      [s * 0.3, 2.28, 0.39],
      null,
      0.105,
=======
    b.spike(
      [s * 0.18, 1.98, 0.55],
      [s * 0.3, 2.28, 0.39],
      0.38,
      0.105,
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike(
      [s * 0.27, 1.95, 0.54],
      [s * 0.43, 2.12, 0.45],
      null,
      0.075,
=======
    b.spike(
      [s * 0.27, 1.95, 0.54],
      [s * 0.43, 2.12, 0.45],
      0.25,
      0.075,
>>>>>>> REPLACE
```