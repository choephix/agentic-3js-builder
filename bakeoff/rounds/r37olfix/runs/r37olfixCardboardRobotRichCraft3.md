Cause: `spine.tip` and the chain `.tip` properties are nullable in the SDK types, so they need non-null assertions where the model has already created those joints.

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: s > 0 ? leftLeg.tip : rightLeg.tip,
=======
      bone: s > 0 ? leftLeg.tip! : rightLeg.tip!,
>>>>>>> REPLACE