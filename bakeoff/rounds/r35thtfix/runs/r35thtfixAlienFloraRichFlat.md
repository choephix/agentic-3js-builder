Cause: the errors come from passing plain direction arrays where the SDK expects `Vector3` values, passing nullable joints without narrowing, and using nullable chain tips as geometry anchors; the remaining overload errors are from `rotation` arrays, which must be supplied as `THREE.Euler` values.

```ts
<<<<<<< SEARCH
    const branchTip = base
      .clone()
      .addScaledVector(outward, data.length)
      .addScaledVector(UP, data.rise);
=======
    const branchTip = base
      .clone()
      .addScaledVector(outward, data.length)
      .addScaledVector(UP, data.rise);
>>>>>>> REPLACE

<<<<<<< SEARCH
        parent: bone,
=======
        parent: bone ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
    makeLeaf(
      b,
      branch.tip.at.clone(),
      leafDirection,
      data.width,
      data.length * 0.82,
      branch.tip,
      i,
    );
=======
    const branchTipJoint = branch.tip;
    if (!branchTipJoint) return;

    makeLeaf(
      b,
      branchTipJoint.at.clone(),
      leafDirection,
      data.width,
      data.length * 0.82,
      branchTipJoint,
      i,
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
    const podAt = branch.tip.at
      .clone()
      .addScaledVector(UP, 0.035)
      .addScaledVector(outward, 0.018);
    makePod(b, podAt, branch.tip, i, 0.72 + (i % 3) * 0.1);
=======
    const podAt = branchTipJoint.at
      .clone()
      .addScaledVector(UP, 0.035)
      .addScaledVector(outward, 0.018);
    makePod(b, podAt, branchTipJoint, i, 0.72 + (i % 3) * 0.1);
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: stalk.nearestJoint(p),
=======
        bone: stalk.nearestJoint(p) ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: stalk.tip,
=======
      parent: stalk.tip ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
    makeLeaf(
      b,
      crownBranch.tip.at.clone(),
      leafDir,
      0.22 + (i % 2) * 0.03,
      0.47 + (i % 3) * 0.04,
      crownBranch.tip,
      20 + i,
    );
=======
    const crownTipJoint = crownBranch.tip;
    if (!crownTipJoint) continue;

    makeLeaf(
      b,
      crownTipJoint.at.clone(),
      leafDir,
      0.22 + (i % 2) * 0.03,
      0.47 + (i % 3) * 0.04,
      crownTipJoint,
      20 + i,
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
      crownBranch.tip,
      20 + i,
=======
      crownTipJoint,
      20 + i,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: stalk.joints[0],
=======
      bone: stalk.joints[0] ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: stalk.joints[stalk.joints.length - 2],
=======
      bone: stalk.joints[stalk.joints.length - 2] ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
      rotation: [0, 0, 0],
=======
      rotation: new THREE.Euler(0, 0, 0),
>>>>>>> REPLACE

<<<<<<< SEARCH
      rotation: [90, 0, 0],
=======
      rotation: new THREE.Euler(Math.PI / 2, 0, 0),
>>>>>>> REPLACE

<<<<<<< SEARCH
      rotation: [90, 0, 18],
=======
      rotation: new THREE.Euler(Math.PI / 2, 0, THREE.MathUtils.degToRad(18)),
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: stalk.nearestJoint(p),
=======
        bone: stalk.nearestJoint(p) ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: stalk.joints[0],
=======
      bone: stalk.joints[0] ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
        dir: [0, 1, 0],
=======
        dir: new THREE.Vector3(0, 1, 0),
>>>>>>> REPLACE
```