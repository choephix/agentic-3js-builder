Cause: `Chain.tip` is nullable, so use the chain’s final joint explicitly where the SDK requires a non-null `JointRef`.

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: leg.chain.tip,
=======
        bone: leg.chain.joints[leg.chain.joints.length - 1],
>>>>>>> REPLACE