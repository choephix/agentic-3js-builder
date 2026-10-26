Cause: several chains have no `.tip` joint because their `names` lists match their span count; use the live endpoint `chain.at(1)` and its owning joint `chain.jointAt(1)` instead.

<<<<<<< SEARCH
      armL.tip,
=======
      armL.at(1),
>>>>>>> REPLACE

<<<<<<< SEARCH
      armR.tip,
=======
      armR.at(1),
>>>>>>> REPLACE

<<<<<<< SEARCH
      armF.tip,
=======
      armF.at(1),
>>>>>>> REPLACE

<<<<<<< SEARCH
      armB.tip,
=======
      armB.at(1),
>>>>>>> REPLACE

<<<<<<< SEARCH
      branchL.tip,
=======
      branchL.at(1),
>>>>>>> REPLACE

<<<<<<< SEARCH
      branchR.tip,
=======
      branchR.at(1),
>>>>>>> REPLACE

<<<<<<< SEARCH
      branchF.tip,
=======
      branchF.at(1),
>>>>>>> REPLACE

<<<<<<< SEARCH
      branchB.tip,
=======
      branchB.at(1),
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: spine.tip,
      at: spine.tip.at,
=======
      bone: spine.jointAt(1),
      at: spine.at(1),
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: spine.tip,
      at: spine.tip.at,
=======
      bone: spine.jointAt(1),
      at: spine.at(1),
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: spec.drop.tip,
      bone: spec.drop.tip,
=======
      at: spec.drop.at(1),
      bone: spec.drop.jointAt(1),
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: spec.drop.tip,
=======
        bone: spec.drop.jointAt(1),
>>>>>>> REPLACE