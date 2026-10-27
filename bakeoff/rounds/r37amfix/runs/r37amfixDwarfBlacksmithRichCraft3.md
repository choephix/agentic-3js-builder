Cause: nullable chain tips were passed where the SDK requires a definite joint, and `Vector3` positions were accessed with array indices.

```ts
<<<<<<< SEARCH
  const neck = b.chain(
    "neck",
    polyline([
      [0, 1.20, 0.02],
      [0, 1.32, 0.02],
      [0, 1.40, 0.03],
    ]),
    { parent: spine.tip, names: ["neck", "neckTip"], role: "neck" },
  );
=======
  const neck = b.chain(
    "neck",
    polyline([
      [0, 1.20, 0.02],
      [0, 1.32, 0.02],
      [0, 1.40, 0.03],
    ]),
    { parent: spine.tip!, names: ["neck", "neckTip"], role: "neck" },
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
  const head = b.joint("head", { parent: neck.tip, at: [0, 1.40, 0.03], dir: [0, 0, 1], role: "head", group: "head" });
=======
  const head = b.joint("head", { parent: neck.tip!, at: [0, 1.40, 0.03], dir: [0, 0, 1], role: "head", group: "head" });
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const [s, hand, chain] of [[1, armL.tip.at, armL], [-1, armR.tip.at, armR]] as const) {
=======
  for (const [s, hand, chain] of [[1, armL.tip!.at, armL], [-1, armR.tip!.at, armR]] as const) {
>>>>>>> REPLACE

<<<<<<< SEARCH
    sphere(0.105, SKIN_LIGHT, hand, chain.tip, [1.0, 0.82, 1.18]);
    cyl(0.105, 0.055, LEATHER, [hand[0], hand[1] + 0.015, hand[2]], chain.tip, 8);
=======
    sphere(0.105, SKIN_LIGHT, hand, chain.tip!, [1.0, 0.82, 1.18]);
    cyl(0.105, 0.055, LEATHER, [hand.x, hand.y + 0.015, hand.z], chain.tip!, 8);
>>>>>>> REPLACE

<<<<<<< SEARCH
      sphere(0.027, SKIN, [hand[0] + (i - 1) * 0.047, hand[1] - 0.05, hand[2] + 0.065], chain.tip);
=======
      sphere(0.027, SKIN, [hand.x + (i - 1) * 0.047, hand.y - 0.05, hand.z + 0.065], chain.tip!);
>>>>>>> REPLACE

<<<<<<< SEARCH
  cyl(0.027, 0.48, LEATHER_LIGHT, [0.49, 1.05, 0.31], armL.tip, 8);
=======
  cyl(0.027, 0.48, LEATHER_LIGHT, [0.49, 1.05, 0.31], armL.tip!, 8);
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(0.20, 0.13, 0.15, STEEL, [0.49, 1.29, 0.31], armL.tip);
=======
  box(0.20, 0.13, 0.15, STEEL, [0.49, 1.29, 0.31], armL.tip!);
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(0.26, 0.08, 0.19, STEEL, [0.49, 1.24, 0.31], armL.tip);
=======
  box(0.26, 0.08, 0.19, STEEL, [0.49, 1.24, 0.31], armL.tip!);
>>>>>>> REPLACE

<<<<<<< SEARCH
  sphere(0.045, GOLD, [0.49, 1.12, 0.31], armL.tip);
=======
  sphere(0.045, GOLD, [0.49, 1.12, 0.31], armL.tip!);
>>>>>>> REPLACE
```