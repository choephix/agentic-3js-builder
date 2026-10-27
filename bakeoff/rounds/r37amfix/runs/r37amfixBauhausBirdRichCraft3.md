Cause: `Chain.tip` is typed as `Joint | null`, while joint `parent` and `bone` options accept `JointRef | undefined`.

<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.tip ?? undefined,
>>>>>>> REPLACE

<<<<<<< SEARCH
          parent: leg.tip,
=======
          parent: leg.tip ?? undefined,
>>>>>>> REPLACE