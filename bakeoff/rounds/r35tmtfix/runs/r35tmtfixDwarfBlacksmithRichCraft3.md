Cause: `Chain.tip` is typed as nullable and is `null` when the chain has no explicit tip joint; use the known joints directly as parents.

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.joints[3],
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.joints[1],
>>>>>>> REPLACE