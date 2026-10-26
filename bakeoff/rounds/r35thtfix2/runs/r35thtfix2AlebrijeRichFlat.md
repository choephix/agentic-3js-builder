Cause: `spine.tip` and `leg.tip` are nullable SDK chain tips, so non-null assertions are required when passing them as `parent` joint references.

<<<<<<< SEARCH
      parent: front ? spine.tip : hips,
=======
      parent: front ? spine.tip! : hips,
>>>>>>> REPLACE

<<<<<<< SEARCH
        parent: leg.tip,
=======
        parent: leg.tip!,
>>>>>>> REPLACE