Cause: nullable chain tips were passed as joint parents/bones, `Vector3` values were indexed like tuples, and a few helpers needed explicit non-null joint/frame references.

```text
<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.joints[neck.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: leg.chain.tip,
=======
      bone: leg.chain.joints[leg.chain.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
  R(
    new THREE.SphereGeometry(1, 10, 6),
    INK,
    trunk.tip.at,
    trunk.tip,
  );
  for (const s of [1, -1]) {
    bead(
      [trunk.tip.at[0] + s * 0.045, trunk.tip.at[1] + 0.035, trunk.tip.at[2] + 0.065],
      RUST,
      0.018,
      trunk.tip,
    );
  }
=======
  const trunkTip = trunk.joints[trunk.joints.length - 1];
  R(
    new THREE.SphereGeometry(1, 10, 6),
    INK,
    trunkTip.at,
    trunkTip,
  );
  for (const s of [1, -1]) {
    bead(
      [
        trunkTip.at.x + s * 0.045,
        trunkTip.at.y + 0.035,
        trunkTip.at.z + 0.065,
      ],
      RUST,
      0.018,
      trunkTip,
    );
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: trunk.tip,
=======
      bone: trunkTip,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: trunk.tip,
=======
      bone: trunkTip,
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.ring(q, {
      count: 1,
      radius: 0.0,
      name: `trunkRing${i}`,
      role: "fan",
    }, (item: any) => {
=======
    b.ring(q, {
      count: 1,
      radius: 0.0,
      name: `trunkRing${i}`,
      role: "fan",
    }, (item: any) => {
>>>>>>> REPLACE
```