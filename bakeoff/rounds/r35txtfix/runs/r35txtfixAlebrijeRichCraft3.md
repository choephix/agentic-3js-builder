```ts
// Cause: nullable chain tips were passed where the SDK requires a definite joint/frame, one b.along callback used an unsupported second parameter, PURPLE_PAINT was missing, and ear outline points lacked the required "sharp" tuple marker.

<<<<<<< SEARCH
    spine.tip.at,
=======
    spine.tip!.at,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: spine.tip,
    at: neck.tip.at,
=======
    parent: spine.tip!,
    at: neck.tip!.at,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const BLUE_PAINT = cel(BLUE, BLUE_DARK);
=======
  const BLUE_PAINT = cel(BLUE, BLUE_DARK);
  const PURPLE_PAINT = cel(PURPLE, PURPLE_DARK);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const collarStuds = b.along(collarLoop, 10, (at, i) => {
    b.stick(
      new THREE.SphereGeometry(0.014, 7, 5),
      i % 2 === 0 ? GOLD_PAINT : AQUA_PAINT,
=======
  const collarStuds = b.along(collarLoop, 10, (at) => {
    const i = Math.round(at.t * 9);
    b.stick(
      new THREE.SphereGeometry(0.014, 7, 5),
      i % 2 === 0 ? GOLD_PAINT : AQUA_PAINT,
>>>>>>> REPLACE

<<<<<<< SEARCH
      frame: chain.tip,
=======
      frame: chain.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: chain.tip,
=======
      bone: chain.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    const toeBase = chain.tip.at.clone().add(
=======
    const toeBase = chain.tip!.at.clone().add(
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: chain.tip,
=======
      bone: chain.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const collarStuds = b.along(collarLoop, 10, (at, i) => {
=======
  const collarStuds = b.along(collarLoop, 10, (at) => {
>>>>>>> REPLACE

<<<<<<< SEARCH
      [0.18, 0.14],
=======
      [0.18, 0.14, "sharp"],
>>>>>>> REPLACE

<<<<<<< SEARCH
      [0.14, 0.25, "sharp"],
=======
      [0.14, 0.25, "sharp"],
>>>>>>> REPLACE

<<<<<<< SEARCH
      [0.075, 0.25, "sharp"],
=======
      [0.075, 0.25, "sharp"],
>>>>>>> REPLACE

<<<<<<< SEARCH
      [0.015, 0.15],
=======
      [0.015, 0.15, "sharp"],
>>>>>>> REPLACE

<<<<<<< SEARCH
      [0.13, 0.055],
=======
      [0.13, 0.055, "sharp"],
>>>>>>> REPLACE

<<<<<<< SEARCH
      [0.095, 0.13],
=======
      [0.095, 0.13, "sharp"],
>>>>>>> REPLACE

<<<<<<< SEARCH
      [0.04, 0.12],
=======
      [0.04, 0.12, "sharp"],
>>>>>>> REPLACE
```