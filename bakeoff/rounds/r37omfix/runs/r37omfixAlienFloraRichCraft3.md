The error is caused by `Chain.tip` being nullable; use the final joint in each chain’s `joints` array instead.

```text
<<<<<<< SEARCH
  // ---------- leaf helper ----------

  function leaf(
=======
  // ---------- leaf helper ----------

  const branchEnd = (branch: (typeof branches)[number]) =>
    branch.joints[branch.joints.length - 1];
  const trunkEnd = trunk.joints[trunk.joints.length - 1];

  function leaf(
>>>>>>> REPLACE

<<<<<<< SEARCH
    branches[0].tip.at,
=======
    branchEnd(branches[0]).at,
>>>>>>> REPLACE

<<<<<<< SEARCH
    branches[0].tip.bone,
=======
    branchEnd(branches[0]).bone,
>>>>>>> REPLACE

<<<<<<< SEARCH
    branches[1].tip.at,
=======
    branchEnd(branches[1]).at,
>>>>>>> REPLACE

<<<<<<< SEARCH
    branches[1].tip.bone,
=======
    branchEnd(branches[1]).bone,
>>>>>>> REPLACE

<<<<<<< SEARCH
    branches[2].tip.at,
=======
    branchEnd(branches[2]).at,
>>>>>>> REPLACE

<<<<<<< SEARCH
    branches[2].tip.bone,
=======
    branchEnd(branches[2]).bone,
>>>>>>> REPLACE

<<<<<<< SEARCH
    branches[3].tip.at,
=======
    branchEnd(branches[3]).at,
>>>>>>> REPLACE

<<<<<<< SEARCH
    branches[3].tip.bone,
=======
    branchEnd(branches[3]).bone,
>>>>>>> REPLACE

<<<<<<< SEARCH
    branches[4].tip.at,
=======
    branchEnd(branches[4]).at,
>>>>>>> REPLACE

<<<<<<< SEARCH
    branches[4].tip.bone,
=======
    branchEnd(branches[4]).bone,
>>>>>>> REPLACE

<<<<<<< SEARCH
    trunk.tip.at,
=======
    trunkEnd.at,
>>>>>>> REPLACE

<<<<<<< SEARCH
    trunk.tip.bone,
=======
    trunkEnd.bone,
>>>>>>> REPLACE

<<<<<<< SEARCH
    const crownAt = trunk.tip.at;
=======
    const crownAt = trunkEnd.at;
>>>>>>> REPLACE

<<<<<<< SEARCH
  const crownCore = bulb("crown-heart", crownAt, 0.105, CYAN, trunk.tip.bone);
=======
  const crownCore = bulb("crown-heart", crownAt, 0.105, CYAN, trunkEnd.bone);
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: trunk.tip.bone,
=======
      bone: trunkEnd.bone,
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: trunk.tip.bone,
=======
    bone: trunkEnd.bone,
>>>>>>> REPLACE
```