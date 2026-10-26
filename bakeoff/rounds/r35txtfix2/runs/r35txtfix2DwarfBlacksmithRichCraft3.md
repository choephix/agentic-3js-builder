Cause: `Chain.tip` is nullable, but these placements require a non-null `JointRef`; the chains are known to include tip joints, so assert them with `!`.

<<<<<<< SEARCH
    bone: legL.tip,
=======
    bone: legL.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: legR.tip,
=======
    bone: legR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: armL.tip,
=======
      bone: armL.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: armR.tip,
=======
      bone: armR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
  rod("leftTongsArm", armL.tip, tongTarget, 0.014, DARK_IRON, armL.tip, "round");
=======
  rod("leftTongsArm", armL.tip!, tongTarget, 0.014, DARK_IRON, armL.tip!, "round");
>>>>>>> REPLACE

<<<<<<< SEARCH
  rod("leftTongsSecondArm", armL.tip, tongTarget2, 0.012, DARK_IRON, armL.tip, "round");
=======
  rod("leftTongsSecondArm", armL.tip!, tongTarget2, 0.012, DARK_IRON, armL.tip!, "round");
>>>>>>> REPLACE

<<<<<<< SEARCH
  const hammerX = armR.tip.at.x;
=======
  const hammerX = armR.tip!.at.x;
>>>>>>> REPLACE

<<<<<<< SEARCH
  const hammerHandle = rod("hammerWoodHandle", armR.tip, hammerTop, 0.028, WOOD, armR.tip, "round");
=======
  const hammerHandle = rod("hammerWoodHandle", armR.tip!, hammerTop, 0.028, WOOD, armR.tip!, "round");
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: armR.tip,
=======
    bone: armR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: armR.tip,
=======
    bone: armR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: armR.tip,
=======
    bone: armR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: armR.tip,
=======
    bone: armR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: armR.tip,
=======
    bone: armR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: armR.tip,
=======
    bone: armR.tip!,
>>>>>>> REPLACE