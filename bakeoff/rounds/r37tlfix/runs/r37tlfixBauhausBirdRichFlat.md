Cause: `.tip` is typed as nullable and is `null` when a chain has no explicit tip joint; use the chain’s final joint from `.joints` as the parent.

<<<<<<< SEARCH
    parent: spine.tip,
    at: [0, 1.05, 0.29],
=======
    parent: spine.joints[spine.joints.length - 1],
    at: [0, 1.05, 0.29],
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
    at: [0, 1.29, 0.49],
=======
    parent: neck.joints[neck.joints.length - 1],
    at: [0, 1.29, 0.49],
>>>>>>> REPLACE