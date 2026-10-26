Cause: `tip` is nullable in the SDK, and nullable joint handles cannot be passed where a `JointRef` is required; use the chain’s final joint explicitly.

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: antenna.tip,
=======
    bone: antenna.joints[antenna.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
    box([0.19, 0.17, 0.15], arm.tip.at, CARDBOARD_LIGHT, arm.tip, {
=======
    box([0.19, 0.17, 0.15], arm.joints[arm.joints.length - 1].at, CARDBOARD_LIGHT, arm.joints[arm.joints.length - 1], {
>>>>>>> REPLACE

<<<<<<< SEARCH
      [arm.tip.at.x, arm.tip.at.y + 0.04, arm.tip.at.z + 0.078],
=======
      [arm.joints[arm.joints.length - 1].at.x, arm.joints[arm.joints.length - 1].at.y + 0.04, arm.joints[arm.joints.length - 1].at.z + 0.078],
>>>>>>> REPLACE

<<<<<<< SEARCH
      arm.tip,
=======
      arm.joints[arm.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
        [arm.tip.at.x + side * (-0.055 + i * 0.055), arm.tip.at.y - 0.13, arm.tip.at.z + 0.025],
        CARDBOARD,
        arm.tip,
=======
        [
          arm.joints[arm.joints.length - 1].at.x + side * (-0.055 + i * 0.055),
          arm.joints[arm.joints.length - 1].at.y - 0.13,
          arm.joints[arm.joints.length - 1].at.z + 0.025,
        ],
        CARDBOARD,
        arm.joints[arm.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
    box([0.20, 0.14, 0.31], leg.tip.at, CARDBOARD_LIGHT, leg.tip, {
=======
    box([0.20, 0.14, 0.31], leg.joints[leg.joints.length - 1].at, CARDBOARD_LIGHT, leg.joints[leg.joints.length - 1], {
>>>>>>> REPLACE

<<<<<<< SEARCH
    box([0.215, 0.045, 0.33], [leg.tip.at.x, 0.025, 0.17], SOLE, leg.tip, {
=======
    box(
      [0.215, 0.045, 0.33],
      [leg.joints[leg.joints.length - 1].at.x, 0.025, 0.17],
      SOLE,
      leg.joints[leg.joints.length - 1],
      {
>>>>>>> REPLACE

<<<<<<< SEARCH
    tapeStrip(
      [leg.tip.at.x, 0.105, 0.323],
      [0.20, 0.035, 0.012],
      leg.tip,
    );
=======
    tapeStrip(
      [leg.joints[leg.joints.length - 1].at.x, 0.105, 0.323],
      [0.20, 0.035, 0.012],
      leg.joints[leg.joints.length - 1],
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
        [leg.tip.at.x, 0.08 + i * 0.035, 0.328],
        TAPE,
        leg.tip,
=======
        [leg.joints[leg.joints.length - 1].at.x, 0.08 + i * 0.035, 0.328],
        TAPE,
        leg.joints[leg.joints.length - 1],
>>>>>>> REPLACE