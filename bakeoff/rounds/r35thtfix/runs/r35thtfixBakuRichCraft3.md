Cause: chains may have no `.tip` joint when their `names` list defines only span joints, and `Vector3` coordinates must use `.x/.y/.z` rather than numeric indexing.

<<<<<<< SEARCH
    spine.tip.at,
=======
    spine.joints[spine.joints.length - 1].at,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
    neck.tip.at,
=======
    neck.joints[neck.joints.length - 1].at,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.joints[neck.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
        foot[0] + spread * 0.35,
        foot[1] + 0.01,
        foot[2] + 0.03,
=======
        foot.x + spread * 0.35,
        foot.y + 0.01,
        foot.z + 0.03,
>>>>>>> REPLACE

<<<<<<< SEARCH
        foot[0] + spread,
        0.09,
        foot[2] + 0.14 + toe * 0.025,
=======
        foot.x + spread,
        0.09,
        foot.z + 0.14 + toe * 0.025,
>>>>>>> REPLACE

<<<<<<< SEARCH
        parent: chain.tip,
=======
        parent: chain.joints[chain.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
  const tailTip = tail.tip.at;
=======
  const tailTip = tail.joints[tail.joints.length - 1].at;
>>>>>>> REPLACE

<<<<<<< SEARCH
    frame(tailTip, tail.tip.dir([0, 0, -1])),
=======
    frame(tailTip, tail.joints[tail.joints.length - 1].dir([0, 0, -1])),
>>>>>>> REPLACE