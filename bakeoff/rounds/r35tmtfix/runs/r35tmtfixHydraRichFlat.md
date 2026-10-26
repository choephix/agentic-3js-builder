Cause: `Chain.tip` is nullable in the SDK type and can be `null` when a chain has no explicit tip joint, so it cannot be used directly as a joint parent or bone.

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: chain.tip,
=======
      parent: chain.joints[chain.joints.length - 1],
>>>>>>> REPLACE