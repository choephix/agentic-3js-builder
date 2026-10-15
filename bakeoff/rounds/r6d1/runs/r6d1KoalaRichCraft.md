1. **Arms and legs rebuilt as blocky rods.** The box-section sweeps on the polyline chains twisted into dark triangular shards in the front, three-quarter and back views. They now read as wings rather than limbs. I replace them with square rods between the joint points, which fits the pixel look and keeps the same skeleton. The next render should show chunky grey arms running from the shoulders to the paws on the branch limbs, and thighs and shins that read as legs.
2. **Eyes enlarged and redrawn.** The eyes were 3.4 cm on a 24 cm head and hard to see in the close-up. They are now 4.8 cm, set slightly closer to the muzzle, with a 5×5 pixel drawing that has a clearer highlight, and the brows are re-sized to match. The next head close-up should show larger, friendlier eyes with a visible glint.
3. **Elbow and knee blocks bulked up.** The elbow and knee blocks are now bigger (0.075 and 0.08 m), so the rods meet them without a gap.

<<<<<<< SEARCH
const EYE = pixelArt([".kk.", "kwkk", "kkkk", ".kk."], { k: "#0d0c12", w: "#ffffff" });
=======
const EYE = pixelArt([".kkk.", "kwkkk", "kwkkk", "kkkkk", ".kkk."], { k: "#0d0c12", w: "#ffffff" });
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.sweep(arm, [0.052, 0.04], { section: "box", caps: "flat", color: FUR });
    b.sweep(leg, [0.07, 0.055, 0.042], { section: "box", caps: "flat", color: FUR });
=======
    b.rod(arm.joints[0].at, arm.joints[1].at, [0.05, 0.042], FUR, { sides: 4, bone: arm.joints[0] });
    b.rod(arm.joints[1].at, arm.joints[2].at, [0.042, 0.036], FUR, { sides: 4, bone: arm.joints[1] });
    b.rod(leg.joints[0].at, leg.joints[1].at, [0.062, 0.05], FUR, { sides: 4, bone: leg.joints[0] });
    b.rod(leg.joints[1].at, leg.joints[2].at, [0.05, 0.04], FUR, { sides: 4, bone: leg.joints[1] });
>>>>>>> REPLACE
<<<<<<< SEARCH
    box(arm.joints[1], [0.06, 0.06, 0.06], [s * 0.285, 0.6, 0.1], FUR_LT);
    box(leg.joints[1], [0.06, 0.06, 0.06], [s * 0.215, 0.5, 0.16], FUR_LT);
=======
    box(arm.joints[1], [0.075, 0.075, 0.075], [s * 0.27, 0.6, 0.1], FUR_LT);
    box(leg.joints[1], [0.08, 0.08, 0.08], [s * 0.205, 0.5, 0.15], FUR_LT);
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
    b.part(new THREE.BoxGeometry(0.048, 0.048, 0.012), "#ffffff", {
      texture: EYE,
      bone: head,
      at: [s * 0.066, 0.862, 0.178],
    });
    // brow tick above each eye
    box(head, [0.056, 0.008, 0.01], [s * 0.066, 0.895, 0.178], "#3a3842");
>>>>>>> REPLACE