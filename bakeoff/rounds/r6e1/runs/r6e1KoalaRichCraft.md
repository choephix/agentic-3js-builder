## Review

**Identity cues:**
- **Ears:** round, with a cream inner. They are visible, but small, and the black outer shell reads as a hole from the back.
- **Nose:** the big black block is clear and in proportion, and the koala is unmistakable from it.
- **Eyes:** tiny, so the face reads blank at the front distance.
- **Grip:** the arms look like flat grey wing plates because the box-section sweep rolls and shears at the elbow. The hands barely reach the branch, so the "gripping a branch" story is weak.

**Changes, in priority order:**

1. **Identity and face (front and head views).** Eyes grow from 3.4 cm to 4.6 cm, move slightly outward and up, and get a brow tick that is wider and sits higher. The face then reads as a cute koala from the front.
2. **Ears (front and back views).**
   - They are rebuilt larger, with a coarser 0.018 pixel step.
   - The outer shell becomes light grey instead of black, so the back view no longer shows black holes.
   - The cream fringe tufts are re-seated around the new outline, with a top tuft on the crown.
3. **Arms and legs (front and three-quarter views).** The box-section sweeps become faceted round limbs. The elbow now sits lower and tighter (0.25, 0.58, 0.07), so the forearm runs up and back into the paw that holds the limb, and the shoulder plates disappear. The elbow tuft is re-seated on the new elbow.
4. **Back and top fur (back view).** The grey fur ramp is raised so the back of the torso no longer renders near-black. The lighter tone also gives more contrast against the dark branch.

<<<<<<< SEARCH
const FUR = fur(GREY, 0.55, 3);
const FUR_LT = fur(GREY, 0.72, 4);
=======
const FUR = fur(GREY, 0.68, 3);
const FUR_LT = fur(GREY, 0.84, 4);
>>>>>>> REPLACE

<<<<<<< SEARCH
        [s * 0.14, 0.68, 0.02],
        [s * 0.27, 0.6, 0.1],
        [s * 0.235, 0.63, -0.015],
=======
        [s * 0.14, 0.68, 0.02],
        [s * 0.25, 0.58, 0.07],
        [s * 0.235, 0.63, -0.015],
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(arm, [0.052, 0.04], { section: "box", caps: "flat", color: FUR });
    b.sweep(leg, [0.07, 0.055, 0.042], { section: "box", caps: "flat", color: FUR });
=======
    b.sweep(arm, [0.05, 0.042, 0.038], { sides: 8, smooth: false, caps: "round", color: FUR });
    b.sweep(leg, [0.07, 0.056, 0.044], { sides: 8, smooth: false, caps: "round", color: FUR });
>>>>>>> REPLACE

<<<<<<< SEARCH
    box(arm.joints[1], [0.06, 0.06, 0.06], [s * 0.285, 0.6, 0.1], FUR_LT);
=======
    box(arm.joints[1], [0.062, 0.062, 0.062], [s * 0.262, 0.575, 0.08], FUR_LT);
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.BoxGeometry(0.034, 0.034, 0.012), "#ffffff", {
      texture: EYE,
      bone: head,
      at: [s * 0.07, 0.868, 0.176],
    });
    // brow tick above each eye
    box(head, [0.036, 0.008, 0.01], [s * 0.07, 0.892, 0.176], "#3a3842");
=======
    b.part(new THREE.BoxGeometry(0.046, 0.046, 0.012), "#ffffff", {
      texture: EYE,
      bone: head,
      at: [s * 0.068, 0.878, 0.176],
    });
    // brow tick above each eye
    box(head, [0.05, 0.01, 0.01], [s * 0.068, 0.907, 0.176], "#3a3842");
>>>>>>> REPLACE

<<<<<<< SEARCH
    const outer = stepped([2, 3, 4, 4, 4, 4, 4, 3, 2].map((h) => [-h, h] as [number, number]), 0.014, { rows: true });
    const inner = stepped([1, 2, 3, 3, 3, 2, 1].map((h) => [-h, h] as [number, number]), 0.014, { rows: true });
    b.extrude(outer, { at: [s * 0.125, 0.875, 0.05], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.04, color: FUR_DK, bone: ear });
    b.extrude(inner, { at: [s * 0.125, 0.889, 0.074], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.02, color: FUR_CR, bone: ear });
    const rim: V[] = [[0.178, 0.89, 0.08], [0.172, 0.935, 0.08], [0.15, 0.99, 0.08], [0.08, 0.9, 0.08]];
    for (const [x, y, z] of rim) box(ear, [0.028, 0.03, 0.028], [s * x, y, z], FUR_CR);
=======
    const outer = stepped([2, 3, 4, 4, 4, 4, 4, 3, 2].map((h) => [-h, h] as [number, number]), 0.018, { rows: true });
    const inner = stepped([1, 2, 3, 3, 3, 2, 1].map((h) => [-h, h] as [number, number]), 0.018, { rows: true });
    b.extrude(outer, { at: [s * 0.125, 0.875, 0.05], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.04, color: FUR_LT, bone: ear });
    b.extrude(inner, { at: [s * 0.125, 0.893, 0.074], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.02, color: FUR_CR, bone: ear });
    const rim: V[] = [[0.2, 0.91, 0.08], [0.2, 0.965, 0.08], [0.172, 1.012, 0.08], [0.125, 1.04, 0.08], [0.078, 1.012, 0.08]];
    for (const [x, y, z] of rim) box(ear, [0.03, 0.032, 0.03], [s * x, y, z], FUR_CR);
>>>>>>> REPLACE