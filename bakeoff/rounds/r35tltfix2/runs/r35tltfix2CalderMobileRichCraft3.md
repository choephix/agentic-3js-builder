Cause: `Chain.tip` is nullable in the SDK, so nullable tips were passed as `bone` references; use the chain’s final joint instead.

<<<<<<< SEARCH
disk(armA.at(0.78).at, 0.105, RED, armA.tip, "redDisc");
=======
disk(armA.at(0.78).at, 0.105, RED, armA.joints[armA.joints.length - 1], "redDisc");
>>>>>>> REPLACE

<<<<<<< SEARCH
disk([0.86, 1.78, -0.01], 0.145, BLUE, dropA.chain!.tip, "blueDisc");
=======
disk([0.86, 1.78, -0.01], 0.145, BLUE, dropA.chain!.joints[dropA.chain!.joints.length - 1], "blueDisc");
>>>>>>> REPLACE

<<<<<<< SEARCH
triangle([0.39, 1.79, 0.01], 0.16, PINK, dropB.chain!.tip, "pinkTriangle");
=======
triangle([0.39, 1.79, 0.01], 0.16, PINK, dropB.chain!.joints[dropB.chain!.joints.length - 1], "pinkTriangle");
>>>>>>> REPLACE

<<<<<<< SEARCH
diamond(armB.at(0.78).at, 0.23, 0.31, ORANGE, armB.tip, "orangeDiamond");
=======
diamond(
    armB.at(0.78).at,
    0.23,
    0.31,
    ORANGE,
    armB.joints[armB.joints.length - 1],
    "orangeDiamond",
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
disk([-0.76, 1.53, 0.02], 0.095, WHITE, dropC.chain!.tip, "whiteDisc");
=======
disk(
    [-0.76, 1.53, 0.02],
    0.095,
    WHITE,
    dropC.chain!.joints[dropC.chain!.joints.length - 1],
    "whiteDisc",
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
triangle(lowerArm.at(0.78).at, 0.2, RED, lowerArm.tip, "lowerRedTriangle");
=======
triangle(
    lowerArm.at(0.78).at,
    0.2,
    RED,
    lowerArm.joints[lowerArm.joints.length - 1],
    "lowerRedTriangle",
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
disk([0.08, 1.18, 0], 0.12, YELLOW, dropD.chain!.tip, "lowerYellowDisc");
=======
disk(
    [0.08, 1.18, 0],
    0.12,
    YELLOW,
    dropD.chain!.joints[dropD.chain!.joints.length - 1],
    "lowerYellowDisc",
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
diamond([-0.36, 1.68, -0.015], 0.16, 0.25, BLUE, dropE.chain!.tip, "smallBlueDiamond");
=======
diamond(
    [-0.36, 1.68, -0.015],
    0.16,
    0.25,
    BLUE,
    dropE.chain!.joints[dropE.chain!.joints.length - 1],
    "smallBlueDiamond",
  );
>>>>>>> REPLACE