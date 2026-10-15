1. **Arms and legs read as broken shards.** The skinned box-section sweeps on 4-point polylines fold into dark, crumpled wedges at the shoulders and knees. They are the worst thing in every view. I replace them with chunky `frustumBox` segments, one per bone, plus a cube at each joint. That keeps the limbs blocky for pixel art and stops them bending into sharp folds.
2. **Limbs now fill out the silhouette.** The segments are thicker and taper toward the paws, and the joint cubes give round-looking elbows and knees. The arms now hug the trunk, and the thighs read as heavy legs gripping the branch.

I did not change the head, ears, eyes, nose, stand or leaves; they already read well.

<<<<<<< SEARCH
    b.sweep(arm, [0.044, 0.034], { section: "box", color: COAT, caps: "flat" });
=======
    const ap: V[] = [
      [s * 0.17, 0.77, -0.03],
      [s * 0.24, 0.74, -0.07],
      [s * 0.15, 0.775, -0.2],
      [s * 0.115, 0.775, -0.235],
    ];
    const aw = [0.1, 0.09, 0.08, 0.07];
    for (let i = 0; i < 3; i++)
      b.frustumBox(ap[i], ap[i + 1], [aw[i], aw[i]], [aw[i + 1], aw[i + 1]], { bone: arm.joints[i], color: COAT });
    box([0.105, 0.105, 0.105], COAT, ap[0], arm.joints[0]);
    box([0.095, 0.095, 0.095], COAT_DARK, ap[1], arm.joints[1]);
    box([0.082, 0.082, 0.082], COAT, ap[2], arm.joints[2]);
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(leg, [0.058, 0.044], { section: "box", color: COAT, caps: "flat" });
=======
    const lp: V[] = [
      [s * 0.12, 0.5, -0.04],
      [s * 0.2, 0.5, 0.12],
      [s * 0.1, 0.43, 0.17],
      [s * 0.07, 0.4, 0.22],
    ];
    const lw = [0.13, 0.11, 0.09, 0.08];
    for (let i = 0; i < 3; i++)
      b.frustumBox(lp[i], lp[i + 1], [lw[i], lw[i]], [lw[i + 1], lw[i + 1]], { bone: leg.joints[i], color: COAT });
    box([0.13, 0.13, 0.13], COAT, lp[0], leg.joints[0]);
    box([0.115, 0.115, 0.115], COAT_DARK, lp[1], leg.joints[1]);
    box([0.09, 0.09, 0.09], COAT, lp[2], leg.joints[2]);
>>>>>>> REPLACE