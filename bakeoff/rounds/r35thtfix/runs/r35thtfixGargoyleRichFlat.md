Cause: the module used a nonexistent `b` export, passed nullable joints as parents/bones, and mixed the SDK’s stricter `string`/`Paint` overloads; the toe and finger chains also selected a null parent.

```ts
<<<<<<< SEARCH
  countershade,
  createBuilder,
  limb,
  mottle,
  polyline,
=======
  createBuilder,
  limb,
  polyline,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const STONE = countershade(
    mottle("#555b62", "#7d8388", {
      size: 0.2,
      contrast: 0.38,
      seed: 17,
    }),
    "#33373e",
    { level: -0.16 },
  );
=======
  const STONE = "#62686d";
>>>>>>> REPLACE

<<<<<<< SEARCH
          parent: legChains[legChains.length - 2 + (s > 0 ? 1 : 0)]?.tip ?? hips,
=======
          parent: legChains[s > 0 ? 0 : 1].tip,
>>>>>>> REPLACE

<<<<<<< SEARCH
          parent: armChains[armChains.length - 2 + (s > 0 ? 1 : 0)]?.tip ?? hips,
=======
          parent: armChains[s > 0 ? 0 : 1].tip,
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.sweep(digit, [0.035 - i * 0.004, 0.009], {
        color: STONE_LIGHT,
=======
      b.sweep(digit, [0.035 - i * 0.004, 0.009], {
        color: String(STONE_LIGHT),
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.sweep(toe, [0.043, 0.009], {
        color: STONE_LIGHT,
=======
      b.sweep(toe, [0.043, 0.009], {
        color: String(STONE_LIGHT),
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.sweep(finger, [0.028, 0.006], {
        color: STONE_LIGHT,
=======
      b.sweep(finger, [0.028, 0.006], {
        color: String(STONE_LIGHT),
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.sweep(digit, [0.035 - i * 0.004, 0.009], {
        color: STONE_LIGHT,
=======
      b.sweep(digit, [0.035 - i * 0.004, 0.009], {
        color: String(STONE_LIGHT),
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike(tail.tip, tail.tip, 0.115, 0.026, {
      color: STONE_HIGHLIGHT,
=======
    b.spike(tail.tip, tail.tip, 0.115, 0.026, {
      color: String(STONE_HIGHLIGHT),
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike(digit.tip, digit.tip, 0.075 - i * 0.008, 0.014, {
      color: STONE_HIGHLIGHT,
=======
    b.spike(digit.tip, digit.tip, 0.075 - i * 0.008, 0.014, {
      color: String(STONE_HIGHLIGHT),
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike(finger.tip, finger.tip, 0.06, 0.013, {
      color: STONE_HIGHLIGHT,
=======
    b.spike(finger.tip, finger.tip, 0.06, 0.013, {
      color: String(STONE_HIGHLIGHT),
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.spike(toe.tip, toe.tip, 0.07, 0.019, {
        color: STONE_HIGHLIGHT,
=======
      b.spike(toe.tip, toe.tip, 0.07, 0.019, {
        color: String(STONE_HIGHLIGHT),
>>>>>>> REPLACE

<<<<<<< SEARCH
  const skull = stoneSphere(0.31, STONE, head.at, [1.0, 0.9, 0.98], head);
=======
  const skull = stoneSphere(0.31, String(STONE), head.at, [1.0, 0.9, 0.98], head);
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.stick(new THREE.SphereGeometry(0.082, 10, 6), EYE_SOCKET, eyeHit, {
=======
    b.stick(new THREE.SphereGeometry(0.082, 10, 6), String(EYE_SOCKET), eyeHit, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.stick(
      new THREE.SphereGeometry(0.048, 9, 6),
      EYE_AMBER,
=======
    b.stick(
      new THREE.SphereGeometry(0.048, 9, 6),
      String(EYE_AMBER),
>>>>>>> REPLACE

<<<<<<< SEARCH
      EYE_HIGHLIGHT,
=======
      String(EYE_HIGHLIGHT),
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const eye of eyeParts) glow(eye, 1.35);
=======
  for (const eye of eyeParts) glow(eye, 1.35);
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike(jaw.local([s * 0.11, 0.205, -0.06]), [0, -1, 0], 0.13, 0.029, {
      color: STONE_HIGHLIGHT,
=======
    b.spike(jaw.local([s * 0.11, 0.205, -0.06]), [0, -1, 0], 0.13, 0.029, {
      color: String(STONE_HIGHLIGHT),
>>>>>>> REPLACE
```