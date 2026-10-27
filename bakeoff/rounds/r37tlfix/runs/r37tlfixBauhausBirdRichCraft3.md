Cause: `spine.tip` is typed as `Joint | null`, while `b.joint({ parent })` requires a non-null `JointRef`.

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE