Cause: `Chain.tip` is typed as nullable, so pass its non-null value with `!` after creating chains that explicitly include tip joints.

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

<<<<<<< SEARCH
    const ankle = s > 0 ? legL.tip : legR.tip;
=======
    const ankle = (s > 0 ? legL.tip : legR.tip)!;
>>>>>>> REPLACE