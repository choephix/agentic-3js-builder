Cause: `Chain.tip` is typed as nullable, so accesses to `.at` require a non-null assertion even when the named chain includes a tip joint.

<<<<<<< SEARCH
    spine.tip.at,
=======
    spine.tip!.at,
>>>>>>> REPLACE

<<<<<<< SEARCH
    at: neck.tip.at,
=======
    at: neck.tip!.at,
>>>>>>> REPLACE