```ts
// Cause: Chain.tip is typed as Joint | null; asserting that these declared appendage tips exist
// supplies the JointRef required by bone, surface, and primitive-helper overloads.

<<<<<<< SEARCH
  const head = neck.tip;
=======
  const head = neck.tip!;
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.sweep(armL, [0.105, 0.075], { color: LEATHER_LIGHT, section: { ngon: 6 } });
  b.sweep(armR, [0.105, 0.075], { color: LEATHER_LIGHT, section: { ngon: 6 } });
=======
  b.sweep(armL, [0.105, 0.075], { color: LEATHER_LIGHT, section: { ngon: 6 }, bone: armL.tip! });
  b.sweep(armR, [0.105, 0.075], { color: LEATHER_LIGHT, section: { ngon: 6 }, bone: armR.tip! });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const arm = s > 0 ? armL : armR;
=======
    const arm = s > 0 ? armL : armR;
    const hand = arm.tip!;
>>>>>>> REPLACE

<<<<<<< SEARCH
    box([0.15, 0.15, 0.17], STEEL, [s * 0.47, 0.84, 0.36], arm.tip);
    box([0.17, 0.055, 0.18], STEEL_LIGHT, [s * 0.47, 0.91, 0.405], arm.tip);
    sphere(0.085, SKIN, [s * 0.48, 0.76, 0.40], arm.tip);
=======
    box([0.15, 0.15, 0.17], STEEL, [s * 0.47, 0.84, 0.36], hand);
    box([0.17, 0.055, 0.18], STEEL_LIGHT, [s * 0.47, 0.91, 0.405], hand);
    sphere(0.085, SKIN, [s * 0.48, 0.76, 0.40], hand);
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: arm.tip,
=======
        bone: hand,
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.rod(hammerGrip, hammerHead, 0.027, HAIR, { bone: armL.tip });
=======
  b.rod(hammerGrip, hammerHead, 0.027, HAIR, { bone: armL.tip! });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(gearGeometry(shape), fill, { bone, at, quat: gq, texture: tex, ...tag(i, "") })
=======
  b.part(gearGeometry(shape), fill, { bone: bone ?? undefined, at, quat: gq, texture: tex, ...tag(i, "") })
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.part(face, fill, {
          bone,
=======
      b.part(face, fill, {
          bone: bone ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
        b.part(face, fill, {
          bone,
=======
        b.part(face, fill, {
          bone: bone ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
        b.part(new CylinderGeometry(l.size.root, l.size.root, t, Math.max(8, l.size.teeth), 1, true), fill, {
          bone,
=======
        b.part(new CylinderGeometry(l.size.root, l.size.root, t, Math.max(8, l.size.teeth), 1, true), fill, {
          bone: bone ?? undefined,
>>>>>>> REPLACE
```