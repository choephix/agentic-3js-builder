Cause: nullable chain tips/joint references were passed where the SDK requires definite references, and leg linkage rods used `chain.at(2/3)` outside the normalized `[0,1]` range, collapsing their endpoints.

<<<<<<< SEARCH
      const parent = spine.jointAt((z + 0.92) / 1.8);
=======
      const parent = spine.jointAt((z + 0.92) / 1.8)!;
>>>>>>> REPLACE

<<<<<<< SEARCH
  const rotor = b.joint("rotor", {
    parent: mast.tip,
    at: mast.tip.at,
=======
  const mastTip = mast.tip!;
  const rotor = b.joint("rotor", {
    parent: mastTip,
    at: mastTip.at,
>>>>>>> REPLACE

<<<<<<< SEARCH
      chain.at(0),
      chain.at(2),
=======
      chain.joints[0],
      chain.joints[2],
>>>>>>> REPLACE

<<<<<<< SEARCH
      chain.at(1),
      chain.at(3),
=======
      chain.joints[1],
      chain.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      chain.at(0),
      chain.at(3),
=======
      chain.joints[0],
      chain.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: ankleJoint,
=======
        bone: ankleJoint!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: j,
=======
        bone: j!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: footJoint,
=======
      bone: footJoint!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: kneeJoint,
=======
      bone: kneeJoint!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: mast.tip,
=======
      bone: mastTip,
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: mast.tip.at,
=======
      at: mastTip.at,
>>>>>>> REPLACE

<<<<<<< SEARCH
    at: mast.tip.at,
=======
    at: mastTip.at,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: rotor,
=======
        bone: rotor!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: spine.tip,
=======
        bone: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: sensorL.tip,
=======
        bone: sensorL.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: sensorR.tip,
=======
        bone: sensorR.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: spine.tip,
=======
    bone: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: spine.tip,
=======
      bone: spine.tip!,
>>>>>>> REPLACE