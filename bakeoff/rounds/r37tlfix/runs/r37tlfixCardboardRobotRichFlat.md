Cause: `spine.tip` is `null` because the spine has no extra tip joint, while nullable `chain.tip` values were passed where the SDK requires a definite joint.

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.joints[spine.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: chain.tip,
=======
      bone: chain.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: chain.tip,
=======
      bone: chain.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: chain.tip,
=======
      bone: chain.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: chain.tip,
=======
      bone: chain.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: chain.tip,
=======
      bone: chain.tip!,
>>>>>>> REPLACE