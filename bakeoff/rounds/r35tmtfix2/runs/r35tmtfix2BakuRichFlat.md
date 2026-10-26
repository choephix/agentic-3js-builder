Cause: `neck.tip` is typed as `Joint | null`, while `b.joint` requires a non-null `JointRef`; this chain always has a tip, so assert it with `!`.

<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.tip!,
>>>>>>> REPLACE