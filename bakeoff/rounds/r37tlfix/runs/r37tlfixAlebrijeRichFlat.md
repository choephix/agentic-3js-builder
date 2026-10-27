The errors come from nullable indexed chain joints/tips: assert the known joints, and give each limb chain a fourth name so its endpoint gets a tip joint.

```text
<<<<<<< SEARCH
      parent: chainName.includes("shoulder") ? spine.joints[2] : hips,
      names: [n0, n1, n2],
=======
      parent: chainName.includes("shoulder") ? spine.joints[2]! : hips,
      names: [n0, n1, n2, `${chainName}Foot`],
>>>>>>> REPLACE

<<<<<<< SEARCH
    const tip = leg.tip.at;
=======
    const tip = leg.tip!.at;
>>>>>>> REPLACE

<<<<<<< SEARCH
  const tailTip = tail.tip;
=======
  const tailTip = tail.tip!;
>>>>>>> REPLACE