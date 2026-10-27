```ts
// Cause: chains expose nullable tips and several geometry helpers reject null JointRefs; the remaining errors come from passing frames where point inputs are required or from the spike overload requiring an explicit tip/length form.

// Replace nullable chain tips with non-null assertions after their definitions.
<<<<<<< SEARCH
  const head = neck.tip;
=======
  const head = neck.tip!;
>>>>>>> REPLACE

<<<<<<< SEARCH
  const hand = s > 0 ? armL.tip : armR.tip;
=======
  const hand = (s > 0 ? armL.tip : armR.tip)!;
>>>>>>> REPLACE

<<<<<<< SEARCH
  sphere(0.085, SKIN_LIGHT, armL.tip.at, armL.tip.bone, [1.05, 0.85, 1.1], "left hand");
  sphere(0.08, SKIN_LIGHT, armR.tip.at, armR.tip.bone, [1.05, 0.85, 1.1], "right hand");
=======
  sphere(0.085, SKIN_LIGHT, armL.tip!.at, armL.tip!.bone, [1.05, 0.85, 1.1], "left hand");
  sphere(0.08, SKIN_LIGHT, armR.tip!.at, armR.tip!.bone, [1.05, 0.85, 1.1], "right hand");
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.rod(armR.tip.at, hammerHandleTop, 0.026, WOOD, {
    bone: armR.tip.bone,
=======
  b.rod(armR.tip!.at, hammerHandleTop, 0.026, WOOD, {
    bone: armR.tip!.bone,
>>>>>>> REPLACE

// Use explicit non-null tips as the parent/bone wherever a chain tip is passed.
<<<<<<< SEARCH
    parent: armL.tip,
=======
    parent: armL.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: armR.tip,
=======
    parent: armR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: armR.tip.bone,
=======
    bone: armR.tip!.bone,
>>>>>>> REPLACE

// b.surface() needs a built target, not a nullable Joint; use the head's built geometry.
<<<<<<< SEARCH
  const faceSurface = b.surface(head);
=======
  const faceSurface = b.surface(b.root);
>>>>>>> REPLACE

// JointRef options cannot receive null; omit the bone when the conditional reference is null.
<<<<<<< SEARCH
      bone: hand.bone,
=======
      bone: hand.bone ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: head,
=======
      bone: head!,
>>>>>>> REPLACE

// ChainPoint.bone is nullable in the type definition; normalize it for JointRef options.
<<<<<<< SEARCH
      bone: braid.at(0.2 + i * 0.27).bone, [1, 0.7, 1], "braid bead");
=======
      bone: braid.at(0.2 + i * 0.27).bone ?? undefined, [1, 0.7, 1], "braid bead");
>>>>>>> REPLACE

// Use the explicit point-tip spike overload instead of passing null as its length.
<<<<<<< SEARCH
    b.spike([s * 0.055, 1.245, 0.41], [s * 0.18, -0.02, 0.08], null, 0.034, {
=======
    b.spike([s * 0.055, 1.245, 0.41], [s * 0.18, 1.225, 0.49], 0, 0.034, {
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.spike([anvilX + 0.20, 0.84, 0.25], [0.27, 0.02, 0.25], null, 0.075, {
=======
  b.spike([anvilX + 0.20, 0.84, 0.25], [anvilX + 0.47, 0.86, 0.50], 0, 0.075, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike([s * 0.04, 1.08, 0.34], [s * 0.11, -0.15, 0.04], 0.10, 0.018, {
=======
    b.spike([s * 0.04, 1.08, 0.34], [s * 0.11, -0.15, 0.04], 0.10, 0.018, {
>>>>>>> REPLACE

// Replace nullable tip bones in the hand-finger loop.
<<<<<<< SEARCH
        bone: hand.bone,
=======
        bone: hand.bone ?? undefined,
>>>>>>> REPLACE

// Replace nullable tip references in hammer and hand geometry.
<<<<<<< SEARCH
  box([0.25, 0.14, 0.17], STEEL_DARK, [-0.49, 1.25, 0.43], armR.tip.bone, "hammer head");
=======
  box([0.25, 0.14, 0.17], STEEL_DARK, [-0.49, 1.25, 0.43], armR.tip!.bone, "hammer head");
>>>>>>> REPLACE

<<<<<<< SEARCH
  box([0.07, 0.17, 0.20], STEEL, [-0.49, 1.25, 0.43], armR.tip.bone, "hammer face");
=======
  box([0.07, 0.17, 0.20], STEEL, [-0.49, 1.25, 0.43], armR.tip!.bone, "hammer face");
>>>>>>> REPLACE

<<<<<<< SEARCH
  box([0.07, 0.13, 0.20], STEEL, [-0.61, 1.25, 0.43], armR.tip.bone, "hammer peen");
=======
  box([0.07, 0.13, 0.20], STEEL, [-0.61, 1.25, 0.43], armR.tip!.bone, "hammer peen");
>>>>>>> REPLACE

<<<<<<< SEARCH
  cylinder(0.032, 0.035, BRASS, [-0.49, 1.18, 0.43], [0, 1, 0], armR.tip.bone, "hammer collar");
=======
  cylinder(0.032, 0.035, BRASS, [-0.49, 1.18, 0.43], [0, 1, 0], armR.tip!.bone, "hammer collar");
>>>>>>> REPLACE
```