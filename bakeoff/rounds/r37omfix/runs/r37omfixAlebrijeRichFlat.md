Cause: `chain.tip` is nullable in the SDK type, so nullable tips cannot be passed directly as `parent`; assert that these chains include their named tip joints.

<<<<<<< SEARCH
      parent: spine.tip,
=======
      parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.tip!,
>>>>>>> REPLACE