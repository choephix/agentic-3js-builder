Cause: `spine` was created with `count: 4`, which creates four span joints but no tip joint, so `spine.tip` is `null`.

<<<<<<< SEARCH
    spine.tip!.at,
=======
    spine.joints[spine.joints.length - 1].at,
>>>>>>> REPLACE