Cause: `leg.chain.tip` is `null` because the IK chains do not create tip joints with the supplied naming/count configuration, so it was passed as an invalid explicit bone.

<<<<<<< SEARCH
      bone: leg.chain.tip!,
      at: [x, 0.075, z],
=======
      bone: leg.chain,
      at: [x, 0.075, z],
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: leg.chain.tip!,
        at: [x + leg.s * i * 0.045, 0.095, z + 0.105],
=======
        bone: leg.chain,
        at: [x + leg.s * i * 0.045, 0.095, z + 0.105],
>>>>>>> REPLACE