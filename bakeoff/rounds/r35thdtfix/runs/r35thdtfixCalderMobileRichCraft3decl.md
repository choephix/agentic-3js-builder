```ts
// Cause: Chain.tip is nullable and is only populated when the chain receives an explicit tip joint; use stable chain endpoints via at(1) and jointAt(1) instead.

<<<<<<< SEARCH
      spine.tip,
=======
      spine.at(1),
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: spine.tip,
=======
      parent: spine.jointAt(1),
>>>>>>> REPLACE

<<<<<<< SEARCH
      armL.tip,
=======
      armL.at(1),
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: armL.tip,
=======
      parent: armL.jointAt(1),
>>>>>>> REPLACE

<<<<<<< SEARCH
      armR.tip,
=======
      armR.at(1),
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: armR.tip,
=======
      parent: armR.jointAt(1),
>>>>>>> REPLACE

<<<<<<< SEARCH
      armF.tip,
=======
      armF.at(1),
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: armF.tip,
=======
      parent: armF.jointAt(1),
>>>>>>> REPLACE

<<<<<<< SEARCH
      armB.tip,
=======
      armB.at(1),
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: armB.tip,
=======
      parent: armB.jointAt(1),
>>>>>>> REPLACE

<<<<<<< SEARCH
      branchL.tip,
=======
      branchL.at(1),
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: branchL.tip,
=======
      parent: branchL.jointAt(1),
>>>>>>> REPLACE

<<<<<<< SEARCH
      branchR.tip,
=======
      branchR.at(1),
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: branchR.tip,
=======
      parent: branchR.jointAt(1),
>>>>>>> REPLACE

<<<<<<< SEARCH
      branchF.tip,
=======
      branchF.at(1),
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: branchF.tip,
=======
      parent: branchF.jointAt(1),
>>>>>>> REPLACE

<<<<<<< SEARCH
      branchB.tip,
=======
      branchB.at(1),
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: branchB.tip,
=======
      parent: branchB.jointAt(1),
>>>>>>> REPLACE

<<<<<<< SEARCH
      drop.tip,
=======
      drop.at(1),
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: spec.drop.tip,
=======
      bone: spec.drop.jointAt(1),
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: drop.tip.at,
=======
      at: drop.at(1).at,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: drop.tip,
=======
      bone: drop.jointAt(1),
>>>>>>> REPLACE

<<<<<<< SEARCH
    [1.12, 1.42, 0.16],
=======
    dropL.at(1),
>>>>>>> REPLACE
```